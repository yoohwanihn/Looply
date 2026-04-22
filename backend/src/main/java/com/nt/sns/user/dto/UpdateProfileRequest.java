package com.nt.sns.user.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(max = 200, message = "소개는 200자 이하여야 합니다.") String bio
) {}
