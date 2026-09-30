"use client";

import { useRef, useState } from "react";
import { PRIORITIES, type Priority } from "@/lib/tracker";
import { useApp } from "./App";

// One-line capture: type, pick project and kind, press Enter. Details are optional.
export default function QuickAdd({ projectId, defaultKind = "task" }: { projectId?: string; defaultKind?: "task" | "idea" }) {
  const { projects, owners, save, canEdit } = useApp();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<"task" | "idea">(defaultKind);
  const [project, setProject] = useState(projectId ?? "general");
  const [more, setMore] = useState(false);
  const [owner, setOwner] = useState("Me");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    const ok = await save(
      {
        type: "task.add",
        fields: {
          title,
          project_id: project,
          owner,
          priority,
          due: due || null,
          ...(kind === "idea" ? { idea: true } : {}),
        },
      },
      kind === "idea" ? "Idea added" : "Action item added"
    );
    setBusy(false);
    if (ok) {
      setTitle("");
      setDue("");
      setPriority("normal");
      input.current?.focus();
    }
  }

  return (
    <form className="qa" onSubmit={submit}>
      <div className="qa-row">
        <div className="seg" role="group" aria-label="Type">
          <button type="button" className={kind === "task" ? "on" : ""} onClick={() => setKind("task")}>
            Action item
          </button>
          <button type="button" className={kind === "idea" ? "on" : ""} onClick={() => setKind("idea")}>
            Idea
          </button>
        </div>
        <input
          ref={input}
          className="qa-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={kind === "idea" ? "Capture an idea..." : "Add an action item..."}
          maxLength={200}
          disabled={!canEdit}
        />
        {!projectId && (
          <select value={project} onChange={(e) => setProject(e.target.value)} aria-label="Project">
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
        <button type="button" className="ghost" onClick={() => setMore(!more)} aria-expanded={more}>
          {more ? "Less" : "Details"}
        </button>
        <button type="submit" disabled={busy || !title.trim() || !canEdit}>
          Add
        </button>
      </div>
      {more && (
        <div className="qa-more">
          <label>
            <span>Owner</span>
            <select value={owner} onChange={(e) => setOwner(e.target.value)}>
              {owners.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Due</span>
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </label>
          <label>
            <span>Priority</span>
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
        </div>
      )}
    </form>
  );
}
