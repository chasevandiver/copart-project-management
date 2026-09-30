"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PRIORITIES, STATUSES, projectHref, type Task } from "@/lib/tracker";
import type { TaskFields } from "@/lib/ops";
import { shortDate } from "@/lib/dates";
import { useApp } from "./App";

type Props = {
  task: Task;
  showProject?: boolean;
  tag?: { text: string; level: "bad" | "warn" | "ok" };
  variant?: "row" | "card";
  showNotes?: boolean;
};

export default function TaskItem({ task, showProject = true, tag, variant = "row", showNotes = false }: Props) {
  const { projects, today, save, canEdit } = useApp();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(task.status === "Done");
  useEffect(() => setDone(task.status === "Done"), [task.status, task.due]);

  const projectName = projects.find((p) => p.id === task.project_id)?.name ?? "General";
  const overdue = !done && today && task.due && task.due < today;
  const dueToday = !done && today && task.due === today;

  async function toggle() {
    const next = !done;
    if (!task.recurring || !next) setDone(next);
    const ok = await save(
      { type: "task.toggle", id: task.id, done: next },
      next ? (task.recurring ? "Done. Rolled to next week." : "Done") : "Reopened"
    );
    if (!ok) setDone(!next);
  }

  return (
    <div className={`ti ti-${variant} p-${task.priority}${done ? " is-done" : ""}${task.idea ? " is-idea" : ""}`}>
      {task.idea ? (
        <span className="ti-bulb" aria-label="Idea">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
            <path d="M8 1.5a4.5 4.5 0 0 0-2.6 8.2V11h5.2V9.7A4.5 4.5 0 0 0 8 1.5ZM6 12.5h4V14H6z" fill="currentColor" />
          </svg>
        </span>
      ) : (
        <button
          type="button"
          className="check"
          role="checkbox"
          aria-checked={done}
          aria-label={done ? `Reopen ${task.title}` : `Mark ${task.title} done`}
          onClick={toggle}
          disabled={!canEdit}
        >
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
            <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <div className="ti-main">
        <button type="button" className="ti-title" onClick={() => setOpen(!open)} aria-expanded={open}>
          {task.title}
        </button>
        <div className="ti-meta">
          {showProject && (
            <Link href={projectHref(task.project_id)} className="ti-project">
              {projectName}
            </Link>
          )}
          <span>{task.owner}</span>
          {task.due && !tag && (
            <span className={overdue ? "bad" : dueToday ? "warn" : undefined}>
              {overdue ? "Overdue " : dueToday ? "Today " : "Due "}
              {shortDate(task.due)}
            </span>
          )}
          {!tag && task.priority === "urgent" && <span className="bad">Urgent</span>}
          {!tag && task.priority === "high" && <span className="warn">High</span>}
          {!done && task.status !== "Next" && !task.idea && <span>{task.status}</span>}
          {task.recurring && <span>Weekly</span>}
          <span className="ti-id">{task.id}</span>
        </div>
        {showNotes && task.notes && !open && <p className="ti-notes">{task.notes}</p>}
        {open && <TaskEditor task={task} onClose={() => setOpen(false)} />}
      </div>
      {tag && <span className={`ti-tag ${tag.level}`}>{tag.text}</span>}
    </div>
  );
}

function TaskEditor({ task, onClose }: { task: Task; onClose: () => void }) {
  const { projects, owners, save, canEdit } = useApp();
  const [f, setF] = useState({
    title: task.title,
    project_id: task.project_id,
    status: task.status,
    owner: task.owner,
    priority: task.priority,
    due: task.due ?? "",
    notes: task.notes,
  });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const fields: TaskFields = {};
    if (f.title !== task.title) fields.title = f.title;
    if (f.project_id !== task.project_id) fields.project_id = f.project_id;
    if (f.status !== task.status) fields.status = f.status;
    if (f.owner !== task.owner) fields.owner = f.owner;
    if (f.priority !== task.priority) fields.priority = f.priority;
    if ((f.due || null) !== task.due) fields.due = f.due || null;
    if (f.notes !== task.notes) fields.notes = f.notes;
    if (!Object.keys(fields).length) return onClose();
    setBusy(true);
    const ok = await save({ type: "task.update", id: task.id, fields }, "Saved");
    setBusy(false);
    if (ok) onClose();
  }

  async function run(op: Parameters<typeof save>[0], msg: string) {
    setBusy(true);
    const ok = await save(op, msg);
    setBusy(false);
    if (ok) onClose();
  }

  const ownerList = owners.includes(task.owner) ? owners : [task.owner, ...owners];

  return (
    <form className="editor" onSubmit={submit}>
      <label className="full">
        <span>Title</span>
        <input value={f.title} onChange={set("title")} required maxLength={200} />
      </label>
      <label>
        <span>Project</span>
        <select value={f.project_id} onChange={set("project_id")}>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      {!task.idea && (
        <label>
          <span>Status</span>
          <select value={f.status} onChange={set("status")}>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      )}
      <label>
        <span>Owner</span>
        <select value={f.owner} onChange={set("owner")}>
          {ownerList.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Priority</span>
        <select value={f.priority} onChange={set("priority")}>
          {PRIORITIES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Due</span>
        <input type="date" value={f.due} onChange={set("due")} />
      </label>
      <label className="full">
        <span>Notes</span>
        <textarea value={f.notes} onChange={set("notes")} rows={3} maxLength={2000} />
      </label>
      <div className="editor-actions full">
        <button type="submit" disabled={busy || !canEdit}>
          Save
        </button>
        <button type="button" className="ghost" onClick={onClose}>
          Cancel
        </button>
        {task.idea && (
          <>
            <button type="button" className="ghost" disabled={busy} onClick={() => run({ type: "idea.promote", id: task.id }, "Now a task")}>
              Make it a task
            </button>
            <button
              type="button"
              className="ghost danger"
              disabled={busy}
              onClick={() => confirm("Drop this idea?") && run({ type: "idea.drop", id: task.id }, "Idea dropped")}
            >
              Drop idea
            </button>
          </>
        )}
      </div>
    </form>
  );
}
