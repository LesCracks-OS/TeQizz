package com.brandonkamga.teqizz.catalog.domain.repository;

import com.brandonkamga.teqizz.catalog.domain.model.Category;

import java.util.List;
import java.util.Optional;

public interface CategoryRepositoryPort {
    List<Category> findAll();
    List<Category> findAllActive();
    List<Category> findAllActiveOrderByDisplayOrder();
    Optional<Category> findById(Long id);
}
