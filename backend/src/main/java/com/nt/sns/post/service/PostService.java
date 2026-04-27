package com.nt.sns.post.service;

import com.nt.sns.common.exception.BusinessException;
import com.nt.sns.common.exception.ErrorCode;
import com.nt.sns.mention.MentionMapper;
import com.nt.sns.mention.MentionParser;
import com.nt.sns.post.domain.Post;
import com.nt.sns.post.domain.PostImage;
import com.nt.sns.post.dto.PostResponse;
import com.nt.sns.post.mapper.PostMapper;
import com.nt.sns.storage.StorageService;
import com.nt.sns.user.mapper.UserMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class PostService {

    private static final String BUCKET_IMAGES = "sns-images";
    private static final int MAX_IMAGES = 4;
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
        "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    private final PostMapper postMapper;
    private final BannedWordValidator bannedWordValidator;
    private final StorageService storageService;
    private final TimelinePublisher timelinePublisher;
    private final MentionParser mentionParser;
    private final MentionMapper mentionMapper;
    private final UserMapper userMapper;

    public PostService(PostMapper postMapper,
                       BannedWordValidator bannedWordValidator,
                       StorageService storageService,
                       TimelinePublisher timelinePublisher,
                       MentionParser mentionParser,
                       MentionMapper mentionMapper,
                       UserMapper userMapper) {
        this.postMapper = postMapper;
        this.bannedWordValidator = bannedWordValidator;
        this.storageService = storageService;
        this.timelinePublisher = timelinePublisher;
        this.mentionParser = mentionParser;
        this.mentionMapper = mentionMapper;
        this.userMapper = userMapper;
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
                    String contentType = file.getContentType();
                    if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
                        throw new BusinessException(ErrorCode.INVALID_INPUT);
                    }
                    String ext = Optional.ofNullable(file.getOriginalFilename())
                        .filter(n -> n.contains("."))
                        .map(n -> n.substring(n.lastIndexOf('.')))
                        .orElse("");
                    String objectName = post.getId() + "/" + i + "_" + UUID.randomUUID() + ext;
                    String url = storageService.upload(BUCKET_IMAGES, objectName,
                            file.getInputStream(), file.getSize(), contentType);
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

        // 멘션 저장
        saveMentions(post.getId(), content);

        // 리포스트가 아닌 경우에만 타임라인에 발행 (DB 커밋 후 발행하여 race condition 방지)
        if (repostOfId == null) {
            final Long postIdFinal = post.getId();
            final Long userIdFinal = userId;
            TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronizationAdapter() {
                    @Override
                    public void afterCommit() {
                        timelinePublisher.publishNewPost(userIdFinal, postIdFinal);
                    }
                }
            );
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

    private void saveMentions(Long postId, String content) {
        List<String> names = mentionParser.extractMentions(content);
        for (String name : names) {
            userMapper.findByName(name)
                    .ifPresent(u -> mentionMapper.insertPostMention(postId, u.getId()));
        }
    }
}
