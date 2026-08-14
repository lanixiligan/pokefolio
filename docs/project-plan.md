# PokeFolio — Project Plan

## 1. Project Overview

**PokeFolio** is a customizable digital Pokémon TCG binder where users can explore a curated selection of English Pokémon TCG sets, choose cards they like, and organize them into a personal digital binder.

The focus of PokeFolio is the **visual experience of discovering, collecting, organizing, and customizing cards**, rather than card prices, trading, or competitive gameplay.

The application will recreate the experience of a physical Pokémon card binder digitally while allowing users to personalize the binder's appearance — with no login or account creation required. Each visitor's binder and preferences persist automatically to their browser.

---

## 2. Main Goal

PokeFolio aims to demonstrate a complete full-stack application that combines:

* React + Vite
* Express.js
* PostgreSQL
* REST API development
* External API integration
* Database relationships
* Card search and filtering
* Persistent, per-visitor data — without authentication
* UI/UX design
* Visual customization

The application will use the **Pokémon TCG API** as the external source for card and set information, while PostgreSQL will store the curated card catalog used by PokeFolio.

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

The MVP does **not** include card pricing, trading, deck building, competitive gameplay, user login, or a complete Pokémon TCG database.

---

## 4. Supported Sets

The first version will support five English Pokémon TCG sets:

1. **Base**
2. **Team Rocket**
3. **Scarlet & Violet—151**
4. **Scarlet & Violet—Paldean Fates**
5. **Scarlet & Violet—Prismatic Evolutions**

The exact Pokémon TCG API set IDs and names will be treated as the source of truth during the import process.

The five sets are **content choices within the Explore experience**, not five separate application pages.

---

## 5. User Experience

The intended user flow is:

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
Customize Binder (incl. grid size)
```

A user can return to the Explore screen at any time and select another set. No login step exists anywhere in this flow.

---

## 6. Screens / Routes

The project will target **four primary screens/routes**, satisfying the professor's requirement of **3–5 screens or routes**.

### Screen 1 — Explore / Home

Route:

```text
/explore
```

Purpose:

* Introduce PokeFolio
* Display the five supported sets
* Allow users to choose which set they want to explore

```text
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

```text
/explore/:setId
```

Purpose:

* Display cards belonging to the selected set
* Allow generalized card searching
* Allow users to select an individual card
* Return to the Explore screen and choose another set

```text
┌─────────────────────────────┐
│ ← Back to Sets              │
│                             │
│ Base Set                     │
│                             │
│ [ Search cards... ]         │
│                             │
│ [Card] [Card] [Card]       │
│ [Card] [Card] [Card]       │
│ [Card] [Card] [Card]       │
└─────────────────────────────┘
```

The same page/component handles all five sets. PokeFolio will **not** create separate pages such as `BasePage`, `TeamRocketPage`, `151Page`. The selected set determines which cards are displayed.

---

### Screen 3 — Card Details

Route:

```text
/card/:cardId
```

Purpose:

* Display a selected card
* Show minimal information necessary to identify it
* Allow the user to add it to their binder

```text
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

```text
/binder
```

Purpose:

* Display the user's selected cards
* Organize cards within binder slots
* Choose a binder grid size (2×2, 3×3, or 4×4)
* Remove cards
* Persist card positions
* Customize the binder's appearance

Customization is part of the Binder experience rather than a separate `/customize` page.

```text
┌──────────────────────────────────────┐
│ My Binder          [Grid: 3x3] [Customize]│
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

```text
/explore
/explore/:setId
/card/:cardId
/binder
```

Individual sets and cards are represented through route parameters rather than creating separate routes for every set or card. For example:

```text
/explore
/explore/base
/explore/team-rocket
/explore/151
/card/sv3-001
```

The application remains within the **3–5 screen requirement** while still supporting specific sets and cards.

---

## 8. Card Details Scope

Potential fields:

* Card image
* Card name
* Card type
* Set
* Card number
* Rarity, if useful
* Artist, if useful

The project avoids unnecessary gameplay information: attacks, abilities, weaknesses, resistances, retreat costs, competitive legality, and other mechanics not required by the application. Exact displayed fields may be adjusted during implementation.

---

## 9. Digital Binder

Users will be able to:

* Add cards
* Remove cards
* View selected cards
* Organize cards within binder slots
* Choose a binder grid size
* Persist card positions
* Customize the binder's appearance

The binder acts as the user's personal digital collection/wishlist space. A separate wishlist feature will **not** be created.

---

## 10. No-Login Persistence: Anonymous Identity

Instead of user accounts, PokeFolio identifies each visitor using a randomly generated **anonymous ID**, avoiding any login, password, or session-management system.

**How it works:**

1. On first visit, the frontend generates a UUID (`crypto.randomUUID()`) if one doesn't already exist.
2. The ID is stored client-side in `localStorage`.
3. Every API request sends the ID as a custom header (e.g. `X-Anon-Id`).
4. The backend scopes `binder_cards` and `user_preferences` rows to that ID, the same way it would use a `user_id` — without requiring an account.

**Tradeoffs (accepted for MVP):**

* Identity is tied to the specific browser/device.
* Clearing site data, switching browsers, or using incognito mode starts a new, empty binder.
* No password recovery or cross-device sync is possible — this is explicitly out of scope.

This approach replaces the originally-considered "single global binder" model and resolves the ambiguity of `user_preferences` being a singleton: it is now one row per anonymous visitor instead.

---

## 11. Binder Customization

Customization is integrated directly into the Binder experience.

**Options:**

* **Grid size** — user selects 2×2, 3×3, or 4×4
* Background color
* Binder color
* Accent color
* Theme combinations

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

**Grid size mechanics:**

* Maximum capacity is a hard 16 slots (4×4) — no pagination or infinite scroll is needed for the MVP.
* Card placement uses a **linear position index** (`0, 1, 2, …`); the frontend derives row/column from the current `grid_size` preference (`row = floor(position / cols)`).
* If a user shrinks the grid below their current card count, overflow cards are **not deleted** — they are simply not rendered until the grid is enlarged again.

The implementation should allow additional customization options to be added later without requiring a major restructuring of the application.

---

## 12. Database

The PostgreSQL database remains intentionally small and focused on the application's actual functionality.

### `sets`

```text
id
name
series
total_cards
release_date
logo_url
```

### `cards`

```text
id
name
type
image_url
set_id
card_number
```

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

### `binder_cards`

```text
id
card_id
anon_id
position
created_at
```

Stores the cards currently placed in a visitor's binder and their positions, scoped by `anon_id`. `position` is a linear index; row/column are derived on the frontend from the current grid size.

### `user_preferences`

```text
id
anon_id      (unique)
background
binder_color
accent_color
theme
grid_size    ('2x2' | '3x3' | '4x4')
```

One row per anonymous visitor, stores the visitor's binder appearance and chosen grid size.

---

## 13. User Authentication

**Authentication will not be implemented.** PokeFolio uses browser-scoped anonymous identity (Section 10) instead of accounts for the entire MVP and foreseeable scope. This avoids login, password handling, and session management entirely, while still giving each visitor a persistent, personal binder.

---

## 14. External API / Card Data

PokeFolio uses the **Pokémon TCG API** as its external source for card and set metadata.

Relevant data may include:

* Card ID
* Card name
* Set
* Card number
* Type
* Rarity
* Artist
* Card image URLs

The API is used primarily during the **card catalog import process**. PokeFolio does not query the external API every time a user browses the application.

```text
Pokémon TCG API
       ↓
   Import Script
       ↓
   PostgreSQL
       ↓
   Express API
       ↓
 React + Vite
       ↓
   PokeFolio
```

---

## 15. API Attribution

The project will:

* Keep the API key private
* Store credentials in environment variables
* Follow the Pokémon TCG API Terms of Service
* Credit the Pokémon TCG API in the README
* Provide appropriate attribution within the application
* Include a link to the PokeFolio repository when required for API usage communication

---

## 16. Planned Express API

### Sets

```text
GET /api/sets
```

### Cards

```text
GET /api/cards
GET /api/cards/:id
```

`GET /api/cards` may support query parameters such as `?set=...` and `?search=...`.

### Binder (scoped by `X-Anon-Id` header)

```text
GET    /api/binder
POST   /api/binder
PUT    /api/binder/:id
DELETE /api/binder/:id
```

### Preferences (scoped by `X-Anon-Id` header)

```text
GET /api/preferences
PUT /api/preferences
```

The final endpoint structure may be adjusted during development.

---

## 17. Development Plan

### Phase 1 — Planning & Design (complete)

* Define PokeFolio concept
* Reduce scope from 10 sets to 5 sets
* Define the project's core purpose
* Establish the digital binder concept
* Define the MVP
* Define the four primary screens
* Decide to merge customization into the Binder experience
* Decide on anonymous-ID persistence instead of authentication
* Decide on selectable grid size (2×2–4×4) with linear position indexing
* Identify the Pokémon TCG API as the external data source
* Plan API attribution
* Define initial database structure
* Define initial Express API
* Define development order

---

### Phase 2 — Project Setup & Foundation

**Project setup**

* Create GitHub repository
* Initialize React + Vite
* Initialize Express backend
* Configure PostgreSQL
* Configure environment variables
* Configure `.gitignore`
* Establish frontend/backend folder structure
* Establish Git workflow
* Implement anonymous-ID generation and `X-Anon-Id` request header on the frontend
* Implement Express middleware to read/validate `X-Anon-Id`

**Database**

* Create PostgreSQL database
* Create `sets` table
* Create `cards` table
* Create `binder_cards` table (with `anon_id`)
* Create `user_preferences` table (with `anon_id`, `grid_size`)
* Establish database relationships
* Test Express ↔ PostgreSQL connection

**API data pipeline**

* Confirm exact API IDs for the five sets
* Create import/seed script
* Import one set first
* Verify imported card data
* Verify image URLs
* Expand import to the remaining four sets

First technical milestone:

```text
Pokémon TCG API
      ↓
PostgreSQL
      ↓
Express
      ↓
Browser
```

---

### Phase 3 — Explore / Home

* Create Explore route
* Create PokeFolio header
* Display five set cards
* Display set names
* Display set images/logos
* Add set-selection interaction
* Start with placeholder data, then connect to real PostgreSQL data

Goal:

```text
Open PokeFolio
      ↓
See five sets
      ↓
Click a set
```

---

### Phase 4 — Set Card Browser

Build `/explore/:setId`:

* Display selected set information
* Load cards belonging to the selected set
* Display card grid
* Display card images
* Implement generalized card search
* Handle no search results
* Add loading states
* Add error states
* Implement return-to-sets navigation

Must work for **all five sets using the same component**.

---

### Phase 5 — Card Details

Build `/card/:cardId`:

* Load individual card
* Display card image, name, set, card number, type
* Display other minimal identifying information
* Add "Add to Binder" action
* Handle card loading/error states

First complete user flow:

```text
Explore → Select Set → Browse Cards → Select Card → Add to Binder
```

---

### Phase 6 — Binder

Build `/binder` — start with the simplest working implementation:

* Display binder layout at a default grid size
* Load saved binder cards (scoped by `anon_id`)
* Display cards in binder slots
* Remove cards
* Store card positions (linear index)
* Update card positions
* Persist binder state
* Handle empty binder state

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

Advanced interactions such as drag-and-drop and grid resizing are implemented only after basic persistence works.

---

### Phase 7 — Binder Organization

* Implement card repositioning
* Implement slot organization based on the linear position index
* Add drag-and-drop only if it remains practical
* Persist updated positions

---

### Phase 8 — Binder Customization

* Grid size selector (2×2, 3×3, 4×4)
* Overflow handling when shrinking grid size (hide, don't delete)
* Background customization
* Binder color
* Accent color
* Theme presets
* Save customization settings (scoped by `anon_id`)
* Load customization settings from PostgreSQL

Final implementation may use a modal, drawer, side panel, or inline controls, depending on final UI design.

---

### Phase 9 — Polish & Deployment

**UI/UX**

* Responsive layout
* Consistent spacing
* Typography
* Visual hierarchy
* Card hover states
* Navigation improvements
* Animations where appropriate

**Application states**

* Loading states
* Empty states
* API errors
* Database errors
* Search with no results
* Missing card handling
* Missing/invalid `anon_id` handling

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
Change Grid Size
      ↓
Customize Binder
      ↓
Refresh
      ↓
Verify Persistence (same browser, no login)
```

**Deployment**

* Deploy frontend
* Deploy Express backend
* Configure production environment variables
* Configure production PostgreSQL
* Test deployed application
* Complete README
* Add API attribution
* Clean GitHub repository
* Remove development leftovers

---

## 18. Development Order at a Glance

```text
PHASE 2
Foundation
   ↓
React + Vite
Express
PostgreSQL
Database
Anonymous-ID plumbing
API import
   ↓

PHASE 3
Explore / Home
   ↓

PHASE 4
Set Card Browser
   ↓

PHASE 5
Card Details
   ↓

PHASE 6
Binder
   ↓

PHASE 7
Binder Organization
   ↓

PHASE 8
Binder Customization (grid size + appearance)
   ↓

PHASE 9
Polish + Deployment
```

---

## 19. Open Questions

* Should drag-and-drop reordering be added, or simpler move controls?
* Should overflowed (hidden) cards be visually indicated in the UI when the grid is shrunk?
* Should localStorage anon IDs have a fallback (e.g. cookie) for browser settings that clear storage aggressively?
* Should multiple binder pages be supported in the future?
* Which customization presets ship by default vs. fully custom colors?
* Which exact card fields should appear on Card Details?
* Should the Binder eventually support multiple collections?

These should remain secondary until the core MVP is functional.

---

## 20. Features Explicitly Outside the MVP

* Card price tracking
* Market values
* Trading
* Buying/selling
* Deck building
* Competitive gameplay
* Complete Pokémon TCG mechanics
* Every Pokémon TCG set
* Social profiles
* Friend systems
* Trading between users
* Marketplace functionality
* Advanced collection statistics
* User accounts / login
* Cross-device sync
* Multiple saved themes, unless time permits

---

## 21. Final MVP Statement

> **PokeFolio lets users explore five curated English Pokémon TCG sets, browse and search their cards, view individual card details, add selected cards to a personal digital binder, choose a binder grid size and organize those cards visually, and customize the binder's appearance — all persisted per-browser with no login required.**

The final application uses **four primary screens/routes**:

```text
1. Explore / Set Selection
2. Set Card Browser
3. Card Details
4. Digital Binder + Customization
```

This keeps the application within the professor's **3–5 screen requirement** while ensuring every screen has a clear purpose.
