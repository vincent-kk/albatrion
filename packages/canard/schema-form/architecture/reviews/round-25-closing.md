# 25라운드 닫기 — 02(청사진, #347)와 01(설계문서, #348)의 어긋남 16건

2026-09-29. 보정 PR `fix/schema-form-realign-01-02`의 작업자가 물었다: 02 코드가 01 설계문서보다 먼저 머지되어 원장·문서·코드 사이에 어긋남 16건이 있다(코드 방향을 정하는 해석 8, 02가 정한 사실 3, 끊긴 참조 3, 과정 2). 모두 현행 항목과 소유자 답에서 유도되므로 소유자 물음 없이 원장 관리자가 닫는다(PROCESS-066). 소유자가 어느 결정이든 뒤집으면 그 답이 이긴다. 원장이 이미 정한 것(`extras` 정적 규칙은 VALUE-002, 런타임 `enum`·`const` 공집합은 SCHEMA-045, changeset은 TEST-055·TEST-054, 옛 "ADR 0013 결정 1"은 WRITE-001·WRITE-052, 옛 "ADR 0009 §4"는 TEST-027, 시나리오 `diagnostics` 단언은 TEST-009)은 항목 번호로 답했고 여기에는 다시 적지 않는다.

### 25C-01 한 분기 안 판별 선언의 공집합은 정적 연언의 오류 코드 하나 — `EMPTY_ENUM_INTERSECTION`

- 닫는 항목: ERROR-164(보충), FRAGMENT-048(보충), ERROR-159(보충)
- 결정:
  - 【추론】 한 분기의 정적 연언 안에서 판별 키의 `const`·`enum` 교차가 공집합이면 오류 코드는 ERROR-164의 정적 연언 행(`EMPTY_ENUM_INTERSECTION`)이며 `DISCRIMINATOR_MISMATCH`가 아니다.
  - 【추론】 `DISCRIMINATOR_MISMATCH`는 키가 어느 분기에도 없음, 분기끼리 종류가 다름, 분기 사이 값이 겹침 셋만이다.
  - 【추론】 ERROR-164 `DISCRIMINATOR_MISMATCH` 행의 "선언 사이 값이 다름"은 별도 코드가 아니라 정적 연언 행의 사건을 판별 관점에서 적은 것이다.
  - 【추론】 두 코드의 details 모양은 원장이 정하지 않았고, 02의 `EMPTY_ENUM_INTERSECTION` details `{ propertyName }`(schemaPath는 오류 자리)와 `DISCRIMINATOR_MISMATCH` details `{ propertyName, reason: 'kind' | 'overlap' | 'missing' }`을 그대로 받는다.
- 근거: FRAGMENT-048 "한 분기에서 모은 `const`·`enum`은 정적 연언의 교차로 합친다", "교차가 공집합이면 정적 연언의 청사진 오류다" — 사건의 자리는 정적 연언이고, 같은 스키마는 유효 스키마의 정적 교차(BLUEPRINT-016)에서도 같은 공집합을 만나므로 코드가 둘이면 어느 걸음이 먼저 닿는가에 따라 코드가 달라진다. ERROR-043·ERROR-159의 충돌 줄이 "선언 사이 값이 다름"의 집을 ERROR-164 `DISCRIMINATOR_MISMATCH` 행으로 둔 것은 뜻의 대응이며 코드의 지정이 아니다. 구현 `src/core/blueprint/utils/analyze/readDiscriminatorBranches.ts:88-96`과 시험 `src/core/blueprint/__tests__/blueprint.discriminator.test.ts:174`는 이 결정과 같다.

### 25C-02 원장이 든 시험 파일 이름은 주소, 단언이 게이트

- 닫는 항목: TEST-077(보충), BLUEPRINT-044(보충)
- 결정:
  - 【추론】 BLUEPRINT-044와 TEST-077이 든 `union.*.test.ts` 여섯 이름은 단언의 주소이며 규범이 아니다. 단언이 게이트다.
  - 【추론】 02의 `src/core/blueprint/__tests__/blueprint.type-*.test.ts` 이름은 그대로 두고, 여섯 이름과 실제 파일의 대응은 25C-11에 적는다.
  - 【추론】 TEST-077의 "모든 코퍼스 칸에서 `Array.isArray(schemaType) === (type === 'union')`이고, 같은 칸의 노드와 배열 아이템이 같은 `schemaType` 참조를 가지며, 그 참조는 `Object.isFrozen`이다"는 게이트이며, 칸의 범위는 E1–E42 전 칸과 TEST-067(b) 코퍼스 14종의 전 칸이다.
  - PR: 보정 PR(`fix/schema-form-realign-01-02`)
  - 무엇: 위 불변식을 전 칸에 대는 시험을 더한다. 파일 이름은 원장 토큰이 검색되게 `blueprint.type-schema-type-invariant.test.ts`를 권한다.
  - 통과: 전 칸에서 첫째(`Array.isArray(schemaType) === (kind === 'union')`)와 셋째(`Object.isFrozen`)가 참이다. 둘째(노드와 배열 아이템의 같은 참조)는 노드 트리가 있어야 재므로 PR 03이 단언한다(25C-11).
  - 실패: 청사진을 고친다.
- 근거: TEST-079 "게이트(PR 02): E16의 새 기대와 게이트 분기만인 호스트·`{object,array}`·⊤ 분기·순환 절단과 빈 U의 사례가 `src/core/blueprint/__tests__/`에 한 건씩 있고"처럼 19라운드부터 게이트는 자리와 단언으로 적었고 파일 이름은 들지 않았다. 02의 시험은 `blueprint.type-gated-declarations`·`blueprint.type-inference`·`blueprint.type-inference-round19`·`blueprint.type-static-intersection`·`blueprint.type-syntax`로 주제별로 나뉘어 있고 단언은 그대로 옮길 수 있다. 다만 불변식 단언은 E1–E9 루트에만 있어 "모든 코퍼스 칸"에 못 미친다.

### 25C-03 공집합 판정은 둘 이상의 기여를 교차한 결과에만

- 닫는 항목: SCHEMA-045(보충), BLUEPRINT-016(보충), SCHEMA-006(보충), FRAGMENT-048(보충)
- 결정:
  - 【추론】 청사진 오류 `INVALID_RANGE`·`EMPTY_ENUM_INTERSECTION`·`CONFLICTING_CONST_VALUES`는 정적 연언에서 둘 이상의 기여가 같은 키워드를 적어 교차한 결과가 공집합일 때만 난다.
  - 【추론】 기여 하나만 적은 `{ minimum: 5, maximum: 3 }`나 `{ enum: [] }`는 교차가 아니므로 그대로 두고 검증기가 기각한다. 범위의 하한·상한 쌍(`minimum`/`maximum`, `exclusiveMinimum`/`exclusiveMaximum`, `minLength`/`maxLength`, `minItems`/`maxItems`, `minProperties`/`maxProperties`)은 쌍마다 한 키워드로 보아, 그 기여가 그 쌍의 경계를 하나라도 적고, 그 기여 전에 target에 그 쌍의 경계가 하나라도 있으며, 합친 결과가 역전일 때만 `INVALID_RANGE`다.
  - 【추론】 리터럴 `enum: []`는 공집합 표시가 아니며, 공집합은 잎 함수가 `EMPTY_INTERSECTION`을 돌려준 경우만이다. 이 셋은 유효 스키마의 키워드 교차에만 걸리고, 판별 키의 `const`·`enum` 모으기는 FRAGMENT-048대로 키워드를 가리지 않고 교차하며, 기여 하나의 값이 이미 비어도(`{ enum: [] }`, `{ const: 'a', enum: ['b'] }`) `EMPTY_ENUM_INTERSECTION`이다(25C-01).
- 근거: SCHEMA-006 "범위·패턴·`enum`·`const`(`controls.discriminator` 아래만 예외). 이것들은 검증기에 그대로 간다"; ERROR-164 행 "청사진 분석(정적 연언의 교차)"; BLUEPRINT-016 "교차 공집합 — 정적 연언은 청사진 오류로 throw"; 레거시도 `allOf` 병합 때만 던졌다. 구현 `src/core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts:66-75, 82-99`는 노드마다 static 모드로 돌며 기여 하나의 값도 판정하고 `enumeration.length === 0`을 공집합으로 읽으므로 고친다.

### 25C-04 런타임 형 교집합의 공집합은 `enum: []`이 아니라 정착 오류의 신호

- 닫는 항목: SCHEMA-045(보충), BLUEPRINT-041(보충)
- 결정:
  - 【추론】 SCHEMA-045의 `enum: []` 표현은 `enum`·`const`의 런타임 공집합에만 쓴다.
  - 【추론】 켜진 게이트 선언의 `type`과 정적 허용 집합의 교집합이 비면 유효 스키마는 `enum: []`을 적지 않고 형 충돌을 결과에 드러내며, 그 게이트들이 켜진 동안의 정착 오류 `SHARED_NODE_CONFLICT`는 PR 03(정착)이 던진다.
  - 【추론】 보정 PR은 그 신호를 `mergeEffectiveSchema`의 반환 `{ schema, typeConflict }`로 드러내고(형 충돌이면 `typeConflict: true`, `schema.type`은 정적 `schemaType`, `enum`은 적지 않음, 같은 활성 집합이면 같은 참조), 최종 모양은 PR 03이 정한다.
- 근거: BLUEPRINT-041 "빈 교집합만 충돌(정적은 청사진 오류, 게이트는 켜진 동안의 정착 오류), 정적 선언이 종류·`schemaType`·`nullable`을 정하고 게이트는 유효 목록만 좁힘"; BLUEPRINT-016의 충돌 줄 "`type`은 켜진 게이트 선언과 정적 허용 집합의 교집합이 비면 그 게이트들이 켜진 동안의 정착 오류(`SHARED_NODE_CONFLICT`)다"; BLUEPRINT-044 S5. 구현 `src/core/blueprint/utils/effectiveSchema/utils/finalizeEffectiveSchema.ts:38`은 `conflictingType`도 `enum: []`로 적으므로 고친다.

### 25C-05 값 모양 오류의 코드 — (가칭) `INVALID_CONTROL_SHAPE`

- 닫는 항목: ERROR-164(보충)
- 결정:
  - 【추론】 ERROR-164에 오류 행 (가칭) `JSON_SCHEMA_ERROR.INVALID_CONTROL_SHAPE`(`error`, 청사진 분석: `controls`·`options`·`children[].controls`의 닫힌 목록 안 키의 값 모양이 선언과 다름 — 그룹이 객체가 아님, `injectTo`가 함수가 아님, `children`이 배열이 아님, `children` 항목의 모양 — 기록에 schemaPath와 `{ group, key, expected }`, 청사진 오류와 같음, 새 설계에만)을 더한다.
  - 【추론】 `UNKNOWN_GROUP_KEY`는 닫힌 목록 밖 키에만 쓴다.
- 근거: ERROR-164 `UNKNOWN_GROUP_KEY` 행 "청사진 분석: controls·options·children[].controls의 닫힌 목록 밖 키" — 모양 오류는 이 뜻 밖이고 원장에 다른 코드가 없다(`INVALID_CONTROL*` 0건). 구현 `src/core/blueprint/utils/diagnostics/validateControlGroups.ts:32-37, 52-57, 60-65, 77-81`이 모양 오류에 `UNKNOWN_GROUP_KEY`를 쓰므로 새 코드로 바꾸고 `:40-45`만 남긴다. `src/core/blueprint/utils/analyze/readDiscriminatorBranches.ts:40-46`(`controls.discriminator` 값이 빈 문자열이 아닌 문자열이 아님)도 닫힌 목록 안 키의 값 모양 오류이며 25C-01의 `DISCRIMINATOR_MISMATCH` 세 경우 밖이므로 같은 새 코드(`{ group: 'controls', key: 'discriminator', expected: 'string' }`)로 바꾼다.

### 25C-06 청사진 구조체의 실제 모양은 내부 구조 — 02의 `type.ts`를 받는다

- 닫는 항목: BLUEPRINT-002(보충), BLUEPRINT-017(보충), BLUEPRINT-026(보충)
- 결정:
  - 【추론】 BLUEPRINT-002의 스케치(`guard`·`constrains`·`inherited`)와 BLUEPRINT-017의 "`SchemaFragment.guard`에 든 `controls.active` 식"은 뜻의 서술이며, 02의 `src/core/blueprint/type.ts`(`SchemaFragment`의 `gates`·`overlays`·`inheritedOverlays`, 숫자 `id`, 게이트 `{ kind: 'if' | 'active' | 'discriminator', condition }`)가 그 구현이다(BLUEPRINT-026).
  - 【추론】 받는 조건은 뜻이 같은 것이다: 판별 게이트는 `./<key>`의 값이 `values`에 드는가로 평가되고, 분기 자신의 `controls.active`와 AND 하나로 합쳐지며, 다른 `controls.active` 게이트와 같이 호스트 바퀴에서 평가된다.
  - 【추론】 02에는 게이트 평가기가 없고 조건을 기록만 하므로(`type.ts`의 `BlueprintGate`, `gates`는 모두 성립해야 하는 조건의 목록), 평가는 PR 03이 이 뜻대로 한다.
  - 【추론】 설계문서의 스케치 문장은 원장 문장이라 그대로 두고, 이 보충을 곁에 적는다.
- 근거: BLUEPRINT-026 "청사진의 구체적 형태는 내부 구조여서 바꾸기 쉽다"; FRAGMENT-048 "분기가 자기 `controls.active`도 가지면 그 분기의 게이트는 `(변환식) && (분기 식)` 하나다"; BLUEPRINT-017 "변환된 게이트는 다른 `controls.active`와 같이 호스트 바퀴에서 평가된다".

### 25C-07 02가 정한 사실 — 잎 교차 fractal의 이름과 닫힌 안건의 집

- 닫는 항목: LANDING-061(보충), LANDING-081(보충), LANDING-091(보충)
- 결정:
  - 【추론】 잎 교차 함수의 새 fractal은 `src/helpers/schemaIntersection/`이고, 공집합 표시는 `EMPTY_INTERSECTION`(Symbol)이며, `EMPTY_INTERSECTION`과 함께 이름으로 내보내는 함수는 `intersectConst`·`intersectEnum`·`intersectMaximum`·`intersectMinimum`·`intersectMultipleOf`·`validateRange` 여섯이고, `intersectPattern`은 SCHEMA-043대로 레거시에 남는다.
  - 【추론】 LANDING-061 표의 "착수 전 닫을 것"은 모두 닫혔다: 안건 A는 18라운드(BLUEPRINT-030·BLUEPRINT-041·SCHEMA-040·FRAGMENT-047), 안건 B는 CONTROLS-080, 전환 방식의 세부는 LANDING-159·LANDING-205, N14는 NODE-047이 닫았다.
- 근거: LANDING-061 "이름은 PR-1이 정한다" — 02(#347, `3d94a046f`)가 정했다. 닫힌 안건의 집은 LANDING-061·LANDING-091의 충돌 줄(전환 방식)과 LANDING-079의 충돌 줄(N14), CONTROLS-080의 닫은 사람(18C-13)에 이미 있고, 안건 A는 18라운드 닫는 글의 해당 블록이 각 항목을 닫았다.

### 25C-08 02가 정한 사실 — 시나리오 패키지의 이름

- 닫는 항목: TEST-008(보충), TEST-010(보충), TEST-011(보충), LANDING-090(보충)
- 결정:
  - 【추론】 시나리오 데이터 모듈의 자리는 `packages/aileron/schema-form-scenarios/src/<부류>/<이름>.scenario.ts`이며 TEST-023의 `src/**/*.scenario.ts` 안이다.
  - 【추론】 시나리오 감싸개는 `ScenarioForm`, 핸들 등록은 `registerScenarioHandle`, 핸들 찾기는 `findScenarioHandle`이다.
  - 【추론】 `ScenarioExpectation`은 `shape`·`outputValue`·`values`·`errors` 넷으로 시작하고, `diagnostics`는 코어 러너(TEST-009)를 만드는 PR 03이 더한다.
- 근거: TEST-010 "이름은 편집자가 형제 이름을 따라 정한다"(소유자 답 8); LANDING-090 "시나리오 감싸개와 핸들 등록 포함"; TEST-011 "필요하면 PR마다 더한다". 정의는 `packages/aileron/schema-form-scenarios/src/components/ScenarioForm.tsx:11`, `src/utils/registerScenarioHandle.ts:14`, `src/utils/findScenarioHandle.ts:13`, `src/types.ts:4`에 있다.

### 25C-09 설계문서 01의 상태 — 머지(절 통과 대기), 완료는 머리 표 전부 통과

- 닫는 항목: PROCESS-062(보충), LANDING-060(보충)
- 결정:
  - 【추론】 설계문서 PR(01, #348)은 2026-09-29에 머지되었고 8편 머리 표 192절은 대기이므로 PLAN의 상태는 "머지(절 통과 대기)"로 적는다.
  - 【추론】 01의 완료는 8편 머리 표의 모든 절이 통과가 되는 때이며, 통과는 머지된 문서 위에서 표 행을 바꾸는 후속 커밋으로 한다.
  - 【추론】 24라운드 소유자 답은 편집자 결정에 대한 동의이지 절 단위 통과가 아니므로 표에 옮기지 않는다.
- 근거: PROCESS-062 반영 칸 "가. 절 단위 통과는 새 설계문서에서만 한다. 08·09는 통과 절차 없이 백업으로 간다"; LANDING-060 반영 칸 "기반 PR과 병렬이며 코드 PR을 막지 않는다" — 머지가 통과보다 앞서도 어긋남이 아니다. 소유자 물음이 아닌 까닭: 통과 자체는 소유자가 읽는 행위이고 상태 표기는 편집자 몫이다.

### 25C-10 02가 01보다 먼저 머지된 것의 기록과 옛 경로 인용의 표기

- 닫는 항목: LANDING-060(보충), `ledger/README.md`(기준 커밋 절에 한 줄)
- 결정:
  - 【추론】 02(#347)는 2026-09-27에, 01(#348)은 2026-09-29에 머지되었고, 병렬은 소유자 선택(LANDING-060 반영 칸)이라 순서는 위반이 아니다.
  - 【추론】 01이 코드를 보지 않고 원장에서 쓰여 생긴 어긋남 16건은 이 라운드와 보정 PR `fix/schema-form-realign-01-02`가 닫으며, 새 과정 규칙은 두지 않는다.
  - 【추론】 새 ADR·설계문서·research가 옛 문서를 `path:line`으로 인용할 때 경로는 기준 커밋 `ba398c330`의 것이며 지금 자리는 `_archive/2026-09-29/` 아래다; 문장은 바꾸지 않고 출처 표 머리에 그 한 줄을 적는다.
- 근거: LANDING-060 "설계문서 8편·ADR 재작성·역검사 `doc-coverage`·옛 문서의 `_archive/` 이동·소유자 절 단위 통과는 별도 설계문서 PR로 `1.0.0-beta`에 연다"; `ledger/README.md` "기준 커밋: `ba398c330`. 이 원장이 인용하는 `path:line`은 모두 이 커밋의 줄 번호다"; 검사는 `ledger/checks/lib.mjs`의 `ARCHIVE_ROOT`로 그 자리를 안다. 설계문서의 인용 문장은 원장 문장의 거울이라 경로를 바꾸면 원문 검사가 깨진다.

### 25C-11 원장의 시험 여섯 이름과 02 파일의 대응 — 빠진 단언의 PR 배분

- 닫는 항목: TEST-077(보충), BLUEPRINT-044(보충), NODE-058(보충), WRITE-099(보충)
- 결정:
  - 【추론】 E1–E42는 `src/core/blueprint/__tests__/`의 네 파일에 있다: `blueprint.type-syntax.test.ts`(E1–E10, E28), `blueprint.type-inference.test.ts`(E11–E17, E29, E32–E35), `blueprint.type-static-intersection.test.ts`(E18–E24, E30, E31, E36–E39), `blueprint.type-gated-declarations.test.ts`(E25–E27, E40–E42).
  - 【추론】 `union.kind-procedure.test.ts`의 단언은 위 네 파일의 표 행과 `blueprint.type-gated-declarations.test.ts`의 정적 소유자 없는 분기 접기 충돌 사례에, `union.null-only.test.ts`는 위 표 행에, `union.static-intersection.test.ts`는 `blueprint.type-static-intersection.test.ts`에, `union.schema-type-invariant.test.ts`는 `blueprint.type-syntax.test.ts`의 E1–E9 불변식에, `union.gated-narrowing.test.ts`는 `blueprint.type-gated-declarations.test.ts`에, `union.terminal-subtree-warning.test.ts`는 `blueprint.diagnostics.test.ts`와 `blueprint.type-syntax.test.ts`의 E28에 있다.
  - 【추론】 여섯 모두 부분 충족이며, 보정 PR(`fix/schema-form-realign-01-02`)이 채우는 것: 모두 `'null'`인 정적 연언이 null 노드인 사례, 모든 선언 쌍의 순서 무관 전수 교집합, 코퍼스 전 칸의 `Array.isArray(schemaType) === (kind === 'union')`과 동결, 게이트 전후 `schemaType` 참조 동일성, E40의 형 충돌 신호(25C-04), E42의 참조 동일성, `['object','string']` union 호스트의 터미널 경고 1회와 `$ref` 대상 무경고, E27·E40·E42의 종류와 전략 전부 단언.
  - 【추론】 PR 03으로 넘기는 것: virtual 코퍼스의 `node.type` 여덟 값 수집, `onChange` 형 검사, 노드와 배열 아이템의 `schemaType` 참조 동일성, 유효 목록 좁힘의 단언 — 모두 노드 트리가 있어야 잰다.
- 근거: 25C-02(이름은 주소). 배분의 기준은 잴 대상이 청사진만으로 있는가다 — 청사진 노드의 종류·`schemaType`·동결·경고·형 충돌 신호는 지금 있고, 런타임 노드의 `type`, `onChange` 형, 노드·아이템 참조, 유효 목록은 PR 03의 노드 트리가 만든다(NODE-058 "유효 목록", TEST-077의 렌더 시험 줄).

### 25C-12 같은 노드의 선언 사이에 판별 키가 다름 — `DISCRIMINATOR_MISMATCH`의 넷째 경우, 25C-01의 둘째·셋째 문장을 고쳐 읽는다

- 닫는 항목: ERROR-164(보충), ERROR-159(보충), SCHEMA-013(보충)
- 결정:
  - 【추론】 한 노드에 모인 선언들이 서로 다른 `controls.discriminator` 키를 적으면 SCHEMA-013대로 청사진 오류이고 코드는 `DISCRIMINATOR_MISMATCH`이며, ERROR-164 그 행의 "선언 사이 값이 다름"은 바로 이 경우를 뜻한다.
  - 【추론】 그래서 `DISCRIMINATOR_MISMATCH`는 넷이다: 키가 어느 분기에도 없음(`reason: 'missing'`), 분기끼리 종류가 다름(`reason: 'kind'`), 분기 사이 값이 겹침(`reason: 'overlap'`), 같은 노드의 선언 사이 판별 키가 다름(`reason: 'key'`, details `{ propertyName, other, reason }`); 25C-01의 둘째·셋째 문장은 이 넷으로 바꿔 읽는다.
  - 【추론】 한 분기의 정적 연언 안 판별 값의 공집합이 `EMPTY_ENUM_INTERSECTION`인 것(25C-01 첫 문장)은 그대로다.
- 근거: SCHEMA-013 병합표 행 "`discriminator`는 호스트에 하나이며 선언이 여럿이면 같은 값만 허용하고 다르면 청사진 오류(14라운드 O-1, 15라운드, 17라운드 스웜 수렴(편집자 결정))"; 그 원천 `reviews/round-15-decisions.md:75` "`discriminator`는 호스트에 하나이며 둘이 다르면 청사진 오류. 병합표에 행 하나를 더한다" — ERROR-164 행의 "선언 사이 값이 다름"(R15-7)은 이 행과 같은 라운드의 같은 사건이다. 01의 충돌 줄(ERROR-043·ERROR-159)과 25C-01이 이 구절을 분기 안 교차로 읽은 것은 원천을 보지 않은 것이며, 그 읽기의 코드 결론(분기 안 공집합은 `EMPTY_ENUM_INTERSECTION`)만 남긴다. 구현 `src/core/blueprint/utils/diagnostics/validateChildTargets.ts:17-26`이 이 경우를 `DISCRIMINATOR_MISMATCH`로 던지고 있으며 details만 `{ discriminator, other }`에서 위 모양으로 바꾼다. 보정 PR의 검증자가 물었다.
