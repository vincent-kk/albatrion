# 렌즈 D: 값의 의미, 검증, 시험 — 제안

## 요약 (5줄 이내)
- 규칙 A는 순수 함수 셋으로 둡니다: `isMember`, `convert`, `interpret`. 경고등은 `interpret`의 반환값이 아니라 원본의 계산 칸 `!accepts(raw)`로 둡니다(VALUE-030, P3). 쓰기 한 번의 비용은 비트마스크 판정 O(1)에 문자열 해석 최대 한 번입니다.
- 둘 이상이 받아 주는 경우는 "`string`과 `boolean`이 있고 `number`·`integer`가 없는 목록에 수 `0`·`-0`·`1`이 올 때"뿐입니다. 아래 §제안 2에 증명을 적었고, 127개 목록 × 모든 순열 × 값 40종으로 전수 실행해 확인했습니다(순서 위반 0, 멱등 위반 0, 경우 12건 모두 이 모양).
- 모든 쓰기가 `interpret`를 지납니다: 입력, `setValue`, `Merge`, 로드, 채움, `derived`, `injectTo`, `trim`. union 노드에 대한 쓰기는 늘 값 전체를 바꾸고, "없음"은 `raw === undefined` 하나로 정합니다.
- 루트나 배열 아이템 자리의 union이 방출하지 않을 때 채우는 값은 **원본 값의 JSON 종류**로 정합니다. 이렇게 해야 원소가 하나인 목록이 단일 노드와 같게 동작합니다.
- 검증기 계약: 폼은 검증기에 방출 트리를 참조로 넘기고, 검증기는 그 값을 바꾸지 않습니다. 값을 바꾸는 ajv 옵션은 플러그인이 `bind` 때 `opts`로 알아내고, **그 인스턴스만** 값의 사본으로 검증합니다. 스키마는 검증기 인스턴스와 작성 루트마다 한 번 깊이 복사합니다.

## 제안

### 1. 규칙 A: 순수 함수 셋

1. 청사진은 union 자리마다 `UnionSpec`을 한 번 만들어 얼립니다. 필드는 `kinds`(작성된 `type`에서 `null`을 빼고 중복을 없앤 목록. `integer`는 남기되 `number`가 있으면 뺍니다), `mask`(그 목록의 비트 합), `nullable`입니다. 같은 스키마 위치의 모든 노드(배열 아이템 포함)가 이 객체를 함께 씁니다. `interpret`는 쓰기마다 `node.jsonSchema.type`을 다시 읽지 않습니다. 근거: CONTROLS-080 (1)의 위치별 1회 컴파일과 같은 방식이고, 32번의 스키마 변이에서 떼어 두기 위해서입니다.
2. `isMember(value, kind): boolean`의 판정표입니다(JSON Schema의 뜻. t1a M1·G2의 고칠 문장).

   | kind | 참인 값 |
   |---|---|
   | `string` | `typeof v === 'string'` |
   | `number` | `typeof v === 'number' && Number.isFinite(v)` (`NaN`·`±Infinity`는 아님) |
   | `integer` | `Number.isInteger(v)` (유한한 정수. 안전한 정수 범위는 보지 않습니다. `2**60`도 정수이며 ajv와 같습니다) |
   | `boolean` | `typeof v === 'boolean'` |
   | `null` | `v === null` (목록에서는 `nullable` 플래그로만 봅니다) |
   | `object` | 평범한 객체(`typeof v === 'object'`, `null` 아님, 배열 아님, 프로토타입이 `Object.prototype` 또는 `null`) → "소유자가 정해야 할 것" 1 |
   | `array` | `Array.isArray(v)` |
   | (없음) | `undefined`는 어느 형의 원소도 아닙니다. `interpret`의 첫 줄에서 "없음"으로 처리합니다 |

   구현은 `classBits(v)`를 한 번 계산하고 `(classBits(v) & mask) !== 0`으로 판정합니다. 정수인 유한한 수의 비트는 `number|integer`, 정수가 아닌 유한한 수는 `number`, 비유한 수·bigint·함수·`Date` 등은 `0`입니다.
3. `convert(value, kind): { ok: true, result } | { ok: false }`는 WRITE-075를 그대로 옮깁니다. 이미 그 형인 값은 부르지 않습니다(①이 먼저 거릅니다).

   | kind | 받는 원천 → 결과 | 받지 않는 것 |
   |---|---|---|
   | `number` | 문자열의 앞뒤 공백을 뺀 전체가 JSON 수 표기 `-?(0\|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?`이고 결과가 유한 → `Number(t)`. 소수부·지수부가 없는 표기는 안전한 정수여야 합니다(WRITE-075 보충) | 불리언, 수가 아닌 글, `"01"`, `"1e400"`, `"9007199254740993"` |
   | `integer` | 위 `number` 변환이 되고 그 결과가 `Number.isSafeInteger` → 그 결과(`"1.0"`→`1`, `"1e2"`→`100`) | 이미 수인 값(자르지 않음, WRITE-075), `"1.5"`, `"1e16"` |
   | `string` | 유한한 수 → `String(n)`(`-0`→`"0"`), 불리언 → `"true"`·`"false"` | `NaN`·`±Infinity`, `null`, 객체, 배열 |
   | `boolean` | 정확히 `"true"`·`"false"`(공백을 빼지 않음), 수 `1`→`true`, `0`·`-0`→`false` | `" true"`, `"1"`, 그 밖의 수 |
   | `null`·`object`·`array` | 없음(변환하지 않습니다. JSON 파싱과 문자열화도 하지 않습니다. 소유자 결정 (c)) | 전부 |
4. `interpret(value, spec): unknown`의 순서입니다. 정본 모양은 브리프가 적은 `{ value, mismatch }`이지만, 구현은 값만 돌려주고 경고등은 5번으로 따로 계산합니다(할당 0).
   - ⓪ `value === undefined` → `undefined`
   - ⓪′ `value === null` → `null` (바꾸지 않습니다. VALUE-033)
   - ① `classBits(value) & mask` → `value` (참조를 그대로 둡니다)
   - ② 목록의 형마다 `convert`를 해 보고, 성공한 결과를 `===`로 중복 없이 모읍니다(`-0 === 0`. `NaN`은 결과로 나오지 않습니다).
   - ③ 결과가 정확히 하나면 그 값, 아니면 `value`
   - WRITE-084(순수, 던지지 않음, 모든 입력에 값, 멱등, 못 바꾸면 항등)를 만족합니다. ②의 결과는 늘 목록의 한 형이므로(수 변환은 유한한 수, 정수 변환은 안전한 정수, 문자열·불리언은 그 형) 두 번 적용하면 ①에서 멈춥니다. 전수 실행에서 멱등 위반은 0이었습니다.
5. 경고등은 `valueTypeMismatch = raw !== undefined && !(raw === null && nullable) && (classBits(raw) & mask) === 0`입니다. 원본과 형만의 함수이므로 VALUE-030의 '계산 칸'이 문자 그대로 성립합니다. 커밋마다 원본이 바뀐 노드에서만 다시 계산합니다.
6. 원소가 하나인 목록은 단일 노드와 같습니다. `['integer','number']`는 `number`의 규칙이 됩니다(① 판정이 `number ⊇ integer`이므로 따로 정하지 않아도 됩니다). `['integer','number','boolean']`에 `"2"`가 오면 결과 `2`가 둘이지만 같은 값이라 하나로 세어 `2`가 됩니다(t1a M1). `['integer','boolean']`의 `12.5`와 `['number','string']`의 `NaN`은 켜집니다(t1a B-4, G2).

### 2. 둘 이상이 받아 주는 경우의 전수와 증명
7. 받아 주는 형이 둘 이상이 되려면, 원천 값이 목록의 어느 형도 아니면서 서로 다른 결과를 내는 변환이 둘 있어야 합니다. 원천 종류별로 따지면 다음과 같습니다.
   - 문자열: 받을 수 있는 형은 `number`·`integer`(같은 해석이라 결과가 같음)와 `boolean`(`"true"`·`"false"`, 수 표기가 아님)입니다. 둘은 서로 겹치지 않으므로 서로 다른 결과는 많아야 하나입니다.
   - 유한한 수: 받을 수 있는 형은 `string`(늘 성공)과 `boolean`(`0`·`-0`·`1`만)입니다. `integer`는 수를 바꾸지 않습니다. 그래서 둘이 되는 경우는 `{string, boolean} ⊆ 목록`, `v ∈ {0,-0,1}`, `v`가 목록의 어느 형도 아닐 때, 곧 `number`·`integer`가 목록에 없을 때입니다.
   - 불리언: `string` 하나뿐입니다.
   - `NaN`·`±Infinity`·`null`·객체·배열·bigint·그 밖: 받을 수 있는 형이 없습니다.
   - 따라서 둘 이상이 받아 주는 경우는 정확히 **목록 ⊇ {string, boolean}, 목록 ∩ {number, integer} = ∅, 값 ∈ {0, -0, 1}**입니다. 목록은 `object`·`array`의 유무로 4종이고, 값 3개와 곱해 12건입니다. 전수 실행(`S/swarm-union/d-rule-a.mjs`: 목록 127개 × `nullable` 2 × 값 40종 × 모든 순열)의 결과도 `tieCount: 12`, 순서 위반 0, 멱등 위반 0, 변환 뒤 불일치 0이었습니다. 그래서 규칙 A는 순서와 무관합니다(BLUEPRINT-033 "선언 순서를 쓰지 않는다"). 참고로 ajv 8.17.1은 `['string','number']`의 `true`를 선언 순서로 `"true"`로 바꿉니다(`S/swarm-union/d-ajv-if.cjs` 실행). 폼이 ajv를 따르지 않는 이유가 이 순서 의존입니다.

### 3. 규칙 A가 도는 곳
8. `interpret`는 노드에 드는 모든 쓰기의 경계에서 한 번 돕니다(WRITE-056 "노드에 드는 모든 쓰기", NODE-056 "부르는 쪽은 `interpret` 칸뿐"). 쓰기 경로별로 보면 다음과 같습니다.
   - 입력 쓰기, 옵션이 없거나 `Merge`나 `Overwrite`인 경우(WRITE-080·WRITE-091)
   - `setValue(V)`의 전체 교체와 로드(마운트, `reset()`, `resetSubtree()`)(WRITE-090)
   - 조상에 대한 쓰기가 나눠 준 값(WRITE-018, WRITE-082 "분배된 값은 잎마다 `interpret`")
   - 채움(WRITE-090)
   - `controls.derived`(WRITE-011. 식이 `undefined`를 내면 쓰지 않습니다, WRITE-007)
   - `controls.injectTo`가 union 노드 자체를 대상으로 할 때(WRITE-012)
   - `unsetValue`·나감의 비움(`undefined`에서는 항등)
   - 포커스 아웃 `trim`(WRITE-083, 12번)
9. union 노드에 대한 쓰기는 늘 **값 전체를 바꿉니다**. `Merge`로 객체 V가 와도 키 단위로 합치지 않습니다. 이유는 셋입니다. union은 자식이 없는 터미널이고(NODE-020), 현재 값이 객체가 아닐 수 있으며, 객체가 아닌 V의 `Merge`는 이미 통째 교체입니다(WRITE-079). 터미널 객체 노드의 `Merge` 규칙을 원장에서 찾지 못했습니다("모름"). 그래서 이 문장이 터미널 객체와 같아야 한다는 것을 요구로 넘깁니다.
10. `injectTo`나 `controls.children`의 대상이 union 값 안(`/slot/key`)이면 이미 정한 규칙대로입니다. 터미널 아래 대상은 `INJECT_TARGET_MISSING`이고(CONTROLS-079, `ledger/controls.md:1153`), children은 청사진 오류입니다(CONTROLS-073 (2)). union이라고 새 규칙을 두지 않습니다.
11. 어긋난 값을 로드하면 바꾸지 않고 들고, 경고등이 켜지고, 방출도 받은 그대로 합니다(WRITE-054, VALUE-033). 검증기가 있으면 형 에러가 union 노드에 붙습니다(VALIDATE-043 (4)). 로드는 새 수명이므로(WRITE-090) 루트의 경로 집합을 다시 만들고, 켜진 노드마다 경고를 한 번씩 보냅니다(13번).
12. `trim`은 문자열 행의 `finishInput`을 함께 씁니다(t1a G5, NODE-006). **목록에 `string`이 있고 원본이 문자열일 때만** 자르고, 자른 값도 `interpret`를 지납니다. 목록에 `string`이 없는 union에 `options.trim`을 적으면 청사진이 개발 모드 경고를 냅니다. 조용히 무시하지 않기 위해서입니다. 그런 union에 머무는 문자열은 이미 변환에 실패한 어긋난 값이고, `" true "`를 잘라 `true`로 바꾸는 것은 규칙 A 밖의 재작성이기 때문입니다(WRITE-075: 불리언 변환은 정확히 `"true"`만 받습니다).

### 4. 경고등과 경고
13. 켜지는 때는 루트의 경로 집합(VALUE-030)에 그 노드의 경로가 **들어가는 커밋**입니다. `VALUE_TYPE_MISMATCH`는 그 커밋마다 한 번 보냅니다(ERROR-186 "켜질 때마다 한 번"). 켜진 채 다른 어긋난 값이 와도 다시 보내지 않습니다. 꺼졌다 다시 켜지거나, 형상을 나갔다 들어오거나, 로드로 집합을 다시 만들면 다시 보냅니다. 치는 도중의 초안은 노드에 가지 않으므로 경고가 없습니다(15번).
14. payload는 `{ level: 'warning', code, path, expected, received, reason, source }`입니다.
    - `expected`: 노드가 받는 형 목록(얼린 배열. `integer` 보존, nullable이면 `'null'` 포함)
    - `received`: `'string'|'number'|'integer'|'nonFinite'|'boolean'|'null'|'object'|'array'|'other'`
    - `reason`: `'unconvertible'`(받는 형 없음) 또는 `'ambiguous'`(둘 이상. 이때만 `candidates: ['string','boolean']`)
    - `source`: EVENT-060의 출처 값 목록을 그대로 씁니다
    - `reason`이 있어야 작성자가 "형을 하나 더 적는다"와 "UI 플러그인이 형을 정해 보낸다" 가운데 무엇을 할지 고를 수 있습니다.
15. 기본 입력의 초안(소유자 결정 (나)): 기본 입력은 글에 core와 같은 `interpret`를 적용해(`behaviors/utils/parse/`의 공개 함수 하나) 결과가 목록의 한 형일 때만 **그 결과**를 보냅니다(REACT-027 "자기 형의 값"). 빈 칸은 `undefined`, 비우기 조작은 nullable이면 `null`입니다. 해석되지 않는 초안은 흐려질 때 되돌립니다. `string`이 목록에 있으면 모든 글이 ①에서 그대로 가므로 오늘 동작과 같습니다. 대신 `['number','string']`에서 기본 입력이 보내는 값은 **늘 문자열**입니다(`"42"`는 ①의 멤버입니다). 이것을 문서와 시험에 고정합니다.
16. 게터(18C-40): union의 `valueTypeMismatch`는 5번의 식입니다. `valueTypeMismatches`는 켜졌으면 `[path]`, 아니면 공유하는 얼린 빈 배열이고, 커밋 번호로 메모합니다. 객체·배열 값의 안쪽 경로는 넣지 않습니다(노드가 없음, VALUE-030 "형상에 없는 노드는 넣지 않는다").
17. 문구는 다음으로 고정합니다: "`valueTypeMismatch === false`는 값이 이 노드가 받는 JSON 형 가운데 하나(또는 없음, nullable이면 `null`)라는 뜻이며, 검증 통과를 뜻하지 않는다. `then`·`allOf`의 좁힘, `enum`, `properties`/`items` 같은 제약은 검증기가 판정한다." 이 문구를 `FormTypeInputProps` 주석(SURFACE-052)과 게터 주석에 같이 적습니다.

### 5. 방출
18. `omitEmpty`(기본 켜짐)는 union의 **현재 값 전체**를 봅니다. `''`, 키가 없는 평범한 객체 `{}`, 빈 배열 `[]`이면 방출하지 않습니다(VALUE-034). `0`·`false`·`null`은 방출합니다. 어긋난 값도 이 규칙대로입니다.
19. 루트와 배열 아이템 자리의 채움 값은 **원본 값의 JSON 종류**로 정합니다. 원본이 객체면 `{}`, 배열이면 `[]`, 그 밖(없음, `''`)이면 잎 규칙(아이템은 `null`, 루트는 `undefined`)입니다. 이렇게 하면 원소가 하나인 목록이 단일 노드와 같습니다(`['string']`의 `''` 아이템은 `null`, 터미널 객체의 `{}` 아이템은 `{}`, VALUE-034). 비용은 비교 하나입니다. 종류만 보고 "union은 잎이니 `null`"로 정하면 `{}`를 든 아이템이 `null`로 방출되어 JSON 종류가 바뀝니다.
20. 원본이 없는 루트 union은 `undefined`를 방출합니다(VALUE-034 "그 밖의 루트", 18C-88). 그래서 `FormHandle.getValue()`도 `undefined`입니다. 이주 행에 적습니다.
21. 방출은 원본을 참조 그대로 냅니다. 객체·배열 값을 복사하지 않고, 같은 원본이면 같은 참조입니다(VALUE-012, SETTLE-043 (나)). 호출자가 준 객체는 바꾸지 않습니다(WRITE-013).

### 6. 채움
22. 채움 값은 `controls.default` > `default`의 **값 전체**이고, 노드가 생길 때 원본이 `undefined`인 경우에만 한 번 들어갑니다(WRITE-090). 이 값도 `interpret`를 지납니다. union의 "없음"은 `raw === undefined` 하나입니다. 객체 호스트처럼 자손에서 계산하는 정의(WRITE-082)는 쓰지 않습니다. 그래서 로드된 `{}`는 이미 있는 값이며 `default`로 덮이지 않습니다. 객체 호스트는 `{}`도 호스트 `default`를 받으므로(WRITE-082), 이 차이를 이주 문서의 표 한 줄로 적습니다.
23. `default`가 목록 밖의 형이면(예: `['string','boolean']`에 `default: 0`) 마운트 때 경고등이 켜지고 `source: 'fill'`로 경고가 한 번 갑니다. 경우 12건 가운데 하나이므로 `reason: 'ambiguous'`입니다.
24. `default` 객체는 복사하지 않고 불변으로 다룹니다(WRITE-071, F24). 배열 아이템 여럿이 같은 참조를 들 수 있지만, core는 바꾸지 않으므로 안전합니다. 입력 구현은 받은 값을 바꾸면 안 됩니다(입력 계약 문서에 적습니다).

### 7. 식, 게이트, 판별 키
25. 식의 경로는 방출 트리를 JSON Pointer로 내려갑니다(CONTROLS-080 (5)). **평범한 객체의 자기 키와 배열의 색인으로만** 내려가고, 그 밖의 값(문자열, 수, `null`) 아래는 `undefined`입니다. 그래서 union 값이 `"abc"`일 때 `./slot/length`는 `3`이 아니라 `undefined`입니다. 이 문장을 CONTROLS-080 (5)에 보충으로 넣자고 제안합니다. JS 속성 접근을 쓰면 값의 형에 따라 결과가 갈리기 때문입니다.
26. 게이트와 식은 어긋난 값도 거르지 않고 봅니다(CONTROLS-074). `if`의 `const`와 FRAGMENT-008의 `===`는 둘 다 형까지 엄격하게 비교하므로(`"1" !== 1`) 폼은 게이트에서 변환하지 않습니다. `['number','string']` 판별 키에 기본 입력으로 친 `"1"`은 `const: 1` 분기를 켜지 않습니다(15번과 같은 결과입니다). 이것을 시험으로 고정합니다.
27. FRAGMENT-007: 판별 키가 union이어도 분기끼리의 규칙(종류 일치, 값 겹침 금지)은 그대로입니다. 분기의 `const`·`enum` 리터럴의 JSON 형이 판별 노드의 목록(+nullable)에 없으면, 그 분기는 어긋나지 않은 값으로는 켜질 수 없습니다. 이 경우 청사진이 개발 모드 경고를 냅니다. 오류로 하지 않는 이유는, 어긋난 값으로는 게이트가 켜질 수 있고(CONTROLS-074) 판정 자체는 검증기의 몫(P1′)이기 때문입니다.

### 8. 검증기
28. 계약 문장입니다(VALIDATE-044의 `Validator` 문서 주석): "core는 `compile` 결과와 가드에 방출 트리를 **참조로** 넘긴다. 검증기와 가드는 받은 값과 받은 스키마를 바꾸지 않는다. 바꾸면 폼의 값 계약(VALUE-012 참조 안정, WRITE-013 호출자 객체 불변, WRITE-090 채움)이 깨진다." 복사하지 않는 이유는 속도가 우선이기 때문입니다(검증은 입력마다 요청됩니다, VALIDATE-049). 오늘 플러그인도 복사하지 않습니다(`schema-form-ajv8-plugin/src/validator/createValidatorFactory.ts:23-25`).
29. 알아내는 곳은 플러그인입니다. core는 `bind`를 부르지 않기 때문입니다(VALIDATE-044 (1)). ajv 플러그인 셋은 `bind(instance)` 때 한 번 `mutating = !!(o.coerceTypes || o.useDefaults || o.removeAdditional)`를 계산합니다. `o`는 ajv7·8이면 `instance.opts`(`schema-form-ajv8-plugin/node_modules/ajv/dist/core.d.ts:107`, ajv7 `core.d.ts:95`), ajv6이면 `instance._opts`(루트 `node_modules/ajv/lib/ajv.d.ts:140`)입니다. 기본 인스턴스는 플러그인이 만든 설정이라 `false`입니다(`default/validatorPlugin.ts:15-19,48`).
30. 알아냈을 때의 동작(권장, "소유자가 정해야 할 것" 2): **그 인스턴스만 사본 경로**를 탑니다. 플러그인이 `compile`과 `compileGuard` 결과를 감싸 호출마다 `structuredClone(value)`(또는 JSON 왕복. 방출은 JSON과 같으므로, VALIDATE-007)에 검증합니다. 개발 모드에서는 `console.warn`을 한 번 냅니다. 문구는 "이 인스턴스는 값을 바꾸는 옵션을 쓰므로 판정은 변환된 사본 기준이며, 폼 값과 제출 값은 바뀌지 않는다"입니다. 가드도 감싸야 합니다. 실행해 보니 ajv 8.17.1은 가드 모양의 스키마(`{properties:{k:{type:'number'}}}`)에서도 `coerceTypes`로 `{k:'1'}`를 `{k:1}`로 제자리에서 바꿨습니다(`S/swarm-union/d-ajv-if.cjs`).
31. 이 동작은 VALIDATE-002의 "같은 설정" 보장을 지킵니다. 폼이 보낸 원래 값을 같은 옵션의 서버 ajv가 다시 변환해 같은 판정을 내기 때문입니다. `useDefaults`로 채워 통과한 경우도 서버가 같은 채움을 하므로 마찬가지입니다.
32. 스키마 사본: 검증기에 넘기는 스키마 사본(VALIDATE-004, VALIDATE-018의 캐시 항목)은 **늘 깊은 사본**으로 만듭니다. 오늘의 제거는 지울 키가 없으면 원본을 돌려주고(`src/helpers/jsonSchema/stripSchemaExtensions/stripSchemaExtensions.ts:32-36`), 플러그인은 얕게 펼칩니다(`createValidatorFactory.ts:19-22`). 그래서 ajv 8.17.1이 `nullable:true`+`type` 배열에 `'null'`을 밀어 넣으면 작성된 중첩 `type` 배열이 바뀝니다(t1a G10 (4), 실행 확인). 비용은 (검증기 인스턴스, 작성 루트)마다 O(스키마) 한 번이고, 폼 인스턴스들이 함께 씁니다. 청사진의 `UnionSpec.kinds`는 1번대로 자기 얼린 배열이므로 어느 쪽이 바뀌어도 규칙 A는 영향을 받지 않습니다.
33. 어긋난 union 값과 union 객체 값 안의 에러는 VALIDATE-043 (4)대로 union 노드가 받고 `dataPath`는 그대로 둡니다(오늘은 `find` 실패로 버려집니다, `src/core/nodes/AbstractNode/utils/ValidationManager/ValidationManager.ts:118,150`. 새 설계에서 고쳐지는 점으로 이주 행에 적습니다).

### 9. 더할 시험 (TEST 영역)
34. 노드 트리 단위 시험(PR-2)
    - `src/core/behaviors/utils/parse/__tests__/interpret.table.test.ts`: 3번 표의 모든 칸, 받아 주는 형이 없는 경우, 경우 12건, `"1.0"`·`"1e2"`·`"1e16"`·`"9007199254740993"`·`"01"`·`"-0"`·`" true"`, `NaN`·`±Infinity`·`2**60`·`-0`·bigint·`Date`·`Object.create(null)`.
    - 같은 곳의 `interpret.properties.test.ts`: `d-rule-a.mjs`를 옮긴 전수 시험입니다(목록 127 × nullable × 값 표본 × 모든 순열). 순서 무관, 멱등, 변환 결과 ∈ 목록, 경우 집합이 정확히 7번의 모양, 원소 하나인 목록 = 단일 노드 행.
    - `src/core/behaviors/unionBehavior/__tests__/union.write-paths.test.ts`: 8번의 경로마다 한 사례(입력, `setValue`, `Merge` 객체 V의 통째 교체, 로드, 채움, `derived`, `injectTo` 자기 대상, `trim`).
    - `union.mismatch-light.test.ts`: 13·16번. 켜짐→켜짐에서 경고 0회, 꺼짐→켜짐에서 1회, 로드에서 다시 1회, 같은 커밋에서 같은 참조.
34-2. `src/__tests__/scenarios/`의 renderForm 시나리오(파일 이름은 오늘 규칙 `<영역>.<주제>.render.test.tsx`)
    - `union.rule-a.render.test.tsx`: 설계 정리 표의 5행 + `['integer','number','boolean']`의 `"2"`→`2`
    - `union.ambiguous.render.test.tsx`: `['string','boolean']` + `1`·`0`이면 값 유지, 켜짐, `reason:'ambiguous'`
    - `union.integer.render.test.tsx`: `['integer','string']`의 `12.5`→`"12.5"`, `['integer','boolean']`의 `12.5`는 켜짐, `['integer','number']`는 number 규칙
    - `union.object-array.render.test.tsx`: `['object','string']`·`['array','number']`의 멤버십, 변환 없음, 참조 유지, `find('/slot/key') === null`, `./slot/key` 식, `./slot/length`가 문자열에서 `undefined`, `options.terminal:false`의 ERROR-200, 기본 입력의 `JSON.stringify` 읽기 전용 표시와 비우기
    - `union.default-input-draft.render.test.tsx`: `['number','boolean']`에서 `"4"`→`4`, `"42."`은 초안(노드에 쓰지 않음, 경고 0), 흐려지면 되돌림, `"tru"`, `"true"`→`true`, 빈 칸 `undefined`, nullable 비우기 `null`. `['number','string']`에서 `"42"`는 문자열로 남음
    - `union.omit-empty.render.test.tsx`: `''`·`{}`·`[]` 방출 없음, `omitEmpty:false`, 배열 아이템 자리의 채움 `{}`·`[]`·`null`(19번), 루트 union `undefined`(20번)
    - `union.default-fill.render.test.tsx`: `default` 값 전체, 로드된 `{}`를 덮지 않음(객체 호스트와 대조), `default:0` + `['string','boolean']`이면 마운트 때 경고 1회, `setValue(undefined)` 뒤 다시 채우지 않음
    - `union.expressions.render.test.tsx`: `if`+`const`의 `"1"`과 `1`, `controls.discriminator` 분기 켜짐, 리터럴 형이 목록 밖일 때 개발 경고
    - `union.migration-shapes.render.test.tsx`: TypeBox `anyOf[string, number]`, pydantic `anyOf[string, null]`, ts-json-schema-generator `type` 배열, OAS 3.0 `nullable:true`+`type`, 그리고 `then`에서 몸체 union을 좁히는 경우(노드는 union 유지, 에러는 검증기)
    - `union.validator-mutation.render.test.tsx`: `coerceTypes`·`useDefaults`·`removeAdditional` 인스턴스를 `bind`한 뒤 `getValue()`·`node.value`·방출 참조·`extras`·작성 스키마의 `type` 배열이 바뀌지 않음, 판정은 사본 기준, 개발 경고 1회. 가드 경로도 포함
    - 플러그인 쪽은 `schema-form-ajv{6,7,8}-plugin/src/**/__tests__/mutating-options.test.ts`에서 `opts` 판별과 감싸기를 시험합니다.

## 대안과 버린 이유
- **`interpret`가 `{ value, mismatch }`를 돌려주고 그 `mismatch`를 저장**: 쓰기마다 객체를 하나씩 할당합니다. 게다가 경고등이 상태가 되어 P3("상태는 `raw`와 `extras` 둘뿐", VALUE-030)와 부딪힙니다. `!accepts(raw)`는 같은 답을 O(1)에 할당 없이 줍니다.
- **목록 대신 접은 종류(`integer`→`number`)로 판정**: `['integer','string']`의 `12.5`를 멤버로 두어, 경고등은 꺼졌는데 검증기가 기각하는 일이 생깁니다(t1a M1).
- **선언 순서로 먼저 성공한 변환을 채택(ajv 방식)**: 소유자가 버렸고(BLUEPRINT-033), 순서가 값을 바꿉니다(`d-ajv-if.cjs`).
- **경우 12건에서 `string`을 우선**: 형을 고르는 규칙을 core에 넣게 되어 "형을 고르는 기능이 아님"에 어긋납니다. 경고등을 켜 두고 UI 플러그인이 형을 정해 보내게 하는 쪽이 계약에 맞습니다.
- **배열 아이템 자리의 union 채움을 종류로만 정함(늘 `null`)**: `{}`를 든 아이템이 `null`로 방출되어 JSON 종류가 바뀌고, 단일 터미널 객체와 동작이 갈립니다.
- **`Merge`에서 객체 V를 키 단위로 합침**: 자식이 없는 터미널에 없는 쓰기 모양을 새로 만듭니다. 현재 값이 문자열일 때의 뜻도 정할 수 없습니다.
- **검증기 입력을 늘 복사**: 모든 소비자에게 검증마다 O(값 크기)를 물립니다. 속도 우선 원칙에 어긋납니다.
- **값을 바꾸는 옵션을 경고만 함**: 방출 트리와 호출자 객체가 제자리에서 바뀝니다. 참조 규칙 VALUE-012 때문에 직전 참조가 남아, `getValue()`·`node.value`·경고등이 서로 갈린 상태가 굳습니다(t1a G10 (1)–(3)). 소리 없는 손상이라 "조용히 무시하지 않는다"보다 나쁩니다.
- **값을 바꾸는 옵션이면 거부**: 서버와 같은 ajv 인스턴스(흔히 `coerceTypes`를 켠 것)를 공유하는 소비자가 폼을 못 씁니다. 사본 경로는 VALIDATE-002 보장을 지키면서도 이 사용을 막지 않습니다.
- **개발 모드에서 방출 트리를 깊이 얼려 위반을 드러냄**: ajv가 만든 함수가 엄격 모드가 아니면 쓰기가 조용히 무시되어 판정이 소리 없이 달라질 수 있습니다. 플러그인이 `opts`로 알아내는 쪽이 확정적입니다.
- **스키마 사본을 지금처럼 필요할 때만 복사**: 제3자 검증기나 ajv의 `nullable` 처리가 작성 스키마를 바꿀 수 있습니다(G10 (4)). 한 번 깊이 복사하는 비용이 작습니다.

## 다른 렌즈에 넘기는 요구
- **노드 필드·공개 형 렌즈**: 입력과 `interpret`가 읽는 목록은 청사진의 `UnionSpec.kinds`(얼린 배열, `integer` 보존, nullable이면 입력용 목록에 `'null'` 포함) 하나여야 합니다. 새 "스키마 원본 타입" 필드가 계산된 값이면 이 배열과 같은 참조를 돌려 주십시오. 두 목록이 갈리면 입력이 보낸 값을 core가 어긋났다고 판정합니다.
- **청사진 렌즈**: `options.trim`이 `string` 없는 union에 있을 때와, 판별 리터럴의 형이 목록 밖일 때의 개발 모드 경고 두 가지가 필요합니다(12번, 27번). `then`/`allOf`의 좁힘이 `UnionSpec`을 바꾸지 않아야 합니다(소유자 결정 "검증에만 쓴다").
- **입력·렌더 렌즈**: 기본 입력은 core와 **같은** `interpret` 함수를 가져다 써야 합니다(15번). 복제 구현을 두지 않습니다. 켜진 값의 표시(REACT-027)는 원시 값이면 `String(v)`과 무효 표지, 객체·배열이면 `JSON.stringify` 읽기 전용과 비우기입니다.
- **쓰기 렌즈**: 터미널 객체 노드의 `Merge`도 통째 교체인지 확인해 주십시오(9번. 원장에서 못 찾아 "모름"). 다르면 union과 터미널 객체가 갈립니다.
- **방출 렌즈**: 터미널의 객체·배열 원본이 VALIDATE-007(JSON 왕복과 같음)을 지키는지는 멤버십 판정(얕음)이 보장하지 않습니다. 안쪽의 `undefined` 키, `Date`, `NaN`이 그 예입니다. 개발 모드의 깊은 점검 경고를 둘지 정해 주십시오.
- **검증기 플러그인(PR-4)**: ajv6·7·8 플러그인 셋에 `bind` 때의 `opts` 판별과 감싸기를 넣고, `Validator` 문서 주석에 28번의 계약을 넣습니다.
- **혼합 `oneOf`/`anyOf`(보류 결정)**: 이 렌즈의 값 규칙은 목록이 어디서 왔든 같습니다. 혼합 variant를 "게이트 없는 분기 `type`의 합집합 = union 목록"으로 읽기로 하면 `interpret`·방출·채움은 그대로 적용됩니다. 대신 객체 분기의 자식 노드가 사라져 오늘의 variant 호스트 사용성(객체 분기 필드 렌더)을 잃습니다. variant 호스트로 남기면 이 렌즈와 상관이 없습니다.
- **형 없는 `const`·`enum` 분기(열림)**: 추론하기로 한다면, 수 리터럴은 `integer`가 아니라 `number`로 추론해야 합니다. 좁히는 일은 검증기의 몫이라(P1′) 넓은 쪽이 규칙 A를 덜 흔듭니다.

## 비용 (속도·메모리·구현 크기)
- 청사진: union 자리마다 `UnionSpec` 하나(작은 객체 하나와 얼린 배열 하나)를 한 번 만들고, 같은 위치의 노드가 함께 씁니다.
- 쓰기 한 번
  - 멤버면 `classBits` 한 번과 AND 한 번으로 O(1)이고 할당이 없습니다.
  - 멤버가 아닌 문자열은 정규식 한 번과 `Number` 한 번이고, `number`·`integer`가 해석 하나를 함께 씁니다.
  - 수는 `String(n)` 한 번이나 `0/1` 비교입니다.
  - 평범한 객체 판정은 `Object.getPrototypeOf` 한 번입니다.
- 경고등: 원본이 바뀐 노드만 커밋 때 O(1)이고, 경로 집합의 증감도 O(1)입니다. 경고는 켜지는 순간에만 보냅니다.
- 방출: 비교 하나를 더합니다(19번). 복사하지 않습니다.
- 검증기
  - 기본 경로: 추가 비용이 0입니다.
  - 값을 바꾸는 인스턴스: 검증과 가드 호출마다 O(값 크기)의 복사가 들고, 그 인스턴스에만 해당합니다.
  - 스키마 깊은 사본: (검증기 인스턴스, 작성 루트)마다 O(스키마) 한 번이고, 메모리는 사본 하나입니다.
- 구현 크기(추정)
  - `parse/`(`classBits`·`convert`·`interpret`·`accepts`): 약 80–100줄
  - `unionBehavior/` 행: 약 40줄
  - 플러그인 셋: 각 20줄 안팎
  - 시험: 단위 4개 파일, 시나리오 10개 파일

## 실패 장면
- 7번의 전수가 틀렸다면 `interpret.properties.test.ts`의 순열 비교나 경우 집합 단언이 빨개집니다. 이 렌즈의 전수 실행(`d-rule-a.mjs`)에서는 통과했습니다.
- 평범한 객체 판정이 틀렸다면, `File`이나 `Date`를 터미널 객체 노드에 담던 소비자의 폼에서 이주 뒤에 경고등이 켜지고 개발 경고가 쏟아집니다(이 저장소의 UI 플러그인은 날짜를 문자열로 보내므로 해당하지 않습니다. 예: `schema-form-antd5-plugin/src/formTypeInputs/FormTypeInputDate.tsx:70`).
- 사본 경로가 틀렸다면 `union.validator-mutation` 시나리오에서 `getValue()`와 `node.value`가 갈리거나, 작성 스키마의 `type` 배열에 `'null'`이 늘어납니다.
- 15번이 사용성과 어긋난다면, `['number','string']`의 작성자들이 "수를 쳤는데 서버에 문자열이 간다"고 보고합니다. 검증기는 둘 다 통과시키므로 폼 안에서는 드러나지 않습니다. 이 실패는 문서와 시험으로만 막힙니다. 이 경우 수를 원하는 작성자는 UI 플러그인 입력을 쓰거나 목록에서 `string`을 빼야 한다고 안내합니다.
- 19번이 틀렸다면, 배열 아이템에 `{}`를 가진 union의 방출이 작성자 기대(`null`)와 달라 검증 에러의 모양이 바뀝니다.
- 13번의 로드 재경고가 소음이라면, `reset()`을 자주 부르는 폼에서 같은 경고가 반복됩니다. 개발 모드 콘솔에서 바로 보입니다.

## 소유자가 정해야 할 것
1. **`object` 멤버십을 평범한 객체로 좁힐 것인가.** 소유자 결정 (c)는 "`typeof`/`Array.isArray`"였습니다. 이 렌즈는 프로토타입 검사를 더하자고 권합니다. `Date`·`File`·클래스 인스턴스는 JSON 객체가 아니고(VALIDATE-007 JSON 왕복에서 `Date`는 문자열이 됨), `sameValue`도 이들을 참조로 봅니다(SETTLE-043). 좁히면 이들은 어긋난 값(유지 + 경고등)이 됩니다. 이 판정은 단일 터미널 객체 노드(원소 하나인 경우)에도 그대로 적용되므로 사용성 변화이고, 그래서 원리만으로 닫지 않았습니다.
2. **값을 바꾸는 검증기 옵션을 알아냈을 때의 동작.** 권장은 "그 인스턴스만 사본 경로 + 개발 경고 1회"입니다(30·31번). 대안인 "거부"는 서버와 인스턴스를 공유하는 사용을 막고, "경고만"은 소리 없는 값 손상을 허용합니다. 셋 다 기본 경로의 속도는 같으므로 차이는 사용성과 엄격함의 선택입니다.
3. **목록 밖 판별 리터럴(27번)을 경고가 아니라 청사진 오류로 올릴 것인가.** FRAGMENT-007의 소유자 원문 O-1("분기마다 다른 타입이나 성질을 가지면 오류로 알려줘야 합니다")을 넓게 읽으면 오류입니다. 이 렌즈는 P1′에 따라 경고를 권합니다.
