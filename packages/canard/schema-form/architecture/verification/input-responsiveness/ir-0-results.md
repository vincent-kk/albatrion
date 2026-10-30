# IR-0 — 실제 브라우저 입력 응답성 기준선

## 입력과 환경

이 단계는 측정 장치와 새 기록만 추가했습니다. E는 `5d1348ed16054efa1ec431945eb00472f4eef7f1`, S는 `0eb03ff3bb54bf06af95271d157aefece1b9bf32`, L은 공개 `@canard/schema-form@0.16.1` 별칭입니다. L의 Git 원본 SHA는 배포 메타데이터에 없으므로 배포 번들의 SHA-256으로 식별합니다. S는 기존 분기 전환 iv-5 준비 산출물의 SHA/sourceProof와 번들 해시를 대조해 제품 수정 없이 사용했습니다. S는 렌더러 설정 불일치 때문에 본표와 관문에서 제외하고 모든 원시를 보존했습니다. 자세한 이유는 아래와 같습니다.

기본 mount CLI의 [harness.tsx:58](../../../../../aileron/benchmark-form/browser-bench/harness.tsx#L58)은 `445e0f517ceafbc86d4233dcf60ef386e7a4a52c`에서 prop을 `CustomFieldRenderer`에서 `FieldRenderer`로 바꿨으므로 이 커밋 이전의 mount-mode 수치는 이 문서의 수치와 비교할 수 없습니다.

S는 실제로 기본 FieldRenderer를 사용했습니다. 장치가 S를 L처럼 CustomFormTypeRenderer prop으로 분류했지만 S의 공개 FormProps는 FieldRenderer를 받으므로 해당 prop이 무시됐습니다. L은 CustomFormTypeRenderer에, E는 FieldRenderer에 동일한 input-only PassRenderer를 연결했습니다. 창 도중 S의 보존된 FormProps를 읽어 설정 오류를 확인했고, 첫 flat-500 표본의 all DOM 수 L 1504·S 3504·E 1504로 검출했습니다. 코디네이터 지시로 창은 끝까지 계속하고 S만 본표·관문에서 제외했습니다. S 수정 창은 열지 않았으며 S 수치를 L/E와 비교하지 않습니다. 선택과 사유는 [레인 분류](raw/ir-0/selection.json)에 있습니다.

도구 커밋은 `445e0f517ceafbc86d4233dcf60ef386e7a4a52c`입니다. Chromium 145.0.7632.6, Playwright 1.58.0, React 19.2.6 production, esbuild 0.25.9, AJV 8.17.1, Node v24.20.0를 사용했습니다. 기계는 Apple M1 Max, 10 논리 코어, 64 GiB RAM, darwin 27.0.0 arm64이며 viewport는 900×700입니다. 검증은 AJV8 기본 플러그인의 실제 compile/validate 경로입니다. L도 0.16.1 당시의 플러그인이 아닌 현재 workspace의 ajv8 plugin dist로 검증했습니다. 초기 manifest는 benchmark-form에서 무관한 호이스트 AJV 6.12.6을 읽었으므로 원문은 보존하고, 실제 플러그인 기준 모듈 해석 및 동결된 브라우저 번들의 AJV8 경로를 확인한 [환경 정정](raw/ir-0/environment-correction.json)을 덧붙였습니다. 측정은 다시 하지 않았습니다.

정식 창은 2026-10-30T12:27:27.649Z~2026-10-30T12:37:34.615Z입니다. 코디네이터 허가 뒤 30초 정숙 관찰을 한 번씩 수행했고 시작 거절은 0회(각 0표본)입니다. 시작한 창의 중단과 완료 표본 재측정은 0회입니다. 이후 외부 CPU는 원시에만 보존했으며 중단 조건으로 쓰지 않았습니다. 정식 창에는 빌드·시험·typecheck·lint를 겹치지 않았습니다.

17픽스처×3레인×10새페이지 = 510개 보존 표본입니다. 본표는 L/E 340개이며 S 170개는 원시 보존 전용입니다. 각 픽스처·레인의 새 페이지 3회 예열은 버렸습니다. 레인 순서는 표본별 L/S/E와 E/S/L로 교대했습니다. 기본 mount CLI의 50필드 off/on 스모크와 17픽스처 실제 CLI의 1예열/1표본 스모크는 정식 표본에서 제외했습니다.

입력 번들 식별자는 다음과 같습니다. 전체 페이지 번들 해시와 도구 파일별 해시는 [입력 manifest](raw/ir-0/inputs.json) 및 [정식 시작 기록](raw/ir-0/formal-start.json)에 있습니다.

| 레인 | 제품 번들 SHA-256 | 제품 번들 바이트 |
| --- | --- | ---: |
| L | `5f6b0171b3c53f44e259a1c5e1049e48c9ea0ecae6509d821749e36295489c46` | 260013 |
| S | `0896a2b1fd02d558836f2df78b80976df38e0d3552202c686484ad6be4dbafb6` | 750818 |
| E | `396a9f884a10a493be64de67d89c204862236339fb7ecf9154c0a1fb91ee659d` | 857033 |

## 지표 읽는 법

시간은 ms, 각 셀은 중앙값 / p95입니다. 표본마다 상호작용 분포의 중앙값과 nearest-rank p95를 만들고, 표에서는 표본 중앙값들의 중앙값과 표본 p95들의 p95를 씁니다. 보존 표본은 10개이므로 뒤의 p95는 표본 p95 중 최댓값입니다.

Event Timing(ET)은 `event`의 `durationThreshold=16`과 `first-input`을 PerformanceObserver로 구독했습니다. 표의 ET 처리/전체 시간은 창 안의 양수 interactionId별 최대 `processingEnd−processingStart` / 최대 `duration`을 각각 집계한 값입니다. 문턱에 가린 짧은 사건은 0으로 채우지 않았습니다. 각 표 아래에 관측 상호작용 수와 관측 표본 수를 적습니다. `first-input`을 포함해 전달된 모든 항목은 원시에 있습니다.

handler 벽시계는 실제 DOM `input`/`change` 이벤트의 document capture부터 document bubble까지 페이지 performance.now()로 잰 값입니다. React 루트의 이벤트 처리와 동기 렌더 구간을 포함하며 ET 처리 시간과 같은 지표로 합치지 않습니다. 타이핑의 20키(배열 교체는 10키)는 모두 keyboard.type을 한 키씩 호출했고 delay 옵션을 사용하지 않았으며 trusted=true와 최종 DOM/노드 문자열을 검사했습니다. oneOf는 DOM selectOption으로 10회 교대했으므로 change는 합성 이벤트(trusted=false)입니다. 이 행의 ET는 대상이 없고 handler 벽시계만 있습니다.

Long Animation Frames는 창과 겹치는 항목의 최장 시간과 50ms 이상 개수입니다. 최장은 10표본의 최댓값, 개수는 10표본 합입니다. API는 50ms 이상 프레임만 전달하므로 항목이 없으면 실제 최장을 0ms라 하지 않고 `<50 (검출 0)`으로 표시했습니다. API 미지원은 `지원 없음`으로 적습니다.

검증 도착은 해당 키의 input capture부터 첫 onValidate까지입니다. 시작점은 keydown이 아닌 document input capture이며 각 배달은 배달 시점의 최신 키에 귀속되므로 이 귀속 방식의 영향은 burst 행에 한정됩니다. 동일 오류 결과를 계속 내는 정상 입력은 L/E 모두 배달이 억제되므로 미배달 수를 그대로 적었습니다. E의 근거는 [reportRootLoadValidation](../../../src/providers/RootNodeContext/utils/reportRootLoadValidation.ts) 및 [동일 결과 검증 계약](../../../src/core/engine/validation/__tests__/validation.unchanged-result.test.ts)입니다. L의 원시 관측과 같은 억제는 보존된 [구엔진 __setGlobalErrors__](../../../src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts)에서도 확인됩니다. 미배달은 검증기 실행 없음이나 검증 지연 무한대라는 뜻으로 바꾸지 않습니다.

승인된 보조 pattern `^(?:..)*$`는 입력 길이의 홀짝으로 매 키 유효성을 바꿉니다. flat/nested 각각 비연타(호출 시작 간격 100ms, 검증 도착 관문)와 burst(20키를 가능한 빠르게 전송, 보고 전용)를 분리했습니다. 비연타의 모든 changed verdict 배달을 스모크와 정식 실행에서 검사했습니다. 비연타 100ms 간격은 Node 쪽에서 조절하며 페이지 안의 input capture 간격은 최소 88.8ms까지 내려갑니다. 같은 키당 작업에서 비연타 행의 처리 중앙값은 burst 행의 3~5배입니다(E flat-500: 5.750 대 1.225ms).

## 상호작용별 결과

### type-flat-500

| 레인 | ET 처리 중앙/p95 | ET 전체 중앙/p95 | handler 중앙/p95 | 최장 프레임 | ≥50ms 개수 | 검증 도착 중앙/p95 | 미배달 키 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| L | 1.075 / 2.900 | 16.000 / 16.000 | 0.600 / 1.000 | <50 (검출 0) | 0 | 관측 없음 / 관측 없음 | 200/200 |
| E | 0.800 / 4.600 | 16.000 / 16.000 | 0.450 / 1.000 | <50 (검출 0) | 0 | 관측 없음 / 관측 없음 | 200/200 |

ET 관측(상호작용 수 / 10표본 중 관측 표본): L 56 / 8, E 85 / 10.

### type-nested-d5-f4

| 레인 | ET 처리 중앙/p95 | ET 전체 중앙/p95 | handler 중앙/p95 | 최장 프레임 | ≥50ms 개수 | 검증 도착 중앙/p95 | 미배달 키 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| L | 1.000 / 6.400 | 16.000 / 16.000 | 0.200 / 0.500 | <50 (검출 0) | 0 | 관측 없음 / 관측 없음 | 200/200 |
| E | 1.200 / 6.900 | 16.000 / 24.000 | 0.575 / 0.900 | <50 (검출 0) | 0 | 관측 없음 / 관측 없음 | 200/200 |

ET 관측(상호작용 수 / 10표본 중 관측 표본): L 58 / 10, E 88 / 10.

### type-flat-500-novalidate

| 레인 | ET 처리 중앙/p95 | ET 전체 중앙/p95 | handler 중앙/p95 | 최장 프레임 | ≥50ms 개수 | 검증 도착 중앙/p95 | 미배달 키 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| L | 0.900 / 2.800 | 16.000 / 16.000 | 0.500 / 0.800 | <50 (검출 0) | 0 | — | — |
| E | 0.800 / 4.700 | 16.000 / 16.000 | 0.400 / 0.900 | <50 (검출 0) | 0 | — | — |

ET 관측(상호작용 수 / 10표본 중 관측 표본): L 84 / 8, E 59 / 9.

### type-onchange-state-plain

| 레인 | ET 처리 중앙/p95 | ET 전체 중앙/p95 | handler 중앙/p95 | 최장 프레임 | ≥50ms 개수 | 검증 도착 중앙/p95 | 미배달 키 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| L | 0.925 / 2.700 | 16.000 / 16.000 | 0.525 / 0.900 | <50 (검출 0) | 0 | — | — |
| E | 0.800 / 5.100 | 16.000 / 16.000 | 0.400 / 0.900 | <50 (검출 0) | 0 | — | — |

ET 관측(상호작용 수 / 10표본 중 관측 표본): L 79 / 10, E 51 / 10.

### type-onchange-state-transition

| 레인 | ET 처리 중앙/p95 | ET 전체 중앙/p95 | handler 중앙/p95 | 최장 프레임 | ≥50ms 개수 | 검증 도착 중앙/p95 | 미배달 키 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| L | 0.950 / 2.700 | 16.000 / 16.000 | 0.550 / 0.900 | <50 (검출 0) | 0 | — | — |
| E | 0.800 / 4.600 | 16.000 / 16.000 | 0.400 / 0.900 | <50 (검출 0) | 0 | — | — |

ET 관측(상호작용 수 / 10표본 중 관측 표본): L 70 / 7, E 58 / 7.

### replace-200-while-typing

| 레인 | ET 처리 중앙/p95 | ET 전체 중앙/p95 | handler 중앙/p95 | 최장 프레임 | ≥50ms 개수 | 검증 도착 중앙/p95 | 미배달 키 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| L | 0.500 / 1.600 | 56.000 / 56.000 | 0.250 / 1.400 | 54.600 | 7 | — | — |
| E | 0.625 / 4.000 | 64.000 / 72.000 | 0.425 / 4.100 | 64.000 | 10 | — | — |

ET 관측(상호작용 수 / 10표본 중 관측 표본): L 37 / 9, E 18 / 6.

### switch-oneOf-20

| 레인 | ET 처리 중앙/p95 | ET 전체 중앙/p95 | handler 중앙/p95 | 최장 프레임 | ≥50ms 개수 | 검증 도착 중앙/p95 | 미배달 키 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| L | 대상 없음 | 대상 없음 | 0.250 / 0.900 | <50 (검출 0) | 0 | — | — |
| E | 대상 없음 | 대상 없음 | 1.050 / 5.000 | <50 (검출 0) | 0 | — | — |

ET 관측(상호작용 수 / 10표본 중 관측 표본): L 0 / 0, E 0 / 0.

### validation-flat-500-nonburst

| 레인 | ET 처리 중앙/p95 | ET 전체 중앙/p95 | handler 중앙/p95 | 최장 프레임 | ≥50ms 개수 | 검증 도착 중앙/p95 | 미배달 키 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| L | 4.075 / 9.500 | 16.000 / 16.000 | 1.500 / 2.300 | <50 (검출 0) | 0 | 7.275 / 11.400 | 0/200 |
| E | 5.750 / 10.500 | 16.000 / 16.000 | 2.550 / 4.500 | <50 (검출 0) | 0 | 2.000 / 4.000 | 0/200 |

ET 관측(상호작용 수 / 10표본 중 관측 표본): L 58 / 10, E 79 / 10.

### validation-flat-500-burst

| 레인 | ET 처리 중앙/p95 | ET 전체 중앙/p95 | handler 중앙/p95 | 최장 프레임 | ≥50ms 개수 | 검증 도착 중앙/p95 | 미배달 키 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| L | 1.100 / 3.000 | 16.000 / 16.000 | 0.600 / 1.100 | <50 (검출 0) | 0 | 4.125 / 8.200 | 182/200 |
| E | 1.225 / 5.500 | 16.000 / 16.000 | 0.850 / 1.700 | <50 (검출 0) | 0 | 0.700 / 1.300 | 0/200 |

ET 관측(상호작용 수 / 10표본 중 관측 표본): L 35 / 8, E 56 / 8.

### validation-nested-d5-f4-nonburst

| 레인 | ET 처리 중앙/p95 | ET 전체 중앙/p95 | handler 중앙/p95 | 최장 프레임 | ≥50ms 개수 | 검증 도착 중앙/p95 | 미배달 키 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| L | 3.850 / 6.200 | 16.000 / 16.000 | 0.625 / 1.200 | <50 (검출 0) | 0 | 10.150 / 15.600 | 0/200 |
| E | 6.275 / 13.700 | 16.000 / 24.000 | 1.850 / 5.400 | <50 (검출 0) | 0 | 1.750 / 4.900 | 0/200 |

ET 관측(상호작용 수 / 10표본 중 관측 표본): L 106 / 10, E 109 / 10.

### validation-nested-d5-f4-burst

| 레인 | ET 처리 중앙/p95 | ET 전체 중앙/p95 | handler 중앙/p95 | 최장 프레임 | ≥50ms 개수 | 검증 도착 중앙/p95 | 미배달 키 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| L | 0.900 / 2.200 | 16.000 / 16.000 | 0.200 / 0.400 | <50 (검출 0) | 0 | 7.475 / 13.300 | 170/200 |
| E | 1.500 / 13.700 | 16.000 / 24.000 | 0.800 / 2.000 | <50 (검출 0) | 0 | 0.700 / 1.900 | 0/200 |

ET 관측(상호작용 수 / 10표본 중 관측 표본): L 87 / 10, E 105 / 10.

## virtualization 첫 마운트

검증은 모두 None입니다. on은 virtualization=true의 기본 옵션이며 threshold/eagerCount/rootMargin/backfill을 바꾸지 않았습니다. wall은 기존 harness의 input 수가 macrotask 3회 안정화될 때까지의 render 시작 기준 벽시계입니다. eager painted는 실제 input DOM이 준비된 뒤 double-rAF, all revealed는 placeholder가 모두 사라지고 해당 DOM을 그린 paint까지입니다. eager 때 이미 모두 보이면 같은 paint 시각을 씁니다. DOM 수는 컨테이너 하위 요소 수이며 parent counter를 포함합니다. 시간과 노드 수 셀은 중앙값 / p95입니다.

| 폼 | 가상화 | 레인 | wall ms | eager painted ms | all revealed ms | DOM eager | DOM all | eager placeholder |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| flat-500 | off | L | 52.700 / 53.700 | 52.450 / 53.400 | 52.450 / 53.400 | 1504.0 / 1504 | 1504.0 / 1504 | 0.0 / 0 |
| flat-500 | off | E | 81.850 / 86.700 | 81.650 / 86.300 | 81.650 / 86.300 | 1504.0 / 1504 | 1504.0 / 1504 | 0.0 / 0 |
| flat-500 | on | L | 168.500 / 176.400 | 29.950 / 32.000 | 170.800 / 189.600 | 544.0 / 544 | 1504.0 / 1504 | 480.0 / 480 |
| flat-500 | on | E | 199.850 / 207.700 | 61.900 / 64.600 | 203.200 / 219.200 | 544.0 / 544 | 1504.0 / 1504 | 480.0 / 480 |
| nested-d5-f4 | off | L | 99.150 / 104.800 | 98.500 / 104.100 | 98.500 / 104.100 | 3756.0 / 3756 | 3756.0 / 3756 | 0.0 / 0 |
| nested-d5-f4 | off | E | 155.850 / 157.400 | 155.950 / 157.500 | 155.950 / 157.500 | 3756.0 / 3756 | 3756.0 / 3756 | 0.0 / 0 |
| nested-d5-f4 | on | L | 99.700 / 102.600 | 99.100 / 102.000 | 99.100 / 102.000 | 3756.0 / 3756 | 3756.0 / 3756 | 0.0 / 0 |
| nested-d5-f4 | on | E | 155.700 / 160.200 | 155.650 / 160.000 | 155.650 / 160.000 | 3756.0 / 3756 | 3756.0 / 3756 | 0.0 / 0 |
| array-1000 | off | L | 248.800 / 254.500 | 247.100 / 252.300 | 247.100 / 252.300 | 14011.0 / 14011 | 14011.0 / 14011 | 0.0 / 0 |
| array-1000 | off | E | 214.050 / 216.900 | 210.800 / 213.500 | 210.800 / 213.500 | 14011.0 / 14011 | 14011.0 / 14011 | 0.0 / 0 |
| array-1000 | on | L | 379.850 / 568.000 | 83.350 / 110.400 | 500.950 / 742.400 | 4211.0 / 4211 | 14011.0 / 14011 | 980.0 / 980 |
| array-1000 | on | E | 472.250 / 710.200 | 84.900 / 162.500 | 677.000 / 872.900 | 4211.0 / 4401 | 14011.0 / 14011 | 980.0 / 980 |

모든 표본의 all 시점 placeholder는 0입니다. eager 시점은 첫 그리기 관측 시점의 실제 DOM이므로 이미 드러난 필드도 포함합니다.

## 제안 관문과 대조

처리 관문에는 ET의 문턱 위 관측 p95와 전체 키 handler p95를 나란히 적었습니다. ET 관측이 있으면 그 처리 p95로, ET 관측이 없으면 handler 대체 지표로 pass/fail을 적습니다. handler p95는 원래 ET와 별도로 기록합니다. ET 표본이 문턱으로 선택되므로 전체 키의 완전한 ET 분포라고 해석하지 않습니다. 검증 관문은 보조 비연타의 첫 배달 p95에만 적용합니다.

| 픽스처 | 레인 | 관문 | 관측 ms | 선 ms | 판정 |
| --- | --- | --- | ---: | ---: | --- |
| type-flat-500 | L | 키 처리 p95 | ET 2.900 / handler 1.000 | ≤16.67 | pass |
| type-flat-500 | E | 키 처리 p95 | ET 4.600 / handler 1.000 | ≤16.67 | pass |
| type-nested-d5-f4 | L | 키 처리 p95 | ET 6.400 / handler 0.500 | ≤16.67 | pass |
| type-nested-d5-f4 | E | 키 처리 p95 | ET 6.900 / handler 0.900 | ≤16.67 | pass |
| type-flat-500-novalidate | L | 키 처리 p95 | ET 2.800 / handler 0.800 | ≤16.67 | pass |
| type-flat-500-novalidate | E | 키 처리 p95 | ET 4.700 / handler 0.900 | ≤16.67 | pass |
| type-onchange-state-plain | L | 키 처리 p95 | ET 2.700 / handler 0.900 | ≤16.67 | pass |
| type-onchange-state-plain | E | 키 처리 p95 | ET 5.100 / handler 0.900 | ≤16.67 | pass |
| type-onchange-state-transition | L | 키 처리 p95 | ET 2.700 / handler 0.900 | ≤16.67 | pass |
| type-onchange-state-transition | E | 키 처리 p95 | ET 4.600 / handler 0.900 | ≤16.67 | pass |
| replace-200-while-typing | L | 키 처리 p95 | ET 1.600 / handler 1.400 | ≤16.67 | pass |
| replace-200-while-typing | L | 구조 변경 최장 프레임 | 54.600 | ≤50 | fail |
| replace-200-while-typing | E | 키 처리 p95 | ET 4.000 / handler 4.100 | ≤16.67 | pass |
| replace-200-while-typing | E | 구조 변경 최장 프레임 | 64.000 | ≤50 | fail |
| switch-oneOf-20 | L | 구조 변경 최장 프레임 | <50 (검출 0) | ≤50 | pass |
| switch-oneOf-20 | E | 구조 변경 최장 프레임 | <50 (검출 0) | ≤50 | pass |
| validation-flat-500-nonburst | L | 키 처리 p95 | ET 9.500 / handler 2.300 | ≤16.67 | pass |
| validation-flat-500-nonburst | L | 비연타 검증 도착 p95 | 11.400 | ≤33.4 | pass |
| validation-flat-500-nonburst | E | 키 처리 p95 | ET 10.500 / handler 4.500 | ≤16.67 | pass |
| validation-flat-500-nonburst | E | 비연타 검증 도착 p95 | 4.000 | ≤33.4 | pass |
| validation-flat-500-burst | L | 키 처리 p95 | ET 3.000 / handler 1.100 | ≤16.67 | pass |
| validation-flat-500-burst | E | 키 처리 p95 | ET 5.500 / handler 1.700 | ≤16.67 | pass |
| validation-nested-d5-f4-nonburst | L | 키 처리 p95 | ET 6.200 / handler 1.200 | ≤16.67 | pass |
| validation-nested-d5-f4-nonburst | L | 비연타 검증 도착 p95 | 15.600 | ≤33.4 | pass |
| validation-nested-d5-f4-nonburst | E | 키 처리 p95 | ET 13.700 / handler 5.400 | ≤16.67 | pass |
| validation-nested-d5-f4-nonburst | E | 비연타 검증 도착 p95 | 4.900 | ≤33.4 | pass |
| validation-nested-d5-f4-burst | L | 키 처리 p95 | ET 2.200 / handler 0.400 | ≤16.67 | pass |
| validation-nested-d5-f4-burst | E | 키 처리 p95 | ET 13.700 / handler 2.000 | ≤16.67 | pass |

## 기존 jsdom 측정과의 관계

type-flat-500의 브라우저 ET 처리 중앙/p95는 L 1.075 / 2.900ms, E 0.800 / 4.600ms이며 전체 키 handler 벽시계는 L 0.600 / 1.000ms, E 0.450 / 1.000ms입니다. [분기 전환 마감의 React 전체 폼 표](../branch-switch/closing-results.md)의 같은 flat-500 계열은 E 두 통과에서 update-sync 14.799375/14.379895ms, update-settled 29.665749/29.380749ms를 기록했습니다. 그 값은 jsdom·development React Profiler에서 프로그램 쓰기 10회의 합이며, 본 값은 Chromium·production React에서 실제 키 20회의 키별 분포입니다. 같은 스키마 계열을 보완하지만 환경·입력·집계 단위가 달라 환경 사이 비율을 계산하지 않습니다.

## 증거와 검사

[전체 원시 페이지](raw/ir-0/pages.json.gz), [완료 기록](raw/ir-0/complete.json.gz), [집계 JSON](raw/ir-0/summary.json), [CPU 원시](raw/ir-0/cpu.json.gz), [스모크 완료](raw/ir-0/smoke-complete.json.gz)를 보존했습니다. 페이지 파일 URL은 수치와 동작을 바꾸지 않고 `ir0:` 주소로 정규화했습니다. 입력 manifest에는 제품 및 production 페이지 번들의 SHA-256, 정식 시작 기록에는 측정 도구·픽스처 파일별 SHA-256이 있습니다.

신규 브라우저/픽스처 파일의 typecheck, benchmark-form lint, 기존 mount CLI, 전체 상호작용 CLI 스모크, 10표본/3예열 수량, 원시로부터 집계 재현, gzip 내부를 포함한 전체 차분 기계 경로 검사, 기준 커밋 대비 architecture 밖 제품 차분 0을 확인했습니다. 검사 명령은 `yarn workspace @aileron/benchmark-form typecheck:browser`, `yarn workspace @aileron/benchmark-form lint`, `yarn workspace @aileron/benchmark-form check:browser-results`입니다. FCA 스캔은 실행하지 않았습니다. 독립 검증과 PR 생성은 코디네이터가 담당합니다.

판정: 소유자 대기
