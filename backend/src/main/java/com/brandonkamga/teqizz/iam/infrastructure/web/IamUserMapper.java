package com.brandonkamga.teqizz.iam.infrastructure.web;

import com.brandonkamga.teqizz.dto.UserResponse;
import com.brandonkamga.teqizz.iam.domain.model.Profile;
import com.brandonkamga.teqizz.iam.domain.model.User;
import org.springframework.stereotype.Component;

/**
 * Maps IAM domain User to the shared UserResponse DTO for web layer use.
 */
@Component
public class IamUserMapper {

    public UserResponse toResponse(User user) {
        if (user == null) return null;

        UserResponse.UserResponseBuilder builder = UserResponse.builder()
                .id(user.getId() != null ? user.getId().value() : null)
                .username(user.getUsername() != null ? user.getUsername().value() : null)
                .email(user.getEmail() != null ? user.getEmail().value() : null)
                .providerName(user.getProviderName())
                .providerUserId(user.getProviderUserId())
                .roleName(user.getRoleName());

        Profile profile = user.getProfile();
        if (profile != null) {
            builder.firstName(profile.getFirstName())
                    .lastName(profile.getLastName())
                    .avatarUrl(profile.getAvatarUrl())
                    .country(profile.getCountry())
                    .bio(profile.getBio())
                    .githubUrl(profile.getGithubUrl())
                    .linkedinUrl(profile.getLinkedinUrl())
                    .twitterUrl(profile.getTwitterUrl())
                    .websiteUrl(profile.getWebsiteUrl());
        }

        return builder.build();
    }
}
