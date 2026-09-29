# ADR 0017 — 좁힘의 교차

## 상태

| 항목 | 닫은 사람 | 라운드 |
| --- | --- | --- |
| BLUEPRINT-041 | 소유자 답(`reviews/round-18-owner-answers.md:37` union O7·O8), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-104), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105; U7 재해석은 라운드마다) | 18 |
| BLUEPRINT-044 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105) | 18 |
| WRITE-098 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-104), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105) | 18 |
| WRITE-099 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105), 소유자 답(`reviews/round-18-owner-answers.md:24` 18C 검토 1번; 입력이 보내는 값), 편집자 결정(18라운드, LANDING-065; 배열 스냅숏 시험은 PR-5) | 18 |

## 결정

### 01-schema-to-blueprint.md §2.6 허용 집합과 유효 목록

가. 목록은 `node.schemaType`(+`nullable`)에서 읽는다; 유효 목록은 BLUEPRINT-041의 통합 원리 U4다(BLUEPRINT-040, BLUEPRINT-041). 규칙 A·기본 입력·경고등의 기준 목록은 `node.schemaType`과 `node.nullable`이며, 게이트가 켜진 동안에는 모든 종류에서 유효 목록을 쓴다(BLUEPRINT-040). 청사진은 계산한 `schemaType`을 유효 스키마에 써 넣지 않는다(BLUEPRINT-040). `jsonSchema.type`은 켜진 선언의 `type`을 병합표 규칙대로 교집합으로 합친 값이다(BLUEPRINT-040). 그래서 켜진 `then`이 목록을 좁히면 `jsonSchema.type`은 좁아지고, `schemaType`은 그대로다(BLUEPRINT-040). `union` 노드의 입력은 목록의 한 형의 값이나 없음을 보내며, 어떤 형을 보낼지는 입력 구현(UI 플러그인)이 정한다(BLUEPRINT-040, WRITE-099).

통합 원리 U1–U9를 채택한다(BLUEPRINT-041). U1: 한 칸의 `type` 선언들은 연언이고, 허용 집합은 교집합이며(`null` 포함, `integer ⊂ number`), 순서와 무관하다(BLUEPRINT-041). U2: 빈 교집합만이 충돌이며, 정적이면 청사진 오류, 게이트이면 그 게이트들이 켜진 동안의 정착 오류이고, `{null}`은 빈 집합이 아니라 null 노드다(BLUEPRINT-041). U3: 정적 선언(본체·게이트 없는 `allOf`·`$ref`)이 종류·`schemaType`·`nullable`을 청사진에서 정한다(BLUEPRINT-041). U4: 게이트 선언(`then`·`else`, `controls.active` 조각, 게이트 가진 분기)은 종류·`schemaType`·`nullable`·입력 선택을 바꾸지 않고, 켜진 동안 유효 목록만 좁히며, 이는 모든 종류에 적용된다(BLUEPRINT-041). U5: 유효 목록은 노드마다 유효 스키마 메모에서 파생하고, 좁히지 않으면 `schemaType`과 같은 참조이며, 병합표의 `type` 행은 교집합이다(BLUEPRINT-041). U6: 게이트만 바뀌면 값은 다시 해석하지 않고(소급 변환 없음) 경고등만 다시 정한다(BLUEPRINT-041). U7: 한 진입에서 쓰인 노드(입력 쓰기·`setValue`·로드·채움)는 그 진입의 전이 단계에서 최종 유효 목록으로 한 번 더 해석하며, 쓰이지 않은 노드는 다시 해석하지 않는다(BLUEPRINT-041). U8: 호스트의 게이트 없는 분기는 "또는" 문맥이라 유효 목록을 좁히지 않는다(BLUEPRINT-041). U9: 쓰기 없이 경고등만 바뀐 노드는 유효 스키마 변경 통지로 배달되고, 게이트가 좁혀 쓰기 없이 켜진 `SCHEMA_FORM_WARNING.TYPE_MISMATCH` 경고의 `source`는 `'gate'`이며, 기록의 `expected.effective`는 그 커밋의 유효 목록이고, 기본 입력은 유효 목록이 바뀌면 초안을 다시 판정한다(BLUEPRINT-041, SURFACE-061). 이 답은 앞선 소유자 결정의 읽기 "`then`·`allOf` 좁힘은 검증 전용"(2026-09-26, 원장 미기재)을 대체한다: 정적 좁힘은 교집합으로 종류를 정하고(U3), 게이트 좁힘은 유효 목록을 좁힌다(U4)(BLUEPRINT-041).

【추론】 쓰기 경계에서는 그 노드의 정적 목록(`schemaType`, `nullable`)으로 한 번 해석한다(BLUEPRINT-041). 【추론】 이 목록은 게이트와 무관하므로 직전 상태에 기대지 않는다(BLUEPRINT-041). 【추론】 전이 단계에서는 이 진입에서 쓰인 노드마다, 최종 유효 목록이 정적 목록보다 좁으면 원래 쓰인 값(쓰기 경계에서 바뀐 값이 아니라 호출자·입력이 준 값)을 최종 유효 목록으로 다시 해석해 그 결과를 원본으로 삼는다(BLUEPRINT-041). 【추론】 그래서 결과는 "쓰인 값을 최종 유효 목록으로 한 번 해석한 것"과 같고, 직전 커밋의 게이트 상태에 기대지 않는다(BLUEPRINT-041). 【추론】 로드(마운트, `FormHandle.reset()`, `resetSubtree()`)도 같은 두 단계를 따른다(BLUEPRINT-041). 게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`다(BLUEPRINT-041, SURFACE-061). 【추론】 전이 단계의 재해석은 전이 쓰기다(BLUEPRINT-041, WRITE-099). U7의 "한 번 더"는 라운드마다이며, 한 노드는 한 라운드에 한 번만 다시 해석하고 상한을 넘기면 원본 B에는 쓰기 경계의 해석(정적 목록)만 남는다(BLUEPRINT-041, WRITE-099).

### 01-schema-to-blueprint.md §2.8 청사진 판정 절차와 사례

【추론】 선언 d의 허용 집합 A(d)는 `'null'`을 포함해 d가 받는 형의 집합이다(BLUEPRINT-044). 【추론】 A(d)의 기본은 d 자신의 `type`(문자열이나 배열)의 원소이고, `nullable: true`는 같은 객체에 `type`이 있을 때만 `'null'`을 더하며, `'null'`만 받는 분기는 `{null}`이다(BLUEPRINT-044). 【추론】 `type`이 없는 선언은 A = ⊤이며 어느 종류와도 맞는다(BLUEPRINT-044). 【추론】 형 없는 칸의 분기 b는 정적 연언에 `type`이 없고 분기가 있으면 A(b)가 b에 S3를 재귀 적용한 U이며, `type`도 분기도 없을 때만 ⊤이다(BLUEPRINT-044, BLUEPRINT-048, BLUEPRINT-050). 【추론】 ⊤가 아닌 A가 빈 집합이면 종류가 없고, 그 A를 만든 단계가 오류를 정한다(BLUEPRINT-044). 【추론】 A = `{null}`이면 null 종류이고 `nullable: true`이다(BLUEPRINT-044). 【추론】 그 밖에는 F = fold(A \ {null})로 정하며(fold는 `'integer'`를 `'number'`로 바꾼다), |F| = 1이면 그 종류, |F| ≥ 2이면 `union`이다(BLUEPRINT-044, BLUEPRINT-035). 【추론】 nullable은 `'null'` ∈ A와 같다(BLUEPRINT-044). 【추론】 두 선언은 fold가 같을 때 같은 종류이며, 구현은 7비트 마스크 비교 한 번이다(BLUEPRINT-044). 【추론】 두 허용 집합의 교집합은 원소마다 취한다: `integer ⊂ number`이므로 `number` ∩ `integer` = `integer`이고, `'null'`은 양쪽에 있을 때만 남으며, 순서는 앞 집합의 순서를 따른다(BLUEPRINT-044).

【추론】 절차는 칸마다 S0부터 번호 순서로 보며, 반드시 하나의 결과로 끝난다(BLUEPRINT-044). 【추론】 S0 문법: 알려지지 않은 형 이름, 빈 배열 `[]`, 배열 안의 중복 원소는 `UNKNOWN_JSON_SCHEMA`이다(BLUEPRINT-044). 【추론】 선언 하나 안의 `['integer','number']`는 `'number'`다(BLUEPRINT-044). 【추론】 S1 정적 연언 C는 칸 본체, 게이트 없는 `allOf` 항목(재귀), 그리고 이것들의 `$ref` 대상이다(BLUEPRINT-044, FRAGMENT-048, SCHEMA-007). 【추론】 `type`을 가진 선언을 전순서로 늘어놓은 첫째를 앵커라 부르며, 앵커는 결과 원소의 순서만 정한다(BLUEPRINT-044). 【추론】 S2(C에 `type`을 가진 선언이 있는 칸)는 BLUEPRINT-041의 U1–U3을 따르며, `type`이 없는 선언(A = ⊤)은 교집합에 관여하지 않는다(BLUEPRINT-044, BLUEPRINT-041). 【추론】 S2에서 교집합이 빈 집합이면 `ALL_OF_TYPE_REDEFINITION`이다(BLUEPRINT-044). 【추론】 S3(C에 `type`이 없는 칸)은 BLUEPRINT-051·BLUEPRINT-038·BLUEPRINT-049·BLUEPRINT-048·BLUEPRINT-050을 따른다(BLUEPRINT-044, BLUEPRINT-051, BLUEPRINT-038, BLUEPRINT-049, BLUEPRINT-048, BLUEPRINT-050). 【추론】 S4: 칸의 종류가 원시나 `union`이면 게이트 없는 `oneOf`·`anyOf` 분기의 `type`은 검증 전용이며, 목록 밖 분기와 null 분기도 오류가 아니다(BLUEPRINT-044, BLUEPRINT-035). 【추론】 형 있는 칸의 null 분기는 nullable을 켜지 않고, 유효 목록을 좁히지 않는다(BLUEPRINT-044). 【추론】 칸이 object·array이면 기존 variant 규칙을 따른다(BLUEPRINT-044).

【추론】 S5: 같은 이름의 선언이 여러 조각에 있으면, 정적 선언(호스트 본체, 호스트의 게이트 없는 `allOf`, `$ref`)은 모두 그 칸의 C가 되어 노드 하나를 정한다(BLUEPRINT-044, BLUEPRINT-010). 【추론】 켜진 게이트 선언과 정적 허용 집합의 교집합(`'null'` 포함)이 빈 경우(BLUEPRINT-041의 U2)는 그 게이트들이 켜진 동안 `SHARED_NODE_CONFLICT`(정착 오류, 기존 처리)로 드러난다(BLUEPRINT-044, BLUEPRINT-041). 【추론】 호스트의 게이트 없는 분기의 `type`은 "또는" 문맥이라 존재만 더하고 교차하지 않는다(BLUEPRINT-044, SCHEMA-008, SCHEMA-044). 【추론】 그 분기의 fold가 정적 노드의 fold에 들면 검증 전용이며 목록·nullable·유효 목록을 바꾸지 않고, 그 밖에는 `SHARED_NODE_KIND_CONFLICT`이다(BLUEPRINT-044). 【추론】 정적 선언이 하나도 없는 이름은 fold가 같은 선언끼리 노드 하나를 둔다(BLUEPRINT-044). 【추론】 그 노드의 목록은 선언들 허용 집합의 합집합을 종류 규칙으로 나눈 것이며, `integer`는 모든 선언이 `integer`일 때만 남고, nullable은 OR이며, `{null}`이면 null 종류다(BLUEPRINT-044). 【추론】 그 목록의 순서는 전순서의 첫 선언을 앵커로 하고, 앵커에 없는 원소는 처음 나온 순서대로 뒤에 붙인다(BLUEPRINT-044). 【추론】 fold가 다른 게이트 선언이 동시에 켜지면 `SHARED_NODE_CONFLICT`이고, 배타이면 종류별 노드이며(BLUEPRINT-011·012 그대로), 각 노드 안에서는 켜진 선언이 유효 목록을 좁힌다(BLUEPRINT-044, BLUEPRINT-011, BLUEPRINT-012). 【추론】 정적 선언이 없는 이름에서 게이트 없는 분기끼리 fold가 다르면 게이트 없는 선언끼리의 다른 종류이므로 `SHARED_NODE_KIND_CONFLICT` 청사진 오류다(BLUEPRINT-012, 소유자 O-10)(BLUEPRINT-044, WRITE-099).

【추론】 S6: 종류가 object·array인 칸은 nullable을 포함해(`['object','null']`) 오늘 순서 `options.terminal` → 판정 → `type`을 따른다(BLUEPRINT-044, NODE-028, NODE-042). 【추론】 전략이 `terminal`인 모든 노드의 인라인 하위 스키마(깊이 1 이상, `$ref`는 따라가지 않음)에 예약 층 키 `controls`·`options`·`presentation`이 나오면, 청사진이 경고 `(가칭) SCHEMA_FORM_WARNING.TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`을 낸다(BLUEPRINT-044). 【추론】 그 기록은 `{ schemaPath, keys, paths }`이고, `(code, schemaPath)`로 트리마다 한 번 낸다(BLUEPRINT-044). 【추론】 그 경고는 개발 모드 콘솔과 커밋된 로드의 준비 이펙트로 드러나며(ERROR-164 `NULL_BRANCH_IGNORED_FOR_FORM` 행과 같은 드러남), 핸들러가 없는 프로덕션에서는 검사하지 않는다(BLUEPRINT-044, ERROR-164). 【추론】 union 칸 인라인 하위 스키마의 `presentation.FormTypeInput`은 그릴 자리가 없으므로 이 경고의 대상이다(BLUEPRINT-044, BLUEPRINT-035). 【추론】 결과는 일곱 가지다: 원시 잎(+nullable), null 잎, 원시만의 `union` 잎, 터미널 강제 `union` 잎, object·array 노드(branch 또는 terminal, +nullable), variant 호스트, 청사진 오류(BLUEPRINT-044, BLUEPRINT-035).

PR: PR-1(청사진 판정)·PR-4(ajv8 설정)(BLUEPRINT-044). 무엇: `src/core/blueprint/__tests__/`의 `union.kind-procedure.test.ts`(E1–E42), `union.null-only.test.ts`, `union.static-intersection.test.ts`, `union.schema-type-invariant.test.ts`, `union.gated-narrowing.test.ts`, `union.terminal-subtree-warning.test.ts`와 `schema-form-ajv8-plugin/src/**/__tests__/union-types.test.ts`를 돌린다(BLUEPRINT-044). 통과: 예마다 종류·`schemaType`·nullable·전략·오류가 위대로이고, `allOf` 항목의 순서를 바꿔도 결과(원소 순서 제외)가 같으며, ajv8 컴파일에서 `console.warn`이 0회다(BLUEPRINT-044). 실패: 예와 다르면 절차를 고치고, 절차가 예를 하나로 정하지 못하면 이 블록을 고친다(BLUEPRINT-044).

【추론】 예(종류 / `schemaType` / nullable / 전략 / 오류)는 아래 E1–E42와 같다(BLUEPRINT-045).
- 【추론】 E1: `{type:['string','number']}`는 union / `['string','number']` / false / terminal(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E2: `{type:['number','string','null']}`는 union / `['number','string']` / true / terminal(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E3: `{type:['string','number'], nullable:true}`는 union / `['string','number']` / true / terminal(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E4: `{type:['integer','number']}`는 number / `'number'` / false / terminal(BLUEPRINT-045).
- 【추론】 E5: `{type:['integer','string']}`는 union / `['integer','string']` / false / terminal(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E6: `{type:['integer','null']}`는 number / `'integer'` / true / terminal(BLUEPRINT-045).
- 【추론】 E7: `{type:['object','string'], properties:{…}}`는 union / `['object','string']` / false / terminal(강제)(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E8: `{type:['object','null']}`는 object / `'object'` / true / NODE-028 순서(BLUEPRINT-045).
- 【추론】 E9: `{type:['null']}`는 null / `'null'` / true / terminal(BLUEPRINT-045).
- 【추론】 E10: `{type:['null','null']}`, `{type:[]}`, `{type:['string','foo']}`는 `UNKNOWN_JSON_SCHEMA`(BLUEPRINT-045).
- 【추론】 E11: `{anyOf:[{type:'string'},{type:'number'}]}`는 union / `['string','number']` / false / terminal(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E12: `{anyOf:[{type:'integer'},{type:'string',minLength:1},{type:'null'}]}`는 union / `['integer','string']` / true / terminal(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E13: `{anyOf:[{type:'string'},{type:'null'}]}`는 string / `'string'` / true / terminal(BLUEPRINT-045).
- 【추론】 E14: `{anyOf:[{const:'a'},{type:'number'}]}`는 `UNKNOWN_JSON_SCHEMA`(BLUEPRINT-045, BLUEPRINT-038).
- 【추론】 E15: `{anyOf:[{type:'object'},{type:'string'}]}`는 `UNKNOWN_JSON_SCHEMA`(BLUEPRINT-045, BLUEPRINT-048).
- 【추론】 E16: 자기 형 없는 `{oneOf:[{type:'object',…},{type:'object',…}]}`는 object / `'object'` / false / NODE-028 순서(variant 호스트)(BLUEPRINT-045, BLUEPRINT-048).
- 【추론】 E17: `{oneOf:[{type:'string'},{type:'number'}], anyOf:[{type:'number'},{type:'boolean'}]}`는 number / `'number'` / false / terminal(BLUEPRINT-045).
- 【추론】 E18: `{type:['string','number'], allOf:[{type:'string'}]}`는 string / `'string'` / false / terminal(BLUEPRINT-045).
- 【추론】 E19: `{type:['number','string'], allOf:[{type:['integer','string']}]}`는 union / `['integer','string']` / false / terminal(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E20: `{type:'number', allOf:[{type:'integer'}]}`는 number / `'integer'` / false / terminal(BLUEPRINT-045).
- 【추론】 E21: `{type:['string','null'], allOf:[{type:'string'}]}`는 string / `'string'` / false / terminal(BLUEPRINT-045).
- 【추론】 E22: `{type:'string', anyOf:[{type:'null'},{minLength:1}]}`는 string / `'string'` / false / terminal(BLUEPRINT-045).
- 【추론】 E23: `{type:'string', allOf:[{type:'number'}]}`는 `ALL_OF_TYPE_REDEFINITION`(교집합이 빈 집합)(BLUEPRINT-045).
- 【추론】 E24: `{type:'number', allOf:[{type:['number','string']}]}`는 number / `'number'` / false / terminal(오늘은 오류)(BLUEPRINT-045).
- 【추론】 E25: 본체 `a:{type:['string','number']}` + `if/then a:{type:'number'}`는 union / `['string','number']` / false / terminal이고, 켜진 동안 유효 목록은 `['number']`다(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E26: 본체 `a:{type:'number'}` + `if/then a:{type:['number','string']}`는 number / `'number'` / false / terminal이고, 켜진 동안 유효 목록은 `schemaType`과 같은 `'number'`다(BLUEPRINT-045, WRITE-099).
- 【추론】 E27: 본체 없이 `then a:['string','number']` / `else a:'number'`는 배타인 두 노드(union과 number)다(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E28: `{type:['string','number'], options:{terminal:false}}`는 `TERMINAL_OPTION_UNSUPPORTED`(BLUEPRINT-045).
- 【추론】 E29: `{nullable:true, anyOf:[{type:'string'},{type:'number'}]}`는 union / `['string','number']` / false / terminal(형 없는 `nullable`은 효과 없음)(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E30: `{type:['string','null'], allOf:[{type:['number','null']}]}`는 null / `'null'` / true / terminal(교집합 `{null}`)(BLUEPRINT-045).
- 【추론】 E31: `{type:['string','number'], allOf:[{type:['string','boolean']}]}`는 string / `'string'` / false / terminal(BLUEPRINT-045).
- 【추론】 E32: `{anyOf:[{type:'null'}]}`는 null / `'null'` / true / terminal(BLUEPRINT-045).
- 【추론】 E33: `{oneOf:[{type:'null'}], anyOf:[{type:'null'}]}`는 null / `'null'` / true / terminal(BLUEPRINT-045).
- 【추론】 E34: `{anyOf:[{type:['string','null']},{type:'number'}]}`는 union / `['string','number']` / true / terminal(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E35: `{anyOf:[{type:'string',nullable:true},{type:'number'}]}`는 union / `['string','number']` / true / terminal(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E36: `{type:'integer', allOf:[{type:'number'}]}`는 number / `'integer'` / false / terminal(오늘과 같음)(BLUEPRINT-045).
- 【추론】 E37: `{type:'string', allOf:[{type:['string','null']}]}`는 string / `'string'` / false / terminal(오늘과 같음)(BLUEPRINT-045).
- 【추론】 E38: `{type:['string','number','null'], allOf:[{type:['string','boolean','null']}]}`는 string / `'string'` / true / terminal(BLUEPRINT-045).
- 【추론】 E39: `{allOf:[{type:['string']},{type:['string','number']}]}`와 그 순서를 뒤집은 것은 둘 다 string / `'string'` / false / terminal(BLUEPRINT-045).
- 【추론】 E40: 본체 `a:['string','number','boolean']` + `then1 a:'string'` + `then2 a:'boolean'`은 union / `['string','number','boolean']` / false / terminal이고, 둘 다 켜지면 `SHARED_NODE_CONFLICT`다(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E41: 본체 `a:{type:'number'}` + `if/then a:{type:'integer'}`는 number / `'number'` / false / terminal이고, 켜진 동안 유효 목록은 `['integer']`(정수 규칙)다(BLUEPRINT-045).
- 【추론】 E42: 본체 `a:['string','number']` + 호스트의 게이트 없는 `oneOf` 분기 `a:{type:'string'}`는 union / `['string','number']` / false / terminal이고, 분기는 유효 목록을 좁히지 않는다(BLUEPRINT-045, BLUEPRINT-035).

### 02-node-and-value.md §3.11 union 행의 해석과 쓰기 경계

【추론】 청사진은 union 칸마다 기본 spec `UnionSpec { kinds, mask, nullable }`을 한 번 만들어 얼리며, `kinds`는 그 칸의 `schemaType`과 같은 참조다(WRITE-093). 【추론】 유효 목록이 좁혀진 노드는 `{ kinds: 유효 목록, mask, nullable }`을 그 노드의 유효 스키마 메모 항목에 함께 둔다(WRITE-093). 【추론】 `interpret`는 노드의 현재 spec을 받으며, 좁히지 않은 노드의 현재 spec은 기본 spec 그 자체다(WRITE-093).

【추론】 노드의 유효 목록(BLUEPRINT-041의 통합 원리 U4·U5)은 노드마다 계산하고, 유효 스키마 메모가 바뀔 때만 다시 계산한다(WRITE-093). 【추론】 좁히는 게이트가 없으면 유효 목록은 `schemaType`과 같은 얼린 참조를 공유하며, 이것이 흔한 경우이고 비용은 0이다(WRITE-093). 【추론】 교집합에 `'null'`만 남으면(노드가 nullable이고 게이트가 `{null}`만 허용) 유효 목록은 빈 목록이고, null이 아닌 모든 값에 경고등이 켜지며, 기본 입력은 빈 읽기 전용이다(WRITE-093).

【추론】 `isMember(value, kind)`는 JSON Schema의 뜻을 따른다(WRITE-093).

- 【추론】 `isMember(v, 'string')`은 `typeof v === 'string'`이다(WRITE-093).
- 【추론】 `isMember(v, 'number')`는 `typeof v === 'number' && Number.isFinite(v)`이다(WRITE-093).
- 【추론】 `isMember(v, 'integer')`는 `Number.isInteger(v)`이며 안전한 정수 범위는 보지 않는다(ajv와 같음)(WRITE-093).
- 【추론】 `isMember(v, 'boolean')`은 `typeof v === 'boolean'`이다(WRITE-093).
- 【추론】 `isMember(v, 'object')`는 `typeof v === 'object' && v !== null && !Array.isArray(v)`이며 프로토타입은 보지 않는다(WRITE-093).
- 【추론】 `isMember(v, 'array')`는 `Array.isArray(v)`이다(WRITE-093).
- 【추론】 `null`은 목록이 아니라 `nullable`로만 보며, `v === null`이다(WRITE-093).

【추론】 `convert(value, kind)`는 WRITE-075를 옮긴 것이며, 이미 그 형인 값에는 부르지 않는다(WRITE-093).

- 【추론】 `convert(·, 'number')`는 앞뒤 공백을 뺀 전체가 JSON 수 표기이고 결과가 유한한 문자열을 `Number(t)`로 바꾸며, 소수부·지수부 없는 표기는 안전한 정수여야 하고, 불리언, `"01"`, `"1e400"`, `"9007199254740993"`은 받지 않는다(WRITE-093).
- 【추론】 `convert(·, 'integer')`는 `number` 변환이 되고 결과가 `Number.isSafeInteger`인 문자열을 바꾸며(`"1.0"`→`1`, `"1e2"`→`100`), 이미 수인 값(자르지 않음), `"1.5"`, `"1e16"`은 받지 않는다(WRITE-093).
- 【추론】 `convert(·, 'string')`은 유한한 수를 `String(n)`으로(`-0`→`"0"`), 불리언을 `"true"`·`"false"`로 바꾸며, `NaN`·`±Infinity`, `null`, 객체, 배열은 받지 않는다(WRITE-093).
- 【추론】 `convert(·, 'boolean')`은 정확히 `"true"`·`"false"`와 수 `1`→`true`, `0`·`-0`→`false`를 바꾸며, `" true"`, `"1"`, 그 밖의 수는 받지 않는다(WRITE-093).
- 【추론】 `convert(·, 'object')`와 `convert(·, 'array')`는 아무것도 받지 않는다(WRITE-093, BLUEPRINT-036).

【추론】 `interpret(value, spec)`는 `undefined`이면 `undefined`, `null`이면 `null`(VALUE-033), 멤버이면 참조 그대로를 돌려준다(WRITE-093). 【추론】 그 밖에는 목록의 형마다 `convert`를 해서 성공한 결과를 `===`로 중복 없이 세고, 결과가 정확히 하나면 그 값을, 아니면 `value`를 돌려준다(WRITE-093, BLUEPRINT-042). 【추론】 `interpret`는 순수하고, 던지지 않으며, 멱등이고, 바꾸지 못하면 항등이다(WRITE-093, WRITE-084). 【추론】 후보는 배열에 모으지 않고 개수와 첫 결과만 세며, 할당 없이 구현한다(WRITE-093).

【추론】 원소가 하나인 목록은 단일 노드의 행과 같다: `['integer','number']`는 number 규칙을 따른다(WRITE-093). 【추론】 `['integer','number','boolean']`의 `"2"`는 결과가 둘이지만 같은 값이므로 `2`다(WRITE-093). 【추론】 둘 이상의 형이 받아 주는 경우는 정확히 목록 ⊇ {string, boolean}, 목록 ∩ {number, integer} = ∅, 값 ∈ {0, -0, 1}일 때이며, `object`·`array`가 있고 없음에 따라 4종 × 값 3개로 12건이다(WRITE-093). 【추론】 그 증명: 문자열은 `number`·`integer`(같은 결과)와 `boolean`(`"true"`·`"false"`, 수 표기가 아님)이 받아 둘이 겹치지 않고, 불리언은 `string` 하나만 받으며, 비유한 수·`null`·객체·배열·그 밖의 값은 아무 형도 받지 않고, 유한한 수는 `string`(늘)과 `boolean`(`0`·`-0`·`1`)이 받는다(WRITE-093). 【추론】 전수 실행(`reviews/raw-round18-union-swarm/d-rule-a.mjs`, 목록 127개 × nullable 2 × 값 40종 × 모든 순열)에서 경우는 12건이고 순서 위반과 멱등 위반은 0이므로, 규칙 A는 선언 순서와 무관하다(WRITE-093).

【추론】 `interpret`는 노드에 드는 모든 쓰기의 경계에서 한 번 돈다(WRITE-093, WRITE-056). 【추론】 그 쓰기는 입력 쓰기(옵션 없음·`Merge`·`Overwrite`, WRITE-091), `setValue(V)`와 로드(마운트·`reset()`·`resetSubtree()`, WRITE-090), 조상 쓰기가 나눠 준 값(WRITE-018, WRITE-082), 채움(WRITE-090), `controls.derived`(WRITE-011), union 노드 자체를 대상으로 한 `controls.injectTo`(WRITE-012), `unsetValue`와 나감의 비움, 포커스 아웃 `trim`(WRITE-083)이다(WRITE-093).

【추론】 한 진입에서 쓰인 값의 두 번 해석(BLUEPRINT-041의 통합 원리 U7)에서, 쓰기 경계에서는 게이트와 무관한 정적 목록(`schemaType`, `nullable`)으로 해석하며, 로드(마운트, `FormHandle.reset()`, `resetSubtree()`)도 같다(WRITE-093, WRITE-098). 【추론】 둘째 해석은 그 진입의 전이 단계에서 커밋 전에 하며, 전이 단계에서는 최종 유효 목록이 정적 목록보다 좁은 노드만, 첫째 해석의 결과가 아니라 원래 쓰인 값을 최종 유효 목록으로 다시 해석해 원본으로 삼는다(WRITE-093, WRITE-098). 【추론】 그래서 `setValue({kind:'num', a:'42'})`는 직전 상태와 상관없이 `a = 42`이다(WRITE-093).

【추론】 union 노드에 대한 `Merge` 쓰기는 늘 값 전체를 바꾼다: union은 객체 호스트가 아니다(WRITE-093, WRITE-079). 【추론】 union 값 안(`/slot/key`)을 가리키는 `controls.injectTo` 대상은 동적 대상 없음 `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING`이다(WRITE-093, CONTROLS-079). 【추론】 어긋난 값을 로드하면 바꾸지 않고 그대로 들고, 경고등을 켜며, 받은 그대로 방출한다(WRITE-093, WRITE-054, VALUE-033). 【추론】 `trim`은 union 행의 `finishInput`이 맡으며, 현재 값이 문자열이면 자르고 그 결과를 `interpret`에 넘기고, 문자열이 아니면 아무것도 하지 않으며, 경고는 없다(WRITE-093, CONTROLS-006). 반영 칸(설계서 메모 4): "게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`."(WRITE-093, SURFACE-061)

- PR: PR-2(행·`interpret`·경고등·두 번 해석·방출)·PR-4(검증 에러의 귀속과 경고 코드 확정)(WRITE-093).
- 무엇: `src/core/behaviors/utils/parse/__tests__/interpret.table.test.ts`·`interpret.properties.test.ts`, `src/core/behaviors/unionBehavior/__tests__/union.write-paths.test.ts`·`union.mismatch-light.test.ts`, 렌더 시나리오 `union.gated-effective-list`·`union.entry-two-step`·`union.rule-a`·`union.ambiguous`·`union.integer`·`union.object-array`·`union.non-json-value`·`union.omit-empty`·`union.default-fill`·`union.expressions`를 돌린다(WRITE-093).
- 통과: 변환 표의 모든 칸, 전수 실행의 12건·순서 무관·멱등·쓰기당 할당 0, 쓰기 경로마다의 사례, 경고등의 켜짐·재발송 규칙과 기록 칸이 위대로다(WRITE-093).
- 실패: 전수 실행에서 12건 밖의 경우나 순서 위반이 나오면 `convert` 표를 고치고, 규칙이 사례를 하나로 정하지 못하면 이 블록을 고친다(WRITE-093).

【추론】 쓰기 경계에서는 그 노드의 정적 목록(`schemaType`, `nullable`)으로 한 번 해석한다(WRITE-098). 【추론】 이 목록은 게이트와 무관하므로 직전 상태에 기대지 않는다(WRITE-098). 【추론】 전이 단계에서는 이 진입에서 쓰인 노드마다, 최종 유효 목록이 정적 목록보다 좁으면 원래 쓰인 값(쓰기 경계에서 바뀐 값이 아니라 호출자·입력이 준 값)을 최종 유효 목록으로 다시 해석해 그 결과를 원본으로 삼는다(WRITE-098). 【추론】 그래서 결과는 "쓰인 값을 최종 유효 목록으로 한 번 해석한 것"과 같고, 직전 커밋의 게이트 상태에 기대지 않는다(WRITE-098).

【추론】 예: 본체 `a:{type:['string','boolean']}`에 `kind`가 `'text'`면 `a`를 `string`으로, `'flag'`면 `boolean`으로 좁히는 게이트가 있을 때, `setValue({kind:'flag', a:0})`는 직전 `kind`가 무엇이든 `a = false`다(WRITE-098). 【추론】 이 진입에서 쓰이지 않은 노드는 다시 해석하지 않는다(소급 변환 없음)(WRITE-098). 【추론】 로드(마운트, `FormHandle.reset()`, `resetSubtree()`)도 같은 두 단계를 따른다(WRITE-098). 【추론】 비용: 쓰인 노드 가운데 유효 목록이 정적 목록보다 좁은 노드에 한해 `interpret` 한 번과 쓰인 값의 참조 보관이다(WRITE-098). 【추론】 WRITE-093의 "첫째 해석의 목록은 직전 커밋의 유효 목록"과 "둘째 해석은 … 목록이 바뀐 노드에서만 결과를 바꾼다(`interpret`가 멱등)"는 이 블록이 대체하며, WRITE-093의 `setValue({kind:'num', a:'42'})` 예는 이 규칙에서도 `a = 42`다(WRITE-098).

【추론】 노드의 유효 목록은 `schemaType` ∩ (켜진 게이트 선언의 허용 집합)을 원소마다의 교집합(BLUEPRINT-044)으로 계산하고 `'null'`을 뗀 것이며, 이는 유효 스키마 `type`의 병합 결과와 같다(BLUEPRINT-041의 통합 원리 U4·U5, BLUEPRINT-021, WRITE-098). 【추론】 이 정의는 모든 종류에 같으며, 원소가 하나인 목록은 단일 노드의 경우이고, number 노드에 게이트 `integer`가 켜지면 정수 규칙을 따른다(WRITE-098).

- PR: PR-2(두 번 해석)(WRITE-098).
- 무엇: 렌더 시나리오 `union.entry-two-step`에 위 예의 폼을 더해, 직전 `kind`가 `'text'`일 때와 `'flag'`일 때 각각 `setValue({kind:'flag', a:0})`를 부르고, `defaultValue`가 `{kind:'flag', a:0}`인 마운트와, `kind`를 `'text'`로 바꾼 뒤 두 필드를 담은 객체 노드의 `resetSubtree()`를 돌린다(WRITE-098).
- 통과: 모든 경우에 `a === false`이고 경고등이 꺼져 있으며, 쓰이지 않은 형제 노드는 다시 해석되지 않는다(WRITE-098).
- 실패: 결과가 직전 상태에 따라 갈리면 두 단계의 목록과 다시 해석하는 값을 고친다(WRITE-098).

【추론】 전이 단계의 재해석은 전이 쓰기다(WRITE-099). 【추론】 그 결과가 원본을 바꾸고 게이트를 뒤집으면 채움·비움과 같은 규칙으로 다음 라운드를 부르며, 라운드 상한(게이트 가진 조각 수 + 노드 게이트 수 + 1, SETTLE-005)은 그대로다(WRITE-099). 【추론】 한 노드는 한 라운드에 한 번만 다시 해석한다(WRITE-099). 【추론】 예: 본체 `a:{type:['string','boolean']}`에 `a`가 수이면 `boolean`으로, 아니면 `string`으로 좁히는 게이트가 있을 때, `setValue({a:0})`는 쓰기 경계에서 `0`(받아 줄 형이 둘이라 그대로)이고, 첫 라운드의 재해석에서 `false`가 되어 게이트가 `string`으로 뒤집히며, 다음 라운드의 재해석에서 `"0"`이 되고 게이트가 더 뒤집히지 않으므로 `a = "0"`이 커밋된다(WRITE-099).

【추론】 상한을 넘기면 SETTLE-011대로 원본 B를 커밋하고, 원본 B에는 쓰기 경계의 해석(정적 목록)만 남는다(WRITE-099). 【추론】 전이 단계의 재해석은 게이트 상태가 최종이 아니므로 원본 B에서 버린다(WRITE-099). 【추론】 원본 B에 남은 값이 좁혀진 유효 목록 밖이면 경고등이 켜진다(WRITE-099). 【추론】 비용: 라운드마다, 유효 목록이 바뀐 쓰인 노드에 한해 `interpret` 한 번이다(WRITE-099).

【추론】 `VALIDATOR_COMPILE_FAILED`는 폼 수준 기록이다(WRITE-099). 【추론】 그 기록은 폼 수준 로드(마운트, `FormHandle.reset()`)마다 한 번 낸다(WRITE-099). 【추론】 `resetSubtree()`는 그 기록을 다시 내지도 초기화하지도 않으며, 그 기록이 막은 `OnChange` 검증 예약은 다음 폼 수준 로드까지 막힌 채다(WRITE-099). 【추론】 그래서 "한 로드에 한 번"(VALIDATE-048)을 `resetSubtree()`의 하위 트리에 적용한다는 문장은 이 블록이 대체한다(WRITE-099).

【추론】 정적 선언이 없는 이름에서 게이트 없는 분기끼리 fold가 다르면 게이트 없는 선언끼리의 다른 종류이므로 `SHARED_NODE_KIND_CONFLICT` 청사진 오류다(BLUEPRINT-012, 소유자 O-10)(WRITE-099). 【추론】 `node.type`의 값은 여덟(`virtual` 포함)이고, BLUEPRINT-032의 "일곱"은 스키마에서 오는 종류만 센 것이다(WRITE-099). 【추론】 `union` 노드의 입력은 목록의 한 형의 값이나 없음을 보내며, 어떤 형을 보낼지는 입력 구현(UI 플러그인)이 정한다(BLUEPRINT-040의 반영 칸, 목록을 읽는 자리는 BLUEPRINT-040)(WRITE-099). 【추론】 목록 밖 `default`의 경고등·경고는 마운트만이 아니라 노드가 생길 때마다(WRITE-090의 채움 시점) 켜고 보낸다(WRITE-099).

【추론】 구조 연산(`push(v)`·삽입)은 WRITE-085대로 생성 값 `v`를 스냅숏 자리에 넣고, 아이템을 만드는 비구조 쓰기만 `undefined`를 넣는다(WRITE-099). 【추론】 `NON_JSON_WHOLE_VALUE`의 깊이 점검은 VALUE-037대로 개발 모드에서만 돌며, 핸들러가 있어도 프로덕션에서는 돌지 않는다(WRITE-099). 【추론】 좁혀지지 않은 노드의 유효 목록은 `schemaType` 그 값(스칼라면 스칼라, 배열이면 그 배열 참조)이며 "같은 참조"는 이것을 뜻한다(WRITE-099). 【추론】 그래서 E26(BLUEPRINT-045)에서 게이트가 켜진 동안의 유효 목록은 `schemaType`과 같은 `'number'`다(WRITE-099).

- PR: PR-2(전이 라운드)(WRITE-099).
- 무엇: 렌더 시나리오 `union.entry-two-step`에 위 예의 폼과, `a`가 문자열이면 `boolean`으로 아니면 `string`으로 좁히는 폼(되먹임이 멈추지 않는 반례)을 더해 각각 `setValue({a:0})`를 부른다(WRITE-099).
- 통과: 첫 폼은 `a === "0"`이고 경고등이 꺼져 있으며, 둘째 폼은 전이 라운드 상한을 넘겨 원본 B로 `a === 0`을 커밋하고 경고등이 켜지며 `diagnostics.status`가 `'degraded'`다(WRITE-099).
- 실패: 재해석이 라운드를 부르는 규칙이나 원본 B에 남는 값을 고친다(WRITE-099).
- PR: PR-2(스냅숏·유효 목록)(WRITE-099).
- 무엇: 배열에 `push('x')`와 삽입을 한 뒤 새 아이템의 `defaultValue`와 `resetSubtree()`를 보고, E26 폼에서 게이트를 켠 뒤 `a`의 유효 목록을 본다(WRITE-099).
- 통과: 새 아이템의 `defaultValue`는 생성 값이고 `resetSubtree()`가 그 값으로 되돌리며, E26의 유효 목록은 `node.schemaType`과 같은 `'number'`다(WRITE-099).
- 실패: 스냅숏 자리 맞춤이나 유효 목록의 표현을 고친다(WRITE-099).
- `push(v)`와 삽입의 스냅숏 시험은 배열 행을 들여오는 PR-5가 하고, PR-2(스냅숏·유효 목록)의 게이트에는 유효 목록 시험만 남는다(WRITE-099, LANDING-065).
- PR: PR-4(검증 불가 기록)(WRITE-099).
- 무엇: 전체 스키마 컴파일이 실패하는 `OnChange` 폼을 마운트하고 값을 쓴 뒤, 자식의 `resetSubtree()`를 부르고 값을 쓰며, 이어 `FormHandle.reset()`을 부르고 값을 쓴다(WRITE-099).
- 통과: `VALIDATOR_COMPILE_FAILED`는 마운트 뒤와 `FormHandle.reset()` 뒤에 한 번씩 나고, `resetSubtree()` 뒤에는 다시 나지 않으며 그 뒤의 쓰기도 `OnChange` 검증을 예약하지 않는다(WRITE-099).
- 실패: 기록의 단위를 고친다(WRITE-099).
- PR: PR-1(청사진 판정)(WRITE-099).
- 무엇: `union.kind-procedure.test.ts`에 정적 선언 없이 호스트의 게이트 없는 `oneOf` 분기 둘이 같은 이름을 `string`과 `number`로 적은 칸을 더하고, `virtual` 노드를 가진 코퍼스에서 `node.type`의 값을 모으며, `union.type-test.ts`에서 union props의 `onChange` 형을 본다(WRITE-099).
- 통과: 그 칸은 `SHARED_NODE_KIND_CONFLICT` 청사진 오류이고, 모은 값은 모두 여덟 값 가운데 하나이며, union props의 `onChange`는 목록의 형의 값과 없음만 받는다(WRITE-099).
- 실패: 절차나 종류 목록이나 props의 형을 고친다(WRITE-099).

## 설계문서

- `design/01-schema-to-blueprint.md` §2.6 (BLUEPRINT-041)
- `design/01-schema-to-blueprint.md` §2.8 (BLUEPRINT-044)
- `design/02-node-and-value.md` §3.11 (WRITE-098, WRITE-099)
