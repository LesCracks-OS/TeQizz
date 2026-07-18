package com.brandonkamga.teqizz.contribution.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.*;

/** A proposed term/definition pair belonging to a {@link SmatchContributionJpaEntity}. */
@Entity
@Table(name = "smatch_contribution_pairs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SmatchContributionPairJpaEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contribution_id", nullable = false)
    private SmatchContributionJpaEntity contribution;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String term;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String definition;

    @Column(columnDefinition = "TEXT")
    private String hint;
}
