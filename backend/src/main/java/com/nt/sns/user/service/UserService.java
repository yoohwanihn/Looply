package com.nt.sns.user.service;

import com.nt.sns.common.exception.BusinessException;
import com.nt.sns.common.exception.ErrorCode;
import com.nt.sns.storage.StorageService;
import com.nt.sns.user.domain.User;
import com.nt.sns.user.dto.UserProfileResponse;
import com.nt.sns.user.dto.UserSearchResponse;
import com.nt.sns.user.mapper.UserMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class UserService {

    private static final String BUCKET_AVATARS = "sns-avatars";

    private final UserMapper userMapper;
    private final StorageService storageService;

    public UserService(UserMapper userMapper, StorageService storageService) {
        this.userMapper = userMapper;
        this.storageService = storageService;
    }

    public User getUser(Long id) {
        return userMapper.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    public UserProfileResponse getProfileResponse(Long userId) {
        User user = userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return toResponse(user);
    }

    @Transactional
    public UserProfileResponse updateBio(Long userId, String bio) {
        userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        userMapper.updateProfileBio(userId, bio);
        return getProfileResponse(userId);
    }

    @Transactional
    public UserProfileResponse uploadAvatar(Long userId, MultipartFile file) {
        userMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        try {
            String objectName = userId + "/avatar.jpg";
            String url = storageService.upload(BUCKET_AVATARS, objectName,
                    file.getInputStream(), file.getSize(), file.getContentType());
            userMapper.updateProfileImageUrl(userId, url);
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED);
        }
        return getProfileResponse(userId);
    }

    @Transactional
    public UserProfileResponse adminUpdateUser(Long targetId, String department, String position) {
        userMapper.findById(targetId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        userMapper.updateDepartmentAndPosition(targetId, department, position);
        return getProfileResponse(targetId);
    }

    public List<UserSearchResponse> searchByName(String keyword) {
        return userMapper.searchByName(keyword).stream()
                .map(this::toSearchResponse)
                .toList();
    }

    private UserSearchResponse toSearchResponse(User user) {
        return new UserSearchResponse(
                user.getId(), user.getEmployeeNo(), user.getName(),
                user.getDepartment(), user.getPosition(), user.getProfileImageUrl());
    }

    private UserProfileResponse toResponse(User user) {
        int followers = userMapper.countFollowers(user.getId());
        int following = userMapper.countFollowing(user.getId());
        int postCount = userMapper.countPosts(user.getId());
        return new UserProfileResponse(
                user.getId(), user.getEmployeeNo(), user.getName(),
                user.getDepartment(), user.getPosition(),
                user.getBio(), user.getProfileImageUrl(),
                followers, following, postCount);
    }
}
