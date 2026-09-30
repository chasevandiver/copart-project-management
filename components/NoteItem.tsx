"use client";

import Link from "next/link";
import { useState } from "react";
import { projectHref, type Note } from "@/lib/tracker";
import { longDate } from "@/lib/dates";
import { useApp } from "./App";

export default function NoteItem({ note, showProject = true }: { note: Note; showProject?: boolean }) {
  const { projects, save, canEdit } = useApp();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [text, setText] = useState(note.body.join("\n"));
  const [project, setProject] = useState(note.project_id);
  const [date, setDate] = useState(note.date);
  const [busy, setBusy] = useState(false);
  const projectName = projects.find((p) => p.id === note.project_id)?.name ?? "General";

  async function run(op: Parameters<typeof save>[0], msg: string) {
    setBusy(true);
    const ok = await save(op, msg);
    setBusy(false);
    if (ok) setEditing(false);
  }

  if (editing) {
    return (
      <form
        className="note editor"
        onSubmit={(e) => {
          e.preventDefault();
          run({ type: "note.update", id: note.id, title, text, project_id: project, date }, "Note saved");
        }}
      >
        <label className="full">
          <span>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
        </label>
        <label>
          <span>Project</span>
          <select value={project} onChange={(e) => setProject(e.target.value)}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label className="full">
          <span>Note (one point per line)</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} maxLength={10000} />
        </label>
        <div className="editor-actions full">
          <button type="submit" disabled={busy || !canEdit}>
            Save
          </button>
          <button type="button" className="ghost" onClick={() => setEditing(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="ghost danger"
            disabled={busy || !canEdit}
            onClick={() => confirm("Delete this note?") && run({ type: "note.delete", id: note.id }, "Note deleted")}
          >
            Delete
          </button>
        </div>
      </form>
    );
  }

  return (
    <article className="note">
      <header className="note-head">
        <button type="button" className="note-title" onClick={() => setEditing(true)} title="Edit note">
          {note.title}
        </button>
        <div className="ti-meta">
          <span>{longDate(note.date)}</span>
          {showProject && (
            <Link href={projectHref(note.project_id)} className="ti-project">
              {projectName}
            </Link>
          )}
        </div>
      </header>
      {note.body.length === 1 ? (
        <p className="note-body">{note.body[0]}</p>
      ) : (
        <ul className="note-body">
          {note.body.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
