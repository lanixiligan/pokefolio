import dotenv from "dotenv";
import { Pool } from "pg";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(currentDirectory, ".env") });

export const pool = new Pool({
  // Give a sleeping Neon database time to wake up, but not forever
  // (pg waits indefinitely by default). Idle connections are already
  // closed after pg's default of 10 seconds.
  connectionTimeoutMillis: 10_000,
});

// Without this listener, an error on an idle connection (for example when
// Neon suspends and drops it) crashes the whole Node process, and Render
// then has to cold-start the server again.
pool.on("error", (error) => {
  console.error("Idle database client error:", error.message);
});

export async function closePool() {
  await pool.end();
}
