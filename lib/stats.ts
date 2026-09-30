import { tracker, type Project } from "./tracker";

export type ProjectStats = {
  total: number;
  done: number;
  open: number;
  urgent: number;
  blocked: number;
  waitingTasks: number;
  waitingOn: number;
  decisions: number;
};

export function projectStats(p: Project): ProjectStats {
  const tasks = tracker.tasks.filter((t) => t.project_id === p.id);
  const open = tasks.filter((t) => t.status !== "Done");
  return {
    total: tasks.length,
    done: tasks.length - open.length,
    open: open.length,
    urgent: open.filter((t) => t.priority === "urgent").length,
    blocked: open.filter((t) => t.status === "Blocked").length,
    waitingTasks: open.filter((t) => t.status === "Waiting").length,
    waitingOn: tracker.waiting_on.filter((w) => w.project_id === p.id).length,
    decisions: tracker.decisions.filter((d) => d.project_id === p.id && d.status === "open").length,
  };
}
