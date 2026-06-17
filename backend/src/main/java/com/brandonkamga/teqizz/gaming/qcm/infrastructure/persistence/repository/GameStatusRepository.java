package com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.GameStatusType;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.GameStatus;

@Repository
public interface GameStatusRepository extends JpaRepository<GameStatus, Long> {

    Optional<GameStatus> findByStatusName(GameStatusType statusName);

    boolean existsByStatusName(GameStatusType statusName);
}
