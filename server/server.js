import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// -----------------------------------------------------------------------------
// Middleware
// -----------------------------------------------------------------------------

app.use(cors());
app.use(express.json());

const requireAnonId = (req, res, next) => {
  const anonId = req.get("X-Anon-Id");

  if (!anonId) {
    return res.status(400).json({
      error: "X-Anon-Id header is required",
    });
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(anonId)) {
    return res.status(400).json({
      error: "X-Anon-Id must be a valid UUID",
    });
  }

  req.anonId = anonId;
  next();
};

// -----------------------------------------------------------------------------
// Health
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Catalog Routes
// -----------------------------------------------------------------------------

app.get("/api/sets", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        series,
        printed_total,
        total,
        release_date,
        logo_url,
        symbol_url
      FROM sets
      ORDER BY release_date;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch sets:", error);

    res.status(500).json({
      error: "Failed to retrieve sets",
    });
  }
});

app.get("/api/sets/:setId", async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT
          id,
          name,
          series,
          printed_total,
          total,
          release_date,
          logo_url,
          symbol_url
        FROM sets
        WHERE id = $1;
      `,
      [req.params.setId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Set not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to fetch set:", error);

    res.status(500).json({
      error: "Failed to retrieve set",
    });
  }
});

app.get("/api/cards", async (req, res) => {
  try {
    const { set, search } = req.query;

    const conditions = [];
    const values = [];

    if (set) {
      values.push(set);
      conditions.push(`set_id = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`name ILIKE $${values.length}`);
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    // REPLACE THE EXISTING QUERY HERE
    const result = await pool.query(
      `
        SELECT
          id,
          set_id,
          name,
          supertype,
          types,
          number,
          rarity,
          artist,
          image_small_url,
          image_large_url
        FROM cards
        ${whereClause}
        ORDER BY set_id, number::integer;
      `,
      values
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch cards:", error);

    res.status(500).json({
      error: "Failed to retrieve cards",
    });
  }
});

app.get("/api/cards/:cardId", async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT
          id,
          set_id,
          name,
          supertype,
          types,
          number,
          rarity,
          artist,
          image_small_url,
          image_large_url
        FROM cards
        WHERE id = $1;
      `,
      [req.params.cardId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Card not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to fetch card:", error);

    res.status(500).json({
      error: "Failed to retrieve card",
    });
  }
});

// -----------------------------------------------------------------------------
// Binder Routes
// -----------------------------------------------------------------------------

// Initialize an anonymous binder with default preferences and one empty spread.
app.post("/api/binder/initialize", requireAnonId, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
        SELECT pg_advisory_xact_lock(
          hashtextextended($1::text, 0)
        );
      `,
      [req.anonId]
    );

    await client.query(
      `
        INSERT INTO user_preferences (anon_id)
        VALUES ($1)
        ON CONFLICT (anon_id) DO NOTHING;
      `,
      [req.anonId]
    );

    const spreadResult = await client.query(
      `
        SELECT id
        FROM binder_spreads
        WHERE anon_id = $1
        ORDER BY sort_order
        LIMIT 1;
      `,
      [req.anonId]
    );

    let spreadId;

    if (spreadResult.rows.length === 0) {
      const newSpread = await client.query(
        `
          INSERT INTO binder_spreads (anon_id, sort_order)
          VALUES ($1, 1)
          RETURNING id;
        `,
        [req.anonId]
      );

      spreadId = newSpread.rows[0].id;

      await client.query(
        `
          INSERT INTO binder_pages (anon_id, spread_id, side)
          VALUES
            ($1, $2, 1),
            ($1, $2, 2);
        `,
        [req.anonId, spreadId]
      );
    } else {
      spreadId = spreadResult.rows[0].id;
    }

    await client.query("COMMIT");

    res.json({
      message: "Binder initialized",
      anonId: req.anonId,
      spreadId,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Failed to initialize binder:", error);

    res.status(500).json({
      error: "Failed to initialize binder",
    });
  } finally {
    client.release();
  }
});

// Return the complete binder state for one anonymous user.
app.get("/api/binder", requireAnonId, async (req, res) => {
  try {
    const preferencesResult = await pool.query(
      `
        SELECT
          background,
          binder_color,
          accent_color,
          theme,
          grid_size
        FROM user_preferences
        WHERE anon_id = $1;
      `,
      [req.anonId]
    );

    if (preferencesResult.rows.length === 0) {
      return res.status(404).json({
        error: "Binder preferences not found",
      });
    }

    const spreadsResult = await pool.query(
      `
        SELECT
          id,
          sort_order
        FROM binder_spreads
        WHERE anon_id = $1
        ORDER BY sort_order;
      `,
      [req.anonId]
    );

    const pagesResult = await pool.query(
      `
        SELECT
          spread_id,
          side
        FROM binder_pages
        WHERE anon_id = $1
        ORDER BY spread_id, side;
      `,
      [req.anonId]
    );

    const cardsResult = await pool.query(
      `
        SELECT
          bc.spread_id,
          bc.page_side,
          bc.position,
          c.id,
          c.name,
          c.number,
          c.supertype,
          c.types,
          c.rarity,
          c.artist,
          c.image_small_url,
          c.image_large_url
        FROM binder_cards bc
        JOIN cards c
          ON c.id = bc.card_id
        WHERE bc.anon_id = $1
        ORDER BY bc.spread_id, bc.page_side, bc.position;
      `,
      [req.anonId]
    );

    const preferences = preferencesResult.rows[0];

    res.json({
      preferences: {
        background: preferences.background,
        binderColor: preferences.binder_color,
        accentColor: preferences.accent_color,
        theme: preferences.theme,
        gridSize: preferences.grid_size,
      },

      spreads: spreadsResult.rows.map((spread) => ({
        id: spread.id,
        sortOrder: spread.sort_order,

        pages: pagesResult.rows
          .filter((page) => page.spread_id === spread.id)
          .map((page) => ({
            side: page.side,

            cards: cardsResult.rows
              .filter(
                (card) =>
                  card.spread_id === spread.id &&
                  card.page_side === page.side
              )
              .map((card) => ({
                position: card.position,
                card: {
                  id: card.id,
                  name: card.name,
                  number: card.number,
                  supertype: card.supertype,
                  types: card.types,
                  rarity: card.rarity,
                  artist: card.artist,
                  imageSmallUrl: card.image_small_url,
                  imageLargeUrl: card.image_large_url,
                },
              })),
          })),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch binder:", error);

    res.status(500).json({
      error: "Failed to retrieve binder",
    });
  }
});

// Add a card to an empty binder slot.
app.post("/api/binder/cards", requireAnonId, async (req, res) => {
  const client = await pool.connect();

  try {
    const { cardId, spreadId, pageSide, position } = req.body;

    await client.query("BEGIN");

    await client.query(
      `
        SELECT pg_advisory_xact_lock(
          hashtextextended($1::text, 0)
        );
      `,
      [req.anonId]
    );

    if (
      typeof cardId !== "string" ||
      !Number.isInteger(Number(spreadId)) ||
      !Number.isInteger(Number(pageSide)) ||
      !Number.isInteger(Number(position))
    ) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        error: "Invalid card placement data",
      });
    }

    const normalizedSpreadId = Number(spreadId);
    const normalizedPageSide = Number(pageSide);
    const normalizedPosition = Number(position);

    if (![1, 2].includes(normalizedPageSide)) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        error: "pageSide must be 1 or 2",
      });
    }

    if (normalizedPosition < 0 || normalizedPosition > 15) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        error: "position must be between 0 and 15",
      });
    }

    const cardResult = await client.query(
      `
        SELECT id
        FROM cards
        WHERE id = $1;
      `,
      [cardId]
    );

    if (cardResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Card not found",
      });
    }

    const pageResult = await client.query(
      `
        SELECT 1
        FROM binder_pages
        WHERE anon_id = $1
          AND spread_id = $2
          AND side = $3;
      `,
      [req.anonId, normalizedSpreadId, normalizedPageSide]
    );

    if (pageResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Destination page not found",
      });
    }

    const preferencesResult = await client.query(
      `
        SELECT grid_size
        FROM user_preferences
        WHERE anon_id = $1;
      `,
      [req.anonId]
    );

    if (preferencesResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Binder preferences not found",
      });
    }

    const gridSize = preferencesResult.rows[0].grid_size;
    const maxVisiblePosition = gridSize * gridSize - 1;

    if (normalizedPosition > maxVisiblePosition) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        error: "Position is outside the current grid",
      });
    }

    const existingCardResult = await client.query(
      `
        SELECT id
        FROM binder_cards
        WHERE anon_id = $1
          AND card_id = $2;
      `,
      [req.anonId, cardId]
    );

    if (existingCardResult.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        error: "Card is already in the binder",
      });
    }

    const existingPositionResult = await client.query(
      `
        SELECT id
        FROM binder_cards
        WHERE anon_id = $1
          AND spread_id = $2
          AND page_side = $3
          AND position = $4;
      `,
      [
        req.anonId,
        normalizedSpreadId,
        normalizedPageSide,
        normalizedPosition,
      ]
    );

    if (existingPositionResult.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        error: "Destination position is already occupied",
      });
    }

    const insertResult = await client.query(
      `
        INSERT INTO binder_cards (
          anon_id,
          spread_id,
          page_side,
          card_id,
          position
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, spread_id, page_side, card_id, position;
      `,
      [
        req.anonId,
        normalizedSpreadId,
        normalizedPageSide,
        cardId,
        normalizedPosition,
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Card added to binder",
      placement: insertResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Failed to add card to binder:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "Card or destination position already exists in the binder",
      });
    }

    res.status(500).json({
      error: "Failed to add card to binder",
    });
  } finally {
    client.release();
  }
});

// Remove a card from the binder.
app.delete(
  "/api/binder/cards/:cardId",
  requireAnonId,
  async (req, res) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
          SELECT pg_advisory_xact_lock(
            hashtextextended($1::text, 0)
          );
        `,
        [req.anonId]
      );

      const result = await client.query(
        `
          DELETE FROM binder_cards
          WHERE anon_id = $1
            AND card_id = $2
          RETURNING id;
        `,
        [req.anonId, req.params.cardId]
      );

      if (result.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          error: "Card is not in the binder",
        });
      }

      await client.query("COMMIT");

      res.status(204).send();
    } catch (error) {
      await client.query("ROLLBACK");

      console.error("Failed to remove card from binder:", error);

      res.status(500).json({
        error: "Failed to remove card from binder",
      });
    } finally {
      client.release();
    }
  }
);

// Move a card to an empty slot or swap with an occupied slot.
app.patch(
  "/api/binder/cards/:cardId",
  requireAnonId,
  async (req, res) => {
    const { spreadId, pageSide, position } = req.body;

    const normalizedSpreadId = Number(spreadId);
    const normalizedPageSide = Number(pageSide);
    const normalizedPosition = Number(position);

    if (!Number.isInteger(normalizedSpreadId)) {
      return res.status(400).json({
        error: "spreadId must be an integer",
      });
    }

    if (![1, 2].includes(normalizedPageSide)) {
      return res.status(400).json({
        error: "pageSide must be 1 or 2",
      });
    }

    if (
      !Number.isInteger(normalizedPosition) ||
      normalizedPosition < 0 ||
      normalizedPosition > 15
    ) {
      return res.status(400).json({
        error: "position must be an integer between 0 and 15",
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // The position constraint is deferrable so two cards can exchange slots.
      await client.query(
        "SET CONSTRAINTS binder_cards_page_position_key DEFERRED"
      );

      await client.query(
        `
          SELECT pg_advisory_xact_lock(
            hashtextextended($1::text, 0)
          );
        `,
        [req.anonId]
      );

      const sourceResult = await client.query(
        `
          SELECT
            id,
            spread_id,
            page_side,
            position,
            card_id
          FROM binder_cards
          WHERE anon_id = $1
            AND card_id = $2
          FOR UPDATE;
        `,
        [req.anonId, req.params.cardId]
      );

      if (sourceResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          error: "Card is not in the binder",
        });
      }

      const source = sourceResult.rows[0];

      const destinationPageResult = await client.query(
        `
          SELECT 1
          FROM binder_pages
          WHERE anon_id = $1
            AND spread_id = $2
            AND side = $3;
        `,
        [
          req.anonId,
          normalizedSpreadId,
          normalizedPageSide,
        ]
      );

      if (destinationPageResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          error: "Destination page not found",
        });
      }

      const gridResult = await client.query(
        `
          SELECT grid_size
          FROM user_preferences
          WHERE anon_id = $1;
        `,
        [req.anonId]
      );

      if (gridResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          error: "Binder preferences not found",
        });
      }

      const gridSize = gridResult.rows[0].grid_size;
      const maxVisiblePosition = gridSize * gridSize - 1;

      if (normalizedPosition > maxVisiblePosition) {
        await client.query("ROLLBACK");

        return res.status(409).json({
          error: "Position is outside the current grid",
        });
      }

      if (
        source.spread_id === normalizedSpreadId &&
        source.page_side === normalizedPageSide &&
        source.position === normalizedPosition
      ) {
        await client.query("COMMIT");

        return res.json({
          message: "Card already occupies the requested position",
          placement: {
            id: source.id,
            spreadId: source.spread_id,
            pageSide: source.page_side,
            cardId: source.card_id,
            position: source.position,
          },
        });
      }

      const destinationResult = await client.query(
        `
          SELECT
            id,
            spread_id,
            page_side,
            position,
            card_id
          FROM binder_cards
          WHERE anon_id = $1
            AND spread_id = $2
            AND page_side = $3
            AND position = $4
          FOR UPDATE;
        `,
        [
          req.anonId,
          normalizedSpreadId,
          normalizedPageSide,
          normalizedPosition,
        ]
      );

      // Empty destination: move the source card.
      if (destinationResult.rows.length === 0) {
        const updateResult = await client.query(
          `
            UPDATE binder_cards
            SET
              spread_id = $1,
              page_side = $2,
              position = $3
            WHERE id = $4
              AND anon_id = $5
            RETURNING
              id,
              spread_id,
              page_side,
              card_id,
              position;
          `,
          [
            normalizedSpreadId,
            normalizedPageSide,
            normalizedPosition,
            source.id,
            req.anonId,
          ]
        );

        await client.query("COMMIT");

        return res.json({
          message: "Card moved",
          placement: updateResult.rows[0],
        });
      }

      // Occupied destination: swap the two placements.
      const destination = destinationResult.rows[0];

      await client.query(
        `
          UPDATE binder_cards
          SET
            spread_id = $1,
            page_side = $2,
            position = $3
          WHERE id = $4
            AND anon_id = $5;
        `,
        [
          source.spread_id,
          source.page_side,
          source.position,
          destination.id,
          req.anonId,
        ]
      );

      const sourceUpdateResult = await client.query(
        `
          UPDATE binder_cards
          SET
            spread_id = $1,
            page_side = $2,
            position = $3
          WHERE id = $4
            AND anon_id = $5
          RETURNING
            id,
            spread_id,
            page_side,
            card_id,
            position;
        `,
        [
          normalizedSpreadId,
          normalizedPageSide,
          normalizedPosition,
          source.id,
          req.anonId,
        ]
      );

      await client.query("COMMIT");

      res.json({
        message: "Cards swapped",
        placement: sourceUpdateResult.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");

      console.error("Failed to move or swap card:", error);

      res.status(500).json({
        error: "Failed to move or swap card",
      });
    } finally {
      client.release();
    }
  }
);

// Create a new two-page binder spread.
app.post("/api/binder/spreads", requireAnonId, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
        SELECT pg_advisory_xact_lock(
          hashtextextended($1::text, 0)
        );
      `,
      [req.anonId]
    );

    const orderResult = await client.query(
      `
        SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort_order
        FROM binder_spreads
        WHERE anon_id = $1;
      `,
      [req.anonId]
    );

    const nextSortOrder = orderResult.rows[0].next_sort_order;

    const spreadResult = await client.query(
      `
        INSERT INTO binder_spreads (
          anon_id,
          sort_order
        )
        VALUES ($1, $2)
        RETURNING id, sort_order;
      `,
      [req.anonId, nextSortOrder]
    );

    const spread = spreadResult.rows[0];

    await client.query(
      `
        INSERT INTO binder_pages (
          anon_id,
          spread_id,
          side
        )
        VALUES
          ($1, $2, 1),
          ($1, $2, 2);
      `,
      [req.anonId, spread.id]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Binder spread created",
      spread: {
        id: spread.id,
        sortOrder: spread.sort_order,
        pages: [
          { side: 1, cards: [] },
          { side: 2, cards: [] },
        ],
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Failed to create binder spread:", error);

    res.status(500).json({
      error: "Failed to create binder spread",
    });
  } finally {
    client.release();
  }
});

// Delete a spread, but never the final remaining spread.
app.delete(
  "/api/binder/spreads/:spreadId",
  requireAnonId,
  async (req, res) => {
    const spreadId = Number(req.params.spreadId);

    if (!Number.isInteger(spreadId)) {
      return res.status(400).json({
        error: "spreadId must be an integer",
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
          SELECT pg_advisory_xact_lock(
            hashtextextended($1::text, 0)
          );
        `,
        [req.anonId]
      );

      const spreadResult = await client.query(
        `
          SELECT id
          FROM binder_spreads
          WHERE anon_id = $1
            AND id = $2;
        `,
        [req.anonId, spreadId]
      );

      if (spreadResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          error: "Spread not found",
        });
      }

      const countResult = await client.query(
        `
          SELECT COUNT(*) AS spread_count
          FROM binder_spreads
          WHERE anon_id = $1;
        `,
        [req.anonId]
      );

      const spreadCount = Number(countResult.rows[0].spread_count);

      if (spreadCount <= 1) {
        await client.query("ROLLBACK");

        return res.status(409).json({
          error: "Cannot delete the final remaining spread",
        });
      }

      // Pages and binder-card placements cascade from the spread.
      await client.query(
        `
          DELETE FROM binder_spreads
          WHERE anon_id = $1
            AND id = $2;
        `,
        [req.anonId, spreadId]
      );

      // Keep the user-facing spread order contiguous after deletion.
      await client.query(
        `
          WITH ordered_spreads AS (
            SELECT
              id,
              ROW_NUMBER() OVER (
                ORDER BY sort_order, id
              ) AS new_sort_order
            FROM binder_spreads
            WHERE anon_id = $1
          )
          UPDATE binder_spreads bs
          SET sort_order = ordered_spreads.new_sort_order
          FROM ordered_spreads
          WHERE bs.id = ordered_spreads.id
            AND bs.anon_id = $1;
        `,
        [req.anonId]
      );

      await client.query("COMMIT");

      res.status(204).send();
    } catch (error) {
      await client.query("ROLLBACK");

      console.error("Failed to delete binder spread:", error);

      res.status(500).json({
        error: "Failed to delete binder spread",
      });
    } finally {
      client.release();
    }
  }
);

// -----------------------------------------------------------------------------
// Preferences Routes
// -----------------------------------------------------------------------------

app.get("/api/preferences", requireAnonId, async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT
          background,
          binder_color,
          accent_color,
          theme,
          grid_size
        FROM user_preferences
        WHERE anon_id = $1;
      `,
      [req.anonId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Preferences not found",
      });
    }

    const preferences = result.rows[0];

    res.json({
      background: preferences.background,
      binderColor: preferences.binder_color,
      accentColor: preferences.accent_color,
      theme: preferences.theme,
      gridSize: preferences.grid_size,
    });
  } catch (error) {
    console.error("Failed to fetch preferences:", error);

    res.status(500).json({
      error: "Failed to retrieve preferences",
    });
  }
});

// Reassigns every existing binder_cards row to fit a new grid size, without
// ever deleting or duplicating a card. Must run inside an already-open
// transaction (BEGIN + advisory lock already acquired by the caller).
//
// Ordering is deliberate and matters for correctness:
//   1. Read every card in deterministic order (spread sort_order -> page
//      side -> position) BEFORE anything else is touched.
//   2. Figure out how many spreads the new grid size needs, and create any
//      additional ones first - never delete anything yet.
//   3. Defer the constraints that would otherwise collide while many rows
//      are mid-update.
//   4. UPDATE every card's spread_id/page_side/position - existing rows,
//      same ids, never deleted and reinserted.
//   5. Only now that every card has been moved off of them, delete any
//      trailing spreads that ended up empty.
//   6. Renumber remaining spreads' sort_order contiguously.
//
// Deleting excess spreads before step 4 would be unsafe: binder_pages and
// binder_cards both cascade from binder_spreads, so removing a spread that
// still held cards would destroy those cards.
async function reflowBinderGrid(client, anonId, newGridSize) {
  // 1. Read/lock all existing cards in deterministic order.
  const cardsResult = await client.query(
    `
      SELECT bc.id
      FROM binder_cards bc
      JOIN binder_spreads bs
        ON bs.anon_id = bc.anon_id
        AND bs.id = bc.spread_id
      WHERE bc.anon_id = $1
      ORDER BY bs.sort_order, bc.page_side, bc.position
      FOR UPDATE OF bc;
    `,
    [anonId]
  );

  const orderedCards = cardsResult.rows;
  const totalCards = orderedCards.length;

  // 2. Calculate exactly how many spreads the new grid size requires.
  const slotsPerPage = newGridSize * newGridSize;
  const slotsPerSpread = slotsPerPage * 2;
  const spreadsNeeded = Math.max(1, Math.ceil(totalCards / slotsPerSpread));

  const spreadsResult = await client.query(
    `
      SELECT id, sort_order
      FROM binder_spreads
      WHERE anon_id = $1
      ORDER BY sort_order
      FOR UPDATE;
    `,
    [anonId]
  );

  const spreads = spreadsResult.rows;

  // Create additional spreads (with both pages) if the new grid needs more
  // than currently exist. Always appended after the current highest
  // sort_order, same as the existing "add spread" endpoint.
  if (spreads.length < spreadsNeeded) {
    let nextSortOrder =
      spreads.length > 0
        ? Math.max(...spreads.map((spread) => spread.sort_order)) + 1
        : 1;

    while (spreads.length < spreadsNeeded) {
      const newSpreadResult = await client.query(
        `
          INSERT INTO binder_spreads (anon_id, sort_order)
          VALUES ($1, $2)
          RETURNING id, sort_order;
        `,
        [anonId, nextSortOrder]
      );

      const newSpread = newSpreadResult.rows[0];

      await client.query(
        `
          INSERT INTO binder_pages (anon_id, spread_id, side)
          VALUES ($1, $2, 1), ($1, $2, 2);
        `,
        [anonId, newSpread.id]
      );

      spreads.push(newSpread);
      nextSortOrder += 1;
    }
  }

  spreads.sort((a, b) => a.sort_order - b.sort_order);

  // 3. Defer the constraint that many mid-reflow card-position updates
  // would otherwise transiently violate. binder_spreads_anon_id_sort_order_key
  // is intentionally NOT deferred here: it isn't declared DEFERRABLE in the
  // schema, and it doesn't need to be - reflow only ever renumbers spreads
  // after removing trailing (highest sort_order) ones, so the surviving
  // rows' sort_order values are already contiguous by the time the
  // renumbering statement runs; no two rows ever need to swap through
  // each other's values.
  await client.query(
    "SET CONSTRAINTS binder_cards_page_position_key DEFERRED"
  );

  // 4. Reassign every existing card to its new spread/page/position via
  // UPDATE on the existing row - never delete + reinsert.
  for (let index = 0; index < totalCards; index++) {
    const spreadIndex = Math.floor(index / slotsPerSpread);
    const withinSpread = index % slotsPerSpread;
    const pageSide = withinSpread < slotsPerPage ? 1 : 2;
    const position =
      withinSpread < slotsPerPage ? withinSpread : withinSpread - slotsPerPage;

    const targetSpread = spreads[spreadIndex];
    const card = orderedCards[index];

    await client.query(
      `
        UPDATE binder_cards
        SET spread_id = $1, page_side = $2, position = $3
        WHERE id = $4;
      `,
      [targetSpread.id, pageSide, position, card.id]
    );
  }

  // 5. Only now that every card has been moved off of them, remove any
  // trailing spreads beyond what the new grid size actually needs.
  const excessSpreads = spreads.slice(spreadsNeeded);

  if (excessSpreads.length > 0) {
    const excessSpreadIds = excessSpreads.map((spread) => spread.id);

    await client.query(
      `
        DELETE FROM binder_spreads
        WHERE anon_id = $1
          AND id = ANY($2::bigint[]);
      `,
      [anonId, excessSpreadIds]
    );
  }

  // 6. Renumber remaining spreads' sort_order contiguously (same pattern
  // already used by spread deletion).
  await client.query(
    `
      WITH ordered_spreads AS (
        SELECT
          id,
          ROW_NUMBER() OVER (
            ORDER BY sort_order, id
          ) AS new_sort_order
        FROM binder_spreads
        WHERE anon_id = $1
      )
      UPDATE binder_spreads bs
      SET sort_order = ordered_spreads.new_sort_order
      FROM ordered_spreads
      WHERE bs.id = ordered_spreads.id
        AND bs.anon_id = $1;
    `,
    [anonId]
  );
}

app.put("/api/preferences", requireAnonId, async (req, res) => {
  const {
    background,
    binderColor,
    accentColor,
    theme,
    gridSize,
  } = req.body;

  const normalizedGridSize = Number(gridSize);

  if (
    typeof background !== "string" ||
    typeof binderColor !== "string" ||
    typeof accentColor !== "string" ||
    typeof theme !== "string"
  ) {
    return res.status(400).json({
      error: "Invalid preference values",
    });
  }

  if (![2, 3, 4].includes(normalizedGridSize)) {
    return res.status(400).json({
      error: "gridSize must be 2, 3, or 4",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
        SELECT pg_advisory_xact_lock(
          hashtextextended($1::text, 0)
        );
      `,
      [req.anonId]
    );

    const currentPreferencesResult = await client.query(
      `
        SELECT grid_size
        FROM user_preferences
        WHERE anon_id = $1
        FOR UPDATE;
      `,
      [req.anonId]
    );

    if (currentPreferencesResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Preferences not found",
      });
    }

    const currentGridSize = currentPreferencesResult.rows[0].grid_size;

    if (currentGridSize !== normalizedGridSize) {
      await reflowBinderGrid(client, req.anonId, normalizedGridSize);
    }

    const updateResult = await client.query(
      `
        UPDATE user_preferences
        SET
          background = $1,
          binder_color = $2,
          accent_color = $3,
          theme = $4,
          grid_size = $5
        WHERE anon_id = $6
        RETURNING
          background,
          binder_color,
          accent_color,
          theme,
          grid_size;
      `,
      [
        background,
        binderColor,
        accentColor,
        theme,
        normalizedGridSize,
        req.anonId,
      ]
    );

    await client.query("COMMIT");

    const preferences = updateResult.rows[0];

    res.json({
      background: preferences.background,
      binderColor: preferences.binder_color,
      accentColor: preferences.accent_color,
      theme: preferences.theme,
      gridSize: preferences.grid_size,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Failed to update preferences:", error);

    res.status(500).json({
      error: "Failed to update preferences",
    });
  } finally {
    client.release();
  }
});

// -----------------------------------------------------------------------------
// Start Server
// -----------------------------------------------------------------------------

app.listen(PORT, "0.0.0.0", () => {
  console.log(`PokeFolio API running on port ${PORT}`);
});