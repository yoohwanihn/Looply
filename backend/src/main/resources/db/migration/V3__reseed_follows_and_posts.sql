-- =============================================
-- V3: EMP 팔로우 재적용 + 추가 게시글
-- =============================================

-- ── EMP 간 팔로우 전체 초기화 후 재적용 ──────
DELETE FROM follows
WHERE follower_id IN (SELECT id FROM users WHERE employee_no LIKE 'EMP%')
  AND following_id IN (SELECT id FROM users WHERE employee_no LIKE 'EMP%');

INSERT INTO follows (follower_id, following_id)
SELECT f.id, t.id
FROM (VALUES
  ('EMP001','EMP002'), ('EMP001','EMP003'), ('EMP001','EMP006'), ('EMP001','EMP007'),
  ('EMP002','EMP001'), ('EMP002','EMP006'), ('EMP002','EMP007'), ('EMP002','EMP010'),
  ('EMP003','EMP004'), ('EMP003','EMP005'), ('EMP003','EMP007'), ('EMP003','EMP009'),
  ('EMP004','EMP001'), ('EMP004','EMP002'), ('EMP004','EMP003'), ('EMP004','EMP005'), ('EMP004','EMP008'),
  ('EMP005','EMP003'), ('EMP005','EMP004'), ('EMP005','EMP009'),
  ('EMP006','EMP001'), ('EMP006','EMP002'), ('EMP006','EMP008'), ('EMP006','EMP010'),
  ('EMP007','EMP001'), ('EMP007','EMP002'), ('EMP007','EMP003'), ('EMP007','EMP006'),
  ('EMP008','EMP006'), ('EMP008','EMP010'), ('EMP008','EMP004'), ('EMP008','EMP002'),
  ('EMP009','EMP003'), ('EMP009','EMP004'), ('EMP009','EMP005'),
  ('EMP010','EMP001'), ('EMP010','EMP002'), ('EMP010','EMP006')
) AS v(from_emp, to_emp)
JOIN users f ON f.employee_no = v.from_emp
JOIN users t ON t.employee_no = v.to_emp
ON CONFLICT (follower_id, following_id) DO NOTHING;

-- ── 추가 게시글 (V2 기존 게시글 보완) ─────────
INSERT INTO posts (user_id, content, created_at)
SELECT u.id, v.content, NOW() + v.ts
FROM (VALUES
  ('EMP001', '사내 해커톤 아이디어 모집 중입니다! AI 활용한 코드 리뷰 자동화 어떨까요? 관심 있으신 분 댓글 남겨주세요 💡', INTERVAL '-3 hours'),
  ('EMP001', '주니어 개발자 멘토링 프로그램 1기 모집 시작합니다. 함께 성장하고 싶은 분들 환영해요 💻', INTERVAL '-30 hours'),
  ('EMP002', '새벽 3시 장애 대응 완료... 커피 한 잔 마셔야겠어요 ☕ 그래도 10분 만에 복구 성공!', INTERVAL '-2 hours'),
  ('EMP002', 'MyBatis vs JPA 어느 쪽 선호하세요? 복잡한 쿼리가 많은 프로젝트에선 MyBatis가 확실히 강하더라고요.', INTERVAL '-28 hours'),
  ('EMP003', '사용성 테스트 결과 공유! 메인 화면 전환율 23% 개선됐어요. 작은 UX 개선이 큰 차이를 만드네요 🎉', INTERVAL '-5 hours'),
  ('EMP003', '다크모드 vs 라이트모드, 여러분은? 저는 회사에선 라이트모드, 집에선 다크모드 씁니다 ☀️🌙', INTERVAL '-26 hours'),
  ('EMP004', '이번 스프린트 회고 완료. 팀 속도 지난 분기 대비 15% 향상! 다들 정말 수고 많으셨어요 👏', INTERVAL '-4 hours'),
  ('EMP004', 'OKR 설정 시즌이 왔네요. 팀 목표와 개인 목표를 잘 정렬하는 게 핵심이라고 생각해요. 어떻게들 설정하시나요?', INTERVAL '-22 hours'),
  ('EMP005', '인스타그램 광고 CTR 분석 완료. 영상 콘텐츠가 이미지 대비 2.3배 높네요. 영상 콘텐츠 강화해야겠어요 📱', INTERVAL '-6 hours'),
  ('EMP005', '마케터에게 필수인 GA4 세팅 완료했습니다. 이제 데이터 기반으로 의사결정 할 수 있어요 📊', INTERVAL '-20 hours'),
  ('EMP006', '쿠버네티스 HPA 설정으로 트래픽 급증 대응 완료. 오토스케일링의 힘이란... 🚀', INTERVAL '-3 hours'),
  ('EMP006', 'IaC(Infrastructure as Code) 도입 검토 중입니다. Terraform vs Pulumi 사용해보신 분 경험 공유 부탁드려요!', INTERVAL '-18 hours'),
  ('EMP007', 'Vite로 빌드 도구 마이그레이션 완료! CRA 대비 콜드 스타트 8배 빨라졌어요. 정말 추천합니다 ⚡', INTERVAL '-4 hours'),
  ('EMP007', '웹 폰트 최적화로 LCP 2.1초 → 0.9초 달성했습니다. font-display: swap 하나로 이렇게 달라질 줄은..!', INTERVAL '-16 hours'),
  ('EMP008', 'dbt 도입 후 데이터 변환 파이프라인이 훨씬 깔끔해졌어요. SQL로 데이터 품질 테스트까지 가능하다니! 📊', INTERVAL '-5 hours'),
  ('EMP008', '실시간 이상 감지 알럿 시스템 구축 완료. Slack 연동까지 했더니 팀원들 반응이 좋아요 🔔', INTERVAL '-14 hours'),
  ('EMP009', '올해 신입 교육 프로그램 만족도 93점 달성! 작년 대비 12점 향상이에요. 다들 열심히 해주셔서 감사합니다 🌱', INTERVAL '-2 hours'),
  ('EMP009', '재택근무와 오피스 출근 하이브리드 정책 설문 결과 공유드립니다. 3:2 비율이 가장 선호도가 높았어요.', INTERVAL '-12 hours'),
  ('EMP010', '제로 트러스트 보안 아키텍처 도입 계획 수립 완료. 단계적으로 전환할 예정입니다 🔐', INTERVAL '-7 hours'),
  ('EMP010', '피싱 메일 모의 훈련 결과: 전사 클릭률 8% → 3%로 감소! 보안 인식이 많이 향상됐습니다 👍', INTERVAL '-10 hours')
) AS v(emp_no, content, ts)
JOIN users u ON u.employee_no = v.emp_no;
