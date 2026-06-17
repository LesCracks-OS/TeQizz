package com.brandonkamga.teqizz.dto.qcm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Response DTO after submitting an answer in a QCM game.
 * Survival Mode - Game ends only when timer expires or lives run out.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcmSubmitAnswerResponse {

    private Boolean isCorrect;
    private String explanation;
    private Long correctAnswerId;
    private String correctAnswerContent;
    
    // Updated game state
    private Integer currentScore;
    private Integer correctAnswers;
    private Integer wrongAnswers;
    private Integer livesRemaining;
    private Integer questionsAnswered;
    // No totalQuestions - infinite mode
    
    // Game status
    private Boolean isGameOver; // True when lives = 0
    private Boolean timerExpired; // True when global timer ran out
    private String difficultyLevel; // Current difficulty level
    
    // Next question info (if game continues)
    private Boolean hasNextQuestion;
    private Integer nextQuestionIndex;
    
    // Time adjustment: positive = bonus for correct answer, negative = penalty for wrong answer
    // EASY correct: +1s, MEDIUM correct: +2s, HARD correct: +3s, EXPERT correct: +5s
    // Wrong answer: -3s
    private Integer timeAdjustment;
}
