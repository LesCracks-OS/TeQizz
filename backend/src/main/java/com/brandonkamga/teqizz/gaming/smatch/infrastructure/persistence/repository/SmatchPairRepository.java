package com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.repository;

import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.entity.SmatchPairJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SmatchPairRepository extends JpaRepository<SmatchPairJpaEntity, Long> {

    List<SmatchPairJpaEntity> findByDeckId(Long deckId);

    List<SmatchPairJpaEntity> findByDeckIdAndIsActiveTrue(Long deckId);

    long countByDeckId(Long deckId);

    long countByDeckIdAndIsActiveTrue(Long deckId);

    void deleteByDeckId(Long deckId);
}
