package com.brandonkamga.teqizz.gaming.qcm.application.port.in;

import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.GameMode;
import com.brandonkamga.teqizz.dto.qcm.QcmGameSessionResponse;

import java.util.List;

public interface StartQcmSessionUseCase {
    QcmGameSessionResponse start(StartSessionCommand command);

    record StartSessionCommand(Long userId, Long categoryId, List<Long> tagIds,
                                GameMode gameMode, Integer lives) {}
}
