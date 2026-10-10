# PokeFolio — Update Plan

_Created 2026-10-10. This is a checklist only; no code has been changed yet._

This plan turns the professor's feedback (m5a2–m5a4, m8a1–m8a6) and the code-review issues into a prioritized list. Every item was checked against the current code (commit `6f64651`, in sync with `origin/main`). Items marked **reproduced** were run against the API locally with test data.

**Effort:** S = under 30 minutes · M = an hour or two · L = several sessions
**Status:** Open · Partly done · Done · No change needed

## At a glance

| ID | Change | Effort | Status |
| --- | --- | --- | --- |
| R1 | README: name the Node and PostgreSQL versions | S | Open |
| R2 | README: create the `pokefolio` database before migrating | S | Open |
| R3 | README: fix the AI-USAGE badge link and the API-key prerequisite | S | Open (found in review) |
| P1 | REPORT: newest week first, with a "since last report" line | S | Open |
| P2 | REPORT: entry for the latest week | M | Open |
| P3 | REPORT: link commits | S | Open |
| P4 | REPORT: replace "polish" with named changes | S | Open |
| P5 | REPORT: what was checked after the re-import | S | Open |
| P6 | REPORT: one concrete build problem and the fix | S | Partly done |
| P7 | REPORT: "What is left", including the 2027 API cutoff | M | Open |
| S1 | Remove the leftover comment in `server.js` | S | Open |
| S2 | Fix the `/api/cards` sort for numbers like `TG01` | S | Open (reproduced) |
| S3 | JSON 404 fallback and error handler | S | Open (reproduced) |
| S4 | Use `rowCount` for deletes | S | Open |
| S5 | Stricter request-body validation | M | Open (reproduced) |
| C1 | Fix the `/binder?spreadId=` deep link | S | Open (reproduced) |
| D1 | Clear the `npm audit` advisories | S | Open: `npm audit fix` alone doesn't clear the server |
| A1 | 2027 API cutoff: back up the catalog now, Scrydex later | S now / L later | Open |
| T1 | Server tests | L | Open |
| T2 | GitHub Actions CI | M | Open |
| X1 | Correct `docs/SECURITY-CHECKLIST.md` | S | Open (found in review) |
| X2 | Show set icons in the Add Card filters | S | Open (found in review) |
| O1 | Move SQL into a repository layer (optional) | L | Open, only after T1 |

---

## README (m8a2, m8a5)

The professor raised both of the first two points twice. The rest of the README was praised. Keep setup in the README and link `docs/local-development.md` for detail.

- [ ] **R1 · Name the Node and PostgreSQL versions** · S
  - **Where:** `README.md:18-19` (Prerequisites). The same bare "Node.js" is in `docs/local-development.md:25` and `docs/architecture.md:48`.
  - **Change:** e.g. `Node.js 24 (Vite 8 and ESLint 10 need at least 20.19, or 22.13 on the 22 line)` and `PostgreSQL 18`, which is what `docs/local-development.md` uses. Version 16 also ran fine in Codespaces. Use the `node -v` output from the machine PokeFolio was built on. The Codespace reports v24.21.0, which may differ.
  - **Optional:** add `"engines": { "node": "^20.19.0 || ^22.13.0 || >=24" }` to both `package.json` files, so npm warns on an older Node.
  - **Why:** m8a2, m8a5.
  - **Verify:** `node -v` on the build machine matches the README; preview the README.

- [ ] **R2 · Create the database before `npm run migrate`** · S
  - **Where:** `README.md:63-71` ("Set up and seed the database"), before `npm run migrate` on line 68.
  - **Change:** add a first step that matches `docs/local-development.md` §3:
    ```powershell
    psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE pokefolio;"
    ```
    Then add one or two sentences:
    - The name must match `PGDATABASE` in `server/.env`.
    - If `npm run migrate` prints `database "pokefolio" does not exist`, this step was skipped.
    - The step-by-step version with checks is in [docs/local-development.md §3](docs/local-development.md#3-create-the-local-postgresql-database).
  - **Why:** m8a2, m8a5 ("someone starting from nothing will stop there").
  - **Verify:** follow the new steps with a throwaway name, so the real database isn't touched:
    1. Create `pokefolio_readme_test`.
    2. From `server/`, run `$env:PGDATABASE="pokefolio_readme_test"; npm run migrate` and expect `Database schema is ready.`
    3. Run `Remove-Item Env:PGDATABASE`, then drop the test database.
    4. Click the §3 link on GitHub.

- [ ] **R3 · Fix the badge link and the API-key prerequisite** · S (found in review)
  - **Where:** `README.md:2` and `README.md:20`.
  - **Change:**
    - Line 2 links `docs/AI-USAGE.md`, which commit `c1e1178` moved to the repo root. Point it to `AI-USAGE.md`.
    - Line 20 says to get a key from the developer portal, but line 253 says new registrations are closed. Reword it to "an existing Pokémon TCG API key (only needed for `npm run seed`; see the API notice below)".
  - **Why:** the badge was added after the last review (`6f64651`), so its broken link hasn't been seen yet. The API key is the other place a newcomer gets stuck (m8a5).
  - **Verify:** after pushing, click the badge and the notice link on GitHub.

## REPORT.md (m8a1, m8a3, m8a4, m8a6)

Already done: the empty template weeks are gone (m8a1). Commit links will resolve because `main` is pushed.

- [ ] **P1 · Newest week first** · S
  - **Where:** week headings at `REPORT.md:3, 43, 89, 133, 169`.
  - **Change:** reverse the order, so the new entry (P2) comes first, then September 21–27. Open the new entry with one line: "Since my last report: …".
  - **Optional:** make each week a `##` heading and its subsections `###`. Today they are all `##`, so the outline is flat.
  - **Why:** m8a4.
  - **Verify:** the Markdown preview shows newest → oldest. Check that no text was lost: the word count from `(Get-Content REPORT.md | Measure-Object -Word).Words`, or `wc -w REPORT.md`, is the same before and after the reorder.

- [ ] **P2 · Entry for the latest week** · M
  - **Where:** new section at the top.
  - **Change:** cover the work since the last entry, with links (P3):
    - AI-USAGE.md moved to the repo root and expanded: `c1e1178` (2026-10-04)
    - README AI-assistance note and link: `6f64651` (2026-10-05)
    - Reviewing the professor's feedback and writing this plan (2026-10-10)
    - Whatever from this plan gets done this week
  - **Use these sections:** goal, what I did, what blocked me (P6), what I checked (P5), what is left (P7).
  - **Check the dates:** by commit date, the palettes/logo (`2b86a85`, 09-26) and the screenshots (`9756257`, 09-27) belong to September 21–27. That week already mentions the palettes (`REPORT.md:195`). Either add the screenshots to that week, or list both in the new entry as "finished at the end of last week". Either way, the dates must match the linked commits.
  - **Why:** m8a4, m8a6.
  - **Verify:** every bullet has a commit link, and each commit's date (`git log --date=short`) falls inside the week heading.

- [ ] **P3 · Link commits** · S
  - **Change:** use the format `[2b86a85](https://github.com/lanixiligan/pokefolio/commit/2b86a85)`. These commits cover work the report already describes:

    | Work | Commit | REPORT line |
    | --- | --- | --- |
    | Crown Zenith (`swsh12pt5`) added to the importer | `29c28e7` | 187 |
    | New palettes and logo | `2b86a85` | 195 |
    | Screenshots | `9756257` | not mentioned yet (see P2) |
    | MIT License | `896fc01` | 193 |
    | README revised for course requirements | `4ef3305` | 179 |
    | REPORT.md added | `0790296` | 181 |
    | Add Card spread auto-advance fix | `9981bdf` | 141 |
    | Set Browser grid and debounced search | `98ebe68` | 143 |
    | Vercel rewrites; server listens on all interfaces | `508aca0`, `2388c1f` | 67 |
  - **Why:** m8a1, m8a4.
  - **Verify:** after pushing, click each link on GitHub.

- [ ] **P4 · Replace "polish" with named changes** · S
  - **Where:** `REPORT.md:185` ("Continued frontend cleanup and polish…"). Give `REPORT.md:147` the same treatment.
  - **Change:** name two or three changes that were actually made. Candidates from the September 26 commits:
    - Customize got its own Accent colour picker (`29c28e7`).
    - The Binder toolbar's "+ Add Card" and "⚙ Customize" text buttons became icon buttons with labels and tooltips (`29c28e7`).
    - The Set Browser card reveal animation is skipped when the OS asks for reduced motion (`29c28e7`).
    - Two new Quick Styles, Aurora and Crimson, the new logo as the favicon, and unused template images removed (`2b86a85`).
    - The Add Card slot logic moved into its own `getNextAvailableSlot.js` (`29c28e7`).
  - **Why:** m8a6.
  - **Verify:** each named change is visible in the linked commit's diff.

- [ ] **P5 · What was checked after the re-import** · S
  - **Where:** after `REPORT.md:189`.
  - **Change:** state what was actually checked. If that isn't remembered, re-run it at home (it needs the API key) and record the results:
    1. `npm run seed` prints one JSON line per set, each with `"status":"succeeded"` and `"countsMatch":true`.
    2. `npm run db:check` lists all six set IDs, and the counts add up to 977.
    3. Crown Zenith appears on Explore. Open it, search for a card, and add it to the binder.
  - **Why:** m8a6.
  - **Verify:** the report names the commands and the numbers they showed.

- [ ] **P6 · One concrete build problem and what was done** · S (partly done)
  - **Status:**
    - `REPORT.md:157` names the Add Card auto-advance issue but not its cause or the fix.
    - `REPORT.md:33` describes the wrong-directory problem from week 1.
  - **Change:** write it as symptom → cause → change → commit, in your own words. Candidates:
    - Add Card spread auto-advance (`9981bdf`).
    - Routes returned 404 on Vercel until the `client/vercel.json` rewrites were added (`508aca0`, with `2388c1f`).
    - **This week's option:** do S2 and write it up. `/api/cards` returned 500 for a card numbered `TG01`; the sort was changed and then checked with a test card.
  - **Why:** m8a3.

- [ ] **P7 · "What is left", including the 2027 cutoff** · M
  - **Where:** at the end of the new entry. Today "What is left" only exists in the oldest week (`REPORT.md:37`).
  - **Change:** write three short parts:
    1. **Known problems:** whatever in this plan is still open when the entry is written. For example:
       - no automated tests or CI (T1–T2)
       - the server's `npm audit` advisories (D1)
       - CORS open to every origin (`server/server.js:12`)
       - no access gate on the deployed app (`docs/SECURITY-CHECKLIST.md` items 18 and 21). "A way to protect the deployed app" was on the m8a3 list of next steps.
    2. **Before the demo:** the items committed to.
    3. **2027 cutoff:** the A1 plan in two or three sentences.
  - **Why:** m8a4, m8a3.
  - **Verify:** every listed problem is still open, and nothing already fixed is listed.

## Server habits (m5a2–m5a4)

- [ ] **S1 · Remove the leftover comment** · S
  - **Where:** `server/server.js:146` (`// REPLACE THE EXISTING QUERY HERE`). A search for REPLACE, TODO and FIXME found no other leftovers.
  - **Why:** issue 5. This is also the prelim feedback about tidying leftover instructional comments.
  - **Verify:** the server starts, and a set page still lists cards.

- [ ] **S2 · Fix the `/api/cards` sort** · S
  - **Where:** `server/server.js:162`: `ORDER BY set_id, number::integer;`
  - **Change:**
    ```sql
    ORDER BY set_id,
      substring(number from '^[^0-9]*'),
      substring(number from '[0-9]+')::int,
      number;
    ```
    This puts plain numbers first, in numeric order, then lettered numbers by prefix: `1, 2, 10, GG01, GG10, TG01` (checked in psql).
    Use `[0-9]`, not `\d`. Inside a JavaScript template string, `\d` turns into a plain `d` before PostgreSQL sees it.
  - **Why:** issue 3. **Reproduced:** with one card numbered `TG01` in the database, both `/api/cards?set=…` and `/api/cards` return 500. Today's six sets only use plain numbers, so this would break as soon as a set with TG, GG or SV numbers is added.
  - **Verify:**
    - Load the Appendix A test data.
    - `curl "localhost:5000/api/cards?set=zztest"` returns 200 in the order above, and `/api/cards` returns 200.
    - With the real catalog, Base Set still lists 1, 2, 3 … and search still works.

- [ ] **S3 · JSON 404 fallback and error handler** · S
  - **Where:** `server/server.js`, after the last route and before `app.listen` (line 1487).
  - **Change:**
    ```js
    app.use((req, res) => {
      res.status(404).json({ error: "Not found" });
    });

    app.use((error, req, res, next) => {
      if (error.type === "entity.parse.failed") {
        return res.status(400).json({ error: "Request body must be valid JSON" });
      }

      console.error("Unhandled error:", error);
      res.status(500).json({ error: "Something went wrong" });
    });
    ```
    Express 5 also sends failed promises from async routes to this handler. Every transaction route calls `await pool.connect()` outside its `try` block (line 220 and others), so a database outage currently returns Express's HTML error page.
  - **Why:** m5a4. **Reproduced:**
    - `GET /api/nope` returns HTML ("Cannot GET /api/nope").
    - Malformed JSON returns an HTML page with a stack trace and server file paths.

    The fix also makes `SECURITY-CHECKLIST.md` item 25 true (see X1).
  - **Verify:**
    - `curl -i localhost:5000/api/nope` returns a 404 with a JSON body.
    - `curl -i -X POST localhost:5000/api/binder/cards -H "X-Anon-Id: <uuid>" -H "Content-Type: application/json" -d "{bad"` returns a 400 with a JSON body and no stack trace.
    - The Appendix B smoke test still passes.
    - In Windows PowerShell, type `curl.exe` instead of `curl`.

- [ ] **S4 · Use `rowCount` for deletes** · S
  - **Where:** `server/server.js:654-664`. The card-removal route runs `DELETE … RETURNING id`, then checks `result.rows.length === 0`.
  - **Change:** drop `RETURNING id` and check `result.rowCount === 0`. The spread delete (lines 1044–1153) checks existence with a `SELECT` first and can stay as it is.
  - **Why:** m5a2.
  - **Verify:**
    - Remove a card in the binder; it disappears.
    - Send the same DELETE again and expect 404 "Card is not in the binder".

- [ ] **S5 · Stricter request-body validation** · M
  - **Where:**
    - `PUT /api/preferences`: `server/server.js:1366-1392`
    - `POST /api/binder/cards`: lines 432–460
    - `PATCH /api/binder/cards/:cardId`: lines 690–720
  - **Change:**
    - **Colours:** check against `/^#([0-9a-f]{3}|[0-9a-f]{6})$/i`. Accept 3-digit hex, or expand it in the client before saving. The HEX field in Customize (react-colorful's `HexColorInput`) sends `#abc` when three characters are typed. A strict `#rrggbb` check would reject saves from PokeFolio's own UI.
    - **Theme:** must be one of `classic`, `midnight` or `sunrise`, the three themes defined in `client/src/pages/Binder/Binder.css:192-207`. Customize only sends `midnight` today.
    - **Binder bodies:** `pageSide` and `position` must be real integers. Today `null` becomes 0 and `true` becomes 1, and both pass.
    - **Keep accepting `spreadId` as a numeric string.** PostgreSQL `BIGINT` ids come back from `pg` as strings (`"2"`), and the client sends them back that way. A `typeof spreadId === "number"` check would break adding and moving cards.
    - **`POST /api/binder/cards`:** validate the body before `BEGIN` (line 438), not after taking the lock.
  - **Why:** m5a2 (unexpected shapes), m5a3 (be deliberate about what's accepted). **Reproduced:** `PUT /api/preferences` stored `background: "red; } body {…}"`, `binderColor: "x"` and `theme: "zzz"`, and returned 200.
  - **Verify:**
    - Those three values now return 400, and nothing changes in the database.
    - In the UI, apply each Quick Style, save, and reload; the choice persists.
    - Type `abc` into a HEX field and save; the save succeeds.
    - Add a card from Card Details and from the Add Card panel.
    - Dragging, moving and swapping cards still work.

## Client

- [ ] **C1 · Fix the `/binder?spreadId=` deep link** · S
  - **Where:** `client/src/pages/Binder/Binder.jsx:107-111`.
  - **Change:**
    ```js
    const match = binder.spreads.find((spread) => String(spread.id) === spreadParam);
    if (match) {
      setSelectedSpreadId(match.id);
    }
    ```
    Alternatively, delete the effect: nothing in the app links to `?spreadId=` today.
    The same string/number mix-up exists at `server/server.js:819`, but it's harmless there. A move to the card's own slot just becomes a swap with itself, and the client skips those moves anyway.
  - **Why:** issue 4. **Reproduced:** `GET /api/binder` returns `"id": "2"` (a string), and the code compares it with `Number(...)`.
  - **Verify:**
    - Open Customize and click "+ Add Spread".
    - Copy the second spread's id from the `/api/binder` response in DevTools → Network.
    - Open `/binder?spreadId=<id>`; the indicator shows "2 / 2".
    - The ← / → buttons still work, and `npm run lint` and `npm run build` pass.

## Dependencies

- [ ] **D1 · Clear the `npm audit` advisories** · S
  - **Client:** `npm audit fix` leaves **0 vulnerabilities** (tested on a copy of the lockfile). Both advisories (`brace-expansion`, `source-map-js`) are in build tooling.
  - **Server:** `npm audit fix` **leaves all 3 high advisories**.
    - They come from `nodemon 3.1.14 → chokidar 3.6.0 → braces 3.0.3`.
    - npm's only offer is `--force`, which would downgrade nodemon to 1.14.10.
    - Instead, use Node's built-in file watcher. Set `"dev": "node --watch server.js"` in `server/package.json` and run `npm uninstall nodemon`. That leaves **0 vulnerabilities** (tested on a copy).
    - Update the Nodemon mentions in `docs/local-development.md:540` and `docs/architecture.md:58`.
  - **First:** decide what to do with the uncommitted `server/package-lock.json` change (patch bumps of `brace-expansion`, `proxy-addr` and `qs`). Either commit it, or discard it with `git checkout server/package-lock.json`. Then this change gets a clean commit.
  - **Why:** issue 6.
  - **Verify:**
    - `npm audit` prints "found 0 vulnerabilities" in both folders.
    - In `client/`, `npm run lint` and `npm run build` pass.
    - In `server/`, `npm run dev` restarts when `server.js` is saved.

## 2027 API cutoff

- [ ] **A1 · Back up the catalog now; move the importer only if the project continues** · S now / L later
  - **Facts:**
    - Only `server/scripts/import-cards.js:3` calls the Pokémon TCG API.
    - The app reads sets and cards from PostgreSQL, so the demo and normal use don't depend on the API. Only re-importing does.
    - New keys can't be registered (`README.md:253`), so `npm run seed` can't be run from scratch without the existing key.
  - **Now (S, at home):**
    1. Run `pg_dump -U postgres -h localhost --data-only -t sets -t cards -f pokefolio-catalog.sql pokefolio`.
    2. Use `-f`, not `>`. In Windows PowerShell 5.1, `>` writes UTF-16, which `psql` can't read back.
    3. Keep the file outside git, unless the data's terms allow publishing it.
    4. To restore, run `npm run migrate`, then `psql -U postgres -d pokefolio -f pokefolio-catalog.sql`.
  - **Later (L):**
    - Port `import-cards.js` to Scrydex, which has a different API and different field names.
    - Check the card images too. The importer stores the image URLs the API returned, so images still load from the provider at runtime. `SELECT image_small_url FROM cards LIMIT 1;` shows which host they come from.
  - **Why:** issue 1. m8a4 asked how the cutoff will be handled.
  - **Verify:**
    1. Create a scratch database and migrate it with `PGDATABASE` set.
    2. Restore the dump into it with `psql -f`.
    3. `npm run db:check` against it shows six sets and 977 cards.
    4. Drop the scratch database.

## Tests and CI

- [ ] **T1 · Server tests** · L
  - **Change:** add `server/test/binder.test.js` using Node's built-in test runner (`node --test`) and `fetch`, so no new dependencies are needed. Add `"test": "node --test"` to `server/package.json`. The test:
    - starts `node server.js` as a child process on a spare port, with `PGDATABASE=pokefolio_test` (create and migrate that database once)
    - waits for `/api/health`
    - inserts its own test set and cards, so it needs no API key (CI won't have one)
    - removes them at the end

    Starting the server as a child process avoids refactoring first, because `server.js` calls `app.listen` as soon as it's imported (line 1487).
  - **Cover:**
    - adding a card (201); duplicate card, occupied slot and outside the grid (all 409)
    - moving to an empty slot; swapping
    - deleting a spread removes its cards, and deleting the last spread returns 409
    - grid reflow 4→2 and 2→4 keeps every card exactly once and adds spreads when needed (`reflowBinderGrid`, `server/server.js:1199-1364`)
    - checks for S2, S3 and S5 once they're in
  - **Why:** issue 2. Testing is manual today (`docs/architecture.md`, "Testing & Quality Checks"), and the reflow and swap logic is the riskiest code.
  - **Verify:** `npm test` passes. Break something on purpose (e.g. comment out the swap `UPDATE`), confirm a test fails, then revert it.

- [ ] **T2 · GitHub Actions CI** · M (client-only job: S)
  - **Change:** add `.github/workflows/ci.yml` with two jobs:
    - **client:** `actions/setup-node` with Node 24 → `npm ci` → `npm run lint` → `npm run build`
    - **server:** a `postgres:18` service → `npm ci` → `npm run migrate` → `npm test`, with the `PG*` variables pointing at the service

    No secrets are needed. `npm ci` fails if a lockfile is out of date, so do D1 first. The client job can be added before T1.
  - **Also:** `docs/SECURITY-CHECKLIST.md` items 7–12 are "N/A" today because there are no workflows. They apply once CI exists; e.g. item 11, pin actions to a commit SHA.
  - **Why:** issue 2.
  - **Verify:** push a branch and check that both jobs pass. A deliberate lint error on a throwaway branch should make the client job fail.

## Found in review (not in the feedback)

- [ ] **X1 · Correct `docs/SECURITY-CHECKLIST.md`** · S
  - **Line 51, item 25** says errors never expose stack traces. That isn't true until S3 is done.
  - **Line 61, item 30** mentions `client/src/assets/hero.png`, which commit `2b86a85` deleted.
  - **Lines 66–70**, "📝 To complete your assignment", are leftover generated text. They say CORS was fixed and an access layer was added. Neither is in the code: `server/server.js:12` is still `app.use(cors())`. Remove the section or rewrite it to match what was actually done.
  - **Why:** a submitted document shouldn't claim fixes that aren't there.
  - **Verify:** re-check every "Yes" against the code.

- [ ] **X2 · Show set icons in the Add Card filters** · S
  - **Where:** `client/src/pages/Binder/AddCardPicker.jsx:295-296` reads `set.logo`, which the API doesn't return, so no icon ever shows.
  - **Change:** use `set.symbol_url`. The `.add-card-filter-icon` style is a 14 × 14 px icon (`AddCardPicker.css:184-188`), which fits the small set symbol better than the wide logo.
  - **Verify:** in the Binder, open Add Card; each set filter button shows its symbol.

## Optional

- [ ] **O1 · Move SQL into a repository layer** · L
  - **Change:** move the queries out of `server/server.js` (1,489 lines) into files such as `server/repositories/catalog.js`, `binder.js` and `preferences.js`. Two obvious duplicates to merge:
    - the card column list (lines 149–159 and 181–191)
    - the preferences query and its snake_case → camelCase mapping (`GET /api/binder` 311–388, `GET /api/preferences` 1159–1189, `PUT /api/preferences` 1432–1468)

    This is the same idea as m5a4's "reuse the query shape".
  - **Why:** m5a2–m5a4.
  - **When:** only after T1, so the tests catch regressions. Skip it before the demo if time is short.
  - **Verify:** `npm test` passes, unchanged, before and after.

## Checked: no change needed

- **m5a3 (allowed fields):** each handler only reads the fields it uses (`server/server.js:436`, `694`, `1367-1373`). Nothing passes the whole `req.body` into SQL.
- **m5a4 (explicit foreign-key delete rules):**
  - The binder foreign keys already say `ON DELETE CASCADE` (`001_initial_schema.sql:53-54`, `67-68`).
  - `cards → sets` (line 14) and `binder_cards → cards` (line 62) use the default rule. That default stops a card from being deleted while it's in a binder, which is the intended behaviour.
  - Making the rule explicit would need a second migration, and `migrate.js:7` only runs `001`. Leave it.
- **m8a1:** empty template weeks removed.
- **m8a2:** screenshots added (`9756257`).

## Suggested order

1. **R1, R2, R3:** README, about 30 minutes. The professor asked for this twice.
2. **S1, S2, S3, S4, C1, X2**, then **D1:** small fixes, one commit each, with the Appendix B smoke test after each. S2 also gives P6 its concrete problem.
3. **X1:** after S3, so item 25 becomes true.
4. **P1–P7:** the REPORT last, so the new entry can link this week's commits and "What is left" is accurate.
5. **A1 backup:** at home, against the real database.
6. If there's time before the demo: **S5**, then **T1** → **T2**. The client-only CI job is quick and can go earlier.
7. After the course: **O1**, and A1's Scrydex port if the project continues.

If time is short, R1–R3 plus P1, P3, P5 and P7 cover every remaining point in the professor's feedback.

---

## Appendix A: test data (no API key needed)

Run this in `psql -U postgres -d pokefolio`. In Codespaces, use `docker exec -i pokefolio-db psql -U postgres -d pokefolio`. The `zztest` ids don't collide with real cards.

```sql
INSERT INTO sets VALUES ('zztest', 'Test Set', 'Test', 4, 6, '2020-01-01', 'http://x/logo.png', 'http://x/sym.png');
INSERT INTO cards VALUES
  ('zztest-1',    'zztest', 'Pikachu', 'Pokemon', '{Lightning}', '1',    'Common', 'A', 's', 'l'),
  ('zztest-2',    'zztest', 'Pichu',   'Pokemon', '{Lightning}', '2',    'Common', 'A', 's', 'l'),
  ('zztest-10',   'zztest', 'Raichu',  'Pokemon', '{Lightning}', '10',   'Rare',   'A', 's', 'l'),
  ('zztest-TG01', 'zztest', 'Mewtwo',  'Pokemon', '{Psychic}',   'TG01', 'Rare',   'A', 's', 'l');
```

Remove it afterwards. Delete the binder rows first, because a card that's in a binder can't be deleted.

```sql
DELETE FROM binder_cards WHERE card_id LIKE 'zztest-%';
DELETE FROM cards WHERE set_id = 'zztest';
DELETE FROM sets WHERE id = 'zztest';
```

## Appendix B: smoke test after each change

1. In `server/`, run `npm run dev` and expect "PokeFolio API running on port 5000". `curl localhost:5000/api/health` returns `"status":"ok"`.
2. In `client/`, `npm run lint` and `npm run build` pass. Then run `npm run dev`.
3. In the browser, walk through the main flow:
   1. Explore shows six sets; open one and search for a name.
   2. Open a card and click Add to Binder.
   3. The Binder shows the card; drag it to another slot.
   4. In Customize, change the grid size and save. The card is still there.
   5. Remove the card.
