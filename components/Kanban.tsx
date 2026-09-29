"use client";

import { useEffect, useMemo, useState } from "react";
import TaskCard from "./TaskCard";
import { STATUSES, sortTasks, statusSlug, type Task } from "@/lib/tracker";
import { todayISO } from "@/lib/dates";

type Props = {
  tasks: Task[];
  projects: { id: string; name: string; category: string | null }[];
};

const STORE = "pm-board-filters";

export default function Kanban({ tasks, projects }: Props) {
  const [area, setArea] = useState("all");
  const [project, setProject] = useState("all");
  const [owner, setOwner] = useState("all");
  const [showNotes, setShowNotes] = useState(false);
  const [today, setToday] = useState<string>();

  useEffect(() => {
    setToday(todayISO());
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) ?? "{}");
      if (saved.area) setArea(saved.area);
      if (saved.project) setProject(saved.project);
      if (saved.owner) setOwner(saved.owner);
      if (saved.showNotes) setShowNotes(true);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify({ area, project, owner, showNotes }));
    } catch {}
  }, [area, project, owner, showNotes]);

  const owners = useMemo(() => [...new Set(tasks.map((t) => t.owner))].sort(), [tasks]);
  const names = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p.name])), [projects]);
  const areaOf = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p.category ?? "General"])), [projects]);
  const areas = useMemo(() => [...new Set(projects.map((p) => p.category ?? "General"))], [projects]);
  const projectChoices = projects.filter((p) => area === "all" || (p.category ?? "General") === area);

  const shown = tasks.filter(
    (t) =>
      (area === "all" || areaOf[t.project_id] === area) &&
      (project === "all" || t.project_id === project) &&
      (owner === "all" || t.owner === owner)
  );

  return (
    <>
      <div className="filters">
        <label>
          Area
          <select
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              setProject("all");
            }}
          >
            <option value="all">All</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label>
          Project
          <select value={project} onChange={(e) => setProject(e.target.value)}>
            <option value="all">All</option>
            {projectChoices.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Owner
          <select value={owner} onChange={(e) => setOwner(e.target.value)}>
            <option value="all">All</option>
            {owners.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input type="checkbox" checked={showNotes} onChange={(e) => setShowNotes(e.target.checked)} />
          Show notes
        </label>
        <span className="muted small">{shown.length} tasks</span>
      </div>
      <div className={`board${showNotes ? "" : " hide-notes"}`}>
        {STATUSES.map((s) => {
          const col = sortTasks(shown.filter((t) => t.status === s));
          return (
            <section key={s} className={`col col-${statusSlug(s)}`}>
              <div className="col-head">
                <span>{s}</span>
                <span className="muted">{col.length}</span>
              </div>
              {col.map((t) => (
                <TaskCard key={t.id} task={t} projectName={names[t.project_id]} today={today} />
              ))}
            </section>
          );
        })}
      </div>
    </>
  );
}
