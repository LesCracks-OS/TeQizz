package com.brandonkamga.teqizz.dto.admin;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalUsers;
    private long totalQcmQuestions;
    private long activeQcmQuestions;
    private long totalQcmCategories;
    private long totalQcmTags;
    private long totalQcmSessions;
    private long activeQcmSessions;
    private long totalSmatchDecks;
    private long activeSmatchDecks;
    private long totalSmatchPairs;
    private long totalSmatchSessions;
    private long activeSmatchSessions;
}
