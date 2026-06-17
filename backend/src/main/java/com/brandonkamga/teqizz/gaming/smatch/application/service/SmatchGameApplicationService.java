package com.brandonkamga.teqizz.gaming.smatch.application.service;

import com.brandonkamga.teqizz.exception.ResourceNotFoundException;
import com.brandonkamga.teqizz.gaming.smatch.application.port.in.*;
import com.brandonkamga.teqizz.gaming.smatch.application.port.in.GetSmatchDecksUseCase.*;
import com.brandonkamga.teqizz.gaming.smatch.application.port.in.GetSmatchResultUseCase.SmatchResultView;
import com.brandonkamga.teqizz.gaming.smatch.application.port.in.StartSmatchSessionUseCase.SmatchSessionView;
import com.brandonkamga.teqizz.gaming.smatch.application.port.in.SubmitSmatchAttemptUseCase.AttemptResultView;
import com.brandonkamga.teqizz.gaming.smatch.domain.model.vo.SmatchGameMode;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.entity.SmatchAttemptJpaEntity;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.entity.SmatchDeckJpaEntity;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.entity.SmatchPairJpaEntity;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.entity.SmatchSessionJpaEntity;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.repository.SmatchAttemptRepository;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.repository.SmatchDeckRepository;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.repository.SmatchPairRepository;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.repository.SmatchSessionRepository;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.UserJpaEntity;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SmatchGameApplicationService
        implements StartSmatchSessionUseCase, SubmitSmatchAttemptUseCase,
                   GetSmatchSessionUseCase, GetSmatchResultUseCase,
                   AbandonSmatchSessionUseCase, GetSmatchDecksUseCase {

    private final SmatchDeckRepository deckRepository;
    private final SmatchPairRepository pairRepository;
    private final SmatchSessionRepository sessionRepository;
    private final SmatchAttemptRepository attemptRepository;
    private final UserJpaRepository userRepository;

    public SmatchGameApplicationService(SmatchDeckRepository deckRepository,
                                        SmatchPairRepository pairRepository,
                                        SmatchSessionRepository sessionRepository,
                                        SmatchAttemptRepository attemptRepository,
                                        UserJpaRepository userRepository) {
        this.deckRepository = deckRepository;
        this.pairRepository = pairRepository;
        this.sessionRepository = sessionRepository;
        this.attemptRepository = attemptRepository;
        this.userRepository = userRepository;
    }

    // ─── Start session ────────────────────────────────────────────────────────

    @Override
    public SmatchSessionView start(StartSmatchSessionCommand command) {
        SmatchDeckJpaEntity deck = deckRepository.findById(command.deckId())
                .orElseThrow(() -> new ResourceNotFoundException("SmatchDeck", "id", command.deckId()));

        SmatchGameMode mode = parseMode(command.gameMode());
        UserJpaEntity user = userRepository.findById(command.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", command.userId()));

        int totalPairs = (int) pairRepository.countByDeckIdAndIsActiveTrue(deck.getId());

        SmatchSessionJpaEntity session = SmatchSessionJpaEntity.builder()
                .user(user)
                .deck(deck)
                .gameMode(mode)
                .livesRemaining(mode.hasLives() ? mode.getMaxLives() : null)
                .totalScore(0)
                .pairsMatched(0)
                .wrongAttempts(0)
                .timerDuration(mode.hasTimer() ? mode.getInitialTimeSeconds() : null)
                .startedAt(LocalDateTime.now())
                .build();

        session = sessionRepository.save(session);
        return toSessionView(session, deck, totalPairs);
    }

    // ─── Submit attempt ───────────────────────────────────────────────────────

    @Override
    public AttemptResultView submit(SubmitAttemptCommand command) {
        SmatchSessionJpaEntity session = sessionRepository.findById(command.sessionId())
                .orElseThrow(() -> new ResourceNotFoundException("SmatchSession", "id", command.sessionId()));

        if (session.isCompleted()) {
            throw new IllegalStateException("Session is already completed");
        }

        SmatchPairJpaEntity pair = pairRepository.findById(command.pairId())
                .orElseThrow(() -> new ResourceNotFoundException("SmatchPair", "id", command.pairId()));

        if (!pair.getDeck().getId().equals(session.getDeck().getId())) {
            throw new IllegalArgumentException("Pair does not belong to this session's deck");
        }

        SmatchGameMode mode = session.getGameMode();
        boolean correct = Boolean.TRUE.equals(pair.getIsActive());
        int pointsEarned = correct ? mode.getPointsPerCorrect() : 0;

        SmatchAttemptJpaEntity attempt = SmatchAttemptJpaEntity.builder()
                .session(session)
                .pair(pair)
                .isCorrect(correct)
                .timeTakenMs(command.timeTakenMs())
                .pointsEarned(pointsEarned)
                .build();
        attemptRepository.save(attempt);

        session.setTotalScore(session.getTotalScore() + pointsEarned);
        if (correct) {
            session.setPairsMatched(session.getPairsMatched() + 1);
        } else {
            session.setWrongAttempts(session.getWrongAttempts() + 1);
            if (mode.hasLives() && session.getLivesRemaining() != null) {
                session.setLivesRemaining(Math.max(0, session.getLivesRemaining() - 1));
            }
        }

        int totalPairs = (int) pairRepository.countByDeckIdAndIsActiveTrue(session.getDeck().getId());
        boolean allMatched = session.getPairsMatched() >= totalPairs;
        boolean gameOver = mode.hasLives() && session.getLivesRemaining() != null
                && session.getLivesRemaining() <= 0;

        if (allMatched || gameOver) {
            session.complete();
        }

        session = sessionRepository.save(session);
        int livesLeft = session.getLivesRemaining() != null ? session.getLivesRemaining() : Integer.MAX_VALUE;

        return new AttemptResultView(correct, pointsEarned, livesLeft,
                session.getPairsMatched(), totalPairs, session.getTotalScore(),
                allMatched, gameOver);
    }

    // ─── Get session ──────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public SmatchSessionView getSession(Long sessionId) {
        SmatchSessionJpaEntity session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("SmatchSession", "id", sessionId));
        int totalPairs = (int) pairRepository.countByDeckIdAndIsActiveTrue(session.getDeck().getId());
        return toSessionView(session, session.getDeck(), totalPairs);
    }

    // ─── Get result ───────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public SmatchResultView getResult(Long sessionId) {
        SmatchSessionJpaEntity session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("SmatchSession", "id", sessionId));
        int totalPairs = (int) pairRepository.countByDeckIdAndIsActiveTrue(session.getDeck().getId());
        Long duration = session.getCompletedAt() != null
                ? Duration.between(session.getStartedAt(), session.getCompletedAt()).getSeconds()
                : null;
        return new SmatchResultView(
                session.getId(),
                session.getDeck().getName(),
                session.getGameMode().name(),
                session.getTotalScore(),
                session.getPairsMatched(),
                totalPairs,
                session.getWrongAttempts(),
                duration,
                session.isCompleted());
    }

    // ─── Abandon ──────────────────────────────────────────────────────────────

    @Override
    public void abandon(Long sessionId) {
        SmatchSessionJpaEntity session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("SmatchSession", "id", sessionId));
        if (!session.isCompleted()) {
            session.complete();
            sessionRepository.save(session);
        }
    }

    // ─── Get decks ────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<SmatchDeckView> getActiveDecks(Long categoryId) {
        List<SmatchDeckJpaEntity> decks = categoryId != null
                ? deckRepository.findByCategoryId(categoryId)
                : deckRepository.findByIsActiveTrue();
        return decks.stream()
                .filter(d -> Boolean.TRUE.equals(d.getIsActive()))
                .map(d -> new SmatchDeckView(
                        d.getId(), d.getName(), d.getDescription(), d.getDifficulty(),
                        d.getCategory() != null ? d.getCategory().getId() : null,
                        d.getCategory() != null ? d.getCategory().getName() : null,
                        (int) pairRepository.countByDeckIdAndIsActiveTrue(d.getId())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SmatchDeckDetailView getDeckById(Long deckId) {
        SmatchDeckJpaEntity deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException("SmatchDeck", "id", deckId));
        List<SmatchPairView> pairs = pairRepository.findByDeckIdAndIsActiveTrue(deck.getId()).stream()
                .map(p -> new SmatchPairView(p.getId(), p.getTerm(), p.getDefinition(), p.getHint()))
                .collect(Collectors.toList());
        return new SmatchDeckDetailView(
                deck.getId(), deck.getName(), deck.getDescription(), deck.getDifficulty(),
                deck.getCategory() != null ? deck.getCategory().getId() : null,
                deck.getCategory() != null ? deck.getCategory().getName() : null,
                pairs);
    }

    // ─── Session ownership ────────────────────────────────────────────────────

    public void validateOwnership(Long sessionId, Long userId) {
        SmatchSessionJpaEntity session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("SmatchSession", "id", sessionId));
        if (!session.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You do not own this session");
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private SmatchGameMode parseMode(String gameMode) {
        try { return SmatchGameMode.valueOf(gameMode.toUpperCase()); }
        catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid game mode: " + gameMode +
                    ". Valid values: TIME_ATTACK, ZEN, SURVIVAL");
        }
    }

    private SmatchSessionView toSessionView(SmatchSessionJpaEntity session, SmatchDeckJpaEntity deck, int totalPairs) {
        int livesLeft = session.getLivesRemaining() != null
                ? session.getLivesRemaining()
                : session.getGameMode().getMaxLives();
        return new SmatchSessionView(
                session.getId(),
                deck.getId(),
                deck.getName(),
                session.getGameMode().name(),
                livesLeft,
                session.getTotalScore(),
                session.getPairsMatched(),
                totalPairs,
                session.isCompleted());
    }
}
