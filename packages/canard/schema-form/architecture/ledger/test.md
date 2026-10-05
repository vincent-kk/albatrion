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
  > 편집자 결정(93C-01): "【추론】 비교의 뜻은 두 판이 같은 일을 하는 데 드는 시간을 같은 조건에서 견주는 것이다(86C-01). 옛 판은 호출이 돌아온 뒤 비동기로 정착을 마저 하므로 그 몫을 뺀 옛 값은 일의 일부만 잰 것이고, 그것을 분모로 쓰면 새 판이 실제보다 느리게 나온다 — 그래서 85C-01의 판정은 86C-02 재측정이 쓴 방법(단계별 배타 시간의 합 active, 옛 판의 비동기 정착 포함, 타이머 대기 제외)으로 한다. TEST-026의 조건(워밍업 10회 이상, 표본 100회 이상, 중앙값과 p99, 명시적 수집)은 그대로다. 여기에 92라운드가 변경의 앞뒤 비교에 인정한 원칙을 옛 판 대 새 판에도 적용한다: 두 판을 같은 세션, 같은 Node 판에서 번갈아 재고 그 쌍의 중앙값 비로만 판정하며, 다른 날이나 다른 런타임에서 잰 옛 값은 분모로 쓰지 않는다(기계 상태와 런타임의 차이가 섞인다 — 이번에 v24의 옛 값과 v26의 새 값이 섞였다). 런타임 판은 판정표에 적는다. 무계측 동기 측정은 계측 비용이 없어 변경 하나의 효과를 가르는 데 좋으므로 변경 앞뒤(H 대 W)의 인과 비교에 쓰고, 옛 판 대비 판정에는 쓰지 않는다 — 보고서는 두 표를 제목으로 구별하고 한 표의 수치를 다른 표의 판정에 옮기지 않는다. 계측에는 치우침이 있을 수 있다: 배타 시간의 합은 계측된 호출마다 측정 비용이 얹히므로 호출이 많은 판이 불리하다. 그래서 판정표에 판마다 계측된 호출 수와 빈 구간으로 잰 호출당 계측 비용을 적고, 그 보정으로 판정이 바뀌는 행(목표 선의 보정 폭 안에 있는 행)은 표시해 두 값을 함께 보인다 — 방법을 바꿔 수치를 맞추는 것이 아니라 치우침의 크기를 드러내는 것이다. 91라운드의 분기 폼 기준(분기 수에 따른 증가, 단계별 중복)도 같은 방법의 단계별 값으로 본다. 07은 (i) 커밋 뒤 이 방법으로 공식 판정표를 새로 만들고, (ii)의 보고서에서 "7행 가운데 둘 충족"은 방법이 다른 대조였다는 정정을 적는다." (`reviews/round-93-closing.md:9`)
  > 편집자 결정(94C-01): "【추론】 93C-01은 계측의 치우침을 "호출이 많은 판이 불리하다"고 보아 그 크기를 적게 했고, 재어 보니 호출이 많은 쪽은 옛 판이었다(마운트에서 스물일곱 배쯤). 그러므로 배타 시간의 합은 옛 판에 호출마다 측정 비용을 더 얹어 새 판을 실제보다 빠르게 보이게 하며, 그 폭은 판정을 뒤집을 만큼 크다(flat-500 마운트 1.45배가 보정하면 2.25배). 성능은 주장하지 않고 측정한다는 원칙(GOAL-011)과 느린 행을 넘기지 않는다는 소유자의 지시(84라운드, 그리고 "생략하거나 대충 할 수 없다")에 비추어, 자기에게 유리한 치우침을 안은 수치로 충족을 적을 수 없다. 그래서 정한다. (가) 지금부터 코어 행은 보정한 배율로도 목표 안일 때만 충족이고, 원 배율만 충족인 행은 미달이다 — 93C-01의 "보정 뒤 결과로 공식 판정을 바꾸지 않는다"는 읽기를 이 결정이 바꾼다. (나) 치우침이 없는 방법을 만든다: 계측 없이, 호출부터 그 호출이 낸 마이크로태스크 큐가 빌 때까지를 한 표본으로 재면 옛 판의 비동기 정착이 들고 타이머 대기는 빠지며 호출마다의 측정 비용이 없다; 07은 옛 판의 뒤이은 정착이 마이크로태스크만으로 끝나는지(검증기 끔, 구독 없음의 조건에서) 확인해 이 종단 측정을 만들고, 타이머에 걸리는 몫이 있으면 그 몫과 까닭을 적어 물음으로 올린다. 종단 측정이 서면 그것이 85C-01의 공식 판정 수치이고(같은 세션 번갈아, TEST-026의 조건), 배타 시간의 합은 단계별로 원인을 가르는 진단의 자료다 — 진단의 단계 값에도 판마다의 호출 수와 보정을 함께 적는다. (다) React 층은 계측 구간을 더하지 않은 프로파일러 값이라 이 치우침이 없으므로 그대로다. 이번 판정표의 코어 충족 수는 원 12행이 아니라 보정한 7행으로 읽는다." (`reviews/round-94-closing.md:9`)
  > 편집자 결정(94C-02): "【추론】 85C-01이 React 층의 갱신에 건 1.0배는 "옛 판보다 느려지지 않는다"는 뜻이고, 중앙값의 비가 1.004인 행과 0.996인 행을 가르는 것은 측정의 잡음이지 엔진이 아니다(이번 표의 미달 7행은 1.004–1.056배이고 같은 묶음의 충족 행에 0.956·0.972가 있다). 93C-01이 판정을 "같은 세션에서 번갈아 잰 쌍"으로 정했으므로 그 쌍의 회차(옛 → 새, 새 → 옛, 옛 → 새)마다 배율을 내어, 세 회차가 모두 1.0을 넘으면 미달, 방향이 갈리면 동률로 충족, 모두 1.0 이하이면 충족으로 적는다. 다른 목표(1.2배, 1.5배)의 행은 선에서 떨어진 정도가 잡음보다 크면 중앙값 비로 족하되, 선의 위아래로 회차가 갈리는 행은 같은 규칙을 따른다. 판정표에 회차별 배율 열을 더한다." (`reviews/round-94-closing.md:16`)
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
- 보충: 없음
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
- 보충: 없음
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
