package com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository;

import com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity.CategoryJpaEntity;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.GameMode;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.GameStatusType;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.GameSession;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.GameStatus;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.GameType;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.UserJpaEntity;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, Long> {

    List<GameSession> findByUser(UserJpaEntity user);

    List<GameSession> findByUserId(Long userId);

    List<GameSession> findByUserAndStatus(UserJpaEntity user, GameStatus status);

    List<GameSession> findByUserIdAndStatus(Long userId, GameStatus status);

    List<GameSession> findByCategory(CategoryJpaEntity category);

    List<GameSession> findByCategoryId(Long categoryId);

    List<GameSession> findByGameType(GameType gameType);

    List<GameSession> findByStatus(GameStatus status);

    List<GameSession> findByUserOrderByStartedAtDesc(UserJpaEntity user);

    List<GameSession> findByUserIdOrderByStartedAtDesc(Long userId);

    @Query("SELECT gs FROM GameSession gs WHERE gs.user.id = :userId AND gs.status = :status ORDER BY gs.startedAt DESC")
    List<GameSession> findByUserIdAndStatusOrderByStartedAtDesc(@Param("userId") Long userId, @Param("status") GameStatus status);

    @Query("SELECT COUNT(gs) FROM GameSession gs WHERE gs.user.id = :userId AND gs.status.statusName = com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.GameStatusType.COMPLETED")
    Long countCompletedByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(gs.totalScore) FROM GameSession gs WHERE gs.user.id = :userId AND gs.status.statusName = com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.GameStatusType.COMPLETED")
    Long sumTotalScoreByUserId(@Param("userId") Long userId);

    @Query("SELECT gs FROM GameSession gs WHERE gs.user.id = :userId AND gs.category.id = :categoryId ORDER BY gs.startedAt DESC")
    List<GameSession> findByUserIdAndCategoryIdOrderByStartedAtDesc(@Param("userId") Long userId, @Param("categoryId") Long categoryId);

    @Query("SELECT gs FROM GameSession gs WHERE gs.startedAt BETWEEN :startDate AND :endDate")
    List<GameSession> findByStartedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT gs FROM GameSession gs WHERE gs.user.id = :userId AND gs.startedAt BETWEEN :startDate AND :endDate ORDER BY gs.startedAt DESC")
    List<GameSession> findByUserIdAndStartedAtBetween(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // New methods for stats and leaderboard
    @Query("SELECT gs FROM GameSession gs WHERE gs.user.id = :userId AND gs.completedAt IS NOT NULL ORDER BY gs.completedAt DESC")
    List<GameSession> findByUserIdAndCompletedAtIsNotNull(@Param("userId") Long userId);

    @Query("SELECT gs FROM GameSession gs WHERE gs.completedAt IS NOT NULL")
    List<GameSession> findByCompletedAtIsNotNull();

    @Query("SELECT gs FROM GameSession gs WHERE gs.category.id = :categoryId AND gs.completedAt IS NOT NULL")
    List<GameSession> findByCategoryIdAndCompletedAtIsNotNull(@Param("categoryId") Long categoryId);

    @Query("SELECT COUNT(DISTINCT gs.user.id) FROM GameSession gs WHERE gs.completedAt IS NOT NULL")
    int countDistinctUsersWithCompletedSessions();

    // Game mode filtering methods
    @Query("SELECT gs FROM GameSession gs WHERE gs.gameMode = :gameMode AND gs.completedAt IS NOT NULL")
    List<GameSession> findByGameModeAndCompletedAtIsNotNull(@Param("gameMode") GameMode gameMode);

    @Query("SELECT gs FROM GameSession gs WHERE gs.category.id = :categoryId AND gs.gameMode = :gameMode AND gs.completedAt IS NOT NULL")
    List<GameSession> findByCategoryIdAndGameModeAndCompletedAtIsNotNull(
            @Param("categoryId") Long categoryId,
            @Param("gameMode") GameMode gameMode);
}
