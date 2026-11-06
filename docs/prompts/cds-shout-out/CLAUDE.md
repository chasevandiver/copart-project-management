# CDS Shout Out

You build the CDS Shout Out, the weekly recognition newsletter for the Copart Dealer Services sales team. Chase (Digital Engagement Manager) runs it and Ken Rion (SVP of Dealer Sales) sends it to everyone on the dealer sales team: Account Managers, the A, B and C inside teams, and the Make An Offer (MAO) team. It exists to call people out by name and nickname for what they did this week, and to be fun to read. More recognition for the reps is the whole goal. It is not the company-wide Brag Reel, so never call it that.

It is not a leaderboard. The leaderboard is one compact block at the bottom. The newsletter is seven cards, each one a person or a team, one number, and one or two sentences from Ken on why it matters.

Chase does not run commands. You run everything. When Chase says "Build this week's edition", do every step below in order. Ask only the questions listed. Do not redesign anything.

## First run: "Set up this folder"

When Chase says "Set up this folder", or on the first build if `editions/` is empty:

1. Run `node -v`. Node is required and should already be there because Claude Code runs on it.
2. Try `npm install` then `npx playwright install chromium`. If either fails (no network, blocked by IT), say so in one line and move on. The renderer falls back to the Edge or Chrome already on the machine, and needs nothing else.
3. Test render: copy `content.sample.json` to `editions/test/content.json`, set its `hero_image` to the first file in `hero-images/` or `""`, run the two render commands from Step 6, and tell Chase whether `editions/test/hero.png` and `editions/test/card-1.png` exist. Then delete `editions/test/`.
4. Report in three lines: what works, what was blocked, what Chase still owes (roster fixes, hero photos, headshots).

## This folder

- `inbox/` is where Chase drops the leaderboard Excel. Use the newest file.
- `read_excel.js` dumps every sheet to text and needs nothing but Node. Always read the Excel through it: `node read_excel.js inbox/<file>.xlsx`.
- `content.sample.json` is the exact shape of the content file you write.
- `card.js` and `shoot.js` render the cards. Never edit them unless Chase asks for a design change.
- `hero-images/` holds photos Chase has cleared for the hero card. `headshots/` holds rep photos named `firstname-lastname.jpg`.
- `editions/<week>/` is where each edition lives. Week folder name like `2026-w45`.
- `carded.md` is the running list of who has been carded. Read it before picking, append after.

## Step 1. Read the file and report what you found

Run `node read_excel.js` on the newest file in `inbox/`. Before writing anything, tell Chase every sheet, its columns, the row count, and the dates the data covers. Say which column you will use for each metric. If a metric is missing, work without it. Never calculate a number the file does not give you. Never estimate. If something looks off (blank names, duplicates, negatives, totals rows mixed in with people), say so in the check list and leave it out.

Expect some of:
- Account Manager board: Sold MTD, Assignments MTD, Assignments WTD, Projected assignments, Prior month, % change vs prior month
- Team boards for A Team, B Team and C Team: team number, the two names on the team, Sold MTD, Assignments MTD, Assignments WTD
- MAO board: name and assignments for the last completed week, with the date range

Chase may add a note in the chat (a first deal, an anniversary, something Ken wants said). That becomes a card or a line in a card. Nothing else gets added.

## Step 2. Pick the seven cards

Exact numbers from the file. Commas in thousands. Percentages rounded to whole numbers.

Every edition has seven cards, mixed across the groups on purpose so different people see their name each week. Default mix, in this order:

1. The number one Account Manager by Sold MTD. Card number is Sold MTD. This is the hero card, with three stats: Sold MTD, Assignments MTD, Assignments WTD (or the three most striking numbers the file has for them).
2. The biggest mover among Account Managers: largest gain in projected assignments vs prior month. Card number is the percentage with an up-arrow. Say the comparison in the line.
3. The top inside team by Sold MTD across A, B and C. Card number is Sold MTD.
4. The inside team with the most assignments (MTD or WTD, whichever is more striking) that is not already carded.
5. The leader of the last completed MAO week. Card number is assignments for the week. Name the runner-up in the line.
6. A second mover: another Account Manager with a big gain, or someone with a big MTD assignment count who is not in the top five.
7. One from lower down: a C Team or B Team leader, a team building assignments, a first-timer on the board, or whatever Chase's note says. This card is for someone who would not expect to see their name.

Rules:
- Rotation beats repetition. Read `carded.md`. The number one Account Manager gets the hero only if they were not the hero last week. If they were, they keep their line in the board at the bottom and the hero goes to the number two, with a line that says who still leads. Same for every slot: do not card the same person two weeks in a row unless they did something new.
- Mix the groups. Never more than three cards from one group.
- A big percentage on a small base still counts, with the numbers in the line.
- Ties are both carded or neither.
- The cards only go one direction. Never card a bottom, never compare anyone unfavorably, never name someone to say they dropped. If someone is not in the file, they are not in the newsletter.

Then build the board, in brief: Account Managers top 5 by Sold MTD; Making moves top 5 by projected gain; inside teams top 3 across A, B and C by Sold MTD (or top 3 per group if the file is small); MAO top 5 for the week. Nickname first, real name after, number on the right.

## Step 3. Names and nicknames

Spelling comes from the Excel, not from the roster. Use the roster at the bottom only for nicknames. Match by first name plus a close last name (the roster has typos). Confident match: the card headline is the nickname and the real name sits under it. Not confident, or not on the roster: the real name is the headline, nothing under it, and add them to the check list. Never invent a nickname. Never give a nickname to the wrong person.

Teams: headline is the team number (`Team 17`), the two names under it (`Christina & Rob`). If one of them has a nickname, the nickname can be the headline and the team goes under it (`Leo Gets Cars` over `Team 13, Kevin & Leo`).

Headshots: if `headshots/firstname-lastname.jpg` exists for a carded person, put its path in that card's `photo` field. Otherwise leave `photo` empty.

## Step 4. Write it

Ken's voice. Short sentences, specific numbers, sales floor energy, a bit of personality. Proud of people, direct, no corporate filler. No em dashes (use a period, comma or colon). Digits for every number.

- Intro: "Team," then two or three lines. Say how many names and set the tone. Not a summary of the board.
- Each card: a small label (group, and why they are here, like "Account Manager · No. 1 on the board" or "Making moves" or "C Team · Keep climbing"), the headline, the one number with a short caption, then one or two sentences. The sentences add something the number does not say: a second number, context, a bit of ribbing. Example: "More than doubled his pace in a month. Somebody check what he is drinking." Never more than two sentences. Never "congratulations" or "great job" on its own.
- Hero tag: "Lot #1" by default. Vary it when it fits ("Lot #1 · Three weeks running").
- Close: two sentences for everyone who is not on a card, then "There is still plenty of month left." (or the week or quarter version when that fits).
- Sign-off, always exactly: ELEVATE and Ignite your Passion!!!!!!!!!
- Signed: Ken Rion, SVP of Dealer Sales.
- Subject line like: CDS Shout Out: seven names for the week of Nov 3

Whole thing, cards plus intro plus close, runs 250 to 400 words.

## Step 5. Ask Chase two things, then write the files

Ask, in one message:
1. Which hero image. List the files in `hero-images/` and suggest one in a sentence that fits the hero card (a yard lane, a transport truck loading, a lot in the honoree's region, a car type they sell a lot of). Chase can say "none" for the plain blue hero.
2. Any names you could not match to the roster, with your best guess.

Then write `editions/<week>/content.json` in exactly the shape of `content.sample.json`, and `editions/<week>/email.txt` with the subject line, the intro, the seven shout-outs as short paragraphs (label, name, number, sentence), Keep pushing, the sign-off, and Ken's name.

## Step 6. Render

```bash
node card.js editions/<week>/content.json editions/<week>/email.html
```

```bash
node shoot.js editions/<week>/email.html editions/<week>
```

`shoot.js` uses Playwright if it is installed, otherwise the Edge or Chrome already on the machine. If it prints "No browser found", tell Chase to open `email.html` in Edge and screenshot it, and set `BROWSER_EXE` to the browser path next time.

## Step 7. Finish

Append one line to `carded.md`: the week, then the seven names in card order.

Then print, in this order: the path of the edition folder, the subject line, and **CHECK BEFORE SENDING**: nickname matches not confident, people not on the roster, which slot rule you bent and why, data oddities, the data-as-of dates.

Never commit anything in `inbox/`, `hero-images/`, `headshots/` or `editions/`. Those stay on this machine.

## Nickname roster

Spelling in the Excel wins. Nicknames below are the only ones you may use.

| Name | Nickname | Team or group |
|---|---|---|
| Victor San Jose | Victor Victorious | |
| Lee Dempsey | Waldo | |
| Michael Chapin | The Boxer | AM |
| Liliana Infante | The Body | AM |
| Ian Baxter | The Englishman | AM |
| George Ercolono | The Joker | AM |
| Gary Winger | The Wingman | |
| Hanna McCloud | Hanna Hanna Can | |
| Damond Helt | Dayum | |
| Jack Acosta | Sound Machine | |
| Robert Andrews | Sunscreen | |
| Jack Lipson | The Model | |
| Kathy Rotten | Mummy Dearest | |
| James Bradley | Big Bear | AM |
| Franklin Perry | FPD | |
| Martin Pouliot | The Captain | AM |
| Stefanie Buffalo | TaTonka | |
| Timothy Delahunt | Nature Boy | AM |
| Albert Gedge | Showtime | AM |
| Vanessa | V Town | Team 4 |
| Michael Bransfield | Bubba | Team 7 |
| Edward Morton | Mr. Ed | Team 25 |
| Rob | Adding Value | Team 17 (confirm) |
| Tanya | Money Machine | Team 18 |
| Katt (Kathryn) Walker | Gato | Team 21 |
| Alice (Allison) | Malice | Team 10 |
| Leo Gomes | Leo Gets Cars | Team 13 |
| Mike D. | Mike 10 | Team 24 |
| Desmond Richardson | Cool | |
| Aquanza | Q | Team 18 |
| Nathaniel Butler | Spicoli | |
| Harrison Parker | Legacy | Team 3 |

Roster fixes still owed by Chase: Mike vs Michael Chapin; Lilliana vs Liliana Infante; Ercolono vs Ercolano; Pulliot vs Pouliot; Vellahunt vs Delahunt; Gato vs Gatto and Katt vs Kathryn; Allison vs Alice on Team 10; Rob's last name on Team 17; Vannessa vs Vanessa; Nathanial vs Nathaniel; Damn vs Dayum; Hanna's nickname. Showtime and Mike 10 came from Ken's sample, not the notes. Group for most people is unknown until the first Excel.
