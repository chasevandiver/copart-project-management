import type { Decision } from "@/lib/tracker";
import { shortDate } from "@/lib/dates";

export default function Decisions({ items }: { items: Decision[] }) {
  if (!items.length) return <p className="section-empty">None.</p>;
  return (
    <div className="card">
      {items.map((d) => (
        <div key={d.id} className="decision">
          <div>
            <strong>{d.question}</strong> <span className="chip">{d.id}</span>
          </div>
          {d.status === "open" ? (
            <div className="small muted">
              Options: {d.options.join(" / ")} · raised {shortDate(d.raised)}
            </div>
          ) : (
            <div className="small">
              Answer: {d.answer} <span className="muted">({d.resolved && shortDate(d.resolved)})</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
