package com.brandonkamga.teqizz.config;

import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.Question;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.QuestionRepository;
import com.brandonkamga.teqizz.shared.domain.ContentNormalizer;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ApplicationArguments;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * One-shot back-fill of {@code questions.content_hash} for rows that predate the anti-redundancy
 * feature. Computes the hash with the SAME {@link ContentNormalizer} used at write time, so the
 * exact-duplicate guard is consistent across old and new data. Idempotent: only touches null hashes.
 */
@Component
@Order(50)
@Profile("!test")
public class QuestionHashBackfillRunner implements ApplicationRunner {

    private final QuestionRepository questionRepository;

    public QuestionHashBackfillRunner(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<Question> missing = questionRepository.findByContentHashIsNull();
        if (missing.isEmpty()) return;
        for (Question q : missing) {
            q.setContentHash(ContentNormalizer.hash(q.getContent()));
        }
        questionRepository.saveAll(missing);
        System.out.println("[backfill] content_hash populated for " + missing.size() + " question(s)");
    }
}
