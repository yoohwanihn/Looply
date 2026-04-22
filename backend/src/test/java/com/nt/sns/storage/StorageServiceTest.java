package com.nt.sns.storage;

import io.minio.MinioClient;
import io.minio.ObjectWriteResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.ByteArrayInputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StorageServiceTest {

    @Mock
    MinioClient minioClient;

    @InjectMocks
    StorageService storageService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(storageService, "publicUrl", "http://localhost:9100");
    }

    @Test
    void upload_returnsPublicUrl() throws Exception {
        when(minioClient.putObject(any())).thenReturn(mock(ObjectWriteResponse.class));

        String url = storageService.upload(
                "sns-avatars", "1/avatar.jpg",
                new ByteArrayInputStream("data".getBytes()), 4L, "image/jpeg");

        assertThat(url).isEqualTo("http://localhost:9100/sns-avatars/1/avatar.jpg");
    }

    @Test
    void upload_onMinioError_throwsRuntimeException() throws Exception {
        when(minioClient.putObject(any())).thenThrow(new RuntimeException("minio down"));

        assertThatThrownBy(() ->
                storageService.upload("sns-avatars", "1/avatar.jpg",
                        new ByteArrayInputStream("data".getBytes()), 4L, "image/jpeg"))
                .isInstanceOf(RuntimeException.class);
    }
}
