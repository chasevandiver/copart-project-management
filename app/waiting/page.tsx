import Link from "next/link";
import DaysSince from "@/components/DaysSince";
import { PRIORITY_RANK, projectName, tracker } from "@/lib/tracker";

export default function WaitingPage() {
  const groups = new Map<string, typeof tracker.waiting_on>();
  for (const w of tracker.waiting_on) {
    groups.set(w.from_whom, [...(groups.get(w.from_whom) ?? []), w]);
  }
  const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

  return (
    <>
      <h1>Waiting on</h1>
      {sorted.length === 0 && <p className="section-empty">Not waiting on anyone.</p>}
      <div className="grid">
        {sorted.map(([who, items]) => (
          <div key={who} className="card">
            <h3>
              {who} <span className="muted">({items.length})</span>
            </h3>
            <div className="list">
              {[...items]
                .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.since.localeCompare(b.since))
                .map((w) => (
                  <div key={w.id} className={`task p-${w.priority}`}>
                    <div className="title">{w.what}</div>
                    <div className="meta">
                      <span className="chip">{w.id}</span>
                      <Link className="chip" href={w.project_id === "general" ? "/projects" : `/projects/${w.project_id}`}>
                        {projectName(w.project_id)}
                      </Link>
                      {w.priority === "high" && <span className="chip high">high</span>}
                      {w.priority === "urgent" && <span className="chip urgent">urgent</span>}
                      <DaysSince date={w.since} />
                    </div>
                    {w.notes && <div className="notes">{w.notes}</div>}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
