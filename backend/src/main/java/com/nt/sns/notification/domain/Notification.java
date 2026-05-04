package com.nt.sns.notification.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class Notification {
    private Long id;
    private Long recipientId;
    private Long senderId;
    private String senderName;
    private String senderProfileImageUrl;
    private String type;
    private String resourceType;
    private Long resourceId;
    private boolean read;
    private LocalDateTime createdAt;
}
