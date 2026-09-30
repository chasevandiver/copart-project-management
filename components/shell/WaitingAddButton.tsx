"use client";

import { useState } from "react";
import { useApp } from "../App";

// Small inline form: what, from whom, where.
export default function WaitingAddButton({ projectId }: { projectId?: string }) {
  const { projects, owners, save, canEdit } = useApp();
  const [open, setOpen] = useState(false);
  const [what, setWhat] = useState("");
  const [who, setWho] = useState("");
  const [pid, setPid] = useState(projectId ?? "general");
  const [busy, setBusy] = useState(false);
  if (!open)
    return (
      <button type="button" className="s-btn" onClick={() => setOpen(true)} disabled={!canEdit}>
        + Waiting on someone
      </button>
    );
  return (
    <form
      className="s-inline wrap"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const ok = await save({ type: "waiting.add", what, from_whom: who, project_id: pid }, `Waiting on ${who}`);
        setBusy(false);
        if (ok) {
          setWhat("");
          setOpen(false);
        }
      }}
    >
      <input value={what} onChange={(e) => setWhat(e.target.value)} placeholder="Waiting on what?" maxLength={200} autoFocus />
      <input list="wa-people" value={who} onChange={(e) => setWho(e.target.value)} placeholder="From whom" maxLength={60} />
      <datalist id="wa-people">
        {owners.filter((o) => o !== "Me").map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
      {!projectId && (
        <select value={pid} onChange={(e) => setPid(e.target.value)}>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}
      <button type="submit" className="s-btn primary" disabled={busy || !what.trim() || !who.trim()}>
        Add
      </button>
      <button type="button" className="s-btn ghost" onClick={() => setOpen(false)}>
        Cancel
      </button>
    </form>
  );
}
