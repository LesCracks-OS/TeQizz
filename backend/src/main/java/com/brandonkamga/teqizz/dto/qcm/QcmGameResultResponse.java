package com.brandonkamga.teqizz.dto.qcm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for the final results of a QCM game.
 * Survival Mode - Shows total questions answered, not a predefined limit.
 * Includes efficiency metric for cross-mode comparison.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcmGameResultResponse {

    private Long sessionId;
    private String categoryName;
    
    // Game mode info
    private String gameMode;           // BLITZ, RUSH, or CLASSIC
    private Integer globalTimerDuration; // Initial timer duration
    private Integer maxTimerDuration;    // Maximum time cap
    
    // Score summary
    private Integer totalScore;
    private Integer correctAnswers;
    private Integer wrongAnswers;
    private Integer totalQuestionsAnswered; // Questions answered in survival mode
    private Double accuracy;
    private Double efficiency;         // Score per minute - for cross-mode comparison
    
    // Game details
    private Integer livesRemaining;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Long durationSeconds;
    
    // End reason
    private String endReason; // "LIVES_DEPLETED" or "TIMER_EXPIRED"
    
    // Performance analysis
    private String performanceLevel; // e.g., "Excellent", "Good", "Average", "Needs Improvement"
    private Integer pointsEarned;
    
    // Difficulty progression
    private String startingDifficulty;
    private String endingDifficulty;
    private String maxDifficultyReached; // Highest difficulty reached during game
    
    // Detailed question review
    private List<QuestionReview> questionReviews;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionReview {
        private Integer questionIndex;
        private String questionContent;
        private String difficultyLevel;
        private String userAnswerContent;
        private String correctAnswerContent;
        private Boolean wasCorrect;
        private String explanation;
        private Integer timeTakenSeconds;
        private Integer pointsEarned;
    }
}
