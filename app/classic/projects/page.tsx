import Link from "next/link";
import TaskItem from "@/components/TaskItem";
import QuestionItem from "@/components/QuestionItem";
import NoteItem from "@/components/NoteItem";
import Capture from "@/components/Capture";
import { CATEGORIES, projectName, sortTasks, statusSlug, type Project, type Tracker } from "@/lib/tracker";
import { getTracker } from "@/lib/store";

function ProjectCard({ tracker, p }: { tracker: Tracker; p: Project }) {
  const open = tracker.tasks.filter((t) => t.project_id === p.id && t.status !== "Done" && !t.idea);
  const urgent = open.filter((t) => t.priority === "urgent").length;
  const decisions = tracker.decisions.filter((d) => d.project_id === p.id && d.status === "open").length;
  const waiting = tracker.waiting_on.filter((w) => w.project_id === p.id && !w.received).length;
  const questions = tracker.questions.filter((q) => q.project_id === p.id && q.status === "open").length;
  return (
    <Link href={`/classic/projects/${p.id}`} className="card" style={{ color: "inherit" }}>
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
        {questions > 0 && <span className="chip">{questions} to ask</span>}
        {p.blockers.length > 0 && <span className="chip overdue">{p.blockers.length} blockers</span>}
      </div>
    </Link>
  );
}

export default async function ProjectsPage() {
  const tracker = await getTracker();
  const general = sortTasks(tracker.tasks.filter((t) => t.project_id === "general" && t.status !== "Done"));
  const generalQ = tracker.questions.filter((q) => q.project_id === "general" && q.status === "open");
  const generalNotes = tracker.notes.filter((n) => n.project_id === "general").sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="page">
      <div className="home-head">
        <h1>Projects</h1>
        <Link href="/classic/board" className="small">
          Board view (all action items by status) &rarr;
        </Link>
      </div>
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
                        <Link key={id} className="chip" href={`/classic/projects/${id}`}>
                          {projectName(tracker, id)}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="grid">
              {projects.map((p) => (
                <ProjectCard key={p.id} tracker={tracker} p={p} />
              ))}
            </div>
          </section>
        );
      })}
      <h2>General (not tied to a project)</h2>
      <div className="panel pad capture-panel">
        <Capture projectId="general" />
      </div>
      <div className="list-rows">
        {general.map((t) => (
          <TaskItem key={t.id} task={t} showProject={false} showNotes />
        ))}
        {generalQ.map((q) => (
          <QuestionItem key={q.id} q={q} showProject={false} />
        ))}
      </div>
      {generalNotes.length > 0 && (
        <details className="group">
          <summary>
            General notes <span className="muted">{generalNotes.length}</span>
          </summary>
          <div className="notes-list">
            {generalNotes.map((n) => (
              <NoteItem key={n.id} note={n} showProject={false} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
