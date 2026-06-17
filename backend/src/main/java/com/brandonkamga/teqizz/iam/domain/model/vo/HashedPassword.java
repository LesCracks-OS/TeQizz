package com.brandonkamga.teqizz.iam.domain.model.vo;

import com.brandonkamga.teqizz.shared.domain.ValueObject;

/**
 * Value object representing a hashed password.
 * The hashing is done outside of this class — this just wraps the hash string.
 */
public record HashedPassword(String value) implements ValueObject {

    public static HashedPassword of(String hashedValue) {
        return new HashedPassword(hashedValue);
    }
}
