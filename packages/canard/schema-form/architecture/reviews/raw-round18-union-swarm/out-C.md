# Lens C: blueprint — 제안

## 요약 (5줄 이내)
- 슬롯의 종류는 **정적 연언(본체·게이트 없는 `allOf`·`$ref`)의 `type`이 먼저** 정한다. 정적 연언에 `type`이 하나도 없을 때만 게이트 없는 `oneOf`/`anyOf` 분기의 `type`을 합쳐 목록으로 쓰고, 그 밖의 모든 경우는 한 절차 안에서 일곱 결과 가운데 하나로 끝난다.
- 선언 **안**의 여러 형은 합집합으로 읽고, 정적 선언 **사이**는 종류를 바꾸지 않는 세분(`integer`, `null`)만 교집합으로 반영한다. 종류를 줄이는 좁히기는 검증 전용이고(소유자 예외), 넓히거나 다른 집합이면 종류 충돌이다. 게이트 가진 선언은 목록과 nullable을 바꾸지 않는다.
- 유효 스키마의 `type`은 병합하지 않는다. 청사진이 계산한 목록을 도장처럼 싣고(`null`은 nullable일 때), 순서는 앵커 선언에 적힌 순서를 따르며, 같은 내용이면 같은 참조(interned frozen)를 준다.
- 새 오류 코드는 없다. 새 경고는 하나뿐이다: 터미널 노드 아래의 예약 층 키(가칭 `TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`). ajv8 플러그인 셋에 `allowUnionTypes: true`를 권한다.
- 미결 둘(형 없는 `const`/`enum` 분기, 객체와 원시가 섞인 `oneOf`)은 모두 기본값을 `UNKNOWN_JSON_SCHEMA`로 두기를 권한다. 오류를 나중에 허용으로 바꾸는 것은 파괴적 변화가 아니라서 앞으로 호환된다.

## 제안

### 0. 정의
1. 선언 d의 형 집합 τ(d)는 d 자신의 `type`(문자열이나 배열)이다. `nullable: true`는 **같은 객체에 `type`이 있을 때만** `null`을 더한다. `nullable: false`는 아무것도 빼지 않는다. 근거는 OAS 3.0.3 원문 "adds "null" … only if type is explicitly defined within the same Schema Object … A false value leaves the specified or default type unmodified"(`S/oas303.txt:3087-3089`)와 ajv8 `getSchemaTypes`(`PKG/node_modules/ajv/lib/compile/validate/dataType.ts:19-29`)다.
2. `type`이 없으면 τ = ⊤다. 어느 종류와도 맞는 overlay이며, BLUEPRINT-032를 그대로 따른다.
3. 접기 fold(τ)는 `null`을 빼고 `integer`를 `number`로 바꾼 집합이다. 종류는 다음과 같다: |fold| = 0이고 `null` ∈ τ이면 null, |fold| = 1이면 그 종류, |fold| ≥ 2이면 `union`(BLUEPRINT-034 (1), NODE-041).
4. 선언 하나 안의 목록은 합집합이다. `number`가 있으면 `integer`를 지운다(소유자 결정: "`['integer','number']` uses the number rule", LANDING-130).
5. 두 선언이 같은 종류라는 것은 fold가 같다는 뜻이다(BLUEPRINT-034 (2), BLUEPRINT-009 보충의 "같은 노드 종류"). 구현은 7비트 마스크 비교 한 번이다.

### 1. 슬롯 판정 절차 (순서대로 보며, 반드시 하나로 끝난다)
6. **S0 형 문법 검사.** 알려지지 않은 형 이름, 빈 배열 `[]`, 중복 원소(`['string','string']`, `['null','null']`)는 청사진 오류 `UNKNOWN_JSON_SCHEMA`다. 오늘 `[]`와 `['string','string']`가 이 오류인 것과 같다(`extractSchemaInfo.ts:25,28-29`, `schemaNodeFactory.ts:116`). ERROR-164 첫 행의 코드를 쓴다.
7. **S1 정적 연언 C를 모은다.** C는 슬롯 본체, 게이트 없는 `allOf` 항목(재귀), 그리고 이것들의 `$ref` 대상이다. 범위는 FRAGMENT-048의 "정적 연언" 정의와 같다. C 안에서 `type`을 가진 선언을 전순서(SCHEMA-007)로 늘어놓고, 첫째를 **앵커 A**라 한다.
8. **S2 C에 `type`이 있으면** 종류는 kind(τ(A))이고, 목록은 τ(A)에서 출발한다. 나머지 정적 선언 d는 아래 9–11대로 처리한다. 그다음 S4로 간다.
9. fold(τ(d)) = fold(τ(A))이면 같은 종류다. 목록을 JSON Schema 교집합으로 세분한다: `number`∩`integer` → `integer`, nullable ← nullable ∧ (`null` ∈ τ(d)). 오늘의 `processSchemaType` 결과와 같다(`processSchemaType.ts:57-67,73`).
10. fold(τ(d)) ⊊ fold(τ(A))이고 A가 `union`이면 d는 **검증 전용**이다. 목록에도 nullable에도 기여하지 않는다(소유자 예외, BLUEPRINT-011/012의 명시적 예외).
11. 그 밖(넓히기, 겹치지 않는 집합)은 정적 연언의 `type` 재정의이므로 `ALL_OF_TYPE_REDEFINITION`이다. 오늘과 같은 코드다(`processAllOfSchema.ts:45-50`, ERROR-164 셋째 행).
12. 자기 `type`이 있는 슬롯에서 게이트 없는 `oneOf`/`anyOf` 분기의 `type`은, 슬롯이 원시·`union` 종류이면 **검증 전용**이다. 목록 밖 분기(null 분기 포함)여도 오류가 아니다. 이유: 분기가 만족될 수 있는지 판정하는 것은 검증기의 일이다(P1′, FRAGMENT-004). 이 슬롯에서 형을 선언하는 것은 자기 `type`이다. 이 규칙이 t1a M2가 지적한 "`type` 배열을 더하라"는 처방의 모순을 닫는다. 슬롯이 object/array이면 분기는 기존 variant 규칙을 그대로 따른다(FRAGMENT-001 넷째 행).
13. **S3 C에 `type`이 없으면** 슬롯의 게이트 없는 `oneOf`/`anyOf` 분기 b를 본다. 분기가 없으면 `UNKNOWN_JSON_SCHEMA`다(오늘과 같다: `extractSchemaInfo.ts:23` → `schemaNodeFactory.ts:116`). `oneOf`와 `anyOf`가 함께 있으면 `UNKNOWN_JSON_SCHEMA`이고, 처방은 "슬롯에 `type`을 적으라"다(SCHEMA-036이 아직 열려 있으므로 합치는 규칙을 만들지 않는다).
14. 분기마다 τ(b)는 그 분기 정적 연언(자기 `type`, 게이트 없는 `allOf`, `$ref`)의 `type`이다. **τ(b) = ⊤인 분기가 하나라도 있으면**(`const`/`enum`만 있는 분기 포함) `UNKNOWN_JSON_SCHEMA`다 **[미결 P1 자리, 권장 기본값]**. 이유: JSON Schema에서 형 없는 분기는 모든 형을 받으므로 합집합이 "전부"가 된다. `const`/`enum`의 값에서 형을 읽는 것은 검증 의미를 형상 규칙에 끌어들이는 일이다(P1′). 그 예외는 `controls.discriminator` 하나로 이미 정해져 있다(BLUEPRINT-017 "유일한 예외").
15. U = ∪τ(b)다. `null`만인 분기(`isNullBranch`)는 nullable 플래그가 된다(BLUEPRINT-032 보충, FRAGMENT-048).
16. fold(U)에 `object`나 `array`가 있고 다른 종류와 섞여 있으면 `UNKNOWN_JSON_SCHEMA`다 **[미결 P2 자리, 권장 기본값]**. fold(U) = {object}이면 variant 호스트이고 null 분기가 있으면 nullable이다(t1a M3의 수정문). fold(U) = {array}이면 분기를 조각으로 가진 배열 노드다. 그 밖이면 원시 잎이나 `union` 잎이며 목록은 U다. 분기의 제약은 검증 전용이다(SCHEMA-008 "존재만").
17. 게이트를 가진 분기(분기 안의 `controls.active`, `controls.discriminator`로 변환된 분기)는 합치기에 넣지 않는다. 그런 분기는 게이트 가진 선언으로 규칙 26–29를 따른다(FRAGMENT-001 셋째 행, FRAGMENT-008).
18. **S4 전략.** `union`은 행이 하나인 종류이므로 전략은 `terminal`이고, 렌더 계층의 판정을 묻지 않는다(NODE-047). 어느 선언에든 `options.terminal: false`가 있으면 `TERMINAL_OPTION_UNSUPPORTED`다(ERROR-200, 기록에 schemaPath·`type`·값). `true`는 허용한다. 인라인 `FormTypeInput`이 있어도 그 입력으로 그릴 뿐 판정은 바뀌지 않는다.
19. fold에 `object`나 `array`가 드는 `union`은 **터미널 강제 행**이다. 규칙 18과 같은 규칙에서 나오므로 추가 판정은 없다. 이 슬롯의 `properties`·`items`·`prefixItems`는 자식을 만들지 않는 검증 전용이고, `find('/slot/key')`는 `null`이다(NODE-020).
20. 종류가 object/array인 슬롯(nullable 포함)은 오늘의 순서를 따른다: `options.terminal` → 판정 → `type`(NODE-028, NODE-042).
21. **결과는 일곱 가지다.** 원시 잎(+nullable), null 잎, `union` 잎(원시만), `union` 잎(터미널 강제), object/array 노드(branch|terminal, +nullable), variant 호스트, 청사진 오류.

### 2. nullable의 출처
22. `null`은 세 곳에서 온다: 배열 안의 `'null'`, 같은 객체에 `type`이 있는 `nullable: true`, 형 없는 슬롯의 null 분기. 어느 쪽이든 종류는 바꾸지 않는다(BLUEPRINT-032).
23. `['object','null']`·`['array','null']`은 fold = {object}/{array}인 한 종류이므로 nullable object/array다. branch나 terminal이 될 수 있다(오늘과 같다: `extractSchemaInfo.ts:28-30`). `['object','string']`, `['object','array']`, `['array','string','null']`은 |fold| ≥ 2이므로 터미널 강제 `union`이다(nullable 여부는 따로 붙는다).
24. 자기 `type`이 non-null인 슬롯에 붙은 null 분기는 nullable을 주지 않는다. JSON Schema의 연언이 그렇고, 오늘 객체 호스트도 그렇다(`getCompositionNodeMapList`가 null 분기를 건너뜀, `warnIfNullBranchIgnored.ts:15-29`).
25. 정적 선언 사이의 nullable은 AND다(규칙 9). 게이트 가진 선언이 `null`을 **더해도** 정적 선언이 있으면 nullable은 바뀌지 않는다. 연언에서는 본체가 이미 `null`을 거부하므로 검증기 판정과 같다. 게이트 가진 선언이 `null`을 **빼는** 것은 규칙 27에 따라 검증 전용이다.

### 3. 노드가 싣는 목록 — 조각 사이의 공유 (Lens A의 필드에 공급)
26. 같은 이름의 선언이 여러 조각에 있으면(호스트 수준), 각 선언이 1–21로 (종류, 목록, nullable)을 내고 fold가 같은 것끼리 노드 하나를 공유한다(BLUEPRINT-010). 그래서 `['string','number']`와 `['number','string']`, `['integer','string']`와 `['number','string']`은 노드 하나다.
27. 공유 노드의 목록과 nullable은 **정적 선언만으로** 정한다. 앵커는 전순서의 첫 정적 선언이고, 합치는 방식은 규칙 9–11과 같다. 그래서 본체 `['integer','string']` + 게이트 없는 `allOf` `['number','string']`의 목록은 `['integer','string']`이다. 게이트 가진 선언은 목록과 nullable을 바꾸지 않는다(검증 전용). 목록은 청사진에서 정해지는 정적 값이고, 규칙 A가 쓰기마다 같은 목록을 읽게 된다(t1a G3 "원리로 도출 가능").
28. 정적 선언이 하나도 없으면(모든 선언이 게이트 아래에 있으면) 목록은 같은 종류 선언들의 JSON Schema **합집합**이다. `integer`는 모두가 `integer`일 때만 남고, nullable은 어느 하나라도 `null`을 허용하면 참이다. 노드가 있는 모든 경우를 덮는 가장 좁은 정적 목록이 이것이다.
29. **좁히기 예외의 정확한 조건.** 선언 d의 fold가 `union` 선언 u의 fold의 진부분집합이고, u가 **d가 켜지는 모든 경우에 켜져 있으면** d는 검증 전용이다. u가 켜져 있다는 것은 u가 정적이거나, u가 d를 감싸는 조각에 있다는 뜻이다(NODE-042의 경우 정의와 같은 비용). 그 밖에 fold가 다르면 BLUEPRINT-011/012가 적용된다. 게이트 없는 선언끼리이면 `SHARED_NODE_KIND_CONFLICT`, 게이트 가진 선언이 동시에 켜지면 정착 오류, 배타적인 `then`/`else`이면 종류별 노드다. 마지막 경우가 BLUEPRINT-033이 말하는 "형 고르기는 if/then/else로"를 가능하게 한다.
30. 예시로 확인한다.
    - 본체 `['string','number']` + `then:{type:'number'}` → `union` 유지. 게이트가 켜져도 유효 `type`은 그대로다.
    - 본체 `'number'` + `then:{type:['number','string']}` → 넓히기이므로 동시에 켜지면 정착 오류다.
    - 본체 `['string','number']` + `then:['string','number','null']` → 같은 종류다. nullable은 그대로 거짓이다(규칙 25).
    - `then:['string','number']` / `else:'number'`(본체 없음) → 두 노드이고 배타적이다.
31. **유효 스키마의 `type`은 병합표에 새로 두는 행이다.** `type`은 조각에서 병합하지 않는다. 청사진이 계산한 값을 싣는다: 목록 원소가 하나이고 nullable이 아니면 문자열, 그 밖이면 배열이며, `null`은 nullable일 때 끝에 붙인다. 순서는 앵커에 적힌 순서이고, 분기에서 합친 경우는 분기의 배열 순서대로 처음 나온 순서다. 이 도장 덕분에 BLUEPRINT-033의 "목록은 `node.jsonSchema.type`에서 읽는다"가 형 없는 슬롯(분기 합치기)에서도 성립한다. t1a G3도 닫힌다. 게이트 조각이 켜지고 꺼져도 `type`의 참조는 바뀌지 않는다(BLUEPRINT-021 메모와 양립).
32. 계산된 `type`은 내용이 같으면 **같은 참조**(모듈 수준 intern, `Object.freeze`)다. 작성자의 배열은 가리키지 않는다. 이유: ajv8은 `nullable: true`인 스키마를 컴파일할 때 작성자의 `type` 배열에 `'null'`을 push한다(`dataType.ts:35` `types = Array.isArray(ts) ? ts : …`, `:28` `types.push("null")`).
33. Lens A에게 주는 값은 다음과 같다.
    - (a) 계산된 `type`(규칙 31–32). 오늘 `schemaType`의 자리를 잇는다. 단일 비nullable 노드에서는 오늘 값과 같다(`'integer'` 보존, `AbstractNode.ts:83`, `NumberNode.ts:104`).
    - (b) 앵커 선언에 적힌 `type` 원문. 단 원문이 없는 경우(분기 합치기)는 `undefined`다.
    - (c) nullable.
    - (d) fold 마스크(종류 동일성 판정용, 비공개로 충분).
    - 순서에는 core의 의미가 없다(규칙 A는 순서와 무관, BLUEPRINT-033). 그래도 작성자가 쓴 순서를 보존하므로, UI 플러그인이 "첫 형을 기본 입력으로" 같은 선택을 할 수 있다.

### 4. 터미널 강제와 그 아래의 선언
34. 터미널 강제 `union` 슬롯 **자기** 층의 `controls`·`options`·`presentation`은 그 노드의 키로 그대로 작동한다(`active`, `visible`, `default` 등). 단 `controls.children`은 대상 자식이 없으므로 기존 청사진 오류 `CHILDREN_TARGET_NOT_FOUND`다(CONTROLS-073, ERROR-164 보충 18C-12).
35. **새 경고**는 (가칭) `SCHEMA_FORM_WARNING.TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`이다.
    - 수준: `warning`.
    - 언제: 청사진 분석 중, 전략이 `terminal`인 **모든** 노드(터미널 강제 `union`, 터미널 object/array)의 인라인 하위 스키마(`properties`·`items`·`prefixItems`·그 분기, 깊이 ≥ 1)에서 예약 층 그룹 키 `controls`·`options`·`presentation`이 나올 때.
    - `$ref`는 따라가지 않는다. `$defs`의 정의는 다른 사용처에서 존중되기 때문이다.
    - 표준 `properties`·`items`·`default`는 대상이 아니다. 검증기가 쓰거나 주석이어서, 생성기 출력마다 경고가 나는 잡음을 피한다.
    - 기록: `{ schemaPath, keys, paths }`(paths는 앞의 N개).
    - 중복 억제: `(code, schemaPath)`로 트리마다 한 번.
    - 드러남: 개발 모드 콘솔, 핸들러 전달은 커밋된 로드의 준비 이펙트다(`NULL_BRANCH_IGNORED_FOR_FORM` 행과 같다, ERROR-164). 핸들러가 없는 프로덕션에서는 스캔하지 않는다(`MULTIPLE_GATED_BRANCHES_ACTIVE` 행의 선례).
36. 코드를 새로 두는 이유는 기존 코드 가운데 어느 것도 이 사건을 뜻하지 않기 때문이다.
    - `PRESENTATION_KEY_SUSPECT`는 철자 의심이고 렌더 때 노드마다 나온다.
    - `LOCK_ON_NON_TERMINAL_OBJECT`는 반대 방향이다.
    - `NULL_BRANCH_IGNORED_FOR_FORM`은 null 분기 전용이다.
    - 이 코드가 없으면 원칙 "조용히 무시하지 않는다"가 깨진다. 이름은 기존 `…_IGNORED_FOR_FORM` 계열을 따랐다.

### 5. 오류 코드 대응표 (새 오류 코드 없음)
37. 사례별 코드는 다음과 같다.

| 사례 | 코드 | 근거 |
|---|---|---|
| 모르는 형, `[]`, 중복 원소, 형도 분기도 없음, 형 없는 분기(P1), 객체와 원시가 섞인 분기(P2), 형 없는 슬롯에 `oneOf`와 `anyOf`가 함께 있음 | `UNKNOWN_JSON_SCHEMA` | ERROR-164, BLUEPRINT-034 (5). t1a G11에 따라 코드 하나로 통일 |
| 같은 스키마 객체의 정적 연언에서 넓히기, 겹치지 않는 집합 | `ALL_OF_TYPE_REDEFINITION` | ERROR-164, `processAllOfSchema.ts:45-50` |
| 다른 조각의 게이트 없는 같은 이름·다른 종류 | `SHARED_NODE_KIND_CONFLICT`(가칭) | ERROR-164, BLUEPRINT-012 |
| 게이트 가진 선언이 동시에 켜진 다른 종류 | BLUEPRINT-012의 정착 오류 | BLUEPRINT-012 |
| `union`에 `options.terminal: false` | `TERMINAL_OPTION_UNSUPPORTED` | ERROR-200, NODE-047 |
| 터미널 `union`의 `controls.children` | `CHILDREN_TARGET_NOT_FOUND` | CONTROLS-073 |
| 터미널 아래의 예약 층 키 | 새 경고(규칙 35) | — |

### 6. ajv `strictTypes`
38. ajv8 플러그인의 세 진입점 기본 설정에 `allowUnionTypes: true`를 더한다(`schema-form-ajv8-plugin/src/{default,2019,2020}/validatorPlugin.ts` 기본 객체의 16–19행 부근). 판정은 바뀌지 않는다. ajv의 `strictTypes` 기본값이 `"log"`여서 union `type`마다 프로덕션에서도 `console.warn`이 나기 때문이다(`S/../reports/standards-research-1.md:62,149-150`).
39. ajv7 플러그인은 이미 `strict: false`(`schema-form-ajv7-plugin/src/validator/validatorPlugin.ts:22`)이므로 경고가 없고 바꿀 것이 없다. ajv6에는 strict 모드가 없다(strict 모드는 ajv7에서 도입되었다. 이 저장소에서 실행해 확인하지는 않았다). `bind(instance)`로 넘긴 인스턴스는 소비자 몫이며 문서에 적는다(VALIDATE-003).

### 7. 이주 행 (오늘 → 새 설계, 오늘 동작은 코드 경로로 확인)

| # | 스키마 | 오늘 | 새 설계 | 오늘의 근거 |
|---|---|---|---|---|
| M1 | `['string','number']`(null 없는 두 형) | `UNKNOWN_JSON_SCHEMA` | `union` 잎 | `extractSchemaInfo.ts:28-29` → `schemaNodeFactory.ts:116` |
| M2 | `['string','number','null']`(세 원소 이상) | 같음 | nullable `union` | `extractSchemaInfo.ts:25` |
| M3 | `['integer','number']` | 같음 | number(LANDING-130) | `:28-29` |
| M4 | `['object','string']`, `['object','array']`, `['array','string']` | 같음 | 터미널 강제 `union`, 내부 `find` 없음, 빈 `{}`/`[]`를 방출하려면 `omitEmpty: false` | `:28-29` |
| M5 | `{type:['string','number'], nullable:true}` | 같음 | nullable `union` | 배열 경로는 `nullable`을 보지 않음 `:24-31` |
| M6 | 형 없는 `anyOf:[{type:'string'},{type:'number'}]` | 같음 | `union` 잎 | `:23` |
| M7 | 형 없는 `anyOf:[{type:'string'},{type:'null'}]`(pydantic `Optional`, zod `.nullable()`) | 같음 | nullable string | `:23` |
| M8 | 형 없는 `{allOf:[{type:'string'}]}` | 같음. 기반에 형이 없어 병합 처리기가 `null`이고 `allOf`를 합치지 않음 | string 노드 | `getMergeSchemaHandler.ts`(`extractSchemaInfo(base)` → `null`), `processAllOfSchema.ts:31-32` |
| M9 | `{type:['string','number'], allOf:[{type:'number'}]}` | 같음(M8과 같은 경로) | `union`, `allOf`는 검증 전용 | 위와 같음 |
| M10 | `['null','null']` | null 노드 | `UNKNOWN_JSON_SCHEMA`(중복) | `:28-30` |
| M11 | `{type:'string', nullable:true}` | 노드 string, `jsonSchema.type === 'string'` | 같은 노드, 유효 `type`은 `['string','null']` | `:34`, `schemaNodeFactory.ts:140`(스키마 그대로) |
| M12 | `allOf` 항목 `{nullable:false}`(형 없음)가 nullable 기반에 붙음 | null이 빠짐 | 효과 없음(OAS 3.0.3). ajv8은 이 스키마를 컴파일에서 거부 | `processSchemaType.ts:57,65-67`, `dataType.ts:25-26` |
| M13 | 객체와 원시가 섞인 형 없는 `anyOf` | `UNKNOWN_JSON_SCHEMA` | 그대로(P2 기본값) | `:23` |

바뀌지 않는 것: `['object','null']`(nullable object), `['null']`, `[]`, `['string','string']`, `{type:'number', allOf:[{type:'integer'}]}` → integer(`processSchemaType.ts:73`), `{type:'number', allOf:[{type:['number','string']}]}` → `ALL_OF_TYPE_REDEFINITION`(`isCompatibleSchemaType`의 배열 길이 2·null 없음 → `false`, `packages/winglet/json-schema/.../isCompatibleSchemaType`의 78–80행).

### 8. 코퍼스
40. **이제 서는 것**(`standards-research-1.md` Q2):
    - TypeBox `Union[String,Number]`(`anyOf`)
    - zod 4.0–4.4와 `zod/v4`의 union·`.nullable()`(`anyOf`)
    - zod ≥ 4.5와 zod-to-json-schema의 `type` 배열 압축
    - 제약이 있어 `anyOf`로 남는 zod·pydantic 분기(분기 제약은 검증 전용)
    - zod `z.xor()`(`oneOf`)
    - pydantic 기본 `any_of`의 `Union[int,str]`·`Optional[float]`
    - ts-json-schema-generator·typescript-json-schema의 원시 `type` 배열(`string|number|null` 세 원소 포함)
    - OAS 3.0 `type` + `nullable: true`
41. **여전히 실패하는 것:**
    - 객체와 원시가 섞인 union(pydantic `Union[Model,str]`, TypeBox `Union[Object,String]`), P2 결정 전까지
    - 형 없는 `const`/`enum` 분기(P1). 어느 생성기가 이것을 내는지는 **모름**. research-1은 이것을 조사하지 않았다
    - OAS 3.0의 `{nullable:true, oneOf:[…]}`(형 없음). OAS 3.0.3에서는 `nullable`이 효과가 없고 ajv8은 거부한다(`dataType.ts:25-26`). 청사진은 분기로 판정하므로, 분기가 모두 객체이면 nullable이 아닌 variant 호스트로 선다.
42. **더할 시험 스키마 여섯**(TEST-067 코퍼스 옆):
    - T1: 본체 `properties.a:{type:['number','string']}` + 게이트 없는 `allOf` `properties.a:{type:['string','number']}` → 노드 하나, 유효 `type`은 `['number','string']`, 두 번 읽으면 같은 참조, 작성자 배열과 다른 참조.
    - T2: `{anyOf:[{type:'integer'},{type:'string',minLength:1},{type:'null'}]}` → nullable `union`, 목록 `['integer','string']`. `{anyOf:[{const:'a'},{type:'number'}]}` → `UNKNOWN_JSON_SCHEMA`.
    - T3: `{type:['object','string'], properties:{code:{type:'number', controls:{active:'…'}}}}` → 터미널 `union`, `find('/f/code') === null`, 규칙 35의 경고 한 번. `options.terminal:false`를 더하면 `TERMINAL_OPTION_UNSUPPORTED`.
    - T4: 본체 `a:['string','number']` + `if/then a:{type:'number'}` → `union` 유지, 게이트 전후로 유효 `type`의 참조가 같음. `then a:['number','boolean']`은 동시에 켜지면 정착 오류. 같은 것을 게이트 없는 `allOf`에 두면 `SHARED_NODE_KIND_CONFLICT`.
    - T5: `['integer','number']` → number. 본체 `['integer','string']` + `allOf` `['number','string']` → 목록 `['integer','string']`. `{type:'number', allOf:[{type:'integer'}]}` → `integer`.
    - T6: ajv8 기본 플러그인으로 `{type:['string','number']}`를 컴파일할 때 `console.warn` 0회. `{type:['string','number'], nullable:true}`를 컴파일한 뒤에도 작성자 스키마와 노드의 목록이 바뀌지 않음(규칙 32).

## 대안과 버린 이유
- **분기가 있어도 자기 `type`보다 분기를 먼저 읽는 안.** 슬롯에 `type`을 더하라는 처방이 스스로 충돌을 부르게 된다(t1a M2). P1′과도 거꾸로다.
- **정적 선언 사이를 대칭적으로 "가장 넓은 선언이 종류"로 보는 안.** 본체에 `'number'`를 적었는데 `allOf`의 `['number','string']` 때문에 노드가 `union`이 되어 버린다. 소유자 문구 "본체 union을 좁히기"는 본체가 앵커라는 뜻이다. 대가로 남는 비대칭(본체와 `allOf`를 맞바꾸면 union과 충돌이 서로 바뀜)은 실패 장면에 적었다.
- **정적 좁히기도 교집합으로 반영하는 안**(`['string','number']` + `allOf 'number'` → number). 소유자가 `then`/`allOf` 좁히기를 검증 전용으로 정했으므로 받지 않았다. 종류가 줄지 않는 세분(`integer`, `null`)만 교집합으로 반영한다. 오늘과의 호환(`processSchemaType.ts`)을 지키기 위해서다.
- **유효 `type`을 작성 원문 그대로 두고 계산값은 노드 필드에만 두는 안.** 형 없는 슬롯에서는 `jsonSchema.type`이 없어 BLUEPRINT-033 문장이 거짓이 되고(t1a G3의 E4), ajv8의 제자리 push가 원문을 바꿀 수 있다. 저장소의 UI 플러그인 가운데 `jsonSchema.type`을 직접 읽는 곳은 0곳이다(`schema-form-*-plugin/src` grep). 그래서 도장을 찍어도 저장소 안에서 깨지는 곳이 없다.
- **고정된 정규 순서**(`string, number, …`). 교차 비교에는 편하지만 "쓴 그대로"라는 소유자 지시와 플러그인의 첫 형 관행을 잃는다. 참조가 같다는 성질은 intern으로 얻는다.
- **`isCompatibleSchemaType` 재사용.** `['integer','number']`를 `'number'`와 다르다고 판정하므로(`isCompatibleSchemaType.ts:78-80`) 접은 집합이 같다는 판정과 어긋난다. 7비트 마스크 비교가 더 짧고 정확하다.
- **형 없는 `nullable: true`를 nullable로 읽는 안.** OAS 3.0.3 원문과 ajv8(컴파일 거부)이 둘 다 반대다.
- **목록 밖 분기를 청사진 오류로 두는 안**(t1a M2 둘째 절). 폼이 분기가 만족될 수 있는지를 판정하게 되고, 오늘 서는 스키마를 새로 깬다.

## 다른 렌즈에 넘기는 요구
- **Lens A(노드 표면):** 규칙 33의 (a)–(c)를 받는다. 계산된 `type`은 intern된 frozen 값이며, 필드 이름과 `null` 포함 여부는 A가 정한다. BLUEPRINT-033의 "목록은 `node.jsonSchema.type`에서"는 규칙 31 덕분에 그대로 성립한다. `schemaType`을 없애면 `NumberNode.ts:104`의 정수 판정은 계산된 `type`의 `'integer'` 포함 여부로 옮겨야 한다.
- **Lens B(입력 선택):** Hint의 `type`(`useFormTypeInput.ts:69-77`)이 계산값을 받게 되면 `'union'` 노드의 테스트 함수는 배열을 받는다. `===` 비교는 원소가 하나인 경우에만 성립한다. 목록 순서에 core의 의미가 없다는 점을 문서에 적어야 한다.
- **Lens D(값 의미):** 규칙 A는 노드의 **정적** 목록만 읽어야 한다(규칙 27). 게이트가 켜지고 꺼지는 것만으로는 경고등을 다시 계산하지 않는다. 목록에 `integer`가 있을 때의 판정은 소유자 결정("integer-valued finite number")을 따른다.
- **검증기 쪽(미결 Q8):** 청사진이 필요로 하는 것은 **스키마** 불변이다. 검증기는 작성 스키마의 깊은 사본을 컴파일마다 한 번 받아야 한다. ajv8은 `nullable: true`에서 작성자의 `type` 배열을 바꾼다(`dataType.ts:28,35`). 이것이 보장되지 않으면 규칙 32의 intern이 방어선이 되고, 도장 사본의 비용이 union 노드마다 1회로 늘어난다. 값 변이 쪽은 이 렌즈 범위 밖이다.
- **오류 정책:** ERROR-164에 새 경고 행 하나(규칙 35)를 더하고, 병합표(SCHEMA-008–013 계열)에 `type` 행 하나(규칙 31)를 더한다.

## 비용 (속도·메모리·구현 크기)
- **청사진(로드마다 한 번):** 선언마다 `type` 파싱 O(원소 수 ≤ 7)과 마스크 비교 O(1)이다. 분기 합치기는 O(분기 수 × 정적 연언 깊이)이고, 좁히기 조건(규칙 29)은 NODE-042와 같은 상한(선언 수 × 중첩 깊이)이다.
- **런타임:** 추가 비용이 0이다. 목록이 정적이어서 쓰기와 게이트 전환 때 다시 계산하지 않는다.
- **메모리:** intern 표는 최대 수십 항목이다(서로 다른 순서의 조합만큼). 유효 스키마 도장은 계산값이 원문과 내용이 다를 때만(`nullable` 키워드, `integer` 세분, 분기 합치기, 원문 배열 보호) 노드마다 얕은 사본 하나를 만들고, 메모가 이후를 맡는다.
- **경고 스캔:** 터미널 인라인 하위 스키마 크기에 비례하며, 개발 모드나 핸들러가 있을 때만 돈다.
- **구현:** `extractSchemaInfo`(36줄)와 `processSchemaType`의 형 부분을 형 집합 도우미 하나로 바꾼다(약 60줄). 분기 합치기 약 50줄, 공유 규칙 확장 약 40줄, 경고 약 40줄, ajv8 한 줄씩 세 곳이다.

## 실패 장면
- **정적 좁히기가 검증 전용이라서 생기는 장면.** `{type:['string','number'], allOf:[{type:'number'}]}`에 사용자가 `"abc"`를 치면 경고등은 꺼진 채 검증 오류만 늘 뜬다. 작성자들이 "`allOf`가 무시된다"고 보고하면 이 규칙(소유자 예외를 정적 `allOf`까지 적용한 것)이 틀린 것이다.
- **앵커 순서 때문에 생기는 장면.** 같은 두 `type`을 본체와 `allOf`에서 맞바꾸면 `union`과 `ALL_OF_TYPE_REDEFINITION`이 서로 바뀐다. 리팩터링으로 폼이 깨졌다는 보고가 나오면 대칭 규칙을 다시 따져야 한다.
- **P1 기본값이 틀린 경우.** 널리 쓰는 생성기가 형 없는 `const` 분기(리터럴 union)를 내면 `UNKNOWN_JSON_SCHEMA` 보고가 몰린다. 코퍼스에 리터럴 union 표본을 넣으면 곧바로 드러난다.
- **도장이 문제를 일으키는 경우.** 저장소 밖 플러그인이 `jsonSchema.type === 'string'`으로 nullable 키워드 문자열을 고르고 있었다면 입력 선택이 달라진다(M11). 배포 전 이주 안내로만 막을 수 있다.
- **경고가 잡음이 되는 경우.** 기존 터미널 객체에서 예약 층 키 경고가 대량으로 나면, 오늘 그런 스키마가 흔했다는 뜻이다. 그때는 범위를 터미널 강제 `union`으로 좁히는 안을 고른다.

## 소유자가 정해야 할 것
1. **P1: 형 없는 `const`/`enum` 분기.** 권장은 명시 `type`을 요구하는 것(기본값 `UNKNOWN_JSON_SCHEMA`)이다. 원리로 닫히지 않는 이유가 있다. 추론은 JSON Schema에서 틀리지 않으므로(`const:'a'`는 문자열만 받는다) P1′과 표준 정합 가운데 무엇을 앞세울지는 가치 판단이다. 오류를 기본으로 두면 나중에 허용하는 쪽으로 바꿔도 파괴적 변화가 아니다.
2. **P2: 객체와 원시가 섞인 `oneOf`/`anyOf`.** 이 제안의 절차에서는 허용하면 16번 자리가 "터미널 강제 `union`, 분기의 `properties`는 검증 전용"이 된다. `type` 배열의 (c)와 같은 결과다. 다른 일관된 답은 오류 하나뿐이다. variant 호스트와 원시 잎이 한 노드에 공존할 수 없기 때문이다. 권장 기본값은 오류이고, 앞으로 호환된다.
3. **ajv8 기본 설정에 `allowUnionTypes: true`.** VALIDATE-003("기본값은 바꾸지 않는다", 소유자 답 R1)과 문언이 부딪친다. 판정을 바꾸지 않는 로그 설정이라는 점을 들어 예외로 볼지 정해야 한다.
4. **새 경고의 범위.** 규칙 35를 모든 터미널 노드에 적용할지, 터미널 강제 `union`에만 적용할지 정해야 한다. 일관성으로는 전자이지만 전자는 기존 터미널 객체의 동작도 바꾼다(경고가 새로 생김). 이 렌즈의 권한 밖이다.
