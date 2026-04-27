package com.nt.sns.post;

import com.nt.sns.follow.mapper.FollowMapper;
import com.nt.sns.post.service.TimelinePublisher;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.List;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TimelinePublisherTest {

    @Mock RedisTemplate<String, Object> redisTemplate;
    @Mock FollowMapper followMapper;
    @InjectMocks TimelinePublisher timelinePublisher;

    @Test
    void publishNewPost_sendsToEachFollower() {
        when(followMapper.findFollowerIds(1L)).thenReturn(List.of(10L, 20L, 30L));

        timelinePublisher.publishNewPost(1L, 99L);

        verify(redisTemplate).convertAndSend("channel:timeline:10", "99");
        verify(redisTemplate).convertAndSend("channel:timeline:20", "99");
        verify(redisTemplate).convertAndSend("channel:timeline:30", "99");
    }

    @Test
    void publishNewPost_noFollowers_doesNothing() {
        when(followMapper.findFollowerIds(1L)).thenReturn(List.of());

        timelinePublisher.publishNewPost(1L, 99L);

        verify(redisTemplate, never()).convertAndSend(anyString(), any());
    }
}
