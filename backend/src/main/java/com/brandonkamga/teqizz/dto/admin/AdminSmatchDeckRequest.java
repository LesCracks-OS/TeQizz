package com.brandonkamga.teqizz.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSmatchDeckRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    private Long categoryId;

    /** Reusable catalog tag ids applied to this deck (optional). */
    private List<Long> tagIds;

    @Builder.Default
    private String difficulty = "EASY";

    @Builder.Default
    private Boolean isActive = true;
}
