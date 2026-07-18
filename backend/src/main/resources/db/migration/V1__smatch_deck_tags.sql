-- Smatch decks can carry reusable catalog tags, just like QCM questions.
-- Smatch owns this join table (dependency points smatch -> catalog).
CREATE TABLE IF NOT EXISTS smatch_deck_tags (
    deck_id BIGINT NOT NULL REFERENCES smatch_decks (id) ON DELETE CASCADE,
    tag_id  BIGINT NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
    PRIMARY KEY (deck_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_smatch_deck_tags_tag ON smatch_deck_tags (tag_id);
