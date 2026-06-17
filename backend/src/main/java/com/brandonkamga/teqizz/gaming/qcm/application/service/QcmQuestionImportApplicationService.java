package com.brandonkamga.teqizz.gaming.qcm.application.service;

import com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity.CategoryJpaEntity;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.entity.TagJpaEntity;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository.CategoryRepository;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository.TagRepository;
import com.brandonkamga.teqizz.dto.importData.QuestionImportRequest;
import com.brandonkamga.teqizz.dto.importData.QuestionImportResponse;
import com.brandonkamga.teqizz.exception.ResourceNotFoundException;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.GameTypeName;
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
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class QcmQuestionImportApplicationService {

    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final QuestionLevelRepository questionLevelRepository;
    private final QuestionStatusRepository questionStatusRepository;
    private final GameRepository gameRepository;
    private final ObjectMapper objectMapper;

    public QcmQuestionImportApplicationService(
            CategoryRepository categoryRepository,
            TagRepository tagRepository,
            QuestionRepository questionRepository,
            AnswerRepository answerRepository,
            QuestionLevelRepository questionLevelRepository,
            QuestionStatusRepository questionStatusRepository,
            GameRepository gameRepository,
            ObjectMapper objectMapper) {
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.questionLevelRepository = questionLevelRepository;
        this.questionStatusRepository = questionStatusRepository;
        this.gameRepository = gameRepository;
        this.objectMapper = objectMapper;
    }


    public QuestionImportResponse importQuestions(QuestionImportRequest request) {
        List<QuestionImportResponse.ImportError> errors = new ArrayList<>();
        Set<String> createdTags = new HashSet<>();
        int imported = 0;
        int skipped = 0;

        System.out.println("    [DEBUG] Starting import for category: '" + request.getCategoryName() + "'");
        System.out.println("    [DEBUG] Number of questions to import: " + (request.getQuestions() != null ? request.getQuestions().size() : 0));

        CategoryJpaEntity category = categoryRepository.findByName(request.getCategoryName()).orElse(null);
        if (category == null) {
            System.out.println("    [ERROR] Category not found: '" + request.getCategoryName() + "'");
            List<CategoryJpaEntity> allCategories = categoryRepository.findAll();
            System.out.println("    [DEBUG] Available categories: " + allCategories.stream().map(CategoryJpaEntity::getName).toList());
            return QuestionImportResponse.builder()
                    .success(false).imported(0)
                    .skipped(request.getQuestions() != null ? request.getQuestions().size() : 0)
                    .total(request.getQuestions() != null ? request.getQuestions().size() : 0)
                    .createdTags(new ArrayList<>())
                    .errors(List.of(QuestionImportResponse.ImportError.builder()
                            .questionIndex(0).questionContent("Category not found")
                            .error("Category '" + request.getCategoryName() + "' not found in database")
                            .build()))
                    .build();
        }
        System.out.println("    [DEBUG] Found category: " + category.getName() + " (ID: " + category.getId() + ")");

        Game qcmGame = gameRepository.findByName(GameTypeName.QCM.name()).orElse(null);
        if (qcmGame == null) {
            System.out.println("    [ERROR] QCM Game not found");
            return QuestionImportResponse.builder()
                    .success(false).imported(0)
                    .skipped(request.getQuestions().size()).total(request.getQuestions().size())
                    .createdTags(new ArrayList<>())
                    .errors(List.of(QuestionImportResponse.ImportError.builder()
                            .questionIndex(0).questionContent("Game not found")
                            .error("QCM Game not found in database")
                            .build()))
                    .build();
        }

        QuestionStatus activeStatus = questionStatusRepository.findByStatusName(QuestionStatusType.ACTIVE).orElse(null);
        if (activeStatus == null) {
            System.out.println("    [ERROR] ACTIVE status not found");
            return QuestionImportResponse.builder()
                    .success(false).imported(0)
                    .skipped(request.getQuestions().size()).total(request.getQuestions().size())
                    .createdTags(new ArrayList<>())
                    .errors(List.of(QuestionImportResponse.ImportError.builder()
                            .questionIndex(0).questionContent("Status not found")
                            .error("ACTIVE QuestionStatus not found in database")
                            .build()))
                    .build();
        }

        int questionIndex = 0;
        for (QuestionImportRequest.QuestionData questionData : request.getQuestions()) {
            questionIndex++;
            try {
                long correctAnswersCount = questionData.getAnswers().stream()
                        .filter(a -> Boolean.TRUE.equals(a.getIsCorrect())).count();
                if (correctAnswersCount == 0) {
                    errors.add(QuestionImportResponse.ImportError.builder()
                            .questionIndex(questionIndex)
                            .questionContent(truncate(questionData.getContent(), 50))
                            .error("No correct answer provided").build());
                    skipped++;
                    continue;
                }

                QuestionLevel level = questionLevelRepository.findByLevelName(questionData.getDifficulty())
                        .orElseThrow(() -> new ResourceNotFoundException("QuestionLevel", "levelName", questionData.getDifficulty().name()));

                Set<TagJpaEntity> tags = processTags(questionData.getTags(), category, createdTags);

                Question question = Question.builder()
                        .content(questionData.getContent())
                        .hint(questionData.getHint())
                        .explanation(questionData.getExplanation())
                        .category(category)
                        .game(qcmGame)
                        .level(level)
                        .status(activeStatus)
                        .tags(tags)
                        .build();
                question = questionRepository.save(question);
                System.out.println("    [DEBUG] Saved question " + questionIndex + ": " + question.getId());

                for (QuestionImportRequest.AnswerData answerData : questionData.getAnswers()) {
                    answerRepository.save(Answer.builder()
                            .question(question)
                            .content(answerData.getContent())
                            .isCorrect(answerData.getIsCorrect())
                            .isActive(true)
                            .build());
                }
                imported++;

            } catch (Exception e) {
                System.out.println("    [ERROR] Failed to import question " + questionIndex + ": " + e.getMessage());
                errors.add(QuestionImportResponse.ImportError.builder()
                        .questionIndex(questionIndex)
                        .questionContent(truncate(questionData.getContent(), 50))
                        .error(e.getMessage()).build());
                skipped++;
            }
        }

        System.out.println("    [DEBUG] Import complete. Imported: " + imported + ", Skipped: " + skipped);
        return QuestionImportResponse.builder()
                .success(errors.isEmpty()).imported(imported).skipped(skipped)
                .total(request.getQuestions().size())
                .createdTags(new ArrayList<>(createdTags)).errors(errors)
                .build();
    }

    public QuestionImportResponse importQuestionsFromFile(String filePath) {
        try {
            QuestionImportRequest request = objectMapper.readValue(new File(filePath), QuestionImportRequest.class);
            return importQuestions(request);
        } catch (Exception e) {
            return QuestionImportResponse.builder()
                    .success(false).imported(0).skipped(0).total(0)
                    .createdTags(new ArrayList<>())
                    .errors(List.of(QuestionImportResponse.ImportError.builder()
                            .questionIndex(0).questionContent("File import error")
                            .error("Failed to read file: " + e.getMessage()).build()))
                    .build();
        }
    }

    public QuestionImportResponse importQuestionsFromInputStream(InputStream inputStream, String filename) {
        try {
            QuestionImportRequest request = objectMapper.readValue(inputStream, QuestionImportRequest.class);
            System.out.println("  - Looking for category: '" + request.getCategoryName() + "'");
            return importQuestions(request);
        } catch (Exception e) {
            System.out.println("  - ERROR importing " + filename + ": " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            return QuestionImportResponse.builder()
                    .success(false).imported(0).skipped(0).total(0)
                    .createdTags(new ArrayList<>())
                    .errors(List.of(QuestionImportResponse.ImportError.builder()
                            .questionIndex(0).questionContent("File import error")
                            .error("Failed to read " + filename + ": " + e.getMessage()).build()))
                    .build();
        }
    }

    private Set<TagJpaEntity> processTags(List<String> tagNames, CategoryJpaEntity category, Set<String> createdTags) {
        if (tagNames == null || tagNames.isEmpty()) return new HashSet<>();
        return tagNames.stream()
                .map(String::trim).map(String::toLowerCase).filter(n -> !n.isEmpty())
                .map(tagName -> tagRepository.findByName(tagName).orElseGet(() -> {
                    TagJpaEntity newTag = tagRepository.save(TagJpaEntity.builder()
                            .name(tagName).slug(generateSlug(tagName))
                            .category(category).isActive(true).build());
                    createdTags.add(tagName);
                    return newTag;
                }))
                .collect(Collectors.toSet());
    }

    private String generateSlug(String name) {
        return name.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }

    private String truncate(String str, int maxLength) {
        if (str == null) return "";
        return str.length() <= maxLength ? str : str.substring(0, maxLength) + "...";
    }
}
