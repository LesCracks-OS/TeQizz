package com.brandonkamga.teqizz.contribution.application.port.in;

import java.util.List;

public interface GetMyContributionsUseCase {
    List<SubmitContributionUseCase.ContributionView> getMyContributions(Long userId);
}
