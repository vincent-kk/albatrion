# 입력 응답성 설계 제안 — 동기 정착, 지연 소비 (초안, 2026-10-30)

기준 커밋: `5d1348ed1` (`feat/schema-form-08-review-and-perf`). 경로는 `packages/canard/schema-form/src` 기준. 제품 변경은 아직 없다.

## 0. 한 줄 원칙

**엔진은 지금처럼 동기로 정착하고 동기로 통지한다. 기다릴 수 있는 소비(검증, 대량 마운트)만 커밋 번호 뒤에 세운다.** 안정성은 엔진 계약이 지키고, 입력 경험은 React 바인딩과 검증 스케줄러가 책임진다. 두 층을 섞지 않는다.

## 1. 지켜야 할 안정성 (불변식)

| 번호 | 불변식 | 근거 |
| --- | --- | --- |
| S1 | 쓰기 하나는 동기로 정착·통지하고, `setValue()` 가 돌아오면 값과 controls 를 바로 읽을 수 있다 | EVENT-002 ([design/03-settle-and-events.md:288](../../design/03-settle-and-events.md#L288)), 공개 문서 [event-system.md:6-10](../../../docs/agents/skills/schema-form-skill/knowledge/event-system.md#L6-L10) |
| S2 | 입력 중인 필드는 같은 이벤트 핸들러 안에서 다시 그려진다 (캐럿 안정) | T-1 ([design/00-goals-and-values.md:263](../../design/00-goals-and-values.md#L263)) |
| S3 | 화면에 그려진 것은 언제나 하나의 완결된 커밋이다 (찢어짐 없음). `revision` 은 커밋 때 배달 집합 전체를 한 번에 올린다 | EVENT-007, EVENT-011 |
| S4 | 루트 `onChange` 는 최외곽 동기 진입당 1회, 디바운스 없음 | D-10 ([design/00-goals-and-values.md:271](../../design/00-goals-and-values.md#L271)), [exitFieldNodeChain.ts:135-147](../../../src/core/engine/write/utils/chain/exitFieldNodeChain.ts#L135-L147) |
| S5 | 검증 결과는 항상 최신 커밋의 것이다. `node.validate()` 와 제출은 지금 즉시 검증한다 | [requestFieldNodeValidation.ts:43-47](../../../src/core/engine/validation/utils/run/requestFieldNodeValidation.ts#L43-L47), [core/surface/type.ts:143](../../../src/core/surface/type.ts#L143) |

## 2. 입력 경험이 줄어드는 지점 (손실)

| 번호 | 손실 | 사실 |
| --- | --- | --- |
| L1 | 검증이 키 입력마다 전체 스키마에 대해 **다음 화면을 그리기 전에** 돈다 | `queueMicrotask` ([requestFieldNodeValidation.ts:28-30](../../../src/core/engine/validation/utils/run/requestFieldNodeValidation.ts#L28-L30)), `validate(node.rootNode.emit)` ([runFieldNodeValidation.ts:23](../../../src/core/engine/validation/utils/run/runFieldNodeValidation.ts#L23)). 0.16.1 은 매크로태스크 디바운스로 연타를 한 번에 묶었음(T-9). React 측정 19개 픽스처는 모두 `validationMode={0}` 이라 이 비용이 측정된 적 없음 |
| L2 | 소비자 `onChange` 안의 무거운 상태 갱신이 같은 이벤트 안에서 동기 렌더된다 | `runtime.onChange(root.emit)` 는 동기. 비용은 소비자 쪽 |
| L3 | 한 커밋이 많은 필드 컴포넌트를 새로 마운트하면 한 작업으로 막힌다 | array-replace-200 약 180 ms, 첫 마운트 7개 픽스처 18.8~861.7 ms. 분할 마운트(`virtualization`)는 기본 꺼짐, 가지 단위(자식 30개 이상) 로만 작동, jsdom 에서는 `IntersectionObserver` 가 없어 생성조차 안 됨 ([VirtualizationManager.ts:197-200](../../../src/helpers/virtualization/VirtualizationManager/VirtualizationManager.ts#L197-L200)) |

키 입력 자체의 동기 구간은 0.16.1 과 같거나 짧다(최대 차이 0.17 ms 이하, [closing-results.md](../../verification/branch-switch/closing-results.md) React 표). 그래서 **엔진을 비동기로 되돌리는 길은 없다.**

## 3. 설계

### D1. 검증을 "다음 화면 뒤" 로 옮긴다 (엔진, 작음)

- [requestFieldNodeValidation.ts:28-30](../../../src/core/engine/validation/utils/run/requestFieldNodeValidation.ts#L28-L30) 의 `queueMicrotask` 를 `scheduleValidationSlot(run)` 로 바꾼다. 스탬프·커밋 번호 확인(`:43-47`)·`deliverValidationWave` 는 그대로다.
- 슬롯의 정의: `requestAnimationFrame` 뒤 `MessageChannel` 메시지(화면을 그린 직후). 실행 직전에 `navigator.scheduling.isInputPending()` 이 참이면 다음 화면으로 한 번 더 미룬다. 미룸은 최대 6 프레임(약 100 ms)까지만 허용하고 그 뒤에는 무조건 실행한다. 이것이 타이머 없는 연타 합치기다. 디바운스를 없앤 이유(개발·제품 React 의 실행 순서 차이)는 React 커밋·이펙트가 모두 끝난 뒤라는 고정된 순서로 피한다.
- 지원 없는 환경: `isInputPending` 이 없으면(Safari, Firefox) 화면 뒤 실행만 한다. `requestAnimationFrame` 이 없으면(Node, SSR) `setTimeout(0)` 로 떨어진다.
- 바뀌지 않는 것: `node.validate()` 와 제출 경로는 슬롯을 거치지 않고 즉시 실행한다(S5). `deferMountValidation`, `validationMode` 값, `OnRequest` 모드는 그대로다. 결과 배달은 같은 파동 형식(`UpdateError`, `UpdateGlobalError`)이다.
- 공개 동작 변경: "검증은 마이크로태스크 뒤" → "검증은 다음 화면 뒤". 지식 문서 [event-system.md:6-10](../../../docs/agents/skills/schema-form-skill/knowledge/event-system.md#L6-L10), [troubleshooting.md:68](../../../docs/agents/skills/schema-form-skill/knowledge/troubleshooting.md#L68), 계약 EVENT-028·SETTLE-008 을 고친다. 옛 시점이 필요한 소비자를 위해 Form 옵션 `validationSchedule: 'afterPaint' | 'microtask'` (기본 `afterPaint`) 를 둘지는 소유자 결정 항목이다.
- 시험: 마이크로태스크를 기다리던 검증 시험([validation.async-race.render.test.tsx](../../../src/__tests__/scenarios/validation.async-race.render.test.tsx) 등)은 공용 `settleValidation()` 도우미로 바꾼다. "최신 커밋만 남는다" 단언은 그대로 통과해야 한다.
- 한계: 검증 비용 자체는 줄지 않는다(키 입력당 전체 스키마). 비용을 줄이는 지렛대(변경 하위 트리만 검증)는 별도 단계이며 이 설계 밖이다.

### D2. 루트 `onChange` 는 그대로 둔다 (문서, 변경 없음)

- S4 를 지킨다. 소비자는 자기 상태를 `startTransition` 으로 감쌀 수 있다(소비자 상태는 전환 가능, 엔진 스토어는 불가). 이 안내를 [troubleshooting.md](../../../docs/agents/skills/schema-form-skill/knowledge/troubleshooting.md) 에 적고, 측정에 "부모 상태를 갱신하는 `onChange`" 픽스처를 넣어 지렛대가 실제로 작동함을 보인다.

### D3. 대량 마운트를 작업당 예산으로 자른다 (React, 중간)

- 지금의 분할 마운트는 가지 하나에 자식이 `threshold`(30) 이상일 때만 `eagerCount`(20) 를 넘는 자식을 플레이스홀더로 둔다(`forBranch`, `forChild`). 가지가 작아도 한 커밋이 여러 가지에 걸쳐 많은 컴포넌트를 만들면 막힌다(oneOf 전환, 첫 마운트).
- 추가 규칙 **작업당 예산**: `VirtualizationManager` 가 "이 작업(task) 안에서 즉시 마운트한 수" 를 센다. `forChild` 가 호출될 때마다 올리고, 첫 호출에서 `queueMicrotask` 로 0 으로 되돌리게 예약한다. 한 커밋의 동기 마운트는 모두 한 작업 안에서 일어나므로 이것이 곧 커밋당 예산이다. 합계가 `eagerCount` 를 넘으면 가지 크기와 무관하게 나머지는 플레이스홀더가 된다. 시간이 아니라 개수로 자르므로 결정적이고 시험 가능하다.
- 드러냄은 지금 방식 그대로다: 뷰포트 교차(`rootMargin` 100 %) 또는 유휴 시간(틱당 25개, 남은 예산 4 ms 이상), `Focus`·`Select` 명령은 즉시 드러낸다. `RequestRefresh` 는 드러냄에서 제외한다(기존 결정).
- 배열 교체 200: 즉시 20개, 나머지 180개는 보이는 것부터, 그 뒤 유휴 틱. 첫 마운트 7개 픽스처도 같은 길로 간다.
- 안정성: 노드 트리는 처음부터 살아 있으므로 S1·S5 는 영향이 없다(검증·제출은 노드 값으로 돈다). 플레이스홀더는 오래된 내용이 아니라 빈 자리이므로 S3 도 지킨다. 높이는 `estimateHeight` 로 잡아 레이아웃 점프를 막는다.
- 기본값: `virtualization` 을 기본 켬으로 바꿀지는 측정 뒤 소유자 결정이다. 기본 켬이면 `threshold` 30 이하의 작은 폼은 영향이 없다.
- jsdom 에서는 `IntersectionObserver` 가 없어 관리자가 생성되지 않으므로 이 설계의 효과는 실제 브라우저에서만 잴 수 있다.

### D4. 키 입력 경로는 바꾸지 않는다

- 입력 중인 필드의 동기 렌더(S2), `useSyncExternalStore` 구독, IME 조합 중 Refresh 보류는 그대로다. React 19.2.6 은 외부 스토어 갱신을 항상 동기 차선으로 처리하므로 이 경로에 transition 을 쓸 길은 없다(REACT-013 기록과 일치).

## 4. 측정과 관문

- 기존 실제 브라우저 측정(`packages/aileron/benchmark-form/browser-bench`, Playwright·헤드리스 Chromium·제품용 React, 지금은 마운트만 측정)에 상호작용을 더한다.
- 입력: Playwright 실제 키보드 입력. 지표: Event Timing API 의 상호작용별 처리 시간(`processingEnd − processingStart`)과 전체 지연, Long Animation Frames API 의 가장 긴 프레임.
- 픽스처: flat-500 과 nested-d5-f4 에서 검증 켠 채 타이핑, 부모 상태를 갱신하는 `onChange` 를 단 타이핑, 타이핑 중 array-replace-200, oneOf-20 전환, 분할 마운트 켠 첫 마운트.
- 레인: 0.16.1, 단계 시작(S), 현재(E), 설계 적용(E′).
- 관문 제안: 키 입력당 처리 시간 p95 ≤ 16.67 ms, 구조 변경 중 가장 긴 프레임 ≤ 50 ms, 검증 결과 도착 ≤ 입력 뒤 2 프레임(연타가 아닐 때).

## 5. 단계

| 단계 | 내용 | 제품 변경 |
| --- | --- | --- |
| 0 | 브라우저 측정 레인 확장, 기준선(L·S·E) | 없음 |
| 1 | D1 검증 슬롯 + 시험 도우미 + 지식 문서 | 엔진 1 파일, 시험 |
| 2 | D3 작업당 예산 + 기본값 결정 | React 분할 마운트 2~3 파일 |
| 3 | D2 안내, 계약 기록(EVENT-028·SETTLE-008 수정, 새 REACT- 계약) | 문서 |

## 6. 소유자 결정 항목

2026-10-30의 권고와 소유자 답변으로 아래 상태를 고정했습니다. 원문과 권고의 대응은 [요청 기록](request.md)에 있습니다.

1. **확정**: D1 검증을 다음 화면 뒤로 옮기며 `microtask` 옵션을 두지 않습니다.
2. **보류**: `virtualization` 기본 켬 여부는 IR-0 측정 뒤 소유자가 결정합니다.
3. **확정**: 루트 `onChange`는 동기로 유지합니다(D2).

## 7. 기각한 길

- 엔진 비동기화: S1·S2 가 깨지고, 코어 단독 측정에서 16.67 ms 를 넘는 행은 마운트 하나뿐이라 얻는 것이 없다.
- React transition 으로 스토어 갱신 지연: 외부 스토어 갱신은 동기 차선으로 강등된다(React 문서, REACT-013).
- 타이머 디바운스 복귀: 소유자가 없앤 방식(D-10)이며, 개발·제품 React 순서 차이를 다시 들여온다.
- 비편집 필드 재렌더를 `useDeferredValue` 로 미루기: 키 입력 행의 동기 구간이 이미 0.17 ms 이하라 얻는 것이 작고, 분리된 노드를 한 프레임 더 그리는 위험이 있다. 측정에서 필요가 드러날 때만 다시 연다.
