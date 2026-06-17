package com.brandonkamga.teqizz.gaming.smatch.domain.model.vo;

public enum SmatchMode {

    TIME_ATTACK("Time Attack", 90, 10, 5, 8, 3),
    ZEN("Zen", 0, 5, 0, 0, 0),
    SURVIVAL("Survival", 120, 15, 10, 15, 3);

    private final String displayName;
    private final int initialTimeSeconds;
    private final int pointsPerCorrect;
    private final int timeBonusSeconds;
    private final int timePenaltySeconds;
    private final int maxLives;

    SmatchMode(String displayName, int initialTimeSeconds, int pointsPerCorrect,
               int timeBonusSeconds, int timePenaltySeconds, int maxLives) {
        this.displayName = displayName;
        this.initialTimeSeconds = initialTimeSeconds;
        this.pointsPerCorrect = pointsPerCorrect;
        this.timeBonusSeconds = timeBonusSeconds;
        this.timePenaltySeconds = timePenaltySeconds;
        this.maxLives = maxLives;
    }

    public String getDisplayName() { return displayName; }
    public int getInitialTimeSeconds() { return initialTimeSeconds; }
    public int getPointsPerCorrect() { return pointsPerCorrect; }
    public int getTimeBonusSeconds() { return timeBonusSeconds; }
    public int getTimePenaltySeconds() { return timePenaltySeconds; }
    public int getMaxLives() { return maxLives; }
    public boolean hasTimer() { return initialTimeSeconds > 0; }
    public boolean hasLives() { return maxLives > 0; }
}
