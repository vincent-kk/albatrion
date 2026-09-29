# ADR 0015 — union 잎

## 상태

| 항목 | 닫은 사람 | 라운드 |
| --- | --- | --- |
| BLUEPRINT-036 | 소유자 답(`reviews/round-18-owner-answers.md:29` union 범위) | 18 |
| BLUEPRINT-038 | 소유자 답(`reviews/round-18-owner-answers.md:32` union O2) | 18 |
| BLUEPRINT-040 | 소유자 답(`reviews/round-18-owner-answers.md:35` union O5) | 18 |
| BLUEPRINT-041 | 소유자 답(`reviews/round-18-owner-answers.md:37` union O7·O8), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-104), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105; U7 재해석은 라운드마다) | 18 |
| BLUEPRINT-042 | 소유자 답(`reviews/round-18-owner-answers.md:24` 18C 검토 1번), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-92) | 18 |
| BLUEPRINT-043 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02), 소유자 답(`reviews/round-18-owner-answers.md:19` 12-9; `integer`·`null` 접기), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-92), 소유자 답(`reviews/round-18-owner-answers.md:29` union 범위; 범위), 소유자 답(`reviews/round-18-owner-answers.md:35` union O5; 목록) | 18 |
| BLUEPRINT-044 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105) | 18 |
| BLUEPRINT-045 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105) | 18 |
| BLUEPRINT-046 | 소유자 답(`reviews/round-18-owner-answers.md:38` 설계서 메모 1) | 18 |
| BLUEPRINT-047 | 소유자 답(`reviews/round-18-owner-answers.md:39` 설계서 메모 2) | 18 |
| BLUEPRINT-048 | 소유자 답(`reviews/round-19-owner-answers.md:7` 형 없는 객체 호스트), 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-01) | 19 |
| BLUEPRINT-049 | 소유자 답(`reviews/round-18-owner-answers.md:33` union O3) | 18 |
| BLUEPRINT-050 | 소유자 답(`reviews/round-19-owner-answers.md:8` `const`만 있는 프로퍼티(X1)), 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-02) | 19 |
| BLUEPRINT-051 | 소유자 답(`reviews/round-18-owner-answers.md:30` union 형 없는 분기) | 18 |
| LANDING-207 | 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-01) | 19 |
| LANDING-208 | 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-02) | 19 |
| NODE-057 | 소유자 답(`reviews/round-18-owner-answers.md:31` union O1), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90) | 18 |
| NODE-058 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-89), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4) | 18 |
| NODE-059 | 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-01·19C-02) | 19 |
| REACT-032 | 소유자 답(`reviews/round-18-owner-answers.md:36` union O6), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4) | 18 |
| REACT-033 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-92), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4) | 18 |
| SURFACE-061 | 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:41` 반영 칸; 시험 파일 이름) | 18 |
| TEST-079 | 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-01·19C-02) | 19 |
| VALUE-037 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4) | 18 |
| WRITE-093 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-104), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4) | 18 |
| WRITE-098 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-104), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105) | 18 |
| WRITE-099 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105), 소유자 답(`reviews/round-18-owner-answers.md:24` 18C 검토 1번; 입력이 보내는 값), 편집자 결정(18라운드, LANDING-065; 배열 스냅숏 시험은 PR-5) | 18 |

## 결정

### 01-schema-to-blueprint.md §2.5 union 노드의 범위와 계약

`type`에 원시·객체·배열 가운데 둘 이상의 종류가 적힌 칸의 터미널 잎의 종류 이름은 `union`으로 확정하고 가칭을 푼다(가드 `isUnionNode`, 동작 모듈 `unionBehavior/`)(BLUEPRINT-035, BLUEPRINT-036). `oneOf`·`anyOf` 분기를 가진 호스트는 variant 호스트라 부르고, 그 분기 하나를 variant라 부른다(합 타입의 업계 용어)(BLUEPRINT-035). 원장의 옛 글에 남은 "union 호스트"는 variant 호스트를 뜻하며, 새 설계 문서는 새 용어를 쓴다(BLUEPRINT-035).

`union`은 `type`에 원시·객체·배열 가운데 둘 이상의 종류가 적힌 칸을 받아들이는 터미널 잎 노드이며, 형을 고르는 UI가 아니다(BLUEPRINT-036). `object`·`array`도 union의 원소가 될 수 있다(BLUEPRINT-036). `union`은 행이 하나인 종류이므로 전략은 `terminal`이며, 렌더 계층의 판정을 묻지 않는다(BLUEPRINT-036). 어느 선언에든 `options.terminal: false`가 있으면 `TERMINAL_OPTION_UNSUPPORTED`(ERROR-200)이고, `true`는 허용하며, 인라인 `FormTypeInput`이 있어도 판정은 바뀌지 않는다(BLUEPRINT-036). `object`·`array`가 든 `union`은 터미널로 강제된다(BLUEPRINT-036). 이 칸의 `properties`·`items`·`prefixItems`는 자식을 만들지 않는 검증 전용이다(BLUEPRINT-036). `find('/slot/key')`는 `null`이다(BLUEPRINT-036, NODE-020). `controls.children`이 이 칸 아래를 가리키면 `CHILDREN_TARGET_NOT_FOUND`이다(BLUEPRINT-036, CONTROLS-073 (2), ERROR-193). `object`·`array`로의 변환은 없다(파싱도 문자열화도 하지 않는다)(BLUEPRINT-036). 식의 경로는 방출 트리를 JSON Pointer로 내려가되 객체의 자기 키와 배열의 색인으로만 내려가므로, 원시 값 아래는 `undefined`이다(BLUEPRINT-036). `omitEmpty`(기본 켜짐)는 union의 현재 값 전체를 보며, `''`, 키가 없는 `{}`, 빈 `[]`은 방출하지 않고 `0`·`false`·`null`은 방출한다(BLUEPRINT-036). 채움 값은 `controls.default` > `default`의 값 전체다(BLUEPRINT-036). 기본 입력은 값이 객체나 배열이면 `JSON.stringify(value)`를 읽기 전용으로 보이고 비우기 단추를 두며, 비우기는 nullable이면 `null`, 아니면 `undefined`를 보낸다(BLUEPRINT-036).

【추론】 `null`은 빼서 nullable 플래그로 두고, `integer`는 `number`로 접는다(BLUEPRINT-043, BLUEPRINT-032). 【추론】 접은 집합의 원소가 둘 이상이면 새 종류 `union`의 노드이고 행은 `terminal` 하나다(`BEHAVIORS.union.terminal`)(BLUEPRINT-043, BLUEPRINT-035). 【추론】 원소가 하나면 그 종류이며 `object`·`array`일 수 있다(`['string','null']`은 nullable string, `['integer','number']`는 number)(BLUEPRINT-043, BLUEPRINT-044, BLUEPRINT-045). 【추론】 (2) 같은 종류: `union` 노드끼리는 접은 집합이 같을 때만 같은 종류다(BLUEPRINT-043). 【추론】 다른 종류의 선언과 같은 이름이면 BLUEPRINT-011·012의 충돌 규칙을 따른다(BLUEPRINT-043, BLUEPRINT-011, BLUEPRINT-012). 【추론】 (3) `interpret`: 값이 `node.schemaType`(+`nullable`), 게이트가 켜진 동안에는 유효 목록의 한 형에 맞으면 그대로 둔다(BLUEPRINT-043, BLUEPRINT-040). 【추론】 정합은 값이 `node.schemaType`(+`nullable`), 게이트가 켜진 동안에는 유효 목록의 한 형이라는 뜻이다(BLUEPRINT-043, BLUEPRINT-040). 【추론】 다른 입력은 작성자가 `formTypeInputMap`이나 인라인 입력으로 고른다(BLUEPRINT-043). 【추론】 (7) PR 배치: 청사진이 `union` 종류를 알아보는 것은 PR-1이다(청사진이 종류를 정한다)(BLUEPRINT-043). 【추론】 `union` 동작 행(`interpret`, `terminal` 전략)은 다른 잎 행과 함께 PR-2다(LANDING-062의 행 목록)(BLUEPRINT-043). 【추론】 종류 모듈 목록에는 `unionBehavior/`가 더해진다(BLUEPRINT-043, BLUEPRINT-035). BLUEPRINT-043의 "`integer`는 `number`로 접는다"는 종류를 정할 때의 접기이고, `schemaType`은 `'integer'`를 보존한다(BLUEPRINT-043, NODE-057). 【추론】 기본 입력은 친 글에 core와 같은 `interpret`를 유효 목록으로 적용하고, 결과가 목록의 한 형일 때만 그 결과를 보낸다(BLUEPRINT-043).

`union` 노드의 목적은 `type`에 적힌 원시·객체·배열 가운데 둘 이상의 종류를 가진 필드를 폼이 받아들이는 것이며, 값의 형을 사용자가 고르게 하는 기능이 아니다(BLUEPRINT-042, BLUEPRINT-036). 형을 고르게 하는 요구는 조건부 스키마(`if`-`then`-`else`, `controls.active`)로 표현한다(BLUEPRINT-042). `union` 노드의 해석은 값이 목록의 한 형이면 그대로 두고, 아니면 변환 목록(WRITE-075)으로 받아 줄 형이 정확히 하나일 때만 그 형으로 바꾸며, 받아 줄 형이 없거나 둘 이상이면 받은 그대로 두고 경고등을 켠다(BLUEPRINT-042, BLUEPRINT-040). 이 해석은 `type`의 선언 순서도 검증기 플러그인의 규칙도 쓰지 않으며, 단일 타입 노드의 변환은 목록이 하나인 경우다(BLUEPRINT-042). 기본 입력 정의(`formTypeDefinitions`, UI 플러그인이 없을 때의 최소 구현)는 문자열 입력을 그대로 쓰고 새 입력을 두지 않으며, 친 글은 위 해석을 거친다(BLUEPRINT-042). 【추론】 코어 기본 정의에 `{type:'union'}` 항목 하나를 더해 정의가 열한 개가 된다(BLUEPRINT-042). 【추론】 그 항목은 `FormTypeInputString`을 감싸 아래의 초안·표시 규칙을 더한 것이며 새 구성 요소가 아니고, 자리는 `FormTypeInputStringDefinition` 바로 앞이다(BLUEPRINT-042).

구현 이름은 PR-1(청사진 fractal)에서 정할 때 풀 네임으로 짓는다(예: `PropertyDeclaration`)(BLUEPRINT-046). 근거 규칙은 이미 있다: 약어 금지·처음 나올 때 풀어 씀(PROCESS-023), 이름은 줄임말이 아닌 풀 네임(SURFACE-023)(BLUEPRINT-046). 구현의 타입 이름은 `SchemaFragment`로 짓는다(개념어 "조각"과 원장의 FRAGMENT 영역 이름은 그대로)(BLUEPRINT-047).

### 01-schema-to-blueprint.md §2.6 허용 집합과 유효 목록

가. 목록은 `node.schemaType`(+`nullable`)에서 읽는다; 유효 목록은 BLUEPRINT-041의 통합 원리 U4다(BLUEPRINT-040, BLUEPRINT-041). 규칙 A·기본 입력·경고등의 기준 목록은 `node.schemaType`과 `node.nullable`이며, 게이트가 켜진 동안에는 모든 종류에서 유효 목록을 쓴다(BLUEPRINT-040). 청사진은 계산한 `schemaType`을 유효 스키마에 써 넣지 않는다(BLUEPRINT-040). `jsonSchema.type`은 켜진 선언의 `type`을 병합표 규칙대로 교집합으로 합친 값이다(BLUEPRINT-040). 그래서 켜진 `then`이 목록을 좁히면 `jsonSchema.type`은 좁아지고, `schemaType`은 그대로다(BLUEPRINT-040). `union` 노드의 입력은 목록의 한 형의 값이나 없음을 보내며, 어떤 형을 보낼지는 입력 구현(UI 플러그인)이 정한다(BLUEPRINT-040, WRITE-099).

통합 원리 U1–U9를 채택한다(BLUEPRINT-041). U1: 한 칸의 `type` 선언들은 연언이고, 허용 집합은 교집합이며(`null` 포함, `integer ⊂ number`), 순서와 무관하다(BLUEPRINT-041). U2: 빈 교집합만이 충돌이며, 정적이면 청사진 오류, 게이트이면 그 게이트들이 켜진 동안의 정착 오류이고, `{null}`은 빈 집합이 아니라 null 노드다(BLUEPRINT-041). U3: 정적 선언(본체·게이트 없는 `allOf`·`$ref`)이 종류·`schemaType`·`nullable`을 청사진에서 정한다(BLUEPRINT-041). U4: 게이트 선언(`then`·`else`, `controls.active` 조각, 게이트 가진 분기)은 종류·`schemaType`·`nullable`·입력 선택을 바꾸지 않고, 켜진 동안 유효 목록만 좁히며, 이는 모든 종류에 적용된다(BLUEPRINT-041). U5: 유효 목록은 노드마다 유효 스키마 메모에서 파생하고, 좁히지 않으면 `schemaType`과 같은 참조이며, 병합표의 `type` 행은 교집합이다(BLUEPRINT-041). U6: 게이트만 바뀌면 값은 다시 해석하지 않고(소급 변환 없음) 경고등만 다시 정한다(BLUEPRINT-041). U7: 한 진입에서 쓰인 노드(입력 쓰기·`setValue`·로드·채움)는 그 진입의 전이 단계에서 최종 유효 목록으로 한 번 더 해석하며, 쓰이지 않은 노드는 다시 해석하지 않는다(BLUEPRINT-041). U8: 호스트의 게이트 없는 분기는 "또는" 문맥이라 유효 목록을 좁히지 않는다(BLUEPRINT-041). U9: 쓰기 없이 경고등만 바뀐 노드는 유효 스키마 변경 통지로 배달되고, 게이트가 좁혀 쓰기 없이 켜진 `SCHEMA_FORM_WARNING.TYPE_MISMATCH` 경고의 `source`는 `'gate'`이며, 기록의 `expected.effective`는 그 커밋의 유효 목록이고, 기본 입력은 유효 목록이 바뀌면 초안을 다시 판정한다(BLUEPRINT-041, SURFACE-061). 이 답은 앞선 소유자 결정의 읽기 "`then`·`allOf` 좁힘은 검증 전용"(2026-09-26, 원장 미기재)을 대체한다: 정적 좁힘은 교집합으로 종류를 정하고(U3), 게이트 좁힘은 유효 목록을 좁힌다(U4)(BLUEPRINT-041).

【추론】 쓰기 경계에서는 그 노드의 정적 목록(`schemaType`, `nullable`)으로 한 번 해석한다(BLUEPRINT-041). 【추론】 이 목록은 게이트와 무관하므로 직전 상태에 기대지 않는다(BLUEPRINT-041). 【추론】 전이 단계에서는 이 진입에서 쓰인 노드마다, 최종 유효 목록이 정적 목록보다 좁으면 원래 쓰인 값(쓰기 경계에서 바뀐 값이 아니라 호출자·입력이 준 값)을 최종 유효 목록으로 다시 해석해 그 결과를 원본으로 삼는다(BLUEPRINT-041). 【추론】 그래서 결과는 "쓰인 값을 최종 유효 목록으로 한 번 해석한 것"과 같고, 직전 커밋의 게이트 상태에 기대지 않는다(BLUEPRINT-041). 【추론】 로드(마운트, `FormHandle.reset()`, `resetSubtree()`)도 같은 두 단계를 따른다(BLUEPRINT-041). 게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`다(BLUEPRINT-041, SURFACE-061). 【추론】 전이 단계의 재해석은 전이 쓰기다(BLUEPRINT-041, WRITE-099). U7의 "한 번 더"는 라운드마다이며, 한 노드는 한 라운드에 한 번만 다시 해석하고 상한을 넘기면 원본 B에는 쓰기 경계의 해석(정적 목록)만 남는다(BLUEPRINT-041, WRITE-099).

### 01-schema-to-blueprint.md §2.7 형을 명시하지 않은 칸

분기 b의 허용 집합 A(b)는 b 자신의 정적 연언에 정적 교집합 규칙을 적용한 결과이며, 거기서 난 오류는 그대로 낸다(BLUEPRINT-051). 한 키워드의 허용 집합 U는 분기 A(b)의 합집합이며 `'null'`을 포함하고, 순서는 분기 순서에서 처음 나온 순서다(BLUEPRINT-051). `oneOf`와 `anyOf`가 함께 있으면 둘은 연언이므로, 두 키워드의 U를 교집합한 것이 U이며(`'null'` 포함) 순서는 `oneOf` 쪽을 따른다(BLUEPRINT-051). `'null'`은 합치고 교집합한 뒤에야 떼어 낸다(BLUEPRINT-051). U가 빈 집합이면 `UNKNOWN_JSON_SCHEMA`이다(BLUEPRINT-051). U가 `{null}`이면 null 종류이고 `nullable: true`이다(BLUEPRINT-051). 그 밖에는 U가 원시 잎이나 `union` 잎을 정하고, 분기의 제약은 검증 전용이다(BLUEPRINT-051, BLUEPRINT-035). 게이트 가진 분기(분기 안의 `controls.active`, `controls.discriminator`로 변환된 분기)는 이 합치기에 넣지 않고 게이트 선언의 규칙을 따른다(BLUEPRINT-051). `nullable: true`는 같은 객체에 `type`이 있을 때만 `'null'`을 더하므로, 형 없는 칸의 `nullable`은 효과가 없다(BLUEPRINT-051).

가. 자기 `type` 없는 칸에서 허용 집합이 ⊤인 분기가 하나라도 있으면(`const`·`enum`만 있는 분기 포함) `UNKNOWN_JSON_SCHEMA`이다(BLUEPRINT-038). 오류에 그 분기의 schemaPath와 "`type`을 적으라"는 안내를 싣는다(BLUEPRINT-038).

자기 `type` 없는 칸의 게이트 없는 `oneOf`·`anyOf` 분기 형을 접은 집합 F가 `{object}`이면 칸은 object 종류이고 `schemaType`은 `'object'`이며, F가 `{array}`이면 array 종류이고 `schemaType`은 `'array'`다(BLUEPRINT-048). 【추론】 S3(정적 연언 C에 `type`이 없는 칸)는 BLUEPRINT-051의 절차 그대로 칸의 게이트 없는 `oneOf`·`anyOf` 분기의 허용 집합 A(b)를 합쳐 키워드마다 U를 만들고(`'null'` 포함), `oneOf`와 `anyOf`가 함께 있으면 두 U를 교집합한 것을 U로 하며, 그 뒤에야 `'null'`을 떼어 F = fold(U \ {null})를 만든다(BLUEPRINT-048, BLUEPRINT-051). 【추론】 게이트 가진 분기(분기 안의 `controls.active`, `controls.discriminator`로 변환된 분기)는 BLUEPRINT-051과 BLUEPRINT-041의 U4대로 U에 넣지 않고 게이트 선언의 규칙을 따르며, 게이트 없는 분기가 없으면 BLUEPRINT-050을 따르고(C에 `const`·`enum`도 없으면 `UNKNOWN_JSON_SCHEMA`), U가 빈 집합이면 `UNKNOWN_JSON_SCHEMA`다(BLUEPRINT-048, BLUEPRINT-050). 【추론】 F가 `{object}`나 `{array}`인 칸의 nullable은 `'null'` ∈ U와 같다(BLUEPRINT-048). 【추론】 F가 `{array}`인 칸에서 분기의 `items`·`prefixItems`는 자기 `type:'array'`를 명시한 호스트와 같은 규칙(게이트 없는 분기끼리 fold가 같으면 노드 하나, 다르면 `SHARED_NODE_KIND_CONFLICT`)을 따른다(BLUEPRINT-048). 【추론】 종류가 정해진 칸은 그 뒤 S4의 variant 규칙과 S6의 순서(`options.terminal` → 판정 → `type`)를 자기 `type`을 명시한 칸과 똑같이 따르되, S6의 `type` 단계는 저자 스키마가 아니라 F가 정한 종류를 읽고, S4의 "형 있는 칸의 null 분기는 nullable을 켜지 않는다"는 이 칸에 적용하지 않는다(BLUEPRINT-048). 【추론】 F의 원소가 둘 이상이고 그 가운데 `object`나 `array`가 있으면 `UNKNOWN_JSON_SCHEMA`다(`object`와 `array`만 섞인 경우 포함, E15는 그대로다)(BLUEPRINT-048). 【추론】 F에 `object`나 `array`가 없으면 BLUEPRINT-051의 원시 접기를 그대로 적용한다(U가 `{null}`이면 null 종류, 그 밖에는 원시 잎이나 `union` 잎)(BLUEPRINT-048, BLUEPRINT-051, BLUEPRINT-035). 【추론】 셈에 드는 게이트 없는 분기 가운데 허용 집합이 ⊤인 분기(`const`·`enum`만 있는 분기 포함)가 있으면 F를 만들기 전에 BLUEPRINT-038대로 그 분기의 schemaPath와 `type`을 적으라는 안내를 담은 `UNKNOWN_JSON_SCHEMA`다(BLUEPRINT-048, BLUEPRINT-038). 【추론】 분기 b의 A(b)는 b의 정적 연언(b 본체, 게이트 없는 `allOf`, `$ref` 대상)에 S2를 적용한 결과이고, b의 정적 연언에 `type`이 없으면 b에 S3를 재귀 적용해 얻은 U(`'null'`을 떼기 전)이며, 재귀에서 난 오류는 그대로 낸다(BLUEPRINT-048). 【추론】 재귀가 지금 펼치는 경로에 이미 있는 스키마 위치(분기 위치나 그 `$ref` 대상)에 다시 닿으면 그 분기는 더 펼치지 않고 U에 아무것도 더하지 않으며(BLUEPRINT-030의 조각 안 순환 절단과 같다), 그 결과 U가 비면 `UNKNOWN_JSON_SCHEMA`다(BLUEPRINT-048, BLUEPRINT-030). 【추론】 이 재귀는 `properties`·`items`·`prefixItems`를 건너지 않으므로 `RECURSIVE_SHAPE_UNBOUNDED`의 판정과 겹치지 않는다(BLUEPRINT-048).

object variant 호스트(분기가 객체 스키마인 `oneOf`·`anyOf`, 깊이와 상관없는 자식 하위 트리 포함)는 이 설계가 건드리지 않는다(BLUEPRINT-049). 이 답은 자기 `type` 없는 칸의 분기가 object·array와 원시를 섞는 경우만 다룬다(BLUEPRINT-049). 그 칸을 받아들이도록 푸는 것은 뒤로 미루며, 나중에 풀어도 파괴적 변화가 아니다(BLUEPRINT-049). `object`와 `array`만 섞인 칸도 `UNKNOWN_JSON_SCHEMA`다(BLUEPRINT-049, BLUEPRINT-048). 접은 집합 F가 `{object}`나 `{array}`인 칸은 variant 호스트로 추정하고, `object`나 `array`가 다른 종류와 섞인 경우만 `UNKNOWN_JSON_SCHEMA`다(BLUEPRINT-049, BLUEPRINT-048).

가. 정적 연언 C에 `type`이 없고 게이트 없는 `oneOf`·`anyOf` 분기도 없는 칸에 C의 `const`나 `enum`이 있으면, 그 리터럴들의 JSON 종류(string·number·boolean·null, 정수 리터럴은 number)를 모아 U를 만들고 BLUEPRINT-051의 접기(`'null'`은 떼어 nullable로)를 적용해 원시 잎이나 null 잎으로 정한다(BLUEPRINT-050, BLUEPRINT-051). `'null'`을 뗀 리터럴의 종류가 둘 이상이거나 리터럴에 객체·배열이 있으면 `UNKNOWN_JSON_SCHEMA`다(BLUEPRINT-050). 이 규칙은 분기가 없는 칸에만 적용되며, 분기 안의 `const`·`enum`만 있는 분기(BLUEPRINT-038, E14)는 그대로 `UNKNOWN_JSON_SCHEMA`다(BLUEPRINT-050, BLUEPRINT-038). 【추론】 그 오류에는 그 칸의 schemaPath와 `type`을 적으라는 안내를 싣는다(BLUEPRINT-050). 【추론】 BLUEPRINT-048의 재귀가 분기 b를 볼 때 b의 정적 연언에 `type`도 분기도 없으면 b의 허용 집합은 BLUEPRINT-038대로 ⊤이다(BLUEPRINT-050, BLUEPRINT-038, BLUEPRINT-048).

【추론】 형 없는 분기(`const`·`enum`만 있는 것 포함)와 객체·원시 혼합 분기는 `never`와 `unknown`이다(NODE-058). 모든 분기가 인라인 객체(또는 배열)인 형 없는 칸은 `ObjectNode`(또는 `ArrayNode`)와 분기 값 형의 합이고, 분기 없는 `const`·`enum` 칸은 리터럴 형이며, 형 없는 분기와 혼합 분기는 그대로다(NODE-058, NODE-059).

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

### 02-node-and-value.md §1.10 union 노드의 필드와 공개 형

가. `node.type`은 `'string'`·`'number'`·`'boolean'`·`'null'`·`'object'`·`'array'`·`'virtual'`·`'union'` 가운데 하나인 단일 문자열이며, 노드가 사는 동안 바뀌지 않는다(NODE-057). `node.nullable`은 이름과 뜻을 그대로 두며, 값은 청사진이 정적 선언만으로 정한다(NODE-057). `node.schemaType`은 이름을 그대로 두고 형을 `JSONSchemaType`과 `UnionSchemaType`의 합으로 넓히며, 새 필드는 더하지 않는다(NODE-057). 저자 원문을 그대로 옮기는 필드는 두지 않는다(NODE-057).

`schemaType`은 저자가 쓴 `type`을 그대로 옮긴 값이 아니라 계산된 허용 형 목록이며, `'null'`은 빠지고 `nullable`이 맡는다(NODE-057). 목록에 `'number'`가 함께 있으면 `'integer'`는 `'number'`에 흡수되고, 종류가 하나 남으면 스칼라이며, 형 없는 `anyOf`에서는 분기에서 계산한다(NODE-057). 【추론】 정적 선언이 하나도 없는 이름은 fold가 같은 선언끼리 노드 하나를 둔다(NODE-057). 【추론】 그 노드의 목록은 선언들 허용 집합의 합집합을 종류 규칙으로 나눈 것이며, `integer`는 모든 선언이 `integer`일 때만 남고, nullable은 OR이며, `{null}`이면 null 종류다(NODE-057).

union이 아닌 노드의 `schemaType`은 오늘과 같은 스칼라이며, number 노드는 `'integer'`를 보존하고 null 노드는 `'null'`이다(NODE-057). union 노드의 `schemaType`은 계산한 목록을 얼린 읽기 전용 배열이다(NODE-057). 그 순서는 앵커 선언에 저자가 쓴 순서이고, `'null'`은 union에서도 빠지며, 중복 원소는 청사진 오류이므로 생기지 않는다(NODE-057). 불변식은 `Array.isArray(node.schemaType) === (node.type === 'union')`이다(NODE-057). `type`·`strategy`·`nullable`·`schemaType`은 노드가 사는 동안 같은 참조이며, `schemaType` 배열은 청사진 칸마다 하나를 얼려 그 칸의 모든 노드(배열 아이템 포함)와 기본 spec이 공유한다(NODE-057). BLUEPRINT-043의 "`integer`는 `number`로 접는다"는 종류를 정할 때의 접기이고, `schemaType`은 `'integer'`를 보존한다(NODE-057).

【추론】 (6) 공개 표면: 공개 가드 `isUnionNode`(`isSchemaNode(x) && x.type === 'union'`)를 더하고, 공개 판별 합집합과 `InferSchemaNode`에 `union` 멤버를 더한다(NODE-041, BLUEPRINT-035). `union`은 `type`에 원시·객체·배열 가운데 둘 이상의 종류가 적힌 칸의 터미널 잎이며, 그 종류 이름은 `union`으로 확정하고 가칭을 푼다(가드 `isUnionNode`, 동작 모듈 `unionBehavior/`)(NODE-041, BLUEPRINT-036). 【추론】 `node.type`은 `'union'`, `node.strategy`는 `'terminal'`이다(NODE-041). 【추론】 그래서 공개 가드는 아홉에서 열이 된다(NODE-041).

【추론】 형 정의는 `UnionMemberType = 'string'|'number'|'integer'|'boolean'|'object'|'array'`와 `UnionSchemaType = readonly [UnionMemberType, UnionMemberType, ...UnionMemberType[]]`이다(원소 범위는 BLUEPRINT-036)(NODE-058). 【추론】 `UnionNode`의 모양은 `type: 'union'`, `strategy: 'terminal'`, `schemaType: UnionSchemaType`, `nullable: boolean`, `children: null`에 공통 멤버를 더한 것이다(NODE-058, NODE-041, SURFACE-058). 【추론】 `UnionNode`는 `typeMismatch`를 판별자로 두 멤버로 나뉜다(NODE-058, SURFACE-061). 확정 이름은 게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`다(NODE-041, NODE-058).

【추론】 `typeMismatch`가 `false`인 멤버의 `value`는 `string | number | boolean | ObjectValue | ArrayValue | undefined`이고, nullable이면 `| null`이 붙는다(NODE-058, SURFACE-061). 【추론】 `typeMismatch`가 `true`인 멤버의 `value`는 `unknown`이다(NODE-058, SURFACE-061). 【추론】 노드 형에는 제네릭을 두지 않으며, 목록 형으로 좁히는 것은 `FormTypeInputProps`가 맡는다(NODE-058).

【추론】 union 노드의 `FormTypeInputProps`에서 `value`와 `onChange`는 일부러 다른 형이다(NODE-058). 【추론】 props의 `value`는 `UnionNode.value`와 같은 판별 모양이다: `typeMismatch === false`이면 목록 종류의 값, `undefined`, (nullable이면) `null`이고, `true`이면 `unknown`이다(NODE-058, SURFACE-061). 【추론】 props의 `onChange`는 목록 종류의 값, `undefined`, 그리고 nullable일 때만 `null`을 받는다(NODE-058).

【추론】 종류별 공개 형은 `schemaType`을 좁힌다: `StringNode`는 `'string'`, `NumberNode`는 `'number'|'integer'`, `BooleanNode`는 `'boolean'`, `NullNode`는 `'null'`, `ObjectNode`는 `'object'`, `ArrayNode`는 `'array'`, `VirtualNode`는 `'virtual'`, `UnionNode`는 `UnionSchemaType`이다(NODE-058, NODE-015, NODE-046). 【추론】 공개 가드 `isUnionNode(x) = isSchemaNode(x) && x.type === 'union'`을 더한다(이름은 NODE-041)(NODE-058). 【추론】 `isTerminalNode(unionNode)`는 참이고 그 반환 형 합집합에 `UnionNode`가 들어가며, `isBranchNode(unionNode)`는 거짓이다(NODE-058, NODE-041). 【추론】 새 설계에서 두 가드는 `strategy`를 본다(NODE-058). 【추론】 "목록에 X가 있는가"를 묻는 공개 가드는 두지 않는다: `isUnionNode(n) && n.schemaType.includes('integer')`로 충분하다(seiri public-contract §1)(NODE-058).

【추론】 `JSONSchemaWithVirtual`에 `UnionSchema`를 더하며, 모양은 `type`이 `UnionMemberType | 'null'`의 읽기 전용 배열인 것과 `type` 없이 `anyOf`·`oneOf`가 필수인 것의 둘이다(NODE-058). 【추론】 `InferSchemaNode`와 `InferValueType`은 BLUEPRINT-044의 런타임 절차를 비추며, 청사진 오류가 되는 모양은 형 수준에서도 무효이고, 형 수준이 판정할 수 없는 모양은 넓은 형으로 둔다(NODE-058).

【추론】 `type` 배열을 접은 집합의 원소가 2개 이상이면 `InferSchemaNode`는 `UnionNode`이고, `InferValueType`은 원소 값 형의 합(nullable이면 `| null`)이다(NODE-058). 【추론】 접은 집합의 원소가 1개이면 그 종류의 노드와 그 형(nullable이면 `| null`)이다(NODE-058). 【추론】 `type` 배열이 `'null'`만이거나 형 없는 칸의 분기가 모두 null 분기이면 `NullNode`와 `null`이다(NODE-058). 【추론】 형 없는 `anyOf`·`oneOf`의 모든 분기가 원시 형을 가지면 분기 형을 모아 위 두 줄과 같이 사상하고, 값 형은 분기 값 형의 합이다(NODE-058).

【추론】 형 없는 분기(`const`·`enum`만 있는 것 포함)와 객체·원시 혼합 분기는 `never`와 `unknown`이다(NODE-058). 모든 분기가 인라인 객체(또는 배열)인 형 없는 칸은 `ObjectNode`(또는 `ArrayNode`)와 분기 값 형의 합이고, 분기 없는 `const`·`enum` 칸은 리터럴 형이며, 형 없는 분기와 혼합 분기는 그대로다(NODE-058, NODE-059). 【추론】 `$ref`, 게이트 가진 분기, `oneOf`와 `anyOf`가 함께 있는 칸, 본체에 붙은 `allOf`는 넓은 `SchemaNode`와 오늘 규칙의 값 형이다(NODE-058).

【추론】 `src/types/value.ts`의 `NormalizeType`을 지우고 winglet의 `InferValueType`에 스키마를 그대로 넘긴다(NODE-058). 【추론】 union 칸에 `enum`이 있으면 `InferValueType`은 목록 종류들의 값 형과 enum 리터럴 형의 교집합이며, 리터럴의 JSON 종류가 목록(+nullable)에 있는 것만 남는다(예: `['number','string']` + `enum:[1,'a',true]`는 `1 | 'a'`)(NODE-058). 【추론】 `InferJSONSchema<Value>`가 분배되지 않게 고쳐, 값의 null이 아닌 범주(string·number·boolean·object·array, 리터럴 합은 한 범주)가 둘 이상이면 `UnionSchema`로 사상한다(NODE-058). 【추론】 그래서 `FormTypeInputProps<string|number>`의 `node`는 `UnionNode`다(NODE-058).

【추론】 유효 목록은 노드마다 유효 스키마 메모가 같은 동안 같은 참조이고, 좁히는 게이트가 없으면 `schemaType`과 같은 참조다(NODE-058). 【추론】 `jsonSchema`는 켜진 덧씌움 집합이 같은 동안 같은 참조다(NODE-058). 【추론】 `value`와 `typeMismatch`는 커밋 사이에 같은 참조이며, 객체·배열 값은 변환하지 않으므로 참조가 그대로이고, 같은 원본이면 방출도 같은 참조다(NODE-058, VALUE-012, VALUE-030, SURFACE-061).

- PR: PR-2(노드 형)·PR-7(공개 수출)(NODE-058).
- 무엇: tsc 전용 `src/types/__tests__/union.type-test.ts`가 위 사상, `InferValueType`·`InferJSONSchema`의 형, union props의 `value`(판별)와 `onChange`(목록 형)를 단언하고, `union.schema-type-invariant.test.ts`가 같은 칸의 노드와 배열 아이템의 `schemaType` 참조가 같고 얼려 있음을 단언한다(NODE-058).
- 통과: 모든 사상이 위대로이고 tsc와 시험이 통과한다(NODE-058).
- 실패: 형 수준이 런타임 절차와 다른 답을 내면 그 모양을 넓은 형으로 두고, 넓혀도 어긋나면 이 블록을 고친다(NODE-058).

【추론】 `InferSchemaNode`·`InferValueType`은 분기가 모두 인라인 객체(또는 배열) 스키마인 형 없는 `oneOf`·`anyOf`를 `ObjectNode`(또는 `ArrayNode`)로 두고, 값 형은 분기 값 형의 합(null 분기가 있으면 `| null`)이다(NODE-059). 【추론】 NODE-058의 "`$ref`, 게이트 가진 분기, `oneOf`와 `anyOf`가 함께 있는 칸, 본체에 붙은 `allOf`는 넓은 `SchemaNode`와 오늘 규칙의 값 형이다"는 그대로다(NODE-059). 【추론】 `InferValueType`은 이 칸을 `const`의 리터럴 형이나 `enum` 원소의 합(null 리터럴이 있으면 `| null`)으로 좁히고, `InferSchemaNode`는 U가 정한 종류의 노드다(NODE-059, BLUEPRINT-050).

### 02-node-and-value.md §2.4 null 계약과 정합 상태(경고등)

`setValue(null)`은 키가 없는 전체 교체이므로 자식 원본이 없음이 된다(VALUE-036). 원본 칸 하나로 족하며 셋째 칸도 특수 장치도 없다 — 2라운드 S7(#338 S4와 "null 아래도 원본 유지"의 충돌)은 이렇게 닫힌다(VALUE-036). 3라운드 E9의 "비객체 V는 자식 raw를 건드리지 않는다"와 E18("비객체 호스트의 자식은 비활성")은 **삭제**한다: 비객체 호스트의 자식은 **존재하고 렌더되며** 빈 상태를 보인다(VALUE-036). 실수로 누른 null의 되돌리기는 입력 컴포넌트의 몫이다(VALUE-036). 【추론】 로드가 아닌 쓰기로 온 `null` 아래 자식은 채움 없이 없음이다(WRITE-090, WRITE-092, VALUE-036). 【추론】 로드로 온 `null` 아래 자식은 로드의 새 수명이라 채움을 받는다(VALUE-036). 【추론】 그래서 VALUE-036의 "빈 상태"는 로드로 온 `null` 아래에서는 채운 상태이고, 로드가 아닌 쓰기로 온 `null` 아래에서는 없음이다(VALUE-036).

【추론】 null 계약은 작업 루프의 단계가 아니라 쓰기 종류로 표현한다(VALUE-032). 【추론】 쓰기 종류는 쓰기마다 진입에서 정해진다(VALUE-032). 【추론】 종류는 입력, 호출자(부분 쓰기·배열 연산), 로드, 자동 쓰기다(VALUE-032). 【추론】 쓰기 종류의 목록(VALUE-032)과 `UpdateValue` 출처 칸의 값(EVENT-060)에 '호출자 전체 교체'(`setValue(V)`)를 더한다(VALUE-032). 【추론】 표시 단계가 재계산 목록과 함께 그 종류를 기록한다(VALUE-032). 【추론】 같은 기록이 두 곳에 쓰인다: WRITE-013의 판정과 `UpdateValue`의 출처 칸(EVENT-060, VALUE-032). 【추론】 비객체 호스트의 원본을 비우는 것은 입력·호출자의 부분 쓰기뿐이고, 그 자식의 투영된 방출이 생길 때만 비운다(VALUE-032). 【추론】 판정이 값의 변화가 아니라 종류를 보므로, 같은 값을 다시 쓴 의도된 쓰기(S6)도 객체를 만든다(VALUE-032). 【추론】 단계만으로는 모자라다(VALUE-032). 【추론】 자동 쓰기인 `trim`은 정착 단계가 아니라 입력 마침 신호로 들어오기 때문이다(WRITE-078, VALUE-032).

【추론】 `controls.injectTo`는 원인과 무관하게 언제나 자동 쓰기이며 조상의 원본을 바꾸지 않는다(VALUE-032). 【추론】 오늘의 S2 규칙은 옮기지 않는다(VALUE-032). 【추론】 그 규칙은 `injectTo`가 원인 쓰기의 출처를 물려받게 해서, 사용자가 일으킨 `injectTo`면 null 조상을 객체로 만든다(VALUE-032). 【추론】 사용자에게 보이는 변화: 사용자가 일으킨 `injectTo`의 값이 null 조상 아래에 그려지지만 방출되지 않는다(VALUE-032). 【추론】 소유자가 뒤집기를 원하면, 12-5의 출처 칸 덕분에 원인의 출처를 물려주는 구현 비용은 작다(VALUE-032, EVENT-060). 【추론】 이 동작 변화는 소유자 통보 목록에 올린다(VALUE-032).

【추론】 (1) 경고등은 VALUE-002의 분류로 '계산' 칸이다(VALUE-030). 【추론】 경고등은 원본과 노드의 현재 spec(게이트가 켜진 동안의 유효 목록)만의 함수이므로 '상태는 `raw`와 `extras` 둘뿐'(P3)을 지킨다(VALUE-030, VALUE-037). 【추론】 소유자가 말한 '상태'는 사용자에게 보이는 뜻이다(VALUE-030). 경고등은 커밋 때 원본이 바뀐 노드와, 같은 정착에서 유효 스키마가 바뀐 노드에서 다시 계산한다(VALUE-030, VALUE-037). 【추론】 켜지는 값은 자기 형이 아니고, 없음도 아니고, nullable 노드의 `null`도 아닌 값이다(VALUE-030). 【추론】 수 노드의 `NaN`·`±Infinity`, 정수 노드의 정수 아닌 수, 잘못된 종류를 든 가지 노드도 켜진다(VALUE-030). 【추론】 가상 노드는 켜지지 않는다(ERROR-195에서 거부한다, VALUE-030).

【추론】 루트 노드가 켜진 노드의 경로 집합을 든다(VALUE-030). 【추론】 쓰기 때 더하고 빼며, 로드마다 다시 만든다(VALUE-030). 【추론】 "로드마다 다시 만든다"(VALUE-030)는 `resetSubtree()`에는 그 하위 트리에만 적용한다(VALUE-030). 소유자 답(설계서 메모 4)으로 이름은 게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`다(VALUE-030, VALUE-037). 【추론】 모든 노드는 getter `typeMismatches: readonly string[]`로 자기 경로 아래의 켜진 경로를 돌려준다(VALUE-030, SURFACE-061). 【추론】 루트에서 읽으면 트리 전체다(VALUE-030). 【추론】 커밋 번호로 메모해 같은 커밋에서는 같은 참조를 돌려준다(VALUE-030). 【추론】 형상에 없는 노드는 넣지 않는다(VALUE-030). 【추론】 새 이벤트는 없다(VALUE-030). 값이나 유효 스키마가 바뀌면 그 통지(`UpdateValue`·`UpdateJsonSchema`)가 알린다(VALUE-030, VALUE-037). 【추론】 `FormHandle`에는 더하지 않는다(VALUE-030).

【추론】 (4) nullable이 아닌 노드의 `null`은 바꾸지 않고 받은 그대로 방출된다(VALUE-033). 【추론】 경고등이 켜지고 경고가 가며, 검증기가 있으면 형 에러로 제출이 막힌다(VALUE-033). 【추론】 이 사용성 변화를 이주 항목(F27 확장, LANDING-125)과 PR-8 문서에 적는다(VALUE-033). 【추론】 해법은 스키마에 nullable을 적는 것이다(VALUE-033). 【추론】 값 규칙은 이미 닫혀 있고 문서화만 남았다(VALUE-033).

【추론】 `typeMismatch = raw !== undefined && !(raw === null && nullable) && !isMemberOfEffectiveList(raw)`이며, 원본과 노드의 현재 spec만의 함수다(VALUE-037, SURFACE-061). 【추론】 경고등은 커밋 때 원본이 바뀐 노드와, 같은 정착에서 유효 스키마가 바뀐 노드에서 다시 계산한다(VALUE-037). 【추론】 경고등은 그 노드의 경로가 루트의 경로 집합에 들어가는 커밋에 켜진다(ERROR-186, VALUE-037). 【추론】 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`는 경고등이 켜질 때마다 한 번 보내고, 켜진 채 다른 어긋난 값이 와도 다시 보내지 않는다(VALUE-037, SURFACE-061). 【추론】 경고등이 꺼졌다 켜지거나, 노드가 형상을 나갔다 들어오거나, 로드로 경로 집합을 다시 만들거나, 게이트가 좁혀 켜지면 다시 보낸다(VALUE-037). 【추론】 쓰기 없이 경고등만 바뀐 노드를 배달하는 통지는 유효 스키마 변경 통지 `UpdateJsonSchema`(가칭, EVENT-064)다(SETTLE-007, EVENT-045, VALUE-037).

【추론】 `SCHEMA_FORM_WARNING.TYPE_MISMATCH` 기록은 `{ level: 'warning', code, path, expected: { schemaType, nullable, effective }, received, reason, candidates?, source }`이다(ERROR-186, EVENT-060, VALUE-037, SURFACE-061). 【추론】 `expected.schemaType`은 `node.schemaType`이고, `expected.effective`는 그 커밋의 유효 목록이다(VALUE-037). 【추론】 `received`는 `'string'|'number'|'integer'|'nonFinite'|'boolean'|'null'|'object'|'array'|'other'` 가운데 하나다(VALUE-037). 【추론】 `reason`은 받아 줄 형이 없으면 `'unconvertible'`, 둘 이상이면 `'ambiguous'`이고, `candidates`는 `'ambiguous'`일 때만 `['string','boolean']`으로 싣는다(VALUE-037). 【추론】 `source`는 EVENT-060의 쓰기 출처 값에 `'gate'`를 더한 것이다(VALUE-037). 【추론】 `typeMismatches`는 켜졌으면 `[path]`, 아니면 공유하는 얼린 빈 배열이며, 커밋 번호로 메모하고 객체·배열 값의 안쪽 경로는 넣지 않는다(VALUE-037, SURFACE-061). 【추론】 `typeMismatch === false`는 값이 이 노드 유효 목록의 형이거나, 없거나, 노드가 nullable일 때 `null`이라는 뜻일 뿐 검증 통과를 뜻하지 않으며, 이 문구를 `FormTypeInputProps`와 게터의 주석에 같이 적는다(SURFACE-052, VALUE-037, SURFACE-061). 【추론】 게이트가 `null`을 빼는 것은 검증 전용이다(VALUE-037).

【추론】 union은 잎이므로 방출이 없을 때의 자리는 VALUE-034 그대로이며, 루트는 `undefined`이고 배열 아이템 자리는 `null`이다(VALUE-037). 【추론】 그래서 `omitEmpty`가 켜진 union 아이템이 `{}`를 들면 `null`이 방출되고, `{}`를 남기려면 작성자가 `omitEmpty: false`를 적는다(VALUE-037). 【추론】 방출은 원본을 참조 그대로 내며, 객체·배열을 복사하지 않는다(VALUE-012, WRITE-013, VALUE-037). 【추론】 터미널 object·array 노드와, 객체·배열을 받는 union이 통째로 든 값의 안쪽은 폼이 정규화하지 않는다(VALUE-037). 【추론】 그 안쪽의 JSON 부정합(`undefined`인 키, 배열 중간의 `undefined`·빈 자리, 비유한 수, `Date`·함수·bigint)은 VALIDATE-007을 어길 수 있다(예: `{type:['object','string'], minProperties:1}`의 `{a: undefined}`는 메모리 판정을 통과하고 직렬화 뒤 판정에서 실패한다, VALUE-037). 【추론】 개발 모드에서는 그런 값의 참조가 바뀐 커밋마다 깊이 점검하고, 부정합이 있으면 `(가칭) SCHEMA_FORM_WARNING.NON_JSON_WHOLE_VALUE`를 내며, 기록은 `{ path, innerPaths }`(앞의 N개)다(VALUE-037). 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 비우므로 `NON_JSON_WHOLE_VALUE`는 폼 수준 로드 사이에 `(code, path)`마다 한 번이고, `setValue(V)`와 `resetSubtree()` 뒤에는 다시 내지 않는다(VALUE-037, ERROR-204). 【추론】 프로덕션에서는 그 점검을 하지 않으며, 이 한계를 문서에 적는다(VALUE-037).

【추론】 채움 값(BLUEPRINT-036)은 노드가 생길 때 원본이 `undefined`인 경우에만 한 번 들어가며, `interpret`(두 번 해석 포함)를 지난다(VALUE-037). 【추론】 그래서 로드된 `{}`는 이미 있는 값이며 `default`로 덮이지 않고, 이는 객체 호스트가 `{}`도 채움을 받는 것(WRITE-082)과 다르다(VALUE-037). 목록 밖 `default`(예: `['string','boolean']`에 `default: 0`)의 경고등·경고는 마운트만이 아니라 노드가 생길 때마다(WRITE-090의 채움 시점) 켜고 보낸다(VALUE-037, WRITE-099). 【추론】 그 경고는 `source: 'fill'`, `reason: 'ambiguous'`로 한 번 보낸다(VALUE-037). 【추론】 `default`의 객체·배열은 복사하지 않고 불변으로 다룬다(WRITE-071, VALUE-037).

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

### 06-react-and-surface.md §1.8 입력 종류 판정과 union 기본 입력

Hint는 `{ type: node.type, schemaType: node.schemaType, nullable: node.nullable, path, required, jsonSchema, format, formType }`이다(REACT-032).
`FormTypeInputProps`의 `type`·`schemaType`·`nullable`은 Hint와 같은 값이고, 여기에 `typeMismatch`가 더해진다(REACT-032, SURFACE-061).
입력은 종류뿐 아니라 스키마 자신의 형도 알 수 있다(REACT-032).
`props.schemaType`은 `'integer'`를 보존한 계산된 허용 형이고, union이면 목록이다(REACT-032).
`props.jsonSchema`는 저자의 선언을 담은 유효 스키마이며, `jsonSchema.type`은 켜진 선언의 교집합이다(REACT-032).
노드, Hint, 입력 props에서 같은 이름은 같은 값이며, 오늘의 이름 함정(`hint.type`이 `node.schemaType`인 것)은 이것으로 사라진다(REACT-032).
시험 객체의 키는 `type`·`schemaType`·`path`·`required`·`nullable`·`format`·`formType`의 일곱이고, 대조 규칙은 오늘과 같다(시험 값이 스칼라면 `===`, 배열이면 "그중 하나")(REACT-032).
`FormTypeTestObject.type`은 `SchemaNodeType`이나 그 배열이며, `'union'`은 들고 `'integer'`는 없다(REACT-032).
`FormTypeTestObject.schemaType`은 `JSONSchemaType`이나 그 배열이며, `'null'`이 들고 배열은 "이 스칼라들 가운데 하나"라는 뜻이다(REACT-032).
union 노드의 배열 `schemaType`은 어떤 객체 시험과도 맞지 않으므로, union은 `{type:'union'}`이나 함수 시험으로 잡는다(REACT-032).
플러그인의 `{type:['number','integer']}` 시험은 `{type:'number'}`로 바꾸고, 정수만이면 `{schemaType:'integer'}`로 바꾼다(REACT-032).
함수 시험의 `type === 'integer'` 절은 죽은 조건이므로 지운다(TS2367로 드러남)(REACT-032).
mui 수 입력의 정수 판정은 `schemaType === 'integer'`로 바꾼다(REACT-032).

【추론】 기본 입력은 친 글에 core와 같은 `interpret`를 유효 목록으로 적용하고, 결과가 목록의 한 형일 때만 그 결과를 보낸다(REACT-033).
【추론】 그래서 `['number','string']`에서 보내는 값은 늘 문자열이고(`"42"`는 이미 멤버), 게이트가 목록을 `['number']`로 좁힌 동안에는 `42`다(REACT-033).
【추론】 규칙 A를 미리 보는 공개 함수는 지금 내보내지 않으며, 입력은 `typeMismatch`로 결과를 보고, 함수를 나중에 더하는 것은 추가 변화다(REACT-033, SURFACE-061).
【추론】 시험 객체를 정규화할 때 일곱 키 밖의 키는 대조에서 빼고, 정의마다 한 번 개발 모드 경고 `(가칭) SCHEMA_FORM_WARNING.FORM_TYPE_TEST_INVALID`를 낸다(REACT-033).
【추론】 `type`에 적힌 `'integer'`도 어떤 노드와도 맞지 않으므로 같은 경고를 낸다(REACT-033).
【추론】 시험 대조의 예는 N1 = `['string','number']`, N2 = `['string','number','null']`, N3 = `['object','string']`, N4 = `['string','null']`, N5 = `['integer','null']`로 아래와 같다(REACT-033).
【추론】 `{type:'string'}`은 N4만 맞는다(종류가 string인 노드)(REACT-033).
【추론】 `{type:['string','number']}`는 N4·N5가 맞는다(string 종류 또는 number 종류이며 union이 아님)(REACT-033).
【추론】 `{type:'union'}`은 N1·N2·N3이 맞는다(모든 union)(REACT-033).
【추론】 `{type:'number'}`는 N5가 맞는다(정수 포함 모든 수 노드)(REACT-033).
【추론】 `{schemaType:'integer'}`는 N5가 맞는다(nullable 포함 정수 노드)(REACT-033).
【추론】 `{schemaType:['string','number']}`는 N4가 맞는다(`schemaType`이 `'string'`이나 `'number'`인 스칼라 노드)(REACT-033).
【추론】 `{type:'object'}`는 아무것도 맞지 않는다(N3은 object 노드가 아님)(REACT-033).
【추론】 `({type, schemaType}) => type === 'union' && schemaType.includes('object')`는 N3이 맞으며, 목록으로 가르는 union은 함수 시험으로 잡는다(REACT-033).
【추론】 입력을 고르는 순서는 그대로이고 union 전용 층은 두지 않는다: 인라인 `FormTypeInput` → `formTypeInputMap` → Form의 정의 → Provider의 정의 → `PluginManager` 목록(플러그인 정의가 앞, 코어 기본 정의가 뒤)이다(REACT-033).
【추론】 인라인이 `null`이면 입력을 그리지 않는다(REACT-033).
【추론】 union 항목이 없는 플러그인에서는 union이 코어 기본 정의로 떨어진다(REACT-033).
【추론】 경로 키가 union 칸 아래를 가리키는 `formTypeInputMap` 항목은 노드가 없으므로 맞지 않는다(NODE-020, REACT-033).
【추론】 코어 기본 정의에 `{type:'union'}` 항목 하나를 더해 정의가 열한 개가 된다(BLUEPRINT-042의 "새 입력을 두지 않으며"에 대한 보충)(REACT-033).
【추론】 그 항목은 `FormTypeInputString`을 감싸 아래의 초안·표시 규칙을 더한 것이며 새 구성 요소가 아니고, 자리는 `FormTypeInputStringDefinition` 바로 앞이다(REACT-033).
【추론】 기본 입력은 유효 목록을 `props.schemaType`과 `props.jsonSchema.type`의 교집합으로 구하며, core와 같은 내부 함수를 쓰고 `jsonSchema` 참조로 메모한다(REACT-033).
【추론】 값이 `undefined`·`null`·문자열·수·불리언이고 유효 목록에 원시 형이 하나라도 있으면 글 상자를 보이며, 표시는 `String(value)`이고 `undefined`와 nullable 노드의 `null`은 빈 칸이다(REACT-033).
【추론】 빈 칸은 `undefined`를 보낸다(REACT-033).
【추론】 키 입력마다, 그리고 흐려질 때 그 순간의 유효 목록으로 `interpret`하고, 목록의 한 형이 되면 그 결과를 보낸다(REACT-033, REACT-027).
【추론】 목록의 한 형이 되지 않으면 보내지 않고 초안으로 들며, 흐려지면 표시를 노드 값으로 되돌린다(REACT-033, REACT-027).
【추론】 유효 목록이 바뀌면 지금 초안으로 판정을 다시 돌리고, 이제 목록의 한 형이 될 때만 보낸다(REACT-033, REACT-027).
【추론】 입력기 조합 중에는 보내지 않는다(REACT-033).
【추론】 객체·배열 값의 읽기 전용 표시(BLUEPRINT-036)에서 문자열화 결과는 값 참조로 메모하고, 문자열화가 던지면 무효 표지만 보인다(REACT-033, BLUEPRINT-036).
【추론】 유효 목록에 원시 형이 없는 union(`['object','array']`, 또는 교집합이 `{null}`인 빈 목록)에 값이 없으면 빈 읽기 전용 상자를 보인다(REACT-033).
【추론】 기본 입력으로는 그 값을 만들 수 없으며, 이는 문서에 적는 한계이고 편집기는 UI 플러그인이 맡는다(REACT-033).
【추론】 `typeMismatch`가 참이면 `aria-invalid`와 무효 표지를 붙이고, 경고등이 켜진 값을 빈 칸처럼 그리지 않는다(SURFACE-052, REACT-033, REACT-027, SURFACE-061).
【추론】 union 칸에 `enum`·`const`가 있어도 기본 입력은 문자열 입력이며, 기본 enum·radio 정의를 union에 열지 않는다(BLUEPRINT-042)(REACT-033).
【추론】 그래서 `['number','string']` + `enum:[1,'a']`에서 기본 입력으로 친 `"1"`은 문자열로 남고 검증기가 기각하며, 이 사용성 빈틈은 UI 플러그인이 메운다(REACT-033).
【추론】 `format`은 문자열 입력이 이미 하는 만큼(`password`·`email`)만 쓰며, 날짜 정의는 union에 걸리지 않는다(REACT-033).
【추론】 기본 입력이 약속하지 않는 것은 여섯이다: `string`이 유효 목록에 있을 때 다른 원시 형을 만드는 것, 객체·배열을 만들거나 편집하는 것, 편집 모드에서 `null`을 만드는 것, 문자열 표기가 겹치는 enum 리터럴을 가르는 것, `const`·`format`·`enum`의 의미, 모양과 접근성(REACT-033).
【추론】 `FormTypeInputProps` 주석과 플러그인 문서에 다음 계약 문구를 싣는다(REACT-033).
union 입력은 `type === 'union'`일 때 다음을 읽는다(REACT-033). `schemaType`: 목록이며, 순서에 core의 뜻은 없다(REACT-033). `nullable`, `value`, `typeMismatch`, `required`(REACT-033, SURFACE-061). `jsonSchema`: `jsonSchema.type`은 켜진 선언의 교집합이며, 형 없는 칸에서는 없을 수 있다(REACT-033). 게이트가 좁힌 목록은 `schemaType`과 `jsonSchema.type`의 교집합이다(REACT-033).
보내는 값은 JSON 형이 목록에 있는 값이나 `undefined`다(REACT-033). `null`은 nullable일 때 비우기 조작으로만 보내고, 빈 칸은 `undefined`로 보낸다(REACT-033). `value`는 어긋난 값일 수 있으므로 `onChange`보다 넓은 형이다(REACT-033).
치다 만 글과 입력기 조합 중인 글은 입력이 초안으로 들고, 흐려지면 노드 값으로 되돌린다(REACT-033).
목록 밖의 값을 보내도 오류가 아니고 버려지지도 않는다(REACT-033). core의 규칙 A가 받아서, 받아 줄 형이 정확히 하나면 그 형으로 바꾸고, 아니면 그대로 두고 경고등을 켠다(REACT-033). 게이트가 목록을 좁힌 동안에는 좁혀진 목록으로 해석한다(REACT-033). 입력은 이 결과를 다음 렌더의 `typeMismatch`로 안다(REACT-033, SURFACE-061). `typeMismatch === false`는 검증 통과가 아니다(REACT-033, SURFACE-061).
객체·배열 값은 불변으로 다룬다(REACT-033). 바꿀 때는 새 참조를 보내고, 받은 값을 제자리에서 바꾸지 마라(REACT-033). 값 안에 JSON이 아닌 것(`undefined`인 키, `Date` 등)을 넣지 마라(REACT-033).
목록의 순서에 기대지 마라(REACT-033). core가 사용자가 뜻한 형을 골라 준다고 가정하지 마라(REACT-033).
PR: PR-7(렌더 계층과 바인딩)(REACT-033).
무엇: `src/__tests__/scenarios/union.input-binding.render.test.tsx`(시험 대조의 모든 칸, 인라인 우선, `FORM_TYPE_TEST_INVALID` 1회, `{typo: undefined}`의 대조, 정수 노드 props의 `type === 'number'`와 `schemaType === 'integer'`), `union.default-input-draft.render.test.tsx`, `union.object-array.render.test.tsx`의 기본 입력 부분을 돌린다(REACT-033).
통과: 초안·표시·비우기·무효 표시와 시험 대조가 위대로다(REACT-033).
실패: 기본 입력이 목록 밖 값을 보내거나 초안을 쓰면 감싸개를 고치고, 규칙이 입력 사례를 하나로 정하지 못하면 이 블록을 고친다(REACT-033).

### 06-react-and-surface.md §2.6 값 형식 불일치의 공개 이름

【추론】 공개 이름은 노드 getter `typeMismatch: boolean`이다(SURFACE-052, SURFACE-061). 【추론】 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`와 짝을 이뤄 검색된다(SURFACE-052, SURFACE-061). 【추론】 공개 노드 형은 이 칸을 판별자로 한 합집합이다(SURFACE-052). 【추론】 `false`이면 `value`가 그 형의 값·`undefined`·(nullable이면) `null`이고, `true`이면 `unknown`이다(SURFACE-052). 【추론】 입력 구성 요소는 `FormTypeInputProps`의 같은 이름 칸으로 받는다(SURFACE-052).

【추론】 `typeMismatch`가 `false`인 멤버의 `value`는 `string | number | boolean | ObjectValue | ArrayValue | undefined`이고, nullable이면 `| null`이 붙는다(SURFACE-052, SURFACE-061). 【추론】 노드 형에는 제네릭을 두지 않으며, 목록 형으로 좁히는 것은 `FormTypeInputProps`가 맡는다(SURFACE-052). 【추론】 props의 `onChange`는 목록 종류의 값, `undefined`, 그리고 nullable일 때만 `null`을 받는다(SURFACE-052).

게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`다(SURFACE-061, REACT-027, REACT-032, REACT-033, SURFACE-010, SURFACE-052, SURFACE-058). `mismatch`만은 검증기의 다른 불일치와 구별되지 않아 버리고, `value` 접두는 노드 게터·props에서 군더더기라 뺐다(SURFACE-061). 뜻은 그대로다: `schemaType`(게이트가 켜진 동안은 유효 목록)과 `nullable` 기준의 값 형 불일치이며 `false`는 검증 통과가 아니다(SURFACE-061, VALUE-037). 문서 주석에 "`node.type`이 아니라 `schemaType`·유효 목록 기준"을 한 줄 적는다(SURFACE-061). 시험 파일 이름 `union.mismatch-light.test.ts`는 그대로이고, 시험이 부르는 게터·코드 이름은 확정 이름이다(SURFACE-061).

### 07-landing-and-tests.md §1.5 재귀와 조건부 스키마의 이주

이주(LANDING-128): 재귀 객체 스키마의 실패 모양이 오늘의 `UNKNOWN_JSON_SCHEMA` 또는 스택 넘침에서 청사진 오류 `JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED`(가칭)로 바뀐다(서지 않는 것은 같고, 명시적 코드가 생긴다)(LANDING-128).

이주(LANDING-131): `dependentSchemas`나 `dependencies`를 쓴 스키마에 개발 모드 경고가 새로 난다(LANDING-131).

이주(LANDING-132): 조건부 `required`가 있는 필드의 필수 표시는 오늘 늘 켜지고, 새 설계에서는 켜진 `then`에 따라 바뀐다(LANDING-132).

이주(LANDING-133): 같은 값인 객체·배열 `const`끼리의 `allOf`는 오늘 `JSONSchemaError`를 던지고, 새 설계와 레거시 모두에서 통과한다(결함 수정)(LANDING-133).

이주(LANDING-134): 여러 `pattern`의 `node.jsonSchema` 표현이 오늘의 `(?=a)(?=b)` 합성 문자열에서 첫 패턴과 `allOf`의 `{pattern}` 항목으로 바뀐다(LANDING-134).

이주(LANDING-135): 식에 쓴 `*` 조각이 청사진 오류가 된다(LANDING-135).

【추론】 이주(LANDING-207): 형 없는 객체 분기 `oneOf`·`anyOf`(pydantic·zod·OpenAPI·TypeBox)는 오늘 `UNKNOWN_JSON_SCHEMA`이고(`extractSchemaInfo.ts:23`), 새 설계에서는 object variant 호스트다(LANDING-207). 【추론】 pydantic `Optional[Self]`처럼 그 호스트가 게이트 없는 객체 프로퍼티 순환을 이루면 실패 코드가 `UNKNOWN_JSON_SCHEMA`에서 `RECURSIVE_SHAPE_UNBOUNDED`로 바뀐다(LANDING-207, LANDING-128).

【추론】 이주(LANDING-208): `type` 없이 `const`·`enum`만 있는 프로퍼티(OpenAPI 3.1·JSON Schema 2020-12 관용구, 수기 태그)는 오늘 `UNKNOWN_JSON_SCHEMA`이고(`extractSchemaInfo.ts:23`), 새 설계에서는 리터럴 종류의 원시 잎이다(LANDING-208).

### 07-landing-and-tests.md §2.5 청사진과 노드 트리의 검증 관문

- PR: PR-1·PR-2(표본 (c′)는 PR-2)(TEST-067).
- (a) `@winglet/json-schema` 스캐너가 `$ref`의 대상 위치를 주는지, 순환을 `referenceSkipped: 'cycle'`로 알리는지 확인한다(TEST-067).
- (b) 코퍼스 14종(재귀 pydantic 트리 포함)이 모두 선다(TEST-067).
- (c) 무한 형상 표본 셋(자기 참조 객체 프로퍼티, nullable 자기 참조, A↔B 상호 참조)은 청사진 오류가 나고, 배열·게이트·터미널로 끊은 표본은 선다(TEST-067).
- (c′) 표본 "`required` 없는 `if/then`으로만 끊긴 재귀 → 정착 오류"를 PR-2에서 확인한다(예: `Node = { properties:{hasChild:{}}, if:{properties:{hasChild:{const:true}}}, then:{properties:{child:{$ref:Node}}} }`에 값 `{hasChild:true}`)(TEST-067).
- (d) `$ref`가 많은 스키마에서 청사진 1회 비용을 잰다(TEST-032의 벤치 행)(TEST-067).
- 통과: (b)와 (c)가 성립한다(TEST-067).
- 실패: 스캐너가 (a)를 못 주면 오늘의 `getReferenceTable`로 청사진이 스스로 푼다(편집자 선에서 처리)(TEST-067).
- 실패: (b)나 (c)가 실패하면 소유자에게 올린다(TEST-067).

【추론】 (4) TEST-013의 '그대로 산다'에서 뺄 것은 둘이다(TEST-068). 【추론】 하나는 `utils/__tests__/intersectConst.test.ts:40-58`의 참조 비교 단언으로, '버리고 새로 쓴다'로 옮겨 깊은 비교를 단언한다(TEST-068). 【추론】 다른 하나는 `utils/__tests__/intersectPattern.test.ts:6-14`의 전방 탐색 문자열 단언으로, 레거시와 함께 가며 새 병합 시험은 `'ab'`·`'Abc123'`·역참조·같은 이름 캡처 그룹 사례로 목록 표현을 단언한다(TEST-068).

【추론】 "각 PR은 새 코드와 그 시험만으로 독립 검증된다"(LANDING-051)는 각 PR이 자기가 들여오는 기제를 검증한다로 읽는다(TEST-069). 【추론】 뒤 PR의 기제가 있어야 하는 사례는 그 기제를 들여오는 PR의 시험으로 넘기며, 잃지 않도록 PR-0의 처분 목록이 사례마다 PR 번호를 단다(TEST-069).

【추론】 (가) PR-2는 예산 다섯 가운데 호스트 바퀴와 전이 라운드를 실제 코드로 시험한다: 초과 시 원본 B 커밋, `diagnostics`의 `'degraded'`·`cause: 'budget'`·`exceededBudget`(`'hostWheel'`·`'transition'`), 다음 로드까지의 지속(TEST-069). 【추론】 `diagnostics`와 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화한다(TEST-069). 【추론】 `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다(TEST-069).

【추론】 PR-2는 원본 B의 되돌림 기록 가운데 노드·이전 `raw`·이전 `extras`와 객체 자식의 생김·빠짐을 시험한다(TEST-069). 【추론】 PR-2는 정착 오류의 throw를 시험한다(TEST-069). 【추론】 PR-2에서 사슬은 `settle` 호출 하나다(`setValue`가 `settle` 쓰기로 직접 위임, `reviews/raw-round17-node-structure.md:74`)(TEST-069). 【추론】 커밋과 `diagnostics` 뒤 그 호출의 끝에서 던지는 것을 시험한다(TEST-069). 【추론】 PR-2는 식·가드 실패의 자리별 값과 `cause: 'expression'`을 시험하며, 식은 PR-1의 실제 컴파일러를 쓴다(TEST-069). 【추론】 PR-2는 `SetValueOption` 넷(억제 비트는 PR-2에 있는 자동 쓰기인 채움에 대해)과 로드의 새 수명을 시험한다(TEST-069). 【추론】 PR-2는 나감 비움 가운데 노드 자신의 층과 Form 속성 층을 시험한다(TEST-069). 【추론】 그 값은 참·거짓 리터럴이고, 하위 트리로 내려감, 자손의 `false`가 이김, 선언의 나감, 잠복 자손 비움, `extras` 불변을 포함한다(TEST-069). 【추론】 PR-2는 노드 구조 시험 전부, 린트 설정, `active` 게터, SETTLE-042의 키 순서(직렬화 단언 포함), TEST-070의 형 게이트를 시험한다(TEST-069).

"노드 구조 시험(행 칸 순서 시험: 모든 행의 칸 키와 순서가 같음. 겉면 멤버 목록 시험: 프로토타입 멤버 이름과 `SchemaNode/`의 `DETAIL.md` 목록의 일치. 공개 index 키 목록: 내부 통로가 `src/index.ts`에 없음. 행 고르기 함수의 조합 전수. 공개 형의 키 목록 타입 시험. `isTerminalNode`가 터미널 객체도 좁힘), `SchemaNode` 클래스 파일에 거는 린트 설정, `active` 게터"(TEST-069).

- PR: PR-2 정착 시나리오(TEST-069의 PR-2 시험)와 PR-2 벤치(TEST-069, SETTLE-045).
- (a) 사촌 하위 트리를 읽는 노드 게이트를 단언한다(TEST-069).
- (b) `#`를 읽는 게이트를 단언한다(TEST-069).
- (c) 서로를 읽는 두 호스트의 양의 순환이 이력과 무관하게 같은 원본에서 같은 형상을 내는지 단언한다(TEST-069).

【추론】 (나) 시험 대역은 게이트 술어 하나다(LANDING-062의 "게이트는 술어 인터페이스 뒤의 스텁")(TEST-069). 【추론】 대역의 계약은 PR-4의 `compileGuard`가 돌려주는 술어와 같은 모양이다: 게이트 입력 값 하나를 받아 참·거짓을 돌려주고, 동기이며, 순수하다(같은 입력에 같은 답)(TEST-069). 【추론】 던지는 대역으로 가드 평가 실패(정착 오류)를 시험한다(TEST-069). 【추론】 PR-4는 같은 시나리오를 실제 가드로 다시 돌린다(TEST-069). 【추론】 그 밖의 대역은 두지 않는다(TEST-069). 【추론】 시험만을 위한 주입 자리(파생 단계, 디스패처)를 새로 만들지 않는다(seiri `public-contract` §3)(TEST-069).

【추론】 (다) 파생 라운드 예산과 그 `degraded`, `DisableAutomaticWrites`의 파생·`injectTo` 억제는 PR-3으로 미룬다(TEST-069). 【추론】 되먹임 파동과 `onChange` 중첩 예산, 진입 사슬의 사슬 끝 throw(중첩 진입, 통지·`onChange`와의 순서, `details.errors` 묶음)는 PR-4로 미룬다(TEST-069). 【추론】 원본 B의 배열 아이템 구조 기록은 PR-5로 미룬다(TEST-018의 PR-5 행에 더함)(TEST-069). 【추론】 나감 비움의 `children` 항목 층, 조각 `controls` 층, 식 값(직전 커밋)은 PR-6으로 미룬다(TEST-019의 PR-6 행 "`unsetOnInactive` 층"에 명시)(TEST-069). 【추론】 `degraded` 동안의 제출 거부는 PR-7로 미룬다(TEST-069).

【추론】 (라) 프로토타입 회귀의 배분: 한 사례는 그것이 건드리는 기제가 모두 있는 가장 이른 PR로 간다(TEST-069). 【추론】 `selfcheck-v5`(63)는 a·b·c·d·e → PR-2(c 가운데 주입을 쓰는 단언은 PR-3), f(`disableAutomaticWrites`) → PR-3, g(통지) → PR-4로 간다(TEST-069). 【추론】 `r8-port`(q8 108, 예산·원본 B 행렬)는 호스트 바퀴·전이만 쓰는 행 → PR-2, `derived`·`injectTo`를 쓰는 행 → PR-3으로 간다(TEST-069). 【추론】 `r7-port`(52, E1–E13·X*)는 에지 발화 파생·`injectTo` → PR-3, X2·X3의 한 진입 묶음과 D-17 파동 세기 → PR-4로 간다(TEST-069). 【추론】 `edge-cases`(26, `spikes/round9/regress/edge-cases.mjs`)는 조각 생김·채움·덧씌움 기본값·`allOf` else → PR-2, `clearValue`·`injectTo`·단계 순서·파생 예산 → PR-3, 잠금 결합 → PR-6으로 간다(TEST-069). 【추론】 v7 회귀는 게이트 입력 `extras`·전이 상한·재계산 목록 순회·나감 비움(노드 자신·Form 속성 층) → PR-2, 같은 순위 동점·정착 단위 순위 → PR-3, 나감 에지 → PR-3(조각 `controls` 층의 사례는 PR-6)으로 간다(TEST-069). 【추론】 안건 `reviews/round-18-agenda.md:56`의 실행 확인(게이트 입력 `extras` 정적 규칙, 같은 순위 규칙, 나감 에지, 전이 라운드 상한이 나감 비움을 포함해 실제로 보장되는지)은 위 v7 회귀를 배분받은 PR의 시험으로 한다(TEST-069).

- PR: PR-2(TEST-070).
- 무엇: 실제 공개 형(`InferSchemaNode` 사상, 배열 멤버, S1(소유자 답 S1의 노드마다 타입에 맞는 parse, WRITE-052) 정합 상태 판별자)으로 새 fractal이 `tsc --strict`를 `as`·`any` 없이 통과하는지, `node.children`이 저장 배열과 같은 참조인지(시험) 본다(TEST-070).
- 통과: 둘 다 참이다(TEST-070).
- 실패: 두 선택지(가: 한 함수에 가둔 단언 하나를 승인, 나: 단언 없이 목록 읽기마다 원소 검사·복사)를 그대로 소유자에게 올린다(TEST-070).
- 실패: 그때 오늘 `src/core/nodeFromJSONSchema.ts:55`의 `as InferSchemaNode<Schema>`도 같은 물음의 대상으로 적는다(TEST-070).

【추론】 게이트(PR 02): E16(BLUEPRINT-045)의 새 기대와 게이트 분기만인 호스트·`{object,array}`·⊤ 분기·순환 절단과 빈 U의 사례가 `src/core/blueprint/__tests__/`에 한 건씩 있고, 순환 절단이 구현되어 형 없는 `$ref` 순환이 스택 넘침 없이 끝난다(TEST-079). 【추론】 게이트(PR 02): TEST-067(b)는 코퍼스 14종을 시험 파일로 돌려 원본 그대로 서야 하며, 통과하지 못하는 표본은 소유자에게 올린다(TEST-079, TEST-067). 【추론】 시험 `union.migration-shapes.render.test.tsx`에 LANDING-207의 모양을 더한다(TEST-079). 【추론】 시험 `union.migration-shapes.render.test.tsx`에 LANDING-208의 모양을 더한다(TEST-079). 【추론】 게이트(PR 02): 단일 종류(null 포함)·종류 혼합·객체 리터럴·분기 안의 `const`(그대로 오류)의 사례가 `src/core/blueprint/__tests__/`에 한 건씩 있다(TEST-079).

## 설계문서

- `design/01-schema-to-blueprint.md` §2.5 (BLUEPRINT-036, BLUEPRINT-043, BLUEPRINT-042, BLUEPRINT-046, BLUEPRINT-047)
- `design/01-schema-to-blueprint.md` §2.6 (BLUEPRINT-040, BLUEPRINT-041)
- `design/01-schema-to-blueprint.md` §2.7 (BLUEPRINT-051, BLUEPRINT-038, BLUEPRINT-048, BLUEPRINT-049, BLUEPRINT-050)
- `design/01-schema-to-blueprint.md` §2.8 (BLUEPRINT-044, BLUEPRINT-045)
- `design/02-node-and-value.md` §1.10 (NODE-057, NODE-058, NODE-059)
- `design/02-node-and-value.md` §2.4 (VALUE-037)
- `design/02-node-and-value.md` §3.11 (WRITE-093, WRITE-098, WRITE-099)
- `design/06-react-and-surface.md` §1.8 (REACT-032, REACT-033)
- `design/06-react-and-surface.md` §2.6 (SURFACE-061)
- `design/07-landing-and-tests.md` §1.5 (LANDING-207, LANDING-208)
- `design/07-landing-and-tests.md` §2.5 (TEST-079)
