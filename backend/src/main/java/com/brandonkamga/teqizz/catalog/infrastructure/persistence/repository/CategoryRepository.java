package com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository;

import com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity.CategoryJpaEntity;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryJpaEntity, Long> {

    Optional<CategoryJpaEntity> findByName(String name);

    Optional<CategoryJpaEntity> findBySlug(String slug);

    List<CategoryJpaEntity> findByIsActiveTrue();

    List<CategoryJpaEntity> findByIsActiveTrueOrderByDisplayOrderAsc();

    boolean existsByName(String name);

    boolean existsBySlug(String slug);
}
