-- 초기 DB 설정 (Flyway가 실제 스키마 관리)
-- 이 파일은 컨테이너 최초 기동 시 1회 실행됨

-- 한국어 전문 검색 및 타임존 설정
ALTER DATABASE sns_db SET timezone TO 'Asia/Seoul';

-- 향후 pgvector 사용 시 주석 해제
-- CREATE EXTENSION IF NOT EXISTS vector;

-- PostGIS 사용 시 주석 해제
-- CREATE EXTENSION IF NOT EXISTS postgis;
