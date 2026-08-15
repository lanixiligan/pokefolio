import { closePool, pool } from "../db.js";

const expectedTables = [
  "sets",
  "cards",
  "user_preferences",
  "binder_spreads",
  "binder_pages",
  "binder_cards",
];

async function checkDatabase() {
  const tableResult = await pool.query(
    `SELECT tablename
     FROM pg_tables
     WHERE schemaname = 'public' AND tablename = ANY($1::text[])
     ORDER BY tablename`,
    [expectedTables],
  );
  const tables = tableResult.rows.map((row) => row.tablename);

  if (tables.length !== expectedTables.length) {
    throw new Error(`Missing expected tables. Found: ${tables.join(", ") || "none"}.`);
  }

  const constraintResult = await pool.query(
    `SELECT conname
     FROM pg_constraint
     WHERE conname = ANY($1::text[])
     ORDER BY conname`,
    [[
      "binder_cards_anon_id_card_id_key",
      "binder_cards_page_fkey",
      "binder_cards_page_position_key",
      "binder_pages_spread_owner_fkey",
      "binder_spreads_anon_id_sort_order_key",
    ]],
  );
  const constraints = constraintResult.rows.map((row) => row.conname);

  if (constraints.length !== 5) {
    throw new Error(`Missing expected binder constraints. Found: ${constraints.join(", ") || "none"}.`);
  }

  const catalogResult = await pool.query(
    `SELECT set_id, COUNT(*)::INTEGER AS card_count
     FROM cards
     GROUP BY set_id
     ORDER BY set_id`,
  );

  console.log(JSON.stringify({ tables, constraints, catalog: catalogResult.rows }));
}

checkDatabase()
  .catch((error) => {
    console.error(`Database check failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(closePool);
