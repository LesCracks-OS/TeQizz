package com.brandonkamga.teqizz.gaming.smatch.domain.model.vo;

import com.brandonkamga.teqizz.shared.domain.ValueObject;
import java.util.Objects;

public record SmatchSessionId(Long value) implements ValueObject {
    public SmatchSessionId { Objects.requireNonNull(value, "SmatchSessionId must not be null"); }
    public static SmatchSessionId of(Long value) { return new SmatchSessionId(value); }
}
