package com.brandonkamga.teqizz.gaming.smatch.application.port.in;

import com.brandonkamga.teqizz.gaming.smatch.application.port.in.StartSmatchSessionUseCase.SmatchSessionView;

public interface GetSmatchSessionUseCase {
    SmatchSessionView getSession(Long sessionId);
}
