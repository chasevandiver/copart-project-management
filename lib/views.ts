// Builds each sidebar view from the tracker. Pure, so server pages and counts share it.
// "Mine" means owner "Me". Work owned by others lives in Delegated.
import { addDaysISO, daysBetween } from "./dates";
import { sortTasks, type Decision, type Note, type Person, type Question, type Task, type Tracker, type WaitingOn } from "./tracker";

export type Entry =
  | { kind: "task"; v: Task }
  | { kind: "question"; v: Question }
  | { kind: "note"; v: Note }
  | { kind: "waiting"; v: WaitingOn }
  | { kind: "decision"; v: Decision };

export type Group = { key: string; title: string; sub?: string; tone?: "bad" | "brand"; entries: Entry[]; collapsed?: boolean };

const T = (v: Task): Entry => ({ kind: "task", v });
const isOpen = (x: Task) => !x.idea && x.status !== "Done";
const mine = (x: Task) => x.owner === "Me";

export function myOpenTasks(t: Tracker): Task[] {
  return t.tasks.filter((x) => isOpen(x) && mine(x));
}

export function todayView(t: Tracker, today: string): Group[] {
  const open = myOpenTasks(t);
  const overdue = open.filter((x) => x.due && x.due < today);
  const due = open.filter((x) => x.due === today);
  const week = open.filter((x) => x.due && x.due > today && daysBetween(today, x.due) <= 7);
  const shown = new Set([...overdue, ...due, ...week].map((x) => x.id));
  const urgent = open.filter((x) => !shown.has(x.id) && (x.priority === "urgent" || x.status === "In Progress"));
  const byDue = (a: Task, b: Task) => (a.due ?? "").localeCompare(b.due ?? "");
  return [
    { key: "overdue", title: "Overdue", tone: "bad" as const, entries: overdue.sort(byDue).map(T) },
    { key: "today", title: "Due today", entries: sortTasks(due).map(T) },
    { key: "week", title: "Coming up this week", entries: week.sort(byDue).map(T) },
    { key: "urgent", title: "Urgent and in progress", sub: "No date yet", entries: sortTasks(urgent).map(T) },
  ].filter((g) => g.entries.length);
}

export function todayCount(t: Tracker, today: string): number {
  return todayView(t, today).reduce((n, g) => n + (g.key === "week" ? 0 : g.entries.length), 0);
}

export function inboxView(t: Tracker): Group[] {
  const g = (x: { project_id: string }) => x.project_id === "general";
  const tasks = sortTasks(t.tasks.filter((x) => g(x) && isOpen(x)));
  return [
    { key: "tasks", title: "To do", entries: tasks.map(T) },
    { key: "questions", title: "Questions", entries: t.questions.filter((q) => g(q) && q.status === "open").map((v) => ({ kind: "question" as const, v })) },
    { key: "ideas", title: "Ideas", entries: t.tasks.filter((x) => g(x) && x.idea).map(T) },
    {
      key: "notes",
      title: "Notes",
      entries: t.notes.filter(g).sort((a, b) => b.date.localeCompare(a.date)).map((v) => ({ kind: "note" as const, v })),
    },
  ].filter((x) => x.entries.length);
}

export function inboxCount(t: Tracker): number {
  return (
    t.tasks.filter((x) => x.project_id === "general" && isOpen(x)).length +
    t.questions.filter((q) => q.project_id === "general" && q.status === "open").length
  );
}

const WEEKDAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function upcomingView(t: Tracker, today: string, names: Record<string, string>): Group[] {
  const open = myOpenTasks(t);
  const groups: Group[] = [];
  const overdue = open.filter((x) => x.due && x.due < today);
  if (overdue.length) groups.push({ key: "overdue", title: "Overdue", tone: "bad", entries: overdue.map(T) });
  for (let i = 0; i < 14; i++) {
    const d = addDaysISO(today, i);
    const list = open.filter((x) => x.due === d);
    const dow = WEEKDAY[new Date(d + "T12:00:00Z").getUTCDay()];
    if (list.length || i === 0) {
      groups.push({
        key: d,
        title: i === 0 ? "Today" : i === 1 ? "Tomorrow" : dow,
        sub: d,
        tone: i === 0 ? "brand" : undefined,
        entries: sortTasks(list).map(T),
      });
    }
  }
  const horizon = addDaysISO(today, 13);
  const later = open.filter((x) => x.due && x.due > horizon).sort((a, b) => a.due!.localeCompare(b.due!));
  if (later.length) groups.push({ key: "later", title: "Later", entries: later.map(T) });

  // Undated work, by project, so it is easy to pick something and give it a date.
  const undated = open.filter((x) => !x.due);
  const byProject = new Map<string, Task[]>();
  for (const x of undated) byProject.set(x.project_id, [...(byProject.get(x.project_id) ?? []), x]);
  for (const [pid, list] of byProject) {
    const active = list.filter((x) => x.status !== "Backlog");
    const backlog = list.filter((x) => x.status === "Backlog");
    groups.push({
      key: "nodate-" + pid,
      title: `No date · ${names[pid] ?? pid}`,
      entries: [...sortTasks(active), ...sortTasks(backlog)].map(T),
      collapsed: !active.length,
    });
  }
  return groups;
}

export function askView(t: Tracker): Group[] {
  const open = t.questions.filter((q) => q.status === "open");
  const by = new Map<string, Question[]>();
  for (const q of open) by.set(q.ask, [...(by.get(q.ask) ?? []), q]);
  const groups: Group[] = [...by.entries()]
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .map(([who, list]) => ({ key: who, title: who, entries: list.map((v) => ({ kind: "question" as const, v })) }));
  const answered = t.questions.filter((q) => q.status === "answered").sort((a, b) => (b.answered ?? "").localeCompare(a.answered ?? ""));
  if (answered.length) {
    groups.push({ key: "answered", title: "Answered", collapsed: true, entries: answered.map((v) => ({ kind: "question" as const, v })) });
  }
  return groups;
}

export function waitingView(t: Tracker): Group[] {
  const open = t.waiting_on.filter((w) => !w.received);
  const by = new Map<string, WaitingOn[]>();
  for (const w of open) by.set(w.from_whom, [...(by.get(w.from_whom) ?? []), w]);
  const groups: Group[] = [...by.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([who, list]) => ({
      key: who,
      title: who,
      entries: list.sort((a, b) => a.since.localeCompare(b.since)).map((v) => ({ kind: "waiting" as const, v })),
    }));
  const got = t.waiting_on.filter((w) => w.received);
  if (got.length) groups.push({ key: "received", title: "Received", collapsed: true, entries: got.map((v) => ({ kind: "waiting" as const, v })) });
  return groups;
}

export function decideView(t: Tracker, names: Record<string, string>): Group[] {
  const open = t.decisions.filter((d) => d.status === "open");
  const by = new Map<string, Decision[]>();
  for (const d of open) by.set(d.project_id, [...(by.get(d.project_id) ?? []), d]);
  const groups: Group[] = [...by.entries()].map(([pid, list]) => ({
    key: pid,
    title: names[pid] ?? pid,
    entries: list.map((v) => ({ kind: "decision" as const, v })),
  }));
  const done = t.decisions.filter((d) => d.status === "resolved");
  if (done.length) groups.push({ key: "decided", title: "Decided", collapsed: true, entries: done.map((v) => ({ kind: "decision" as const, v })) });
  return groups;
}

export function delegatedView(t: Tracker): Group[] {
  const open = t.tasks.filter((x) => isOpen(x) && !mine(x));
  const by = new Map<string, Task[]>();
  for (const x of open) by.set(x.owner, [...(by.get(x.owner) ?? []), x]);
  return [...by.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([who, list]) => ({ key: who, title: who, entries: sortTasks(list).map(T) }));
}

export function ideasView(t: Tracker, names: Record<string, string>): Group[] {
  const ideas = t.tasks.filter((x) => x.idea);
  const by = new Map<string, Task[]>();
  for (const x of ideas) by.set(x.project_id, [...(by.get(x.project_id) ?? []), x]);
  return [...by.entries()].map(([pid, list]) => ({ key: pid, title: names[pid] ?? pid, entries: list.map(T) }));
}

export function notesView(t: Tracker): Group[] {
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const notes = [...t.notes].sort((a, b) => b.date.localeCompare(a.date));
  const by = new Map<string, Note[]>();
  for (const n of notes) by.set(n.date.slice(0, 7), [...(by.get(n.date.slice(0, 7)) ?? []), n]);
  return [...by.entries()].map(([k, list]) => ({
    key: k,
    title: `${MONTHS[+k.slice(5, 7) - 1]} ${k.slice(0, 4)}`,
    entries: list.map((v) => ({ kind: "note" as const, v })),
  }));
}

export function projectView(t: Tracker, id: string): Group[] {
  const own = (x: { project_id: string }) => x.project_id === id;
  const open = t.tasks.filter((x) => own(x) && isOpen(x));
  const done = t.tasks
    .filter((x) => own(x) && !x.idea && x.status === "Done")
    .sort((a, b) => (b.completed ?? b.updated).localeCompare(a.completed ?? a.updated));
  return [
    { key: "todo", title: "To do", entries: sortTasks(open.filter(mine)).map(T) },
    { key: "delegated", title: "Others are on it", entries: sortTasks(open.filter((x) => !mine(x))).map(T) },
    { key: "questions", title: "Questions", entries: t.questions.filter((q) => own(q) && q.status === "open").map((v) => ({ kind: "question" as const, v })) },
    { key: "decisions", title: "Decisions to make", entries: t.decisions.filter((d) => own(d) && d.status === "open").map((v) => ({ kind: "decision" as const, v })) },
    { key: "waiting", title: "Waiting on", entries: t.waiting_on.filter((w) => own(w) && !w.received).map((v) => ({ kind: "waiting" as const, v })) },
    { key: "ideas", title: "Ideas", entries: t.tasks.filter((x) => own(x) && x.idea).map(T) },
    {
      key: "notes",
      title: "Notes",
      entries: t.notes.filter(own).sort((a, b) => b.date.localeCompare(a.date)).map((v) => ({ kind: "note" as const, v })),
    },
    { key: "done", title: "Done", collapsed: true, entries: done.map(T) },
  ].filter((g) => g.entries.length);
}

export function searchView(t: Tracker, q: string): Group[] {
  const n = q.trim().toLowerCase();
  if (!n) return [];
  const hit = (...s: (string | null | undefined)[]) => s.some((x) => x?.toLowerCase().includes(n));
  return [
    { key: "tasks", title: "Tasks and ideas", entries: t.tasks.filter((x) => hit(x.title, x.notes, x.owner)).map(T) },
    { key: "questions", title: "Questions", entries: t.questions.filter((x) => hit(x.question, x.answer, x.ask)).map((v) => ({ kind: "question" as const, v })) },
    { key: "notes", title: "Notes", entries: t.notes.filter((x) => hit(x.title, ...x.body)).map((v) => ({ kind: "note" as const, v })) },
    { key: "waiting", title: "Waiting on", entries: t.waiting_on.filter((x) => hit(x.what, x.from_whom, x.notes)).map((v) => ({ kind: "waiting" as const, v })) },
    { key: "decisions", title: "Decisions", entries: t.decisions.filter((x) => hit(x.question, x.answer, ...x.options)).map((v) => ({ kind: "decision" as const, v })) },
  ].filter((g) => g.entries.length);
}

// People: one page per person in the directory. Owners, question targets and
// waiting-on sources match by full or first name; notes and to-dos match when
// they mention the first name as a whole word.
const firstName = (n: string) => n.split(" ")[0];
const samePerson = (a: string, b: string) => a === b || a === firstName(b) || firstName(a) === b;

export function personSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function findPerson(t: Tracker, slug: string): Person | undefined {
  return t.people.find((p) => personSlug(p.name) === slug);
}

function mentions(name: string) {
  const re = new RegExp(`\\b${firstName(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  return (...s: (string | null | undefined)[]) => s.some((x) => !!x && re.test(x));
}

function personOpen(t: Tracker, name: string) {
  return {
    questions: t.questions.filter((q) => q.status === "open" && samePerson(q.ask, name)),
    waiting: t.waiting_on.filter((w) => !w.received && samePerson(w.from_whom, name)),
    owns: t.tasks.filter((x) => isOpen(x) && samePerson(x.owner, name)),
  };
}

export function personOpenCount(t: Tracker, name: string): number {
  const o = personOpen(t, name);
  return o.questions.length + o.waiting.length + o.owns.length;
}

export function personNotes(t: Tracker, name: string): Note[] {
  const hit = mentions(name);
  return t.notes.filter((n) => hit(n.title, ...n.body)).sort((a, b) => b.date.localeCompare(a.date));
}

export function personView(t: Tracker, name: string): Group[] {
  const first = firstName(name);
  const hit = mentions(name);
  const o = personOpen(t, name);
  const related = t.tasks.filter((x) => (isOpen(x) || x.idea) && !samePerson(x.owner, name) && hit(x.title, x.notes));
  const answered = t.questions
    .filter((q) => q.status === "answered" && samePerson(q.ask, name))
    .sort((a, b) => (b.answered ?? "").localeCompare(a.answered ?? ""));
  const done = t.tasks
    .filter((x) => !x.idea && x.status === "Done" && (samePerson(x.owner, name) || hit(x.title, x.notes)))
    .sort((a, b) => (b.completed ?? b.updated).localeCompare(a.completed ?? a.updated));
  const received = t.waiting_on.filter((w) => w.received && samePerson(w.from_whom, name));
  return [
    { key: "ask", title: `Ask ${first}`, entries: o.questions.map((v) => ({ kind: "question" as const, v })) },
    { key: "waiting", title: `Waiting on ${first}`, entries: o.waiting.map((v) => ({ kind: "waiting" as const, v })) },
    { key: "owns", title: `${first} is on it`, entries: sortTasks(o.owns).map(T) },
    { key: "related", title: `To-dos that mention ${first}`, entries: sortTasks(related).map(T) },
    { key: "notes", title: "Notes", entries: personNotes(t, name).map((v) => ({ kind: "note" as const, v })) },
    { key: "answered", title: "Answered", collapsed: true, entries: answered.map((v) => ({ kind: "question" as const, v })) },
    {
      key: "done",
      title: "Done and received",
      collapsed: true,
      entries: [...done.map(T), ...received.map((v) => ({ kind: "waiting" as const, v }))],
    },
  ].filter((g) => g.entries.length);
}

export function sidebarCounts(t: Tracker, today: string) {
  return {
    inbox: inboxCount(t),
    today: todayCount(t, today),
    ask: t.questions.filter((q) => q.status === "open").length,
    waiting: t.waiting_on.filter((w) => !w.received).length,
    decide: t.decisions.filter((d) => d.status === "open").length,
    delegated: t.tasks.filter((x) => isOpen(x) && !mine(x)).length,
    ideas: t.tasks.filter((x) => x.idea).length,
    notes: t.notes.length,
    projects: Object.fromEntries(t.projects.map((p) => [p.id, t.tasks.filter((x) => x.project_id === p.id && isOpen(x) && mine(x)).length])),
  };
}

export type Counts = ReturnType<typeof sidebarCounts>;
