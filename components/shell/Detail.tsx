"use client";

import { useEffect, useState } from "react";
import { PRIORITIES, STATUSES, type Decision, type Note, type Question, type Task, type WaitingOn } from "@/lib/tracker";
import type { Op, TaskFields } from "@/lib/ops";
import { addDaysISO, longDate, mondayIndex, shortDate } from "@/lib/dates";
import { useApp } from "../App";
import { useSelection } from "./select";
import { Icon } from "./Icon";

// Right-hand panel for whatever item is in ?item=. One place to edit anything.
export default function Detail() {
  const { tracker } = useApp();
  const sel = useSelection();

  useEffect(() => {
    if (!sel.current) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key === "Escape" && el.tagName !== "SELECT") sel.close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel]);

  if (!sel.current) return null;
  const [kind, id] = sel.current.split(/:(.*)/s);
  let body: React.ReactNode = null;
  if (kind === "task") {
    const v = tracker.tasks.find((x) => x.id === id);
    if (v) body = <TaskDetail key={v.id + v.updated} v={v} />;
  } else if (kind === "question") {
    const v = tracker.questions.find((x) => x.id === id);
    if (v) body = <QuestionDetail key={v.id + v.status + (v.answer ?? "")} v={v} />;
  } else if (kind === "note") {
    const v = tracker.notes.find((x) => x.id === id);
    if (v) body = <NoteDetail key={v.id + v.date + v.title + v.body.length} v={v} />;
  } else if (kind === "waiting") {
    const v = tracker.waiting_on.find((x) => x.id === id);
    if (v) body = <WaitingDetail key={v.id + (v.received ?? "")} v={v} />;
  } else if (kind === "decision") {
    const v = tracker.decisions.find((x) => x.id === id);
    if (v) body = <DecisionDetail key={v.id + v.status} v={v} />;
  }

  return (
    <>
      <div className="s-detail-back" onClick={sel.close} />
      <aside className="s-detail" aria-label="Item details">
        <button type="button" className="s-icon-btn s-detail-close" onClick={sel.close} aria-label="Close">
          <Icon name="close" />
        </button>
        {body ?? <p className="s-empty">This item is gone. It may have been deleted or moved.</p>}
      </aside>
    </>
  );
}

/* ---------- shared bits ---------- */

function useSaver() {
  const { save, canEdit } = useApp();
  const sel = useSelection();
  const [busy, setBusy] = useState(false);
  const run = async (op: Op, msg: string, close = false) => {
    setBusy(true);
    const ok = await save(op, msg);
    setBusy(false);
    if (ok && close) sel.close();
    return ok;
  };
  return { run, busy, canEdit };
}

function ProjectSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { projects } = useApp();
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

function PeopleInput({ value, onChange, withMe }: { value: string; onChange: (v: string) => void; withMe?: boolean }) {
  const { owners } = useApp();
  const list = withMe ? owners : owners.filter((o) => o !== "Me");
  return (
    <>
      <input list="detail-people" value={value} onChange={(e) => onChange(e.target.value)} maxLength={60} />
      <datalist id="detail-people">
        {list.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </>
  );
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`s-field${wide ? " wide" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

/** Fallback height for title boxes in browsers without CSS field-sizing. */
function rowsFor(text: string): number {
  return Math.min(5, Math.max(1, Math.ceil(text.length / 30)));
}

function Stamp({ parts }: { parts: (string | false | null | undefined)[] }) {
  return <p className="s-stamp">{parts.filter(Boolean).join(" · ")}</p>;
}

/* ---------- task and idea ---------- */

function TaskDetail({ v }: { v: Task }) {
  const { today } = useApp();
  const { run, busy, canEdit } = useSaver();
  const [f, setF] = useState({
    title: v.title,
    project_id: v.project_id,
    owner: v.owner,
    due: v.due ?? "",
    priority: v.priority,
    status: v.status,
    notes: v.notes,
  });
  const set = <K extends keyof typeof f>(k: K, val: (typeof f)[K]) => setF({ ...f, [k]: val });
  const done = v.status === "Done";

  const changes: TaskFields = {};
  if (f.title.trim() !== v.title) changes.title = f.title;
  if (f.project_id !== v.project_id) changes.project_id = f.project_id;
  if (f.owner.trim() && f.owner !== v.owner) changes.owner = f.owner;
  if ((f.due || null) !== v.due) changes.due = f.due || null;
  if (f.priority !== v.priority) changes.priority = f.priority;
  if (f.status !== v.status) changes.status = f.status;
  if (f.notes !== v.notes) changes.notes = f.notes;
  const dirty = Object.keys(changes).length > 0;
  // Moving to another project renumbers the task, so close the panel after that save.
  const saveIt = () =>
    dirty && run({ type: "task.update", id: v.id, fields: changes }, changes.project_id ? "Moved" : "Saved", !!changes.project_id);

  const t = today ?? v.created;
  const quick: [string, string][] = [
    ["Today", t],
    ["Tomorrow", addDaysISO(t, 1)],
    ["Next week", addDaysISO(t, 7 - mondayIndex(t))],
  ];

  return (
    <form
      className="s-detail-body"
      onSubmit={(e) => {
        e.preventDefault();
        saveIt();
      }}
      onKeyDown={(e) => e.key === "Enter" && (e.metaKey || e.ctrlKey) && saveIt()}
    >
      <div className="s-detail-kind">{v.idea ? "Idea" : done ? "Done" : "To do"}</div>
      <div className="s-detail-titlebar">
        {!v.idea && (
          <button
            type="button"
            className={`s-check big p-${v.priority}${done ? " on" : ""}`}
            role="checkbox"
            aria-checked={done}
            aria-label={done ? "Mark not done" : "Mark done"}
            disabled={busy || !canEdit}
            onClick={() => run({ type: "task.toggle", id: v.id, done: !done }, done ? "Reopened" : v.recurring ? "Done. Next one is in a week." : "Done")}
          >
            <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden>
              <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <textarea className="s-title-input" value={f.title} onChange={(e) => set("title", e.target.value.replace(/\n/g, " "))} rows={rowsFor(f.title)} maxLength={200} />
      </div>

      <div className="s-fields">
        <Field label="Where">
          <ProjectSelect value={f.project_id} onChange={(x) => set("project_id", x)} />
        </Field>
        <Field label="Who does it">
          <PeopleInput value={f.owner} onChange={(x) => set("owner", x)} withMe />
        </Field>
        <Field label={f.due ? `Due ${longDate(f.due)}` : "Due"} wide>
          <div className="s-due-row">
            <input type="date" value={f.due} onChange={(e) => set("due", e.target.value)} />
            {quick.map(([label, d]) => (
              <button key={label} type="button" className={`s-chip-btn${f.due === d ? " on" : ""}`} onClick={() => set("due", d)}>
                {label}
              </button>
            ))}
            {f.due && (
              <button type="button" className="s-chip-btn" onClick={() => set("due", "")}>
                Clear
              </button>
            )}
          </div>
        </Field>
        <Field label="Priority" wide>
          <div className="s-seg">
            {PRIORITIES.map((p) => (
              <button key={p} type="button" className={f.priority === p ? `on ${p}` : ""} onClick={() => set("priority", p)}>
                {p}
              </button>
            ))}
          </div>
        </Field>
        {!v.idea && (
          <Field label="Status">
            <select value={f.status} onChange={(e) => set("status", e.target.value as Task["status"])}>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Notes" wide>
          <textarea value={f.notes} onChange={(e) => set("notes", e.target.value)} rows={6} maxLength={2000} placeholder="Details, links, context..." />
        </Field>
      </div>

      <div className="s-detail-actions">
        <button type="submit" className="s-btn primary" disabled={!dirty || busy || !canEdit}>
          {dirty ? "Save changes" : "Saved"}
        </button>
        {v.idea && (
          <>
            <button type="button" className="s-btn" disabled={busy} onClick={() => run({ type: "idea.promote", id: v.id }, "Now a to-do")}>
              Make it a to-do
            </button>
            <button
              type="button"
              className="s-btn danger"
              disabled={busy}
              onClick={() => confirm("Delete this idea?") && run({ type: "idea.drop", id: v.id }, "Idea deleted", true)}
            >
              Delete
            </button>
          </>
        )}
      </div>
      <Stamp
        parts={[
          `Added ${shortDate(v.created)}`,
          v.completed && done && `done ${shortDate(v.completed)}`,
          v.recurring && "repeats weekly",
          v.id,
        ]}
      />
    </form>
  );
}

/* ---------- question ---------- */

function QuestionDetail({ v }: { v: Question }) {
  const { run, busy, canEdit } = useSaver();
  const [q, setQ] = useState(v.question);
  const [ask, setAsk] = useState(v.ask);
  const [pid, setPid] = useState(v.project_id);
  const [answer, setAnswer] = useState(v.answer ?? "");
  const answered = v.status === "answered";
  const dirty = q.trim() !== v.question || ask.trim() !== v.ask || pid !== v.project_id;

  return (
    <div className="s-detail-body">
      <div className="s-detail-kind">{answered ? "Answered question" : "Question"}</div>
      <textarea className="s-title-input" value={q} onChange={(e) => setQ(e.target.value.replace(/\n/g, " "))} rows={rowsFor(q)} maxLength={300} />
      <div className="s-fields">
        <Field label="Ask whom">
          <PeopleInput value={ask} onChange={setAsk} />
        </Field>
        <Field label="Where">
          <ProjectSelect value={pid} onChange={setPid} />
        </Field>
      </div>
      {dirty && (
        <div className="s-detail-actions">
          <button
            type="button"
            className="s-btn primary"
            disabled={busy || !canEdit}
            onClick={() => run({ type: "question.update", id: v.id, question: q, ask, project_id: pid }, "Saved")}
          >
            Save changes
          </button>
        </div>
      )}

      <div className="s-answer-box">
        <Field label={answered ? `${v.ask} said` : `What did ${v.ask} say?`} wide>
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} maxLength={2000} placeholder="Type the answer when you get it" />
        </Field>
        <div className="s-detail-actions">
          <button
            type="button"
            className="s-btn primary"
            disabled={busy || !canEdit || !answer.trim() || answer.trim() === (v.answer ?? "")}
            onClick={() => run({ type: "question.answer", id: v.id, answer }, "Answer saved")}
          >
            {answered ? "Update answer" : "Save answer"}
          </button>
          {answered && (
            <button type="button" className="s-btn" disabled={busy} onClick={() => run({ type: "question.reopen", id: v.id }, "Back to open")}>
              Mark unanswered
            </button>
          )}
          <button
            type="button"
            className="s-btn danger"
            disabled={busy}
            onClick={() => confirm("Delete this question?") && run({ type: "question.delete", id: v.id }, "Deleted", true)}
          >
            Delete
          </button>
        </div>
      </div>
      <Stamp parts={[`Added ${shortDate(v.raised)}`, v.answered && `answered ${shortDate(v.answered)}`, v.id]} />
    </div>
  );
}

/* ---------- note ---------- */

function NoteDetail({ v }: { v: Note }) {
  const { run, busy, canEdit } = useSaver();
  const [title, setTitle] = useState(v.title);
  const [text, setText] = useState(v.body.join("\n"));
  const [pid, setPid] = useState(v.project_id);
  const [date, setDate] = useState(v.date);
  const dirty = title !== v.title || text !== v.body.join("\n") || pid !== v.project_id || date !== v.date;
  const saveIt = () => dirty && run({ type: "note.update", id: v.id, title, text, project_id: pid, date }, "Note saved");

  return (
    <div className="s-detail-body" onKeyDown={(e) => e.key === "Enter" && (e.metaKey || e.ctrlKey) && saveIt()}>
      <div className="s-detail-kind">Note</div>
      <textarea className="s-title-input" value={title} onChange={(e) => setTitle(e.target.value.replace(/\n/g, " "))} rows={rowsFor(title)} maxLength={200} />
      <div className="s-fields">
        <Field label="Where">
          <ProjectSelect value={pid} onChange={setPid} />
        </Field>
        <Field label="Date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
      </div>
      <textarea className="s-note-text" value={text} onChange={(e) => setText(e.target.value)} rows={14} maxLength={10000} />
      <div className="s-detail-actions">
        <button type="button" className="s-btn primary" disabled={!dirty || busy || !canEdit} onClick={saveIt}>
          {dirty ? "Save note" : "Saved"}
        </button>
        <button
          type="button"
          className="s-btn danger"
          disabled={busy}
          onClick={() => confirm("Delete this note?") && run({ type: "note.delete", id: v.id }, "Note deleted", true)}
        >
          Delete
        </button>
      </div>
      <Stamp parts={[v.id]} />
    </div>
  );
}

/* ---------- waiting on ---------- */

function WaitingDetail({ v }: { v: WaitingOn }) {
  const { run, busy, canEdit } = useSaver();
  const [what, setWhat] = useState(v.what);
  const [who, setWho] = useState(v.from_whom);
  const [pid, setPid] = useState(v.project_id);
  const [notes, setNotes] = useState(v.notes);
  const dirty = what !== v.what || who !== v.from_whom || pid !== v.project_id || notes !== v.notes;

  return (
    <div className="s-detail-body">
      <div className="s-detail-kind">{v.received ? "Received" : "Waiting on"}</div>
      <textarea className="s-title-input" value={what} onChange={(e) => setWhat(e.target.value.replace(/\n/g, " "))} rows={rowsFor(what)} maxLength={200} />
      <div className="s-fields">
        <Field label="From">
          <PeopleInput value={who} onChange={setWho} />
        </Field>
        <Field label="Where">
          <ProjectSelect value={pid} onChange={setPid} />
        </Field>
        <Field label="Notes" wide>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} maxLength={2000} />
        </Field>
      </div>
      <div className="s-detail-actions">
        {v.received ? (
          <button type="button" className="s-btn" disabled={busy || !canEdit} onClick={() => run({ type: "waiting.reopen", id: v.id }, "Back to waiting")}>
            Still waiting
          </button>
        ) : (
          <button type="button" className="s-btn primary" disabled={busy || !canEdit} onClick={() => run({ type: "waiting.clear", id: v.id }, `Received from ${v.from_whom}`)}>
            Got it
          </button>
        )}
        <button
          type="button"
          className="s-btn"
          disabled={!dirty || busy || !canEdit}
          onClick={() => run({ type: "waiting.update", id: v.id, what, from_whom: who, project_id: pid, notes }, "Saved")}
        >
          Save changes
        </button>
      </div>
      <Stamp parts={[`Since ${shortDate(v.since)}`, v.received && `received ${shortDate(v.received)}`, v.id]} />
    </div>
  );
}

/* ---------- decision ---------- */

function DecisionDetail({ v }: { v: Decision }) {
  const { run, busy, canEdit } = useSaver();
  const [other, setOther] = useState("");
  const decided = v.status === "resolved";
  return (
    <div className="s-detail-body">
      <div className="s-detail-kind">{decided ? "Decided" : "Decision to make"}</div>
      <h2 className="s-title-static">{v.question}</h2>
      {decided ? (
        <div className="s-answer-box">
          <div className="s-field wide">
            <span>Answer</span>
            <p className="s-answer-text">{v.answer}</p>
          </div>
        </div>
      ) : (
        <>
          <p className="s-muted">Pick one to decide:</p>
          <div className="s-options">
            {v.options.map((o) => (
              <button key={o} type="button" className="s-option" disabled={busy || !canEdit} onClick={() => run({ type: "decision.resolve", id: v.id, answer: o }, "Decided")}>
                {o}
              </button>
            ))}
          </div>
          <div className="s-inline">
            <input value={other} onChange={(e) => setOther(e.target.value)} placeholder="Or type another answer" maxLength={300} />
            <button type="button" className="s-btn" disabled={!other.trim() || busy} onClick={() => run({ type: "decision.resolve", id: v.id, answer: other }, "Decided")}>
              Decide
            </button>
          </div>
        </>
      )}
      <Stamp parts={[`Raised ${shortDate(v.raised)}`, v.resolved && `decided ${shortDate(v.resolved)}`, v.id]} />
    </div>
  );
}
