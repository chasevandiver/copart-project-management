"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { parseQuick, type DraftKind } from "@/lib/parse";
import { suggestProjectId } from "@/lib/ops";
import { CATEGORIES, PRIORITIES, STATUSES, type Priority } from "@/lib/tracker";
import { longDate } from "@/lib/dates";
import { useApp } from "../App";
import { Icon } from "./Icon";

export type AddKind = DraftKind | "project";
type Opts = { kind?: AddKind; project?: string };
const Ctx = createContext<(o?: Opts) => void>(() => {});
export const useQuickAdd = () => useContext(Ctx);

const KINDS: { k: AddKind; label: string; icon: string }[] = [
  { k: "task", label: "To do", icon: "today" },
  { k: "question", label: "Question", icon: "question" },
  { k: "idea", label: "Idea", icon: "idea" },
  { k: "note", label: "Note", icon: "note" },
  { k: "project", label: "Project", icon: "grid" },
];

export function QuickAddProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<Opts | null>(null);
  // On a project page, new items go to that project unless you pick another.
  const path = usePathname();
  const m = path.match(/^\/projects\/([^/?]+)/);
  const defaultProject = m ? m[1] : undefined;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable;
      if (!typing && !e.metaKey && !e.ctrlKey && !e.altKey && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        setOpts({ project: defaultProject });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [defaultProject]);

  return (
    <Ctx.Provider value={(o) => setOpts({ project: defaultProject, ...o })}>
      {children}
      {opts && <QuickAddModal opts={opts} onClose={() => setOpts(null)} />}
    </Ctx.Provider>
  );
}

function QuickAddModal({ opts, onClose }: { opts: Opts; onClose: () => void }) {
  const { projects, owners, today, save, canEdit } = useApp();
  const router = useRouter();
  const [text, setText] = useState("");
  const [body, setBody] = useState("");
  // Explicit picks override what the text parser guessed.
  const [kind, setKind] = useState<AddKind | null>(opts.kind ?? null);
  const [project, setProject] = useState<string | null>(opts.project ?? null);
  const [who, setWho] = useState<string | null>(null);
  const [due, setDue] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority | null>(null);
  const [busy, setBusy] = useState(false);
  // New project fields
  const [pid, setPid] = useState<string | null>(null);
  const [category, setCategory] = useState<string>(projects.find((x) => x.id === opts.project)?.category ?? CATEGORIES[0]);
  const [pstatus, setPstatus] = useState<string>("Next");
  const [pidea, setPidea] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => input.current?.focus(), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const draft = useMemo(
    () => parseQuick(text, { today: today ?? "2000-01-01", projects, people: owners }),
    [text, today, projects, owners]
  );
  const k = kind ?? draft.kind;
  const p = project ?? draft.project_id ?? "general";
  const w = who ?? draft.who ?? (k === "question" ? "" : "Me");
  const d = due ?? draft.due ?? "";
  const pr = priority ?? draft.priority ?? "normal";
  const title = draft.title;
  const projectName = text.replace(/\s+/g, " ").trim();
  const projectId = pid ?? suggestProjectId(projectName, projects.map((x) => x.id));
  const ready = k === "project" ? !!projectName && !!projectId : k === "note" ? !!(title || body.trim()) : k === "question" ? !!title && !!w : !!title;

  async function submit() {
    if (!ready || busy) return;
    setBusy(true);
    let ok = false;
    if (k === "project") {
      const status = pidea ? "Backlog" : pstatus;
      ok = await save(
        { type: "project.add", id: projectId, name: projectName, category, status, summary: body.trim(), ...(pidea ? { idea: true } : {}) },
        "Project added"
      );
      setBusy(false);
      if (ok) {
        onClose();
        router.push(`/projects/${projectId}`);
      }
      return;
    }
    if (k === "note") ok = await save({ type: "note.add", project_id: p, title, text: body.trim() || title }, "Note saved");
    else if (k === "question") ok = await save({ type: "question.add", question: title, ask: w, project_id: p }, `Added to ask ${w}`);
    else
      ok = await save(
        {
          type: "task.add",
          fields: { title, project_id: p, owner: w || "Me", priority: pr, due: d || null, ...(k === "idea" ? { idea: true } : {}) },
        },
        k === "idea" ? "Idea saved" : "Added"
      );
    setBusy(false);
    if (ok) onClose();
  }

  const people = owners.filter((o) => o !== "Me");

  return (
    <div className="s-modal-back" onMouseDown={onClose}>
      <div className="s-modal" role="dialog" aria-modal="true" aria-label="Add" onMouseDown={(e) => e.stopPropagation()}>
        <div className="s-kinds" role="group" aria-label="Type">
          {KINDS.map((x) => (
            <button key={x.k} type="button" className={k === x.k ? "on" : ""} onClick={() => setKind(x.k)}>
              <Icon name={x.icon} size={14} /> {x.label}
            </button>
          ))}
        </div>
        <input
          ref={input}
          className="s-modal-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && k !== "note" && k !== "project") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={
            k === "project"
              ? "Project name, e.g. Dealer Newsletter"
              : k === "question"
              ? "Question for someone, e.g. Is there an Indiana prospect list? @Leo"
              : k === "note"
              ? "Note title"
              : k === "idea"
              ? "Idea"
              : "What needs doing? Try: Send Kyle agenda fri #dealer !"
          }
          maxLength={300}
          disabled={!canEdit}
        />
        {k === "project" && (
          <textarea
            className="s-modal-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.metaKey || e.ctrlKey) && submit()}
            placeholder="What is it and why? (optional)"
            rows={3}
            maxLength={2000}
          />
        )}
        {k === "note" && (
          <textarea
            className="s-modal-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.metaKey || e.ctrlKey) && submit()}
            placeholder="Write the note. One point per line."
            rows={6}
            maxLength={10000}
          />
        )}

        {k === "project" ? (
          <div className="s-fields">
            <label>
              <span>Goal area</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Status</span>
              <select value={pidea ? "Backlog" : pstatus} onChange={(e) => setPstatus(e.target.value)} disabled={pidea}>
                {STATUSES.filter((x) => x !== "Done").map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Short id</span>
              <input
                value={projectId}
                onChange={(e) => setPid(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))}
                placeholder="e.g. news"
                maxLength={12}
              />
            </label>
            <label className="s-check">
              <span>Just an idea</span>
              <input type="checkbox" checked={pidea} onChange={(e) => setPidea(e.target.checked)} />
            </label>
          </div>
        ) : (
        <div className="s-fields">
          <label>
            <span>Where</span>
            <select value={p} onChange={(e) => setProject(e.target.value)}>
              {projects.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          {k !== "note" && (
            <label>
              <span>{k === "question" ? "Ask whom" : "Who does it"}</span>
              <input list="qa-people" value={w} onChange={(e) => setWho(e.target.value)} placeholder={k === "question" ? "Name" : "Me"} maxLength={60} />
              <datalist id="qa-people">
                {(k === "question" ? people : owners).map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            </label>
          )}
          {(k === "task" || k === "idea") && (
            <>
              <label>
                <span>Due {d && today ? <em>{longDate(d)}</em> : null}</span>
                <input type="date" value={d} onChange={(e) => setDue(e.target.value)} />
              </label>
              <label>
                <span>Priority</span>
                <select value={pr} onChange={(e) => setPriority(e.target.value as Priority)}>
                  {PRIORITIES.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
            </>
          )}
        </div>
        )}

        <div className="s-modal-foot">
          <span className="s-hint">
            Shortcuts: <kbd>@name</kbd> <kbd>#project</kbd> <kbd>fri</kbd> <kbd>oct 4</kbd> <kbd>!</kbd> high <kbd>!!</kbd> urgent. End with <kbd>?</kbd> for a question.
          </span>
          <div className="s-modal-actions">
            <button type="button" className="s-btn ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="s-btn primary" onClick={submit} disabled={!ready || busy || !canEdit}>
              {k === "note" ? "Save note" : k === "project" ? "Create project" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
