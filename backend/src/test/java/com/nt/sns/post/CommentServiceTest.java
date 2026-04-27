package com.nt.sns.post;

import com.nt.sns.common.exception.BusinessException;
import com.nt.sns.common.exception.ErrorCode;
import com.nt.sns.post.domain.Comment;
import com.nt.sns.post.mapper.CommentMapper;
import com.nt.sns.post.service.BannedWordValidator;
import com.nt.sns.post.service.CommentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock CommentMapper commentMapper;
    @Mock BannedWordValidator bannedWordValidator;
    @InjectMocks CommentService commentService;

    @Test
    void deleteComment_notOwner_throws() {
        Comment comment = new Comment();
        comment.setId(1L);
        comment.setUserId(2L);
        when(commentMapper.findById(1L)).thenReturn(Optional.of(comment));

        assertThatThrownBy(() -> commentService.deleteComment(1L, 1L, "USER"))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode").isEqualTo(ErrorCode.FORBIDDEN);
    }

    @Test
    void deleteComment_adminCanDelete() {
        Comment comment = new Comment();
        comment.setId(1L);
        comment.setUserId(2L);
        when(commentMapper.findById(1L)).thenReturn(Optional.of(comment));

        commentService.deleteComment(1L, 99L, "ADMIN");

        verify(commentMapper).softDelete(1L);
    }
}
