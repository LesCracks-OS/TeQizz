package com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository;

import com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity.CategoryJpaEntity;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QuestionStatusType;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.Question;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.QuestionLevel;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    // ─── Anti-redundancy ────────────────────────────────────────────────────────

    /** Exact-duplicate lookup: an existing question with the same normalised-content hash. */
    Optional<Question> findFirstByContentHash(String contentHash);

    /** Legacy rows needing a back-filled hash (see the backfill runner). */
    List<Question> findByContentHashIsNull();

    /** All questions sharing a given content hash — a group of exact duplicates. */
    List<Question> findByContentHash(String contentHash);

    /** Content hashes shared by more than one question — the admin dedup queue. */
    @Query("SELECT q.contentHash FROM Question q WHERE q.contentHash IS NOT NULL "
            + "GROUP BY q.contentHash HAVING COUNT(q) > 1")
    List<String> findDuplicateContentHashes();

    /**
     * Near-duplicate ("fuzzy") search via pg_trgm trigram similarity on the raw content.
     * Returns the most similar questions above {@code threshold}, optionally excluding one id.
     */
    @Query(value = """
            SELECT * FROM questions q
            WHERE similarity(q.content, :text) >= :threshold
              AND (:excludeId IS NULL OR q.id <> :excludeId)
            ORDER BY similarity(q.content, :text) DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Question> findSimilarByContent(@Param("text") String text,
                                        @Param("threshold") double threshold,
                                        @Param("excludeId") Long excludeId,
                                        @Param("limit") int limit);

    List<Question> findByCategory(CategoryJpaEntity category);

    List<Question> findByCategoryId(Long categoryId);

    List<Question> findByCategoryAndStatusStatusName(CategoryJpaEntity category, QuestionStatusType statusName);

    @Query("SELECT q FROM Question q WHERE q.category.id = :categoryId AND q.status.statusName = :status")
    List<Question> findByCategoryIdAndStatus(@Param("categoryId") Long categoryId, @Param("status") QuestionStatusType status);

    @Query("SELECT q FROM Question q WHERE q.status.statusName = :status")
    List<Question> findByStatus(@Param("status") QuestionStatusType status);

    @Query("SELECT q FROM Question q JOIN q.tags t WHERE t.id = :tagId")
    List<Question> findByTagId(@Param("tagId") Long tagId);

    @Query("SELECT COUNT(q) FROM Question q WHERE q.category.id = :categoryId")
    Long countByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT COUNT(q) FROM Question q JOIN q.tags t WHERE t.id = :tagId")
    long countByTagId(@Param("tagId") Long tagId);

    @Query(value = "SELECT * FROM questions q WHERE q.category_id = :categoryId ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomQuestionsByCategoryId(@Param("categoryId") Long categoryId, @Param("limit") int limit);

    @Query(value = "SELECT * FROM questions ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomQuestions(@Param("limit") int limit);

    // QCM Game specific queries
    @Query("SELECT q FROM Question q WHERE q.category.id = :categoryId AND q.game.id = :gameId AND q.status.statusName = :status")
    List<Question> findByCategoryIdAndGameIdAndStatus(@Param("categoryId") Long categoryId, @Param("gameId") Long gameId, @Param("status") QuestionStatusType status);

    @Query("SELECT q FROM Question q WHERE q.category.id = :categoryId AND q.game.id = :gameId AND q.level = :level AND q.status.statusName = :status")
    List<Question> findByCategoryIdAndGameIdAndLevelAndStatus(@Param("categoryId") Long categoryId, @Param("gameId") Long gameId, @Param("level") QuestionLevel level, @Param("status") QuestionStatusType status);

    @Query("SELECT q FROM Question q WHERE q.game.id = :gameId AND q.status.statusName = :status ORDER BY RANDOM()")
    List<Question> findRandomByGameIdAndStatus(@Param("gameId") Long gameId, @Param("status") QuestionStatusType status);

    @Query("SELECT q FROM Question q WHERE q.id NOT IN :excludedIds AND q.category.id = :categoryId AND q.game.id = :gameId AND q.level.levelName = :levelName AND q.status.statusName = :status ORDER BY RANDOM()")
    List<Question> findRandomByCategoryAndGameAndLevelExcluding(@Param("categoryId") Long categoryId, @Param("gameId") Long gameId, @Param("levelName") String levelName, @Param("status") QuestionStatusType status, @Param("excludedIds") Set<Long> excludedIds);

    @Query("SELECT COUNT(q) FROM Question q WHERE q.category.id = :categoryId AND q.game.id = :gameId AND q.status.statusName = com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QuestionStatusType.ACTIVE")
    Long countByCategoryIdAndGameId(@Param("categoryId") Long categoryId, @Param("gameId") Long gameId);

    @Query("SELECT DISTINCT q FROM Question q JOIN q.tags t WHERE t.id IN :tagIds AND q.category.id = :categoryId AND q.game.id = :gameId AND q.status.statusName = :status")
    List<Question> findByCategoryIdAndGameIdAndTagIdsAndStatus(
            @Param("categoryId") Long categoryId,
            @Param("gameId") Long gameId,
            @Param("tagIds") List<Long> tagIds,
            @Param("status") QuestionStatusType status);

    List<Question> findBySubmittedById(Long userId);

    @Query("SELECT q FROM Question q WHERE q.submittedBy IS NOT NULL AND q.status.statusName = com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QuestionStatusType.REVIEW")
    List<Question> findPendingContributions();

    @Query("SELECT COUNT(q) FROM Question q WHERE q.submittedBy IS NOT NULL AND q.status.statusName = com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QuestionStatusType.REVIEW")
    long countPendingContributions();
}
