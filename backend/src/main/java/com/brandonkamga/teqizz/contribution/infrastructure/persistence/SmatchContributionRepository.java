package com.brandonkamga.teqizz.contribution.infrastructure.persistence;

import com.brandonkamga.teqizz.contribution.domain.model.vo.ContributionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SmatchContributionRepository extends JpaRepository<SmatchContributionJpaEntity, Long> {

    List<SmatchContributionJpaEntity> findBySubmittedByIdOrderByCreatedAtDesc(Long userId);

    List<SmatchContributionJpaEntity> findByStatusOrderByCreatedAtDesc(ContributionStatus status);

    long countByStatus(ContributionStatus status);
}
