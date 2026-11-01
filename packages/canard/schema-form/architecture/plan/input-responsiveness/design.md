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

- [requestFieldNodeValidation.ts:28-30](../../../src/core/engine/validation/utils/run/requestFieldNodeValidation.ts#L28-L30) 의 `queueMicrotask` 를 `scheduleValidationSlot(run)` 로 바꾼다. 스탬프·커밋 번호 확인([requestFieldNodeValidation.ts:43-47](https://github.com/vincent-kk/albatrion/blob/5d1348ed16054efa1ec431945eb00472f4eef7f1/packages/canard/schema-form/src/core/engine/validation/utils/run/requestFieldNodeValidation.ts#L43-L47))·`deliverValidationWave` 는 그대로다.
- 슬롯의 정의: `requestAnimationFrame` 뒤 `MessageChannel` 메시지(화면을 그린 직후). 실행 직전에 `navigator.scheduling.isInputPending()` 이 참이면 다음 화면으로 한 번 더 미룬다. 미룸은 최대 6 프레임(약 100 ms)까지만 허용하고 그 뒤에는 무조건 실행한다. 이것이 타이머 없는 연타 합치기다. 디바운스를 없앤 이유(개발·제품 React 의 실행 순서 차이)는 React 커밋·이펙트가 모두 끝난 뒤라는 고정된 순서로 피한다.
- 지원 없는 환경: `isInputPending` 이 없으면(Safari, Firefox) 화면 뒤 실행만 한다. `requestAnimationFrame` 이 없으면(Node, SSR) `setTimeout(0)` 로 떨어진다.
- 바뀌지 않는 것: `node.validate()` 와 제출 경로는 슬롯을 거치지 않고 즉시 실행한다(S5). `deferMountValidation`, `validationMode` 값, `OnRequest` 모드는 그대로다. 결과 배달은 같은 파동 형식(`UpdateError`, `UpdateGlobalError`)이다.
- 공개 동작 변경: "검증은 마이크로태스크 뒤" → "검증은 다음 화면 뒤". 지식 문서 [event-system.md:6-10](../../../docs/agents/skills/schema-form-skill/knowledge/event-system.md#L6-L10), [troubleshooting.md:68](../../../docs/agents/skills/schema-form-skill/knowledge/troubleshooting.md#L68), 계약 EVENT-028·SETTLE-008 을 고친다. 소유자 결정에 따라 검증 시점을 옵션 없이 다음 화면 뒤로 바꾸며, `validationSchedule` 옵션은 추가하지 않는다. `node.validate()` 는 슬롯을 거치지 않는 즉시 검증 경로로 유지한다.
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

## IR-1 D0 — 마운트 전체 컴파일 원인 고침 (2026-10-30)

None 모드에서도 커밋 이펙트의 검증 루트 보유가 전체 AJV 스키마를 컴파일했습니다. 보유는 수명 원장만 갱신하고 첫 캐시 읽기가 컴파일하도록 분리했습니다. 이후 읽기는 이미 보유한 참조 수를 보존합니다. 동기 가드·정착, OnChange의 마운트 검증, 명시적 validate와 재생성 실패 점검은 유지합니다. if 가드의 사본 읽기에서도 전체 컴파일이 발생하는 비용은 실제 프로파일로 확인했으며 별도 IR-2 후보로 남깁니다.

## D3 측정 반영 — IR-1 (2026-10-30)

작업당 예산은 기존 eagerCount 20을 사용합니다. 모든 새 자식 프록시가 forChild를 거치며 작은 가지는 index 0으로 가지별 선행 창만 건너뜁니다. React18 StrictMode의 반복 계산은 작업별 노드 정체성 집합으로 같은 결정을 재사용하고 microtask에서 계수와 함께 비웁니다. 새 공개 옵션과 메서드는 추가하지 않습니다. 매니저가 null인 SSR·IO 부재·비활성에는 예산이 적용되지 않습니다. virtualization 기본값은 계속 꺼짐입니다. backfill 10/2·25/4·50/8 비교와 최종 선택은 실제 브라우저 원시가 완료되면 별도 덧붙임으로 기록합니다.

### D3 backfill 확정 — 2026-10-30

상대 비교에서 10/2·25/4·50/8의 flat-500 전체 노출 중앙값은 303.2/174.7/410.05ms, array-1000은 1703.7/1157.7/768.2ms였습니다. eager paint 뒤 ≥50ms 프레임은 모두 검출 0이며 array 첫 프레임은 A에서도 57.6ms로 남습니다. 코디네이터 답변에 따라 25/4를 유지합니다. 두 폼을 모두 최소화하는 후보가 없고 기존 매개변수는 flat의 동작을 유지하지만 50/8은 flat을 2.35배 늦춥니다. 개수와 잔여 시간 예산을 동시에 바꾼 50/8의 효과를 각 변수에 귀속하지 않습니다. 50/4 또는 시간 예산 reveal 방식과 전량 노드 구성·eager 창의 첫 프레임 비용은 이번 단계에서 더 측정하지 않는 후속 항목입니다.

## D3 결과 — 이번 단계 미채택 (2026-10-31)

Part B의 컨테이너 지연은 중첩 focus/select를 잃고 cx02를 두 React 프로젝트에서 실패시켰습니다. eager의 영구 노출 기록 부재는 프로덕션 캐시 재구축에서도 defer-once를 깨며, 렌더 스냅숏과 분리된 가변 예산은 시간 분할·폐기·재시도 때 같은 노드에 다른 결정을 낼 수 있습니다. 공개 threshold/eagerCount 문구도 새 의미를 담지 않았습니다. replace off는 manager null이므로 A·AB 모두 실패하고 on은 A부터 이미 통과하여 고정 관문 효과가 없습니다. nested on eager 89.7→33.8ms의 개선과 array eager 59.2→68.5ms·all-revealed 473.1→1154.8ms의 회귀를 함께 근거로 Part B를 채택하지 않습니다.

후속 개정은 터미널만 지연, 컨테이너 계수만, 커밋 뒤 영구 reveal 기록, 렌더별 불변 허가 스냅숏과 예약·폐기·커밋 분리, 소유자가 결정한 옵션 계약 문구와 on 행 재측정이 필요합니다. reveal pump 하위 트리의 예산 제외는 미검증 가설입니다. 작은 폼의 threshold 30 미만 가지가 영향 없다는 앞선 문장은 AB의 작업 예산에서는 성립하지 않았습니다. 이번에 채택한 예산 없는 기존 코드에서는 가지 자식 수가 threshold 미만이면 게이트를 통과하지 않는 기존 의미가 다시 유지됩니다. 기본값은 바꾸지 않습니다.

## D1 정정 — 2026-10-31

IR-2 초안 독립 대조는 P1 1건과 P2 9건으로 실패했습니다. 이 절은 앞의 D1 초안을 정정하는 설계 v2이며 제품 구현 기록이 아닙니다. 초안의 `navigator.scheduling.isInputPending()` 사용을 철회합니다. 설계 대조 자료는 MDN에서 이 API가 deprecated이며 Scheduler 인터페이스로 대체되었음을 근거로 합니다.

- P1: `exitFieldNodeChain`은 `deferMountValidation`이 false일 때만 `reportValidationFailure`를 설치합니다. 항상 지연되는 React 마운트를 쓰기 요청으로 바꾸기만 하면 컴파일 실패가 `onError`에 닿지 않아 ERROR-038·044를 위반합니다.
- P2-a: if 가드의 형제 메타 스키마 컴파일 약 4ms는 남으므로 G 관문은 “첫 화면에 전체 스키마 컴파일 없음”으로 한정합니다.
- P2-b: G는 `compileGuard`·`release`가 `compile`에 앞서 사본 루트를 받을 수 있게 하므로 공개 플러그인 순서 계약과 VALIDATE-044 보충이 필요합니다.
- P2-c: 지연 엔트리의 `validate?`·`failure?`·`compiled` 가변 상태와 1회 컴파일·재시도 없음 규칙을 정의해야 합니다.
- P2-d: G는 validation.cache·guard·retain-guard 시험 및 IR-1 수명·same-id 행의 기대를 바꿉니다.
- P2-e: 마운트 전용 진입점은 write·engine·core에서 이름으로 내보내며 루트 Provider 소비처와 계약 확장을 기록해야 합니다.
- P2-f: rAF와 100ms 타이머의 경주에 `done` 표식을 두어 정확히 한 번만 실행해야 합니다.
- P2-g: 하위 트리 `node.validate()`가 공유 stamp·pending을 비워 전체 폼 쓰기 판정을 잃는 결함의 창을 D1이 넓히므로 pending 보존 고침이 필요합니다.
- P2-h: 검증 시점 문서·원장 갱신 목록을 완성하고 VALIDATE-049를 대체됨으로 표시해야 합니다.
- P2-i: jsdom 시험의 문제는 고정 매크로태스크 대기이므로 마이크로태스크 대체가 아니라 순서가 결정적인 도우미가 필요합니다.

v2 슬롯은 `done`을 공유하고 실행 시 disposed 루트를 중단합니다. rAF가 없거나 문서가 숨겨졌으면 `scheduleCancelableMacrotask(run)`을 사용하고, 그 밖에는 rAF 뒤 같은 매크로태스크 예약과 `setTimeout(run, 100)`을 경주시킵니다. 쓰기 검증만 슬롯을 거치며 명시적 `node.validate()`·제출은 즉시 검증합니다. 마운트는 OnChange 확인 후 실패 reporter를 설치하고 검증 파동을 요청하는 전용 `dispatchMountValidation`으로 들어갑니다. 컴파일 실패의 마운트 표면은 rejected에서 sink로 바뀌므로 소유자 결정이 필요합니다.

하위 트리 즉시 검증 중 `validationQueued`가 참이면 전체 폼 pending 요청을 보존합니다. 공용 시험 도우미는 `act` 안에서 rAF 한 번 뒤 `setImmediate` 한 번을 기다리고 Node에서는 `setImmediate`를 기다립니다. async-race 시험이 경주를 실제로 검증하도록 재작성하며, 기본 모드 compile 실패가 sink로 1회 보고되고 명시적 validate는 계속 거부됨을 확인합니다. 최소 한 프레임 동안 커밋 N+1 값과 커밋 N 오류가 함께 보이는 S3 지연은 결정 1에서 수용한 효과로 명시합니다.

계약 기록 대상은 VALIDATE-049·046·048, ERROR-019·038·044·201, TEST-036, EVENT-028, SETTLE-008, design/03·05·07, ADR 0007·0008, 지식 문서 expressions·event-system·troubleshooting, 검증 DETAIL입니다. G를 함께 만들 때는 `validator.ts`·플러그인 형과 VALIDATE-044에 순서 변경을 명시합니다. `readValidationEntry`는 컴파일하지 않고 `assertValidationRootReady`만 가변 엔트리를 한 번 컴파일하며 가드 준비는 전체 컴파일을 일으키지 않습니다. 숨은 탭 타이머 제한은 미검증이고, 전체 컴파일 비용은 첫 화면 뒤 긴 작업으로 이동하므로 이른 입력이 여전히 막힐 수 있습니다. None 모드의 다른 스키마 reset도 계속 컴파일할 수 있습니다.

구현 여부는 먼저 측정으로 결정합니다. AJV8 OnChange에서 array-1000·nested-d5-f4·flat-2000 각각 실제 20키 비연타 100ms를 L/단계 head E1으로 비교하고, E1 키 처리 p95가 16.67ms를 넘거나 검증 도착 p95가 33.4ms를 넘는 행이 하나라도 있으면 D1이 발동합니다. 모두 선 이하면 이번 단계에서는 D1을 만들지 않습니다. 연타와 검증 기본 모드 flat-500·nested·if-flat-500 마운트는 보고 전용입니다. 어떤 결과에서도 IR-2 측정 작업은 D1이나 G를 구현하지 않습니다.

기타 독립 발견(P3)은 숨은 탭 타이머의 약 1초 제한 미검증, 해제 뒤 슬롯의 disposed 확인, 절감 추정 중 메타 스키마 10.4ms는 프로세스당 1회라는 제한, 첫 화면 직후 22~77ms 컴파일 작업과 이른 입력의 경합, None reset의 컴파일 유지, 루트당 가드 형제 4~5ms 잔존입니다. 개발 모드 `compileEntryGuards`는 커밋 뒤가 아니라 렌더 중 useMemo에서 실행되며 검증 DETAIL의 해당 시점 설명도 정정 대상입니다. 공개 오류 목록이나 `node.errors`는 최소 한 프레임 늦어질 수 있지만 제출은 매번 즉시 `root.validate()`를 기다립니다.


## 단계 마감의 설계 상태 — 2026-10-31

상단의 초안과 중간 채택 표현은 이력으로 보존하며 현행 제품은 `814d21ad4`입니다. [마감 결과](../../verification/input-responsiveness/closing-results.md)가 구현·미채택·미구현과 소유자 대기를 구별합니다.

| 설계 | 현행 상태와 근거 |
| --- | --- |
| D0 lazy compile·개발 guard 준비 | [IR-1 Part A](../../verification/input-responsiveness/ir-1-results.md#part-b-미채택--독립-관문-후-최종-결정-2026-10-31) 채택. 보유는 컴파일하지 않고 첫 실제 읽기로 넘기며 개발 준비도 if 게이트가 있을 때만 수행합니다. None의 다른 스키마 reset과 if 가드의 전체 컴파일은 남습니다. |
| hydration-safe virtualization | [IR-5 round3](../../verification/input-responsiveness/ir-5-results.md#round-3--실제-입력-commit만-원장에-기록) 편입. Provider 유지·서버 스냅숏·기존 commit ref·실제 입력 노출 원장을 적용해 서버 DOM·추가 렌더0·두 layout effect 계약을 보존했습니다. 소유자의 수정 수락은 별도 대기입니다. |
| D3 작업당 예산 | [IR-1 독립 관문](../../verification/input-responsiveness/ir-1-results.md#part-b-미채택--독립-관문-후-최종-결정-2026-10-31) 뒤 미채택. 기존 가지별 eagerCount·threshold 의미와25/4 backfill을 유지합니다. |
| AJV8 sync-first | [IR-3](../../verification/input-responsiveness/ir-3-results.md) Step0의 정상+5% 규칙 실패로 미채택. 제품 Step1·브라우저 Step2는 없습니다. |
| D1 v2·G | 설계 정정은 준비됐으나 미구현. [IR-2](../../verification/input-responsiveness/ir-2-results.md#d1-예측과-검증-도착-위험)의 발동·원인 분해를 받아 이번 단계 D1 미구현을 권고하며 소유자 답을 기다립니다. G의 공개 플러그인 순서와 mount compile 실패 rejected→sink 표면도 미결입니다. |
| D2·D4·기본값 | 동기 루트 onChange·입력 경로 유지. 소비자 startTransition·OnRequest·containment 지침은 [IR-4](../../verification/input-responsiveness/ir-4-results.md)에 반영했습니다. SSR blocker 제거 뒤에도 reveal 전 접근성과 전체 노출 비용 때문에 기본 off를 권고하며 확정은 소유자 대기입니다. |

array 첫 프레임·count-only/시간 reveal·루트 reconcile·CPU 공변량·hydration 준비 후 나중 첫 렌더·기존 결함 다섯·typing-mix 절대 규칙은 마감 결과의 미결 목록으로 넘깁니다. 이번 기록은 새 구현이나 관문 완화를 지시하지 않습니다.


## D1 구현 — IR-6 (2026-10-31)

소유자 원문 12번으로 D1 구현을 수락했습니다. 옛 초안·v2·마감 상태는 이력으로 유지하고, 현행 동작은 이 절과 VALIDATE-052가 대체합니다. G는 구현하지 않으며 버전과 virtualization 기본 off는 유지합니다.

### 실행 슬롯과 관찰 시점

`scheduleValidationSlot(run)`은 호출마다 프레임 API와 문서 가시성을 읽습니다. 프레임 요청·취소 API 중 하나가 없거나 문서가 숨겨져 있으면 `scheduleCancelableMacrotask`로 실행합니다. 그 밖에는 프레임 콜백 뒤 매크로태스크와 100ms 타이머를 경주시킵니다. done 표식과 상대 핸들 취소로 정확히 한 번 실행합니다. 예약 후 숨겨진 탭은 타이머로 대체되며 백그라운드 제한 때문에 약 1초까지 지연될 수 있습니다. 표시 장치의 실제 표시 완료를 보장하는 계약은 아닙니다.

쓰기 검증은 다음 프레임 선행·연속 프레임 이월·quiet 후행과 실제 마지막 실행 시작 기준100ms cap을 따릅니다. 오류는 지금 적격이며 마지막 release 이후 state·enabled·커밋 정책의 모든 조합에서 계속 적격일 때 표시하고 숨김은 즉시입니다. OnChange만 기록하며 새 표시·중간 숨김은 판정 정착·조용한 post-paint drop·수락한 explicit root 판정·폐기의 release를 기다립니다. 조용한 변경은 약2프레임 뒤 표시합니다. renderer/input은 enabled를 포함하고 child-errors는 제외합니다. raw 목록·명시적 호출 시점 snapshot·공개 표면은 유지합니다. Always의 최초 OnChange 판정은 layout에서 즉시 실행하고 다른 모드는 화면 뒤 슬롯을 씁니다.

### 마운트·수명과 v2 차이

Provider 준비 layout effect는 Always이면 root.validate를 inline으로 시작하고 그 외 모드는 같은 슬롯에 예약합니다. if 게이트가 없는 스키마의 전체 컴파일·첫 판정은 첫 화면 뒤로 이동하며 if 게이트의 렌더 중 전체 컴파일은 남습니다. mount helper는 검증 실패를 다시 capture하지 않아 engine의 런타임별 첫 보고 또는 숨김 버퍼만 남깁니다. 마운트 컴파일 실패는 한 번 보고합니다. 마운트 슬롯이 첫 검증을 실행하면 rejected이며, 쓰기 검증이 먼저 요청되어 마운트를 건너뛰면 sink입니다. 명시적 루트 검증도 의무를 충족하지만 하위 트리 검증은 마운트 의무를 남깁니다. catch는 MultipleErrors 묶음에서 원래 실패 다음의 소비자 handler 실패만 호스트 싱크로 격리하며 검증 실패 자체는 다시 보고하지 않습니다.

슬롯 실행 시 load.ready가 거짓이면 mountValidationOwed를 세웁니다. 보존된 같은 load의 layout effect가 돌아오면 먼저 false로 소비하고 한 슬롯을 예약합니다. 오직 !ready 슬롯만 true로 쓰며 load당 보류 슬롯은 최대 하나입니다. 완료 뒤 다시 숨김·복원해도 재검증하지 않습니다. cleanup은 슬롯을 취소하지 않습니다. StrictMode 반복, React 19 Activity와 React 18 Suspense 복원은 한 번 판정하며 실제 unmount는 owed를 소비하지 않습니다.

코디네이터 승인 편차: 설계의 root.disposed는 공개 FieldNode 타입에 없어 선언 빌드가 TS2339로 실패했습니다. 내부 필드의 in 검사·캐스트·공개 표면 확대 대신 helper에 RootLoadStore를 넘겨 실행 시 store.load !== load이면 종료합니다. load.root도 실행 시 읽고 없으면 종료합니다. 같은 스키마 reset은 같은 load를 보존하며 루트 교체 reset은 새 load로 바뀌고 deferValidation 없는 마운트 쓰기 사슬이 새 루트를 검증합니다. 이 변경은 Orca 질문 msg_713ddfc78b83의 답변으로 승인되었고 계약을 코드보다 먼저 별도 커밋했습니다.

### 하위 트리 검증과 비용

v2의 pending 여부 분기 대신 루트 validate만 스탬프를 올리고 대기 대상을 비웁니다. 비루트 validate는 현재 스탬프를 초기화해 읽고 대기·진행 중 전체 폼 요청을 보존합니다. 같은 커밋을 한 번 더 검증할 수 있으며 깊이 같은 오류의 참조 보존과 보고기 참조 중복 억제가 중복 배달을 막습니다.

슬롯은 대기 요청당 상수 크기의 done·프레임·타이머·취소 핸들을 추가하며 판정 한 번의 검증 연산량 자체를 줄이지 않습니다. 연속 주기는 트리당 상수 크기의 phase·요청 표식·마지막 실행 시각·취소 핸들과 최신 도메인 실행 콜백을 지연 보유하고, 연속 입력 중 판정 실행 횟수를 줄입니다. 노드 고정 필드는 늘리지 않으며 quiet 확인 뒤 활성 프레임 루프를 남기지 않습니다. 내부 scheduleValidationSlot만 validation→engine→core로 명명 재수출하고 RootNodeContext가 소비합니다. src/index 공개 이름·타입·시그니처는 넓히지 않습니다. 단위·렌더·실제 브라우저 검증은 IR-6 결과에 기록하며 성능 효과는 측정 전에는 주장하지 않습니다.

### Amendment 1 반영

시험 대기는 act 안에서 두 프레임 뒤 setImmediate(jsdom), 두 프레임 뒤 scheduleMacrotask(Storybook)로 통일합니다. Node는 setImmediate입니다. 첫 프레임 콜백 뒤 배달에서 새 쓰기가 발생하면 pending이 false이고 node/policy 이력이 없을 때까지 두 프레임+매크로태스크 대기를 유한 반복합니다. 슬롯의 취소 함수도 예약한 환경에서 보관하여 jsdom 정리 뒤 콜백이 전역 cancelAnimationFrame을 다시 읽지 않습니다. 이 전역 정리 회귀는 수정 전에 실패했습니다.

Amendment 2 R1은 A4의 보고 누락을 수정합니다. prepared load가 복원되면 !ready 동안 버퍼링한 records를 load.reporter.root 설정 뒤 순서대로 전달하고 그 뒤 owed를 재예약합니다. 첫 commit의 flushRootLoad·reported 가드는 유지합니다.

측정은 amendment 1 A5가 v3.1 G1·G2·G4·G5를 대체합니다. ET 문턱 검열·관측/키 병기·null의 handler p95 대체를 유지하고, 교차 레인 page index 공동 bootstrap 10,000회 고정 seed의 단측 95% 상한을 사용합니다. G1의 CPU 환산 기준은 L page median들의 중앙값 6.425ms이며 환산 계수 하한은0.80, 기준1.25배 초과는 indeterminate입니다. G2도 같은 pooled 처리 p95 비율 bootstrap 상한≤1.10입니다. G4는 도착≤33.4ms와 미배달0/200을 모두 요구합니다. G5 첫 화면은 root.render 전에 설치한 MutationObserver가 첫 input/select 추가 기록에서 예약한 rAF 콜백 시작 시각입니다. G3의 LoAF는 전페이지 지원과 열 페이지 개수 합을 요구합니다. 정확한 사전 규칙은 코드 검토 승인 뒤 첫 정식 창 전에 verification 문서에 커밋합니다.

### Amendment 2 — 독립 검토 반영

R2 조회는 양수 validationStamp만 읽으며, validation→engine의 hasFieldNodeValidationRequest를 surface의 requireRuntimeFieldNode 래퍼와 core로 연결합니다. 공개 노드에 runtime을 노출하지 않고 src/index는 유지합니다. 0은 비루트 검증만 있었음을 나타내므로 의무를 남기며 양수는 쓰기 요청·명시적 루트 검증으로 마운트 의무를 충족합니다. 래퍼 패턴과 양수 판정은 코디네이터 msg_7e0a5ed0ffd3의 답변으로 승인받았습니다.

R4는 cancelAnimationFrame 부재도 매크로태스크 경로로 보냅니다. common-utils scheduler는 공개0.16.1도 promiseAfterMicrotask에서 사용한 기존 의존입니다. R5의 같은 프레임 쓰기 뒤 unmount는 은퇴 트리 검증1회와 구독자 배달0을 허용하며 실패는 호스트 싱크에만 도착합니다. cleanup 취소로 숨김까지 취소하지 않으려고 suspend/resume 기계를 추가하지 않습니다. R6의 비동기 명시적 validate 반환과 submit 값은 호출 시점 snapshot 계약이며 제한이나 재시도 대상이 아닙니다.

R7–R11은 프레임 미호출 대기·Node setImmediate·슬롯 주석·한국어 INTENT·React.Activity 직접 참조로 보강했습니다. R12의 render-delay validation-on 행은 검증기를 주지 않는 동기 node-tree mount+슬롯 예약 비용이며, 뒤 매크로태스크와 판정 완료 지연을 재지 않는다는 범위를 벤치 주석에 명시합니다. 이번 라운드에서 시간 측정은 실행하지 않습니다. R13의 색인·정본 위치·보충 형식, R14의 열 문서 문장별 원장 ID를 고칩니다. R15에 따라 window clear 뒤 사전 규칙 커밋은 A5와 G3의 정의·문턱·환산·재측정·bootstrap을 모두 담습니다.

### Amendment 3 — 연속 입력과 응결 (2026-10-31)

소유자 원문18은 "상한을 500ms로, 이외에는 적용. 코드를 잘 응결시켜서 해당 코드가 다른 도메인코드와 섞이지 않고 원리와 기능이 집중되도록 하세요."입니다. 원문13–18과 맥락은 request에 바이트 그대로 보존합니다. 프레임은 스케줄러의 rAF 콜백이며 요청은 requestFieldNodeValidation 호출 하나입니다. 선행 실행 전에 들어온 요청은 그 최신 실행에 포함되므로 연속으로 세지 않습니다. 선행·후행 실행 뒤 다음 프레임을 watch하고, 그 실행 시작 이후 새 요청이 없으면 idle로 끝냅니다. carry에서는 이전 프레임 이후 요청이 없으면 후행 실행하며100ms 상한은 마지막 자동 실행 시작을 기준으로 합니다. 상한 실행 뒤에도 watch로 돌아가 다음 무요청 프레임은 실행하지 않습니다.

일회성 슬롯과 주기는 독립 자식 fractal validationScheduling에 함께 두었습니다. 시간 정책은 validation·record·settle·write를 가져오지 않고 스탬프·노드·대상·오류를 모릅니다. 같은 책임의 두 정책을 validation 구현 아래로 흩뜨리지 않도록 이 경계를 골랐습니다. createValidationCadence(run, now)의 clock은 도메인 경계에서 주입하고100ms는 문서 주석을 둔 이름 붙은 상수입니다. 런타임이 주기를 지연 소유하고 요청마다 request를 호출하며 실제 폐기에서 cancel합니다. validationQueued는 모든 독자를 확인한 뒤 제거했고 기존 스탬프·대상·최신 커밋·배달 코드는 도메인에 남겼습니다. 재사용 인스턴스가 첫 배달 콜백을 영구 포착하지 않도록 최신 도메인 실행 본문은 runtime.validationRun이 보관합니다.

요청 시 숨김 또는 프레임 요청·취소 API 부재는 carry 없는 매크로태스크 한 번입니다. 예약 뒤 프레임이 멎으면100ms 타이머가 남은 요청을 한 번 실행하고 idle로 끝냅니다. 이미 실행한 watch에 새 요청이 없으면 중복 실행하지 않습니다. 명시적 루트 validate가 carry 중 실행되면 기존 stamp 증가로 다음 자동 실행을 버리며 그 뒤 새 요청은 최신 판정을 다시 예약합니다.

측정 추가는 stream-flat-2000-validate(L·E·F, 준비3회·10페이지, 페이지 내부에서 rAF당 프로그램 쓰기1회·60프레임)이며 페이지별 검증 실행 수·최장 프레임·50ms 이상 프레임·프레임별 스크립트 시간을 기록합니다. G6은 모든 페이지에서 F 실행 수≤2+ceil(스트림 기간÷100ms), F의50ms 이상 프레임 수 열 페이지 합≤E의 합을 요구합니다. burst의 F 결과 배달 수는 줄며 G4의 매 키 배달은 non-burst에만 적용합니다. 정식 창 전 사전 규칙에는 A5·G3와 이 행·G6을 함께 커밋합니다.

### Amendment 4·5 — 100ms와 엔진 표시

소유자 원문19가 상한을100ms로 바꾸었습니다. 디바운스는 FieldInput의 책임이며 엔진은100ms 지각 문턱 아래의 실시간감을 지킵니다. cap 뒤에도 watch로 돌아가고 watch→carry 첫 프레임도 cap을 검사합니다. run의 boolean이 true일 때만 마지막 실제 시작 시각을 갱신합니다. 주기 구현·보조는 utils/cadence, 형은 types, 일회성 슬롯은 utils/slot에 놓고 callback wiring과 순수 결정 함수를 통해 import 순환을 없앴습니다.

쓰기 pending은 None·unavailable 가드 뒤 시작합니다. 현재 stamp의 판정이 라우팅·동일 목록·null·실패로 끝나면 정착하고, commit-only 폐기는 최신 commit을 cadence에서 다시 요청하며 hold를 유지합니다. 명시적 루트 validate도 현재 판정은 정착하되 OnChange commit-only 폐기는 pending 여부와 관계없이 재요청하고 하위 트리는 정착하지 않습니다. unavailable·폐기는 무조건 정착하며 새 요청 없는 stamp 무효화(비OnChange reset 포함)도 정착합니다. true→false 알림은 런타임 listener set을 통해 배달 직전에 한 번만 전달하고 공개 사건·revision·src/index는 바꾸지 않습니다.

FieldProxy·FieldInputSlot·useChildFieldErrors는 순수 이력 검사와 표시당 hook을 공유합니다. node/policy generation을 병합하여 live state와 committed policy의 마지막 쌍까지 검사하고 child-errors는 enabled를 제외합니다. candidate만 release version을 구독하며 client/server snapshot은 같은 getter입니다.

Always는 state 없는 checkShowError()의 값을 앞선 layout effect에서 ref에 반영하며 connect effect는 이 ref를 읽고 정책 변경만으로 재연결하지 않습니다. 자식 layout 쓰기가 먼저여도 inline root.validate가 stamp를 올려 큐를 버리고 pending을 정착시킵니다. 다른 모드는 기존 슬롯과 compile 실패 필터를 공유합니다. 숨긴 load의 미전달 기록은 교체 load 앞에 원래 root와 함께 옮기며 전달마다 reporter.root를 복구하고 각 handler 실패를 격리합니다. 형식·정식 표본은 여전히 측정 전입니다.

### G8 — U2 마운트 구조 비용의 측정 조건

코디네이터 msg_cc8e08d106e0의 승인으로 기본 표시의 mount-array-1000을 None·OnChange 모드 한 쌍으로 추가합니다. E·F 레인을 비교하고 L도 보고합니다. None 모드의 first-painted·eager-painted 중앙값 비율 F/E가 각각1.02 이하여야 하며 OnChange의 F는 각각 E 이하여야 G8을 통과합니다. Y3로 표시 layout effect를 제거한 뒤에도 배열 마운트 비용을 지키는 guard 조건입니다. 일반 입력 쓰기는 기존 layout effect0회를 유지합니다. G8 실패 시 병합하지 않고 코디네이터에게 원인과 대안을 상신합니다. 정식 창 전 사전 규칙에 이 행 쌍·정의·문턱을 커밋하며 현재 정식 표본은0입니다.

### Amendment 6 — 배달 전 pending과 표시·보고 수명

W3는 실제 사슬 끝의 요청과 같은 조건을 validation 도메인의 prepareFieldNodeValidation에 두고 각 공개 listener 배달 전에 pending을 기록합니다. 사슬이 기록한 stamp는 validationPendingEntryStamp에 보유하며 요청 없이 끝나면 그 stamp만 정착하여 더 새로운 실행을 풀지 않습니다. None·unavailable·deferred 마운트는 제외하고 request 자체의 true 설정은 멱등입니다. W2의 같은 commit 보류는 Amendment9의 엔진 이력으로 계산합니다. 보통 쓰기의 layout effect0회는 유지합니다.

W4의 mount catch는 engine이 이미 보고하거나 숨김 버퍼에 둔 검증 실패를 무시하며 소비자 handler 묶음의 꼬리만 호스트에 전달합니다. W5는 교체된 load 기록의 원래 root를 유지하면서 활성 load.root에도 observer guard를 적용하여 onError가 현재 폼을 쓰지 못하게 합니다. W6의 동일 경고는 R-g에 따라 원래 load별 범위에서 중복 억제하며 숨긴 교체 load들의 경고를 합치지 않습니다. W7의 Always 루트 input 자체 mount-layout validate는 같은 commit에 한 번 추가 판정을 실행하며, W8의 조상 mount-layout 쓰기는 inline 최초 판정을 무효화하여 한 프레임 뒤 판정할 수 있습니다. W7·W8은 코디네이터가 기록한 한계이며 W6은 R-g로 수정합니다.

W10 제출 회귀는 still-invalid 값을 쓰고 직후 빈 표시, 제출 뒤 오류와 pending=false를 확인합니다. W11 자연 key→Tab 브라우저 경합은 명시적 비동기 판정 보류와 실제 쓰기 시작 프레임 계수를 사용합니다. W12 idle helper는 write-pending만 기다리며 비동기 mount 판정은 그 판정의 명시적 promise를 기다립니다. W13 코어 시험은 실제2000필드 폼에서 보류 표시3개만 구독하고 정착 콜백도 각각 한 번임을 확인합니다.

### Amendment 9 v3 — release 이력과 커밋 정책

H: 오류는 현재 적격이며 마지막 release 이후 모든 state·enabled·커밋 정책 조합에서 계속 적격일 때만 표시한다. 잠깐이라도 부적격이면 다음 release를 기다리며 숨김은 즉시다. release는 pending true→false 정착, 조용한 post-paint drop, 수락한 explicit root 판정, 폐기다. pending이 없어도 새 표시는 약2프레임 뒤 release에서 나타난다. OnChange가 아니면 live 조건만 사용한다.

H: recordFieldNodeRevealBaseline은 OnChange 상태·active·visible 변이 전에 state 참조·active&&visible·generation·sequence를 entries에 append한다. 같은 node/write sequence에서는 한 번만 기록한다. sequence는 entryDepth·visitDepth가 모두0인 공개 chain/state 진입과 outer visit 시작에서만 증가하며 열린 entry/walk 안에서는 증가하지 않는다.

H lifetime: 예약 generation 이하의 node/policy entry만 drop하고 빈 노드 이력을 제거한다. pending인 drop은 아무것도 제거하지 않고 owed/token을 지운다. 남은 이력의 재예약까지 끝낸 뒤 release version을 증가시키고 복사한 release listeners를 마지막에 통지하여 listener의 새 기록이 독립 예약을 만든다. settle은 true→false에서 listener 전에 전체 해제하며 unavailable의 기존 정착 경로도 유지한다.

H: 해석된 policy와 load.root에 keyed인 no-cleanup layout effect 하나가 commitFieldNodeRevealPolicy를 호출한다. 초기 정책은 저장만 하고 이전 committed value와 Object.is가 다르면 그 이전 값과 generation을 이력에 append한다. rebuild·schema·validator 교체의 새 root에도 commit하며 숨김 cleanup은 committed policy를 지우지 않는다.

H: 표시당 hook은 node/candidate에 memoize하여 candidate만 release version+1을 읽고 나머지는0을 읽는 getter를 client/server snapshot 양쪽에 사용한다. subscribe는 node/candidate에 memoize하며 live 적격이지만 history가 거부한 candidate만 release listener를 등록하고 등록 직후 catch-up을 한 번 호출한다. React 표시 수명 저장소와 표시 layout effect는 없고 ordinary render의 subscription passive effect도 추가하지 않는다. 배열 filled-minus-empty mount는2회·ordinary write layout0회다.

알려진 한계는 hook disabled의 즉시 reveal, drop보다 늦은 state/enabled render의 hold 생략, commit-only 연속의 hold, release와 paint 사이 task의 쓰기가 released verdict를1~2프레임 표시함, 한 React batch 안의 미표시 state/enabled/policy 조합도 이력에 포함됨이다.

P3-10: ERROR-019 항목2는 숨긴 Form의 reset 재생성에 적용한다. 같은 schema reset을 포함한 다른 post-mount 사슬은 ready=false 동안 buffer하며 facd에서 미배달되던 기록을 R1이 reconnect 때 순서대로 전달한다. 숨긴 같은-schema reset의 chain-end 전달은 소유자 미결 질문이며 동작을 바꾸지 않는다.

수락한 explicit root 판정은 route 뒤 pending이면 settle을 통해, 아니면 직접 전체 이력을 해제하여 한 번만 release하고 delivery한다. release listener의 새 쓰기 이력은 보존한다(VALIDATE-052).

최초 후보0→release 뒤 비후보0의 snapshot 충돌은 React의 강제 재렌더에서 이전 render와 같은 값으로 버려진다. 후보는 version+1, 비후보는0으로 분리하여 모든 candidate 종료를 snapshot 변경으로 만들며 엔진 reader의 최초0 계약은 유지한다(VALIDATE-052).

### Amendment 10 v2 — 표시 판단과 후보 구독 분리

엔진 H 기록·해제·drop·정책 commit과 모든 예약 진입은 유지한다. FieldProxy와 FieldInputSlot은 enabled/live를 검사하고 live일 때만 isErrorRevealed로 이력을 판단한다. held일 때만 같은 렌더의 release version과 ErrorRevealSubscriber를 사용한다. 기존 ErrorBoundary와 FieldInput은 언제나 첫 자식이며 구독자는 두 번째 자리에 추가되어 입력 identity·focus가 hold 시작·종료에 보존된다.

FieldProxy는 모듈 reducer 하나를 추가하고 input은 useFieldInputControl의 composition reducer dispatch를 다섯 번째 반환값으로 재사용한다. aggregate useErrorVisibility는 useChildFieldErrors만 사용하며 candidate version+1/비후보0 getter를 유지한다. enabled/live가 거짓인 표시는 reveal 읽기나 새 구독 effect·판단 배열·결과 객체를 만들지 않는다.

subscriber는 passive effect만 사용한다. 소유 표시가 읽은 version과 구독 직후 버전을 비교해 같은 commit의 layout release와 Activity 재연결을 따라잡는다. reducer dispatch는 현재 이벤트 우선순위를 따라 노드 사건 없는 해제가 최악 한 paint 늦어질 수 있다. 약2프레임에 한 프레임이 더해질 수 있으며 transition은 transition lane, passive catch-up은 default다. 오류 변경의 기존 tracker는 sync이고 매 렌더가 이력을 다시 판단한다.

실제 Form의 catch-up·DOM identity/focus·Activity와 mount/hydration 계수 시험에 지정된 실패 변이를 적용해 확인한다. 이전 정식 창의 판정은 유지하고 전체 코드 관문 뒤 E/F-old/F-new/V1 진단만 수행한다. 다음 정식 창과 G2 새 규칙 사전 등록은 코디네이터 go Phase E까지 기다린다.


## IR-7 — hidden-form delivery (2026-11-01)

### Owner decisions (verbatim)

- Quote 39 (reset): "리셋에 대해서는 명확히 이해가 안되는데, 나는 숨김여부와 무관하게 reset 실행시점에 onError를 받는게 맞는거같아. 다만, form을 숨겨놓고(랜더링이 안되는게 아니라 진짜 숨겨만 놓고) onError 를 받는 경우가 있는지는 모르겠지만... 그거랑 무관하게 일관성을 생각하면 실행시점에 바로 onError를 받는게 적절해보이네"
- Quote 40: "1. 스키마를 사용한 값의 검증은 onValidate 아닌가? onError 는 진짜 오류를 수신하는 채널이잖아 2. Activity 기능을 사용해서 컴포넌트를 안그리는건 기존 컴포넌트를 css 등으로 visiblity hidden 설정하는거랑 다른건가? 라이프사이클이 같다면 보일때랑 안보일때가 다를 이유가 없어보이고, 동작이 다르다면 컴포넌트 라이프사이클 대신 엔진에서만 에러를 받아야할거같은데 Activity 기능을 고려하면 전반적으로 설계를 다 바꿔야하는건가?"
- Quote 41 (answer to the recommendation: a committed form delivers onChange, onStateChange, onError and the other form-level callbacks at the engine's chain end whether or not React Activity or Suspense hides it; only renders React may discard keep holding; a separate PR right after IR-6): "권장대로 IR6 이후 바로 설계 후 진행합니다."

### Rule

첫 layout commit을 마친(prepared) 현행 load는 Provider effect 연결 여부와 관계없이 모든 폼 수준 콜백을 보이는 폼과 같은 순서·내용으로 engine chain 끝에 전달합니다. 한 번도 준비되지 않은 load는 변경·상태·진단을 버리고 기록만 첫 commit까지 보관합니다. reset으로 은퇴한 load는 hasConsumer()가 false이며 기록을 버려 소비자에게 다시 전달하지 않습니다. Provider는 호스트 보고를 추가하지 않고 engine의 기존 reportOwnerlessError만 유지합니다. 루트 교체 뒤 정착한 옛 검증은 stamp·폐기로 소비자와 호스트 모두에 도달하지 않습니다.

### Limits

- L1: React는 숨김과 실제 unmount를 구분하지 않습니다. 실제 unmount 뒤에도 prepared와 루트 구독은 유지되며 보유한 핸들·노드의 쓰기, reset·rebuild·validate·submit과 예약 슬롯은 콜백을 전달합니다. mounted 트리의 검증 루트 참조 수는 cleanup에서 해제합니다. unmount 뒤 reset으로 만든 새 루트는 retain하지 않아 캐시 축출 뒤 재컴파일할 수 있습니다.
- L2: 숨김 중 onChange·onStateChange·onValidate·onDiagnosticsChange는 마지막 연결 commit의 콜백을 사용하고 prop 갱신은 show에 반영됩니다. onError는 insertion effect로 최신입니다. 숨김 중 Form ref는 null이므로 이전에 보유한 핸들·노드를 사용합니다.
- L3: 필드 layout effect의 렌더 경고와 쓰기는 show에 도착합니다. prepared load의 show 쓰기는 즉시 전달하지만 최초 mount의 준비 전 쓰기는 REACT-007에 따라 버립니다.
- L4: 루트 교체 reset의 기록은 binding을 새 루트로 바꾸기 전에 전달하므로 onError 안의 handle.node는 옛 루트입니다. mount-time 기록이 build-time 기록보다 먼저 도착합니다.

### Acceptance criteria

T1 Equivalence (stub the host sink, compare records by structure because each run has its own error objects, and use fields with no layout-effect writes or render-layer warnings so L3 does not apply). One scripted sequence run twice, once visible and once hidden after the first show: `setValue` of a valid value, of a value that fails conversion (a warning record), of a value whose validation throws in the validator (an error record), a subtree `setState`, a same-schema `reset`, and a root-replacing `rebuild`. Use referentially stable props and validator within a run (otherwise :176 resets at show), and a fresh schema object and validator per run (compile failures and blueprints are cached). Record every callback (`onChange`, `onStateChange`, `onValidate`, `onDiagnosticsChange`, `onError`) with its arguments in one ordered log after the deterministic settle helper; the two logs must be equal, and showing the hidden form afterwards must add nothing.
T2 A mount validation due while hidden runs while hidden (one validator call or `onValidate` while hidden, none added on show); replaces "(d-owed)".
T3 Adapt the existing hidden tests to the rule and name each change in the results: `validation.mount-owed.render.test.tsx` (R1, V6 isolation now at chain end while hidden, rebuild while hidden, W4, W5), `validation.hidden-reset-records.render.test.tsx` (records at write time and at reset time, never at show time), `validation.after-paint.render.test.tsx:311` "IR-6 (d)" (now: `validate` is called once after unmount and `onError` is not called, L1), and `bufferedRecords.test.ts` per C6. Watch `validation.continuity-restore.render.test.tsx` (X1 Activity restore), because a mount slot now runs while hidden; report whether it changes.
T4 Never prepared: a discarded speculative render delivers nothing (existing tests stay); an Activity initially hidden form delivers nothing until first shown, then flushes its construction records once (React 19 only; it passes on the current code and is exempt from the red-run requirement); the StrictMode replay still delivers once (`Form.binding.test.tsx`, `RootNodeContext.binding.test.tsx`, `Form.reactVersions.test.tsx`, `settle.test.tsx` stay green); an initially hidden form whose `validatorFactory` changes before first show delivers its construction records once and keeps exactly one subscription (React 19; red today through the leaked subscription).
T5 Subscription lifetime: after a root-replacing reset made while hidden and a show, and after a same-schema reset made while hidden and a show, one change produces exactly one `onDiagnosticsChange` (red today: two in both cases); the same after hide and show cycles, and under StrictMode on both majors; after unmount the validation root's reference count returns to its value before mount.
T6 Reset isolation: an `onError` that throws on a build-time record of a root-replacing reset (for example the development DialectMismatch warning, or another build-time record) leaves the form usable: the binding holds the new root, later records still arrive, writes succeed, and the failure reaches the host sink once; visible and hidden, both majors (red today for the visible case).
T7 Retired load: (a) in one act, after `rebuild`, a write through a node of the old tree that was detached before the rebuild raises the development `DetachedNodeWrite` warning through the old reporter (`refuseDetachedWrite.ts:18`); it must not call `onError`  (today it calls `onError`, because the previous load stays `ready` until the re-render commit). (b) A write validation that rejects after `rebuild` calls neither `onError` nor the host, before and after the change (a guard, exempt from the red-run requirement). If (a) cannot be produced, keep only (b) and state in the ledger supplement that no engine path delivers a late record to a retired load.
T8 Limits pinned: L1 (after unmount, a `setValue` through a node captured before unmount calls `onChange` once) and L2 (a callback prop changed while hidden is used only after show, while a changed `onError` is used at once; React 19).
Each new or adapted test, except the T4 initially hidden case, must fail on the stage branch before the change for the stated reason; store the red runs from the committed test text on both majors where they run.


### Gates

lint (0 warnings), typecheck, build; unit, render, react18, verify, storybook, production projects; the import-model test; public declaration and `src/index.ts` diff zero; FCA validate with no new finding; ledger checks; machine-path audit; existing skips and todos unchanged. No browser measurement: the hot-path change is a flag read of the same cost, and no measured row hides a form; say so in the results.


계약 문서를 별도 커밋하고 T1–T8의 허용된 예외 외에는 단계 기준에서 실패 원시와 시험 SHA256을 보존한 뒤 C1–C7을 구현합니다. 제품·시험 커밋과 생성 번들 커밋을 분리합니다. browser 측정·benchmark는 수행하지 않습니다. hot path는 같은 비용의 flag 읽기이며 기존 측정 행은 Form을 숨기지 않습니다. 시간·메모리 비용은 load별 retired 선택 필드와 reset 또는 GC까지 유지되는 루트 구독이며 새 루프·타이머는 없습니다.


### IR-7 불변 guard 예외 승인 — 2026-11-01

T5 hide/show cycles·StrictMode 단일 구독·검증 캐시 retain/release 균형은 기준에서도 통과하는 불변 guard로 유지합니다. 코디네이터 승인 조건에 따라 제품 머리6f1b36f22의 scratch에서 effect setup마다 cleanup 해제 없이 재구독하는 변형과 cleanup의 releaseValidationRoot를 생략하는 변형을 각각 주입했습니다. 양쪽 React major에서 구독 guard 둘과 균형 guard 하나가 모두 실패하며 mutation-runs.json에 최종 커밋 시험의 SHA256·실패 원시·변형 patch를 보존합니다. 기준 red의 부재를 숨기거나 red와 mutation red를 합산하지 않습니다. scratch는 증거 커밋 직후 Orca로 제거하고 남은 관문을 순차 수행합니다.


### IR-7 round b — 독립 검토 수정 (2026-11-01)

reset의 옛 load 은퇴는 batch try/catch 뒤·최종 build 기록 flush 앞으로 옮깁니다. adoption 전 컴파일 실패를 포함한 reset 사슬의 옛 runtime 기록은 사슬 끝에 onError 한 번으로 전달하고 caller에 다시 던지며 호스트 sink는 0회로 유지하고, batch가 던져도 이후 은퇴합니다. 교체된 never-prepared load의 생성 실패도 reset 끝에 reported 가드로 한 번 capture·호스트 보고하며 새 reporter.root를 유지합니다. 첫 commit 구독은 이전 구독을 먼저 해제해 reset이 이전 load를 반환한 경우에도 한 구독만 남깁니다.

L3에는 개발 StrictMode replay를 포함합니다: including the development StrictMode replay, which React models as a hide and show; production renders are unaffected. 비멱등 자식 mount layout 쓰기는 replay의 prepared load에서 onChange로 한 번 전달합니다. 최초 준비 전 쓰기는 계속 버립니다.

T7a는 retired load의 hasConsumer()가 false여서 report 호출 자체에 도달하지 않는 경로입니다. 소비자 무배달만 검증하며 reporter.root 유지·복원을 검증했다는 주장은 제거합니다. T4 validator 교체 뒤 구독 단언은 기존 구독 변형에서도 red를 확인합니다. T7b는 validator start promise를 기다리고 hidden mount 시험은 숨기기 전에 확보한 node로 settle합니다. 새 회귀는 visible/hidden adoption 실패, never-prepared 생성 실패, 양쪽 major StrictMode replay이며 최종 커밋 시험의 red·mutation·green 해시와 모든 순차 관문은 round b 결과에 보존합니다.


### Round b host 표면 정정 승인

기준 stage의 visible adoption 전 compile 실패를 양쪽 React major에서 관찰한 결과 caller throw·onError1·host0이었습니다. 코디네이터가 이 기존 표면을 계약으로 승인했으며 처음 브리프의 host 보고 가정은 대체합니다. 수정 뒤 visible·hidden 모두 caller throw·onError1·host0을 검사하고 커밋 시험 텍스트의 stage visible green과 06df red를 저장합니다. never-prepared 생성 오류의 reset 끝 capture·host1 보고는 이 adoption 실패와 다른 경로이며 그대로 유지합니다.


### IR-7 round c — never-prepared reset 사슬 기록 (2026-11-01)

이전 load가 never-prepared이면 batch try/catch 뒤·retired 설정 전에 records를 이관합니다. batch 도중의 adoption compile 실패 기록도 포함하여 이전 기록 전체를 새 build 기록 앞에 붙이며 원래 root·warning scope를 유지합니다. reporter와 새 root의 setup은 batch 전에 그대로 둡니다. 명령형 reset이 던진 경우에도 이전 load는 은퇴하여 늦은 옛 root 쓰기가 onChange·추가 onError를 내보내지 않습니다.

React19의 처음 숨긴 OnRequest Form에서 validator A를 실패하는 B로 바꾼 뒤 show하는 회귀를 stage의 compile 실패 surface·호스트 출력과 대조합니다. 최종 커밋 시험을 000f와 stage에서 실행하고, 은퇴를 try 안으로 옮기는 변형이 양쪽 major의 늦은 쓰기 단언을 깨는지 확인합니다. resetRootLoad의 효과와 RootLoad error/reported 주석도 reset 경로를 명시합니다. 순차 관문·raw·SHA256은 round c 결과에 보존합니다.


## IR-8 — load validation after the next frame (2026-11-01)

### Rule

Always(`true`, `ShowError.Always` 또는 해당 비트를 포함한 mask)를 포함해 최초 마운트·동일 스키마 reset·루트 교체 reset·rebuild·검증기 교체는 하나의 로드 검증 진입점을 다음 프레임 뒤 슬롯에서 실행합니다. `None`은 컴파일하지 않고, `OnRequest`만이면 컴파일만 하며, `OnChange`는 컴파일 후 현재 로드 시작 이후 쓰기 검증 요청이나 명시적 루트 검증이 없을 때 첫 판정을 냅니다. 자동 로드 컴파일 실패는 새 트리를 유지하고 로드마다 `surface: 'sink'` 한 번과 호스트 보고 한 번이며 reset·rebuild는 그 실패로 던지지 않습니다. `validate()`·제출은 즉시 시작하고 실패하면 `rejected`로 거부합니다. `if` 게이트의 구성·렌더 중 컴파일은 유지합니다. 첫 판정 전 빈 목록은 unknown으로 다루거나 `validate()`를 기다립니다. 명시적 반환과 제출 값은 호출 시점 snapshot이며 하위 검증은 전체 pending 요청을 보존합니다.

### Limits

- L1: 스키마 해석과 트리 구성, 그리고 `if` 게이트가 있는 스키마의 가드 컴파일(이때 전체 스키마도 컴파일됨, F6)은 로드 프레임에 남습니다. 가드만 따로 컴파일하는 플러그인 계약(항목 G)은 다음 단계입니다.
- L2: `Always` 폼의 첫 오류 표시는 첫 화면보다 한 슬롯(1~2프레임) 늦습니다. IR-6 quote 19의 첫 화면 전 판정은 quote 49로 거둡니다.
- L3: 슬롯 안의 첫 판정이 검증기 실행 중 예외(`ValidatorThrew`)로 끝나면 표면은 기존대로 `'rejected'`(호스트 없음)입니다. IR-8은 컴파일 실패의 표면만 통일합니다. 후보로 기록합니다.
- L4: 같은 스키마 객체와 같은 검증기를 이미 컴파일한 폼의 reset·rebuild는 캐시를 쓰므로 슬롯의 컴파일은 조회 한 번입니다. 이득은 새 스키마 객체, 검증기 교체, 아직 컴파일하지 않은 폼(None·OnRequest only)에서 생깁니다.
- L5: 컴파일 실패 뒤 `validationUnavailable`은 그 로드 동안 유지됩니다. 다음 로드(reset·rebuild·검증기 교체)가 `dispatchMount`·`dispatchResetForm`에서 지웁니다(F3). 같은 스키마 객체를 그대로 reset하면 캐시된 실패를 다시 만나 다시 한 번 보고합니다(로드마다 한 번).
- L6: unmount 뒤 reset으로 만든 루트는 retain되지 않으므로(IR-7 L1) 슬롯의 컴파일 결과가 축출될 수 있습니다. 변경 없음.
- L3 (ValidatorThrew surface in the slot verdict).
- Ledger supplements:

OnRequest-only의 새 background compile 비용은 quote 54로 수용한다. Always·새 객체 reset·검증기 교체는 로드 프레임 비용을 슬롯으로 옮긴다. 공개 엔진 표면은 유지하며 바인딩 adoption만 더 이상 컴파일하지 않는다. 숨김·unmount OnRequest도 슬롯을 실행하며 retain 전 캐시 축출 가능성이 있다.

### Acceptance criteria

T1 OnRequest only: validator `compile` count is 0 after the first paint and 1 after the slot; with a schema whose compile throws, `onError` receives exactly one record (`code: VALIDATOR_COMPILE_FAILED`, `surface: 'sink'`) after the slot, the host sink receives it once, `validate()` rejects and submit rejects afterwards, and no second `onError` record follows. Red today: compile count stays 0 and no record arrives.
T2 Always: no validator `compile` and no `onValidate` before the first paint (synchronous assertion after render); the first verdict and the error display arrive after the slot. Replaces the IR-6 pre-paint Always test. Red today: compile happens in the layout effect.
T3 Root-replacing reset, `rebuild()`, and validator change to a failing schema or validator: the call does not throw, `handle.node` is the new root, the new fields render, writes succeed, `onError` receives one `'sink'` record after the slot and the host sink one, `validate()` rejects. Visible and hidden (IR-7 T1 harness), both majors. Red today: throws with `'thrown'`, host 0 (IR-7 round b/c tests adapted accordingly: `validation.reset-failures.render.test.tsx`).
T4 Same-schema reset in OnChange: no verdict inside the reset act; exactly one verdict after the slot; `onValidate` receives the new list. Compare validator call counts. Red today: the chain end requests through the cadence (count 1 inside the frame-backed cadence instead of the slot; assert the slot origin by making the validator record `performance.now()` relative to the reset act, or by stubbing `scheduleValidationSlot` ordering; the worker states the chosen observation).
T5 Write before the slot: a user write after mount and before the slot makes the cadence request; the slot adds no second verdict (validator run count 1). Guard for first mount (passes today through `validationStamp > 0`); red for the same-schema reset case (stamp already positive today, so today's `hasFieldNodeValidationRequest` would skip the first verdict, which T4 covers; and after C3 the write's request supersedes the slot verdict).
T6 None: validator `compile` count 0 across mount, same-schema reset, root-replacing reset, rebuild and validator change (red today for root-replacing reset and rebuild, which compile in adoption).
T7 Core only (no provider): `mountFieldNode` without settings and `reloadFieldNodeForm` without settings still request the OnChange verdict at chain end (guard, unchanged).
T8 Superseded slot: two resets in one frame produce one verdict and, with a failing schema, one report (the first slot is dropped by the token).
T9 Explicit `validate()` before the slot on a failing schema: `'rejected'` once, then the slot adds no second report (`validationCompileReported`).

Amendments 1–3: 모든 로드 시작에 stamp 증가, finally 종료 직전 loadStamp 기록; deferred reset pending 정착; 오래된 explicit compile 실패만 보고 억제; 중복 $id 원인 캐시; 같은 $id 새 내용 replacement는 commit cleanup 뒤 compile. T10·T11은 write→reset 단일 최신 판정과 검증기 없는 pending 해제 guard이다. T4는 reset 직후 pending false가 red 기전이며 T8 토큰은 수동 슬롯 해제로 별도 확인한다.

### Gates

계약 별도 커밋 → 최종 시험 텍스트 stage red·SHA256·gzip 저장 → 제품 구현 → lint(경고 0), typecheck, build, unit, render, react18, verify, storybook, production, import-model, 공개 선언·src/index 무변경, FCA 새 finding 없음, 원장 검사, machine-path·skip/todo audit를 순차 수행한다. 제품과 생성 번들은 별도 커밋한다. 브라우저·benchmark는 수행하지 않는다.

### Approved implementation and amendments

## Changes

C1 (engine, `core/engine/write/utils/entry/dispatchLoadValidation.ts`, new). `dispatchLoadValidation(root): boolean`. Sequence: if `validationMode === None` or `validationUnavailable` return false; `try { assertValidationRootReady(root) } catch (failure) { failValidationCompile(runtime, failure); return false }`; if the validator is absent (null result) return false; return `(validationMode & OnChange) !== 0 && !hasFieldNodeValidationRequest(root)` where the read is the generalized one of C3. No chain entry is opened (nothing is written). Document the file as the single load-validation entry (seiri agent-legible rule 1).

C2 (engine, `core/engine/validation/utils/run/failValidationCompile.ts`, new). Extract the shared compile-failure handling from `requestFieldNodeValidation.ts:62-73`: `validationUnavailable = true; settleFieldNodeValidation(node); if (validationCompileReported) return; validationCompileReported = true; runtime.reportValidationFailure?.(failure)`. `requestFieldNodeValidation` calls it; C1 calls it. `runtime.reportValidationFailure` is set lazily by `requestFieldNodeValidationWave.ts:15`; C1 runs before any chain, so C1 sets it the same way (`runtime.reportValidationFailure ??= (failure) => reportValidationFailure(runtime, failure)`) or the assignment moves into one shared place. The worker chooses the place and names it in the results.

C3 (engine, `validation/utils/read/hasFieldNodeValidationRequest.ts`). Generalize from `validationStamp > 0` to "a request since the current load started": `(validationStamp ?? 0) > (validationLoadStamp ?? 0)`. New runtime field `validationLoadStamp?: number` (`record/types/runtime.ts`, beside `validationStamp`), written by `dispatchMount` and `dispatchResetForm` as `runtime.validationStamp ?? 0` next to the existing flag resets (F3). The surface binding `core/surface/utils/binding/hasFieldNodeValidationRequest.ts` and its `core/surface/index.ts` and `core/index.ts` exports lose their only consumer (C5) and are removed (Module Contract Principle 6). `surfaceIndex.test.ts` is adapted.

C4 (engine). `adoptFieldNodeChain.ts:29` no longer calls `assertValidationRootReady`; the JSDoc `@throws` and the DETAIL sentence (validation DETAIL.md:39-40 "재생성 인계 전에 … 동기로 드러내어") are corrected. `validation/index.ts:8` keeps exporting `assertValidationRootReady` because C1 (in `write`) consumes it. `dispatchResetForm` gains `settings: { deferValidation?: boolean } = NO_MOUNT_SETTINGS`-style handling identical to `dispatchMount.ts:34-36` (sets `deferMountValidation`, adds the target only when not deferred); `reloadFieldNodeForm` passes it through. `mountFieldNode` already accepts it.

C5 (provider, `providers/RootNodeContext/utils/scheduleLoadValidation.ts`, renamed from `scheduleMountValidation.ts`). 
```ts
export const scheduleLoadValidation = (load: RootLoad, store: RootLoadStore): void => {
  const token = (load.loadValidation = {});
  scheduleValidationSlot(() => {
    if (store.load !== load || load.loadValidation !== token) return;
    const root = load.root;
    if (!root) return;
    if (startFieldNodeLoadValidation(root)) validateLoadRoot(root);
  });
};
```
`RootLoad.loadValidation?: object` (type.ts) drops a slot superseded by a later load start on the same load object (same-schema reset). `startFieldNodeLoadValidation` is the new surface binding of C1 (`core/surface/utils/binding/startFieldNodeLoadValidation.ts`, exported from `core/surface/index.ts` and `core/index.ts`; its consumer is this provider file). `validateMountRoot.ts` → `validateLoadRoot.ts` and `reportMountValidationFailure.ts` → `reportLoadValidationFailure.ts` (content unchanged, JSDoc updated).

C6 (provider, `RootNodeContextProvider.tsx`). Line 191-194 becomes `scheduleLoadValidation(load, store)` with no mode check and no `alwaysRef`; `always`, `alwaysRef` and the effect at :98-100 are removed if `checkShowError` has no other use in this file (`showError` at :102 stays). In the `reset` handle, after `store.unsubscribe = subscribeRootLoad(...)` (:120) and before the `throw` paths, add `if (store.load.root) scheduleLoadValidation(store.load, store)`. `resetRootLoad.ts:60` passes `{ deferValidation: true }` to `reloadFieldNodeForm` and `:78` to `mountFieldNode`. The validator-change and rebuild paths go through `reset` and need nothing else.

C7 (documents, corrected in place): `core/engine/validation/INTENT.md` and `DETAIL.md` (:14, :39, :40, :46, :47, :49, :67, :68, :84: compile timing, the slot entry, failure surfaces; :67 stale duplicate of :68 is removed as the pre-existing carried-forward item), `core/engine/write/DETAIL.md:66` and the adoption sentence, `core/surface/DETAIL.md` (binding list), `core/DETAIL.md`, `core/engine/DETAIL.md`, `providers/RootNodeContext/INTENT.md` and `DETAIL.md` (:10, :21, :25, :27, :52), `docs/ko/SPECIFICATION.md:880` and `:1034`, `docs/en/SPECIFICATION.md:882` and `:1036`, `README.md:2730`, `QUICK_REFERENCE.md:576`, `docs/agents/.../validation-and-state.md:11`, `arrays-and-scale.md:154`, ADR 0004 and 0014 supplements. Ledger supplements (append only): `validate.md` VALIDATE-052 IR-8 supplement (Always after the slot; the load entry), VALIDATE-046 and `error.md` ERROR-201 IR-8 supplement (the atomic-reset rule is withdrawn: a reset whose new schema does not compile keeps the new tree and reports in the slot), the VALIDATOR_COMPILE_FAILED row (ERROR-146 to 157 range: "로드 뒤 첫 검증 요청" → "로드 뒤 다음 프레임 슬롯", surface: automatic paths `'sink'` with host, `validate()`·submit `'rejected'`), `write.md` WRITE-046 and WRITE-086 supplement (adoption no longer compiles), `event.md` EVENT-030 supplement, `react.md` supplement (provider slot for every load), `test.md` supplement naming the adapted tests. Plan records (append only): `architecture/plan/input-responsiveness/request.md` (quotes 44, 47, 48, 49 verbatim), `design.md` and `verification.md` IR-8 sections in the IR-7 section structure.

## Tests

Red first against the stage head from the committed test text (both React majors where the test renders), stored under `architecture/verification/input-responsiveness/raw/ir-8/` with sha256, except where marked guard.

T1 OnRequest only: validator `compile` count is 0 after the first paint and 1 after the slot; with a schema whose compile throws, `onError` receives exactly one record (`code: VALIDATOR_COMPILE_FAILED`, `surface: 'sink'`) after the slot, the host sink receives it once, `validate()` rejects and submit rejects afterwards, and no second `onError` record follows. Red today: compile count stays 0 and no record arrives.
T2 Always: no validator `compile` and no `onValidate` before the first paint (synchronous assertion after render); the first verdict and the error display arrive after the slot. Replaces the IR-6 pre-paint Always test. Red today: compile happens in the layout effect.
T3 Root-replacing reset, `rebuild()`, and validator change to a failing schema or validator: the call does not throw, `handle.node` is the new root, the new fields render, writes succeed, `onError` receives one `'sink'` record after the slot and the host sink one, `validate()` rejects. Visible and hidden (IR-7 T1 harness), both majors. Red today: throws with `'thrown'`, host 0 (IR-7 round b/c tests adapted accordingly: `validation.reset-failures.render.test.tsx`).
T4 Same-schema reset in OnChange: no verdict inside the reset act; exactly one verdict after the slot; `onValidate` receives the new list. Compare validator call counts. Red today: the chain end requests through the cadence (count 1 inside the frame-backed cadence instead of the slot; assert the slot origin by making the validator record `performance.now()` relative to the reset act, or by stubbing `scheduleValidationSlot` ordering; the worker states the chosen observation).
T5 Write before the slot: a user write after mount and before the slot makes the cadence request; the slot adds no second verdict (validator run count 1). Guard for first mount (passes today through `validationStamp > 0`); red for the same-schema reset case (stamp already positive today, so today's `hasFieldNodeValidationRequest` would skip the first verdict, which T4 covers; and after C3 the write's request supersedes the slot verdict).
T6 None: validator `compile` count 0 across mount, same-schema reset, root-replacing reset, rebuild and validator change (red today for root-replacing reset and rebuild, which compile in adoption).
T7 Core only (no provider): `mountFieldNode` without settings and `reloadFieldNodeForm` without settings still request the OnChange verdict at chain end (guard, unchanged).
T8 Superseded slot: two resets in one frame produce one verdict and, with a failing schema, one report (the first slot is dropped by the token).
T9 Explicit `validate()` before the slot on a failing schema: `'rejected'` once, then the slot adds no second report (`validationCompileReported`).
Adapted: `validation.after-paint.render.test.tsx` ("IR-6 (c)" stays; "reports a mount compile failure once as rejected" becomes `'sink'` plus host), `__tests__/e2e/validation-mount-calls.test.tsx` (None still 0), `migration/form-lifecycle.test.tsx` LANDING-025 (OnRequest compile failure: `validate()` and submit still reject; now also one `'sink'` record after the slot), `Form.policies.test.tsx` VALIDATE-044, `validation.lifetime.test.ts`, `surfaceIndex.test.ts`, IR-7 T6 reset isolation (a throwing onError on a build-time record; unchanged behaviour, re-run).

## Gates

lint (0 warnings), typecheck, build; unit, render, react18, verify, storybook, production projects; the import-model test; public declaration and `src/index.ts` diff zero; FCA validate with no new finding; ledger checks; machine-path audit; existing skips and todos unchanged. No browser measurement window: the compile is the same work moved out of the load frame, and the IR-6 rows mount in OnChange mode where it already ran after paint; the results state this and the IR-1 numbers (F8) as the expected saving for OnRequest-only, Always and reset loads. Contracts first in their own commit; red runs stored; product and test commits separate from generated bundles.

## Candidates recorded, not done

- L3 (ValidatorThrew surface in the slot verdict).
- Item G (guard-only compile for `if` gates).
- Stale `next.error` after a failed construction reset (pre-existing, IR-7 note).

## Amendment 1 — codex review (2026-11-01; triage in ir-8-review-codex.md)

A1 (load start supersedes earlier requests; replaces C3's stamp definition). Every load start, `dispatchMount` and `dispatchResetForm`, deferred or not, advances `validationStamp` by one and then records `validationLoadStamp = validationStamp`. A deferred `dispatchResetForm` also clears `validationPendingTargets` and settles the pending hold with `settleFieldNodeValidation(root)` (no stamp), which are the steps `clearFieldNodeFormErrors.ts:29-33` applies to non-OnChange resets today; that existing bump is subsumed by the load-start advance (capture after it, so it is not counted as a request). Effects: a cadence run queued before the reset drops at `requestFieldNodeValidation.ts:32`, an in-flight run drops at `:46` and `:60`, a stale explicit `validate()` success returns without routing at `dispatchValidate.ts:90`. `hasFieldNodeValidationRequest(node)` becomes `(validationStamp ?? 0) > (validationLoadStamp ?? 0)` and its documented meaning is "a write validation request or an explicit root validate since the current load started"; a subtree `validate()` does not count (unchanged contract, `validation.after-paint.render.test.tsx:265`). Core-only non-deferred loads keep their chain-end request; the advance only invalidates runs that their own request would have superseded anyway. New regression: write, then a same-schema reset in the same act, no further write: exactly one validator run after the slot.

A2 (stale explicit validate). `dispatchValidate` captures `validationLoadStamp` before its first await; in the catch, when the captured value differs from the current one, it rethrows without touching `validationUnavailable`, `validationCompileReported` or settlement and without reporting, the same treatment `dispatchValidate.ts:49` gives a disposed root. The caller's promise still rejects. T9 gains the case: `validate()` on a failing schema, then a same-schema reset before the slot: the caller rejects, `onError` receives exactly one record (from the slot, `'sink'`), the host sink one.

A3 (scope of "unchanged"). `adoptFieldNodeTree` is binding-only (not exported from `src/index.ts`), so the public core API is unchanged and the binding contract changes: adoption no longer compiles or throws `ValidatorCompileFailed`. `validation.same-id.test.ts` "VALIDATE-046 (iii) keeps the old chain intact when rebuilt-root compilation fails" is rewritten to the new contract (adoption proceeds; the slot entry reports the failure with `reason: 'duplicateSchemaId'` while the old root is still retained) and named in the results.

A4 (tests). T1 and T3 use a validator whose compile fails for an uncompiled (validator, authored root) pair; a rebuild with an already compiled pair cannot be red. T4 holds the load slot in a separate queue (stub `scheduleValidationSlot` in the provider test, release it by hand), advances only the cadence, and expects zero validator runs before the slot is released and one after. T8 releases the stale slot callback first and expects zero engine load entries, then the latest and expects one. T5, T7 and the first-mount and same-schema-reset cases of T6 are guards; T9's original case is a guard, A2's case is red. Count real validator executions separately from `onValidate([])` deliveries caused by reset clearing.

A5 (facts and limits). F2, T1, T2 and T6 hold only for schemas without an `if` gate: in development `fieldNodeFactory.ts:202` compiles the whole schema for any `if` gate regardless of mode (L1). F8 is not an OnRequest saving: a guard-free OnRequest-only initial load pays no compile today, and IR-8 adds one in the background (owner quote 44). The results separate the cost moved off the load frame (Always, uncompiled replacement resets, validator change) from that new background cost.

A6 (provider). The first-mount scheduling stays inside the existing `!load.prepared` branch, so a StrictMode replay schedules once.

A7 (documents added to C7). `src/providers/DETAIL.md:12-13`; `providers/RootNodeContext/DETAIL.md:17-19` and `:58` (alwaysRef, duplicate Always runs, the inline verdict and the pre-frame exception); `core/engine/validation/DETAIL.md:30` (the stamp contract and the removed surface wrapper); ledger supplements for `validate.md` VALIDATE-021 (`:349`, registration order now follows the layout-effect release of the old root when the slot runs after the commit), `error.md` ERROR-019 (`:503`, `:506`, the slot report for automatic load compile failures) and ERROR-164 (`:2507`, the canonical VALIDATOR_COMPILE_FAILED row); supplements to `architecture/design/05-validation-and-errors.md` (`:189`, `:531`, `:701`, `:827`) and `architecture/design/07-landing-and-tests.md` (`:512`, `:1107`); tests `validation.same-id.test.ts:91` (A3) and `validation.mount-always.render.test.tsx:97` (the pre-frame `'rejected'` Always case becomes the slot `'sink'` case). The QUICK_REFERENCE path is `docs/QUICK_REFERENCE.md:576`.

## Amendment 2 — Opus design check (verifier ir8-design-check, PASS with conditions, no P1, six P2, nine P3; 2026-11-01)

Where this amendment and Amendment 1 differ, this amendment wins.

B1 (load start; replaces A1's placement, verifier P2-1 and codex P1-1).
- In `dispatchMount` and in `dispatchResetForm`, deferred or not, immediately after the flag resets (`validationUnavailable = false; validationCompileReported = false`), advance `validationStamp` by one.
- In `dispatchResetForm` with `deferValidation`, at the same point, also clear `validationPendingTargets` and settle the pending hold with `settleFieldNodeValidation(root)` (no stamp).
- Both entries record `validationLoadStamp = validationStamp ?? 0` in their `finally` block immediately before `exitFieldNodeChain`, so the non-OnChange bump in `clearFieldNodeFormErrors.ts:29-32` never counts as a request. A non-deferred OnChange reset's own chain-end request does count, which is correct and unobserved (no slot in core-only use).
- Reason for settling (deviation from the verifier's "do not settle"): an OnChange form without a validator whose write request was queued before the reset would otherwise keep `validationPending` forever. The queued run drops at `requestFieldNodeValidation.ts:32` and the slot runs no verdict, because C1 returns at the null validator. `settleFieldNodeValidation.ts:12-17` releases only when a hold existed, so the common reset adds no release, and every deferred load start leaves pending false, as the first mount does today.
- Reason for advancing at every load start (beyond the verifier's deferred-reset-only bump): A2 uses `validationLoadStamp` as the load generation. With the advance, every load start yields a larger value by construction. This includes a core-only reset after a subtree `validate()`, which does not move the stamp.
- T10 (guard; green today, red against v1, green after): OnChange form, settle; in one `act`, `setValue('typed')` then `reset()`; settle. The validator runs exactly once, with the default value.
- T11 (guard): OnChange form without a validator; in one `act`, a write then `reset()`; after the slot, `isValidationPending(handle.node)` is false.

B2 (duplicate reason; verifier P2-2 (a)).
- `ValidationEntry` gains `readonly duplicate?: boolean`. `readValidationEntry`'s catch (`:72-74`) sets it with the existing predicate: a string `$id`, the message gate `/already exists|duplicate/i`, and another counted root with the same `$id` and count > 0 at compile time.
- `assertValidationRootReady` keeps the message gate and uses `entry.duplicate === true ||` the existing scan.
- Test (`validation.same-id.test.ts`, red today, green after): retain `first`, compile `second` (fails), release `first`, then `dispatchValidate(second)` rejects with `reason: 'duplicateSchemaId'`.
- A3's rewrite of "VALIDATE-046 (iii) keeps the old chain intact": adoption proceeds without compiling, and the failure surfaces at the next compile with the reason when a same-`$id` root was counted at compile time.

B3 (same-`$id` replacement; verifier P2-2 (b); a recorded behaviour change, no owner decision needed because it removes a failure).
- In a visible form, the `useSyncExternalStore` re-render after `reset` commits before the slot. Its layout-effect cleanup releases the old root, and `readValidationEntry.ts:53-61` then evicts it before compiling the new one. So a root-replacing reset to a new schema object with the same `$id` compiles with a non-isolating validator, where adoption fails today.
- Two mounted forms sharing an `$id` keep the duplicate failure.
- `if`-gated schemas compile during the reset while the old root is retained, so they keep today's failure, with the reason (B2).
- Record this in the ERROR-201, VALIDATE-046 and VALIDATE-021 supplements.
- Render test: a rebuild to a same-`$id` object under a register/release-tracking validator produces no `onError` record.

B4 (test labels; verifier P2-3, overrides A4 where they differ).
- T4 red mechanism: `isValidationPending(handle.node)` immediately after `act(() => handle.reset())` is true today and false after. The count assertions stay as guards. `after-paint.render.test.tsx:60-90` is the existing near-equivalent.
- T5 same-schema case: guard.
- T8: the root-replacing variant is red (each reset throws today). The same-schema variant is a guard. Do not cite the token as a red mechanism. The token's own check is A4's manual slot release (stale callback: zero engine load entries).
- T9's original cases: guard (first mount is covered by `after-paint.render.test.tsx:146-178` and `:243-263`). A2's case is red: today the stale `validate()` reports `'rejected'` and suppresses the reset's run report, so the host gets 0.

B5 (adapted tests; verifier P2-4).
- `validation.mount-always.render.test.tsx:33-72` is the pre-paint Always test that T2 replaces.
- `validation.mount-always.render.test.tsx:97-135` becomes `'sink'` plus one host report after `clock.frame(); clock.task()`.
- `validation.same-id.test.ts:91-115` follows A3 and B2.
- In `Form.policies.test.tsx`, only `:48-74` changes (await `settleValidation` before asserting `second.compile`); `:76-101` stays green.
- `src/__tests__/helpers/settleValidation.ts:7` JSDoc: reset verdicts now also come from the slot. Reset tests with async validators await `onValidate` explicitly.
- Also run and report `validation.reveal-history` (`:306`), `Form.resetCommit`, the cache-reset tests and `validation.visibility` (`:402`), which the verifier did not trace.

B6 (documents; verifier P2-5, added to C7 and A7).
- Package documents:
  - `src/providers/DETAIL.md:12`, `:13`, `:27`;
  - `providers/RootNodeContext/DETAIL.md:17`, `:18`, `:19`, `:28`, `:43`, `:58`;
  - `core/engine/write/DETAIL.md:58` (the `dispatchResetForm` signature) and `:61`;
  - `core/engine/validation/DETAIL.md:28`, `:30`;
  - `core/surface/DETAIL.md:26`, `:116`.
- The VALIDATE-052 projection sentence ("최초 mount inline 판정") gets an IR-8 supplement in all ten documents IR-6 and IR-7 wrote: ADR 0001 (`:152`), 0004, 0007 (`:567`), 0008 (`:411`), 0009 (`:272`), 0010 (`:242`), 0014, and design 03 (`:508`), 05 (`:827`), 07 (`:1107`).
- Ledger supplements:
  - LANDING-041 (`landing.md:766`, with its 69C-05 supplement at `:774`, "reset은 진입 끝에서");
  - ERROR-019 item 2 (`error.md:497`).
- The `react.md` and ERROR-201 supplements explicitly withdraw the IR-7 round b sentence at `react.md:654` and `error.md:3180` ("adoption 전 컴파일 실패 … caller에 다시 던지며 호스트 sink는 0회").
- Run the ledger projection tools (sup-insert, doc-coverage) if they own those ADR and design copies, and say so in the results.

B7 (exports; verifier P2-6).
- Add `dispatchLoadValidation` to `core/engine/write/index.ts` and to the write block of `core/engine/index.ts`.
- Remove `hasFieldNodeValidationRequest` from `core/engine/index.ts:45`, from `core/surface/index.ts` and from `core/index.ts`, together with the surface binding file. C1 imports it from `validation/index.ts:14`, which stays.
- Add `failValidationCompile` to `validation/index.ts`; C1 is its consumer.
- Update `core/engine/DETAIL.md:106`, `:118`, `:130`.

B8 (advisories adopted).
- (P3-1) Signature `failValidationCompile(node, failure)`. A new write-side helper `ensureValidationFailureReporter(runtime)` in `core/engine/write/utils/report/` installs `runtime.reportValidationFailure`. Both `requestFieldNodeValidationWave.ts:15` and C1 use it.
- (P3-2) C1 sends only `ValidatorCompileFailed` to `failValidationCompile`. Any other failure, such as the `TypeError` at `readValidationEntry.ts:48-49`, goes to `runtime.reportValidationFailure` without marking validation unavailable, mirroring `requestFieldNodeValidation.ts:62-73`.
- (P3-3) F4 corrections:
  - The comparison is at `hasFieldNodeValidationRequest.ts:12`.
  - Other stamp writers are `clearFieldNodeFormErrors.ts:30` and `disposeFieldNodeTree.ts:50`.
- (P3-4) Rename the runtime field `deferMountValidation` to `deferLoadValidation` (`runtime.ts:268`, `prepareFieldNodeValidation.ts:13`, `exitFieldNodeChain.ts:110`, `dispatchMount.ts:34`, `core/DETAIL.md:71`). The settings key `deferValidation` stays. `__legacy__` is untouched.
- (P3-5) Rewrite the stale JSDoc at `assertValidationRootReady.ts:13-18`: it compiles or reads the cached whole-schema validator for a root, and throws `ValidatorCompileFailed` on failure.
- (P3-6) A reset whose new tree cannot be built returns the previous load (`resetRootLoad.ts:69-71`). The slot then repeats that load's cached compile lookup and, when no request happened since that load started, one more verdict on the unchanged value. `onValidate` stays silent through `retainEqualValidationIssues`. This is accepted as benign and stated in the results.
- (P3-7, P3-8) L6 adds:
  - Hidden forms (Activity or Suspense) have effects disconnected, so the slot compiles before retain. This is the same exposure as today's adoption-time compile.
  - An unmounted OnRequest form also compiles in the slot, and a failure gives one `'sink'` record plus a host report, per the Rule.
- (P3-9) Rule wording: "React 없이 엔진만 쓰는 경우의 동작은 바뀌지 않습니다" becomes "패키지 공개 엔진 표면의 동작은 바뀌지 않습니다. 바인딩 전용 `adoptFieldNodeChain`은 더 이상 컴파일하거나 던지지 않습니다."

## Owner decision added — quote 54 (2026-11-01)

- Quote 54 (answer to A5: OnRequest-only initial loads now pay a background compile after the first paint): "그 비용은 수용한다. 컴파일 비용 이월은 사용성을 불균일하게 만든다"
- The results cite this quote where they report the new background cost, and the request.md record carries it verbatim with quotes 44, 47, 48 and 49.

## Amendment 3 — delta check of Amendments 1 and 2 (verifier ir8-design-check, PASS with conditions, one P2, seven P3; 2026-11-01)

This amendment is applied as the verifier wrote it. It wins over Amendments 1 and 2 where they differ. The design is approved for dispatch with it.

C3-1 (P2-A, two core tests count stamp increments across a load start; added to B5).
- `core/engine/write/__tests__/dispatch.binding-input.test.ts:210-238` ("69C-05 deferred mount omits validation while default mount requests it once"): `:233` expects `immediate.runtime.validationStamp` to be 1, and after B1 it is 2.
- `core/engine/write/__tests__/dispatch.onChange.test.ts:35-46` ("EVENT-032 reset with unchanged emit does not call onChange"): `:44` expects `before + 1`, and after B1 it is `before + 2`.
- Fix for both: assert the request count as `runtime.validationStamp! - runtime.validationLoadStamp!` equal to 1. `validationLoadStamp` is recorded in the `finally` block before the chain-end request, so this counts only the request.
- Name both in the results as adapted for the load-start advance.

C3-2 (P3-1, line references).
- The non-OnChange bump in `clearFieldNodeFormErrors.ts` is at `:34-37`: the bump at `:35` and the settle at `:36`. This corrects A1, B1, B8 P3-3 and the codex triage.
- `validationPendingTargets = undefined` at `:38` already runs for every reset, in every mode. B1's "also clear `validationPendingTargets`" is therefore redundant but harmless. B1's own step is the advance plus the settle.

C3-3 (P3-2, rename scope). Remove `core/DETAIL.md:71` from the `deferMountValidation` → `deferLoadValidation` rename list. That line documents the test fixture prop `nodeFromJSONSchema({ deferMountValidation })`, which configures only mount and keeps its name. The prop is in `fixtures/nodeFromJSONSchema.ts:20` and `:25`, `hostEntry.test.ts:9-20`, `global-errors.test.ts:27` and `visibility.mount-release.test.tsx:142`.

C3-4 (P3-3, narrowing A2). In `dispatchValidate`'s stale branch, skip the flag writes and the report only for `ValidatorCompileFailed`. Every other failure, such as a stale `ValidatorThrew`, keeps today's path: its `'rejected'` record (ERROR-019 item 3) goes to the same load object's reporter, and its settle with a stamp is already a no-op after the advance.

C3-5 (P3-4, T9 A2 case ordering). Call `reset()` synchronously right after `validate()`, in one `act`, before awaiting the promise. The compile failure surfaces in the microtask after `validate()`'s first await. If the test awaits the rejection first, both today and after IR-8 produce `'rejected'` and then `'sink'`, and the red claim fails.

C3-6 (P3-5, one regex). Define `DUPLICATE_SCHEMA_ID_MESSAGE` once, beside `readValidationEntry`, for example in `core/engine/validation/utils/cache/constants.ts`. `assertValidationRootReady` imports it, which keeps the existing run → cache import direction. Update the `app/cache/DETAIL.md:219` inventory row, which points at `assertValidationRootReady.ts:9` today.

C3-7 (P3-6, DETAIL wording). `core/engine/validation/DETAIL.md` W3 (`:17`) says a chain without a request "이전 대기 요청이나 더 새로운 판정을 풀지 않는다". Add one sentence there, and one to H (`:10`, `:12`), naming the deferred load-start settle as a pending true-to-false release that drops the earlier request. This is added to B6.

C3-8 (P3-7, B3 render test setup).
- `rebuild()` on the same schema object reuses the cached entry, and a deep-equal new object takes the same-schema path (`isSameSchema`), so neither exercises B3.
- Set up the test this way: rerender with a new schema object that has the same `$id` and different content, then call `reset()` or `rebuild()`.
- Use a validator that throws `Error('schema with key already exists')` while that `$id` is registered and unregisters it on `release`.
- Expect no `onError` record, and the form validating against the new schema after the slot.

C3-9 (test placement, coordinator; removes ambiguity in the brief).
- T1–T6, T8, T9 and the B3 render test go in `src/__tests__/e2e/validation.load-slot.render.test.tsx`.
- T7 goes in `src/core/__tests__/loadValidation.test.ts`.
- T10 and T11 go in `src/__tests__/e2e/validation.after-paint.render.test.tsx`.
- The B2 test goes in `core/engine/validation/__tests__/validation.same-id.test.ts`.


## IR-8 round b — results-gate 수정 (2026-11-01)

codex F1과 results-gate 조건을 채택한다. B2의 `entry.duplicate === true || 기존 scan`은 `entry.duplicate`만 읽는 계약으로 대체한다. readValidationEntry가 컴파일 전에 해제된 같은 $id 루트를 축출하므로 컴파일 시점 counted-root 판정이 충분하며 나중에 retain된 루트는 원인을 바꾸지 않는다 (VALIDATE-046).

컴파일 실패 거부 객체는 캐시 항목마다 하나로 메모한다. 같은 폼이 이미 보고한 객체의 native submit 거부는 onError를 반복하지 않고 host에만 보고한다. 명시적 handle.submit은 계속 거부한다 (ERROR-019, ERROR-139, ERROR-164).

C3-9의 single-file 배치를 대체한다: T3·T9·B3는 validation.load-slot-failures.render.test.tsx로 본문을 유지해 옮기고 native submit 두 모드를 추가한다. 원래 파일은 T1·T2·T4·T5·T6·T8을 유지하며 양쪽 모두 15-case cap을 지킨다 (TEST-021).

T10·T11 즉시 pending, T10의 frame 전 실행 0, T5 reset의 새 슬롯 1, W4 sink·compile/handler host 각 1, Form.policies의 frame 전 compile 0, mount/reset load-start stamp 증가를 강화한다. F1·native-submit 및 강화 시험을 0df36857c에서 실행하고, mount/reset advance를 각각 제거한 scratch copy의 red도 보존한 뒤 scratch를 제거한다 (TEST-021).

L6에 run-time retain 후보를 기록하고 수명 계약은 바꾸지 않는다. 캐시된 compile 거부를 render에서 다시 던지면 seen이 RENDER_FAILED 한 번을 생략하고 seen에서 제거하는 한계를 기록한다. raw 경로 감사는 일반 파일과 gzip 모두의 /tmp 경로까지 포함하며 과거 감사의 누락을 바로잡는다 (VALIDATE-021, ERROR-019, TEST-021).

lint·typecheck·build·unit·render·react18·verify·storybook·production·import-model을 순차 실행한다. 두 load-slot 파일의 act warning 0, FCA 새 finding 0, 원장 기준 대비 새 문제 0, machine-path 0와 skip/todo 불변을 확인하고 round-b 원시에 보존한다 (TEST-021).


## IR-9 — onError record origin (2026-11-01)

onError is an event channel: it delivers the one record of each occurrence and does not maintain a current error list or report resolution.

`onError?: (record: FormErrorRecord) => void`는 발생마다 해당 기록 하나를 전달합니다. 기록의 필수 `origin`은 발생을 만든 연산을 나타냅니다.

| origin | 연산 |
| --- | --- |
| `load` | 트리 구성·mount·reset·rebuild·검증기 변경과 그 로드 사슬 |
| `write` | 공개 쓰기·배열 동사·상태·batch·맥락·finishInput·외부 오류 및 통지 리스너 |
| `validate` | 자동·명시적 전체 스키마 컴파일·실행, 판정 전달 및 그 리스너 |
| `submit` | SubmitWhileDegraded와 네이티브 submit의 capture에서 처음 드러난 실패 |
| `render` | RenderFailed 경계 및 ChildNodeComponentsOnTerminal 같은 렌더 계층 경고 |

사슬을 연 가장 바깥 연산이 origin을 정합니다. reset의 onChange 안에서 중첩 쓰기가 나면 `load`이며, 쓰기 사슬의 노드 리스너나 폼 onChange가 reset을 호출하면 `write`입니다. 검증 결과 파동 리스너의 실패는 `validate`이고, 로드 직후 독립 setState 리스너의 실패는 `write`입니다. 최초 commit의 외부 errors 적용은 `load`, errors prop 변경은 `write`입니다. 제출 안의 dispatchValidate가 이미 보고한 실패는 `validate`를 유지합니다. 개발 콘솔의 warnDevelopmentIssue 경고는 기록이 아닙니다. 오류 묶음은 호출자에게 던지는 값으로만 유지하고 개별 기록에는 싣지 않습니다. 전달 시점·중복 제거·호출자 거부·호스트 싱크·재진입 규칙은 유지합니다.

C1–C6와 Amendment 1 A1–A5·P3 전체를 적용합니다. src/index.ts·package version은 유지합니다. 계약→시험 red→제품→순차 관문 순서이며 측정창·벤치는 필요하지 않습니다.


## Defect round — Amendment 2 제품 라운드

DR-1·DR-2·DR-3과 D9 제한은 [결함 설계](../defect-round/design.md)를 따릅니다. 기존 계획·측정 기록은 보존하며 D4·D5는 기준 재현 red 뒤 코디네이터 Amendment 3까지 수정하지 않습니다. D6·D7은 비재현 guard를 보존합니다. 측정과 기록 경로 정리는 별도 라운드입니다.


## Amendment 7·8 보충

DR-13은 남은 로드 판정을 root 요청으로 충족하고 대체된 비동기 targets를 보존합니다. DR-14는 보고된 원인과 handler 예외만 담은 capture를 생략하며 degraded caller 거부는 bundle로 보존합니다. DR-15는 읽기 당시 scope와 입력 root의 수명을 지킵니다. 공개 batch/walk 이력 예외의 현행 문서를 정정합니다. IR-8의 쓰기 요청 root 가정은 [결정 보충](../../reviews/defect-round.md)으로 정정하며 기준 재현·React 두 버전·mutation·최종 관문으로 검증합니다.


## Amendment 9·10 — 결과 관문 정정

DR-13의 완료 시 대상 재삽입은 요청 시점 handoff로 대체합니다. cadence/root 실행 소유 객체를 자기 실행만 지우며 하위 validate는 건드리지 않습니다. DR-1은 구성 중 unpinned guard read의 설치 루트를 축출하지 않고 DR-2는 예약 load.retired만 늦은 host 보고의 은퇴 신호로 씁니다. DR-14는 nonempty dense known bundle만 생략합니다. DR-11의 degraded native handler 실패는 ERROR-028에 따라 하나의 bundle로 host에 전달하도록 바뀌었습니다. 슬롯의 원소별 host 형태와 native의 거부 그대로 전달을 통일하는 결정은 단계 마감으로 남깁니다. node/root 입력에는 추가 경로 탐색·리스너 배달이 없고 렌더마다 상수 시간 snapshot hook 하나가 있습니다. [정정 결정](../../reviews/defect-round.md)의 Amendment 9·10을 따르며 새 reds·변이·전체 관문은 결과 문서에 보충합니다.
