"use client";

import Link from "next/link";
import { useState } from "react";
import { projectHref, type WaitingOn } from "@/lib/tracker";
import { daysBetween, shortDate } from "@/lib/dates";
import { useApp } from "./App";

export function WaitingItem({ w, showProject = true }: { w: WaitingOn; showProject?: boolean }) {
  const { projects, today, save, canEdit } = useApp();
  const [busy, setBusy] = useState(false);
  const days = today ? daysBetween(w.since, today) : 0;
  const received = !!w.received;
  const project = projects.find((p) => p.id === w.project_id)?.name ?? "General";

  return (
    <div className={`ti ti-row p-${w.priority}${received ? " is-done" : ""}`}>
      <div className="ti-main">
        <div className="ti-title static">{w.what}</div>
        <div className="ti-meta">
          {showProject && (
            <Link href={projectHref(w.project_id)} className="ti-project">
              {project}
            </Link>
          )}
          {received && w.received ? (
            <span>Received {shortDate(w.received)}</span>
          ) : (
            <span className={days > 7 ? "warn" : undefined}>
              Since {shortDate(w.since)}
              {days > 0 && ` · ${days} ${days === 1 ? "day" : "days"}`}
            </span>
          )}
          {w.priority === "high" && <span className="warn">High</span>}
          {w.priority === "urgent" && <span className="bad">Urgent</span>}
        </div>
        {w.notes && <p className="ti-notes">{w.notes}</p>}
      </div>
      <button
        type="button"
        className="ghost small-btn"
        disabled={busy || !canEdit}
        onClick={async () => {
          setBusy(true);
          if (received) await save({ type: "waiting.reopen", id: w.id }, "Back on waiting");
          else await save({ type: "waiting.clear", id: w.id }, `Received from ${w.from_whom}`);
          setBusy(false);
        }}
      >
        {received ? "Still waiting" : "Got it"}
      </button>
    </div>
  );
}

export function WaitingAdd({ projectId }: { projectId?: string }) {
  const { projects, owners, save, canEdit } = useApp();
  const [what, setWhat] = useState("");
  const [who, setWho] = useState("");
  const [project, setProject] = useState(projectId ?? "general");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="qa"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const ok = await save({ type: "waiting.add", what, from_whom: who, project_id: project }, "Added to waiting on");
        setBusy(false);
        if (ok) {
          setWhat("");
        }
      }}
    >
      <div className="qa-row">
        <input className="qa-input" value={what} onChange={(e) => setWhat(e.target.value)} placeholder="Waiting on what?" maxLength={200} disabled={!canEdit} />
        <input
          list="waiting-who"
          value={who}
          onChange={(e) => setWho(e.target.value)}
          placeholder="From whom"
          maxLength={60}
          style={{ width: 140 }}
          disabled={!canEdit}
        />
        <datalist id="waiting-who">
          {owners.filter((o) => o !== "Me").map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
        {!projectId && (
          <select value={project} onChange={(e) => setProject(e.target.value)} aria-label="Project">
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
        <button type="submit" disabled={busy || !what.trim() || !who.trim() || !canEdit}>
          Add
        </button>
      </div>
    </form>
  );
}
