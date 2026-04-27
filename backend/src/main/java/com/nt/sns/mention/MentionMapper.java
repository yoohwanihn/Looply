package com.nt.sns.mention;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MentionMapper {
    void insertPostMention(@Param("postId") Long postId, @Param("mentionedUserId") Long mentionedUserId);
    void insertCommentMention(@Param("commentId") Long commentId, @Param("mentionedUserId") Long mentionedUserId);
    void deleteByPostId(Long postId);
}
