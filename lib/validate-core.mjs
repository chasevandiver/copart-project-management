// Shared tracker checks. Used by scripts/validate.mjs (CLI) and the board's save API.
// Returns { errors, warnings }. Never throws on bad data.

export function validateTracker(t, raw = JSON.stringify(t, null, 2)) {
  const errors = [];
  const warnings = [];
  const STATUSES = ["Backlog", "Next", "In Progress", "Waiting", "Blocked", "Done"];
  const PRIORITIES = ["urgent", "high", "normal", "low"];
  const FIXED_OWNERS = ["Me", "Work Claude", "Claude Code", "IT", "Leo", "Legal"];
  const CATEGORIES = ["AI Tools", "Marketing Efforts"];
  const DATE = /^\d{4}-\d{2}-\d{2}$/;

  for (const key of ["meta", "goals", "projects", "tasks", "waiting_on", "questions", "decisions", "people", "notes"]) {
    if (!(key in t)) errors.push(`missing top-level "${key}"`);
  }

  const projectIds = new Set((t.projects ?? []).map((p) => p.id));
  const personNames = new Set();
  for (const p of t.people ?? []) {
    personNames.add(p.name);
    personNames.add(p.name.split(" ")[0]);
  }
  const validOwner = (o) => FIXED_OWNERS.includes(o) || personNames.has(o);
  const validProject = (id) => id === "general" || projectIds.has(id);
  const checkDate = (where, v, nullable) => {
    if (v === null && nullable) return;
    if (typeof v !== "string" || !DATE.test(v)) errors.push(`${where}: bad date "${v}" (use YYYY-MM-DD)`);
  };

  const seen = new Set();
  const checkId = (where, id) => {
    if (!id) return errors.push(`${where}: missing id`);
    if (seen.has(id)) errors.push(`duplicate id "${id}"`);
    seen.add(id);
  };

  for (const p of t.projects ?? []) {
    checkId(`project ${p.name}`, p.id);
    if (!STATUSES.includes(p.status)) errors.push(`project ${p.id}: bad status "${p.status}"`);
    if (!CATEGORIES.includes(p.category)) errors.push(`project ${p.id}: category must be one of ${CATEGORIES.join(", ")}`);
    if (p.dependencies && !Array.isArray(p.dependencies)) errors.push(`project ${p.id}: "dependencies" must be an array`);
    for (const k of ["built", "links", "blockers", "next_steps"]) {
      if (!Array.isArray(p[k])) errors.push(`project ${p.id}: "${k}" must be an array`);
    }
  }

  for (const g of t.goals ?? []) {
    const w = `goal ${g.id}`;
    checkId(w, g.id);
    if (!g.title) errors.push(`${w}: missing title`);
    if (!CATEGORIES.includes(g.category)) errors.push(`${w}: category must be one of ${CATEGORIES.join(", ")}`);
    if (!STATUSES.includes(g.status)) errors.push(`${w}: bad status "${g.status}"`);
    for (const id of g.project_ids ?? []) if (!projectIds.has(id)) errors.push(`${w}: unknown project "${id}"`);
    checkDate(w + " created", g.created, false);
    checkDate(w + " updated", g.updated, false);
  }

  for (const x of t.tasks ?? []) {
    const w = `task ${x.id}`;
    checkId(w, x.id);
    if (!x.title) errors.push(`${w}: missing title`);
    if (!STATUSES.includes(x.status)) errors.push(`${w}: bad status "${x.status}"`);
    if (!PRIORITIES.includes(x.priority)) errors.push(`${w}: bad priority "${x.priority}"`);
    if (!validOwner(x.owner)) errors.push(`${w}: unknown owner "${x.owner}" (add them to people first)`);
    if (!validProject(x.project_id)) errors.push(`${w}: unknown project "${x.project_id}"`);
    checkDate(w + " due", x.due, true);
    checkDate(w + " created", x.created, false);
    checkDate(w + " updated", x.updated, false);
    if (x.completed !== undefined) checkDate(w + " completed", x.completed, true);
    if (x.idea !== undefined && typeof x.idea !== "boolean") errors.push(`${w}: "idea" must be true or false`);
    if (x.recurring !== undefined && x.recurring !== "weekly") errors.push(`${w}: recurring must be "weekly"`);
  }

  for (const x of t.waiting_on ?? []) {
    const w = `waiting_on ${x.id}`;
    checkId(w, x.id);
    if (!x.what || !x.from_whom) errors.push(`${w}: needs "what" and "from_whom"`);
    if (!validProject(x.project_id)) errors.push(`${w}: unknown project "${x.project_id}"`);
    if (x.priority && !PRIORITIES.includes(x.priority)) errors.push(`${w}: bad priority "${x.priority}"`);
    checkDate(w + " since", x.since, false);
    if (x.received !== undefined) checkDate(w + " received", x.received, true);
  }

  for (const x of t.decisions ?? []) {
    const w = `decision ${x.id}`;
    checkId(w, x.id);
    if (!validProject(x.project_id)) errors.push(`${w}: unknown project "${x.project_id}"`);
    if (!["open", "resolved"].includes(x.status)) errors.push(`${w}: status must be open or resolved`);
    checkDate(w + " raised", x.raised, false);
    if (x.status === "resolved") {
      if (!x.answer) errors.push(`${w}: resolved but no answer`);
      checkDate(w + " resolved", x.resolved, false);
    }
  }

  for (const q of t.questions ?? []) {
    const w = `question ${q.id}`;
    checkId(w, q.id);
    if (!q.question) errors.push(`${w}: missing question`);
    if (!q.ask) errors.push(`${w}: missing who to ask`);
    if (!validProject(q.project_id)) errors.push(`${w}: unknown project "${q.project_id}"`);
    if (!["open", "answered"].includes(q.status)) errors.push(`${w}: status must be open or answered`);
    checkDate(w + " raised", q.raised, false);
    if (q.status === "answered") {
      if (!q.answer) errors.push(`${w}: answered but no answer`);
      checkDate(w + " answered", q.answered, false);
    }
  }

  for (const n of t.notes ?? []) {
    checkId(`note "${n.title}"`, n.id);
    if (!Array.isArray(n.body)) errors.push(`note ${n.id}: body must be a list of lines`);
    checkDate(`note "${n.title}"`, n.date, false);
    if (!validProject(n.project_id)) errors.push(`note "${n.title}": unknown project "${n.project_id}"`);
  }

  checkDate("meta.last_updated", t.meta?.last_updated, false);

  // Guardrails: things that must never be stored here.
  const secretPatterns = [
    [/sk-[A-Za-z0-9_-]{16,}/, "looks like an API key (sk-...)"],
    [/AKIA[0-9A-Z]{16}/, "looks like an AWS key"],
    [/(api[_-]?key|secret|password|passcode)\s*[:=]\s*\S{6,}/i, "looks like a credential value"],
    [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, "contains an email address (owner emails do not belong here; work contacts need Chase's OK)"],
    [/\b\d{2}-\d{7}\b/, "looks like a federal Tax ID (EIN)"],
    [/\b[13]\d{10}\b/, "looks like a Texas taxpayer number"],
  ];
  for (const [re, msg] of secretPatterns) {
    const m = raw.match(re);
    if (m) {
      const isEmail = msg.startsWith("contains an email");
      (isEmail ? warnings : errors).push(`guardrail: ${msg}: "${m[0].slice(0, 12)}..."`);
    }
  }
  if (/\u2014/.test(raw)) warnings.push("style: em dash found; use a period, comma or colon instead");

  return { errors, warnings };
}
