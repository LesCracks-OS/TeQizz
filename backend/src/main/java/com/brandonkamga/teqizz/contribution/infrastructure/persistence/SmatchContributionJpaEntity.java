package com.brandonkamga.teqizz.contribution.infrastructure.persistence;

import com.brandonkamga.teqizz.contribution.domain.model.vo.ContributionStatus;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.UserJpaEntity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * A user-proposed Smatch deck awaiting moderation — the Smatch counterpart of a QCM question
 * contribution, kept as a DISTINCT flow (its own table, workflow and admin review) rather than
 * bolted onto the QCM contribution path. On approval it becomes a real {@code smatch_decks} row.
 */
@Entity
@Table(name = "smatch_contributions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EntityListeners(AuditingEntityListener.class)
public class SmatchContributionJpaEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by", nullable = false)
    private UserJpaEntity submittedBy;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(nullable = false)
    @Builder.Default
    private String difficulty = "EASY";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ContributionStatus status = ContributionStatus.REVIEW;

    @Column(name = "reviewer_id")
    private Long reviewerId;

    @Column(name = "reject_reason", columnDefinition = "TEXT")
    private String rejectReason;

    /** Set once approved: the id of the created {@code smatch_decks} row. */
    @Column(name = "approved_deck_id")
    private Long approvedDeckId;

    @OneToMany(mappedBy = "contribution", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SmatchContributionPairJpaEntity> pairs = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    public void addPair(SmatchContributionPairJpaEntity pair) {
        pair.setContribution(this);
        pairs.add(pair);
    }
}
