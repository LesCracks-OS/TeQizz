-- User-proposed Smatch decks awaiting moderation — a flow distinct from QCM contributions.
CREATE TABLE IF NOT EXISTS smatch_contributions (
    id               BIGSERIAL PRIMARY KEY,
    submitted_by     BIGINT NOT NULL REFERENCES users (id),
    name             VARCHAR(255) NOT NULL,
    description      TEXT,
    category_id      BIGINT,
    difficulty       VARCHAR(20) NOT NULL DEFAULT 'EASY',
    status           VARCHAR(20) NOT NULL DEFAULT 'REVIEW',
    reviewer_id      BIGINT,
    reject_reason    TEXT,
    approved_deck_id BIGINT,
    created_at       TIMESTAMP NOT NULL DEFAULT now(),
    reviewed_at      TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_smatch_contributions_status ON smatch_contributions (status);
CREATE INDEX IF NOT EXISTS idx_smatch_contributions_user ON smatch_contributions (submitted_by);

CREATE TABLE IF NOT EXISTS smatch_contribution_pairs (
    id              BIGSERIAL PRIMARY KEY,
    contribution_id BIGINT NOT NULL REFERENCES smatch_contributions (id) ON DELETE CASCADE,
    term            TEXT NOT NULL,
    definition      TEXT NOT NULL,
    hint            TEXT
);

CREATE INDEX IF NOT EXISTS idx_smatch_contribution_pairs_contribution
    ON smatch_contribution_pairs (contribution_id);
