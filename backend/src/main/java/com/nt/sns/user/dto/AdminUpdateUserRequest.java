package com.nt.sns.user.dto;

import jakarta.validation.constraints.Size;

public record AdminUpdateUserRequest(
        @Size(max = 100) String department,
        @Size(max = 100) String position
) {}
