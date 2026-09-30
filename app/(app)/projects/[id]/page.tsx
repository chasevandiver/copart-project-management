import { notFound } from "next/navigation";
import PageHead from "@/components/shell/PageHead";
import Groups from "@/components/shell/Groups";
import Progress from "@/components/Progress";
import WaitingAddButton from "@/components/shell/WaitingAddButton";
import { getTracker } from "@/lib/store";
import { statusSlug } from "@/lib/tracker";
import { projectStats } from "@/lib/stats";
import { projectView } from "@/lib/views";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTracker();
  const p = t.projects.find((x) => x.id === id);
  if (!p) notFound();
  const s = projectStats(t, p);
  const goals = t.goals.filter((g) => g.project_ids.includes(id));

  return (
    <>
      <PageHead title={p.name} add={{ project: p.id }}>
        <div className="s-proj-meta">
          <span className={`pill col-${statusSlug(p.status)}`}>{p.status}</span>
          {p.idea && <span className="s-tag idea">Idea, not committed</span>}
          <span>{p.category}</span>
          {goals.map((g) => (
            <span key={g.id}>Goal: {g.title}</span>
          ))}
        </div>
        <p className="s-head-sub">{p.summary}</p>
        {p.links.some((l) => l.url) && (
          <div className="s-links">
            {p.links
              .filter((l) => l.url)
              .map((l, i) => (
                <a key={i} href={l.url} target="_blank" rel="noreferrer" title={l.where}>
                  {l.label} &#8599;
                </a>
              ))}
          </div>
        )}
        <div className="s-proj-progress">
          <Progress done={s.done} total={s.total} />
        </div>
      </PageHead>

      {p.blockers.length > 0 && (
        <div className="s-callout bad">
          <strong>Blocked</strong>
          <ul>
            {p.blockers.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {(p.next_steps.length > 0 || (p.dependencies?.length ?? 0) > 0 || p.built.length > 0) && (
        <details className="s-about">
          <summary>About this project: next steps, dependencies, what is built</summary>
          <div className="s-about-grid">
            {p.next_steps.length > 0 && (
              <div>
                <h3>Next steps</h3>
                <ul>
                  {p.next_steps.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
            {p.dependencies && p.dependencies.length > 0 && (
              <div>
                <h3>Depends on</h3>
                <ul>
                  {p.dependencies.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
            {p.links.length > 0 && (
              <div>
                <h3>Links</h3>
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
                      {l.where && <span className="s-muted"> ({l.where})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {p.built.length > 0 && (
              <div className="wide">
                <h3>Built so far</h3>
                <ul>
                  {p.built.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </details>
      )}

      <Groups groups={projectView(t, id)} showProject={false} empty="Nothing here yet. Press New to add a to-do, question, idea or note." />
      <div className="s-after">
        <WaitingAddButton projectId={p.id} />
      </div>
    </>
  );
}
