package com.nt.sns.post.controller;

import com.nt.sns.common.SecurityUtils;
import com.nt.sns.post.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Comment", description = "댓글 API (SFR-004)")
@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @Operation(summary = "댓글 삭제")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal Long userId) {
        String role = SecurityUtils.extractRole();
        commentService.deleteComment(id, userId, role);
    }
}
