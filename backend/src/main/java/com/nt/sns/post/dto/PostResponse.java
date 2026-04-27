package com.nt.sns.post.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record PostResponse(
        Long id,
        Long userId,
        String userName,
        String department,
        String profileImageUrl,
        String content,
        List<String> imageUrls,
        boolean isEdited,
        int likeCount,
        boolean likedByMe,
        int commentCount,
        int repostCount,
        PostResponse originalPost,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
