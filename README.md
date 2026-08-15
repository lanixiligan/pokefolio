# PokeFolio

A customizable digital Pokémon TCG binder that lets Pokémon fans and fellow nerds discover, organize, and showcase the cards they love.

## Status

🚧 **In Development — Phase 2: Backend & Database Foundation**

The PostgreSQL database schema and Pokémon TCG catalog import pipeline are implemented and verified. The next major backend milestone is exposing the stored catalog through the Express REST API.

## Overview

PokeFolio recreates the experience of a physical Pokémon TCG binder as a web application.

Users can explore five curated English Pokémon TCG sets, browse and search cards, view individual card details, and organize selected cards into a personal digital binder.

The MVP focuses on the visual experience of discovering, collecting, organizing, and customizing cards.

PokeFolio intentionally does **not** include card pricing, trading, deck building, competitive gameplay, or user accounts.

## Supported Sets

PokeFolio currently supports these five English Pokémon TCG sets:

- **Base** (`base1`)
- **Team Rocket** (`base5`)
- **Scarlet & Violet—151** (`sv3pt5`)
- **Scarlet & Violet—Paldean Fates** (`sv4pt5`)
- **Scarlet & Violet—Prismatic Evolutions** (`sv8pt5`)

The catalog currently contains **817 imported cards** across these five sets.

## Core User Flow

```text
Explore
   ↓
Choose a Set
   ↓
Browse / Search Cards
   ↓
View Card Details
   ↓
Add to Binder
   ↓
Organize Binder
   ↓
Customize Binder
```

## Binder

PokeFolio uses a browser-scoped anonymous identity instead of account authentication.

A binder contains one or more **two-page spreads**:

```text
Binder
├── Spread 1
│   ├── Left Page
│   └── Right Page
├── Spread 2
│   ├── Left Page
│   └── Right Page
└── ...
```

Users can add additional spreads and delete spreads as long as at least one spread remains.

Each binder uses one grid size across all pages:

- 2×2
- 3×3
- 4×4

Each page supports a maximum of 16 stored positions. If the grid is reduced, cards outside the visible range are hidden rather than deleted and can reappear when the grid is enlarged.

An exact card can appear only once within a user's binder.

## Application Architecture

```text
Pokémon TCG API
       ↓
   Import / Seed
       ↓
   PostgreSQL
       ↓
 Express REST API
       ↓
 React + Vite
       ↓
     User
```

The Pokémon TCG API is used as the external source for set and card metadata. Imported catalog data is stored in PostgreSQL so normal application browsing does not depend on querying the external API on every request.

## Tech Stack

- React
- Vite
- Node.js
- Express.js
- PostgreSQL

## Current PostgreSQL Schema

The current database contains six tables:

- `sets`
- `cards`
- `user_preferences`
- `binder_spreads`
- `binder_pages`
- `binder_cards`

The schema enforces important binder rules such as:

- one exact card per anonymous binder
- one card per page position
- valid left/right page sides
- valid 4×4 maximum positions
- spread-to-page-to-placement cascade deletion

## Pokémon TCG API

PokeFolio uses the Pokémon TCG API as its external source for set and card metadata.

The API key is kept **backend-only** and is stored in `server/.env`.

It is never exposed to the frontend or committed to the repository.

The imported card catalog stores the MVP fields required by PokeFolio, including:

- card ID
- card name
- supertype
- types
- card number
- rarity
- artist
- small card image URL
- large card image URL

Gameplay-specific and market-price fields are intentionally excluded from the MVP database.

## API Attribution

PokeFolio will credit the Pokémon TCG API as its external data source and follow the API's applicable terms and attribution requirements.

The API credential itself is private and must never be included in the README, source code, or other public project files.

## Backend Data Pipeline

The catalog import process is designed to be:

- authenticated
- resumable
- idempotent
- retry-aware
- transactional per set
- non-destructive toward existing catalog cards

For each supported set, the importer validates the complete API response before committing that set to PostgreSQL.

The current verified catalog totals are:

```text
Base                     102
Team Rocket               83
Scarlet & Violet—151     207
Paldean Fates            245
Prismatic Evolutions     180
──────────────────────────────
Total                    817
```

## Project Routes

The MVP currently targets four primary routes:

```text
/explore
/explore/:setId
/card/:cardId
/binder
```

Binder customization is integrated into the Binder experience rather than using a separate customization route.

## Development

The project is being developed incrementally.

Current Phase 2 foundation includes:

- React + Vite project setup
- Express backend setup
- PostgreSQL database
- database migrations
- verified six-table schema
- Pokémon TCG API integration for catalog import
- verified five-set catalog import
- anonymous-browser persistence architecture
- REST API contract planning

The next backend milestone is implementing and testing the Express REST API on top of the verified PostgreSQL catalog.

See [`project-plan.md`](project-plan.md) for the complete development roadmap and architecture decisions.

## Local Environment

Development environment variables are stored locally in:

```text
server/.env
```

A public template is provided as:

```text
server/.env.example
```

Do **not** commit `server/.env`.

## Project Documentation

- [`project-plan.md`](project-plan.md) — detailed project roadmap and engineering decisions
- [`proposal.md`](proposal.md) — project proposal and course-facing project definition

## License / Attribution

PokeFolio is a student project.

Pokémon and Pokémon TCG-related trademarks and content belong to their respective owners. PokeFolio uses the Pokémon TCG API as an external data source and is not an official Pokémon product.
