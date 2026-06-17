package com.brandonkamga.teqizz.dto.importData;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Response DTO after importing questions from JSON.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionImportResponse {

    private boolean success;
    private int imported;
    private int skipped;
    private int total;
    
    // Tags that were created automatically (normalized to lowercase)
    private List<String> createdTags;
    
    // Errors encountered during import
    private List<ImportError> errors;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ImportError {
        private int questionIndex;
        private String questionContent;
        private String error;
    }
}
