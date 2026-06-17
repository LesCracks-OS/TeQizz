package com.brandonkamga.teqizz.dto.qcm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Response DTO for a QCM question sent to the frontend.
 * Survival Mode - Only shows current question number, not total.
 * Does NOT include which answer is correct (to prevent cheating).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcmQuestionResponse {

    private Long questionId;
    private Integer questionIndex; // Current question number only (no total)
    private String content;
    private String hint;
    private Boolean showHint;
    private String difficultyLevel;
    private List<AnswerOption> answers;
    // No timeLimitSeconds - timer is global for the entire session

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnswerOption {
        private Long answerId;
        private String content;
        private Integer displayOrder;
    }
}
