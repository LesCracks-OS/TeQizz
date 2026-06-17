package com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository;

import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QuestionStatusType;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.entity.QuestionStatus;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionStatusRepository extends JpaRepository<QuestionStatus, Long> {

    Optional<QuestionStatus> findByStatusName(QuestionStatusType statusName);

    boolean existsByStatusName(QuestionStatusType statusName);

    List<QuestionStatus> findAllByOrderByStatusNameAsc();
}
