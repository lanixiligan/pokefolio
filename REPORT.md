# Weekly Increment Report

## Week of: August 13–16, 2026

## What changed this week

- Initialized the PokeFolio repository and added the initial project documentation.
- Set up the React frontend using Vite and created the initial global styling and project structure.
- Set up the Node.js/Express backend with CORS and an initial health-check endpoint.
- Created the initial project proposal and development plan, including the MVP scope, user flow, anonymous binder concept, and planned screens.
- Documented the Pokémon TCG API requirements, security considerations, and intended card-data workflow.
- Restructured the backend to support PostgreSQL, including the database connection, initial migration, database checking script, and card import script.
- Added environment-variable configuration for PostgreSQL credentials and the Pokémon TCG API key.
- Implemented the initial anonymous-user support using a browser-scoped UUID.
- Added React Router and implemented the initial Explore page and set-browsing route structure.

## Why

The main goal this week was to establish the foundation for PokeFolio before implementing the individual features. I needed the frontend, backend, database, and project structure in place so that later features could be connected as a full-stack application rather than being built as isolated frontend screens.

The planning and documentation were also used to define the project's scope early, especially the decision to focus on card discovery, collecting, and binder organization without adding accounts, trading, pricing, or other features outside the MVP.

## What broke or what I got stuck on

A major difficulty was getting used to working with a separate frontend and backend. I initially ran commands from the wrong project directory, including trying to run `npm run dev` from a directory without a `package.json` and navigating into a path that did not exist. I also had to work through the setup of PostgreSQL and understand how the database, Express server, and React frontend would eventually communicate.

At this point I was also still new to React and backend development, so a lot of the architecture was unfamiliar. Getting the Express server running and confirming the PostgreSQL setup was one of the first times I had to connect several different technologies together.

## What is left

The project still needs the main application screens and functionality to be implemented. The next major work will be completing the Set Browser, Card Details page, and Binder, then connecting the frontend interactions to the backend and database.

---

## Week of: (date)

## My goal this week

(what you set out to do)

## What I did

(the specific work you did, and how)

## What blocked me

(the specific problems you hit)

## What I learned

(what you now understand that you did not before)

---

## Week of: (date)

## My goal this week

(what you set out to do)

## What I did

(the specific work you did, and how)

## What blocked me

(the specific problems you hit)

## What I learned

(what you now understand that you did not before)