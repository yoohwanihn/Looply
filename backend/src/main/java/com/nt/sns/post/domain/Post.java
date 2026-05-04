package com.nt.sns.post.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
public class Post {
    private Long id;
    private Long userId;
    private String content;
    private Long repostOfId;
    private boolean deleted;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    private String userName;
    private String department;
    private String userProfileImageUrl;

    private int likeCount;
    private int commentCount;
    private int repostCount;
    private boolean likedByMe;
    private boolean repostedByMe;

    public boolean isEdited() {
        return createdAt != null && updatedAt != null && updatedAt.isAfter(createdAt);
    }
}
