package com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity;

import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.GameStatusType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;


/**
 * GameStatus entity for game session status values.
 * Stored as a separate table for extensibility and normalization.
 */
@Entity
@Table(name = "game_statuses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_name", nullable = false, unique = true, length = 50)
    private GameStatusType statusName;

    @Column(length = 200)
    private String description;
}
