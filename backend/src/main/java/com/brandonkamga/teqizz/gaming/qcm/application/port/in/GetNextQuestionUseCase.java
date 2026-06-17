package com.brandonkamga.teqizz.gaming.qcm.application.port.in;

import com.brandonkamga.teqizz.dto.qcm.QcmQuestionResponse;

public interface GetNextQuestionUseCase {
    QcmQuestionResponse getNext(Long sessionId);
}
