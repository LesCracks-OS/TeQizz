package com.brandonkamga.teqizz.iam.application.service;

import com.brandonkamga.teqizz.exception.BadRequestException;
import com.brandonkamga.teqizz.exception.ResourceNotFoundException;
import com.brandonkamga.teqizz.iam.application.port.in.UpdateProfileUseCase;
import com.brandonkamga.teqizz.iam.domain.model.Profile;
import com.brandonkamga.teqizz.iam.domain.model.User;
import com.brandonkamga.teqizz.iam.domain.model.vo.Email;
import com.brandonkamga.teqizz.iam.domain.model.vo.Username;
import com.brandonkamga.teqizz.iam.domain.repository.UserRepositoryPort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Application service for updating a user's profile.
 */
@Service
@Transactional
public class UpdateProfileService implements UpdateProfileUseCase {

    private final UserRepositoryPort userRepositoryPort;

    public UpdateProfileService(UserRepositoryPort userRepositoryPort) {
        this.userRepositoryPort = userRepositoryPort;
    }

    @Override
    public User update(Long userId, UpdateProfileCommand command) {
        User user = userRepositoryPort.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (command.email() != null) {
            userRepositoryPort.findByEmail(command.email())
                    .ifPresent(existing -> {
                        if (!existing.getId().value().equals(userId)) {
                            throw new BadRequestException("Email already exists");
                        }
                    });
            user.setEmail(Email.of(command.email()));
        }

        if (command.username() != null) {
            userRepositoryPort.findByUsername(command.username())
                    .ifPresent(existing -> {
                        if (!existing.getId().value().equals(userId)) {
                            throw new BadRequestException("Username already exists");
                        }
                    });
            user.setUsername(Username.of(command.username()));
        }

        Profile profile = user.getProfile();
        if (profile == null) {
            profile = Profile.create(userId, null, null);
            user.setProfile(profile);
        }

        if (command.firstName() != null) profile.setFirstName(command.firstName());
        if (command.lastName() != null) profile.setLastName(command.lastName());
        if (command.avatarUrl() != null) profile.setAvatarUrl(command.avatarUrl());
        if (command.country() != null) profile.setCountry(command.country());
        if (command.bio() != null) profile.setBio(command.bio());
        if (command.githubUrl() != null) profile.setGithubUrl(command.githubUrl());
        if (command.linkedinUrl() != null) profile.setLinkedinUrl(command.linkedinUrl());
        if (command.twitterUrl() != null) profile.setTwitterUrl(command.twitterUrl());
        if (command.websiteUrl() != null) profile.setWebsiteUrl(command.websiteUrl());

        return userRepositoryPort.save(user);
    }
}
