package com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository;

import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.GameSession;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.UserAnswer;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserAnswerRepository extends JpaRepository<UserAnswer, Long> {

    List<UserAnswer> findByGameSession(GameSession gameSession);

    List<UserAnswer> findByGameSessionId(Long gameSessionId);

    List<UserAnswer> findByGameSessionAndIsCorrectTrue(GameSession gameSession);

    List<UserAnswer> findByGameSessionIdAndIsCorrectTrue(Long gameSessionId);

    List<UserAnswer> findByGameSessionIdAndIsCorrectFalse(Long gameSessionId);

    long countByGameSessionId(Long gameSessionId);

    long countByGameSessionIdAndIsCorrectTrue(Long gameSessionId);

    long countByGameSessionIdAndIsCorrectFalse(Long gameSessionId);

    @Query("SELECT SUM(ua.pointsEarned) FROM UserAnswer ua WHERE ua.gameSession.id = :gameSessionId")
    Integer sumPointsEarnedByGameSessionId(@Param("gameSessionId") Long gameSessionId);

    @Query("SELECT AVG(ua.timeTakenSeconds) FROM UserAnswer ua WHERE ua.gameSession.id = :gameSessionId AND ua.timeTakenSeconds IS NOT NULL")
    Double averageTimeTakenByGameSessionId(@Param("gameSessionId") Long gameSessionId);

    void deleteByGameSessionId(Long gameSessionId);

    // New method for stats - get all answers by user
    @Query("SELECT ua FROM UserAnswer ua WHERE ua.gameSession.user.id = :userId")
    List<UserAnswer> findByGameSessionUserId(@Param("userId") Long userId);

    // Batch query: returns [userId, levelName] pairs for all users in the set - avoids N+1 in leaderboard
    @Query("SELECT ua.gameSession.user.id, ua.question.level.levelName FROM UserAnswer ua WHERE ua.gameSession.user.id IN :userIds")
    List<Object[]> findUserIdAndDifficultyByUserIds(@Param("userIds") List<Long> userIds);
}
