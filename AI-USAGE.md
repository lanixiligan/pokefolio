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

### 2026-10-10 - Reviewing my professor's feedback

- **Tool:** Claude Code
- **What I asked for:** A review of the code against my professor's feedback (m5a2–m5a4, m8a1–m8a6), turned into a prioritized list of fixes I could work through before the demo.
- **What it gave back:** `docs/UPDATE-PLAN.md`: each item checked against the code at `6f64651`, with the bugs it could reproduce marked as reproduced (for example the `/api/cards` sort and the HTML error pages). Its step-by-step instructions became `docs/IMPLEMENTATION-CHECKLIST.md`.
- **What I kept, what I changed, and why:** I used the plan as my working list for the next day, and chose which items to do before the demo and which to leave optional (Batches 6–8 of the checklist).
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/b6e77ff77f6442f4531f1f47b77330dbf1c20782](https://github.com/lanixiligan/pokefolio/commit/b6e77ff77f6442f4531f1f47b77330dbf1c20782)

### 2026-10-11 - README setup steps

- **Tool:** Claude Code
- **What I asked for:** Fix the README points my professor raised twice: name the Node.js and PostgreSQL versions, add the missing step of creating the database, and fix the AI-USAGE badge link and the API-key prerequisite.
- **What it gave back:** The README edits, and a test of the new database steps on a throwaway database.
- **What I kept, what I changed, and why:** It recommended naming the version I actually tested with (Node.js 22.13 or newer, tested with 22.23.1) instead of the plan's Node 24, and leaving out the `engines` field so Render and Vercel wouldn't switch the deployed Node version before the demo. I agreed, and checked the new links on GitHub myself after pushing.
- **Commits:**
  - [https://github.com/lanixiligan/pokefolio/commit/096a9515ef4121fbe49214b7c70ab0086161a39c](https://github.com/lanixiligan/pokefolio/commit/096a9515ef4121fbe49214b7c70ab0086161a39c)
  - [https://github.com/lanixiligan/pokefolio/commit/e0aa7ca50d1114fc70cd78742d3783940d907cb5](https://github.com/lanixiligan/pokefolio/commit/e0aa7ca50d1114fc70cd78742d3783940d907cb5)
  - [https://github.com/lanixiligan/pokefolio/commit/7087c1cc1d224d3c1bafdf10dfad8cc1f238f4a0](https://github.com/lanixiligan/pokefolio/commit/7087c1cc1d224d3c1bafdf10dfad8cc1f238f4a0)

### 2026-10-11 - Binder link and Add Card placement

- **Tool:** Claude Code
- **What I asked for:** Fix the `/binder?spreadId=` link, which never opened the requested spread. While testing it, I also asked for cards added with Add Card to stay on the spread I was viewing, because some landed on a different spread.
- **What it gave back:** A string comparison for the spread id (PostgreSQL `BIGINT` ids arrive in JavaScript as strings), a guard so the link is applied once per URL, and a rewritten `getNextAvailableSlot()` with eight test scenarios.
- **What I kept, what I changed, and why:** I chose to fix the link rather than delete it, and chose the rule for a full spread: fill the spread being viewed first, then move forward, and never wrap back to spread 1. I ran the browser checks for both fixes myself.
- **Commits:**
  - [https://github.com/lanixiligan/pokefolio/commit/4db153a3f28a697319b03c228f0c1839ded8d62e](https://github.com/lanixiligan/pokefolio/commit/4db153a3f28a697319b03c228f0c1839ded8d62e)
  - [https://github.com/lanixiligan/pokefolio/commit/6683cd5e188382a0ff926742021df3adc0b86e3a](https://github.com/lanixiligan/pokefolio/commit/6683cd5e188382a0ff926742021df3adc0b86e3a)

### 2026-10-11 - Server fixes, dependencies, and deployment

- **Tool:** Claude Code
- **What I asked for:** The server fixes from the plan, clearing the `npm audit` advisories, and stopping the deployed app needing several refreshes on its first load.
- **What it gave back:** A reproduction of each bug before fixing it (a test card numbered `TG01`, HTML error pages with a stack trace, the server crashing when the database drops an idle connection), the fixes, and automated checks it ran against my local database.
- **What I kept, what I changed, and why:** It changed three things from the plan and explained why, and I agreed: no 30-second idle timeout (pg already closes idle connections after 10 seconds), retries for about 60 seconds (Render says waking a free service takes about a minute), and a database-free `/api/ping` route for an uptime monitor, because pinging `/api/health` would use most of Neon's free compute. I ran the browser tests myself, asked for related fixes to be combined into single commits, merged them through pull request #2, and checked the live app afterwards.
- **Commits:**
  - [https://github.com/lanixiligan/pokefolio/commit/9847a540c97a40614ee14f8d8056015c61896731](https://github.com/lanixiligan/pokefolio/commit/9847a540c97a40614ee14f8d8056015c61896731)
  - [https://github.com/lanixiligan/pokefolio/commit/78eb7348214cdc211d0d743f1030c7bbb14b14bc](https://github.com/lanixiligan/pokefolio/commit/78eb7348214cdc211d0d743f1030c7bbb14b14bc)
  - [https://github.com/lanixiligan/pokefolio/commit/dbe7e9b620b3bb97e6e716954f9be83a64c16e3d](https://github.com/lanixiligan/pokefolio/commit/dbe7e9b620b3bb97e6e716954f9be83a64c16e3d)
  - Pull request: [https://github.com/lanixiligan/pokefolio/pull/2](https://github.com/lanixiligan/pokefolio/pull/2)

### 2026-10-11 - Report, security checklist, and verification

- **Tool:** Claude Code
- **What I asked for:** Bring `REPORT.md` up to date with commit links, re-run the checks after the catalog import, and correct `docs/SECURITY-CHECKLIST.md` so it matches the code.
- **What it gave back:** The reordered report with a new entry and 54 commit links, each checked against its week's dates; a re-run of the catalog import (the Pokémon TCG API returned intermittent 500/502 errors, and the catalog was unchanged); and a row-by-row check of the security checklist against the code, the Git history and the GitHub settings.
- **What I kept, what I changed, and why:** I decided to keep my email address in the existing Git history for now rather than rewrite every commit (security checklist item 27), and asked for Batches 6–8 to be marked optional in the checklist.
- **Commits:**
  - [https://github.com/lanixiligan/pokefolio/commit/8fc3cc7895a77f86304be28ee1ceb826598a1d3e](https://github.com/lanixiligan/pokefolio/commit/8fc3cc7895a77f86304be28ee1ceb826598a1d3e)
  - [https://github.com/lanixiligan/pokefolio/commit/602dddfac978486c1631f0d1877084115d904dfd](https://github.com/lanixiligan/pokefolio/commit/602dddfac978486c1631f0d1877084115d904dfd)
  - [https://github.com/lanixiligan/pokefolio/commit/ecde227bb57612d6ac0b0e8122088b97012e188b](https://github.com/lanixiligan/pokefolio/commit/ecde227bb57612d6ac0b0e8122088b97012e188b)

## 2. Where the AI got it wrong

### Case 1 - Backend server binding worked locally but failed as a deployable server

- **What it gave me:** The initial Express server used `app.listen(PORT, ...)`, which was sufficient for local development.
- **What was wrong with it:** The deployed environment needed the server to listen on all interfaces rather than only the local loopback interface. The local implementation therefore was not sufficient for the deployed backend.
- **What I did instead:** I changed the server startup to `app.listen(PORT, "0.0.0.0", ...)` and simplified the startup message so it no longer advertised a localhost-only URL.
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/2388c1fb5146637e02017f3faf82dbc6d50d152d](https://github.com/lanixiligan/pokefolio/commit/2388c1fb5146637e02017f3faf82dbc6d50d152d)

### Case 2 - Add Card auto-advance did not correctly handle the next spread

- **What it gave me:** The first Add Card implementation included `getNextAvailableSlot()` and automatically continued adding cards after a successful add.
- **What was wrong with it:** The first implementation did not correctly handle the UI state transition when the calculated next slot moved to another spread. After the Binder switched to tracking the open spread by its id, the auto-advance code still called `setCurrentSpreadIndex`, a function that no longer existed. When a card filled the last slot of a spread, the card was saved, but the Add Card panel showed the error "setCurrentSpreadIndex is not defined" and the binder stayed on the full spread.
- **What I did instead:** I corrected the `onAddSuccess` flow so that when the next slot belongs to another spread, the Binder selects that spread by its id (`setSelectedSpreadId`) before continuing the add sequence. The same flow had two more problems later (see Case 5).
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/9981bdf8e264583bef33252c7d0d401969facc8a](https://github.com/lanixiligan/pokefolio/commit/9981bdf8e264583bef33252c7d0d401969facc8a)

### Case 3 - Initial Add Card / Customize panel positioning was too dependent on the binder canvas

- **What it gave me:** The first layout positioned the Add Card and Customize panels with `position: absolute` inside the binder canvas.
- **What was wrong with it:** That approach tied the panel's size and placement to the binder container and became unreliable when the available viewport space changed, particularly across desktop/tablet layouts.
- **What I did instead:** I changed the panels to use viewport-aware fixed positioning, measured the binder folio with `getBoundingClientRect()`, and added resize handling so the panel can switch between desktop and centered tablet/mobile layouts.
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/b831a672a1a2bb5883694eb656dadaf4c5257289](https://github.com/lanixiligan/pokefolio/commit/b831a672a1a2bb5883694eb656dadaf4c5257289)

### Case 4 - The binder link fix made every binder refresh jump back (Claude Code)

- **What it gave me:** A fix for the `/binder?spreadId=` link that compared spread ids as strings.
- **What was wrong with it:** Once the comparison matched, the code ran again on every binder refresh. Adding or moving a card on another spread, or adding a new spread, jumped the view back to the linked spread. Claude Code found this when I asked about the link while testing it in the browser, before the change was committed.
- **What I did instead:** The link is now applied only once per URL. I re-tested opening a linked spread, adding cards on a different spread, adding a spread, and an unknown id.
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/4db153a3f28a697319b03c228f0c1839ded8d62e](https://github.com/lanixiligan/pokefolio/commit/4db153a3f28a697319b03c228f0c1839ded8d62e)

### Case 5 - Add Card could still place cards on the wrong spread

- **What it gave me:** The AI-generated `getNextAvailableSlot()` from the Add Card picker (see Case 2), which picks the slot for the next card.
- **What was wrong with it:** The target slot was worked out once, when the picker opened, so using the ← / → buttons afterwards didn't move it, and the card went to the old spread. And when the spread was full, the search continued past the last spread and wrapped back to spread 1.
- **What I did instead:** With Claude Code, the search now fills the spread being viewed first, then moves forward only, and otherwise offers a new spread; the arrows move the picker's target. I chose that rule, and tested the cases in the browser.
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/6683cd5e188382a0ff926742021df3adc0b86e3a](https://github.com/lanixiligan/pokefolio/commit/6683cd5e188382a0ff926742021df3adc0b86e3a)

### Case 6 - Replacing nodemon with `node --watch` had a side effect (Claude Code)

- **What it gave me:** To clear the `npm audit` advisories that came through nodemon, `npm run dev` now uses Node's built-in `--watch` mode.
- **What was wrong with it:** `node --watch` stops watching a file once Git replaces it, which is what `git checkout` and `git pull` do. After a branch switch, my dev server kept serving the old code. While looking into it, Claude Code first ran its tests in the wrong folder: they left two stray files in the repository root and three test servers running, and led to a wrong conclusion. It found the mistake, removed the files and stopped the servers before anything was committed, and re-ran the test properly.
- **What I did instead:** For now, I restart `npm run dev` after switching branches or pulling. Watching the folder (`node --watch-path=.`) survived repeated replacements in a test, so it is a possible fix later.
- **Commit:** [https://github.com/lanixiligan/pokefolio/commit/78eb7348214cdc211d0d743f1030c7bbb14b14bc](https://github.com/lanixiligan/pokefolio/commit/78eb7348214cdc211d0d743f1030c7bbb14b14bc)

### Case 7 - The generated security checklist claimed fixes that were never made

- **What it gave me:** The first version of `docs/SECURITY-CHECKLIST.md`, filled in with AI help during the September cleanup.
- **What was wrong with it:** It ended with generated text saying CORS had been fixed and an access layer added, and neither was true. Item 30 still named `hero.png` after that file was deleted, and item 25 was marked (no stack traces in error responses) as Yes while malformed JSON still returned a stack trace.
- **What I did instead:** I re-checked every row against the code, the Git history and the GitHub settings, and replaced that text with only the changes that were actually made.
- **Commits:** added in [https://github.com/lanixiligan/pokefolio/commit/29c28e7dc8430b7869444c3c8ec297f3e1428c47](https://github.com/lanixiligan/pokefolio/commit/29c28e7dc8430b7869444c3c8ec297f3e1428c47), corrected in [https://github.com/lanixiligan/pokefolio/commit/8fc3cc7895a77f86304be28ee1ceb826598a1d3e](https://github.com/lanixiligan/pokefolio/commit/8fc3cc7895a77f86304be28ee1ceb826598a1d3e)

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
- **Claude Code** – I invested in Claude Code for my projects. Since October 10, 2026, I have used it as a coding agent working directly in the repository: reviewing the code against my professor's feedback, writing the update plan, fixing bugs, running checks against my local database, and committing only after I approved each change. Every commit made with it ends with a `Co-Authored-By: Claude` line.
- **Google AI Studio** – exploration of AI-assisted development ideas and implementation approaches.
- **Base44** – application concepts and prototyping.
- **Antigravity** – AI-assisted implementation, debugging, and iterative development.

## Final validation

AI-generated or AI-assisted code was not treated as automatically correct. I tested the application, inspected database behavior, verified the API/data pipeline, ran the client lint/build, and made changes when the generated implementation did not match the actual behavior or deployment requirements.

The latest changes, from October 10–11, 2026, were made with Claude Code. Claude Code reproduced each bug before fixing it and ran the automated checks: requests against a local copy of the API, test data it added and then removed, and `npm run lint` and `npm run build`. I chose which items to do and how (for example, fixing the binder link instead of deleting it, and how Add Card handles a full spread), ran the browser checks myself, approved each commit before it was made, and checked the deployed app after merging.

The final functionality and technical decisions in PokeFolio remain my responsibility.
