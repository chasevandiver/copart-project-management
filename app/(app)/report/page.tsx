import Link from "next/link";
import PageHead from "@/components/shell/PageHead";
import Progress from "@/components/Progress";
import ReportTools from "@/components/shell/ReportTools";
import { Icon } from "@/components/shell/Icon";
import { getTracker, todayServer } from "@/lib/store";
import { statusSlug } from "@/lib/tracker";
import { longDate } from "@/lib/dates";
import { dueIn, reportText, weekLabel, weekOf, weeklyReport } from "@/lib/report";

// Completed tasks shown per project card; the rest fold into a count.
const SHOW = 4;

// The Thursday update for Ken: what got done, where each project stands, what is next.
export default async function ReportPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { week } = await searchParams;
  const t = await getTracker();
  const today = todayServer();
  const weekEnding = weekOf(week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? week : today);
  const r = weeklyReport(t, weekEnding, today);
  const wins = r.saved?.wins ?? [];
  const next = r.saved?.next.length ? r.saved.next : null;
  const asks = [...(r.saved?.asks ?? []), ...r.forKen];
  const days = dueIn(weekEnding, today);
  const when = days === 0 ? "Goes out today" : days > 0 ? `Goes out ${longDate(weekEnding)}` : `Went out ${longDate(weekEnding)}`;

  return (
    <>
      <PageHead
        icon="report"
        title="Weekly update"
        sub={`For Ken Rion, every Thursday. ${when}.`}
        add={false}
        actions={<ReportTools weekEnding={weekEnding} saved={r.saved} text={reportText(r, t.meta.owner, t.meta.role)} />}
      >
        <nav className="r-weeks" aria-label="Choose a week">
          <Link href={`/report?week=${r.prevWeek}`} className="s-btn ghost">
            &larr; Last week
          </Link>
          <span className="r-weeks-label">{weekLabel(r)}</span>
          {r.nextWeek && (
            <Link href={`/report?week=${r.nextWeek}`} className="s-btn ghost">
              Next week &rarr;
            </Link>
          )}
        </nav>
      </PageHead>

      <article className="r-sheet">
        <header className="r-top">
          <p className="r-eyebrow">Weekly update · {weekLabel(r)}</p>
          <h2 className="r-name">{t.meta.owner}</h2>
          <p className="r-role">{t.meta.role}</p>
          {r.saved?.headline ? (
            <p className="r-headline">{r.saved.headline}</p>
          ) : (
            <p className="r-headline r-placeholder no-print">Add a one-line headline for the week with Edit.</p>
          )}
        </header>

        <div className="r-stats">
          <Stat n={r.stats.completed} label="Completed" />
          <Stat n={r.stats.decisions} label="Decisions made" />
          <Stat n={r.stats.answered} label="Questions answered" />
          <Stat n={r.stats.active} label="Active projects" />
        </div>

        {wins.length > 0 ? (
          <Section title="Highlights">
            <ul className="r-wins">
              {wins.map((w, i) => (
                <li key={i}>
                  <Icon name="star" size={16} className="r-win-icon" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </Section>
        ) : (
          <p className="r-placeholder no-print">Add 3 to 5 highlights with Edit. These are the wins Ken can share.</p>
        )}

        <Section title="Projects">
          <div className="r-projects">
            {r.projects.map((p) => (
              <section key={p.id} className="r-proj">
                <div className="r-proj-head">
                  <h4>
                    <Link href={`/projects/${p.id}`}>{p.name}</Link>
                  </h4>
                  <span className={`pill col-${statusSlug(p.status)}`}>{p.status}</span>
                </div>
                <p className="r-proj-sum">{p.summary}</p>
                {p.done.length > 0 && (
                  <ul className="r-done">
                    {p.done.slice(0, SHOW).map((d, i) => (
                      <li key={i}>
                        <Icon name="check" size={14} className="r-done-icon" />
                        <span>{d}</span>
                      </li>
                    ))}
                    {p.done.length > SHOW && <li className="r-more">+ {p.done.length - SHOW} more done this week</li>}
                  </ul>
                )}
                {p.blocker && (
                  <p className="r-line bad">
                    <strong>Blocked:</strong> {p.blocker}
                  </p>
                )}
                {p.next && (
                  <p className="r-line">
                    <strong>Next:</strong> {p.next}
                  </p>
                )}
                {p.progress.total > 0 && <Progress done={p.progress.done} total={p.progress.total} />}
              </section>
            ))}
          </div>
          {r.onDeck.length > 0 && (
            <p className="r-ondeck">
              <strong>On deck:</strong> {r.onDeck.map((p) => p.name).join(", ")}
            </p>
          )}
        </Section>

        {r.decisions.length > 0 && (
          <Section title="Decisions made">
            <ul className="r-list">
              {r.decisions.map((d, i) => (
                <li key={i}>
                  <span>{d.question}</span> <strong>{d.answer}</strong> <span className="r-proj-tag">{d.project}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <div className="r-two">
          <Section title="Next week">
            {next ? (
              <ul className="r-list">
                {next.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            ) : r.comingUp.length ? (
              <ul className="r-list">
                {r.comingUp.map((x, i) => (
                  <li key={i}>
                    {x.title} <span className="r-proj-tag">{x.due ? longDate(x.due) : "Urgent"}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="r-placeholder">Nothing dated yet.</p>
            )}
          </Section>
          <Section title="Where I could use your help">
            {asks.length ? (
              <ul className="r-list">
                {asks.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            ) : (
              <p className="r-placeholder">Nothing this week.</p>
            )}
          </Section>
        </div>
      </article>
    </>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="r-stat">
      <span className="r-stat-n">{n}</span>
      <span className="r-stat-label">{label}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="r-section">
      <h3 className="r-h">{title}</h3>
      {children}
    </section>
  );
}
