package com.nt.sns.user.dto;

public record UserProfileResponse(
        Long id,
        String employeeNo,
        String name,
        String department,
        String position,
        String bio,
        String profileImageUrl,
        int followerCount,
        int followingCount,
        int postCount
) {}
