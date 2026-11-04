# 8단계 최종 브라우저 측정 — 0.16.1 대비

2026-11-04에 공개판 0.16.1(`7b49d62c7`)과 스테이지 끝 `bd2141098`을 비교했습니다. GitHub Actions `ubuntu-24.04`의 헤드리스 Chromium에서 60 Hz로 아홉 사례를 변형별 3회 예열하고 20회 측정했습니다. 최종 기록은 [실행 41804126885](https://github.com/vincent-kk/albatrion/actions/runs/41804126885)이며, 측정 하네스는 [PR #539](https://github.com/vincent-kk/albatrion/pull/539), 워크플로의 힙·시간 한도 보정은 [PR #540](https://github.com/vincent-kk/albatrion/pull/540)에 해당합니다. 제품 코드는 이 보고서에서 변경하지 않았습니다.

## 측정 모델

`durationMs`는 기존 정의를 유지합니다. 마운트·첫 키는 프레임 대기를 포함한 경과 시간이며, 반복 타이핑은 20회 쓰기의 핸들러 시간 평균입니다. `blockingMs`는 네이티브 capture부터 bubble까지 직접 잰 핸들러 시간으로, 반복 타이핑은 쓰기 2–20의 평균이고 첫 키는 단일 쓰기입니다. 마운트의 직접 블로킹은 측정하지 못하므로 null이며, `maxLongTaskMs`는 관측 창과 겹친 Long Task의 원래 길이 중 최댓값이고 `longTaskOverlapMs`는 창 안에 겹친 부분의 합입니다. API 문턱인 50 ms 미만은 관측할 수 없으며, 관측 없음은 0을 뜻하지 않습니다. `preFrameValidatorMs`와 `postFrameValidatorMs`는 작업 또는 쓰기 뒤 첫 rAF를 기준으로 검증기 컴파일·실행의 동기 구간을 나눕니다. `validatorSettledMs`는 시작부터 해당 값의 검증기 Promise가 완료될 때까지이며, 오류 배분·React 커밋까지의 지연은 포함하지 않습니다. `feedbackCommittedMs`는 측정 경로 마커의 기대 상태 전이가 관측된 시각까지입니다. 마운트는 `/probe` 오류의 첫 마커 전이를 사용하고, 쓰기는 같은 값의 검증 실행이 완료되었으며 capture 이후 다음 capture 이전에 기대 상태 전이가 있어야 `exact`로 귀속합니다. 마지막 쓰기의 상한은 관측 창 끝입니다. 검증되지 않은 쓰기는 `superseded`, 이미 기대 상태인 쓰기는 `noChange`, 그 밖에 상한 안에 전이가 없으면 `censored`이며, 반복 피드백은 쓰기 2–20 중 `exact`인 쓰기의 조건부 평균입니다. 두 타이핑 사례는 두 판 모두 400회 중 400회가 `exact`이고 반복 구간은 380회이므로 이번 비교의 부류 수는 같습니다. 프레임 표는 관측된 rAF 간격과 초과 합·횟수를 16.7 ms와 8.3 ms 예산으로 제시하며 CPU 블로킹과 구별합니다. UX 판정은 RAIL의 입력 처리 50 ms·반응 100 ms와 하네스 자체의 프레임·마운트 기준을 사용합니다. 가중 교환비는 `Σ(가중치 × (후보 − 기준)/k)`이고, 모든 행의 `k = 1`이며 잡음 폭 안의 기여는 0입니다. 가중 비율은 포함 행의 가중 후보 합을 가중 기준 합으로 나눈 별도 수치입니다.

가중치는 하네스의 `fixtures/core-weights.json`을 따릅니다. 배열 타이핑의 빈도는 실제 사용자 계측이 아니라 평탄 타이핑의 5분의 1이라는 하네스 가정입니다.

| 사례 | 가중치 | k | 근거 |
| --- | ---: | ---: | --- |
| mount-flat-500-none | 1 | 1 | 세션당 마운트 한 번을 가정하며 Node 마운트 행과 맞춥니다. |
| mount-flat-500-validate | 1 | 1 | 세션당 마운트 한 번을 가정하며 Node 마운트 행과 맞춥니다. |
| mount-if-flat-500-none | 1 | 1 | 세션당 마운트 한 번을 가정하며 Node 마운트 행과 맞춥니다. |
| mount-if-flat-500-validate | 1 | 1 | 세션당 마운트 한 번을 가정하며 Node 마운트 행과 맞춥니다. |
| mount-nested-d5-f4-validate | 1 | 1 | 세션당 마운트 한 번을 가정하며 Node 중첩 마운트 행과 맞춥니다. |
| mount-array-1000-validate | 1 | 1 | 세션당 마운트 한 번을 가정하며 Node 마운트 행과 맞춥니다. |
| type-flat-500-validate-nonburst | 5,000 | 1 | FieldProxy 구독을 거치는 경로이므로 Node의 구독 타이핑 행과 맞춥니다. |
| type-array-1000-validate-nonburst | 1,000 | 1 | 대응하는 Node 행이 없으므로 평탄 타이핑의 5분의 1 빈도를 가정합니다. |
| first-key-flat-500-validate | 1 | 1 | 세션당 첫 키 한 번의 일회성 비용을 별도 행으로 둡니다. |
| rebuild-flat-500 | 5 | 1 | Node 일괄 입력 행과 맞추지만 0.16.1에 rebuild가 없어 이번 비교에서 제외합니다. |

## 결과 요약

배열 타이핑의 핸들러 블로킹과 검증 마운트 일부는 개선되었습니다. 다만 if-flat의 비검증 마운트 경과 +38 %, 검증 마운트 경과 +7 %·피드백 +10 %, 첫 키 경과 +28 %가 남아 있습니다. 이 세 회귀의 원인을 분석하기 전에는 8단계의 성능 결론을 확정하지 않습니다. 아래 값은 페이지별 측정값의 중앙값이며 비율은 후보/기준입니다.

- 배열 타이핑의 블로킹은 7.229 → 1.342 ms(비율 0.186, −81.4 %)로 감소했고, 경과는 7.620 → 1.670 ms(0.219, −78.1 %)로 감소했습니다.
- 중첩 검증 마운트의 경과는 506.650 → 431.400 ms(0.851, −14.9 %)이고, 가장 긴 Long Task는 324.500 → 182.500 ms(0.562, −43.8 %)입니다. 배열 검증 마운트의 경과도 648.250 → 581.500 ms(0.897, −10.3 %)로 감소했습니다.
- 평탄 검증 마운트의 경과는 248.550 → 231.750 ms(0.932, −6.8 %)이고, 가장 긴 Long Task는 157.500 → 96.000 ms(0.610, −39.0 %)입니다. 다만 창 안 Long Task 합은 157.500 → 183.500 ms(1.165, +16.5 %)로 증가했으므로 단일 작업 단축을 총 블로킹 감소로 해석하지 않습니다.
- 첫 키의 핸들러 블로킹은 9.650 → 7.900 ms(0.819, −18.1 %)이고, 화면 피드백은 23.500 → 21.350 ms(약 23.5 → 21.4 ms, 0.909, −9.1 %)로 개선되었습니다.
- 보이는 오류의 마운트 피드백은 평탄 228.700 → 213.600 ms(0.934, −6.6 %), 중첩 482.000 → 406.050 ms(0.842, −15.8 %), 배열 617.600 → 550.400 ms(0.891, −10.9 %)로 빨라졌습니다.

회귀와 제한은 다음과 같습니다.

- `mount-if-flat-500-none`의 경과는 131.500 → 181.800 ms(1.383, +38.3 %)입니다. 가장 긴 Long Task와 창 안 합의 중앙값은 각각 63.500 → 138.000 ms(약 64 → 138 ms, 2.173, +117.3 %)이며, 그 두 지표의 비교 판정은 `void`입니다. 두 지표의 대조군 중앙값은 67.000 ms로 기준 63.500 ms와 3.500 ms 차이가 나 CPU 지표 대조 띠 1.905 ms(기준의 3 %)를 넘었고, 원인은 확인하지 않았습니다. A7은 이 사실을 표시한 채 기록 관문만 통과시키며 속도 판정을 유효하게 바꾸지 않습니다. 관측값으로 산출한 UX 블로킹은 `perceptible → janky`입니다.
- `mount-if-flat-500-validate`의 경과는 248.350 → 265.250 ms(1.068, +6.8 %)이며, 화면 피드백도 224.100 → 246.100 ms(1.098, +9.8 %)로 늦어졌습니다.
- 첫 키의 전체 경과는 134.100 → 172.300 ms(1.285, +28.5 %)로 증가했습니다. 앞서 본 핸들러 블로킹·피드백 개선만으로 이 경과 회귀가 해소되지는 않습니다.
- 평탄 비검증 마운트는 경과가 148.050 → 148.300 ms(1.002, +0.2 %, 잡음 폭 안)인 반면, 가장 긴 Long Task는 67.000 → 94.500 ms(약 67 → 95 ms, 1.410, +41.0 %)로 길어졌습니다.
- 배열 타이핑의 화면 피드백은 22.547 → 25.697 ms(약 22.5 → 25.7 ms, 1.140, +14.0 %)로 늦어졌습니다. 블로킹 감소와 화면 반영 지연이 함께 관측되었습니다.
- 평탄 타이핑의 경과 1.542 → 1.475 ms(0.956, −4.4 %), 블로킹 1.103 → 1.150 ms(1.043, +4.3 %), 피드백 15.771 → 16.163 ms(1.025, +2.5 %)는 모두 잡음 폭 안입니다. 검증기 지표도 잡음 폭 안이며, 관측된 프레임 초과 합의 감소는 별도 표에 유지합니다.

가중 세션당 블로킹 교환비는 −5,888,592 µs, 약 −5.89 s이고 가중 비율은 0.557입니다. 계산에 기여한 행은 배열 타이핑과 첫 키이며, 평탄 타이핑은 잡음 폭 안이라 기여가 0입니다. 마운트 여섯 행은 모두 `< 50 ms 관측 불가`로 제외되었습니다. 이는 50 ms 미만 블로킹을 직접 재지 못했다는 뜻이며 마운트 비용을 0으로 보았다는 뜻이 아닙니다. 이 교환비만으로 전체 세션의 마운트 포함 총 블로킹을 추정할 수 없습니다.

가중 피드백 교환비는 +3,011,600 µs, 약 +3.01 s이며 가중 비율은 1.048입니다. 배열 타이핑의 쓰기당 +3.150 ms에 가중치 1,000을 적용한 +3.15 s가 평탄·중첩·배열 마운트와 첫 키의 이득을 넘었습니다. 이 합은 잡음 폭 안의 행을 0으로 한 값이고, 가중 비율의 합은 포함 행의 중앙값 자체를 사용하므로 두 수치의 의미를 구별해야 합니다.

RAIL 기반 판정에서 타이핑 두 사례와 첫 키의 블로킹·피드백은 두 판 모두 `ok`입니다. 세 사례의 블로킹 중앙값은 두 판 모두 16.7 ms 안입니다. 8.3 ms 참고 예산에서는 첫 키만 기준판 9.650 ms가 1.350 ms 초과했으며 후보 7.900 ms는 예산 안입니다. 마운트의 블로킹은 두 판 모두 `janky` 또는 `perceptible`이며, 평탄 검증은 `janky → perceptible`, if-flat 비검증은 `perceptible → janky`로 바뀌었습니다. 검증 마운트의 피드백은 자체 로드 기준에서 모두 `ok`이고 비검증 마운트의 피드백은 관측 대상이 아닙니다. `ok`는 상대 회귀가 없다는 뜻이 아니므로 배열 타이핑 피드백의 +14.0 %도 그대로 남깁니다.

## 해석과 열린 질문

후속 [세 회귀 원인 분석](./stage-8-regression-cause.md)에서 A(if-flat 비검증)는 로컬에서 같은 비율로 재현되고 경로가 확인된 실제 엔진 비용이며 CI 절대 차이의 귀속은 확정하지 않았습니다. B(if-flat 검증)는 같은 경로 비용과 검증 지연의 이득이 합쳐진 회귀로 해석하며 로컬 시간 계측과 독립 이분 탐색은 하지 않았습니다. C(첫 키 경과)는 지연된 전체 검증 컴파일과 입력 측정 창의 중첩으로 설명되며, 검증 완료 후 입력에서는 경과 차이가 잡음 폭 안이지만 로컬 블로킹·피드백 잔여 비용은 CI에서 미확인 상태입니다. 아래 문단은 후속 분석 전의 해석을 보존하며, 수정과 재측정은 새 기록의 열린 항목으로 남깁니다.

이 절은 관측값에 대한 해석이며 원인 분석의 결론은 아닙니다. 검증 마운트에서 기준판의 첫 프레임 전 검증기 중앙값은 24.200–136.500 ms였고 후보는 모두 0 ms입니다. 후보의 첫 프레임 뒤 검증기는 27.850–175.900 ms입니다. 첫 검증의 실행 위치가 첫 프레임 뒤로 이동한 관측은 평탄·중첩 검증 마운트의 가장 긴 Long Task 단축과 일치합니다. 배열 검증의 가장 긴 Long Task는 342.000 → 336.500 ms로 잡음 폭 안이므로 모든 검증 마운트에서 유의한 단축이 있었다고 일반화하지 않습니다.

그와 동시에 비검증 마운트의 가장 긴 Long Task가 길어졌고, if-flat 검증 마운트는 가장 긴 단일 작업이 161.000 → 139.500 ms로 줄었어도 창 안 Long Task 합은 161.000 → 222.000 ms로 증가했습니다. if-flat 두 사례의 전체 경과와 검증 사례의 피드백은 악화되었습니다. 첫 키 역시 핸들러 블로킹은 줄었지만 전체 경과는 늘었습니다. 따라서 if-flat 비검증 경과 +38 %, if-flat 검증 경과 +7 %·피드백 +10 %, 첫 키 경과 +28 %의 세 회귀를 원인 분석 대상으로 남기며, 그 분석 전에는 8단계 결론을 확정하지 않습니다.

같은 입력의 [재현 실행 41807354828](https://github.com/vincent-kk/albatrion/actions/runs/41807354828)은 더 낮은 절대값을 보인 빠른 러너에서 if-flat 비검증 경과 115.150 → 148.700 ms, if-flat 검증 경과 198.600 → 215.400 ms·피드백 176.300 → 193.800 ms, 첫 키 경과 114.400 → 141.000 ms를 보였습니다. 배열 타이핑 경과 6.245 → 1.325 ms와 중첩 검증 마운트 415.200 → 365.200 ms도 개선 방향을 유지했습니다. 다만 재현 실행에는 지표별 `void` 다섯 개가 있으며 A7을 적용해도 첫 키 `durationMs`와 두 검증 마운트의 `preFrameValidatorMs`가 허용 범위 밖이라 관문에 실패합니다. 특히 첫 키의 수치는 유효한 속도 판정이 아니라 관측 방향 확인으로만 인용합니다. 최종 기록의 표본을 이 실행으로 치환하거나 합치지 않았습니다.

또한 기록 실행에서 기준판 타이핑의 `preFrameValidatorMs`는 모든 표본에서 0입니다. 0.16.1의 매크로태스크 검증도 이번 쓰기 창에서는 첫 rAF 뒤에 실행되었습니다. 따라서 전/후 분할은 동기 검증 대 비동기 검증을 식별하는 지표가 아니며, 두 판의 입력 검증이 모두 후반에 놓일 수 있습니다. 이 실행에서 후보만 타이핑 검증을 첫 프레임 뒤로 옮겼다는 주장은 성립하지 않습니다. 아래 생성 범례의 “첫 rAF 전에 돌 수 있다”는 일반적 가능성과 이번 원시 표본의 관측을 구별합니다.

## 이전 비교의 렌더러 편향 공개

이전 0.16.1 비교인 실행 41651117812와 41605464351 및 이를 인용한 IR-10 결과와 입력 반응성 설계의 F9 기록은 입력만 그리는 통과 렌더러를 `FieldRenderer`로만 전달했습니다. 0.16.1은 그 속성을 사용하지 않아 라벨·오류 DOM이 더 있는 기본 렌더러를 그렸습니다. 따라서 이전 숫자는 0.16.1에 불리하게 치우쳐 있으며 이 보고서로 대체합니다. 기존 인용 위치인 [IR-10 결과](../input-responsiveness/ir-10-results.md#브라우저-측정f9-계획에서-옮김)와 [입력 반응성 설계](../../plan/input-responsiveness/design.md)의 실행 참조에 이 보고서 포인터를 추가했습니다. 현재 하네스는 같은 렌더러를 `FieldRenderer`와 `CustomFormTypeRenderer` 두 이름으로 전달하고 두 판에 `showError={true}`를 지정합니다.

## 관문과 출처

기록 원자료는 실행 41804126885의 `summary.json`, `samples.json`, `summary.md`, `quiet.json`이며 실행 메타데이터의 결론은 `success`입니다. 기준 전체 SHA는 `7b49d62c73c3204f61b1ff67a3646d8ecc38bf06`, 후보 전체 SHA는 `bd2141098d1df4c863e32bc54726f3d53eefd607`입니다. G6은 개정 A7의 원인 미확정인 명시적 허용(`--allow-void maxLongTaskMs,longTaskOverlapMs`)을 적용하여 아래 출력과 함께 통과했습니다. 허용은 지표 이름에만 적용되며 다른 `void`, 필수 관측 누락, 실패한 검증 호출, 표본 수·주기 불일치, 원시 표본 재계산 불일치는 계속 실패합니다.

```text
allowed void: mount-if-flat-500-none maxLongTaskMs
allowed void: mount-if-flat-500-none longTaskOverlapMs
FINAL_RUN_OK
```

G7은 원시 표본에서 요약 통계·프레임 예산·가중 합을 재계산하고 아래 생성 구역을 바이트 단위로 대조하여 `REPORT_MATCHES_SUMMARY`로 통과했습니다. 생성 구역은 `renderFinalReport.mjs`의 출력을 그대로 붙였으며 범례와 다섯 표 절을 수정하지 않았습니다. 로컬 호스트는 120 Hz이므로 계획 G4의 로컬 스모크 절대값은 이 60 Hz CI 기록과 비교할 수 없습니다.


<!-- core-summary:begin -->
# Core form browser benchmark

compare; 20 runs and 3 warmup pages per variant.

## 범례

- 단위는 ms. type 사례의 경과는 쓰기 20회의 핸들러 평균, 블로킹·검증기·피드백 값은 쓰기 2–20의 반복 비용(쓰기 1회당; 첫 쓰기는 표 4의 첫 쓰기 ms와 first-key 행). 다른 사례는 작업 1회당. 프레임 관측 수치는 20회 입력 창 전체(키 사이 대기 포함) 단위.
- 명목 간격 frameIntervalNominalMs는 빈 rAF 중앙값을 60/120 Hz로 판별한 1000/Hz ms이며 표 4는 기준/후보를 표시한다. 허용 오차 ±3 ms, CI 최종 실행은 60 Hz(13.7–19.7 ms)만 허용한다. 초과 프레임 수는 페이지별 중앙값. 프레임 예산 16.7 ms(60 Hz, 주 예산)와 8.3 ms(120 Hz, 보조). 프레임 열은 블로킹 중앙값 / 해당 예산, 넘침은 max(0, 중앙값 − 해당 예산); 각 예산의 기준판 초과 여부를 함께 적는다. UX 판정과 가중 교환비는 16.7 ms 기준을 유지하며 8.3 ms 열은 참고용이다. mount·rebuild는 50 ms 미만을 재는 수단이 없어 N/A이며 대신 가장 긴 Long Task ms를 적는다.
- 비율 = 후보 / 기준; Δ % = (후보 − 기준) / 기준 × 100; 기준 0 또는 비교 불가인 JSON null 비율·백분율은 N/A, 비교 자체가 없는 undefined는 —. 교환비 단위는 µs/event × 가중치.
- Long Task API 문턱은 50 ms: "< 50"은 관측 없음이지 0이 아니다. 가장 긴 Long Task는 창과 겹친 작업의 원래 길이이고 창 안 합은 겹친 부분만 더한다.
- 프레임 간격·가장 긴 간격·초과 합은 관측된 rAF 간격이며 CPU 블로킹과 구별한다. 검증기 구간은 동기/지연이 아니라 첫 프레임 전/후로 나눈다(0.16.1의 입력 검증은 매크로태스크라 첫 rAF 전에 돌 수 있다).
- 화면 반영(type)은 다음 키 전에 마커 전이가 관측된 exact 쓰기의 조건부 평균이다. 부류 수(exact/censored/noChange/superseded)가 두 판에서 다르면 전체 피드백 개선으로 일반화하지 않는다. 블로킹 교환비에서 제외된 mount 비용은 0이 아니라 미측정 비용이다.
- UX 판정: 블로킹은 RAIL 입력 처리 50 ms(표준값; type·first-key는 ≤ 16.7 ok, ≤ 50 perceptible, 그 밖 janky; mount·rebuild는 Long Task "< 50" ok, ≤ 100 perceptible[자체], 그 밖 janky). 피드백은 RAIL 반응 100 ms(표준값; ≤ 300 perceptible은 자체 임계), mount는 자체 로드 기준 ≤ 1000 ok, ≤ 2000 perceptible. n/a는 관측 불가.
- 판정은 권고. 경과 판정은 기존 규칙(typing 0.05 ms, 그 밖 0.5 ms 또는 5 %/3 %; 무효 대조군은 한 번 재시도 뒤 void). 지연 지표(검증기 완료·화면 반영·보고 콜백·프레임 간격)는 max(2 ms, 5 %), CPU 지표(블로킹·Long Task·검증기 구간)는 max(0.5 ms, 5 %); 지표별 대조군이 띠 밖이면 그 지표만 void.
- validate 사례는 루트 프로브 잎 `/probe`(기본값 x, 홀수 길이)를 더해 `/probe` 오류가 정확히 하나 생기며 두 판에 같이 적용된다. 배열 fixture의 다른 항목 오류는 두 판 동일 비용이고 측정 경로가 아니다.

## 1. 경과·동기

| 사례 | 기준 ms | 후보 ms | 후보 p95 | 비율 | Δ ms | Δ % | 판정 | 시도 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: |
| mount-flat-500-none | 148.050 | 148.300 | 148.600 | 1.002 | 0.250 | 0.2 | within noise | 1 |
| mount-flat-500-validate | 248.550 | 231.750 | 248.400 | 0.932 | -16.800 | -6.8 | faster | 1 |
| mount-if-flat-500-none | 131.500 | 181.800 | 198.200 | 1.383 | 50.300 | 38.3 | slower | 1 |
| mount-if-flat-500-validate | 248.350 | 265.250 | 281.700 | 1.068 | 16.900 | 6.8 | slower | 1 |
| mount-nested-d5-f4-validate | 506.650 | 431.400 | 448.000 | 0.851 | -75.250 | -14.9 | faster | 1 |
| mount-array-1000-validate | 648.250 | 581.500 | 598.200 | 0.897 | -66.750 | -10.3 | faster | 1 |
| type-flat-500-validate-nonburst | 1.542 | 1.475 | 1.510 | 0.956 | -0.067 | -4.4 | within noise | 1 |
| type-array-1000-validate-nonburst | 7.620 | 1.670 | 1.715 | 0.219 | -5.950 | -78.1 | faster | 1 |
| first-key-flat-500-validate | 134.100 | 172.300 | 188.200 | 1.285 | 38.200 | 28.5 | slower | 1 |

## 2. 블로킹

| 사례 | 기준 블로킹 ms | 후보 블로킹 ms | Δ % | 판정 | 16.7 ms 프레임(기준/후보) | 16.7 ms 넘침 ms(기준/후보) | 16.7 ms 기준판도 초과 | 8.3 ms 프레임(기준/후보) | 8.3 ms 넘침 ms(기준/후보) | 8.3 ms 기준판도 초과 | 가장 긴 Long Task ms(기준/후보) | 창 안 Long Task 합 ms(기준/후보) | 첫 프레임 전 검증기 ms(기준/후보) | 첫 프레임 뒤 검증기 ms(기준/후보) |
| --- | ---: | ---: | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| mount-flat-500-none | — | — | — | not observable | N/A / N/A | N/A / N/A | N/A | N/A / N/A | N/A / N/A | N/A | 67.000 / 94.500 (관측 20/20 / 20/20) | 67.000 / 94.500 | 0.000 / 0.000 | 0.000 / 0.000 |
| mount-flat-500-validate | — | — | — | not observable | N/A / N/A | N/A / N/A | N/A | N/A / N/A | N/A / N/A | N/A | 157.500 / 96.000 (관측 20/20 / 20/20) | 157.500 / 183.500 | 65.600 / 0.000 | 13.350 / 81.900 |
| mount-if-flat-500-none | — | — | — | not observable | N/A / N/A | N/A / N/A | N/A | N/A / N/A | N/A / N/A | N/A | 63.500 / 138.000 (관측 20/20 / 20/20) | 63.500 / 138.000 | 0.000 / 0.000 | 0.000 / 0.000 |
| mount-if-flat-500-validate | — | — | — | not observable | N/A / N/A | N/A / N/A | N/A | N/A / N/A | N/A / N/A | N/A | 161.000 / 139.500 (관측 20/20 / 20/20) | 161.000 / 222.000 | 73.100 / 0.000 | 12.050 / 77.350 |
| mount-nested-d5-f4-validate | — | — | — | not observable | N/A / N/A | N/A / N/A | N/A | N/A / N/A | N/A / N/A | N/A | 324.500 / 182.500 (관측 20/20 / 20/20) | 394.000 / 356.500 | 136.500 / 0.000 | 35.100 / 175.900 |
| mount-array-1000-validate | — | — | — | not observable | N/A / N/A | N/A / N/A | N/A | N/A / N/A | N/A / N/A | N/A | 342.000 / 336.500 (관측 20/20 / 20/20) | 571.000 / 452.500 | 24.200 / 0.000 | 2.800 / 27.850 |
| type-flat-500-validate-nonburst | 1.103 | 1.150 | 4.3 | within noise | 0.07 / 0.07 | 0.000 / 0.000 | 아니요 | 0.13 / 0.14 | 0.000 / 0.000 | 아니요 | < 50 / < 50 (관측 0/20 / 0/20) | 0.000 / 0.000 | 0.000 / 0.000 | 0.439 / 0.437 |
| type-array-1000-validate-nonburst | 7.229 | 1.342 | -81.4 | faster | 0.43 / 0.08 | 0.000 / 0.000 | 아니요 | 0.87 / 0.16 | 0.000 / 0.000 | 아니요 | < 50 / < 50 (관측 0/20 / 0/20) | 0.000 / 0.000 | 0.000 / 0.000 | 0.153 / 0.189 |
| first-key-flat-500-validate | 9.650 | 7.900 | -18.1 | faster | 0.58 / 0.47 | 0.000 / 0.000 | 아니요 | 1.16 / 0.95 | 1.350 / 0.000 | 예 | < 50 / < 50 (관측 0/20 / 0/20) | 0.000 / 0.000 | 0.000 / 0.000 | 0.400 / 0.500 |

## 3. 피드백

| 사례 | 검증기 완료 ms(기준/후보) | 화면 반영 ms(기준/후보) | 비율 | Δ % | 판정 | 보고 콜백 ms(기준/후보, 로드만) | 피드백 부류 exact/censored/noChange/superseded (기준) | 피드백 부류 (후보) | 합쳐진 쓰기 수(기준/후보) |
| --- | --- | --- | ---: | ---: | --- | --- | --- | --- | --- |
| mount-flat-500-none | — / — | — / — | — | — | not observable | — / — | — | — | — |
| mount-flat-500-validate | 189.300 / 210.500 | 228.700 / 213.600 | 0.934 | -6.6 | faster | 228.850 / 211.350 | — | — | — |
| mount-if-flat-500-none | — / — | — / — | — | — | not observable | — / — | — | — | — |
| mount-if-flat-500-validate | 186.900 / 242.700 | 224.100 / 246.100 | 1.098 | 9.8 | slower | 224.200 / 244.050 | — | — | — |
| mount-nested-d5-f4-validate | 402.900 / 403.900 | 482.000 / 406.050 | 0.842 | -15.8 | faster | 482.150 / 404.750 | — | — | — |
| mount-array-1000-validate | 471.100 / 548.400 | 617.600 / 550.400 | 0.891 | -10.9 | faster | 617.700 / 549.150 | — | — | — |
| type-flat-500-validate-nonburst | 15.118 / 15.205 | 15.771 / 16.163 | 1.025 | 2.5 | within noise | — / — | 400/0/0/0 (2–20 exact 380) | 400/0/0/0 (2–20 exact 380) | 0 / 0 |
| type-array-1000-validate-nonburst | 21.289 / 18.566 | 22.547 / 25.697 | 1.140 | 14.0 | slower | — / — | 400/0/0/0 (2–20 exact 380) | 400/0/0/0 (2–20 exact 380) | 0 / 0 |
| first-key-flat-500-validate | 22.300 / 19.450 | 23.500 / 21.350 | 0.909 | -9.1 | faster | — / — | — | — | — |

## 4. 프레임 관측·UX

| 사례 | 명목 간격 ms(기준/후보) | 가장 긴 간격 ms(기준/후보) | 초과 합 ms(기준/후보) | 초과 프레임 수(기준/후보) | 8.3 ms 초과 합 ms(기준/후보) | 8.3 ms 초과 프레임 수(기준/후보) | 초과 프레임 판정 | 타이핑 첫 쓰기 ms · max 핸들러 ms · 초과 횟수(기준) | 같은 값(후보) | UX 블로킹(기준/후보) | UX 피드백(기준/후보) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| mount-flat-500-none | 16.667 / 16.667 | 71.250 / 97.850 | 87.700 / 92.600 | 3.0 / 3.0 | 133.050 / 134.450 | 6.0 / 5.0 | slower | — | — | perceptible / perceptible | n/a / n/a |
| mount-flat-500-validate | 16.667 / 16.667 | 160.550 / 117.450 | 197.800 / 182.250 | 3.0 / 3.0 | 239.550 / 223.950 | 6.0 / 5.0 | faster | — | — | janky / perceptible | ok / ok |
| mount-if-flat-500-none | 16.667 / 16.667 | 67.000 / 141.100 | 76.100 / 128.500 | 3.0 / 3.0 | 118.000 / 170.100 | 5.0 / 5.0 | slower | — | — | perceptible / janky | n/a / n/a |
| mount-if-flat-500-validate | 16.667 / 16.667 | 164.350 / 142.750 | 192.900 / 214.650 | 3.0 / 3.0 | 234.750 / 256.550 | 5.0 / 5.0 | slower | — | — | janky / janky | ok / ok |
| mount-nested-d5-f4-validate | 16.667 / 16.667 | 327.550 / 229.550 | 450.600 / 374.400 | 3.0 / 3.0 | 494.650 / 416.300 | 5.0 / 5.0 | faster | — | — | janky / janky | ok / ok |
| mount-array-1000-validate | 16.667 / 16.667 | 345.300 / 339.950 | 586.300 / 520.050 | 3.0 / 3.0 | 629.850 / 564.800 | 6.0 / 6.0 | faster | — | — | janky / janky | ok / ok |
| type-flat-500-validate-nonburst | 16.667 / 16.667 | 19.900 / 19.000 | 17.300 / 14.500 | 49.0 / 50.0 | 1071.000 / 1077.000 | 128.0 / 129.0 | faster | 9.700 · 10.000 · 0 | 7.450 · 8.100 · 0 | ok / ok | ok / ok |
| type-array-1000-validate-nonburst | 16.667 / 16.667 | 29.350 / 24.100 | 101.050 / 44.450 | 55.5 / 53.0 | 1234.150 / 1125.100 | 146.0 / 135.0 | faster | 15.100 · 18.300 · 3 | 7.550 · 9.900 · 0 | ok / ok | ok / ok |
| first-key-flat-500-validate | 16.667 / 16.667 | 19.850 / 17.200 | 3.200 / 0.700 | 2.0 / 2.0 | 41.950 / 40.400 | 5.0 / 5.0 | faster | — | — | ok / ok | ok / ok |

## 5. 가중 교환비

### 블로킹 교환비 (blockingMs)

| 사례 | 가중치 | k | 기준 µs | 후보 µs | Δ µs/event | 계산 | 기여 µs | 근거 |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | --- |
| mount-flat-500-none | 1 | 1 | — | — | — | < 50 ms 관측 불가 | 0 | One mount per session; matches the Node table's mount rows (weight 1). |
| mount-flat-500-validate | 1 | 1 | — | — | — | < 50 ms 관측 불가 | 0 | One mount per session; matches the Node table's mount rows (weight 1). |
| mount-if-flat-500-none | 1 | 1 | — | — | — | < 50 ms 관측 불가 | 0 | One mount per session; matches the Node table's mount rows (weight 1). |
| mount-if-flat-500-validate | 1 | 1 | — | — | — | < 50 ms 관측 불가 | 0 | One mount per session; matches the Node table's mount rows (weight 1). |
| mount-nested-d5-f4-validate | 1 | 1 | — | — | — | < 50 ms 관측 불가 | 0 | One mount per session; matches the Node table's mount-nested row (weight 1). |
| mount-array-1000-validate | 1 | 1 | — | — | — | < 50 ms 관측 불가 | 0 | One mount per session; matches the Node table's mount rows (weight 1). |
| type-flat-500-validate-nonburst | 5000 | 1 | 1103 | 1150 | 47 | within noise | 0 | The browser path goes through the FieldProxy subscription, so it matches the Node 'typing with subscribers' row (weight 5000). |
| type-array-1000-validate-nonburst | 1000 | 1 | 7229 | 1342 | -5887 | counted | -5886842 | No Node counterpart; harness assumption that typing inside an array is one fifth as frequent as flat typing. |
| first-key-flat-500-validate | 1 | 1 | 9650 | 7900 | -1750 | counted | -1750 | One first key per session: the owner rule's one-off first-write term, kept as its own row. |
| rebuild-flat-500 | 5 | 1 | — | — | — | 0.16.1 has no rebuild, so the row is excluded from this comparison. | 0 | Matches the Node bulk rows (weight 5). |

가중 교환비 Σ(가중치 × Δ) = -5888592 µs (폭 안 행은 0, 음수가 개선); 가중 기준 합 = 12751755 µs; 가중 후보 합 = 7100005 µs; 가중 비율 = 0.557.
제외 행: mount-flat-500-none: < 50 ms 관측 불가; mount-flat-500-validate: < 50 ms 관측 불가; mount-if-flat-500-none: < 50 ms 관측 불가; mount-if-flat-500-validate: < 50 ms 관측 불가; mount-nested-d5-f4-validate: < 50 ms 관측 불가; mount-array-1000-validate: < 50 ms 관측 불가; rebuild-flat-500: 0.16.1 has no rebuild, so the row is excluded from this comparison.

### 피드백 교환비 (exact 쓰기의 조건부 평균) (feedbackCommittedMs)

| 사례 | 가중치 | k | 기준 µs | 후보 µs | Δ µs/event | 계산 | 기여 µs | 근거 |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | --- |
| mount-flat-500-none | 1 | 1 | — | — | — | not observable | 0 | One mount per session; matches the Node table's mount rows (weight 1). |
| mount-flat-500-validate | 1 | 1 | 228700 | 213600 | -15100 | counted | -15100 | One mount per session; matches the Node table's mount rows (weight 1). |
| mount-if-flat-500-none | 1 | 1 | — | — | — | not observable | 0 | One mount per session; matches the Node table's mount rows (weight 1). |
| mount-if-flat-500-validate | 1 | 1 | 224100 | 246100 | 22000 | counted | 22000 | One mount per session; matches the Node table's mount rows (weight 1). |
| mount-nested-d5-f4-validate | 1 | 1 | 482000 | 406050 | -75950 | counted | -75950 | One mount per session; matches the Node table's mount-nested row (weight 1). |
| mount-array-1000-validate | 1 | 1 | 617600 | 550400 | -67200 | counted | -67200 | One mount per session; matches the Node table's mount rows (weight 1). |
| type-flat-500-validate-nonburst | 5000 | 1 | 15771 | 16163 | 392 | within noise | 0 | The browser path goes through the FieldProxy subscription, so it matches the Node 'typing with subscribers' row (weight 5000). |
| type-array-1000-validate-nonburst | 1000 | 1 | 22547 | 25697 | 3150 | counted | 3150000 | No Node counterpart; harness assumption that typing inside an array is one fifth as frequent as flat typing. |
| first-key-flat-500-validate | 1 | 1 | 23500 | 21350 | -2150 | counted | -2150 | One first key per session: the owner rule's one-off first-write term, kept as its own row. |
| rebuild-flat-500 | 5 | 1 | — | — | — | 0.16.1 has no rebuild, so the row is excluded from this comparison. | 0 | Matches the Node bulk rows (weight 5). |

가중 교환비 Σ(가중치 × Δ) = 3011600 µs (폭 안 행은 0, 음수가 개선); 가중 기준 합 = 102978532 µs; 가중 후보 합 = 107950658 µs; 가중 비율 = 1.048.
제외 행: mount-flat-500-none: not observable; mount-if-flat-500-none: not observable; rebuild-flat-500: 0.16.1 has no rebuild, so the row is excluded from this comparison.

An invalid baseline/control group is retried once, then marked void.
<!-- core-summary:end -->
