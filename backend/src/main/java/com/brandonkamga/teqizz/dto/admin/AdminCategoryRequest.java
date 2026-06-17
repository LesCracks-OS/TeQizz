package com.brandonkamga.teqizz.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminCategoryRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String slug;

    private String description;

    @Builder.Default
    private Integer displayOrder = 0;

    @Builder.Default
    private Boolean isActive = true;
}
