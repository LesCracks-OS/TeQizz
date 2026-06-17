package com.brandonkamga.teqizz.iam.application.port.in;

/**
 * Inbound port for account deletion.
 */
public interface DeleteAccountUseCase {
    void delete(Long userId);
}
