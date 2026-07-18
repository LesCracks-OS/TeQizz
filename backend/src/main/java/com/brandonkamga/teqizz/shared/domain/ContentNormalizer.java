package com.brandonkamga.teqizz.shared.domain;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.Normalizer;
import java.util.HexFormat;

/**
 * Canonicalises user/admin-authored text so that "trivially different" submissions collapse
 * to the same value — the backbone of the anti-redundancy guard.
 *
 * Normalisation is deliberately aggressive (accents, case, punctuation and spacing all removed)
 * so that "Qu'est-ce que HTTP ?", "quest ce que http", and "QUEST-CE QUE HTTP" hash identically.
 * The resulting hash is what we compare for an *exact* duplicate; fuzzy/near duplicates are found
 * separately with trigram similarity in SQL.
 *
 * IMPORTANT: this algorithm is the single source of truth for a content hash. Existing rows are
 * back-filled by running THIS same code (see the backfill runner), never by re-implementing it in
 * SQL — that guarantees Java-computed and back-filled hashes always agree.
 */
public final class ContentNormalizer {

    /** Separator inserted between multi-field hashes so "ab"+"c" never collides with "a"+"bc". */
    private static final String FIELD_SEPARATOR = "|"; // parts are already alnum-normalised, so "|" is a clean, collision-safe delimiter

    private ContentNormalizer() {}

    /** Canonical form: accent-stripped, lower-cased, only [a-z0-9] kept, single-spaced, trimmed. */
    public static String normalize(String raw) {
        if (raw == null) return "";
        String noAccents = Normalizer.normalize(raw, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "");
        String lowered = noAccents.toLowerCase();
        // Collapse anything that isn't a latin letter or digit into a single space.
        String cleaned = lowered.replaceAll("[^a-z0-9]+", " ");
        return cleaned.trim().replaceAll("\\s+", " ");
    }

    /** Normalise the given parts (joined) and return their SHA-256 hex digest. */
    public static String hash(String... parts) {
        StringBuilder joined = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            if (i > 0) joined.append(FIELD_SEPARATOR);
            joined.append(normalize(parts[i]));
        }
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(joined.toString().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
