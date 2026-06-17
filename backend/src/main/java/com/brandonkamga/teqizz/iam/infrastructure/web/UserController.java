package com.brandonkamga.teqizz.iam.infrastructure.web;

import com.brandonkamga.teqizz.dto.ApiResponse;
import com.brandonkamga.teqizz.dto.UserRequest;
import com.brandonkamga.teqizz.dto.UserResponse;
import com.brandonkamga.teqizz.exception.BadRequestException;
import com.brandonkamga.teqizz.exception.ResourceNotFoundException;
import com.brandonkamga.teqizz.iam.application.port.in.DeleteAccountUseCase;
import com.brandonkamga.teqizz.iam.application.port.in.UpdateProfileUseCase;
import com.brandonkamga.teqizz.iam.domain.model.User;
import com.brandonkamga.teqizz.iam.domain.repository.StoragePort;
import com.brandonkamga.teqizz.iam.domain.repository.UserRepositoryPort;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * IAM UserController — real @RestController replacing the legacy controller.UserController.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepositoryPort userRepositoryPort;
    private final UpdateProfileUseCase updateProfileUseCase;
    private final DeleteAccountUseCase deleteAccountUseCase;
    private final IamUserMapper userMapper;
    private final StoragePort storagePort;

    public UserController(UserRepositoryPort userRepositoryPort,
                          UpdateProfileUseCase updateProfileUseCase,
                          DeleteAccountUseCase deleteAccountUseCase,
                          IamUserMapper userMapper,
                          StoragePort storagePort) {
        this.userRepositoryPort = userRepositoryPort;
        this.updateProfileUseCase = updateProfileUseCase;
        this.deleteAccountUseCase = deleteAccountUseCase;
        this.userMapper = userMapper;
        this.storagePort = storagePort;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userRepositoryPort.findAll().stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return userRepositoryPort.findById(id)
                .map(user -> ResponseEntity.ok(ApiResponse.success(userMapper.toResponse(user))))
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResourceNotFoundException("User", "id", 0L);
        }
        User user = userRepositoryPort.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", authentication.getName()));
        return ResponseEntity.ok(ApiResponse.success(userMapper.toResponse(user)));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByEmail(@PathVariable String email) {
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return ResponseEntity.ok(ApiResponse.success(userMapper.toResponse(user)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest userRequest) {

        if (!isCurrentUser(id)) {
            throw new BadRequestException("You can only update your own account");
        }

        UpdateProfileUseCase.UpdateProfileCommand command = new UpdateProfileUseCase.UpdateProfileCommand(
                userRequest.getUsername(),
                userRequest.getEmail(),
                userRequest.getFirstName(),
                userRequest.getLastName(),
                userRequest.getAvatarUrl(),
                userRequest.getCountry(),
                userRequest.getBio(),
                userRequest.getGithubUrl(),
                userRequest.getLinkedinUrl(),
                userRequest.getTwitterUrl(),
                userRequest.getWebsiteUrl()
        );

        User updated = updateProfileUseCase.update(id, command);
        return ResponseEntity.ok(ApiResponse.success(userMapper.toResponse(updated), "User updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        if (!userRepositoryPort.findById(id).isPresent()) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        if (!isCurrentUser(id) && !isCurrentUserAdmin()) {
            throw new BadRequestException("You can only delete your own account");
        }
        deleteAccountUseCase.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> uploadAvatar(
            @RequestParam MultipartFile file) {

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Only image files are accepted");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("File must not exceed 5 MB");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepositoryPort.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", auth.getName()));

        String ext = contentType.contains("png") ? ".png" : contentType.contains("gif") ? ".gif" : ".jpg";
        String objectName = "avatars/" + user.getId().value() + "/" + UUID.randomUUID() + ext;

        try {
            String avatarUrl = storagePort.upload(objectName, file.getInputStream(),
                    file.getSize(), contentType);

            UpdateProfileUseCase.UpdateProfileCommand command = new UpdateProfileUseCase.UpdateProfileCommand(
                    null, null, null, null, avatarUrl, null, null, null, null, null, null);
            User updated = updateProfileUseCase.update(user.getId().value(), command);
            return ResponseEntity.ok(ApiResponse.success(userMapper.toResponse(updated), "Avatar updated"));
        } catch (java.io.IOException e) {
            throw new RuntimeException("Could not read uploaded file", e);
        }
    }

    private boolean isCurrentUser(Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) return false;
        return userRepositoryPort.findByEmail(authentication.getName())
                .map(u -> u.getId() != null && u.getId().value().equals(userId))
                .orElse(false);
    }

    private boolean isCurrentUserAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
