# 편집자 판정과 고친 결정문 v1 — 자기 `type` 없는 칸의 객체·배열 분기를 variant 호스트로 추정

2026-09-27. 입력은 `brief.md`의 초안 D1–D15와 검증 셋(`verifier.md`, `codex.md`, `antigravity.md`)이다. 셋 모두 초안 그대로는 채택 불가로 판정했고, 편집자는 아래와 같이 걸러 합쳤다. 모든 판정에 【추론】 표지가 있다. 소유자 물음은 X1 하나다.

## 1. 축별 판정과 갈린 곳의 결정

| 축 | verifier | codex | antigravity | 편집자 판정 |
| --- | --- | --- | --- | --- |
| A1 재귀 | 결함(D10) | 결함(D10) | 통과 | 결함. D10을 고친다 |
| A2 게이트 분기 | 결함 | 결함 | 결함 | 결함. 게이트 없는 분기만 센다 |
| A3 배열만 | 통과 | 소유자 물음 | 소유자 물음 | 통과. 배열을 받는다 |
| A4 절차의 자리 | 결함 | 결함 | 결함 | 결함. `'null'` 순서·`{object,array}`·D5 보강 |
| A5 형 수준 | 결함 | 결함 | 결함 | 결함. 인라인 분기만 좁힌다 |
| A6 뒤집히는 범위 | 결함 | 결함 | 결함 | 결함. 대체 목록을 전수로 적는다 |
| A7 값 의미 | 통과 | 통과(설계 한정) | 통과 | 통과 |
| A8 구현 거리 | 통과 | 통과 | 통과 | 통과. 새 fractal 없음 |
| X1 코퍼스 2종 | 소유자 물음 | — | — | 소유자 물음 |

- **A2 — 셋이 일치.** 소유자 답 30행의 "게이트 없는 분기를 보며 … 게이트 가진 분기는 이 합치기에 넣지 않는다"는 형 없는 칸 전체의 규칙이고, U4(37행)는 게이트가 종류를 바꾸지 못하게 한다. 초안 D1의 "게이트 포함"은 이 둘과 어긋난다. 코퍼스의 `discriminator`는 OpenAPI 키워드이지 게이트가 아니므로(`src/core/blueprint/DETAIL.md:11`, `readDiscriminatorBranches.ts:33`는 `controls.discriminator`만 읽음) 게이트 분기를 빼도 코퍼스의 분기는 모두 셈에 든다. 【추론】 D1·D2를 30행 그대로 쓴다.
- **A3 — verifier가 이긴다.** 소유자 원문이 "객체만이거나 배열만이면"이라 했고, S4 "칸이 object·array이면 기존 variant 규칙을 따른다"(`round-18-closing.md:2400`)와 결과 일곱의 "variant 호스트"(`:2414`)는 종류를 가리지 않는다. codex·antigravity가 든 "다른 `items`를 합치는 규칙이 없다"는 우려는 자기 `type:'array'`를 명시한 호스트에도 똑같이 있는 것이고, 오늘 그 호스트는 게이트 없는 분기끼리 fold가 같으면 노드 하나(`:2405`), 다르면 `SHARED_NODE_KIND_CONFLICT`(`:2950`)로 이미 정해져 있다(verifier가 `{type:'array', oneOf:[…]}`로 실행 확인). D5가 명시 호스트와 같게 만들므로 새 규칙이 필요 없다. 【추론】 배열을 받는다. 배열 호스트의 결과가 명시 호스트와 같다는 문장을 D4에 적는다.
- **A1 — verifier의 D10이 이긴다.** codex는 재진입을 ⊤로 보아 오류로, verifier는 "더 펼치지 않고 U에 더하지 않는다"로 고쳤다. 같은 칸의 조각 열거는 이미 후자로 정해져 있다(BLUEPRINT-030, `ledger/blueprint.md:477-478` "존재(합집합)가 바뀌지 않기 때문"). 허용 집합도 합집합이므로 같은 장치가 맞다(G4, GOAL-006). 둘 다 "재귀는 `properties`·`items`·`prefixItems`를 건너지 않는다"에 일치하므로 `RECURSIVE_SHAPE_UNBOUNDED`와 겹치지 않는다. 【추론】 verifier의 D10. antigravity의 "통과"는 순환 절단이 구현에 없다는 사실(`inferAllowedTypes.ts:50`이 빈 `visiting`으로 새로 부름, 지금도 `Maximum call stack size exceeded`)을 보지 못한 것이다.
- **A4 — 셋이 일치.** `'null'`은 합치고 교집합한 뒤에야 뗀다(30행, E33). F = `{object, array}`는 초안 어디에도 들지 않았다. D12의 전략 칸은 E8처럼 "NODE-028 순서"다. antigravity의 "S6 폴백"은 D5에 "S6의 `type` 단계는 저자 스키마가 아니라 D3·D4가 정한 종류를 읽는다"로 넣는다. antigravity의 NODE-042(2) 우려는 명시 호스트에도 같은 규칙이라 새 문장이 필요 없다.
- **A5 — verifier·codex가 이긴다.** 18C-89(`round-18-closing.md:2357-2358`, NODE-058)는 "모든 분기가 객체(또는 배열)인 형 없는 칸은 `never`와 `unknown`"(대체 대상)과 "`$ref`, 게이트 가진 분기, `oneOf`와 `anyOf`가 함께 있는 칸, 본체에 붙은 `allOf`는 넓은 `SchemaNode`와 오늘 규칙의 값 형"(그대로)을 함께 둔다. antigravity의 "분기 값 형의 유니온"은 `$ref` 분기에서 형 수준이 판정할 수 없는 것을 판정하는 것이라 뒤의 문장과 어긋난다. 【추론】 인라인 분기만 좁히고 `$ref` 분기는 넓은 형 그대로.
- **A6 — verifier의 목록이 가장 넓다.** 셋을 합쳐 D11에 전수로 적는다.
- **X1 — verifier만 찾았다.** 호스트 형을 넣어 모사하면 14종 가운데 12종만 서고, OpenAPI-3.1 `type:[object,null]`(`corpus.mjs:113`)과 hand anyOf overlapping(`corpus.mjs:194-196`)은 호스트와 무관하게 `type` 없이 `const`만 있는 태그 프로퍼티(`kind: {const:'cat'}`)에서 30행 첫 문장("분기가 없으면 `UNKNOWN_JSON_SCHEMA`")으로 실패한다. 명시 호스트여도 같다. 이 결정으로는 풀리지 않으므로 18C-01("(b)가 실패하면 소유자에게")대로 소유자에게 올린다. antigravity의 "실패 3건이 모두 풀린다"(D15)는 이 사실과 어긋나 버린다.

## 2. 고친 결정문 v1 — 한 줄에 한 문장

- D1. S3(정적 연언 C에 `type`이 없는 칸)는 소유자 답 30행의 절차 그대로 칸의 게이트 없는 `oneOf`·`anyOf` 분기의 허용 집합 A(b)를 합쳐 키워드마다 U를 만들고(`'null'` 포함), `oneOf`와 `anyOf`가 함께 있으면 두 U를 교집합한 것을 U로 하며, 그 뒤에야 `'null'`을 떼어 F = fold(U \ {null})를 만든다.
- D2. 게이트 가진 분기(분기 안의 `controls.active`, `controls.discriminator`로 변환된 분기)는 소유자 답 30행과 37행의 U4대로 U에 넣지 않고 게이트 선언의 규칙을 따르며, 게이트 없는 분기가 없거나 U가 빈 집합이면 `UNKNOWN_JSON_SCHEMA`다.
- D3. F가 `{object}`이면 칸은 object 종류이고 `schemaType`은 `'object'`이며, nullable은 `'null'` ∈ U와 같다.
- D4. F가 `{array}`이면 칸은 array 종류이고 `schemaType`은 `'array'`이며, nullable은 D3과 같고, 분기의 `items`·`prefixItems`는 자기 `type:'array'`를 명시한 호스트와 같은 규칙(게이트 없는 분기끼리 fold가 같으면 노드 하나, 다르면 `SHARED_NODE_KIND_CONFLICT`)을 따른다.
- D5. D3·D4로 종류가 정해진 칸은 그 뒤 S4의 variant 규칙과 S6의 순서(`options.terminal` → 판정 → `type`)를 자기 `type`을 명시한 칸과 똑같이 따르되, S6의 `type` 단계는 저자 스키마가 아니라 D3·D4가 정한 종류를 읽고, S4의 "형 있는 칸의 null 분기는 nullable을 켜지 않는다"는 이 칸에 적용하지 않는다(nullable은 D3이 정한다).
- D6. F의 원소가 둘 이상이고 그 가운데 `object`나 `array`가 있으면 `UNKNOWN_JSON_SCHEMA`다(`object`와 `array`만 섞인 경우 포함, 소유자 답 33행의 혼합 규칙과 E15는 그대로다).
- D7. F에 `object`나 `array`가 없으면 소유자 답 30행의 원시 접기를 그대로 적용한다(U가 `{null}`이면 null 종류, 그 밖에는 원시 잎이나 `union` 잎).
- D8. 셈에 드는 게이트 없는 분기 가운데 허용 집합이 ⊤인 분기(`const`·`enum`만 있는 분기 포함)가 있으면 F를 만들기 전에 소유자 답 32행대로 그 분기의 schemaPath와 `type`을 적으라는 안내를 담은 `UNKNOWN_JSON_SCHEMA`다.
- D9. 분기 b의 A(b)는 b의 정적 연언(b 본체, 게이트 없는 `allOf`, `$ref` 대상)에 S2를 적용한 결과이고, b의 정적 연언에 `type`이 없으면 b에 D1–D8을 재귀 적용해 얻은 U(`'null'`을 떼기 전)이며, 재귀에서 난 오류는 그대로 낸다.
- D10. D9의 재귀가 지금 펼치는 경로에 이미 있는 스키마 위치(분기 위치나 그 `$ref` 대상)에 다시 닿으면 그 분기는 더 펼치지 않고 U에 아무것도 더하지 않으며(BLUEPRINT-030의 조각 안 순환 절단과 같다), 그 결과 U가 비면 D2대로 `UNKNOWN_JSON_SCHEMA`다. D9의 재귀는 `properties`·`items`·`prefixItems`를 건너지 않으므로 `RECURSIVE_SHAPE_UNBOUNDED`의 판정과 겹치지 않는다.
- D11. 이 결정은 다음을 대체한다: 소유자 답 33행의 "객체만·배열만인 경우(오늘과 같음)가 모두 여기에 든다"; BLUEPRINT-039의 제목(`ledger/blueprint.md:677`)과 결정 첫 문장(`:680`)의 같은 구절; BLUEPRINT-045 E16(`:867`, 정본 `round-18-closing.md:2431`); NODE-058(18C-89 `round-18-closing.md:2357`, `ledger/node.md:993`)의 "모든 분기가 객체(또는 배열)인 형 없는 칸은 `never`와 `unknown`이다"; ERROR-203(`ledger/error.md:3006`)과 ERROR-164 보충(`:2460`, 18C-90 `round-18-closing.md:2458`)의 "형 없는 칸의 빈 U와 객체·배열 분기"는 "형 없는 칸의 빈 U와 객체·배열이 다른 종류와 섞인 분기"로 읽는다; `merged-v3.md:151`(R8)·`:211`(E16)과 `round-18-closing.md:2468`의 "형 없는 객체·배열 호스트를 새로 받아들이지 않음"은 원문을 두고 이 결정이 대체함을 기록한다. 같은 답의 "object variant 호스트는 건드리지 않는다"와 혼합 금지는 그대로이며, BLUEPRINT-044 S3의 출처(`ledger/blueprint.md:818`)에 이 결정을 더하고, TEST-077의 E1–E42 줄(`ledger/test.md:1291`)은 바뀐 E16을 단언한다.
- D12. E16은 "자기 형 없는 `{oneOf:[{type:'object',…},{type:'object',…}]}`는 object / `'object'` / false / NODE-028 순서(variant 호스트)"로 바뀐다.
- D13. `InferSchemaNode`·`InferValueType`은 D1–D10을 비추어, 분기가 모두 인라인 객체(또는 배열) 스키마인 형 없는 `oneOf`·`anyOf`를 `ObjectNode`(또는 `ArrayNode`)로 두고 값 형은 분기 값 형의 합(null 분기가 있으면 `| null`)으로 두며, 18C-89의 "`$ref`, 게이트 가진 분기, `oneOf`와 `anyOf`가 함께 있는 칸, 본체에 붙은 `allOf`는 넓은 `SchemaNode`와 오늘 규칙의 값 형"은 그대로다.
- D14. 이주 행(LANDING, 새 항목): 형 없는 객체 분기 `oneOf`·`anyOf`(pydantic·zod·OpenAPI·TypeBox)는 오늘 `UNKNOWN_JSON_SCHEMA`(`extractSchemaInfo.ts:23`이 `type` 없으면 `null`)이고, 새 설계에서는 object variant 호스트다. pydantic `Optional[Self]`처럼 이 호스트가 게이트 없는 객체 프로퍼티 순환을 이루면 실패 코드가 `UNKNOWN_JSON_SCHEMA`에서 `RECURSIVE_SHAPE_UNBOUNDED`로 바뀐다(LANDING-128 보충). TEST-077의 `union.migration-shapes` 목록(`ledger/test.md:1312`)에 이 행을 더한다.
- D15. 게이트(PR 02): E16의 새 기대와 D2(게이트 분기만인 호스트)·D6(`object`+`array`)·D8·D10(순환 절단과 빈 U)의 사례가 `src/core/blueprint/__tests__/`에 한 건씩 있고, D10의 순환 절단이 구현되어 형 없는 `$ref` 순환이 스택 넘침 없이 끝나며, TEST-067(b)는 코퍼스 14종을 시험 파일로 돌리되 통과 조건은 소유자 물음 X1의 답을 따른다.

## 3. 소유자 물음 X1 — `type` 없이 `const`만 있는 프로퍼티

- **배경.** OpenAPI 3.1과 JSON Schema 2020-12 관용구는 태그 프로퍼티를 `kind: {const: 'cat'}`처럼 `type` 없이 적는다. 코퍼스 14종 가운데 둘이 이 모양이다.
- **왜 묻는가.** 소유자 답 30행 첫 문장은 형 없는 칸에 분기가 없으면 `UNKNOWN_JSON_SCHEMA`로 정했고, 32행(O2)은 `const`·`enum`만 있는 **분기**를 오류로 정하며 "`type`을 적으라"는 안내를 실었다. 엄격함(작성자에게 `type`을 요구)과 이주 수용(생성기 출력을 그대로 받음)이 서열 없이 부딪치고, 결과가 사용자에게 보인다.
- **예시.** `{type:'object', properties:{kind:{const:'cat'}, meow:{type:'string'}}}` — 오늘도, D1–D15 뒤에도 `kind`에서 `UNKNOWN_JSON_SCHEMA`.
- **선택지 가(이주 수용).** 분기가 없는 형 없는 칸에 `const`나 `enum`이 있고 리터럴이 모두 원시(string·number·boolean·null)이며 한 JSON 종류를 공유하면 그 종류의 잎(null이면 nullable)이고, 종류가 섞이거나 객체·배열 리터럴이면 `UNKNOWN_JSON_SCHEMA`다. 결과: 14종이 원본 그대로 선다. O2(분기 안의 `const`)와 E14는 건드리지 않는다. 형 수준 `InferValueType`은 리터럴 형으로 좁힐 수 있다.
- **선택지 나(원장 정합).** TEST-067(b)를 원본 12종과 태그에 `type`을 더한 이주 모양 2종으로 좁히고, 원본 2종은 `kind` 칸의 `UNKNOWN_JSON_SCHEMA`를 기대값으로 둔다. 결과: 규칙은 바뀌지 않고 게이트만 바뀐다. OpenAPI 3.1 관용구를 쓰는 사용자는 태그마다 `type`을 더해야 한다.
- **편집자 권장: 가.** 30행에서 이미 원시 분기의 형을 모으기로 했고, 리터럴의 JSON 종류는 분기 형보다 더 확정적이다. 분기 규칙(O2)은 그대로이므로 파괴적 변화가 없다. 다만 소유자 답 30행 첫 문장을 대체하므로 소유자가 정해야 한다.
- **관련 원장 번호.** BLUEPRINT-037·038, TEST-067, ERROR-164, LANDING-174, E14.

## 4. 반영 계획(소유자 답 뒤)

1. `reviews/round-19-owner-answers.md`를 만들어 행 둘(이 결정의 소유자 원문, X1의 답)을 적고 `ledger/checks/owner-answers.tsv`에 더한다.
2. `reviews/round-19-closing.md`에 블록 19C-01(D1–D15)과 19C-02(X1)을 적는다.
3. 원장 반영: BLUEPRINT-039·044·045·037·038, NODE-058, ERROR-164·203, TEST-067·077, LANDING 새 이주 행·LANDING-128 보충. 옛 글은 자라기만 한다. D11의 목록이 반영 계획의 집이다.
4. HANDOFF §4의 검사 전부 0.
5. PR 02의 worker가 D15를 구현하고 verifier가 게이트를 대조한다.
