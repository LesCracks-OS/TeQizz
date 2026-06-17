package com.brandonkamga.teqizz.contribution.domain.model.vo;

/**
 * Status of a contribution following a state machine:
 * DRAFT -> REVIEW -> APPROVED | REJECTED
 */
public enum ContributionStatus {
    DRAFT,
    REVIEW,
    APPROVED,
    REJECTED
}
