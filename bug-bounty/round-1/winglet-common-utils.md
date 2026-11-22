# @winglet/common-utils 버그 바운티 결과

확인된 버그는 7건입니다. 모든 항목은 실패하는 재현 테스트로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다. 기존 테스트 중 아래 동작을 의도된 것으로 고정한 테스트는 없습니다.

재현 테스트: [`probes/winglet-common-utils/probes.test.ts`](probes/winglet-common-utils/probes.test.ts)

## 1. `equals`와 `stableEquals`가 내부 상태가 다른 내장 객체를 같다고 판정합니다

- 심각도: 중간. 잘못된 값을 반환하며, 문서에 적힌 규칙이 막으려던 바로 그 경우입니다.
- 영향받는 공개 API: `equals`, `stableEquals` (`@winglet/common-utils`와 그 `object` 하위 경로).
- `true`가 나오지만 `false`가 나와야 하는 입력:
  - 바이트가 다른 두 `ArrayBuffer`, 바이트가 다른 두 `DataView`.
  - `equals(new Number(1), new Number(2))`, `equals(new Error('a'), new Error('b'))`.
  - `stableEquals(new Number(1), new Number(2))`, `stableEquals(new Boolean(true), new Boolean(false))`.
- 어긋난 계약: `equals/INTENT.md`의 Never do 항목과 `equals/DETAIL.md`는 내장 객체가 열거 가능한 키가 비어 있다는 이유만으로 같다고 판정되지 않는다고 적고 있습니다.
- 원인: `packages/winglet/common-utils/src/utils/object/equals/utils/equalsRecursive.ts:59`의 `equalsBuiltin`은 Date, RegExp, Map, Set만 처리합니다. 다른 태그는 69행의 키 비교로 넘어가는데, 자기 열거 키가 없으므로 같다고 판정됩니다. `stableEquals`도 박싱된 원시값에서 같은 빈틈이 있습니다.
- 재현: "equals built-in state" 묶음의 테스트 5개.
- 확신도: 높음. 단, `DETAIL.md`는 `ArrayBuffer`의 바이트 비교를 `stableEquals` 쪽 범위로 적고 있어 `equals`의 `ArrayBuffer` 경우는 의도로 읽힐 여지가 있습니다. 그래도 INTENT의 Never do 규칙과는 충돌합니다.

## 2. `debounce`가 디바운스된 함수 안에서 다시 호출된 호출을 잃어버립니다

- 심각도: 중간. 스스로 다시 예약하는 폴링이나, 같은 이벤트를 동기적으로 다시 일으키는 처리기 같은 재진입 호출이 실행되지 않습니다.
- 영향받는 공개 API: `debounce` (`@winglet/common-utils`와 그 `function` 하위 경로). `@winglet/react-utils`의 `useDebounce`는 자체 타이머로 구현되어 있어 이 버그와 무관합니다.
- 어긋난 계약: `rateLimit/DETAIL.md`는 원래 함수가 마지막 호출에 대해 한 번 실행된다고 적고 있습니다.
- 원인: `packages/winglet/common-utils/src/utils/function/rateLimit/helpers/FunctionContext.ts:131`의 `execute()`가 `fn` 반환 후 `__clearContext__()`를 호출해, 재진입 호출이 저장한 인자를 지웁니다. 이어서 타이머 콜백이 166행에서 `this.clear()`를 호출해 재진입 호출이 방금 예약한 타이머까지 취소합니다.
- 재현: 테스트 "a call made from inside the debounced function is not lost". 실제 `[1]`, 기대 `[1, 2]`.
- 확신도: 높음.

## 3. `withTimeout`이 이미 중단된 신호를 무시합니다

- 심각도: 중간. 이미 중단된 신호를 넘기면 `ms`만큼 다 기다린 뒤 `AbortError`가 아닌 `TimeoutError`로 거부합니다. 같은 상황에서 바로 거부하는 `delay`, `timeout`과도 동작이 다릅니다.
- 영향받는 공개 API: `withTimeout` (`@winglet/common-utils`와 그 `promise` 하위 경로).
- 어긋난 계약: JSDoc의 `@throws {AbortError} When canceled via AbortSignal`과, `options.signal`이 함수와 타임아웃 모두를 취소한다는 설명.
- 원인: `packages/winglet/common-utils/src/utils/promise/withTimeout.ts:425`의 `addEventListener('abort')`는 이미 중단된 신호에서 다시 발생하지 않는데, 내부 컨트롤러의 신호를 미리 확인하는 코드가 없습니다.
- 재현: 테스트 "an already-aborted signal rejects with AbortError instead of waiting for TimeoutError". 실제로는 300밀리초 뒤 `TimeoutError`가 납니다.
- 확신도: 높음.

## 4. `clone`이 박싱된 원시값과 `AggregateError`를 망가진 사본으로 만듭니다

- 심각도: 중간에서 낮음. 잘못된 값이 만들어지고, 사본을 쓰면 예외가 납니다.
- 영향받는 공개 API: `clone` (`@winglet/common-utils`와 그 `object` 하위 경로).
- 증상:
  - `clone(new Number(5)).valueOf()`가 "Number.prototype.valueOf requires that 'this' be a Number"를 던집니다. `String`과 `Boolean` 박스도 같습니다.
  - `clone(new AggregateError([e], 'boom'))`의 `message`는 `''`이고, `errors`는 메시지의 글자들로 바뀝니다.
- 어긋난 계약: JSDoc은 프로토타입 체인을 유지하는 폭넓은 타입 지원과 "같은 구조와 값을 가진 새 깊은 사본"을 약속합니다.
- 원인:
  - `packages/winglet/common-utils/src/utils/filter/isCloneable.ts:35`, `:43`, `:47`이 `BOOLEAN_TAG`, `NUMBER_TAG`, `STRING_TAG`를 복제 가능으로 표시하고, `packages/winglet/common-utils/src/utils/object/clone.ts:350`이 이를 내부 값 슬롯이 없는 `Object.create(proto)`로 만듭니다.
  - `clone.ts:339`가 항상 `new value.constructor(value.message)`를 호출하는데, `AggregateError`의 인자 순서는 `(errors, message)`입니다.
- 재현: 테스트 "boxed Number clone keeps its primitive value", "AggregateError clone keeps message and errors".
- 확신도: 높음.

## 5. `clone`이 자기 데이터 속성을 상속된 setter를 거쳐 기록합니다

- 심각도: 낮음. 자기 필드가 프로토타입의 접근자를 가리는 인스턴스가 필요합니다. define 의미론의 클래스 필드가 정확히 이런 모양을 만듭니다.
- 영향받는 공개 API: `clone`.
- 원인: `clone.ts:385`가 `Object.create(proto)`로 만든 객체에 `target[k] = cloned`로 대입하므로, 자기 속성을 정의하는 대신 상속된 setter가 실행됩니다.
- 재현: 테스트 "class instance whose own field shadows an inherited setter keeps the field". 원본은 5인데 사본은 10을 읽습니다.
- 확신도: 동작이 일어난다는 점은 높음. 드문 경우입니다.

## 6. `stableEquals`가 오른쪽의 상속 키를 왼쪽의 자기 키와 맞는다고 받아들입니다

- 심각도: 낮음.
- 예: `stableEquals({ constructor: Object, x: 1 }, { x: 1, y: 2 })`가 `true`를 반환합니다. 키 개수가 같고, `'constructor'`가 프로토타입 체인에서 발견되며, 오른쪽의 자기 키 `y`는 확인되지 않습니다.
- 영향받는 공개 API: `stableEquals`.
- 어긋난 계약: `equals/DETAIL.md`는 `stableEquals`가 `Reflect.ownKeys`로 얻은 자기 키를 검사한다고 적고 있습니다.
- 원인: `packages/winglet/common-utils/src/utils/object/equals/utils/stableEquals.ts:439`가 상속 키까지 포함하는 `Reflect.has`를 씁니다. `equals`는 `hasOwnProperty`를 올바르게 씁니다.
- 재현: 테스트 "a key only inherited on the right does not satisfy an own key on the left".
- 확신도: 높음.

## 7. `debounce`의 leading 호출이 예외를 던지면 trailing에서 한 번 더 실행됩니다

- 심각도: 낮음.
- 영향받는 공개 API: `debounce`의 `leading: true, trailing: true` 조합.
- 원인: `FunctionContext.ts:131`에서 `fn`이 예외를 던지면 `__clearContext__`가 건너뛰어져 인자가 남고, trailing 타이머가 같은 인자로 `fn`을 다시 실행합니다.
- 재현: 테스트 "leading call that throws is not re-run by the trailing edge". 실제 호출 2회, 기대 1회.
- 확신도: 높음.

## 버그가 아니라고 확인한 가설

- `merge`는 옵션 유무와 관계없이 파싱된 JSON의 `__proto__`와 `constructor.prototype`으로 오염되지 않습니다.
- `merge`의 `immutable: true`는 얼린 중첩 입력을 바꾸지 않고 올바른 결과를 냅니다.
- `merge`의 `arrayStrategy: 'replace'`, `preserveReferences`, `isAtomic`은 `merge/DETAIL.md`와 일치합니다. `immutable`에서 한쪽에만 있는 자식을 공유하는 것도 문서에 적혀 있습니다.
- `clone`의 자기 `__proto__` 키 처리와 `cloneLite`의 null 프로토타입 유지는 changeset대로 구현되어 있습니다.
- `EMPTY_ARRAY`와 `EMPTY_OBJECT`는 얼려져 있고 읽기 전용 타입입니다.
- `isArray`의 읽기 전용 오버로드는 런타임이 여전히 `Array.isArray`입니다. 타입은 읽어서만 확인했고 별도 타입 검사는 실행하지 않았습니다.
- `stableEquals`의 방문 쌍 메모(순환 추적)는 모든 `false`가 즉시 끝나므로 안전합니다.
- `MessageChannelScheduler`의 `cancelAll`, 재예약, 배치 안 재진입은 작업을 두 번 실행하지 않습니다.
- `waitAndReturn`과 `delay`는 이미 중단된 신호, 대기 중 중단, 리스너 정리를 모두 올바르게 처리합니다.
- `throttle`에서 창 끝의 trailing 실행 직후 다음 창의 leading 실행이 이어지는 것은 문서의 창 정의로 허용되는 범위라 애매하다고 보고 보고하지 않았습니다.
