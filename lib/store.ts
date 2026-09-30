// Server-only: loads and saves tracker.json.
//
// Production (GITHUB_TOKEN set): reads the file live from GitHub and saves edits as
// commits on the branch, so git stays the single source of truth.
// Local dev (no token): reads and writes tracker/tracker.json on disk.
// Production without a token: read-only, using the copy bundled at build time.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import bundled from "../tracker/tracker.json";
import { validateTracker } from "./validate-core.mjs";
import { applyOp, OpError, type Op } from "./ops";
import { normalize, type Tracker } from "./tracker";

const REPO = process.env.GITHUB_REPO || "chasevandiver/copart-project-management";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const FILE = "tracker/tracker.json";
const TZ = process.env.TRACKER_TZ || "America/Chicago";

type Mode = "github" | "local" | "readonly";

export function storeMode(): Mode {
  if (process.env.GITHUB_TOKEN) return "github";
  if (process.env.NODE_ENV !== "production") return "local";
  return "readonly";
}

export function canEdit(): boolean {
  return storeMode() !== "readonly";
}

/** Today in Chase's time zone, YYYY-MM-DD. */
export function todayServer(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date()
  );
}

const localPath = () => path.join(process.cwd(), FILE);

function ghHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "copart-pm-board",
  };
}

async function ghRead(): Promise<{ tracker: Tracker; sha: string }> {
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}?ref=${BRANCH}`, {
    headers: ghHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GitHub read failed (${res.status})`);
  const body = (await res.json()) as { content: string; sha: string };
  const text = Buffer.from(body.content, "base64").toString("utf8");
  return { tracker: normalize(JSON.parse(text) as Tracker), sha: body.sha };
}

async function ghWrite(t: Tracker, sha: string, message: string): Promise<"ok" | "conflict"> {
  const content = Buffer.from(JSON.stringify(t, null, 2) + "\n", "utf8").toString("base64");
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
    method: "PUT",
    headers: { ...ghHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ message, content, sha, branch: BRANCH }),
    cache: "no-store",
  });
  if (res.status === 409 || res.status === 422) return "conflict";
  if (!res.ok) throw new Error(`GitHub save failed (${res.status})`);
  return "ok";
}

export async function getTracker(): Promise<Tracker> {
  const mode = storeMode();
  if (mode === "github") {
    try {
      return (await ghRead()).tracker;
    } catch (e) {
      // Keep the site up if GitHub is down or the token is wrong. Saves will still report the error.
      console.error(e);
      return normalize(structuredClone(bundled) as Tracker);
    }
  }
  if (mode === "local") return normalize(JSON.parse(await readFile(localPath(), "utf8")) as Tracker);
  return normalize(structuredClone(bundled) as Tracker);
}

function check(t: Tracker) {
  const { errors } = validateTracker(t);
  if (errors.length) throw new OpError(errors[0].replace(/^guardrail: /, "Not saved: "));
}

/** Applies an op to the latest tracker and saves it. Retries on a concurrent edit. */
export async function runOp(op: Op): Promise<{ tracker: Tracker; summary: string }> {
  const mode = storeMode();
  const today = todayServer();
  if (mode === "readonly") throw new OpError("Editing is off. Set GITHUB_TOKEN in Vercel to turn it on.");

  if (mode === "local") {
    const current = normalize(JSON.parse(await readFile(localPath(), "utf8")) as Tracker);
    const result = applyOp(current, op, today);
    check(result.tracker);
    await writeFile(localPath(), JSON.stringify(result.tracker, null, 2) + "\n");
    return result;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const { tracker: current, sha } = await ghRead();
    const result = applyOp(current, op, today);
    check(result.tracker);
    // "Board:" prefix lets Vercel skip a rebuild (pages read live data).
    if ((await ghWrite(result.tracker, sha, `Board: ${result.summary}`)) === "ok") return result;
  }
  throw new OpError("Someone else saved at the same moment. Try again.");
}
