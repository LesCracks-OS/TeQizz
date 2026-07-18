package com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.entity;

import com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity.CategoryJpaEntity;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity.TagJpaEntity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "smatch_decks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class SmatchDeckJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private CategoryJpaEntity category;

    /**
     * Reusable catalog tags applied to this deck. Smatch owns the join table
     * ({@code smatch_deck_tags}), so the dependency points smatch → catalog — the same
     * way QCM's {@code question_tags} works. Tags themselves stay game-agnostic.
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "smatch_deck_tags",
        joinColumns = @JoinColumn(name = "deck_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private Set<TagJpaEntity> tags = new HashSet<>();

    @Column(nullable = false)
    @Builder.Default
    private String difficulty = "EASY";

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
