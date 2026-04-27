package com.nt.sns.post.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface LikeMapper {
    boolean exists(@Param("userId") Long userId, @Param("postId") Long postId);
    void insert(@Param("userId") Long userId, @Param("postId") Long postId);
    void delete(@Param("userId") Long userId, @Param("postId") Long postId);
}
