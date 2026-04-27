package com.nt.sns.mention;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class MentionParserTest {

    private final MentionParser parser = new MentionParser();

    @Test
    void extract_singleMention() {
        List<String> result = parser.extractMentions("안녕하세요 @홍길동 님");
        assertThat(result).containsExactly("홍길동");
    }

    @Test
    void extract_multipleMentions() {
        List<String> result = parser.extractMentions("@alice 와 @bob 에게 알림");
        assertThat(result).containsExactlyInAnyOrder("alice", "bob");
    }

    @Test
    void extract_duplicate_deduplicates() {
        List<String> result = parser.extractMentions("@홍길동 @홍길동");
        assertThat(result).hasSize(1);
    }

    @Test
    void extract_noMention_returnsEmpty() {
        List<String> result = parser.extractMentions("멘션 없는 게시글");
        assertThat(result).isEmpty();
    }
}
