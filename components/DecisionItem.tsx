"use client";

import { useState } from "react";
import type { Decision } from "@/lib/tracker";
import { shortDate } from "@/lib/dates";
import { useApp } from "./App";

export default function DecisionItem({ d }: { d: Decision }) {
  const { save, canEdit } = useApp();
  const [other, setOther] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function resolve(answer: string) {
    setBusy(true);
    await save({ type: "decision.resolve", id: d.id, answer }, "Decision recorded");
    setBusy(false);
  }

  if (d.status === "resolved") {
    return (
      <div className="decision">
        <div className="decision-q">{d.question}</div>
        <div className="small">
          <strong>{d.answer}</strong> <span className="muted">· decided {d.resolved && shortDate(d.resolved)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="decision">
      <div className="decision-q">{d.question}</div>
      <div className="muted small">Raised {shortDate(d.raised)} · pick one to decide</div>
      <div className="decision-opts">
        {d.options.map((o) => (
          <button key={o} type="button" className="opt" disabled={busy || !canEdit} onClick={() => resolve(o)}>
            {o}
          </button>
        ))}
        <button type="button" className="opt ghost" onClick={() => setOther(!other)} disabled={!canEdit}>
          Other...
        </button>
      </div>
      {other && (
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim()) resolve(text);
          }}
        >
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Your answer" maxLength={300} autoFocus />
          <button type="submit" disabled={busy || !text.trim()}>
            Decide
          </button>
        </form>
      )}
    </div>
  );
}
