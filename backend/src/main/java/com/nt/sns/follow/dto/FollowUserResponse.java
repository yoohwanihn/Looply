package com.nt.sns.follow.dto;

public record FollowUserResponse(
        Long id,
        String name,
        String department,
        String position,
        String profileImageUrl,
        boolean isFollowing
) {}
