import Link from "next/link";
import PageHead from "@/components/shell/PageHead";
import Progress from "@/components/Progress";
import { getTracker } from "@/lib/store";
import { CATEGORIES, statusSlug } from "@/lib/tracker";
import { projectStats } from "@/lib/stats";

export default async function ProjectsPage() {
  const t = await getTracker();
  return (
    <>
      <PageHead icon="grid" title="All projects" sub="Grouped by goal area. Open one for its to-dos, questions, ideas and notes." add={{ kind: "project", label: "New project" }}>
        <Link href="/classic/board" className="s-textlink">
          Kanban board view &rarr;
        </Link>
      </PageHead>
      {CATEGORIES.map((c) => (
        <section key={c} className="s-group">
          <h2 className="s-group-head">
            <span className="s-group-title">{c}</span>
          </h2>
          {t.goals
            .filter((g) => g.category === c)
            .map((g) => (
              <p key={g.id} className="s-goal">
                <strong>Goal:</strong> {g.title}
              </p>
            ))}
          <div className="s-cards">
            {t.projects
              .filter((p) => p.category === c)
              .map((p) => {
                const s = projectStats(t, p);
                const q = t.questions.filter((x) => x.project_id === p.id && x.status === "open").length;
                return (
                  <Link key={p.id} href={`/projects/${p.id}`} className="s-card">
                    <div className="s-card-head">
                      <span className="s-card-title">{p.name}</span>
                      <span className={`pill col-${statusSlug(p.status)}`}>{p.status}</span>
                    </div>
                    <p className="s-card-text">{p.blockers[0] ? `Blocked: ${p.blockers[0]}` : p.next_steps[0] ? `Next: ${p.next_steps[0]}` : p.summary}</p>
                    <Progress done={s.done} total={s.total} />
                    <div className="s-card-stats">
                      <span>{s.open} open</span>
                      {s.urgent > 0 && <span className="bad">{s.urgent} urgent</span>}
                      {q > 0 && <span>{q} to ask</span>}
                      {s.ideas > 0 && <span>{s.ideas} ideas</span>}
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>
      ))}
    </>
  );
}
