package com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.repository;

import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.entity.SmatchAttemptJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SmatchAttemptRepository extends JpaRepository<SmatchAttemptJpaEntity, Long> {

    List<SmatchAttemptJpaEntity> findBySessionId(Long sessionId);

    long countBySessionId(Long sessionId);

    /** A pair is "already matched" once it has a correct attempt in this session. */
    boolean existsBySessionIdAndPairIdAndIsCorrectTrue(Long sessionId, Long pairId);

    void deleteBySessionId(Long sessionId);
}
