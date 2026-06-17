package com.brandonkamga.teqizz.shared.domain;

import java.util.Objects;

public abstract class DomainEntity<ID> {

    protected abstract ID getId();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DomainEntity<?> that = (DomainEntity<?>) o;
        return Objects.equals(getId(), that.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getId());
    }
}
