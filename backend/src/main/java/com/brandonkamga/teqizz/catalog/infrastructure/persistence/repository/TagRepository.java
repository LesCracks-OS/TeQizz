package com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository;

import com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity.TagJpaEntity;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TagRepository extends JpaRepository<TagJpaEntity, Long> {

    Optional<TagJpaEntity> findByName(String name);

    Optional<TagJpaEntity> findBySlug(String slug);

    List<TagJpaEntity> findBySlugIn(List<String> slugs);

    List<TagJpaEntity> findByIsActiveTrue();

    boolean existsByName(String name);

    boolean existsBySlug(String slug);

    List<TagJpaEntity> findByNameIn(List<String> names);

    /**
     * Find all active tags belonging to a specific category.
     * Used for specialty tags like React (Frontend), SpringBoot (Backend), etc.
     */
    List<TagJpaEntity> findByCategoryIdAndIsActiveTrue(Long categoryId);

    /**
     * Find all tags belonging to a specific category.
     */
    List<TagJpaEntity> findByCategoryId(Long categoryId);
}
