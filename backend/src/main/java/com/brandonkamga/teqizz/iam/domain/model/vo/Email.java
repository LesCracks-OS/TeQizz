package com.brandonkamga.teqizz.iam.domain.model.vo;

import com.brandonkamga.teqizz.shared.domain.ValueObject;

import java.util.Objects;

public record Email(String value) implements ValueObject {

    public Email {
        Objects.requireNonNull(value, "Email value must not be null");
        if (value.isBlank() || !value.contains("@")) {
            throw new IllegalArgumentException("Invalid email: " + value);
        }
    }

    public static Email of(String value) {
        return new Email(value);
    }
}
