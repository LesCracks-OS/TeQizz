package com.brandonkamga.teqizz.iam.infrastructure.persistence.repository;

import com.brandonkamga.teqizz.iam.domain.model.vo.RoleType;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.Role;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;


@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findById(Long id);

    Optional<Role> findByRoleName(RoleType roleName);

}
