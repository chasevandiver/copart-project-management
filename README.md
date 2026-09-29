# Copart PM Board

Chase's project tracker. Data lives in `tracker/tracker.json`. The board is a small Next.js app that reads it at build time. See CLAUDE.md for the data model and the UPDATE protocol.

## Local

```
npm install
npm run validate
npm run dev          # http://localhost:3000, open locally unless BOARD_PASSWORD is set
```

## Deploy to Vercel (one time)

1. Vercel dashboard > Add New > Project > import `chasevandiver/copart-project-management`.
2. Framework preset: Next.js. Root directory: repo root. Build settings: defaults.
3. Environment Variables: add `BOARD_PASSWORD` for Production and Preview. Use a new password, not the dfw-dealer-digital one.
4. Deploy. Open the URL and enter the password. The cookie lasts 30 days. Sign out at `/api/logout`.
5. Settings > Git > Production Branch: the branch you want live (`main` once this branch is merged).

After that, every push to the production branch redeploys the board in about a minute. If `BOARD_PASSWORD` is missing in production, the site returns 503 instead of opening up.

## Files

- `tracker/tracker.json` source of truth
- `tracker/log.md` change log, newest first
- `scripts/validate.mjs` schema and guardrail checks (runs before every build)
- `app/` pages, `components/` UI, `lib/` data loader and helpers, `middleware.ts` password gate
