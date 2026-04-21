# 코어 소셜 설계 문서 (SFR-001~006)

**날짜:** 2026-04-21  
**범위:** 서브 프로젝트 1 — 코어 소셜  
**구현 방식:** 수직 슬라이스 (SFR 단위, 백엔드+프론트엔드 동시)

---

## 결정 사항

| 항목 | 결정 |
|---|---|
| 이미지 저장 | MinIO (S3 호환), 프론트 → 백엔드 → MinIO |
| HR 필드 | 회원가입 시 입력, 일반 수정 불가, ADMIN만 수정 가능 |
| 타임라인 페이지네이션 | 커서 기반 (lastPostId) |
| 구현 순서 | 수직 슬라이스 (SFR-001 → 006) |

---

## 인프라 추가

**MinIO** (`docker-compose.yml`)
- API 포트: `9100`, 콘솔 포트: `9101`
- 버킷: `sns-images` (게시글), `sns-avatars` (프로필)

**백엔드 패키지**
```
com.nt.sns/
├── post/        # SFR-002~005
├── follow/      # SFR-006
├── mention/     # SFR-006
└── storage/     # MinIO 공통
```

**프론트엔드 추가**
```
pages/  ProfileEditPage, PostDetailPage
components/  Compose, Comment, FollowButton, MentionInput
```

---

## SFR-001 — 계정/프로필 완성

- `PATCH /api/users/me/profile` — bio, profileImageUrl 수정
- `POST /api/users/me/avatar` — 프로필 사진 업로드 → MinIO sns-avatars
- `PATCH /api/admin/users/{id}` — 소속·직급 수정 (ADMIN only)
- 응답 DTO: id, name, department, position, bio, profileImageUrl, followerCount, followingCount, postCount (비밀번호 제외)

## SFR-002 — 게시글 작성/수정/삭제

- `POST /api/posts` — 본문 300자, 이미지 최대 4장(장당 10MB), multipart
- `PATCH /api/posts/{id}` — 본인만, isEdited+updatedAt 응답
- `DELETE /api/posts/{id}` — 본인/ADMIN, soft delete
- 금칙어 검사: BannedWordValidator (SFR-013 공유)
- 이미지 경로: `sns-images/{postId}/`

## SFR-003 — 실시간 타임라인

- `GET /api/posts/timeline?cursor={lastPostId}&size=20`
- 신규 게시물 → Redis Pub/Sub `channel:timeline:{userId}` → WebSocket `/queue/timeline`
- 프론트: Intersection Observer 무한 스크롤, 새 게시물 배너

## SFR-004 — 좋아요/댓글

- `POST/DELETE /api/posts/{id}/likes` — UNIQUE 제약, 중복 불가
- `POST /api/posts/{id}/comments` — 최대 200자
- `DELETE /api/comments/{id}` — 본인/ADMIN
- 프론트: Optimistic UI

## SFR-005 — 리포스트

- `POST /api/posts/{id}/repost` — 본인 게시물 불가
- `DELETE /api/posts/{id}/repost` — 취소
- 프론트: 원본 카드 중첩 표시

## SFR-006 — 팔로우/멘션

- `POST/DELETE /api/users/{id}/follow` — 자기 자신 불가
- `GET /api/users/search?q={keyword}` — 멘션 자동완성
- 게시글/댓글 저장 시 @username 파싱 → mentions 테이블
- 프론트: FollowButton, MentionInput 드롭다운

---

## 브랜치 계획

| 브랜치 | 내용 |
|---|---|
| feature/OP-004-minio-setup | MinIO 인프라 추가 |
| feature/OP-005-user-profile | SFR-001 프로필 완성 |
| feature/OP-006-post-crud | SFR-002 게시글 |
| feature/OP-007-timeline | SFR-003 타임라인 |
| feature/OP-008-likes-comments | SFR-004 좋아요/댓글 |
| feature/OP-009-repost | SFR-005 리포스트 |
| feature/OP-010-follow-mention | SFR-006 팔로우/멘션 |
