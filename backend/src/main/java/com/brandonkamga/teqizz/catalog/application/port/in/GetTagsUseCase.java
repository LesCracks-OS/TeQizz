package com.brandonkamga.teqizz.catalog.application.port.in;

import com.brandonkamga.teqizz.catalog.domain.model.Tag;
import java.util.List;
import java.util.Optional;

public interface GetTagsUseCase {
    List<Tag> getActiveTags();
    List<Tag> getTagsByCategoryId(Long categoryId);
    Optional<Tag> getTagById(Long id);
}
