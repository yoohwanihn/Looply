# Looply — 사내 SNS 플랫폼

> NT사업부 구성원 간 실시간 정보 공유 및 소통을 위한 사내 SNS 플랫폼

---

## 목차

- [프로젝트 개요](#프로젝트-개요)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [아키텍처](#아키텍처)
- [시작하기](#시작하기)
- [API 문서](#api-문서)
- [개발 가이드](#개발-가이드)
- [품질 기준](#품질-기준)
- [산출물 및 일정](#산출물-및-일정)

---

## 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 사업명 | 실시간 정보 공유 및 소통을 위한 사내 SNS 플랫폼 구축 |
| 대상 | NT사업부 개발팀 6인 |
| 기간 | 착수일로부터 12주 (약 3개월) |
| 목적 | 부서 간 실시간 업무 노하우 공유 및 사내 소통 문화 개선 |

### 배경

- 가벼운 소통 창구를 통한 유연한 기업 문화 조성
- 부서 간 실시간 업무 노하우 및 사내 소식 공유
- 해시태그와 멘션을 활용한 신속한 정보 탐색
- 자체 개발을 통한 사내 데이터 보안 확보 및 기술 역량 내재화

---

## 주요 기능

### 필수 기능 (반드시 구현)

#### SFR-001 · 사용자 계정 및 프로필 관리
사번 또는 사내 이메일로 가입하고 인사 정보 기반 프로필을 관리합니다.
- 사번/이메일 기준 회원가입, 중복 가입 차단
- JWT 기반 로그인 (Access Token 1시간 / Refresh Token 7일)
- 로그인 5회 연속 실패 시 10분 계정 잠금
- 프로필 사진·한 줄 소개 수정 (소속·직급은 인사 연동으로 수정 불가)

#### SFR-002 · 피드 포스팅 작성 및 관리
300자 이내의 짧은 글과 이미지를 게시하고 수정·삭제합니다.
- 본문 최대 300자, 이미지 최대 4장 (장당 10MB 이하)
- 글자 수 실시간 표시
- 작성자 본인만 수정 가능, 수정 시 `수정됨` 표시 및 최종 수정 일시 노출
- 작성자 또는 관리자만 삭제 가능

#### SFR-003 · 실시간 타임라인
팔로우한 사용자와 구독 채널의 최신 포스팅을 실시간으로 확인합니다.
- 팔로우 대상 게시물 최신 순 노출
- 신규 게시물 발생 시 상단 `새 게시물 N개` 버튼 표시
- 무한 스크롤 (하단 도달 시 이전 포스팅 추가 로딩)
- 팔로우 대상 없을 시 추천 사용자 또는 인기 게시물 표시

#### SFR-004 · 좋아요 및 댓글
포스팅에 좋아요 반응을 표시하고 댓글로 상호작용합니다.
- 좋아요 즉시 반영, 재클릭 시 취소 (중복 불가)
- 댓글 최대 200자, 작성자/내용/일시 표시
- 작성자 또는 관리자만 댓글 삭제 가능

#### SFR-005 · 리포스트 (공유)
다른 사용자의 포스팅을 본인 타임라인에 공유합니다.
- 원본 작성자 정보 및 리포스트 표시 포함
- 리포스트 취소 시 원본에 영향 없이 본인 타임라인에서만 삭제
- 본인 게시물 리포스트 불가

#### SFR-006 · 팔로우 및 멘션 (@)
동료를 팔로우하고, 게시글/댓글에서 멘션으로 특정 사용자를 태그합니다.
- 팔로우 즉시 상대방 게시물 타임라인 노출
- `@` 입력 시 이름·소속 포함 사용자 자동완성
- 멘션 시 실시간 알림 전송

#### SFR-007 · 해시태그 (#) 및 통합 검색
게시글에 해시태그를 부여하고 키워드 기반 통합 검색을 제공합니다.
- `#` 입력 시 기존 해시태그 자동완성 및 신규 생성
- 해시태그 클릭 시 관련 게시글 최신 순 목록
- 게시글 본문 · 해시태그 · 사용자 이름 통합 검색, 유형별 탭 구분

#### SFR-008 · 채널 (그룹) 관리
부서별·주제별 공개/비공개 채널을 생성하고 채널 단위로 게시물을 공유합니다.
- 채널명·설명·공개 여부 설정하여 생성
- 비공개 채널: 관리자 승인 후 가입
- 채널 게시글은 해당 채널 멤버에게만 노출

#### SFR-009 · 실시간 알림
멘션·좋아요·댓글·팔로우 등 주요 이벤트를 실시간 웹 푸시로 제공합니다.
- 이벤트 발생 5초 이내 브라우저 웹 푸시
- 최근 30일 알림 목록 (유형·일시 표시)
- 알림 클릭 시 해당 게시글/프로필 이동 및 읽음 처리
- 알림 유형별 수신 여부 개별 설정

---

### 권장 기능 (가급적 구현)

#### SFR-010 · 다이렉트 메시지 (DM)
1:1 및 소규모 그룹(최대 10인) 프라이빗 채팅을 제공합니다.
- 실시간 메시지 전달, 읽음 표시 (✓✓)
- 그룹 DM 최대 10인, 최근 대화 순 정렬

#### SFR-011 · 인기 토픽 (Trending)
최근 24시간 내 가장 많이 언급된 해시태그를 순위별로 표시합니다.
- 상위 10개 해시태그 순위 표시
- 최소 1시간마다 갱신

#### SFR-012 · 게시글 내 투표
게시글 작성 시 투표 항목을 추가하여 구성원 의견을 수렴합니다.
- 선택지 최소 2개 ~ 최대 4개, 마감 기한 설정
- 1인 1회 투표, 투표 후 즉시 현재 결과 확인

#### SFR-013 · 금칙어 필터링 및 콘텐츠 신고
금칙어 사전 기반 자동 필터링과 사용자 신고 기능으로 건전한 소통 환경을 유지합니다.
- 금칙어 포함 게시 차단, 관리자만 금칙어 관리
- 신고 3건 이상 시 자동 임시 블라인드 처리

---

### 선택 기능 (여건에 따라 구현)

#### SFR-014 · 관리자 대시보드
시스템 관리자가 사용자·콘텐츠·신고 내역을 통합 관리합니다.
- 일간 신규 가입자 수, 총 게시글 수, 미처리 신고 건수 요약
- 신고 콘텐츠 블라인드 유지/복원 처리
- 계정 게시 제한 또는 접근 차단

---

## 기술 스택

| 영역 | 기술 | 버전 |
|---|---|---|
| **Frontend** | React + CSS Modules | 19.2.x |
| | Vite | 8.x |
| **Backend** | Java | 21 LTS |
| | Spring Boot | 3.5.x |
| | Spring Security + JJWT | Security 6.5.x / JJWT 0.12.x |
| | MyBatis | 3.0.x (JPA 사용 금지) |
| | Springdoc OpenAPI | 2.8.x |
| **DB** | PostgreSQL | 17.x |
| | Redis | 7.4.x (캐시 / 실시간 알림 Pub/Sub) |
| | Flyway | 10.x (스키마 버전 관리) |
| **Build** | Gradle | 8.14.x |
| **실시간** | WebSocket (STOMP) | Spring Boot 번들 |
| **테스트** | JUnit 5 + Mockito | 5.12.x / 5.x |
| | JaCoCo | 0.8.12 (커버리지 60% 이상) |
| | Playwright | 1.50.x (E2E) |
| **품질** | Checkstyle | 10.x |
| | SonarQube | 25.x Community |
| | OWASP Dependency-Check | 11.x |
| **DevOps** | Jenkins | 2.504.x LTS |
| | Docker + Docker Compose | 27.x / 2.x |
| | Gitea | 사내 Git 서버 |

---

## 아키텍처

```
┌─────────────────────────────────────────────────┐
│                   Browser                       │
│          React 19 + Vite 8 (CSS Modules)        │
│                 :5173 (dev)                     │
└──────────────────────┬──────────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────▼──────────────────────────┐
│            Spring Boot 3.5 (Java 21)            │
│   REST API  │  STOMP WebSocket  │  Actuator     │
│                    :8080                        │
│  ┌──────────┐  ┌─────────────┐  ┌───────────┐  │
│  │ Security │  │   MyBatis   │  │  Flyway   │  │
│  │  (JWT)   │  │  (No JPA)   │  │ Migration │  │
│  └──────────┘  └──────┬──────┘  └───────────┘  │
└─────────────────────────┬───────────────────────┘
              ┌───────────┴────────────┐
              │                        │
┌─────────────▼──────────┐  ┌──────────▼──────────┐
│    PostgreSQL 17        │  │     Redis 7.4        │
│  메인 RDBMS             │  │  캐시 / Pub/Sub 알림  │
│      :5432              │  │       :6379          │
└────────────────────────┘  └─────────────────────┘
```

### 실시간 알림 흐름 (SFR-009)

```
이벤트 발생 (좋아요/멘션/댓글)
    → Spring Service
    → Redis Pub/Sub 발행
    → WebSocket (STOMP /queue/notifications)
    → 브라우저 실시간 수신 (5초 이내)
```

---

## 시작하기

### 사전 요구사항

- Docker Desktop 27.x 이상
- Docker Compose 2.x 이상

### 개발 환경 실행

```bash
# 1. 저장소 클론
git clone http://192.168.0.199:3003/yoohwanihn/sns-platform.git
cd sns-platform

# 2. 환경변수 설정
cp .env.example .env
# .env 파일에서 비밀번호 변경 (선택)

# 3. 전체 서비스 기동
docker compose up -d

# 4. 기동 확인
docker compose logs -f backend
```

### 서비스 접속

| 서비스 | 주소 |
|---|---|
| 프론트엔드 | http://localhost:5173 |
| 백엔드 API | http://localhost:8080 |
| API 문서 (Swagger) | http://localhost:8080/swagger-ui.html |
| 헬스체크 | http://localhost:8080/actuator/health |

### 인프라 서비스 추가 실행 (선택)

Jenkins / SonarQube / Kafka / Prometheus / Grafana가 필요한 경우:

```bash
docker compose -f docker-compose.yml -f docker-compose.infra.yml up -d
```

| 서비스 | 주소 |
|---|---|
| Jenkins | http://localhost:8090 |
| SonarQube | http://localhost:9000 |
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |

---

## API 문서

서버 기동 후 **http://localhost:8080/swagger-ui.html** 에서 Springdoc OpenAPI 자동 생성 문서를 확인할 수 있습니다.

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

### 커밋 메시지 규칙

```
[OP-{번호}] {type}: {설명}

type 목록:
  feat      신규 기능
  fix       버그 수정
  hotfix    운영 긴급 수정
  refactor  리팩토링
  chore     설정/빌드 변경
  test      테스트 코드
```

예시:
```
[OP-003] feat: 피드 포스팅 작성 API 구현
[OP-003] feat: 타임라인 무한 스크롤 구현
[OP-004] fix: 좋아요 중복 처리 오류 수정
```

### 프로젝트 구조

```
sns-platform/
├── backend/                          # Spring Boot 백엔드
│   ├── build.gradle
│   ├── config/checkstyle/
│   └── src/
│       ├── main/java/com/nt/sns/
│       │   ├── config/               # Security, Redis, WebSocket 설정
│       │   ├── auth/                 # 인증 (JWT, 로그인, 회원가입)
│       │   ├── user/                 # 사용자 도메인
│       │   └── common/              # 공통 DTO, 예외 처리
│       └── main/resources/
│           ├── application.yml
│           └── db/migration/         # Flyway 마이그레이션 스크립트
├── frontend/                         # React 프론트엔드
│   ├── src/
│   │   ├── api/                      # Axios 클라이언트
│   │   ├── pages/                    # 페이지 컴포넌트
│   │   ├── components/              # 공통 컴포넌트
│   │   └── styles/                  # 전역 스타일
│   └── playwright.config.js
└── infra/                            # 인프라 설정 파일
    ├── postgres/
    ├── redis/
    ├── prometheus/
    ├── grafana/
    └── jenkins/
```

### 코딩 컨벤션

- **ORM**: MyBatis 전용 (JPA/Hibernate 사용 금지)
- **인증**: JWT Stateless — 서버 세션 저장 없음
- **CSS**: CSS Modules 전용 (Tailwind CSS 사용 금지)
- **API 응답 형식**: `ApiResponse<T>` 래퍼 통일

```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "오류 메시지" }
```

---

## 품질 기준

| 항목 | 기준 |
|---|---|
| 코드 커버리지 | JaCoCo 60% 이상 (미달 시 Jenkins 빌드 실패) |
| 정적 분석 | SonarQube Blocker·Critical 이슈 0건이어야 PR Merge 허용 |
| 보안 취약점 | OWASP Dependency-Check CVSS 7.0 이상 0건 유지 |
| 응답 성능 | 타임라인 API 1초 이내 (95th percentile, 20건 기준) |
| 동시 접속 | 30명 동시 접속 시 주요 기능 응답 3초 이내 |
| 실시간 알림 | 이벤트 발생 후 5초 이내 수신 |

---

## 산출물 및 일정

| 단계 | 산출물 |
|---|---|
| 착수 | 사업수행계획서 (WBS, 팀 역할 분담) |
| 설계 | 요구사항 정의서, UI/UX 스토리보드, ERD, API 명세서 |
| 개발 | 소스 코드 (Gitea), Flyway 마이그레이션 스크립트 |
| 테스트 | JUnit5 단위 테스트, Playwright E2E, JaCoCo 커버리지 리포트 |
| 종료 | 운영/사용자 매뉴얼, Docker Compose 배포 가이드, 완료 보고서 |

---

## 라이선스

사내 프로젝트 — NT사업부 내부 사용 한정
