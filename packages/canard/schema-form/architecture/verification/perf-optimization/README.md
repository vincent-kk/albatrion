# 성능 측정 기준과 최종 기록

8단계(검토와 성능)의 측정 기준, 최종 기록, 측정 도구의 색인이다. 성능의 계약은 원장(`../../ledger/test.md` 의 TEST-027 등)이 정본이고, 계획은 [`../../plan/perf-optimization/`](../../plan/perf-optimization/request.md), 벤치마크 계획의 결정은 [ADR 0009](../../adr/0009-performance-budget-and-benchmarks.md)다. 445라운드 정리에서 원자료(실행 로그·JSON·작업 지시서)는 지웠고, 이 문서가 가리키는 기록과 도구는 남겼다.

## 1. 최종 기록

### 8단계 최종 측정(443b, 제품 `a63db97c2`, 2026-10-22~23)

아래는 최종 PR #445 본문의 성능 절을 그대로 옮긴 것이다. 그 뒤의 제품 변경(#451 과 플러그인·내장 fallback 수정 #452~#457·#460)은 이 창에서 재지 않았고, #451 의 변화는 수정 PR 의 20행 창에서 따로 쟀다(`../../reviews/round-444-closing.md` 444C-06). 전체 47행·38행 표의 복구본은 [final-measure-443b.md](./final-measure-443b.md)에 있다.

#### 성능 — 코어(Node 26 production, `@canard/schema-form@0.16.1` 대 `a63db97c2`)

- 방법: 프로세스마다 20회 예열 + 100표본, 세 실행 최소값의 중앙값. 282 프로세스·28,200 표본. 단일 창, A′ 보정 없음.

| 장면 | 행 | 0.16.1 ms | 최종 ms | Δ % |
| --- | --- | --- | --- | --- |
| 마운트 | oneOf-80 | 0.4800 | 2.1289 | +344 |
| 마운트 | flat-1000 | 2.3498 | 2.8236 | +20 |
| 마운트 | nested-d6-f4 | 7.8131 | 17.1269 | +119 |
| 단일 입력 | flat-1000 | 0.5235 | 0.0375 | −93 |
| 단일 입력 | nested-d6-f4 | 0.0335 | 0.0742 | +121 |
| 분기 전환 | oneOf-80 | 0.0586 | 0.2276 | +288 |
| 일괄 입력 | flat-2000 | 2.3828 | 3.5065 | +47 |
| 일괄 입력 | nested-d6-f4 | 2.9437 | 10.4355 | +254 |

- 47행 요약: 0.16.1 보다 짧은 행 3(단일 입력 flat-500 −89 %, flat-1000 −93 %, flat-2000 −66 %), 긴 행 44.
- 분기 전환 N=5 와 N=80: 0.22-0.31 ms(O(N) 해소, 상수 배 잔존).
- 441라운드 `47ad92cf3` 대비(교차 창): 분기 전환 oneOf-80 0.6455 → 0.2276 ms(−65 %), 일괄 nested-d6-f4 15.57 → 10.44 ms(−33 %), 마운트 oneOf-80 2.68 → 2.13 ms(−20 %).
- 결함 수정 전 `dc8490b02` 대비(교차 창, 48행): ≤−5 % 19행, ≥+5 % 11행, 그 사이 17행. 느려진 11행은 모두 0.1 ms 미만의 oneOf-5·10 행.

#### 성능 — React 전체 폼(jsdom, 0.16.1 대 최종)

- 방법: 같은 프로세스에서 두 판을 AB/BA 로 import, 각 판 10회 예열 + 100표본, 두 통과의 중앙값. 38행.
- 짧은 행 9: 배열 마운트 −11 % - −22 %, 배열 갱신 −15 % - −87 %(array-1000 28.2-40.8 → 5.3 ms), nested-d5·flat-500 마운트 −10 % - −16 %.
- 긴 행 29: oneOf 마운트 +39-49 %(5.0 → 7.0-7.8 ms), 소형 폼 갱신 +48-58 %, 배열 stress 갱신 +8-37 %, computed +25-32 %.
- DOM 입력 1회(보조): 대부분 +0-4 %(3.2-3.6 ms), array-1000 28.3-29.3 → 5.7-5.8 ms(−80 %), oneOf 전환 3.4-3.5 → 4.8-5.0 ms(+37-44 %), nested-d5 +37 %, computed +11-28 %.


### 그 밖의 최종·기준 기록

- 기준 측정: [baseline.md](./baseline.md)(M0, 루프 시작 `c59ba1363`, 재현 절차 포함), [baseline-430-results.md](./baseline-430-results.md)(430라운드 기준).
- 종합 재측정: [m3-results.md](./m3-results.md)(M3, 434라운드). 우선순위와 열린 행: [priority.md](./priority.md), [size-diagnosis-437-results.md](./size-diagnosis-437-results.md), [open-rows-437-results.md](./open-rows-437-results.md).
- 가설·PR 별 결과: 이 디렉토리의 `*-results.md`(L3 다섯 가설, 가설 N·F, 결정 58·61·62 의 PR, 일괄 setValue 수정 2 등). 진단: `*-diagnosis-*.md`.
- 7단계 최종: [../07-switch/performance.md](../07-switch/performance.md), [../07-switch/profile-156-final.md](../07-switch/profile-156-final.md), `../07-switch/profile-111-final/`, `../07-switch/profile-136k-final/`, [../07-switch/remeasure-86c02.md](../07-switch/remeasure-86c02.md), [../07-switch/bench-legacy-baseline.md](../07-switch/bench-legacy-baseline.md).
- 2단계 기준선: [../02-foundation-and-blueprint/baseline/REPORT.md](../02-foundation-and-blueprint/baseline/REPORT.md), [../02-foundation-and-blueprint/blueprint-measure.md](../02-foundation-and-blueprint/blueprint-measure.md).

## 2. 측정 기준

### 채택 규칙(443라운드)

- 크기 가족별 추세선: 행 중앙값에 최소제곱 직선, 폭 (다) = max(|slope(A)−slope(A′)|, A·A′ 완전 라운드 기울기 최대 편차)를 넘는 같은 부호의 기울기 변화만 입증.
- 절편만 낮아지는 변경도 같은 폭으로 채택. 입증(느림) 행이 있으면 되돌림. 재측정으로 판정을 뒤집지 않음.


### 측정 원칙(368·369·370·400C-02·406·407C-01 라운드)

- 0.16.1(npm 공개판)은 비교의 참조일 뿐 목표가 아니다.
- 가설마다 지우는 비효율 하나를 이름 짓는다. 추가 코드가 제거하는 비효율보다 크면 폐기하되, 이는 줄 수가 아니라 비례의 문제다(O(키 수) 반복 제거에 순증 몇 줄은 허용, 분기 없는 모양 우선).
- 상수 깎기 캐시·전역 상태·같은 쓰기 판정 밖의 재사용은 금지한다(인수 넘김은 허용). 공개 API 와 공개 이름 수는 바꾸지 않는다.
- 조용한 창에서 Node·Bun 두 바퀴를 번갈아 재고 min/max 와 런타임 버전을 적는다. 창 안의 전후 비율만 유효하고 창 사이의 절대값은 비교하지 않는다(0.16.1 열이 창마다 +19 % 흔들린 전례).
- 합친 중앙값이 바퀴별 부호와 어긋나면 악화라고 말하지 않는다. 바퀴 범위가 0 을 걸치면 "차이 없음"으로 적고 개선을 주장하지 않는다. 계측 비율은 비율일 뿐 절감량이 아니며, 효과가 안 보이면 "측정 불가"로 적는다.
- 호출 수 단언은 정확한 값이 아니라 상한으로 둔다.
- 옛 판보다 느린 항목은 이유와 수치를 붙여 소유자 수용을 받아야 병합한다(TEST-027).

### 성능 변경의 정상동작 증거

성능 변경은 "관측이 같다"가 증명되어야 병합한다.

- 네 관문: `typecheck`, `lint`, `test`(unit·render·react18·production·storybook 다섯 프로젝트), `build`. 기존 시험의 기대값 변경은 0건이어야 하며, 바뀐 기대가 필요하면 성능 변경이 아니라 사양 변경이므로 멈추고 소유자에게 묻는다.
- 전후 배달 비교: 수정 전 dist 와 수정 후 dist 를 같은 장면 묶음(`first-batch/` 러너와 각 fractal 의 `__tests__/fixtures/compare*` 픽스처)에 돌려 값·이벤트 종류와 순서·payload·revision·노드 참조·잠복 원본·호출자 입력 불변·선언 밖 값 순서의 차이가 0 이어야 한다. 차이가 있으면 원장 항목으로 요구 관측인지 부산물인지 판정한다.
- 새 시험: 바뀐 규칙 한 문장을 고정하는 시험(수정 전 구현에서 실패)과 호출 수 상한 시험을 해당 fractal 의 `__tests__/` 에 둔다.
- 독립 검증: 다른 모델의 검증자가 읽기 전용으로 동치·관측·계약·범위·시험·측정 보고를 path:line 근거로 판정한다.

## 3. 측정 도구

- [run-baseline.mjs](./run-baseline.mjs): M0 기준선을 재는 러너. 재현 명령은 [baseline.md](./baseline.md)의 재현 절에 있다.
- `probe-*.ts`: 쓰기 경로·terminal mode·배열 동사·조각 토글·게이트 형제·if 호스트 형제의 계측 탐침(옛 판 대조용 `probe-legacy-*` 포함). 결과는 [write-paths-measurement.md](./write-paths-measurement.md), [array-verbs-measurement.md](./array-verbs-measurement.md), [mount-breakdown-results.md](./mount-breakdown-results.md)에 있다.
- `first-batch/`: 전후 배달 비교 러너와 첫 묶음 측정([first-batch-measurement.md](./first-batch-measurement.md)). `first-batch/b-a2/bench-common.mjs` 는 패키지의 `bench/distEngine/check-mount-readiness.mjs` 가 쓴다.
- 패키지의 `bench/`: 옛 판 대조 벤치(`bench/legacy-compare/*.bench.ts`, `vitest.bench.config.ts`)와 dist 엔진 적재(`bench/distEngine/`), 7단계 측정 스크립트(`bench/scripts/`).
- 8단계 최종 측정(443b)의 러너와 원자료는 gitignored 작업 폴더에 있었고 2026-10-26 에 사라졌다. 같은 방법의 재측정은 9단계 릴리스 전 벤치 재실행(LANDING-096)에서 한다.
