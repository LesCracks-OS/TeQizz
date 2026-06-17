package com.brandonkamga.teqizz.gaming.qcm.application.port.in;

import com.brandonkamga.teqizz.dto.qcm.QcmGameResultResponse;

public interface GetSessionResultUseCase {
    QcmGameResultResponse getResult(Long sessionId);
}
