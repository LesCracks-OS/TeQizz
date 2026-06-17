package com.brandonkamga.teqizz.gaming.qcm.domain.model.vo;

import com.brandonkamga.teqizz.shared.domain.ValueObject;

public record Lives(int value) implements ValueObject {
    public Lives {
        if (value < 0) throw new IllegalArgumentException("Lives cannot be negative");
    }
    public static Lives of(int value) { return new Lives(value); }
    public Lives decrement() { return new Lives(Math.max(0, this.value - 1)); }
    public boolean isZero() { return this.value == 0; }
}
