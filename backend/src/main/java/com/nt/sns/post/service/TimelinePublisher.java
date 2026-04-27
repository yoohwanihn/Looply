package com.nt.sns.post.service;

import com.nt.sns.follow.mapper.FollowMapper;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TimelinePublisher {

    private final RedisTemplate<String, Object> redisTemplate;
    private final FollowMapper followMapper;

    public TimelinePublisher(RedisTemplate<String, Object> redisTemplate,
                              FollowMapper followMapper) {
        this.redisTemplate = redisTemplate;
        this.followMapper = followMapper;
    }

    public void publishNewPost(Long authorId, Long postId) {
        List<Long> followerIds = followMapper.findFollowerIds(authorId);
        for (Long followerId : followerIds) {
            try {
                redisTemplate.convertAndSend("channel:timeline:" + followerId, postId.toString());
            } catch (Exception ignored) {}
        }
    }
}
