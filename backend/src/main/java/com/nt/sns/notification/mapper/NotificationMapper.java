package com.nt.sns.notification.mapper;

import com.nt.sns.notification.domain.Notification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface NotificationMapper {
    void insert(@Param("recipientId") Long recipientId,
                @Param("senderId")    Long senderId,
                @Param("type")        String type,
                @Param("resourceType") String resourceType,
                @Param("resourceId")  Long resourceId);

    List<Notification> findByRecipient(@Param("recipientId") Long recipientId,
                                       @Param("size") int size);

    void markAllRead(@Param("recipientId") Long recipientId);

    long countUnread(@Param("recipientId") Long recipientId);

    Long findPostOwnerById(@Param("postId") Long postId);
}
