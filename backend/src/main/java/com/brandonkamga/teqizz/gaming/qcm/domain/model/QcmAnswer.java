package com.brandonkamga.teqizz.gaming.qcm.domain.model;

import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QcmQuestionId;
import com.brandonkamga.teqizz.shared.domain.DomainEntity;

public class QcmAnswer extends DomainEntity<Long> {

    private final Long id;
    private final QcmQuestionId questionId;
    private String content;
    private boolean correct;
    private String explanation;
    private Integer displayOrder;

    private QcmAnswer(Long id, QcmQuestionId questionId, String content,
                      boolean correct, String explanation, Integer displayOrder) {
        this.id = id;
        this.questionId = questionId;
        this.content = content;
        this.correct = correct;
        this.explanation = explanation;
        this.displayOrder = displayOrder;
    }

    public static QcmAnswer reconstitute(Long id, Long questionId, String content,
                                         boolean correct, String explanation, Integer displayOrder) {
        return new QcmAnswer(id, new QcmQuestionId(questionId), content, correct, explanation, displayOrder);
    }

    public Long getId() { return id; }
    public QcmQuestionId getQuestionId() { return questionId; }
    public String getContent() { return content; }
    public boolean isCorrect() { return correct; }
    public String getExplanation() { return explanation; }
    public Integer getDisplayOrder() { return displayOrder; }
}
