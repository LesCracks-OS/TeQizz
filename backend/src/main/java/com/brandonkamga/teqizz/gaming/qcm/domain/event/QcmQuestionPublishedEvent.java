package com.brandonkamga.teqizz.gaming.qcm.domain.event;

import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QcmQuestionId;
import com.brandonkamga.teqizz.shared.domain.DomainEvent;

public class QcmQuestionPublishedEvent extends DomainEvent {
    private final QcmQuestionId questionId;

    public QcmQuestionPublishedEvent(QcmQuestionId questionId) {
        this.questionId = questionId;
    }

    public QcmQuestionId getQuestionId() { return questionId; }
}
