package com.nt.sns.post.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PostImage {
    private Long id;
    private Long postId;
    private String imageUrl;
    private int displayOrder;
}
