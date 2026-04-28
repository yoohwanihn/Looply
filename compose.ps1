param(
    [Parameter(Position=0)]
    [ValidateSet("dev","prod","infra","down","ps","logs","help")]
    [string]$Command = "help",

    [string]$s = ""
)

$COMPOSE_DEV   = "docker compose -f docker-compose.yml"
$COMPOSE_PROD  = "docker compose -f docker-compose.yml -f docker-compose.prod.yml"
$COMPOSE_INFRA = "docker compose -f docker-compose.yml -f docker-compose.infra.yml"

function Ensure-Network {
    docker network inspect sns-net *>$null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "sns-net 네트워크 생성 중..." -ForegroundColor Yellow
        docker network create sns-net
    }
}

switch ($Command) {
    "dev" {
        Write-Host "[DEV] 개발 환경 실행 (소스 빌드)" -ForegroundColor Cyan
        Ensure-Network
        Invoke-Expression "$COMPOSE_DEV up -d --build"
    }
    "prod" {
        Write-Host "[PROD] 프로덕션 실행 (Jenkins 빌드 이미지)" -ForegroundColor Green
        Ensure-Network
        Invoke-Expression "$COMPOSE_PROD up -d"
    }
    "infra" {
        Write-Host "[INFRA] 인프라 포함 실행 (Jenkins, Grafana, Kafka 등)" -ForegroundColor Magenta
        Ensure-Network
        Invoke-Expression "$COMPOSE_INFRA up -d --build"
    }
    "down" {
        Write-Host "[DOWN] 전체 컨테이너 종료" -ForegroundColor Red
        Invoke-Expression "$COMPOSE_PROD down" 2>$null
        Invoke-Expression "$COMPOSE_DEV down" 2>$null
    }
    "ps" {
        docker ps --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}" | Select-String "sns-|NAMES"
    }
    "logs" {
        if (-not $s) { Write-Host "사용법: .\compose.ps1 logs -s sns-backend" -ForegroundColor Yellow; exit 1 }
        docker logs -f $s
    }
    "help" {
        Write-Host ""
        Write-Host "사용법: .\compose.ps1 [command]" -ForegroundColor White
        Write-Host ""
        Write-Host "  dev    개발 환경 실행 (소스 빌드)" -ForegroundColor Cyan
        Write-Host "  prod   프로덕션 실행 (Jenkins 이미지)" -ForegroundColor Green
        Write-Host "  infra  인프라 포함 실행 (Jenkins/Grafana 등)" -ForegroundColor Magenta
        Write-Host "  down   전체 종료" -ForegroundColor Red
        Write-Host "  ps     컨테이너 상태 확인"
        Write-Host "  logs   로그 확인 (예: .\compose.ps1 logs -s sns-backend)"
        Write-Host ""
    }
}
