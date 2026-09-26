# 검증 V1 — 네 제안 사이의 정합성

## 판정: 고침 필요 (12건)

범위: `out-A.md`·`out-B.md`·`out-C.md`·`out-D.md`의 규칙끼리 부딪히는 곳, 넘긴 요구의 충족 여부, 빈틈, 소유자 결정 후보. 모순을 가르는 데 필요한 코드와 원장만 직접 확인했습니다(`processSchemaType.ts`, `extractSchemaInfo.ts`, `formTypeDefinitions/index.tsx`, 원장 BLUEPRINT-033·WRITE-079·VALIDATE-003·SURFACE-058·FRAGMENT-007·SURFACE-056). 인용의 줄 번호는 각 out 파일 기준입니다.

## 지적 (심각한 것부터)

### 1 — A↔C (B도 걸림) — 유효 스키마 `jsonSchema.type`: "병합을 따라 좁혀짐"과 "계산값 도장, 바뀌지 않음"이 부딪힘. BLUEPRINT-033의 목록 출처도 엇갈림 [확인됨]
- A `out-A.md:20` (제안 8): "`then`이 목록을 좁히면 `jsonSchema.type`은 좁아지지만 노드는 union으로 남습니다. … `schemaType`은 노드가 받는 형, `jsonSchema.type`은 지금 검증에 쓰이는 형입니다." A가 C에 넘긴 요구(`:59`): "유효 스키마에 `type`을 써 넣지는 않습니다."
- C `out-C.md:53` (규칙 31): "`type`은 조각에서 병합하지 않는다. 청사진이 계산한 값을 싣는다 … 게이트 조각이 켜지고 꺼져도 `type`의 참조는 바뀌지 않는다." `:49`: "게이트가 켜져도 유효 `type`은 그대로다." C가 A에 넘긴 요구(`:148`): "BLUEPRINT-033의 '목록은 `node.jsonSchema.type`에서'는 규칙 31 덕분에 그대로 성립한다."
- B `out-B.md:33`: `schemaType`은 "유효 스키마 `type`에서 `null`을 뺀 것과 같아야 합니다." B가 C에 넘긴 요구(`:117`)도 같은 말입니다. B의 이 문장은 C와는 맞고 A와는 어긋납니다. 그런데 B `:89`는 "원문 `jsonSchema.type`(anyOf 슬롯에는 없을 수 있음)"이라고 적어, C의 도장(늘 있음)과도 어긋납니다.
- 장면: 본체 `['string','number']`에 `then:{type:'number'}`가 켜진 상태. A에서는 `jsonSchema.type === 'number'`이고 `schemaType`은 `['string','number']`입니다. C·B에서는 둘 다 `['string','number']`입니다. BLUEPRINT-033을 A는 고치고 C는 그대로 두므로 원장 문장이 하나로 정해지지 않습니다.
- 고침 안 (원리로 도출 가능): A 제안 8을 채택하고 C 규칙 31–32의 도장(과 이주 행 M11)을 뺍니다. BLUEPRINT-033의 목록 출처는 "`node.schemaType`(+`nullable`)"로 고칩니다. 근거는 셋입니다. ① 규칙 A(D `:14`)와 입력(B `:33`·`:89`)이 이미 `jsonSchema.type`이 아니라 얼린 목록을 읽습니다. ② C 스스로 `jsonSchema.type`을 읽는 플러그인이 0곳이라고 적었습니다(`out-C.md:141`). 소비자 없는 도장입니다. ③ 도장을 찍으면 한 유효 스키마 안에서 `type`만 병합을 따르지 않게 되어 BLUEPRINT-021의 뜻이 키마다 갈립니다. ajv의 `type` 배열 변이는 D 32의 깊은 사본과 D 1·C 32의 얼린 목록으로 이미 막힙니다.

### 2 — A↔C — 한 노드의 선언들 사이 `integer`/`number` 합치기: A는 합집합(→`number`), C는 교집합(→`integer`). A 자신의 "비 union은 오늘과 같다"도 깨짐 [확인됨]
- A가 C에 넘긴 요구(`out-A.md:59`): "한 노드의 선언들이 같은 종류 안에서 `integer`와 `number`로만 다르면 `number`로 합칩니다. 받는 집합의 합이 되도록 하는 것이고". A 제안 6(`:18`): "union이 아닌 노드의 `schemaType`은 오늘 값과 한 글자도 다르지 않습니다".
- C `out-C.md:23` (규칙 9): "`number`∩`integer` → `integer`". `:134` (T5): "본체 `['integer','string']` + `allOf` `['number','string']` → 목록 `['integer','string']`. `{type:'number', allOf:[{type:'integer'}]}` → `integer`."
- 오늘 코드는 교집합입니다: `processSchemaType.ts:73` `baseType === 'number' && sourceType === 'integer' ? 'integer' : baseType`. 그래서 A의 요구를 따르면 `{type:'number', allOf:[{type:'integer'}]}`의 `schemaType`이 `'integer'`에서 `'number'`로 바뀌어 A 제안 6과 부딪힙니다. mui 정수 입력(`FormTypeInputNumber.tsx:29`)이 조용히 정수 파싱을 잃습니다.
- D에도 번집니다. 목록에 `integer`가 남느냐에 따라 `12.5`가 멤버(`number`)인지, `"12.5"`로 바뀌는지(`['integer','string']`, `out-D.md:116`)가 갈립니다.
- 고침 안 (원리로 도출 가능): C를 따릅니다. 정적 연언(본체·게이트 없는 `allOf`·`$ref`)은 JSON Schema 교집합이고(오늘 코드와 같음), 게이트만 있는 선언들은 합집합입니다(C 규칙 28). A `:59`의 해당 문장은 "정적 선언 사이는 교집합, 게이트 선언만 있을 때는 합집합(C 규칙 9·28)"으로 바꿉니다.

### 3 — A↔C — `nullable`의 출처와 합치는 방식: A는 "셋 가운데 하나라도"(OR), C는 정적 선언 사이 AND에 출처 제한 둘 [확인됨]
- A `out-A.md:14` (제안 2): "세 표기 가운데 하나라도 있으면 `true`입니다: 목록에 든 `'null'`, `nullable: true`, 게이트 없는 null 분기".
- C `out-C.md:13` (규칙 1): "`nullable: true`는 **같은 객체에 `type`이 있을 때만** `null`을 더한다". `:40` (규칙 24): "자기 `type`이 non-null인 슬롯에 붙은 null 분기는 nullable을 주지 않는다". `:23` (규칙 9): "nullable ← nullable ∧ (`null` ∈ τ(d))". `:41` (규칙 25): 게이트 가진 선언이 `null`을 더해도 바뀌지 않음.
- 장면: 본체 `{type:['string','null']}`에 게이트 없는 `allOf:[{type:'string'}]`. A에서는 nullable, C에서는 non-nullable입니다. `{type:'string', anyOf:[{type:'null'}]}`도 A에서는 nullable, C에서는 아닙니다. 형 없는 `{nullable:true, anyOf:[…]}`도 A에서는 nullable, C(`:128`)에서는 아닙니다.
- 오늘 코드는 AND입니다: `processSchemaType.ts:65` `if (baseInfo.nullable && sourceNullable)`.
- 고침 안 (원리로 도출 가능): C를 따릅니다(JSON Schema 연언, OAS 3.0.3 원문, 오늘 코드). A 제안 2는 "출처는 셋(배열의 `'null'`, 같은 객체에 `type`이 있는 `nullable: true`, 형 없는 슬롯의 게이트 없는 null 분기)이고, 정적 선언 사이에는 AND, 게이트 선언만 있을 때는 OR(C 규칙 1·9·24·25·28)"로 바꿉니다.

### 4 — A 내부 (B·C와 걸림) — `Hint.type`/`FormTypeInputProps.type`: A는 보정문에서 B안(= `node.type`)을 받았지만 본문·이주 표·넘긴 요구가 옛 안(= `node.schemaType`)으로 남음 [확인됨]
- A 보정문 `out-A.md:48`: "Hint와 입력 props가 노드 필드 이름을 1:1로 따르는 안 … A는 이 안을 받아들입니다."
- 남은 옛 문장:
  - A `:81` 이주 표: "`Hint.type`, `FormTypeInputProps.type` 형이 넓어짐 … union 입력은 `Array.isArray(type)`로 받습니다."
  - A `:58` B에 넘긴 요구: "`Hint.type`은 `node.schemaType`을 그대로 비춥니다(배열이면 같은 참조)."
  - A `:65` 비용: "`Hint`는 참조를 옮기기만 합니다"(`schemaType`을 `type`에 싣는다는 전제).
  - C가 B에 넘긴 요구 `out-C.md:149`: "Hint의 `type` … 계산값을 받게 되면 `'union'` 노드의 테스트 함수는 배열을 받는다."
- B `out-B.md:25`: "`Hint.type`은 `node.type`입니다 … 늘 스칼라이고 `'integer'`는 싣지 않습니다."
- 장면: 이주 문서를 A 표로 쓰면 플러그인 작성자가 `Array.isArray(props.type)`로 union을 찾습니다. B안에서 `props.type`은 `'union'` 문자열이므로 이 검사는 늘 거짓이고, union 입력이 조용히 뽑히지 않습니다. 또 A 표에는 모든 정수 노드의 `Hint.type`이 `'integer'`에서 `'number'`로 바뀌는 파괴적 변화가 빠져 있습니다.
- 고침 안 (원리로 도출 가능): A 제안 18·19와 `:58`·`:65`·`:81`을 B 제안 8·9·12·37–39로 바꿔 씁니다. 이주 표에 "`Hint.type`·`props.type`이 `node.schemaType`에서 `node.type`으로 바뀐다(정수 노드 `'integer'`→`'number'`). 정수·목록은 `schemaType`에서 읽는다"를 더합니다. C `:149`는 지웁니다.

### 5 — A↔C — `InferSchemaNode`(형 수준)와 청사진 판정 절차(런타임)가 여러 모양에서 다른 답을 냄 [확인됨(문장 대조), 컴파일 결과는 확인 못함]
- A `out-A.md:28` (제안 13): "목록 L은 `type`이 배열이면 그 원소들이고, `type`이 없으면 `anyOf`/`oneOf` 분기들의 `type`입니다 … 둘 이상이면 `UnionNode`, 하나면 그 종류, 비면 `NullNode`입니다." `:34`: "형 없는 `const`/`enum` 분기는 오늘처럼 `AnyValue`로 둡니다."
- C `out-C.md:28` (규칙 14): "τ(b) = ⊤인 분기가 하나라도 있으면 … `UNKNOWN_JSON_SCHEMA`". `:30` (규칙 16): 객체·원시 혼합은 `UNKNOWN_JSON_SCHEMA`. `:27`: `oneOf`와 `anyOf`가 함께 있으면 `UNKNOWN_JSON_SCHEMA`. `:31`: 게이트 가진 분기는 합치기에서 뺌. `:29`: 분기의 `type`은 그 분기의 `allOf`·`$ref`에서도 모음.
- 장면:
  - `{anyOf:[{type:'object'},{type:'string'}]}`는 형으로는 `UnionNode`, 런타임에서는 오류입니다.
  - `{anyOf:[{const:'a'},{type:'number'}]}`는 형으로는 `NumberNode`(값 형에 `AnyValue`가 섞임), 런타임에서는 오류입니다.
  - `{anyOf:[{const:'a'},{const:'b'}]}`는 형으로는 L이 비어 `NullNode`, 런타임에서는 오류입니다.
  - 분기 안 `controls.active`나 `$ref`가 있으면 형과 런타임의 목록이 다릅니다.
- 고침 안 (원리로 도출 가능): A 제안 13에 "형 수준 사상은 C 절차의 부분집합이다. C가 오류로 두는 모양(형 없는 분기, 객체·원시 혼합, `oneOf`+`anyOf`)은 `never`(또는 넓은 `SchemaNode`)로 사상하고 `NullNode`로 떨어지지 않는다. 게이트·`$ref` 분기처럼 형 수준에서 판정할 수 없는 모양은 넓은 `SchemaNode`로 둔다"를 더합니다. P1·P2가 정해지면 같은 자리를 함께 고칩니다.

### 6 — A·D↔C — 목록의 중복 원소: A·D는 조용히 없애고, C는 청사진 오류 [확인됨]
- A `out-A.md:17` (5c): "중복을 없애고 처음 나온 자리의 순서를 따릅니다." D `out-D.md:14`: "`kinds`(작성된 `type`에서 `null`을 빼고 중복을 없앤 목록 …)".
- C `out-C.md:20` (S0): "중복 원소(`['string','string']`, `['null','null']`)는 청사진 오류 `UNKNOWN_JSON_SCHEMA`다." 이주 행 M10(`:108`)은 `['null','null']`을 null 노드에서 오류로 바꿉니다.
- 오늘 동작: `['string','string']`은 `extractSchemaInfo.ts:28-29`에서 `null`이 되어 오류입니다. `['null','null']`은 `:28,30`에서 nullable null 노드입니다. 두 경우가 오늘도 서로 다릅니다.
- 고침 안 (원리로 도출 가능): C를 따릅니다. JSON Schema에서 `type` 배열의 원소는 서로 달라야 하므로 중복은 잘못된 스키마이고, 공통 §1(조용히 버리지 않음)에 따라 오류입니다. A 5(c)와 D 1에서 "중복을 없앤다"를 지우고 "중복이 없음은 청사진이 보장한다(C S0)"로 바꿉니다.

### 7 — C↔D — D가 요구한 청사진 경고 둘을 C가 받지 않음. C는 "새 경고는 하나뿐"이라고 선언 [확인됨]
- D가 C에 넘긴 요구 `out-D.md:141`: "`options.trim`이 `string` 없는 union에 있을 때와, 판별 리터럴의 형이 목록 밖일 때의 개발 모드 경고 두 가지가 필요합니다(12번, 27번)."
- C `out-C.md:7`: "새 오류 코드는 없다. 새 경고는 하나뿐이다: 터미널 노드 아래의 예약 층 키". C 오류 대응표(`:81-89`)에도 두 경우가 없습니다.
- 장면: `{type:['number','boolean'], options:{trim:true}}`를 쓰면 D는 경고를 기대하지만 C의 청사진은 아무것도 내지 않습니다. 그 결과 `trim` 선언이 조용히 버려져 공통 §1을 어깁니다.
- 고침 안 (원리로 도출 가능): C 요약과 오류 대응표에 D 12·27의 경고 두 행(코드명, 수준 `warning`, 중복 억제 키 `(code, schemaPath)`, 드러남은 C 규칙 35와 같게)을 더하고, "새 경고는 셋"으로 고칩니다.

### 8 — B↔D — 규칙 A 미리보기 함수: 인자 모양과 공개 여부가 엇갈림 [확인됨]
- B `out-B.md:83` (30번): "`resolveUnionValue(schemaType, value) → { value, mismatch }` … 행의 `interpret`와 같은 함수". 소유자 결정 후보 2(`:139`)로 "공개 표면에 더할지"를 묻습니다.
- D `out-D.md:38`: "`interpret(value, spec): unknown` … 구현은 값만 돌려주고 경고등은 5번으로 따로 계산합니다". `:79`: "`behaviors/utils/parse/`의 공개 함수 하나". D는 공개를 이미 전제합니다.
- 장면: B의 인자에는 `nullable`이 없으므로 `null`의 mismatch를 판정할 수 없습니다. 또 `{value, mismatch}`와 `unknown` 반환이 다릅니다. 이대로 두면 B가 요구한 "같은 함수"(`out-B.md:116`)가 실제로는 두 구현이 됩니다.
- 고침 안 (원리로 도출 가능): 하나로 정합니다. 공개 함수는 `interpret(value, spec)`(D 모양)이고, `spec`은 노드의 `{ schemaType, nullable }`에서 얻습니다(또는 노드를 받습니다). 경고등은 `accepts(value, spec)`로 따로 둡니다. 공개 여부는 아래 소유자 결정 후보 표의 B-2에서 원리로 닫습니다.

### 9 — B↔D — `object` 멤버십: B는 소유자 결정 (c) 그대로(`typeof`), D는 평범한 객체로 좁힘 [확인됨, 소유자 몫]
- B `out-B.md:88`: "코어는 멤버십을 `typeof`와 `Array.isArray`로만 보고 복사하지 않으므로".
- D `out-D.md:24`: "평범한 객체(… 프로토타입이 `Object.prototype` 또는 `null`)".
- 장면: `Date`를 보내는 JSON 편집기 입력이 있다고 합시다. B의 계약을 믿은 플러그인에서는 경고등이 켜지지 않아야 하지만, D에서는 켜집니다. A의 `ObjectValue` 형(`out-A.md:26`)은 `Date`를 거절하지 않으므로 형과 런타임도 갈립니다.
- 고침 안 (소유자 판단 필요): brief-common §2의 소유자 결정 (c) "membership by `typeof`/`Array.isArray`"를 다시 여는 일이고, 원소가 하나인 터미널 객체 노드의 동작도 바꿉니다. 소유자가 정하기 전까지 B `:88`과 D 2의 표 가운데 하나가 틀린 상태입니다.

### 10 — D 내부 (A와 걸림) — 규칙 A가 읽는 목록의 정의가 D 안에서 셋으로 갈림: `null` 포함 여부, "작성된 `type`"이라는 출처 [확인됨]
- D `out-D.md:14`: "`kinds`(작성된 `type`에서 `null`을 빼고 …)". D가 A에 넘긴 요구 `:140`: "`UnionSpec.kinds`(… nullable이면 입력용 목록에 `'null'` 포함) … 이 배열과 같은 참조를 돌려 주십시오". `:74`: `expected`는 "nullable이면 `'null'` 포함".
- A `out-A.md:17`: `schemaType`에서 `'null'`은 뺍니다.
- C `out-C.md:23,29`: 목록은 작성 원문이 아니라 계산값입니다(정적 교집합의 `integer` 세분, 형 없는 `anyOf`의 분기 합치기).
- 장면 ①: "작성된 `type`"을 문자 그대로 구현하면 형 없는 `anyOf` 슬롯에서 `kinds`가 비어 모든 값이 mismatch가 됩니다. 또 본체 `['number','string']`+`allOf ['integer','string']`에서 `12.5`의 판정이 C의 목록과 달라집니다.
- 장면 ②: "같은 참조"를 `null` 포함 배열로 구현하면 A의 불변식(`schemaType`에 `'null'` 없음)이 깨집니다.
- 고침 안 (원리로 도출 가능): D 1을 "`kinds`는 C가 계산한 목록(`null` 제외)이고, `node.schemaType`(union일 때)과 같은 얼린 참조다"로 고칩니다. `:140`의 "입력용 목록에 `'null'` 포함"은 지웁니다. `expected` 페이로드가 `null`을 담아야 한다면 "`schemaType`에 `nullable`이면 `'null'`을 붙인, 슬롯마다 한 번 얼린 별도 배열"이라고 이름을 따로 적습니다.

### 11 — A↔B — null 종류 노드의 `schemaType`: A는 `'null'`, B는 `'null'` 없음 [확인됨]
- A `out-A.md:17` (5d): "`['null']`처럼 `null`만 있으면 `'null'`입니다". A 9(`:24`): "`NullNode` `'null'`".
- B `out-B.md:27`: "실효값이며 `'null'`은 넣지 않는다". `:42`: "`FormTypeTestObject.schemaType`의 형은 `JSONSchemaType | JSONSchemaType[]`입니다(`'null'` 없음)".
- 장면: `{schemaType:'null'}` 시험 객체가 형 오류로 막히지만, 런타임의 null 노드는 `schemaType === 'null'`입니다. "같은 이름은 같은 값"(`out-B.md:36`)이 null 노드에서 깨집니다.
- 고침 안 (원리로 도출 가능): A를 따릅니다(오늘 `extractSchemaInfo.ts:26-27,34`와 같음). B의 두 문장은 "비 null 종류에서는 `'null'`을 넣지 않는다. null 노드의 `schemaType`은 `'null'`"로 고치고, 시험 객체 형은 `JSONSchemaType`(`'null'` 포함)으로 둡니다.

### 12 — D (원장이 이미 답함) — 터미널 노드의 `Merge`를 D는 "모름"으로 남기고 없는 렌즈에 넘김 [확인됨]
- D `out-D.md:66`: "터미널 객체 노드의 `Merge` 규칙을 원장에서 찾지 못했습니다('모름')". D가 넘긴 요구 `:143`: "쓰기 렌즈: 터미널 객체 노드의 `Merge`도 통째 교체인지 확인해 주십시오".
- 원장 WRITE-079 (현행) 결정: "그 자리의 값을 통째로 바꾸는 경우는 둘이다 … 다른 하나는 그 자리의 노드가 객체 호스트가 아닌 때다."
- 고침 안 (원리로 도출 가능): D 9의 근거를 WRITE-079로 바꾸고 "모름"과 `:143`의 요구를 지웁니다. union도 터미널 객체도 객체 호스트가 아니므로 둘 다 통째 교체입니다.

## (V1) 빈틈 표 — 브리프 목록과 추가분

| 경우 | 누가 정했나 | 상태 |
|---|---|---|
| `['null']` | A 5(d) `'null'`, C 이주 "바뀌지 않는 것" | 정해짐. B와의 모순은 지적 11 |
| `nullable: true` + `type` 배열 | C 1·M5, A 2 | 정해짐. 형 없는 경우는 지적 3 |
| union 슬롯을 `$ref` 대상에서 다시 선언 | C 7(정적 연언에 `$ref` 대상 포함) | 정해짐. 다만 A 13의 형 수준은 `$ref`를 따라가지 못함(지적 5) |
| union 슬롯의 `enum`/`const` | B 27–28(입력), D 26–27(게이트) | 입력은 정해짐. **A의 `InferValueType`이 union+`enum`을 좁히는지는 아무도 정하지 않음** |
| union 슬롯의 `format` | B 28 | 정해짐 |
| `trim` | D 12 | D는 정함. C가 경고를 받지 않음(지적 7) |
| `{}`/`[]`의 `omitEmpty` | D 18, C M4 | 정해짐, 서로 맞음 |
| 값 없는 루트 union | D 20 | 정해짐 |
| union 배열 아이템과 방출 자리표시 | D 19 | 정해짐 |
| union 키의 `controls.discriminator` | D 26–27 | D는 정함. C가 경고를 받지 않음(지적 7) |
| `['array','string']`+`items`의 `InferValueType` | A 15(탐침 `string\|boolean[]`) | 정해짐 |
| 어긋난 값의 `setValue` | D 8·11 | 정해짐 |
| 꺼지는 variant 분기 안의 union 노드 | D 13("형상을 나갔다 들어오면 다시 보냄") | 경고등은 정해짐. 같은 키가 배타 분기마다 다른 목록일 때는 C 28(합집합)로 닫힘. 명시 시나리오는 없음 |
| **게이트 선언만 있을 때 합집합 목록의 순서** | C 28은 합집합만 말하고, A 7은 "먼저 나온 선언의 순서"라고 함 | **정해지지 않음**. 첫 선언에 없는 원소가 어디에 오는지 두 렌즈 모두 말하지 않음. 원리로는 C 31의 분기 규칙("처음 나온 순서")을 그대로 쓰면 닫힘 |
| **`['object','array']` union에 값이 없을 때 기본 입력** | B 23은 편집 모드 글 상자 | **빈틈**. 친 글은 어떤 목록 형도 되지 못해 늘 초안으로 남고 흐려지면 되돌아가므로, 아무것도 보낼 수 없는 글 상자가 됨. 원리로는 "목록에 원시 형이 없으면 편집 모드를 두지 않고 읽기 전용 빈 표시로 둔다"로 닫힘 |
| B 22의 기본 union 정의 위치와 B 27의 enum 확장 | `formTypeDefinitions/index.tsx:17-18`(Radio·Enum)이 `:23`(String)보다 앞 | 정의 위치는 맞음. "String 바로 앞"이면 enum 확장이 먼저 걸림 |

## (V1) 넘긴 요구 표

| 요구 | 받는 렌즈 | 판정 |
|---|---|---|
| A→B: `Hint.type` = `node.schemaType` (`out-A.md:58`) | B | **모순**. B 8 `Hint.type = node.type`. A 보정문이 B안을 받았으므로 A 쪽을 고칠 것(지적 4) |
| A→B: 시험 배열은 "스칼라 가운데 하나", union은 우연히 맞지 않음 | B | 충족(B 13–14) |
| A→B: union 입력은 `jsonSchema.type`이 아니라 `schemaType`에서 읽음 | B | 충족(B 36). 단 B 9 끝줄 "유효 `type`과 같아야"와 부딪힘(지적 1) |
| A→C: 슬롯마다 `schemaType`을 계산해 얼리고 노드는 참조를 받음 | C | 충족(C 32–33 (a); `null` 제거는 A가 함) |
| A→C: `integer`/`number`만 다르면 `number`로 합침 | C | **모순**. C 9·T5는 교집합(지적 2) |
| A→C: BLUEPRINT-033 목록 출처 고침, 유효 스키마에 `type`을 쓰지 않음 | C | **모순**. C 31 도장, C `:148` "그대로 성립"(지적 1) |
| A→D: 목록 = `schemaType` + nullable이면 `null`, 정수 판정은 `number` 없을 때만 | D | 충족(D 5·6). D 1의 "작성된 `type`"은 고쳐야 함(지적 10) |
| A→D(검증기): "경고"로는 부족, 거부 또는 사본 | D | 충족(D 30 사본) |
| B→A: `SchemaNodeType`에 `'union'` | A | 충족(A 1) |
| B→A: `type==='union'`으로 좁히면 `schemaType`은 배열, `value`는 목록 형의 합 | A | **부분 충족**. `schemaType`은 A 9–10으로 충족. `value`는 A 11이 넓은 합(`string\|number\|boolean\|ObjectValue\|ArrayValue`)이고 목록으로 좁히지 않음(제네릭을 버림, `out-A.md:55`). 목록 형으로의 좁힘은 `FormTypeInputProps<Value>`에서만 됨 |
| B→D: 미리보기 함수의 의미(`integer`, 같은 결과 하나로 셈, `NaN`·`±Infinity`), 같은 함수 사용 | D | 의미는 충족(D 2–4). 함수 모양은 **모순**(지적 8) |
| B→C: 형 없는 anyOf와 `allOf` 병합 뒤에도 유효 `type` = 스키마 형 필드 | C | C는 충족(규칙 31). A와는 **모순**(지적 1). 지적 1의 고침을 따르면 이 요구는 버립니다 |
| B→C: 객체·배열 union 슬롯 안 `presentation.FormTypeInput`은 개발 경고 | C | 충족(C 35, 예약 층 키 `presentation`) |
| B→검증기: 거부 또는 사본 | D | 충족(D 30) |
| C→A: (a)–(c)를 받고 이름·`null` 포함은 A가 정함 | A | 충족(A 3–5) |
| C→A: BLUEPRINT-033은 규칙 31 덕분에 그대로 성립 | A | **모순**(A 8, 지적 1) |
| C→B: Hint `type`이 배열을 받음, `===`는 원소 하나일 때만 | B | **모순/낡음**. B는 배열을 `schemaType`에만 둠. 원소 하나인 배열은 A 불변식상 생기지 않음(지적 4) |
| C→B: 목록 순서에 core 뜻 없음을 문서화 | B | 충족(B 30 "순서에 뜻 없음", B 36) |
| C→D: 규칙 A는 정적 목록만 읽고, 게이트 전환으로 경고등을 다시 계산하지 않음 | D | 충족(D 1·5) |
| C→검증기: 컴파일마다 작성 스키마의 깊은 사본 | D | 충족(D 32, (인스턴스, 루트)마다 한 번 캐시) |
| C→원장: ERROR-164 경고 행, 병합표 `type` 행 | (원장) | 경고 행은 해당. `type` 병합 행은 지적 1의 고침을 따르면 버립니다 |
| D→A: 목록 = `UnionSpec.kinds`, 같은 참조 | A | **부분 충족**. A 20은 슬롯마다 얼리지만 `UnionSpec.kinds`와 같은 객체라고 적지 않음. `null` 포함 여부가 D 안에서 엇갈림(지적 10) |
| D→C: `trim` 경고, 목록 밖 판별 리터럴 경고 | C | **미충족**, C 요약과 모순(지적 7) |
| D→C: `then`/`allOf` 좁힘이 `UnionSpec`을 바꾸지 않음 | C | 충족(C 10·27·29) |
| D→B: core와 같은 `interpret`를 쓰고, 표시 규칙 | B | 의미와 표시는 충족(B 23–26·30). 함수 모양은 **모순**(지적 8) |
| D→쓰기 렌즈: 터미널 객체 `Merge` | (없음) | 받는 렌즈 없음. WRITE-079가 이미 답함(지적 12) |
| D→방출 렌즈: VALIDATE-007 깊은 점검 개발 경고 | (없음) | **미충족**. 받는 렌즈가 없고 네 제안 어디에도 없음. 원리로는 "멤버십은 얕게만 본다. 깊은 JSON 정합은 검증기와 VALIDATE-007 문서의 몫"으로 닫힘(P1′, 속도) |
| D→검증기 플러그인(PR-4): `opts` 판별과 감싸기 | (착륙) | 렌즈 밖. LANDING에 적을 일 |

## (V1) 소유자 결정 후보 표

| 후보 | 판정 |
|---|---|
| A-1 "그대로"의 뜻(계산값인가, `null`을 담은 원문인가) | **원리로 닫힘**. 닫는 문장: "`schemaType`은 청사진이 계산한 목록이고 `null`은 `nullable`이 맡는다. 같은 nullable 노드가 세 표기에서 같은 값을 내야 하고(일관성), 형 없는 `anyOf`에는 옮길 원문이 없으며, 소유자가 `nullable`을 남기라고 했기 때문이다. 원문은 `node.jsonSchema`에서 읽는다." |
| A-2 이름(`schemaType` 넓히기 대 새 필드 추가) | **소유자 몫(확인만)**. 소유자가 "추가"라고 명시했으므로 넓히기는 지시와 다릅니다. 권장은 넓히기입니다(비 union 값 불변, 한 사실에 한 이름). 참고로 A가 근거로 든 NODE-011은 `SchemaNode` 접두 규칙이고, "한 형에 한 이름"은 SURFACE-056 보충에만 있습니다(형 이름에 관한 말입니다) |
| B-1 union+원시 `enum`에 기본 enum·radio 정의 열기 | **원리로 닫힘**. 닫는 문장: "enum 원소가 모두 원시값이면 기본 enum·radio 정의가 union에도 걸린다. 단일 종류 `type:'string'`+`enum`이 선택 상자를 받는 것과 같고, 이 정의들은 원래 리터럴을 보내며 새 입력이 아니다(BLUEPRINT-033 '새 입력을 두지 않음'과 맞음). 없으면 선언된 수 리터럴에 닿을 수 없어 작성자 선언이 조용히 막힌다(공통 §1)." 요약 문서 `:45`는 소유자 확정 사실이 아닙니다(brief-common §2에 없음) |
| B-2 규칙 A 미리보기 함수 공개 | **원리로 닫힘**. 닫는 문장: "소비자(코어 기본 입력과 자사 플러그인 넷)가 있으므로 내보낸다(seiri 공개 계약 §1). 플러그인마다 다시 짜면 초안 판정과 쓰기 결과가 갈린다(B 실패 장면). SURFACE-058은 노드 겉면 멤버 수이고 모듈 내보내기를 세지 않는다." 모양은 지적 8대로 합니다 |
| B-3 / D-2 / A 검증기 변이(경고·거부·사본) | **"경고"는 원리로 닫혀 빠짐**. A·B·D가 모두 VALUE-012·WRITE-013 위반으로 보였습니다. **거부 대 사본은 원리로 도출 가능하지만 소유자 확인이 필요**합니다. 닫는 문장: "값을 바꾸는 옵션이 켜진 인스턴스는 그 인스턴스만 값 사본으로 검증한다. 거부하면 VALIDATE-003이 서버 설정을 맞추는 수단으로 정한 `bind(instance)`를 서버 인스턴스에 쓸 수 없기 때문이다." brief-common §2가 보류로 명시했으므로 확인만 받습니다 |
| C-1 (P1) 형 없는 `const`/`enum` 분기 | **소유자 몫**. brief-common §2에서 열린 결정이고, P1′과 표준 정합 사이의 가치 선택입니다. A·D는 추론할 경우 `number`(결코 `integer` 아님)로 맞춰 두었습니다 |
| C-2 (P2) 객체·원시 혼합 `oneOf`/`anyOf` | **소유자 몫**. 따로 보류된 결정입니다. 네 렌즈의 함의는 서로 맞습니다: 허용하면 터미널 강제 union이고 객체 분기의 자식 렌더를 잃습니다(D `:146`). 아니면 오류입니다 |
| C-3 ajv8 기본값에 `allowUnionTypes: true` | **원리로 닫힘**. 닫는 문장: "VALIDATE-003이 바꾸지 않는다고 적은 기본값은 `allErrors`·`strictSchema: false`·`validateFormats: false` 셋이고, `allowUnionTypes`는 판정을 바꾸지 않는 로그 설정이므로 VALIDATE-003의 목적(서버와 같은 판정)에 닿지 않는다. 프로덕션의 `console.warn` 잡음을 없앤다." |
| C-4 새 경고(터미널 아래 예약 층 키)의 범위 | **원리로 닫힘**. 닫는 문장: "전략이 `terminal`인 모든 노드에 적용한다. 원소 하나인 경우가 단일 노드와 같아야 하고(일관성), 폼이 따를 수 없는 선언은 조용히 버리지 않는다(공통 §1). 기존 터미널 객체에 경고가 새로 생기는 것은 허용된 파괴적 변화다." |
| D-1 `object` 멤버십을 평범한 객체로 좁힘 | **소유자 몫**. 소유자 결정 (c)(`typeof`/`Array.isArray`)를 다시 여는 일이고, 단일 터미널 객체 노드의 동작도 바꿉니다(지적 9) |
| D-3 목록 밖 판별 리터럴: 경고인가 오류인가 | **원리로 닫힘**. 닫는 문장: "경고로 둔다. 어긋난 값으로는 그 분기가 켜질 수 있으므로(CONTROLS-074) 폼은 선언을 여전히 따르고, 리터럴의 뜻을 판정하는 것은 검증기의 몫이다(P1′). FRAGMENT-007의 O-1 오류는 분기끼리 형·값이 다른 경우이며 그대로 오류다." |

## 확인하지 못한 것
- A의 형 탐침(`$TMPDIR/lensA/probe*.ts`)은 다시 돌리지 않았습니다. 지적 5의 형 수준 결과는 A의 문장과 C의 문장을 맞대어 얻은 것입니다.
- C의 오류 코드 이름(`SHARED_NODE_KIND_CONFLICT` 등)과 원장 ID 인용이 정확한지는 V2의 범위라 확인하지 않았습니다.
- `allowUnionTypes`가 ajv 판정을 바꾸지 않는다는 점은 C가 인용한 research-1(`:62,149-150`)을 믿었고, 실행해 보지는 않았습니다.
