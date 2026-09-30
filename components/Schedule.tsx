"use client";

import { useEffect, useState } from "react";
import TaskItem from "./TaskItem";
import { useApp } from "./App";
import { sortTasks, type Task } from "@/lib/tracker";
import { addDaysISO, daysBetween, longDate, mondayIndex, weekday } from "@/lib/dates";

type Group = { key: string; title: string; sub?: string; tasks: Task[]; tone?: "bad" | "today"; always?: boolean };

const STORE = "pm-schedule";

export default function Schedule({ tasks }: { tasks: Task[] }) {
  const { today } = useApp();
  const [who, setWho] = useState<"mine" | "all">("mine");
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORE) ?? "{}");
      if (s.who) setWho(s.who);
      if (s.showDone) setShowDone(true);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify({ who, showDone }));
    } catch {}
  }, [who, showDone]);

  if (!today) return null;

  const mine = (t: Task) => who === "all" || t.owner === "Me";
  const work = tasks.filter((t) => !t.idea && mine(t));
  const open = work.filter((t) => t.status !== "Done");

  // Monday-based weeks.
  const dow = mondayIndex(today);
  const endOfWeek = addDaysISO(today, 6 - dow);
  const endOfNextWeek = addDaysISO(endOfWeek, 7);
  const tomorrow = addDaysISO(today, 1);

  const groups: Group[] = [];
  groups.push({ key: "overdue", title: "Overdue", tasks: open.filter((t) => t.due && t.due < today), tone: "bad" });
  groups.push({ key: "today", title: "Today", sub: longDate(today), tasks: open.filter((t) => t.due === today), tone: "today", always: true });
  groups.push({ key: "tomorrow", title: "Tomorrow", sub: longDate(tomorrow), tasks: open.filter((t) => t.due === tomorrow) });
  for (let d = addDaysISO(today, 2); d <= endOfWeek; d = addDaysISO(d, 1)) {
    groups.push({ key: d, title: weekday(d), sub: longDate(d), tasks: open.filter((t) => t.due === d) });
  }
  const nextWeekStart = addDaysISO(endOfWeek, 1);
  groups.push({
    key: "nextweek",
    title: "Next week",
    sub: `${longDate(nextWeekStart)} to ${longDate(endOfNextWeek)}`,
    tasks: open.filter((t) => t.due && t.due > endOfWeek && t.due <= endOfNextWeek && t.due !== tomorrow),
  });
  groups.push({ key: "later", title: "Later", tasks: open.filter((t) => t.due && t.due > endOfNextWeek) });

  const undated = sortTasks(open.filter((t) => !t.due));
  const undatedActive = undated.filter((t) => t.status !== "Backlog");
  const undatedBacklog = undated.filter((t) => t.status === "Backlog");
  const recentDone = work
    .filter((t) => t.status === "Done" && t.completed && daysBetween(t.completed, today) <= 7)
    .sort((a, b) => (b.completed ?? "").localeCompare(a.completed ?? ""));

  const dated = open.filter((t) => t.due).length;

  return (
    <div className="sched">
      <div className="sched-bar">
        <div className="seg" role="group" aria-label="Whose tasks">
          <button type="button" className={who === "mine" ? "on" : ""} onClick={() => setWho("mine")}>
            Mine
          </button>
          <button type="button" className={who === "all" ? "on" : ""} onClick={() => setWho("all")}>
            Everyone
          </button>
        </div>
        <span className="muted small">
          {dated} scheduled · {undated.length} with no date
        </span>
        <label className="small muted toggle">
          <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} /> Show done this week
        </label>
      </div>

      <div className="sched-cols">
        <div>
          {groups
            .filter((g) => g.tasks.length || g.always)
            .map((g) => (
              <section key={g.key} className={`day${g.tone ? " " + g.tone : ""}`}>
                <h2>
                  {g.title}
                  {g.sub && <span className="day-sub">{g.sub}</span>}
                  <span className="day-count">{g.tasks.length}</span>
                </h2>
                {g.tasks.length ? (
                  <div className="list-rows">
                    {sortTasks(g.tasks)
                      .sort((a, b) => (a.due ?? "").localeCompare(b.due ?? ""))
                      .map((t) => (
                        <TaskItem key={t.id} task={t} />
                      ))}
                  </div>
                ) : (
                  <p className="section-empty">Nothing due. Give an undated item a date to plan it here.</p>
                )}
              </section>
            ))}
          {showDone && (
            <section className="day">
              <h2>
                Done this week<span className="day-count">{recentDone.length}</span>
              </h2>
              <div className="list-rows">
                {recentDone.map((t) => (
                  <TaskItem key={t.id} task={t} />
                ))}
              </div>
            </section>
          )}
        </div>
        <aside>
          <section className="day">
            <h2>
              No date<span className="day-count">{undatedActive.length}</span>
            </h2>
            <p className="muted small" style={{ margin: "0 0 8px" }}>
              Highest priority first. Click a title to set a due date.
            </p>
            <div className="list-rows">
              {undatedActive.map((t) => (
                <TaskItem key={t.id} task={t} />
              ))}
            </div>
            {undatedBacklog.length > 0 && (
              <details className="group">
                <summary>
                  Backlog <span className="muted">{undatedBacklog.length}</span>
                </summary>
                <div className="list-rows">
                  {undatedBacklog.map((t) => (
                    <TaskItem key={t.id} task={t} />
                  ))}
                </div>
              </details>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
