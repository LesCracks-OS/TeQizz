package com.brandonkamga.teqizz.dto.qcm;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request DTO for submitting an answer in a QCM game.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcmSubmitAnswerRequest {

    @NotNull(message = "Question ID is required")
    private Long questionId;

    @NotNull(message = "Answer ID is required")
    private Long selectedAnswerId;

    private Integer timeTakenSeconds;

    @Builder.Default
    private Boolean usedHint = false;
}
