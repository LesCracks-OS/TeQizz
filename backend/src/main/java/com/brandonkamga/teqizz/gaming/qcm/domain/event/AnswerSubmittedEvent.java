package com.brandonkamga.teqizz.gaming.qcm.domain.event;

import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.SessionId;
import com.brandonkamga.teqizz.shared.domain.DomainEvent;

public class AnswerSubmittedEvent extends DomainEvent {
    private final SessionId sessionId;
    private final Long questionId;
    private final boolean correct;

    public AnswerSubmittedEvent(SessionId sessionId, Long questionId, boolean correct) {
        this.sessionId = sessionId;
        this.questionId = questionId;
        this.correct = correct;
    }

    public SessionId getSessionId() { return sessionId; }
    public Long getQuestionId() { return questionId; }
    public boolean isCorrect() { return correct; }
}
