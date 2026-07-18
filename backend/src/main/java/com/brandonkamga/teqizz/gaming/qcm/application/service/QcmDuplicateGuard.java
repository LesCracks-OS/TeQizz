package com.brandonkamga.teqizz.gaming.qcm.application.service;

import com.brandonkamga.teqizz.exception.ConflictException;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.Question;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.QuestionRepository;
import com.brandonkamga.teqizz.shared.domain.ContentNormalizer;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Single gate against redundant QCM questions, shared by every path that creates a question
 * (user contribution, admin editor, bulk import):
 *
 *  - {@link #hashFor(String)} computes the canonical content hash to store on the entity.
 *  - {@link #assertNoExactDuplicate(String)} hard-blocks an exact duplicate (409 Conflict).
 *  - {@link #findSimilar(String, Long)} surfaces near-duplicates so callers can *warn* without blocking.
 */
@Component
public class QcmDuplicateGuard {

    /** pg_trgm similarity in [0,1]; 0.55 catches reworded near-duplicates without excessive noise. */
    private static final double SIMILARITY_THRESHOLD = 0.55;
    private static final int MAX_SIMILAR = 5;

    private final QuestionRepository questionRepository;

    public QcmDuplicateGuard(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public String hashFor(String content) {
        return ContentNormalizer.hash(content);
    }

    /** Throws {@link ConflictException} (pointing at the existing question) if {@code content} already exists. */
    @Transactional(readOnly = true)
    public void assertNoExactDuplicate(String content) {
        questionRepository.findFirstByContentHash(hashFor(content)).ifPresent(existing -> {
            throw new ConflictException(
                    "This question already exists (#" + existing.getId() + ")", existing.getId());
        });
    }

    /** Near-duplicate suggestions for a would-be question (excluding {@code excludeId}). Never throws. */
    @Transactional(readOnly = true)
    public List<SimilarQuestion> findSimilar(String content, Long excludeId) {
        if (content == null || content.isBlank()) return List.of();
        try {
            return questionRepository
                    .findSimilarByContent(content, SIMILARITY_THRESHOLD, excludeId, MAX_SIMILAR)
                    .stream()
                    .map(q -> new SimilarQuestion(
                            q.getId(),
                            q.getContent(),
                            q.getStatus() != null ? q.getStatus().getStatusName().name() : null))
                    .toList();
        } catch (Exception e) {
            // pg_trgm may be unavailable (privileges) — degrade to "no suggestions" instead of failing.
            return List.of();
        }
    }

    public record SimilarQuestion(Long id, String content, String status) {}
}
