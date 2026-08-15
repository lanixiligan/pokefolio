# PokeFolio — Local Development

This document describes the local PostgreSQL setup and Pokémon TCG catalog import workflow used during PokeFolio development.

It covers:

- PostgreSQL setup
- Creating the local `pokefolio` database
- Configuring backend environment variables
- Running database migrations
- Importing the Pokémon TCG catalog
- Verifying the database
- Inspecting imported data
- Windows `psql` UTF-8 display configuration
- Useful development commands

> **Security:** Never commit `server/.env` or expose your PostgreSQL password or Pokémon TCG API key. Use `server/.env.example` as the public template.

---

## 1. Prerequisites

PokeFolio currently uses:

- Node.js
- npm
- PostgreSQL 18
- `psql`
- the Express backend in `server/`

Make sure PostgreSQL is installed and the PostgreSQL service is running.

### Check the PostgreSQL service

In PowerShell:

```powershell
Get-Service postgresql-x64-18
```

The service should show:

```text
Status : Running
```

If the service is stopped, start it:

```powershell
Start-Service postgresql-x64-18
```

---

## 2. Configure Backend Environment Variables

Create the local environment file:

```text
server/.env
```

The file should contain your local PostgreSQL connection settings and Pokémon TCG API key.

Example:

```env
# PostgreSQL connection settings.
PGHOST=localhost
PGPORT=5432
PGDATABASE=pokefolio
PGUSER=postgres
PGPASSWORD=your-local-postgres-password

# Backend-only Pokémon TCG API credential.
POKEMON_TCG_API_KEY=your-pokemon-tcg-api-key
```

### Pokémon TCG API key

The API key is obtained from the official Pokémon TCG Developer Portal:

https://dev.pokemontcg.io/

The real key belongs only in `server/.env`.

Do not put the real key in:

- `server/.env.example`
- `README.md`
- source code
- frontend environment variables
- screenshots
- Git commits
- public documentation

The repository's `.gitignore` is configured to keep `.env` files out of Git:

```gitignore
.env
.env.*
!.env.example
```

---

## 3. Create the Local PostgreSQL Database

Connect to PostgreSQL with `psql`:

```powershell
psql -U postgres -h localhost -p 5432
```

You should see:

```text
postgres=#
```

Create the PokeFolio database:

```sql
CREATE DATABASE pokefolio;
```

Verify it exists:

```sql
\l
```

Connect to it:

```sql
\c pokefolio
```

At this point the database exists, but it does not yet contain the PokeFolio tables.

Verify:

```sql
\dt
```

A new database should initially report no relations/tables.

### Important

Do **not** manually create the PokeFolio tables.

The schema is created by the project's migration system.

Exit `psql` when finished:

```sql
\q
```

---

## 4. Run the Database Migration

Go to the backend directory:

```powershell
cd "pokefolio\server"
```

List available npm scripts:

```powershell
npm run
```

The project currently provides:

```text
start
dev
migrate
seed
db:check
```

Run the initial database migration:

```powershell
npm run migrate
```

The migration runner applies:

```text
server/db/migrations/001_initial_schema.sql
```

A successful migration reports:

```text
Database schema is ready.
```

---

## 5. Verify the Database Schema

Connect directly to the `pokefolio` database:

```powershell
psql -U postgres -h localhost -p 5432 -d pokefolio
```

List the tables:

```sql
\dt
```

The expected tables are:

```text
binder_cards
binder_pages
binder_spreads
cards
sets
user_preferences
```

Inspect individual tables and their constraints with:

```sql
\d sets
\d cards
\d user_preferences
\d binder_spreads
\d binder_pages
\d binder_cards
```

These commands let you inspect:

- columns
- data types
- primary keys
- foreign keys
- unique constraints
- check constraints
- indexes
- cascade behavior

---

## 6. Verify the Database Is Empty Before Seeding

Before importing Pokémon data, verify the catalog and binder tables are empty:

```sql
SELECT COUNT(*) FROM sets;
SELECT COUNT(*) FROM cards;
SELECT COUNT(*) FROM binder_spreads;
SELECT COUNT(*) FROM binder_pages;
SELECT COUNT(*) FROM binder_cards;
SELECT COUNT(*) FROM user_preferences;
```

A newly migrated database should return `0` for each table.

This provides a clean starting point for the catalog import.

---

## 7. Pokémon TCG Catalog Import

The importer is:

```text
server/scripts/import-cards.js
```

The npm script is:

```text
seed
  node scripts/import-cards.js
```

Run it from the `server` directory:

```powershell
npm run seed
```

The importer processes these supported sets:

| Set | API ID |
|---|---|
| Base | `base1` |
| Team Rocket | `base5` |
| Scarlet & Violet—151 | `sv3pt5` |
| Scarlet & Violet—Paldean Fates | `sv4pt5` |
| Scarlet & Violet—Prismatic Evolutions | `sv8pt5` |

### Import behavior

The importer is designed to be:

- authenticated
- resumable
- idempotent
- retry-aware
- transactional per set
- non-destructive toward existing catalog cards

For each set, it:

1. Fetches set metadata.
2. Fetches the complete card list.
3. Retries temporary API failures.
4. Validates the response before writing.
5. Upserts the set and cards.
6. Verifies the database card count.
7. Commits the set transaction.

A failed set does not require wiping the database or rebuilding successful work.

---

## 8. Verify the Import

After the seed process completes, run:

```powershell
npm run db:check
```

The database check reports:

- database tables
- important constraints
- imported set IDs
- card counts per set

The current verified catalog is:

```text
Base                     102
Team Rocket               83
Scarlet & Violet—151     207
Paldean Fates            245
Prismatic Evolutions     180
──────────────────────────────
Total                    817
```

You can independently verify the totals using SQL.

Connect to `pokefolio`:

```powershell
psql -U postgres -h localhost -p 5432 -d pokefolio
```

Then:

```sql
SELECT COUNT(*) FROM sets;
SELECT COUNT(*) FROM cards;
```

Expected results:

```text
sets  = 5
cards = 817
```

---

## 9. Inspect Imported Sets

List the imported set names:

```sql
SELECT name FROM sets;
```

Expected values:

```text
Base
Team Rocket
151
Paldean Fates
Prismatic Evolutions
```

Inspect more set metadata:

```sql
SELECT
    id,
    name,
    series,
    printed_total,
    total,
    release_date
FROM sets
ORDER BY release_date;
```

---

## 10. Inspect Cards From a Specific Set

Cards are associated with sets through `cards.set_id`.

For Base:

```sql
SELECT
    id,
    name,
    supertype,
    types,
    number,
    rarity,
    artist
FROM cards
WHERE set_id = 'base1'
ORDER BY number;
```

Count Base cards:

```sql
SELECT COUNT(*)
FROM cards
WHERE set_id = 'base1';
```

Expected:

```text
102
```

You can substitute another set ID:

```text
base5
sv3pt5
sv4pt5
sv8pt5
```

---

## 11. Inspect Card Image URLs

Cards store the two image URLs required by the MVP:

```text
image_small_url
image_large_url
```

For example:

```sql
SELECT
    id,
    name,
    image_small_url,
    image_large_url
FROM cards
WHERE set_id = 'base1'
LIMIT 5;
```

The small image is suitable for card grids and browsing, while the large image is suitable for card details and binder presentation.

---

## 12. Windows `psql` UTF-8 Configuration

PokeFolio stores PostgreSQL data using UTF-8.

On Windows, the `psql` client may sometimes use `WIN1252`, which can cause Unicode characters such as `Pokémon` or gender symbols to display incorrectly.

Symptoms may look like:

```text
Pok├®mon
```

This is a client/display encoding problem, not necessarily corrupted database data.

### Set the PostgreSQL client encoding before launching `psql`

In PowerShell:

```powershell
$env:PGCLIENTENCODING="UTF8"
psql -U postgres -h localhost -p 5432 -d pokefolio
```

Or, inside an existing `psql` session:

```sql
SET client_encoding = 'UTF8';
```

Verify:

```sql
SHOW client_encoding;
```

It should return:

```text
UTF8
```

This changes how the client communicates with/displays text; it does not change the stored database values.

---

## 13. Useful Development Commands

### Start Express

```powershell
npm start
```

### Start Express with Nodemon

```powershell
npm run dev
```

### Run database migrations

```powershell
npm run migrate
```

### Import Pokémon TCG catalog

```powershell
npm run seed
```

### Check database structure/catalog

```powershell
npm run db:check
```

### List npm scripts

```powershell
npm run
```

### Connect to the PokeFolio database

```powershell
psql -U postgres -h localhost -p 5432 -d pokefolio
```

---

## 14. Normal Development Flow

For a fresh local environment:

```text
Install PostgreSQL
        ↓
Start PostgreSQL service
        ↓
Create `pokefolio` database
        ↓
Create/configure `server/.env`
        ↓
Run `npm run migrate`
        ↓
Run `npm run seed`
        ↓
Run `npm run db:check`
        ↓
Start Express
```

Typical commands:

```powershell
# From server/
npm run migrate
npm run seed
npm run db:check
npm run dev
```

---

## 15. Database Responsibility

The database is responsible for persistent application state.

Catalog:

```text
sets
cards
```

Anonymous binder state:

```text
user_preferences
binder_spreads
binder_pages
binder_cards
```

The Pokémon TCG API is the external catalog source used during import. Normal frontend browsing is served through the PokeFolio Express API and PostgreSQL rather than querying the external API on every user interaction.

---

## 16. Security Notes

Never commit or expose:

```text
server/.env
```

Do not place real credentials in:

```text
README.md
project-plan.md
server/.env.example
frontend code
GitHub
screenshots
logs
```

The repository should contain only safe placeholders in `server/.env.example`.

If a secret is ever accidentally exposed publicly, revoke/rotate the credential before continuing development.
