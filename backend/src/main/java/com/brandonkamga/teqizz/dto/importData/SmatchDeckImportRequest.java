package com.brandonkamga.teqizz.dto.importData;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Import format for seeding Smatch decks from JSON (one file may hold several decks).
 * Mirrors the QCM {@code QuestionImportRequest} style so the loader stays consistent.
 */
@Getter
@Setter
@NoArgsConstructor
public class SmatchDeckImportRequest {

    private List<DeckData> decks;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class DeckData {
        private String name;
        private String description;
        private String categoryName;   // must match an existing category name (optional)
        private String difficulty;     // EASY | MEDIUM | HARD (defaults to EASY)
        private List<PairData> pairs;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class PairData {
        private String term;
        private String definition;
        private String hint;
    }
}
