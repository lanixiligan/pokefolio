import dotenv from "dotenv";
import { Pool } from "pg";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(currentDirectory, ".env") });

export const pool = new Pool();

export async function closePool() {
  await pool.end();
}
