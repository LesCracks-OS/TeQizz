package com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "smatch_pairs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EntityListeners(AuditingEntityListener.class)
public class SmatchPairJpaEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_id", nullable = false)
    private SmatchDeckJpaEntity deck;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String term;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String definition;

    @Column(columnDefinition = "TEXT")
    private String hint;

    /**
     * SHA-256 of the normalised term+definition — rejects duplicate pairs within the same deck.
     * See {@code ContentNormalizer}; back-filled for legacy rows at startup.
     */
    @Column(name = "content_hash", length = 64)
    private String contentHash;

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
