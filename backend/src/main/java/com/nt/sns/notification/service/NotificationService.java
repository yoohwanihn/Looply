package com.nt.sns.notification.service;

import com.nt.sns.notification.domain.Notification;
import com.nt.sns.notification.dto.NotificationResponse;
import com.nt.sns.notification.mapper.NotificationMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationMapper notificationMapper;

    public NotificationService(NotificationMapper notificationMapper) {
        this.notificationMapper = notificationMapper;
    }

    public void notifyLike(Long senderId, Long postId) {
        Long ownerId = notificationMapper.findPostOwnerById(postId);
        if (ownerId == null || ownerId.equals(senderId)) return;
        notificationMapper.insert(ownerId, senderId, "LIKE", "POST", postId);
    }

    public void notifyComment(Long senderId, Long postId) {
        Long ownerId = notificationMapper.findPostOwnerById(postId);
        if (ownerId == null || ownerId.equals(senderId)) return;
        notificationMapper.insert(ownerId, senderId, "COMMENT", "POST", postId);
    }

    public void notifyFollow(Long senderId, Long recipientId) {
        notificationMapper.insert(recipientId, senderId, "FOLLOW", "USER", senderId);
    }

    public List<NotificationResponse> getNotifications(Long userId, int size) {
        return notificationMapper.findByRecipient(userId, Math.min(size, 50))
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationMapper.markAllRead(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationMapper.countUnread(userId);
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getSenderId(), n.getSenderName(),
                n.getSenderProfileImageUrl(), n.getType(),
                n.getResourceType(), n.getResourceId(),
                n.isRead(), n.getCreatedAt()
        );
    }
}
