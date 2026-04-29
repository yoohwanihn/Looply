package com.nt.sns.notification.controller;

import com.nt.sns.common.dto.ApiResponse;
import com.nt.sns.notification.dto.NotificationResponse;
import com.nt.sns.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Notification", description = "알림 API (SFR-009)")
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Operation(summary = "알림 목록 조회")
    @GetMapping
    public ApiResponse<List<NotificationResponse>> getNotifications(
            @AuthenticationPrincipal Long userId,
            @RequestParam(defaultValue = "30") int size) {
        return ApiResponse.ok(notificationService.getNotifications(userId, size));
    }

    @Operation(summary = "읽지 않은 알림 수")
    @GetMapping("/unread-count")
    public ApiResponse<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal Long userId) {
        return ApiResponse.ok(Map.of("count", notificationService.getUnreadCount(userId)));
    }

    @Operation(summary = "알림 전체 읽음 처리")
    @PatchMapping("/read")
    public ApiResponse<Void> markAllRead(@AuthenticationPrincipal Long userId) {
        notificationService.markAllRead(userId);
        return ApiResponse.ok(null);
    }
}
