package com.brandonkamga.teqizz.shared.infrastructure.event;

import com.brandonkamga.teqizz.shared.domain.AggregateRoot;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class DomainEventPublisher {

    private final ApplicationEventPublisher publisher;

    public DomainEventPublisher(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    public void publishAll(AggregateRoot<?> aggregate) {
        aggregate.pullDomainEvents().forEach(publisher::publishEvent);
    }
}
