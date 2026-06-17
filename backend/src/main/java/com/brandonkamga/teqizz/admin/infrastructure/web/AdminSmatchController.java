package com.brandonkamga.teqizz.admin.infrastructure.web;

import com.brandonkamga.teqizz.admin.application.service.AdminSmatchApplicationService;
import com.brandonkamga.teqizz.admin.application.service.AdminSmatchApplicationService.*;
import com.brandonkamga.teqizz.dto.ApiResponse;
import com.brandonkamga.teqizz.dto.admin.AdminSmatchDeckRequest;
import com.brandonkamga.teqizz.dto.admin.AdminSmatchPairRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/smatch")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSmatchController {

    private final AdminSmatchApplicationService smatchService;

    public AdminSmatchController(AdminSmatchApplicationService smatchService) {
        this.smatchService = smatchService;
    }

    // ─── Decks ────────────────────────────────────────────────────────────────

    @GetMapping("/decks")
    public ResponseEntity<ApiResponse<DeckPage>> getDecks(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String difficulty,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                smatchService.getDecks(categoryId, isActive, difficulty, page, size)));
    }

    @GetMapping("/decks/{id}")
    public ResponseEntity<ApiResponse<DeckDetailView>> getDeck(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(smatchService.getDeck(id)));
    }

    @PostMapping("/decks")
    public ResponseEntity<ApiResponse<DeckSummaryView>> createDeck(
            @Valid @RequestBody AdminSmatchDeckRequest request) {
        return ResponseEntity.ok(ApiResponse.success(smatchService.createDeck(request), "Deck created successfully"));
    }

    @PutMapping("/decks/{id}")
    public ResponseEntity<ApiResponse<DeckSummaryView>> updateDeck(
            @PathVariable Long id, @Valid @RequestBody AdminSmatchDeckRequest request) {
        return ResponseEntity.ok(ApiResponse.success(smatchService.updateDeck(id, request), "Deck updated successfully"));
    }

    @PutMapping("/decks/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateDeckStatus(
            @PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Boolean isActive = body.get("isActive");
        if (isActive == null) return ResponseEntity.badRequest().body(ApiResponse.error("isActive field is required"));
        smatchService.updateDeckStatus(id, isActive);
        return ResponseEntity.ok(ApiResponse.success(null, "Deck " + (isActive ? "activated" : "deactivated") + " successfully"));
    }

    @DeleteMapping("/decks/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDeck(@PathVariable Long id) {
        smatchService.deleteDeck(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Deck deleted successfully"));
    }

    // ─── Pairs ────────────────────────────────────────────────────────────────

    @GetMapping("/decks/{deckId}/pairs")
    public ResponseEntity<ApiResponse<List<PairView>>> getPairs(
            @PathVariable Long deckId,
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(ApiResponse.success(smatchService.getPairs(deckId, isActive)));
    }

    @PostMapping("/decks/{deckId}/pairs")
    public ResponseEntity<ApiResponse<PairView>> createPair(
            @PathVariable Long deckId, @Valid @RequestBody AdminSmatchPairRequest request) {
        return ResponseEntity.ok(ApiResponse.success(smatchService.createPair(deckId, request), "Pair created successfully"));
    }

    @PutMapping("/decks/{deckId}/pairs")
    public ResponseEntity<ApiResponse<BulkResult>> replacePairs(
            @PathVariable Long deckId,
            @RequestBody List<@Valid AdminSmatchPairRequest> requests) {
        BulkResult result = smatchService.replacePairs(deckId, requests);
        return ResponseEntity.ok(ApiResponse.success(result, result.created() + " pairs saved"));
    }

    @PostMapping("/decks/{deckId}/pairs/bulk")
    public ResponseEntity<ApiResponse<BulkResult>> createPairsBulk(
            @PathVariable Long deckId,
            @RequestBody List<@Valid AdminSmatchPairRequest> requests) {
        BulkResult result = smatchService.createPairsBulk(deckId, requests);
        return ResponseEntity.ok(ApiResponse.success(result, result.created() + " pairs created successfully"));
    }

    @PutMapping("/pairs/{id}")
    public ResponseEntity<ApiResponse<PairView>> updatePair(
            @PathVariable Long id, @Valid @RequestBody AdminSmatchPairRequest request) {
        return ResponseEntity.ok(ApiResponse.success(smatchService.updatePair(id, request), "Pair updated successfully"));
    }

    @DeleteMapping("/pairs/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePair(@PathVariable Long id) {
        smatchService.deletePair(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Pair deleted successfully"));
    }

    // ─── Sessions ─────────────────────────────────────────────────────────────

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<SessionPage>> getSessions(
            @RequestParam(required = false) Long deckId,
            @RequestParam(required = false) String gameMode,
            @RequestParam(required = false) Boolean completed,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                smatchService.getSessions(deckId, gameMode, completed, page, size)));
    }

    @GetMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<SessionDetailView>> getSession(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(smatchService.getSession(id)));
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(@PathVariable Long id) {
        smatchService.deleteSession(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Session deleted successfully"));
    }

    // ─── Config ───────────────────────────────────────────────────────────────

    @GetMapping("/config")
    public ResponseEntity<ApiResponse<List<ConfigView>>> getConfig() {
        return ResponseEntity.ok(ApiResponse.success(smatchService.getConfig()));
    }
}
