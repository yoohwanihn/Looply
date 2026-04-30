package com.nt.sns.follow.dto;

public class FollowUserResponse {
    private Long id;
    private String name;
    private String department;
    private String position;
    private String profileImageUrl;
    private boolean isFollowing;

    public FollowUserResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

    public boolean getIsFollowing() { return isFollowing; }
    public void setIsFollowing(boolean isFollowing) { this.isFollowing = isFollowing; }
}
