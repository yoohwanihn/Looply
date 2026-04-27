package com.nt.sns.post.mapper;

import com.nt.sns.post.domain.Comment;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface CommentMapper {
    void insert(Comment comment);
    Optional<Comment> findById(Long id);
    List<Comment> findByPostId(Long postId);
    void softDelete(Long id);
}
