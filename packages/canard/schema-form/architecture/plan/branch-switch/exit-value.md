# 나감 시점의 값 — 선언 키 `controls.inactiveValue`와 동기 훅 `node.onInactive` (B12, 462라운드)

## 자리

B11(`detached-references.md`)이 떼어진 참조의 쓰기를 무효로 만들자 소유자가 "FieldInput의 useEffect cleanup에서 자기 노드에 쓰는 방법은 아예 안 되겠네"를 확인했고, 비활성화 과정에서 매크로태스크 하나만큼 쓰기 창을 여는 안을 물었다. 코디네이터는 React의 cleanup 시점이 매크로태스크 경계와 맞물린다는 보장이 없고(자동 배칭·transition·Suspense에 따라 같은 태스크에도, 몇 태스크 뒤에도 돈다) 유예창 안의 쓰기는 방금 뗀 쓰기 주소 장치를 타이머로 되살리는 것이라 기각하고, 대신 둘을 제안했다: 나갈 때 값을 선언으로 정하는 `controls` 키 하나와, 나가기 직전에 동기로 불리는 노드 콜백 하나. 소유자의 결정은 "둘다 진행해줘. 내가 가끔 겪는 요구사항이야. 제안된 방법 두개면 납득 가능하고, 지금처럼 라이프사이클 오류가 발생하는것도 수용 가능해"였고, 리뷰에서 이름을 `inactive` 어휘로 통일하게 했으며("일치된 이름을 쓰도록 해"), 문자열 노드에서 식과 리터럴을 가를 수 없음을 짚어 `injectTo`처럼 함수형으로 가게 했고, 마지막으로 "inactiveValue 랑 onInactive 가 동일한 함수 인터페이스를 쓰도록 해. 그거면 난 이견 없어"로 닫았다(`../../reviews/round-462-owner-answers.md`). 이 문서는 설계 Ⅱ의 보강이며 B11 병합 머리 위에서 한 PR로 한다.

## 문제

- **요구.** 값을 지우지 않고 나가는 분기(`unsetOnInactive`가 거짓)에서, 나가는 순간 보존값을 특정 값으로 바꾸고 싶다. 이전 판은 비활성 노드가 살아 있어 cleanup에서 쓰면 됐다. 새 판은 cleanup이 돌 때 노드가 이미 떼어져 있다(정착 → 방출 → 재렌더 → 언마운트).
- **제약.** 정착 중 쓰기를 막는 가드는 없다(`assertNotInDelivery`는 오류 관찰자 중에만, `refuseListenerFeedback`은 리스너 중에만). 정착 안에서 소비자 코드를 부르면서 쓰기를 허용하면 중첩 정착이 열린다. 소비자 코드는 값을 돌려주기만 해야 한다.
- **기존 통로.** 나가는 서브트리의 보존값은 `retainExitedSlot`이 만드는 exit overlay에 있고(`host.inactiveSlotOverlays`), 임의 JSON을 경로에 넣는 헬퍼가 있다(`writeSlotPath`, `createSlotValueOverlay`). `retainExitedSlot`은 overlay를 새로 덮어쓰므로 보존값 주입은 그 뒤여야 한다. `controls.injectTo`는 식 문자열이 아니라 함수 `(value, context) => …`이며 `InjectToContext`(`dataPath`, `schemaPath`, `jsonSchema`, `parentValue`, `parentJSONSchema`, `rootValue`, `rootJSONSchema`, `context`)를 받는다. 직전 커밋의 `emit`과 `context`는 `previousEmit` 스냅샷으로 정착 중에 읽을 수 있고 `finalizeExits`가 이미 떼어진 읽기의 고정에 쓴다.

## 명제

**나갈 때의 보존값은 한 함수 인터페이스로 정한다.** `InactiveValueResolver = (value, context) => unknown`. 스키마의 `controls.inactiveValue`는 리터럴이거나 이 함수이고, 노드의 `onInactive(listener)`는 이 함수를 등록한다. 둘 다 서브트리가 떼어지기 직전에 직전 커밋 스냅샷으로 동기 호출되며 쓰기를 하지 않는다. 결과는 exit overlay에 경로 JSON으로 적혀 `inactiveValues`로 보이고 재진입 복제에 적용된다(B11 규칙 2). 떼어진 참조의 규칙(B11)은 그대로다.

## 규칙

1. **인터페이스 하나.** `(value, context) => unknown`. `value`는 그 노드의 직전 커밋 값(떼어진 읽기가 고정되는 그 스냅샷). `context`는 `InjectToContext`와 같은 묶음이되 모두 직전 커밋 스냅샷에서 읽는다(`dataPath`, `schemaPath`, `jsonSchema`, `parentValue`, `parentJSONSchema`, `rootValue`, `rootJSONSchema`, 폼 `context`). 반환값이 보존값이고 `undefined`는 "바꾸지 않음"이다. 식 문자열은 쓰지 않는다(문자열 노드에서 식과 리터럴을 가를 수 없음). 의존 추적은 없다(`injectTo`와 같음): 나갈 때 한 번만 실행된다.
2. **`controls.inactiveValue`.** 함수가 아니면 리터럴(문자열·숫자·불리언·`null`·객체·배열 그대로), 함수면 규칙 1의 함수. 허용 위치는 `unsetOnInactive`와 같다(노드·`fields[].controls`·조각의 controls; 층 우선순위 node → fields → fragment, 가장 가까운 선언 층 하나). 닫힌 키 목록에 더해지고(`CONTROL_KEYS`, 조각 허용 목록 "앞의 9개"가 10개로), 식 컴파일 목록(`EXPRESSION_CONTROL_KEYS`)에는 들어가지 않는다.
3. **`node.onInactive(listener): () => void`.** `subscribe`와 나란한 공개 멤버. `listener`는 규칙 1의 함수. 등록은 인스턴스에 묶인다: 재진입의 새 인스턴스에는 다시 등록한다(NODE-044). 해제 함수는 `subscribe`와 같은 모양. 저장은 `runtime.listeners`와 같은 Map 모양(노드 → Set)으로 하고 등록이 없는 노드는 비용이 없다. 한 노드에 여러 콜백이 있으면 등록 순서대로 모두 호출하고 마지막 `undefined`가 아닌 결과를 보존값으로 삼는다(나중 등록이 더 구체적); 어느 콜백이든 던지면 그 노드의 override 전체를 취소해 원래 보존값을 유지하고 정착 실패로 기록한다.
4. **쓰기 금지와 예외.** 두 함수 안에서 `setValue`·배열 동사·`batch`·`resetSubtree`가 불리면 개발 모드에서 `FormWarningCode` 멤버 하나(`WriteInInactiveResolver`에 준하는 이름, 형제 규칙대로)로 경고하고 무시한다(중첩 정착을 열지 않는다; 운영 번들은 무시만). 함수가 던지면 정착을 깨지 않고 `recordSettlementFailure`로 기록하며 보존값은 그대로다.
5. **언제.** 게이트 나감(엔트리가 비활성이 되어 슬롯에 보존될 때)에만. 폼 언마운트·`dispose`, 배열 아이템 삭제, 재진입 때 소멸하는 옛 인스턴스에는 불리지 않는다. `unsetOnInactive`가 참이라 보존값이 없는 나감에는 둘 다 적용되지 않고, 같은 층에 `inactiveValue`와 참인 `unsetOnInactive`가 함께 있으면 청사진 단계에서 경고 코드 하나. 두 함수는 자동 쓰기가 억제되지 않은 정상 보존 나감에서만 실행한다: `disableAutomaticWrites`나 실패·예산으로 자동 쓰기가 억제된 정착에서는 `unsetOnInactive`와 같은 정책으로 억제해 보존값을 그대로 두고, load·reset 범위와 던진 게이트 나감, 들어오기만 한 엔트리의 나감은 기존 보존 적용 범위대로 제외한다.
6. **우선순위와 합성.** 같은 노드에 둘 다 있으면 `onInactive` 콜백 가운데 하나라도 `undefined`가 아닌 값을 돌려줄 때 그 값이 보존값이고 `inactiveValue`는 실행하지 않는다(컴포넌트가 더 구체적); 콜백이 없거나 모두 `undefined`를 돌려주면 `inactiveValue`를 적용하고(리터럴은 그 값, 함수는 한 번 호출), 그것도 `undefined`면 기존 보존값을 유지한다. 나감을 일으킨 쓰기 자체가 그 서브트리의 값을 경로 JSON으로 명시했으면(규칙 2의 비활성 경로 쓰기) 그 명시값이 이기고 두 함수는 그 나감에서 실행하지 않는다(같은 쓰기의 명시값은 더 구체적인 의도이고 resolver는 나감 때의 기본 규칙; 463라운드 코디네이터 결정). 명시 여부는 쓰기의 JSON이 그 경로를 덮는지로 본다: 조상을 whole(교체)로 명시한 입력은 자손 전체를 덮어 자손의 함수도 실행하지 않고(생략된 자손은 그 쓰기로 `undefined`가 명시된 것), 병합 옵션의 쓰기는 실제로 있는 키만 덮으며, 나가는 서브트리 자체가 쓰기에 없으면 함수가 실행된다. 덮임은 한 배치 전체의 합집합이다: 같은 배치에서 그 서브트리를 whole로 한 번이라도 썼으면 자손 전체가 명시된 것이고, 뒤따르는 빈 merge나 부분 merge는 덮임을 거두지 않고 자기 키만 더한다. 조상과 자손이 함께 나갈 때는 각자 자기 서브트리 값을 정하고 자손의 결과가 조상의 결과 안의 그 경로를 덮는다(더 구체적인 경로 우선; 적용 순서는 조상 먼저). 결과 값은 B11 규칙 2의 JSON 쓰기와 같은 규칙으로 overlay에 풀린다(노드 생성 없음, 규칙 평가 없음, 방출 없음, 선언에 없는 키는 extras, 형이 맞지 않는 값은 misfit 경고와 함께 보존).
7. **삽입 지점.** `finalizeExits`에서 `retainExitedSlot` 뒤, `finalizeRestoredSlotRaw` 전. 보존값이 정해지면 `writeSlotPath`(whole, replace)로 호스트 overlay에 적는다. `inactiveValue` 선언도 등록 콜백도 없는 나감은 속성 검사 둘로 끝난다.

## 하지 않는 것

- 매크로태스크 유예창(시점 비보장, 장치 재도입). 함수 안의 쓰기(중첩 정착). `subscribe` 이벤트 비트로 넣는 것(이벤트는 커밋 뒤 배달이라 시점이 다르고 `WriteInObserver` 규칙과 섞인다). 식 문자열 형태(문자열 리터럴과 구분 불가). 나가는 순간이 아닌 살아 있는 커밋마다의 평가(함수형은 의존을 선언하지 않는다). 폼 전체 수명 훅.

## 비용

- `inactiveValue`: 그 키를 쓴 선언이 나갈 때만 함수 호출 한 번(리터럴이면 호출 없음)과 `writeSlotPath` 한 번. 키가 없는 스키마는 나감마다 속성 검사 하나.
- `onInactive`: 등록이 있는 노드에만 Set 하나, 나가는 서브트리 방문에서 Map 조회 하나. 등록이 없으면 변화 없음.
- 공개 선언: `FieldNode.onInactive` 멤버 하나, 형 셋(`InactiveValue<V> = V | InactiveValueResolver<V>`, `InactiveValueResolver<V> = (value: V, context: InactiveValueContext) => V | undefined`, `InactiveValueContext`; 키 이름은 값이 본질이고 함수는 계산 변형이라 `inactiveValue`를 유지하며 `setValue(value | updater)`가 같은 이중 모양의 선례다), `controls.inactiveValue` 키 하나, `FormWarningCode` 멤버 둘(함수 중 쓰기, `inactiveValue`와 참인 `unsetOnInactive`의 동거). 릴리스 전이라 선언 차분 0 관문은 적용하지 않되 차분을 기록한다.

## 지키는 것

- B11 규칙 1~5, NODE-044, VALUE-031 ㅁ, SETTLE-044·GOAL-029, 같은 값은 같은 참조, 배달 비교(새 장면을 더하되 기존 관측점 차이 0), 460C-07의 검증 스케줄과 무결함, 461C-04의 창 규칙.

## 검증(PR 관문)

- 수정 전에 실패하는 시험: (a) `inactiveValue` 리터럴(문자열·`false`·`0`·`null`·객체)이 나갈 때 보존값이 되어 `inactiveValues`에 보이고 재진입 값이 그것이다; 함수형은 직전 커밋의 `value`·`context`를 받고 반환값이 보존값이다; `undefined` 반환은 바꾸지 않는다; (b) `onInactive` 콜백이 떼기 직전에 한 번 불리고 같은 인자를 받으며 반환값이 재진입 값이다; 해제 뒤에는 불리지 않는다; 재진입의 새 인스턴스에는 불리지 않는다(재등록 필요); 함수 중 `setValue`·배열 동사·`batch`·`resetSubtree`는 무시와 개발 경고(운영 번들 무경고); 함수 예외는 정착을 깨지 않고 보존값 유지와 실패 기록; (c) 우선순위(콜백 > 키, 자손 경로 > 조상 결과); (d) 폼 언마운트·아이템 삭제·소멸 인스턴스에 불리지 않음; (e) `unsetOnInactive` 참과의 동거 경고; 조각 controls에서 열 번째 키 허용, 식 컴파일 목록에 없음; (f) 공개 이름 개수 시험 갱신, 원장 코드 시험(ERROR-164) 기대값에 경고 멤버 둘 명시(원장 정본은 라운드 닫기에서 코디네이터).
- 배달 코퍼스: 두 길의 장면을 더하고(리터럴·함수·콜백·둘 다·조상과 자손·동거 경고) 기존 관측점은 단계 머리 대비 차이 0.
- 최종 머리에서 한 번: build·typecheck·lint·다섯 프로젝트·verify, 선언 차분 기록, 격리 시험, 첫 쓰기 파서 0.
- 창 하나(A = 병합 전 단계 머리, B = 최종 머리): 악화 없음(TEST-073 0, `switch-oneOf-80`·`switch-siblings-0` 장부 총합 A 폭 안, Node 힙 B 중앙값 ≤ A 최대); finalizeExits self는 기록하되 요구하지 않는다.
- 문서: 바뀐 fractal의 DETAIL이 코드보다 먼저, `docs/en/SPECIFICATION.md`·`docs/ko/SPECIFICATION.md`의 controls 절에 `inactiveValue`(`injectTo` 옆, 같은 함수 모양), 노드 절에 `onInactive`, 마이그레이션에 한 줄("cleanup에서 자기 노드에 쓰던 패턴은 `controls.inactiveValue` 또는 `node.onInactive`로 옮긴다; 둘은 같은 `(value, context) => next` 인터페이스다"). 독립 검토는 claude 검증 에이전트, 판정 파일을 PR 전에 가지에.

## 순서

B11 → B12(이 문서) → B9-0 재개 → B9-1 → B9-2 → B9-3 → B10 → 설계 Ⅳ 검토.
