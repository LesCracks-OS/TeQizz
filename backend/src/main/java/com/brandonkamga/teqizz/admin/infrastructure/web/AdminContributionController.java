package com.brandonkamga.teqizz.admin.infrastructure.web;

import com.brandonkamga.teqizz.contribution.application.port.in.GetAllContributionsUseCase.ContributionDetailView;
import com.brandonkamga.teqizz.contribution.application.service.ContributionApplicationService;
import com.brandonkamga.teqizz.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/contributions")
@PreAuthorize("hasRole('ADMIN')")
public class AdminContributionController {

    private final ContributionApplicationService contributionService;

    public AdminContributionController(ContributionApplicationService contributionService) {
        this.contributionService = contributionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ContributionDetailView>>> getContributions() {
        return ResponseEntity.ok(ApiResponse.success(contributionService.getAllContributions()));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getContributionsCount() {
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("pending", contributionService.countPendingContributions())));
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<ApiResponse<Void>> reviewContribution(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String decision = body.get("decision");
        contributionService.review(id, decision);
        return ResponseEntity.ok(ApiResponse.success(null, "Contribution " + decision.toLowerCase() + "d"));
    }
}
