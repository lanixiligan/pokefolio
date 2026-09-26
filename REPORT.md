# Weekly Increment Report

## Week of: August 10–16, 2026

## What changed this week

* Initialized the PokeFolio repository and added the initial project documentation.

* Set up the React frontend using Vite and created the initial global styling and project structure.

* Set up the Node.js/Express backend with CORS and an initial health-check endpoint.

* Created the initial project proposal and development plan, including the MVP scope, user flow, anonymous binder concept, and planned screens.

* Documented the Pokémon TCG API requirements, security considerations, and intended card-data workflow.

* Restructured the backend to support PostgreSQL, including the database connection, initial migration, database checking script, and card import script.

* Added environment-variable configuration for PostgreSQL credentials and the Pokémon TCG API key.

* Implemented the initial anonymous-user support using a browser-scoped UUID.

* Added React Router and implemented the initial Explore page and set-browsing route structure.

## Why

The main goal this week was to establish the foundation for PokeFolio before implementing the individual features. I needed the frontend, backend, database, and project structure in place so that later features could be connected as a full-stack application rather than being built as isolated frontend screens.

The planning and documentation were also used to define the project's scope early, especially the decision to focus on card discovery, collecting, and binder organization without adding accounts, trading, pricing, or other features outside the MVP.

## What broke or what I got stuck on

A major difficulty was getting used to working with a separate frontend and backend. I initially ran commands from the wrong project directory, including trying to run `npm run dev` from a directory without a `package.json` and navigating into a path that did not exist. I also had to work through the setup of PostgreSQL and understand how the database, Express server, and React frontend would eventually communicate.

At this point I was also still new to React and backend development, so a lot of the architecture was unfamiliar. Getting the Express server running and confirming the PostgreSQL setup was one of the first times I had to connect several different technologies together.

## What is left

The project still needs the main application screens and functionality to be implemented. The next major work will be completing the Set Browser, Card Details page, and Binder, then connecting the frontend interactions to the backend and database.

---

## Week of: August 17–23, 2026

## My goal this week

My goal this week was to move from the initial project foundation into the actual core functionality of PokeFolio. I wanted to build the main screens, make card discovery functional, and start turning the anonymous binder concept into something that could actually be used from beginning to end.

## What I did

* Implemented the Set Browser so users could open a Pokémon TCG set and search through its cards.

* Added loading and error states to make the card-browsing experience more reliable.

* Implemented the Card Details page and connected it to the binder functionality so cards could be added to a user's collection.

* Built the Binder page and added the ability to remove cards.

* Implemented card movement and binder spread management, which became an important part of the binder's interaction model.

* Added the binder customization panel so users could personalize their binder preferences and appearance.

* Improved the README and project documentation as the actual system started becoming different from the original plan.

* Started the deployment process by introducing environment-based API configuration.

* Updated the Express server configuration for deployment and added Vercel rewrites so React Router would continue working correctly in production.

* Continued refining the Explore page and header toward the end of the week.

## What blocked me

The biggest challenge this week was understanding how the binder should actually behave once cards could be added, removed, and moved around. The binder was no longer just a page that displayed cards; it had its own layout rules, spread management, and state that had to remain consistent when the user interacted with it.

Deployment was another point where I got stuck. The application worked differently in the local development environment compared with the deployed environment, particularly around API configuration and client-side routing. I had to understand why React Router needed additional configuration on Vercel and why the backend had to listen on all interfaces instead of only behaving like a local development server.

I was also still learning how to organize a growing React application. As more pages and interactions were added, it became harder to keep everything simple, which pushed me to think more carefully about components and application structure.

## What I learned

I started understanding how the different parts of a full-stack application actually fit together instead of treating the frontend and backend as completely separate pieces.

I also learned that implementing a feature is more than making the interface appear on screen. Features such as card movement, binder spreads, customization, routing, and deployment all require the underlying state and architecture to support them properly.

This week also gave me a much clearer understanding of the difference between something working locally and something being ready to run as a deployed application.

---

## Week of: August 24–30, 2026

## My goal this week

My goal this week was to improve the overall frontend and begin the larger Phase 9 redesign. The core functionality was already taking shape, so I wanted to make the application feel more cohesive, improve the structure of the interface, and polish the binder experience rather than continuing to add unrelated features.

## What I did

* Established the frontend foundation for Phase 9 and began reorganizing the interface around a more consistent design.

* Reworked the Binder and card-browser components and added their associated styling.

* Reworked the Explore and Set Browser pages with card searching and scroll restoration.

* Implemented the Binder page and supporting components for card management and personalization.

* Added the main application header and established global design tokens for the new frontend direction.

* Added an initial startup loading screen to improve the transition into the application.

* Continued developing the binder management module and connected its UI components to the existing API.

* Added and refined binder interactions including card navigation, drag-and-drop, and customization.

* Implemented the card picker and binder customization components during the Phase 9 polish stage.

## What blocked me

The biggest difficulty this week was that the project had reached a point where simply adding functionality was no longer enough. I had to start thinking about how all of the existing features should fit together visually and structurally.

The binder was especially difficult because it combined several interactions at once: card navigation, drag-and-drop, customization, card selection, and API communication. Small changes in one part of the binder could affect another part of the interface, so I had to spend more time breaking the functionality into separate components and refining how they communicated.

I also had to adjust to the idea that frontend development involves a lot of iteration. Some of the Phase 9 work involved rebuilding or reorganizing parts that technically already worked because the earlier versions were not structured well enough for the direction I wanted the final application to take.

## What I learned

This was the point where I started understanding frontend development more as product design and system organization rather than just writing React components.

I learned that reusable components, shared design tokens, consistent layouts, and predictable state management become increasingly important as a project grows.

I also learned that polishing an existing feature can require almost as much thought as building the original version. Phase 9 made me more comfortable with refactoring and redesigning code instead of treating the first working implementation as final.

---

## Week of: August 31 – September 6, 2026

## My goal this week

My goal this week was to finish the remaining Phase 9 frontend work and bring PokeFolio to a stable point where the core functionality could be considered complete. After spending several weeks implementing and restructuring the application, I wanted to focus on resolving the remaining interaction problems, completing the final frontend pieces, and finalizing the project documentation.

## What I did

* Fixed the Add Card spread auto-advance behavior in the binder.

* Completed the Phase 9 Set Browser with a responsive card grid and debounced card searching.

* Added and refined the structural components and CSS for the Explore, Binder, and Set Browser pages.

* Continued frontend polishing so the main application screens worked together as a more consistent interface.

* Finalized the README on September 4 after the core functionality and project structure had stabilized.

* Consolidated the project documentation so it better represented the completed system rather than the earlier development plan.

By the end of this week, the main functionality of PokeFolio was considered finalized. At this point, the remaining work was primarily documentation, cleanup, and future refinement rather than implementing another major application feature.

## What blocked me

The main problems this week were small but important interaction issues rather than major architectural problems. The Add Card flow, for example, had a spread auto-advance issue that needed to be fixed before I could consider the binder behavior stable.

Another challenge was knowing when to stop adding features. By this point the application already had card discovery, card details, an anonymous binder, card management, customization, and the supporting backend. I had to recognize that continuing to expand the scope would make the project harder to finish without necessarily improving the MVP.

## What I learned

I learned that finishing a project is different from reaching a point where the main features technically work. The final stage requires fixing edge cases, checking consistency across screens, cleaning up the structure, and making sure the documentation matches the actual implementation.

I also became more comfortable deciding that a feature set was complete. Instead of continuously adding new ideas, I could evaluate whether the existing system already fulfilled the original purpose of PokeFolio.

---

## Week of: September 21–27, 2026

## My goal this week

My goal this week was to return to PokeFolio after nearly a month away and prepare the project for final submission. I wanted to work through the documentation requirements from my professor, update the project documentation using the provided formats and templates, make some final frontend improvements, and clean up the repository so the project would be in a more presentable state.

## What I did

* Returned to PokeFolio after not actively working on it for almost a month.

* Revised the README to better match my professor's documentation requirements.

* Added `REPORT.md` for the required project reporting and documentation.

* Reviewed the existing documentation and reorganized it around the required templates and project deliverables.

* Continued frontend cleanup and polish on the Explore, Binder, and customization-related components.

* Expanded the supported Pokémon TCG sets from five to six by adding Crown Zenith (`swsh12pt5`).

* Re-imported the card catalog into the local PostgreSQL database after adding the new supported set.

* Updated the Pokémon TCG API documentation to reflect the current API situation and its announced March 1, 2027 cutoff for existing API keys.

* Added an MIT License to the project.

* Updated the README and customization-related components with additional color palettes and the updated PokeFolio branding/logo.

## What blocked me

The main difficulty this week was getting back into a project after being away from it for several weeks. I already understood the system I had built, but I had to spend some time reorienting myself with the codebase, documentation, and the decisions I had made earlier in development.

The documentation requirements also meant that some of the work was less about programming and more about translating the development process into a format that accurately represented the project. I had to revisit older decisions and make sure the documentation described the actual system rather than the original plan.

Adding the sixth set also required me to revisit the data side of the application. Since the project had already been considered functionally complete, expanding the dataset meant making a small change without accidentally turning it into another large development phase.

## What I learned

I learned that documentation is part of the software development process, especially when a project is being submitted or evaluated. The README and project reports should reflect what was actually built, how it evolved, and what decisions were made during development.

Returning to PokeFolio after a long break also showed me the value of having organized project documentation. Because the project already had a clear structure and development history, it was much easier to understand where I had left off and continue working without rebuilding my understanding from scratch.

I also learned that after the core functionality is complete, improvements do not necessarily have to mean adding major features. Small changes such as supporting another set, refining the UI, cleaning up documentation, improving branding, and adding a license can make the final project more complete without changing its original scope.
