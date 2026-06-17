package com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository;

import com.brandonkamga.teqizz.catalog.domain.model.Tag;
import com.brandonkamga.teqizz.catalog.domain.repository.TagRepositoryPort;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.mapper.TagPersistenceMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
class TagRepositoryAdapter implements TagRepositoryPort {

    private final TagRepository jpaRepository;
    private final TagPersistenceMapper mapper;

    TagRepositoryAdapter(TagRepository jpaRepository, TagPersistenceMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public List<Tag> findAll() {
        return jpaRepository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<Tag> findAllActive() {
        return jpaRepository.findByIsActiveTrue().stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<Tag> findByCategoryId(Long categoryId) {
        return jpaRepository.findByCategoryId(categoryId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<Tag> findActiveByCategoryId(Long categoryId) {
        return jpaRepository.findByCategoryIdAndIsActiveTrue(categoryId).stream()
                .map(mapper::toDomain).toList();
    }

    @Override
    public Optional<Tag> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }
}
