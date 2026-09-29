import data from "../tracker/tracker.json";

export const STATUSES = ["Backlog", "Next", "In Progress", "Waiting", "Blocked", "Done"] as const;
export type Status = (typeof STATUSES)[number];

export const PRIORITIES = ["urgent", "high", "normal", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];

export type Link = { label: string; url?: string; where?: string };

export type Project = {
  id: string;
  name: string;
  status: Status;
  summary: string;
  built: string[];
  links: Link[];
  blockers: string[];
  next_steps: string[];
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
  projects: Project[];
  tasks: Task[];
  waiting_on: WaitingOn[];
  decisions: Decision[];
  people: Person[];
  notes: Note[];
};

export const tracker = data as Tracker;

export function projectName(id: string): string {
  if (id === "general") return "General";
  return tracker.projects.find((p) => p.id === id)?.name ?? id;
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
