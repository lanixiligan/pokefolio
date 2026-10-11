# Weekly Increment Report

## Week of: September 28 – October 11, 2026

Since my last report (September 21–27), I wrote up how I used AI on the project, reviewed my professor's feedback, and fixed what it raised: the README setup steps, several bugs, the `npm audit` advisories, and the deployed app's unreliable first load. The code fixes were merged into `main` through [pull request #2](https://github.com/lanixiligan/pokefolio/pull/2) on October 11, and I corrected my security checklist to match the code.

### My goal this week

My goal was to act on my professor's feedback before the final demo: make the README work for someone setting the project up from nothing, fix the problems found in a review of the code, make the deployed app load reliably, and bring this report up to date with commit links.

### What I did

* Moved `AI-USAGE.md` to the repository root and expanded it into a full record of how AI was used ([c1e1178](https://github.com/lanixiligan/pokefolio/commit/c1e1178), October 4).

* Added a note on AI-assisted development to the README ([6f64651](https://github.com/lanixiligan/pokefolio/commit/6f64651), October 5).

* Turned my professor's feedback and a review of the code into a prioritized plan, `docs/UPDATE-PLAN.md` ([b6e77ff](https://github.com/lanixiligan/pokefolio/commit/b6e77ff), October 10), and a step-by-step checklist, `docs/IMPLEMENTATION-CHECKLIST.md` ([4499a82](https://github.com/lanixiligan/pokefolio/commit/4499a82)).

* README setup:
  * Named the tested versions: Node.js 22.13 or newer, and PostgreSQL 18 ([096a951](https://github.com/lanixiligan/pokefolio/commit/096a951)).
  * Added the missing step of creating the database before `npm run migrate` ([e0aa7ca](https://github.com/lanixiligan/pokefolio/commit/e0aa7ca)).
  * Fixed the AI-USAGE badge link, and explained that an API key is only needed for `npm run seed`, since new registrations are closed ([7087c1c](https://github.com/lanixiligan/pokefolio/commit/7087c1c)).

* Binder:
  * Fixed the `/binder?spreadId=` link, which never opened the requested spread because spread ids arrive from PostgreSQL as strings ([4db153a](https://github.com/lanixiligan/pokefolio/commit/4db153a)).
  * Fixed Add Card placing cards on a different spread from the one being viewed ([6683cd5](https://github.com/lanixiligan/pokefolio/commit/6683cd5)).
  * The Add Card set filters now show each set's symbol ([78eb734](https://github.com/lanixiligan/pokefolio/commit/78eb734)).

* Server: removed a leftover instruction comment, fixed a sort that crashed `/api/cards`, made unknown routes and errors return JSON instead of HTML, and checked card removal with `rowCount` ([9847a54](https://github.com/lanixiligan/pokefolio/commit/9847a54)).

* Dependencies: cleared every `npm audit` advisory, replacing nodemon with Node's built-in `--watch` mode ([78eb734](https://github.com/lanixiligan/pokefolio/commit/78eb734)).

* Deployment: stopped the server crashing when the database drops an idle connection, made the app retry and show "Waking up the server…" while the server starts, added a `/api/ping` route for an uptime monitor, and lazy-loaded card images in the Set Browser ([dbe7e9b](https://github.com/lanixiligan/pokefolio/commit/dbe7e9b)).

* Merged all of the above into `main` through [pull request #2](https://github.com/lanixiligan/pokefolio/pull/2), which redeployed the app.

* Corrected `docs/SECURITY-CHECKLIST.md` so every answer matches the code. Error responses are now safe (item 25), request validation is only partly done (item 23), and the leftover text claiming CORS and access-control fixes that never happened is gone. I also removed two unused template icons and credited the Outfit font in the README ([8fc3cc7](https://github.com/lanixiligan/pokefolio/commit/8fc3cc7)).

### What blocked me

Two problems took the most work. Both only showed up under conditions that normal use hadn't hit yet.

**The deployed app needed several refreshes on its first load**

* **Symptom:** after the app had been idle for a while, the first visit often failed and needed several refreshes.
* **Cause:** two things together. Render's free plan stops the server after 15 idle minutes, and starting it again can take up to about a minute. Separately, the database connection pool had no error listener, so when the database dropped an idle connection, the whole server crashed and had to start again. I reproduced the crash locally by ending the server's idle database connection: the process exited with code 1.
* **Change:** the server now logs that error and keeps running, and the app retries for about a minute while telling the user the server is waking up ([dbe7e9b](https://github.com/lanixiligan/pokefolio/commit/dbe7e9b)).

**`/api/cards` crashed on a lettered card number**

* **Symptom:** `/api/cards` returned a 500 error as soon as a single card had a number like `TG01`. None of the six current sets has one; it came up in a code review, and I reproduced it with a test card.
* **Cause:** the SQL sorted cards with `number::integer`, which fails on any number that isn't only digits.
* **Change:** sort by the letter prefix, then by the number. The 977 real cards kept exactly the same order ([9847a54](https://github.com/lanixiligan/pokefolio/commit/9847a54)).

### What I checked

**The catalog re-import.** The September 21–27 entry didn't record what I checked after re-importing the catalog, so I ran the import again on October 11:

1. `npm run seed` prints one line per set. Across two runs, every set imported with `"status":"succeeded"`, `"countsMatch":true`, unique card ids and all image URLs present. In each run, one set failed because the Pokémon TCG API returned an HTTP 500 or 502 error: Crown Zenith in the first run and Team Rocket in the second. Each set is imported in its own transaction, so a failed set keeps its existing data.
2. `npm run db:check` listed all six tables, the five binder constraints, and the six sets: Base Set 102, Team Rocket 83, 151 207, Paldean Fates 245, Prismatic Evolutions 180 and Crown Zenith 160, for 977 cards in total.
3. A checksum of the `sets` and `cards` tables was identical before and after, so the September import was already up to date.
4. Crown Zenith is in the API's set list, searching it for "Pikachu" finds `swsh12pt5-160`, and that card can be added to a binder.

**The fixes.** I reproduced each bug before fixing it, then checked the fix with requests against a local copy of the API and in the browser: the main flow (Explore, Set Browser search, Add to Binder, dragging, changing the grid size, removing a card), the binder link, the Add Card cases, and stopping and restarting the server while the app was loading. `npm run lint` and `npm run build` pass, and `npm audit` reports 0 vulnerabilities in both `client/` and `server/`.

**The deployed app.** After merging, I checked the live site: `/api/ping` answers, and after 20+ idle minutes the app loaded without a refresh while Render's logs showed no crash and restart.

### What I learned

Reproducing a bug before fixing it made the fixes smaller and easier to trust. Several of this week's bugs only appeared with data or timing the app hadn't met yet, such as a lettered card number or a dropped database connection.

Free hosting plans shape the code. Render stops idle servers, and Neon limits how many hours the database can run each month, so pinging the database to keep it awake would have used most of the free allowance. That is why the uptime route doesn't touch the database.

I also learned that a value's type can change on its way through the stack: PostgreSQL's `BIGINT` ids arrive in JavaScript as strings, which is what broke the binder link.

### What is left

**Known problems**

* There are no automated tests or continuous integration yet, so testing is still manual.
* The server accepts any text as a binder colour or theme, and `null` as a card position.
* CORS allows requests from every origin (`server/server.js:12`).
* The deployed app has no access gate, because PokeFolio has no accounts (`docs/SECURITY-CHECKLIST.md`, items 18 and 21).
* On Render's free plan, the first visit after 15 idle minutes still waits up to about a minute while the server starts. An uptime monitor on `/api/ping` would avoid that, but it isn't set up yet.

**Before the demo**

* Back up the card catalog with `pg_dump`.
* If there's time: stricter validation of request bodies, then server tests and continuous integration.

**The March 1, 2027 API cutoff**

PokeFolio reads sets and cards from its own PostgreSQL database, so browsing and binders keep working after existing Pokémon TCG API keys stop on March 1, 2027. Two things still depend on the API: re-importing the catalog, which already failed intermittently during this week's re-import, and the card images, which load from `images.pokemontcg.io` and may also be affected. I'll back up the catalog before the demo. If the project continues past the cutoff, the importer would need to move to Scrydex, and the images would need a new source.

---

## Week of: September 21–27, 2026

### My goal this week

My goal this week was to return to PokeFolio after nearly a month away and prepare the project for final submission. I wanted to work through the documentation requirements from my professor, update the project documentation using the provided formats and templates, make some final frontend improvements, and clean up the repository so the project would be in a more presentable state.

### What I did

* Returned to PokeFolio after not actively working on it for almost a month.

* Revised the README to better match my professor's documentation requirements ([4ef3305](https://github.com/lanixiligan/pokefolio/commit/4ef3305)).

* Added `REPORT.md` for the required project reporting and documentation ([0790296](https://github.com/lanixiligan/pokefolio/commit/0790296)).

* Reviewed the existing documentation and reorganized it around the required templates and project deliverables, including a first `docs/AI-USAGE.md` and `docs/SECURITY-CHECKLIST.md` ([29c28e7](https://github.com/lanixiligan/pokefolio/commit/29c28e7)).

* Made several frontend changes to the Binder, Customize and Set Browser screens ([29c28e7](https://github.com/lanixiligan/pokefolio/commit/29c28e7)):
  * Customize got its own Accent colour picker.
  * The Binder toolbar's "+ Add Card" and "⚙ Customize" text buttons became icon buttons with labels and tooltips.
  * The Set Browser's card reveal animation is skipped when the operating system asks for reduced motion.
  * The Add Card slot logic moved into its own file, `getNextAvailableSlot.js`.

* Expanded the supported Pokémon TCG sets from five to six by adding Crown Zenith (`swsh12pt5`) ([29c28e7](https://github.com/lanixiligan/pokefolio/commit/29c28e7)).

* Re-imported the card catalog into the local PostgreSQL database after adding the new supported set. What I checked is recorded in the September 28 – October 11 entry, where I ran the import and its checks again.

* Updated the Pokémon TCG API documentation to reflect the current API situation and its announced March 1, 2027 cutoff for existing API keys ([29c28e7](https://github.com/lanixiligan/pokefolio/commit/29c28e7)).

* Added an MIT License to the project ([896fc01](https://github.com/lanixiligan/pokefolio/commit/896fc01)).

* Added two Quick Styles to Customize, Aurora and Crimson, made the new PokeFolio logo the favicon, and removed unused template images (`hero.png`, `react.svg`, `vite.svg`) ([2b86a85](https://github.com/lanixiligan/pokefolio/commit/2b86a85)).

* Added screenshots of the main screens to the README ([9756257](https://github.com/lanixiligan/pokefolio/commit/9756257)).

### What blocked me

The main difficulty this week was getting back into a project after being away from it for several weeks. I already understood the system I had built, but I had to spend some time reorienting myself with the codebase, documentation, and the decisions I had made earlier in development.

The documentation requirements also meant that some of the work was less about programming and more about translating the development process into a format that accurately represented the project. I had to revisit older decisions and make sure the documentation described the actual system rather than the original plan.

Adding the sixth set also required me to revisit the data side of the application. Since the project had already been considered functionally complete, expanding the dataset meant making a small change without accidentally turning it into another large development phase.

### What I learned

I learned that documentation is part of the software development process, especially when a project is being submitted or evaluated. The README and project reports should reflect what was actually built, how it evolved, and what decisions were made during development.

Returning to PokeFolio after a long break also showed me the value of having organized project documentation. Because the project already had a clear structure and development history, it was much easier to understand where I had left off and continue working without rebuilding my understanding from scratch.

I also learned that after the core functionality is complete, improvements do not necessarily have to mean adding major features. Small changes such as supporting another set, refining the UI, cleaning up documentation, improving branding, and adding a license can make the final project more complete without changing its original scope.

---

## Week of: August 31 – September 6, 2026

### My goal this week

My goal this week was to finish the remaining Phase 9 frontend work and bring PokeFolio to a stable point where the core functionality could be considered complete. After spending several weeks implementing and restructuring the application, I wanted to focus on resolving the remaining interaction problems, completing the final frontend pieces, and finalizing the project documentation.

### What I did

* Fixed the Add Card spread auto-advance behavior in the binder ([9981bdf](https://github.com/lanixiligan/pokefolio/commit/9981bdf)).

* Completed the Phase 9 Set Browser with a responsive card grid and debounced card searching ([98ebe68](https://github.com/lanixiligan/pokefolio/commit/98ebe68)).

* Added and refined the structural components and CSS for the Explore, Binder, and Set Browser pages ([bc70e37](https://github.com/lanixiligan/pokefolio/commit/bc70e37)).

* Reworked the Card Details layout: a back link to the card's set, a hero area for the card image, the set's logo and name, and a panel for the card's details ([bc70e37](https://github.com/lanixiligan/pokefolio/commit/bc70e37)).

* Restyled the set cards on the Explore page ([bc70e37](https://github.com/lanixiligan/pokefolio/commit/bc70e37)).

* Finalized the README on September 4 after the core functionality and project structure had stabilized ([43fd470](https://github.com/lanixiligan/pokefolio/commit/43fd470)).

* Consolidated the project documentation so it better represented the completed system rather than the earlier development plan.

By the end of this week, the main functionality of PokeFolio was considered finalized. At this point, the remaining work was primarily documentation, cleanup, and future refinement rather than implementing another major application feature.

### What blocked me

The main problems this week were small but important interaction issues rather than major architectural problems. The Add Card flow, for example, had a spread auto-advance issue that needed to be fixed before I could consider the binder behavior stable:

* **Symptom:** when the card I added filled the last slot of a spread, the card was saved, but the Add Card panel showed the error "setCurrentSpreadIndex is not defined" and the binder stayed on the full spread.
* **Cause:** the binder had changed to tracking the open spread by its id, but the auto-advance code still called `setCurrentSpreadIndex`, a function that no longer existed.
* **Change:** select the next spread by its id instead ([9981bdf](https://github.com/lanixiligan/pokefolio/commit/9981bdf)).

Another challenge was knowing when to stop adding features. By this point the application already had card discovery, card details, an anonymous binder, card management, customization, and the supporting backend. I had to recognize that continuing to expand the scope would make the project harder to finish without necessarily improving the MVP.

### What I learned

I learned that finishing a project is different from reaching a point where the main features technically work. The final stage requires fixing edge cases, checking consistency across screens, cleaning up the structure, and making sure the documentation matches the actual implementation.

I also became more comfortable deciding that a feature set was complete. Instead of continuously adding new ideas, I could evaluate whether the existing system already fulfilled the original purpose of PokeFolio.

---

## Week of: August 24–30, 2026

### My goal this week

My goal this week was to improve the overall frontend and begin the larger Phase 9 redesign. The core functionality was already taking shape, so I wanted to make the application feel more cohesive, improve the structure of the interface, and polish the binder experience rather than continuing to add unrelated features.

### What I did

* Established the frontend foundation for Phase 9 and began reorganizing the interface around a more consistent design ([8ec5475](https://github.com/lanixiligan/pokefolio/commit/8ec5475)).

* Reworked the Binder and card-browser components and added their associated styling ([cfb7d02](https://github.com/lanixiligan/pokefolio/commit/cfb7d02)).

* Reworked the Explore and Set Browser pages with card searching and scroll restoration ([289d79f](https://github.com/lanixiligan/pokefolio/commit/289d79f)).

* Implemented the Binder page and supporting components for card management and personalization ([b8b9a6b](https://github.com/lanixiligan/pokefolio/commit/b8b9a6b)).

* Added the main application header and established global design tokens for the new frontend direction ([efcb4de](https://github.com/lanixiligan/pokefolio/commit/efcb4de)).

* Added an initial startup loading screen to improve the transition into the application ([efcb4de](https://github.com/lanixiligan/pokefolio/commit/efcb4de)).

* Continued developing the binder management module and connected its UI components to the existing API ([76f670f](https://github.com/lanixiligan/pokefolio/commit/76f670f)).

* Added and refined binder interactions including card navigation, drag-and-drop, and customization ([a5825d5](https://github.com/lanixiligan/pokefolio/commit/a5825d5)).

* Implemented the card picker and binder customization components during the Phase 9 polish stage ([b831a67](https://github.com/lanixiligan/pokefolio/commit/b831a67)).

### What blocked me

The biggest difficulty this week was that the project had reached a point where simply adding functionality was no longer enough. I had to start thinking about how all of the existing features should fit together visually and structurally.

The binder was especially difficult because it combined several interactions at once: card navigation, drag-and-drop, customization, card selection, and API communication. Small changes in one part of the binder could affect another part of the interface, so I had to spend more time breaking the functionality into separate components and refining how they communicated.

I also had to adjust to the idea that frontend development involves a lot of iteration. Some of the Phase 9 work involved rebuilding or reorganizing parts that technically already worked because the earlier versions were not structured well enough for the direction I wanted the final application to take.

### What I learned

This was the point where I started understanding frontend development more as product design and system organization rather than just writing React components.

I learned that reusable components, shared design tokens, consistent layouts, and predictable state management become increasingly important as a project grows.

I also learned that polishing an existing feature can require almost as much thought as building the original version. Phase 9 made me more comfortable with refactoring and redesigning code instead of treating the first working implementation as final.

---

## Week of: August 17–23, 2026

### My goal this week

My goal this week was to move from the initial project foundation into the actual core functionality of PokeFolio. I wanted to build the main screens, make card discovery functional, and start turning the anonymous binder concept into something that could actually be used from beginning to end.

### What I did

* Implemented the Set Browser so users could open a Pokémon TCG set and search through its cards ([7afef5e](https://github.com/lanixiligan/pokefolio/commit/7afef5e)).

* Added loading and error states to make the card-browsing experience more reliable ([7afef5e](https://github.com/lanixiligan/pokefolio/commit/7afef5e)).

* Implemented the Card Details page and connected it to the binder functionality so cards could be added to a user's collection ([dbd0b4b](https://github.com/lanixiligan/pokefolio/commit/dbd0b4b)).

* Built the Binder page and added the ability to remove cards ([ec95485](https://github.com/lanixiligan/pokefolio/commit/ec95485)).

* Implemented card movement and binder spread management, which became an important part of the binder's interaction model ([373553d](https://github.com/lanixiligan/pokefolio/commit/373553d)).

* Added the binder customization panel so users could personalize their binder preferences and appearance ([944df5c](https://github.com/lanixiligan/pokefolio/commit/944df5c)).

* Improved the README and project documentation as the actual system started becoming different from the original plan ([28b26e7](https://github.com/lanixiligan/pokefolio/commit/28b26e7), [38214b0](https://github.com/lanixiligan/pokefolio/commit/38214b0)).

* Started the deployment process by introducing environment-based API configuration ([c59b46a](https://github.com/lanixiligan/pokefolio/commit/c59b46a)).

* Updated the Express server configuration for deployment and added Vercel rewrites so React Router would continue working correctly in production ([2388c1f](https://github.com/lanixiligan/pokefolio/commit/2388c1f), [508aca0](https://github.com/lanixiligan/pokefolio/commit/508aca0)).

* Continued refining the Explore page and header toward the end of the week ([7d81e27](https://github.com/lanixiligan/pokefolio/commit/7d81e27)).

### What blocked me

The biggest challenge this week was understanding how the binder should actually behave once cards could be added, removed, and moved around. The binder was no longer just a page that displayed cards; it had its own layout rules, spread management, and state that had to remain consistent when the user interacted with it.

Deployment was another point where I got stuck. The application worked differently in the local development environment compared with the deployed environment, particularly around API configuration and client-side routing. I had to understand why React Router needed additional configuration on Vercel and why the backend had to listen on all interfaces instead of only behaving like a local development server.

I was also still learning how to organize a growing React application. As more pages and interactions were added, it became harder to keep everything simple, which pushed me to think more carefully about components and application structure.

### What I learned

I started understanding how the different parts of a full-stack application actually fit together instead of treating the frontend and backend as completely separate pieces.

I also learned that implementing a feature is more than making the interface appear on screen. Features such as card movement, binder spreads, customization, routing, and deployment all require the underlying state and architecture to support them properly.

This week also gave me a much clearer understanding of the difference between something working locally and something being ready to run as a deployed application.

---

## Week of: August 10–16, 2026

### What changed this week

* Initialized the PokeFolio repository and added the initial project documentation ([13aa839](https://github.com/lanixiligan/pokefolio/commit/13aa839), [3e22622](https://github.com/lanixiligan/pokefolio/commit/3e22622)).

* Set up the React frontend using Vite and created the initial global styling and project structure ([5530c38](https://github.com/lanixiligan/pokefolio/commit/5530c38)).

* Set up the Node.js/Express backend with CORS and an initial health-check endpoint ([38bc28f](https://github.com/lanixiligan/pokefolio/commit/38bc28f)).

* Created the initial project proposal and development plan, including the MVP scope, user flow, anonymous binder concept, and planned screens ([a269c9d](https://github.com/lanixiligan/pokefolio/commit/a269c9d), [22cd49e](https://github.com/lanixiligan/pokefolio/commit/22cd49e), [e46a3be](https://github.com/lanixiligan/pokefolio/commit/e46a3be)).

* Documented the Pokémon TCG API requirements, security considerations, and intended card-data workflow ([9661b3e](https://github.com/lanixiligan/pokefolio/commit/9661b3e)).

* Restructured the backend to support PostgreSQL, including the database connection, initial migration, database checking script, and card import script ([f443155](https://github.com/lanixiligan/pokefolio/commit/f443155)).

* Added environment-variable configuration for PostgreSQL credentials and the Pokémon TCG API key ([f443155](https://github.com/lanixiligan/pokefolio/commit/f443155), [cda22f9](https://github.com/lanixiligan/pokefolio/commit/cda22f9)).

* Implemented the initial anonymous-user support using a browser-scoped UUID ([9ff91c0](https://github.com/lanixiligan/pokefolio/commit/9ff91c0)).

* Added React Router and implemented the initial Explore page and set-browsing route structure ([1bab204](https://github.com/lanixiligan/pokefolio/commit/1bab204)).

### Why

The main goal this week was to establish the foundation for PokeFolio before implementing the individual features. I needed the frontend, backend, database, and project structure in place so that later features could be connected as a full-stack application rather than being built as isolated frontend screens.

The planning and documentation were also used to define the project's scope early, especially the decision to focus on card discovery, collecting, and binder organization without adding accounts, trading, pricing, or other features outside the MVP.

### What broke or what I got stuck on

A major difficulty was getting used to working with a separate frontend and backend. I initially ran commands from the wrong project directory, including trying to run `npm run dev` from a directory without a `package.json` and navigating into a path that did not exist. I also had to work through the setup of PostgreSQL and understand how the database, Express server, and React frontend would eventually communicate.

At this point I was also still new to React and backend development, so a lot of the architecture was unfamiliar. Getting the Express server running and confirming the PostgreSQL setup was one of the first times I had to connect several different technologies together.

### What is left

The project still needs the main application screens and functionality to be implemented. The next major work will be completing the Set Browser, Card Details page, and Binder, then connecting the frontend interactions to the backend and database.
