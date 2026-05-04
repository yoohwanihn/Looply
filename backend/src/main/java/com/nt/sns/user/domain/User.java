package com.nt.sns.user.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
public class User {
    private Long id;
    private String employeeNo;
    private String email;
    private String passwordHash;
    private String name;
    private String department;
    private String position;
    private String bio;
    private String profileImageUrl;
    private String role;
    private int loginFailCount;
    private OffsetDateTime lockedUntil;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public boolean isLocked() {
        return lockedUntil != null && lockedUntil.isAfter(OffsetDateTime.now());
    }
}
