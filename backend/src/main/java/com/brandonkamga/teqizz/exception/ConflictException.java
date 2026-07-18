package com.brandonkamga.teqizz.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * 409 Conflict — the request duplicates content that already exists (exact-duplicate guard).
 * {@code duplicateId} points at the existing record so the client can link to it.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class ConflictException extends RuntimeException {

    private final Long duplicateId;

    public ConflictException(String message) {
        this(message, null);
    }

    public ConflictException(String message, Long duplicateId) {
        super(message);
        this.duplicateId = duplicateId;
    }

    public Long getDuplicateId() {
        return duplicateId;
    }
}
