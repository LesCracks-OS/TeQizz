package com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.repository;

import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.entity.SmatchDeckJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SmatchDeckRepository extends JpaRepository<SmatchDeckJpaEntity, Long> {

    List<SmatchDeckJpaEntity> findByIsActiveTrue();

    List<SmatchDeckJpaEntity> findByCategoryId(Long categoryId);

    Optional<SmatchDeckJpaEntity> findByName(String name);

    Page<SmatchDeckJpaEntity> findByIsActive(Boolean isActive, Pageable pageable);

    @Query("SELECT d FROM SmatchDeckJpaEntity d WHERE (:categoryId IS NULL OR d.category.id = :categoryId) AND (:isActive IS NULL OR d.isActive = :isActive)")
    Page<SmatchDeckJpaEntity> findFiltered(@Param("categoryId") Long categoryId,
                                  @Param("isActive") Boolean isActive,
                                  Pageable pageable);

    @Query("SELECT COUNT(d) FROM SmatchDeckJpaEntity d WHERE d.isActive = true")
    long countActive();
}
