package com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity;

import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QuestionLevelType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * QuestionLevel entity for question difficulty levels.
 * Stored as a separate table for extensibility and normalization.
 */
@Entity
@Table(name = "question_levels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "level_name", nullable = false, unique = true, length = 50)
    private QuestionLevelType levelName;

    @Column(length = 200)
    private String description;
}
