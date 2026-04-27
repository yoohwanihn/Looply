package com.nt.sns.post;

import com.nt.sns.common.exception.BusinessException;
import com.nt.sns.common.exception.ErrorCode;
import com.nt.sns.post.mapper.LikeMapper;
import com.nt.sns.post.service.LikeService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LikeServiceTest {

    @Mock LikeMapper likeMapper;
    @InjectMocks LikeService likeService;

    @Test
    void like_alreadyLiked_throws() {
        when(likeMapper.exists(1L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> likeService.like(1L, 1L))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode").isEqualTo(ErrorCode.ALREADY_LIKED);
    }

    @Test
    void like_notLiked_inserts() {
        when(likeMapper.exists(1L, 1L)).thenReturn(false);

        likeService.like(1L, 1L);

        verify(likeMapper).insert(1L, 1L);
    }

    @Test
    void unlike_notLiked_doesNotThrow() {
        when(likeMapper.exists(1L, 1L)).thenReturn(false);

        likeService.unlike(1L, 1L);

        verify(likeMapper, never()).delete(anyLong(), anyLong());
    }
}
