package com.brandonkamga.teqizz.admin.infrastructure.web;

import com.brandonkamga.teqizz.contribution.application.service.SmatchContributionApplicationService;
import com.brandonkamga.teqizz.contribution.application.service.SmatchContributionApplicationService.ContributionDetailView;
import com.brandonkamga.teqizz.dto.ApiResponse;
import com.brandonkamga.teqizz.exception.BadRequestException;
import com.brandonkamga.teqizz.exception.ResourceNotFoundException;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Admin moderation of user-proposed Smatch decks (distinct from QCM contribution review). */
@RestController
@RequestMapping("/api/v1/admin/contributions/smatch")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSmatchContributionController {

    private final SmatchContributionApplicationService service;
    private final UserJpaRepository userRepository;

    public AdminSmatchContributionController(SmatchContributionApplicationService service,
                                             UserJpaRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ContributionDetailView>>> getPending() {
        return ResponseEntity.ok(ApiResponse.success(service.getPending()));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getCount() {
        return ResponseEntity.ok(ApiResponse.success(Map.of("pending", service.countPending())));
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<ApiResponse<Map<String, Object>>> review(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long reviewerId = resolveUserId(userDetails);
        String decision = body.getOrDefault("decision", "").toUpperCase();
        switch (decision) {
            case "APPROVED" -> {
                Long deckId = service.approve(id, reviewerId);
                return ResponseEntity.ok(ApiResponse.success(
                        Map.of("approvedDeckId", deckId), "Contribution approved — deck created"));
            }
            case "REJECTED" -> {
                service.reject(id, reviewerId, body.get("reason"));
                return ResponseEntity.ok(ApiResponse.success(Map.of(), "Contribution rejected"));
            }
            default -> throw new BadRequestException("Decision must be APPROVED or REJECTED");
        }
    }

    private Long resolveUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .map(u -> u.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
    }
}
