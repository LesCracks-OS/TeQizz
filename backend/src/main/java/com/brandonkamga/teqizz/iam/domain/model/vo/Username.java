package com.brandonkamga.teqizz.iam.domain.model.vo;

import com.brandonkamga.teqizz.shared.domain.ValueObject;

import java.util.Objects;

public record Username(String value) implements ValueObject {

    public Username {
        Objects.requireNonNull(value, "Username value must not be null");
        if (value.isBlank() || value.length() < 2 || value.length() > 50) {
            throw new IllegalArgumentException("Username must be between 2 and 50 characters");
        }
    }

    public static Username of(String value) {
        return new Username(value);
    }
}
