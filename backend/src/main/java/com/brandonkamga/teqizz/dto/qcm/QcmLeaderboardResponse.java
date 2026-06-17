package com.brandonkamga.teqizz.dto.qcm;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Response DTO for QCM Leaderboard.
 * Supports filtering by game mode for fair comparison.
 */
@Data
@Builder
public class QcmLeaderboardResponse {

    private String gameMode;           // Filter mode: BLITZ, RUSH, CLASSIC, or ALL
    private List<LeaderboardEntry> entries;
    private int totalPlayers;
    private int currentPage;
    private int totalPages;

    @Data
    @Builder
    public static class LeaderboardEntry {
        private int rank;
        private Long userId;
        private String username;
        private String avatarUrl;
        
        // Primary ranking metric (composite score 0-100)
        private double compositeScore;    // Normalized score for objective ranking
        
        // QCM-specific stats
        private int totalScore;           // Total points earned across all games
        private int gamesPlayed;
        private double accuracy;          // Overall accuracy percentage
        private int bestScore;            // Best single game score
        private double averageScore;      // Average score per game - PRIMARY METRIC
        private double bestEfficiency;    // Best efficiency (score per minute) achieved
        private String topCategory;       // Category with best performance
        
        // Game mode breakdown
        private int blitzGamesPlayed;
        private int rushGamesPlayed;
        private int classicGamesPlayed;
        
        // Difficulty achievements
        private String highestDifficulty;
        private int difficultyFactor;     // Numeric difficulty level (1-4)
        private int hardQuestionsAnswered;
        private int expertQuestionsAnswered;
    }
}
