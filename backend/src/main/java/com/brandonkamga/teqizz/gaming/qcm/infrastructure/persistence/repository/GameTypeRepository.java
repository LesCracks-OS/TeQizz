package com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.GameTypeName;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.GameType;

@Repository
public interface GameTypeRepository extends JpaRepository<GameType, Long> {

    Optional<GameType> findByTypeName(GameTypeName typeName);

    boolean existsByTypeName(GameTypeName typeName);
}
