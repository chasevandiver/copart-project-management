// Quick-add parser. Turns one typed line into a draft item.
//   "?" at the start or end         -> question
//   "idea:" / "note:" / "q:" prefix -> idea / note / question
//   "@Leo"                          -> who to ask (question) or owner (task)
//   "#rt" / "#dealer"               -> project
//   "today", "tomorrow", "fri", "oct 4", "10/4", "next week" -> due date
//   "!" high, "!!" urgent
import { addDaysISO, mondayIndex } from "./dates";
import type { Priority } from "./tracker";

export type DraftKind = "task" | "idea" | "note" | "question";
export type Draft = {
  kind: DraftKind;
  title: string;
  project_id?: string;
  who?: string;
  due?: string;
  priority?: Priority;
};

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Next date on or after today (strictly after for weekdays) matching month/day. */
function monthDay(m: number, d: number, today: string): string | undefined {
  if (m < 1 || m > 12 || d < 1 || d > 31) return undefined;
  let y = +today.slice(0, 4);
  let iso = `${y}-${pad(m)}-${pad(d)}`;
  if (iso < today) iso = `${++y}-${pad(m)}-${pad(d)}`;
  return iso;
}

export function parseQuick(
  input: string,
  opts: { today: string; projects: { id: string; name: string }[]; people: string[] }
): Draft {
  let s = " " + input.trim() + " ";
  const d: Draft = { kind: "task", title: "" };
  const take = (re: RegExp) => {
    const m = s.match(re);
    if (m) s = s.replace(m[0], " ");
    return m;
  };

  const prefix = take(/^\s*(idea|note|q|question|task|todo)\s*:\s*/i);
  if (prefix) {
    const p = prefix[1].toLowerCase();
    d.kind = p === "idea" ? "idea" : p === "note" ? "note" : p === "q" || p === "question" ? "question" : "task";
  }
  if (take(/^\s*\?\s*/)) d.kind = "question";

  const bang = take(/\s(!{1,2})(?=\s)/);
  if (bang) d.priority = bang[1].length === 2 ? "urgent" : "high";

  const at = s.match(/\s@([A-Za-z][\w.-]*)/);
  if (at) {
    const word = at[1].toLowerCase();
    const match =
      opts.people.find((p) => p.toLowerCase() === word) ??
      opts.people.find((p) => p.split(" ")[0].toLowerCase() === word) ??
      opts.people.find((p) => p.toLowerCase().startsWith(word)) ??
      opts.people.find((p) => p.toLowerCase().includes(word));
    d.who = match ?? at[1].charAt(0).toUpperCase() + at[1].slice(1);
    s = s.replace(at[0], " ");
  }

  const hash = s.match(/\s#([\w-]+)/);
  if (hash) {
    const w = hash[1].toLowerCase();
    const p =
      opts.projects.find((x) => x.id.toLowerCase() === w) ??
      opts.projects.find((x) => x.name.toLowerCase().split(/\s+/).some((part) => part.startsWith(w))) ??
      opts.projects.find((x) => x.name.toLowerCase().includes(w));
    if (p) {
      d.project_id = p.id;
      s = s.replace(hash[0], " ");
    }
  }

  const today = opts.today;
  let m: RegExpMatchArray | null;
  if ((m = take(/\s(today|tod)(?=\s)/i))) d.due = today;
  else if ((m = take(/\s(tomorrow|tmrw|tmr)(?=\s)/i))) d.due = addDaysISO(today, 1);
  else if ((m = take(/\snext week(?=\s)/i))) d.due = addDaysISO(today, 7 - mondayIndex(today));
  else if ((m = take(/\s(?:on\s+|by\s+|due\s+)?(mon|tue|wed|thu|fri|sat|sun)[a-z]*(?=\s)/i))) {
    const target = DAYS.indexOf(m[1].toLowerCase());
    let diff = (target - mondayIndex(today) + 7) % 7;
    if (diff === 0) diff = 7;
    d.due = addDaysISO(today, diff);
  } else if ((m = take(/\s(?:on\s+|by\s+|due\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?=\s)/i))) {
    d.due = monthDay(MONTHS.indexOf(m[1].toLowerCase()) + 1, +m[2], today);
  } else if ((m = take(/\s(?:on\s+|by\s+|due\s+)?(\d{1,2})\/(\d{1,2})(?=\s)/))) {
    d.due = monthDay(+m[1], +m[2], today);
  }

  let title = s.replace(/\s+/g, " ").trim();
  if (d.kind === "task" && title.endsWith("?")) d.kind = "question";
  d.title = title;
  return d;
}
