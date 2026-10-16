"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NODES, STEPS, nodeById, renderWorkflowSvg, type NodeDef, type WorkflowData } from "@/lib/workflow";
import { statusSlug } from "@/lib/tracker";
import { shortDate } from "@/lib/dates";
import { Icon } from "./shell/Icon";

// The sales workflow web. Click a node for what sits behind it. Present walks the web one step at a time.
export default function Workflow({ data }: { data: WorkflowData }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [step, setStep] = useState<number>(-1); // -1 = not presenting
  const frame = useRef<HTMLDivElement>(null);
  const presenting = step >= 0;
  const active = presenting ? STEPS[step].keys : null;

  const svg = useMemo(() => renderWorkflowSvg(data, { active, selected }), [data, active, selected]);

  const next = useCallback(() => setStep((s) => (s < 0 ? 0 : Math.min(s + 1, STEPS.length - 1))), []);
  const prev = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);
  const stop = useCallback(() => {
    setStep(-1);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);
  const present = useCallback(() => {
    setSelected(null);
    setStep(0);
    frame.current?.requestFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return;
      if (e.key === "Escape") {
        if (selected) setSelected(null);
        else if (presenting) stop();
        return;
      }
      if (!presenting) return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [presenting, selected, next, prev, stop]);

  useEffect(() => {
    const onFs = () => { if (!document.fullscreenElement) setStep((s) => (s >= 0 ? -1 : s)); };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const pick = (e: React.MouseEvent | React.KeyboardEvent) => {
    const g = (e.target as HTMLElement).closest?.("[data-node]") as HTMLElement | null;
    if (!g) return;
    if ("key" in e && e.key !== "Enter" && e.key !== " ") return;
    if ("key" in e) e.preventDefault();
    setSelected(g.dataset.node ?? null);
  };

  const node = selected ? nodeById(selected) : undefined;

  return (
    <div className="wf">
      <div className={`wf-frame${presenting ? " presenting" : ""}`} ref={frame}>
        <div className="wf-bar">
          {presenting ? (
            <>
              <button type="button" className="wf-btn" onClick={prev} disabled={step === 0} aria-label="Previous step">&#8249;</button>
              <span className="wf-step-count">{step + 1} / {STEPS.length}</span>
              <button type="button" className="wf-btn" onClick={next} disabled={step === STEPS.length - 1} aria-label="Next step">&#8250;</button>
              <span className="wf-bar-grow" />
              <span className="wf-hint">Arrow keys move. Esc ends.</span>
              <button type="button" className="wf-btn" onClick={stop}>End</button>
            </>
          ) : (
            <>
              <span className="wf-hint">Click a box for what is behind it.</span>
              <span className="wf-bar-grow" />
              <button type="button" className="wf-btn wf-btn-primary" onClick={present}>Present</button>
            </>
          )}
        </div>
        <div className="wf-scroll" onClick={pick} onKeyDown={pick} dangerouslySetInnerHTML={{ __html: svg }} />
        {presenting && (
          <div className="wf-caption" aria-live="polite">
            <span className="wf-caption-title">{STEPS[step].title}</span>
            <p>{STEPS[step].say}</p>
          </div>
        )}
        {!presenting && (
          <div className="wf-legend">
            <span><i className="solid" /> arrows: data moving between tools</span>
            <span><i className="dash" /> blue dashed box: the prospective and inactive approach</span>
            <span><i className="amber" /> amber dashed box: tools kept separate from it</span>
          </div>
        )}
      </div>

      {node && (
        <>
          <div className="s-detail-back" onClick={() => setSelected(null)} />
          <aside className="s-detail" aria-label="Workflow node details">
            <button type="button" className="s-icon-btn s-detail-close" onClick={() => setSelected(null)} aria-label="Close">
              <Icon name="close" />
            </button>
            <div className="s-detail-body">
              <span className="s-detail-kind">{node.step ?? "Workflow"}</span>
              <h2 className="wf-d-title">{node.title ?? node.step}</h2>
              <ul className="wf-d-lines">
                {joinLines(node.lines).map((l, i) => (
                  <li key={i} className={l.dim ? "muted" : undefined}>{l.code && l.code !== "•" ? `${l.code}. ` : ""}{l.t}</li>
                ))}
              </ul>
              {node.about && <p className="wf-d-about">{node.about}</p>}
              {node.projects.map((id) => {
                const p = data.projects[id];
                if (!p) return null;
                return (
                  <section key={id} className="wf-d-project">
                    <div className="wf-d-head">
                      <Link href={`/projects/${p.id}`}>{p.name}</Link>
                      <span className={`pill col-${statusSlug(p.status)}`}>{p.status}</span>
                    </div>
                    <p className="wf-d-summary">{p.summary}</p>
                    {p.blockers.length > 0 && (
                      <div className="s-callout bad">
                        <strong>Blocked</strong>
                        <ul>{p.blockers.map((b, i) => <li key={i}>{b}</li>)}</ul>
                      </div>
                    )}
                    {p.next_steps.length > 0 && (
                      <>
                        <h3>Next steps</h3>
                        <ul>{p.next_steps.map((b, i) => <li key={i}>{b}</li>)}</ul>
                      </>
                    )}
                    {p.open.length > 0 && (
                      <>
                        <h3>Open to-dos ({p.open.length})</h3>
                        <ul className="wf-d-tasks">
                          {p.open.slice(0, 8).map((x) => (
                            <li key={x.id}>
                              <Link href={`/projects/${p.id}?item=task:${x.id}`}>{x.title}</Link>
                              <span className="muted small"> {x.owner}{x.due ? `, ${shortDate(x.due)}` : ""}</span>
                            </li>
                          ))}
                          {p.open.length > 8 && <li className="muted small">and {p.open.length - 8} more on the project page</li>}
                        </ul>
                      </>
                    )}
                    {p.built.length > 0 && (
                      <details>
                        <summary>Built so far ({p.built.length})</summary>
                        <ul>{p.built.map((b, i) => <li key={i}>{b}</li>)}</ul>
                      </details>
                    )}
                  </section>
                );
              })}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

/** Lines that wrapped in the drawing read as one item here. */
function joinLines(lines: NodeDef["lines"]) {
  const out: NodeDef["lines"] = [];
  for (const l of lines) {
    if (l.cont && out.length) out[out.length - 1] = { ...out[out.length - 1], t: `${out[out.length - 1].t} ${l.t}` };
    else out.push(l);
  }
  return out;
}

export const NODE_IDS = NODES.map((n) => n.id);
