# 17라운드 — 노드 구조 스웜 정련과 게이트

2026-09-25. 소유자 지시(원문): "구조가 바뀌는 만큼, behaviors/ 하위에 개별 "행위"들이 하나의 .ts 파일로 떨어질거같지 않은데, 이건 프렉탈이나 디렉토리로라도 묶어야 하지 않나 싶은데... 내부 보조함수 양이 좀 되지않나? 그리고 한가지 궁금한게, 상속 클래스에 의한 캐싱 비효율은 내가 생각을 못하긴 했는데... 이렇게 되면 SchemaNode 가 지나치게 비대해질 위험은 없을까? 이것도 수렴 검토에 의한 결과일거같긴 하다만" 뒤이어 "그리고 4번 답변 받고 이것도 한번 그럼 정련을 하고 확정하자." 그리고 `tree`의 이름에 대해 "좋아, 책임별로 나누는 걸로 가자. 이름은 제안을 좀 받아볼게."

17라운드 소유자 답(`reviews/round-17-owner-answers.md`의 "노드 구조 논의")이 확정한 뼈대(상속 없는 단일 클래스와 종류별 동작 행) 위에서 새 core의 배치, `behaviors/`의 모양, 공개 겉면의 비대화를 막는 규칙, 이름 후보를 스웜으로 정련한 기록이다. 4번(오류 채널) 스웜(`reviews/raw-round17-onerror.md`)과 병렬로 돌렸다. 원자료는 세션의 임시 파일이었으므로 여기에 문장으로 옮기고 JSON은 붙이지 않는다. 모든 판정은 코드와 문서의 읽기 전용 판독이며 시험, 빌드, 형 검사, 벤치는 돌리지 않았다. 스웜이 권고 이름으로 적은 자리는 이 기록에서 소유자가 고른 최종 이름(§8)으로 바꿔 적는다. 살아 있는 문서의 반영 자리는 `09-landing-and-test-strategy.md` §3과 `08-design-a-to-z.md` §4·§13·§17이다.

## 1. 스웜의 짜임

- **도출 셋.** 지도 도출은 오늘 코드의 단위마다 새 자리를 정했다. 이름 도출은 칸마다 후보를 냈다. 겉면 도출은 공개 멤버 목록과 비대화를 막는 규칙을 보았다.
- **반박 셋.** 도출마다 반박 하나를 붙였다. 지도 도출에는 공격 열일곱과 빠진 점 열, 이름 도출에는 공격 열다섯과 빠진 점 여덟, 겉면 도출에는 공격 열일곱과 빠진 점 일곱이 나왔다.
- **판정 하나.** 배치, 의존 순서, behaviors 규칙, 겉면 규칙, 멤버 목록, 오늘에서 새 자리로 가는 지도(53행), 이름 칸 열둘, 비용 근거, 소유자 물음 둘에 대한 답으로 모았다. 이름은 확정하지 않고 칸마다 후보와 권고만 냈다.
- **게이트 하나.** 조건부 통과였고 지적은 열일곱(N1–N17, 중간 여섯, 낮음 열하나)이다. 에이전트는 모두 여덟이다.
- **소유자 확정 사항(스웜 전).** 상속 없는 단일 클래스와 종류별 동작 행, 표 `BEHAVIORS`와 폴더 `behaviors/`, `kind` 필드 없음(노드가 행 `behavior`를 들고 `type`·`strategy`는 행에서 읽는 게터), 공개 `node.group` → `node.strategy`(값은 그대로, 가드 `isBranchNode`·`isTerminalNode`는 이름 유지), 09의 `tree`를 책임별로 나눔(레코드, 종류별 동작, 경로 탐색, 공개 겉면), `trim`의 자리(R17-3). 판정은 이것과 어긋나는 결론이 없다고 적었고 게이트도 같았다.

## 2. 최종 배치

경로는 `packages/canard/schema-form/src/core/` 기준이다. 이름은 §8의 소유자 선택을 반영했다.

```
src/core/
├─ blueprint/                 PR-1(09 §2.2 그대로). PR-5에 resolveArrayLimits를 옮겨 받음
├─ record/                    PR-2. 레코드
│   ├─ INTENT.md · DETAIL.md · index.ts
│   ├─ type.ts                SchemaNodeRecord(필드 계약), Behavior(행 계약),
│   │                         SchemaNodeFactory(생성 함수의 형), SchemaNodeRuntime(트리마다 하나인 런타임의 형)
│   └─ utils/                 이름·경로 갱신, 상호작용 상태 패치(shallowPatch를 옮김)
├─ behaviors/                 PR-2(잎 넷, 객체와 터미널 객체, 가상), PR-5(배열과 터미널 배열)
│   ├─ INTENT.md · DETAIL.md · index.ts · behaviors.ts(표 BEHAVIORS[type][strategy])
│   ├─ stringBehavior/ numberBehavior/ booleanBehavior/ nullBehavior/ virtualBehavior/
│   │                         각 INTENT.md · DETAIL.md · index.ts · 같은 이름의 행 파일.
│   │                         여덟 줄을 넘는 칸이 생길 때만 utils/
│   ├─ objectBehavior/ arrayBehavior/
│   │   ├─ branch/ · terminal/   전략마다 행 하나
│   │   └─ utils/<주제>/        두 전략이 함께 쓰는 것과 그 종류만의 보조
│   └─ utils/                 두 종류 이상이 쓰는 칸 함수와 투영 보조, 행 짓는 함수(칸 순서 고정)
├─ navigation/                PR-2. find·findNodes(경로 해석)와 depthFirstSearch·breadthFirstSearch(트리 걷기)
├─ settle/   settle/derive/   PR-2, PR-3(09 §2.2 그대로)
├─ validation/                PR-4
├─ dispatch/                  PR-4. 진입 사슬의 소유자. 공개 쓰기 동사마다 진입 함수 하나
├─ SchemaNode/                PR-2부터 PR-6까지 위임 줄이 늘어남. 공개 겉면
│   ├─ INTENT.md · DETAIL.md · index.ts
│   ├─ SchemaNode.ts          단일 클래스 SchemaNode. 필드·게터·문장 하나짜리 위임만
│   ├─ type.ts                판별 합집합 인터페이스와 InferSchemaNode
│   └─ utils/                 guards/(가드 아홉, 가드마다 파일 하나), schemaNodeFactory(행 고르기와 생성), 트리 생성
└─ types/                     기존 organ. event.ts·state.ts·value.ts는 남는다
```

- **노드 인스턴스가 곧 레코드다.** 레코드를 별도 객체로 두면 노드마다 객체가 둘이 된다. `record/`는 계약(인터페이스)과 필드 수준 함수만 들고, 공개 겉면의 클래스가 필드를 고정 순서로 선언하고 `SchemaNodeRecord`를 구현한다.
- **행 계약 `Behavior`는 `record/`에 둔다.** `behaviors/`에 두면 레코드와 behaviors 사이에 타입 가져오기 고리가 생긴다.
- **청사진은 `type`과 `strategy`만 낸다.** 노드는 생성 때 `BEHAVIORS[type][strategy]`에서 고른 행 하나를 필드 `behavior`로 든다. 표는 두 단계다. 잎은 `terminal` 하나, 객체·배열은 `branch`·`terminal` 둘, 가상은 하나다.
- **행은 계산만 한다.** 자식 구성 칸 `declareChildren`은 자식 선언 목록만 돌려준다. 자식의 생성은 `settle`이 런타임의 `nodeFactory`로 하고 연결도 `settle`이 확정한다. 그래서 종류 모듈은 생성 함수를 알 필요가 없다. 모듈 수준 생성 함수 `schemaNodeFactory`(행 고르기와 클래스 생성)는 공개 겉면이 두고, 트리를 만들 때 런타임의 `nodeFactory` 칸에 넣는다.
- **노드 필드 `runtime`은 트리마다 하나인 `SchemaNodeRuntime`을 가리킨다.** 통지 대기열, 검증기, 진단, 진입 깊이와 예산, `nodeFactory`, `onError` 보고기가 여기에 있다. 한 트리의 모든 노드가 같은 런타임 하나를 가리킨다.
- **`navigation/`은 경로 해석과 트리 걷기를 함께 든다.** 오늘 traversal의 소비자는 `AbstractNode.ts` 한 곳이고, 새 소비자로 `settle`과 `dispatch`가 예상된다.
- **`resolveArrayLimits`는 `blueprint/`로 간다.** 스키마만 읽는 순수 함수이고 소비자가 `settle`의 메모와 겉면의 `minItems`·`maxItems` 게터로 behaviors 밖에 있다.
- **비교한 모양.** 종류마다 fractal(채택), behaviors만 fractal로 두고 종류 디렉토리를 organ으로 두는 안(filid 경계 §4 때문에 한 층이 더 들고 종류의 계약이 한 문서에 몰림), 작은 종류만 파일 하나로 두는 안(한 층에 파일과 디렉토리가 섞이고 종류가 자라면 옮겨야 함)을 비교했다. 채택안의 대가는 behaviors와 종류 모듈의 문서이며, 그래서 종류의 INTENT.md에는 공통 계약을 되풀이하지 않고 그 종류만의 차이만 적는다. 가장 깊은 경로(`src/core/behaviors/objectBehavior/utils/<주제>/<파일>`)도 filid 설정의 깊이 한도(`.filid/config.json`의 maxDepth 14) 안이다.
- **버린 기준.** 정련안은 옛 이름(`nodes`, `parsers`, `types`, `__tests__`)과 겹치거나 한 글자만 다른 이름을 쓰지 않는다는 기준을 두었다. 소유자가 "코드상 공존기간은 없어. 버전만 병행하는거지"라고 답했으므로 이 기준은 버렸다. 전환은 PR마다 대상 영역의 옛 코드를 레거시 디렉토리로 옮기고 새 코드를 쓰는 방식이며, 옛 이름과의 중복은 기준이 아니다(레거시 디렉토리의 이름과 자리는 18라운드 안건).

## 3. 의존 순서

가져오는 쪽에서 가져와지는 쪽으로 적는다.

- `record/` → `blueprint/`(청사진 항목 타입), `core/types`(열거형).
- behaviors의 종류 모듈 → `record/`, `blueprint/`, `behaviors/utils`. 종류 모듈은 behaviors 뿌리(`BEHAVIORS`), `settle`, `dispatch`, `validation`, 공개 겉면을 가져오지 않는다.
- behaviors 뿌리 → 종류 모듈의 진입점.
- `navigation/` → `record/`.
- `settle/` → `record/`, `blueprint/`, `navigation/`, `core/types`. behaviors는 가져오지 않고 `node.behavior`의 칸을 부른다. `settle/derive`는 `settle` 뿌리를 가져오지 않는다.
- `validation/` → `record/`, `blueprint/`, `core/types`. 비동기 검증 결과는 `dispatch`가 요청할 때 넘긴 콜백으로 배달하므로 `validation` → `dispatch` 간선은 없다.
- `dispatch/` → `record/`, `navigation/`, `settle/`, `validation/`, `core/types`. 진입 사슬(쓰기, 커밋, 통지, 검증 요청, `onChange`, 기록마다 `onError`, 사슬 끝 throw)의 소유자다.
- `SchemaNode/` → 위 모두와 behaviors. 행 고르기와 클래스 생성을 함께 아는 유일한 자리다.
- `core/index.ts`(PR-7)와 `nodeFromJSONSchema` → 공개 겉면의 진입점만. React 바인딩 → `core/index.ts`만(게이트 N1).

전순서는 `blueprint` < `record` < {behaviors 종류 모듈, `navigation`} < `settle/derive` < `settle` < `validation` < `dispatch` < `SchemaNode`이다(게이트 N11이 `settle(< derive)` 표기를 바로잡음). 조건은 셋이다. `Behavior`·`SchemaNodeFactory`·`SchemaNodeRuntime` 계약은 `record/`에 둔다. 청사진은 키가 아니라 `type`·`strategy`만 낸다. 생성은 런타임의 `nodeFactory`로 주입한다. 게이트 N5가 짚은 넷째 조건(런타임 형의 칸 타입이 `dispatch`·`validation`의 타입을 가져오면 생기는 타입 고리를 의존 역전으로 끊는 것)은 결정하지 않고 18라운드 안건으로 넘겼다.

PR 순서: PR-1 blueprint. PR-2 `record/`, behaviors(잎 넷, 객체와 터미널 객체, 가상), `navigation/`, `settle/`, 공개 겉면(식별·값 게터, `active` 게터, `find`·`findNodes`, 가드, 생성. `setValue`는 `dispatch`가 생기기 전까지 `settle`의 쓰기로 직접 위임). PR-3 `settle/derive`. PR-4 `dispatch`와 `validation`(겉면의 쓰기 위임을 `dispatch` 진입으로 바꿈). PR-5 배열과 터미널 배열의 행, `resolveArrayLimits`의 `blueprint/` 이동. PR-6 계산 게터(`visible`·`enabled`·`readOnly`·`disabled`). PR-7 전환. 터미널 배열을 PR-5에 두는 것은 배열과 투영 보조를 함께 쓰기 때문이다(17라운드 스웜 수렴(편집자 결정)).

## 4. 오늘에서 새 자리로 — 지도의 요지

판정의 지도는 53행이다. 여기에는 자리가 바뀌는 큰 단위만 옮긴다. 경로는 `src/core/nodes/` 기준이다.

| 오늘 | 새 자리 |
| --- | --- |
| `AbstractNode` 필드(`group`, `type`, `schemaType`, `jsonSchema`, `required`, `nullable`, `depth`, `isRoot`, `rootNode`, `parentNode`) | `record/`의 필드 계약과 공개 겉면의 게터. `group`은 게터 `strategy`(`behavior.strategy`), `type`은 게터 `type`(`behavior.type`) |
| `scope`, `variant`, `oneOfIndex`, `anyOfIndices`, `initialized` | 공개 겉면에서 빠짐. 오늘 탐색이 `variant`에 기대는 점은 18라운드 안건 N2 |
| `find`·`findAll`과 `AbstractNode/utils/findNode` | `navigation/`으로 옮겨 고침. 노드 메서드 `findAll`은 `findNodes`로. `cursor.group`은 `strategy`로. 터미널 아래 경로는 노드 없음. `subnodes`·`variant` 의존의 처리는 18라운드 안건 N2 |
| `AbstractNode/utils/traversal` | `navigation/`(진입점이 이름으로 내보냄) |
| `AbstractNode/utils/shallowPatch` | `record/utils`. 소비자는 `dispatch`(`setState`, reset의 상호작용 비움)와 `settle/derive`(`controls.resetInteraction`) 둘이며, 레코드 필드 `state`의 불변식을 지키는 함수이므로 레코드에 둔다(게이트 N17) |
| `value`·`setValue`·`applyValue`·`__equals__` | `value` 게터는 레코드 `local`, `setValue`는 `dispatch` 진입, `applyValue`는 행 칸 `interpret`, `__equals__`는 행의 값 동등 칸. `value` 세터는 빼기를 권고 |
| `normalizedValue`와 `onChange` 위로 전파 | `outputValue` 게터(레코드 `emit`)와 `settle` |
| 계산 속성과 의존 구독 | `settle`의 계산 끝(PR-6, `active`는 PR-2)과 `settle/derive`(PR-3) |
| `EventCascadeManager`, `ValidationManager`·`ValidationErrorManager` | `dispatch`, `validation`(다시 씀). 노드마다의 매니저와 클로저는 없어진다 |
| enhancer, `InjectionGuardManager`, 조건 사전 무리, `core/parsers` | 폐기 |
| 식 컴파일러(`createDynamicFunction` 무리) | `blueprint/`(PR-1, 통째로 옮김) |
| `getNodeGroup` | `blueprint/`의 터미널 전략(`options.terminal`, 렌더 계층 판정, `type` 순). 결과가 공개 `strategy`가 된다. 행이 없는 조합(`getNodeGroup.ts:20-21`)은 18라운드 안건 N14 |
| 오늘의 `schemaNodeFactory` | 타입별 생성 분기는 `SchemaNode/utils`의 `schemaNodeFactory`(행 고르기와 생성)로, `$ref` 지연과 `allOf` 조각은 `blueprint/`로 |
| `StringNode` | `behaviors/stringBehavior`. 빈 문자열 생략은 `project` 칸의 비트 분기, `trim` 구독(`StringNode.ts:118-122`)은 `finishInput` 칸 |
| `NumberNode`, `BooleanNode`, `NullNode` | `numberBehavior`, `booleanBehavior`, `nullBehavior`. 파서는 폐기 |
| `ObjectNode`와 두 전략 | `objectBehavior/branch/`(입력 해석은 자식 분배, 합성은 키 순서), `objectBehavior/terminal/`(PR-2). 합성 분기 분석과 조각 표는 `blueprint/`, 게이트·활성 집합은 `settle`, 자식 만들기는 `declareChildren`의 선언과 `settle`의 생성 |
| `ObjectNode/utils/omitEmptyObject` | `objectBehavior/utils`(이름과 시험을 그대로). 두 전략이 함께 쓰므로 그 종류의 `utils/`다 |
| `ArrayNode`와 두 전략, `ArrayNode/utils` | `arrayBehavior/branch/`·`arrayBehavior/terminal/`(PR-5). `omitTrailingArray`·`omitEmptyArray`는 `arrayBehavior/utils`, `resolveArrayValueFilter`는 `project` 칸의 비트 분기로 다시 씀, `resolveArrayLimits`는 `blueprint/`, `ArrayNode/validate.ts`는 `blueprint/`(청사진 오류) |
| `VirtualNode` | `behaviors/virtualBehavior`. `raw`·`emit`이 없고 `assemble`이 참조 노드 값의 튜플을 `local`에 둔다(`value` 게터는 `local`). 방출·가드·검증에는 나타나지 않는다. `strategy`는 `'branch'`(게이트 N16) |
| `ContextNode`와 `contextNodeFactory` | 대기. 08 §4의 노드 종류에 없고 오늘 `type`이 `'object'`다(`ContextNode.ts:12-13`). 18라운드 안건 |
| `isSchemaNode`, `isBranchNode`·`isTerminalNode`, 종류별 가드 | `SchemaNode/utils/guards`(가드마다 파일 하나). `isSchemaNode`는 단일 클래스 `instanceof`. `isTerminalNode`의 좁히기를 바로잡는다(오늘 잎 넷으로 좁히지만 터미널 객체·배열도 `'terminal'`, `src/core/nodes/filter.ts:195-198`). `isNullNode`는 쓰는 곳이 없어 옮기지 않는다(게이트 N13) |
| `core/types`의 `node.ts`·`constructor.ts` | 공개 합집합은 `SchemaNode/type.ts`에 새로 쓰고, `constructor.ts`의 후계는 `SchemaNodeFactory`의 입력이다 |
| 어댑터의 흐림 처리(`SchemaNodeInput.tsx:78-85`) | `node.publish(Blurred)`는 타입을 모르는 입력 마침 신호 `finishInput`으로 바뀐다. `touched` 지연 설정은 어댑터에 남는다 |
| `node.group`의 바깥 소비자 다섯(`FormGroupRenderer.tsx:18`, antd5·antd6·antd-mobile·mui의 `FormGroup.tsx`) | `node.strategy`(PR-7 이주) |
| 시험(`src/core/nodes`·`parsers`의 `__tests__`, `src/core/__tests__`) | 09 §4.3의 처분을 따른다. 옮기는 단위(`findNode`, traversal, `shallowPatch`, `omitEmptyObject`, 배열 투영 보조, 식 컴파일러)의 시험은 새 자리로 함께 옮긴다 |

## 5. behaviors 규칙

1. **종류마다 fractal 하나.** 디렉토리 하나에 INTENT.md, DETAIL.md, index.ts, 같은 이름의 행 파일을 두며, 디렉토리·파일·내보내는 행 상수가 같은 이름이다(`stringBehavior/stringBehavior.ts` → `stringBehavior`). 잎도 같은 틀을 쓴다. 객체와 배열은 안에 `branch/`·`terminal/`·`utils/`를 둔다(17라운드 소유자 답: "결국 object 행동인건 동일하고, 전략만 다른거니까").
2. **여덟 줄을 넘는 칸과 그 종류만의 보조는 그 종류의 `utils/`.** 행 파일은 행 객체 하나만 내보낸다. 여덟 줄 이하의 칸 본문은 행 안에 둔다. 이 계산법은 `behaviors/DETAIL.md`에 저장소 예산으로 선언한다.
3. **보조 함수의 자리는 실제 소비자로 정한다.** 두 전략이 함께 쓰는 것은 그 종류의 `utils/`, 두 종류 이상이 쓰는 것은 `behaviors/utils/`(가장 낮은 공통 fractal), behaviors 밖에서도 쓰면 behaviors의 것이 아니다(`resolveArrayLimits`는 `blueprint/`).
4. **옮기는 단위는 이름과 시험을 그대로 들고 간다.** `omitEmptyObject`, `omitTrailingArray`, `omitEmptyArray`가 그렇다. `resolveArrayValueFilter`는 조건에 따라 새 클로저를 돌려주는 함수라 옮기지 않고 투영 칸 안의 비트 분기로 다시 쓴다.
5. **행은 칸을 모두 같은 순서로 갖는다.** `behaviors/utils`의 행 짓는 함수 하나가 기본 칸 위에 종류의 칸을 덮어 만들어 키 순서가 고정된다. 없는 동작은 공유 칸으로 채운다(비배열의 배열 연산은 `SchemaFormError`를 던지는 공유 함수, 입력 마침은 "쓰지 않음"을 돌려주는 공유 함수, 자식 구성은 공유 빈 결과). 모든 행의 키 순서가 같은지 시험으로 확인한다.
6. **뜻이 같은 칸은 함수 객체 하나를 여러 행이 함께 쓴다.** 값을 통째로 드는 잎 넷과 터미널 객체·배열의 입력 해석과 합성, 객체 두 전략의 값 동등이 그렇다.
7. **행은 계산만 한다.** 칸은 노드와 입력을 받아 값을 돌려준다. 원본 쓰기, 되돌림 기록, 자식 생성과 연결과 폐기의 확정, 통지는 `settle`과 `dispatch`가 한다. `declareChildren`은 선언 목록만, `finishInput`은 자른 값만 돌려주며 쓰기는 `dispatch`의 진입이 한다.
8. **옵션에서 나오는 정적 선택은 칸이 불릴 때마다 계산하지 않는다.** 빈 값 생략, 배열 뒤쪽 생략, `trim`, 배열 한계는 유효 스키마의 메모가 바뀔 때 `settle`이 `blueprint/`의 순수 함수로 한 번 계산해 메모와 함께 둔다.

행의 칸은 `interpret`(입력 해석), `assemble`(합성), `project`(투영), `finishInput`(입력 마침), `declareChildren`(자식 선언 목록만 돌려준다. 생성은 `settle`이 런타임의 `nodeFactory`로 한다. 행은 계산만 한다), `type`, `strategy`이다. 종류별 데이터 칸은 `structure`다. 정련안의 칸 목록에는 이 밖에 값 동등, 배열 구조 연산(`push`·`pop`·`update`·`remove`·`clear`, 공개 메서드와 같은 이름), 배열 길이 읽기가 있다. 칸을 하나 더하면 `record/`의 `Behavior`를 고쳐야 한다는 점(의존 역전의 대가)을 레코드 DETAIL.md에 적는다.

## 6. 겉면 규칙과 멤버 목록

**규칙.**

1. **필드·게터·문장 하나짜리 위임만.** 클래스 파일의 몸통은 필드 선언, 필드나 `this.behavior`의 상수를 돌려주는 게터, 다른 fractal의 이름 붙은 함수를 부르는 문장 하나짜리 메서드뿐이다. 생성자는 선언 순서대로 대입만 한다. 기계 검사는 그 파일에만 거는 ESLint 설정(멤버 본문은 문장 하나, 분기·반복·try·조건식 금지, 생성자는 대입문만)이며, 평면 설정에서 뒤의 `no-restricted-syntax`가 앞의 것을 대체하므로 저장소의 `#` 비공개 금지 선택자 둘(`eslint.config.mjs:115-127`)을 함께 다시 적는다.
2. **멤버 목록 시험.** 겉면 DETAIL.md의 멤버 목록과 프로토타입의 멤버 이름을 맞대는 시험을 둔다. 멤버를 더하면 시험이 붉어지고 08 §13에도 행을 더해야 한다. 내부 연산은 메서드가 아니라 레코드 위의 자유 함수로 둔다.
3. **종류 비교 금지.** 종류에 따른 분기는 공개 겉면, `settle`, `dispatch`, `validation`에 두지 않고 모두 `this.behavior`의 칸으로 보낸다. `.type`·`.strategy`와의 비교를 금하는 규칙을 걸고, 예외는 `utils/guards` 하나다.
4. **노드마다 할당 금지.** 생성자와 필드 초기화식에는 객체·배열 리터럴, 함수, `new`를 두지 않는다(오늘의 반례 `AbstractNode.ts:754`·`:860`). 빈 목록과 빈 상태는 공유 동결 상수로 둔다.
5. **필드 집합 고정.** 모든 필드를 선언 순서대로 생성자에서 넣고 나중에 새 속성을 더하지 않는다. 루트에만 필요한 상태는 `SchemaNodeRuntime` 하나에 두고 필드 `runtime`으로 가리킨다. 필드 `behavior`는 readonly이며, 개발 모드에서 행이 수명 동안 바뀌지 않음을 확인한다.
6. **공개 타입에는 레코드 필드와 `behavior`를 싣지 않는다.** 공개 읽기는 `type`과 `strategy` 게터뿐이며 공개 타입의 키 목록을 타입 시험으로 확인한다.
7. **여러 단계의 조율은 `dispatch`의 동사별 진입.** 공개 쓰기 동사마다 파일 하나를 둔다(`setValue`, `push`, `pop`, `update`, `remove`, `clear`, `setState`, `setExternalErrors`, `clearExternalErrors`, 입력 마침, `validate`, 로드인 reset. 마지막 둘은 게이트 N10). 동사와 파일의 1:1 대응이 `dispatch`가 무게 중심이 되는 것을 막는다.
8. **내부 통로는 클래스 멤버가 아니다.** 입력 마침 신호 `finishInput`과 입력 출처 표식 쓰기는 겉면 진입점이 바인딩 전용으로 이름을 붙여 내보낸다. `core/index.ts`는 이들을 이름으로 다시 내보내고(오늘 내부 `NodeEventType`·`SetValueOption`을 내보내는 것과 같은 방식), `src/index.ts`는 다시 내보내지 않으며 키 목록 시험은 `src/index.ts`에 건다(게이트 N1). core만 쓰는 호스트에 이 통로를 열지는 18라운드 안건이다.
9. **가드 아홉은 이름을 유지한다.** 여섯은 `type`을, `isBranchNode`·`isTerminalNode`는 `strategy`를 본다. `isSchemaNode`는 단일 클래스 `instanceof`다(`Symbol.for` 상표는 라이브러리 사본 둘이 서로의 노드를 참으로 판정하는 동작 변경이라 권하지 않음).
10. **이름 함정 경고.** 겉면 fractal의 INTENT.md 첫 줄에 `src/components/SchemaNode`(렌더 디렉토리), 공개 타입 `SchemaNode`(판별 합집합)와 이름이 같다는 경고를 둔다. 클래스 파일은 공개 합집합을 별칭으로 가져오고, 진입점은 클래스가 아니라 타입을 내보낸다.

**멤버 목록의 요지(게이트 N7·N9·N10·N15를 적용한 것).** 확정은 약 44개다. 식별·구조 게터 14(`type`, `strategy`, `schemaType`, `jsonSchema`, `required`, `nullable`, `depth`, `isRoot`, `rootNode`, `parentNode`, `name`, `escapedName`, `path`, `children`), 값 4(`value`, `outputValue`, `getInactiveValues`, `setValue`), 계산 상태 게터 6(`active`는 PR-2의 노드 게이트, `visible`·`enabled`·`readOnly`·`disabled`·`watchValues`는 PR-6), 상호작용 상태 2(`state`, `setState`), 검증·오류 4(`validate`는 `dispatch` 진입, `errors`, `setExternalErrors`, `clearExternalErrors`), 통지 2(`subscribe`, `revision`), 경로 2(`find`, `findNodes`), 루트 의미 2(`diagnostics`는 런타임, `batch`는 `dispatch`), 배열 8(`length`, `minItems`, `maxItems`, `push`, `pop`, `update`, `remove`, `clear`. 타입은 배열 인터페이스에만)이다. 설계 항목에 걸린 것은 0–14개다. `schemaPath`·`key`(에러 라우팅은 PR-4, React key와 구성 요소 캐시 키는 PR-7), `subnodes`, `context`, `defaultValue`, `resetSubtree`, 명령 넷(`focus`·`select`·`refresh`·`remount`, C-11), 루트 전용 넷(`globalState`·`setSubtreeState`·`clearSubtreeState`·`globalErrors`)이다. 그래서 멤버는 44–58개가 되며, 이 크기는 18라운드 안건이다. 빠지는 것은 `scope`·`variant`·`oneOfIndex`·`anyOfIndices`·`initialized`, `publish`(명령으로 바뀜), `setErrors`·`clearErrors`(`validation` 안으로), 공개 규약상 공개인 `__x__` 멤버 열여섯과 protected 셋이다.

## 7. 비용 근거(추정)

**코드에서 센 것.** 오늘 노드는 구체 클래스 여덟(String, Number, Boolean, Null, Object, Array, Virtual, Context)의 인스턴스다. 객체·배열 노드는 전략 객체를 하나 더 들고, 모든 노드가 필드 초기화식으로 `ValidationErrorManager`와 `EventCascadeManager`와 그 클로저를 만들며(`AbstractNode.ts:754`·`:860`), 객체는 `onChange` 클로저를, `trim`이 켜진 문자열은 구독 클로저를 만든다.

**구조로 확실한 것.** 노드마다 객체 하나다. 행은 종류와 전략마다 하나를 모든 노드가 공유하므로 프로세스 전체에 아홉뿐이다(잎 넷, 가상, 객체 둘, 배열 둘). 노드마다의 매니저·클로저·전략 객체·구독은 없으며 규칙과 린트로 금한다. 옵션에서 나오는 선택은 유효 스키마 메모마다 한 번만 계산한다.

**속도(추정, 확인 전).** 모든 노드가 한 클래스이고 필드를 같은 순서로 넣으면 한 숨은 클래스를 가지므로, 여러 종류를 도는 `settle`·`dispatch`의 필드 읽기가 단형 인라인 캐시로 남을 것이다. 오늘은 여덟 클래스라 섞인 종류를 보는 자리가 V8 기준 다형이나 거대형이 될 수 있으며, 소유자가 말한 "상속 클래스에 의한 캐싱 비효율"이 이것이다. 행 아홉이 칸을 같은 순서로 모두 가지면 `node.behavior.<칸>` 읽기도 단형이다. 칸 함수는 종류마다 달라 그 호출은 거대형이 되고 인라인되지 않으며 간접 호출 비용은 남는다. `type`이 필드에서 게터로 바뀌어 읽기가 한 단계 늘고, `raw` 필드에 문자열·숫자·객체가 섞이면 필드 표현이 한 번 일반화될 수 있다. iOS의 JavaScriptCore는 문턱이 V8과 달라 같은 결론이 보장되지 않는다.

**메모리(추정).** 필드가 24–30개이면 포인터 압축 엔진에서 노드 하나가 약 110–140바이트, 압축이 없는 엔진에서 약 210–260바이트다. 오늘 노드 인스턴스와 부속 객체의 합과 비교해야 한다.

**벤치로 확인할 것.** 섞인 종류 1만 노드에서 `value`·`type` 읽기 순회(옛·새, V8과 JavaScriptCore), 노드당 힙 바이트, 표현이 섞인 값을 넣은 뒤 인스턴스와 행이 같은 맵인지, 정착 뜨거운 루프의 거대형 자리 수, 입력에서 커밋까지의 지연, 노드 1만 개 생성 시간. 오늘의 주된 비용이 노드마다의 할당과 마이크로태스크 스케줄인지 인라인 캐시인지는 재지 않았으므로, 위의 속도 이득은 방향만 말할 수 있고 크기는 벤치가 정한다.

**소유자 물음 둘에 대한 답.** 첫째, 잎 넷은 행 파일 하나(15–60줄)로 끝나지만 객체와 배열은 한 파일에 담기지 않는다(각각 150–320줄, 4–8파일쯤, 추정). 그래서 종류마다 fractal 디렉토리를 두고 잎도 같은 틀을 쓴다. behaviors 전체는 약 45–55파일, 800–1,600줄로 오늘 같은 일을 하는 코드(약 4,000줄)보다 작다(추정). 둘째, `SchemaNode`는 공개 계약이 넓어 멤버가 약 44개(설계 항목이 정해지면 최대 58개)이지만 멤버마다 문장 하나다. 파일은 문서 주석을 한 줄씩 달면 250–350줄, 여러 줄로 달면 450–650줄로 본다(추정. 오늘 `AbstractNode.ts` 하나가 로직을 포함해 1,228줄이고 하위 클래스 여덟이 962줄을 더한다). 진짜 위험은 줄 수가 아니라 로직이 스며드는 것이어서 린트와 멤버 목록 시험으로 막는다.

## 8. 이름 표(칸 열다섯)

스웜이 칸 열둘의 후보를 냈고, 게이트 N3이 후보 없이 정해진 형 이름 셋을 짚어 칸 열다섯이 되었다. 소유자가 이견을 낸 칸은 넷째, 아홉째, 열째, 열두째, 열넷째, 열다섯째다. 이견이 없던 칸은 권고대로 확정이며, 형 이름은 이름 규칙을 따른다.

**이름 규칙(17라운드 소유자 답).** 넓은 범위의 이름(내보내는 형, 모듈 수준 함수, fractal 진입점의 이름)은 `SchemaNode` 접두를 쓴다. `Node`로 줄여 부르는 것은 한 형의 필드나 한 모듈 안의 지역 이름처럼 아주 좁은 이름공간에서만 한다(전역 `Node`와 헷갈리지 않게).

| 번호 | 칸 | 후보(권고가 먼저) | 소유자 답 | 최종 |
| --- | --- | --- | --- | --- |
| 1 | 레코드 fractal | `record`, `nodeRecord`, `records` | 이견 없음 | `record/` |
| 2 | 경로 탐색 fractal | `navigation`, `lookup`, `traversal` | 이견 없음 | `navigation/` |
| 3 | 공개 겉면 fractal과 클래스 | `SchemaNode/`와 클래스 `SchemaNode`, `surface/`와 클래스 `SchemaNode`, `SchemaNode/`와 클래스 `SchemaNodeImpl` | 이견 없음 | `SchemaNode/`, 클래스 `SchemaNode` |
| 4 | behaviors 아래 종류 모듈 | 종류마다 `stringBehavior/` 식의 아홉(터미널 객체·배열은 따로), 접미 없는 디렉토리, `objectTerminalBehavior/` 식 | "object behavior 내부에 terminal 이랑 branch 가 있는게 낫지않나 싶은데... 결국 object 행동인건 동일하고, 전략만 다른거니까." | `stringBehavior/`·`numberBehavior/`·`booleanBehavior/`·`nullBehavior/`·`virtualBehavior/`, `objectBehavior/`와 `arrayBehavior/` 안에 `branch/`·`terminal/`·`utils/`. 표는 `BEHAVIORS[type][strategy]` |
| 5 | 행 계약 형 | `Behavior`, `NodeBehavior`, `BehaviorRow` | 이견 없음 | `Behavior` |
| 6 | 칸: 입력 해석 | `interpret`, `applyInput`, `distribute` | 이견 없음 | `interpret` |
| 7 | 칸: 합성 | `assemble`, `compose`, `combine` | 이견 없음 | `assemble` |
| 8 | 칸: 투영 | `project`, `projectOutput` | 이견 없음 | `project` |
| 9 | 칸: 입력 마침과 바인딩 내부 통로 | `finishInput`, `endInput`, `completeInput` | 첫 답 "completeInput 이 더 끌림", 둘째 답 "이거 의미가 "사용자가 입력을 마쳤다" 라는 의미라면 finishInput 이 맞다", 셋째 확인 "통과." | `finishInput`(어댑터의 신호도 같은 이름) |
| 10 | 칸: 자식 구성 | `buildChildren`, `createChildren`, `declareChildren` | "declareChildren 은 어떤지? 미채택 이유가 있나?" | `declareChildren`. 칸은 노드를 만들지 않고 자식 선언 목록만 돌려준다 |
| 11 | 종류별 데이터 칸 | `structure`, `parts`, `branch` | 이견 없음 | `structure` |
| 12 | 모듈 수준 생성 함수 | `createNode`, `instantiateNode` | "nodeFactory 를 쓰지 않은 이유가 무엇인가? 구 명칭을 피하는 이유는?" 이어서 "코드상 공존기간은 없어" | `schemaNodeFactory`. 런타임 안의 필드처럼 좁은 이름공간에서만 `nodeFactory`. 공장은 트리마다 하나 |
| 13 | 레코드 형 | 게이트 N3의 안 `NodeRecord`, `SchemaNodeRecord` | 이름 규칙 | `SchemaNodeRecord` |
| 14 | 트리마다 하나인 공용 칸의 형 | 게이트 N3의 안 `TreeContext`, `TreeScope`, `RootContext` | "Runtime 쪽 이름이 더 끌린다", "FormRunetime 은 안되지, 우리 스키마 노드는 Form 인지 뭔지 모르잖아" | `SchemaNodeRuntime`(노드 필드 `runtime`) |
| 15 | 생성 함수의 형 | 게이트 N3의 안 `NodeFactory`, `CreateNode` | 열두째와 같은 답 | `SchemaNodeFactory` |

## 9. 게이트 열일곱의 처분

게이트 판정은 조건부 통과였다(통과 조건 N1–N6, N7–N17은 반영 전 함께 고치기를 권고). 17라운드 정리 명세 v3가 처분을 정했다.

| 지적 | 심각도 | 요지 | 처분 |
| --- | --- | --- | --- |
| N1 | 중간 | 내부 통로를 `core/index.ts` 밖에 두면 바인딩이 core 안쪽 fractal을 직접 가져와야 해 filid 경계 §3과 09의 import 경로 약속에 어긋난다 | 적용. `core/index.ts`가 이름으로 다시 내보내고 `src/index.ts`는 내보내지 않으며 키 목록 시험은 `src/index.ts`에. React 바인딩은 `core/index.ts`만 가져온다 |
| N2 | 중간 | `findNode`·`findNodes`·트리 걷기는 `subnodes`(비활성 자식 포함)를, `detectsCandidate`는 `variant`와 `oneOfIndex`를 읽으므로(`findNode.ts:69`, `findNodes.ts:92`, `detectsCandidate.ts:40-42`, `depthFirstSearch.ts:18`, `breadthFirstSearch.ts:19`) 그대로 옮길 수 없다 | 18라운드 안건(설계 빈틈). 게이트의 수정안(전체 자식 칸을 레코드에 두고 `detectsCandidate` 폐기)은 안건의 한 안으로 넘긴다 |
| N3 | 중간 | 레코드 형, 트리 공용 칸의 형, 생성 주입 형의 이름이 후보 없이 문서에 들어간다 | 이름으로 닫힘. 칸 열다섯으로 늘려 소유자가 골랐다(§8) |
| N4 | 중간 | 4번 수렴과 병렬로 편집하면 08 §14·§15·§17과 이 기록의 같은 칸을 덮어쓸 위험이 있다 | 한 번의 반영으로 닫힘. 두 스웜과 소유자 답을 17라운드 정리 명세 v3 한 판으로 모아 편집자 넷이 서로 다른 파일을 맡았다 |
| N5 | 중간 | 런타임 형의 칸(통지 대기열, 검증기, 진단)의 타입을 소유하는 `dispatch`·`validation`이 `record/`를 가져오므로 타입 고리가 생기거나 `as` 단언이 필요하다. 검증기 칸의 타입은 오늘 `app/plugin`에 있다 | 18라운드 안건(설계 빈틈). 게이트의 수정안(런타임 형의 칸 타입을 `record/`가 인터페이스로 선언하는 의존 역전)은 안건의 한 안으로 넘긴다 |
| N6 | 중간 | `navigation/`은 레코드 형을 돌려주지만 공개 `find`·`findNodes`·`parentNode`·`children`은 공개 판별 합집합을 돌려줘야 하므로, 단언 금지 규칙과 겉면 린트 사이에서 막힌다 | 18라운드 안건(설계 빈틈). 게이트의 수정안(공개 겉면 `utils`의 변환 함수 하나, 타입 술어인가 승인받은 단언 하나인가)은 안건의 한 안으로 넘긴다 |
| N7 | 낮음 | 식별·구조 게터는 16이 아니라 14, 보류는 0–14, 범위는 44–58 | 적용(§6) |
| N8 | 낮음 | `trim` 편집이 R17-3 반영보다 먼저 들어가면 08 안에서 모순된다 | R17-3 반영으로 닫힘. R17-3의 답을 같은 반영에서 옮겼다 |
| N9 | 낮음 | `active`는 PR-2에서 계산되므로 PR-6에 두면 PR-2의 형상 시험이 공개 표면으로 형상을 읽을 수 없다 | 적용. `active` 게터는 PR-2 |
| N10 | 낮음 | `validate`의 위임이 여러 단계를 잇는 조율이므로 `dispatch`의 몫이고, 동사 목록에 `validate`와 로드가 빠졌다 | 적용. `validate`는 `dispatch` 진입, 동사 목록에 `validate`와 로드인 reset |
| N11 | 낮음 | 전순서의 `settle(< derive)` 표기가 거꾸로다 | 적용. `settle/derive` < `settle` |
| N12 | 낮음 | 한 줄씩 어긋난 인용과 줄 수 오기 | 적용. `StringNode.ts:118-122`, `getNodeGroup.ts:20-21`, 전략 타입 파일 50·89줄 등 |
| N13 | 낮음 | 가드 개수가 아홉과 열로 어긋나고 `isNullNode`는 쓰는 곳이 없다 | 적용. `isNullNode`는 옮기지 않는다 |
| N14 | 낮음 | 행이 없는 조합(잎의 `options.terminal: false`는 오늘 `branch`가 되어 fieldset으로 그려지고, 가상의 `options.terminal: true`는 자식 구성 요소가 비워짐)을 무시하면 사용자에게 보이는 동작이 바뀌는데 이주 행이 없다 | 18라운드 안건(설계 빈틈). 처리와 이주를 함께 정한다. 가상에 인라인 `presentation.FormTypeInput`을 둔 경우(오늘은 `getNodeGroup.ts:22-23`이 `'terminal'`로 정함)도 같은 안건에 든다(반영 뒤 수정 게이트) |
| N15 | 낮음 | `schemaPath`·`key`는 에러 라우팅(PR-4)만이 아니라 React key와 구성 요소 캐시 키(`useChildNodeComponents.tsx:61-62`, PR-7)에도 걸린다 | 적용(§6) |
| N16 | 낮음 | 가상 노드의 값 칸 설명이 앞뒤가 맞지 않는다 | 적용. `raw`·`emit`이 없고 `assemble`이 튜플을 `local`에 둔다(§4) |
| N17 | 낮음 | 작은 불일치 다섯(`shallowPatch`의 근거, 고르기 함수와 키의 노출, 시험 파일 수, 09 §4.4의 PR-5 시험 행, ADR 0011의 "전략 패턴이 필요한가") | 적용. `shallowPatch`는 소비자 둘의 불변식 근거로 `record/`에. 표가 `BEHAVIORS[type][strategy]`의 두 단계가 되어 고르기는 생성 때 표를 한 번 읽는 것이고 표는 behaviors 밖으로 내보내지 않는다. 시험은 87파일(보조 셋 포함 90파일). PR-5 시험에 터미널 배열 행을 더한다. ADR 0011의 "전략 패턴이 필요한가"는 17라운드 소유자 확정으로 닫는다(`behaviors/`의 `branch/`·`terminal/`) |

## 10. 18라운드로 넘긴 것

N2(탐색이 기대는 `subnodes`·`variant`의 존폐), N5(런타임 형의 타입 순환), N6(레코드에서 공개 판별 합집합으로의 형 변환), N14(행이 없는 조합의 처리와 이주), 공개 표면의 크기(루트 전용 넷, 명령 넷을 노드 메서드로 둘지, `subnodes`·`defaultValue`·`resetSubtree`·`schemaPath`·`key`의 존폐), `ContextNode`의 자리, 문서 주석 `{@inheritDoc}` 관례(겉면 파일의 줄 수를 가름), 내부 통로(`finishInput` 신호)를 core만 쓰는 호스트에 열지, 전환 방식의 세부(레거시 디렉토리의 이름과 자리, 기존 시험·스토리북). 목록과 출처는 `reviews/round-18-agenda.md`에 있다.
