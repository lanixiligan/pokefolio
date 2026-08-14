# PokeFolio — Project Proposal

## Overview

PokeFolio is a full-stack web application that recreates the experience of a
physical Pokémon TCG binder in digital form. Users explore a curated set of
English Pokémon TCG sets, browse and search cards, and add selected cards to
a personal digital binder that can be organized and visually customized.

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
- Persistent user data
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
8. Customize the binder's appearance
9. Persist binder contents and customization settings across sessions

**Out of scope for MVP:** pricing/market values, trading, deck building,
competitive gameplay, user authentication, social/friend features, and
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

The binder is the app's core feature — a single persistent collection where
users add, remove, and reposition cards. There is no separate wishlist
feature; the binder serves that purpose.

**Design assumption:** since the MVP has no authentication, the binder is a
single, global collection rather than per-user. `user_preferences` is
treated as a singleton row for the same reason.

### Customization

Customization lives inside the Binder screen (panel, drawer, or modal — TBD
during implementation) rather than a separate route. Initial options:
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
`id, card_id, position, created_at`
> `position` semantics (linear order vs. grid row/col) to be finalized
> before Phase 6 implementation.

**`user_preferences`**
`id, background, binder_color, accent_color, theme`
> Treated as a single-row table given the no-auth MVP scope.

## External API / Data Pipeline

The Pokémon TCG API is used only during a one-time/occasional **import**
process — not queried live on every user request.

```
Pokémon TCG API → Import Script → PostgreSQL → Express API → React (PokeFolio)
```

**Attribution:** API key stored in environment variables and kept private;
Pokémon TCG API credited in the README and within the application per its
Terms of Service.

## Planned Express API

```
GET  /api/sets

GET  /api/cards            (supports ?set=, ?search=)
GET  /api/cards/:id

GET    /api/binder
POST   /api/binder
PUT    /api/binder/:id
DELETE /api/binder/:id

GET /api/preferences
PUT /api/preferences
```

## Development Plan

| Phase | Focus |
|-------|-------|
| 1 | Planning & design (complete) |
| 2 | Project setup, database schema, API import pipeline |
| 3 | Explore / Home screen |
| 4 | Set Card Browser (search, loading/error states) |
| 5 | Card Details + first end-to-end add-to-binder flow |
| 6 | Binder — basic persistence (add/remove/reload) |
| 7 | Binder organization (positioning, drag-and-drop if practical) |
| 8 | Binder customization (colors, themes, persistence) |
| 9 | Polish, states, testing, deployment |

Development proceeds in user-flow order: foundation → explore → browse →
details → binder → organization → customization → polish/deploy. Basic
persistence is built before advanced interactions like drag-and-drop.

## Open Questions

These are non-blocking and can be resolved during implementation:

- Fixed grid (e.g. 3×3) for the binder, or flexible layout?
- Free drag-and-drop vs. simpler move controls?
- Support for multiple binder pages?
- Which customization options are essential for MVP vs. later?
- Should authentication be added post-MVP?

## Explicitly Out of Scope

Price tracking, market values, trading, buying/selling, deck building,
competitive gameplay, full TCG mechanics/catalog, social profiles, friend
systems, marketplace functionality, advanced collection statistics, and
(for now) user authentication.

## MVP Statement

> PokeFolio lets users explore five curated English Pokémon TCG sets, browse
> and search their cards, view individual card details, add selected cards
> to a personal digital binder, organize those cards visually, and customize
> the binder's appearance — across four primary screens: Explore, Set Card
> Browser, Card Details, and Digital Binder + Customization.