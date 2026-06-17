package com.brandonkamga.teqizz.gaming.qcm.domain.model.vo;

import com.brandonkamga.teqizz.shared.domain.ValueObject;

public record Score(int value) implements ValueObject {
    public Score {
        if (value < 0) throw new IllegalArgumentException("Score cannot be negative");
    }
    public static Score of(int value) { return new Score(value); }
    public Score add(int points) { return new Score(this.value + points); }
}
