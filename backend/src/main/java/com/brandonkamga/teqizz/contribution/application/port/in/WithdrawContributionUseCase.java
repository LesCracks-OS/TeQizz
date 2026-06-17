package com.brandonkamga.teqizz.contribution.application.port.in;

public interface WithdrawContributionUseCase {
    void withdraw(Long questionId, Long userId);
}
