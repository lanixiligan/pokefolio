# PokeFolio implementation checklist

Step-by-step instructions for every change in the [working plan](UPDATE-PLAN.md), in its suggested order. Written 2026-10-10 against `main` at `6f64651`. Line numbers are from that commit and shift as you edit, so search for the quoted code if a line doesn't match.

Nothing has been changed in the repo. You do every step yourself, or hand an item to Claude Code (see "How to use this with Claude Code").

## Contents

0. [Before you start](#0-before-you-start)
1. [README: R1, R2, R3](#batch-1-readme)
2. [Small fixes: S1, S2, S3, S4, C1, C2, X2, D1](#batch-2-small-fixes)
3. [Deployment: H1, H2, H3](#batch-3-deployment)
4. [Security checklist: X1](#batch-4-security-checklist)
5. [REPORT.md: P1 to P7](#batch-5-reportmd)
6. [Catalog backup: A1](#batch-6-catalog-backup)
7. [If there's time before the demo: S5, H4, T1, T2](#batch-7-if-theres-time-before-the-demo)
8. [After the course: O1 and the Scrydex importer](#batch-8-after-the-course)

Appendix: [smoke test](#appendix-b-smoke-test), [test data](#appendix-a-test-data)

---

## How to use this with Claude Code

1. Save this file and the working plan into the repo, for example as `docs/IMPLEMENTATION-CHECKLIST.md` and `docs/UPDATE-PLAN.md`. Your choice whether to commit them.
2. Do one item per Claude Code request, for example:
   > Do item **S2** from `docs/IMPLEMENTATION-CHECKLIST.md`. Follow the steps exactly, run its Verify steps, show me the diff, and don't commit until I say so.
3. Read the diff, run the Verify steps yourself if Claude Code couldn't (anything in the browser), then commit with the suggested message.
4. Tick the box here when it's done.

---

## 0. Before you start

- [x] **0.1 Get the repo clean**
  1. `cd pokefolio`, then `git checkout main` and `git pull`.
  2. Run `git status`. If `server/package-lock.json` shows as modified, either commit it (`git commit -am "chore: update server lockfile"`) or discard it (`git checkout server/package-lock.json`). D1 needs a clean starting point.
- [x] **0.2 Work on a branch** (recommended)
  1. `git checkout -b feedback-updates`.
  2. Commit after each item, so each fix has its own commit link for REPORT.md.
  3. When a batch is done, push (`git push -u origin feedback-updates`), open a pull request on GitHub, and merge it into `main`. Render and Vercel normally redeploy from `main`, so merging is what ships the fixes.
- [x] **0.3 Make sure the app runs before changing anything**
  1. Run the [smoke test](#appendix-b-smoke-test) once. If it fails now, fix that first, or you won't know which change broke it.
  2. Write down `node -v` and `psql --version`. You need both for R1.

---

## Batch 1: README

### R1 · Name the Node and PostgreSQL versions · S

- [x] **Steps**
  1. Open `README.md`. Find the Prerequisites list (lines 18-19):
     ```md
     - Node.js
     - PostgreSQL
     ```
  2. Replace those two lines with your real versions, for example:
     ```md
     - Node.js 24 (tested with v24.x.x; Vite 8 needs at least 20.19, or 22.13 on the 22 line)
     - PostgreSQL 18 (16 or newer works)
     ```
     Use the `node -v` and `psql --version` numbers from step 0.3.
  3. Make the same change to the bare "Node.js" line in `docs/local-development.md` (line 25, under "## 1. Prerequisites") and `docs/architecture.md` (line 48).
  4. Optional: add an `engines` field to **both** `client/package.json` and `server/package.json`, right after `"type": "module",`:
     ```json
     "engines": {
       "node": "^20.19.0 || ^22.13.0 || >=24"
     },
     ```
     npm then warns anyone installing with an older Node.
- [x] **Verify**
  1. Preview `README.md` (in VS Code: Ctrl+Shift+V). The versions show under Prerequisites.
  2. If you did step 4: run `npm install` in both folders. There should be no new errors.
- [x] **Commit:** `docs: name Node and PostgreSQL versions in prerequisites`

### R2 · Create the database before `npm run migrate` · S

- [x] **Steps**
  1. In `README.md`, find "### Set up and seed the database" (around line 63). The code block starts with `npm run migrate`.
  2. Above that code block, add:
     ````md
     First create an empty database. The name must match `PGDATABASE` in `server/.env`:

     ```powershell
     psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE pokefolio;"
     ```

     If `npm run migrate` later prints `database "pokefolio" does not exist`, this step was skipped.
     For the full walkthrough with checks, see [docs/local-development.md §3](docs/local-development.md#3-create-the-local-postgresql-database).

     Then, from `server\`:
     ````
  3. Remove the old "From `server\`:" line above the block if it's now duplicated.
- [x] **Verify** (uses a throwaway database, so your real one is untouched)
  1. `psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE pokefolio_readme_test;"`
  2. In PowerShell, from `server\`: `$env:PGDATABASE="pokefolio_readme_test"; npm run migrate`. Expect `Database schema is ready.`
  3. `Remove-Item Env:PGDATABASE`
  4. `psql -U postgres -h localhost -p 5432 -c "DROP DATABASE pokefolio_readme_test;"`
  5. After pushing, click the §3 link on GitHub. It should jump to "3. Create the Local PostgreSQL Database".
- [x] **Commit:** `docs: explain creating the pokefolio database before migrating`

### R3 · Fix the AI badge link and the API-key prerequisite · S

- [x] **Steps**
  1. `README.md` line 2: change `(docs/AI-USAGE.md)` to `(AI-USAGE.md)`. The file lives in the repo root.
  2. `README.md` line 20: replace
     ```md
     - A [Pokémon TCG API Developer Portal](https://dev.pokemontcg.io/) API key
     ```
     with
     ```md
     - An existing Pokémon TCG API key, only needed for `npm run seed` (new registrations are closed; see [Pokémon TCG API Attribution](#pokémon-tcg-api-attribution) below)
     ```
  3. The deprecation notice sits under the "## Pokémon TCG API Attribution" heading (line 247), so the link points at that heading's anchor.
- [x] **Verify:** after pushing, click the badge and the new link on GitHub. Both land in the right place.
- [x] **Commit:** `docs: fix AI-USAGE badge link and API key prerequisite`

---

## Batch 2: Small fixes

Run the [smoke test](#appendix-b-smoke-test) after each item, and commit each one separately. (S1–S4 were combined into one commit, and so were X2 and D1.)

### S1 · Remove the leftover comment · S

- [x] **Steps**
  1. `server/server.js` line 146: delete `    // REPLACE THE EXISTING QUERY HERE`.
- [x] **Verify:** `npm run dev` in `server/` starts, and a set page still lists cards.
- [x] **Commit:** combined into one S1–S4 commit, `fix: card sort, JSON error responses and delete check (S1–S4)`

### S2 · Fix the `/api/cards` sort for numbers like `TG01` · S

- [x] **Steps**
  1. Load the [test data](#appendix-a-test-data) and reproduce the bug first: `curl.exe -i "localhost:5000/api/cards?set=zztest"` returns `500`.
  2. `server/server.js` line 162: replace
     ```sql
     ORDER BY set_id, number::integer;
     ```
     with
     ```sql
     ORDER BY set_id,
       substring(number from '^[^0-9]*'),
       substring(number from '[0-9]+')::int,
       number;
     ```
     Type `[0-9]`, not `\d`. Inside a JavaScript template string, `\d` becomes a plain `d`.
  3. Restart the server.
- [x] **Verify**
  1. `curl.exe "localhost:5000/api/cards?set=zztest"` returns 200, ordered `1, 2, 10, TG01`.
  2. `curl.exe -i localhost:5000/api/cards` returns 200.
  3. In the browser, Base Set still lists 1, 2, 3 …, and search still works.
  4. Remove the test data ([Appendix A](#appendix-a-test-data)).
- [x] **Commit:** combined into one S1–S4 commit, `fix: card sort, JSON error responses and delete check (S1–S4)`
- Note this one down for P6: symptom (500 on a `TG01` card), cause (`number::integer` cast), fix, and this commit.

### S3 · JSON 404 fallback and error handler · S

- [x] **Steps**
  1. Reproduce first: `curl.exe -i localhost:5000/api/nope` returns HTML ("Cannot GET /api/nope").
  2. In `server/server.js`, find the "Start Server" comment block (line 1481). Directly **above** it, add:
     ```js
     // -----------------------------------------------------------------------------
     // Fallbacks
     // -----------------------------------------------------------------------------

     app.use((req, res) => {
       res.status(404).json({ error: "Not found" });
     });

     // eslint-disable-next-line no-unused-vars
     app.use((error, req, res, next) => {
       if (error.type === "entity.parse.failed") {
         return res.status(400).json({ error: "Request body must be valid JSON" });
       }

       console.error("Unhandled error:", error);
       res.status(500).json({ error: "Something went wrong" });
     });
     ```
     Express only treats it as an error handler if it has all four parameters, so keep `next` even though it's unused.
     Done without the `eslint-disable` line: the server has no ESLint setup, so the comment would have no effect.
  3. Restart the server.
- [x] **Verify**
  1. `curl.exe -i localhost:5000/api/nope` returns `404` with `{"error":"Not found"}`.
  2. Bad JSON returns a JSON 400 with no stack trace:
     ```powershell
     curl.exe -i -X POST localhost:5000/api/binder/cards -H "X-Anon-Id: 11111111-1111-4111-8111-111111111111" -H "Content-Type: application/json" -d "{bad"
     ```
  3. Run the smoke test.
- [x] **Commit:** combined into one S1–S4 commit, `fix: card sort, JSON error responses and delete check (S1–S4)`

### S4 · Use `rowCount` for deletes · S

- [x] **Steps**
  1. `server/server.js` lines 654-664, in `app.delete("/api/binder/cards/:cardId", …)`. Change the query from
     ```sql
     DELETE FROM binder_cards
     WHERE anon_id = $1
       AND card_id = $2
     RETURNING id;
     ```
     to
     ```sql
     DELETE FROM binder_cards
     WHERE anon_id = $1
       AND card_id = $2;
     ```
  2. Change `if (result.rows.length === 0) {` (line 664) to `if (result.rowCount === 0) {`.
  3. Leave the spread delete (lines 1044-1153) as it is. It checks with a `SELECT` first.
- [x] **Verify**
  1. In the browser, remove a card from the binder. It disappears.
  2. Send the same delete again; it returns 404 "Card is not in the binder":
     ```powershell
     curl.exe -i -X DELETE localhost:5000/api/binder/cards/<cardId> -H "X-Anon-Id: <your anon id>"
     ```
     Your anon id is in DevTools → Application → Local Storage.
- [x] **Commit:** combined into one S1–S4 commit, `fix: card sort, JSON error responses and delete check (S1–S4)`

### C1 · Fix the `/binder?spreadId=` deep link · S

- [x] **Steps**
  1. `client/src/pages/Binder/Binder.jsx` lines 108-112. Replace
     ```js
     const spreadIdNum = Number(spreadParam);
     if (binder.spreads.some(s => s.id === spreadIdNum)) {
       setSelectedSpreadId(spreadIdNum);
     }
     ```
     with
     ```js
     const match = binder.spreads.find((spread) => String(spread.id) === spreadParam);
     if (match) {
       setSelectedSpreadId(match.id);
     }
     ```
     Spread ids come from Postgres as strings (`"2"`), so comparing with `Number(...)` never matched.
- [x] **Verify**
  1. In Customize, click "+ Add Spread".
  2. DevTools → Network → the `binder` request → copy the second spread's `id`.
  3. Open `/binder?spreadId=<that id>`. The indicator shows "2 / 2".
  4. The ← / → buttons still work. In `client/`, `npm run lint` and `npm run build` pass.
- [x] **Commit:** `fix: match spreadId deep link against string ids`

### C2 · Keep Add Card on the spread being viewed · S

Found while testing C1. Not in the professor's feedback.

- [x] **Steps**
  1. `client/src/pages/Binder/getNextAvailableSlot.js`: search the spread being viewed first (the slots after the target, then earlier gaps on the same spread), then later spreads only. Never wrap back to an earlier spread. Return `"NEW_SPREAD"` when nothing is left.
  2. `client/src/pages/Binder/Binder.jsx`: send ← / → through a `goToSpread` helper that also moves the open Add Card target to the new spread.
  3. `client/src/pages/Binder/AddCardPicker.jsx`: hide the new-spread prompt when the target moves to a real slot.
- [x] **Verify**
  1. On the last spread, open Add Card and add several cards in a row. They all land on that spread.
  2. Open Add Card on 1 / 3, press → twice with the picker open, and add a card. It lands on 3 / 3 and the view stays there.
  3. Leave a gap early on a spread and add cards after it. The gap is filled before the picker moves to the next spread.
  4. Fill the last spread, then add one more card. The new-spread prompt appears; nothing lands on 1 / 3.
  5. In `client/`, `npm run lint` and `npm run build` pass.
- [x] **Commit:** `fix: keep Add Card on the spread being viewed`
- Good P6 candidate: symptom (cards added while viewing one spread landed on another), cause (the picker's target was set once when it opened, and the slot search wrapped back to spread 1), change, and this commit.

### X2 · Show set icons in the Add Card filters · S

- [x] **Steps**
  1. `client/src/pages/Binder/AddCardPicker.jsx` lines 295-297. Replace
     ```jsx
     {set.logo ? (
       <img src={set.logo} alt="" className="add-card-filter-icon" />
     ) : null}
     ```
     with
     ```jsx
     {set.symbol_url ? (
       <img src={set.symbol_url} alt="" className="add-card-filter-icon" />
     ) : null}
     ```
- [x] **Verify:** in the Binder, open Add Card. Each set filter button shows a small set symbol. `npm run lint` passes.
- [x] **Commit:** combined into one X2 + D1 commit, `fix: Add Card set symbols and npm audit advisories (X2, D1)`

### D1 · Clear the `npm audit` advisories · S

- [x] **Steps: client**
  1. In `client/`: `npm audit fix` (without `--force`).
  2. `npm audit` should print "found 0 vulnerabilities".
- [x] **Steps: server** (`npm audit fix` won't clear these; they come from nodemon)
  1. In `server/`: `npm uninstall nodemon`.
  2. In `server/package.json`, change `"dev": "nodemon server.js"` to `"dev": "node --watch server.js"`.
  3. `npm audit fix`, then `npm audit`. It should print "found 0 vulnerabilities".
  4. Update the docs that mention Nodemon:
     - `docs/local-development.md` line 540: change the heading "### Start Express with Nodemon" to "### Start Express in watch mode", and update the text under it.
     - `docs/architecture.md` line 58: change "- Nodemon" to "- Node's built-in `--watch` mode".
- [x] **Verify**
  1. In `client/`, `npm run lint` and `npm run build` pass.
  2. In `server/`, run `npm run dev`, save `server.js` without changes, and check that it restarts.
  3. Run the smoke test.
- [x] **Commit:** combined into one X2 + D1 commit, `fix: Add Card set symbols and npm audit advisories (X2, D1)`

---

## Batch 3: Deployment

These fix the deployed app needing several refreshes on its first load. H1 is the important one.

H1, H2 and H4, and the `/api/ping` route for H3, were combined into one commit: `fix: keep the API usable through Render and Neon sleeps (H1–H4)`. Three things were done differently from the steps below, each noted under its item.

**Checked 2026-10-10 against a local PostgreSQL 16:** with the current `server/db.js`, restarting the database while the server was idle crashed the Node process (exit 1). With the H1 change it logged `Idle database client error: terminating connection…`, kept running, and `/api/health` returned ok right after. Neon suspending has the same effect as that restart. The S2 sort, the S3 handlers and the T1 test file below were also run there: the sort gave `1, 2, 10, GG01, GG10, TG01`, the handlers returned JSON 404/400, and all three tests passed.

### H1 · Stop the server crashing when Neon drops idle connections · S

- [x] **Steps**
  1. Optional, to confirm the cause first: in the Render dashboard, open the service → **Logs**. Look for `Connection terminated unexpectedly` (or another `pg` error) followed by the server starting again.
  2. In `server/db.js`, replace
     ```js
     export const pool = new Pool();
     ```
     with
     ```js
     export const pool = new Pool({
       // Close idle connections before Neon drops them when it suspends.
       idleTimeoutMillis: 30_000,
       // Give a sleeping Neon database time to wake up, but not forever.
       connectionTimeoutMillis: 10_000,
     });

     // Without this listener, an error on an idle connection crashes the
     // whole Node process (and Render then cold-starts it again).
     pool.on("error", (error) => {
       console.error("Idle database client error:", error.message);
     });
     ```
     **Done differently:** without `idleTimeoutMillis: 30_000`. pg already closes idle connections after 10 seconds by default, so 30 seconds would keep them open longer, not shorter.
- [x] **Verify locally**
  1. Start the server with `npm run dev` and call `curl.exe localhost:5000/api/health` once.
  2. Restart PostgreSQL. On Windows, use the Services app → `postgresql-x64-18` → Restart. In Codespaces/Docker, use `docker restart pokefolio-db`.
  3. Check the server terminal. It logs "Idle database client error" (or nothing), and it does **not** exit.
  4. `curl.exe localhost:5000/api/health` returns `"status":"ok"` again.

  Checked 2026-10-11 by ending the server's idle connection from the database side (`pg_terminate_backend`): the old `db.js` crashed the process (exit 1), the new one logged `Idle database client error` and kept serving. An unreachable database now gives a 503 after 10 seconds instead of hanging.
- [ ] **Verify on Render** (after merging to `main` and Render redeploying)
  1. Leave the app alone for 20+ minutes, then open it.
  2. The first load is still slow while the server wakes up, but the logs show no crash and restart.
- [x] **Commit:** combined into one H1–H4 commit, `fix: keep the API usable through Render and Neon sleeps (H1–H4)`

### H2 · Client retries the first load while the server wakes up · S

- [x] **Steps**
  1. In `client/src/lib/api.js`, replace the whole `apiRequest` function (lines 6-39) with:
     ```js
     // Render's free tier sleeps when idle, so the first request after a pause
     // can fail with a network error or a 502/503/504 while it wakes up.
     const RETRY_DELAYS_MS = [2000, 4000, 8000, 16000];
     const RETRYABLE_STATUSES = [502, 503, 504];

     function wait(ms) {
       return new Promise((resolve) => setTimeout(resolve, ms));
     }

     async function apiRequest(endpoint, { onRetry, retry, ...options } = {}) {
       const anonId = getAnonId();
       const method = (options.method || "GET").toUpperCase();
       // Only retry requests that are safe to repeat.
       const retryDelays = method === "GET" || retry ? RETRY_DELAYS_MS : [];

       for (let attempt = 0; ; attempt++) {
         let response;

         try {
           response = await fetch(`${API_BASE_URL}${endpoint}`, {
             ...options,
             headers: {
               "Content-Type": "application/json",
               "X-Anon-Id": anonId,
               ...options.headers,
             },
           });
         } catch (error) {
           // fetch only throws on network failures (server asleep, offline).
           if (attempt < retryDelays.length) {
             onRetry?.(attempt + 1);
             await wait(retryDelays[attempt]);
             continue;
           }
           throw error;
         }

         if (RETRYABLE_STATUSES.includes(response.status) && attempt < retryDelays.length) {
           onRetry?.(attempt + 1);
           await wait(retryDelays[attempt]);
           continue;
         }

         if (!response.ok) {
           let errorMessage = `Request failed with status ${response.status}`;

           try {
             const errorData = await response.json();

             if (errorData.error) {
               errorMessage = errorData.error;
             }
           } catch {
             // Keep the default error message if the response is not JSON.
           }

           throw new Error(errorMessage);
         }

         if (response.status === 204) {
           return null;
         }

         return response.json();
       }
     }
     ```
  2. In the same file, let `getSets` pass a retry callback through:
     ```js
     export async function getSets({ onRetry } = {}) {
       return apiRequest("/sets", { onRetry });
     }
     ```
  3. `initializeBinder` is a POST, so it won't retry by default. The server's initialize route is safe to repeat (it was checked as idempotent), so let it retry. Add `retry: true` to its options object, next to `method: "POST"`.
  4. In `client/src/pages/Explore/Explore.jsx`:
     1. Add a state next to the others (line 18): `const [isWakingUp, setIsWakingUp] = useState(false);`
     2. Line 40: change `getSets()` to `getSets({ onRetry: () => setIsWakingUp(true) })`.
     3. Lines 122-124: replace the subtitle text with
        ```jsx
        <p className="poke-initial-loader-subtitle">
          {isWakingUp ? "Waking up the server…" : "Your Digital Pokémon TCG Binder"}
        </p>
        ```
     4. Find the "Loading sets..." line (line 143) and make it `{isWakingUp ? "Waking up the server…" : "Loading sets..."}`, so later visits to Explore show it too.

     **Done differently:**
     - `RETRY_DELAYS_MS` is `[2000, 4000, 8000, 16000, 30000]`, about 60 seconds in total, because Render says waking a free service takes about a minute.
     - Explore also shows "Waking up the server…" when the request takes longer than 4 seconds, because Render may hold the first request open while it wakes instead of failing it.
- [ ] **Verify**
  1. Stop the local server. Open `localhost:5173/explore`, then start the server within about 40 seconds. The loader says "Waking up the server…" and the page loads on its own, without a refresh.
  2. With the server down the whole time, the error message appears after about 60 seconds (2 + 4 + 8 + 16 + 30).
  3. With the server running normally, nothing looks different.
  4. `npm run lint` and `npm run build` pass. Then run the smoke test.
  5. After deploying: open the live site after 20+ minutes idle. It should load without a refresh, just slowly.

  Steps 1–4 passed locally on 2026-10-11, plus: the Binder recovers on its own once the server is back, and card writes fail at once instead of retrying. Tick this box after step 5.
- [x] **Commit:** combined into one H1–H4 commit, `fix: keep the API usable through Render and Neon sleeps (H1–H4)`

### H3 · Keep Render and Neon awake (optional, no code) · S

**Done differently:** ping the new `GET /api/ping`, not `/api/health`. `/api/health` runs `SELECT 1`, so pinging it every 10 minutes would also keep Neon awake about half of every hour: roughly 91 of the free plan's 100 CU-hours a month before any real use, and hitting the cap suspends the database. `/api/ping` keeps only Render awake. Neon still sleeps, wakes in about a second, and H1 stops its dropped connections from crashing the server.

- [ ] **Steps**
  1. Check Render's and Neon's free-tier terms and usage limits first. Render's 750 free hours a month are shared by every free service in the workspace, and one always-on service uses about 730 of them. Only set this up if PokeFolio is your only free Render service.
  2. Create a free monitor at UptimeRobot or cron-job.org:
     - URL: `https://<your-render-app>.onrender.com/api/ping`
     - Method: GET, every 10 minutes (Render spins a free service down after 15 minutes without traffic)
  3. After a few days, check Render's free-hour usage and Neon's compute usage. Neon's should stay low.
- [ ] **Verify:** after an hour without visitors, the first load is fast. The monitor shows "up".
- The `/api/ping` route is in the H1–H4 commit. The monitor itself needs no commit; mention it in REPORT.md's latest week.

---

## Batch 4: Security checklist

### X1 · Correct `docs/SECURITY-CHECKLIST.md` · S

Do this after S3, so item 25 is true.

- [x] **Steps**
  1. **Item 25** (line 51): its evidence only mentions the route `catch` blocks. Add that malformed JSON and unknown routes now also return generic JSON, from the fallback handlers added in S3, and link that commit.
  2. **Item 30** (line 61): `client/src/assets/hero.png` no longer exists (deleted in `2b86a85`). Replace it with the assets that do exist, such as `client/public/icons.svg` and `client/src/assets/pokefolio-logo.svg`. Either add their credits to the README and mark the item "Yes", or keep it "No" with an accurate reason.
  3. **"📝 To complete your assignment"** (lines 66-70): this is leftover generated text. It claims CORS was fixed and an access layer added, and neither is true (`server/server.js:12` is still `app.use(cors())`). Delete the section, or rewrite it in your own words to say only what you actually changed.
  4. Re-read every "Yes" row and check it against the code.
- [x] **Verify:** every claim in the file matches the code at your latest commit.

Done on 2026-10-11. Beyond steps 1–4:
- Item 30: the last two Vite template icons (`client/public/favicon.svg`, `icons.svg`) were unused, so they were removed rather than credited. The README now credits the Outfit font (SIL Open Font License) and says card images still load from `images.pokemontcg.io`.
- Item 23 is now **Partly**: `PUT /api/preferences` still accepts any colour or theme string, and a `null` position is stored as 0 (S5).
- Items 12 and 31 were answered with the GitHub API: secret scanning and push protection are on, and the repository is public.
- Item 27 no longer prints the email address it is about. Decided on 2026-10-11 to keep the address in the existing history for now: removing it would mean rewriting every commit and breaking the commit links in `REPORT.md`.
- Item 1's `.gitignore` line numbers were corrected (69–71).
- The leftover section was replaced with "Anything I found and fixed", listing only real changes and what is still open.
- [x] **Commit:** `docs: correct security checklist to match the code`

---

## Batch 5: REPORT.md

Do this last, so you can link this week's commits and "What is left" is accurate. Before starting, run `git log --oneline --date=short --format="%h %ad %s"` and keep the output open.

### P1 · Newest week first · S

- [ ] **Steps**
  1. Record the word count first: `(Get-Content REPORT.md | Measure-Object -Word).Words`.
  2. Reverse the week sections. The headings are at lines 3, 43, 89, 133 and 169. Cut each "## Week of: …" block (from its heading to just before the next one) and paste them in reverse order. September 21–27 ends up first and August 10–16 last.
  3. Optional: make each "Week of" heading `##` and its subsections (`My goal this week`, `What I did`, …) `###`, so the outline isn't flat.
- [ ] **Verify:** the Markdown preview reads newest → oldest. The word count matches step 1 (plus or minus any heading changes).
- [ ] **Commit:** `docs: order REPORT newest week first`

### P2 · Entry for the latest week · M

- [ ] **Steps**
  1. Add a new section at the top, for example `## Week of: September 28 – October 11, 2026`. Pick dates that cover your newest commits.
  2. The first line under it: `Since my last report: …` in one or two sentences.
  3. Use these subsections: My goal this week, What I did, What blocked me (P6), What I checked (P5), What is left (P7).
  4. Under "What I did", list each change with a commit link (format in P3):
     - AI-USAGE.md moved to the repo root and expanded (`c1e1178`, 2026-10-04)
     - README note on AI assistance (`6f64651`, 2026-10-05)
     - Each item from this checklist that you finished this week, with its own commit
     - H3 if you set up the pinger (no commit; say what you set up)
  5. Check the dates. The palettes/logo commit (`2b86a85`) is from 09-26 and the screenshots commit (`9756257`) is from 09-27, so they belong to September 21–27. Add the screenshots to that week, which already mentions the palettes (line 195).
- [ ] **Verify:** every bullet has a commit link, and each commit's date falls inside its week heading.
- [ ] **Commit:** `docs: add latest week to REPORT`

### P3 · Link commits · S

- [ ] **Steps**
  1. Link format: `[2b86a85](https://github.com/lanixiligan/pokefolio/commit/2b86a85)`
  2. Add links where the report already describes the work:

     | Work | Commit | Line in REPORT (before P1 reorder) |
     | --- | --- | --- |
     | Crown Zenith added to the importer | `29c28e7` | 187 |
     | New palettes and logo | `2b86a85` | 195 |
     | MIT License | `896fc01` | 193 |
     | README revised for course requirements | `4ef3305` | 179 |
     | REPORT.md added | `0790296` | 181 |
     | Add Card spread auto-advance fix | `9981bdf` | 141 |
     | Set Browser grid and debounced search | `98ebe68` | 143 |
     | Vercel rewrites; server listens on all interfaces | `508aca0`, `2388c1f` | 67 |
     | Screenshots | `9756257` | add to Sept 21–27 (see P2) |
- [ ] **Verify:** after pushing, click every link on GitHub.
- [ ] **Commit:** `docs: link commits in REPORT`

### P4 · Replace "polish" with named changes · S

- [ ] **Steps**
  1. Line 185 ("Continued frontend cleanup and polish…"): replace it with two or three real changes, each linked. Pick from:
     - Customize got its own Accent colour picker (`29c28e7`)
     - The Binder toolbar's text buttons became icon buttons with labels and tooltips (`29c28e7`)
     - The Set Browser reveal animation is skipped when the OS asks for reduced motion (`29c28e7`)
     - New Quick Styles Aurora and Crimson, the new logo as favicon, and unused template images removed (`2b86a85`)
     - The Add Card slot logic moved into `getNextAvailableSlot.js` (`29c28e7`)
  2. Give line 147 the same treatment.
- [ ] **Verify:** open each linked commit on GitHub and check that the change is in its diff.
- [ ] **Commit:** `docs: name specific frontend changes in REPORT`

### P5 · What you checked after the re-import · S

- [ ] **Steps**
  1. If you remember what you checked, write it after line 189. If not, re-run it at home (it needs your API key) and record the results:
     1. `npm run seed`: one JSON line per set, each with `"status":"succeeded"` and `"countsMatch":true`.
     2. `npm run db:check`: all six set ids, with counts adding up to 977.
     3. Crown Zenith shows on Explore. Open it, search for a card, and add it to the binder.
  2. Write it as: the commands, the numbers they showed, and what you looked at in the browser.
- [ ] **Commit:** `docs: record re-import checks in REPORT`

### P6 · One concrete build problem and what you did · S

- [ ] **Steps**
  1. Pick one. The easiest is S2 (you just did it) or H1/H2 (the deployed app needing several refreshes).
  2. Write it in four short parts: **symptom** → **cause** → **change** → **commit link**. For example, for S2: "`/api/cards` returned 500 when a card was numbered TG01 → the SQL cast every number to an integer → sort by prefix, then number → `<commit>`".
  3. Expand the existing Add Card auto-advance note (line 157) the same way if you want a second example.
- [ ] **Commit:** can go in with P2.

### P7 · "What is left", including the 2027 cutoff · M

- [ ] **Steps**
  1. At the end of the new entry, add `### What is left` with three short parts:
     1. **Known problems:** everything from this checklist that's still unticked when you write it. For example:
        - no automated tests or CI (T1, T2)
        - CORS open to every origin (`server/server.js:12`)
        - no access gate on the deployed app (SECURITY-CHECKLIST items 18 and 21)
        - the cold start on the free Render plan (if you skipped H3)
     2. **Before the demo:** what you commit to finishing.
     3. **2027 cutoff:** two or three sentences from A1. For example: the app reads its catalog from PostgreSQL, so it keeps working after March 1, 2027; you've backed up the catalog; re-importing or adding sets would need the importer ported to Scrydex.
- [ ] **Verify:** nothing listed is already fixed, and everything open is listed.
- [ ] **Commit:** with P2, or `docs: add What is left to REPORT`

---

## Batch 6: Catalog backup

### A1 · Back up the catalog now · S (Scrydex port is in Batch 8)

- [ ] **Steps** (at home, against your real local database)
  1. From any folder outside the repo:
     ```powershell
     pg_dump -U postgres -h localhost --data-only -t sets -t cards -f pokefolio-catalog.sql pokefolio
     ```
     Use `-f`, not `>`. In Windows PowerShell 5.1, `>` writes UTF-16, which `psql` can't read back.
  2. Keep the file outside git, unless the card data's terms allow publishing it.
  3. Optional: also back up the deployed Neon database. In the Neon console you can create a branch (a point-in-time copy), or run the same `pg_dump` with your Neon connection string.
- [ ] **Verify** (restore into a scratch database)
  1. `psql -U postgres -h localhost -c "CREATE DATABASE pokefolio_restore_test;"`
  2. From `server\`: `$env:PGDATABASE="pokefolio_restore_test"; npm run migrate`
  3. `psql -U postgres -h localhost -d pokefolio_restore_test -f pokefolio-catalog.sql`
  4. `npm run db:check` shows six sets and 977 cards.
  5. `Remove-Item Env:PGDATABASE`, then `psql -U postgres -h localhost -c "DROP DATABASE pokefolio_restore_test;"`
- No commit. Mention it in P7.

---

## Batch 7: If there's time before the demo

### S5 · Stricter request-body validation · M

- [ ] **Steps: preferences** (`PUT /api/preferences`, `server/server.js:1366-1392`)
  1. Above the route, add:
     ```js
     const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
     const THEMES = ["classic", "midnight", "sunrise"];
     ```
     3-digit hex is allowed on purpose: the Customize HEX field sends `#abc` when you type three characters. The three themes are the ones in `client/src/pages/Binder/Binder.css:192-207`.
  2. After the existing `typeof … !== "string"` check, add:
     ```js
     if (
       !HEX_COLOR.test(background) ||
       !HEX_COLOR.test(binderColor) ||
       !HEX_COLOR.test(accentColor)
     ) {
       return res.status(400).json({
         error: "Colors must be hex values like #1a2b3c",
       });
     }

     if (!THEMES.includes(theme)) {
       return res.status(400).json({
         error: `theme must be one of: ${THEMES.join(", ")}`,
       });
     }
     ```
- [ ] **Steps: binder bodies**
  1. Add a helper near `requireAnonId`:
     ```js
     // Accepts real integers and numeric strings (BIGINT ids arrive as "2"),
     // but not null, booleans or empty strings, which Number() turns into 0/1.
     function toInteger(value) {
       if (typeof value === "number") {
         return Number.isInteger(value) ? value : null;
       }
       if (typeof value === "string" && /^[0-9]+$/.test(value)) {
         return Number(value);
       }
       return null;
     }
     ```
  2. In `POST /api/binder/cards` (lines 432-460), move the validation **before** `await client.query("BEGIN")`, and before `pool.connect()` if you can, so a bad body never takes the lock. Use `toInteger` for `spreadId`, `pageSide` and `position`, and return 400 when any of them is `null` or `cardId` isn't a string.
  3. In `PATCH /api/binder/cards/:cardId` (lines 694-698), replace the three `Number(...)` calls with `toInteger(...)`. The existing range checks then reject `null`.
- [ ] **Verify**
  1. These return 400, and nothing changes in the database:
     ```powershell
     curl.exe -i -X PUT localhost:5000/api/preferences -H "X-Anon-Id: <id>" -H "Content-Type: application/json" -d '{\"background\":\"red\",\"binderColor\":\"#172235\",\"accentColor\":\"#3368A0\",\"theme\":\"midnight\",\"gridSize\":3}'
     ```
     Then try `"theme":"zzz"`, and a binder move with `"position":null`.
  2. In the UI, apply each Quick Style, save, and reload. The choice persists.
  3. Type `abc` into a HEX field and save. The save succeeds.
  4. Adding cards (from Card Details and from Add Card), dragging, moving and swapping all still work.
- [ ] **Commit:** `feat: validate preference colors, theme and binder positions`

### H4 · Lazy-load card images in the Set Browser · S

- [x] **Steps**
  1. `client/src/pages/SetBrowser/CardTile.jsx`, the `<img className="card-tile-image" …>` (around line 50). Add `loading="lazy"` after `alt={card.name}`.
- [x] **Verify:** DevTools → Network → Img, then open a big set (Base Set or Paldean Fates). Images load as you scroll, not all at once. The reveal animation still plays.
- [x] **Commit:** combined into one H1–H4 commit, `fix: keep the API usable through Render and Neon sleeps (H1–H4)`

### T1 · Server tests · L

- [ ] **Steps: one-time setup**
  1. Create the test database: `psql -U postgres -h localhost -c "CREATE DATABASE pokefolio_test;"`
  2. Migrate it: from `server\`, `$env:PGDATABASE="pokefolio_test"; npm run migrate; Remove-Item Env:PGDATABASE`
  3. In `server/package.json` scripts, add `"test": "node --test"`.
- [ ] **Steps: write the test** as `server/test/binder.test.js`. This is a working starting point; ask Claude Code to extend it to the full list below.
  ```js
  import { test, before, after } from "node:test";
  import assert from "node:assert/strict";
  import { spawn } from "node:child_process";
  import { randomUUID } from "node:crypto";
  import { fileURLToPath } from "node:url";
  import { dirname, resolve } from "node:path";
  import pg from "pg";

  const serverDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const PORT = 5099;
  const BASE = `http://localhost:${PORT}/api`;
  const DATABASE = process.env.PGDATABASE_TEST || "pokefolio_test";

  let serverProcess;
  let db;

  async function api(anonId, path, options = {}) {
    const response = await fetch(`${BASE}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", "X-Anon-Id": anonId },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : null };
  }

  function binderCards(binder) {
    return binder.spreads.flatMap((spread) =>
      spread.pages.flatMap((page) =>
        page.cards.map((slot) => ({
          spreadId: spread.id,
          side: page.side,
          position: slot.position,
          cardId: slot.card.id,
        }))
      )
    );
  }

  async function newBinder() {
    const anonId = randomUUID();
    await api(anonId, "/binder/initialize", { method: "POST" });
    const { body } = await api(anonId, "/binder");
    return { anonId, spreadId: body.spreads[0].id };
  }

  before(async () => {
    db = new pg.Client({ database: DATABASE });
    await db.connect();
    await db.query(`
      INSERT INTO sets (id, name, series, printed_total, total, release_date, logo_url, symbol_url)
      VALUES ('zztest', 'Test Set', 'Test', 20, 20, '2020-01-01', 'x', 'x')
      ON CONFLICT DO NOTHING`);
    for (let i = 1; i <= 20; i++) {
      await db.query(
        `INSERT INTO cards (id, set_id, name, supertype, number, image_small_url, image_large_url)
         VALUES ($1, 'zztest', $2, 'Pokemon', $3, 's', 'l') ON CONFLICT DO NOTHING`,
        [`zztest-${i}`, `Card ${i}`, String(i)]
      );
    }

    serverProcess = spawn(process.execPath, ["server.js"], {
      cwd: serverDir,
      env: { ...process.env, PORT: String(PORT), PGDATABASE: DATABASE },
      stdio: "ignore",
    });

    for (let i = 0; i < 50; i++) {
      try {
        const response = await fetch(`${BASE}/health`);
        if (response.ok) return;
      } catch {
        // not up yet
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    throw new Error("Server did not start");
  });

  after(async () => {
    serverProcess?.kill();
    await db.query("DELETE FROM binder_cards WHERE card_id LIKE 'zztest-%'");
    await db.end();
  });

  test("adds a card, then rejects a duplicate and an occupied slot", async () => {
    const { anonId, spreadId } = await newBinder();

    const added = await api(anonId, "/binder/cards", {
      method: "POST",
      body: { cardId: "zztest-1", spreadId, pageSide: 1, position: 0 },
    });
    assert.equal(added.status, 201);

    const duplicate = await api(anonId, "/binder/cards", {
      method: "POST",
      body: { cardId: "zztest-1", spreadId, pageSide: 1, position: 1 },
    });
    assert.equal(duplicate.status, 409);

    const occupied = await api(anonId, "/binder/cards", {
      method: "POST",
      body: { cardId: "zztest-2", spreadId, pageSide: 1, position: 0 },
    });
    assert.equal(occupied.status, 409);
  });

  test("swaps two cards", async () => {
    const { anonId, spreadId } = await newBinder();
    for (const [cardId, position] of [["zztest-1", 0], ["zztest-2", 1]]) {
      await api(anonId, "/binder/cards", {
        method: "POST",
        body: { cardId, spreadId, pageSide: 1, position },
      });
    }

    const moved = await api(anonId, "/binder/cards/zztest-1", {
      method: "PATCH",
      body: { spreadId, pageSide: 1, position: 1 },
    });
    assert.equal(moved.status, 200);

    const { body } = await api(anonId, "/binder");
    const byCard = Object.fromEntries(binderCards(body).map((c) => [c.cardId, c.position]));
    assert.equal(byCard["zztest-1"], 1);
    assert.equal(byCard["zztest-2"], 0);
  });

  test("grid reflow keeps every card exactly once", async () => {
    const { anonId, spreadId } = await newBinder();
    for (let i = 1; i <= 9; i++) {
      await api(anonId, "/binder/cards", {
        method: "POST",
        body: { cardId: `zztest-${i}`, spreadId, pageSide: 1, position: i - 1 },
      });
    }

    const { body: before } = await api(anonId, "/binder");
    for (const gridSize of [2, 4, 3]) {
      const saved = await api(anonId, "/preferences", {
        method: "PUT",
        body: { ...before.preferences, gridSize },
      });
      assert.equal(saved.status, 200);

      const { body } = await api(anonId, "/binder");
      const ids = binderCards(body).map((c) => c.cardId).sort();
      assert.equal(ids.length, 9);
      assert.equal(new Set(ids).size, 9);
    }
  });
  ```
  The PATCH and PUT routes answer with plain `res.json(...)`, so their success status is 200.
- [ ] **Extend to cover**
  - a card outside the grid → 409
  - moving to an empty slot
  - deleting a spread removes its cards; deleting the last spread → 409
  - grid 2 → 4 adds spreads when needed
  - S2 (a `TG01` card sorts without a 500), S3 (unknown route → JSON 404), S5 (bad colour → 400), once those are done
- [ ] **Verify**
  1. `npm test` in `server/` passes. Locally it uses `PGUSER`, `PGPASSWORD` and the rest from your environment. If it can't connect, set them in the terminal first; the test client doesn't read `server/.env`.
  2. Break something on purpose, for example comment out the swap `UPDATE` in the PATCH route. A test should fail. Then undo it.
- [ ] **Commit:** `test: cover binder add, swap and grid reflow`

### T2 · GitHub Actions CI · M

Do D1 first: `npm ci` fails if a lockfile is out of date.

- [ ] **Steps**
  1. Create `.github/workflows/ci.yml`:
     ```yaml
     name: CI

     on:
       push:
         branches: [main]
       pull_request:

     jobs:
       client:
         runs-on: ubuntu-latest
         defaults:
           run:
             working-directory: client
         steps:
           - uses: actions/checkout@v4
           - uses: actions/setup-node@v4
             with:
               node-version: 24
               cache: npm
               cache-dependency-path: client/package-lock.json
           - run: npm ci
           - run: npm run lint
           - run: npm run build

       server:
         runs-on: ubuntu-latest
         defaults:
           run:
             working-directory: server
         services:
           postgres:
             image: postgres:18
             env:
               POSTGRES_PASSWORD: postgres
               POSTGRES_DB: pokefolio_test
             ports: ["5432:5432"]
             options: >-
               --health-cmd pg_isready
               --health-interval 5s
               --health-timeout 5s
               --health-retries 10
         env:
           PGHOST: localhost
           PGPORT: 5432
           PGUSER: postgres
           PGPASSWORD: postgres
           PGDATABASE: pokefolio_test
         steps:
           - uses: actions/checkout@v4
           - uses: actions/setup-node@v4
             with:
               node-version: 24
               cache: npm
               cache-dependency-path: server/package-lock.json
           - run: npm ci
           - run: npm run migrate
           - run: npm test
     ```
  2. No secrets are needed. The tests insert their own cards, so there's no API key.
  3. If T1 isn't done yet, commit the `client` job alone first, and add the `server` job later.
  4. `docs/SECURITY-CHECKLIST.md` items 7-12 are "N/A" because there were no workflows. Update them now that there is one. For item 11, either pin the actions to a commit SHA or explain why version tags are fine for a student project.
- [ ] **Verify**
  1. Push the branch and open the **Actions** tab on GitHub. Both jobs are green.
  2. On a throwaway branch, add an unused variable to a client file and push. The client job goes red. Delete the branch.
- [ ] **Commit:** `ci: lint, build and test on every push`

---

## Batch 8: After the course

### O1 · Move SQL into a repository layer · L (optional, only after T1)

- [ ] **Steps**
  1. Create `server/repositories/catalog.js`, `binder.js` and `preferences.js`.
  2. Move one route group at a time. Each function takes the `pool` or a transaction `client`, runs a query, and returns rows. No `req` or `res` inside.
  3. Merge the duplicates first:
     - the card column list (`server/server.js` lines 149-159 and 181-191) → one `CARD_COLUMNS` constant
     - the preferences select and snake_case → camelCase mapping (`GET /api/binder` 311-388, `GET /api/preferences` 1159-1189, `PUT /api/preferences` 1432-1468) → one `getPreferences(client, anonId)` and one `toPreferencesResponse(row)`
  4. Run `npm test` after each route group.
- [ ] **Verify:** `npm test` passes, unchanged, before and after. Then run the smoke test.
- [ ] **Commit:** one per route group, e.g. `refactor: move catalog queries into a repository`

### A1 (later) · Port the importer to Scrydex · L

- [ ] **Steps**
  1. Only if PokeFolio continues past March 1, 2027.
  2. Get a Scrydex API key. Read its docs for the set and card endpoints and field names.
  3. Copy `server/scripts/import-cards.js` to `import-cards-scrydex.js`. Change the fetch URLs and auth header, and map Scrydex's fields onto the same `sets` and `cards` columns, so nothing else in the app changes.
  4. Check where card images come from: `SELECT image_small_url FROM cards LIMIT 1;`. If they point at the old API's image host, plan for those images too.
- [ ] **Verify:** import into a scratch database. `npm run db:check` shows the same sets with matching counts, and the app works against it.

---

## Appendix A: test data

Lets you test S2 without an API key. Run in `psql -U postgres -d pokefolio` (in Codespaces: `docker exec -i pokefolio-db psql -U postgres -d pokefolio`).

```sql
INSERT INTO sets VALUES ('zztest', 'Test Set', 'Test', 4, 6, '2020-01-01', 'http://x/logo.png', 'http://x/sym.png');
INSERT INTO cards VALUES
  ('zztest-1',    'zztest', 'Pikachu', 'Pokemon', '{Lightning}', '1',    'Common', 'A', 's', 'l'),
  ('zztest-2',    'zztest', 'Pichu',   'Pokemon', '{Lightning}', '2',    'Common', 'A', 's', 'l'),
  ('zztest-10',   'zztest', 'Raichu',  'Pokemon', '{Lightning}', '10',   'Rare',   'A', 's', 'l'),
  ('zztest-TG01', 'zztest', 'Mewtwo',  'Pokemon', '{Psychic}',   'TG01', 'Rare',   'A', 's', 'l');
```

Remove it afterwards (binder rows first):

```sql
DELETE FROM binder_cards WHERE card_id LIKE 'zztest-%';
DELETE FROM cards WHERE set_id = 'zztest';
DELETE FROM sets WHERE id = 'zztest';
```

## Appendix B: smoke test

Run it after every item.

1. In `server/`: `npm run dev`. Expect "PokeFolio API running on port 5000". `curl.exe localhost:5000/api/health` returns `"status":"ok"`.
2. In `client/`: `npm run lint` and `npm run build` pass. Then `npm run dev`.
3. In the browser:
   1. Explore shows six sets. Open one and search for a name.
   2. Open a card and click Add to Binder.
   3. The Binder shows the card. Drag it to another slot.
   4. In Customize, change the grid size and save. The card is still there.
   5. Remove the card.
