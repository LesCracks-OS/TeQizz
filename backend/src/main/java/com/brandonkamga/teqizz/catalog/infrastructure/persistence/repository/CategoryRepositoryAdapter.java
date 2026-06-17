package com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository;

import com.brandonkamga.teqizz.catalog.domain.model.Category;
import com.brandonkamga.teqizz.catalog.domain.repository.CategoryRepositoryPort;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.mapper.CategoryPersistenceMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
class CategoryRepositoryAdapter implements CategoryRepositoryPort {

    private final CategoryRepository jpaRepository;
    private final CategoryPersistenceMapper mapper;

    CategoryRepositoryAdapter(CategoryRepository jpaRepository, CategoryPersistenceMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public List<Category> findAll() {
        return jpaRepository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<Category> findAllActive() {
        return jpaRepository.findByIsActiveTrue().stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<Category> findAllActiveOrderByDisplayOrder() {
        return jpaRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(mapper::toDomain).toList();
    }

    @Override
    public Optional<Category> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }
}
