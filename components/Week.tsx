"use client";

import { useEffect, useState } from "react";
import TaskCard from "./TaskCard";
import { sortTasks, type Task } from "@/lib/tracker";
import { daysBetween, todayISO } from "@/lib/dates";

export default function Week({ tasks, names }: { tasks: Task[]; names: Record<string, string> }) {
  const [today, setToday] = useState<string>();
  useEffect(() => setToday(todayISO()), []);
  if (!today) return null;

  const open = tasks.filter((t) => t.status !== "Done");
  const overdue = open.filter((t) => t.due && t.due < today);
  const soon = open.filter((t) => t.due && t.due >= today && daysBetween(today, t.due) <= 7);
  const listed = new Set([...overdue, ...soon].map((t) => t.id));
  const urgent = open.filter((t) => t.priority === "urgent" && !listed.has(t.id));

  const section = (title: string, list: Task[], empty: string) => (
    <>
      <h2>
        {title} <span className="muted">({list.length})</span>
      </h2>
      {list.length ? (
        <div className="list">
          {sortTasks(list).map((t) => (
            <TaskCard key={t.id} task={t} projectName={names[t.project_id]} today={today} showStatus />
          ))}
        </div>
      ) : (
        <p className="section-empty">{empty}</p>
      )}
    </>
  );

  return (
    <>
      {section("Overdue", overdue, "Nothing overdue.")}
      {section("Due in the next 7 days", soon, "Nothing due this week.")}
      {section("Urgent, no date this week", urgent, "No other urgent items.")}
    </>
  );
}
