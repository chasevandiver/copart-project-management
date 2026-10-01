"use client";

import { useEffect, useState } from "react";
import type { Report } from "@/lib/tracker";
import { useApp } from "../App";
import { Icon } from "./Icon";

// Copy, print and edit for the weekly update. Edit holds Chase's own words for the week.
export default function ReportTools({ weekEnding, saved, text }: { weekEnding: string; saved: Report | null; text: string }) {
  const { save, canEdit } = useApp();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const blank = { headline: "", wins: "", next: "", asks: "" };
  const [f, setF] = useState(blank);

  useEffect(() => {
    if (!open) return;
    setF(saved ? { headline: saved.headline, wins: saved.wins.join("\n"), next: saved.next.join("\n"), asks: saved.asks.join("\n") } : blank);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, saved]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy the update:", text);
    }
  }

  async function submit() {
    if (busy) return;
    setBusy(true);
    const ok = await save({ type: "report.save", week_ending: weekEnding, ...f }, "Saved");
    setBusy(false);
    if (ok) setOpen(false);
  }

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <>
      <button type="button" className="s-btn" onClick={copy}>
        <Icon name="copy" size={14} /> {copied ? "Copied" : "Copy text"}
      </button>
      <button type="button" className="s-btn" onClick={() => window.print()}>
        <Icon name="print" size={14} /> Print or PDF
      </button>
      <button type="button" className="s-btn primary" onClick={() => setOpen(true)} disabled={!canEdit}>
        <Icon name="edit" size={14} /> Edit
      </button>
      {open && (
        <div className="s-modal-back" onMouseDown={() => setOpen(false)}>
          <div className="s-modal" role="dialog" aria-modal="true" aria-label="Edit weekly update" onMouseDown={(e) => e.stopPropagation()}>
            <div className="s-fields r-form">
              <label className="s-wide">
                <span>Headline for the week</span>
                <input value={f.headline} onChange={set("headline")} maxLength={300} placeholder="Leads map now covers 28 states plus DC" autoFocus />
              </label>
              <label className="s-wide">
                <span>Highlights, one per line (the wins Ken can share)</span>
                <textarea rows={5} value={f.wins} onChange={set("wins")} />
              </label>
              <label className="s-wide">
                <span>Next week, one per line (blank uses your dated to-dos)</span>
                <textarea rows={3} value={f.next} onChange={set("next")} />
              </label>
              <label className="s-wide">
                <span>Where I could use Ken's help, one per line (open questions for Ken are added on their own)</span>
                <textarea rows={3} value={f.asks} onChange={set("asks")} />
              </label>
            </div>
            <div className="s-modal-foot">
              <span className="s-hint">Saved for the week ending {weekEnding}.</span>
              <div className="s-modal-actions">
                <button type="button" className="s-btn ghost" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="s-btn primary" onClick={submit} disabled={busy || !canEdit}>
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
