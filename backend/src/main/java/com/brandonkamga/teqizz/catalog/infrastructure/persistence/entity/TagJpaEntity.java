package com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Index;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Tag JPA entity — a reusable catalog concept, shared across games (QCM, Smatch, …).
 *
 * The catalog context intentionally knows NOTHING about the games that consume it:
 * each game owns its own join table to tags (e.g. QCM's {@code question_tags}), so the
 * dependency always points game → catalog, never the reverse. This keeps tags reusable.
 *
 * Tags may optionally belong to a category (specialty tags like React, SpringBoot, etc.).
 */
@Entity
@Table(name = "tags", indexes = {
    @Index(name = "idx_tags_category", columnList = "category_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class TagJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(unique = true, length = 50)
    private String slug;

    @Column(length = 200)
    private String description;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    /**
     * Category this tag belongs to.
     * This allows specialty tags like React (Frontend), SpringBoot (Backend), etc.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private CategoryJpaEntity category;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
