package com.brandonkamga.teqizz.contribution.infrastructure.web;

import com.brandonkamga.teqizz.contribution.application.service.SmatchContributionApplicationService;
import com.brandonkamga.teqizz.contribution.application.service.SmatchContributionApplicationService.ContributionView;
import com.brandonkamga.teqizz.dto.ApiResponse;
import com.brandonkamga.teqizz.dto.contribution.SmatchContributionRequest;
import com.brandonkamga.teqizz.exception.ResourceNotFoundException;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.repository.UserJpaRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** User-facing Smatch contribution endpoints (distinct from the QCM contribution controller). */
@RestController
@RequestMapping("/api/v1/contributions/smatch")
public class SmatchContributionController {

    private final SmatchContributionApplicationService service;
    private final UserJpaRepository userRepository;

    public SmatchContributionController(SmatchContributionApplicationService service,
                                        UserJpaRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    @PostMapping("/decks")
    public ResponseEntity<ApiResponse<ContributionView>> submit(
            @Valid @RequestBody SmatchContributionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ContributionView view = service.submit(resolveUserId(userDetails), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(view, "Deck submitted for review"));
    }

    @GetMapping("/decks/mine")
    public ResponseEntity<ApiResponse<List<ContributionView>>> mine(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(service.getMine(resolveUserId(userDetails))));
    }

    @DeleteMapping("/decks/{id}")
    public ResponseEntity<ApiResponse<Void>> withdraw(
            @PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        service.withdraw(id, resolveUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success(null, "Submission withdrawn"));
    }

    private Long resolveUserId(UserDetails userDetails) {
        if (userDetails == null) throw new AccessDeniedException("User not authenticated");
        return userRepository.findByEmail(userDetails.getUsername())
                .map(u -> u.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
    }
}
