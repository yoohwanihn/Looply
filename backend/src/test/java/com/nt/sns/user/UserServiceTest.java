package com.nt.sns.user;

import com.nt.sns.common.exception.BusinessException;
import com.nt.sns.storage.StorageService;
import com.nt.sns.user.domain.User;
import com.nt.sns.user.dto.UserProfileResponse;
import com.nt.sns.user.mapper.UserMapper;
import com.nt.sns.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock UserMapper userMapper;
    @Mock StorageService storageService;
    @InjectMocks UserService userService;

    @Test
    void getProfileResponse_includesFollowerAndPostCounts() {
        User user = new User();
        user.setId(1L);
        user.setName("홍길동");
        user.setDepartment("개발팀");
        user.setPosition("팀장");

        when(userMapper.findById(1L)).thenReturn(Optional.of(user));
        when(userMapper.countFollowers(1L)).thenReturn(5);
        when(userMapper.countFollowing(1L)).thenReturn(3);
        when(userMapper.countPosts(1L)).thenReturn(10);

        UserProfileResponse resp = userService.getProfileResponse(1L);

        assertThat(resp.followerCount()).isEqualTo(5);
        assertThat(resp.followingCount()).isEqualTo(3);
        assertThat(resp.postCount()).isEqualTo(10);
        assertThat(resp.name()).isEqualTo("홍길동");
    }

    @Test
    void getProfileResponse_userNotFound_throws() {
        when(userMapper.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getProfileResponse(99L))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void uploadAvatar_updatesProfileImageUrl() throws Exception {
        User user = new User();
        user.setId(1L);
        when(userMapper.findById(1L)).thenReturn(Optional.of(user));
        when(storageService.upload(eq("sns-avatars"), eq("1/avatar.jpg"), any(), anyLong(), anyString()))
                .thenReturn("http://localhost:9100/sns-avatars/1/avatar.jpg");
        when(userMapper.countFollowers(1L)).thenReturn(0);
        when(userMapper.countFollowing(1L)).thenReturn(0);
        when(userMapper.countPosts(1L)).thenReturn(0);

        MockMultipartFile file = new MockMultipartFile(
                "avatar", "photo.jpg", "image/jpeg", "fakejpeg".getBytes());

        UserProfileResponse resp = userService.uploadAvatar(1L, file);

        verify(userMapper).updateProfileImageUrl(1L, "http://localhost:9100/sns-avatars/1/avatar.jpg");
        assertThat(resp).isNotNull();
    }
}
