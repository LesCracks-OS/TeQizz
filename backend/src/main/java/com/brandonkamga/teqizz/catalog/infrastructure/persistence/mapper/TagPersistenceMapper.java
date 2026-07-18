package com.brandonkamga.teqizz.catalog.infrastructure.persistence.mapper;

import com.brandonkamga.teqizz.catalog.domain.model.Tag;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity.TagJpaEntity;
import org.springframework.stereotype.Component;

@Component
public class TagPersistenceMapper {

    public Tag toDomain(TagJpaEntity entity) {
        if (entity == null) return null;
        Long catId = entity.getCategory() != null ? entity.getCategory().getId() : null;
        String catName = entity.getCategory() != null ? entity.getCategory().getName() : null;
        return Tag.reconstitute(
                entity.getId(),
                entity.getName(),
                entity.getSlug(),
                entity.getDescription(),
                entity.getIsActive(),
                catId,
                catName,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
