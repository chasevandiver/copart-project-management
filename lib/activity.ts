// Everything that happened, as dated events. Built from dates already stored on items,
// so the history needs no separate log.
import type { Tracker } from "./tracker";

export type EventKind = "done" | "decided" | "answered" | "received" | "note" | "asked" | "added" | "idea";

export type ActivityEvent = {
  date: string;
  kind: EventKind;
  id: string;
  title: string;
  project_id: string;
  who?: string;
  detail?: string;
};

export const KIND_LABEL: Record<EventKind, string> = {
  done: "Completed",
  decided: "Decided",
  answered: "Answered",
  received: "Received",
  note: "Notes",
  asked: "Questions added",
  added: "Action items added",
  idea: "Ideas added",
};

export const KIND_ORDER: EventKind[] = ["done", "decided", "answered", "received", "note", "asked", "added", "idea"];

export function activity(t: Tracker): ActivityEvent[] {
  const ev: ActivityEvent[] = [];
  for (const x of t.tasks) {
    const base = { id: x.id, title: x.title, project_id: x.project_id, who: x.owner };
    ev.push({ ...base, date: x.created, kind: x.idea ? "idea" : "added" });
    if (x.status === "Done") ev.push({ ...base, date: x.completed ?? x.updated, kind: "done" });
    else if (x.recurring && x.completed) ev.push({ ...base, date: x.completed, kind: "done", detail: "Weekly" });
  }
  for (const d of t.decisions) {
    if (d.status === "resolved" && d.resolved) {
      ev.push({ date: d.resolved, kind: "decided", id: d.id, title: d.question, project_id: d.project_id, detail: d.answer ?? undefined });
    }
  }
  for (const q of t.questions) {
    ev.push({ date: q.raised, kind: "asked", id: q.id, title: q.question, project_id: q.project_id, who: q.ask });
    if (q.status === "answered" && q.answered) {
      ev.push({ date: q.answered, kind: "answered", id: q.id, title: q.question, project_id: q.project_id, who: q.ask, detail: q.answer ?? undefined });
    }
  }
  for (const w of t.waiting_on) {
    if (w.received) ev.push({ date: w.received, kind: "received", id: w.id, title: w.what, project_id: w.project_id, who: w.from_whom });
  }
  for (const n of t.notes) {
    ev.push({ date: n.date, kind: "note", id: n.id, title: n.title, project_id: n.project_id });
  }
  return ev.sort((a, b) => b.date.localeCompare(a.date));
}
