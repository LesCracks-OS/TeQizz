package com.brandonkamga.teqizz.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminRoleUpdateRequest {

    @NotBlank(message = "Role name is required")
    private String roleName; // USER or ADMIN
}
