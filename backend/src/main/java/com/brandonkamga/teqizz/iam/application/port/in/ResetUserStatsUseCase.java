package com.brandonkamga.teqizz.iam.application.port.in;

/**
 * Inbound port for resetting user game stats.
 */
public interface ResetUserStatsUseCase {
    void reset(Long userId);
}
