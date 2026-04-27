package com.nt.sns.post.service;

import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class TimelineSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;

    public TimelineSubscriber(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String channel = new String(message.getChannel());
            if (!channel.startsWith("channel:timeline:")) return;
            String userId = channel.substring("channel:timeline:".length());
            if (userId.isBlank()) return;
            messagingTemplate.convertAndSendToUser(userId, "/queue/timeline", "new");
        } catch (Exception e) {
            // silent — pub/sub delivery failure should not crash the listener
        }
    }
}
