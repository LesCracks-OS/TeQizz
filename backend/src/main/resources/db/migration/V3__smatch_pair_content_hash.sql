-- Anti-redundancy for Smatch pairs: reject duplicate term+definition within the same deck.
-- content_hash = SHA-256 of the normalised "term|definition". Uniqueness is enforced per deck in
-- the application layer (legacy data may already hold duplicates); the index keeps lookups cheap.
ALTER TABLE smatch_pairs ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_smatch_pairs_deck_hash
    ON smatch_pairs (deck_id, content_hash);
