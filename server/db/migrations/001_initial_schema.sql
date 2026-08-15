CREATE TABLE IF NOT EXISTS sets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  series TEXT NOT NULL,
  printed_total INTEGER NOT NULL CHECK (printed_total >= 0),
  total INTEGER NOT NULL CHECK (total >= printed_total),
  release_date DATE NOT NULL,
  logo_url TEXT NOT NULL,
  symbol_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  set_id TEXT NOT NULL REFERENCES sets (id),
  name TEXT NOT NULL,
  supertype TEXT NOT NULL,
  types TEXT[],
  number TEXT NOT NULL,
  rarity TEXT,
  artist TEXT,
  image_small_url TEXT NOT NULL,
  image_large_url TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cards_set_id_name ON cards (set_id, name);

CREATE TABLE IF NOT EXISTS user_preferences (
  anon_id UUID PRIMARY KEY,
  background TEXT NOT NULL DEFAULT '#f6f3ee',
  binder_color TEXT NOT NULL DEFAULT '#ffffff',
  accent_color TEXT NOT NULL DEFAULT '#d62828',
  theme TEXT NOT NULL DEFAULT 'classic',
  grid_size SMALLINT NOT NULL DEFAULT 3 CHECK (grid_size IN (2, 3, 4))
);

CREATE TABLE IF NOT EXISTS binder_spreads (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  anon_id UUID NOT NULL,
  sort_order INTEGER NOT NULL CHECK (sort_order >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT binder_spreads_anon_id_id_key UNIQUE (anon_id, id),
  CONSTRAINT binder_spreads_anon_id_sort_order_key UNIQUE (anon_id, sort_order)
);

CREATE TABLE IF NOT EXISTS binder_pages (
  anon_id UUID NOT NULL,
  spread_id BIGINT NOT NULL,
  side SMALLINT NOT NULL CHECK (side IN (1, 2)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (anon_id, spread_id, side),
  CONSTRAINT binder_pages_spread_owner_fkey
    FOREIGN KEY (anon_id, spread_id)
    REFERENCES binder_spreads (anon_id, id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS binder_cards (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  anon_id UUID NOT NULL,
  spread_id BIGINT NOT NULL,
  page_side SMALLINT NOT NULL CHECK (page_side IN (1, 2)),
  card_id TEXT NOT NULL REFERENCES cards (id),
  position SMALLINT NOT NULL CHECK (position BETWEEN 0 AND 15),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT binder_cards_page_fkey
    FOREIGN KEY (anon_id, spread_id, page_side)
    REFERENCES binder_pages (anon_id, spread_id, side)
    ON DELETE CASCADE,
  CONSTRAINT binder_cards_anon_id_card_id_key UNIQUE (anon_id, card_id),
  CONSTRAINT binder_cards_page_position_key
    UNIQUE (anon_id, spread_id, page_side, position)
    DEFERRABLE INITIALLY IMMEDIATE
);

CREATE INDEX IF NOT EXISTS idx_binder_cards_card_id ON binder_cards (card_id);
