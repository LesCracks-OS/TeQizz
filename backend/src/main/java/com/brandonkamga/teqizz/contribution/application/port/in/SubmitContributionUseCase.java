package com.brandonkamga.teqizz.contribution.application.port.in;

import java.util.List;

public interface SubmitContributionUseCase {

    record SubmitContributionCommand(
            Long userId, Long categoryId, String content,
            String explanation, String hint, String level,
            List<AnswerCommand> answers, List<Long> tagIds) {}

    record AnswerCommand(String content, boolean isCorrect) {}

    record ContributionView(
            Long id, String content, Long categoryId, String categoryName,
            String level, String status, int answersCount,
            String submittedBy, String createdAt) {}

    ContributionView submit(SubmitContributionCommand command);
}
