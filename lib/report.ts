// The weekly update for Ken. Pure, so the page and the plain-text copy share it.
// A week runs Friday to Thursday and is named by its Thursday. Chase's own words
// (headline, wins, next, asks) come from tracker.reports; everything else is built
// from dates already on the items.
import { addDaysISO, daysBetween, shortDate } from "./dates";
import { projectStats } from "./stats";
import { projectName, type Report, type Status, type Tracker } from "./tracker";

export type ReportProject = {
  id: string;
  name: string;
  category: string;
  status: Status;
  summary: string;
  done: string[];
  next: string | null;
  blocker: string | null;
  progress: { done: number; total: number };
};

export type WeeklyReport = {
  weekEnding: string;
  weekStart: string;
  prevWeek: string;
  nextWeek: string | null;
  saved: Report | null;
  stats: { completed: number; decisions: number; answered: number; active: number };
  decisions: { question: string; answer: string; project: string }[];
  projects: ReportProject[];
  onDeck: { id: string; name: string; summary: string }[];
  comingUp: { title: string; due: string | null; project: string }[];
  forKen: string[];
};

/** The Thursday on or after the given day. */
export function weekOf(iso: string): string {
  const dow = new Date(iso + "T12:00:00Z").getUTCDay();
  return addDaysISO(iso, (4 - dow + 7) % 7);
}

const isKen = (name: string) => /^ken\b/i.test(name.trim());

export function weeklyReport(t: Tracker, weekEnding: string, today: string): WeeklyReport {
  const start = addDaysISO(weekEnding, -6);
  const inWeek = (d?: string | null) => !!d && d >= start && d <= weekEnding;
  const thisWeek = weekOf(today);

  const completed = t.tasks.filter((x) => !x.idea && x.completed && inWeek(x.completed) && (x.status === "Done" || x.recurring));
  const decided = t.decisions.filter((d) => d.status === "resolved" && inWeek(d.resolved));
  const answered = t.questions.filter((q) => q.status === "answered" && inWeek(q.answered));

  const live = t.projects.filter((p) => !p.idea && p.status !== "Backlog");
  const order: Status[] = ["In Progress", "Blocked", "Waiting", "Next", "Done", "Backlog"];
  const projects: ReportProject[] = live
    .map((p) => {
      const s = projectStats(t, p);
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        status: p.status,
        summary: p.summary,
        done: completed.filter((x) => x.project_id === p.id).map((x) => x.title),
        next: p.next_steps[0] ?? null,
        blocker: p.blockers[0] ?? null,
        progress: { done: s.done, total: s.total },
      };
    })
    .sort((a, b) => b.done.length - a.done.length || order.indexOf(a.status) - order.indexOf(b.status));

  // The week after this one: dated work first, then urgent work with no date.
  const horizon = addDaysISO(weekEnding, 7);
  const open = t.tasks.filter((x) => !x.idea && x.status !== "Done" && x.owner === "Me");
  const dated = open.filter((x) => x.due && x.due > weekEnding && x.due <= horizon).sort((a, b) => a.due!.localeCompare(b.due!));
  const urgent = open.filter((x) => !x.due && x.priority === "urgent");
  const comingUp = [...dated, ...urgent].slice(0, 8).map((x) => ({ title: x.title, due: x.due, project: projectName(t, x.project_id) }));

  return {
    weekEnding,
    weekStart: start,
    prevWeek: addDaysISO(weekEnding, -7),
    nextWeek: weekEnding < thisWeek ? addDaysISO(weekEnding, 7) : null,
    saved: t.reports?.find((r) => r.week_ending === weekEnding) ?? null,
    stats: {
      completed: completed.length,
      decisions: decided.length,
      answered: answered.length,
      active: live.filter((p) => p.status !== "Done").length,
    },
    decisions: decided.map((d) => ({ question: d.question, answer: d.answer ?? "", project: projectName(t, d.project_id) })),
    projects,
    onDeck: t.projects.filter((p) => !p.idea && p.status === "Backlog").map((p) => ({ id: p.id, name: p.name, summary: p.summary })),
    comingUp,
    forKen: t.questions.filter((q) => q.status === "open" && isKen(q.ask)).map((q) => q.question),
  };
}

export function weekLabel(r: { weekStart: string; weekEnding: string }): string {
  return `${shortDate(r.weekStart)} to ${shortDate(r.weekEnding)}, ${r.weekEnding.slice(0, 4)}`;
}

/** Days until it goes out, for the page header. */
export function dueIn(weekEnding: string, today: string): number {
  return daysBetween(today, weekEnding);
}

/** The same report as plain text, ready to paste into an email or Teams. */
export function reportText(r: WeeklyReport, owner: string, role: string): string {
  const out: string[] = [];
  const list = (title: string, items: string[]) => {
    if (!items.length) return;
    out.push("", title.toUpperCase(), ...items.map((x) => `- ${x}`));
  };
  out.push(`Weekly update: ${weekLabel(r)}`, `${owner}, ${role}`);
  if (r.saved?.headline) out.push("", r.saved.headline);
  out.push(
    "",
    `${r.stats.completed} completed · ${r.stats.decisions} decisions made · ${r.stats.answered} questions answered · ${r.stats.active} active projects`
  );
  list("Highlights", r.saved?.wins ?? []);
  out.push("", "PROJECTS");
  for (const p of r.projects) {
    out.push("", `${p.name} (${p.status})`);
    for (const d of p.done.slice(0, 4)) out.push(`- Done: ${d}`);
    if (p.done.length > 4) out.push(`- Plus ${p.done.length - 4} more done this week`);
    if (p.blocker) out.push(`- Blocked: ${p.blocker}`);
    if (p.next) out.push(`- Next: ${p.next}`);
  }
  list("Decisions made", r.decisions.map((d) => `${d.question} ${d.answer}`));
  list("Next week", r.saved?.next.length ? r.saved.next : r.comingUp.map((x) => x.title));
  list("Where I could use your help", [...(r.saved?.asks ?? []), ...r.forKen]);
  return out.join("\n");
}
