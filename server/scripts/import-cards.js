import { closePool, pool } from "../db.js";

const API_BASE_URL = "https://api.pokemontcg.io/v2";
const PAGE_SIZE = 250;
const MAX_ATTEMPTS = 4;
const SUPPORTED_SET_IDS = ["base1", "base5", "sv3pt5", "sv4pt5", "sv8pt5"];

function getApiKey() {
  const apiKey = process.env.POKEMON_TCG_API_KEY;

  if (!apiKey) {
    throw new Error("POKEMON_TCG_API_KEY is required to import card data.");
  }

  return apiKey;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function retryDelay(response, attempt) {
  if (response?.status === 429) {
    const retryAfter = response.headers.get("retry-after");
    const retryAfterSeconds = Number(retryAfter);

    if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0) {
      return retryAfterSeconds * 1000;
    }

    const retryAfterDate = Date.parse(retryAfter);
    if (!Number.isNaN(retryAfterDate)) {
      return Math.max(0, retryAfterDate - Date.now());
    }
  }

  return 1000 * 2 ** (attempt - 1) + Math.floor(Math.random() * 250);
}

function isTemporaryStatus(status) {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

async function fetchJson(path) {
  const apiKey = getApiKey();
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: { "X-Api-Key": apiKey },
      });

      if (response.ok) {
        return await response.json();
      }

      lastError = new Error(`Pokémon TCG API returned HTTP ${response.status}.`);

      if (!isTemporaryStatus(response.status) || attempt === MAX_ATTEMPTS) {
        lastError.retryable = false;
        throw lastError;
      }

      await wait(retryDelay(response, attempt));
    } catch (error) {
      lastError = error;

      if (error.retryable === false || attempt === MAX_ATTEMPTS) {
        throw error;
      }

      await wait(1000 * 2 ** (attempt - 1) + Math.floor(Math.random() * 250));
    }
  }

  throw lastError;
}

function toDatabaseDate(apiDate) {
  if (typeof apiDate !== "string" || !/^\d{4}\/\d{2}\/\d{2}$/.test(apiDate)) {
    throw new Error("Set releaseDate is missing or invalid.");
  }

  return apiDate.replaceAll("/", "-");
}

function validateSet(setId, setData) {
  if (!setData || setData.id !== setId) {
    throw new Error(`Set response did not match ${setId}.`);
  }

  if (!setData.name || !setData.series || !Number.isInteger(setData.printedTotal) || !Number.isInteger(setData.total)) {
    throw new Error(`Set ${setId} is missing required metadata.`);
  }

  if (!setData.images?.logo || !setData.images?.symbol) {
    throw new Error(`Set ${setId} is missing required image URLs.`);
  }
}

function validateCards(setId, cards, totalCount) {
  if (!Number.isInteger(totalCount) || totalCount < 0) {
    throw new Error(`Card response for ${setId} has no valid totalCount.`);
  }

  if (cards.length !== totalCount) {
    throw new Error(`Retrieved ${cards.length} cards for ${setId}; expected ${totalCount}.`);
  }

  const cardIds = new Set();

  for (const card of cards) {
    if (!card.id || cardIds.has(card.id)) {
      throw new Error(`Card IDs for ${setId} are missing or not unique.`);
    }

    cardIds.add(card.id);

    if (card.set?.id !== setId) {
      throw new Error(`Card ${card.id} does not belong to ${setId}.`);
    }

    if (!card.name || !card.supertype || !card.number || !card.images?.small || !card.images?.large) {
      throw new Error(`Card ${card.id} is missing required PokeFolio fields.`);
    }

    if (card.types !== undefined && (!Array.isArray(card.types) || !card.types.every((type) => typeof type === "string"))) {
      throw new Error(`Card ${card.id} has invalid types data.`);
    }
  }
}

async function fetchAllCards(setId) {
  const cards = [];
  let totalCount;
  let page = 1;

  do {
    const query = new URLSearchParams({
      q: `set.id:${setId}`,
      pageSize: String(PAGE_SIZE),
      page: String(page),
    });
    const response = await fetchJson(`/cards?${query}`);

    if (!Array.isArray(response.data)) {
      throw new Error(`Card response for ${setId} does not contain a data array.`);
    }

    if (totalCount === undefined) {
      totalCount = response.totalCount;
    } else if (response.totalCount !== totalCount) {
      throw new Error(`Card totalCount changed while importing ${setId}.`);
    }

    cards.push(...response.data);
    page += 1;
  } while (cards.length < totalCount);

  validateCards(setId, cards, totalCount);
  return { cards, totalCount };
}

async function importSet(setId) {
  const setResponse = await fetchJson(`/sets/${setId}`);
  const setData = setResponse.data;
  validateSet(setId, setData);

  const { cards, totalCount } = await fetchAllCards(setId);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO sets (id, name, series, printed_total, total, release_date, logo_url, symbol_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         series = EXCLUDED.series,
         printed_total = EXCLUDED.printed_total,
         total = EXCLUDED.total,
         release_date = EXCLUDED.release_date,
         logo_url = EXCLUDED.logo_url,
         symbol_url = EXCLUDED.symbol_url`,
      [
        setData.id,
        setData.name,
        setData.series,
        setData.printedTotal,
        setData.total,
        toDatabaseDate(setData.releaseDate),
        setData.images.logo,
        setData.images.symbol,
      ],
    );

    for (const card of cards) {
      await client.query(
        `INSERT INTO cards (
          id, set_id, name, supertype, types, number, rarity, artist, image_small_url, image_large_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          set_id = EXCLUDED.set_id,
          name = EXCLUDED.name,
          supertype = EXCLUDED.supertype,
          types = EXCLUDED.types,
          number = EXCLUDED.number,
          rarity = EXCLUDED.rarity,
          artist = EXCLUDED.artist,
          image_small_url = EXCLUDED.image_small_url,
          image_large_url = EXCLUDED.image_large_url`,
        [
          card.id,
          setId,
          card.name,
          card.supertype,
          card.types ?? null,
          card.number,
          card.rarity ?? null,
          card.artist ?? null,
          card.images.small,
          card.images.large,
        ],
      );
    }

    const countResult = await client.query(
      "SELECT COUNT(*)::INTEGER AS count FROM cards WHERE set_id = $1",
      [setId],
    );
    const committedCount = countResult.rows[0].count;

    if (committedCount !== totalCount) {
      throw new Error(`Database contains ${committedCount} cards for ${setId}; expected ${totalCount}.`);
    }

    await client.query("COMMIT");

    return {
      setId,
      setName: setData.name,
      totalCount,
      retrievedCount: cards.length,
      committedCount,
      countsMatch: committedCount === totalCount,
      uniqueCardIds: true,
      allSmallImagesPresent: true,
      allLargeImagesPresent: true,
      status: "succeeded",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function runImport() {
  const results = [];

  for (const setId of SUPPORTED_SET_IDS) {
    try {
      results.push(await importSet(setId));
    } catch (error) {
      results.push({
        setId,
        status: "failed",
        reason: error.message,
      });
    }
  }

  for (const result of results) {
    console.log(JSON.stringify(result));
  }

  if (results.some((result) => result.status === "failed")) {
    process.exitCode = 1;
  }
}

runImport()
  .catch((error) => {
    console.error(`Import failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(closePool);
