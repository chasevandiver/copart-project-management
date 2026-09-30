"use client";

import Link from "next/link";
import { useState } from "react";
import { projectHref, type Question } from "@/lib/tracker";
import { shortDate } from "@/lib/dates";
import { useApp } from "./App";

export default function QuestionItem({
  q,
  showAsk = true,
  showProject = true,
}: {
  q: Question;
  showAsk?: boolean;
  showProject?: boolean;
}) {
  const { projects, owners, save, canEdit } = useApp();
  const [mode, setMode] = useState<"view" | "answer" | "edit">("view");
  const [answer, setAnswer] = useState("");
  const [f, setF] = useState({ question: q.question, ask: q.ask, project_id: q.project_id });
  const [busy, setBusy] = useState(false);
  const projectName = projects.find((p) => p.id === q.project_id)?.name ?? "General";
  const answered = q.status === "answered";

  async function run(op: Parameters<typeof save>[0], msg: string) {
    setBusy(true);
    const ok = await save(op, msg);
    setBusy(false);
    if (ok) {
      setMode("view");
      setAnswer("");
    }
  }

  return (
    <div className={`ti ti-row qitem${answered ? " is-done" : ""}`}>
      <span className="q-mark" aria-hidden>
        ?
      </span>
      <div className="ti-main">
        <button type="button" className="ti-title" onClick={() => setMode(mode === "edit" ? "view" : "edit")} aria-expanded={mode === "edit"}>
          {q.question}
        </button>
        <div className="ti-meta">
          {showAsk && <span className="ask-chip">Ask {q.ask}</span>}
          {showProject && (
            <Link href={projectHref(q.project_id)} className="ti-project">
              {projectName}
            </Link>
          )}
          <span>{answered && q.answered ? `Answered ${shortDate(q.answered)}` : `Added ${shortDate(q.raised)}`}</span>
          <span className="ti-id">{q.id}</span>
        </div>
        {answered && q.answer && <p className="q-answer">{q.answer}</p>}

        {mode === "answer" && (
          <form
            className="inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              run({ type: "question.answer", id: q.id, answer }, "Answer saved");
            }}
          >
            <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder={`What did ${q.ask} say?`} maxLength={2000} autoFocus />
            <button type="submit" disabled={busy || !answer.trim()}>
              Save
            </button>
            <button type="button" className="ghost" onClick={() => setMode("view")}>
              Cancel
            </button>
          </form>
        )}

        {mode === "edit" && (
          <form
            className="editor"
            onSubmit={(e) => {
              e.preventDefault();
              run({ type: "question.update", id: q.id, ...f }, "Saved");
            }}
          >
            <label className="full">
              <span>Question</span>
              <input value={f.question} onChange={(e) => setF({ ...f, question: e.target.value })} maxLength={300} required />
            </label>
            <label>
              <span>Ask whom</span>
              <input list="qi-ask" value={f.ask} onChange={(e) => setF({ ...f, ask: e.target.value })} maxLength={60} required />
              <datalist id="qi-ask">
                {owners.filter((o) => o !== "Me").map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            </label>
            <label>
              <span>Project</span>
              <select value={f.project_id} onChange={(e) => setF({ ...f, project_id: e.target.value })}>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="editor-actions full">
              <button type="submit" disabled={busy || !canEdit}>
                Save
              </button>
              <button type="button" className="ghost" onClick={() => setMode("view")}>
                Cancel
              </button>
              {answered && (
                <button type="button" className="ghost" disabled={busy} onClick={() => run({ type: "question.reopen", id: q.id }, "Reopened")}>
                  Mark unanswered
                </button>
              )}
              <button
                type="button"
                className="ghost danger"
                disabled={busy}
                onClick={() => confirm("Delete this question?") && run({ type: "question.delete", id: q.id }, "Question deleted")}
              >
                Delete
              </button>
            </div>
          </form>
        )}
      </div>
      {!answered && mode === "view" && (
        <button type="button" className="ghost small-btn" onClick={() => setMode("answer")} disabled={!canEdit}>
          Answer
        </button>
      )}
    </div>
  );
}
