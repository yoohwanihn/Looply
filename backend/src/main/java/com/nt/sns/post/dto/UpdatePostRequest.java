package com.nt.sns.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdatePostRequest(
        @NotBlank(message = "내용을 입력해주세요.")
        @Size(max = 300, message = "게시글은 300자 이하여야 합니다.")
        String content
) {}
