package com.brandonkamga.teqizz.catalog.application.service;

import com.brandonkamga.teqizz.catalog.application.port.in.GetCategoriesUseCase;
import com.brandonkamga.teqizz.catalog.domain.model.Category;
import com.brandonkamga.teqizz.catalog.domain.repository.CategoryRepositoryPort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class CategoryApplicationService implements GetCategoriesUseCase {

    private final CategoryRepositoryPort categoryRepository;

    public CategoryApplicationService(CategoryRepositoryPort categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public List<Category> getActiveCategories() {
        return categoryRepository.findAllActiveOrderByDisplayOrder();
    }

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }
}
