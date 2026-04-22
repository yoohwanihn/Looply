package com.nt.sns.user.dto;

public record UserSearchResponse(
        Long id,
        String employeeNo,
        String name,
        String department,
        String position,
        String profileImageUrl
) {}
