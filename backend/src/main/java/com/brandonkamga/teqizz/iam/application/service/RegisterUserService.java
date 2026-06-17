package com.brandonkamga.teqizz.iam.application.service;

import com.brandonkamga.teqizz.exception.BadRequestException;
import com.brandonkamga.teqizz.iam.application.port.in.RegisterUserUseCase;
import com.brandonkamga.teqizz.iam.domain.model.Profile;
import com.brandonkamga.teqizz.iam.domain.model.User;
import com.brandonkamga.teqizz.iam.domain.model.vo.Email;
import com.brandonkamga.teqizz.iam.domain.model.vo.HashedPassword;
import com.brandonkamga.teqizz.iam.domain.model.vo.UserId;
import com.brandonkamga.teqizz.iam.domain.model.vo.Username;
import com.brandonkamga.teqizz.iam.domain.repository.UserRepositoryPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Application service that orchestrates user registration.
 * Uses the domain UserRepositoryPort — no JPA imports here.
 */
@Service
@Transactional
public class RegisterUserService implements RegisterUserUseCase {

    private final UserRepositoryPort userRepositoryPort;
    private final PasswordEncoder passwordEncoder;

    public RegisterUserService(UserRepositoryPort userRepositoryPort,
                               PasswordEncoder passwordEncoder) {
        this.userRepositoryPort = userRepositoryPort;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User register(RegisterCommand command) {
        if (userRepositoryPort.findByEmail(command.email()).isPresent()) {
            throw new BadRequestException("Email already exists");
        }
        if (userRepositoryPort.findByUsername(command.username()).isPresent()) {
            throw new BadRequestException("Username already exists");
        }

        String hashedPassword = passwordEncoder.encode(command.password());

        // id will be assigned by persistence; use null until saved
        User user = User.register(
                UserId.of(0L),  // placeholder — overwritten after save
                Email.of(command.email()),
                Username.of(command.username()),
                HashedPassword.of(hashedPassword),
                "LOCAL",
                "local-" + command.email(),
                "USER",
                null
        );

        Profile profile = Profile.create(null, command.firstName(), command.lastName());
        user.setProfile(profile);

        return userRepositoryPort.save(user);
    }
}
