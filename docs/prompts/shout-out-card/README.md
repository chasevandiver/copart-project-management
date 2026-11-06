# CDS Shout Out cards

Turns work Claude's weekly content into the hero card, six smaller cards, and the full email mock.

1. Save the content block from work Claude as `content.json` (copy `content.sample.json` and fill it).
2. Pick the hero image for the week: drop a photo in `hero-images/` and put its path in `hero_image`. Leave it empty for a plain Copart blue hero. Headshots go in `photo` fields the same way; empty shows the placeholder circle.
3. Render:

```bash
node card.js content.json out.html
node shoot.js out.html week-39
```

That writes `week-39-email.png`, `week-39-hero.png` and `week-39-card-1.png` through `-6.png`. The hero and card PNGs are the shareable graphics. The email PNG is the full stack for review.

Needs Node and Playwright. Photos are never committed to this repo; `hero-images/` is for local use.
