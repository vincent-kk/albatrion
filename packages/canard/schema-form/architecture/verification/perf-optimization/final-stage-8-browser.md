# 8단계 최종 브라우저 측정 — 0.16.1 대비

공개판 0.16.1(`7b49d62c73c3204f61b1ff67a3646d8ecc38bf06`)과 [PR #545](https://github.com/vincent-kk/albatrion/pull/545)의 head `b039c3187`을 비교했습니다. GitHub Actions `ubuntu-24.04`의 헤드리스 Chromium에서 열 사례를 변형별 3페이지 예열하고 20페이지 측정했으며, 명목 간격 열의 16.667 ms가 60 Hz를 확인합니다. 최종 기록은 [실행 41871054743](https://github.com/vincent-kk/albatrion/actions/runs/41871054743)이며, 측정 하네스는 [PR #539](https://github.com/vincent-kk/albatrion/pull/539), 워크플로의 힙·시간 한도 보정은 [PR #540](https://github.com/vincent-kk/albatrion/pull/540)에 해당합니다. 이번에 측정한 8단계 성능 패치는 [PR #544](https://github.com/vincent-kk/albatrion/pull/544)와 [PR #545](https://github.com/vincent-kk/albatrion/pull/545)입니다. 스테이지 끝 `9c4e9c03d`에는 `useTerminalChildren`의 헬퍼를 인라인한 리팩터링 `aff099181`도 포함되지만, 이 변경은 측정 빌드에 포함되지 않았습니다. `rebuild-flat-500`은 0.16.1에 `rebuild`가 없어 비교에서 제외했습니다.

러너 속도는 실행마다 다릅니다. [실행 41855038988](https://github.com/vincent-kk/albatrion/actions/runs/41855038988)의 평탄 비검증 마운트는 두 빌드 모두 99.000 ms였지만 이번 기준판은 148.350 ms였습니다. 따라서 성능 비교는 같은 실행 안의 비율로 한정하며, 실행 사이 절댓값을 개선량으로 해석하지 않습니다. 프레임 대기를 포함한 경과 시간은 표본 분포에서 148, 165, 182, 198, 215 ms처럼 프레임 단위로 갈립니다.

## 측정 모델

`durationMs`는 기존 정의를 유지합니다. 마운트·첫 키는 프레임 대기를 포함한 경과 시간이며, 반복 타이핑은 20회 쓰기의 핸들러 시간 평균입니다. `blockingMs`는 네이티브 capture부터 bubble까지 직접 잰 핸들러 시간으로, 반복 타이핑은 쓰기 2–20의 평균이고 첫 키는 단일 쓰기입니다. 마운트의 직접 블로킹은 측정하지 못하므로 null이며, `maxLongTaskMs`는 관측 창과 겹친 Long Task의 원래 길이 중 최댓값이고 `longTaskOverlapMs`는 창 안에 겹친 부분의 합입니다. API 문턱인 50 ms 미만은 관측할 수 없으며, 관측 없음은 0을 뜻하지 않습니다. `preFrameValidatorMs`와 `postFrameValidatorMs`는 작업 또는 쓰기 뒤 첫 rAF를 기준으로 검증기 컴파일·실행의 동기 구간을 나눕니다. `validatorSettledMs`는 시작부터 해당 값의 검증기 Promise가 완료될 때까지이며, 오류 배분·React 커밋까지의 지연은 포함하지 않습니다. `feedbackCommittedMs`는 측정 경로 마커의 기대 상태 전이가 관측된 시각까지입니다. 마운트는 `/probe` 오류의 첫 마커 전이를 사용하고, 쓰기는 같은 값의 검증 실행이 완료되었으며 capture 이후 다음 capture 이전에 기대 상태 전이가 있어야 `exact`로 귀속합니다. 마지막 쓰기의 상한은 관측 창 끝입니다. 검증되지 않은 쓰기는 `superseded`, 이미 기대 상태인 쓰기는 `noChange`, 그 밖에 상한 안에 전이가 없으면 `censored`이며, 반복 피드백은 쓰기 2–20 중 `exact`인 쓰기의 조건부 평균입니다. 두 타이핑 사례는 두 판 모두 400회 중 400회가 `exact`이고 반복 구간은 380회이므로 이번 비교의 부류 수는 같습니다. 프레임 표는 관측된 rAF 간격과 초과 합·횟수를 16.7 ms와 8.3 ms 예산으로 제시하며 CPU 블로킹과 구별합니다. UX 판정은 RAIL의 입력 처리 50 ms·반응 100 ms와 하네스 자체의 프레임·마운트 기준을 사용합니다. 가중 교환비는 `Σ(가중치 × (후보 − 기준)/k)`이고, 모든 행의 `k = 1`이며 잡음 폭 안의 기여는 0입니다. 가중 비율은 포함 행의 가중 후보 합을 가중 기준 합으로 나눈 별도 수치입니다.

가중치는 하네스의 `fixtures/core-weights.json`을 따릅니다. 배열 타이핑의 빈도는 실제 사용자 계측이 아니라 평탄 타이핑의 5분의 1이라는 하네스 가정입니다.

| 사례                                   | 가중치 |   k | 근거                                                                           |
| -------------------------------------- | -----: | --: | ------------------------------------------------------------------------------ |
| mount-flat-500-none                    |      1 |   1 | 세션당 마운트 한 번을 가정하며 Node 마운트 행과 맞춥니다.                      |
| mount-flat-500-validate                |      1 |   1 | 세션당 마운트 한 번을 가정하며 Node 마운트 행과 맞춥니다.                      |
| mount-if-flat-500-none                 |      1 |   1 | 세션당 마운트 한 번을 가정하며 Node 마운트 행과 맞춥니다.                      |
| mount-if-flat-500-validate             |      1 |   1 | 세션당 마운트 한 번을 가정하며 Node 마운트 행과 맞춥니다.                      |
| mount-nested-d5-f4-validate            |      1 |   1 | 세션당 마운트 한 번을 가정하며 Node 중첩 마운트 행과 맞춥니다.                 |
| mount-array-1000-validate              |      1 |   1 | 세션당 마운트 한 번을 가정하며 Node 마운트 행과 맞춥니다.                      |
| type-flat-500-validate-nonburst        |  5,000 |   1 | FieldProxy 구독을 거치는 경로이므로 Node의 구독 타이핑 행과 맞춥니다.          |
| type-array-1000-validate-nonburst      |  1,000 |   1 | 대응하는 Node 행이 없으므로 평탄 타이핑의 5분의 1 빈도를 가정합니다.           |
| first-key-flat-500-validate            |      1 |   1 | 세션당 첫 키 한 번의 일회성 비용을 별도 행으로 둡니다.                         |
| first-key-flat-500-validate-after-load |      1 |   1 | 로드 검증 완료 뒤 첫 키 한 번을 즉시 입력과 같은 가중치로 별도 보고합니다.     |
| rebuild-flat-500                       |      5 |   1 | Node 일괄 입력 행과 맞추지만 0.16.1에 rebuild가 없어 이번 비교에서 제외합니다. |

## 결과 요약

8단계는 0.16.1 대비 평탄·중첩·배열 검증 마운트와 반복 타이핑의 경과를 개선했고, 배열 타이핑의 블로킹을 크게 줄였습니다. 아래 값은 페이지별 측정값의 중앙값이며, 뒤의 느린 행은 작업량 차이와 측정 창·프레임 경계를 함께 기록합니다.

- 중첩 검증 마운트는 548.200 → 465.150 ms(−15.1 %), 배열 검증 마운트는 731.750 → 664.900 ms(−9.1 %), 평탄 검증 마운트는 265.000 → 248.400 ms(−6.3 %)로 빨라졌습니다.
- 평탄 타이핑의 경과는 1.480 → 1.365 ms(−7.8 %), 배열 타이핑의 경과는 7.695 → 1.572 ms(−79.6 %)로 줄었습니다. 배열 타이핑의 블로킹도 7.284 → 1.232 ms(−83.1 %)로 줄었습니다.
- 즉시 첫 키의 블로킹은 −25.2 %이며, 로드 검증 완료 뒤 첫 키의 경과는 77.450 → 74.700 ms(−3.6 %)로 잡음 폭 안입니다.
- 가중 블로킹 비율은 0.523입니다. 마운트의 직접 블로킹은 관측 불가로 제외되므로 이 비율을 마운트 포함 총 블로킹으로 일반화하지 않습니다. 가중 피드백 비율은 1.060입니다. 이 비율은 잡음 폭 안의 행도 포함하므로, 증가분에는 평탄 타이핑 피드백 15.421 → 16.061 ms(+4.1 %, 가중치 5,000)와 배열 타이핑 피드백 23.321 → 26.434 ms(+13.3 %, 가중치 1,000)가 비슷한 크기로 기여합니다. 잡음 폭 안의 행을 0으로 둔 가중 피드백 교환비 +2,974,808 µs는 배열 타이핑 행이 주도합니다. 배열 타이핑 행의 블로킹은 −83.1 %이고, 타이핑과 두 첫 키 행의 UX 블로킹·피드백 판정은 두 판 모두 `ok`입니다. `ok` 판정과 피드백의 상대 지연은 함께 남깁니다.

느린 행의 최종 해석은 다음과 같습니다.

- `mount-if-flat-500-none`은 148.150 → 181.800 ms(+22.7 %)입니다. 후보 표본은 182 ms가 12개, 198 ms가 7개, 215 ms가 1개이고, 기준은 132 ms가 8개, 148–149 ms가 12개입니다. 두 판의 작업량은 같지 않습니다. 0.16.1의 `src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap/utils/flattenConditions.ts`는 `then.required`를 읽은 `thenRequired?.length`가 참일 때만 then-entry를 추가합니다. 이 fixture에는 해당 required가 없어 조건 맵을 만들지 않고 `minLength` overlay도 적용하지 않지만, 현재 엔진은 조건을 평가하고 overlay를 적용합니다. PR #544는 자식 전체 선택의 반복을 줄였고 PR #545는 노드별 빈 Map 할당을 제거했습니다. 최종 실행은 함수별 비용을 계측하지 않았습니다. 수정 빌드의 로컬 120 Hz 계측에서는 flat 대비 동기 엔진 차이 24.40 ms 중 7.90 ms가 조건 가드 컴파일이었고 나머지 대부분은 일반 정착 경로였습니다. 검증이 꺼져 있으면 조건 가드 컴파일이 AJV 초기화를 혼자 부담합니다. 하네스의 compile 계수는 `compileGuard`를 세지 않으므로, 원인 기록에서 none 표본의 compile 0회를 근거로 가드 컴파일을 배제한 판단은 이 계측으로 바로잡습니다. 검증기 없는 literal guard evaluator와 전용 root loader는 설계·리뷰했지만, 공개 validator-plugin 계약 변경과 세 번째 마운트 경로가 필요하므로 8단계에 채택하지 않았습니다. 조건 처리를 건너뛴 버전과 비교할 때 생기는 격차를 위해 그 복잡도를 추가하지 않기로 했습니다.
- `mount-flat-500-none`은 148.350 → 164.900 ms(+11.2 %)입니다. 후보는 148–149 ms가 9개와 165 ms가 11개이고, 기준은 148–149 ms가 18개와 165 ms가 2개로 프레임 경계에서 갈렸습니다. 가장 긴 Long Task는 71.000 → 102.500 ms입니다. 이 파일의 이전 기록인 [실행 41804126885](https://github.com/vincent-kk/albatrion/actions/runs/41804126885)에서는 같은 사례가 148.050 → 148.300 ms로 잡음 폭 안이었습니다. 분기 없는 트리는 `getGateRegistry`가 `capabilities.branchless`에서 빈 registry를 반환하고 `buildFixedFirstLoadPlan`도 같은 플래그에서 `undefined`를 반환하므로, 두 8단계 패치의 변경 경로에 진입하지 않습니다. 이번 러너에서 한 프레임 차이가 관측된 것으로 기록하며, 이 관측을 패치의 측정된 원인으로 귀속하지 않습니다.
- `mount-if-flat-500-validate`는 시도 2에서 265.000 → 281.550 ms(+6.2 %)로 한 프레임 늦었습니다. 후보는 검증기 작업을 첫 프레임 뒤로 옮겼으며 첫 프레임 전 검증기는 73.200 → 0.000 ms, 뒤는 13.300 → 82.200 ms입니다. 가장 긴 Long Task는 167.500 → 139.000 ms로 줄었지만 창 안 합은 167.500 → 227.000 ms로 늘었습니다. 단일 작업 단축을 총 작업 감소로 해석하지 않습니다.
- `first-key-flat-500-validate`는 147.200 → 188.900 ms(+28.3 %)입니다. 첫 paint 직후 입력 창에 예약된 로드 검증 컴파일이 겹칩니다. 같은 키를 로드 검증 완료 뒤에 보내는 행의 경과는 잡음 폭 안이고, 즉시 입력과 로드 완료 뒤 입력의 블로킹은 모두 0.16.1보다 작습니다.

## 해석과 열린 질문

[세 회귀 원인 분석](./stage-8-regression-cause.md)의 수정·재측정 항목은 PR #544의 구조 고정 루트 if 첫 로드와 PR #545의 지연 할당, 이번 최종 실행으로 닫습니다. 루트 if 비검증 비교는 0.16.1이 fixture의 조건 처리를 건너뛴다는 사실로 작업량 차이를 확인했고, 검증 마운트는 첫 프레임 전후의 작업 이동을 구분했습니다. 첫 키는 즉시 입력과 로드 완료 뒤 입력을 함께 측정해 컴파일 중첩을 분리했으며, 로컬에서 남았던 입력 블로킹·피드백 비용은 이번 CI의 로드 완료 뒤 행에서 회귀로 확인되지 않았습니다.

알려진 잔여 비용은 검증이 꺼진 루트 if에서도 조건 가드를 컴파일하고 일반 정착을 수행한다는 점이며, 로컬 계측에서 그 구성을 확인했습니다. 조건을 올바르게 적용하는 현재 동작을 유지하고, 공개 validator-plugin 계약과 마운트 경로를 늘리는 비용을 피하기 위해 이 비용을 8단계에서 수용합니다. 평탄 비검증 마운트의 가장 긴 Long Task 증가(이번 71.000 → 102.500 ms, PR #544 이전 후보의 실행 41804126885에서 67.000 → 94.500 ms)는 두 패치 이전부터 있던 차이이며 원인을 확정하지 않은 항목으로 남깁니다.

## 이전 비교의 렌더러 편향 공개

이전 0.16.1 비교인 실행 41651117812와 41605464351 및 이를 인용한 IR-10 결과와 입력 반응성 설계의 F9 기록은 입력만 그리는 통과 렌더러를 `FieldRenderer`로만 전달했습니다. 0.16.1은 그 속성을 사용하지 않아 라벨·오류 DOM이 더 있는 기본 렌더러를 그렸습니다. 따라서 이전 숫자는 0.16.1에 불리하게 치우쳐 있으며 이 보고서로 대체합니다. 기존 인용 위치인 [IR-10 결과](../input-responsiveness/ir-10-results.md#브라우저-측정f9-계획에서-옮김)와 [입력 반응성 설계](../../plan/input-responsiveness/design.md)의 실행 참조에 이 보고서 포인터를 추가했습니다. 현재 하네스는 같은 렌더러를 `FieldRenderer`와 `CustomFormTypeRenderer` 두 이름으로 전달하고 두 판에 `errorVisibility={ErrorVisibility.Always}`를 지정합니다.

## 관문과 출처

기록 원자료는 [실행 41871054743](https://github.com/vincent-kk/albatrion/actions/runs/41871054743)의 [browser-benchmark-41871054743 아티팩트](https://github.com/vincent-kk/albatrion/actions/runs/41871054743#artifacts)에 있는 `summary.md`, `summary.json`, `samples.json`, `quiet.json`입니다. GitHub 아티팩트는 30일 동안 보존됩니다. 기준 전체 SHA는 `7b49d62c73c3204f61b1ff67a3646d8ecc38bf06`, 후보 전체 SHA는 `b039c3187d8a481b1a9dd67f4c6719d98543f3b0`입니다. 경과·블로킹·피드백 판정은 생성 요약의 값을 그대로 사용하며, 타이핑 두 행의 초과 프레임 판정 `void`를 다른 지표의 유효성으로 바꾸지 않습니다. 표본 분포는 같은 실행의 `samples.json`에서 추출했습니다.

문서 검증은 아래 생성 구역을 새 `summary.md` 전체와 바이트 단위로 대조하고, 측정 모델·렌더러 편향 공개 절의 보존 및 원인 분석의 기존 본문 보존을 확인합니다. 생성 요약의 반올림과 판정을 수작업으로 바꾸지 않았으며, 서로 다른 실행의 표본을 합치지 않았습니다.

<!-- core-summary:begin -->

# Core form browser benchmark

compare; 20 runs and 3 warmup pages per variant.

## 범례

- 단위는 ms. type 사례의 경과는 쓰기 20회의 핸들러 평균, 블로킹·검증기·피드백 값은 쓰기 2–20의 반복 비용(쓰기 1회당; 첫 쓰기는 표 4의 첫 쓰기 ms와 first-key 행). 다른 사례는 작업 1회당. 프레임 관측 수치는 20회 입력 창 전체(키 사이 대기 포함) 단위.
- 첫 키: first-key-flat-500-validate는 첫 paint에서 즉시 입력해 예약된 로드 검증 컴파일과 측정 창이 겹칠 수 있습니다. first-key-flat-500-validate-after-load는 같은 fixture에서 onValidate 보고가 하나 이상 있고, 검증 실행 기록이 있으며 진행 중 실행이 없을 때 입력합니다(두 판 동일, 1000 ms 제한, 대기는 durationMs 제외). 초기 로드와 겹친 지연과 로드 검증 이후 입력 지연을 함께 보고하며 두 행 모두 가중치 1로 교환비에 포함합니다.
- 명목 간격 frameIntervalNominalMs는 빈 rAF 중앙값을 60/120 Hz로 판별한 1000/Hz ms이며 표 4는 기준/후보를 표시한다. 허용 오차 ±3 ms, CI 최종 실행은 60 Hz(13.7–19.7 ms)만 허용한다. 초과 프레임 수는 페이지별 중앙값. 프레임 예산 16.7 ms(60 Hz, 주 예산)와 8.3 ms(120 Hz, 보조). 프레임 열은 블로킹 중앙값 / 해당 예산, 넘침은 max(0, 중앙값 − 해당 예산); 각 예산의 기준판 초과 여부를 함께 적는다. UX 판정과 가중 교환비는 16.7 ms 기준을 유지하며 8.3 ms 열은 참고용이다. mount·rebuild는 50 ms 미만을 재는 수단이 없어 N/A이며 대신 가장 긴 Long Task ms를 적는다.
- 비율 = 후보 / 기준; Δ % = (후보 − 기준) / 기준 × 100; 기준 0 또는 비교 불가인 JSON null 비율·백분율은 N/A, 비교 자체가 없는 undefined는 —. 교환비 단위는 µs/event × 가중치.
- Long Task API 문턱은 50 ms: "< 50"은 관측 없음이지 0이 아니다. 가장 긴 Long Task는 창과 겹친 작업의 원래 길이이고 창 안 합은 겹친 부분만 더한다.
- 프레임 간격·가장 긴 간격·초과 합은 관측된 rAF 간격이며 CPU 블로킹과 구별한다. 검증기 구간은 동기/지연이 아니라 첫 프레임 전/후로 나눈다(0.16.1의 입력 검증은 매크로태스크라 첫 rAF 전에 돌 수 있다).
- 화면 반영(type)은 다음 키 전에 마커 전이가 관측된 exact 쓰기의 조건부 평균이다. 부류 수(exact/censored/noChange/superseded)가 두 판에서 다르면 전체 피드백 개선으로 일반화하지 않는다. 블로킹 교환비에서 제외된 mount 비용은 0이 아니라 미측정 비용이다.
- UX 판정: 블로킹은 RAIL 입력 처리 50 ms(표준값; type·first-key는 ≤ 16.7 ok, ≤ 50 perceptible, 그 밖 janky; mount·rebuild는 Long Task "< 50" ok, ≤ 100 perceptible[자체], 그 밖 janky). 피드백은 RAIL 반응 100 ms(표준값; ≤ 300 perceptible은 자체 임계), mount는 자체 로드 기준 ≤ 1000 ok, ≤ 2000 perceptible. n/a는 관측 불가.
- 판정은 권고. 경과 판정은 기존 규칙(typing 0.05 ms, 그 밖 0.5 ms 또는 5 %/3 %; 무효 대조군은 한 번 재시도 뒤 void). 지연 지표(검증기 완료·화면 반영·보고 콜백·프레임 간격)는 max(2 ms, 5 %), CPU 지표(블로킹·Long Task·검증기 구간)는 max(0.5 ms, 5 %); 지표별 대조군이 띠 밖이면 그 지표만 void.
- validate 사례는 루트 프로브 잎 `/probe`(기본값 x, 홀수 길이)를 더해 `/probe` 오류가 정확히 하나 생기며 두 판에 같이 적용된다. 배열 fixture의 다른 항목 오류는 두 판 동일 비용이고 측정 경로가 아니다.

## 1. 경과·동기

| 사례                                   | 기준 ms | 후보 ms | 후보 p95 |  비율 |    Δ ms |   Δ % | 판정         | 시도 |
| -------------------------------------- | ------: | ------: | -------: | ----: | ------: | ----: | ------------ | ---: |
| mount-flat-500-none                    | 148.350 | 164.900 |  165.200 | 1.112 |  16.550 |  11.2 | slower       |    1 |
| mount-flat-500-validate                | 265.000 | 248.400 |  265.000 | 0.937 | -16.600 |  -6.3 | faster       |    1 |
| mount-if-flat-500-none                 | 148.150 | 181.800 |  198.400 | 1.227 |  33.650 |  22.7 | slower       |    1 |
| mount-if-flat-500-validate             | 265.000 | 281.550 |  281.800 | 1.062 |  16.550 |   6.2 | slower       |    2 |
| mount-nested-d5-f4-validate            | 548.200 | 465.150 |  481.900 | 0.849 | -83.050 | -15.1 | faster       |    1 |
| mount-array-1000-validate              | 731.750 | 664.900 |  748.300 | 0.909 | -66.850 |  -9.1 | faster       |    1 |
| type-flat-500-validate-nonburst        |   1.480 |   1.365 |    1.425 | 0.922 |  -0.115 |  -7.8 | faster       |    1 |
| type-array-1000-validate-nonburst      |   7.695 |   1.572 |    1.670 | 0.204 |  -6.123 | -79.6 | faster       |    1 |
| first-key-flat-500-validate            | 147.200 | 188.900 |  201.500 | 1.283 |  41.700 |  28.3 | slower       |    1 |
| first-key-flat-500-validate-after-load |  77.450 |  74.700 |   79.000 | 0.964 |  -2.750 |  -3.6 | within noise |    1 |

## 2. 블로킹

| 사례                                   | 기준 블로킹 ms | 후보 블로킹 ms |   Δ % | 판정           | 16.7 ms 프레임(기준/후보) | 16.7 ms 넘침 ms(기준/후보) | 16.7 ms 기준판도 초과 | 8.3 ms 프레임(기준/후보) | 8.3 ms 넘침 ms(기준/후보) | 8.3 ms 기준판도 초과 | 가장 긴 Long Task ms(기준/후보)        | 창 안 Long Task 합 ms(기준/후보) | 첫 프레임 전 검증기 ms(기준/후보) | 첫 프레임 뒤 검증기 ms(기준/후보) |
| -------------------------------------- | -------------: | -------------: | ----: | -------------- | ------------------------- | -------------------------- | --------------------- | ------------------------ | ------------------------- | -------------------- | -------------------------------------- | -------------------------------- | --------------------------------- | --------------------------------- |
| mount-flat-500-none                    |              — |              — |     — | not observable | N/A / N/A                 | N/A / N/A                  | N/A                   | N/A / N/A                | N/A / N/A                 | N/A                  | 71.000 / 102.500 (관측 20/20 / 20/20)  | 71.000 / 102.500                 | 0.000 / 0.000                     | 0.000 / 0.000                     |
| mount-flat-500-validate                |              — |              — |     — | not observable | N/A / N/A                 | N/A / N/A                  | N/A                   | N/A / N/A                | N/A / N/A                 | N/A                  | 163.500 / 105.500 (관측 20/20 / 20/20) | 163.500 / 195.500                | 65.700 / 0.000                    | 14.200 / 86.600                   |
| mount-if-flat-500-none                 |              — |              — |     — | not observable | N/A / N/A                 | N/A / N/A                  | N/A                   | N/A / N/A                | N/A / N/A                 | N/A                  | 69.500 / 137.500 (관측 20/20 / 20/20)  | 69.500 / 137.500                 | 0.000 / 0.000                     | 0.000 / 0.000                     |
| mount-if-flat-500-validate             |              — |              — |     — | not observable | N/A / N/A                 | N/A / N/A                  | N/A                   | N/A / N/A                | N/A / N/A                 | N/A                  | 167.500 / 139.000 (관측 20/20 / 20/20) | 167.500 / 227.000                | 73.200 / 0.000                    | 13.300 / 82.200                   |
| mount-nested-d5-f4-validate            |              — |              — |     — | not observable | N/A / N/A                 | N/A / N/A                  | N/A                   | N/A / N/A                | N/A / N/A                 | N/A                  | 353.500 / 198.500 (관측 20/20 / 20/20) | 422.000 / 391.000                | 145.900 / 0.000                   | 39.500 / 190.200                  |
| mount-array-1000-validate              |              — |              — |     — | not observable | N/A / N/A                 | N/A / N/A                  | N/A                   | N/A / N/A                | N/A / N/A                 | N/A                  | 390.500 / 402.000 (관측 20/20 / 20/20) | 652.000 / 530.500                | 23.100 / 0.000                    | 2.400 / 27.050                    |
| type-flat-500-validate-nonburst        |          1.005 |          1.039 |   3.4 | within noise   | 0.06 / 0.06               | 0.000 / 0.000              | 아니요                | 0.12 / 0.13              | 0.000 / 0.000             | 아니요               | < 50 / < 50 (관측 0/20 / 0/20)         | 0.000 / 0.000                    | 0.000 / 0.000                     | 0.432 / 0.434                     |
| type-array-1000-validate-nonburst      |          7.284 |          1.232 | -83.1 | faster         | 0.44 / 0.07               | 0.000 / 0.000              | 아니요                | 0.88 / 0.15              | 0.000 / 0.000             | 아니요               | < 50 / < 50 (관측 0/20 / 0/20)         | 0.000 / 0.000                    | 0.000 / 0.000                     | 0.134 / 0.174                     |
| first-key-flat-500-validate            |         10.700 |          8.000 | -25.2 | faster         | 0.64 / 0.48               | 0.000 / 0.000              | 아니요                | 1.29 / 0.96              | 2.400 / 0.000             | 예                   | < 50 / < 50 (관측 0/20 / 0/20)         | 0.000 / 0.000                    | 0.000 / 0.000                     | 0.400 / 0.500                     |
| first-key-flat-500-validate-after-load |         10.600 |          7.650 | -27.8 | faster         | 0.63 / 0.46               | 0.000 / 0.000              | 아니요                | 1.28 / 0.92              | 2.300 / 0.000             | 예                   | < 50 / < 50 (관측 0/20 / 0/20)         | 0.000 / 0.000                    | 0.000 / 0.000                     | 0.400 / 0.600                     |

## 3. 피드백

| 사례                                   | 검증기 완료 ms(기준/후보) | 화면 반영 ms(기준/후보) |  비율 |   Δ % | 판정           | 보고 콜백 ms(기준/후보, 로드만) | 피드백 부류 exact/censored/noChange/superseded (기준) | 피드백 부류 (후보)         | 합쳐진 쓰기 수(기준/후보) |
| -------------------------------------- | ------------------------- | ----------------------- | ----: | ----: | -------------- | ------------------------------- | ----------------------------------------------------- | -------------------------- | ------------------------- |
| mount-flat-500-none                    | — / —                     | — / —                   |     — |     — | not observable | — / —                           | —                                                     | —                          | —                         |
| mount-flat-500-validate                | 197.100 / 224.250         | 239.400 / 227.350       | 0.950 |  -5.0 | faster         | 239.500 / 225.100               | —                                                     | —                          | —                         |
| mount-if-flat-500-none                 | — / —                     | — / —                   |     — |     — | not observable | — / —                           | —                                                     | —                          | —                         |
| mount-if-flat-500-validate             | 194.500 / 247.650         | 235.450 / 250.850       | 1.065 |   6.5 | slower         | 235.550 / 248.750               | —                                                     | —                          | —                         |
| mount-nested-d5-f4-validate            | 437.000 / 443.400         | 515.100 / 445.600       | 0.865 | -13.5 | faster         | 515.150 / 444.250               | —                                                     | —                          | —                         |
| mount-array-1000-validate              | 529.950 / 629.300         | 698.950 / 631.200       | 0.903 |  -9.7 | faster         | 699.000 / 630.050               | —                                                     | —                          | —                         |
| type-flat-500-validate-nonburst        | 14.842 / 15.129           | 15.421 / 16.061         | 1.041 |   4.1 | within noise   | — / —                           | 400/0/0/0 (2–20 exact 380)                            | 400/0/0/0 (2–20 exact 380) | 0 / 0                     |
| type-array-1000-validate-nonburst      | 22.034 / 18.600           | 23.321 / 26.434         | 1.133 |  13.3 | slower         | — / —                           | 400/0/0/0 (2–20 exact 380)                            | 400/0/0/0 (2–20 exact 380) | 0 / 0                     |
| first-key-flat-500-validate            | 24.800 / 21.300           | 25.750 / 23.450         | 0.911 |  -8.9 | faster         | — / —                           | —                                                     | —                          | —                         |
| first-key-flat-500-validate-after-load | 24.600 / 21.450           | 25.600 / 23.450         | 0.916 |  -8.4 | faster         | — / —                           | —                                                     | —                          | —                         |

## 4. 프레임 관측·UX

| 사례                                   | 명목 간격 ms(기준/후보) | 가장 긴 간격 ms(기준/후보) | 초과 합 ms(기준/후보) | 초과 프레임 수(기준/후보) | 8.3 ms 초과 합 ms(기준/후보) | 8.3 ms 초과 프레임 수(기준/후보) | 초과 프레임 판정 | 타이핑 첫 쓰기 ms · max 핸들러 ms · 초과 횟수(기준) | 같은 값(후보)      | UX 블로킹(기준/후보) | UX 피드백(기준/후보) |
| -------------------------------------- | ----------------------- | -------------------------- | --------------------- | ------------------------- | ---------------------------- | -------------------------------- | ---------------- | --------------------------------------------------- | ------------------ | -------------------- | -------------------- |
| mount-flat-500-none                    | 16.667 / 16.667         | 75.450 / 105.450           | 93.250 / 101.450      | 3.0 / 3.0                 | 135.100 / 149.800            | 5.0 / 5.5                        | slower           | —                                                   | —                  | perceptible / janky  | n/a / n/a            |
| mount-flat-500-validate                | 16.667 / 16.667         | 166.800 / 121.700          | 207.950 / 195.700     | 3.0 / 3.0                 | 249.850 / 237.650            | 5.5 / 6.0                        | faster           | —                                                   | —                  | janky / janky        | ok / ok              |
| mount-if-flat-500-none                 | 16.667 / 16.667         | 72.550 / 140.500           | 85.700 / 129.050      | 3.0 / 3.0                 | 133.100 / 171.000            | 5.5 / 6.0                        | slower           | —                                                   | —                  | perceptible / janky  | n/a / n/a            |
| mount-if-flat-500-validate             | 16.667 / 16.667         | 170.350 / 141.700          | 204.100 / 219.200     | 3.0 / 3.0                 | 249.750 / 266.300            | 5.0 / 5.0                        | slower           | —                                                   | —                  | janky / janky        | ok / ok              |
| mount-nested-d5-f4-validate            | 16.667 / 16.667         | 356.150 / 248.400          | 483.600 / 414.000     | 3.0 / 3.0                 | 532.600 / 455.350            | 6.0 / 5.0                        | faster           | —                                                   | —                  | janky / janky        | ok / ok              |
| mount-array-1000-validate              | 16.667 / 16.667         | 393.600 / 404.550          | 667.400 / 600.500     | 3.0 / 3.0                 | 713.800 / 643.450            | 6.0 / 6.0                        | faster           | —                                                   | —                  | janky / janky        | ok / ok              |
| type-flat-500-validate-nonburst        | 16.667 / 16.667         | 18.650 / 19.150            | 10.000 / 10.750       | 34.0 / 33.5               | 1069.300 / 1070.800          | 128.0 / 128.0                    | void             | 10.550 · 11.200 · 0                                 | 7.600 · 10.100 · 0 | ok / ok              | ok / ok              |
| type-array-1000-validate-nonburst      | 16.667 / 16.667         | 28.550 / 25.350            | 91.350 / 66.150       | 39.5 / 40.5               | 1246.800 / 1148.950          | 148.0 / 138.0                    | void             | 15.600 · 18.300 · 3                                 | 7.900 · 9.100 · 0  | ok / ok              | ok / ok              |
| first-key-flat-500-validate            | 16.667 / 16.667         | 20.500 / 17.800            | 4.000 / 1.150         | 2.0 / 1.0                 | 47.250 / 41.000              | 6.0 / 5.0                        | faster           | —                                                   | —                  | ok / ok              | ok / ok              |
| first-key-flat-500-validate-after-load | 16.667 / 16.667         | 20.700 / 18.100            | 4.100 / 1.450         | 1.0 / 1.0                 | 46.550 / 43.550              | 6.0 / 6.0                        | faster           | —                                                   | —                  | ok / ok              | ok / ok              |

## 5. 가중 교환비

### 블로킹 교환비 (blockingMs)

| 사례                                   | 가중치 |   k | 기준 µs | 후보 µs | Δ µs/event | 계산                                                                |  기여 µs | 근거                                                                                                                                                             |
| -------------------------------------- | -----: | --: | ------: | ------: | ---------: | ------------------------------------------------------------------- | -------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| mount-flat-500-none                    |      1 |   1 |       — |       — |          — | < 50 ms 관측 불가                                                   |        0 | One mount per session; matches the Node table's mount rows (weight 1).                                                                                           |
| mount-flat-500-validate                |      1 |   1 |       — |       — |          — | < 50 ms 관측 불가                                                   |        0 | One mount per session; matches the Node table's mount rows (weight 1).                                                                                           |
| mount-if-flat-500-none                 |      1 |   1 |       — |       — |          — | < 50 ms 관측 불가                                                   |        0 | One mount per session; matches the Node table's mount rows (weight 1).                                                                                           |
| mount-if-flat-500-validate             |      1 |   1 |       — |       — |          — | < 50 ms 관측 불가                                                   |        0 | One mount per session; matches the Node table's mount rows (weight 1).                                                                                           |
| mount-nested-d5-f4-validate            |      1 |   1 |       — |       — |          — | < 50 ms 관측 불가                                                   |        0 | One mount per session; matches the Node table's mount-nested row (weight 1).                                                                                     |
| mount-array-1000-validate              |      1 |   1 |       — |       — |          — | < 50 ms 관측 불가                                                   |        0 | One mount per session; matches the Node table's mount rows (weight 1).                                                                                           |
| type-flat-500-validate-nonburst        |   5000 |   1 |    1005 |    1039 |         34 | within noise                                                        |        0 | The browser path goes through the FieldProxy subscription, so it matches the Node 'typing with subscribers' row (weight 5000).                                   |
| type-array-1000-validate-nonburst      |   1000 |   1 |    7284 |    1232 |      -6053 | counted                                                             | -6052632 | No Node counterpart; harness assumption that typing inside an array is one fifth as frequent as flat typing.                                                     |
| first-key-flat-500-validate            |      1 |   1 |   10700 |    8000 |      -2700 | counted                                                             |    -2700 | One first key per session: the owner rule's one-off first-write term, kept as its own row.                                                                       |
| first-key-flat-500-validate-after-load |      1 |   1 |   10600 |    7650 |      -2950 | counted                                                             |    -2950 | One first key after load validation settles; kept alongside the immediate first key at the same weight to distinguish load overlap from settled-load input cost. |
| rebuild-flat-500                       |      5 |   1 |       — |       — |          — | 0.16.1 has no rebuild, so the row is excluded from this comparison. |        0 | Matches the Node bulk rows (weight 5).                                                                                                                           |

가중 교환비 Σ(가중치 × Δ) = -6058282 µs (폭 안 행은 0, 음수가 개선); 가중 기준 합 = 12331826 µs; 가중 후보 합 = 6444597 µs; 가중 비율 = 0.523.
제외 행: mount-flat-500-none: < 50 ms 관측 불가; mount-flat-500-validate: < 50 ms 관측 불가; mount-if-flat-500-none: < 50 ms 관측 불가; mount-if-flat-500-validate: < 50 ms 관측 불가; mount-nested-d5-f4-validate: < 50 ms 관측 불가; mount-array-1000-validate: < 50 ms 관측 불가; rebuild-flat-500: 0.16.1 has no rebuild, so the row is excluded from this comparison.

### 피드백 교환비 (exact 쓰기의 조건부 평균) (feedbackCommittedMs)

| 사례                                   | 가중치 |   k | 기준 µs | 후보 µs | Δ µs/event | 계산                                                                | 기여 µs | 근거                                                                                                                                                             |
| -------------------------------------- | -----: | --: | ------: | ------: | ---------: | ------------------------------------------------------------------- | ------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| mount-flat-500-none                    |      1 |   1 |       — |       — |          — | not observable                                                      |       0 | One mount per session; matches the Node table's mount rows (weight 1).                                                                                           |
| mount-flat-500-validate                |      1 |   1 |  239400 |  227350 |     -12050 | counted                                                             |  -12050 | One mount per session; matches the Node table's mount rows (weight 1).                                                                                           |
| mount-if-flat-500-none                 |      1 |   1 |       — |       — |          — | not observable                                                      |       0 | One mount per session; matches the Node table's mount rows (weight 1).                                                                                           |
| mount-if-flat-500-validate             |      1 |   1 |  235450 |  250850 |      15400 | counted                                                             |   15400 | One mount per session; matches the Node table's mount rows (weight 1).                                                                                           |
| mount-nested-d5-f4-validate            |      1 |   1 |  515100 |  445600 |     -69500 | counted                                                             |  -69500 | One mount per session; matches the Node table's mount-nested row (weight 1).                                                                                     |
| mount-array-1000-validate              |      1 |   1 |  698950 |  631200 |     -67750 | counted                                                             |  -67750 | One mount per session; matches the Node table's mount rows (weight 1).                                                                                           |
| type-flat-500-validate-nonburst        |   5000 |   1 |   15421 |   16061 |        639 | within noise                                                        |       0 | The browser path goes through the FieldProxy subscription, so it matches the Node 'typing with subscribers' row (weight 5000).                                   |
| type-array-1000-validate-nonburst      |   1000 |   1 |   23321 |   26434 |       3113 | counted                                                             | 3113158 | No Node counterpart; harness assumption that typing inside an array is one fifth as frequent as flat typing.                                                     |
| first-key-flat-500-validate            |      1 |   1 |   25750 |   23450 |      -2300 | counted                                                             |   -2300 | One first key per session: the owner rule's one-off first-write term, kept as its own row.                                                                       |
| first-key-flat-500-validate-after-load |      1 |   1 |   25600 |   23450 |      -2150 | counted                                                             |   -2150 | One first key after load validation settles; kept alongside the immediate first key at the same weight to distinguish load overlap from settled-load input cost. |
| rebuild-flat-500                       |      5 |   1 |       — |       — |          — | 0.16.1 has no rebuild, so the row is excluded from this comparison. |       0 | Matches the Node bulk rows (weight 5).                                                                                                                           |

가중 교환비 Σ(가중치 × Δ) = 2974808 µs (폭 안 행은 0, 음수가 개선); 가중 기준 합 = 102166566 µs; 가중 후보 합 = 108338742 µs; 가중 비율 = 1.060.
제외 행: mount-flat-500-none: not observable; mount-if-flat-500-none: not observable; rebuild-flat-500: 0.16.1 has no rebuild, so the row is excluded from this comparison.

An invalid baseline/control group is retried once, then marked void.

<!-- core-summary:end -->
