"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { sortTasks, type Task, type WaitingOn } from "@/lib/tracker";
import { daysBetween, shortDate, todayISO } from "@/lib/dates";

type Props = {
  tasks: Task[];
  waiting: WaitingOn[];
  openDecisions: number;
  names: Record<string, string>;
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function projectHref(id: string) {
  return id === "general" ? "/projects" : `/projects/${id}`;
}

// Date-dependent parts of the home page. Runs in the browser so "today" is always today.
export function Greeting() {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const d = new Date();
    setLabel(`${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`);
  }, []);
  return <p className="home-date">{label || " "}</p>;
}

export function Tiles({ tasks, waiting, openDecisions }: Omit<Props, "names">) {
  const [today, setToday] = useState<string>();
  useEffect(() => setToday(todayISO()), []);
  const open = tasks.filter((t) => t.status !== "Done");
  const urgent = open.filter((t) => t.priority === "urgent").length;
  const overdue = today ? open.filter((t) => t.due && t.due < today).length : 0;
  const soon = today ? open.filter((t) => t.due && t.due >= today && daysBetween(today, t.due) <= 7).length : null;
  const oldest = today && waiting.length ? Math.max(...waiting.map((w) => daysBetween(w.since, today))) : 0;

  return (
    <div className="tiles">
      <Link href="/week" className="tile">
        <span className="tile-label">Urgent</span>
        <span className="tile-value">{urgent}</span>
        <span className="tile-sub">open, top priority</span>
      </Link>
      <Link href="/week" className="tile">
        <span className="tile-label">Due in 7 days</span>
        <span className="tile-value">{soon ?? "–"}</span>
        <span className={`tile-sub${overdue ? " bad" : ""}`}>{overdue ? `${overdue} overdue` : "nothing overdue"}</span>
      </Link>
      <Link href="/waiting" className="tile">
        <span className="tile-label">Waiting on others</span>
        <span className="tile-value">{waiting.length}</span>
        <span className="tile-sub">{oldest > 1 ? `oldest ${oldest} days` : oldest === 1 ? "oldest 1 day" : "all new today"}</span>
      </Link>
      <Link href="/projects" className="tile">
        <span className="tile-label">Open decisions</span>
        <span className="tile-value">{openDecisions}</span>
        <span className="tile-sub">need a call from me</span>
      </Link>
    </div>
  );
}

export function Attention({ tasks, names }: Pick<Props, "tasks" | "names">) {
  const [today, setToday] = useState<string>();
  useEffect(() => setToday(todayISO()), []);
  if (!today) return <div className="panel-body" />;

  const open = tasks.filter((t) => t.status !== "Done");
  const flagged = open
    .map((t) => {
      if (t.due && t.due < today) return { t, why: `Overdue ${shortDate(t.due)}`, level: "bad", rank: 0 };
      if (t.due && daysBetween(today, t.due) <= 7) return { t, why: `Due ${shortDate(t.due)}`, level: "warn", rank: 1 };
      if (t.priority === "urgent") return { t, why: "Urgent", level: "bad", rank: 2 };
      if (t.status === "Blocked") return { t, why: "Blocked", level: "warn", rank: 3 };
      return null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const order = new Map(sortTasks(open).map((t, i) => [t.id, i]));
  flagged.sort(
    (a, b) =>
      a.rank - b.rank ||
      (a.rank <= 1 ? (a.t.due ?? "").localeCompare(b.t.due ?? "") : 0) ||
      order.get(a.t.id)! - order.get(b.t.id)!
  );

  if (!flagged.length) return <p className="section-empty panel-body">Nothing needs attention.</p>;
  return (
    <ul className="rows">
      {flagged.slice(0, 8).map(({ t, why, level }) => (
        <li key={t.id}>
          <Link href={projectHref(t.project_id)} className="row">
            <span className={`dot ${level}`} aria-hidden />
            <span className="row-main">
              <span className="row-title">{t.title}</span>
              <span className="row-sub">
                {names[t.project_id]} · {t.owner}
              </span>
            </span>
            <span className={`row-tag ${level}`}>{why}</span>
          </Link>
        </li>
      ))}
      {flagged.length > 8 && (
        <li>
          <Link href="/week" className="row more">
            {flagged.length - 8} more on This week
          </Link>
        </li>
      )}
    </ul>
  );
}
