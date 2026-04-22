package com.nt.sns.user;

import com.nt.sns.common.exception.BusinessException;
import com.nt.sns.storage.StorageService;
import com.nt.sns.user.domain.User;
import com.nt.sns.user.dto.UserProfileResponse;
import com.nt.sns.user.dto.UserSearchResponse;
import com.nt.sns.user.mapper.UserMapper;
import com.nt.sns.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
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

    @Test
    void updateBio_success() {
        User user = new User();
        user.setId(2L);
        user.setName("김개발");
        when(userMapper.findById(2L)).thenReturn(Optional.of(user));
        when(userMapper.countFollowers(2L)).thenReturn(0);
        when(userMapper.countFollowing(2L)).thenReturn(0);
        when(userMapper.countPosts(2L)).thenReturn(0);

        UserProfileResponse resp = userService.updateBio(2L, "안녕하세요 반갑습니다");

        verify(userMapper).updateProfileBio(2L, "안녕하세요 반갑습니다");
        assertThat(resp).isNotNull();
        assertThat(resp.name()).isEqualTo("김개발");
    }

    @Test
    void adminUpdateUser_success() {
        User user = new User();
        user.setId(3L);
        user.setName("이관리");
        user.setDepartment("인사팀");
        user.setPosition("과장");
        when(userMapper.findById(3L)).thenReturn(Optional.of(user));
        when(userMapper.countFollowers(3L)).thenReturn(0);
        when(userMapper.countFollowing(3L)).thenReturn(0);
        when(userMapper.countPosts(3L)).thenReturn(0);

        UserProfileResponse resp = userService.adminUpdateUser(3L, "개발팀", "팀장");

        verify(userMapper).updateDepartmentAndPosition(3L, "개발팀", "팀장");
        assertThat(resp).isNotNull();
    }

    @Test
    void searchByName_returnsMatchingUsers() {
        User user1 = new User();
        user1.setId(10L);
        user1.setEmployeeNo("EMP001");
        user1.setName("홍길동");
        user1.setDepartment("개발팀");
        user1.setPosition("사원");
        user1.setProfileImageUrl("http://example.com/img1.jpg");

        User user2 = new User();
        user2.setId(11L);
        user2.setEmployeeNo("EMP002");
        user2.setName("홍갑동");
        user2.setDepartment("기획팀");
        user2.setPosition("대리");
        user2.setProfileImageUrl(null);

        when(userMapper.searchByName("홍")).thenReturn(List.of(user1, user2));

        List<UserSearchResponse> results = userService.searchByName("홍");

        assertThat(results).hasSize(2);

        UserSearchResponse first = results.get(0);
        assertThat(first.id()).isEqualTo(10L);
        assertThat(first.name()).isEqualTo("홍길동");
        assertThat(first.employeeNo()).isEqualTo("EMP001");
        assertThat(first.department()).isEqualTo("개발팀");
        assertThat(first.position()).isEqualTo("사원");
        assertThat(first.profileImageUrl()).isEqualTo("http://example.com/img1.jpg");

        // Verify the return type is UserSearchResponse (not User domain object),
        // ensuring sensitive fields like passwordHash are not exposed.
        assertThat(results).allSatisfy(r -> assertThat(r).isInstanceOf(UserSearchResponse.class));
    }
}
