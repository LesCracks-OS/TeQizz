package com.brandonkamga.teqizz.gaming.qcm.domain.event;

import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.SessionId;
import com.brandonkamga.teqizz.shared.domain.DomainEvent;

public class QcmSessionStartedEvent extends DomainEvent {
    private final SessionId sessionId;
    private final Long userId;

    public QcmSessionStartedEvent(SessionId sessionId, Long userId) {
        this.sessionId = sessionId;
        this.userId = userId;
    }

    public SessionId getSessionId() { return sessionId; }
    public Long getUserId() { return userId; }
}
