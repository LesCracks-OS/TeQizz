package com.brandonkamga.teqizz.admin.application.service;

import com.brandonkamga.teqizz.catalog.infrastructure.persistence.repository.CategoryRepository;
import com.brandonkamga.teqizz.dto.admin.AdminStatsResponse;
import com.brandonkamga.teqizz.exception.BadRequestException;
import com.brandonkamga.teqizz.exception.ResourceNotFoundException;
import com.brandonkamga.teqizz.gaming.qcm.domain.model.vo.QuestionStatusType;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.GameSessionRepository;
import com.brandonkamga.teqizz.gaming.qcm.infrastructure.persistence.repository.QuestionRepository;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.repository.SmatchDeckRepository;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.repository.SmatchPairRepository;
import com.brandonkamga.teqizz.gaming.smatch.infrastructure.persistence.repository.SmatchSessionRepository;
import com.brandonkamga.teqizz.iam.domain.model.vo.RoleType;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.Role;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.UserJpaEntity;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.repository.RoleRepository;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminPlatformApplicationService {

    public record UserView(Long id, String username, String email, String roleName,
                           String providerName, String createdAt,
                           String firstName, String lastName, String avatarUrl) {}

    private final UserJpaRepository userRepository;
    private final RoleRepository roleRepository;
    private final QuestionRepository questionRepository;
    private final CategoryRepository categoryRepository;
    private final GameSessionRepository gameSessionRepository;
    private final SmatchDeckRepository smatchDeckRepository;
    private final SmatchPairRepository smatchPairRepository;
    private final SmatchSessionRepository smatchSessionRepository;

    public AdminPlatformApplicationService(UserJpaRepository userRepository,
                                           RoleRepository roleRepository,
                                           QuestionRepository questionRepository,
                                           CategoryRepository categoryRepository,
                                           GameSessionRepository gameSessionRepository,
                                           SmatchDeckRepository smatchDeckRepository,
                                           SmatchPairRepository smatchPairRepository,
                                           SmatchSessionRepository smatchSessionRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.questionRepository = questionRepository;
        this.categoryRepository = categoryRepository;
        this.gameSessionRepository = gameSessionRepository;
        this.smatchDeckRepository = smatchDeckRepository;
        this.smatchPairRepository = smatchPairRepository;
        this.smatchSessionRepository = smatchSessionRepository;
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        return AdminStatsResponse.builder()
                .totalUsers(userRepository.count())
                .totalQcmQuestions(questionRepository.count())
                .activeQcmQuestions(questionRepository.findByStatus(QuestionStatusType.ACTIVE).size())
                .totalQcmCategories(categoryRepository.count())
                .totalQcmSessions(gameSessionRepository.count())
                .activeQcmSessions(gameSessionRepository.findByCompletedAtIsNotNull().size())
                .totalSmatchDecks(smatchDeckRepository.count())
                .activeSmatchDecks(smatchDeckRepository.countActive())
                .totalSmatchPairs(smatchPairRepository.count())
                .totalSmatchSessions(smatchSessionRepository.count())
                .activeSmatchSessions(smatchSessionRepository.countByCompletedAtIsNull())
                .build();
    }

    @Transactional(readOnly = true)
    public List<UserView> getUsers(String search, String role) {
        return userRepository.findAll().stream()
                .filter(u -> search == null || search.isEmpty()
                        || u.getUsername().toLowerCase().contains(search.toLowerCase())
                        || u.getEmail().toLowerCase().contains(search.toLowerCase()))
                .filter(u -> role == null || role.isEmpty()
                        || (u.getRole() != null && u.getRole().getRoleName().name().equals(role)))
                .map(this::toUserView)
                .collect(Collectors.toList());
    }

    public void updateUserRole(Long userId, String roleName, String currentUserEmail) {
        UserJpaEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        if (user.getEmail().equals(currentUserEmail)) {
            throw new BadRequestException("Cannot change your own role");
        }
        RoleType roleType = RoleType.valueOf(roleName.toUpperCase());
        Role role = roleRepository.findByRoleName(roleType)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName));
        user.setRole(role);
        userRepository.save(user);
    }

    public void deleteUser(Long userId, String currentUserEmail) {
        UserJpaEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        if (user.getEmail().equals(currentUserEmail)) {
            throw new BadRequestException("Cannot delete your own account");
        }
        userRepository.delete(user);
    }

    private UserView toUserView(UserJpaEntity u) {
        String firstName = u.getProfile() != null ? u.getProfile().getFirstName() : null;
        String lastName  = u.getProfile() != null ? u.getProfile().getLastName()  : null;
        String avatar    = u.getProfile() != null ? u.getProfile().getAvatarUrl() : null;
        return new UserView(
                u.getId(), u.getUsername(), u.getEmail(),
                u.getRole() != null ? u.getRole().getRoleName().name() : "USER",
                u.getProvider() != null ? u.getProvider().getProviderName().name() : "LOCAL",
                u.getCreatedAt() != null ? u.getCreatedAt().toString() : null,
                firstName, lastName, avatar);
    }
}
