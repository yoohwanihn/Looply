package com.nt.sns.user.controller;

import com.nt.sns.common.dto.ApiResponse;
import com.nt.sns.user.domain.User;
import com.nt.sns.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
    public ApiResponse<User> getMyProfile(@AuthenticationPrincipal Long userId) {
        return ApiResponse.ok(userService.getUser(userId));
    }

    @Operation(summary = "특정 사용자 프로필 조회")
    @GetMapping("/{id}")
    public ApiResponse<User> getProfile(@PathVariable Long id) {
        return ApiResponse.ok(userService.getUser(id));
    }
}
