package com.brandonkamga.teqizz.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminTagRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String slug;

    private String description;

    private Long categoryId;

    @Builder.Default
    private Boolean isActive = true;
}
