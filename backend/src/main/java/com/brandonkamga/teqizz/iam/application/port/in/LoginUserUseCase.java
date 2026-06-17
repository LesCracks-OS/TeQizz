package com.brandonkamga.teqizz.iam.application.port.in;

/**
 * Inbound port for user login.
 */
public interface LoginUserUseCase {
    String login(LoginCommand command);

    record LoginCommand(String email, String password) {}
}
