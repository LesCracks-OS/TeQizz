package com.brandonkamga.teqizz.iam.infrastructure.security;

import com.brandonkamga.teqizz.iam.domain.model.User;
import com.brandonkamga.teqizz.iam.domain.repository.UserRepositoryPort;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Custom UserDetailsService backed by the IAM domain UserRepositoryPort.
 * Replaces the legacy security.CustomUserDetailsService.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepositoryPort userRepositoryPort;

    public CustomUserDetailsService(UserRepositoryPort userRepositoryPort) {
        this.userRepositoryPort = userRepositoryPort;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: '" + email + "'"));

        String authority = user.getRoleName() != null ? "ROLE_" + user.getRoleName() : "ROLE_USER";

        return new org.springframework.security.core.userdetails.User(
                user.getEmail().value(),
                user.getPassword() != null ? user.getPassword().value() : "",
                Collections.singletonList(new SimpleGrantedAuthority(authority))
        );
    }
}
