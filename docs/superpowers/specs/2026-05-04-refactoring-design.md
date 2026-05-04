# 전체 코드 리팩토링 설계서

**날짜:** 2026-05-04  
**브랜치:** feature/OP-028-refactoring  
**목표:** 패턴 개선을 포함한 프론트엔드·백엔드 계층별 리팩토링

---

## 배경

OP-001 ~ OP-027에 걸쳐 기능을 빠르게 추가하면서 아래 문제점이 누적되었다.

- 3개 페이지(Timeline, Profile, Notifications)에 동일한 IntersectionObserver + cursor 패턴이 복제됨
- `alert()` 호출이 컴포넌트 곳곳에 산재, 브라우저 블로킹 UI 사용 중
- `catch (_) {}` 빈 블록으로 에러를 전부 삭제
- `Post.jsx`가 헤더·본문·이미지·액션·수정폼 모든 역할을 수행 (600줄+)
- `PostService.java`가 이미지 업로드 책임까지 겸임 (SRP 위반)
- 도메인 클래스에 수동 getter/setter/constructor 보일러플레이트
- `GlobalExceptionHandler`가 예외를 잡고도 로그를 남기지 않음

---

## 접근 방식

**계층별 순서 (Layer-by-layer):** 공통 유틸 → 백엔드 → 프론트엔드  
각 계층은 이전 계층 완료 후 진행한다. 패턴 개선을 함께 적용한다.

---

## Section 1 — 공통 유틸 / 횡단 관심사

### 1-1. `useInfiniteScroll` 커스텀 훅

**파일:** `frontend/src/hooks/useInfiniteScroll.js`

**인터페이스:**
```js
const { loaderRef, items, hasMore, reset } = useInfiniteScroll(fetchFn, deps)
```

| 파라미터 | 설명 |
|---------|------|
| `fetchFn(cursor)` | cursor를 받아 `Array` 반환하는 async 함수. 반환 배열 길이가 `pageSize`(기본 20)와 같으면 hasMore=true |
| `deps` | fetchFn이 의존하는 값 배열 (deps 변경 시 자동 reset) |

**내부 책임:**
- `IntersectionObserver` 생성·해제
- `loadingMoreRef`로 중복 호출 방지
- `cursor` 상태 관리
- `reset()` 함수 노출

**제거 대상:** Timeline, Profile, Notifications 각 페이지의 동일 구현 (~70줄 × 3)

### 1-2. `Toast` 컴포넌트

**파일:** `frontend/src/components/Toast/Toast.jsx`, `Toast.module.css`  
**훅:** `frontend/src/hooks/useToast.js`

**인터페이스:**
```js
const { toasts, showToast } = useToast()
// showToast('메시지', 'success' | 'error' | 'info')
```

**동작:**
- 3초 자동 소멸 (error는 5초)
- 여러 toast 동시 표시 가능 (stack)
- AppLayout에서 `<Toast toasts={toasts} />` 렌더링

**제거 대상:** 컴포넌트 내 모든 `alert()` 호출 → `showToast()`로 교체

### 1-3. 에러 로깅 정책

**규칙:** `catch (e) { console.error('[컴포넌트명]', e) }` — 빈 catch 블록 금지  
**대상:** 프론트엔드 전 파일의 `catch (_) {}` 패턴  
**백엔드:** `GlobalExceptionHandler`에 `log.error()` 추가

---

## Section 2 — 백엔드 리팩토링

### 2-1. `PostImageService` 추출

**현재:** `PostService.createPost()`가 이미지 업로드(MinIO 연동)까지 직접 처리  
**변경 후:**

```
PostService       → 게시글 CRUD, 비즈니스 규칙
PostImageService  → 이미지 업로드·삭제·URL 조회 (MinIO 연동)
```

**파일:**
- 신규: `backend/src/main/java/com/nt/sns/post/service/PostImageService.java`
- 수정: `PostService.java` — `@RequiredArgsConstructor`로 `PostImageService` 주입, 이미지 처리 코드 위임

**인터페이스 (PostImageService):**
```java
List<String> uploadImages(Long postId, List<MultipartFile> files);
void deleteImages(Long postId);
List<String> getImageUrls(Long postId);
```

### 2-2. 도메인 클래스 Lombok 적용

**대상:** `Post`, `User`, `Comment`, `Notification`, `PostImage` 등 도메인 클래스  
**적용 어노테이션:**

| 어노테이션 | 용도 |
|-----------|------|
| `@Getter` | 모든 필드 getter |
| `@Setter` | 필요한 경우만 (또는 `@Setter(AccessLevel.NONE)`) |
| `@NoArgsConstructor` | MyBatis 매핑용 기본 생성자 |
| `@AllArgsConstructor` | 빌더 대용 전체 생성자 |
| `@Builder` | 복잡한 객체 생성 시 |

**제약:** MyBatis는 기본 생성자 + setter로 매핑하므로 `@NoArgsConstructor` + `@Setter` 필수 확인

### 2-3. GlobalExceptionHandler 로깅

**파일:** `backend/src/main/java/com/nt/sns/common/exception/GlobalExceptionHandler.java`

```java
// 변경 전
@ExceptionHandler(Exception.class)
public ResponseEntity<?> handleAll(Exception e) {
    return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
}

// 변경 후
@ExceptionHandler(Exception.class)
public ResponseEntity<?> handleAll(Exception e) {
    log.error("[GlobalExceptionHandler] unhandled exception", e);
    return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
}
```

**4xx 예외 (BusinessException 등):** `log.warn()` 수준으로 기록

---

## Section 3 — 프론트엔드 리팩토링

### 3-1. `Post.jsx` 분리

**현재:** 하나의 파일에 헤더, 본문, 이미지, 액션 바, 수정 폼 혼재

**변경 후 구조:**
```
components/Post/
├── Post.jsx              ← 조합 컨테이너 (상태 관리)
├── Post.module.css
├── PostHeader.jsx        ← 아바타, 이름, 날짜, 더보기 메뉴
├── PostHeader.module.css
├── PostActions.jsx       ← 좋아요, 댓글, 리포스트, 공유 버튼
├── PostActions.module.css
└── PostEditForm.jsx      ← 수정 textarea + 저장/취소 버튼
    PostEditForm.module.css
```

**Post.jsx 역할:** 상태(editing, liked, likeCount 등) 보유, 자식 컴포넌트에 props 전달  
**각 서브컴포넌트:** 비즈니스 상태 없음, props만 받음. 단 PostHeader는 더보기 메뉴 open/close 같은 UI 로컬 상태는 허용

### 3-2. 무한 스크롤 훅 적용

`useInfiniteScroll` 적용 대상:

| 페이지 | fetchFn | deps |
|-------|---------|------|
| `TimelinePage` | `getAllPosts` | `[]` |
| `ProfilePage` | `getUserPosts(id)` | `[id]` |
| `NotificationsPage` | `getNotifications` | `[]` |

각 페이지에서 IntersectionObserver + cursor + loadingMoreRef 코드 제거

### 3-3. Toast 적용

`alert()` → `showToast()` 교체 대상:
- `Post.jsx` (삭제 실패, 수정 실패)
- `SettingsPage.jsx` (프로필 저장 성공/실패)
- `MentionInput.jsx` (이미지 제한 초과 경고)

`useToast` 훅은 `AppLayout`에서 생성, Context로 하위에 노출

### 3-4. SettingsPage 내부 정리

- form submit handler를 별도 함수로 추출 (JSX inline 제거)
- 이미지 미리보기 URL `URL.createObjectURL` → cleanup (`revokeObjectURL`) 추가
- `useState` 초기화 값을 user 로드 후 `useEffect`로 세팅하는 현재 패턴 유지 (변경 없음)

---

## 구현 순서

```
1. hooks/useInfiniteScroll.js  (신규)
2. hooks/useToast.js           (신규)
3. components/Toast/           (신규)
4. GlobalExceptionHandler 로깅 (백엔드)
5. PostImageService 추출       (백엔드)
6. Lombok 도메인 클래스 적용   (백엔드)
7. Post 컴포넌트 분리          (프론트엔드)
8. 3개 페이지 useInfiniteScroll 적용
9. Toast 교체 + 빈 catch 제거
10. SettingsPage 정리
```

---

## 성공 기준

- [ ] IntersectionObserver + cursor 코드가 단 1곳(`useInfiniteScroll`)에만 존재
- [ ] 프로젝트 내 `alert()` 호출 0건
- [ ] `catch (_) {}` 빈 블록 0건 (최소 `console.error` 추가)
- [ ] `Post.jsx` 200줄 이하
- [ ] `PostService.java`에 MinIO 직접 호출 코드 0건
- [ ] 도메인 클래스 보일러플레이트 getter/setter 수동 코드 0건
- [ ] `GlobalExceptionHandler` 모든 핸들러에 로그 존재
- [ ] 기존 기능 회귀 없음 (타임라인, 프로필, 알림, 게시글 CRUD, 이미지 업로드)

---

## 범위 외 (이번 리팩토링 제외)

- API 엔드포인트 변경
- 데이터베이스 스키마 변경
- 신규 기능 추가
- 테스트 코드 작성 (별도 태스크)
- 스타일 디자인 변경
