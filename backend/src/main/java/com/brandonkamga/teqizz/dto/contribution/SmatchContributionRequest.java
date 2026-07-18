package com.brandonkamga.teqizz.dto.contribution;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/** A user's proposed Smatch deck submitted for review. */
@Getter
@Setter
public class SmatchContributionRequest {

    @NotBlank
    private String name;

    private String description;

    private Long categoryId;

    private String difficulty;

    @NotNull
    @Size(min = 3, message = "A deck needs at least 3 pairs")
    @Valid
    private List<PairRequest> pairs;

    @Getter
    @Setter
    public static class PairRequest {
        @NotBlank
        private String term;
        @NotBlank
        private String definition;
        private String hint;
    }
}
