package com.brandonkamga.teqizz.catalog.domain.model.vo;

import com.brandonkamga.teqizz.shared.domain.ValueObject;
import java.util.Objects;

public record CategoryId(Long value) implements ValueObject {
    public CategoryId { Objects.requireNonNull(value, "CategoryId must not be null"); }
    public static CategoryId of(Long value) { return new CategoryId(value); }
}
