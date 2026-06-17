package com.brandonkamga.teqizz.gaming.qcm.domain.model.vo;

/**
 * Game modes for QCM games.
 * Each mode has different time constraints and scoring multipliers.
 */
public enum GameMode {
    BLITZ(60, 90, "Blitz"),
    RUSH(120, 150, "Rush"),
    CLASSIC(300, 360, "Classic");

    private final int initialTimeSeconds;
    private final int maxTimeSeconds;
    private final String displayName;

    GameMode(int initialTimeSeconds, int maxTimeSeconds, String displayName) {
        this.initialTimeSeconds = initialTimeSeconds;
        this.maxTimeSeconds = maxTimeSeconds;
        this.displayName = displayName;
    }

    public int getInitialTimeSeconds() {
        return initialTimeSeconds;
    }

    public int getMaxTimeSeconds() {
        return maxTimeSeconds;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Get points for a question based on difficulty and game mode.
     */
    public int getPointsForDifficulty(QuestionLevelType difficulty) {
        return switch (this) {
            case BLITZ -> switch (difficulty) {
                case EASY -> 3;
                case MEDIUM -> 6;
                case HARD -> 12;
                case EXPERT -> 24;
            };
            case RUSH -> switch (difficulty) {
                case EASY -> 2;
                case MEDIUM -> 4;
                case HARD -> 8;
                case EXPERT -> 16;
            };
            case CLASSIC -> switch (difficulty) {
                case EASY -> 1;
                case MEDIUM -> 2;
                case HARD -> 4;
                case EXPERT -> 8;
            };
        };
    }

    /**
     * Get time bonus for correct answer based on difficulty and game mode.
     */
    public int getTimeBonusForDifficulty(QuestionLevelType difficulty) {
        return switch (this) {
            case BLITZ -> switch (difficulty) {
                case EASY -> 2;
                case MEDIUM -> 3;
                case HARD -> 4;
                case EXPERT -> 4;
            };
            case RUSH -> switch (difficulty) {
                case EASY -> 1;
                case MEDIUM -> 2;
                case HARD -> 3;
                case EXPERT -> 3;
            };
            case CLASSIC -> switch (difficulty) {
                case EASY -> 1;
                case MEDIUM -> 1;
                case HARD -> 2;
                case EXPERT -> 2;
            };
        };
    }

    /**
     * Get time penalty for wrong answer based on game mode.
     */
    public int getTimePenalty() {
        return switch (this) {
            case BLITZ -> 3;
            case RUSH -> 2;
            case CLASSIC -> 2;
        };
    }

    /**
     * Get score threshold for progressing to next difficulty level.
     */
    public int getThresholdForLevel(QuestionLevelType targetLevel) {
        return switch (this) {
            case BLITZ -> switch (targetLevel) {
                case EASY -> 0;      // Starting level
                case MEDIUM -> 20;   // EASY -> MEDIUM
                case HARD -> 50;     // MEDIUM -> HARD
                case EXPERT -> 100;  // HARD -> EXPERT
            };
            case RUSH -> switch (targetLevel) {
                case EASY -> 0;
                case MEDIUM -> 40;
                case HARD -> 100;
                case EXPERT -> 200;
            };
            case CLASSIC -> switch (targetLevel) {
                case EASY -> 0;
                case MEDIUM -> 60;
                case HARD -> 150;
                case EXPERT -> 300;
            };
        };
    }

    /**
     * Determine current difficulty level based on score.
     */
    public QuestionLevelType determineDifficulty(int score) {
        if (score >= getThresholdForLevel(QuestionLevelType.EXPERT)) {
            return QuestionLevelType.EXPERT;
        } else if (score >= getThresholdForLevel(QuestionLevelType.HARD)) {
            return QuestionLevelType.HARD;
        } else if (score >= getThresholdForLevel(QuestionLevelType.MEDIUM)) {
            return QuestionLevelType.MEDIUM;
        } else {
            return QuestionLevelType.EASY;
        }
    }

    /**
     * Calculate efficiency score (score per minute).
     */
    public double calculateEfficiency(int score, int timeUsedSeconds) {
        if (timeUsedSeconds <= 0) {
            return 0.0;
        }
        return (score * 60.0) / timeUsedSeconds;
    }
}
