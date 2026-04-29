-- =============================================
-- 더미 데이터 (개발/데모용)
-- 비밀번호: Test1234! (BCrypt strength=10)
-- =============================================

-- ── 사용자 10명 ───────────────────────────────
INSERT INTO users (employee_no, email, password_hash, name, department, position, bio, role)
VALUES
  ('EMP001', 'jisoo.kim@company.com',   '$2a$10$e0tYAWP3DP9C5yEc3ZUYZOGPATM.FgMFqajNf0YMgWK0RqgbCg1Uu', '김지수', '개발팀', '시니어 개발자',     '풀스택 개발을 즐기는 개발자입니다 🚀', 'USER'),
  ('EMP002', 'minho.lee@company.com',   '$2a$10$e0tYAWP3DP9C5yEc3ZUYZOGPATM.FgMFqajNf0YMgWK0RqgbCg1Uu', '이민호', '개발팀', '백엔드 개발자',      'Java & Spring 전문. 커피 없이는 못 살아요 ☕', 'USER'),
  ('EMP003', 'seoyeon.park@company.com','$2a$10$e0tYAWP3DP9C5yEc3ZUYZOGPATM.FgMFqajNf0YMgWK0RqgbCg1Uu', '박서연', '디자인팀', 'UX 디자이너',      '사용자 경험을 최우선으로 생각합니다 ✨', 'USER'),
  ('EMP004', 'junho.choi@company.com',  '$2a$10$e0tYAWP3DP9C5yEc3ZUYZOGPATM.FgMFqajNf0YMgWK0RqgbCg1Uu', '최준호', '기획팀', '프로덕트 매니저',   '제품으로 세상을 바꿉니다 💡', 'USER'),
  ('EMP005', 'yuna.jung@company.com',   '$2a$10$e0tYAWP3DP9C5yEc3ZUYZOGPATM.FgMFqajNf0YMgWK0RqgbCg1Uu', '정유나', '마케팅팀', '마케팅 팀장',      '데이터 기반 마케팅을 추구합니다 📊', 'USER'),
  ('EMP006', 'taehyun.oh@company.com',  '$2a$10$e0tYAWP3DP9C5yEc3ZUYZOGPATM.FgMFqajNf0YMgWK0RqgbCg1Uu', '오태현', '인프라팀', 'DevOps 엔지니어',  'CI/CD와 쿠버네티스를 사랑합니다 🛠️', 'USER'),
  ('EMP007', 'sujin.han@company.com',   '$2a$10$e0tYAWP3DP9C5yEc3ZUYZOGPATM.FgMFqajNf0YMgWK0RqgbCg1Uu', '한수진', '개발팀', '프론트엔드 개발자', 'React와 TypeScript로 살고 있어요 ⚛️', 'USER'),
  ('EMP008', 'dongwoo.shin@company.com','$2a$10$e0tYAWP3DP9C5yEc3ZUYZOGPATM.FgMFqajNf0YMgWK0RqgbCg1Uu', '신동우', '데이터팀', '데이터 엔지니어',   '데이터로 인사이트를 만들어냅니다 📈', 'USER'),
  ('EMP009', 'mirae.yoon@company.com',  '$2a$10$e0tYAWP3DP9C5yEc3ZUYZOGPATM.FgMFqajNf0YMgWK0RqgbCg1Uu', '윤미래', 'HR팀', 'HR 매니저',          '함께 성장하는 조직문화를 만들고 싶어요 🌱', 'USER'),
  ('EMP010', 'jaewon.kwon@company.com', '$2a$10$e0tYAWP3DP9C5yEc3ZUYZOGPATM.FgMFqajNf0YMgWK0RqgbCg1Uu', '권재원', '보안팀', '보안 엔지니어',     '안전한 시스템을 위해 오늘도 달립니다 🔐', 'USER');

-- ── 게시글 ────────────────────────────────────
-- 각 유저별로 2~4개의 게시글
INSERT INTO posts (user_id, content, created_at) VALUES
  -- 김지수 (1)
  (1, '오늘 새로운 마이크로서비스 아키텍처 도입을 검토했습니다. 모놀리식에서 분리하는 과정이 생각보다 복잡하네요. 팀원들과 충분히 논의해봐야 할 것 같아요.', NOW() - INTERVAL '9 days'),
  (1, 'Spring Boot 3.x로 마이그레이션 완료! 성능이 체감될 정도로 빨라졌습니다. 가상 스레드(Virtual Thread) 덕분인지 API 응답속도가 30% 개선됐어요 🚀', NOW() - INTERVAL '4 days'),
  (1, 'Clean Code 다시 읽고 있는데, 읽을 때마다 새롭게 느껴지네요. 코드 리뷰할 때 적용해보려 합니다.', NOW() - INTERVAL '1 day'),

  -- 이민호 (2)
  (2, 'PostgreSQL 쿼리 튜닝 하루 종일 했더니 드디어 3초 걸리던 쿼리가 50ms로 줄었습니다! 인덱스의 힘 💪', NOW() - INTERVAL '8 days'),
  (2, '레디스 캐시 레이어 추가했더니 DB 부하가 확 줄었어요. 캐시 전략 잘 세우는 게 중요한 것 같습니다.', NOW() - INTERVAL '5 days'),
  (2, '오늘 코드 리뷰에서 좋은 피드백 많이 받았습니다. 팀원들 덕분에 코드 품질이 계속 올라가고 있어요.', NOW() - INTERVAL '2 days'),

  -- 박서연 (3)
  (3, '사용자 인터뷰 5명 진행 완료. 예상치 못한 pain point를 발견했습니다. 프로토타입 다시 잡아야 할 것 같아요.', NOW() - INTERVAL '7 days'),
  (3, 'Figma 컴포넌트 시스템 구축 중입니다. 디자인 일관성을 위해 토큰부터 차근차근 정리하고 있어요 ✨', NOW() - INTERVAL '3 days'),
  (3, '오늘 디자인 크리틱 세션 정말 유익했어요. 다양한 관점에서 피드백을 받으니 시야가 넓어지는 것 같습니다.', NOW() - INTERVAL '6 hours'),

  -- 최준호 (4)
  (4, 'Q3 로드맵 정리 완료. 우선순위 결정이 항상 어렵지만, 이번엔 팀과 충분히 맞춰서 합의점을 잘 찾은 것 같아요.', NOW() - INTERVAL '6 days'),
  (4, '사용자 피드백 분석해보니 핵심 기능 3가지가 명확해졌습니다. 다음 스프린트 계획에 바로 반영할 예정이에요 💡', NOW() - INTERVAL '2 days'),

  -- 정유나 (5)
  (5, '이번 캠페인 CTR이 지난달 대비 45% 상승했어요! A/B 테스트 결과가 드디어 나왔는데 예상보다 훨씬 좋네요 📊', NOW() - INTERVAL '5 days'),
  (5, 'SEO 최적화 작업 후 오가닉 트래픽이 두 배로 늘었습니다. 콘텐츠 마케팅의 힘을 다시 한번 느꼈어요.', NOW() - INTERVAL '3 days'),
  (5, '마케팅 자동화 툴 도입 검토 중입니다. ROI 계산해봤는데 6개월이면 충분히 회수될 것 같아요.', NOW() - INTERVAL '1 day'),

  -- 오태현 (6)
  (6, 'Kubernetes 클러스터 업그레이드 완료. 무중단으로 진행하는 게 항상 스트레스지만 이번엔 매끄럽게 됐어요 🛠️', NOW() - INTERVAL '8 days'),
  (6, 'GitHub Actions로 CI/CD 파이프라인 전면 개편. 빌드 시간 40% 단축됐고 안정성도 훨씬 좋아졌습니다.', NOW() - INTERVAL '4 days'),
  (6, '모니터링 대시보드 새로 구축했어요. Grafana + Prometheus 조합이 역시 최고입니다 📉', NOW() - INTERVAL '1 day'),

  -- 한수진 (7)
  (7, 'React Query 도입하고 나서 클라이언트 상태 관리가 정말 편해졌어요. 서버 상태와 클라이언트 상태를 명확히 분리하는 게 핵심인 것 같습니다.', NOW() - INTERVAL '7 days'),
  (7, '웹 접근성(a11y) 개선 작업 시작했습니다. WCAG 2.1 AA 기준 맞추는 게 목표인데, 생각보다 체크할 것들이 많네요.', NOW() - INTERVAL '3 days'),
  (7, 'Storybook으로 컴포넌트 문서화 완료! 다른 팀원들이 UI 컴포넌트를 훨씬 쉽게 재사용하고 있어서 뿌듯합니다 ⚛️', NOW() - INTERVAL '12 hours'),

  -- 신동우 (8)
  (8, 'Spark 파이프라인 최적화로 일 배치 처리 시간 6시간 → 1.5시간으로 줄였습니다. 파티셔닝 전략이 핵심이었어요 📈', NOW() - INTERVAL '9 days'),
  (8, '데이터 품질 모니터링 시스템 구축 완료. 이상 데이터를 실시간으로 감지할 수 있게 되었습니다.', NOW() - INTERVAL '5 days'),

  -- 윤미래 (9)
  (9, '신입 온보딩 프로그램 리뉴얼 완료! 3주 프로그램으로 구성했는데, 첫 기수 피드백이 매우 긍정적이에요 🌱', NOW() - INTERVAL '6 days'),
  (9, '직원 만족도 조사 결과 분석 중입니다. 복지 관련 의견이 많이 나왔는데 경영진과 공유해서 개선방안을 마련할 예정이에요.', NOW() - INTERVAL '2 days'),
  (9, '팀 빌딩 행사 기획 완료. 다음달 진행 예정인데 모두가 즐길 수 있는 프로그램으로 준비했습니다!', NOW() - INTERVAL '5 hours'),

  -- 권재원 (10)
  (10, '정기 보안 감사 완료. 취약점 3건 발견해서 즉시 패치 진행했습니다. 주기적인 감사가 얼마나 중요한지 다시 느꼈어요 🔐', NOW() - INTERVAL '7 days'),
  (10, 'OAuth 2.0 도입 검토 중입니다. 현재 JWT 방식과 비교해서 장단점을 정리하고 있어요.', NOW() - INTERVAL '4 days'),
  (10, '개발팀 보안 교육 진행했습니다. SQL Injection, XSS 등 기본적인 것들이지만 놓치기 쉬운 부분들이라 다 같이 복습했어요.', NOW() - INTERVAL '2 days');

-- ── 팔로우 관계 ───────────────────────────────
-- 팀 내 + 부서 간 팔로우로 현실적인 소셜 그래프 구성
INSERT INTO follows (follower_id, following_id) VALUES
  -- 김지수가 팔로우하는 사람
  (1, 2), (1, 3), (1, 6), (1, 7),
  -- 이민호가 팔로우하는 사람
  (2, 1), (2, 6), (2, 7), (2, 10),
  -- 박서연이 팔로우하는 사람
  (3, 4), (3, 5), (3, 7), (3, 9),
  -- 최준호가 팔로우하는 사람
  (4, 1), (4, 2), (4, 3), (4, 5), (4, 8),
  -- 정유나가 팔로우하는 사람
  (5, 3), (5, 4), (5, 9),
  -- 오태현이 팔로우하는 사람
  (6, 1), (6, 2), (6, 8), (6, 10),
  -- 한수진이 팔로우하는 사람
  (7, 1), (7, 2), (7, 3), (7, 6),
  -- 신동우가 팔로우하는 사람
  (8, 6), (8, 10), (8, 4), (8, 2),
  -- 윤미래가 팔로우하는 사람
  (9, 3), (9, 4), (9, 5),
  -- 권재원이 팔로우하는 사람
  (10, 1), (10, 2), (10, 6);

-- ── 좋아요 ────────────────────────────────────
INSERT INTO likes (user_id, post_id) VALUES
  (2, 1), (3, 1), (6, 1),
  (1, 4), (7, 4), (6, 4),
  (4, 7), (5, 7),
  (1, 10), (2, 10), (7, 10),
  (3, 13), (4, 13), (9, 13),
  (2, 16), (1, 16), (10, 16),
  (6, 19), (2, 19),
  (1, 22), (4, 22), (8, 22),
  (3, 25), (5, 25),
  (1, 28), (2, 28), (6, 28);

-- ── 댓글 ─────────────────────────────────────
INSERT INTO comments (post_id, user_id, content) VALUES
  (1,  2, '마이크로서비스 전환은 정말 신중하게 접근해야 하더라고요. 도메인 경계 설정이 제일 어려웠어요.'),
  (1,  7, '저도 비슷한 경험 했는데, API Gateway 설계부터 잘 잡는 게 중요한 것 같아요!'),
  (4,  1, '어떤 인덱스 전략 쓰셨나요? 저도 비슷한 문제로 고민 중인데요.'),
  (4,  6, '복합 인덱스 vs 커버링 인덱스 선택이 항상 고민이죠. 실행 계획 공유해주실 수 있나요?'),
  (7,  4, '사용자 인터뷰 어떤 방식으로 진행하셨어요? 저도 배워보고 싶네요.'),
  (10, 3, '로드맵 공유해주실 수 있을까요? 협업 포인트가 있을 것 같아서요!'),
  (13, 9, '45%라니 엄청난 성과네요! 어떤 변수가 가장 크게 작용했나요?'),
  (16, 2, '무중단 업그레이드 노하우 공유해주세요! 저도 곧 해야 하는데 긴장되네요.'),
  (22, 6, 'React Query 정말 좋죠. tanstack-query v5로 업그레이드도 해보셨나요?'),
  (25, 4, '온보딩 프로그램 잘 정착되면 생산성이 많이 올라가죠. 좋은 결과 기대됩니다!');
