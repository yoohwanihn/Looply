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
        String channel = new String(message.getChannel());
        // channel 형식: "channel:timeline:{userId}"
        String[] parts = channel.split(":");
        if (parts.length < 3) return;
        String userId = parts[2];
        messagingTemplate.convertAndSendToUser(userId, "/queue/timeline", "new");
    }
}
