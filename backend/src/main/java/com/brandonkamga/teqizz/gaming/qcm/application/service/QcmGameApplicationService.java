package com.brandonkamga.teqizz.gaming.qcm.application.service;

import com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity.CategoryJpaEntity;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository.CategoryRepository;
import com.brandonkamga.teqizz.dto.qcm.*;
import com.brandonkamga.teqizz.exception.BadRequestException;
import com.brandonkamga.teqizz.exception.ResourceNotFoundException;
import com.brandonkamga.teqizz.gaming.qcm.application.port.in.*;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.GameMode;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.GameStatusType;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.GameTypeName;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QuestionLevelType;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QuestionStatusType;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.Answer;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.Game;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.GameSession;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.GameStatus;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.Question;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.UserAnswer;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.AnswerRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.GameRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.GameSessionRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.GameStatusRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.QuestionRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.UserAnswerRepository;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.UserJpaEntity;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class QcmGameApplicationService
        implements StartQcmSessionUseCase, GetNextQuestionUseCase, SubmitAnswerUseCase,
                   AbandonSessionUseCase, GetSessionResultUseCase, GetLeaderboardUseCase,
                   GetUserStatsUseCase {

    private final GameSessionRepository gameSessionRepository;
    private final GameRepository gameRepository;
    private final GameStatusRepository gameStatusRepository;
    private final CategoryRepository categoryRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final UserJpaRepository userRepository;

    public QcmGameApplicationService(
            GameSessionRepository gameSessionRepository,
            GameRepository gameRepository,
            GameStatusRepository gameStatusRepository,
            CategoryRepository categoryRepository,
            QuestionRepository questionRepository,
            AnswerRepository answerRepository,
            UserAnswerRepository userAnswerRepository,
            UserJpaRepository userRepository) {
        this.gameSessionRepository = gameSessionRepository;
        this.gameRepository = gameRepository;
        this.gameStatusRepository = gameStatusRepository;
        this.categoryRepository = categoryRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.userAnswerRepository = userAnswerRepository;
        this.userRepository = userRepository;
    }

    // ─── Use case port adapters ───────────────────────────────────────────────

    @Override
    public QcmGameSessionResponse start(StartQcmSessionUseCase.StartSessionCommand command) {
        QcmGameConfigRequest config = new QcmGameConfigRequest();
        config.setCategoryId(command.categoryId());
        config.setTagIds(command.tagIds());
        config.setGameMode(command.gameMode());
        config.setLives(command.lives());
        return createGameSession(command.userId(), config);
    }

    @Override
    @Transactional(readOnly = true)
    public QcmQuestionResponse getNext(Long sessionId) {
        return getNextQuestion(sessionId);
    }

    @Override
    public QcmSubmitAnswerResponse submit(Long sessionId, QcmSubmitAnswerRequest request) {
        return submitAnswer(sessionId, request);
    }

    @Override
    public void abandon(Long sessionId) {
        abandonGameSession(sessionId);
    }

    @Override
    @Transactional(readOnly = true)
    public QcmGameResultResponse getResult(Long sessionId) {
        return getGameResults(sessionId);
    }

    @Override
    @Transactional(readOnly = true)
    public QcmLeaderboardResponse getLeaderboard(int page, int size, Long categoryId, String gameMode) {
        return getLeaderboardInternal(page, size, categoryId, gameMode);
    }

    @Override
    @Transactional(readOnly = true)
    public QcmUserStatsResponse getStats(Long userId) {
        return getUserStats(userId);
    }

    // ─── Core game methods (called by controller and port adapters) ───────────

    public QcmGameSessionResponse createGameSession(Long userId, QcmGameConfigRequest config) {
        UserJpaEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        CategoryJpaEntity category = categoryRepository.findById(config.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", config.getCategoryId()));

        Game qcmGame = gameRepository.findByName(GameTypeName.QCM.name())
                .orElseThrow(() -> new ResourceNotFoundException("Game", "name", GameTypeName.QCM.name()));

        GameStatus inProgressStatus = gameStatusRepository.findByStatusName(GameStatusType.IN_PROGRESS)
                .orElseThrow(() -> new ResourceNotFoundException("GameStatus", "statusName", GameStatusType.IN_PROGRESS));

        GameMode gameMode = config.getGameMode();
        int lives = config.getLives() != null ? config.getLives() : 3;

        GameSession session = GameSession.builder()
                .user(user)
                .game(qcmGame)
                .category(category)
                .status(inProgressStatus)
                .gameMode(gameMode)
                .livesRemaining(lives)
                .globalTimerDuration(gameMode.getInitialTimeSeconds())
                .maxTimerDuration(gameMode.getMaxTimeSeconds())
                .startedAt(LocalDateTime.now())
                .build();
        session = gameSessionRepository.save(session);

        if (config.getTagIds() != null && !config.getTagIds().isEmpty()) {
            session.setTagFilterJson(config.getTagIds().stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(",")));
        }
        session.setCurrentTimerSeconds(gameMode.getInitialTimeSeconds());
        session.setLastAnswerAt(LocalDateTime.now());
        session = gameSessionRepository.save(session);

        return QcmGameSessionResponse.builder()
                .sessionId(session.getId())
                .categoryId(category.getId())
                .categoryName(category.getName())
                .livesRemaining(session.getLivesRemaining())
                .currentQuestionIndex(0)
                .globalTimerDuration(session.getGlobalTimerDuration())
                .startedAt(session.getStartedAt())
                .status(GameStatusType.IN_PROGRESS.name())
                .currentDifficulty(QuestionLevelType.EASY.name())
                .gameMode(gameMode.name())
                .maxTimerDuration(gameMode.getMaxTimeSeconds())
                .build();
    }

    public QcmQuestionResponse getNextQuestion(Long sessionId) {
        GameSession session = getValidSession(sessionId);

        if (session.isGameOver() || session.getCompletedAt() != null) {
            throw new BadRequestException("Game session is already completed");
        }

        List<UserAnswer> answeredQuestions = userAnswerRepository.findByGameSessionId(sessionId);
        int currentQuestionIndex = answeredQuestions.size();

        GameMode gameMode = session.getGameMode() != null ? session.getGameMode() : GameMode.CLASSIC;
        QuestionLevelType currentDifficulty = determineCurrentDifficulty(session.getTotalScore(), gameMode);
        Question question = selectNextQuestion(session, answeredQuestions, currentDifficulty);

        List<Answer> answers = answerRepository.findByQuestionIdAndIsActiveTrue(question.getId());
        Collections.shuffle(answers);

        return QcmQuestionResponse.builder()
                .questionId(question.getId())
                .questionIndex(currentQuestionIndex + 1)
                .content(question.getContent())
                .hint(question.getHint())
                .showHint(question.getHint() != null && !question.getHint().isEmpty())
                .difficultyLevel(question.getLevel().getLevelName().name())
                .answers(answers.stream()
                        .map(a -> QcmQuestionResponse.AnswerOption.builder()
                                .answerId(a.getId())
                                .content(a.getContent())
                                .displayOrder(answers.indexOf(a) + 1)
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    public QcmSubmitAnswerResponse submitAnswer(Long sessionId, QcmSubmitAnswerRequest request) {
        GameSession session = getValidSession(sessionId);

        if (session.getCurrentTimerSeconds() != null && session.getLastAnswerAt() != null) {
            long elapsed = Duration.between(session.getLastAnswerAt(), LocalDateTime.now()).getSeconds();
            if (session.getCurrentTimerSeconds() - (int) elapsed <= 0) {
                session.setCurrentTimerSeconds(0);
                session.complete();
                gameSessionRepository.save(session);
                throw new BadRequestException("Game session timer has expired");
            }
        }

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", request.getQuestionId()));

        boolean alreadyAnswered = userAnswerRepository.findByGameSessionId(sessionId).stream()
                .anyMatch(ua -> ua.getQuestion().getId().equals(request.getQuestionId()));
        if (alreadyAnswered) {
            throw new BadRequestException("Question already answered in this session");
        }

        Answer selectedAnswer = answerRepository.findById(request.getSelectedAnswerId())
                .orElseThrow(() -> new ResourceNotFoundException("Answer", "id", request.getSelectedAnswerId()));

        if (!selectedAnswer.getQuestion().getId().equals(question.getId())) {
            throw new BadRequestException("Answer does not belong to the specified question");
        }

        Answer correctAnswer = answerRepository.findByQuestionIdAndIsCorrectTrue(question.getId()).stream()
                .findFirst()
                .orElseThrow(() -> new BadRequestException("No correct answer found for question"));

        boolean isCorrect = selectedAnswer.getIsCorrect();
        QuestionLevelType questionDifficulty = question.getLevel().getLevelName();
        GameMode gameMode = session.getGameMode() != null ? session.getGameMode() : GameMode.CLASSIC;

        int pointsEarned = 0;
        int timeAdjustment = 0;
        if (isCorrect) {
            pointsEarned = gameMode.getPointsForDifficulty(questionDifficulty);
            timeAdjustment = gameMode.getTimeBonusForDifficulty(questionDifficulty);
        } else {
            timeAdjustment = -gameMode.getTimePenalty();
        }

        UserAnswer userAnswer = UserAnswer.builder()
                .gameSession(session)
                .question(question)
                .selectedAnswer(selectedAnswer)
                .isCorrect(isCorrect)
                .pointsEarned(pointsEarned)
                .timeTakenSeconds(request.getTimeTakenSeconds())
                .usedHint(request.getUsedHint())
                .build();
        userAnswerRepository.save(userAnswer);

        session.setTotalQuestions(session.getTotalQuestions() + 1);
        if (isCorrect) {
            session.setCorrectAnswers(session.getCorrectAnswers() + 1);
            session.setTotalScore(session.getTotalScore() + pointsEarned);
        } else {
            session.setWrongAnswers(session.getWrongAnswers() + 1);
            session.setLivesRemaining(session.getLivesRemaining() - 1);
        }

        boolean timerExpired = false;
        if (session.getCurrentTimerSeconds() != null && session.getLastAnswerAt() != null) {
            long elapsed = Duration.between(session.getLastAnswerAt(), LocalDateTime.now()).getSeconds();
            int maxTimer = session.getMaxTimerDuration() != null ? session.getMaxTimerDuration() : Integer.MAX_VALUE;
            int newTimer = Math.max(0, Math.min(session.getCurrentTimerSeconds() - (int) elapsed + timeAdjustment, maxTimer));
            session.setCurrentTimerSeconds(newTimer);
            session.setLastAnswerAt(LocalDateTime.now());
            if (newTimer <= 0) timerExpired = true;
        }

        int questionsAnswered = (int) userAnswerRepository.countByGameSessionId(sessionId) + 1;
        boolean isGameOver = session.getLivesRemaining() <= 0 || timerExpired;
        if (isGameOver) session.complete();
        gameSessionRepository.save(session);

        QuestionLevelType newDifficulty = determineCurrentDifficulty(session.getTotalScore(), gameMode);

        return QcmSubmitAnswerResponse.builder()
                .isCorrect(isCorrect)
                .explanation(question.getExplanation())
                .correctAnswerId(correctAnswer.getId())
                .correctAnswerContent(correctAnswer.getContent())
                .currentScore(session.getTotalScore())
                .correctAnswers(session.getCorrectAnswers())
                .wrongAnswers(session.getWrongAnswers())
                .livesRemaining(session.getLivesRemaining())
                .questionsAnswered(questionsAnswered)
                .isGameOver(isGameOver)
                .timerExpired(timerExpired)
                .difficultyLevel(newDifficulty.name())
                .hasNextQuestion(!isGameOver)
                .nextQuestionIndex(isGameOver ? null : questionsAnswered + 1)
                .timeAdjustment(timeAdjustment)
                .build();
    }

    public QcmGameResultResponse getGameResults(Long sessionId) {
        GameSession session = gameSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("GameSession", "id", sessionId));

        if (session.getCompletedAt() == null) {
            throw new BadRequestException("Game session is not yet completed");
        }

        List<UserAnswer> answers = userAnswerRepository.findByGameSessionId(sessionId);
        GameMode gameMode = session.getGameMode() != null ? session.getGameMode() : GameMode.CLASSIC;

        List<QcmGameResultResponse.QuestionReview> reviews = new ArrayList<>();
        int index = 1;
        for (UserAnswer ua : answers) {
            Answer correctAnswer = answerRepository.findByQuestionIdAndIsCorrectTrue(ua.getQuestion().getId()).stream()
                    .findFirst().orElse(null);
            reviews.add(QcmGameResultResponse.QuestionReview.builder()
                    .questionIndex(index++)
                    .questionContent(ua.getQuestion().getContent())
                    .difficultyLevel(ua.getQuestion().getLevel().getLevelName().name())
                    .userAnswerContent(ua.getSelectedAnswer() != null ? ua.getSelectedAnswer().getContent() : "No answer")
                    .correctAnswerContent(correctAnswer != null ? correctAnswer.getContent() : "N/A")
                    .wasCorrect(ua.isCorrect())
                    .explanation(ua.getQuestion().getExplanation())
                    .timeTakenSeconds(ua.getTimeTakenSeconds())
                    .pointsEarned(ua.getPointsEarned())
                    .build());
        }

        long durationSeconds = Duration.between(session.getStartedAt(), session.getCompletedAt()).getSeconds();
        double efficiency = gameMode.calculateEfficiency(session.getTotalScore(), (int) durationSeconds);
        String performanceLevel = determinePerformanceLevel(session.getAccuracy());

        QuestionLevelType startDiff = answers.isEmpty() ? QuestionLevelType.EASY : answers.get(0).getQuestion().getLevel().getLevelName();
        QuestionLevelType endDiff = answers.isEmpty() ? QuestionLevelType.EASY : answers.get(answers.size() - 1).getQuestion().getLevel().getLevelName();
        QuestionLevelType maxDiff = answers.stream()
                .map(ua -> ua.getQuestion().getLevel().getLevelName())
                .max(Comparator.comparingInt(this::getDifficultyOrder))
                .orElse(QuestionLevelType.EASY);

        String endReason = session.getLivesRemaining() <= 0 ? "LIVES_DEPLETED" : "TIMER_EXPIRED";

        return QcmGameResultResponse.builder()
                .sessionId(session.getId())
                .categoryName(session.getCategory() != null ? session.getCategory().getName() : "Mixed")
                .gameMode(gameMode.name())
                .globalTimerDuration(session.getGlobalTimerDuration())
                .maxTimerDuration(session.getMaxTimerDuration())
                .totalScore(session.getTotalScore())
                .correctAnswers(session.getCorrectAnswers())
                .wrongAnswers(session.getWrongAnswers())
                .totalQuestionsAnswered(answers.size())
                .accuracy(session.getAccuracy())
                .efficiency(efficiency)
                .livesRemaining(session.getLivesRemaining())
                .startedAt(session.getStartedAt())
                .completedAt(session.getCompletedAt())
                .durationSeconds(durationSeconds)
                .endReason(endReason)
                .performanceLevel(performanceLevel)
                .pointsEarned(session.getTotalScore())
                .startingDifficulty(startDiff.name())
                .endingDifficulty(endDiff.name())
                .maxDifficultyReached(maxDiff.name())
                .questionReviews(reviews)
                .build();
    }

    public void abandonGameSession(Long sessionId) {
        GameSession session = getValidSession(sessionId);
        session.complete();
        gameSessionRepository.save(session);
    }

    @Transactional(readOnly = true)
    public QcmGameSessionResponse getSessionState(Long sessionId) {
        GameSession session = gameSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("GameSession", "id", sessionId));
        int currentQuestionIndex = (int) userAnswerRepository.countByGameSessionId(sessionId);
        GameMode gameMode = session.getGameMode() != null ? session.getGameMode() : GameMode.CLASSIC;
        QuestionLevelType currentDifficulty = determineCurrentDifficulty(session.getTotalScore(), gameMode);

        return QcmGameSessionResponse.builder()
                .sessionId(session.getId())
                .categoryId(session.getCategory() != null ? session.getCategory().getId() : null)
                .categoryName(session.getCategory() != null ? session.getCategory().getName() : null)
                .livesRemaining(session.getLivesRemaining())
                .currentQuestionIndex(currentQuestionIndex)
                .globalTimerDuration(session.getGlobalTimerDuration())
                .maxTimerDuration(session.getMaxTimerDuration())
                .startedAt(session.getStartedAt())
                .status(session.getCompletedAt() != null ? "COMPLETED" : "IN_PROGRESS")
                .currentDifficulty(currentDifficulty.name())
                .gameMode(gameMode.name())
                .build();
    }

    @Transactional(readOnly = true)
    public void validateSessionOwnership(Long sessionId, Long userId) {
        GameSession session = gameSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("GameSession", "id", sessionId));
        if (!session.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You do not have access to this game session");
        }
    }

    public void resetUserStats(Long userId) {
        List<GameSession> sessions = gameSessionRepository.findByUserId(userId);
        for (GameSession session : sessions) {
            userAnswerRepository.deleteByGameSessionId(session.getId());
        }
        gameSessionRepository.deleteAll(sessions);
    }

    @Transactional(readOnly = true)
    public QcmUserStatsResponse getUserStats(Long userId) {
        List<GameSession> sessions = gameSessionRepository.findByUserIdAndCompletedAtIsNotNull(userId);

        if (sessions.isEmpty()) {
            return QcmUserStatsResponse.builder()
                    .totalGamesPlayed(0).totalQuestionsAnswered(0).totalCorrectAnswers(0)
                    .totalWrongAnswers(0).overallAccuracy(0.0).totalPointsEarned(0)
                    .bestScore(0).averageScore(0.0).recentAccuracy(0.0).recentGamesPlayed(0)
                    .currentStreak(0).highestDifficultyReached("EASY").leaderboardPosition(0)
                    .totalPlayers(0).categoryStats(new ArrayList<>())
                    .gameModeStats(new ArrayList<>()).recentGames(new ArrayList<>())
                    .build();
        }

        int totalGamesPlayed = sessions.size();
        int totalQuestionsAnswered = sessions.stream().mapToInt(GameSession::getTotalQuestions).sum();
        int totalCorrectAnswers = sessions.stream().mapToInt(GameSession::getCorrectAnswers).sum();
        int totalWrongAnswers = sessions.stream().mapToInt(GameSession::getWrongAnswers).sum();
        int totalPointsEarned = sessions.stream().mapToInt(GameSession::getTotalScore).sum();
        int bestScore = sessions.stream().mapToInt(GameSession::getTotalScore).max().orElse(0);
        double averageScore = (double) totalPointsEarned / totalGamesPlayed;
        double overallAccuracy = calculateAverageGameAccuracy(sessions);

        List<GameSession> recentSessions = sessions.stream()
                .sorted((a, b) -> b.getCompletedAt().compareTo(a.getCompletedAt()))
                .limit(10).collect(Collectors.toList());
        double recentAccuracy = calculateAverageGameAccuracy(recentSessions);
        int currentStreak = calculateStreak(sessions);
        String bestPerformingLevel = determineBestPerformingLevel(userId);
        Map<String, Double> accuracyByDifficulty = calculateAccuracyByDifficulty(userId);

        Map<Long, List<GameSession>> byCategory = sessions.stream()
                .filter(s -> s.getCategory() != null)
                .collect(Collectors.groupingBy(s -> s.getCategory().getId()));
        List<QcmUserStatsResponse.CategoryStats> categoryStats = new ArrayList<>();
        for (Map.Entry<Long, List<GameSession>> entry : byCategory.entrySet()) {
            List<GameSession> catSessions = entry.getValue();
            CategoryJpaEntity category = catSessions.get(0).getCategory();
            int catQuestions = catSessions.stream().mapToInt(GameSession::getTotalQuestions).sum();
            int catCorrect = catSessions.stream().mapToInt(GameSession::getCorrectAnswers).sum();
            categoryStats.add(QcmUserStatsResponse.CategoryStats.builder()
                    .categoryId(category.getId()).categoryName(category.getName())
                    .gamesPlayed(catSessions.size()).questionsAnswered(catQuestions)
                    .accuracy(catQuestions > 0 ? (double) catCorrect / catQuestions * 100 : 0.0)
                    .bestScore(catSessions.stream().mapToInt(GameSession::getTotalScore).max().orElse(0))
                    .averageScore(catSessions.stream().mapToInt(GameSession::getTotalScore).average().orElse(0))
                    .build());
        }

        List<QcmUserStatsResponse.RecentGame> recentGames = recentSessions.stream().limit(5)
                .map(s -> QcmUserStatsResponse.RecentGame.builder()
                        .sessionId(s.getId())
                        .categoryName(s.getCategory() != null ? s.getCategory().getName() : "Mixed")
                        .score(s.getTotalScore()).correctAnswers(s.getCorrectAnswers())
                        .totalQuestions(s.getTotalQuestions()).accuracy(s.getAccuracy())
                        .difficultyReached(getEndingDifficulty(s.getId()))
                        .completedAt(s.getCompletedAt().toString())
                        .durationSeconds(s.getCompletedAt() != null && s.getStartedAt() != null
                                ? (int) Duration.between(s.getStartedAt(), s.getCompletedAt()).getSeconds() : 0)
                        .build())
                .collect(Collectors.toList());

        List<QcmUserStatsResponse.GameModeStats> gameModeStats = new ArrayList<>();
        for (GameMode mode : GameMode.values()) {
            List<GameSession> modeSessions = sessions.stream()
                    .filter(s -> s.getGameMode() == mode).collect(Collectors.toList());
            if (!modeSessions.isEmpty()) {
                int modeGames = modeSessions.size();
                int modeScore = modeSessions.stream().mapToInt(GameSession::getTotalScore).sum();
                int modeQuestions = modeSessions.stream().mapToInt(GameSession::getTotalQuestions).sum();
                int modeCorrect = modeSessions.stream().mapToInt(GameSession::getCorrectAnswers).sum();
                gameModeStats.add(QcmUserStatsResponse.GameModeStats.builder()
                        .gameMode(mode.name()).gamesPlayed(modeGames).totalScore(modeScore)
                        .averageScore((double) modeScore / modeGames)
                        .bestScore(modeSessions.stream().mapToInt(GameSession::getTotalScore).max().orElse(0))
                        .accuracy(modeQuestions > 0 ? (double) modeCorrect / modeQuestions * 100 : 0.0)
                        .totalQuestions(modeQuestions).correctAnswers(modeCorrect)
                        .build());
            }
        }

        int leaderboardPosition = calculateLeaderboardPosition(userId);
        int totalPlayers = gameSessionRepository.countDistinctUsersWithCompletedSessions();

        return QcmUserStatsResponse.builder()
                .totalGamesPlayed(totalGamesPlayed).totalQuestionsAnswered(totalQuestionsAnswered)
                .totalCorrectAnswers(totalCorrectAnswers).totalWrongAnswers(totalWrongAnswers)
                .overallAccuracy(overallAccuracy).totalPointsEarned(totalPointsEarned)
                .bestScore(bestScore).averageScore(averageScore).recentAccuracy(recentAccuracy)
                .recentGamesPlayed(recentSessions.size()).currentStreak(currentStreak)
                .bestPerformingLevel(bestPerformingLevel).accuracyByDifficulty(accuracyByDifficulty)
                .categoryStats(categoryStats).gameModeStats(gameModeStats).recentGames(recentGames)
                .leaderboardPosition(leaderboardPosition).totalPlayers(totalPlayers)
                .build();
    }

    private QcmLeaderboardResponse getLeaderboardInternal(int page, int size, Long categoryId, String gameMode) {
        boolean filterByMode = gameMode != null && !"ALL".equals(gameMode);
        List<GameSession> sessions;

        if (categoryId != null && filterByMode) {
            sessions = gameSessionRepository.findByCategoryIdAndGameModeAndCompletedAtIsNotNull(categoryId, GameMode.valueOf(gameMode));
        } else if (categoryId != null) {
            sessions = gameSessionRepository.findByCategoryIdAndCompletedAtIsNotNull(categoryId);
        } else if (filterByMode) {
            sessions = gameSessionRepository.findByGameModeAndCompletedAtIsNotNull(GameMode.valueOf(gameMode));
        } else {
            sessions = gameSessionRepository.findByCompletedAtIsNotNull();
        }

        Map<Long, List<GameSession>> byUser = sessions.stream()
                .collect(Collectors.groupingBy(s -> s.getUser().getId()));
        Map<Long, String> highestDifficultiesMap = getHighestDifficultiesForUsers(byUser.keySet());

        List<QcmLeaderboardResponse.LeaderboardEntry> entries = new ArrayList<>();
        for (Map.Entry<Long, List<GameSession>> entry : byUser.entrySet()) {
            Long userId = entry.getKey();
            List<GameSession> userSessions = entry.getValue();
            UserJpaEntity user = userSessions.get(0).getUser();

            int totalScore = userSessions.stream().mapToInt(GameSession::getTotalScore).sum();
            int gamesPlayed = userSessions.size();
            int totalQuestions = userSessions.stream().mapToInt(GameSession::getTotalQuestions).sum();
            int totalCorrect = userSessions.stream().mapToInt(GameSession::getCorrectAnswers).sum();
            double accuracy = totalQuestions > 0 ? (double) totalCorrect / totalQuestions * 100 : 0.0;
            int bestScore = userSessions.stream().mapToInt(GameSession::getTotalScore).max().orElse(0);
            double averageScore = (double) totalScore / gamesPlayed;

            String topCategory = userSessions.stream()
                    .filter(s -> s.getCategory() != null)
                    .collect(Collectors.groupingBy(s -> s.getCategory().getName(), Collectors.counting()))
                    .entrySet().stream().max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey).orElse("N/A");

            String highestDifficulty = highestDifficultiesMap.getOrDefault(userId, "EASY");
            int difficultyFactor = getDifficultyFactor(highestDifficulty);
            double normalizedAvgScore = Math.min(averageScore / 100.0 * 100, 100);
            double compositeScore = Math.min((normalizedAvgScore * 0.5) + (accuracy * 0.3) + (difficultyFactor * 5), 100);

            entries.add(QcmLeaderboardResponse.LeaderboardEntry.builder()
                    .userId(userId).username(user.getUsername()).avatarUrl(null)
                    .compositeScore(compositeScore).totalScore(totalScore).gamesPlayed(gamesPlayed)
                    .accuracy(accuracy).bestScore(bestScore).averageScore(averageScore)
                    .topCategory(topCategory).highestDifficulty(highestDifficulty).difficultyFactor(difficultyFactor)
                    .blitzGamesPlayed((int) userSessions.stream().filter(s -> s.getGameMode() == GameMode.BLITZ).count())
                    .rushGamesPlayed((int) userSessions.stream().filter(s -> s.getGameMode() == GameMode.RUSH).count())
                    .classicGamesPlayed((int) userSessions.stream().filter(s -> s.getGameMode() == GameMode.CLASSIC).count())
                    .build());
        }

        entries.sort((a, b) -> Double.compare(b.getCompositeScore(), a.getCompositeScore()));
        for (int i = 0; i < entries.size(); i++) entries.get(i).setRank(i + 1);

        int totalPlayers = entries.size();
        int totalPages = (int) Math.ceil((double) totalPlayers / size);
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, entries.size());
        List<QcmLeaderboardResponse.LeaderboardEntry> paged =
                fromIndex < entries.size() ? entries.subList(fromIndex, toIndex) : new ArrayList<>();

        return QcmLeaderboardResponse.builder()
                .gameMode(gameMode != null ? gameMode : "ALL")
                .entries(paged).totalPlayers(totalPlayers)
                .currentPage(page).totalPages(totalPages)
                .build();
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private GameSession getValidSession(Long sessionId) {
        GameSession session = gameSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("GameSession", "id", sessionId));
        if (session.getCompletedAt() != null) {
            throw new BadRequestException("Game session is already completed");
        }
        return session;
    }

    private Question selectNextQuestion(GameSession session, List<UserAnswer> answeredQuestions, QuestionLevelType difficulty) {
        Set<Long> answeredIds = answeredQuestions.stream()
                .map(ua -> ua.getQuestion().getId()).collect(Collectors.toSet());

        List<Question> available;
        if (session.getGame() != null) {
            available = questionRepository.findByCategoryIdAndGameIdAndStatus(
                    session.getCategory().getId(), session.getGame().getId(), QuestionStatusType.ACTIVE);
        } else {
            available = questionRepository.findByCategoryIdAndStatus(
                    session.getCategory().getId(), QuestionStatusType.ACTIVE);
        }

        String tagFilterJson = session.getTagFilterJson();
        if (tagFilterJson != null && !tagFilterJson.isEmpty() && session.getGame() != null) {
            List<Long> tagIds = Arrays.stream(tagFilterJson.split(","))
                    .map(Long::parseLong).collect(Collectors.toList());
            List<Question> tagFiltered = questionRepository.findByCategoryIdAndGameIdAndTagIdsAndStatus(
                    session.getCategory().getId(), session.getGame().getId(), tagIds, QuestionStatusType.ACTIVE);
            Set<Long> tagFilteredIds = tagFiltered.stream().map(Question::getId).collect(Collectors.toSet());
            available = available.stream().filter(q -> tagFilteredIds.contains(q.getId())).collect(Collectors.toList());
        }

        available = available.stream().filter(q -> !answeredIds.contains(q.getId())).collect(Collectors.toList());

        List<Question> diffMatched = available.stream()
                .filter(q -> q.getLevel().getLevelName() == difficulty).collect(Collectors.toList());
        if (!diffMatched.isEmpty()) {
            Collections.shuffle(diffMatched);
            return diffMatched.get(0);
        }

        if (!available.isEmpty()) {
            available.sort(Comparator.comparingInt(q -> Math.abs(q.getLevel().getLevelName().ordinal() - difficulty.ordinal())));
            return available.get(0);
        }

        throw new BadRequestException("No more questions available");
    }

    private QuestionLevelType determineCurrentDifficulty(int currentScore, GameMode gameMode) {
        return gameMode.determineDifficulty(currentScore);
    }

    private int getDifficultyOrder(QuestionLevelType difficulty) {
        return switch (difficulty) { case EASY -> 1; case MEDIUM -> 2; case HARD -> 3; case EXPERT -> 4; };
    }

    private String determinePerformanceLevel(double accuracy) {
        if (accuracy >= 90) return "Excellent";
        if (accuracy >= 75) return "Good";
        if (accuracy >= 50) return "Average";
        return "Needs Improvement";
    }

    private Map<Long, String> getHighestDifficultiesForUsers(Set<Long> userIds) {
        Map<Long, String> result = new HashMap<>();
        if (userIds.isEmpty()) return result;
        userIds.forEach(id -> result.put(id, "EASY"));
        List<Object[]> rows = userAnswerRepository.findUserIdAndDifficultyByUserIds(new ArrayList<>(userIds));
        for (Object[] row : rows) {
            Long uid = (Long) row[0];
            QuestionLevelType level = (QuestionLevelType) row[1];
            String current = result.get(uid);
            if (current == null || getDifficultyOrder(level) > getDifficultyOrder(QuestionLevelType.valueOf(current))) {
                result.put(uid, level.name());
            }
        }
        return result;
    }

    private int getDifficultyFactor(String difficulty) {
        if (difficulty == null) return 1;
        return switch (difficulty) { case "EXPERT" -> 4; case "HARD" -> 3; case "MEDIUM" -> 2; default -> 1; };
    }

    private int calculateStreak(List<GameSession> sessions) {
        if (sessions.isEmpty()) return 0;
        List<LocalDateTime> dates = sessions.stream()
                .map(GameSession::getCompletedAt).filter(Objects::nonNull)
                .sorted((a, b) -> b.compareTo(a)).collect(Collectors.toList());
        if (dates.isEmpty()) return 0;
        int streak = 1;
        LocalDateTime last = dates.get(0).toLocalDate().atStartOfDay();
        for (int i = 1; i < dates.size(); i++) {
            LocalDateTime cur = dates.get(i).toLocalDate().atStartOfDay();
            long days = Duration.between(cur, last).toDays();
            if (days == 1) { streak++; last = cur; } else if (days > 1) break;
        }
        return streak;
    }

    private String determineBestPerformingLevel(Long userId) {
        List<UserAnswer> answers = userAnswerRepository.findByGameSessionUserId(userId);
        if (answers.isEmpty()) return "N/A";
        Map<QuestionLevelType, List<UserAnswer>> byDiff = answers.stream()
                .collect(Collectors.groupingBy(a -> a.getQuestion().getLevel().getLevelName()));
        double bestAccuracy = -1;
        QuestionLevelType bestLevel = QuestionLevelType.EASY;
        for (Map.Entry<QuestionLevelType, List<UserAnswer>> e : byDiff.entrySet()) {
            List<UserAnswer> la = e.getValue();
            if (la.size() < 3) continue;
            double acc = (double) la.stream().filter(UserAnswer::isCorrect).count() / la.size() * 100;
            if (acc > bestAccuracy) { bestAccuracy = acc; bestLevel = e.getKey(); }
        }
        return bestLevel.name();
    }

    private Map<String, Double> calculateAccuracyByDifficulty(Long userId) {
        List<UserAnswer> answers = userAnswerRepository.findByGameSessionUserId(userId);
        Map<String, Double> result = new HashMap<>();
        if (answers.isEmpty()) {
            for (QuestionLevelType l : QuestionLevelType.values()) result.put(l.name(), 0.0);
            return result;
        }
        Map<QuestionLevelType, List<UserAnswer>> byDiff = answers.stream()
                .collect(Collectors.groupingBy(a -> a.getQuestion().getLevel().getLevelName()));
        for (QuestionLevelType level : QuestionLevelType.values()) {
            List<UserAnswer> la = byDiff.getOrDefault(level, new ArrayList<>());
            result.put(level.name(), la.isEmpty() ? 0.0 :
                    (double) la.stream().filter(UserAnswer::isCorrect).count() / la.size() * 100);
        }
        return result;
    }

    private double calculateAverageGameAccuracy(List<GameSession> sessions) {
        if (sessions.isEmpty()) return 0.0;
        return sessions.stream().mapToDouble(GameSession::getAccuracy).sum() / sessions.size();
    }

    private String getEndingDifficulty(Long sessionId) {
        List<UserAnswer> answers = userAnswerRepository.findByGameSessionId(sessionId);
        if (answers.isEmpty()) return "EASY";
        return answers.get(answers.size() - 1).getQuestion().getLevel().getLevelName().name();
    }

    private int calculateLeaderboardPosition(Long userId) {
        Map<Long, Integer> scores = gameSessionRepository.findByCompletedAtIsNotNull().stream()
                .collect(Collectors.groupingBy(s -> s.getUser().getId(), Collectors.summingInt(GameSession::getTotalScore)));
        List<Map.Entry<Long, Integer>> sorted = scores.entrySet().stream()
                .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue())).collect(Collectors.toList());
        for (int i = 0; i < sorted.size(); i++) {
            if (sorted.get(i).getKey().equals(userId)) return i + 1;
        }
        return 0;
    }
}
