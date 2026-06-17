package com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity;

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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * UserAnswer entity for tracking individual user responses to questions.
 * Follows normalization principles - each answer is stored as a separate record.
 */
@Entity
@Table(name = "user_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class UserAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_session_id", nullable = false)
    private GameSession gameSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_answer_id")
    private Answer selectedAnswer; // The answer selected by the user

    @Column(name = "is_correct", nullable = false)
    private boolean isCorrect; // Whether the answer was correct

    @Column(name = "points_earned")
    @Builder.Default
    private Integer pointsEarned = 0; // Points earned for this answer

    @Column(name = "time_taken_seconds")
    private Integer timeTakenSeconds; // Time taken to answer

    @Column(name = "used_hint")
    @Builder.Default
    private Boolean usedHint = false; // Whether user used a hint

    @CreatedDate
    @Column(name = "answered_at", nullable = false, updatable = false)
    private LocalDateTime answeredAt;
}
