# 19라운드 검증 지시서 — 자기 `type` 없는 칸의 객체·배열 분기를 variant 호스트로 추정

이 문서는 소유자가 정한 방향을 결정문 초안으로 적고, 검증자가 그 초안을 원장과 구현에 대조하기 위한 지시서다. 검증자는 어떤 파일도 고치지 않는다. 판정은 아래 §5의 기준으로만 하고, 근거는 `path:line`으로 인용한다.

## 1. 배경 — 원장 안의 충돌

- TEST-067(b)(`ledger/test.md`, 정본 `reviews/round-18-closing.md:43-51`)는 코퍼스 14종(`spikes/guard-cost/redteam3/corpus.mjs`)이 모두 서기를 요구한다. 14종 모두 호스트에 `type`이 없는 객체 분기 `oneOf`·`anyOf`를 포함한다.
- BLUEPRINT-039(소유자 답 `reviews/round-18-owner-answers.md:33`, union O3)는 자기 `type` 없는 칸의 접은 분기 형에 `object`·`array`가 있으면 객체만·배열만인 경우까지 `UNKNOWN_JSON_SCHEMA`로 정했고, BLUEPRINT-045 E16이 이를 예로 적었다.
- "14종이 빌드됐다"는 근거(`spikes/round11-corpus/REPORT.txt`)는 라운드 9 프로토타입 위의 측정이며 18라운드 규칙이 아니다.
- 대조 기록: `verification/02-foundation-and-blueprint/corpus-ledger-conflict.md`, `integration-verification.md` "TEST-067 독립 재대조".

## 2. 소유자 원문(2026-09-27)

> 두번째 길로 가보죠. $ref 로 정의된 스키마도, 해당 노드를 생성하는 시점에 $ref 가 아닌 실제 노드로 풀어낼거고, 그럼 최소한 그 노드들에 대해서는 일반 jsonSchema 와 동치일테니까, 그럼 그 스키마에 대해서 접은 분기 형이 객체만이거나 배열만이면, 30행이 원시 분기에 한 것처럼 형을 모아서 object variant 호스트로 추정하는 방향으로요. 다만, 이 방향이 위험한지 아닌지는 지금 검토가 가능합니까?

소유자는 이 방향의 위험 검토를 요청했고, 검증이 찾은 결함을 고친 형태로 채택한다(HANDOFF §3 "정합하면 채택" 위임의 선례 37행).

## 3. 결정문 초안(편집자 【추론】) — 한 줄에 한 문장

- D1. S3(정적 연언 C에 `type`이 없는 칸)에서 먼저 칸의 `oneOf`·`anyOf` 분기 전부(게이트 없는 분기와 `controls.discriminator`·`controls.active`로 게이트가 걸린 분기 모두)의 허용 집합 A(b)에서 `'null'`을 뗀 것을 합쳐 형 집합 F를 만든다.
- D2. `oneOf`와 `anyOf`가 함께 있으면 두 키워드의 F를 교집합한 것이 F다.
- D3. F가 `{object}`이면 칸은 object 종류이고 `schemaType`은 `'object'`이며, 어느 분기의 A(b)에라도 `'null'`이 있으면 `nullable: true`다.
- D4. F가 `{array}`이면 칸은 array 종류이고 `schemaType`은 `'array'`이며, nullable은 D3과 같다.
- D5. D3·D4로 종류가 정해진 칸은 그 뒤 S4의 variant 규칙과 S6의 순서(`options.terminal` → 판정 → `type`)를 자기 `type`을 명시한 칸과 똑같이 따른다.
- D6. F에 `object`나 `array`와 원시가 함께 있으면 `UNKNOWN_JSON_SCHEMA`다(소유자 답 33행의 혼합 규칙과 E15는 그대로다).
- D7. F에 `object`나 `array`가 없으면 소유자 답 30행의 원시 접기를 그대로 적용한다(게이트 가진 분기를 제외하는 규칙 포함).
- D8. 허용 집합이 ⊤인 분기(`const`·`enum`만 있는 분기 포함)가 있으면 F를 만들기 전에 소유자 답 32행대로 `UNKNOWN_JSON_SCHEMA`다.
- D9. 분기 b의 A(b)는 b의 정적 연언(b 본체, 게이트 없는 `allOf`, `$ref` 대상)에 S2를 적용한 결과이고, b의 정적 연언에 `type`이 없으면 b에 S3를 재귀 적용한 결과다.
- D10. D9의 재귀가 유한 참조 그래프의 순환에 닿으면 그 분기의 A(b)는 ⊤로 보고 D8에 따라 `UNKNOWN_JSON_SCHEMA`다.
- D11. 소유자 답 33행의 "객체만·배열만인 경우(오늘과 같음)가 모두 여기에 든다"는 이 결정으로 대체되고, 같은 답의 "object variant 호스트는 건드리지 않는다"와 혼합 금지는 그대로다.
- D12. E16은 "자기 형 없는 `{oneOf:[{type:'object',…},{type:'object',…}]}`는 object / `'object'` / false / variant 호스트"로 바뀐다.
- D13. `InferValueType`·`InferSchemaNode`는 D1–D10을 비추어, 형 없는 객체 분기 `oneOf`·`anyOf`를 객체 형으로 추론한다.
- D14. 이주 행(LANDING): 형 없는 객체 분기 `oneOf`·`anyOf`(pydantic·zod·OpenAPI·TypeBox)는 오늘 `UNKNOWN_JSON_SCHEMA`(`extractSchemaInfo.ts`가 `type` 없으면 `null`)이고, 새 설계에서는 object variant 호스트다.
- D15. 게이트: TEST-067(b)는 원본 14종 그대로 통과해야 하고, E16의 새 기대와 D6·D8·D10의 오류 사례가 `src/core/blueprint/__tests__/`에 한 건씩 있어야 한다.

## 4. 대조할 원문

- 원장: `ledger/blueprint.md`의 BLUEPRINT-037·038·039·041·044·045, `ledger/test.md`의 TEST-067·077, `ledger/landing.md`의 LANDING-174, `ledger/error.md`의 ERROR-164(`UNKNOWN_JSON_SCHEMA`·`RECURSIVE_SHAPE_UNBOUNDED` 행), `ledger/node.md`의 NODE-028·042, `ledger/goal.md`의 GOAL-027.
- 정본: `reviews/round-18-closing.md` 18C-90(S0–S6, 결과 일곱), 18C-01, 18C-105. `reviews/round-18-owner-answers.md:30,32,33,37`. `reviews/raw-round18-union-swarm/merged-v3.md` 2.15·2.24·2.26과 O3 행.
- 구현: `../src/core/blueprint/` — `DETAIL.md`, `utils/types/*.ts`(`readAllowedTypes`·`foldAllowedTypes`·`inferAllowedTypes`·`unionAllowedTypes`·`intersectAllowedTypes`·`resolveNodeTypes`·`resolveNodeStrategy`), `utils/analyze/`, `__tests__/`. 공개 형 `../src/types/`의 `InferValueType`·`InferSchemaNode`.
- 코퍼스: `spikes/guard-cost/redteam3/corpus.mjs` 14종의 호스트 모양.

## 5. 판정 기준 — 축마다 `통과 | 결함 | 소유자 물음`

1. **재귀.** D9·D10이 pydantic `Optional[discriminated]`(`anyOf:[{discriminator, oneOf:[…]}, {type:'null'}]`)와 재귀 트리(`Node.children.items.anyOf → Node`)에서 하나의 결과로 끝나는가. 순환에서 멈추는 조건이 유한 참조 그래프(TEST-067(a), BLUEPRINT-030)와 맞는가. `RECURSIVE_SHAPE_UNBOUNDED`와 겹치지 않는가.
2. **게이트 가진 분기.** D1이 게이트 가진 분기를 세는 것과 D7이 30행대로 제외하는 것이 한 절차 안에서 모순 없이 서는가. 30행 원문이 게이트 분기 제외를 원시 접기에 한정하는지, 형 없는 칸 전체에 두는지 인용으로 답하라.
3. **배열만인 경우.** D4의 array variant 호스트에 원장 근거가 있는가. `items`가 다른 배열 분기 둘을 한 array 노드로 합치는 규칙이 원장에 있는가. 없으면 "소유자 물음"으로 표시하고, 객체만 받는 축소안의 결과를 적어라.
4. **판정 절차의 자리.** D1–D8을 S3 안에 두는 것이 18C-90의 "S0부터 번호 순서, 반드시 하나의 결과" 및 S4·S6 원문과 맞는가. NODE-028·042의 순서와 어긋나지 않는가.
5. **형 수준.** D13이 18C-90의 형 수준 문장(`reviews/round-18-closing.md` 2352행 근처)과 맞는가. 현재 `InferValueType`이 형 없는 `oneOf`를 어떻게 추론하는지 코드로 답하라.
6. **뒤집히는 범위.** D11·D12·D14가 대체하는 현행 항목과 문장을 모두 나열하라(BLUEPRINT-039·045, TEST-077의 청사진 줄, LANDING-174, ERROR-164 행, 구현 시험의 `UNKNOWN_JSON_SCHEMA` 기대). 누락이 있으면 결함이다.
7. **값 의미.** discriminator 없는 객체 `oneOf`(코퍼스 "pydantic Optional[Union[Cat,Dog]]", "OpenAPI-3.0 mapping-only")에서 분기 전부 켜짐과 `kind` 재선언이 GOAL-027·BLUEPRINT-010과 맞는가. 자기 `type`을 명시한 호스트와 결과가 같은가.
8. **구현 거리.** 현재 `utils/types/`의 접기·판정 코드에서 D1–D10을 넣을 자리와, 바뀌어야 할 함수·시험 파일을 나열하라. 새 fractal이나 큰 재구성이 필요하면 적어라.

## 6. 보고 양식

- 축마다 `A<n> <통과|결함|소유자 물음>`, 근거 인용(`path:line`), 결함이면 초안의 어느 D를 어떻게 고치는지(고친 문장 전체), 소유자 물음이면 선택지 둘과 각 결과.
- 끝에 "고친 결정문" 절: D1–D15를 결함 반영 후 전체로 다시 쓴다. 고치지 않은 줄은 글자 그대로 둔다.
- 보고는 메시지로 돌려준다. 저장소와 scratchpad에 파일을 쓰지 않는다.
