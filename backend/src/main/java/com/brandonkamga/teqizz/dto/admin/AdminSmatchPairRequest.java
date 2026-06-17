package com.brandonkamga.teqizz.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSmatchPairRequest {

    @NotBlank(message = "Term is required")
    private String term;

    @NotBlank(message = "Definition is required")
    private String definition;

    private String hint;

    @Builder.Default
    private Boolean isActive = true;
}
