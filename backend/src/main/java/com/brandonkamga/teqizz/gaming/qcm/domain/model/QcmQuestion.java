package com.brandonkamga.teqizz.gaming.qcm.domain.model;

import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QcmQuestionId;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QcmQuestionLevel;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QcmQuestionStatus;
import com.brandonkamga.teqizz.shared.domain.AggregateRoot;

import java.util.List;

public class QcmQuestion extends AggregateRoot<QcmQuestionId> {

    private final QcmQuestionId id;
    private final String content;
    private final String explanation;
    private final String hint;
    private final QcmQuestionLevel level;
    private final QcmQuestionStatus status;
    private final Long categoryId;
    private final List<QcmAnswer> answers;

    private QcmQuestion(QcmQuestionId id, String content, String explanation, String hint,
                        QcmQuestionLevel level, QcmQuestionStatus status,
                        Long categoryId, List<QcmAnswer> answers) {
        this.id = id;
        this.content = content;
        this.explanation = explanation;
        this.hint = hint;
        this.level = level;
        this.status = status;
        this.categoryId = categoryId;
        this.answers = answers != null ? List.copyOf(answers) : List.of();
    }

    public static QcmQuestion reconstitute(Long id, String content, String explanation, String hint,
                                           QcmQuestionLevel level, QcmQuestionStatus status,
                                           Long categoryId, List<QcmAnswer> answers) {
        return new QcmQuestion(QcmQuestionId.of(id), content, explanation, hint,
                level, status, categoryId, answers);
    }

    public QcmQuestionId getId() { return id; }
    public String getContent() { return content; }
    public String getExplanation() { return explanation; }
    public String getHint() { return hint; }
    public QcmQuestionLevel getLevel() { return level; }
    public QcmQuestionStatus getStatus() { return status; }
    public Long getCategoryId() { return categoryId; }
    public List<QcmAnswer> getAnswers() { return answers; }
}
