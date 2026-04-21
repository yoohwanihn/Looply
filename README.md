# Looply

> 팀과 조직을 위한 실시간 소통 SNS 플랫폼

---

## 목차

- [소개](#소개)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [아키텍처](#아키텍처)
- [시작하기](#시작하기)
- [API 문서](#api-문서)
- [개발 가이드](#개발-가이드)
- [품질 기준](#품질-기준)

---

## 소개

Looply는 팀 내 실시간 정보 공유와 소통을 위한 셀프 호스팅 SNS 플랫폼입니다.  
해시태그와 멘션을 통한 빠른 정보 탐색, 채널 기반 그룹 소통, 실시간 알림을 지원합니다.

---

## 주요 기능

### 계정 및 프로필
- 이메일 기반 회원가입 및 로그인
- JWT 인증 (Access Token 1시간 / Refresh Token 7일)
- 로그인 5회 연속 실패 시 10분 계정 잠금
- 프로필 사진 및 소개 수정

### 피드
- 300자 이내 포스팅, 이미지 최대 4장 첨부 (장당 10MB 이하)
- 글자 수 실시간 표시
- 본인 게시물 수정 (`수정됨` 표시) 및 삭제

### 실시간 타임라인
- 팔로우한 사용자와 구독 채널의 게시물 최신 순 노출
- 신규 게시물 발생 시 `새 게시물 N개` 버튼 표시
- 무한 스크롤

### 상호작용
- 좋아요 (즉시 반영, 중복 불가)
- 댓글 (최대 200자)
- 리포스트 — 원본 작성자 정보 포함, 본인 게시물 리포스트 불가

### 팔로우 및 멘션
- 팔로우 즉시 타임라인 반영
- `@` 자동완성으로 사용자 멘션, 멘션 시 실시간 알림 전송

### 해시태그 및 검색
- `#` 자동완성, 신규 해시태그 즉시 생성
- 게시글 본문 · 해시태그 · 사용자 이름 통합 검색

### 채널 (그룹)
- 공개 / 비공개 채널 생성
- 비공개 채널은 관리자 승인 후 가입
- 채널 게시글은 멤버에게만 노출

### 실시간 알림
- 좋아요 · 댓글 · 멘션 · 팔로우 이벤트 5초 이내 웹 푸시
- 최근 30일 알림 목록, 유형별 수신 설정

### 다이렉트 메시지 (DM)
- 1:1 및 그룹 채팅 (최대 10인)
- 실시간 전달 및 읽음 표시

### 인기 토픽 (Trending)
- 24시간 내 언급 빈도 기준 상위 10개 해시태그
- 1시간마다 갱신

### 투표
- 게시글에 투표 첨부 (선택지 2~4개, 마감 기한 설정)
- 1인 1회, 투표 후 즉시 결과 확인

### 콘텐츠 관리
- 금칙어 자동 필터링 (관리자 관리)
- 콘텐츠 신고 및 신고 3건 이상 시 자동 블라인드

### 관리자 대시보드
- 신규 가입자 · 게시글 수 · 미처리 신고 요약
- 신고 콘텐츠 처리, 계정 제재

---

## 기술 스택

| 영역 | 기술 | 버전 |
|---|---|---|
| **Frontend** | React + CSS Modules | 19.2.x |
| | Vite | 8.x |
| **Backend** | Java | 21 LTS |
| | Spring Boot | 3.5.x |
| | Spring Security + JJWT | 6.5.x / 0.12.x |
| | MyBatis | 3.0.x |
| | Springdoc OpenAPI | 2.8.x |
| **Database** | PostgreSQL | 17.x |
| | Redis | 7.4.x |
| | Flyway | 10.x |
| **Build** | Gradle | 8.14.x |
| **실시간** | WebSocket (STOMP) | — |
| **테스트** | JUnit 5 + Mockito | 5.12.x / 5.x |
| | JaCoCo | 0.8.12 |
| | Playwright | 1.50.x |
| **DevOps** | Docker + Docker Compose | 27.x / 2.x |
| | Jenkins | 2.504.x LTS |
| | SonarQube | 25.x Community |

---

## 아키텍처

```
┌─────────────────────────────────────────────────┐
│                   Browser                       │
│          React 19 + Vite 8 (CSS Modules)        │
└──────────────────────┬──────────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────▼──────────────────────────┐
│            Spring Boot 3.5 (Java 21)            │
│     REST API  │  STOMP WebSocket  │  Actuator   │
│  ┌──────────┐  ┌───────────┐  ┌─────────────┐  │
│  │  JWT     │  │  MyBatis  │  │   Flyway    │  │
│  │  Auth    │  │  (No JPA) │  │  Migration  │  │
│  └──────────┘  └───────────┘  └─────────────┘  │
└──────────────┬──────────────────────────────────┘
               │
    ┌──────────┴───────────┐
    │                      │
┌───▼────────────┐  ┌──────▼──────────────┐
│  PostgreSQL 17 │  │     Redis 7.4        │
│  메인 DB        │  │  캐시 / Pub/Sub 알림  │
└────────────────┘  └─────────────────────┘
```

**실시간 알림 흐름**

```
이벤트 발생 → Spring Service → Redis Pub/Sub → WebSocket(STOMP) → 브라우저
```

---

## 시작하기

### 사전 요구사항

- Docker 27.x 이상
- Docker Compose 2.x 이상

### 실행

```bash
# 저장소 클론
git clone https://github.com/yoohwanihn/Looply.git
cd Looply

# 환경변수 설정
cp .env.example .env

# 서비스 기동
docker compose up -d
```

### 접속 주소

| 서비스 | 주소 |
|---|---|
| 프론트엔드 | http://localhost:5173 |
| 백엔드 API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| 헬스체크 | http://localhost:8080/actuator/health |

### 인프라 서비스 (선택)

Jenkins · SonarQube · Kafka · Prometheus · Grafana가 필요한 경우:

```bash
docker compose -f docker-compose.yml -f docker-compose.infra.yml up -d
```

| 서비스 | 주소 |
|---|---|
| Jenkins | http://localhost:8090 |
| SonarQube | http://localhost:9000 |
| Grafana | http://localhost:3000 |

---

## API 문서

서버 기동 후 **http://localhost:8080/swagger-ui.html** 에서 확인할 수 있습니다.

### 주요 엔드포인트

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 (JWT 발급) |
| GET | `/api/users/me` | 내 프로필 조회 |
| GET | `/api/users/{id}` | 사용자 프로필 조회 |
| GET | `/api/posts/timeline` | 타임라인 조회 |
| POST | `/api/posts` | 게시글 작성 |
| POST | `/api/posts/{id}/likes` | 좋아요 |
| DELETE | `/api/posts/{id}/likes` | 좋아요 취소 |
| WS | `/ws` | WebSocket 연결 (STOMP) |

---

## 개발 가이드

### 브랜치 전략

```
main          ← 운영 배포 (직접 커밋 금지)
develop       ← 개발 통합
  feature/OP-{번호}-{설명}   ← 기능 개발
  fix/OP-{번호}-{설명}       ← 버그 수정
  hotfix/OP-{번호}-{설명}    ← 운영 긴급 수정
  release/{버전}             ← 배포 준비
```

### 커밋 메시지

```
[OP-{번호}] {type}: {설명}

feat      신규 기능
fix       버그 수정
hotfix    운영 긴급 수정
refactor  리팩토링
chore     설정/빌드 변경
test      테스트 코드
```

### 프로젝트 구조

```
Looply/
├── backend/
│   ├── build.gradle
│   ├── config/checkstyle/
│   └── src/main/java/com/nt/sns/
│       ├── config/          # Security, Redis, WebSocket
│       ├── auth/            # JWT 인증
│       ├── user/            # 사용자 도메인
│       └── common/          # 공통 DTO, 예외 처리
├── frontend/
│   └── src/
│       ├── api/             # Axios 클라이언트
│       ├── pages/           # 페이지 컴포넌트
│       ├── components/      # 공통 컴포넌트
│       └── styles/
└── infra/                   # 인프라 설정
    ├── postgres/
    ├── redis/
    ├── prometheus/
    └── jenkins/
```

### API 응답 형식

```json
{ "success": true,  "data": { ... } }
{ "success": false, "message": "오류 메시지" }
```

---

## 품질 기준

| 항목 | 기준 |
|---|---|
| 코드 커버리지 | JaCoCo 60% 이상 |
| 정적 분석 | SonarQube Blocker · Critical 0건 |
| 보안 취약점 | OWASP CVSS 7.0 이상 0건 |
| 응답 성능 | 타임라인 API 1초 이내 (p95, 20건) |
| 동시 접속 | 30명 기준 주요 기능 3초 이내 |
| 실시간 알림 | 이벤트 발생 후 5초 이내 수신 |
