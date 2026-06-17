package com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.repository;

import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.entity.SmatchSessionJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SmatchSessionRepository extends JpaRepository<SmatchSessionJpaEntity, Long> {

    List<SmatchSessionJpaEntity> findByUserId(Long userId);

    List<SmatchSessionJpaEntity> findByDeckId(Long deckId);

    Page<SmatchSessionJpaEntity> findAll(Pageable pageable);

    long countByCompletedAtIsNotNull();

    long countByCompletedAtIsNull();
}
