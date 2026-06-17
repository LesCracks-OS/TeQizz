package com.brandonkamga.teqizz.gaming.qcm.application.port.in;

import com.brandonkamga.teqizz.dto.qcm.QcmLeaderboardResponse;

public interface GetLeaderboardUseCase {
    QcmLeaderboardResponse getLeaderboard(int page, int size, Long categoryId, String gameMode);
}
