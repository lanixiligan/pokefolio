# PokeFolio — Project Proposal

## Overview

PokeFolio is a full-stack web application that recreates the experience of a
physical Pokémon TCG binder in digital form. Visitors explore a curated set
of English Pokémon TCG sets, browse and search cards, and add selected cards
to a personal digital binder that can be organized and visually customized —
with no login or account creation required.

The project's focus is the **experience of discovering, collecting,
organizing, and customizing cards** — not pricing, trading, or competitive
gameplay.

## Goals

PokeFolio is built to demonstrate a complete full-stack application using:

- React + Vite (frontend)
- Express.js (backend/API)
- PostgreSQL (persistent storage)
- REST API design
- External API integration (Pokémon TCG API)
- Relational data modeling
- Search and filtering
- Persistent, per-visitor data — without authentication
- UI/UX and visual customization

## MVP Definition

The MVP allows a user to:

1. View the five supported Pokémon TCG sets
2. Select a set
3. Browse cards in that set
4. Search for a specific card
5. Open a card's details
6. Add a card to their digital binder
7. Remove and organize cards in the binder
8. Choose a binder grid size and customize its appearance
9. Persist binder contents and preferences across sessions, tied to their
   browser — no account needed

**Out of scope for MVP:** pricing/market values, trading, deck building,
competitive gameplay, user authentication/login, social/friend features, and
support for the full Pokémon TCG catalog.

## Supported Sets

1. Base
2. Team Rocket
3. Scarlet & Violet — 151
4. Scarlet & Violet — Paldean Fates
5. Scarlet & Violet — Prismatic Evolutions

These are **content choices within the Explore experience**, not separate
application pages — a single Set Card Browser component renders whichever
set is selected via route parameter.

## Screens & Routes

Four primary screens satisfy the project's 3–5 screen requirement:

| # | Screen | Route | Purpose |
|---|--------|-------|---------|
| 1 | Explore / Home | `/explore` | Introduce PokeFolio, list the five sets |
| 2 | Set Card Browser | `/explore/:setId` | Browse and search cards in a set |
| 3 | Card Details | `/card/:cardId` | View a single card, add to binder |
| 4 | Digital Binder | `/binder` | Organize, persist, and customize the binder |

Individual sets and cards are addressed via route parameters
(`/explore/base`, `/card/sv3-001`) rather than one route per set or card.

## User Flow

```
Explore → Choose Set → Browse/Search Cards → View Card Details
   → Add to Binder → Organize Binder → Customize Binder
```

## Card Details Scope

Displayed fields are limited to what's relevant to a collecting/browsing
experience: image, name, type, set, card number, and optionally rarity and
artist. Gameplay data (attacks, abilities, weaknesses, resistances, retreat
cost, competitive legality) is intentionally excluded.

## Digital Binder

The binder is the app's core feature — a persistent collection where users
add, remove, and reposition cards. There is no separate wishlist feature;
the binder serves that purpose.

### No-login persistence: anonymous identity

Instead of user accounts, PokeFolio identifies each visitor with a randomly
generated **anonymous ID**:

- On first visit, the frontend generates an ID (`crypto.randomUUID()`) and
  stores it in `localStorage`.
- Every API request sends that ID as a custom header (e.g. `X-Anon-Id`).
- The backend scopes binder rows and preferences to that ID instead of a
  logged-in user, so refreshing or returning later restores the same
  binder — no password, no session, no login screen.

**Tradeoff:** identity is tied to the browser/device. Clearing site data,
switching browsers, or using incognito starts a fresh binder. This is called
out as an accepted MVP limitation rather than a bug.

### Binder grid size

Users choose a binder size — **2×2, 3×3, or 4×4** — as part of customization.
Grid size is stored as a preference, not a fixed layout constant.

- Maximum capacity is a hard 16 slots (4×4), so no pagination or infinite
  scroll is needed for the MVP.
- Card placement uses a **linear position index** (`0, 1, 2, …`); the
  frontend derives row/column from the current grid size
  (`row = floor(position / cols)`).
- If a user shrinks the grid below their current card count, overflow cards
  are **not deleted** — they're simply not rendered until the grid is
  enlarged again.

### Customization

Customization lives inside the Binder screen (panel, drawer, or modal — TBD
during implementation) rather than a separate route. Options: grid size,
background color, binder color, accent color, and theme presets.

## Data Model

```
sets (1) ──< (many) cards
cards (1) ──< (many) binder_cards
```

**`sets`**
`id, name, series, total_cards, release_date, logo_url`

**`cards`**
`id, name, type, image_url, set_id, card_number`

**`binder_cards`**
`id, card_id, anon_id, position, created_at`
> `position` is a linear index; row/column are derived on the frontend from
> the current `grid_size` preference.

**`user_preferences`**
`id, anon_id (unique), background, binder_color, accent_color, theme, grid_size`
> One row per anonymous visitor rather than a single global row.

## External API / Data Pipeline

PokeFolio uses the **Pokémon TCG API** (pokemontcg.io) as its external data
source. It is free to use, and a free API key has been obtained via its
developer dashboard. It is used only during a one-time/occasional **import**
process — not queried live on every user request.

**API details:**

| | |
|---|---|
| Base URL | `https://api.pokemontcg.io/v2` |
| Endpoints used | `/sets`, `/sets/:id`, `/cards`, `/cards/:id` |
| Auth | API key sent via `X-Api-Key` request header |
| Get a key | `https://dev.pokemontcg.io/dashboard` |
| Rate limits | 1,000 requests/day, 30/min unauthenticated; higher once authenticated with an API key |

```
Pokémon TCG API → Import Script → PostgreSQL → Express API → React (PokeFolio)
```

**Attribution & security:** the API key is stored in a `.env` file, excluded
from version control via `.gitignore`, and never exposed to the frontend or
committed to the repository. Pokémon TCG API is credited in the README and
within the application per its Terms of Service.

## Planned Express API

```
GET  /api/sets

GET  /api/cards            (supports ?set=, ?search=)
GET  /api/cards/:id

GET    /api/binder            (scoped by X-Anon-Id)
POST   /api/binder             (scoped by X-Anon-Id)
PUT    /api/binder/:id         (scoped by X-Anon-Id)
DELETE /api/binder/:id         (scoped by X-Anon-Id)

GET /api/preferences          (scoped by X-Anon-Id)
PUT /api/preferences          (scoped by X-Anon-Id)
```

## Development Plan

| Phase | Focus |
|-------|-------|
| 1 | Planning & design (complete) |
| 2 | Project setup, database schema, anonymous-ID plumbing, API import pipeline |
| 3 | Explore / Home screen |
| 4 | Set Card Browser (search, loading/error states) |
| 5 | Card Details + first end-to-end add-to-binder flow |
| 6 | Binder — basic persistence (add/remove/reload), fixed default grid |
| 7 | Binder organization (positioning, drag-and-drop if practical) |
| 8 | Binder customization (grid size, colors, themes, persistence) |
| 9 | Polish, states, testing, deployment |

Development proceeds in user-flow order: foundation → explore → browse →
details → binder → organization → customization → polish/deploy. Basic
persistence is built before advanced interactions like drag-and-drop or
grid resizing.

## Open Questions

These are non-blocking and can be resolved during implementation:

- Should drag-and-drop reordering be added, or simpler move controls?
- Should overflowed (hidden) cards be visually indicated in the UI when the
  grid is shrunk?
- Should localStorage anon IDs have a fallback (e.g. cookie) for stricter
  privacy browser settings that clear storage aggressively?
- Which customization presets ship by default vs. fully custom colors?

## Explicitly Out of Scope

Price tracking, market values, trading, buying/selling, deck building,
competitive gameplay, full TCG mechanics/catalog, social profiles, friend
systems, marketplace functionality, advanced collection statistics, and
user accounts/login.

## MVP Statement

> PokeFolio lets visitors explore five curated English Pokémon TCG sets,
> browse and search their cards, view individual card details, add selected
> cards to a personal digital binder, choose a binder size and organize
> cards visually, and customize the binder's appearance — all persisted
> per-browser with no login required, across four primary screens: Explore,
> Set Card Browser, Card Details, and Digital Binder + Customization.