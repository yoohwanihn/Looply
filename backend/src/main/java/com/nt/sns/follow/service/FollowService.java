package com.nt.sns.follow.service;

import com.nt.sns.common.exception.BusinessException;
import com.nt.sns.common.exception.ErrorCode;
import com.nt.sns.follow.mapper.FollowMapper;
import com.nt.sns.user.mapper.UserMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FollowService {

    private final FollowMapper followMapper;
    private final UserMapper userMapper;

    public FollowService(FollowMapper followMapper, UserMapper userMapper) {
        this.followMapper = followMapper;
        this.userMapper = userMapper;
    }

    @Transactional
    public void follow(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new BusinessException(ErrorCode.SELF_FOLLOW_NOT_ALLOWED);
        }
        if (!userMapper.existsById(followingId)) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        if (followMapper.existsFollow(followerId, followingId)) {
            throw new BusinessException(ErrorCode.ALREADY_FOLLOWING);
        }
        followMapper.insertFollow(followerId, followingId);
    }

    @Transactional
    public void unfollow(Long followerId, Long followingId) {
        if (!followMapper.existsFollow(followerId, followingId)) return;
        followMapper.deleteFollow(followerId, followingId);
    }
}
