package com.nt.sns.post.dto;

import java.time.OffsetDateTime;

public record CommentResponse(
        Long id,
        Long userId,
        String userName,
        String profileImageUrl,
        String content,
        OffsetDateTime createdAt
) {}
