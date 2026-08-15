# PokeFolio — Project Plan

## 1. Project Overview

**PokeFolio** is a customizable digital Pokémon TCG binder where users can explore a curated selection of English Pokémon TCG sets, choose cards they like, and organize them into a personal digital binder.

The focus of PokeFolio is the **visual experience of discovering, collecting, organizing, and customizing cards**, rather than card prices, trading, or competitive gameplay.

The application will recreate the experience of a physical Pokémon card binder digitally while allowing users to personalize the binder's appearance — with no login or account creation required. Each visitor receives a browser-scoped anonymous UUID stored client-side; the actual binder contents and preferences are persisted server-side in PostgreSQL and retrieved using that anonymous ID.

---

## 2. Main Goal

PokeFolio aims to demonstrate a complete full-stack application that combines:

- React + Vite
- Express.js
- PostgreSQL
- REST API development
- External API integration
- Database relationships
- Card search and filtering
- Persistent, per-visitor data — without authentication
- UI/UX design
- Visual customization

The application will use the **Pokémon TCG API** as the external source for card and set information, while PostgreSQL will store the curated card catalog used by PokeFolio.

---

## 3. MVP Definition

The MVP will allow a user to:

1. Open PokeFolio and view the five supported Pokémon TCG sets.
2. Select a set.
3. Browse the cards belonging to that set.
4. Search for a specific card.
5. Open an individual card's details.
6. Add the card to their digital binder.
7. Remove and organize cards in the binder.
8. Choose a binder grid size and customize the binder's appearance.
9. Persist binder contents and customization settings across sessions, tied to their browser, without creating an account.

The MVP does **not** include card pricing, trading, deck building, competitive gameplay, user login, or a complete Pokémon TCG database.

---

## 4. Supported Sets

The first version will support five English Pokémon TCG sets:

1. **Base**
2. **Team Rocket**
3. **Scarlet & Violet—151**
4. **Scarlet & Violet—Paldean Fates**
5. **Scarlet & Violet—Prismatic Evolutions**

The exact Pokémon TCG API set IDs and names will be treated as the source of truth during the import process.

The five sets are **content choices within the Explore experience**, not five separate application pages.

---

## 5. User Experience

The intended user flow is:

```
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
Customize Binder (incl. grid size)

```

A user can return to the Explore screen at any time and select another set. No login step exists anywhere in this flow.

---

## 6. Screens / Routes

The project will target **four primary screens/routes**, satisfying the professor's requirement of **3–5 screens or routes**.

### Screen 1 — Explore / Home

Route:

```
/explore

```

Purpose:

- Introduce PokeFolio
- Display the five supported sets
- Allow users to choose which set they want to explore

```
┌─────────────────────────────┐
│          PokeFolio          │
│                             │
│       Explore Sets          │
│                             │
│ [ Base ]                    │
│ [ Team Rocket ]             │
│ [ Scarlet & Violet—151 ]    │
│ [ Paldean Fates ]           │
│ [ Prismatic Evolutions ]    │
└─────────────────────────────┘

```

---

### Screen 2 — Set Card Browser

Route:

```
/explore/:setId

```

Purpose:

- Display cards belonging to the selected set
- Allow generalized card searching
- Allow users to select an individual card
- Return to the Explore screen and choose another set

```
┌─────────────────────────────┐
│ ← Back to Sets              │
│                             │
│ Base Set                    │
│                             │
│ [ Search cards... ]         │
│                             │
│ [Card] [Card] [Card]        │
│ [Card] [Card] [Card]        │
│ [Card] [Card] [Card]        │
└─────────────────────────────┘

```

The same page/component handles all five sets. PokeFolio will **not** create separate pages such as `BasePage`, `TeamRocketPage`, `151Page`. The selected set determines which cards are displayed.

---

### Screen 3 — Card Details

Route:

```
/card/:cardId

```

Purpose:

- Display a selected card
- Show minimal information necessary to identify it
- Allow the user to add it to their binder

```
┌─────────────────────────────┐
│ ← Back                      │
│                             │
│       [ Card Image ]        │
│                             │
│ Charizard                   │
│ Base Set                    │
│ #4                          │
│ Fire                        │
│                             │
│ [ Add to Binder ]           │
└─────────────────────────────┘

```

---

### Screen 4 — Digital Binder

Route:

```
/binder

```

Purpose:

- Display the user's selected cards
- Organize cards within binder slots
- Choose a binder grid size (2×2, 3×3, or 4×4)
- Remove cards
- Persist card positions
- Customize the binder's appearance

Customization is part of the Binder experience rather than a separate `/customize` page.

```
┌────────────────────────────────┐
│ My Binde      [3x3] [Customize]│
├──────────┬──────────┬──────────┤
│  Card    │  Card    │  Card    │
├──────────┼──────────┼──────────┤
│  Card    │  Card    │  Card    │
├──────────┼──────────┼──────────┤
│  Card    │  Card    │  Card    │
└──────────┴──────────┴──────────┘

```

Customization may appear as a panel, modal, drawer, or similar interface within the Binder screen.

---

## 7. Routing Structure

```
/explore
/explore/:setId
/card/:cardId
/binder

```

Individual sets and cards are represented through route parameters rather than creating separate routes for every set or card. For example:

```
/explore
/explore/base
/explore/team-rocket
/explore/151
/card/sv3-001

```

The application remains within the **3–5 screen requirement** while still supporting specific sets and cards.

---

## 8. Card Details Scope

Potential fields:

- Card image
- Card name
- Card type
- Set
- Card number
- Rarity, if useful
- Artist, if useful

The project avoids unnecessary gameplay information: attacks, abilities, weaknesses, resistances, retreat costs, competitive legality, and other mechanics not required by the application. Exact displayed fields may be adjusted during implementation.

---

## 9. Digital Binder

Users will be able to:

- Add cards
- Remove cards
- View selected cards
- Organize cards within binder slots
- Move cards between pages and spreads
- Choose a binder-wide grid size
- Add and delete binder spreads
- Persist card positions
- Customize the binder's appearance

The binder acts as the user's personal digital collection/wishlist space. A separate wishlist feature will **not** be created.

### Binder structure

The binder recreates the experience of a physical Pokémon card binder using **two-page spreads**. A spread is the visual unit the user sees and navigates through. Each spread contains exactly two pages displayed side-by-side: a left page and a right page.

```text
Binder
│
├── Spread 1
│   ├── Page 1 — Left
│   └── Page 2 — Right
│
├── Spread 2
│   ├── Page 3 — Left
│   └── Page 4 — Right
│
├── Spread 3
│   ├── Page 5 — Left
│   └── Page 6 — Right
│
└── ...
```

Conceptually, the user is viewing a **two-page section of the binder at a time**, not navigating to individual pages. Moving forward or backward changes the current spread: Page 1 + Page 2 → Page 3 + Page 4 → Page 5 + Page 6, and so on.

A binder starts with one spread containing two pages. Users can add additional spreads, which creates two new pages at once. Users can delete a spread only when more than one spread exists; the final remaining spread cannot be deleted, so the binder always contains at least two pages.

The spread is the unit of navigation. On desktop, users can use left/right navigation controls to move between spreads; on touch devices, users can swipe horizontally between spreads.

Each page supports a maximum of 16 stored positions (`0–15`), corresponding to the maximum 4×4 grid. The selected grid size is shared across the entire binder, so every page uses the same 2×2, 3×3, or 4×4 layout. This gives each spread a maximum of 32 visible slots at 4×4.

A specific card may appear only once across the entire binder, regardless of spread or page. Deleting a spread removes its two pages and their card placements, but never deletes the card from the global catalog.

## 10. No-Login Persistence: Anonymous Identity

Instead of user accounts, PokeFolio identifies each visitor using a randomly generated **anonymous UUID**, avoiding any login, password, or session-management system.

**How it works:**

1. On first visit, the frontend generates a UUID (`crypto.randomUUID()`) if one doesn't already exist.
2. The ID is stored client-side in `localStorage`.
3. Every binder/preferences API request sends the ID as the `X-Anon-Id` request header.
4. Express validates the UUID and scopes the visitor's binder and preferences to that ID in PostgreSQL.

The browser stores only the identifier. The actual binder data is stored server-side in PostgreSQL.

**Tradeoffs (accepted for MVP):**

- Identity is tied to the specific browser/device.
- Refreshing the page does **not** reset the binder because the same anonymous ID is reused.
- Clearing site data, switching browsers, or ending an incognito session starts a new anonymous binder.
- No password recovery or cross-device sync is possible — this is explicitly out of scope.

This approach keeps the full-stack persistence requirement while avoiding account creation and authentication complexity.

## 11. Binder Customization

Customization is integrated directly into the Binder experience.

**Options:**

- **Grid size** — user selects 2×2, 3×3, or 4×4 for the entire binder
- Background color
- Binder color
- Accent color
- Theme combinations

Example:

```text
Pink background
+
White binder
+
Pink accents
```

or:

```text
Black background
+
Gray binder
+
Neutral accents
```

### Grid size mechanics

- Maximum visible capacity per **page** is 16 slots (4×4).
- Each spread therefore has a maximum of 32 visible slots at 4×4 because it contains two pages.
- The binder may contain any number of user-created spreads within the MVP.
- Card placement uses a **linear position index** (`0, 1, 2, …, 15`); the frontend derives row/column from the current binder-wide `grid_size` preference (`row = floor(position / cols)`).
- If a user shrinks the grid, placements outside the visible range are **not deleted** — they remain stored and are shown again if the grid is enlarged later.
- Changing the grid size applies to **every page in every spread** in the binder.

The implementation should allow additional customization options to be added later without requiring a major restructuring of the application.

## 12. Database

The PostgreSQL database is intentionally small and focused on the application's actual functionality. The schema has now been implemented and verified locally through the initial migration.

### `sets`

```text
id              TEXT PRIMARY KEY        -- Pokémon TCG API set ID
name            TEXT NOT NULL
series          TEXT NOT NULL
printed_total   INTEGER NOT NULL
                  CHECK (printed_total >= 0)
total           INTEGER NOT NULL
                  CHECK (total >= printed_total)
release_date    DATE NOT NULL
logo_url        TEXT NOT NULL
symbol_url      TEXT NOT NULL
```

### `cards`

```text
id                TEXT PRIMARY KEY      -- Pokémon TCG API card ID
set_id            TEXT NOT NULL         -- references sets(id)
name              TEXT NOT NULL
supertype         TEXT NOT NULL
types             TEXT[]
number            TEXT NOT NULL
rarity            TEXT
artist            TEXT
image_small_url   TEXT NOT NULL
image_large_url   TEXT NOT NULL
```

Cards store only metadata needed by the PokeFolio MVP. Gameplay mechanics such as attacks, abilities, weaknesses, resistances, retreat costs, and market-price information are intentionally excluded.

Relationship:

```text
sets
  │
  │ 1
  │
  │
  │ many
  ▼
cards
```

### `user_preferences`

```text
anon_id         UUID PRIMARY KEY
background      TEXT NOT NULL
binder_color    TEXT NOT NULL
accent_color    TEXT NOT NULL
theme           TEXT NOT NULL
grid_size       SMALLINT NOT NULL CHECK (grid_size IN (2, 3, 4))
```

One row per anonymous visitor stores binder-wide appearance and grid preferences.

### `binder_spreads`

```text
id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
anon_id         UUID NOT NULL
sort_order      INTEGER NOT NULL CHECK (sort_order >= 1)
created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
```

A spread has a stable generated ID and a display order unique within the anonymous binder.

### `binder_pages`

```text
anon_id         UUID NOT NULL
spread_id       BIGINT NOT NULL
side            SMALLINT NOT NULL CHECK (side IN (1, 2))
created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP

PRIMARY KEY (anon_id, spread_id, side)
```

`side = 1` is the left page and `side = 2` is the right page. Each spread always has exactly one of each, created together in the same transaction.

### `binder_cards`

```text
id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
anon_id         UUID NOT NULL
spread_id       BIGINT NOT NULL
page_side       SMALLINT NOT NULL CHECK (page_side IN (1, 2))
card_id         TEXT NOT NULL
position        SMALLINT NOT NULL CHECK (position BETWEEN 0 AND 15)
created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
```

Foreign keys ensure the placement points to a real page owned by the same anonymous visitor. The table enforces:

```text
UNIQUE (anon_id, card_id)
UNIQUE (anon_id, spread_id, page_side, position)
```

The first rule means an exact card can appear only once anywhere in a visitor's binder. The second means a page position can contain at most one card. The position uniqueness constraint is **DEFERRABLE** to support atomic card swaps during organization.

### Database integrity and behavior

- Deleting a spread cascades to its two pages and then to their binder card placements.
- The global `cards` catalog is never deleted when a binder spread is deleted.
- Binder-changing operations use a transaction-scoped PostgreSQL advisory lock keyed by `anon_id` to serialize concurrent updates for one anonymous binder.
- The last remaining spread cannot be deleted; this rule is enforced by the backend/service transaction.

### Verified implementation state

The `pokefolio` database has been created and the initial migration completed successfully. The six tables above were inspected with PostgreSQL and their primary keys, foreign keys, checks, unique constraints, indexes, and cascade relationships were verified. All six tables were empty before catalog import, and the database is now ready for the Pokémon TCG catalog import.

## 13. User Authentication

**Authentication will not be implemented.** PokeFolio uses browser-scoped anonymous identity (Section 10) instead of accounts for the entire MVP and foreseeable scope. This avoids login, password handling, and session management entirely, while still giving each visitor a persistent, personal binder.

---

## 14. External API / Card Data

PokeFolio uses the **Pokémon TCG API** (pokemontcg.io) as its external source for card and set metadata.

**API details:**

| | |
| --- | --- |
| Base URL | `https://api.pokemontcg.io/v2` |
| Set endpoints | `GET /sets`, `GET /sets/:id` |
| Card endpoints | `GET /cards`, `GET /cards/:id` |
| Auth | API key sent via `X-Api-Key` request header |
| Get a key | `https://dev.pokemontcg.io/dashboard` |

### Approved set IDs

The exact five MVP set IDs have been validated against the live API:

```text
Base                               → base1
Team Rocket                        → base5
Scarlet & Violet—151               → sv3pt5
Scarlet & Violet—Paldean Fates     → sv4pt5
Scarlet & Violet—Prismatic Evolutions → sv8pt5
```

### Catalog fields used by PokeFolio

Relevant set data:

- Set ID
- Set name
- Series
- `printedTotal`
- `total`
- Release date
- Set logo URL
- Set symbol URL

Relevant card data:

- Card ID
- Card name
- Set ID
- Supertype
- Types
- Card number
- Rarity
- Artist
- `images.small`
- `images.large`

Gameplay mechanics and market data are not required by the MVP and are not stored in PostgreSQL.

### API validation status

Authenticated read-only validation confirmed complete card retrieval and both card image URLs for:

```text
base1   → 102 / 102
base5   → 83 / 83
sv4pt5  → 245 / 245
```

`sv3pt5` and `sv8pt5` are valid approved set IDs, but complete card retrieval intermittently returned upstream HTTP 500/502 responses during final validation. The importer therefore includes bounded retry/backoff handling and can resume failed set imports later without rebuilding the database.

### Import architecture

The Pokémon TCG API is used primarily during the **card catalog import process**. PokeFolio does not query the external API on every normal browse request. Imported data is stored in PostgreSQL and served through Express.

```text
Pokémon TCG API
       ↓
   Import / Seed
       ↓
   PostgreSQL
       ↓
   Express API
       ↓
 React + Vite
       ↓
   PokeFolio
```

The importer processes each set independently and validates the complete API response before opening that set's short PostgreSQL transaction. It uses idempotent upserts, verifies card counts, retries temporary failures such as HTTP 500/502/503 and network timeouts, and does not destructively delete catalog cards.

## 15. API Attribution

The project will:

- Keep the Pokémon TCG API key (from `dev.pokemontcg.io`) private
- Store credentials in a `.env` file, excluded via `.gitignore`
- Never expose the key to the frontend or commit it to the repository
- Follow the Pokémon TCG API Terms of Service
- Credit the Pokémon TCG API in the README
- Provide appropriate attribution within the application
- Include a link to the PokeFolio repository when required for API usage communication

---

## 16. Planned Express API

The backend contract is now defined around the implemented PostgreSQL model and the approved anonymous-binder behavior.

### Health

```text
GET /api/health
```

### Sets

```text
GET /api/sets
GET /api/sets/:setId
```

### Cards

```text
GET /api/cards
GET /api/cards/:cardId
```

`GET /api/cards` may support query parameters such as `?set=...` and `?search=...` for browsing and search.

### Binder

All binder endpoints require a valid `X-Anon-Id` UUID.

```text
POST   /api/binder/initialize
GET    /api/binder

POST   /api/binder/cards
PATCH  /api/binder/cards/:cardId
DELETE /api/binder/cards/:cardId

POST   /api/binder/spreads
DELETE /api/binder/spreads/:spreadId
```

Card placement endpoints support adding, moving, swapping, and removing cards. Card movement is transactional and supports moving between the left/right pages of a spread as well as between different spreads. The frontend treats the two pages of each spread as the visible binder section.

`POST /api/binder/initialize` creates the default preferences and first spread idempotently. `POST /api/binder/spreads` adds a new two-page spread. `DELETE /api/binder/spreads/:spreadId` removes a non-final spread and cascades its pages and placements.

The backend rejects a missing or invalid anonymous UUID with `400 Bad Request`. Deleting the final remaining spread returns `409 Conflict` rather than allowing the binder to reach zero spreads.

### Preferences

All preference endpoints require `X-Anon-Id`.

```text
GET /api/preferences
PUT /api/preferences
```

Preferences are binder-wide and include grid size and appearance settings.

## 17. Development Plan

### Phase 1 — Planning & Design (complete)

- Define PokeFolio concept
- Reduce scope from 10 sets to 5 sets
- Define the project's core purpose
- Establish the digital binder concept
- Define the MVP
- Define the four primary screens
- Decide to merge customization into the Binder experience
- Decide on anonymous-ID persistence instead of authentication
- Decide on selectable binder-wide grid size (2×2–4×4) with linear position indexing
- Define dynamic two-page spreads with add/delete behavior
- Identify the Pokémon TCG API as the external data source
- Validate the exact API set IDs
- Plan API attribution
- Define and review the PostgreSQL schema
- Define the Express API contract
- Define the development order

### Phase 2 — Project Setup & Foundation

**Project setup**

- Create GitHub repository
- Initialize React + Vite
- Initialize Express backend
- Configure PostgreSQL
- Configure environment variables
- Configure `.gitignore`
- Establish frontend/backend folder structure
- Establish Git workflow
- Implement anonymous-ID generation and `X-Anon-Id` request header on the frontend
- Implement Express middleware to read/validate `X-Anon-Id`

**Database — completed**

- Create PostgreSQL database
- Create `sets` table
- Create `cards` table
- Create `user_preferences` table
- Create `binder_spreads` table
- Create `binder_pages` table
- Create `binder_cards` table
- Establish database relationships and integrity constraints
- Implement migration runner
- Test database connection configuration
- Verify the actual PostgreSQL schema with `\dt` and `\d`
- Confirm all six tables are empty before import

**API data pipeline — completed**

- Confirm exact API IDs for the five sets
- Obtain and securely configure API key
- Validate card response structure and image URLs
- Create import/seed script
- Implement per-set transactions and idempotent upserts
- Implement retry/backoff handling for temporary API failures
- Validate full set responses before database writes
- Import Base and verify card count
- Import Team Rocket and verify card count
- Import 151 and verify card count
- Import Paldean Fates and verify card count
- Import Prismatic Evolutions and verify card count
- Verify final five-set catalog counts and image URLs
- Verify 5 sets and 817 cards directly in PostgreSQL

**Express REST API — current work**

- Implement `GET /api/sets`
- Implement `GET /api/sets/:setId`
- Implement `GET /api/cards`
- Implement `GET /api/cards/:cardId`
- Implement anonymous-ID validation middleware
- Implement `POST /api/binder/initialize`
- Implement `GET /api/binder`
- Implement `POST /api/binder/cards`
- Implement `PATCH /api/binder/cards/:cardId`
- Implement `DELETE /api/binder/cards/:cardId`
- Implement `POST /api/binder/spreads`
- Implement `DELETE /api/binder/spreads/:spreadId`
- Implement `GET /api/preferences`
- Implement `PUT /api/preferences`

**Phase 2 verification**

- Verify Express can retrieve sets from PostgreSQL
- Verify Express can retrieve cards from PostgreSQL
- Verify invalid requests return appropriate errors
- Verify anonymous binder initialization
- Verify add-card persistence
- Verify remove-card persistence
- Verify card movement and swap behavior
- Verify spread creation
- Verify spread deletion
- Verify final-spread protection
- Verify preferences persistence
- Verify end-to-end backend flow

**Current Phase 2 checkpoint:**

```text
Project setup              ✅
PostgreSQL database         ✅
Database schema/migration   ✅
Schema verification         ✅
API credentials             ✅
API set/card validation     ✅
Importer implementation     ✅
Catalog import              ✅  (5 sets / 817 cards)
Express REST API            ⏳ ← current
Phase 2 verification        ⏳
```

### Phase 3 — Explore / Home

- Create Explore route
- Create PokeFolio header
- Fetch sets from Express
- Display five set cards
- Display set names
- Display set logos/images
- Add set-selection interaction
- Add loading state
- Add error state

Goal:

```text
Open PokeFolio
      ↓
See five sets
      ↓
Click a set
```

### Phase 4 — Set Card Browser

Build `/explore/:setId`:

- Display selected set information
- Load cards belonging to the selected set
- Display card grid
- Display card images
- Implement generalized card search
- Handle no search results
- Add loading states
- Add error states
- Implement return-to-sets navigation

Must work for **all five sets using the same component**.

### Phase 5 — Card Details

Build `/card/:cardId`:

- Load individual card
- Display card image, name, set, card number, type
- Display other minimal identifying information
- Add "Add to Binder" action
- Handle card loading/error states

First complete user flow:

```text
Explore → Select Set → Browse Cards → Select Card → Add to Binder
```

### Phase 6 — Binder

Build `/binder` — start with the simplest working implementation:

- Initialize the anonymous binder
- Load saved binder data scoped by `anon_id`
- Display the current two-page spread
- Display left and right pages side-by-side
- Display cards in binder slots
- Remove cards
- Add cards to binder
- Store card positions
- Update card positions
- Persist binder state
- Handle empty binder state
- Navigate between spreads
- Add spreads
- Delete spreads
- Prevent deletion of the final remaining spread

First binder milestone:

```text
Add Card
   ↓
Card Appears in Binder
   ↓
Refresh Browser
   ↓
Card Is Still There (same anon_id)
```

### Phase 7 — Binder Organization

- Implement card repositioning
- Implement movement to empty slots
- Implement occupied-slot swapping
- Implement movement between the left/right pages of a spread
- Implement movement between different spreads
- Persist updated positions
- Add drag-and-drop interaction
- Add touch-friendly movement where practical

### Phase 8 — Binder Customization

- Grid size selector (2×2, 3×3, 4×4)
- Apply one grid size across the entire binder
- Overflow handling when shrinking the grid size (hide, don't delete)
- Background customization
- Binder color
- Accent color
- Theme presets
- Save customization settings scoped by `anon_id`
- Load customization settings from PostgreSQL

The final implementation may use a modal, drawer, side panel, or inline controls, depending on final UI design.

### Phase 9 — Polish & Deployment

**UI/UX**

- Responsive layout
- Consistent spacing
- Typography
- Visual hierarchy
- Card hover states
- Navigation improvements
- Animations where appropriate

**Application states**

- Loading states
- Empty states
- API errors
- Database errors
- Search with no results
- Missing card handling
- Missing/invalid `anon_id` handling
- Spread add/delete feedback and confirmation

**Testing**

Test the complete flow:

```text
Open PokeFolio
      ↓
Choose Set
      ↓
Search/Browse Cards
      ↓
Open Card
      ↓
Add Card
      ↓
Open Binder
      ↓
Move/Remove Card
      ↓
Navigate Between Spreads
      ↓
Add/Delete Spread
      ↓
Change Grid Size
      ↓
Customize Binder
      ↓
Refresh
      ↓
Verify Persistence (same browser, no login)
```

**Deployment**

- Deploy frontend
- Deploy Express backend
- Configure production environment variables
- Configure production PostgreSQL
- Test deployed application
- Complete README
- Add API attribution
- Clean GitHub repository
- Remove development leftovers

## 18. Development Order at a Glance

```text
Phase 1
└── Planning & Design ✅

Phase 2
├── PostgreSQL setup ✅
├── Database schema ✅
├── API import ✅
├── 817 cards ✅
└── Express REST API ⏳ ← current

Phase 3
└── Explore / Home ⏳

Phase 4
└── Set Card Browser ⏳

Phase 5
└── Card Details ⏳

Phase 6
└── Binder ⏳

Phase 7
└── Binder Organization ⏳

Phase 8
└── Binder Customization ⏳

Phase 9
└── Polish & Deployment ⏳
```

---

## 19. Open Questions

The core architecture is now resolved. Remaining questions are primarily UI/UX polish or optional future scope:

- Should hidden overflow cards be visually indicated while the grid is shrunk?
- Should localStorage anonymous IDs have a fallback (e.g. cookie) for browser settings that clear storage aggressively?
- Which customization presets ship by default vs. fully custom colors?
- Which exact optional card fields should appear on Card Details?

These should remain secondary until the core MVP is functional.

## 20. Features Explicitly Outside the MVP

- Card price tracking
- Market values
- Trading
- Buying/selling
- Deck building
- Competitive gameplay
- Complete Pokémon TCG mechanics
- Every Pokémon TCG set
- Advanced binder/page management beyond the MVP spread model
- Social profiles
- Friend systems
- Trading between users
- Marketplace functionality
- Advanced collection statistics
- User accounts / login
- Cross-device sync
- Multiple saved themes, unless time permits

---

## 21. Final MVP Statement

> **PokeFolio lets users explore five curated English Pokémon TCG sets, browse and search their cards, view individual card details, add selected cards to a personal digital binder, organize cards across two-page spreads with left/right pages, add or delete spreads while keeping at least one spread, choose a binder-wide grid size, and customize the binder's appearance — all persisted per-browser with no login required.**

The final application uses **four primary screens/routes**:

```
1. Explore / Set Selection
2. Set Card Browser
3. Card Details
4. Digital Binder + Customization

```

This keeps the application within the professor's **3–5 screen requirement** while ensuring every screen has a clear purpose.

Some content has been disabled in this document  