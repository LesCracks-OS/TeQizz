package com.brandonkamga.teqizz.gaming.smatch.domain.model;

import com.brandonkamga.teqizz.gaming.smatch.domain.model.vo.SmatchDeckId;
import com.brandonkamga.teqizz.gaming.smatch.domain.model.vo.SmatchMode;
import com.brandonkamga.teqizz.gaming.smatch.domain.model.vo.SmatchSessionId;
import com.brandonkamga.teqizz.shared.domain.AggregateRoot;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class SmatchSession extends AggregateRoot<SmatchSessionId> {

    private final SmatchSessionId id;
    private final Long userId;
    private final SmatchDeckId deckId;
    private final SmatchMode gameMode;
    private int livesRemaining;
    private int totalScore;
    private int pairsMatched;
    private int wrongAttempts;
    private final Integer timerDuration;
    private final LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private final List<SmatchAttempt> attempts;

    private SmatchSession(SmatchSessionId id, Long userId, SmatchDeckId deckId, SmatchMode gameMode,
                          int livesRemaining, int totalScore, int pairsMatched, int wrongAttempts,
                          Integer timerDuration, LocalDateTime startedAt, LocalDateTime completedAt,
                          List<SmatchAttempt> attempts) {
        this.id = id;
        this.userId = userId;
        this.deckId = deckId;
        this.gameMode = gameMode;
        this.livesRemaining = livesRemaining;
        this.totalScore = totalScore;
        this.pairsMatched = pairsMatched;
        this.wrongAttempts = wrongAttempts;
        this.timerDuration = timerDuration;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
        this.attempts = attempts != null ? new ArrayList<>(attempts) : new ArrayList<>();
    }

    public static SmatchSession reconstitute(Long id, Long userId, Long deckId, SmatchMode gameMode,
                                             int livesRemaining, int totalScore, int pairsMatched,
                                             int wrongAttempts, Integer timerDuration,
                                             LocalDateTime startedAt, LocalDateTime completedAt,
                                             List<SmatchAttempt> attempts) {
        return new SmatchSession(SmatchSessionId.of(id), userId, SmatchDeckId.of(deckId), gameMode,
                livesRemaining, totalScore, pairsMatched, wrongAttempts, timerDuration,
                startedAt, completedAt, attempts);
    }

    public void complete() {
        this.completedAt = LocalDateTime.now();
    }

    public boolean isCompleted() { return completedAt != null; }
    public boolean isGameOver() { return gameMode.hasLives() && livesRemaining <= 0; }

    public SmatchSessionId getId() { return id; }
    public Long getUserId() { return userId; }
    public SmatchDeckId getDeckId() { return deckId; }
    public SmatchMode getGameMode() { return gameMode; }
    public int getLivesRemaining() { return livesRemaining; }
    public int getTotalScore() { return totalScore; }
    public int getPairsMatched() { return pairsMatched; }
    public int getWrongAttempts() { return wrongAttempts; }
    public Integer getTimerDuration() { return timerDuration; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public List<SmatchAttempt> getAttempts() { return List.copyOf(attempts); }
}
