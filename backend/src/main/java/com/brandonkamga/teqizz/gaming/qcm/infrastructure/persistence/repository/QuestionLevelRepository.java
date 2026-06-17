package com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository;

import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QuestionLevelType;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.QuestionLevel;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionLevelRepository extends JpaRepository<QuestionLevel, Long> {

    Optional<QuestionLevel> findByLevelName(QuestionLevelType levelName);

    boolean existsByLevelName(QuestionLevelType levelName);

    List<QuestionLevel> findAllByOrderByLevelNameAsc();
}
