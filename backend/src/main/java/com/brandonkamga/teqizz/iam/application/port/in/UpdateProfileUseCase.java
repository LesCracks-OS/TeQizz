package com.brandonkamga.teqizz.iam.application.port.in;

import com.brandonkamga.teqizz.iam.domain.model.User;

/**
 * Inbound port for profile updates.
 */
public interface UpdateProfileUseCase {
    User update(Long userId, UpdateProfileCommand command);

    record UpdateProfileCommand(String username, String email,
                                String firstName, String lastName,
                                String avatarUrl, String country, String bio,
                                String githubUrl, String linkedinUrl,
                                String twitterUrl, String websiteUrl) {}
}
