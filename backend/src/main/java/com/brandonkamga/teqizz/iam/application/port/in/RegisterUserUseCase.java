package com.brandonkamga.teqizz.iam.application.port.in;

import com.brandonkamga.teqizz.iam.domain.model.User;

/**
 * Inbound port for user registration.
 */
public interface RegisterUserUseCase {
    User register(RegisterCommand command);

    record RegisterCommand(String email, String username, String password,
                           String firstName, String lastName) {}
}
