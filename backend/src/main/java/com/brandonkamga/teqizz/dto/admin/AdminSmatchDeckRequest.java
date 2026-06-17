package com.brandonkamga.teqizz.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSmatchDeckRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    private Long categoryId;

    @Builder.Default
    private String difficulty = "EASY";

    @Builder.Default
    private Boolean isActive = true;
}
