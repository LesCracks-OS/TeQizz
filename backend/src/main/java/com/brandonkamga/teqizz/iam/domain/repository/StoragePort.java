package com.brandonkamga.teqizz.iam.domain.repository;

import java.io.InputStream;

/**
 * Secondary port — outgoing storage abstraction.
 * Implemented by MinioStorageAdapter in the infrastructure layer.
 */
public interface StoragePort {

    /**
     * Uploads a file and returns its public URL.
     *
     * @param objectName  destination path/key inside the bucket
     * @param stream      file content
     * @param size        content length in bytes (-1 if unknown)
     * @param contentType MIME type (e.g. "image/jpeg")
     * @return public URL of the uploaded object
     */
    String upload(String objectName, InputStream stream, long size, String contentType);

    /**
     * Deletes an object by its key. No-op if the object doesn't exist.
     */
    void delete(String objectName);
}
