package com.brandonkamga.teqizz.contribution.domain.event;

import com.brandonkamga.teqizz.contribution.domain.model.vo.ContributionId;
import com.brandonkamga.teqizz.shared.domain.DomainEvent;

public class ContributionApprovedEvent extends DomainEvent {
    private final ContributionId contributionId;
    private final Long questionId;

    public ContributionApprovedEvent(ContributionId contributionId, Long questionId) {
        this.contributionId = contributionId;
        this.questionId = questionId;
    }

    public ContributionId getContributionId() { return contributionId; }
    public Long getQuestionId() { return questionId; }
}
