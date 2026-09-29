import { tracker } from "@/lib/tracker";

export default function PeoplePage() {
  const byDept = new Map<string, typeof tracker.people>();
  for (const p of tracker.people) {
    const d = p.department || "Department not set";
    byDept.set(d, [...(byDept.get(d) ?? []), p]);
  }
  const depts = [...byDept.keys()].sort((a, b) =>
    a === "Department not set" ? 1 : b === "Department not set" ? -1 : a.localeCompare(b)
  );

  const matches = (owner: string, name: string) => owner === name || owner === name.split(" ")[0];

  return (
    <>
      <h1>People</h1>
      {depts.map((d) => (
        <div key={d}>
          <h2>{d}</h2>
          <div className="grid">
            {byDept.get(d)!.map((p) => {
              const tasks = tracker.tasks.filter((t) => t.status !== "Done" && matches(t.owner, p.name)).length;
              const waiting = tracker.waiting_on.filter((w) => matches(w.from_whom, p.name)).length;
              return (
                <div key={p.name} className="card person">
                  <strong>{p.name}</strong>
                  {p.title && <span>{p.title}</span>}
                  <span className="small muted">{p.relationship}</span>
                  <span className="small">{p.contact || <span className="muted">No contact yet</span>}</span>
                  {(tasks > 0 || waiting > 0) && (
                    <div className="meta-row">
                      {tasks > 0 && <span className="chip">{tasks} open tasks</span>}
                      {waiting > 0 && <span className="chip">{waiting} waiting on</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
