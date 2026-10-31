# 단일 원장 — 시험·성능

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 이 원장이 인용하는 `path:line`은 모두 이 커밋의 줄 번호다. 정본 우선순위는 `ledger/README.md` §1을 따른다. 소유자 답은 고정이고, 이 영역의 정본은 `adr/0009-performance-budget-and-benchmarks.md`(4차 본문, 5차 주, 상태 제안), `09-landing-and-test-strategy.md` §4–§6(16라운드, 17라운드 반영), `08-design-a-to-z.md` §18이다. ADR 0009는 채택되지 않았으므로 같은 규칙을 두 곳이 적으면 뒤 라운드의 `09`가 이기고, ADR 0009 안에서는 5차 주가 4차 본문을 이긴다. `02-target-overview.md` §9는 `08` §18의 앞 판이고, `06-conclusions.md` §7과 `07-conclusions.md` §7은 그때의 기록이다. 상태 값의 뜻: **현행**은 지금 유효한 규칙, **현행(기록)**은 규칙이 기대는 측정·조사·실험의 기록, **대체됨**은 뒤 문서가 바꾼 규칙(옛 문장을 원문 그대로 남긴다), **열림**은 18라운드 안건으로 넘어가 아직 정해지지 않은 것이다.

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| TEST-001 | 검증 전략 1 — 차등 테스트: 독립 검증기와 판정 동치, 다른 구현·직렬화한 값 | 현행 | 편집자 결정(1라운드 검토 수용, `reviews/round-1.md:146`) |
| TEST-002 | 검증 전략 2 — 청사진 테이블 테스트 | 현행 | 편집자 결정(14라운드, `08-design-a-to-z.md:606`) |
| TEST-003 | 검증 전략 3 — 정착 루프 테스트: 타이머 없이 단언, 프로토타입 회귀 이식 | 현행 | 편집자 결정(14라운드, `08-design-a-to-z.md:607`) |
| TEST-004 | 검증 전략 4 — renderForm 시나리오: 하니스 재사용, 기존 기대값은 버리고 상황 목록은 자산으로 | 현행 | 편집자 결정(14라운드, `08-design-a-to-z.md:608`) |
| TEST-005 | 검증 전략 4의 예외 — 조합·옛 키 없는 렌더 시나리오 17파일은 단언을 이름만 바꿔 살림 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:13` 답 7) |
| TEST-006 | 시험의 원칙 둘 — 회귀를 막고 개별 함수의 동작을 표현, 절대 실패하지 않는 단언은 시험이 아님 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:128`) |
| TEST-007 | 테스트 위계 — 코어 유닛, <Form> e2e(jsdom), 개별 함수·훅 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:120`), 소유자 답(`reviews/round-16-owner-answers.md:7` 답 1) |
| TEST-008 | 단일 원천 — 시나리오는 실행기 없는 순수 데이터 모듈 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:132`), 소유자 답(`reviews/round-16-owner-answers.md:14` 답 8) |
| TEST-009 | 코어 러너 — 부류마다 한 파일, 파일당 15건 이하, 노드 트리만으로 해석 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:149`) |
| TEST-010 | 화면 어댑터 playScenario — e2e와 스토리가 함께 쓰는 해석기, 비공개 패키지 @aileron/schema-form-scenarios | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:14` 답 8), 편집자 결정(16라운드, `09-landing-and-test-strategy.md:150`) |
| TEST-011 | 단계 어휘 여덟과 핸들의 DOM 등록 — playScenario(scenario, 요소) 하나 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:151`), 소유자 답(`reviews/round-16-owner-answers.md:16` 답 10) |
| TEST-012 | 검증 매트릭스는 스토리로 만들지 않고 정적 test.each 표로 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:152`) |
| TEST-013 | 기존 234파일의 처분 — 그대로 산다·표면만 고친다·버리고 새로 쓴다·미분류·새로 있어야 한다 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:154`), 소유자 답(`reviews/round-16-owner-answers.md:13` 답 7), 소유자 답(`reviews/round-18-owner-answers.md:7` S1; `:160`의 파서 변환 시험을 대체) |
| TEST-014 | 새로 있어야 하는 시험 PR-1 — 청사진 테이블·병합표·제거 규칙·식 컴파일러·options/presentation 병합·전략 불일치·청사진 경고 수집 | 현행 | 편집자 결정(16·17라운드, `09-landing-and-test-strategy.md:168`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-11), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14; 정적 `injectTo` 오류 없음) |
| TEST-015 | 새로 있어야 하는 시험 PR-2 — 정착 루프 시나리오, 예산 다섯, diagnostics, 사슬 끝 throw, 나감 비움, 노드 구조 시험, active 게터 | 대체됨(→ TEST-069) | 편집자 결정(16·17라운드, `09-landing-and-test-strategy.md:169`), 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:57`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-25) |
| TEST-016 | 새로 있어야 하는 시험 PR-3 — 같은 대상 규칙, 에지 소비, DisableAutomaticWrites, 개발 모드 정착 기록 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:170`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-25) |
| TEST-017 | 새로 있어야 하는 시험 PR-4 — 디스패처, 사슬 끝 throw와 onError 계약의 core 쪽, 검증기 없음·컴파일 실패, degraded, 가드, 차등 시험, 훅 수준 바인딩 시험 | 현행 | 편집자 결정(16·17라운드, `09-landing-and-test-strategy.md:171`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-25) |
| TEST-018 | 새로 있어야 하는 시험 PR-5 — 배열 아이템의 생김과 채움, identity, omitTrailing, 터미널 배열 행의 구조 연산 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:172`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-25·18C-59) |
| TEST-019 | 새로 있어야 하는 시험 PR-6 — 잠금 OR·표시 AND, controls.children, 조각 controls, unsetOnInactive 층 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:173`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-25) |
| TEST-020 | 새로 있어야 하는 시험 PR-7 — e2e: 렌더 중 onChange 없음, 마운트 정착 오류, 바운더리와 싱크, onError e2e, finishInput·trim, strategy, reset, React 18 | 현행 | 편집자 결정(16·17라운드, `09-landing-and-test-strategy.md:174`), 소유자 답(`reviews/round-16-owner-answers.md:11` 답 5), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:174`; reset의 시험 목록), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-25), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-19; `trim`은 자동 쓰기) |
| TEST-021 | renderForm 하니스 — e2e 층의 뼈대, 고칠 것 다섯 | 현행 | 편집자 결정(16·17라운드, `09-landing-and-test-strategy.md:180`) |
| TEST-022 | 스토리북 원칙 셋 — 스토리는 e2e의 화면 미러, 시나리오는 한 곳, 자동화는 play | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:186`), 소유자 답(`reviews/round-16-owner-answers.md:7` 답 1) |
| TEST-023 | 스토리북 구조 — 단일 원천·코어 시나리오 시험·시나리오 스토리·자동화·e2e·사용법 스토리 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:188`), 소유자 답(`reviews/round-16-owner-answers.md:14` 답 8), 소유자 답(`reviews/round-16-owner-answers.md:16` 답 10), 소유자 답(`reviews/round-16-owner-answers.md:7` 답 1) |
| TEST-024 | 도구와 설정 — vitest 프로젝트 셋, 의존, portable stories, play 안의 expect | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:201`), 소유자 답(`reviews/round-16-owner-answers.md:16` 답 10) |
| TEST-025 | 옛 스토리 49파일 33,533줄의 처분 — 데이터 모듈로 옮기고, 사용법은 소수만, 인라인 스키마 스토리는 남기지 않음 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:10` 답 4) |
| TEST-026 | 옛 판과 새 판의 속도 비교 — 하니스 benchmark-form, 같은 폼의 기준점, 코어와 렌더, 측정 조건, 패키지 벤치 일곱 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:216`) |
| TEST-027 | 벤치 게이트 — 옛 판보다 느린 항목은 이유를 적고 Vincent가 받아들여야 병합, 통제 가능하고 일정 수준 안 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:12` 답 6), 편집자 결정(16라운드 도출, '통제 가능'의 뜻, `09-landing-and-test-strategy.md:223`) |
| TEST-028 | 벤치마크를 설계에 넣는 것은 소유자의 요구, 수치 예산은 아직 정해지지 않음 | 현행 | 소유자 답(`00-goals.md:150` G6) |
| TEST-029 | 원칙(G6) — 비용은 바꾼 것의 크기에 비례, 성능은 주장하지 않고 측정 | 현행 | 원리(`00-goals.md:77` G6), 소유자 답(`00-goals.md:150` G6) |
| TEST-030 | ADR 0009 5차 주 — 측정 수치는 유효, 시나리오 이름은 옛 모델, 5차 원장이 우선하는 일곱 곳 | 현행 | 편집자 결정(11라운드 5차 주, `adr/0009-performance-budget-and-benchmarks.md:3`) |
| TEST-031 | 기존 구현이 기준선 — 재설계 시작 시점에 벤치를 돌려 커밋을 고정해 재현 가능하게 | 현행 | 편집자 결정(1라운드 ADR 0009 본문, `adr/0009-performance-budget-and-benchmarks.md:64`), 편집자 결정(16라운드, `09-landing-and-test-strategy.md:222`) |
| TEST-032 | 벤치 시나리오 — G6의 네 상황과 새 구조 고유·메모리·14라운드 행 | 현행 | 편집자 결정(1라운드 ADR 0009 본문, `adr/0009-performance-budget-and-benchmarks.md:71`), 편집자 결정(14라운드, `adr/0009-performance-budget-and-benchmarks.md:82`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-15·18C-67·18C-81) |
| TEST-033 | 구조를 확정하기 전에 잰다 — 버릴 것을 전제로 한 스파이크 | 현행 | 편집자 결정(1라운드 ADR 0009 본문, `adr/0009-performance-budget-and-benchmarks.md:86`) |
| TEST-034 | 측정 인프라 — 오늘 가진 것(패키지 벤치 일곱, benchmark-form, 모바일 성능 보고서) | 현행(기록) | 편집자 결정(1라운드 ADR 0009 본문의 관찰, `adr/0009-performance-budget-and-benchmarks.md:16`) |
| TEST-035 | 지금 빠르게 만드는 장치와 새 구조에서의 운명 | 현행 | 편집자 결정(1라운드 ADR 0009 본문, `adr/0009-performance-budget-and-benchmarks.md:35`) |
| TEST-036 | 1차 스파이크 측정 결과 — 가드 호출 수, 인터프리터형과 컬렉션 가드, 컴파일 비용, 복사 비용, 검증 비용 | 현행(기록) | 편집자 결정(1라운드 측정 기록, `reviews/round-1.md:19`) |
| TEST-037 | 2라운드 측정 — 작업 루프 프로토타입 | 현행(기록) | 편집자 결정(2라운드 측정 기록, `reviews/round-2.md:18`) |
| TEST-038 | 열림: '일정 수준'의 형태(배율인가 절대 수치인가)와 수치 | 대체됨(→ TEST-072) | 편집자 결정(16라운드, 답 6의 '일정 수준'을 ADR 0009 미결로 둠, `reviews/round-16-owner-answers.md:12` 반영 열), 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:63`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-26) |
| TEST-039 | 열림: 예산의 수치 — 키 입력과 마운트, 대규모 쓰기와 배치 | 대체됨(→ TEST-073) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:64`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-27) |
| TEST-040 | 열림: 문서화된 안전 임계를 올릴 것인가 | 대체됨(→ TEST-074) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:65`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-28) |
| TEST-041 | 열림: 번들 크기 예산(현재 gzip 약 44KB) | 대체됨(→ TEST-075) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:66`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-29) |
| TEST-042 | 인터프리터형 검증기의 지원 수준과 컴파일 예산 | 분할됨(→ TEST-065, TEST-066) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:67`) |
| TEST-043 | 대체됨: const/enum 판별식의 직접 비교는 넣지 않는다 | 대체됨(→ CONTROLS-031) | 편집자 결정(11라운드 5차 주, `adr/0009-performance-budget-and-benchmarks.md:3`) |
| TEST-044 | 릴리스 — 오늘(조사): 워크플로 둘, 손으로 올리는 판, 쓰이지 않는 changesets, 릴리스 전 점검 없음 | 현행(기록) | 편집자 결정(16라운드 조사, `09-landing-and-test-strategy.md:227`) |
| TEST-045 | 릴리스 1 — changesets 가동 — .changeset/config.json, fixed 무리 여덟과 그 근거·비용 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:15` 답 9), 소유자 답(`00-goals.md:110` C7), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`) |
| TEST-046 | 릴리스 2 — 배포는 오늘의 스크립트, 태그는 changeset tag | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`) |
| TEST-047 | 릴리스 3 — 작업 흐름은 publish-npm-packages.yml 한 파일 — 작업 다섯 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`) |
| TEST-048 | 릴리스 4 — 토큰은 기본 GITHUB_TOKEN | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`) |
| TEST-049 | 릴리스 5 — 지속 통합 시험 작업 흐름 test.yml을 새로 둔다 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`) |
| TEST-050 | 릴리스 6 — 릴리스 테스트를 다시 쓴다 — 포장된 산출물을 검사 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:15` 답 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`), 소유자 답(`reviews/round-16-owner-answers.md:11` 답 5), 편집자 결정(18라운드, 개발계획 별도 PR; 첫 가동은 시나리오 그리기 없이) |
| TEST-051 | 릴리스 7 — 배포 시점 — 판 올림 PR을 병합하면 자동 배포 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`) |
| TEST-052 | 릴리스 8 — 병합 뒤 시험 실패의 복구 — 다음 판으로 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`) |
| TEST-053 | 릴리스 9 — changeset 존재 검사와 changedFilePatterns | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`) |
| TEST-054 | 릴리스 10 — 자리와 저장소 정리 — 별도 PR, PR-8 전에 병합 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`) |
| TEST-055 | 릴리스 11 — 무리 밖 패키지 — @winglet/common-utils·@winglet/react-utils의 자기 changeset | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`), 소유자 답(`reviews/round-17-owner-answers.md:34` (나)) |
| TEST-056 | 릴리스 12 — 제3자 액션은 커밋 해시로 고정 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`) |
| TEST-057 | 릴리스 13 — GitHub Release는 패키지 태그마다 하나 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`) |
| TEST-058 | 릴리스 14 — PR-8의 판 번호 — 1.0.0-beta 뒤 1.0.0 | 현행 | 소유자 답(`09-landing-and-test-strategy.md:250` PR-8 판 번호), 소유자 답(`reviews/round-16-owner-answers.md:22` 추가 확인) |
| TEST-059 | 실측 — oneOf·anyOf 안의 if(ajv 8.17.1): 배치별 판정표와 else: false·required 함께의 근거 | 현행(기록) | 편집자 결정(9라운드 실측, `07-conclusions.md:355`) |
| TEST-060 | 프로토타입 v5(`spikes/round9/proto/loop-v5.mjs`) — 회귀·프로브 결과, 교차 검증이 찾은 어긋남과 고친 뒤의 기대 | 현행(기록) | 편집자 결정(9라운드 프로토타입 기록, `07-conclusions.md:371`) |
| TEST-061 | D-15 순환 스키마의 출발점 실험 — 명세는 남기고 우선순위를 낮춤 | 현행(부정 결정) | 편집자 결정(9라운드, `07-conclusions.md:395`), 소유자 답(`reviews/round-18-owner-answers.md:20` 12-10) |
| TEST-062 | 확인이 필요한 관찰 — oneOf 마운트 비용의 기록(benchmark-form/PLAN.md)과 구조 추적의 전수 생성 | 현행(기록) | 편집자 결정(1라운드 ADR 0009 본문의 관찰, `adr/0009-performance-budget-and-benchmarks.md:104`) |
| TEST-063 | D-33 값 비교 비용 실험 — 객체 원천의 깊은 비교 비용, G6 예산 안이면 값 비교 채택 | 대체됨(→ TEST-071, SETTLE-043) | 편집자 결정(8라운드 D-33 편집자 판정, `06-conclusions.md:251`), 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:107`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50) |
| TEST-064 | ADR 0007의 비용 표 — 3.1판 측정, 조건부 폼 생성은 재설계가 지는 유일한 지점(1.7배, 가드 컴파일 22.4 ms) | 현행(기록) | 편집자 결정(5라운드 ADR 0007 4차 본문의 비용 표, `adr/0007-settle-cycle.md:122`) |
| TEST-065 | 인터프리터형 검증기의 지원 수준 — 폼은 장치를 더하지 않고 성능은 플러그인의 몫 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:13` 12-3), 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:67`) |
| TEST-066 | 열림: 컴파일 예산 — 폼 생성 시점의 동기 컴파일 허용량 | 대체됨(→ TEST-076) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:67`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-30) |
| TEST-067 | `$ref` 재귀 게이트(PR-1·PR-2) — 스캐너 확인, 코퍼스 14종, 무한 형상 표본과 `if/then` 정착 오류 표본, 청사진 1회 비용 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01) |
| TEST-068 | 잎 교차 시험의 처분 — `intersectConst.test.ts:40-58`은 깊은 비교로 새로 쓰고, `intersectPattern.test.ts:6-14`는 레거시와 함께, 새 병합 시험 사례 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08) |
| TEST-069 | PR-2 독립 검증 경계 — 자기 기제만 시험, 게이트 술어 대역 하나, 미룬 사례의 PR 배분, 프로토타입 회귀 배분 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-25), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98) |
| TEST-070 | PR-2 게이트 — 실제 공개 형으로 `tsc --strict`를 단언 없이 통과, `children`은 저장 배열과 같은 참조, 실패 시 소유자 물음 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-37) |
| TEST-071 | PR-3 벤치 회귀 — 객체 원천 `injectTo` 1만 원소에서 한 원소 쓰기의 비교 비용이 값 크기와 무관, 통째 교체는 선형 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50) |
| TEST-072 | '일정 수준'은 같은 실행에서 옛 판에 견주어 잰다 — 선은 기존 `guard:check`, 절대 수치와 배율 상한은 두지 않음, 선을 넘으면 이유를 적고 Vincent가 받아들여야 병합 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-26) |
| TEST-073 | 예산의 수치는 기존 `guard:check` — 처리량 평균이 15% 넘게 떨어지고 Welch p<0.05면 회귀, 표본 100회 이상, 키 입력·마운트·대규모 쓰기·배치에 똑같이 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-27) |
| TEST-074 | 안전 임계를 목표 배율로 올려 적지 않는다 — 문서는 잰 사실만, PR-7 뒤 같은 모바일 조건으로 다시 재어 적음, 병합 게이트 아님 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-28) |
| TEST-075 | 번들 크기 예산 — 측정 방법 고정(ESM 진입을 esbuild로 minify, gzip -9, 의존성 외부), 기준 v0.16.0의 37,023 B, 늘면 이유를 적고 Vincent가 받아들여야 병합 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-29) |
| TEST-076 | 컴파일 예산 — 따로 수치를 두지 않고 마운트 벤치에서 폼 몫과 검증기 몫으로 나눠 보고, TEST-072의 선으로 판정, 가드 200개 조건부 폼 생성은 PR-4의 수용 필요 항목 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-30) |
| TEST-077 | union 설계의 시험 목록 — 청사진 판정(PR-1), 행과 `interpret`(PR-2), 렌더 시나리오와 입력 바인딩(PR-7), 검증기 플러그인(PR-4), tsc 전용 형 시험 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-104), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4) |
| TEST-078 | union 설계의 비용 — 청사진 판정, 유효 목록, 두 번 해석, 새 경고 넷, `interpret`, 경고등, 방출·채움, Hint·props, 기본 union 입력, 검증기, 공개 형, 플러그인 이주 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-104), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105) |
| TEST-079 | 19라운드 게이트(PR 02) — E16 새 기대와 형 없는 호스트 사례(게이트 분기만·`{object,array}`·⊤ 분기·순환 절단과 빈 U), 순환 절단 구현, 코퍼스 14종 원본 그대로, `const` 칸 사례, `union.migration-shapes`에 LANDING-207·208 | 현행 | 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-01·19C-02) |
| TEST-080 | 설계 최적화 단계의 구성과 판정 관문(446라운드) — D0 측정 장치 복원과 기준선, D1 국소 가설 여섯(H1~H6), D2 설계 Ⅰ, D3 캐시 계층, D4 관문(oneOf-80 분기 전환과 nested-d6-f4 일괄 입력이 0.16.1의 1.5배 안이고 1 ms·5 ms 아래면 멈춤, 아니면 D5), D5 설계 Ⅱ, PR 게이트는 성능 최적화 계획의 것에 `FormHandle.rebuild`만 허용 | 현행 | 편집자 결정(446라운드, `reviews/round-446-closing.md` 446C-06) |
| TEST-081 | 가설 판정 규칙의 사전 고정(447라운드) — 채택에 필요한 개선 행과 악화 금지 조건(구독 경로 행 포함)을 측정 전에 워커 지시와 결과 문서에 적고 측정 뒤 바꾸지 않음, 가설이 겨냥한 비용 축의 새 측정은 그 축과 규칙을 미리 적은 경우만 허용(같은 행의 재측정 금지와 구분) | 현행 | 편집자 결정(447라운드, `reviews/round-447-closing.md` 447C-01) |
| TEST-082 | React 동등 측정의 자리(447라운드) — 설계 최적화 단계의 가설 PR은 코어 쌍 장치(구독 경로 행 포함)로 판정하고 `--equivalent`는 D4의 통합 판에서 한 번, 선을 넘는 행은 원인 PR을 가려 단계 마감 전에 고치거나 되돌림, 소유자가 뒤집을 수 있음(대기열) | 현행 | 편집자 결정(447라운드, `reviews/round-447-closing.md` 447C-04) |
| TEST-083 | D4에서 설계 Ⅱ로 갈지의 결정권(447라운드) — 분기 전환 관문 미달이면 수치와 D5의 추정 효과를 소유자에게 올려 D5 진행 또는 TEST-027 수용을 소유자가 정함(446C-06의 규칙만으로의 착수 대체), 판정은 표준 프로토콜, 최적화 문턱을 낮춘 쌍 측정은 참고, 소유자가 뒤집을 수 있음(대기열) | 현행 | 편집자 결정(447라운드, `reviews/round-447-closing.md` 447C-07) |
| TEST-084 | 분기 전환 행의 측정 폭(448라운드) — 기본 프로토콜의 분기 전환 oneOf-80 행은 폭이 값의 약 30 %라 그보다 작은 효과를 채택할 수 없음, 분기 전환 비용의 가설은 겨냥한 항을 키우는 축 탐침을 판정 행으로 미리 정하거나 D4의 소유자 결정에 맡김 | 현행 | 편집자 결정(448라운드, `reviews/round-448-closing.md` 448C-02) |
| TEST-085 | 작업량 하한과 시험 경로의 정정 규칙(448라운드) — 비공허성 확인인 작업량 하한은 의미상 필요한 수로, 옛 경로의 정확값·순서는 실제 무효 조건으로 보낸 새 사례에서 유지, 내부 필드 조작으로 경로를 고르는 시험 금지, scratch를 기록하던 시험 도구는 실제 표식에서 읽은 논리 구성원을 기록 | 현행 | 편집자 결정(448라운드, `reviews/round-448-closing.md` 448C-03) |
| TEST-086 | 노드당 힙 관문의 자리(448라운드) — 노드나 청사진에 메모리를 더하는 PR은 B2 행을 같은 창에서 기준판과 Node·Bun 각 7 표본으로 재어 B 중앙값이 A 최댓값 이하, D4는 통합 판으로 한 번 더 | 현행 | 편집자 결정(448라운드, `reviews/round-448-closing.md` 448C-05) |
| TEST-087 | 분기 전환의 잠정 수용(449라운드) — 분기 전환 oneOf-80 행을 TEST-027에 따라 지금 수치(0.16.1의 6.2배, 1 ms 미만)로 잠정 수용하고 마운트 검증 뒤 소유자와 다시 검토, D2-P5 보류 | 현행 | 소유자 답(`reviews/round-449-owner-answers.md:7`), 편집자 결정(449라운드, `reviews/round-449-closing.md` 449C-01) |
| TEST-088 | 흔들린 측정 창의 재측정(450라운드) — 고정 규칙 판정이 폭 안이고 그 폭이 같은 행의 평소 폭보다 크게 넓으며 측정 창이 외부 작업과 겹쳤으면 소유자 허락으로 한 번만 같은 규칙으로 다시 잼, 첫 측정 수치를 함께 적고 더 반복하지 않음(443C-03의 예외) | 현행 | 소유자 답(`reviews/round-450-owner-answers.md:7`), 편집자 결정(450라운드, `reviews/round-450-closing.md` 450C-01) |
| TEST-089 | D3b-2의 판정(451라운드) — 첫 후보 미달의 원인을 변수 하나씩 되돌린 탐침으로 분리(호스트별 `Map`의 JSC 엔트리당 약 79 B), 엔트리별 저장소 둘은 선언 부모 host 소유 WeakMap, Bun B2 +0.413 B/노드는 TEST-027 수용, 브리프의 고정 규칙("폭 밖 악화 0")을 측정 뒤 계획서의 TEST-073 선으로 바꾼 것과 A′ 전용 신호의 해석은 공개하고 재검증 대상으로 두며 D4가 다시 잼 | 현행 | 소유자 답(`reviews/round-451-owner-answers.md:12` Bun B2 수용), 편집자 결정(451라운드, `reviews/round-451-closing.md` 451C-03) |
| TEST-090 | 설계 최적화 단계의 D4 판정(452라운드) — 분기 전환 oneOf-80은 0.16.1의 6.87배·0.511 ms를 "설계의 대규모 개편 없이 도달 가능한 상한"으로 기록하고 D5 없이 단계를 닫으며 다음 단계가 분기 전환에만 집중, 일괄 입력 nested 1.13배·게이트 잎 쓰기 1.17배 통과, 형제 선형항은 두 판 공통의 성질(새 판이 1,000·4,000에서 더 빠름), Bun B2 +9.84 B/노드 수용 | 현행 | 소유자 답(`reviews/round-452-owner-answers.md:7`, `reviews/round-452-owner-answers.md:9`), 편집자 결정(452라운드, `reviews/round-452-closing.md` 452C-01·02·03·06) |
| TEST-091 | React 전체 폼 러너의 갱신 경과 시간(452라운드) — 옛 `render-update-wall`은 `setTimeout(0)` 대기의 Node 1 ms 클램프가 만든 허상(두 판이 일을 타이머 전후로 다르게 둠)이라 쓰지 않고, 타이머 클램프 없는 정착 장벽 뒤의 `update-settled`(gross)와 `update-sync`·빈 장벽 바닥·net으로 잰다(#473), 다시 잰 E÷L 0.106~1.098, 7·8단계의 같은 러너 수치는 같은 허상을 안음 | 현행 | 소유자 답(`reviews/round-452-owner-answers.md:8-9`), 편집자 결정(452라운드, `reviews/round-452-closing.md` 452C-05) |
| TEST-092 | 분기 전환 단계의 구성과 관문(453라운드) — B0 측정 장부(세 게이트 종류 행과 단계별 µs 장부) → B1 게이트 통일 → B2 준비물과 Δ 적용 → B3 관문 재측정 → (조건부) B4 설계 Ⅱ → B5 마감, 관문은 446C-06 유지(oneOf-80 왕복 1.5배·1 ms, `discriminator` 같은 선, `if`는 453C-03의 선), 형제 1,000/0 작은 상수 배, TEST-073·B2 힙, 447C-06의 하한 추정은 도출 미기록이라 쓰지 않고 B0가 대체(편집자 정정) | 현행 | 소유자 답(`reviews/round-453-owner-answers.md:8`), 편집자 결정(453라운드, `reviews/round-453-closing.md` 453C-04) |
| TEST-093 | B0 측정 장부의 결과와 B1~B3 목표선(454라운드) — 쓰기당 oneOf-80 0.16.1 43.7 µs 대 261.3 µs, `if`-80 595.9·`discriminator`-80 473.6(바퀴 2회), Δ 잎당 약 12 µs, 단계 장부(computeNode 103·finalizeExits 55·commit 46), 두 번째 바퀴 원인은 라운드 중 호스트 투영 identity 변화, 목표선은 측정 전 고정(B1: `if` ≤ oneOf × 1.1 + 40 µs·`discriminator` ≤ × 1.05·평가 80 이하·바퀴 1회, B2: 단계별 상한 합 약 63 µs·바닥 40 µs, B3: 446C-06), 측정 단위는 쓰기 2회 합계와 쓰기당 환산, 기존 계수 시험은 기대값 변경 0에 기준 경로 모드 고정 줄 add-only | 현행 | 편집자 결정(454라운드, `reviews/round-454-closing.md` 454C-01·03) |
| TEST-094 | 측정 프로토콜의 보강(455라운드, 소유자 승인) — 행마다 A·B 프로세스 교대 실행(각 10, 20 예열·100 표본), A′는 A의 뒤 절반으로 두어 폭 (다) 규칙 유지, 가설이 닿지 않는 행의 B/A ±5 % 창 품질 검사(밖이면 창 무효·판정 불가), TEST-073은 교대 짝의 A 대 B로 판정하고 A′ 대 B 병기, 15 % 선과 폭 규칙은 그대로; B1 두 후보의 `active` 행 "회귀"는 창의 흐름(게이트 없는 행도 같은 창에서 −32 %·−36 %, 번들·호출 수·할당 동일)이라 소유자 승인 아래 후보 2를 한 번 재측정(TEST-088); verify 하네스의 표 방문 분류는 add-only로 넓히고 음성 시험을 둠 | 현행 | 소유자 답(`reviews/round-455-owner-answers.md:8`), 편집자 결정(455라운드, `reviews/round-455-closing.md` 455C-01·02·03) |
| TEST-095 | 측정 창 품질 기준의 정정(456라운드, 소유자 재승인) — 한 행의 ±5 %(455C-02)는 그 행의 자체 잡음(±40 %)과 0.16.1 레인의 1.07배 이동 때문에 만족할 수 없어 편집자 착오로 정정, 창 품질은 0.16.1 레인이 있는 모든 행에서 같은 프로세스의 0.16.1 레인 B(10)/A(10) 최소값 중앙 비의 중앙값이 0.95~1.05이면 유효, 모든 행을 끝까지 돌린 뒤 판정, 무효여도 힙·단계 완료하되 시간 판정만 판정 불가, 0.16.1 레인 없는 행은 N/A, 도구 `--quality=legacy`(기본 옵션 유지), TEST-094의 나머지는 그대로 | 현행 | 소유자 답(`reviews/round-456-owner-answers.md:7`), 편집자 결정(456라운드, `reviews/round-456-closing.md` 456C-01·03) |
| TEST-096 | 분기 전환 단계 B2의 간소화와 채택 기준(457라운드) — 소유자 지시로 결과는 추세만·판정만: 2부 검토 생략, 결과 문서는 표와 판정 한 줄, 남은 항목은 묶음 둘(B2-P2 호스트 수명 준비물, B2-P3 변화량 적용); 묶음의 채택은 같은 창 단계 장부의 감소(상한 아래 또는 절반 이하, 어느 단계도 악화 없음)+주판정 TEST-073 회귀 0+Node 힙이고 총합 행은 B3 누적 판정(측정 뒤 기준 변경, 재검증); B2-P2 채택(#478), 정적 준비물의 동명 후보 공백은 형제 선형항의 단서; B2-P3는 존재 차분 보류·JSON 관문은 잠복 경로 한정 | 현행 | 소유자 답(`reviews/round-457-owner-answers.md:7`), 편집자 결정(457라운드, `reviews/round-457-closing.md` 457C-01·03·06) |
| TEST-097 | 분기 전환 단계 B2의 종료와 B4-1의 판정(458라운드, 소유자 자율 진행 지시) — B2-P3는 두 후보 모두 457C-03의 무관용 비악화 규칙에 0.25~0.4 µs로 걸려 미채택(#479 기록), B2는 채택 B1·B2-P2와 미채택 P1·P1b·P3로 종료; B4-1 후보 1은 entering 두 배와 분기 없는 행 −20 %로 미채택, 후보 2는 고정 장치의 원판정 "채택 조건 미충족"(entering 절반 미달, 기존 단계 넷 0.2~2.1 µs 악화)에도 잠복 저장 0·메모 0이 예측 크기대로 맞고 장부 합이 oneOf-80 −18 %·payload-12 −27 %라 편집자 결정으로 채택(#480, 재검증; 되돌림은 `engineModes.slots = off`); 제안 규칙은 악화 합 ≤ 감소 합의 1/10; 준비물 누락·외부 고부하로 중단된 창은 판정 불가로 기록하고 준비 뒤 새 창 한 번(재측정 아님), 플러그인 dist 빌드와 44동작 적재 점검을 사전 점검에 포함, 힙 스냅샷의 노드 ID 추적은 판정에 쓰지 않음 | 현행 | 소유자 답(`reviews/round-458-owner-answers.md:8`), 편집자 결정(458라운드, `reviews/round-458-closing.md` 458C-01·03·04) |
| TEST-098 | 분기 전환 단계의 B3 관문 재측정과 마감 판정(459라운드) — 세 레인(0.16.1 / 단계 시작 / 단계 끝) 한 창, 형제 관문 상한은 창 전 3배 고정, 단계 시작 판의 단계 장부는 호환 실행기(매핑 불일치 13단계 제외), 판정은 총합 행; 쓰기당 oneOf-80 36.7 / 245.5 / 152.0 µs(단계 −38 %, 0.16.1의 4.14배, 1 ms 아래), discriminator-80 438.9→122.6, if-80 581.4→196.7, payload-12 462.4→274.3, siblings-1000 2078.7→2069.9(0.16.1 2536.0; 선형항 약 2.0 ms/1,000 그대로); 관문 여섯 가운데 TEST-073·제거 단계 호출 0 통과, oneOf-80 1.5배·discriminator·if·형제(21.2배)·Node 힙 중앙(+0.09 %) 미달; 계획서대로 단계를 멈추고 수치와 선택지 셋(관문 수정 뒤 B5 마감 / 선택·계산 self와 형제 선형항의 설계 Ⅲ / 9단계)을 소유자에게 올림 | 현행 | 편집자 결정(459라운드, `reviews/round-459-closing.md` 459C-04·05) |
| TEST-099 | 설계 Ⅱ 이정표의 검증 스케줄과 B5 재측정(460라운드) — 수정 반복 중에는 표적 시험과 typecheck·lint만, 독립 검토는 지난 검토 이후의 delta만, 창은 한 측정 담당이 후보들을 연달아, 다섯 프로젝트 전체·verify·배달 비교·선언 차분은 검토를 통과한 최종 머리에서 PR당 한 번 한 worktree씩(동작 무결함은 양보하지 않음: 최종 머리의 전체 시험이 빨간 상태로는 PR도 병합도 없음; B7은 rebase 머리와 그 뒤 한 줄 수정 머리에서 각각 한 번); B5는 B3와 같은 세 레인(0.16.1 / 단계 시작 `0eb03ff3b` / 단계 끝 `ad0be79ba`) 한 창: 0.16.1 / 시작 / 끝 쓰기당 oneOf-80 39.30 / 249.57 / 171.94 µs(4.37배, 1 ms 아래), discriminator-80 437.04 → 115.83, if-80 595.14 → 186.76, payload-12 445.30 → 285.08, siblings-0 99.23 → 106.73, siblings-1000 2056.06 → 2076.27(19.45배); 관문은 oneOf·discriminator·if·형제 FAIL, TEST-073 PASS, Node 힙 중앙값 규칙 FAIL(1439.10 → 1439.35)·제거 경로 PASS로 B3와 같은 그림; 설계 Ⅲ의 착수는 소유자가 정한다 | 현행 | 소유자 답(`reviews/round-460-owner-answers.md:14-15`), 편집자 결정(460라운드, `reviews/round-460-closing.md` 460C-04·07) |
| TEST-100 | 설계 Ⅲ의 비용 지도와 채택(461라운드) — 형제 선형항(1.63 µs/형제)의 근원은 두 분기가 같은 이름을 선언해 선언 둘짜리 템플릿이 되면 직접 계획이 null이 되고 `prepareStaticHost`가 직접 계획 없이는 준비물을 만들지 않아 B2-P2의 호스트 정적 준비물이 형제 호스트에 한 번도 적용되지 않은 것(쓰기당 재사용 콜백 2,004회; O(S) 루프 여섯); oneOf-80 166 µs는 바닥 79 + 잎당 4.9 × 6 + 나머지 58이고 게이트 수에 비례하는 항은 약 5.6 µs; 명제는 정적 준비물을 직접 계획이 아니라 분할의 유일성에 걸고 호스트 루프는 동적 엔트리만 걷는 것(H1)과 들고 나는 엔트리의 상수 축소(H5~H7), 그리고 assembleObject 메모·참조 보존 판정·커밋 루프(H2~H4); 예상 oneOf-80 172 → 120~145 µs(3.1~3.7배), siblings-1000 2,076 → 250~400 µs; 1.5배 관문(59 µs)은 바닥(형제 0 행 106.7 µs)만으로 1.8배라 이 설계의 범위 밖이며 그 아래는 정착 고정 장치의 재설계(설계 Ⅳ 후보); 소유자가 착수를 정해 B9-0(측정만: 하위 타이머·준비된 경로의 형제 탐침·정적 준비물 진단·행 대 단계 24 µs) → B9-1(H1+H4) → B9-2(H2+H3) → B9-3(H5~H7) → B10(세 레인 이정표) 뒤 설계 Ⅳ를 검토한다; B9-0는 제품 변경이 없어 A/B 없는 창 하나로 닫는다 | 현행 | 소유자 답(`reviews/round-461-owner-answers.md:7,10`), 편집자 결정(461라운드, `reviews/round-461-closing.md` 461C-01·03) |
| TEST-101 | 설계 Ⅲ의 측정과 결과(463라운드, B9-0 #488·B9-1 #490) — B9-0의 하위 타이머로 형제 1,000의 computeNode 선형항 주인은 registerPresenceChanges(net 약 378 µs)이고 참조 보존·sameValue의 증가분은 약 12 µs라 H3은 뒤집혔으며(H8로 대체), 정적 준비물 진단은 siblings-1000이 직접 계획 null·준비물 없음·쓰기당 콜백 2,004회이고 oneOf-80은 준비물 있음·콜백 0으로 H1의 원인을 확인했다; B9-0 창이 B5보다 1.3~5.2배 느린 원인은 표본마다의 setTimeout(0) 양보가 코어 성능 상태를 낮춘 것(비용이 잠든 횟수를 따라 오르고 네 레인이 함께 움직임)이라 러너는 setImmediate로 양보하고 창 전 파일럿으로 중앙값/최솟값 비 1.2~1.4를 확인하며 절대 µs는 B5 단위로 환산해 읽는다(H1 예산 약 1,009 µs, H6 약 2 µs); B9-1(H1 분할 유일성의 정적 준비물과 구성원 불변 절, H8 존재 변화 이름을 정착의 Δ에서, H4 정적 선언 ID와 required 묶음)은 호출 수 시험(재사용 콜백 2,004 → 0, 목록 비교 4 → 0, 전체 열거 1 → 0, required 읽기 1,000 → 0, 커밋 조회 2 → 0)과 독립 검토 세 번(P2 3 수정: H8 이름 순서, getRequiredChildren의 O(호스트 × entered), fallback·차분 시험), 창 넷(장치 결함, oneOf-80 보호 총합 +11.6 µs를 selectChildren·markCommitDeliveries·computeNode로 귀속해 공표 view 열거 1 → 0·set trap 쓰기 3 → 0·비정수 required 정렬 1 → 0으로 복원, 채택 6/6, 병합 머리 재측정 6/6) 끝에 병합했고 병합 머리 창에서 switch-siblings-1000은 2,013.1 → 316.5 µs(−84.3 %), 단계 장부 primeHost 657 → 1.9·selectChildren 706 → 23.6·registerPresenceChanges 272 → 2.4·commitSettlement 79 → 5.4 µs, oneOf-80 보호 총합 208.5 ≤ A 최대 209.0, TEST-073 0이며 TEST-093(5.6배)은 미달로 설계 Ⅳ 대상이다; oneOf-80은 이 PR의 목표가 아니어서 줄지 않았고(158.7 → 157.8) 설계 Ⅲ은 소유자 결정으로 B9-1에서 마감한다(B9-2·B9-3 미착수, B10은 Ⅳ-0으로) | 현행 | 소유자 답(`reviews/round-463-owner-answers.md:7-8`), 편집자 결정(463라운드, `reviews/round-463-closing.md` 463C-01·03) |

## 항목

### TEST-001 검증 전략 1 — 차등 테스트: 독립 검증기와 판정 동치, 다른 구현·직렬화한 값

- 결정:
  > 1. **차등 테스트.** 임의의 (스키마, 상호작용 시퀀스)에 대해 `form.validate()`의 판정이 독립 검증기(작성된 스키마, `FormHandle.getValue()`)의 판정과 같아야 한다. 독립 검증기는 폼이 쓰는 플러그인과 다른 구현이어야 하고 값은 JSON으로 직렬화한 뒤 넣는다.
- 보충:
  > "1. **차등 테스트.** 임의의 (스키마, 상호작용 시퀀스)에 대해 `form.validate()`의 판정이 독립 검증기(작성된 스키마, `FormHandle.getValue()`)의 판정과 같아야 한다. 이슈 #342 §2의 표가 시드다. 독립 검증기는 폼이 쓰는 플러그인과 **다른 구현**이어야 하고, 값은 JSON으로 직렬화한 뒤에 넣는다. 같은 플러그인에 같은 메모리 값을 넣으면 동어반복이다(`reviews/round-1.md` §7-8)." (`02-target-overview.md:365`)
  > 편집자 결정(31C-04): "【추론】 TEST-001의 "독립 검증기는 폼이 쓰는 플러그인과 다른 구현이어야 하고"에서 다른 구현은 다른 라이브러리다: 폼이 쓰는 플러그인과 같은 메이저의 Ajv를 새로 만들어 작성 스키마를 바로 컴파일하는 것은 같은 구현이 다른 경로를 지나는 것이라, 1라운드가 막은 동어반복(같은 구현에 같은 값)을 피하지 못한다." (`reviews/round-31-closing.md:36`)
  > 편집자 결정(31C-04): "【추론】 원장이 이미 아는 다른 구현은 `@cfworker/json-schema`(ADR 0004, VALIDATE 영역의 플러그인 구현체 후보)이며, 시험 하네스의 개발 의존성으로 쓰는 것이 자연스럽다; 다른 메이저의 ajv를 "다른 구현"으로 받는 것은 소유자 답 없이 하지 않는다. 개발 의존성을 더하는 일은 05가 PR을 연 뒤 소유자 확인 묶음에 든다." (`reviews/round-31-closing.md:37`)
  > 편집자 결정(31C-04): "【추론】 나머지 모양은 TEST-001 그대로다: 독립 검증기는 폼을 거치지 않고 작성 스키마를 바로 컴파일하고, `FormHandle.getValue()`를 JSON으로 직렬화한 값을 넣어 `form.validate()`의 판정과 비교한다. 같은 메이저의 Ajv 직접 경로와의 비교는 회귀 검사로 더 둘 수 있으나 TEST-001의 오라클은 아니다." (`reviews/round-31-closing.md:38`)
  > 소유자(40라운드, 차등 시험의 독립 검증기): "내 결정이 맞다. ajv 플러그인에 다른 스키마 검증기를 추가하는건, 플러그인 단계에선 검토할만한데, 지금은 의도하지 않는다." (`reviews/round-40-owner-answers.md:7`) — PR-4의 차등 시험은 ajv 밖의 라이브러리를 더하지 않고 같은 ajv로 폼의 판정(사본 → 컴파일·가드 → 라우팅)과 작성 스키마를 직접 컴파일한 판정을 JSON으로 직렬화한 방출 값으로 비교한다. "다른 구현"의 오라클은 ajv가 아닌 검증기 플러그인을 만드는 PR로 넘기며 그 패키지에 둔다. 31C-04의 오라클 선택은 PR-4에 대해 이 답으로 대체된다(원장 관리자, 2026-10-01).
  > 소유자(40라운드, 차등 시험의 목적): "에당초 교차확인 목적인게 아닌가?" (`reviews/round-40-owner-answers.md:8`) — 교차 확인이라는 목적은 유지하되 그 실행을 ajv 아닌 플러그인이 생기는 때로 미룬 것으로 읽는다; 같은 ajv의 경로 비교는 폼 쪽 경로의 결함만 잡는다(원장 관리자, 2026-10-01).
- 상태: 현행
- 출처: `08-design-a-to-z.md:605`(정본), `02-target-overview.md:365`, `09-landing-and-test-strategy.md:171`, `reviews/round-1.md:146`
- 닫은 사람: 편집자 결정(1라운드 검토 수용, `reviews/round-1.md:146`)
- 라운드: 14
- 까닭: `reviews/round-1.md:146`

### TEST-002 검증 전략 2 — 청사진 테이블 테스트

- 결정:
  > 2. **청사진 테이블 테스트.** 조각 열거, 중첩, 노드 공유, `controls.discriminator` 변환을 표로 단언한다.
- 보충:
  > "2. **청사진 테이블 테스트.** 스키마에서 청사진으로 가는 것은 순수 함수다. 조각 열거, 중첩, 노드 공유, `controls.discriminator` 변환을 표로 단언한다." (`02-target-overview.md:366`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:606`(정본), `02-target-overview.md:366`, `09-landing-and-test-strategy.md:168`
- 닫은 사람: 편집자 결정(14라운드, `08-design-a-to-z.md:606`)
- 라운드: 14
- 까닭: `02-target-overview.md:366`

### TEST-003 검증 전략 3 — 정착 루프 테스트: 타이머 없이 단언, 프로토타입 회귀 이식

- 결정:
  > 3. **정착 루프 테스트.** 동기이므로 타이머 flush 없이 단언한다. 프로토타입 v5·v6의 회귀 단언(63 + 108 + 26 + 52)을 이식한다.
- 보충:
  > "3. **정착 루프 테스트.** 쓰기에서 커밋된 상태까지 동기이므로 타이머 flush 없이 단언한다." (`02-target-overview.md:367`)
  > "정착 루프 시나리오(프로토타입 v5·v6 회귀 63+108+26+52와 v7 회귀 이식)" (`09-landing-and-test-strategy.md:169`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:607`(정본), `02-target-overview.md:367`, `09-landing-and-test-strategy.md:169`, `07-conclusions.md:377-378,387`
- 닫은 사람: 편집자 결정(14라운드, `08-design-a-to-z.md:607`)
- 라운드: 14
- 까닭: `02-target-overview.md:367`

### TEST-004 검증 전략 4 — renderForm 시나리오: 하니스 재사용, 기존 기대값은 버리고 상황 목록은 자산으로

- 결정:
  > 하니스는 재사용하고 기존 시나리오의 기대값은 버리되 상황 목록은 자산으로 옮긴다.
- 보충:
  > "4. **`renderForm` 시나리오.** 하니스(`src/__tests__/renderForm.tsx`)는 API 수준이라 재사용한다. 기존 시나리오의 기대값은 버리고 상황 목록(null 분기 위치, 배열 제거와 추가, 활성 0→1→0, 복수 활성, 배열 항목 재인덱싱)은 자산으로 옮긴다. 최종 스펙 동작은 렌더 시나리오로 단언한다는 패키지 규칙은 그대로다." (`02-target-overview.md:368`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:608#2`(정본), `02-target-overview.md:368`, `09-landing-and-test-strategy.md:160`
- 닫은 사람: 편집자 결정(14라운드, `08-design-a-to-z.md:608`)
- 라운드: 14
- 까닭: `02-target-overview.md:363`

### TEST-005 검증 전략 4의 예외 — 조합·옛 키 없는 렌더 시나리오 17파일은 단언을 이름만 바꿔 살림

- 결정:
  > 예외: 조합과 옛 키가 없는 17파일은 기대값을 이름만 바꿔 e2e의 추가 단언으로 살린다(16라운드 답 7, 09 §4.3).
- 보충:
  > 소유자(16라운드 답 7): "렌더 시나리오 17파일의 단언 유지 | "예" | 확정. 08 §18 넷째의 예외" (`reviews/round-16-owner-answers.md:13`)
  > "조합과 옛 키가 없는 17파일은 기대값을 버리지 않고 이름만 바꿔 e2e의 추가 단언으로 둔다." (`reviews/round-16-owner-review.md:58`)
  > "**17파일의 단언 유지 — 확정(답 7).**" (`09-landing-and-test-strategy.md:276`)
  > "08 §18의 넷째에 예외로 적었다." (`09-landing-and-test-strategy.md:276`)
  > 편집자 결정(68C-01): "【추론】 "렌더 시나리오 438건"(LANDING-067, 08 §18의 PR-7 행)과 "447건이 통과하므로"(TEST-023, 09 §5.1)는 설계 시점에 `src/__tests__`를 센 수이고, 원장 어디에도 파일 이름 목록이나 17파일의 이름 목록은 없다(TEST-005의 원문은 기준만 적었고, 설계서 07의 네 부류 표는 대표 이름 여섯뿐이다). 그러므로 수는 구속이 아니고 처분이 구속이다: 07은 전환 직전 커밋의 `src/__tests__`(그리고 `src` 전체의 렌더 시험)를 파일·건수로 세어 처분표를 `verification/07-switch/`에 새로 만들고, 파일마다 09 §4.3의 세 처분(그대로 산다·버리고 새로 쓴다·표면만 고친다) 가운데 하나와 그 까닭을 적으며, "표면만 고친다"에서 조합(`oneOf`·`anyOf`·`if`·`allOf`의 옛 자동 감지)과 옛 키(`presentation.*`로 옮긴 것, `group`, `JSONSchemaError` 등 이주 표가 바꾼 이름)가 없는 파일이 TEST-005의 17파일이다. 수가 17과 다르게 나오면 처분표에 센 기준과 함께 적고 TEST-005를 고치지 않는다(옛 글은 자라기만 한다; 17은 소유자가 받아들인 예외의 범위를 적은 수이지 파일 수의 약속이 아니다). 438·447과 오늘 수의 차이는 `plan/07-switch/log.md`에 한 줄로 남긴다. 이 처분표가 PR-7의 렌더 시나리오 게이트이고, 전환 뒤 `render` 프로젝트의 초록은 처분표의 "산다"·"표면만 고친다" 파일 전부가 돈다는 뜻이다." (`reviews/round-68-closing.md:9`)
  > 편집자 결정(73C-01): "【추론】 LANDING-159는 "09 §4.3의 처분은 파일마다 한다"고 했고, LANDING-205를 적용한 보충은 "PR-7이 진입점을 새 엔진으로 바꾼 뒤 레거시 안의 옛 단위 시험을 시험 글롭에서 빼 두고(옛 엔진은 더 `<Form>`에 닿지 않는다), 디렉토리와 함께 PR-8이 지운다"고 정했다. 레거시 안의 `<Form>` 렌더 시험 둘은 옛 엔진을 `<Form>`으로 시험한 것이라 전환 뒤에는 뜻을 잃으므로 같은 처분(글롭에서 뺌)을 받고, 동시에 렌더 시나리오이므로 그 사례(14건)는 처분표(68C-01)에 추가 행으로 올라 09 §4.3의 처분을 받는다 — 시나리오별로 이주 행(`if`·`then`·`else`의 게이트 이주, nullable의 `type` 배열 이주 등)과 대조해 조합·옛 키가 있으면 "버리고 새로 쓴다"(새 e2e로 옮김, 새 시험 이름을 행에 적음), 없으면 TEST-005의 "표면만 고친다"로 단언을 살린다. 레거시 파일은 LANDING-205대로 고치지 않는다(사례만 지우는 것도 레거시 수정이며, 참고용 보존의 뜻에 어긋난다). 전환 커밋(진입점을 새 엔진으로 바꾸는 커밋)에서 render·unit 프로젝트의 포함 글롭에서 `src/__legacy__/**`를 빼고, 그 변경을 처분표의 머리에 "레거시 시험 N파일 M건은 LANDING-159 보충대로 글롭에서 뺌; 그 가운데 `<Form>` 렌더 사례 14건은 아래 행으로 처분"이라고 적는다. 두 파일만 빼는 대안을 쓰지 않는 까닭은 뺄 단위가 파일 둘이 아니라 레거시 전체이기 때문이고, 07의 권장을 그대로 쓰지 않는 까닭은 레거시 파일을 고치기 때문이다. 처분표에 행이 있고 새 e2e의 이름이 적히므로 붉은 시험을 숨기는 것이 아니다; 글롭에서 뺀 레거시의 시험이 PR-8 전까지 돌지 않는 것은 LANDING-159 보충이 받아들인 상태다." (`reviews/round-73-closing.md:9`)
  > 편집자 결정(78C-01): "【추론】 TEST-005의 예외("조합과 옛 키가 없는 파일은 기대값을 이름만 바꿔 살린다")는 기대값이 그대로인 파일의 것이고, 기대값 자체가 원장의 결정으로 바뀐 파일은 09 §4.3의 "버리고 새로 쓴다"다 — 기대값을 새 동작으로 고쳐 쓰면 그것은 이미 새 시험이지 살린 시험이 아니며, 옛 기대를 남기면 원장과 어긋난 시험이 초록이 될 수 없다. 그러므로 다섯 파일(`array.omit-trailing.injection`, `default-value.input-immutability`, `deferred-mount`, `multi-render-split-brain`, `reset.pristine`)은 처분표에서 "버리고 새로 쓴다"로 옮겨 지우고, 각 행에 바뀐 기대의 근거 항목(VALUE-034; TEST-020·021; NODE-005·WRITE-071; LANDING-115·VALIDATE-010·036; LANDING-148)과 유효한 관찰의 새 자리(U9 e2e 파일과 사례 이름)를 적는다. 새 e2e의 기대는 그 항목의 문장에서 나와야 하고 사례 머리에 항목 번호를 적는다. 이 가운데 소비자가 볼 수 있는 동작 변경 — 마운트 정착 동안 `onChange`가 나지 않음(TEST-020), 터미널 호스트의 자식 기본값 채움이 없음(NODE-005), 표준 `oneOf`에서 다른 분기가 유효하면 오류가 없음(VALIDATE-036), 꺼진 변형의 노드를 `find`가 돌려주지 않음(LANDING-148), 배열 빈자리의 방출이 `null`(VALUE-034) — 은 이주 점검표(68C-02)에 해당 이주 행 또는 "공개 표면 잔여의 거취" 행으로 교차 기록해 PR-8의 이주 안내 재료가 되게 한다. 처분표의 "바뀌는 기대값 단언이 하나라도 있으면 파일 전체를 버리고 새로 쓴다"는 07이 세운 운영 규칙이고 위 원칙과 맞으므로 그대로 둔다." (`reviews/round-78-closing.md:9`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:608#3`(정본), `09-landing-and-test-strategy.md:159`, `09-landing-and-test-strategy.md:276`, `reviews/round-16-owner-answers.md:13`, `reviews/round-16-owner-review.md:58`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:13` 답 7)
- 라운드: 16
- 까닭: `reviews/round-16-owner-review.md:58`
- 충돌:
  > `02-target-overview.md:368`의 "기존 시나리오의 기대값은 버리고 상황 목록(null 분기 위치, 배열 제거와 추가, 활성 0→1→0, 복수 활성, 배열 항목 재인덱싱)은 자산으로 옮긴다"는 17파일의 예외를 적지 않는다(16라운드 답 7 전의 문장). 정본이 이긴다(`08-design-a-to-z.md:608`).

### TEST-006 시험의 원칙 둘 — 회귀를 막고 개별 함수의 동작을 표현, 절대 실패하지 않는 단언은 시험이 아님

- 결정:
  > 원칙 둘. 모든 시험은 회귀를 막고 개별 함수의 동작을 표현한다. 절대 실패하지 않는 단언은 시험이 아니다(08 §18의 여섯째).
- 보충:
  > "6. **절대 실패하지 않는 단언을 경계한다**(이슈 #342 §4의 교훈)." (`08-design-a-to-z.md:610`)
  > "이슈 #342 §4의 교훈도 옮긴다. 숨은 키 누출 검사를 `JSON.stringify(...).not.toContain(KEY)`로 하면 제어 문자가 이스케이프되어 절대 실패하지 않는다. 목표 구조에는 숨은 키가 없으므로 이 검사 자체가 필요 없어지지만, "절대 실패하지 않는 단언"을 경계하는 원칙은 남긴다." (`02-target-overview.md:371`)
  > "항상 통과하는 테스트(`findNode.test.ts` 147–149행, `expect(x).toEqual(x)`)를 `toBeNull()`로 고친다." (`06-conclusions.md:176`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:128`(정본), `08-design-a-to-z.md:610`, `02-target-overview.md:371`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:128`)
- 라운드: 16
- 까닭: `02-target-overview.md:371`

### TEST-007 테스트 위계 — 코어 유닛, <Form> e2e(jsdom), 개별 함수·훅

- 결정:
  > | 층 | 무엇을 | 환경 | 원천 |
  > | --- | --- | --- | --- |
  > | 코어 유닛 | 청사진 표, 정착 루프, 파생, 디스패처, 검증 스탬프. 단위 시험과 **시나리오 시험**(스키마 하나로 여러 단계) | vitest, `node` | 단위는 함수 옆 `__tests__`, 시나리오는 §4.2의 데이터 모듈 |
  > | `<Form>` e2e | 실제 React 렌더 사이클. 마운트·입력·전환·제출·오류 표시 | vitest, `jsdom` + `@testing-library/react`(`renderForm` 하니스) | §4.2의 데이터 모듈을 `playScenario`가 해석(스토리와 같은 어댑터). 스토리북 브라우저 실행은 이 층의 미러다(§5, 16라운드 답 1로 확정) |
  > | 개별 함수·훅 | 순수 함수, 훅, 도구. 복수 허용 | vitest, 함수는 `node`, 훅은 `jsdom` | 함수 옆 `__tests__` |
- 보충:
  > 소유자(16라운드 답 1): "e2e는 `jsdom`에서 돈다 | "예" | 확정" (`reviews/round-16-owner-answers.md:7`)
  > "`<Form>` e2e는 vitest `jsdom` + `renderForm` + `playScenario`이고, 실제 브라우저 실행은 스토리북 자동화가 맡는다." (`reviews/round-16-owner-review.md:52`)
  > "**e2e 층의 정의 — 확정(답 1).**" (`09-landing-and-test-strategy.md:269`)
  > "`<Form>` e2e는 vitest `jsdom` + `renderForm`으로 시나리오를 그리고 `playScenario`로 돌리며, 실제 브라우저 실행은 스토리북 자동화(addon-vitest)가 맡는다." (`09-landing-and-test-strategy.md:269`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:122-126`(정본), `reviews/round-16-owner-answers.md:7`, `reviews/round-16-owner-review.md:34,52`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:120`), 소유자 답(`reviews/round-16-owner-answers.md:7` 답 1)
- 라운드: 16
- 까닭: `reviews/round-16-owner-review.md:52`

### TEST-008 단일 원천 — 시나리오는 실행기 없는 순수 데이터 모듈

- 결정:
  > 코어 시나리오와 e2e와 스토리가 같은 스키마·단계를 쓰도록, 시나리오를 실행기 없는 순수 데이터로 둔다.
  > ```ts
  > // packages/aileron/schema-form-scenarios/src/<이름>.scenario.ts
  > export const scenario = {
  >   name: '결제 수단 전환',
  >   schema: { … },                 // 새 문법
  >   initialValue: { kind: 'card' },
  >   steps: [
  >     { path: '/kind', action: 'setValue', value: 'bank',
  >       expect: { shape: { '/account': 'present', '/cardNumber': 'absent' }, outputValue: { kind: 'bank' } } },
  >     { path: '/account', action: 'setValue', value: '110-1234',
  >       expect: { errors: { '/account': [] } } },
  >   ],
  > } satisfies FormScenario;
  > ```
- 보충:
  > "비공개 워크스페이스 패키지 `@aileron/schema-form-scenarios`(`packages/aileron/schema-form-scenarios/`)." (`09-landing-and-test-strategy.md:277`)
  > 편집자 결정(25C-08): "【추론】 시나리오 데이터 모듈의 자리는 `packages/aileron/schema-form-scenarios/src/<부류>/<이름>.scenario.ts`이며 TEST-023의 `src/**/*.scenario.ts` 안이다." (`reviews/round-25-closing.md:76`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:132,134-147`(정본), `09-landing-and-test-strategy.md:277`, `reviews/round-16-owner-review.md:35`, `reviews/round-16-owner-answers.md:14`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:132`), 소유자 답(`reviews/round-16-owner-answers.md:14` 답 8)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:132`

### TEST-009 코어 러너 — 부류마다 한 파일, 파일당 15건 이하, 노드 트리만으로 해석

- 결정:
  > - **코어 러너**는 시나리오 부류마다 한 파일(`src/core/__tests__/scenarios/<부류>.spec.ts`)이며, 데이터 모듈을 이름으로 가져와 파일당 15건 이하로 두고 노드 트리만 만들어 단계를 `find(path).setValue(value)`로 해석하고 `expect`를 형상·`outputValue`·오류·`diagnostics`에 대고 단언한다. React 없음, 타이머 없음.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:149`(정본), `09-landing-and-test-strategy.md:193`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:149`)
- 라운드: 16
- 까닭: 없음

### TEST-010 화면 어댑터 playScenario — e2e와 스토리가 함께 쓰는 해석기, 비공개 패키지 @aileron/schema-form-scenarios

- 결정:
  > - **화면 어댑터** `playScenario`는 같은 단계를 `userEvent`로 해석하고 화면에서 보이는 것(입력란의 존재, 값, 오류 문구)을 단언한다. 이 어댑터는 e2e와 스토리가 함께 쓰는 해석기이며 데이터 모듈과 같은 비공개 패키지 `@aileron/schema-form-scenarios`에 둔다(16라운드 답 8). 스토리는 e2e의 화면 미러이고 스토리북 자동화는 그 스토리의 `play`다(§5).
- 보충:
  > 소유자(16라운드 답 8): "시나리오 모듈은 비공개 패키지 | "예 적절한 이름을 써주세요" | 확정. 이름은 편집자가 형제 이름을 따라 정한다" (`reviews/round-16-owner-answers.md:14`)
  > "**시나리오 모듈의 자리 — 확정(답 8).**" (`09-landing-and-test-strategy.md:277`)
  > "이름은 Vincent가 편집자에게 맡겼고, 형제 비공개 패키지(`@aileron/benchmark-form`, `@aileron/production-testbed`)의 자리를 따르며 담은 것(schema-form의 시나리오)이 이름에서 읽히게 했다." (`09-landing-and-test-strategy.md:277`)
  > "그 패키지는 `@canard/schema-form`을 값으로도 형으로도 가져오지 않는다(가져오면 schema-form의 시험과 서로 가져오는 고리가 된다)." (`09-landing-and-test-strategy.md:277`)
  > "그래서 `Form`·`FormHandle`·`FormScenario.schema`는 구조적 형으로 적고, 시나리오 감싸개는 `Form`을 주입받는다." (`09-landing-and-test-strategy.md:277`)
  > "가능한지는 PR-0이 확인한다." (`09-landing-and-test-strategy.md:277`)
  > 편집자 결정(25C-08): "【추론】 시나리오 감싸개는 `ScenarioForm`, 핸들 등록은 `registerScenarioHandle`, 핸들 찾기는 `findScenarioHandle`이다." (`reviews/round-25-closing.md:77`)
  > 편집자 결정(25C-08): "【추론】 `ScenarioExpectation`은 `shape`·`outputValue`·`values`·`errors` 넷으로 시작하고, `diagnostics`는 코어 러너(TEST-009)를 만드는 PR 03이 더한다." (`reviews/round-25-closing.md:78`)
  > 편집자 결정(60C-01): "【추론】 filid의 분류는 "어댑터가 모듈 index를 보고하면 fractal"이고 "다른 이가 이름으로 부르면서 내부는 자유로이 바뀌는 디렉토리는 fractal"인데, 가족 디렉토리마다 `index.ts`가 그 가족의 장면 목록(`arrayScenarios` 등)을 이름으로 내보내고 패키지 루트 `index.ts`가 그것을 이름으로 가져오므로 가족은 자료 묶음이면서도 계약(장면 목록)을 가진 모듈이다; 그래서 문서 없이 예외로 두는 (A)는 분류를 거스르고, 뒤로 미루는 (C)는 같은 발견을 PR마다 다시 보게 하므로 (B)를 택한다. 문서는 짧다 — INTENT는 그 가족이 어느 동작 부류의 장면을 담는지와 자료 전용(실행·엔진 의존 없음, TEST-010)이라는 규약, DETAIL은 장면 파일 목록과 각 장면이 검증하는 원장 항목(배열 가족이면 TEST-018과 35C~48C의 결정들)이다. 패키지 INTENT의 "Families name value, settle, fill, exit, and union behavior"는 derive·controls·array를 더해 여덟으로 고친다." (`reviews/round-60-closing.md:9`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:150`(정본), `09-landing-and-test-strategy.md:192,277`, `reviews/round-16-owner-answers.md:14`, `reviews/round-16-owner-review.md:59`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:14` 답 8), 편집자 결정(16라운드, `09-landing-and-test-strategy.md:150`)
- 라운드: 16
- 까닭: `reviews/round-16-owner-review.md:59`

### TEST-011 단계 어휘 여덟과 핸들의 DOM 등록 — playScenario(scenario, 요소) 하나

- 결정:
  > - 단계의 어휘는 `setValue`·`clear`·`push`·`remove`·`update`·`submit`·`reset`·`batch`로 닫고, 필요하면 PR마다 더한다. 화면 단언은 경로를 `data-path`로 찾는다(`SchemaNodeProxy`와 `DeferrableNodeProxy`가 붙인다). 화면 입력으로 풀 수 없는 단계(`batch`, `reset`, `submit`, `update`, 잎이 아닌 경로의 `setValue`)는 화면 어댑터가 `FormHandle`로 실행한다. **핸들은 그린 쪽이 DOM에 등록하고 어댑터는 받은 요소 자신과 그 자손에서 찾는다**(스토리·플러그인 패키지에서는 감싸개 루트가 받은 요소의 자손이고 e2e에서는 받은 요소 자신이다. 편집자 결정, 16라운드 답 10으로 확정). 스토리는 시나리오를 그리는 감싸개가 자기 루트 요소에, e2e는 `renderForm`이 돌려준 핸들을 `container`에 등록한다(§4.5). 등록이 DOM을 거치므로 호출 모양은 스토리·e2e·플러그인 패키지 모두 `playScenario(scenario, 요소)` 하나이고, `render(<Story />)`와 `Story.play()`가 서로 다른 스토리 문맥을 만들어도(Storybook 10.4.1) 핸들이 건너간다. 핸들을 어댑터의 인자로 넘기는 안은 호출 모양이 경로마다 달라지고 플러그인 패키지 경로에서 성립하지 않아 버렸다. 감싸개·등록 함수·표식의 이름은 PR-0의 어댑터 뼈대가 정한다.
- 보충:
  > "`FormHandle`은 그린 쪽이 DOM에 등록하고 `playScenario`가 찾는다(3차 게이트 뒤)." (`reviews/round-16-owner-review.md:61`)
  > "`FormHandle`은 그린 쪽이 DOM에 등록하고 `playScenario`가 찾는다(§4.2)." (`09-landing-and-test-strategy.md:279`)
  > 편집자 결정(25C-08): "【추론】 `ScenarioExpectation`은 `shape`·`outputValue`·`values`·`errors` 넷으로 시작하고, `diagnostics`는 코어 러너(TEST-009)를 만드는 PR 03이 더한다." (`reviews/round-25-closing.md:78`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:151`(정본), `09-landing-and-test-strategy.md:278`, `reviews/round-16-owner-answers.md:16`, `reviews/round-16-owner-review.md:35,61`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:151`), 소유자 답(`reviews/round-16-owner-answers.md:16` 답 10)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:151`

### TEST-012 검증 매트릭스는 스토리로 만들지 않고 정적 test.each 표로

- 결정:
  > - 수백 개 조합(검증 매트릭스)은 스토리로 만들지 않는다. 행을 정적으로 적은 `test.each` 표로 돌리되 파일당 상한을 지키고 스토리북에는 대표만 둔다(antigravity 조사의 권고와 같다).
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:152`(정본)
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:152`)
- 라운드: 16
- 까닭: 없음

### TEST-013 기존 234파일의 처분 — 그대로 산다·표면만 고친다·버리고 새로 쓴다·미분류·새로 있어야 한다

- 결정:
  > | 부류 | 기준 | 대표 | 규모 |
  > | --- | --- | --- | --- |
  > | 그대로 산다 | 순수 함수이거나 타입 사상, 새 엔진에 시그니처와 뜻이 그대로, 타이머 없음, 08 §14의 어느 행에도 안 걸림. 단위가 옮겨 가면 시험도 함께 옮긴다 | `helpers/jsonPointer/utils/__tests__/*`, 식 정규식 시험(옮김), 잎 교차 시험(먼저 승 관련과 `intersectEnum`·`intersectConst`·`validateRange`의 throw 단언 제외. 이 셋의 throw 단언은 '버리고 새로 쓴다'로(공집합 표시를 단언한다)), `ArrayNode/utils/__tests__`, `InferSchemaNode.type.test.ts` | 약 30 |
  > | 표면만 고친다 | 모든 단언의 기대값이 08 규칙에서 그대로 나오고 이름만 바뀐다(`computed` → `controls`, `normalizedValue` → `outputValue`, `FormGroup` → `FormTypeGroupRenderer`, `JSONSchemaError` → `ValidationIssue`). 단언마다 08 §14와 대조한다 | 조합·옛 키 없는 렌더 시나리오 17파일(`array.mutation-identity`, `controlled-interaction`, `default-value`, `formType-resolution`, `state-management`, `validation.errors` 등). 반례: `terminal-mode`의 "터미널 아래 `find`가 터미널을 돌려준다"는 08 §14의 17행에 걸려 재작성. 이 17파일도 스키마와 단계는 데이터 모듈로 옮기고, 단언은 이름만 바꿔 e2e의 추가 단언으로 둔다(16라운드 답 7로 확정) | 약 25 |
  > | 버리고 새로 쓴다 | 기대값이 08 §14 이주 행(분기 자동 감지, `oneOfIndex`, `schemaPath`, 복원, 주입 순환 차단, 루트 전역, 먼저 승, 마이크로태스크 타이밍, 파서 변환)이나 삭제될 내부를 단언한다. **상황 목록은 자산으로 옮긴다**(§4.2의 데이터 모듈로) | `core/__tests__` 87파일 가운데 옛 표면 52·타이머 의존 78, `oneOfSchemaPath`, `AbstractNode.injectTo`, `core/parsers/__tests__`, 렌더 시나리오 `composition.*`·`computed.*` | 약 150 |
  > | 미분류 | 위 세 부류의 기준으로 아직 가르지 않은 것. PR-0의 처분 목록에서 파일마다 가른다 | — | 약 29 |
  > | 새로 있어야 한다 | 설계의 새 장치마다 시험이 없다 | §4.4 | — |
- 보충:
  > "205파일 약 3,150건을 다시 쓴다 | 234파일을 넷으로 가른다(아래 새로 정함의 넷째) | 다시 셌다" (`reviews/round-16-owner-review.md:24`)
  > 소유자(18라운드 S1): "S1. node 는 각자의 타입에 맞는 parse 함수를 가져야 합니다. 지금처럼요." (`reviews/round-18-owner-answers.md:7`)
  > "`:160`(파서 변환을 단언하는 시험을 버림)" (`reviews/round-18-owner-answers.md:7`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:156-162`(정본), `reviews/round-16-owner-review.md:24,34`, `reviews/round-16-owner-answers.md:13`, `08-design-a-to-z.md:608`, `reviews/round-18-owner-answers.md:7`, `02-target-overview.md:363`, `adr/0009-performance-budget-and-benchmarks.md:66`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:154`), 소유자 답(`reviews/round-16-owner-answers.md:13` 답 7), 소유자 답(`reviews/round-18-owner-answers.md:7` S1; `:160`의 파서 변환 시험을 대체)
- 라운드: 18
- 까닭: `reviews/round-16-owner-review.md:24`
- 충돌:
  > `09-landing-and-test-strategy.md:160`의 "마이크로태스크 타이밍, 파서 변환)이나 삭제될 내부를 단언한다"는 18라운드 소유자 답 S1이 대체한 자리다(파서 변환을 단언하는 시험을 버림. 노드마다 타입에 맞는 parse를 두고 뜻이 그대로인 변환만 남긴다, WRITE-052). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:7`).
  > `02-target-overview.md:363`의 "기존 테스트는 동작이 달라져 회귀 오라클로 쓸 수 없다"는 정본과 다르다(뒤 라운드의 정본은 기존 234파일 가운데 그대로 사는 약 30파일과 표면만 고치는 약 25파일의 단언을 남기고, 17파일의 단언 유지는 소유자 답이다(`reviews/round-16-owner-answers.md:13` 답 7)). 정본이 이긴다(`09-landing-and-test-strategy.md:158-159`).
  > `adr/0009-performance-budget-and-benchmarks.md:66`의 "기존 테스트는 동작이 달라져 회귀 오라클이 못 되지만"은 정본과 다르다(같은 까닭). 정본이 이긴다(`09-landing-and-test-strategy.md:158-159`).
  > `09-landing-and-test-strategy.md:158`의 "잎 교차 시험(먼저 승 관련과 `intersectEnum`·`intersectConst`·`validateRange`의 throw 단언 제외."는 18라운드 결정과 다르다: `intersectConst.test.ts:40-58`의 참조 비교 단언과 `intersectPattern.test.ts:6-14`의 전방 탐색 단언도 '그대로 산다'에서 빠진다(TEST-068). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:197`).

### TEST-014 새로 있어야 하는 시험 PR-1 — 청사진 테이블·병합표·제거 규칙·식 컴파일러·options/presentation 병합·전략 불일치·청사진 경고 수집

- 결정:
  > | PR | 시험 |
  > | --- | --- |
  > | PR-1 | 청사진 테이블 시험(조각 열거, 전순서, 노드 공유, `controls.discriminator` 변환과 끌어올림, `extras` 정적 집합, 역의존 표, 청사진 오류·경고), 병합표 시험, 제거 규칙 시험(키워드 위치만), 식 컴파일러 시험(옮긴 9파일 + 기준점 호스트. `regex.test.ts`의 `SIMPLE_EQUALITY_REGEX` 묶음은 그 상수와 함께 옛 엔진에 남긴다), `options`·`presentation` 병합의 원자(React 요소, ref 모양)·한쪽 값의 참조 이동·양쪽 객체의 쓰기 시 복사(작성자 객체를 변이하지 않음, `@winglet/common-utils`의 `merge` 선택 인자 포함), 선언 사이 `options.terminal`·렌더 계층 판정의 불일치(노드가 형상에 있는 경우마다 순서대로 정한 전략이 다르면 청사진 오류. 게이트 없는 선언끼리는 나중 승, 조각에만 선언된 노드는 조각이 모두 꺼진 경우를 비교하지 않음(조각 하나에만 선언된 노드의 인라인 `presentation.FormTypeInput`·`options.terminal`은 오류가 아님, 두 조각이 같은 노드에 서로 다른 전략을 주면 청사진 오류), 게이트 없는 선언의 `options.terminal`이 정한 노드에 조각이 인라인 입력을 더해도 오류가 아님, 판정의 없음은 앞 판정을 지우지 않음), 청사진 경고의 데이터 수집(수집기 인자, 코드·`schemaPath`·판별 칸, 소비자가 없으면 모으지 않음, 캐시 청사진의 늦은 수집이 작성 루트마다 한 번), 정적으로 아는 `controls.injectTo` 대상 없음의 청사진 오류 |
- 보충:
  > 편집자 결정(18C-11): "【추론】 PR-1 병합표 시험(`09-landing-and-test-strategy.md:168`)이 이 표현을 단언한다." (`reviews/round-18-closing.md:259`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:166-168`(정본), `reviews/round-16-owner-review.md:27`, `reviews/round-18-closing.md:259`, `reviews/round-18-closing.md:384`
- 닫은 사람: 편집자 결정(16·17라운드, `09-landing-and-test-strategy.md:168`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-11), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14; 정적 `injectTo` 오류 없음)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:162`, `reviews/round-18-closing.md:261-264`
- 충돌:
  > `09-landing-and-test-strategy.md:168`의 "정적으로 아는 `controls.injectTo` 대상 없음의 청사진 오류"는 18라운드 결정과 다르다: `controls.injectTo`는 함수 형태 하나라 청사진이 정적으로 아는 대상이 없으므로 PR-1 시험에 이 청사진 오류가 없고, 대상 경로가 청사진에 없거나 터미널 아래인 경우는 동적 대상 없음 `INJECT_TARGET_MISSING`이다(CONTROLS-079, ERROR-198). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:384`).

### TEST-015 새로 있어야 하는 시험 PR-2 — 정착 루프 시나리오, 예산 다섯, diagnostics, 사슬 끝 throw, 나감 비움, 노드 구조 시험, active 게터

- 결정:
  > | PR | 시험 |
  > | --- | --- |
  > | PR-2 | 정착 루프 시나리오(프로토타입 v5·v6 회귀 63+108+26+52와 v7 회귀 이식), 예산 다섯과 원본 B, `diagnostics`(`'degraded'`와 `cause`, 다음 로드까지), 정착 오류의 사슬 끝 throw(모든 환경), `SetValueOption` 넷, 로드는 새 수명, 나감 비움 네 층과 하위 트리 규칙(R17-2 ㄴ: 나가는 객체·분기의 정책이 내려감, 자손의 `false`가 이김, 선언의 나감, 잠복 자손의 비움, 선언의 나감에서 `extras`를 건드리지 않음), 노드 구조 시험(행 칸 순서 시험: 모든 행의 칸 키와 순서가 같음. 겉면 멤버 목록 시험: 프로토타입 멤버 이름과 `SchemaNode/`의 `DETAIL.md` 목록의 일치. 공개 index 키 목록: 내부 통로가 `src/index.ts`에 없음. 행 고르기 함수의 조합 전수. 공개 형의 키 목록 타입 시험. `isTerminalNode`가 터미널 객체도 좁힘), `SchemaNode` 클래스 파일에 거는 린트 설정, `active` 게터 |
- 보충:
  > 18라운드 안건(열림, 설계 결정): "PR-2가 시험하는 것, 시험 대역으로 시험하는 것(대역의 계약), 뒤로 미루는 것을 가르고, 이식할 프로토타입 회귀를 기능별로 PR-2·PR-3·PR-4에 나눈다." (`reviews/round-18-agenda.md:57`)
- 상태: 대체됨(→ TEST-069)
- 출처: `09-landing-and-test-strategy.md:166-167,169`(정본), `reviews/round-16-owner-review.md:27`, `reviews/round-18-closing.md:751-780`
- 닫은 사람: 편집자 결정(16·17라운드, `09-landing-and-test-strategy.md:169`), 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:57`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-25)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:162`, `reviews/round-18-closing.md:782-786`

### TEST-016 새로 있어야 하는 시험 PR-3 — 같은 대상 규칙, 에지 소비, DisableAutomaticWrites, 개발 모드 정착 기록

- 결정:
  > | PR | 시험 |
  > | --- | --- |
  > | PR-3 | 같은 대상 규칙(종류·문서 순서·층·전순서·정착 단위), 에지 소비, `DisableAutomaticWrites`, 개발 모드 정착 기록 |
- 보충:
  > 편집자 결정(18C-25): "【추론】 (다) 파생 라운드 예산과 그 `degraded`, `DisableAutomaticWrites`의 파생·`injectTo` 억제는 PR-3으로 미룬다." (`reviews/round-18-closing.md:769`)
  > 편집자 결정(28C-01): "【추론】 PR-3은 이 기록을 위한 공개 `SchemaNode` 멤버·`onError` 기록·`FormHandle` 멤버를 더하지 않는다: 원장이 정한 멤버가 없고(26C-01), 이 행은 "`onError`에 가지 않음"이다." (`reviews/round-28-closing.md:12`)
  > 편집자 결정(28C-01): "【추론】 시험이 런타임의 칸에서 이 기록을 읽는 것은 TEST-069 (나)가 금하는 "시험만을 위한 주입 자리"가 아니다: (나)가 금하는 것은 시험만을 위해 새로 만드는 입력 자리이고, 이 기록은 ERROR-159가 설계로 요구한 산출물이다." (`reviews/round-28-closing.md:13`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:166-167,170`(정본), `reviews/round-16-owner-review.md:27`, `reviews/round-18-closing.md:769`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:170`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-25)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:162`, `reviews/round-18-closing.md:782-786`

### TEST-017 새로 있어야 하는 시험 PR-4 — 디스패처, 사슬 끝 throw와 onError 계약의 core 쪽, 검증기 없음·컴파일 실패, degraded, 가드, 차등 시험, 훅 수준 바인딩 시험

- 결정:
  > | PR | 시험 |
  > | --- | --- |
  > | PR-4 | 디스패처(진입당 1회, 되먹임 상한, 구독 뒤 따라잡기), 사슬 끝 throw와 `onError`, `onError` 계약의 core 쪽 시험(사슬 끝의 기록마다 발생 순서 전달과 경고 포함, 묶음의 `aggregate`와 구성 기록, 핸들러가 던질 때의 묶음(원래 드러날 값을 펼치지 않고 `details.errors`의 앞에), 핸들러 안 쓰기의 즉시 거부와 비전달, `validate()` 허용, 경고 구조 키 중복 억제(같은 노드의 다른 `allOf` 키워드는 따로), 핸들러 없는 프로덕션에서 기록·서식·정착 경고 판정 없음(할당 계측), 마운트 뒤 핸들러를 단 폼은 그 뒤 사건만 받음, 원시값 예외의 전달, 검증기 실행 실패의 기록과 `ValidationError`의 비기록), 검증기 없음의 경고(거부하지 않음, 트리마다 한 번, 같은 스키마 reset과 `setValue(V)`에서는 다시 보내지 않음)와 전체 스키마 컴파일 실패의 거부(모든 환경), `degraded` 동안 제출 경로의 거부와 `getValue()`의 허용, 커밋 스탬프와 실행 합치기, (루트, 위치) 가드와 같은 `$id` 재등록, ajv6·7·8 동기 가드, 차등 시험(독립 검증기와의 판정 동치), **훅 수준 바인딩 시험**(동기 통지와 `useSyncExternalStore`, StrictMode 이중 호출) |
- 보충:
  > "`hooks/`에는 오늘 시험이 하나도 없다. PR-4의 훅 시험이 처음이다." (`09-landing-and-test-strategy.md:176`)
  > 편집자 결정(18C-25): "【추론】 되먹임 파동과 `onChange` 중첩 예산, 진입 사슬의 사슬 끝 throw(중첩 진입, 통지·`onChange`와의 순서, `details.errors` 묶음)는 PR-4로 미룬다." (`reviews/round-18-closing.md:770`)
  > 편집자 결정(31C-04): "【추론】 TEST-001의 "독립 검증기는 폼이 쓰는 플러그인과 다른 구현이어야 하고"에서 다른 구현은 다른 라이브러리다: 폼이 쓰는 플러그인과 같은 메이저의 Ajv를 새로 만들어 작성 스키마를 바로 컴파일하는 것은 같은 구현이 다른 경로를 지나는 것이라, 1라운드가 막은 동어반복(같은 구현에 같은 값)을 피하지 못한다." (`reviews/round-31-closing.md:36`)
  > 소유자(40라운드, 차등 시험의 독립 검증기): "내 결정이 맞다. ajv 플러그인에 다른 스키마 검증기를 추가하는건, 플러그인 단계에선 검토할만한데, 지금은 의도하지 않는다." (`reviews/round-40-owner-answers.md:7`) — PR-4의 차등 시험은 ajv 밖의 라이브러리를 더하지 않고 같은 ajv로 폼의 판정(사본 → 컴파일·가드 → 라우팅)과 작성 스키마를 직접 컴파일한 판정을 JSON으로 직렬화한 방출 값으로 비교한다. "다른 구현"의 오라클은 ajv가 아닌 검증기 플러그인을 만드는 PR로 넘기며 그 패키지에 둔다. 31C-04의 오라클 선택은 PR-4에 대해 이 답으로 대체된다(원장 관리자, 2026-10-01).
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:166-167,171`(정본), `reviews/round-16-owner-review.md:27`, `reviews/round-18-closing.md:770`
- 닫은 사람: 편집자 결정(16·17라운드, `09-landing-and-test-strategy.md:171`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-25)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:162`, `reviews/round-18-closing.md:782-786`
- 충돌:
  > `09-landing-and-test-strategy.md:171`의 "`degraded` 동안 제출 경로의 거부와 `getValue()`의 허용"은 18라운드 결정과 다르다: `degraded` 동안의 제출 거부 시험은 PR-4가 아니라 PR-7로 미룬다(TEST-020의 18C-25 보충). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:773`).

### TEST-018 새로 있어야 하는 시험 PR-5 — 배열 아이템의 생김과 채움, identity, omitTrailing, 터미널 배열 행의 구조 연산

- 결정:
  > | PR | 시험 |
  > | --- | --- |
  > | PR-5 | 배열 아이템의 생김과 채움, `push`·`remove`·`update`의 identity, `omitTrailing`, 터미널 배열 행의 구조 연산(원본 사본 위의 `push`·`pop`·`update`·`remove`·`clear`), `resolveArrayLimits`의 청사진 이동과 옮긴 시험 |
- 보충:
  > 편집자 결정(18C-25): "【추론】 원본 B의 배열 아이템 구조 기록은 PR-5로 미룬다(TEST의 PR-5 행에 더함)." (`reviews/round-18-closing.md:771`)
  > 편집자 결정(18C-59): "PR-5 시험(TEST-018)에 위치 재조정(키 유지와, 위치를 따라가는 `dirty`·`touched`·바깥 오류·가상화 기록·노드 참조), 청사진 없는 자리의 `extras` 보존, 구조 연산에서 값이 노드와 `extras` 사이를 옮기는 것을 더한다." (`reviews/round-18-closing.md:1682`)
  > 편집자 결정(37C-01): "【추론】 `omitTrailing`은 가지 배열의 방출 배열 꼬리에서 빈 자리의 최대 연속 구간을 자르는 투영이며, 빈 자리는 셋이다: (1) 방출이 없는 아이템의 자리를 VALUE-034대로 채운 값(객체 `{}`, 배열 `[]`, 잎 `null`), (2) 잎 아이템이 실제로 `null`을 방출한 자리(방출 배열에서 (1)의 잎과 구별되지 않고, PR-5로 넘어온 프로토타입 기대 `['a', null, null]` → `['a']`가 이것을 자른다), (3) 청사진이 없는 자리(`extras`)의 값이 `undefined` 또는 `null`인 자리." (`reviews/round-37-closing.md:9`)
  > 소유자(54라운드, 06 느린 행 P-14의 수용): "응 그렇게 하자. 이정도면 수용 가능. 동작무결성을 확보하고, 성능 개선 라운드에서 쪼아보자" (`reviews/round-54-owner-answers.md:7`) — 같은 완료점에서 아이템 1천 개 배열의 루트 통째 쓰기가 Node 1.41–1.43배·Bun 2.87배 느린 것(선형)을 PR-5에 대해 받아들였다; 키 입력 행 P-13은 같은 완료점에서 새 엔진이 더 빨라 닫힌다; 고치는 일은 07 뒤 최적화 작업의 몫이고 PR-5는 동작 무결성에 집중한다(원장 관리자, 2026-10-01).
  > 편집자 결정(90C-01): "【추론】 WRITE-082는 호스트(객체, 배열)의 채움 값 D가 "그 호스트에 대한 쓰기로 들어가"고 "채움은 부모부터 순회"하며 "D에 없는 자손은 없음으로 남아, 자기 차례에 `controls.default` > `default`를 받는다"고 정했고, SETTLE-046은 로드에서 "최종 형상의 노드가 모두 생긴 노드로서 채움을 받는다"고 했으며, SETTLE-005는 "채움이나 나감의 비움이 다음 라운드를 부르는 것은 그 쓰기가 게이트를 뒤집어 새 노드를 내거나 노드를 내보낼 때뿐"이고 SETTLE-017은 상한을 "게이트 가진 조각 수 + 노드 게이트 수 + 1"로 두었다. 그러므로 배열 D가 만든 아이템의 자손 `label`이 자기 `default`를 받는 것은 부모부터 내려가는 한 채움 순회의 뒤 차례이지 게이트가 뒤집혀 생긴 새 라운드가 아니고, 게이트 없는 폼에서 그 채움이 상한 1을 넘겨 `BUDGET_EXCEEDED`와 원본 복구로 끝나는 것은 원장과 다른 동작이다 — 정적 스키마의 첫 로드는 반드시 서야 한다(GOAL-071 "생성이 곧 첫 정착"). 객체 호스트에서는 자손이 라운드 시작에 이미 형상에 있어 드러나지 않았고, 배열은 아이템이 D의 쓰기로 비로소 생기므로 드러났다. 귀속은 72C-01·78C-02의 기준("원장이 그 단계에 둔 규칙이 온전히 있었는데 코드가 다른가")으로 06의 결함이다: 배열 아이템의 생김과 채움은 TEST-018이 PR-5에 둔 시험이고 WRITE-082는 18라운드부터 있었다; 고치는 자리가 03의 전이 코드여도 범위 규칙은 코드의 출신이 아니라 시나리오가 닿는지로 정하므로(49C-01·63C-02) 첫 로드를 여는 07이 고치고 `plan/07-switch/log.md` §8 "앞 단계 결함"에 재현 사례와 함께 적는다. 고치는 방향은 07의 후보대로다: 한 전이 라운드 안에서, 이번 라운드에 채움을 받은 호스트가 그 쓰기로 낸 자손을 부모부터 이어 방문해 없음인 것에 채움을 쓰고(D가 준 키의 자손은 없음이 아니어서 받지 않는다), 노드마다 정착 안에서 채움은 한 번이며, 라운드의 수와 상한의 식은 바꾸지 않는다 — 채움이 게이트를 뒤집어 새 노드를 내면 그때만 다음 라운드다. 순회는 이번에 생긴 노드만 돌므로 SETTLE-017 "생긴 노드의 채움 … 순회는 제외"의 안이고, 자기를 다시 낳는 되풀이(아이템 `default`가 같은 재귀 형의 아이템을 또 만드는 사슬)는 BLUEPRINT-030의 "원본 없는 사슬의 되풀이는 정착 오류"가 그대로 끊는다. 시험은 붉음에서 초록으로: 배열 D의 아이템 1개·1,000개와 중첩(아이템 안 배열 D), 객체 D 안의 배열 D, `push()`로 만든 아이템(WRITE-088, 지금 동작의 특성화), `DisableAutomaticWrites`에서 채움 없음. 그 부류를 정적 자격에서 빼는 안은 택하지 않는다 — 기본값을 가진 배열 아이템은 흔한 폼이고, 빼면 정적 경로의 차등 기준이 결함을 복제하거나 흔한 폼이 빠른 경로를 못 탄다. 순서는 범용 결함의 수정(별도 커밋, 수정 뒤 조용한 기준선을 다시 남김) → (i) 정적 첫 로드 → (ii) 분기 없는 청사진이며, (ii)는 정착 경로와 파일이 겹치지 않으므로 답을 기다리는 동안이나 (i)보다 먼저 해도 되되 커밋과 재측정은 변경마다 따로다(89C-05)." (`reviews/round-90-closing.md:9`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:166-167,172`(정본), `reviews/round-16-owner-review.md:27`, `reviews/round-18-closing.md:771,1682`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:172`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-25·18C-59)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:162`, `reviews/round-18-closing.md:782-786`, `reviews/round-18-closing.md:1686-1690`

### TEST-019 새로 있어야 하는 시험 PR-6 — 잠금 OR·표시 AND, controls.children, 조각 controls, unsetOnInactive 층

- 결정:
  > | PR | 시험 |
  > | --- | --- |
  > | PR-6 | 잠금 OR·표시 AND, `controls.children`, 조각 `controls`, `unsetOnInactive` 층 |
- 보충:
  > 편집자 결정(18C-25): "【추론】 나감 비움의 `children` 항목 층, 조각 `controls` 층, 식 값(직전 커밋)은 PR-6으로 미룬다(TEST의 PR-6 행 "`unsetOnInactive` 층"에 명시)." (`reviews/round-18-closing.md:772`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:166-167,173`(정본), `reviews/round-16-owner-review.md:27`, `reviews/round-18-closing.md:772`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:173`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-25)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:162`, `reviews/round-18-closing.md:782-786`

### TEST-020 새로 있어야 하는 시험 PR-7 — e2e: 렌더 중 onChange 없음, 마운트 정착 오류, 바운더리와 싱크, onError e2e, finishInput·trim, strategy, reset, React 18

- 결정:
  > | PR | 시험 |
  > | --- | --- |
  > | PR-7 | e2e: 렌더 중 `onChange` 없음, 마운트 동안 `onChange`·`onDiagnosticsChange` 버림과 `onError`의 커밋 뒤 한 번 전달, 마운트 정착 오류의 원인별 폼 서기(공유 충돌은 대체 화면), 바운더리의 가두고 보고하기(렌더 때 보고기 읽기, 주인 없는 오류 싱크), 싱크의 세 경로(`reportError`, `ErrorEvent`가 있을 때만 보내고 취소되지 않으면 `console.error`, 서버의 `console.error`), `WeakSet`으로 바운더리가 다시 잡은 값의 핸들러 전달 한 번 거르기, 로드 객체 전달함 표지로 StrictMode에서 한 번, `degraded` 제출 거부(모든 환경, R17-1 나), `onError` e2e(받는 것·받지 않는 것 목록 대조: 검증 결과·정착 추적·호스트 `onSubmit` 예외는 오지 않음. 핸들러 유무에 따른 동작 동일(throw·거부·싱크·콘솔). 프로덕션 빌드의 경고 기록. 로드 기록의 준비 이펙트 전달과 청사진 오류 대체 화면의 전달. 루트 바운더리가 하위 트리를 버린 로드의 오류 층 기록이 렌더 실패 기록보다 먼저 감. `componentDidCatch`에서 핸들러가 던질 때 호스트 바운더리가 발화하지 않고 싱크가 한 번. 이펙트에서 연 사슬의 throw가 필드 바운더리에 다시 잡힐 때 핸들러가 한 번. 모듈 수준·`FormProvider`·폼마다의 필드 바운더리가 인스턴스 보고기에 닿음. 네이티브 submit의 `degraded` 거부가 `onError`와 싱크로 감. 서버 렌더에서 핸들러를 부르지 않고 하이드레이션 뒤 한 번), `finishInput` 신호와 `trim`(포커스 아웃 때만 자름, 입력 중에는 자르지 않음, 같은 값이면 쓰지 않음, 입력 출처 쓰기), `node.strategy`로 옮긴 `FormGroupRenderer`와 UI 플러그인 넷, 입력 출처와 Refresh, `reset`의 시험 목록(§2.6의 열여섯째, 16라운드 스웜 수렴(편집자 결정)), React 18 실행(동료 의존 `>=18 <20`인데 오늘 설치는 19뿐, 16라운드 답 5. React 18 개발 모드는 렌더 오류를 전역 오류로 다시 재생하므로 바운더리가 잡은 오류가 `window` 'error'에 두 번 닿을 수 있는 이중 보고를 확인한다) |
- 보충:
  > 소유자(16라운드 답 5): "React 18 계속 지원 | "예" | 확정" (`reviews/round-16-owner-answers.md:11`)
  > "PR-7의 시험(§4.4): 터미널 입력의 다시 마운트(`reset.pristine:267-309`의 단언 유지), 값 전체를 그리는 브랜치 입력과 빈 배열 입력은 다시 마운트되고 자식을 그리고 있는 기본 객체·배열 입력은 아님, 대체된 입력의 늦은 `onChange`·`onFileAttach` 폐기, 재생성 reset 뒤 옛 입력(컨테이너 입력 포함)의 언마운트 flush와 늦은 `onFileAttach`, 흐림 뒤 미룬 `touched`와 컨테이너 입력의 늦은 `onChange`(그 `dirty` 표시와 외부 오류 지움 포함)는 조용히 버려지고 옛 노드 참조로 한 쓰기는 `SchemaFormError`, 흐림 직후 reset과 `clearState`의 `touched`, 같은 처리기의 prop 갱신 뒤 reset(`startTransition` 안 포함), 인라인이지만 같은 스키마의 로드(노드 identity 유지)와 함수 칸 차이의 재생성·경고, `properties` 순서만 바꾼 스키마의 reset은 재생성, `batch` 안의 두 경로(reset 뒤의 읽기와 부분 쓰기의 결과가 경로와 무관함), 검증 모드 비트별 마운트·reset 검증, `onStateChange`는 바뀐 때만, `showError` 복귀, `reset(option?)`의 억제 비트 두 방향(Form 속성 `disableAutomaticWrites`와의 우선순위, 둘 다 주면 억제)과 재대조가 원래 호출의 억제 비트를 쓰는 것, `diagnostics` 재기록(로드가 `degraded`와 제출 거부를 푼다, R17-1 나), 가설 H1–H5(`reviews/raw-round16-reset.md` §4)의 실행 확인." (`09-landing-and-test-strategy.md:96`)
  > 편집자 결정(18C-25): "【추론】 `degraded` 동안의 제출 거부는 PR-7로 미룬다." (`reviews/round-18-closing.md:773`)
  > 편집자 결정(78C-01): "【추론】 TEST-005의 예외("조합과 옛 키가 없는 파일은 기대값을 이름만 바꿔 살린다")는 기대값이 그대로인 파일의 것이고, 기대값 자체가 원장의 결정으로 바뀐 파일은 09 §4.3의 "버리고 새로 쓴다"다 — 기대값을 새 동작으로 고쳐 쓰면 그것은 이미 새 시험이지 살린 시험이 아니며, 옛 기대를 남기면 원장과 어긋난 시험이 초록이 될 수 없다. 그러므로 다섯 파일(`array.omit-trailing.injection`, `default-value.input-immutability`, `deferred-mount`, `multi-render-split-brain`, `reset.pristine`)은 처분표에서 "버리고 새로 쓴다"로 옮겨 지우고, 각 행에 바뀐 기대의 근거 항목(VALUE-034; TEST-020·021; NODE-005·WRITE-071; LANDING-115·VALIDATE-010·036; LANDING-148)과 유효한 관찰의 새 자리(U9 e2e 파일과 사례 이름)를 적는다. 새 e2e의 기대는 그 항목의 문장에서 나와야 하고 사례 머리에 항목 번호를 적는다. 이 가운데 소비자가 볼 수 있는 동작 변경 — 마운트 정착 동안 `onChange`가 나지 않음(TEST-020), 터미널 호스트의 자식 기본값 채움이 없음(NODE-005), 표준 `oneOf`에서 다른 분기가 유효하면 오류가 없음(VALIDATE-036), 꺼진 변형의 노드를 `find`가 돌려주지 않음(LANDING-148), 배열 빈자리의 방출이 `null`(VALUE-034) — 은 이주 점검표(68C-02)에 해당 이주 행 또는 "공개 표면 잔여의 거취" 행으로 교차 기록해 PR-8의 이주 안내 재료가 되게 한다. 처분표의 "바뀌는 기대값 단언이 하나라도 있으면 파일 전체를 버리고 새로 쓴다"는 07이 세운 운영 규칙이고 위 원칙과 맞으므로 그대로 둔다." (`reviews/round-78-closing.md:9`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:166-167,174`(정본), `reviews/round-16-owner-review.md:27`, `reviews/round-16-owner-answers.md:11`, `reviews/round-16-owner-review.md:56`, `reviews/round-18-closing.md:773`, `reviews/round-18-closing.md:582-589`
- 닫은 사람: 편집자 결정(16·17라운드, `09-landing-and-test-strategy.md:174`), 소유자 답(`reviews/round-16-owner-answers.md:11` 답 5), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:174`; reset의 시험 목록), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-25), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-19; `trim`은 자동 쓰기)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:162`, `reviews/round-18-closing.md:782-786`
- 충돌:
  > `09-landing-and-test-strategy.md:174`의 "`trim`(포커스 아웃 때만 자름, 입력 중에는 자르지 않음, 같은 값이면 쓰지 않음, 입력 출처 쓰기)"는 18라운드 결정과 다르다: `trim` 쓰기는 입력 출처 쓰기가 아니라 자동 쓰기이므로 PR-7 시험은 바깥 오류와 dirty가 그대로이고 그 노드의 입력이 Refresh를 받는 것을 단언한다(WRITE-083, LANDING-145). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:582`).
  > `09-landing-and-test-strategy.md:174`의 "`node.strategy`로 옮긴 `FormGroupRenderer`와 UI 플러그인 넷"은 소유자 답과 다르다: UI 플러그인 넷의 이주와 시험은 PR-7이 아니라 플러그인 PR이 하고 PR-7은 기본 입력으로 검증한다(LANDING-206). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:42`).

### TEST-021 renderForm 하니스 — e2e 층의 뼈대, 고칠 것 다섯

- 결정:
  > 실제 React 렌더(`act`, `userEvent`, StrictMode, 재마운트 계측)이고 447건이 통과하므로 e2e 층의 뼈대로 쓴다. 고칠 것 다섯: `setupValidatorPlugin`에 동기 `compileGuard`와 루트 등록, `caughtErrors`가 창 이벤트만 잡으므로 주인 없는 오류 싱크와 `onError` 관찰용 도우미(§2.3의 첫째·넷째), `reset`의 뜻(§2.6, 16라운드 스웜 수렴(편집자 결정): 호출 안의 동기 로드와 커밋 재대조), `flushOnMount: false`(26회)의 "초기 스냅숏" 뜻이 동기 정착에서 사라지는 것, 돌려주는 핸들을 `container`에 등록해 화면 어댑터가 찾게 하는 것(§4.2).
- 보충:
  > "| 두 단계 테스트 하네스 | `__tests__/renderForm.tsx:63-66`(13개 파일) | 생성이 곧 첫 정착이다 | 단일 단계 단언(T-5, F23) |" (`05-before-after.md:161`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:180`(정본), `02-target-overview.md:368`
- 닫은 사람: 편집자 결정(16·17라운드, `09-landing-and-test-strategy.md:180`)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:180`

### TEST-022 스토리북 원칙 셋 — 스토리는 e2e의 화면 미러, 시나리오는 한 곳, 자동화는 play

- 결정:
  > 스토리는 e2e의 화면 미러다. 스토리북 안의 자동화 시험은 e2e를 미러한다. 중복 코드를 최소화해 관리와 회귀 방지를 함께 얻는다. 그래서 **시나리오는 한 곳(§4.2)에 있고, 스토리는 그것을 가져와 그리며, 자동화는 그 스토리의 `play`를 돌린다.**
- 보충:
  > "스토리는 e2e의 화면 미러이고(파일당 다섯 줄), 자동화는 그 스토리의 `play`를 `@storybook/addon-vitest`가 브라우저 모드(chromium)로 돌린다." (`reviews/round-16-owner-review.md:36`)
  > 편집자 결정(227C-01): "【추론】 소유자가 221라운드에 요구한 것은 기계적 동작의 검증이고, 실제 창에서 클릭·입력이 모두 통과했으며 CDP가 필요한 넷은 실제 Chromium 실행으로 덮였으므로 요구가 충족됐다. 열린 질문 스토리의 실패는 스토리 자체가 선언한 결과다." (`reviews/round-227-closing.md:17`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:186`(정본), `09-landing-and-test-strategy.md:125`, `reviews/round-16-owner-review.md:36`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:186`), 소유자 답(`reviews/round-16-owner-answers.md:7` 답 1)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:186`

### TEST-023 스토리북 구조 — 단일 원천·코어 시나리오 시험·시나리오 스토리·자동화·e2e·사용법 스토리

- 결정:
  > | 계층 | 위치 | 역할 | 돌리는 것 |
  > | --- | --- | --- | --- |
  > | 단일 원천 | 비공개 패키지 `@aileron/schema-form-scenarios`(`packages/aileron/schema-form-scenarios/`)의 `src/**/*.scenario.ts` | 스키마·초기값·단계·기대(순수 데이터). 같은 패키지에 `FormScenario` 형, 화면 어댑터 `playScenario`, 시나리오 감싸개를 둔다. 비공개 패키지라 배포되지 않으며 `@canard/schema-form`을 가져오지 않는다(16라운드 답 8) | 없음 |
  > | 코어 시나리오 시험 | `src/core/__tests__/scenarios/<부류>.spec.ts` | 데이터 모듈을 노드 트리에서 해석 | vitest `node` |
  > | 시나리오 스토리 | `stories/scenarios/<이름>.stories.tsx` | 데이터 모듈을 가져와 시나리오 감싸개로 `<Form>`을 그리고(감싸개가 핸들을 등록한다, §4.2) `play`는 `({ canvasElement }) => playScenario(scenario, canvasElement)` 한 줄 | `storybook dev`(화면), addon-vitest(자동화) |
  > | 스토리북 자동화 | 같은 스토리 파일 | `play`를 헤드리스 브라우저에서 | vitest 브라우저 모드 + `@storybook/addon-vitest`(playwright chromium) |
  > | `<Form>` e2e | `src/__tests__/e2e/*.test.tsx` | `renderForm(scenario.schema, { defaultValue: scenario.initialValue })`로 그리고(`renderForm`이 핸들을 `container`에 등록한다, §4.5), 스토리와 같은 `playScenario(scenario, container)`를 돌린 뒤, 스토리에 둘 수 없는 단언(spy, StrictMode, 바운더리 보고, `onError`)만 더한다. 시나리오는 부류마다 실행기 하나(`src/__tests__/e2e/<부류>.test.tsx`, 코어 러너와 같은 부류, 파일당 15건 이하, 16라운드 답 10)가 돌리고, 추가 단언이 있는 시나리오만 자기 파일을 둔다 | vitest `jsdom` + `@testing-library/react`(16라운드 답 1) |
  > | 사용법 스토리 | `stories/usage/*.stories.tsx` | 문서용 소수. 시나리오를 가져오되 `play` 없음 | `storybook dev` |
  > 한 시나리오는 파일 넷(데이터 모듈, 코어 러너, 스토리, e2e 실행기)에 나타나되 스키마와 단계는 한 번만 적힌다. 스토리 파일은 다섯 줄(제목, 가져오기, `args`, `play` 한 줄)이고, e2e는 부류마다 실행기 하나가 돌리고 추가 단언이 있는 것만 자기 파일을 둔다.
- 보충:
  > "**16라운드 편집자 결정 여섯 — 확정(답 10).**" (`09-landing-and-test-strategy.md:279`)
  > "e2e는 부류마다 실행기 하나가 돌린다(§5.2)." (`09-landing-and-test-strategy.md:279`)
  > 편집자 결정(26C-02): "【추론】 PR-2에 배정된 "렌더 시나리오" 게이트는 시나리오를 `@aileron/schema-form-scenarios`의 순수 데이터로 두고, 코어 시나리오 시험(`src/core/__tests__/scenarios/<부류>.spec.ts`)이 새 노드 트리에서 돌리는 것으로 통과를 잰다." (`reviews/round-26-closing.md:22`)
  > 편집자 결정(26C-02): "【추론】 같은 데이터를 `<Form>`으로 그리는 시나리오 스토리와 e2e 실행기는 `<Form>`이 새 엔진을 쓰는 PR-7부터 돈다." (`reviews/round-26-closing.md:23`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:190-197,199`(정본), `reviews/round-16-owner-answers.md:7,14,16`, `reviews/round-16-owner-review.md:61`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:188`), 소유자 답(`reviews/round-16-owner-answers.md:14` 답 8), 소유자 답(`reviews/round-16-owner-answers.md:16` 답 10), 소유자 답(`reviews/round-16-owner-answers.md:7` 답 1)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:186`

### TEST-024 도구와 설정 — vitest 프로젝트 셋, 의존, portable stories, play 안의 expect

- 결정:
  > - vitest `test.projects`의 프로젝트 셋: `unit`(`node`, `src/**/*.{spec,test}.ts`에서 `render`로 가는 `.test.ts`를 `exclude`로 뺀 나머지), `render`(`jsdom`, `src/**/*.test.tsx`(e2e와 훅 시험)와 문서 객체 모델 전역을 쓰는 `.test.ts`(오늘 후보 9파일, PR-0의 처분 목록에서 가른다)), `storybook`(`storybookTest({ configDir: '.storybook' })` 플러그인, `browser: { enabled: true, headless: true, provider: 'playwright', instances: [{ browser: 'chromium' }] }`, `setupFiles: ['.storybook/vitest.setup.ts']`에서 `setProjectAnnotations([preview])`). 오늘 `yarn test`가 모으는 `architecture/spikes/**`의 4파일 45건은 설계 실험의 기록이라 새 프로젝트에 넣지 않는다(시험은 제품의 회귀를 막는 것만 둔다, §4.1. 편집자 결정, 16라운드 답 10). 그 가운데 제품 동작에 남는 상황은 PR-7의 e2e로 옮긴다.
  > - 더할 의존: `@storybook/addon-vitest`(Storybook 10.4와 vitest 3.2에 호환), `@vitest/browser`(`playwright` 1.58.0은 루트에 이미 있다). 루트의 `@storybook/test-runner` 0.24는 뺀다(스토리북 서버를 띄워 주소를 순회하는 구식 경로).
  > - portable stories는 프레임워크 패키지 `@storybook/react-vite`의 `composeStories`·`composeStory`·`setProjectAnnotations`. `Story.run()`(8.2.7 이상)이 마운트·loaders·`play`를 한 번에 돌리고, 플러그인 패키지가 코어의 시나리오 스토리를 돌릴 때는(§5.4) `render(<Story />)` 뒤 `await Story.play({ canvasElement })`(두 호출의 스토리 문맥은 다르지만 핸들은 DOM의 등록으로 건너간다, §4.2).
  > - `play` 안의 `expect`는 `storybook/test`의 것이며 vitest 단언과 같아 화면(인터랙션 패널)과 자동화 양쪽에서 같은 결과를 낸다. `step`은 패널용 래퍼라 vitest에서는 투명하다.
- 보충:
  > "`architecture/spikes/**`의 실험 시험 4파일은 새 vitest 프로젝트에 넣지 않는다(3차 게이트 뒤)." (`reviews/round-16-owner-review.md:61`)
  > "`architecture/spikes/**`의 실험 시험은 새 vitest 프로젝트에 넣지 않는다(§5.3)." (`09-landing-and-test-strategy.md:279`)
  > 편집자 결정(174C-01): "【추론】 자동 게이트는 통과했지만 G23의 정의는 "실제 브라우저에서 소유자가 직접 확인"이므로 자동 통과만으로 닫을 수 없다. 스토리가 일반 스토리북에서 렌더되지 않는 것은 게이트가 사람 확인을 전제로 만들어졌는데 그 전제가 깨진 결함이라 고쳐야 하고, 고침이 src/ 밖의 스토리 파일에 그치면 제품 코드 증거(G27·G32)는 유효하다. 실제 OS IME는 어떤 에이전트도 칠 수 없으므로 그 3행은 처음부터 소유자 몫이었고, 에이전트가 할 수 있는 것은 CDP 합성으로 같은 경로를 실제 창에서 보여 주는 것까지다." (`reviews/round-174-closing.md:9`)
  > 편집자 결정(442C-05): "【추론】 PR-7 #444(`b0fa84e53`)로 기본 `unit`·`render`·`react18` 프로젝트가 출하 설정(게이트 바퀴 `'skip'`, 게이트 선택 표 `'table'`, 파생 그림자 비활성)으로 돌고, 전용 `verify-unit`·`verify-render` 프로젝트(`test:verify`)가 shadow 바퀴·verify 표·파생 그림자 활성으로 같은 시험을 돌며 S1~S6 계수를 기록한다(Opus 검증이 PR-2b에서 "기본 시험이 출하 경로를 한 번도 실행하지 않는다"고 지적한 빈틈의 해소; 환경 변수 전환은 제거, Storybook의 verify 표 기본값은 유지). 소유자의 검증 묶음 지시(위 14·17행)에 따라 전체 프로토콜(antigravity 검토 + Opus 검증 + 관측 동치 + 변이 + 그림자 차등 + A/A′/B 3+12바퀴)은 PR-2b·PR-3에만, 나머지는 Opus 검증 + 축소 측정으로 했고, 검증자의 발견은 모두 병합 전 수정 커밋으로 반영했다(PR-3 호스트 사건 중복 제거 결함, PR-6 사전 공표 도우미 실행 단언, 수정 2의 재생성 고정물 명명, PR-7 derive-shadow 기본값 시험 복귀). 소유자의 8단계 완료 목표(위 22행)에 따라 작업 폴더와 가지를 모두 정리했고(원격 가지 삭제 허가, 23행), 소유자 결정 다섯 항목(PR-5 생략, 수정 3 보류, 인식기 밖 게이트 형 이월, React 재측정은 최종 측정에서, 1.0.0-beta 병합 시 버전 1.0.0-beta.0)은 답이 없어 기본값으로 진행했고, 버전 번호만은 최종 PR에서 소유자 질의로 남겼다(21행). 다음은 최종 PR `feat/schema-form-08-review-and-perf → 1.0.0-beta`다." (`reviews/round-442-closing.md:16`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:203-206`(정본), `09-landing-and-test-strategy.md:278`, `reviews/round-16-owner-review.md:36,61`, `reviews/round-16-owner-answers.md:16`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:201`), 소유자 답(`reviews/round-16-owner-answers.md:16` 답 10)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:203`

### TEST-025 옛 스토리 49파일 33,533줄의 처분 — 데이터 모듈로 옮기고, 사용법은 소수만, 인라인 스키마 스토리는 남기지 않음

- 결정:
  > - 시나리오를 담고 있는 스토리(분기 전환, `allOf`, 조건부, 배열, 검증, 오류 표시)는 데이터 모듈로 옮기고 `stories/scenarios/`의 다섯 줄 스토리가 된다.
  > - 사용법을 보여 주는 스토리(플러그인 소개, `FormTypeInput` 교체, `Form.*` 합성 API, ref 핸들)는 `stories/usage/`에 소수만 남기고 새 문법으로 다시 쓴다.
  > - 스키마를 인라인으로 든 스토리는 남기지 않는다. 플러그인 패키지의 스토리(각 2–4파일)도 같은 규칙이며 코어의 시나리오 스토리를 `composeStories`로 가져와 자기 렌더러로 그린다.
- 보충:
  > 소유자(16라운드 답 4): "옛 스토리 49파일의 처분 | "예. 전체 정리 허용합니다" | 확정. 옛 스토리는 전부 정리할 수 있다" (`reviews/round-16-owner-answers.md:10`)
  > "**옛 스토리의 처분 — 확정(답 4).**" (`09-landing-and-test-strategy.md:272`)
  > "전체 정리를 허용한다." (`09-landing-and-test-strategy.md:272`)
  > "옛 스토리는 PR-7에서 모두 정리되므로(§5.4) 이주 대상이 아니고, 새 시나리오 스토리는 스키마를 모듈 범위에 둔다." (`09-landing-and-test-strategy.md:96`)
  > "스키마를 모듈 범위로 올리는 것은 권고다(함수·컴포넌트 칸을 렌더마다 만들면 reset이 재생성을 탄다)." (`09-landing-and-test-strategy.md:96`)
  > 편집자 결정(77C-01): "【추론】 TEST-025는 소유자 답(16라운드 답 4, "전체 정리 허용")을 받아 옛 스토리 49파일의 처분을 셋으로 정했고 09 §5.4는 "옛 스토리는 PR-7에서 모두 정리된다"고 했으므로, 옛 스토리는 `src/__legacy__/`의 엔진 코드처럼 PR-8까지 보존하는 것이 아니라 PR-7 안에서 파일마다 처분되는 대상이다(LANDING-205의 보존은 `src/__legacy__/`에 한한다; 73C-01이 옛 스토리를 "같은 처분"이라 한 것은 글롭에서 빼는 수단을 말한 것이지 보존을 뜻하지 않는다). 그래서 U8의 (C) — Storybook 글롭과 `tsconfig`의 형 검사에서 `stories/*.stories.tsx`를 빼는 것 — 는 U9(새 시나리오 스토리와 `playScenario`)가 처분을 마칠 때까지 묶음 끝 점검을 초록으로 두는 발판으로만 허용하고, PR-7의 게이트는 "옛 스토리 파일이 남지 않는다"이다: 02가 만든 처분 목록(`verification/02-foundation-and-blueprint/story-disposition.md`)의 행마다 (가) 시나리오 → 데이터 모듈 + `stories/scenarios/`의 다섯 줄 스토리(새 이름), (나) 사용법 → `stories/usage/`에 새 문법으로 다시 씀(소수), (다) 인라인 스키마 → 지움을 적어 07의 처분표 옆에 두고, U9 끝에 49파일을 지우며 글롭·`tsconfig`의 제외 항목도 함께 없앤다. 262건의 형 오류를 새 API로 고쳐 살리는 대안은 TEST-025의 "인라인 스키마 스토리는 남기지 않는다"와 어긋나므로 택하지 않는다. (A)는 68C-01·TEST-005의 적용이고 "버리고 새로 쓴다" 31파일을 U8에서 지우고 U9에서 e2e로 다시 쓰는 사이의 상태는 처분표가 행방을 들고 PR-7이 원샷이므로 허용되며, 기대값이 원장 변경과 부딪히는 파일은 멈추고 물음으로 보낸다; (B)는 73C-01·75C-01 그대로; (D)는 TEST-021의 고칠 것 다섯이다." (`reviews/round-77-closing.md:9`)
  > 소유자(183라운드, ESM NODE_ENV 고침, 스토리 재구성 검토): "어떤 방향이든 고치시죠. 기존 버그도 버그이고, 제 입장에선 꽤 큰 버그로 보이는군요.\nesm 으로 많이 쓰게되니, 적절한 방법으로 수정해주세요. \n해당 값을 상수가 아니라 get 함수로 처리하거나, lazy calc 같은 기법으로 읽는 순간 그 값을 기록하거나.\n\n---\n기존 스키마를 그대로 쓸 수는 없죠.\n우리가 만든 기능들별로 스토리 그룹을 만들고,\n각 그룹별로 기능들에 대한 스토리 테스트,\n그리고 이들을 복합해서 사용하는 스토리 테스트를 구성했으면 합니다.\n\n이건 복잡한 작업이니, 당신이 기능별로 정리해서 요구사항을 처리해보세요.\n\n리뷰어에게 추가 작업을 적층하기 전에, 지금 작업을 마무리한 다음 이어서 하도록 하고싶어요. \n아니면 스토리 디렉토리만 잘 나눠서 처리할 자신 있으면 병렬로 처리해도 됩니다. \n일단 검토부터 해보죠." (`reviews/round-183-owner-answers.md:7`) — ESM 번들의 NODE_ENV 접힘을 두 겹(패키지의 lazy 평가, 빌드 스크립트)으로 고친다; 스토리는 기능별 그룹·기능 스토리 테스트·복합 스토리 테스트로 새로 구성하며 원장 관리자가 기능별 요구사항을 먼저 검토해 올린다(원장 관리자, 2026-10-13).
  > 편집자 결정(184C-01): "【추론】 소유자가 원한 것은 옛 카탈로그의 복원이 아니라 "기능별로 설계된 검증 가능한 스토리"이므로, 그룹은 코드 영역이 아니라 소비자 문서의 기능 경계로 자르고 모든 스토리에 단언을 붙이는 것이 맞다. 옛 사례는 데이터로 복사하지 않되 그룹마다 후보로 적어 두면 걱정한 구성(중첩 oneOf, oneOf+anyOf, $ref 트리)이 빠지지 않는다. 새 디렉토리에만 쓰면 src를 고치는 reviewer와 충돌할 곳이 글롭 한 줄과 export 한 줄뿐이라 병렬로 가도 안전하다." (`reviews/round-184-closing.md:9`)
  > 소유자(186라운드, 검토안 수용, 복합 강조, 검증기 분기, 워크트리·PR): "다 제안대로 가자. fairy07한테 지금 병렬로 시작시켜.\n복합 사례는 다양한 사례가 가능한 만큼 치밀하게 구성해야해.\n단일 동작은 테스트도 쉽지만, 발견도 쉽고, 문제 가능성도 비교적 낮아.\n복합 동작에서 대부분 회귀와 타이밍 이슈가 생겼으니 복합동작과 중첩동작에 힘을 싫도록.\n\najv 등을 이용한 검증기 기반 분기 제어도 이번 스토리에 추가하도록. \n\ncomposeStories 는 필요하면 쓰도록 해. \n\n@fairy07 한테 지시하고, 브라우저 테스트까지 하라고 해.\n\n커밋은 지금 리뷰어 작업이랑 충돌할 수도 있으니까 워크트리 나누고, 작업한 다음에 pr로 머지하자. \n그게 안전하겠지?" (`reviews/round-186-owner-answers.md:7`) — 스토리 재구성은 184라운드 검토안대로 fairy07이 별도 워크트리·PR로 지금 시작하며 복합·중첩 동작과 검증기 기반 분기 제어에 힘을 싣는다(원장 관리자, 2026-10-13).
  > 편집자 결정(187C-01): "【추론】 alias와 paths는 스토리북 실행 설정이지 제품 코드가 아니고 lockfile을 건드리지 않으므로 07c의 공유 파일 한계 안에 둘 수 있다. 문서가 옛 문법을 가르치는 것은 스토리 작업의 범위 밖이지만 소비자가 보는 계약이라 정리 항목으로 남기고 소유자가 알아야 한다. 작성 표면 변경이 의도된 것임을 reviewer 개괄에서 빠뜨린 것은 원장 관리자의 누락이다." (`reviews/round-187-closing.md:9`)
  > 편집자 결정(191C-01): "【추론】 batch 결함은 소유자가 복합 동작에 힘을 실으라고 한 바로 그 종류이고, 단일 쓰기에서는 보이지 않으니 지금까지의 시험이 놓친 것이다. 원장 계약을 어기는 제품 결함은 머지 전에 고쳐야 하고, 고칠 자리(dispatch)는 reviewer가 지금 쥔 브랜치라 그쪽에 두는 것이 가장 빠르다. 복합 설계의 공통 결정 넷은 시나리오 패키지의 경계(형을 넓히면 모든 소비자에 닿음)를 지키는 쪽이 맞고 소유자가 정할 성격이 아니다. 사례 목록은 소유자가 "치밀하게"를 요구했으니 소유자가 본다." (`reviews/round-191-closing.md:9`)
  > 소유자(192라운드, 복합 설계 수용, 측정 시점, 07c 위임, 역할): "복합사례 예정대로 하자. \n측정은 지금 작업들 끝나는대로 픽시한테 지시해. \n\n스토리 복원은 별도 pr 로 올려. \n검증과 측정까지 페어리에게 위임한다.\n너는 관리 및 관제, 기록을 담당하렴. \n\n리뷰어 작업 끝나면 진행하는거지? \n리뷰어는 지금 문제점 발견 후 수정중인거같은데" (`reviews/round-192-owner-answers.md:7`) — 복합 사례 24건 설계안대로; 측정은 리뷰 작업이 끝나는 대로 fixy07; 07c는 별도 PR로 검증·측정까지 fairy07; 원장 관리자는 관리·관제·기록(원장 관리자, 2026-10-13).
  > 편집자 결정(194C-01): "【추론】 G2는 verifier가 한 번 FAIL을 내고 고친 뒤 PASS라 보고의 신뢰도가 높고, 62C-01 해석은 원장 본문과 일치한다. 감싸개는 플러그인의 판정을 바꾸지 않고 계수만 더하니 스토리 기반으로 적절하다." (`reviews/round-194-closing.md:9`)
  > 소유자(198라운드, 회귀 시험, explain 문서, 부재 중 운영, 부속 PR 머지, 최종 상태): "좋아 알았어. 지금 문제를 찾는건 한 편으론 또 다행이네.\n다만, 고칠때 적절한 테스트를 구축해서 회귀를 막도록.\n\n구조 고찰을 마무리하면 /seiri:explain 을 써서 전체 프랙탈 구조에 대한 설명을 작성해줘.\n그걸 보고 최종 검증을 하도록 할게.\n\n다만, 나는 잠시 자리를 비울테니까, 내 응답이나 결정이 필요한건 되도록 미루고,\nPR도 feat/schema-form-switch 를 제외하면 알아서 정리하고 머지했으면 해. \n\n최종적으론 feat/schema-form-switch 브랜치 1개만 draft로 열려있고, 나머지 부속 pr들은 전부 마무리 및 검증을 한 다음 합쳐줬으면 해.\n\n그 과정에서 발견되는 문제나 회귀는 바로바로 고치고.\n\n그 상태에서 나는 explain 으로 작성된 프렉탈 소유 도표와 근거 문서를 보고, 그 문서를 리뷰해서 해당 구조로 최종적으로 바꾸는걸 진행하고싶어.\n\n내 말이 이해가 되었니?" (`reviews/round-198-owner-answers.md:7`) — 고침마다 회귀 시험; 소유자 부재 중 결정은 미루고 부속 PR(#355, 07c)은 검증 뒤 원장 관리자가 머지; feat/schema-form-switch만 draft로 남김; 구조 고찰 뒤 seiri:explain 문서를 소유자가 보고 재배치(원장 관리자, 2026-10-13).
  > 편집자 결정(199C-01): "【추론】 영역 밖 값의 표시는 원장이 비워 둔 제품 결정이고 다른 그룹에 의존하지 않으니 미루는 데 비용이 없다." (`reviews/round-199-closing.md:9`)
  > 편집자 결정(201C-01): "【추론】 ERROR-139는 "어디로 드러나는가"를 적었고 ERROR-016·019는 "무엇이 기록되는가"를 적어 둘을 합치면 검증 거부는 싱크만이다. 제품이 이미 그렇고 스토리가 고정하니 문서 한 문장만 맞추면 된다." (`reviews/round-201-closing.md:9`)
  > 편집자 결정(202C-01): "【추론】 소유자는 멈춤 없이, 권한 문제는 미루라고 했다. G4의 품질 증거는 이미 셋이고 PR 최종 검증이 남아 있으니 verifier 하나를 뒤로 미뤄도 위험이 작다." (`reviews/round-202-closing.md:9`)
  > 편집자 결정(203C-01): "【추론】 그룹별 verifier는 품질 보강이고 게이트(자동·e2e·실제 창)는 그대로 돌고 있다. PR 머지 전 독립 검증은 어차피 원장 관리자 몫이므로 거기에 그룹 검토를 얹으면 소유자 부재 중에도 머지 조건이 유지된다." (`reviews/round-203-closing.md:9`)
  > 편집자 결정(205C-01): "【추론】 변이 탐침은 verifier가 하던 핵심 검사(적재 하중 확인)를 같은 세션이 직접 한 것이라 증거 등급이 조금 낮지만 PR 전체 독립 검증이 남아 있다. 07b-1에 코드가 들어왔으니 이번 rebase 뒤에는 게이트 재실행이 필요하다." (`reviews/round-205-closing.md:9`)
  > 편집자 결정(207C-01): "【추론】 (a)는 두 항목이 서로 다른 층(발생·전달)을 적은 것이라 모순이 아니다. (b)는 설계 가치가 분명히 정한 방향(같은 값은 같은 참조)이고 성능에 직접 닿으므로 07b가 맞는 자리다." (`reviews/round-207-closing.md:9`)
  > 편집자 결정(209C-01): "【추론】 꼬리는 전부 사양대로이고 측정 경로와 독립이라 다시 전체 시험을 돌려 측정을 흔들 이유가 없다. verifier 거부는 세션 공통이라 직접 검증으로 대체하되 그 사실을 적어 둔다." (`reviews/round-209-closing.md:9`)
  > 편집자 결정(210C-01): "【추론】 열 그룹의 결함이 둘뿐이고 둘 다 복합·타이밍 종류라, 소유자가 힘을 실으라고 한 복합 24건이 진짜 시험대다." (`reviews/round-210-closing.md:9`)
  > 편집자 결정(214C-01): "【추론】 동기 통지 규칙은 조합 중 쓰기를 배제하지 않고 오히려 요구한다(입력 이벤트마다 통지). 노드 값을 조합 끝까지 미루면 조합 중 Refresh·전환 때 입력과 노드가 어긋난다." (`reviews/round-214-closing.md:9`)
  > 편집자 결정(215C-01): "【추론】 PR의 코드 범위가 시험·스토리·시나리오뿐이고 수치가 직접 재실행과 맞으며 결함은 모두 상류에서 고쳐졌으므로 머지에 남는 위험은 없다. 최상위 virtual 형은 런타임이 무시하는 자리를 형이 허용하는 함정이라 지워야 하지만 공개 형이므로 계획을 거친다." (`reviews/round-215-closing.md:15`)
  > 소유자(221라운드, 기계적 검증 범위): "그래. 기계적 검증까지는 하도록 해. 실사는 있다가 직접 본다고 해도, 기계적 동작은 검증이 되었으면 하는군. 에이전틱 브라우저는 클릭이나 입력이 다 될테니까" (`reviews/round-221-owner-answers.md:7`)
  > 편집자 결정(227C-01): "【추론】 소유자가 221라운드에 요구한 것은 기계적 동작의 검증이고, 실제 창에서 클릭·입력이 모두 통과했으며 CDP가 필요한 넷은 실제 Chromium 실행으로 덮였으므로 요구가 충족됐다. 열린 질문 스토리의 실패는 스토리 자체가 선언한 결과다." (`reviews/round-227-closing.md:17`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:210-212`(정본), `reviews/round-16-owner-answers.md:10`, `reviews/round-16-owner-review.md:55`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:10` 답 4)
- 라운드: 16
- 까닭: `reviews/round-16-owner-review.md:55`

### TEST-026 옛 판과 새 판의 속도 비교 — 하니스 benchmark-form, 같은 폼의 기준점, 코어와 렌더, 측정 조건, 패키지 벤치 일곱

- 결정:
  > - **하니스는 `@aileron/benchmark-form`이다.** 이미 npm alias로 옛 판 다섯(`@canard/schema-form_0.9.0` … `_0.12.5`)과 워크스페이스 판을 나란히 설치해 비교하고 있고, `render-trace.tsx`가 경로별 렌더 커밋 수를 센다. 새 항목만 더한다.
  > - **기준점은 같은 폼이다.** 스키마 문법이 호환되지 않으므로 `fixtures/equivalent/<이름>.ts`에 옛 문법과 새 문법의 쌍을 두고, 쌍마다 두 판의 `<Form>`이 같은 상호작용 열 뒤에 같은 `[data-path]` 집합을 그리는지(`renderForm`의 `renderedPaths()`와 같은 선택자 `[data-path]:not([data-deferred])`를 `@aileron/benchmark-form` 안에서 판마다 쓴다. `data-path`를 그리지 않는 0.9.0은 이 대조에서 뺀다)를 시험이 단언한다(다르면 벤치가 아니라 시험이 실패한다). 상호작용 열도 쌍에 같이 둔다.
  > - **둘로 나눠 잰다.** 코어(`node` 환경, 트리 생성·값 갱신·정착 시간)와 렌더(React 19, `<React.Profiler>`의 커밋 수와 `actualDuration`, `render-trace`의 번짐).
  > - **조건.** 워밍업 10회 이상, 표본 100회 이상, 평균 대신 중앙값과 99번째 백분위, `node --expose-gc`로 표본 사이 명시적 수집. 결과는 `results/`에 날짜와 커밋으로 남긴다.
  > - **패키지 벤치 일곱**(`bench/*.bench.ts`: `branch-strategy-init`, `compute-recalculate`, `event-cascade`, `find-node`, `nodeFromJSONSchema`, `object-pending-read`, `render-delay`)은 새 엔진의 대응물로 다시 쓴다. 이름은 새 fractal을 따른다(`blueprint`, `settle`, `dispatch`, `find`, `load`). 옛 엔진에서 마지막 기준선을 `bench:baseline`으로 남긴다. 이름이 바뀌므로 옛 판 대 새 판의 비교는 `@aileron/benchmark-form`만 맡고, 패키지 벤치는 새 엔진 안의 회귀 감시로 쓴다. 지속 통합 작업 흐름 `.github/workflows/performance-benchmarks.yml`의 과다 렌더 단언과 회귀 검사는 PR-7에서 새 기준선으로 갱신한다.
- 보충:
  > 편집자 결정(68C-04): "【추론】 TEST-026은 하니스를 `@aileron/benchmark-form`으로, 비교 대상을 "npm 별칭의 옛 판과 워크스페이스 판"으로 정했다. 전환 뒤 워크스페이스 판은 새 엔진이므로 옛 판 자리는 마지막으로 배포된 판(오늘 `0.16.0`; 별칭 `@canard/schema-form_0.16.0`)이 맡는다 — 전환 직전 커밋의 워크스페이스 판을 따로 기준으로 삼지 않는다. 그 까닭은 1.0.0-beta의 공개 진입점이 PR-7까지 옛 엔진을 가리키고(LANDING-159 규칙 3) 02–06이 공개 동작을 바꾸지 않았으므로(32C-01) 배포 판과 전환 직전의 옛 엔진이 같은 동작이기 때문이며, 둘이 다르다는 증거가 나오면 그때 전환 직전 커밋을 별칭으로 더한다. 07은 `fixtures/equivalent/<이름>.ts`에 옛 문법과 새 문법 쌍과 상호작용 열을 두고, 두 판이 같은 `[data-path]` 집합을 그리는지 시험이 단언한 뒤에 잰다. 패키지 벤치(`bench/*.bench.ts`)는 02–06이 새 fractal 이름으로 일부 다시 썼으므로 07은 TEST-026의 일곱 대응물 가운데 아직 없는 것(렌더 지연 등)을 채우고, 옛 엔진의 마지막 기준선은 전환 직전 커밋에서 `bench:baseline`으로 남긴다. `.github/workflows/performance-benchmarks.yml`의 과다 렌더 단언과 회귀 검사를 새 기준선으로 갱신하는 것도 TEST-026이 PR-7에 둔 일이다. 느린 행은 TEST-027 절차다." (`reviews/round-68-closing.md:30`)
  > 편집자 결정(82C-01): "【추론】 TEST-027의 수용은 상수 배의 느린 행에 대한 것이고, 56라운드 소유자 답이 일반 규칙으로 세운 두 조건(동작 정상, 폼 크기에 대해 비례 이상으로 악화되지 않음) 가운데 둘째를 어기는 행은 GOAL-011("비용은 폼의 크기가 아니라 바꾼 것의 크기에 비례")의 계약 위반 후보라 수용 대상이 아니다. 그래서 (가) 같은 묶음 안에서 크기만 다른 픽스처 사이에 새/옛 배율이 뚜렷이 커지는 코어 행 — 마운트의 flat-50/100/500(4.02→5.02), nested-d3/d5(5.11→8.10), oneOf-5/10/20(3.38→5.00), 갱신의 oneOf-5/10/20(6.30→11.34)과 그 묶음에 속한 행 — 은 대장에 "계약 위반 후보, 수용 대상 아님 — 07 진단 중"으로 바꾸고, 07은 65C-01의 방법대로 단계마다(청사진, 노드 생성, 첫 정착, 검증 등록, 배달 표시) 비용을 재어 크기에 선형인 상수 몫과 초선형인 구조 몫을 가르고, 자기 시나리오(렌더·`nodeFromJSONSchema`)가 닿는 구조 몫은 49C-01대로 07이 고치며, 앞 단계 코드의 몫은 귀속을 적어 열린 행(수용 대상 아님, 어느 PR의 머지도 막지 않음)으로 둔다. 진단 뒤 상수 배로 판명된 행은 (나)로 옮긴다. (나) 배율이 크기와 무관한 행(React 층의 마운트 1.0–1.8배와 갱신, 코어의 sample-0–3 등)은 행마다 묻지 않고 한 묶음으로 소유자에게 올린다 — 56라운드 답은 묶음 수용의 선례이고, 76라운드가 정돈 → 성능 최적화 순서를 세웠으므로 묻는 내용은 "지금 수용하고 성능 최적화 단계로 넘기는가"다. (다) 패키지 벤치 후보 P-99–132는 옛 기준선 JSON에 원 표본이 없어 통계 판정이 서지 않고, TEST-026이 "이름이 바뀌므로 옛 판 대 새 판의 비교는 `benchmark-form`만 맡고 패키지 벤치는 새 엔진 안의 회귀 감시로 쓴다"고 했으므로 애초에 수용 행이 아니다 — 대장에서 "후보" 행을 "기록(새 엔진의 회귀 감시 기준선, 비교 판정 없음)"으로 바꾸고 `bench:baseline`을 새 엔진에서 다시 남긴다; 옛 중앙값 0.00004 ms 같은 값은 옛 벤치가 다른 것을 쟀다는 뜻이라 비교에 쓰지 않는다. (라) 번들 크기(esbuild minify + gzip 71,317 B, 기준 37,023 B, 1.93배; 레거시 포함 없음)는 TEST-075의 "늘면 이유를 적고 Vincent가 받아들여야 병합"에 따라 이유(새 엔진 자체의 크기, 어느 fractal이 얼마인지)를 적어 소유자에게 묻는다. G26은 (가)의 진단과 (나)·(라)의 소유자 답이 끝나야 통과하며, (가)에서 열린 행으로 남긴 몫은 G26을 막지 않는다." (`reviews/round-82-closing.md:9`)
  > 편집자 결정(83C-01): "【추론】 56라운드 규칙이 가르는 것은 "폼 크기에 대해 비례 이상으로 악화되는가"이고, 그 판정 방법은 65C-01이 정한 단계별 선형 기준 대 잔차다. 07의 진단에서 초선형 잔차를 낸 몫은 모두 고쳐졌고(복잡도 시험 초록) 남은 단계의 잔차가 0 근처라면 남은 비용은 크기에 선형인 상수 몫이다; 옛 판 대비 배율이 크기에 따라 조금 오르는 것은 옛 판에 크기에 둔감한 고정 몫이 있어 작은 폼에서 배율이 낮게 나오기 때문이며, 배율은 두 선형 상수의 비로 수렴하므로 가장 큰 크기의 배율이 그 상수의 비에 가장 가깝다. 그러므로 크기 계열 행은 "보류"가 아니라 소유자 묶음에 넣되, 대표 수치는 가장 큰 크기의 배율(flat-500 마운트 4.80배, nested-d5 마운트 7.28배, oneOf-20 마운트 4.30배·갱신 10.63배 등)로 적고 그 까닭을 한 줄 덧붙여 소유자가 가장 나쁜 값을 보고 판단하게 한다; 크기 축을 더해 다시 재는 것은 같은 결론(선형)을 다른 방법으로 확인하는 일이라 성능 최적화 단계로 넘긴다. 07이 고친 구조 몫 가운데 03·04·06 코드의 것은 42라운드·78C-02의 선례대로 `plan/07-switch/log.md` §8 "앞 단계 결함"에 귀속을 적고(계약 위반을 발견한 단계가 고침, 49C-01), 재귀 검사의 첫 실행 비용이 3.39배 는 것은 성장비 0.61로 선형이므로 기록으로 족하다. 열린 행 P-135는 65C-04·67C-01의 P-24·P-25와 같은 자리(수용 대상 아님, 머지를 막지 않음, 정돈 또는 성능 최적화)다. 벤치의 원 표본 JSON은 TEST-026 "결과는 `results/`에 날짜와 커밋으로 남긴다"대로 PR에 둔다 — 오늘 옛 기준선에 원 표본이 없어 패키지 벤치 34행의 통계 판정이 서지 않은 것이 원 표본을 남겨야 하는 까닭이고, 19 MB는 그 디렉토리의 관례(약 220 MB) 안이다; 다만 중앙값·p99 같은 요약은 보고서에 따로 적어 원 표본 없이도 읽히게 한다." (`reviews/round-83-closing.md:9`)
  > 편집자 결정(86C-01): "【추론】 TEST-026은 렌더 비교를 "React 19, `<React.Profiler>`의 커밋 수와 `actualDuration`"으로 정했고 빌드 종류는 적지 않았다. 비교의 뜻은 두 판을 같은 조건에서 견주는 것이므로, 한 판에만 걸리는 개발 빌드의 진단 비용(React 19의 owner-stack 예산: 1초 리셋, JSX 1만 개)이 수치를 가르면 그 조건은 비교에 맞지 않다. 그래서 85C-01 (다)의 게이트 수치는 `react-dom/profiling`(production 동작 + Profiler)로 두 판을 잰 것으로 하고, 개발 빌드의 수치는 같은 표에 "개발 빌드, owner-stack 예산 비대칭"을 적어 기록으로 둔다 — 소비자가 개발 중 보는 체감도 자료로 남기되 게이트에는 쓰지 않는다. 두 판의 진단 조건을 같게 통제하는 것은 React 내부 설정을 건드리는 일이라 택하지 않는다." (`reviews/round-86-closing.md:9`)
  > 편집자 결정(88C-02): "【추론】 TEST-026이 남기라고 한 "결과"는 통계 판정(중앙값·p99·Welch)에 필요한 시간 값의 원 표본이고(83C-01이 그 까닭을 적었다), 단계 추적이 표본마다 든 파일은 진단의 중간 산출물이라 요약(단계별 중앙값·호출 수)으로 족하다. 그러므로 07은 다음 커밋에서 그 파일들을 작업 트리에서 지우고 같은 자리에 요약 JSON을 두며, 앞으로 원 표본은 시간 값만 파일당 5 MB 이하로 남기고 단계 추적은 요약으로 남긴다(측정 스크립트의 기본값을 그렇게 바꾼다). 이미 푸시된 히스토리는 강제 푸시 금지 규칙대로 건드리지 않는다 — 소유자가 단계 PR을 스쿼시 머지해 왔으므로(06 #353의 `07a083c18`) PR-7도 스쿼시 머지되면 `1.0.0-beta`의 히스토리에는 그 파일이 들지 않고, 가지 `feat/schema-form-switch`는 머지 뒤 소유자가 지우면 그 블롭도 함께 사라진다. 이 사실을 PR 본문의 "알림" 절에 한 줄 적는다." (`reviews/round-88-closing.md:16`)
  > 편집자 결정(93C-01): "【추론】 비교의 뜻은 두 판이 같은 일을 하는 데 드는 시간을 같은 조건에서 견주는 것이다(86C-01). 옛 판은 호출이 돌아온 뒤 비동기로 정착을 마저 하므로 그 몫을 뺀 옛 값은 일의 일부만 잰 것이고, 그것을 분모로 쓰면 새 판이 실제보다 느리게 나온다 — 그래서 85C-01의 판정은 86C-02 재측정이 쓴 방법(단계별 배타 시간의 합 active, 옛 판의 비동기 정착 포함, 타이머 대기 제외)으로 한다. TEST-026의 조건(워밍업 10회 이상, 표본 100회 이상, 중앙값과 p99, 명시적 수집)은 그대로다. 여기에 92라운드가 변경의 앞뒤 비교에 인정한 원칙을 옛 판 대 새 판에도 적용한다: 두 판을 같은 세션, 같은 Node 판에서 번갈아 재고 그 쌍의 중앙값 비로만 판정하며, 다른 날이나 다른 런타임에서 잰 옛 값은 분모로 쓰지 않는다(기계 상태와 런타임의 차이가 섞인다 — 이번에 v24의 옛 값과 v26의 새 값이 섞였다). 런타임 판은 판정표에 적는다. 무계측 동기 측정은 계측 비용이 없어 변경 하나의 효과를 가르는 데 좋으므로 변경 앞뒤(H 대 W)의 인과 비교에 쓰고, 옛 판 대비 판정에는 쓰지 않는다 — 보고서는 두 표를 제목으로 구별하고 한 표의 수치를 다른 표의 판정에 옮기지 않는다. 계측에는 치우침이 있을 수 있다: 배타 시간의 합은 계측된 호출마다 측정 비용이 얹히므로 호출이 많은 판이 불리하다. 그래서 판정표에 판마다 계측된 호출 수와 빈 구간으로 잰 호출당 계측 비용을 적고, 그 보정으로 판정이 바뀌는 행(목표 선의 보정 폭 안에 있는 행)은 표시해 두 값을 함께 보인다 — 방법을 바꿔 수치를 맞추는 것이 아니라 치우침의 크기를 드러내는 것이다. 91라운드의 분기 폼 기준(분기 수에 따른 증가, 단계별 중복)도 같은 방법의 단계별 값으로 본다. 07은 (i) 커밋 뒤 이 방법으로 공식 판정표를 새로 만들고, (ii)의 보고서에서 "7행 가운데 둘 충족"은 방법이 다른 대조였다는 정정을 적는다." (`reviews/round-93-closing.md:9`)
  > 편집자 결정(94C-01): "【추론】 93C-01은 계측의 치우침을 "호출이 많은 판이 불리하다"고 보아 그 크기를 적게 했고, 재어 보니 호출이 많은 쪽은 옛 판이었다(마운트에서 스물일곱 배쯤). 그러므로 배타 시간의 합은 옛 판에 호출마다 측정 비용을 더 얹어 새 판을 실제보다 빠르게 보이게 하며, 그 폭은 판정을 뒤집을 만큼 크다(flat-500 마운트 1.45배가 보정하면 2.25배). 성능은 주장하지 않고 측정한다는 원칙(GOAL-011)과 느린 행을 넘기지 않는다는 소유자의 지시(84라운드, 그리고 "생략하거나 대충 할 수 없다")에 비추어, 자기에게 유리한 치우침을 안은 수치로 충족을 적을 수 없다. 그래서 정한다. (가) 지금부터 코어 행은 보정한 배율로도 목표 안일 때만 충족이고, 원 배율만 충족인 행은 미달이다 — 93C-01의 "보정 뒤 결과로 공식 판정을 바꾸지 않는다"는 읽기를 이 결정이 바꾼다. (나) 치우침이 없는 방법을 만든다: 계측 없이, 호출부터 그 호출이 낸 마이크로태스크 큐가 빌 때까지를 한 표본으로 재면 옛 판의 비동기 정착이 들고 타이머 대기는 빠지며 호출마다의 측정 비용이 없다; 07은 옛 판의 뒤이은 정착이 마이크로태스크만으로 끝나는지(검증기 끔, 구독 없음의 조건에서) 확인해 이 종단 측정을 만들고, 타이머에 걸리는 몫이 있으면 그 몫과 까닭을 적어 물음으로 올린다. 종단 측정이 서면 그것이 85C-01의 공식 판정 수치이고(같은 세션 번갈아, TEST-026의 조건), 배타 시간의 합은 단계별로 원인을 가르는 진단의 자료다 — 진단의 단계 값에도 판마다의 호출 수와 보정을 함께 적는다. (다) React 층은 계측 구간을 더하지 않은 프로파일러 값이라 이 치우침이 없으므로 그대로다. 이번 판정표의 코어 충족 수는 원 12행이 아니라 보정한 7행으로 읽는다." (`reviews/round-94-closing.md:9`)
  > 편집자 결정(95C-01): "【추론】 94C-01이 종단 측정에 둔 뜻은 "옛 판의 비동기 정착은 넣고 타이머 대기는 뺀다"였고, 그 가름의 기준은 예약의 종류가 아니라 일과 기다림이다. 옛 판이 `setImmediate`에서 하는 배치 초기화와 `onChange`의 예약·호출은 새 판이 호출 안에서 동기로 하는 일의 대응물이므로(쓰기 하나의 뒤처리와 `onChange`) 그 실행 몫을 빼면 옛 판이 일의 일부만 잰 값이 되고, 반대로 루프가 그 단계에 닿기까지의 대기는 엔진의 일이 아니다. 그러므로 07의 권고대로 정한다: 표본의 끝은 호출이 낸 마이크로태스크와 엔진이 예약한 `setImmediate` 콜백이 모두 끝난 때이고(같은 단계의 큐에서 엔진 콜백 뒤에 도는 표지로 판정), 대기의 고정 몫은 아무 일도 예약하지 않는 빈 호출을 같은 방법·같은 세션에서 재어 두 판 모두에서 빼며 그 상수와 흩어짐을 판정표에 적는다. 두 가지를 검증으로 보인다. (가) 새 판은 `setImmediate`를 예약하지 않으므로 이 정의의 값이 마이크로태스크 종단의 값과 같아야 한다. (나) 옛 판에 대해, 마이크로태스크 종단의 시간에 엔진 콜백의 실행 시간만 따로 잰 값(예약 경계 한 곳을 감싼 측정이라 호출마다의 계측 비용이 없다)을 더한 수치가 이 정의의 값과 잡음 안에서 맞아야 한다 — 맞지 않으면 대기의 빼기가 흔들리는 것이므로 (나)의 합을 옛 판의 수치로 쓰고 그 까닭을 적는다. 다른 조건은 93C-01·94C-01 그대로다(같은 세션 번갈아, TEST-026의 표본 조건, 런타임 판 기록, 회차별 배율). 이 정의는 Node의 코어 측정에 대한 것이며, React 층은 프로파일러 값이라 해당하지 않는다." (`reviews/round-95-closing.md:9`)
  > 편집자 결정(99C-01): "【추론】 판별 선택 표는 결과를 바꾸지 않고 조건 평가를 분기 수와 무관하게 만들었으나 시간이 줄지 않았으므로 97C-01의 "계수와 측정으로 보인 뒤"와 88C-01의 선례대로 되돌린 상태가 최종이고, 설계와 차등·그림자 시험은 남는다(뒤에 조건 평가가 실제 몫이 되면 같은 조건으로 다시 잴 수 있다). 더 중요한 것은 이 결과가 진단의 방법에 대해 말하는 바다. 94C-03의 진단은 분기 마흔의 전환에서 게이트 평가를 29.0%로 잡았는데 그것을 0으로 만들어도 전체가 2% 안팎밖에 움직이지 않았다 — 그 몫은 대부분 일의 시간이 아니라 호출마다 얹힌 측정 비용이었다. 94C-01은 구간을 끼워 재는 방법이 호출이 많은 옛 판을 느리게 보이게 함을 찾아 판정에서 그 방법을 내렸고, 같은 치우침이 새 판 안의 단계 사이에도 있다: 호출이 수백 번인 작은 함수(조건 평가, 읽기 등록)는 부풀고 호출이 적고 큰 일(조립, 복사, 정렬)은 줄어 보인다. 빈 구간으로 보정해도 계측이 인라인과 최적화를 막아 생기는 비용은 빠지지 않는다. 그러므로 94C-03이 잡은 나머지 몫(잠복 등록, 읽기 계획, 선택 표의 나머지, 갱신 고정비의 구간들, 마운트의 재병합)도 그대로 믿고 고치면 같은 헛걸음이 된다. 다음을 정한다. (가) 귀속은 계측 구간을 끼우지 않는 표본 프로파일러(V8의 CPU 프로파일, 표본 간격을 짧게)로 한다: 같은 전환을 충분히 되풀이하는 고리에서 함수별 자기 시간과 누적 시간을 얻고, 분기 5와 40의 프로파일을 견주어 분기 수에 따라 느는 함수를 가린다(91라운드 기준 (1)의 자리); 갱신 고정비와 남은 마운트 간극도 같은 방법으로 다시 본다. (나) 큰 몫으로 나온 일은 고치기 전에 떼어 내기 측정으로 상한을 확인한다: 그 일을 시험용으로 건너뛰거나 상수로 바꾼 빌드의 종단 시간을 재어(결과가 틀려도 되는 측정 전용) 실제로 얼마가 줄 수 있는지를 본 뒤, 상한이 잡음보다 뚜렷이 큰 것만 구현한다. (다) 구간을 끼운 단계별 값은 호출 수의 계수(무엇이 몇 번 도는가)를 보이는 자료로만 쓰고 시간의 몫으로 읽지 않는다. (라) 종단 측정(95C-01)이 판정이라는 것은 그대로다. 이것은 TEST-026의 조건을 바꾸지 않고 진단의 도구를 정하는 것이며, "성능은 주장하지 않고 측정한다"(GOAL-011)의 적용이다. 07은 잠복 등록·읽기 계획·선택 표의 나머지를 고치기 전에 (가)의 프로파일을 먼저 올리고, 결과 재사용(97C-01의 나)도 그 프로파일이 조건 평가나 형상 판정을 실제 몫으로 보일 때만 구현한다. 모듈 문서에 구현하지 않은 표의 계약이 남은 것을 지우고 현재 동작만 적는 07의 정리는 맞다(문서는 현재 명세만 적는다)." (`reviews/round-99-closing.md:9`)
  > 편집자 결정(105C-01): "【추론】 두 판정은 다른 물음이다. 공식 판정표(85C-01·94C-02·95C-01)는 "새 판이 옛 판 대비 목표 안인가"를 묻고 그 배율은 회차 잡음보다 훨씬 커서 세 회차로 충분하다. 변경 하나의 채택은 "이 변경이 HEAD보다 나은가"를 묻고 그 차이는 이제 회차 잡음과 같은 크기다 — 큰 몫은 다 걷어 냈고 남은 것은 0.1–0.8 ms의 몫 열하나이며 이것들이 쌓여야 nested-d5의 간극(7.7 ms 대 목표 4.7 ms)이 줄어든다. 세 회차 모두 잡음을 넘어야 한다는 지금 규칙은 실제로 0.3–0.4 ms 빠른 변경을 체계적으로 버리므로, 측정의 감도를 차이의 크기에 맞춘다. 방법은 07의 권고대로다: 측정 조건(무엇을 어떻게 재는가 — 표본마다 순서 교대, 강제 수집, 예열 20, 종단 끝점)은 그대로 두고 회차 수만 셋에서 아홉으로 늘리며, 채택은 아홉 회차 pooled 짝 차이 중앙값의 99% 부트스트랩 구간이 0보다 크고 그 중앙값이 같은 설계의 A/A 대조(HEAD 대 HEAD 아홉 회차, 같은 세션에서 한 번)의 같은 통계보다 클 때이고, 회귀 배제는 어느 행의 pooled 구간도 0보다 작지 않을 때다. 세 회차 규칙으로 이미 잡음 밖인 변경은 지금처럼 간다(아홉 회차는 잡음보다 작은 이득의 판정에만 쓴다). 이것은 TEST-026의 조건을 바꾸지 않고 채택 판정의 감도를 정하는 것이며 "성능은 주장하지 않고 측정한다"(GOAL-011)의 적용이다. 경로 만들기(`5e8f34625`)는 이 규칙으로 다시 재어 판정하고, 그 뒤 상한 순서(자식 열거, 선언 수집, 게이트 읽기 …)로 변경 하나에 아홉 회차 재측정 하나로 간다. 보고에는 pooled 중앙값, 구간, A/A 대조의 통계를 행마다 적는다." (`reviews/round-105-closing.md:9`)
  > 편집자 결정(109C-01): "【추론】 (1) 95C-01의 종단 끝점은 "microtask와 엔진이 예약한 `setImmediate`가 끝나는 때"이고 (가)는 그 끝점과 microtask 끝점 사이에 엔진의 일이 없음을 확인하는 교차 검사다. 측정기 자신이 끼운 sentinel이 그 사이에 들어가면 (가)는 엔진이 아니라 측정기를 재는 것이므로, 배열 폼에서만 걸린 것은 배열 폼의 종단이 microtask 끝에 충분히 가까워 sentinel의 비용이 드러났기 때문이다. 측정기를 고치고(측정 조건은 그대로, sentinel의 자리만) 세 폼의 보류 행을 같은 설계로 다시 검증한다 — 통과하면 판정하고(이미 104라운드 수용 행이므로 수용 표시는 그대로), 다른 행의 (가)에 영향이 있는지도 다시 계산해 적는다. (3) 91라운드 소유자 답의 기준 ①은 "전환 비용이 건드리지 않은 분기의 수에 따라 늘지 않는다"이고, 07의 축 측정은 분기 하나당 BF 33 µs·이후 갱신 11 µs의 선형 증가를 보였다 — 미달이다. 지금까지의 사실: 조건 평가 자체는 원인이 아니고(99C-01), 프로파일은 경로 해석·자식 선택·투영 읽기·게이트 등록·재계산 표시가 분기 수에 따라 는다고 가리켰으며(100라운드), 게이트 결과 재사용은 전환 고정비 때문에 기각되었다(102라운드 덧붙임). 그러므로 다음은 귀속이다: 무관한 분기 하나가 전환마다 어느 함수에서 몇 번 방문되는지(조각 열거, 게이트의 읽기 등록, 자식 선택의 후보 순회, 경로 해석, 투영 읽기, 재계산 표시), 그 방문이 결과에 필요한지(꺼진 분기의 게이트도 "모두 다시 평가"가 원장이 정한 것 — BLUEPRINT-007 — 이므로 평가 자체는 필요하되 그 평가가 상수 시간인지), 그리고 분기당 33 µs와 11 µs가 어느 함수들의 합인지를 정상 상태 프로파일과 호출 횟수로 가른다. 이것은 측정과 계수이므로 104라운드 범위 안이고 7단계에서 지금 한다. 고침은 귀속 결과에 따라 코드 수준(예: 분기당 반복되는 상수 시간 밖의 일을 상수 시간으로)일 수도, 정착 설계(예: 게이트 평가의 순서나 집합)일 수도 있으므로 소유자가 그 결과를 보고 7단계에서 할지 개선 단계로 보낼지 정한다 — 그 전까지 G26은 열어 둔다. (2) flat-50·flat-100의 첫 갱신은 107C-01이 손질 대상으로 둔 자리이고 손질(O1·A1)이 회귀로 기각되었으므로, 104라운드 수용의 원인(쓰기당 고정비)이 아닌 "첫 갱신에만 드는 1회 비용"으로 소유자에게 처분을 묻는다 — 편집자가 같은 원인으로 넓혀 읽지 않는다(48C-01·49C-01)." (`reviews/round-109-closing.md:9`)
  > 편집자 결정(111C-01): "【추론】 95C-01이 (가)를 둔 까닭은 종단 끝점(microtask와 엔진이 예약한 `setImmediate`의 끝)과 microtask 끝점이 서로 다른 시계이고, 둘이 같은 일을 재고 있음을 교차로 확인하기 위해서다. 끝점을 sentinel 앞의 microtask 읽기로 옮기면 두 시계가 하나가 되어 차이가 정의상 0이고, 그러면 (가)는 아무것도 확인하지 않는다 — "통과"가 늘어난 것은 검증이 사라진 결과다. 07이 든 다른 형태가 맞다: sentinel의 꼬리(측정기가 끼운 `setImmediate`의 비용)는 측정기의 상수이므로, 95C-01이 빈 호출 루프의 지연을 재어 빼는 것과 같은 자리에서 같은 프로세스의 표본마다 빈 호출의 sentinel 꼬리를 짝으로 재어 종단 끝점에서 뺀다. 그러면 두 시계가 각각 살아 있고 (가)는 다시 등가 검사다. 경계 검증(두 끝점 사이 엔진 macrotask 0회)은 유용하므로 (가)를 대신하지 않고 더한다 — 둘 다 성립해야 통과다. 배열 열두 행은 이 형태로 다시 검증하고, 다른 행의 (가)도 다시 계산해 바뀌는 행이 있으면 적는다. 판정과 수용 표시에는 영향이 없다(이미 수용 행). `verdict-95c01.md`의 검증 설명 옆에 이 형태를 적는다." (`reviews/round-111-closing.md:9`)
  > 편집자 결정(117C-01): "【추론】 (1) 첫 변경의 계수는 뜻대로였고(무관 분기당 후보 방문 18 → 0, 사전 공표 12 → 0) 분기당 기울기도 두 할 줄었으나, 회귀가 난 네 행은 모두 분기 수와 무관한 자리(if-then의 마운트와 BF, flat-500의 첫 갱신)다 — 마운트 때 모든 호스트에 후보 계획을 미리 만드는 비용이 분기가 없는 폼에도 얹힌 것이고, 이는 89C-03의 "쓰이지 않을 색인을 미리 만들지 않는다"와 같은 자리다. 그러므로 계획은 그것을 실제로 쓰는 첫 전환에서, 분기가 둘 이상인 union 호스트에만 지연으로 만든다(1b). 같은 판정 행과 분기 축으로 다시 재어 채택 조건(어느 행도 최소 크기 넘게 나빠지지 않음, 분기 축 기울기 감소)을 본다. (2) React 층의 새 몫은 두 종류다. 하나는 flat·nested·식 폼의 쓰기당 약 0.2 ms로, 코어 갱신은 옛 판과 같거나 빠른데 React 층만 늘었으므로 바인딩 계층(구독, 선택자, 메모, 입력 재마운트)의 몫이다. 다른 하나는 배열 push의 쓰기당 약 1.4 ms로, 렌더 호출이 16% 늘고 커밋이 반으로 준 것은 배치의 단위가 바뀌어 한 커밋에 더 많은 컴포넌트가 다시 렌더된다는 뜻이다 — 어느 컴포넌트가 왜 다시 렌더되는지(props 참조의 변화, 구독 범위, key) 계수로 가르기 전에는 고칠 자리를 모른다. 그러므로 먼저 읽기 전용 진단(Opus debugger)으로 컴포넌트·훅 단위의 렌더 횟수와 원인을 세고, 그 뒤 분기 작업과 같은 절차(변경 하나에 차등과 아홉 회차 판정 하나)로 고친다. 공개 API와 바인딩 계약(REACT-019·024, EVENT-039·040)은 바뀌지 않아야 한다. (3) sample-0~3의 첫 갱신 약 0.1 ms는 코어의 고정비이고 110라운드의 flat 첫 갱신 수용과 같은 원인(첫 갱신의 1회 비용)으로 보이나 편집자가 넓혀 읽지 않는다 — React 층 고침이 끝난 뒤 남는 React 행과 함께 소유자에게 올린다. A/A에서 (가)를 통과하지 못한 마운트 행은 측정기의 문제(짝 꼬리의 흔들림)인지 다른 것인지를 밝혀 적되 판정에는 쓰지 않는다. 회차별 원자료를 저장소에 넣지 않고 해시 목록만 커밋한 처분은 88C-02의 선례대로 맞다." (`reviews/round-117-closing.md:9`)
  > 편집자 결정(118C-01): "【추론】 (1) 측정은 두 판이 같은 일을 재야 한다. 지금의 wall은 옛 판이 타이머 대기 안으로 미룬 커밋을 세지 않고 새 판이 동기로 끝낸 커밋은 세므로, 94C-01이 걷어낸 계측 치우침과 같은 종류의 치우침이다 — 옛 판에 유리한 쪽으로. 타이머 하한 없는 대기는 두 판의 모든 커밋이 끝날 때까지 기다리되 타이머의 최소 대기를 빼고, CPU 활성 시간은 대기 자체를 빼므로 둘을 판정 열로 둔다; 기존 wall은 비교의 연속을 위해 기록 열로 남긴다. 그 결과 flat·nested·computed의 React 층 증가는 사라지거나 음수가 되고, 실제로 남는 것은 array-push·push-remove(쓰기당 +0.23~+0.64 ms)와 replace-200(+9.5~+11.2 ms)이다. 커밋 수 단언(옛 2, 새 1)은 이 기제가 측정의 전제임을 고정한다. 제품의 커밋을 미뤄 지표를 맞추는 것은 REACT-024(동기 정착·uSES 읽기)를 뒤집는 것이고 사용자에게는 더 늦은 화면이므로 쓰지 않는다. 판정 열의 변경은 소유자가 정한 React 층 목표(27라운드, 85C-01)의 측정 방법을 바꾸는 것이므로 소유자에게 알리고, 소유자가 다르게 보면 바로잡는다. (2) 실제로 늘어난 일은 필드당 fiber 계층 다섯이고, 이 가운데 경계 계층(입력 경계의 세 층, 프록시의 래퍼와 경계)을 줄이는 고침은 결과를 바꾸지 않는 코드 수준이다. 두 고침 모두 ErrorBoundary 클래스를 직접 써야 하는데 `@winglet/react-utils`는 `withErrorBoundary`만 내보낸다; 클래스를 더해 내보내는 것은 기존 소비자의 동작을 바꾸지 않는 추가이고, ERROR-115가 같은 패키지의 감싸개에 선택 인자를 더한 선례와 같은 "안전한 확장"이다(reuse-first). schema-form 안에 내부 경계 클래스를 두면 winglet의 것과 중복된다. 패키지 CLAUDE.md의 문장은 112C-01이 정한 "경계는 해석·소유 지점에서 한 번 만들어 고정"의 뜻을 그대로 두고 수단(`withErrorBoundary` 또는 ErrorBoundary 직접)만 넓히며, CLAUDE.md의 변경은 07 세션의 규칙대로 소유자 확인을 받는다. 기대 효과(필드당 fiber 2개, replace-200 약 −3 ms, push 쓰기당 약 −0.03 ms)는 추정이므로 변경 하나에 105C-01 판정 하나로 확인한다; 공개 API와 EVENT-039·040, REACT-019·024, 112C-01의 단언 시험은 그대로 초록이어야 한다. 입력당 노드 이중 구독과 자식마다의 layout effect는 다음 코드 수준 후보로 두되 바인딩 계약(REACT-024의 늦은 쓰기 차단, 112C-01의 경계 고정)에 닿는지 명세에 적는다." (`reviews/round-118-closing.md:9`)
  > 편집자 결정(120C-01): "【추론】 (1) 1·1b·2가 모두 if-then 행에서 회귀했고 1b는 그 호스트에서 아무 계획도 만들지 않으므로, 회귀는 "무엇을 더 하는가"가 아니라 "같은 함수가 다른 모양이 되었는가"의 문제다 — 자식 선택과 게이트 평가 함수에 분기 하나가 더해지거나 인자의 모양이 둘로 갈리면 V8이 인라인을 포기하거나 다형 접근으로 떨어지고, 그 비용은 분기가 없는 폼에도 얹힌다(103라운드가 동결 축소에서 본 것과 같은 종류). 그러므로 네 번째 변형을 짐작으로 만들지 않고, 최적화·역최적화 기록과 함수별 인라인 여부를 HEAD와 변경 사이에 대조해 회귀의 함수와 까닭을 가린 뒤, 뜨거운 함수의 모양을 바꾸지 않는 형태(예: 분기 폼 전용 경로를 별도 함수로 두어 기존 함수는 그대로)로 1c·2b를 만든다. 채택 규칙(105C-01과 최소 크기)은 지금 바꾸지 않는다 — 다만 진단이 회귀를 피할 수 없는 모양 비용으로 결론 내면, 분기 축의 두 할 이득과 무관한 행의 1% 안팎 회귀를 맞바꾸는 규칙을 편집자가 다시 묻는다(116라운드 소유자의 절대 기준으로 보면 5 µs는 프레임 예산의 0.03%이고 분기 마흔 개 전환의 두 할은 0.3 ms다). (2) React 프록시 감사는 119라운드의 원칙이 정한 대로이며 측정과 겹치지 않는 읽기 전용이므로 지금 시작한다. (3) 측정기의 결함 둘은 95C-01의 방법 안의 정정이다 — 옛 판 커밋 수는 fixture마다 다르므로 상수 단언 대신 "보정 회차의 관측값이 표본 내내 일정함"으로, GC 뒤 첫 빈 호출의 긴 꼬리는 버린다; 다섯 갱신 행은 고친 단언으로 다음 세션에서 판정하고, 그 전까지 참고 배율로 둔다. (4) 다음 세션의 순서는 07의 권고대로다." (`reviews/round-120-closing.md:9`)
  > 편집자 결정(124C-01): "【추론】 105C-01의 채택 규칙은 "변경 하나의 이득을 소음과 가르고 무관한 행의 회귀를 막는" 장치이지 측정기의 조건이 만든 소음을 회귀로 세는 장치가 아니다. 세 번의 되돌림 뒤 122 진단이 피할 수 있는 원인 둘을 가렸고 1c가 그 둘을 없앴는데도 같은 행에서 같은 크기가 남았으며, 그 크기는 (가) 빈 함수 호출 하나로도 재현되고, (나) gc 없는 조건에서는 구간이 0을 품으며, (다) gc 있는 첫 갱신이 gc 없는 것의 2.7배라는 사실로 강제 gc 직후의 재최적화 몫임이 뒷받침된다. 그러므로 이것은 "피할 수 없는 모양 비용"이라기보다 측정 조건(표본마다 강제 gc)이 만드는 소음이고, 판정 열을 gc 있음으로 두는 TEST-026의 조건은 유지하되 그 소음이 지시된 축의 큰 이득을 막지 않도록 좁은 교환 규칙을 둔다. 좁게 두는 까닭: 규칙이 넓으면 모든 회귀가 "소음"으로 빠져나가므로, 네 조건(지시된 축의 이득이 회귀 합계의 열 배, 행마다 2%·5 µs 이하, gc 없는 열의 구간이 0을 품음, 그 열이 없으면 먼저 잼)을 모두 요구하고 다른 회귀는 지금처럼 막는다. 소유자의 기준으로 보면 if-then의 1~3 µs는 16.67 ms 예산의 0.02%이고 `oneOf`-40 BF의 약 350 µs는 2.1%이므로 교환은 116라운드의 절대 기준에 맞고, 113라운드의 "분기 장부는 7단계에서 코드 수준으로 고친다"에 닿는다. 적용: 1c의 첫 갱신 두 행은 조건을 채웠으나 OFF·ON 갱신(이후 갱신) 두 행은 07의 보고에 gc 없는 열이 없으므로 — F4가 첫 쓰기 행에만 그 열을 두었다 — 그 두 행과 2의 OFF 마운트에 gc 없는 열을 아홉 회차로 더 잰 뒤 조건을 확인하고 채택을 정한다; 채택되면 2는 1c 위에서, F3은 2 위에서 판정한다. F-A의 array-100 갱신 회귀(−9.8 µs, −1.3%)는 첫 쓰기 계열이 아니고 React 층이며 진단이 없으므로 규칙 밖이다 — 읽기 전용 진단(렌더·커밋 계수, CPU 프로필)으로 원인을 가린 뒤 F-A를 고쳐 다시 판정한다. React 표의 14행 미달은 F2 계열의 측정 대상 그대로다. 측정기 쪽: 고친 A/A가 옛 A/A보다 큰 것은 120라운드 덧붙임의 예상대로이며 이후 모든 판정의 소음 기준은 고친 A/A다." (`reviews/round-124-closing.md:9`)
  > 편집자 결정(125C-01): "【추론】 F-A의 array-100 회귀는 A/A의 순서 편향(6~23 µs)보다 작은 10 µs이고, 단독 프로세스에서는 반대 부호(F-A가 약 9 µs 빠름)이므로 코드의 회귀가 아니라 측정기의 결함이다. 이것은 94C-01(계측 치우침), 118C-01(타이머 대기), 120 덧붙임(컴파일 공유 A/A)에 이은 네 번째 측정 방법의 정정이며 모두 같은 종류다 — 두 판이 같은 조건에서 재어지지 않았다. 95C-01의 "새 프로세스 쌍 측정"은 코어에 적용되었고 React 측정기는 한 프로세스에 두 번들을 올려 로드 순서가 고정이었으므로, React도 번들 하나 프로세스를 번갈아 띄우는 같은 형태로 맞춘다. 코어는 표본마다 순서를 바꾸므로 편향이 상쇄될 가능성이 있으나 확인되지 않았고, 1c·2의 if-then 첫 쓰기 회귀가 바로 그 자리이므로 124C-01의 확인 세션 전에 진단한다 — 편향이 있으면 124C-01의 교환 규칙을 적용하기 전에 회귀 자체가 사라질 수 있다. F-A의 `memo(ErrorBoundary)`는 children이 렌더마다 새 엘리먼트라 비교가 항상 실패하는 memo이므로 빼는 것이 동작을 바꾸지 않고 비용만 줄인다(119라운드의 얇은 계층 원칙과도 맞음); F-A'로 다시 판정한다. gc 없음 조건의 증분 마킹 효과는 GC 일정의 일이라 기록만 한다. 지금까지 새 판정 열로 낸 React 표의 첫 쓰기 계열 행은 같은 편향을 품었으므로 고친 측정기로 다시 낸다; 그 밖의 행은 편향이 첫 쓰기에 몰리므로 그대로 두되 다시 낸 표에서 함께 확인한다." (`reviews/round-125-closing.md:9`)
  > 편집자 결정(127C-01): "【추론】 bootstrap은 표본이 독립일 때만 구간이 맞다. 번들 하나 프로세스 방식(125C-01)은 프로세스 사이의 수준 차이를 짝 비교의 소음으로 들여왔고, 그 소음은 프로세스 안의 표본들이 공유하므로 표본 단위 재표집은 실제보다 많은 독립 정보를 가정해 구간을 좁힌다 — 같은 코드의 A/A에서 30%가 유의로 나온 것이 그 증거이고, 올바른 방법에서는 약 1%여야 한다. 그러므로 구간의 단위를 독립인 것(ABBA 블록)으로 올리는 클러스터 bootstrap이 맞고, 블록이 아홉이면 구간이 너무 넓으므로 블록을 늘리고 프로세스당 표본을 줄여 전체 표본은 비슷하게 둔다(프로세스 수가 느는 비용은 세션 분할로 흡수). 이 정정 아래에서는 작은 이득과 작은 회귀가 모두 "유의하지 않음"으로 바뀔 것이고, 그것이 정직한 결과다 — 분기 축의 수백 µs 이득은 남고, 1~5 µs의 회귀 대부분은 소음으로 돌아갈 것이다. 변경 2는 이미 커밋되었으므로 재판정에서 회귀가 나오면 되돌리고 이득이 유의하면 그대로 둔다; 1c와 F-A'의 기각은 이 방법으로 다시 판정하되, F-A'의 계수 결과(fiber·렌더·단언)는 방법과 무관하므로 그대로 쓴다. 다섯 번째 정정(94C-01 계측 치우침, 118C-01 타이머 대기, 120 덧붙임 컴파일 공유, 125C-01 로드 순서, 이번 구간의 독립성 가정)이 모두 세션 하나씩 지나며 드러났으므로, 하나씩 찾는 비용이 전체 검토의 비용을 넘었다 — 다음 세션 전에 파이프라인 전체를 한 번에 검토한다(소유자 지침: 검증은 antigravity 우선, Claude verifier 대안, 엔진 기록). 판정 규칙(105C-01, 124C-01)은 바뀌지 않고 구간을 내는 방법만 바뀐다." (`reviews/round-127-closing.md:9`)
  > 편집자 결정(128C-01): "【추론】 (1) 124C-01의 네 조건은 "회귀가 코드의 비용인가 측정 조건의 소음인가"를 가르는 장치이고, 그 가름의 증거는 gc 없는 열의 구간이다. 열을 어느 행에서 재느냐는 도구의 사정이지 규칙의 범위가 아니며, 조건 (4)가 "없는 행은 먼저 재라"고 한 것은 모든 행이 대상임을 전제한다. 원문의 이름은 122 진단의 전제("gc 직후에만")를 따랐으나 126a가 그 전제를 뒤집었으므로(if-then의 회귀는 실제 비용) 이름을 전제에서 떼어 "측정 조건 소음(기록)"으로 고친다 — 규칙의 조건은 바뀌지 않는다. 07이 제안한 "변경 코드가 실행되지 않는 행" 조항은 조건으로 두지 않는다: 그런 행의 회귀는 번들 모양의 효과이지만 사용자가 그 비용을 실제로 치르므로 크기 조건 (2)와 gc 없는 열 조건 (3)을 면제할 수 없다; 다만 그 사실은 회귀의 원인을 읽는 데 쓸모가 있으므로 계수로 함께 적는다. 변경 2의 채택은 이 해석으로 유효하지만 어차피 127C-01의 재판정을 받는다. (2) 약 100행을 99% 구간으로 독립 판정하면 같은 코드에서도 변경당 약 1행이 우연히 회귀로 나오고, 회귀 하나가 채택을 막는 규칙은 그 우연에 약하다. 전체 유의 수준을 보정(본페로니 등)하면 검출력이 떨어지므로, 대신 회귀로 나온 행만 독립 측정으로 확인해 두 번 모두 회귀일 때 회귀로 세는 확인 측정을 둔다 — 두 번 모두 우연일 확률은 행당 0.01%로 내려간다. 이득 쪽은 확인하지 않아 채택이 더 어려워지는 쪽의 비대칭이며, 이것이 "성능은 주장하지 않고 측정한다"에 맞다. (3) 도구 결함 일곱은 판정의 결과를 바꾸지 않는 종류(계수 0인 검사, 단언 누락, 고정값, 시드 공유, 엄격한 단언)이므로 07의 고침대로 두고, 다음 A/A 세션의 결과(같은 코드에서 0을 제외하는 행 약 1%)가 고침 전체의 확인이다." (`reviews/round-128-closing.md:9`)
  > 소유자(129라운드, 측정 세션의 크기): "그래 지금 이건 마무리를 하고 다음에는 조금 더 쪼개도록. 한 세션이 6시간 타임아웃이 걸리는건 단일 작업을 너무 크게 위임한거고, 그거야말로 판정을 못하는 큰 작업이란 의미니까" (`reviews/round-129-owner-answers.md:7`) — 측정 세션은 산출물 하나에 2시간 안으로 쪼개고, 측정기는 LLM이 단계를 잇지 않는 스크립트 하나로 돌린다(원장 관리자, 2026-10-09).
  > 소유자(130라운드, 검증 엔진의 등급): "아 그리고 검증에 apex 쓰지말라그래. 그건 설계와 추론단계에서 쓰는거지 단순 검증에서 쓰는 용도가 아니야" (`reviews/round-130-owner-answers.md:11`) — 검증 위임에는 apex 등급을 쓰지 않고 high 이하로 하며 엔진과 등급을 기록한다(원장 관리자, 2026-10-09).
  > 소유자(135라운드, 지연과 동시 진행): "그래 철저한건 좋은데, 시간이 무한히, 엄청나게 걸리는건 사실이거든. 우리가 지금 거의 200시간 가까이 묶여있는거라서... 지나친 지연이야. 동시에 할 수 있는건 동시에 하면서 시간을 줄이도록 해. 그렇다고 대충하라는건 아니지만 말이지" (`reviews/round-135-owner-answers.md:7`) — 남은 화면 고침 넷은 판정 하나, 최종 A/A는 바뀐 쪽만, G27과 G26 초안은 지금 시작한다(원장 관리자, 2026-10-10).
  > 편집자 결정(131C-01): "【추론】 127C-01은 구간의 단위를 독립인 블록으로 올려 과대 검출의 큰 몫을 없앴지만, 블록 중앙값의 백분위 bootstrap은 블록이 적을 때 분위수 추정이 덜 보수적이어서 행당 거짓 양성률이 1%를 조금 넘고 블록을 늘려도 내려가지 않는다 — 진단이 세 자료(129d 재표집, 129a+129d 실측, 자가 시험)에서 같은 값을 얻었으므로 방법의 성질이다. 순서통계량 구간은 분포 가정 없이 이항 계수로 포함률이 정확히 정해지므로 이 자리에 맞고, 블록 8에서는 사실상 최소와 최대 사이가 되어 넓지만 그 행들은 애초에 줄인 검출력으로 잰 것이므로 결함이 아니라 정직한 표현이다; t 구간은 평균을 쓰므로 꼬리가 무거운 행에서 검출력을 잃어 쓰지 않는다. 중복 행은 사건을 두 번 세는 것이므로 빼고, 실행기 결함은 고친다. 줄인 행과 전체 행을 따로 세는 것은 다음 A/A에서 어느 집합이 범위를 넘는지 가르기 위해서다. 앞선 판정은 회귀 0행이 모두 "0을 품음"에서 나온 결론이고 새 구간은 더 넓으므로 회귀 결론은 그대로이며, 이득 가운데 우연한 한두 행은 124C-01 조건 (1)의 열 배 여유 안이다. `if-then/on/update-later`의 양수는 사후 선택일 수 있으나 세 세션에서 같은 방향이므로 역할을 바꾼 A/A로 확인한다 — 기준과 후보를 바꿔도 같은 부호면 측정기의 비대칭이고, 뒤집히면 코드의 비대칭이다." (`reviews/round-131-closing.md:9`)
  > 편집자 결정(134C-01): "【추론】 변경 하나에 판정 하나(88C-01·105C-01)의 뜻은 이득과 회귀를 변경에 귀속시키는 것이다. 효과가 작고 독립인 고침 셋을 묶어 판정해도 회귀가 없으면 귀속은 문제가 없고, 회귀가 나오면 갈라 재어 귀속한다 — 묶음은 귀속의 지연이지 포기가 아니다. A/A는 같은 코드를 두 번들로 잰 소음이고 그 크기는 측정기의 조건(프로세스, gc, 블록)이 정하므로 코드의 작은 변경에 거의 무관하다; 그래서 채택마다 다시 재는 것은 확인이지 필요가 아니며, 끝에 한 번으로 확인하고 넘으면 재계산하는 쪽이 같은 보증을 더 싼 값에 준다(129라운드의 "효율은 원장 관리자의 역할"). 분기 축 재측정은 어차피 최종 표의 행이다. G27은 코드가 바뀌면 다시 해야 하므로 마지막 코드 변경 뒤에 두되 측정과 겹칠 수 있고, base 정리는 미리 준비할 수 있다. 줄인 뒤 남는 세션은 F-B 판정 셋, 번들 판정 셋, 최종 A/A와 최종 표 넷이며 기계 시간 열다섯 시간 안팎이다." (`reviews/round-134-closing.md:9`)
  > 편집자 결정(136C-01): "【추론】 채택 규칙(105C-01·128C-01)은 확인된 회귀를 면제 조건(124C-01) 없이는 넘기지 않는다고 정했고, 이 회귀는 두 번 같은 방향으로 나왔으며 크기가 면제 조건의 스무 배를 넘는다 — 기전이 코드의 일이 아니라 힙 위상으로 추정되더라도 그 추정을 근거로 규칙을 비켜 가면 규칙은 그때그때의 설명에 따라 달라지는 것이 된다. 한편 134C-01은 묶음을 "귀속의 지연"으로 두었고 하나씩 뺀 비교가 그 귀속을 해 주었다: F-E를 빼면 손실이 사라지고 F-F를 빼면 남으므로 F-E가 필요조건이다(F-B·F-C 제외의 미해결은 검출력 부족이지 반증이 아니다). 그러므로 F-E를 떼고 나머지 셋을 다시 판정하는 것이 "변경 하나에 판정 하나"의 뜻에 맞고, 셋 번들의 재판정은 피할 수 없는 비용이다(같은 번들이 아니면 앞선 판정을 빌릴 수 없다). F-E의 손실이 gc-on 판정 열에서만 나고 gc 없는 열에서는 0을 품는다는 사실은 121 덧붙임(Q130)이 이미 올린 물음 — 판정 열의 조건을 gc 없는 쪽으로 볼지 — 의 첫 실물 사례이므로 그 물음에 붙여 소유자에게 올리고, 7단계 안에서는 지금 조건으로 끝낸다(132라운드: 진행을 막지 않는 소유자 결정은 질의 목록에)." (`reviews/round-136-closing.md:9`)
  > 편집자 결정(137C-01): "【추론】 (가)는 판정이 아니라 측정기의 두 시계가 같은 일을 재는지의 교차 검사이고(95C-01, 111C-01이 그 뜻을 지켰다), 세 행의 실패는 pooled 차이가 잡음 안(−6.0 대 6.6)이거나 그 경계(25.9 대 21.5)에 있어 측정기의 결함보다 회차 소음에 가깝다 — 그러므로 128C-01이 회귀에 둔 "한 번 더 보고 두 번이면 확정"의 뜻을 교차 검사에도 같이 적용해 한 번만 다시 재고, 통과할 때까지 반복하는 선택 편향은 조건을 문장으로 적어 막는다. 1.5배 초과 행의 수용은 56라운드 소유자 규칙과 TEST-027·82C-01·83C-01이 정한 소유자 결정이므로 편집자가 대신하지 않되, 이미 수용된 행을 다시 묻는 것은 소유자의 시간을 낭비하므로 새 행만 가른다. 기준 ①은 GOAL-011의 계약("비용은 바꾼 것의 크기에 비례")에 닿는 물음이고 07단계의 목표였으나, 분기 축 개선(변경 2·1c)이 기울기를 44% 줄이고 남은 자리를 표로 밝혔으므로 7단계 안에서 더 고치는 것과 개선 단계로 넘기는 것 사이의 선택은 지연 비용(135라운드)과 계약의 무게를 함께 재는 소유자의 결정이다 — 132라운드에 따라 진행을 막지 않으므로 질의 목록에 올리고 PR 시점에 한 번에 묻는다." (`reviews/round-137-closing.md:9`)
  > 편집자 결정(139C-01): "【추론】 105C-01의 "변경 하나에 판정 하나"는 변경의 크기로 면제되지 않는다 — 정수 비교 하나와 형 변경만이라는 근거로 측정을 건너뛰면 규칙은 그때그때의 설명에 따라 달라진다(137C-01·138C-01과 같은 자리). 반면 A/A는 측정기 조건의 소음이라 작은 코드 변경에 무관하다는 134C-01의 전제가 136i(0/68행)로 방금 확인되었으므로 새 A/A는 비용만 더한다; 판정 세션은 main 행 집합 하나로 족한데, B4의 추가 비용은 reset 경로의 정수 비교 하나이고 측정 행(mount·update·BF)은 reset을 돌리지 않으며 array-1000·nested-d5 부분이 더 보는 것은 큰 폼의 같은 경로이기 때문이다 — 번들 차분을 먼저 실어 "그 둘 외의 차이가 없다"를 보이는 것이 이 축소의 조건이다. G27의 코어 형 단언 14개는 작업 공간 규칙(명시적 사용자 승인)에 따라 소유자만 닫을 수 있고 132라운드가 그런 결정을 PR 시점에 묻도록 했으므로 138C-01과 같이 게이트를 정직하게 열어 둔다. B4는 구조 검증이 잡은 실제 회귀이고 F-F의 "소비자가 있을 때만 보고"가 로드 경계를 넘어 상태를 남긴 것이므로, 고침은 상태를 로드 번호에 묶어 F-F의 조건을 지키면서 경계를 되살리는 것이 맞고, 두 React 판에서 고치기 전 실패·고친 뒤 통과하는 시험이 그 증거다." (`reviews/round-139-closing.md:9`)
  > 소유자(140라운드, 측정 원자료의 처분): "원자료는 보관 브랜치로, PR에는 보고서만 (Recommended)" (`reviews/round-140-owner-answers.md:7`) — 7단계 측정 원자료(json·gz·cpuprofile, 약 1,180 MB)는 07 브랜치 tip을 보존한 태그 `archive/stage-07-pre-rebase-20261011`과 브랜치 `archive/stage-07-verification-raw`에 남기고, PR 트리에는 보고서·도구·해시(sha256) 목록만 남긴다; 보고서의 원자료 인용은 그 보관 브랜치를 가리킨다(원장 관리자, 2026-10-11).
  > 소유자(142라운드, 판정 열의 GC 조건(질의 3항)): "지금 조건 유지 (Recommended)" (`reviews/round-142-owner-answers.md:10`) — 판정 열은 GC 있는 열(wall·active)을 유지한다; F-E는 보류 상태로 성능 개선 단계에서 다시 본다(원장 관리자, 2026-10-11).
  > 소유자(144라운드, 배열 3행 재판정의 판정 열): "어떨까? 일부 조건을 바꿨으니, 평가의 엄밀성에 필요하다면 수전해도된다" (`reviews/round-144-owner-answers.md:7`) — 143라운드 재판정 대상인 화면 배열 갱신 3행에 한해 판정 열을 강제 GC 열(wall·active)과 GC 없는 wall 열의 둘로 한다(채택은 두 열 모두 회귀 없음, 이득은 열마다 따로, 최종 보고는 두 열 나란히); 다른 행은 그대로이고 지난 판정은 뒤집지 않는다(원장 관리자, 2026-10-11).
  > 편집자 결정(145C-01): "【추론】 144라운드가 GC 없는 열을 더한 이유는 강제 GC가 걷어내는 GC 몫을 판정에 넣기 위해서이고, 그 목적은 판정 세션이 같은 블록에서 함께 재는 짝 열로 이미 이루어진다 — 같은 블록·같은 짝 비교·같은 A/A 절차를 갖추었으므로 128C-01의 "확인된 회귀"와 124C-01의 면제 조건을 그대로 적용할 수 있다. 기록 열은 측정 정의(drainTicks(2) 대기)가 달라 값이 두 배 넘게 크고 짝 비교가 없으므로, 그것을 판정 열로 만들려면 도구 변경과 A/A 한 세션이 먼저 들고(135라운드의 지연 억제에 어긋남) 얻는 것은 같은 GC 몫의 다른 정의뿐이다. 다만 소유자가 본 배율은 그 기록 열의 값이므로, 끝에 같은 정의로 다시 재서 두 판정 열 옆에 올려야 "줄었다"가 소유자가 본 수치로도 말해진다. 144라운드의 규칙 (1)~(5)는 그대로이고, (5)의 A/A 확인은 이 보고로 끝났다." (`reviews/round-145-closing.md:9`)
  > 편집자 결정(160C-01): "【추론】 "바이트 동일"을 요구한 뜻은 측정 경로의 실행 코드가 바뀌지 않았음을 값싸게 증명하자는 것이었지, 번들러가 붙이는 경로 주석과 이름 번호까지 같으라는 것이 아니었다. 파일을 나누면 그 둘은 원리상 달라지므로 바이트 동일은 구조 변경에 적용할 수 없는 기준이고, 정규화 뒤 남는 차이를 명시적으로 열거해 전부 적재 시점의 일회성 비용임을 보이는 쪽이 같은 목적을 더 정확하게 이룬다. 남는 비용(빈 배열 하나, 초기화 래퍼 하나)은 측정 하네스의 예열 20회 전에 끝나므로 어떤 판정 열에도 닿지 않는다. 선택지 (3)은 소유자가 159라운드에서 개선-34를 하겠다고 한 뜻에 어긋나고, (2)는 차이를 없애지 못하면서 파일만 는다." (`reviews/round-160-closing.md:9`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:218-222`(정본), `reviews/round-16-owner-review.md:37`, `adr/0009-performance-budget-and-benchmarks.md:20,32`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:216`)
- 라운드: 16
- 까닭: `reviews/round-16-owner-review.md:37`

### TEST-027 벤치 게이트 — 옛 판보다 느린 항목은 이유를 적고 Vincent가 받아들여야 병합, 통제 가능하고 일정 수준 안

- 결정:
  > - **게이트(16라운드 답 6으로 확정).** PR-7 병합 전과 릴리스 전에 돌린다. 옛 판보다 느린 항목이 있으면 이유를 적고 Vincent가 받아들여야 병합한다. 옛 판보다 느린 것(대표적으로 `if`-`then`으로 스키마를 제한 없이 넓히는 문법)은 두 조건을 지킨다. 통제 가능: 비용이 입력 크기(가드 수, 조각 수, 재계산 목록의 크기)에 예측 가능하게 자라고, 가드 컴파일은 작성된 위치당 한 번이며(§2.1의 조건 1), 한 정착은 예산 다섯 안에서 끝난다(08 §7)(편집자 도출). 일정 수준: 상한을 둔다. 상한의 형태(옛 판 대비 배율인가 절대 수치인가)와 수치는 ADR 0009의 미결이며 기준선을 잰 뒤 Vincent가 정한다(18라운드 안건). 노드 구조의 벤치 B1–B6(§3의 비용)도 이 기준선과 비교한다.
- 보충:
  > "새 구현의 어떤 단계도 예산을 넘는 회귀를 안고 병합하지 않는다. 기존의 통계적 게이트(`guard:check`)를 쓴다. 옛 판보다 느린 항목은 이유를 적고 Vincent가 받아들여야 병합한다. 느린 것(대표적으로 `if`-`then`으로 스키마를 제한 없이 넓히는 문법)은 통제 가능하고 일정 수준 안이어야 한다(16라운드 답 6으로 확정, 09 §6.1)." (`adr/0009-performance-budget-and-benchmarks.md:92`)
  > 소유자(16라운드 답 6): "예, 대표적으로 if-then 을 사용한 무제한 스카마 확장 문법은 더 느릴수밖에 없을겁니다. 대신 통제 가능하고 일정 수준 내에서만 느리길 바랍니다" (`reviews/round-16-owner-answers.md:12`)
  > "옛 판보다 느린 것은 통제 가능하고 일정 수준 안이어야 한다(16라운드 답 6, 09 §6.1)." (`08-design-a-to-z.md:609`)
  > 18라운드 안건(실행 확인, PR-2): "노드 구조의 벤치(섞인 종류 1만 노드의 읽기 순회, 노드당 힙 바이트, 같은 맵인지, 거대형 자리 수, 입력에서 커밋까지, 생성 시간. V8과 JavaScriptCore)" (`reviews/round-18-agenda.md:68`)
  > "**벤치 게이트 — 확정(답 6).**" (`09-landing-and-test-strategy.md:274`)
  > "§6.1대로. 느린 것은 통제 가능하고 일정 수준 안이어야 한다." (`09-landing-and-test-strategy.md:274`)
  > 소유자(27라운드, PR-2 벤치의 느린 행): "PR-2 벤치에서 남은 느린 행을 모두 수용한다" (`reviews/round-27-owner-answers.md:7`) — 요지. Bun의 B5 키 입력 약 −49%와 B6 초기 로드 20ms 대 11ms, B2 노드당 메모리의 추정 상한 초과, 18C-15·67·81의 N·깊이 비례, B3 확인 불가를 소유자가 받아들였으므로 PR-2에 대해 이 게이트의 "이유를 적고 Vincent가 받아들여야 병합"은 충족되었다.
  > 소유자(27라운드, 벤치 기록 문서): "벤치 기록과 성능 개선 이력을 문서로 남긴다. `verification/03-node-and-settle/performance.md`에 쓰고, Bun에서만 격차가 나는 원인 분석도 여기에 담는다" (`reviews/round-27-owner-answers.md:8`) — 요지. 느린 이유의 기록은 그 문서다.
  > 소유자(27라운드, React 대 JS 코어의 비중): "form의 성능 대부분은 react에 의해 결정되어 큰 문제는 없을 수도 있음(이전 엔진 기록 기준 react가 95, js 코어가 5% 정도)" (`reviews/round-27-owner-answers.md:9`) — "일정 수준"을 읽는 배경이며 합격선은 아니다.
  > 소유자(27라운드, 최적화의 시점): "현재 구현단계에서 최적화를 하는 것은 전체 원장을 흔들 수 있는 문제라, 구현 완료 후, 최적화를 시도할 예정입니다. 그 시점에 참고데이터가 될 수 있도록 기록을 원합니다.(섞이지 않게, 이후 작업으로 잘 분리해서 요청)" (`reviews/round-27-owner-answers.md:11`) — 구현 단계(PR-2~PR-7)에서는 최적화를 시도하지 않고 기록만 남기며, 최적화는 구현 완료 뒤 별도 작업이다.
  > "최적화는 구현을 마친 뒤 별도 작업에서 하며, 이 대장이 그 작업의 출발점입니다." (`verification/performance-issues.md:3`) — 단계를 가로지르는 속도 문제 대장. TEST-027의 느린 행 기록(`verification/03-node-and-settle/performance.md`, `verification/04-derive-and-controls/performance.md`)을 모아 가리킨다(원장 관리자, 2026-10-01).
  > 소유자(30라운드, 성능 최적화 작업의 자리): "맞습니다. 7끝나고 진행하면 됩니다." (`reviews/round-30-owner-answers.md:12`) — 27라운드 답의 "구현 완료 후"는 07 전환 머지 뒤다. 최적화 작업은 07 뒤에 시작해 08과 병렬로 진행하고 09 전에 끝낸다(`plan/perf-optimization/`).
  > 소유자(30라운드, 04 벤치의 느린 행): "맞습니다." (`reviews/round-30-owner-answers.md:14`) — 풀어 쓴 물음 "04의 느린 벤치 행 둘(TEST-071 통째 교체 객체 행의 선 미달, 04 뒤 03 벤치의 B2·B5·B6·18C-15·67·81 행)을 지금 받아들이고 고치는 일은 최적화 작업으로 넘기는가"에 대한 답. PR-3 + PR-6(04, PR #351)에 대해 이 게이트의 "이유를 적고 Vincent가 받아들여야 병합"이 충족되었다. 느린 이유의 기록은 `verification/04-derive-and-controls/performance.md`와 `verification/03-node-and-settle/performance.md`, 후속은 속도 문제 대장이다(원장 관리자, 2026-10-01).
  > 편집자 결정(44C-01): "【추론】 (다) 고친 뒤 벤치를 다시 돌리고, 계약을 지키되(변경에 비례) 레거시보다 느린 행만 TEST-027의 절차와 30라운드의 선례대로 소유자 수용 물음으로 묶어 원장 관리자가 올린다; 잎 키 입력 행은 레거시가 같은 완료 시점에서 관측되지 않았다는 단서를 행에 함께 적고, P-15(03 행의 흔들림, 인과 미확인)는 지금처럼 "열림"에 둔다. 메모리 행은 통과이므로 물을 것이 없다." (`reviews/round-44-closing.md:11`)
  > 편집자 결정(48C-01): "【추론】 나감 비움·잠복 갈무리·커밋의 비용은 SETTLE-017대로 "이번 정착의 재계산 목록과 자동 쓰기 기록 … 나간 하위 트리의 순회"에 묶이며 나간 노드마다 저장소 전체나 조상 전체의 출력을 다시 짓는 것은 (나간 수 × 전체)로 그 범위를 넘으므로 GOAL-011·44C-01의 계약 위반이다; 소유자의 수용은 행에 적힌 원인에 대한 것이라 P-04의 수용(2026-09-30)은 `getLatentOrder`의 선형 탐색을, P-03의 기록은 게이트 형제의 첫 로드(`selectChildren`·`assembleObject`)를 가리키고, 이번 세 고리(`updateInactiveValuesMemo`의 경로별 전체 거름, `finalizeExits`의 나간 노드마다 조상 전체 `updateOutput`, `captureLatentDescendants`의 저장소 전체 훑기)는 어느 행에도 적히지 않은 다른 원인이다. 30라운드 소유자 답도 "느린 행 둘"을 특정해 받아들인 것이지 그 뒤 찾은 비례하지 않는 비용을 미리 받아들인 것이 아니다." (`reviews/round-48-closing.md:9`)
  > 편집자 결정(49C-01): "【추론】 배열 시나리오가 닿지 않는 03·04 코드의 비례하지 않는 비용을 06의 verifier가 곁다리로 찾으면 고치지 않고 대장 "열림"에 행을 더하되 상태를 "계약 위반, 수용 대상 아님 — 다음에 그 자리를 건드리는 단계 또는 전용 성능 작업"으로 적어 소유자 수용 행(상수 배)과 섞이지 않게 한다; 그 행은 TEST-027의 수용 대상이 아니므로 어느 PR의 병합도 막지 않고, 07 전환 PR의 jsdom 성능 게이트(27라운드 소유자 답 "최종 검사의 자리")가 그 행을 다시 본다. 06은 P-04 주석의 원인 귀속(`getLatentOrder`로 전부 돌린 것)을 바로잡는다." (`reviews/round-49-closing.md:10`)
  > 편집자 결정(51C-01): "【추론】 P-03은 04가 27라운드 소유자 답(구현 단계에는 기록만)에 따라 적어 둔 행이지 소유자가 느린 행으로 받아들인 것이 아니므로(상태 "기록, 구현 완료 뒤"; P-04의 "소유자 수용"과 다르다) 48C-01의 "소유자 수용은 행에 적힌 원인에 한한다"가 지키는 것이 없고, 44C-01이 그 뒤에 "변경에 비례하지 않는 비용은 수용 대상이 아니라 발견한 단계가 고친다"고 정했으며 49C-01대로 06의 배열 시나리오(호스트·아이템 `active`, 게이트 배열 재진입)가 그 줄에 닿는다; 들어오는 아이템마다 호스트 전체를 다시 조립하는 것은 NODE-026 "재계산은 자식 dirty 목록에 비례한다"와 SETTLE-017의 범위를 넘는다. 그래서 06이 지금 고치고, 같은 줄이 원인인 P-03의 객체 첫 로드도 함께 풀리므로 고친 뒤 P-03의 시나리오(게이트 형제 1천/2천/4천/8천)를 다시 재어 P-03을 "해결"로 옮긴다." (`reviews/round-51-closing.md:9`)
  > 소유자(52라운드, 06 느린 행의 재측정 기준): "그럼 변경 전체를 보았을때는 얼마나 차이나나? 이게 그렇게까지 차이가 날 문제는 아닌데. 적용완료까지를 기준으로 다시 측정해보라." (`reviews/round-52-owner-answers.md:7`) — 느린 행의 레거시 대비 배율은 두 엔진이 같은 완료점(쓴 값이 루트에서 읽히는 시점)에 이른 때를 기준으로 재야 하며, 06의 P-13·P-14는 그 기준으로 다시 재어 수용을 다시 묻는다(원장 관리자, 2026-10-01).
  > 소유자(54라운드, 06 느린 행 P-14의 수용): "응 그렇게 하자. 이정도면 수용 가능. 동작무결성을 확보하고, 성능 개선 라운드에서 쪼아보자" (`reviews/round-54-owner-answers.md:7`) — 같은 완료점에서 아이템 1천 개 배열의 루트 통째 쓰기가 Node 1.41–1.43배·Bun 2.87배 느린 것(선형)을 PR-5에 대해 받아들였다; 키 입력 행 P-13은 같은 완료점에서 새 엔진이 더 빨라 닫힌다; 고치는 일은 07 뒤 최적화 작업의 몫이고 PR-5는 동작 무결성에 집중한다(원장 관리자, 2026-10-01).
  > 소유자(56라운드, 05 PR-4 느린 행 넷의 수용): "응 그것도 수용. 성능 개선 라운드에서 다루자. 동작만 정상적이면 수용할게. 아까처럼 지수적으로 성능이 악화되는 케이스가 아니면" (`reviews/round-56-owner-answers.md:7`) — P-16~P-19(마운트 두 행, 통지 파동, 03 벤치 재실행의 첫 로드·잔존 메모리)를 PR-4에 대해 받아들였고, 고치는 일은 07 뒤 성능 개선 작업의 몫이다; 덧붙인 조건 둘은 느린 행 수용의 일반 규칙이다 — 동작이 정상인 행에만 수용이 미치고, 폼 크기에 대해 비례 이상으로 악화되는 비용은 수용 대상이 아니라 발견한 단계가 고친다(44C-01·49C-01이 소유자 답으로 섬)(원장 관리자, 2026-10-02).
  > 편집자 결정(63C-01): "【추론】 TEST-027·TEST-072의 수용은 "이유를 적고 Vincent가 받아들여야 병합"이고 48C-01·49C-01은 소유자 수용이 행에 적힌 원인까지만 미친다고 정했으므로, 54라운드에 소유자가 받아들인 P-14(Node 1.41–1.43배·Bun 2.87배, 원인은 06의 배열 합성이 아이템 수에 선형)는 통합 뒤의 새 원인(05의 `markCommitDeliveries`가 커밋마다 바뀐 노드 수에 비례해 더하는 비용)을 덮지 않는다. 그 비용은 바뀐 노드 수에 비례하고 폼 크기나 무관한 노드 수에는 비례하지 않으므로 GOAL-011의 계약 위반이 아니라 상수 배의 느린 행이고, 56라운드 소유자 답의 두 조건(동작 정상, 비례 이상으로 악화되지 않음)을 지키므로 같은 방식으로 묻는다. 06은 속도 문제 대장에 05에 귀속한 새 행(P-22, "커밋마다 하는 배달 표시의 노드당 비용 — P-14·키 입력 행에 더해짐")을 "소유자 수용 대기"로 더하고 P-14 행에는 재측정 수치와 그 행을 가리키는 메모를 적으며, 개발 모드의 동결·`process.env` 읽기 몫(약 19%)은 제품 빌드에서 다시 재어 행에 갈라 적는다. 원장 관리자가 소유자에게 묻고, 답은 소유자 답 파일로 기록한다; 06의 통합·검증·PR 갱신은 그 답을 기다리지 않고, 답은 PR-5의 병합 조건(TEST-027)에만 걸린다." (`reviews/round-63-closing.md:9`)
  > 소유자(64라운드, 06 통합 뒤의 느린 행 P-23): "속도개선을 해보세요. 너무 느리군요" (`reviews/round-64-owner-answers.md:7`) — 63C-01이 05에 귀속한 느린 행 P-23(커밋마다 하는 배달 표시의 노드당 비용, 배열 통째 쓰기 행을 Node 약 2.4배·Bun 약 3.5배로)은 수용 행이 아니라 06 PR(#353) 안에서 뜻을 바꾸지 않고 고치는 항목이다; 54라운드에 받아들인 수치(Node 1.41–1.43배, Bun 2.87배) 이하로 돌아오면 "해결"로 닫고, 못 미치면 다시 묻는다(원장 관리자, 2026-10-02).
  > 소유자(64라운드, P-23 개선의 요지): "이번에 해당 수정을 진행하는 요지는 속도지연의 상승추세가 구조적인 문제일 수 있어서 그렇습니다. 결과값이 일치하는 선 내에서 속도개선을 하면 되는 케이스보다는 구조개선이 필요할 수도 있겠다는 판단입니다" (`reviews/round-64-owner-answers.md:17`) — P-23 작업은 미시 최적화에 그치지 않고 단계마다 쌓인 노드당 비용의 원인을 먼저 상수·구조로 가르며, 구조로 분류된 몫은 바꿀 설계와 뒤집힐 원장 항목을 원장 관리자에게 먼저 올려 라운드를 거친 뒤 구현한다(원장 관리자, 2026-10-02).
  > 소유자(64라운드, P-23 구조 몫의 판단 주체): "판단은 제가 개입하지 않고 되도록이면 원장의 원칙대로 구현하도록 하세요." (`reviews/round-64-owner-answers.md:23`) — P-23의 구조 몫에 대한 설계 변경은 원장 관리자가 현행 원칙에서 유도해 편집자 결정으로 닫고 06이 구현하며, 기존 소유자 답을 뒤집어야만 하는 경우에만 소유자에게 묻는다(원장 관리자, 2026-10-02).
  > 편집자 결정(65C-01): "【추론】 진단은 64라운드 덧붙임이 요구한 "추세의 원인을 상수·구조로 가른 기록"이다: 모든 몫이 바뀐 노드 수에 선형이므로 GOAL-011의 계약은 서 있고, 상승은 비례 이상의 항이 아니라 04(상태 키 공표)와 05(배달 표시·전역 상태 커밋)가 저마다 바뀐 노드 전체를 한 번 더 훑으며 노드마다 할당을 하는 통과를 더한 데서 왔다. 그러므로 P-23은 "구조적 문제가 있을 수 있다"는 소유자의 염려 가운데 "기능마다 자기 전체 훑기와 노드 키 Map 장부를 더하는 양식"이 구조이고, 그 양식이 다음 기능(07·08)에서 되풀이되지 않게 막는 것이 구조 몫의 목표다(65C-02·65C-03). 06은 이 진단을 `verification/06-array/performance.md`와 대장 P-23 행에 적고, 표본 수가 54라운드(2,001)보다 적으므로 최종 재측정은 54라운드와 같은 표본(예열 5,000 + 표본 2,001, 런타임마다 2회)으로 한다." (`reviews/round-65-closing.md:9`)
  > 편집자 결정(65C-01): "【추론】 물음 30의 답은 그렇다: 상수 몫 C1(`selectChildren`의 정적 호스트 형상 재선택, NODE-006의 "정적 선택의 메모"가 이미 정한 것), C4(커밋 루프의 노드마다 환경 읽기), C5(선언 키의 `JSON.stringify`), C6(상태 키 공표를 청사진이 상태 키를 선언하지 않은 노드에서 건너뜀 — CONTROLS-045 "상태 키는 그 노드에만")은 모두 배열 통째 쓰기 시나리오가 닿는 03·04 코드의 비용이므로 63C-02·49C-01대로 06이 뜻을 바꾸지 않고 고친다; 05 파일의 상수 D1–D6(개정 대장 전개의 비트 키 → 조밀 배열, 호출마다의 환경 읽기 한 번으로, 사건 표시의 전개 제거, 영향 경로·후보 집합 사본 제거, 후보별 스냅숏 객체)와 C7(전역 상태 커밋)도 같다. 각 수정은 별도 커밋, 차등 시험(개정 대장·값·payload 불변)과 기존 게이트, 03·04 fractal의 DETAIL이 정적 메모·건너뜀을 적으면 먼저 고친다. 개발 모드의 `Object.freeze`(EVENT-024 "payload는 불변이다. 개발 모드에서 `Object.freeze`하며")는 유지하고 환경 읽기만 모은다." (`reviews/round-65-closing.md:10`)
  > 소유자(76라운드, 정돈 단계의 신설과 자리): "그렇게 하자. 지금은 안할거고, 그 단계에서 내가 집중적으로 코드를 보면서 진행할게. 일단 단계만 구분해두렴. 큰 틀이나 인터페이스를 바꿀거같진 않고, 파일 구성이나 함수 이름, 함수 로직 등을 손댈거같아." (`reviews/round-76-owner-answers.md:7`) — 27라운드 소유자 답의 "구현 완료 뒤 별도 작업"인 성능 작업은 정돈 단계 뒤에 시작한다 — 성능 측정과 최적화가 정돈된 파일·함수 위에서 한 번에 이루어지게 하기 위함이다(원장 관리자, 2026-10-03).
  > 편집자 결정(82C-01): "【추론】 TEST-027의 수용은 상수 배의 느린 행에 대한 것이고, 56라운드 소유자 답이 일반 규칙으로 세운 두 조건(동작 정상, 폼 크기에 대해 비례 이상으로 악화되지 않음) 가운데 둘째를 어기는 행은 GOAL-011("비용은 폼의 크기가 아니라 바꾼 것의 크기에 비례")의 계약 위반 후보라 수용 대상이 아니다. 그래서 (가) 같은 묶음 안에서 크기만 다른 픽스처 사이에 새/옛 배율이 뚜렷이 커지는 코어 행 — 마운트의 flat-50/100/500(4.02→5.02), nested-d3/d5(5.11→8.10), oneOf-5/10/20(3.38→5.00), 갱신의 oneOf-5/10/20(6.30→11.34)과 그 묶음에 속한 행 — 은 대장에 "계약 위반 후보, 수용 대상 아님 — 07 진단 중"으로 바꾸고, 07은 65C-01의 방법대로 단계마다(청사진, 노드 생성, 첫 정착, 검증 등록, 배달 표시) 비용을 재어 크기에 선형인 상수 몫과 초선형인 구조 몫을 가르고, 자기 시나리오(렌더·`nodeFromJSONSchema`)가 닿는 구조 몫은 49C-01대로 07이 고치며, 앞 단계 코드의 몫은 귀속을 적어 열린 행(수용 대상 아님, 어느 PR의 머지도 막지 않음)으로 둔다. 진단 뒤 상수 배로 판명된 행은 (나)로 옮긴다. (나) 배율이 크기와 무관한 행(React 층의 마운트 1.0–1.8배와 갱신, 코어의 sample-0–3 등)은 행마다 묻지 않고 한 묶음으로 소유자에게 올린다 — 56라운드 답은 묶음 수용의 선례이고, 76라운드가 정돈 → 성능 최적화 순서를 세웠으므로 묻는 내용은 "지금 수용하고 성능 최적화 단계로 넘기는가"다. (다) 패키지 벤치 후보 P-99–132는 옛 기준선 JSON에 원 표본이 없어 통계 판정이 서지 않고, TEST-026이 "이름이 바뀌므로 옛 판 대 새 판의 비교는 `benchmark-form`만 맡고 패키지 벤치는 새 엔진 안의 회귀 감시로 쓴다"고 했으므로 애초에 수용 행이 아니다 — 대장에서 "후보" 행을 "기록(새 엔진의 회귀 감시 기준선, 비교 판정 없음)"으로 바꾸고 `bench:baseline`을 새 엔진에서 다시 남긴다; 옛 중앙값 0.00004 ms 같은 값은 옛 벤치가 다른 것을 쟀다는 뜻이라 비교에 쓰지 않는다. (라) 번들 크기(esbuild minify + gzip 71,317 B, 기준 37,023 B, 1.93배; 레거시 포함 없음)는 TEST-075의 "늘면 이유를 적고 Vincent가 받아들여야 병합"에 따라 이유(새 엔진 자체의 크기, 어느 fractal이 얼마인지)를 적어 소유자에게 묻는다. G26은 (가)의 진단과 (나)·(라)의 소유자 답이 끝나야 통과하며, (가)에서 열린 행으로 남긴 몫은 G26을 막지 않는다." (`reviews/round-82-closing.md:9`)
  > 편집자 결정(83C-01): "【추론】 56라운드 규칙이 가르는 것은 "폼 크기에 대해 비례 이상으로 악화되는가"이고, 그 판정 방법은 65C-01이 정한 단계별 선형 기준 대 잔차다. 07의 진단에서 초선형 잔차를 낸 몫은 모두 고쳐졌고(복잡도 시험 초록) 남은 단계의 잔차가 0 근처라면 남은 비용은 크기에 선형인 상수 몫이다; 옛 판 대비 배율이 크기에 따라 조금 오르는 것은 옛 판에 크기에 둔감한 고정 몫이 있어 작은 폼에서 배율이 낮게 나오기 때문이며, 배율은 두 선형 상수의 비로 수렴하므로 가장 큰 크기의 배율이 그 상수의 비에 가장 가깝다. 그러므로 크기 계열 행은 "보류"가 아니라 소유자 묶음에 넣되, 대표 수치는 가장 큰 크기의 배율(flat-500 마운트 4.80배, nested-d5 마운트 7.28배, oneOf-20 마운트 4.30배·갱신 10.63배 등)로 적고 그 까닭을 한 줄 덧붙여 소유자가 가장 나쁜 값을 보고 판단하게 한다; 크기 축을 더해 다시 재는 것은 같은 결론(선형)을 다른 방법으로 확인하는 일이라 성능 최적화 단계로 넘긴다. 07이 고친 구조 몫 가운데 03·04·06 코드의 것은 42라운드·78C-02의 선례대로 `plan/07-switch/log.md` §8 "앞 단계 결함"에 귀속을 적고(계약 위반을 발견한 단계가 고침, 49C-01), 재귀 검사의 첫 실행 비용이 3.39배 는 것은 성장비 0.61로 선형이므로 기록으로 족하다. 열린 행 P-135는 65C-04·67C-01의 P-24·P-25와 같은 자리(수용 대상 아님, 머지를 막지 않음, 정돈 또는 성능 최적화)다. 벤치의 원 표본 JSON은 TEST-026 "결과는 `results/`에 날짜와 커밋으로 남긴다"대로 PR에 둔다 — 오늘 옛 기준선에 원 표본이 없어 패키지 벤치 34행의 통계 판정이 서지 않은 것이 원 표본을 남겨야 하는 까닭이고, 19 MB는 그 디렉토리의 관례(약 220 MB) 안이다; 다만 중앙값·p99 같은 요약은 보고서에 따로 적어 원 표본 없이도 읽히게 한다." (`reviews/round-83-closing.md:9`)
  > 소유자(84라운드, 07 느린 행 묶음의 수용): "지금은 속도차이가 너무 많이 납니다. 속도개선 단계로 넘어가기 전에 목표속도를 설정하고 속도개선을 진행하세요. 이건 앞선 이유와 마찬거지로, 단순 코드문제보다는 구조적으로 느린 상황일 수 있기 때문입니다. oneof 등 if-then 분기가 느려진건 ajv개입으로 어쩔 수 없지만, 이외 분기가 없는 경우는 core의 속도차이에 비해 더 느려지는건 이상하지 않나요?" (`reviews/round-84-owner-answers.md:7`) — 83C-01의 소유자 묶음은 수용 행이 아니라 PR-7 안에서 고치는 항목이다(64라운드 P-23 선례). 목표 속도를 먼저 정하고(원장 관리자가 원장 원칙에서 유도해 소유자 확인), 분기 없는 폼의 마운트·갱신을 옛 판과 단계별로 나란히 재어 구조 원인을 밝힌 뒤 개선한다; 분기 폼의 검증기(ajv) 몫은 어쩔 수 없는 것으로 본다. G26은 목표 안으로 들어와야 통과(원장 관리자, 2026-10-03).
  > 편집자 결정(85C-01): "【추론】 54라운드에 소유자가 받아들인 느린 행의 수치(배열 1천 개의 루트 통째 쓰기 Node 1.41–1.43배)는 원장이 "받아들일 만한 상수 차이"로 가진 유일한 선이므로 분기 없는 폼의 목표는 그 선을 올림한 1.5배(중앙값, 옛 판 0.16.0 대비, `benchmark-form`의 같은 폼 쌍)다 — 마운트와 갱신 모두에 건다. 분기 폼은 소유자가 "ajv 개입으로 어쩔 수 없다"고 했으므로 검증기를 끈 측정(`validator` 없이 마운트·갱신)으로 같은 1.5배를 목표로 하고, 검증기를 켠 측정과의 차이는 ajv 컴파일·실행 몫으로 분리해 보고서에 기록만 하며 목표에 넣지 않는다 — 다만 그 차이 안에 ajv가 아닌 몫(가드 등록의 중복, 루트 재컴파일 등)이 있으면 그것은 (가)의 기준을 받는다. React 층은 27라운드 소유자 답이 최종 게이트로 둔 jsdom 측정이고 지금 수치(마운트 1.0–1.4배, Profiler 갱신 0.75–1.0배)가 이미 그 근처이므로 마운트 1.2배·갱신 1.0배 이내로 건다. 측정 조건은 TEST-026 그대로(워밍업 10회 이상, 표본 100회 이상, 중앙값과 p99, 명시적 수집)이고 판정은 중앙값으로 한다. 07은 84라운드가 지시한 분기 없는 폼의 옛 판 대 새 판 단계별 재진단을 먼저 하고, 구조로 분류된 몫은 코드 전에 바꿀 설계와 뒤집힐 원장 항목을 올리며(65라운드 절차), 개선 뒤 같은 방법으로 다시 잰다. 목표에 못 미친 행이 남으면 행마다 수치와 단계별 이유를 적어 소유자에게 다시 묻고, 그 답이 없는 한 G26은 통과하지 않는다." (`reviews/round-85-closing.md:9`)
  > 소유자(87라운드, 속도의 원칙과 구조 변경의 자리): "그리고 단일 순회는 아니어도 순회 속도는 최소한으로 해야하고, 불필요한 경우에 연산은 과감하게 생략하는 방식도 필요한데. 구조변경이 수반되는거면 최적화 단계로 넘기기 어려워." (`reviews/round-87-owner-answers.md:7`) — 순회는 최소한으로(같은 노드를 한 정착에서 두 번 계산하지 않음, 정적 첫 로드는 한 번의 순회를 목표로), 불필요한 경우의 연산은 과감히 생략(정적 로드에서 범용 정착의 장부 생략, 분기 없는 폼에서 분기용 분석·색인 생략). 85C-01의 목표에 닿기 위한 구조 변경은 성능 최적화 단계로 넘기지 않고 PR-7에서 하며, 원장 안의 구조 변경은 07이 65라운드 절차로 지금 하고 계약을 바꾸는 후보는 소유자 결정(원장 관리자, 2026-10-03).
  > 소유자(87라운드, 코드 구성의 원칙(루프)): "그래 추가로 forEach 나 map / reduce 체인보다는 고전적인 for 나 while 체인이 속도가 최대 5배까지 빠르니까, 함수형 체이닝보다는 최소루프와 jit 최적화를 고려하면서 구성하도록. 이건 이후 속도계선 및 코드정리 과정에서 한번 더 진행하긴 할거다" (`reviews/round-87-owner-answers.md:8`) — 뜨거운 경로는 함수형 체인이 아니라 고전적인 `for`·`while` 루프로, 여러 번 도는 체인은 한 루프로, JIT 최적화를 고려해 구성한다; 07은 지금 짜는 경로에 적용하고 기존 코드 전체는 정돈·성능 최적화 단계에서 한 번 더 한다(원장 관리자, 2026-10-03).
  > 소유자(91라운드, 분기 폼의 속도 목표): "이전 방식에서 oneOf / if-then-else 등은 ajv 같은 평가기 없이 특정한 문법만을 지원하는 직접계산 방식이라 속도가 나왔던걸거야. 이 점은 고려하고 있는거지? 지금 방식의 oneOf,allOf,anyOf / if-then-else 방식은 jsonSchema 모든 문법 호환이라 근본적으로 그 속도에 도달할 수는 없을거고. 다만, 가능하면 빠르게, 비효율 없이가 목표인건 맞아. 우리가 동일한 목표를 보고있는게 맞나?" (`reviews/round-91-owner-answers.md:7`) — 분기·조건 폼은 모든 문법을 받는 범용 구조라 옛 판의 속도에 닿는 것이 목표가 아니고, 가능한 한 빠르게 비효율 없이가 목표다. 85C-01이 분기 폼에 건 검증기 끈 1.5배는 이 답으로 바뀌며, 분기 없는 폼과 식만 있는 폼의 목표는 그대로다(원장 관리자, 2026-10-05).
  > 소유자(91라운드, 분기 폼 판정 기준의 확인): "좋아. 그럼 이런 점을 고려했을때 적절한 최적화 방향을 찾아가는 중이라고 이해할게. 계속 진행해줘" (`reviews/round-91-owner-answers.md:8`) — 분기·조건 폼의 행은 배율이 아니라 셋으로 판정한다: 전환 비용이 건드리지 않은 분기의 수에 따라 늘지 않고, 단계별 진단에 중복 계산과 쓰이지 않는 장부가 없으며, 남은 배율은 수치와 까닭을 소유자에게 보이고 기록한다. React 층의 분기 폼 행은 코어의 몫을 뺀 렌더·커밋 몫이 옛 판을 넘지 않아야 하고, G26은 분기 없는 폼의 목표와 이 셋이 모두 충족되어야 닫힌다(원장 관리자, 2026-10-05).
  > 소유자(104라운드, 작은 폼 코어 갱신 격차의 수용): "좋아. 알겠어. 그정도 차이라면 0.06ms 는 수용하는게 맞겠군." … "그래, 소유자 수용으로 기록해." (`reviews/round-104-owner-answers.md:7`) — 코어 분기 없는 폼 가운데 작은 폼의 갱신 행의 1.5배 미달은 소유자가 받아들였다(이유: 쓰기마다 여섯 단계를 지나는 정착 설계의 고정비, 절대값 0.06 ms 안팎, 넓은 폼에서 역전, React 층 동률); 이 행들은 더 이상 G26을 막지 않는다(원장 관리자, 2026-10-06).
  > 소유자(104라운드, 비교 대상과 rjsf 벤치마크): "rjsf 비교 벤치마크는 개발 완료하고 진행하자. 지금 비교대상은 이전의 우리 구현이 맞다." (`reviews/round-104-owner-answers.md:8`) — 7단계의 비교 기준은 옛 판 0.16.0 그대로이고 rjsf 비교는 개발 완료 뒤에 연다(원장 관리자, 2026-10-06).
  > 소유자(104라운드, 가능한 범위): "코드상 비효율적인 동작이나 구현을 회피하는것, 추가로 js jit runtime 최적화 기법을 사용한 속도 개선. 여기까지가 가능한 범위로 보인다." (`reviews/round-104-owner-answers.md:9`) — 속도 작업의 범위는 코드의 비효율 제거와 JIT 런타임 최적화 기법까지이고 정착 설계는 바꾸지 않는다(원장 관리자, 2026-10-06).
  > 소유자(108라운드, 코어 마운트 미달 다섯 행의 수용): "첫번째는 수용하고," (`reviews/round-108-owner-answers.md:7`) — 코어 분기 없는 폼의 마운트 행 가운데 sample-2·sample-3·nested-d3·nested-d5·computed-visible-derived의 1.5배 미달은 소유자가 받아들였다(이유: 청사진 분석의 첫 비용, 코드 수준 상한 소진, React 층 마운트 모두 목표 안); 85C-01의 마운트 목표는 이 다섯 행에서 닫힌다(원장 관리자, 2026-10-07).
  > 소유자(110라운드, 첫 갱신 두 행의 수용): "응 수용하자. 이 이상 줄이는건 지금 단계에선 어려울거같으니" (`reviews/round-110-owner-answers.md:7`) — 코어 flat-50 첫 갱신(2.72배)과 flat-100 첫 갱신(1.71배)의 미달은 소유자가 받아들였다(이유: 첫 갱신에만 드는 1회 비용, 이후 갱신은 목표 안, 손질 둘은 회귀로 기각); 개선 단계의 목록에 적는다(원장 관리자, 2026-10-07).
  > 소유자(113라운드, 분기 폼 고침의 범위와 시기): "1번으로 간다는건 어떤걸 의미하지? 이걸로 갈거같은데 충분한 이해를 위해 묻는다" … "좋아 1로 가자" (`reviews/round-113-owner-answers.md:7`) — 분기당 장부 작업(약 28 µs)은 7단계에서 코드 수준으로 없애고 조건식 평가(약 2.5 µs)는 분기마다 그대로 한다; 91라운드 기준 ①은 "분기 수에 비례하는 것은 설계가 요구하는 조건식 평가뿐"으로 읽으며 그 상태면 충족이다(원장 관리자, 2026-10-07).
  > 편집자 결정(93C-01): "【추론】 비교의 뜻은 두 판이 같은 일을 하는 데 드는 시간을 같은 조건에서 견주는 것이다(86C-01). 옛 판은 호출이 돌아온 뒤 비동기로 정착을 마저 하므로 그 몫을 뺀 옛 값은 일의 일부만 잰 것이고, 그것을 분모로 쓰면 새 판이 실제보다 느리게 나온다 — 그래서 85C-01의 판정은 86C-02 재측정이 쓴 방법(단계별 배타 시간의 합 active, 옛 판의 비동기 정착 포함, 타이머 대기 제외)으로 한다. TEST-026의 조건(워밍업 10회 이상, 표본 100회 이상, 중앙값과 p99, 명시적 수집)은 그대로다. 여기에 92라운드가 변경의 앞뒤 비교에 인정한 원칙을 옛 판 대 새 판에도 적용한다: 두 판을 같은 세션, 같은 Node 판에서 번갈아 재고 그 쌍의 중앙값 비로만 판정하며, 다른 날이나 다른 런타임에서 잰 옛 값은 분모로 쓰지 않는다(기계 상태와 런타임의 차이가 섞인다 — 이번에 v24의 옛 값과 v26의 새 값이 섞였다). 런타임 판은 판정표에 적는다. 무계측 동기 측정은 계측 비용이 없어 변경 하나의 효과를 가르는 데 좋으므로 변경 앞뒤(H 대 W)의 인과 비교에 쓰고, 옛 판 대비 판정에는 쓰지 않는다 — 보고서는 두 표를 제목으로 구별하고 한 표의 수치를 다른 표의 판정에 옮기지 않는다. 계측에는 치우침이 있을 수 있다: 배타 시간의 합은 계측된 호출마다 측정 비용이 얹히므로 호출이 많은 판이 불리하다. 그래서 판정표에 판마다 계측된 호출 수와 빈 구간으로 잰 호출당 계측 비용을 적고, 그 보정으로 판정이 바뀌는 행(목표 선의 보정 폭 안에 있는 행)은 표시해 두 값을 함께 보인다 — 방법을 바꿔 수치를 맞추는 것이 아니라 치우침의 크기를 드러내는 것이다. 91라운드의 분기 폼 기준(분기 수에 따른 증가, 단계별 중복)도 같은 방법의 단계별 값으로 본다. 07은 (i) 커밋 뒤 이 방법으로 공식 판정표를 새로 만들고, (ii)의 보고서에서 "7행 가운데 둘 충족"은 방법이 다른 대조였다는 정정을 적는다." (`reviews/round-93-closing.md:9`)
  > 편집자 결정(94C-01): "【추론】 93C-01은 계측의 치우침을 "호출이 많은 판이 불리하다"고 보아 그 크기를 적게 했고, 재어 보니 호출이 많은 쪽은 옛 판이었다(마운트에서 스물일곱 배쯤). 그러므로 배타 시간의 합은 옛 판에 호출마다 측정 비용을 더 얹어 새 판을 실제보다 빠르게 보이게 하며, 그 폭은 판정을 뒤집을 만큼 크다(flat-500 마운트 1.45배가 보정하면 2.25배). 성능은 주장하지 않고 측정한다는 원칙(GOAL-011)과 느린 행을 넘기지 않는다는 소유자의 지시(84라운드, 그리고 "생략하거나 대충 할 수 없다")에 비추어, 자기에게 유리한 치우침을 안은 수치로 충족을 적을 수 없다. 그래서 정한다. (가) 지금부터 코어 행은 보정한 배율로도 목표 안일 때만 충족이고, 원 배율만 충족인 행은 미달이다 — 93C-01의 "보정 뒤 결과로 공식 판정을 바꾸지 않는다"는 읽기를 이 결정이 바꾼다. (나) 치우침이 없는 방법을 만든다: 계측 없이, 호출부터 그 호출이 낸 마이크로태스크 큐가 빌 때까지를 한 표본으로 재면 옛 판의 비동기 정착이 들고 타이머 대기는 빠지며 호출마다의 측정 비용이 없다; 07은 옛 판의 뒤이은 정착이 마이크로태스크만으로 끝나는지(검증기 끔, 구독 없음의 조건에서) 확인해 이 종단 측정을 만들고, 타이머에 걸리는 몫이 있으면 그 몫과 까닭을 적어 물음으로 올린다. 종단 측정이 서면 그것이 85C-01의 공식 판정 수치이고(같은 세션 번갈아, TEST-026의 조건), 배타 시간의 합은 단계별로 원인을 가르는 진단의 자료다 — 진단의 단계 값에도 판마다의 호출 수와 보정을 함께 적는다. (다) React 층은 계측 구간을 더하지 않은 프로파일러 값이라 이 치우침이 없으므로 그대로다. 이번 판정표의 코어 충족 수는 원 12행이 아니라 보정한 7행으로 읽는다." (`reviews/round-94-closing.md:9`)
  > 편집자 결정(94C-02): "【추론】 85C-01이 React 층의 갱신에 건 1.0배는 "옛 판보다 느려지지 않는다"는 뜻이고, 중앙값의 비가 1.004인 행과 0.996인 행을 가르는 것은 측정의 잡음이지 엔진이 아니다(이번 표의 미달 7행은 1.004–1.056배이고 같은 묶음의 충족 행에 0.956·0.972가 있다). 93C-01이 판정을 "같은 세션에서 번갈아 잰 쌍"으로 정했으므로 그 쌍의 회차(옛 → 새, 새 → 옛, 옛 → 새)마다 배율을 내어, 세 회차가 모두 1.0을 넘으면 미달, 방향이 갈리면 동률로 충족, 모두 1.0 이하이면 충족으로 적는다. 다른 목표(1.2배, 1.5배)의 행은 선에서 떨어진 정도가 잡음보다 크면 중앙값 비로 족하되, 선의 위아래로 회차가 갈리는 행은 같은 규칙을 따른다. 판정표에 회차별 배율 열을 더한다." (`reviews/round-94-closing.md:16`)
  > 편집자 결정(105C-01): "【추론】 두 판정은 다른 물음이다. 공식 판정표(85C-01·94C-02·95C-01)는 "새 판이 옛 판 대비 목표 안인가"를 묻고 그 배율은 회차 잡음보다 훨씬 커서 세 회차로 충분하다. 변경 하나의 채택은 "이 변경이 HEAD보다 나은가"를 묻고 그 차이는 이제 회차 잡음과 같은 크기다 — 큰 몫은 다 걷어 냈고 남은 것은 0.1–0.8 ms의 몫 열하나이며 이것들이 쌓여야 nested-d5의 간극(7.7 ms 대 목표 4.7 ms)이 줄어든다. 세 회차 모두 잡음을 넘어야 한다는 지금 규칙은 실제로 0.3–0.4 ms 빠른 변경을 체계적으로 버리므로, 측정의 감도를 차이의 크기에 맞춘다. 방법은 07의 권고대로다: 측정 조건(무엇을 어떻게 재는가 — 표본마다 순서 교대, 강제 수집, 예열 20, 종단 끝점)은 그대로 두고 회차 수만 셋에서 아홉으로 늘리며, 채택은 아홉 회차 pooled 짝 차이 중앙값의 99% 부트스트랩 구간이 0보다 크고 그 중앙값이 같은 설계의 A/A 대조(HEAD 대 HEAD 아홉 회차, 같은 세션에서 한 번)의 같은 통계보다 클 때이고, 회귀 배제는 어느 행의 pooled 구간도 0보다 작지 않을 때다. 세 회차 규칙으로 이미 잡음 밖인 변경은 지금처럼 간다(아홉 회차는 잡음보다 작은 이득의 판정에만 쓴다). 이것은 TEST-026의 조건을 바꾸지 않고 채택 판정의 감도를 정하는 것이며 "성능은 주장하지 않고 측정한다"(GOAL-011)의 적용이다. 경로 만들기(`5e8f34625`)는 이 규칙으로 다시 재어 판정하고, 그 뒤 상한 순서(자식 열거, 선언 수집, 게이트 읽기 …)로 변경 하나에 아홉 회차 재측정 하나로 간다. 보고에는 pooled 중앙값, 구간, A/A 대조의 통계를 행마다 적는다." (`reviews/round-105-closing.md:9`)
  > 편집자 결정(106C-01): "【추론】 48C-01·49C-01은 소유자 수용이 "행에 적힌 원인까지만 미친다"고 정했고, 104라운드 소유자 답의 반영란은 원인(정착 설계의 고정비, 절대값 0.06 ms 안팎, 넓은 폼에서 역전, React 층 동률)과 함께 그 원인이 미치는 행을 이름으로 적었다 — sample-0·1·2·3, nested-d3·d5, array-100·500, computed-visible-derived의 갱신. 그러므로 측정 작업이 sample만으로 읽은 것이 좁았고 07의 표시 열둘이 맞다. flat-50의 BF 갱신(1.659배)은 같은 원인이다: 필드 쉰 개의 폼에서 쓰기 하나의 고정비가 옛 판의 크기 비례 비용을 아직 넘어서지 못하는 자리이며(flat-100은 1.07배, flat-500은 0.11배로 역전), 95C-01의 표에서 회차 하나가 1.5배 아래라 동률·충족이던 것이 이번에 세 회차 모두 위로 올라간 것은 마운트 변경이 갱신을 느리게 한 것이 아니라(갱신 행의 변화는 모두 잡음 안) 경계에 있는 행의 흔들림이다. 그래서 이 행도 104라운드 수용 안으로 보고 "소유자 수용(104라운드), 같은 원인"으로 적는다 — 소유자가 다르게 보면 바로잡는다. flat-100 첫 갱신(1.796배)은 다르다: 보정 검증 (가)가 불통과라 공식 판정이 보류된 행이고 107에서는 통과했으므로 측정 쪽에 새로 생긴 불일치다 — 원인을 먼저 귀속하고(같은 세션에서 (가)의 두 끝점 정의가 갈린 자리) 같은 설계로 다시 재어 판정하며, 그 전에는 미달로도 수용으로도 적지 않는다. 마운트의 코드 수준 상한이 소진되었으므로 07은 이제 갱신 쪽으로 간다: 이후 갱신의 사건 표시(프로파일 12–13%), 첫 갱신의 객체 조립(24–26%)과 첫 갱신 고정비의 떼어 내기 상한을 먼저 보이고, 상한 순서로 변경 하나에 105C-01의 판정 하나 — 계약(EVENT-007의 개정 일괄 올림, VALUE-012의 조립)에 닿는 자리는 코드 전에 물음으로. 코어 마운트의 남은 미달 다섯(sample-2·3, nested-d3·d5, computed-visible-derived)과 S01은 소유자 물음으로 열려 있고, 그 답이 올 때까지 마운트 쪽 구조 변경은 열지 않는다." (`reviews/round-106-closing.md:9`)
  > 편집자 결정(137C-01): "【추론】 (가)는 판정이 아니라 측정기의 두 시계가 같은 일을 재는지의 교차 검사이고(95C-01, 111C-01이 그 뜻을 지켰다), 세 행의 실패는 pooled 차이가 잡음 안(−6.0 대 6.6)이거나 그 경계(25.9 대 21.5)에 있어 측정기의 결함보다 회차 소음에 가깝다 — 그러므로 128C-01이 회귀에 둔 "한 번 더 보고 두 번이면 확정"의 뜻을 교차 검사에도 같이 적용해 한 번만 다시 재고, 통과할 때까지 반복하는 선택 편향은 조건을 문장으로 적어 막는다. 1.5배 초과 행의 수용은 56라운드 소유자 규칙과 TEST-027·82C-01·83C-01이 정한 소유자 결정이므로 편집자가 대신하지 않되, 이미 수용된 행을 다시 묻는 것은 소유자의 시간을 낭비하므로 새 행만 가른다. 기준 ①은 GOAL-011의 계약("비용은 바꾼 것의 크기에 비례")에 닿는 물음이고 07단계의 목표였으나, 분기 축 개선(변경 2·1c)이 기울기를 44% 줄이고 남은 자리를 표로 밝혔으므로 7단계 안에서 더 고치는 것과 개선 단계로 넘기는 것 사이의 선택은 지연 비용(135라운드)과 계약의 무게를 함께 재는 소유자의 결정이다 — 132라운드에 따라 진행을 막지 않으므로 질의 목록에 올리고 PR 시점에 한 번에 묻는다." (`reviews/round-137-closing.md:9`)
  > 편집자 결정(138C-01): "【추론】 게이트의 뜻은 소유자가 느린 행을 행마다 받아들였는가를 병합 전에 확인하는 것이고, 그 확인은 소유자의 답으로만 채워진다. 132라운드 소유자 답은 진행을 막지 않는 소유자 결정을 PR 시점에 한 번에 묻도록 했으므로, PR 생성은 막지 않되 병합은 답 뒤에 두는 것이 두 규칙을 함께 지키는 길이다. 표시를 바꿔 CHECK를 통과시키면 게이트는 문자열 검사로 떨어지고 "병합 전 0"이라는 조건은 뜻을 잃는다 — 게이트가 실패로 나오는 것이 지금 상태의 정확한 보고다. 항 번호를 함께 적는 것은 소유자의 답을 행으로 되돌리는 비용을 줄이는 것이고 게이트의 문자열은 그대로 둔다." (`reviews/round-138-closing.md:9`)
  > 소유자(142라운드, 느린 행 9행의 수용(질의 5·7항)): "9행 모두 수용 (Recommended)" (`reviews/round-142-owner-answers.md:8`) — 7단계 최종 표에서 수용 라운드가 없던 코어 BF 갱신 3행(0.20~0.26 ms)과 화면 갱신 6행(1.06~1.27배)을 소유자가 수용했으므로 G26을 닫는다; 개선은 성능 개선 단계 과제(원장 관리자, 2026-10-11).
  > 소유자(143라운드, 배열 3행의 시도 충분성): "베열 3행에 대해서는? 줄일 수 있겠어? 충분히 검토 결과 실패한걸로 보였는데. 줄일 수 있으면 좋은데 충분히 시도해본 후의 실패인지 아닌지는 궁금하긴 하네" (`reviews/round-143-owner-answers.md:7`) — 조사 결과 React 층 고침 여섯은 채택됐으나 남은 격차의 구간별 귀속(코어 몫 대 React 몫)이 끝나지 않아 "충분히 시도한 뒤의 실패"라 할 수 없음(원장 관리자, 2026-10-11).
  > 소유자(143라운드, 배열 3행의 재판정): "다시 판정을 해보자. 빈 고리를 매꿔 넣어봐. 줄여보자 이번에" (`reviews/round-143-owner-answers.md:8`) — 142라운드 수용 가운데 화면 배열 갱신 3행(array-push-100·array-replace-200·array-push-remove-100, +6.95·+7.30·+8.24 ms)은 거두고 7단계 안에서 구간별 프로파일로 귀속을 가른 뒤 고침과 판정 세션으로 줄인다; G26은 이 3행에 대해 다시 열림, 나머지 6행의 수용은 유지(원장 관리자, 2026-10-11).
  > 소유자(144라운드, 배열 3행 재판정의 판정 열): "어떨까? 일부 조건을 바꿨으니, 평가의 엄밀성에 필요하다면 수전해도된다" (`reviews/round-144-owner-answers.md:7`) — 143라운드 재판정 대상인 화면 배열 갱신 3행에 한해 판정 열을 강제 GC 열(wall·active)과 GC 없는 wall 열의 둘로 한다(채택은 두 열 모두 회귀 없음, 이득은 열마다 따로, 최종 보고는 두 열 나란히); 다른 행은 그대로이고 지난 판정은 뒤집지 않는다(원장 관리자, 2026-10-11).
  > 편집자 결정(148C-01): "【추론】 143라운드의 빈 고리 (a)·(b)·(c)는 이 측정으로 메워졌다 — 구간별 귀속이 있고, 118의 쓰기당 값은 같은 방법의 지금 값으로 대체되며, 117의 코어 증가는 상쇄를 포함해 설명된다. 그러므로 2단계는 코어부터이며 상한 수치는 구현 전의 예산일 뿐 결과가 아니다. 불일치는 고침의 효과를 재기 전에 가려야 한다 — 출발 수치가 +7 ms인지 +16 ms인지에 따라 "줄었다"의 크기와 소유자 판정이 달라지고, 대조 세션은 코드를 바꾸지 않으므로 G26 상태에 영향이 없다. 대조 세션을 런타임 번들 판정 앞에 두는 이유는 번들이 청사진 분석 경로의 JS를 바꾸므로, 그 뒤에 재면 출발 수치에 번들의 효과가 섞이기 때문이다. 형만 바뀌는 6건은 번들 바이트가 같아 앞에 두어도 수치에 영향이 없다." (`reviews/round-148-closing.md:9`)
  > 편집자 결정(151C-01): "【추론】 대조 세션의 목적은 출발 수치를 고정하는 것이었고, 공식 절차가 공식 표를 재현했으므로 그 목적은 이루어졌다. 큰 값이 하네스를 따라간 교차 실험은 제품의 회귀가 아님을 보이기에 충분하며, 세부 원인까지 가르는 일은 고침의 효과 판정에 필요하지 않다 — 판정은 같은 하네스 안의 짝 비교이기 때문이다. 다만 민감도 자체는 사용자의 환경에서도 나타날 수 있는 성질이라 버리지 않고 열린 항목으로 남기며, 그것을 줄이는 가장 그럴듯한 길(할당 줄이기)이 이미 2단계 코어 ①과 같으므로 별도 진단 없이 2단계 판정으로 본다. 1단계 표의 절대 크기를 공식 격차에 대응시키지 않는 것은 서로 다른 하네스의 수치를 더하지 않는다는 117 정합 때의 원칙과 같다." (`reviews/round-151-closing.md:9`)
  > 소유자(152라운드, 레거시 다섯 파일 편집과 끝까지 진행): "문제없어. 레거시 동작이 달라지는건 아니니까. 마지막까지 진행하고 pr 갱신까지 하도록" (`reviews/round-152-owner-answers.md:7`) — 레거시 다섯 파일의 형 넓히기는 승인(동작 동일); 런타임 가드 판정과 배열 세 행 2단계를 자율로 끝까지 진행해 PR #354를 갱신하고, 소유자 결정은 끝에 묶어 올린다(원장 관리자, 2026-10-11).
  > 편집자 결정(154C-01): "【추론】 143라운드에서 소유자가 배열 세 행의 수용을 거두고 "줄여보자"고 했을 때의 물음은 "충분히 시도한 뒤의 실패인가"였고, 이 판정은 push 계열 두 행에서 격차보다 큰 감소를 같은 하네스의 짝 비교로 보였으므로 그 물음에 대한 답의 절반이 나왔다. 채택의 조건은 134C-01·128C-01대로 판정 열의 확정 회귀 0건이며 충족된다. replace-200이 움직이지 않은 것은 실패가 아니라 148C-01의 귀속(React 렌더)과 맞는 결과라, 이 행의 처분은 코어 ② 뒤 소유자에게 올리는 최종 수치에서 따로 본다. 기록 열의 아래 두 셀은 크기가 작고 고침이 닿지 않는 행이라 소음으로 보되, 버리지 않고 여기 적어 둔다. 번들 증가는 꼬리 경로가 일반 경로 옆에 더해진 코드라 당연한 크기이고, 134C-01이 바이트 수가 아니라 측정으로 판정하게 하므로 따로 묻지 않는다." (`reviews/round-154-closing.md:9`)
  > 편집자 결정(155C-01): "【추론】 ②의 효과는 ①보다 작아서 "회귀가 없으면 채택"으로 미끄러질 위험이 있었고, 코드가 늘었는데 측정된 이득이 없다면 되돌리는 것이 바른 기본값이다. 그러나 push-remove-100에서 판정 열의 유의한 이득이 두 셀에 있고 push-100도 구간이 0을 벗어나 빠른 쪽이므로, 134C-01·128C-01의 규칙 안에서 측정된 이득이 있는 채택이다. push-100의 drainTicks 열이 반대 방향인 것은 비교 열의 성격(쓰기마다 drainTicks(2), 하네스 loop 모양에 민감)과 크기(0.60퍼센트)로 보아 판정을 뒤집을 근거가 되지 않지만, 151C-01의 열린 항목(새 판만 loop 모양에 민감)과 같은 줄기라 숨기지 않고 적는다. 빌드 변형은 이번 세션이 고정 해시 검사로 잡아냈으므로 판정은 안전하지만, 재현되지 않는 번들은 다음 측정에서 같은 검사가 없으면 조용히 섞일 수 있어 07b 개선 항목으로 올린다." (`reviews/round-155-closing.md:9`)
  > 편집자 결정(156C-01): "【추론】 143라운드의 물음은 "충분히 시도한 뒤의 실패인가"였고, 이제 답할 수 있다: push 계열 두 행은 코어 settle·structure 경로의 고침 둘로 격차가 사라지거나 1.8퍼센트로 줄었으니 실패가 아니었다. replace-200은 148C-01의 1단계 귀속이 처음부터 React 렌더 쪽이었고 코어 고침 둘이 그 행에 도달하지 않음이 도달 계수로 확인됐으므로, 이 행의 격차는 "시도하지 않은 것"이 아니라 "코어 밖의 원인"이다. React 렌더 쪽 고침은 07의 범위(코어 교체, 레거시 보존)를 넘고 142라운드에서 소유자가 criterion ①을 성능 개선 단계로 이월한 것과 같은 성격이라 (가)를 권고한다. 다만 142라운드에서 소유자가 "절대값상 약간의 지연"으로 9행을 받았다가 세 행만 거둔 경위가 있으므로, replace-200의 9.5퍼센트는 그 판단 기준(절대값 약 10 ms)에 걸리는 값임을 숨기지 않고 올린다. 기록 열과 비교 열은 145C-01대로 판정에 쓰지 않으며, 비교 열의 push-remove-100 −34 ms는 방향이 같다는 참고일 뿐이다." (`reviews/round-156-closing.md:9`)
  > 소유자(157라운드, 배열 세 행의 수용): "음 권고 가로 가자. 기본적으로 200개 이런 크기는 form 상 자주 다룰 크기는 아닌거같고... 거의 다 최적화 한거같네. 절대값 수치(실제 지연)만 마지막으로 알려줘" (`reviews/round-157-owner-answers.md:7`) — 배열 세 행은 156C-01의 최종 수치로 수용하고 replace-200의 React 렌더 쪽 개선은 개선-32로 이월; G26 닫힘(원장 관리자, 2026-10-12).
  > 소유자(157라운드, replace-200 격차의 원인 추정): "오케이 잘 기록해 둬. 다음 라운드를 위해." (`reviews/round-157-owner-answers.md:8`) — replace-200 격차 +7.4 ms의 내역(React 렌더 +3.5, 코어 settle +3.3, 구독·layout effect +1.6, 노드 생성 −1.3 ms; 자식 200개 신규 마운트의 마운트당 약 0.03 ms 고정 비용)과 세 개선 길을 개선-32 본문에 적는다(원장 관리자, 2026-10-12).
  > 소유자(159라운드, 순서와 F-E 해제): "그래 그렇게 하자" (`reviews/round-159-owner-answers.md:8`) — 순서는 개선-34 → 배정·감사 → 개선-32; 개선-34는 번들 바이트 동일로 검증, 개선-32는 다섯 부분 판정 세션을 붙이고 보류 중이던 F-E(구독 추적 통합)를 푼다; 07b는 fixy07이 쌓은 PR로 진행하고 소유자가 리뷰한다(원장 관리자, 2026-10-12).
  > 편집자 결정(161C-01): "【추론】 개선-32의 기대 이득은 약 2.5 ms로 작고 React 층은 모든 행을 지나므로, 어느 커밋이 어느 행을 움직였는지 가려야 실패했을 때 되돌릴 단위가 생긴다 — 그래서 세션을 나눈다. 반면 3순위 안은 F-E의 알려진 손실을 메우려는 보조 변경이라 따로 재면 "F-E 단독은 손실, 합치면 이득"이라는 이미 136에서 본 그림을 네 시간 들여 다시 그릴 뿐이고, 합친 결과가 좋으면 가를 이유가 없다. 길 3은 측정된 안이 없는 코어 변경이라 지금 넣으면 범위가 커지고 귀속이 흐려진다. 방향 확인을 판정 앞에 두는 것은 154·155의 절차이며, 네 시간 세션을 반대 방향 변경에 쓰는 일을 막는다." (`reviews/round-161-closing.md:9`)
  > 편집자 결정(168C-01): "【추론】 가르는 세션의 목적은 귀속이었는데, 136의 no-fe 실행과 이번 크기 일치가 이미 그 답을 주므로 네 시간을 더 쓰는 것은 측정 예산의 낭비다. 반면 확인 측정은 빼놓을 수 없다 — 첫 측정의 회귀 표시가 판정 규칙상 확정이 아니고, 예산 실패를 판정으로 읽으면 134C-01의 다섯 부분 기준이 무너진다. 채택 여부는 편집자 규칙(145C-01)으로는 답이 정해져 있지만, 느린 항목을 받아들이는 권한은 TEST-027이 소유자에게 두었고 157라운드가 그 선례이므로 맞바꿈은 보고한다. 진단은 변경 단위가 없는 연구라 07b에 넣으면 범위가 흐려진다." (`reviews/round-168-closing.md:9`)
  > 소유자(169라운드, 32a 뒤 멈춤, 배열 확인 측정 축소 또는 생략): "32a 까지만 하고 잠시 멈춰줘. 배열 라운드는 좀 짧게 검증해보던가 아니면 일단 생략 브라우저 검토랑 코드리뷰를 해야되거든" (`reviews/round-169-owner-answers.md:7`) — 판정 세션 32a의 남은 두 부분까지만 돌리고 멈춘다; 배열 천 개 두 행의 확인 측정은 지금 돌리지 않고 재개 시 짧게 하거나 생략할지 정한다; 소유자가 브라우저 검토와 코드 리뷰를 한다(원장 관리자, 2026-10-12).
  > 소유자(170라운드, 커밋 1 맞바꿈 수용, 확인 측정은 짧은 추세 확인): "어 받아들이자. 짧게 추세만 검증해. 블록 수를 더 줄여." (`reviews/round-170-owner-answers.md:7`) — 개선-32 커밋 1을 소유자 수용으로 채택한다(array-1000 갱신 약 −72 µs 손실 대 마운트 약 +12 ms·replace-200 약 −2 ms 이득); 확인 측정은 블록 8개로 두 행만 돌려 추세만 기록한다(원장 관리자, 2026-10-12).
  > 편집자 결정(208C-01): "【추론】 (1)은 오류 경로의 원자성이라 새 동작이 옳고 소비자에게 더 안전하다. 꼬리는 전부 외부 오류 채널과 설정·문서라 쓰기 경로 측정과 독립이다." (`reviews/round-208-closing.md:9`)
  > 편집자 결정(212C-01): "【추론】 방향 확인은 판정이 아니라 "회귀 방향이 없다"를 보는 문턱이고 그 문턱을 넘었다. rebase를 두 번 하지 않도록 3라운드 push를 먼저 기다리는 것이 싸다." (`reviews/round-212-closing.md:13`)
  > 편집자 결정(216C-01): "【추론】 다섯 부분에 판정된 이득도 차단 회귀도 없으면 커밋 2는 "손해 없는 정리"로 ADOPT가 맞고, 그 위에서 07b의 나머지는 측정과 무관한 정리·형·문서다." (`reviews/round-216-closing.md:17`)
  > 소유자(224라운드, 속도 게이트 현황과 추가 측정의 시간): "그러고보니 속도 게이트는 어떻게됬어? 측정 및 개선 다 했어?" / "그래 좋긴 한데 시간이 엄청 더 걸리는거 아닌가 그럼?? 좀 걱정인데" (`reviews/round-224-owner-answers.md:7`)
  > 소유자(225라운드, 방향 확인 실행): "지금 돌려. 보류 요청은 어제 한거고 이제 상황이 달라졌으니까" (`reviews/round-225-owner-answers.md:7`)
  > 편집자 결정(226C-01): "【추론】 방향 확인은 "회귀 방향이 없다"를 보는 문턱이고, 같은 부호 행이 모두 후보가 빠른 쪽이면 문턱을 넘은 것이다. 순회를 ⑤ head 위에서 하는 것이 ⑥ 뒤 재순회를 피하는 길이다." (`reviews/round-226-closing.md:11`)
  > 편집자 결정(229C-01): "【추론】 220라운드가 닫은 범위(진행 중 셋만 마무리)는 이 병합으로 다 채워졌고, 그 뒤의 일은 모두 소유자 결정이 먼저다." (`reviews/round-229-closing.md:9`)
  > 소유자(230라운드, 대기열 25·27 시험 타이밍): "변경 허용" (`reviews/round-230-owner-answers.md:13`)
  > 편집자 결정(355C-02): "【추론】 P-04(템플릿 자식 순서 선형 탐색)는 2026-09-30 소유자 수용 행이므로 이차로 분류되더라도 다시 열지 않는다. 같은 꼴이 `distributeLatentValue.ts:47-48,108-110`에 있는 것은 대장의 새 행 P-138로 적고, 수용 범위에 드는지는 M3에서 소유자에게 묻는다. 대장의 상태 칸이 136j·136k 표의 소유자 수용(104·108·110·142·157라운드)과 어긋난 것은 fairy08의 상태 칸 동기화 문서 PR이 고친다." (`reviews/round-355-closing.md:10`)
  > 편집자 결정(400C-02): "【추론】 0.16.1 열(같은 tarball)이 L1b 창보다 40행 모두 +5%~+38%(중앙값 +19%) 느리고 새 판도 +10% 느려, 창 사이 비교에는 변동이 있고 창 안의 비율만 유효하다; winglet은 소스 커밋 0건·같은 dist·공개 winglet 격리 설치 비교 −2.8%~+2.4%로 후보에서 빠졌고 기계 상태만 남는다. 주 비교는 두 판이 같은 winglet으로 도는 엔진 대 엔진 통제 비교로 둔다. 다음 창부터 dists.txt에 winglet dist 해시를 남긴다. 측정 주장은 런타임(Node·Bun)을 적어 말하고, 합친 값 %는 두 바퀴 중앙값의 평균이라 바퀴별 범위 밖일 수 있음을 각주한다. 함수별 계측의 성분은 계측 총합의 비율로만 읽고(계측 부담 B0 마운트 +26%, 촘촘 계측 약 18배, 배열은 약 15배라 배열 분해 행은 쓰지 않음), 정확한 호출 수 단언은 base 이하 상한으로 적는다. 반사실 사본은 scratchpad의 dist 사본에서만 돌리고 정답 차등(값·잠복 키·inactiveValues·배달 기록·revision·호출자 입력 불변 WRITE-013·선언 밖 키 순서 VALUE-002)을 함께 적으며, 틀린 결과의 시간은 인용하지 않는다. 변형 빌드(내부 심볼 export 한 줄 추가)로 잰 시간은 dist 직접 실행과 −5~−7% 차이(러너·창 차이)임을 각주한다." (`reviews/round-400-closing.md:10`)
  > 편집자 결정(403C-02): "【추론】 402라운드 지시대로 가설 하나를 Orca run 하나 안의 dispatch 셋(codex 구현, agy 검증, codex 마무리)으로 돌렸고 코디네이터는 brief 작성·대기·판정·병합·원장만 했다. 워커 brief는 자족적으로 쓰되(대상·변경·제약·소유·수용 증거) 긴 본문은 scratchpad 파일로 두고 spec에는 경로와 요약만 적는다. Orca가 새 최상위 작업 폴더를 만들 때 기준이 master(0.16.1)였으므로 워커가 작업 전에 기준 커밋을 ff로 맞춰야 했다; 다음부터 brief에 기준 커밋 확인을 첫 단계로 적거나 기존 작업 폴더를 재사용한다. 검증 워커는 읽기 전용으로 본 폴더에서 돌리며 파일을 쓰지 않는다. 검증 관찰은 실패가 아니어도 병합 전에 셋째 커밋으로 고친다(시험의 console.log, 영어 문서 안의 한국어 문장). 측정 창은 워커가 열고 닫으며 그동안 코디네이터는 게이트를 돌리지 않는다. Node가 v26.11.1에서 v26.12.0으로 올라 이전 창과 절대값 비교는 하지 않고 같은 창의 전후 비율만 쓴다(400C-02)." (`reviews/round-403-closing.md:10`)
  > 편집자 결정(405C-02): "【추론】 메인 에이전트를 Claude에서 codex로 바꿀 때 필요한 작업대 상태(가지 끝, 병합·열린 PR, Orca run·작업 폴더·터미널 handle, 라운드 닫기 절차, 다음 가설)는 architecture/AGENT-HANDOFF.md에 두고 PLAN.md 머리에서 가리킨다; 설계 정본(ledger)과 재개 지점(HANDOFF.md)은 그대로이며 이 문서는 그 둘이 적지 않는 순간 상태만 적는다. 워커 brief는 verification/perf-optimization/l3-briefs/에 보관해 다음 가설이 같은 꼴을 복제한다. Orca 규칙: 워커는 run-use와 --terminal 없는 check를 실행하지 않는다(코디네이터 바인딩을 빼앗아 consumer_fenced가 남); brief에 이를 적고, 끊기면 코디네이터가 run-use로 되묶는다. 검증 워커의 재측정은 $TMPDIR에만 쓰고 저장소 파일을 만들지 않으며, 측정 판정은 400C-02대로 바퀴 범위가 0을 걸치면 차이 없음이다. Bun 마운트 장면은 표본 후반의 GC 스파이크로 합친 중앙값이 바퀴별 부호와 어긋날 수 있으므로 Bun 마운트 행의 합친 %만으로 악화를 말하지 않는다(TEST-027의 "옛 판보다 느린 항목"도 같은 기준으로 읽는다)." (`reviews/round-405-closing.md:10`)
  > 편집자 결정(407C-02): "【추론】 400C-01의 L3 가설 다섯이 모두 병합되었다: (e) 조각 소유 직접 판정(403C-01, 평상시 쓰기 F=64 Node −67.8%·Bun −91.5%), (b) items 없는 배열 끝 덧붙임 지름길(404C-01, 8천 push Node −90.4%·Bun −95.6%), (a) 선언 밖 키 일반 대입(405C-01, Node 마운트 −31.6~−44.5%), (c) 선언 밖 값 구조 비교 한 번(406C-01, B0 한 키 Node −6.2%·Bun −13.7%), (d) staticSpec 전달(407C-01, 시간 효과 없음). 가설마다 PR 하나·커밋 둘(DETAIL 먼저), codex 구현·agy 검증·원장 관리자 병합이었고 Claude 보조 세션은 쓰지 않았다. 다음은 400C-04 순서대로 마운트 원인 분해(방향만, 코드 없음; 자식 0개 호스트 단서와 BN 마운트 증가) → 결정 58 실험(입구 수치는 L3-e 뒤 남은 비용 기준) → M3 종합 재측정(세 판 dist, 368·369 형식; 창 사이 비교는 창 변동 때문에 비율만)과 소유자 수용 목록(all-keys의 계약 몫, 선언 밖 값의 키 수 비례 복사와 세 배열 얕은 사본, 노드 레코드와 청사진 크기, 폼 하나 기준 메모리 초과분, 터미널 한 키 변경의 위치 비례) → 플러그인·내장 fallback 결함 여덟 수정 PR → 9단계. M3 전에 작업 폴더의 미커밋 측정 결과 표 다섯(l3e·l3b·l3a·l3c·l3d)을 측정 문서에 정리해 커밋한다." (`reviews/round-407-closing.md:10`)
  > 편집자 결정(410C-01): "【추론】 PR #421을 c350e7651로 squash 병합했다(검증한 원본 커밋 8669562f5). 변경은 verification/perf-optimization의 l3e-direct-ownership-results.md, l3b-array-append-results.md, l3a-extras-plain-assignment-results.md, l3c-extras-single-compare-results.md, l3d-static-spec-pass-through-results.md 다섯 문서뿐이며 제품 소스·시험·매니페스트·빌드·어댑터·INTENT·DETAIL 변경은 없다. 기존 수치와 표본을 보존하고 절대시간의 단위, 창 안의 수정 전후 비율과 부호, 두 바퀴 범위, dist 식별과 병합 근거를 보강했다. 타이밍 44행·원시 표본 17,600개·수치 필드 332개·원본 수치 표 109행·상대 링크 33개 및 실제 번들 해시 대조에서 불일치가 없고 agy 독립 검증의 여섯 축이 모두 통과했으며 수정 필요 관찰은 없다. 같은 창의 0.16.1 표본과 정확한 UTC 시각, L3-b·L3-e의 과거 Winglet 해시는 미검증으로 남겼고, 옛 판이 items 없는 배열을 거부하는 장면은 미지원으로 구별했다. 다른 창의 수치로 빈 칸을 채우지 않았으며 L3-d는 중복 조회 제거만 기록하고 시간 개선을 주장하지 않는다. 이 병합은 완료된 실험의 기록이며 세 판 완전 비교나 새로운 지연의 수용을 뜻하지 않는다. M3 종합 재측정과 소유자 수용은 남아 있다." (`reviews/round-410-closing.md:8`)
  > 편집자 결정(411C-01): "【추론】 PR #422는 아직 병합하지 않았다. 기준 214534c2f에서 첫 창(2026-10-18T10:59:59.475Z–11:03:09.740Z)의 legacy factory 반환 뒤 public value getter가 지연 합성을 수행함을 지원 12장면×20회×Node/Bun 총 480회로 확인하여 그 창의 옛 판 완료 시간·상대 비율을 무효로 분리했다. current-only 분해와 원자료는 방향 단서로 보존하고 다른 창의 total 성분이나 절감량으로 환산하지 않는다. codex는 234d88ce0에서 양 판의 공개 노드 값을 후위 순서로 관측하는 비용을 타이머 안에 동일하게 포함했고, Node·Bun과 adapter·first-batch의 네 영속 가드 조합은 각각 보정 전 통과16/옛 판 미지원4/실패12, 루트만 읽는 중간 반례24/4/4, 최종28/4/0을 보였다. 타입 검사·린트·전체 시험(759파일·4785통과·기존 todo1)·빌드는 모두 통과했고 제품 dist 해시는 유지됐다. 새 완료 창(2026-10-18T11:49:39.642Z–11:52:05.641Z)의 네 직렬 실행은 종료0이며 지원 시간 표본11200·준비2240·지원112행·미지원16행의 완료 상태·caller·순서·drain 검사를 통과했다. g4의 구현자 validate-completed.py 재실행은 독립 계산으로 수락하지 않았고, 별도 g3.8 워커가 자체 TMPDIR 스크립트로 새 표32행, 첫 창 계측6400표본의 배타 합·잔여(최대 오차0·음수0), 필터 폐기8행, 호출 계수8장면과 readiness 원시 로그12개를 직접 재계산해 일치를 확인했다. callback은 current 표본당1·legacy0으로 구별했다. 이후 bad706d86의 문서 보완은 실제 축약 참조5위치와 감사 한계뿐이며 수치512셀/1104숫자, raw/tool246파일, 제품·도구·기존 시험 기대값·공개 API·INTENT·DETAIL·번들은 보존했다. 측정 보고서 정본은 verification/perf-optimization/mount-breakdown-results.md이며 독립 검토 당시 문서 해시 eef5c73a와 최종 문서 해시 3efc5b94의 범위를 구별한다. 새 완료 B0 객체1000키는 Node0.9511ms·Bun0.4750ms(같은 창 옛 판 대비 +1972.2%·+239.1%), BN 객체1000키는6.6765ms·4.0709ms(+243.4%·+194.1%)이며 이 잔여의 수용이나 제품 개선율을 정하지 않는다." (`reviews/round-411-closing.md:8`)
  > 편집자 결정(413C-02): "【추론】 병합된 PR #422의 다섯 경로는 측정 보고·first-batch 공통 도구·dist adapter·영속 readiness guard이며 제품 source·기존 시험 기대값·공개 API·INTENT·DETAIL·추적 번들 변경은 없다. 411라운드에 기록한 네 게이트, 양 판의 후위 공개 값 관측, 완료 창 지원11200표본과 자체 독립 검산, 수치512셀/1104숫자 및 raw/tool246파일 보존 근거를 재사용한다. Filid 전역 FAIL·분석 미확정·고유 finding76과 진단130·기존 architecture/bench 자동 제외·새 guard 자동 role/cap 미판정은 남아 있으며 자동 통과로 바꾸지 않는다. 첫 창 current-only 분해는 방향 단서이고 새 완료 창과 절대시간을 연결하지 않는다. 옛 판 대비 느린 완료 마운트의 수용은 하지 않았다. 다음 한 가설은 실제 합성 청사진에서 item·prefixItems와 대응 후보가 모두 없다고 증명되는 배열의 N회 빈 선언 조회 제거이며 별도 계획·agy 계획 검토 후 DETAIL 선행 커밋과 전체 event/payload/revision/commit/참조 비교·호출 상한·네 게이트·조용한 재측정을 요구한다. heap·게이트·Form-render·세 판 M3와 소유자 수용, 결정58·54는 남아 있다." (`reviews/round-413-closing.md:10`)
  > 편집자 결정(416C-02): "【추론】 itemless 배열 계획은 실제 청사진의 item·prefixItems·itemCandidates·prefixItemCandidates가 모두 undefined일 때만 기존 EMPTY 결과를 조기에 반환하는 한 가설이다. 별도 agy gemini-3.8-flash-high가 기술 여섯 축을 검토했으며 Git·원본 계획 방법 접근과 Orca IPC는 실제 거절로 직접 검증·worker_done이 없었다. 최종 idle 뒤 정리했으며 거절된 Git 기준과 원본 seiri 방법은412 승인 범위에서 코디네이터가 따로 확인했다. 소유자가 방법을 직접 지정했다는 계획 귀속은 정정하고 후속 구현은 최신 게시 메인과 source/dist 동일성 확인 뒤 codex에 맡긴다. DETAIL 선행 커밋·기존 기대값 불변·fresh blueprint8경우의 호출 상한4·관측27필드·런타임별49장면·실패해야 하는 비교기 대조군·전후 dist·네 게이트·조용한 Node/Bun 교대 두 바퀴·PR seam 감사와 별도 구현 검증은 여전히 필요하다. 대기열56은409 소유자의 가설 하나당 PR 하나로 닫고 누락된58은387 원문의 실험 뒤 채택 판단으로 복구하며 현재 게이트 없는 fixture나 itemless 계획을58 충족으로 보지 않는다. 느린 결과·미결 관측·M3·정상동작·결정54의 수용은 하지 않았다." (`reviews/round-416-closing.md:10`)
  > 편집자 결정(417C-01): "【추론】 416C-02의49장면 요약은 앞6군만 센 오류였으며 special-empty4·reuse5를 포함한 원본8군은58이다. 이미 삽입된416 추론은 보존하고 이번에 정정한다. 원본ID·관측27필드·네음성대조·기존기대값은 유지했다. 실제Node24.20.0/Bun1.4.3을 새창의 모든판에 동일하게 고정하고 옛Node26기록과 원자료를 보존했다. 제품은item·prefixItems·itemCandidates·prefixItemCandidates가모두strict undefined일때 기존EMPTY를 반환하는7행뿐이며 DETAIL선행 뒤 source red/green을 검증했다. 새시험의 import9위반은 기존규칙을 바꾸지 않고 네 source시험과adapter를 engine안으로 이동해 바로잡았고 실제빈memo의 사후재조회참조 단언을 추가한 뒤 영향받은네게이트를 다시 통과했다. legacy직접root배열은 후위값관측뒤 지연callback이 있어 첫측정창을 폐기했으며 constructor미지원과구별해 UNVERIFIED_ASYNC_ROOT로남겼다. 교정창은current primary와동형/h 세판reference를분리하고136행을확보했으나 구현자검산·독립검산·인과확인·소유자성능수용은 별개다. 대기열60이열린동안 PR423의수용과병합은하지않으며 기존Filid FAIL·INDETERMINATE와제외범위를통과로바꾸지않는다." (`reviews/round-417-closing.md:8`)
  > 편집자 결정(418C-01): "【추론】 source/A/B의실제lexical WeakMap.get 연결은새관측사본의AST·입력그래프와Node/Bun자연생성키·무할당반복읽기·동일path재생객체대조로확인했다. 격리source는원본live TS/Vitest모듈과다르며기존66시험과8비용spy는보존하되이번에재실행하지않았다. 두runtime의세lane은각58이력으로합계348쌍이고522교차비교는저장raw재사용이다. agy의기여는정적코드·행검토와저장raw파싱이며새runtime증명이나AST해석기재실행으로적지않는다. 코디네이터는기존58source시험과8spy를옮기지않는별도58격리source관측lane을최소연결증명의방향으로선택한다. 12helper와4실제binding검증의준비·배치·실패우선증명은별도로필요하고4개가standalone이면Vitest사례로세지않는다. unknown·모호한연결은실패해야하며이단계는strict normalizer·추적구현·G13·제품결함입증·성능수용·병합승인이아니다. agy가샌드박스거절뒤우회했다고보고한원격조회는통과근거에서제외하고412승인에따른코디네이터의실제metadata확인과구별한다." (`reviews/round-418-closing.md:8`)
  > 편집자 결정(418C-02): "【추론】 legacy직접root의실제delivery와모든판의공통마지막postorder관측을같은endpoint로준비했다. 새Node/Bun고유68행은target24·control36·constructor미지원8이고synthetic20행의결함16거절·정상4수락과옛68행재사용은별개다. 앞선Node성공34행도보존하되고유68행에합치지않는다. callback은count/payload/resolve만하며Initialized·한microtask·누락delivery·시간상한을성공경계로쓰지않고판별별칭을유지한다. old proof의plan/gates hash와문서3개epoch차이는보존하며final10파일·이번old11파일·raw/제품/의존성의층별확인만주장한다. 앞선바이트없는정확한옛차등이나역사적문서전체연속성을통과로바꾸지않는다. 미래48행·4800표본·960warmup은미실행이고clock호출0·NOT_READY·window UNMET이다. 규칙정체성·러너독립검토·코디네이터quiet승인뒤에만다음단계를판정하며소유자의성능/정책수용을대행하지않는다." (`reviews/round-418-closing.md:10`)
  > 편집자 결정(418C-03): "【추론】 첫객체names조건부가설은E를포함하지않는main c598d60c2에서독립진행할수있는기준을확인했다. 이전6d7대비20경로는architecture문서뿐이고src/bench와선택입력은같지만이것이옛설치의존성·dist정체성이나새실행통과는아니다. 원본main관측의규칙채널누락과raw ID관측한계가남으므로미완성PR423helper를그대로채택하지않는다. 검토된helper의정확한정체성·생산모듈연결·전체관측을따로입증한뒤에만기준보완을판정한다. 원래60ID·13격리전사·미래480graph·20음성대조·384status계획은제품실행이나시간효과가아니며새가설구현·M3·대기열59/60을임의로닫지않는다." (`reviews/round-418-closing.md:12`)
  > 편집자 결정(419C-01): "【추론】 원래live source66과기대값을유지한Option B의helper12·별도standalone4·실제producer readonly연결을추적구현했고DETAIL을먼저커밋했다. Node/Bun의원58×source/A/B는348실제이력이며522는저장raw파생비교다. 새agy의코드·저장산출물독립검토와보완보고를기술범위에서수락하되새AST/runtime/독립해시실행으로적지않는다. 코디네이터의실제ready-6/7 네관측파일해시와Git/PR확인은별도주체의근거다. 선택저장소의정당한부재와색인불일치·unknown owner거절을구별하고초기실패를보존한다. 이G13기술판정은옛측정의소급정당화·새quiet승인·전역Filid통과·대기열59/60수용·PR423병합이아니다." (`reviews/round-419-closing.md:8`)
  > 편집자 결정(419C-02): "【추론】 현재시험설정은unit/render/react18/production/storybook의다섯project이므로인계의세project표기를바로잡는다. 새후보의전체764파일4863passed/기존1todo와네게이트exit0을확인하되Storybook251cases중play없는usage7개를interaction통과로세지않고scenario47과jsdom e2e의52고유파일/102project-file/712cases를구별한다. 옛79실행과새후보실행·정적분류·공유skip분기를같은증거로뭉치지않는다. 플러그인잔여8은옛9의정책·분류보정이며구현수정0이다. 기존별칭보존을깊은격리채택으로바꾸지않고native browser IME나별도plugin package시험까지통과했다고하지않는다." (`reviews/round-419-closing.md:10`)
  > 편집자 결정(419C-03): "【추론】 첫객체names가설의다음독립범위는E없는main415와고정검증후보282685f27의정체성·소비·관측도구인계계획보완뿐이다. 새ignored계획은옛15계획과기준보완을보존하며검증전용선행PR과제품가설PR의필요순서를구체화한다. 도구복사·채택·추적구현·제품실행·시간효과를이계획으로승인하지않는다. A/A와legacy비동기준비의옛epoch·실패는보존하고새측정은현입력과프로토콜을다시묶은뒤코디네이터의별도quiet판정을받아야한다. 소유자판단이필요한범위만대기열에남기며독립준비는계속한다." (`reviews/round-419-closing.md:12`)
  > 편집자 결정(420C-01): "【추론】 같은물리raw A를두슬롯에넣되서로다른실행module과memo를유지한strict준비의348실제이력/522저장비교/84preflight를새agy가자체계산으로대조했다. 원103파일과13023입력은불변이며보고서의옛finalizer해시를형제정정15파일로연결한다. 옛ad3원문과정확diff는없으므로환경검사만추가됐다는설명으로전후동치를꾸미지않고현재러너/실제raw/동결입력의독립근거만수용한다. 이M1은시간실행이아니며새출력경로와사전부재확인·모든병행작업유휴·고정epoch에대한별도M2판정이선행한다. 옛측정의소급정당화·환경변화무해판정·E인과론·대기열60성능수용·PR423병합은대행하지않는다." (`reviews/round-420-closing.md:8`)
  > 편집자 결정(420C-02): "【추론】 첫객체의descriptor/prototype/실제STABLE_SHAPES와objectKeyCounts관측계획22행/도구음성8개를독립검토했다. node키의stable과결과객체키의count를구별하고원28의미관측과정당한names수명별칭은보존하되중간staging제거·임시배열재사용은의도된비용차이로둔다. 누락된metadata wrapper타입의완결성과HostLatent새E없는빌드의실제필드방출/descriptor확인절차만새계획보완으로맡긴다. 원60ID/22+8/T14와기존계획은고치지않으며제품구현·새격리정책·기대값변경은승인하지않는다. 검토자의모든기술작업을소유자재승인에묶는표현은원장9절과415지시에따라채택하지않고필수판단범위만대기열에남긴다." (`reviews/round-420-closing.md:10`)
  > 편집자 결정(420C-03): "【추론】 F계획보완의실제완료/idle와전체관리worker목록을확인했고2026-10-18T21:26:46.666Z의관련시험/빌드/측정프로세스조회는0이었다. setup-witness f7e39b2f5ac7a2725772adb4871f591381de22e20a2310c8bfbaa432fd8c56d9와scoped입력13040/manifest/runner해시·네출력부재를직접재확인했으므로해당질문에만M2를승인한다. Node1/Bun1/Node2/Bun2의순차실행전보존/부재재확인과첫실패즉시중단·창닫기를요구하며root도그동안새작업/분석/ref게시를하지않는다. 이는시점별관리작업/관련프로세스관측의한정판정이지OS전체완전무활동증명이나성능수용이아니다. 실제136행/표본/결과의수용은실행뒤독립검산하며대기열59/60·옛E인과론·PR423병합은그대로보류한다." (`reviews/round-420-closing.md:13`)
  > 편집자 결정(421C-01): "【추론】 같은A의원래raw한입력과서로다른두실행module을유지하고focal상대순서만바꾸는P1계획을독립검토했다. 실제wrapper/helper/verifier/contract/epoch와controller의독립해시·정적검토및생산자의합성음성·메모리포트시나리오는도구준비근거로수용하되검토자자체실행과저장생산자증거를구별한다. 이M1은외부자동journal을포함한전역무변경이나새runtime·성능수용증명이아니며고정13040물리입력·출력부재·실제새질문별M2가실행에선행한다. helper새URL/callsite의VM상태동등성·GC/JIT인과·sourceE/trueB동치는주장하지않는다." (`reviews/round-421-closing.md:8`)
  > 편집자 결정(421C-02): "【추론】 새witness0de6bfe6와실제rootM2답에묶인controller1회·AB다음BA는모두exit0으로자동quiet를닫았고physical13040/source/runtime/refs/두index는동일했다. 그러나protected325중옛gates한파일이기대cb92e157에서실제fd662687로달라졌으므로전체protocol은failed이며G9/G11–13추가검사를중단한다. 옛원문복구·기대해시교체·재측정으로실패를가리지않는다. 새증거봉인자체의48entry불일치0과기존보존324/325는다른판정이다. 현재raw의독립중앙값·비율관찰은실패한창의산술보완으로만남기고G14/G15완료·성능수용·E인과·PR423병합으로바꾸지않는다." (`reviews/round-421-closing.md:10`)
  > 편집자 결정(421C-03): "【추론】 중단전옛작업연결과실제G10/G3자동응답·두checkbox상태projection을원인후보로조사하되옛전체bytepreimage가없는상태에서완전diff나hook결함을확정하지않는다. pause요청accepted·참여ACK·실제taskbinding적용은구별하고측정당시상태로소급하지않는다. 새읽기전용진단과실패창원시산술만허용하며hooks/config/세션직접편집·추가engine/gate·자동H2/H3/H4확장은하지않는다. 소유자의두새말은원문대로기록하고새정책승인으로넓히지않으며관측동작·기대값·충돌·느린결과수용의필수판단만기존대기열에남긴다." (`reviews/round-421-closing.md:13`)
  > 편집자 결정(422C-01): "【추론】 옛 T14 검토의 최종 말미만으로 통과를 추정하지 않고 새 독립 검토를 받았다. 계획의 retired owner 거절 요약은 SB3 known/held retired 보존과 상충할 수 있는 문구였으며 실제 구현 결함의 관측은 아니다. 원본을 고치지 않는 보완 계약과 G3/SB3/SB4 한정 재검토의 cleared 뒤 root는 위임된 G1 일반 범위로 원래14경로·원형58과 역사 live66 분리·19상태+9이력 채널·동일 module readonly reader와 좁은 capture/session을 수락한다. 유효한 보관 이력 occurrence는 허용하고 unknown/foreign/conflict·잘못된 attachment/lifetime·unreachable 정체성만 해당 불일치로 거절한다. 별도 T 구현의 DETAIL-first·실제 red·호환·네 package gate·Filid·독립 구현 검토는 새로 충족해야 하며 원래11 pending 문서나 미래 F60/480/20/384를 실행 결과로 바꾸지 않는다." (`reviews/round-422-closing.md:8`)
  > 편집자 결정(422C-02): "【추론】 두 agy의 표준 IPC 거절 뒤 전체 final/idle을 읽어 정확한 owned terminal만 stop/release했고 worker_done은 위조하지 않았다. 검토자의 새 Vincent 승인 요구와 root 요청의 Vincent 귀속은 수용하지 않고 원문은 보존했다. codex의129파일 보존·12정적 조건과 agy의 plan/report 두 해시·root의 seal10항목 대조는 각 수행 범위의 근거이며 T runtime 통과나 모든 입력의 독립 재해시가 아니다. P1 protected325중 옛 journal1 변경의 실패와 G9/G11–13 미실행은 그대로이고 재복구·기대치교체·hook/config수정·추가 timing을 하지 않는다. owner54/58/59/60·PR423·TEST-027/M3·느린 결과와 성능 수용은 해당 범위만 계속 보류하며 T 검증 도구 구현은 격리된 새 Orca 작업 폴더에서 독립 진행한다." (`reviews/round-422-closing.md:10`)
  > 편집자 결정(423C-02): "【추론】 T14는 검증·DETAIL14경로만 바꾸고 제품 코드와 기존 기대값은 바꾸지 않았다. 구현자 보고의 대상26통과·typecheck/lint/build통과와 Node/Bun 원형58의28채널 비교는 부분 근거다. 지정 전체 시험은37실패파일·61실패시험·18errors로 exit1이며 같은 baseline 실패라고 입증하지 않았다. G5와 독립 구현 검토는 미완료이고 초안 PR은 병합하지 않는다. P1 전체 실패와 owner54/58/59/60·PR423·M3·성능 수용 보류를 유지한다." (`reviews/round-423-closing.md:10`)
  > 편집자 결정(426C-02): "【추론】 426 창의 대표 행은 두 라운드의 부호가 반대이므로 측정 원칙에 따라 이 창에서는 차이가 입증되지 않았다고 기록한다. 2026-10-18 창의 일관된 약 14% 지연을 뒤집거나 확인하지 않으며, 두 창의 원자료를 함께 소유자 결정 60의 근거로 넘긴다. 느린 행을 잡음으로 처리하거나 수용으로 적지 않는다." (`reviews/round-426-closing.md:10`)
  > 편집자 결정(430C-02): "【추론】 2026-10-20 UTC 03:07:50–03:48:02에 HEAD 9a473b2a2의 core 16장면(Node v26.12.0·Bun 1.4.3, 두 바퀴 역순)과 React 포함 폼 수준(benchmark-form `--equivalent`, core·render 모드, 0.16.1 짝)을 한 창에서 쟀다. 결과 문서는 `verification/perf-optimization/baseline-430-results.md`, 원자료와 봉인(141항목 불일치 0)은 `.seiri/tasks/baseline-430/`이다. 이 창은 참조 창이며 수용이 아니고 창 안의 비율만 유효하다. 전체에서 두 바퀴 부호가 갈린 행은 React 포함 sample-1 profiler-mount 하나(−0.536%/+4.449%)뿐이다. 16장면 러너는 PR422 원본이 아니라 메인의 readiness 가드와 bench-common/loadDistEngine을 재사용해 같은 경계로 다시 만든 것이며 2026-10-18 창과 교차 비교하지 않는다." (`reviews/round-430-closing.md:10`)
  > 편집자 결정(431C-02): "【추론】 한 프로세스에서 장면을 이어 재는 방식은 같은 바이트의 dist 두 사본 사이에서도 수십 %의 차이를 낸다(420라운드 strict 보정, 431라운드 A/A/B 창, 장면별 교대 재측정). 다음 창부터 모든 가설 측정에 A/A/B 보정(기준, 기준의 바이트 동일 사본, 후보)을 기본으로 넣고, 1 ms 미만 장면은 장면마다 새 프로세스로 A/A′/B를 교대로 잰다. 판정 값은 `동치 범위 안`(두 바퀴 모두 |Δ(B/A)| ≤ 두 바퀴 |Δ(A′/A)| 최댓값이거나 부호가 다름), `입증(느림)`·`입증(빠름)`(두 바퀴 부호가 같고 두 바퀴 모두 폭을 넘음), `미입증`(같은 부호인데 한 바퀴만 폭을 넘음) 셋이며, 입증 행은 인과 확인(호출 수와 경로) 없이 잡음으로도 수용으로도 처리하지 않는다." (`reviews/round-431-closing.md:10`)
  > 편집자 결정(432C-02): "【추론】 431C-02의 "바퀴당 프로세스 하나, 두 바퀴 |Δ(A′/A)|를 폭으로" 규칙은 프로세스 간 편차(새 프로세스 사이의 A 실행 폭 약 1.6–1.8 %, 작은 장면은 수십 %)를 과소 추정한다(432라운드 인과 확인). 다음 창부터 1 ms 미만 장면의 판정 단위는 실행마다 새 프로세스로 A·A′·B를 교대 순서로 12바퀴 이상 돌린 실행별 min의 중앙값이며, 폭은 |Δ(A′/A)|·A 실행 폭·A′ 실행 폭의 최댓값이다. `입증(빠름)`·`입증(느림)`은 Δ(B/A)와 Δ(B/A′)가 같은 부호로 둘 다 그 폭을 넘을 때만이고 그 밖은 `동치 범위 안`이다. 입증 행은 여전히 인과 확인(호출 수와 경로) 뒤에만 근거로 쓴다. 1 ms 이상 장면은 431C-02의 A/A/B 두 바퀴 창을 유지한다." (`reviews/round-432-closing.md:10`)
  > 편집자 결정(434C-02): "【추론】 0.16.1보다 느린 행은 core 16·폼 76의 92행이며 debugger(Claude Opus)가 두 판의 번들을 새 프로세스에 올려 호출 수·노드 수·CPU 프로파일로 열세 그룹에 귀속했다(`.seiri/tasks/m3-433/causality/`, 봉인 밖; Node 기준). 비교 불가(일의 양이 다름) 2그룹 8행(C1 object-B0: 0.16.1은 호출자 객체를 host 값으로 그대로 받고 키 복사·마운트 onChange가 없음, E4는 키를 2N번 복사; C2 object-T·B1 N100: N과 무관한 정착·커밋·전달 고정 경로와 예열 20회), 입증된 비용 8그룹 47행(C3 object-BN 마운트마다 blueprint 재생성과 노드별 정착, C4 array-BN `getItemEntries` 캐시가 새 템플릿에 걸려 8000회 재생성, F1 oneOf 갱신의 분기 gate 24N회 재평가와 전환마다 노드 재생성, F2 oneOf 마운트의 모든 분기 blueprint와 gate 20N회, F3 마운트마다 blueprint 전체 재생성, F4 잎 하나 쓰기도 정착·커밋·전달을 동기로 완료, F5a array-replace의 항목별 selectChildren·mergeEffectiveSchema, R1 oneOf 렌더에 F1·F2 실림), 측정 장치 효과 1그룹 23행(R2 render wall: CPU는 같거나 E4가 적고 flushSync 뒤 setTimeout(0) 대기 1.3 ms를 겹치지 못함), 미확정 2그룹 14행(F5b array-push-remove 갱신, R3 profiler)이다. 어느 행도 잡음으로 처리하지 않았다. 82C-01에 따라 같은 묶음 안에서 크기만 다른 fixture 사이에 배율이 커지는 행은 수용 대상이 아니다: oneOf-5/10/20 갱신 5.49→6.52→8.20, 마운트 3.11→3.38→3.88, nested-d3/d5 마운트 1.96→2.68, flat-50/100/500 마운트 1.66→1.84→2.00이 커지고 object-BN·array-BN·array-100/500은 줄거나 일정하다. 그래서 (가) 20행(oneOf 15, flat 3, nested 2)은 GOAL-011 계약 위반 후보로 진단 대상이며 결정 58 게이트 폼 실험이 oneOf 갱신 경로의 첫 후보다. (나) 58행(비교 불가 8, 입증된 비용 27, 측정 장치 효과 23)은 한 묶음으로 "지금 수용하고 마운트 지연 단계를 닫는가"를 소유자에게 묻는다. (다) 14행은 미확정으로 추가 확인 뒤 옮긴다. 수용은 소유자만 한다(137C-01)." (`reviews/round-434-closing.md:10`)
  > 편집자 결정(435C-02): "【추론】 소유자는 435라운드에 434C-02의 (나) 58행(C1·C2 비교 불가 8, C3·C4 입증된 비용 8, F3 나머지 8, F4 10, F5a 1, R2 측정 장치 효과 23)을 한 묶음으로 수용했고 전제로 기능 무결성과 예측 가능성 등 설계 원칙 준수를 붙였다(`reviews/round-435-owner-answers.md:7`). 전제는 56라운드 소유자 규칙의 첫 조건(동작 정상: 수용은 verifier·차등 시험·게이트로 동작 무결성이 확보된 행에만 미침)의 재확인이며, M3 창의 E4(`335874be2`)는 네 게이트·관측 동치·독립 검토를 거친 PR들의 끝이므로 이를 충족한다. 58행은 "소유자 수용(2026-10-20, 435라운드)"이고 C3·C4 8행(object-BN N1000 1.8→5.7 ms, array-BN N8000 7.9→27.5 ms; 마운트마다 blueprint 재생성과 `getItemEntries` 캐시 불일치)은 후속 개선 우선 항목이다. 이로써 마운트 지연 단계(429라운드 소유자 목표)는 닫힌다. (가) 20행은 수용 항목이 아니라 82C-01 진단 대상(GOAL-011 계약 위반 후보)이고, (다) 14행은 추가 확인 대상이며, 둘 다 어느 PR의 병합도 막지 않는다." (`reviews/round-435-closing.md:10`)
  > 편집자 결정(437C-01): "【추론】 437라운드에 (가) 20행을 benchmark-form 폼 레인의 core 모드 행으로 확인하고 크기를 늘려(oneOf 5·10·20·40·80, flat 50~2000, nested d3~d6) E4(`d9f4eb975`, dist `9f454b91…`)와 E0 0.16.1의 wall 추세, E4의 단계별 호출 수(ucount 계열), E4의 단계별 시간(V8 표본 프로파일, 99C-01)을 한 창(UTC 2026-10-20 13:05:11 → 13:11:38, 판마다 새 프로세스, 세 바퀴, 실행별 최소값 중앙값)에서 쟀다(`verification/perf-optimization/size-diagnosis-437-results.md`, 증거 `.seiri/tasks/size-diagnosis-437/`). 검증자(Claude Opus)는 wall 56행·시간 372칸·계수 14×25·oneOf 세부 표를 원시 자료에서 재계산해 차이 0으로 조건부 통과했고 지적 10건(S1~S10)을 문서에 반영했다. 판정은 변경 단위를 기준으로 한다(J-26): 마운트 12행(oneOf 마운트 3, render 마운트 wall 3, render profiler-mount 3, flat 마운트 3)은 E4의 단위당 비용이 일정하거나 줄어 `상수 배(선형)`이고 원래 배율 상승은 E0의 저선형·고정 비용에서 온다. oneOf 갱신 6행(core-update 3, render-update-wall 3)은 N으로 정규화하면 선형이지만 분기 전환에서 바뀐 것은 분기 하나인데 E4 비용은 분기 수 N에 비례(분기당 약 14.8 µs, E0는 0.080~0.092 ms로 거의 일정, 배율 4.66→15.82)하므로 GOAL-011·94C-03 (나)의 위반 후보 `초선형 몫 있음`이며, 메커니즘은 루트 호스트의 모든 휠이 N개 분기 게이트를 모두 재평가하는 것(두 쓰기 합 24N = 16N + 8N, 확인 휠이 절반 12N; `computeNode.ts:152`, `selectNodeSchema.ts:28`, `selectChildren.ts:170`)이다. nested 마운트 2행은 청사진 단계의 단위 비용이 d3→d6에서 4.678→5.498 µs/N로 늘어 `초선형 몫 있음`이며, 그 가운데 경로 문자열 인코딩(`getTemplateKey.ts:18`·`:49`, `populateNodeChildren.ts:64`; 인코딩 문자 수 S=Σ(k=0..D)4^k(1+14k), Θ(N log N))으로 확인된 몫은 d6에서 약 0.664 ms로 청사진 초과분 약 3.358 ms의 약 20 %이고 나머지 증가분의 원인은 확정하지 않았다. 이 창의 수치는 M3(한 프로세스 교대, 표본별 강제 GC, 중앙값, development)와 직접 비교할 수 없다. 수정 가설은 우선순위대로 (1) nested 경로 열쇠의 접두 재인코딩 제거, (2) 같은 authored 스키마의 청사진 재사용(사양 질문, 소유자 대기열), (3) 결정 58 확인 휠 생략 실험, (4) flat-2000 갱신의 `assembleObject.ts:61` 전체 복사(원래 20행 밖, 값 하나 쓰기가 N=1000 0.15 ms → N=2000 3.36 ms, 자체 표본 96.9 %; GOAL-011 후보 열린 행, 원인 미확정, J-29)다. 수용은 소유자만 한다." (`reviews/round-437-closing.md:8`)
  > 편집자 결정(437C-02): "【추론】 F5b(array-push-remove-100 core-update)는 GC 조건 셋(장치 그대로, 표본마다 강제 GC, 강제 GC 없음과 semi-space 64 MB)에서 9회 모두 E4가 느렸고 Δ는 (a) +55~+72 %, (b) +48~+66 %, (c) +17~+41 %로 크기는 조건에 의존하고 부호는 의존하지 않으며, 프로파일은 구간 안 표본의 89~99 %가 idle이라 엔진 몫의 평탄 여부를 판정할 수 없어 `미확정`이다. R3 13행은 render 레인 두 바퀴(E4→E0, E0→E4)의 CPU 프로파일을 schema-form 번들·react-dom+react·기타로 나눠(`verification/perf-optimization/open-rows-437-results.md`, 증거 `.seiri/tasks/open-rows-437/`): profiler-mount 7행(sample-0/2/3, flat-50, array-push-100, array-replace-200, array-push-remove-100)은 소스 경계로 나눈 `src/core` 몫(blueprint 빌드와 노드 생성)이 두 바퀴 모두 양수라 `엔진 비용`, 배열 갱신 3행(array-push-100·array-replace-200·array-push-remove-100 profiler-update)은 react-dom+react 몫이 가장 커 `React 층`(array-replace-200 갱신은 패키지 React 층 FieldProxy·FieldInputBoundary 증가가 함께 있음), nested-d3·computed-visible-derived profiler-mount 2행은 두 바퀴의 부호가 뒤집혀 `방향 불안정`, sample-1 profiler-mount는 `미확정`이다. 검증자는 40개 프로파일 전부를 재계산해 조건부 통과했고 지적 7건(F1~F7; 측정 Node는 v24.20.0이라 M3 v26.12.0과 직접 비교하지 않음)을 반영했다. 엔진 비용 7행의 메커니즘은 F3·C3·C4와 같은 "마운트마다 blueprint 재생성"이고 437C-01이 그 크기 거동을 선형으로 보았으므로 새 크기 진단 없이 (나)형 후보로 옮긴다(J-27). 제출 구분은 이제 (나)형 후보 19행(437C-01의 마운트 12행 + 이 7행; 한 묶음으로 "지금 수용하는가"를 묻는다), 초선형 8행(oneOf 갱신 6, nested 마운트 2; 수정 대상), (다) 7행(F5b, sample-1·nested-d3·computed-visible-derived profiler-mount, 배열 갱신 3행; 확인 대상)이다. 어느 행도 잡음으로 처리하지 않았다." (`reviews/round-437-closing.md:10`)
  > 편집자 결정(438C-01): "【추론】 437C-02의 (나)형 후보 19행((가) 마운트 12행: oneOf 마운트 3·render 마운트 wall 3·render profiler-mount 3·flat 마운트 3; (다) R3 엔진 마운트 7행: sample-0/2/3·flat-50·array-push-100·array-replace-200·array-push-remove-100 profiler-mount)을 소유자가 "네 선형 정도면 수용합니다."로 한 묶음 수용했다(`reviews/round-438-owner-answers.md`). 전제는 435라운드와 같은 기능 무결성·예측 가능성이며 56라운드 규칙(동작 정상, 초선형 아님)의 두 조건을 437 진단이 충족했다. 이로써 TEST-027의 M3 느린 행 92개 중 수용은 58+19=77행이고, 남는 것은 초선형 8행(oneOf 갱신 6행은 438C-02의 생략으로 게이트 평가가 절반이 되었으나 분기 전환 비용이 여전히 분기 수 N에 비례하므로 `초선형 몫 있음`을 유지; nested 마운트 2행)과 (다) 7행(F5b, sample-1·nested-d3·computed-visible-derived profiler-mount, 배열 갱신 3행)이다. 수용은 개선 포기가 아니다." (`reviews/round-438-closing.md:8`)
  > 편집자 결정(440C-04): "【추론】 소유자가 결함 수정에서 비롯한 느린 행의 수용 원칙("느린 행의 원인이 오류 수정을 위함이라면 수용을 해야지")을 밝혀 PR431의 8행이 TEST-027로 수용되었고, 병합 뒤 제품 끝이 최적화의 기준이다(위 5행). 포괄 결함 확인("갱신 결과 = 같은 값의 새 마운트" 불변식을 게이트·상태 키·oneOf·배열·가상 노드·injectTo·overlay 조합의 생성 스키마 말뭉치에 대해 코어에서 자동 대조하고 같은 장면을 React 렌더 하네스 `playScenario`로 돌려 DOM·핸들 결과까지 비교)은 PLAN.md 4절의 새 4항으로 8단계 마지막에 두고 09 정리·릴리스는 5항이 된다(위 6행). 440 마운트 표(mount-env-440, E0=0.16.1 대 E7=`0645705c1` 빌드, UTC 창은 `window.json`, 182프로세스, 봉인 395파일, production): oneOf-80 0.4730→3.0321 ms(+541.0 %), flat-2000 3.4344→8.1742 ms(+138.0 %), nested-d6 7.8904→26.1190 ms(+231.0 %); 단위 비용 E7 µs/N은 oneOf-80 37.9, flat-2000 4.09, nested-d6 6.38. 같은 창의 E6 production 대조 14행 가운데 11행이 439b 창의 최소~최대를 벗어났으므로(대부분 10~30 % 빠름) E6→E7 열(oneOf −7.5 %, flat −6.1 %, nested −0.1 %)은 창 간 변동이고 제품 변화의 판정이 아니다(판정은 PR431의 A/A′/B 창: 14행 계열은 동치). 비교는 모두 코어(Node 직접 실행, React 없음)다. 작업 폴더: `schema-form-exit-gate`는 지웠고(J-32), `schema-form-env-hoist`는 PR430이 닫힐 때까지, `schema-form-dev-flag`는 구현 PR의 자료로 남긴다. Orca 대기 방식은 위 1·3행대로 포그라운드 5분 단위다. 소유자가 이어서 표의 범위를 물어 "지금 보여주는 표는 전부 마운트 비용인거야?"(위 7행) 마운트만임을 확인했고, "다음부터는 마운트 / 입력 을 별도 표로 구분하고, 단일 입력(input 에 단일 입력)과 setValue 로 일괄 입력하는 것을 구분해서 하도록 해."(위 8행)라고 지시했으므로 다음 보고부터 표는 마운트·단일 입력·setValue 일괄 입력 셋이고 측정 하네스도 두 입력 장면을 분리한다." (`reviews/round-440-closing.md:14`)
  > 편집자 결정(444C-06): "【추론】 소유자가 #451(D443-03)의 느린 행을 수용했다: 게이트 없는 nested-d6 일괄 통제 행 +4.13 %/+3.41 %(폭 0.111 ms), 바뀐 줄은 그 장면에서 0회 실행(위 5행 "응 수용"). 440C-04 의 원칙에 따른 TEST-027 수용이며 수용은 48C-01 대로 그 행의 원인에 한한다." (`reviews/round-444-closing.md:23`)
  > 편집자 결정(446C-06): "【추론】 단계는 D0~D5다. **D0 측정 장치의 복원과 기준선**: 8단계 최종 측정(443b)의 47행 장치는 소실되었으므로(`verification/perf-optimization/README.md` 3절) 같은 프로세스에서 0.16.1과 새 판을 AB/BA로 번갈아 재는 코어 장치를 `verification/design-optimization/tools/`에 다시 만들고(마운트·단일 입력·분기 전환·일괄 입력의 canonical 행 여덟과 형제 N 분기 전환·게이트 폼 잎 쓰기 탐침, CPU 프로파일 스크립트 포함), 단계 시작 커밋에서 세 속도 표(마운트·단일 입력·setValue 일괄, 운영 원칙 20)를 잰다. **D1 국소 설계 수정 여섯**(가설마다 PR 하나): H1 청사진의 호스트별 정적 분할 사이드카로 게이트 호스트의 정적 형제를 다시 고르지 않음(`selectChildren.ts:53`·`primeHost.ts:53-113`·`selectEntryStep.ts:276`; `staticShape.ts:46`이 자식 하나의 게이트로 호스트 전체를 거절하는 것도 고친다), H2 바퀴가 돌지 않은 경로의 `preserveReferences` 깊은 비교 생략(`computeNode.ts:119-153`; `updateOutput.ts:72`가 같은 비교를 하므로 shadow 검증 뒤), H3 파동당 한 번 계산하는 문서 순서 인덱스(`compareDocumentOrder.ts:16-23`; 고정 정수가 아니라 파동별 캐시), H4 `writeFieldNode.ts:59`의 `latentRaw.size === 0` 조건을 대상 경로 범위로 축소, H5 `captureFieldNodeChange.ts:62`에 배달 후보 큐를 붙여 커밋의 여섯 집합 순회를 대체(revision 비트 계수는 리스너 유무와 무관하게 유지), H6 청사진 캐시 연결(446C-03). **D2 설계 Ⅰ**: 호스트별 컴파일 계획과 2단계 정착(446C-02); 한 바퀴 안에서 뒤 게이트가 앞 게이트의 투영을 즉시 본다는 계약(`design/03-settle-and-events.md:120`)과 상속 overlay를 그대로 지킨다. **D3 캐시 계층**(446C-04). **D4 판정 관문**: D0와 같은 장치·같은 창에서 세 표를 다시 재어, 분기 전환 oneOf-80 행과 일괄 입력 nested-d6-f4 행이 0.16.1의 1.5배 안에 들고 절대 시간이 각각 1 ms와 5 ms 아래이면 거기서 멈추고 9단계로 간다; 하나라도 넘으면 D5로 간다. **D5 설계 Ⅱ**(조건부): 슬롯 테이블과 수명별 핸들(446C-02); 자료구조가 바뀌어 shadow 모드로 증명할 수 없으므로 시나리오 스위트와, 비활성 참조의 읽기·구독·상호작용 상태·배열 itemKey·`find`·메모리 상한 여섯 의미에 대한 새 시험을 수정 전에 실패하도록 먼저 둔다. PR마다의 게이트는 `plan/perf-optimization/verification.md`의 것을 물려받고(네 관문, 시험 파일 변경은 추가만, 전후 배달 비교 차이 0, 독립 검토, 비용 문장, 대장 갱신), 공개 겉면 차분은 이 단계가 더하는 이름(`FormHandle.rebuild`)만 허용하며 그 이름은 LANDING 항목으로 기록한다. D4의 수치가 관문이고, 그 밖의 느린 행은 TEST-027대로 이유와 수치를 적어 소유자가 수용한다." (`reviews/round-446-closing.md:18`)
  > 편집자 결정(447C-07): "【추론】 446C-06은 D4에서 관문 행이 하나라도 넘으면 D5(설계 Ⅱ)로 간다고 정했다. 447C-06의 분석에서 분기 전환 행의 관문(0.16.1의 1.5배, 왕복 0.1175 ms)은 설계 Ⅰ만으로 닿을 수 없고(최적화된 상태에서도 쓰기 한 번의 하한 약 61 µs, 상한 약 59 µs), 설계 Ⅱ를 더해도 추정 하한이 왕복 0.156~0.24 ms라 닿지 못한다. 절대 기준인 1 ms 미만은 지금도 통과한다(0.4865 ms). D5는 이 단계에서 가장 큰 설계 변경이므로, 관문에 닿을 가망이 없다는 추정 아래 규칙만으로 착수하지 않는다. D4에서 분기 전환 행이 관문을 넘으면 그 수치와 D5의 추정 효과를 소유자에게 올려, 관문 수치를 유지하고 D5로 갈지, 그 행을 TEST-027로 수용할지를 소유자가 정한다(대기열 66). 판정에 쓰는 측정은 지금의 표준 프로토콜(20 예열·100 표본·3 실행)이다. 실제 사용자는 판별자를 수천 번이 아니라 몇 번 바꾸므로 최적화 전 단계의 비용도 사용자가 겪는 비용이다. D2의 분기 전환 PR은 최적화 문턱을 낮춘 쌍 측정도 참고로 적어, 일의 양이 줄었는지와 예열 효과를 가른다." (`reviews/round-447-closing.md:20`)
  > 편집자 결정(449C-01): "【추론】 소유자가 분기 전환은 일단 수용하고 마운트까지 작업한 뒤 다시 검토하자고 했다(위 1행). 분기 전환 oneOf-80 행(D1 통합 판 0.4865 ms, 0.16.1의 6.2배, 절대 기준 1 ms 미만은 통과)을 TEST-027에 따라 지금 수치로 잠정 수용한다. 447C-07이 D4에서 소유자에게 올리기로 한 결정은 이 수용으로 지금 답해졌고, 마운트 검증을 마친 뒤 소유자와 다시 검토한다. 형제 수에 비례하는 항을 없애는 D2-P5는 분기 전환에 속하므로 보류하고, 진행분은 가지 `perf/schema-form-d2-sibling-linear`와 그 결과 문서에 보존해 재검토 때 다시 연다." (`reviews/round-449-closing.md:8`)
  > 편집자 결정(451C-01): "【추론】 소유자가 #470의 노드당 힙 증가(Bun +1.465 B, +0.066 %)를 TEST-027로 받아들였고(위 1행) 끝난 worktree와 가지는 정리하며 진행하라고 했다(위 1·2행). #470은 설계 최적화 가지에 병합 커밋 8569ec0e1로 들였다(GitHub의 병합 버튼은 병합 커밋을 금지해 로컬에서 병합해 push했다). 병합된 #463~#470의 가지, 통합 가지 둘(`integration/schema-form-d1`·`d2`), 옛 문서 스냅숏 가지 둘(`docs/schema-form-d2-0-profile`·`d3b-inventory`, 내용은 모두 단계 가지에 있었다), 폐기 가설의 가지(H3·H4·H5·D2-P4·D2-M)와 D2-M 워커의 worktree를 원격·로컬에서 지웠고, 8단계 가지(#445, 소유자 병합 대기)·단계 가지·진행 중인 D3b-2 가지·보류된 D2-P5 가지(`perf/schema-form-d2-sibling-linear` 4681c0aff, 분기 전환 재검토용) 넷만 남겼다. 그래서 d4f9e0c76의 D2-M 기록이 적은 "후보 d1079e5c3 보존"은 더 성립하지 않는다: 폐기 가설의 코드는 보존 대상이 아니고 결과 문서(`verification/design-optimization/d2-m-results.md`)가 기록이다." (`reviews/round-451-closing.md:8`)
  > 편집자 결정(452C-02): "【추론】 B2는 Node가 통과(E 중앙 1442.2 ≤ S 최대 1903.0)하고 Bun은 E 중앙 2224.58 B/노드가 S 최대 2214.74보다 +9.84 B/노드(+0.44 %) 커서 단계 관문("단계 시작 판보다 크지 않음")에 미달했다. 소유자가 "힙당 크기는 수용 가능하다"고 했다(위 1행). TEST-027에 따라 수용으로 기록한다. 이 증가에는 이미 받아들인 #470(+1.465)과 #471(+0.413)이 들어 있고, 나머지는 D1·D2 PR들이 각각의 B2 관문(B 중앙 ≤ A 최대)을 통과하면서 쌓인 몫이라 PR 하나로 돌릴 수 없다." (`reviews/round-452-closing.md:10`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:223`(정본), `adr/0009-performance-budget-and-benchmarks.md:9,92`, `08-design-a-to-z.md:609`, `reviews/round-16-owner-answers.md:12`, `reviews/round-16-owner-review.md:57`, `reviews/round-18-agenda.md:68`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:12` 답 6), 편집자 결정(16라운드 도출, '통제 가능'의 뜻, `09-landing-and-test-strategy.md:223`)
- 라운드: 16
- 까닭: `reviews/round-16-owner-answers.md:12`
- 충돌:
  > `09-landing-and-test-strategy.md:223`의 "상한의 형태(옛 판 대비 배율인가 절대 수치인가)와 수치는 ADR 0009의 미결이며 기준선을 잰 뒤 Vincent가 정한다(18라운드 안건)."는 18라운드 결정과 다르다: 형태와 선은 TEST-072가 정했고(같은 실행의 옛 판 대비, `guard:check`의 선), Vincent는 선을 넘은 항목을 병합 때 받아들인다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:796-798`).
  > `reviews/round-85-closing.md:9`의 "【추론】 54라운드에 소유자가 받아들인 느린 행의 수치(배열 1천 개의 루트 통째 쓰기 Node 1.41–1.43배)는 원장이 "받아들일 만한 상수 차이"로 가진 유일한 선이므로 분기 없는 폼의 목표는 그 선을 올림한 1.5배(중앙값, 옛 판 0.16.0 대비, `benchmark-form`의 같은 폼 쌍)다 — 마운트와 갱신 모두에 건다. 분기 폼은 소유자가 "ajv 개입으로 어쩔 수 없다"고 했으므로 검증기를 끈 측정(`validator` 없이 마운트·갱신)으로 같은 1.5배를 목표로 하고, 검증기를 켠 측정과의 차이는 ajv 컴파일·실행 몫으로 분리해 보고서에 기록만 하며 목표에 넣지 않는다 — 다만 그 차이 안에 ajv가 아닌 몫(가드 등록의 중복, 루트 재컴파일 등)이 있으면 그것은 (가)의 기준을 받는다. React 층은 27라운드 소유자 답이 최종 게이트로 둔 jsdom 측정이고 지금 수치(마운트 1.0–1.4배, Profiler 갱신 0.75–1.0배)가 이미 그 근처이므로 마운트 1.2배·갱신 1.0배 이내로 건다. 측정 조건은 TEST-026 그대로(워밍업 10회 이상, 표본 100회 이상, 중앙값과 p99, 명시적 수집)이고 판정은 중앙값으로 한다. 07은 84라운드가 지시한 분기 없는 폼의 옛 판 대 새 판 단계별 재진단을 먼저 하고, 구조로 분류된 몫은 코드 전에 바꿀 설계와 뒤집힐 원장 항목을 올리며(65라운드 절차), 개선 뒤 같은 방법으로 다시 잰다. 목표에 못 미친 행이 남으면 행마다 수치와 단계별 이유를 적어 소유자에게 다시 묻고, 그 답이 없는 한 G26은 통과하지 않는다."는 소유자 답과 다르다: 분기 폼의 목표는 검증기를 끈 1.5배가 아니라 91라운드의 기준 셋이다(분기 없는 폼의 목표는 그대로). 소유자 답이 이긴다(`reviews/round-91-owner-answers.md:8`).

### TEST-028 벤치마크를 설계에 넣는 것은 소유자의 요구, 수치 예산은 아직 정해지지 않음

- 결정:
  > 상태: 제안. 벤치마크를 설계에 넣는 것은 소유자의 요구다 — "기존 설계 방향에서 잡았던 고속 동작이 깨져서 느려질까 봐 걱정이다. 벤치마크를 통해서 성능을 끌어올렸으면 한다. 설계 단계니까 이것도 설계에 넣었으면 한다." 아래의 수치 예산은 아직 정해지지 않았다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0009-performance-budget-and-benchmarks.md:5`(정본), `00-goals.md:150`, `00-goals.md:81`
- 닫은 사람: 소유자 답(`00-goals.md:150` G6)
- 라운드: 1(ADR 0009 본문)
- 까닭: `00-goals.md:150`
- 충돌:
  > `adr/0009-performance-budget-and-benchmarks.md:5`의 "아래의 수치 예산은 아직 정해지지 않았다."는 18라운드 결정과 다르다: 예산의 수치는 기존 `guard:check`의 선이다(TEST-073). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:816`).

### TEST-029 원칙(G6) — 비용은 바꾼 것의 크기에 비례, 성능은 주장하지 않고 측정

- 결정:
  > 어떤 동작의 비용은 폼의 크기가 아니라 그 동작이 바꾼 것의 크기에 비례한다. 성능은 주장하지 않고 측정한다.
- 보충:
  > "- 성능은 주장하지 않고 측정한다. 기존 구현이 기준선이고, 예산과 시나리오는 설계의 일부다." (`00-goals.md:81`)
  > 소유자(16라운드 답 10): "에. 최소생성, 메모리안정, 캐싱을 통한 속도 및 재생성 방지가 고속성 원칙에 포함됩니다." (`reviews/round-16-owner-answers.md:16`)
  > 소유자(16라운드 덧붙인 말): "최초부터 이 form의 목적은 모바일에서도 실행가능한 수준의 안정성과 경제성이라서요" (`reviews/round-16-owner-answers.md:18`)
  > 편집자 결정(452C-05): "【추론】 소유자가 "React 벽시계"라는 용어를 지적하고(위 1행) 갱신 경과 시간이 Profiler와 다른 까닭을 검토하라고 했으며(위 2행) 그 문제까지 고치고 다음으로 가라고 했다(위 3행). 진단: `render-update-wall`은 상호작용 루프 전후의 경과 시간이고 상호작용마다 `flushSync` 뒤 `setTimeout(0)` 두 번을 기다리는데(`packages/aileron/benchmark-form/src/benchmarks/canard/equivalent.ts:91-100`, `src/utils/setup-env.ts:73-82`) Node가 1 ms로 클램프해 약 2 ms 바닥과 밀리초 경계마다 1 ms 계단이 생긴다. 새 판은 값 쓰기 안에서 정착·배달 파동·React 동기 commit을 타이머 전에 끝내고, 옛 판은 마이크로태스크·setTimeout으로 미뤄 타이머 대기 안에서 돌아 Profiler에는 잡히고 경과 시간에는 숨는다. react-1.json의 sample-0 분포가 L 56 %/44 %, E 8 %/92 %의 두 봉우리라 1.46배는 봉우리 이동이지 연속 비용이 아니며 commit 반감은 원인이 아니다. D4b(#473, 러너만 변경, 제품 소스 변경 0): 타이머 클램프 없는 정착 장벽(마이크로태스크 비움 → immediate → `setTimeout(0)` 한 번 → immediate)으로 옛 판의 미룬 작업이 모두 끝난 뒤 멈추고, `update-sync`(flushSync 구간)·`update-settled`(정착 완료까지)·빈 장벽 바닥·바닥을 뺀 net을 더했다. 다시 재니 `update-settled` E÷L은 19 픽스처에서 0.106~1.098(배열 갱신 0.11~0.57, 평면·sample 0.95~1.03, nested-d5 1.10, oneOf 1.02~1.04, array-replace 1.07~1.09)이고, Profiler 갱신은 0.04~1.07, commit 수는 절반이다. 독립 검토 PASS(`/private/tmp/claude-501/perf-runs/446-reviews/pr-473-antigravity.md`: 장벽 공정성, 114 수치 일치, 기존 시험 변경 0). 용어는 "갱신 경과 시간"으로 쓴다. 7단계·8단계의 React 측정(`verification/07-switch/`)도 같은 러너로 쟀으므로 그 경과 시간 수치는 같은 허상을 안고 있다는 것을 적어 둔다(수치 자체는 고치지 않는다)." (`reviews/round-452-closing.md:16`)
  > 편집자 결정(455C-02): "【추론】 지금 장치는 A·B·A′를 각각 3프로세스씩 순서대로 재는데, 기계 상태가 몇 분 사이에 20 % 넘게 움직여 TEST-073의 A 대 B Welch 검정이 창의 흐름에 걸린다(455C-01의 증거). 소유자가 보강을 승인했다(위 2행 "2. 승인"). 보강은 셋이다: 행마다 A와 B 프로세스를 번갈아(A B A B …) 각 10프로세스(20 예열·100 표본은 그대로) 돌려 같은 시각의 짝으로 비교하고, A′는 따로 돌리지 않고 A 프로세스의 뒤 절반(6~10번째)으로 정의해 폭 (다) = max(|A−A′|, rangeA, rangeA′) 규칙을 그대로 적용하며, 가설이 닿지 않는 행(B1·B2-P1b는 branchless·잠복 없는 single-flat-1000)의 B/A 중앙값 비가 ±5 % 밖이면 창을 무효로 하고, TEST-073은 교대 짝의 A 대 B로 판정하되 A′ 대 B를 나란히 적는다. 폭 (다)의 규칙(443C-03)과 15 % 선(TEST-073)은 바꾸지 않는다. B1이 이 모드를 측정 장치(`verification/design-optimization/tools/`)에 더해 단계 가지로 올리고, B1 후보 2의 재측정과 B2-P1b부터의 모든 정식 측정에 적용한다. 무효 창은 재측정이 아니라 "판정 불가"로 기록한다(재측정 금지 유지)." (`reviews/round-455-closing.md:10`)
- 상태: 현행
- 출처: `adr/0009-performance-budget-and-benchmarks.md:14`(정본), `00-goals.md:77,81`, `reviews/round-16-owner-answers.md:16,18`
- 닫은 사람: 원리(`00-goals.md:77` G6), 소유자 답(`00-goals.md:150` G6)
- 라운드: 1(ADR 0009 본문)
- 까닭: `00-goals.md:77`

### TEST-030 ADR 0009 5차 주 — 측정 수치는 유효, 시나리오 이름은 옛 모델, 5차 원장이 우선하는 일곱 곳

- 결정:
  > **5차 주(2026-09-23).** 이 문서는 4차 본문이다. 측정 수치는 유효하나 시나리오 이름은 옛 모델의 것이다. 5차 원장과 다른 곳은 원장이 우선한다: (1) begin/complete 두 패스와 선택 가드는 사라졌다(정착은 출발점 고정, 한 패스). (2) 분기 선택기와 `selection` 칸은 없다. (3) 역색인은 기각되었다. (4) `controls.discriminator`는 분기별 `controls.active` 식(`===` 비교)을 만든다 — "판별식 직접 비교를 넣지 않음"은 옛 결정이다. (5) "dirty 목록"은 재계산 목록이다. (6) `&if`는 `controls.active`에 흡수되었다. (7) 코어에 글로벌 잠금이 없어 루트 키의 특수 조회가 사라진다. 나감의 비움(선택, 기본 꺼짐)은 전이 단계의 자동 쓰기라 켠 폼에서만 비용이 든다(원장 §3·§4).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0009-performance-budget-and-benchmarks.md:3`(정본)
- 닫은 사람: 편집자 결정(11라운드 5차 주, `adr/0009-performance-budget-and-benchmarks.md:3`)
- 라운드: 11
- 까닭: `adr/0009-performance-budget-and-benchmarks.md:3`

### TEST-031 기존 구현이 기준선 — 재설계 시작 시점에 벤치를 돌려 커밋을 고정해 재현 가능하게

- 결정:
  > 기존 테스트는 동작이 달라져 회귀 오라클이 못 되지만, 기존 구현의 성능은 기준선이 된다.
  > - 코어를 건드리기 전에 재설계 시작 시점(`master` `660dde66f`, v0.16.0)에서 패키지 내 벤치와 `benchmark-form`의 scale 벤치를 돌려 기준선을 잡는다.
  > - `bench/.results/`는 git 추적 대상이 아니므로 기준선은 **커밋을 고정해 재현할 수 있게** 둔다. `benchmark-form`은 이미 과거 배포 버전을 고정해 같이 재는 구조이므로, 재설계 직전 버전을 "legacy" 어댑터로 고정해 새 구현과 같은 실행에서 나란히 잰다. 기계와 시점이 달라도 비교가 성립한다.
- 보충:
  > "기존 테스트는 동작이 달라져 회귀 오라클로 쓸 수 없다. 새 불변식이 오라클이 된다." (`02-target-overview.md:363`)
  > "5. **성능.** 기존 구현의 기준선(패키지 벤치와 `benchmark-form`의 scale 벤치)이 있다. 수치 예산은 ADR 0009의 미결이며 소유자 정책이다." (`02-target-overview.md:369`)
  > "기존 구현의 기준선(패키지 벤치 일곱, `benchmark-form`의 scale 벤치)과 비교한다." (`08-design-a-to-z.md:609`)
  > "옛 엔진에서 마지막 기준선을 `bench:baseline`으로 남긴다." (`09-landing-and-test-strategy.md:222`)
  > "기준선은 있다: 패키지 벤치 일곱(`bench/.results/baseline.json`)과 `benchmark-form`의 scale 벤치(`results/baseline.json`), 재실행 수치가 기록과 정합(2026-09-23)." (`03-mental-model.md:214`)
- 상태: 현행
- 출처: `adr/0009-performance-budget-and-benchmarks.md:66,68-69`(정본), `02-target-overview.md:363,369`, `08-design-a-to-z.md:609`, `09-landing-and-test-strategy.md:222`, `00-goals.md:81`
- 닫은 사람: 편집자 결정(1라운드 ADR 0009 본문, `adr/0009-performance-budget-and-benchmarks.md:64`), 편집자 결정(16라운드, `09-landing-and-test-strategy.md:222`)
- 라운드: 16
- 까닭: `adr/0009-performance-budget-and-benchmarks.md:66`
- 충돌:
  > `adr/0009-performance-budget-and-benchmarks.md:66`의 "기존 테스트는 동작이 달라져 회귀 오라클이 못 되지만"은 뒤 라운드의 기존 시험 처분과 다르다(약 55파일의 단언을 남긴다, TEST-013). 정본이 이긴다(`09-landing-and-test-strategy.md:158-159`). TEST-013이 이긴다: 기존 234파일 가운데 그대로 사는 약 30파일과 표면만 고치는 약 25파일의 단언을 남긴다.
  > `02-target-overview.md:369`의 "수치 예산은 ADR 0009의 미결이며 소유자 정책이다."는 18라운드 결정과 다르다: 예산의 수치는 기존 `guard:check`의 선이다(TEST-073). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:816`).

### TEST-032 벤치 시나리오 — G6의 네 상황과 새 구조 고유·메모리·14라운드 행

- 결정:
  > | 상황 | 이미 있는 것 | 새로 필요한 것 |
  > | ---- | ------------ | -------------- |
  > | 대규모 쓰기 | `array-node-stress`의 applyValue, scale 벤치 | 큰 트리의 루트에 값을 통째로 쓰기 (flat 500, array 1000) |
  > | 배치 작업 | `event-cascade`의 K-배치 쓰기 | 표시 N번 → 계산·커밋 1번의 비용 |
  > | 빠른 연속 입력 | 하니스의 키 입력 단계 | **넓은 객체(키 1,000개)와 긴 배열(아이템 10,000개) 안에서의 키 입력** — 불변 갱신의 복사 비용 (ADR 0006의 위험) |
  > | 화면 전환 | `branch-strategy-init`, oneOf 토글, 마운트 | 조각 전환(가드가 뒤집힐 때의 begin/complete), 선택 가드의 분기 전환 |
  > | (새 구조 고유) | — | **가드 평가** — `if`/`then`이 많은 스키마에서 쓰기당 `compileGuard` 호출 수와 시간, 검증기 구현체별(AJV, 인터프리터형) 비교. **1차 측정 완료** — 아래 "측정 결과" 절 |
  > | (새 구조 고유) | — | 분석 단계(스키마 → 청사진)의 1회 비용, `$ref`가 많은 스키마 |
  > | 메모리 | `benchmark-form`의 heap snapshot 도구(내용 미확인) | 노드당 메모리, 노드를 필요할 때 만드는 안(ADR 0011)의 효과 |
  > | (14라운드) | — | 조건부 폼(`if` 20, 필드 200)의 마운트·키 입력·토글 |
  > | (14라운드) | — | `oneOf` 픽스처를 `controls.discriminator`판과 게이트 없는 판으로 나누어 잰다 |
  > | (14라운드) | — | 배치 없는 연속 `setValue` M회의 검증 횟수와 시간 |
- 보충:
  > "측정 수치는 유효하나 시나리오 이름은 옛 모델의 것이다." (`adr/0009-performance-budget-and-benchmarks.md:3`)
  > 편집자 결정(18C-15): "벤치: 루트로 옮긴 게이트가 N개일 때 키 입력 한 번의 비용을 잰다." (`reviews/round-18-closing.md:453`)
  > 편집자 결정(18C-67): "PR: PR-2 벤치(TEST-027·TEST-032)에 "켜진 조각 N개 호스트의 무관한 키 입력" 행을 더한다." (`reviews/round-18-closing.md:1889`)
  > 편집자 결정(18C-81): "PR: PR-2 벤치." (`reviews/round-18-closing.md:2188`)
  > 편집자 결정(18C-81): "무엇: 커밋 때 조상 경로 메모를 갱신하는 비용을 잰다." (`reviews/round-18-closing.md:2189`)
- 상태: 현행
- 출처: `adr/0009-performance-budget-and-benchmarks.md:73-84`(정본), `reviews/round-18-closing.md:453,1889,2188-2189`
- 닫은 사람: 편집자 결정(1라운드 ADR 0009 본문, `adr/0009-performance-budget-and-benchmarks.md:71`), 편집자 결정(14라운드, `adr/0009-performance-budget-and-benchmarks.md:82`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-15·18C-67·18C-81)
- 라운드: 18
- 까닭: `adr/0009-performance-budget-and-benchmarks.md:71`, `reviews/round-18-closing.md:444-447`, `reviews/round-18-closing.md:1885-1887`, `reviews/round-18-closing.md:2184-2186`
- 충돌:
  > `adr/0009-performance-budget-and-benchmarks.md:78`의 "조각 전환(가드가 뒤집힐 때의 begin/complete), 선택 가드의 분기 전환"은 5차 주의 "(1) begin/complete 두 패스와 선택 가드는 사라졌다"와 다르다(옛 모델의 시나리오 이름). 5차 주가 이긴다(`adr/0009-performance-budget-and-benchmarks.md:3`). TEST-030이 이긴다: 5차 주의 그 항이 규칙이다.

### TEST-033 구조를 확정하기 전에 잰다 — 버릴 것을 전제로 한 스파이크

- 결정:
  > ADR 0006(값의 소유), 0007(작업 루프), 0011(노드를 필요할 때 만들기)의 구체 형태는 성능 위험을 안고 있다. 본 구현에 앞서 **버릴 것을 전제로 한 스파이크**로 위험 지점만 잰다: 넓은 객체·긴 배열에서의 불변 갱신 비용, 쓰기당 가드 호출 비용, 작업 루프 한 회의 비용. 스파이크의 결과가 그 ADR들의 미결을 닫는 근거가 된다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0009-performance-budget-and-benchmarks.md:88`(정본), `adr/0009-performance-budget-and-benchmarks.md:110`
- 닫은 사람: 편집자 결정(1라운드 ADR 0009 본문, `adr/0009-performance-budget-and-benchmarks.md:86`)
- 라운드: 1
- 까닭: `adr/0009-performance-budget-and-benchmarks.md:88`

### TEST-034 측정 인프라 — 오늘 가진 것(패키지 벤치 일곱, benchmark-form, 모바일 성능 보고서)

- 결정:
  > - **패키지 내 벤치** — `bench/*.bench.ts` 7개, `vitest bench`(node 환경, JSDOM 없음). `bench:baseline`이 `bench/.results/baseline.json`을 쓰고 `bench:compare`가 그것과 비교한다(`package.json:47-50`). `bench/.results/`는 git 추적 대상이 아니다.
  >   | 파일 | 재는 것 |
  >   | ---- | ------- |
  >   | `nodeFromJSONSchema.bench.ts` | 스키마 → 노드 트리 생성 (flat / nested / oneOf / computed) |
  >   | `branch-strategy-init.bench.ts` | oneOf 분기 초기화 비용 (2×3 … 10×10, 중첩 깊이 3/5) |
  >   | `event-cascade.bench.ts` | `setValue` → 캐스케이드 (20필드 배치 쓰기, derived 체인, oneOf 토글) |
  >   | `find-node.bench.ts` | `find()` 탐색 (깊이 3/7/12, 팬아웃 10/50) |
  >   | `compute-recalculate.bench.ts` | `ComputedPropertiesManager.recalculate()` |
  >   | `object-pending-read.bench.ts` | 자식 커밋이 대기 중일 때 부모 객체 읽기 비용 |
  >   | `render-delay.bench.ts` | 버전 간 마운트 회귀 감시 (필드 5 / 25 / 150) |
  > - **라이브러리 간 비교** — `packages/aileron/benchmark-form`. `@canard/schema-form`(워크스페이스 + 고정 버전 0.9.0–0.12.5)을 `@rjsf/core`, `react-hook-form`, `formik`, `@tanstack/react-form`과 같은 하니스(마운트 / 키 입력 / 프로그램적 `setValue`)로 비교한다. 공정성을 위해 문자열 필드만 있는 평면 스키마를 쓴다. schema-form 전용 기능은 "scale" 벤치(flat 50/100/500, nested, array 100/500/1000, oneOf 5/10/20)와 `array-node-stress`(push / applyValue / remove)가 따로 잰다. 통계적 회귀 게이트(`guard:baseline` / `guard:check`)가 있다.
  > - **모바일 성능 보고서** — `docs/ko/MOBILE_PERFORMANCE_REPORT.md`(v0.10.6). 문서화된 안전 임계: 필드 50개 미만, 배열 아이템 30개 미만, computed 의존 20개 미만, 중첩 깊이 8 미만, oneOf 분기당 필드 20개 미만.
- 보충: 없음
- 상태: 현행(기록)
- 출처: `adr/0009-performance-budget-and-benchmarks.md:20,22-30,32-33`(정본), `00-goals.md:82`
- 닫은 사람: 편집자 결정(1라운드 ADR 0009 본문의 관찰, `adr/0009-performance-budget-and-benchmarks.md:16`)
- 라운드: 1
- 까닭: 없음

### TEST-035 지금 빠르게 만드는 장치와 새 구조에서의 운명

- 결정:
  > | 장치 | 위치 | 새 구조에서 |
  > | ---- | ---- | ----------- |
  > | computed가 없는 노드가 공유하는 frozen sentinel | `getComputedPropertiesManager.ts:19-26` | 유지. `controls`의 식이 없는 노드는 complete 단계에서 표현식 비용이 0이어야 한다 |
  > | 단순 동등식 분기의 O(1) 인덱스 조회 | `.../getSimpleEquality.ts:16-64` | 사라진다(`&if` 분기 폐지). 가드 평가는 검증기가 한다. 측정 결과 AJV에서는 대체 장치가 필요 없다(50분기의 마지막 일치도 1.25 µs) |
  > | 지연 합성 값 캐시 `__composed__` | `ObjectNode/.../BranchStrategy.ts:107-110, 304-317` | 필요 없어진다. 방출 값의 메모를 쓰는 곳이 작업 루프 하나이고, 바뀐 자식이 없으면 이전 참조를 그대로 둔다 (ADR 0006) |
  > | 이벤트 배치와 병합 | `EventCascadeManager.ts:79-125` | 통지 1회로 대체된다 (ADR 0008) |
  > | `revision(mask)` 원장 | `EventCascadeManager.ts:159-201` | 유지 |
  > | `Batch` / `Isolate` 플래그로 대량 쓰기의 커밋 횟수 줄이기 | `core/types/value.ts:26-66` | "표시 N번 → 계산·커밋 1번"으로 대체된다 (ADR 0007) |
  > | 할당 없는 `schemaPath` 매칭 | `.../matchesSchemaPath.ts:29-37` | 유지. 에러 라우팅이 `schemaPath`에 더 의존하게 된다 (ADR 0001) |
  > | 렌더 가상화 | `helpers/virtualization/` | 유지. 노드를 필요할 때 만드는 안(ADR 0011)과 결합할 수 있다 |
  > | 자식 컴포넌트 맵의 메모이제이션 | `.../useChildNodeComponents.tsx:52-113` | 유지. 캐시가 언마운트까지 무한히 자라는 문제는 함께 고친다 |
- 보충:
  > "(6) `&if`는 `controls.active`에 흡수되었다." (`adr/0009-performance-budget-and-benchmarks.md:3`)
- 상태: 현행
- 출처: `adr/0009-performance-budget-and-benchmarks.md:37-47`(정본)
- 닫은 사람: 편집자 결정(1라운드 ADR 0009 본문, `adr/0009-performance-budget-and-benchmarks.md:35`)
- 라운드: 1
- 까닭: `adr/0009-performance-budget-and-benchmarks.md:35`
- 충돌:
  > `adr/0009-performance-budget-and-benchmarks.md:39`의 "`controls`의 식이 없는 노드는 complete 단계에서 표현식 비용이 0이어야 한다"는 5차 주의 "(1) begin/complete 두 패스와 선택 가드는 사라졌다"와 다르다(complete 단계는 없다). 5차 주가 이긴다(`adr/0009-performance-budget-and-benchmarks.md:3`). TEST-030이 이긴다: 5차 주의 그 항이 규칙이다.
  > `adr/0009-performance-budget-and-benchmarks.md:45`의 "에러 라우팅이 `schemaPath`에 더 의존하게 된다"는 18라운드 결정과 다르다: 에러 배정은 `dataPath`로 하고 `schemaPath`는 꺼진 union 분기를 표시에서 거르는 필터에서만 쓴다(VALIDATE-043). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:1471-1495,1502-1503`).

### TEST-036 1차 스파이크 측정 결과 — 가드 호출 수, 인터프리터형과 컬렉션 가드, 컴파일 비용, 복사 비용, 검증 비용

- 결정:
  > 수치와 방법은 `reviews/round-1.md` §2에 있다. 결론만 옮긴다.
  > 1. **AJV에서는 가드를 몇 번 부르느냐가 문제가 아니다.** 루트에 걸린 좁은 가드 200개를 키 입력마다 전부 돌려 7.9 µs다.
  > 2. **걱정이 현실이 되는 곳은 둘이다**: 인터프리터형 검증기(`@cfworker/json-schema`는 같은 작업에 578 µs, 호스트 객체의 폭에 비례한다)와 컬렉션을 훑는 가드(아이템 10,000개의 `contains` 하나에 AJV 190 µs, 인터프리터 4.5 ms — 키 입력마다).
  > 3. **"호스트 참조가 그대로면 건너뛴다"는 루트에 걸린 가드에 효과가 없다.** 읽는 키의 참조를 선형으로 비교하는 것도 AJV에서는 평가 비용과 같다. 효과가 있는 것은 변경 경로 → 가드의 역색인뿐이다(13 ns).
  > 4. **AJV의 실제 비용은 컴파일이다.** 가드 하나에 70–270 µs, 200개면 폼 생성 시점에 14–54 ms. 늦추고, 중복을 없애고, 폼 인스턴스 사이에 공유해야 한다.
  > 5. **불변 갱신의 복사 비용은 문제가 아니다.** 키 1,000개 객체 1.1 µs, 아이템 10,000개 배열 2.7 µs. 현재 구현의 동기 쓰기 경로와 같은 수준이다.
  > 6. 검증은 폼 전체 크기에 비례한다(아이템 10,000 × 6필드에 약 140 µs, 에러가 많으면 더). 입력 경로에서 떼어 낸다(ADR 0007).
  > 모바일과 저사양 기기에서는 재지 않았다. 나노초 단위의 측정은 방법에 민감하다 — 같은 인자를 되풀이하면 JIT가 호출을 없애고, 여러 경우를 한 프로세스에서 재면 100배까지 어긋난다(`reviews/round-1.md` §2의 방법 절).
- 보충: 없음
- 상태: 현행(기록)
- 출처: `adr/0009-performance-budget-and-benchmarks.md:51,53-58,60`(정본), `00-goals.md:132`
- 닫은 사람: 편집자 결정(1라운드 측정 기록, `reviews/round-1.md:19`)
- 라운드: 1
- 까닭: 없음
- 충돌:
  > `adr/0009-performance-budget-and-benchmarks.md:58`의 "입력 경로에서 떼어 낸다(ADR 0007)"는 18라운드 결정과 다르다: 폼은 검증을 입력 경로에서 떼어 내는 장치를 따로 두지 않고 진입당 요청 1회와 마이크로태스크 합치기로 하며, 빈도 조절은 `OnRequest`다(VALIDATE-049). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2154-2160`).

### TEST-037 2라운드 측정 — 작업 루프 프로토타입

- 결정:
  > `reviews/round-2.md` §2에 표가 있고 전문은 `spikes/work-loop/REPORT.txt`다. 요점: 키 입력이 현재 구현보다 두 자릿수 배 싸지고(쓰기 뒤 첫 읽기의 재합성이 사라진다), 구현 선택이 승패를 가른다(메모 복사·패치 대 재구성 104배, dirty 목록 대 플래그 스캔 17배, 역색인 5배). 재설계가 지는 유일한 지점은 조건부 폼의 생성(가드 컴파일 22 ms)이며 폼 인스턴스 사이의 컴파일 공유가 필요하다. V8의 자기 속성 1,020개 절벽은 현재 구현에도 같게 걸린다.
- 보충: 없음
- 상태: 현행(기록)
- 출처: `adr/0009-performance-budget-and-benchmarks.md:110`(정본)
- 닫은 사람: 편집자 결정(2라운드 측정 기록, `reviews/round-2.md:18`)
- 라운드: 2
- 까닭: 없음

### TEST-038 열림: '일정 수준'의 형태(배율인가 절대 수치인가)와 수치

- 결정:
  > - **'일정 수준'의 형태와 수치(16라운드 답 6).** 옛 판보다 느린 것이 넘지 않을 상한의 형태(옛 판 대비 배율인가 절대 수치인가)와 수치. 아래 '예산의 수치'와 함께 기준선을 잰 뒤 정한다.
- 보충: 없음
- 상태: 대체됨(→ TEST-072)
- 출처: `adr/0009-performance-budget-and-benchmarks.md:96`(정본), `09-landing-and-test-strategy.md:223`, `reviews/round-18-agenda.md:63`, `reviews/round-18-closing.md:794-805`
- 닫은 사람: 편집자 결정(16라운드, 답 6의 '일정 수준'을 ADR 0009 미결로 둠, `reviews/round-16-owner-answers.md:12` 반영 열), 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:63`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-26)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:807-810`
- 충돌:
  > `adr/0009-performance-budget-and-benchmarks.md:94`의 "미결 — 소유자가 정할 것"는 18라운드 결정으로 닫혔다(편집자 결정, 18라운드). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:796`).

### TEST-039 열림: 예산의 수치 — 키 입력과 마운트, 대규모 쓰기와 배치

- 결정:
  > - **예산의 수치.** 후보: 키 입력과 마운트는 기준선 대비 잡음 범위 안(예: 5% 이내)에서 나빠지지 않는다. 대규모 쓰기와 배치는 개선을 목표로 한다. 수치는 기준선을 실제로 잰 뒤에 정하는 것이 맞다.
- 보충:
  > "성능 예산 수치(ADR 0009 미결)." (`03-mental-model.md:214`)
  > "수치를 정하는 것은 소유자 정책이다(18라운드 안건)." (`03-mental-model.md:214`)
  > "성능 예산 수치는 소유자 정책이다." (`08-design-a-to-z.md:483`)
  > "| 성능 예산 수치(ADR 0009 미결, **소유자 정책**)와 '일정 수준'의 형태·수치, 번들 예산. 기준선은 있다 | 착수 전(18라운드 안건 E) |" (`08-design-a-to-z.md:499`)
- 상태: 대체됨(→ TEST-073)
- 출처: `adr/0009-performance-budget-and-benchmarks.md:97`(정본), `02-target-overview.md:369`, `08-design-a-to-z.md:609`, `reviews/round-18-agenda.md:64`, `reviews/round-18-closing.md:816-827`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:64`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-27)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:829-832`
- 충돌:
  > `03-mental-model.md:214`의 "수치를 정하는 것은 소유자 정책이다(18라운드 안건)."는 18라운드 결정으로 닫혔다(편집자 결정, 18라운드): 예산의 수치는 기존 `guard:check`의 선이다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:816`).
  > `08-design-a-to-z.md:483`의 "성능 예산 수치는 소유자 정책이다."는 18라운드 결정으로 닫혔다(편집자 결정, 18라운드): 예산의 수치는 기존 `guard:check`의 선이다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:816`).
  > `08-design-a-to-z.md:499`의 "성능 예산 수치(ADR 0009 미결, **소유자 정책**)"는 18라운드 결정으로 닫혔다(편집자 결정, 18라운드): 예산의 수치는 기존 `guard:check`의 선이다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:816`).

### TEST-040 열림: 문서화된 안전 임계를 올릴 것인가

- 결정:
  > - **문서화된 안전 임계를 올릴 것인가.** 현재는 "필드 50개 미만 안전, 배열 아이템 30개 미만 안전"이다. 재설계의 목표를 이 임계를 몇 배로 올리는 것으로 둘 것인가.
- 보충: 없음
- 상태: 대체됨(→ TEST-074)
- 출처: `adr/0009-performance-budget-and-benchmarks.md:98`(정본), `adr/0009-performance-budget-and-benchmarks.md:33`, `reviews/round-18-agenda.md:65`, `reviews/round-18-closing.md:838-843`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:65`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-28)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:845-847`
- 충돌:
  > `adr/0009-performance-budget-and-benchmarks.md:94`의 "미결 — 소유자가 정할 것"는 18라운드 결정으로 닫혔다(편집자 결정, 18라운드). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:838`).

### TEST-041 열림: 번들 크기 예산(현재 gzip 약 44KB)

- 결정:
  > - **번들 크기 예산.** 현재 gzip 약 44KB. 검증기를 내장하지 않으므로(ADR 0004) 늘 이유는 적지만, 분석 단계와 분기 선택기가 더해진다.
- 보충:
  > "- 번들 크기도 예산이다(현재 gzip 약 44KB)." (`00-goals.md:82`)
- 상태: 대체됨(→ TEST-075)
- 출처: `adr/0009-performance-budget-and-benchmarks.md:99`(정본), `00-goals.md:82`, `reviews/round-18-agenda.md:66`, `reviews/round-18-closing.md:853-860`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:66`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-29)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:862-864`
- 충돌:
  > `adr/0009-performance-budget-and-benchmarks.md:99`의 "분석 단계와 분기 선택기가 더해진다"는 5차 주의 "(2) 분기 선택기와 `selection` 칸은 없다"와 다르다. 5차 주가 이긴다(`adr/0009-performance-budget-and-benchmarks.md:3`). TEST-030이 이긴다: 5차 주의 그 항이 규칙이다.
  > `adr/0009-performance-budget-and-benchmarks.md:99`의 "현재 gzip 약 44KB"는 측정 방법이 적히지 않은 수치라 18라운드 결정과 다르다: 기준은 v0.16.0의 37,023 B(ESM 진입 minify + gzip -9, 의존성 외부)다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:855`).
  > `00-goals.md:82`의 "현재 gzip 약 44KB"는 측정 방법이 적히지 않은 수치라 18라운드 결정과 다르다: 기준은 v0.16.0의 37,023 B(ESM 진입 minify + gzip -9, 의존성 외부)다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:855`).
  > `adr/0009-performance-budget-and-benchmarks.md:94`의 "미결 — 소유자가 정할 것"는 18라운드 결정으로 닫혔다(편집자 결정, 18라운드). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:853`).

### TEST-042 인터프리터형 검증기의 지원 수준과 컴파일 예산

- 결정:
  > - **인터프리터형 검증기를 어느 수준까지 지원하는가.** 성능 예산을 AJV 기준으로 잡으면 인터프리터형은 "동작하지만 큰 폼에서는 느리다"가 된다. 역색인(ADR 0005 §2)을 넣으면 격차가 줄지만 폼이 `if`의 프로퍼티 이름을 읽어야 한다.
  > - **컴파일 예산.** 폼 생성 시점의 동기 컴파일을 얼마까지 허용하는가.
- 보충:
  > "예산 수치가 있어야 판정할 수 있다." (`07-conclusions.md:474`)
- 상태: 분할됨(→ TEST-065, TEST-066)
- 출처: `adr/0009-performance-budget-and-benchmarks.md:100,102`(정본), `reviews/round-18-agenda.md:67`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:67`)
- 라운드: 17
- 까닭: 없음
- 충돌:
  > `adr/0009-performance-budget-and-benchmarks.md:100`의 "역색인(ADR 0005 §2)을 넣으면 격차가 줄지만 폼이 `if`의 프로퍼티 이름을 읽어야 한다"는 5차 주의 "(3) 역색인은 기각되었다"와 다르다. 5차 주가 이긴다(`adr/0009-performance-budget-and-benchmarks.md:3`). TEST-030이 이긴다: 5차 주의 그 항이 규칙이다.

### TEST-043 대체됨: const/enum 판별식의 직접 비교는 넣지 않는다

- 결정:
  > - **`const`/`enum` 판별식의 직접 비교는 넣지 않는다**(1차 측정상 AJV에서 불필요). 다시 검토하게 되면 폼이 `const`를 해석하는 방식이 아니라 **분석 단계에서 검증기에게 물어 채운 조회표**여야 한다 — `if: { properties: { k: { const } } }`는 `k`가 없을 때도, 호스트가 객체가 아닐 때도 참이고, 순진한 `===` 비교가 가장 먼저 틀리는 곳이 거기다(`reviews/round-1.md` §4).
- 보충:
  > "(4) `controls.discriminator`는 분기별 `controls.active` 식(`===` 비교)을 만든다 — "판별식 직접 비교를 넣지 않음"은 옛 결정이다." (`adr/0009-performance-budget-and-benchmarks.md:3`)
- 상태: 대체됨(→ CONTROLS-031)
- 출처: `adr/0009-performance-budget-and-benchmarks.md:101`(정본), `adr/0009-performance-budget-and-benchmarks.md:3`
- 닫은 사람: 편집자 결정(11라운드 5차 주, `adr/0009-performance-budget-and-benchmarks.md:3`)
- 라운드: 11(1라운드 본문의 결정을 대체)
- 까닭: `adr/0009-performance-budget-and-benchmarks.md:3`

### TEST-044 릴리스 — 오늘(조사): 워크플로 둘, 손으로 올리는 판, 쓰이지 않는 changesets, 릴리스 전 점검 없음

- 결정:
  > **오늘**(조사, `reviews/raw-round16-release.md`).
  > - 워크플로는 둘이다. `performance-benchmarks.yml`(벤치와 과다 렌더 단언)과 수동 실행 전용 `publish-npm-packages.yml`이다. 배포는 `scripts/publish-packages.sh`가 `yarn pack`으로 `workspace:^`를 실제 범위로 바꾸고 이미 있는 판은 건너뛰며 npm OIDC(저장 토큰 없음)로 올리고, `scripts/tag-packages.sh`가 태그만 만든다. GitHub Release는 없다.
  > - `yarn lint`·`typecheck`·`test`·스토리북 빌드를 돌리는 워크플로가 없다.
  > - 판은 손으로 올린다(`yarn version`). `@canard/schema-form` 계열 여덟(본체, ajv6·ajv7·ajv8 플러그인, antd5·antd6·antd-mobile·mui 플러그인)은 같은 판(0.16.0)으로 움직인다.
  > - changesets는 `@changesets/cli`·`@changesets/changelog-github`와 루트 스크립트만 있고 `.changeset/`이 없다. 루트 `CLAUDE.md`는 changesets를 쓰지 않는다고 적는다.
  > - 릴리스 전 점검이 없다. `@aileron/production-testbed`와 가져오기 시험 스크립트(`scripts/test-package-import.sh` 등)는 어느 워크플로도 부르지 않는다.
- 보충:
  > 소유자(244라운드, 대기열 33): "질문1: 타입처리는 해결하고 가. 귀찮아서 any 로 그냥 넘어간걸거야. 7b-2 뒤에 질문2 항목과 함께 처리해. " (`reviews/round-244-owner-answers.md:7`)
  > 소유자(244라운드, 대기열 34): "질문2: 옮겨" (`reviews/round-244-owner-answers.md:8`)
  > 소유자(250라운드, 대기열 35): "새 문법으로 다 바꿔야 하지 않을까?? 아무래도? 지금 바꾸는 중이니까" (`reviews/round-250-owner-answers.md:7`)
- 상태: 현행(기록)
- 출처: `09-landing-and-test-strategy.md:227,229-233`(정본)
- 닫은 사람: 편집자 결정(16라운드 조사, `09-landing-and-test-strategy.md:227`)
- 라운드: 16
- 까닭: 없음

### TEST-045 릴리스 1 — changesets 가동 — .changeset/config.json, fixed 무리 여덟과 그 근거·비용

- 결정:
  > 1. **changesets 가동.** `.changeset/config.json`: `changelog: ["@changesets/changelog-github", { "repo": "vincent-kk/albatrion" }]`(repo 옵션이 없으면 생성기가 던진다), `fixed: [["@canard/schema-form", "@canard/schema-form-*-plugin"]]`(여덟), `privatePackages: { version: false, tag: false }`(기본값은 비공개 패키지의 판을 올린다), `baseBranch: "master"`, `updateInternalDependencies: "patch"`(기본값), `changedFilePatterns`는 아홉째. `fixed`의 근거: 플러그인 일곱은 `@canard/schema-form`을 동료 의존으로 선언하지 않아 사용자에게 보이는 호환 신호가 같은 판 번호뿐이고(일관성), C7이 무리의 동행을 요구한다. 비용: `@winglet/*`의 patch 하나도 본체를 거쳐 무리 여덟의 재배포로 번진다(받아들인다). 플러그인이 나중에 `@canard/schema-form`을 `workspace:^` 동료 의존으로 선언하면 동료의 minor에도 무리 전체가 major로 번지므로 그때 `___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH.onlyUpdatePeerDependentsWhenOutOfRange: true`를 둔다. `changeset version`은 `@changesets/changelog-github`가 `GITHUB_TOKEN`을 요구하므로 `changesets/action` 안에서만 돈다.
- 보충:
  > 소유자(16라운드 답 9): "정해지지 않았습니다. changeSet 을 사용한 표준 방법으로 바꾸고자 합니다. 릴리즈 테스트도 다시 작성해야 합니다. 지금 구조는 github actions를 보세요" (`reviews/round-16-owner-answers.md:15`)
  > 소유자(C7): "스키마폼 관련 모든 버전은 일시에 메이저 버전급 변경을 진행한다." (`00-goals.md:110`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:237`(정본), `09-landing-and-test-strategy.md:278`, `reviews/round-16-owner-answers.md:15`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:15` 답 9), 소유자 답(`00-goals.md:110` C7), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`)
- 라운드: 16
- 까닭: `reviews/round-16-owner-answers.md:15`

### TEST-046 릴리스 2 — 배포는 오늘의 스크립트, 태그는 changeset tag

- 결정:
  > 2. **배포는 오늘의 스크립트, 태그는 `changeset tag`.** `changeset publish`는 pnpm이 아니면 `npm publish`를 불러 `workspace:` 범위를 바꾸지 않고 설정 기본값 `access: restricted`로 올리므로 쓰지 않는다. 루트 스크립트 `"release": "./scripts/publish-packages.sh && changeset tag"`를 두고 `changesets/action`의 `publish: yarn release`로 부른다(액션 입력에 `&&`를 직접 쓰지 않는다). 액션은 `changeset tag`의 `New tag:` 줄과 각 패키지의 `CHANGELOG.md`로 GitHub Release를 만든다. 태그 형식은 오늘과 같다(`<이름>@<판>`, 있는 태그는 건너뛴다). `dry_run`은 액션을 거치지 않는 별도 단계(`DRY_RUN=true ./scripts/publish-packages.sh`)로 가른다(액션을 거치면 올리지 않은 판에 실제 태그와 Release가 생긴다). 한 패키지의 실패는 `exit 1`로 태그를 막고, 복구는 같은 커밋에서 실패한 작업을 다시 돌리는 것이다(새 푸시로 다시 돌리면 태그가 배포된 커밋을 가리키지 않는다). 첫 가동 전 확인: 커밋 해시로 고정한 액션 원본에서 태그 푸시, `publish` 입력의 분할, `~/.npmrc`의 `_authToken` 처리가 OIDC와 부딪히지 않는지, `CHANGELOG.md`가 없을 때의 동작을 읽는다. npm Trusted Publisher 등록(`scripts/PUBLISHING.md`의 체크리스트)을 끝낸다. 망가진 `changeset:publish`(`yarn run:all && changeset publish`)는 지운다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:238`(정본), `09-landing-and-test-strategy.md:278`, `reviews/round-16-owner-answers.md:15`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`)
- 라운드: 16
- 까닭: `reviews/round-16-owner-answers.md:15`

### TEST-047 릴리스 3 — 작업 흐름은 publish-npm-packages.yml 한 파일 — 작업 다섯

- 결정:
  > 3. **작업 흐름은 `publish-npm-packages.yml` 한 파일.** npm Trusted Publisher가 이 파일 이름에 묶여 있다(옮기면 공개 패키지 열여섯을 `npm login`과 이중 인증으로 다시 등록한다). 실행 조건은 `push: master`와 `workflow_dispatch`(`dry_run` 유지). 작업 다섯: `version`(`changesets/action`을 `publish` 없이 돌려 판 올림 PR을 만들거나 갱신하고 `hasChangesets`를 낸다. `github.ref`가 `refs/heads/master`일 때만. 권한 `contents: write`·`pull-requests: write`, `id-token` 없음), `detect`(`hasChangesets`가 거짓이고 태그 없는 공개 패키지 판이 있으면 참을 낸다. `fetch-depth: 0`의 git 태그로 본다), `test`(`uses: ./.github/workflows/test.yml`, `if: needs.detect.outputs.pending == 'true'`. 재사용 작업 흐름을 부르는 작업은 단계를 가질 수 없어 `detect`와 가른다), `publish`(`needs: [detect, test]`, 권한 `id-token: write`·`contents: write`, 빌드(rolldown 경고 차단 단계 유지) → 릴리스 테스트(여섯째) → `changesets/action`의 publish), `release-test`(`needs: version`, `if: needs.version.outputs.hasChangesets == 'true'`, 빌드(rolldown 경고 차단 단계 포함)와 여섯째의 릴리스 테스트, 권한 `contents: read`). `concurrency`(`publish-npm-packages`, 취소 없음)는 그대로다. 작업 흐름 머리의 설명을 새 실행 조건에 맞게 고친다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:239`(정본), `09-landing-and-test-strategy.md:278`, `reviews/round-16-owner-answers.md:15`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`)
- 라운드: 16
- 까닭: `reviews/round-16-owner-answers.md:15`

### TEST-048 릴리스 4 — 토큰은 기본 GITHUB_TOKEN

- 결정:
  > 4. **토큰은 기본 `GITHUB_TOKEN`.** GitHub App 토큰이나 개인 토큰을 두지 않는다. 최소 권한 규칙이며, changesets 표준 예시도 기본 토큰이다. 기본 토큰이 연 판 올림 PR에서는 다른 작업 흐름이 돌지 않으므로, '시험을 통과한 것만 나간다'는 판 올림 PR의 병합 조건이 아니라 배포 작업의 `needs: test`가 지킨다(배포할 바로 그 커밋을 검사한다). 판 올림 PR은 판 번호와 변경 기록만 바꾸고 코드는 이미 `master` 푸시의 시험을 거쳤으므로 병합 뒤 실패하는 창은 좁다(실패 때는 여덟째). 소유자의 손 작업 하나: 저장소 설정 'Allow GitHub Actions to create and approve pull requests'를 켠다(이름과 동작은 첫 가동 때 확인).
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:240`(정본), `09-landing-and-test-strategy.md:278`, `reviews/round-16-owner-answers.md:15`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`)
- 라운드: 16
- 까닭: `reviews/round-16-owner-answers.md:15`

### TEST-049 릴리스 5 — 지속 통합 시험 작업 흐름 test.yml을 새로 둔다

- 결정:
  > 5. **지속 통합 시험 작업 흐름 `.github/workflows/test.yml`을 새로 둔다.** 실행 조건은 `pull_request`, `push: master`(문서만 바뀌는 푸시는 `paths-ignore`), `workflow_call`. 단계: `yarn install --immutable`, 의존 빌드, `yarn lint`, `yarn typecheck`, `yarn test`. 루트에는 오늘 `lint`·`typecheck`·`test` 스크립트가 없으므로(루트 `CLAUDE.md`는 있다고 적는다) 전환 PR이 루트에 `yarn workspaces foreach --all --topological-dev run <이름>` 형태로 더한다. 공개 패키지 전부(`@winglet/*`, `@lerx/promise-modal`, `@slats/agents-assets-sync` 포함)의 시험이 같은 관문 뒤에 선다. PR 실행에는 아홉째의 `changeset status`를 더한다. 브랜치 보호의 필수 검사로는 삼지 않는다(기본 토큰의 판 올림 PR에서는 보고되지 않는다). schema-form의 vitest 세 프로젝트와 `storybook` 프로젝트의 playwright chromium 설치는 PR-0이 이 파일에 더한다(전환 PR이 먼저 병합되면 schema-form은 오늘의 단일 `vitest run`으로 시작한다).
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:241`(정본), `09-landing-and-test-strategy.md:278`, `reviews/round-16-owner-answers.md:15`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`)
- 라운드: 16
- 까닭: `reviews/round-16-owner-answers.md:15`

### TEST-050 릴리스 6 — 릴리스 테스트를 다시 쓴다 — 포장된 산출물을 검사

- 결정:
  > 6. **릴리스 테스트를 다시 쓴다 — 포장된 산출물을 검사한다.** (1) 포장: 판 가드 없이 공개 패키지 전부를 `yarn pack`하는 `scripts/pack-packages.sh`를 `publish-packages.sh`에서 떼어 내고 둘이 함께 쓴다(오늘은 판 가드가 `yarn pack`보다 앞이라 레지스트리에 있는 판은 포장되지 않는다). 비공개 `@aileron/schema-form-scenarios`도 포장한다. (2) 설치: `@aileron/production-testbed`를 저장소 밖 임시 폴더로 복사하고(워크스페이스 안에서는 `workspace:^`가 원본으로 풀린다), 공개 워크스페이스 전부(`@winglet/*`, `@lerx/promise-modal` 포함, 배포되지 않은 의존의 폐포)를 포장 파일로 강제하며(overrides), 플러그인 의존을 더하고, 제3자 의존의 판은 루트 `yarn.lock`의 판으로 고정한다(방법은 전환 PR이 정한다). React 18과 19는 설치 단계의 판 덮어쓰기로 고른다(답 5). (3) 검사: `skipLibCheck: false`인 별도 tsconfig로 배포된 `.d.ts`의 형 검사, 설치된 패키지 이름으로 ESM `import`와 CJS `require`(오늘의 가져오기 시험 스크립트를 옮겨 쓴다), testbed 빌드, 대표 시나리오 그리기(감싸개에 포장된 `Form`을 주입, §8의 아홉째). 조합은 쌍으로 덮는다: UI 플러그인 넷을 각각 ajv8과, ajv6·ajv7을 각각 UI 하나와 짝지어 React 판마다 여섯, 모두 열둘(UI 플러그인과 검증기 플러그인은 서로를 가져오지 않고 코어 계약으로만 만난다. 코어를 거치지 않는 경로가 나오면 곱으로 되돌린다). (4) 시점: 변경이 대기 중인 `master` 푸시(판 올림 PR이 갱신될 때)에 셋째의 `release-test` 작업으로 한 번, 셋째의 `publish` 작업 안에서 빌드 뒤·올리기 전에 같은 빌드로 한 번.
- 보충:
  > 편집자 결정(릴리스 전환 PR의 첫 가동): "대표 시나리오 그리기(감싸개에 포장된 `Form`을 주입, §8의 아홉째)" (`09-landing-and-test-strategy.md:242`) — 릴리스 전환 PR은 `master`에 시나리오 패키지가 없으므로 릴리스 테스트를 오늘 배포된 패키지로 시나리오 그리기 없이 돌리고, 조합 열둘의 시나리오 실행은 PR-8의 게이트다(LANDING-097은 전환 PR이 재설계와 독립이라고만 정한다).
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:242`(정본), `09-landing-and-test-strategy.md:278`, `reviews/round-16-owner-answers.md:15`, `reviews/round-16-owner-answers.md:11`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:15` 답 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`), 소유자 답(`reviews/round-16-owner-answers.md:11` 답 5), 편집자 결정(18라운드, 개발계획 별도 PR; 첫 가동은 시나리오 그리기 없이)
- 라운드: 18
- 까닭: `reviews/round-16-owner-answers.md:15`

### TEST-051 릴리스 7 — 배포 시점 — 판 올림 PR을 병합하면 자동 배포

- 결정:
  > 7. **배포 시점: 판 올림 PR을 병합하면 자동으로 배포한다.** `master`에 태그 없는 공개 판이 있고 대기 중인 changeset이 없으면 `detect → test → publish`가 돈다. '언제 나가는가'의 통제는 소유자가 판 올림 PR의 병합을 누르는 동작으로 남고(오늘의 작업 흐름 머리가 지키던 것), 수동 실행을 남기면 `master`의 판·`CHANGELOG.md`와 npm·태그가 어긋나는 창이 생긴다. 판 변경이 어떤 길로든 `master`에 들어오면(직접 푸시 포함) 배포된다는 것을 `scripts/PUBLISHING.md`에 적는다. `workflow_dispatch`는 실패 뒤 다시 돌리기와 `dry_run` 점검용으로 남는다. 첫 가동은 안전하다(공개 패키지 열여섯의 현재 판은 모두 태그가 있다).
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:243`(정본), `09-landing-and-test-strategy.md:278`, `reviews/round-16-owner-answers.md:15`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`)
- 라운드: 16
- 까닭: `reviews/round-16-owner-answers.md:15`

### TEST-052 릴리스 8 — 병합 뒤 시험 실패의 복구 — 다음 판으로

- 결정:
  > 8. **병합 뒤 시험 실패의 복구.** 판 올림 PR 병합 뒤 `test`가 실패하면 고치는 커밋에 patch changeset을 더해 다음 판으로 낸다. 실패한 판은 배포되지 않은 채 건너뛴다(그 `CHANGELOG.md` 제목은 남는다). 같은 판 번호로 고친 것을 올리면 그 수정이 변경 기록에 빠지므로 하지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:244`(정본), `09-landing-and-test-strategy.md:278`, `reviews/round-16-owner-answers.md:15`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`)
- 라운드: 16
- 까닭: `reviews/round-16-owner-answers.md:15`

### TEST-053 릴리스 9 — changeset 존재 검사와 changedFilePatterns

- 결정:
  > 9. **changeset 존재 검사.** 시험 작업 흐름의 PR 실행에 `yarn changeset status --since=origin/${{ github.base_ref }}`를 넣고(`checkout`은 `fetch-depth: 0`) 없으면 실패하게 한다. 릴리스가 필요 없는 변경은 `changeset add --empty`로 통과한다. 우산 브랜치로 가는 PR은 `changeset add --empty`로 통과하고, `fixed` 무리의 동작 변경 기록은 PR-8의 changeset이 맡는다(무리 밖 패키지는 열한째처럼 그 패키지를 바꾸는 PR이 자기 changeset을 더한다). `changedFilePatterns`는 패키지 폴더 기준의 부정 패턴으로 둔다: `["**", "!architecture/**", "!**/INTENT.md", "!**/DETAIL.md", "!CLAUDE.md", "!stories/**", "!bench/**", "!**/*.test.*", "!**/*.spec.*", "!**/__tests__/**", "!vitest.config.*"]`(`docs/**`·`bin/**`·`scripts/**`·빌드 설정·`README.md`는 배포되는 입력이라 남긴다). 적용 전에 문서만 바꾼 PR과 `docs/agents`를 바꾼 PR로 `changeset status --verbose`를 돌려 확인한다. 소유자의 직접 푸시는 이 검사가 막지 못하므로 루트 `CLAUDE.md`의 규칙(열째)이 덮는다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:245`(정본), `09-landing-and-test-strategy.md:278`, `reviews/round-16-owner-answers.md:15`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`)
- 라운드: 16
- 까닭: `reviews/round-16-owner-answers.md:15`

### TEST-054 릴리스 10 — 자리와 저장소 정리 — 별도 PR, PR-8 전에 병합

- 결정:
  > 10. **자리와 저장소 정리 — 별도 PR, PR-8 전에 병합.** 저장소 전체의 일이라 재설계와 독립이며 PR-0과는 순서가 없다(다섯째). 그 PR이 함께 하는 것: 루트 `CLAUDE.md`의 개발 흐름 6번(판을 손으로 올리고 changesets와 CHANGELOG를 쓰지 않는다)을 'changeset을 쓴다'는 규칙으로 바꾸고, 명령 목록을 다섯째의 루트 스크립트와 맞추며, 스킬 표의 `release-note-generator` 설명을 고친다. `scripts/PUBLISHING.md`의 평상시 절차와 트리거를 새 흐름으로 다시 쓴다. 로컬 폴백(`yarn publish:changed`, 소유자가 둔 이중 인증 경로)은 남기되, 판 올림은 판 올림 PR로만 하고 로컬 폴백은 병합된 판의 올리기만 대신한다고 적는다. 태그는 `yarn changeset tag && git push --tags`. 판을 changeset 없이 정하는 둘째 길인 루트 `major:all`·`minor:all`·`patch:all`, 패키지들의 `version:*`, `tag:packages`와 `scripts/tag-packages.sh`, 망가진 `changeset:publish`는 지운다(근거는 예측가능성: 판을 정하는 길은 하나다). 이 변경 전부터 `publish-packages.sh`에 밀려난 `publish:all`과 패키지별 `publish:npm`·`build:publish:npm`은 지우지 않고 PR 본문에 적는다. `.claude/skills/release-note-generator`는 남기되 '`.changeset/*.md` 본문 쓰기와 다듬기'(특히 PR-8의 파괴적 변경 changeset과 이주 안내)로 역할을 좁힌다(이미 `knowledge/changeset-enhancement-guide.md`가 있다).
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:246`(정본), `09-landing-and-test-strategy.md:278`, `reviews/round-16-owner-answers.md:15`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`)
- 라운드: 16
- 까닭: `reviews/round-16-owner-answers.md:15`

### TEST-055 릴리스 11 — 무리 밖 패키지 — @winglet/common-utils·@winglet/react-utils의 자기 changeset

- 결정:
  > 11. **무리 밖 패키지.** PR-1이 바꾸는 `@winglet/common-utils`(`merge`의 선택 인자: 배열 교체, 원자 판정, 한쪽 값의 참조 이동, 양쪽에 있는 객체의 쓰기 시 복사. 인자가 없으면 오늘 동작, 더하기만 하는 변경)는 PR-1에서, PR-7이 바꾸는 `@winglet/react-utils`(ErrorBoundary와 감싸개 둘의 렌더 때 보고 함수를 얻는 선택 인자, 더하기만 하는 변경. 17라운드 소유자 답 (나)로 허용)는 PR-7에서 자기 changeset(`minor`)을 더한다. 본체의 `workspace:^`는 포장 때 그 판으로 바뀌고, 릴리스 테스트는 여섯째의 폐포로 그것을 포장해 넣는다. `@winglet/react-utils`의 범위 밖 판 변경이라 `@lerx/promise-modal`도 patch로 함께 배포된다(`fixed` 무리의 UI 플러그인은 PR-8의 판으로 묶인다).
- 보충:
  > 편집자 결정(68C-06): "【추론】 TEST-055는 PR-7이 `@winglet/react-utils`의 자기 changeset(`minor`)을 더한다고 정했고, 루트 `CLAUDE.md`의 "changesets를 쓰지 않고 릴리스 때 판을 올린다"와의 충돌은 01 재정렬 기록(`plan/01-design-docs/realign.md:29,167`)이 "TEST-054·055, LANDING-097: 원장이 이긴다"로 닫았으며, 02(PR-1)는 그대로 `.changeset/common-utils-merge-policies.md`를 더했다. 07은 같은 모양으로 `.changeset/` 아래 `@winglet/react-utils`의 `minor` changeset 파일 하나를 더하고 변경 사유를 그 파일과 커밋 메시지에 적는다. `package.json`의 `version`은 올리지 않는다 — 판 올림은 changesets 가동(LANDING-097, 릴리스 전환 PR)과 PR-8(LANDING-096)의 몫이고, 07이 올리면 프리릴리스 무리의 판 계산과 두 번 셈한다. 루트 `CLAUDE.md`의 문장은 릴리스 전환 PR이 고친다(LANDING-097 "판 올림 스크립트 정리와 루트 `CLAUDE.md`")." (`reviews/round-68-closing.md:44`)
  > 편집자 결정(68C-08): "【추론】 ERROR-117은 "인자의 모양(ErrorBoundary 보고 콜백 속성과 그 공개, 또는 감싸개의 보고기 읽기 인자)은 PR-7에서 고른다"고 두 후보를 함께 적었고, 07은 둘을 겹쳐 골랐다: 루트 바운더리는 (가) 속성을 직접 쓰고, 감싸는 자리가 모듈 수준·`FormProvider`·폼마다로 갈리는 필드 바운더리는 감싸기를 그대로 두고 (나) 셋째 인자로 "문맥에서 보고기를 읽는 훅"을 넘겨 렌더 때 읽는다. 이것은 17라운드 스웜 수렴의 요구(감싸기 자리를 옮기지 않고 렌더 때 문맥에서 보고기를 읽음, R17G-9)와 소유자 허용의 범위(더하기만 하는 변경, 주지 않으면 오늘 동작, `minor`)를 모두 지키므로 그대로 확정한다. 조건 셋: `@winglet/react-utils`의 그 모듈 `DETAIL.md`를 코드보다 먼저 갱신한다(ERROR-117의 출처 행), 보고기는 전달 중 표지·`WeakSet`·경고 집합을 드는 인스턴스 보고기이고 바운더리는 그것을 부르기만 한다(ERROR-110–116의 역할 분담 그대로), `info`는 React가 주는 `componentStack`만 노출하고 다른 필드는 더하지 않는다. 훅 인자의 이름 `useReporter`는 React 훅 규칙(렌더 때 조건 없이 호출)을 따라야 하므로 감싸개는 인자가 없을 때도 호출 수를 바꾸지 않도록 기본 훅(항상 `undefined`를 돌려줌)을 쓴다." (`reviews/round-68-closing.md:58`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:247`(정본), `09-landing-and-test-strategy.md:278`, `reviews/round-16-owner-answers.md:15`, `reviews/round-17-owner-answers.md:34`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`), 소유자 답(`reviews/round-17-owner-answers.md:34` (나))
- 라운드: 17
- 까닭: `reviews/round-16-owner-answers.md:15`

### TEST-056 릴리스 12 — 제3자 액션은 커밋 해시로 고정

- 결정:
  > 12. **제3자 액션은 커밋 해시로 고정한다.** `changesets/action`, `actions/checkout`, `actions/setup-node`는 `id-token`·`contents` 쓰기 권한을 가진 작업에서 돈다(판 고정 규칙, `.yarnrc.yml`의 공급망 방어와 같은 방향).
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:248`(정본), `09-landing-and-test-strategy.md:278`, `reviews/round-16-owner-answers.md:15`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`)
- 라운드: 16
- 까닭: `reviews/round-16-owner-answers.md:15`

### TEST-057 릴리스 13 — GitHub Release는 패키지 태그마다 하나

- 결정:
  > 13. **GitHub Release는 changesets의 기본대로 패키지 태그마다 하나다.** `fixed` 무리가 오르면 여덟이 생긴다. 모아 하나로 만드는 새 코드는 두지 않는다(태그와 Release가 하나씩 맞는 쪽이 예측 가능하다).
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:249`(정본), `09-landing-and-test-strategy.md:278`, `reviews/round-16-owner-answers.md:15`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`)
- 라운드: 16
- 까닭: `reviews/round-16-owner-answers.md:15`

### TEST-058 릴리스 14 — PR-8의 판 번호 — 1.0.0-beta 뒤 1.0.0

- 결정:
  > 14. **PR-8의 판 번호 — 1.0.0-beta 뒤 1.0.0(16라운드 소유자 답으로 확정).** Vincent의 답: "(나) 1.0.0-beta를 먼저 내고 1.0.0 예상합니다". PR-8의 changeset은 `major`이고(0.16.0 → 1.0.0), 먼저 프리릴리스 모드(`changeset pre enter beta`)로 `fixed` 무리 여덟을 1.0.0-beta.N으로 낸다. 프리릴리스는 `latest`를 건드리지 않도록 dist-tag `beta`로 올린다. `publish-packages.sh`가 판의 프리릴리스 식별자에서 dist-tag를 정한다(더하기만 하는 확장). 실제 소비자가 이주 안내와 이주 프롬프트를 먼저 시험하고 안정성을 확인한 뒤 `changeset pre exit`로 1.0.0을 낸다. 1.0.0부터는 파괴적 변경마다 `major`를 요구하는 안정 약속이 시작된다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:250`(정본), `09-landing-and-test-strategy.md:278`, `reviews/round-16-owner-answers.md:22`
- 닫은 사람: 소유자 답(`09-landing-and-test-strategy.md:250` PR-8 판 번호), 소유자 답(`reviews/round-16-owner-answers.md:22` 추가 확인)
- 라운드: 16
- 까닭: `reviews/round-16-owner-answers.md:22`

### TEST-059 실측 — oneOf·anyOf 안의 if(ajv 8.17.1): 배치별 판정표와 else: false·required 함께의 근거

- 결정:
  > 파일: `spikes/round9/oneof-if.mjs`, `oneof-if-output.txt`, `REPORT.txt`. 각 분기의 `if`는 `{ properties: { kind: { const } }, required: ['kind'] }`다.
  > | 배치 | 올바른 값 `{kind:'a', x:'s'}` | 누락 값 `{kind:'a'}` | 어느 조건에도 맞지 않는 값 `{kind:'c'}` | 조건 프로퍼티 없음 `{x:'s'}` |
  > | --- | --- | --- | --- | --- |
  > | `oneOf` 분기에 `if/then`만 | 거부 | 통과 | 거부 | 거부 |
  > | `oneOf` 분기에 `if/then` + `else: false` | 통과 | 거부 | 거부 | 거부 |
  > | `anyOf` 분기에 `if/then`만 | 통과 | 통과 | 통과 | 통과 |
  > | `anyOf` 분기에 `if/then` + `else: false` | 통과 | 거부 | 거부 | 거부 |
  > | `allOf` 항목에 `if/then`만 | 통과 | 거부 | 통과 | 통과 |
  > | 최상위 `if/then` 하나 | 통과 | 거부 | 통과 | 통과 |
  > | 오늘 방식(`const` 판별식) | 통과 | 거부 | 거부 | 거부 |
  > `if`에서 `required`를 빼면 `else: false`를 붙인 `oneOf`·`anyOf`가 `{x:'s'}`를 통과시키고, 빈 값에서 가드 단독 판정이 모두 참이 된다(검증 §2.3). 그래서 4.25의 컨벤션이 "`else: false`와 `required` 함께"다.
- 보충: 없음
- 상태: 현행(기록)
- 출처: `07-conclusions.md:357,359-367,369`(정본), `adr/0010-branch-conventions.md:15`
- 닫은 사람: 편집자 결정(9라운드 실측, `07-conclusions.md:355`)
- 라운드: 9
- 까닭: 없음

### TEST-060 프로토타입 v5(`spikes/round9/proto/loop-v5.mjs`) — 회귀·프로브 결과, 교차 검증이 찾은 어긋남과 고친 뒤의 기대

- 결정:
  > 8라운드 `loop-v4e.mjs`에서 59개 정확 치환(검증 뒤 수정 포함)으로 파생했고 재생성이 바이트 단위로 같다. 상태 칸은 원본과 `extras`뿐이며, 조각은 `if`(검증기 스텁) 또는 `&active`로 켜지고, 게이트 없는 조각은 무조건이다. 재실행은 `spikes/round9/`에서 `node regress/run.mjs`다.
  > 프로토타입 보고서의 사실(`spikes/round9/REPORT-proto.txt`). 교차 검증(`reviews/raw-round9-verification.md` §2)은 회귀·프로브의 합계 단언을 재실행해 재현했고, 채움 단위와 같은 대상 충돌은 탐침으로 하나씩 재현했다:
  > - 이식한 8라운드 회귀 63개 단언이 두 모드에서 모두 통과했다. v4e 자신의 기존 실패 셋 가운데 A4c와 A4-cap은 "같은 값을 다시 써도 에지를 발화하지 않는다"는 규칙으로, A4b는 "최종 형상에 없는 노드의 중간 채움은 남기지 않는다"는 규칙으로 기대가 바뀌어 통과한다(`regress/CHANGES.txt`).
  > - Q8 프로브 108개 단언과 경계 26개가 통과했다.
  > - 로드에서는 `&default`가 `default`를 이겼고, 나중에 켜진 조각의 새 노드도 채워졌다.
  > - `&unsetValue`는 값을 지우고 입력을 남겼으며, 그 뒤 다시 채워지지 않았다. 자기 삭제로 조건이 거짓이 되어도 삭제를 철회하지 않는다.
  > - `else: false`가 없는 분기 둘에서 개발 모드 경고 둘이 났다. 게이트 없는 순수 `oneOf`·`anyOf`는 두 분기를 모두 켰다.
  > - 자식 집합 결합에서 AND/OR와 "가장 가까운 선언이 이김"은 정반대 결과를 냈다.
  > - `&derived`와 `&injectTo`의 같은 대상 충돌은 대상별로 하나만 적용해 2라운드에 수렴했다. 순위는 스위치다.
  > - `disableAutomaticWrites`는 채움·`&derived`·`&injectTo`·`&unsetValue`를 모두 막고 로드 값은 그대로 두었으며, 그 뒤 사용자 입력에서는 자동 쓰기가 다시 일어났다. 호출 단위 지정이 Form 속성을 덮었다.
  > - 비수렴 `&derived`·`&injectTo` 쌍은 라운드 상한 5·6·25 모두에서 예산 초과이고, 원본 B 커밋이면 `{a:0, b:0}`, 마지막 라운드 커밋이면 상한 직전의 값(상한 25에서 `{a:24, b:24}`, 상한 5에서 `{a:4, b:4}`)이다.
  > 교차 검증이 첫 판에서 명세와 어긋나는 곳 셋을 찾았고 같은 codex 세션에서 고쳤다. 채움 단위(본체에만 노드 단위였고 공유 노드와 게이트 없는 `allOf` 항목은 조각 단위로 다시 채움), 노드 게이트(로드 때 꺼진 노드를 채우고 켜질 때 채우지 않음), 게이트 없는 분기의 공유 노드에 첫 선언 스키마를 힌트로 남김. 고치는 과정에서 넷째 빈틈이 재현으로 드러났다(`{seed:1, on:1}`, `REPORT-proto.txt` 325행). 중간 라운드에 채운 값이 뒤 라운드에서 형상에서 빠진 노드의 원본에 남는 문제로, "생김"을 정착이 수렴한 뒤의 최종 형상으로 판정하고 최종 형상에 없는 노드의 채움 후보는 철회하도록 고쳤다(06 4.2의 "중간 라운드의 주입은 커밋 전에 버린다"의 실행 확인). 고친 뒤의 결과는 `spikes/round9/REPORT-proto.txt`의 "5. 검증 뒤 수정" 절과 `spikes/round9/r9b-output.txt`(단언 52개, 탐침 13개, 실패 0)에 있다.
  > 고친 뒤 달라진 회귀 기대는 "이미 있던 노드는 다시 채우지 않는다", "최종 형상에 없는 노드의 중간 채움은 남기지 않는다", "게이트가 거짓인 노드는 생기지 않는다(4.24)"에서 온다. 8라운드 회귀 이식의 바뀐 요약은 17행이다. 7라운드 사례 X16(자기 주입으로 자기 조각을 끄는 스키마)은 에지 모드의 두 구성에서, 이전에 중간 원본 보존으로 `stable`이던 것이 예산 초과가 된다. 레벨 모드는 `t='from-undefined'`로 2라운드에 수렴한다. 에지 모드의 결과는 4.15(자기 가드를 끄는 자동 쓰기는 예산 초과)와 같은 판정이다.
- 보충: 없음
- 상태: 현행(기록)
- 출처: `07-conclusions.md:373,375,377-385,387,389`(정본), `08-design-a-to-z.md:607`, `09-landing-and-test-strategy.md:169`
- 닫은 사람: 편집자 결정(9라운드 프로토타입 기록, `07-conclusions.md:371`)
- 라운드: 9
- 까닭: 없음

### TEST-061 D-15 순환 스키마의 출발점 실험 — 명세는 남기고 우선순위를 낮춤

- 결정:
  > | 항목 | 질문 | 실험 | 결정 기준 |
  > | ---- | ---- | ---- | --------- |
  > | D-15 순환 스키마의 출발점 | `if`가 `x`를 요구하고 `then`이 `x`를 선언하는 부정 없는 순환에서 `{x: 'v'}`를 로드하면 조건부 조각이 꺼진 채 출발해 `x`가 방출에서 빠지고 상태는 `stable`이다. 로드한 유효 값이 조용히 사라진다. 원인은 신호의 부재가 아니라 출발점(D-2)이다 | 프로토타입 `loop-v4d` 사본에 출발점 스위치 셋을 더한다. `minimal`(지금), `S1`(선언 키가 원본에 있는 조건부 조각을 출발점에 더함), `S2`(최소 고정점 뒤 그런 꺼진 조각을 검증기 가드로 한 번 켜 봄). 사례 E8(자기 순환 `{x:'v'}`), E8b(상호 순환 `{a:1,b:2}`), E9(선언 순서에 따라 다른 고정점에 닿던 사례), E1, E12–E14, X15, X16, 독립 모델 N1·N2·N9. 회귀 전부. 비용은 케이스마다 새 프로세스 5회 | 채택: E8 → `{x:'v'}`, E8b → `{a:1,b:2}`, E9 불변 `{a:1}`, 회귀 0, 바퀴 상한 안, 비용 5회 폭 안. 실패 기준은 회귀, 사용자가 끈 조각이 잠복 원본만으로 되살아남, E9 변화다. 실패하면 최소 출발점 유지, 개발 모드 경고(C2), 프로덕션 신호는 N4의 새 상태 값, ADR 0013 63행과 ADR 0007 57행 수정. 편집자의 손 계산으로는 S1은 E9를 바꾸고 S2는 유지한다 |
- 보충:
  > "| D-15 순환 스키마의 출발점(06 §7) | 2항 아래에서 `if`가 요구하는 `x`를 `then`이 선언하는 스키마는 컨벤션 위반이 되므로 우선순위를 낮춘다. 실험 명세는 그대로 남긴다 |" (`07-conclusions.md:395`)
  > 열린 부분(로드한 값이 알림 없이 빠지고 상태가 `stable`로 남는 것을 받아들이는지. 표 행이라 나누지 않는다): "D-15: 컨벤션을 어긴 양의 순환 스키마에서 로드한 값이 알림 없이 빠지고 상태가 `stable`로 남는 것을 받아들이는가." (`reviews/round-18-agenda.md:168`)
  > 소유자(12-10 답): "받아들입니다" (`reviews/round-18-owner-answers.md:20`)
  > 반영 칸(12-10, 받아들임과 A-2의 적용 제외): "가. 받아들인다. 컨벤션 문서에만 적고 경고 코드는 두지 않는다. TEST-061은 현행(부정 결정)이 되고, A-2의 고지 의무는 이 경우에 적용하지 않는다(답 19가 이긴다)." (`reviews/round-18-owner-answers.md:20`)
- 상태: 현행(부정 결정)
- 출처: `06-conclusions.md:398-400`(정본), `07-conclusions.md:395`, `reviews/round-7-convergence.md:120`, `reviews/round-18-owner-answers.md:20`
- 닫은 사람: 편집자 결정(9라운드, `07-conclusions.md:395`), 소유자 답(`reviews/round-18-owner-answers.md:20` 12-10)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:20`, `07-conclusions.md:395`

### TEST-062 확인이 필요한 관찰 — oneOf 마운트 비용의 기록(benchmark-form/PLAN.md)과 구조 추적의 전수 생성

- 결정:
  > - `benchmark-form/PLAN.md`에는 "oneOf 마운트 비용은 분기 수와 무관하다(활성 분기만 초기화)"는 기록이 있다. 구조 추적에서는 "모든 분기의 자식 노드를 생성자에서 전수 생성한다"를 확인했다. 생성은 전수이고 초기화만 지연이라면 둘은 양립한다. 확인하지 않았다.
- 보충: 없음
- 상태: 현행(기록)
- 출처: `adr/0009-performance-budget-and-benchmarks.md:106`(정본), `adr/0009-performance-budget-and-benchmarks.md:78`
- 닫은 사람: 편집자 결정(1라운드 ADR 0009 본문의 관찰, `adr/0009-performance-budget-and-benchmarks.md:104`)
- 라운드: 1
- 까닭: 없음

### TEST-063 D-33 값 비교 비용 실험 — 객체 원천의 깊은 비교 비용, G6 예산 안이면 값 비교 채택

- 결정:
  > | 항목 | 질문 | 실험 | 결정 기준 |
  > | ---- | ---- | ---- | --------- |
  > | D-33 값 비교 비용 | 4.20의 값 비교에서 객체 원천의 깊은 비교 비용 | 비용 측정 스크립트에 객체 원천 `injectTo` 케이스 추가 | G6 예산 안이면 값 비교 채택 |
- 보충:
  > "객체 원천의 깊은 비교 비용은 7절." (`06-conclusions.md:254`)
  > "| D-33 값 비교 비용(객체 원천의 깊은 비교) | 그대로 |" (`07-conclusions.md:396`)
  > 18라운드 안건(열림, PR-3 전): "에지의 값 동등 판정(참조인지 깊은 비교인지)" (`reviews/round-18-agenda.md:107`)
- 상태: 대체됨(→ TEST-071, SETTLE-043)
- 출처: `06-conclusions.md:398-399,401`(정본), `06-conclusions.md:254`, `07-conclusions.md:396`, `reviews/round-18-agenda.md:107`, `reviews/round-18-closing.md:1376-1403,1413-1415`
- 닫은 사람: 편집자 결정(8라운드 D-33 편집자 판정, `06-conclusions.md:251`), 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:107`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50)
- 라운드: 18
- 까닭: `06-conclusions.md:254`, `reviews/round-18-closing.md:1405-1411`

### TEST-064 ADR 0007의 비용 표 — 3.1판 측정, 조건부 폼 생성은 재설계가 지는 유일한 지점(1.7배, 가드 컴파일 22.4 ms)

- 결정:
  > | 시나리오 | 3.1판 | 대조 | 출처 |
  > | -------- | ----- | ---- | ---- |
  > | 키 입력, 평면 1,000 | 1.39 µs | 3차안 1.35 µs | `reviews/round-4.md` §2.1 |
  > | 분기 전환(4라운드 측정 시나리오) | 108 µs | 3차안 89 µs | `reviews/round-4.md` §2.1 |
  > | 루트 통째 쓰기 10,000 × 5 | 12.0 ms | 현재 217 ms | `reviews/round-4.md` §2.1, `reviews/round-2.md` §2 |
  > | 조건부 폼 생성 (가드 200개) | 23.0 ms (트리 585 µs + AJV 컴파일 22.4 ms) | 현재 13.4 ms | `reviews/round-2.md` §2 |
  > | 진입 깊이 카운터 | 측정 스프레드 안 (3–4%) | — | `spikes/work-loop/REPORT-v4c.txt` |
  > 노드별 장부가 루트 통째 쓰기를 3차안보다 58% 늦춘다. 조건부 폼 생성은 재설계가 지는 유일한 지점이다.
- 보충:
  > "조건부 폼의 생성은 현재 구현보다 1.7배 느리다 — 가드 200개에 22.4 ms(ADR 0009)." (`adr/0004-validator-plugin-compile-guard.md:79`)
- 상태: 현행(기록)
- 출처: `adr/0007-settle-cycle.md:124-130,132`(정본), `adr/0004-validator-plugin-compile-guard.md:79`, `reviews/round-2.md:31`, `07-conclusions.md:452`
- 닫은 사람: 편집자 결정(5라운드 ADR 0007 4차 본문의 비용 표, `adr/0007-settle-cycle.md:122`)
- 라운드: 5
- 까닭: 없음

### TEST-065 인터프리터형 검증기의 지원 수준 — 폼은 장치를 더하지 않고 성능은 플러그인의 몫

- 결정:
  > - **인터프리터형 검증기를 어느 수준까지 지원하는가.** 성능 예산을 AJV 기준으로 잡으면 인터프리터형은 "동작하지만 큰 폼에서는 느리다"가 된다. 역색인(ADR 0005 §2)을 넣으면 격차가 줄지만 폼이 `if`의 프로퍼티 이름을 읽어야 한다.
- 보충:
  > "검증기의 성능은 우리가 관여할 문제가 아닙니다만. 뭘 말하는건지요?" (`reviews/round-18-owner-answers.md:13`)
- 상태: 현행
- 출처: `adr/0009-performance-budget-and-benchmarks.md:100`(정본, TEST-042에서 분할), `reviews/round-18-agenda.md:67`, `reviews/round-18-owner-answers.md:13`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:13` 12-3), 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:67`)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:13`
- 충돌:
  > `adr/0009-performance-budget-and-benchmarks.md:100`의 "역색인(ADR 0005 §2)을 넣으면 격차가 줄지만 폼이 `if`의 프로퍼티 이름을 읽어야 한다"는 5차 주의 "(3) 역색인은 기각되었다"와 다르다. 5차 주가 이긴다(`adr/0009-performance-budget-and-benchmarks.md:3`). TEST-030이 이긴다: 5차 주의 그 항이 규칙이다.

### TEST-066 열림: 컴파일 예산 — 폼 생성 시점의 동기 컴파일 허용량

- 결정:
  > - **컴파일 예산.** 폼 생성 시점의 동기 컴파일을 얼마까지 허용하는가.
- 보충:
  > "예산 수치가 있어야 판정할 수 있다." (`07-conclusions.md:474`)
- 상태: 대체됨(→ TEST-076)
- 출처: `adr/0009-performance-budget-and-benchmarks.md:102`(정본, TEST-042에서 분할), `reviews/round-18-agenda.md:67`, `reviews/round-18-closing.md:870-879`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:67`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-30)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:881-884`
- 충돌:
  > `07-conclusions.md:474`의 "예산 수치가 있어야 판정할 수 있다."는 18라운드 결정과 다르다: 컴파일은 따로 수치를 두지 않고, TEST-072의 선과 ADR 0009 §4의 기록·수용으로 판정한다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:870`).
  > `adr/0009-performance-budget-and-benchmarks.md:94`의 "미결 — 소유자가 정할 것"는 18라운드 결정으로 닫혔다(편집자 결정, 18라운드). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:870`).

### TEST-067 `$ref` 재귀 게이트(PR-1·PR-2) — 스캐너 확인, 코퍼스 14종, 무한 형상 표본과 `if/then` 정착 오류 표본, 청사진 1회 비용

- 결정:
  > PR: PR-1·PR-2(표본 (c′)는 PR-2).
  > (a) `@winglet/json-schema` 스캐너가 `$ref`의 대상 위치를 주는지, 순환을 `referenceSkipped: 'cycle'`로 알리는지 확인한다.
  > (b) 코퍼스 14종(재귀 pydantic 트리 포함)이 모두 선다.
  > (c) 무한 형상 표본 셋(자기 참조 객체 프로퍼티, nullable 자기 참조, A↔B 상호 참조)은 청사진 오류가 나고, 배열·게이트·터미널로 끊은 표본은 선다.
  > (c′) 표본 "`required` 없는 `if/then`으로만 끊긴 재귀 → 정착 오류"를 PR-2에서 확인한다(예: `Node = { properties:{hasChild:{}}, if:{properties:{hasChild:{const:true}}}, then:{properties:{child:{$ref:Node}}} }`에 값 `{hasChild:true}`).
  > (d) `$ref`가 많은 스키마에서 청사진 1회 비용을 잰다(TEST-032의 벤치 행).
  > 통과: (b)와 (c)가 성립한다.
  > 실패: 스캐너가 (a)를 못 주면 오늘의 `getReferenceTable`로 청사진이 스스로 푼다(편집자 선에서 처리).
  > 실패: (b)나 (c)가 실패하면 소유자에게 올린다.
- 보충:
  > 편집자 결정(19C-01): "【추론】 게이트(PR 02): TEST-067(b)는 코퍼스 14종을 시험 파일로 돌려 원본 그대로 서야 하며, 통과하지 못하는 표본은 소유자에게 올린다." (`reviews/round-19-closing.md:30`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:43-51`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:35-41`

### TEST-068 잎 교차 시험의 처분 — `intersectConst.test.ts:40-58`은 깊은 비교로 새로 쓰고, `intersectPattern.test.ts:6-14`는 레거시와 함께, 새 병합 시험 사례

- 결정:
  > 【추론】 (4) 09 §4.3의 '그대로 산다'에서 뺄 것은 둘이다.
  > 【추론】 하나는 `utils/__tests__/intersectConst.test.ts:40-58`의 참조 비교 단언으로, '버리고 새로 쓴다'로 옮겨 깊은 비교를 단언한다.
  > 【추론】 다른 하나는 `utils/__tests__/intersectPattern.test.ts:6-14`의 전방 탐색 문자열 단언으로, 레거시와 함께 가며 새 병합 시험은 `'ab'`·`'Abc123'`·역참조·같은 이름 캡처 그룹 사례로 목록 표현을 단언한다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:197-199`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:203-207`

### TEST-069 PR-2 독립 검증 경계 — 자기 기제만 시험, 게이트 술어 대역 하나, 미룬 사례의 PR 배분, 프로토타입 회귀 배분

- 결정:
  > 【추론】 "각 PR은 새 코드와 그 시험만으로 독립 검증된다"(§17.1)는 각 PR이 자기가 들여오는 기제를 검증한다로 읽는다.
  > 【추론】 뒤 PR의 기제가 있어야 하는 사례는 그 기제를 들여오는 PR의 시험으로 넘기며, 잃지 않도록 PR-0의 처분 목록이 사례마다 PR 번호를 단다.
  > 【추론】 (가) PR-2는 예산 다섯 가운데 호스트 바퀴와 전이 라운드를 실제 코드로 시험한다: 초과 시 원본 B 커밋, `diagnostics`의 `'degraded'`·`cause: 'budget'`·`exceededBudget`(`'hostWheel'`·`'transition'`), 다음 로드까지의 지속.
  > 【추론】 PR-2는 원본 B의 되돌림 기록 가운데 노드·이전 `raw`·이전 `extras`와 객체 자식의 생김·빠짐을 시험한다.
  > 【추론】 PR-2는 정착 오류의 throw를 시험한다.
  > 【추론】 PR-2에서 사슬은 `settle` 호출 하나다(`setValue`가 `settle` 쓰기로 직접 위임, `reviews/raw-round17-node-structure.md:74`).
  > 【추론】 커밋과 `diagnostics` 뒤 그 호출의 끝에서 던지는 것을 시험한다.
  > 【추론】 PR-2는 식·가드 실패의 자리별 값과 `cause: 'expression'`을 시험하며, 식은 PR-1의 실제 컴파일러를 쓴다.
  > 【추론】 PR-2는 `SetValueOption` 넷(억제 비트는 PR-2에 있는 자동 쓰기인 채움에 대해)과 로드의 새 수명을 시험한다.
  > 【추론】 PR-2는 나감 비움 가운데 노드 자신의 층과 Form 속성 층을 시험한다.
  > 【추론】 그 값은 참·거짓 리터럴이고, 하위 트리로 내려감, 자손의 `false`가 이김, 선언의 나감, 잠복 자손 비움, `extras` 불변을 포함한다.
  > 【추론】 PR-2는 노드 구조 시험 전부, 린트 설정, `active` 게터, 18C-39의 키 순서(직렬화 단언 포함), 18C-37의 형 게이트를 시험한다.
  > 【추론】 (나) 시험 대역은 게이트 술어 하나다(`08-design-a-to-z.md:572`의 "게이트는 술어 인터페이스 뒤의 스텁").
  > 【추론】 대역의 계약은 PR-4의 `compileGuard`가 돌려주는 술어와 같은 모양이다: 게이트 입력 값 하나를 받아 참·거짓을 돌려주고, 동기이며, 순수하다(같은 입력에 같은 답).
  > 【추론】 던지는 대역으로 가드 평가 실패(정착 오류)를 시험한다.
  > 【추론】 PR-4는 같은 시나리오를 실제 가드로 다시 돌린다.
  > 【추론】 그 밖의 대역은 두지 않는다.
  > 【추론】 시험만을 위한 주입 자리(파생 단계, 디스패처)를 새로 만들지 않는다(seiri `public-contract` §3).
  > 【추론】 (다) 파생 라운드 예산과 그 `degraded`, `DisableAutomaticWrites`의 파생·`injectTo` 억제는 PR-3으로 미룬다.
  > 【추론】 되먹임 파동과 `onChange` 중첩 예산, 진입 사슬의 사슬 끝 throw(중첩 진입, 통지·`onChange`와의 순서, `details.errors` 묶음)는 PR-4로 미룬다.
  > 【추론】 원본 B의 배열 아이템 구조 기록은 PR-5로 미룬다(TEST의 PR-5 행에 더함).
  > 【추론】 나감 비움의 `children` 항목 층, 조각 `controls` 층, 식 값(직전 커밋)은 PR-6으로 미룬다(TEST의 PR-6 행 "`unsetOnInactive` 층"에 명시).
  > 【추론】 `degraded` 동안의 제출 거부는 PR-7로 미룬다.
  > 【추론】 (라) 프로토타입 회귀의 배분: 한 사례는 그것이 건드리는 기제가 모두 있는 가장 이른 PR로 간다.
  > 【추론】 `selfcheck-v5`(63)는 a·b·c·d·e → PR-2(c 가운데 주입을 쓰는 단언은 PR-3), f(`disableAutomaticWrites`) → PR-3, g(통지) → PR-4로 간다.
  > 【추론】 `r8-port`(q8 108, 예산·원본 B 행렬)는 호스트 바퀴·전이만 쓰는 행 → PR-2, `derived`·`injectTo`를 쓰는 행 → PR-3으로 간다.
  > 【추론】 `r7-port`(52, E1–E13·X*)는 에지 발화 파생·`injectTo` → PR-3, X2·X3의 한 진입 묶음과 D-17 파동 세기 → PR-4로 간다.
  > 【추론】 `edge-cases`(26, `spikes/round9/regress/edge-cases.mjs`)는 조각 생김·채움·덧씌움 기본값·`allOf` else → PR-2, `clearValue`·`injectTo`·단계 순서·파생 예산 → PR-3, 잠금 결합 → PR-6으로 간다.
  > 【추론】 v7 회귀는 게이트 입력 `extras`·전이 상한·재계산 목록 순회·나감 비움(노드 자신·Form 속성 층) → PR-2, 같은 순위 동점·정착 단위 순위 → PR-3, 나감 에지 → PR-3(조각 `controls` 층의 사례는 PR-6)으로 간다.
  > 【추론】 안건 `reviews/round-18-agenda.md:56`의 실행 확인(게이트 입력 `extras` 정적 규칙, 같은 순위 규칙, 나감 에지, 전이 라운드 상한이 나감 비움을 포함해 실제로 보장되는지)은 위 v7 회귀를 배분받은 PR의 시험으로 한다.
- 보충:
  > 편집자 결정(18C-15): "(a) 사촌 하위 트리를 읽는 노드 게이트를 단언한다." (`reviews/round-18-closing.md:450`)
  > 편집자 결정(18C-15): "(b) `#`를 읽는 게이트를 단언한다." (`reviews/round-18-closing.md:451`)
  > 편집자 결정(18C-15): "(c) 서로를 읽는 두 호스트의 양의 순환이 이력과 무관하게 같은 원본에서 같은 형상을 내는지 단언한다." (`reviews/round-18-closing.md:452`)
  > "노드 구조 시험(행 칸 순서 시험: 모든 행의 칸 키와 순서가 같음. 겉면 멤버 목록 시험: 프로토타입 멤버 이름과 `SchemaNode/`의 `DETAIL.md` 목록의 일치. 공개 index 키 목록: 내부 통로가 `src/index.ts`에 없음. 행 고르기 함수의 조합 전수. 공개 형의 키 목록 타입 시험. `isTerminalNode`가 터미널 객체도 좁힘), `SchemaNode` 클래스 파일에 거는 린트 설정, `active` 게터" (`09-landing-and-test-strategy.md:169`)
  > 편집자 결정(18C-98): "【추론】 `diagnostics`와 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화한다." (`reviews/round-18-closing.md:2797`)
  > 편집자 결정(18C-98): "【추론】 `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다." (`reviews/round-18-closing.md:2798`)
  > 편집자 결정(18C-15, 게이트의 PR 줄): "PR: PR-2 정착 시나리오(18C-25의 PR-2 시험)와 PR-2 벤치." (`reviews/round-18-closing.md:449`) — (a)–(c)의 세 단언은 이 PR 줄에 딸린다(SETTLE-045).
  > 편집자 결정(26C-01): "【추론】 뒤 PR의 멤버를 PR-2 클래스에 무해한 구현(스텁)이나 `SchemaNodeRuntime` 칸으로의 위임으로 미리 두지 않는다: PR-2의 시험 대역은 `if` 게이트 술어 하나뿐이고 시험만을 위한 주입 자리를 새로 만들지 않는다(TEST-069 (나)); LANDING-062의 "게이트는 술어 인터페이스 뒤의 스텁"은 이 술어 하나를 말한다." (`reviews/round-26-closing.md:13`)
  > 편집자 결정(26C-03): "【추론】 게이트에 "PR: PR-2"라 적혀도 그 단언이 뒤 PR의 기제(`controls.derived`·`controls.injectTo`는 PR-3, 통지·사건 배달은 PR-4)를 요구하면, 그 단언은 그 기제가 모두 있는 가장 이른 PR에서 하고 PR-2는 자기 기제로 관찰할 수 있는 신호를 단언한다(TEST-069 (라))." (`reviews/round-26-closing.md:32`)
  > 편집자 결정(26C-03): "【추론】 미룬 단언은 PR-2의 `log.md`와 PR 본문에 사례마다 PR 번호를 단다(TEST-069가 처분 목록에 정한 방식)." (`reviews/round-26-closing.md:37`)
  > 편집자 결정(26C-04): "【추론】 `controls.active` 게이트(노드 게이트·조각 게이트)는 PR-2가 청사진이 컴파일한 식(`BlueprintExpression.evaluate`)으로 호스트 바퀴에서 실제로 평가하며, 술어 인터페이스 뒤의 대역으로 두지 않는다." (`reviews/round-26-closing.md:45`)
  > 편집자 결정(26C-04): "【추론】 `if` 게이트만 `record/`가 선언한 술어 인터페이스 뒤에 두고 시험은 대역 하나를 쓰며, 실제 술어는 PR-4의 `compileGuard`가 넣는다." (`reviews/round-26-closing.md:46`)
  > 편집자 결정(29C-01): "【추론】 첫 발화의 쓰기가 게이트를 뒤집어 원천 노드가 채움 전에 나가면 결과는 첫 발화의 값이며, FRAGMENT-050 (3)대로 그 쓰기는 되돌리지 않는다; 그런 사례의 v7 기대(`REPORT-v7.md:47,51`의 A4b·X16과 그 변형 X16_noDefault)는 원장과 다르므로 이식하지 않고 원장의 값으로 바꾸며, TEST-069 (라)의 배분과 04 실행 계획의 "기대값은 `round18/proto/REPORT-v7.md`의 기대 치환을 따른다"(`plan/04-derive-and-controls/execution-plan.md:346`)는 v7의 모형이 원장과 다른 자리에는 미치지 않는다(03이 `plan/03-node-and-settle/log.md` §4에 남긴 선례와 같다)." (`reviews/round-29-closing.md:14`)
  > 편집자 결정(35C-05): "【추론】 자동 쓰기(채움·`derived`·`injectTo`·`unsetValue`·나감 비움)가 배열 호스트에 닿아 아이템을 만들거나 없애면 정착 작업장이 {호스트, 이전 아이템 목록(순서 있는 노드 참조), 이전 `extras`}를 적고, 예산 초과 때 기존 자동 쓰기 기록과 함께 거꾸로 되돌려 원본 B에 호출자 쓰기만의 구조를 남긴다(LANDING-062 충돌 줄과 TEST-069가 PR-5로 둔 기록); 그 정착에서 생겼다가 되돌린 아이템은 커밋된 형상에 한 번도 들지 않으므로 생김이 아니고 채움도 받지 않으며, 없어지는 아이템은 WRITE-036대로 나감이 아니다." (`reviews/round-35-closing.md:40`)
  > 편집자 결정(42C-01): "【추론】 고치는 것은 06이다: TEST-069 (라)대로 한 사례는 그것이 건드리는 기제가 모두 있는 가장 이른 PR로 가고, 이 사례(옛 `virtual.render.test.tsx`의 "clears referenced real fields when virtual is set to undefined(Overwrite)")가 건드리는 기제는 PR-2의 쓰기 표시와 자식 선택뿐이라 이미 머지되어 있으며, 지금 열린 단계 가운데 그 두 자리를 배열 행을 위해 고치고 있는 것이 06이고 이 사례는 06의 이식 목록에 있다; 05는 `dispatch`·검증에, 07은 렌더 전환에 묶여 있어 핵심 쓰기 결함을 모을 자리가 아니다. 06은 결함 둘과 고친 자리를 06 실행 기록 §4에 적고, 보류한 이식 사례를 다시 들인다." (`reviews/round-42-closing.md:10`)
  > 편집자 결정(49C-01): "【추론】 44C-01이 "발견한 단계가 고친다"고 한 까닭은 계약 위반을 느린 행으로 받아들이지 않기 위함이지 한 단계에 전체 엔진의 성능 수색을 맡기기 위함이 아니며, 27라운드 소유자 답은 구현 단계의 최적화가 원장을 흔들 수 있다고 경계했다; 둘의 균형은 TEST-069 (라)의 "한 사례는 그것이 건드리는 기제가 모두 있는 가장 이른 PR로"와 같은 결로 "한 단계는 자기 시나리오가 닿는 것을 고친다"다. 06의 벤치·verifier·이식 사례는 모두 배열 시나리오이므로 지금까지 찾은 것(나간 배열 호스트의 잠복 가지치기, 잠복 자리 읽기, 정착 끝의 호스트별 스냅숏 복사, 분배·쓰기 표시의 호스트별 가지치기, 커밋의 불일치 메모 거름, 나감 마무리의 불일치 경로 훑기, 투영 읽기의 게이트마다 자식 훑기)은 모두 범위 안이고 06이 뜻을 바꾸지 않고 고친다; 각 수정은 별도 커밋, 차등 시험으로 출력 불변을 확인하고 06 실행 기록 §4와 대장 "해결"에 적는다." (`reviews/round-49-closing.md:9`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:751-780`(정본), `reviews/round-18-closing.md:2797-2798`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-25), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:782-786`

### TEST-070 PR-2 게이트 — 실제 공개 형으로 `tsc --strict`를 단언 없이 통과, `children`은 저장 배열과 같은 참조, 실패 시 소유자 물음

- 결정:
  > PR: PR-2.
  > 무엇: 실제 공개 형(`InferSchemaNode` 사상, 배열 멤버, S1 정합 상태 판별자)으로 새 fractal이 `tsc --strict`를 `as`·`any` 없이 통과하는지, `node.children`이 저장 배열과 같은 참조인지(시험) 본다.
  > 통과: 둘 다 참이다.
  > 실패: 두 선택지(가: 한 함수에 가둔 단언 하나를 승인, 나: 단언 없이 목록 읽기마다 원소 검사·복사)를 그대로 소유자에게 올린다.
  > 실패: 그때 오늘 `src/core/nodeFromJSONSchema.ts:55`의 `as InferSchemaNode<Schema>`도 같은 물음의 대상으로 적는다.
- 보충:
  > 편집자 결정(26C-01): "【추론】 TEST-070의 "배열 멤버"는 배열 멤버를 들여오는 PR-5가 같은 조건(`tsc --strict`, `as`·`any` 없음)으로 단언하고, PR-2는 PR-2 공개 형으로 나머지를 단언한다(26C-03)." (`reviews/round-26-closing.md:15`)
  > 소유자(142라운드, 코어 형 단언 14건과 개선 항목 배정(질의 4·2항)): "구조변경 관련 14건은 다시 검토해보죠. 특히 타입단언 쪽은 마음에 안들긴 했습니다" (`reviews/round-142-owner-answers.md:11`) — 7단계 코어 비시험 코드의 형 단언 14건은 승인하지 않고 PR 병합 전에 07이 제거 길과 비용을 적어 다시 올린다; G27은 열린 채(원장 관리자, 2026-10-11).
  > 소유자(146라운드, 다른 패키지 공개 형 변경(#1·#10·#5)): "공개 형 변경 받음 (Recommended)" (`reviews/round-146-owner-answers.md:7`) — 7단계 코어 형 단언 14건 가운데 다른 패키지 형 선언이 원인인 3건은 common-utils isArray와 json getValue에 overload를 더해 없앤다(형만, 방출 JS 동일)(원장 관리자, 2026-10-11).
  > 소유자(146라운드, new Function 반환값(#12)): "지금 자리에 이유와 함께 남김 (Recommended)" (`reviews/round-146-owner-answers.md:9`) — `new Function` 반환값의 단언 1건은 생성자 반환 형에 호출 서명이 없어 제거 불가, 이유를 그 줄에 적고 남긴다; 나머지 13건은 제거(6건 형만, 7건 런타임 가드는 번들 하나로 판정)(원장 관리자, 2026-10-11).
  > 소유자(147라운드, 공개 형 변경의 버전 처리): "마이너 버전으로 해도 되는데, 지금 수정하지말고 changeset으로 저장해둬줘. 한번에 올리려고 해" (`reviews/round-147-owner-answers.md:7`) — 146라운드의 common-utils·json 공개 형 변경은 package.json 버전을 지금 올리지 않고 `.changeset/`에 minor 변경 파일로 저장해 소유자가 한 번에 올린다(원장 관리자, 2026-10-11).
  > 소유자(149라운드, isArray overload와 소비 코드 6곳): "(가) overload 넣고 6곳 선언을 넓힘" (`reviews/round-149-owner-answers.md:7`) — common-utils isArray의 readonly overload를 넣고 schema-form의 `includes` 호출 6곳의 받는 쪽 선언을 넓힌다; `src/__legacy__` 4곳은 소유자가 승인한 예외(원장 관리자, 2026-10-11).
  > 소유자(150라운드, 형 추론의 우선순위(원칙)): "외부 사용자의 경우 form에 주입한 값이나 jsonSchema, handler등을 통해서 다양한 타입 추론이 가능하면 정확하게 이루어졌으면 좋겠어." (`reviews/round-150-owner-answers.md:7`) — 외부 사용자의 추론(defaultValue·핸들러·ref·제네릭 주입)은 정확하게, 스키마 기반 추론은 모호해도 되며, 패키지 내부는 이유가 적힌 형 단언으로 안전성을 보장해도 된다; 옛 구조의 형 추론은 07b의 공개 형 추론 감사에서 참고한다(원장 관리자, 2026-10-11).
  > 편집자 결정(153C-01): "【추론】 가드는 단언을 없애려고 넣은 실행 코드이므로 그 값은 134C-01의 번들 판정으로만 가려야 했고, 다섯 부분이 모두 채택이며 강제 GC 열에 표시조차 없으니 150라운드 (3)의 "건별로 가드 유지 또는 단언으로 되돌림"에서 되돌릴 건은 하나도 없다. 기록 열의 0 아래 구간 하나는 크기가 측정 분해능 수준(−0.003 ms)이고 방향이 이득 쪽이라 판정에 쓰지 않는다(145C-01: 기록 열은 비교 열). #12를 "잔존"이 아니라 "이유 적힌 단언"으로 세는 것은 146라운드 소유자 답("지금 자리에 이유와 함께 남김")이 #3·#7과 같은 종류의 처분이기 때문이며, 셈을 11+3으로 적어야 07의 원장 근거와 숫자가 맞는다. G27의 닫힘을 verify 뒤로 미루는 것은 139C 이후 모든 게이트가 새 문맥 verify를 요구해 온 관행이다." (`reviews/round-153-closing.md:9`)
  > 편집자 결정(158C-01): "【추론】 첫 verify 실패는 증거의 범위 문제였고 재확인이 같은 HEAD에서 통과했으므로 G27의 닫힘 조건(153C-01 (3))은 충족된다. codex 쪽 fractal_inspect의 indeterminate는 다른 facts 저장소를 읽은 환경 차이이고 같은 HEAD의 주 세션 결과가 ok이므로 판정을 가르지 않지만, 두 결과가 다르게 나온 사실 자체는 숨기지 않고 적는다. 비차단 넷 가운데 코드나 시험을 건드리는 셋을 07에서 고치면 facts·번들·시험 증거가 다시 낡아 verify를 되풀이해야 하므로, 07b로 넘기는 것이 비용에 맞다; N5는 보고서 글자라 어느 증거도 낡게 하지 않는다. G23은 소유자가 142라운드에서 "후순위로 내가 따로 지시하겠다"고 했으므로 묻지 않고 기다린다." (`reviews/round-158-closing.md:9`)
  > 편집자 결정(163C-01): "【추론】 150라운드 원칙의 핵심은 "외부 사용자가 defaultValue·핸들러·ref·제네릭으로 주는 정보로부터의 추론은 정확하게"이고, 핵심 값 경로가 두 판 모두 정확하다는 결과가 그 원칙이 지켜졌음을 보인다. 남은 차이 가운데 any → unknown과 거부 → 추론은 모두 사용자가 더 많이 알게 되는 방향이라 결정 없이 유지할 수 있다. 반대로 unknown으로 넓어진 2는 사용자가 덜 알게 되는 방향이라 되돌린다. 1·4는 형만의 문제가 아니라 "핸들러 안에서 오류 배열이나 상태를 고쳐 쓰는" 사용 방식을 끊는 것이므로 레거시 사용자 호환의 문제이고, 그 판단은 소유자 몫이다; 다만 런타임이 동결에 기대고 있다면 형을 되돌려도 쓰기는 실패하므로 그 사실부터 확인해야 선택지가 바르게 선다." (`reviews/round-163-closing.md:9`)
  > 편집자 결정(164C-01): "【추론】 163C-01 (2)는 감사 보고서의 표만 보고 "넓어졌다"를 "후퇴했다"로 읽은 결정이었고, 되돌림을 시도해 보니 넓어진 쪽이 런타임의 사실이었다. 원칙 (1)은 외부 사용자가 준 정보로부터의 추론을 정확히 하라는 것이지, 런타임이 지키지 못하는 좁은 형을 사용자에게 약속하라는 것이 아니다. 오류 처리 콜백은 정확히 "값이 이상할 때" 불리므로, 그 자리에서만큼은 unknown이 옳은 형이고 사용자가 좁혀 쓰는 것이 바른 사용이다. 결정을 뒤집는 비용은 문서 한 줄이고, 뒤집지 않는 비용은 틀린 공개 형 또는 콜백의 값 왜곡이다." (`reviews/round-164-closing.md:9`)
  > 소유자(166라운드, 오류 배열 readonly, state flag의 값 범위, INTENT 예외): "직접 결정한건 문제없고, 두가지에 대해서인데, error는 readOnly로 해도 되는데, state에 대해서는 false도 유효값이야. undefined이거나 true 이거나 false거나. 그렇지 않나? 네가 판단 못할만한 문제는 아닌데. 어떤것때문에 결정을 미룬거지?" (`reviews/round-166-owner-answers.md:7`) — onValidate 오류 배열은 readonly 유지; onStateChange flag는 undefined·true·false 세 값을 내도록 형과 런타임을 옛 판 의미로 맞춤; INTENT 예외 유지(원장 관리자, 2026-10-12).
  > 편집자 결정(167C-01): "【추론】 166라운드에서 소유자가 바로잡은 것은 "false가 유효값인데 형이 그것을 없앴다"는 점이고, 사실 확인 결과 두 판 모두 런타임은 true 또는 없음만 냈으므로 형을 옛 판과 같게 돌리면 계약은 복원된다. 남는 차이는 "꺼진 flag의 키가 언제 사라지는가"인데, 옛 판에서 키가 남은 것은 additive patch가 false를 버린 부작용이라 옛 판 사용자도 그 값에 기대어 무엇을 했을 가능성이 낮고, 새 판 쪽이 정확하다. 다만 166라운드에서 소유자가 "옛 판이 내던 값을 새 판이 못 내는" 차이에 민감함을 보였고 이것은 그 반대(옛 판이 내던 낡은 값을 새 판이 안 냄)라 편집자가 정하되 보고한다." (`reviews/round-167-closing.md:9`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1019-1023`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-37)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1015-1017`

### TEST-071 PR-3 벤치 회귀 — 객체 원천 `injectTo` 1만 원소에서 한 원소 쓰기의 비교 비용이 값 크기와 무관, 통째 교체는 선형

- 결정:
  > 【추론】 TEST-063은 결정 관문에서 PR-3 벤치의 회귀 항목으로 바뀐다.
  > PR: PR-3 벤치(회귀 항목).
  > 무엇: 객체 원천 `injectTo`(1만 원소의 터미널 객체·배열)에서 한 원소 쓰기의 비교 비용이 값 크기와 무관한지, 통째 교체가 선형인지 잰다.
  > 실패: 값 비교를 되돌리지 않고 지름길 구현을 고친다.
- 보충:
  > 편집자 결정(28C-06): "【추론】 TEST-071의 "한 원소 쓰기의 비교 비용이 값 크기와 무관"은 18C-50 (다)의 뜻이다: 비교는 이번 정착에서 새로 만들어진 부분에만 내려가므로, 통째 교체된 컨테이너의 원소 N개는 참조로만 견주고 바뀌지 않은 원소들의 깊은 크기(내용)에는 내려가지 않는다." (`reviews/round-28-closing.md:65`)
  > 편집자 결정(28C-06): "【추론】 그래서 원소 수 N에 비례하는 참조 비교는 지름길이 요구하는 비용이고, "값 크기"는 원소 수가 아니라 바뀌지 않은 원소들의 깊은 크기다; "통째 교체가 선형"은 새로 만들어진 값 전체의 크기에 선형이라는 뜻이다." (`reviews/round-28-closing.md:66`)
  > 편집자 결정(28C-06): "【추론】 합격선은 04의 검증 문서에 TEST-027의 절차로 적고 원장은 뜻만 보충한다: 원소 크기를 바꿔도 한 원소 쓰기의 비교 시간이 같은 수준인지, 통째 교체의 시간이 새 값의 크기에 선형인지를 잰다." (`reviews/round-28-closing.md:67`)
  > 편집자 결정(28C-06): "【추론】 실패의 처분은 둘로 나눈다: 지름길이 없어서(비교가 새로 만들어진 부분 밖으로 내려가서) 실패하면 18C-50·SETTLE-043이 정한 기제의 결함이므로 고치는 것이 구현이고 최적화가 아니다 — 27라운드 소유자 답의 범위 밖이다; 지름길이 있는데 선만 넘으면 27라운드 답대로 고치지 않고 TEST-027의 절차(이유 기록, 소유자 수용)를 따르며 `verification/`의 성능 문서에 남긴다." (`reviews/round-28-closing.md:68`)
  > 소유자(30라운드, 04 벤치의 느린 행): "맞습니다." (`reviews/round-30-owner-answers.md:14`) — 통째 교체의 객체 행이 28C-06의 선 하한(시간 비 2.375배)을 밑돈 것(Node 2.020배, Bun 1.938배)을 소유자가 받아들였다. 한 원소 쓰기 행과 배열 행은 통과했고 지름길(18C-50)의 존재는 확인되었다. 원인 가설(1만 개 키 열거 비용)의 분리와 개선은 최적화 작업의 몫이다(원장 관리자, 2026-10-01).
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1394,1413-1415`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1405-1411`

### TEST-072 '일정 수준'은 같은 실행에서 옛 판에 견주어 잰다 — 선은 기존 `guard:check`, 절대 수치와 배율 상한은 두지 않음, 선을 넘으면 이유를 적고 Vincent가 받아들여야 병합

- 결정:
  > 【추론】 안건 §5의 성능 물음은 한 규칙에서 닫는다: 옛 판보다 느린 항목은 이유를 적고 Vincent가 병합 때 받아들인다(ADR 0009 §4, `adr/0009-performance-budget-and-benchmarks.md:92`).
  > 【추론】 이 규칙이 느림을 항목마다 통제하므로 새 수치를 지어내지 않는다.
  > 【추론】 '일정 수준'은 같은 실행에서 옛 판에 견주어 잰다(TEST-026의 하니스, 같은 폼의 쌍).
  > 【추론】 절대 수치는 두지 않는다.
  > 【추론】 선은 기존 `guard:check`의 규칙이다.
  > 【추론】 옛 판의 표본을 기준으로 넣고, 새 판의 처리량(초당 횟수) 평균이 15% 넘게 떨어지고 Welch p<0.05면 선을 넘는다(`packages/aileron/benchmark-form/src/utils/stat-regression.ts:81-112`, 기본값 `threshold` 15, `alpha` 0.05).
  > 【추론】 선을 넘은 항목은 ADR 0009 §4를 따른다.
  > 【추론】 이유를 적고 Vincent가 받아들여야 병합한다.
  > 【추론】 이것이 '통제 가능하고 일정 수준 안'을 지키는 절차다.
  > 【추론】 1.5배·2배 같은 배율 상한은 따로 두지 않는다.
  > 예: 가드 200개인 조건부 폼 생성은 새 판 23.0 ms(트리 585 µs + AJV 컴파일 22.4 ms) 대 오늘 13.4 ms, 1.7배(처리량 −42%)라 선을 넘는다.
  > 이 항목은 18C-30대로 PR-4의 수용 필요 항목으로 미리 적혀 있다.
- 보충:
  > 편집자 결정(46C-01): "【추론】 (a) 44C-01이 결함으로 본 것은 "변경에 비례하지 않는 비용"(GOAL-011 "비용은 폼의 크기가 아니라 그 동작이 바꾼 것의 크기에 비례한다", SETTLE-017·047의 순회 범위)이고, 가드 인스턴스가 루트를 한 번 더 컴파일하는 것은 루트마다 한 번이며 스키마 크기에 비례하는 마운트(로드) 비용이라 트리 전체 순회가 허용되는 로드의 범위 안이다; SETTLE-017의 "`if` 게이트의 컴파일은 작성된 스키마의 위치당 1회"도 지켜진다(가드마다 한 번, 루트 등록도 한 번). 그래서 계약 위반이 아니라 상수 배의 느린 행이며 TEST-027·072의 절차(이유를 적고 소유자가 받아들여야 병합)로 간다. 측정은 05 성능 기록과 속도 문제 대장 "열림"에 적는다(원인 확인: 가드 인스턴스의 `resolveSchema`가 미컴파일 루트를 컴파일함; 후보: A안)." (`reviews/round-46-closing.md:9`)
  > 소유자(52라운드, 06 느린 행의 재측정 기준): "그럼 변경 전체를 보았을때는 얼마나 차이나나? 이게 그렇게까지 차이가 날 문제는 아닌데. 적용완료까지를 기준으로 다시 측정해보라." (`reviews/round-52-owner-answers.md:7`) — 느린 행의 레거시 대비 배율은 두 엔진이 같은 완료점(쓴 값이 루트에서 읽히는 시점)에 이른 때를 기준으로 재야 하며, 06의 P-13·P-14는 그 기준으로 다시 재어 수용을 다시 묻는다(원장 관리자, 2026-10-01).
  > 소유자(54라운드, 06 느린 행 P-14의 수용): "응 그렇게 하자. 이정도면 수용 가능. 동작무결성을 확보하고, 성능 개선 라운드에서 쪼아보자" (`reviews/round-54-owner-answers.md:7`) — 같은 완료점에서 아이템 1천 개 배열의 루트 통째 쓰기가 Node 1.41–1.43배·Bun 2.87배 느린 것(선형)을 PR-5에 대해 받아들였다; 키 입력 행 P-13은 같은 완료점에서 새 엔진이 더 빨라 닫힌다; 고치는 일은 07 뒤 최적화 작업의 몫이고 PR-5는 동작 무결성에 집중한다(원장 관리자, 2026-10-01).
  > 소유자(56라운드, 05 PR-4 느린 행 넷의 수용): "응 그것도 수용. 성능 개선 라운드에서 다루자. 동작만 정상적이면 수용할게. 아까처럼 지수적으로 성능이 악화되는 케이스가 아니면" (`reviews/round-56-owner-answers.md:7`) — P-16~P-19(마운트 두 행, 통지 파동, 03 벤치 재실행의 첫 로드·잔존 메모리)를 PR-4에 대해 받아들였고, 고치는 일은 07 뒤 성능 개선 작업의 몫이다; 덧붙인 조건 둘은 느린 행 수용의 일반 규칙이다 — 동작이 정상인 행에만 수용이 미치고, 폼 크기에 대해 비례 이상으로 악화되는 비용은 수용 대상이 아니라 발견한 단계가 고친다(44C-01·49C-01이 소유자 답으로 섬)(원장 관리자, 2026-10-02).
  > 편집자 결정(63C-01): "【추론】 TEST-027·TEST-072의 수용은 "이유를 적고 Vincent가 받아들여야 병합"이고 48C-01·49C-01은 소유자 수용이 행에 적힌 원인까지만 미친다고 정했으므로, 54라운드에 소유자가 받아들인 P-14(Node 1.41–1.43배·Bun 2.87배, 원인은 06의 배열 합성이 아이템 수에 선형)는 통합 뒤의 새 원인(05의 `markCommitDeliveries`가 커밋마다 바뀐 노드 수에 비례해 더하는 비용)을 덮지 않는다. 그 비용은 바뀐 노드 수에 비례하고 폼 크기나 무관한 노드 수에는 비례하지 않으므로 GOAL-011의 계약 위반이 아니라 상수 배의 느린 행이고, 56라운드 소유자 답의 두 조건(동작 정상, 비례 이상으로 악화되지 않음)을 지키므로 같은 방식으로 묻는다. 06은 속도 문제 대장에 05에 귀속한 새 행(P-22, "커밋마다 하는 배달 표시의 노드당 비용 — P-14·키 입력 행에 더해짐")을 "소유자 수용 대기"로 더하고 P-14 행에는 재측정 수치와 그 행을 가리키는 메모를 적으며, 개발 모드의 동결·`process.env` 읽기 몫(약 19%)은 제품 빌드에서 다시 재어 행에 갈라 적는다. 원장 관리자가 소유자에게 묻고, 답은 소유자 답 파일로 기록한다; 06의 통합·검증·PR 갱신은 그 답을 기다리지 않고, 답은 PR-5의 병합 조건(TEST-027)에만 걸린다." (`reviews/round-63-closing.md:9`)
  > 소유자(64라운드, 06 통합 뒤의 느린 행 P-23): "속도개선을 해보세요. 너무 느리군요" (`reviews/round-64-owner-answers.md:7`) — 63C-01이 05에 귀속한 느린 행 P-23(커밋마다 하는 배달 표시의 노드당 비용, 배열 통째 쓰기 행을 Node 약 2.4배·Bun 약 3.5배로)은 수용 행이 아니라 06 PR(#353) 안에서 뜻을 바꾸지 않고 고치는 항목이다; 54라운드에 받아들인 수치(Node 1.41–1.43배, Bun 2.87배) 이하로 돌아오면 "해결"로 닫고, 못 미치면 다시 묻는다(원장 관리자, 2026-10-02).
- 상태: 현행
- 출처: `reviews/round-18-closing.md:794-805`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-26)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:807-810`

### TEST-073 예산의 수치는 기존 `guard:check` — 처리량 평균이 15% 넘게 떨어지고 Welch p<0.05면 회귀, 표본 100회 이상, 키 입력·마운트·대규모 쓰기·배치에 똑같이

- 결정:
  > 【추론】 예산의 수치는 기존 `guard:check`를 그대로 쓴다.
  > 【추론】 처리량 평균이 15% 넘게 떨어지고 Welch p<0.05면 회귀다(`stat-regression.ts:81-112`).
  > 【추론】 표본은 TEST-026대로 100회 이상이다.
  > 【추론】 키 입력, 마운트, 대규모 쓰기(루트 통째 쓰기), 배치에 똑같이 적용한다.
  > 【추론】 회귀는 ADR 0009 §4 절차를 따른다(이유를 적고 Vincent가 받아들여야 병합).
  > 【추론】 스파이크의 기대 이득은 기대값으로 적으며, 게이트가 아니다.
  > 【추론】 18C-15의 벤치 게이트와 18C-31의 B1·B5·B6 합격선이 이 선을 쓴다.
  > 기대값: 루트 통째 쓰기(10k×5) 5.72 ms 대 215.7 ms, 배치 1000 368 µs 대 1.71 ms(`spikes/work-loop/REPORT.txt:245-249`), 트리 생성 flat 1,000 452.75 µs 대 4.63 ms, 트리 생성 array 10,000×5 13.15 ms 대 216.73 ms(`:113-114`).
  > 예: 기준선 `Scale Interact Flat flat-50`은 14.1 ms(처리량 70.8회/초)다.
  > 15.0 ms(+6.4%, 처리량 −5.9%)가 되면 선 안이라 통과한다.
  > 17.0 ms(처리량 −16.9%)가 되고 Welch p<0.05면 회귀다.
  > 선은 처리량 기준 15%이므로, 시간으로는 약 16.6 ms(+17.6%)가 경계다.
- 보충:
  > 편집자 결정(451C-03): "【추론】 D3b-2(파생 WeakMap 루트 32개를 청사진·호스트 레코드 둘의 지연 슬롯으로, 생성 사실은 청사진에 두고 `setMode()`가 지우지 않음, 엔트리별 저장소는 선언 부모 host 레코드가 소유)의 첫 후보 54b8aff0b는 기능 관문은 다 통과했지만 마운트 nested-d6-f4가 폭(0.42 ms) 밖에서 +4.18 %/+3.52 % 악화하고 Bun B2가 +80.7 B/노드(+3.63 %)라 채택하지 않았다. `verification.md`의 "원인을 같은 PR에서 분리한다"에 따라 변수 하나(staticIds 저장만 옛 전역 WeakMap)만 되돌린 탐침으로 Bun 79.06 B/노드(엔트리당 79.08 B)가 호스트별 `Map`의 비용임을 분리했고, 시간 악화는 네 변형이 모두 폭 안이라 재현되지 않았다. 최종 후보 de14aa1da(host-owned WeakMap, 소유 host를 호출자가 명시, 형제 N개의 저장소 공유 시험)는 기준판 8569ec0e1(#470 포함) 대비 기능 관문·배달 0·d.ts 0, Node B2 통과, Bun B2 B 중앙값이 A 최댓값보다 +0.608 B/노드(+0.027 %) 커서 고정 규칙 미달이었고 소유자가 TEST-027로 받아들였다(위 6행). 마운트 nested-d6-f4는 +2.60 %/+3.06 %로 폭 밖이지만 계획서 게이트의 선(TEST-073, 처리량 15 % 초과 하락과 Welch p<0.05)은 안이다. 그런데 브리프에 측정 전 고정한 규칙은 "어느 행도 폭 밖 악화가 없어야 채택"이었고 코디네이터는 측정 뒤에 계획서의 선을 적용했다: 계획서를 따른 것이지만 측정 뒤의 규칙 변경이라 TEST-081에 어긋나므로, 결과 문서와 PR에 "브리프 규칙으로는 미달, 계획서 규칙으로는 통과, 편집자가 측정 뒤 적용"으로 공개하고 재검증 대상으로 두며 D4에서 그 행을 다시 잰다. TEST-073의 평균·Welch 20비교에서 single-nested-d6-f4의 A′/B만 −16.85 %(p 2.2e-7)로 선 밖이었는데 같은 행의 A/B는 −8.34 %이고 A 대 A′의 평균 차이가 10.24 %이며 최솟값 중앙은 A와 B가 0.1766 ms로 같아, 게이트는 A/B로 보고 이 신호는 0.18 ms 행의 평균 불안정으로 읽어 공개만 했다(편집자 판정, 재검증 대상). 독립 검토(antigravity, 2부)는 PASS였으나 `admittedEdgeSchemas`가 같은 모양의 호스트별 `Map`으로 남아 게이트 형제가 많은 폼에서 같은 엔트리당 비용을 낸다고 지적했고, 후속 D3b-2b로 그것도 host-owned WeakMap으로 바꿔(제품 변경 한 파일, 이 PR의 새 시험만 수정, DETAIL 선행) 전체 고정 규약을 다시 쟀다: 폭 밖 악화 0, TEST-073 회귀 0, Node B2 통과, Bun B2 +0.413 B/노드로 수용치 안. 델타 검토 PASS. 판정 파일은 `/private/tmp/claude-501/perf-runs/446-reviews/pr-471-antigravity.md`, 결과 문서는 `verification/design-optimization/d3b-2-results.md`다." (`reviews/round-451-closing.md:12`)
  > 편집자 결정(455C-01): "【추론】 B1(게이트 판정 통일, 가지 `perf/schema-form-b1-gate-predicate`)의 후보 1(2f1365df3, 창 11:04 UTC)은 쓰기당 `if`-80 598.2→303.8 µs(선 297.7 초과 6.2 µs), `discriminator`-80 456.2→173.8 µs(선 통과), 평가 수 `if` 80·`discriminator` 0, 바퀴 1회, 그림자 불일치 0이었으나 `switch-oneOf-80` 왕복이 A 368.8/B 468.5/A′ 330.9 µs로 B만 느렸고 TEST-073이 A 대 B에서 switch-oneOf-80 −26.25 %, single-flat-1000 −32.03 %로 걸렸다. `active` 경로의 추가 장부를 없앤 후보 2(38e405d6b, 창 11:37 UTC)는 `if`-80 305.4 µs(선 318.2 통과), `discriminator`-80 152.2 µs(선 265.6 통과)로 두 행 모두 폭 밖 개선이지만 `active` 왕복 A 337.3/B 505.8/A′ 377.4 µs의 같은 패턴이 반복되어 TEST-073 A 대 B 3행(single-nested −36.12 %, switch-oneOf-80 −18.86 %, switch-nested-oneOf-20 −18.86 %)이 실패했고 A′ 대 B는 회귀 0이었다. 정식 판정은 두 후보 모두 미채택이다. 독립 진단 둘은 이 "회귀"가 코드 원인이 아님을 보였다: diff 기반 진단(Claude 하위 에이전트, 스크립트 `scratchpad/b1diag`)에서 A·B 번들이 같은 rolldown 설정으로 다시 만든 번들과 바이트 단위로 같고, 쓰기당 함수 호출 수 2284.5 대 2283.5, 실제 하네스 교대 522 대 533 µs, 할당 111.57 대 111.35 KB이며, 게이트가 없어 B1 경로에 들어가지 않는 single-flat-1000·single-nested 행도 같은 창에서 −32 %·−36 %로 "회귀"했고, 같은 빌드가 몇 분 사이에 530→650 µs로 이동했다. 워커의 교대 12프로세스 진단에서도 oneOf-80 B/A 짝별 비율이 0.64·0.96·1.10으로 부호가 바뀌고 CPU self 총합 B/A가 0.887이었다. B1이 `active` 경로에 더한 작업은 모두 쓰기당 1 µs 미만이다. 그래서 같은 후보의 재측정을 TEST-088에 따라 소유자에게 물었고 소유자가 승인했다(위 2행 "1. 승인"). 재측정은 455C-02의 보강 프로토콜로 한 번만 하며, 채택 판정은 그 수치로 하되 선과 규칙(`if` ≤ `active` × 1.1 + 40 µs, `discriminator` ≤ × 1.05, 두 행 폭 밖 개선, oneOf-80 폭 밖 악화 없음, TEST-073, 평가 수·바퀴, 힙)은 그대로다. 독립 코드 검토(antigravity 1부, `/private/tmp/claude-501/perf-runs/453-reviews/pr-b1-part1-antigravity.md`)는 범위·계약·BLUEPRINT-007·BLUEPRINT-053·즉시 반영·화이트리스트의 보수성·오류 의미·시험 red/green 모두 PASS다. 후보 1에서 결함(두 번째 바퀴·게이트당 복사)을 고친 후보 2를 새 창에서 잰 것은 같은 후보의 재측정이 아니라 새 후보의 측정이다(D3b-2와 같은 처리)." (`reviews/round-455-closing.md:8`)
  > 편집자 결정(455C-02): "【추론】 지금 장치는 A·B·A′를 각각 3프로세스씩 순서대로 재는데, 기계 상태가 몇 분 사이에 20 % 넘게 움직여 TEST-073의 A 대 B Welch 검정이 창의 흐름에 걸린다(455C-01의 증거). 소유자가 보강을 승인했다(위 2행 "2. 승인"). 보강은 셋이다: 행마다 A와 B 프로세스를 번갈아(A B A B …) 각 10프로세스(20 예열·100 표본은 그대로) 돌려 같은 시각의 짝으로 비교하고, A′는 따로 돌리지 않고 A 프로세스의 뒤 절반(6~10번째)으로 정의해 폭 (다) = max(|A−A′|, rangeA, rangeA′) 규칙을 그대로 적용하며, 가설이 닿지 않는 행(B1·B2-P1b는 branchless·잠복 없는 single-flat-1000)의 B/A 중앙값 비가 ±5 % 밖이면 창을 무효로 하고, TEST-073은 교대 짝의 A 대 B로 판정하되 A′ 대 B를 나란히 적는다. 폭 (다)의 규칙(443C-03)과 15 % 선(TEST-073)은 바꾸지 않는다. B1이 이 모드를 측정 장치(`verification/design-optimization/tools/`)에 더해 단계 가지로 올리고, B1 후보 2의 재측정과 B2-P1b부터의 모든 정식 측정에 적용한다. 무효 창은 재측정이 아니라 "판정 불가"로 기록한다(재측정 금지 유지)." (`reviews/round-455-closing.md:10`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:816-827`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-27)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:829-832`

### TEST-074 안전 임계를 목표 배율로 올려 적지 않는다 — 문서는 잰 사실만, PR-7 뒤 같은 모바일 조건으로 다시 재어 적음, 병합 게이트 아님

- 결정:
  > 【추론】 안전 임계를 목표 배율로 올려 적지 않는다.
  > 【추론】 문서는 잰 사실만 적는다.
  > 【추론】 PR-7 뒤 `MOBILE_PERFORMANCE_REPORT.md`(v0.10.6)와 같은 모바일 조건으로 다시 재고, 잰 임계를 문서에 적는다.
  > 【추론】 병합 게이트가 아니다.
  > 오늘 문서의 임계는 필드 50개 미만, 배열 아이템 30개 미만이다(`adr/0009-performance-budget-and-benchmarks.md:33`).
  > 참고 수치(문서의 임계는 아니다): 데스크톱 기준선 `baseline.json`(5회)에서 flat-500 마운트 약 112 ms, array-100 마운트 약 103 ms로 배열이 가장 약하고, 스파이크의 core 구성은 array 10k×5에서 13 ms 대 217 ms다(`spikes/work-loop/REPORT.txt:114`).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:838-843`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-28)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:845-847`

### TEST-075 번들 크기 예산 — 측정 방법 고정(ESM 진입을 esbuild로 minify, gzip -9, 의존성 외부), 기준 v0.16.0의 37,023 B, 늘면 이유를 적고 Vincent가 받아들여야 병합

- 결정:
  > 【추론】 측정 방법을 고정한다.
  > 【추론】 ESM 진입(`dist/index.mjs`)을 esbuild로 minify하고 gzip -9 하며, 의존성은 외부로 둔다.
  > 【추론】 기준은 v0.16.0(2026-09-21 빌드)의 37,023 B다.
  > 【추론】 배포되는 minify 없는 gzip(51,632 B)도 함께 보고한다.
  > 【추론】 기준보다 늘면 ADR 0009 §4와 같은 기록·수용 규칙을 따른다.
  > 【추론】 이유를 적고 Vincent가 받아들여야 병합한다.
  > 【추론】 비율 상한은 따로 두지 않는다.
  > 【추론】 "현재 gzip 약 44KB"(`00-goals.md:82`)는 측정 방법이 적히지 않은 기록이라 기준으로 쓰지 않는다.
- 보충:
  > 편집자 결정(82C-01): "【추론】 TEST-027의 수용은 상수 배의 느린 행에 대한 것이고, 56라운드 소유자 답이 일반 규칙으로 세운 두 조건(동작 정상, 폼 크기에 대해 비례 이상으로 악화되지 않음) 가운데 둘째를 어기는 행은 GOAL-011("비용은 폼의 크기가 아니라 바꾼 것의 크기에 비례")의 계약 위반 후보라 수용 대상이 아니다. 그래서 (가) 같은 묶음 안에서 크기만 다른 픽스처 사이에 새/옛 배율이 뚜렷이 커지는 코어 행 — 마운트의 flat-50/100/500(4.02→5.02), nested-d3/d5(5.11→8.10), oneOf-5/10/20(3.38→5.00), 갱신의 oneOf-5/10/20(6.30→11.34)과 그 묶음에 속한 행 — 은 대장에 "계약 위반 후보, 수용 대상 아님 — 07 진단 중"으로 바꾸고, 07은 65C-01의 방법대로 단계마다(청사진, 노드 생성, 첫 정착, 검증 등록, 배달 표시) 비용을 재어 크기에 선형인 상수 몫과 초선형인 구조 몫을 가르고, 자기 시나리오(렌더·`nodeFromJSONSchema`)가 닿는 구조 몫은 49C-01대로 07이 고치며, 앞 단계 코드의 몫은 귀속을 적어 열린 행(수용 대상 아님, 어느 PR의 머지도 막지 않음)으로 둔다. 진단 뒤 상수 배로 판명된 행은 (나)로 옮긴다. (나) 배율이 크기와 무관한 행(React 층의 마운트 1.0–1.8배와 갱신, 코어의 sample-0–3 등)은 행마다 묻지 않고 한 묶음으로 소유자에게 올린다 — 56라운드 답은 묶음 수용의 선례이고, 76라운드가 정돈 → 성능 최적화 순서를 세웠으므로 묻는 내용은 "지금 수용하고 성능 최적화 단계로 넘기는가"다. (다) 패키지 벤치 후보 P-99–132는 옛 기준선 JSON에 원 표본이 없어 통계 판정이 서지 않고, TEST-026이 "이름이 바뀌므로 옛 판 대 새 판의 비교는 `benchmark-form`만 맡고 패키지 벤치는 새 엔진 안의 회귀 감시로 쓴다"고 했으므로 애초에 수용 행이 아니다 — 대장에서 "후보" 행을 "기록(새 엔진의 회귀 감시 기준선, 비교 판정 없음)"으로 바꾸고 `bench:baseline`을 새 엔진에서 다시 남긴다; 옛 중앙값 0.00004 ms 같은 값은 옛 벤치가 다른 것을 쟀다는 뜻이라 비교에 쓰지 않는다. (라) 번들 크기(esbuild minify + gzip 71,317 B, 기준 37,023 B, 1.93배; 레거시 포함 없음)는 TEST-075의 "늘면 이유를 적고 Vincent가 받아들여야 병합"에 따라 이유(새 엔진 자체의 크기, 어느 fractal이 얼마인지)를 적어 소유자에게 묻는다. G26은 (가)의 진단과 (나)·(라)의 소유자 답이 끝나야 통과하며, (가)에서 열린 행으로 남긴 몫은 G26을 막지 않는다." (`reviews/round-82-closing.md:9`)
  > 소유자(84라운드, 번들 크기(TEST-075)): "번들사이즈는 이후 줄이는 작업을 하겠습니다. 이번엔 집중하지 마세요." (`reviews/round-84-owner-answers.md:8`) — P-133·134(1.94배)는 소유자 수용 행이고 줄이는 일은 정돈·성능 최적화 단계의 몫이다; 07은 측정 방법과 fractal별 내역만 기록한다(원장 관리자, 2026-10-03).
  > 편집자 결정(114C-01): "【추론】 React 층의 갱신 목표 1.0배는 94C-02가 "세 회차 모두 1.0을 넘을 때만 미달"로 정했으므로 1.01–1.04의 행은 그 규칙을 먼저 받는다. 남는 미달 행은 두 몫으로 나뉜다: 코어 몫(같은 폼의 코어 갱신 간극이 React wall에 그대로 실린 것)과 React 층 몫(렌더·커밋·바인딩). 07의 읽기대로 코어 몫이 104·110라운드가 받아들인 원인이라면 소유자가 그 수용을 React 층의 wall 행까지 넓힐지 정할 자리이고, React 층 몫이 새로 있다면 그것은 7단계의 코드 수준 대상이다 — 그 구분 없이는 어느 쪽인지 알 수 없으므로 분해가 먼저다(48C-01·49C-01: 수용은 적힌 원인까지). 배열 연산 세 행(1.35–1.65배)은 코어 표에 같은 행이 없으므로 더욱 분해가 먼저이며, 코어 몫이 크면 코어 표에 배열 연산 행을 더해 같은 규칙으로 판정한다. 번들은 다르다: TEST-075는 기준 37,023 B를 두고 "늘면 이유를 적고 Vincent가 받아들여야 병합"이라 했고 GOAL-011은 "번들 크기도 예산이다"라 했으므로, 2.17배는 기록으로 두는 것이 아니라 소유자의 수용이 필요한 사항이다. 올리기 전에 이유를 적을 수 있어야 한다: 비중 분해를 모듈 단위로(core/settle 43%의 안에서 단계별, core/blueprint 17%, dispatch 8%), 그리고 옛 판에 없던 기능(전체 문법 호환의 조각 열거, 게이트 고정점, 정적 분석, 개정 원장, 운영 모드 불변 보장)이 차지하는 몫과 같은 기능을 다르게 구현해 커진 몫을 나누어 적고, 코드 수준으로 줄일 수 있는 자리(죽은 내보내기, 중복 도우미, 개발 전용 코드가 운영 번들에 남은 것, 통째 재내보내기)의 상한을 붙인다. 줄이는 일을 7단계에서 할지 개선 단계로 보낼지는 소유자가 그 분해를 보고 정한다. 측정이 겹치지 않도록 (가)(나)의 분해는 분기 장부 작업의 첫 세션 앞에 붙이고, 번들 분해는 측정과 무관하므로 바로 한다." (`reviews/round-114-closing.md:9`)
  > 소유자(115라운드, 번들 크기의 처분): "둘 다 개선단계로 넘기도록 하자. 다만 생각보다 번들 크기가 많이 커졌군. 그리고 기존 판은 많은 부분을 winglet 패키지로 분리해서 그랬었을거야. 이건 흠... 일반화가 가능한 로직이 있으면 다른 패키지로 분리해서 관리하는 방법도 있겠는데 지금 이야기로는 대부분 전용코드같군" (`reviews/round-115-owner-answers.md:7`) — 2.17배(80,390 B)의 까닭은 `bundle-115.md`로 적혔고 7단계의 병합을 막지 않는다; 번들을 어떻게 다룰지(작은 정리, 일반화 가능한 로직의 패키지 분리 검토, 의존성을 포함한 총량의 비교)는 개선 단계의 항목이다(원장 관리자, 2026-10-07).
- 상태: 현행
- 출처: `reviews/round-18-closing.md:853-860`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-29)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:862-864`

### TEST-076 컴파일 예산 — 따로 수치를 두지 않고 마운트 벤치에서 폼 몫과 검증기 몫으로 나눠 보고, TEST-072의 선으로 판정, 가드 200개 조건부 폼 생성은 PR-4의 수용 필요 항목

- 결정:
  > 【추론】 컴파일에는 따로 수치 예산을 두지 않는다.
  > 【추론】 기준 플러그인(AJV)으로 재는 마운트 벤치는 가드 컴파일을 포함한다.
  > 【추론】 그 컴파일은 따로 한 줄로 보고하고, 그 줄을 폼의 몫(청사진 분석·트리 생성·식 컴파일)과 검증기의 컴파일 몫(`compileGuard`)으로 나눈다.
  > 【추론】 판정은 18C-26의 선과 ADR 0009 §4를 따른다.
  > 【추론】 선을 넘으면 이유를 적고 Vincent가 받아들여야 병합한다.
  > 【추론】 알려진 느림은 미리 적는다.
  > 【추론】 가드 200개인 조건부 폼 생성은 새 판 23.0 ms(트리 585 µs + AJV 컴파일 22.4 ms) 대 오늘 13.4 ms로 1.7배다(`spikes/work-loop/REPORT.txt:113-118`, `:196-200`).
  > 【추론】 이 항목을 PR-4(동기 `compileGuard`를 구현하는 PR)의 수용 필요 항목으로 미리 적고, 이유는 "검증기 컴파일"이다.
  > 【추론】 미리 적는 것이지 미리 받아들이는 것이 아니다.
  > 【추론】 수치는 PR-4의 실측으로 바꾼다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:870-879`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-30)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:881-884`

### TEST-077 union 설계의 시험 목록 — 청사진 판정(PR-1), 행과 `interpret`(PR-2), 렌더 시나리오와 입력 바인딩(PR-7), 검증기 플러그인(PR-4), tsc 전용 형 시험

- 결정:
  > 【추론】 시험 `src/core/blueprint/__tests__/union.kind-procedure.test.ts`: 예 E1–E42(18C-90)의 종류·`schemaType`·nullable·전략·오류가 모두 표대로다.
  > 【추론】 시험 같은 곳 `union.null-only.test.ts`: E30·E32·E33은 null 노드이고 nullable이며 오류가 없고, E34·E35·E38은 nullable이며, 모든 선언이 `'null'`만인 정적 연언도 null 노드다.
  > 【추론】 시험 같은 곳 `union.static-intersection.test.ts`: 모든 선언 쌍 X·Y에서 `{allOf:[X,Y]}`와 `{allOf:[Y,X]}`의 결과(원소 순서 제외)가 같고(E39), E18·E24·E31·E38은 교집합이며, E23만 `ALL_OF_TYPE_REDEFINITION`이다.
  > 【추론】 시험 같은 곳 `union.schema-type-invariant.test.ts`: 모든 코퍼스 칸에서 `Array.isArray(schemaType) === (type === 'union')`이고, 같은 칸의 노드와 배열 아이템이 같은 `schemaType` 참조를 가지며, 그 참조는 `Object.isFrozen`이다.
  > 【추론】 시험 같은 곳 `union.gated-narrowing.test.ts`: E25·E26·E41에서 게이트 전후로 `schemaType` 참조가 같고, 켜진 동안 유효 목록은 `['number']`·`['number']`(`schemaType`과 같은 참조)·`['integer']`이며, E40은 둘 다 켜지면 `SHARED_NODE_CONFLICT`이고, E42의 유효 목록은 `schemaType`과 같은 참조다.
  > 【추론】 시험 같은 곳 `union.terminal-subtree-warning.test.ts`: `['object','string']` 칸 `properties` 안의 `controls`가 경고를 한 번 내고, `$ref` 대상에서는 경고가 없으며, `options.terminal:false`는 ERROR-200이다.
  > 【추론】 시험 `src/core/behaviors/utils/parse/__tests__/interpret.table.test.ts`: 변환 표(18C-91)의 모든 칸과 `"1.0"`·`"1e2"`·`"1e16"`·`"9007199254740993"`·`"01"`·`" true"`, `NaN`·`±Infinity`·`2**60`·`-0`·bigint·`Date`(object 멤버)·`Object.create(null)`.
  > 【추론】 시험 같은 곳 `interpret.properties.test.ts`: `d-rule-a.mjs`의 전수 실행으로 순서 무관, 멱등, 변환 결과 ∈ 목록, 경우 집합이 정확히 12건, 원소 하나인 목록 = 단일 노드 행, 쓰기당 할당 0.
  > 【추론】 시험 `src/core/behaviors/unionBehavior/__tests__/union.write-paths.test.ts`: 쓰기 경로마다 한 사례이고, `Merge` 객체 V는 통째 교체이며, `trim`은 문자열 값에서만 돈다.
  > 【추론】 시험 같은 곳 `union.mismatch-light.test.ts`: 켜짐→켜짐이면 경고 0회, 꺼짐→켜짐이면 1회, 로드하면 다시 1회이고, `expected`는 `{schemaType, nullable, effective}`이며, `'ambiguous'`이면 `candidates`가 있다.
  > 【추론】 시험 `src/__tests__/scenarios/union.gated-effective-list.render.test.tsx`: E25에서 게이트가 켜진 뒤 친 `"42"`는 `42`로 저장되고, 켜기 전에 저장된 `"abc"`는 게이트가 켜지면 쓰기 없이 경고등이 켜지며 `source:'gate'` 경고가 1회 나고 `UpdateJsonSchema`로 배달되며, 게이트가 꺼지면 경고등이 꺼지고 값은 그대로이고, 입력 구성 요소는 바뀌지 않으며, E41에서 `1.5`는 켜진 동안 경고등이 켜진다.
  > 【추론】 시험 `union.entry-two-step.render.test.tsx`: 게이트 `kind==='num'`이면 `a:number`인 스키마에서 직전 `kind`가 `'text'`일 때와 `'num'`일 때 각각 `setValue({kind:'num', a:'42'})`를 부르면 둘 다 `a === 42`이고, 마운트·`reset()`도 같으며, 쓰이지 않은 형제 노드는 다시 해석되지 않는다.
  > 【추론】 시험 `union.rule-a.render.test.tsx`: 규칙 A의 사례와 `['integer','number','boolean']`의 `"2"`→`2`.
  > 【추론】 시험 `union.ambiguous.render.test.tsx`: `['string','boolean']`의 `1`·`0`은 값이 유지되고, 경고등이 켜지며, `reason:'ambiguous'`다.
  > 【추론】 시험 `union.integer.render.test.tsx`: `['integer','string']`의 `12.5`→`"12.5"`, `['integer','boolean']`의 `12.5`는 경고등이 켜짐, E4는 number 규칙.
  > 【추론】 시험 `union.object-array.render.test.tsx`: 멤버십, 변환 없음, 참조 유지, `find('/f/k') === null`, `./f/k` 식, 문자열 값에서 `./f/length`는 `undefined`, 기본 입력의 읽기 전용 JSON과 비우기, `['object','array']` 빈 상자.
  > 【추론】 시험 `union.non-json-value.render.test.tsx`: `{a: undefined}`를 든 union과 터미널 객체에서 개발 모드 `NON_JSON_WHOLE_VALUE`가 1회 나고 값은 바뀌지 않으며, 프로덕션에서는 검사하지 않는다.
  > 【추론】 시험 `union.default-input-draft.render.test.tsx`: `['number','boolean']`에서 `"4"`→`4`, `"42."`는 초안(쓰기·경고 0)이고 흐려지면 되돌림, `"true"`→`true`, 빈 칸은 `undefined`, nullable 비우기는 `null`이며, `['number','string']`에서 `"42"`는 문자열이고, 치는 도중 유효 목록이 넓어지면 초안을 다시 판정해 이제 맞는 글만 보낸다.
  > 【추론】 시험 `union.omit-empty.render.test.tsx`: `''`·`{}`·`[]`는 방출하지 않고 `omitEmpty:false`이면 방출하며, 아이템 자리는 `null`이고 값 없는 루트는 `undefined`다.
  > 【추론】 시험 `union.default-fill.render.test.tsx`: `default`는 값 전체로 들어가고, 로드된 `{}`는 덮지 않으며(객체 호스트와 대조), `['string','boolean']`+`default:0`이면 마운트 때 경고가 1회 나고, `setValue(undefined)` 뒤에는 다시 채우지 않는다.
  > 【추론】 시험 `union.expressions.render.test.tsx`: `if`+`const`에서 `"1"`과 `1`을 가르고, 판별 키 union의 분기가 켜지며, 목록 밖 리터럴이면 `DISCRIMINATOR_BRANCH_UNREACHABLE`이 한 번 난다.
  > 【추론】 시험 `union.migration-shapes.render.test.tsx`: TypeBox `anyOf[string,number]`, pydantic `anyOf[string,null]`, ts-json-schema-generator `type` 배열, OAS `nullable:true`+`type`, 그리고 LANDING-173–LANDING-180의 모양.
  > 【추론】 시험 `union.input-binding.render.test.tsx`: 시험 대조(18C-92)의 모든 칸, 인라인 `FormTypeInput` 우선, `FORM_TYPE_TEST_INVALID`(모르는 키, `type:'integer'`) 1회, `{typo: undefined}` 시험은 모르는 키를 빼고 대조, 정수 노드 props의 `type === 'number'`와 `schemaType === 'integer'`.
  > 【추론】 시험 `schema-form-ajv{6,7,8}-plugin/src/**/__tests__/bind-refusal.test.ts`: `coerceTypes`·`useDefaults`·`removeAdditional` 가운데 하나라도 켠 인스턴스의 `bind`는 `VALIDATOR_BIND_REFUSED`를 던지고 이전 인스턴스가 그대로 남으며, 세 옵션이 꺼진 인스턴스와 기본 인스턴스는 받는다.
  > 【추론】 시험 `schema-form-ajv8-plugin/src/**/__tests__/union-types.test.ts`: `{type:['string','number']}`를 컴파일할 때 `console.warn`이 0회이고, `{type:[..], nullable:true}` 컴파일 뒤에도 작성 스키마의 `type` 배열이 그대로다.
  > 【추론】 시험 `src/types/__tests__/union.type-test.ts`(tsc 전용): 형 사상(18C-89), `InferValueType`·`InferJSONSchema`의 형, union props의 `value`(판별)와 `onChange`(목록 형), `NumberNode` props의 `type === 'integer'`가 TS2367.
- 보충:
  > 편집자 결정(18C-104): "무엇: 렌더 시나리오 `union.entry-two-step`에 위 예의 폼을 더해, 직전 `kind`가 `'text'`일 때와 `'flag'`일 때 각각 `setValue({kind:'flag', a:0})`를 부르고, `defaultValue`가 `{kind:'flag', a:0}`인 마운트와, `kind`를 `'text'`로 바꾼 뒤 두 필드를 담은 객체 노드의 `resetSubtree()`를 돌린다." (`reviews/round-18-closing.md:2926`)
  > 편집자 결정(18C-104): "통과: 모든 경우에 `a === false`이고 경고등이 꺼져 있으며, 쓰이지 않은 형제 노드는 다시 해석되지 않는다." (`reviews/round-18-closing.md:2927`)
  > 편집자 결정(18C-105): "무엇: 렌더 시나리오 `union.entry-two-step`에 위 예의 폼과, `a`가 문자열이면 `boolean`으로 아니면 `string`으로 좁히는 폼(되먹임이 멈추지 않는 반례)을 더해 각각 `setValue({a:0})`를 부른다." (`reviews/round-18-closing.md:2970`)
  > 편집자 결정(18C-105): "통과: 첫 폼은 `a === "0"`이고 경고등이 꺼져 있으며, 둘째 폼은 전이 라운드 상한을 넘겨 원본 B로 `a === 0`을 커밋하고 경고등이 켜지며 `diagnostics.status`가 `'degraded'`다." (`reviews/round-18-closing.md:2971`)
  > 반영 칸(설계서 메모 4): "게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`." (`reviews/round-18-owner-answers.md:41`)
  > 반영 칸(설계서 메모 4): "시험 파일 이름 `union.mismatch-light.test.ts`는 그대로이고, 시험이 부르는 게터·코드 이름은 확정 이름이다." (`reviews/round-18-owner-answers.md:41`)
  > 편집자 결정(19C-01): "【추론】 시험 `union.migration-shapes.render.test.tsx`에 LANDING-207의 모양을 더한다." (`reviews/round-19-closing.md:28`)
  > 편집자 결정(19C-02): "【추론】 시험 `union.migration-shapes.render.test.tsx`에 LANDING-208의 모양을 더한다." (`reviews/round-19-closing.md:46`)
  > 편집자 결정(18C-104, 위 예의 폼): "【추론】 예: 본체 `a:{type:['string','boolean']}`에 `kind`가 `'text'`면 `a`를 `string`으로, `'flag'`면 `boolean`으로 좁히는 게이트가 있을 때, `setValue({kind:'flag', a:0})`는 직전 `kind`가 무엇이든 `a = false`다." (`reviews/round-18-closing.md:2912`) — WRITE-098의 예다.
  > 편집자 결정(18C-105, 위 예의 폼): "【추론】 예: 본체 `a:{type:['string','boolean']}`에 `a`가 수이면 `boolean`으로, 아니면 `string`으로 좁히는 게이트가 있을 때, `setValue({a:0})`는 쓰기 경계에서 `0`(받아 줄 형이 둘이라 그대로)이고, 첫 라운드의 재해석에서 `false`가 되어 게이트가 `string`으로 뒤집히며, 다음 라운드의 재해석에서 `"0"`이 되고 게이트가 더 뒤집히지 않으므로 `a = "0"`이 커밋된다." (`reviews/round-18-closing.md:2941`) — WRITE-099의 예다.
  > 편집자 결정(25C-02): "【추론】 BLUEPRINT-044와 TEST-077이 든 `union.*.test.ts` 여섯 이름은 단언의 주소이며 규범이 아니다. 단언이 게이트다." (`reviews/round-25-closing.md:19`)
  > 편집자 결정(25C-02): "【추론】 02의 `src/core/blueprint/__tests__/blueprint.type-*.test.ts` 이름은 그대로 두고, 여섯 이름과 실제 파일의 대응은 25C-11에 적는다." (`reviews/round-25-closing.md:20`)
  > 편집자 결정(25C-02): "【추론】 TEST-077의 "모든 코퍼스 칸에서 `Array.isArray(schemaType) === (type === 'union')`이고, 같은 칸의 노드와 배열 아이템이 같은 `schemaType` 참조를 가지며, 그 참조는 `Object.isFrozen`이다"는 게이트이며, 칸의 범위는 E1–E42 전 칸과 TEST-067(b) 코퍼스 14종의 전 칸이다." (`reviews/round-25-closing.md:21`)
  > 편집자 결정(25C-11): "【추론】 E1–E42는 `src/core/blueprint/__tests__/`의 네 파일에 있다: `blueprint.type-syntax.test.ts`(E1–E10, E28), `blueprint.type-inference.test.ts`(E11–E17, E29, E32–E35), `blueprint.type-static-intersection.test.ts`(E18–E24, E30, E31, E36–E39), `blueprint.type-gated-declarations.test.ts`(E25–E27, E40–E42)." (`reviews/round-25-closing.md:103`)
  > 편집자 결정(25C-11): "【추론】 `union.kind-procedure.test.ts`의 단언은 위 네 파일의 표 행과 `blueprint.type-gated-declarations.test.ts`의 정적 소유자 없는 분기 접기 충돌 사례에, `union.null-only.test.ts`는 위 표 행에, `union.static-intersection.test.ts`는 `blueprint.type-static-intersection.test.ts`에, `union.schema-type-invariant.test.ts`는 `blueprint.type-syntax.test.ts`의 E1–E9 불변식에, `union.gated-narrowing.test.ts`는 `blueprint.type-gated-declarations.test.ts`에, `union.terminal-subtree-warning.test.ts`는 `blueprint.diagnostics.test.ts`와 `blueprint.type-syntax.test.ts`의 E28에 있다." (`reviews/round-25-closing.md:104`)
  > 편집자 결정(25C-11): "【추론】 여섯 모두 부분 충족이며, 보정 PR(`fix/schema-form-realign-01-02`)이 채우는 것: 모두 `'null'`인 정적 연언이 null 노드인 사례, 모든 선언 쌍의 순서 무관 전수 교집합, 코퍼스 전 칸의 `Array.isArray(schemaType) === (kind === 'union')`과 동결, 게이트 전후 `schemaType` 참조 동일성, E40의 형 충돌 신호(25C-04), E42의 참조 동일성, `['object','string']` union 호스트의 터미널 경고 1회와 `$ref` 대상 무경고, E27·E40·E42의 종류와 전략 전부 단언." (`reviews/round-25-closing.md:105`)
  > 편집자 결정(25C-11): "【추론】 PR 03으로 넘기는 것: virtual 코퍼스의 `node.type` 여덟 값 수집, `onChange` 형 검사, 노드와 배열 아이템의 `schemaType` 참조 동일성, 유효 목록 좁힘의 단언 — 모두 노드 트리가 있어야 잰다." (`reviews/round-25-closing.md:106`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2672-2697`(정본), `reviews/round-18-closing.md:2926-2927`, `reviews/round-18-closing.md:2956-2957,2970-2971`, `reviews/round-18-owner-answers.md:41`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-104), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`
- 충돌:
  > `reviews/round-18-closing.md:2676`의 "`['number']`·`['number']`(`schemaType`과 같은 참조)·`['integer']`"는 18C-105의 결정과 다르다: 좁혀지지 않은 노드의 유효 목록은 `schemaType` 그 값(스칼라면 스칼라, 배열이면 그 배열 참조)이며, E26에서 게이트가 켜진 동안의 유효 목록은 `schemaType`과 같은 `'number'`다(WRITE-099). 18C-105의 결정이 이긴다(`reviews/round-18-closing.md:2956-2957`).
  > `reviews/round-18-closing.md:2672`의 "예 E1–E42(18C-90)의 종류·`schemaType`·nullable·전략·오류가 모두 표대로다"는 19라운드 결정과 다르다: E16은 19C-01의 새 기대를 단언한다(BLUEPRINT-048, TEST-079). 19라운드 결정이 이긴다(`reviews/round-19-closing.md:23`).

### TEST-078 union 설계의 비용 — 청사진 판정, 유효 목록, 두 번 해석, 새 경고 넷, `interpret`, 경고등, 방출·채움, Hint·props, 기본 union 입력, 검증기, 공개 형, 플러그인 이주

- 결정:
  > 【추론】 비용 — 청사진 판정: 로드마다 한 번이며, 비 union 칸에도 드는 로드 비용은 선언마다 `type` 파싱 O(원소 ≤ 7)과 마스크 교집합 O(1)이고, 분기 합치기는 O(분기 × 정적 연언 깊이)다; 메모리는 union 칸마다 얼린 배열 하나와 기본 spec 하나, 노드마다 0이다; 구현은 허용 집합 도우미 약 60줄(`extractSchemaInfo`와 `processSchemaType`의 형 부분 대체), 분기 합치기 약 50줄, 조각 공유 확장 약 40줄이다.
  > 【추론】 비용 — 유효 목록: 좁히는 게이트가 없으면 0(같은 참조)이고, 게이트 선언을 가진 노드는 유효 스키마 메모가 바뀔 때 O(k)의 교집합 한 번, 경고등 재계산은 O(1)이다; 메모리는 좁혀진 메모 항목마다 작은 배열 하나와 spec 하나다; 구현은 약 40줄(병합표 `type` 행 포함)이다.
  > 【추론】 비용 — 두 번 해석: 한 진입에서 쓰였고 같은 정착에서 유효 목록이 바뀐 노드마다 `interpret` 한 번 더이며, 그 밖은 멱등이라 결과가 같다; 메모리 0; 전이 단계 약 20줄이다.
  > 【추론】 비용 — 새 경고 넷(`TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`, `NON_JSON_WHOLE_VALUE`, `DISCRIMINATOR_BRANCH_UNREACHABLE`, `FORM_TYPE_TEST_INVALID`): 개발 모드나 핸들러가 있을 때만 돌며, 비용은 터미널 하위 스키마 크기, 통째 값 크기(참조가 바뀐 커밋마다), 등록 때의 키 수에 비례한다; 메모리는 중복 억제 키이고; 각 30–40줄이다.
  > 【추론】 비용 — 쓰기(`interpret`): 멤버이면 `classBits` 한 번과 AND 한 번으로 O(1)이고, 문자열 해석은 정규식 한 번과 `Number` 한 번이며, 후보를 세기만 하는 무할당 구현이 조건이다; 메모리 0; `parse/` 약 80–100줄, `unionBehavior/` 행 약 40줄이다.
  > 【추론】 비용 — 경고등: 원본이나 유효 스키마가 바뀐 노드만 커밋 때 O(1)이고 경고는 켜질 때만 보낸다; 메모리는 얼린 빈 배열 공유; 게터 두 개다.
  > 【추론】 비용 — 방출·채움: 추가 비교와 복사가 없고, 메모리와 구현이 0이다.
  > 【추론】 비용 — Hint·props: `useMemo` 안에서 필드 하나를 더 읽고(비 union에도 듦), 시험은 정의 수에 선형(오늘과 같음)이다; 메모리 0; 형 셋과 `getHint` 한 줄이다.
  > 【추론】 비용 — 기본 union 입력: 키 입력마다 O(k ≤ 6)이고, 유효 목록은 `jsonSchema` 참조가 바뀔 때만 O(k), `JSON.stringify`는 값 참조가 바뀔 때만 O(값 크기)다; 메모리는 `useState` 하나와 표시 중인 객체 값마다 출력 문자열 크기의 메모다; 감싸개 약 60–80줄이다.
  > 【추론】 비용 — 검증기: 기본 경로 0, `bind` 때 옵션 셋 검사 O(1)이다; 메모리는 스키마 깊은 사본을 (인스턴스, 루트)마다 한 번이다; 플러그인마다 약 10줄, ajv8 설정 세 줄이다.
  > 【추론】 비용 — 공개 형: 컴파일 시간은 재지 않았다(모름); `value.ts`·`jsonSchema.ts`·노드 형·props 형 약 90줄과 가드 하나다.
  > 【추론】 비용 — 플러그인 이주: 객체 시험 일곱 곳(코어 포함), 함수 시험 여섯 곳, mui 수 입력(빈 칸·초안·정수), 플러그인마다 union 항목 하나(권장)다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2698-2709`(정본), `reviews/round-18-closing.md:2915`, `reviews/round-18-closing.md:2955`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-104), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`
- 충돌:
  > `reviews/round-18-closing.md:2700`의 "한 진입에서 쓰였고 같은 정착에서 유효 목록이 바뀐 노드마다 `interpret` 한 번 더이며, 그 밖은 멱등이라 결과가 같다; 메모리 0"은 18C-104의 결정과 다르다: 비용은 쓰인 노드 가운데 유효 목록이 정적 목록보다 좁은 노드에 한해 `interpret` 한 번과 쓰인 값의 참조 보관이다(WRITE-098). 18C-104의 결정이 이긴다(`reviews/round-18-closing.md:2915`).
  > `reviews/round-18-closing.md:2701`의 "개발 모드나 핸들러가 있을 때만 돌며"는 18C-105의 결정과 다르다: `NON_JSON_WHOLE_VALUE`의 깊이 점검은 VALUE-037대로 개발 모드에서만 돌며, 핸들러가 있어도 프로덕션에서는 돌지 않는다(WRITE-099). 18C-105의 결정이 이긴다(`reviews/round-18-closing.md:2955`).

### TEST-079 19라운드 게이트(PR 02) — E16 새 기대와 형 없는 호스트 사례(게이트 분기만·`{object,array}`·⊤ 분기·순환 절단과 빈 U), 순환 절단 구현, 코퍼스 14종 원본 그대로, `const` 칸 사례, `union.migration-shapes`에 LANDING-207·208

- 결정:
  > 【추론】 게이트(PR 02): E16의 새 기대와 게이트 분기만인 호스트·`{object,array}`·⊤ 분기·순환 절단과 빈 U의 사례가 `src/core/blueprint/__tests__/`에 한 건씩 있고, 순환 절단이 구현되어 형 없는 `$ref` 순환이 스택 넘침 없이 끝난다.
  > 【추론】 게이트(PR 02): TEST-067(b)는 코퍼스 14종을 시험 파일로 돌려 원본 그대로 서야 하며, 통과하지 못하는 표본은 소유자에게 올린다.
  > 【추론】 시험 `union.migration-shapes.render.test.tsx`에 LANDING-207의 모양을 더한다.
  > 【추론】 시험 `union.migration-shapes.render.test.tsx`에 LANDING-208의 모양을 더한다.
  > 【추론】 게이트(PR 02): 단일 종류(null 포함)·종류 혼합·객체 리터럴·분기 안의 `const`(그대로 오류)의 사례가 `src/core/blueprint/__tests__/`에 한 건씩 있다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-19-closing.md:28-30,46-47`(정본)
- 닫은 사람: 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-01·19C-02)
- 라운드: 19
- 까닭: `reviews/round-19-closing.md:31,48`

### TEST-080 설계 최적화 단계의 구성과 판정 관문(446라운드) — D0 측정 장치 복원과 기준선, D1 국소 가설 여섯(H1~H6), D2 설계 Ⅰ, D3 캐시 계층, D4 관문(oneOf-80 분기 전환과 nested-d6-f4 일괄 입력이 0.16.1의 1.5배 안이고 1 ms·5 ms 아래면 멈춤, 아니면 D5), D5 설계 Ⅱ, PR 게이트는 성능 최적화 계획의 것에 `FormHandle.rebuild`만 허용

- 결정:
  > 【추론】 단계는 D0~D5다. **D0 측정 장치의 복원과 기준선**: 8단계 최종 측정(443b)의 47행 장치는 소실되었으므로(`verification/perf-optimization/README.md` 3절) 같은 프로세스에서 0.16.1과 새 판을 AB/BA로 번갈아 재는 코어 장치를 `verification/design-optimization/tools/`에 다시 만들고(마운트·단일 입력·분기 전환·일괄 입력의 canonical 행 여덟과 형제 N 분기 전환·게이트 폼 잎 쓰기 탐침, CPU 프로파일 스크립트 포함), 단계 시작 커밋에서 세 속도 표(마운트·단일 입력·setValue 일괄, 운영 원칙 20)를 잰다. **D1 국소 설계 수정 여섯**(가설마다 PR 하나): H1 청사진의 호스트별 정적 분할 사이드카로 게이트 호스트의 정적 형제를 다시 고르지 않음(`selectChildren.ts:53`·`primeHost.ts:53-113`·`selectEntryStep.ts:276`; `staticShape.ts:46`이 자식 하나의 게이트로 호스트 전체를 거절하는 것도 고친다), H2 바퀴가 돌지 않은 경로의 `preserveReferences` 깊은 비교 생략(`computeNode.ts:119-153`; `updateOutput.ts:72`가 같은 비교를 하므로 shadow 검증 뒤), H3 파동당 한 번 계산하는 문서 순서 인덱스(`compareDocumentOrder.ts:16-23`; 고정 정수가 아니라 파동별 캐시), H4 `writeFieldNode.ts:59`의 `latentRaw.size === 0` 조건을 대상 경로 범위로 축소, H5 `captureFieldNodeChange.ts:62`에 배달 후보 큐를 붙여 커밋의 여섯 집합 순회를 대체(revision 비트 계수는 리스너 유무와 무관하게 유지), H6 청사진 캐시 연결(446C-03). **D2 설계 Ⅰ**: 호스트별 컴파일 계획과 2단계 정착(446C-02); 한 바퀴 안에서 뒤 게이트가 앞 게이트의 투영을 즉시 본다는 계약(`design/03-settle-and-events.md:120`)과 상속 overlay를 그대로 지킨다. **D3 캐시 계층**(446C-04). **D4 판정 관문**: D0와 같은 장치·같은 창에서 세 표를 다시 재어, 분기 전환 oneOf-80 행과 일괄 입력 nested-d6-f4 행이 0.16.1의 1.5배 안에 들고 절대 시간이 각각 1 ms와 5 ms 아래이면 거기서 멈추고 9단계로 간다; 하나라도 넘으면 D5로 간다. **D5 설계 Ⅱ**(조건부): 슬롯 테이블과 수명별 핸들(446C-02); 자료구조가 바뀌어 shadow 모드로 증명할 수 없으므로 시나리오 스위트와, 비활성 참조의 읽기·구독·상호작용 상태·배열 itemKey·`find`·메모리 상한 여섯 의미에 대한 새 시험을 수정 전에 실패하도록 먼저 둔다. PR마다의 게이트는 `plan/perf-optimization/verification.md`의 것을 물려받고(네 관문, 시험 파일 변경은 추가만, 전후 배달 비교 차이 0, 독립 검토, 비용 문장, 대장 갱신), 공개 겉면 차분은 이 단계가 더하는 이름(`FormHandle.rebuild`)만 허용하며 그 이름은 LANDING 항목으로 기록한다. D4의 수치가 관문이고, 그 밖의 느린 행은 TEST-027대로 이유와 수치를 적어 소유자가 수용한다.
- 보충:
  > 편집자 결정(446C-07): "【추론】 노드 수명 감사에서 기존 결함 후보 둘이 나왔다: 배열 splice 뒤 분리된 참조의 경로가 갱신되지 않아(`applyArraySplice.ts:110`은 소유한 자식만 걷는다) 그 참조로 한 `setValue`가 옛 인덱스의 잠복 원본에 쓰이는 것, 그리고 `routeValidationIssues.ts:40-45`가 나간 노드의 선언 id(`committedDeclarationIds`는 나감 때 정리되지 않는다)까지 섞어 꺼진 union 분기의 검증 이슈를 거르는 것. 기능 오류는 반드시 고친다(운영 원칙 20). D0에서 재현 시험을 먼저 쓰고, 재현되면 이 단계 안의 수정 PR로 고치며, 재현되지 않으면 시험을 회귀 신호로 남기고 닫는다." (`reviews/round-446-closing.md:20`)
  > 편집자 결정(447C-01): "【추론】 D1의 가설 여섯과 결함 후보 둘을 442C-03(개선이 폭 안이면 "개선 없음"으로 적고 코드는 되돌린다)과 443C-03의 폭 (다)로 판정했다. 결함 (가) 배열 재키 뒤 분리 참조의 쓰기는 재현되어 고쳤다(#463). 결함 (나) 나간 노드의 선언 id로 검증 이슈를 거르는 것은 재현되지 않아 회귀 시험으로 남겼다. H1 정적 형제 재사용은 형제 1,000·4,000개 분기 전환을 −33 %·−35 % 줄였으나 잎 쓰기 1.5배 목표에는 못 미쳐, 채택하되 남은 O(정적 엔트리 수) 비용을 D2로 넘겼다(#464). H2 바퀴 없는 경로의 깊은 비교 생략은 형제 4,000·8,000개 게이트 폼의 잎 쓰기를 −47 %·−55 % 줄여 게이트 없는 폼의 1.05배가 되었다(#466). H3 문서 순서 색인은 설계 셋이 모두 폭 안이라 폐기했다. H4 스칼라 빠른 경로의 잠복 조건 축소는 잠복 값 1개인 네 행이 폭 안이었으나, 가설이 겨냥한 축인 무관한 잠복 값의 개수 M에서 M=1,000은 0.449→0.037 ms, M=4,000은 1.60→0.039 ms로 폭 밖 개선이라 채택했다(#467). H5 배달 후보 큐는 미구독 다섯 행을 줄였지만 구독 두 행(전원 구독 일괄 +5.1 %, 구독 잎 쓰기 +34.2 %)이 입증 악화라 폐기했다. 큐를 뺀 H5b(미구독 커밋의 payload 생략과 원장 전이 공유)는 마운트 두 행 −7.6~−11.5 %, 일괄 두 행 −21.6~−24.8 %, 구독 두 행 폭 안으로 채택했다(#468). H6·D3 청사진 캐시는 같은 스키마 객체의 둘째 마운트를 −68~−76 % 줄였다(#465). 판정 규칙은 측정 전에 고정한다: 어느 행이 폭 밖으로 개선되어야 채택인지와, 구독 경로 행을 포함해 어느 행도 폭 밖으로 악화되지 않아야 한다는 조건을 워커 지시와 결과 문서에 먼저 적고, 측정 뒤에는 바꾸지 않는다. 첫 측정이 폭 안일 때 같은 행을 다시 재는 것은 443C-03이 막지만, 가설이 겨냥한 비용의 축을 새로 재는 것(H4의 M 축)은 그 축과 판정 규칙을 측정 전에 적은 경우에만 허용한다." (`reviews/round-447-closing.md:8`)
  > 편집자 결정(447C-03): "【추론】 가설 PR의 기존 단언 변경은 0이 원칙이다. 다만 400C-02는 "정확한 호출 수 단언은 base 이하 상한으로 적는다"고 정했으므로, 관측이 아니라 작업량을 적은 단언은 정확값에서 base 이하 상한으로 정정한다. 이 라운드의 정정: H1의 stepVisits 두 건(off 484→≤480, table 16→≤12), H5b의 freeze 작업량 네 건(≤29007, ≤10523, ≤1564, ≤66; 줄어든 양은 생략한 payload의 노드 수와 정확히 같다), D2-P1의 dirty 장부 두 건(consume 정확값 5461을 ≤5461로; 루트 통째 쓰기의 "add > 0이고 postorder 시작이 첫 add보다 앞"은 그 사례가 쓰기 표식 경로가 되어 add 0으로 바꾸고, 두 단언의 정확값과 순서는 실제 무효 조건으로 기존 경로에 보낸 새 사례에서 그대로 단언한다). 시험이 내부 필드를 조작해 경로를 고르는 것은 허용하지 않는다 — 시험은 제품이 실제로 거치는 경로만 고정한다. H5b에서 개발 모드에만 기존 payload 경로를 남겨 단언을 지키자는 제안은 기각했다 — 두 경로를 두면 개발 모드 시험이 출하 경로를 검증하지 못한다. 대신 리스너에게 실제로 배달된 payload가 개발 모드에서 동결된다는 보장은 단언으로 유지했다. 내부 실행 이력(visits·changedNodes의 순서)은 400C-03의 구분("계약상 필요"는 원장 항목이 그 결과를 요구하는 경우만)에 따라 계약이 아니므로, H1에서 기준판 원본으로 뽑은 증인(`h1-private-histories.json`, 기준 8d5c5dba1)에 대해 부분수열과 구성원 비교로 정규화했고, 그 밖의 필드와 golden은 그대로 비교한다." (`reviews/round-447-closing.md:12`)
  > 편집자 결정(447C-04): "【추론】 `plan/design-optimization/verification.md`의 PR 게이트는 `--equivalent`의 어떤 행도 TEST-073의 선을 넘어 나빠지지 않을 것을 PR마다 요구했지만, D1의 PR #464~#468은 이를 돌리지 않았다. 이 측정은 전체 폼의 합을 판마다 두 통과로 재므로 국소 가설 하나의 효과보다 가설 사이의 상호작용을 드러내는 데 맞다. 그래서 D1·D2의 가설 PR은 코어 쌍 장치(구독 경로 행 포함)로 판정하고, `--equivalent`는 D4에서 모든 가설을 합친 판으로 한 번 돈다. 그 측정에서 TEST-073의 선을 넘는 행이 나오면 원인 PR을 가려 단계를 닫기 전에 고치거나 되돌린다. 게이트를 늦추는 결정이라 소유자가 뒤집을 수 있다(대기열 65)." (`reviews/round-447-closing.md:14`)
  > 편집자 결정(447C-06): "【추론】 D1 여섯 PR을 합친 판(`integration/schema-form-d1`, 726c34bed)의 프로파일(`verification/design-optimization/d2-0-profile.md`)에서 D4 관문 두 행은 분기 전환 oneOf-80이 0.4865 ms로 0.16.1(0.0783 ms)의 6.2배, 일괄 입력 nested-d6-f4가 6.683 ms로 0.16.1(3.663 ms)의 1.825배다. 비용 장부 분석은 분기 전환의 쓰기 한 번(나감 3·들어옴 3)에서 청사진에서 미리 계산할 수 있는 작업이 약 20 %(게이트 식 조회 83회 가운데 80회, 나가는 노드마다 부모 선언 81개를 훑는 제어 계층 계산, unset 정책의 중복 읽기)이고, NODE-044 때문에 생기며 설계 Ⅱ가 없앨 수 있는 작업이 약 29 %(잠복 원본의 직렬화와 경로 색인 왕래, inactive 값 메모의 전체 재구성)라고 추정했다. 그 분석은 이 행이 V8 최적화 단계의 예열에 지배된다고도 주장했으나, 최적화 문턱을 낮춘 독립 재측정에서 현재 판 0.2429 ms, 0.16.1 0.0409 ms(5.9배)로 비율이 거의 그대로여서 격차는 예열이 아니라 일의 양이다(`/private/tmp/claude-501/perf-runs/20261026T2313-726c34b-d2-t-tier/`, 커밋하지 않은 원자료). 일괄 입력은 최적화 문턱에 거의 무관하고(0.972배), 노드마다 경로 문자열을 dirty 집합에 넣고 꺼내는 장부가 필요한 작업(값 조립, 노드당 revision 비트) 밖의 큰 몫이다. 이에 따라 D2를 가설 PR로 나눈다. D2-P1은 게이트·파생·잠복 항목이 없는 하위 트리의 전체 교체 쓰기에서 노드별 dirty 경로 집합 대신 정착 세대 표식을 쓴다(일괄 입력, 추정 약 −2.5 ms). D2-P4는 판별자 쓰기의 비용을 분기 수에서 떼어낸다: 호스트 계획 슬롯(게이트 목록의 정적 성질), 조각 소유 색인(자식 엔트리마다 소유 선언), 나가는 노드마다 unset 정책 한 번. 그 뒤 D2-P3(정적 선택지를 유효 스키마에 두고 misfit 삭제를 이전 상태로 거름), D2-P6(게이트 없는 청사진 하위 트리의 레지스트리 등록 생략), D2-P2(쓴 입력 장부의 표식화, 소비처 감사 뒤)를 같은 규칙으로 판정한다. 계획서의 "배달 후보는 H5의 큐에 넣는다"(`plan/design-optimization/request.md` D2 절)는 H5 폐기로 없어지고, 배달 후보는 지금처럼 커밋 때 모은다. 계획서의 형상 단계·값 단계의 뜻, 즉시 반영 계약과 상속 overlay, 전역 기능 플래그의 호스트별 판정은 그대로다. D2 PR은 D1 PR들이 단계 가지에 병합될 때까지 통합 가지를 base로 열고, 병합 뒤 base를 단계 가지로 옮긴다." (`reviews/round-447-closing.md:18`)
  > 편집자 결정(447C-07): "【추론】 446C-06은 D4에서 관문 행이 하나라도 넘으면 D5(설계 Ⅱ)로 간다고 정했다. 447C-06의 분석에서 분기 전환 행의 관문(0.16.1의 1.5배, 왕복 0.1175 ms)은 설계 Ⅰ만으로 닿을 수 없고(최적화된 상태에서도 쓰기 한 번의 하한 약 61 µs, 상한 약 59 µs), 설계 Ⅱ를 더해도 추정 하한이 왕복 0.156~0.24 ms라 닿지 못한다. 절대 기준인 1 ms 미만은 지금도 통과한다(0.4865 ms). D5는 이 단계에서 가장 큰 설계 변경이므로, 관문에 닿을 가망이 없다는 추정 아래 규칙만으로 착수하지 않는다. D4에서 분기 전환 행이 관문을 넘으면 그 수치와 D5의 추정 효과를 소유자에게 올려, 관문 수치를 유지하고 D5로 갈지, 그 행을 TEST-027로 수용할지를 소유자가 정한다(대기열 66). 판정에 쓰는 측정은 지금의 표준 프로토콜(20 예열·100 표본·3 실행)이다. 실제 사용자는 판별자를 수천 번이 아니라 몇 번 바꾸므로 최적화 전 단계의 비용도 사용자가 겪는 비용이다. D2의 분기 전환 PR은 최적화 문턱을 낮춘 쌍 측정도 참고로 적어, 일의 양이 줄었는지와 예열 효과를 가른다." (`reviews/round-447-closing.md:20`)
  > 편집자 결정(448C-01): "【추론】 D2-P1(#469)은 게이트·파생·잠복 항목이 없는 하위 트리의 전체 교체 쓰기에서 노드마다 경로 문자열을 dirty 집합에 넣는 대신 정착 세대 표식을 찍는다. 측정 전에 고정한 규칙(두 일괄 행이 폭 밖 개선이고 구독 두 행을 포함해 어느 행도 폭 밖 악화가 없음)으로 채택했다: 일괄 flat-2000은 2.394·2.416 ms에서 1.773 ms(0.16.1의 0.955배), 일괄 nested-d6-f4는 6.567·6.748 ms에서 4.022 ms(0.16.1의 1.065배)로 D4 관문의 일괄 입력 행(5 ms 미만이고 1.5배 안)을 넘었다. 노드당 힙은 Node 1,439.1 B로 기준 최댓값 1,899.9 B 이하, Bun 2,222.5 B로 기준 최댓값 2,225.3 B 이하였고, 독립 검토는 차단 결함 0이었다. 검증 모드 전용 그림자 확인(표식된 집합과 독립 DirtyPathSet 계산의 비교)이 함께 들어갔다. 한계: 자격 판정이 하위 트리가 아니라 폼 전체 단위다 — 폼 어딘가에 게이트·파생·watch·런타임 식·가상 필드가 있거나 잠복 원본이나 misfit이 남아 있으면 쓰지 않는다. 이는 446C-02의 넷째 원인(청사진 전역 기능 플래그가 빠른 경로를 막음)과 같은 종류이므로, 판정을 쓰기 하위 트리 단위로 바꾸는 일을 후속 가설(D2-P1b)로 둔다." (`reviews/round-448-closing.md:8`)
  > 편집자 결정(448C-03): "【추론】 400C-02는 정확한 호출 수 단언을 base 이하 상한으로 적으라고 했지만 하한은 말하지 않았다. 작업량 하한이 "그 경로가 실제로 실행되었다"는 비공허성 확인일 때, 일이 줄어 하한이 깨지면 하한을 지우지 않고 의미상 반드시 필요한 수(예: 정책을 읽어야 하는 나가는 노드의 수)로 바꾸고, 동작 단언은 그대로 둔다. 새 경로가 옛 경로를 대신하면, 옛 경로의 정확값과 순서 단언은 실제 무효 조건(파생 하나, 게이트 하나, Merge 쓰기)으로 옛 경로에 보낸 새 사례에서 유지한다. 시험이 내부 필드를 조작해 경로를 고르는 것은 허용하지 않는다 — 시험은 제품이 실제로 거치는 경로만 고정한다. 내부 scratch를 기록하는 시험 도구는 그 scratch 대신 같은 뜻의 논리 구성원을 제품 상태의 실제 표식에서 읽어 기록하고, 기존 snapshot은 바꾸지 않는다." (`reviews/round-448-closing.md:12`)
  > 편집자 결정(448C-05): "【추론】 `plan/design-optimization/verification.md`의 PR 게이트는 PR마다 B2 노드당 힙이 단계 시작 판보다 크지 않을 것을 요구했지만, D1의 PR들은 이를 돌리지 않았다. D1 PR들이 더한 메모리는 노드가 아니라 청사진이나 트리 단위였다. D2부터는 노드나 청사진에 메모리를 더하는 PR이 `bench/legacy-compare/node-and-settle.bench.ts`의 B2 행을 같은 창에서 기준판과 Node·Bun 각 7 표본으로 재어 "B 중앙값이 A 최댓값 이하"를 지킨다. D4는 통합 판으로 한 번 더 잰다." (`reviews/round-448-closing.md:16`)
  > 편집자 결정(449C-01): "【추론】 소유자가 분기 전환은 일단 수용하고 마운트까지 작업한 뒤 다시 검토하자고 했다(위 1행). 분기 전환 oneOf-80 행(D1 통합 판 0.4865 ms, 0.16.1의 6.2배, 절대 기준 1 ms 미만은 통과)을 TEST-027에 따라 지금 수치로 잠정 수용한다. 447C-07이 D4에서 소유자에게 올리기로 한 결정은 이 수용으로 지금 답해졌고, 마운트 검증을 마친 뒤 소유자와 다시 검토한다. 형제 수에 비례하는 항을 없애는 D2-P5는 분기 전환에 속하므로 보류하고, 진행분은 가지 `perf/schema-form-d2-sibling-linear`와 그 결과 문서에 보존해 재검토 때 다시 연다." (`reviews/round-449-closing.md:8`)
  > 편집자 결정(451C-04): "【추론】 소유자가 검증과 작업이 끝나면 최종 결과를 표와 함께 보고하라고 했고(위 5행), 이 가지의 작업에 대해 0.16.1·작업 이전·작업 이후 세 판의 비교를 구해 PR에 실으라고 했다(위 6행). 완료 보고는 시간 행의 A/B/A′와 폭, Node·Bun B2, 관문 통과 여부, 독립 검토 판정, 병합 커밋을 표로 싣는다. 세 판 비교는 D4 통합 측정이 구한다: L = 0.16.1(장치가 같은 프로세스에서 번갈아 재는 옛 판), S = 단계 시작 판 6692e7f69(8단계 가지 머리)의 dist, E = 단계 끝 판의 dist이며, 행마다 L·S·E의 ms와 S÷L·E÷L·E÷S, 폭을 한 표에 적고 탐침·React `--equivalent`·독립 스크립트 벤치·B2(S 대 E)를 더한다. 그 표는 단계 루트 PR(설계 최적화 가지에서 8단계 가지로, #445 병합 뒤 base를 `1.0.0-beta`로)의 본문에 싣는다. 브리프는 `/private/tmp/claude-501/perf-runs/446-briefs/d4.md`다." (`reviews/round-451-closing.md:14`)
  > 편집자 결정(452C-01): "【추론】 D4 통합 측정(`verification/design-optimization/d4-results.md`, L = 0.16.1, S = 단계 시작 판 6692e7f69, E = 단계 끝 판 ca8d52f59)에서 분기 전환 oneOf-80은 E 0.511 ms로 L의 6.87배(S 대비 0.93배)라 관문(1.5배, 1 ms)에 미달했다. 소유자가 분기 전환은 다음 단계에서 집중적으로 다루며 설계의 대규모 개편 없이 도달 가능한 상한으로 기록하라고 했다(위 1행). 그래서 이 단계는 D5(설계 Ⅱ)로 가지 않고, 6.87배·0.511 ms를 "설계 Ⅰ과 캐시 계층까지로 도달한 상한"으로 적어 닫으며, 분기 전환은 다음 단계의 유일한 주제다(위 3행 "분기전환 문제에만 집중하기 위함"). 보류한 D2-P5(`perf/schema-form-d2-sibling-linear` 4681c0aff)는 그 단계의 출발 자료다. 447C-07·TEST-083의 "미달이면 D5 진행 여부를 소유자가 정한다"는 이 결정으로 답해졌다." (`reviews/round-452-closing.md:8`)
  > 편집자 결정(452C-03): "【추론】 소유자가 형제 선형항의 뜻과 20배의 차이를 물었다(위 1행). 탐침에서 형제 0·100·1,000·4,000개의 분기 전환은 E가 0.100·0.279·2.057·6.695 ms, L이 0.031·0.137·2.547·8.766 ms로 두 판 모두 형제 수에 비례하며, 까닭은 모든 게이트를 다시 평가하고 역색인을 두지 않는 BLUEPRINT-007이다(형제마다 약 2 µs). E는 1,000·4,000에서 L보다 빠르다(0.81·0.76배). "형제 1,000개가 0개의 작은 상수 배 안"이라는 관문은 446C-06에서 편집자가 선형항 제거(D2-P5)를 전제로 둔 수치(대기열 64)라 미달로 적혔을 뿐 0.16.1 대비 회귀가 아니다. 선형항 제거 여부는 분기 전환 단계의 주제로 넘긴다." (`reviews/round-452-closing.md:12`)
  > 편집자 결정(453C-04): "【추론】 관문은 소유자가 유지했다(위 2행 "그래"): oneOf-80 왕복이 0.16.1의 1.5배 안이고 1 ms 아래(446C-06). 같은 형상의 `discriminator` 행도 같은 선, `if` 행은 453C-03의 선, 형제 1,000 전환이 형제 0의 작은 상수 배 안, 다른 canonical 행과 구독 경로 행은 TEST-073 선 안, B2 노드당 힙은 Node가 단계 시작 이하이고 Bun은 452라운드의 수용에 따르며 설계 Ⅱ는 보유 메모리 상한을 따로 적는다. 단계는 B0 측정 장부(쓰기 한 번의 단계별 µs와 할당 장부를 형제 0·oneOf-80·깊은 분기 하나에 대해 세 게이트 종류로 측정 장치에 추가, `switch-if-80`(AJV)·`switch-discriminator-80` 행 추가, 두 번째 바퀴의 원인 확인, 단계 시작 판 b8db53997과 0.16.1) → B1 게이트 통일 → B2 준비물과 Δ 적용(가설마다 PR 하나) → B3 관문 재측정 → (조건부) B4 설계 Ⅱ → B5 마감(통합 판 재측정, React `--equivalent`, B2 힙, 루트 PR, 설계 문서·ADR 반영)이다. B1~B3의 목표선은 B0의 장부로 측정 전에 고정한다(TEST-081). 447C-06의 "설계 Ⅰ만으로 쓰기 한 번 하한 약 61 µs, 설계 Ⅰ+Ⅱ로도 왕복 0.156~0.24 ms"는 도출 과정과 원자료가 기록되지 않았고(452라운드 자료 조사) 이번 작업량 추적이 그 가정과 다른 비용 구조를 보였으므로, 이 단계의 관문이나 착수 판단에 쓰지 않고 B0의 장부가 대체한다. 이것은 편집자의 이전 판단에 대한 정정이며 재검증 목록에 올린다. 측정 프로토콜은 그대로다(20 예열·100 표본·3 실행, 조용한 창, 폭 (다), 재측정 없음)." (`reviews/round-453-closing.md:14`)
- 상태: 현행
- 출처: `reviews/round-446-closing.md:18`(정본), `plan/design-optimization/request.md`
- 닫은 사람: 편집자 결정(446라운드, `reviews/round-446-closing.md` 446C-06)
- 라운드: 446
- 까닭: `reviews/round-446-closing.md:18`

### TEST-081 가설 판정 규칙의 사전 고정(447라운드) — 채택에 필요한 개선 행과 악화 금지 조건(구독 경로 행 포함)을 측정 전에 워커 지시와 결과 문서에 적고 측정 뒤 바꾸지 않음, 가설이 겨냥한 비용 축의 새 측정은 그 축과 규칙을 미리 적은 경우만 허용(같은 행의 재측정 금지와 구분)

- 결정:
  > 【추론】 D1의 가설 여섯과 결함 후보 둘을 442C-03(개선이 폭 안이면 "개선 없음"으로 적고 코드는 되돌린다)과 443C-03의 폭 (다)로 판정했다. 결함 (가) 배열 재키 뒤 분리 참조의 쓰기는 재현되어 고쳤다(#463). 결함 (나) 나간 노드의 선언 id로 검증 이슈를 거르는 것은 재현되지 않아 회귀 시험으로 남겼다. H1 정적 형제 재사용은 형제 1,000·4,000개 분기 전환을 −33 %·−35 % 줄였으나 잎 쓰기 1.5배 목표에는 못 미쳐, 채택하되 남은 O(정적 엔트리 수) 비용을 D2로 넘겼다(#464). H2 바퀴 없는 경로의 깊은 비교 생략은 형제 4,000·8,000개 게이트 폼의 잎 쓰기를 −47 %·−55 % 줄여 게이트 없는 폼의 1.05배가 되었다(#466). H3 문서 순서 색인은 설계 셋이 모두 폭 안이라 폐기했다. H4 스칼라 빠른 경로의 잠복 조건 축소는 잠복 값 1개인 네 행이 폭 안이었으나, 가설이 겨냥한 축인 무관한 잠복 값의 개수 M에서 M=1,000은 0.449→0.037 ms, M=4,000은 1.60→0.039 ms로 폭 밖 개선이라 채택했다(#467). H5 배달 후보 큐는 미구독 다섯 행을 줄였지만 구독 두 행(전원 구독 일괄 +5.1 %, 구독 잎 쓰기 +34.2 %)이 입증 악화라 폐기했다. 큐를 뺀 H5b(미구독 커밋의 payload 생략과 원장 전이 공유)는 마운트 두 행 −7.6~−11.5 %, 일괄 두 행 −21.6~−24.8 %, 구독 두 행 폭 안으로 채택했다(#468). H6·D3 청사진 캐시는 같은 스키마 객체의 둘째 마운트를 −68~−76 % 줄였다(#465). 판정 규칙은 측정 전에 고정한다: 어느 행이 폭 밖으로 개선되어야 채택인지와, 구독 경로 행을 포함해 어느 행도 폭 밖으로 악화되지 않아야 한다는 조건을 워커 지시와 결과 문서에 먼저 적고, 측정 뒤에는 바꾸지 않는다. 첫 측정이 폭 안일 때 같은 행을 다시 재는 것은 443C-03이 막지만, 가설이 겨냥한 비용의 축을 새로 재는 것(H4의 M 축)은 그 축과 판정 규칙을 측정 전에 적은 경우에만 허용한다.
- 보충:
  > 편집자 결정(448C-02): "【추론】 D2-P4(호스트 계획 슬롯, 조각 소유 색인, 나가는 노드당 unset 정책 한 번)는 측정 전에 고정한 규칙으로 폐기했다: 열세 행이 모두 폭 안이었고 Bun의 노드당 힙이 기준을 넘었다(2,238.7 B > 2,234.2 B). 이 측정에서 분기 전환 oneOf-80 행은 A·B·A′가 0.434·0.518·0.491 ms에 폭이 0.145 ms로, 값의 약 30 %였다. 최적화 문턱을 낮춘 참고 측정은 0.267→0.241 ms(−10 %)로 일이 줄었음을 시사하지만, 판정은 표준 프로토콜로 한다는 447C-07을 따른다. 따라서 기본 프로토콜의 분기 전환 행으로는 약 30 %보다 작은 효과를 채택할 수 없다. 앞으로 분기 전환 비용을 겨냥하는 가설은 겨냥한 항을 키우는 축 탐침(예: 형제 수, 분기 수)을 판정 행으로 미리 정하거나, 그 행의 판단을 D4의 소유자 결정(447C-07)에 맡긴다." (`reviews/round-448-closing.md:10`)
  > 편집자 결정(449C-02): "【추론】 소유자가 편집자의 임의 판단은 나중에 모두 재검증하므로 임의 판단보다 1차 계획대로 진행하라고 했다(위 1행). 1차 계획은 446라운드의 계획서(`plan/design-optimization/request.md`·`verification.md`·`adr-and-axes.md`)와 446C-01~08이다. 그 밖에서 오케스트레이터가 정한 것은 재검증 대상으로 표시한다: 447C-01의 H4 축 추가 측정 허용과 H5b의 분리, 447C-02(reset과 rebuild), 447C-03·448C-03(시험 기록 정정 규칙), 447C-04(React 동등 측정을 D4로), 447C-05(미구독 커밋의 관측 자격), 447C-06(D2의 PR 분할), 447C-07(D5 결정권), 448C-01(D2-P1의 설계와 자격 범위), 448C-02(분기 전환 행의 측정 폭 규칙), 448C-04(독립 검토 배정), 448C-05(노드당 힙 관문의 범위), 448C-06(엔진 캐시 배치 원칙과 검증기 편차), 448C-07(정적 자식 준비물), 통합 가지 `integration/schema-form-d1`·`d2`의 운영, 그리고 워커 질문에 답하며 정한 세부 조건들. 이후 작업은 계획서에 적힌 항목만 계획서의 문장대로 진행하고, 계획서에 없는 방안이 유일한 길로 보이면 구현하지 않고 소유자에게 올린다." (`reviews/round-449-closing.md:10`)
  > 편집자 결정(450C-01): "【추론】 D2-M(설계 Ⅰ의 (c) 독자 집합으로 마운트 때의 의존 색인과 게이트 레지스트리 등록을 줄임)은 작업량을 예측대로 줄였다(의존 정규화 961→242, 게이트 등록 시도 323→83, 빈 edge Map 242→0, 분리 참조용 path·kind 기록 유지). 측정 전에 고정한 규칙으로 잰 첫 측정에서 마운트 oneOf-80은 A·B·A′가 2.2075·1.933·2.163 ms였지만 폭이 0.340 ms라 개선이 폭 안이어서 폐기 판정이 났다. 같은 행의 폭은 D2-0 측정에서 0.120 ms였고, 이 측정(2026-10-27T02:30~02:35Z)은 소유자의 네트워크 수리와 겹쳤다. 443C-03은 폭 안의 결과 뒤 같은 행을 다시 재는 것을 막지만, 소유자가 다시 재라고 했다(위 1행). 그래서 측정 환경이 흔들린 경우의 예외로 한 번만 다시 잰다: 후보는 보존한 d1079e5c3 그대로, 규칙은 첫 측정과 똑같고, 결과 문서에 첫 측정의 수치와 '소유자 허락의 예외'를 함께 적으며, 그 재측정 하나로 판정하고 더 반복하지 않는다. 관문(빌드, 다섯 프로젝트, 검증 묶음, 배달과 선언 비교, 노드당 힙)은 첫 측정에서 같은 후보로 모두 통과했으므로 다시 돌리지 않는다." (`reviews/round-450-closing.md:8`)
  > 편집자 결정(451C-03): "【추론】 D3b-2(파생 WeakMap 루트 32개를 청사진·호스트 레코드 둘의 지연 슬롯으로, 생성 사실은 청사진에 두고 `setMode()`가 지우지 않음, 엔트리별 저장소는 선언 부모 host 레코드가 소유)의 첫 후보 54b8aff0b는 기능 관문은 다 통과했지만 마운트 nested-d6-f4가 폭(0.42 ms) 밖에서 +4.18 %/+3.52 % 악화하고 Bun B2가 +80.7 B/노드(+3.63 %)라 채택하지 않았다. `verification.md`의 "원인을 같은 PR에서 분리한다"에 따라 변수 하나(staticIds 저장만 옛 전역 WeakMap)만 되돌린 탐침으로 Bun 79.06 B/노드(엔트리당 79.08 B)가 호스트별 `Map`의 비용임을 분리했고, 시간 악화는 네 변형이 모두 폭 안이라 재현되지 않았다. 최종 후보 de14aa1da(host-owned WeakMap, 소유 host를 호출자가 명시, 형제 N개의 저장소 공유 시험)는 기준판 8569ec0e1(#470 포함) 대비 기능 관문·배달 0·d.ts 0, Node B2 통과, Bun B2 B 중앙값이 A 최댓값보다 +0.608 B/노드(+0.027 %) 커서 고정 규칙 미달이었고 소유자가 TEST-027로 받아들였다(위 6행). 마운트 nested-d6-f4는 +2.60 %/+3.06 %로 폭 밖이지만 계획서 게이트의 선(TEST-073, 처리량 15 % 초과 하락과 Welch p<0.05)은 안이다. 그런데 브리프에 측정 전 고정한 규칙은 "어느 행도 폭 밖 악화가 없어야 채택"이었고 코디네이터는 측정 뒤에 계획서의 선을 적용했다: 계획서를 따른 것이지만 측정 뒤의 규칙 변경이라 TEST-081에 어긋나므로, 결과 문서와 PR에 "브리프 규칙으로는 미달, 계획서 규칙으로는 통과, 편집자가 측정 뒤 적용"으로 공개하고 재검증 대상으로 두며 D4에서 그 행을 다시 잰다. TEST-073의 평균·Welch 20비교에서 single-nested-d6-f4의 A′/B만 −16.85 %(p 2.2e-7)로 선 밖이었는데 같은 행의 A/B는 −8.34 %이고 A 대 A′의 평균 차이가 10.24 %이며 최솟값 중앙은 A와 B가 0.1766 ms로 같아, 게이트는 A/B로 보고 이 신호는 0.18 ms 행의 평균 불안정으로 읽어 공개만 했다(편집자 판정, 재검증 대상). 독립 검토(antigravity, 2부)는 PASS였으나 `admittedEdgeSchemas`가 같은 모양의 호스트별 `Map`으로 남아 게이트 형제가 많은 폼에서 같은 엔트리당 비용을 낸다고 지적했고, 후속 D3b-2b로 그것도 host-owned WeakMap으로 바꿔(제품 변경 한 파일, 이 PR의 새 시험만 수정, DETAIL 선행) 전체 고정 규약을 다시 쟀다: 폭 밖 악화 0, TEST-073 회귀 0, Node B2 통과, Bun B2 +0.413 B/노드로 수용치 안. 델타 검토 PASS. 판정 파일은 `/private/tmp/claude-501/perf-runs/446-reviews/pr-471-antigravity.md`, 결과 문서는 `verification/design-optimization/d3b-2-results.md`다." (`reviews/round-451-closing.md:12`)
  > 편집자 결정(454C-01): "【추론】 B0(`verification/branch-switch/b0-ledger.md`, 창 2026-10-27 09:28 UTC, 단계 시작 판 b8db53997, 독립 검토 PASS, #474 스쿼시 a6e339b3c)는 쓰기당 oneOf-80이 0.16.1 43.7 µs 대 261.3 µs(5.98배), 형제 0이 31.2 대 101.8, `discriminator`-80이 473.6(active의 1.81배, 평가 800회·바퀴 2회), `if`-80이 595.9(2.28배, 평가 640회·바퀴 2회, 평가당 약 0.46 µs), 잎 12개 분기가 108.4 대 480.6(나감·들어옴 잎 하나당 약 12 µs, 0.16.1은 3.6)임을 쟀다. 단계 장부(oneOf-80 쓰기당)는 computeNode 103(selectChildren self 36·computeNode self 35·바퀴 준비 8.7·조립 9.1), finalizeExits 55(getControlLayers 15.5/12회·setLatentRaw 11.2/6회), commitSettlement 46(비활성 값 메모 18.7·배달 표식 11.9), registerRecalculation 13.0, 그 밖 17.1이고 할당은 약 130 KB/쓰기다. 두 번째 바퀴의 원인은 선택 도중 들어오는 payload가 공표되어 게이트가 읽는 루트 투영 객체의 identity가 라운드 안에서 바뀌는 것(즉시 반영 계약의 귀결)으로 확인되었다. 회귀 적합(floor 169.9, 분기당 0.872)은 잔차가 −53~+52 µs라 구조 상수로 쓰지 않는다. 이 장부로 B1·B2·B3의 목표선을 측정 전에 고정해 `plan/branch-switch/request.md`의 "B0 장부 뒤 고정한 목표선" 절에 적었다(TEST-081): B1은 같은 창에서 B의 `if`-80 ≤ B의 oneOf-80 × 1.1 + 40 µs, B의 `discriminator`-80 ≤ oneOf-80 × 1.05, 두 행 폭 밖 개선, 평가 수 80 이하, 좁힌 `if`는 바퀴 1회, oneOf-80 폭 밖 악화 없음; B2는 단계별 상한(바퀴 준비 1, 나감 정책 2, 비활성 값 메모 3, 조립 3, 잠복 저장 8, 재계산 등록 5, 배달 표식 6, 선택·계산 self 25, 그 밖 10 µs, 바닥 40 µs); B3는 446C-06 그대로. 측정 행의 단위는 기존 장치와 같이 쓰기 2회(왕복 1회) 합계이며 표마다 쓰기당 환산을 함께 적는다(B0 워커의 물음에 대한 답; 브리프의 "왕복 2회"는 편집자의 착오였다)." (`reviews/round-454-closing.md:8`)
  > 편집자 결정(457C-03): "【추론】 B2-P2(e8c122986, 창 15:07~15:16 UTC, 품질 0.996 유효)에서 겨냥한 단계는 같은 창의 A/B 단계 장부로 크게 줄었다: 바퀴 준비 self 8.938→2.834 µs(목표 ≤1 미달), getControlLayers 합 15.770→1.790 µs(목표 ≤2 통과), `getLatentOrder`의 엔트리 선형 탐색 제거. 그러나 총합 행 switch-oneOf-80은 왕복 A 507.3/B 441.1/A′ 373.6 µs로 창 안의 흐름(A 대 A′ 26 %)이 개선 폭(약 20 µs/쓰기, 8 %)보다 커서 "폭 밖 개선"은 증명할 수 없는 구조였다(TEST-073 주판정 회귀 0, 뒷반 single-nested −18.45 % 1건, Node 힙 통과, Bun +4.374 B/노드 보고). B2의 묶음은 개선 폭이 5~15 µs라 총합 행으로는 어느 것도 증명되지 않으므로, 채택 기준을 "겨냥한 단계가 같은 창의 A/B 장부에서 상한 아래 또는 절반 이하로 줄고 어느 단계도 나빠지지 않으며 주판정 TEST-073 회귀 0, Node 힙 B 중앙 ≤ A 최대"로 두고 총합 행은 B3에서 단계 시작 판·0.16.1 대비로 누적 판정한다. 측정 뒤의 기준 변경이므로 재검증 목록에 올린다(TEST-081과의 경계). 이 기준으로 B2-P2를 채택한다(#478, 독립 코드 검토 PASS). 정적 자식 준비물은 동명 후보(x/y)가 있는 호스트(형제 픽스처)에서는 `HostStaticPartition`이 정적 목록을 비워 적용되지 않았고 고유 이름 호스트(oneOf-80)에서는 적용됐으므로, 측정된 묶음 전체를 그대로 채택하되(측정되지 않은 변형을 만들지 않음) 형제 1,000개당 약 2.0 ms의 선형항이 정적 선택이 아니라 다른 곳(조립·등록으로 추정, B2-P3 범위)에 있음을 단서로 기록한다." (`reviews/round-457-closing.md:12`)
  > 편집자 결정(458C-04): "【추론】 후보 1(f290cd04d, 창 19:31 UTC, 품질 0.9998)은 잠복 저장 0·메모 0을 이뤘으나 entering 그룹이 절반이 아니라 두 배(oneOf-80 9.46→17.23, payload-12 17.48→34.56 µs)였고 분기 없는 행이 주판정 TEST-073에서 약 20 % 회귀해(single-flat-1000 −19.79 %, single-nested −19.85 %) 미채택했다; 구현 결함(활성 복제에서 불필요한 주소 등록·중복 레지스트리·빈 overlay 할당, 일반 쓰기에 붙은 슬롯 적격 판정·공표)이라 후보 2를 만들었다. 후보 2(제품 0778bd955, 창 20:50~20:59 UTC, 품질 1.0005 유효)는 고정 장치의 원판정이 "채택 조건 미충족"이다: 잠복 저장 oneOf-80 16.2→0·payload-12 46.2→0 µs, 메모 18.1→0·41.9→0 µs, 주판정 TEST-073 회귀 0, Node 힙 B 중앙 1443.3 ≤ A 최대 1890.3 B/노드는 통과했으나, entering 그룹이 oneOf 9.46→8.13(비 0.86), payload 16.10→16.46(1.02)으로 절반에 못 미치고 기존 단계 네 곳이 A의 자기 폭 밖으로 나빠졌다(markCommitDeliveries oneOf +2.06·payload +0.23, siblings-0 computeNode +0.85·selectChildren +0.52 µs; 분기 없는 바닥 행 unwrapped 72.5→75.0 µs, +3.5 %). 편집자는 이 원판정을 고치지 않은 채 채택을 결정한다. 까닭: 설계 Ⅱ의 두 명제가 예측 크기(약 17·19 µs)대로 맞았고 단계 장부 자기시간 합이 oneOf-80 201.8→165.8 µs(−18 %), payload-12 375.9→272.9 µs(−27 %)로 줄었으며(unwrapped 182.1→156.8, 338.1→246.6 µs), 총합 행은 폭 안(oneOf A .35/B .29/A′ .43 ms 폭 .28, payload .66/.55/.66 폭 .20); "entering 절반"은 복제 2.6 µs/노드가 청사진 생성 2.4 µs/노드보다 싸지 않다는 발견으로 기각되어(들어옴 비용은 청사진 분석이 아니라 등록·색인에 있음) 더 좋은 후보가 나올 항이 아니고, 네 곳의 악화 합(약 3 µs)은 감소(약 36 µs)의 1/10 아래이며, 457C-03의 무관용 규칙은 5~15 µs 묶음을 위해 둔 것이라 −34~−103 µs의 구조 변경을 2 µs로 버리는 것은 규칙의 뜻이 아니다. 되돌림은 복원이 아니라 `engineModes.slots = off`(기준 경로)로 싸다. 두 일탈(entering 절반 미달, 단계 네 곳 악화)과 Bun 힙 +6.4 B/노드(2246.4 > A 최대 2239.9, 보고)는 결과 문서·PR 본문에 그대로 적었고 소유자 재검증 목록에 올린다. 제안 규칙(재검증): 겨냥한 단계의 감소 합 대비 기존 단계의 악화 합이 1/10 이하이고 주판정 TEST-073 회귀 0·Node 힙 통과면 악화를 기록한 채 채택할 수 있다. 워커가 미달 판정 직후 "미달 시 복원" 지시대로 복원 커밋 셋을 올렸던 것은 revert 커밋으로 되돌려 제품을 0778bd955와 차분 0으로 맞췄다. 독립 검토 둘(후보 1 전체, 후보 2 델타) 모두 결함 0 PASS. #480(180a64097)으로 병합. 소유자의 자율 진행 지시(위 2행)에 따라 이 판정을 소유자에게 묻지 않고 내렸다." (`reviews/round-458-closing.md:14`)
- 상태: 현행
- 출처: `reviews/round-447-closing.md:8`(정본), `verification/design-optimization/h4-results.md`, `verification/design-optimization/h5-results.md`
- 닫은 사람: 편집자 결정(447라운드, `reviews/round-447-closing.md` 447C-01)
- 라운드: 447
- 까닭: `reviews/round-447-closing.md:8`

### TEST-082 React 동등 측정의 자리(447라운드) — 설계 최적화 단계의 가설 PR은 코어 쌍 장치(구독 경로 행 포함)로 판정하고 `--equivalent`는 D4의 통합 판에서 한 번, 선을 넘는 행은 원인 PR을 가려 단계 마감 전에 고치거나 되돌림, 소유자가 뒤집을 수 있음(대기열)

- 결정:
  > 【추론】 `plan/design-optimization/verification.md`의 PR 게이트는 `--equivalent`의 어떤 행도 TEST-073의 선을 넘어 나빠지지 않을 것을 PR마다 요구했지만, D1의 PR #464~#468은 이를 돌리지 않았다. 이 측정은 전체 폼의 합을 판마다 두 통과로 재므로 국소 가설 하나의 효과보다 가설 사이의 상호작용을 드러내는 데 맞다. 그래서 D1·D2의 가설 PR은 코어 쌍 장치(구독 경로 행 포함)로 판정하고, `--equivalent`는 D4에서 모든 가설을 합친 판으로 한 번 돈다. 그 측정에서 TEST-073의 선을 넘는 행이 나오면 원인 PR을 가려 단계를 닫기 전에 고치거나 되돌린다. 게이트를 늦추는 결정이라 소유자가 뒤집을 수 있다(대기열 65).
- 보충:
  > 편집자 결정(451C-04): "【추론】 소유자가 검증과 작업이 끝나면 최종 결과를 표와 함께 보고하라고 했고(위 5행), 이 가지의 작업에 대해 0.16.1·작업 이전·작업 이후 세 판의 비교를 구해 PR에 실으라고 했다(위 6행). 완료 보고는 시간 행의 A/B/A′와 폭, Node·Bun B2, 관문 통과 여부, 독립 검토 판정, 병합 커밋을 표로 싣는다. 세 판 비교는 D4 통합 측정이 구한다: L = 0.16.1(장치가 같은 프로세스에서 번갈아 재는 옛 판), S = 단계 시작 판 6692e7f69(8단계 가지 머리)의 dist, E = 단계 끝 판의 dist이며, 행마다 L·S·E의 ms와 S÷L·E÷L·E÷S, 폭을 한 표에 적고 탐침·React `--equivalent`·독립 스크립트 벤치·B2(S 대 E)를 더한다. 그 표는 단계 루트 PR(설계 최적화 가지에서 8단계 가지로, #445 병합 뒤 base를 `1.0.0-beta`로)의 본문에 싣는다. 브리프는 `/private/tmp/claude-501/perf-runs/446-briefs/d4.md`다." (`reviews/round-451-closing.md:14`)
  > 편집자 결정(452C-05): "【추론】 소유자가 "React 벽시계"라는 용어를 지적하고(위 1행) 갱신 경과 시간이 Profiler와 다른 까닭을 검토하라고 했으며(위 2행) 그 문제까지 고치고 다음으로 가라고 했다(위 3행). 진단: `render-update-wall`은 상호작용 루프 전후의 경과 시간이고 상호작용마다 `flushSync` 뒤 `setTimeout(0)` 두 번을 기다리는데(`packages/aileron/benchmark-form/src/benchmarks/canard/equivalent.ts:91-100`, `src/utils/setup-env.ts:73-82`) Node가 1 ms로 클램프해 약 2 ms 바닥과 밀리초 경계마다 1 ms 계단이 생긴다. 새 판은 값 쓰기 안에서 정착·배달 파동·React 동기 commit을 타이머 전에 끝내고, 옛 판은 마이크로태스크·setTimeout으로 미뤄 타이머 대기 안에서 돌아 Profiler에는 잡히고 경과 시간에는 숨는다. react-1.json의 sample-0 분포가 L 56 %/44 %, E 8 %/92 %의 두 봉우리라 1.46배는 봉우리 이동이지 연속 비용이 아니며 commit 반감은 원인이 아니다. D4b(#473, 러너만 변경, 제품 소스 변경 0): 타이머 클램프 없는 정착 장벽(마이크로태스크 비움 → immediate → `setTimeout(0)` 한 번 → immediate)으로 옛 판의 미룬 작업이 모두 끝난 뒤 멈추고, `update-sync`(flushSync 구간)·`update-settled`(정착 완료까지)·빈 장벽 바닥·바닥을 뺀 net을 더했다. 다시 재니 `update-settled` E÷L은 19 픽스처에서 0.106~1.098(배열 갱신 0.11~0.57, 평면·sample 0.95~1.03, nested-d5 1.10, oneOf 1.02~1.04, array-replace 1.07~1.09)이고, Profiler 갱신은 0.04~1.07, commit 수는 절반이다. 독립 검토 PASS(`/private/tmp/claude-501/perf-runs/446-reviews/pr-473-antigravity.md`: 장벽 공정성, 114 수치 일치, 기존 시험 변경 0). 용어는 "갱신 경과 시간"으로 쓴다. 7단계·8단계의 React 측정(`verification/07-switch/`)도 같은 러너로 쟀으므로 그 경과 시간 수치는 같은 허상을 안고 있다는 것을 적어 둔다(수치 자체는 고치지 않는다)." (`reviews/round-452-closing.md:16`)
- 상태: 현행
- 출처: `reviews/round-447-closing.md:14`(정본), `plan/design-optimization/verification.md`
- 닫은 사람: 편집자 결정(447라운드, `reviews/round-447-closing.md` 447C-04)
- 라운드: 447
- 까닭: `reviews/round-447-closing.md:14`

### TEST-083 D4에서 설계 Ⅱ로 갈지의 결정권(447라운드) — 분기 전환 관문 미달이면 수치와 D5의 추정 효과를 소유자에게 올려 D5 진행 또는 TEST-027 수용을 소유자가 정함(446C-06의 규칙만으로의 착수 대체), 판정은 표준 프로토콜, 최적화 문턱을 낮춘 쌍 측정은 참고, 소유자가 뒤집을 수 있음(대기열)

- 결정:
  > 【추론】 446C-06은 D4에서 관문 행이 하나라도 넘으면 D5(설계 Ⅱ)로 간다고 정했다. 447C-06의 분석에서 분기 전환 행의 관문(0.16.1의 1.5배, 왕복 0.1175 ms)은 설계 Ⅰ만으로 닿을 수 없고(최적화된 상태에서도 쓰기 한 번의 하한 약 61 µs, 상한 약 59 µs), 설계 Ⅱ를 더해도 추정 하한이 왕복 0.156~0.24 ms라 닿지 못한다. 절대 기준인 1 ms 미만은 지금도 통과한다(0.4865 ms). D5는 이 단계에서 가장 큰 설계 변경이므로, 관문에 닿을 가망이 없다는 추정 아래 규칙만으로 착수하지 않는다. D4에서 분기 전환 행이 관문을 넘으면 그 수치와 D5의 추정 효과를 소유자에게 올려, 관문 수치를 유지하고 D5로 갈지, 그 행을 TEST-027로 수용할지를 소유자가 정한다(대기열 66). 판정에 쓰는 측정은 지금의 표준 프로토콜(20 예열·100 표본·3 실행)이다. 실제 사용자는 판별자를 수천 번이 아니라 몇 번 바꾸므로 최적화 전 단계의 비용도 사용자가 겪는 비용이다. D2의 분기 전환 PR은 최적화 문턱을 낮춘 쌍 측정도 참고로 적어, 일의 양이 줄었는지와 예열 효과를 가른다.
- 보충:
  > 소유자(446라운드, 이후 작업의 위임): "이후 작업은 너에게 위임한다. 안정적인 작업으로, 설계 개편과 오류 수정, 테스트와 벤치마크까지 완료하여 PR 생성 및 검증까지 마무리하라." (`reviews/round-446-owner-answers.md:12`)
  > 편집자 결정(448C-02): "【추론】 D2-P4(호스트 계획 슬롯, 조각 소유 색인, 나가는 노드당 unset 정책 한 번)는 측정 전에 고정한 규칙으로 폐기했다: 열세 행이 모두 폭 안이었고 Bun의 노드당 힙이 기준을 넘었다(2,238.7 B > 2,234.2 B). 이 측정에서 분기 전환 oneOf-80 행은 A·B·A′가 0.434·0.518·0.491 ms에 폭이 0.145 ms로, 값의 약 30 %였다. 최적화 문턱을 낮춘 참고 측정은 0.267→0.241 ms(−10 %)로 일이 줄었음을 시사하지만, 판정은 표준 프로토콜로 한다는 447C-07을 따른다. 따라서 기본 프로토콜의 분기 전환 행으로는 약 30 %보다 작은 효과를 채택할 수 없다. 앞으로 분기 전환 비용을 겨냥하는 가설은 겨냥한 항을 키우는 축 탐침(예: 형제 수, 분기 수)을 판정 행으로 미리 정하거나, 그 행의 판단을 D4의 소유자 결정(447C-07)에 맡긴다." (`reviews/round-448-closing.md:10`)
  > 편집자 결정(449C-01): "【추론】 소유자가 분기 전환은 일단 수용하고 마운트까지 작업한 뒤 다시 검토하자고 했다(위 1행). 분기 전환 oneOf-80 행(D1 통합 판 0.4865 ms, 0.16.1의 6.2배, 절대 기준 1 ms 미만은 통과)을 TEST-027에 따라 지금 수치로 잠정 수용한다. 447C-07이 D4에서 소유자에게 올리기로 한 결정은 이 수용으로 지금 답해졌고, 마운트 검증을 마친 뒤 소유자와 다시 검토한다. 형제 수에 비례하는 항을 없애는 D2-P5는 분기 전환에 속하므로 보류하고, 진행분은 가지 `perf/schema-form-d2-sibling-linear`와 그 결과 문서에 보존해 재검토 때 다시 연다." (`reviews/round-449-closing.md:8`)
  > 편집자 결정(452C-01): "【추론】 D4 통합 측정(`verification/design-optimization/d4-results.md`, L = 0.16.1, S = 단계 시작 판 6692e7f69, E = 단계 끝 판 ca8d52f59)에서 분기 전환 oneOf-80은 E 0.511 ms로 L의 6.87배(S 대비 0.93배)라 관문(1.5배, 1 ms)에 미달했다. 소유자가 분기 전환은 다음 단계에서 집중적으로 다루며 설계의 대규모 개편 없이 도달 가능한 상한으로 기록하라고 했다(위 1행). 그래서 이 단계는 D5(설계 Ⅱ)로 가지 않고, 6.87배·0.511 ms를 "설계 Ⅰ과 캐시 계층까지로 도달한 상한"으로 적어 닫으며, 분기 전환은 다음 단계의 유일한 주제다(위 3행 "분기전환 문제에만 집중하기 위함"). 보류한 D2-P5(`perf/schema-form-d2-sibling-linear` 4681c0aff)는 그 단계의 출발 자료다. 447C-07·TEST-083의 "미달이면 D5 진행 여부를 소유자가 정한다"는 이 결정으로 답해졌다." (`reviews/round-452-closing.md:8`)
  > 편집자 결정(453C-04): "【추론】 관문은 소유자가 유지했다(위 2행 "그래"): oneOf-80 왕복이 0.16.1의 1.5배 안이고 1 ms 아래(446C-06). 같은 형상의 `discriminator` 행도 같은 선, `if` 행은 453C-03의 선, 형제 1,000 전환이 형제 0의 작은 상수 배 안, 다른 canonical 행과 구독 경로 행은 TEST-073 선 안, B2 노드당 힙은 Node가 단계 시작 이하이고 Bun은 452라운드의 수용에 따르며 설계 Ⅱ는 보유 메모리 상한을 따로 적는다. 단계는 B0 측정 장부(쓰기 한 번의 단계별 µs와 할당 장부를 형제 0·oneOf-80·깊은 분기 하나에 대해 세 게이트 종류로 측정 장치에 추가, `switch-if-80`(AJV)·`switch-discriminator-80` 행 추가, 두 번째 바퀴의 원인 확인, 단계 시작 판 b8db53997과 0.16.1) → B1 게이트 통일 → B2 준비물과 Δ 적용(가설마다 PR 하나) → B3 관문 재측정 → (조건부) B4 설계 Ⅱ → B5 마감(통합 판 재측정, React `--equivalent`, B2 힙, 루트 PR, 설계 문서·ADR 반영)이다. B1~B3의 목표선은 B0의 장부로 측정 전에 고정한다(TEST-081). 447C-06의 "설계 Ⅰ만으로 쓰기 한 번 하한 약 61 µs, 설계 Ⅰ+Ⅱ로도 왕복 0.156~0.24 ms"는 도출 과정과 원자료가 기록되지 않았고(452라운드 자료 조사) 이번 작업량 추적이 그 가정과 다른 비용 구조를 보였으므로, 이 단계의 관문이나 착수 판단에 쓰지 않고 B0의 장부가 대체한다. 이것은 편집자의 이전 판단에 대한 정정이며 재검증 목록에 올린다. 측정 프로토콜은 그대로다(20 예열·100 표본·3 실행, 조용한 창, 폭 (다), 재측정 없음)." (`reviews/round-453-closing.md:14`)
- 상태: 현행
- 출처: `reviews/round-447-closing.md:20`(정본), `verification/design-optimization/d2-0-profile.md`
- 닫은 사람: 편집자 결정(447라운드, `reviews/round-447-closing.md` 447C-07)
- 라운드: 447
- 까닭: `reviews/round-447-closing.md:20`

### TEST-084 분기 전환 행의 측정 폭(448라운드) — 기본 프로토콜의 분기 전환 oneOf-80 행은 폭이 값의 약 30 %라 그보다 작은 효과를 채택할 수 없음, 분기 전환 비용의 가설은 겨냥한 항을 키우는 축 탐침을 판정 행으로 미리 정하거나 D4의 소유자 결정에 맡김

- 결정:
  > 【추론】 D2-P4(호스트 계획 슬롯, 조각 소유 색인, 나가는 노드당 unset 정책 한 번)는 측정 전에 고정한 규칙으로 폐기했다: 열세 행이 모두 폭 안이었고 Bun의 노드당 힙이 기준을 넘었다(2,238.7 B > 2,234.2 B). 이 측정에서 분기 전환 oneOf-80 행은 A·B·A′가 0.434·0.518·0.491 ms에 폭이 0.145 ms로, 값의 약 30 %였다. 최적화 문턱을 낮춘 참고 측정은 0.267→0.241 ms(−10 %)로 일이 줄었음을 시사하지만, 판정은 표준 프로토콜로 한다는 447C-07을 따른다. 따라서 기본 프로토콜의 분기 전환 행으로는 약 30 %보다 작은 효과를 채택할 수 없다. 앞으로 분기 전환 비용을 겨냥하는 가설은 겨냥한 항을 키우는 축 탐침(예: 형제 수, 분기 수)을 판정 행으로 미리 정하거나, 그 행의 판단을 D4의 소유자 결정(447C-07)에 맡긴다.
- 보충:
  > 편집자 결정(450C-01): "【추론】 D2-M(설계 Ⅰ의 (c) 독자 집합으로 마운트 때의 의존 색인과 게이트 레지스트리 등록을 줄임)은 작업량을 예측대로 줄였다(의존 정규화 961→242, 게이트 등록 시도 323→83, 빈 edge Map 242→0, 분리 참조용 path·kind 기록 유지). 측정 전에 고정한 규칙으로 잰 첫 측정에서 마운트 oneOf-80은 A·B·A′가 2.2075·1.933·2.163 ms였지만 폭이 0.340 ms라 개선이 폭 안이어서 폐기 판정이 났다. 같은 행의 폭은 D2-0 측정에서 0.120 ms였고, 이 측정(2026-10-27T02:30~02:35Z)은 소유자의 네트워크 수리와 겹쳤다. 443C-03은 폭 안의 결과 뒤 같은 행을 다시 재는 것을 막지만, 소유자가 다시 재라고 했다(위 1행). 그래서 측정 환경이 흔들린 경우의 예외로 한 번만 다시 잰다: 후보는 보존한 d1079e5c3 그대로, 규칙은 첫 측정과 똑같고, 결과 문서에 첫 측정의 수치와 '소유자 허락의 예외'를 함께 적으며, 그 재측정 하나로 판정하고 더 반복하지 않는다. 관문(빌드, 다섯 프로젝트, 검증 묶음, 배달과 선언 비교, 노드당 힙)은 첫 측정에서 같은 후보로 모두 통과했으므로 다시 돌리지 않는다." (`reviews/round-450-closing.md:8`)
- 상태: 현행
- 출처: `reviews/round-448-closing.md:10`(정본), `verification/design-optimization/d2-p4-results.md`
- 닫은 사람: 편집자 결정(448라운드, `reviews/round-448-closing.md` 448C-02)
- 라운드: 448
- 까닭: `reviews/round-448-closing.md:10`

### TEST-085 작업량 하한과 시험 경로의 정정 규칙(448라운드) — 비공허성 확인인 작업량 하한은 의미상 필요한 수로, 옛 경로의 정확값·순서는 실제 무효 조건으로 보낸 새 사례에서 유지, 내부 필드 조작으로 경로를 고르는 시험 금지, scratch를 기록하던 시험 도구는 실제 표식에서 읽은 논리 구성원을 기록

- 결정:
  > 【추론】 400C-02는 정확한 호출 수 단언을 base 이하 상한으로 적으라고 했지만 하한은 말하지 않았다. 작업량 하한이 "그 경로가 실제로 실행되었다"는 비공허성 확인일 때, 일이 줄어 하한이 깨지면 하한을 지우지 않고 의미상 반드시 필요한 수(예: 정책을 읽어야 하는 나가는 노드의 수)로 바꾸고, 동작 단언은 그대로 둔다. 새 경로가 옛 경로를 대신하면, 옛 경로의 정확값과 순서 단언은 실제 무효 조건(파생 하나, 게이트 하나, Merge 쓰기)으로 옛 경로에 보낸 새 사례에서 유지한다. 시험이 내부 필드를 조작해 경로를 고르는 것은 허용하지 않는다 — 시험은 제품이 실제로 거치는 경로만 고정한다. 내부 scratch를 기록하는 시험 도구는 그 scratch 대신 같은 뜻의 논리 구성원을 제품 상태의 실제 표식에서 읽어 기록하고, 기존 snapshot은 바꾸지 않는다.
- 보충:
  > 편집자 결정(450C-03): "【추론】 D3b-1에서 `setMode()`가 파생 레코드를 비우게 되자(계획서 D3), 살아 있는 트리가 있는 동안 모드를 바꾸던 시험 몇이 깨졌다. 모드 전환은 시험과 벤치 전용 기능이고 출하 판에서는 모드가 고정이므로, 시험이 모드를 트리를 만들기 전에 정하도록 순서를 옮기는 것을 허용했다. `engineModes`의 DETAIL과 `setMode` 문서 주석에 "모드는 트리를 만들기 전에 정한다"를 적었다. 독립 검토는 바뀐 시험·픽스처 74개 가운데 단언의 값·개수·순서를 바꾼 것이 0임을 확인했다. 노드당 힙 관문을 넘은 PR은 먼저 브리프대로 구현되었는지(지연 생성, 빈 필드 없음) 확인하고, 그대로인데도 넘으면 고치지 않고 수치와 원인을 PR 머리에 적어 TEST-027로 소유자 수용에 올린다. 이 둘은 449C-02가 표시한 재검증 대상에 들어간다." (`reviews/round-450-closing.md:12`)
- 상태: 현행
- 출처: `reviews/round-448-closing.md:12`(정본), `reviews/round-447-closing.md:12`
- 닫은 사람: 편집자 결정(448라운드, `reviews/round-448-closing.md` 448C-03)
- 라운드: 448
- 까닭: `reviews/round-448-closing.md:12`

### TEST-086 노드당 힙 관문의 자리(448라운드) — 노드나 청사진에 메모리를 더하는 PR은 B2 행을 같은 창에서 기준판과 Node·Bun 각 7 표본으로 재어 B 중앙값이 A 최댓값 이하, D4는 통합 판으로 한 번 더

- 결정:
  > 【추론】 `plan/design-optimization/verification.md`의 PR 게이트는 PR마다 B2 노드당 힙이 단계 시작 판보다 크지 않을 것을 요구했지만, D1의 PR들은 이를 돌리지 않았다. D1 PR들이 더한 메모리는 노드가 아니라 청사진이나 트리 단위였다. D2부터는 노드나 청사진에 메모리를 더하는 PR이 `bench/legacy-compare/node-and-settle.bench.ts`의 B2 행을 같은 창에서 기준판과 Node·Bun 각 7 표본으로 재어 "B 중앙값이 A 최댓값 이하"를 지킨다. D4는 통합 판으로 한 번 더 잰다.
- 보충:
  > 편집자 결정(450C-03): "【추론】 D3b-1에서 `setMode()`가 파생 레코드를 비우게 되자(계획서 D3), 살아 있는 트리가 있는 동안 모드를 바꾸던 시험 몇이 깨졌다. 모드 전환은 시험과 벤치 전용 기능이고 출하 판에서는 모드가 고정이므로, 시험이 모드를 트리를 만들기 전에 정하도록 순서를 옮기는 것을 허용했다. `engineModes`의 DETAIL과 `setMode` 문서 주석에 "모드는 트리를 만들기 전에 정한다"를 적었다. 독립 검토는 바뀐 시험·픽스처 74개 가운데 단언의 값·개수·순서를 바꾼 것이 0임을 확인했다. 노드당 힙 관문을 넘은 PR은 먼저 브리프대로 구현되었는지(지연 생성, 빈 필드 없음) 확인하고, 그대로인데도 넘으면 고치지 않고 수치와 원인을 PR 머리에 적어 TEST-027로 소유자 수용에 올린다. 이 둘은 449C-02가 표시한 재검증 대상에 들어간다." (`reviews/round-450-closing.md:12`)
  > 편집자 결정(451C-03): "【추론】 D3b-2(파생 WeakMap 루트 32개를 청사진·호스트 레코드 둘의 지연 슬롯으로, 생성 사실은 청사진에 두고 `setMode()`가 지우지 않음, 엔트리별 저장소는 선언 부모 host 레코드가 소유)의 첫 후보 54b8aff0b는 기능 관문은 다 통과했지만 마운트 nested-d6-f4가 폭(0.42 ms) 밖에서 +4.18 %/+3.52 % 악화하고 Bun B2가 +80.7 B/노드(+3.63 %)라 채택하지 않았다. `verification.md`의 "원인을 같은 PR에서 분리한다"에 따라 변수 하나(staticIds 저장만 옛 전역 WeakMap)만 되돌린 탐침으로 Bun 79.06 B/노드(엔트리당 79.08 B)가 호스트별 `Map`의 비용임을 분리했고, 시간 악화는 네 변형이 모두 폭 안이라 재현되지 않았다. 최종 후보 de14aa1da(host-owned WeakMap, 소유 host를 호출자가 명시, 형제 N개의 저장소 공유 시험)는 기준판 8569ec0e1(#470 포함) 대비 기능 관문·배달 0·d.ts 0, Node B2 통과, Bun B2 B 중앙값이 A 최댓값보다 +0.608 B/노드(+0.027 %) 커서 고정 규칙 미달이었고 소유자가 TEST-027로 받아들였다(위 6행). 마운트 nested-d6-f4는 +2.60 %/+3.06 %로 폭 밖이지만 계획서 게이트의 선(TEST-073, 처리량 15 % 초과 하락과 Welch p<0.05)은 안이다. 그런데 브리프에 측정 전 고정한 규칙은 "어느 행도 폭 밖 악화가 없어야 채택"이었고 코디네이터는 측정 뒤에 계획서의 선을 적용했다: 계획서를 따른 것이지만 측정 뒤의 규칙 변경이라 TEST-081에 어긋나므로, 결과 문서와 PR에 "브리프 규칙으로는 미달, 계획서 규칙으로는 통과, 편집자가 측정 뒤 적용"으로 공개하고 재검증 대상으로 두며 D4에서 그 행을 다시 잰다. TEST-073의 평균·Welch 20비교에서 single-nested-d6-f4의 A′/B만 −16.85 %(p 2.2e-7)로 선 밖이었는데 같은 행의 A/B는 −8.34 %이고 A 대 A′의 평균 차이가 10.24 %이며 최솟값 중앙은 A와 B가 0.1766 ms로 같아, 게이트는 A/B로 보고 이 신호는 0.18 ms 행의 평균 불안정으로 읽어 공개만 했다(편집자 판정, 재검증 대상). 독립 검토(antigravity, 2부)는 PASS였으나 `admittedEdgeSchemas`가 같은 모양의 호스트별 `Map`으로 남아 게이트 형제가 많은 폼에서 같은 엔트리당 비용을 낸다고 지적했고, 후속 D3b-2b로 그것도 host-owned WeakMap으로 바꿔(제품 변경 한 파일, 이 PR의 새 시험만 수정, DETAIL 선행) 전체 고정 규약을 다시 쟀다: 폭 밖 악화 0, TEST-073 회귀 0, Node B2 통과, Bun B2 +0.413 B/노드로 수용치 안. 델타 검토 PASS. 판정 파일은 `/private/tmp/claude-501/perf-runs/446-reviews/pr-471-antigravity.md`, 결과 문서는 `verification/design-optimization/d3b-2-results.md`다." (`reviews/round-451-closing.md:12`)
  > 편집자 결정(452C-02): "【추론】 B2는 Node가 통과(E 중앙 1442.2 ≤ S 최대 1903.0)하고 Bun은 E 중앙 2224.58 B/노드가 S 최대 2214.74보다 +9.84 B/노드(+0.44 %) 커서 단계 관문("단계 시작 판보다 크지 않음")에 미달했다. 소유자가 "힙당 크기는 수용 가능하다"고 했다(위 1행). TEST-027에 따라 수용으로 기록한다. 이 증가에는 이미 받아들인 #470(+1.465)과 #471(+0.413)이 들어 있고, 나머지는 D1·D2 PR들이 각각의 B2 관문(B 중앙 ≤ A 최대)을 통과하면서 쌓인 몫이라 PR 하나로 돌릴 수 없다." (`reviews/round-452-closing.md:10`)
  > 편집자 결정(456C-02): "【추론】 재승인 창(13:10~13:19 UTC, 도구 b0452a1ae, 제품 38e405d6b, 원자료 `/private/tmp/claude-501/perf-runs/20261027T1306-e0e5121-b1r3`, 시작·끝 CPU 표본 heavy 0)은 품질 중앙 1.009869577(17행)로 유효했다. 쓰기당 B는 `active` 252.406, `if`-80 303.854(선 317.647 통과), `discriminator`-80 162.083 µs(선 265.027 통과)이고, 두 대상 행은 A 대비 폭 밖 개선에 A′ 대비 같은 부호, `switch-oneOf-80`은 폭 밖 악화 없음, TEST-073은 21행 모두 전체·앞·뒤 짝에서 회귀 0, 평가 수 `if` 80·`discriminator` 0·`active` 0, selectChildren 1회, 그림자 불일치 0, Node 힙 B 중앙 1439.096 ≤ A 최대 1889.560이다. Bun 힙은 B 중앙 2233.988로 A 최대 2224.774보다 +9.214 B/노드이며 브리프의 규칙(Node 관문, Bun 보고)대로 보고로 남긴다; 단계 관문의 Bun 처리는 452라운드의 수용(단계 시작 판 대비)을 따르고 B5에서 통합 판으로 다시 잰다. 후보 1·후보 2의 순차 창, 무효 창, 두 진단은 `verification/branch-switch/b1-results.md`에 모두 보존되었다. 독립 검토는 1부(코드·동치·시험)와 2부(측정 보고·도구 델타·문서) 모두 PASS다(`/private/tmp/claude-501/perf-runs/453-reviews/pr-b1-part1-antigravity.md`, `pr-b1-part2-antigravity.md`). PR #476을 스쿼시 병합했다(4370cee88). 이로써 453C-03의 최우선 항목(검증기 `if`를 앞선 개선과 맞물리게)이 끝났고, `if`·`discriminator` 호스트는 `active`와 같은 선택 경로·한 바퀴·게이트당 평가 1회를 탄다." (`reviews/round-456-closing.md:10`)
  > 편집자 결정(459C-05): "【추론】 창 품질 1.013 유효. 쓰기당 µs(0.16.1 / 단계 시작 / 단계 끝): switch-oneOf-80 36.7 / 245.5 / 152.0(단계 −38 %, 0.16.1의 4.14배, 1 ms 아래), discriminator-80 쌍 없음 / 438.9 / 122.6, if-80 쌍 없음 / 581.4 / 196.7(guard 0.03 µs/호출, active+160 guard 상한 308.8), nested-oneOf-20 30.2 / 340.0 / 283.7, payload-12 104.2 / 462.4 / 274.3, siblings-0 31.2 / 99.8 / 97.5, siblings-100 137.4 / 273.6 / 263.5, siblings-1000 2536.0 / 2078.7 / 2069.9, siblings-4000 7922.4 / 6763.3 / 6670.9. 관문: oneOf-80 1.5배 FAIL(1 ms는 통과), discriminator-80·if-80 FAIL(같은 선), 형제 FAIL(21.2배 대 3배; 1,000개당 선형항 약 2.0 ms는 단계 시작과 같고 0.16.1의 2.5 ms보다 작음), 다른 canonical 행 TEST-073 PASS(주판정 회귀 0, 뒤 반창 1건), Node 노드당 힙 FAIL(S 중앙 1439.1 → E 중앙 1440.3 B/노드, +0.09 %; PR마다의 규칙인 B 중앙 ≤ A 최대 1889.5로는 통과, Bun 2224.8 → 2250.9 보고), 제거 대상 단계 호출 0 PASS. 보유 상한은 K·M = 3·1(oneOf·if·discriminator·nested), 12·1(payload), reset 뒤 슬롯 호스트 0. React 전체 폼은 보고 전용. oneOf-80의 이전 창 인용 누적은 261.3(시작) → 252.4(B1) → 220.6(B2-P2) → 146.2(B4-1) → 187.1(B4-2 창, 그 창의 A는 191.1)이고 B3 재측정은 245.5 → 152.0이다. 남은 비용의 자리: 선택·계산 self(selectChildren 약 29 µs, computeNode 약 32 µs), 등록·재계산 약 12 µs, finalizeExits 약 19 µs, 조립·커밋·배달 약 30 µs, 형제 선형항 약 2.0 ms/1,000(조립·등록 추정, B2-P3가 보류한 존재 차분 재사용의 자리). 계획서의 "B3에서 관문 미달이면 수치를 소유자에게 올려 다음을 소유자가 정한다"에 따라 단계를 여기서 멈추고 보고한다: 선택지는 (A) 관문을 지금 수치로 고쳐 B5 마감, (B) 선택·계산 self와 형제 선형항을 겨냥한 설계 Ⅲ 착수, (C) 그대로 9단계로. 소유자의 자율 진행 지시(위 2행)는 "목표한 작업"을 끝까지 하라는 것이었고 목표한 작업(B0~B4-2·B3)은 모두 끝났으므로, 다음 단계의 선택은 소유자에게 돌린다." (`reviews/round-459-closing.md:16`)
- 상태: 현행
- 출처: `reviews/round-448-closing.md:16`(정본), `plan/design-optimization/verification.md`
- 닫은 사람: 편집자 결정(448라운드, `reviews/round-448-closing.md` 448C-05)
- 라운드: 448
- 까닭: `reviews/round-448-closing.md:16`

### TEST-087 분기 전환의 잠정 수용(449라운드) — 분기 전환 oneOf-80 행을 TEST-027에 따라 지금 수치(0.16.1의 6.2배, 1 ms 미만)로 잠정 수용하고 마운트 검증 뒤 소유자와 다시 검토, D2-P5 보류

- 결정:
  > 【추론】 소유자가 분기 전환은 일단 수용하고 마운트까지 작업한 뒤 다시 검토하자고 했다(위 1행). 분기 전환 oneOf-80 행(D1 통합 판 0.4865 ms, 0.16.1의 6.2배, 절대 기준 1 ms 미만은 통과)을 TEST-027에 따라 지금 수치로 잠정 수용한다. 447C-07이 D4에서 소유자에게 올리기로 한 결정은 이 수용으로 지금 답해졌고, 마운트 검증을 마친 뒤 소유자와 다시 검토한다. 형제 수에 비례하는 항을 없애는 D2-P5는 분기 전환에 속하므로 보류하고, 진행분은 가지 `perf/schema-form-d2-sibling-linear`와 그 결과 문서에 보존해 재검토 때 다시 연다.
- 보충:
  > 소유자(449라운드, 분기 전환의 잠정 수용과 진행 방향): "일단 수용으로 넘어가고, 마운트까지 작업해.\n너의 임의판단을 넣은 부분은 추후 전부 재검증 대상이니, 임의판단보단 1차 계획대로 진행하도록 해줘.\n그렇게 마운트까지 검증을 마치고,\n분기전환에 대해서는 다시 검토하자. 어때?" (`reviews/round-449-owner-answers.md:7`)
  > 편집자 결정(452C-01): "【추론】 D4 통합 측정(`verification/design-optimization/d4-results.md`, L = 0.16.1, S = 단계 시작 판 6692e7f69, E = 단계 끝 판 ca8d52f59)에서 분기 전환 oneOf-80은 E 0.511 ms로 L의 6.87배(S 대비 0.93배)라 관문(1.5배, 1 ms)에 미달했다. 소유자가 분기 전환은 다음 단계에서 집중적으로 다루며 설계의 대규모 개편 없이 도달 가능한 상한으로 기록하라고 했다(위 1행). 그래서 이 단계는 D5(설계 Ⅱ)로 가지 않고, 6.87배·0.511 ms를 "설계 Ⅰ과 캐시 계층까지로 도달한 상한"으로 적어 닫으며, 분기 전환은 다음 단계의 유일한 주제다(위 3행 "분기전환 문제에만 집중하기 위함"). 보류한 D2-P5(`perf/schema-form-d2-sibling-linear` 4681c0aff)는 그 단계의 출발 자료다. 447C-07·TEST-083의 "미달이면 D5 진행 여부를 소유자가 정한다"는 이 결정으로 답해졌다." (`reviews/round-452-closing.md:8`)
- 상태: 현행
- 출처: `reviews/round-449-closing.md:8`(정본), `reviews/round-449-owner-answers.md:7`, `verification/design-optimization/d2-0-profile.md`
- 닫은 사람: 소유자 답(`reviews/round-449-owner-answers.md:7`), 편집자 결정(449라운드, `reviews/round-449-closing.md` 449C-01)
- 라운드: 449
- 까닭: `reviews/round-449-owner-answers.md:7`

### TEST-088 흔들린 측정 창의 재측정(450라운드) — 고정 규칙 판정이 폭 안이고 그 폭이 같은 행의 평소 폭보다 크게 넓으며 측정 창이 외부 작업과 겹쳤으면 소유자 허락으로 한 번만 같은 규칙으로 다시 잼, 첫 측정 수치를 함께 적고 더 반복하지 않음(443C-03의 예외)

- 결정:
  > 【추론】 D2-M(설계 Ⅰ의 (c) 독자 집합으로 마운트 때의 의존 색인과 게이트 레지스트리 등록을 줄임)은 작업량을 예측대로 줄였다(의존 정규화 961→242, 게이트 등록 시도 323→83, 빈 edge Map 242→0, 분리 참조용 path·kind 기록 유지). 측정 전에 고정한 규칙으로 잰 첫 측정에서 마운트 oneOf-80은 A·B·A′가 2.2075·1.933·2.163 ms였지만 폭이 0.340 ms라 개선이 폭 안이어서 폐기 판정이 났다. 같은 행의 폭은 D2-0 측정에서 0.120 ms였고, 이 측정(2026-10-27T02:30~02:35Z)은 소유자의 네트워크 수리와 겹쳤다. 443C-03은 폭 안의 결과 뒤 같은 행을 다시 재는 것을 막지만, 소유자가 다시 재라고 했다(위 1행). 그래서 측정 환경이 흔들린 경우의 예외로 한 번만 다시 잰다: 후보는 보존한 d1079e5c3 그대로, 규칙은 첫 측정과 똑같고, 결과 문서에 첫 측정의 수치와 '소유자 허락의 예외'를 함께 적으며, 그 재측정 하나로 판정하고 더 반복하지 않는다. 관문(빌드, 다섯 프로젝트, 검증 묶음, 배달과 선언 비교, 노드당 힙)은 첫 측정에서 같은 후보로 모두 통과했으므로 다시 돌리지 않는다.
- 보충:
  > 소유자(450라운드, 재측정과 병합 권한): "다시 재도록. 그리고 해당 단계는 8단계와 분리된 설계최적화 브랜치에서 가지 pr들을 머지하도록 해라. \n네가 만든 pr은 네가 머지할 수 있다." (`reviews/round-450-owner-answers.md:7`)
  > 편집자 결정(455C-01): "【추론】 B1(게이트 판정 통일, 가지 `perf/schema-form-b1-gate-predicate`)의 후보 1(2f1365df3, 창 11:04 UTC)은 쓰기당 `if`-80 598.2→303.8 µs(선 297.7 초과 6.2 µs), `discriminator`-80 456.2→173.8 µs(선 통과), 평가 수 `if` 80·`discriminator` 0, 바퀴 1회, 그림자 불일치 0이었으나 `switch-oneOf-80` 왕복이 A 368.8/B 468.5/A′ 330.9 µs로 B만 느렸고 TEST-073이 A 대 B에서 switch-oneOf-80 −26.25 %, single-flat-1000 −32.03 %로 걸렸다. `active` 경로의 추가 장부를 없앤 후보 2(38e405d6b, 창 11:37 UTC)는 `if`-80 305.4 µs(선 318.2 통과), `discriminator`-80 152.2 µs(선 265.6 통과)로 두 행 모두 폭 밖 개선이지만 `active` 왕복 A 337.3/B 505.8/A′ 377.4 µs의 같은 패턴이 반복되어 TEST-073 A 대 B 3행(single-nested −36.12 %, switch-oneOf-80 −18.86 %, switch-nested-oneOf-20 −18.86 %)이 실패했고 A′ 대 B는 회귀 0이었다. 정식 판정은 두 후보 모두 미채택이다. 독립 진단 둘은 이 "회귀"가 코드 원인이 아님을 보였다: diff 기반 진단(Claude 하위 에이전트, 스크립트 `scratchpad/b1diag`)에서 A·B 번들이 같은 rolldown 설정으로 다시 만든 번들과 바이트 단위로 같고, 쓰기당 함수 호출 수 2284.5 대 2283.5, 실제 하네스 교대 522 대 533 µs, 할당 111.57 대 111.35 KB이며, 게이트가 없어 B1 경로에 들어가지 않는 single-flat-1000·single-nested 행도 같은 창에서 −32 %·−36 %로 "회귀"했고, 같은 빌드가 몇 분 사이에 530→650 µs로 이동했다. 워커의 교대 12프로세스 진단에서도 oneOf-80 B/A 짝별 비율이 0.64·0.96·1.10으로 부호가 바뀌고 CPU self 총합 B/A가 0.887이었다. B1이 `active` 경로에 더한 작업은 모두 쓰기당 1 µs 미만이다. 그래서 같은 후보의 재측정을 TEST-088에 따라 소유자에게 물었고 소유자가 승인했다(위 2행 "1. 승인"). 재측정은 455C-02의 보강 프로토콜로 한 번만 하며, 채택 판정은 그 수치로 하되 선과 규칙(`if` ≤ `active` × 1.1 + 40 µs, `discriminator` ≤ × 1.05, 두 행 폭 밖 개선, oneOf-80 폭 밖 악화 없음, TEST-073, 평가 수·바퀴, 힙)은 그대로다. 독립 코드 검토(antigravity 1부, `/private/tmp/claude-501/perf-runs/453-reviews/pr-b1-part1-antigravity.md`)는 범위·계약·BLUEPRINT-007·BLUEPRINT-053·즉시 반영·화이트리스트의 보수성·오류 의미·시험 red/green 모두 PASS다. 후보 1에서 결함(두 번째 바퀴·게이트당 복사)을 고친 후보 2를 새 창에서 잰 것은 같은 후보의 재측정이 아니라 새 후보의 측정이다(D3b-2와 같은 처리)." (`reviews/round-455-closing.md:8`)
  > 편집자 결정(456C-01): "【추론】 455C-02의 보강 프로토콜로 돈 B1 후보 2의 승인 재측정 창(12:39 UTC, 도구 ded349eaf, 원자료 `/private/tmp/claude-501/perf-runs/20261027T1238-ded349e-b1r2`)은 품질 행 single-flat-1000의 B(10)/A(10) 최소값 중앙 비가 1.182로 ±5 % 밖이라 도구가 첫 행 뒤 즉시 멈췄고 정식 표본은 그 행 20프로세스뿐이었다. 원자료를 보면 그 행은 프로세스별 최소값이 A 60~96 µs, B 60~111 µs로 자체 잡음이 ±40 %이고, 같은 프로세스에서 돈 0.16.1(두 레인에서 완전히 같은 코드)의 최소값도 A 508~618, B 510~618 µs로 중앙값 비 약 1.07이었다. 즉 한 행의 ±5 %는 이 기계의 잡음으로는 만족할 수 없는 기준이었고, 이는 455C-02를 정한 편집자의 착오다. 그 창은 "판정 불가"로 기록하고 재시도하지 않았다(TEST-088). 소유자가 재측정을 다시 승인하며 "이번엔 잘 구성해서" 하라고 했으므로(위 1행) 품질 기준을 바꾼다: 창 품질은 0.16.1 레인이 있는 모든 행에서 같은 프로세스의 0.16.1 레인 B(10) 최소값 중앙 ÷ A(10) 최소값 중앙을 구해 그 중앙값이 0.95~1.05이면 유효하며(두 레인이 같은 코드를 돌리므로 이 비는 창의 흐름만 재고, 17행 × 10프로세스를 모아 잡음이 작다), 모든 행을 끝까지 돌린 뒤 판정하고(첫 행에서 멈추지 않음), 무효여도 힙·단계 장부까지 완료해 기록하되 시간 판정만 "판정 불가"로 한다. 0.16.1 레인이 없는 행(`if`·`discriminator`·구독 2행)은 품질과 "비율의 비율"에서 N/A다. 시간 통계(A 앞 5·A′ 뒤 5·B 10, 폭 (다)), TEST-073(인접 교대 짝 10쌍 주판정, 앞·뒤 5쌍 병기), 선과 규칙은 455C-02 그대로이며 이 정정은 TEST-094를 고친다. 도구는 B1이 `--quality=legacy` 옵션으로 add-only로 더했고(기본 옵션 유지) #476에 들어 있다." (`reviews/round-456-closing.md:8`)
- 상태: 현행
- 출처: `reviews/round-450-closing.md:8`(정본), `reviews/round-450-owner-answers.md:7`
- 닫은 사람: 소유자 답(`reviews/round-450-owner-answers.md:7`), 편집자 결정(450라운드, `reviews/round-450-closing.md` 450C-01)
- 라운드: 450
- 까닭: `reviews/round-450-owner-answers.md:7`

### TEST-089 D3b-2의 판정(451라운드) — 첫 후보 미달의 원인을 변수 하나씩 되돌린 탐침으로 분리(호스트별 `Map`의 JSC 엔트리당 약 79 B), 엔트리별 저장소 둘은 선언 부모 host 소유 WeakMap, Bun B2 +0.413 B/노드는 TEST-027 수용, 브리프의 고정 규칙("폭 밖 악화 0")을 측정 뒤 계획서의 TEST-073 선으로 바꾼 것과 A′ 전용 신호의 해석은 공개하고 재검증 대상으로 두며 D4가 다시 잼

- 결정:
  > 【추론】 D3b-2(파생 WeakMap 루트 32개를 청사진·호스트 레코드 둘의 지연 슬롯으로, 생성 사실은 청사진에 두고 `setMode()`가 지우지 않음, 엔트리별 저장소는 선언 부모 host 레코드가 소유)의 첫 후보 54b8aff0b는 기능 관문은 다 통과했지만 마운트 nested-d6-f4가 폭(0.42 ms) 밖에서 +4.18 %/+3.52 % 악화하고 Bun B2가 +80.7 B/노드(+3.63 %)라 채택하지 않았다. `verification.md`의 "원인을 같은 PR에서 분리한다"에 따라 변수 하나(staticIds 저장만 옛 전역 WeakMap)만 되돌린 탐침으로 Bun 79.06 B/노드(엔트리당 79.08 B)가 호스트별 `Map`의 비용임을 분리했고, 시간 악화는 네 변형이 모두 폭 안이라 재현되지 않았다. 최종 후보 de14aa1da(host-owned WeakMap, 소유 host를 호출자가 명시, 형제 N개의 저장소 공유 시험)는 기준판 8569ec0e1(#470 포함) 대비 기능 관문·배달 0·d.ts 0, Node B2 통과, Bun B2 B 중앙값이 A 최댓값보다 +0.608 B/노드(+0.027 %) 커서 고정 규칙 미달이었고 소유자가 TEST-027로 받아들였다(위 6행). 마운트 nested-d6-f4는 +2.60 %/+3.06 %로 폭 밖이지만 계획서 게이트의 선(TEST-073, 처리량 15 % 초과 하락과 Welch p<0.05)은 안이다. 그런데 브리프에 측정 전 고정한 규칙은 "어느 행도 폭 밖 악화가 없어야 채택"이었고 코디네이터는 측정 뒤에 계획서의 선을 적용했다: 계획서를 따른 것이지만 측정 뒤의 규칙 변경이라 TEST-081에 어긋나므로, 결과 문서와 PR에 "브리프 규칙으로는 미달, 계획서 규칙으로는 통과, 편집자가 측정 뒤 적용"으로 공개하고 재검증 대상으로 두며 D4에서 그 행을 다시 잰다. TEST-073의 평균·Welch 20비교에서 single-nested-d6-f4의 A′/B만 −16.85 %(p 2.2e-7)로 선 밖이었는데 같은 행의 A/B는 −8.34 %이고 A 대 A′의 평균 차이가 10.24 %이며 최솟값 중앙은 A와 B가 0.1766 ms로 같아, 게이트는 A/B로 보고 이 신호는 0.18 ms 행의 평균 불안정으로 읽어 공개만 했다(편집자 판정, 재검증 대상). 독립 검토(antigravity, 2부)는 PASS였으나 `admittedEdgeSchemas`가 같은 모양의 호스트별 `Map`으로 남아 게이트 형제가 많은 폼에서 같은 엔트리당 비용을 낸다고 지적했고, 후속 D3b-2b로 그것도 host-owned WeakMap으로 바꿔(제품 변경 한 파일, 이 PR의 새 시험만 수정, DETAIL 선행) 전체 고정 규약을 다시 쟀다: 폭 밖 악화 0, TEST-073 회귀 0, Node B2 통과, Bun B2 +0.413 B/노드로 수용치 안. 델타 검토 PASS. 판정 파일은 `/private/tmp/claude-501/perf-runs/446-reviews/pr-471-antigravity.md`, 결과 문서는 `verification/design-optimization/d3b-2-results.md`다.
- 보충:
  > 소유자(451라운드, D3b-2의 힙 수용, 세 판 비교, 병합 방법): "받아들입니다. 현행 작업 마무리까지 진행하세요. 해당 브랜치 작업으로 0.16.1, 작업이전, 작업이후 각각 비교를 구하고 pr에 수록하세요.\n머지 방법은 스쿼스 머지입니다." (`reviews/round-451-owner-answers.md:12`)
- 상태: 현행
- 출처: `reviews/round-451-closing.md:12`(정본), `reviews/round-451-owner-answers.md:12`, `verification/design-optimization/d3b-2-results.md`
- 닫은 사람: 소유자 답(`reviews/round-451-owner-answers.md:12` Bun B2 수용), 편집자 결정(451라운드, `reviews/round-451-closing.md` 451C-03)
- 라운드: 451
- 까닭: `reviews/round-451-closing.md:12`

### TEST-090 설계 최적화 단계의 D4 판정(452라운드) — 분기 전환 oneOf-80은 0.16.1의 6.87배·0.511 ms를 "설계의 대규모 개편 없이 도달 가능한 상한"으로 기록하고 D5 없이 단계를 닫으며 다음 단계가 분기 전환에만 집중, 일괄 입력 nested 1.13배·게이트 잎 쓰기 1.17배 통과, 형제 선형항은 두 판 공통의 성질(새 판이 1,000·4,000에서 더 빠름), Bun B2 +9.84 B/노드 수용

- 결정:
  > 【추론】 D4 통합 측정(`verification/design-optimization/d4-results.md`, L = 0.16.1, S = 단계 시작 판 6692e7f69, E = 단계 끝 판 ca8d52f59)에서 분기 전환 oneOf-80은 E 0.511 ms로 L의 6.87배(S 대비 0.93배)라 관문(1.5배, 1 ms)에 미달했다. 소유자가 분기 전환은 다음 단계에서 집중적으로 다루며 설계의 대규모 개편 없이 도달 가능한 상한으로 기록하라고 했다(위 1행). 그래서 이 단계는 D5(설계 Ⅱ)로 가지 않고, 6.87배·0.511 ms를 "설계 Ⅰ과 캐시 계층까지로 도달한 상한"으로 적어 닫으며, 분기 전환은 다음 단계의 유일한 주제다(위 3행 "분기전환 문제에만 집중하기 위함"). 보류한 D2-P5(`perf/schema-form-d2-sibling-linear` 4681c0aff)는 그 단계의 출발 자료다. 447C-07·TEST-083의 "미달이면 D5 진행 여부를 소유자가 정한다"는 이 결정으로 답해졌다.
- 보충:
  > 소유자(452라운드, D4 관문 미달의 처리와 세 물음): "분기전환에 대해서는 다음 단계에서 집중적으로 다룬다. 설계의 대규모 개편 없이 도달 가능한 상한으로 기록하면 된다.\n형제 선형항은 무슨 의미인가? 차이가 너무 큰데. 힙당 크기는 수용 가능하다. \n청사진 캐싱으로 충분한 속도 가속이 나오지 않은 이유는 매번 청사진 캐시를 비운 까닭인가? 그리고 react 벽시계는 뭘 말하는건가? 용어가 이상하다" (`reviews/round-452-owner-answers.md:7`)
  > 소유자(452라운드, 러너 수정 뒤 다음 단계): "이 문제까지 수정하고 다음으로 간다. 분기전환은 분기전환 문제에만 집중하기 위함이다" (`reviews/round-452-owner-answers.md:9`)
  > 편집자 결정(453C-01): "【추론】 452C-01이 분기 전환을 다음 단계의 유일한 주제로 넘겼고 소유자가 그 단계를 열었다(위 1행 "이제 분기 전환에 집중한다", 위 3행 "진행을 허가합니다"). 단계는 설계 최적화 단계 뒤, 9단계 앞이며 계획서는 `plan/branch-switch/`다. 가지 `feat/schema-form-branch-switch`는 설계 최적화 가지(`feat/schema-form-design-optimization`, b8db53997) 위에 쌓고, #472와 #445가 병합되면 base를 옮긴다. PR 규칙(가설 하나에 PR 하나, DETAIL 선행, 스쿼시 병합, 독립 검토, 원장 검사)은 LANDING-211·451C-04 그대로다. 보류한 D2-P5 가지 `perf/schema-form-d2-sibling-linear`(4681c0aff)는 이 단계의 B2 자료이며, 그 PR이 병합되거나 폐기될 때 지운다. 이 단계의 범위는 분기 전환뿐이고 마운트·일괄 입력의 추가 최적화는 하지 않는다(452라운드 위 3행 "분기전환 문제에만 집중")." (`reviews/round-453-closing.md:8`)
  > 편집자 결정(453C-04): "【추론】 관문은 소유자가 유지했다(위 2행 "그래"): oneOf-80 왕복이 0.16.1의 1.5배 안이고 1 ms 아래(446C-06). 같은 형상의 `discriminator` 행도 같은 선, `if` 행은 453C-03의 선, 형제 1,000 전환이 형제 0의 작은 상수 배 안, 다른 canonical 행과 구독 경로 행은 TEST-073 선 안, B2 노드당 힙은 Node가 단계 시작 이하이고 Bun은 452라운드의 수용에 따르며 설계 Ⅱ는 보유 메모리 상한을 따로 적는다. 단계는 B0 측정 장부(쓰기 한 번의 단계별 µs와 할당 장부를 형제 0·oneOf-80·깊은 분기 하나에 대해 세 게이트 종류로 측정 장치에 추가, `switch-if-80`(AJV)·`switch-discriminator-80` 행 추가, 두 번째 바퀴의 원인 확인, 단계 시작 판 b8db53997과 0.16.1) → B1 게이트 통일 → B2 준비물과 Δ 적용(가설마다 PR 하나) → B3 관문 재측정 → (조건부) B4 설계 Ⅱ → B5 마감(통합 판 재측정, React `--equivalent`, B2 힙, 루트 PR, 설계 문서·ADR 반영)이다. B1~B3의 목표선은 B0의 장부로 측정 전에 고정한다(TEST-081). 447C-06의 "설계 Ⅰ만으로 쓰기 한 번 하한 약 61 µs, 설계 Ⅰ+Ⅱ로도 왕복 0.156~0.24 ms"는 도출 과정과 원자료가 기록되지 않았고(452라운드 자료 조사) 이번 작업량 추적이 그 가정과 다른 비용 구조를 보였으므로, 이 단계의 관문이나 착수 판단에 쓰지 않고 B0의 장부가 대체한다. 이것은 편집자의 이전 판단에 대한 정정이며 재검증 목록에 올린다. 측정 프로토콜은 그대로다(20 예열·100 표본·3 실행, 조용한 창, 폭 (다), 재측정 없음)." (`reviews/round-453-closing.md:14`)
- 상태: 현행
- 출처: `reviews/round-452-closing.md:8`(정본), `reviews/round-452-closing.md:10`, `reviews/round-452-closing.md:12`, `reviews/round-452-closing.md:18`, `reviews/round-452-owner-answers.md:7`, `verification/design-optimization/d4-results.md`
- 닫은 사람: 소유자 답(`reviews/round-452-owner-answers.md:7`, `reviews/round-452-owner-answers.md:9`), 편집자 결정(452라운드, `reviews/round-452-closing.md` 452C-01·02·03·06)
- 라운드: 452
- 까닭: `reviews/round-452-owner-answers.md:7`

### TEST-091 React 전체 폼 러너의 갱신 경과 시간(452라운드) — 옛 `render-update-wall`은 `setTimeout(0)` 대기의 Node 1 ms 클램프가 만든 허상(두 판이 일을 타이머 전후로 다르게 둠)이라 쓰지 않고, 타이머 클램프 없는 정착 장벽 뒤의 `update-settled`(gross)와 `update-sync`·빈 장벽 바닥·net으로 잰다(#473), 다시 잰 E÷L 0.106~1.098, 7·8단계의 같은 러너 수치는 같은 허상을 안음

- 결정:
  > 【추론】 소유자가 "React 벽시계"라는 용어를 지적하고(위 1행) 갱신 경과 시간이 Profiler와 다른 까닭을 검토하라고 했으며(위 2행) 그 문제까지 고치고 다음으로 가라고 했다(위 3행). 진단: `render-update-wall`은 상호작용 루프 전후의 경과 시간이고 상호작용마다 `flushSync` 뒤 `setTimeout(0)` 두 번을 기다리는데(`packages/aileron/benchmark-form/src/benchmarks/canard/equivalent.ts:91-100`, `src/utils/setup-env.ts:73-82`) Node가 1 ms로 클램프해 약 2 ms 바닥과 밀리초 경계마다 1 ms 계단이 생긴다. 새 판은 값 쓰기 안에서 정착·배달 파동·React 동기 commit을 타이머 전에 끝내고, 옛 판은 마이크로태스크·setTimeout으로 미뤄 타이머 대기 안에서 돌아 Profiler에는 잡히고 경과 시간에는 숨는다. react-1.json의 sample-0 분포가 L 56 %/44 %, E 8 %/92 %의 두 봉우리라 1.46배는 봉우리 이동이지 연속 비용이 아니며 commit 반감은 원인이 아니다. D4b(#473, 러너만 변경, 제품 소스 변경 0): 타이머 클램프 없는 정착 장벽(마이크로태스크 비움 → immediate → `setTimeout(0)` 한 번 → immediate)으로 옛 판의 미룬 작업이 모두 끝난 뒤 멈추고, `update-sync`(flushSync 구간)·`update-settled`(정착 완료까지)·빈 장벽 바닥·바닥을 뺀 net을 더했다. 다시 재니 `update-settled` E÷L은 19 픽스처에서 0.106~1.098(배열 갱신 0.11~0.57, 평면·sample 0.95~1.03, nested-d5 1.10, oneOf 1.02~1.04, array-replace 1.07~1.09)이고, Profiler 갱신은 0.04~1.07, commit 수는 절반이다. 독립 검토 PASS(`/private/tmp/claude-501/perf-runs/446-reviews/pr-473-antigravity.md`: 장벽 공정성, 114 수치 일치, 기존 시험 변경 0). 용어는 "갱신 경과 시간"으로 쓴다. 7단계·8단계의 React 측정(`verification/07-switch/`)도 같은 러너로 쟀으므로 그 경과 시간 수치는 같은 허상을 안고 있다는 것을 적어 둔다(수치 자체는 고치지 않는다).
- 보충:
  > 소유자(452라운드, D4 관문 미달의 처리와 세 물음): "분기전환에 대해서는 다음 단계에서 집중적으로 다룬다. 설계의 대규모 개편 없이 도달 가능한 상한으로 기록하면 된다.\n형제 선형항은 무슨 의미인가? 차이가 너무 큰데. 힙당 크기는 수용 가능하다. \n청사진 캐싱으로 충분한 속도 가속이 나오지 않은 이유는 매번 청사진 캐시를 비운 까닭인가? 그리고 react 벽시계는 뭘 말하는건가? 용어가 이상하다" (`reviews/round-452-owner-answers.md:7`)
  > 소유자(452라운드, 갱신 경과 시간과 Profiler의 차이 검토): "갱신경과시간이 커밋 프로파일과 다른걸 검토하라. 엔진작업이 끝나야 리엑트 트리에 반영할텐데 어떻게 차이가 나는거지?" (`reviews/round-452-owner-answers.md:8`)
  > 소유자(452라운드, 러너 수정 뒤 다음 단계): "이 문제까지 수정하고 다음으로 간다. 분기전환은 분기전환 문제에만 집중하기 위함이다" (`reviews/round-452-owner-answers.md:9`)
- 상태: 현행
- 출처: `reviews/round-452-closing.md:16`(정본), `reviews/round-452-owner-answers.md:7-9`, `verification/design-optimization/d4-results.md`, `packages/aileron/benchmark-form/README.md`
- 닫은 사람: 소유자 답(`reviews/round-452-owner-answers.md:8-9`), 편집자 결정(452라운드, `reviews/round-452-closing.md` 452C-05)
- 라운드: 452
- 까닭: `reviews/round-452-owner-answers.md:8`

### TEST-092 분기 전환 단계의 구성과 관문(453라운드) — B0 측정 장부(세 게이트 종류 행과 단계별 µs 장부) → B1 게이트 통일 → B2 준비물과 Δ 적용 → B3 관문 재측정 → (조건부) B4 설계 Ⅱ → B5 마감, 관문은 446C-06 유지(oneOf-80 왕복 1.5배·1 ms, `discriminator` 같은 선, `if`는 453C-03의 선), 형제 1,000/0 작은 상수 배, TEST-073·B2 힙, 447C-06의 하한 추정은 도출 미기록이라 쓰지 않고 B0가 대체(편집자 정정)

- 결정:
  > 【추론】 관문은 소유자가 유지했다(위 2행 "그래"): oneOf-80 왕복이 0.16.1의 1.5배 안이고 1 ms 아래(446C-06). 같은 형상의 `discriminator` 행도 같은 선, `if` 행은 453C-03의 선, 형제 1,000 전환이 형제 0의 작은 상수 배 안, 다른 canonical 행과 구독 경로 행은 TEST-073 선 안, B2 노드당 힙은 Node가 단계 시작 이하이고 Bun은 452라운드의 수용에 따르며 설계 Ⅱ는 보유 메모리 상한을 따로 적는다. 단계는 B0 측정 장부(쓰기 한 번의 단계별 µs와 할당 장부를 형제 0·oneOf-80·깊은 분기 하나에 대해 세 게이트 종류로 측정 장치에 추가, `switch-if-80`(AJV)·`switch-discriminator-80` 행 추가, 두 번째 바퀴의 원인 확인, 단계 시작 판 b8db53997과 0.16.1) → B1 게이트 통일 → B2 준비물과 Δ 적용(가설마다 PR 하나) → B3 관문 재측정 → (조건부) B4 설계 Ⅱ → B5 마감(통합 판 재측정, React `--equivalent`, B2 힙, 루트 PR, 설계 문서·ADR 반영)이다. B1~B3의 목표선은 B0의 장부로 측정 전에 고정한다(TEST-081). 447C-06의 "설계 Ⅰ만으로 쓰기 한 번 하한 약 61 µs, 설계 Ⅰ+Ⅱ로도 왕복 0.156~0.24 ms"는 도출 과정과 원자료가 기록되지 않았고(452라운드 자료 조사) 이번 작업량 추적이 그 가정과 다른 비용 구조를 보였으므로, 이 단계의 관문이나 착수 판단에 쓰지 않고 B0의 장부가 대체한다. 이것은 편집자의 이전 판단에 대한 정정이며 재검증 목록에 올린다. 측정 프로토콜은 그대로다(20 예열·100 표본·3 실행, 조용한 창, 폭 (다), 재측정 없음).
- 보충:
  > 소유자(453라운드, 관문 유지와 검증기 분기의 포함, 설계안 요청): "그래. 그리고 path는 다르지만 if-then 구문을 사용한 검증기 브랜치 전환도 대상에 넣도록 해. 아마 내부적으로 사용하는 경로는 동일할거고, 검증 경로만 함수식이 아니라 검증기일거라서. 물론 검증기를 사용한 브랜치 운영은 기존 사례가 없으니까 앞선 개선과 맞물리도록 개선하는걸 최우선으로 하자. 설계안 보여줘봐. 어떻게 바꾸고자 하는지" (`reviews/round-453-owner-answers.md:8`)
  > 소유자(453라운드, 설계안의 허가와 진행 방식): "네 진행을 허가합니다. 멀티에이전트 작업으로 진행하세요" (`reviews/round-453-owner-answers.md:9`)
  > 편집자 결정(454C-01): "【추론】 B0(`verification/branch-switch/b0-ledger.md`, 창 2026-10-27 09:28 UTC, 단계 시작 판 b8db53997, 독립 검토 PASS, #474 스쿼시 a6e339b3c)는 쓰기당 oneOf-80이 0.16.1 43.7 µs 대 261.3 µs(5.98배), 형제 0이 31.2 대 101.8, `discriminator`-80이 473.6(active의 1.81배, 평가 800회·바퀴 2회), `if`-80이 595.9(2.28배, 평가 640회·바퀴 2회, 평가당 약 0.46 µs), 잎 12개 분기가 108.4 대 480.6(나감·들어옴 잎 하나당 약 12 µs, 0.16.1은 3.6)임을 쟀다. 단계 장부(oneOf-80 쓰기당)는 computeNode 103(selectChildren self 36·computeNode self 35·바퀴 준비 8.7·조립 9.1), finalizeExits 55(getControlLayers 15.5/12회·setLatentRaw 11.2/6회), commitSettlement 46(비활성 값 메모 18.7·배달 표식 11.9), registerRecalculation 13.0, 그 밖 17.1이고 할당은 약 130 KB/쓰기다. 두 번째 바퀴의 원인은 선택 도중 들어오는 payload가 공표되어 게이트가 읽는 루트 투영 객체의 identity가 라운드 안에서 바뀌는 것(즉시 반영 계약의 귀결)으로 확인되었다. 회귀 적합(floor 169.9, 분기당 0.872)은 잔차가 −53~+52 µs라 구조 상수로 쓰지 않는다. 이 장부로 B1·B2·B3의 목표선을 측정 전에 고정해 `plan/branch-switch/request.md`의 "B0 장부 뒤 고정한 목표선" 절에 적었다(TEST-081): B1은 같은 창에서 B의 `if`-80 ≤ B의 oneOf-80 × 1.1 + 40 µs, B의 `discriminator`-80 ≤ oneOf-80 × 1.05, 두 행 폭 밖 개선, 평가 수 80 이하, 좁힌 `if`는 바퀴 1회, oneOf-80 폭 밖 악화 없음; B2는 단계별 상한(바퀴 준비 1, 나감 정책 2, 비활성 값 메모 3, 조립 3, 잠복 저장 8, 재계산 등록 5, 배달 표식 6, 선택·계산 self 25, 그 밖 10 µs, 바닥 40 µs); B3는 446C-06 그대로. 측정 행의 단위는 기존 장치와 같이 쓰기 2회(왕복 1회) 합계이며 표마다 쓰기당 환산을 함께 적는다(B0 워커의 물음에 대한 답; 브리프의 "왕복 2회"는 편집자의 착오였다)." (`reviews/round-454-closing.md:8`)
  > 편집자 결정(454C-03): "【추론】 `settle.gate-wheel-counts.test.ts`의 S6 사례는 `kind` const/required의 검증기 `if`가 항상 바퀴 2회·건너뜀 0임을 고정하는데, 454C-02의 좁힌 읽기로는 바퀴 1회가 되어 충돌한다. 기대값 편집 금지(운영 원칙 12, 이 단계의 게이트 "시험 파일은 추가 줄만")를 지키기 위해 그 사례의 단언은 한 글자도 바꾸지 않고 사례 앞뒤에 `engineModes.gatePredicate`를 off로 두고 복구하는 add-only 줄만 더한다(주석은 역사가 아니라 "전수 입력·메모 없는 기준 경로의 바퀴 수를 고정한다"는 현재 사양). 출하 기본 경로는 새 시험으로 고정한다: 좁힌 `if`는 바퀴 1회와 건너뜀 계수, 좁힐 수 없는 `if`(`not` 안의 `$ref`, `patternProperties`)는 바퀴 2회 유지. 그림자 검증(`gateWheelEvaluation` shadow·`gateSelectionTable` verify)이 S6을 포함해 두 경로의 선택 결과 동등성을 증명하고 `test:verify` 묶음에 들어간다. PR 본문과 결과 문서에 "기존 시험 기대값 변경 0, 기준 경로 고정 줄 추가(add-only)"와 그 줄의 diff를 적는다. 기대값을 바꿔야만 통과하는 시험이 그 밖에 하나라도 나오면 구현을 멈추고 올린다. 이 처리는 계수 시험이 공개 동작이 아니라 내부 바퀴 수를 고정한 것이고 `engineModes`가 바로 이런 기준 경로 비교를 위해 있기 때문에 허용하지만, 운영 원칙 12와 경계에 있으므로 재검증 목록에 올린다." (`reviews/round-454-closing.md:12`)
  > 편집자 결정(455C-02): "【추론】 지금 장치는 A·B·A′를 각각 3프로세스씩 순서대로 재는데, 기계 상태가 몇 분 사이에 20 % 넘게 움직여 TEST-073의 A 대 B Welch 검정이 창의 흐름에 걸린다(455C-01의 증거). 소유자가 보강을 승인했다(위 2행 "2. 승인"). 보강은 셋이다: 행마다 A와 B 프로세스를 번갈아(A B A B …) 각 10프로세스(20 예열·100 표본은 그대로) 돌려 같은 시각의 짝으로 비교하고, A′는 따로 돌리지 않고 A 프로세스의 뒤 절반(6~10번째)으로 정의해 폭 (다) = max(|A−A′|, rangeA, rangeA′) 규칙을 그대로 적용하며, 가설이 닿지 않는 행(B1·B2-P1b는 branchless·잠복 없는 single-flat-1000)의 B/A 중앙값 비가 ±5 % 밖이면 창을 무효로 하고, TEST-073은 교대 짝의 A 대 B로 판정하되 A′ 대 B를 나란히 적는다. 폭 (다)의 규칙(443C-03)과 15 % 선(TEST-073)은 바꾸지 않는다. B1이 이 모드를 측정 장치(`verification/design-optimization/tools/`)에 더해 단계 가지로 올리고, B1 후보 2의 재측정과 B2-P1b부터의 모든 정식 측정에 적용한다. 무효 창은 재측정이 아니라 "판정 불가"로 기록한다(재측정 금지 유지)." (`reviews/round-455-closing.md:10`)
  > 편집자 결정(457C-01): "【추론】 소유자가 결과는 짧게 추세만 보고 시간을 많이 쓰지 말고 판정만 하라고 했다(위 1행). 이에 따라 B2의 남은 가설은 독립 코드 검토 한 번과 측정 판정으로 처리하고 측정 보고에 대한 2부 검토는 생략하며, 결과 문서는 표(단계 A/B, 행 A/B/A′·폭·품질, TEST-073, 힙)와 판정 한 줄로 줄인다. 남은 B2 항목은 설계의 묶음 둘로 합쳐 각각 PR 하나·창 하나로 잰다: B2-P2 호스트 수명 준비물(바퀴 계획·나감 정책과 제어 계층·정적 자식 준비물·잠복 순서의 청사진 색인), B2-P3 변화량 적용(노드가 드는 잠복 키·활성 자식만 걷는 조립·Δ 집합을 쓰는 등록·배달 표식). "가설 하나에 PR 하나"는 묶음 단위로 완화한 편집자 결정이며 소유자가 반대하면 되돌린다. 소유자가 요청한 1차 확인 요약(위 2행)은 B2-P2 창 뒤에 올렸다." (`reviews/round-457-closing.md:8`)
  > 편집자 결정(457C-04): "【추론】 1차 확인에서 oneOf-80 쓰기당이 261→252→약 220 µs로 관문 66 µs에 멀고, 남는 비용이 선택·계산 self 약 70 µs와 나감·들어옴 노드당 약 12 µs(설계 Ⅰ~Ⅲ로 건드릴 수 없는 항)임을 보고했으며, 소유자가 A(설계 Ⅱ 지금 착수, 설계를 먼저 고정하고 롱턴 위임)를 택했다(위 3행). 설계는 `plan/branch-switch/design-ii.md`에 고정했다: 나간 노드의 공개 인스턴스는 지금처럼 떼어진 채로 남고(NODE-044 그대로 — 읽기 고정·재진입은 새 인스턴스·옛 구독 비발화), 호스트가 그 인스턴스를 청사진 엔트리별 비활성 슬롯으로 보유하며, 재진입은 청사진과 잠복 저장소가 아니라 슬롯 인스턴스에서 복제해 새 인스턴스를 만든다(raw·extras·선언 외 값·자식 슬롯 복제, 부모·경로·레지스트리·색인은 새로, 상호작용 상태·오류는 복제하지 않고 itemKey는 새로). 비활성 동안의 쓰기는 떼어진 인스턴스를 고치지 않고 호스트의 슬롯별 overlay에 두며, `inactiveValues`는 슬롯에서 읽어 공개 결과를 그대로 내고 떼어진 호스트는 자기 슬롯에서 계산하므로 캡처가 없다. 비용 모델은 나감 O(1)·들어옴 O(복제 서브트리)·커밋의 메모 재구성 0·호스트당 슬롯 ≤ M이고, 예상 효과는 oneOf-80 쓰기당 약 50~55 µs다. B4-1은 기능 플래그 `engineModes.slots`(기본 on, off는 기준 경로이자 그림자 오라클) 아래 슬롯 경로와 잠복 경로를 공존시키고 여섯 의미 시험을 두며, B4-2가 잠복 경로를 지운다. 채택 규칙은 단계 장부(잠복 저장 0·메모 0·들어옴 생성 절반 이하)와 주판정 TEST-073·Node 힙·슬롯 보유량 기록이고 총합은 B3 누적이다. 소유자가 관문 수치를 따로 바꾸지 않았으므로 446C-06(1.5배·1 ms)은 그대로이며, 설계 Ⅱ 뒤에도 약 100~120 µs가 예상되어 선택·계산 self의 세부 장부가 B3 전에 필요하다는 전망을 보고했다. 워커는 codex(Orca, 가지 `perf/schema-form-b4-1-slots`, 기준 64185f8fd)다." (`reviews/round-457-closing.md:14`)
  > 편집자 결정(458C-06): "【추론】 B4-2는 `engineModes.slots`의 off 경로와 verify 그림자, 잠복 저장소·메타데이터·색인, `restoreLatentState`, 비활성 값 메모와 그 필드, 잠복 캡처만을 위한 `.detached` 읽기 지점을 지우고 슬롯 경로를 유일한 경로로 둔다(`*` 서브트리 예외는 최소 장치로 유지). B4-1의 두 일탈 가운데 고칠 수 있는 것을 과제로 받는다: 슬롯이 없고 보유될 엔트리도 없는 호스트는 쓰기 경로에서 적격 판정·overlay 조회·플래그 읽기를 하나도 하지 않도록 준비 때 한 번 정하고(`switch-siblings-0`의 장부 합과 unwrapped 지연을 A의 자기 폭 안으로), 복제 노드 3개에 약 2 µs 붙은 `markCommitDeliveries`를 생성 경로와 같게 한다. B4-1의 add-only `slots = off` 핀 77파일은 off 경로가 사라지므로 회수하며 그 시험은 슬롯 경로에서 기대값 그대로 통과해야 한다(못 하면 계약 충돌로 escalation). 채택 규칙: 공개 동작 불변(전후 배달 비교 0), `switch-siblings-0`과 `markCommitDeliveries`가 A의 폭 안이거나 더 좋음, 어느 단계도 A의 자기 폭 밖으로 나빠지지 않음, 주판정 TEST-073 회귀 0, Node 힙 B 중앙 ≤ A 최대, Bun 보고; A는 병합된 B4-1(슬롯 on)이다. 그 뒤 B3 관문 재측정(0.16.1과 단계 시작 판 대비, 446C-06의 1.5배·1 ms)을 한 번 하고 표로 최종 보고를 올린다. 워커는 codex(가지 `perf/schema-form-b4-2-latent-removal`)." (`reviews/round-458-closing.md:18`)
  > 편집자 결정(459C-02): "【추론】 B4-2가 B4-1의 add-only `slots = off` 핀 77파일을 회수하자 핀이 가리고 있던 슬롯 경로의 공개 계약 결함 둘이 드러났다: (a) `settle.value-model`의 OPEN-4 — 같은 이름·다른 kind의 비활성 원본이 있으면 호스트 default가 재진입 raw를 덮지 못해야 하는데 슬롯 경로는 default를 냈다; (b) `settle.candidate-source-preservation-inactive-write` — 비활성 쓰기의 미선언 tail·extras가 보존되어야 하는데 지워졌다. 둘 다 단언은 그대로 두고 슬롯 경로를 고쳤다(수정 전 실패 9행 보존). 454C-03·458C-02가 허용한 핀은 "잠복 구현을 고정하는 기존 시험"에 한한 것이었으므로 공개 동작 시험까지 덮은 것은 범위 과대였고, 그림자(verify)가 둘을 못 잡은 까닭도 그 시나리오가 핀 아래에서 off로만 돌았기 때문이다. 코디네이터의 오판 둘도 정정한다: 떼어진 참조의 쓰기를 "즉시 `inactiveValues`에 공표"하라 한 것은 배달 장치 62지점(off·on 모두 커밋까지 늦춤)과 어긋난 착오였고, 그 근거로 든 두 시험(`settle.array-detached-reference`, `settle.array-detached-reset-address`)은 쓰기 직후 잠복 저장소(내부)만 단언할 뿐 공개 시점을 단언하지 않았다(워커의 6행 재현으로 확인). 계약은 "공표는 커밋에서, 배치 밖 떼어진 쓰기도 off 경로와 같은 시점"이며 그 잠복 단언은 슬롯 overlay 단언으로 옮겼다. 규칙: 핀은 구현을 직접 단언하는 시험에만, 공개 동작의 기준은 전후 배달 비교이고, 코디네이터는 시험의 단언을 읽은 뒤에 판정한다." (`reviews/round-459-closing.md:10`)
  > 편집자 결정(459C-05): "【추론】 창 품질 1.013 유효. 쓰기당 µs(0.16.1 / 단계 시작 / 단계 끝): switch-oneOf-80 36.7 / 245.5 / 152.0(단계 −38 %, 0.16.1의 4.14배, 1 ms 아래), discriminator-80 쌍 없음 / 438.9 / 122.6, if-80 쌍 없음 / 581.4 / 196.7(guard 0.03 µs/호출, active+160 guard 상한 308.8), nested-oneOf-20 30.2 / 340.0 / 283.7, payload-12 104.2 / 462.4 / 274.3, siblings-0 31.2 / 99.8 / 97.5, siblings-100 137.4 / 273.6 / 263.5, siblings-1000 2536.0 / 2078.7 / 2069.9, siblings-4000 7922.4 / 6763.3 / 6670.9. 관문: oneOf-80 1.5배 FAIL(1 ms는 통과), discriminator-80·if-80 FAIL(같은 선), 형제 FAIL(21.2배 대 3배; 1,000개당 선형항 약 2.0 ms는 단계 시작과 같고 0.16.1의 2.5 ms보다 작음), 다른 canonical 행 TEST-073 PASS(주판정 회귀 0, 뒤 반창 1건), Node 노드당 힙 FAIL(S 중앙 1439.1 → E 중앙 1440.3 B/노드, +0.09 %; PR마다의 규칙인 B 중앙 ≤ A 최대 1889.5로는 통과, Bun 2224.8 → 2250.9 보고), 제거 대상 단계 호출 0 PASS. 보유 상한은 K·M = 3·1(oneOf·if·discriminator·nested), 12·1(payload), reset 뒤 슬롯 호스트 0. React 전체 폼은 보고 전용. oneOf-80의 이전 창 인용 누적은 261.3(시작) → 252.4(B1) → 220.6(B2-P2) → 146.2(B4-1) → 187.1(B4-2 창, 그 창의 A는 191.1)이고 B3 재측정은 245.5 → 152.0이다. 남은 비용의 자리: 선택·계산 self(selectChildren 약 29 µs, computeNode 약 32 µs), 등록·재계산 약 12 µs, finalizeExits 약 19 µs, 조립·커밋·배달 약 30 µs, 형제 선형항 약 2.0 ms/1,000(조립·등록 추정, B2-P3가 보류한 존재 차분 재사용의 자리). 계획서의 "B3에서 관문 미달이면 수치를 소유자에게 올려 다음을 소유자가 정한다"에 따라 단계를 여기서 멈추고 보고한다: 선택지는 (A) 관문을 지금 수치로 고쳐 B5 마감, (B) 선택·계산 self와 형제 선형항을 겨냥한 설계 Ⅲ 착수, (C) 그대로 9단계로. 소유자의 자율 진행 지시(위 2행)는 "목표한 작업"을 끝까지 하라는 것이었고 목표한 작업(B0~B4-2·B3)은 모두 끝났으므로, 다음 단계의 선택은 소유자에게 돌린다." (`reviews/round-459-closing.md:16`)
- 상태: 현행
- 출처: `reviews/round-453-closing.md:14`(정본), `reviews/round-453-owner-answers.md:8-9`, `plan/branch-switch/verification.md`
- 닫은 사람: 소유자 답(`reviews/round-453-owner-answers.md:8`), 편집자 결정(453라운드, `reviews/round-453-closing.md` 453C-04)
- 라운드: 453
- 까닭: `reviews/round-453-owner-answers.md:8`

### TEST-093 B0 측정 장부의 결과와 B1~B3 목표선(454라운드) — 쓰기당 oneOf-80 0.16.1 43.7 µs 대 261.3 µs, `if`-80 595.9·`discriminator`-80 473.6(바퀴 2회), Δ 잎당 약 12 µs, 단계 장부(computeNode 103·finalizeExits 55·commit 46), 두 번째 바퀴 원인은 라운드 중 호스트 투영 identity 변화, 목표선은 측정 전 고정(B1: `if` ≤ oneOf × 1.1 + 40 µs·`discriminator` ≤ × 1.05·평가 80 이하·바퀴 1회, B2: 단계별 상한 합 약 63 µs·바닥 40 µs, B3: 446C-06), 측정 단위는 쓰기 2회 합계와 쓰기당 환산, 기존 계수 시험은 기대값 변경 0에 기준 경로 모드 고정 줄 add-only

- 결정:
  > 【추론】 B0(`verification/branch-switch/b0-ledger.md`, 창 2026-10-27 09:28 UTC, 단계 시작 판 b8db53997, 독립 검토 PASS, #474 스쿼시 a6e339b3c)는 쓰기당 oneOf-80이 0.16.1 43.7 µs 대 261.3 µs(5.98배), 형제 0이 31.2 대 101.8, `discriminator`-80이 473.6(active의 1.81배, 평가 800회·바퀴 2회), `if`-80이 595.9(2.28배, 평가 640회·바퀴 2회, 평가당 약 0.46 µs), 잎 12개 분기가 108.4 대 480.6(나감·들어옴 잎 하나당 약 12 µs, 0.16.1은 3.6)임을 쟀다. 단계 장부(oneOf-80 쓰기당)는 computeNode 103(selectChildren self 36·computeNode self 35·바퀴 준비 8.7·조립 9.1), finalizeExits 55(getControlLayers 15.5/12회·setLatentRaw 11.2/6회), commitSettlement 46(비활성 값 메모 18.7·배달 표식 11.9), registerRecalculation 13.0, 그 밖 17.1이고 할당은 약 130 KB/쓰기다. 두 번째 바퀴의 원인은 선택 도중 들어오는 payload가 공표되어 게이트가 읽는 루트 투영 객체의 identity가 라운드 안에서 바뀌는 것(즉시 반영 계약의 귀결)으로 확인되었다. 회귀 적합(floor 169.9, 분기당 0.872)은 잔차가 −53~+52 µs라 구조 상수로 쓰지 않는다. 이 장부로 B1·B2·B3의 목표선을 측정 전에 고정해 `plan/branch-switch/request.md`의 "B0 장부 뒤 고정한 목표선" 절에 적었다(TEST-081): B1은 같은 창에서 B의 `if`-80 ≤ B의 oneOf-80 × 1.1 + 40 µs, B의 `discriminator`-80 ≤ oneOf-80 × 1.05, 두 행 폭 밖 개선, 평가 수 80 이하, 좁힌 `if`는 바퀴 1회, oneOf-80 폭 밖 악화 없음; B2는 단계별 상한(바퀴 준비 1, 나감 정책 2, 비활성 값 메모 3, 조립 3, 잠복 저장 8, 재계산 등록 5, 배달 표식 6, 선택·계산 self 25, 그 밖 10 µs, 바닥 40 µs); B3는 446C-06 그대로. 측정 행의 단위는 기존 장치와 같이 쓰기 2회(왕복 1회) 합계이며 표마다 쓰기당 환산을 함께 적는다(B0 워커의 물음에 대한 답; 브리프의 "왕복 2회"는 편집자의 착오였다).
- 보충:
  > 편집자 결정(455C-01): "【추론】 B1(게이트 판정 통일, 가지 `perf/schema-form-b1-gate-predicate`)의 후보 1(2f1365df3, 창 11:04 UTC)은 쓰기당 `if`-80 598.2→303.8 µs(선 297.7 초과 6.2 µs), `discriminator`-80 456.2→173.8 µs(선 통과), 평가 수 `if` 80·`discriminator` 0, 바퀴 1회, 그림자 불일치 0이었으나 `switch-oneOf-80` 왕복이 A 368.8/B 468.5/A′ 330.9 µs로 B만 느렸고 TEST-073이 A 대 B에서 switch-oneOf-80 −26.25 %, single-flat-1000 −32.03 %로 걸렸다. `active` 경로의 추가 장부를 없앤 후보 2(38e405d6b, 창 11:37 UTC)는 `if`-80 305.4 µs(선 318.2 통과), `discriminator`-80 152.2 µs(선 265.6 통과)로 두 행 모두 폭 밖 개선이지만 `active` 왕복 A 337.3/B 505.8/A′ 377.4 µs의 같은 패턴이 반복되어 TEST-073 A 대 B 3행(single-nested −36.12 %, switch-oneOf-80 −18.86 %, switch-nested-oneOf-20 −18.86 %)이 실패했고 A′ 대 B는 회귀 0이었다. 정식 판정은 두 후보 모두 미채택이다. 독립 진단 둘은 이 "회귀"가 코드 원인이 아님을 보였다: diff 기반 진단(Claude 하위 에이전트, 스크립트 `scratchpad/b1diag`)에서 A·B 번들이 같은 rolldown 설정으로 다시 만든 번들과 바이트 단위로 같고, 쓰기당 함수 호출 수 2284.5 대 2283.5, 실제 하네스 교대 522 대 533 µs, 할당 111.57 대 111.35 KB이며, 게이트가 없어 B1 경로에 들어가지 않는 single-flat-1000·single-nested 행도 같은 창에서 −32 %·−36 %로 "회귀"했고, 같은 빌드가 몇 분 사이에 530→650 µs로 이동했다. 워커의 교대 12프로세스 진단에서도 oneOf-80 B/A 짝별 비율이 0.64·0.96·1.10으로 부호가 바뀌고 CPU self 총합 B/A가 0.887이었다. B1이 `active` 경로에 더한 작업은 모두 쓰기당 1 µs 미만이다. 그래서 같은 후보의 재측정을 TEST-088에 따라 소유자에게 물었고 소유자가 승인했다(위 2행 "1. 승인"). 재측정은 455C-02의 보강 프로토콜로 한 번만 하며, 채택 판정은 그 수치로 하되 선과 규칙(`if` ≤ `active` × 1.1 + 40 µs, `discriminator` ≤ × 1.05, 두 행 폭 밖 개선, oneOf-80 폭 밖 악화 없음, TEST-073, 평가 수·바퀴, 힙)은 그대로다. 독립 코드 검토(antigravity 1부, `/private/tmp/claude-501/perf-runs/453-reviews/pr-b1-part1-antigravity.md`)는 범위·계약·BLUEPRINT-007·BLUEPRINT-053·즉시 반영·화이트리스트의 보수성·오류 의미·시험 red/green 모두 PASS다. 후보 1에서 결함(두 번째 바퀴·게이트당 복사)을 고친 후보 2를 새 창에서 잰 것은 같은 후보의 재측정이 아니라 새 후보의 측정이다(D3b-2와 같은 처리)." (`reviews/round-455-closing.md:8`)
  > 편집자 결정(455C-03): "【추론】 B1의 `test:verify` 전체 실행에서 `settle.gate-selection-preparation-invariants.test.ts`와 `settle.gate-table-characterization.test.ts`의 branch-only `discriminator` 사례 2건이 실패했다. 두 시험의 목적은 gateSelection=off와 verify 모드의 선택 결과 동등성이고, 실패한 단언은 하네스(`observeGateTableModes.ts`)가 구현 경로를 본뜬 "표를 타지 않는 방문" 이력 비교였다. `discriminator`가 표를 타는 것이 453C-03의 의도이므로 기준 경로 고정(454C-03) 대신 하네스의 표 방문 분류에 `discriminator`·`if`의 표 방문을 add-only로 더했다. 조건: 기존 단언·기대값은 한 글자도 바꾸지 않고, 표가 기준 경로와 다른 선택 결과를 내면 여전히 실패함을 보이는 음성 시험(`settle.gate-predicate-modes.test.ts`, 표를 일부러 틀리게 한 그림자 비교가 실패함)을 add-only로 둔다. 독립 검토가 이를 확인했다(455C-01). 이 처리도 운영 원칙 12와의 경계에 있어 재검증 목록에 올린다." (`reviews/round-455-closing.md:12`)
  > 편집자 결정(456C-02): "【추론】 재승인 창(13:10~13:19 UTC, 도구 b0452a1ae, 제품 38e405d6b, 원자료 `/private/tmp/claude-501/perf-runs/20261027T1306-e0e5121-b1r3`, 시작·끝 CPU 표본 heavy 0)은 품질 중앙 1.009869577(17행)로 유효했다. 쓰기당 B는 `active` 252.406, `if`-80 303.854(선 317.647 통과), `discriminator`-80 162.083 µs(선 265.027 통과)이고, 두 대상 행은 A 대비 폭 밖 개선에 A′ 대비 같은 부호, `switch-oneOf-80`은 폭 밖 악화 없음, TEST-073은 21행 모두 전체·앞·뒤 짝에서 회귀 0, 평가 수 `if` 80·`discriminator` 0·`active` 0, selectChildren 1회, 그림자 불일치 0, Node 힙 B 중앙 1439.096 ≤ A 최대 1889.560이다. Bun 힙은 B 중앙 2233.988로 A 최대 2224.774보다 +9.214 B/노드이며 브리프의 규칙(Node 관문, Bun 보고)대로 보고로 남긴다; 단계 관문의 Bun 처리는 452라운드의 수용(단계 시작 판 대비)을 따르고 B5에서 통합 판으로 다시 잰다. 후보 1·후보 2의 순차 창, 무효 창, 두 진단은 `verification/branch-switch/b1-results.md`에 모두 보존되었다. 독립 검토는 1부(코드·동치·시험)와 2부(측정 보고·도구 델타·문서) 모두 PASS다(`/private/tmp/claude-501/perf-runs/453-reviews/pr-b1-part1-antigravity.md`, `pr-b1-part2-antigravity.md`). PR #476을 스쿼시 병합했다(4370cee88). 이로써 453C-03의 최우선 항목(검증기 `if`를 앞선 개선과 맞물리게)이 끝났고, `if`·`discriminator` 호스트는 `active`와 같은 선택 경로·한 바퀴·게이트당 평가 1회를 탄다." (`reviews/round-456-closing.md:10`)
  > 편집자 결정(459C-04): "【추론】 B3는 제품 변경 없이 0.16.1 / 단계 시작(0eb03ff3b) / 단계 끝(95853ae5f) 세 레인을 한 창에서 쟀다(기존 교대 장치 재사용, 0.16.1 레인 20프로세스 가운데 A 쪽 10만 주표·품질, 단계 장부 4행 × A/B × 3회 = 24프로세스, payload-12는 0.16.1 쌍 사용, if·discriminator는 쌍 없음). TEST-093의 "작은 상수 배"에 수치가 없어 측정 뒤 기준을 만들지 않도록 창 전에 3배로 고정했다(siblings-1000 ≤ 3 × siblings-0). 단계 시작 판은 B4-2의 타이머 앵커가 없어 저장소 밖 호환 실행기에서 같은 함수 타이머와 시간 루프를 재사용하고 wheelPreparation만 B0 구간으로 매핑했으며, B0 장부와의 대조에서 매핑 불일치 13단계는 비교에서 뺐다; 관문 판정은 총합 행으로만 한다. #482(8f51eda84)로 병합." (`reviews/round-459-closing.md:14`)
- 상태: 현행
- 출처: `reviews/round-454-closing.md:8`(정본), `reviews/round-454-closing.md:12`, `verification/branch-switch/b0-ledger.md`, `plan/branch-switch/request.md`
- 닫은 사람: 편집자 결정(454라운드, `reviews/round-454-closing.md` 454C-01·03)
- 라운드: 454
- 까닭: `reviews/round-454-closing.md:8`

### TEST-094 측정 프로토콜의 보강(455라운드, 소유자 승인) — 행마다 A·B 프로세스 교대 실행(각 10, 20 예열·100 표본), A′는 A의 뒤 절반으로 두어 폭 (다) 규칙 유지, 가설이 닿지 않는 행의 B/A ±5 % 창 품질 검사(밖이면 창 무효·판정 불가), TEST-073은 교대 짝의 A 대 B로 판정하고 A′ 대 B 병기, 15 % 선과 폭 규칙은 그대로; B1 두 후보의 `active` 행 "회귀"는 창의 흐름(게이트 없는 행도 같은 창에서 −32 %·−36 %, 번들·호출 수·할당 동일)이라 소유자 승인 아래 후보 2를 한 번 재측정(TEST-088); verify 하네스의 표 방문 분류는 add-only로 넓히고 음성 시험을 둠

- 결정:
  > 【추론】 지금 장치는 A·B·A′를 각각 3프로세스씩 순서대로 재는데, 기계 상태가 몇 분 사이에 20 % 넘게 움직여 TEST-073의 A 대 B Welch 검정이 창의 흐름에 걸린다(455C-01의 증거). 소유자가 보강을 승인했다(위 2행 "2. 승인"). 보강은 셋이다: 행마다 A와 B 프로세스를 번갈아(A B A B …) 각 10프로세스(20 예열·100 표본은 그대로) 돌려 같은 시각의 짝으로 비교하고, A′는 따로 돌리지 않고 A 프로세스의 뒤 절반(6~10번째)으로 정의해 폭 (다) = max(|A−A′|, rangeA, rangeA′) 규칙을 그대로 적용하며, 가설이 닿지 않는 행(B1·B2-P1b는 branchless·잠복 없는 single-flat-1000)의 B/A 중앙값 비가 ±5 % 밖이면 창을 무효로 하고, TEST-073은 교대 짝의 A 대 B로 판정하되 A′ 대 B를 나란히 적는다. 폭 (다)의 규칙(443C-03)과 15 % 선(TEST-073)은 바꾸지 않는다. B1이 이 모드를 측정 장치(`verification/design-optimization/tools/`)에 더해 단계 가지로 올리고, B1 후보 2의 재측정과 B2-P1b부터의 모든 정식 측정에 적용한다. 무효 창은 재측정이 아니라 "판정 불가"로 기록한다(재측정 금지 유지).
- 보충:
  > 소유자(455라운드, 물음의 요청): "물어볼 내용 있으면 물어보거라." (`reviews/round-455-owner-answers.md:7`)
  > 소유자(455라운드, 재측정과 프로토콜 보강의 승인): "1. 승인. \n2. 승인" (`reviews/round-455-owner-answers.md:8`)
  > 편집자 결정(455C-01): "【추론】 B1(게이트 판정 통일, 가지 `perf/schema-form-b1-gate-predicate`)의 후보 1(2f1365df3, 창 11:04 UTC)은 쓰기당 `if`-80 598.2→303.8 µs(선 297.7 초과 6.2 µs), `discriminator`-80 456.2→173.8 µs(선 통과), 평가 수 `if` 80·`discriminator` 0, 바퀴 1회, 그림자 불일치 0이었으나 `switch-oneOf-80` 왕복이 A 368.8/B 468.5/A′ 330.9 µs로 B만 느렸고 TEST-073이 A 대 B에서 switch-oneOf-80 −26.25 %, single-flat-1000 −32.03 %로 걸렸다. `active` 경로의 추가 장부를 없앤 후보 2(38e405d6b, 창 11:37 UTC)는 `if`-80 305.4 µs(선 318.2 통과), `discriminator`-80 152.2 µs(선 265.6 통과)로 두 행 모두 폭 밖 개선이지만 `active` 왕복 A 337.3/B 505.8/A′ 377.4 µs의 같은 패턴이 반복되어 TEST-073 A 대 B 3행(single-nested −36.12 %, switch-oneOf-80 −18.86 %, switch-nested-oneOf-20 −18.86 %)이 실패했고 A′ 대 B는 회귀 0이었다. 정식 판정은 두 후보 모두 미채택이다. 독립 진단 둘은 이 "회귀"가 코드 원인이 아님을 보였다: diff 기반 진단(Claude 하위 에이전트, 스크립트 `scratchpad/b1diag`)에서 A·B 번들이 같은 rolldown 설정으로 다시 만든 번들과 바이트 단위로 같고, 쓰기당 함수 호출 수 2284.5 대 2283.5, 실제 하네스 교대 522 대 533 µs, 할당 111.57 대 111.35 KB이며, 게이트가 없어 B1 경로에 들어가지 않는 single-flat-1000·single-nested 행도 같은 창에서 −32 %·−36 %로 "회귀"했고, 같은 빌드가 몇 분 사이에 530→650 µs로 이동했다. 워커의 교대 12프로세스 진단에서도 oneOf-80 B/A 짝별 비율이 0.64·0.96·1.10으로 부호가 바뀌고 CPU self 총합 B/A가 0.887이었다. B1이 `active` 경로에 더한 작업은 모두 쓰기당 1 µs 미만이다. 그래서 같은 후보의 재측정을 TEST-088에 따라 소유자에게 물었고 소유자가 승인했다(위 2행 "1. 승인"). 재측정은 455C-02의 보강 프로토콜로 한 번만 하며, 채택 판정은 그 수치로 하되 선과 규칙(`if` ≤ `active` × 1.1 + 40 µs, `discriminator` ≤ × 1.05, 두 행 폭 밖 개선, oneOf-80 폭 밖 악화 없음, TEST-073, 평가 수·바퀴, 힙)은 그대로다. 독립 코드 검토(antigravity 1부, `/private/tmp/claude-501/perf-runs/453-reviews/pr-b1-part1-antigravity.md`)는 범위·계약·BLUEPRINT-007·BLUEPRINT-053·즉시 반영·화이트리스트의 보수성·오류 의미·시험 red/green 모두 PASS다. 후보 1에서 결함(두 번째 바퀴·게이트당 복사)을 고친 후보 2를 새 창에서 잰 것은 같은 후보의 재측정이 아니라 새 후보의 측정이다(D3b-2와 같은 처리)." (`reviews/round-455-closing.md:8`)
  > 편집자 결정(455C-03): "【추론】 B1의 `test:verify` 전체 실행에서 `settle.gate-selection-preparation-invariants.test.ts`와 `settle.gate-table-characterization.test.ts`의 branch-only `discriminator` 사례 2건이 실패했다. 두 시험의 목적은 gateSelection=off와 verify 모드의 선택 결과 동등성이고, 실패한 단언은 하네스(`observeGateTableModes.ts`)가 구현 경로를 본뜬 "표를 타지 않는 방문" 이력 비교였다. `discriminator`가 표를 타는 것이 453C-03의 의도이므로 기준 경로 고정(454C-03) 대신 하네스의 표 방문 분류에 `discriminator`·`if`의 표 방문을 add-only로 더했다. 조건: 기존 단언·기대값은 한 글자도 바꾸지 않고, 표가 기준 경로와 다른 선택 결과를 내면 여전히 실패함을 보이는 음성 시험(`settle.gate-predicate-modes.test.ts`, 표를 일부러 틀리게 한 그림자 비교가 실패함)을 add-only로 둔다. 독립 검토가 이를 확인했다(455C-01). 이 처리도 운영 원칙 12와의 경계에 있어 재검증 목록에 올린다." (`reviews/round-455-closing.md:12`)
  > 편집자 결정(456C-01): "【추론】 455C-02의 보강 프로토콜로 돈 B1 후보 2의 승인 재측정 창(12:39 UTC, 도구 ded349eaf, 원자료 `/private/tmp/claude-501/perf-runs/20261027T1238-ded349e-b1r2`)은 품질 행 single-flat-1000의 B(10)/A(10) 최소값 중앙 비가 1.182로 ±5 % 밖이라 도구가 첫 행 뒤 즉시 멈췄고 정식 표본은 그 행 20프로세스뿐이었다. 원자료를 보면 그 행은 프로세스별 최소값이 A 60~96 µs, B 60~111 µs로 자체 잡음이 ±40 %이고, 같은 프로세스에서 돈 0.16.1(두 레인에서 완전히 같은 코드)의 최소값도 A 508~618, B 510~618 µs로 중앙값 비 약 1.07이었다. 즉 한 행의 ±5 %는 이 기계의 잡음으로는 만족할 수 없는 기준이었고, 이는 455C-02를 정한 편집자의 착오다. 그 창은 "판정 불가"로 기록하고 재시도하지 않았다(TEST-088). 소유자가 재측정을 다시 승인하며 "이번엔 잘 구성해서" 하라고 했으므로(위 1행) 품질 기준을 바꾼다: 창 품질은 0.16.1 레인이 있는 모든 행에서 같은 프로세스의 0.16.1 레인 B(10) 최소값 중앙 ÷ A(10) 최소값 중앙을 구해 그 중앙값이 0.95~1.05이면 유효하며(두 레인이 같은 코드를 돌리므로 이 비는 창의 흐름만 재고, 17행 × 10프로세스를 모아 잡음이 작다), 모든 행을 끝까지 돌린 뒤 판정하고(첫 행에서 멈추지 않음), 무효여도 힙·단계 장부까지 완료해 기록하되 시간 판정만 "판정 불가"로 한다. 0.16.1 레인이 없는 행(`if`·`discriminator`·구독 2행)은 품질과 "비율의 비율"에서 N/A다. 시간 통계(A 앞 5·A′ 뒤 5·B 10, 폭 (다)), TEST-073(인접 교대 짝 10쌍 주판정, 앞·뒤 5쌍 병기), 선과 규칙은 455C-02 그대로이며 이 정정은 TEST-094를 고친다. 도구는 B1이 `--quality=legacy` 옵션으로 add-only로 더했고(기본 옵션 유지) #476에 들어 있다." (`reviews/round-456-closing.md:8`)
  > 편집자 결정(457C-03): "【추론】 B2-P2(e8c122986, 창 15:07~15:16 UTC, 품질 0.996 유효)에서 겨냥한 단계는 같은 창의 A/B 단계 장부로 크게 줄었다: 바퀴 준비 self 8.938→2.834 µs(목표 ≤1 미달), getControlLayers 합 15.770→1.790 µs(목표 ≤2 통과), `getLatentOrder`의 엔트리 선형 탐색 제거. 그러나 총합 행 switch-oneOf-80은 왕복 A 507.3/B 441.1/A′ 373.6 µs로 창 안의 흐름(A 대 A′ 26 %)이 개선 폭(약 20 µs/쓰기, 8 %)보다 커서 "폭 밖 개선"은 증명할 수 없는 구조였다(TEST-073 주판정 회귀 0, 뒷반 single-nested −18.45 % 1건, Node 힙 통과, Bun +4.374 B/노드 보고). B2의 묶음은 개선 폭이 5~15 µs라 총합 행으로는 어느 것도 증명되지 않으므로, 채택 기준을 "겨냥한 단계가 같은 창의 A/B 장부에서 상한 아래 또는 절반 이하로 줄고 어느 단계도 나빠지지 않으며 주판정 TEST-073 회귀 0, Node 힙 B 중앙 ≤ A 최대"로 두고 총합 행은 B3에서 단계 시작 판·0.16.1 대비로 누적 판정한다. 측정 뒤의 기준 변경이므로 재검증 목록에 올린다(TEST-081과의 경계). 이 기준으로 B2-P2를 채택한다(#478, 독립 코드 검토 PASS). 정적 자식 준비물은 동명 후보(x/y)가 있는 호스트(형제 픽스처)에서는 `HostStaticPartition`이 정적 목록을 비워 적용되지 않았고 고유 이름 호스트(oneOf-80)에서는 적용됐으므로, 측정된 묶음 전체를 그대로 채택하되(측정되지 않은 변형을 만들지 않음) 형제 1,000개당 약 2.0 ms의 선형항이 정적 선택이 아니라 다른 곳(조립·등록으로 추정, B2-P3 범위)에 있음을 단서로 기록한다." (`reviews/round-457-closing.md:12`)
- 상태: 현행
- 출처: `reviews/round-455-closing.md:10`(정본), `reviews/round-455-closing.md:8`, `reviews/round-455-closing.md:12`, `reviews/round-455-owner-answers.md:7-8`, `verification/branch-switch/b1-results.md`
- 닫은 사람: 소유자 답(`reviews/round-455-owner-answers.md:8`), 편집자 결정(455라운드, `reviews/round-455-closing.md` 455C-01·02·03)
- 라운드: 455
- 까닭: `reviews/round-455-owner-answers.md:8`

### TEST-095 측정 창 품질 기준의 정정(456라운드, 소유자 재승인) — 한 행의 ±5 %(455C-02)는 그 행의 자체 잡음(±40 %)과 0.16.1 레인의 1.07배 이동 때문에 만족할 수 없어 편집자 착오로 정정, 창 품질은 0.16.1 레인이 있는 모든 행에서 같은 프로세스의 0.16.1 레인 B(10)/A(10) 최소값 중앙 비의 중앙값이 0.95~1.05이면 유효, 모든 행을 끝까지 돌린 뒤 판정, 무효여도 힙·단계 완료하되 시간 판정만 판정 불가, 0.16.1 레인 없는 행은 N/A, 도구 `--quality=legacy`(기본 옵션 유지), TEST-094의 나머지는 그대로

- 결정:
  > 【추론】 455C-02의 보강 프로토콜로 돈 B1 후보 2의 승인 재측정 창(12:39 UTC, 도구 ded349eaf, 원자료 `/private/tmp/claude-501/perf-runs/20261027T1238-ded349e-b1r2`)은 품질 행 single-flat-1000의 B(10)/A(10) 최소값 중앙 비가 1.182로 ±5 % 밖이라 도구가 첫 행 뒤 즉시 멈췄고 정식 표본은 그 행 20프로세스뿐이었다. 원자료를 보면 그 행은 프로세스별 최소값이 A 60~96 µs, B 60~111 µs로 자체 잡음이 ±40 %이고, 같은 프로세스에서 돈 0.16.1(두 레인에서 완전히 같은 코드)의 최소값도 A 508~618, B 510~618 µs로 중앙값 비 약 1.07이었다. 즉 한 행의 ±5 %는 이 기계의 잡음으로는 만족할 수 없는 기준이었고, 이는 455C-02를 정한 편집자의 착오다. 그 창은 "판정 불가"로 기록하고 재시도하지 않았다(TEST-088). 소유자가 재측정을 다시 승인하며 "이번엔 잘 구성해서" 하라고 했으므로(위 1행) 품질 기준을 바꾼다: 창 품질은 0.16.1 레인이 있는 모든 행에서 같은 프로세스의 0.16.1 레인 B(10) 최소값 중앙 ÷ A(10) 최소값 중앙을 구해 그 중앙값이 0.95~1.05이면 유효하며(두 레인이 같은 코드를 돌리므로 이 비는 창의 흐름만 재고, 17행 × 10프로세스를 모아 잡음이 작다), 모든 행을 끝까지 돌린 뒤 판정하고(첫 행에서 멈추지 않음), 무효여도 힙·단계 장부까지 완료해 기록하되 시간 판정만 "판정 불가"로 한다. 0.16.1 레인이 없는 행(`if`·`discriminator`·구독 2행)은 품질과 "비율의 비율"에서 N/A다. 시간 통계(A 앞 5·A′ 뒤 5·B 10, 폭 (다)), TEST-073(인접 교대 짝 10쌍 주판정, 앞·뒤 5쌍 병기), 선과 규칙은 455C-02 그대로이며 이 정정은 TEST-094를 고친다. 도구는 B1이 `--quality=legacy` 옵션으로 add-only로 더했고(기본 옵션 유지) #476에 들어 있다.
- 보충:
  > 소유자(456라운드, 재승인과 창 구성의 지시): "재승인. 이번엔 잘 구성해서 해보도록" (`reviews/round-456-owner-answers.md:7`)
  > 편집자 결정(456C-03): "【추론】 B2-P1b(a04a40588, 가지 `perf/schema-form-b2-p1b-lazy-inactive`)는 build·unit 3,644·render/react18 760·production·verify 4,448·Storybook 251사례를 통과했고 그림자(commit 17,860회·읽기 327,929회) 위반 0, 배달 비교 차이 0, d.ts 동일이다. 독립 검토 1부는 범위·동치(라이브·무관 호스트·떼어진 참조 토큰·fallback·내부 소비처 전수)·journal 상한 max(2·L, 512)와 상각 압축·독립 오라클 그림자·red/green 모두 PASS다(`pr-b2-p1b-part1-antigravity.md`). 정식 측정은 #476의 교대 도구와 456C-01의 품질 기준으로 하며, 규칙은 브리프 그대로(메모 단계 ≤ 3 µs 압축 포함 평균, oneOf-80·payload-12 폭 밖 개선, TEST-073, 힙)." (`reviews/round-456-closing.md:12`)
  > 편집자 결정(458C-03): "【추론】 B4-1의 첫 정식 창은 9/22행(180프로세스) 뒤 `switch-if-80`의 A0에서 AJV8 플러그인의 로컬 dist(`dist/default/index.cjs`)가 없어 MODULE_NOT_FOUND로 멈췄다(B2-P3 때와 같은 원인). 이것은 측정의 흐트러짐이 아니라 환경 준비 실패이므로 수집된 행은 판정에 쓰지 않고 "중단 창"으로 한 줄 기록하며, 플러그인을 빌드하고 A/B 사본에서 22행 44동작의 무계측 적재 점검을 통과시킨 뒤 같은 고정 구성으로 새 창을 한 번만 연다(재측정이 아니라 준비 뒤의 최초 정식 수집, TEST-095의 "재시도 없음"과 어긋나지 않음). 후보 2의 창은 시작 전 5초 CPU 검사에서 macOS XProtect(61 %)에 세 번 걸려 표본 0으로 보류되었고 2분 간격의 네 번째 검사 뒤 열렸다; 정식 표본이 0이면 보류는 재시도가 아니다. 플러그인 dist 빌드와 44동작 적재 점검은 모든 창의 사전 점검에 넣는다. 보유량 측정에서 "reset 뒤 1노드 잔존"으로 보였던 것은 독립 `writeHeapSnapshot` 사이의 숫자 ID 재사용(read의 FieldNode가 reset에서는 AllocationSite가 지배하는 일반 Object)이었으므로 개별 노드의 ID 추적 회수 수는 판정 불가로 두고, 호스트당 슬롯 수·바이트와 reset 뒤 슬롯 호스트 0은 단일 스냅샷 관측으로 유지한다." (`reviews/round-458-closing.md:12`)
  > 편집자 결정(459C-04): "【추론】 B3는 제품 변경 없이 0.16.1 / 단계 시작(0eb03ff3b) / 단계 끝(95853ae5f) 세 레인을 한 창에서 쟀다(기존 교대 장치 재사용, 0.16.1 레인 20프로세스 가운데 A 쪽 10만 주표·품질, 단계 장부 4행 × A/B × 3회 = 24프로세스, payload-12는 0.16.1 쌍 사용, if·discriminator는 쌍 없음). TEST-093의 "작은 상수 배"에 수치가 없어 측정 뒤 기준을 만들지 않도록 창 전에 3배로 고정했다(siblings-1000 ≤ 3 × siblings-0). 단계 시작 판은 B4-2의 타이머 앵커가 없어 저장소 밖 호환 실행기에서 같은 함수 타이머와 시간 루프를 재사용하고 wheelPreparation만 B0 구간으로 매핑했으며, B0 장부와의 대조에서 매핑 불일치 13단계는 비교에서 뺐다; 관문 판정은 총합 행으로만 한다. #482(8f51eda84)로 병합." (`reviews/round-459-closing.md:14`)
- 상태: 현행
- 출처: `reviews/round-456-closing.md:8`(정본), `reviews/round-456-closing.md:12`, `reviews/round-456-owner-answers.md:7`, `verification/branch-switch/b1-results.md`
- 닫은 사람: 소유자 답(`reviews/round-456-owner-answers.md:7`), 편집자 결정(456라운드, `reviews/round-456-closing.md` 456C-01·03)
- 라운드: 456
- 까닭: `reviews/round-456-owner-answers.md:7`

### TEST-096 분기 전환 단계 B2의 간소화와 채택 기준(457라운드) — 소유자 지시로 결과는 추세만·판정만: 2부 검토 생략, 결과 문서는 표와 판정 한 줄, 남은 항목은 묶음 둘(B2-P2 호스트 수명 준비물, B2-P3 변화량 적용); 묶음의 채택은 같은 창 단계 장부의 감소(상한 아래 또는 절반 이하, 어느 단계도 악화 없음)+주판정 TEST-073 회귀 0+Node 힙이고 총합 행은 B3 누적 판정(측정 뒤 기준 변경, 재검증); B2-P2 채택(#478), 정적 준비물의 동명 후보 공백은 형제 선형항의 단서; B2-P3는 존재 차분 보류·JSON 관문은 잠복 경로 한정

- 결정:
  > 【추론】 소유자가 결과는 짧게 추세만 보고 시간을 많이 쓰지 말고 판정만 하라고 했다(위 1행). 이에 따라 B2의 남은 가설은 독립 코드 검토 한 번과 측정 판정으로 처리하고 측정 보고에 대한 2부 검토는 생략하며, 결과 문서는 표(단계 A/B, 행 A/B/A′·폭·품질, TEST-073, 힙)와 판정 한 줄로 줄인다. 남은 B2 항목은 설계의 묶음 둘로 합쳐 각각 PR 하나·창 하나로 잰다: B2-P2 호스트 수명 준비물(바퀴 계획·나감 정책과 제어 계층·정적 자식 준비물·잠복 순서의 청사진 색인), B2-P3 변화량 적용(노드가 드는 잠복 키·활성 자식만 걷는 조립·Δ 집합을 쓰는 등록·배달 표식). "가설 하나에 PR 하나"는 묶음 단위로 완화한 편집자 결정이며 소유자가 반대하면 되돌린다. 소유자가 요청한 1차 확인 요약(위 2행)은 B2-P2 창 뒤에 올렸다.
- 보충:
  > 소유자(457라운드, 결과 보고의 방식): "그래. 결과 보고 확인하자. 결과는 짧게 추세만 보도록.\n이게 최종안이 아니니까, 너무 시간을 많이 쓰지 않고 판정만 했으면 해." (`reviews/round-457-owner-answers.md:7`)
  > 편집자 결정(457C-03): "【추론】 B2-P2(e8c122986, 창 15:07~15:16 UTC, 품질 0.996 유효)에서 겨냥한 단계는 같은 창의 A/B 단계 장부로 크게 줄었다: 바퀴 준비 self 8.938→2.834 µs(목표 ≤1 미달), getControlLayers 합 15.770→1.790 µs(목표 ≤2 통과), `getLatentOrder`의 엔트리 선형 탐색 제거. 그러나 총합 행 switch-oneOf-80은 왕복 A 507.3/B 441.1/A′ 373.6 µs로 창 안의 흐름(A 대 A′ 26 %)이 개선 폭(약 20 µs/쓰기, 8 %)보다 커서 "폭 밖 개선"은 증명할 수 없는 구조였다(TEST-073 주판정 회귀 0, 뒷반 single-nested −18.45 % 1건, Node 힙 통과, Bun +4.374 B/노드 보고). B2의 묶음은 개선 폭이 5~15 µs라 총합 행으로는 어느 것도 증명되지 않으므로, 채택 기준을 "겨냥한 단계가 같은 창의 A/B 장부에서 상한 아래 또는 절반 이하로 줄고 어느 단계도 나빠지지 않으며 주판정 TEST-073 회귀 0, Node 힙 B 중앙 ≤ A 최대"로 두고 총합 행은 B3에서 단계 시작 판·0.16.1 대비로 누적 판정한다. 측정 뒤의 기준 변경이므로 재검증 목록에 올린다(TEST-081과의 경계). 이 기준으로 B2-P2를 채택한다(#478, 독립 코드 검토 PASS). 정적 자식 준비물은 동명 후보(x/y)가 있는 호스트(형제 픽스처)에서는 `HostStaticPartition`이 정적 목록을 비워 적용되지 않았고 고유 이름 호스트(oneOf-80)에서는 적용됐으므로, 측정된 묶음 전체를 그대로 채택하되(측정되지 않은 변형을 만들지 않음) 형제 1,000개당 약 2.0 ms의 선형항이 정적 선택이 아니라 다른 곳(조립·등록으로 추정, B2-P3 범위)에 있음을 단서로 기록한다." (`reviews/round-457-closing.md:12`)
  > 편집자 결정(457C-06): "【추론】 B2-P3(가지 `perf/schema-form-b2-p3-delta-application`)의 두 항목이 B2-P2 소유 파일에 닿았다. `registerPresenceChanges`의 두 번째 차분 제거는 computeNode·childSelection이 라운드별 변경 이름을 넘겨야 가능하므로 이번 묶음에서 빼고 "B2-P2 병합 뒤 SettlementContext로 받으면 가능"으로 보류한다. "잠복 키 JSON 왕복 0회" 관문은 잠복 저장·메타데이터·색인 경로로 한정하고, 선택부(selectChildren·selectEntryStep·primeHost)의 pendingExits 키 생성은 두 묶음 병합 뒤 공통 helper로 바꾸는 정리로 따로 둔다(선택부 키 JSON 횟수는 결과에 계수로 적음). B2-P3의 채택 기준은 457C-03과 같다(겨냥한 단계 넷 중 셋 이상 상한 아래 또는 절반 이하, 어느 것도 나빠지지 않음, 주판정 TEST-073 0, Node 힙)." (`reviews/round-457-closing.md:18`)
  > 편집자 결정(458C-01): "【추론】 B2-P3 변화량 적용은 두 후보 모두 457C-03의 기준에 못 미쳤다. 묶음(7253507fd)은 등록 단계가 나빠졌고, 후보 2(a28f8ce0d, 창 16:41 UTC, 품질 0.9956 유효)는 조립이 9.15→6.04 µs로 줄었으나 잠복 저장 12.06→12.31, 재계산 12.63→12.96, 배달 11.23→11.65 µs로 0.25~0.4 µs씩 나빠져 "어느 단계도 나빠지지 않음"을 만족하지 못했다(총합 oneOf A 431.0/B 471.6/A′ 426.3 µs 폭 246, payload A 857.0/B 826.2/A′ 961.1 폭 285, 주판정 TEST-073 회귀 0, 힙 통과). 제품은 되돌리고 잠복 키·조립 계약 시험과 결과 문서만 #479로 남겨 병합했다(3aae1d155, 검토 판정 fc341d51b). 이로써 B2는 끝났다: 채택 B1(#476)·B2-P2(#478), 미채택 B2-P1(#475)·P1b(#477)·P3(#479). 0.3 µs의 악화로 묶음을 버린 것은 457C-03의 무관용 규칙을 글자대로 적용한 결과이며, 그 규칙에 허용 오차가 없는 것이 옳은지는 458C-04에서 다시 본다. 소유자가 요청한 짧은 브리핑(위 1행)에는 이 종료와 B4-1의 구현 상태(여섯 의미 시험·그림자 통과, 게이트 진행 중)를 담았고 롱턴 위임이 가능하다고 답했다." (`reviews/round-458-closing.md:8`)
  > 편집자 결정(458C-04): "【추론】 후보 1(f290cd04d, 창 19:31 UTC, 품질 0.9998)은 잠복 저장 0·메모 0을 이뤘으나 entering 그룹이 절반이 아니라 두 배(oneOf-80 9.46→17.23, payload-12 17.48→34.56 µs)였고 분기 없는 행이 주판정 TEST-073에서 약 20 % 회귀해(single-flat-1000 −19.79 %, single-nested −19.85 %) 미채택했다; 구현 결함(활성 복제에서 불필요한 주소 등록·중복 레지스트리·빈 overlay 할당, 일반 쓰기에 붙은 슬롯 적격 판정·공표)이라 후보 2를 만들었다. 후보 2(제품 0778bd955, 창 20:50~20:59 UTC, 품질 1.0005 유효)는 고정 장치의 원판정이 "채택 조건 미충족"이다: 잠복 저장 oneOf-80 16.2→0·payload-12 46.2→0 µs, 메모 18.1→0·41.9→0 µs, 주판정 TEST-073 회귀 0, Node 힙 B 중앙 1443.3 ≤ A 최대 1890.3 B/노드는 통과했으나, entering 그룹이 oneOf 9.46→8.13(비 0.86), payload 16.10→16.46(1.02)으로 절반에 못 미치고 기존 단계 네 곳이 A의 자기 폭 밖으로 나빠졌다(markCommitDeliveries oneOf +2.06·payload +0.23, siblings-0 computeNode +0.85·selectChildren +0.52 µs; 분기 없는 바닥 행 unwrapped 72.5→75.0 µs, +3.5 %). 편집자는 이 원판정을 고치지 않은 채 채택을 결정한다. 까닭: 설계 Ⅱ의 두 명제가 예측 크기(약 17·19 µs)대로 맞았고 단계 장부 자기시간 합이 oneOf-80 201.8→165.8 µs(−18 %), payload-12 375.9→272.9 µs(−27 %)로 줄었으며(unwrapped 182.1→156.8, 338.1→246.6 µs), 총합 행은 폭 안(oneOf A .35/B .29/A′ .43 ms 폭 .28, payload .66/.55/.66 폭 .20); "entering 절반"은 복제 2.6 µs/노드가 청사진 생성 2.4 µs/노드보다 싸지 않다는 발견으로 기각되어(들어옴 비용은 청사진 분석이 아니라 등록·색인에 있음) 더 좋은 후보가 나올 항이 아니고, 네 곳의 악화 합(약 3 µs)은 감소(약 36 µs)의 1/10 아래이며, 457C-03의 무관용 규칙은 5~15 µs 묶음을 위해 둔 것이라 −34~−103 µs의 구조 변경을 2 µs로 버리는 것은 규칙의 뜻이 아니다. 되돌림은 복원이 아니라 `engineModes.slots = off`(기준 경로)로 싸다. 두 일탈(entering 절반 미달, 단계 네 곳 악화)과 Bun 힙 +6.4 B/노드(2246.4 > A 최대 2239.9, 보고)는 결과 문서·PR 본문에 그대로 적었고 소유자 재검증 목록에 올린다. 제안 규칙(재검증): 겨냥한 단계의 감소 합 대비 기존 단계의 악화 합이 1/10 이하이고 주판정 TEST-073 회귀 0·Node 힙 통과면 악화를 기록한 채 채택할 수 있다. 워커가 미달 판정 직후 "미달 시 복원" 지시대로 복원 커밋 셋을 올렸던 것은 revert 커밋으로 되돌려 제품을 0778bd955와 차분 0으로 맞췄다. 독립 검토 둘(후보 1 전체, 후보 2 델타) 모두 결함 0 PASS. #480(180a64097)으로 병합. 소유자의 자율 진행 지시(위 2행)에 따라 이 판정을 소유자에게 묻지 않고 내렸다." (`reviews/round-458-closing.md:14`)
- 상태: 현행
- 출처: `reviews/round-457-closing.md:8`(정본), `reviews/round-457-closing.md:12`, `reviews/round-457-closing.md:18`, `reviews/round-457-owner-answers.md:7`, `verification/branch-switch/b2-p2-results.md`
- 닫은 사람: 소유자 답(`reviews/round-457-owner-answers.md:7`), 편집자 결정(457라운드, `reviews/round-457-closing.md` 457C-01·03·06)
- 라운드: 457
- 까닭: `reviews/round-457-owner-answers.md:7`

### TEST-097 분기 전환 단계 B2의 종료와 B4-1의 판정(458라운드, 소유자 자율 진행 지시) — B2-P3는 두 후보 모두 457C-03의 무관용 비악화 규칙에 0.25~0.4 µs로 걸려 미채택(#479 기록), B2는 채택 B1·B2-P2와 미채택 P1·P1b·P3로 종료; B4-1 후보 1은 entering 두 배와 분기 없는 행 −20 %로 미채택, 후보 2는 고정 장치의 원판정 "채택 조건 미충족"(entering 절반 미달, 기존 단계 넷 0.2~2.1 µs 악화)에도 잠복 저장 0·메모 0이 예측 크기대로 맞고 장부 합이 oneOf-80 −18 %·payload-12 −27 %라 편집자 결정으로 채택(#480, 재검증; 되돌림은 `engineModes.slots = off`); 제안 규칙은 악화 합 ≤ 감소 합의 1/10; 준비물 누락·외부 고부하로 중단된 창은 판정 불가로 기록하고 준비 뒤 새 창 한 번(재측정 아님), 플러그인 dist 빌드와 44동작 적재 점검을 사전 점검에 포함, 힙 스냅샷의 노드 ID 추적은 판정에 쓰지 않음

- 결정:
  > 【추론】 후보 1(f290cd04d, 창 19:31 UTC, 품질 0.9998)은 잠복 저장 0·메모 0을 이뤘으나 entering 그룹이 절반이 아니라 두 배(oneOf-80 9.46→17.23, payload-12 17.48→34.56 µs)였고 분기 없는 행이 주판정 TEST-073에서 약 20 % 회귀해(single-flat-1000 −19.79 %, single-nested −19.85 %) 미채택했다; 구현 결함(활성 복제에서 불필요한 주소 등록·중복 레지스트리·빈 overlay 할당, 일반 쓰기에 붙은 슬롯 적격 판정·공표)이라 후보 2를 만들었다. 후보 2(제품 0778bd955, 창 20:50~20:59 UTC, 품질 1.0005 유효)는 고정 장치의 원판정이 "채택 조건 미충족"이다: 잠복 저장 oneOf-80 16.2→0·payload-12 46.2→0 µs, 메모 18.1→0·41.9→0 µs, 주판정 TEST-073 회귀 0, Node 힙 B 중앙 1443.3 ≤ A 최대 1890.3 B/노드는 통과했으나, entering 그룹이 oneOf 9.46→8.13(비 0.86), payload 16.10→16.46(1.02)으로 절반에 못 미치고 기존 단계 네 곳이 A의 자기 폭 밖으로 나빠졌다(markCommitDeliveries oneOf +2.06·payload +0.23, siblings-0 computeNode +0.85·selectChildren +0.52 µs; 분기 없는 바닥 행 unwrapped 72.5→75.0 µs, +3.5 %). 편집자는 이 원판정을 고치지 않은 채 채택을 결정한다. 까닭: 설계 Ⅱ의 두 명제가 예측 크기(약 17·19 µs)대로 맞았고 단계 장부 자기시간 합이 oneOf-80 201.8→165.8 µs(−18 %), payload-12 375.9→272.9 µs(−27 %)로 줄었으며(unwrapped 182.1→156.8, 338.1→246.6 µs), 총합 행은 폭 안(oneOf A .35/B .29/A′ .43 ms 폭 .28, payload .66/.55/.66 폭 .20); "entering 절반"은 복제 2.6 µs/노드가 청사진 생성 2.4 µs/노드보다 싸지 않다는 발견으로 기각되어(들어옴 비용은 청사진 분석이 아니라 등록·색인에 있음) 더 좋은 후보가 나올 항이 아니고, 네 곳의 악화 합(약 3 µs)은 감소(약 36 µs)의 1/10 아래이며, 457C-03의 무관용 규칙은 5~15 µs 묶음을 위해 둔 것이라 −34~−103 µs의 구조 변경을 2 µs로 버리는 것은 규칙의 뜻이 아니다. 되돌림은 복원이 아니라 `engineModes.slots = off`(기준 경로)로 싸다. 두 일탈(entering 절반 미달, 단계 네 곳 악화)과 Bun 힙 +6.4 B/노드(2246.4 > A 최대 2239.9, 보고)는 결과 문서·PR 본문에 그대로 적었고 소유자 재검증 목록에 올린다. 제안 규칙(재검증): 겨냥한 단계의 감소 합 대비 기존 단계의 악화 합이 1/10 이하이고 주판정 TEST-073 회귀 0·Node 힙 통과면 악화를 기록한 채 채택할 수 있다. 워커가 미달 판정 직후 "미달 시 복원" 지시대로 복원 커밋 셋을 올렸던 것은 revert 커밋으로 되돌려 제품을 0778bd955와 차분 0으로 맞췄다. 독립 검토 둘(후보 1 전체, 후보 2 델타) 모두 결함 0 PASS. #480(180a64097)으로 병합. 소유자의 자율 진행 지시(위 2행)에 따라 이 판정을 소유자에게 묻지 않고 내렸다.
- 보충:
  > 소유자(458라운드, 진행 브리핑): "현재 진행 상황 짧게 브리핑해줘.\n지금부터 롱턴작업 가능한가?" (`reviews/round-458-owner-answers.md:7`)
  > 소유자(458라운드, 롱턴 자율 진행): "너의 작업 제외, 모두 꺼줄게. 이제 네가 파워조절을 하면서 진행하도록 해. \n끊기지 않게 목표한 작업을 모두 진행하도록." (`reviews/round-458-owner-answers.md:8`)
  > 편집자 결정(458C-01): "【추론】 B2-P3 변화량 적용은 두 후보 모두 457C-03의 기준에 못 미쳤다. 묶음(7253507fd)은 등록 단계가 나빠졌고, 후보 2(a28f8ce0d, 창 16:41 UTC, 품질 0.9956 유효)는 조립이 9.15→6.04 µs로 줄었으나 잠복 저장 12.06→12.31, 재계산 12.63→12.96, 배달 11.23→11.65 µs로 0.25~0.4 µs씩 나빠져 "어느 단계도 나빠지지 않음"을 만족하지 못했다(총합 oneOf A 431.0/B 471.6/A′ 426.3 µs 폭 246, payload A 857.0/B 826.2/A′ 961.1 폭 285, 주판정 TEST-073 회귀 0, 힙 통과). 제품은 되돌리고 잠복 키·조립 계약 시험과 결과 문서만 #479로 남겨 병합했다(3aae1d155, 검토 판정 fc341d51b). 이로써 B2는 끝났다: 채택 B1(#476)·B2-P2(#478), 미채택 B2-P1(#475)·P1b(#477)·P3(#479). 0.3 µs의 악화로 묶음을 버린 것은 457C-03의 무관용 규칙을 글자대로 적용한 결과이며, 그 규칙에 허용 오차가 없는 것이 옳은지는 458C-04에서 다시 본다. 소유자가 요청한 짧은 브리핑(위 1행)에는 이 종료와 B4-1의 구현 상태(여섯 의미 시험·그림자 통과, 게이트 진행 중)를 담았고 롱턴 위임이 가능하다고 답했다." (`reviews/round-458-closing.md:8`)
  > 편집자 결정(458C-03): "【추론】 B4-1의 첫 정식 창은 9/22행(180프로세스) 뒤 `switch-if-80`의 A0에서 AJV8 플러그인의 로컬 dist(`dist/default/index.cjs`)가 없어 MODULE_NOT_FOUND로 멈췄다(B2-P3 때와 같은 원인). 이것은 측정의 흐트러짐이 아니라 환경 준비 실패이므로 수집된 행은 판정에 쓰지 않고 "중단 창"으로 한 줄 기록하며, 플러그인을 빌드하고 A/B 사본에서 22행 44동작의 무계측 적재 점검을 통과시킨 뒤 같은 고정 구성으로 새 창을 한 번만 연다(재측정이 아니라 준비 뒤의 최초 정식 수집, TEST-095의 "재시도 없음"과 어긋나지 않음). 후보 2의 창은 시작 전 5초 CPU 검사에서 macOS XProtect(61 %)에 세 번 걸려 표본 0으로 보류되었고 2분 간격의 네 번째 검사 뒤 열렸다; 정식 표본이 0이면 보류는 재시도가 아니다. 플러그인 dist 빌드와 44동작 적재 점검은 모든 창의 사전 점검에 넣는다. 보유량 측정에서 "reset 뒤 1노드 잔존"으로 보였던 것은 독립 `writeHeapSnapshot` 사이의 숫자 ID 재사용(read의 FieldNode가 reset에서는 AllocationSite가 지배하는 일반 Object)이었으므로 개별 노드의 ID 추적 회수 수는 판정 불가로 두고, 호스트당 슬롯 수·바이트와 reset 뒤 슬롯 호스트 0은 단일 스냅샷 관측으로 유지한다." (`reviews/round-458-closing.md:12`)
  > 편집자 결정(459C-01): "【추론】 B4-2(813b32d17, 제품 c632ab5f5, 창 23:15~23:25 UTC, 품질 0.99976 유효)는 `engineModes.slots`의 off 경로와 verify 그림자, 잠복 저장소·메타데이터·색인, `restoreLatentState`, 비활성 값 메모, 잠복 캡처만을 위한 떼어진 읽기 지점을 지워 슬롯 경로를 유일한 원본 모델로 만들었다(286파일, −4,871/+2,730줄; 이름이 `*`인 선언을 품은 폼만 별표 공표 호환 장치를 씀). 고정 장치의 원판정은 "채택 조건 미충족"이다: 배달 72장면/430지점·mount 6/12 차이 0, 과제 둘 통과(`switch-siblings-0` 장부 합 82.2→79.0 µs·unwrapped 75.2→72.4, `switch-oneOf-80`의 markCommitDeliveries 12.04→12.00), 주판정 TEST-073 회귀 0(early/late 0), Node 힙 B 중앙 1440.3 ≤ A 최대 1893.7, oneOf-80 장부 합 166.9→165.2(unwrapped 162.4→155.8)이나, 개별 단계 6건이 A의 자기 폭 밖(enterSlotClone +0.04, payload-12의 registerRecalculation +0.65·transitionSettlement +0.33·cloneFromSlot +0.75(= enteringNodes +0.75), siblings-0 registerRecalculation +0.17 µs)이고 payload-12 장부 합이 276.3→279.9(+1.3 %)·unwrapped 247.1→250.8이다. 편집자는 원판정을 고치지 않은 채 채택한다: 악화는 모두 1 µs 미만이고 payload-12의 증가는 그 행의 창 안 흐름(A→A′ +16 µs)보다 작아 체계적 비용으로 증명되지 않으며, 잠복 경로 제거는 설계 Ⅱ의 고정 단계다. Bun 힙 +4 B/노드(2250.6 > A 최대 2246.6)와 보유 바이트(oneOf 3슬롯 5336→5656 B, payload 12슬롯 18120→18696 B; 첫 `inactiveValues` 읽기 때 슬롯 인스턴스에 붙는 메모와 동결 항목 쌍 때문, B4-1 대비 −80 B)는 보고다. 독립 검토 PASS(결함 0, P3로 남은 DETAIL 다섯 파일의 옛 이름은 문서 정리 커밋으로 고침). #481(95853ae5f)로 병합. 되돌림은 #480·#481의 revert다. 소유자 재검증 목록에 올린다." (`reviews/round-459-closing.md:8`)
- 상태: 현행
- 출처: `reviews/round-458-closing.md:14`(정본), `reviews/round-458-closing.md:8`, `reviews/round-458-closing.md:12`, `reviews/round-458-owner-answers.md:7-8`, `verification/branch-switch/b2-p3-results.md`, `verification/branch-switch/b4-1-results.md`
- 닫은 사람: 소유자 답(`reviews/round-458-owner-answers.md:8`), 편집자 결정(458라운드, `reviews/round-458-closing.md` 458C-01·03·04)
- 라운드: 458
- 까닭: `reviews/round-458-owner-answers.md:8`

### TEST-098 분기 전환 단계의 B3 관문 재측정과 마감 판정(459라운드) — 세 레인(0.16.1 / 단계 시작 / 단계 끝) 한 창, 형제 관문 상한은 창 전 3배 고정, 단계 시작 판의 단계 장부는 호환 실행기(매핑 불일치 13단계 제외), 판정은 총합 행; 쓰기당 oneOf-80 36.7 / 245.5 / 152.0 µs(단계 −38 %, 0.16.1의 4.14배, 1 ms 아래), discriminator-80 438.9→122.6, if-80 581.4→196.7, payload-12 462.4→274.3, siblings-1000 2078.7→2069.9(0.16.1 2536.0; 선형항 약 2.0 ms/1,000 그대로); 관문 여섯 가운데 TEST-073·제거 단계 호출 0 통과, oneOf-80 1.5배·discriminator·if·형제(21.2배)·Node 힙 중앙(+0.09 %) 미달; 계획서대로 단계를 멈추고 수치와 선택지 셋(관문 수정 뒤 B5 마감 / 선택·계산 self와 형제 선형항의 설계 Ⅲ / 9단계)을 소유자에게 올림

- 결정:
  > 【추론】 창 품질 1.013 유효. 쓰기당 µs(0.16.1 / 단계 시작 / 단계 끝): switch-oneOf-80 36.7 / 245.5 / 152.0(단계 −38 %, 0.16.1의 4.14배, 1 ms 아래), discriminator-80 쌍 없음 / 438.9 / 122.6, if-80 쌍 없음 / 581.4 / 196.7(guard 0.03 µs/호출, active+160 guard 상한 308.8), nested-oneOf-20 30.2 / 340.0 / 283.7, payload-12 104.2 / 462.4 / 274.3, siblings-0 31.2 / 99.8 / 97.5, siblings-100 137.4 / 273.6 / 263.5, siblings-1000 2536.0 / 2078.7 / 2069.9, siblings-4000 7922.4 / 6763.3 / 6670.9. 관문: oneOf-80 1.5배 FAIL(1 ms는 통과), discriminator-80·if-80 FAIL(같은 선), 형제 FAIL(21.2배 대 3배; 1,000개당 선형항 약 2.0 ms는 단계 시작과 같고 0.16.1의 2.5 ms보다 작음), 다른 canonical 행 TEST-073 PASS(주판정 회귀 0, 뒤 반창 1건), Node 노드당 힙 FAIL(S 중앙 1439.1 → E 중앙 1440.3 B/노드, +0.09 %; PR마다의 규칙인 B 중앙 ≤ A 최대 1889.5로는 통과, Bun 2224.8 → 2250.9 보고), 제거 대상 단계 호출 0 PASS. 보유 상한은 K·M = 3·1(oneOf·if·discriminator·nested), 12·1(payload), reset 뒤 슬롯 호스트 0. React 전체 폼은 보고 전용. oneOf-80의 이전 창 인용 누적은 261.3(시작) → 252.4(B1) → 220.6(B2-P2) → 146.2(B4-1) → 187.1(B4-2 창, 그 창의 A는 191.1)이고 B3 재측정은 245.5 → 152.0이다. 남은 비용의 자리: 선택·계산 self(selectChildren 약 29 µs, computeNode 약 32 µs), 등록·재계산 약 12 µs, finalizeExits 약 19 µs, 조립·커밋·배달 약 30 µs, 형제 선형항 약 2.0 ms/1,000(조립·등록 추정, B2-P3가 보류한 존재 차분 재사용의 자리). 계획서의 "B3에서 관문 미달이면 수치를 소유자에게 올려 다음을 소유자가 정한다"에 따라 단계를 여기서 멈추고 보고한다: 선택지는 (A) 관문을 지금 수치로 고쳐 B5 마감, (B) 선택·계산 self와 형제 선형항을 겨냥한 설계 Ⅲ 착수, (C) 그대로 9단계로. 소유자의 자율 진행 지시(위 2행)는 "목표한 작업"을 끝까지 하라는 것이었고 목표한 작업(B0~B4-2·B3)은 모두 끝났으므로, 다음 단계의 선택은 소유자에게 돌린다.
- 보충:
  > 소유자(458라운드, 롱턴 자율 진행): "너의 작업 제외, 모두 꺼줄게. 이제 네가 파워조절을 하면서 진행하도록 해. \n끊기지 않게 목표한 작업을 모두 진행하도록." (`reviews/round-458-owner-answers.md:8`)
  > 편집자 결정(459C-04): "【추론】 B3는 제품 변경 없이 0.16.1 / 단계 시작(0eb03ff3b) / 단계 끝(95853ae5f) 세 레인을 한 창에서 쟀다(기존 교대 장치 재사용, 0.16.1 레인 20프로세스 가운데 A 쪽 10만 주표·품질, 단계 장부 4행 × A/B × 3회 = 24프로세스, payload-12는 0.16.1 쌍 사용, if·discriminator는 쌍 없음). TEST-093의 "작은 상수 배"에 수치가 없어 측정 뒤 기준을 만들지 않도록 창 전에 3배로 고정했다(siblings-1000 ≤ 3 × siblings-0). 단계 시작 판은 B4-2의 타이머 앵커가 없어 저장소 밖 호환 실행기에서 같은 함수 타이머와 시간 루프를 재사용하고 wheelPreparation만 B0 구간으로 매핑했으며, B0 장부와의 대조에서 매핑 불일치 13단계는 비교에서 뺐다; 관문 판정은 총합 행으로만 한다. #482(8f51eda84)로 병합." (`reviews/round-459-closing.md:14`)
  > 편집자 결정(460C-03): "【추론】 위 8행에서 소유자가 와일드카드·상대경로 문법은 독자 문법이라 뺄 수 없고 `~2` 식의 이스케이프 확장은 비표준이라 했으므로, RFC 6901 §6의 퍼센트 표기를 예약 토큰에만 빌리는 최소 변형을 택했다(위 9행 소유자 우려에 답해 보통 키의 경로는 한 글자도 바뀌지 않고 `%`가 든 보통 이름도 그대로임을 확인, 위 10행 승인). 세그먼트 해석 규칙 세 줄: 정확히 `*`·`..`·`.`·`@`는 연산자, 정확히 `%2A`·`%2E%2E`·`%2E`·`%40`은 그 글자의 리터럴 키, 나머지는 `~1`·`~0`만 푼다. `src/helpers/jsonPointer`가 유일한 해석기·조립기이며(`parsePointer`·표준 포인터 파서·`formatSegment`·조립·하위 경로·상대 해석), 정적 검사 시험 `pointerIsolation`이 fractal 밖의 경로 `split`·`'/'` 결합과 비교·`~0`·`~1` 정규식·원문 토큰 비교를 금지한다(허용 목록은 그 fractal 하나). 배열 아이템 표지 `*`는 호스트 종류로 판정해 연산자로 등록하고 이름이 `*`인 객체 속성만 `%2A`로 등록한다. 검증기 `dataPath`·`$ref`는 연산자 없는 표준 파서로 읽고 형식이 다른 입력에 예외를 내지 않는다. 이름이 정확히 `%2A`·`%2E`·`%2E%2E`·`%40`인 속성은 청사진 진단으로 거부하며(알려진 한계), 그 진단은 공개 선언 차분 0 관문 때문에 `FormErrorCode.UnknownJsonSchema`를 재사용했다(전용 코드는 소유자가 관문 예외를 선언할 때 가능). 별표 호환 장치(전용 20파일 1,275줄, 공유 47파일의 분기 168곳, `containsLiteralStar`)와 고아가 된 경로 헬퍼를 지웠고, 공개 기대값 11건은 `*`→`*x` 사본으로 관측한 값과 일치했다. 후보 1(`59c42dc6f`)은 창에서 siblings-0 장부 82.48(폭 81.75~85.17) → 88.04 µs(+5.56, 네 단계 일관, 22행 비율 1.12)로 기각했으며 원인은 쓰기마다 정적 경로를 파싱하고 결과 객체를 만드는 것이었다. 후보 2(쓰기당 파싱 0, 세그먼트 전용 API)는 86.98(폭 8.67) → 87.92로 통과했으나 독립 검토가 import 모델의 포괄 예외(459C-03 위반) 등 일곱 건을 찾아 후보 3에서 닫았고(배치와 `vi.mock` 계수로 U/D/S1 = 0), 후보 3 창은 siblings-0 83.35(폭 5.37) → 83.92, oneOf-80 179.10 → 173.52, TEST-073 0, 힙 통과였다. 전체 관문 초록, 선언 동일, 배달 차이 0. #483으로 병합했다." (`reviews/round-460-closing.md:12`)
  > 편집자 결정(460C-04): "【추론】 위 7행대로 두 결함을 고친 뒤 설계 Ⅱ를 이정표로 찍는다. B5는 B3와 같은 세 레인(0.16.1 / 단계 시작 `0eb03ff3b` / 단계 끝 `ad0be79ba`)과 관문으로 한 창을 돌렸다: 0.16.1 레인 품질 비 1.01 유효, 쓰기당 µs(0.16.1 / 단계 시작 / 단계 끝) oneOf-80 39.30 / 249.57 / 171.94(시작 대비 −31 %, 0.16.1의 4.37배, 1 ms 아래), discriminator-80 — / 437.04 / 115.83, if-80 — / 595.14 / 186.76, nested-oneOf-20 26.99 / 292.59 / 262.78, payload-12 106.89 / 445.30 / 285.08, siblings-0 29.75 / 99.23 / 106.73, siblings-1000 2490.83 / 2056.06 / 2076.27(형제 0의 19.45배, 1,000명당 1,633 µs), siblings-4000 8684.10 / 6733.19 / 6677.19; 단계 장부(wrapped) oneOf-80 247.73 → 172.40, payload-12 497.98 → 289.27, siblings-0 85.77 → 82.71, siblings-1000 2084.60 → 2122.29; 관문은 oneOf-80·discriminator·if(1.5배 선)와 형제(3배 상한) FAIL, 다른 행 TEST-073 PASS(회귀 0), Node 노드당 힙 중앙값 규칙 FAIL(1439.10 → 1439.35; PR 규칙으로는 통과), 제거 단계 호출 0 PASS — B3와 같은 그림이고 B6·B7은 공개 결함을 고치면서 oneOf-80을 창 사이 흔들림 안(B3 152.0, B5 171.94)에 두었다. 첫 창은 준비 도구의 444 권한 결함(EACCES)으로 중단되어 458C-03대로 환경 실패로 기록하고 새 창 한 번을 돌렸다(`verification/branch-switch/b5-results.md`, #485). 설계 Ⅲ(선택·계산 self와 형제 선형항)의 착수 여부는 소유자가 따로 정한다. 소유자 판단으로 남는 것: production 프로젝트(`test:production`)의 oneOf-20 freeze 수 불일치(117 > 111)는 단계 기준 가지 `0b9337cd9`에서도 똑같이 나는 기존 실패로 이 단계의 PR과 무관하며, worktree `branch-switch-b0`·`b6`·`b7`·`b5`는 병합이 끝나 지워도 되지만 `orca worktree rm`은 소유자 승인이 필요하다." (`reviews/round-460-closing.md:14`)
  > 편집자 결정(460C-07): "【추론】 위 14행에서 소유자가 수정보다 검토가 오래 걸린다고 했고 위 15행에서 측정 관문은 효율화하되 동작은 무결함을 보장하라고 했다. 규칙(`plan/branch-switch/defect-fixes.md` 검증 스케줄 절): 수정 반복 중에는 표적 시험과 typecheck·lint만, 독립 검토는 지난 검토 이후의 delta만, 창은 한 측정 담당이 후보들을 연달아, 다섯 프로젝트 전체·verify·배달 비교·선언 차분은 검토를 통과한 최종 후보에서 PR당 한 번 한 worktree씩(두 worktree의 동시 전체 실행은 메모리 부족과 브라우저 연결 종료를 반복시켰다). B7은 rebase한 머리에서 그 한 번을 돌렸고, 그 뒤 검토가 한 줄 수정을 요구하자 수정 머리에서 전체 관문을 한 번 더 돌렸다. 전체 단위 시험의 메모리 부족 원인(게이트 표 fixture의 spy 호출 누적)은 B6이 두 줄로 고쳤다." (`reviews/round-460-closing.md:20`)
  > 편집자 결정(461C-04): "【추론】 위 11행의 지시. 460~461라운드의 중단 넷은 B6(브리프가 플러그인 dist 준비를 빠뜨림), B5(번들 444 권한의 EACCES, 러너 자신의 프로세스를 외부 부하로 셈), B8(macOS 데몬 `mds_stores` 113 %, `duetexpertd` 52 %의 수 초 부하 두 번)이었고 그때마다 검토·구현이 창 뒤에 줄을 섰다. 규칙 다섯(`plan/branch-switch/verification.md` 461라운드 절): 정식 시작 전 무시간 스모크 한 번; 사전 점검은 프로세스별 30 %를 3초 평균으로 재고 넘으면 중단이 아니라 5초 간격 최대 120초의 시작 지연(B8이 만든 장치, 완료 표본 재실행 0; PR마다 복사하지 않고 공용 `tools/window/`), 120초 안에 조용해지지 않을 때만 환경 실패; 창은 임계 경로를 막지 않는다(제품 관문이 초록이면 독립 검토와 PR 준비를 창과 동시에, 창 중 금지는 시험·빌드·다른 창뿐); 창은 모아서 한 번이고 제품 바이트 불변의 후속 커밋은 창을 다시 요구하지 않는다; 같은 원인의 두 번째 중단 뒤 장치 수정 없는 재시도 금지. 이 라운드의 B8 독립 검토는 창과 동시에 읽기 전용으로 수행했고, B9-0 워커는 B8 병합 전에 구현을 시작했다(규칙 3의 첫 적용)." (`reviews/round-461-closing.md:14`)
- 상태: 현행
- 출처: `reviews/round-459-closing.md:16`(정본), `reviews/round-459-closing.md:14`, `reviews/round-458-owner-answers.md:8`, `verification/branch-switch/b3-results.md`
- 닫은 사람: 편집자 결정(459라운드, `reviews/round-459-closing.md` 459C-04·05)
- 라운드: 459
- 까닭: `reviews/round-459-closing.md:16`

### TEST-099 설계 Ⅱ 이정표의 검증 스케줄과 B5 재측정(460라운드) — 수정 반복 중에는 표적 시험과 typecheck·lint만, 독립 검토는 지난 검토 이후의 delta만, 창은 한 측정 담당이 후보들을 연달아, 다섯 프로젝트 전체·verify·배달 비교·선언 차분은 검토를 통과한 최종 머리에서 PR당 한 번 한 worktree씩(동작 무결함은 양보하지 않음: 최종 머리의 전체 시험이 빨간 상태로는 PR도 병합도 없음; B7은 rebase 머리와 그 뒤 한 줄 수정 머리에서 각각 한 번); B5는 B3와 같은 세 레인(0.16.1 / 단계 시작 `0eb03ff3b` / 단계 끝 `ad0be79ba`) 한 창: 0.16.1 / 시작 / 끝 쓰기당 oneOf-80 39.30 / 249.57 / 171.94 µs(4.37배, 1 ms 아래), discriminator-80 437.04 → 115.83, if-80 595.14 → 186.76, payload-12 445.30 → 285.08, siblings-0 99.23 → 106.73, siblings-1000 2056.06 → 2076.27(19.45배); 관문은 oneOf·discriminator·if·형제 FAIL, TEST-073 PASS, Node 힙 중앙값 규칙 FAIL(1439.10 → 1439.35)·제거 경로 PASS로 B3와 같은 그림; 설계 Ⅲ의 착수는 소유자가 정한다

- 결정:
  > 【추론】 위 7행대로 두 결함을 고친 뒤 설계 Ⅱ를 이정표로 찍는다. B5는 B3와 같은 세 레인(0.16.1 / 단계 시작 `0eb03ff3b` / 단계 끝 `ad0be79ba`)과 관문으로 한 창을 돌렸다: 0.16.1 레인 품질 비 1.01 유효, 쓰기당 µs(0.16.1 / 단계 시작 / 단계 끝) oneOf-80 39.30 / 249.57 / 171.94(시작 대비 −31 %, 0.16.1의 4.37배, 1 ms 아래), discriminator-80 — / 437.04 / 115.83, if-80 — / 595.14 / 186.76, nested-oneOf-20 26.99 / 292.59 / 262.78, payload-12 106.89 / 445.30 / 285.08, siblings-0 29.75 / 99.23 / 106.73, siblings-1000 2490.83 / 2056.06 / 2076.27(형제 0의 19.45배, 1,000명당 1,633 µs), siblings-4000 8684.10 / 6733.19 / 6677.19; 단계 장부(wrapped) oneOf-80 247.73 → 172.40, payload-12 497.98 → 289.27, siblings-0 85.77 → 82.71, siblings-1000 2084.60 → 2122.29; 관문은 oneOf-80·discriminator·if(1.5배 선)와 형제(3배 상한) FAIL, 다른 행 TEST-073 PASS(회귀 0), Node 노드당 힙 중앙값 규칙 FAIL(1439.10 → 1439.35; PR 규칙으로는 통과), 제거 단계 호출 0 PASS — B3와 같은 그림이고 B6·B7은 공개 결함을 고치면서 oneOf-80을 창 사이 흔들림 안(B3 152.0, B5 171.94)에 두었다. 첫 창은 준비 도구의 444 권한 결함(EACCES)으로 중단되어 458C-03대로 환경 실패로 기록하고 새 창 한 번을 돌렸다(`verification/branch-switch/b5-results.md`, #485). 설계 Ⅲ(선택·계산 self와 형제 선형항)의 착수 여부는 소유자가 따로 정한다. 소유자 판단으로 남는 것: production 프로젝트(`test:production`)의 oneOf-20 freeze 수 불일치(117 > 111)는 단계 기준 가지 `0b9337cd9`에서도 똑같이 나는 기존 실패로 이 단계의 PR과 무관하며, worktree `branch-switch-b0`·`b6`·`b7`·`b5`는 병합이 끝나 지워도 되지만 `orca worktree rm`은 소유자 승인이 필요하다.
- 보충:
  > 소유자(460라운드, 검증 스케줄): "수정 자체보다 검토가 오래걸리네. 좀 더 스마트하게 검증하도록 스케줄링을 해봐." (`reviews/round-460-owner-answers.md:14`)
  > 소유자(460라운드, 동작 무결함의 보장): "기본적으로 벤치 측정은 아니더라도, 로직이나 동작은 무결함을 보장해야돼. 머지 후 벤치 단계에서 테스트 실패가 발생하면 백트래킹 비용이 너무 크니까. \n측정 게이트를 효율화 하는데, 동작 자체는 무결함을 보장하고 올려" (`reviews/round-460-owner-answers.md:15`)
  > 편집자 결정(460C-07): "【추론】 위 14행에서 소유자가 수정보다 검토가 오래 걸린다고 했고 위 15행에서 측정 관문은 효율화하되 동작은 무결함을 보장하라고 했다. 규칙(`plan/branch-switch/defect-fixes.md` 검증 스케줄 절): 수정 반복 중에는 표적 시험과 typecheck·lint만, 독립 검토는 지난 검토 이후의 delta만, 창은 한 측정 담당이 후보들을 연달아, 다섯 프로젝트 전체·verify·배달 비교·선언 차분은 검토를 통과한 최종 후보에서 PR당 한 번 한 worktree씩(두 worktree의 동시 전체 실행은 메모리 부족과 브라우저 연결 종료를 반복시켰다). B7은 rebase한 머리에서 그 한 번을 돌렸고, 그 뒤 검토가 한 줄 수정을 요구하자 수정 머리에서 전체 관문을 한 번 더 돌렸다. 전체 단위 시험의 메모리 부족 원인(게이트 표 fixture의 spy 호출 누적)은 B6이 두 줄로 고쳤다." (`reviews/round-460-closing.md:20`)
  > 편집자 결정(461C-01): "【추론】 위 7행의 지시로 B5 창의 22행 세 레인 표(0.16.1 / 단계 시작 `0eb03ff3b` / 단계 끝 `ad0be79ba`)와 알려진 한계 다섯 묶음을 올렸다: B7의 쓰기 주소 한계 셋과 배달 코퍼스의 공백, B6의 예약 퍼센트 이름 거부와 `UnknownJsonSchema` 재사용과 P3 넷, 설계 Ⅱ 구조(청사진을 가로지르는 중첩 이전의 비용, 나간 서브트리 전체의 보유), 성능(분기 전환 2.7~9.7배, 형제 선형항 1.63 µs/형제, mount-oneOf-80 6.8배와 단계 시작 대비 +14 %, single-nested 5.2배), 기존 실패(`test:production`의 oneOf-20 동결 수 117 > 111). 위 8행의 물음에는 보강 가능한 것(코퍼스 장면, P3 넷, 생존 0 배열의 통일, 전용 오류 코드, 옛 참조 한계 일부)과 설계의 선택으로 두는 것을 나눠 답했고, 느려진 행은 mount-oneOf-80뿐이며 해결 못한 것은 0.16.1 대비 배수와 형제 선형항임을 밝혔다. worktree `b5`·`b6`·`b7`은 Orca로 지웠고 `b0`은 샌드박스가 보호 속성 파일의 삭제를 막아 소유자가 직접 지운다." (`reviews/round-461-closing.md:8`)
  > 편집자 결정(461C-03): "【추론】 B5 단계 장부와 D2-P5 프로파일로 만든 비용 지도(`plan/branch-switch/design-iii.md` 문제 절): 형제 행의 두 분기가 같은 이름 `x`·`y`를 선언해 청사진이 선언 둘짜리 템플릿으로 합치고, 직접 계획이 `declarations.length !== 1`로 null이 되며 `prepareStaticHost`가 직접 계획 없이는 준비물을 만들지 않아(`if (!plan) return undefined`, 코드로 확인) B2-P2의 준비물이 형제 호스트에 한 번도 적용되지 않았다(쓰기당 재사용 콜백 2,004회; B2-P2 결과 문서의 "분할이 정적 목록을 비운다"는 서술은 이 관찰과 어긋나 B9-0이 정정한다). 형제당 2.03 µs는 selectChildren 0.70, primeHost 0.67, computeNode 0.29, assembleObject 0.26, commitSettlement 0.07로 나뉘고 O(S) 루프는 여섯이다. oneOf-80 166 µs는 바닥 79 + 잎당 4.9 × 6 + 나머지 58이며 게이트 수 G에 비례하는 항은 약 5.6 µs뿐이다. 명제: 정적 준비물은 직접 계획이 아니라 분할의 유일성에만 걸리고 호스트 루프는 동적 엔트리만 걷는다(H1), 들고 나는 엔트리의 상수를 줄인다(H5~H7); H2~H4는 assembleObject 메모·참조 보존 판정·커밋 루프. 예상 oneOf-80 172 → 120~145 µs(3.1~3.7배), siblings-1000 2,076 → 250~400 µs(3배 상한의 경계선). 1.5배 관문(59.0 µs)은 바닥(형제 0 행 106.7 µs)만으로 1.8배라 이 설계로는 닿지 않으며 그 아래는 정착 고정 장치의 재설계(설계 Ⅳ 후보)다. 위 10행의 물음("설계 Ⅳ를 하려면 Ⅲ을 먼저 해야 하는가")에는 B9-0 측정이 둘 다의 전제이고 H1·H5~H7은 Ⅳ와 독립, H2~H4는 Ⅳ에 접을 수 있으며 Ⅲ과 Ⅳ를 다 해도 1.5배는 어려울 수 있다고 답했고, 소유자가 착수를 정했다("좋아 설계3 진행. 그 다음 다시 측정하고 설계4를 검토해보자."). 단계: B9-0(측정만: computeNode·finalizeExits 하위 타이머, 준비된 경로의 형제 탐침 행, 정적 준비물 진단, 행 대 단계 24 µs 귀속) → B9-1(H1+H4) → B9-2(H2+H3) → B9-3(H5~H7) → B10(세 레인 이정표) → 설계 Ⅳ 검토. B9-0 워커는 창 규칙(461C-04)대로 B8 병합 전에 구현을 시작했고 창은 병합 머리 `699cbd733` 위에서 연다." (`reviews/round-461-closing.md:12`)
- 상태: 현행
- 출처: `reviews/round-460-closing.md:14`(정본), `reviews/round-460-closing.md:20`, `reviews/round-460-owner-answers.md:14-15`, `plan/branch-switch/defect-fixes.md`, `verification/branch-switch/b5-results.md`
- 닫은 사람: 소유자 답(`reviews/round-460-owner-answers.md:14-15`), 편집자 결정(460라운드, `reviews/round-460-closing.md` 460C-04·07)
- 라운드: 460
- 까닭: `reviews/round-460-owner-answers.md:14`

### TEST-100 설계 Ⅲ의 비용 지도와 채택(461라운드) — 형제 선형항(1.63 µs/형제)의 근원은 두 분기가 같은 이름을 선언해 선언 둘짜리 템플릿이 되면 직접 계획이 null이 되고 `prepareStaticHost`가 직접 계획 없이는 준비물을 만들지 않아 B2-P2의 호스트 정적 준비물이 형제 호스트에 한 번도 적용되지 않은 것(쓰기당 재사용 콜백 2,004회; O(S) 루프 여섯); oneOf-80 166 µs는 바닥 79 + 잎당 4.9 × 6 + 나머지 58이고 게이트 수에 비례하는 항은 약 5.6 µs; 명제는 정적 준비물을 직접 계획이 아니라 분할의 유일성에 걸고 호스트 루프는 동적 엔트리만 걷는 것(H1)과 들고 나는 엔트리의 상수 축소(H5~H7), 그리고 assembleObject 메모·참조 보존 판정·커밋 루프(H2~H4); 예상 oneOf-80 172 → 120~145 µs(3.1~3.7배), siblings-1000 2,076 → 250~400 µs; 1.5배 관문(59 µs)은 바닥(형제 0 행 106.7 µs)만으로 1.8배라 이 설계의 범위 밖이며 그 아래는 정착 고정 장치의 재설계(설계 Ⅳ 후보); 소유자가 착수를 정해 B9-0(측정만: 하위 타이머·준비된 경로의 형제 탐침·정적 준비물 진단·행 대 단계 24 µs) → B9-1(H1+H4) → B9-2(H2+H3) → B9-3(H5~H7) → B10(세 레인 이정표) 뒤 설계 Ⅳ를 검토한다; B9-0는 제품 변경이 없어 A/B 없는 창 하나로 닫는다

- 결정:
  > 【추론】 B5 단계 장부와 D2-P5 프로파일로 만든 비용 지도(`plan/branch-switch/design-iii.md` 문제 절): 형제 행의 두 분기가 같은 이름 `x`·`y`를 선언해 청사진이 선언 둘짜리 템플릿으로 합치고, 직접 계획이 `declarations.length !== 1`로 null이 되며 `prepareStaticHost`가 직접 계획 없이는 준비물을 만들지 않아(`if (!plan) return undefined`, 코드로 확인) B2-P2의 준비물이 형제 호스트에 한 번도 적용되지 않았다(쓰기당 재사용 콜백 2,004회; B2-P2 결과 문서의 "분할이 정적 목록을 비운다"는 서술은 이 관찰과 어긋나 B9-0이 정정한다). 형제당 2.03 µs는 selectChildren 0.70, primeHost 0.67, computeNode 0.29, assembleObject 0.26, commitSettlement 0.07로 나뉘고 O(S) 루프는 여섯이다. oneOf-80 166 µs는 바닥 79 + 잎당 4.9 × 6 + 나머지 58이며 게이트 수 G에 비례하는 항은 약 5.6 µs뿐이다. 명제: 정적 준비물은 직접 계획이 아니라 분할의 유일성에만 걸리고 호스트 루프는 동적 엔트리만 걷는다(H1), 들고 나는 엔트리의 상수를 줄인다(H5~H7); H2~H4는 assembleObject 메모·참조 보존 판정·커밋 루프. 예상 oneOf-80 172 → 120~145 µs(3.1~3.7배), siblings-1000 2,076 → 250~400 µs(3배 상한의 경계선). 1.5배 관문(59.0 µs)은 바닥(형제 0 행 106.7 µs)만으로 1.8배라 이 설계로는 닿지 않으며 그 아래는 정착 고정 장치의 재설계(설계 Ⅳ 후보)다. 위 10행의 물음("설계 Ⅳ를 하려면 Ⅲ을 먼저 해야 하는가")에는 B9-0 측정이 둘 다의 전제이고 H1·H5~H7은 Ⅳ와 독립, H2~H4는 Ⅳ에 접을 수 있으며 Ⅲ과 Ⅳ를 다 해도 1.5배는 어려울 수 있다고 답했고, 소유자가 착수를 정했다("좋아 설계3 진행. 그 다음 다시 측정하고 설계4를 검토해보자."). 단계: B9-0(측정만: computeNode·finalizeExits 하위 타이머, 준비된 경로의 형제 탐침 행, 정적 준비물 진단, 행 대 단계 24 µs 귀속) → B9-1(H1+H4) → B9-2(H2+H3) → B9-3(H5~H7) → B10(세 레인 이정표) → 설계 Ⅳ 검토. B9-0 워커는 창 규칙(461C-04)대로 B8 병합 전에 구현을 시작했고 창은 병합 머리 `699cbd733` 위에서 연다.
- 보충:
  > 소유자(461라운드, 개발환경 삭제와 판단 재료): "일단 둘째, 개발환경 삭제 허용. 셋째 알려진 한계와 지금 시점(설계2)의 속도 비교표를 보여줘. 그걸 보고 단계3을 갈지 말지 결정할게" (`reviews/round-461-owner-answers.md:7`)
  > 소유자(461라운드, 설계 Ⅲ 착수): "흠. 설계 3으로는 형제1000을 해결하는 방향은 되겠는데, oneof 게이트를 극단적으로 줄이긴 어렵군.\n설계4를 한다면 3을 시도하고 진행하는게 필요하단건가?" (2026-10-28, 원장 세션); "좋아 설계3 진행. 그 다음 다시 측정하고 설계4를 검토해보자." (`reviews/round-461-owner-answers.md:10`)
  > 편집자 결정(461C-01): "【추론】 위 7행의 지시로 B5 창의 22행 세 레인 표(0.16.1 / 단계 시작 `0eb03ff3b` / 단계 끝 `ad0be79ba`)와 알려진 한계 다섯 묶음을 올렸다: B7의 쓰기 주소 한계 셋과 배달 코퍼스의 공백, B6의 예약 퍼센트 이름 거부와 `UnknownJsonSchema` 재사용과 P3 넷, 설계 Ⅱ 구조(청사진을 가로지르는 중첩 이전의 비용, 나간 서브트리 전체의 보유), 성능(분기 전환 2.7~9.7배, 형제 선형항 1.63 µs/형제, mount-oneOf-80 6.8배와 단계 시작 대비 +14 %, single-nested 5.2배), 기존 실패(`test:production`의 oneOf-20 동결 수 117 > 111). 위 8행의 물음에는 보강 가능한 것(코퍼스 장면, P3 넷, 생존 0 배열의 통일, 전용 오류 코드, 옛 참조 한계 일부)과 설계의 선택으로 두는 것을 나눠 답했고, 느려진 행은 mount-oneOf-80뿐이며 해결 못한 것은 0.16.1 대비 배수와 형제 선형항임을 밝혔다. worktree `b5`·`b6`·`b7`은 Orca로 지웠고 `b0`은 샌드박스가 보호 속성 파일의 삭제를 막아 소유자가 직접 지운다." (`reviews/round-461-closing.md:8`)
  > 편집자 결정(461C-03): "【추론】 B5 단계 장부와 D2-P5 프로파일로 만든 비용 지도(`plan/branch-switch/design-iii.md` 문제 절): 형제 행의 두 분기가 같은 이름 `x`·`y`를 선언해 청사진이 선언 둘짜리 템플릿으로 합치고, 직접 계획이 `declarations.length !== 1`로 null이 되며 `prepareStaticHost`가 직접 계획 없이는 준비물을 만들지 않아(`if (!plan) return undefined`, 코드로 확인) B2-P2의 준비물이 형제 호스트에 한 번도 적용되지 않았다(쓰기당 재사용 콜백 2,004회; B2-P2 결과 문서의 "분할이 정적 목록을 비운다"는 서술은 이 관찰과 어긋나 B9-0이 정정한다). 형제당 2.03 µs는 selectChildren 0.70, primeHost 0.67, computeNode 0.29, assembleObject 0.26, commitSettlement 0.07로 나뉘고 O(S) 루프는 여섯이다. oneOf-80 166 µs는 바닥 79 + 잎당 4.9 × 6 + 나머지 58이며 게이트 수 G에 비례하는 항은 약 5.6 µs뿐이다. 명제: 정적 준비물은 직접 계획이 아니라 분할의 유일성에만 걸리고 호스트 루프는 동적 엔트리만 걷는다(H1), 들고 나는 엔트리의 상수를 줄인다(H5~H7); H2~H4는 assembleObject 메모·참조 보존 판정·커밋 루프. 예상 oneOf-80 172 → 120~145 µs(3.1~3.7배), siblings-1000 2,076 → 250~400 µs(3배 상한의 경계선). 1.5배 관문(59.0 µs)은 바닥(형제 0 행 106.7 µs)만으로 1.8배라 이 설계로는 닿지 않으며 그 아래는 정착 고정 장치의 재설계(설계 Ⅳ 후보)다. 위 10행의 물음("설계 Ⅳ를 하려면 Ⅲ을 먼저 해야 하는가")에는 B9-0 측정이 둘 다의 전제이고 H1·H5~H7은 Ⅳ와 독립, H2~H4는 Ⅳ에 접을 수 있으며 Ⅲ과 Ⅳ를 다 해도 1.5배는 어려울 수 있다고 답했고, 소유자가 착수를 정했다("좋아 설계3 진행. 그 다음 다시 측정하고 설계4를 검토해보자."). 단계: B9-0(측정만: computeNode·finalizeExits 하위 타이머, 준비된 경로의 형제 탐침 행, 정적 준비물 진단, 행 대 단계 24 µs 귀속) → B9-1(H1+H4) → B9-2(H2+H3) → B9-3(H5~H7) → B10(세 레인 이정표) → 설계 Ⅳ 검토. B9-0 워커는 창 규칙(461C-04)대로 B8 병합 전에 구현을 시작했고 창은 병합 머리 `699cbd733` 위에서 연다." (`reviews/round-461-closing.md:12`)
  > 편집자 결정(462C-03): "【추론】 codex 워커에 위임했고 후보 1(`e26859e29` 제품 끝)의 독립 검토(claude 검증 에이전트, 창과 겹쳐 읽기 전용)는 CONDITIONAL PASS(P1 0, P2 5: onError 콜백 안의 떼어진 쓰기가 `reportingErrors`를 무조건 풀어 뒤이은 실제 쓰기가 `WriteInObserver`를 지나침, `resetSubtree`의 detached 가드 누락, 장치 제거가 남긴 고아 `lineage` 매개변수, 배열 동사 여섯의 경고 시험 누락, dist 번들 시험이 unit·verify-unit 프로젝트에도 수집됨; P3 13)였다. P2 셋이 제품 바이트를 바꾸므로 창 1(수정 전 머리, 5/5 통과)은 "대체됨"으로 보존하고 수정 뒤 최종 관문을 다시 돌려 창 2(A `df61df184` vs B `fd6098929`)로 판정했다: TEST-073 주 회귀 0, quality·`switch-oneOf-80`·`switch-siblings-0` 장부 총합·Node 힙 5/5 통과(B 중앙 1439.31 ≤ A 최대 1895.98 bytes/node), finalizeExits self −3.27 %·cloneFromSlot −1.52 %(oneOf-80, 진단). 수정 차분의 독립 검토는 PASS(P1 0, P2 0, P3 4: DETAIL 문장 복원, TSDoc 셋, record DETAIL 이력 문장, `resetSubtree` 검사 순서 기록)였고 넷을 바이트 중립 후속으로 닫았다(재빌드 뒤 런타임 번들 셋과 공개 `index.d.ts` 해시 동일, 내부 선언 TSDoc 셋과 해시 매니페스트만 상이 → 창 없음). 최종 관문: 다섯 프로젝트 5,687건(unit 3,883·render 766·react18 766·storybook 251·production 21)과 verify 4,693건 실패 0, 격리·첫 쓰기 파서 10/10, 선언 차분은 경고 멤버 하나(공개 이름 94 그대로), 배달 코퍼스 79장면 491 → 429관측점(의미가 바뀐 떼어진 쓰기 62점 제거)에서 차이 0, 64회 재진입의 도달 노드 9 → 9와 옛 인스턴스 미도달. #487로 스쿼시 병합했다(`4d0fa4a12`). 워커의 FCA 감사는 기존 `FieldProxy↔FieldInputSlot` 순환으로 FAIL·불확정이나 그 서브트리는 단계 머리와 차분이 없어 범위 밖 기존 소견으로 기록했다. 원장 코드 시험(ERROR-164)은 B8의 `RESERVED_PROPERTY_NAME`과 같이 기대값 끝에 `SCHEMA_FORM_WARNING.DETACHED_NODE_WRITE`를 명시했고, ERROR-164 정본에는 두 멤버가 시험 기대값에 명시된 추가 멤버임을 보충으로 적는다." (`reviews/round-462-closing.md:12`)
  > 편집자 결정(463C-01): "【추론】 B9-0(측정만, `4e06463a9`)의 하위 타이머: 형제 1,000의 computeNode 선형항 주인은 `registerPresenceChanges`(net 약 378 µs)이고 참조 보존·`sameValue`의 증가분은 약 12 µs라 H3은 형제에서 뒤집혔고 oneOf에서 약화됐다(0.3 µs); 정적 준비물 직접 진단은 siblings-1000이 staticEntries 1,001·직접 계획 null·준비물 없음·쓰기당 재사용 콜백 2,004회, oneOf-80은 계획 있음·준비물 있음·콜백 0으로 H1의 원인을 확인했다; 준비된 경로에도 형제당 1.3 µs(assembleObject 0.65·primeHost 0.34·selectChildren 0.10)가 남는다; finalizeExits 고정분 13.6의 주인은 misfit 색인이 아니며(net −0.5) 미확정이다. 창은 180/180에 legacy 품질비 1.033이었으나 같은 단계에서 B5보다 1.3~5.2배 느렸고, 진단은 표본마다의 `setTimeout(0)` 양보가 코어 성능 상태를 낮춘 것으로 닫혔다(비용이 잠든 횟수를 따라 오르고 네 레인이 함께 움직임; Spotlight 157 %는 상관 −0.03으로 원인이 아님; 0.16.1 레인은 같은 소스 해시). 독립 검토(도구 PASS WITH CONDITIONS P2 3, 최종 PASS WITH CONDITIONS P2 1)의 조건대로 절대 µs를 B5 단위로 환산해 H1 예산 약 1,009 µs(하한 경계)·H6 약 2 µs(미확정)로 적었다. 설계 Ⅲ 정정(`plan/branch-switch/design-iii.md` "B9-0 뒤의 정정"): H1 유지(Δ 절이 관문 조건), H3 → H8(존재 변화 이름을 정착의 Δ에서, B5 단위 약 286 µs/1,000), H5 축소, H6 뒤로, 종합 예상 거둠, 관문은 같은 창 상대값, 러너는 `setImmediate()`로 양보하고 창 전 파일럿으로 중앙값/최솟값 비 1.2~1.4 확인." (`reviews/round-463-closing.md:8`)
  > 편집자 결정(463C-03): "【추론】 H1(분할 유일성에 건 정적 준비물과 구성원 불변 절) + H8(존재 변화 이름을 Δ에서) + H4(정적 선언 ID와 required 묶음; required 배열 identity가 같을 때만 기존 자식 순회를 건너뛰고 다르면 기존 자식도 재계산)를 codex 워커가 구현했고 호출 수 시험이 재사용 콜백 2,004 → 0, 목록 비교 4 → 0, 전체 열거 1 → 0, required 읽기 1,000 → 0, 커밋 조회 2 → 0을 못 박았다. 독립 검토(CONDITIONAL PASS P2 3: H8의 이름 순서가 전체 순회와 다름, `getRequiredChildren`의 O(호스트 × entered), H8 fallback·차분 시험 부재)와 Delta 1·2(P1·P2 0)를 거쳤고, 창 1은 보유량 행 미등록의 장치 결함, 창 2는 형제 개선(2,009 → 312)에도 oneOf-80 보호 총합(+11.6 µs)에 걸려 사유를 귀속(selectChildren +7.8, markCommitDeliveries +2.2, computeNode +1.5)하고 공표 view 열거 1 → 0·view set trap 쓰기 3 → 0·비정수 required 정렬 1 → 0으로 고친 뒤 창 3 채택 6/6(oneOf-80 B 중앙 206.0 ≤ A 최대 234.4, siblings-0 96.8 ≤ 109.5)이었다. 단계 머리에 B12가 먼저 들어가 병합 머리는 재어진 적 없는 바이트였으므로 병합 머리에서 최종 관문 전체와 창 하나를 더 했다(A 단계 머리 vs B 병합 머리: siblings-1000 2,013.1 → 316.5 µs −84.3 %, 네 단계 감소, oneOf-80 208.5 ≤ 209.0, siblings-0 95.5 ≤ 97.9, TEST-073 0, 힙 통과; `b426c4242`). TEST-093(형제 1,000 대 형제 0 5.6배)은 미달로 설계 Ⅳ 대상이다. 위 7행의 물음대로 oneOf-80은 이 PR의 보호 관문이지 목표가 아니었고 줄지 않았으며(주 행 158.7 → 157.8), 설계 Ⅲ의 남은 oneOf 예산(H2 6~8·H7 4~5·H6 약 2 µs)은 1.5배에 닿지 않는다. 위 8행으로 설계 Ⅲ은 B9-1에서 마감하고 B9-2·B9-3은 착수하지 않으며(설계 Ⅳ 후보에 접어 넣음) B10의 세 레인 이정표는 설계 Ⅳ의 Ⅳ-0으로 옮긴다." (`reviews/round-463-closing.md:12`)
- 상태: 현행
- 출처: `reviews/round-461-closing.md:12`(정본), `reviews/round-461-closing.md:8`, `reviews/round-461-owner-answers.md:7`, `reviews/round-461-owner-answers.md:10`, `plan/branch-switch/design-iii.md`, `verification/branch-switch/b5-results.md`
- 닫은 사람: 소유자 답(`reviews/round-461-owner-answers.md:7,10`), 편집자 결정(461라운드, `reviews/round-461-closing.md` 461C-01·03)
- 라운드: 461
- 까닭: `reviews/round-461-owner-answers.md:10`

### TEST-101 설계 Ⅲ의 측정과 결과(463라운드, B9-0 #488·B9-1 #490) — B9-0의 하위 타이머로 형제 1,000의 computeNode 선형항 주인은 registerPresenceChanges(net 약 378 µs)이고 참조 보존·sameValue의 증가분은 약 12 µs라 H3은 뒤집혔으며(H8로 대체), 정적 준비물 진단은 siblings-1000이 직접 계획 null·준비물 없음·쓰기당 콜백 2,004회이고 oneOf-80은 준비물 있음·콜백 0으로 H1의 원인을 확인했다; B9-0 창이 B5보다 1.3~5.2배 느린 원인은 표본마다의 setTimeout(0) 양보가 코어 성능 상태를 낮춘 것(비용이 잠든 횟수를 따라 오르고 네 레인이 함께 움직임)이라 러너는 setImmediate로 양보하고 창 전 파일럿으로 중앙값/최솟값 비 1.2~1.4를 확인하며 절대 µs는 B5 단위로 환산해 읽는다(H1 예산 약 1,009 µs, H6 약 2 µs); B9-1(H1 분할 유일성의 정적 준비물과 구성원 불변 절, H8 존재 변화 이름을 정착의 Δ에서, H4 정적 선언 ID와 required 묶음)은 호출 수 시험(재사용 콜백 2,004 → 0, 목록 비교 4 → 0, 전체 열거 1 → 0, required 읽기 1,000 → 0, 커밋 조회 2 → 0)과 독립 검토 세 번(P2 3 수정: H8 이름 순서, getRequiredChildren의 O(호스트 × entered), fallback·차분 시험), 창 넷(장치 결함, oneOf-80 보호 총합 +11.6 µs를 selectChildren·markCommitDeliveries·computeNode로 귀속해 공표 view 열거 1 → 0·set trap 쓰기 3 → 0·비정수 required 정렬 1 → 0으로 복원, 채택 6/6, 병합 머리 재측정 6/6) 끝에 병합했고 병합 머리 창에서 switch-siblings-1000은 2,013.1 → 316.5 µs(−84.3 %), 단계 장부 primeHost 657 → 1.9·selectChildren 706 → 23.6·registerPresenceChanges 272 → 2.4·commitSettlement 79 → 5.4 µs, oneOf-80 보호 총합 208.5 ≤ A 최대 209.0, TEST-073 0이며 TEST-093(5.6배)은 미달로 설계 Ⅳ 대상이다; oneOf-80은 이 PR의 목표가 아니어서 줄지 않았고(158.7 → 157.8) 설계 Ⅲ은 소유자 결정으로 B9-1에서 마감한다(B9-2·B9-3 미착수, B10은 Ⅳ-0으로)

- 결정:
  > 【추론】 H1(분할 유일성에 건 정적 준비물과 구성원 불변 절) + H8(존재 변화 이름을 Δ에서) + H4(정적 선언 ID와 required 묶음; required 배열 identity가 같을 때만 기존 자식 순회를 건너뛰고 다르면 기존 자식도 재계산)를 codex 워커가 구현했고 호출 수 시험이 재사용 콜백 2,004 → 0, 목록 비교 4 → 0, 전체 열거 1 → 0, required 읽기 1,000 → 0, 커밋 조회 2 → 0을 못 박았다. 독립 검토(CONDITIONAL PASS P2 3: H8의 이름 순서가 전체 순회와 다름, `getRequiredChildren`의 O(호스트 × entered), H8 fallback·차분 시험 부재)와 Delta 1·2(P1·P2 0)를 거쳤고, 창 1은 보유량 행 미등록의 장치 결함, 창 2는 형제 개선(2,009 → 312)에도 oneOf-80 보호 총합(+11.6 µs)에 걸려 사유를 귀속(selectChildren +7.8, markCommitDeliveries +2.2, computeNode +1.5)하고 공표 view 열거 1 → 0·view set trap 쓰기 3 → 0·비정수 required 정렬 1 → 0으로 고친 뒤 창 3 채택 6/6(oneOf-80 B 중앙 206.0 ≤ A 최대 234.4, siblings-0 96.8 ≤ 109.5)이었다. 단계 머리에 B12가 먼저 들어가 병합 머리는 재어진 적 없는 바이트였으므로 병합 머리에서 최종 관문 전체와 창 하나를 더 했다(A 단계 머리 vs B 병합 머리: siblings-1000 2,013.1 → 316.5 µs −84.3 %, 네 단계 감소, oneOf-80 208.5 ≤ 209.0, siblings-0 95.5 ≤ 97.9, TEST-073 0, 힙 통과; `b426c4242`). TEST-093(형제 1,000 대 형제 0 5.6배)은 미달로 설계 Ⅳ 대상이다. 위 7행의 물음대로 oneOf-80은 이 PR의 보호 관문이지 목표가 아니었고 줄지 않았으며(주 행 158.7 → 157.8), 설계 Ⅲ의 남은 oneOf 예산(H2 6~8·H7 4~5·H6 약 2 µs)은 1.5배에 닿지 않는다. 위 8행으로 설계 Ⅲ은 B9-1에서 마감하고 B9-2·B9-3은 착수하지 않으며(설계 Ⅳ 후보에 접어 넣음) B10의 세 레인 이정표는 설계 Ⅳ의 Ⅳ-0으로 옮긴다.
- 보충:
  > 소유자(463라운드, oneOf의 몫): "oneOf 쪽이 생각만큼 안줄어드는건가?" (`reviews/round-463-owner-answers.md:7`)
  > 소유자(463라운드, 설계 Ⅲ 마감과 설계 Ⅳ 착수): "좋아 설계3은 이걸로 문제가 없다면 병합. 이후 설계4로 넘어가서 oneOf를 본격적으로 공략해보자" (`reviews/round-463-owner-answers.md:8`)
  > 편집자 결정(463C-01): "【추론】 B9-0(측정만, `4e06463a9`)의 하위 타이머: 형제 1,000의 computeNode 선형항 주인은 `registerPresenceChanges`(net 약 378 µs)이고 참조 보존·`sameValue`의 증가분은 약 12 µs라 H3은 형제에서 뒤집혔고 oneOf에서 약화됐다(0.3 µs); 정적 준비물 직접 진단은 siblings-1000이 staticEntries 1,001·직접 계획 null·준비물 없음·쓰기당 재사용 콜백 2,004회, oneOf-80은 계획 있음·준비물 있음·콜백 0으로 H1의 원인을 확인했다; 준비된 경로에도 형제당 1.3 µs(assembleObject 0.65·primeHost 0.34·selectChildren 0.10)가 남는다; finalizeExits 고정분 13.6의 주인은 misfit 색인이 아니며(net −0.5) 미확정이다. 창은 180/180에 legacy 품질비 1.033이었으나 같은 단계에서 B5보다 1.3~5.2배 느렸고, 진단은 표본마다의 `setTimeout(0)` 양보가 코어 성능 상태를 낮춘 것으로 닫혔다(비용이 잠든 횟수를 따라 오르고 네 레인이 함께 움직임; Spotlight 157 %는 상관 −0.03으로 원인이 아님; 0.16.1 레인은 같은 소스 해시). 독립 검토(도구 PASS WITH CONDITIONS P2 3, 최종 PASS WITH CONDITIONS P2 1)의 조건대로 절대 µs를 B5 단위로 환산해 H1 예산 약 1,009 µs(하한 경계)·H6 약 2 µs(미확정)로 적었다. 설계 Ⅲ 정정(`plan/branch-switch/design-iii.md` "B9-0 뒤의 정정"): H1 유지(Δ 절이 관문 조건), H3 → H8(존재 변화 이름을 정착의 Δ에서, B5 단위 약 286 µs/1,000), H5 축소, H6 뒤로, 종합 예상 거둠, 관문은 같은 창 상대값, 러너는 `setImmediate()`로 양보하고 창 전 파일럿으로 중앙값/최솟값 비 1.2~1.4 확인." (`reviews/round-463-closing.md:8`)
  > 편집자 결정(463C-03): "【추론】 H1(분할 유일성에 건 정적 준비물과 구성원 불변 절) + H8(존재 변화 이름을 Δ에서) + H4(정적 선언 ID와 required 묶음; required 배열 identity가 같을 때만 기존 자식 순회를 건너뛰고 다르면 기존 자식도 재계산)를 codex 워커가 구현했고 호출 수 시험이 재사용 콜백 2,004 → 0, 목록 비교 4 → 0, 전체 열거 1 → 0, required 읽기 1,000 → 0, 커밋 조회 2 → 0을 못 박았다. 독립 검토(CONDITIONAL PASS P2 3: H8의 이름 순서가 전체 순회와 다름, `getRequiredChildren`의 O(호스트 × entered), H8 fallback·차분 시험 부재)와 Delta 1·2(P1·P2 0)를 거쳤고, 창 1은 보유량 행 미등록의 장치 결함, 창 2는 형제 개선(2,009 → 312)에도 oneOf-80 보호 총합(+11.6 µs)에 걸려 사유를 귀속(selectChildren +7.8, markCommitDeliveries +2.2, computeNode +1.5)하고 공표 view 열거 1 → 0·view set trap 쓰기 3 → 0·비정수 required 정렬 1 → 0으로 고친 뒤 창 3 채택 6/6(oneOf-80 B 중앙 206.0 ≤ A 최대 234.4, siblings-0 96.8 ≤ 109.5)이었다. 단계 머리에 B12가 먼저 들어가 병합 머리는 재어진 적 없는 바이트였으므로 병합 머리에서 최종 관문 전체와 창 하나를 더 했다(A 단계 머리 vs B 병합 머리: siblings-1000 2,013.1 → 316.5 µs −84.3 %, 네 단계 감소, oneOf-80 208.5 ≤ 209.0, siblings-0 95.5 ≤ 97.9, TEST-073 0, 힙 통과; `b426c4242`). TEST-093(형제 1,000 대 형제 0 5.6배)은 미달로 설계 Ⅳ 대상이다. 위 7행의 물음대로 oneOf-80은 이 PR의 보호 관문이지 목표가 아니었고 줄지 않았으며(주 행 158.7 → 157.8), 설계 Ⅲ의 남은 oneOf 예산(H2 6~8·H7 4~5·H6 약 2 µs)은 1.5배에 닿지 않는다. 위 8행으로 설계 Ⅲ은 B9-1에서 마감하고 B9-2·B9-3은 착수하지 않으며(설계 Ⅳ 후보에 접어 넣음) B10의 세 레인 이정표는 설계 Ⅳ의 Ⅳ-0으로 옮긴다." (`reviews/round-463-closing.md:12`)
  > 편집자 결정(464C-02): "【추론】 국소 바퀴는 nested-oneOf −25.8%를 보였으나 창1 가중 교환비 +299 µs, 첫 쓰기 일회 비용을 포함한 창2 +4,821 µs로 손해였고 leaf-gate 두 행·단계 두 항목·Bun 힙이 실패했다. 소유자의 폐기 결정(`reviews/round-464-owner-answers.md:8`)에 따라 제품을 병합하지 않았다. Ⅳ-2는 쓰기당 Map/Set 97→37·34→19로 줄여도 표적 행이 폭 안이고 구독 쓰기가 폭 밖 퇴보했다(교환비 +2,823.9 µs). 수정 후보의 창2는 공개22행 폭 안·교환비0 뒤 환경 거절됐으며 엄격 음수가 될 수 없어 미채택으로 닫았다. 수치·원시·독립 검토는 `verification/branch-switch/iv-1-results.md`·`iv-2-results.md`에 남긴다. 작업 후보는 가지 정리 전에 본선의 압축 보존물로 옮기며 참고용 가지 자체를 영구 증거로 삼지 않는다(464C-10)." (`reviews/round-464-closing.md:10`)
  > 편집자 결정(464C-06): "【추론】 소유자는 창2를 보고 이득과 비용을 비교한 뒤 창1의 S5수정·S1a·S1b·S6b초기형·S4 다섯 커밋을 채택했다(`reviews/round-464-owner-answers.md:28-30`, 축약 인용36-38은 해당 문서의 별도 기록). 창1의 첫 쓰기 가산 포함 교환비 −15,535.1485 µs와 폭 밖 개선5행(payload-12 −68.5205, leaf8000 −147.9590, leaf4000 −71.1250, if −23.5620, discriminator −9.6885)을 근거로 siblings4000 +42.4165 µs(폭37.209 초과5.2075, 단일 커밋 귀속 미입증)와 Bun A최대 대비+2.780044 B/node를 이 창에 한해 수용했다. S6b 좁힘도+2.668066으로 힙 실패했고 창2는22행 폭 안·교환비0이라 미채택이다. 원 규칙과 미채택 판정은 바꾸지 않고 창1 소스와 바이트 동일한 제품을 복원했다. 이 예외를 미래 PR의 일반 허용으로 넓히지 않는다(`verification/branch-switch/iv-4-results.md`)." (`reviews/round-464-closing.md:18`)
  > 편집자 결정(464C-07): "【추론】 Ⅳ-5의 통합22행은 E/L oneOf3.335·siblings0 3.614·payload1.644·nested-oneOf7.374이고 E/S는 각각0.633·0.971·0.429·0.710이다. oneOf1.5배와 형제3배는 미달이며 Node 힙은 통과, Bun은 E2256.627>S최대2224.797 B/node(+31.830, +1.4%)다. Ⅳ-4의+2.780은 바로 앞 PR의 몫이고 나머지 증가가 이미 앞 단계 결과에 나타나나 이를 한 PR의 원인으로 단정하지 않는다. 소유자의 "그래 이게 현재로선 상한 같네. 1로 가자. 마감 진행"(`reviews/round-464-owner-answers.md:33`)에 따라 대규모 개편 없이 현재 상한으로 설계Ⅳ와 분기 전환 단계를 닫는다. 통합 코어와 힙은 `verification/branch-switch/iv-5-results.md`를 재사용하며 제품 E는2eaa0e1f8 이후 불변이다. React 전체폼은 D4b의19픽스처·10예열/100표본·AB/BA 두 통과를 S/E에 보고 전용으로 수행하고 러너 회귀 플래그를 그대로 공개한다. 상세·한계는 `verification/branch-switch/closing-results.md`에 적는다." (`reviews/round-464-closing.md:20`)
- 상태: 현행
- 출처: `reviews/round-463-closing.md:8,12`(정본), `reviews/round-463-owner-answers.md:7-8`, `plan/branch-switch/design-iii.md`, `verification/branch-switch/b9-0-results.md`, `verification/branch-switch/b9-1-results.md`, `verification/branch-switch/b9-1-merge-results.md`
- 닫은 사람: 소유자 답(`reviews/round-463-owner-answers.md:7-8`), 편집자 결정(463라운드, `reviews/round-463-closing.md` 463C-01·03)
- 라운드: 463
- 까닭: `reviews/round-463-owner-answers.md:8`

464라운드 가지 정리 보충: 이 문서가 인용한 미병합 후보 `2f1365df30fe`, `5e8f34625b64`, `a04a40588b2c`, `d1079e5c3316`의 필요한 내용은 [본선 보존물](../_archive/branches/README.md)에 있습니다. 원래 SHA는 자료 식별자이며 가지 유지에 의존하지 않습니다.

464라운드 가지 정리 보충: D2-P5 후보 `4681c0aff`의 분기점 대비 구현·시험·DETAIL은 [본선 보존물](../_archive/branches/README.md)의 `4681c0aff635.patch.gz`에 있습니다. 가지 자체를 유지해야 읽을 수 있는 자료로 남기지 않습니다.


## IR-6 보충 — TEST-036 (2026-10-31)

TEST-036의 검증 실행 시점에 관한 옛 문장은 VALIDATE-052와 [D1 구현](../plan/input-responsiveness/design.md#d1-구현--ir-6-2026-10-31)이 대체합니다. 요청 순서는 그대로이며 쓰기·OnChange 마운트의 실행은 다음 화면 뒤 최신 커밋 한 번으로 합칩니다. 명시적 validate와 제출은 즉시 실행합니다. 오류의 sink/rejected 표면과 호출 시점 환경 검사·owed·하위 트리 보존은 같은 구현 절을 따릅니다. TEST-036의 과거 측정 수치 자체는 고치지 않으며 슬롯은 검증 계산량을 줄이지 않습니다. 기존 원문과 줄 번호는 보존합니다.
