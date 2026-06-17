package com.brandonkamga.teqizz.iam.domain.repository;

import com.brandonkamga.teqizz.iam.domain.model.User;

import java.util.List;
import java.util.Optional;

/**
 * Outbound port — repository interface for the IAM User aggregate.
 * Belongs to the domain layer: no Spring/JPA imports.
 */
public interface UserRepositoryPort {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findById(Long id);

    List<User> findAll();

    User save(User user);

    void deleteById(Long id);
}
