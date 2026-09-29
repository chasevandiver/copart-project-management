import Link from "next/link";
import TaskCard from "@/components/TaskCard";
import { CATEGORIES, projectName, sortTasks, statusSlug, tracker, type Project } from "@/lib/tracker";

function ProjectCard({ p }: { p: Project }) {
  const open = tracker.tasks.filter((t) => t.project_id === p.id && t.status !== "Done");
  const urgent = open.filter((t) => t.priority === "urgent").length;
  const decisions = tracker.decisions.filter((d) => d.project_id === p.id && d.status === "open").length;
  const waiting = tracker.waiting_on.filter((w) => w.project_id === p.id).length;
  return (
    <Link href={`/projects/${p.id}`} className="card" style={{ color: "inherit" }}>
      <h3>
        {p.name} <span className={`chip status col-${statusSlug(p.status)}`}>{p.status}</span>
        {p.idea && <span className="chip idea">Idea</span>}
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
}

export default function ProjectsPage() {
  const general = sortTasks(tracker.tasks.filter((t) => t.project_id === "general" && t.status !== "Done"));
  return (
    <>
      <h1>Goals and projects</h1>
      {CATEGORIES.map((c) => {
        const goals = tracker.goals.filter((g) => g.category === c);
        const projects = tracker.projects.filter((p) => p.category === c);
        return (
          <section key={c} className="category">
            <h2>{c}</h2>
            {goals.length > 0 && (
              <div className="list" style={{ marginBottom: 12 }}>
                {goals.map((g) => (
                  <div key={g.id} className="card goal">
                    <div>
                      <span className="chip">Goal</span> <strong>{g.title}</strong>{" "}
                      <span className={`chip status col-${statusSlug(g.status)}`}>{g.status}</span>
                    </div>
                    <p className="small muted" style={{ margin: "4px 0" }}>{g.summary}</p>
                    <div className="meta-row">
                      {g.project_ids.map((id) => (
                        <Link key={id} className="chip" href={`/projects/${id}`}>
                          {projectName(id)}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="grid">
              {projects.map((p) => (
                <ProjectCard key={p.id} p={p} />
              ))}
            </div>
          </section>
        );
      })}
      <h2>General tasks</h2>
      <div className="list">
        {general.map((t) => (
          <TaskCard key={t.id} task={t} showStatus />
        ))}
      </div>
    </>
  );
}
