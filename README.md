[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/spy26/gta6-trophy-guide-r2b/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/spy26/gta6-trophy-guide-r2b/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Trophy Guide — GTA VI, All 55 Trophies

An offline, open-source tracker and guide for every PlayStation 5 trophy in
Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze). No account, no
network, no ads — open `app/index.html` and it works.

## What it does

- **Tracker** — tick trophies off; progress is saved in your browser
  (localStorage) with export and import, so your checklist survives a new
  machine.
- **Cards+ (default)** — every card shows the guide inline (no click needed),
  difficulty (★/5), time estimate, live Exophase rarity %, and
  kind/grade/hidden/missable/unconfirmed badges. Click a card for the detail
  pane with sources and your own per-trophy notes.
- **Table+** — a dense sortable ledger (rarity / difficulty / time) with the
  guide under each trophy.
- **Roadmap** — a three-phase platinum plan (Story 60–80 h → 100% grind
  ≈ 100 h → Strangers & clean-up 10–20 h), ≈ 200 h total, difficulty 4/10.
- **Next up planner** — the missable trophy first, then the easiest unearned
  trophies, so you always know what to do next.
- **Missable warning** — one trophy can be missed: **Positive Mental
  Attitude** (meditate on the Lucia balcony in Chapter 1, right after “Down
  to Earth”). It is flagged in the banner, the planner, and on the card.
- **Spoiler toggle** — hides the names, descriptions and guides of the 28
  hidden trophies until you earn them (spoilers off by default in the
  roadmap, where hidden trophies are listed without leaking their names).
- **Filters** — search, kind, grade, earned-only.

## Data — honest, cited

- Names, descriptions and grades: the official PS5 list (Exophase, 18 Nov
  2026; cross-checked with PSNProfiles). Rarity: Exophase % on 20 Nov 2026
  (day 2 after launch — expect it to rise fast).
- Every guide is written in our own words from PowerPyx, GTABase, KeenGamer
  and GTAScoop, with the source named on the card.
- Two trophies are marked **unconfirmed** (Bad Luck, I Guess; The Truth Is
  Out There) and two **single-source** (Personal Best; Let’s Go Bowling)
  because no guide — or only one — has pinned their triggers yet. We would
  rather say “we don’t know” than invent a walkthrough.
- 100% completion is lenient: ≈ 60% true completion (200/277 vehicles,
  100/255 animals, 70 of 80 challenges).

## Run it

```sh
# static files — any file server works, or just:
npx serve app
# then open http://localhost:3000
```

Or open `app/index.html` directly from disk (the app fetches
`app/data/trophies.json`, so serve it over HTTP for the checklist to load).

## Screenshots

1. `1-cards-cover.jpg` — Cards+ (default), 13/55 earned
2. `2-table.jpg` — Table+ ledger
3. `3-roadmap.jpg` — Platinum roadmap
4. `4-missable-guide.jpg` — detail pane for the missable trophy

## License

MIT. Unofficial fan guide — not affiliated with Rockstar Games or Sony.
Grand Theft Auto and GTA are trademarks of Take-Two Interactive.
