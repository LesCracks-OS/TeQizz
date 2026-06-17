package com.brandonkamga.teqizz.admin.infrastructure.web;

import com.brandonkamga.teqizz.admin.application.service.AdminPlatformApplicationService;
import com.brandonkamga.teqizz.admin.application.service.AdminPlatformApplicationService.UserView;
import com.brandonkamga.teqizz.dto.ApiResponse;
import com.brandonkamga.teqizz.dto.admin.AdminRoleUpdateRequest;
import com.brandonkamga.teqizz.dto.admin.AdminStatsResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/platform")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPlatformController {

    private final AdminPlatformApplicationService platformService;

    public AdminPlatformController(AdminPlatformApplicationService platformService) {
        this.platformService = platformService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(platformService.getStats()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserView>>> getUsers(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(ApiResponse.success(platformService.getUsers(search, role)));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<Void>> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody AdminRoleUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        platformService.updateUserRole(id, request.getRoleName(),
                userDetails != null ? userDetails.getUsername() : null);
        return ResponseEntity.ok(ApiResponse.success(null, "Role updated successfully"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        platformService.deleteUser(id, userDetails != null ? userDetails.getUsername() : null);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }
}
