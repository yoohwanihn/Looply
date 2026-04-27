package com.nt.sns.post;

import com.nt.sns.common.exception.BusinessException;
import com.nt.sns.common.exception.ErrorCode;
import com.nt.sns.post.domain.Post;
import com.nt.sns.post.mapper.PostMapper;
import com.nt.sns.post.service.BannedWordValidator;
import com.nt.sns.post.service.PostService;
import com.nt.sns.post.service.TimelinePublisher;
import com.nt.sns.storage.StorageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock PostMapper postMapper;
    @Mock BannedWordValidator bannedWordValidator;
    @Mock StorageService storageService;
    @Mock TimelinePublisher timelinePublisher;
    @InjectMocks PostService postService;

    @Test
    void createPost_bannedWord_throws() {
        doThrow(new BusinessException(ErrorCode.BANNED_WORD_DETECTED))
                .when(bannedWordValidator).validate(anyString());

        assertThatThrownBy(() -> postService.createPost(1L, "욕설포함", List.of(), null))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode").isEqualTo(ErrorCode.BANNED_WORD_DETECTED);
    }

    @Test
    void updatePost_notOwner_throws() {
        Post post = new Post();
        post.setId(1L);
        post.setUserId(2L);
        when(postMapper.findById(1L, null)).thenReturn(Optional.of(post));

        assertThatThrownBy(() -> postService.updatePost(1L, 1L, "수정내용"))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode").isEqualTo(ErrorCode.FORBIDDEN);
    }

    @Test
    void deletePost_adminCanDelete() {
        Post post = new Post();
        post.setId(1L);
        post.setUserId(2L);
        post.setCreatedAt(OffsetDateTime.now());
        post.setUpdatedAt(OffsetDateTime.now());
        when(postMapper.findById(1L, 99L)).thenReturn(Optional.of(post));
        when(postMapper.findImageUrls(1L)).thenReturn(List.of());

        postService.deletePost(1L, 99L, "ADMIN");

        verify(postMapper).softDelete(1L);
    }
}
