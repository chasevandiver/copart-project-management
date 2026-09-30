"use client";

import { useRef, useState } from "react";
import { PRIORITIES, type Priority } from "@/lib/tracker";
import { useApp } from "./App";

export type CaptureKind = "task" | "idea" | "note" | "question";

const KINDS: { kind: CaptureKind; label: string; placeholder: string }[] = [
  { kind: "task", label: "Action item", placeholder: "What needs doing?" },
  { kind: "idea", label: "Idea", placeholder: "Capture an idea..." },
  { kind: "note", label: "Note", placeholder: "Title (optional)" },
  { kind: "question", label: "Question", placeholder: "What do you need to ask?" },
];

// One place to capture anything. Pick the kind, type, press Enter (Ctrl+Enter in notes).
export default function Capture({
  projectId,
  defaultKind = "task",
  kinds,
  compact = false,
}: {
  projectId?: string;
  defaultKind?: CaptureKind;
  kinds?: CaptureKind[];
  compact?: boolean;
}) {
  const { projects, owners, save, canEdit } = useApp();
  const [kind, setKind] = useState<CaptureKind>(defaultKind);
  const [text, setText] = useState("");
  const [body, setBody] = useState("");
  const [ask, setAsk] = useState("");
  const [project, setProject] = useState(projectId ?? "general");
  const [more, setMore] = useState(false);
  const [owner, setOwner] = useState("Me");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [busy, setBusy] = useState(false);
  const first = useRef<HTMLInputElement>(null);

  const shown = KINDS.filter((k) => !kinds || kinds.includes(k.kind));
  const current = KINDS.find((k) => k.kind === kind)!;
  const ready = kind === "note" ? body.trim() : kind === "question" ? text.trim() && ask.trim() : text.trim();

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    let ok = false;
    if (kind === "note") {
      ok = await save({ type: "note.add", project_id: project, title: text, text: body }, "Note saved");
    } else if (kind === "question") {
      ok = await save({ type: "question.add", question: text, ask, project_id: project }, `Added to ask ${ask}`);
    } else {
      ok = await save(
        {
          type: "task.add",
          fields: { title: text, project_id: project, owner, priority, due: due || null, ...(kind === "idea" ? { idea: true } : {}) },
        },
        kind === "idea" ? "Idea saved" : "Action item added"
      );
    }
    setBusy(false);
    if (ok) {
      setText("");
      setBody("");
      setDue("");
      setPriority("normal");
      first.current?.focus();
    }
  }

  const askList = owners.filter((o) => o !== "Me");

  return (
    <form className={`capture${compact ? " compact" : ""}`} onSubmit={submit}>
      {shown.length > 1 && (
        <div className="seg" role="group" aria-label="What are you adding?">
          {shown.map((k) => (
            <button key={k.kind} type="button" className={kind === k.kind ? "on" : ""} onClick={() => setKind(k.kind)}>
              {k.label}
            </button>
          ))}
        </div>
      )}
      <div className="capture-row">
        <input
          ref={first}
          className="qa-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={current.placeholder}
          maxLength={kind === "question" ? 300 : 200}
          disabled={!canEdit}
        />
        {kind === "question" && (
          <>
            <input
              list="capture-ask"
              className="ask-input"
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
              placeholder="Ask whom?"
              maxLength={60}
              disabled={!canEdit}
            />
            <datalist id="capture-ask">
              {askList.map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
          </>
        )}
        {!projectId && (
          <select value={project} onChange={(e) => setProject(e.target.value)} aria-label="Project">
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
        {(kind === "task" || kind === "idea") && (
          <button type="button" className="ghost" onClick={() => setMore(!more)} aria-expanded={more}>
            {more ? "Less" : "Details"}
          </button>
        )}
        {kind !== "note" && (
          <button type="submit" disabled={busy || !ready || !canEdit}>
            Add
          </button>
        )}
      </div>
      {kind === "note" && (
        <div className="capture-note">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
            }}
            rows={4}
            placeholder={"Meeting notes, thoughts, anything. One point per line.\nCtrl+Enter to save."}
            maxLength={10000}
            disabled={!canEdit}
          />
          <button type="submit" disabled={busy || !ready || !canEdit}>
            Save note
          </button>
        </div>
      )}
      {more && (kind === "task" || kind === "idea") && (
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
