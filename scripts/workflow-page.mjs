// Builds the shareable, standalone workflow page from lib/workflow.ts and tracker.json.
// Usage: node scripts/workflow-page.mjs out.html
// The board's /workflow page draws the same web live; this one is a snapshot for sharing outside the board.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { NODES, STEPS, buildWorkflow, renderWorkflowSvg } from "../lib/workflow.ts";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = process.argv[2];
if (!out) {
  console.error("usage: node scripts/workflow-page.mjs out.html");
  process.exit(1);
}
const tracker = JSON.parse(readFileSync(join(root, "tracker", "tracker.json"), "utf8"));
const data = buildWorkflow(tracker);
const svg = renderWorkflowSvg(data);
const today = tracker.meta.last_updated;

// Only what the page needs, and nothing the guardrails keep out of the open: names, statuses, summaries, next steps, open to-do titles.
const detail = Object.fromEntries(
  NODES.map((n) => [
    n.id,
    {
      step: n.step ?? null,
      title: n.title ?? n.step ?? n.id,
      lines: joinLines(n.lines),
      about: n.about ?? null,
      projects: n.projects.map((id) => data.projects[id]).filter(Boolean).map((p) => ({
        name: p.name, status: p.status, summary: p.summary, next: p.next_steps, blockers: p.blockers, built: p.built,
        open: p.open.map((x) => ({ title: x.title, owner: x.owner, due: x.due })),
      })),
    },
  ])
);
function joinLines(lines) {
  const o = [];
  for (const l of lines) {
    if (l.cont && o.length) o[o.length - 1] = { ...o[o.length - 1], t: `${o[o.length - 1].t} ${l.t}` };
    else o.push({ t: l.t, dim: !!l.dim, code: l.code && l.code !== "•" ? l.code : null });
  }
  return o;
}
const json = (v) => JSON.stringify(v).replace(/</g, "\\u003c");

const html = `<title>Dealer Sales Workflow</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=IBM+Plex+Sans:wght@400;500&display=swap">
<style>
  /* Layout: flat dark navy with air. One SVG web of nodes with labeled flowing edges; a detail drawer on click; a presenter mode that lights one step at a time. Single committed dark theme. */
  :root {
    color-scheme: dark;
    --bg: #0a0f1a; --frame: #0e1524; --panel: #141c2e; --panel-hot: #152238; --fg: #eaf0f8; --muted: #8b9bb4; --line: #243147;
    --cyan: #4cd7ff; --cyan-dim: #2a7f9c; --amber: #f5b342;
    --display: "Manrope", "Segoe UI", Helvetica, Arial, sans-serif; --body: "IBM Plex Sans", "Segoe UI", Helvetica, Arial, sans-serif;
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    background: var(--bg); color: var(--fg); font-family: var(--body); font-size: 16px; line-height: 1.5;
    background-image: radial-gradient(1000px 520px at 50% -12%, rgba(76,215,255,.10), transparent 60%);
    padding-block: 40px 72px;
    padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px));
  }
  body.presenting { padding: 0; overflow: hidden; }
  .page { max-width: 1180px; margin: 0 auto; display: grid; gap: 28px; }
  h1, h2, h3 { font-family: var(--display); margin: 0; line-height: 1.05; text-wrap: balance; }
  h1 { font-size: 46px; font-weight: 800; letter-spacing: -.02em; }
  h2 { font-size: 13px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
  p { margin: 0; }
  header { display: grid; gap: 12px; }
  .eyebrow { font-family: var(--display); font-size: 13px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--cyan); }
  .lede { max-width: 62ch; color: var(--muted); font-size: 17px; }
  .lede strong { color: var(--fg); font-weight: 500; }
  body.presenting header, body.presenting .talk, body.presenting .foot { display: none; }

  .wf-frame { background: var(--frame); border: 1px solid var(--line); border-radius: 18px; padding: 14px 18px 18px; display: flex; flex-direction: column; gap: 10px; }
  body.presenting .wf-frame { position: fixed; inset: 0; border-radius: 0; border: 0; padding: 18px max(28px, env(safe-area-inset-right, 0px)) 24px max(28px, env(safe-area-inset-left, 0px)); justify-content: center; background: var(--bg); }
  .wf-bar { display: flex; align-items: center; gap: 10px; min-height: 34px; }
  .wf-bar-grow { flex: 1; }
  .wf-hint { font-size: 13px; color: var(--muted); }
  .wf-step-count { font-size: 13px; color: var(--muted); font-variant-numeric: tabular-nums; min-width: 40px; text-align: center; }
  .wf-btn { background: transparent; color: var(--fg); border: 1px solid var(--line); border-radius: 8px; padding: 7px 14px; font: 600 13px/1.2 var(--body); cursor: pointer; }
  .wf-btn:hover:not(:disabled) { border-color: var(--cyan-dim); }
  .wf-btn:focus-visible { outline: 2px solid var(--cyan); outline-offset: 2px; }
  .wf-btn:disabled { opacity: .35; cursor: default; }
  .wf-btn-primary { background: var(--cyan); color: #06111c; border-color: var(--cyan); }
  .wf-scroll { overflow-x: auto; }
  .wf-svg { width: 100%; height: auto; display: block; min-width: 780px; font-family: var(--body); }
  body.presenting .wf-scroll { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  body.presenting .wf-svg { max-height: calc(100vh - 150px); width: auto; max-width: 100%; }
  .wf-k { transition: opacity .35s ease; }
  .wf-dim { opacity: .16; }
  .wf-node { cursor: pointer; outline: none; }
  .wf-node-box { fill: var(--panel); stroke: var(--line); stroke-width: 1; transition: stroke .15s; }
  .wf-node-hot { fill: var(--panel-hot); stroke: var(--cyan); stroke-width: 1.4; filter: drop-shadow(0 0 18px rgba(76,215,255,.28)); }
  .wf-node:hover .wf-node-box, .wf-node:focus-visible .wf-node-box { stroke: var(--cyan-dim); }
  .wf-node.wf-sel .wf-node-box, .wf-node.wf-sel .wf-node-hot, .wf-node:focus-visible .wf-node-hot { stroke: var(--cyan); stroke-width: 2; }
  .wf-group { fill: none; stroke: var(--cyan-dim); stroke-width: 1; stroke-dasharray: 4 8; stroke-linecap: round; }
  .wf-group-amber { fill: none; stroke: var(--amber); stroke-width: 1; stroke-dasharray: 4 8; stroke-linecap: round; opacity: .8; }
  .wf-t-title { font-family: var(--display); font-size: 21px; font-weight: 700; fill: var(--fg); letter-spacing: -.01em; }
  .wf-t-step { font-family: var(--display); font-size: 11.5px; font-weight: 700; letter-spacing: .14em; fill: var(--cyan); }
  .wf-t-step.amber, .wf-t-group.amber { fill: var(--amber); }
  .wf-t-group { font-family: var(--display); font-size: 12px; font-weight: 700; letter-spacing: .16em; fill: var(--cyan); }
  .wf-t-line { font-size: 13px; fill: var(--fg); }
  .wf-t-dim { font-size: 12.5px; fill: var(--muted); }
  .wf-t-code { font-family: var(--display); font-size: 12.5px; font-weight: 800; fill: var(--cyan); }
  .wf-t-edge { font-size: 12px; fill: var(--cyan); }
  .wf-edge-base { fill: none; stroke: var(--cyan-dim); stroke-width: 1.4; opacity: .5; }
  .wf-flow { fill: none; stroke: var(--cyan); stroke-width: 1.4; stroke-dasharray: 4 10; stroke-linecap: round; animation: wf-dash 1.2s linear infinite; }
  .wf-edge { fill: none; stroke: var(--cyan-dim); stroke-width: 1.4; }
  .wf-pip { fill: var(--cyan); }
  @keyframes wf-dash { to { stroke-dashoffset: -28; } }
  @media (prefers-reduced-motion: reduce) { .wf-flow { animation: none; } .wf-k { transition: none; } }
  .wf-st { fill: color-mix(in srgb, var(--c) 18%, transparent); stroke: color-mix(in srgb, var(--c) 45%, transparent); stroke-width: 1; }
  .wf-t-st { font-family: var(--display); font-size: 10.5px; font-weight: 700; letter-spacing: .04em; fill: var(--c); }
  .wf-st-backlog { --c: #9aa7b8; } .wf-st-next { --c: #6ab0ff; } .wf-st-in-progress { --c: #4cd7ff; }
  .wf-st-waiting { --c: #f5b342; } .wf-st-blocked { --c: #ff7b7b; } .wf-st-done { --c: #6fd39a; }
  .wf-caption { display: flex; align-items: baseline; gap: 18px; padding: 8px 4px 0; }
  .wf-caption-title { flex: none; font-family: var(--display); font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--cyan); }
  .wf-caption p { font-size: 20px; max-width: 80ch; }
  .wf-legend { display: flex; gap: 22px; flex-wrap: wrap; font-size: 13px; color: var(--muted); }
  .wf-legend span { display: inline-flex; align-items: center; gap: 8px; }
  .wf-legend i { display: inline-block; width: 26px; border-top: 2px solid var(--cyan); }
  .wf-legend i.dash { border-top-style: dashed; border-color: var(--cyan-dim); }
  .wf-legend i.amber { border-top-style: dashed; border-color: var(--amber); }

  .drawer-back { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 40; }
  .drawer {
    position: fixed; z-index: 50; top: 0; right: 0; bottom: 0; width: min(460px, 100vw); overflow-y: auto;
    background: var(--frame); border-left: 1px solid var(--line); box-shadow: -12px 0 32px rgba(0,0,0,.35);
    padding: 22px 24px calc(28px + env(safe-area-inset-bottom, 0px)); padding-top: calc(22px + env(safe-area-inset-top, 0px)); padding-right: max(24px, env(safe-area-inset-right, 0px));
    display: flex; flex-direction: column; gap: 14px; font-size: 14.5px;
  }
  .drawer-close { position: absolute; top: calc(10px + env(safe-area-inset-top, 0px)); right: 12px; background: transparent; border: 0; color: var(--fg); font-size: 22px; line-height: 1; padding: 6px 10px; border-radius: 6px; cursor: pointer; }
  .drawer-close:hover { background: var(--panel); }
  .d-kind { font-family: var(--display); font-size: 11.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--cyan); }
  .d-title { font-size: 24px; }
  .drawer ul { margin: 0; padding-left: 18px; display: grid; gap: 4px; }
  .drawer li.muted, .drawer .muted { color: var(--muted); }
  .d-project { border-top: 1px solid var(--line); padding-top: 12px; display: grid; gap: 8px; }
  .d-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-weight: 600; font-family: var(--display); font-size: 17px; }
  .pill { flex: none; font-family: var(--display); font-size: 11px; font-weight: 700; letter-spacing: .04em; padding: 2px 9px; border-radius: 999px; color: var(--c); background: color-mix(in srgb, var(--c) 16%, transparent); border: 1px solid color-mix(in srgb, var(--c) 40%, transparent); }
  .d-project h3 { font-size: 11.5px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); margin-top: 4px; }
  .d-project .blocked { border: 1px solid color-mix(in srgb, #ff7b7b 35%, transparent); background: color-mix(in srgb, #ff7b7b 8%, transparent); border-radius: 10px; padding: 10px 14px; }
  .d-project .blocked strong { color: #ff7b7b; display: block; margin-bottom: 4px; }
  .d-project details > summary { cursor: pointer; color: var(--muted); font-size: 13.5px; }
  .d-project .summary { color: #c9d3e2; }

  .talk { background: var(--panel); border: 1px solid var(--line); border-radius: 18px; padding: 24px 28px; display: grid; gap: 12px; }
  .talk ol { margin: 0; padding-left: 20px; display: grid; gap: 8px; max-width: 72ch; }
  .foot { color: var(--muted); font-size: 13.5px; max-width: 72ch; }
  @media (max-width: 760px) {
    h1 { font-size: 36px; }
    .wf-frame { padding: 10px 12px 14px; border-radius: 12px; }
    .wf-caption { flex-direction: column; gap: 4px; }
    .wf-caption p { font-size: 16px; }
    .wf-legend { gap: 10px; }
  }
</style>

<div class="page">
  <header>
    <span class="eyebrow">Copart Dealer Services</span>
    <h1>Dealer Sales Workflow</h1>
    <p class="lede"><strong>One approach, one record, two tools around it.</strong> We get found, we go get dealers, we convert them. Every lead lands on one dealer record in the Lead Tracker. Field reps work it from the Route Tracker, the office works it by phone and email, and the agents keep it full.</p>
  </header>

  <div class="wf-frame" id="frame">
    <div class="wf-bar" id="bar-view">
      <span class="wf-hint">Click a box for what is behind it. Status on each box is from the tracker, ${today}.</span>
      <span class="wf-bar-grow"></span>
      <button type="button" class="wf-btn wf-btn-primary" id="present">Present</button>
    </div>
    <div class="wf-bar" id="bar-present" hidden>
      <button type="button" class="wf-btn" id="prev" aria-label="Previous step">&#8249;</button>
      <span class="wf-step-count" id="count">1 / ${STEPS.length}</span>
      <button type="button" class="wf-btn" id="next" aria-label="Next step">&#8250;</button>
      <span class="wf-bar-grow"></span>
      <span class="wf-hint">Arrow keys move. Esc ends.</span>
      <button type="button" class="wf-btn" id="end">End</button>
    </div>
    <div class="wf-scroll" id="web">${svg}</div>
    <div class="wf-caption" id="caption" hidden aria-live="polite"><span class="wf-caption-title" id="cap-title"></span><p id="cap-say"></p></div>
    <div class="wf-legend" id="legend">
      <span><i></i> arrows: data moving between tools</span>
      <span><i class="dash"></i> blue dashed box: the prospective and inactive approach</span>
      <span><i class="amber"></i> amber dashed box: tools kept separate from it</span>
    </div>
  </div>

  <section class="talk">
    <h2>Say it in a minute</h2>
    <ol>${STEPS.map((s) => `<li>${s.say}</li>`).join("")}</ol>
  </section>

  <p class="foot">From the Oct 16 whiteboard. Team rosters, the slump list and the top seller questions stay off this page.</p>
</div>

<div id="drawer-root"></div>

<script>
(function () {
  var STEPS = ${json(STEPS.map((s) => ({ keys: s.keys, title: s.title, say: s.say })))};
  var DETAIL = ${json(detail)};
  var web = document.getElementById("web");
  var body = document.body;
  var step = -1, selected = null;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function slug(s) { return s.toLowerCase().replace(/\\s+/g, "-"); }

  function paint() {
    var keys = step >= 0 ? STEPS[step].keys : null;
    web.querySelectorAll(".wf-k").forEach(function (g) {
      var k = g.getAttribute("data-k");
      g.classList.toggle("wf-dim", !!keys && keys.indexOf(k) < 0);
    });
    web.querySelectorAll(".wf-node").forEach(function (g) { g.classList.toggle("wf-sel", g.getAttribute("data-node") === selected); });
    var presenting = step >= 0;
    body.classList.toggle("presenting", presenting);
    document.getElementById("bar-view").hidden = presenting;
    document.getElementById("bar-present").hidden = !presenting;
    document.getElementById("legend").hidden = presenting;
    document.getElementById("caption").hidden = !presenting;
    if (presenting) {
      document.getElementById("count").textContent = (step + 1) + " / " + STEPS.length;
      document.getElementById("cap-title").textContent = STEPS[step].title;
      document.getElementById("cap-say").textContent = STEPS[step].say;
      document.getElementById("prev").disabled = step === 0;
      document.getElementById("next").disabled = step === STEPS.length - 1;
    }
  }

  function openDrawer(id) {
    var d = DETAIL[id]; if (!d) return;
    selected = id; paint();
    var h = [];
    h.push('<div class="drawer-back" id="drawer-back"></div><aside class="drawer" aria-label="Workflow details"><button type="button" class="drawer-close" id="drawer-close" aria-label="Close">&times;</button>');
    h.push('<span class="d-kind">' + esc(d.step || "Workflow") + '</span><h2 class="d-title">' + esc(d.title) + '</h2>');
    h.push('<ul>' + d.lines.map(function (l) { return '<li' + (l.dim ? ' class="muted"' : '') + '>' + (l.code ? esc(l.code) + '. ' : '') + esc(l.t) + '</li>'; }).join('') + '</ul>');
    if (d.about) h.push('<p class="muted">' + esc(d.about) + '</p>');
    d.projects.forEach(function (p) {
      h.push('<section class="d-project"><div class="d-head"><span>' + esc(p.name) + '</span><span class="pill wf-st-' + slug(p.status) + '">' + esc(p.status) + '</span></div>');
      h.push('<p class="summary">' + esc(p.summary) + '</p>');
      if (p.blockers.length) h.push('<div class="blocked"><strong>Blocked</strong><ul>' + p.blockers.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul></div>');
      if (p.next.length) h.push('<h3>Next steps</h3><ul>' + p.next.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>');
      if (p.open.length) h.push('<h3>Open to-dos (' + p.open.length + ')</h3><ul>' + p.open.slice(0, 8).map(function (x) { return '<li>' + esc(x.title) + ' <span class="muted">' + esc(x.owner) + (x.due ? ', due ' + esc(x.due) : '') + '</span></li>'; }).join('') + (p.open.length > 8 ? '<li class="muted">and ' + (p.open.length - 8) + ' more</li>' : '') + '</ul>');
      if (p.built.length) h.push('<details><summary>Built so far (' + p.built.length + ')</summary><ul>' + p.built.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul></details>');
      h.push('</section>');
    });
    h.push('</aside>');
    var root = document.getElementById("drawer-root");
    root.innerHTML = h.join("");
    document.getElementById("drawer-back").addEventListener("click", closeDrawer);
    document.getElementById("drawer-close").addEventListener("click", closeDrawer);
    document.getElementById("drawer-close").focus();
  }
  function closeDrawer() { selected = null; document.getElementById("drawer-root").innerHTML = ""; paint(); }

  function start() { closeDrawer(); step = 0; paint(); var f = document.getElementById("frame"); if (f.requestFullscreen) f.requestFullscreen().catch(function () {}); }
  function end() { step = -1; paint(); if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {}); }
  function next() { if (step >= 0 && step < STEPS.length - 1) { step++; paint(); } }
  function prev() { if (step > 0) { step--; paint(); } }

  web.addEventListener("click", function (e) { var g = e.target.closest("[data-node]"); if (g) openDrawer(g.getAttribute("data-node")); });
  web.addEventListener("keydown", function (e) { if (e.key !== "Enter" && e.key !== " ") return; var g = e.target.closest("[data-node]"); if (g) { e.preventDefault(); openDrawer(g.getAttribute("data-node")); } });
  document.getElementById("present").addEventListener("click", start);
  document.getElementById("end").addEventListener("click", end);
  document.getElementById("next").addEventListener("click", next);
  document.getElementById("prev").addEventListener("click", prev);
  document.addEventListener("fullscreenchange", function () { if (!document.fullscreenElement && step >= 0) end(); });
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { if (selected) closeDrawer(); else if (step >= 0) end(); return; }
    if (step < 0) return;
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); next(); }
    if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); prev(); }
  });
  paint();
})();
</script>
`;
writeFileSync(out, html);
console.log(`wrote ${out} (${(html.length / 1024).toFixed(0)} KB)`);
