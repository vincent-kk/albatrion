# Lens A (노드 겉면·형 체계) — 제안

## 요약 (5줄 이내)
- 필드는 셋입니다. `type`(종류, 단일 문자열에 `'union'` 추가), `nullable`(그대로), `schemaType`(이름은 그대로 두고 **넓힘**: 단일 문자열이거나, union일 때만 읽기 전용 배열)입니다. 새 이름을 더하지 않습니다.
- `schemaType`은 저자가 쓴 글자를 그대로 옮긴 값이 아니라 **청사진이 노드마다 한 번 계산하는 정적 값**입니다. `null`은 빼고, `integer`는 남기고, 순서는 저자 순서를 따르며, 중복은 없앱니다. 그래서 union이 아닌 모든 노드에서는 오늘 값과 같고, `Array.isArray(node.schemaType) ⇔ node.type === 'union'`이 늘 성립합니다.
- `node.jsonSchema.type`은 겹쳐 입힌 뒤의 유효 스키마 값이라 `then`의 좁힘을 따라 바뀝니다(검증 전용). 그래서 입력이 읽을 목록은 `jsonSchema.type`이 아니라 `schemaType`이어야 합니다.
- `UnionNode`는 `strategy: 'terminal'`, `children: null`인 판별 합집합 멤버입니다. `InferSchemaNode`는 `null`을 빼고 `integer`를 접은 집합이 둘 이상일 때 `UnionNode`로 사상합니다(`type` 배열과 형 없는 `anyOf`/`oneOf` 모두 해당).
- `InferValueType`에서는 `NormalizeType`을 지웁니다. 오늘 이 래퍼 때문에 `as const` `type` 배열이 전부 `any`가 됩니다(탐침으로 확인). 값에서 스키마를 거꾸로 추론하는 `InferJSONSchema`도 분배되지 않게 고칩니다. 오늘 `FormTypeInputProps<string|number>`의 `node`는 `StringNode | NumberNode`로 잘못 나옵니다(탐침으로 확인).

## 제안

**필드**
1. `node.type`은 종류입니다: `'string'|'number'|'boolean'|'null'|'object'|'array'|'virtual'|'union'`. 단일 문자열이고 노드가 사는 동안 바뀌지 않습니다(NODE-002, NODE-041, BLUEPRINT-032; 오늘 `PKG/src/core/nodes/AbstractNode/AbstractNode.ts:77`).
2. `node.nullable`은 그대로 둡니다. union을 포함한 모든 종류에서, 세 표기 가운데 하나라도 있으면 `true`입니다: 목록에 든 `'null'`, `nullable: true`, 게이트 없는 null 분기(BLUEPRINT-032 보충, `adr/0005…:62`; 오늘 `PKG/src/helpers/jsonSchema/extractSchemaInfo/extractSchemaInfo.ts:24-35`). 청사진이 정적으로 정하고, 노드가 사는 동안 바뀌지 않습니다.
3. `node.schemaType`은 이름을 유지하고 형을 `JSONSchemaType | UnionSchemaType`으로 넓힙니다. 새 이름을 더하지 않습니다. 이 필드는 이미 계획된 공개 겉면의 식별 게터 14개 가운데 하나이고(`ARCH/reviews/raw-round17-node-structure.md:136`), 오늘 문서도 "Original schema type as defined in JSON Schema"라고 적습니다(`AbstractNode.ts:79-83`). 소유자가 말한 "스키마의 원본 타입"이 바로 이 필드입니다. 같은 사실에 이름을 둘 두지 않는다는 규칙도 근거입니다(NODE-011, SURFACE-056 보충).
4. `schemaType`은 저자의 한 칸을 그대로 옮긴 값이 아니라 계산된 값입니다. 청사진이 그 노드의 종류를 정한 선언들(NODE-042가 세는 선언)에서 한 번 계산합니다. 형 없는 원시 `anyOf`/`oneOf`는 게이트 없는 분기 `type`들을 모아서 계산합니다(소유자 결정 "나"). 까닭: 형 없는 `anyOf`에는 옮길 글자가 없습니다. 또 `then`/`allOf`의 좁힘은 검증 전용이라(소유자 결정) 유효 스키마의 `type`이 노드의 목록과 달라질 수 있습니다.
5. 정규화 규칙은 넷입니다. (a) `'null'`은 빼고 `nullable`이 맡습니다. 같은 노드가 세 가지 null 표기에서 같은 `schemaType`을 가져야 하기 때문입니다. (b) `'integer'`는 남깁니다. 단 `integer`와 `number`가 함께 있으면 `number` 하나로 흡수합니다(소유자 결정: `['integer','number']`는 수 규칙). (c) 중복을 없애고 처음 나온 자리의 순서를 따릅니다. (d) 남은 원소가 하나면 문자열, 둘 이상이면 배열입니다. `['null']`처럼 `null`만 있으면 `'null'`입니다(오늘 `extractSchemaInfo.ts:26-27`과 같음).
6. 불변식은 `isArray(node.schemaType) === (node.type === 'union')`입니다. 5(d)에서 바로 나옵니다. 그래서 union이 아닌 노드의 `schemaType`은 오늘 값과 한 글자도 다르지 않습니다(`'integer'` 보존 포함, 오늘 `PKG/src/core/nodes/schemaNodeFactory.ts:143`).
7. 순서는 저자가 쓴 순서입니다. core는 순서를 읽지 않습니다(규칙 A, BLUEPRINT-033). UI 플러그인은 이 순서를 관행인 "첫 형" 단서로 쓸 수 있습니다(rjsf·JSON Forms의 관행, `S/drafts/union-design-decision.md` §2-1). 한 노드의 선언들이 순서만 다르면 NODE-042의 전순서에서 먼저 나온 선언을 따릅니다.
8. BLUEPRINT-033의 "목록은 `node.jsonSchema.type`에서 읽는다"를 "`node.schemaType`에서 읽는다"로 바꿉니다. `node.jsonSchema`는 켜진 덧씌움 집합마다 메모되는 유효 스키마입니다(BLUEPRINT-021). 그래서 `then`이 목록을 좁히면 `jsonSchema.type`은 좁아지지만 노드는 union으로 남습니다. 두 필드의 역할은 이렇게 나뉩니다: `schemaType`은 노드가 받는 형, `jsonSchema.type`은 지금 검증에 쓰이는 형입니다.

**공개 형**

9. 종류별 `schemaType` 형을 좁힙니다: `StringNode` `'string'`, `NumberNode` `'number'|'integer'`, `BooleanNode` `'boolean'`, `NullNode` `'null'`, `ObjectNode` `'object'`, `ArrayNode` `'array'`, `VirtualNode` `'virtual'`, `UnionNode` `UnionSchemaType`. 오늘은 모든 노드가 넓은 `JSONSchemaType`입니다(`AbstractNode.ts:83`). 판별자 `type`으로 좁히면 이 칸도 함께 좁혀집니다(NODE-015, NODE-046).
10. `UnionMemberType = 'string'|'number'|'integer'|'boolean'|'object'|'array'`로 두고, `UnionSchemaType = readonly [UnionMemberType, UnionMemberType, ...UnionMemberType[]]`로 둡니다. 길이가 2 이상이라는 사실을 형이 말합니다. `object`·`array`가 드는 것은 소유자 결정 (c) 때문입니다.
11. `UnionNode`는 공개 판별 합집합의 멤버이고 모양은 다음과 같습니다: `type: 'union'`, `strategy: 'terminal'`, `schemaType: UnionSchemaType`, `nullable: boolean`, `children: null`(터미널 노드의 오늘 동작과 같음, `AbstractNode.ts:134`), 공통 멤버 약 57개(SURFACE-058). `valueTypeMismatch`를 판별자로 한 두 멤버로 나뉩니다(SURFACE-052). `false`이면 `value: string | number | boolean | ObjectValue | ArrayValue | undefined`에, null 처리는 다른 종류와 같은 규칙을 씁니다. `true`이면 `value: unknown`입니다. 값을 종류 매개변수로 제네릭하게 두지 않습니다. `StringNode`·`NumberNode`도 제네릭이 아니고, 입력은 값 형을 `FormTypeInputProps`의 `Value`로 받기 때문입니다(`PKG/src/types/formTypeInput.ts:30-35,62-65`).
12. 가드 `isUnionNode(x) = isSchemaNode(x) && x.type === 'union'`을 더해 공개 가드는 열이 됩니다(NODE-041). `isTerminalNode(unionNode)`는 참이고 `isBranchNode(unionNode)`는 거짓입니다. 두 가드가 `strategy`를 보기 때문입니다(NODE-015; 오늘 `PKG/src/core/nodes/filter.ts:75,195`). "목록에 X가 있는가"를 묻는 공개 가드는 두지 않습니다. `isUnionNode(n) && n.schemaType.includes('integer')`로 충분하고, 쓰는 곳이 없는 것은 내보내지 않는다는 규칙을 따릅니다(seiri public-contract §1).
13. `InferSchemaNode<Schema>`는 union 판정을 기존 분기들보다 먼저 합니다. 목록 L은 `type`이 배열이면 그 원소들이고, `type`이 없으면 `anyOf`/`oneOf` 분기들의 `type`입니다. `null`을 빼고 `integer`를 `number`로 접은 집합을 형 수준의 `IsUnion`으로 보아 둘 이상이면 `UnionNode`, 하나면 그 종류, 비면 `NullNode`입니다. 이 사상을 형 탐침으로 확인했습니다. `['string','number']`·`['string','object']`·형 없는 `anyOf[string,number,null]`은 union이 되고, `['string','null']`은 string, `['integer','number']`는 number, `['object','null']`은 object, `anyOf[string,null]`은 string이 됩니다(`$TMPDIR/lensA/probe2.ts`, tsc 5.9 통과). NODE-046이 말하는 overload 선언의 형 인자로 이 사상을 씁니다.
14. `JSONSchemaWithVirtual`에 `UnionSchema`를 더합니다. 두 모양입니다: `type`이 `UnionMemberType | 'null'`의 읽기 전용 배열인 것과, `type` 없이 `anyOf`/`oneOf`가 필수인 것입니다. 문자열·수·객체·배열 키워드는 모두 선택입니다(검증 전용). 오늘 형 정의는 nullable 쌍만 받습니다(`/Users/Vincent/Workspace/albatrion/packages/winglet/json-schema/src/types/jsonSchema.ts:103-110,149-153`). 그래서 형을 붙인 스키마에는 `type: ['string','number']`를 쓸 수조차 없습니다.

**값 형**

15. `InferValueType`에서 `NormalizeType`(`PKG/src/types/value.ts:10-15`)을 지우고 winglet의 `InferValueType`에 그대로 넘깁니다. winglet은 이미 `readonly string[]`을 받고(`winglet/json-schema/src/types/value.ts` 끝의 `InferValueType` 제약), `ExtractPrimaryType`이 분배되어 원소들의 합집합을 만듭니다. 탐침 결과는 이렇습니다. 오늘 `{type:['string','number']} as const`와 `{type:['string','null']} as const`는 둘 다 `any`로 나옵니다. 래퍼를 지우면 `string|number`, `string|null`, `number|boolean`(`['integer','boolean']`), `string|boolean[]`(`['string','array']`+`items`), `string|null|({a?:number}&Record<string,any>)`(`['string','object','null']`+`properties`)이 나옵니다(`$TMPDIR/lensA/probe.ts`, `probe3.ts` v1). 두 코드는 같은 커밋 `9ad2528ec`에서 들어왔고, winglet 제약이 readonly를 받게 된 뒤로 래퍼는 남은 조각일 뿐입니다.
16. 형 없는 `anyOf`/`oneOf`의 값 형은 분기마다의 `InferValueType`을 합친 것으로 둡니다(schema-form 쪽 래퍼에 둡니다). 형 없는 `const`/`enum` 분기는 오늘처럼 `AnyValue`로 둡니다. 소유자가 추론 쪽을 고르면 `{const: X}`를 `X`로 바꾸는 한 줄로 따라갑니다.
17. `InferJSONSchema<Value>`(`PKG/src/types/jsonSchema.ts:41-80`)가 분배되지 않게 고칩니다. 값의 비-null 범주(string·number·boolean·object·array; `true|false`와 리터럴 합은 한 범주로 셉니다)가 둘 이상이면 `UnionSchema`로 사상합니다. 오늘은 `FormTypeInputProps<string|number>`의 `node`가 `StringNode|NumberNode`, `type`이 넓은 `JSONSchemaType`로 나옵니다(`probe3.ts` n1). union 입력을 짜는 저자가 `UnionNode`를 받지 못하는 셈입니다.

**입력 props**

18. `FormTypeInputProps.type`은 계속 `Node['schemaType']`입니다(`formTypeInput.ts:47`). union 노드에서는 `UnionSchemaType` 배열이고, `value`는 `Value | undefined`, `onChange`는 `SetStateFnWithOptions<Value | undefined>`입니다. `Value`가 목록 형들의 합(nullable이면 `| null`)이므로 입력 계약 "목록의 한 형 또는 없음"(BLUEPRINT-033, REACT-027)이 곧 형이 됩니다. 플러그인은 `isUnionNode(props.node)`나 `Array.isArray(props.type)`로 좁히고, 그 안에서 `typeof value`로 가지를 나눕니다. 입력 props의 `type`을 종류로 바꾸지 않는 까닭이 있습니다. mui `FormTypeInputNumber`가 이 칸으로 `'integer'`를 읽어 정수 파싱과 `step`을 정하기 때문입니다(`PLUG/schema-form-mui-plugin/src/formTypeInputs/FormTypeInputNumber.tsx:29,81,109`).
19. 이름 함정을 적어 둡니다. 입력 props와 `Hint`의 `type`은 `node.schemaType`이고, 렌더러 props의 `type`은 `node.type`입니다(`PKG/src/types/formTypeRenderer.ts:21` 대 `formTypeInput.ts:47`, `PKG/src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts:70`). 오늘부터 있는 차이이므로 두 JSDoc 첫 줄에 "`type` is `node.schemaType`, not `node.type`"을 적습니다(seiri agent-legible §3).

**같은 참조**

20. 노드가 사는 동안 같은 참조를 유지하는 것: `type`, `strategy`, `nullable`, `schemaType`. `schemaType` 배열은 청사진 슬롯마다 하나를 얼려(freeze) 두고, 그 슬롯에서 만든 모든 노드(배열 아이템 포함)가 공유합니다.
21. 켜진 덧씌움 집합이 바뀔 때만 바뀌는 것: `jsonSchema`. 집합이 같으면 같은 참조입니다(BLUEPRINT-021).
22. 커밋마다 바뀔 수 있는 것: `value`, `valueTypeMismatch`(VALUE-030). 객체·배열 값은 변환 없이 참조를 그대로 유지합니다(소유자 결정 (c)).

> **B와 조율한 뒤의 보정 (제안 18·19를 대체).** Lens B는 Hint와 입력 props가 노드 필드 이름을 1:1로 따르는 안을 냈습니다(`type` = `node.type`, `schemaType` = `node.schemaType`, `nullable` = `node.nullable`). A는 이 안을 받아들입니다. 이렇게 하면 오늘의 이름 함정(`useFormTypeInput.ts:70`, `SchemaNodeInput.tsx:124`)이 사라집니다. 이주할 곳은 mui `FormTypeInputNumber.tsx:29,81,109` 하나로, `type === 'integer'`를 `schemaType === 'integer'`로 바꾸면 됩니다. 종류별 props에서 `type`이 리터럴 `'number'`로 좁혀지므로 이 비교는 조용히 틀어지지 않고 TS2367 컴파일 오류로 드러납니다. 정수 여부를 읽는 비트는 따로 두지 않습니다. `null`을 뺀 `schemaType`만으로 nullable과 상관없이 읽을 수 있기 때문입니다(제안 5a).

## 대안과 버린 이유
- **새 필드 `jsonSchemaType`/`acceptedTypes`를 더하고 `schemaType`은 단일 문자열로 두기**: 버렸습니다. union 노드에서 `schemaType`에 넣을 값이 `'union'`(= `node.type`의 중복)이나 첫 형(거짓 정보)밖에 없습니다. union이 아닌 노드에서는 두 필드가 늘 같아집니다. 한 사실에 두 이름을 두는 셈입니다(NODE-011). 초안 §2-2의 "`schemaType`·힌트·시험 모두 `'union'`"도 같은 이유로 버립니다. 이 초안은 소유자의 최신 지시(스키마 형을 문자열이나 배열로 드러냄)보다 앞선 것입니다.
- **`schemaType`을 늘 배열로 두기(codex의 `acceptedTypes` 모양)**: 버렸습니다. 모든 플러그인의 시험 객체 `{type:'string'}`과 함수 시험 `type === 'string'`(예: `PLUG/schema-form-antd6-plugin/src/formTypeInputs/FormTypeInputTextarea.tsx:67-68`, antd5·antd-mobile·mui 전부)이 깨집니다. 균일하게 순회하는 이점은 `[].concat(t)` 한 줄로 얻을 수 있습니다.
- **저자 칸을 그대로 옮기기(`null` 포함, 슬롯별 원문)**: 버렸습니다. 같은 nullable string이 `['string','null']`이면 배열이 되고 `nullable: true`면 `'string'`이 되어, 같은 노드가 서로 다른 값을 냅니다. 오늘 nullable 노드의 `schemaType`(`'string'`)도 깨져 plugin 시험이 전부 어긋납니다. 형 없는 `anyOf`에는 원문 자체가 없습니다. 원문이 필요한 소비자는 찾지 못했습니다(`schemaType` 소비자 조사: `PKG/src` 16개 파일은 모두 내부이고, `PLUG/*/src`에는 0건).
- **정규화된 순서(사전식 등)**: 버렸습니다. 규칙 A는 순서를 읽지 않으므로 정규화해서 얻는 정확성이 없습니다. 반면 저자 순서를 버리면 플러그인이 쓸 수 있는 "첫 형" 단서가 사라집니다. 소유자의 "그대로"와도 맞습니다.
- **`UnionNode<Types>` 제네릭**: 버렸습니다. 형 수준에서 중복 제거·흡수·순서를 계산하는 비용이 크고, 입력은 값 형을 props의 `Value`로 받으며, 다른 종류 형과도 모양이 달라집니다.

## 다른 렌즈에 넘기는 요구
- **B(입력 바인딩)**: `Hint.type`은 `node.schemaType`을 그대로 비춥니다(배열이면 같은 참조). 시험 객체의 배열은 오늘처럼 "스칼라 가운데 하나"로 두어, 스칼라 시험이 union 노드와 우연히 맞지 않아야 합니다. 오늘 `formTypeTestFnFactory`의 `indexOf(배열)`은 -1이 되어 맞지 않습니다(`PKG/src/helpers/formTypeInputDefinition/formTypeInputDefinitions.ts` 끝). union 입력은 목록을 `jsonSchema.type`이 아니라 `schemaType`에서 읽습니다(제안 8).
- **C(청사진)**: 슬롯마다 `schemaType`을 제안 5의 규칙으로 한 번 계산해 얼리고, 노드는 그 참조를 받습니다. 한 노드의 선언들이 같은 종류 안에서 `integer`와 `number`로만 다르면 `number`로 합칩니다. 받는 집합의 합이 되도록 하는 것이고, 이것이 C의 충돌 규칙과 맞는지 C가 확인해야 합니다. BLUEPRINT-033의 "목록은 `node.jsonSchema.type`에서"를 고치는 것도 C가 합니다. 유효 스키마에 `type`을 써 넣지는 않습니다. 초안 §2-2의 "유효 스키마의 `type`에 싣는다"는 좁힘 예외와 부딪칩니다.
- **D(값 의미)**: 규칙 A의 "목록"은 `schemaType`에 `nullable`이면 `null`을 더한 것입니다. 정수 판정은 `schemaType`에 `'integer'`가 있고 `'number'`가 없을 때만 적용합니다. `valueTypeMismatch === false`는 "허용 JSON 형과 일치"일 뿐입니다.
- **검증기 변경 문제**: 이 렌즈는 "같은 값을 두 번 읽으면 같은 참조"를 보장해야 합니다. 그래서 `coerceTypes`·`useDefaults`·`removeAdditional`이 켜진 인스턴스에는 "경고"로는 부족하고 "거부 또는 그 인스턴스만 복사" 쪽이 필요합니다. 검증기가 값을 제자리에서 바꾸면 쓰기 없이 `value` 내용과 `valueTypeMismatch`가 어긋납니다.
- **혼합 `oneOf`/`anyOf`(보류 결정)에 대한 함의**: 이 제안은 어느 쪽으로 정해지든 모양을 바꾸지 않습니다. 터미널 union으로 정해지면 `schemaType`은 형 없는 `anyOf`처럼 분기 `type`을 모은 배열입니다(예: `['object','string']`). variant 호스트로 정해지면 그 노드는 union이 아니므로 스칼라입니다. 형 없는 `const`/`enum` 추론(보류 결정)을 채택하면, 리터럴의 JS 형에서 `'number'`(결코 `'integer'`가 아님)를 목록에 넣는 규칙이 제안 5 앞에 붙습니다.

## 비용
- **실행 시간**: `schemaType`은 union 슬롯마다 청사진 때 한 번 O(k)(k ≤ 7)로 계산하고 얼립니다. 노드 생성·커밋 때 추가 계산은 0입니다. union이 아닌 노드는 오늘과 같은 문자열입니다. `isUnionNode`는 비교 하나입니다. `Hint`는 참조를 옮기기만 합니다.
- **메모리**: union 슬롯마다 작은 배열 하나이고, 같은 슬롯의 노드들이 공유합니다. 노드마다 드는 메모리는 0입니다.
- **구현 크기**: 형 파일 셋(`value.ts`에서 래퍼 삭제·`anyOf` 규칙 약 10줄, `jsonSchema.ts`의 `UnionSchema`·`InferJSONSchema` 범주 판정 약 30줄, 노드 `type.ts`의 `UnionNode`·`InferSchemaNode` 분기 약 30줄), 가드 하나, 청사진의 정규화 함수 하나(약 20줄)입니다. 컴파일 시간은 형 수준 `IsUnion`·접기 정도라 무시할 만합니다.

## 실패 장면
- 플러그인이 `then`으로 목록이 좁혀질 때 입력이 바뀌기를 기대했다면, `schemaType`이 그대로라 입력이 바뀌지 않습니다. 소유자 결정(좁힘은 검증 전용)과 맞는 동작이지만, 이런 요구가 잦으면 "정적 계산" 정의가 틀렸다는 신호입니다.
- 플러그인이 `schemaType[0]`으로 입력을 고르면, 순서만 다른 두 스키마가 다른 UI를 냅니다. 이것이 버그로 보고되면 "저자 순서 보존"이 틀렸다는 뜻입니다(정규화 순서로 바꾸면 됩니다).
- 형이 `null`을 목록에 적었는지 `nullable: true`로 적었는지를 구분해야 하는 소비자가 나타나면 (a)가 틀린 것입니다. 오늘 소비자 조사에서는 0건입니다.
- 15의 수정으로 `as const` 스키마를 쓰던 사용자 코드가 새로 형 오류를 냅니다(오늘은 `any`라 통과했던 것). 이는 의도한 동작입니다. 이주 문서에 없으면 "깨졌다"는 보고로 드러납니다.
- 규칙 6의 불변식이 깨지면(예: 한 원소 배열이 남음) 플러그인 시험이 조용히 빗나갑니다. 청사진 단위 시험에서 모든 슬롯에 `isArray(schemaType) === (type === 'union')`을 확인해 막습니다.

## 오늘 공개 표면(`PKG/src/index.ts`)에서 깨지는 것과 이주 문장
| 깨짐 | 이주 |
|---|---|
| `SchemaNode`에 `UnionNode` 추가(`index.ts:33`) | `switch (node.type)`의 망라 검사에 `case 'union'`을 더합니다. |
| `SchemaNode['schemaType']`가 `JSONSchemaType \| UnionSchemaType`으로 넓어짐 | 문자열을 기대하는 곳은 `node.type !== 'union'`으로 먼저 좁힙니다. union이 아닌 노드의 값은 그대로입니다. |
| `Hint.type`, `FormTypeInputProps.type` 형이 넓어짐(`index.ts:63,69`) | 스칼라 비교(`type === 'string'`)는 그대로 컴파일되고 union 노드와는 맞지 않습니다. union 입력은 `Array.isArray(type)`로 받습니다. |
| `InferValueType`이 `as const` `type` 배열에서 `any` 대신 정확한 형을 냄(`index.ts:70`) | 새 형 오류는 값이나 스키마를 바로잡거나 형을 명시해서 풉니다. |
| `InferSchemaNode`·`FormTypeInputProps<A\|B>`가 `UnionNode`를 냄(`index.ts:34`) | `StringNode \| NumberNode`를 가정했던 코드는 `UnionNode`로 바꿉니다. |
| 새 공개 이름 `UnionNode`, `isUnionNode`, `UnionSchema` | 추가뿐입니다. |
| 런타임: 비-null 종류가 둘 이상인 `type` 배열, `['integer','number']`가 더는 `UNKNOWN_JSON_SCHEMA`가 아님(오늘 `extractSchemaInfo.ts:24-30`, `schemaNodeFactory.ts:117`) | 오류를 기대하던 시험은 union 노드나 number 노드를 기대하도록 바꿉니다. |
| `FormTypeRendererProps.type`에 `'union'` 추가(`formTypeRenderer.ts:21`) | 종류로 분기하는 렌더러에 union 가지를 더합니다(터미널로 그립니다). |
| 참고: `stories/38.StateManagement.stories.tsx:523,717,1029`은 렌더러 props에서 `schemaType`을 꺼내지만, 그 칸을 넘기는 곳이 없습니다(`[alt]: any`로만 통과하므로 늘 `undefined`). | 스토리는 `node.schemaType`을 읽도록 고칩니다(기존 결함이고 union과는 별개입니다). |

## 소유자가 정해야 할 것
1. **"그대로"의 뜻.** 소유자 문장 "스키마에 쓴 배열 타입을 그대로 출력"을, 이 제안은 "계산된 목록(`null` 제외, `integer` 보존, 저자 순서)"으로 읽었습니다. `null`까지 담은 저자 원문 그대로를 원하신 것이라면 제안 3–6이 바뀌고, 모든 nullable 노드의 `schemaType`이 배열이 되어 플러그인 시험이 깨집니다. 원리로는 계산된 쪽이 낫지만 소유자의 의도를 확인해야 합니다.
2. **이름.** 소유자는 "추가"라고 썼습니다. 이 제안은 새 필드를 더하지 않고 `schemaType`을 넓힙니다. 새 이름(`jsonSchemaType` 등)을 원하시면, 그때 `schemaType`을 지울지(한 형에 한 이름, NODE-011) 정해야 합니다. 권장은 넓히기입니다. 이주 비용이 0이고, 이름이 이미 "스키마의 형"을 뜻합니다.
