import Link from "next/link";
import TaskCard from "@/components/TaskCard";
import { sortTasks, statusSlug, tracker } from "@/lib/tracker";

export default function ProjectsPage() {
  const general = sortTasks(tracker.tasks.filter((t) => t.project_id === "general" && t.status !== "Done"));
  return (
    <>
      <h1>Projects</h1>
      <div className="grid">
        {tracker.projects.map((p) => {
          const open = tracker.tasks.filter((t) => t.project_id === p.id && t.status !== "Done");
          const urgent = open.filter((t) => t.priority === "urgent").length;
          const decisions = tracker.decisions.filter((d) => d.project_id === p.id && d.status === "open").length;
          const waiting = tracker.waiting_on.filter((w) => w.project_id === p.id).length;
          return (
            <Link key={p.id} href={`/projects/${p.id}`} className="card" style={{ color: "inherit" }}>
              <h3>
                {p.name} <span className={`chip status col-${statusSlug(p.status)}`}>{p.status}</span>
              </h3>
              <p className="small muted" style={{ margin: "0 0 8px" }}>{p.summary}</p>
              <div className="meta-row">
                <span className="chip">{open.length} open tasks</span>
                {urgent > 0 && <span className="chip urgent">{urgent} urgent</span>}
                {decisions > 0 && <span className="chip">{decisions} open decisions</span>}
                {waiting > 0 && <span className="chip">{waiting} waiting on</span>}
                {p.blockers.length > 0 && <span className="chip overdue">{p.blockers.length} blockers</span>}
              </div>
            </Link>
          );
        })}
      </div>
      <h2>General tasks</h2>
      <div className="list">
        {general.map((t) => (
          <TaskCard key={t.id} task={t} showStatus />
        ))}
      </div>
    </>
  );
}
