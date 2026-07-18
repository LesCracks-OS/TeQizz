package com.brandonkamga.teqizz.contribution.application.service;

import com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity.CategoryJpaEntity;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository.CategoryRepository;
import com.brandonkamga.teqizz.contribution.domain.model.vo.ContributionStatus;
import com.brandonkamga.teqizz.contribution.infrastructure.persistence.SmatchContributionJpaEntity;
import com.brandonkamga.teqizz.contribution.infrastructure.persistence.SmatchContributionPairJpaEntity;
import com.brandonkamga.teqizz.contribution.infrastructure.persistence.SmatchContributionRepository;
import com.brandonkamga.teqizz.dto.contribution.SmatchContributionRequest;
import com.brandonkamga.teqizz.exception.BadRequestException;
import com.brandonkamga.teqizz.exception.ResourceNotFoundException;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.entity.SmatchDeckJpaEntity;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.entity.SmatchPairJpaEntity;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.repository.SmatchDeckRepository;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.repository.SmatchPairRepository;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.UserJpaEntity;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.repository.UserJpaRepository;
import com.brandonkamga.teqizz.shared.domain.ContentNormalizer;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Smatch contribution workflow — DISTINCT from the QCM one. Users propose a deck (name, category,
 * pairs); admins approve (which materialises a real active {@code smatch_decks} deck) or reject with
 * a reason. State machine: REVIEW -> APPROVED | REJECTED.
 */
@Service
@Transactional
public class SmatchContributionApplicationService {

    private final SmatchContributionRepository contributionRepository;
    private final SmatchDeckRepository deckRepository;
    private final SmatchPairRepository pairRepository;
    private final CategoryRepository categoryRepository;
    private final UserJpaRepository userRepository;

    public SmatchContributionApplicationService(SmatchContributionRepository contributionRepository,
                                                SmatchDeckRepository deckRepository,
                                                SmatchPairRepository pairRepository,
                                                CategoryRepository categoryRepository,
                                                UserJpaRepository userRepository) {
        this.contributionRepository = contributionRepository;
        this.deckRepository = deckRepository;
        this.pairRepository = pairRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    // ─── Views ──────────────────────────────────────────────────────────────────

    public record PairView(String term, String definition, String hint) {}

    public record ContributionView(Long id, String name, String difficulty, String status,
                                    Long categoryId, int pairCount, String rejectReason,
                                    Long approvedDeckId, String createdAt) {}

    public record ContributionDetailView(Long id, String name, String description, String difficulty,
                                         String status, Long categoryId, String rejectReason,
                                         Long approvedDeckId, String submittedBy, Long submittedById,
                                         String createdAt, List<PairView> pairs) {}

    // ─── Submit (user) ────────────────────────────────────────────────────────

    public ContributionView submit(Long userId, SmatchContributionRequest request) {
        UserJpaEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        SmatchContributionJpaEntity contribution = SmatchContributionJpaEntity.builder()
                .submittedBy(user)
                .name(request.getName())
                .description(request.getDescription())
                .categoryId(request.getCategoryId())
                .difficulty(request.getDifficulty() != null ? request.getDifficulty().toUpperCase() : "EASY")
                .status(ContributionStatus.REVIEW)
                .build();

        for (SmatchContributionRequest.PairRequest p : request.getPairs()) {
            contribution.addPair(SmatchContributionPairJpaEntity.builder()
                    .term(p.getTerm()).definition(p.getDefinition()).hint(p.getHint()).build());
        }

        return toSummary(contributionRepository.save(contribution));
    }

    // ─── Withdraw (user) ──────────────────────────────────────────────────────

    public void withdraw(Long id, Long userId) {
        SmatchContributionJpaEntity c = getOwned(id, userId);
        if (c.getStatus() != ContributionStatus.REVIEW) {
            throw new BadRequestException("Only pending submissions can be withdrawn");
        }
        contributionRepository.delete(c);
    }

    @Transactional(readOnly = true)
    public List<ContributionView> getMine(Long userId) {
        return contributionRepository.findBySubmittedByIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toSummary).toList();
    }

    // ─── Review (admin) ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ContributionDetailView> getPending() {
        return contributionRepository.findByStatusOrderByCreatedAtDesc(ContributionStatus.REVIEW).stream()
                .map(this::toDetail).toList();
    }

    @Transactional(readOnly = true)
    public long countPending() {
        return contributionRepository.countByStatus(ContributionStatus.REVIEW);
    }

    /** Approve: materialise a real active deck from the proposal (pairs de-duplicated). */
    public Long approve(Long id, Long reviewerId) {
        SmatchContributionJpaEntity c = getForReview(id);

        String deckName = c.getName();
        if (deckRepository.findByName(deckName).isPresent()) {
            deckName = deckName + " (contrib #" + c.getId() + ")";
        }
        CategoryJpaEntity category = c.getCategoryId() != null
                ? categoryRepository.findById(c.getCategoryId()).orElse(null)
                : null;

        SmatchDeckJpaEntity deck = deckRepository.save(SmatchDeckJpaEntity.builder()
                .name(deckName).description(c.getDescription())
                .category(category).difficulty(c.getDifficulty())
                .isActive(true).build());

        Set<String> seen = new LinkedHashSet<>();
        List<SmatchPairJpaEntity> pairs = new ArrayList<>();
        for (SmatchContributionPairJpaEntity p : c.getPairs()) {
            String hash = ContentNormalizer.hash(p.getTerm(), p.getDefinition());
            if (!seen.add(hash)) continue; // drop duplicate pairs inside the proposal
            pairs.add(SmatchPairJpaEntity.builder()
                    .deck(deck).term(p.getTerm()).definition(p.getDefinition())
                    .hint(p.getHint()).contentHash(hash).isActive(true).build());
        }
        pairRepository.saveAll(pairs);

        c.setStatus(ContributionStatus.APPROVED);
        c.setReviewerId(reviewerId);
        c.setApprovedDeckId(deck.getId());
        c.setReviewedAt(LocalDateTime.now());
        contributionRepository.save(c);
        return deck.getId();
    }

    public void reject(Long id, Long reviewerId, String reason) {
        SmatchContributionJpaEntity c = getForReview(id);
        c.setStatus(ContributionStatus.REJECTED);
        c.setReviewerId(reviewerId);
        c.setRejectReason(reason);
        c.setReviewedAt(LocalDateTime.now());
        contributionRepository.save(c);
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private SmatchContributionJpaEntity getForReview(Long id) {
        SmatchContributionJpaEntity c = contributionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SmatchContribution", "id", id));
        if (c.getStatus() != ContributionStatus.REVIEW) {
            throw new BadRequestException("Only REVIEW contributions can be reviewed");
        }
        return c;
    }

    private SmatchContributionJpaEntity getOwned(Long id, Long userId) {
        SmatchContributionJpaEntity c = contributionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SmatchContribution", "id", id));
        if (c.getSubmittedBy() == null || !c.getSubmittedBy().getId().equals(userId)) {
            throw new AccessDeniedException("Not your submission");
        }
        return c;
    }

    private ContributionView toSummary(SmatchContributionJpaEntity c) {
        return new ContributionView(
                c.getId(), c.getName(), c.getDifficulty(), c.getStatus().name(),
                c.getCategoryId(), c.getPairs() != null ? c.getPairs().size() : 0,
                c.getRejectReason(), c.getApprovedDeckId(),
                c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
    }

    private ContributionDetailView toDetail(SmatchContributionJpaEntity c) {
        List<PairView> pairs = c.getPairs().stream()
                .map(p -> new PairView(p.getTerm(), p.getDefinition(), p.getHint())).toList();
        return new ContributionDetailView(
                c.getId(), c.getName(), c.getDescription(), c.getDifficulty(),
                c.getStatus().name(), c.getCategoryId(), c.getRejectReason(), c.getApprovedDeckId(),
                c.getSubmittedBy() != null ? c.getSubmittedBy().getUsername() : null,
                c.getSubmittedBy() != null ? c.getSubmittedBy().getId() : null,
                c.getCreatedAt() != null ? c.getCreatedAt().toString() : null, pairs);
    }
}
