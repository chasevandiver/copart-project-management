// The sales workflow web: the Oct 16 whiteboard as nodes and edges, with each node tied to tracker projects.
// Pure: no React, no DOM. renderWorkflowSvg returns markup so the board page and the shared page draw the same picture.
import type { Project, Task, Tracker } from "./tracker";

export type Line = { t: string; dim?: boolean; code?: string; cont?: boolean };
export type NodeDef = {
  id: string;
  k: string; // presenter step this node belongs to
  x: number;
  y: number;
  w: number;
  h: number;
  step?: string;
  title?: string;
  name?: string; // drawer title when the box has no title of its own
  lines: Line[];
  projects: string[];
  hot?: boolean;
  amber?: boolean;
  about?: string; // for nodes with no project behind them
};
type EdgeDef = { k: string; d: string; flow?: boolean; label?: { x: number; y: number; anchor?: "start" | "middle" | "end"; lines: string[] } };
type GroupDef = { k: string; x: number; y: number; w: number; h: number; label: string; amber?: boolean; note?: string };

export const VIEW = { w: 1200, h: 1080 };

export const NODES: NodeDef[] = [
  {
    id: "get-found", k: "approach", x: 70, y: 84, w: 320, h: 166, step: "01  GET FOUND", title: "Dealers find us",
    lines: [{ t: "AEO and SEO" }, { t: "Webpage changes" }, { t: "A dealer searches or asks an AI", dim: true }],
    projects: ["audit", "mkt"],
  },
  {
    id: "go-get", k: "approach", x: 440, y: 84, w: 320, h: 166, step: "02  GO GET 'EM", title: "We reach out",
    lines: [{ t: "Campaigns: new or inactive, direct or indirect" }, { t: "Email, call, text, paid ads, SEO and AEO" }, { t: "Marketing tools and apps behind them", dim: true }],
    projects: ["cmp", "ww", "cceib"],
  },
  {
    id: "convert", k: "approach", x: 810, y: 84, w: 320, h: 166, step: "03  CONVERT 'EM", title: "Interest becomes a lead",
    lines: [{ t: "Web forms" }, { t: "Outreach campaigns to prospective and inactive dealers" }, { t: "Every lead gets a dealer ID", dim: true }],
    projects: ["pdo", "wb"],
  },
  {
    id: "agents", k: "agents", x: 40, y: 360, w: 290, h: 240, step: "AGENTS", title: "Keep it full",
    lines: [
      { code: "A1", t: "Dealer profile, pulled from the dealer site" },
      { code: "A2", t: "AEO and dealer listening" },
      { code: "A3", t: "Pre-call and follow-up drafter" },
      { code: "A4", t: "Dormant dealer activation" },
      { t: "All four loop with each other", dim: true },
      { t: "and feed one agent pipeline", dim: true, cont: true },
    ],
    projects: ["agents"],
  },
  {
    id: "lead-tracker", k: "center", x: 410, y: 350, w: 300, h: 260, step: "LEAD TRACKER WITH CRM", title: "One record per dealer", hot: true,
    lines: [
      { code: "•", t: "Profiles by state and Copart status" },
      { code: "•", t: "Every lead carries a dealer ID" },
      { code: "•", t: "Assigns leads to teams" },
      { code: "•", t: "Logs every touch, from any tool" },
      { code: "•", t: "Audience for every campaign" },
      { t: "The CRM for Route Tracker leads too", dim: true },
    ],
    projects: ["udm", "cdd"],
  },
  {
    id: "route-tracker", k: "route", x: 850, y: 360, w: 310, h: 240, step: "ROUTE TRACKER", title: "The field screen",
    lines: [
      { code: "1", t: "Pre-visit: route building, dealer profile," },
      { t: "outreach, exclusive offer email, team roster", cont: true },
      { code: "2", t: "Visit: contact, profile fields, assignments" },
      { code: "3", t: "Follow-up: handoff, hot, mild or cold," },
      { t: "send to team", cont: true },
      { t: "Call script runs on the dealer profile", dim: true },
    ],
    projects: ["rt"],
  },
  {
    id: "office", k: "teams", x: 330, y: 700, w: 230, h: 104, title: "Office sales",
    lines: [{ t: "Phone, email, follow-up" }, { t: "Books visits for the field", dim: true }],
    projects: [],
    about: "Office (inside) sales works all leads by phone and email: inbound leads, the long tail across every state, qualifying, booking visits for the field and onboarding. Leads come from the Lead Tracker, and every call is logged back on the dealer record.",
  },
  {
    id: "field", k: "teams", x: 600, y: 700, w: 230, h: 104, title: "Field reps",
    lines: [{ t: "In-person visits" }, { t: "Worked on the Route Tracker", dim: true }],
    projects: [],
    about: "Field reps get leads by ZIP code and city for in-person visits: dense territories, key accounts and the visits the office booked. They run the day from the Route Tracker, and every visit goes back to the Lead Tracker by lead ID.",
  },
  {
    id: "cdsai", k: "separate", x: 70, y: 916, w: 340, h: 124, step: "TEAMS AGENT", title: "Copart Dealer Services AI", amber: true,
    lines: [{ t: "Pre-call brief, updates, follow-up" }, { t: "Ideas: track the full process, manager view", dim: true }],
    projects: ["cdsai"],
  },
  {
    id: "mm", k: "separate", x: 440, y: 916, w: 340, h: 124, step: "MEETING MANAGEMENT", name: "Meeting management", amber: true,
    lines: [
      { t: "Memory bank: call transcripts, SharePoint meetings site" },
      { t: "Chief of staff agent: Teams messages, automated" },
      { t: "updates, connected to the weekly session", cont: true },
      { t: "PLAUD sends email to an Outlook PLAUD folder" },
    ],
    projects: ["mm", "pa"],
  },
  {
    id: "built", k: "separate", x: 810, y: 916, w: 320, h: 124, step: "BUILT SO FAR", name: "Built so far", amber: true,
    lines: [{ t: "Meeting transcript reader" }, { t: "Auto draft email" }, { t: "Auto schedule meeting" }, { t: "PLAUD autoflow to email" }],
    projects: ["mm"],
  },
];

const EDGES: EdgeDef[] = [
  { k: "approach", d: "M390,167 L438,167" },
  { k: "approach", d: "M760,167 L808,167" },
  { k: "campaign-link", d: "M540,350 L540,284", flow: true, label: { x: 528, y: 321, anchor: "end", lines: ["audience"] } },
  { k: "campaign-link", d: "M620,284 L620,350", flow: true, label: { x: 632, y: 310, lines: ["recommended touch dates,", "tracked responses to the profile"] } },
  { k: "agents", d: "M330,480 L408,480", flow: true, label: { x: 369, y: 470, anchor: "middle", lines: ["fill, draft"] } },
  { k: "route", d: "M710,430 L848,430", flow: true, label: { x: 780, y: 420, anchor: "middle", lines: ["leads build routes"] } },
  { k: "route", d: "M850,520 L712,520", flow: true, label: { x: 780, y: 540, anchor: "middle", lines: ["results back by lead ID"] } },
  { k: "teams", d: "M500,612 L445,698", flow: true, label: { x: 458, y: 650, anchor: "end", lines: ["all leads"] } },
  { k: "teams", d: "M620,612 L705,698", flow: true, label: { x: 668, y: 650, lines: ["by ZIP and city"] } },
  { k: "route", d: "M830,752 L1005,752 L1005,604", flow: true, label: { x: 918, y: 744, anchor: "middle", lines: ["runs visits on"] } },
];

const GROUPS: GroupDef[] = [
  { k: "approach", x: 40, y: 30, w: 1120, h: 250, label: "PROSPECTIVE AND INACTIVE APPROACH" },
  { k: "separate", x: 40, y: 870, w: 1120, h: 190, label: "SEPARATE: COPILOT AND POWER AUTOMATE TOOLS", amber: true, note: "Not part of the dealer approach. One automated workflow connects everything." },
];

export type Step = { key: string; keys: string[]; title: string; say: string };
export const STEPS: Step[] = [
  { key: "approach", keys: ["approach", "campaign-link"], title: "Three moves", say: "We work prospective and inactive dealers in three moves: get found, go get them, convert them." },
  { key: "center", keys: ["center", "campaign-link"], title: "One record", say: "Everything lands on one dealer record in the Lead Tracker: state, Copart status, dealer ID, owner, every touch. Campaigns take their audience from it and write their touches back." },
  { key: "teams", keys: ["teams", "center"], title: "Leads by team", say: "The Lead Tracker hands leads to teams. Field reps get them by ZIP and city. The office works the rest by phone and email and books visits for the field." },
  { key: "route", keys: ["route", "center"], title: "The field screen", say: "The Route Tracker runs a visit in three steps, pre-visit, visit and follow-up, and writes the result back to the dealer record." },
  { key: "agents", keys: ["agents", "center"], title: "Agents", say: "Four agents keep the record full and draft the briefs and follow-ups. They loop with each other, and a person approves every draft." },
  { key: "separate", keys: ["separate"], title: "Kept separate", say: "Separately, Copilot tools handle meetings and quick questions in Teams, so the team spends its time with dealers." },
];

/* ---------- data from the tracker ---------- */

export type TaskRef = Pick<Task, "id" | "title" | "owner" | "due" | "status" | "priority">;
export type ProjectRef = Pick<Project, "id" | "name" | "status" | "summary" | "built" | "next_steps" | "blockers"> & { open: TaskRef[] };
export type WorkflowData = { projects: Record<string, ProjectRef>; status: Record<string, string | null> };

const STATUS_RANK = ["Blocked", "In Progress", "Waiting", "Next", "Backlog", "Done"];

export function buildWorkflow(t: Tracker): WorkflowData {
  const projects: Record<string, ProjectRef> = {};
  for (const p of t.projects) {
    projects[p.id] = {
      id: p.id, name: p.name, status: p.status, summary: p.summary, built: p.built, next_steps: p.next_steps, blockers: p.blockers,
      open: t.tasks
        .filter((x) => x.project_id === p.id && !x.idea && x.status !== "Done")
        .map((x) => ({ id: x.id, title: x.title, owner: x.owner, due: x.due, status: x.status, priority: x.priority })),
    };
  }
  const status: Record<string, string | null> = {};
  for (const n of NODES) {
    const sts = n.projects.map((id) => projects[id]?.status).filter(Boolean) as string[];
    status[n.id] = sts.length ? sts.sort((a, b) => STATUS_RANK.indexOf(a) - STATUS_RANK.indexOf(b))[0] : null;
  }
  return { projects, status };
}

/* ---------- markup ---------- */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

export type RenderOpts = { active?: string[] | null; selected?: string | null };

/** The whole web as an <svg> string. `active` dims everything outside those step keys; `selected` outlines one node. */
export function renderWorkflowSvg(data: WorkflowData, opts: RenderOpts = {}): string {
  const dim = (k: string) => (opts.active && !opts.active.includes(k) ? " wf-dim" : "");
  const out: string[] = [];
  out.push(`<svg class="wf-svg" viewBox="0 0 ${VIEW.w} ${VIEW.h}" role="img" aria-label="Flow of the dealer sales workflow: three approach steps exchange audience and responses with the Lead Tracker, which is filled by four agents, trades leads and results with the Route Tracker, and assigns leads to office and field teams. Copilot tools sit apart.">`);
  out.push(`<defs><marker id="wf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#4cd7ff"></path></marker></defs>`);

  for (const g of GROUPS) {
    out.push(`<g class="wf-k${dim(g.k)}" data-k="${g.k}">`);
    out.push(`<rect class="${g.amber ? "wf-group-amber" : "wf-group"}" x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="18"></rect>`);
    out.push(`<text class="wf-t-group${g.amber ? " amber" : ""}" x="${g.x + 24}" y="${g.y + 30}">${esc(g.label)}</text>`);
    if (g.note) out.push(`<text class="wf-t-dim" x="${g.x + g.w - 24}" y="${g.y + 30}" text-anchor="end">${esc(g.note)}</text>`);
    out.push(`</g>`);
  }
  // Leads by team label
  out.push(`<g class="wf-k${dim("teams")}" data-k="teams"><text class="wf-t-group" x="560" y="662" text-anchor="middle">LEADS BY TEAM</text><text class="wf-t-dim" x="560" y="680" text-anchor="middle">the dealer map broken into segments</text></g>`);

  for (const e of EDGES) {
    out.push(`<g class="wf-k${dim(e.k)}" data-k="${e.k}">`);
    if (e.flow) out.push(`<path class="wf-edge-base" d="${e.d}"></path><path class="wf-flow" d="${e.d}" marker-end="url(#wf-arrow)"></path>`);
    else out.push(`<path class="wf-edge" d="${e.d}" marker-end="url(#wf-arrow)"></path>`);
    if (e.label) {
      const a = e.label.anchor ? ` text-anchor="${e.label.anchor}"` : "";
      e.label.lines.forEach((l, i) => out.push(`<text class="wf-t-edge" x="${e.label!.x}" y="${e.label!.y + i * 16}"${a}>${esc(l)}</text>`));
    }
    out.push(`</g>`);
  }

  for (const n of NODES) {
    const sel = opts.selected === n.id ? " wf-sel" : "";
    const st = data.status[n.id];
    const label = `${n.title ?? n.step ?? n.id}. ${n.lines.map((l) => l.t).join(". ")}`;
    out.push(`<g class="wf-node wf-k${dim(n.k)}${sel}" data-k="${n.k}" data-node="${n.id}" tabindex="0" role="button" aria-label="${esc(label)}. Open details.">`);
    out.push(`<rect class="${n.hot ? "wf-node-hot" : "wf-node-box"}" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${n.hot ? 16 : 14}"></rect>`);
    if (st) {
      const tw = st.length * 6.4 + 16;
      const px = n.x + n.w - tw - 14;
      const labelEnd = n.x + 22 + (n.step ? n.step.length * 8.2 : (n.title ?? "").length * 11);
      const py = labelEnd + 8 > px ? n.y + n.h - 32 : n.y + 14; // drop to the bottom corner if the label runs into it
      out.push(`<rect class="wf-st wf-st-${slug(st)}" x="${px}" y="${py}" width="${tw}" height="18" rx="9"></rect>`);
      out.push(`<text class="wf-t-st wf-st-${slug(st)}" x="${px + tw / 2}" y="${py + 12.5}" text-anchor="middle">${esc(st)}</text>`);
    }
    const tight = n.h < 140; // the short nodes at the bottom
    let y = n.y + (tight ? 26 : 28);
    const lx = n.x + 22;
    if (n.step) {
      out.push(`<text class="wf-t-step${n.amber ? " amber" : ""}" x="${lx}" y="${y}">${esc(n.step)}</text>`);
      y += tight ? 28 : 30;
    } else y += 6;
    if (n.title) {
      out.push(`<text class="wf-t-title" x="${lx}" y="${y}">${esc(n.title)}</text>`);
      y += tight ? 26 : 30;
    } else y -= 2;
    let prevDim = false;
    for (const l of n.lines) {
      if (l.dim && !prevDim) y += tight ? 0 : 10;
      prevDim = !!l.dim;
      if (l.code) {
        const wide = l.code.length > 1;
        if (l.code === "•") out.push(`<circle class="wf-pip" cx="${lx + 6}" cy="${y - 4}" r="2.5"></circle>`);
        else out.push(`<text class="wf-t-code" x="${lx}" y="${y}">${esc(l.code)}</text>`);
        out.push(`<text class="${l.dim ? "wf-t-dim" : "wf-t-line"}" x="${lx + (l.code === "•" ? 18 : wide ? 30 : 20)}" y="${y}">${esc(l.t)}</text>`);
      } else {
        out.push(`<text class="${l.dim ? "wf-t-dim" : "wf-t-line"}" x="${lx}" y="${y}">${esc(l.t)}</text>`);
      }
      y += tight ? 21 : l.dim ? 20 : 22;
    }
    out.push(`</g>`);
  }
  out.push(`</svg>`);
  return out.join("");
}

/** What the drawer calls a node: the small label above and the title. */
export function nodeHeading(n: NodeDef): { kind: string; title: string } {
  return { kind: n.title ? n.step ?? "Workflow" : n.amber ? "Copilot and Power Automate" : "Workflow", title: n.title ?? n.name ?? n.step ?? n.id };
}

export function nodeById(id: string): NodeDef | undefined {
  return NODES.find((n) => n.id === id);
}
