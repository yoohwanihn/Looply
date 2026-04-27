package com.nt.sns.follow.service;

import com.nt.sns.common.exception.BusinessException;
import com.nt.sns.common.exception.ErrorCode;
import com.nt.sns.follow.mapper.FollowMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FollowService {

    private final FollowMapper followMapper;

    public FollowService(FollowMapper followMapper) {
        this.followMapper = followMapper;
    }

    @Transactional
    public void follow(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new BusinessException(ErrorCode.SELF_FOLLOW_NOT_ALLOWED);
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
