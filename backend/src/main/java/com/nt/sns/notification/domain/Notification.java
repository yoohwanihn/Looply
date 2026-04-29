package com.nt.sns.notification.domain;

import java.time.LocalDateTime;

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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getRecipientId() { return recipientId; }
    public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }
    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public String getSenderProfileImageUrl() { return senderProfileImageUrl; }
    public void setSenderProfileImageUrl(String url) { this.senderProfileImageUrl = url; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }
    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
