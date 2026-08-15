import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "ok",
      database: "connected",
      message: "PokeFolio API is running",
    });
  } catch {
    res.status(503).json({
      status: "unavailable",
      database: "unavailable",
      message: "PokeFolio API is running but the database is unavailable",
    });
  }
});

app.listen(PORT, () => {
  console.log(`PokeFolio API running on http://localhost:${PORT}`);
});
