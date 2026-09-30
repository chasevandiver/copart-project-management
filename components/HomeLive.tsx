"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { sortTasks, type Task, type WaitingOn } from "@/lib/tracker";
import TaskItem from "./TaskItem";
import { useApp } from "./App";
import { addDaysISO, daysBetween, mondayIndex, shortDate } from "@/lib/dates";
import type { ActivityEvent } from "@/lib/activity";

type TileProps = {
  tasks: Task[];
  waiting: WaitingOn[];
  openQuestions: number;
  askPeople: number;
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Date-dependent parts of the home page. Runs in the browser so "today" is always today.
export function Greeting() {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const d = new Date();
    setLabel(`${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`);
  }, []);
  return <p className="home-date">{label || " "}</p>;
}

export function Tiles({ tasks, waiting, openQuestions, askPeople }: TileProps) {
  const { today } = useApp();
  const open = tasks.filter((t) => t.status !== "Done" && !t.idea);
  const urgent = open.filter((t) => t.priority === "urgent").length;
  const overdue = today ? open.filter((t) => t.due && t.due < today).length : 0;
  const soon = today ? open.filter((t) => t.due && t.due >= today && daysBetween(today, t.due) <= 7).length : null;
  const oldest = today && waiting.length ? Math.max(...waiting.map((w) => daysBetween(w.since, today))) : 0;

  return (
    <div className="tiles">
      <Link href="/classic/schedule" className="tile">
        <span className="tile-label">Due in 7 days</span>
        <span className="tile-value">{soon ?? "\u2013"}</span>
        <span className={`tile-sub${overdue ? " bad" : ""}`}>{overdue ? `${overdue} overdue` : "nothing overdue"}</span>
      </Link>
      <Link href="/classic/schedule" className="tile">
        <span className="tile-label">Urgent</span>
        <span className="tile-value">{urgent}</span>
        <span className="tile-sub">open, top priority</span>
      </Link>
      <Link href="/classic/people" className="tile">
        <span className="tile-label">Questions to ask</span>
        <span className="tile-value">{openQuestions}</span>
        <span className="tile-sub">{askPeople ? `across ${askPeople} ${askPeople === 1 ? "person" : "people"}` : "none open"}</span>
      </Link>
      <Link href="/classic/people" className="tile">
        <span className="tile-label">Waiting on others</span>
        <span className="tile-value">{waiting.length}</span>
        <span className="tile-sub">{oldest > 1 ? `oldest ${oldest} days` : oldest === 1 ? "oldest 1 day" : "all new today"}</span>
      </Link>
    </div>
  );
}

export function WeekSoFar({ events }: { events: ActivityEvent[] }) {
  const { today } = useApp();
  if (!today) return null;
  const monday = addDaysISO(today, -mondayIndex(today));
  const week = events.filter((e) => e.date >= monday && e.date <= today);
  const n = (k: ActivityEvent["kind"]) => week.filter((e) => e.kind === k).length;
  const rows: [string, number][] = [
    ["Completed", n("done")],
    ["Notes", n("note")],
    ["Questions answered", n("answered")],
    ["Decisions", n("decided")],
    ["Items added", n("added") + n("idea") + n("asked")],
  ];
  return (
    <ul className="rows">
      {rows.map(([label, v]) => (
        <li key={label}>
          <Link href="/classic/progress" className="row">
            <span className="row-main">
              <span className="row-title">{label}</span>
            </span>
            <span className="row-count">{v}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Attention({ tasks }: { tasks: Task[] }) {
  const { today } = useApp();
  if (!today) return <div className="panel-body" />;

  const open = tasks.filter((t) => t.status !== "Done" && !t.idea);
  const flagged = open
    .map((t) => {
      if (t.due && t.due < today) return { t, text: `Overdue ${shortDate(t.due)}`, level: "bad" as const, rank: 0 };
      if (t.due && daysBetween(today, t.due) <= 7) return { t, text: t.due === today ? "Today" : `Due ${shortDate(t.due)}`, level: "warn" as const, rank: 1 };
      if (t.priority === "urgent") return { t, text: "Urgent", level: "bad" as const, rank: 2 };
      if (t.status === "Blocked") return { t, text: "Blocked", level: "warn" as const, rank: 3 };
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
    <div className="list-rows tight">
      {flagged.slice(0, 8).map(({ t, text, level }) => (
        <TaskItem key={t.id} task={t} tag={{ text, level }} />
      ))}
      {flagged.length > 8 && (
        <Link href="/classic/schedule" className="row more">
          {flagged.length - 8} more on Schedule
        </Link>
      )}
    </div>
  );
}
