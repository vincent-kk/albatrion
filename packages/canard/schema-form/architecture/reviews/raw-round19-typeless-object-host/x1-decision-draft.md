# X1 결정문 초안 — `type` 없이 `const`·`enum`만 있는 분기 없는 칸

소유자 답(2026-09-27): "좋습니다. 가. 수용합니다." 편집자가 `merged-v1.md` §3의 선택지 가를 한 줄에 한 문장으로 옮겼다. 【추론】 표지는 소유자 답이 정하지 않은 세부다.

- G1. 정적 연언 C에 `type`이 없고 게이트 없는 `oneOf`·`anyOf` 분기도 없는 칸에 C의 `const`나 `enum`이 있으면, 그 리터럴들의 JSON 종류(string·number·boolean·null, 정수 리터럴은 number)를 모아 U를 만들고 소유자 답 30행의 접기(`'null'`은 떼어 nullable로)를 적용해 원시 잎이나 null 잎으로 정한다.
- G2. 【추론】 `'null'`을 뗀 리터럴의 종류가 둘 이상이거나 리터럴에 객체·배열이 있으면 `UNKNOWN_JSON_SCHEMA`이며, 오류에 그 칸의 schemaPath와 `type`을 적으라는 안내를 싣는다.
- G3. 【추론】 이 규칙은 분기가 없는 칸에만 적용되며, D9의 재귀가 분기 b를 볼 때 b의 정적 연언에 `type`도 분기도 없으면 b의 허용 집합은 소유자 답 32행대로 ⊤이다(E14는 그대로 `UNKNOWN_JSON_SCHEMA`).
- G4. 소유자 답 30행 첫 문장의 "분기가 없으면 `UNKNOWN_JSON_SCHEMA`이다"는 "분기도 `const`·`enum`도 없으면 `UNKNOWN_JSON_SCHEMA`이다"로 대체되고, BLUEPRINT-037의 같은 구절과 ERROR-164·203의 `UNKNOWN_JSON_SCHEMA` "언제"도 같이 읽는다.
- G5. 【추론】 `InferValueType`은 이 칸을 `const`의 리터럴 형이나 `enum` 원소의 합(null 리터럴이 있으면 `| null`)으로 좁히고, `InferSchemaNode`는 G1이 정한 종류의 노드다.
- G6. 【추론】 이주 행(LANDING, 새 항목): `type` 없이 `const`·`enum`만 있는 프로퍼티(OpenAPI 3.1·JSON Schema 2020-12 관용구, 수기 태그)는 오늘 `UNKNOWN_JSON_SCHEMA`(`extractSchemaInfo.ts:23`)이고, 새 설계에서는 리터럴 종류의 원시 잎이다. TEST-077의 `union.migration-shapes` 목록에 이 행을 더한다.
- G7. 게이트(PR 02): TEST-067(b)는 코퍼스 14종이 원본 그대로 서야 하고, G1(단일 종류·null 포함)·G2(종류 혼합·객체 리터럴)·G3(분기 안의 `const`는 그대로 오류)의 사례가 `src/core/blueprint/__tests__/`에 한 건씩 있어야 한다.
