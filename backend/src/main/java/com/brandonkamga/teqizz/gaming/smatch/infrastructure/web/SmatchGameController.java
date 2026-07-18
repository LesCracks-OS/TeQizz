package com.brandonkamga.teqizz.gaming.smatch.infrastructure.web;

import com.brandonkamga.teqizz.dto.ApiResponse;
import com.brandonkamga.teqizz.exception.ResourceNotFoundException;
import com.brandonkamga.teqizz.gaming.smatch.application.port.in.*;
import com.brandonkamga.teqizz.gaming.smatch.application.port.in.GetSmatchDecksUseCase.*;
import com.brandonkamga.teqizz.gaming.smatch.application.port.in.GetSmatchResultUseCase.SmatchResultView;
import com.brandonkamga.teqizz.gaming.smatch.application.port.in.StartSmatchSessionUseCase.SmatchSessionView;
import com.brandonkamga.teqizz.gaming.smatch.application.port.in.SubmitSmatchAttemptUseCase.AttemptResultView;
import com.brandonkamga.teqizz.gaming.smatch.application.service.SmatchGameApplicationService;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.repository.UserJpaRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/games/smatch")
public class SmatchGameController {

    private final SmatchGameApplicationService smatchGameService;
    private final UserJpaRepository userRepository;

    public SmatchGameController(SmatchGameApplicationService smatchGameService,
                                UserJpaRepository userRepository) {
        this.smatchGameService = smatchGameService;
        this.userRepository = userRepository;
    }

    // ─── Decks ────────────────────────────────────────────────────────────────

    @GetMapping("/decks")
    public ResponseEntity<ApiResponse<List<SmatchDeckView>>> getDecks(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long tagId) {
        return ResponseEntity.ok(ApiResponse.success(
                smatchGameService.getActiveDecks(categoryId, tagId), "Decks retrieved successfully"));
    }

    @GetMapping("/decks/{deckId}")
    public ResponseEntity<ApiResponse<SmatchDeckDetailView>> getDeck(@PathVariable Long deckId) {
        return ResponseEntity.ok(ApiResponse.success(
                smatchGameService.getDeckById(deckId), "Deck retrieved successfully"));
    }

    // ─── Sessions ─────────────────────────────────────────────────────────────

    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<SmatchSessionView>> startSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody StartSessionRequest request) {
        Long userId = resolveUserId(userDetails);
        SmatchSessionView view = smatchGameService.start(
                new StartSmatchSessionUseCase.StartSmatchSessionCommand(userId, request.deckId(), request.gameMode()));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(view, "Session started successfully"));
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<SmatchSessionView>> getSession(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        validateOwnership(sessionId, userDetails);
        return ResponseEntity.ok(ApiResponse.success(
                smatchGameService.getSession(sessionId), "Session retrieved successfully"));
    }

    @PostMapping("/sessions/{sessionId}/attempts")
    public ResponseEntity<ApiResponse<AttemptResultView>> submitAttempt(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AttemptRequest request) {
        validateOwnership(sessionId, userDetails);
        AttemptResultView result = smatchGameService.submit(
                new SubmitSmatchAttemptUseCase.SubmitAttemptCommand(
                        sessionId, request.termPairId(), request.definitionPairId(), request.timeTakenMs()));
        return ResponseEntity.ok(ApiResponse.success(result, "Attempt submitted successfully"));
    }

    @GetMapping("/sessions/{sessionId}/results")
    public ResponseEntity<ApiResponse<SmatchResultView>> getResult(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        validateOwnership(sessionId, userDetails);
        return ResponseEntity.ok(ApiResponse.success(
                smatchGameService.getResult(sessionId), "Results retrieved successfully"));
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> abandonSession(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        validateOwnership(sessionId, userDetails);
        smatchGameService.abandon(sessionId);
        return ResponseEntity.ok(ApiResponse.success(null, "Session abandoned successfully"));
    }

    // ─── Request records ──────────────────────────────────────────────────────

    public record StartSessionRequest(@NotNull Long deckId, @NotNull String gameMode) {}

    public record AttemptRequest(@NotNull Long termPairId, @NotNull Long definitionPairId, Integer timeTakenMs) {}

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Long resolveUserId(UserDetails userDetails) {
        if (userDetails == null) throw new AccessDeniedException("User not authenticated");
        return userRepository.findByEmail(userDetails.getUsername())
                .map(u -> u.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
    }

    private void validateOwnership(Long sessionId, UserDetails userDetails) {
        smatchGameService.validateOwnership(sessionId, resolveUserId(userDetails));
    }
}
