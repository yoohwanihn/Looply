package com.nt.sns.storage;

import io.minio.*;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Service
public class StorageService {

    private static final Logger log = LoggerFactory.getLogger(StorageService.class);

    private final MinioClient minioClient;

    @Value("${minio.public-url}")
    private String publicUrl;

    @Value("${minio.bucket-images}")
    private String bucketImages;

    @Value("${minio.bucket-avatars}")
    private String bucketAvatars;

    public StorageService(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    public String upload(String bucket, String objectName, InputStream stream, long size, String contentType) {
        try {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .stream(stream, size, -1)
                    .contentType(contentType)
                    .build());
            return publicUrl + "/" + bucket + "/" + objectName;
        } catch (Exception e) {
            throw new RuntimeException("MinIO upload failed: " + e.getMessage(), e);
        }
    }

    public void delete(String bucket, String objectName) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .build());
        } catch (Exception e) {
            throw new RuntimeException("MinIO delete failed: " + e.getMessage(), e);
        }
    }

    @PostConstruct
    public void initBuckets() {
        createBucketIfAbsent(bucketImages);
        createBucketIfAbsent(bucketAvatars);
    }

    private void createBucketIfAbsent(String bucket) {
        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                String policy = """
                        {"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":"*",\
                        "Action":["s3:GetObject"],"Resource":["arn:aws:s3:::%s/*"]}]}
                        """.formatted(bucket);
                minioClient.setBucketPolicy(SetBucketPolicyArgs.builder()
                        .bucket(bucket).config(policy).build());
                log.info("MinIO bucket created: {}", bucket);
            }
        } catch (Exception e) {
            log.warn("MinIO bucket init failed for {}: {}", bucket, e.getMessage());
        }
    }
}
