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

H: 표시당 hook은 node/candidate에 memoize하여 candidate만 release version을 읽고 나머지는0을 읽는 getter를 client/server snapshot 양쪽에 사용한다. subscribe는 node/candidate에 memoize하며 live 적격이지만 history가 거부한 candidate만 release listener를 등록하고 등록 직후 catch-up을 한 번 호출한다. React 표시 수명 저장소와 표시 layout effect는 없고 ordinary render의 subscription passive effect도 추가하지 않는다. 배열 filled-minus-empty mount는2회·ordinary write layout0회다.

알려진 한계는 hook disabled의 즉시 reveal, drop보다 늦은 state/enabled render의 hold 생략, commit-only 연속의 hold, release와 paint 사이 task의 쓰기가 released verdict를1~2프레임 표시함, 한 React batch 안의 미표시 state/enabled/policy 조합도 이력에 포함됨이다.

P3-10: ERROR-019 항목2는 숨긴 Form의 reset 재생성에 적용한다. 같은 schema reset을 포함한 다른 post-mount 사슬은 ready=false 동안 buffer하며 facd에서 미배달되던 기록을 R1이 reconnect 때 순서대로 전달한다. 숨긴 같은-schema reset의 chain-end 전달은 소유자 미결 질문이며 동작을 바꾸지 않는다.

수락한 explicit root 판정은 route 뒤 pending이면 settle을 통해, 아니면 직접 전체 이력을 해제하여 한 번만 release하고 delivery한다. release listener의 새 쓰기 이력은 보존한다(VALIDATE-052).
