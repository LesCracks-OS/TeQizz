package com.brandonkamga.teqizz.iam.infrastructure.storage;

import com.brandonkamga.teqizz.iam.domain.repository.StoragePort;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.SetBucketPolicyArgs;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.InputStream;

@Component
public class MinioStorageAdapter implements StoragePort {

    private final MinioClient minioClient;
    private final String bucket;
    private final String publicUrl;

    public MinioStorageAdapter(MinioClient minioClient,
                               @Value("${app.storage.minio.bucket}") String bucket,
                               @Value("${app.storage.minio.public-url}") String publicUrl) {
        this.minioClient = minioClient;
        this.bucket = bucket;
        this.publicUrl = publicUrl.stripTrailing().replaceAll("/$", "");
    }

    @PostConstruct
    void ensureBucketExists() {
        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                // Allow public read so avatar URLs are directly accessible
                String policy = """
                        {"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":"*",\
                        "Action":"s3:GetObject","Resource":"arn:aws:s3:::%s/*"}]}""".formatted(bucket);
                minioClient.setBucketPolicy(SetBucketPolicyArgs.builder()
                        .bucket(bucket).config(policy).build());
            }
        } catch (Exception e) {
            throw new IllegalStateException("Could not initialise MinIO bucket: " + e.getMessage(), e);
        }
    }

    @Override
    public String upload(String objectName, InputStream stream, long size, String contentType) {
        try {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .stream(stream, size, -1)
                    .contentType(contentType)
                    .build());
            // Construct public URL directly — bucket is public-read
            return publicUrl + "/" + bucket + "/" + objectName;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload object to MinIO: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(String objectName) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucket).object(objectName).build());
        } catch (Exception e) {
            // swallow — delete is best-effort
        }
    }
}
