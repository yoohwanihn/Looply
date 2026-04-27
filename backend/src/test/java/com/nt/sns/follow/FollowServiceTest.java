package com.nt.sns.follow;

import com.nt.sns.common.exception.BusinessException;
import com.nt.sns.common.exception.ErrorCode;
import com.nt.sns.follow.mapper.FollowMapper;
import com.nt.sns.follow.service.FollowService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FollowServiceTest {

    @Mock FollowMapper followMapper;
    @InjectMocks FollowService followService;

    @Test
    void follow_self_throws() {
        assertThatThrownBy(() -> followService.follow(1L, 1L))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode").isEqualTo(ErrorCode.SELF_FOLLOW_NOT_ALLOWED);
    }

    @Test
    void follow_alreadyFollowing_throws() {
        when(followMapper.existsFollow(1L, 2L)).thenReturn(true);

        assertThatThrownBy(() -> followService.follow(1L, 2L))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode").isEqualTo(ErrorCode.ALREADY_FOLLOWING);
    }

    @Test
    void follow_success_inserts() {
        when(followMapper.existsFollow(1L, 2L)).thenReturn(false);

        followService.follow(1L, 2L);

        verify(followMapper).insertFollow(1L, 2L);
    }

    @Test
    void unfollow_notFollowing_doesNotThrow() {
        when(followMapper.existsFollow(1L, 2L)).thenReturn(false);

        followService.unfollow(1L, 2L);

        verify(followMapper, never()).deleteFollow(anyLong(), anyLong());
    }
}
