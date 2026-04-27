package com.nt.sns.post.mapper;

import com.nt.sns.post.domain.Comment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface CommentMapper {
    void insert(Comment comment);
    Optional<Comment> findById(Long id);
    List<Comment> findByPostId(@Param("postId") Long postId,
                               @Param("cursor") Long cursor,
                               @Param("size") int size);
    void softDelete(Long id);
}
