# Copart PM Tracker

Project tracker for Chase, Digital Engagement Manager at Copart, supporting Ken Rion (SVP of Dealer Sales).

- `tracker/tracker.json` is the single source of truth. Edit it by hand; there is no database.
- `tracker/log.md` has one dated entry per update.
- The board (Next.js at the repo root) reads tracker.json live from GitHub on every request. Chase can also edit from the board (check off, add action items, ideas, notes and questions, set dates, answer questions, resolve decisions, mark waiting-on received). Those edits are committed to `main` as `Board: ...` commits.
- Tracker updates commit straight to `main`. **Always `git pull origin main` before editing tracker.json**, because the board may have committed since your last pull.
- `npm run validate` checks tracker.json. Run it before every commit. It also runs before every build.

## Writing style

Plain and direct. No em dashes (use a period, comma, colon or parentheses). Short task titles that start with a verb where possible.

## Terms

- CDS means Copart Dealer Sales. Always write it out as "Copart Dealer Sales" in tracker.json, the board and replies.

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
- Category (goals and projects): `AI Tools`, `Marketing Efforts`

**goals[]**: `id` (`g-NN`), `category`, `title`, `summary`, `status`, `project_ids[]` (projects that serve the goal; a project can serve more than one goal), `created`, `updated`. Goals are Chase's big outcomes, grouped by category. Every project belongs to one category.

**projects[]**: `id` (short slug: `rt`, `cdd`, `pm`, `hub`, `audit`), `name`, `category`, `status`, optional `idea: true` (an idea being shaped, nothing committed), `summary`, `built[]` (what exists so far), `links[]` (`{label, url?, where?}`), `blockers[]`, `next_steps[]`, optional `dependencies[]` (things it needs that are not hard blockers)

**tasks[]**: `id` (`<project>-NN`, `gen-NN` for general), `project_id` (a project id or `"general"`), `title`, `status`, `owner`, `due`, `priority`, `notes`, optional `recurring` (only `"weekly"`; checking it off rolls `due` forward 7 days instead of closing it), optional `idea: true` (an idea, not committed work; excluded from counts, board and schedule), optional `completed` (date it was marked Done), `created`, `updated`

**waiting_on[]**: `id` (`w-NN`), `what`, `from_whom`, `project_id`, `since`, `priority`, `notes`, optional `received` (date it arrived). These are things Chase is waiting on from others. Things others are waiting on from Chase are tasks owned by `Me`. When an item arrives, set `received` to the date (do not delete it; it feeds the Progress page). If it creates work, add a task.

**questions[]**: `id` (`q-NN`), `question`, `ask` (who to ask: a name from `people`, an owner like `IT`, or any name), `project_id`, `status` (`open` or `answered`), `answer`, `raised`, `answered` (date). Use these for "ask X about Y". Answer in place; do not delete answered ones. If a question names someone new, consider adding them to `people`.

**decisions[]**: `id` (`d-<project>-NN`), `project_id`, `question`, `options[]`, `raised`, `status` (`open` or `resolved`), `answer`, `resolved` (date). Resolve in place; never delete.

**people[]**: `name`, `title`, `department`, `relationship`, `contact`

**notes[]**: `id` (`n-NN`), `date`, `title`, `project_id`, `body[]` (one string per point). Notes attach to a project (or `general`). Newest last.

**meta.last_updated**: set to today on every update.

## UPDATE protocol

When Chase sends a message starting with `UPDATE:` (often messy notes or a paste from another Claude session):

1. `git pull origin main`, then read tracker.json in full.
2. Parse the message into: goals, new tasks, questions (who to ask what), task changes (status, owner, due, priority, notes), waiting-on items added or cleared, decisions raised or resolved, people added or changed, project summary/blocker/next-step changes, and dated notes.
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

Newest entry first. Multiple updates on one day get separate entries with a time or short label. Edits Chase makes on the board are not logged in log.md; `git log --grep '^Board:'` shows them. When asked "where are we", include recent board edits.

## "Where are we"

When Chase asks "where are we", reply in chat (no file changes):
- One or two lines per project: status, main blocker, next step
- Urgent items and anything overdue or due in the next 7 days
- Open waiting-on items older than a week, and open questions by person
Keep it short.

## Board

Sidebar layout (like Things or Todoist): sidebar on the left, one list in the middle, a detail panel on the right for whatever item is open (`?item=task:cdd-03`). The old screens live at `/classic`.

Sidebar views (`app/(app)/`):
- Inbox (`/inbox`): items with `project_id: "general"`
- Today (`/`): my overdue, due today, coming up this week, urgent or in progress
- Upcoming (`/upcoming`): my dated to-dos for 14 days, then undated by project
- Ask, Waiting on, Decide, Delegated (`/ask`, `/waiting`, `/decide`, `/delegated`): open loops. Delegated is open tasks owned by anyone but `Me`; they stay out of Today and Upcoming.
- Ideas, Notes, Logbook (`/ideas`, `/notes`, `/logbook`)
- Projects (`/projects/[id]`): one scrolling page (to do, others are on it, questions, decisions, waiting, ideas, notes, done). `/projects` lists all.
- Search (`/search?q=`)

Code:
- `lib/views.ts` builds every view (pure); `components/shell/` has Sidebar, Row, Groups, Detail, QuickAdd
- `lib/parse.ts` quick-add parser: `?` question, `@name`, `#project`, `fri` / `oct 4` / `tomorrow`, `!` high, `!!` urgent, `idea:` and `note:` prefixes
- `components/App.tsx` client context (tracker, save, toasts), provided only inside signed-in layouts (`lib/provider-props.ts`), never on the login page
- `middleware.ts` password gate using the `BOARD_PASSWORD` env var
- `lib/store.ts` load and save (GitHub via `GITHUB_TOKEN` in production, disk in local dev, read-only otherwise)
- `lib/ops.ts` every edit the board can make; `app/api/tracker` runs them, validates, commits
- `lib/validate-core.mjs` checks shared by `scripts/validate.mjs` and the save API (guardrails block keys and Tax IDs from the UI too)
- `app/classic/` the previous screens, kept for comparison; remove once Chase is happy with the sidebar version

Keep the board simple. New fields in tracker.json should be added to `lib/tracker.ts` and the validator in the same commit.
