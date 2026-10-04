# AI usage in PokeFolio

This project was built with AI assistance. This file is the record of it. It documents where AI was used, where the AI-assisted implementation had to be corrected, and which parts of the project I can identify and explain as my own work.

## 1. How I used AI

### 2026-08-15 - Backend, PostgreSQL & Pokémon TCG API foundation

- **Tool:** OpenAI Codex
- **What I asked for:** Help restructuring the backend around Node.js/Express/PostgreSQL and implementing the database foundation, migrations, database checks, and Pokémon TCG API import workflow.
- **What it gave back:** A first-pass backend structure containing `server.js`, PostgreSQL connection pooling, an initial schema migration, a database verification script, and a card import script for the Pokémon TCG API.
- **What I kept, what I changed, and why:** I kept the overall separation between the Express server, database connection, migration workflow, and import script. I reviewed the SQL schema, environment-variable handling, API-key handling, and import behavior against the actual project requirements before continuing with the backend.
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/f443155245b7fd1ab59a48c693a830f36df90226](https://github.com/lanixiligan/pokefolio/commit/f443155245b7fd1ab59a48c693a830f36df90226)

### 2026-08-16 - Anonymous binder REST API

- **Tool:** OpenAI Codex
- **What I asked for:** Help implement the Express REST API for the card catalog and anonymous binder, including anonymous visitor identification, PostgreSQL queries, binder initialization, and error handling.
- **What it gave back:** A large first-pass Express API with `X-Anon-Id` validation, catalog endpoints, binder initialization, binder retrieval, and binder card operations backed by PostgreSQL transactions.
- **What I kept, what I changed, and why:** I kept the REST structure and SQL-backed persistence model, then tested and iterated on validation, transaction handling, deployment behavior, card placement rules, spread management, and later binder reflow behavior.
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/9ff91c0c444deed2f913311cbe0f46c3fb346df4](https://github.com/lanixiligan/pokefolio/commit/9ff91c0c444deed2f913311cbe0f46c3fb346df4)

### 2026-08-17 - Set Browser and card search

- **Tool:** Claude
- **What I asked for:** A React set-browser page that loads set information, displays cards, supports searching, and handles loading/error states.
- **What it gave back:** A `SetBrowser` page, `CardTile` component, API helpers for loading sets/cards, and the initial responsive card grid.
- **What I kept, what I changed, and why:** I kept the component-based structure and reused the existing API layer. I continued iterating on search behavior, routing, responsive layout, and later finalized the Set Browser with debounced search and a more complete layout.
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/7afef5e96ff0d9eb555420ed685370de5862c0d4](https://github.com/lanixiligan/pokefolio/commit/7afef5e96ff0d9eb555420ed685370de5862c0d4)

### 2026-08-18 - Binder movement and spread management

- **Tool:** Claude
- **What I asked for:** Assistance implementing binder card movement, spread navigation, drag-and-drop placement, and binder spread management.
- **What it gave back:** A first-pass binder interaction model that included card movement, selection state, spread controls, and drag-and-drop behavior.
- **What I kept, what I changed, and why:** I kept the core interaction model but refined how cards move between pages and spreads, added clearer validation and persistence behavior, and later corrected the add-card flow when the next available slot crossed a spread boundary.
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/373553d15daf90c6e4dc325ac88d519d5c8e102b](https://github.com/lanixiligan/pokefolio/commit/373553d15daf90c6e4dc325ac88d519d5c8e102b)

### 2026-08-18 - Binder customization and grid reflow

- **Tool:** OpenAI Codex / Claude
- **What I asked for:** Help implement binder customization for background, binder color, accent color, theme, and grid size, while keeping existing cards safe when the grid changes.
- **What it gave back:** A customization panel plus backend preference handling and a `reflowBinderGrid()` implementation for rearranging existing cards when changing between 2×2, 3×3, and 4×4 layouts.
- **What I kept, what I changed, and why:** I kept the transactional approach and the rule that existing cards must not be deleted when the grid changes. I reviewed the ordering logic, spread creation/deletion order, deferred constraints, and preference update flow because these operations can otherwise destroy or duplicate binder cards.
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/944df5c5167bcc7454b2d36565ae2126ef2d63c2](https://github.com/lanixiligan/pokefolio/commit/944df5c5167bcc7454b2d36565ae2126ef2d63c2)

### 2026-08-26 - Add Card picker and binder personalization polish

- **Tool:** Claude
- **What I asked for:** Help build the Add Card picker, filtering, next-slot selection, responsive positioning, color customization, and mobile binder controls.
- **What it gave back:** A first-pass Add Card picker with set filtering, card search, next-slot calculation, spread creation prompts, and desktop/mobile positioning logic.
- **What I kept, what I changed, and why:** I kept the reusable picker and next-slot approach, but changed the positioning model from being constrained to the binder canvas to a viewport-aware fixed panel and continued refining the cross-spread behavior and mobile layout.
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/b831a672a1a2bb5883694eb656dadaf4c5257289](https://github.com/lanixiligan/pokefolio/commit/b831a672a1a2bb5883694eb656dadaf4c5257289)

### 2026-08-31 - Final Set Browser search and responsive layout

- **Tool:** Claude
- **What I asked for:** Finalize the Explore and Set Browser experience with responsive grids, search behavior, and scroll restoration.
- **What it gave back:** A responsive Set Browser implementation with debounced search, updated card/set presentation, and navigation behavior.
- **What I kept, what I changed, and why:** I kept the debounced-search concept and component structure, then adjusted the layout and visual hierarchy to match the rest of PokeFolio and the intended collector-focused experience.
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/98ebe68a4a93e4eec587c86107be4a5024e8b229](https://github.com/lanixiligan/pokefolio/commit/98ebe68a4a93e4eec587c86107be4a5024e8b229)

### 2026-09-25 - Final cleanup, Crown Zenith, and validation

- **Tool:** ChatGPT / AI-assisted development tools
- **What I asked for:** Help review the final application for cleanup, responsive behavior, documentation, lint/build issues, and the final supported-set scope.
- **What it gave back:** Suggestions and implementation assistance for UI cleanup, documentation updates, responsive sizing, and final integration work.
- **What I kept, what I changed, and why:** I kept the parts that matched the actual application, ran the client lint/build, fixed reported issues, added Crown Zenith (`swsh12pt5`), and re-imported the expanded catalog into PostgreSQL.
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/29c28e7dc8430b7869444c3c8ec297f3e1428c47](https://github.com/lanixiligan/pokefolio/commit/29c28e7dc8430b7869444c3c8ec297f3e1428c47)

## 2. Where the AI got it wrong

### Case 1 - Backend server binding worked locally but failed as a deployable server

- **What it gave me:** The initial Express server used `app.listen(PORT, ...)`, which was sufficient for local development.
- **What was wrong with it:** The deployed environment needed the server to listen on all interfaces rather than only the local loopback interface. The local implementation therefore was not sufficient for the deployed backend.
- **What I did instead:** I changed the server startup to `app.listen(PORT, "0.0.0.0", ...)` and simplified the startup message so it no longer advertised a localhost-only URL.
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/2388c1fb5146637e02017f3faf82dbc6d50d152d](https://github.com/lanixiligan/pokefolio/commit/2388c1fb5146637e02017f3faf82dbc6d50d152d)

### Case 2 - Add Card auto-advance did not correctly handle the next spread

- **What it gave me:** The first Add Card implementation included `getNextAvailableSlot()` and automatically continued adding cards after a successful add.
- **What was wrong with it:** The first implementation did not correctly handle the UI state transition when the calculated next slot moved to another spread. The binder could remain on the wrong spread even though the next slot belonged to a different one.
- **What I did instead:** I corrected the `onAddSuccess` flow so that when the next slot belongs to another spread, the Binder changes its current spread index before continuing the add sequence.
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/9981bdf8e264583bef33252c7d0d401969facc8a](https://github.com/lanixiligan/pokefolio/commit/9981bdf8e264583bef33252c7d0d401969facc8a)

### Case 3 - Initial Add Card / Customize panel positioning was too dependent on the binder canvas

- **What it gave me:** The first layout positioned the Add Card and Customize panels with `position: absolute` inside the binder canvas.
- **What was wrong with it:** That approach tied the panel's size and placement to the binder container and became unreliable when the available viewport space changed, particularly across desktop/tablet layouts.
- **What I did instead:** I changed the panels to use viewport-aware fixed positioning, measured the binder folio with `getBoundingClientRect()`, and added resize handling so the panel can switch between desktop and centered tablet/mobile layouts.
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/b831a672a1a2bb5883694eb656dadaf4c5257289](https://github.com/lanixiligan/pokefolio/commit/b831a672a1a2bb5883694eb656dadaf4c5257289)

## 3. Who wrote what

### Written / directly owned by me (Lanix)

- **File:** `server/server.js`
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/2388c1fb5146637e02017f3faf82dbc6d50d152d](https://github.com/lanixiligan/pokefolio/commit/2388c1fb5146637e02017f3faf82dbc6d50d152d)
- **What it does and why it is built this way:** I changed the Express server startup to bind to `0.0.0.0` so the backend can accept traffic from the deployment environment rather than only from localhost.

- **File:** `server/server.js` — `reflowBinderGrid()`
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/944df5c5167bcc7454b2d36565ae2126ef2d63c2](https://github.com/lanixiligan/pokefolio/commit/944df5c5167bcc7454b2d36565ae2126ef2d63c2)
- **What it does and why it is built this way:** This logic preserves existing binder cards while changing the grid size. It reads the current cards in deterministic order, calculates how many spreads are required, creates additional spreads before moving cards, defers unique-position constraints during the reflow, updates the existing card rows, deletes only excess empty spreads, and finally renumbers the spreads. The important design decision is that cards are moved with `UPDATE` instead of being deleted and reinserted.

- **File:** `server/server.js` — binder transaction and validation improvements
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/9ff91c0c444deed2f913311cbe0f46c3fb346df4](https://github.com/lanixiligan/pokefolio/commit/9ff91c0c444deed2f913311cbe0f46c3fb346df4)
- **What it does and why it is built this way:** The backend validates an anonymous visitor ID, scopes database queries to that visitor, uses PostgreSQL transactions for binder mutations, and rejects invalid card placements before changing data. I can explain how the request enters Express, how the ID becomes `req.anonId`, how the SQL parameters are passed to PostgreSQL, and how commit/rollback protects the binder state.

### AI-assisted code I understand best

- **File:** `server/scripts/import-cards.js`
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/f443155245b7fd1ab59a48c693a830f36df90226](https://github.com/lanixiligan/pokefolio/commit/f443155245b7fd1ab59a48c693a830f36df90226)
- **What it does and why we kept it:** The importer retrieves supported sets and all cards from the Pokémon TCG API, retries temporary API failures, validates the returned data, stores the catalog in PostgreSQL inside a transaction, and verifies that the committed card count matches the API total before committing the set. The catalog is imported into PostgreSQL so the normal application does not need to query the external API for every card view.

- **File:** `server/db/migrations/001_initial_schema.sql`
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/f443155245b7fd1ab59a48c693a830f36df90226](https://github.com/lanixiligan/pokefolio/commit/f443155245b7fd1ab59a48c693a830f36df90226)
- **What it does and why we kept it:** The schema separates the external card catalog (`sets`, `cards`) from visitor-specific binder state (`user_preferences`, `binder_spreads`, `binder_pages`, `binder_cards`). Foreign keys and unique constraints enforce relationships and prevent duplicate cards or duplicate positions inside the same visitor's binder.

- **File:** `client/src/lib/api.js`
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/98ebe68a4a93e4eec587c86107be4a5024e8b229](https://github.com/lanixiligan/pokefolio/commit/98ebe68a4a93e4eec587c86107be4a5024e8b229)
- **What it does and why we kept it:** The frontend uses one API helper so requests consistently include the anonymous ID, parse API errors, handle `204` responses, and expose small functions such as `getCards()`, `getBinder()`, `addCardToBinder()`, and `updatePreferences()` to the React pages.

## AI tools used

The following tools were used during development:

- **ChatGPT** – programming assistance, debugging, technical explanations, documentation, project planning, and evaluating implementation approaches.
- **OpenAI Codex** – extensive backend and server-side implementation assistance.
- **Claude** – frontend development assistance, code review, UI/UX feedback, and refactoring.
- **Google AI Studio** – exploration of AI-assisted development ideas and implementation approaches.
- **Base44** – application concepts and prototyping.
- **Antigravity** – AI-assisted implementation, debugging, and iterative development.

## Final validation

AI-generated or AI-assisted code was not treated as automatically correct. I tested the application, inspected database behavior, verified the API/data pipeline, ran the client lint/build, and made changes when the generated implementation did not match the actual behavior or deployment requirements.

The final functionality and technical decisions in PokeFolio remain my responsibility.
