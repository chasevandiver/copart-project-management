import Link from "next/link";
import Progress from "@/components/Progress";
import { Attention, Greeting, Tiles } from "@/components/HomeLive";
import { CATEGORIES, statusSlug, tracker, type Project } from "@/lib/tracker";
import { projectStats } from "@/lib/stats";
import { shortDate } from "@/lib/dates";

function ProjectTile({ p }: { p: Project }) {
  const s = projectStats(p);
  const next = p.next_steps[0];
  return (
    <Link href={`/projects/${p.id}`} className="ptile">
      <div className="ptile-head">
        <span className="ptile-name">{p.name}</span>
        <span className={`pill col-${statusSlug(p.status)}`}>{p.status}</span>
      </div>
      {p.idea && <span className="ptile-idea">Idea, not committed</span>}
      <p className="ptile-summary">{p.summary}</p>
      {p.blockers[0] ? (
        <p className="ptile-line bad">
          <strong>Blocked:</strong> {p.blockers[0]}
        </p>
      ) : next ? (
        <p className="ptile-line">
          <strong>Next:</strong> {next}
        </p>
      ) : null}
      <Progress done={s.done} total={s.total} />
      <div className="ptile-stats">
        <span>{s.open} open</span>
        {s.urgent > 0 && <span className="bad">{s.urgent} urgent</span>}
        {s.blocked > 0 && <span className="bad">{s.blocked} blocked</span>}
        {s.waitingOn > 0 && <span>{s.waitingOn} waiting</span>}
        {s.decisions > 0 && <span>{s.decisions} decisions</span>}
      </div>
    </Link>
  );
}

export default function Home() {
  const names: Record<string, string> = { general: "General" };
  for (const p of tracker.projects) names[p.id] = p.name;
  const openDecisions = tracker.decisions.filter((d) => d.status === "open").length;
  const waiting = [...tracker.waiting_on].sort((a, b) => a.since.localeCompare(b.since));
  const byWho = new Map<string, number>();
  for (const w of waiting) byWho.set(w.from_whom, (byWho.get(w.from_whom) ?? 0) + 1);

  return (
    <div className="home">
      <div className="home-head">
        <div>
          <Greeting />
          <h1>Dashboard</h1>
        </div>
        <span className="muted small">Tracker updated {shortDate(tracker.meta.last_updated)}</span>
      </div>

      <Tiles tasks={tracker.tasks} waiting={tracker.waiting_on} openDecisions={openDecisions} />

      <div className="home-grid">
        <div>
          {CATEGORIES.map((c) => {
            const projects = tracker.projects.filter((p) => p.category === c);
            const goals = tracker.goals.filter((g) => g.category === c);
            if (!projects.length) return null;
            return (
              <section key={c} className="area">
                <div className="area-head">
                  <h2>{c}</h2>
                  {goals.map((g) => (
                    <span key={g.id} className="area-goal">
                      Goal: {g.title}
                    </span>
                  ))}
                </div>
                <div className="ptiles">
                  {projects.map((p) => (
                    <ProjectTile key={p.id} p={p} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <aside className="side">
          <section className="panel">
            <div className="panel-head">
              <h2>Needs attention</h2>
              <Link href="/week" className="small">
                This week
              </Link>
            </div>
            <Attention tasks={tracker.tasks} names={names} />
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Waiting on</h2>
              <Link href="/waiting" className="small">
                All
              </Link>
            </div>
            <ul className="rows">
              {[...byWho.entries()].map(([who, n]) => (
                <li key={who}>
                  <Link href="/waiting" className="row">
                    <span className="row-main">
                      <span className="row-title">{who}</span>
                      <span className="row-sub">
                        {waiting
                          .filter((w) => w.from_whom === who)
                          .map((w) => w.what)
                          .slice(0, 2)
                          .join("; ")}
                      </span>
                    </span>
                    <span className="row-count">{n}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
