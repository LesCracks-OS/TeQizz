package com.brandonkamga.teqizz.iam.domain.model.vo;

import com.brandonkamga.teqizz.shared.domain.ValueObject;

import java.util.Objects;

public record UserId(Long value) implements ValueObject {

    public UserId {
        Objects.requireNonNull(value, "UserId value must not be null");
    }

    public static UserId of(Long value) {
        return new UserId(value);
    }
}
