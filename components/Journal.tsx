"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { KIND_LABEL, KIND_ORDER, type ActivityEvent, type EventKind } from "@/lib/activity";
import { projectHref } from "@/lib/tracker";
import { addDaysISO, daysBetween, longDate, mondayIndex, shortDate } from "@/lib/dates";
import { useApp } from "./App";

type Grain = "day" | "week" | "month";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const STORE = "pm-progress";

function periodKey(date: string, grain: Grain): string {
  if (grain === "day") return date;
  if (grain === "month") return date.slice(0, 7);
  return addDaysISO(date, -mondayIndex(date));
}

function periodLabel(key: string, grain: Grain, today: string): string {
  if (grain === "day") {
    const d = daysBetween(key, today);
    return d === 0 ? "Today" : d === 1 ? "Yesterday" : longDate(key);
  }
  if (grain === "month") {
    const label = `${MONTHS[+key.slice(5, 7) - 1]} ${key.slice(0, 4)}`;
    return key === today.slice(0, 7) ? `This month (${label})` : label;
  }
  const end = addDaysISO(key, 6);
  const range = `${shortDate(key)} to ${shortDate(end)}`;
  const thisWeek = periodKey(today, "week");
  if (key === thisWeek) return `This week (${range})`;
  if (key === addDaysISO(thisWeek, -7)) return `Last week (${range})`;
  return `Week of ${range}`;
}

// Kinds that show what got finished. The "added" kinds are shown but collapsed.
const OUTCOMES: EventKind[] = ["done", "decided", "answered", "received", "note"];

export default function Journal({ events }: { events: ActivityEvent[] }) {
  const { projects, today } = useApp();
  const [grain, setGrain] = useState<Grain>("week");
  const [mine, setMine] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORE) ?? "{}");
      if (s.grain) setGrain(s.grain);
      if (s.mine) setMine(true);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify({ grain, mine }));
    } catch {}
  }, [grain, mine]);

  if (!today) return null;

  const shown = events.filter((e) => !mine || !["done", "added", "idea"].includes(e.kind) || e.who === "Me");
  const groups = new Map<string, ActivityEvent[]>();
  for (const e of shown) {
    if (e.date > today) continue;
    const k = periodKey(e.date, grain);
    groups.set(k, [...(groups.get(k) ?? []), e]);
  }
  const keys = [...groups.keys()].sort((a, b) => b.localeCompare(a));
  const current = periodKey(today, grain);
  const cur = groups.get(current) ?? [];
  const count = (list: ActivityEvent[], k: EventKind) => list.filter((e) => e.kind === k).length;
  const pname = (id: string) => projects.find((p) => p.id === id)?.name ?? "General";

  return (
    <div>
      <div className="sched-bar">
        <div className="seg" role="group" aria-label="Group by">
          {(["day", "week", "month"] as Grain[]).map((g) => (
            <button key={g} type="button" className={grain === g ? "on" : ""} onClick={() => setGrain(g)}>
              {g === "day" ? "Day" : g === "week" ? "Week" : "Month"}
            </button>
          ))}
        </div>
        <label className="small muted toggle">
          <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} /> Only tasks I own
        </label>
      </div>

      <div className="tiles">
        {(["done", "note", "answered", "decided"] as EventKind[]).map((k) => (
          <div key={k} className="tile static">
            <span className="tile-label">{KIND_LABEL[k]}</span>
            <span className="tile-value">{count(cur, k)}</span>
            <span className="tile-sub">{periodLabel(current, grain, today).replace(/ \(.*\)/, "").toLowerCase()}</span>
          </div>
        ))}
      </div>

      {!keys.length && <p className="section-empty">Nothing yet.</p>}
      {keys.map((k) => {
        const list = groups.get(k)!;
        const outcomes = OUTCOMES.reduce((n, kind) => n + count(list, kind), 0);
        return (
          <section key={k} className="day">
            <h2>
              {periodLabel(k, grain, today)}
              <span className="day-sub">
                {KIND_ORDER.filter((kind) => count(list, kind))
                  .map((kind) => `${count(list, kind)} ${KIND_LABEL[kind].toLowerCase()}`)
                  .join(" · ")}
              </span>
            </h2>
            {KIND_ORDER.map((kind) => {
              const items = list.filter((e) => e.kind === kind);
              if (!items.length) return null;
              const inner = (
                <ul className="journal-list">
                  {items.map((e) => (
                    <li key={e.kind + e.id}>
                      <span className={`jk jk-${kind}`} aria-hidden />
                      <span className="j-main">
                        <Link href={projectHref(e.project_id)} className="j-title">
                          {e.title}
                        </Link>
                        <span className="ti-meta">
                          <span>{pname(e.project_id)}</span>
                          {e.who && <span>{kind === "asked" || kind === "answered" ? `Ask ${e.who}` : e.who}</span>}
                          {grain !== "day" && <span>{shortDate(e.date)}</span>}
                          {e.detail && <span className="j-detail">{e.detail}</span>}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              );
              const collapsed = !OUTCOMES.includes(kind) && (outcomes > 0 || items.length > 5);
              return collapsed ? (
                <details key={kind} className="group">
                  <summary>
                    {KIND_LABEL[kind]} <span className="muted">{items.length}</span>
                  </summary>
                  {inner}
                </details>
              ) : (
                <div key={kind} className="group">
                  <h3>
                    {KIND_LABEL[kind]} <span className="muted">{items.length}</span>
                  </h3>
                  {inner}
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
