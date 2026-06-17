package com.brandonkamga.teqizz.gaming.qcm.application.port.in;

import com.brandonkamga.teqizz.gaming.qcm.domain.model.QcmQuestion;

import java.util.List;

public interface CreateQcmQuestionUseCase {

    record CreateQcmQuestionCommand(Long categoryId, String content, String explanation, String hint,
                                    String level, List<Long> tagIds) {}

    QcmQuestion create(CreateQcmQuestionCommand command);
}
