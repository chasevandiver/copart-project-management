# Sales workflow

How Chase understands and builds everything, written up from the whiteboard on 2026-10-16. Every project in `tracker/tracker.json` sits in one of the four blocks below. When a new project or idea comes up, place it in a block first.

Left off on purpose: the promotion leads list, the DJ and Ben team lists, the slump list and the top sellers questions. Those stay on the board.

## The picture

```
            Prospective and inactive approach
   Get found  |  Go get 'em  |  Convert 'em
      AEO/SEO    digital campaigns   web forms, outreach campaigns
      webpage    new / inactive
      changes    direct / indirect
                 email, call, text, paid ads
                 marketing tools and apps
          audience  ^            v  logs: touch dates, tracked responses
                    |            |
   Agents  ---->  Lead Tracker with CRM  <---->  Route Tracker
   A1 to A4       dealer profiles by state      pre-visit, dealer visit,
   loop with      and status; assigns leads     follow-up; CRM for
   each other     to teams                      Route Tracker leads
                    |
          leads by team: field (ZIP, city, in person) and office (all, follow-up)

   Separate: Copilot and Power Automate tools
   Copart Dealer Services AI (Teams agent)  |  Meeting management
```

## 1. Prospective and inactive approach

One approach, three branches. Marketing Efforts and Campaigns live here.

**Get found** (goal g-02). A dealer who searches or asks an AI finds Copart Dealer Services.
- AEO and SEO
- Webpage changes
- Projects: Digital presence audit (`audit`), Marketing plan (`mkt`)

**Go get 'em** (goal g-03). Digital campaigns that reach dealers who do not work with Copart yet, or who have gone quiet.
- Split two ways: new vs inactive, direct vs indirect
- Channels: email, call, text, paid ads, SEO and AEO
- Marketing tools and apps behind them
- Projects: Campaign setup (`cmp`), Inactive seller win-back (`wb`), Prospective dealer outreach (`pdo`), Weekly wins (`ww`), Cars & Cocktails Boston (`cceib`), Marketing plan (`mkt`)

**Convert 'em** (goal g-03). Interest becomes a lead.
- Web forms (the Copilot flow on the Admin inbox, agents-01, matches each form lead to the Lead Tracker)
- Prospective and inactive dealer outreach campaigns
- Each campaign takes its audience from the Lead Tracker, and logs recommended touch dates and tracked responses back to the dealer profile

## 2. Lead Tracker with CRM at the center (goal g-01)

The Lead Tracker (`udm`) is the one dealer record everything reads and writes.
- Supplies dealer profiles by state and Copart status (active, inactive, no status)
- Assigns leads to teams. Field reps get leads by ZIP code and city for in-person visits on the Route Tracker. Office (inside) sales works all leads with follow-up
- Is the audience for every campaign, and keeps the campaign's touch dates and responses on the dealer profile
- Talks to the Route Tracker both ways: leads build routes, and visit results come back by lead ID
- Public lead pulls (state license lists, AEO baseline) still start in Copart Dealer Digital (`cdd`). The hub (`hub`) is where every tool lives. The PM board (`pm`) tracks the work

**Agents** (`agents`) keep the Lead Tracker full and help the teams work it. The four on the board:

| Board | What it does | Nearest prompt in Copart Dealer Digital |
| --- | --- | --- |
| A1 Dealer profile | Pulls info from the dealer's own site into the profile | A3 Dealer Prospect Finder, A4 Pre-Call Brief research |
| A2 AEO and dealer listening | Watches where Copart shows up in AI answers and what dealers say | A1 AEO Monitor, A2 AEO Content Gap, A7 Dealer Social Listening |
| A3 Pre-call and follow-up drafter | Drafts the pre-call brief and the follow-up after a call or visit | A4 Pre-Call Brief, A5 Follow-Up Drafter |
| A4 Dormant dealer activation | Works the inactive list | A6 Dormant Dealer Reactivation |

All four loop with each other and feed one agent pipeline. The pipeline breaks the dealer map into segments: leads by team. The wider agent map (lead building, inbound, office sales, field, managers) is note n-30. Every agent output is a draft a person approves.

## 3. Route Tracker (goal g-01)

The field screen (`rt`). Three steps, then back to the CRM.

| Pre-visit | Dealer visit | Follow-up |
| --- | --- | --- |
| Route building | Contact | Handoff |
| Dealer profile | Profile fields | Hot, mild or cold |
| Outreach: exclusive offer, email template | Assignments | Send to team |
| Team roster | | |

The call script runs on the Route Tracker with the dealer profile (rt-58 templates). Results go to the CRM for Route Tracker leads, which is the Lead Tracker.

## 4. Copilot and Power Automate tools (goal g-04)

Separate from the prospective and inactive approach. Built in Copilot Studio and Power Automate, connected to Outlook, Teams and Microsoft 365.

**Copart Dealer Services AI** (`cdsai`, "CDS AI" on the board). A Copilot agent in Teams for the team.
- Pre-call brief, updates, follow-up
- Ideas: track the full process, manager view

**Meeting management** (`mm`).
- Memory bank: transcripts of calls, a SharePoint site for meetings
- Chief of staff agent: messages on Teams, automated messages and updates, connected to the weekly session
- PLAUD (`pa`) sends email to an Outlook PLAUD folder; one automated workflow connects everything
- Built so far: meeting transcript reader, auto draft email, auto schedule meeting, PLAUD autoflow to email

## Also on the board, not placed

- Across the top: positivity, dress, time, communication, productivity. Reads as team standards. Not a project.
- The team lists under DJ and Ben, the slump list, the top sellers questions and the promotion leads list, per Chase.

## Reading notes

Where the handwriting was hard to read, this doc uses the most likely reading. Check these with Chase if they matter: "AM" is read as the field (account manager) side next to "Inside"; "Break DM into segments" is read as breaking the dealer map into segments; the Teams agent line under CDS AI is read as "use the Teams agent" with the rest of the line not legible.
