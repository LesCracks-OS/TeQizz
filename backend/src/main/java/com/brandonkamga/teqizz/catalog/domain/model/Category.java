package com.brandonkamga.teqizz.catalog.domain.model;

import com.brandonkamga.teqizz.catalog.domain.model.vo.CategoryId;
import com.brandonkamga.teqizz.shared.domain.AggregateRoot;

import java.time.LocalDateTime;

public class Category extends AggregateRoot<CategoryId> {

    private final CategoryId id;
    private String name;
    private String slug;
    private String description;
    private Integer displayOrder;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Category(CategoryId id, String name, String slug, String description,
                     Integer displayOrder, boolean active,
                     LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.displayOrder = displayOrder;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Category reconstitute(Long id, String name, String slug, String description,
                                        Integer displayOrder, Boolean active,
                                        LocalDateTime createdAt, LocalDateTime updatedAt) {
        return new Category(
                new CategoryId(id), name, slug, description,
                displayOrder != null ? displayOrder : 0,
                Boolean.TRUE.equals(active),
                createdAt, updatedAt
        );
    }

    public CategoryId getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public String getDescription() { return description; }
    public Integer getDisplayOrder() { return displayOrder; }
    public boolean isActive() { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
