// Checks tracker/tracker.json before commit and build.
// Exits non-zero on errors. Warnings print but do not fail.
import { readFileSync } from "node:fs";
import { validateTracker } from "../lib/validate-core.mjs";

const raw = readFileSync(new URL("../tracker/tracker.json", import.meta.url), "utf8");

let t;
try {
  t = JSON.parse(raw);
} catch (e) {
  console.error(`tracker.json is not valid JSON: ${e.message}`);
  process.exit(1);
}

const { errors, warnings } = validateTracker(t, raw);
for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
if (errors.length) {
  console.error(`\ntracker.json: ${errors.length} error(s)`);
  process.exit(1);
}
console.log(
  `tracker.json OK: ${t.goals.length} goals, ${t.projects.length} projects, ${t.tasks.length} tasks, ${t.waiting_on.length} waiting, ` +
    `${t.decisions.filter((d) => d.status === "open").length} open decisions, ${t.people.length} people`
);
