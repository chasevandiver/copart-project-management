# CDS Shout Out

Weekly recognition newsletter for the Copart Dealer Services sales team. Claude Code reads the leaderboard Excel, picks seven people or teams, writes Ken's lines, and renders the cards. `CLAUDE.md` holds the instructions Claude Code follows.

## One-time setup (work machine)

1. Install Node (18 or newer) and Python 3.
2. In this folder:

```bash
npm install
```

```bash
npx playwright install chromium
```

```bash
pip install openpyxl
```

3. Put a hero photo or two in `hero-images/`. Headshots, if you have them, go in `headshots/` named `firstname-lastname.jpg`.
4. Fix the roster at the bottom of `CLAUDE.md`.

If `npx playwright install` is blocked by IT, Claude Code still produces `editions/<week>/email.html`. Open it in Edge and use Print to PDF, or screenshot the cards.

## Every week

1. Drop the leaderboard Excel in `inbox/`.
2. Open a terminal in this folder, run `claude`, and say: **Build this week's edition.**
3. Answer its questions (which hero photo, any names it could not match), then review `editions/<week>/`:
   `email.txt` is the email body, `hero.png` and `card-1.png` to `card-6.png` are the graphics, `email.png` is the full mock.
4. Send the email with the hero card at the top, or post the cards in Teams.

Nothing in `inbox/`, `hero-images/`, `headshots/` or `editions/` is committed to git. Leaderboards stay on your machine.
