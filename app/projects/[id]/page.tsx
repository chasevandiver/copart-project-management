import Link from "next/link";
import { notFound } from "next/navigation";
import TaskCard from "@/components/TaskCard";
import Decisions from "@/components/Decisions";
import { STATUSES, sortTasks, statusSlug, tracker } from "@/lib/tracker";
import { shortDate } from "@/lib/dates";

export function generateStaticParams() {
  return tracker.projects.map((p) => ({ id: p.id }));
}
export const dynamicParams = false;

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = tracker.projects.find((x) => x.id === id);
  if (!p) notFound();

  const tasks = tracker.tasks.filter((t) => t.project_id === id);
  const decisions = tracker.decisions.filter((d) => d.project_id === id);
  const openDecisions = decisions.filter((d) => d.status === "open");
  const resolved = decisions.filter((d) => d.status === "resolved");
  const waiting = tracker.waiting_on.filter((w) => w.project_id === id);
  const notes = tracker.notes.filter((n) => n.project_id === id);
  const goals = tracker.goals.filter((g) => g.project_ids.includes(id));

  return (
    <>
      <h1>
        {p.name} <span className={`chip status col-${statusSlug(p.status)}`}>{p.status}</span>
        {p.idea && <span className="chip idea">Idea, not committed</span>}
      </h1>
      <div className="meta-row" style={{ marginBottom: 8 }}>
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
              {l.url ? <a href={l.url} target="_blank" rel="noreferrer">{l.label}</a> : <strong>{l.label}</strong>}
              {l.where && <span className="muted"> ({l.where})</span>}
            </span>
          ))}
        </p>
      )}

      <div className="grid">
        <div className="card">
          <h3>Blockers</h3>
          {p.blockers.length ? (
            <ul>{p.blockers.map((b, i) => <li key={i}>{b}</li>)}</ul>
          ) : (
            <p className="section-empty">None.</p>
          )}
        </div>
        <div className="card">
          <h3>Next steps</h3>
          {p.next_steps.length ? (
            <ul>{p.next_steps.map((b, i) => <li key={i}>{b}</li>)}</ul>
          ) : (
            <p className="section-empty">None.</p>
          )}
        </div>
        {p.dependencies && p.dependencies.length > 0 && (
          <div className="card">
            <h3>Dependencies</h3>
            <ul>{p.dependencies.map((b, i) => <li key={i}>{b}</li>)}</ul>
          </div>
        )}
        <div className="card">
          <h3>Waiting on</h3>
          {waiting.length ? (
            <ul>
              {waiting.map((w) => (
                <li key={w.id}>
                  {w.what} <span className="muted small">({w.from_whom}, since {shortDate(w.since)})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="section-empty">Nothing.</p>
          )}
        </div>
      </div>

      <h2>Open decisions</h2>
      <Decisions items={openDecisions} />

      <h2>Tasks</h2>
      {STATUSES.map((s) => {
        const list = sortTasks(tasks.filter((t) => t.status === s));
        if (!list.length) return null;
        return (
          <div key={s} style={{ marginBottom: 14 }}>
            <h3>
              {s} <span className="muted">({list.length})</span>
            </h3>
            <div className="list">
              {list.map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          </div>
        );
      })}

      {p.built.length > 0 && (
        <>
          <h2>Built so far</h2>
          <div className="card">
            <ul>{p.built.map((b, i) => <li key={i}>{b}</li>)}</ul>
          </div>
        </>
      )}

      {resolved.length > 0 && (
        <>
          <h2>Resolved decisions</h2>
          <Decisions items={resolved} />
        </>
      )}

      {notes.length > 0 && (
        <>
          <h2>Notes</h2>
          {notes.map((n, i) => (
            <div key={i} className="card" style={{ marginBottom: 8 }}>
              <h3>{shortDate(n.date)}: {n.title}</h3>
              <ul>{n.body.map((b, j) => <li key={j}>{b}</li>)}</ul>
            </div>
          ))}
        </>
      )}
    </>
  );
}
