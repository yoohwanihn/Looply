package com.nt.sns.mention;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Component
public class MentionParser {

    private static final Pattern MENTION_PATTERN = Pattern.compile("@([\\w가-힣]+)");

    public List<String> extractMentions(String content) {
        if (content == null || content.isBlank()) return List.of();
        Matcher matcher = MENTION_PATTERN.matcher(content);
        List<String> names = new ArrayList<>();
        while (matcher.find()) {
            names.add(matcher.group(1));
        }
        return names.stream().distinct().collect(Collectors.toList());
    }
}
