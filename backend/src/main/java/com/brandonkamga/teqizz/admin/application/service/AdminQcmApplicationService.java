package com.brandonkamga.teqizz.admin.application.service;

import com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity.CategoryJpaEntity;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity.TagJpaEntity;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository.CategoryRepository;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository.TagRepository;
import com.brandonkamga.teqizz.dto.admin.AdminCategoryRequest;
import com.brandonkamga.teqizz.dto.admin.AdminQuestionRequest;
import com.brandonkamga.teqizz.dto.admin.AdminTagRequest;
import com.brandonkamga.teqizz.exception.BadRequestException;
import com.brandonkamga.teqizz.exception.ConflictException;
import com.brandonkamga.teqizz.exception.ResourceNotFoundException;
import com.brandonkamga.teqizz.gaming.qcm.application.service.QcmDuplicateGuard;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.GameMode;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QuestionLevelType;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QuestionStatusType;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.Answer;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.Game;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.GameSession;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.Question;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.QuestionLevel;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.QuestionStatus;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.AnswerRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.GameRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.GameSessionRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.UserAnswerRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.QuestionLevelRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.QuestionRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.QuestionStatusRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminQcmApplicationService {

    // ─── View records ──────────────────────────────────────────────────────────

    public record CategoryView(Long id, String name, String slug, String description,
                                Integer displayOrder, Boolean isActive, long questionsCount) {}

    public record TagView(Long id, String name, String slug, String description,
                           Boolean isActive, Long categoryId, String categoryName, long questionCount) {}

    public record AnswerView(Long id, String content, Boolean isCorrect, Boolean isActive) {}

    public record TagRefView(Long id, String name) {}

    public record QuestionSummaryView(Long id, String content, Long categoryId, String categoryName,
                                       String level, String status,
                                       int answersCount, int tagsCount, String createdAt) {}

    public record QuestionDetailView(Long id, String content, String explanation, String hint,
                                      Long categoryId, String categoryName,
                                      String level, String status, String createdAt,
                                      List<AnswerView> answers, List<TagRefView> tags) {}

    public record QcmSessionView(Long id, String username, String categoryName, String gameMode,
                                  int totalScore, int questionsAnswered, int livesRemaining,
                                  String startedAt, String completedAt, String status) {}

    public record ConfigView(String name, String displayName, int initialTimeSeconds,
                              int maxTimeSeconds, int timePenalty,
                              int pointsEasy, int pointsMedium, int pointsHard, int pointsExpert) {}

    public record BulkImportResult(int imported, List<String> errors) {}

    public record DuplicateItemView(Long id, String content, String status,
                                     String submittedBy, String createdAt) {}

    public record DuplicateGroupView(String hash, List<DuplicateItemView> questions) {}

    // ─── Repositories ──────────────────────────────────────────────────────────

    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final GameSessionRepository gameSessionRepository;
    private final GameRepository gameRepository;
    private final QuestionLevelRepository questionLevelRepository;
    private final QuestionStatusRepository questionStatusRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final QcmDuplicateGuard duplicateGuard;

    public AdminQcmApplicationService(CategoryRepository categoryRepository,
                                       TagRepository tagRepository,
                                       QuestionRepository questionRepository,
                                       AnswerRepository answerRepository,
                                       GameSessionRepository gameSessionRepository,
                                       GameRepository gameRepository,
                                       QuestionLevelRepository questionLevelRepository,
                                       QuestionStatusRepository questionStatusRepository,
                                       UserAnswerRepository userAnswerRepository,
                                       QcmDuplicateGuard duplicateGuard) {
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.gameSessionRepository = gameSessionRepository;
        this.gameRepository = gameRepository;
        this.questionLevelRepository = questionLevelRepository;
        this.questionStatusRepository = questionStatusRepository;
        this.userAnswerRepository = userAnswerRepository;
        this.duplicateGuard = duplicateGuard;
    }

    // ─── Categories ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CategoryView> getCategories() {
        return categoryRepository.findAll().stream()
                .sorted(Comparator.comparingInt(CategoryJpaEntity::getDisplayOrder))
                .map(c -> new CategoryView(c.getId(), c.getName(), c.getSlug(), c.getDescription(),
                        c.getDisplayOrder(), c.getIsActive(), questionRepository.countByCategoryId(c.getId())))
                .collect(Collectors.toList());
    }

    public CategoryView createCategory(AdminCategoryRequest request) {
        String slug = request.getSlug() != null && !request.getSlug().isBlank()
                ? request.getSlug() : toSlug(request.getName());
        CategoryJpaEntity category = categoryRepository.save(CategoryJpaEntity.builder()
                .name(request.getName()).slug(slug).description(request.getDescription())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build());
        return toCategoryView(category);
    }

    public CategoryView updateCategory(Long id, AdminCategoryRequest request) {
        CategoryJpaEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        if (request.getName() != null) category.setName(request.getName());
        if (request.getSlug() != null) category.setSlug(request.getSlug());
        if (request.getDescription() != null) category.setDescription(request.getDescription());
        if (request.getDisplayOrder() != null) category.setDisplayOrder(request.getDisplayOrder());
        if (request.getIsActive() != null) category.setIsActive(request.getIsActive());
        return toCategoryView(categoryRepository.save(category));
    }

    public String deleteCategory(Long id) {
        CategoryJpaEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        long questionCount = questionRepository.countByCategoryId(id);
        long tagCount = tagRepository.findByCategoryId(id).size();
        // A category is also referenced by tags (and Smatch decks). If it's used anywhere,
        // deactivate it instead of hard-deleting to avoid a foreign-key error.
        if (questionCount > 0 || tagCount > 0) {
            category.setIsActive(false);
            categoryRepository.save(category);
            return "Category deactivated (still in use: " + questionCount + " question(s), " + tagCount + " tag(s))";
        }
        categoryRepository.delete(category);
        return "Category deleted";
    }

    // ─── Tags ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TagView> getTags(Long categoryId) {
        List<TagJpaEntity> tags = categoryId != null
                ? tagRepository.findByCategoryId(categoryId)
                : tagRepository.findAll();
        return tags.stream().map(this::toTagView).collect(Collectors.toList());
    }

    public TagView createTag(AdminTagRequest request) {
        TagJpaEntity tag = TagJpaEntity.builder()
                .name(request.getName())
                .slug(request.getSlug() != null ? request.getSlug() : toSlug(request.getName()))
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        if (request.getCategoryId() != null) {
            tag.setCategory(categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId())));
        }
        return toTagView(tagRepository.save(tag));
    }

    public TagView updateTag(Long id, AdminTagRequest request) {
        TagJpaEntity tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag", "id", id));
        if (request.getName() != null) tag.setName(request.getName());
        if (request.getSlug() != null) tag.setSlug(request.getSlug());
        if (request.getDescription() != null) tag.setDescription(request.getDescription());
        if (request.getIsActive() != null) tag.setIsActive(request.getIsActive());
        if (request.getCategoryId() != null) {
            tag.setCategory(categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId())));
        }
        return toTagView(tagRepository.save(tag));
    }

    public void deleteTag(Long id) {
        TagJpaEntity tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag", "id", id));
        tag.setIsActive(false);
        tagRepository.save(tag);
    }

    // ─── Questions ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<QuestionSummaryView> getQuestions(Long categoryId, String level, String status) {
        return questionRepository.findAll().stream()
                .filter(q -> categoryId == null || (q.getCategory() != null && q.getCategory().getId().equals(categoryId)))
                .filter(q -> level == null || q.getLevel().getLevelName().name().equals(level))
                .filter(q -> status == null || q.getStatus().getStatusName().name().equals(status))
                .map(q -> new QuestionSummaryView(q.getId(),
                        q.getContent().length() > 120 ? q.getContent().substring(0, 120) + "..." : q.getContent(),
                        q.getCategory() != null ? q.getCategory().getId() : null,
                        q.getCategory() != null ? q.getCategory().getName() : null,
                        q.getLevel().getLevelName().name(), q.getStatus().getStatusName().name(),
                        q.getAnswers().size(), q.getTags().size(),
                        q.getCreatedAt() != null ? q.getCreatedAt().toString() : null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuestionDetailView getQuestion(Long id) {
        return toDetailView(questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", id)));
    }

    public QuestionDetailView createQuestion(AdminQuestionRequest request) {
        boolean hasCorrect = request.getAnswers().stream().anyMatch(AdminQuestionRequest.AnswerRequest::getIsCorrect);
        if (!hasCorrect) throw new BadRequestException("At least one answer must be marked as correct");

        duplicateGuard.assertNoExactDuplicate(request.getContent());

        CategoryJpaEntity category = resolveCategory(request);
        Game game = gameRepository.findByName("QCM")
                .orElseThrow(() -> new ResourceNotFoundException("Game", "name", "QCM"));
        QuestionLevel level = questionLevelRepository.findByLevelName(QuestionLevelType.valueOf(request.getLevel()))
                .orElseThrow(() -> new ResourceNotFoundException("QuestionLevel", "name", request.getLevel()));
        QuestionStatus status = questionStatusRepository.findByStatusName(
                QuestionStatusType.valueOf(request.getStatus() != null ? request.getStatus() : "ACTIVE"))
                .orElseThrow(() -> new ResourceNotFoundException("QuestionStatus", "name", request.getStatus()));

        Question question = questionRepository.save(Question.builder()
                .content(request.getContent()).contentHash(duplicateGuard.hashFor(request.getContent()))
                .explanation(request.getExplanation()).hint(request.getHint())
                .game(game).category(category).level(level).status(status).build());

        for (AdminQuestionRequest.AnswerRequest ar : request.getAnswers()) {
            answerRepository.save(Answer.builder().question(question)
                    .content(ar.getContent()).isCorrect(ar.getIsCorrect()).isActive(true).build());
        }

        resolveAndApplyTags(request, question);
        return toDetailView(questionRepository.findById(question.getId()).get());
    }

    public QuestionDetailView updateQuestion(Long id, AdminQuestionRequest request) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", id));
        if (request.getContent() != null) {
            String newHash = duplicateGuard.hashFor(request.getContent());
            if (!newHash.equals(question.getContentHash())) {
                questionRepository.findFirstByContentHash(newHash)
                        .filter(other -> !other.getId().equals(id))
                        .ifPresent(other -> { throw new ConflictException(
                                "Another question already has this content (#" + other.getId() + ")", other.getId()); });
            }
            question.setContent(request.getContent());
            question.setContentHash(newHash);
        }
        if (request.getExplanation() != null) question.setExplanation(request.getExplanation());
        if (request.getHint() != null) question.setHint(request.getHint());
        if (request.getCategoryId() != null) {
            question.setCategory(categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId())));
        }
        if (request.getLevel() != null) {
            question.setLevel(questionLevelRepository.findByLevelName(QuestionLevelType.valueOf(request.getLevel()))
                    .orElseThrow(() -> new ResourceNotFoundException("QuestionLevel", "name", request.getLevel())));
        }
        if (request.getStatus() != null) {
            question.setStatus(questionStatusRepository.findByStatusName(QuestionStatusType.valueOf(request.getStatus()))
                    .orElseThrow(() -> new ResourceNotFoundException("QuestionStatus", "name", request.getStatus())));
        }
        if (request.getAnswers() != null && !request.getAnswers().isEmpty()) {
            answerRepository.deleteAll(question.getAnswers());
            question.getAnswers().clear();
            for (AdminQuestionRequest.AnswerRequest ar : request.getAnswers()) {
                answerRepository.save(Answer.builder().question(question)
                        .content(ar.getContent()).isCorrect(ar.getIsCorrect()).isActive(true).build());
            }
        }
        if (request.getTagIds() != null || request.getTags() != null) {
            question.getTags().clear();
            resolveAndApplyTags(request, question);
        }
        return toDetailView(questionRepository.save(question));
    }

    // ─── Dedup queue (exact duplicates that predate the anti-redundancy guard) ──

    @Transactional(readOnly = true)
    public List<DuplicateGroupView> getDuplicateGroups() {
        return questionRepository.findDuplicateContentHashes().stream()
                .map(hash -> new DuplicateGroupView(hash,
                        questionRepository.findByContentHash(hash).stream()
                                .sorted(Comparator.comparing(Question::getId))
                                .map(q -> new DuplicateItemView(
                                        q.getId(),
                                        q.getContent(),
                                        q.getStatus() != null ? q.getStatus().getStatusName().name() : null,
                                        q.getSubmittedBy() != null ? q.getSubmittedBy().getUsername() : null,
                                        q.getCreatedAt() != null ? q.getCreatedAt().toString() : null))
                                .collect(Collectors.toList())))
                .collect(Collectors.toList());
    }

    // ─── Category / Tag helpers ────────────────────────────────────────────────

    private CategoryJpaEntity resolveCategory(AdminQuestionRequest request) {
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            return categoryRepository.findByName(request.getCategory().trim())
                    .orElseThrow(() -> new BadRequestException(
                            "Category not found: \"" + request.getCategory() + "\". Use an existing platform category."));
        }
        if (request.getCategoryId() != null) {
            return categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        }
        throw new BadRequestException("Category is required (use 'category' name or 'categoryId')");
    }

    private void resolveAndApplyTags(AdminQuestionRequest request, Question question) {
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            for (String rawName : request.getTags()) {
                String name = rawName.trim().toLowerCase();
                if (name.isEmpty()) continue;
                TagJpaEntity tag = tagRepository.findByName(name)
                        .orElseGet(() -> tagRepository.save(TagJpaEntity.builder()
                                .name(name)
                                .slug(toSlug(name))
                                .isActive(true)
                                .build()));
                question.getTags().add(tag);
            }
            questionRepository.save(question);
        } else if (request.getTagIds() != null) {
            for (Long tagId : request.getTagIds()) {
                tagRepository.findById(tagId).ifPresent(question.getTags()::add);
            }
            questionRepository.save(question);
        }
    }

    private String toSlug(String name) {
        String base = name.replaceAll("\\s+", "-").replaceAll("[^a-z0-9-]", "");
        if (!tagRepository.existsBySlug(base)) return base;
        int i = 2;
        while (tagRepository.existsBySlug(base + "-" + i)) i++;
        return base + "-" + i;
    }

    public void deleteQuestion(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", id));
        // Players may have answered this question — remove those records first (they reference
        // the question and its answers via NOT NULL foreign keys), otherwise the delete fails.
        userAnswerRepository.deleteByQuestionId(id);
        questionRepository.delete(question);
    }

    public String updateQuestionStatus(Long id, String requestedStatus) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", id));
        QuestionStatusType next;
        if (requestedStatus != null && !requestedStatus.isBlank()) {
            next = QuestionStatusType.valueOf(requestedStatus.toUpperCase());
        } else {
            QuestionStatusType current = question.getStatus().getStatusName();
            next = current == QuestionStatusType.ACTIVE ? QuestionStatusType.ARCHIVED : QuestionStatusType.ACTIVE;
        }
        question.setStatus(questionStatusRepository.findByStatusName(next)
                .orElseThrow(() -> new ResourceNotFoundException("QuestionStatus", "name", next)));
        questionRepository.save(question);
        return next.name();
    }

    public BulkImportResult importQuestions(List<AdminQuestionRequest> requests) {
        int created = 0;
        List<String> errors = new ArrayList<>();
        for (int i = 0; i < requests.size(); i++) {
            try {
                createQuestion(requests.get(i));
                created++;
            } catch (Exception e) {
                errors.add("Row " + (i + 1) + ": " + e.getMessage());
            }
        }
        return new BulkImportResult(created, errors);
    }

    // ─── Sessions ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<QcmSessionView> getSessions(int page, int size) {
        return gameSessionRepository.findAll().stream()
                .sorted(Comparator.comparing(GameSession::getStartedAt).reversed())
                .skip((long) page * size).limit(size)
                .map(s -> new QcmSessionView(
                        s.getId(), s.getUser().getUsername(),
                        s.getCategory() != null ? s.getCategory().getName() : "N/A",
                        s.getGameMode() != null ? s.getGameMode().name() : "CLASSIC",
                        s.getTotalScore(), s.getTotalQuestions(), s.getLivesRemaining(),
                        s.getStartedAt() != null ? s.getStartedAt().toString() : null,
                        s.getCompletedAt() != null ? s.getCompletedAt().toString() : null,
                        s.getCompletedAt() != null ? "COMPLETED" : "IN_PROGRESS"))
                .collect(Collectors.toList());
    }

    public void forceCompleteSession(Long id) {
        GameSession session = gameSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GameSession", "id", id));
        if (session.getCompletedAt() == null) {
            session.complete();
            gameSessionRepository.save(session);
        }
    }

    public void deleteSession(Long id) {
        GameSession session = gameSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GameSession", "id", id));
        // Remove the session's recorded answers first (FK on game_session_id).
        userAnswerRepository.deleteByGameSessionId(id);
        gameSessionRepository.delete(session);
    }

    // ─── Config ───────────────────────────────────────────────────────────────

    public List<ConfigView> getGameModeConfig() {
        return Arrays.stream(GameMode.values())
                .map(m -> new ConfigView(m.name(), m.getDisplayName(),
                        m.getInitialTimeSeconds(), m.getMaxTimeSeconds(), m.getTimePenalty(),
                        m.getPointsForDifficulty(QuestionLevelType.EASY),
                        m.getPointsForDifficulty(QuestionLevelType.MEDIUM),
                        m.getPointsForDifficulty(QuestionLevelType.HARD),
                        m.getPointsForDifficulty(QuestionLevelType.EXPERT)))
                .collect(Collectors.toList());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private CategoryView toCategoryView(CategoryJpaEntity c) {
        return new CategoryView(c.getId(), c.getName(), c.getSlug(), c.getDescription(),
                c.getDisplayOrder(), c.getIsActive(), questionRepository.countByCategoryId(c.getId()));
    }

    private TagView toTagView(TagJpaEntity t) {
        return new TagView(t.getId(), t.getName(), t.getSlug(), t.getDescription(), t.getIsActive(),
                t.getCategory() != null ? t.getCategory().getId() : null,
                t.getCategory() != null ? t.getCategory().getName() : null,
                questionRepository.countByTagId(t.getId()));
    }

    private QuestionDetailView toDetailView(Question q) {
        List<AnswerView> answers = q.getAnswers().stream()
                .map(a -> new AnswerView(a.getId(), a.getContent(), a.getIsCorrect(), a.getIsActive()))
                .collect(Collectors.toList());
        List<TagRefView> tags = q.getTags().stream()
                .map(t -> new TagRefView(t.getId(), t.getName()))
                .collect(Collectors.toList());
        return new QuestionDetailView(q.getId(), q.getContent(), q.getExplanation(), q.getHint(),
                q.getCategory() != null ? q.getCategory().getId() : null,
                q.getCategory() != null ? q.getCategory().getName() : null,
                q.getLevel().getLevelName().name(), q.getStatus().getStatusName().name(),
                q.getCreatedAt() != null ? q.getCreatedAt().toString() : null,
                answers, tags);
    }

}
