package com.brandonkamga.teqizz.gaming.qcm.infrastructure.web;

import com.brandonkamga.teqizz.dto.ApiResponse;
import com.brandonkamga.teqizz.dto.importData.QuestionImportRequest;
import com.brandonkamga.teqizz.dto.importData.QuestionImportResponse;
import com.brandonkamga.teqizz.gaming.qcm.application.service.QcmQuestionImportApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/questions")
@PreAuthorize("hasRole('ADMIN')")
public class QcmQuestionImportController {

    private final QcmQuestionImportApplicationService questionImportService;

    public QcmQuestionImportController(QcmQuestionImportApplicationService questionImportService) {
        this.questionImportService = questionImportService;
    }

    @PostMapping("/import")
    public ResponseEntity<ApiResponse<QuestionImportResponse>> importQuestions(
            @Valid @RequestBody QuestionImportRequest request) {
        
        QuestionImportResponse response = questionImportService.importQuestions(request);
        
        String message = String.format("Import completed: %d imported, %d skipped", 
                response.getImported(), response.getSkipped());
        
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(response, message));
    }

    @PostMapping("/import-file")
    public ResponseEntity<ApiResponse<QuestionImportResponse>> importQuestionsFromFile(
            @RequestBody FilePathRequest request) {
        
        QuestionImportResponse response = questionImportService.importQuestionsFromFile(request.getFilePath());
        
        String message = String.format("Import from file completed: %d imported, %d skipped", 
                response.getImported(), response.getSkipped());
        
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(response, message));
    }

    public static class FilePathRequest {
        private String filePath;

        public String getFilePath() {
            return filePath;
        }

        public void setFilePath(String filePath) {
            this.filePath = filePath;
        }
    }
}
