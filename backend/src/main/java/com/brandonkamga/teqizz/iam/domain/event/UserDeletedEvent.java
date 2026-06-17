package com.brandonkamga.teqizz.iam.domain.event;

import com.brandonkamga.teqizz.iam.domain.model.vo.UserId;
import com.brandonkamga.teqizz.shared.domain.DomainEvent;

public class UserDeletedEvent extends DomainEvent {

    private final UserId userId;

    public UserDeletedEvent(UserId userId) {
        this.userId = userId;
    }

    public UserId getUserId() { return userId; }
}
