package com.nt.sns.post.mapper;

import com.nt.sns.post.domain.Post;
import com.nt.sns.post.domain.PostImage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface PostMapper {
    void insert(Post post);
    Optional<Post> findById(@Param("id") Long id, @Param("requesterId") Long requesterId);
    void update(@Param("id") Long id, @Param("content") String content);
    void softDelete(Long id);

    void insertImage(PostImage image);
    List<String> findImageUrls(Long postId);

    List<Post> findTimeline(@Param("requesterId") Long requesterId,
                            @Param("cursor") Long cursor,
                            @Param("size") int size);

    boolean existsRepostByUser(@Param("userId") Long userId, @Param("originalPostId") Long originalPostId);
    Optional<Post> findRepostByUser(@Param("userId") Long userId, @Param("originalPostId") Long originalPostId);
}
