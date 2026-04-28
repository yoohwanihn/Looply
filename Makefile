COMPOSE_DEV   = docker compose -f docker-compose.yml
COMPOSE_PROD  = docker compose -f docker-compose.yml -f docker-compose.prod.yml
COMPOSE_INFRA = docker compose -f docker-compose.yml -f docker-compose.infra.yml

.PHONY: dev prod infra down logs ps help

## 개발 환경 실행 (소스 직접 빌드)
dev:
	docker network create sns-net 2>/dev/null || true
	$(COMPOSE_DEV) up -d --build

## 프로덕션 환경 실행 (Jenkins 빌드 이미지 사용)
prod:
	docker network create sns-net 2>/dev/null || true
	$(COMPOSE_PROD) up -d

## 인프라 포함 실행 (Jenkins, Grafana, Kafka 등)
infra:
	docker network create sns-net 2>/dev/null || true
	$(COMPOSE_INFRA) up -d --build

## 모든 컨테이너 종료
down:
	$(COMPOSE_PROD) down --remove-orphans 2>/dev/null || true
	$(COMPOSE_DEV) down --remove-orphans 2>/dev/null || true

## 로그 확인 (make logs s=sns-backend)
logs:
	docker logs -f $(s)

## 실행 중인 컨테이너 목록
ps:
	docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep sns-

## 도움말
help:
	@echo ""
	@echo "사용법: make [target]"
	@echo ""
	@echo "  make dev    개발 환경 실행 (소스 빌드)"
	@echo "  make prod   프로덕션 실행 (Jenkins 이미지)"
	@echo "  make infra  인프라 포함 실행 (Jenkins/Grafana 등)"
	@echo "  make down   전체 종료"
	@echo "  make ps     컨테이너 상태 확인"
	@echo "  make logs s=sns-backend  로그 확인"
	@echo ""
