import Link from "next/link";
import { notFound } from "next/navigation";
import TaskItem from "@/components/TaskItem";
import QuickAdd from "@/components/QuickAdd";
import DecisionItem from "@/components/DecisionItem";
import { WaitingAdd, WaitingItem } from "@/components/WaitingItem";
import Progress from "@/components/Progress";
import { STATUSES, sortTasks, statusSlug } from "@/lib/tracker";
import { shortDate } from "@/lib/dates";
import { projectStats } from "@/lib/stats";
import { getTracker } from "@/lib/store";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTracker();
  const p = t.projects.find((x) => x.id === id);
  if (!p) notFound();

  const all = t.tasks.filter((x) => x.project_id === id);
  const tasks = all.filter((x) => !x.idea);
  const ideas = all.filter((x) => x.idea);
  const open = tasks.filter((x) => x.status !== "Done");
  const done = tasks
    .filter((x) => x.status === "Done")
    .sort((a, b) => (b.completed ?? b.updated).localeCompare(a.completed ?? a.updated));
  const decisions = t.decisions.filter((d) => d.project_id === id);
  const openDecisions = decisions.filter((d) => d.status === "open");
  const resolved = decisions.filter((d) => d.status === "resolved");
  const waiting = t.waiting_on.filter((w) => w.project_id === id);
  const notes = t.notes.filter((n) => n.project_id === id);
  const goals = t.goals.filter((g) => g.project_ids.includes(id));
  const s = projectStats(t, p);

  return (
    <div className="page">
      <Link href="/" className="back">
        &larr; Dashboard
      </Link>
      <div className="phead">
        <h1>
          {p.name} <span className={`pill col-${statusSlug(p.status)}`}>{p.status}</span>
          {p.idea && <span className="chip idea">Idea, not committed</span>}
        </h1>
        <div className="meta-row">
          <span className="chip">{p.category}</span>
          {goals.map((g) => (
            <Link key={g.id} className="chip" href="/projects">
              Goal: {g.title}
            </Link>
          ))}
        </div>
        <p>{p.summary}</p>
        {p.links.length > 0 && (
          <p className="small">
            {p.links.map((l, i) => (
              <span key={i}>
                {i > 0 && " · "}
                {l.url ? (
                  <a href={l.url} target="_blank" rel="noreferrer">
                    {l.label}
                  </a>
                ) : (
                  <strong>{l.label}</strong>
                )}
                {l.where && <span className="muted"> ({l.where})</span>}
              </span>
            ))}
          </p>
        )}
        <Progress done={s.done} total={s.total} />
        <div className="pstats">
          <div className="pstat"><b>{s.open}</b><span>open tasks</span></div>
          <div className={`pstat${s.urgent ? " bad" : ""}`}><b>{s.urgent}</b><span>urgent</span></div>
          <div className={`pstat${s.blocked ? " bad" : ""}`}><b>{s.blocked}</b><span>blocked</span></div>
          <div className="pstat"><b>{s.waitingOn}</b><span>waiting on others</span></div>
          <div className="pstat"><b>{s.decisions}</b><span>open decisions</span></div>
          <div className="pstat"><b>{s.ideas}</b><span>ideas</span></div>
        </div>
      </div>

      <div className="pgrid">
        <div>
          <section className="panel pad">
            <h2>Action items</h2>
            <QuickAdd projectId={p.id} />
            {STATUSES.filter((st) => st !== "Done").map((st) => {
              const list = sortTasks(open.filter((x) => x.status === st));
              if (!list.length) return null;
              return (
                <div key={st} className="group">
                  <h3>
                    {st} <span className="muted">{list.length}</span>
                  </h3>
                  <div className="list-rows">
                    {list.map((x) => (
                      <TaskItem key={x.id} task={x} showProject={false} showNotes />
                    ))}
                  </div>
                </div>
              );
            })}
            {!open.length && <p className="section-empty">No open action items.</p>}
            {done.length > 0 && (
              <details className="group">
                <summary>
                  Done <span className="muted">{done.length}</span>
                </summary>
                <div className="list-rows">
                  {done.map((x) => (
                    <TaskItem key={x.id} task={x} showProject={false} />
                  ))}
                </div>
              </details>
            )}
          </section>

          <section className="panel pad">
            <h2>Ideas</h2>
            <p className="muted small" style={{ marginTop: 0 }}>
              Not committed. Click one to edit, make it a task, or drop it.
            </p>
            <QuickAdd projectId={p.id} defaultKind="idea" />
            {ideas.length ? (
              <div className="list-rows">
                {ideas.map((x) => (
                  <TaskItem key={x.id} task={x} showProject={false} showNotes />
                ))}
              </div>
            ) : (
              <p className="section-empty">No ideas yet.</p>
            )}
          </section>
        </div>

        <aside className="side">
          {p.blockers.length > 0 && (
            <section className="panel pad">
              <h2 className="bad-text">Blockers</h2>
              <ul>
                {p.blockers.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </section>
          )}
          <section className="panel pad">
            <h2>Next steps</h2>
            {p.next_steps.length ? (
              <ul>
                {p.next_steps.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            ) : (
              <p className="section-empty">None.</p>
            )}
          </section>
          {openDecisions.length > 0 && (
            <section className="panel pad">
              <h2>Decisions to make</h2>
              {openDecisions.map((d) => (
                <DecisionItem key={d.id} d={d} />
              ))}
            </section>
          )}
          <section className="panel pad">
            <h2>Waiting on</h2>
            {waiting.length ? (
              <div className="list-rows">
                {waiting.map((w) => (
                  <div key={w.id}>
                    <div className="small muted">{w.from_whom}</div>
                    <WaitingItem w={w} showProject={false} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="section-empty">Nothing.</p>
            )}
            <WaitingAdd projectId={p.id} />
          </section>
          {p.dependencies && p.dependencies.length > 0 && (
            <section className="panel pad">
              <h2>Dependencies</h2>
              <ul>
                {p.dependencies.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </section>
          )}
          {p.built.length > 0 && (
            <details className="panel pad">
              <summary>
                <h2 style={{ display: "inline" }}>Built so far</h2> <span className="muted">{p.built.length}</span>
              </summary>
              <ul>
                {p.built.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </details>
          )}
          {resolved.length > 0 && (
            <details className="panel pad">
              <summary>
                <h2 style={{ display: "inline" }}>Decided</h2> <span className="muted">{resolved.length}</span>
              </summary>
              {resolved.map((d) => (
                <DecisionItem key={d.id} d={d} />
              ))}
            </details>
          )}
          {notes.map((n, i) => (
            <section key={i} className="panel pad">
              <h2>
                {shortDate(n.date)}: {n.title}
              </h2>
              <ul>
                {n.body.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            </section>
          ))}
        </aside>
      </div>
    </div>
  );
}
