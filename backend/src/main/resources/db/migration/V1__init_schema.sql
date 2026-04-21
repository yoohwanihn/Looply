-- =============================================
-- 사내 SNS 플랫폼 초기 스키마
-- Flyway V1 — 전체 테이블 생성
-- =============================================

-- ── 사용자 (SFR-001) ──────────────────────────
CREATE TABLE users (
    id                BIGSERIAL PRIMARY KEY,
    employee_no       VARCHAR(20)  UNIQUE NOT NULL,
    email             VARCHAR(100) UNIQUE NOT NULL,
    password_hash     VARCHAR(100) NOT NULL,
    name              VARCHAR(50)  NOT NULL,
    department        VARCHAR(100),
    position          VARCHAR(100),
    bio               VARCHAR(200),
    profile_image_url VARCHAR(500),
    role              VARCHAR(20)  NOT NULL DEFAULT 'USER',
    login_fail_count  INT          NOT NULL DEFAULT 0,
    locked_until      TIMESTAMP WITH TIME ZONE,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ── Refresh Token (SFR-001 AC-02) ────────────
CREATE TABLE refresh_tokens (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      VARCHAR(512) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ── 게시글 (SFR-002) ──────────────────────────
CREATE TABLE posts (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content       VARCHAR(300) NOT NULL,
    repost_of_id  BIGINT       REFERENCES posts(id) ON DELETE SET NULL,
    is_deleted    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE post_images (
    id            BIGSERIAL PRIMARY KEY,
    post_id       BIGINT       NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    image_url     VARCHAR(500) NOT NULL,
    display_order INT          NOT NULL DEFAULT 0
);

-- ── 좋아요 (SFR-004) ─────────────────────────
CREATE TABLE likes (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id    BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, post_id)
);

-- ── 댓글 (SFR-004) ───────────────────────────
CREATE TABLE comments (
    id         BIGSERIAL PRIMARY KEY,
    post_id    BIGINT       NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id    BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    VARCHAR(200) NOT NULL,
    is_deleted BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ── 팔로우 (SFR-006) ─────────────────────────
CREATE TABLE follows (
    id           BIGSERIAL PRIMARY KEY,
    follower_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- ── 멘션 (SFR-006) ───────────────────────────
CREATE TABLE mentions (
    id                BIGSERIAL PRIMARY KEY,
    post_id           BIGINT REFERENCES posts(id)    ON DELETE CASCADE,
    comment_id        BIGINT REFERENCES comments(id) ON DELETE CASCADE,
    mentioned_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL)
);

-- ── 해시태그 (SFR-007) ────────────────────────
CREATE TABLE hashtags (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(100) UNIQUE NOT NULL,
    usage_count  BIGINT       NOT NULL DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE post_hashtags (
    post_id    BIGINT NOT NULL REFERENCES posts(id)    ON DELETE CASCADE,
    hashtag_id BIGINT NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, hashtag_id)
);

-- ── 채널 (SFR-008) ───────────────────────────
CREATE TABLE channels (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    is_private  BOOLEAN      NOT NULL DEFAULT FALSE,
    owner_id    BIGINT       NOT NULL REFERENCES users(id),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE channel_members (
    id         BIGSERIAL PRIMARY KEY,
    channel_id BIGINT      NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id    BIGINT      NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    role       VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    joined_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (channel_id, user_id)
);

CREATE TABLE channel_join_requests (
    id           BIGSERIAL PRIMARY KEY,
    channel_id   BIGINT      NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id      BIGINT      NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ── 알림 (SFR-009) ───────────────────────────
CREATE TABLE notifications (
    id            BIGSERIAL PRIMARY KEY,
    recipient_id  BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id     BIGINT      REFERENCES users(id) ON DELETE SET NULL,
    type          VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id   BIGINT,
    is_read       BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ── 다이렉트 메시지 (SFR-010) ─────────────────
CREATE TABLE dm_rooms (
    id         BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE dm_room_members (
    id      BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES dm_rooms(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    UNIQUE (room_id, user_id)
);

CREATE TABLE dm_messages (
    id        BIGSERIAL PRIMARY KEY,
    room_id   BIGINT  NOT NULL REFERENCES dm_rooms(id) ON DELETE CASCADE,
    sender_id BIGINT  NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    content   TEXT    NOT NULL,
    is_read   BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ── 투표 (SFR-012) ───────────────────────────
CREATE TABLE polls (
    id        BIGSERIAL PRIMARY KEY,
    post_id   BIGINT       NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    question  VARCHAR(300) NOT NULL,
    closes_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE poll_options (
    id            BIGSERIAL PRIMARY KEY,
    poll_id       BIGINT       NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_text   VARCHAR(200) NOT NULL,
    display_order INT          NOT NULL DEFAULT 0
);

CREATE TABLE poll_votes (
    id        BIGSERIAL PRIMARY KEY,
    poll_id   BIGINT NOT NULL REFERENCES polls(id)         ON DELETE CASCADE,
    option_id BIGINT NOT NULL REFERENCES poll_options(id)  ON DELETE CASCADE,
    user_id   BIGINT NOT NULL REFERENCES users(id)         ON DELETE CASCADE,
    voted_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (poll_id, user_id)
);

-- ── 금칙어 / 신고 (SFR-013) ───────────────────
CREATE TABLE banned_words (
    id         BIGSERIAL PRIMARY KEY,
    word       VARCHAR(100) UNIQUE NOT NULL,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE reports (
    id            BIGSERIAL PRIMARY KEY,
    reporter_id   BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL,
    resource_id   BIGINT      NOT NULL,
    reason        VARCHAR(50) NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ── 인덱스 ───────────────────────────────────
CREATE INDEX idx_posts_user_id        ON posts(user_id);
CREATE INDEX idx_posts_created_at     ON posts(created_at DESC);
CREATE INDEX idx_likes_post_id        ON likes(post_id);
CREATE INDEX idx_comments_post_id     ON comments(post_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_notifications_recipient
    ON notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX idx_dm_messages_room_id  ON dm_messages(room_id, sent_at DESC);
CREATE INDEX idx_hashtags_name        ON hashtags(name);
CREATE INDEX idx_hashtags_last_used   ON hashtags(last_used_at DESC);
CREATE INDEX idx_refresh_tokens_user  ON refresh_tokens(user_id);
