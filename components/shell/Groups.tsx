"use client";

import type { Group } from "@/lib/views";
import { longDate } from "@/lib/dates";
import Row from "./Row";

// A view is a list of titled groups of rows. Collapsed groups fold behind a summary line.
export default function Groups({ groups, showProject = true, empty }: { groups: Group[]; showProject?: boolean; empty?: string }) {
  if (!groups.length) return <p className="s-empty">{empty ?? "Nothing here."}</p>;
  return (
    <>
      {groups.map((g) => {
        const sub = g.sub && /^\d{4}-\d{2}-\d{2}$/.test(g.sub) ? longDate(g.sub) : g.sub;
        const head = (
          <>
            <span className="s-group-title">{g.title}</span>
            {sub && <span className="s-group-sub">{sub}</span>}
            <span className="s-group-count">{g.entries.length}</span>
          </>
        );
        const rows = g.entries.length ? (
          g.entries.map((e) => <Row key={e.kind + e.v.id} e={e} showProject={showProject} />)
        ) : (
          <p className="s-empty small">Nothing due.</p>
        );
        return g.collapsed ? (
          <details key={g.key} className={`s-group${g.tone ? " " + g.tone : ""}`}>
            <summary className="s-group-head">{head}</summary>
            {rows}
          </details>
        ) : (
          <section key={g.key} className={`s-group${g.tone ? " " + g.tone : ""}`}>
            <h2 className="s-group-head">{head}</h2>
            {rows}
          </section>
        );
      })}
    </>
  );
}
