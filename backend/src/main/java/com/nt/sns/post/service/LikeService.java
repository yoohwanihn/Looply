package com.nt.sns.post.service;

import com.nt.sns.common.exception.BusinessException;
import com.nt.sns.common.exception.ErrorCode;
import com.nt.sns.post.mapper.LikeMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LikeService {

    private final LikeMapper likeMapper;

    public LikeService(LikeMapper likeMapper) {
        this.likeMapper = likeMapper;
    }

    @Transactional
    public void like(Long userId, Long postId) {
        if (likeMapper.exists(userId, postId)) {
            throw new BusinessException(ErrorCode.ALREADY_LIKED);
        }
        likeMapper.insert(userId, postId);
    }

    @Transactional
    public void unlike(Long userId, Long postId) {
        if (!likeMapper.exists(userId, postId)) return;
        likeMapper.delete(userId, postId);
    }
}
