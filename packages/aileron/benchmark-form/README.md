# 전체 폼 벤치마크

## 코어 브라우저 측정

먼저 저장소 루트에서 `yarn install --immutable`과
`node --import tsx packages/aileron/benchmark-form/browser-bench/core/prepareCheckout.mjs .`로
워크스페이스 빌드를 준비하고 `yarn exec playwright install --with-deps chromium`을 실행합니다.

```sh
yarn workspace @aileron/benchmark-form bench:form --runs 20 --warmup 3 --out results/core
yarn workspace @aileron/benchmark-form bench:form --baseline master --cases mount-flat-500-none,rebuild-flat-500 --runs 20 --out results/compare
```

`--cases`를 생략하면 열 가지 코어 사례를 측정합니다. 기준 ref는 독립적으로 설치·빌드한
임시 Git worktree에서 준비하며, 이미 준비한 체크아웃은 `--baseline-dir <path>`로 지정합니다.
후보는 현재 워크스페이스의 빌드 결과를 사용합니다. 매 표본은 새 페이지에서 실행하고 기준·후보·
기준 번들의 동일 바이트 대조군을 교차 측정합니다. `summary.json`, `summary.md`, `samples.json`,
`quiet.json`을 출력하며 typing 수치는 입력 한 번당 ms, 나머지는 작업 한 번당 ms입니다.

`faster`와 `slower`는 사례별 절대·상대 차이 기준을 넘긴 결과이고 `within noise`는 그 이내입니다.
기준과 대조군 차이가 허용 폭을 넘으면 한 번 재시도하고 계속 유효하지 않으면 `void`로 남깁니다.
기준 없는 측정은 `measured`로 표기합니다. 로컬에서는 외부 CPU 사용이 높으면 시작을 거부하며,
CI에서는 CPU 상태를 기록하고 계속합니다. 속도 판정은 권고이며 하네스 실패만 CI를 실패시킵니다.

GitHub의 `browser-benchmark`와 `performance-benchmarks` 워크플로는 수동 실행(`workflow_dispatch`)으로만 동작합니다.
`browser-benchmark`는 실행한 브랜치를 후보로, `baseline` 입력의 ref(비우면 기본 브랜치)를 기준으로 비교하며
`cases`와 `runs`(기본 20)를 고를 수 있습니다. GitHub 공유 실행기에서는 같은 코드도 수 % 흔들리므로
한 번의 `slower`는 다시 확인할 신호로 읽습니다.

`results/baseline.json`은 Node `guard:check`의 입력이므로 유지하고 생성 결과는 Git에서 제외합니다.

### 코어 측정 모델

표본(새 페이지) 하나는 기존 `durationMs`(마운트·재구성·첫 키는 그리기까지의 경과, 타이핑은 쓰기 20회의
capture→bubble 핸들러 평균)를 그대로 두고 `metrics`와 쓰기별 `writes`를 더합니다. 정의는
`browser-bench/core/types.ts`의 `CoreMetrics`에, 작업별 관측 가능 여부는 `browser-bench/core/coreObservability.ts`
(스크립트용 사본 `scripts/coreObservability.mjs`, 시험이 둘의 동일성을 확인)에 있습니다.

- **블로킹**: 직접 잰 값만 `blockingMs`라 부릅니다(타이핑은 쓰기 2–20의 핸들러 평균, 첫 키는 그 핸들러 시간).
  마운트·재구성에는 50 ms 미만을 재는 수단이 없어 `null`이고, Long Tasks API로 창과 겹친 작업의 원래 길이
  최댓값(`maxLongTaskMs`, 관측 없음은 "< 50 ms"이지 0이 아님)과 창 안 겹침 합(`longTaskOverlapMs`)을 적습니다.
- **검증기**: 등록 전에 플러그인의 `compile`과 검증 함수를 감싸 호출마다 동기 반환 시각과 Promise 완료 시각,
  루트 값에서 읽은 측정 경로의 값(`probeValue`)을 기록합니다. 동기 구간은 "동기/지연"이 아니라 시작 표식 뒤
  첫 rAF 전/후(`preFrameValidatorMs`/`postFrameValidatorMs`)로 나눕니다. 0.16.1의 입력 검증은 매크로태스크라
  첫 rAF 전에 돌 수 있고, 현재 엔진은 프레임 뒤 슬롯에서 돕니다.
- **화면 반영**: 측정 경로 하나(타이핑 잎 또는 로드 프로브 `/probe`)에만 `<i data-core-marker data-core-error>`를
  그리는 렌더러를 쓰고 `MutationObserver`로 속성 전이 시각을 받습니다. 타이핑은 쓰기마다 `probeValue`가 그 값과
  같은 첫 검증 실행의 완료(`validatorSettledMs`)와, 다음 키 전에 기대 상태로 전이한 시각(`feedbackCommittedMs`)을
  귀속하고 exact/censored/noChange/superseded 부류와 합쳐진 쓰기 수(`coalescedWrites`)를 셉니다. 평균은 exact 쓰기
  2–20의 조건부 평균이며 첫 쓰기는 `firstWriteMs`와 `writes[0]`에 따로 남습니다. 마운트·재구성은 `/probe` 마커의
  0→1 전이와 `/probe` 오류를 담은 첫 `onValidate`(`validationReportedMs`)를 적습니다.
- **프레임**: 작업 전에 rAF 루프를 켜고 빈 간격 10개의 중앙값을 `frameIntervalMs`로 보정합니다. 관측 중앙값에서
  60/120 Hz를 판별해 `frameIntervalNominalMs = 1000 / Hz`를 모든 표본에 기록하며, 요약의 `frames`에도 변형별
  명목 간격을 명시합니다. 두 명목 간격 어느 쪽의 ±3 ms에도 들지 않으면 관측 불가로 표본이 실패합니다.
  로컬 G3·G4는 두 주기를 허용하고 최종 CI G6는 60 Hz 및 13.7–19.7 ms를 요구합니다.
  로컬 120 Hz의 프레임 간격 수치는 CI 60 Hz 수치와 직접 비교할 수 없으며, 최종 보고서는 CI 측정만 사용합니다.
  UX 프레임 예산과 `overBudgetFrames`는 호스트 주기에 관계없이 16.7 ms 기준을 유지합니다.
  `frameBudget60`과 `frameBudget120`에는 각각 16.7 ms와 8.3 ms 기준의 `frameOverflowMs`·`overBudgetFrames`를
  담습니다. 기존 최상위 두 지표는 16.7 ms 의미를 유지하며, 요약의 `frames`에도 두 예산의 페이지별 통계를 보존합니다.
  창 안 rAF 간격 수·가장 긴 간격·16.7 ms 초과 합·초과 프레임 수는 "관측된 rAF 간격"이며 CPU 블로킹과 구별합니다.
- **종료**: 드라이버의 마지막 쓰기 완료, 마지막 값을 검증한 실행의 완료와 마커 상태 일치, 진행 중 실행 0,
  그 뒤 rAF 두 번 또는 250 ms 무활동 중 먼저 오는 것. 전체 상한 5,000 ms는 rAF와 독립된 타이머입니다.

요약(`summary.json`·`summary.md`)은 사례마다 `durationMs`의 기존 판정(`decideCoreComparison`, 임계 불변)에 더해
지표별 통계(numeric / below-threshold / mixed / not-observable)·비율·Δ·판정(지연 지표 max(2 ms, 5 %), CPU 지표
max(0.5 ms, 5 %); 지표별 대조군이 띠 밖이면 그 지표만 void), 블로킹 중앙값의 프레임 예산(마운트는 N/A), 타이핑 분포,
RAIL 기준 UX 판정을 내고, 전체에 `fixtures/core-weights.json`의 가중치로 `blockingMs`·`feedbackCommittedMs`의
가중 교환비(폭 안 행은 0, 음수가 개선)와 가중 비율(원시 가중 합의 비)을 냅니다. 범례와 표 다섯 개의 열 정의는
`browser-bench/core/helpers/renderCoreSummary/renderCoreSummary.ts`가 출력하는 범례에 있습니다.
표 4는 명목 간격과 페이지별 초과 프레임 수 중앙값을, 표 2는 Long Task 관측 표본 수를 함께 표시합니다.
표 2의 블로킹 예산은 16.7 ms(60 Hz, 주 예산)와 8.3 ms(120 Hz, 보조) 각각에 대해 프레임 대비 비율·초과 ms·
기준판도 초과했는지를 표시합니다. 요약의 `budget`은 16.7 ms, `budget120`은 8.3 ms이며, mount·rebuild는 둘 다
N/A입니다. 8.3 ms 값은 참고용이며 UX RAIL 판정과 가중 교환비에는 들어가지 않습니다.

**두 판 호환 보정.** 같은 `harness.tsx`를 0.16.1과 현재 dist로 각각 번들합니다. 필드 렌더러 속성명이 0.16.1은
`CustomFormTypeRenderer`, 현재는 `FieldRenderer`이므로 같은 마커 렌더러를 두 이름으로 모두 넘깁니다(이전 하네스는
`FieldRenderer`만 넘겨 0.16.1이 기본 렌더러로 라벨·오류 DOM을 더 그렸고, 그 비교의 마운트 수치는 기준판에
불리했습니다). 오류가 키 입력만으로 보이도록 두 판 모두 `showError={true}`를 명시하고, validate 사례의 모든 형상에
루트 프로브 잎 `probe`(`pattern '^(?:..)*$'`, 기본값 `x`)를 더해 `/probe` 오류가 정확히 하나 생기게 합니다
(`expectedInputs` +1, 두 판 동일). 평탄 타이핑 잎 `field_000`의 기본값은 빈 문자열(짝수 길이)로 두어 첫 키가 마커를
0→1로 바꿉니다.

**프로브와 검사 스크립트.** `yarn workspace @aileron/benchmark-form bench:probe`는 헤드리스 Chromium에서 80 ms 바쁜
루프를 rAF 간격과 Long Task로 잡는지, 창 밖·경계 작업을 거르는지, `takeRecords()`로 지연 항목을 거두는지, 빈 rAF 간격
중앙값이 명목 주기인지 확인합니다. 같은 실행에서 관측기 자기 실행 시간(원시), 빈 rAF 루프 바닥, 순 오버헤드
(원시 − 바닥)를 ms/s로 모두 출력하며, 순 오버헤드 ≤1 ms/s와 바닥 ≤2.5 ms/s가 모두 충족되어야
`PROBE_FRAMES_OK`를 냅니다. `scripts/checkRedTests.mjs`(시험이 단언으로 빨간지), `scripts/checkSmokeSamples.mjs
<samples.json> <summary.json>`(두 판 스모크의 모든 표본이 관측 표를 만족하는지), `scripts/checkFinalRun.mjs`
(CI 실행 아티팩트 검사), `scripts/renderFinalReport.mjs <summary.json> <samples.json>`(원시 표본에서 요약을 다시
만들어 대조한 뒤 범례와 표 다섯 개를 출력), `scripts/checkReportTables.mjs <summary.json> <samples.json> <report.md>`
(보고서의 생성 블록이 재생성 결과와 같은지)는 플레인 Node로 실행합니다.

`yarn workspace @aileron/benchmark-form bench --equivalent --mode=render --legacy=0.16.1`
은 공개 L과 작업 공간 dist E를 AB/BA로 교대하며 각 판 10예열·최소 100표본을 기록합니다.
`--out=<path>.json`에 원시 표본, `<path>-summary.json`에 중앙값·p99·비율을 저장하고 표를 출력합니다.

## 갱신 측정 계약

- `update-sync`: 각 상호작용의 `flushSync(() => applyInteraction(...))` 구간 합(ms)입니다.
- `update-settled`: 각 상호작용 시작부터 정착 장벽 완료까지의 경과 시간 합(ms)입니다.
- `update-idle-floor`: 동일 개수의 빈 정착 장벽을 별도로 실행한 시간 합(ms)입니다.
- `update-settled-net`: 표본마다 `update-settled - update-idle-floor`인 보조 추정치입니다.
  음수도 그대로 보존하며, 타이머 변동 때문에 순수 작업 시간으로 해석하지 않습니다.
- `profiler-update`와 `commits-update`: 정착까지 발생한 React Profiler의 actualDuration 합과 commit 수입니다.

정착 장벽은 **마이크로태스크 비움 → setImmediate → setTimeout(0) 한 번 → setImmediate**입니다.
`setImmediate`가 없으면 `MessageChannel`을 사용합니다. `drainTicks` 자체에는 타이머가 없습니다.
L의 `src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:112,120`
은 배치 카운터 초기화를 매크로태스크로, 이벤트 배달을 마이크로태스크로 예약합니다.
`src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:1219`의 루트 변경 배달은
`afterMicrotask`를 거쳐 타이머로 지연됩니다. 이 지연까지 지나야 다음 상호작용을 시작할 수 있습니다.
이는 현재 픽스처의 정착 정의이며 임의의 지연 타이머 전체를 기다리는 일반 목적 idle 검출기는 아닙니다.

첫 immediate를 지난 뒤 타이머를 예약하여 동기 작업이 타이머 시작 전 밀리초 경계를 넘는
영향을 분리합니다. 남는 Node의 타이머 클램프 바닥은 빈 장벽으로 따로 측정합니다.
각 상호작용의 빈 장벽은 해당 갱신 정착 뒤 실행하며 갱신 시간에 포함하지 않습니다.
마운트도 같은 장벽을 지난 뒤 update의 Profiler 수집을 시작합니다.

`render-update-wall`은 제거했습니다. D4의 그 이름은 상호작용마다 `setTimeout(0)` 두 번을
포함한 옛 정의이며 새 지표와 직접 비교하지 않습니다. `render-mount-wall`도 대기 정의 변경의 영향을 받습니다.
원시 JSON에는 commit 수도 보존합니다. 성능 표본은 값·DOM 동치의 증명이 아닙니다.
