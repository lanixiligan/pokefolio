_Last checked on 2026-10-11 against `main` at `a49878c`, with the corrections in the same commit as this update._

## Secrets and credentials

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 1 | `.env` is gitignored and is not in the repository | **Yes** | `.gitignore` lines 69–71 ignore `.env` and `.env.*` but keep `.env.example` (`!.env.example`), and `git ls-files` shows only the two `.env.example` files are tracked. |
| 2 | A `.env.example` with placeholder values only is committed | **Yes** | `client/.env.example` and `server/.env.example` contain only safe local defaults and placeholder values like `replace-with-your-local-postgres-password`. |
| 3 | No connection string, key, token or password is hardcoded in source, comments or commented-out code | **Yes** | I ran `grep -riE "(password\|secret\|key\|token\|postgres://)"` across the codebase and found no real secrets or hardcoded database connection strings. On 2026-10-11 I also searched every tracked file for the actual values of my API key and database password: no matches. |
| 4 | Git history is clean: I searched `git log -p` for password, secret, api key and `postgres://` | **Yes** | I checked the entire Git history using `git log -p` and confirmed no credentials were ever committed; matching words only appear in documentation and example files. On 2026-10-11 I also searched the whole history for the actual values of my API key and database password, and for `postgres://user:password@` connection strings: no matches. |
| 5 | Any credential that was ever committed has been rotated | **N/A** | No credentials were ever committed to the repository, so none needed rotation. |
| 6 | Production credentials live only in my hosting provider's environment settings | **Manual verification required** | Cannot be verified from the repository; you must check your hosting provider's environment settings. |

## GitHub Actions

No GitHub Actions workflows exist in the repository (`.github/workflows` directory was not found). 

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 7 | No secret value is written literally in any workflow YAML file | **N/A** | No GitHub Actions workflows exist in the repository. |
| 8 | Secrets are stored in repository Actions secrets and read with `${{ secrets.NAME }}` | **N/A** | See 7. |
| 9 | No workflow step echoes, dumps or debug-prints a secret, and I opened a recent run's log to confirm | **N/A** | See 7. |
| 10 | Uploaded build artifacts contain no `.env`, key file or generated config | **N/A** | See 7. |
| 11 | Third-party actions are pinned to a commit SHA, not a moveable tag | **N/A** | See 7. |
| 12 | Secret scanning and push protection are enabled on the repository | **Yes** | Secret scanning and push protection are both enabled (checked with the GitHub API on 2026-10-11). |

## Database

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 13 | Every query taking user input uses parameters, never string concatenation | **Yes** | I reviewed all queries in `server.js` and `import-cards.js`; all use parameterized queries (e.g. `Every query taking user input uses parameters, never string concatenation` placeholders and arrays of values). The only values built into SQL text are the placeholder numbers themselves (`Every query taking user input uses parameters, never string concatenation`, `$2`) in `GET /api/cards`; the user's search text goes into the values array. |
| 14 | The database is not open to the whole internet, or is reachable only by the app | **Manual verification required** | Cannot be verified from the repository; you must check your database hosting provider's network settings. |
| 15 | The database user the app connects as has only the permissions it needs | **Manual verification required** | Cannot be verified from the repository; you must check the database user permissions in your production environment. |
| 16 | Seed and sample data is invented, not real people's data | **Yes** | `server/scripts/import-cards.js` only seeds Pokémon trading card metadata retrieved from the official API. |
| 17 | Debug, seed and reset routes are removed before going public | **Yes** | I inspected `server.js` and found only business-logic routes plus `/api/health` and `/api/ping`. `/api/ping` exists for an uptime monitor, returns `{"status":"ok"}` and touches no data. No debug, seed, or reset endpoints are exposed. |

## Access control

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 18 | The app has an access layer: Cloudflare Zero Trust, an app-level password, or a real login | **No** | `README.md` and `docs/architecture.md` explicitly state the app has no authentication system and uses an anonymous UUID that "provides persistence, not access control." |
| 19 | If Supabase or Firebase: Row Level Security or security rules are on, and I tested it signed out | **N/A** | The project uses a standard Express + PostgreSQL backend, not Supabase or Firebase. |
| 20 | If Zero Trust: tjakoen.s@gmail.com is on the access policy. If an app password: the credentials are in my private workspace `project/README.md` | **N/A** | The app currently has no access layer (neither Zero Trust nor an app password) configured. |
| 21 | The gate covers every route, including the ones that only change data | **No** | There is no access layer to protect the routes. The `requireAnonId` middleware validates UUID format, but does not provide access control. |
| 22 | The credentials for the gate are environment variables, not in source | **N/A** | The app currently has no access layer or gate credentials to store. |

## Input and output

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 23 | Input from the user is validated on the server, not only in the browser | **Partly** | The server checks types, ranges and the `X-Anon-Id` UUID format (e.g. `!Number.isInteger(Number(spreadId))`). But `PUT /api/preferences` accepts any string as a colour or theme, and a card `position` of `null` is stored as 0; both confirmed on 2026-10-11. Stricter validation is planned (S5 in `docs/UPDATE-PLAN.md`). |
| 24 | User-supplied text is escaped when rendered, so it cannot inject markup or script | **Yes** | The frontend uses React, which inherently escapes rendered strings, and I verified no uses of `dangerouslySetInnerHTML` exist in the `client/` directory. |
| 25 | Error responses do not expose stack traces, file paths or connection details | **Yes** | Route `catch` blocks log errors on the server and send generic JSON (e.g. `{"error": "Failed to retrieve cards"}`). Since [9847a54](https://github.com/lanixiligan/pokefolio/commit/9847a54), fallback handlers also return JSON for unknown routes (404), malformed JSON (400) and any unhandled error (500), with the details only in the server log. Before that commit, malformed JSON returned an HTML page with a stack trace and server file paths. |
| 26 | CORS is not a wildcard on routes that change data | **No** | `server/server.js:12` calls `app.use(cors())` with no configuration object, which defaults to `*` (wildcard) for all routes including POST/PUT/PATCH/DELETE. |

## Repository and privacy

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 27 | No student number, personal email, phone number or home address in the repository or in commit messages | **No** | My personal email address is the author address on my commits in the Git history. Rewriting the history to remove it would change every commit hash and break the commit links in `REPORT.md`, so it stays; new commits could use GitHub's private noreply address instead. |
| 28 | No classmate's personal data in the repository | **Yes** | I searched the repository and Git history and found no mentions of other students' data. |
| 29 | Dependencies come from official registries, and `node_modules` is gitignored | **Yes** | `node_modules` is in `.gitignore`, and I confirmed `package.json` files contain only standard npm registry dependencies (no custom `git+` URLs). |
| 30 | Images, fonts and other assets are mine, licensed, or credited | **Yes** | The PokeFolio logo and the screenshots in `docs/screenshots/` were made for this project. The Outfit font (Google Fonts, SIL Open Font License) and the card images and set symbols from the Pokémon TCG API are credited in the README's License section. The unused Vite template icons (`client/public/favicon.svg`, `client/public/icons.svg`) were removed, as `hero.png` already was in [2b86a85](https://github.com/lanixiligan/pokefolio/commit/2b86a85). |
| 31 | Repository visibility is deliberate, and I checked it after my last push | **Yes** | The repository is public (checked with the GitHub API on 2026-10-11, after my last push). |

***

### Anything I found and fixed

Going through this checklist found these problems:

- **Error responses exposed internals (item 25).** Malformed JSON returned an HTML page with a stack trace and server file paths, and unknown routes returned HTML. Fixed: the server now returns JSON for unknown routes, malformed JSON and unhandled errors ([9847a54](https://github.com/lanixiligan/pokefolio/commit/9847a54)).
- **This checklist had claims the code didn't support.** An earlier version of this section said CORS was fixed and an access layer was added; neither was true. Item 30 named `hero.png`, which had already been deleted, and item 25 was marked Yes before the fix above. Corrected on 2026-10-11.
- **Unused template assets (item 30).** Removed the two leftover Vite icons, and credited the Outfit font in the README.

Still open:

- CORS allows every origin (item 26).
- There is no access gate (items 18 and 21). PokeFolio is anonymous by design, so the anonymous UUID gives each visitor their own binder but doesn't restrict who can use the app.
- Request bodies are only partly validated (item 23).
- My personal email is in the Git history (item 27).
