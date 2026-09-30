// Types, constants and pure helpers. Safe to import from client and server.

export const STATUSES = ["Backlog", "Next", "In Progress", "Waiting", "Blocked", "Done"] as const;
export type Status = (typeof STATUSES)[number];

export const PRIORITIES = ["urgent", "high", "normal", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const CATEGORIES = ["AI Tools", "Marketing Efforts"] as const;
export type Category = (typeof CATEGORIES)[number];

export const FIXED_OWNERS = ["Me", "Work Claude", "Claude Code", "IT", "Leo", "Legal"];

export type Goal = {
  id: string;
  category: Category;
  title: string;
  summary: string;
  status: Status;
  project_ids: string[];
  created: string;
  updated: string;
};

export type Link = { label: string; url?: string; where?: string };

export type Project = {
  id: string;
  name: string;
  category: Category;
  status: Status;
  idea?: boolean;
  summary: string;
  built: string[];
  links: Link[];
  blockers: string[];
  next_steps: string[];
  dependencies?: string[];
};

export type Task = {
  id: string;
  project_id: string;
  title: string;
  status: Status;
  owner: string;
  due: string | null;
  priority: Priority;
  notes: string;
  recurring?: string;
  idea?: boolean;
  completed?: string | null;
  created: string;
  updated: string;
};

export type WaitingOn = {
  id: string;
  what: string;
  from_whom: string;
  project_id: string;
  since: string;
  priority: Priority;
  notes: string;
};

export type Decision = {
  id: string;
  project_id: string;
  question: string;
  options: string[];
  raised: string;
  status: "open" | "resolved";
  answer: string | null;
  resolved: string | null;
};

export type Person = {
  name: string;
  title: string;
  department: string;
  relationship: string;
  contact: string;
};

export type Note = {
  date: string;
  title: string;
  project_id: string;
  body: string[];
};

export type Tracker = {
  meta: { owner: string; role: string; last_updated: string };
  categories: Category[];
  goals: Goal[];
  projects: Project[];
  tasks: Task[];
  waiting_on: WaitingOn[];
  decisions: Decision[];
  people: Person[];
  notes: Note[];
};

export function projectName(t: Tracker, id: string): string {
  if (id === "general") return "General";
  return t.projects.find((p) => p.id === id)?.name ?? id;
}

export function projectNames(t: Tracker): Record<string, string> {
  const names: Record<string, string> = { general: "General" };
  for (const p of t.projects) names[p.id] = p.name;
  return names;
}

export function owners(t: Tracker): string[] {
  return [...FIXED_OWNERS, ...t.people.map((p) => p.name).filter((n) => !FIXED_OWNERS.includes(n))];
}

/** Real work items: tasks that are not ideas. */
export function workTasks(t: Tracker): Task[] {
  return t.tasks.filter((x) => !x.idea);
}

export const PRIORITY_RANK: Record<Priority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) =>
      PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
      (a.due ?? "9999").localeCompare(b.due ?? "9999") ||
      a.id.localeCompare(b.id, undefined, { numeric: true })
  );
}

export function statusSlug(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "-");
}

export function projectHref(id: string): string {
  return id === "general" ? "/projects" : `/projects/${id}`;
}
