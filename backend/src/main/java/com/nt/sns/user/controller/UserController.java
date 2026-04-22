package com.nt.sns.user.controller;

import com.nt.sns.common.dto.ApiResponse;
import com.nt.sns.user.domain.User;
import com.nt.sns.user.dto.AdminUpdateUserRequest;
import com.nt.sns.user.dto.UpdateProfileRequest;
import com.nt.sns.user.dto.UserProfileResponse;
import com.nt.sns.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "User", description = "사용자 프로필 API (SFR-001)")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "내 프로필 조회")
    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMyProfile(@AuthenticationPrincipal Long userId) {
        return ApiResponse.ok(userService.getProfileResponse(userId));
    }

    @Operation(summary = "특정 사용자 프로필 조회")
    @GetMapping("/{id}")
    public ApiResponse<UserProfileResponse> getProfile(@PathVariable Long id) {
        return ApiResponse.ok(userService.getProfileResponse(id));
    }

    @Operation(summary = "내 프로필 수정 (bio)")
    @PatchMapping("/me/profile")
    public ApiResponse<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody UpdateProfileRequest req) {
        return ApiResponse.ok(userService.updateBio(userId, req.bio()));
    }

    @Operation(summary = "프로필 사진 업로드")
    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UserProfileResponse> uploadAvatar(
            @AuthenticationPrincipal Long userId,
            @RequestPart("file") MultipartFile file) {
        return ApiResponse.ok(userService.uploadAvatar(userId, file));
    }

    @Operation(summary = "사용자 검색 (멘션 자동완성)")
    @GetMapping("/search")
    public ApiResponse<List<User>> search(@RequestParam String q) {
        return ApiResponse.ok(userService.searchByName(q));
    }

    @Operation(summary = "[ADMIN] 소속·직급 수정")
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/{id}")
    public ApiResponse<UserProfileResponse> adminUpdate(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateUserRequest req) {
        return ApiResponse.ok(userService.adminUpdateUser(id, req.department(), req.position()));
    }
}
