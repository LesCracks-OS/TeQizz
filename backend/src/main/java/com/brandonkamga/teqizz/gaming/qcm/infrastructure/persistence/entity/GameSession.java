package com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity;

import com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity.CategoryJpaEntity;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.GameMode;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.UserJpaEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * GameSession entity for tracking user game sessions.
 * Follows normalization principles - sessions are stored separately.
 * Tracks complete game state including score, lives, and timing.
 */
@Entity
@Table(name = "game_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class GameSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserJpaEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private CategoryJpaEntity category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id", nullable = false)
    private GameStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_type_id")
    private GameType gameType;

    @Enumerated(EnumType.STRING)
    @Column(name = "game_mode")
    private GameMode gameMode;

    @Column(name = "total_score")
    @Builder.Default
    private Integer totalScore = 0;

    @Column(name = "correct_answers")
    @Builder.Default
    private Integer correctAnswers = 0;

    @Column(name = "wrong_answers")
    @Builder.Default
    private Integer wrongAnswers = 0;

    @Column(name = "total_questions")
    @Builder.Default
    private Integer totalQuestions = 0;

    @Column(name = "lives_remaining")
    private Integer livesRemaining = 3; // Default 3 lives per game

    @Column(name = "global_timer_duration")
    private Integer globalTimerDuration; // Initial time in seconds for the game session

    @Column(name = "max_timer_duration")
    private Integer maxTimerDuration; // Maximum time cap in seconds

    @Column(name = "current_timer_seconds")
    private Integer currentTimerSeconds; // Server-tracked timer value, updated on each answer

    @Column(name = "last_answer_at")
    private LocalDateTime lastAnswerAt; // Timestamp of last answer, used for server-side timer tracking

    @Column(name = "tag_filter_json")
    private String tagFilterJson; // Comma-separated tag IDs for filtering questions (null = no filter)

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "gameSession", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UserAnswer> userAnswers = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Calculate accuracy percentage
    public double getAccuracy() {
        if (totalQuestions == 0) return 0.0;
        return (double) correctAnswers / totalQuestions * 100;
    }

    // Mark game as completed
    public void complete() {
        this.completedAt = LocalDateTime.now();
    }

    // Check if game is over (no lives remaining)
    public boolean isGameOver() {
        return livesRemaining <= 0;
    }

    // Calculate efficiency (score per minute)
    public double getEfficiency() {
        if (completedAt == null || startedAt == null) return 0.0;
        long durationSeconds = java.time.Duration.between(startedAt, completedAt).getSeconds();
        if (durationSeconds <= 0) return 0.0;
        return (totalScore * 60.0) / durationSeconds;
    }
}
