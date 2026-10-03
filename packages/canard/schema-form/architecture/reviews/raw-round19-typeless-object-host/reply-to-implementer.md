# 개발 에이전트에게 — TEST-067(b) 대 BLUEPRINT-039·045 E16 충돌의 답(2026-09-27)

보고한 충돌은 맞았고, 원장 안의 현행 항목 둘이 어긋난 것이었다. 소유자가 정했고 원장을 이 브랜치(`feat/schema-form-foundation-blueprint`)에서 바로 고쳤다. 정본은 `architecture/reviews/round-19-closing.md`(19C-01·19C-02)와 `architecture/reviews/round-19-owner-answers.md`(7·8행)이며, 원장 항목은 다음과 같다. 계획서는 안내이고 원장 항목이 명세이니 아래 번호를 원장에서 직접 읽어라.

## 무엇이 바뀌었나

1. **자기 `type` 없는 칸의 객체·배열 분기(BLUEPRINT-048, 정본 19C-01).** 게이트 없는 `oneOf`·`anyOf` 분기의 허용 집합을 소유자 답 30행 절차 그대로 합쳐 U를 만들고(`'null'` 포함, `oneOf`·`anyOf`가 함께면 교집합), 그 뒤에 `'null'`을 떼어 접은 F가 `{object}`면 object 종류·`schemaType:'object'`, `{array}`면 array 종류·`schemaType:'array'`다. nullable은 `'null'` ∈ U. 그 뒤는 `type`을 명시한 호스트와 똑같이 S4 variant 규칙과 S6 순서를 따른다(S6의 `type` 단계는 F가 정한 종류를 읽음). 게이트 가진 분기(`controls.active`, `controls.discriminator`)는 U에 넣지 않는다 — 코퍼스의 `discriminator`는 OpenAPI 키워드라 게이트가 아니다. F에 `object`·`array`와 다른 종류가 섞이면(`object`+`array`만 섞인 것도) `UNKNOWN_JSON_SCHEMA`. 형 없는 분기의 재귀는 같은 경로에 다시 닿으면 더 펼치지 않고 U에 더하지 않는다(BLUEPRINT-030의 절단과 같음). 재귀는 `properties`·`items`·`prefixItems`를 건너지 않는다.
2. **`type` 없이 `const`·`enum`만 있는 분기 없는 칸(BLUEPRINT-050, 정본 19C-02).** 리터럴의 JSON 종류(string·number·boolean·null, 정수는 number)를 모아 U를 만들고 30행 접기로 원시 잎·null 잎. 종류가 섞이거나 객체·배열 리터럴이면 `UNKNOWN_JSON_SCHEMA`(schemaPath와 `type`을 적으라는 안내). 분기 안의 `const`만 있는 분기(32행, E14)는 그대로 오류다.
3. **E16(BLUEPRINT-045 충돌 줄)**: object / `'object'` / false / NODE-028 순서(variant 호스트). E15·E14는 그대로.
4. **형 수준(NODE-059)**: 분기가 모두 인라인 객체(배열)인 형 없는 `oneOf`·`anyOf`는 `ObjectNode`(`ArrayNode`)와 분기 값 형의 합. `$ref`·게이트 분기·두 키워드 병존·`allOf`는 넓은 형 그대로. `const`·`enum` 칸은 리터럴 형.
5. **이주 행(LANDING-207·208)**, **ERROR-164·203 충돌 줄**(`UNKNOWN_JSON_SCHEMA`의 "언제" 재해석), **BLUEPRINT-037·039는 분할됨**(살아남은 문장은 BLUEPRINT-051·049).

## PR 02에서 해야 할 것 — TEST-079(정본 19C-01 28–30행, 19C-02 46–47행)

- `inferAllowedTypes.ts`: 분기별 object/array 거부를 지우고 ⊤ 거부만 남긴다; `foldAllowedTypes(U)`에 object나 array 비트가 있고 비트가 둘 이상이면 `UnknownJsonSchema`; discriminator로 게이트된 분기도 건너뛴다(지금은 `controls.active`만 건너뜀); `visiting`을 매개변수로 받아 `collectStaticSchemas`에 넘기고 경로에 있는 분기는 `groups`에 넣지 않는다(빈 parts를 ⊤로 오판하지 않게). 분기 없는 칸의 `const`·`enum` 리터럴 접기를 더한다. 같은 위치를 여러 번 추론하므로 schemaPath별 메모를 권한다(BLUEPRINT-030 "위치마다 한 번").
- 시험(`src/core/blueprint/__tests__/`): E16을 성공 목록으로(`blueprint.type-inference.test.ts:87`); 게이트 분기만인 호스트(여전히 오류), `{object,array}`(오류), ⊤ 분기(오류), 순환 절단과 빈 U, 형 없는 `$ref` 순환이 스택 넘침 없이 끝남(지금은 `Maximum call stack size exceeded`); `const` 칸의 단일 종류(null 포함)·종류 혼합·객체 리터럴·분기 안의 `const`(그대로 오류) 각 한 건.
- 코퍼스: TEST-067(b)를 시험 파일로 돌려 `spikes/guard-cost/redteam3/corpus.mjs` 14종이 **원본 그대로** 서야 한다. 통과하지 못하는 표본은 소유자에게 올린다.
- 공개 형: `src/core/types/node.ts`·`src/types/value.ts`의 `InferSchemaNode`·`InferValueType`을 NODE-059대로(인라인 분기만). 18C-89의 형 계획과 함께 PR-2·PR-7 몫이면 그 사실을 `log.md`에 적는다.
- 문서: `src/core/blueprint/DETAIL.md:9,40`과 `inferAllowedTypes.ts:57`의 안내 문구("untyped branches require explicit primitive types")를 새 규칙으로. `union.migration-shapes`에 LANDING-207·208 모양.
- 기록: `verification/02-foundation-and-blueprint/corpus-ledger-conflict.md`와 `integration-verification.md`의 TEST-067(b) 행에 "19라운드로 해소(BLUEPRINT-048·050)"를 덧붙이고, 통합 검증을 다시 돌려 그 결과로 판정한다.

원장과 다르게 읽히는 곳이 있으면 멈추지 말고 원장대로 가되, ID와 함께 `log.md`와 PR 본문에 적어라. 현행 항목 둘이 또 어긋나면 그때만 멈추고 올려라.
