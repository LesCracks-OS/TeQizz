package com.brandonkamga.teqizz.catalog.infrastructure.web;

import com.brandonkamga.teqizz.catalog.application.port.in.GetCategoriesUseCase;
import com.brandonkamga.teqizz.catalog.domain.model.Category;
import com.brandonkamga.teqizz.dto.ApiResponse;
import com.brandonkamga.teqizz.exception.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final GetCategoriesUseCase getCategoriesUseCase;

    public CategoryController(GetCategoriesUseCase getCategoriesUseCase) {
        this.getCategoriesUseCase = getCategoriesUseCase;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> response = getCategoriesUseCase.getActiveCategories().stream()
                .map(CategoryResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(response, "Categories retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        Category category = getCategoriesUseCase.getCategoryById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return ResponseEntity.ok(ApiResponse.success(CategoryResponse.from(category)));
    }

    public record CategoryResponse(Long id, String name, String slug, String description, Integer displayOrder) {
        static CategoryResponse from(Category c) {
            return new CategoryResponse(c.getId().value(), c.getName(), c.getSlug(), c.getDescription(), c.getDisplayOrder());
        }
    }
}
