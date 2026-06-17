package com.brandonkamga.teqizz.gaming.smatch.domain.model;

import com.brandonkamga.teqizz.gaming.smatch.domain.model.vo.SmatchSessionId;
import com.brandonkamga.teqizz.shared.domain.DomainEntity;

import java.time.LocalDateTime;

public class SmatchAttempt extends DomainEntity<Long> {

    private final Long id;
    private final SmatchSessionId sessionId;
    private final Long pairId;
    private final boolean correct;
    private final Integer timeTakenMs;
    private final int pointsEarned;
    private final LocalDateTime attemptedAt;

    private SmatchAttempt(Long id, SmatchSessionId sessionId, Long pairId,
                          boolean correct, Integer timeTakenMs, int pointsEarned,
                          LocalDateTime attemptedAt) {
        this.id = id;
        this.sessionId = sessionId;
        this.pairId = pairId;
        this.correct = correct;
        this.timeTakenMs = timeTakenMs;
        this.pointsEarned = pointsEarned;
        this.attemptedAt = attemptedAt;
    }

    public static SmatchAttempt reconstitute(Long id, Long sessionId, Long pairId,
                                             boolean correct, Integer timeTakenMs,
                                             int pointsEarned, LocalDateTime attemptedAt) {
        return new SmatchAttempt(id, SmatchSessionId.of(sessionId), pairId,
                correct, timeTakenMs, pointsEarned, attemptedAt);
    }

    @Override
    protected Long getId() { return id; }
    public SmatchSessionId getSessionId() { return sessionId; }
    public Long getPairId() { return pairId; }
    public boolean isCorrect() { return correct; }
    public Integer getTimeTakenMs() { return timeTakenMs; }
    public int getPointsEarned() { return pointsEarned; }
    public LocalDateTime getAttemptedAt() { return attemptedAt; }
}
