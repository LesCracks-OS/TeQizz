package com.brandonkamga.teqizz.iam.domain.service;

/**
 * Domain service port for password hashing.
 * Implementation lives in infrastructure.
 */
public interface PasswordHasher {
    String hash(String rawPassword);
    boolean matches(String rawPassword, String hashedPassword);
}
