package com.brandonkamga.teqizz.catalog.infrastructure.web;

import com.brandonkamga.teqizz.catalog.application.port.in.GetTagsUseCase;
import com.brandonkamga.teqizz.catalog.domain.model.Tag;
import com.brandonkamga.teqizz.dto.ApiResponse;
import com.brandonkamga.teqizz.exception.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final GetTagsUseCase getTagsUseCase;

    public TagController(GetTagsUseCase getTagsUseCase) {
        this.getTagsUseCase = getTagsUseCase;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TagResponse>>> getAllTags() {
        List<TagResponse> response = getTagsUseCase.getActiveTags().stream()
                .map(TagResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(response, "Tags retrieved successfully"));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<TagResponse>>> getTagsByCategory(@PathVariable Long categoryId) {
        List<TagResponse> response = getTagsUseCase.getTagsByCategoryId(categoryId).stream()
                .map(TagResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(response, "Tags retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TagResponse>> getTagById(@PathVariable Long id) {
        Tag tag = getTagsUseCase.getTagById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag", "id", id));
        return ResponseEntity.ok(ApiResponse.success(TagResponse.from(tag)));
    }

    public record TagResponse(Long id, String name, String slug, String description,
                              Long categoryId, String categoryName) {
        static TagResponse from(Tag t) {
            return new TagResponse(
                    t.getId().value(), t.getName(), t.getSlug(), t.getDescription(),
                    t.getCategoryId() != null ? t.getCategoryId().value() : null,
                    t.getCategoryName()
            );
        }
    }
}
