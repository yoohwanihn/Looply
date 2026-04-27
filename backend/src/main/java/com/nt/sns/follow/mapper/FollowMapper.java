package com.nt.sns.follow.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FollowMapper {
    List<Long> findFollowerIds(@Param("userId") Long userId);
    boolean existsFollow(@Param("followerId") Long followerId, @Param("followingId") Long followingId);
    void insertFollow(@Param("followerId") Long followerId, @Param("followingId") Long followingId);
    void deleteFollow(@Param("followerId") Long followerId, @Param("followingId") Long followingId);
}
