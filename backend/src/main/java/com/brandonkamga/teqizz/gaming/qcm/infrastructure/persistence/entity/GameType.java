package com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity;

import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.GameTypeName;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * GameType entity for game type values (QCM, SMATCH, etc.).
 * Stored as a separate table for extensibility and normalization.
 */
@Entity
@Table(name = "game_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_name", nullable = false, unique = true, length = 50)
    private GameTypeName typeName;

    @Column(length = 200)
    private String description;
}
