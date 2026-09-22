# 여섯 설계 결정 교차검증

검토일: 2026-09-22. `HANDOFF.md`, `reviews/round-3.md` §4·§6, `reviews/round-3-spec.md`와 §E를 기준으로 현재 코드·테스트를 대조했습니다. **권고이며 소유자의 채택 결정은 아닙니다.** ADR이나 제품 코드를 변경하지 않았습니다.

근거 표기: **(a)** 현재 코드·테스트의 `file:line`, **(b)** 검토 기록의 실행 결과와 절, **(c)** AJV 8.17.1 직접 실행입니다. 새 설계의 효과·이식 가능성·권장 API는 **추론**으로 표시합니다. `src/…`는 `packages/canard/schema-form/` 기준, `reviews/…`는 그 아래 `architecture/` 기준입니다. 동일한 이름의 파일은 아래에서 정의한 약칭을 사용합니다.

이번 실행의 스크립트와 출력은 `reviews/crosscheck-decisions-ajv.mjs`, `reviews/crosscheck-decisions-current.ts`, `reviews/crosscheck-decisions-evidence.md` §1–§4에 보존했습니다. 기존 테스트 5파일·62케이스가 통과했으며, 이는 새 설계의 통과 결과가 아닙니다.

## D-1

### 1. 확인한 사실

- **(a) S4는 부모의 출력만 null로 만드는 정책이 아닙니다.** `src/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:196`은 커밋 뒤 자식 전파를 호출합니다. 같은 파일 `:263`의 `__propagate__`는 커밋된 값이 null이면 모든 분기의 `__subnodes__`를 돌며 `:282`에서 `__resetToBlank__`를 호출합니다. 따라서 비활성 분기에 있던 값도 blank로 바뀝니다. 이하 이 파일을 **ObjectBranch**라고 부릅니다.
- **(a) blank는 무조건 undefined가 아닙니다.** `src/core/nodes/AbstractNode/AbstractNode.ts:1127`은 부모가 제공한 기본값 조각 또는 `getDefaultValue(jsonSchema)`를 사용하고 복원값도 갱신합니다. 초기값과 복원값은 `:279`, `:285`에 따로 있으며 `:303`은 초기화 뒤에는 복원값만 바꿉니다. `resetSubtree()`는 `:1138`에서 초기값을 복원값으로 다시 넣습니다. 이하 이 파일을 **AbstractNode**라고 부릅니다.
- **(a) `__hasNullAncestor__`는 삭제 장치가 아니라 재활성화에 필요한 쓰기 전달 장치입니다.** AbstractNode `:1100`은 null 조상을 찾고, `:1112`는 값이 같아서 흡수된 외부 쓰기도 부모로 전달합니다. `Automatic` 쓰기는 제외됩니다. ObjectBranch `:808`은 null 동안 자동·잠금·undefined 쓰기를 blank에 기록하고, 값을 담은 외부 쓰기에서 `:815`의 blank를 draft로 옮겨 부모를 객체로 만듭니다.
- **(a) 폐기 시 충돌하는 단언이 구체적으로 존재합니다.** `src/__tests__/scenarios/nullable.object-blank-state.render.test.tsx:31`은 null 뒤 note가 빈 문자열, reason이 `because`로 보임을 검사하고, `:42`는 다음 입력 뒤 `{note:'again',reason:'because'}`를 검사합니다. `:148`은 null을 통과한 비활성 분기를 복원해도 `bValue:'B'`이지 로드했던 `'x'`가 아님을 고정합니다. `:140`의 필드 단독 reset도 형제 kind가 blank의 `'a'`인 결과를 기대합니다. `src/core/__tests__/ObjectNode.branch.nullable.blankState.test.ts:120`은 null 진입 경로가 달라도 중첩 쓰기 뒤 동일한 blank 값이 나옴을 검사하고, `:137`은 배열까지 비교합니다.
- **추론:** raw 보존을 그대로 적용하면 위 DOM 초기화·승격·분기 복원 단언을 재작성해야 합니다. 단, 초기 `defaultValue` 불변성(`nullable.object-blank-state.render.test.tsx:115`)과 명시적 초기값 reset(`:132`)까지 반드시 폐기해야 하는 것은 아닙니다. 이번에는 새 구현을 넣어 실패시킨 것이 아니라 기존 단언과 새 계약의 충돌을 확인했습니다.
- **(b) 실제 누출 경로는 실행 모델에 있습니다.** `reviews/raw-codex3-workloop.md` §A6: `{note:'typed',keep:'K1'}` → `setValue(null)` → 부분 쓰기 `note='Z'`의 결과가 보존 해석에서는 `{note:'Z',keep:'K1'}`, 전체 교체 해석에서는 `{note:'Z'}`입니다. `reviews/raw-redteam2-lifecycle.md` §2 N2는 현재 구현에서 null 뒤 note=`'D'`, keep=`undefined`, 이후 `{target:{note:'Z'}}`를 기록했습니다.
- **추론:** A를 읽은 같은 트리에 B=`null`을 로드한 뒤 B의 자식 하나를 편집하면 A의 형제 값이 다시 `emit`에 합류하여 저장 경로로 나갈 수 있습니다. null 동안에도 직접 자식 `.value`를 읽는 UI·구독자는 raw를 볼 수 있습니다. 반면 **부모 emit이 null인 동안 바로 제출해도 반드시 A가 새어 나온다**는 주장은 틀립니다. 누출은 직접 자식 읽기 또는 객체로 승격한 뒤의 경로입니다.

### 2. 옵션 비교

| 옵션 | 이익 | 손해 | 근거 |
| --- | --- | --- | --- |
| S4 유지 | null 진입 경로와 관계없이 동일한 blank를 보이며 이전 레코드의 편집값이 복귀하지 않습니다. | null을 잠깐 토글했다 돌아와도 편집값을 잃습니다. 초기값 reset과 blank 복원을 구별할 상태·전이가 필요합니다. | (a) AbstractNode `:279,285,1127,1138`; blank-state 렌더 테스트 `:31,42,148` |
| S4 폐기, E9의 비객체 raw 보존 | 추론: 편집 중 null 토글에서 입력을 복원하기 쉽고 blank 복원 상태를 줄일 수 있습니다. | A→B=null→자식 편집에서 A의 잠복값이 돌아옵니다. `Overwrite(null)`도 자식을 보존한다면 전체 교체의 예외입니다. | (b) `raw-codex3-workloop.md` §A6의 두 출력; (a) 기존 blank 단언과 충돌 |

### 3. 권장안

**S4 유지를 권고드립니다.** 추론: 현재 코드와 DOM 테스트가 보장하는 레코드 간 편집값 격리와 blank의 일관성이, null 토글 편의와 상태 칸 축소보다 우선되어야 합니다.

### 4. 함께 알아야 할 대가

추론: 이 권고는 E9의 “비객체 V는 자식 raw를 건드리지 않는다”를 그대로 채택하지 않는 결정입니다. null 진입 때 이전 raw를 폐기하고 blank를 구성하는 전이를 명세에 유지해야 합니다. 현재 blank 생성에는 배열 minItems 보정도 포함되므로, 재설계에서 값 보정을 제거하면 S4의 **이력 독립성**은 보존하되 blank의 세부 값까지 모두 보존할 수는 없습니다(`ObjectNode.branch.nullable.blankState.test.ts:184`).

초기값을 되돌리는 reset은 여전히 별도 책임입니다. **기존 `resetSubtree()`를 “새 레코드의 데이터 격리” 수단으로 안내하면 안 됩니다.** 그것은 A로 생성한 폼을 A의 초기값으로 되돌립니다(AbstractNode `:1138`). S4를 폐기하기로 결정하신다면, B에 맞춘 초기화/재생성 또는 자식 raw까지 지우는 별도의 교체 계약이 필요합니다. `{}`를 거친 교체도 default와 null 상태를 어떻게 처리하는지까지 정의해야 합니다.

## D-2

### 1. 확인한 사실

- **(b) A의 단조성은 의미 일치를 보장하지 않습니다.** `reviews/raw-redteam3-lifecycle.md` §“A3 4단계 옵션 A”의 실행에서 A는 `{mode:'full',fallback:'F',extra:'E'}`와 then·else 동시 활성, B는 `{mode:'full',extra:'E'}`와 올바른 활성 집합으로 3바퀴 만에 종료했습니다. AJV는 A를 거부하고 B를 수락했습니다.
- **(b) 검증기가 A의 어긋남을 항상 찾아주지도 않습니다.** `reviews/raw-codex3-workloop.md` §“A3 step 4 옵션 A”에서 A의 `{seed:true,a:'A',x:1}`과 B의 `{seed:true,x:1}`은 추가 키를 허용하는 스키마에서 둘 다 valid였습니다. `unevaluatedProperties:false`를 추가했을 때에만 A가 실패했습니다.
- **(a)(b) “현재 구현도 같은 자기 부정 스키마에서 무한 루프”는 이번 확인 범위에서는 사실이 아닙니다.** `src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap/utils/flattenConditions.ts:44`는 `if.properties`만 추출하고 없으면 반환하며, `:53`은 `then.required`를 읽습니다. 직접 실행한 `if not required x then x default`는 `{}`, `/x` 없음으로 끝났습니다. 루트에 x를 선언한 변형도 `{}`, `/x`는 존재하되 값 없음으로 끝났습니다(`crosscheck-decisions-evidence.md` §2). **현재의 종료는 이 조건부 동작을 지원한다는 뜻이 아니라 해당 가드·default를 처리하지 않은 결과입니다.**
- **(a) 현재 무한 루프 가드는 조각 계산 상한이 아닙니다.** `src/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:34`의 `MAX_LOOP_COUNT=100`, `:95`의 `++count > 100`에서 101번째 배치 생성 전에 `INFINITE_LOOP_DETECTED`를 던집니다. `:109`에서 macrotask로 카운터를 초기화합니다. 노드별 이벤트 캐스케이드 제한이며 production 조건 분기는 없습니다. `src/__tests__/scenarios/computed.derived.render.test.tsx:438`은 발산하는 derived 쌍의 오류를 검사합니다. 이것을 위 표준 스키마의 실행 증거로 대체할 수는 없습니다.
- **(c) AJV 8.17.1 자체는 해당 스키마의 `{}`와 `{x:1}`을 모두 valid로 판정하며 default를 넣지 않았습니다.** `crosscheck-decisions-ajv.mjs`의 `selfNegating`, 출력은 evidence §1입니다. 진동은 검증기가 아니라 폼의 활성·투영·default 정책에서 발생하는 문제입니다.
- **(a)(b) 실제 로컬 표본에서 명시적 `not:`는 드뭅니다.** src 651파일에서 3회, stories 54파일에서 0회였습니다. 세 곳은 `src/core/__tests__/ObjectNode.composition.nullUnreachableWarning.test.ts:125,129,152`의 검증 경계 사례입니다(evidence §4). **추론:** 현재 사용례에서 빈번하다는 주장은 뒷받침되지 않습니다. 다만 미지원 기능이 적게 등장하는 표본 편향이 있으며, else도 부정 가드이고 외부 고객 스키마의 빈도는 알 수 없습니다. `if:` 310회를 분모로 한 “부정 스키마 비율”을 계산하지 않습니다.

### 2. 옵션 비교

| 옵션 | 이익 | 손해 | 근거 |
| --- | --- | --- | --- |
| A: 한 번 켠 조각을 끄지 않음 | 유한 조각 집합의 활성 추가가 끝난다는 단순한 종료 논증이 가능합니다. | then·else가 동시에 남을 수 있고, 잘못 남은 필드가 AJV에서도 통과할 수 있습니다. | (b) `raw-redteam3-lifecycle.md` §A3 4단계, `raw-codex3-workloop.md` §A3 step 4 |
| B: 재평가·비활성화 + N+1 예산 | 추론: 위 부정 가드 조합의 의미를 보존하고 최악의 작업량을 제한합니다. | 자기 부정·상호 의존에서 고정점이 없을 수 있으며 마지막 상태는 수렴 결과가 아닙니다. N+1은 보편적 수렴 증명이 아닙니다. | (b) 위 A/B 실행 비교; (a) 현재 100배치 제한도 수렴과 작업량을 별도로 다룸 |

### 3. 권장안

**옵션 B와 production 진단 상태·통지를 함께 채택하시기를 권고드립니다.** 추론: 실행으로 확인된 A의 잘못된 활성 상태를 일상 계약으로 삼기보다, 정합적인 재평가를 기본으로 하고 예산 초과를 명시하는 편이 낫습니다.

### 4. 함께 알아야 할 대가

다음은 **구체적인 설계 제안이며 추론**입니다. 호스트의 마지막 커밋에 `{reason:'stable'|'budget-exceeded', phase:'fragments'|'derive', iterations, budget, hostPath, commitId}`를 보관하고, 커밋 통지에 같은 진단을 실으십시오. 필요하면 안정적인 fragment ID 목록을 추가하되 raw 값은 싣지 않습니다. 늦게 구독한 소비자는 상태를 조회하고, 기존 구독자는 진단 이벤트를 받습니다. 다음 안정 커밋에서는 상태도 `stable`로 갱신합니다. production에서 console 경고만 남기는 방식은 피해야 합니다.

조각 N개에 대해 완료된 바퀴를 최대 N+1개까지만 채택하고, 다음 바퀴는 실행하지 않으며 마지막 완료 상태를 커밋하도록 정의하십시오. 조각 계산과 default/inject 파생 라운드는 예산을 분리해야 합니다. 매 바퀴 N개 평가라면 조각 평가만 O(N²)이며, 상속 overlay의 자식 재계산 비용까지 그 식으로 보장되지는 않습니다. E1의 default 사건 분리·E5의 투영 후 가드·E12의 overlay를 합친 최종 구현은 아직 이 실행들로 검증되지 않았습니다.

`budget-exceeded`는 AJV valid 여부와 다른 축입니다. 자기 부정 스키마는 결과가 valid여도 지원 밖으로 진단해야 합니다. 개발 모드에서 throw한다면 커밋·진단 기록을 남긴 뒤의 시점인지도 정해야 합니다. 선택한 마지막 바퀴는 선언 순서와 예산에 의존할 수 있으며, submit 소비자에게 이 상태를 공개하는 비용을 받아들여야 합니다.

## D-3

### 1. 확인한 사실

- **(a)(b) 현재 `properties:{x:false}`는 금지 필드로 처리되지 않습니다.** `src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getChildNodeMap/getChildNodeMap.ts:50`은 프로퍼티 스키마를 그대로 노드 팩토리에 전달하고, `src/core/nodes/schemaNodeFactory.ts:74`는 타입별 노드를 생성합니다. 대응 타입이 없는 false는 `:117`의 `UNKNOWN_JSON_SCHEMA`로 끝납니다. 직접 실행도 이 오류였습니다(evidence §2).
- **(a)(b) `not:{required:['x']}`를 x의 비활성화 명령으로 해석하지 않습니다.** `flattenConditions.ts:44`의 조건 추출 경로에 그런 규칙이 없고, 직접 실행에서 x는 string 노드이며 `'secret'`이 유지됐습니다. 기본 properties에 x를 선언하고 `then.properties.x=false`를 넣은 경우도 x와 방출 값이 유지됐습니다(evidence §2). 따라서 “현재 모든 금지 조각은 일반 필드”라고 묶으면 boolean property의 생성 오류를 놓칩니다.
- **(c) 정확한 AJV 오류는 다음과 같습니다.** 스크립트 `crosscheck-decisions-ajv.mjs`, 전체 실행 기록 evidence §1. `useDefaults:false`, 값 수정 옵션 없이 원본과 같은 값을 검증했습니다.

| 스키마·입력 | valid | instancePath | schemaPath / keyword / message |
| --- | --- | --- | --- |
| `properties:{x:false}`, `{x:'secret'}` | false | `/x` | `#/properties/x/false schema` / `false schema` / `boolean schema is false` |
| 위 스키마, `{}` | true | — | 오류 없음 |
| `not:{required:['x']}`, `{x:'secret'}` | false | 빈 문자열(호스트) | `#/not` / `not` / `must NOT be valid` |
| 위 스키마, `{}` | true | — | 오류 없음 |
| `required:['x']`와 `properties:{x:false}`, `{}` | false | 빈 문자열 | `#/required` / `required` / `must have required property 'x'` |
| 조건부 `then.properties.x=false`, `{mode:'ban',x:'secret'}` | false | `/x` 및 호스트 | false-schema 오류와 `if`의 `must match "then" schema` |

`not` 오류의 `params`는 `{}`라 x를 직접 지목하지 않습니다. **추론:** 필드에 붙이려면 `schemaPath`로 스키마를 추적하는 라우팅이 필요하며, 일반 오류 라우팅만으로는 호스트 오류가 맞습니다. x를 `''`나 null로 바꾸어도 “키가 존재하지 않아야 한다”는 문제를 해결하지 못하므로, 실제 키 삭제나 조건 변경 수단이 필요합니다.

### 2. 옵션 비교

| 옵션 | 이익 | 손해 | 근거 |
| --- | --- | --- | --- |
| (i) 비활성화·방출 제외 | 추론: 사용자가 금지된 필드를 편집할 필요가 없고, 단순 사례는 유효해집니다. | 입력을 조용히 감춥니다. required와 충돌하면 삭제해도 invalid이며, 가드 입력에서도 빼면 활성 피드백을 만들 수 있습니다. | (c) falseProperty·notRequired는 삭제 후 valid, requiredAndFalse는 삭제 후 invalid; (b) `raw-redteam3-lifecycle.md` §A3-5는 금지 제외를 compose와 분리한 모델의 결과 |
| (ii) 금지를 특별히 알아내어 필드를 표시하고 에러 연결 | 추론: 원본을 유지하면서 금지 이유를 해당 필드에 설명할 수 있습니다. | 단일 `not`의 에러 라우팅을 추가해야 합니다. 키 삭제 UI가 없으면 어떤 입력값도 문제를 해결하지 못합니다. false만으로는 입력 타입도 정해지지 않습니다. | (c) `/x`와 호스트 오류의 차이; (a) schemaNodeFactory `:74,117` |
| (iii) 금지 전용 활성 규칙 없이 검증기에 위임 | 추론: 표준 스키마의 거부 의미와 원본을 유지하고, 별도의 “금지 조각” 계산을 없앱니다. | 호스트 오류가 덜 친절할 수 있습니다. boolean schema만 있는 속성에는 일반 필드를 자동 생성할 타입 정보가 없으므로 별도 표현 정책이 필요합니다. | (a) 현재 notRequired의 값 유지 경로; (c) 원본 그대로의 AJV 오류 |

### 3. 권장안

**(iii), 금지 전용 활성·삭제 규칙 없이 검증기에 맡기는 안을 권고드립니다.** 추론: backend가 거부할 데이터를 폼이 조용히 삭제하는 정책을 피하고, 오류의 친절함은 값 변경과 분리하여 개선할 수 있습니다.

### 4. 함께 알아야 할 대가

추론: “검증기에 맡긴다”는 오류를 숨긴다는 뜻이 아닙니다. 일반 오류 표시, 호스트 오류 요약, 명시적인 필드 제거 동작은 필요합니다. 다른 조각에 x의 타입이 있으면 일반 x 노드를 유지할 수 있지만, `x:false`만 있으면 값 보존용 일반 JSON 편집기·읽기 전용 오류 항목 같은 표현 정책을 별도로 정해야 합니다. 현재 팩토리의 오류를 그대로 두고 boolean schema를 지원한다고 선언해서는 안 됩니다.

(ii)와 (iii)의 차이는 기본 오류 표시 여부가 아니라 **core가 금지를 특별한 필드 상태로 해석하는지**입니다. 추론: 오류 라우터가 단일 이름 `not.required`를 x에 안내하는 개선은 나중에 추가할 수 있으며, 그것 때문에 활성 계산이나 raw를 바꿀 필요는 없습니다. 이 권고에서는 E5의 “금지 제외 전 가드” 예외와 E8의 “판별 필드 금지는 무시”도 다시 정리해야 합니다. 검증기의 금지 의미 자체를 무시해서는 안 됩니다.

## D-4

### 1. 확인한 사실

**(a) 현재 독립 비트는 11개가 아니라 10개입니다.** `src/core/types/value.ts:26`은 `BIT_FLAG_00`부터 `BIT_FLAG_09`까지 선언합니다. `None`은 0, `Default`, `Reset`, `Merge`, `Overwrite` 등은 조합입니다. 공개 열거형은 이미 `Merge`와 `Overwrite` 두 개뿐입니다(`:69`).

아래는 각 비트를 **읽는** 코드의 대표 위치입니다. ObjectBranch는 D-1에서 정의한 파일이며, **StringNode**는 `src/core/nodes/StringNode/StringNode.ts`, **ObjectTerminal**은 `src/core/nodes/ObjectNode/strategies/TerminalStrategy/TerminalStrategy.ts`, **ArrayBranch**는 `src/core/nodes/ArrayNode/strategies/BranchStrategy/BranchStrategy.ts`입니다. Number·Boolean·Null 및 Array terminal도 같은 종류의 읽기를 수행합니다.

| 비트 | 의미 | 실제 읽기 위치 (a) |
| --- | --- | --- |
| Replace | 병합 대신 교체; 동등값 적용도 허용 | StringNode `:45`, ObjectBranch `:161` |
| EmitChange | 부모에 값 전달 | StringNode `:56`, ObjectBranch `:190` |
| Propagate | 객체 자식에게 전파 | ObjectBranch `:196` |
| Refresh | 비제어 입력 재읽기 요청 | StringNode `:62`, ObjectBranch `:198`, `src/core/nodes/VirtualNode/VirtualNode.ts:79` |
| Batch | 부모 전달 배치 | StringNode `:59`, ObjectBranch `:193` |
| Isolate | unsettled 처리·즉시 computed 갱신 | ObjectBranch `:163,200,331`, ArrayBranch `:173` |
| Normalize | 미선언 키 제거 | ObjectTerminal `:50`, ObjectBranch `:162` |
| PublishUpdateEvent | 값 갱신 이벤트 발행 | StringNode `:64`, ObjectBranch `:201` |
| PreventInjection | 해당 업데이트의 injectTo 억제 | StringNode `:46`, ObjectBranch `:164`, ArrayBranch `:174` |
| Automatic | 자동 쓰기의 null 승격 방지 | StringNode `:54,60`, AbstractNode `:1117`, ObjectBranch `:176,326` |

- **(a) 옵션 없는 `setValue(v)`의 기본은 이미 Overwrite입니다.** AbstractNode `:355–358`. `SetValueOption.Default`라는 상수는 `EmitChange | PublishUpdateEvent`이며, 공개 함수의 기본 인자가 아닙니다(`core/types/value.ts:51`). `Form` 핸들은 옵션을 그대로 넘깁니다(`src/components/Form/Form.tsx:155`).
- **(a) 리프 입력이 현재 Merge 비트를 쓰는 것도 아닙니다.** `src/components/SchemaNode/SchemaNodeInput/type.ts:33`의 기본 입력 옵션은 `Replace | Propagate | EmitChange | PublishUpdateEvent`이고 Refresh는 없습니다. `SchemaNodeInput.tsx:50`이 이 옵션을 사용합니다.
- **추론:** 리프 입력은 폼 전체에 대해서는 부분 쓰기지만 대상 스칼라 자체는 교체합니다. 자식이 없는 스칼라는 대상 아래에서 Merge와 Overwrite의 차이가 없습니다. 사용자 JSON 편집기가 객체를 통째로 넘기는 경우까지 “입력 컴포넌트이므로 Merge”로 결정하면 삭제한 키가 남을 수 있습니다.
- **(a) Refresh는 별개의 값 쓰기가 아닙니다.** `src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInputControl.ts:37`은 RequestRefresh에서 재렌더를 요청합니다. 따라서 새 API의 Refresh는 “DOM을 core로 읽어오기”가 아니라 **비제어 입력이 core의 값을 다시 읽게 하는 신호**여야 합니다.

### 2. 옵션 비교

| 옵션 | 이익 | 손해 | 근거 |
| --- | --- | --- | --- |
| 현행 비트 조합 유지 | 기존 동작의 세밀한 제어를 보존합니다. | 추론: 호출자가 배치·전파·주입 출처까지 알아야 하며 쓰기 의미가 여러 조합에 분산됩니다. | (a) 비트 읽기 표, `core/types/value.ts:49–65` |
| Overwrite·Merge + 독립 Refresh로 축소 | 추론: 호출자가 의도를 밝히고 내부 스케줄링을 숨길 수 있습니다. | PreventInjection·Automatic이 수행하던 책임은 내부 전이와 쓰기 출처로 옮겨야 합니다. 단순 삭제는 null 승격·inject 동작을 바꿉니다. | (a) AbstractNode `:1117`, ObjectBranch `:164,176`; (b) `raw-codex3-workloop.md` §A6의 null 보존/교체 차이 |
| 축소하되 기본을 Merge로 변경 | 추론: 부분 패치를 짧게 쓸 수 있습니다. | 외부 레코드 교체에서 생략한 키가 남고 현재 기본값과 달라집니다. | (a) AbstractNode `:358`; (b) `raw-redteam3-lifecycle.md` §C1의 전체 교체가 잠복 b를 제거한 실행 |

### 3. 권장안

**Overwrite·Merge를 상호 배타적인 쓰기 모드로, Refresh를 독립 신호로 남기고 기본은 Overwrite로 유지하시기를 권고드립니다.** 추론: 기존 기본 의미를 살리면서 레코드 교체와 부분 편집을 호출자가 구분할 수 있습니다.

### 4. 함께 알아야 할 대가

추론: `Normalize`는 제거하되 미선언 extra를 보존·검증하는 정책을 명시해야 합니다. `PreventInjection`은 공개 옵션으로 남길 필요가 없지만 reset·default·inject의 출처와 재주입 방지 규칙은 남아야 합니다. Automatic의 null 승격 방지도 마찬가지입니다. **비트 삭제와 의미 삭제는 다릅니다.**

Overwrite는 대상 아래 활성·비활성 raw와 extras를 교체해야 합니다. 기존 ObjectBranch `:276`은 null이 아닐 때 현재 children을 전파하므로, 새 전체 교체 계약을 기존 비트의 이름만 바꿔 구현해서는 안 됩니다. 배열 전체 값은 교체, push/remove/update는 명시적 구조 연산으로 구분하는 편이 낫습니다.

D-1에서 권고한 S4를 유지한다면 null 교체에서 오래된 raw를 지우고 별도 blank 초기화를 수행하십시오. D-1을 반대로 채택한다면 E9 때문에 `Overwrite(null)`은 완전 교체가 아니므로, 이 예외를 이름·문서·레코드 로드 경로에 반드시 드러내야 합니다. 객체 전체 교체 후 default를 넣는 단계도 D-5의 로드 정책으로 구분해야 하며, 모든 Merge마다 default를 다시 넣어서는 안 됩니다.

## D-5

### 1. 확인한 사실

- **(a) 빈 폼과 로드의 구분은 값 존재 여부에서 시작합니다.** `src/providers/RootNodeContext/RootNodeContextProvider.tsx:86`은 `defaultValue`를 `nodeFromJSONSchema`에 전달합니다. AbstractNode `:1197`은 `defaultValue !== undefined`이면 그 값을, 아니면 `getDefaultValue(jsonSchema)`를 선택합니다. 별도의 전역 “로드 모드” 플래그로 구분하는 구조는 아닙니다.
- **(a) 자식 수준에서 구분이 사라집니다.** `getChildNodeMap.ts:51,69`는 부모 값의 해당 키가 undefined이면 `schema.default`를 사용합니다. 따라서 빈 폼도, `{}`를 로드한 폼도, JavaScript 객체에서 `x:undefined`를 제공한 경우도 현재 이 경로에서는 같은 기본값을 받습니다. null은 undefined가 아니므로 직접 제공된 값으로 취급합니다.
- **(a) default 해석과 초기값 저장은 다른 함수입니다.** `src/helpers/defaultValue/getDefaultValue/getDefaultValue.ts:19`는 명시된 schema.default, `:20`은 virtual의 빈 튜플, `:23`은 타입별 빈 값을 반환합니다. AbstractNode `:303`의 `__setDefaultValue__`는 초기값·복원값 저장입니다. ObjectBranch `:849`는 null 부모의 자식 기본값을 따로 선택하고 `:918`은 조립된 값을 초기 기준으로 저장합니다.
- **(a) 현재 Dirty/Touched는 서버 원본과의 deep equality 결과가 아닙니다.** `SchemaNodeInput.tsx:55`는 사용자 onChange에서 Dirty를 true로, `:79–84`는 blur 뒤 Touched를 true로 설정합니다. **추론:** 로드 중 default가 들어갔다고 이 플래그가 자동으로 true가 된다고 단정하면 안 됩니다. 반면 소비자가 로드 원본과 `getValue()`를 비교한다면 `{}` → `{x:default}` 차이를 dirty로 판단할 수 있습니다.
- **(b) default가 왕복 값을 바꾸는 실행은 이미 있습니다.** `reviews/raw-redteam3-lifecycle.md` §C1·§C2에서 `setValue({kind:'a'})` 뒤 `{kind:'a',base:'BASE',a:'A0'}`가 나왔습니다. 같은 §C2의 `{kind:'a',e:'EXTRA'}` 로드는 비활성 e가 방출에서 빠졌습니다. 따라서 **default 미주입 옵션만으로 완전한 무손실 왕복은 보장되지 않습니다.**
- **(a) 이름의 기존 톤은 연산을 말하는 `omit…`입니다.** `src/types/jsonSchema.ts:266`의 `omitEmpty`와 `:173,182`의 `omitTrailing`입니다. `preserveDefaultValue`는 schema의 default를 보존한다는 뜻과 prop으로 로드한 값을 보존한다는 뜻 모두로 읽힐 여지가 있습니다. 이 이름 평가 자체는 **추론**입니다.

### 2. 옵션 비교

| 옵션 | 이익 | 손해 | 근거 |
| --- | --- | --- | --- |
| 항상 빠진 키에 default, 끄는 옵션 없음 | 추론: 빈 폼과 로드가 한 가지 초기화 경로를 씁니다. | 일부 키가 빠진 레코드를 읽기만 해도 저장값에 키가 추가될 수 있습니다. | (a) getChildNodeMap `:69`; (b) `raw-redteam3-lifecycle.md` §C1·§C2 |
| 빠진 키에 default가 기본, 로드에서 생략 가능 | 추론: 기존 초기화 편의를 유지하면서 원본 키 집합을 보존할 선택권을 줍니다. | 로드 여부·키 존재 여부·나중 활성 전이의 범위를 분리해야 합니다. | (a) AbstractNode `:1197`, getChildNodeMap `:69`; (b) 위 왕복 결과 |
| 로드는 기본적으로 default 미주입 | 추론: 서버 원본과의 비교가 단순해집니다. | `{}` 로드와 defaultValue 없는 빈 폼의 결과가 달라지며 현재 기본 동작과도 달라집니다. | (a) 현재 초기화 경로; (b) 위 default 주입 결과 |

### 3. 권장안

**빠진 키에 default를 넣는 기본 계약은 유지하되 `omitDefaultsOnLoad: true`로 로드 시 주입만 생략하도록 권고드립니다.** 추론: 동작과 적용 시점이 이름에 드러나며 기존 `omitEmpty`·`omitTrailing`의 톤과도 맞습니다.

### 4. 함께 알아야 할 대가

다음은 **추론에 따른 계약 보완안**입니다.

- defaultValue가 없는 초기 빈 폼은 schema default를 사용하고, 명시적 로드 객체의 **소유 키가 없는 경우만** 주입 대상으로 삼으십시오. `null`, `false`, `0`, `''`를 “빠짐”으로 보지 않습니다. JavaScript의 명시적 undefined를 부재로 볼지 별도로 정해야 하며 현재 코드의 `!== undefined`와 JSON의 키 부재는 같은 계약이 아닙니다.
- 옵션은 default 주입만 끕니다. omitEmpty/omitTrailing, 비활성 필드 제외, extras 처리, 검증의 모든 동작을 “원본 보존”으로 묶지 않습니다. 빈 object/array용 내부 표현 생성까지 꺼지는지도 별도 정의가 필요합니다.
- E1의 나중 OFF→ON default 주입은 이 옵션의 직접 범위 밖입니다. 그런데 로드 직후 초기 활성 결정을 별도 전이로 처리하여 default가 다시 들어가면 옵션이 무효가 됩니다. 최초 로드 정착까지는 같은 로드 정책을 적용해야 합니다.
- Dirty가 “사용자 편집 여부”라면 주입 때문에 Dirty/Touched를 바꾸지 않습니다. “서버 V와 다름”을 별도로 제공한다면 true일 수 있습니다. 주입 후 값을 초기 기준으로 잡는 정책은 UI를 pristine으로 만들지만 저장 payload가 V와 다를 수 있다는 사실을 지우지는 않습니다.

다른 이름 후보는 `applyDefaultsOnLoad`(기본 true, 긍정형)와 `skipDefaultsOnLoad`입니다. `preserveLoadedValue`는 default 이외의 투영까지 보존한다고 오해시키므로 피하는 편이 낫습니다. 옵션을 어디에 둘지는 별도 API 결정이지만, 정적 필드 렌더 옵션보다는 Form 초기화·명시적 로드의 정책에 가깝습니다.

## D-6

### 1. 확인한 사실

- **(a) VirtualNode는 현재 core의 정식 노드 종류입니다.** `src/core/nodes/schemaNodeFactory.ts:111`에서 생성합니다. `src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getChildren/getChildren.ts:56`은 가상 노드를 만들고 `:75`에서는 실제 자식도 목록에 넣습니다. 실제 값 노드가 가상 노드의 참조 자식으로도 노출되며 값 소유자가 두 개라는 뜻은 아닙니다.
- **(a) “값을 소유하지 않는다”를 “현재 값 저장 칸이 없다”로 읽으면 부정확합니다.** `src/core/nodes/VirtualNode/VirtualNode.ts:26`에 `__value__` 캐시가 있고, `:118–129`가 참조 노드 이벤트에서 튜플을 갱신합니다. `:65–76`의 쓰기는 실제 참조 노드로 분배하고 `:79`는 RequestRefresh를 발행합니다. 별도 도메인 필드를 소유하지 않지만 관찰 가능한 튜플·이벤트 계약은 있습니다.
- **(a) ObjectBranch `:279,353,703`은 각각 자식 값 전파, blank reset, 비활성 값 필터에서 virtual을 건너뜁니다.** 이 세 줄을 모두 “required 계산에서 제외”라고 부르는 것은 정확하지 않습니다. required 확장은 `src/helpers/jsonSchema/preprocessSchema/utils/processVirtualSchema/processVirtualSchema.ts:16–25`, `…/utils/transformCondition.ts:43–50`에서 일어나며, 표준 required의 가상 이름을 실제 필드 이름들로 바꿉니다.
- **(a) 렌더 중복 방지도 연결되어 있습니다.** `getChildNodeMap.ts:63–64`는 실제 필드에 virtual 표시를 붙입니다. core에서 이 연관을 없애면 렌더러가 참조 그룹과 실제 필드의 중복 렌더를 직접 관리해야 합니다.
- **(a)(b) “보존 대상 16개”의 분모는 현재 코드와 맞지 않습니다.** 직접 실행한 세 파일은 `src/core/__tests__/VirtualNode.test.ts` 10개, `src/__tests__/scenarios/virtual.render.test.tsx` 12개, `src/helpers/jsonSchema/preprocessSchema/utils/__tests__/processVirtualSchema.test.ts` 15개로 **37개**이며 모두 통과했습니다(evidence §3). 어떤 16개를 뜻하는 별도 목록은 지정 기록에서 확인하지 못했으므로 “15/16 보존” 같은 수치를 만들지 않습니다.

**테스트 보존 판정은 실행 결과가 아니라 다음의 추론입니다.** 이름·문법·이벤트 API를 이주한 뒤 지킬 수 있는 행동을 셉니다. 새 구현에서 그대로 통과했다는 뜻은 아닙니다.

| 현재 테스트 묶음 | (a) core 참조 그룹 | (b) 렌더 계층만 | (c) 현행 |
| --- | --- | --- | --- |
| VirtualNode 10개 (`VirtualNode.test.ts:16,51,92,128,180,214,247,281,315,355`) | 10개 행동을 보존 대상으로 삼을 수 있습니다. 참조 튜플 읽기·쓰기·이벤트 façade가 조건입니다. | **core 계약 0/10 유지.** node.find·그룹 setValue·그룹 이벤트는 사라지며 렌더 어댑터의 별도 계약으로 재작성해야 합니다. | 10개 유지 |
| 렌더 12개 (`virtual.render.test.tsx:42`부터 `:318`) | 12개 행동을 이식할 수 있습니다. 문법·내부 API는 바뀝니다. | 최대 12개 UX를 재구현할 수 있지만 기존 core API를 단언하는 테스트는 수정해야 합니다. 자동 보존 수는 확정할 수 없습니다. | 12개 유지 |
| 전처리 15개 | required 확장을 단언하는 11개는 폐기·대체. 나머지 4개의 무변경·메타데이터 보존 성질은 다른 위치에서 재검증 가능합니다. | 동일하게 확장 11개는 제거, 일반 성질 4개는 이식 가능 | 15개 유지 |

전처리 확장 11개는 `processVirtualSchema.test.ts:24,46,76,99,127,158,189,242,287,343,402`입니다. 나머지는 `:9,363,385,419`입니다. 특히 빈 fields의 required까지 지우는 `:343`은 “유틸 테스트니까 그대로 보존”할 사례가 아닙니다.

### 2. 옵션 비교

| 옵션 | 이익 | 손해 | 근거 |
| --- | --- | --- | --- |
| (a) `&` 선언 + core 참조 그룹 | 추론: 값 소유·표준 required 변경 없이 경로 탐색, 쓰기 분배, 구독·Refresh를 여러 렌더러가 공유할 수 있습니다. | core에 참조 identity·수명·이벤트라는 특별한 노드 책임이 남습니다. 튜플 조회를 완전히 없애면 기존 22개 core/렌더 행동 보존 주장도 성립하지 않습니다. | (a) VirtualNode `:26,65,79,118`; 위 테스트 목록 |
| (b) 렌더 계층으로 완전 이동 | 추론: core의 데이터 노드 모델이 단순해지고 임의 레이아웃 그룹을 쉽게 만들 수 있습니다. | headless 소비자의 그룹 경로·쓰기 API가 없어집니다. 여러 렌더러가 그룹 구독·분배를 구현하거나 별도 공통 어댑터를 공유해야 합니다. | (a) getChildren `:56`, VirtualNode 쓰기·구독 코드, core 테스트 10개 |
| (c) 현행 유지 | 현재 37개 테스트와 기존 스키마 문법을 유지합니다. | 표준 required를 재해석하며 virtual이 FE 전용 네임스페이스로 분리되지 않습니다. | (a) processVirtualSchema `:16–25`, transformCondition `:43–50`; (b) evidence §3 |

### 3. 권장안

**(a), `&` 계열 선언과 core의 값 비소유 참조 그룹을 권고드립니다.** 추론: 현재 검증된 그룹 입력·경로·이벤트의 행동을 Vue·Svelte에서도 공유하면서, 표준 required 변형만 제거할 수 있기 때문입니다.

### 4. 함께 알아야 할 대가

추론: 값 비소유는 **독립 raw/local/emit 저장이 없다는 뜻**으로 정의하고, 기존 `.value`가 필요하면 실제 필드들의 읽기 전용 튜플 view로 제공하십시오. view까지 금지하는 설계라면 위 core 10개 보존 전망을 줄이고 API 이주를 다시 산정해야 합니다. tuple view의 캐시는 값 소유권과 구분할 수 있지만, 같은 읽기에 같은 참조를 주려면 캐시 무효화 비용은 남습니다.

required는 작성자가 실제 필드들로 바꾸어야 합니다. 그룹 이름을 required에 쓴 기존 스키마의 자동 이주는 별도 migration 도구에서 수행하고 core 검증 스키마를 실행 중 바꾸지 않는 편이 낫습니다. 총 37개 중 **core·렌더 22개 행동과 일반 전처리 성질 4개를 보존 대상으로 삼고, required 확장 11개를 새 불변성 테스트로 대체**하는 것이 검토 가능한 이주 범위입니다.

Vue·Svelte 관점에서 (a)는 프레임워크와 무관한 형제 참조·배치 쓰기·Refresh 계약을 core에 공유하고 실제 렌더·포커스만 바인딩이 맡는 방식입니다. (b)는 core를 더 작게 만들지만 같은 그룹을 node.find로 조작할 수 없고 어댑터 API가 필요합니다. (b)가 반드시 코드 중복을 강제하는 것은 아닙니다. 프레임워크 공통 렌더 지원 패키지에 묶을 수 있지만, 그 경우에도 그룹 API의 소유권은 core 밖으로 옮겨집니다. 따라서 “다른 렌더러 이식에는 무조건 (b)가 유리하다”는 결론은 근거보다 강합니다.

## 요약

- **D-1:** S4를 유지하십시오. null 토글 복원 편의보다 blank의 일관성과 이전 레코드 raw 폐기를 우선합니다.
- **D-2:** B를 채택하되 N+1을 작업 예산으로 명시하고 production 상태·통지에 종료 이유를 남기십시오.
- **D-3:** (iii)를 택하십시오. 금지에 따른 자동 삭제 없이 검증하고, 삭제 UX·오류 라우팅은 별도로 제공하십시오.
- **D-4:** Overwrite·Merge와 독립 Refresh로 축소하고 기본은 Overwrite를 유지하십시오. 자동 쓰기·주입 제어의 내부 의미는 보존합니다.
- **D-5:** 빠진 키 default 주입을 기본으로 하되 `omitDefaultsOnLoad`로 로드 시에만 끌 수 있게 하십시오.
- **D-6:** (a)를 택하십시오. `&` 선언·core 참조 그룹·파생 튜플 view를 유지하고 표준 required 확장은 제거합니다.

## 수렴 라운드

### D-1 — 방어

- **S4 유지 결론을 방어합니다. 다만 구현은 현행 `__resetToBlank__`·blank 복원값 장치를 이식하지 않고, 일반 전체 교체와 default 초기화로 대체하겠습니다.** 기존 코드 인용은 보존할 동작의 증거이지 그 장치의 필수성에 대한 증거가 아닙니다.
- **추론:** `Overwrite(null)`은 호스트 raw를 null로 두면서 활성·비활성 분기를 포함한 모든 자손의 이전 raw를 지우고, 기본 정책에서는 없는 값에 schema default를 초기화합니다. null을 `{}`로 바꾸는 연산은 아닙니다.
- **추론:** blank는 schema로부터 재구성하므로 노드마다 세 값을 동시에 보관할 필요는 없습니다. 초기값 reset을 유지하려면 초기 스냅샷 등 별도 복원 정보는 필요하며, “단일 raw만으로 reset까지 해결된다”는 주장도 하지 않겠습니다.
- **E1 반박:** 삭제·default 주입을 계산 전 쓰기 전이로 수행한 뒤 현재 raw를 순수하게 투영하면 됩니다. 순수 함수는 이전 raw의 보존을 요구하지 않습니다. 기존 실행에서도 C1 해석은 `{note:'Z'}`, 보존 해석은 `{note:'Z',keep:'K1'}`입니다〔(b) `reviews/raw-codex3-workloop.md` §A6〕.
- **동치 판정은 조건부로 ‘같습니다’입니다(추론, 새 렌더 구현을 실행한 결과는 아닙니다).** `src/__tests__/scenarios/nullable.object-blank-state.render.test.tsx:31`은 note=`''`, reason=`'because'`, 부모 emit=null이고, `:42`는 다음 입력 뒤 `{note:'again',reason:'because'}`입니다.
- 같은 파일 `:148`도 비활성 bValue의 `'x'`까지 지우고 재활성화 시 default `'B'`를 넣으면 `{kind:'b',note:'typed',bValue:'B'}`로 같습니다. 활성 자식만 지우거나 초기값 `'x'`로 복원하면 같지 않습니다〔(a) `:79–92,148–153`〕.
- 이 동치에는 null 동안 자식 입력 표시·Refresh 유지, default 주입 활성화가 필요합니다. 따라서 E9의 비객체 자식 보존 및 null 아래 로드 default 금지, E18의 null 자식 비활성화를 함께 고쳐야 합니다. 단순히 `__resetToBlank__` 호출만 삭제해서는 성립하지 않습니다.
- **누출 회피 반박:** 중첩 null은 루트 Overwrite 두 번 뒤에도 A의 형제를 되살렸고, reset은 A의 초기값으로 돌아갑니다〔(b) `reviews/raw-crosscheck-decisions-claude.md` D-1 (1), L2·“루트 Overwrite로도 막히지 않습니다”〕. 소비자 지침만으로 충분하다는 근거는 무너졌습니다.
- 실수로 null을 쓰면 현재 편집값을 잃는 대가는 인정합니다. 추론: 복구가 필요하면 명시적 undo 스냅샷으로 해결해야 하며, 새 레코드 로드에도 살아남는 잠복 raw를 기본값으로 삼을 이유는 되지 않습니다.

### D-3 — 방어

- **(iii)를 방어합니다.** 오류가 불친절하다는 사실은 자동 삭제의 정당화가 아닙니다. `required:['x']`와 `x:false`를 함께 두면 x를 삭제해도 required 오류로 제출이 막힙니다〔(c) `reviews/crosscheck-decisions-ajv.mjs`의 requiredAndFalse, 출력은 `reviews/crosscheck-decisions-evidence.md` §1〕.
- 아래는 **추론에 따른 렌더·오류 계약 제안**이며 현재 구현이 이미 제공한다는 주장은 아닙니다. 조건이 참인 `then:{properties:{x:false}}`를 가정합니다.
- **본체에 x가 없을 때:** false에는 입력 타입이 없으므로 x의 일반 입력 노드를 만들지 않습니다. 데이터에도 x가 없으면 x UI와 해당 금지 오류는 없습니다. 별도 required 등 다른 오류까지 없다는 뜻은 아닙니다.
- 로드 데이터에 x가 있으면 **삭제하거나 숨기지 않고 일반 잔여 데이터 영역에 `/x`와 현재 값을 표시하고 명시적 키 삭제 동작을 제공합니다.** x는 값 보존용 extras에 둡니다. 이는 E16의 “선언된 키는 모두 자식 노드”를 “입력 형상을 선언한 키”로 좁히는 명세 보완이 필요합니다.
- 이때 `/x`의 `boolean schema is false`는 대응 입력 노드가 없으므로 가장 가까운 객체 호스트의 오류 요약에 **경로 `/x`를 유지하여** 표시합니다. 잔여 데이터 항목에서 그 오류를 참조하게 하고, `if`의 `must match "then" schema`도 호스트에 둡니다〔(c) evidence §1의 conditionalFalse 오류 경로; 배치 방식은 추론〕.
- **본체에 `x:{type:'string'}`처럼 입력 형상이 있을 때:** 일반 x 입력을 그대로 렌더하고 `/x` 오류를 그 필드에 붙이며, `if` 오류는 호스트에 둡니다. 사용자가 x 키를 명시적으로 제거하거나 조건을 바꿀 수 있게 합니다. 빈 문자열·null 입력은 키 삭제와 다릅니다.
- **단일 `not:{required:['x']}`:** AJV의 호스트 오류 `must NOT be valid`를 호스트 요약에 둡니다. 필드 안내를 추가하려면 schemaPath를 해석해야 하며, `/x` 오류인 것처럼 경로를 바꾸지는 않습니다〔(c) evidence §1의 notRequired, `instancePath:""`, `params:{}`〕.
- 위 잔여 데이터·삭제 수단을 제공하지 않으면 상대의 “사용자가 고칠 수 없다”는 비판이 타당합니다. 이를 (iii)의 필수 UX 수용 기준으로 보완하되, 금지를 core의 활성·자동 삭제 규칙으로 승격시키지는 않겠습니다.
- **추론:** (i)는 같은 투영 연산으로 구현할 수 있어도 “비활성 필드를 제외한다”와 “검증기가 거부하는 입력을 제거한다”는 계약이 다릅니다. 요청하지 않은 데이터 삭제보다 원본·오류를 보이고 사용자가 삭제를 결정하는 편을 권고합니다.
