package com.brandonkamga.teqizz.contribution.application.service;

import com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity.CategoryJpaEntity;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository.CategoryRepository;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository.TagRepository;
import com.brandonkamga.teqizz.contribution.application.port.in.*;
import com.brandonkamga.teqizz.contribution.application.port.in.GetAllContributionsUseCase.*;
import com.brandonkamga.teqizz.contribution.application.port.in.SubmitContributionUseCase.*;
import com.brandonkamga.teqizz.exception.BadRequestException;
import com.brandonkamga.teqizz.exception.ResourceNotFoundException;
import com.brandonkamga.teqizz.gaming.qcm.application.service.QcmDuplicateGuard;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.GameTypeName;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QuestionLevelType;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QuestionStatusType;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.Answer;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.Game;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.Question;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.QuestionLevel;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.QuestionStatus;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.AnswerRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.GameRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.QuestionLevelRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.QuestionRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.QuestionStatusRepository;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.UserJpaEntity;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ContributionApplicationService
        implements SubmitContributionUseCase, WithdrawContributionUseCase,
                   GetMyContributionsUseCase, ReviewContributionUseCase,
                   GetAllContributionsUseCase {

    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final GameRepository gameRepository;
    private final QuestionLevelRepository questionLevelRepository;
    private final QuestionStatusRepository questionStatusRepository;
    private final UserJpaRepository userRepository;
    private final QcmDuplicateGuard duplicateGuard;

    public ContributionApplicationService(
            QuestionRepository questionRepository,
            AnswerRepository answerRepository,
            CategoryRepository categoryRepository,
            TagRepository tagRepository,
            GameRepository gameRepository,
            QuestionLevelRepository questionLevelRepository,
            QuestionStatusRepository questionStatusRepository,
            UserJpaRepository userRepository,
            QcmDuplicateGuard duplicateGuard) {
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.gameRepository = gameRepository;
        this.questionLevelRepository = questionLevelRepository;
        this.questionStatusRepository = questionStatusRepository;
        this.userRepository = userRepository;
        this.duplicateGuard = duplicateGuard;
    }

    // ─── Submit ───────────────────────────────────────────────────────────────

    @Override
    public ContributionView submit(SubmitContributionCommand command) {
        boolean hasCorrect = command.answers().stream().anyMatch(AnswerCommand::isCorrect);
        if (!hasCorrect) throw new IllegalArgumentException("At least one answer must be correct");

        // Hard-block exact duplicates before doing any work.
        duplicateGuard.assertNoExactDuplicate(command.content());

        UserJpaEntity user = userRepository.findById(command.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", command.userId()));
        CategoryJpaEntity category = categoryRepository.findById(command.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", command.categoryId()));
        Game game = gameRepository.findByName(GameTypeName.QCM.name())
                .orElseThrow(() -> new ResourceNotFoundException("Game", "name", "QCM"));
        QuestionLevel level = questionLevelRepository.findByLevelName(QuestionLevelType.valueOf(command.level()))
                .orElseThrow(() -> new ResourceNotFoundException("QuestionLevel", "name", command.level()));
        QuestionStatus reviewStatus = questionStatusRepository.findByStatusName(QuestionStatusType.REVIEW)
                .orElseThrow(() -> new ResourceNotFoundException("QuestionStatus", "name", "REVIEW"));

        Question question = Question.builder()
                .content(command.content())
                .contentHash(duplicateGuard.hashFor(command.content()))
                .explanation(command.explanation())
                .hint(command.hint())
                .game(game).category(category).level(level).status(reviewStatus)
                .submittedBy(user)
                .build();
        question = questionRepository.save(question);

        for (AnswerCommand ac : command.answers()) {
            answerRepository.save(Answer.builder()
                    .question(question).content(ac.content())
                    .isCorrect(ac.isCorrect()).isActive(true).build());
        }

        if (command.tagIds() != null) {
            for (Long tagId : command.tagIds()) {
                tagRepository.findById(tagId).ifPresent(question.getTags()::add);
            }
            question = questionRepository.save(question);
        }

        return toSummaryView(question);
    }

    // ─── Similar questions (near-duplicate warning, non-blocking) ───────────────

    @Transactional(readOnly = true)
    public List<QcmDuplicateGuard.SimilarQuestion> findSimilarQuestions(String content) {
        return duplicateGuard.findSimilar(content, null);
    }

    // ─── Withdraw ─────────────────────────────────────────────────────────────

    @Override
    public void withdraw(Long questionId, Long userId) {
        Question q = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", questionId));
        if (q.getSubmittedBy() == null || !q.getSubmittedBy().getId().equals(userId)) {
            throw new AccessDeniedException("Not your submission");
        }
        if (q.getStatus().getStatusName() != QuestionStatusType.REVIEW) {
            throw new BadRequestException("Only pending submissions can be withdrawn");
        }
        questionRepository.delete(q);
    }

    // ─── Get my contributions ─────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<ContributionView> getMyContributions(Long userId) {
        return questionRepository.findBySubmittedById(userId).stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toSummaryView)
                .collect(Collectors.toList());
    }

    // ─── Review (admin) ───────────────────────────────────────────────────────

    @Override
    public void review(Long questionId, String decision) {
        Question q = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", questionId));
        if (q.getStatus().getStatusName() != QuestionStatusType.REVIEW) {
            throw new BadRequestException("Only REVIEW contributions can be reviewed");
        }
        QuestionStatusType next = switch (decision.toUpperCase()) {
            case "APPROVED" -> QuestionStatusType.ACTIVE;
            case "REJECTED" -> QuestionStatusType.ARCHIVED;
            default -> throw new IllegalArgumentException("Decision must be APPROVED or REJECTED");
        };
        QuestionStatus status = questionStatusRepository.findByStatusName(next)
                .orElseThrow(() -> new ResourceNotFoundException("QuestionStatus", "name", next));
        q.setStatus(status);
        questionRepository.save(q);
    }

    // ─── Get all contributions (admin) ────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<ContributionDetailView> getAllContributions() {
        return questionRepository.findPendingContributions().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toDetailView)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long countPendingContributions() {
        return questionRepository.countPendingContributions();
    }

    // ─── Mappers ──────────────────────────────────────────────────────────────

    private ContributionView toSummaryView(Question q) {
        return new ContributionView(
                q.getId(),
                q.getContent().length() > 100 ? q.getContent().substring(0, 100) + "..." : q.getContent(),
                q.getCategory() != null ? q.getCategory().getId() : null,
                q.getCategory() != null ? q.getCategory().getName() : null,
                q.getLevel().getLevelName().name(),
                q.getStatus().getStatusName().name(),
                q.getAnswers().size(),
                q.getSubmittedBy() != null ? q.getSubmittedBy().getUsername() : null,
                q.getCreatedAt() != null ? q.getCreatedAt().toString() : null);
    }

    private ContributionDetailView toDetailView(Question q) {
        List<AnswerView> answers = q.getAnswers().stream()
                .map(a -> new AnswerView(a.getId(), a.getContent(), a.getIsCorrect()))
                .collect(Collectors.toList());
        List<TagView> tags = q.getTags().stream()
                .map(t -> new TagView(t.getId(), t.getName()))
                .collect(Collectors.toList());
        return new ContributionDetailView(
                q.getId(), q.getContent(), q.getExplanation(), q.getHint(),
                q.getCategory() != null ? q.getCategory().getId() : null,
                q.getCategory() != null ? q.getCategory().getName() : null,
                q.getLevel().getLevelName().name(),
                q.getStatus().getStatusName().name(),
                q.getSubmittedBy() != null ? q.getSubmittedBy().getUsername() : null,
                q.getSubmittedBy() != null ? q.getSubmittedBy().getId() : null,
                q.getCreatedAt() != null ? q.getCreatedAt().toString() : null,
                answers, tags);
    }
}
