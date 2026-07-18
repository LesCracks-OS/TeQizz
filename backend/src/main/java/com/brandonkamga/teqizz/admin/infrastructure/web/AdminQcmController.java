package com.brandonkamga.teqizz.admin.infrastructure.web;

import com.brandonkamga.teqizz.admin.application.service.AdminQcmApplicationService;
import com.brandonkamga.teqizz.admin.application.service.AdminQcmApplicationService.*;
import com.brandonkamga.teqizz.dto.ApiResponse;
import com.brandonkamga.teqizz.dto.admin.AdminCategoryRequest;
import com.brandonkamga.teqizz.dto.admin.AdminQuestionRequest;
import com.brandonkamga.teqizz.dto.admin.AdminTagRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/qcm")
@PreAuthorize("hasRole('ADMIN')")
public class AdminQcmController {

    private final AdminQcmApplicationService qcmService;

    public AdminQcmController(AdminQcmApplicationService qcmService) {
        this.qcmService = qcmService;
    }

    // ─── Categories ───────────────────────────────────────────────────────────

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryView>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(qcmService.getCategories()));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryView>> createCategory(
            @Valid @RequestBody AdminCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(qcmService.createCategory(request), "Category created"));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryView>> updateCategory(
            @PathVariable Long id, @Valid @RequestBody AdminCategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(qcmService.updateCategory(id, request), "Category updated"));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        String message = qcmService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, message));
    }

    // ─── Tags ─────────────────────────────────────────────────────────────────

    @GetMapping("/tags")
    public ResponseEntity<ApiResponse<List<TagView>>> getTags(
            @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(ApiResponse.success(qcmService.getTags(categoryId)));
    }

    @PostMapping("/tags")
    public ResponseEntity<ApiResponse<TagView>> createTag(
            @Valid @RequestBody AdminTagRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(qcmService.createTag(request), "Tag created"));
    }

    @PutMapping("/tags/{id}")
    public ResponseEntity<ApiResponse<TagView>> updateTag(
            @PathVariable Long id, @Valid @RequestBody AdminTagRequest request) {
        return ResponseEntity.ok(ApiResponse.success(qcmService.updateTag(id, request), "Tag updated"));
    }

    @DeleteMapping("/tags/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTag(@PathVariable Long id) {
        qcmService.deleteTag(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Tag deactivated"));
    }

    // ─── Questions ────────────────────────────────────────────────────────────

    @GetMapping("/questions")
    public ResponseEntity<ApiResponse<List<QuestionSummaryView>>> getQuestions(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(qcmService.getQuestions(categoryId, level, status)));
    }

    @GetMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<QuestionDetailView>> getQuestion(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(qcmService.getQuestion(id)));
    }

    /** Dedup queue: groups of existing questions that share identical (normalised) content. */
    @GetMapping("/duplicates")
    public ResponseEntity<ApiResponse<List<DuplicateGroupView>>> getDuplicates() {
        return ResponseEntity.ok(ApiResponse.success(qcmService.getDuplicateGroups()));
    }

    @PostMapping("/questions")
    public ResponseEntity<ApiResponse<QuestionDetailView>> createQuestion(
            @Valid @RequestBody AdminQuestionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(qcmService.createQuestion(request), "Question created"));
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<QuestionDetailView>> updateQuestion(
            @PathVariable Long id, @Valid @RequestBody AdminQuestionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(qcmService.updateQuestion(id, request), "Question updated"));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable Long id) {
        qcmService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Question deleted"));
    }

    @PutMapping("/questions/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateQuestionStatus(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String next = qcmService.updateQuestionStatus(id, body != null ? body.get("status") : null);
        return ResponseEntity.ok(ApiResponse.success(null, "Status changed to " + next));
    }

    @PostMapping("/questions/import")
    public ResponseEntity<ApiResponse<BulkImportResult>> importQuestions(
            @Valid @RequestBody List<AdminQuestionRequest> requests) {
        BulkImportResult result = qcmService.importQuestions(requests);
        return ResponseEntity.ok(ApiResponse.success(result, result.imported() + " question(s) imported"));
    }

    // ─── Sessions ─────────────────────────────────────────────────────────────

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<QcmSessionView>>> getSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(qcmService.getSessions(page, size)));
    }

    @PutMapping("/sessions/{id}/complete")
    public ResponseEntity<ApiResponse<Void>> forceCompleteSession(@PathVariable Long id) {
        qcmService.forceCompleteSession(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Session force-completed"));
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(@PathVariable Long id) {
        qcmService.deleteSession(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Session deleted"));
    }

    // ─── Config ───────────────────────────────────────────────────────────────

    @GetMapping("/config")
    public ResponseEntity<ApiResponse<List<ConfigView>>> getGameModeConfig() {
        return ResponseEntity.ok(ApiResponse.success(qcmService.getGameModeConfig()));
    }
}
