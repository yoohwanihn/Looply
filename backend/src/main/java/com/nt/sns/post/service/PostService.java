package com.nt.sns.post.service;

import com.nt.sns.common.exception.BusinessException;
import com.nt.sns.common.exception.ErrorCode;
import com.nt.sns.post.domain.Post;
import com.nt.sns.post.domain.PostImage;
import com.nt.sns.post.dto.PostResponse;
import com.nt.sns.post.mapper.PostMapper;
import com.nt.sns.storage.StorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class PostService {

    private static final String BUCKET_IMAGES = "sns-images";
    private static final int MAX_IMAGES = 4;

    private final PostMapper postMapper;
    private final BannedWordValidator bannedWordValidator;
    private final StorageService storageService;

    public PostService(PostMapper postMapper,
                       BannedWordValidator bannedWordValidator,
                       StorageService storageService) {
        this.postMapper = postMapper;
        this.bannedWordValidator = bannedWordValidator;
        this.storageService = storageService;
    }

    @Transactional
    public PostResponse createPost(Long userId, String content,
                                   List<MultipartFile> images, Long repostOfId) {
        bannedWordValidator.validate(content);

        Post post = new Post();
        post.setUserId(userId);
        post.setContent(content);
        post.setRepostOfId(repostOfId);
        postMapper.insert(post);

        if (images != null && !images.isEmpty()) {
            List<MultipartFile> valid = images.stream()
                    .filter(f -> f != null && !f.isEmpty()).toList();
            if (valid.size() > MAX_IMAGES) {
                throw new BusinessException(ErrorCode.INVALID_INPUT);
            }
            for (int i = 0; i < valid.size(); i++) {
                MultipartFile file = valid.get(i);
                try {
                    String objectName = post.getId() + "/" + i + "_" + file.getOriginalFilename();
                    String url = storageService.upload(BUCKET_IMAGES, objectName,
                            file.getInputStream(), file.getSize(), file.getContentType());
                    PostImage img = new PostImage();
                    img.setPostId(post.getId());
                    img.setImageUrl(url);
                    img.setDisplayOrder(i);
                    postMapper.insertImage(img);
                } catch (BusinessException e) {
                    throw e;
                } catch (Exception e) {
                    throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED);
                }
            }
        }

        return getPostResponse(post.getId(), userId);
    }

    @Transactional
    public PostResponse updatePost(Long postId, Long userId, String content) {
        Post post = postMapper.findById(postId, null)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
        if (!post.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        bannedWordValidator.validate(content);
        postMapper.update(postId, content);
        return getPostResponse(postId, userId);
    }

    @Transactional
    public void deletePost(Long postId, Long userId, String role) {
        Post post = postMapper.findById(postId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
        if (!"ADMIN".equals(role) && !post.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        List<String> imageUrls = postMapper.findImageUrls(postId);
        for (String url : imageUrls) {
            String objectName = url.substring(url.indexOf(BUCKET_IMAGES) + BUCKET_IMAGES.length() + 1);
            try { storageService.delete(BUCKET_IMAGES, objectName); } catch (Exception ignored) {}
        }
        postMapper.softDelete(postId);
    }

    public PostResponse getPostResponse(Long postId, Long requesterId) {
        Post post = postMapper.findById(postId, requesterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
        return toResponse(post, requesterId);
    }

    public List<PostResponse> getTimeline(Long requesterId, Long cursor, int size) {
        List<Post> posts = postMapper.findTimeline(requesterId, cursor, size);
        List<PostResponse> result = new ArrayList<>();
        for (Post p : posts) {
            result.add(toResponse(p, requesterId));
        }
        return result;
    }

    public PostResponse toResponse(Post post, Long requesterId) {
        List<String> imageUrls = postMapper.findImageUrls(post.getId());
        PostResponse originalPost = null;
        if (post.getRepostOfId() != null) {
            try {
                originalPost = getPostResponse(post.getRepostOfId(), requesterId);
            } catch (BusinessException ignored) {}
        }
        return new PostResponse(
                post.getId(), post.getUserId(), post.getUserName(),
                post.getDepartment(), post.getUserProfileImageUrl(),
                post.getContent(), imageUrls, post.isEdited(),
                post.getLikeCount(), post.isLikedByMe(),
                post.getCommentCount(), post.getRepostCount(),
                originalPost, post.getCreatedAt(), post.getUpdatedAt());
    }

    @Transactional
    public PostResponse repost(Long originalPostId, Long userId) {
        Post original = postMapper.findById(originalPostId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
        if (original.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.SELF_REPOST_NOT_ALLOWED);
        }
        if (postMapper.existsRepostByUser(userId, originalPostId)) {
            throw new BusinessException(ErrorCode.ALREADY_REPOSTED);
        }
        return createPost(userId, "", List.of(), originalPostId);
    }

    @Transactional
    public void undoRepost(Long originalPostId, Long userId) {
        Post repost = postMapper.findRepostByUser(userId, originalPostId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
        postMapper.softDelete(repost.getId());
    }
}
