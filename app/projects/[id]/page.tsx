import Link from "next/link";
import { notFound } from "next/navigation";
import TaskItem from "@/components/TaskItem";
import Capture, { type CaptureKind } from "@/components/Capture";
import NoteItem from "@/components/NoteItem";
import QuestionItem from "@/components/QuestionItem";
import DecisionItem from "@/components/DecisionItem";
import { WaitingAdd, WaitingItem } from "@/components/WaitingItem";
import Progress from "@/components/Progress";
import { STATUSES, sortTasks, statusSlug } from "@/lib/tracker";
import { projectStats } from "@/lib/stats";
import { getTracker } from "@/lib/store";

const TABS = ["overview", "actions", "ideas", "notes", "questions", "more"] as const;
type Tab = (typeof TABS)[number];
const CAPTURE_FOR: Record<Tab, CaptureKind> = {
  overview: "task",
  actions: "task",
  ideas: "idea",
  notes: "note",
  questions: "question",
  more: "task",
};

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const tab: Tab = (TABS as readonly string[]).includes(sp.tab ?? "") ? (sp.tab as Tab) : "overview";
  const t = await getTracker();
  const p = t.projects.find((x) => x.id === id);
  if (!p) notFound();

  const all = t.tasks.filter((x) => x.project_id === id);
  const tasks = all.filter((x) => !x.idea);
  const ideas = all.filter((x) => x.idea);
  const open = sortTasks(tasks.filter((x) => x.status !== "Done"));
  const done = tasks
    .filter((x) => x.status === "Done")
    .sort((a, b) => (b.completed ?? b.updated).localeCompare(a.completed ?? a.updated));
  const notes = t.notes.filter((n) => n.project_id === id).sort((a, b) => b.date.localeCompare(a.date));
  const questions = t.questions.filter((q) => q.project_id === id);
  const openQ = questions.filter((q) => q.status === "open");
  const answeredQ = questions.filter((q) => q.status === "answered");
  const decisions = t.decisions.filter((d) => d.project_id === id);
  const openDecisions = decisions.filter((d) => d.status === "open");
  const resolved = decisions.filter((d) => d.status === "resolved");
  const waiting = t.waiting_on.filter((w) => w.project_id === id);
  const openW = waiting.filter((w) => !w.received);
  const goals = t.goals.filter((g) => g.project_ids.includes(id));
  const s = projectStats(t, p);

  const tabLabel: Record<Tab, string> = {
    overview: "Overview",
    actions: `Action items ${open.length}`,
    ideas: `Ideas ${ideas.length}`,
    notes: `Notes ${notes.length}`,
    questions: `Questions ${openQ.length}`,
    more: `Decisions & waiting ${openDecisions.length + openW.length}`,
  };
  const href = (x: Tab) => (x === "overview" ? `/projects/${id}` : `/projects/${id}?tab=${x}`);

  return (
    <div className="page">
      <Link href="/projects" className="back">
        &larr; All projects
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
          {p.links.map((l, i) =>
            l.url ? (
              <a key={i} className="chip" href={l.url} target="_blank" rel="noreferrer" title={l.where}>
                {l.label} &#8599;
              </a>
            ) : null
          )}
        </div>
        <p>{p.summary}</p>
        <Progress done={s.done} total={s.total} />
      </div>

      <nav className="tabs" aria-label="Project sections">
        {TABS.map((x) => (
          <Link key={x} href={href(x)} className={tab === x ? "on" : ""} scroll={false}>
            {tabLabel[x]}
          </Link>
        ))}
      </nav>

      <div className="panel pad capture-panel">
        <Capture key={tab} projectId={id} defaultKind={CAPTURE_FOR[tab]} />
      </div>

      {tab === "overview" && (
        <div className="pgrid">
          <div>
            <section className="panel pad">
              <div className="panel-head flat">
                <h2>Next up</h2>
                <Link href={href("actions")} className="small">
                  All {open.length} action items
                </Link>
              </div>
              {open.length ? (
                <div className="list-rows">
                  {open.slice(0, 6).map((x) => (
                    <TaskItem key={x.id} task={x} showProject={false} />
                  ))}
                </div>
              ) : (
                <p className="section-empty">No open action items.</p>
              )}
            </section>
            <section className="panel pad">
              <div className="panel-head flat">
                <h2>Questions to ask</h2>
                <Link href={href("questions")} className="small">
                  All questions
                </Link>
              </div>
              {openQ.length ? (
                <div className="list-rows">
                  {openQ.slice(0, 5).map((q) => (
                    <QuestionItem key={q.id} q={q} showProject={false} />
                  ))}
                </div>
              ) : (
                <p className="section-empty">No open questions.</p>
              )}
            </section>
            <section className="panel pad">
              <div className="panel-head flat">
                <h2>Latest notes</h2>
                <Link href={href("notes")} className="small">
                  All {notes.length} notes
                </Link>
              </div>
              {notes.length ? (
                <div className="notes-list">
                  {notes.slice(0, 2).map((n) => (
                    <NoteItem key={n.id} note={n} showProject={false} />
                  ))}
                </div>
              ) : (
                <p className="section-empty">No notes yet.</p>
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
            {(openDecisions.length > 0 || openW.length > 0) && (
              <section className="panel pad">
                <h2>Open loops</h2>
                <ul>
                  {openDecisions.length > 0 && (
                    <li>
                      <Link href={href("more")}>
                        {openDecisions.length} decision{openDecisions.length > 1 ? "s" : ""} to make
                      </Link>
                    </li>
                  )}
                  {openW.length > 0 && (
                    <li>
                      <Link href={href("more")}>Waiting on {openW.length} item{openW.length > 1 ? "s" : ""}</Link>
                    </li>
                  )}
                  {ideas.length > 0 && (
                    <li>
                      <Link href={href("ideas")}>
                        {ideas.length} idea{ideas.length > 1 ? "s" : ""} to review
                      </Link>
                    </li>
                  )}
                </ul>
              </section>
            )}
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
            {p.links.length > 0 && (
              <section className="panel pad">
                <h2>Links</h2>
                <ul>
                  {p.links.map((l, i) => (
                    <li key={i}>
                      {l.url ? (
                        <a href={l.url} target="_blank" rel="noreferrer">
                          {l.label}
                        </a>
                      ) : (
                        <strong>{l.label}</strong>
                      )}
                      {l.where && <span className="muted small"> ({l.where})</span>}
                    </li>
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
          </aside>
        </div>
      )}

      {tab === "actions" && (
        <section className="panel pad">
          {STATUSES.filter((st) => st !== "Done").map((st) => {
            const list = open.filter((x) => x.status === st);
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
      )}

      {tab === "ideas" && (
        <section className="panel pad">
          <p className="muted small" style={{ marginTop: 0 }}>
            Not committed. Click one to edit, make it an action item, or drop it.
          </p>
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
      )}

      {tab === "notes" && (
        <section className="notes-list">
          {notes.length ? (
            notes.map((n) => <NoteItem key={n.id} note={n} showProject={false} />)
          ) : (
            <p className="section-empty">No notes yet. Add one above.</p>
          )}
        </section>
      )}

      {tab === "questions" && (
        <section className="panel pad">
          {openQ.length ? (
            <div className="list-rows">
              {openQ.map((q) => (
                <QuestionItem key={q.id} q={q} showProject={false} />
              ))}
            </div>
          ) : (
            <p className="section-empty">No open questions.</p>
          )}
          {answeredQ.length > 0 && (
            <details className="group">
              <summary>
                Answered <span className="muted">{answeredQ.length}</span>
              </summary>
              <div className="list-rows">
                {answeredQ.map((q) => (
                  <QuestionItem key={q.id} q={q} showProject={false} />
                ))}
              </div>
            </details>
          )}
        </section>
      )}

      {tab === "more" && (
        <div className="pgrid even">
          <section className="panel pad">
            <h2>Decisions to make</h2>
            {openDecisions.length ? (
              openDecisions.map((d) => <DecisionItem key={d.id} d={d} />)
            ) : (
              <p className="section-empty">None open.</p>
            )}
            {resolved.length > 0 && (
              <details className="group">
                <summary>
                  Decided <span className="muted">{resolved.length}</span>
                </summary>
                {resolved.map((d) => (
                  <DecisionItem key={d.id} d={d} />
                ))}
              </details>
            )}
          </section>
          <section className="panel pad">
            <h2>Waiting on others</h2>
            {openW.length ? (
              <div className="list-rows">
                {openW.map((w) => (
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
            {waiting.length > openW.length && (
              <details className="group">
                <summary>
                  Received <span className="muted">{waiting.length - openW.length}</span>
                </summary>
                <div className="list-rows">
                  {waiting
                    .filter((w) => w.received)
                    .map((w) => (
                      <WaitingItem key={w.id} w={w} showProject={false} />
                    ))}
                </div>
              </details>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
