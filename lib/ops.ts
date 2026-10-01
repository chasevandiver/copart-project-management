// Edits the board can make. Pure functions: take a tracker, return a changed copy.
// Server runs these on the latest tracker.json before committing, so a retry after a
// conflict just re-applies the op to the newer file.
import { addDaysISO } from "./dates";
import { CATEGORIES, PRIORITIES, STATUSES, type Category, type Priority, type Status, type Task, type Tracker } from "./tracker";

export type TaskFields = Partial<Pick<Task, "title" | "project_id" | "status" | "owner" | "priority" | "due" | "notes">>;

export type Op =
  | { type: "task.toggle"; id: string; done: boolean }
  | { type: "task.update"; id: string; fields: TaskFields }
  | { type: "task.add"; fields: TaskFields & { title: string; project_id: string; idea?: boolean } }
  | { type: "idea.promote"; id: string }
  | { type: "idea.drop"; id: string }
  | { type: "waiting.add"; what: string; from_whom: string; project_id: string }
  | { type: "waiting.clear"; id: string }
  | { type: "waiting.reopen"; id: string }
  | { type: "waiting.update"; id: string; what: string; from_whom: string; project_id: string; notes: string }
  | { type: "note.add"; project_id: string; title: string; text: string; date?: string }
  | { type: "note.update"; id: string; project_id: string; title: string; text: string; date?: string }
  | { type: "note.delete"; id: string }
  | { type: "question.add"; question: string; ask: string; project_id: string }
  | { type: "question.update"; id: string; question: string; ask: string; project_id: string }
  | { type: "question.answer"; id: string; answer: string }
  | { type: "question.reopen"; id: string }
  | { type: "question.delete"; id: string }
  | { type: "decision.resolve"; id: string; answer: string }
  | { type: "project.add"; id: string; name: string; category: string; status?: string; summary?: string; idea?: boolean };

export class OpError extends Error {}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function clean(s: unknown, max: number): string {
  if (typeof s !== "string") throw new OpError("Expected text");
  const v = s.replace(/\s+/g, " ").trim();
  if (v.length > max) throw new OpError(`Too long (max ${max} characters)`);
  return v;
}

function cleanNotes(s: unknown): string {
  if (typeof s !== "string") throw new OpError("Expected text");
  if (s.length > 2000) throw new OpError("Notes too long (max 2000 characters)");
  return s.trim();
}

function nextId(t: Tracker, projectId: string): string {
  const prefix = projectId === "general" ? "gen" : projectId;
  const nums = t.tasks
    .map((x) => x.id)
    .filter((id) => id.startsWith(prefix + "-"))
    .map((id) => parseInt(id.slice(prefix.length + 1), 10))
    .filter((n) => !Number.isNaN(n));
  const n = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}-${String(n).padStart(2, "0")}`;
}

function nextSimpleId(ids: string[], prefix: string): string {
  const nums = ids
    .filter((id) => id.startsWith(prefix + "-"))
    .map((id) => parseInt(id.slice(prefix.length + 1), 10))
    .filter((n) => !Number.isNaN(n));
  return `${prefix}-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(2, "0")}`;
}

/** Short project id from a name: initials of each word ("Dealer Hub" -> "dh"), unique. */
export function suggestProjectId(name: string, taken: string[]): string {
  const words = name.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  let base = words.length > 1 ? words.map((w) => w[0]).join("") : (words[0] ?? "").slice(0, 4);
  base = base.slice(0, 12) || "proj";
  if (base.length < 2) base = (words[0] ?? "p").slice(0, 3).padEnd(2, "x");
  const used = new Set([...taken, "general", "gen"]);
  let id = base;
  for (let n = 2; used.has(id); n++) id = `${base}${n}`;
  return id;
}

function checkProject(t: Tracker, id: string) {
  if (id !== "general" && !t.projects.some((p) => p.id === id)) throw new OpError("Unknown project");
}

/** Note text: keeps line breaks, one body entry per non-empty line. */
function noteBody(text: unknown): string[] {
  if (typeof text !== "string") throw new OpError("Expected text");
  if (text.length > 10000) throw new OpError("Note too long (max 10,000 characters)");
  const lines = text.split(/\r?\n/).map((l) => l.replace(/^\s*[-*\u2022]\s+/, "").trimEnd()).filter((l) => l.trim());
  if (!lines.length) throw new OpError("Note is empty");
  return lines;
}

function sanitizeFields(t: Tracker, f: TaskFields): TaskFields {
  const out: TaskFields = {};
  if (f.title !== undefined) {
    out.title = clean(f.title, 200);
    if (!out.title) throw new OpError("Title can't be empty");
  }
  if (f.project_id !== undefined) {
    if (f.project_id !== "general" && !t.projects.some((p) => p.id === f.project_id)) throw new OpError("Unknown project");
    out.project_id = f.project_id;
  }
  if (f.status !== undefined) {
    if (!STATUSES.includes(f.status as Status)) throw new OpError("Unknown status");
    out.status = f.status;
  }
  if (f.priority !== undefined) {
    if (!PRIORITIES.includes(f.priority as Priority)) throw new OpError("Unknown priority");
    out.priority = f.priority;
  }
  if (f.owner !== undefined) out.owner = clean(f.owner, 60);
  if (f.due !== undefined) {
    if (f.due !== null && !DATE.test(f.due)) throw new OpError("Due date must be YYYY-MM-DD");
    out.due = f.due;
  }
  if (f.notes !== undefined) out.notes = cleanNotes(f.notes);
  return out;
}

function findTask(t: Tracker, id: string): Task {
  const task = t.tasks.find((x) => x.id === id);
  if (!task) throw new OpError(`Task ${id} not found. It may have changed; refresh the page.`);
  return task;
}

/** Applies op to a deep copy of t. Returns the new tracker and a short commit summary. */
export function applyOp(input: Tracker, op: Op, today: string): { tracker: Tracker; summary: string } {
  if (!DATE.test(today)) throw new OpError("Bad date");
  const t: Tracker = structuredClone(input);
  t.meta.last_updated = today;
  let summary: string;

  switch (op.type) {
    case "task.toggle": {
      const task = findTask(t, op.id);
      if (op.done && task.recurring === "weekly") {
        // Recurring work rolls forward a week instead of closing.
        task.due = addDaysISO(task.due && task.due > today ? task.due : today, 7);
        task.completed = today;
        summary = `done ${task.id} (next ${task.due})`;
      } else if (op.done) {
        task.status = "Done";
        task.completed = today;
        summary = `done ${task.id}`;
      } else {
        task.status = "Next";
        task.completed = null;
        summary = `reopen ${task.id}`;
      }
      task.updated = today;
      break;
    }
    case "task.update": {
      const task = findTask(t, op.id);
      const f = sanitizeFields(t, op.fields ?? {});
      if (f.project_id && f.project_id !== task.project_id) {
        // Moving projects keeps the id readable: give it the new project's prefix.
        const newId = nextId(t, f.project_id);
        Object.assign(task, f, { id: newId });
        summary = `move ${op.id} to ${newId}`;
      } else {
        Object.assign(task, f);
        summary = `edit ${task.id}`;
      }
      if (f.status === "Done" && !task.completed) task.completed = today;
      if (f.status && f.status !== "Done") task.completed = null;
      task.updated = today;
      break;
    }
    case "task.add": {
      const f = sanitizeFields(t, op.fields ?? ({} as TaskFields));
      if (!f.title) throw new OpError("Title can't be empty");
      const project_id = f.project_id ?? "general";
      const task: Task = {
        id: nextId(t, project_id),
        project_id,
        title: f.title,
        status: f.status ?? (op.fields.idea ? "Backlog" : "Next"),
        owner: f.owner || "Me",
        due: f.due ?? null,
        priority: f.priority ?? "normal",
        notes: f.notes ?? "",
        ...(op.fields.idea ? { idea: true } : {}),
        created: today,
        updated: today,
      };
      t.tasks.push(task);
      summary = `add ${op.fields.idea ? "idea" : "task"} ${task.id}`;
      break;
    }
    case "idea.promote": {
      const task = findTask(t, op.id);
      delete task.idea;
      task.status = "Next";
      task.updated = today;
      summary = `idea ${task.id} to task`;
      break;
    }
    case "idea.drop": {
      const task = findTask(t, op.id);
      if (!task.idea) throw new OpError("Only ideas can be dropped. Mark tasks done instead.");
      t.tasks = t.tasks.filter((x) => x.id !== op.id);
      summary = `drop idea ${op.id}`;
      break;
    }
    case "waiting.add": {
      const what = clean(op.what, 200);
      const from_whom = clean(op.from_whom, 60);
      if (!what || !from_whom) throw new OpError("Say what you're waiting on and from whom");
      checkProject(t, op.project_id);
      const id = nextSimpleId(t.waiting_on.map((w) => w.id), "w");
      t.waiting_on.push({ id, what, from_whom, project_id: op.project_id, since: today, priority: "normal", notes: "" });
      summary = `waiting on ${from_whom} (${id})`;
      break;
    }
    case "waiting.clear": {
      const w = t.waiting_on.find((x) => x.id === op.id);
      if (!w || w.received) throw new OpError("Already received. Refresh the page.");
      w.received = today;
      summary = `received ${op.id} from ${w.from_whom}`;
      break;
    }
    case "waiting.update": {
      const w = t.waiting_on.find((x) => x.id === op.id);
      if (!w) throw new OpError("Not found. Refresh the page.");
      checkProject(t, op.project_id);
      const what = clean(op.what, 200);
      const from_whom = clean(op.from_whom, 60);
      if (!what || !from_whom) throw new OpError("Say what you're waiting on and from whom");
      Object.assign(w, { what, from_whom, project_id: op.project_id, notes: cleanNotes(op.notes ?? "") });
      summary = `edit ${w.id}`;
      break;
    }
    case "waiting.reopen": {
      const w = t.waiting_on.find((x) => x.id === op.id);
      if (!w) throw new OpError("Not found");
      w.received = null;
      summary = `still waiting ${op.id}`;
      break;
    }
    case "note.add":
    case "note.update": {
      checkProject(t, op.project_id);
      const title = clean(op.title ?? "", 200);
      const body = noteBody(op.text);
      const date = op.date && DATE.test(op.date) ? op.date : today;
      const fields = { title: title || body[0].slice(0, 80), body, project_id: op.project_id, date };
      if (op.type === "note.add") {
        const id = nextSimpleId(t.notes.map((n) => n.id), "n");
        t.notes.push({ id, ...fields });
        summary = `add note ${id}`;
      } else {
        const n = t.notes.find((x) => x.id === op.id);
        if (!n) throw new OpError("Note not found. Refresh the page.");
        Object.assign(n, fields);
        summary = `edit note ${n.id}`;
      }
      break;
    }
    case "note.delete": {
      if (!t.notes.some((n) => n.id === op.id)) throw new OpError("Note not found");
      t.notes = t.notes.filter((n) => n.id !== op.id);
      summary = `delete note ${op.id}`;
      break;
    }
    case "question.add":
    case "question.update": {
      checkProject(t, op.project_id);
      const question = clean(op.question, 300);
      const ask = clean(op.ask, 60);
      if (!question) throw new OpError("Write the question");
      if (!ask) throw new OpError("Say who to ask");
      if (op.type === "question.add") {
        const id = nextSimpleId(t.questions.map((q) => q.id), "q");
        t.questions.push({ id, question, ask, project_id: op.project_id, status: "open", answer: null, raised: today, answered: null });
        summary = `ask ${ask} (${id})`;
      } else {
        const q = t.questions.find((x) => x.id === op.id);
        if (!q) throw new OpError("Question not found. Refresh the page.");
        Object.assign(q, { question, ask, project_id: op.project_id });
        summary = `edit question ${q.id}`;
      }
      break;
    }
    case "question.answer": {
      const q = t.questions.find((x) => x.id === op.id);
      if (!q) throw new OpError("Question not found");
      const answer = typeof op.answer === "string" ? op.answer.trim() : "";
      if (!answer) throw new OpError("Write the answer");
      if (answer.length > 2000) throw new OpError("Answer too long (max 2000 characters)");
      Object.assign(q, { status: "answered", answer, answered: today });
      summary = `answered ${q.id}`;
      break;
    }
    case "question.reopen": {
      const q = t.questions.find((x) => x.id === op.id);
      if (!q) throw new OpError("Question not found");
      Object.assign(q, { status: "open", answer: null, answered: null });
      summary = `reopen ${q.id}`;
      break;
    }
    case "question.delete": {
      if (!t.questions.some((q) => q.id === op.id)) throw new OpError("Question not found");
      t.questions = t.questions.filter((q) => q.id !== op.id);
      summary = `delete question ${op.id}`;
      break;
    }
    case "decision.resolve": {
      const d = t.decisions.find((x) => x.id === op.id);
      if (!d) throw new OpError("Decision not found");
      const answer = clean(op.answer, 300);
      if (!answer) throw new OpError("Give an answer");
      d.status = "resolved";
      d.answer = answer;
      d.resolved = today;
      summary = `resolve ${d.id}`;
      break;
    }
    case "project.add": {
      const id = clean(op.id, 12).toLowerCase();
      if (!/^[a-z][a-z0-9]{1,11}$/.test(id)) throw new OpError("Short id: 2 to 12 letters or numbers, starting with a letter");
      if (id === "general" || id === "gen" || t.projects.some((p) => p.id === id)) throw new OpError(`Id "${id}" is taken. Pick another.`);
      const name = clean(op.name, 100);
      if (!name) throw new OpError("Give the project a name");
      if (!CATEGORIES.includes(op.category as Category)) throw new OpError("Pick a goal area");
      const status = (op.status ?? (op.idea ? "Backlog" : "Next")) as Status;
      if (!STATUSES.includes(status)) throw new OpError("Unknown status");
      t.projects.push({
        id,
        name,
        category: op.category as Category,
        status,
        ...(op.idea ? { idea: true } : {}),
        summary: cleanNotes(op.summary ?? ""),
        built: [],
        links: [],
        blockers: [],
        next_steps: [],
      });
      summary = `add project ${id}`;
      break;
    }
    default:
      throw new OpError("Unknown action");
  }
  return { tracker: t, summary };
}
