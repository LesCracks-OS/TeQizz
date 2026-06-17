package com.brandonkamga.teqizz.iam.application.service;

import com.brandonkamga.teqizz.exception.BadRequestException;
import com.brandonkamga.teqizz.iam.application.port.in.LoginUserUseCase;
import com.brandonkamga.teqizz.iam.infrastructure.security.jwt.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

/**
 * Application service that handles user login.
 * Delegates credential validation to Spring Security and token generation to JwtService.
 */
@Service
public class LoginUserService implements LoginUserUseCase {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public LoginUserService(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Override
    public String login(LoginCommand command) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(command.email(), command.password())
            );
            return jwtService.generateTokenForUser(command.email(), "LOCAL");
        } catch (BadCredentialsException e) {
            throw new BadRequestException("Invalid email or password");
        }
    }
}
