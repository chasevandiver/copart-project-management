import Link from "next/link";
import Progress from "@/components/Progress";
import Capture from "@/components/Capture";
import QuestionItem from "@/components/QuestionItem";
import { Attention, Greeting, Tiles, WeekSoFar } from "@/components/HomeLive";
import { CATEGORIES, openWaiting, statusSlug, workTasks, type Project, type Tracker } from "@/lib/tracker";
import { projectStats } from "@/lib/stats";
import { activity } from "@/lib/activity";
import { longDate } from "@/lib/dates";
import { getTracker } from "@/lib/store";

function ProjectRow({ t, p }: { t: Tracker; p: Project }) {
  const s = projectStats(t, p);
  const openQ = t.questions.filter((q) => q.project_id === p.id && q.status === "open").length;
  const notes = t.notes.filter((n) => n.project_id === p.id).length;
  return (
    <Link href={`/classic/projects/${p.id}`} className="prow">
      <div className="prow-head">
        <span className="ptile-name">{p.name}</span>
        <span className={`pill col-${statusSlug(p.status)}`}>{p.status}</span>
      </div>
      {p.blockers[0] ? (
        <p className="ptile-line bad">
          <strong>Blocked:</strong> {p.blockers[0]}
        </p>
      ) : p.next_steps[0] ? (
        <p className="ptile-line">
          <strong>Next:</strong> {p.next_steps[0]}
        </p>
      ) : null}
      <Progress done={s.done} total={s.total} />
      <div className="ptile-stats">
        <span>{s.open} open</span>
        {s.urgent > 0 && <span className="bad">{s.urgent} urgent</span>}
        {openQ > 0 && <span>{openQ} to ask</span>}
        {s.ideas > 0 && <span>{s.ideas} ideas</span>}
        {notes > 0 && <span>{notes} notes</span>}
      </div>
    </Link>
  );
}

export default async function Home() {
  const t = await getTracker();
  const openQ = t.questions.filter((q) => q.status === "open").sort((a, b) => a.raised.localeCompare(b.raised));
  const askPeople = new Set(openQ.map((q) => q.ask)).size;
  const waiting = openWaiting(t);
  const recentNotes = [...t.notes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const pname = (id: string) => (id === "general" ? "General" : t.projects.find((p) => p.id === id)?.name ?? id);

  return (
    <div className="home">
      <div className="home-head">
        <div>
          <Greeting />
          <h1>Home</h1>
        </div>
      </div>

      <div className="panel pad capture-panel">
        <Capture />
      </div>

      <Tiles tasks={workTasks(t)} waiting={waiting} openQuestions={openQ.length} askPeople={askPeople} />

      <div className="home-grid">
        <div className="stack">
          <section className="panel">
            <div className="panel-head">
              <h2>Focus</h2>
              <Link href="/classic/schedule" className="small">
                Full schedule
              </Link>
            </div>
            <Attention tasks={workTasks(t)} />
          </section>

          {CATEGORIES.map((c) => {
            const projects = t.projects.filter((p) => p.category === c);
            if (!projects.length) return null;
            return (
              <section key={c} className="area">
                <div className="area-head">
                  <h2>{c}</h2>
                  <Link href="/classic/projects" className="small">
                    All projects
                  </Link>
                </div>
                <div className="ptiles">
                  {projects.map((p) => (
                    <ProjectRow key={p.id} t={t} p={p} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <aside className="side">
          <section className="panel">
            <div className="panel-head">
              <h2>Ask next</h2>
              <Link href="/classic/people" className="small">
                People
              </Link>
            </div>
            {openQ.length ? (
              <div className="list-rows tight">
                {openQ.slice(0, 6).map((q) => (
                  <QuestionItem key={q.id} q={q} />
                ))}
              </div>
            ) : (
              <p className="section-empty panel-body">No open questions. Add one above with Question.</p>
            )}
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Recent notes</h2>
              <Link href="/classic/items?type=note" className="small">
                All notes
              </Link>
            </div>
            {recentNotes.length ? (
              <ul className="rows">
                {recentNotes.map((n) => (
                  <li key={n.id}>
                    <Link href={n.project_id === "general" ? "/items?type=note" : `/projects/${n.project_id}?tab=notes`} className="row">
                      <span className="row-main">
                        <span className="row-title">{n.title}</span>
                        <span className="row-sub">
                          {longDate(n.date)} · {pname(n.project_id)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="section-empty panel-body">No notes yet.</p>
            )}
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>This week so far</h2>
              <Link href="/classic/progress" className="small">
                Progress
              </Link>
            </div>
            <WeekSoFar events={activity(t)} />
          </section>
        </aside>
      </div>
    </div>
  );
}
