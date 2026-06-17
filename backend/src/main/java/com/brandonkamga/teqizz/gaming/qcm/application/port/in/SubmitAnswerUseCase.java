package com.brandonkamga.teqizz.gaming.qcm.application.port.in;

import com.brandonkamga.teqizz.dto.qcm.QcmSubmitAnswerRequest;
import com.brandonkamga.teqizz.dto.qcm.QcmSubmitAnswerResponse;

public interface SubmitAnswerUseCase {
    QcmSubmitAnswerResponse submit(Long sessionId, QcmSubmitAnswerRequest request);
}
