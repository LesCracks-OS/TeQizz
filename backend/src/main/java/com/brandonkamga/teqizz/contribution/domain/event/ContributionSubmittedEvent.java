package com.brandonkamga.teqizz.contribution.domain.event;

import com.brandonkamga.teqizz.contribution.domain.model.vo.ContributionId;
import com.brandonkamga.teqizz.shared.domain.DomainEvent;

public class ContributionSubmittedEvent extends DomainEvent {
    private final ContributionId contributionId;

    public ContributionSubmittedEvent(ContributionId contributionId) {
        this.contributionId = contributionId;
    }

    public ContributionId getContributionId() { return contributionId; }
}
