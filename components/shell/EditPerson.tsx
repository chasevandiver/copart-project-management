"use client";

import { useEffect, useState } from "react";
import type { Person } from "@/lib/tracker";
import { personSlug } from "@/lib/views";
import { useApp } from "../App";
import { Icon } from "./Icon";

// Edit button and form for a person page. A rename moves their questions,
// waiting-on items and tasks to the new name and opens the new page.
export default function EditPerson({ person }: { person: Person }) {
  const { save, canEdit } = useApp();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(person);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setF(person);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, person]);

  const set = (k: keyof Person) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const name = f.name.replace(/\s+/g, " ").trim();

  async function submit() {
    if (!name || busy) return;
    setBusy(true);
    const ok = await save(
      { type: "person.update", name: person.name, fields: { name, title: f.title, department: f.department, relationship: f.relationship, contact: f.contact } },
      "Saved"
    );
    setBusy(false);
    if (!ok) return;
    setOpen(false);
    if (name !== person.name) window.location.assign(`/people/${personSlug(name)}`);
  }

  return (
    <>
      <button type="button" className="s-btn ghost" onClick={() => setOpen(true)} disabled={!canEdit}>
        <Icon name="edit" size={14} /> Edit
      </button>
      {open && (
        <div className="s-modal-back" onMouseDown={() => setOpen(false)}>
          <div className="s-modal" role="dialog" aria-modal="true" aria-label={`Edit ${person.name}`} onMouseDown={(e) => e.stopPropagation()}>
            <input
              className="s-modal-input"
              value={f.name}
              onChange={set("name")}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Name"
              maxLength={60}
              autoFocus
            />
            <div className="s-fields">
              <label>
                <span>Title</span>
                <input value={f.title} onChange={set("title")} maxLength={100} />
              </label>
              <label>
                <span>Department</span>
                <input value={f.department} onChange={set("department")} maxLength={60} />
              </label>
              <label className="s-wide">
                <span>How you work together</span>
                <input value={f.relationship} onChange={set("relationship")} maxLength={200} />
              </label>
              <label className="s-wide">
                <span>Contact (work phone or where to find them)</span>
                <input value={f.contact} onChange={set("contact")} maxLength={100} />
              </label>
            </div>
            <div className="s-modal-foot">
              <span className="s-hint">Renaming keeps their questions, waiting-on items and tasks with them.</span>
              <div className="s-modal-actions">
                <button type="button" className="s-btn ghost" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="s-btn primary" onClick={submit} disabled={!name || busy || !canEdit}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
