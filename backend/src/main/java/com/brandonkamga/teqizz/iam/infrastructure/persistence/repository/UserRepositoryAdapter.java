package com.brandonkamga.teqizz.iam.infrastructure.persistence.repository;

import com.brandonkamga.teqizz.iam.domain.model.User;
import com.brandonkamga.teqizz.iam.domain.repository.UserRepositoryPort;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.UserJpaEntity;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.mapper.UserPersistenceMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Adapter that implements the domain port using Spring Data JPA.
 */
@Repository
public class UserRepositoryAdapter implements UserRepositoryPort {

    private final UserJpaRepository userJpaRepository;
    private final UserPersistenceMapper mapper;

    public UserRepositoryAdapter(UserJpaRepository userJpaRepository, UserPersistenceMapper mapper) {
        this.userJpaRepository = userJpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userJpaRepository.findByEmail(email).map(mapper::toDomain);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userJpaRepository.findByUsername(username).map(mapper::toDomain);
    }

    @Override
    public Optional<User> findById(Long id) {
        return userJpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<User> findAll() {
        return userJpaRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public User save(User user) {
        Long rawId = user.getId() != null ? user.getId().value() : null;

        if (rawId != null && rawId != 0L) {
            Optional<UserJpaEntity> existingOpt = userJpaRepository.findById(rawId);
            if (existingOpt.isPresent()) {
                UserJpaEntity existing = existingOpt.get();
                mapper.updateJpaEntity(existing, user);
                return mapper.toDomain(userJpaRepository.save(existing));
            }
        }

        // New user — ensure id=null so the DB generates it
        UserJpaEntity jpa = mapper.toJpaEntity(user);
        jpa.setId(null);
        return mapper.toDomain(userJpaRepository.save(jpa));
    }

    @Override
    public void deleteById(Long id) {
        userJpaRepository.deleteById(id);
    }
}
