package com.brandonkamga.teqizz.dto.importData;

import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QuestionLevelType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Request DTO for importing questions from JSON file.
 * Category must exist in database.
 * Tags are created automatically (normalized to lowercase).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionImportRequest {

    @NotBlank(message = "Category name is required")
    private String categoryName;

    @NotEmpty(message = "At least one question is required")
    @Valid
    private List<QuestionData> questions;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionData {
        
        @NotBlank(message = "Question content is required")
        private String content;
        
        private String hint;
        
        private String explanation;
        
        @NotNull(message = "Difficulty level is required")
        private QuestionLevelType difficulty;
        
        private List<String> tags;
        
        @NotEmpty(message = "At least 2 answers are required")
        @Valid
        private List<AnswerData> answers;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnswerData {
        
        @NotBlank(message = "Answer content is required")
        private String content;
        
        @NotNull(message = "isCorrect flag is required")
        private Boolean isCorrect;
    }
}
