package com.brandonkamga.teqizz.iam.infrastructure.persistence.repository;

import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.UserJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Spring Data JPA repository for UserJpaEntity.
 * Infrastructure layer only — application code depends on UserRepositoryPort, not this interface.
 */
public interface UserJpaRepository extends JpaRepository<UserJpaEntity, Long> {

    Optional<UserJpaEntity> findByEmail(String email);

    Optional<UserJpaEntity> findByUsername(String username);
}
