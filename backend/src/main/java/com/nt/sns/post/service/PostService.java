package com.nt.sns.post.service;

import com.nt.sns.common.exception.BusinessException;
import com.nt.sns.common.exception.ErrorCode;
import com.nt.sns.mention.MentionMapper;
import com.nt.sns.mention.MentionParser;
import com.nt.sns.post.domain.Post;
import com.nt.sns.post.dto.PostResponse;
import com.nt.sns.post.mapper.PostMapper;
import com.nt.sns.user.mapper.UserMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class PostService {

    private final PostMapper postMapper;
    private final BannedWordValidator bannedWordValidator;
    private final PostImageService postImageService;
    private final TimelinePublisher timelinePublisher;
    private final MentionParser mentionParser;
    private final MentionMapper mentionMapper;
    private final UserMapper userMapper;

    public PostService(PostMapper postMapper,
                       BannedWordValidator bannedWordValidator,
                       PostImageService postImageService,
                       TimelinePublisher timelinePublisher,
                       MentionParser mentionParser,
                       MentionMapper mentionMapper,
                       UserMapper userMapper) {
        this.postMapper = postMapper;
        this.bannedWordValidator = bannedWordValidator;
        this.postImageService = postImageService;
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
            postImageService.uploadImages(post.getId(), images);
        }

        // 멘션 저장
        saveMentions(post.getId(), content);

        // 리포스트가 아닌 경우에만 타임라인에 발행 (DB 커밋 후 발행하여 race condition 방지)
        if (repostOfId == null) {
            final Long postIdFinal = post.getId();
            final Long userIdFinal = userId;
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    timelinePublisher.publishNewPost(userIdFinal, postIdFinal);
                }
            });
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
        mentionMapper.deleteByPostId(postId);
        saveMentions(postId, content);
        return getPostResponse(postId, userId);
    }

    @Transactional
    public void deletePost(Long postId, Long userId, String role) {
        Post post = postMapper.findById(postId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
        if (!"ADMIN".equals(role) && !post.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        postImageService.deleteImages(postId);
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

    public List<PostResponse> getFollowingTimeline(Long requesterId, Long cursor, int size) {
        List<Post> posts = postMapper.findFollowingTimeline(requesterId, cursor, size);
        List<PostResponse> result = new ArrayList<>();
        for (Post p : posts) {
            result.add(toResponse(p, requesterId));
        }
        return result;
    }

    public List<PostResponse> getUserPosts(Long userId, Long requesterId, Long cursor, int size) {
        List<Post> posts = postMapper.findByUserId(userId, requesterId, cursor, size);
        List<PostResponse> result = new ArrayList<>();
        for (Post p : posts) {
            result.add(toResponse(p, requesterId));
        }
        return result;
    }

    public List<PostResponse> getAllPosts(Long requesterId, Long cursor, int size) {
        List<Post> posts = postMapper.findAllPosts(requesterId, cursor, size);
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
                post.getCommentCount(), post.getRepostCount(), post.isRepostedByMe(),
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
