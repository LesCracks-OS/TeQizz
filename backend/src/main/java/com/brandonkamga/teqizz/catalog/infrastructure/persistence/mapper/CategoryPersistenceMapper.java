package com.brandonkamga.teqizz.catalog.infrastructure.persistence.mapper;

import com.brandonkamga.teqizz.catalog.domain.model.Category;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity.CategoryJpaEntity;
import org.springframework.stereotype.Component;

@Component
public class CategoryPersistenceMapper {

    public Category toDomain(CategoryJpaEntity entity) {
        if (entity == null) return null;
        return Category.reconstitute(
                entity.getId(),
                entity.getName(),
                entity.getSlug(),
                entity.getDescription(),
                entity.getDisplayOrder(),
                entity.getIsActive(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
