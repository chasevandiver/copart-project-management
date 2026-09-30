# Copart PM Board

Chase's project tracker. Data lives in `tracker/tracker.json`. The board is a small Next.js app that reads it live and saves edits back as commits. See CLAUDE.md for the data model and the UPDATE protocol.

## Local

```
npm install
npm run validate
npm run dev          # http://localhost:3000, open locally unless BOARD_PASSWORD is set
                     # with no GITHUB_TOKEN, edits save to tracker/tracker.json on disk
```

## Deploy to Vercel (one time)

1. Vercel dashboard > Add New > Project > import `chasevandiver/copart-project-management`.
2. Framework preset: Next.js. Root directory: repo root. Build settings: defaults.
3. Environment Variables: add `BOARD_PASSWORD` for Production and Preview. Use a new password, not the dfw-dealer-digital one.
4. Deploy. Open the URL and enter the password. The cookie lasts 30 days. Sign out at `/api/logout`.
5. Production branch is `main` (Vercel's default). Nothing to change.

6. Turn on editing (checkboxes, adding items, decisions): create a GitHub fine-grained token at github.com > Settings > Developer settings > Fine-grained tokens. Repository access: only `chasevandiver/copart-project-management`. Permissions: Contents, Read and write. Add it in Vercel as `GITHUB_TOKEN` (Production), then redeploy. Without it the board is read-only and says so.

Code pushes to `main` redeploy the board in about a minute. Edits made on the board are saved as `Board: ...` commits to `tracker/tracker.json`; `vercel.json` skips rebuilding for those because pages read the file live from GitHub. If `BOARD_PASSWORD` is missing in production, the site returns 503 instead of opening up.

## Files

- `tracker/tracker.json` source of truth
- `tracker/log.md` change log, newest first
- `scripts/validate.mjs` schema and guardrail checks (runs before every build)
- `app/` pages, `components/` UI, `middleware.ts` password gate
- `lib/store.ts` reads and saves tracker.json (GitHub in production, disk locally)
- `lib/ops.ts` every edit the board can make; `lib/validate-core.mjs` shared checks
