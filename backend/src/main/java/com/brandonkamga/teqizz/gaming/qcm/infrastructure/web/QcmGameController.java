package com.brandonkamga.teqizz.gaming.qcm.infrastructure.web;

import com.brandonkamga.teqizz.dto.ApiResponse;
import com.brandonkamga.teqizz.dto.qcm.*;
import com.brandonkamga.teqizz.exception.ResourceNotFoundException;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.repository.UserJpaRepository;
import com.brandonkamga.teqizz.gaming.qcm.application.service.QcmGameApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/games/qcm")
public class QcmGameController {

    private final QcmGameApplicationService qcmGameService;
    private final UserJpaRepository userRepository;

    public QcmGameController(QcmGameApplicationService qcmGameService, UserJpaRepository userRepository) {
        this.qcmGameService = qcmGameService;
        this.userRepository = userRepository;
    }

    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<QcmGameSessionResponse>> createGameSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody QcmGameConfigRequest request) {
        Long userId = resolveUserId(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(qcmGameService.createGameSession(userId, request), "Game session created successfully"));
    }

    @GetMapping("/sessions/{sessionId}/questions/next")
    public ResponseEntity<ApiResponse<QcmQuestionResponse>> getNextQuestion(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        validateOwnership(sessionId, userDetails);
        return ResponseEntity.ok(ApiResponse.success(qcmGameService.getNextQuestion(sessionId), "Question retrieved successfully"));
    }

    @PostMapping("/sessions/{sessionId}/answers")
    public ResponseEntity<ApiResponse<QcmSubmitAnswerResponse>> submitAnswer(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody QcmSubmitAnswerRequest request) {
        validateOwnership(sessionId, userDetails);
        return ResponseEntity.ok(ApiResponse.success(qcmGameService.submitAnswer(sessionId, request), "Answer submitted successfully"));
    }

    @GetMapping("/sessions/{sessionId}/results")
    public ResponseEntity<ApiResponse<QcmGameResultResponse>> getGameResults(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        validateOwnership(sessionId, userDetails);
        return ResponseEntity.ok(ApiResponse.success(qcmGameService.getGameResults(sessionId), "Game results retrieved successfully"));
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<QcmGameSessionResponse>> getSessionState(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        validateOwnership(sessionId, userDetails);
        return ResponseEntity.ok(ApiResponse.success(qcmGameService.getSessionState(sessionId), "Session state retrieved successfully"));
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> abandonGameSession(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        validateOwnership(sessionId, userDetails);
        qcmGameService.abandonGameSession(sessionId);
        return ResponseEntity.ok(ApiResponse.success(null, "Game session abandoned successfully"));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<QcmUserStatsResponse>> getUserStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(qcmGameService.getUserStats(resolveUserId(userDetails)), "Stats retrieved successfully"));
    }

    @DeleteMapping("/stats")
    public ResponseEntity<ApiResponse<Void>> resetUserStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        qcmGameService.resetUserStats(resolveUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success(null, "Stats reset successfully"));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<QcmLeaderboardResponse>> getLeaderboard(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "ALL") String gameMode) {
        return ResponseEntity.ok(ApiResponse.success(qcmGameService.getLeaderboard(page, size, categoryId, gameMode), "Leaderboard retrieved successfully"));
    }

    private Long resolveUserId(UserDetails userDetails) {
        if (userDetails == null) throw new AccessDeniedException("User not authenticated");
        return userRepository.findByEmail(userDetails.getUsername())
                .map(u -> u.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
    }

    private void validateOwnership(Long sessionId, UserDetails userDetails) {
        qcmGameService.validateSessionOwnership(sessionId, resolveUserId(userDetails));
    }
}
