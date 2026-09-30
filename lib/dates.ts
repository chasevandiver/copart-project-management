// Date helpers. Run on the client so "today" is the viewer's today, not build day.

export function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function daysBetween(fromISO: string, toISO: string): number {
  const a = Date.UTC(+fromISO.slice(0, 4), +fromISO.slice(5, 7) - 1, +fromISO.slice(8, 10));
  const b = Date.UTC(+toISO.slice(0, 4), +toISO.slice(5, 7) - 1, +toISO.slice(8, 10));
  return Math.round((b - a) / 86400000);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function shortDate(iso: string): string {
  return `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}`;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function utc(iso: string): Date {
  return new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)));
}

export function addDaysISO(iso: string, n: number): string {
  const d = utc(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function weekday(iso: string): string {
  return WEEKDAYS[utc(iso).getUTCDay()];
}

/** "Wed, Sep 30" */
export function longDate(iso: string): string {
  return `${weekday(iso).slice(0, 3)}, ${shortDate(iso)}`;
}

/** 0 = Monday ... 6 = Sunday */
export function mondayIndex(iso: string): number {
  return (utc(iso).getUTCDay() + 6) % 7;
}

/** Friendly due label: "Today", "Tomorrow", "Fri", "Oct 12". */
export function dueLabel(due: string, today: string): { text: string; overdue: boolean; soon: boolean } {
  const d = daysBetween(today, due);
  if (d < 0) return { text: d === -1 ? "Yesterday" : shortDate(due), overdue: true, soon: false };
  if (d === 0) return { text: "Today", overdue: false, soon: true };
  if (d === 1) return { text: "Tomorrow", overdue: false, soon: true };
  if (d < 7) return { text: weekday(due).slice(0, 3), overdue: false, soon: d <= 3 };
  return { text: shortDate(due), overdue: false, soon: false };
}
