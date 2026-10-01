# Tracker log

Newest entry first.

## 2026-10-01 (leads map: 28 states plus DC)
- Source: Chase's recap of today's Leads work on the Copart Dealer Digital site
- Changed: Copart Dealer Digital summary, built list (28 states plus DC, 92,492 leads, All states page, Indiana merge, new filters, dark mode), links and next steps
- Changed: US Dealer Map built list and next steps; gen-14 notes (active Copart dealer exclusion still to do)
- Added: cdd-14 "Save New Mexico's dealer table (12 pages) for the pipeline" (Me, Next), cdd-15 "Try browser exports for Louisiana, Minnesota and Michigan" (Me), cdd-16 "Add Colorado salvage and powersports listings" (Me), cdd-17 "Add Leo's credit-union repo estimates and tow fleet sizes as Indiana columns" (Claude Code)
- Added: decision d-cdd-05 (rebuild the lead score from license data only)
- Added: question q-03 for IT or Legal (business phones and emails in the repo before the move to the work setup)
- Answered: q-01 Leo shared his Indiana lists, merged Oct 1
- Added: note n-09 "Leads map: 28 states plus DC"

## 2026-10-01 (GitHub access clarified)
- Source: Chase explained the build repo is a Copart GitHub connected to Coolify; no direct access, but Work Claude can create and edit files there
- Changed: rt-37 Next -> Done (not needed, build goes through Work Claude)
- Changed: removed the GitHub access blocker from Route Tracker; added a "Build repo" link noting where it lives

## 2026-10-01 (Route Tracker plan approved)
- Source: Chase's approved plan for the Route Tracker at-dealer flow, assignments and handoff
- Resolved: d-rt-04 Phone mail share sheet now, company SMTP later
- Resolved: d-rt-05 Automatic stages: Not Visited > Visited > Information Obtained > Assignments Obtained > Handed Off > Car Received
- Changed: rt-25, rt-30, rt-31 Next/Backlog -> Done (settled in the plan)
- Changed: rt-18 to rt-24, rt-26 to rt-28 Backlog -> Next, notes updated with plan details; rt-29 now covers rosters and emails for 26 teams
- Added: rt-32 "Migrate existing handoff rows", rt-33 "Raise four points with Genie", rt-34 "Get a company SMTP account", rt-35 "Fix the Zap URL to /api/plaud-intake and retest", rt-36 "Confirm reps can reach the app on cell data without VPN", rt-37 "Get GitHub access" (Me, high)
- Added: decision d-rt-06 ("Decision-maker identified" mapping, "Account open" stage)
- Added: note n-07 with the full plan
- Changed: Route Tracker summary, next steps and blockers

## 2026-10-01 (Route Tracker at-dealer flow)
- Source: Chase's notes after pitching the Route Tracker to the field team
- Added: rt-17 to rt-28, the at-dealer flow build (Me, high; rt-17 "Map the current handoff tab, pipeline and PLAUD intake" is Next, the rest Backlog)
- Added: rt-29 "Get the team list with Team # and email", rt-30 "Confirm which PLAUD fields come through Zapier", rt-31 "Confirm the seller code format" (Me, high)
- Added: decisions d-rt-04 (how assignment emails get sent) and d-rt-05 (final pipeline stages and triggers)
- Added: note n-05 with the field team feedback and goal
- Changed: Route Tracker blockers (GitHub access for Copart Genie / Coolify; Zapier can't reach Google Sheets or Excel) and next steps

## 2026-09-30 (sidebar redesign)
- Source: Chase said the board was still confusing and approved the sidebar design
- Board: new sidebar layout (Inbox, Today, Upcoming, Ask, Waiting on, Decide, Delegated, Ideas, Notes, Logbook, projects); detail panel for any item; quick add (N) with @name, #project, dates and ! priority; your lists show only your work, others' work sits in Delegated; old screens kept at /classic
- Fixed: login page no longer carries any tracker data
- Changed: PM Tracker built list

## 2026-09-30 (gen-08 converted)
- Source: Chase asked to convert gen-08 into a note and a question
- Added: note n-02 "Leo: Indiana leads" (Copart Dealer Digital)
- Added: question q-01 for Leo, "Is there a current dealer prospect list? Can you share your leads files...?" (Copart Dealer Digital)
- Changed: gen-08 Next -> Done (converted)

## 2026-09-30 (notes, questions, progress)
- Source: Chase asked for notes on projects, questions assigned to people, cleaner organization, and a view of what got done by day, week and month
- Board: new nav (Home, Schedule, Projects, People, Everything, Progress); one capture box for action items, ideas, notes and questions; project tabs; People shows who to ask what; Everything lists all items with filters; Progress shows completed, decided, answered, received and notes by day, week or month
- Data: added `questions` list; notes now have ids (n-01); waiting-on items keep a `received` date instead of being deleted
- Changed: PM Tracker built list

## 2026-09-30 (board live)
- Source: Chase confirmed GITHUB_TOKEN is set and the board is live and editable
- Board edits so far: cdd-01, pm-02, pm-03 marked Done
- Changed: PM Tracker summary and next steps; removed the secrets step from Copart Dealer Digital next steps

## 2026-09-30
- Source: Chase asked for checkboxes, adding action items and ideas, and a schedule view
- Board: editing on the site (saved as "Board:" commits), Schedule page, quick add, ideas per project, decision buttons, "Got it" on waiting items
- Added: pm-03 "Add GITHUB_TOKEN in Vercel to turn on board editing" (Me, high)
- Changed: PM Tracker built list and next steps

## 2026-09-29 (deploy confirmed)
- Source: Chase confirmed the site is live and the dealer map is deployed
- Changed: cdd built list marks /map as deployed and live; added Dealer map link
- No deploy task added

## 2026-09-29 (pre-start rundown)
- Source: Chase's full rundown of pre-start work on Copart Dealer Digital (AEO, dealer map, TxDMV leads)
- Changed: cdd built list rewritten with AEO results, dealer map and scoring, statewide leads; summary and next steps updated
- Changed: cdd-01 widened to rotate Anthropic, OpenAI and Gemini keys plus the map password (commit b6a17b4)
- Changed: cdd-03 notes (aged inventory is the biggest seller-fit weight), cdd-05 notes (2,926 vs 2,999 territory count to confirm), cdd-06 retitled to ActiveDate
- Changed: audit-04 notes with AEO findings
- Added: cdd-11 "Spot-check the top 3 dealers" (Me), cdd-12 "Weekly AEO re-run" (Claude Code), cdd-13 "Inventory for 14 unscored dealers" (Claude Code)
- Added: audit-06 "Brief the positioning gap" (Me), gen-07 "Close week one questions with Ken and IT" (Me, due 2026-10-02)
- Added decision: d-cdd-04 Gemini paid key vs two-day AEO runs
- Not applied: "Deploy to Vercel when you say go" (confirmed below: already live)

## 2026-09-29 (goals and audit)
- Source: Chase's request for goals plus UPDATE on the Copart Dealer Sales Digital Presence Audit
- Added: goals split into AI Tools and Marketing Efforts; every project now has a category
- Added goal: g-01 "Build a Copart Dealer Sales Tools and Agents hub" (AI Tools; hub, rt, cdd, pm)
- Added goal: g-02 "Increase Copart Dealer Sales digital visibility" (Marketing Efforts; audit)
- Added project: hub, Copart Dealer Sales Tools and Agents Hub (Backlog), with hub-01 "Define the hub"
- Added project: audit, Copart Dealer Sales Digital Presence Audit (Backlog, idea, nothing committed)
- Added tasks: audit-01 Email, audit-02 Social, audit-04 Search and AI visibility, audit-05 Gaps and opportunities
- Changed: gen-06 moved into audit as audit-03 (Website: Dealer Sales experience on copart.com)
- Changed: gen-01 notes, audit added as a topic for the Kyle and Ken meeting
- Changed: "CDS" spelled out as "Copart Dealer Sales" everywhere; added to CLAUDE.md terms
- Board: Goals page grouped by category, Area filter on the kanban, Idea chip, Dependencies card

## 2026-09-29
- Source: initial setup from Chase's seed notes (as of Tue Sep 29, 2026)
- Added projects: Route Tracker (rt, Blocked), Copart Dealer Digital (cdd, In Progress), PM Tracker (pm, In Progress)
- Added tasks: rt-01 to rt-10, cdd-01 to cdd-10, gen-01 to gen-06, pm-01 and pm-02
- Added waiting on: w-01 to w-04 (IT: VPN-only access, Tax IDs through Zapier, Zapier owner, backups), w-05 (Work Claude API limit)
- Added decisions: d-rt-01 (resolved: extend the Route Tracker app), d-rt-02, d-rt-03, d-cdd-01 to d-cdd-03 (open)
- Added people: Ken Rion, Kyle, Rama, Leo
- Added note: Sep 29 meeting with Rama and Leo on marketing tools
- Done: pm-01 (PM tracker built and seeded)
