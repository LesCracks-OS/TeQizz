package com.brandonkamga.teqizz.gaming.qcm.application.port.in;

import com.brandonkamga.teqizz.gaming.qcm.domain.model.QcmQuestion;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QcmQuestionLevel;

import java.util.List;

public interface SelectQcmQuestionsUseCase {
    List<QcmQuestion> selectForSession(Long categoryId, Long gameId, QcmQuestionLevel level,
                                       List<Long> tagIds, List<Long> excludeIds);
}
