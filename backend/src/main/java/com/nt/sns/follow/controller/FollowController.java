package com.nt.sns.follow.controller;

import com.nt.sns.follow.service.FollowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Follow", description = "팔로우 API (SFR-006)")
@RestController
@RequestMapping("/api/users")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @Operation(summary = "팔로우")
    @PostMapping("/{id}/follow")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void follow(
            @PathVariable Long id,
            @AuthenticationPrincipal Long userId) {
        followService.follow(userId, id);
    }

    @Operation(summary = "언팔로우")
    @DeleteMapping("/{id}/follow")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unfollow(
            @PathVariable Long id,
            @AuthenticationPrincipal Long userId) {
        followService.unfollow(userId, id);
    }
}
