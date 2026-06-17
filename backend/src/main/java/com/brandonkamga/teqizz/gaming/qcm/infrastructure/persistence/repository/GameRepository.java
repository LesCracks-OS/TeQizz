package com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository;

import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.Game;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {

    Optional<Game> findByName(String name);

    boolean existsByName(String name);

    List<Game> findAllByOrderByNameAsc();
}
