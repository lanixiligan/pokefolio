## Secrets and credentials

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 1 | `.env` is gitignored and is not in the repository | **Yes** | `.gitignore` line 44 ignores `.env` and `.env.*`, and `git ls-files` confirms they are not tracked. |
| 2 | A `.env.example` with placeholder values only is committed | **Yes** | `client/.env.example` and `server/.env.example` contain only safe local defaults and placeholder values like `replace-with-your-local-postgres-password`. |
| 3 | No connection string, key, token or password is hardcoded in source, comments or commented-out code | **Yes** | I ran `grep -riE "(password\|secret\|key\|token\|postgres://)"` across the codebase and found no real secrets or hardcoded database connection strings. |
| 4 | Git history is clean: I searched `git log -p` for password, secret, api key and `postgres://` | **Yes** | I checked the entire Git history using `git log -p` and confirmed no credentials were ever committed; matching words only appear in documentation and example files. |
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
| 12 | Secret scanning and push protection are enabled on the repository | **Manual verification required** | Cannot be verified from the repository; you must check your GitHub repository settings. |

## Database

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 13 | Every query taking user input uses parameters, never string concatenation | **Yes** | I reviewed all queries in `server.js` and `import-cards.js`; all use parameterized queries (e.g. `$1` placeholders and arrays of values). |
| 14 | The database is not open to the whole internet, or is reachable only by the app | **Manual verification required** | Cannot be verified from the repository; you must check your database hosting provider's network settings. |
| 15 | The database user the app connects as has only the permissions it needs | **Manual verification required** | Cannot be verified from the repository; you must check the database user permissions in your production environment. |
| 16 | Seed and sample data is invented, not real people's data | **Yes** | `server/scripts/import-cards.js` only seeds Pokémon trading card metadata retrieved from the official API. |
| 17 | Debug, seed and reset routes are removed before going public | **Yes** | I inspected `server.js` and found only production business-logic routes; no debug, seed, or reset endpoints are exposed. |

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
| 23 | Input from the user is validated on the server, not only in the browser | **Yes** | Endpoints in `server.js` actively validate data types (e.g. `!Number.isInteger(Number(spreadId))`) and UUID formats before processing requests. |
| 24 | User-supplied text is escaped when rendered, so it cannot inject markup or script | **Yes** | The frontend uses React, which inherently escapes rendered strings, and I verified no uses of `dangerouslySetInnerHTML` exist in the `client/` directory. |
| 25 | Error responses do not expose stack traces, file paths or connection details | **Yes** | `catch` blocks in `server.js` log errors to the console internally but respond to the client with generic JSON strings (e.g. `{"error": "Failed to retrieve cards"}`). |
| 26 | CORS is not a wildcard on routes that change data | **No** | `server.js` calls `app.use(cors())` with no configuration object, which defaults to `*` (wildcard) for all routes including POST/PUT/PATCH/DELETE. |

## Repository and privacy

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 27 | No student number, personal email, phone number or home address in the repository or in commit messages | **No** | I checked `git log` and found the commit author's personal email address (`lanix.iligan@gmail.com`) exposed in the Git history. |
| 28 | No classmate's personal data in the repository | **Yes** | I searched the repository and Git history and found no mentions of other students' data. |
| 29 | Dependencies come from official registries, and `node_modules` is gitignored | **Yes** | `node_modules` is in `.gitignore`, and I confirmed `package.json` files contain only standard npm registry dependencies (no custom `git+` URLs). |
| 30 | Images, fonts and other assets are mine, licensed, or credited | **No** | `README.md` credits the Pokémon API, but does not attribute or state the license for local assets like `client/src/assets/hero.png` and `client/public/icons.svg`. |
| 31 | Repository visibility is deliberate, and I checked it after my last push | **Manual verification required** | Cannot be verified from the repository; you must check your repository settings on the hosting platform. |

***

### 📝 To complete your assignment

Based on the audit, here is a summary you can adapt for the **"Anything I found and fixed"** section of the checklist after you apply the fixes:

> This checklist caught several oversights: my backend `cors()` setup was accidentally allowing wildcard access on mutating endpoints, and I hadn't credited local image assets like `hero.png` in the README. I also realized my personal email was exposed in the Git commit history, and that my architectural decision to use an anonymous UUID meant the app fundamentally fails the "Access Control" requirements (items 18 and 21). I fixed the CORS configuration, updated the asset attributions, and applied an access layer to satisfy the requirement.

