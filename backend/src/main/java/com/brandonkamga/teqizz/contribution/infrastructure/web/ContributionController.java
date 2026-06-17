package com.brandonkamga.teqizz.contribution.infrastructure.web;

import com.brandonkamga.teqizz.contribution.application.port.in.SubmitContributionUseCase;
import com.brandonkamga.teqizz.contribution.application.port.in.SubmitContributionUseCase.*;
import com.brandonkamga.teqizz.contribution.application.service.ContributionApplicationService;
import com.brandonkamga.teqizz.dto.ApiResponse;
import com.brandonkamga.teqizz.dto.contribution.ContributionQuestionRequest;
import com.brandonkamga.teqizz.exception.ResourceNotFoundException;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.repository.UserJpaRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/contributions")
public class ContributionController {

    private final ContributionApplicationService contributionService;
    private final UserJpaRepository userRepository;

    public ContributionController(ContributionApplicationService contributionService,
                                  UserJpaRepository userRepository) {
        this.contributionService = contributionService;
        this.userRepository = userRepository;
    }

    @PostMapping("/questions")
    public ResponseEntity<ApiResponse<ContributionView>> submitQuestion(
            @Valid @RequestBody ContributionQuestionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ContributionView view = contributionService.submit(toCommand(resolveUserId(userDetails), request));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(view, "Question submitted for review"));
    }

    @PostMapping("/questions/bulk")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitQuestions(
            @Valid @RequestBody List<@Valid ContributionQuestionRequest> requests,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        int submitted = 0;
        List<String> errors = new ArrayList<>();
        for (int i = 0; i < requests.size(); i++) {
            try {
                contributionService.submit(toCommand(userId, requests.get(i)));
                submitted++;
            } catch (Exception e) {
                errors.add("Row " + (i + 1) + ": " + e.getMessage());
            }
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("submitted", submitted);
        result.put("errors", errors);
        return ResponseEntity.ok(ApiResponse.success(result, submitted + " question(s) submitted for review"));
    }

    @GetMapping("/questions/mine")
    public ResponseEntity<ApiResponse<List<ContributionView>>> getMySubmissions(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ContributionView> views = contributionService.getMyContributions(resolveUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success(views));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<Void>> withdrawSubmission(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        contributionService.withdraw(id, resolveUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success(null, "Submission withdrawn"));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Long resolveUserId(UserDetails userDetails) {
        if (userDetails == null) throw new AccessDeniedException("User not authenticated");
        return userRepository.findByEmail(userDetails.getUsername())
                .map(u -> u.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
    }

    private SubmitContributionUseCase.SubmitContributionCommand toCommand(Long userId,
                                                                           ContributionQuestionRequest req) {
        List<AnswerCommand> answers = req.getAnswers().stream()
                .map(a -> new AnswerCommand(a.getContent(), a.getIsCorrect()))
                .toList();
        return new SubmitContributionCommand(
                userId, req.getCategoryId(), req.getContent(),
                req.getExplanation(), req.getHint(), req.getLevel(),
                answers, req.getTagIds());
    }
}
