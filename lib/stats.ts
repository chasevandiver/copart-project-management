import type { Project, Tracker } from "./tracker";

export type ProjectStats = {
  total: number;
  done: number;
  open: number;
  urgent: number;
  blocked: number;
  waitingTasks: number;
  waitingOn: number;
  decisions: number;
  ideas: number;
};

export function projectStats(t: Tracker, p: Project): ProjectStats {
  const all = t.tasks.filter((x) => x.project_id === p.id);
  const tasks = all.filter((x) => !x.idea);
  const open = tasks.filter((x) => x.status !== "Done");
  return {
    total: tasks.length,
    done: tasks.length - open.length,
    open: open.length,
    urgent: open.filter((x) => x.priority === "urgent").length,
    blocked: open.filter((x) => x.status === "Blocked").length,
    waitingTasks: open.filter((x) => x.status === "Waiting").length,
    waitingOn: t.waiting_on.filter((w) => w.project_id === p.id && !w.received).length,
    decisions: t.decisions.filter((d) => d.project_id === p.id && d.status === "open").length,
    ideas: all.length - tasks.length,
  };
}
