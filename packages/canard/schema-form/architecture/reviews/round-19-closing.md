# 19라운드 닫기 — 형 없는 객체·배열 분기 호스트와 `const`만 있는 프로퍼티

2026-09-27. 18라운드가 봉인된 뒤 PR 02(기반 + 청사진)의 통합 검증이 원장 안의 충돌을 찾았다: TEST-067(b)는 코퍼스 14종이 서기를 요구하고, BLUEPRINT-039와 BLUEPRINT-045 E16은 그 14종이 모두 가진 모양(호스트에 `type`이 없는 객체 분기 `oneOf`·`anyOf`)을 `UNKNOWN_JSON_SCHEMA`로 정했다(`verification/02-foundation-and-blueprint/corpus-ledger-conflict.md`). "14종이 빌드됐다"는 TEST-067의 근거(`spikes/round11-corpus/REPORT.txt`)는 라운드 9 프로토타입 위의 측정이라 18라운드 규칙이 아니었다. 소유자가 방향을 정했고(`reviews/round-19-owner-answers.md:7`), 편집자 초안을 verifier·codex·antigravity가 대조해 결함을 고쳤으며(`reviews/raw-round19-typeless-object-host/merged-v1.md`), 검증이 찾은 둘째 물음을 소유자가 답했다(`reviews/round-19-owner-answers.md:8`). 모든 편집자 결정에 【추론】 표지가 있고, 표지 없는 줄은 소유자 답이 정한 규칙이다. 원장은 이 줄을 글자 그대로 인용하므로 고칠 때는 줄 수를 바꾸지 않고 제자리에서 고친다.

### 19C-01 자기 `type` 없는 칸의 객체·배열 분기 — variant 호스트로 추정, 절차 S3의 자리, 순환 절단, 형 수준, 대체 범위, 이주, 게이트

- 닫는 항목: BLUEPRINT-039(분할됨 → BLUEPRINT-049, BLUEPRINT-048), BLUEPRINT-044(충돌), BLUEPRINT-045(충돌), BLUEPRINT-038(보충), NODE-058(충돌), ERROR-164(충돌), ERROR-203(충돌), TEST-067(보충), TEST-077(충돌·보충), LANDING-128(보충), 새 항목 BLUEPRINT-048(결정), NODE-059(결정), LANDING-207(결정), TEST-079(결정)
- 결정:
  - 자기 `type` 없는 칸의 게이트 없는 `oneOf`·`anyOf` 분기 형을 접은 집합 F가 `{object}`이면 칸은 object 종류이고 `schemaType`은 `'object'`이며, F가 `{array}`이면 array 종류이고 `schemaType`은 `'array'`다.
  - 【추론】 S3(정적 연언 C에 `type`이 없는 칸)는 소유자 답 30행의 절차 그대로 칸의 게이트 없는 `oneOf`·`anyOf` 분기의 허용 집합 A(b)를 합쳐 키워드마다 U를 만들고(`'null'` 포함), `oneOf`와 `anyOf`가 함께 있으면 두 U를 교집합한 것을 U로 하며, 그 뒤에야 `'null'`을 떼어 F = fold(U \ {null})를 만든다.
  - 【추론】 게이트 가진 분기(분기 안의 `controls.active`, `controls.discriminator`로 변환된 분기)는 소유자 답 30행과 37행의 U4대로 U에 넣지 않고 게이트 선언의 규칙을 따르며, 게이트 없는 분기가 없으면 19C-02를 따르고(C에 `const`·`enum`도 없으면 `UNKNOWN_JSON_SCHEMA`), U가 빈 집합이면 `UNKNOWN_JSON_SCHEMA`다.
  - 【추론】 F가 `{object}`나 `{array}`인 칸의 nullable은 `'null'` ∈ U와 같다.
  - 【추론】 F가 `{array}`인 칸에서 분기의 `items`·`prefixItems`는 자기 `type:'array'`를 명시한 호스트와 같은 규칙(게이트 없는 분기끼리 fold가 같으면 노드 하나, 다르면 `SHARED_NODE_KIND_CONFLICT`)을 따른다.
  - 【추론】 종류가 정해진 칸은 그 뒤 S4의 variant 규칙과 S6의 순서(`options.terminal` → 판정 → `type`)를 자기 `type`을 명시한 칸과 똑같이 따르되, S6의 `type` 단계는 저자 스키마가 아니라 F가 정한 종류를 읽고, S4의 "형 있는 칸의 null 분기는 nullable을 켜지 않는다"는 이 칸에 적용하지 않는다.
  - 【추론】 F의 원소가 둘 이상이고 그 가운데 `object`나 `array`가 있으면 `UNKNOWN_JSON_SCHEMA`다(`object`와 `array`만 섞인 경우 포함, 소유자 답 33행의 혼합 규칙과 E15는 그대로다).
  - 【추론】 F에 `object`나 `array`가 없으면 소유자 답 30행의 원시 접기를 그대로 적용한다(U가 `{null}`이면 null 종류, 그 밖에는 원시 잎이나 `union` 잎).
  - 【추론】 셈에 드는 게이트 없는 분기 가운데 허용 집합이 ⊤인 분기(`const`·`enum`만 있는 분기 포함)가 있으면 F를 만들기 전에 소유자 답 32행대로 그 분기의 schemaPath와 `type`을 적으라는 안내를 담은 `UNKNOWN_JSON_SCHEMA`다.
  - 【추론】 분기 b의 A(b)는 b의 정적 연언(b 본체, 게이트 없는 `allOf`, `$ref` 대상)에 S2를 적용한 결과이고, b의 정적 연언에 `type`이 없으면 b에 S3를 재귀 적용해 얻은 U(`'null'`을 떼기 전)이며, 재귀에서 난 오류는 그대로 낸다.
  - 【추론】 재귀가 지금 펼치는 경로에 이미 있는 스키마 위치(분기 위치나 그 `$ref` 대상)에 다시 닿으면 그 분기는 더 펼치지 않고 U에 아무것도 더하지 않으며(BLUEPRINT-030의 조각 안 순환 절단과 같다), 그 결과 U가 비면 `UNKNOWN_JSON_SCHEMA`다.
  - 【추론】 이 재귀는 `properties`·`items`·`prefixItems`를 건너지 않으므로 `RECURSIVE_SHAPE_UNBOUNDED`의 판정과 겹치지 않는다.
  - 【추론】 이 결정은 소유자 답 33행의 "객체만·배열만인 경우(오늘과 같음)가 모두 여기에 든다"와 BLUEPRINT-045 E16, NODE-058의 "모든 분기가 객체(또는 배열)인 형 없는 칸은 `never`와 `unknown`이다"를 대체하고, 같은 답의 "object variant 호스트는 건드리지 않는다"와 혼합 금지는 그대로다.
  - 【추론】 ERROR-164의 `UNKNOWN_JSON_SCHEMA` 행의 "언제"에 적힌 "형 없는 칸의 빈 U와 객체·배열 분기"는 "형 없는 칸의 빈 U와 객체·배열이 다른 종류와 섞인 분기"로 읽는다.
  - 【추론】 E16은 "자기 형 없는 `{oneOf:[{type:'object',…},{type:'object',…}]}`는 object / `'object'` / false / NODE-028 순서(variant 호스트)"로 바뀐다.
  - 【추론】 `InferSchemaNode`·`InferValueType`은 분기가 모두 인라인 객체(또는 배열) 스키마인 형 없는 `oneOf`·`anyOf`를 `ObjectNode`(또는 `ArrayNode`)로 두고, 값 형은 분기 값 형의 합(null 분기가 있으면 `| null`)이다.
  - 【추론】 NODE-058의 "`$ref`, 게이트 가진 분기, `oneOf`와 `anyOf`가 함께 있는 칸, 본체에 붙은 `allOf`는 넓은 `SchemaNode`와 오늘 규칙의 값 형이다"는 그대로다.
  - 【추론】 이주(LANDING-207): 형 없는 객체 분기 `oneOf`·`anyOf`(pydantic·zod·OpenAPI·TypeBox)는 오늘 `UNKNOWN_JSON_SCHEMA`이고(`extractSchemaInfo.ts:23`), 새 설계에서는 object variant 호스트다.
  - 【추론】 pydantic `Optional[Self]`처럼 그 호스트가 게이트 없는 객체 프로퍼티 순환을 이루면 실패 코드가 `UNKNOWN_JSON_SCHEMA`에서 `RECURSIVE_SHAPE_UNBOUNDED`로 바뀐다.
  - 【추론】 시험 `union.migration-shapes.render.test.tsx`에 LANDING-207의 모양을 더한다.
  - 【추론】 게이트(PR 02): E16의 새 기대와 게이트 분기만인 호스트·`{object,array}`·⊤ 분기·순환 절단과 빈 U의 사례가 `src/core/blueprint/__tests__/`에 한 건씩 있고, 순환 절단이 구현되어 형 없는 `$ref` 순환이 스택 넘침 없이 끝난다.
  - 【추론】 게이트(PR 02): TEST-067(b)는 코퍼스 14종을 시험 파일로 돌려 원본 그대로 서야 하며, 통과하지 못하는 표본은 소유자에게 올린다.
- 근거: `reviews/raw-round19-typeless-object-host/brief.md`(초안 D1–D15), `verifier.md`·`codex.md`·`antigravity.md`(검증 셋), `merged-v1.md` §1(갈린 곳의 판정: 게이트 분기 제외는 셋 일치, 배열은 verifier의 실행 확인이 이김, 순환 절단은 BLUEPRINT-030과 같은 장치, 형 수준은 18C-89의 `$ref` 예외 보존). 초안이 게이트 분기를 세고 `'null'`을 먼저 뗀 것은 소유자 답 30행과 U4에 어긋나 고쳤고, `{object,array}`는 초안 어디에도 들지 않아 더했다.

### 19C-02 `type` 없이 `const`·`enum`만 있는 분기 없는 칸 — 리터럴의 JSON 종류로 원시 잎

- 닫는 항목: BLUEPRINT-037(분할됨 → BLUEPRINT-051, BLUEPRINT-050), BLUEPRINT-038(보충), NODE-058(충돌), ERROR-164(충돌), ERROR-203(충돌), TEST-067(보충), TEST-077(보충), 새 항목 BLUEPRINT-050(결정), NODE-059(결정), LANDING-208(결정), TEST-079(결정)
- 결정:
  - 가. 정적 연언 C에 `type`이 없고 게이트 없는 `oneOf`·`anyOf` 분기도 없는 칸에 C의 `const`나 `enum`이 있으면, 그 리터럴들의 JSON 종류(string·number·boolean·null, 정수 리터럴은 number)를 모아 U를 만들고 소유자 답 30행의 접기(`'null'`은 떼어 nullable로)를 적용해 원시 잎이나 null 잎으로 정한다.
  - `'null'`을 뗀 리터럴의 종류가 둘 이상이거나 리터럴에 객체·배열이 있으면 `UNKNOWN_JSON_SCHEMA`다.
  - 이 규칙은 분기가 없는 칸에만 적용되며, 분기 안의 `const`·`enum`만 있는 분기(소유자 답 32행, E14)는 그대로 `UNKNOWN_JSON_SCHEMA`다.
  - 【추론】 그 오류에는 그 칸의 schemaPath와 `type`을 적으라는 안내를 싣는다.
  - 【추론】 19C-01의 재귀가 분기 b를 볼 때 b의 정적 연언에 `type`도 분기도 없으면 b의 허용 집합은 소유자 답 32행대로 ⊤이다.
  - 【추론】 소유자 답 30행 첫 문장의 "정적 연언에 `type`을 가진 선언이 없는 칸은 칸의 게이트 없는 `oneOf`·`anyOf` 분기를 보며, 분기가 없으면 `UNKNOWN_JSON_SCHEMA`이다"는 "정적 연언에 `type`을 가진 선언이 없는 칸은 칸의 게이트 없는 `oneOf`·`anyOf` 분기를 보며, 분기도 `const`·`enum`도 없으면 `UNKNOWN_JSON_SCHEMA`이다"로 대체된다.
  - 【추론】 ERROR-164의 `UNKNOWN_JSON_SCHEMA` 행의 "언제"에 "분기도 `const`·`enum`도 없는 형 없는 칸"과 "리터럴의 종류가 섞이거나 객체·배열인 `const`·`enum`"을 적는다.
  - 【추론】 `InferValueType`은 이 칸을 `const`의 리터럴 형이나 `enum` 원소의 합(null 리터럴이 있으면 `| null`)으로 좁히고, `InferSchemaNode`는 U가 정한 종류의 노드다.
  - 【추론】 이주(LANDING-208): `type` 없이 `const`·`enum`만 있는 프로퍼티(OpenAPI 3.1·JSON Schema 2020-12 관용구, 수기 태그)는 오늘 `UNKNOWN_JSON_SCHEMA`이고(`extractSchemaInfo.ts:23`), 새 설계에서는 리터럴 종류의 원시 잎이다.
  - 【추론】 시험 `union.migration-shapes.render.test.tsx`에 LANDING-208의 모양을 더한다.
  - 【추론】 게이트(PR 02): 단일 종류(null 포함)·종류 혼합·객체 리터럴·분기 안의 `const`(그대로 오류)의 사례가 `src/core/blueprint/__tests__/`에 한 건씩 있다.
- 근거: `reviews/raw-round19-typeless-object-host/verifier.md` X1(호스트에 형을 넣어 14종을 모사하면 12종만 서고, OpenAPI-3.1 `type:[object,null]`과 hand anyOf overlapping은 `kind: {const:'cat'}`에서 실패), `merged-v1.md` §3(선택지 가·나와 권장), `x1-decision-draft.md`. 분기 안의 `const`를 그대로 오류로 두는 것은 소유자 답 32행이 고정이기 때문이다.
