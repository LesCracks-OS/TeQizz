package com.brandonkamga.teqizz.config;

import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.entity.SmatchPairJpaEntity;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.repository.SmatchPairRepository;
import com.brandonkamga.teqizz.shared.domain.ContentNormalizer;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * One-shot back-fill of {@code smatch_pairs.content_hash} for rows predating the anti-redundancy
 * feature, using the same {@link ContentNormalizer} as write-time. Idempotent (null hashes only).
 */
@Component
@Order(51)
@Profile("!test")
public class SmatchPairHashBackfillRunner implements ApplicationRunner {

    private final SmatchPairRepository pairRepository;

    public SmatchPairHashBackfillRunner(SmatchPairRepository pairRepository) {
        this.pairRepository = pairRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<SmatchPairJpaEntity> missing = pairRepository.findByContentHashIsNull();
        if (missing.isEmpty()) return;
        for (SmatchPairJpaEntity p : missing) {
            p.setContentHash(ContentNormalizer.hash(p.getTerm(), p.getDefinition()));
        }
        pairRepository.saveAll(missing);
        System.out.println("[backfill] content_hash populated for " + missing.size() + " smatch pair(s)");
    }
}
