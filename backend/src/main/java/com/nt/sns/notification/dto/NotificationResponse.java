package com.nt.sns.notification.dto;

import java.time.LocalDateTime;

public record NotificationResponse(
    Long id,
    Long senderId,
    String senderName,
    String senderProfileImageUrl,
    String type,
    String resourceType,
    Long resourceId,
    boolean read,
    LocalDateTime createdAt
) {}
