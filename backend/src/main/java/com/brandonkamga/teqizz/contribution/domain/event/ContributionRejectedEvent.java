package com.brandonkamga.teqizz.contribution.domain.event;

import com.brandonkamga.teqizz.contribution.domain.model.vo.ContributionId;
import com.brandonkamga.teqizz.shared.domain.DomainEvent;

public class ContributionRejectedEvent extends DomainEvent {
    private final ContributionId contributionId;

    public ContributionRejectedEvent(ContributionId contributionId) {
        this.contributionId = contributionId;
    }

    public ContributionId getContributionId() { return contributionId; }
}
