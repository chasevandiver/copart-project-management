import { WaitingAdd, WaitingItem } from "@/components/WaitingItem";
import { PRIORITY_RANK, openWaiting } from "@/lib/tracker";
import { getTracker } from "@/lib/store";

export default async function WaitingPage() {
  const t = await getTracker();
  const groups = new Map<string, typeof t.waiting_on>();
  for (const w of openWaiting(t)) {
    groups.set(w.from_whom, [...(groups.get(w.from_whom) ?? []), w]);
  }
  const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

  return (
    <div className="page">
      <h1>Waiting on</h1>
      <p className="muted small">Things I need from other people. Tap "Got it" when it arrives.</p>
      <WaitingAdd />
      {sorted.length === 0 && <p className="section-empty">Not waiting on anyone.</p>}
      <div className="grid" style={{ marginTop: 16 }}>
        {sorted.map(([who, items]) => (
          <section key={who} className="panel pad">
            <h2>
              {who} <span className="muted">{items.length}</span>
            </h2>
            <div className="list-rows">
              {[...items]
                .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.since.localeCompare(b.since))
                .map((w) => (
                  <WaitingItem key={w.id} w={w} />
                ))}
            </div>
          </section>
        ))}
      </div>
      {t.waiting_on.some((w) => w.received) && (
        <details className="group">
          <summary>
            Received <span className="muted">{t.waiting_on.filter((w) => w.received).length}</span>
          </summary>
          <div className="list-rows">
            {t.waiting_on
              .filter((w) => w.received)
              .map((w) => (
                <WaitingItem key={w.id} w={w} />
              ))}
          </div>
        </details>
      )}
    </div>
  );
}
