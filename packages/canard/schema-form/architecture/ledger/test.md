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
| TEST-014 | 새로 있어야 하는 시험 PR-1 — 청사진 테이블·병합표·제거 규칙·식 컴파일러·options/presentation 병합·전략 불일치·청사진 경고 수집 | 현행 | 편집자 결정(16·17라운드, `09-landing-and-test-strategy.md:168`) |
| TEST-015 | 새로 있어야 하는 시험 PR-2 — 정착 루프 시나리오, 예산 다섯, diagnostics, 사슬 끝 throw, 나감 비움, 노드 구조 시험, active 게터 | 열림(→ `reviews/round-18-agenda.md:57`) | 편집자 결정(16·17라운드, `09-landing-and-test-strategy.md:169`), 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:57`) |
| TEST-016 | 새로 있어야 하는 시험 PR-3 — 같은 대상 규칙, 에지 소비, DisableAutomaticWrites, 개발 모드 정착 기록 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:170`) |
| TEST-017 | 새로 있어야 하는 시험 PR-4 — 디스패처, 사슬 끝 throw와 onError 계약의 core 쪽, 검증기 없음·컴파일 실패, degraded, 가드, 차등 시험, 훅 수준 바인딩 시험 | 현행 | 편집자 결정(16·17라운드, `09-landing-and-test-strategy.md:171`) |
| TEST-018 | 새로 있어야 하는 시험 PR-5 — 배열 아이템의 생김과 채움, identity, omitTrailing, 터미널 배열 행의 구조 연산 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:172`) |
| TEST-019 | 새로 있어야 하는 시험 PR-6 — 잠금 OR·표시 AND, controls.children, 조각 controls, unsetOnInactive 층 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:173`) |
| TEST-020 | 새로 있어야 하는 시험 PR-7 — e2e: 렌더 중 onChange 없음, 마운트 정착 오류, 바운더리와 싱크, onError e2e, finishInput·trim, strategy, reset, React 18 | 현행 | 편집자 결정(16·17라운드, `09-landing-and-test-strategy.md:174`), 소유자 답(`reviews/round-16-owner-answers.md:11` 답 5), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:174`; reset의 시험 목록) |
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
| TEST-032 | 벤치 시나리오 — G6의 네 상황과 새 구조 고유·메모리·14라운드 행 | 현행 | 편집자 결정(1라운드 ADR 0009 본문, `adr/0009-performance-budget-and-benchmarks.md:71`), 편집자 결정(14라운드, `adr/0009-performance-budget-and-benchmarks.md:82`) |
| TEST-033 | 구조를 확정하기 전에 잰다 — 버릴 것을 전제로 한 스파이크 | 현행 | 편집자 결정(1라운드 ADR 0009 본문, `adr/0009-performance-budget-and-benchmarks.md:86`) |
| TEST-034 | 측정 인프라 — 오늘 가진 것(패키지 벤치 일곱, benchmark-form, 모바일 성능 보고서) | 현행(기록) | 편집자 결정(1라운드 ADR 0009 본문의 관찰, `adr/0009-performance-budget-and-benchmarks.md:16`) |
| TEST-035 | 지금 빠르게 만드는 장치와 새 구조에서의 운명 | 현행 | 편집자 결정(1라운드 ADR 0009 본문, `adr/0009-performance-budget-and-benchmarks.md:35`) |
| TEST-036 | 1차 스파이크 측정 결과 — 가드 호출 수, 인터프리터형과 컬렉션 가드, 컴파일 비용, 복사 비용, 검증 비용 | 현행(기록) | 편집자 결정(1라운드 측정 기록, `reviews/round-1.md:19`) |
| TEST-037 | 2라운드 측정 — 작업 루프 프로토타입 | 현행(기록) | 편집자 결정(2라운드 측정 기록, `reviews/round-2.md:18`) |
| TEST-038 | 열림: '일정 수준'의 형태(배율인가 절대 수치인가)와 수치 | 열림(→ `reviews/round-18-agenda.md:63`) | 편집자 결정(16라운드, 답 6의 '일정 수준'을 ADR 0009 미결로 둠, `reviews/round-16-owner-answers.md:12` 반영 열), 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:63`) |
| TEST-039 | 열림: 예산의 수치 — 키 입력과 마운트, 대규모 쓰기와 배치 | 열림(→ `reviews/round-18-agenda.md:64`) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:64`) |
| TEST-040 | 열림: 문서화된 안전 임계를 올릴 것인가 | 열림(→ `reviews/round-18-agenda.md:65`) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:65`) |
| TEST-041 | 열림: 번들 크기 예산(현재 gzip 약 44KB) | 열림(→ `reviews/round-18-agenda.md:66`) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:66`) |
| TEST-042 | 인터프리터형 검증기의 지원 수준과 컴파일 예산 | 분할됨(→ TEST-065, TEST-066) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:67`) |
| TEST-043 | 대체됨: const/enum 판별식의 직접 비교는 넣지 않는다 | 대체됨(→ CONTROLS-031) | 편집자 결정(11라운드 5차 주, `adr/0009-performance-budget-and-benchmarks.md:3`) |
| TEST-044 | 릴리스 — 오늘(조사): 워크플로 둘, 손으로 올리는 판, 쓰이지 않는 changesets, 릴리스 전 점검 없음 | 현행(기록) | 편집자 결정(16라운드 조사, `09-landing-and-test-strategy.md:227`) |
| TEST-045 | 릴리스 1 — changesets 가동 — .changeset/config.json, fixed 무리 여덟과 그 근거·비용 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:15` 답 9), 소유자 답(`00-goals.md:110` C7), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`) |
| TEST-046 | 릴리스 2 — 배포는 오늘의 스크립트, 태그는 changeset tag | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`) |
| TEST-047 | 릴리스 3 — 작업 흐름은 publish-npm-packages.yml 한 파일 — 작업 다섯 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`) |
| TEST-048 | 릴리스 4 — 토큰은 기본 GITHUB_TOKEN | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`) |
| TEST-049 | 릴리스 5 — 지속 통합 시험 작업 흐름 test.yml을 새로 둔다 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`) |
| TEST-050 | 릴리스 6 — 릴리스 테스트를 다시 쓴다 — 포장된 산출물을 검사 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:15` 답 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`), 소유자 답(`reviews/round-16-owner-answers.md:11` 답 5) |
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
| TEST-063 | D-33 값 비교 비용 실험 — 객체 원천의 깊은 비교 비용, G6 예산 안이면 값 비교 채택 | 열림(→ `reviews/round-18-agenda.md:107`) | 편집자 결정(8라운드 D-33 편집자 판정, `06-conclusions.md:251`), 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:107`) |
| TEST-064 | ADR 0007의 비용 표 — 3.1판 측정, 조건부 폼 생성은 재설계가 지는 유일한 지점(1.7배, 가드 컴파일 22.4 ms) | 현행(기록) | 편집자 결정(5라운드 ADR 0007 4차 본문의 비용 표, `adr/0007-settle-cycle.md:122`) |
| TEST-065 | 인터프리터형 검증기의 지원 수준 — 폼은 장치를 더하지 않고 성능은 플러그인의 몫 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:13` 12-3), 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:67`) |
| TEST-066 | 열림: 컴파일 예산 — 폼 생성 시점의 동기 컴파일 허용량 | 열림(→ `reviews/round-18-agenda.md:67`) | 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:67`) |

## 항목

### TEST-001 검증 전략 1 — 차등 테스트: 독립 검증기와 판정 동치, 다른 구현·직렬화한 값

- 결정:
  > 1. **차등 테스트.** 임의의 (스키마, 상호작용 시퀀스)에 대해 `form.validate()`의 판정이 독립 검증기(작성된 스키마, `FormHandle.getValue()`)의 판정과 같아야 한다. 독립 검증기는 폼이 쓰는 플러그인과 다른 구현이어야 하고 값은 JSON으로 직렬화한 뒤 넣는다.
- 보충:
  > "1. **차등 테스트.** 임의의 (스키마, 상호작용 시퀀스)에 대해 `form.validate()`의 판정이 독립 검증기(작성된 스키마, `FormHandle.getValue()`)의 판정과 같아야 한다. 이슈 #342 §2의 표가 시드다. 독립 검증기는 폼이 쓰는 플러그인과 **다른 구현**이어야 하고, 값은 JSON으로 직렬화한 뒤에 넣는다. 같은 플러그인에 같은 메모리 값을 넣으면 동어반복이다(`reviews/round-1.md` §7-8)." (`02-target-overview.md:365`)
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

### TEST-014 새로 있어야 하는 시험 PR-1 — 청사진 테이블·병합표·제거 규칙·식 컴파일러·options/presentation 병합·전략 불일치·청사진 경고 수집

- 결정:
  > | PR | 시험 |
  > | --- | --- |
  > | PR-1 | 청사진 테이블 시험(조각 열거, 전순서, 노드 공유, `controls.discriminator` 변환과 끌어올림, `extras` 정적 집합, 역의존 표, 청사진 오류·경고), 병합표 시험, 제거 규칙 시험(키워드 위치만), 식 컴파일러 시험(옮긴 9파일 + 기준점 호스트. `regex.test.ts`의 `SIMPLE_EQUALITY_REGEX` 묶음은 그 상수와 함께 옛 엔진에 남긴다), `options`·`presentation` 병합의 원자(React 요소, ref 모양)·한쪽 값의 참조 이동·양쪽 객체의 쓰기 시 복사(작성자 객체를 변이하지 않음, `@winglet/common-utils`의 `merge` 선택 인자 포함), 선언 사이 `options.terminal`·렌더 계층 판정의 불일치(노드가 형상에 있는 경우마다 순서대로 정한 전략이 다르면 청사진 오류. 게이트 없는 선언끼리는 나중 승, 조각에만 선언된 노드는 조각이 모두 꺼진 경우를 비교하지 않음(조각 하나에만 선언된 노드의 인라인 `presentation.FormTypeInput`·`options.terminal`은 오류가 아님, 두 조각이 같은 노드에 서로 다른 전략을 주면 청사진 오류), 게이트 없는 선언의 `options.terminal`이 정한 노드에 조각이 인라인 입력을 더해도 오류가 아님, 판정의 없음은 앞 판정을 지우지 않음), 청사진 경고의 데이터 수집(수집기 인자, 코드·`schemaPath`·판별 칸, 소비자가 없으면 모으지 않음, 캐시 청사진의 늦은 수집이 작성 루트마다 한 번), 정적으로 아는 `controls.injectTo` 대상 없음의 청사진 오류 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:166-168`(정본), `reviews/round-16-owner-review.md:27`
- 닫은 사람: 편집자 결정(16·17라운드, `09-landing-and-test-strategy.md:168`)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:162`

### TEST-015 새로 있어야 하는 시험 PR-2 — 정착 루프 시나리오, 예산 다섯, diagnostics, 사슬 끝 throw, 나감 비움, 노드 구조 시험, active 게터

- 결정:
  > | PR | 시험 |
  > | --- | --- |
  > | PR-2 | 정착 루프 시나리오(프로토타입 v5·v6 회귀 63+108+26+52와 v7 회귀 이식), 예산 다섯과 원본 B, `diagnostics`(`'degraded'`와 `cause`, 다음 로드까지), 정착 오류의 사슬 끝 throw(모든 환경), `SetValueOption` 넷, 로드는 새 수명, 나감 비움 네 층과 하위 트리 규칙(R17-2 ㄴ: 나가는 객체·분기의 정책이 내려감, 자손의 `false`가 이김, 선언의 나감, 잠복 자손의 비움, 선언의 나감에서 `extras`를 건드리지 않음), 노드 구조 시험(행 칸 순서 시험: 모든 행의 칸 키와 순서가 같음. 겉면 멤버 목록 시험: 프로토타입 멤버 이름과 `SchemaNode/`의 `DETAIL.md` 목록의 일치. 공개 index 키 목록: 내부 통로가 `src/index.ts`에 없음. 행 고르기 함수의 조합 전수. 공개 형의 키 목록 타입 시험. `isTerminalNode`가 터미널 객체도 좁힘), `SchemaNode` 클래스 파일에 거는 린트 설정, `active` 게터 |
- 보충:
  > 18라운드 안건(열림, 설계 결정): "PR-2가 시험하는 것, 시험 대역으로 시험하는 것(대역의 계약), 뒤로 미루는 것을 가르고, 이식할 프로토타입 회귀를 기능별로 PR-2·PR-3·PR-4에 나눈다." (`reviews/round-18-agenda.md:57`)
- 상태: 열림(→ `reviews/round-18-agenda.md:57`)
- 출처: `09-landing-and-test-strategy.md:166-167,169`(정본), `reviews/round-16-owner-review.md:27`
- 닫은 사람: 편집자 결정(16·17라운드, `09-landing-and-test-strategy.md:169`), 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:57`)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:162`

### TEST-016 새로 있어야 하는 시험 PR-3 — 같은 대상 규칙, 에지 소비, DisableAutomaticWrites, 개발 모드 정착 기록

- 결정:
  > | PR | 시험 |
  > | --- | --- |
  > | PR-3 | 같은 대상 규칙(종류·문서 순서·층·전순서·정착 단위), 에지 소비, `DisableAutomaticWrites`, 개발 모드 정착 기록 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:166-167,170`(정본), `reviews/round-16-owner-review.md:27`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:170`)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:162`

### TEST-017 새로 있어야 하는 시험 PR-4 — 디스패처, 사슬 끝 throw와 onError 계약의 core 쪽, 검증기 없음·컴파일 실패, degraded, 가드, 차등 시험, 훅 수준 바인딩 시험

- 결정:
  > | PR | 시험 |
  > | --- | --- |
  > | PR-4 | 디스패처(진입당 1회, 되먹임 상한, 구독 뒤 따라잡기), 사슬 끝 throw와 `onError`, `onError` 계약의 core 쪽 시험(사슬 끝의 기록마다 발생 순서 전달과 경고 포함, 묶음의 `aggregate`와 구성 기록, 핸들러가 던질 때의 묶음(원래 드러날 값을 펼치지 않고 `details.errors`의 앞에), 핸들러 안 쓰기의 즉시 거부와 비전달, `validate()` 허용, 경고 구조 키 중복 억제(같은 노드의 다른 `allOf` 키워드는 따로), 핸들러 없는 프로덕션에서 기록·서식·정착 경고 판정 없음(할당 계측), 마운트 뒤 핸들러를 단 폼은 그 뒤 사건만 받음, 원시값 예외의 전달, 검증기 실행 실패의 기록과 `ValidationError`의 비기록), 검증기 없음의 경고(거부하지 않음, 트리마다 한 번, 같은 스키마 reset과 `setValue(V)`에서는 다시 보내지 않음)와 전체 스키마 컴파일 실패의 거부(모든 환경), `degraded` 동안 제출 경로의 거부와 `getValue()`의 허용, 커밋 스탬프와 실행 합치기, (루트, 위치) 가드와 같은 `$id` 재등록, ajv6·7·8 동기 가드, 차등 시험(독립 검증기와의 판정 동치), **훅 수준 바인딩 시험**(동기 통지와 `useSyncExternalStore`, StrictMode 이중 호출) |
- 보충:
  > "`hooks/`에는 오늘 시험이 하나도 없다. PR-4의 훅 시험이 처음이다." (`09-landing-and-test-strategy.md:176`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:166-167,171`(정본), `reviews/round-16-owner-review.md:27`
- 닫은 사람: 편집자 결정(16·17라운드, `09-landing-and-test-strategy.md:171`)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:162`

### TEST-018 새로 있어야 하는 시험 PR-5 — 배열 아이템의 생김과 채움, identity, omitTrailing, 터미널 배열 행의 구조 연산

- 결정:
  > | PR | 시험 |
  > | --- | --- |
  > | PR-5 | 배열 아이템의 생김과 채움, `push`·`remove`·`update`의 identity, `omitTrailing`, 터미널 배열 행의 구조 연산(원본 사본 위의 `push`·`pop`·`update`·`remove`·`clear`), `resolveArrayLimits`의 청사진 이동과 옮긴 시험 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:166-167,172`(정본), `reviews/round-16-owner-review.md:27`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:172`)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:162`

### TEST-019 새로 있어야 하는 시험 PR-6 — 잠금 OR·표시 AND, controls.children, 조각 controls, unsetOnInactive 층

- 결정:
  > | PR | 시험 |
  > | --- | --- |
  > | PR-6 | 잠금 OR·표시 AND, `controls.children`, 조각 `controls`, `unsetOnInactive` 층 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:166-167,173`(정본), `reviews/round-16-owner-review.md:27`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:173`)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:162`

### TEST-020 새로 있어야 하는 시험 PR-7 — e2e: 렌더 중 onChange 없음, 마운트 정착 오류, 바운더리와 싱크, onError e2e, finishInput·trim, strategy, reset, React 18

- 결정:
  > | PR | 시험 |
  > | --- | --- |
  > | PR-7 | e2e: 렌더 중 `onChange` 없음, 마운트 동안 `onChange`·`onDiagnosticsChange` 버림과 `onError`의 커밋 뒤 한 번 전달, 마운트 정착 오류의 원인별 폼 서기(공유 충돌은 대체 화면), 바운더리의 가두고 보고하기(렌더 때 보고기 읽기, 주인 없는 오류 싱크), 싱크의 세 경로(`reportError`, `ErrorEvent`가 있을 때만 보내고 취소되지 않으면 `console.error`, 서버의 `console.error`), `WeakSet`으로 바운더리가 다시 잡은 값의 핸들러 전달 한 번 거르기, 로드 객체 전달함 표지로 StrictMode에서 한 번, `degraded` 제출 거부(모든 환경, R17-1 나), `onError` e2e(받는 것·받지 않는 것 목록 대조: 검증 결과·정착 추적·호스트 `onSubmit` 예외는 오지 않음. 핸들러 유무에 따른 동작 동일(throw·거부·싱크·콘솔). 프로덕션 빌드의 경고 기록. 로드 기록의 준비 이펙트 전달과 청사진 오류 대체 화면의 전달. 루트 바운더리가 하위 트리를 버린 로드의 오류 층 기록이 렌더 실패 기록보다 먼저 감. `componentDidCatch`에서 핸들러가 던질 때 호스트 바운더리가 발화하지 않고 싱크가 한 번. 이펙트에서 연 사슬의 throw가 필드 바운더리에 다시 잡힐 때 핸들러가 한 번. 모듈 수준·`FormProvider`·폼마다의 필드 바운더리가 인스턴스 보고기에 닿음. 네이티브 submit의 `degraded` 거부가 `onError`와 싱크로 감. 서버 렌더에서 핸들러를 부르지 않고 하이드레이션 뒤 한 번), `finishInput` 신호와 `trim`(포커스 아웃 때만 자름, 입력 중에는 자르지 않음, 같은 값이면 쓰지 않음, 입력 출처 쓰기), `node.strategy`로 옮긴 `FormGroupRenderer`와 UI 플러그인 넷, 입력 출처와 Refresh, `reset`의 시험 목록(§2.6의 열여섯째, 16라운드 스웜 수렴(편집자 결정)), React 18 실행(동료 의존 `>=18 <20`인데 오늘 설치는 19뿐, 16라운드 답 5. React 18 개발 모드는 렌더 오류를 전역 오류로 다시 재생하므로 바운더리가 잡은 오류가 `window` 'error'에 두 번 닿을 수 있는 이중 보고를 확인한다) |
- 보충:
  > 소유자(16라운드 답 5): "React 18 계속 지원 | "예" | 확정" (`reviews/round-16-owner-answers.md:11`)
  > "PR-7의 시험(§4.4): 터미널 입력의 다시 마운트(`reset.pristine:267-309`의 단언 유지), 값 전체를 그리는 브랜치 입력과 빈 배열 입력은 다시 마운트되고 자식을 그리고 있는 기본 객체·배열 입력은 아님, 대체된 입력의 늦은 `onChange`·`onFileAttach` 폐기, 재생성 reset 뒤 옛 입력(컨테이너 입력 포함)의 언마운트 flush와 늦은 `onFileAttach`, 흐림 뒤 미룬 `touched`와 컨테이너 입력의 늦은 `onChange`(그 `dirty` 표시와 외부 오류 지움 포함)는 조용히 버려지고 옛 노드 참조로 한 쓰기는 `SchemaFormError`, 흐림 직후 reset과 `clearState`의 `touched`, 같은 처리기의 prop 갱신 뒤 reset(`startTransition` 안 포함), 인라인이지만 같은 스키마의 로드(노드 identity 유지)와 함수 칸 차이의 재생성·경고, `properties` 순서만 바꾼 스키마의 reset은 재생성, `batch` 안의 두 경로(reset 뒤의 읽기와 부분 쓰기의 결과가 경로와 무관함), 검증 모드 비트별 마운트·reset 검증, `onStateChange`는 바뀐 때만, `showError` 복귀, `reset(option?)`의 억제 비트 두 방향(Form 속성 `disableAutomaticWrites`와의 우선순위, 둘 다 주면 억제)과 재대조가 원래 호출의 억제 비트를 쓰는 것, `diagnostics` 재기록(로드가 `degraded`와 제출 거부를 푼다, R17-1 나), 가설 H1–H5(`reviews/raw-round16-reset.md` §4)의 실행 확인." (`09-landing-and-test-strategy.md:96`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:166-167,174`(정본), `reviews/round-16-owner-review.md:27`, `reviews/round-16-owner-answers.md:11`, `reviews/round-16-owner-review.md:56`
- 닫은 사람: 편집자 결정(16·17라운드, `09-landing-and-test-strategy.md:174`), 소유자 답(`reviews/round-16-owner-answers.md:11` 답 5), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:174`; reset의 시험 목록)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:162`

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
- 보충: 없음
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
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:223`(정본), `adr/0009-performance-budget-and-benchmarks.md:9,92`, `08-design-a-to-z.md:609`, `reviews/round-16-owner-answers.md:12`, `reviews/round-16-owner-review.md:57`, `reviews/round-18-agenda.md:68`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:12` 답 6), 편집자 결정(16라운드 도출, '통제 가능'의 뜻, `09-landing-and-test-strategy.md:223`)
- 라운드: 16
- 까닭: `reviews/round-16-owner-answers.md:12`

### TEST-028 벤치마크를 설계에 넣는 것은 소유자의 요구, 수치 예산은 아직 정해지지 않음

- 결정:
  > 상태: 제안. 벤치마크를 설계에 넣는 것은 소유자의 요구다 — "기존 설계 방향에서 잡았던 고속 동작이 깨져서 느려질까 봐 걱정이다. 벤치마크를 통해서 성능을 끌어올렸으면 한다. 설계 단계니까 이것도 설계에 넣었으면 한다." 아래의 수치 예산은 아직 정해지지 않았다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0009-performance-budget-and-benchmarks.md:5`(정본), `00-goals.md:150`, `00-goals.md:81`
- 닫은 사람: 소유자 답(`00-goals.md:150` G6)
- 라운드: 1(ADR 0009 본문)
- 까닭: `00-goals.md:150`

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
  > `adr/0009-performance-budget-and-benchmarks.md:66`의 "기존 테스트는 동작이 달라져 회귀 오라클이 못 되지만"은 뒤 라운드의 기존 시험 처분과 다르다(약 55파일의 단언을 남긴다, TEST-013). 정본이 이긴다(`09-landing-and-test-strategy.md:158-159`).

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
- 상태: 현행
- 출처: `adr/0009-performance-budget-and-benchmarks.md:73-84`(정본)
- 닫은 사람: 편집자 결정(1라운드 ADR 0009 본문, `adr/0009-performance-budget-and-benchmarks.md:71`), 편집자 결정(14라운드, `adr/0009-performance-budget-and-benchmarks.md:82`)
- 라운드: 14
- 까닭: `adr/0009-performance-budget-and-benchmarks.md:71`
- 충돌:
  > `adr/0009-performance-budget-and-benchmarks.md:78`의 "조각 전환(가드가 뒤집힐 때의 begin/complete), 선택 가드의 분기 전환"은 5차 주의 "(1) begin/complete 두 패스와 선택 가드는 사라졌다"와 다르다(옛 모델의 시나리오 이름). 5차 주가 이긴다(`adr/0009-performance-budget-and-benchmarks.md:3`).

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
  > `adr/0009-performance-budget-and-benchmarks.md:39`의 "`controls`의 식이 없는 노드는 complete 단계에서 표현식 비용이 0이어야 한다"는 5차 주의 "(1) begin/complete 두 패스와 선택 가드는 사라졌다"와 다르다(complete 단계는 없다). 5차 주가 이긴다(`adr/0009-performance-budget-and-benchmarks.md:3`).

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
- 상태: 열림(→ `reviews/round-18-agenda.md:63`)
- 출처: `adr/0009-performance-budget-and-benchmarks.md:96`(정본), `09-landing-and-test-strategy.md:223`, `reviews/round-18-agenda.md:63`
- 닫은 사람: 편집자 결정(16라운드, 답 6의 '일정 수준'을 ADR 0009 미결로 둠, `reviews/round-16-owner-answers.md:12` 반영 열), 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:63`)
- 라운드: 17
- 까닭: 없음

### TEST-039 열림: 예산의 수치 — 키 입력과 마운트, 대규모 쓰기와 배치

- 결정:
  > - **예산의 수치.** 후보: 키 입력과 마운트는 기준선 대비 잡음 범위 안(예: 5% 이내)에서 나빠지지 않는다. 대규모 쓰기와 배치는 개선을 목표로 한다. 수치는 기준선을 실제로 잰 뒤에 정하는 것이 맞다.
- 보충:
  > "성능 예산 수치(ADR 0009 미결)." (`03-mental-model.md:214`)
  > "수치를 정하는 것은 소유자 정책이다(18라운드 안건)." (`03-mental-model.md:214`)
  > "성능 예산 수치는 소유자 정책이다." (`08-design-a-to-z.md:483`)
  > "| 성능 예산 수치(ADR 0009 미결, **소유자 정책**)와 '일정 수준'의 형태·수치, 번들 예산. 기준선은 있다 | 착수 전(18라운드 안건 E) |" (`08-design-a-to-z.md:499`)
- 상태: 열림(→ `reviews/round-18-agenda.md:64`)
- 출처: `adr/0009-performance-budget-and-benchmarks.md:97`(정본), `02-target-overview.md:369`, `08-design-a-to-z.md:609`, `reviews/round-18-agenda.md:64`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:64`)
- 라운드: 17
- 까닭: 없음

### TEST-040 열림: 문서화된 안전 임계를 올릴 것인가

- 결정:
  > - **문서화된 안전 임계를 올릴 것인가.** 현재는 "필드 50개 미만 안전, 배열 아이템 30개 미만 안전"이다. 재설계의 목표를 이 임계를 몇 배로 올리는 것으로 둘 것인가.
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md:65`)
- 출처: `adr/0009-performance-budget-and-benchmarks.md:98`(정본), `adr/0009-performance-budget-and-benchmarks.md:33`, `reviews/round-18-agenda.md:65`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:65`)
- 라운드: 17
- 까닭: 없음

### TEST-041 열림: 번들 크기 예산(현재 gzip 약 44KB)

- 결정:
  > - **번들 크기 예산.** 현재 gzip 약 44KB. 검증기를 내장하지 않으므로(ADR 0004) 늘 이유는 적지만, 분석 단계와 분기 선택기가 더해진다.
- 보충:
  > "- 번들 크기도 예산이다(현재 gzip 약 44KB)." (`00-goals.md:82`)
- 상태: 열림(→ `reviews/round-18-agenda.md:66`)
- 출처: `adr/0009-performance-budget-and-benchmarks.md:99`(정본), `00-goals.md:82`, `reviews/round-18-agenda.md:66`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:66`)
- 라운드: 17
- 까닭: 없음
- 충돌:
  > `adr/0009-performance-budget-and-benchmarks.md:99`의 "분석 단계와 분기 선택기가 더해진다"는 5차 주의 "(2) 분기 선택기와 `selection` 칸은 없다"와 다르다. 5차 주가 이긴다(`adr/0009-performance-budget-and-benchmarks.md:3`).

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
  > `adr/0009-performance-budget-and-benchmarks.md:100`의 "역색인(ADR 0005 §2)을 넣으면 격차가 줄지만 폼이 `if`의 프로퍼티 이름을 읽어야 한다"는 5차 주의 "(3) 역색인은 기각되었다"와 다르다. 5차 주가 이긴다(`adr/0009-performance-budget-and-benchmarks.md:3`).

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
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:242`(정본), `09-landing-and-test-strategy.md:278`, `reviews/round-16-owner-answers.md:15`, `reviews/round-16-owner-answers.md:11`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:15` 답 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:235`), 소유자 답(`reviews/round-16-owner-answers.md:11` 답 5)
- 라운드: 16
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
- 보충: 없음
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
- 상태: 열림(→ `reviews/round-18-agenda.md:107`)
- 출처: `06-conclusions.md:398-399,401`(정본), `06-conclusions.md:254`, `07-conclusions.md:396`, `reviews/round-18-agenda.md:107`
- 닫은 사람: 편집자 결정(8라운드 D-33 편집자 판정, `06-conclusions.md:251`), 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:107`)
- 라운드: 17
- 까닭: `06-conclusions.md:254`

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
  > `adr/0009-performance-budget-and-benchmarks.md:100`의 "역색인(ADR 0005 §2)을 넣으면 격차가 줄지만 폼이 `if`의 프로퍼티 이름을 읽어야 한다"는 5차 주의 "(3) 역색인은 기각되었다"와 다르다. 5차 주가 이긴다(`adr/0009-performance-budget-and-benchmarks.md:3`).

### TEST-066 열림: 컴파일 예산 — 폼 생성 시점의 동기 컴파일 허용량

- 결정:
  > - **컴파일 예산.** 폼 생성 시점의 동기 컴파일을 얼마까지 허용하는가.
- 보충:
  > "예산 수치가 있어야 판정할 수 있다." (`07-conclusions.md:474`)
- 상태: 열림(→ `reviews/round-18-agenda.md:67`)
- 출처: `adr/0009-performance-budget-and-benchmarks.md:102`(정본, TEST-042에서 분할), `reviews/round-18-agenda.md:67`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:67`)
- 라운드: 17
- 까닭: 없음
