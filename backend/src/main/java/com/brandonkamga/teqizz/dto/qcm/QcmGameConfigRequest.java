package com.brandonkamga.teqizz.dto.qcm;

import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.GameMode;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Request DTO for configuring a new QCM game session.
 * Survival Mode - Infinite questions until timer expires or lives run out.
 * Difficulty is determined by score progression (everyone starts at EASY).
 * Game mode determines time constraints and scoring multipliers.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcmGameConfigRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private List<Long> tagIds;

    @Min(value = 1, message = "Minimum 1 life required")
    @Max(value = 10, message = "Maximum 10 lives allowed")
    private Integer lives = 3; // Default value applied when field is omitted from JSON

    @NotNull(message = "Game mode is required")
    private GameMode gameMode;

    private Boolean showHints = true; // Default value applied when field is omitted from JSON

    private Boolean showExplanations = true; // Default value applied when field is omitted from JSON
}
