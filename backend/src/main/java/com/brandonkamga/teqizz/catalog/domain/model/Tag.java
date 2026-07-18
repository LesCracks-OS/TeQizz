package com.brandonkamga.teqizz.catalog.domain.model;

import com.brandonkamga.teqizz.catalog.domain.model.vo.CategoryId;
import com.brandonkamga.teqizz.catalog.domain.model.vo.TagId;
import com.brandonkamga.teqizz.shared.domain.DomainEntity;

import java.time.LocalDateTime;

public class Tag extends DomainEntity<TagId> {

    private final TagId id;
    private String name;
    private String slug;
    private String description;
    private boolean active;
    private CategoryId categoryId;
    private String categoryName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Tag(TagId id, String name, String slug, String description, boolean active,
                CategoryId categoryId, String categoryName,
                LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.active = active;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Tag reconstitute(Long id, String name, String slug, String description,
                                   Boolean active, Long categoryId, String categoryName,
                                   LocalDateTime createdAt, LocalDateTime updatedAt) {
        return new Tag(
                new TagId(id), name, slug, description,
                Boolean.TRUE.equals(active),
                categoryId != null ? new CategoryId(categoryId) : null,
                categoryName,
                createdAt, updatedAt
        );
    }

    public TagId getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public String getDescription() { return description; }
    public boolean isActive() { return active; }
    public CategoryId getCategoryId() { return categoryId; }
    public String getCategoryName() { return categoryName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
