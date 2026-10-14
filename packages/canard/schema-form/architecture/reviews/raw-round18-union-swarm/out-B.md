# Lens B — 입력 바인딩과 UI 플러그인 계약 — 제안

## 요약 (5줄 이내)
- Hint와 `FormTypeInputProps`의 필드는 노드 필드와 이름·뜻을 1:1로 맞춥니다(Lens A와 합의). `type`은 종류(`node.type`, `'union'` 포함, `integer` 접힘)입니다. `schemaType`은 `node.schemaType`으로, 실효값이고 `'null'`을 빼며 union일 때만 배열입니다. `nullable`은 그대로입니다. 오늘 `hint.type`은 `node.schemaType`을 가리켜 `node.type`과 이름은 같고 값은 다릅니다. 이 이름 함정을 없앱니다.
- 시험 객체의 대조 규칙은 바꾸지 않습니다. 시험 값이 스칼라면 `===`, 배열이면 "그중 하나"입니다. `schemaType`이 키로 더해지고, union의 배열 `schemaType`은 어떤 객체 시험과도 맞지 않습니다. union 목록은 함수 시험으로 읽고, `{type:'union'}`은 모든 union을 잡습니다.
- 기본 입력: union은 문자열 입력에 초안 규칙(나)을 더해 씁니다. 값이 객체나 배열이면 읽기 전용 `JSON.stringify`와 비우기 단추를 보입니다. 원시 리터럴만 든 `enum`이 있으면 기존 enum·radio 정의를 union에도 엽니다.
- 플러그인 계약: 목록의 형 값이나 `undefined`를 보내고, `null`은 nullable일 때 비우기로만 보냅니다. 초안은 입력이 듭니다. 목록 밖 값은 규칙 A가 받아 경고등을 켜고, 입력은 `valueTypeMismatch`로 알게 됩니다. 객체·배열 값은 제자리에서 바꾸지 않습니다.
- 이주: 자사 플러그인 넷의 `['number','integer']`는 `'number'`로 바꿉니다. mui 수 입력의 `type === 'integer'`는 스키마 형 필드를 읽게 고칩니다. union 항목 하나를 더하는 것은 권장입니다.

## 제안

### 오늘의 모습 (물음 1)
1. 입력 선택은 인라인 `FormTypeInput` → `formTypeInputMap` → Form의 정의 → 외부 Provider의 정의 → `PluginManager` 목록 순서입니다(`src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts:32-57`). `PluginManager` 목록은 [등록한 플러그인들의 정의(나중 것이 앞), 코어 기본 정의]를 이은 한 목록입니다(`src/app/plugin/PluginManager.ts:40,77-79`). 그래서 플러그인 시험에 걸리지 않은 노드는 코어 기본 정의로 떨어집니다.
2. Hint는 `{ type: node.schemaType, path, required, nullable, jsonSchema, format, formType }`입니다(`useFormTypeInput.ts:69-77`). 입력 prop `type`도 `node.schemaType`입니다(`SchemaNodeInput.tsx:124`, `src/types/formTypeInput.ts:47`). 반면 `node.type`은 `integer`를 뺀 종류입니다(`AbstractNode.ts:77`). 같은 이름 `type`이 두 뜻으로 쓰이는 셈입니다.
3. 시험 객체는 키마다 `===`로 비교하고, 시험 값이 배열이면 `indexOf`로 "그중 하나"를 봅니다(`src/helpers/formTypeInputDefinition/formTypeInputDefinitions.ts:44-58`). 키 목록을 검사하지 않으므로 모르는 키도 조용히 비교합니다.
4. 자사 UI 플러그인 넷(antd5·antd6·antd-mobile·mui)의 시험이 읽는 Hint 필드는 `type`, `format`, `formType`, `jsonSchema.enum`, `jsonSchema.items`뿐입니다. `nullable`·`required`·`path`를 읽는 시험은 없습니다. 예: `FormTypeInputNumber` `{type:['number','integer']}`(antd5 `formTypeInputs/FormTypeInputNumber.tsx:61-63`, mui `:119-121`), `RadioGroup` `type==='string'||'number'||'integer'`(antd5 `FormTypeInputRadioGroup.tsx:86`, mui `:125`), `StringEnum` `type==='string' && jsonSchema.enum?.length`(mui `FormTypeInputStringEnum.tsx:126-127`), 날짜 계열 `{type:'string', format:'date'}`(antd5 `FormTypeInputDate.tsx:69-72`).
5. 입력 구성 요소 안에서 prop `type`을 읽는 곳은 mui 수 입력 하나입니다. `type === 'integer'`로 `parseInt`와 `step`을 정합니다(mui `FormTypeInputNumber.tsx:29,81,109`). 플러그인 가운데 `nullable`이나 `jsonSchema.type`을 읽는 입력은 없습니다.
6. 오늘은 `['string','number']`에 대해 `extractSchemaInfo`가 `null`을 돌려주고(`src/helpers/jsonSchema/extractSchemaInfo/extractSchemaInfo.ts:25-29`), 팩토리가 `UNKNOWN_JSON_SCHEMA`를 던집니다(`src/core/nodes/schemaNodeFactory.ts:115-124`). 그러니 union Hint를 본 플러그인은 아직 없습니다.
7. 오늘의 규칙에 union을 그대로 올렸을 때 생기는 일:
   - (a) `hint.type`이 배열이면 모든 객체 시험이 조용히 빗나갑니다. `'string' !== [...]`이고 `indexOf(배열) === -1`이기 때문입니다. 그 결과 union은 늘 코어 기본 정의로 떨어지는데, 이는 선언된 규칙이 아닙니다.
   - (b) `hint.type`에 첫 형을 주면 `['number','string']`에 수 입력이 뽑힙니다. 사실상 형을 고르는 UI가 되어 BLUEPRINT-033의 목적에 어긋납니다(`reports/t1a-union-consistency.md:141`).
   - (c) `hint.type = 'union'`이면 플러그인 시험은 하나도 맞지 않고, 코어 기본 정의가 받아야 합니다(`t1a:140`).

### Hint 모양 (물음 2)
8. `Hint.type`은 `node.type`입니다: `'string'|'number'|'boolean'|'null'|'object'|'array'|'virtual'|'union'`. 늘 스칼라이고 `'integer'`는 싣지 않습니다(NODE-015, NODE-041, BLUEPRINT-032).
9. `Hint.schemaType`은 `node.schemaType`입니다. Lens A가 이름을 유지하고 형만 넓히기로 했고, 뜻은 A의 out-A.md 제안 3–7을 따릅니다.
   - 실효값이며 `'null'`은 넣지 않습니다(`nullable`이 맡음).
   - union이 아닌 노드에서는 오늘과 같은 스칼라입니다(`['integer','null']`이면 `'integer'`).
   - union에서만 배열입니다: 길이 2 이상, 저자 순서, 중복 제거, `integer` 보존. `integer`와 `number`가 함께 있으면 `number`로 흡수합니다.
   - 불변식: `isArray(schemaType) === (type === 'union')`.
   - 청사진이 슬롯마다 한 번 계산해 freeze하므로 노드가 사는 동안 같은 참조입니다.
   - 자기 `type` 없는 원시 `anyOf`·`oneOf` 슬롯은 게이트 없는 분기들의 `type`을 모아 싣습니다(소유자 결정 "나").
   - BLUEPRINT-033이 말하는 "목록은 `node.jsonSchema.type`에서 읽는다"의 유효 스키마 `type`에서 `null`을 뺀 것과 같아야 합니다. 입력은 원문 `jsonSchema.type`이 아니라 이 필드를 읽습니다.
10. `Hint.nullable`은 `node.nullable`입니다(그대로).
11. `path`·`required`·`jsonSchema`·`format`은 그대로입니다. `formType`은 새 설계에서 `presentation.formType`을 읽습니다(CONTROLS-011, CONTROLS-051).
12. `FormTypeInputProps`의 `type`·`schemaType`·`nullable`은 Hint와 같은 값입니다. `valueTypeMismatch` 칸이 더해집니다(SURFACE-052). 규칙은 한 줄입니다: 노드, Hint, 입력 prop에서 같은 이름은 같은 값입니다.

### 시험 객체의 대조 규칙 (물음 3)
13. 시험 객체의 키는 `type`·`schemaType`·`path`·`required`·`nullable`·`format`·`formType` 일곱입니다. 규칙은 하나입니다: 시험 값이 스칼라면 `===`, 배열이면 "그중 하나"입니다(오늘 규칙 그대로, `formTypeInputDefinitions.ts:50-54`).
14. Hint 값이 배열인 경우는 union 노드의 `schemaType` 하나뿐입니다(9번의 불변식). 이 값은 어떤 시험 값과도 맞지 않습니다. 이것은 13번 규칙을 그대로 적용한 결과(`===`도 `indexOf`도 배열을 맞히지 않음)이고 새 규칙이 아닙니다. 그래서 `{schemaType:'integer'}`는 nullable을 포함한 모든 정수 노드를 잡고 union은 잡지 않습니다. union을 목록으로 가르는 일은 함수 시험이 맡습니다(18번). 같은 배열 리터럴이 키에 따라 "그중 하나"와 "집합이 같음"이라는 두 뜻을 갖지 않게 하려는 것입니다.
15. 정규화 때 일곱 키 밖의 키나 `type`의 `'integer'`를 만나면 등록 시점에 개발 모드 경고를 한 번 냅니다(가칭 `FORM_TYPE_TEST_INVALID`). 런타임 동작은 오늘처럼 "그 조건은 맞지 않음"입니다. 조용히 빗나가지 않게 하려는 것입니다(공통 §1). `type`의 `'integer'`에 대한 경고는 `schemaType` 키로 옮기라고 안내합니다.
16. `FormTypeTestObject.type`의 형은 `SchemaNodeType | SchemaNodeType[]`입니다(`'union'` 포함, `'integer'` 없음). `FormTypeTestObject.schemaType`의 형은 `JSONSchemaType | JSONSchemaType[]`입니다(`'null'` 없음). 여기서 배열은 "그중 하나"라는 뜻이고 union 목록이 아닙니다.
17. 다섯 가지 예. 노드 N1=`['string','number']`(union), N2=`['string','number','null']`(union, nullable), N3=`['object','string']`(union, terminal), N4=`['string','null']`(nullable string):

| 시험 | N1 | N2 | N3 | N4 | 읽는 법 |
|---|---|---|---|---|---|
| `{type:'string'}` | ✗ | ✗ | ✗ | ✓ | 종류가 string인 노드만 |
| `{type:['string','number']}` | ✗ | ✗ | ✗ | ✓ | "string 종류 또는 number 종류"이고 union이 아님(함정, 문서에 적음) |
| `{type:'union'}` | ✓ | ✓ | ✓ | ✗ | 모든 union |
| `{type:['string','number','null']}` | ✗ | ✗ | ✗ | ✓ | `'null'`은 null 종류 노드이고 nullable이 아님 |
| `{type:'object'}` | ✗ | ✗ | ✗ | ✗ | N3은 object 노드가 아님. JSON 편집기는 `{type:'union'}`에 함수 시험을 더해 고름 |
| (덧붙임) `{schemaType:'string'}` | ✗ | ✗ | ✗ | ✓ | union의 `schemaType`은 배열이라 맞지 않음. N4의 `schemaType`은 `'string'` |

18. union을 목록으로 가르는 방법은 함수 시험입니다. 예: `({type, schemaType}) => type === 'union' && schemaType.includes('object')`. `type === 'union'`이면 A의 판별 타입이 `schemaType`을 배열로 좁힙니다.

### 우선순위 (물음 4)
19. 순서는 그대로이고 union 전용 층은 두지 않습니다. 인라인 `presentation.FormTypeInput`은 union에서도 최우선이고, `null`이면 입력을 그리지 않습니다(`useFormTypeInput.ts:33`, NODE-028).
20. union은 행이 `terminal` 하나입니다. 인라인 입력이 있든 없든 전략은 바뀌지 않고, `options.terminal: false`는 ERROR-200입니다(NODE-042, 소유자 결정 (c)). `formTypeInputMap`의 경로 키가 union 슬롯 아래(`/slot/key`)를 가리키면 그런 노드가 없으니 맞지 않습니다(NODE-020). 이는 어느 터미널에서나 오늘과 같은 동작입니다.
21. 이주 전 플러그인에서는 union이 플러그인 정의를 모두 지나 코어 기본 정의로 떨어집니다(1번). 예측은 할 수 있지만 스타일이 없는 입력이 됩니다. 그래서 자사 플러그인은 같은 릴리스에 union 항목을 둡니다(40번).

### 기본 입력 (물음 5)
22. `formTypeDefinitions`에 새 구성 요소는 두지 않습니다. union 항목은 문자열 입력(`FormTypeInputString`)을 감싸 초안 규칙과 표시 규칙을 더한 것이고, 시험은 `{type:'union'}`입니다(BLUEPRINT-033). `FormTypeInputStringDefinition`(`{type:'string'}`) 바로 앞에 둡니다.
23. 편집 모드: 값이 `undefined`·`null`·문자열·수·불리언이면 글 상자를 보입니다. 표시는 `String(value)`이고, `undefined`와 nullable 노드의 `null`은 빈 칸입니다.
24. 초안 규칙(나): 입력 글이 바뀔 때마다 규칙 A를 미리 돌립니다(노드에 쓰지 않는 순수 함수, 30번).
   - 빈 칸이면 `undefined`를 보냅니다(REACT-027).
   - 목록의 한 형이 되면 그 값을 보냅니다. `string`이 목록에 있으면 글 그대로입니다.
   - 되지 않으면 보내지 않고 초안으로 듭니다. 초안이 남은 채 흐려지면 표시를 노드 값으로 되돌립니다.
   - 입력기 조합 중에는 보내지 않습니다.
   - 글은 문자열이므로 규칙 A의 모호 경우(수 1/0과 `['string','boolean']`)는 생기지 않습니다.
25. 읽기 전용 모드: 값이 객체나 배열이면(목록에 있든 없든) `JSON.stringify(value)`를 읽기 전용으로 보이고 비우기 단추를 둡니다. 비우기는 nullable이면 `null`, 아니면 `undefined`를 보냅니다(REACT-027, 소유자 결정 (c)). 문자열화 결과는 값 참조로 메모합니다. 던지면(순환, BigInt) 무효 표지만 보입니다.
26. `valueTypeMismatch`가 참이면 두 모드 모두 `aria-invalid`와 무효 표지를 붙입니다. 경고등이 켜진 값을 빈 칸처럼 그리지 않습니다(REACT-027, SURFACE-052).
27. `enum`: 기본 enum·radio 정의의 시험을 `type === 'union' && enum 원소가 모두 원시값(문자열·수·불리언·null)`까지 넓힙니다. 두 정의는 이미 문자열화한 옵션에서 원래 리터럴을 찾아 보내므로(`FormTypeInputStringEnum.tsx:55-59`, `FormTypeInputStringRadio.tsx:49-54`) 구성 요소는 바뀌지 않습니다. 이것이 없으면 `['number','string']`에 `enum:[1,'a']`일 때 기본 입력으로는 `1`을 칠 수 없습니다. `"1"`은 문자열로 남아 검증기가 기각합니다(`t1a:35`). 이는 `drafts/union-design-decision.md:45`의 "enum 정의는 받지 않음"을 뒤집는 것입니다(대안 참고).
28. `const`와 `format`: `const`는 어느 기본 입력도 읽지 않습니다(오늘과 같음). `format`은 문자열 입력이 이미 하는 만큼만 씁니다(`password`·`email`이면 `<input type>`, `FormTypeInputString.tsx:22-26`). 날짜 정의(`{type:'string', format:[…]}`)는 union을 받지 않습니다.
29. 기본 입력이 약속하지 않는 것:
   - `string`이 목록에 있을 때 다른 원시 형을 만드는 것. 글은 문자열로 남습니다. 규칙 A와 목적을 따른 결과입니다.
   - 객체·배열을 만들거나 편집하는 것.
   - 편집 모드에서 `null`을 만드는 것.
   - 문자열 표기가 겹치는 enum 리터럴(`[1,"1"]`)을 가르는 것.
   - `const`·`format`의 의미.
   - 모양과 접근성. 기본 입력은 UI 플러그인이 없을 때의 최소 구현입니다(BLUEPRINT-033 보충).

### union 입력이 기댈 수 있는 것 — 플러그인 작성자 계약 (물음 6)
30. 읽을 것: `type === 'union'`, `schemaType`(목록, 순서에 뜻 없음), `nullable`, `value`, `valueTypeMismatch`, `required`, `jsonSchema`(`enum`·`format` 등은 입력 재량으로 읽음), `readOnly`·`disabled`. 이 밖에 규칙 A를 미리 보는 순수 함수 하나(가칭 `resolveUnionValue(schemaType, value) → { value, mismatch }`)를 받습니다. 행의 `interpret`와 같은 함수로, 순수하고 던지지 않으며 멱등입니다(18C-40 (6)).
31. 보낼 것: JSON 형이 목록에 있는 값이나 `undefined`입니다(BLUEPRINT-033, REACT-027). `integer` 멤버십은 Lens D의 정의를 따릅니다. `null`은 nullable일 때 비우기 조작으로만 보냅니다. 빈 칸은 `undefined`입니다.
32. 초안: 치다 만 글자와 입력기 조합 중인 글자는 입력이 듭니다. 흐려지면 노드 값으로 되돌립니다(REACT-027).
33. 목록 밖 값을 보내면 오류도 아니고 버려지지도 않습니다. 규칙 A가 받습니다. 받아 줄 형이 정확히 하나면 그 형으로 바꾸고, 아니면 그대로 두고 경고등을 켭니다(`VALUE_TYPE_MISMATCH`, 켜질 때마다 한 번, ERROR-186). 입력은 다음 렌더의 `valueTypeMismatch` prop으로 이를 압니다(SURFACE-052). 새 이벤트는 없습니다(18C-40 (1)).
34. `valueTypeMismatch === false`는 "값이 받아 주는 JSON 형이다"라는 뜻일 뿐, 검증 통과가 아닙니다(공통 §2).
35. 객체·배열 멤버(JSON 편집기): 통값을 보냅니다. 받은 `value`는 불변으로 다룹니다. 바꿀 때는 새 참조를 보내고, 제자리에서 바꾼 뒤 같은 참조를 보내지 않습니다. 코어는 멤버십을 `typeof`와 `Array.isArray`로만 보고 복사하지 않으므로(소유자 결정 (c)), 제자리 변경은 쓰기로 잡히지 않습니다. 자식 노드가 없으므로 `ChildNodeComponents`는 빈 배열입니다.
36. 입력이 기대지 말아야 할 것: 원문 `jsonSchema.type`(anyOf 슬롯에는 없을 수 있음), 목록의 순서, 코어가 사용자가 뜻한 형을 골라 준다는 가정.

### 이주 (물음 7)
37. 코어 타입: `Hint.type`과 `FormTypeInputProps.type`은 `node.schemaType`에서 `node.type`으로 바뀝니다. `Hint.schemaType`과 `FormTypeInputProps.schemaType`이 새로 생기고, `FormTypeTestObject.type`의 형이 바뀝니다(16번). 기본 수 정의 `{type:['number','integer']}`(`src/formTypeDefinitions/FormTypeInputNumber.tsx:44`)는 `{type:'number'}`가 됩니다.
38. 자사 UI 플러그인 넷:
   - `['number','integer']` 시험(antd5 Number·Slider, antd6 Number·Slider, antd-mobile Number, mui Number)을 `{type:'number'}`로 바꿉니다. 정수만 원하면 `{schemaType:'integer'}`를 씁니다. 그대로 두면 `'integer'`는 절대 맞지 않을 뿐이고 동작은 같지만, 15번의 경고가 나고 16번의 형 때문에 컴파일 오류가 납니다.
   - RadioGroup·Slider 함수 시험의 `type === 'integer'` 절은 죽은 조건이 되고, 좁혀진 형에서 TS2367로 드러나므로 지웁니다.
39. mui `FormTypeInputNumber.tsx:29,81,109`의 `type === 'integer'`는 `schemaType === 'integer'`로 바꿉니다. Lens A에 따르면 조용히 깨지지 않습니다. 종류별 props에서 `type`이 리터럴 `'number'`로 좁혀지므로, `'integer'`와 비교하는 코드는 TS2367 컴파일 오류가 됩니다. `schemaType`에 `'null'`이 없으므로 nullable 정수에서도 이 비교가 맞습니다.
40. 권장: 플러그인마다 union 항목 하나를 둡니다. 자기 문자열 입력을 30번의 함수로 감싸 초안 규칙을 지키게 합니다. 날것의 문자열 입력을 그대로 `{type:'union'}`에 걸면 빈 칸에 `""`를 보내 `['number','boolean']`에서 경고등이 켜집니다(`t1a:106`). 이 일은 LANDING-151의 PR-7 이주 목록에 더합니다.

## 대안과 버린 이유
- **X안: `hint.type`을 오늘처럼 `schemaType`으로 두고 union에 `'union'`을 싣기**(`t1a:143`). 플러그인은 한 줄도 안 바뀌어 가장 덜 깨집니다. 그러나 `node.type`(`'number'`)과 `hint.type`(`'integer'`)이 같은 이름으로 다른 값을 갖는 함정이 남습니다. 또 `'union'`은 JSON Schema 형이 아닌데 `schemaType`에 들어가 소유자가 말한 "스키마 원본 형" 필드와 뜻이 겹칩니다. 파괴적 변화가 허용되었으니 이름의 일관성을 택했습니다.
- **`hint.type`에 목록 배열을 싣기**: 7(a)대로 모든 객체 시험이 조용히 빗나갑니다.
- **첫 형을 싣기(rjsf 방식)**: 7(b)대로 형 고르기 UI가 되어 BLUEPRINT-033의 목적과 어긋납니다.
- **정수 비트를 따로 두기**: A가 필드 모양(비 union은 `'null'` 없는 스칼라)으로 풀었으므로 필요 없습니다. `{schemaType:'integer'}` 한 줄로 정수를 가릅니다.
- **시험 객체에 배열 비교 규칙 더하기**(`schemaType` 키를 집합 같음이나 포함으로 비교): 같은 배열 리터럴이 `type` 키에서는 "그중 하나"이고 `schemaType` 키에서는 "집합"이 되어 예측할 수 없습니다. 원하는 뜻(같음, 포함, 부분집합)도 입력마다 달라 한 규칙으로 닫히지 않습니다. 함수 시험 한 줄이 더 명확합니다.
- **union+enum에 문자열 입력만 쓰기**(`drafts/union-design-decision.md:45`): 선언된 수 리터럴을 기본 입력으로 칠 수 없고 검증기가 기각합니다. `type:'string'`+`enum`이 선택 상자를 받는 것과도 어긋납니다. 기존 구성 요소가 이미 원래 리터럴을 보내므로 비용이 거의 없습니다.
- **규칙 A 미리보기 없이 입력이 전부 보내고 경고등에 맡기기**: 소유자가 정한 초안 규칙(나)과 어긋나고, 치는 도중 경고가 쏟아집니다.
- **객체·배열 값에 `[Complex Value]` 표지**(antigravity): 값을 볼 수 없습니다. codex 안(읽기 전용 `JSON.stringify`)이 이미 권장되었습니다(`drafts/union-design-decision.md:95`).

## 다른 렌즈에 넘기는 요구
- **Lens A**: 합의가 끝났습니다(A의 회신).
  - 이름은 `schemaType`을 유지합니다.
  - 값은 실효값이고 freeze한 같은 참조이며, `'null'`을 빼고, union일 때만 배열입니다.
  - 정수 여부는 필드 모양으로 풉니다(비 union은 스칼라 `'integer'`).
  - 1:1 미러에 동의했습니다.
  - 남은 요구 둘: 9번의 불변식 `isArray(schemaType) === (type === 'union')`을 타입에도 싣는 것(`type === 'union'`으로 좁히면 `schemaType`은 배열, `value`는 목록 형들의 합집합), 그리고 `SchemaNodeType`에 `'union'`을 넣는 것입니다.
- **Lens D**: 규칙 A를 쓰기 없이 돌리는 순수 함수(30번)의 의미. 특히 `integer` 멤버십과 결과가 같으면 하나로 세는 규칙, `NaN`·`±Infinity`. 입력과 노드가 같은 함수를 써야 초안 판정과 쓰기 결과가 어긋나지 않습니다.
- **Lens C**: 자기 `type` 없는 anyOf 슬롯과 `allOf` 병합 뒤에도 유효 스키마의 `type`과 스키마 형 필드가 같은 값이게 해 주십시오. 객체·배열이 든 union 슬롯의 `properties`·`items` 안에 있는 `presentation.FormTypeInput`은 그릴 자리가 없으니 개발 모드 경고로 다뤄 주십시오(codex 권장, 슬롯 안의 form 전용 키).
- **검증기 변이(보류 결정)**: B가 필요한 것은 "경고"가 아니라 "거부하거나 그 인스턴스만 복사"입니다. 객체·배열 union 값은 참조째 입력의 `value`로 가므로, `useDefaults`·`removeAdditional`·`coerceTypes`가 제자리에서 바꾸면 쓰기 없이 입력 표시가 바뀌고 커밋과 어긋납니다(35번의 불변 가정이 깨짐).
- **혼합 `oneOf`·`anyOf`(보류)**: 이 제안은 `node.type`만 봅니다. 혼합 분기가 union 터미널이 되면 B 규칙은 그대로 적용되고 `schemaType`에 모은 목록이 실립니다. variant 호스트가 되면 union이 아니므로 B에 영향이 없습니다. B는 어느 쪽에도 제약을 두지 않습니다.

## 비용 (속도·메모리·구현 크기)
- **선택**: Hint는 노드마다 `useMemo` 안에서 한 번 만듭니다(`useFormTypeInput.ts:29,69`). 필드 하나(참조)를 더 읽을 뿐입니다. 시험은 오늘처럼 정의 수에 선형입니다. enum 원시값 검사는 선택할 때 enum 길이만큼 한 번이고, 결과는 노드 단위로 메모됩니다.
- **등록**: 키 검사와 `'integer'` 경고는 정규화할 때 시험 객체마다 키 수만큼 한 번 돕니다. 렌더 경로에는 비용이 없습니다.
- **기본 union 입력**: 초안용 상태 하나(`useState`)를 둡니다. 키 입력마다 규칙 A를 미리 돌리는데, 목록이 k≤6이고 변환이 상수 시간이라 O(k)입니다. `JSON.stringify`는 값 참조가 바뀔 때만 O(값 크기)이고 참조로 메모합니다.
- **메모리**: `schemaType` 배열은 청사진 노드마다 하나를 공유합니다. 렌더마다 할당하지 않습니다.
- **구현 크기**:
  - 코어: 타입 셋(`Hint`, `FormTypeTestObject`, `FormTypeInputProps`), `getHint` 한 줄, 정규화 경고, 기본 union 감싸개 하나(약 60–80줄), enum·radio 시험 두 줄, 수 정의 시험 한 줄.
  - 플러그인: 시험 6–10곳, mui 수 입력 3줄, union 항목(선택) 플러그인마다 하나.

## 실패 장면 (이 제안이 틀렸다면 어떻게 드러나는가)
- 작성자들이 `{type:['string','number']}`로 union을 잡으려 하는 일이 잦다면, 스토리와 이슈에서 "union이 기본 입력으로 떨어진다"가 반복됩니다. 그때는 함수 시험 도우미나 union 전용 시험 키가 필요하다는 뜻입니다.
- 서드파티 플러그인이 `{type:'integer'}` 전용 입력을 쓰고 있었다면 그 입력이 더는 뽑히지 않습니다. 15번의 경고가 없으면 조용한 퇴행이 됩니다. 경고가 실제로 나는지 PR-7 시험으로 확인해야 합니다.
- 30번의 함수를 플러그인이 쓰지 않으면 입력마다 초안 판정이 달라집니다. 빈 칸 `""` 때문에 경고등이 켜지거나, 입력 시 받아들인 글이 노드에서 다른 형이 됩니다. 입력의 `onChange` 인자와 노드 값을 비교하는 시험이 이를 잡습니다.
- JSON 편집기가 값을 제자리에서 바꾸면 화면은 바뀌었는데 `dirty`와 방출은 그대로입니다. 검증기 변이를 "경고"로만 정하면 같은 증상이 검증기 쪽에서 납니다.
- 9번의 불변식(`isArray(schemaType) === (type === 'union')`)이 어느 경로에서 깨지면 14번의 "union은 `schemaType` 시험에 맞지 않음"도 깨집니다. 예를 들어 청사진이 접힌 한 원소 목록을 배열로 두는 경우입니다. 그러면 비 union 노드가 `schemaType` 객체 시험에서 조용히 빠집니다. 청사진 시험에 이 불변식을 넣어야 합니다.

## 소유자가 정해야 할 것
1. **27번(union+원시 enum에 기본 enum·radio 정의 열기)**: 소유자께서 검토하신 요약(`drafts/union-design-decision.md:45`)의 "enum 정의는 받지 않음"을 뒤집습니다. 원리(일관성, 선언된 리터럴에 닿을 수 있음)로는 뒤집는 쪽이 맞지만, 이미 보신 문장이라 확인을 받습니다.
2. **30번 규칙 A 미리보기 함수를 공개 표면에 더할지**: 자사 플러그인 넷이 소비자이므로 내보낼 근거는 있습니다(공개 계약: 소비자가 있는 것만 내보냄). 다만 공개 표면 수(SURFACE-058)가 늘어납니다. 내보내지 않으면 기본 입력 안에만 두고, 플러그인은 각자 규칙 A를 다시 짜야 합니다.
3. **검증기 변이**: 입력 바인딩은 "거부하거나 그 인스턴스만 복사"를 필요로 합니다. 경고만으로는 객체·배열 union 입력의 표시와 커밋이 어긋납니다. 보류 중인 결정에 이 요구를 더해 주십시오.
