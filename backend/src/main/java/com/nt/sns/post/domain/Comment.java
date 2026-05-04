package com.nt.sns.post.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
public class Comment {
    private Long id;
    private Long postId;
    private Long userId;
    private String content;
    private boolean deleted;
    private OffsetDateTime createdAt;
    private String userName;
    private String userProfileImageUrl;
}
