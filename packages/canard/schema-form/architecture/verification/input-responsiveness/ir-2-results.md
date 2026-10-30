# IR-2 — 중량 검증 입력 응답성과 D1 발동 측정

2026-10-31. 사전 등록 규칙에 따라 **D1 발동**입니다. flat-2000 비연타 E1 키 처리 p95 **19.100ms**가 16.67ms를 넘었습니다. 해당 행 검증 도착 p95는 7.000ms이며 33.4ms 이내입니다. 배열·중첩 비연타는 두 선을 모두 통과했습니다. 이 단계는 측정과 기록만 수행했으며 D1·G 제품 구현은 없습니다. 이 결과는 D1의 효과나 초과 시간의 원인이 검증임을 입증하는 인과 실험이 아닙니다.

## 입력과 환경

L은 공개 `@canard/schema-form@0.16.1` 별칭이고 E1은 단계 제품 기준 `317f215dc79d5a3892a9c2fbafceb18ccaa222dc`입니다. 두 레인은 같은 현재 workspace AJV8 플러그인의 실제 compile/validate를 사용합니다. L에는 CustomFormTypeRenderer, E1에는 FieldRenderer로 동일한 input-only 렌더러를 전달합니다. 제품 소스 차분은 0입니다. 측정 도구 커밋은 `6f9bb4455487b9eabb32683a164cf694dad0073a`이며 도구·픽스처 파일별 해시는 [정식 시작 기록](raw/ir-2/main/formal-start.json)에 있습니다.

Chromium 145.0.7632.6, Playwright 1.58.0, React 19.2.6 production, esbuild 0.25.9, AJV 8.17.1, Node v26.12.1입니다. Apple M1 Max, 10 논리 코어, RAM 64GiB, darwin 27.0.0 arm64, viewport 900×700입니다. Node는 IR-0/IR-1의 v24.20.0과 다릅니다. 과거 단계와 절대 시간 비율을 만들지 않고 같은 창 L/E1을 비교합니다.

제품 번들의 SHA-256은 L `5f6b0171b3c53f44e259a1c5e1049e48c9ea0ecae6509d821749e36295489c46`(260013바이트), E1 `3617ff8fe7f2f739803853dce86a1b4913a220b588712b2adf46b6a0a986aac4`(857292바이트)입니다. production 페이지 번들의 해시도 [입력 manifest](raw/ir-2/main/inputs.json)에 보존했습니다. 기존 prepareStageBundle을 재사용하여 manifest의 stage 표시는 IR-1로 남아 있습니다. [입력 정정](raw/ir-2/main/input-correction.json)은 이를 IR-2로 식별하고 준비 당시 미커밋 도구 상태와 정식 도구 커밋을 구별하며 원문은 유지합니다. 제품·페이지 바이트는 스모크와 정식 창에서 동일한 해시로 동결했습니다.

## 픽스처와 관찰 경계

- `type-array-1000-validate-*`: 기존 array-1000 생성기, 객체 항목 1000개·primitive 입력 3000개, 항목 0의 `/items/0/name`을 편집합니다. name 스키마의 pattern은 모든 항목에 적용되므로 기존 이름에서도 오류가 생길 수 있고 편집 항목의 홀짝 변화가 전체 오류 결과를 바꿉니다.
- `type-nested-d5-f4-validate-*`: 깊이 5·분기 4의 기존 생성기, 잎 입력 1024개 중 가장 깊은 `/n0/n0/n0/n0/n0`를 편집합니다.
- `type-flat-2000-validate-*`: flat-500과 같은 `buildFlatSchema(2000)`, 문자열 2000개 중 `/field_000`을 편집합니다.
- 타이핑은 모두 AJV8 OnChange, 해당 잎의 홀짝 pattern `^(?:..)*$`, 실제 키 20개입니다. 비연타는 호출 시작 간격 100ms이고 keyboard.type의 delay 옵션을 사용하지 않습니다. 연타는 지연 없이 전송하며 보고 전용입니다. 매 키 trusted 입력, 최종 DOM/노드 문자열, 비연타의 20개 바뀌는 판정 배달을 확인했습니다.
- 마운트는 flat-500·nested-d5-f4·if-flat-500의 validationMode prop을 생략하여 공개 기본 OnChange를 사용하고 가상화는 off입니다. eager painted는 render 시작부터 첫 입력 준비 뒤 double-rAF까지이며, 프레임 창은 render 시작부터 정확히 1000ms입니다. observer는 후속 배달을 기다린 뒤 정지합니다. 마운트에는 판정하지 않습니다.
- if-flat-500은 IR-1의 [가드 프로파일 입력](raw/ir-1/guard-profile-inputs.json)을 찾아 재구성했습니다. 루트 object의 `field_0`부터 `field_499`는 기본값 없는 string, `kind`는 string·default a입니다. `if.properties.kind.const`는 a, `then.properties.field_0.minLength`는 2이며 입력은 501개입니다. IR-1의 검증 None 프로파일과 달리 이번 행은 기본 OnChange이고 값·분기 변경은 없습니다.

## 창과 표본

코디네이터의 [window clear 승인](raw/ir-2/main/window-authorization.json)은 2026-10-30T17:11:52Z입니다. 이후 17:12:05.185Z~17:12:35.331Z의 30초 정숙 관찰을 첫 시도에 통과했습니다. 최대 외부 PID 평균은 mds 26.706%였고 30%를 넘은 PID는 없었습니다. 거절은 0회이며 승인된 시작 기록의 표본 수는 0입니다.

정식 창은 2026-10-30T17:12:35.547Z~2026-10-30T17:19:30.663Z입니다. 픽스처·레인마다 새 페이지 3회 예열을 버리고 10개를 보존하여 총 9행×2레인×10=180표본입니다. 표본 번호의 짝수는 L/E1, 홀수는 E1/L 순서입니다. 전체 CLI 스모크는 각 1예열·1새페이지로 별도 보존했고 정식 표본에 합치지 않았습니다. 시작한 창의 중단·표본 폐기·완료 표본 재측정은 모두 0회이며 빌드·시험·lint·typecheck를 겹치지 않았습니다.

여기서 정숙은 시작 전 관찰의 통과를 뜻합니다. 창 내부 50/180페이지에는 외부 PID 평균 30% 초과가 관측되었으며 원칙대로 모두 보존했습니다. mds_stores·mdworker_shared·BetterTouchTool·codex 등의 부하는 [CPU 귀속](raw/ir-2/main/cpu-attribution.json)과 페이지별 원시에 있습니다. flat-2000 비연타는 L/E1 모두 10페이지에서 단일 외부 PID 평균 30% 초과가 없었고, E1 최댓값 19.100ms는 표본 9입니다. 이 관찰은 외부 영향이 없었다는 증명이 아닙니다. 3회 거절 조건에 이르지 않아 paired relative 모드와 그 후속 정숙 재측정 규칙은 적용하지 않았습니다.

## 집계와 사전 등록 판정

시간 단위는 ms이며 중앙/p95는 표본 중앙값들의 중앙값과 표본 p95들의 nearest-rank p95입니다. 10표본의 후자는 표본 p95 중 최댓값입니다. Event Timing은 durationThreshold=16으로 선택된 항목의 interactionId별 최대 처리 시간과 전체 duration을 따로 집계합니다. 관측 수/표본 수를 함께 적으며 문턱 아래의 빠른 입력을 0으로 보간하지 않습니다. handler는 모든 input의 document capture→bubble 벽시계로 ET와 혼합하지 않습니다. ET 관측이 없을 때만 handler p95를 대체 관문으로 사용하며 이번 비연타 관문 세 행은 모두 ET 관측값입니다.

검증 도착은 input capture부터 해당 키의 첫 onValidate까지입니다. 연타의 배달은 배달 시점 최신 키에 귀속하며 L의 미배달을 무한 지연이나 검증 미실행으로 해석하지 않습니다. 긴 애니메이션 프레임은 창과 겹치는 항목의 최댓값과 ≥50ms 개수입니다. API가 지원되지만 검출이 없으면 `<50 (검출 0)`이고 미지원은 `지원 없음`이며, 정확한 0ms로 바꾸지 않습니다.

E1/L 행은 각 레인의 해당 집계 통계끼리 나눈 참고 비율입니다. 별도의 짝 표는 같은 픽스처·표본 번호의 L을 기준으로 차이·비율을 구한 뒤 중앙값을 취합니다. 짝 p95 중앙값이나 비율을 고정 p95 관문 대신 사용하지 않습니다. 프레임이 검열되면 비율을 만들지 않습니다. 시작 관찰을 통과한 창의 직접 p95와 최장 통계를 보존하며 상대 비교 모드의 잠정 환산은 만들지 않았습니다.

사전 등록 규칙은 **비연타 E1 처리 p95>16.67ms 또는 검증 도착 p95>33.4ms인 행이 하나라도 있으면 D1 발동**입니다. flat-2000의 19.100ms로 발동하며 검증 도착 자체는 세 행 모두 통과합니다. 연타와 마운트에는 이 규칙이나 관문 판정을 적용하지 않습니다.

<!-- IR2_TABLES_START -->
### type-array-1000-validate-nonburst

| 레인 | ET 처리 중앙/p95 | ET 전체 중앙/p95 | handler 중앙/p95 | 최장 프레임 | ≥50ms 개수 | 검증 도착 중앙/p95 | 미배달 | ET 관측 수/표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| L | 6.875 / 9.100 | 16.000 / 24.000 | 5.375 / 6.800 | <50 (검출 0) | 0 | 17.175 / 23.000 | 0/200 | 200/10 |
| E1 | 8.550 / 11.700 | 20.000 / 24.000 | 6.900 / 9.400 | <50 (검출 0) | 0 | 2.025 / 3.000 | 0/200 | 200/10 |
| E1/L | 1.244 / 1.286 | 1.250 / 1.000 | 1.284 / 1.382 | 검열로 계산 안 함 | — | 0.118 / 0.130 | — | — |

### type-array-1000-validate-burst

| 레인 | ET 처리 중앙/p95 | ET 전체 중앙/p95 | handler 중앙/p95 | 최장 프레임 | ≥50ms 개수 | 검증 도착 중앙/p95 | 미배달 | ET 관측 수/표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| L | 3.900 / 7.600 | 24.000 / 40.000 | 3.000 / 3.700 | <50 (검출 0) | 0 | 9.975 / 14.900 | 144/200 | 140/10 |
| E1 | 4.550 / 9.500 | 16.000 / 40.000 | 3.525 / 4.700 | <50 (검출 0) | 0 | 1.000 / 1.500 | 0/200 | 150/10 |
| E1/L | 1.167 / 1.250 | 0.667 / 1.000 | 1.175 / 1.270 | 검열로 계산 안 함 | — | 0.100 / 0.101 | — | — |

### type-nested-d5-f4-validate-nonburst

| 레인 | ET 처리 중앙/p95 | ET 전체 중앙/p95 | handler 중앙/p95 | 최장 프레임 | ≥50ms 개수 | 검증 도착 중앙/p95 | 미배달 | ET 관측 수/표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| L | 4.025 / 8.400 | 16.000 / 24.000 | 0.700 / 1.500 | <50 (검출 0) | 0 | 10.875 / 14.500 | 0/200 | 108/10 |
| E1 | 8.375 / 13.500 | 16.000 / 24.000 | 2.375 / 6.700 | <50 (검출 0) | 0 | 2.150 / 6.500 | 0/200 | 141/10 |
| E1/L | 2.081 / 1.607 | 1.000 / 1.000 | 3.393 / 4.467 | 검열로 계산 안 함 | — | 0.198 / 0.448 | — | — |

### type-nested-d5-f4-validate-burst

| 레인 | ET 처리 중앙/p95 | ET 전체 중앙/p95 | handler 중앙/p95 | 최장 프레임 | ≥50ms 개수 | 검증 도착 중앙/p95 | 미배달 | ET 관측 수/표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| L | 0.925 / 2.200 | 16.000 / 24.000 | 0.225 / 0.500 | <50 (검출 0) | 0 | 8.350 / 12.800 | 186/200 | 79/10 |
| E1 | 1.500 / 13.400 | 16.000 / 24.000 | 0.800 / 3.900 | <50 (검출 0) | 0 | 0.700 / 3.600 | 0/200 | 121/10 |
| E1/L | 1.622 / 6.091 | 1.000 / 1.000 | 3.556 / 7.800 | 검열로 계산 안 함 | — | 0.084 / 0.281 | — | — |

### type-flat-2000-validate-nonburst

| 레인 | ET 처리 중앙/p95 | ET 전체 중앙/p95 | handler 중앙/p95 | 최장 프레임 | ≥50ms 개수 | 검증 도착 중앙/p95 | 미배달 | ET 관측 수/표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| L | 6.425 / 12.500 | 16.000 / 32.000 | 3.575 / 4.700 | <50 (검출 0) | 0 | 13.650 / 18.900 | 0/200 | 155/10 |
| E1 | 7.900 / 19.100 | 16.000 / 32.000 | 4.150 / 8.100 | <50 (검출 0) | 0 | 3.225 / 7.000 | 0/200 | 172/10 |
| E1/L | 1.230 / 1.528 | 1.000 / 1.000 | 1.161 / 1.723 | 검열로 계산 안 함 | — | 0.236 / 0.370 | — | — |

### type-flat-2000-validate-burst

| 레인 | ET 처리 중앙/p95 | ET 전체 중앙/p95 | handler 중앙/p95 | 최장 프레임 | ≥50ms 개수 | 검증 도착 중앙/p95 | 미배달 | ET 관측 수/표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| L | 3.100 / 5.600 | 16.000 / 24.000 | 1.900 / 2.400 | <50 (검출 0) | 0 | 8.000 / 14.400 | 130/200 | 127/10 |
| E1 | 3.100 / 6.700 | 16.000 / 24.000 | 1.900 / 3.100 | <50 (검출 0) | 0 | 1.400 / 2.700 | 0/200 | 115/10 |
| E1/L | 1.000 / 1.196 | 1.000 / 1.000 | 1.000 / 1.292 | 검열로 계산 안 함 | — | 0.175 / 0.187 | — | — |

### mount-flat-500-validate

| 레인 | eager painted 중앙/p95 | 첫 1초 최장 프레임 | ≥50ms 개수 | DOM eager/all |
| --- | ---: | ---: | ---: | ---: |
| L | 97.450 / 102.300 | 80.600 | 10 | 1504.000 / 1504.000 |
| E1 | 84.600 / 87.600 | 80.800 | 10 | 1504.000 / 1504.000 |
| E1/L | 0.868 / 0.856 | 1.002 | — | — |

### mount-nested-d5-f4-validate

| 레인 | eager painted 중앙/p95 | 첫 1초 최장 프레임 | ≥50ms 개수 | DOM eager/all |
| --- | ---: | ---: | ---: | ---: |
| L | 197.900 / 200.700 | 154.600 | 10 | 3756.000 / 3756.000 |
| E1 | 162.200 / 179.900 | 166.700 | 10 | 3756.000 / 3756.000 |
| E1/L | 0.820 / 0.896 | 1.078 | — | — |

### mount-if-flat-500-validate

| 레인 | eager painted 중앙/p95 | 첫 1초 최장 프레임 | ≥50ms 개수 | DOM eager/all |
| --- | ---: | ---: | ---: | ---: |
| L | 95.900 / 97.600 | 81.700 | 10 | 1507.000 / 1507.000 |
| E1 | 121.850 / 124.900 | 118.600 | 10 | 1507.000 / 1507.000 |
| E1/L | 1.271 / 1.280 | 1.452 | — | — |

### 같은 표본 L과 짝 비교

| 픽스처 | 지표 | E1−L 중앙 ms | E1/L 중앙 | 유효 짝 |
| --- | --- | ---: | ---: | ---: |
| type-array-1000-validate-nonburst | wallMs | -49.400 | 0.819 | 10/10 |
| type-array-1000-validate-nonburst | eagerPaintedMs | -49.050 | 0.817 | 10/10 |
| type-array-1000-validate-nonburst | allRevealedMs | -49.050 | 0.817 | 10/10 |
| type-array-1000-validate-nonburst | processingP95 | 2.000 | 1.250 | 10/10 |
| type-array-1000-validate-nonburst | handlerP95 | 2.000 | 1.299 | 10/10 |
| type-array-1000-validate-nonburst | validationP95 | -18.150 | 0.128 | 10/10 |
| type-array-1000-validate-nonburst | longestFrame | 관측 없음 | 관측 없음 | 0/10 |
| type-array-1000-validate-burst | wallMs | -48.050 | 0.822 | 10/10 |
| type-array-1000-validate-burst | eagerPaintedMs | -48.050 | 0.819 | 10/10 |
| type-array-1000-validate-burst | allRevealedMs | -48.050 | 0.819 | 10/10 |
| type-array-1000-validate-burst | processingP95 | 1.800 | 1.250 | 10/10 |
| type-array-1000-validate-burst | handlerP95 | 0.950 | 1.267 | 10/10 |
| type-array-1000-validate-burst | validationP95 | -12.550 | 0.098 | 10/10 |
| type-array-1000-validate-burst | longestFrame | 관측 없음 | 관측 없음 | 0/10 |
| type-nested-d5-f4-validate-nonburst | wallMs | -36.200 | 0.821 | 10/10 |
| type-nested-d5-f4-validate-nonburst | eagerPaintedMs | -35.150 | 0.826 | 10/10 |
| type-nested-d5-f4-validate-nonburst | allRevealedMs | -35.150 | 0.826 | 10/10 |
| type-nested-d5-f4-validate-nonburst | processingP95 | 5.850 | 1.797 | 10/10 |
| type-nested-d5-f4-validate-nonburst | handlerP95 | 4.850 | 4.743 | 10/10 |
| type-nested-d5-f4-validate-nonburst | validationP95 | -8.200 | 0.410 | 10/10 |
| type-nested-d5-f4-validate-nonburst | longestFrame | 관측 없음 | 관측 없음 | 0/10 |
| type-nested-d5-f4-validate-burst | wallMs | -36.650 | 0.818 | 10/10 |
| type-nested-d5-f4-validate-burst | eagerPaintedMs | -36.450 | 0.818 | 10/10 |
| type-nested-d5-f4-validate-burst | allRevealedMs | -36.450 | 0.818 | 10/10 |
| type-nested-d5-f4-validate-burst | processingP95 | 11.550 | 9.962 | 10/10 |
| type-nested-d5-f4-validate-burst | handlerP95 | 1.600 | 5.000 | 10/10 |
| type-nested-d5-f4-validate-burst | validationP95 | -10.000 | 0.158 | 7/10 |
| type-nested-d5-f4-validate-burst | longestFrame | 관측 없음 | 관측 없음 | 0/10 |
| type-flat-2000-validate-nonburst | wallMs | -42.250 | 0.846 | 10/10 |
| type-flat-2000-validate-nonburst | eagerPaintedMs | -42.100 | 0.846 | 10/10 |
| type-flat-2000-validate-nonburst | allRevealedMs | -42.100 | 0.846 | 10/10 |
| type-flat-2000-validate-nonburst | processingP95 | 6.000 | 1.612 | 10/10 |
| type-flat-2000-validate-nonburst | handlerP95 | 2.450 | 1.551 | 10/10 |
| type-flat-2000-validate-nonburst | validationP95 | -11.900 | 0.344 | 10/10 |
| type-flat-2000-validate-nonburst | longestFrame | 관측 없음 | 관측 없음 | 0/10 |
| type-flat-2000-validate-burst | wallMs | -39.100 | 0.856 | 10/10 |
| type-flat-2000-validate-burst | eagerPaintedMs | -39.100 | 0.856 | 10/10 |
| type-flat-2000-validate-burst | allRevealedMs | -39.100 | 0.856 | 10/10 |
| type-flat-2000-validate-burst | processingP95 | -1.000 | 0.810 | 10/10 |
| type-flat-2000-validate-burst | handlerP95 | 0.700 | 1.321 | 10/10 |
| type-flat-2000-validate-burst | validationP95 | -8.000 | 0.237 | 10/10 |
| type-flat-2000-validate-burst | longestFrame | 관측 없음 | 관측 없음 | 0/10 |
| mount-flat-500-validate | wallMs | -12.350 | 0.874 | 10/10 |
| mount-flat-500-validate | eagerPaintedMs | -12.300 | 0.874 | 10/10 |
| mount-flat-500-validate | allRevealedMs | -12.300 | 0.874 | 10/10 |
| mount-flat-500-validate | processingP95 | 관측 없음 | 관측 없음 | 0/10 |
| mount-flat-500-validate | handlerP95 | 관측 없음 | 관측 없음 | 0/10 |
| mount-flat-500-validate | validationP95 | 관측 없음 | 관측 없음 | 0/10 |
| mount-flat-500-validate | longestFrame | 1.800 | 1.024 | 10/10 |
| mount-nested-d5-f4-validate | wallMs | -36.200 | 0.818 | 10/10 |
| mount-nested-d5-f4-validate | eagerPaintedMs | -35.650 | 0.819 | 10/10 |
| mount-nested-d5-f4-validate | allRevealedMs | -35.650 | 0.819 | 10/10 |
| mount-nested-d5-f4-validate | processingP95 | 관측 없음 | 관측 없음 | 0/10 |
| mount-nested-d5-f4-validate | handlerP95 | 관측 없음 | 관측 없음 | 0/10 |
| mount-nested-d5-f4-validate | validationP95 | 관측 없음 | 관측 없음 | 0/10 |
| mount-nested-d5-f4-validate | longestFrame | -1.500 | 0.990 | 10/10 |
| mount-if-flat-500-validate | wallMs | 22.700 | 1.237 | 10/10 |
| mount-if-flat-500-validate | eagerPaintedMs | 25.950 | 1.271 | 10/10 |
| mount-if-flat-500-validate | allRevealedMs | 25.950 | 1.271 | 10/10 |
| mount-if-flat-500-validate | processingP95 | 관측 없음 | 관측 없음 | 0/10 |
| mount-if-flat-500-validate | handlerP95 | 관측 없음 | 관측 없음 | 0/10 |
| mount-if-flat-500-validate | validationP95 | 관측 없음 | 관측 없음 | 0/10 |
| mount-if-flat-500-validate | longestFrame | 37.150 | 1.488 | 10/10 |

### 사전 등록 관문

| 비연타 행 | E1 처리 p95 | 처리 ≤16.67 | E1 검증 도착 p95 | 도착 ≤33.4 |
| --- | ---: | --- | ---: | --- |
| type-array-1000-validate-nonburst | 11.700 (event) | pass | 3.000 | pass |
| type-nested-d5-f4-validate-nonburst | 13.500 (event) | pass | 6.500 | pass |
| type-flat-2000-validate-nonburst | 19.100 (event) | fail | 7.000 | pass |

기계적 규칙 결과: D1 발동. 시작 전 정숙 관찰을 통과한 창입니다.

### 창 내부 외부 CPU

외부 PID 평균 30% 초과 페이지: 50/180. 시작 관찰 통과는 창 전체의 무부하를 뜻하지 않습니다.

| 픽스처 | L 부하 페이지 | E1 부하 페이지 |
| --- | ---: | ---: |
| type-array-1000-validate-nonburst | 2/10 | 2/10 |
| type-array-1000-validate-burst | 10/10 | 10/10 |
| type-nested-d5-f4-validate-nonburst | 0/10 | 0/10 |
| type-nested-d5-f4-validate-burst | 2/10 | 1/10 |
| type-flat-2000-validate-nonburst | 0/10 | 0/10 |
| type-flat-2000-validate-burst | 0/10 | 0/10 |
| mount-flat-500-validate | 4/10 | 4/10 |
| mount-nested-d5-f4-validate | 7/10 | 7/10 |
| mount-if-flat-500-validate | 1/10 | 0/10 |
<!-- IR2_TABLES_END -->

발동 근거의 구성입니다. flat-2000 비연타 E1은 페이지마다 관측 상호작용이 12~19개라 페이지별 p95가 곧 그 페이지의 최댓값이며, 19.100ms는 관측된 172개 상호작용 전체의 최댓값입니다. 표본 0~9의 페이지별 p95는 13.9, 15.6, 15.8, 17.1, 14.4, 16.2, 16.2, 12.1, 14.6, 19.1ms이고 중앙값은 15.7ms입니다. 16.67ms를 넘은 키는 200개 중 2개(표본 3의 10번째 키 17.1ms, 표본 9의 18번째 키 19.1ms)이며, 관측 172개를 모은 p95는 14.4ms입니다. 표본 9를 빼도 17.1ms로 발동하지만 표본 3과 9를 모두 빼면 16.2ms로 발동하지 않습니다. 같은 행의 L은 16.67ms를 넘은 키가 없고 최댓값은 12.5ms입니다. E1의 onValidate는 관측 172건 모두 keypress 처리 구간 안에 도착했고 L은 0건이므로, E1의 처리값에는 검증이 들어 있고 L에는 없습니다.

## 재현과 검사

[완료 기록](raw/ir-2/main/complete.json.gz), [전체 페이지](raw/ir-2/main/pages.json.gz), [10초 주기 CPU 관찰](raw/ir-2/main/cpu.json.gz), [스모크 완료](raw/ir-2/main/smoke-complete.json.gz), [스모크 페이지](raw/ir-2/main/smoke-pages.json.gz)를 보존했습니다. file URL의 준비 폴더만 `ir0:` 주소로 정규화했고 수치와 페이지 경계는 바꾸지 않았습니다. 준비 실패와 수정 전 fixture 실패도 [정적 검사 기록](raw/ir-2/static-checks.json)에 남겼습니다.

저장소 루트의 `yarn workspace @aileron/benchmark-form check:browser-results --stage=ir-2`가 원시 페이지별 요약, 180표본 수량·교대 순서·키·배달·입력 수, 시작 승인·정숙 기록·번들 동결, summary·pairs·decision·cpu-attribution JSON과 이 문서의 모든 표를 재생성하여 비교합니다. `--write`는 같은 원시로부터 파생 파일만 생성하는 모드입니다. 원시나 정식 표본을 다시 측정하는 명령이 아닙니다.

benchmark-form 지정 전체 시험 4파일·30시험, browser typecheck, lint와 schema-form·AJV8·필요한 winglet 지정 빌드가 통과했습니다. 새 fixture 시험 6개는 기준 선택기에서 요구 차이로 모두 실패한 뒤 현재 선택기에서 통과했습니다. CPU 귀속과 표 대조 보완은 정식 창 종료 뒤 집계 도구에만 추가했습니다. gzip을 풀어 포함한 전체 차분 기계 경로 감사와 제품 소스 차분 0을 확인합니다. FCA 스캔은 측정 전용 프로토콜에 따라 실행하지 않았습니다. 독립 관문과 PR 생성은 코디네이터가 담당합니다.

## 미결 항목

D1 발동은 구현을 위한 측정 조건 충족이며 구현 효과의 증거가 아닙니다. 후속 구현 전 설계 v2의 mount reporter·sink 표면, 슬롯 1회 실행·100ms 경주, 하위 트리 pending 보존, 결정적 시험 도우미·계약 기록을 따라야 합니다. G의 공개 플러그인 순서 계약과 마운트 컴파일 실패 표면 변화는 소유자 결정 사항입니다. 이번 브랜치는 D1·G나 virtualization 기본값을 변경하지 않습니다. if 마운트에서 E1의 첫 화면·최장 프레임이 L보다 큰 관측도 보고 전용으로 보존하며 별도 성능 효과를 추정하지 않습니다.

판정: 소유자 대기
