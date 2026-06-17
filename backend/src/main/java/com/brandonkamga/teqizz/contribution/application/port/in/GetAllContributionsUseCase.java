package com.brandonkamga.teqizz.contribution.application.port.in;

import java.util.List;

public interface GetAllContributionsUseCase {

    record ContributionDetailView(
            Long id, String content, String explanation, String hint,
            Long categoryId, String categoryName, String level, String status,
            String submittedBy, Long submittedById, String createdAt,
            List<AnswerView> answers, List<TagView> tags) {}

    record AnswerView(Long id, String content, boolean isCorrect) {}

    record TagView(Long id, String name) {}

    List<ContributionDetailView> getAllContributions();

    long countPendingContributions();
}
