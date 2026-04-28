# Looply

> 팀과 조직을 위한 실시간 소통 SNS 플랫폼

---

## 목차

- [소개](#소개)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [아키텍처](#아키텍처)
- [시작하기](#시작하기)
- [환경변수](#환경변수)
- [Jenkins CI/CD](#jenkins-cicd)
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
- 본인 게시물 수정 (`수정됨` 표시) 및 삭제

### 실시간 타임라인
- 팔로우한 사용자의 게시물 최신 순 노출
- 무한 스크롤

### 상호작용
- 좋아요, 댓글 (최대 200자)
- 리포스트 — 원본 작성자 정보 포함, 본인 게시물 리포스트 불가

### 팔로우 및 멘션
- 팔로우 즉시 타임라인 반영
- `@` 자동완성으로 사용자 멘션, 멘션 시 실시간 알림 전송

---

## 기술 스택

| 영역 | 기술 | 버전 |
|---|---|---|
| **Frontend** | React + CSS Modules | 19.x |
| | Vite | 8.x |
| **Backend** | Java | 21 LTS |
| | Spring Boot | 3.5.x |
| | Spring Security + JJWT | 6.5.x / 0.12.x |
| | MyBatis | 3.0.x |
| | Springdoc OpenAPI | 2.8.x |
| **Database** | PostgreSQL | 17.x |
| | Redis | 7.4.x |
| | Flyway | 10.x |
| **Storage** | MinIO | RELEASE.2024-01-16 |
| **Build** | Gradle | 8.14.x |
| **실시간** | WebSocket (STOMP / SockJS) | — |
| **테스트** | JUnit 5 + Mockito + JaCoCo | — |
| **DevOps** | Docker + Docker Compose | 27.x / 2.x |
| | Jenkins LTS (JDK21) | lts-jdk21 |
| | SonarQube Community | 25.x |

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

**CI/CD 흐름**

```
개발자 Push (Gitea)
    │ 5분 폴링 (또는 Webhook)
    ▼
Jenkins Multi-Branch Pipeline
    ├─ A. Backend Test   (./gradlew test)
    ├─ B. Backend Build  (./gradlew bootJar)
    ├─ B. Docker Build   (sns-backend:latest, sns-frontend:latest)
    └─ C. Deploy         (main/develop 브랜치만, docker compose)
```

---

## 시작하기

### 사전 요구사항

- Docker 27.x 이상
- Docker Compose 2.x 이상

### 앱 실행 (개발 환경)

```bash
# 저장소 클론
git clone https://github.com/yoohwanihn/Looply.git
cd Looply

# 환경변수 확인 (.env 파일이 이미 포함되어 있음)
# 필요 시 값 수정
vi .env

# 서비스 기동
docker compose up -d
```

### 접속 주소

| 서비스 | 주소 | 설명 |
|---|---|---|
| 프론트엔드 | http://localhost:5173 | React 앱 |
| 백엔드 API | http://localhost:8080 | Spring Boot |
| Swagger UI | http://localhost:8080/swagger-ui.html | API 문서 |
| MinIO 콘솔 | http://localhost:9101 | 파일 스토리지 |
| 헬스체크 | http://localhost:8080/actuator/health | |

### 인프라 서비스 (선택)

Jenkins · SonarQube · Kafka · Prometheus · Grafana가 필요한 경우:

```bash
docker compose -f docker-compose.yml -f docker-compose.infra.yml up -d
```

| 서비스 | 주소 | 기본 계정 |
|---|---|---|
| Jenkins | http://localhost:8090 | admin / `.env`의 `JENKINS_ADMIN_PASSWORD` |
| SonarQube | http://localhost:9000 | admin / admin |
| Grafana | http://localhost:3000 | admin / admin |
| Prometheus | http://localhost:9090 | — |

---

## 환경변수

`.env` 파일에서 관리합니다. 항목별 설명:

| 변수 | 설명 | 기본값 |
|---|---|---|
| `POSTGRES_DB` | PostgreSQL 데이터베이스 이름 | `sns_db` |
| `POSTGRES_USER` | PostgreSQL 사용자 | `sns_user` |
| `POSTGRES_PASSWORD` | PostgreSQL 비밀번호 | `changeme_db_password` |
| `REDIS_PASSWORD` | Redis 비밀번호 | `changeme_redis_password` |
| `JWT_SECRET` | JWT 서명 키 (256bit 이상) | `changeme_...` |
| `JWT_ACCESS_EXPIRY` | Access Token 만료 (ms) | `3600000` (1시간) |
| `JWT_REFRESH_EXPIRY` | Refresh Token 만료 (ms) | `604800000` (7일) |
| `SPRING_PROFILES_ACTIVE` | Spring 프로파일 | `dev` |
| `MINIO_ROOT_USER` | MinIO 관리자 ID | `minioadmin` |
| `MINIO_ROOT_PASSWORD` | MinIO 관리자 비밀번호 | `minioadmin123` |
| `MINIO_PUBLIC_URL` | MinIO 외부 접근 URL | `http://localhost:9100` |
| `SONAR_JDBC_PASSWORD` | SonarQube DB 비밀번호 | `changeme_sonar_password` |
| `JENKINS_ADMIN_PASSWORD` | Jenkins 관리자 비밀번호 | `changeme_jenkins_password` |
| `GITEA_ACCESS_TOKEN` | Gitea API 토큰 (Jenkins용) | — |

---

## Jenkins CI/CD

### 구조

Jenkins는 Docker 컨테이너로 실행되며, Docker 소켓을 마운트해 파이프라인에서 Docker 빌드가 가능합니다.

```
infra/jenkins/
├── Dockerfile            # Jenkins + Docker CLI 커스텀 이미지
├── plugins.txt           # 사전 설치 플러그인 목록
├── docker-entrypoint.sh  # 시작 스크립트
└── casc/
    └── jenkins.yaml      # JCasC — 계정·크리덴셜·잡 자동 구성
```

### Jenkins 시작

```bash
# Jenkins만 시작
docker compose -f docker-compose.yml -f docker-compose.infra.yml up -d jenkins

# 이미지 재빌드가 필요한 경우 (Dockerfile/plugins.txt 변경 시)
docker compose -f docker-compose.yml -f docker-compose.infra.yml up -d --build jenkins

# 로그 확인
docker logs -f sns-jenkins
```

### Gitea 액세스 토큰 발급

Jenkins가 Gitea 저장소에 접근하기 위한 토큰이 필요합니다.

1. Gitea 로그인 → 우측 상단 프로필 → **Settings**
2. 좌측 **Applications** → **Generate New Token**
3. Token Name: `jenkins` (이름은 자유)
4. Permissions: **repository → Read** 만 선택
5. 발급된 토큰을 복사 → `.env`의 `GITEA_ACCESS_TOKEN`에 입력
6. Jenkins 재시작:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.infra.yml restart jenkins
   ```

### JCasC 자동 구성

Jenkins 시작 시 `infra/jenkins/casc/jenkins.yaml`이 자동으로 적용됩니다.

- **관리자 계정**: ID `admin`, PW `.env`의 `JENKINS_ADMIN_PASSWORD`
- **Gitea 크리덴셜**: ID `gitea-credentials` (자동 생성)
- **Multi-Branch Pipeline**: `sns-platform` 잡 자동 생성

### 파이프라인 스테이지

`Jenkinsfile`에 정의된 CI/CD 파이프라인:

| 스테이지 | 실행 조건 | 내용 |
|---|---|---|
| **Checkout** | 전체 브랜치 | 소스 코드 체크아웃 |
| **Backend Test** | 전체 브랜치 | `./gradlew test` + JUnit 리포트 |
| **Backend Build** | 전체 브랜치 | `./gradlew bootJar` |
| **Docker Build** | 전체 브랜치 | `sns-backend:latest`, `sns-frontend:latest` 이미지 빌드 |
| **Deploy** | `main`, `develop` 만 | `docker compose -f docker-compose.prod.yml up -d` |

### 프로덕션 배포

`main` 또는 `develop` 브랜치 빌드 성공 시 자동 배포됩니다.  
배포 compose 파일: `docker-compose.prod.yml`

```bash
# 수동 배포도 가능
docker compose -f docker-compose.prod.yml up -d
```

> 전제 조건: `sns-net` 네트워크 + db / redis / minio 구동 중

### 브랜치 스캔 주기

기본 5분 폴링. Gitea 웹훅으로 즉시 트리거 가능:

1. Gitea 저장소 → **Settings** → **Webhooks** → **Add Webhook**
2. URL: `http://<서버IP>:8090/multibranch-webhook-trigger/invoke?token=sns-platform`
3. Content type: `application/json`
4. 이벤트: Push events

### 초기화 (완전 재설치)

```bash
docker compose -f docker-compose.yml -f docker-compose.infra.yml down jenkins
docker volume rm sns-platform_jenkins_data
docker rmi sns-platform-jenkins
docker compose -f docker-compose.yml -f docker-compose.infra.yml up -d --build jenkins
```

---

## API 문서

서버 기동 후 **http://localhost:8080/swagger-ui.html** 에서 확인할 수 있습니다.

### 주요 엔드포인트

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 (JWT 발급) |
| GET | `/api/users/me` | 내 프로필 조회 |
| GET | `/api/posts/timeline` | 타임라인 조회 |
| POST | `/api/posts` | 게시글 작성 |
| PATCH | `/api/posts/{id}` | 게시글 수정 |
| DELETE | `/api/posts/{id}` | 게시글 삭제 |
| POST | `/api/posts/{id}/likes` | 좋아요 |
| DELETE | `/api/posts/{id}/likes` | 좋아요 취소 |
| POST | `/api/posts/{id}/repost` | 리포스트 |
| POST | `/api/comments` | 댓글 작성 |
| POST | `/api/follows/{id}` | 팔로우 |
| WS | `/ws` | WebSocket 연결 (STOMP) |

### API 응답 형식

```json
{ "success": true,  "data": { ... } }
{ "success": false, "message": "오류 메시지" }
```

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
docs      문서
```

### 프로젝트 구조

```
Looply/
├── .env                      # 환경변수 (실제 값)
├── .env.example              # 환경변수 예시
├── Jenkinsfile               # CI/CD 파이프라인 정의
├── docker-compose.yml        # 앱 서비스 (db, redis, minio, backend, frontend)
├── docker-compose.infra.yml  # 인프라 서비스 (Jenkins, SonarQube, Kafka 등)
├── docker-compose.prod.yml   # 프로덕션 배포용 (prod 이미지 사용)
├── backend/
│   ├── build.gradle
│   ├── src/main/java/com/nt/sns/
│   │   ├── config/           # Security, Redis, WebSocket, MyBatis
│   │   ├── auth/             # JWT 인증, 로그인
│   │   ├── user/             # 사용자 도메인
│   │   ├── post/             # 게시글, 댓글, 좋아요, 리포스트
│   │   ├── follow/           # 팔로우
│   │   ├── mention/          # @멘션
│   │   ├── storage/          # MinIO 파일 업로드
│   │   └── common/           # 공통 DTO, 예외 처리
│   └── src/main/resources/
│       ├── application.yml   # 공통 설정 (환경변수 참조)
│       ├── application-dev.yml
│       ├── mapper/           # MyBatis XML
│       └── db/migration/     # Flyway SQL
├── frontend/
│   └── src/
│       ├── api/              # Axios 클라이언트 + 인터셉터
│       ├── pages/            # 페이지 컴포넌트
│       └── components/       # 공통 컴포넌트
└── infra/
    ├── jenkins/
    │   ├── Dockerfile
    │   ├── plugins.txt
    │   ├── docker-entrypoint.sh
    │   └── casc/jenkins.yaml
    ├── postgres/init/        # DB 초기화 SQL
    ├── redis/
    ├── prometheus/
    └── grafana/
```

---

## 품질 기준

| 항목 | 기준 |
|---|---|
| 코드 커버리지 | JaCoCo 60% 이상 |
| 정적 분석 | SonarQube Blocker · Critical 0건 |
| 보안 취약점 | OWASP CVSS 7.0 이상 0건 |
| 응답 성능 | 타임라인 API 1초 이내 (p95, 20건) |
| 실시간 알림 | 이벤트 발생 후 5초 이내 수신 |
