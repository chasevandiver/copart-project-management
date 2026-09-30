// Edits the board can make. Pure functions: take a tracker, return a changed copy.
// Server runs these on the latest tracker.json before committing, so a retry after a
// conflict just re-applies the op to the newer file.
import { addDaysISO } from "./dates";
import { PRIORITIES, STATUSES, type Priority, type Status, type Task, type Tracker } from "./tracker";

export type TaskFields = Partial<Pick<Task, "title" | "project_id" | "status" | "owner" | "priority" | "due" | "notes">>;

export type Op =
  | { type: "task.toggle"; id: string; done: boolean }
  | { type: "task.update"; id: string; fields: TaskFields }
  | { type: "task.add"; fields: TaskFields & { title: string; project_id: string; idea?: boolean } }
  | { type: "idea.promote"; id: string }
  | { type: "idea.drop"; id: string }
  | { type: "waiting.add"; what: string; from_whom: string; project_id: string }
  | { type: "waiting.clear"; id: string }
  | { type: "decision.resolve"; id: string; answer: string };

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

function nextWaitingId(t: Tracker): string {
  const nums = t.waiting_on.map((w) => parseInt(w.id.slice(2), 10)).filter((n) => !Number.isNaN(n));
  return `w-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(2, "0")}`;
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
      if (op.project_id !== "general" && !t.projects.some((p) => p.id === op.project_id)) throw new OpError("Unknown project");
      const id = nextWaitingId(t);
      t.waiting_on.push({ id, what, from_whom, project_id: op.project_id, since: today, priority: "normal", notes: "" });
      summary = `waiting on ${from_whom} (${id})`;
      break;
    }
    case "waiting.clear": {
      const w = t.waiting_on.find((x) => x.id === op.id);
      if (!w) throw new OpError("Already cleared. Refresh the page.");
      t.waiting_on = t.waiting_on.filter((x) => x.id !== op.id);
      summary = `received ${op.id} from ${w.from_whom}`;
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
    default:
      throw new OpError("Unknown action");
  }
  return { tracker: t, summary };
}
