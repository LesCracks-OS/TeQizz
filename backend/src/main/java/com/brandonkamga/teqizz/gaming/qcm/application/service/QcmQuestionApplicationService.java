package com.brandonkamga.teqizz.gaming.qcm.application.service;

import com.brandonkamga.teqizz.gaming.qcm.application.port.in.CreateQcmQuestionUseCase;
import com.brandonkamga.teqizz.gaming.qcm.application.port.in.SelectQcmQuestionsUseCase;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.QcmAnswer;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.QcmQuestion;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QcmQuestionLevel;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QcmQuestionStatus;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QuestionStatusType;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.Question;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.AnswerRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.GameRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.QuestionLevelRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.QuestionRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.QuestionStatusRepository;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository.CategoryRepository;
import com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository.TagRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class QcmQuestionApplicationService implements CreateQcmQuestionUseCase, SelectQcmQuestionsUseCase {

    private final QuestionRepository questionRepository;
    private final com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository.CategoryRepository categoryRepository;
    private final GameRepository gameRepository;
    private final QuestionLevelRepository questionLevelRepository;
    private final QuestionStatusRepository questionStatusRepository;
    private final AnswerRepository answerRepository;
    private final TagRepository tagRepository;

    public QcmQuestionApplicationService(
            QuestionRepository questionRepository,
            com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository.CategoryRepository categoryRepository,
            GameRepository gameRepository,
            QuestionLevelRepository questionLevelRepository,
            QuestionStatusRepository questionStatusRepository,
            AnswerRepository answerRepository,
            TagRepository tagRepository) {
        this.questionRepository = questionRepository;
        this.categoryRepository = categoryRepository;
        this.gameRepository = gameRepository;
        this.questionLevelRepository = questionLevelRepository;
        this.questionStatusRepository = questionStatusRepository;
        this.answerRepository = answerRepository;
        this.tagRepository = tagRepository;
    }

    @Override
    public QcmQuestion create(CreateQcmQuestionUseCase.CreateQcmQuestionCommand command) {
        throw new UnsupportedOperationException("Use AdminQcmController for creating QCM questions");
    }

    @Override
    @Transactional(readOnly = true)
    public List<QcmQuestion> selectForSession(Long categoryId, Long gameId, QcmQuestionLevel level,
                                              List<Long> tagIds, List<Long> excludeIds) {
        List<Question> questions;
        if (gameId != null) {
            questions = questionRepository.findByCategoryIdAndGameIdAndStatus(
                    categoryId, gameId, QuestionStatusType.ACTIVE);
        } else {
            questions = questionRepository.findByCategoryIdAndStatus(categoryId, QuestionStatusType.ACTIVE);
        }

        if (tagIds != null && !tagIds.isEmpty()) {
            List<Question> tagFiltered =
                    questionRepository.findByCategoryIdAndGameIdAndTagIdsAndStatus(
                            categoryId, gameId, tagIds, QuestionStatusType.ACTIVE);
            Set<Long> tagFilteredIds = tagFiltered.stream()
                    .map(Question::getId)
                    .collect(Collectors.toSet());
            questions = questions.stream()
                    .filter(q -> tagFilteredIds.contains(q.getId()))
                    .collect(Collectors.toList());
        }

        if (excludeIds != null && !excludeIds.isEmpty()) {
            Set<Long> excludeSet = new HashSet<>(excludeIds);
            questions = questions.stream()
                    .filter(q -> !excludeSet.contains(q.getId()))
                    .collect(Collectors.toList());
        }

        return questions.stream()
                .map(this::toQcmQuestion)
                .collect(Collectors.toList());
    }

    private QcmQuestion toQcmQuestion(Question q) {
        List<QcmAnswer> answers = q.getAnswers().stream()
                .map(a -> QcmAnswer.reconstitute(
                        a.getId(),
                        q.getId(),
                        a.getContent(),
                        Boolean.TRUE.equals(a.getIsCorrect()),
                        null,
                        null))
                .collect(Collectors.toList());

        QcmQuestionLevel qcmLevel = mapLevel(q.getLevel().getLevelName().name());
        QcmQuestionStatus qcmStatus = mapStatus(q.getStatus().getStatusName().name());
        Long catId = q.getCategory() != null ? q.getCategory().getId() : null;

        return QcmQuestion.reconstitute(q.getId(), q.getContent(), q.getExplanation(),
                q.getHint(), qcmLevel, qcmStatus, catId, answers);
    }

    private QcmQuestionLevel mapLevel(String name) {
        try { return QcmQuestionLevel.valueOf(name); }
        catch (IllegalArgumentException e) { return QcmQuestionLevel.EASY; }
    }

    private QcmQuestionStatus mapStatus(String name) {
        try { return QcmQuestionStatus.valueOf(name); }
        catch (IllegalArgumentException e) { return QcmQuestionStatus.ACTIVE; }
    }
}
