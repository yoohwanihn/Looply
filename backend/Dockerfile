# =============================================
# Spring Boot 3.5.x / Java 21 LTS / Gradle 8.14.x
# =============================================

# ── 개발 단계 (hot reload) ──────────────────
FROM gradle:8.14-jdk21-alpine AS dev
WORKDIR /workspace

COPY build.gradle settings.gradle ./
RUN gradle dependencies --no-daemon 2>/dev/null || true

COPY src ./src

EXPOSE 8080

CMD ["gradle", "bootRun", "--args=--spring.profiles.active=dev", "--no-daemon"]

# ── 빌드 단계 ──────────────────────────────
FROM gradle:8.14-jdk21-alpine AS builder
WORKDIR /workspace

COPY build.gradle settings.gradle ./
RUN gradle dependencies --no-daemon 2>/dev/null || true

COPY src ./src
RUN gradle bootJar --no-daemon -x test

# ── 프로덕션 단계 ───────────────────────────
FROM eclipse-temurin:21-jre-alpine AS prod
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /workspace/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
