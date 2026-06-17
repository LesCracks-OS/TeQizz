package com.brandonkamga.teqizz.iam.application.service;

import com.brandonkamga.teqizz.exception.ResourceNotFoundException;
import com.brandonkamga.teqizz.iam.application.port.in.DeleteAccountUseCase;
import com.brandonkamga.teqizz.iam.domain.repository.UserRepositoryPort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Application service for deleting a user account.
 */
@Service
@Transactional
public class DeleteAccountService implements DeleteAccountUseCase {

    private final UserRepositoryPort userRepositoryPort;

    public DeleteAccountService(UserRepositoryPort userRepositoryPort) {
        this.userRepositoryPort = userRepositoryPort;
    }

    @Override
    public void delete(Long userId) {
        if (userRepositoryPort.findById(userId).isEmpty()) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        userRepositoryPort.deleteById(userId);
    }
}
