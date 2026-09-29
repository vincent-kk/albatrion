# 01·02 보정 — 실행 계획과 기록

Planning method: 저장소 지침 — `PLAN.md` §2의 한 PR 순서와 `plan/01-design-docs/log.md`의 형식(머리·목표·단위·위험·기록·어긋남, 문서 옮김은 그 §2.2 규칙). 단위마다의 단계·명령·기대 결과는 seiri `write-plan`의 불변식으로 채운다. 게이트 원장은 `.seiri/tasks/schema-form-01-02-realign/gates.md`.

정본의 순서: 원장 `ledger/<area>.md` > 25라운드 닫는 글(`reviews/round-25-closing.md`) > 계획서 > 이 기록. 이 기록이 원장과 다르면 원장대로 가고 §6에 적는다. 원장 줄 번호는 25라운드 커밋으로 밀리므로 이 기록은 원장을 ID로 인용한다.

계획 검증: 1차(2026-09-29) verifier `rework-required` — 높음 넷(G10·G5·G6이 진술을 증명하지 못함, U3·G8이 보충을 보지 못함), 중상 둘(U4·판정 11이 원장 원문 인용을 바꿈), 중 다섯(G3의 커밋 판정, 범위 규칙, 계약 범위, details 표, DETAIL 순서), 낮음 둘(내부 불일치, 빠진 위험 다섯). 모두 이 판에 반영했다. 범위 규칙은 원장 관리 세션이 25C-03에 확정했다(§5, 회신 5). 범위 한정 재확인(verifier)은 13건 가운데 11건 해결, 새 결함 N1–N7을 냈고 모두 반영했다(§5). seiri 규칙대로 두 번째 전체 검토는 하지 않고, 고친 자리를 이 세션이 grep과 `check-25c.mjs` 실행으로 확인했다. **판정: `cleared`**.

## 0. 머리

- 까닭: 02 기반+청사진(#347, 2026-09-27 머지)이 01 설계문서(#348, 2026-09-29 머지)보다 먼저 들어왔다. 병렬은 소유자 선택(LANDING-060 보충)이라 순서 자체는 원장 위반이 아니다. 그러나 02는 01이 원장에 더한 충돌 줄·보충을 보지 못했고, 01은 02가 정한 사실을 원장에 올리지 못했다. 2026-09-29 점검(verifier·scout)이 그 틈 16건을 찾았다.
- 목적: (1) 순서의 틈을 닫아 01을 "머지(절 통과 대기)" 단계로 넘긴다. (2) 02가 빠뜨린 PR-1 작업을 원장대로 맞춘다.
- 브랜치 `fix/schema-form-realign-01-02`, base와 PR base `1.0.0-beta`(`b733bd8a6`).
- 원장 판정: 원장 관리 세션 `albatrion-f8`이 16건을 판정했다(2026-09-29). (a) 원장이 이미 정함, (b) 25라운드 편집자 결정 25C-01~11, (c) 소유자 물음 없음.
- 분담: 원장 관리 세션은 `ledger/*.md`, `ledger/README.md`, `reviews/round-25-closing.md`, `HANDOFF.md`, `PLAN.md` §5를 쓴다. 이 세션은 그 밖(코드, `design/`, `adr/`, `ledger/checks/doc-token-exempt.tsv`, `plan/**`, `PLAN.md` §3·§4, `architecture/README.md`)을 설계하고, worker가 적용하고, verifier가 게이트를 대조한다.
- 커밋 규칙(같은 작업 트리를 두 세션이 쓴다): 모든 커밋은 경로를 지정한 `git commit -- <paths>`로 한다. `git commit -a`, `git add -A`, `git add .`는 쓰지 않는다.
- 범위 규칙(U2 명세 1)은 원장 관리 세션이 25C-03에 확정했다(회신 5). 멈춤은 풀렸다.

## 1. 판정과 할 일

| # | 발견 | 판정 | 이 PR의 일 | 단위 |
| --- | --- | --- | --- | --- |
| 1 | 판별 선언 교차 공집합의 코드 | (b) 25C-01: `EMPTY_ENUM_INTERSECTION` 유지, ERROR-164·FRAGMENT-048 보충 | 코드 없음. 설계문서가 보충을 옮긴다 | U1, U3 |
| 2 | 원장이 이름 든 게이트 시험 여섯 | (b) 25C-02·25C-11: 단언이 규범, 이름은 주소. PR-1 몫과 PR 03 몫의 나눔 | PR-1 몫의 단언을 채움 | U1, U2 |
| 3 | TEST-014 `extras` 정적 집합 | (a) VALUE-002·SCHEMA-040·FRAGMENT-047·LANDING-122. 명시 구조 불요, 두 경계를 단언 | 경계 시험 추가(코드는 이미 성립) | U2 |
| 4 | 선언 하나의 역전 범위·`enum: []`가 청사진 오류 | (a) SCHEMA-006·ERROR-164·BLUEPRINT-016, 보충 25C-03: 오류는 둘 이상의 기여를 교차한 결과가 공집합일 때만 | `applyConstraintKeywords` 고침과 시험(멈춤 조건 있음) | U2 |
| 5 | 런타임 형 교집합 공집합 → `enum: []` | (a) BLUEPRINT-016·041·044, 02 사실 25C-04: 형 공집합은 정착 오류 `SHARED_NODE_CONFLICT`(PR 03이 던짐). `enum`·`const` 공집합은 SCHEMA-045대로 `enum: []` | `mergeEffectiveSchema`가 `{ schema, typeConflict }`를 돌려줌 | U2 |
| 6 | 값 모양 오류가 `UNKNOWN_GROUP_KEY` | (b) 25C-05: 새 `INVALID_CONTROL_SHAPE`, 기록은 schemaPath와 `{ group, key, expected }` | 코드 상수·`validateControlGroups`·시험 | U1, U2 |
| 7 | changeset 대 루트 `CLAUDE.md` | (a) TEST-054·055, LANDING-097: 원장이 이김 | 이 기록 §6에 한 줄 | — |
| 8 | 청사진 형태가 BLUEPRINT-002 스케치와 다름 | (b) 25C-06: BLUEPRINT-026으로 수용, 뜻이 같다는 조건(기록 수준에서 성립, 평가는 PR 03) | 보충을 설계문서에 옮기고 평가를 `plan/03`에 적음 | U1, U3, U4 |
| 9 | 잎 교차 fractal 이름 | (b) 25C-07: LANDING-061·081·091 보충 | 결정 문장은 그대로, 곁에 보충을 옮김 | U1, U3 |
| 10 | 시나리오 패키지 이름·경로 | (b) 25C-08: TEST-008·010·011, LANDING-090 보충. `diagnostics`는 PR 03 | 보충을 옮기고 `plan/03`에 적음 | U1, U3, U4 |
| 11 | `design/07`의 "착수 전 닫을 것" | 원장은 닫힘. 25C-07이 안건 A·B의 집을 LANDING-061 보충으로 적음 | 칸은 그대로 두고 곁에 25C-07 보충을 옮김 | U1, U3 |
| 12 | `plan/03` "ADR 0013 결정 1" | (a) WRITE-001, 예외 WRITE-052 | 인용은 그대로, 밖에 가리킴을 덧붙임 | U4 |
| 13 | `plan/07`·`plan/09` "ADR 0009 §4" | (a) TEST-027 | 인용은 그대로, 밖에 가리킴을 덧붙임 | U4 |
| 14 | 새 문서의 옛 경로 | 그대로(기준 커밋 `ba398c330`, 25C-10) | `architecture/README.md`에 한 줄 | U4 |
| 15 | 절 통과 없이 머지 | (b) 25C-09: 위반 아님, "머지(절 통과 대기)" | `PLAN.md` §3·§4 | U5 |
| 16 | 순서 기록 | (b) 25C-10: LANDING-060 보충으로 사실만 | 이 기록과 `plan/README.md` | U1, U5 |

## 2. 계약 결정 — 유효 스키마의 형 충돌 신호

`mergeEffectiveSchema`는 청사진 진입점의 공개 이름이며 오늘 `BlueprintSchema`를 돌려준다. 판정 5와 25C-04대로 반환을 고정된 결과 기록 `EffectiveSchema { schema: BlueprintSchema; typeConflict: boolean }`로 바꾼다. 같은 노드·같은 활성 집합이면 같은 기록 참조를 돌려준다. 최종 모양은 PR 03이 정한다. 근거·대안·비용은 `realign-adr.md`에 있다.

## 3. 작업 단위

| 단위 | 무엇 | 누가 | 끝의 증거(게이트) |
| --- | --- | --- | --- |
| U0 | 착수: ADR 생성기·개요·검사 스크립트를 작업 폴더에 둠, 계획 커밋 | 이 세션 | G1, G2 |
| U1 | 25라운드 원장 기록과 커밋 | `albatrion-f8` | G3, G4 |
| U2 | 청사진 코드와 시험. 판정 2·3·4·5·6. `DETAIL.md`가 첫 코드 커밋에 함께 들어감 | worker 적용, verifier 게이트 | G5–G8 |
| U3 | 설계문서가 25라운드 보충을 옮김, ADR 재생성 | worker 적용, verifier 대조 | G9–G11 |
| U4 | 계획서의 끊긴 참조, `plan/03`에 넘긴 것, 옛 경로 안내 | worker | G12 |
| U5 | 상태판과 기록: `PLAN.md` §3의 01 상태 칸을 `머지(절 통과 대기)`로(25C-09), §4, `plan/README.md`, 01 `log.md` §5, 이 기록 | 이 세션 | G13, G14 |
| Final | 패키지 test·lint·typecheck, 원장·문서 검사, filid 스캔, verifier 전체 대조, PR | worker·verifier | G15–G19 |

순서: U0 → U1(원장이 먼저) → U2와 U4는 병렬 → U3(U1 커밋 뒤) → U5 → Final. U2의 새 오류 코드 문자열은 25C-05의 ERROR-164 행을 그대로 쓴다.

### U2 명세 (worker 브리프의 원천)

경로는 `packages/canard/schema-form/src/core/blueprint/` 기준. 새 시험은 고치기 전 코드에서 먼저 돌려 실패를 확인한다. 실패한 시험 이름은 §5 표에 단위 칸 `U2`, 무엇 칸이 `U2 red:`로 시작하는 행으로 적는다. 이미 성립하는 동작(판정 2·3의 대부분)을 단언하는 시험은 실패하지 않으며, 그 사실을 같은 행에 적는다.

0. **`DETAIL.md` 먼저(filid).** 코드보다 먼저, 그리고 브랜치의 첫 청사진 코드 커밋에 함께 넣는다.
   - `DETAIL.md:12`(controls·options 닫힌 목록): 닫힌 목록 밖 키는 `UNKNOWN_GROUP_KEY`, 목록 안 키의 값 모양 오류는 `INVALID_CONTROL_SHAPE`.
   - `:19`(유효 스키마 병합): "정적 연언 공집합"을 "둘 이상의 기여를 교차한 결과가 공집합"으로 좁힌다. 선언 하나의 역전 범위와 리터럴 `enum: []`은 검증기 몫이다. 형 교집합이 비면 `enum: []`을 적지 않고 `typeConflict`로 드러낸다.
   - `:20`(참조 동일성): "활성 집합이 같으면 유효 스키마 참조도 같다"를 결과 기록 단위로 바꾼다.
   - `:73`(diagnostics): 새 코드 `INVALID_CONTROL_SHAPE`를 사례 목록에 더한다.
   - `INTENT.md`에는 `mergeEffectiveSchema` 언급이 없으므로 고치지 않는다.
1. **판정 4 — 범위와 enum(25C-03).** `utils/effectiveSchema/utils/applyConstraintKeywords.ts`를 고친다. 이 규칙은 유효 스키마의 키워드 교차에만 걸린다. 판별 키의 `const`·`enum` 모으기(`utils/analyze/readDiscriminatorBranches.ts:88-96`, FRAGMENT-048)는 25C-03 밖이며, 기여 하나의 값이 이미 비어도 `EMPTY_ENUM_INTERSECTION`이다. 그 경로는 고치지 않는다.
   - 범위 쌍은 (`minimum`/`maximum`), (`exclusiveMinimum`/`exclusiveMaximum`), (`minLength`/`maxLength`), (`minItems`/`maxItems`), (`minProperties`/`maxProperties`)마다 따로 한 키워드로 본다(25C-03 최종 문구, `reviews/round-25-closing.md:33`). 세 조건이 모두 맞을 때만 `INVALID_RANGE`를 던진다: **이 기여가 그 쌍의 경계를 하나라도 적고**, **이 기여 전에 target에 그 쌍의 경계가 하나라도 있으며**, 합친 결과가 역전이다. 포함 경계와 배타 경계를 섞어 비교하지 않는다(오늘과 같음). `RANGES`(`applyConstraintKeywords.ts:17-24`)에서 `['minContains', 'maxContains']`를 뺀다(FRAGMENT-051: 폼이 읽지 않음).
   - `enum`은 target과 source 모두에 있을 때만 `EMPTY_ENUM_INTERSECTION`을 던진다. `:88-89`의 `length === 0` 조건을 트리거에서 지운다.
   - 시험: 선언 하나의 `{ minimum: 5, maximum: 3 }`와 `{ enum: [] }`는 청사진 오류가 없고 값이 그대로 남는다. 기존 `mergeEffectiveSchema.test.ts`의 `{ minimum: 5 }`+`{ maximum: 2 }` → `INVALID_RANGE`는 그대로 초록이다. 정적 모드의 `[{ minimum: 5, maximum: 3 }, { description: 'x' }]`는 뒤 기여가 쌍을 적지 않으므로 오류가 없다. `[{ minimum: 5, maximum: 3 }, { minimum: 1 }]`은 세 조건이 맞으므로 `INVALID_RANGE`다. 두 `enum` 기여의 교차가 비면 여전히 오류다.
2. **판정 5 — 결과 기록.**
   - `type.ts`: `export interface EffectiveSchema { readonly schema: BlueprintSchema; readonly typeConflict: boolean }`를 더하고, `EffectiveSchemaCacheEntry.schemas`를 `Map<string, EffectiveSchema>`로 바꾼다. 문서 주석은 seiri code-comments §3·§4대로 둔다.
   - `index.ts`: 형 `EffectiveSchema`를 이름으로 내보낸다. 소비자는 PR 03이고 시험이 지금 쓴다(seiri public-contract §1).
   - `utils/effectiveSchema/utils/ensureEffectiveSchemaCache.ts`: 반환을 `Map<string, EffectiveSchema>`로 바꾼다.
   - `utils/effectiveSchema/utils/finalizeEffectiveSchema.ts`: `schema.enum = []`은 `conflictingConst`일 때만 쓰고, `Object.freeze({ schema: Object.freeze(schema), typeConflict: state.conflictingType })`를 돌려준다. `:31`의 `schema.type` 선택은 그대로다.
   - `utils/effectiveSchema/utils/mergeSchemaContributions.ts:41`: `false` 선언의 조기 반환은 모듈 상수 `FALSE_EFFECTIVE_SCHEMA = Object.freeze({ schema: false, typeConflict: false })`로 한다(같은 참조, 매번 할당하지 않음).
   - `utils/effectiveSchema/mergeEffectiveSchema.ts`: 반환 형을 `EffectiveSchema`로 바꾸고, 문서 주석의 `@returns`를 고친다.
   - `utils/analyze/buildNodes.ts:68`: 정적 모드 호출이며 반환을 쓰지 않으므로 형만 따른다.
   - 시험 네 파일은 반환의 `.schema`를 읽도록 고친다: `__tests__/mergeEffectiveSchema.test.ts`, `__tests__/blueprint.type-gated-declarations.test.ts`, `__tests__/blueprint.strategy-regression.test.ts`, `__tests__/blueprint.fragments.test.ts`. 그 가운데 형 충돌에 `enum: []`을 단언하는 자리(`blueprint.type-gated-declarations.test.ts:92`, `mergeEffectiveSchema.test.ts:174`, `:314`)는 `typeConflict === true`이고 `enum`이 없다는 단언으로 바꾼다(25C-04).
   - 새 시험: 게이트 선언으로 형 교집합이 비는 활성 집합(E40)에서 `typeConflict === true`이고 `schema.enum`이 없다. `const` 충돌은 `enum: []`로 남는다. 같은 활성 집합의 두 호출은 같은 기록 참조다.
3. **판정 6 — 값 모양 코드.** `utils/diagnostics/constant.ts`에 `InvalidControlShape: 'INVALID_CONTROL_SHAPE'`를 더한다. `utils/diagnostics/validateControlGroups.ts`의 경우별 (코드, schemaPath, details)는 아래와 같다. `children` 항목의 키 목록은 `controls`·`options`·`children[].controls`의 닫힌 목록이 아니므로 모양 오류다.

   | 경우 | 코드 | schemaPath | details |
   | --- | --- | --- | --- |
   | 그룹 값이 객체가 아님 | `InvalidControlShape` | `<path>/<group>` | `{ group, key: group, expected: 'object' }` |
   | 닫힌 목록 밖 키 | `UnknownGroupKey` | `<path>/<group>/<key>` | `{ group, key }`(그대로) |
   | `injectTo`가 함수가 아님 | `InvalidControlShape` | `<path>/controls/injectTo` | `{ group: 'controls', key: 'injectTo', expected: 'function' }` |
   | `children`이 배열이 아님 | `InvalidControlShape` | `<path>/controls/children` | `{ group: 'controls', key: 'children', expected: 'array' }` |
   | `children` 항목의 모양(객체 아님, `targets`·`controls` 밖 키, `targets`가 문자열 배열 아님) | `InvalidControlShape` | `<path>/controls/children/<i>` | `{ group: 'controls', key: 'children', expected: '{ targets: string[], controls? }' }` |
   | `controls.discriminator`가 비어 있지 않은 문자열이 아님(`utils/analyze/readDiscriminatorBranches.ts:40-46`, 오늘은 `DiscriminatorMismatch`) | `InvalidControlShape` | `<path>/controls/discriminator` | `{ group: 'controls', key: 'discriminator', expected: 'string' }` |

   `DISCRIMINATOR_MISMATCH`는 키가 어느 분기에도 없음, 분기끼리 종류가 다름, 분기 사이 값이 겹침 셋에만 남는다(25C-01, 25C-05). 시험은 경우마다 하나씩 두고, 코드와 details를 모두 단언한다. 판별 키 모양을 `DiscriminatorMismatch`로 단언하던 기존 시험은 새 코드로 바꾼다.
4. **판정 2 — 25C-11이 PR-1에 둔 단언.**
   - `__tests__/blueprint.type-schema-type-invariant.test.ts`(새): E1–E42 전 칸과 코퍼스 14종의 모든 청사진 노드에서 `Array.isArray(schemaType) === (kind === 'union')`이고, 배열이면 `Object.isFrozen`이다. TEST-077 불변식의 둘째(노드·배열 아이템의 같은 참조)는 PR 03 몫이다(25C-02, 25C-11).
   - null-only: 모두 `'null'`인 정적 연언(`{ type: 'null', allOf: [{ type: 'null' }] }`)이 null 노드다.
   - static-intersection: 정적 연언의 모든 선언 쌍을 두 순서로 넣어 같은 결과가 나온다. E23만 `ALL_OF_TYPE_REDEFINITION`이다.
   - gated-narrowing: E25·E26·E41에서 게이트 전후 `schemaType` 참조가 같다. E40은 `typeConflict === true`다(명세 2 뒤). E42는 참조 동일성으로 단언한다.
   - terminal-subtree-warning: `['object', 'string']` union 호스트의 `properties` 안 `controls`가 경고 1회, `$ref` 대상은 경고 없음.
   - kind-procedure: E27·E40·E42의 kind·strategy를 모두 단언한다.
   - PR 03으로 넘기는 넷(25C-11, U4에서 `plan/03`에 적음): 노드·배열 아이템의 `schemaType` 참조 동일성, virtual 코퍼스의 `node.type` 여덟 값, `onChange` 형 검사, 유효 목록 좁힘.
   - 픽스처는 기존 시험의 것을 다시 쓰고, 새 단언은 기존 파일의 해당 `describe`에 더한다(새 파일은 불변식 하나).
5. **판정 3 — extras 경계.** 코드는 이미 성립한다(§5의 debugger 확인). `__tests__/blueprint.fragments.test.ts`에 두 경계를 단언한다. (가) `controls.active` 분기, 일반 `oneOf`·`anyOf` 분기, 판별 분기, `then`·`else`에만 선언된 이름이 호스트의 `childEntries`에 있다. (나) `if` 안에만 적힌 키는 `childEntries`에 없다.

### U3 명세

- 시작 조건: 원장 관리 세션의 25라운드 커밋(G3).
- `doc-coverage.mjs`는 토큰을 결정 칸에서만 읽으므로 보충을 보지 못한다. 보충은 `check-25c.mjs`가 잰다: 원장의 모든 `> 편집자 결정(25C-nn): "…"` 줄에서 서로 다른 인용 글(앞 40자, 【추론】 표지 뒤)을 모아, 설계문서에 있는지 센다.
- 옮기는 법은 01 `log.md` §2.2 규칙 5와 같다. 보충의 원문을 같은 항목 ID로 결정 곁에 옮긴다. 【추론】 표지는 규칙 8대로 둔다. 같은 글이 여러 항목에 붙었으면 한 문서 안에서 집에 한 번 옮기고 ID를 모두 단다. 옮기지 않는 보충(결정과 같은 문장의 되풀이, 원장 자신에 대한 정비 문장)은 `work/u3-exclusions.tsv`에 `앞 40자<TAB>까닭` 한 줄로 적는다. 까닭은 `되풀이` 또는 `정비 문장`으로 시작해야 하며(콜론 뒤에 설명), 검사는 제외한 줄을 모두 출력한다.
- 알려진 자리:
  - `design/01`: BLUEPRINT-002·016·017·026·041·044, SCHEMA-006·045, FRAGMENT-048
  - `design/05`: ERROR-159·ERROR-164의 보충. 새 코드 `INVALID_CONTROL_SHAPE`는 25C-05 보충(ERROR-164)에만 있으므로, 그 보충을 옮기면서 ERROR-164의 코드 표에도 규칙 3의 표 모양 그대로 한 행을 더한다. 25C-01 보충은 ERROR-159에도 붙었으므로 그 거울 자리(`design/05:342`, `:680`)가 따라간다.
  - 25C-07의 잎 교차 내보내기는 `EMPTY_INTERSECTION`과 함수 여섯, 모두 일곱 이름이다.
  - `design/07`: LANDING-060·061·081·090·091, TEST-008·010·011·077. 결정 문장 "이름은 PR-1이 정한다"와 "착수 전 닫을 것" 칸은 그대로 두고, 곁에 25C-07 보충을 둔다.
  - `design/00`: PROCESS-062
  - `design/02`: NODE-058, WRITE-099
- `doc-coverage`는 결정 칸의 토큰만 잰다. 25라운드의 새 글은 모두 보충이라 `check-25c.mjs`(G9)와 `INVALID_CONTROL_SHAPE`의 `design/05` 존재 검사(G10)가 잰다. 옮김으로 생긴 예외는 `ledger/checks/doc-token-exempt.tsv`에 규칙 4의 까닭으로 적는다.
- ADR은 설계문서에서 생성한다. 작업 폴더(`.seiri/tasks/schema-form-01-02-realign/work/`: 생성기 둘과 개요 `NN-outline.tsv` 여덟)의 `build-adr.mjs`로 `adr-next/`에 만든다(`architecture/`에서 `node <W>/build-adr.mjs adr-next`). `verify-adr.mjs <W>`의 실패가 기준선 세 줄뿐이면 `adr/`의 `0001`–`0017`을 그것으로 바꾸고 `adr-next/`를 지운다. 손으로 고치지 않는다. 설계문서의 절이 새 원장 ID를 인용하면, 그 절의 개요 행(`NN-outline.tsv` 셋째 칸)에 ID를 더해야 ADR 소속이 따라온다.
- 기준선(2026-09-29, 고치기 전): 생성 결과가 `adr/`와 글자 그대로 같다. `verify-adr`는 `FAILS 3`이고, 셋 모두 `[1] adr/0015…0017: computed 0 vs §2.4 undefined`다. 검사 [1]은 옛 ADR 0001–0014만 있던 이동 전 `adr/`를 전제하므로, 이 세 줄은 이동 뒤에 생기는 알려진 결과다.
- verifier가 고친 절만 두 방향(원장 → 문서, 문서 → 원장)으로 대조한다.

### U4 명세

- 원장 원문을 옮긴 인용은 바꾸지 않고, 밖에 가리킴을 덧붙인다(25C-10과 같은 방식).
  - `plan/03-node-and-settle/request.md:92`: "ADR 0013 결정 1의 이름 붙은 예외"(WRITE-052 제목) 뒤에 "(→ WRITE-001, WRITE-052)"를 붙인다.
  - `plan/07-switch/verification.md:27`과 `plan/09-release-and-cleanup/verification.md:22`: 인용 "ADR 0009 §4와 같은 기록·수용 규칙"(TEST-075)의 닫는 따옴표 뒤에 "(→ TEST-027)"을 붙인다. 따옴표 안은 한 글자도 바꾸지 않는다.
- `plan/03-node-and-settle/request.md`에 "02·01 보정에서 넘어온 것" 절을 둔다. 각 줄에 원장 ID를 단다.
  - `EffectiveSchema.typeConflict`를 읽어 `SHARED_NODE_CONFLICT`를 던진다(25C-04, BLUEPRINT-016).
  - 판별 게이트를 `./<key>`의 값이 `values`에 드는가로 평가한다. 분기 `controls.active`와 AND 하나로 합치고, 다른 게이트와 같은 호스트 바퀴에서 평가한다(25C-06, FRAGMENT-048, BLUEPRINT-017).
  - `ScenarioExpectation.diagnostics`(25C-08, TEST-009, TEST-011).
  - 25C-11이 PR 03으로 넘긴 넷.
- `architecture/README.md`에 한 줄을 더한다: "새 설계문서·ADR이 드는 옛 문서 경로는 기준 커밋 `ba398c330`의 것이며 지금은 `_archive/2026-09-29/` 아래에 있다(25C-10)."

## 4. 위험과 대응

- ADR 생성기·개요·검사 스크립트는 작업 폴더에 있다. 이 폴더도 git이 무시하고(`.seiri/.gitignore:5`), 72시간 동안 손대지 않으면 지워진다. 위험을 옮겼을 뿐이다. 이 PR이 끝날 때까지 작업 폴더를 매일 쓰고, PR 전에 생성기를 저장소 어디에 둘지(원장 관리 세션과 함께) 정해 §6에 적는다.
- 같은 작업 트리를 원장 관리 세션과 함께 쓴다. §0의 분담과 경로 지정 커밋 규칙을 지킨다. 원장 관리 세션의 커밋(G3) 전에는 U3을 시작하지 않는다.
- `yarn install`은 소유자 승인으로 2026-09-29에 돌렸다(lockfile 불변, `@storybook/addon-vitest` 설치). 청사진·잎 교차 기준선: `npx vitest run --project unit src/core/blueprint src/helpers/schemaIntersection` 61파일 528건 초록. storybook 프로젝트가 브라우저(playwright chromium)를 요구해 G15에서 실패하면 원인을 기록하고 소유자에게 묻는다.
- 판정 5의 반환 변경은 청사진 진입점의 계약을 바꾼다. 소비자는 `index.ts`, `buildNodes.ts`, 시험 네 파일뿐이다. `src/__legacy__`와 다른 패키지에는 없다(verifier 저장소 전체 grep, 2026-09-29).
- G11이 실패하면 `adr-next/`가 트리에 남는다. 다시 돌리기 전에 지운다(CHECK의 첫 동작).

## 5. 진행 기록

| 시각 | 단위 | 무엇 | 결과 |
| --- | --- | --- | --- |
| 2026-09-29 | — | 점검(verifier·scout), 브랜치 생성, 원장 관리 세션에 16건 질의와 판정 수신 | 소유자 물음 없음 |
| 2026-09-29 | U0 | debugger 확인: 게이트 여섯 모두 부분 충족(빈칸은 U2 명세 4). extras 두 경계는 코드로 성립(`collectDeclarations.ts:117-180`, `:151`), 단언 시험은 일부만. 판별 게이트는 평가기 없이 기록만(`type.ts:26`), 뜻 셋은 기록 수준에서 성립(`readDiscriminatorBranches.ts:126-129`, `collectDeclarations.ts:35-48`, `type.ts:29,64`). 원장 관리 세션에 회신, 물음 A(PR-1·PR-2 나눔) | 물음 A 대기 |
| 2026-09-29 | U0 | 원장 관리 세션 회신 3: 물음 A는 이 계획의 읽기대로 25C-11에 확정. 닫는 글의 블록은 25C-01 판별 공집합 코드, 02 시험 이름은 주소, 03 공집합 판정은 둘 이상 기여, 04 런타임 형 충돌 신호(`{ schema, typeConflict }`, 최종 모양은 PR 03), 05 `INVALID_CONTROL_SHAPE`, 06 `type.ts` 수용(평가는 PR 03), 07 `schemaIntersection`과 닫힌 안건, 08 시나리오 이름, 09 01 상태, 10 머지 순서 기록과 옛 경로 표기, 11 여섯 이름 대응표와 PR 배분. 보충이 붙는 항목: ERROR-164, FRAGMENT-048, TEST-077, BLUEPRINT-044·016·041·002·017·026, SCHEMA-045·006, LANDING-061·081·091·090·060, TEST-008·010·011, PROCESS-062, NODE-058, WRITE-099 | 원장 커밋 대기 |
| 2026-09-29 | U0 | `yarn install`(소유자 승인), ADR 생성기·개요 복사, 생성 결과가 `adr/`와 같음 확인, `check-25c.mjs` 작성(원장 작업 트리에서 인용 32건, 설계문서 0건) | 기준선 기록 |
| 2026-09-29 | U0 | 계획 검증 1차 `rework-required`(13건) 반영. 범위 규칙 확인과 분담 조정(예외 파일, 경로 지정 커밋)을 원장 관리 세션에 요청 4로 보냄 | 요청 4 회신 대기 |
| 2026-09-29 | U0 | 원장 관리 세션 회신 5: 25C-03 범위 쌍 읽기 확정, 판별 키 모으기는 25C-03 밖. 원장 게이트에서 더한 것 — 판별 키 모양도 `INVALID_CONTROL_SHAPE`(25C-05), TEST-077 둘째 불변식은 PR 03(25C-02), 25C-01 보충이 ERROR-159에도, 25C-07 내보내기 일곱 이름, 형 충돌 `enum: []` 단언 세 자리를 `typeConflict`로. U2·U3 명세에 반영 | 원장 커밋 대기 |
| 2026-09-29 | U1 | 원장 관리 세션이 25라운드를 `51edc4037`로 커밋(경로 지정, 검증자 게이트 PASS, 검사 전부 0, 토큰 잔여 484, `25C-` 보충 줄 52). 25C-03 최종 문구(쌍마다 따로, 이 기여가 그 쌍을 적을 때만, `minContains`/`maxContains` 제외)와 BLUEPRINT-016의 판별 경로 예외 인용을 U2·U3 명세에 반영. 이 커밋과 회신 5가 요청 4의 답이다 | U1 끝 |
| 2026-09-29 | U0 | 계획 재확인(범위 한정) `rework-required`: 13건 가운데 해결 11, 부분 2. 새 결함 N1–N7 반영 — N1(범위 세 조건, 쌍 묶음, `minContains` 제외, 뒤 기여 시험 둘)은 원장 커밋 문구로 이미 고침, N2 G13을 `머지(절 통과 대기)`로, N3 G10에 `design/05`의 `INVALID_CONTROL_SHAPE` 검사, N4 G12를 두 겹 백틱으로, N5 제외 까닭을 `되풀이`·`정비 문장`으로 제한, N6 ERROR-159 자리·`DETAIL.md:20`·예외 파일 소유(회신 5에서 확정), N7 닫는 따옴표 뒤 | 판정 아래 |

## 6. 어긋남

| # | 어디 | 무엇 | 현행 원장 | 어떻게 했다 |
| --- | --- | --- | --- | --- |
| 1 | 루트 `CLAUDE.md:91` | "this repository does not use changesets or CHANGELOG files"인데 02는 `.changeset/common-utils-merge-policies.md`를 더했다 | TEST-055, TEST-054, LANDING-097 | 원장이 이긴다. 루트 `CLAUDE.md:91`은 LANDING-097 PR에서 바뀐다. 그때까지 `.changeset/`은 config 없이 파일만 쌓인다 |
