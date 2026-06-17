package com.brandonkamga.teqizz.dto.qcm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Response DTO for a created QCM game session.
 * Survival Mode - Infinite questions until timer expires or lives run out.
 * Everyone starts at EASY difficulty - progression is score-based per game mode.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcmGameSessionResponse {

    private Long sessionId;
    private Long categoryId;
    private String categoryName;
    private Integer livesRemaining;
    private Integer currentQuestionIndex;
    private Integer globalTimerDuration; // Initial time in seconds for the session
    private Integer maxTimerDuration;    // Maximum time cap in seconds
    private LocalDateTime startedAt;
    private String status;
    private String currentDifficulty; // Current difficulty based on score (always starts as EASY)
    private String gameMode;          // BLITZ, RUSH, or CLASSIC
}
