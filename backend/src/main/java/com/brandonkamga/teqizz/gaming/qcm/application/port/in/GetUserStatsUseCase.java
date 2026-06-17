package com.brandonkamga.teqizz.gaming.qcm.application.port.in;

import com.brandonkamga.teqizz.dto.qcm.QcmUserStatsResponse;

public interface GetUserStatsUseCase {
    QcmUserStatsResponse getStats(Long userId);
}
