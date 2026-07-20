package com.brandonkamga.teqizz.admin.application.service;

import com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity.CategoryJpaEntity;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity.TagJpaEntity;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository.CategoryRepository;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository.TagRepository;
import com.brandonkamga.teqizz.dto.admin.AdminSmatchDeckRequest;
import com.brandonkamga.teqizz.dto.admin.AdminSmatchPairRequest;
import com.brandonkamga.teqizz.exception.BadRequestException;
import com.brandonkamga.teqizz.exception.ConflictException;
import com.brandonkamga.teqizz.exception.ResourceNotFoundException;
import com.brandonkamga.teqizz.shared.domain.ContentNormalizer;
import com.brandonkamga.teqizz.gaming.smatch.domain.model.vo.SmatchGameMode;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.entity.SmatchAttemptJpaEntity;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.entity.SmatchDeckJpaEntity;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.entity.SmatchPairJpaEntity;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.entity.SmatchSessionJpaEntity;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.repository.SmatchAttemptRepository;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.repository.SmatchDeckRepository;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.repository.SmatchPairRepository;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.repository.SmatchSessionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminSmatchApplicationService {

    // ─── View records ──────────────────────────────────────────────────────────

    public record TagRefView(Long id, String name) {}

    public record DeckSummaryView(Long id, String name, String description, String difficulty,
                                   Boolean isActive, Long categoryId, String categoryName,
                                   List<TagRefView> tags,
                                   long pairCount, long activePairCount,
                                   String createdAt, String updatedAt) {}

    public record PairView(Long id, Long deckId, String term, String definition,
                            String hint, Boolean isActive, String createdAt, String updatedAt) {}

    public record DeckDetailView(Long id, String name, String description, String difficulty,
                                  Boolean isActive, Long categoryId, String categoryName,
                                  List<TagRefView> tags,
                                  String createdAt, String updatedAt, List<PairView> pairs) {}

    public record DeckPage(List<DeckSummaryView> content, long totalElements,
                            int totalPages, int page, int size) {}

    public record AttemptView(Long id, Long pairId, String pairTerm,
                               Boolean isCorrect, Integer timeTakenMs,
                               int pointsEarned, String createdAt) {}

    public record SessionSummaryView(Long id, Long userId, String username,
                                      Long deckId, String deckName, String gameMode, String gameModeDisplay,
                                      int totalScore, int pairsMatched, int wrongAttempts,
                                      Integer livesRemaining, Integer timerDuration,
                                      boolean completed, String startedAt, String completedAt,
                                      long attemptCount) {}

    public record SessionDetailView(Long id, Long userId, String username,
                                     Long deckId, String deckName, String gameMode, String gameModeDisplay,
                                     int totalScore, int pairsMatched, int wrongAttempts,
                                     Integer livesRemaining, Integer timerDuration,
                                     boolean completed, String startedAt, String completedAt,
                                     List<AttemptView> attempts) {}

    public record SessionPage(List<SessionSummaryView> content, long totalElements,
                               int totalPages, int page, int size) {}

    public record ConfigView(String name, String displayName, int initialTimeSeconds,
                              int pointsPerCorrect, int timeBonusSeconds, int timePenaltySeconds,
                              int maxLives, boolean hasTimer, boolean hasLives) {}

    public record BulkResult(int created, Long deckId) {}

    // ─── Repositories ──────────────────────────────────────────────────────────

    private final SmatchDeckRepository smatchDeckRepository;
    private final SmatchPairRepository smatchPairRepository;
    private final SmatchSessionRepository smatchSessionRepository;
    private final SmatchAttemptRepository smatchAttemptRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;

    public AdminSmatchApplicationService(SmatchDeckRepository smatchDeckRepository,
                                          SmatchPairRepository smatchPairRepository,
                                          SmatchSessionRepository smatchSessionRepository,
                                          SmatchAttemptRepository smatchAttemptRepository,
                                          CategoryRepository categoryRepository,
                                          TagRepository tagRepository) {
        this.smatchDeckRepository = smatchDeckRepository;
        this.smatchPairRepository = smatchPairRepository;
        this.smatchSessionRepository = smatchSessionRepository;
        this.smatchAttemptRepository = smatchAttemptRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
    }

    // ─── Decks ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public DeckPage getDecks(Long categoryId, Boolean isActive, String difficulty, int page, int size) {
        Page<SmatchDeckJpaEntity> deckPage = smatchDeckRepository.findFiltered(
                categoryId, isActive,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<DeckSummaryView> content = deckPage.getContent().stream()
                .filter(d -> difficulty == null || difficulty.isEmpty() || d.getDifficulty().equals(difficulty))
                .map(this::toDeckSummary)
                .collect(Collectors.toList());
        return new DeckPage(content, deckPage.getTotalElements(), deckPage.getTotalPages(), page, size);
    }

    @Transactional(readOnly = true)
    public DeckDetailView getDeck(Long id) {
        SmatchDeckJpaEntity deck = smatchDeckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SmatchDeck", "id", id));
        List<PairView> pairs = smatchPairRepository.findByDeckId(id).stream()
                .map(p -> toPairView(p, id)).collect(Collectors.toList());
        return new DeckDetailView(
                deck.getId(), deck.getName(), deck.getDescription(), deck.getDifficulty(),
                deck.getIsActive(),
                deck.getCategory() != null ? deck.getCategory().getId() : null,
                deck.getCategory() != null ? deck.getCategory().getName() : null,
                toTagRefs(deck),
                ts(deck.getCreatedAt()), ts(deck.getUpdatedAt()), pairs);
    }

    public DeckSummaryView createDeck(AdminSmatchDeckRequest request) {
        if (smatchDeckRepository.findByName(request.getName()).isPresent()) {
            throw new BadRequestException("A deck with this name already exists");
        }
        CategoryJpaEntity category = resolveCategory(request.getCategoryId());
        SmatchDeckJpaEntity deck = SmatchDeckJpaEntity.builder()
                .name(request.getName()).description(request.getDescription())
                .category(category)
                .tags(resolveTags(request.getTagIds()))
                .difficulty(request.getDifficulty() != null ? request.getDifficulty().toUpperCase() : "EASY")
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        return toDeckSummary(smatchDeckRepository.save(deck));
    }

    public DeckSummaryView updateDeck(Long id, AdminSmatchDeckRequest request) {
        SmatchDeckJpaEntity deck = smatchDeckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SmatchDeck", "id", id));
        if (!deck.getName().equals(request.getName())
                && smatchDeckRepository.findByName(request.getName()).isPresent()) {
            throw new BadRequestException("A deck with this name already exists");
        }
        deck.setName(request.getName());
        deck.setDescription(request.getDescription());
        deck.setCategory(resolveCategory(request.getCategoryId()));
        if (request.getTagIds() != null) deck.setTags(resolveTags(request.getTagIds()));
        if (request.getDifficulty() != null) deck.setDifficulty(request.getDifficulty().toUpperCase());
        if (request.getIsActive() != null) deck.setIsActive(request.getIsActive());
        return toDeckSummary(smatchDeckRepository.save(deck));
    }

    public void updateDeckStatus(Long id, boolean isActive) {
        SmatchDeckJpaEntity deck = smatchDeckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SmatchDeck", "id", id));
        deck.setIsActive(isActive);
        smatchDeckRepository.save(deck);
    }

    public void deleteDeck(Long id) {
        SmatchDeckJpaEntity deck = smatchDeckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SmatchDeck", "id", id));
        long sessionCount = smatchSessionRepository.findByDeckId(id).size();
        if (sessionCount > 0) {
            throw new BadRequestException(
                    "Cannot delete deck with " + sessionCount + " existing session(s). Deactivate it instead.");
        }
        smatchPairRepository.deleteByDeckId(id);
        smatchDeckRepository.delete(deck);
    }

    // ─── Pairs ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PairView> getPairs(Long deckId, Boolean isActive) {
        smatchDeckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException("SmatchDeck", "id", deckId));
        List<SmatchPairJpaEntity> pairs = Boolean.TRUE.equals(isActive)
                ? smatchPairRepository.findByDeckIdAndIsActiveTrue(deckId)
                : smatchPairRepository.findByDeckId(deckId);
        return pairs.stream().map(p -> toPairView(p, deckId)).collect(Collectors.toList());
    }

    public PairView createPair(Long deckId, AdminSmatchPairRequest request) {
        SmatchDeckJpaEntity deck = smatchDeckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException("SmatchDeck", "id", deckId));
        String hash = pairHash(request.getTerm(), request.getDefinition());
        if (smatchPairRepository.existsByDeckIdAndContentHash(deckId, hash)) {
            throw new ConflictException("This pair already exists in the deck");
        }
        SmatchPairJpaEntity pair = SmatchPairJpaEntity.builder()
                .deck(deck).term(request.getTerm()).definition(request.getDefinition())
                .hint(request.getHint()).contentHash(hash)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        return toPairView(smatchPairRepository.save(pair), deckId);
    }

    public BulkResult replacePairs(Long deckId, List<AdminSmatchPairRequest> requests) {
        SmatchDeckJpaEntity deck = smatchDeckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException("SmatchDeck", "id", deckId));
        smatchPairRepository.deleteByDeckId(deckId);
        if (requests == null || requests.isEmpty()) return new BulkResult(0, deckId);
        // Deck was just cleared, so only intra-batch duplicates can occur.
        List<SmatchPairJpaEntity> saved = smatchPairRepository.saveAll(
                buildDedupedPairs(deck, requests, false));
        return new BulkResult(saved.size(), deckId);
    }

    public BulkResult createPairsBulk(Long deckId, List<AdminSmatchPairRequest> requests) {
        if (requests == null || requests.isEmpty()) throw new BadRequestException("No pairs provided");
        SmatchDeckJpaEntity deck = smatchDeckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException("SmatchDeck", "id", deckId));
        // Skip pairs already present in the deck as well as duplicates inside the batch.
        List<SmatchPairJpaEntity> saved = smatchPairRepository.saveAll(
                buildDedupedPairs(deck, requests, true));
        return new BulkResult(saved.size(), deckId);
    }

    /** Build pair entities with content hashes, dropping intra-batch and (optionally) existing duplicates. */
    private List<SmatchPairJpaEntity> buildDedupedPairs(SmatchDeckJpaEntity deck,
                                                        List<AdminSmatchPairRequest> requests,
                                                        boolean skipExistingInDeck) {
        Set<String> seen = new LinkedHashSet<>();
        List<SmatchPairJpaEntity> pairs = new java.util.ArrayList<>();
        for (AdminSmatchPairRequest req : requests) {
            String hash = pairHash(req.getTerm(), req.getDefinition());
            if (!seen.add(hash)) continue; // duplicate within this batch
            if (skipExistingInDeck && smatchPairRepository.existsByDeckIdAndContentHash(deck.getId(), hash)) continue;
            pairs.add(SmatchPairJpaEntity.builder()
                    .deck(deck).term(req.getTerm()).definition(req.getDefinition())
                    .hint(req.getHint()).contentHash(hash)
                    .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                    .build());
        }
        return pairs;
    }

    public PairView updatePair(Long id, AdminSmatchPairRequest request) {
        SmatchPairJpaEntity pair = smatchPairRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SmatchPair", "id", id));
        Long deckId = pair.getDeck() != null ? pair.getDeck().getId() : null;
        String newHash = pairHash(request.getTerm(), request.getDefinition());
        if (!newHash.equals(pair.getContentHash())
                && deckId != null && smatchPairRepository.existsByDeckIdAndContentHash(deckId, newHash)) {
            throw new ConflictException("Another pair with the same term and definition already exists in this deck");
        }
        pair.setTerm(request.getTerm());
        pair.setDefinition(request.getDefinition());
        pair.setHint(request.getHint());
        pair.setContentHash(newHash);
        if (request.getIsActive() != null) pair.setIsActive(request.getIsActive());
        SmatchPairJpaEntity saved = smatchPairRepository.save(pair);
        return toPairView(saved, deckId);
    }

    /** Canonical content hash for a Smatch pair — normalised term + definition. */
    private String pairHash(String term, String definition) {
        return ContentNormalizer.hash(term, definition);
    }

    public void deletePair(Long id) {
        SmatchPairJpaEntity pair = smatchPairRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SmatchPair", "id", id));
        // A pair may have been played (attempts reference it) — remove those first to avoid an FK error.
        smatchAttemptRepository.deleteByPairId(id);
        smatchPairRepository.delete(pair);
    }

    // ─── Sessions ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public SessionPage getSessions(Long deckId, String gameMode, Boolean completed, int page, int size) {
        Page<SmatchSessionJpaEntity> sessionPage = smatchSessionRepository.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startedAt")));
        List<SessionSummaryView> content = sessionPage.getContent().stream()
                .filter(s -> deckId == null || (s.getDeck() != null && s.getDeck().getId().equals(deckId)))
                .filter(s -> gameMode == null || gameMode.isEmpty() || s.getGameMode().name().equals(gameMode))
                .filter(s -> completed == null || s.isCompleted() == completed)
                .map(s -> new SessionSummaryView(
                        s.getId(), s.getUser().getId(), s.getUser().getUsername(),
                        s.getDeck() != null ? s.getDeck().getId() : null,
                        s.getDeck() != null ? s.getDeck().getName() : null,
                        s.getGameMode().name(), s.getGameMode().getDisplayName(),
                        s.getTotalScore(), s.getPairsMatched(), s.getWrongAttempts(),
                        s.getLivesRemaining(), s.getTimerDuration(), s.isCompleted(),
                        ts(s.getStartedAt()), ts(s.getCompletedAt()),
                        smatchAttemptRepository.countBySessionId(s.getId())))
                .collect(Collectors.toList());
        return new SessionPage(content, sessionPage.getTotalElements(), sessionPage.getTotalPages(), page, size);
    }

    @Transactional(readOnly = true)
    public SessionDetailView getSession(Long id) {
        SmatchSessionJpaEntity s = smatchSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SmatchSession", "id", id));
        List<AttemptView> attempts = smatchAttemptRepository.findBySessionId(id).stream()
                .map(a -> new AttemptView(a.getId(),
                        a.getPair() != null ? a.getPair().getId() : null,
                        a.getPair() != null ? a.getPair().getTerm() : null,
                        a.getIsCorrect(), a.getTimeTakenMs(), a.getPointsEarned(),
                        ts(a.getCreatedAt())))
                .collect(Collectors.toList());
        return new SessionDetailView(
                s.getId(), s.getUser().getId(), s.getUser().getUsername(),
                s.getDeck() != null ? s.getDeck().getId() : null,
                s.getDeck() != null ? s.getDeck().getName() : null,
                s.getGameMode().name(), s.getGameMode().getDisplayName(),
                s.getTotalScore(), s.getPairsMatched(), s.getWrongAttempts(),
                s.getLivesRemaining(), s.getTimerDuration(), s.isCompleted(),
                ts(s.getStartedAt()), ts(s.getCompletedAt()), attempts);
    }

    public void deleteSession(Long id) {
        SmatchSessionJpaEntity session = smatchSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SmatchSession", "id", id));
        smatchAttemptRepository.deleteBySessionId(id);
        smatchSessionRepository.delete(session);
    }

    // ─── Config ───────────────────────────────────────────────────────────────

    public List<ConfigView> getConfig() {
        return Arrays.stream(SmatchGameMode.values())
                .map(m -> new ConfigView(
                        m.name(), m.getDisplayName(), m.getInitialTimeSeconds(),
                        m.getPointsPerCorrect(), m.getTimeBonusSeconds(), m.getTimePenaltySeconds(),
                        m.getMaxLives(), m.getInitialTimeSeconds() > 0, m.getMaxLives() > 0))
                .collect(Collectors.toList());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private CategoryJpaEntity resolveCategory(Long categoryId) {
        if (categoryId == null) return null;
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
    }

    private DeckSummaryView toDeckSummary(SmatchDeckJpaEntity d) {
        return new DeckSummaryView(
                d.getId(), d.getName(), d.getDescription(), d.getDifficulty(), d.getIsActive(),
                d.getCategory() != null ? d.getCategory().getId() : null,
                d.getCategory() != null ? d.getCategory().getName() : null,
                toTagRefs(d),
                smatchPairRepository.countByDeckId(d.getId()),
                smatchPairRepository.countByDeckIdAndIsActiveTrue(d.getId()),
                ts(d.getCreatedAt()), ts(d.getUpdatedAt()));
    }

    /** Resolve tag ids into managed entities, ignoring nulls/unknown ids. Order-preserving, de-duplicated. */
    private Set<TagJpaEntity> resolveTags(List<Long> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) return new LinkedHashSet<>();
        Set<TagJpaEntity> resolved = new LinkedHashSet<>();
        for (Long tagId : tagIds) {
            if (tagId != null) tagRepository.findById(tagId).ifPresent(resolved::add);
        }
        return resolved;
    }

    private List<TagRefView> toTagRefs(SmatchDeckJpaEntity d) {
        if (d.getTags() == null) return List.of();
        return d.getTags().stream()
                .map(t -> new TagRefView(t.getId(), t.getName()))
                .sorted(Comparator.comparing(TagRefView::name, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
    }

    private PairView toPairView(SmatchPairJpaEntity p, Long deckId) {
        return new PairView(p.getId(), deckId, p.getTerm(), p.getDefinition(),
                p.getHint(), p.getIsActive(), ts(p.getCreatedAt()), ts(p.getUpdatedAt()));
    }

    private String ts(Object t) {
        return t != null ? t.toString() : null;
    }
}
