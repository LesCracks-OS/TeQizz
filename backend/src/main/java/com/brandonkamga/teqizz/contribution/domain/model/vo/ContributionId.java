package com.brandonkamga.teqizz.contribution.domain.model.vo;

import com.brandonkamga.teqizz.shared.domain.ValueObject;
import java.util.Objects;

public record ContributionId(Long value) implements ValueObject {
    public ContributionId { Objects.requireNonNull(value, "ContributionId must not be null"); }
    public static ContributionId of(Long value) { return new ContributionId(value); }
}
