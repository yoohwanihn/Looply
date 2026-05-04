# 전체 코드 리팩토링 구현 계획서

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 중복 코드 제거·책임 분리·에러 표시 개선을 통해 유지보수성을 높인다.

**Architecture:** 공통 훅(useInfiniteScroll, useToast) → 백엔드 서비스 분리 및 Lombok 적용 → 프론트엔드 컴포넌트 분리 순서로 진행한다. 각 태스크는 독립적으로 동작하므로 개별 커밋 가능하다.

**Tech Stack:** React 19 + Vite / Spring Boot 3.5 + MyBatis / Lombok / CSS Modules

---

## 파일 구조

### 신규 생성
```
frontend/src/hooks/useInfiniteScroll.js
frontend/src/hooks/useToast.js
frontend/src/components/Toast/Toast.jsx
frontend/src/components/Toast/Toast.module.css
frontend/src/components/Post/PostHeader.jsx
frontend/src/components/Post/PostHeader.module.css
frontend/src/components/Post/PostActions.jsx
frontend/src/components/Post/PostActions.module.css
frontend/src/components/Post/PostEditForm.jsx
frontend/src/components/Post/PostEditForm.module.css
backend/src/main/java/com/nt/sns/post/service/PostImageService.java
```

### 수정
```
frontend/src/components/Sidebar/AppLayout.jsx   — useToast 추가, showToast Context 노출
frontend/src/components/Post/Post.jsx            — 서브컴포넌트 합성, alert→showToast
frontend/src/components/Post/Post.module.css     — 서브컴포넌트로 이전된 CSS 제거
frontend/src/components/FollowButton/FollowButton.jsx  — alert→showToast
frontend/src/components/Comment/Comment.jsx      — alert→showToast
frontend/src/pages/ProfileEditPage/ProfileEditPage.jsx — alert→showToast
frontend/src/pages/TimelinePage/TimelinePage.jsx — useInfiniteScroll 적용
frontend/src/pages/ProfilePage/ProfilePage.jsx   — useInfiniteScroll 적용
backend/build.gradle                             — Lombok 의존성 추가
backend/.../post/domain/Post.java                — Lombok 어노테이션
backend/.../post/domain/PostImage.java           — Lombok 어노테이션
backend/.../post/domain/Comment.java             — Lombok 어노테이션
backend/.../notification/domain/Notification.java — Lombok 어노테이션
backend/.../user/domain/User.java                — Lombok 어노테이션
backend/.../post/service/PostService.java        — PostImageService 위임
backend/.../exception/GlobalExceptionHandler.java — log.warn 추가
```

---

## Task 1: useInfiniteScroll 훅

**Files:**
- Create: `frontend/src/hooks/useInfiniteScroll.js`

- [ ] **Step 1: 파일 생성**

```js
// frontend/src/hooks/useInfiniteScroll.js
import { useCallback, useEffect, useRef, useState } from 'react'

const PAGE_SIZE = 20

export function useInfiniteScroll(fetchFn, deps = []) {
  const fetchFnRef = useRef(fetchFn)
  useEffect(() => { fetchFnRef.current = fetchFn })

  const [items, setItems] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const cursorRef = useRef(null)
  const loadingRef = useRef(false)
  const loaderRef = useRef(null)

  const load = useCallback(async (isReset) => {
    if (!isReset && loadingRef.current) return
    loadingRef.current = true
    try {
      const cursor = isReset ? null : cursorRef.current
      const arr = await fetchFnRef.current(cursor)
      const list = Array.isArray(arr) ? arr : []
      setItems(prev => isReset ? list : [...prev, ...list])
      if (list.length > 0) cursorRef.current = list[list.length - 1].id
      setHasMore(list.length === PAGE_SIZE)
    } catch (e) {
      console.error('[useInfiniteScroll]', e)
      if (isReset) setHasMore(false)
    } finally {
      loadingRef.current = false
    }
  }, [])

  // deps 변경 시 처음부터 다시 로드
  useEffect(() => {
    cursorRef.current = null
    setItems([])
    setHasMore(true)
    loadingRef.current = false
    load(true)
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingRef.current) load(false)
    }, { threshold: 0.1 })
    if (loaderRef.current) obs.observe(loaderRef.current)
    return () => obs.disconnect()
  }, [hasMore, load])

  const reset = useCallback(() => {
    cursorRef.current = null
    setItems([])
    setHasMore(true)
    loadingRef.current = false
    load(true)
  }, [load])

  return { items, hasMore, loaderRef, reset }
}
```

- [ ] **Step 2: 커밋**

```bash
cd /mnt/c/cmworld/sns-platform
git add frontend/src/hooks/useInfiniteScroll.js
git commit -m "feat(OP-028): useInfiniteScroll 커스텀 훅 추가"
```

---

## Task 2: useToast 훅 + Toast 컴포넌트 + AppContext 연결

**Files:**
- Create: `frontend/src/hooks/useToast.js`
- Create: `frontend/src/components/Toast/Toast.jsx`
- Create: `frontend/src/components/Toast/Toast.module.css`
- Modify: `frontend/src/components/Sidebar/AppLayout.jsx`

- [ ] **Step 1: useToast 훅 생성**

```js
// frontend/src/hooks/useToast.js
import { useCallback, useState } from 'react'

let idSeq = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info') => {
    const id = ++idSeq
    const duration = type === 'error' ? 5000 : 3000
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  return { toasts, showToast }
}
```

- [ ] **Step 2: Toast 컴포넌트 생성**

```jsx
// frontend/src/components/Toast/Toast.jsx
import styles from './Toast.module.css'

export default function Toast({ toasts }) {
  if (!toasts.length) return null
  return (
    <div className={styles.container}>
      {toasts.map(t => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Toast CSS 생성**

```css
/* frontend/src/components/Toast/Toast.module.css */
.container {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 9999;
  pointer-events: none;
}

.toast {
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background: #333;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  animation: fadeIn 0.2s ease;
  white-space: nowrap;
}

.success { background: #22c55e; }
.error   { background: #ef4444; }
.info    { background: #3b82f6; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 4: AppLayout.jsx 에 useToast 연결**

`frontend/src/components/Sidebar/AppLayout.jsx` 를 아래 내용으로 교체한다.

```jsx
// frontend/src/components/Sidebar/AppLayout.jsx
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Toast from '../Toast/Toast.jsx'
import { useToast } from '../../hooks/useToast.js'
import styles from './AppLayout.module.css'

const AppContext = createContext({
  hasNewTimeline: false,
  clearTimeline: () => {},
  unreadCount: 0,
  showToast: () => {},
})

export const useAppContext = () => useContext(AppContext)

export default function AppLayout({ children }) {
  const location = useLocation()
  const [hasNewTimeline, setHasNewTimeline] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const clientRef = useRef(null)
  const { toasts, showToast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    let cancelled = false
    const connect = async () => {
      try {
        const [{ Client }, { default: SockJS }] = await Promise.all([
          import('@stomp/stompjs'),
          import('sockjs-client'),
        ])
        if (cancelled) return
        const stompClient = new Client({
          webSocketFactory: () => new SockJS('/ws'),
          connectHeaders: { Authorization: `Bearer ${token}` },
          onConnect: () => {
            stompClient.subscribe('/user/queue/timeline', () => setHasNewTimeline(true))
            stompClient.subscribe('/user/queue/notifications', () => setUnreadCount(c => c + 1))
          },
          reconnectDelay: 5000,
        })
        stompClient.activate()
        clientRef.current = stompClient
      } catch (e) {
        console.error('[AppLayout] WebSocket connect', e)
      }
    }
    connect()
    return () => { cancelled = true; clientRef.current?.deactivate() }
  }, [])

  useEffect(() => {
    if (location.pathname === '/notifications') setUnreadCount(0)
  }, [location.pathname])

  const clearTimeline = () => setHasNewTimeline(false)

  return (
    <AppContext.Provider value={{ hasNewTimeline, clearTimeline, unreadCount, showToast }}>
      <div className={styles.layout}>
        <Sidebar unreadCount={unreadCount} />
        <main className={styles.main}>{children}</main>
      </div>
      <Toast toasts={toasts} />
    </AppContext.Provider>
  )
}
```

- [ ] **Step 5: 커밋**

```bash
cd /mnt/c/cmworld/sns-platform
git add frontend/src/hooks/useToast.js \
        frontend/src/components/Toast/ \
        frontend/src/components/Sidebar/AppLayout.jsx
git commit -m "feat(OP-028): Toast 컴포넌트 및 useToast 훅 추가, AppContext에 showToast 노출"
```

---

## Task 3: 백엔드 — GlobalExceptionHandler 로깅

**Files:**
- Modify: `backend/src/main/java/com/nt/sns/common/exception/GlobalExceptionHandler.java`

현재 `handleUnknown`에만 `log.error`가 있다. `BusinessException`(4xx)과 Validation 핸들러에 `log.warn`을 추가한다.

- [ ] **Step 1: BusinessException 핸들러에 log.warn 추가**

```java
// GlobalExceptionHandler.java — handleBusinessException 메서드를 아래로 교체
@ExceptionHandler(BusinessException.class)
public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException e) {
    log.warn("[BusinessException] {} {}", e.getErrorCode(), e.getMessage());
    return ResponseEntity
            .status(e.getErrorCode().getStatus())
            .body(ApiResponse.fail(e.getMessage()));
}
```

- [ ] **Step 2: MethodArgumentNotValidException 핸들러에 log.warn 추가**

```java
// GlobalExceptionHandler.java — handleValidation 메서드를 아래로 교체
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException e) {
    String message = e.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));
    log.warn("[Validation] {}", message);
    return ResponseEntity.badRequest().body(ApiResponse.fail(message));
}
```

- [ ] **Step 3: 커밋**

```bash
cd /mnt/c/cmworld/sns-platform
git add backend/src/main/java/com/nt/sns/common/exception/GlobalExceptionHandler.java
git commit -m "fix(OP-028): GlobalExceptionHandler에 BusinessException/Validation warn 로그 추가"
```

---

## Task 4: 백엔드 — Lombok 추가 및 도메인 클래스 적용

**Files:**
- Modify: `backend/build.gradle`
- Modify: `backend/src/main/java/com/nt/sns/post/domain/Post.java`
- Modify: `backend/src/main/java/com/nt/sns/post/domain/PostImage.java`
- Modify: `backend/src/main/java/com/nt/sns/post/domain/Comment.java`
- Modify: `backend/src/main/java/com/nt/sns/notification/domain/Notification.java`
- Modify: `backend/src/main/java/com/nt/sns/user/domain/User.java`

- [ ] **Step 1: build.gradle에 Lombok 의존성 추가**

`dependencies { }` 블록에 아래 4줄을 추가한다 (기존 의존성 끝부분, `testImplementation` 위):

```groovy
// Lombok
compileOnly 'org.projectlombok:lombok'
annotationProcessor 'org.projectlombok:lombok'
testCompileOnly 'org.projectlombok:lombok'
testAnnotationProcessor 'org.projectlombok:lombok'
```

- [ ] **Step 2: Post.java Lombok 적용**

기존 파일 내용을 아래로 완전 교체한다.

```java
package com.nt.sns.post.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
public class Post {
    private Long id;
    private Long userId;
    private String content;
    private Long repostOfId;
    private boolean deleted;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    private String userName;
    private String department;
    private String userProfileImageUrl;

    private int likeCount;
    private int commentCount;
    private int repostCount;
    private boolean likedByMe;
    private boolean repostedByMe;

    public boolean isEdited() {
        return createdAt != null && updatedAt != null && updatedAt.isAfter(createdAt);
    }
}
```

- [ ] **Step 3: PostImage.java Lombok 적용**

```java
package com.nt.sns.post.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PostImage {
    private Long id;
    private Long postId;
    private String imageUrl;
    private int displayOrder;
}
```

- [ ] **Step 4: Comment.java Lombok 적용**

```java
package com.nt.sns.post.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
public class Comment {
    private Long id;
    private Long postId;
    private Long userId;
    private String content;
    private boolean deleted;
    private OffsetDateTime createdAt;
    private String userName;
    private String userProfileImageUrl;
}
```

- [ ] **Step 5: Notification.java Lombok 적용**

```java
package com.nt.sns.notification.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class Notification {
    private Long id;
    private Long recipientId;
    private Long senderId;
    private String senderName;
    private String senderProfileImageUrl;
    private String type;
    private String resourceType;
    private Long resourceId;
    private boolean read;
    private LocalDateTime createdAt;
}
```

- [ ] **Step 6: User.java Lombok 적용**

```java
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
```

- [ ] **Step 7: 빌드 확인**

```bash
cd /mnt/c/cmworld/sns-platform/backend
./gradlew compileJava 2>&1 | tail -20
```

예상 출력: `BUILD SUCCESSFUL`

- [ ] **Step 8: 커밋**

```bash
cd /mnt/c/cmworld/sns-platform
git add backend/build.gradle \
        backend/src/main/java/com/nt/sns/post/domain/ \
        backend/src/main/java/com/nt/sns/notification/domain/Notification.java \
        backend/src/main/java/com/nt/sns/user/domain/User.java
git commit -m "refactor(OP-028): 도메인 클래스에 Lombok @Getter/@Setter/@NoArgsConstructor 적용"
```

---

## Task 5: 백엔드 — PostImageService 추출

**Files:**
- Create: `backend/src/main/java/com/nt/sns/post/service/PostImageService.java`
- Modify: `backend/src/main/java/com/nt/sns/post/service/PostService.java`

- [ ] **Step 1: PostImageService.java 생성**

```java
package com.nt.sns.post.service;

import com.nt.sns.common.exception.BusinessException;
import com.nt.sns.common.exception.ErrorCode;
import com.nt.sns.post.domain.PostImage;
import com.nt.sns.post.mapper.PostMapper;
import com.nt.sns.storage.StorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class PostImageService {

    private static final String BUCKET = "sns-images";
    private static final int MAX_IMAGES = 4;
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    private final PostMapper postMapper;
    private final StorageService storageService;

    public PostImageService(PostMapper postMapper, StorageService storageService) {
        this.postMapper = postMapper;
        this.storageService = storageService;
    }

    public void uploadImages(Long postId, List<MultipartFile> images) {
        List<MultipartFile> valid = images.stream()
                .filter(f -> f != null && !f.isEmpty()).toList();
        if (valid.size() > MAX_IMAGES) {
            throw new BusinessException(ErrorCode.INVALID_INPUT);
        }
        for (int i = 0; i < valid.size(); i++) {
            MultipartFile file = valid.get(i);
            try {
                String contentType = file.getContentType();
                if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
                    throw new BusinessException(ErrorCode.INVALID_INPUT);
                }
                String ext = Optional.ofNullable(file.getOriginalFilename())
                        .filter(n -> n.contains("."))
                        .map(n -> n.substring(n.lastIndexOf('.')))
                        .orElse("");
                String objectName = postId + "/" + i + "_" + UUID.randomUUID() + ext;
                String url = storageService.upload(BUCKET, objectName,
                        file.getInputStream(), file.getSize(), contentType);
                PostImage img = new PostImage();
                img.setPostId(postId);
                img.setImageUrl(url);
                img.setDisplayOrder(i);
                postMapper.insertImage(img);
            } catch (BusinessException e) {
                throw e;
            } catch (Exception e) {
                throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED);
            }
        }
    }

    public void deleteImages(Long postId) {
        List<String> urls = postMapper.findImageUrls(postId);
        for (String url : urls) {
            String objectName = url.substring(url.indexOf(BUCKET) + BUCKET.length() + 1);
            try {
                storageService.delete(BUCKET, objectName);
            } catch (Exception ignored) {}
        }
    }
}
```

- [ ] **Step 2: PostService.java 수정 — 이미지 처리 코드를 PostImageService에 위임**

PostService 에서 아래 변경을 적용한다.

**2a. 클래스 상단의 이미지 관련 상수 3개 제거:**
```java
// 제거할 코드
private static final String BUCKET_IMAGES = "sns-images";
private static final int MAX_IMAGES = 4;
private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
    "image/jpeg", "image/png", "image/gif", "image/webp"
);
```

**2b. 생성자에 `PostImageService` 추가, `StorageService` 제거:**
```java
// 필드
private final PostMapper postMapper;
private final BannedWordValidator bannedWordValidator;
private final PostImageService postImageService;
private final TimelinePublisher timelinePublisher;
private final MentionParser mentionParser;
private final MentionMapper mentionMapper;
private final UserMapper userMapper;

// 생성자
public PostService(PostMapper postMapper,
                   BannedWordValidator bannedWordValidator,
                   PostImageService postImageService,
                   TimelinePublisher timelinePublisher,
                   MentionParser mentionParser,
                   MentionMapper mentionMapper,
                   UserMapper userMapper) {
    this.postMapper = postMapper;
    this.bannedWordValidator = bannedWordValidator;
    this.postImageService = postImageService;
    this.timelinePublisher = timelinePublisher;
    this.mentionParser = mentionParser;
    this.mentionMapper = mentionMapper;
    this.userMapper = userMapper;
}
```

**2c. `createPost` 내 이미지 블록 교체:**
```java
// 교체 전 (이미지 업로드 for 루프 전체)
if (images != null && !images.isEmpty()) {
    // ... (기존 이미지 업로드 코드 60줄)
}

// 교체 후
if (images != null && !images.isEmpty()) {
    postImageService.uploadImages(post.getId(), images);
}
```

**2d. `deletePost` 내 이미지 삭제 코드 교체:**
```java
// 교체 전
List<String> imageUrls = postMapper.findImageUrls(postId);
for (String url : imageUrls) {
    String objectName = url.substring(url.indexOf(BUCKET_IMAGES) + BUCKET_IMAGES.length() + 1);
    try { storageService.delete(BUCKET_IMAGES, objectName); } catch (Exception ignored) {}
}

// 교체 후
postImageService.deleteImages(postId);
```

**2e. `import` 정리:** `StorageService` import 및 `Set` import 제거 (Set이 다른 곳에서 사용되지 않는지 확인 후 제거)

- [ ] **Step 3: 빌드 확인**

```bash
cd /mnt/c/cmworld/sns-platform/backend
./gradlew compileJava 2>&1 | tail -20
```

예상 출력: `BUILD SUCCESSFUL`

- [ ] **Step 4: 커밋**

```bash
cd /mnt/c/cmworld/sns-platform
git add backend/src/main/java/com/nt/sns/post/service/
git commit -m "refactor(OP-028): PostImageService 추출 - 이미지 업로드/삭제 책임 분리"
```

---

## Task 6: 프론트엔드 — Post.jsx 분리

**Files:**
- Create: `frontend/src/components/Post/PostHeader.jsx`
- Create: `frontend/src/components/Post/PostHeader.module.css`
- Create: `frontend/src/components/Post/PostActions.jsx`
- Create: `frontend/src/components/Post/PostActions.module.css`
- Create: `frontend/src/components/Post/PostEditForm.jsx`
- Create: `frontend/src/components/Post/PostEditForm.module.css`
- Modify: `frontend/src/components/Post/Post.jsx`
- Modify: `frontend/src/components/Post/Post.module.css`

- [ ] **Step 1: PostHeader.jsx 생성**

```jsx
// frontend/src/components/Post/PostHeader.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { relativeTime } from '../../utils/time.js'
import styles from './PostHeader.module.css'

function MoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  )
}

export default function PostHeader({ post, isOwner, onEditClick, onDeleteClick }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleEdit = (e) => {
    e.stopPropagation()
    setMenuOpen(false)
    onEditClick()
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    setMenuOpen(false)
    onDeleteClick()
  }

  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <Link to={`/profile/${post.userId}`} className={styles.name} onClick={e => e.stopPropagation()}>
          {post.userName}
        </Link>
        {post.department && <span className={styles.dept}>{post.department}</span>}
        <span className={styles.time}>{relativeTime(post.createdAt)}</span>
      </div>
      {isOwner && (
        <div className={styles.menuWrap} onClick={e => e.stopPropagation()}>
          <button className={styles.menuBtn} onClick={() => setMenuOpen(v => !v)}>
            <MoreIcon />
          </button>
          {menuOpen && (
            <div className={styles.menuDropdown}>
              {!post.originalPost && (
                <button className={styles.menuItem} onClick={handleEdit}>수정</button>
              )}
              <button className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={handleDelete}>
                삭제
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: PostHeader.module.css 생성**

```css
/* frontend/src/components/Post/PostHeader.module.css */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.headerLeft {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
  min-width: 0;
}

.name {
  font-weight: 600;
  font-size: 15px;
  color: var(--text);
  flex-shrink: 0;
}

.name:hover {
  text-decoration: underline;
  text-decoration-color: var(--text-muted);
}

.dept {
  font-size: 13px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.time {
  font-size: 13px;
  color: var(--text-secondary);
}

.menuWrap {
  position: relative;
  flex-shrink: 0;
}

.menuBtn {
  background: none;
  border: none;
  color: var(--text-secondary);
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s, background 0.15s;
}

.menuBtn:hover {
  color: var(--text);
  background: var(--bg-surface);
}

.menuDropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  z-index: 50;
  min-width: 120px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
}

.menuItem {
  display: block;
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  background: none;
  border: none;
  font-size: 14px;
  color: var(--text);
  font-weight: 500;
  transition: background 0.1s;
}

.menuItem:hover { background: var(--bg-surface); }

.menuItemDanger { color: var(--accent-like); }
```

- [ ] **Step 3: PostActions.jsx 생성**

```jsx
// frontend/src/components/Post/PostActions.jsx
import { useNavigate } from 'react-router-dom'
import styles from './PostActions.module.css'

function HeartIcon({ filled }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function RepostIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

export default function PostActions({
  post, liked, likeCount, likeLoading,
  reposted, repostCount, repostLoading,
  isOwner, onLike, onRepost,
}) {
  const navigate = useNavigate()

  return (
    <div className={styles.actions}>
      <button
        className={`${styles.action} ${liked ? styles.liked : ''}`}
        onClick={onLike}
        disabled={likeLoading}
        aria-label="좋아요"
      >
        <HeartIcon filled={liked} />
        {likeCount > 0 && <span>{likeCount}</span>}
      </button>
      <button
        className={styles.action}
        onClick={e => { e.stopPropagation(); navigate(`/posts/${post.id}`) }}
        aria-label="댓글"
      >
        <CommentIcon />
        {(post.commentCount ?? 0) > 0 && <span>{post.commentCount}</span>}
      </button>
      {!post.originalPost && !isOwner && (
        <button
          className={`${styles.action} ${reposted ? styles.reposted : ''}`}
          onClick={onRepost}
          disabled={repostLoading}
          aria-label="리포스트"
        >
          <RepostIcon />
          {repostCount > 0 && <span>{repostCount}</span>}
        </button>
      )}
      {!post.originalPost && isOwner && (
        <span className={`${styles.action} ${styles.actionDisabled}`}>
          <RepostIcon />
          {repostCount > 0 && <span>{repostCount}</span>}
        </span>
      )}
    </div>
  )
}
```

- [ ] **Step 4: PostActions.module.css 생성**

```css
/* frontend/src/components/Post/PostActions.module.css */
.actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
}

.action {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text-secondary);
  transition: color 0.15s, background 0.15s;
}

.action:hover {
  color: var(--text);
  background: var(--bg-surface);
}

.liked { color: var(--accent-like); }
.liked:hover { color: var(--accent-like); }
.reposted { color: var(--accent-repost); }
.reposted:hover { color: var(--accent-repost); }
.actionDisabled { opacity: 0.3; cursor: default; pointer-events: none; }
```

- [ ] **Step 5: PostEditForm.jsx 생성**

```jsx
// frontend/src/components/Post/PostEditForm.jsx
import styles from './PostEditForm.module.css'

export default function PostEditForm({ content, onChange, onSave, onCancel, saving }) {
  return (
    <div className={styles.editForm} onClick={e => e.stopPropagation()}>
      <textarea
        className={styles.editTextarea}
        value={content}
        onChange={e => onChange(e.target.value.slice(0, 300))}
        rows={3}
        autoFocus
      />
      <div className={styles.editActions}>
        <button className={styles.editCancel} onClick={e => { e.stopPropagation(); onCancel() }}>
          취소
        </button>
        <button
          className={styles.editSave}
          onClick={e => { e.stopPropagation(); onSave(content) }}
          disabled={!content.trim() || saving}
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: PostEditForm.module.css 생성**

```css
/* frontend/src/components/Post/PostEditForm.module.css */
.editForm { margin-bottom: 8px; }

.editTextarea {
  width: 100%;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  font-size: 15px;
  color: var(--text);
  resize: none;
  outline: none;
  line-height: 1.6;
  transition: border-color 0.15s;
}

.editTextarea:focus { border-color: var(--text-secondary); }

.editActions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.editCancel {
  padding: 6px 16px;
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  transition: border-color 0.15s, color 0.15s;
}

.editCancel:hover { border-color: var(--text-secondary); color: var(--text); }

.editSave {
  padding: 6px 16px;
  background: var(--text);
  border: none;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
  color: var(--bg);
  transition: opacity 0.15s;
}

.editSave:disabled { opacity: 0.4; cursor: not-allowed; }
```

- [ ] **Step 7: Post.jsx 교체 (서브컴포넌트 합성 + alert→showToast)**

```jsx
// frontend/src/components/Post/Post.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { likePost, unlikePost, deletePost, repost, undoRepost, updatePost } from '../../api/posts.js'
import { useAppContext } from '../Sidebar/AppLayout.jsx'
import PostHeader from './PostHeader.jsx'
import PostActions from './PostActions.jsx'
import PostEditForm from './PostEditForm.jsx'
import PostContent from '../PostContent/PostContent.jsx'
import ImageLightbox from '../ImageLightbox/ImageLightbox.jsx'
import styles from './Post.module.css'

export default function Post({ post, onUpdate, onDelete, showComments }) {
  const navigate = useNavigate()
  const { showToast } = useAppContext()
  const [liked, setLiked] = useState(post.likedByMe ?? false)
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0)
  const [likeLoading, setLikeLoading] = useState(false)
  const [reposted, setReposted] = useState(post.repostedByMe ?? false)
  const [repostCount, setRepostCount] = useState(post.repostCount ?? 0)
  const [repostLoading, setRepostLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content ?? '')
  const [saving, setSaving] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const myId = Number(localStorage.getItem('userId'))
  const isOwner = post.userId === myId
  const hasThreadLine = showComments || (post.commentCount ?? 0) > 0

  const toggleLike = async (e) => {
    e.stopPropagation()
    if (likeLoading) return
    setLikeLoading(true)
    try {
      if (liked) { await unlikePost(post.id); setLikeCount(c => c - 1) }
      else { await likePost(post.id); setLikeCount(c => c + 1) }
      setLiked(v => !v)
    } catch (e) {
      console.error('[Post] toggleLike', e)
    } finally { setLikeLoading(false) }
  }

  const handleDelete = async () => {
    if (!confirm('삭제하시겠습니까?')) return
    try {
      await deletePost(post.id)
      if (onDelete) onDelete()
      else if (onUpdate) onUpdate()
    } catch (e) {
      console.error('[Post] delete', e)
      showToast('게시글 삭제에 실패했습니다.', 'error')
    }
  }

  const handleEditSave = async (content) => {
    if (!content.trim() || saving) return
    setSaving(true)
    try {
      await updatePost(post.id, content)
      setEditing(false)
      setEditContent(content)
      if (onUpdate) onUpdate()
    } catch (e) {
      console.error('[Post] editSave', e)
      showToast('수정에 실패했습니다.', 'error')
    } finally { setSaving(false) }
  }

  const handleRepost = async (e) => {
    e.stopPropagation()
    if (repostLoading) return
    setRepostLoading(true)
    try {
      if (reposted) { await undoRepost(post.id); setRepostCount(c => c - 1) }
      else { await repost(post.id); setRepostCount(c => c + 1) }
      setReposted(v => !v)
      if (onUpdate) onUpdate()
    } catch (e) {
      console.error('[Post] repost', e)
    } finally { setRepostLoading(false) }
  }

  return (
    <article className={styles.post} onClick={() => !showComments && navigate(`/posts/${post.id}`)}>
      <div className={styles.leftCol}>
        <Link to={`/profile/${post.userId}`} className={styles.avatar} onClick={e => e.stopPropagation()}>
          {post.profileImageUrl
            ? <img src={post.profileImageUrl} alt={post.userName} />
            : <span>{post.userName?.[0]?.toUpperCase() ?? '?'}</span>}
        </Link>
        {hasThreadLine && <div className={styles.threadLine} />}
      </div>

      <div className={styles.rightCol}>
        {post.originalPost && <div className={styles.repostBadge}>리포스트</div>}

        <PostHeader
          post={post}
          isOwner={isOwner}
          onEditClick={() => { setEditing(true); setEditContent(post.content ?? '') }}
          onDeleteClick={handleDelete}
        />

        {post.originalPost ? (
          <div className={styles.originalCard}>
            <div className={styles.originalMeta}>
              <strong>{post.originalPost.userName}</strong>
              {post.originalPost.department && <span>{post.originalPost.department}</span>}
            </div>
            <p className={styles.originalContent}>{post.originalPost.content}</p>
          </div>
        ) : editing ? (
          <PostEditForm
            content={editContent}
            onChange={setEditContent}
            onSave={handleEditSave}
            onCancel={() => setEditing(false)}
            saving={saving}
          />
        ) : (
          <>
            <PostContent content={post.content} className={styles.content} />
            {post.isEdited && <span className={styles.edited}>수정됨</span>}
            {post.imageUrls?.length > 0 && (
              <div className={`${styles.images} ${post.imageUrls.length === 1 ? styles.imagesSingle : ''}`}>
                {post.imageUrls.map((url, i) => (
                  <img key={url} src={url} alt={`이미지 ${i + 1}`} className={styles.image}
                    onClick={e => { e.stopPropagation(); setLightboxIndex(i) }} />
                ))}
              </div>
            )}
            {lightboxIndex !== null && (
              <ImageLightbox
                images={post.imageUrls}
                index={lightboxIndex}
                onClose={() => setLightboxIndex(null)}
                onPrev={() => setLightboxIndex(i => i - 1)}
                onNext={() => setLightboxIndex(i => i + 1)}
              />
            )}
          </>
        )}

        <PostActions
          post={post}
          liked={liked}
          likeCount={likeCount}
          likeLoading={likeLoading}
          reposted={reposted}
          repostCount={repostCount}
          repostLoading={repostLoading}
          isOwner={isOwner}
          onLike={toggleLike}
          onRepost={handleRepost}
        />
      </div>
    </article>
  )
}
```

- [ ] **Step 8: Post.module.css 에서 서브컴포넌트로 이전된 클래스 제거**

Post.module.css 에서 아래 클래스들을 삭제한다 (각 서브컴포넌트 CSS로 이전됨):

삭제 대상: `.header`, `.headerLeft`, `.name`, `.name:hover`, `.dept`, `.time`, `.menuWrap`, `.menuBtn`, `.menuBtn:hover`, `.menuDropdown`, `.menuItem`, `.menuItem:hover`, `.menuItemDanger`, `.actions`, `.action`, `.action:hover`, `.liked`, `.liked:hover`, `.reposted`, `.reposted:hover`, `.actionDisabled`, `.editForm`, `.editTextarea`, `.editTextarea:focus`, `.editActions`, `.editCancel`, `.editCancel:hover`, `.editSave`, `.editSave:disabled`

유지 대상: `.post`, `.post:hover`, `.leftCol`, `.avatar`, `.avatar img`, `.threadLine`, `.rightCol`, `.repostBadge`, `.content`, `.edited`, `.images`, `.imagesSingle`, `.image`, `.imagesSingle .image`, `.originalCard`, `.originalMeta`, `.originalMeta strong`, `.originalContent`

- [ ] **Step 9: 커밋**

```bash
cd /mnt/c/cmworld/sns-platform
git add frontend/src/components/Post/
git commit -m "refactor(OP-028): Post.jsx를 PostHeader/PostActions/PostEditForm으로 분리"
```

---

## Task 7: 프론트엔드 — useInfiniteScroll 적용 (Timeline, Profile)

**Files:**
- Modify: `frontend/src/pages/TimelinePage/TimelinePage.jsx`
- Modify: `frontend/src/pages/ProfilePage/ProfilePage.jsx`

> **Note:** NotificationsPage는 size 파라미터만 있고 cursor 기반 페이지네이션이 없으므로 적용 제외.

- [ ] **Step 1: TimelinePage.jsx 교체**

```jsx
// frontend/src/pages/TimelinePage/TimelinePage.jsx
import { useState } from 'react'
import { createPost, getAllPosts } from '../../api/posts.js'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll.js'
import Post from '../../components/Post/Post.jsx'
import MentionInput from '../../components/MentionInput/MentionInput.jsx'
import { useAppContext } from '../../components/Sidebar/AppLayout.jsx'
import styles from './TimelinePage.module.css'

const MAX_LENGTH = 300

export default function TimelinePage() {
  const { hasNewTimeline, clearTimeline, showToast } = useAppContext()
  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const fetchFn = async (cursor) => {
    const res = await getAllPosts(cursor)
    return Array.isArray(res) ? res : (res?.data ?? [])
  }

  const { items: posts, hasMore, loaderRef, reset } = useInfiniteScroll(fetchFn, [])

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files).slice(0, 4))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || submitting) return
    setSubmitting(true)
    try {
      await createPost(content, images)
      setContent('')
      setImages([])
      clearTimeline()
      reset()
    } catch (e) {
      console.error('[TimelinePage] createPost', e)
      showToast('게시글 등록에 실패했습니다.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <form className={styles.compose} onSubmit={handleSubmit}>
          <div className={styles.composeAvatar}>나</div>
          <div className={styles.composeRight}>
            <MentionInput
              value={content}
              onChange={setContent}
              placeholder="새로운 스레드 작성하기..."
              maxLength={300}
              rows={3}
            />
            <div className={styles.composeFooter}>
              <label className={styles.imageLabel}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                {images.length > 0 && <span className={styles.imageCount}>{images.length}장</span>}
                <input type="file" accept="image/*" multiple hidden onChange={handleImageChange} />
              </label>
              <span className={`${styles.charCount} ${content.length >= MAX_LENGTH ? styles.limit : ''}`}>
                {content.length}/{MAX_LENGTH}
              </span>
              <button className={styles.postButton} disabled={!content.trim() || submitting}>
                게시
              </button>
            </div>
          </div>
        </form>

        {hasNewTimeline && (
          <button className={styles.newBanner} onClick={() => { clearTimeline(); reset() }}>
            새 게시물 보기
          </button>
        )}

        <div className={styles.feed}>
          {posts.map(post => (
            <Post key={post.id} post={post} onUpdate={reset} />
          ))}
          <div ref={loaderRef} className={styles.loader}>
            {hasMore ? '불러오는 중...' : '모든 게시물을 확인했습니다.'}
          </div>
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: ProfilePage.jsx 교체**

```jsx
// frontend/src/pages/ProfilePage/ProfilePage.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProfile, getUserPosts } from '../../api/users.js'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll.js'
import FollowButton from '../../components/FollowButton/FollowButton.jsx'
import Post from '../../components/Post/Post.jsx'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(false)
  const myId = localStorage.getItem('userId')

  const fetchFn = async (cursor) => {
    const data = await getUserPosts(id, cursor)
    return Array.isArray(data) ? data : (data?.data ?? [])
  }

  const { items: posts, hasMore, loaderRef, reset } = useInfiniteScroll(fetchFn, [id])

  const handleFollowToggle = (nowFollowing) => {
    setProfile(prev => prev ? {
      ...prev,
      followerCount: prev.followerCount + (nowFollowing ? 1 : -1),
      isFollowing: nowFollowing,
    } : prev)
  }

  useEffect(() => {
    setError(false)
    setProfile(null)
    getProfile(id).then(res => setProfile(res)).catch(() => setError(true))
  }, [id])

  if (error) return <div className={styles.error}>프로필을 불러올 수 없습니다.</div>
  if (!profile) return <div className={styles.loading}>불러오는 중...</div>

  return (
    <div className={styles.container}>
      <div className={styles.backHeader}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span style={{ fontSize: 17, fontWeight: 700 }}>{profile.name}</span>
      </div>

      <div className={styles.card}>
        <div className={styles.topRow}>
          <div>
            <h2 className={styles.name}>{profile.name}</h2>
            <p className={styles.dept}>{profile.department}{profile.position ? ` · ${profile.position}` : ''}</p>
          </div>
          <div className={styles.avatar}>
            {profile.profileImageUrl
              ? <img src={profile.profileImageUrl} alt={profile.name} />
              : <span>{profile.name?.[0] ?? '?'}</span>}
          </div>
        </div>

        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

        <div className={styles.stats}>
          <div className={styles.stat}><strong>{profile.followerCount ?? 0}</strong><span>팔로워</span></div>
          <div className={styles.stat}><strong>{profile.followingCount ?? 0}</strong><span>팔로잉</span></div>
          <div className={styles.stat}><strong>{profile.postCount ?? 0}</strong><span>게시글</span></div>
        </div>

        <div style={{ marginTop: 16 }}>
          {String(myId) === String(id)
            ? <button className={styles.editBtn} onClick={() => navigate('/profile/edit')}>프로필 수정</button>
            : <FollowButton targetId={Number(id)} initialFollowing={profile.isFollowing ?? false} onToggle={handleFollowToggle} />}
        </div>
      </div>

      <div className={styles.postsSection}>
        <div className={styles.postsSectionHeader}>게시글</div>
        <div className={styles.postsList}>
          {posts.map(post => (
            <Post key={post.id} post={post} onUpdate={reset} />
          ))}
        </div>
        <div ref={loaderRef} className={styles.postsLoader}>
          {hasMore
            ? (posts.length > 0 ? '불러오는 중...' : '')
            : posts.length === 0 ? '게시글이 없습니다.' : '모든 게시글을 확인했습니다.'}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 커밋**

```bash
cd /mnt/c/cmworld/sns-platform
git add frontend/src/pages/TimelinePage/TimelinePage.jsx \
        frontend/src/pages/ProfilePage/ProfilePage.jsx
git commit -m "refactor(OP-028): TimelinePage/ProfilePage에 useInfiniteScroll 적용"
```

---

## Task 8: 프론트엔드 — 나머지 alert() 교체 + 빈 catch 블록 제거

**Files:**
- Modify: `frontend/src/components/FollowButton/FollowButton.jsx`
- Modify: `frontend/src/components/Comment/Comment.jsx`
- Modify: `frontend/src/pages/ProfileEditPage/ProfileEditPage.jsx`

- [ ] **Step 1: FollowButton.jsx — alert 교체**

```jsx
// frontend/src/components/FollowButton/FollowButton.jsx
import { useState } from 'react'
import { follow, unfollow } from '../../api/follows.js'
import { useAppContext } from '../Sidebar/AppLayout.jsx'
import styles from './FollowButton.module.css'

export default function FollowButton({ targetId, initialFollowing, onToggle }) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)
  const { showToast } = useAppContext()

  const handleClick = async () => {
    if (loading) return
    setLoading(true)
    const prev = following
    try {
      if (following) await unfollow(targetId)
      else await follow(targetId)
      setFollowing(v => !v)
      if (onToggle) onToggle(!prev)
    } catch (e) {
      console.error('[FollowButton]', e)
      showToast(prev ? '언팔로우에 실패했습니다.' : '팔로우에 실패했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      className={`${styles.btn} ${following ? styles.following : ''}`}
      onClick={handleClick}
      disabled={loading}
    >
      {following ? '팔로잉' : '팔로우'}
    </button>
  )
}
```

- [ ] **Step 2: Comment.jsx — alert 교체**

`Comment.jsx` 파일을 열어 `alert('댓글 삭제에 실패했습니다.')` 를 아래와 같이 교체한다.

```jsx
// 파일 상단 import 추가
import { useAppContext } from '../Sidebar/AppLayout.jsx'

// 컴포넌트 안에 추가
const { showToast } = useAppContext()

// catch 블록 교체
} catch (e) {
  console.error('[Comment] delete', e)
  showToast('댓글 삭제에 실패했습니다.', 'error')
}
```

- [ ] **Step 3: ProfileEditPage.jsx — 3개 alert 교체**

`ProfileEditPage.jsx` 를 아래 내용으로 교체한다. (`URL.revokeObjectURL` cleanup 은 이미 구현됨)

```jsx
// frontend/src/pages/ProfileEditPage/ProfileEditPage.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyProfile, updateProfile, uploadAvatar } from '../../api/users.js'
import { useAppContext } from '../../components/Sidebar/AppLayout.jsx'
import styles from './ProfileEditPage.module.css'

export default function ProfileEditPage() {
  const navigate = useNavigate()
  const { showToast } = useAppContext()
  const [bio, setBio] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getMyProfile().then(res => setBio(res?.bio ?? '')).catch(e => console.error('[ProfileEditPage] load', e))
  }, [])

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드할 수 있습니다.', 'error')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('파일 크기는 5MB 이하여야 합니다.', 'error')
      return
    }
    setAvatarFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (avatarFile) await uploadAvatar(avatarFile)
      await updateProfile({ bio })
      navigate(-1)
    } catch (e) {
      console.error('[ProfileEditPage] save', e)
      showToast('저장에 실패했습니다.', 'error')
    } finally {
      setSaving(false)
    }
  }
```

(나머지 JSX 반환 부분은 기존과 동일하게 유지)

- [ ] **Step 4: 커밋**

```bash
cd /mnt/c/cmworld/sns-platform
git add frontend/src/components/FollowButton/FollowButton.jsx \
        frontend/src/components/Comment/Comment.jsx \
        frontend/src/pages/ProfileEditPage/ProfileEditPage.jsx
git commit -m "refactor(OP-028): 모든 alert() → showToast 교체, 빈 catch 블록에 console.error 추가"
```

---

## Self-Review Checklist

### Spec 커버리지 점검

| 설계 요구사항 | 담당 태스크 |
|---|---|
| useInfiniteScroll 훅 | Task 1 |
| Toast + useToast | Task 2 |
| AppContext에 showToast 노출 | Task 2 |
| GlobalExceptionHandler log.warn | Task 3 |
| Lombok 도메인 클래스 | Task 4 |
| PostImageService 추출 | Task 5 |
| Post.jsx 분리 (Header/Actions/EditForm) | Task 6 |
| Timeline/Profile에 훅 적용 | Task 7 |
| alert() 전체 교체 | Task 8 |
| 빈 catch 블록 제거 | Task 8 + Task 6 (Post.jsx) |

**누락 항목:** 없음

### 타입/시그니처 일관성

- `useInfiniteScroll` 반환: `{ items, hasMore, loaderRef, reset }` — Task 7에서 동일하게 사용 ✓
- `showToast(message, type)` — Task 2 정의, Task 6/7/8에서 동일하게 호출 ✓
- `PostHeader` props: `{ post, isOwner, onEditClick, onDeleteClick }` — Task 6 정의, Task 6 Step 7 호출 ✓
- `PostActions` props: `{ post, liked, likeCount, likeLoading, reposted, repostCount, repostLoading, isOwner, onLike, onRepost }` — Task 6 정의, Task 6 Step 7 호출 ✓
- `PostEditForm` props: `{ content, onChange, onSave, onCancel, saving }` — Task 6 정의, Task 6 Step 7 호출 ✓
- `PostImageService.uploadImages(postId, images)` — Task 5 정의, Task 5 Step 2 호출 ✓

---

## 실행 방법 선택

**계획서가 `docs/superpowers/plans/2026-05-04-refactoring.md` 에 저장되었습니다. 실행 방식을 선택하세요:**

**1. Subagent-Driven (권장)** — 태스크마다 새 서브에이전트를 디스패치, 완료 후 검토

**2. Inline Execution** — 현재 세션에서 executing-plans 스킬 사용
