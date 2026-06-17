package com.brandonkamga.teqizz.catalog.domain.model.vo;

import com.brandonkamga.teqizz.shared.domain.ValueObject;
import java.util.Objects;

public record TagId(Long value) implements ValueObject {
    public TagId { Objects.requireNonNull(value, "TagId must not be null"); }
    public static TagId of(Long value) { return new TagId(value); }
}
