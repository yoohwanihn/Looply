package com.nt.sns.user.mapper;

import com.nt.sns.user.domain.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Mapper
public interface UserMapper {
    void insert(User user);
    Optional<User> findById(Long id);
    Optional<User> findByEmail(String email);
    Optional<User> findByEmployeeNo(String employeeNo);
    boolean existsByEmail(String email);
    boolean existsByEmployeeNo(String employeeNo);
    void updateLoginFailCount(@Param("id") Long id,
                              @Param("count") int count,
                              @Param("lockedUntil") OffsetDateTime lockedUntil);
    void resetLoginFailCount(Long id);
    int countFollowers(Long userId);
    int countFollowing(Long userId);
    int countPosts(Long userId);
    void updateProfileBio(@Param("id") Long id, @Param("bio") String bio);
    void updateProfileImageUrl(@Param("id") Long id, @Param("profileImageUrl") String profileImageUrl);
    void updateDepartmentAndPosition(@Param("id") Long id,
                                     @Param("department") String department,
                                     @Param("position") String position);
    List<User> searchByName(@Param("keyword") String keyword);
    Optional<User> findByName(@Param("name") String name);
}
