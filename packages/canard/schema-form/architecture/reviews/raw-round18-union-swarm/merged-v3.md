# union 노드 — 병합 설계안 (스웜 3단계, 3판)

읽는 법: `src/…` 경로는 `packages/canard/schema-form/` 아래이고, `schema-form-*-plugin/…`와 `winglet/…`는 `packages/canard/`·`packages/` 아래입니다. 모든 `path:line`은 파일을 열어 확인했습니다. R*n*은 1차 편집자 판정(`rulings.md`), S*n*·T*n*·V*n*은 2차 판정(`rulings-2.md`), U*n*은 3차 판정(`rulings-3.md`)의 통합 원리, O*n*은 §7의 소유자 결정입니다. 현행 원장 항목을 바꾸는 규칙에는 `(원장 변경: ID)`를 붙였습니다. 판정에 없는 지적을 설계 가치로 닫은 곳에는 `【편집자】` 각주를 달았습니다.

## 0. 한 문단 요약

`union`은 `type`에 원시·객체·배열 가운데 둘 이상의 종류가 적힌 칸을 받아들이는 터미널 잎 노드이며, 형을 고르는 UI가 아닙니다(BLUEPRINT-033). 노드 필드는 셋입니다.
- `type`: 종류입니다. 단일 문자열이고, `'union'`이 더해집니다.
- `nullable`: 그대로입니다.
- `schemaType`: 넓혀서 계산된 허용 형 목록이 됩니다. union이 아닌 노드에서는 오늘과 같은 스칼라이고, union에서만 `'null'`을 뺀 얼린 배열입니다.

한 칸의 `type` 선언들은 JSON Schema의 연언입니다. 그래서 허용 집합은 교집합이고(`null` 포함, `integer ⊂ number`), 순서와 무관하며, 교집합이 빌 때만 충돌입니다. `{null}`은 빈 집합이 아니고 null 노드가 됩니다.
- 정적 선언(본체·게이트 없는 `allOf`·`$ref`)은 청사진에서 종류·`schemaType`·`nullable`을 정합니다.
- 게이트 선언은 이것들과 입력 선택을 바꾸지 않습니다. 켜져 있는 동안에는 노드의 유효 목록만 좁히며, 이는 모든 종류에 같습니다.

값은 쓰기마다 규칙 A(`interpret`)를 지납니다.
- 한 진입에서 쓰인 노드는 전이 단계에서 최종 유효 목록으로 한 번 더 해석합니다.
- 게이트만 바뀌면 값은 다시 해석하지 않고 경고등만 다시 정합니다.
- 둘 이상의 형이 받아 주는 경우는 `{string, boolean}` 목록에 수 `0`·`-0`·`1`이 오는 12건뿐입니다.

Hint와 입력 props는 노드 필드 이름을 1:1로 비춥니다. 검증기는 값과 스키마를 바꾸지 않습니다. 값을 바꾸는 ajv 옵션을 켠 인스턴스는 `bind`에서 거부합니다. 소유자는 O1–O8을 모두 정했습니다(§7).

## 1. 노드 필드와 공개 형

### 필드
| 필드 | union이 아닌 노드 | union 노드 | 바뀌는 때 |
|---|---|---|---|
| `type` | 종류(오늘과 같음, `'integer'` 없음) | `'union'` | 바뀌지 않음 |
| `schemaType` | 오늘과 같은 스칼라(`'integer'` 보존, null 노드는 `'null'`) | 얼린 배열(`'null'` 없음, 길이 2 이상) | 바뀌지 않음 |
| `nullable` | 오늘과 같음(출처는 §2) | 같음 | 바뀌지 않음 |
| `jsonSchema.type` | 켜진 선언의 `type`을 교집합으로 병합한 값 | 같음 | 켜진 덧씌움 집합이 바뀔 때 |

1.1 `node.type`은 `'string'|'number'|'boolean'|'null'|'object'|'array'|'virtual'|'union'` 가운데 하나인 단일 문자열이며, 노드가 사는 동안 바뀌지 않습니다(NODE-041, BLUEPRINT-032; 오늘 `src/core/nodes/AbstractNode/AbstractNode.ts:77`).
1.2 `node.nullable`은 이름과 뜻을 그대로 둡니다. 값은 §2의 절차가 청사진에서 정적 선언만으로 정하며, 해당 규칙은 2.2, 2.7–2.10, 2.13–2.15, 2.17, 2.21입니다(BLUEPRINT-032, R4, S1–S2, U3).
1.3 `node.schemaType`은 이름을 그대로 두고 형을 `JSONSchemaType | UnionSchemaType`으로 넓히며, 새 필드는 더하지 않습니다(R2, O1; 오늘 `AbstractNode.ts:79-83`).
1.4 `schemaType`은 저자가 쓴 `type`을 그대로 옮긴 값이 아니라, 계산된 허용 형 목록입니다(T2, O1).
   - `'null'`은 빠지고, `nullable`이 맡습니다.
   - `'integer'`는 `'number'`에 흡수됩니다.
   - 종류가 하나 남으면 스칼라입니다.
   - 형 없는 `anyOf`에서는 분기에서 계산합니다.
1.5 union이 아닌 노드의 `schemaType`은 오늘과 같은 스칼라입니다. number 노드는 `'integer'`를 보존하고 null 노드는 `'null'`입니다(R2; 오늘 `src/core/nodes/schemaNodeFactory.ts:143`, `src/helpers/jsonSchema/extractSchemaInfo/extractSchemaInfo.ts:26-27,34`).
1.6 union 노드의 `schemaType`은 §2가 계산한 목록을 얼린 읽기 전용 배열입니다(R2, R6, LANDING-130).
   - 순서는 앵커 선언에 저자가 쓴 순서입니다.
   - `'null'`은 빠집니다.
   - 목록에 `'number'`가 함께 있으면 `'integer'`는 `'number'`에 흡수됩니다.
   - 중복 원소는 청사진 오류이므로 생기지 않습니다.
1.7 불변식은 `Array.isArray(node.schemaType) === (node.type === 'union')`입니다(R2).
1.8 규칙 A·기본 입력·경고등의 기준 목록은 `node.schemaType`과 `node.nullable`입니다. 게이트가 켜진 동안에는 모든 종류에서 §3.2의 유효 목록을 씁니다(R1, R3, O5, U4). (원장 변경: BLUEPRINT-033)
1.9 청사진은 계산한 `schemaType`을 유효 스키마에 써 넣지 않습니다(R1, U5, BLUEPRINT-021). `jsonSchema.type`은 켜진 선언의 `type`을 병합표 규칙대로 교집합으로 합친 값입니다. 그래서 켜진 `then`이 목록을 좁히면 `jsonSchema.type`은 좁아지고, `schemaType`은 그대로입니다.
1.10 종류별 공개 형은 `schemaType`을 좁힙니다(NODE-015, NODE-046; 오늘은 모두 넓은 `JSONSchemaType`, `AbstractNode.ts:83`).

| 공개 형 | `schemaType` |
|---|---|
| `StringNode` | `'string'` |
| `NumberNode` | `'number'\|'integer'` |
| `BooleanNode` | `'boolean'` |
| `NullNode` | `'null'` |
| `ObjectNode` | `'object'` |
| `ArrayNode` | `'array'` |
| `VirtualNode` | `'virtual'` |
| `UnionNode` | `UnionSchemaType` |

1.11 형 정의는 `UnionMemberType = 'string'|'number'|'integer'|'boolean'|'object'|'array'`와 `UnionSchemaType = readonly [UnionMemberType, UnionMemberType, ...UnionMemberType[]]`입니다(소유자 결정 (c), NODE-041). (원장 변경: NODE-041)
1.12 `UnionNode`의 모양은 `type: 'union'`, `strategy: 'terminal'`, `schemaType: UnionSchemaType`, `nullable: boolean`, `children: null`에 공통 멤버를 더한 것입니다(SURFACE-058; 오늘 터미널의 `children`은 `AbstractNode.ts:134-135`).
1.13 `UnionNode`는 `valueTypeMismatch`를 판별자로 두 멤버로 나뉩니다(SURFACE-052; `src/types/formTypeInput.ts:62-65`). (원장 변경: SURFACE-052)【편집자 1】
   - `false`: `value`는 `string | number | boolean | ObjectValue | ArrayValue | undefined`이고, nullable이면 `| null`이 붙습니다.
   - `true`: `value`는 `unknown`입니다.
   - 목록 형으로 좁히는 것은 `FormTypeInputProps`(1.14)가 맡습니다.
1.14 union 노드의 `FormTypeInputProps`에서 `value`와 `onChange`는 일부러 다른 형입니다(T1; 오늘은 둘 다 같은 `Value`, `src/types/formTypeInput.ts:61-65`).
   - `value`: `UnionNode.value`와 같은 판별 모양입니다. `valueTypeMismatch === false`이면 목록 종류의 값 | `undefined` | (nullable이면) `null`이고, `true`이면 `unknown`입니다.
   - `onChange`: 목록 종류의 값, `undefined`, 그리고 nullable일 때만 `null`을 받습니다.
1.15 공개 가드 `isUnionNode(x) = isSchemaNode(x) && x.type === 'union'`을 더합니다(NODE-041, NODE-015).【편집자 2】
   - `isTerminalNode(unionNode)`는 참이고, 반환 형 합집합에 `UnionNode`가 들어갑니다.
   - `isBranchNode(unionNode)`는 거짓입니다.
   - 새 설계에서 두 가드는 `strategy`를 봅니다. 오늘은 `node.group`을 봅니다(`src/core/nodes/filter.ts:77,197-198`).
1.16 "목록에 X가 있는가"를 묻는 공개 가드는 두지 않습니다. `isUnionNode(n) && n.schemaType.includes('integer')`로 충분하기 때문입니다(seiri public-contract §1).
1.17 `JSONSchemaWithVirtual`에 `UnionSchema`를 더합니다(오늘 형 정의는 nullable 쌍만 받음: `winglet/json-schema/src/types/jsonSchema.ts:103-110,149-153`). 모양은 둘입니다.
   - `type`이 `UnionMemberType | 'null'`의 읽기 전용 배열인 것
   - `type` 없이 `anyOf`·`oneOf`가 필수인 것
1.18 `InferSchemaNode`와 `InferValueType`은 §2의 런타임 절차를 비춥니다. 청사진 오류가 되는 모양은 형 수준에서도 무효이고, 형 수준이 판정할 수 없는 모양은 넓은 형으로 둡니다(R9, NODE-046).

| 스키마 모양 | `InferSchemaNode` | `InferValueType` |
|---|---|---|
| `type` 배열, 접은 집합(§2.2)의 원소 2개 이상 | `UnionNode` | 원소 값 형의 합, nullable이면 `\| null` |
| `type` 배열, 접은 집합의 원소 1개 | 그 종류의 노드 | 그 형, nullable이면 `\| null` |
| `type` 배열이 `'null'`만이거나, 형 없는 칸의 분기가 모두 null 분기 | `NullNode` | `null` |
| 형 없는 `anyOf`·`oneOf`, 모든 분기가 원시 형을 가짐 | 분기 형을 모아 위 줄들과 같이 | 분기 값 형의 합 |
| 형 없는 분기(`const`·`enum`만 있는 것 포함), 객체·원시 혼합 분기, 모든 분기가 객체(또는 배열)인 형 없는 칸 | `never` | `unknown` |
| `$ref`, 게이트 가진 분기, `oneOf`와 `anyOf`가 함께 있는 칸, 본체에 붙은 `allOf` | 넓은 `SchemaNode` | 오늘 규칙 |

1.19 `src/types/value.ts:10-15`의 `NormalizeType`을 지우고, winglet의 `InferValueType`에 스키마를 그대로 넘깁니다. 오늘은 `as const` `type` 배열이 모두 `any`가 되지만, 고치면 원소 값 형의 합이 나옵니다(`src/types/value.ts:17-23`).
1.20 union 칸에 `enum`이 있으면 `InferValueType`은 목록 종류들의 값 형과 enum 리터럴 형의 교집합입니다. 리터럴의 JSON 종류가 목록(+nullable)에 있는 것만 남습니다. 예를 들어 `['number','string']` + `enum:[1,'a',true]`는 `1 | 'a'`입니다(R20).
1.21 `InferJSONSchema<Value>`가 분배되지 않게 고칩니다(오늘 `src/types/jsonSchema.ts:40-88`).
   - 값의 null이 아닌 범주(string·number·boolean·object·array. 리터럴 합은 한 범주)가 둘 이상이면 `UnionSchema`로 사상합니다.
   - 그래서 `FormTypeInputProps<string|number>`의 `node`는 `UnionNode`입니다.
1.22 참조 안정성은 다음 표와 같습니다(VALUE-012, BLUEPRINT-021, VALUE-030).

| 무엇 | 같은 참조가 유지되는 범위 |
|---|---|
| `type`, `strategy`, `nullable`, `schemaType` | 노드가 사는 동안. `schemaType` 배열은 청사진 칸마다 하나를 얼리고, 그 칸의 모든 노드(배열 아이템 포함)와 기본 spec(§3.1)이 공유합니다 |
| 유효 목록(§3.2) | 노드마다, 유효 스키마 메모가 같은 동안. 좁히는 게이트가 없으면 `schemaType`과 같은 참조입니다 |
| `jsonSchema` | 켜진 덧씌움 집합이 같은 동안 |
| `value`, `valueTypeMismatch` | 커밋 사이. 객체·배열 값은 변환하지 않으므로 참조가 그대로이고, 같은 원본이면 방출도 같은 참조입니다 |

## 2. 청사진 판정 절차

### 정의
2.1 선언 d의 허용 집합 A(d)는 `'null'`을 포함해 d가 받는 형의 집합입니다(S2, BLUEPRINT-032; OAS 3.0.3; ajv8 `node_modules/ajv/lib/compile/validate/dataType.ts:19-31`).
   - d 자신의 `type`(문자열이나 배열)의 원소가 기본입니다.
   - `nullable: true`는 같은 객체에 `type`이 있을 때만 `'null'`을 더합니다.
   - `'null'`만 받는 분기는 `{null}`입니다.
   - `type`이 없는 선언은 A = ⊤이며 어느 종류와도 맞습니다.
2.2 ⊤가 아닌 허용 집합 A에서 종류와 nullable을 다음과 같이 정합니다(S1, BLUEPRINT-034 (1), 소유자 결정 (c)). (원장 변경: BLUEPRINT-034)
   - A = ∅이면 종류가 없고, 그 A를 만든 단계가 오류를 정합니다.
   - A = `{null}`이면 null 종류이고 `nullable: true`입니다.
   - 그 밖에는 F = fold(A \ {null})로 정합니다. fold는 `'integer'`를 `'number'`로 바꿉니다. |F| = 1이면 그 종류, |F| ≥ 2이면 `union`입니다.
   - nullable은 `'null'` ∈ A와 같습니다.
   - `object`·`array`도 union의 원소가 될 수 있습니다.
2.3 두 선언은 fold가 같을 때 같은 종류입니다. 구현은 7비트 마스크 비교 한 번입니다(BLUEPRINT-034 (2)).
2.4 두 허용 집합의 교집합 A ∩ B는 원소마다 취합니다(U1, R4; 오늘 `src/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/processSchemaType.ts:65,73`).
   - `integer ⊂ number`이므로 `number` ∩ `integer` = `integer`입니다.
   - `'null'`은 양쪽에 있을 때만 남습니다.
   - 순서는 A의 순서를 따릅니다.
   - 교집합은 교환법칙이 성립하므로, 선언 순서는 결과 원소의 순서에만 영향을 줍니다.

### 절차 (칸마다 번호 순서로 보며, 반드시 하나의 결과로 끝남)

#### S0 문법
2.5 알려지지 않은 형 이름, 빈 배열 `[]`, 배열 안의 중복 원소는 `UNKNOWN_JSON_SCHEMA`입니다. 선언 하나 안의 `['integer','number']`는 `'number'`입니다(R6, LANDING-130; 오늘 `extractSchemaInfo.ts:25,28-29` → `schemaNodeFactory.ts:116`).

#### S1 정적 연언 C
2.6 정적 연언 C는 칸 본체, 게이트 없는 `allOf` 항목(재귀), 그리고 이것들의 `$ref` 대상입니다(R4, U1, FRAGMENT-048, SCHEMA-007). `type`을 가진 선언을 전순서로 늘어놓고 첫째를 앵커라 부르며, 앵커는 결과 원소의 순서만 정합니다.

#### S2 C에 `type`이 있는 칸
2.7 C에 `type`을 가진 선언이 하나라도 있으면, R은 그런 선언 모두의 A(d)를 교집합(2.4)한 것입니다(U1, U3, R4). `type`이 없는 선언(A = ⊤)은 관여하지 않습니다.【편집자 3】
2.8 R = `{null}`이면 null 종류이고 `nullable: true`입니다. 이것은 오류가 아닙니다(S1, U2).
2.9 R = ∅이면 `ALL_OF_TYPE_REDEFINITION`입니다. 교집합이 빈 경우만이 충돌입니다(U2, ERROR-164의 "정적 연언의 교차" 행; 오늘 `processAllOfSchema.ts:45-50`).
2.10 그 밖에는 R이 2.2로 종류·`schemaType`·nullable을 정합니다. 그래서 nullable은 모든 선언의 AND가 됩니다(U1, U3). 예는 다음과 같습니다.
   - `['string','number']` 본체에 `allOf:[{type:'string'}]` → string 노드
   - `['string','number']` + `['string','boolean']` → string 노드
   - `'number'` + `['number','string']` → number 노드

#### S3 C에 `type`이 없는 칸
2.11 칸의 게이트 없는 `oneOf`·`anyOf` 분기를 봅니다. 분기가 없으면 `UNKNOWN_JSON_SCHEMA`입니다(오늘 `extractSchemaInfo.ts:23` → `schemaNodeFactory.ts:116`).
2.12 분기 b의 A(b)는 b 자신의 정적 연언에 2.7–2.9를 적용한 결과이며, 거기서 난 오류는 그대로 냅니다(O2). A(b) = ⊤인 분기가 하나라도 있으면(`const`·`enum`만 있는 분기 포함) `UNKNOWN_JSON_SCHEMA`입니다.
2.13 한 키워드의 허용 집합 U는 분기 A(b)의 합집합이며 `'null'`을 포함합니다. 순서는 분기 순서에서 처음 나온 순서입니다(S2, 소유자 결정 (나)).
2.14 `oneOf`와 `anyOf`가 함께 있으면 둘은 연언이므로, 두 키워드의 U를 2.4로 교집합한 것이 U입니다(`'null'` 포함). 순서는 `oneOf` 쪽을 따릅니다(R7, S2, U1, FRAGMENT-049).
2.15 `'null'`은 합치고 교집합한 뒤에야 떼어 냅니다(S2, R8, O3, SCHEMA-008 "존재만"). (원장 변경: BLUEPRINT-034)
   - U = ∅이면 `UNKNOWN_JSON_SCHEMA`입니다.
   - U = `{null}`이면 null 종류이고 `nullable: true`입니다.
   - fold(U \ {null})에 `object`나 `array`가 있으면 `UNKNOWN_JSON_SCHEMA`입니다. 다른 종류와 섞인 경우(O3)와 객체만·배열만인 경우(R8, 오늘과 같음)가 모두 여기에 듭니다.
   - 그 밖에는 2.2로 원시 잎이나 `union` 잎이 되고, 분기의 제약은 검증 전용입니다.
2.16 게이트 가진 분기(분기 안의 `controls.active`, `controls.discriminator`로 변환된 분기)는 2.13–2.15의 합치기에 넣지 않고 2.19를 따릅니다(FRAGMENT-001, FRAGMENT-008).

#### S4 자기 `type`이 있는 칸의 분기
2.17 칸의 종류가 원시나 `union`이면, 게이트 없는 `oneOf`·`anyOf` 분기의 `type`은 검증 전용입니다(R4, U8, FRAGMENT-001; 오늘 null 분기는 건너뜀, `src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/getCompositionNodeMapList.ts:69-71`).
   - 목록 밖 분기와 null 분기도 오류가 아닙니다.
   - null 분기는 nullable을 켜지 않고, 유효 목록을 좁히지 않습니다.
   - 칸이 object·array이면 기존 variant 규칙을 따릅니다.

#### S5 조각 사이
2.18 같은 이름의 선언이 여러 조각에 있으면, 정적 선언(호스트 본체, 호스트의 게이트 없는 `allOf`, `$ref`)은 모두 그 칸의 C가 되어 2.6–2.10으로 노드 하나를 정합니다(U1, U3, BLUEPRINT-010).
2.19 정적 노드가 있는 칸의 게이트 선언은 그 노드의 종류·`schemaType`·nullable·입력 선택을 바꾸지 않습니다(U1, U2, U4). 게이트 선언은 `then`·`else`, `controls.active` 조각, 게이트 가진 분기입니다. (원장 변경: BLUEPRINT-011, BLUEPRINT-012)
   - 켜져 있는 동안 게이트 선언은 노드의 유효 목록(§3.2)을 좁힙니다.
   - 켜진 게이트 선언과 정적 허용 집합의 교집합(`'null'` 포함)이 비면, 그 게이트들이 켜진 동안 `SHARED_NODE_CONFLICT`(정착 오류, 기존 처리)입니다.
   - `{null}`은 빈 집합이 아니므로 충돌이 아닙니다(3.3).
2.20 호스트의 게이트 없는 분기는 "또는" 문맥이라, 그 `type`은 존재만 더하고 교차하지 않습니다(U8, SCHEMA-008, SCHEMA-044, BLUEPRINT-012).
   - fold가 정적 노드의 fold에 들면 검증 전용입니다. 목록·nullable·유효 목록을 바꾸지 않습니다.
   - 그 밖에는 `SHARED_NODE_KIND_CONFLICT`입니다.
2.21 정적 선언이 하나도 없는 이름은 fold가 같은 선언끼리 노드 하나를 둡니다(R20, SCHEMA-007, S1, BLUEPRINT-011, BLUEPRINT-012).【편집자 14】
   - 목록은 선언들 허용 집합의 합집합을 2.2로 나눈 것입니다. `integer`는 모든 선언이 `integer`일 때만 남고, nullable은 OR이며, `{null}`이면 null 종류입니다.
   - 순서는 전순서의 첫 선언을 앵커로 하고, 앵커에 없는 원소는 처음 나온 순서대로 뒤에 붙입니다.
   - fold가 다른 게이트 선언이 동시에 켜지면 `SHARED_NODE_CONFLICT`이고, 배타이면 종류별 노드입니다.
   - 각 노드 안에서는 켜진 선언이 2.19와 같이 유효 목록을 좁힙니다.

#### S6 전략
2.22 `union`은 행이 하나인 종류이므로 전략은 `terminal`이며, 렌더 계층의 판정을 묻지 않습니다(NODE-047, ERROR-200).
   - 어느 선언에든 `options.terminal: false`가 있으면 `TERMINAL_OPTION_UNSUPPORTED`입니다.
   - `true`는 허용합니다.
   - 인라인 `FormTypeInput`이 있어도 판정은 바뀌지 않습니다.
2.23 `object`·`array`가 든 `union`은 터미널로 강제됩니다.
   - 이 칸의 `properties`·`items`·`prefixItems`는 자식을 만들지 않는 검증 전용입니다.
   - `find('/slot/key')`는 `null`입니다(NODE-020).
   - `controls.children`은 `CHILDREN_TARGET_NOT_FOUND`입니다(CONTROLS-073 (2), ERROR-193).
2.24 종류가 object·array인 칸은 nullable을 포함해(`['object','null']`) 오늘 순서를 따릅니다. 그 순서는 `options.terminal` → 판정 → `type`입니다(NODE-028, NODE-042). object variant 호스트(분기가 객체 스키마인 `oneOf`·`anyOf`, 깊이와 상관없는 자식 하위 트리 포함)는 이 설계가 건드리지 않습니다(O3).
2.25 전략이 `terminal`인 모든 노드의 인라인 하위 스키마(깊이 1 이상, `$ref`는 따라가지 않음)에 예약 층 키 `controls`·`options`·`presentation`이 나오면, 청사진이 경고 `(가칭) SCHEMA_FORM_WARNING.TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`을 냅니다(공통 §1, ERROR-164 `NULL_BRANCH_IGNORED_FOR_FORM` 행과 같은 드러남). (원장 변경: ERROR-164)【편집자 6】
   - 기록은 `{ schemaPath, keys, paths }`입니다.
   - `(code, schemaPath)`로 트리마다 한 번 냅니다.
   - 개발 모드 콘솔과 커밋된 로드의 준비 이펙트로 드러납니다.
   - 핸들러가 없는 프로덕션에서는 검사하지 않습니다.
2.26 결과는 일곱 가지입니다: 원시 잎(+nullable), null 잎, 원시만의 `union` 잎, 터미널 강제 `union` 잎, object·array 노드(branch 또는 terminal, +nullable), variant 호스트, 청사진 오류.

### 예 (종류 / `schemaType` / `nullable` / 전략 / 오류)
| # | 입력 스키마 | 종류 | `schemaType` | nullable | 전략 | 오류·비고 |
|---|---|---|---|---|---|---|
| E1 | `{type:['string','number']}` | union | `['string','number']` | false | terminal | — |
| E2 | `{type:['number','string','null']}` | union | `['number','string']` | true | terminal | — |
| E3 | `{type:['string','number'], nullable:true}` | union | `['string','number']` | true | terminal | — |
| E4 | `{type:['integer','number']}` | number | `'number'` | false | terminal | — |
| E5 | `{type:['integer','string']}` | union | `['integer','string']` | false | terminal | — |
| E6 | `{type:['integer','null']}` | number | `'integer'` | true | terminal | — |
| E7 | `{type:['object','string'], properties:{…}}` | union | `['object','string']` | false | terminal(강제) | — |
| E8 | `{type:['object','null']}` | object | `'object'` | true | NODE-028 순서 | — |
| E9 | `{type:['null']}` | null | `'null'` | true | terminal | — |
| E10 | `{type:['null','null']}`, `{type:[]}`, `{type:['string','foo']}` | — | — | — | — | `UNKNOWN_JSON_SCHEMA` |
| E11 | `{anyOf:[{type:'string'},{type:'number'}]}` | union | `['string','number']` | false | terminal | — |
| E12 | `{anyOf:[{type:'integer'},{type:'string',minLength:1},{type:'null'}]}` | union | `['integer','string']` | true | terminal | — |
| E13 | `{anyOf:[{type:'string'},{type:'null'}]}` | string | `'string'` | true | terminal | — |
| E14 | `{anyOf:[{const:'a'},{type:'number'}]}` | — | — | — | — | `UNKNOWN_JSON_SCHEMA` (O2) |
| E15 | `{anyOf:[{type:'object'},{type:'string'}]}` | — | — | — | — | `UNKNOWN_JSON_SCHEMA` (O3) |
| E16 | `{oneOf:[{type:'object',…},{type:'object',…}]}` (자기 형 없음) | — | — | — | — | `UNKNOWN_JSON_SCHEMA` (R8) |
| E17 | `{oneOf:[{type:'string'},{type:'number'}], anyOf:[{type:'number'},{type:'boolean'}]}` | number | `'number'` | false | terminal | — |
| E18 | `{type:['string','number'], allOf:[{type:'string'}]}` | string | `'string'` | false | terminal | — (U3) |
| E19 | `{type:['number','string'], allOf:[{type:['integer','string']}]}` | union | `['integer','string']` | false | terminal | — |
| E20 | `{type:'number', allOf:[{type:'integer'}]}` | number | `'integer'` | false | terminal | — |
| E21 | `{type:['string','null'], allOf:[{type:'string'}]}` | string | `'string'` | false | terminal | — |
| E22 | `{type:'string', anyOf:[{type:'null'},{minLength:1}]}` | string | `'string'` | false | terminal | — |
| E23 | `{type:'string', allOf:[{type:'number'}]}` | — | — | — | — | `ALL_OF_TYPE_REDEFINITION` (교집합 ∅) |
| E24 | `{type:'number', allOf:[{type:['number','string']}]}` | number | `'number'` | false | terminal | — (오늘은 오류, U3) |
| E25 | 본체 `a:{type:['string','number']}` + `if/then a:{type:'number'}` | union | `['string','number']` | false | terminal | — (켜진 동안 유효 목록 `['number']`) |
| E26 | 본체 `a:{type:'number'}` + `if/then a:{type:['number','string']}` | number | `'number'` | false | terminal | — (켜진 동안 유효 목록 `['number']`, `schemaType`과 같은 참조) |
| E27 | 본체 없음, `then a:['string','number']` / `else a:'number'` | union / number(두 노드, 배타) | 각각 | false | terminal | — |
| E28 | `{type:['string','number'], options:{terminal:false}}` | — | — | — | — | `TERMINAL_OPTION_UNSUPPORTED` |
| E29 | `{nullable:true, anyOf:[{type:'string'},{type:'number'}]}` | union | `['string','number']` | false | terminal | — (형 없는 `nullable`은 효과 없음) |
| E30 | `{type:['string','null'], allOf:[{type:['number','null']}]}` | null | `'null'` | true | terminal | — (교집합 `{null}`) |
| E31 | `{type:['string','number'], allOf:[{type:['string','boolean']}]}` | string | `'string'` | false | terminal | — (U1) |
| E32 | `{anyOf:[{type:'null'}]}` | null | `'null'` | true | terminal | — |
| E33 | `{oneOf:[{type:'null'}], anyOf:[{type:'null'}]}` | null | `'null'` | true | terminal | — |
| E34 | `{anyOf:[{type:['string','null']},{type:'number'}]}` | union | `['string','number']` | true | terminal | — |
| E35 | `{anyOf:[{type:'string',nullable:true},{type:'number'}]}` | union | `['string','number']` | true | terminal | — |
| E36 | `{type:'integer', allOf:[{type:'number'}]}` | number | `'integer'` | false | terminal | — (오늘과 같음) |
| E37 | `{type:'string', allOf:[{type:['string','null']}]}` | string | `'string'` | false | terminal | — (오늘과 같음) |
| E38 | `{type:['string','number','null'], allOf:[{type:['string','boolean','null']}]}` | string | `'string'` | true | terminal | — |
| E39 | `{allOf:[{type:['string']},{type:['string','number']}]}`와 순서를 뒤집은 것 | string | `'string'` | false | terminal | — (둘이 같음) |
| E40 | 본체 `a:['string','number','boolean']` + `then1 a:'string'` + `then2 a:'boolean'` | union | `['string','number','boolean']` | false | terminal | 둘 다 켜지면 `SHARED_NODE_CONFLICT` |
| E41 | 본체 `a:{type:'number'}` + `if/then a:{type:'integer'}` | number | `'number'` | false | terminal | — (켜진 동안 유효 목록 `['integer']`, 정수 규칙) |
| E42 | 본체 `a:['string','number']` + 호스트의 게이트 없는 `oneOf` 분기 `a:{type:'string'}` | union | `['string','number']` | false | terminal | — (분기는 유효 목록을 좁히지 않음, U8) |

## 3. 값 의미

### 목록
3.1 청사진은 union 칸마다 기본 spec `UnionSpec { kinds, mask, nullable }`을 한 번 만들어 얼립니다. `kinds`는 그 칸의 `schemaType`과 같은 참조입니다(R3, U5).
   - 유효 목록이 좁혀진 노드는 `{ kinds: 유효 목록, mask, nullable }`을 그 노드의 유효 스키마 메모 항목에 함께 둡니다.
   - `interpret`는 노드의 현재 spec을 받습니다.
   - 좁히지 않은 노드의 현재 spec은 기본 spec 그 자체입니다.
3.2 노드의 유효 목록은 `schemaType` ∩ (켜진 게이트 선언의 허용 집합)을 2.4로 계산하고 `'null'`을 뗀 것입니다. 이는 유효 스키마 `type`의 병합 결과와 같습니다(U4, U5, BLUEPRINT-021). (원장 변경: SCHEMA-008)
   - 모든 종류에 같습니다. 원소가 하나인 목록은 단일 노드의 경우이며, number 노드에 게이트 `integer`가 켜지면 정수 규칙을 따릅니다.
   - 노드마다 계산하고, 유효 스키마 메모가 바뀔 때만 다시 계산합니다.
   - 좁히는 게이트가 없으면 `schemaType`과 같은 얼린 참조를 공유합니다. 이것이 흔한 경우이며 비용은 0입니다.
   - 유효 스키마의 `type`은 병합표에서 교집합으로 합칩니다.
3.3 교집합에 `'null'`만 남으면(노드가 nullable이고 게이트가 `{null}`만 허용) 다음과 같습니다(U2).
   - 유효 목록은 빈 목록입니다.
   - null이 아닌 모든 값에 경고등이 켜집니다.
   - 기본 입력은 4.15처럼 빈 읽기 전용입니다.

### 규칙 A: 순수 함수 셋
3.4 `isMember(value, kind)`는 다음 표를 따릅니다(JSON Schema의 뜻, R14, 공통 `integer` 결정).

| kind | 참인 값 |
|---|---|
| `string` | `typeof v === 'string'` |
| `number` | `typeof v === 'number' && Number.isFinite(v)` |
| `integer` | `Number.isInteger(v)` (안전한 정수 범위는 보지 않음, ajv와 같음) |
| `boolean` | `typeof v === 'boolean'` |
| `object` | `typeof v === 'object' && v !== null && !Array.isArray(v)` (프로토타입은 보지 않음) |
| `array` | `Array.isArray(v)` |
| (null) | `v === null`. 목록이 아니라 `nullable`로만 봄 |

3.5 `convert(value, kind)`는 WRITE-075를 옮긴 것이며, 이미 그 형인 값에는 부르지 않습니다(WRITE-075).

| kind | 받는 원천 → 결과 | 받지 않는 것 |
|---|---|---|
| `number` | 앞뒤 공백을 뺀 전체가 JSON 수 표기이고 결과가 유한한 문자열 → `Number(t)`. 소수부·지수부 없는 표기는 안전한 정수여야 함 | 불리언, `"01"`, `"1e400"`, `"9007199254740993"` |
| `integer` | `number` 변환이 되고 결과가 `Number.isSafeInteger`인 문자열(`"1.0"`→`1`, `"1e2"`→`100`) | 이미 수인 값(자르지 않음), `"1.5"`, `"1e16"` |
| `string` | 유한한 수 → `String(n)`(`-0`→`"0"`), 불리언 → `"true"`·`"false"` | `NaN`·`±Infinity`, `null`, 객체, 배열 |
| `boolean` | 정확히 `"true"`·`"false"`, 수 `1`→`true`, `0`·`-0`→`false` | `" true"`, `"1"`, 그 밖의 수 |
| `object`·`array` | 없음(파싱도 문자열화도 하지 않음) | 전부 |

3.6 `interpret(value, spec)`는 노드의 현재 spec(3.1)으로 다음 순서를 밟습니다. 이 함수는 순수하고, 던지지 않으며, 멱등이고, 바꾸지 못하면 항등입니다(BLUEPRINT-033, WRITE-084).
   1. `undefined`는 `undefined`입니다.
   2. `null`은 `null`입니다(VALUE-033).
   3. 멤버이면 참조를 그대로 돌려줍니다.
   4. 목록의 형마다 `convert`를 해서 성공한 결과를 `===`로 중복 없이 셉니다.
   5. 결과가 정확히 하나면 그 값이고, 아니면 `value`입니다.
   - 후보는 배열에 모으지 않고 개수와 첫 결과만 셉니다. 할당 없이 구현한다는 조건입니다(V4).
3.7 원소가 하나인 목록은 단일 노드의 행과 같습니다(BLUEPRINT-033, LANDING-130).
   - `['integer','number']`는 number 규칙을 따릅니다.
   - `['integer','number','boolean']`의 `"2"`는 결과가 둘이지만 같은 값이므로 `2`입니다.
3.8 둘 이상의 형이 받아 주는 경우를 증명하면 다음과 같습니다.
   - 문자열은 `number`·`integer`(같은 결과)와 `boolean`(`"true"`·`"false"`, 수 표기가 아님)이 받습니다. 둘은 겹치지 않습니다.
   - 불리언은 `string` 하나만 받습니다.
   - 비유한 수·`null`·객체·배열·그 밖의 값은 아무 형도 받지 않습니다.
   - 유한한 수는 `string`(늘)과 `boolean`(`0`·`-0`·`1`)이 받습니다.
   - 그래서 둘 이상이 받아 주는 경우는 정확히 목록 ⊇ {string, boolean}, 목록 ∩ {number, integer} = ∅, 값 ∈ {0, -0, 1}일 때입니다. `object`·`array`가 있고 없음에 따라 4종 × 값 3개로 12건입니다.
3.9 전수 실행 결과 규칙 A는 선언 순서와 무관합니다(BLUEPRINT-033).【편집자 2】
   - `scratchpad/swarm-union/d-rule-a.mjs`로 목록 127개 × nullable 2 × 값 40종 × 모든 순열을 돌렸습니다.
   - 결과는 12건이고 순서 위반 0, 멱등 위반 0이며, V2가 재현했습니다.
   - 참고로 ajv 8.17.1은 `['string','number']`의 `true`를 선언 순서에 따라 `"true"`로 바꿉니다(`/private/tmp/claude-501/d-ajv-if.cjs`).

### 모든 쓰기 경로
3.10 `interpret`는 노드에 드는 모든 쓰기의 경계에서 한 번 돕니다(WRITE-056). 해당하는 쓰기는 다음과 같습니다.
   - 입력 쓰기: 옵션 없음·`Merge`·`Overwrite`(WRITE-080)
   - `setValue(V)`와 로드: 마운트·`reset()`·`resetSubtree()`(WRITE-090)
   - 조상 쓰기가 나눠 준 값(WRITE-018, WRITE-082)
   - 채움(WRITE-090)
   - `controls.derived`(WRITE-011)
   - union 노드 자체를 대상으로 한 `controls.injectTo`(WRITE-012)
   - `unsetValue`와 나감의 비움
   - 포커스 아웃 `trim`(WRITE-083)
3.11 한 진입에서 쓰인 값(입력 쓰기, `setValue`, 로드, 채움)은 두 번 해석합니다(U7, SETTLE-005, SETTLE-010). (원장 변경: SETTLE-005)
   - 첫째, 쓰기 경계에서 그때 알려진 목록으로 해석합니다. 그 목록은 직전 커밋의 유효 목록이고, 마운트·`reset()`이면 `schemaType`입니다.
   - 둘째, 그 진입의 전이 단계에서 최종 유효 목록으로 한 번 더 `interpret`합니다. 대상은 쓰인 노드뿐이고, 커밋 전에 합니다.
   - 이번 진입에서 쓰이지 않은 노드는 다시 해석하지 않습니다.
   - 그래서 `setValue({kind:'num', a:'42'})`는 직전 상태와 상관없이 `a = 42`입니다.
   - 둘째 해석은 목록이 바뀐 노드에서만 결과를 바꿉니다. `interpret`가 멱등이기 때문입니다.
3.12 union 노드에 대한 `Merge` 쓰기는 늘 값 전체를 바꿉니다. union은 객체 호스트가 아니기 때문입니다(R16, WRITE-079).
3.13 union 값 안(`/slot/key`)을 가리키는 `controls.injectTo` 대상은 `INJECT_TARGET_MISSING`입니다. `controls.children` 대상은 2.23의 청사진 오류입니다(CONTROLS-079, CONTROLS-073 (2)).【편집자 7】
3.14 어긋난 값을 로드하면 바꾸지 않고 그대로 들고, 경고등을 켜며, 받은 그대로 방출합니다(WRITE-054, VALUE-033).
3.15 `trim`은 union 행의 `finishInput`이 맡습니다(R17, WRITE-083). (원장 변경: CONTROLS-006)
   - 현재 값이 문자열이면 자르고, 그 결과를 `interpret`에 넘깁니다.
   - 문자열이 아니면 아무것도 하지 않습니다.
   - 경고는 없습니다.

### 경고등과 경고
3.16 `valueTypeMismatch = raw !== undefined && !(raw === null && nullable) && !isMemberOfEffectiveList(raw)`입니다(VALUE-030, SURFACE-052, U4). (원장 변경: VALUE-030)
   - 원본과 노드의 현재 spec만의 함수입니다.
   - 커밋 때 원본이 바뀐 노드와, 같은 정착에서 유효 스키마가 바뀐 노드에서 다시 계산합니다.
3.17 쓰기 없이 게이트만 바뀌면 경고등만 다시 정합니다(U6).
   - 기존 원본을 새 유효 목록에 비춰 경고등을 다시 정합니다.
   - 값은 다시 해석하지 않습니다. 소급 변환은 없습니다.
   - 단일 종류 노드도 게이트가 제약을 바꿀 때 값을 다시 읽지 않으므로, 이 동작은 모든 종류에 같습니다.
3.18 경고등은 그 노드의 경로가 루트의 경로 집합에 들어가는 커밋에 켜집니다(ERROR-186, VALUE-030, U6).
   - `VALUE_TYPE_MISMATCH`는 켜질 때마다 한 번 보냅니다.
   - 켜진 채 다른 어긋난 값이 와도 다시 보내지 않습니다.
   - 꺼졌다 켜지거나, 형상을 나갔다 들어오거나, 로드로 집합을 다시 만들거나, 게이트가 좁혀 켜지면 다시 보냅니다.
3.19 쓰기 없이 경고등만 바뀐 노드는 유효 스키마 변경 통지 `UpdateJsonSchema`(가칭, EVENT-064)로 배달됩니다(U9, SETTLE-007, EVENT-045). VALUE-030의 "바뀌면 `UpdateValue`가 알린다"는 "값이나 유효 스키마가 바뀌면 그 통지가 알린다"로 고칩니다. (원장 변경: VALUE-030)
3.20 `VALUE_TYPE_MISMATCH` 기록은 `{ level: 'warning', code, path, expected: { schemaType, nullable, effective }, received, reason, candidates?, source }`입니다(R3, U9, ERROR-186, EVENT-060). (원장 변경: ERROR-186)
   - `expected.schemaType`은 `node.schemaType`이고, `expected.effective`는 그 커밋의 유효 목록입니다.
   - `received`는 `'string'|'number'|'integer'|'nonFinite'|'boolean'|'null'|'object'|'array'|'other'` 가운데 하나입니다.
   - `reason`은 받아 줄 형이 없으면 `'unconvertible'`, 둘 이상이면 `'ambiguous'`입니다.
   - `candidates`는 `'ambiguous'`일 때만 `['string','boolean']`으로 싣습니다.
   - `source`는 EVENT-060의 쓰기 출처 값에 `'gate'`를 더한 것입니다. `'gate'`는 게이트가 좁혀 쓰기 없이 켜진 경우입니다.
3.21 `valueTypeMismatches`는 켜졌으면 `[path]`, 아니면 공유하는 얼린 빈 배열입니다. 커밋 번호로 메모하며, 객체·배열 값의 안쪽 경로는 넣지 않습니다(VALUE-030).
3.22 `valueTypeMismatch === false`는 값이 이 노드 유효 목록의 형이거나, 없거나, 노드가 nullable일 때 `null`이라는 뜻일 뿐, 검증 통과를 뜻하지 않습니다(공통 §2, U9, SURFACE-052). 게이트가 `null`을 빼는 것은 검증 전용입니다. 이 문구를 `FormTypeInputProps`와 게터의 주석에 같이 적습니다.

### 방출·채움
3.23 `omitEmpty`(기본 켜짐)는 union의 현재 값 전체를 봅니다. `''`, 키가 없는 `{}`, 빈 `[]`은 방출하지 않고, `0`·`false`·`null`은 방출합니다(VALUE-034, 소유자 결정 (c)).
3.24 union은 잎이므로, 방출이 없을 때의 자리는 VALUE-034 그대로입니다. 루트는 `undefined`이고 배열 아이템 자리는 `null`입니다(R15).
   - 그래서 `omitEmpty`가 켜진 union 아이템이 `{}`를 들면 `null`이 방출됩니다.
   - `{}`를 남기려면 작성자가 `omitEmpty: false`를 적습니다.
3.25 방출은 원본을 참조 그대로 내며, 객체·배열을 복사하지 않습니다(VALUE-012, WRITE-013).
3.26 터미널 object·array 노드와, 객체·배열을 받는 union이 통째로 든 값의 안쪽은 폼이 정규화하지 않습니다(V1, VALIDATE-007). (원장 변경: VALIDATE-007, ERROR-164)【편집자 13】
   - 안쪽의 JSON 부정합은 VALIDATE-007을 어길 수 있습니다. `undefined`인 키, 배열 중간의 `undefined`·빈 자리, 비유한 수, `Date`·함수·bigint가 그렇습니다.
   - 예: `{type:['object','string'], minProperties:1}`에 `{a: undefined}`는 메모리 판정을 통과하지만, 직렬화 뒤 판정에서는 실패합니다.
   - 개발 모드에서는 그런 값의 참조가 바뀐 커밋마다 깊이 점검합니다. 부정합이 있으면 `(가칭) SCHEMA_FORM_WARNING.NON_JSON_WHOLE_VALUE`를 `(code, path)`로 로드마다 한 번 냅니다. 기록은 `{ path, innerPaths }`(앞의 N개)입니다.
   - 프로덕션에서는 검사하지 않습니다. 이 한계를 문서에 적습니다.
3.27 채움 값은 `controls.default` > `default`의 값 전체입니다(WRITE-090, 소유자 결정 (c)).
   - 노드가 생길 때 원본이 `undefined`인 경우에만 한 번 들어가며, `interpret`(3.11의 두 번 해석 포함)를 지납니다.
   - 그래서 로드된 `{}`는 이미 있는 값이며, `default`로 덮이지 않습니다.
   - 객체 호스트는 `{}`도 채움을 받는다는 점(WRITE-082)과 다릅니다.
3.28 목록 밖 `default`(예: `['string','boolean']`에 `default: 0`)는 마운트 때 경고등을 켜고, `source: 'fill'`, `reason: 'ambiguous'`로 경고를 한 번 보냅니다(공통 결정 "`default`도 규칙 A").
3.29 `default`의 객체·배열은 복사하지 않고 불변으로 다룹니다(WRITE-071).

### 식·게이트·판별자
3.30 식의 경로는 방출 트리를 JSON Pointer로 내려가되, 객체의 자기 키와 배열의 색인으로만 내려갑니다(CONTROLS-080 (5)). 원시 값 아래는 `undefined`이므로, union 값이 `"abc"`일 때 `./slot/length`는 `undefined`입니다. (원장 변경: CONTROLS-080)
3.31 게이트와 식은 어긋난 값도 거르거나 변환하지 않고 봅니다(CONTROLS-074, FRAGMENT-008). 그래서 `['number','string']` 판별 키에 기본 입력으로 친 `"1"`은 `const: 1` 분기를 켜지 않습니다.
3.32 판별 키가 union이어도 FRAGMENT-007의 분기 규칙은 그대로입니다(R17, BLUEPRINT-017). (원장 변경: FRAGMENT-007, ERROR-164)【편집자 8】
   - 분기의 `const`·`enum` 리터럴의 JSON 종류가 판별 키의 목록(`schemaType`, 원소 하나인 경우 포함)과 nullable 어디에도 없을 수 있습니다.
   - 그러면 청사진이 개발 모드 경고 `(가칭) SCHEMA_FORM_WARNING.DISCRIMINATOR_BRANCH_UNREACHABLE`을 냅니다.
3.33 기본 입력은 친 글에 core와 같은 `interpret`를 유효 목록으로 적용하고, 결과가 목록의 한 형일 때만 그 결과를 보냅니다(공통 결정 기본 입력 (나), REACT-027, U4). (원장 변경: NODE-056)【편집자 9】
   - 그래서 `['number','string']`에서 보내는 값은 늘 문자열입니다(`"42"`는 이미 멤버).
   - 게이트가 목록을 `['number']`로 좁힌 동안에는 `42`입니다.

## 4. 입력 바인딩

### Hint와 props
4.1 Hint는 `{ type: node.type, schemaType: node.schemaType, nullable: node.nullable, path, required, jsonSchema, format, formType }`입니다(R10, O6; 오늘은 `type: node.schemaType`, `src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts:69-77`).
4.2 `FormTypeInputProps`의 `type`·`schemaType`·`nullable`은 Hint와 같은 값이고, 여기에 `valueTypeMismatch`가 더해집니다(R10, T1, SURFACE-052; 오늘 `src/types/formTypeInput.ts:47`, `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:124`). union 노드의 `value`·`onChange` 형은 1.14를 따릅니다.
4.3 입력은 종류뿐 아니라 스키마 자신의 형도 알 수 있습니다(O6 소유자 요구).
   - `props.schemaType`은 `'integer'`를 보존한 계산된 허용 형이고, union이면 목록입니다.
   - `props.jsonSchema`는 저자의 선언을 담은 유효 스키마입니다. `jsonSchema.type`은 켜진 선언의 교집합입니다.
4.4 노드, Hint, 입력 props에서 같은 이름은 같은 값입니다(R10; 렌더러 props의 `type`은 이미 `node.type`, `src/types/formTypeRenderer.ts:21`). 오늘의 이름 함정(`hint.type`이 `node.schemaType`인 것)은 이것으로 사라집니다.

### 시험 객체
4.5 시험 객체의 키는 `type`·`schemaType`·`path`·`required`·`nullable`·`format`·`formType`의 일곱입니다(R11; `src/helpers/formTypeInputDefinition/formTypeInputDefinitions.ts:44-58`). 대조 규칙은 오늘과 같습니다. 시험 값이 스칼라면 `===`, 배열이면 "그중 하나"입니다.
4.6 시험 객체의 형은 다음과 같습니다(R11, R2; 오늘 `type`은 `src/types/formTypeInput.ts:163`).
   - `FormTypeTestObject.type`은 `SchemaNodeType | SchemaNodeType[]`입니다. `'union'`은 들고 `'integer'`는 없습니다.
   - `FormTypeTestObject.schemaType`은 `JSONSchemaType | JSONSchemaType[]`입니다. `'null'`이 들고, 배열은 "이 스칼라들 가운데 하나"라는 뜻입니다.
4.7 union 노드의 배열 `schemaType`은 4.5의 규칙에 따라 어떤 객체 시험과도 맞지 않습니다(R11). union은 `{type:'union'}`이나 함수 시험으로 잡습니다.
4.8 시험 객체를 정규화할 때 일곱 키 밖의 키는 대조에서 빼고, 정의마다 한 번 개발 모드 경고 `(가칭) SCHEMA_FORM_WARNING.FORM_TYPE_TEST_INVALID`를 냅니다(공통 §1). (원장 변경: ERROR-164)
   - 오늘은 모든 키를 비교하므로 JavaScript의 `{typo: undefined}`가 우연히 맞습니다.
   - `type`에 적힌 `'integer'`도 같은 경고를 냅니다. 이 조건은 어떤 노드와도 맞지 않습니다.
4.9 예입니다. N1 = `['string','number']`, N2 = `['string','number','null']`, N3 = `['object','string']`, N4 = `['string','null']`, N5 = `['integer','null']`로 둡니다.

| 시험 | N1 | N2 | N3 | N4 | N5 | 읽는 법 |
|---|---|---|---|---|---|---|
| `{type:'string'}` | ✗ | ✗ | ✗ | ✓ | ✗ | 종류가 string인 노드 |
| `{type:['string','number']}` | ✗ | ✗ | ✗ | ✓ | ✓ | string 종류 또는 number 종류이며, union이 아님 |
| `{type:'union'}` | ✓ | ✓ | ✓ | ✗ | ✗ | 모든 union |
| `{type:'number'}` | ✗ | ✗ | ✗ | ✗ | ✓ | 정수 포함 모든 수 노드 |
| `{schemaType:'integer'}` | ✗ | ✗ | ✗ | ✗ | ✓ | nullable 포함 정수 노드 |
| `{schemaType:['string','number']}` | ✗ | ✗ | ✗ | ✓ | ✗ | `schemaType`이 `'string'`이나 `'number'`인 스칼라 노드 |
| `{type:'object'}` | ✗ | ✗ | ✗ | ✗ | ✗ | N3은 object 노드가 아님 |
| `({type, schemaType}) => type === 'union' && schemaType.includes('object')` | ✗ | ✗ | ✓ | ✗ | ✗ | 목록으로 가르는 union은 함수 시험으로 |

### 우선순위
4.10 입력을 고르는 순서는 그대로이고, union 전용 층은 두지 않습니다(`useFormTypeInput.ts:32-33`, `src/app/plugin/PluginManager.ts:77-79`).
   - 순서는 인라인 `FormTypeInput` → `formTypeInputMap` → Form의 정의 → Provider의 정의 → `PluginManager` 목록입니다. `PluginManager` 목록에서는 플러그인 정의가 앞, 코어 기본 정의가 뒤입니다.
   - 인라인이 `null`이면 입력을 그리지 않습니다.
4.11 union 항목이 없는 플러그인에서는 union이 코어 기본 정의로 떨어집니다. 경로 키가 union 칸 아래를 가리키는 `formTypeInputMap` 항목은 노드가 없으므로 맞지 않습니다(NODE-020).

### 기본 폴백 명세
4.12 코어 기본 정의에 `{type:'union'}` 항목 하나를 더해 정의가 열한 개가 됩니다(R13, BLUEPRINT-033; `src/formTypeDefinitions/index.tsx:14-25`). (원장 변경: BLUEPRINT-033)
   - 이 항목은 `FormTypeInputString`을 감싸 아래의 초안·표시 규칙을 더한 것이며, 새 구성 요소가 아닙니다.
   - 자리는 `FormTypeInputStringDefinition` 바로 앞(`:23`)입니다.
4.13 기본 입력은 유효 목록을 `props.schemaType`과 `props.jsonSchema.type`의 교집합(2.4)으로 구합니다(U9). core와 같은 내부 함수를 쓰고, `jsonSchema` 참조로 메모합니다.【편집자 15】
4.14 값이 `undefined`·`null`·문자열·수·불리언이고 유효 목록에 원시 형이 하나라도 있으면 글 상자를 보입니다(REACT-027). 표시는 `String(value)`이며, `undefined`와 nullable 노드의 `null`은 빈 칸입니다.
4.15 초안은 다음 규칙을 따릅니다(공통 결정 (나), REACT-027, U9, 3.33).
   - 빈 칸은 `undefined`를 보냅니다.
   - 키 입력마다, 그리고 흐려질 때 그 순간의 유효 목록으로 `interpret`합니다. 목록의 한 형이 되면 그 결과를 보냅니다.
   - 목록의 한 형이 되지 않으면 보내지 않고 초안으로 듭니다. 흐려지면 표시를 노드 값으로 되돌립니다.
   - 유효 목록이 바뀌면 지금 초안으로 판정을 다시 돌립니다. 이제 목록의 한 형이 될 때만 보냅니다.
   - 입력기 조합 중에는 보내지 않습니다.
4.16 값이 객체나 배열이면 `JSON.stringify(value)`를 읽기 전용으로 보이고 비우기 단추를 둡니다(R13, 소유자 결정 (c)).
   - 비우기는 nullable이면 `null`, 아니면 `undefined`를 보냅니다.
   - 문자열화 결과는 값 참조로 메모합니다.
   - 문자열화가 던지면 무효 표지만 보입니다.
4.17 유효 목록에 원시 형이 없는 union(`['object','array']`, 또는 3.3의 빈 목록)에 값이 없으면 빈 읽기 전용 상자를 보입니다(R20). 기본 입력으로는 값을 만들 수 없으며, 이는 문서에 적는 한계입니다. 편집기는 UI 플러그인이 맡습니다.
4.18 `valueTypeMismatch`가 참이면 `aria-invalid`와 무효 표지를 붙이고, 경고등이 켜진 값을 빈 칸처럼 그리지 않습니다(REACT-027, SURFACE-052).
4.19 union 칸에 `enum`·`const`가 있어도 기본 입력은 문자열 입력이며, 기본 enum·radio 정의를 union에 열지 않습니다(R13, BLUEPRINT-034 (4)).
   - 그래서 `['number','string']` + `enum:[1,'a']`에서 기본 입력으로 친 `"1"`은 문자열로 남고, 검증기가 기각합니다.
   - 이 사용성 빈틈은 UI 플러그인이 메웁니다.
4.20 `format`은 문자열 입력이 이미 하는 만큼만 씁니다(`password`·`email`, `src/formTypeDefinitions/FormTypeInputString.tsx:22-26`). 날짜 정의는 union에 걸리지 않습니다.
4.21 기본 입력이 약속하지 않는 것은 여섯입니다(BLUEPRINT-033 "최소 구현").
   - `string`이 유효 목록에 있을 때 다른 원시 형을 만드는 것
   - 객체·배열을 만들거나 편집하는 것
   - 편집 모드에서 `null`을 만드는 것
   - 문자열 표기가 겹치는 enum 리터럴을 가르는 것
   - `const`·`format`·`enum`의 의미
   - 모양과 접근성

### 플러그인 계약 문구 (`FormTypeInputProps` 주석과 플러그인 문서에 싣는 글)
> union 입력은 `type === 'union'`일 때 다음을 읽습니다.
> - `schemaType`: 목록입니다. 순서에 core의 뜻은 없습니다.
> - `nullable`, `value`, `valueTypeMismatch`, `required`
> - `jsonSchema`: `jsonSchema.type`은 켜진 선언의 교집합이며, 형 없는 칸에서는 없을 수 있습니다. 게이트가 좁힌 목록은 `schemaType`과 `jsonSchema.type`의 교집합입니다.
>
> 보내는 값은 JSON 형이 목록에 있는 값이나 `undefined`입니다. `null`은 nullable일 때 비우기 조작으로만 보내고, 빈 칸은 `undefined`로 보냅니다. `value`는 어긋난 값일 수 있으므로 `onChange`보다 넓은 형입니다.
>
> 치다 만 글과 입력기 조합 중인 글은 입력이 초안으로 들고, 흐려지면 노드 값으로 되돌립니다.
>
> 목록 밖의 값을 보내도 오류가 아니고 버려지지도 않습니다. core의 규칙 A가 받아서, 받아 줄 형이 정확히 하나면 그 형으로 바꾸고, 아니면 그대로 두고 경고등을 켭니다. 게이트가 목록을 좁힌 동안에는 좁혀진 목록으로 해석합니다. 입력은 이 결과를 다음 렌더의 `valueTypeMismatch`로 압니다. `valueTypeMismatch === false`는 검증 통과가 아닙니다.
>
> 객체·배열 값은 불변으로 다룹니다. 바꿀 때는 새 참조를 보내고, 받은 값을 제자리에서 바꾸지 마십시오. 값 안에 JSON이 아닌 것(`undefined`인 키, `Date` 등)을 넣지 마십시오.
>
> 목록의 순서에 기대지 마십시오. core가 사용자가 뜻한 형을 골라 준다고 가정하지 마십시오.

4.22 규칙 A를 미리 보는 공개 함수는 지금 내보내지 않습니다(R12). 입력은 `valueTypeMismatch`로 결과를 보며, 함수를 나중에 더하는 것은 추가 변화입니다.
4.23 union 칸 인라인 하위 스키마의 `presentation.FormTypeInput`은 그릴 자리가 없으므로 2.25의 경고 대상입니다(공통 §1).

## 5. 검증기 계약

5.1 `Validator` 문서 주석에 계약 문장을 넣습니다(R18, V2, VALIDATE-044). (원장 변경: VALIDATE-044)
   > core는 `compile` 결과와 가드에 방출 트리를 참조로 넘긴다. 검증기와 가드는 받은 값과 받은 스키마를 바꾸지 않는다. 값을 바꾸는 사용자 정의 키워드(ajv `modifying: true` 등)를 쓰지 않는 것은 소비자의 책임이다.
5.2 core는 검증에 넘기는 값을 복사하지 않습니다(속도 우선, VALIDATE-049; 오늘도 참조, `src/core/nodes/AbstractNode/AbstractNode.ts:716-718`, `schema-form-ajv8-plugin/src/validator/createValidatorFactory.ts:23-25`).
5.3 ajv 플러그인 셋(ajv6·7·8)의 `bind(instance)`는 값을 바꾸는 옵션이 켜진 인스턴스를 거부합니다(O4). (원장 변경: VALIDATE-003, ERROR-164)【편집자 16】
   - 검사 대상은 `o.coerceTypes || o.useDefaults || o.removeAdditional`이고, `o`는 ajv7·8이면 `instance.opts`, ajv6이면 `instance._opts`입니다.
   - 켜져 있으면 `(가칭) UNHANDLED_ERROR.VALIDATOR_BIND_REFUSED`를 부른 쪽에 즉시 던지고, 인스턴스를 붙이지 않습니다.
   - 폼 인스턴스가 없으므로 `onError`는 받지 않습니다. `UNHANDLED_ERROR.REGISTER_PLUGIN` 행과 같은 부류입니다.
   - 오늘의 `bind`는 무엇이든 받습니다: ajv8 `schema-form-ajv8-plugin/src/default/validatorPlugin.ts:46`, ajv7 `schema-form-ajv7-plugin/src/validator/validatorPlugin.ts:49`, ajv6 `schema-form-ajv6-plugin/src/validator/validatorPlugin.ts:43`.
   - 사본 경로는 두지 않습니다.
5.4 사용자 정의 키워드의 `modifying`은 옵션으로 알아낼 수 없습니다(V2). 그래서 판별하지 않고, 런타임 감지도 약속하지 않으며, 5.1의 소비자 책임으로 둡니다. ajv는 이 키워드를 따로 처리합니다(`schema-form-ajv8-plugin/node_modules/ajv/lib/compile/validate/keyword.ts:52`).
5.5 VALIDATE-002의 "같은 설정"은 값을 바꾸는 옵션을 쓰지 않는 것을 포함합니다. 이 가운데 세 옵션은 이제 `bind`가 강제합니다(O4). (원장 변경: VALIDATE-002)
5.6 검증기에 넘기는 스키마 사본은 (검증기 인스턴스, 작성 루트)마다 한 번 깊이 복사합니다(R18, VALIDATE-004, VALIDATE-018). (원장 변경: VALIDATE-004, VALIDATE-018) 오늘은 다음 세 가지 때문에 작성 스키마가 바뀔 수 있습니다.
   - 제거할 키가 없으면 원본을 넘깁니다(`src/helpers/jsonSchema/stripSchemaExtensions/stripSchemaExtensions.ts:32-36`).
   - 플러그인은 얕게 펼칩니다(`createValidatorFactory.ts:19-22`).
   - ajv8은 `nullable: true`인 스키마의 작성자 `type` 배열에 `'null'`을 push합니다(`node_modules/ajv/lib/compile/validate/dataType.ts:28,35`).
5.7 ajv8 플러그인의 세 진입점(`default`·`2019`·`2020`) 기본 설정에 `allowUnionTypes: true`를 더합니다(VALIDATE-003). (원장 변경: VALIDATE-003)【편집자 11】
   - 판정은 바뀌지 않습니다.
   - `strictTypes`의 기본값 `"log"`가 union `type`마다 내는 `console.warn`만 없앱니다.
   - ajv7은 이미 `strict: false`이고(`schema-form-ajv7-plugin/src/validator/validatorPlugin.ts:22`), ajv6에는 strict 모드가 없습니다.
5.8 어긋난 union 값의 형 에러와 union 객체·배열 값 안쪽의 에러는 union 노드가 받고, `dataPath`는 그대로 둡니다(VALIDATE-043 (4); 오늘은 노드를 찾지 못하면 버림, `src/core/nodes/AbstractNode/utils/ValidationManager/ValidationManager.ts:150`).
5.9 규칙 A와 경고등은 검증기를 쓰지 않습니다(BLUEPRINT-033, P1′). 형 밖의 제약(`enum`, `properties`·`items`, 그 밖의 키워드)과 게이트가 뺀 `null`은 검증기가 판정합니다.
5.10 멤버십은 얕게만 봅니다. 통째로 든 값 안의 JSON 부정합은 3.26의 개발 모드 경고로만 드러내고, 폼은 값을 정규화하지 않습니다(V1, VALIDATE-007).

## 6. 이주 (오늘 → 새 설계)

| # | 대상 | 오늘 (근거) | 새 설계 | 규칙 |
|---|---|---|---|---|
| M1 | `['string','number']`처럼 null 없는 두 형 | `UNKNOWN_JSON_SCHEMA` (`extractSchemaInfo.ts:28-29` → `schemaNodeFactory.ts:116`) | union 잎 | 2.2 |
| M2 | 원소가 셋 이상인 `type` 배열 | 같은 오류 (`extractSchemaInfo.ts:25`) | union(+nullable) | 2.2 |
| M3 | `['integer','number']` | 같은 오류 (`:28-29`) | number 노드, `schemaType` `'number'` | 2.5 |
| M4 | `['object','string']`, `['object','array']`, `['array','string']` | 같은 오류 | 터미널 강제 union. 안쪽 `find`는 없음. `{}`·`[]`를 방출하려면 `omitEmpty: false` | 2.23, 3.23 |
| M5 | `type`이 배열이고 `nullable:true`가 함께 있음(`{type:['string'], nullable:true}` 같은 비 union 포함) | 배열 경로는 `nullable`을 보지 않음 (`extractSchemaInfo.ts:24-34`) | `nullable: true` | 2.1 |
| M6 | 형 없는 원시 `anyOf`·`oneOf` (TypeBox, pydantic, zod) | `UNKNOWN_JSON_SCHEMA` (`:23`) | union·원시 잎(+nullable) | 2.11–2.15 |
| M7 | 형 없는 칸의 분기가 모두 null 분기(`{anyOf:[{type:'null'}]}`) | 같은 오류 (`:23`) | null 노드, nullable | 2.15 |
| M8 | 형 없는 `{allOf:[{type:'string'}]}` | 병합 처리기 없음 (`processAllOfSchema.ts:31-32`) → 오류 | string 노드 | 2.6–2.7 |
| M9 | `['null','null']` | nullable null 노드 (`extractSchemaInfo.ts:28,30`) | `UNKNOWN_JSON_SCHEMA` | 2.5 |
| M10 | nullable 기반에 붙은 형 없는 `allOf` 항목 `{nullable:false}` | null이 빠짐 (`processSchemaType.ts:57,65-67`) | 효과 없음 | 2.1, 2.7 |
| M11 | `{type:['string','null'], allOf:[{type:['number','null']}]}` | `ALL_OF_TYPE_REDEFINITION` (`winglet/json-schema/src/filters/isCompatibleSchemaType.ts:62-68`) | null 노드, nullable | 2.8 |
| M12 | `{type:'number', allOf:[{type:['number','string']}]}` | `ALL_OF_TYPE_REDEFINITION` (`processAllOfSchema.ts:45-50` ← `validateCompatibility.ts:21-25` ← `isCompatibleSchemaType.ts:77-83`) | number 노드(교집합) | 2.7–2.10 |
| M13 | `Hint.type`·`FormTypeInputProps.type` | `node.schemaType` (`useFormTypeInput.ts:70`, `SchemaNodeInput.tsx:124`) | `node.type`. 정수 노드는 `'integer'`에서 `'number'`로 바뀌고, 새 칸 `schemaType`이 생김 | 4.1–4.3 |
| M14 | `{type:['number','integer']}` 시험 | 코어 `src/formTypeDefinitions/FormTypeInputNumber.tsx:44`, antd5·antd6 Number `:62`·Slider `:53`, antd-mobile Number `:51`, mui Number `:120` | `{type:'number'}`. 정수만이면 `{schemaType:'integer'}` | 4.5–4.6 |
| M15 | 함수 시험의 `type === 'integer'` 절 | antd5·antd6 RadioGroup `:86`, antd-mobile RadioGroup `:91`·Slider `:59`, mui RadioGroup `:125`·Slider `:114` | 죽은 조건이므로 지움(TS2367로 드러남) | 4.1 |
| M16 | mui 수 입력의 동작 전체 | 빈 칸은 `null`(`schema-form-mui-plugin/src/formTypeInputs/FormTypeInputNumber.tsx:74-76`). 정수는 `type === 'integer'`로 판정해 `parseInt`로 자름(`:81`). `step`(`:109`) | 빈 칸은 `undefined`. 판정은 `schemaType === 'integer'`. 자르지 않음. 해석할 수 없는 글은 초안(REACT-027, WRITE-075) | 4.2, 4.15 |
| M17 | `FormTypeTestObject` 형 선언 | `type: JSONSchemaType \| JSONSchemaType[]` (`src/types/formTypeInput.ts:163`) | `type: SchemaNodeType \| SchemaNodeType[]`, 새 키 `schemaType` | 4.6 |
| M18 | 시험 객체의 모르는 키 | 모든 키를 비교해 `{typo: undefined}`가 우연히 맞음 (`formTypeInputDefinitions.ts:44-58`) | 대조에서 빼고 개발 모드 경고 | 4.8 |
| M19 | 코어 기본 입력 정의 | 열 개 (`src/formTypeDefinitions/index.tsx:14-25`) | 열한 개(`{type:'union'}` 감싸개) | 4.12 |
| M20 | 가드 `isTerminalNode`·`isBranchNode` | `node.group`을 봄(`src/core/nodes/filter.ts:77,198`). `isTerminalNode` 반환 형은 `BooleanNode \| NumberNode \| StringNode \| NullNode` (`:197`) | `strategy`를 봄. 반환 형에 `UnionNode`가 더해짐. 좁힌 뒤 `switch (node.type)`에 `case 'union'` 필요 | 1.15 |
| M21 | `InferValueType`의 `as const` `type` 배열 | `any` (`src/types/value.ts:10-15`) | 정확한 합 형. 새 형 오류가 날 수 있음 | 1.19 |
| M22 | `InferJSONSchema<A\|B>` | 분배되어 `StringNode \| NumberNode` (`src/types/jsonSchema.ts:40-88`) | `UnionSchema`, `UnionNode` | 1.21 |
| M23 | `SchemaNode` 합집합, `FormTypeRendererProps.type` | `UnionNode`와 `'union'` 없음 (`formTypeRenderer.ts:21`) | 망라 `switch`에 `case 'union'`을 더함 | 1.12 |
| M24 | `coerceTypes`·`useDefaults`·`removeAdditional`을 켠 ajv 인스턴스의 `bind` | 받아들이고, 살아 있는 폼 값이 제자리에서 바뀜 (`default/validatorPlugin.ts:46`, `AbstractNode.ts:718`, `createValidatorFactory.ts:23-25`) | `bind`가 `VALIDATOR_BIND_REFUSED`를 던짐. 폼에는 값을 바꾸지 않는 인스턴스를 따로 만들어 넘김 | 5.3 |
| M25 | 검증기에 넘기는 스키마 사본 | 얕음 (`createValidatorFactory.ts:19-22`, `stripSchemaExtensions.ts:32-36`) | 깊은 사본을 한 번 | 5.6 |
| M26 | ajv8에서 union `type` | `strictTypes` 로그 경고 | 경고 없음(`allowUnionTypes`) | 5.7 |
| M27 | 터미널 아래 경로의 검증 에러 | 버려짐 (`ValidationManager.ts:150`) | 터미널(union) 노드가 받음 | 5.8 |
| M28 | 단일 노드 파서 | `parseNumber`는 숫자가 아닌 문자를 지우고 `Math.trunc`로 자름(`src/core/parsers/parseNumber.ts:31-39`). `parseBoolean`은 참 거짓 판정(`parseBoolean.ts:34-41`). `parseString(true)`는 `''`(`parseString.ts:34-38`) | 공통 이주를 따름(WRITE-075의 변환 목록, 실패는 값 보존과 경고등) | 3.5 |
| M29 | 기본 입력의 빈 칸·초안 | 문자열 입력은 글을 그대로 보냄(`src/formTypeDefinitions/FormTypeInputString.tsx:27-29`). 수 입력은 `valueAsNumber`를 보냄(`FormTypeInputNumber.tsx:22-24`) | 공통 이주를 따름(REACT-027: 빈 칸은 `undefined`, 해석할 수 없는 초안은 흐려질 때 되돌림) | 4.15 |
| M30 | 터미널 object·array 값 안의 JSON 부정합 | 검사 없음 | 개발 모드 경고 `NON_JSON_WHOLE_VALUE` | 3.26 |

바뀌지 않는 것은 다음과 같습니다.
- `['object','null']`은 nullable object이고, `['null']`은 null 노드입니다.
- `[]`와 `['string','string']`은 오류입니다.
- `{type:'number', allOf:[{type:'integer'}]}`와 `{type:'integer', allOf:[{type:'number'}]}`의 `schemaType`은 `'integer'`입니다(`processSchemaType.ts:73`, `isCompatibleSchemaType.ts:90-93`).
- `{type:'string', allOf:[{type:['string','null']}]}`는 nullable이 아닌 string입니다.
- 서로소인 정적 선언(`{type:'string', allOf:[{type:'number'}]}`)은 `ALL_OF_TYPE_REDEFINITION`입니다.
- union이 아닌 모든 노드의 `schemaType` 값도 그대로입니다.

## 7. 소유자 결정 기록 (2026-09-26, merged-v2 검토 의견)

| ID | 결정 | 반영 규칙 |
|---|---|---|
| O1 | (가) 채택. `schemaType`을 넓혀 계산된 허용 형 목록으로 둡니다. union에서도 `null`은 `nullable`이 맡습니다. 저자 원문을 그대로 옮기는 필드는 두지 않습니다. | 1.3–1.7 |
| O2 | (가) 채택. 형 없는 칸의 `const`·`enum`만 있는 분기는 `UNKNOWN_JSON_SCHEMA`이며, 오류에 그 분기의 schemaPath와 "`type`을 적으라"는 안내를 싣습니다. | 2.12 |
| O3 | (가) 채택. 객체·원시가 섞인 `oneOf`·`anyOf`는 `UNKNOWN_JSON_SCHEMA`입니다. object variant 호스트(분기가 객체 스키마인 `oneOf`·`anyOf`, 깊이와 상관없는 자식 하위 트리 포함)는 건드리지 않습니다. O3은 자기 `type` 없는 칸의 분기가 object·array와 원시를 섞는 경우만 다룹니다. | 2.15, 2.24 |
| O4 | (나) 채택. `coerceTypes`·`useDefaults`·`removeAdditional`이 켜진 ajv 인스턴스는 `bind`에서 오류로 거부하고, 사본 경로는 두지 않습니다. 값을 바꾸는 사용자 정의 키워드(`modifying: true`)는 알아낼 수 없으므로, 계약상 소비자 책임입니다. | 5.1, 5.3–5.5 |
| O5 | (가) 채택. BLUEPRINT-033의 목록 출처는 `node.schemaType`(+`nullable`)이고, 게이트가 켜진 동안에는 유효 목록입니다. 계산값 도장은 찍지 않습니다. | 1.8–1.9, 3.2 |
| O6 | (가) 채택. `hint.type`·`props.type`은 종류 `node.type`이고, 새 칸 `schemaType`을 둡니다. 소유자 요구에 따라, 입력은 스키마 자신의 형도 알 수 있어야 하며 `props.schemaType`(`'integer'` 보존)과 `props.jsonSchema`로 압니다. | 4.1–4.4 |
| O7·O8 | 소유자가 검증에 맡겼습니다("정합하면 채택"). 검증(`out-verify-O7-O8.md`)은 v2 문구가 두 곳에서 정합하지 않다고 판정했습니다. 판정 `rulings-3.md`의 통합 원리 U1–U9로 고친 꼴을 채택합니다. | 아래 표 |

O7 쪽 결함은 F1–F11이고, O8 쪽 결함은 G1–G3이었습니다. 통합 원리는 다음과 같습니다.

| 원리 | 내용 | 닫은 결함 | 반영 규칙 |
|---|---|---|---|
| U1 | 한 칸의 `type` 선언들은 연언이고, 허용 집합은 교집합입니다(`null` 포함, `integer ⊂ number`). 순서와 무관합니다. | G1–G3 | 2.4, 2.6–2.10, 2.14 |
| U2 | 빈 교집합만이 충돌입니다. 정적이면 청사진 오류, 게이트이면 그 게이트들이 켜진 동안의 정착 오류입니다. `{null}`은 null 노드입니다. | F3 | 2.8–2.9, 2.19, 3.3 |
| U3 | 정적 선언이 종류·`schemaType`·`nullable`을 청사진에서 정합니다. | — | 2.7–2.10, 2.18, M12 |
| U4 | 게이트 선언은 종류·`schemaType`·`nullable`·입력 선택을 바꾸지 않고, 켜진 동안 유효 목록만 좁힙니다. 이는 모든 종류에 적용됩니다. | F5 | 1.8, 2.19, 3.2, 3.16, 3.33 |
| U5 | 유효 목록은 노드마다 유효 스키마 메모에서 파생합니다. 좁히지 않으면 `schemaType`과 같은 참조입니다. 병합표의 `type` 행은 교집합입니다. | F2, F4 | 1.22, 3.1–3.2 |
| U6 | 게이트만 바뀌면 경고등만 다시 정하고, 소급 변환은 하지 않습니다. 경고 `source`는 `'gate'`입니다. | — | 3.17–3.18, 3.20 |
| U7 | 한 진입에서 쓰인 노드는 전이 단계에서 최종 유효 목록으로 한 번 더 해석합니다. | F1 | 3.11 |
| U8 | 호스트의 게이트 없는 분기는 유효 목록을 좁히지 않습니다. | F6 | 2.17, 2.20, E42 |
| U9 | 통지 경로, `source: 'gate'`, 기본 입력의 재판정, "유효 목록" 문구, `expected.effective` 칸을 고칩니다. | F7–F11 | 3.19–3.22, 4.13–4.15 |

## 8. 원장 변경 목록

| ID | 무엇이 바뀌는가 | 근거 규칙 |
|---|---|---|
| BLUEPRINT-033 | 입력과 규칙 A의 기준 목록이 `node.jsonSchema.type`에서 `node.schemaType`(+`nullable`)으로 바뀜. 게이트가 켜진 동안은 유효 목록 (O5, U4) | 1.8–1.9, 3.2 |
| BLUEPRINT-033 | "문자열 입력을 그대로 쓰고 새 입력을 두지 않으며"에 보충: `{type:'union'}` 감싸개(유효 목록 기준 초안 규칙, 객체·배열은 읽기 전용 `JSON.stringify`와 비우기, 원시 형 없는 목록은 빈 읽기 전용) | 4.12–4.18 |
| BLUEPRINT-034 (1) | 원시만이던 `type` 배열 범위에 `object`·`array`가 들어가 터미널 강제 union이 됨. 허용 집합이 `{null}`이면 null 종류. `schemaType`은 `integer`를 보존함 | 2.1–2.2, 2.23, 1.6 |
| BLUEPRINT-034 (5) | 형 없는 원시 `anyOf`·`oneOf`는 오류에서 union·원시 잎으로 바뀜. 분기의 허용 집합을 합친 뒤 null을 뗌. null만이면 null 종류. `oneOf`+`anyOf`는 null을 포함해 교집합. 형 없는 분기(O2), 객체·원시 혼합(O3), 객체만·배열만(R8)은 오류로 남음. 중복·모르는 형은 오류 | 2.5, 2.11–2.15 |
| BLUEPRINT-011·012 | 교집합 원리(U1–U4). 정적 선언은 교집합이 종류를 정하고, 비면 청사진 오류. 게이트 선언은 정적 노드의 종류를 바꾸지 않고 유효 목록만 좁히며, 켜진 교집합이 비면 정착 오류. 게이트 선언만 있는 이름은 기존 종류별 노드 | 2.18–2.21 |
| (소유자 결정 2026-09-26 "`then`·`allOf` 좁힘은 검증 전용", 원장 미기재) | U1–U4로 대체: 정적 좁힘은 교집합으로 종류를 정하고(U3), 게이트 좁힘은 유효 목록을 좁힘(U4) | 2.7–2.10, 2.19, 3.2 |
| BLUEPRINT-032 보충 | nullable의 출처는 허용 집합 하나(배열의 `'null'`, 같은 객체에 `type`이 있는 `nullable: true`, null 분기). 정적 선언 사이는 교집합(AND), 분기와 게이트만 있는 이름은 합집합(OR). 게이트는 nullable을 바꾸지 않음. 형 있는 칸의 null 분기는 nullable을 켜지 않음 | 2.1–2.2, 2.7–2.10, 2.13–2.15, 2.17, 2.19, 2.21 |
| SCHEMA-008 (병합표 `type` 행) | 유효 스키마의 `type`은 켜진 선언의 교집합으로 병합함(`integer ⊂ number`, `null`은 양쪽에 있을 때만). 게이트 없는 분기의 `type`은 교차하지 않음(존재만) | 1.9, 2.20, 3.2 |
| NODE-041 | union 멤버의 `schemaType: UnionSchemaType`(객체·배열 포함, 길이 2 이상), `valueTypeMismatch` 판별 두 멤버 | 1.11–1.13 |
| NODE-056 | parse를 부르는 쪽에 기본 union 입력(쓰지 않는 호출)을 더함. "`type`에 적힌 순서로 부른다"는 문장을 지움(규칙 A는 순서와 무관) | 3.33, 4.13, 4.15 |
| SURFACE-052 보충 | union 멤버의 `value`는 형 수준에서 목록으로 좁히지 않음. `FormTypeInputProps`의 `value`는 판별 모양이고, `onChange`는 목록 형만 받음 | 1.13–1.14 |
| VALUE-030 | 경고등은 원본과 유효 목록의 함수이고, 모든 종류에 같음. 쓰기에 더해, 같은 정착에서 유효 스키마가 바뀐 노드에서도 다시 정함(소급 변환 없음). "바뀌면 `UpdateValue`가 알린다" → "값이나 유효 스키마가 바뀌면 그 통지(`UpdateValue`·`UpdateJsonSchema`)가 알린다" | 3.16–3.19 |
| SETTLE-005 | 전이 단계가 이번 진입에서 쓰인 노드(입력 쓰기·`setValue`·로드·채움)를 최종 유효 목록으로 다시 `interpret`함. 쓰이지 않은 노드는 해석하지 않음 | 3.11 |
| (새 항목, REACT 영역) | Hint와 입력 props의 `type` = `node.type`, `schemaType` = `node.schemaType`, `nullable` = `node.nullable`. 스키마 자신의 형은 `schemaType`·`jsonSchema`로 앎. 시험 객체 키 일곱과 형. 모르는 키는 대조에서 뺌 | 4.1–4.8 |
| REACT-027 보충 | 기본 union 입력의 표시·초안·비우기·무효 표시 규칙. 유효 목록 기준이며, 목록이 바뀌면 초안을 다시 판정함 | 4.13–4.18 |
| CONTROLS-006 | `trim`의 `finishInput`을 union 행도 씀(값이 문자열일 때만) | 3.15 |
| CONTROLS-080 (5) 보충 | 경로는 객체의 자기 키와 배열 색인으로만 내려가고, 원시 값 아래는 `undefined` | 3.30 |
| FRAGMENT-007 보충 | 판별 리터럴의 JSON 종류가 키의 목록·nullable 밖이면 개발 모드 경고 | 3.32 |
| ERROR-164 | 새 경고 행 넷: `TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`, `FORM_TYPE_TEST_INVALID`, `DISCRIMINATOR_BRANCH_UNREACHABLE`, `NON_JSON_WHOLE_VALUE`(모두 `warning`, 새 설계에만) | 2.25, 4.8, 3.32, 3.26 |
| ERROR-164 | 새 오류 행: `(가칭) UNHANDLED_ERROR.VALIDATOR_BIND_REFUSED`(`error`, `bind` 호출, 부른 쪽에 즉시 throw, 핸들러 전달 없음, 새 설계에만) | 5.3 |
| ERROR-164 | `UNKNOWN_JSON_SCHEMA` 행의 "언제"에 2.5·2.12·2.15의 경우를 적음. `ALL_OF_TYPE_REDEFINITION` 행은 정적 연언의 교집합이 빈 경우만임을 적음(`{null}`은 제외). `SHARED_NODE_CONFLICT` 행에 "켜진 게이트 선언과 정적 허용 집합의 교집합이 빔"을 더함 | 2.5, 2.9, 2.12, 2.15, 2.19 |
| ERROR-186 | 기록 칸 `expected: { schemaType, nullable, effective }`, `received` 범주 고정, `reason`, `candidates`, `source`에 `'gate'` | 3.20 |
| VALIDATE-002 | "같은 설정"의 "값을 바꾸는 옵션을 쓰지 않음" 가운데 세 옵션을 `bind`가 강제함 | 5.5 |
| VALIDATE-003 | `bind`가 `coerceTypes`·`useDefaults`·`removeAdditional`이 켜진 인스턴스를 거부함. 기본값 목록에 `allowUnionTypes: true`를 더함. 사용자 정의 변경 키워드는 소비자 책임 | 5.3–5.4, 5.7 |
| VALIDATE-004·018 | 검증기에 넘기는 스키마 사본은 늘 깊은 사본이고, (인스턴스, 루트)마다 한 번 만듦 | 5.6 |
| VALIDATE-007 보충 | 터미널 object·array와, 그것을 받는 union이 통째로 든 값 안은 폼이 정규화하지 않음. 개발 모드 깊은 점검 경고를 둠 | 3.26, 5.10 |
| VALIDATE-044 | `Validator` 문서 주석에 "받은 값과 스키마를 바꾸지 않는다. 변경 키워드는 소비자 책임" | 5.1 |
| LANDING-151 | PR-7 이주 목록에 M13–M18을 더하고, 자사 플러그인마다 union 항목(권장)을 둠 | 6 |

## 9. 시험 목록

| 파일 이름 후보 | 단언 |
|---|---|
| `src/core/blueprint/__tests__/union.kind-procedure.test.ts` | §2 예 표 E1–E42의 종류·`schemaType`·nullable·전략·오류가 모두 표대로이다 |
| 같은 곳 `union.null-only.test.ts` | E30·E32·E33은 null 노드이고 nullable이며 오류가 없다. E34·E35·E38은 nullable이다. 모든 선언이 `'null'`만인 정적 연언도 null 노드이다 |
| 같은 곳 `union.static-intersection.test.ts` | 모든 선언 쌍 X·Y에서 `{allOf:[X,Y]}`와 `{allOf:[Y,X]}`의 결과(원소 순서 제외)가 같다(E39). E18·E24·E31·E38은 교집합이다. E23만 `ALL_OF_TYPE_REDEFINITION`이다. E30이 통과하면 겹침+null(E38)도 통과한다 |
| 같은 곳 `union.schema-type-invariant.test.ts` | 모든 코퍼스 칸에서 `Array.isArray(schemaType) === (type === 'union')`이다. 같은 칸의 노드와 배열 아이템이 같은 `schemaType` 참조를 가지며, 그 참조는 `Object.isFrozen`이다 |
| 같은 곳 `union.gated-narrowing.test.ts` | E25·E26·E41에서 게이트 전후로 `schemaType` 참조가 같다. 켜진 동안 유효 목록은 `['number']`·`['number']`(`schemaType`과 같은 참조)·`['integer']`이다. E40은 둘 다 켜지면 `SHARED_NODE_CONFLICT`이다. E42에서 유효 목록은 `schemaType`과 같은 참조이다 |
| 같은 곳 `union.terminal-subtree-warning.test.ts` | `['object','string']` 칸 `properties` 안의 `controls`가 경고를 한 번 낸다. `$ref` 대상에서는 경고가 없다. `options.terminal:false`는 ERROR-200이다 |
| `src/core/behaviors/utils/parse/__tests__/interpret.table.test.ts` | 3.5 표의 모든 칸. `"1.0"`·`"1e2"`·`"1e16"`·`"9007199254740993"`·`"01"`·`" true"`. `NaN`·`±Infinity`·`2**60`·`-0`·bigint·`Date`(object 멤버)·`Object.create(null)` |
| 같은 곳 `interpret.properties.test.ts` | `d-rule-a.mjs`의 전수 실행: 순서 무관, 멱등, 변환 결과 ∈ 목록, 경우 집합이 정확히 3.8의 12건, 원소 하나인 목록 = 단일 노드 행, 쓰기당 할당 0 |
| `src/core/behaviors/unionBehavior/__tests__/union.write-paths.test.ts` | 3.10의 경로마다 한 사례. `Merge` 객체 V는 통째 교체이고, `trim`은 문자열 값에서만 돈다 |
| 같은 곳 `union.mismatch-light.test.ts` | 켜짐→켜짐이면 경고 0회, 꺼짐→켜짐이면 1회, 로드하면 다시 1회. `expected`는 `{schemaType, nullable, effective}`이고, `'ambiguous'`이면 `candidates`가 있다 |
| `src/__tests__/scenarios/union.gated-effective-list.render.test.tsx` | E25에서 게이트가 켜진 뒤 친 `"42"`는 `42`로 저장된다. 켜기 전에 저장된 `"abc"`는 게이트가 켜지면 쓰기 없이 경고등이 켜지고, `source:'gate'` 경고가 1회 나며, `UpdateJsonSchema`로 배달된다. 게이트가 꺼지면 경고등이 꺼지고 값은 그대로이다. 입력 구성 요소는 바뀌지 않는다. E41에서 `1.5`는 켜진 동안 경고등이 켜진다 |
| `union.entry-two-step.render.test.tsx` | 게이트 `kind==='num'`이면 `a:number`인 스키마에서, 직전 `kind`가 `'text'`일 때와 `'num'`일 때 각각 `setValue({kind:'num', a:'42'})`를 부르면 둘 다 `a === 42`이다. 마운트·`reset()`도 같다. 쓰이지 않은 형제 노드는 다시 해석되지 않는다 |
| `union.rule-a.render.test.tsx` | 설계 요약의 규칙 A 사례와 `['integer','number','boolean']`의 `"2"`→`2` |
| `union.ambiguous.render.test.tsx` | `['string','boolean']`의 `1`·`0`은 값이 유지되고, 경고등이 켜지며, `reason:'ambiguous'`이다 |
| `union.integer.render.test.tsx` | `['integer','string']`의 `12.5`→`"12.5"`, `['integer','boolean']`의 `12.5`는 켜짐, E4는 number 규칙 |
| `union.object-array.render.test.tsx` | 멤버십, 변환 없음, 참조 유지, `find('/f/k') === null`, `./f/k` 식, 문자열 값에서 `./f/length`는 `undefined`, 기본 입력의 읽기 전용 JSON과 비우기, `['object','array']` 빈 상자 |
| `union.non-json-value.render.test.tsx` | `{a: undefined}`를 든 union과 터미널 객체에서 개발 모드 `NON_JSON_WHOLE_VALUE`가 1회 나고, 값은 바뀌지 않는다. 프로덕션에서는 검사하지 않는다 |
| `union.default-input-draft.render.test.tsx` | `['number','boolean']`: `"4"`→`4`, `"42."`는 초안(쓰기·경고 0), 흐려지면 되돌림, `"true"`→`true`, 빈 칸은 `undefined`, nullable 비우기는 `null`. `['number','string']`: `"42"`는 문자열. 치는 도중 유효 목록이 넓어지면 초안을 다시 판정해 이제 맞는 글만 보낸다 |
| `union.omit-empty.render.test.tsx` | `''`·`{}`·`[]`는 방출하지 않고, `omitEmpty:false`이면 방출한다. 아이템 자리는 `null`이고, 값 없는 루트는 `undefined`이다 |
| `union.default-fill.render.test.tsx` | `default`는 값 전체로 들어간다. 로드된 `{}`는 덮지 않는다(객체 호스트와 대조). `['string','boolean']`+`default:0`이면 마운트 때 경고가 1회 난다. `setValue(undefined)` 뒤에는 다시 채우지 않는다 |
| `union.expressions.render.test.tsx` | `if`+`const`에서 `"1"`과 `1`을 가른다. 판별 키 union의 분기가 켜진다. 목록 밖 리터럴이면 `DISCRIMINATOR_BRANCH_UNREACHABLE`이 한 번 난다 |
| `union.migration-shapes.render.test.tsx` | TypeBox `anyOf[string,number]`, pydantic `anyOf[string,null]`, ts-json-schema-generator `type` 배열, OAS `nullable:true`+`type`, M5·M7·M8·M9·M10·M11·M12 |
| `union.input-binding.render.test.tsx` | 4.9 표의 모든 칸. 인라인 `FormTypeInput`이 우선한다. `FORM_TYPE_TEST_INVALID`(모르는 키, `type:'integer'`)가 1회 난다. `{typo: undefined}` 시험은 모르는 키를 빼고 대조한다. 정수 노드의 props에서 `type === 'number'`이고 `schemaType === 'integer'`이다 |
| `schema-form-ajv{6,7,8}-plugin/src/**/__tests__/bind-refusal.test.ts` | `coerceTypes`·`useDefaults`·`removeAdditional` 가운데 하나라도 켠 인스턴스의 `bind`는 `VALIDATOR_BIND_REFUSED`를 던지고, 이전 인스턴스가 그대로 남는다. 세 옵션이 꺼진 인스턴스와 기본 인스턴스는 받는다 |
| `schema-form-ajv8-plugin/src/**/__tests__/union-types.test.ts` | `{type:['string','number']}`를 컴파일할 때 `console.warn`이 0회이다. `{type:[..], nullable:true}` 컴파일 뒤에도 작성 스키마의 `type` 배열이 그대로이다 |
| `src/types/__tests__/union.type-test.ts` (tsc 전용) | 1.18 표의 사상, 1.19–1.21의 형, union props의 `value`(판별)와 `onChange`(목록 형), `NumberNode` props의 `type === 'integer'`가 TS2367 |

## 10. 비용

| 항목 | 속도 | 메모리 | 구현 크기(추정) |
|---|---|---|---|
| 청사진 판정(§2) | 로드마다 한 번. 비 union 칸에도 드는 로드 비용 두 가지: 선언마다 `type` 파싱 O(원소 ≤ 7), 마스크 교집합 O(1). 분기 합치기는 O(분기 × 정적 연언 깊이) | union 칸마다 얼린 배열 하나와 기본 spec 하나. 노드마다 0 | 허용 집합 도우미 약 60줄(`extractSchemaInfo`와 `processSchemaType`의 형 부분 대체), 분기 합치기 약 50줄, 조각 공유 확장 약 40줄 |
| 유효 목록(U4·U5) | 좁히는 게이트가 없으면 0(같은 참조). 게이트 선언을 가진 노드는 유효 스키마 메모가 바뀔 때 O(k)의 교집합 한 번. 경고등 재계산은 O(1) | 좁혀진 메모 항목마다 작은 배열 하나와 spec 하나 | 약 40줄(병합표 `type` 행 포함) |
| 두 번 해석(U7) | 한 진입에서 쓰였고, 같은 정착에서 유효 목록이 바뀐 노드마다 `interpret` 한 번 더. 그 밖은 멱등이라 결과가 같음 | 0 | 전이 단계 약 20줄 |
| 경고 넷(2.25, 3.26, 3.32, 4.8) | 개발 모드나 핸들러가 있을 때만 돎. 비용은 터미널 하위 스키마 크기, 통째 값 크기(참조가 바뀐 커밋마다), 등록 때의 키 수에 비례 | 중복 억제 키 | 각 30–40줄 |
| 쓰기(`interpret`) | 멤버이면 `classBits` 한 번과 AND 한 번으로 O(1). 문자열 해석은 정규식 한 번과 `Number` 한 번. 후보를 세기만 하는 무할당 구현이 조건 | 0 | `parse/` 약 80–100줄, `unionBehavior/` 행 약 40줄 |
| 경고등 | 원본이나 유효 스키마가 바뀐 노드만, 커밋 때 O(1). 경고는 켜질 때만 보냄 | 얼린 빈 배열 공유 | 게터 두 개 |
| 방출·채움 | 추가 비교 없음, 복사 없음 | 0 | 0 |
| Hint·props | `useMemo` 안에서 필드 하나를 더 읽음(비 union에도 듦). 시험은 정의 수에 선형(오늘과 같음) | 0 | 형 셋, `getHint` 한 줄 |
| 기본 union 입력 | 키 입력마다 O(k ≤ 6). 유효 목록은 `jsonSchema` 참조가 바뀔 때만 O(k). `JSON.stringify`는 값 참조가 바뀔 때만 O(값 크기) | `useState` 하나, 표시 중인 객체 값마다 출력 문자열 크기의 메모 | 감싸개 약 60–80줄 |
| 검증기 | 기본 경로 0. `bind` 때 옵션 셋 검사 O(1) | 스키마 깊은 사본을 (인스턴스, 루트)마다 한 번 | 플러그인마다 약 10줄, ajv8 설정 세 줄 |
| 공개 형 | 컴파일 시간은 재지 않았음(모름) | — | `value.ts`·`jsonSchema.ts`·노드 형·props 형 약 90줄, 가드 하나 |
| 플러그인 이주 | — | — | 객체 시험 일곱 곳(코어 포함), 함수 시험 여섯 곳, mui 수 입력(빈 칸·초안·정수), 플러그인마다 union 항목 하나(권장) |

---
**편집자 각주**
- 【편집자 1】 V2-11은 판정에 없었습니다. 형 정밀도보다 구현 크기와 다른 종류 형과의 모양 일치를 택해 노드 형에는 제네릭을 두지 않았고, 목록 형으로 좁히는 일은 props가 맡습니다(1.14, T1). 그래서 SURFACE-052를 원장 변경으로 올렸습니다.
- 【편집자 2】 V2-15의 인용을 바로잡았습니다. 오늘 가드는 `strategy`가 아니라 `node.group`을 봅니다(`filter.ts:77,198`). `d-ajv-if.cjs`는 `/private/tmp/claude-501/`에 있습니다.
- 【편집자 3】 "null 표기가 없는 선언은 nullable을 지운다"(R4)는 `type`을 가진 선언에만 적용했습니다. 형 없는 선언은 A = ⊤이라 제약하지 않습니다. 오늘 `{nullable:false}` 항목이 null을 지우는 것은 M10으로 적었습니다.
- 【편집자 6】 V1 C-4는 판정에 없었습니다. "원소 하나 = 단일 노드"와 공통 §1에 따라 모든 터미널 노드에 적용했습니다.
- 【편집자 7】 D는 `INJECT_TARGET_MISSING`을 인용했는데, ERROR-164 표의 `INJECT_TARGET_NOT_FOUND` 행과 부딪칩니다. 원장 CONTROLS-079(`ledger/controls.md:1153`)가 "청사진에 없거나 터미널 아래는 모두 동적 대상 없음"이라고 정하므로 그것을 따랐습니다.
- 【편집자 8】 R17은 기존 코드를 쓰라고 했지만 맞는 코드가 없었습니다. `NULLABLE_ONE_OF_NULL_UNREACHABLE`은 ERROR-162에서 폐기되었고, `DISCRIMINATOR_MISMATCH`는 오류입니다. 그래서 같은 `…_UNREACHABLE` 이름 계열로 새 경고 하나를 두었습니다. 판별 리터럴을 읽는 것은 BLUEPRINT-017이 정한 예외 안에 듭니다.
- 【편집자 9】 R12(공개 미리보기 없음)와 NODE-056("부르는 쪽은 `interpret` 칸뿐")을 함께 지키려면, 기본 입력이 같은 내부 함수를 부르는 것을 NODE-056에 더해야 합니다. 같은 항목에 남은 "`type`에 적힌 순서로 부른다"는 규칙 A와 어긋나므로 함께 고칩니다.
- 【편집자 11】 V1 C-3의 원리 판정을 따랐습니다. VALIDATE-003이 바꾸지 않는다고 적은 기본값은 `allErrors`·`strictSchema`·`validateFormats`의 셋입니다. `allowUnionTypes`는 판정을 바꾸지 않는 로그 설정입니다.
- 【편집자 13】 VALIDATE-007에는 기존 개발 모드 점검이 없어서(`ledger/validate.md`의 VALIDATE-007은 결정 문장 하나뿐), V1이 요구한 경고를 새 코드로 두었습니다. 이름은 `(가칭)`이며 PR-4에서 확정합니다(ERROR-164 머리 문단).
- 【편집자 14】 U1–U4는 정적 선언이 있는 칸의 원리입니다. 게이트 선언만 있는 이름(E27)은 정적 노드가 없어 "게이트는 종류를 바꾸지 않는다"를 적용할 대상이 없습니다. 그래서 기존 BLUEPRINT-011·012(종류별 노드, 동시에 켜진 다른 종류는 정착 오류)를 그대로 두고, 각 노드 안의 좁힘에만 U4를 적용했습니다.
- 【편집자 15】 U9는 기본 입력이 유효 목록을 어디서 얻는지 정하지 않았습니다. 그래서 공개 props를 늘리지 않는 쪽(R12의 취지)을 택해, `schemaType`과 `jsonSchema.type`(U5로 교집합 병합)에서 core와 같은 내부 함수로 계산하게 했습니다. 플러그인도 같은 두 칸으로 알 수 있습니다(계약 문구).
- 【편집자 16】 거부 코드는 ERROR-164의 `UNHANDLED_ERROR` 부류로 두었습니다. `bind`는 모듈 전역이고 폼 인스턴스가 없는 호출이어서, `UNHANDLED_ERROR.REGISTER_PLUGIN` 행(부른 쪽에 즉시 throw, 핸들러 전달 없음)과 같은 부류입니다. 이름은 `(가칭)`이며 PR-4에서 확정합니다.
