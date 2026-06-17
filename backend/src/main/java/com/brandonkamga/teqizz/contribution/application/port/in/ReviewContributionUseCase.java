package com.brandonkamga.teqizz.contribution.application.port.in;

public interface ReviewContributionUseCase {
    void review(Long questionId, String decision);
}
