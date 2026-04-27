package com.nt.sns.post.service;

import com.nt.sns.common.exception.BusinessException;
import com.nt.sns.common.exception.ErrorCode;
import com.nt.sns.post.domain.Comment;
import com.nt.sns.post.dto.CommentResponse;
import com.nt.sns.post.mapper.CommentMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    private final CommentMapper commentMapper;
    private final BannedWordValidator bannedWordValidator;

    public CommentService(CommentMapper commentMapper, BannedWordValidator bannedWordValidator) {
        this.commentMapper = commentMapper;
        this.bannedWordValidator = bannedWordValidator;
    }

    @Transactional
    public CommentResponse createComment(Long postId, Long userId, String content) {
        bannedWordValidator.validate(content);
        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setUserId(userId);
        comment.setContent(content);
        commentMapper.insert(comment);
        return commentMapper.findById(comment.getId())
                .map(this::toResponse)
                .orElseThrow();
    }

    public List<CommentResponse> getComments(Long postId) {
        return commentMapper.findByPostId(postId).stream()
                .map(this::toResponse).toList();
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId, String role) {
        Comment comment = commentMapper.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));
        if (!"ADMIN".equals(role) && !comment.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        commentMapper.softDelete(commentId);
    }

    private CommentResponse toResponse(Comment c) {
        return new CommentResponse(c.getId(), c.getUserId(), c.getUserName(),
                c.getUserProfileImageUrl(), c.getContent(), c.getCreatedAt());
    }
}
