# Copart PM Tracker

Project tracker for Chase, Digital Engagement Manager at Copart, supporting Ken Rion (SVP of Dealer Sales).

- `tracker/tracker.json` is the single source of truth. Edit it by hand; there is no database.
- `tracker/log.md` has one dated entry per update.
- The board (Next.js at the repo root) reads tracker.json at build time. Pushing to the production branch redeploys it on Vercel.
- `npm run validate` checks tracker.json. Run it before every commit. It also runs before every build.

## Writing style

Plain and direct. No em dashes (use a period, comma, colon or parentheses). Short task titles that start with a verb where possible.

## Guardrails

- This repo tracks work. It never holds Copart sales data, TxDMV owner emails, dealer Tax IDs, passwords or API keys. Reference where they live instead (for example "password is in Vercel project settings").
- People's `contact` field stays blank until Chase gives it. Work contact only.
- Do not edit the Route Tracker or dfw-dealer-digital repos from here. Track their work only.

## Data model (tracker.json)

Dates are `YYYY-MM-DD`. Use `null` for unknown dates, not guesses.

**Enums**
- Status (tasks and projects): `Backlog`, `Next`, `In Progress`, `Waiting`, `Blocked`, `Done`
- Priority: `urgent`, `high`, `normal`, `low`
- Owner: `Me`, `Work Claude`, `Claude Code`, `IT`, `Leo`, `Legal`, or a name from `people` (full name or first name)

**projects[]**: `id` (short slug: `rt`, `cdd`, `pm`), `name`, `status`, `summary`, `built[]` (what exists so far), `links[]` (`{label, url?, where?}`), `blockers[]`, `next_steps[]`

**tasks[]**: `id` (`<project>-NN`, `gen-NN` for general), `project_id` (a project id or `"general"`), `title`, `status`, `owner`, `due`, `priority`, `notes`, optional `recurring` (e.g. `"weekly"`), `created`, `updated`

**waiting_on[]**: `id` (`w-NN`), `what`, `from_whom`, `project_id`, `since`, `priority`, `notes`. These are things Chase is waiting on from others. Things others are waiting on from Chase are tasks owned by `Me`. Remove an item (and log it) once it arrives; if it creates work, add a task.

**decisions[]**: `id` (`d-<project>-NN`), `project_id`, `question`, `options[]`, `raised`, `status` (`open` or `resolved`), `answer`, `resolved` (date). Resolve in place; never delete.

**people[]**: `name`, `title`, `department`, `relationship`, `contact`

**notes[]**: `date`, `title`, `project_id`, `body[]` (one string per point). Newest last.

**meta.last_updated**: set to today on every update.

## UPDATE protocol

When Chase sends a message starting with `UPDATE:` (often messy notes or a paste from another Claude session):

1. Read tracker.json in full.
2. Parse the message into: new tasks, task changes (status, owner, due, priority, notes), waiting-on items added or cleared, decisions raised or resolved, people added or changed, project summary/blocker/next-step changes, and dated notes.
3. Match to existing items by meaning, not exact wording. Update instead of creating duplicates. When a task finishes, set it to `Done` (do not delete).
4. If something is ambiguous (which project, who owns it, a due date), ask ONE question before writing anything.
5. Show a short summary of the changes (a few bullets), then apply them.
6. Set `updated` on every touched task and `meta.last_updated` to today.
7. Add a dated entry at the top of `tracker/log.md` (format below).
8. Run `npm run validate`. Fix anything it flags.
9. Commit with a clear message, like `Update: Kyle meeting set, rt-01 unblocked`, and push.

If the message includes anything the guardrails forbid (a key, a password, an owner's email, a Tax ID, sales figures), do not store it. Tell Chase where it should live instead.

### log.md entry format

```
## 2026-09-30
- Source: short description of what Chase sent
- Changed: rt-01 Blocked -> Next
- Added: gen-07 "Send Kyle agenda" (Me, due 2026-10-01)
- Resolved: d-rt-03 Yes, use the Census geocoder
- Waiting on: cleared w-03 (Zapier owner is ...)
```

Newest entry first. Multiple updates on one day get separate entries with a time or short label.

## "Where are we"

When Chase asks "where are we", reply in chat (no file changes):
- One or two lines per project: status, main blocker, next step
- Urgent items and anything overdue or due in the next 7 days
- Open waiting-on items older than a week
Keep it short.

## Board

- `app/page.tsx` kanban (filter by project and owner)
- `app/projects/[id]` per-project page
- `app/waiting` waiting on, grouped by person
- `app/week` due in the next 7 days, overdue, or urgent
- `app/people` directory by department
- `middleware.ts` password gate using the `BOARD_PASSWORD` env var
- `lib/tracker.ts` types and loader
- `scripts/validate.mjs` validator

Keep the board simple. New fields in tracker.json should be added to `lib/tracker.ts` and the validator in the same commit.
