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
