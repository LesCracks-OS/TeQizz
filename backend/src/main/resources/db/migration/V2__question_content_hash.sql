-- Anti-redundancy for QCM questions.
-- content_hash = SHA-256 of the normalised question text (exact-duplicate guard).
-- Non-unique index on purpose: existing data may hold duplicates, so uniqueness is enforced
-- in the application layer (and legacy dupes surface in the admin dedup queue).
ALTER TABLE questions ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_questions_content_hash ON questions (content_hash);

-- Trigram similarity for near-duplicate ("fuzzy") detection is a NICE-TO-HAVE.
-- Enabling the pg_trgm extension needs elevated privileges that a managed/hardened DB role
-- may lack — so we attempt it defensively and DEGRADE GRACEFULLY rather than fail the boot.
-- (Fuzzy search simply returns nothing until pg_trgm is enabled manually.)
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_trgm not enabled (%). Fuzzy duplicate search disabled until enabled manually.', SQLERRM;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
        CREATE INDEX IF NOT EXISTS idx_questions_content_trgm
            ON questions USING gin (content gin_trgm_ops);
    END IF;
END $$;
