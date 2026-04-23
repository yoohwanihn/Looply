package com.nt.sns.post.controller;

import com.nt.sns.common.dto.ApiResponse;
import com.nt.sns.post.dto.PostResponse;
import com.nt.sns.post.dto.UpdatePostRequest;
import com.nt.sns.post.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "Post", description = "게시글 API (SFR-002~005)")
@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @Operation(summary = "타임라인 조회 (커서 기반)")
    @GetMapping("/timeline")
    public ApiResponse<List<PostResponse>> getTimeline(
            @AuthenticationPrincipal Long userId,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(postService.getTimeline(userId, cursor, Math.min(size, 50)));
    }

    @Operation(summary = "게시글 단건 조회")
    @GetMapping("/{id}")
    public ApiResponse<PostResponse> getPost(
            @PathVariable Long id,
            @AuthenticationPrincipal Long userId) {
        return ApiResponse.ok(postService.getPostResponse(id, userId));
    }

    @Operation(summary = "게시글 작성 (이미지 최대 4장)")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PostResponse> createPost(
            @AuthenticationPrincipal Long userId,
            @RequestParam("content") String content,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        return ApiResponse.ok(postService.createPost(userId, content, images, null));
    }

    @Operation(summary = "게시글 수정")
    @PatchMapping("/{id}")
    public ApiResponse<PostResponse> updatePost(
            @PathVariable Long id,
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody UpdatePostRequest req) {
        return ApiResponse.ok(postService.updatePost(id, userId, req.content()));
    }

    @Operation(summary = "게시글 삭제 (소프트)")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal Long userId) {
        String role = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        postService.deletePost(id, userId, role);
    }

    @Operation(summary = "리포스트")
    @PostMapping("/{id}/repost")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PostResponse> repost(
            @PathVariable Long id,
            @AuthenticationPrincipal Long userId) {
        return ApiResponse.ok(postService.repost(id, userId));
    }

    @Operation(summary = "리포스트 취소")
    @DeleteMapping("/{id}/repost")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void undoRepost(
            @PathVariable Long id,
            @AuthenticationPrincipal Long userId) {
        postService.undoRepost(id, userId);
    }
}
