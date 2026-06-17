package com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.entity;

import com.brandonkamga.teqizz.gaming.smatch.domain.model.vo.SmatchGameMode;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.UserJpaEntity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "smatch_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EntityListeners(AuditingEntityListener.class)
public class SmatchSessionJpaEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserJpaEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_id")
    private SmatchDeckJpaEntity deck;

    @Enumerated(EnumType.STRING)
    @Column(name = "game_mode", nullable = false)
    private SmatchGameMode gameMode;

    @Column(name = "lives_remaining")
    private Integer livesRemaining;

    @Column(name = "total_score")
    @Builder.Default
    private Integer totalScore = 0;

    @Column(name = "pairs_matched")
    @Builder.Default
    private Integer pairsMatched = 0;

    @Column(name = "wrong_attempts")
    @Builder.Default
    private Integer wrongAttempts = 0;

    @Column(name = "timer_duration")
    private Integer timerDuration;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void complete() {
        this.completedAt = LocalDateTime.now();
    }

    public boolean isCompleted() {
        return completedAt != null;
    }
}
