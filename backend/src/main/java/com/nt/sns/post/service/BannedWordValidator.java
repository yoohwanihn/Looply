package com.nt.sns.post.service;

import com.nt.sns.common.exception.BusinessException;
import com.nt.sns.common.exception.ErrorCode;
import com.nt.sns.post.mapper.BannedWordMapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BannedWordValidator {

    private final BannedWordMapper bannedWordMapper;

    public BannedWordValidator(BannedWordMapper bannedWordMapper) {
        this.bannedWordMapper = bannedWordMapper;
    }

    public void validate(String content) {
        if (content == null || content.isBlank()) return;
        List<String> words = bannedWordMapper.findAllWords();
        for (String word : words) {
            if (content.contains(word)) {
                throw new BusinessException(ErrorCode.BANNED_WORD_DETECTED);
            }
        }
    }
}
