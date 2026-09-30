"use client";

import { useEffect, useMemo, useState } from "react";
import TaskItem from "./TaskItem";
import NoteItem from "./NoteItem";
import QuestionItem from "./QuestionItem";
import DecisionItem from "./DecisionItem";
import { WaitingItem } from "./WaitingItem";
import { useApp } from "./App";
import { sortTasks, type Decision, type Note, type Question, type Task, type WaitingOn } from "@/lib/tracker";

type Kind = "task" | "idea" | "note" | "question" | "waiting" | "decision";
type Item =
  | { kind: "task" | "idea"; key: string; project: string; person: string; open: boolean; text: string; sort: string; v: Task }
  | { kind: "note"; key: string; project: string; person: string; open: boolean; text: string; sort: string; v: Note }
  | { kind: "question"; key: string; project: string; person: string; open: boolean; text: string; sort: string; v: Question }
  | { kind: "waiting"; key: string; project: string; person: string; open: boolean; text: string; sort: string; v: WaitingOn }
  | { kind: "decision"; key: string; project: string; person: string; open: boolean; text: string; sort: string; v: Decision };

const KIND_LABEL: Record<Kind, string> = {
  task: "Action items",
  idea: "Ideas",
  note: "Notes",
  question: "Questions",
  waiting: "Waiting on",
  decision: "Decisions",
};
const KINDS: Kind[] = ["task", "idea", "note", "question", "waiting", "decision"];
const STORE = "pm-everything";

export default function AllItems({
  tasks,
  notes,
  questions,
  waiting,
  decisions,
}: {
  tasks: Task[];
  notes: Note[];
  questions: Question[];
  waiting: WaitingOn[];
  decisions: Decision[];
}) {
  const { projects } = useApp();
  const [kind, setKind] = useState<Kind | "all">("all");
  const [project, setProject] = useState("all");
  const [person, setPerson] = useState("all");
  const [state, setState] = useState<"open" | "closed" | "all">("open");
  const [group, setGroup] = useState<"project" | "type" | "person">("project");
  const [q, setQ] = useState("");

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORE) ?? "{}");
      if (s.group) setGroup(s.group);
      if (s.state) setState(s.state);
    } catch {}
    const k = new URLSearchParams(window.location.search).get("type");
    if (k && (KINDS as string[]).includes(k)) setKind(k as Kind);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify({ group, state }));
    } catch {}
  }, [group, state]);

  const items: Item[] = useMemo(() => {
    const out: Item[] = [];
    const order = new Map(sortTasks(tasks).map((t, i) => [t.id, String(i).padStart(4, "0")]));
    for (const t of tasks) {
      out.push({
        kind: t.idea ? "idea" : "task",
        key: t.id,
        project: t.project_id,
        person: t.owner,
        open: t.status !== "Done",
        text: `${t.title} ${t.notes} ${t.id}`,
        sort: "1" + order.get(t.id),
        v: t,
      });
    }
    for (const n of notes) {
      out.push({ kind: "note", key: n.id, project: n.project_id, person: "Me", open: true, text: `${n.title} ${n.body.join(" ")}`, sort: "2" + (99999999 - +n.date.replace(/-/g, "")), v: n });
    }
    for (const x of questions) {
      out.push({ kind: "question", key: x.id, project: x.project_id, person: x.ask, open: x.status === "open", text: `${x.question} ${x.answer ?? ""} ${x.ask}`, sort: "0" + x.raised, v: x });
    }
    for (const w of waiting) {
      out.push({ kind: "waiting", key: w.id, project: w.project_id, person: w.from_whom, open: !w.received, text: `${w.what} ${w.from_whom} ${w.notes}`, sort: "0" + w.since, v: w });
    }
    for (const d of decisions) {
      out.push({ kind: "decision", key: d.id, project: d.project_id, person: "Me", open: d.status === "open", text: `${d.question} ${d.options.join(" ")} ${d.answer ?? ""}`, sort: "0" + d.raised, v: d });
    }
    return out;
  }, [tasks, notes, questions, waiting, decisions]);

  const people = useMemo(() => [...new Set(items.map((i) => i.person))].sort(), [items]);
  const needle = q.trim().toLowerCase();

  const base = items.filter(
    (i) =>
      (project === "all" || i.project === project) &&
      (person === "all" || i.person === person) &&
      (state === "all" || (state === "open" ? i.open : !i.open)) &&
      (!needle || i.text.toLowerCase().includes(needle))
  );
  const shown = base.filter((i) => kind === "all" || i.kind === kind);
  const countOf = (k: Kind) => base.filter((i) => i.kind === k).length;

  const pname = (id: string) => projects.find((p) => p.id === id)?.name ?? "General";
  const groupKey = (i: Item) => (group === "project" ? pname(i.project) : group === "type" ? KIND_LABEL[i.kind] : i.person);
  const groups = new Map<string, Item[]>();
  for (const i of shown) groups.set(groupKey(i), [...(groups.get(groupKey(i)) ?? []), i]);
  const order =
    group === "type"
      ? KINDS.map((k) => KIND_LABEL[k]).filter((l) => groups.has(l))
      : group === "project"
      ? projects.map((p) => p.name).filter((n) => groups.has(n))
      : [...groups.keys()].sort((a, b) => (a === "Me" ? -1 : b === "Me" ? 1 : a.localeCompare(b)));

  return (
    <div>
      <div className="chips-row" role="tablist" aria-label="Type">
        <button type="button" className={`fchip${kind === "all" ? " on" : ""}`} onClick={() => setKind("all")}>
          All <span>{base.length}</span>
        </button>
        {KINDS.map((k) => (
          <button key={k} type="button" className={`fchip${kind === k ? " on" : ""}`} onClick={() => setKind(k)}>
            {KIND_LABEL[k]} <span>{countOf(k)}</span>
          </button>
        ))}
      </div>
      <div className="filters">
        <input className="search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search everything..." />
        <label>
          Project
          <select value={project} onChange={(e) => setProject(e.target.value)}>
            <option value="all">All</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Person
          <select value={person} onChange={(e) => setPerson(e.target.value)}>
            <option value="all">All</option>
            {people.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label>
          Show
          <select value={state} onChange={(e) => setState(e.target.value as typeof state)}>
            <option value="open">Open</option>
            <option value="closed">Done / answered</option>
            <option value="all">All</option>
          </select>
        </label>
        <label>
          Group by
          <select value={group} onChange={(e) => setGroup(e.target.value as typeof group)}>
            <option value="project">Project</option>
            <option value="type">Type</option>
            <option value="person">Person</option>
          </select>
        </label>
      </div>

      {!shown.length && <p className="section-empty">Nothing matches.</p>}
      {order.map((g) => (
        <section key={g} className="day">
          <h2>
            {g}
            <span className="day-count">{groups.get(g)!.length}</span>
          </h2>
          <div className="list-rows">
            {groups
              .get(g)!
              .sort((a, b) => KINDS.indexOf(a.kind) - KINDS.indexOf(b.kind) || a.sort.localeCompare(b.sort))
              .map((i) => (
                <Row key={i.kind + i.key} i={i} group={group} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Row({ i, group }: { i: Item; group: string }) {
  const showProject = group !== "project";
  switch (i.kind) {
    case "task":
    case "idea":
      return <TaskItem task={i.v} showProject={showProject} />;
    case "note":
      return <NoteItem note={i.v} showProject={showProject} />;
    case "question":
      return <QuestionItem q={i.v} showProject={showProject} showAsk={group !== "person"} />;
    case "waiting":
      return (
        <div>
          {group !== "person" && <div className="small muted">From {i.v.from_whom}</div>}
          <WaitingItem w={i.v} showProject={showProject} />
        </div>
      );
    case "decision":
      return <DecisionItem d={i.v} />;
  }
}
