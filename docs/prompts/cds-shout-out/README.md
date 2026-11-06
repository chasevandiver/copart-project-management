# CDS Shout Out

Weekly recognition newsletter for the Copart Dealer Services sales team. Claude Code reads the leaderboard Excel, picks seven people or teams, writes Ken's lines, and renders the cards. `CLAUDE.md` holds the instructions Claude Code follows.

## One-time setup

Chase does not run commands. Claude Code does.

1. Unzip this folder somewhere on the work machine, like Documents.
2. Open Claude Code in that folder and say: **Set up this folder.** It checks Node, tries to install the renderer, falls back to the Edge already on the machine if installs are blocked, does a test render, and reports.
3. Put a cleared Copart photo or two in `hero-images/`. Headshots, if you have them, go in `headshots/` named `firstname-lastname.jpg`.
4. Ask Claude Code to fix the roster at the bottom of `CLAUDE.md` with the correct spellings.

## Every week

1. Drop the leaderboard Excel in `inbox/`.
2. In Claude Code in this folder, say: **Build this week's edition.**
3. Answer its two questions (which hero photo, any names it could not match), then look in `editions/<week>/`:
   `email.txt` is the email body, `hero.png` and `card-1.png` to `card-6.png` are the graphics, `email.png` is the full mock.
4. Send the email with the hero card at the top, or post the cards in Teams.

Nothing in `inbox/`, `hero-images/`, `headshots/` or `editions/` is committed to git. Leaderboards stay on the machine.
