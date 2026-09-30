"use client";

import { useEffect, useState } from "react";
import type { Entry } from "@/lib/views";
import type { Task } from "@/lib/tracker";
import { dueLabel, daysBetween, shortDate } from "@/lib/dates";
import { useApp } from "../App";
import { useSelection } from "./select";
import { Icon } from "./Icon";

export default function Row({ e, showProject = true }: { e: Entry; showProject?: boolean }) {
  const { projects, today } = useApp();
  const sel = useSelection();
  const key = `${e.kind}:${e.v.id}`;
  const selected = sel.current === key;
  const pname = (id: string) => projects.find((p) => p.id === id)?.name ?? "Inbox";

  const openIt = () => sel.open(e.kind, e.v.id);

  let lead: React.ReactNode;
  let title: React.ReactNode;
  const meta: React.ReactNode[] = [];
  let done = false;

  if (e.kind === "task") {
    const x = e.v;
    done = x.status === "Done";
    lead = x.idea ? <Icon name="idea" className="s-lead idea" /> : <Check task={x} />;
    title = x.title;
    if (x.owner !== "Me") meta.push(<span key="o" className="s-who">{x.owner}</span>);
    if (x.status === "Blocked" || x.status === "Waiting") meta.push(<span key="s" className="s-tag warn">{x.status}</span>);
    if (x.recurring) meta.push(<span key="r" className="s-tag">Weekly</span>);
    if (showProject) meta.push(<span key="p">{pname(x.project_id)}</span>);
    if (x.due && today && !done) {
      const d = dueLabel(x.due, today);
      meta.push(
        <span key="d" className={`s-due${d.overdue ? " bad" : d.soon ? " soon" : ""}`}>
          {d.text}
        </span>
      );
    }
    if (!done && x.priority === "urgent") meta.push(<span key="u" className="s-flag" title="Urgent" aria-label="Urgent">!</span>);
  } else if (e.kind === "question") {
    const q = e.v;
    done = q.status === "answered";
    lead = <Icon name="question" className="s-lead q" />;
    title = (
      <>
        <span className="s-ask">Ask {q.ask}:</span> {q.question}
      </>
    );
    if (done && q.answer) meta.push(<span key="a" className="s-answer">{q.answer}</span>);
    if (showProject) meta.push(<span key="p">{pname(q.project_id)}</span>);
  } else if (e.kind === "note") {
    const n = e.v;
    lead = <Icon name="note" className="s-lead note" />;
    title = n.title;
    meta.push(<span key="b" className="s-preview">{n.body[0] === n.title ? n.body[1] ?? "" : n.body[0]}</span>);
    if (showProject) meta.push(<span key="p">{pname(n.project_id)}</span>);
    meta.push(<span key="d">{shortDate(n.date)}</span>);
  } else if (e.kind === "waiting") {
    const w = e.v;
    done = !!w.received;
    lead = <Icon name="waiting" className="s-lead wait" />;
    title = (
      <>
        <span className="s-ask">From {w.from_whom}:</span> {w.what}
      </>
    );
    if (showProject) meta.push(<span key="p">{pname(w.project_id)}</span>);
    if (w.received) meta.push(<span key="r">Received {shortDate(w.received)}</span>);
    else if (today) {
      const days = daysBetween(w.since, today);
      meta.push(
        <span key="age" className={days > 7 ? "s-due soon" : undefined}>
          {days <= 0 ? "Since today" : `${days}d`}
        </span>
      );
    }
  } else {
    const d = e.v;
    done = d.status === "resolved";
    lead = <Icon name="decision" className="s-lead decide" />;
    title = d.question;
    if (done && d.answer) meta.push(<span key="a" className="s-answer">{d.answer}</span>);
    else meta.push(<span key="o">{d.options.length} options</span>);
    if (showProject) meta.push(<span key="p">{pname(d.project_id)}</span>);
  }

  return (
    <div
      className={`s-row${selected ? " sel" : ""}${done ? " done" : ""}`}
      onClick={openIt}
      role="button"
      tabIndex={0}
      onKeyDown={(ev) => {
        if (ev.key === "Enter") openIt();
      }}
    >
      <div className="s-row-lead" onClick={(ev) => ev.stopPropagation()}>
        {lead}
      </div>
      <div className="s-row-title">{title}</div>
      <div className="s-row-meta">{meta}</div>
    </div>
  );
}

function Check({ task }: { task: Task }) {
  const { save, canEdit } = useApp();
  const [on, setOn] = useState(task.status === "Done");
  useEffect(() => setOn(task.status === "Done"), [task.status, task.due]);
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      aria-label={on ? `Mark "${task.title}" not done` : `Mark "${task.title}" done`}
      className={`s-check p-${task.priority}${on ? " on" : ""}`}
      disabled={!canEdit}
      onClick={async () => {
        const next = !on;
        if (!task.recurring || !next) setOn(next);
        const ok = await save(
          { type: "task.toggle", id: task.id, done: next },
          next ? (task.recurring ? "Done. Next one is in a week." : "Done") : "Reopened"
        );
        if (!ok) setOn(!next);
      }}
    >
      <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden>
        <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
