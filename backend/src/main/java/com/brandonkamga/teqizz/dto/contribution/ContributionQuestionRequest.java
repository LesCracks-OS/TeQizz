package com.brandonkamga.teqizz.dto.contribution;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ContributionQuestionRequest {

    @NotBlank
    private String content;

    private String explanation;
    private String hint;

    @NotNull
    private Long categoryId;

    @NotBlank
    private String level;

    @NotNull
    @Size(min = 2, max = 6)
    @Valid
    private List<AnswerRequest> answers;

    private List<Long> tagIds;

    @Getter
    @Setter
    public static class AnswerRequest {
        @NotBlank
        private String content;
        @NotNull
        private Boolean isCorrect;
    }
}
