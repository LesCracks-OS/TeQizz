package com.brandonkamga.teqizz.dto.qcm;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * Response DTO for QCM user statistics.
 * Provides comprehensive stats for the Performance page.
 */
@Data
@Builder
public class QcmUserStatsResponse {

    // Core stats
    private int totalGamesPlayed;
    private int totalQuestionsAnswered;
    private int totalCorrectAnswers;
    private int totalWrongAnswers;
    private double overallAccuracy;        // Average of per-game accuracies (not total)
    private int totalPointsEarned;
    private int bestScore;
    private double averageScore;

    // Recent performance
    private double recentAccuracy; // Average accuracy of last 10 games
    private int recentGamesPlayed;
    private int currentStreak; // Days in a row playing
    private String highestDifficultyReached; // Highest difficulty level reached by user

    // Performance by difficulty level
    private String bestPerformingLevel;    // Difficulty level where player performs best
    private Map<String, Double> accuracyByDifficulty; // EASY: 85%, MEDIUM: 70%, etc.
    private Map<String, Integer> questionsByDifficulty; // EASY: 10, MEDIUM: 5, etc.

    // Category breakdown
    private List<CategoryStats> categoryStats;

    // Game mode breakdown
    private List<GameModeStats> gameModeStats;

    // Recent games history
    private List<RecentGame> recentGames;

    // Leaderboard position
    private int leaderboardPosition;
    private int totalPlayers;
    private double rating; // Fair composite rating [0,100) — same metric that decides the leaderboard rank

    @Data
    @Builder
    public static class CategoryStats {
        private Long categoryId;
        private String categoryName;
        private int gamesPlayed;
        private int questionsAnswered;
        private double accuracy;
        private int bestScore;
        private double averageScore;
    }

    @Data
    @Builder
    public static class RecentGame {
        private Long sessionId;
        private String categoryName;
        private int score;
        private int correctAnswers;
        private int totalQuestions;
        private double accuracy;
        private String difficultyReached;
        private String completedAt;
        private int durationSeconds;
    }

    @Data
    @Builder
    public static class GameModeStats {
        private String gameMode;           // BLITZ, RUSH, CLASSIC
        private int gamesPlayed;
        private int totalScore;
        private double averageScore;
        private int bestScore;
        private double accuracy;
        private int totalQuestions;
        private int correctAnswers;
    }
}
