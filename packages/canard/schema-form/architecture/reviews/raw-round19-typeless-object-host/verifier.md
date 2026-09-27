# verifier 보고(opus, 2026-09-27) — brief.md §5 대조

판정은 fail입니다. 아래 고친 결정문으로는 조건부 채택이 가능하지만, 소유자 물음 1건이 남습니다.

기준선: 청사진 단위 시험 12파일 127건이 통과합니다(vitest --project unit src/core/blueprint/__tests__). 검증은 파일을 쓰지 않고 `node --import tsx -e`로 `blueprint()`를 직접 호출해 확인했습니다.

## 축별 판정

A1 재귀: 결함 (D9 통과, D10 결함)
- pydantic Optional[discriminated](`spikes/guard-cost/redteam3/corpus.mjs:36`)에서 D9는 결과 하나로 끝납니다. 바깥 분기 0은 형이 없어 재귀하고, 안쪽 `oneOf`의 Cat·Dog은 {object}이며, 분기 1은 {null}입니다. 그래서 object이고 nullable입니다. 여기의 `discriminator`는 OpenAPI 키워드라 게이트가 아닙니다(`src/core/blueprint/DETAIL.md:11`, `utils/analyze/readDiscriminatorBranches.ts:33`는 `controls.discriminator`만 읽음).
- 재귀 트리(`corpus.mjs:210-212`)는 Leaf·Node에 `type:'object'`가 있어 S2로 끝나고 S3 재귀가 일어나지 않습니다. 순환은 배열 아이템이 끊습니다(`ledger/blueprint.md:482`). 루트와 `items`에 형을 넣어 모사하면 노드 5개로 섭니다(확인).
- D10 결함 1: 재귀는 이미 구현에 있지만 순환 절단이 없습니다. `inferAllowedTypes.ts:50`은 분기마다 `collectStaticSchemas`를 빈 `visiting`으로 새로 부릅니다(`collectStaticSchemas.ts:17-19`). 그래서 `T={anyOf:[{$ref:T},{type:'string'}]}`와 A↔B 상호 순환은 지금 `Maximum call stack size exceeded`입니다(확인, 30행 원시 규칙에도 있는 기존 결함).
- D10 결함 2: "순환이면 ⊤ → 오류"는 같은 칸의 조각 열거 규칙과 어긋납니다. 그 규칙은 같은 순환을 "더 펼치지 않는다, 존재(합집합)가 바뀌지 않기 때문"이라고 정합니다(`ledger/blueprint.md:477-478`, `reviews/round-18-closing.md:20-21`, 구현 `collectDeclarations.ts:25`). 허용 집합도 합집합이므로 같은 절단이 정합합니다. D10대로면 한 스키마가 조각 열거는 통과하고 형 판정에서만 오류가 됩니다.
- `RECURSIVE_SHAPE_UNBOUNDED`와 겹치지 않습니다. D9는 `properties`·`items`를 건너지 않고, UNBOUNDED는 프로퍼티 사슬의 형상 순환입니다(`ledger/blueprint.md:481`). 다만 새 결과가 하나 생깁니다. pydantic `Optional[Self]`(`next:{anyOf:[{$ref:N},{type:'null'}]}`)는 오늘 UNKNOWN이고, 새 규칙에서는 nullable object 호스트가 되어 `RECURSIVE_SHAPE_UNBOUNDED`입니다(모사로 확인). nullable은 순환을 끊지 않으므로(`blueprint.md:482`) TEST-067(c)와 맞지만, 이주 행에 적어야 합니다.

A2 게이트 가진 분기: 결함
- 30행 원문은 게이트 제외를 원시 접기에 한정하지 않고, 형 없는 칸 전체에 둡니다. 첫 문장이 "정적 연언에 `type`을 가진 선언이 없는 칸은 칸의 게이트 없는 `oneOf`·`anyOf` 분기를 보며"로 칸 전체를 범위로 잡습니다. 이어서 "게이트 가진 분기(…)는 이 합치기에 넣지 않고 게이트 선언의 규칙을 따른다"고 씁니다(`reviews/round-18-owner-answers.md:30`, `ledger/blueprint.md:646,654`, `merged-v3.md:144,153`).
- U4도 같은 뜻입니다. 게이트 가진 분기는 종류·`schemaType`·`nullable`을 바꾸지 않습니다(`owner-answers.md:37`, `ledger/blueprint.md:719`). 따라서 D1이 게이트 분기를 종류 판정에 넣는 것은 소유자 확정 원리와 충돌합니다.
- 초안 안에서도 모순이 있습니다. 게이트 없는 {string}에 `controls.active` 게이트 {object}가 붙으면, D1+D6은 청사진 오류입니다. 30행은 string 잎이 되고, 켜진 동안 `SHARED_NODE_CONFLICT`가 납니다(`closing.md:2402`). D7이 "30행 그대로"라고 해도 D6이 먼저 걸립니다.
- 소유자 원문도 "30행이 원시 분기에 한 것처럼 형을 모아서"라고 합니다. 코퍼스는 `controls`를 쓰지 않으므로 게이트 분기를 넣을 필요가 없습니다.
- 고친 뒤의 결과: `controls.discriminator` 분기만 가진 형 없는 호스트는 "게이트 없는 분기가 없음"으로 계속 UNKNOWN입니다(오늘도 UNKNOWN, 확인).
- 구현 편차(기존): `inferAllowedTypes.ts:48`은 `controls.active` 분기만 건너뛰고, discriminator로 게이트된 분기는 건너뛰지 않습니다.

A3 배열만인 경우: 통과
- 근거: S4 "칸이 object·array이면 기존 variant 규칙을 따른다"(`closing.md:2400`, `ledger/blueprint.md:821`), 결과 목록의 "variant 호스트"(`closing.md:2414`), 소유자 원문의 "객체만이거나 배열만이면".
- 서로 다른 `items`를 합치는 규칙도 이미 있습니다. 게이트 없는 분기끼리 fold가 같으면 노드 하나(`closing.md:2405`)이고, 다르면 `SHARED_NODE_KIND_CONFLICT`(`closing.md:2950`, `ledger/blueprint.md:841`)입니다.
- 확인: `{type:'array', oneOf:[{type:'array',items:{type:'string'}},{type:'array',items:{type:'number'}}]}`는 오늘 `SHARED_NODE_KIND_CONFLICT at #/oneOf/1/items`입니다. 형 없는 배열 호스트는 D5로 이와 같은 결과가 됩니다. 축소안은 필요 없습니다.

A4 판정 절차의 자리: 결함
- 틀은 맞습니다. S3는 "30·32·33행을 따른다"(`closing.md:2397`)이고, S6 순서(`closing.md:2409`, NODE-028 `ledger/node.md:424`, NODE-042 (2) `node.md:626`)와도 어긋나지 않습니다. 호스트의 분기는 overlay라서 전략 셈에 들지 않습니다(`resolveNodeStrategy.ts:22-27`).
- 결함 1: "반드시 하나의 결과"(`closing.md:2390`)가 깨집니다. F={object,array}(원시 없음)는 D3·D4·D6·D7 어디에도 들지 않습니다. D6은 "원시와 함께"만 다룹니다. 33행은 "다른 종류와 섞인 경우" 전부를 오류로 둡니다.
- 결함 2: D1·D2는 `'null'`을 먼저 떼고 합치거나 교집합합니다. D3은 "어느 분기에라도 null이면 nullable"입니다. 이는 "`'null'`은 합치고 교집합한 뒤에야 떼어 낸다"(`owner-answers.md:30`, `ledger/blueprint.md:650`, E33)와 다릅니다. 반례로 `{oneOf:[{type:'object'},{type:'null'}], anyOf:[{type:'object'}]}`는 30행으로 nullable false이고, D3으로 true입니다. 원시판 같은 모양은 오늘 nullable false입니다(확인).
- 결함 3: D1(게이트 포함 집합)과 D7(게이트 제외 집합)이 한 단계에 두 집합을 둡니다(A2).
- 결함 4: D5는 S4 가운데 "형 있는 칸의 null 분기는 nullable을 켜지 않고"(`closing.md:2399`)가 이 칸에 적용되지 않는다고 밝혀야 합니다.
- 결함 5: D12는 전략 칸에 "variant 호스트"를 넣었습니다. 전략은 E8처럼 "NODE-028 순서"입니다(`ledger/blueprint.md:859`).

A5 형 수준: 결함
- 18C-89의 형 수준 문장(`closing.md:2352-2358` = NODE-058 `ledger/node.md:988-994`)은 "`$ref`, 게이트 가진 분기, `oneOf`와 `anyOf`가 함께 있는 칸, 본체에 붙은 `allOf`는 넓은 `SchemaNode`와 오늘 규칙의 값 형"으로 둡니다(`:2358`). 코퍼스의 pydantic·OpenAPI 분기는 모두 `$ref`입니다. D13의 "객체 형으로 추론"은 이 문장과 충돌합니다.
- D13은 대체 대상인 `:2357`(`node.md:993`)의 "모든 분기가 객체(또는 배열)인 형 없는 칸은 `never`와 `unknown`"을 적지 않았습니다.
- 현재 코드: 형 없는 `oneOf`의 `InferValueType`은 `any`입니다. `T extends {type: infer Type}`가 거짓이라 `AnyValue`를 내고(`packages/winglet/json-schema/src/types/value.ts:145-153`), `AnyValue = any`입니다(`:8`). `InferSchemaNode`는 `ObjectSchema`가 `type:'object'`를 요구하므로(`winglet/json-schema/src/types/jsonSchema.ts:259`) 넓은 `SchemaNode`입니다(`src/core/types/node.ts:26-41`). 18C-89의 형 수준 계획(`never`/`unknown`, `UnionNode`)은 아직 구현되지 않았습니다.

A6 뒤집히는 범위: 결함 (누락)
초안이 적은 것은 BLUEPRINT-039의 한 구절과 E16, LANDING 새 행뿐입니다. 전체 목록은 아래와 같습니다.
1. BLUEPRINT-039 제목(`ledger/blueprint.md:677`)과 결정 첫 문장의 "객체만·배열만인 경우(오늘과 같음)가 모두 여기에 든다"(`:680`). 정본은 `owner-answers.md:33`입니다.
2. BLUEPRINT-045 E16(`blueprint.md:867`). 정본은 `closing.md:2431`입니다.
3. [누락] NODE-058 `node.md:993`(`closing.md:2357`)의 "모든 분기가 객체(또는 배열)인 형 없는 칸은 never와 unknown".
4. [누락] ERROR-203 `error.md:3006`과 ERROR-164 보충 `error.md:2460`(`closing.md:2458`)의 "형 없는 칸의 빈 U와 객체·배열 분기(`:30`·`:33`)". 행 본문 `error.md:2405`는 "언제"를 적지 않으므로 그대로입니다.
5. [누락] TEST-077 `test.md:1291`(E1–E42 표대로)은 E16의 기대가 바뀝니다. `test.md:1312`(migration-shapes가 LANDING-173–180 모양을 덮음)에는 새 이주 행을 더해야 합니다.
6. [누락] BLUEPRINT-044 S3의 출처 `blueprint.md:818`에 새 결정을 더해야 합니다.
7. 구현 시험 `src/core/blueprint/__tests__/blueprint.type-inference.test.ts:87`(E16 UNKNOWN 기대). 구현 문서 `src/core/blueprint/DETAIL.md:9,40`. 안내 문구 `utils/types/inferAllowedTypes.ts:57`("untyped branches require explicit primitive types").
8. 정본 설계 `reviews/raw-round18-union-swarm/merged-v3.md:151`(R8), `:211`(E16). 근거 문장 `closing.md:2468`의 "out-V2 지적 1(형 없는 객체·배열 호스트를 새로 받아들이지 않음)". 이 둘은 원문을 두고 새 결정이 대체함을 기록합니다.
9. LANDING-174(`ledger/landing.md:2533`)는 원시 전용이라 그대로입니다. D14는 새 행입니다. LANDING-128(`landing.md:1952`)에 Optional[Self]가 UNBOUNDED로 바뀜을 보충해야 합니다.

A7 값 의미: 통과 (조건 1)
- 분기가 모두 켜지는 것은 GOAL-027 "명시 없는 `oneOf`·`anyOf`는 모든 분기가 켜진다"(`ledger/goal.md:458`)와 맞습니다.
- `kind` 재선언은 같은 이름·같은 종류이므로 노드 하나입니다(BLUEPRINT-010, `ledger/blueprint.md:202`). 둘 이상의 분기가 선언하면 제약(`const`)은 유효 스키마에 기여하지 않고 검증기가 판정합니다(`DETAIL.md:10`).
- 호스트에 형을 넣어 모사하면 `kind,meow,bark` 등 자식이 명시 호스트와 같게 섭니다(확인). D5로 명시 호스트와 결과가 같고, 파이프라인은 `group.allowed`만 봅니다(`buildNodes.ts:39-53`).
- 다른 점은 하나이며 의도된 것입니다. 형 없는 호스트의 null 분기는 nullable을 켜고(30행), 명시 `{type:'object', anyOf:[…,{type:'null'}]}`는 nullable false입니다(확인, `closing.md:2399`). E13과 E22의 관계와 같습니다. D5에 적어야 합니다.

A8 구현 거리: 통과 (새 fractal·큰 재구성 불필요)
- `utils/types/inferAllowedTypes.ts:48`: discriminator 게이트 분기도 건너뜁니다(`readDiscriminatorBranches` 결과나 호스트의 `controls.discriminator`).
- `:50-61`: 분기별 object/array 거부를 지우고, ⊤ 거부(`!types`)만 남깁니다.
- `:64-67` 뒤: `foldAllowedTypes(U)`에 object나 array 비트가 있고 비트가 둘 이상이면 `UnknownJsonSchema`를 던지고, 아니면 U를 돌려줍니다.
- 순환 절단: `inferAllowedTypes`에 `visiting`을 매개변수로 더해 `collectStaticSchemas(context, branch, path, visiting)`로 넘깁니다. 분기 위치나 그 `$ref` 대상이 경로에 있으면 그 분기를 건너뜁니다(`groups`에 넣지 않음). 빈 parts를 ⊤로 오판하지 않게 해야 합니다.
- 바뀌지 않는 곳: `buildNodes.ts:39-53`(['object']→object, 'null'→nullable), `collectDeclarations.ts:150-154`(분기 조각), `resolveNodeTypes.ts:50-55,64-68,88-92`(호출처).
- 비용: 같은 위치를 여러 번 추론합니다(`resolveNodeTypes.ts:51,64,88`, `readDiscriminatorBranches.ts:69`). 재귀가 더해지므로 `AnalysisContext`에 schemaPath별 메모를 권합니다(BLUEPRINT-030 "위치마다 한 번").
- 시험: `blueprint.type-inference.test.ts:84-94`에서 E16을 성공 목록으로 옮기고, F={object,array}·게이트 분기만·순환 절단 사례를 더합니다. `blueprint.recursion.test.ts`에는 코퍼스 14종 시험이 없으므로 새로 둡니다(`DETAIL.md:72`는 요구함). 문서는 `DETAIL.md:9,40`입니다.
- 형: `src/core/types/node.ts:26-41`, `src/types/value.ts:19-25`. 18C-89 형 계획과 함께 PR-2·PR-7입니다.

## 축 밖 발견 X1: 소유자 물음 (D15 게이트가 도달 불가)
호스트 형을 D3대로 넣어 모사하면 14종 가운데 12종만 섭니다. 나머지 두 종은 호스트와 무관하게, 형 없는 `const`만 있는 태그 칸에서 실패합니다.
- OpenAPI-3.1 `type:[object,null]`(`corpus.mjs:113`)은 `UNKNOWN_JSON_SCHEMA at #/$defs/Cat/properties/kind`입니다.
- hand anyOf overlapping(`corpus.mjs:194-196`)은 `UNKNOWN_JSON_SCHEMA at #/properties/pet/anyOf/0/properties/kind`입니다.
원인은 30행 첫 문장 "분기가 없으면 `UNKNOWN_JSON_SCHEMA`"와 32행(O2)입니다. 호스트에 명시 형이 있어도 같습니다(확인). 18C-01은 (b)가 실패하면 소유자에게 올리라고 정합니다(`closing.md:51`).
- 선택지 가: `const`·`enum`만 있는 선언의 종류를 리터럴의 JSON 종류로 정하는 규칙을 더합니다. 14종이 원본 그대로 설 수 있습니다. 다만 O2의 "`type`을 적으라"와 결이 달라 새 소유자 결정이 필요하고, E14와의 정합을 다시 봐야 합니다.
- 선택지 나(권장, 원장 정합): TEST-067(b)를 원본 12종과, 태그에 `type`을 더한 이주 모양 2종으로 좁히고 소유자 승인을 기록합니다. 원본 2종은 태그 칸의 `UNKNOWN_JSON_SCHEMA`가 기대값이 됩니다.

## 고친 결정문
- D1. S3(정적 연언 C에 `type`이 없는 칸)는 소유자 답 30행의 절차 그대로 칸의 게이트 없는 `oneOf`·`anyOf` 분기의 허용 집합 A(b)를 합쳐 키워드마다 U를 만들고(`'null'` 포함), `oneOf`와 `anyOf`가 함께 있으면 두 U를 교집합한 것을 U로 하며, 그 뒤에야 `'null'`을 떼어 F = fold(U \ {null})를 만든다.
- D2. 게이트 가진 분기(분기 안의 `controls.active`, `controls.discriminator`로 변환된 분기)는 소유자 답 30행과 37행의 U4대로 U에 넣지 않고 게이트 선언의 규칙을 따르며, 게이트 없는 분기가 없으면 `UNKNOWN_JSON_SCHEMA`다.
- D3. F가 `{object}`이면 칸은 object 종류이고 `schemaType`은 `'object'`이며, nullable은 `'null'` ∈ U와 같다.
- D4. F가 `{array}`이면 칸은 array 종류이고 `schemaType`은 `'array'`이며, nullable은 D3과 같다.
- D5. D3·D4로 종류가 정해진 칸은 그 뒤 S4의 variant 규칙과 S6의 순서(`options.terminal` → 판정 → `type`)를 자기 `type`을 명시한 칸과 똑같이 따르되, S4의 "형 있는 칸의 null 분기는 nullable을 켜지 않는다"는 이 칸에 적용하지 않는다(nullable은 D3이 정한다).
- D6. F의 원소가 둘 이상이고 그 가운데 `object`나 `array`가 있으면 `UNKNOWN_JSON_SCHEMA`다(`object`와 `array`만 섞인 경우 포함, 소유자 답 33행의 혼합 규칙과 E15는 그대로다).
- D7. F에 `object`나 `array`가 없으면 소유자 답 30행의 원시 접기를 그대로 적용한다(게이트 가진 분기를 제외하는 규칙 포함).
- D8. 허용 집합이 ⊤인 분기(`const`·`enum`만 있는 분기 포함)가 있으면 F를 만들기 전에 소유자 답 32행대로 `UNKNOWN_JSON_SCHEMA`다.
- D9. 분기 b의 A(b)는 b의 정적 연언(b 본체, 게이트 없는 `allOf`, `$ref` 대상)에 S2를 적용한 결과이고, b의 정적 연언에 `type`이 없으면 b에 D1–D8을 재귀 적용해 얻은 U(`'null'`을 떼기 전)이며, 재귀에서 난 오류는 그대로 낸다.
- D10. D9의 재귀가 지금 펼치는 경로에 이미 있는 스키마 위치(분기 위치나 그 `$ref` 대상)에 다시 닿으면 그 분기는 더 펼치지 않고 U에 아무것도 더하지 않으며(BLUEPRINT-030의 조각 안 순환 절단과 같다), 그 결과 U가 비면 소유자 답 30행대로 `UNKNOWN_JSON_SCHEMA`다. D9의 재귀는 `properties`·`items`·`prefixItems`를 건너지 않으므로 `RECURSIVE_SHAPE_UNBOUNDED`의 판정과 겹치지 않는다.
- D11. 이 결정은 소유자 답 33행의 "객체만·배열만인 경우(오늘과 같음)가 모두 여기에 든다", BLUEPRINT-039의 제목과 그 문장, BLUEPRINT-045 E16, NODE-058(18C-89 `reviews/round-18-closing.md:2357`)의 "모든 분기가 객체(또는 배열)인 형 없는 칸은 `never`와 `unknown`이다", ERROR-203과 ERROR-164 보충(18C-90 `reviews/round-18-closing.md:2458`)의 "형 없는 칸의 빈 U와 객체·배열 분기"를 대체하고, 뒤의 것은 "형 없는 칸의 빈 U와 객체·배열이 다른 종류와 섞인 분기"로 읽는다. 같은 답의 "object variant 호스트는 건드리지 않는다"와 혼합 금지는 그대로이며, BLUEPRINT-044 S3의 출처에 이 결정을 더한다.
- D12. E16은 "자기 형 없는 `{oneOf:[{type:'object',…},{type:'object',…}]}`는 object / `'object'` / false / NODE-028 순서(variant 호스트)"로 바뀌고, TEST-077의 `union.kind-procedure.test.ts` 줄은 바뀐 E16을 단언한다.
- D13. `InferSchemaNode`·`InferValueType`은 D1–D10을 비추어, 분기가 모두 인라인 객체(또는 배열) 스키마인 형 없는 `oneOf`·`anyOf`를 `ObjectNode`(또는 `ArrayNode`)로 두고, 값 형은 분기 값 형의 합(null 분기가 있으면 `| null`)으로 둔다. 18C-89의 "`$ref`, 게이트 가진 분기, `oneOf`와 `anyOf`가 함께 있는 칸, 본체에 붙은 `allOf`는 넓은 `SchemaNode`와 오늘 규칙의 값 형"과, 형 없는 분기를 재귀로 가진 칸의 넓은 형은 그대로다.
- D14. 이주 행(LANDING): 형 없는 객체 분기 `oneOf`·`anyOf`(pydantic·zod·OpenAPI·TypeBox)는 오늘 `UNKNOWN_JSON_SCHEMA`(`extractSchemaInfo.ts:23`이 `type` 없으면 `null`)이고, 새 설계에서는 object variant 호스트다. pydantic `Optional[Self]`처럼 이 호스트가 게이트 없는 객체 프로퍼티 순환을 이루면 실패 코드가 `UNKNOWN_JSON_SCHEMA`에서 `RECURSIVE_SHAPE_UNBOUNDED`로 바뀐다(LANDING-128 보충). TEST-077의 `union.migration-shapes` 목록에 이 행을 더한다.
- D15. 게이트: E16의 새 기대와 D2(게이트 분기만)·D6(`object`+`array` 포함)·D8·D10(순환 절단과 빈 U)의 사례가 `src/core/blueprint/__tests__/`에 한 건씩 있어야 한다. TEST-067(b)는 코퍼스 시험 파일로 돌리며, 통과 조건은 소유자 물음 X1의 답을 따른다. 가이면 원본 14종 그대로이고, 나이면 원본 12종 그대로와 태그에 `type`을 더한 2종이며, 원본 2종은 태그 칸의 `UNKNOWN_JSON_SCHEMA`를 기대한다.

## 확인하지 못한 것
- 새 규칙을 실제로 구현해 돌리지는 않았습니다. 코퍼스 결과는 호스트에 D3대로 형을 넣은 모사이며, D5에 따라 동치로 봅니다(`buildNodes.ts`는 `allowed`만 봄).
- 형 수준 변경은 tsc로 확인하지 않았습니다.
- HANDOFF §3과 그 37행 선례 문서는 열지 않았습니다. 브리프의 인용과 `owner-answers.md:37`의 "검증해보고 정합하면 권장안 채택하세요"만 확인했습니다.
- D8의 ⊤ 검사가 게이트 가진 분기에도 걸리는지는 32행이 정하지 않으므로 초안 문장을 그대로 두었습니다. 지금 구현은 `controls.active` 분기를 먼저 건너뜁니다(`inferAllowedTypes.ts:48`).
