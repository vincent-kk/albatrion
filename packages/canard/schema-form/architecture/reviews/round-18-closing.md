# 18라운드 닫기 — 편집자 결정

2026-09-26. 소유자는 18라운드를 어떻게 닫을지 보고, 남은 물음 대부분이 깊은 추론으로 유도할 수 있는 것이니 유도할 수 있는 것은 모두 자신에게 묻지 말고 유도해 닫으라고 했다("좋아. 하지만 적절한 추정을 해야할거야. 적절한 추정을 통해서 내가 보기에 적절한 답에 이르길 바라", `reviews/round-18-owner-answers.md:23`). 이 문서는 그렇게 닫은 18라운드의 편집자 결정이 처음 적힌 곳이며, 원장 항목은 이 문서의 줄을 그대로 인용한다.

【추론】은 편집자의 추론을 뜻한다. 원리·앞선 소유자 답·채택된 ADR·현행 원장 항목으로 갈리지 않는 곳은 패키지 설계 가치(`packages/canard/schema-form/CLAUDE.md` Design Values — 공개 인터페이스가 호출자에게 기대하게 하는 일관성, 속도 우선·최소 계산)로 가른다.

이 문서의 결정은 모두 `편집자 결정(18라운드, …)`으로 닫히며 소유자 답으로 닫히지 않는다 — 소유자가 어느 결정이든 뒤집으면 그 답이 이긴다.

## §1 청사진

### 18C-01 `$ref` 재귀 — 정적 열거가 끝나는 곳과 무한 형상

- 닫는 항목: BLUEPRINT-024, SCHEMA-030(중복)
- 결정:
  - 【추론】 규칙은 지금 정한다.
  - 【추론】 청사진은 작성 루트에서 닿는 스키마 위치마다 한 번만 만든다.
  - 【추론】 `$ref`는 작성 루트 안의 대상 위치(JSON Pointer)로 풀고, 이미 분석한 위치는 다시 분석하지 않고 그 분석을 가리킨다.
  - 【추론】 위치는 유한하므로 분석은 언제나 끝난다.
  - 【추론】 위치마다 한 번인 것은 그 위치가 스스로 선언하는 조각 표이고, 조상에서 귀속되는 `inherited`는 가리키는 쪽 청사진이 든다.
  - 【추론】 한 호스트의 조각을 열거할 때 `$ref`의 대상이 지금 열거 중인 조각 경로에 이미 있으면(조각 안의 순환) 그 자리는 더 펼치지 않는다.
  - 【추론】 펼쳐도 같은 선언이 더 깊은 중첩으로 되풀이될 뿐이어서 존재(합집합)가 바뀌지 않기 때문이다.
  - 【추론】 자식(`properties`·`items`·`prefixItems`)으로 넘어가는 참조는 그 자식 위치의 청사진을 가리킨다.
  - 【추론】 노드는 형상과 값을 따라 만들고, 배열 아이템은 값의 길이만큼만 만든다(SCHEMA-004의 지연 해석).
  - 【추론】 객체 프로퍼티만으로 이어진 순환에서 모든 마디가 게이트 없는 선언이고 터미널 전략인 노드가 하나도 없으면 형상이 무한하므로 청사진 오류(가칭 `JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED`)다.
  - 【추론】 순환을 끊는 것은 배열 아이템, 게이트(조각·노드·`children` 항목), 터미널 전략 셋이며, nullable은 끊지 않는다(비객체 호스트의 자식도 형상에 있다, VALUE-015).
  - 【추론】 게이트로 끊긴 순환은 게이트가 원본 없는 값에서 거짓일 때만 끝난다(`if`는 공허한 참일 수 있다, FRAGMENT-023).
  - 【추론】 정착에서 노드를 만들 때 같은 청사진 위치가 원본 없는 조상 사슬에서 되풀이되어 앞 되풀이와 게이트 문맥이 같으면(사슬 길이가 순환 안 식·가드의 가장 긴 상대 경로 `..` 수 이상), 그 아래는 끝나지 않는 형상으로 보고 만들지 않으며 정착 오류(가칭 `SCHEMA_FORM_ERROR.RECURSIVE_SHAPE_DIVERGED`, `diagnostics.cause: 'budget'`, 새 `exceededBudget` 값 (가칭) `'recursion'`, 모든 환경 사슬 끝 throw, `degraded`)로 드러낸다(D-2 '고정점이 없는 스키마는 지원 범위 밖, degraded로 관측'과 같은 모양, R17-1).
  - 【추론】 재귀 펼침의 멈춤은 예산 부류의 정착 오류이므로 예산 초과의 기존 규칙을 그대로 따른다 — 원본 B를 커밋하고, `diagnostics`를 `cause: 'budget'`, `exceededBudget: 'recursion'`(가칭)인 `'degraded'`로 두며, 사슬 끝에서 던진다.
  - 【추론】 형상이 수렴하지 않아도 값은 받아들인다(WRITE-004).
  - 【추론】 청사진 오류와 정착 오류는 검색으로 가려지도록 이름을 달리한다.
  - 【추론】 청사진 오류 코드 `JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED`(가칭)는 청사진 분석에서 나며, 기록에 schemaPath와 순환 경로를 싣는다.
  - 【추론】 정착 오류 코드 `SCHEMA_FORM_ERROR.RECURSIVE_SHAPE_DIVERGED`(가칭)는 정착에서 나며, `cause: 'budget'`, `exceededBudget: 'recursion'`(가칭), 모든 환경의 사슬 끝 throw, `degraded`를 따른다.
  - 이주(LANDING-128): 재귀 객체 스키마의 실패 모양이 오늘의 `UNKNOWN_JSON_SCHEMA` 또는 스택 넘침에서 청사진 오류 `JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED`(가칭)로 바뀐다(서지 않는 것은 같고, 명시적 코드가 생긴다).
- 근거:
  - SCHEMA-004(`08-design-a-to-z.md:86`), `spikes/round11-corpus/REPORT.txt:14-19`(11라운드 실측은 배열 `items`를 통한 재귀)
  - VALUE-015, FRAGMENT-023, `08-design-a-to-z.md:244`(게이트는 투영 뒤의 값을 본다)
  - SETTLE-026(D-2, 예산 초과는 원본 B를 커밋한다, SETTLE-026), R17-1 나(`reviews/round-17-owner-answers.md:9`), WRITE-004
  - ERROR-130·EVENT-020(`exceededBudget`의 세 값 `'hostWheel' | 'derive' | 'transition'`), ERROR-133(`'budget'`)
  - 오늘 코드: `src/core/nodes/schemaNodeFactory.ts:73`, `src/helpers/jsonSchema/getResolveSchema/getResolveSchema.ts:18-28`, `src/core/nodeFromJSONSchema.ts:45`
  - LANDING-122(`referenceSkipped: 'cycle'`), BLUEPRINT-002·BLUEPRINT-004
  - 소유자 O-10: "경고만 일어나고 동작하는것처럼 보이는게 더 위험합니다"(`reviews/round-14-owner-answers.md:16`)
- 게이트:
  - PR: PR-1·PR-2(표본 (c′)는 PR-2).
  - (a) `@winglet/json-schema` 스캐너가 `$ref`의 대상 위치를 주는지, 순환을 `referenceSkipped: 'cycle'`로 알리는지 확인한다.
  - (b) 코퍼스 14종(재귀 pydantic 트리 포함)이 모두 선다.
  - (c) 무한 형상 표본 셋(자기 참조 객체 프로퍼티, nullable 자기 참조, A↔B 상호 참조)은 청사진 오류가 나고, 배열·게이트·터미널로 끊은 표본은 선다.
  - (c′) 표본 "`required` 없는 `if/then`으로만 끊긴 재귀 → 정착 오류"를 PR-2에서 확인한다(예: `Node = { properties:{hasChild:{}}, if:{properties:{hasChild:{const:true}}}, then:{properties:{child:{$ref:Node}}} }`에 값 `{hasChild:true}`).
  - (d) `$ref`가 많은 스키마에서 청사진 1회 비용을 잰다(TEST-032의 벤치 행).
  - 통과: (b)와 (c)가 성립한다.
  - 실패: 스캐너가 (a)를 못 주면 오늘의 `getReferenceTable`로 청사진이 스스로 푼다(편집자 선에서 처리).
  - 실패: (b)나 (c)가 실패하면 소유자에게 올린다.

### 18C-02 값 union과 다중 `type` 슬롯

- 닫는 항목: BLUEPRINT-023, SCHEMA-031(중복), BLUEPRINT-009(현행 → 대체됨)
- 결정:
  - 【추론】 (1) 범위와 종류: 선언 하나의 `type`이 원시 타입(`string`·`number`·`integer`·`boolean`·`null`)만의 배열이면 잎 노드 하나가 된다.
  - 【추론】 `null`은 빼서 nullable 플래그로 두고, `integer`는 `number`로 접는다(BLUEPRINT-009).
  - 【추론】 접은 집합의 원소가 둘 이상이면 새 종류 (가칭) `union`의 노드이고 행은 `terminal` 하나다(`BEHAVIORS.union.terminal`).
  - 【추론】 원소가 하나면 그 원시 종류다(`['string','null']`은 nullable string, `['integer','number']`는 number).
  - 【추론】 그래서 노드의 종류는 일곱이다: string, number(`integer` 포함), boolean, null, object, array, (가칭) `union`.
  - nullable은 종류가 아니라 노드의 플래그이고, `type`이 없는 overlay(`{ const }`, `{ enum }`, `{ minimum }`)는 어느 종류와도 맞는다(BLUEPRINT-009 그대로).
  - 【추론】 12-9가 확인한 것은 같은 종류의 접기(`number`와 `integer`, `['string','null']`과 `'string'`)이지 종류의 수가 아니다.
  - 【추론】 (2) 같은 종류: `union` 노드끼리는 접은 집합이 같을 때만 같은 종류다.
  - 【추론】 다른 종류의 선언과 같은 이름이면 BLUEPRINT-011·012의 충돌 규칙을 따른다.
  - 【추론】 (3) `interpret`: 값이 나열된 타입 가운데 하나에 맞으면 그대로 둔다.
  - 【추론】 아니면 S1의 변환(ajv `coerceTypes`의 부분집합, `reviews/round-18-owner-answers.md:9`)을 `type`의 선언 순서대로 시도하고, 처음 성공한 것을 쓴다(ajv의 다중 타입 규칙).
  - 【추론】 모두 실패하면 받은 그대로 들고 S1의 경고등을 켠다.
  - 【추론】 정합은 값이 나열된 타입 가운데 하나라는 뜻이다.
  - 【추론】 (4) 입력: 패키지의 기본 입력 정의는 `union` 노드를 문자열 입력으로 그리고, 입력한 글은 (3)의 parse가 해석한다.
  - 【추론】 그래서 `string`이 목록에 있으면 입력한 글은 문자열 그대로 남고, 없으면(예: `['number','boolean']`) 선언 순서대로 바뀐다.
  - 【추론】 다른 입력은 작성자가 `formTypeInputMap`이나 인라인 입력으로 고른다.
  - 【추론】 (5) 청사진 오류: `object`·`array`가 원시 타입과 섞인 값 union(`type` 배열이거나, 자기 `type` 없이 분기의 `type`이 섞인 `oneOf`·`anyOf`)과, null 분기를 빼고도 종류가 둘 이상인데 자기 `type`이 없는 원시 `anyOf`·`oneOf`는 청사진 오류다(`JSON_SCHEMA_ERROR.UNKNOWN_JSON_SCHEMA`, ADR 0014 §7.1의 "지원하지 않는 `type`", 오늘과 같은 코드).
  - 【추론】 원시 `anyOf`·`oneOf`의 작성자는 슬롯에 `type` 배열을 더하면 되고, 이는 검증 결과를 바꾸지 않는다.
  - 【추론】 (6) 공개 표면: 공개 가드 (가칭) `isUnionNode`(`isSchemaNode(x) && x.type === 'union'`)를 더하고, 공개 판별 합집합과 `InferSchemaNode`에 `union` 멤버를 더한다.
  - 【추론】 `node.type`은 `'union'`, `node.strategy`는 `'terminal'`이다.
  - 【추론】 그래서 공개 가드는 아홉에서 열이 된다.
  - 【추론】 (7) PR 배치: 청사진이 `union` 종류를 알아보는 것은 PR-1이다(청사진이 종류를 정한다).
  - 【추론】 `union` 동작 행(`interpret`, `terminal` 전략)은 다른 잎 행과 함께 PR-2다(LANDING-062의 행 목록).
  - 【추론】 종류 모듈 목록에는 (가칭) `unionBehavior/`가 더해진다.
  - 이주(LANDING-129): 원시 타입 둘 이상의 `type` 배열(예 `['number','string']`, `['string','number','null']`)은 오늘 `UNKNOWN_JSON_SCHEMA`로 폼이 서지 않고, 새 설계에서는 `union` 잎과 문자열 입력으로 선다(사용자에게 보이는 변화).
  - 이주(LANDING-130): `['integer','number']`는 오늘 `UNKNOWN_JSON_SCHEMA`이고, 새 설계에서는 수 노드다.
- 근거:
  - 소유자 P1′: "그러면 JSON Schema 문법을 form이 추적하며 구현할 필요는 없다. 노드 타입을 결정하는 일부 동작(튜플, `type: [number, string]`)과 가변 구성을 위한 `if-then-else` 같은 일부 문법만 차용한다."(`reviews/round-5-derivations.md:7`) — 다중 `type`을 폼이 빌려 쓰는 동작으로 꼽았으므로 청사진 오류로 두면 이 원문과 어긋난다.
  - 소유자(BLUEPRINT-012): "타입이 달라버리면 우리로서는 답이 없지만(이 경우엔 오류가 throw 되겠지)"(`adr/0005-blueprint-analysis-and-node-sharing.md:116`) — 원시 타입으로 묶을 수 없는 섞임은 (5)대로 오류로 남는다. 게이트 없는 선언끼리 종류가 다르면 청사진 오류라는 줄(BLUEPRINT-012, `adr/0014-error-policy.md:228`)도 그대로다.
  - ajv 8.17.1 `node_modules/schema-utils/node_modules/ajv/dist/compile/validate/dataType.js:57-74`(`coerceToTypes`는 `types`를 선언 순서대로 거르고 `coerceData`는 그 순서로 돌며 처음 성공한 것만 쓴다), `:44-48`(이미 나열된 타입이면 변환하지 않는다)
  - S1(`reviews/round-18-owner-answers.md:7-9`), 12-9 소유자: "같은 종류 맞습니다."(`reviews/round-18-owner-answers.md:19`)
  - 선언 순서의 첫 원시 타입을 종류로 삼는 안은 S1 셋째의 경고등(`reviews/round-18-owner-answers.md:9`)과 부딪쳐(수 노드에 문자열이 있어도 '정합'이 된다) 받지 않는다.
  - 오늘: `src/helpers/jsonSchema/extractSchemaInfo/extractSchemaInfo.ts:24-30`, `src/core/nodes/schemaNodeFactory.ts:116`, `src/formTypeDefinitions/index.tsx:14-25`, `src/formTypeDefinitions/FormTypeInputString.tsx:46-49`
  - 가드 이름과 모양: 18C-47, NODE-015
  - PR 배치: LANDING-061, LANDING-062(`08-design-a-to-z.md:572`의 "잎 넷·객체·터미널 객체·가상"), LANDING-056(`08-design-a-to-z.md:556`)

### 18C-03 `dependentSchemas`·`dependentRequired`·`dependencies`(Q7)

- 닫는 항목: FRAGMENT-037
- 결정:
  - 【추론】 폼은 `dependentSchemas`·`dependentRequired`·`dependencies`를 게이트·조각 모델로 옮기지 않고 읽지 않는다.
  - 【추론】 셋은 검증기에 그대로 간다.
  - 【추론】 그 안에만 선언된 프로퍼티는 노드가 되지 않고, 값이 오면 `extras`로 남는다.
  - 【추론】 조건부 필드를 보이려는 작성자는 `allOf: [{ "if": { "required": ["k"] }, "then": S }]`로 적는다(ADR 0010의 분기 관행).
  - 【추론】 두 철자 규칙(C5)에서 `dependencies`·`dependentSchemas` 쌍은 들지 않는다.
  - 【추론】 스키마에 `dependentSchemas`나 `dependencies` 키가 있으면 청사진 경고(가칭 `SCHEMA_FORM_WARNING.DEPENDENT_SCHEMAS_IGNORED_FOR_FORM`, 개발 모드, 키의 유무만 봄, 기록에 schemaPath와 키)를 낸다.
  - 【추론】 이 경고는 §7.1 청사진 경고 행의 조건 목록에 "`dependentSchemas`·`dependencies` 무시"로 더해지고, 기본 드러남은 개발 모드 콘솔이며, 새 설계에만 있다.
  - 이주(LANDING-131): `dependentSchemas`나 `dependencies`를 쓴 스키마에 개발 모드 경고가 새로 난다.
- 근거:
  - 축 1 소유자 답: "schemaForm은 jsonSchema 문법을 제안하지 않는다."·"그렇기 때문에 스키마폼에서 스키마를 사용하는 분기는 모두 if 블록을 사용하는 것을 컨벤션으로 사용하고자 한다."(`reviews/round-9-spec.md:19`) — `dependentSchemas`가 그 답의 '특수 문법'에 든다는 것은 편집자 유추이고, 분기는 `if` 블록으로 적는다는 문장이 직접 근거다.
  - P1′(`reviews/round-5-derivations.md:7`), SCHEMA-006(`08-design-a-to-z.md:89`)
  - 읽으려면 없는 위치의 가드(`{required:[k]}`)를 합성하거나 폼이 존재 의미를 해석해야 하며, 이는 `compileGuard(root, pointer)` 계약(`adr/0004-validator-plugin-compile-guard.md:73`)과 축 1의 단일 예외에 걸린다.
  - 생성기 코퍼스에 이 키가 없다(`spikes/round11-corpus/REPORT.txt`).
  - 경고 선례: `ALL_OF_KEYWORD_IGNORED_FOR_FORM`·`NULL_BRANCH_IGNORED_FOR_FORM`(`adr/0014-error-policy.md:230,285-286`), C2(`00-goals.md:105`)

### 18C-04 `patternProperties`와 스키마 값 `additionalProperties`

- 닫는 항목: SCHEMA-032
- 결정:
  - 【추론】 동적 키는 노드가 되지 않는다.
  - 【추론】 두 키워드(`patternProperties`, 스키마 값 `additionalProperties`)는 검증기에만 간다.
  - 【추론】 선언되지 않은 키의 값은 호스트의 `extras`에 받은 순서대로 남아 방출된다.
  - 【추론】 입력은 그려지지 않는다.
  - 【추론】 맵을 편집하려면 작성자가 그 객체를 터미널로 두고(`options.terminal: true` 또는 인라인 입력) 값 전체를 편집하는 입력을 쓴다.
- 근거:
  - SCHEMA-006(`08-design-a-to-z.md:89`, "읽지 않는 것")
  - VALUE-002(`extras`), VALUE-010(방출 순서), NODE-030(`terminal: true`)
  - P1′(`reviews/round-5-derivations.md:7`), 축 1(`reviews/round-9-spec.md:19`) — 두 원문에는 `patternProperties`·`additionalProperties`가 직접 나오지 않는다.

### 18C-05 `controls.discriminator`의 `$ref`·`allOf` 평탄화와 분기 자체 게이트

- 닫는 항목: FRAGMENT-038, BLUEPRINT-019(중복)
- 결정:
  - 【추론】 분기에서 판별 키의 `const`·`enum`을 찾는 범위는 그 분기의 정적 연언이다.
  - 【추론】 곧 분기 본체, 게이트 없는 `allOf` 항목, 그리고 이것들이 `$ref`로 가리키는 대상이다(재귀, 18C-01의 순환 절단을 따름).
  - 【추론】 그 키 프로퍼티 스키마도 같은 정적 연언(자기 `$ref`, 게이트 없는 `allOf`)에서 모은다.
  - 【추론】 `if/then`, 게이트 가진 `allOf` 항목, 중첩 `oneOf`·`anyOf`는 보지 않는다.
  - 【추론】 한 분기에서 모은 `const`·`enum`은 정적 연언의 교차로 합친다.
  - 【추론】 교차가 공집합이면 정적 연언의 청사진 오류다.
  - 【추론】 끌어올림(O-1)도 이렇게 모은 선언을 쓴다.
  - 【추론】 null 분기(`isNullBranch`)는 노드의 nullable 플래그이므로 판별 대상 분기로 세지 않는다.
  - 【추론】 null 분기에 판별 키가 없는 것은 키 없음도 오류도 아니다.
  - 【추론】 분기가 자기 `controls.active`도 가지면 그 분기의 게이트는 `(변환식) && (분기 식)` 하나다(`08-design-a-to-z.md:178`).
  - 【추론】 판별 키가 없는 분기가 자기 `controls.active`를 가지면 그 식만이 게이트다.
- 근거:
  - `08-design-a-to-z.md:178`(결합은 AND로 적혀 있었다)
  - SCHEMA-008·BLUEPRINT-016(정적 연언 = 본체 + 게이트 없는 `allOf`, 공집합은 청사진 오류), SCHEMA-010(표시는 AND)
  - FRAGMENT-007, `adr/0014-error-policy.md:228`(키 없는 분기의 처리는 이미 닫힘)
  - 소유자 O-1: "discriminator 를 서로 다르게 선언했거나"(`reviews/round-14-owner-answers.md:7`)
  - null 분기 = 플래그(`adr/0005-blueprint-analysis-and-node-sharing.md:62`, BLUEPRINT-009)

### 18C-06 노드의 `required` 표시가 켜진 `then`을 반영하는 규칙

- 닫는 항목: SCHEMA-033
- 결정:
  - 【추론】 노드의 `required` 표시는 부모 호스트의 유효 스키마 `required`에 그 이름이 드는가로 정한다.
  - 【추론】 호스트의 유효 스키마 `required`는 병합표의 검증 키워드 규칙대로, 연언 문맥의 켜진 조각이 가진 `required`의 합집합이다.
  - 【추론】 연언 문맥은 본체, 게이트 없는 `allOf` 항목, 켜진 게이트 조각(`then`·`else`, `controls.active` 조각, 변환된 분기)이다.
  - 【추론】 게이트 없는 `oneOf`·`anyOf` 분기와 그 안의 `then`은 더하지 않는다.
  - 【추론】 표시만 할 뿐 형상(`active`)과 검증을 바꾸지 않는다.
  - 【추론】 `then.required`로 필드를 켜지 않는다(이주 24행).
  - 【추론】 부모의 유효 스키마가 바뀌어 표시가 뒤집힌 자식은 유효 스키마가 바뀐 노드와 같이 배달 집합에 든다.
  - 이주(LANDING-132): 조건부 `required`가 있는 필드의 필수 표시는 오늘 늘 켜지고, 새 설계에서는 켜진 `then`에 따라 바뀐다.
- 근거:
  - 축 5 "각 노드가 지금 가진 제약을 최신화해 제공할 의무는 폼이 진다"(`08-design-a-to-z.md:62`; 소유자 답 `reviews/round-9-spec.md:23`, SCHEMA-007)
  - SCHEMA-008, SCHEMA-014, BLUEPRINT-014
  - 소유자 E-23: "우리가 참견할 문제는 아닙니다. 평가하지 않습니다"(`reviews/round-10-owner-answers.md:38`) — 폼은 `required`를 평가하지 않고 합쳐 전달만 하므로 부딪치지 않는다.
  - 오늘 코드는 정적이다: `src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getChildNodeMap/getChildNodeMap.ts:74`

### 18C-07 같은 가상 이름을 다른 `fields`로 적은 `options.virtual`

- 닫는 항목: SCHEMA-034, ERROR-049
- 결정:
  - 【추론】 한 호스트에서 같은 가상 이름의 선언이 여럿이면(본체·조각 어디든) `fields`가 순서까지 같아야 한다.
  - 【추론】 다르면 게이트와 무관하게 청사진 오류다.
  - 【추론】 가상 노드의 신원은 이름이고 값은 `fields` 순서의 튜플이라, 조각 집합에 따라 자식과 튜플 모양이 바뀌는 노드를 두지 않는다.
  - 【추론】 항목의 나머지 키(주석·`options`·`presentation`)는 그 가상 노드의 선언으로서 공유 노드와 같은 병합표를 따른다.
  - 【추론】 코드는 (가칭) `JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_MISMATCH`이고, 청사진 분석에서 나며, 기록에 schemaPath와 두 `fields`를 싣고, 새 설계에만 있다.
- 근거:
  - NODE-034(identity = 이름, 값 = 참조 노드 값의 튜플, `adr/0011-branch-node-composition.md:68-75`)
  - 선례: `discriminator`는 호스트에 하나이며 선언이 여럿이면 같은 값만(SCHEMA-013, `08-design-a-to-z.md:329`, O-1), 게이트가 서로 배타인 경우끼리도 정적 오류로 보는 `TERMINAL_STRATEGY_MISMATCH`(ERROR-044), "켜진 조각 집합에 따라 한 노드의 전략이 바뀌는 경로는 없다"(`08-design-a-to-z.md:331`)
  - 소유자 O-10: "경고만 일어나고 동작하는것처럼 보이는게 더 위험합니다"(`reviews/round-14-owner-answers.md:16`)
  - 이름 관례: `VIRTUAL_FIELDS_NOT_VALID`·`VIRTUAL_FIELDS_NOT_IN_PROPERTIES`와 §7.2의 `*_MISMATCH`
  - 오늘은 호스트 `virtual` 하나만 읽어 이주 행이 없다: `src/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:854`, `getVirtualReferencesMap.ts:37-65`

### 18C-08 옮길 잎 교차 함수의 뜻

- 닫는 항목: SCHEMA-035
- 결정:
  - 【추론】 (1) `const`의 동등은 깊은 구조 비교(JSON 값 동등)다.
  - 【추론】 같은 계열 `intersectEnum`의 깊은 경로처럼 `@winglet/common-utils/object`의 `equals`를 쓴다.
  - 【추론】 원시값은 `===`다.
  - 【추론】 (2) `pattern`은 정규식 하나로 합치지 않는다.
  - 【추론】 같은 문자열은 하나로 줄인다.
  - 【추론】 서로 다른 패턴이 둘 이상이면 전순서의 첫 패턴을 `pattern`에 두고, 나머지는 순서대로 유효 스키마의 `allOf`에 `{ "pattern": p }` 항목으로 싣는다(표준 JSON Schema의 연언, 뜻이 정확함).
  - 【추론】 패턴의 공집합은 판정하지 않으므로 청사진 오류가 생기지 않는다.
  - 【추론】 새 fractal에는 `intersectPattern`을 옮기지 않는다.
  - 【추론】 (3) 레거시의 옛 `intersect*Schema`는 옮긴 `intersectConst`(깊은 비교)를 쓰고, 옛 `intersectPattern`은 레거시에 남겨 그대로 쓴다.
  - 【추론】 레거시는 PR-7에서 지워진다.
  - 【추론】 그래서 레거시의 `const` 비교는 깊은 비교로 바뀌며(결함 수정), 이는 옛 `intersect*Schema`가 옛 동작을 PR-7까지 지킨다는 규칙(LANDING-061)의 예외다.
  - 【추론】 (4) 09 §4.3의 '그대로 산다'에서 뺄 것은 둘이다.
  - 【추론】 하나는 `utils/__tests__/intersectConst.test.ts:40-58`의 참조 비교 단언으로, '버리고 새로 쓴다'로 옮겨 깊은 비교를 단언한다.
  - 【추론】 다른 하나는 `utils/__tests__/intersectPattern.test.ts:6-14`의 전방 탐색 문자열 단언으로, 레거시와 함께 가며 새 병합 시험은 `'ab'`·`'Abc123'`·역참조·같은 이름 캡처 그룹 사례로 목록 표현을 단언한다.
  - 이주(LANDING-133): 같은 값인 객체·배열 `const`끼리의 `allOf`는 오늘 `JSONSchemaError`를 던지고, 새 설계와 레거시 모두에서 통과한다(결함 수정).
  - 이주(LANDING-134): 여러 `pattern`의 `node.jsonSchema` 표현이 오늘의 `(?=a)(?=b)` 합성 문자열에서 첫 패턴과 `allOf`의 `{pattern}` 항목으로 바뀐다.
- 근거:
  - 결함 실행 확인: `reviews/raw-round18-early-check.md:124-129`, `:344-349`
  - `src/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/intersectConst.ts:23`(`!==`), `intersectPattern.ts:21`(`(?=a)(?=b)`), `intersectEnum.ts:32-34`(깊은 비교 선례), `intersectArraySchema.ts:41-42`
  - SCHEMA-008(교차는 연언의 뜻을 지킨다); 오늘 패키지 안에서 `pattern`을 읽는 소비자는 없다(grep 확인).
  - `08-design-a-to-z.md:571`, `09-landing-and-test-strategy.md:158`
  - 보조 근거 소유자: "우리는 투명한 jsonSchema 를 추구하므로"(`reviews/round-12-owner-answers.md:16`) — `virtual` 문맥의 답이며, 비표준 배열형 `pattern` 대신 표준 `allOf`를 고른 것은 이 답의 편집자 확장이다.

### 18C-09 터미널 전략 비교의 '경우'와 게이트 없는 분기의 선언

- 닫는 항목: NODE-029, SCHEMA-037, SCHEMA-014(현행 → 대체됨)
- 결정:
  - 【추론】 (1) 청사진이 정적으로 정한다: 한 노드의 전략은 청사진이 그 노드의 선언에서 정적으로 정한다.
  - 【추론】 (2) 셈에 드는 선언: 게이트 없는 선언(본체, 게이트 없는 `allOf` 항목)과 게이트 가진 선언이다.
  - 【추론】 게이트 없는 `oneOf`·`anyOf` 분기의 선언은 그 노드의 유일한 선언일 때만 든다.
  - 【추론】 (3) 경우의 정의: 경우는 조각 중첩을 지키는 켜짐 조합이다.
  - 【추론】 게이트 없는 선언은 늘 켜지고, 중첩 조각 안의 선언은 그것을 감싸는 게이트 가진 조각이 모두 켜져야 켜진다.
  - 【추론】 각 경우에 켜진 선언들로 `options.terminal`(전순서에서 나중 것) → 렌더 계층 판정(없음이 아닌 결과 가운데 나중 것) → `type`의 순서로 전략을 정하고, 경우마다 다르면 청사진 오류(`TERMINAL_STRATEGY_MISMATCH`)다.
  - 【추론】 (4) 축약 비교: 경우를 모두 열거하지 않는다.
  - 【추론】 게이트 없는 선언이 있으면 그것만 켜진 경우 하나를 두고, 게이트 가진 선언 d마다 '게이트 없는 선언 ∪ d를 감싸는 게이트 가진 조각들이 이 노드에 둔 선언 ∪ d'가 켜진 경우를 둔다.
  - 【추론】 이것들을 비교하면 가능한 모든 경우를 비교한 것과 같다.
  - 【추론】 검사 비용은 노드마다 선언 수와 중첩 깊이의 곱을 넘지 않는다.
  - 【추론】 (5) 병합도 같은 선언 집합: 같은 까닭으로, 게이트 없는 분기가 공유 노드에 둔 주석·표현·상태 키와 `options`는 그 노드의 유일한 선언일 때만 유효 스키마에 쓴다.
  - 게이트 없는 분기 안의 `if/then`도 그 분기의 선언 문맥이므로 `then`의 제약을 본체와 교차하지 않는다(SCHEMA-014 그대로).
  - 【추론】 전략과 유효 스키마가 같은 선언 집합을 본다.
  - 【추론】 `options.virtual`의 항목은 선언이므로 존재를 더한다.
- 근거:
  - 모의 실행: 부모 F(`terminal:false`) 안에 중첩 G(인라인 입력)를 두면 옛 정의는 G 단독을 세어 오류를 내고, 고친 정의로는 {F}, {F,G} 둘 다 branch다(`reviews/raw-round18-early-check.md:146-158`).
  - 축약의 동치: 가능한 경우 S의 전략은 S 안에서 값을 가진 가장 나중 선언 d*가 정하는데, d*를 감싸는 사슬은 S에 들고 d*보다 앞이므로 d*의 최소 경우가 같은 전략을 낸다.
  - SCHEMA-014(`03-mental-model.md:138`), 외부 점검이 짚은 모순(`reviews/raw-round18-early-check.md:233-235`)
  - NODE-028, FRAGMENT-011(`adr/0002-guard-fragment-model.md:58`)
  - 14라운드 O-1과 같은 모양이며, 17라운드 편집자 결정의 결함을 고치는 것이라 소유자 답과 부딪치지 않는다.

### 18C-10 같은 호스트의 `oneOf`와 `anyOf` 분기의 순위

- 닫는 항목: SCHEMA-036
- 결정:
  - 【추론】 키워드 순위를 본체 `properties` < `allOf` 항목 < `if/then/else` < `oneOf` 분기 < `anyOf` 분기로 가른다.
  - 【추론】 같은 호스트에서 `oneOf[i]`는 모든 `anyOf[j]`보다 앞이다.
  - 【추론】 주석 키의 나중 승, 같은 대상 규칙의 같은 층 동점, 공유 충돌의 '앞선 종류', 터미널 전략의 '나중 것', 호스트 바퀴의 평가 순서가 모두 이 순서를 쓴다.
  - 【추론】 JSON 키 순서는 여전히 쓰지 않는다.
- 근거:
  - 오늘 코드가 `oneOf`를 먼저 처리한다(`src/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:450-451`). 두 안 모두 결정적이라 가치가 부딪치지 않으므로 오늘 순서를 이어 이주를 없앤다.
  - BLUEPRINT-008·FRAGMENT-011(전순서, "JSON 키 순서에 기대지 않는다"), 외부 점검 M2(`reviews/raw-round18-early-check.md:160-178`)
  - 소유자 답의 '나중 선언이 이긴다'(`reviews/round-12-owner-answers.md:24,25`, `reviews/round-13-owner-answers.md:10`)는 전순서가 정의하는 '나중'이며, `oneOf`와 `anyOf`의 순서를 정한 소유자 답은 없다.

### 18C-11 켜진 조각과의 런타임 교차가 공집합일 때 공개 `node.jsonSchema`

- 닫는 항목: SCHEMA-038
- 결정:
  - 【추론】 런타임 교차의 공집합은 던지지 않고 표준 JSON Schema로 적는다.
  - 【추론】 `enum`끼리의 공집합은 `enum: []`로 적는다.
  - 【추론】 서로 다른 `const`의 충돌은 `const`를 빼고 `enum: []`로 적는다.
  - 【추론】 선택할 값이 없음을 `enum` 하나로 통일한다.
  - 【추론】 범위의 역전(`minimum` > `maximum` 등)은 교차한 값 그대로 둔다.
  - 【추론】 `const`와 `enum` 사이처럼 다른 키워드끼리의 공집합은 판정하지 않는다(각 키워드를 따로 교차).
  - 【추론】 잎 함수의 공집합 표시는 정적 연언에서는 청사진 오류로, 런타임에서는 위 표현으로 바뀐다.
  - 【추론】 같은 활성 집합이면 같은 참조를 돌려준다(메모).
  - 【추론】 PR-1 병합표 시험(`09-landing-and-test-strategy.md:168`)이 이 표현을 단언한다.
- 근거:
  - BLUEPRINT-016(런타임 공집합은 throw 없이 검증기가 기각, `adr/0005-blueprint-analysis-and-node-sharing.md:76` "지금 고를 수 있는 값이 없는" 상태)
  - SCHEMA-007(메모, 같은 집합이면 같은 참조), `08-design-a-to-z.md:571`(공집합 표시)
  - `enum: []`는 표준 스키마로 유효하다(SHOULD 한 개 이상).
  - 소유자: "우리는 투명한 jsonSchema 를 추구하므로"(`reviews/round-12-owner-answers.md:16`)

### 18C-12 `controls.children` — PR-1·PR-2가 쓰는 부분과 PR-6 부분

- 닫는 항목: CONTROLS-063, FRAGMENT-042, SETTLE-037, ERROR-051(`controls.children` 부분)
- 결정:
  - 【추론】 PR-1·PR-2가 쓰는 부분은 (1)–(5)이고, PR-6이 쓰는 부분은 (6)–(7)이다.
  - 【추론】 (1) 대상 해석: `targets`의 이름은 그 `children` 선언을 가진 호스트 청사진의 직계 자식 이름으로 푼다.
  - 【추론】 자식 이름은 본체와 모든 조각 선언의 합집합이고, 끌어올린 판별 키와 가상 이름을 포함한다.
  - 【추론】 조각에서만 선언된 자식도 가리킬 수 있다.
  - 【추론】 같은 이름에 종류가 다른 노드가 여럿이면 모두에 걸린다.
  - 【추론】 (2) 청사진 오류: 청사진에 없는 이름이거나, 호스트의 전략이 터미널이라 자식 노드가 없으면 청사진 오류다.
  - 【추론】 코드는 (가칭) `JSON_SCHEMA_ERROR.CHILDREN_TARGET_NOT_FOUND`이고, 청사진 분석에서 나며, 기록에 schemaPath와 이름을 싣고, 새 설계에만 있는 단독 청사진 오류 코드다.
  - 【추론】 (3) 형상에 없는 대상: 청사진에 있으나 지금 형상에 없는 대상은 오류가 아니다.
  - 【추론】 그 항목은 대상이 형상에 있는 동안만 효력을 가진다.
  - 【추론】 항목 자신의 `controls.active`는 (4)의 게이트로서 호스트에서 평가되어 대상의 존재를 정하며, 이 문장의 대상이 아니다.
  - 【추론】 그래서 `controls.children` 대상이 형상에 없을 때의 코드는 생기지 않는다.
  - 【추론】 (4) 항목 게이트의 전순서 자리: 항목의 `controls.active`는 노드 게이트와 같은 장치이므로 노드 게이트의 자리 규칙을 따른다.
  - 【추론】 곧 그 `children` 선언을 담은 조각(본체면 본체) 바로 뒤, 그 조각의 노드 게이트들 다음에 항목 순서대로 든다.
  - 【추론】 (5) 예산 셈: 호스트 바퀴와 전이 라운드 식의 '노드 게이트 수'는 `controls.active`를 가진 `children` 항목을 대상 수와 무관하게 항목마다 하나로 센다.
  - 【추론】 식 하나가 호스트 기준으로 한 번 평가되어 모든 대상에 같은 값으로 걸리기 때문이다.
  - 【추론】 조각의 `controls.active`는 그 조각의 게이트라 '게이트 가진 조각 수'에 이미 들어 있으므로 따로 세지 않는다.
  - 【추론】 조각 범위 제어의 다른 키는 게이트가 아니다.
  - 【추론】 판별 변환과 분기 식의 AND(18C-05)는 게이트 하나다.
  - 【추론】 (6) 대상별 식: 항목 `controls`의 식은 기준점이 호스트이고 항목마다 한 번 평가되어 모든 대상에 같은 값으로 걸린다.
  - 【추론】 대상마다 다른 식은 항목을 나눠 적는다.
  - 【추론】 (7) 값 키: 값 키(`default`, `derived`, `unsetValue`, `resetInteraction`, `unsetOnInactive`)는 각 대상 노드에 그 키를 적은 것처럼 동작하되 층은 `children` 항목 층이다.
  - 【추론】 같은 대상에서는 조각의 `controls` < `children` 항목 < 노드 자신이다.
  - 【추론】 같은 층이면 전순서에서 나중이 이기고 한 배열 안이면 뒤 항목이 이긴다.
  - 【추론】 다만 `unsetOnInactive`는 CONTROLS-040대로 같은 층에 여럿이면 하나라도 유지면 유지한다.
  - 【추론】 `derived`는 대상마다 같은 값을 쓴다.
  - 【추론】 상태 키는 층 순서가 아니라 로컬 결합을 따른다.
  - 【추론】 잠금(`readOnly`·`disabled`)은 하나라도 참이면 잠기고(OR), 표시(`active`·`visible`)는 모두 참이어야 켜진다(AND).
  - 【추론】 CONTROLS-046이 그대로다(18C-69).
- 근거:
  - (2): `targets`는 식이 아닌 이름이라 청사진이 정적으로 확인할 수 있다. 모르는 키가 청사진 오류인 선례 `UNKNOWN_GROUP_KEY`(`adr/0014-error-policy.md:259`, 항목 `controls`는 닫힌 목록), 소유자 O-10: "경고만 일어나고 동작하는것처럼 보이는게 더 위험합니다"(`reviews/round-14-owner-answers.md:16`)
  - (3): ERROR-124와 `adr/0014-error-policy.md:197`("형상에 없는(비활성) 노드를 가리키는 것은 오류가 아니다"), `08-design-a-to-z.md:167`
  - (4)(5): `08-design-a-to-z.md:299`(항목 게이트 = 노드 게이트와 같은 장치), `:176`(노드 게이트의 자리), SETTLE-022(상한 식), FRAGMENT-014, CONTROLS-021
  - (6)(7): CONTROLS-043·`adr/0003-group-namespace.md:101`(기준점은 호스트), `adr/0003-group-namespace.md:119`(SETTLE-004, 층과 같은 층의 나중 승), CONTROLS-040, `08-design-a-to-z.md:302`, CONTROLS-046, SCHEMA-010
  - 소유자 C-15·D-14(`reviews/round-10-owner-answers.md:16,21`), 13라운드 답 1 "children 그룹은 예외"(`reviews/round-13-owner-answers.md:7`)

## §2 식 언어

### 18C-13 `controls` 식 언어의 명세

- 닫는 항목: CONTROLS-068
- 결정:
  - 【추론】 (1) 문법: 식은 JavaScript 식 하나이거나 `{ … }`로 감싼 문장 몸통(값은 `return`으로 낸다)이다.
  - 【추론】 청사진이 경로 토큰을 뽑아 인자 배열 참조로 바꾸고 `new Function`으로 컴파일한다.
  - 【추론】 오늘의 토크나이저 `JSON_POINTER_PATH_REGEX`와 `getFunctionBody`를 그대로 옮긴다.
  - 【추론】 형용사·동사 키의 식은 `!!`로 불리언이 된다.
  - 【추론】 식은 작성된 스키마 위치마다 한 번 컴파일하고, 그 위치의 모든 노드(배열 아이템 포함)가 결과를 공유한다.
  - 【추론】 컴파일 실패는 이미 정한 대로 청사진 오류다.
  - 【추론】 문자열 상수와 식의 구분은 CONTROLS-018대로다.
  - 【추론】 (2) 전역 이름: 허용 목록도 차단 목록도 두지 않는다.
  - 【추론】 식 몸통은 오늘처럼 JS 전역 스코프를 본다.
  - 【추론】 계약상 식의 입력은 경로 토큰과 `@`뿐이다.
  - 【추론】 시간·난수·바깥 가변 상태를 읽는 식은 결정적이지 않아 지원 범위 밖이며, 폼은 이를 막지 않는다.
  - 【추론】 스키마 안의 식은 코드이므로 신뢰할 수 없는 출처의 스키마는 오늘처럼 지원 범위 밖이다.
  - 【추론】 (3) 토큰: 경로 토큰은 오늘 그대로 `./p`, `../p`(되풀이할 수 있다), `/p`다.
  - 【추론】 `#/p`는 `/p`와 같다(RFC 6901의 URI 조각 표기).
  - 【추론】 `#` 단독과 `(/)`는 루트의 값이다.
  - 【추론】 `@`는 맥락이다.
  - 【추론】 `@/p`는 경로가 아니다.
  - 【추론】 맥락 안의 값은 `@.x`나 `@['x']`처럼 JS로 읽는다.
  - 【추론】 기준점은 CONTROLS-043대로다.
  - 【추론】 경로 조각 안의 `[n]`은 색인이 아니라 이름의 일부다.
  - 【추론】 (4) `*`: 식과 `controls.watch`의 경로에서 `*` 조각은 지원하지 않는다.
  - 【추론】 쓰면 청사진 오류(식 컴파일 실패와 같은 분류)다.
  - 【추론】 `*`는 `findNodes`와 `formTypeInputMap` 키의 표기로만 남는다.
  - 【추론】 같은 표현은 배열 전체를 읽어서 한다(예: `(../items).some(i => i.price > 0)`).
  - 【추론】 (5) 경로가 읽는 값: 경로는 방출 트리의 값을 읽는다.
  - 【추론】 루트의 방출 값(`outputValue`)에서 그 절대 경로를 따라 JSON Pointer처럼 내려간 값이며, 조상의 투영이 뺀 키는 `undefined`다.
  - 【추론】 계산 단계의 게이트에게 방출 트리는 이번 계산의 현재 상태이고, 바퀴 안이면 그 바퀴의 G다(FRAGMENT-016).
  - 【추론】 게이트, 상태 키, `derived`, `unsetValue`, `resetInteraction`, `watch`의 `watchValues`가 모두 이 규칙 하나를 따른다.
  - 【추론】 `controls.unsetOnInactive`의 식은 직전 커밋의 방출 트리를 읽는다(CONTROLS-024, WRITE-038, 17라운드 통보 2).
  - 【추론】 원본과 잠복 원본은 식이 읽지 못한다.
  - 【추론】 잠복 원본은 `node.inactiveValues`로만 읽는다.
  - 【추론】 노드가 없는 곳도 값 수준으로 읽힌다.
  - 【추론】 `extras`의 키, 터미널 노드 안(`./tags/0`)이 그렇다.
  - 【추론】 합성 노드를 읽는 식은 그 하위 트리 전체에 기댄다.
  - 【추론】 따라서 역의존 조회(SETTLE-017)는 값이 바뀐 노드의 경로와 그 조상·자손 경로를 읽는 식을 모두 찾는다.
  - 【추론】 (6) 비활성·없는 노드: 형상에 없는 노드(게이트가 거짓인 노드, 꺼진 분기의 노드)는 방출이 없으므로 `undefined`로 읽힌다.
  - 【추론】 청사진에 자리가 없는 경로도 오류나 경고 없이 (5)의 규칙으로 읽는다.
  - 【추론】 선언되지 않은 키면 `extras`의 값, 아니면 `undefined`다.
  - 【추론】 (7) 배열: 색인은 `/n` 조각으로 읽는다(`../items/0/price`, 아이템 안에서 형제는 `../1`).
  - 【추론】 길이는 배열의 방출 값에 JS로 `(../items).length`를 쓴다.
  - 【추론】 방출 값이므로 `omitTrailing`이 뺀 꼬리 아이템은 길이에 들지 않는다.
  - 【추론】 RFC 6901의 `-`와 음수 색인은 없다(`(../items).at(-1)`을 쓴다).
  - 【추론】 아이템이 자기 색인을 읽는 문법은 두지 않는다.
  - 【추론】 (8) `@` 맥락: `@`의 값은 폼의 맥락 객체다.
  - 【추론】 `FormProvider`의 맥락과 Form 속성 `context`를 얕게 병합하고 같은 키는 Form 속성이 이긴다.
  - 【추론】 둘 다 없으면 `{}`다.
  - 【추론】 식에게는 읽기 전용이고 `controls.injectTo`의 대상이 될 수 없다.
  - 【추론】 맥락이 바뀌는 것은 입력이 바뀌는 것이다.
  - 【추론】 바인딩이 바뀐 맥락을 루트에 전하면 정착 하나가 돈다.
  - 【추론】 원본은 표시하지 않고, 역의존 표의 `@` 항목이 가리키는 노드와 그 조상을 재계산 목록에 넣는다.
  - 【추론】 바뀜의 기준은 오늘처럼 스냅숏이라, 깊이 같은 값은 같은 참조로 본다.
  - 【추론】 `@`를 읽는 `derived`·`unsetValue`·`resetInteraction`에게 이 변경은 에지다.
  - 【추론】 기준점은 SETTLE-004대로 따르고, 같음 판정은 18C-50을 따른다.
  - 【추론】 `injectTo`는 자기 방출 값의 에지에만 발화하므로 맥락 변경으로는 발화하지 않는다.
  - 【추론】 로드 때는 로드 시점의 맥락으로 평가한다.
  - 이주(LANDING-135): 식에 쓴 `*` 조각이 청사진 오류가 된다.
  - 이주(LANDING-136): `omitEmpty`(기본 켜짐) 아래에서 `../name === ''` 같은 식은 `undefined`를 보게 되므로 `!../name`으로 고치거나 `omitEmpty`를 끈다.
  - 이주(LANDING-137): `controls.watch`의 `watchValues`도 `omitEmpty` 아래에서 빈 문자열을 `undefined`로 받는다(입력 구성 요소가 보는 변화).
- 근거:
  - CONTROLS-048과 `05-before-after.md:57`(`#/path`·`./path`·`../path`·`/path`·`@`·`#`를 `new Function`으로 컴파일 → 유지), `09-landing-and-test-strategy.md:168`(PR-1이 식 컴파일러 시험 아홉 파일을 옮긴다)
  - 오늘 코드: `regex.ts:87-109`, `createDynamicFunction.ts:41`, `getFunctionBody.ts:7-12`, `getPathManager.ts:16`, `AbstractNode.ts:253-276`
  - (4): 오늘 `*` 경로는 `findAll`로 구독만 모든 아이템에 걸고, 읽는 값은 처음에는 없음이고 뒤에는 마지막으로 바뀐 아이템의 값이다(`AbstractNode.ts:519-533`). 이력에 따라 결과가 달라지므로 P3(GOAL-029)에 걸린다.
  - (5): FRAGMENT-016("`if`와 `controls.active`가 같다"), GOAL-049, GOAL-006(G4), CONTROLS-054, 1라운드 소유자 답(`reviews/round-1.md:177`, 가드는 어떤 값을 보는가) — 나머지 식으로 넓히는 것은 편집자 유추다. CONTROLS-024·WRITE-038.
  - (6): 12-8 반영 칸(`reviews/round-18-owner-answers.md:18`, 편집자의 반영). 청사진에 없는 경로도 `extras`의 키를 읽는 정당한 식일 수 있어 경고를 두면 오탐이 난다(편집자 판단).
  - (8): `RootNodeContextProvider.tsx:79-82`, `AbstractNode.ts:519-547`(오늘도 맥락 변경이 의존 식을 다시 계산한다), `src/providers/WorkspaceContext/WorkspaceContextProvider.tsx:28-31`(얕은 병합), FRAGMENT-027
  - 이미 현행인 부분: CONTROLS-018, CONTROLS-043, FRAGMENT-016, CONTROLS-054, ERROR-121·ERROR-122, ERROR-159

### 18C-14 `controls.injectTo`의 함수 형태, `ctx`, 반환

- 닫는 항목: CONTROLS-067
- 결정:
  - 【추론】 형태는 `controls.injectTo: (value, ctx) => { [경로]: 값 } | Array<[경로, 값]> | null | undefined`다.
  - 【추론】 오늘의 `InjectToHandler` 그대로이며, 문자열 식 형태는 두지 않는다.
  - 【추론】 `controls.injectTo`는 함수 형태 하나이고(CONTROLS-019, `reviews/round-15-decisions.md:10`) 반환 경로는 실행해야 알 수 있으므로 청사진이 정적으로 아는 대상은 없다.
  - 【추론】 ERROR-123은 적용되는 경우가 없다.
  - 【추론】 대상 경로가 청사진에 없거나 터미널 아래인 경우는 모두 ERROR-122·ERROR-127의 동적 대상 없음(`SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING`: 그 규칙을 후보에서 빼고 커밋, 모든 환경에서 사슬 끝 throw, `degraded`, 제출 거부)이며, 이는 R17-1 나의 효과를 그대로 지킨다.
  - 【추론】 (가칭) `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND`는 낼 자리가 없으므로 PR-4의 코드 확정에서 뺀다.
  - 【추론】 `value`는 원천의 방출 값이다.
  - 【추론】 `ctx`는 오늘의 여덟 칸을 이름 그대로 둔다: `dataPath`, `schemaPath`, `jsonSchema`, `parentValue`, `parentJSONSchema`, `rootValue`, `rootJSONSchema`, `context`.
  - 【추론】 값 칸은 모두 이번 파생 라운드 트리의 방출 값이다(18C-13 (5)).
  - 【추론】 `jsonSchema`는 원천 노드의 유효 스키마다.
  - 【추론】 `context`는 `@`와 같은 객체다.
  - 【추론】 루트에서는 `parent…` 두 칸이 `null`이다.
  - 【추론】 칸을 더하지 않는다.
  - 【추론】 반환의 키는 원천 노드를 기준으로 한 경로다.
  - 【추론】 각 항목은 대상에 대한 전체 교체이고, 파생 단계의 후보로서 SETTLE-004의 순위를 따른다.
  - 【추론】 값이 `undefined`인 항목은 쓰지 않는다.
  - 【추론】 한 반환 안에서 같은 대상이 둘이면 뒤의 것이 이긴다.
  - 【추론】 객체는 키 삽입 순서, 배열은 차례를 따른다.
  - 【추론】 `null`이나 `undefined`를 반환하면 이번 에지에서는 아무것도 쓰지 않고, 에지는 소비한다.
  - 【추론】 `@`는 대상이 아니다.
  - 【추론】 형상에 없는(비활성) 대상은 오류가 아니며(ERROR-124) 잠복 원본에 쓴다(CONTROLS-053, WRITE-018과 같은 분배).
  - 【추론】 대상이 나중에 켜져도 다시 발화하지 않는다(CONTROLS-053은 현행이다).
  - 【추론】 ERROR-124의 '그 노드에 쓰지도 않는다'는 형상에 없는 노드 자신의 규칙에 대한 말이며, 다른 규칙이 그 노드를 겨눈 쓰기(`controls.injectTo`)에는 적용되지 않는다.
  - 【추론】 함수 안의 쓰기: 다른 노드에 쓰는 정해진 길은 반환이다.
  - 【추론】 함수 안에서 폼의 공개 쓰기 API(`setValue`·`push`·`pop`·`update`·`remove`·`clear`·`batch`, EVENT-027)를 부르면 리스너 되먹임 쓰기와 같게 다룬다.
  - 【추론】 그 쓰기를 오류로 막지 않는다.
  - 【추론】 바깥 쓰기가 호출 스택에 있으므로 새 진입이 아니라 안쪽 진입이다(EVENT-027).
  - 【추론】 그 쓰기는 지금 파동이 끝난 뒤에 돈다.
  - 【추론】 리스너 되먹임과 같은 되먹임 예산(최외곽 진입의 되먹임 사슬당 25, EVENT-008)에 든다.
  - 【추론】 넘으면 되먹임 초과와 같게 사슬 끝에서 던진다((가칭) `SCHEMA_FORM_ERROR.FEEDBACK_LIMIT_EXCEEDED`, `adr/0014-error-policy.md:271`).
  - 【추론】 정착 중에 사용자 코드가 쓰는 장치는 이것 하나다(G4).
  - 【추론】 새 코드는 없다.
  - 이주(LANDING-138): `injectTo` 반환의 값이 `undefined`인 항목은 오늘 `undefined`로 덮어쓰고, 새 설계에서는 쓰지 않는다.
- 근거:
  - CONTROLS-019("`injectTo`(함수→`{ 경로: 값 }`)"), 15라운드 결정 2(`reviews/round-15-decisions.md:10`)
  - R17-1(`reviews/round-17-owner-answers.md:9`)이 정한 것은 환경과 강도(모든 환경에서 던짐, `degraded` 동안 제출 거부, 스위치 없음)다. "정적 대상 없음은 청사진 오류"라는 분류는 편집자가 쓴 선택지 나의 글이다(`reviews/raw-round17-convergence.md:105`). 정적 대상 모양은 스파이크에만 있고 채택되지 않았다(`spikes/work-loop/redteam3/attacks.mjs:129`, `spikes/round10/r10.mjs:24`).
  - 비활성 대상: CONTROLS-053(현행), WRITE-018(전체 교체는 꺼진 노드까지 분배), CONTROLS-053의 네 경로 동치, 18C-64의 비활성 경로 쓰기. 오늘도 `this.find(path)?.setValue(…)`로 쓴다(`AbstractNode.ts:1004`).
  - CONTROLS-016(철자는 하나), CONTROLS-054와 `adr/0007-settle-cycle.md:79`(원천의 방출 값), CONTROLS-027 보충(`08-design-a-to-z.md:109`, 대상에 전체 교체), CONTROLS-043(기준점)
  - `null`·`undefined` 반환이면 쓰지 않음, 12라운드 §9의 소유자 답: "동의. 이는 자칫 ealry return 과 혼동이 발생해서 문제가 있었다"(`reviews/round-12-owner-answers.md:20`, 물음은 `reviews/round-12-owner-review.md:250`) — 항목마다 `undefined`를 쓰지 않는 규칙은 그 답의 편집자 확장이며 CONTROLS-037, CONTROLS-026 보충(`08-design-a-to-z.md:108`)과 같은 규칙이다.
  - 뒤가 이기는 순서는 SETTLE-004의 "뒤가 앞을 덮는다"다.
  - 함수 안의 쓰기: EVENT-008(리스너 안의 쓰기는 같은 최외곽 진입의 사슬, 되먹임 파동 25), EVENT-027, `adr/0014-error-policy.md:271`(되먹임 초과는 고리 하나를 끊고 사슬 끝 throw, 모든 환경), GOAL-065(틱 기반 재진입 가드 T-14는 상한으로 대체됨)
  - 오늘 코드: `src/types/injectTo.ts:62-73`, `:104`, `:225`; `AbstractNode.ts:976-1020`(오늘 `getAbsolutePath`와 `setValue(Overwrite)`로 `undefined`까지 쓴다)

### 18C-15 다른 호스트를 읽는 `controls.active`의 평가 순서와 재순회

- 닫는 항목: SETTLE-036, FRAGMENT-039(중복)
- 결정:
  - 【추론】 `controls.active` 게이트(노드 게이트, 조각 게이트, 18C-12의 `controls.children` 항목 게이트)가 선언한 호스트의 하위 트리 밖을 읽으면, 청사진이 그 게이트의 평가 자리를 L로 옮긴다.
  - 【추론】 L은 선언한 호스트와, 식이 읽는 모든 경로의 자리를 함께 덮는 가장 낮은 공통 조상 호스트다.
  - 【추론】 `#` 단독과 `(/)`(루트 값 전체)는 루트로 셈하고, `/p`·`#/p`는 `p`의 자리로 셈한다.
  - 【추론】 `@`는 노드가 아니라 공통 조상 계산에 들지 않는다.
  - 【추론】 옮긴 게이트는 L의 바퀴에서 다른 게이트와 같은 절차로 평가한다.
  - 【추론】 꺼진 채 출발하고, 매 바퀴 모두 평가하며, 가우스-자이델로 즉시 반영한다.
  - 【추론】 L의 전순서에서, 옮긴 게이트는 선언한 호스트로 이어지는 L의 자식을 선언한 조각의 바로 뒤, 그 조각의 노드 게이트들 뒤에 든다.
  - 【추론】 옮긴 게이트끼리는 문서 순서를 따른다.
  - 【추론】 옮긴 게이트의 값이 바뀌면 L은 바퀴 안에서 L부터 선언한 호스트까지의 경로를 재계산한다.
  - 【추론】 메모는 상속 overlay와 같게 한다.
  - 【추론】 이 재계산은 호스트 바퀴 예산에 함께 센다.
  - 【추론】 재순회는 없다.
  - 【추론】 두 번째 하강이 없으므로 계산은 여전히 루트에서 한 번 내려간다.
  - 【추론】 다른 키는 순서 문제가 없다: 상태 키는 계산 끝의 최종 트리에서, 파생 규칙은 완성된 트리에서 평가한다(SETTLE-003, SETTLE-004).
- 근거:
  - 버린 선택지: 하향 순회(자식 먼저, SETTLE-003)에서는 하위 트리 밖의 방출이 아직 정해지지 않을 수 있다. 직전 커밋의 값을 읽으면 형상이 이력을 읽게 되어 FRAGMENT-017의 1("직전 커밋의 활성 집합은 읽지 않는다")과 SETTLE-029(P3)에 걸린다. 재하강 방식은 SETTLE-003의 한 번 하강과 SETTLE-017의 예산 식을 바꾼다.
  - 공통 조상으로 옮기면 FRAGMENT-027(E12, `if`를 공통 조상으로 끌어올림)과 SETTLE-024(상속 overlay: 부모 바퀴 안의 재계산과 메모)와 같은 장치가 된다(G4). 예산은 SETTLE-017을 따른다.
  - 평가 순서는 SETTLE 영역의 몫이다(그래서 FRAGMENT-039는 SETTLE-036의 중복이다).
  - 이 문제를 다룬 소유자 답은 없다. 출처 문장은 `07-conclusions.md:458`, `08-design-a-to-z.md:256`이다.
- 게이트:
  - PR: PR-2 정착 시나리오(18C-25의 PR-2 시험)와 PR-2 벤치.
  - (a) 사촌 하위 트리를 읽는 노드 게이트를 단언한다.
  - (b) `#`를 읽는 게이트를 단언한다.
  - (c) 서로를 읽는 두 호스트의 양의 순환이 이력과 무관하게 같은 원본에서 같은 형상을 내는지 단언한다.
  - 벤치: 루트로 옮긴 게이트가 N개일 때 키 입력 한 번의 비용을 잰다.
  - 통과: 18C-27의 선(`guard:check`) 안이다.
  - 실패: ADR 0009 §4 절차(이유를 적고 Vincent가 받아들여야 병합)를 따른다.

## §3 쓰기

### 18C-16 비객체 V의 `Merge`, 입력 `onChange`의 쓰기 종류, `Overwrite`·`Merge` 비트, 되먹임 거부 표면

- 닫는 항목: WRITE-069, ERROR-048, SURFACE-025(현행 → 대체됨)
- 결정:
  - 【추론】 (나) `Merge`는 키로 합칠 수 있는 자리에서만 합친다.
  - 【추론】 그 자리의 값을 통째로 바꾸는 경우는 둘이다.
  - 【추론】 하나는 V나 V 안의 값이 평범한 객체가 아닌 때다(`null`, `undefined`, 원시 값, 배열, 객체 호스트에 온 배열).
  - 【추론】 다른 하나는 그 자리의 노드가 객체 호스트가 아닌 때다.
  - 【추론】 이는 이미 정한 배열 규칙('통째로 준 배열은 통째 교체')을 일반화한 것이다.
  - 【추론】 바뀐 자리의 자식 원본은 없음이 되고, 호스트는 받은 값을 든다(`undefined`면 없음).
  - 【추론】 이 쓰기는 부분 쓰기이며 로드가 아니다.
  - 【추론】 그래서 채움은 이 쓰기로 새로 생긴 노드에만 들어간다.
  - 【추론】 로드가 아닌 쓰기로 온 `null`·비객체 값도 그 자리의 자식 원본을 없음으로 만들지만 새 수명이 아니므로 채움을 받지 않는다(WRITE-014의 '빈 상태' 채움은 로드에만 해당).
  - 【추론】 호출자 오류로 던지지 않고 조용히 버리지도 않는다.
  - 【추론】 그래서 새 코드가 없다.
  - 【추론】 틀린 종류의 값이면 S1 규칙대로 경고등이 켜지고 `VALUE_TYPE_MISMATCH` 경고가 간다.
  - 【추론】 (다) 입력 구성 요소가 옵션 없이 `onChange(V)`를 부르면 '입력 쓰기'다.
  - 【추론】 그 노드의 값이 V가 된다.
  - 【추론】 잎과 터미널에서는 원본을 바꾼다.
  - 【추론】 자식이 있는 노드에서는 V에 없는 자식이 없음이 되고, 선언되지 않은 키는 `extras`로 간다.
  - 【추론】 트리 전체로 보면 그 노드 아래만 바뀌는 부분 쓰기이며 로드가 아니다.
  - 【추론】 그래서 새 수명이 없고, 지운 키를 다시 채우지 않으며, 채움은 생긴 노드에만 들어간다.
  - 【추론】 `derived`와 `injectTo`는 평소 에지 규칙을 따른다.
  - 【추론】 Refresh는 쓴 입력 자신에게 보내지 않는다(T-2).
  - 【추론】 이 쓰기로 원본이 바뀐 자손에게만 보낸다(ADR 0007 §3의 출처 규칙).
  - 【추론】 입력은 두 번째 인자로 공개 비트마스크를 넘길 수 있다(오늘도 넘긴다).
  - 【추론】 `Overwrite`를 주면 V가 무엇이든(`undefined` 포함, 18C-17) 그 노드의 로드가 된다.
  - 【추론】 그래서 자기 입력까지 Refresh를 받는다.
  - 【추론】 `Merge`를 주면 (나)의 부분 쓰기가 된다.
  - 【추론】 출처 규칙대로 자기 입력은 Refresh를 받지 않는다.
  - 【추론】 억제 비트는 그 쓰기가 일으킨 자동 쓰기에 적용된다.
  - 【추론】 `Overwrite`와 `Merge`는 서로 겹치지 않는 비트다.
  - 【추론】 둘을 함께 주면 `INVALID_WRITE_OPTION`이다.
  - `Overwrite`가 전체 교체이자 기본값이고 `Merge`가 부분 쓰기인 것은 오늘과 같다(SURFACE-025 그대로).
  - 【추론】 `handleChange`의 바깥 오류 지움과 dirty 표시(REACT-011)는 옵션과 무관하게 그대로다.
  - 【추론】 (라) 되먹임 거부를 호출자에게 알리는 별도 표면은 두지 않는다.
  - 【추론】 거부된 리스너 되먹임 쓰기는 안쪽 진입이므로 정상 반환한다.
  - 【추론】 사슬 머리가 끝날 때 `FEEDBACK_LIMIT_EXCEEDED`를 던지고, 그 기록은 `onError`로 간다.
  - 【추론】 비객체 V의 `Merge`, `setValue(undefined)`, 되먹임 거부 표면(안건 `reviews/round-18-agenda.md:42-43`)에서는 새 오류 코드가 생기지 않는다.
  - 이주(LANDING-139): 입력이나 `Merge`로 된 `null` 아래의 자식은 오늘 기본값 상태를 보이고(S4, `ObjectNode/DETAIL.md:19`), 새 설계에서는 채움 없이 없음이다.
  - 이주(LANDING-140): 입력이 넘긴 `Merge`는 오늘 `Refresh` 비트로 자기 입력을 다시 마운트하고(`value.ts:63`), 새 설계에서는 다시 마운트하지 않는다.
  - 이주(LANDING-141): `Overwrite | Merge`는 오늘 `Overwrite`로 동작하고(`value.ts:65`), 새 설계에서는 `INVALID_WRITE_OPTION`으로 던진다(`adr/0014-error-policy.md:276` 행의 이주 쪽).
- 근거:
  - WRITE-006(D-4, `adr/0013-core-does-not-rewrite-values.md:36`), WRITE-007(`adr/0013-core-does-not-rewrite-values.md:38-47`), WRITE-027(로드는 새 수명), WRITE-014(D-1, `adr/0013-core-does-not-rewrite-values.md:53`), WRITE-017
  - D-7의 소유자 칸: "form에 값을 씌우는 경우와 기본값을 설정하는 경우가 다르다. props로는 함수 단위 제어가 안 된다."(`reviews/round-4.md:113`) — 같은 줄의 "(a) 그대로(로드는 로드다, …)"는 선택지 칸에 적힌 편집자의 글이다.
  - WRITE-015 `Merge` 행 "V가 통째로 준 배열은 통째 교체다"(`adr/0013-core-does-not-rewrite-values.md:66`)
  - 소유자 C-2: "예 맞습니다"(`reviews/round-10-owner-answers.md:18`, `Merge`+`undefined`로 키 제거), 소유자 C-11: "undefined 를 onChange 로 전달하는게 값을 빼는 것으로 동작할겁니다"(`reviews/round-10-owner-answers.md:15`, REACT-005) — 옵션 없는 입력 쓰기에 해당한다.
  - WRITE-001과 EVENT-008 "사용자 입력과 호출자 쓰기는 결코 거부하지 않는다"(`adr/0008-event-system.md:66`), `08-design-a-to-z.md:274`(잘못된 종류를 든 호스트의 자식)
  - 오늘 코드: 입력 기본 옵션은 `Replace|Propagate|EmitChange|PublishUpdateEvent`(`src/components/SchemaNode/SchemaNodeInput/type.ts:33-37`), 입력이 옵션을 넘기는 실제 사용(`stories/03.FormTypeInput.stories.tsx:135,138`), `Merge`에는 `Refresh`가 들고(`src/core/types/value.ts:63`) `Overwrite = Replace | Merge`다(`:65`), S4(`src/core/nodes/ObjectNode/DETAIL.md:19`)
  - `adr/0007-settle-cycle.md:90`(Refresh는 출처로), GOAL-053(T-2), REACT-019
  - `INVALID_WRITE_OPTION`: `adr/0014-error-policy.md:85`, `:236`, `:276`
  - 되먹임: `adr/0014-error-policy.md:49`(안쪽 진입은 정상 반환하고 사슬 머리가 끝날 때 한 번 던진다), `:271`. 같은 ADR의 미결 목록 `:335`가 이 표면을 열린 것으로 적으므로 (라)는 이미 닫힌 것이 아니라 편집자 결정이다.

### 18C-17 `setValue(undefined)`와 `Overwrite`로 온 `undefined`

- 닫는 항목: WRITE-058
- 결정:
  - 【추론】 규칙은 쓰기 종류마다 하나다.
  - 【추론】 쓰기의 종류는 호출자가 선언하고, core는 값으로 종류를 추론하지 않는다(D-4).
  - 【추론】 V가 `undefined`라는 것은 종류를 바꾸지 않는다.
  - 【추론】 `Overwrite`는 V가 무엇이든(`undefined` 포함) 그 노드 서브트리의 로드이며 채움을 받는다.
  - 【추론】 공개 `setValue`의 기본 옵션도 `Overwrite`이므로 `setValue(undefined)`가 여기에 든다.
  - 【추론】 노드와 자손의 원본이 없음이 된다.
  - 【추론】 로드는 새 수명이므로(WRITE-027), 형상의 노드 가운데 `controls.default`나 `default`를 가진 것은 채움을 받는다.
  - 【추론】 `setValue(null)`(D-1)과 같은 길이다.
  - 【추론】 다른 점은 하나다: 호스트가 `null`을 들지 않고 없음이다.
  - 【추론】 입력이 `onChange(undefined, SetValueOption.Overwrite)`를 부른 경우도 같다(18C-16 (다)).
  - 【추론】 가상 노드에서는 참조한 잎마다 `Overwrite`로 `undefined`를 쓰므로 잎마다 같은 규칙을 따른다(18C-21).
  - 【추론】 채움 없이 값을 빼는 길은 셋이다.
  - 【추론】 첫째, `DisableAutomaticWrites` 비트를 준다(D-7의 호출 단위 옵션).
  - 【추론】 둘째, `Merge`를 쓴다(18C-16 (나), 소유자 C-2).
  - 【추론】 셋째, 입력 구성 요소는 옵션 없이 `onChange(undefined)`를 부른다.
  - 【추론】 이는 입력 쓰기이므로(18C-16 (다)) 채움 없이 값을 뺀다.
  - 【추론】 소유자 C-11(REACT-005)을 지킨다.
  - 【추론】 `setValue`와 `SetValueOption.Overwrite`의 문서 주석에 적는다: "V가 `undefined`여도 로드이며, 기본값이 있는 자리는 다시 채워진다. 채움 없이 값을 빼려면 `Merge`나 `DisableAutomaticWrites`를 쓴다."
  - 【추론】 `FormTypeInputProps`의 `onChange`와 입력 작성 문서(18C-40 (2)의 입력 계약과 같은 자리)에 적는다: "값을 빼려면 옵션 없이 `onChange(undefined)`를 부른다. `Overwrite`를 넘기면 기본값이 다시 채워진다."
  - 이주(LANDING-142): `setValue(undefined)`(기본 `Overwrite`)는 오늘 채움 없이 비우고(`ObjectNode/DETAIL.md:21`), 새 설계에서는 `default`가 있는 자리에 기본값이 다시 들어간다.
    - 채움 없이 비우려면 `Merge`나 `DisableAutomaticWrites`를 쓴다.
  - 이주(LANDING-143): 입력의 `onChange(undefined, SetValueOption.Overwrite)`는 새 설계에서 로드라 기본값이 다시 채워진다.
    - 값을 빼는 입력은 `Overwrite`를 뺀다.
    - 저장소에서 고칠 곳은 `stories/03.FormTypeInput.stories.tsx:138`(`removeClick`), `:213`, `stories/08.VirtualSchema.stories.tsx:441`, `:531`이다.
    - 입력 작성자에게는 이주 안내 항목(C8)으로 알린다.
- 근거:
  - D-4: "쓰기의 종류는 **호출자가 선언한다.** core는 추론하지 않는다(D-4)."(`adr/0013-core-does-not-rewrite-values.md:36`)
  - D-7의 소유자 칸: "form에 값을 씌우는 경우와 기본값을 설정하는 경우가 다르다. props로는 함수 단위 제어가 안 된다."(`reviews/round-4.md:113`) — 값을 씌우는 로드와 기본값 채움을 가르는 수단은 값이 아니라 호출 단위의 옵션이다. WRITE-017도 같은 답에서 나왔다.
  - 소유자 C-11: "다만, 개별 formTypeInput 에서는 undefined 를 onChange 로 전달하는게 값을 빼는 것으로 동작할겁니다."(`reviews/round-10-owner-answers.md:15`) — 이 답은 옵션을 가르지 않는다. 옵션 없는 입력 쓰기로 읽은 것은 편집자다. 입력이 `Overwrite`를 명시하면 D-4대로 호출자가 선언한 종류가 이긴다.
  - WRITE-027, WRITE-014(`adr/0013-core-does-not-rewrite-values.md:53`), WRITE-010(`undefined`는 없음)
  - 설계 가치: "where behavior could go either way, follow the consistency the public interface leads a caller to expect"(`packages/canard/schema-form/CLAUDE.md:7`) — `Overwrite`가 값에 따라 로드이기도 하고 아니기도 하면 호출자는 옵션만 보고 결과를 알 수 없다.
  - 이 물음은 5라운드부터 열려 있었다(`reviews/round-5-decisions.md:39`, `reviews/round-5-derivations.md:40`).
  - 오늘 코드: "`undefined` 대입은 null과 다른 동작입니다: 서브트리를 비우며 자식 `default`를 복원하지 않습니다."(`src/core/nodes/ObjectNode/DETAIL.md:21`), 저장소 스토리는 `onChange(undefined, SetValueOption.Overwrite)`로 값을 지운다(`stories/03.FormTypeInput.stories.tsx:138`, `:213`, `stories/08.VirtualSchema.stories.tsx:441`, `:531`).

### 18C-18 객체 호스트 `default`의 자손 분배

- 닫는 항목: WRITE-070
- 결정:
  - 【추론】 호스트(객체, 배열)의 채움 값 D는 `controls.default` > `default` 순이다.
  - 【추론】 D는 그 호스트가 처음 채워지는 라운드의 유효 스키마에서 읽는다.
  - 【추론】 호스트가 생길 때 없음이면, D는 그 호스트에 대한 쓰기로 들어간다.
  - 【추론】 분배는 그 호스트에 대한 쓰기와 같다.
  - 【추론】 D의 키는 해당 자식의 원본이 된다(더 깊이 재귀).
  - 【추론】 선언되지 않은 키는 `extras`로 가고, D가 객체가 아니면 호스트가 그 값을 든다.
  - 【추론】 객체 호스트가 없음이라는 것은 호스트와 모든 자손의 `raw`·`extras`가 없음인 것이다(상태 둘에서 계산, P3).
  - 【추론】 그래서 로드한 V가 그 자리에 `{}`를 주어도 호스트는 D를 받는다.
  - 【추론】 채움은 부모부터 순회한다.
  - 【추론】 그래서 D가 준 키의 자손은 이미 없음이 아니어서 자기 `default`를 받지 않는다.
  - 【추론】 D에 없는 자손은 없음으로 남아, 자기 차례에 `controls.default` > `default`를 받는다.
  - 【추론】 채움은 자동 쓰기이므로 억제 비트의 대상이고, 원본 B의 자동 쓰기 기록에 든다.
  - 【추론】 D는 복사하거나 불변으로 다룬다(F24).
  - 【추론】 분배된 값은 잎마다 `interpret`를 지난다.
  - 【추론】 꺼진 조각의 자손에도 쓰기의 분배 규칙대로 들어가 잠복 원본이 된다(WRITE-018과 같은 분배).
  - 이주(LANDING-144): 로드한 값이나 부모가 그 자리에 준 `{}`는 오늘 호스트 `default`를 막고(`AbstractNode.ts:1197-1199`), 새 설계에서는 `{}`여도 호스트가 `default`를 받는다(사용자에게 보이는 변화).
- 근거:
  - WRITE-007 채움 행(`adr/0013-core-does-not-rewrite-values.md:38-47`, `03-mental-model.md:85` '처음 채워지는 전이 라운드의 유효 스키마')
  - 없음은 상태 둘에서 계산한다(P3). VALUE-002는 가지 호스트의 `raw`가 잘못된 종류의 값일 때만 든다고 적고, WRITE-010은 `{}`와 없음이 다르다고 적는다.
  - 프로토타입은 상태 밖의 `absent` 표지로 같은 판정을 했다(`spikes/round9/proto/loop-v5.mjs:548`, `:1266`). 새 설계는 이를 두 상태로부터 계산한다.
  - 프로토타입은 부모부터 순회한다(`spikes/round9/REPORT-proto.txt:228`, `spikes/round9/proto/loop-v5.mjs:1402-1427`).
  - 오늘 코드: 부모가 준 값이 있으면 자기 `default`를 쓰지 않는다(`src/core/nodes/AbstractNode/AbstractNode.ts:1197-1199`), `BranchStrategy.ts:343`
  - WRITE-071(F24), WRITE-015(억제 범위에 채움), WRITE-056(모든 쓰기가 `interpret`), WRITE-018

### 18C-19 `trim` 쓰기의 부수 효과

- 닫는 항목: CONTROLS-008, ERROR-050, LANDING-047(현행 → 대체됨)
- 결정:
  - 【추론】 포커스 아웃 때 자른 값을 쓰는 것은 자동 쓰기다.
  - 【추론】 다른 자동 쓰기(채움, `derived`, `injectTo`, `unsetValue`, 나감의 비움)처럼 원본만 쓴다.
  - 【추론】 바깥 오류를 지우지 않고 dirty를 표시하지 않는다(오늘 `trim`과 같다).
  - 【추론】 값 쓰기, 바깥 오류 지움, dirty 표시를 `batch` 하나로 묶자는 스웜의 권고(`reviews/round-18-agenda.md:45`)는 버린다.
  - 【추론】 그 세 가지 묶음은 사용자 입력의 `handleChange`에만 있는 것이다.
  - 【추론】 자른 값이 현재 값과 같으면 쓰지 않는다(12-2).
  - 【추론】 억제를 켠 폼에서는 자르지 않는다.
  - 【추론】 자동 쓰기이므로 그 노드의 입력은 Refresh를 받는다.
  - 【추론】 이미 포커스를 잃은 뒤라 치던 글자를 잃지 않는다.
  - 【추론】 `UpdateValue`의 출처 칸 값은 자동 쓰기(trim)다(12-5).
  - 【추론】 바깥 오류는 검증 결과 층이다.
  - 【추론】 그래서 ADR 0014의 층 구분은 바뀌지 않는다.
  - 이주(LANDING-145, 이주 44를 대신함): 오늘은 흐림 때 원본을 잘린 값으로 덮고 `RequestRefresh`는 없다(`StringNode.ts:118-121`, `:43`, `value.ts:51`).
    - 새 설계에서는 `finishInput` 칸이 자르고, 쓰기는 자동 쓰기다.
    - 바깥 오류와 dirty는 건드리지 않고(오늘과 같음), 같은 값이면 쓰지 않는다.
    - 자동 쓰기이므로 비제어 입력이 흐림 때 다시 마운트된다(오늘과 다름).
- 근거:
  - 소유자 12-2: "자동 쓰기 아닙니까? 그리고 trim 전후 값이 같으면 쓰지 않아도 됩니다. 효율적이게."(`reviews/round-18-owner-answers.md:12`, WRITE-078)
  - R17-3의 소유자 원문(`reviews/round-17-owner-answers.md:11`)에는 '사용자 입력과 같은 쓰기'가 없다. 그 문구는 반영 칸, 곧 편집자의 글이다.
  - REACT-011(세 동작은 `handleChange` 진입에서 한다, `09-landing-and-test-strategy.md:50`), `adr/0008-event-system.md:76`(자동 쓰기는 원본 쓰기의 한 층)
  - VALUE-022, C6 현행 유지(`00-goals.md:109`), EVENT-042, 12-5(`reviews/round-18-owner-answers.md:15`)
  - 오늘 코드: `src/core/nodes/StringNode/StringNode.ts:118-121`(자르기만 하고 dirty와 바깥 오류는 건드리지 않는다), `SchemaNodeInput.tsx:49-56`, `__emitChange__`의 기본 옵션 `SetValueOption.Default`(`StringNode.ts:43`), `Default = EmitChange | PublishUpdateEvent`(`src/core/types/value.ts:51`)라 `RequestRefresh`가 나가지 않는다(`StringNode.ts:61-62`).

### 18C-20 `batch` 안의 읽기와 updater

- 닫는 항목: 없음(안건 `reviews/round-18-agenda.md:47`을 가리키는 원장 항목이 없었다)
- 결정:
  - 【추론】 `batch(fn)` 안에서 updater는 이어진다.
  - 【추론】 같은 노드에 `setValue(p => p + 1)`을 두 번 부르면 2가 더해진다.
  - 【추론】 updater 꼴이 호출자에게 기대하게 하는 결과다.
  - 【추론】 updater의 `prev`는 직전 커밋에, 이 배치에서 앞서 표시된 쓰기 가운데 그 노드의 서브트리에 닿은 것을 순서대로 얹은 값이다.
  - 【추론】 잎의 `prev`는 이 배치에서 그 노드에 마지막으로 표시된 원본(`interpret`를 지난 값)이다.
  - 【추론】 표시가 없으면 직전 커밋이다.
  - 【추론】 가지의 `prev`는 커밋된 값에 그 서브트리의 표시들을 경로별로 덮어 얹은 값이다.
  - 【추론】 정착의 의미는 적용하지 않는다.
  - 【추론】 채움, `derived`, 투영은 `prev`에 들지 않고, `fn`이 끝난 뒤 정착에서 한 번 적용된다.
  - 【추론】 updater는 부른 자리에서, 그 쓰기를 표시하는 동안 실행된다.
  - 【추론】 정착 때 실행하지 않는다.
  - 【추론】 updater가 던지면 그것은 `fn`의 예외다.
  - 【추론】 ADR 0014의 진입 규칙대로 모아 두었다가 사슬 머리가 끝날 때 던진다(`adr/0014-error-policy.md:49`).
  - 【추론】 정착 오류가 되지 않는다.
  - 【추론】 `fn` 안의 평범한 읽기(`value`, `outputValue`, `inactiveValues`, `FormHandle.getValue()`)는 여전히 직전 커밋을 돌려준다.
  - 【추론】 읽기는 계산하지 않기 때문이다(VALUE-013).
  - 【추론】 가지의 덮어 얹기는 updater라는 쓰기의 일부이며 읽기가 아니다.
  - 【추론】 `batch` 밖에서는 두 규칙이 겹친다.
  - 【추론】 쓰기마다 정착하므로 `prev`는 직전 커밋, 곧 `value`다.
  - 【추론】 그래서 SURFACE-031의 "`prev`는 `value`다"는 `batch` 밖에서 그대로 맞고, `batch(fn)` 안에서는 이 블록의 규칙이 이긴다.
  - 【추론】 `fn` 안에서 `reset`을 부르면 그 로드는 호출 안에서 곧바로 정착하고, 앞서 표시된 쓰기를 덮는다(`09-landing-and-test-strategy.md:90`).
  - 【추론】 그래서 그 뒤의 읽기와 updater의 기준은 reset의 커밋이다.
  - 【추론】 비용은 `batch` 안에서 updater를 부를 때만 든다.
  - 【추론】 잎은 원본 하나를 읽는다.
  - 【추론】 가지는 그 서브트리에 앞서 표시된 경로 수에 비례하는 조립이 든다.
  - 【추론】 평범한 읽기와 `batch` 밖의 쓰기에는 새 비용이 없다.
  - 【추론】 `batch` 문서 주석에 다음을 적는다: "fn 안의 쓰기는 표시만 되고 fn이 끝날 때 한 번 정착한다. fn 안의 updater `setValue(prev => …)`는 부른 자리에서 실행되고, 앞선 쓰기를 반영한 `prev`를 받아 이어진다(같은 노드에 +1을 두 번 하면 +2). updater가 던지면 fn의 예외로 다뤄진다. 그 밖의 읽기(`value`·`outputValue`·`inactiveValues`·`getValue()`)는 직전 커밋을 돌려준다. 채움·`derived`·투영은 정착에서 적용되므로 `prev`에 들지 않는다. 채움과 `injectTo` 때문에 배치의 결과는 순차 호출과 다를 수 있다."
  - 이주(LANDING-146): 오늘은 `batch`가 없고, `setValue`는 부른 자리에서 적용되며 updater도 그 자리의 `value`로 곧바로 계산된다(`AbstractNode.ts:355-364`).
    - 새 설계에서 쓰기를 `batch(fn)`로 묶으면 updater는 오늘처럼 이어진다(+1 두 번이면 +2).
    - 그러나 `fn` 안의 `value`·`outputValue`·`inactiveValues`·`getValue()`는 직전 커밋을 돌려준다.
    - 쓰기 직후 `value`를 읽어 다음 쓰기에 쓰던 코드를 `batch`로 옮기면 updater로 바꾼다.
    - 이주 안내 항목(C8)으로 둔다.
- 근거:
  - 설계 가치: "follow the consistency the public interface leads a caller to expect"(`packages/canard/schema-form/CLAUDE.md:7`), "Speed first, minimal computation"(`:8`)
  - `adr/0014-error-policy.md:49`(사슬 안에서 난 오류는 `batch(fn)`의 fn이 던진 예외를 포함해 모아 두었다가 사슬 머리가 끝날 때 한 번 던진다), EVENT-013
  - `adr/0007-settle-cycle.md:36`(표시는 쓰기를 받은 노드의 `raw`·`extras`를 갱신한다 — 앞선 표시는 원본에 이미 있다)
  - VALUE-013(`adr/0006-single-value-ownership.md:70` "읽기는 계산하지 않는다"), EVENT-008(`adr/0008-event-system.md:66`)
  - SURFACE-031(`06-conclusions.md:358`)은 8·9라운드 편집자 결정이며 `batch`를 다루지 않았다.
  - GOAL-086과 `adr/0008-event-system.md:85`(배치와 순차의 값 차이는 채움과 `controls.injectTo`의 결과가 갈리는 것), `09-landing-and-test-strategy.md:90`
  - 오늘 코드: `src/core/nodes/AbstractNode/AbstractNode.ts:355-364`(updater를 `input(this.value)`로 곧바로 계산)

### 18C-21 가상 노드에 모양이 틀린 쓰기 `INVALID_VIRTUAL_NODE_VALUES`

- 닫는 항목: ERROR-069
- 결정:
  - 【추론】 가상 노드가 받는 값은 둘뿐이다.
  - 【추론】 하나는 `undefined`이고, 참조한 잎 모두에 그 쓰기 종류로 `undefined`를 쓴다.
  - 【추론】 다른 하나는 길이가 참조 수와 같은 배열이다.
  - 【추론】 배열인지를 길이보다 먼저 본다.
  - 【추론】 그 밖의 값(`null`, 문자열을 포함한 배열 아닌 값, 길이가 다른 배열)은 거부한다.
  - 【추론】 가상 노드의 유일한 예외이며, 까닭은 자기 원본이 없어 받은 그대로 들 자리가 없기 때문이다.
  - 【추론】 나뉜 값은 잎마다 `interpret`를 지난다.
  - 【추론】 분류는 출처로 가른다.
  - 【추론】 공개 API(`setValue`, 그것을 부르는 입력의 `onChange` 포함)에서 오면 호출자 오류다.
  - 【추론】 즉시 throw하고, throw 직전에 `onError`로 보낸다.
  - 【추론】 자동 쓰기(`controls.injectTo` 등)에서 오면 정착 오류다.
  - 【추론】 그 규칙을 후보에서 빼고, 사슬 끝에서 throw하며, `degraded`가 된다.
  - 【추론】 `diagnostics.cause`에 다섯째 값 `(가칭) 'writeShape'`를 둔다(자동 쓰기가 대상이 받을 수 없는 모양의 값을 냄).
  - 【추론】 `'injectTarget'`은 "동적 대상 없음"이라는 한 뜻으로 남는다.
  - 【추론】 한 값이 한 뜻을 가져야 예측할 수 있기 때문이다.
  - 【추론】 `degraded`를 일으키는 경우에 '가상 노드에 모양이 틀린 자동 쓰기'가 더해진다.
  - 【추론】 코드는 오류 클래스와 무리를 옮겨 `SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES`(가칭)로 한다.
  - 【추론】 `JSON_SCHEMA_ERROR`는 청사진 오류의 무리이고, 이 사건은 쓰기의 오류이기 때문이다.
  - 【추론】 기록에는 `path`와 `details`(기대 길이, 받은 값)를 싣는다.
  - 이주(LANDING-147): 가상 노드에 모양이 틀린 쓰기의 오류 클래스가 `JSONSchemaError`에서 `SchemaFormError`로 바뀌고, 길이가 같은 문자열을 글자로 쪼개던 동작은 거부로 바뀐다.
- 근거:
  - 설계 가치(`packages/canard/schema-form/CLAUDE.md:7`): 한 값은 한 뜻이어야 예측할 수 있다.
  - `adr/0014-error-policy.md:257`(공개 API에서 오면 호출자 오류, 자동 쓰기에서 오면 정착 오류)
  - `adr/0014-error-policy.md:201`(`cause`의 넷, `'injectTarget'`은 동적 대상 없음), ERROR-132, ERROR-133
  - `reviews/raw-round18-s1-unconvertible-review.md:125`(규칙 8), `:133`(가상 노드 문단)
  - 오늘 코드 `src/core/nodes/VirtualNode/VirtualNode.ts:42-55`는 길이만 비교하고 `JSONSchemaError`를 던진다.
  - §7.1 호출자 오류 행(`adr/0014-error-policy.md:236`)

### 18C-22 재생성 reset의 개발 모드 경고 코드

- 닫는 항목: ERROR-067
- 결정:
  - 【추론】 코드는 `(가칭) SCHEMA_FORM_WARNING.RESET_REBUILT_BY_REFERENCE`, `level`은 `'warning'`이다.
  - 【추론】 `reset`의 같은 스키마 판정에서 JSON 부분은 깊게 같은데 함수·구성 요소 칸의 참조가 달라 재생성 경로를 탔을 때 낸다.
  - 【추론】 같은 스키마 판정은 처음 다른 곳에서 멈추는 비교다.
  - 【추론】 '참조만 다르다'를 알려면 JSON 부분을 끝까지 비교해야 해서, 재생성 경로에서 순회가 한 번 더 든다.
  - 【추론】 그래서 개발 모드이거나 `onError` 핸들러가 있을 때만 판정한다.
  - 【추론】 핸들러가 없는 프로덕션에서는 판정하지 않는다(`MULTIPLE_GATED_BRANCHES_ACTIVE`와 같은 관례).
  - 【추론】 기록에는 위치(폼 수준)와 `details`(참조가 달라진 칸의 `schemaPath` 목록)를 싣는다.
  - 【추론】 드러남은 경고 층의 일반 규칙을 따른다.
  - 【추론】 기본 출력은 개발 모드 콘솔이다.
  - 【추론】 `onError` 핸들러가 있으면 모든 환경에서 경고 기록을 보내고, 전달 시점은 reset 사슬 끝이다(`VALIDATOR_MISSING`의 재생성 reset과 같다).
  - 【추론】 중복 막기는 ADR 0014 §3의 경고 규칙(코드와 위치, 로드마다 비움)을 따른다.
  - 【추론】 그래서 그런 reset마다 한 번 간다.
  - 【추론】 reset을 부르지 않는 인라인 스키마에는 보내지 않는다.
  - 【추론】 이 코드는 새 설계에만 있어 이주 행이 없다.
- 근거:
  - `09-landing-and-test-strategy.md:87`(재생성 경로), `:81`(같은 스키마 판정: JSON 부분의 깊은 비교와 그 밖의 값의 참조 비교)
  - ERROR-176(프로덕션 무출력은 기본 출력에만 해당), `adr/0014-error-policy.md:152`(중복 막기)
  - §7.2 경고 행: `VALIDATOR_MISSING`의 전달 칸(`adr/0014-error-policy.md:293`), `MULTIPLE_GATED_BRANCHES_ACTIVE`의 판정(`:294`), 이름 관례 `PRESENTATION_KEY_SUSPECT`

### 18C-23 배열 전용 명령을 배열 아닌 노드에서 부른 호출자 오류

- 닫는 항목: ERROR-068
- 결정:
  - 【추론】 코드는 `(가칭) SCHEMA_FORM_ERROR.ARRAY_METHOD_ON_NON_ARRAY`, `level`은 `'error'`이고 호출자 오류다.
  - 【추론】 `type`이 배열이 아닌 노드에서 `push`·`pop`·`update`·`remove`·`clear`를 부르면, 행의 공유 칸이 모든 환경에서 즉시 `SchemaFormError`를 던진다.
  - 【추론】 throw 직전에 `onError`로 보낸다(surface `'thrown'`).
  - 【추론】 기록에는 `path`와 `details.method`를 싣는다.
  - 【추론】 §7.1 호출자 오류 행의 항목 목록과 ADR 0014 §3의 받는 것 목록에 더한다.
- 근거:
  - NODE-014(던지는 규칙은 현행, `09-landing-and-test-strategy.md:112`)
  - §7.1 호출자 오류 행(`adr/0014-error-policy.md:236`), `:127`(호출자 오류는 throw 직전에 부른다)
  - 이름 관례: `INVALID_WRITE_OPTION`·`DISPOSED_NODE_WRITE`

### 18C-24 §7.2 코드 목록의 (미정) 행

- 닫는 항목: ERROR-165
- 결정:
  - 【추론】 '(미정)' 행은 없앤다.
  - 【추론】 설계 항목이 정한 코드는 그 항목의 원장 번호와 함께 §7.2에 정식 행으로 더한다.
  - 【추론】 이름은 가칭이고 PR-4에서 확정한다(ERROR-164 머리 문단).
  - 【추론】 코드를 두지 않기로 한 항목은 행 없이 그 항목에 '코드 없음'을 적는다.
  - 【추론】 (미정) 행의 넷 가운데 같은 `$id` 사본 루트의 중복 등록(PR-4)은 코드 없음이다(18C-57).
  - 【추론】 같은 가상 이름의 다른 `fields`(슬라이스 1)는 청사진 오류 (가칭) `JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_MISMATCH`다(18C-07).
  - 【추론】 비객체 V의 `Merge`와 되먹임 거부 표면(슬라이스 2)은 코드 없음이며, 되먹임은 기존 `FEEDBACK_LIMIT_EXCEEDED`가 드러내고, `Overwrite`로 온 `undefined`도 코드가 생기지 않는다(18C-16, 18C-17).
  - 【추론】 `controls.children` 대상이 형상에 없을 때(슬라이스 6)는 코드 없음이고, 청사진에 없는 이름만 청사진 오류 (가칭) `JSON_SCHEMA_ERROR.CHILDREN_TARGET_NOT_FOUND`다(18C-12).
  - 【추론】 쓰기 쪽이 §7.2에 더하는 행은 `SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES`(무리 이동, 18C-21), `SCHEMA_FORM_WARNING.RESET_REBUILT_BY_REFERENCE`(18C-22), `SCHEMA_FORM_ERROR.ARRAY_METHOD_ON_NON_ARRAY`(18C-23)다.
  - 【추론】 청사진 쪽이 §7.2에 더하는 행은 `JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED`·`SCHEMA_FORM_ERROR.RECURSIVE_SHAPE_DIVERGED`(18C-01), `SCHEMA_FORM_WARNING.DEPENDENT_SCHEMAS_IGNORED_FOR_FORM`(18C-03), `JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_MISMATCH`(18C-07), `JSON_SCHEMA_ERROR.CHILDREN_TARGET_NOT_FOUND`(18C-12), `JSON_SCHEMA_ERROR.TERMINAL_OPTION_UNSUPPORTED`(18C-38)다.
  - 【추론】 렌더 계층의 빈 `ChildNodeComponents` 경고는 `SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL`(18C-73)이다.
  - 【추론】 12-4의 방언 불일치 경고(ERROR-188)의 코드는 (가칭) `SCHEMA_FORM_WARNING.DIALECT_MISMATCH`다.
  - 【추론】 S1 변환 실패의 `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH`(ERROR-186)는 이미 가칭으로 있다.
  - 【추론】 안건 `reviews/round-18-agenda.md:108`의 `if` 공허한 참 경고(Q10)는 두지 않으며 경고 코드도 없다.
  - 【추론】 FRAGMENT-023(현행(부정 결정), 소유자 E-23·E-19)과 ERROR-159의 충돌 칸이 그 줄을 이미 "정본과 다르다, 정본이 이긴다"로 닫아 두었다.
  - 【추론】 `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND`는 목록에서 빠진다(18C-14).
- 근거:
  - `adr/0014-error-policy.md:301`((미정) 행), `:333`, ERROR-164 머리 문단('(가칭)인 코드 이름은 PR-4에서 확정')
  - §7.2의 이름 무리: 청사진 오류 `JSON_SCHEMA_ERROR.*`, 런타임 `SCHEMA_FORM_ERROR.*`, 경고 `SCHEMA_FORM_WARNING.*`
  - 소유자 12-4: "경고정도는 주도록 합시다"(`reviews/round-18-owner-answers.md:14`), S1 셋째(`reviews/round-18-owner-answers.md:9`), 12-7(`reviews/round-18-owner-answers.md:17`)
  - Q10: `open-questions.md:68`, FRAGMENT-023, ERROR-043·ERROR-159의 충돌 칸

## §4 PR-2 경계

### 18C-25 PR-2의 독립 검증 경계

- 닫는 항목: TEST-015
- 결정:
  - 【추론】 "각 PR은 새 코드와 그 시험만으로 독립 검증된다"(§17.1)는 각 PR이 자기가 들여오는 기제를 검증한다로 읽는다.
  - 【추론】 뒤 PR의 기제가 있어야 하는 사례는 그 기제를 들여오는 PR의 시험으로 넘기며, 잃지 않도록 PR-0의 처분 목록이 사례마다 PR 번호를 단다.
  - 【추론】 (가) PR-2는 예산 다섯 가운데 호스트 바퀴와 전이 라운드를 실제 코드로 시험한다: 초과 시 원본 B 커밋, `diagnostics`의 `'degraded'`·`cause: 'budget'`·`exceededBudget`(`'hostWheel'`·`'transition'`), 다음 로드까지의 지속.
  - 【추론】 PR-2는 원본 B의 되돌림 기록 가운데 노드·이전 `raw`·이전 `extras`와 객체 자식의 생김·빠짐을 시험한다.
  - 【추론】 PR-2는 정착 오류의 throw를 시험한다.
  - 【추론】 PR-2에서 사슬은 `settle` 호출 하나다(`setValue`가 `settle` 쓰기로 직접 위임, `reviews/raw-round17-node-structure.md:74`).
  - 【추론】 커밋과 `diagnostics` 뒤 그 호출의 끝에서 던지는 것을 시험한다.
  - 【추론】 PR-2는 식·가드 실패의 자리별 값과 `cause: 'expression'`을 시험하며, 식은 PR-1의 실제 컴파일러를 쓴다.
  - 【추론】 PR-2는 `SetValueOption` 넷(억제 비트는 PR-2에 있는 자동 쓰기인 채움에 대해)과 로드의 새 수명을 시험한다.
  - 【추론】 PR-2는 나감 비움 가운데 노드 자신의 층과 Form 속성 층을 시험한다.
  - 【추론】 그 값은 참·거짓 리터럴이고, 하위 트리로 내려감, 자손의 `false`가 이김, 선언의 나감, 잠복 자손 비움, `extras` 불변을 포함한다.
  - 【추론】 PR-2는 노드 구조 시험 전부, 린트 설정, `active` 게터, 18C-39의 키 순서(직렬화 단언 포함), 18C-37의 형 게이트를 시험한다.
  - 【추론】 (나) 시험 대역은 게이트 술어 하나다(`08-design-a-to-z.md:572`의 "게이트는 술어 인터페이스 뒤의 스텁").
  - 【추론】 대역의 계약은 PR-4의 `compileGuard`가 돌려주는 술어와 같은 모양이다: 게이트 입력 값 하나를 받아 참·거짓을 돌려주고, 동기이며, 순수하다(같은 입력에 같은 답).
  - 【추론】 던지는 대역으로 가드 평가 실패(정착 오류)를 시험한다.
  - 【추론】 PR-4는 같은 시나리오를 실제 가드로 다시 돌린다.
  - 【추론】 그 밖의 대역은 두지 않는다.
  - 【추론】 시험만을 위한 주입 자리(파생 단계, 디스패처)를 새로 만들지 않는다(seiri `public-contract` §3).
  - 【추론】 (다) 파생 라운드 예산과 그 `degraded`, `DisableAutomaticWrites`의 파생·`injectTo` 억제는 PR-3으로 미룬다.
  - 【추론】 되먹임 파동과 `onChange` 중첩 예산, 진입 사슬의 사슬 끝 throw(중첩 진입, 통지·`onChange`와의 순서, `details.errors` 묶음)는 PR-4로 미룬다.
  - 【추론】 원본 B의 배열 아이템 구조 기록은 PR-5로 미룬다(TEST의 PR-5 행에 더함).
  - 【추론】 나감 비움의 `children` 항목 층, 조각 `controls` 층, 식 값(직전 커밋)은 PR-6으로 미룬다(TEST의 PR-6 행 "`unsetOnInactive` 층"에 명시).
  - 【추론】 `degraded` 동안의 제출 거부는 PR-7로 미룬다.
  - 【추론】 (라) 프로토타입 회귀의 배분: 한 사례는 그것이 건드리는 기제가 모두 있는 가장 이른 PR로 간다.
  - 【추론】 `selfcheck-v5`(63)는 a·b·c·d·e → PR-2(c 가운데 주입을 쓰는 단언은 PR-3), f(`disableAutomaticWrites`) → PR-3, g(통지) → PR-4로 간다.
  - 【추론】 `r8-port`(q8 108, 예산·원본 B 행렬)는 호스트 바퀴·전이만 쓰는 행 → PR-2, `derived`·`injectTo`를 쓰는 행 → PR-3으로 간다.
  - 【추론】 `r7-port`(52, E1–E13·X*)는 에지 발화 파생·`injectTo` → PR-3, X2·X3의 한 진입 묶음과 D-17 파동 세기 → PR-4로 간다.
  - 【추론】 `edge-cases`(26, `spikes/round9/regress/edge-cases.mjs`)는 조각 생김·채움·덧씌움 기본값·`allOf` else → PR-2, `clearValue`·`injectTo`·단계 순서·파생 예산 → PR-3, 잠금 결합 → PR-6으로 간다.
  - 【추론】 v7 회귀는 게이트 입력 `extras`·전이 상한·재계산 목록 순회·나감 비움(노드 자신·Form 속성 층) → PR-2, 같은 순위 동점·정착 단위 순위 → PR-3, 나감 에지 → PR-3(조각 `controls` 층의 사례는 PR-6)으로 간다.
  - 【추론】 안건 `reviews/round-18-agenda.md:56`의 실행 확인(게이트 입력 `extras` 정적 규칙, 같은 순위 규칙, 나감 에지, 전이 라운드 상한이 나감 비움을 포함해 실제로 보장되는지)은 위 v7 회귀를 배분받은 PR의 시험으로 한다.
- 근거:
  - `08-design-a-to-z.md:551`(§17.1), `:570`(v7의 범위), `:572-576`(§17.2, `:573` PR-3의 같은 대상 규칙), `03-mental-model.md:124`(같은 순위 동점은 파생 단계의 같은 대상 규칙), `08-design-a-to-z.md:244-248`(§7 예산)
  - 18C-51(나감 에지는 조각 `controls` 규칙)
  - `09-landing-and-test-strategy.md:169,171,173`, `adr/0008-event-system.md:88-95`
  - `spikes/round9/regress/selfcheck-v5.mjs:72-662`(시나리오 a–g 머리), `spikes/round10/round9-run/regress/RESULTS.txt`(63·108·52·26)
  - `reviews/round-18-agenda.md:56-57`, `.claude/rules/seiri_public-contract.md` §3

## §5 성능

### 18C-26 '일정 수준'의 형태와 선

- 닫는 항목: TEST-038
- 결정:
  - 【추론】 안건 §5의 성능 물음은 한 규칙에서 닫는다: 옛 판보다 느린 항목은 이유를 적고 Vincent가 병합 때 받아들인다(ADR 0009 §4, `adr/0009-performance-budget-and-benchmarks.md:92`).
  - 【추론】 이 규칙이 느림을 항목마다 통제하므로 새 수치를 지어내지 않는다.
  - 【추론】 '일정 수준'은 같은 실행에서 옛 판에 견주어 잰다(TEST-026의 하니스, 같은 폼의 쌍).
  - 【추론】 절대 수치는 두지 않는다.
  - 【추론】 선은 기존 `guard:check`의 규칙이다.
  - 【추론】 옛 판의 표본을 기준으로 넣고, 새 판의 처리량(초당 횟수) 평균이 15% 넘게 떨어지고 Welch p<0.05면 선을 넘는다(`packages/aileron/benchmark-form/src/utils/stat-regression.ts:81-112`, 기본값 `threshold` 15, `alpha` 0.05).
  - 【추론】 선을 넘은 항목은 ADR 0009 §4를 따른다.
  - 【추론】 이유를 적고 Vincent가 받아들여야 병합한다.
  - 【추론】 이것이 '통제 가능하고 일정 수준 안'을 지키는 절차다.
  - 【추론】 1.5배·2배 같은 배율 상한은 따로 두지 않는다.
  - 예: 가드 200개인 조건부 폼 생성은 새 판 23.0 ms(트리 585 µs + AJV 컴파일 22.4 ms) 대 오늘 13.4 ms, 1.7배(처리량 −42%)라 선을 넘는다.
  - 이 항목은 18C-30대로 PR-4의 수용 필요 항목으로 미리 적혀 있다.
- 근거:
  - 16라운드 답 6: "예, 대표적으로 if-then 을 사용한 무제한 스카마 확장 문법은 더 느릴수밖에 없을겁니다. 대신 통제 가능하고 일정 수준 내에서만 느리길 바랍니다"(`reviews/round-16-owner-answers.md:12`)
  - ADR 0009 §4: "옛 판보다 느린 항목은 이유를 적고 Vincent가 받아들여야 병합한다."(`adr/0009-performance-budget-and-benchmarks.md:92`) — 같은 절이 "기존의 통계적 게이트(`guard:check`)를 쓴다"고 적었다. TEST-027.
  - 기준선 `benchmark-form/results/baseline.json`(5회)의 상대 표준편차는 0.8–5.6%다. 15% 선은 그보다 넉넉히 높아 잡음에 흔들리지 않는다.
  - 같은 실행에서 옛 판에 견준 배율은 기계와 무관하고, 절대 수치는 기계에 따라 판정이 흔들린다.

### 18C-27 예산의 수치

- 닫는 항목: TEST-039
- 결정:
  - 【추론】 예산의 수치는 기존 `guard:check`를 그대로 쓴다.
  - 【추론】 처리량 평균이 15% 넘게 떨어지고 Welch p<0.05면 회귀다(`stat-regression.ts:81-112`).
  - 【추론】 표본은 TEST-026대로 100회 이상이다.
  - 【추론】 키 입력, 마운트, 대규모 쓰기(루트 통째 쓰기), 배치에 똑같이 적용한다.
  - 【추론】 회귀는 ADR 0009 §4 절차를 따른다(이유를 적고 Vincent가 받아들여야 병합).
  - 【추론】 스파이크의 기대 이득은 기대값으로 적으며, 게이트가 아니다.
  - 【추론】 18C-15의 벤치 게이트와 18C-31의 B1·B5·B6 합격선이 이 선을 쓴다.
  - 기대값: 루트 통째 쓰기(10k×5) 5.72 ms 대 215.7 ms, 배치 1000 368 µs 대 1.71 ms(`spikes/work-loop/REPORT.txt:245-249`), 트리 생성 flat 1,000 452.75 µs 대 4.63 ms, 트리 생성 array 10,000×5 13.15 ms 대 216.73 ms(`:113-114`).
  - 예: 기준선 `Scale Interact Flat flat-50`은 14.1 ms(처리량 70.8회/초)다.
  - 15.0 ms(+6.4%, 처리량 −5.9%)가 되면 선 안이라 통과한다.
  - 17.0 ms(처리량 −16.9%)가 되고 Welch p<0.05면 회귀다.
  - 선은 처리량 기준 15%이므로, 시간으로는 약 16.6 ms(+17.6%)가 경계다.
- 근거:
  - ADR 0009 §4(`adr/0009-performance-budget-and-benchmarks.md:92`): "기존의 통계적 게이트(`guard:check`)를 쓴다."
  - 기준선 `benchmark-form/results/baseline.json`(5회)의 상대 표준편차(aggregate 값, 모집단 표준편차)는 0.8–5.6%라 15% 선은 잡음과 가를 수 있다.
  - ADR 0009 `:97`의 후보 "잡음 범위 안(예: 5% 이내)"은 잰 근거가 없는 예시였다. "대규모 쓰기와 배치는 개선을 목표로 한다"는 기대값 기록으로 남긴다.
  - `guard:check`의 판정은 `meanHz`(처리량)의 변화율로 한다(`stat-regression.ts:108-112`). 위 예의 시간 수치는 기준선의 `meanHz` 70.82에서 환산했다.

### 18C-28 문서화된 안전 임계

- 닫는 항목: TEST-040
- 결정:
  - 【추론】 안전 임계를 목표 배율로 올려 적지 않는다.
  - 【추론】 문서는 잰 사실만 적는다.
  - 【추론】 PR-7 뒤 `MOBILE_PERFORMANCE_REPORT.md`(v0.10.6)와 같은 모바일 조건으로 다시 재고, 잰 임계를 문서에 적는다.
  - 【추론】 병합 게이트가 아니다.
  - 오늘 문서의 임계는 필드 50개 미만, 배열 아이템 30개 미만이다(`adr/0009-performance-budget-and-benchmarks.md:33`).
  - 참고 수치(문서의 임계는 아니다): 데스크톱 기준선 `baseline.json`(5회)에서 flat-500 마운트 약 112 ms, array-100 마운트 약 103 ms로 배열이 가장 약하고, 스파이크의 core 구성은 array 10k×5에서 13 ms 대 217 ms다(`spikes/work-loop/REPORT.txt:114`).
- 근거:
  - 가치 순위(`packages/canard/schema-form/CLAUDE.md:7`): 일관되고 예측 가능한 동작이 첫째다. 문서도 공개 표면이므로 재기 전의 목표 배율을 "안전"으로 적으면 지키지 못할 약속을 할 수 있다.
  - ADR 0009 `:98`("재설계의 목표를 이 임계를 몇 배로 올리는 것으로 둘 것인가")
  - 소유자: "벤치마크를 통해서 성능을 끌어올렸으면 한다"(`adr/0009-performance-budget-and-benchmarks.md:5`) — 18C-27의 게이트와 기대값이 맡고, 문서의 임계는 그 결과를 잰 사실로 적는다.

### 18C-29 번들 크기 예산

- 닫는 항목: TEST-041
- 결정:
  - 【추론】 측정 방법을 고정한다.
  - 【추론】 ESM 진입(`dist/index.mjs`)을 esbuild로 minify하고 gzip -9 하며, 의존성은 외부로 둔다.
  - 【추론】 기준은 v0.16.0(2026-09-21 빌드)의 37,023 B다.
  - 【추론】 배포되는 minify 없는 gzip(51,632 B)도 함께 보고한다.
  - 【추론】 기준보다 늘면 ADR 0009 §4와 같은 기록·수용 규칙을 따른다.
  - 【추론】 이유를 적고 Vincent가 받아들여야 병합한다.
  - 【추론】 비율 상한은 따로 두지 않는다.
  - 【추론】 "현재 gzip 약 44KB"(`00-goals.md:82`)는 측정 방법이 적히지 않은 기록이라 기준으로 쓰지 않는다.
- 근거:
  - 44KB 기록의 문제는 측정 방법이 없던 것이다. 같은 `dist/index.mjs`가 방법에 따라 51,632 B와 37,023 B로 갈린다(검증자가 다시 재어 일치).
  - +10% 같은 여유를 두지 않고 늘 때마다 이유를 적는다. ADR 0009 `:99`도 검증기를 내장하지 않으므로(ADR 0004) 늘 이유는 적다고 보았다.
  - `adr/0009-performance-budget-and-benchmarks.md:99`의 "분기 선택기"는 이미 충돌 칸에 적혀 있다(5차 주가 이긴다). GOAL-011의 원리 "번들 크기도 예산이다"는 그대로다.

### 18C-30 컴파일 예산

- 닫는 항목: TEST-066
- 결정:
  - 【추론】 컴파일에는 따로 수치 예산을 두지 않는다.
  - 【추론】 기준 플러그인(AJV)으로 재는 마운트 벤치는 가드 컴파일을 포함한다.
  - 【추론】 그 컴파일은 따로 한 줄로 보고하고, 그 줄을 폼의 몫(청사진 분석·트리 생성·식 컴파일)과 검증기의 컴파일 몫(`compileGuard`)으로 나눈다.
  - 【추론】 판정은 18C-26의 선과 ADR 0009 §4를 따른다.
  - 【추론】 선을 넘으면 이유를 적고 Vincent가 받아들여야 병합한다.
  - 【추론】 알려진 느림은 미리 적는다.
  - 【추론】 가드 200개인 조건부 폼 생성은 새 판 23.0 ms(트리 585 µs + AJV 컴파일 22.4 ms) 대 오늘 13.4 ms로 1.7배다(`spikes/work-loop/REPORT.txt:113-118`, `:196-200`).
  - 【추론】 이 항목을 PR-4(동기 `compileGuard`를 구현하는 PR)의 수용 필요 항목으로 미리 적고, 이유는 "검증기 컴파일"이다.
  - 【추론】 미리 적는 것이지 미리 받아들이는 것이 아니다.
  - 【추론】 수치는 PR-4의 실측으로 바꾼다.
- 근거:
  - ADR 0009 §4(`adr/0009-performance-budget-and-benchmarks.md:92`), 16라운드 답 6(`reviews/round-16-owner-answers.md:12`) — 가드 컴파일을 게이트에서 빼면 바로 이 느림이 어떤 게이트에도 걸리지 않는다.
  - 소유자 12-3: "검증기의 성능은 우리가 관여할 문제가 아닙니다만."(`reviews/round-18-owner-answers.md:13`) — 편집자는 이를, 검증기의 속도는 폼의 책임이 아니되 시야 밖에 두지는 않는다는 뜻으로 읽는다. 같은 칸의 되물음은 근거로 쓰지 않는다. 기준을 AJV로 두는 것은 TEST-065와 같다.
  - 스파이크는 이 자리를 "This is the one budget the owner should set a number for"라고 적었다(`spikes/work-loop/REPORT.txt:200`). 수치를 미리 정하는 대신 소유자가 PR-4 병합 때 이 항목을 받아들일지 정한다.
  - 지연 컴파일은 29.17 ms로 더 나쁘다(`spikes/work-loop/REPORT.txt:118`). 컴파일 시점을 미루어 느림을 피할 길은 없다.

### 18C-31 노드 구조 벤치 행의 합격선

- 닫는 항목: 없음(안건 `reviews/round-18-agenda.md:68`을 추적하는 열린 항목이 없었다. NODE-018에 적는다)
- 결정:
  - 【추론】 NODE-018(현행)이 B1–B6을 기준선과 비교한다고 적으나 합격선이 없으므로 여기서 둔다.
  - 【추론】 PR-2에서 B1–B6을 V8(node)과 JavaScriptCore(bun, 또는 `benchmark-form/browser-bench`의 Safari)에서 돌린다.
  - 【추론】 B1·B5·B6의 합격선은 18C-27의 선(`guard:check`) 안이다.
  - 【추론】 B2의 합격선은 NODE-018의 추정(110–140바이트, 포인터 압축 엔진)의 1.5배 이내이고, 같은 엔진에서 잰 오늘 노드 인스턴스와 부속 객체의 합을 나란히 적어 그보다 크지 않은 것이다.
  - 【추론】 B3의 합격선은 같은 맵이 참인 것이다.
  - 【추론】 B4는 보고만 한다.
  - 【추론】 합격선을 넘으면 TEST-027의 절차(이유를 적고 Vincent가 받아들임)로 올린다.
- 근거:
  - NODE-018, TEST-027 보충, `reviews/raw-round17-node-structure.md:146`("오늘 노드 인스턴스와 부속 객체의 합과 비교해야 한다"), `:148`
  - B2의 방향(노드당 힙은 오늘의 노드 인스턴스와 부속 객체의 합을 넘지 않는다)은 GOAL-050(메모리 안정)과 소유자의 "벤치마크를 통해서 성능을 끌어올렸으면 한다"(`adr/0009-performance-budget-and-benchmarks.md:5`)를 따른다. 1.5배는 편집자가 정한 값이다.
- 게이트:
  - PR: PR-2.
  - 통과: 위 합격선 안이다.
  - 실패: TEST-027의 절차(18C-26의 기록·수용 규칙)로 올린다.

## §6 노드 구조

### 18C-32 노드 구조 우산 항목의 처분

- 닫는 항목: NODE-019
- 결정:
  - 【추론】 NODE-019의 하위 가지는 다음 블록이 닫는다: N2는 18C-33·18C-34, N5는 18C-35, N6는 18C-37, N14는 18C-38, 루트 전용 넷은 18C-41, 명령 넷은 18C-42, `subnodes`는 18C-33, `schemaPath`·`key`는 18C-43, `defaultValue`·`resetSubtree`는 18C-44, `ContextNode`와 `context`는 18C-45, `{@inheritDoc}`는 18C-46, 내부 통로는 18C-48이다.
  - 【추론】 이 결정들을 적용하면 겉면 멤버는 확정분 약 44개(`reviews/raw-round17-node-structure.md:136`, `getInactiveValues`는 VALUE-029의 게터 `inactiveValues`로 셈)에 명령 넷, 루트 전용 넷, `defaultValue`·`resetSubtree`, `context`, 18C-40의 게터 `valueTypeMismatch`·`valueTypeMismatches`를 더한 약 57개다.
  - 【추론】 `subnodes`·`schemaPath`·`key`·`publish`는 빠진다.
- 근거:
  - `reviews/round-18-agenda.md:74-92`, `reviews/raw-round17-node-structure.md:136,202`(44개에 `defaultValue`·`resetSubtree`는 들지 않는다), `09-landing-and-test-strategy.md:116`

### 18C-33 N2 — 탐색이 기대는 `subnodes`·`variant`·`oneOfIndex`와 (이름, 종류) 신원

- 닫는 항목: NODE-019(N2와 `subnodes`)
- 결정:
  - 【추론】 형상에 없는 노드는 트리에 인스턴스가 없다.
  - 【추론】 그 원본은 루트가 잠복 원본으로 (절대 경로, 종류)를 키로 든다.
  - 【추론】 형상을 떠난 노드의 옛 참조는 18C-34가 정한다.
  - 【추론】 branch 객체의 `structure`는 이름에서 그 커밋의 형상에 있는 자식 노드로 가는 맵이다.
  - 【추론】 자식 선언의 신원 (이름, 종류)은 청사진이 선언을 무리 지을 때와 `settle`이 어느 종류의 노드를 살릴지 정할 때 쓴다.
  - 【추론】 한 커밋에서 한 이름에 형상에 있는 노드는 많아야 하나이므로(같은 이름·다른 종류가 동시에 켜지면 충돌이고, 전순서에서 앞선 종류만 산다) 맵의 키는 이름으로 충분하다.
  - 【추론】 `find`·`findNodes`·트리 걷기는 형상에 있는 노드만 돌려준다.
  - 【추론】 형상에 없는 노드를 지나는 경로는 `find`가 `null`, `findNodes`는 항목 없음이다.
  - 【추론】 터미널 아래 경로와 같은 규칙이다.
  - 【추론】 비활성 자식까지 담는 `subnodes`는 레코드에도 공개 겉면에도 두지 않는다.
  - 【추론】 `detectsCandidate`와 그 시험, 첫 후보로 물러나는 규칙, 내부 칸 `variant`·`scope`·`oneOfIndex`·`anyOfIndices`는 모두 폐기한다.
  - 이주(LANDING-148): 오늘 `find`는 꺼진 `oneOf` 변형의 노드를 돌려줄 수 있지만(`findNode.ts:69-85`, 첫 후보로 물러남), 새 설계는 `null`이다.
- 근거:
  - BLUEPRINT-011·BLUEPRINT-012(`adr/0005-blueprint-analysis-and-node-sharing.md:67-68`), VALUE-006, VALUE-029
  - 12-8 셋째 소유자: "root node 에 핸들로 추가하고, 개별 노드는 rootNode 의 기능을 경유해서 node.inactiveValues 를 구현하면 어떨까 싶다."(`reviews/round-18-owner-answers.md:22`) — 루트가 형상에 없는 노드의 원본을 든다.
  - 12-8의 반영(`reviews/round-18-owner-answers.md:18`, 꺼진 분기의 노드는 형상에 없음), NODE-020(터미널 아래는 노드 없음), SURFACE-045(`oneOfIndex`·`anyOfIndices` 대체물 없이 사라짐), NODE-006(자식 폐기의 확정은 `settle`), `09-landing-and-test-strategy.md` §4.3(`oneOfIndex` 단언은 버리고 새로 씀)
  - 오늘 코드: `src/core/nodes/AbstractNode/utils/findNode/utils/detectsCandidate.ts`, `AbstractNode.ts:143-145`

### 18C-34 형상을 떠난 노드의 옛 참조

- 닫는 항목: NODE-019(N2, 18C-33과 함께)
- 결정:
  - 【추론】 형상을 떠난 노드는 떼어진다(detached).
  - 【추론】 트리는 그 노드를 버리고, 루트는 그 원본을 잠복 원본으로 (절대 경로, 종류)를 키로 든다.
  - 【추론】 소비자가 든 옛 참조는 읽을 수 있다.
  - 【추론】 떼어진 노드의 읽기 멤버는 모두 그 노드가 형상에 있던 마지막 커밋의 값을 돌려주고, 그 뒤로 바뀌지 않는다.
  - 【추론】 옛 참조로 한 쓰기도 이 읽기를 바꾸지 않는다(쓴 값은 루트의 잠복 원본에 있다).
  - 【추론】 구조 읽기(`children`, 상대 경로의 `find`·`findNodes`)는 그 노드와 함께 떼어진 하위 트리를 본다.
  - 【추론】 예외로 `rootNode`는 살아 있는 루트이고, 트리 전체를 읽는 `globalState`·`globalErrors`도 살아 있는 런타임을 읽는다(18C-41).
  - 【추론】 그래서 절대 경로는 살아 있는 트리에서 풀린다.
  - 【추론】 있던 구독은 유효하다(구독 해제가 된다).
  - 【추론】 다시 발화하지는 않는다.
  - 【추론】 명령(`focus`·`select`·`refresh`·`remount`)과 상태 진입(`setSubtreeState`·`clearSubtreeState`)은 아무것도 하지 않는다.
  - 【추론】 옛 참조로 한 쓰기는 오류가 아니다.
  - 【추론】 그 쓰기는 루트의 그 (경로, 종류) 잠복 원본을 고치고, 규칙을 평가하지 않으며, 아무것도 내지 않는다.
  - 【추론】 그래서 순차 쓰기와 묶음 쓰기가 같은 원본에 닿는다.
  - 【추론】 노드가 다시 형상에 들면 새 인스턴스를 만든다("재탄생은 새 삶", `08-design-a-to-z.md:316`).
  - 【추론】 옛 참조는 떼어진 채로 남는다.
  - 【추론】 `SCHEMA_FORM_ERROR.DISPOSED_NODE_WRITE`(가칭)는 재생성 `reset`이 버린 트리의 노드에 대한 쓰기에만 남긴다.
- 근거:
  - `08-design-a-to-z.md:316`("재탄생은 새 삶이다")
  - ERROR-044·ERROR-164의 §7.2 행(`DISPOSED_NODE_WRITE`는 재생성 reset으로 폐기된 노드에 호출자가 옛 참조로 한 쓰기)
  - VALUE-029(`reviews/round-18-owner-answers.md:22`), WRITE-018, CONTROLS-053, 18C-64(비활성 경로 쓰기), 18C-33

### 18C-35 N5 — `SchemaNodeRuntime` 칸 타입의 순환

- 닫는 항목: NODE-017, NODE-019(N5)
- 결정:
  - 【추론】 의존 역전으로 끊는다.
  - 【추론】 `record/`가 `SchemaNodeRuntime`의 칸(통지 대기열, 검증기, 진단, 진입 깊이와 예산, `nodeFactory`, `onError` 보고기)의 형을 그 칸을 부르는 쪽이 쓰는 최소 인터페이스로 선언한다.
  - 【추론】 `dispatch`·`validation`과 트리를 만드는 자리가 그 인터페이스를 만족하는 구현을 넣는다.
  - 【추론】 `record/`는 `dispatch`·`validation`·`app/plugin`을 가져오지 않는다.
  - 【추론】 `import type`도 금지다.
  - 【추론】 검증기 칸은 플러그인 형이 아니라 `record/`의 검증 요청 인터페이스이고, 플러그인의 검증기는 트리를 만드는 자리에서 이 칸에 맞춰 넣는다.
  - 【추론】 칸을 하나 더하면 `record/`의 선언을 고친다.
  - 【추론】 그 대가를 레코드 `DETAIL.md`에 적는다(`Behavior`와 같은 방식).
  - 【추론】 PR-2의 병합 점검에 `import type`까지 센 순환 검사를 둔다.
  - 【추론】 도구는 PR-2가 고른다.
- 근거:
  - NODE-016(`Behavior`·`SchemaNodeFactory`를 `record/`에 두고 생성을 주입하는 같은 방식), `reviews/raw-round17-node-structure.md:72,186`(게이트 N5 수정안), NODE-017의 조건(타입 포함 비순환)
  - 작업 공간 규칙(`/Users/Vincent/Workspace/.claude/CLAUDE.md` Type Safety): "Never use `as never`, `as any`, or similar type casts to suppress errors without explicit user approval." — 단언 없이 풀리는 안을 고른다.
  - 18C-55(`ValidationManager` → `PluginManager` import 분리)와 방향이 같다.

### 18C-36 S1 parse 함수의 자리

- 닫는 항목: 없음(WRITE-056의 보충 "`parsers`의 새 자리는 18라운드의 노드 구조 항목에서 정한다"가 남긴 자리를 닫는다)
- 결정:
  - 【추론】 S1 parse 함수는 `src/core/behaviors/utils/parse/`에 둔다.
  - 【추론】 부르는 쪽은 동작 행의 `interpret` 칸뿐이다(WRITE-056).
  - 【추론】 18C-02의 `union` 행이 수·문자열·불리언 변환을 `type`에 적힌 순서로 부르므로 이 변환들은 두 종류 이상이 쓴다.
  - 【추론】 그래서 NODE-009대로 `behaviors/utils/` 아래, 주제 디렉토리 `parse/`에 둔다.
  - 【추론】 NODE-009와 어긋나지 않는다.
  - 【추론】 PR-2는 이 자리에 S1 변환(`reviews/round-18-owner-answers.md:9`의 변환 목록, WRITE-052)만 하는 parse를 새로 둔다.
  - 【추론】 오늘의 `src/core/parsers/`는 그것을 가져오는 옛 노드와 함께 `src/__legacy__/core/parsers/`로 옮긴다(18C-49).
  - 【추론】 레거시는 새 parse를 가져오지 않는다.
- 근거:
  - WRITE-056("parse는 각 동작 행의 `interpret`(입력 해석) 칸이 부르고"), WRITE-052(뜻이 그대로인 변환만), S1 둘째·셋째 답(`reviews/round-18-owner-answers.md:8-9`)
  - NODE-009("두 종류 이상이 쓰는 것은 `behaviors/utils/`에 둔다"), `.claude/rules/filid_fractal-boundaries.md` §4("A topic-named organ sits inside a compartment, not beside the child fractals"), `.claude/rules/filid_code-placement.md` §1(쓰는 쪽들의 가장 낮은 공통 fractal)
  - 오늘 소비자: `src/core/nodes/{String,Number,Boolean}Node/*.ts:5-7`, `ObjectNode`·`ArrayNode`의 `TerminalStrategy.ts:7-8` — 모두 옛 노드다.

### 18C-37 N6 — 레코드 형에서 공개 판별 합집합으로

- 닫는 항목: NODE-019(N6)
- 결정:
  - 【추론】 레코드 형에서 공개 판별 합집합으로의 변환에 형 단언을 쓰지 않는다.
  - 【추론】 형은 선언 자리에서 맞춘다.
  - 【추론】 `record/`의 `SchemaNodeRecord`는 자기 형을 매개변수로 받고(`SchemaNodeRecord<Self>`), `navigation/`의 `find`·`findNodes`는 `Self`에 대해 제네릭이다.
  - 【추론】 클래스 `SchemaNode`는 종류 매개변수 `T`를 갖고 `type`·`value` 게터를 `T`로 좁힌다.
  - 【추론】 `parent`·`structure`는 종류별 인스턴스 형의 합집합(`AnyNode`)으로 선언해 `SchemaNodeRecord<AnyNode>`를 구현한다.
  - 【추론】 그래서 종류별 인스턴스 형이 공개 합집합의 구성원에 구조적으로 대입된다.
  - 【추론】 레코드를 넘겨받는 공개 메서드는 `this: AnyNode` 매개변수로 선언한다.
  - 【추론】 생성은 종류별 생성 표가 `AnyNode`를 돌려준다.
  - 【추론】 `InferSchemaNode<Schema>`로의 좁힘은 overload 선언으로 한다.
- 근거:
  - 작업 공간 규칙(`/Users/Vincent/Workspace/.claude/CLAUDE.md` Type Safety): "Fix type errors at declaration sites, not call sites."와 "Never use `as never`, `as any`, or similar type casts to suppress errors without explicit user approval."
  - 검증자의 최소 모형(F-bounded `SchemaNodeRecord<Self>`, 제네릭 `find<Self>`, 제네릭 클래스가 `SchemaNodeRecord<AnyNode>`를 구현, `this: AnyNode`, 종류별 생성 표, overload로 `InferSchemaNode` 좁힘)이 `tsc 5.9.2 --strict`를 `as`·`any` 없이 통과했고 `children`이 저장 배열과 같은 참조였다(18라운드 실행 확인).
  - NODE-004, NODE-010, NODE-015(`InferSchemaNode` 사상 유지), NODE-016, `reviews/raw-round17-node-structure.md:187`(게이트 N6)
- 게이트:
  - PR: PR-2.
  - 무엇: 실제 공개 형(`InferSchemaNode` 사상, 배열 멤버, S1 정합 상태 판별자)으로 새 fractal이 `tsc --strict`를 `as`·`any` 없이 통과하는지, `node.children`이 저장 배열과 같은 참조인지(시험) 본다.
  - 통과: 둘 다 참이다.
  - 실패: 두 선택지(가: 한 함수에 가둔 단언 하나를 승인, 나: 단언 없이 목록 읽기마다 원소 검사·복사)를 그대로 소유자에게 올린다.
  - 실패: 그때 오늘 `src/core/nodeFromJSONSchema.ts:55`의 `as InferSchemaNode<Schema>`도 같은 물음의 대상으로 적는다.

### 18C-38 N14 — 행이 없는 조합(잎 `terminal: false`, 가상 `terminal: true`, 가상의 인라인 입력)

- 닫는 항목: LANDING-050, NODE-019(N14)
- 결정:
  - 【추론】 `BEHAVIORS[type]`의 행이 하나인 종류는 전략을 그 행에서 정하고 렌더 계층 판정을 묻지 않는다.
  - 【추론】 잎(string·number·boolean·null과 18C-02의 (가칭) `union`)은 `terminal`, 가상은 `branch`다.
  - 【추론】 그래서 가상에 둔 인라인 `presentation.FormTypeInput`은 그 입력으로 그려지되 전략은 `branch`이고, 입력은 참조 노드의 `ChildNodeComponents`를 받는다(쓰지 않아도 된다).
  - 【추론】 가상은 `branch`이므로 ERROR-185의 경고(터미널 노드의 입력이 빈 `ChildNodeComponents`를 읽을 때의 개발 모드 경고)는 가상 노드에 적용되지 않는다.
  - 【추론】 행이 하나인 종류에 그 행과 다른 `options.terminal`을 적으면 청사진 오류다(잎의 `false`, 가상의 `true`).
  - 【추론】 같은 값(잎의 `true`, 가상의 `false`)은 오류가 아니다.
  - 【추론】 `options.terminal`의 양방향(NODE-030)과 NODE-028의 판정 순서는 두 행을 가진 종류(object·array)에만 뜻이 있다.
  - 【추론】 코드는 (가칭) `JSON_SCHEMA_ERROR.TERMINAL_OPTION_UNSUPPORTED`이고, 청사진 분석에서 나며, 기록에 schemaPath·type·값을 싣고, 새 설계에만 있다.
  - 이주(LANDING-149, 08 §14 47행의 새 설계 칸): 잎의 `options.terminal: false`와 가상의 `options.terminal: true`는 청사진 오류(가칭 `TERMINAL_OPTION_UNSUPPORTED`)이니 지운다.
    - 가상의 인라인 `FormTypeInput`은 그대로 그려지며 `ChildNodeComponents`를 받고(오늘은 비워짐), `node.strategy`는 `'branch'`이고 `isTerminalNode(가상)`은 참에서 거짓으로 바뀐다(오늘 `group`은 `'terminal'`).
- 근거:
  - 소유자가 암묵 터미널을 둔 이유는 비용이다: "브랜치 노드의 터미널 전략이 압도적으로 저렴해서, 사용자가 되도록 터미널 전략을 쓰게 하려고 설계한 방법"(`adr/0011-branch-node-composition.md:55`, `00-goals.md:116`). 가상 노드는 참조 노드가 어차피 존재하므로 터미널로 둘 때의 비용 이득이 없다.
  - 소유자는 이 방식이 난해하면 끊어도 된다는 여지를 주었다(`adr/0011-branch-node-composition.md:57`, `00-goals.md:116`).
  - N14 조합은 ADR 0011이 결정하지 않고 18라운드 안건으로 넘겼다(`adr/0011-branch-node-composition.md:60`). 그래서 NODE-030·NODE-034·`reviews/round-17-owner-answers.md:42`와 어긋나지 않는다.
  - 가상·잎이 행 하나라는 것: 17라운드 반영 칸(`reviews/round-17-owner-answers.md:42`), NODE-002, LANDING-056, NODE-034(가상 전략은 `branch`), 18C-02(`union`은 잎이고 행이 `terminal` 하나)
  - ERROR-185의 경고는 "터미널이 된 노드의 입력"이 대상이다.
  - 오늘 코드: `src/core/nodes/AbstractNode/utils/getNodeGroup/getNodeGroup.ts:20-23`(`terminal` 불리언이 먼저이고 인라인 입력이면 `'terminal'`), `src/helpers/jsonSchema/filter.ts:20-21`, `src/components/SchemaNode/SchemaNodeInput/hooks/useChildNodeComponents.tsx:56`(터미널이면 자식 구성 요소를 비운다)
  - 문서화된 쓰임새 `stories/08.VirtualSchema.stories.tsx:63-66`은 값·onChange만 쓰므로 새 설계에서도 동작이 같다.
  - 모르는 키가 청사진 오류인 선례 `UNKNOWN_GROUP_KEY`(`adr/0014-error-policy.md:259`), 소유자 O-10(`reviews/round-14-owner-answers.md:16`)

### 18C-39 `emit`의 키 순서(Q14)와 합성 패치(F13)

- 닫는 항목: NODE-038, SETTLE-025
- 결정:
  - 【추론】 branch 객체 노드의 `local`과 `emit`의 키 순서는 결정적이다.
  - 【추론】 쓰기의 순서나 이력과 무관하다.
  - 【추론】 첫째, 그 호스트의 유효 스키마 `options.propertyKeys`에 적힌 키가 그 순서로 먼저 온다.
  - 【추론】 둘째, 나머지 선언된 자식 키는 청사진 전순서(ADR 0002)에서 그 이름의 첫 선언 자리 순이다.
  - 【추론】 조각에서만 선언된 키와 공유 노드의 키도 같다.
  - 【추론】 셋째, `extras`는 그 뒤에 원본에 들어온 순서(삽입 순서)로 온다.
  - 【추론】 형상에 없는 키는 없다.
  - 【추론】 순서표는 호스트의 유효 스키마 메모가 바뀔 때 한 번 계산해 메모와 함께 둔다.
  - 【추론】 키 집합이 같은 커밋(값만 바뀐 쓰기, 키 입력)은 바뀐 자식만 직전 `local`의 사본에 같은 자리로 패치한다.
  - 【추론】 그 비용은 O(재계산 목록)이고 순서가 유지된다.
  - 【추론】 키 집합이 바뀌는 커밋(조각이나 노드 게이트의 토글, 자식이 생기거나 빠짐, `extras` 추가, `propertyKeys` 변경)은 그 호스트의 `local`을 위 순서로 새로 짓는다.
  - 【추론】 그 비용은 O(그 호스트의 키 수)이고 `delete`는 없다.
  - 【추론】 F13의 "조각이 선언한 키만 패치"는 다시 계산하는 키의 범위로 읽는다.
  - 【추론】 토글 때 다시 계산하는 것은 그 조각이 선언한 키뿐이고, 나머지 값은 직전 `local`에서 옮겨 선언 순서로 새 객체를 짓는다.
  - 【추론】 `emit := project(local)`은 순서를 그대로 둔다.
  - 【추론】 터미널 객체와 비객체 원본은 받은 값을 그대로 든다(순서를 바꾸지 않음).
  - 【추론】 배열은 인덱스 순이다.
  - 【추론】 오늘의 선언 순서 정렬(`BranchStrategy.ts:246,777-803`, `sortWithReference`: 참조 목록의 키가 먼저, 나머지는 원래 순서)과 같은 결과를 내므로 이주 행은 두지 않는다.
- 근거:
  - ADR 0007 §2의 합성 행(`adr/0007-settle-cycle.md:62`, "`emit`의 키 순서는 스키마 선언 순서, `extras`는 뒤에 받은 순서")
  - 프로토타입 v5가 이 방식(`spikes/round9/proto/loop-v5.mjs:970-975`: 같은 활성 집합이면 dirty만 패치, 아니면 선언 순서로 다시 짓고 `delete` 없음)으로 `selfcheck-v5` b를 통과했다(`spikes/round9/regress/selfcheck-v5.mjs:554`, 쓰기 순서 넷에 같은 JSON 문자열, `RESULTS.txt` passed 63).
  - GOAL-009(G5 결정성), `adr/0005-blueprint-analysis-and-node-sharing.md:70`(전순서), `08-design-a-to-z.md:331`(`propertyKeys`는 유효 스키마에서 읽음), NODE-006(정적 선택의 메모), ADR 0013
- 게이트:
  - PR: PR-2 시험.
  - 무엇: 조각 키의 자리가 오늘의 `oneOf`/`anyOf` 키 합집합 순서와 어긋나는 스키마가 있는지 본다.
  - 실패: 어긋나면 이주 행을 더한다.

### 18C-40 S1 결정의 후속 세부 여섯

- 닫는 항목: WRITE-057, REACT-018
- 결정:
  - 【추론】 (1) 경고등은 VALUE-002의 분류로 '계산' 칸이다.
  - 【추론】 원본과 노드의 형(`type`, nullable)만의 함수이므로 '상태는 `raw`와 `extras` 둘뿐'(P3)을 지킨다.
  - 【추론】 소유자가 말한 '상태'는 사용자에게 보이는 뜻이다.
  - 【추론】 쓰기마다 `interpret`가 한 번 정한다.
  - 【추론】 켜지는 값은 자기 형이 아니고, 없음도 아니고, nullable 노드의 `null`도 아닌 값이다.
  - 【추론】 수 노드의 `NaN`·`±Infinity`, 정수 노드의 정수 아닌 수, 잘못된 종류를 든 가지 노드도 켜진다.
  - 【추론】 가상 노드는 켜지지 않는다(18C-21에서 거부한다).
  - 【추론】 공개 이름은 가칭으로 노드 getter `valueTypeMismatch: boolean`이다.
  - 【추론】 코드 `VALUE_TYPE_MISMATCH`와 짝을 이뤄 검색된다.
  - 【추론】 공개 노드 형은 이 칸을 판별자로 한 합집합이다.
  - 【추론】 `false`이면 `value`가 그 형의 값·`undefined`·(nullable이면) `null`이고, `true`이면 `unknown`이다.
  - 【추론】 입력 구성 요소는 `FormTypeInputProps`의 같은 이름 칸으로 받는다.
  - 【추론】 루트 노드가 켜진 노드의 경로 집합을 든다.
  - 【추론】 쓰기 때 더하고 빼며, 로드마다 다시 만든다.
  - 【추론】 모든 노드는 getter `valueTypeMismatches: readonly string[]`로 자기 경로 아래의 켜진 경로를 돌려준다.
  - 【추론】 루트에서 읽으면 트리 전체다.
  - 【추론】 커밋 번호로 메모해 같은 커밋에서는 같은 참조를 돌려준다.
  - 【추론】 형상에 없는 노드는 넣지 않는다.
  - 【추론】 새 이벤트는 없다(바뀌면 `UpdateValue`가 알린다).
  - 【추론】 `FormHandle`에는 더하지 않는다.
  - (2) 입력 구성 요소의 계약은 `FormTypeInputProps` 문서 주석과 입력 작성 문서에 적는다.
  - 초안(치다 만 글자, 입력기 조합 중인 글자)은 입력이 스스로 든다.
  - 노드에는 자기 형의 값이나 없음만 보낸다.
  - 빈 칸이면 `undefined`를 보낸다.
  - 비우기 조작은 nullable이면 `null`, 아니면 `undefined`를 보낸다.
  - 해석할 수 없는 초안이 남은 채 포커스를 잃으면 표시를 노드 값으로 되돌린다.
  - 경고등이 켜진 값은 유효한 상태(빈 칸, 켜짐, 체크)처럼 그리지 않는다.
  - 받은 값이나 무효 표지를 보이고, 한 번의 조작으로 비울 수 있게 한다.
  - 기본 수 입력은 빈 칸이면 `undefined`를 보낸다(`valueAsNumber`의 `NaN`을 보내지 않음).
  - 기본 수 입력은 `validity.badInput`이면 쓰지 않고, 흐려지면 되돌린다.
  - 기본 불리언 체크박스는 불리언이 아닌 값이면 미정 상태로 그린다.
  - 자사 플러그인 수정 목록은 PR-7 이주 항목이다: antd·mui 수 입력의 비우기 값과 부분 해석, 스위치의 무효 표지, 문자열 체크박스와 범위 입력의 `Array.isArray` 막기(LANDING-151).
  - 【추론】 (3) 틀린 형을 게이트와 식이 볼 때, 폼은 값을 가르지 않는다.
  - 【추론】 게이트와 식은 형이 틀린 값을 거르지 않은 방출 트리 하나를 읽되(18C-13 (5)), 객체가 아닌 원본을 든 객체 호스트 자신의 게이트 입력은 FRAGMENT-016대로 `{}`다.
  - 【추론】 `if` 게이트의 판정(수 아닌 값에 `minimum`이 참)은 검증기의 JSON Schema 의미이며 폼이 바꾸지 않는다.
  - 【추론】 작성자 안내에 "`if` 서브스키마에 `type`을 함께 적는다"를 넣는다.
  - 【추론】 `controls` 식이 틀린 형에서 던지면 이미 정한 대로 `EXPRESSION_THREW`, `degraded`, 제출 거부가 된다.
  - 【추론】 검증기 유무와 무관하다(R17-1).
  - 【추론】 식 언어 명세(18C-13)에 "식은 형이 틀린 값을 만날 수 있고, 던지면 식 실패다. `typeof`로 지킨다"를 적는다.
  - 【추론】 (4) nullable이 아닌 노드의 `null`은 바꾸지 않고 받은 그대로 방출된다.
  - 【추론】 경고등이 켜지고 경고가 가며, 검증기가 있으면 형 에러로 제출이 막힌다.
  - 【추론】 이 사용성 변화를 이주 항목(F27 확장, LANDING-125)과 PR-8 문서에 적는다.
  - 【추론】 해법은 스키마에 nullable을 적는 것이다.
  - 【추론】 값 규칙은 이미 닫혀 있고 문서화만 남았다.
  - (5) 가상 노드의 예외와 배열 먼저 확인은 18C-21로 닫는다.
  - 【추론】 (6) 옛 설계 문서(03·04·08·09·ADR)는 고치지 않는다(원장 답, `reviews/round-18-owner-answers.md:10`).
  - 【추론】 어긋남은 원장의 충돌 칸에 적는다(03:152는 WRITE-052에 이미 있다).
  - 【추론】 `interpret` 칸의 계약은 순수, 던지지 않음, 모든 입력에 값을 돌려줌, 멱등, 바꾸지 못하면 항등이다.
  - 【추론】 parse의 문서(오늘 `src/core/parsers/INTENT.md`가 맡던 것)는 새 자리(`src/core/behaviors/utils/parse/`, 18C-36)의 문서로 PR-2의 착수 항목이고, `src/types/formTypeInput.ts:60-65`의 문서 주석은 PR-7의 착수 항목이다(LANDING-150).
- 근거:
  - S1 셋째의 소유자 말: "error 와 별개로, 이 상태를 보고 현재 값의 건전성을 판단", "올바르지 않은 타입의 표현은 FormTypeInput 구현에 위임되는거구나", "나 로 확정합니다. 경고등 추가도 승인합니다"(`reviews/round-18-owner-answers.md:9`)
  - 12-7 소유자: "형변환 실패로 문제가 생기는 경우에 대한 대응은 FormType 이 하기로 했잖아"(`reviews/round-18-owner-answers.md:17`)
  - 12-8 셋째(`reviews/round-18-owner-answers.md:22`, 루트 함수와 노드 getter, VALUE-029), 12-8 이어서(`reviews/round-18-owner-answers.md:21`, 노드는 getter, SURFACE-050)
  - WRITE-054, WRITE-075("`null`은 어느 노드에서도 바꾸지 않는다"), WRITE-056, VALUE-002(충돌 칸 '상태인지 계산인지 아직'), VALUE-013, REACT-005(C-11)
  - R17-1 소유자: "나 허용. 망가진 값을 올리는게 더 위험하겠다"(`reviews/round-17-owner-answers.md:9`), ERROR-126·ERROR-137, GOAL-025(P1 판정은 검증기의 것)
  - `reviews/raw-round18-s1-unconvertible-review.md` §2의 규칙 6·7과 가장 강한 반론 문단
  - 오늘 코드: `src/formTypeDefinitions/FormTypeInputNumber.tsx:23`, `FormTypeInputBoolean.tsx:29`
  - (6)의 parse 자리: 18C-36, 18C-49
- 게이트:
  - PR: PR-7(브라우저 시험, storybook 프로젝트) — (2)의 브라우저 사실 둘.
  - 무엇: 실제 브라우저의 `badInput`과 antd `InputNumber`의 흐린 뒤 표시를 잰다.
  - 통과: 규칙대로 동작한다 — 치다 만 글자가 노드에 가지 않고, 흐리면 노드 값이 보인다.
  - 실패: 기본 수 입력을 `type="text"`와 `inputMode="decimal"`, 자체 초안 해석으로 바꾼다.
  - 실패: 계약 문장은 그대로 둔다.

## §7 공개 표면

### 18C-41 루트 전용 넷의 자리와 `globalState`의 OR 누적

- 닫는 항목: EVENT-052, NODE-019(루트 전용 넷)
- 결정:
  - 【추론】 `globalState`·`globalErrors`(게터)와 `setSubtreeState(state)`·`clearSubtreeState()`는 모든 노드의 멤버로 남긴다.
  - 【추론】 두 게터는 트리 전체의 값을 든 런타임을 읽는 문장 하나다.
  - 【추론】 어느 노드에서 읽어도 같다(오늘과 같음).
  - 【추론】 두 메서드는 그 노드의 하위 트리에 거는 `dispatch` 진입이다.
  - 【추론】 `FormHandle`의 `getState`·`setState`·`clearState`·`getErrors`는 오늘처럼 루트에 위임한다.
  - 【추론】 `globalState`는 누적하지 않고 트리에서 유도한다.
  - 【추론】 키 k가 참인 것은 형상에 있는 노드 가운데 하나라도 `state[k]`가 참인 때뿐이다.
  - 【추론】 `globalState`는 참인 노드가 하나 이상인 키만 담고 값은 `true`다.
  - 【추론】 수가 0이면 키가 빠진다.
  - 【추론】 런타임은 키마다 참인 노드의 수를 든다.
  - 【추론】 수는 노드 상태가 바뀔 때와 노드가 형상에 들고 날 때 O(1)로 고친다.
  - 【추론】 어느 키의 수가 0과 1 사이를 넘을 때만 `globalState` 객체를 새로 짓고 `UpdateGlobalState`를 낸다.
  - 【추론】 그 밖에는 같은 참조를 돌려준다.
  - 【추론】 결과로 `dirty`가 내려간다.
  - 【추론】 모든 노드의 `dirty`가 풀리거나 비루트 노드에서 `clearSubtreeState()`를 불러도 내려간다.
  - 이주(LANDING-152): `globalState`의 키는 오늘 루트에서만 비워지고, 새 설계에서는 참인 노드가 없으면 내려간다.
  - 이주(LANDING-153): `globalState`는 오늘 마지막으로 쓴 참인 값을 그대로 들고, 새 설계에서는 비불리언 상태 값도 `true`가 된다.
- 근거:
  - SURFACE-050(노드 인터페이스는 게터, `reviews/round-18-owner-answers.md:21`), NODE-004·NODE-010(루트 상태는 런타임, 하위 트리 상태 쓰기는 `dispatch`)
  - GOAL-049(일관성·투명성·예측가능성: 누적기는 노드 상태와 어긋나는 둘째 원천이고 출처를 알 수 없다), GOAL-006(G4), GOAL-020(C7, 호환 계층 없음), ADR 0008 미결(`adr/0008-event-system.md:208`)
  - 유추: 12-8 셋째 소유자 "root node 에 핸들로 추가하고, 개별 노드는 rootNode 의 기능을 경유해서"(`reviews/round-18-owner-answers.md:22`)는 `inactiveValues`의 자리에 대한 답이며, 이 블록은 같은 모양(루트가 들고 모든 노드가 경유)을 루트 전용 넷에 유추한다.
  - 오늘 코드: `AbstractNode.ts:613-695`(참인 값만 누적하고 루트에서만 비움), `NodeStateFlags`는 `[key: string]: any`(`src/core/types/state.ts:29-34`), 마지막으로 쓴 참인 값을 그대로 든다(`shallowPatch` additive, `AbstractNode.ts:645-651`).

### 18C-42 명령 넷과 명령 publish의 공개(C-11)

- 닫는 항목: EVENT-038, LANDING-106, NODE-019(명령 넷)
- 결정:
  - 【추론】 명령 넷은 공개 노드 메서드 `focus()`·`select()`·`refresh()`·`remount()`다.
  - 【추론】 각 메서드는 그 노드에 요청 사건을 내는 문장 하나이고, 원본을 쓰지 않는다.
  - 【추론】 배달은 EVENT-045·LANDING-076이다.
  - 【추론】 `FormHandle`은 오늘의 `focus(path)`·`select(path)`에 `refresh(path)`·`remount(path)`를 대칭으로 더한다.
  - 【추론】 넷 모두 `find(path)`한 노드의 메서드를 부르고, 노드가 없으면 아무것도 하지 않는다(오늘 `Form.tsx:147-150`과 같음).
  - 【추론】 노드의 공개 `publish`와 publish용 공개 사건 형은 두지 않는다.
  - 【추론】 명령이 대신한다.
  - 【추론】 두 명령이 버리는 것은 EVENT-039·EVENT-040의 표가 적고, README(PR-8)가 옮긴다.
  - 【추론】 노드 메서드는 PR-4(배달 경로)에서 겉면에 더하고 멤버 목록 시험과 08 §13 행을 함께 고친다.
  - 【추론】 `FormHandle`의 둘은 PR-7이다.
- 근거:
  - D-9 소유자 답: "사용자가 특정 서브트리의 값을 제어·비제어 컴포넌트와 무관하게 최신화하기 위한 사용자 도구"(`reviews/round-4.md:115`) — 사용자가 부를 수 없는 도구는 도구가 아니므로 공개 호출 경로가 여기서 나온다.
  - SURFACE-011(명령 넷은 공개 이름), C3 세부 3(`00-goals.md:117`), EVENT-041, EVENT-045(16라운드 답 3, `09-landing-and-test-strategy.md:62`), `03-mental-model.md:172`, REACT-025(노드 명령 `remount`), GOAL-006(G4: 명령은 노드 메서드 하나이고 `FormHandle`은 그것을 부른다), `adr/0008-event-system.md:144-146`(오늘 소비자는 publish하지 못함)
  - C-11(명령 publish)에 대한 소유자 답은 없다. `reviews/round-10-owner-answers.md:15`의 "C-11"은 다른 항목(런타임 채움 키)이다. "소유자 확정 대기"(`adr/0008-event-system.md:3,206`, `reviews/round-5-derivations.md:22`)는 편집자의 유보다.
  - 앞 라운드들이 이 항목을 소유자 정책으로 분류해 왔으므로 소유자에게 한 줄로 알린다.

### 18C-43 노드의 `schemaPath`·`key`

- 닫는 항목: NODE-019(`schemaPath`·`key`)
- 결정:
  - 【추론】 노드의 공개 `schemaPath`·`key`는 두지 않는다.
  - 【추론】 공유 노드는 선언이 여럿이라 스키마 위치 하나로 정의되지 않는다.
  - 【추론】 에러 라우팅의 키는 청사진 항목의 `id`(작성된 스키마 위치)이고 `validation` 안에서만 쓴다.
  - 【추론】 React key와 구성 요소 캐시의 키는 바인딩이 노드 인스턴스의 신원으로 짓는다(예: 노드를 키로 한 `WeakMap`의 일련번호).
  - 【추론】 같은 이름·다른 종류로 바뀌면 인스턴스가 달라 다시 마운트된다.
  - 【추론】 오늘 `schemaPath`를 넣은 key와 같은 효과다.
  - 【추론】 공유 노드와 배열 아이템(T-22)은 인스턴스가 이어지는 동안 다시 마운트되지 않는다.
  - 【추론】 통째 쓰기에서 아이템 인스턴스가 이어지는지는 18C-59가 정한다.
  - 이주(LANDING-154): 오늘의 `node.key`·`node.schemaPath`는 새 설계에 없다.
- 근거:
  - BLUEPRINT-002(`adr/0005-blueprint-analysis-and-node-sharing.md:29-41`, 청사진 항목 `id`가 에러 라우팅의 키), BLUEPRINT-010(노드 공유), NODE-025(identity는 렌더 계층이 같은 자식을 알아보는 수단), LANDING-039(같은 스키마 reset은 트리를 남김)
  - `.claude/rules/seiri_public-contract.md` §1(소비자는 `useChildNodeComponents.tsx:61-62` 한 곳, 바인딩 내부), `09-landing-and-test-strategy.md` §4.3(`schemaPath` 단언은 버리고 새로 씀)
  - `injectTo` 핸들러 문맥의 `ctx.schemaPath`는 18C-14가 둔다(오늘은 `AbstractNode.ts:986`의 `node.schemaPath`에서 온다).

### 18C-44 `resetSubtree`와 값 출처, `defaultValue` 게터

- 닫는 항목: WRITE-050, NODE-019(`defaultValue`·`resetSubtree`)
- 결정:
  - 【추론】 `resetSubtree()`와 게터 `defaultValue`를 남기고, 둘의 출처를 루트가 드는 로드 스냅숏으로 한다.
  - 【추론】 루트는 로드 스냅숏 하나를 든다.
  - 【추론】 경로 P에 값 V를 싣는 로드마다 `snapshot = setIn(snapshot, P, V)`로 고친다.
  - 【추론】 구조를 나눠 쓰므로 V와 스냅숏의 나머지는 복사하지 않고 P 위의 조상 칸만 새로 짓는다(로드 하나에 O(깊이)).
  - 【추론】 V는 바꾸지 않는 값으로 다룬다(WRITE-013, F24).
  - 【추론】 `node.defaultValue`는 `getIn(snapshot, node.path)`다.
  - 【추론】 로드가 그 경로에 닿기 전까지 같은 참조를 돌려준다.
  - 【추론】 `node.resetSubtree()`는 진입 하나에서 `clearSubtreeState()`를 한 뒤 `node.defaultValue`를 그 하위 트리에 로드한다.
  - 【추론】 로드이므로 빠진 키를 채우고(D-7, WRITE-017) 새 수명을 시작한다(SETTLE-027).
  - 【추론】 `FormHandle.reset()`은 커밋된 prop을 로드하고, 그 값이 스냅숏도 된다.
  - 【추론】 스냅숏은 core 자신의 로드 기록이며 prop 규칙을 core로 옮긴 것이 아니므로 WRITE-049는 그대로다.
  - 【추론】 배열 아이템은 자기 되돌림 값을 지킨다: 스냅숏은 위치가 아니라 신원을 따른다.
  - 【추론】 배열의 구조 연산은 그 경로의 스냅숏 배열도 고친다.
  - 【추론】 `remove(i)`·`pop`은 그 자리를 잘라 내고, `push(v)`·삽입은 새 아이템의 생성 값(`v`, 없으면 `undefined`라 되돌림이 채움을 받는다)을 넣는다.
  - 【추론】 이 비용은 스냅숏 배열에서 O(배열 길이)이며, 그 연산이 이미 하는 재색인과 같은 차수다.
  - 【추론】 구조 연산이 아닌 쓰기(`update(i, v)`, 입력 쓰기, `Merge`)는 스냅숏을 건드리지 않는다.
  - 【추론】 배열 통째 로드는 그 경로의 스냅숏을 바꾸며, 로드는 위의 규칙을 그대로 따른다.
  - 이주(LANDING-155): `defaultValue`는 그 경로에 닿는 로드마다 새 로드 값이 되고, 배열 아이템은 구조 연산을 따라 자기 값을 지킨다.
    - 오늘 `defaultValue`는 노드가 생긴 뒤 바뀌지 않는다(`AbstractNode.ts:290-296`).
- 근거:
  - 12-8 셋째 소유자: "root node 에 핸들로 추가하고, 개별 노드는 rootNode 의 기능을 경유해서 node.inactiveValues 를 구현하면 어떨까 싶다."(`reviews/round-18-owner-answers.md:22`) — 루트가 데이터를 들고 노드는 루트의 함수를 거친 게터를 두는 모양이며, 이 블록은 그 모양을 되돌림에 유추한다(소유자가 되돌림에 대해 한 답이 아니다).
  - 오늘 `resetSubtree()`는 하위 트리 상태를 비우고 값을 초기값으로 되돌린다(`src/core/nodes/AbstractNode/AbstractNode.ts:1135-1144`). 저장소 스토리가 이 기능을 쓴다(`stories/38.StateManagement.stories.tsx:1077,1676`).
  - 경로만 보는 스냅숏은 `remove(0)` 뒤에 한 아이템에게 다른 아이템의 로드 값을 준다. 오늘은 아이템마다 자기 초기값을 든다(`AbstractNode.ts:290-296`).
  - 소유자 16라운드 답 2: "사용자가 key를 사용한 리셋보다 효율적이고 안전한 방법을 얻길 바라긴 합니다"(`reviews/round-16-owner-answers.md:8`)
  - EVENT-027(`reset`·`resetSubtree`는 공개 쓰기를 거쳐 진입이 된다), NODE-010(하위 트리 상태 쓰기와 로드는 `dispatch`의 동사 진입)
  - WRITE-050 원문의 조건(노드마다 초기값 사본은 ADR 0006과 메모리에 걸림)은 스냅숏이 루트에 하나이고 구조를 나눠 쓰므로 걸리지 않는다. `08-design-a-to-z.md:461`(다시 켜질 때 생성값 복원 폐지)은 이 결정이 닿지 않는다.
  - 설계 가치(`packages/canard/schema-form/CLAUDE.md:7-8`: 같은 값을 두 번 읽으면 같은 참조, 변경마다 속도·메모리 비용을 적는다)
  - 오늘의 다른 소비자 `FormChildrenProps.defaultValue`(`src/components/Form/components/FormChildrenRenderer.tsx:45`, `rootNode?.defaultValue`)는 루트의 스냅숏 값을 읽게 된다.

### 18C-45 `ContextNode`의 자리와 `node.context`

- 닫는 항목: NODE-019(`ContextNode`)
- 결정:
  - 【추론】 `ContextNode`는 두지 않는다.
  - 【추론】 08 §4 노드 종류 표에 행을 더하지 않는다.
  - 【추론】 맥락은 노드가 아니라 루트가 드는 폼 입력(18C-13 (8))이다.
  - 【추론】 따라서 맥락에 `isObjectNode`가 참이 되는 일이 사라진다.
  - 【추론】 `find('@')`·`findAll('@')`의 특수 처리도 사라진다.
  - 【추론】 `@`는 식 토큰일 뿐 노드 경로가 아니다.
  - 【추론】 `node.context`는 루트의 맥락 객체(같은 참조)를 돌려주는 getter로 남긴다.
  - 【추론】 맥락의 갱신은 `finishInput`처럼 바인딩 전용 내부 통로(NODE-010)이며, 가칭 `setContext`다.
  - 【추론】 `FormTypeInputProps.context`도 오늘처럼 남기며, 루트의 맥락 객체(`node.context`와 같은 참조)를 준다.
  - 이주(LANDING-156): `find('@')`·`findAll('@')`는 오늘 맥락 노드를 돌려주고, 새 설계에서는 `null`·빈 배열을 돌려준다.
- 근거:
  - 안건 `reviews/round-18-agenda.md:89`의 스웜 권고("행을 두지 않는 것이며 `@` 맥락 명세가 정한다")
  - 오늘 `ContextNode`는 `type = 'object'`인 가짜 노드다(`ContextNode.ts:12-13`). `AbstractNode.ts:255`·`:270-271`·`:125-127`·`:1192-1194`, 공개 index는 내보내지 않는다(`core/nodes/index.ts:29`은 형만).
  - GOAL-006(G4)
  - 12-8 셋째 소유자 "root node 에 핸들로 추가하고, 개별 노드는 rootNode 의 기능을 경유해서"(`reviews/round-18-owner-answers.md:22`) — 루트가 데이터를 들고 노드는 getter로 읽는 모양이다. `inactiveValues`에 대한 답이라 유추로만 인용한다.
  - `node.context`나 `FormTypeInputProps.context`(`src/types/formTypeInput.ts:76-77`, 모든 입력 구성 요소가 받는 칸)를 없애면 오늘 호출자가 이득 없이 깨지므로 공개 인터페이스가 기대하게 하는 일관성(`packages/canard/schema-form/CLAUDE.md:7`)에 어긋난다. 갱신 통로는 NODE-010의 바인딩 전용 통로다.

### 18C-46 문서 주석 `{@inheritDoc}` 관례

- 닫는 항목: NODE-019(문서 주석 관례)
- 결정:
  - 【추론】 정본 문서 주석은 그 멤버를 선언한 인터페이스에 둔다.
  - 【추론】 공개 멤버는 `SchemaNode/type.ts`, 레코드 필드는 `record/`의 `SchemaNodeRecord`다.
  - 【추론】 클래스는 `/** {@inheritDoc <인터페이스>.<멤버>} */`로 가리킨다.
  - 【추론】 정본 주석은 매개변수, 결과, 목적, 실패 조건, 부수 효과를 모두 적는다.
  - 【추론】 클래스 쪽의 한 줄 `{@inheritDoc}`로 저장소 주석 규칙 §4("Every declaration the form reaches carries one")를 충족한 것으로 본다.
  - 【추론】 클래스 쪽에 같은 설명을 다시 적지 않는다.
  - 【추론】 관례는 `SchemaNode/DETAIL.md`에 적는다.
  - 【추론】 결과로 겉면 파일은 250–350줄 쪽이 된다.
- 근거:
  - `.claude/rules/seiri_code-comments.md` §1(아무것도 검사하지 않는 둘째 사본 금지), §2(코드가 보이는 것을 되풀이하지 않음), §5(언어의 관례: TSDoc의 `{@inheritDoc}`), `.claude/rules/seiri_agent-legible.md` §2(사본이 있으면 어느 것이 정본인지 적음)
  - NODE-004(`behavior`·`structure`·`runtime`은 공개 인터페이스에 없는 클래스 멤버), NODE-015(공개 합집합에는 레코드 필드를 싣지 않음), `reviews/raw-round17-node-structure.md:150`(줄 수 추정)
  - 저장소에 앞선 `@inheritDoc` 쓰임은 없다. 저장소 규칙이 seiri 기본값보다 앞서므로 이 관례는 저장소 규칙의 해석으로 정한다.

### 18C-47 `Node`로 줄인 오늘의 공개 이름

- 닫는 항목: NODE-012, SURFACE-047
- 결정:
  - 【추론】 이름의 맨앞에 홀로 선 `Node`만 바꾼다.
  - 【추론】 개명은 둘이다: `NodeState` → `SchemaNodeState`, `NodeEventType`(공개 별칭, 오늘 `src/index.ts:44`의 `PublicNodeEventType as NodeEventType`) → `SchemaNodeEventType`.
  - 【추론】 종류나 역할의 낱말이 이름공간을 좁히는 이름은 그대로 둔다: 종류 형 일곱(`ArrayNode`·`BooleanNode`·`NullNode`·`NumberNode`·`ObjectNode`·`StringNode`·`VirtualNode`), 가드(`isArrayNode` 등과 `isBranchNode`·`isTerminalNode`), `FormTypeInputPropsWithNode`, `ChildNodeComponentProps`, 훅 `useChildNodeComponentMap`·`useChildNodeErrors`(`src/index.ts:60,64,82-83`).
  - 【추론】 범위 문장: "`Node`를 이름의 맨앞에 홀로 쓰지 않는다."
  - 【추론】 종류·역할 낱말이 앞에 붙은 `…Node`는 NODE-011의 "아주 좁은 이름공간"으로 본다.
  - 【추론】 18C-02의 새 가드(가칭 `isUnionNode`)도 이 규칙으로 짓는다.
  - 【추론】 `NodeStateFlags`는 `src/index.ts`가 이름으로 내보내지 않고 `components/Form/type.ts:58,118-119`의 형으로만 닿으므로 개명 목록에 들지 않는다.
  - 【추론】 `NodeStateFlags`에는 새 코드가 NODE-011을 적용한다.
  - 【추론】 새 이름의 공개 형은 PR-2의 `SchemaNode/type.ts`가 처음부터 쓰고, 소비자 이주는 PR-7이다.
  - 이주(LANDING-157): 공개 형 `NodeState`의 이름이 `SchemaNodeState`로 바뀐다.
  - 이주(LANDING-158): 공개 이벤트 형 `NodeEventType`의 이름이 `SchemaNodeEventType`으로 바뀐다.
- 근거:
  - 소유자: "Node 라는게 js 런타임에 이미 예약어로 쓰고있는 이름이라서요"·"그래서 Node~~ 를 전부 SchemaNode~ 로 기존에 이름을 붙여준거에요."(`reviews/round-17-owner-answers.md:53`) — 이 말이 가리키는 모양은 맨앞의 `Node~~`이며, 이를 오늘 이름의 개명 범위로 읽은 것은 편집자다(소유자의 개명 지시가 아니다).
  - `reviews/round-17-owner-answers.md:22`의 반영 칸과 NODE-015는 가드 `isBranchNode`·`isTerminalNode`의 이름을 둔다. 두 답을 함께 지키는 범위가 맨앞의 `Node`다.
  - 설계 가치(`packages/canard/schema-form/CLAUDE.md:7`): 종류 형과 가드가 같은 `…Node` 모양으로 남아 `isArrayNode(x): x is ArrayNode`가 맞물린다.
  - NODE-011, SURFACE-010, `08-design-a-to-z.md:425`, `src/index.ts:42,44`

### 18C-48 내부 통로를 core만 쓰는 호스트에 열지

- 닫는 항목: NODE-019(내부 통로)
- 결정:
  - 【추론】 열지 않는다.
  - 【추론】 내부 통로는 NODE-010대로 바인딩 전용이다.
  - 【추론】 `SchemaNode/` 진입점이 이름으로 내보내고, `core/index.ts`가 다시 내보내며, `src/index.ts`에는 없다.
  - 【추론】 패키지의 공개 진입점은 `.` 하나뿐이고 트리를 직접 만드는 공개 경로가 없다.
  - 【추론】 `nodeFromJSONSchema`는 `src/index.ts`가 내보내지 않는다(`src/index.ts:33-54`, `src/core/index.ts:1`).
  - 【추론】 그러니 공개 호스트는 모두 바인딩을 거치며, 통로를 열면 소비자 없는 공개 계약이 생긴다.
  - 【추론】 core만 쓰는 호스트(예: 코어 시나리오 러너)는 포커스 개념이 없다.
  - 【추론】 자른 값이 필요하면 `setValue`로 쓴다.
  - 【추론】 뒤에 공개 core 진입점(하위 경로 수출)을 두게 되면, 그때 통로를 그 진입점의 계약으로 이름 붙여 여는 것이 계약 변경이다.
- 근거:
  - NODE-010, `.claude/rules/seiri_public-contract.md` §1·§3, 12-2(`reviews/round-18-owner-answers.md:12`, `trim`은 포커스 아웃 때의 자동 쓰기), REACT-003(core만 쓰는 호스트에는 렌더 계층의 암묵 규칙이 없음)

## §8 전환

### 18C-49 레거시 디렉토리의 이름과 자리, 그 동안의 시험과 스토리북

- 닫는 항목: LANDING-054
- 결정:
  - 【추론】 레거시 디렉토리는 `src/__legacy__/`다.
  - 【추론】 옮기는 파일은 원래의 `src/` 아래 상대 경로를 그대로 둔다(`src/core/nodes/` → `src/__legacy__/core/nodes/`).
  - 【추론】 import는 별칭 접두만 바꾼다(`@/schema-form/core/nodes` → `@/schema-form/__legacy__/core/nodes`).
  - 【추론】 PR마다 그 PR이 새로 쓰는 영역의 옛 파일만 옮긴다.
  - 【추론】 예를 들어 PR-2는 `src/core/nodes`, 그것이 가져오는 `src/core/parsers`(→ `src/__legacy__/core/parsers/`), 옛 `src/core/__tests__`를 옮긴다.
  - 【추론】 이것으로 새 `src/core/__tests__/scenarios/` 자리가 빈다.
  - 【추론】 옛 노드는 PR-7까지 오늘의 parse 동작을 지키고 새 parse(18C-36)를 가져오지 않으므로, 아래 규칙 2의 허용 목록은 바뀌지 않는다.
  - 【추론】 규칙 1: 새 fractal(PR-1부터 새로 쓴 것)은 `__legacy__`를 가져오지 않는다.
  - 【추론】 규칙 1은 파일 한정 ESLint `no-restricted-imports`로 막고 PR-1에서 건다.
  - 【추론】 규칙 2: 레거시 → 새 코드는 08 §17.2가 이미 적은 곳만 허용한다(예: 옛 `intersect*Schema`가 새 잎 교차 함수를, 옛 소비자가 청사진으로 옮긴 식 컴파일러를 가져온다).
  - 【추론】 규칙 3: `src/core/index.ts`와 `src/index.ts`는 PR-7까지 옛 엔진을 가리킨다.
  - 【추론】 새 엔진은 PR-7 전까지 `<Form>`에 닿지 않는다.
  - 【추론】 규칙 4: PR-7은 진입점을 새 엔진으로 바꾸고 `src/__legacy__/`를 통째로 지운다.
  - 【추론】 그 점검은 그 디렉토리와 그것을 가리키는 import가 하나도 없는 것이다.
  - 【추론】 빌드와 공개 진입점에서 따로 뺄 설정은 두지 않는다.
  - 【추론】 rolldown은 `src/index.ts`가 닿는 것만 묶는다.
  - 【추론】 그 사이의 산출물은 옛 엔진이고, 우산 브랜치는 PR-8 전에 배포하지 않으며, PR-7이 디렉토리를 지운다.
  - 【추론】 이름을 `__legacy__`로 하는 것은 filid 분류 규칙 (3)으로 organ이 확정되어 설계의 fractal로 읽히지 않기 때문이다.
  - 【추론】 저장소의 `__tests__` 관례와 모양이 같다.
  - 【추론】 `src` 안에 두면 tsc·eslint·Storybook의 포함 규칙과 `@/schema-form` 별칭이 설정 변경 없이 따라간다.
  - 【추론】 저장소 filid 설정(`.filid/config.json`)은 `max-depth`를 severity `error`, `maxDepth: 14`로 건다.
  - 【추론】 가장 깊은 `src` 디렉토리가 저장소 뿌리에서 13단이므로 `__legacy__`를 끼우면 14단이다.
  - 【추론】 PR-1 점검에 "filid `max-depth` 통과. 실패하면 `src/__legacy__/**`를 예외로 두는 설정 변경을 같은 PR에서 한다"를 둔다.
  - 【추론】 옛 코드와 함께 사는 `__tests__`는 코드와 함께 옮겨지고, PR-7까지 그대로 돈다.
  - 【추론】 `<Form>`이 쓰는 옛 엔진을 지키는 것이다.
  - 【추론】 09 §4.3의 처분은 파일마다 한다.
  - 【추론】 "그대로 산다"는 단위가 새 자리로 옮겨 가는 PR에서 함께 새 자리로 간다(레거시가 아님).
  - 【추론】 "버리고 새로 쓴다"는 레거시로 옮겨 돌다가, 그 상황 목록이 대체 PR의 데이터 모듈로 옮겨진 뒤 PR-7에서 디렉토리와 함께 지운다.
  - 【추론】 "표면만 고친다" 렌더 시나리오 17파일과 `src/__tests__`의 나머지는 `<Form>`을 시험하므로 자리를 지키다가 PR-7에서 처분한다.
  - 【추론】 PR-0의 세 프로젝트 글롭(`unit`·`render`·`storybook`)이 `src/__legacy__/**`를 포함한다.
  - 【추론】 옛 스토리(`stories/`)는 `../src`의 진입점으로 옛 엔진을 그리므로 PR-7까지 그대로 돈다.
  - 【추론】 새 문법의 시나리오 스토리는 `<Form>`이 새 엔진을 쓰는 PR-7부터 그릴 수 있다.
  - 【추론】 PR-7이 09 §5.4대로 옛 스토리를 정리한다(16라운드 답 4 "전체 정리 허용").
  - 【추론】 옛 엔진의 마지막 벤치 기준선(`bench:baseline`)은 PR-2가 `core/nodes`를 옮기기 전에 잰다.
- 근거:
  - 소유자 답(`reviews/round-17-owner-answers.md:52`, 전환 방식), LANDING-052, `08-design-a-to-z.md:552`(새 엔진은 PR-7 전까지 `<Form>`에 닿지 않음), `:574`, `:577`(PR-7이 레거시로 옮긴 옛 코드를 삭제), `09-landing-and-test-strategy.md` §4.3·§5.4·§6.1
  - `reviews/round-16-owner-answers.md:10`(답 4), `reviews/round-16-owner-review.md:36`, `.claude/rules/filid_fractal-boundaries.md` §1(3)
  - LANDING-061(옛 `intersect*Schema`가 "옛 동작을 PR-7까지 지킨다", 같은 취지), 18C-36
  - 패키지 사실: `package.json`의 `exports`는 `.` 하나이고 `files`에 `src`가 없다. rolldown의 입력은 `src/index.ts`. `tsconfig.json`의 `include`는 `src/**`. `vite.config.ts`의 alias는 `@/schema-form → ./src`. `.storybook/main.ts:16-22`의 stories 글롭은 `../src/**`와 `../stories/**`. 스토리 54파일 가운데 50파일이 `../src`를 가져온다. 저장소에 `legacy` 류 선례는 없다.

## §9 PR-3 이후

### 18C-50 에지의 값 동등 판정과 `controls.derived` 의존 집합

- 닫는 항목: SETTLE-039, VALUE-021, TEST-063
- 결정:
  - 【추론】 (가) "값이 바뀌었다"는 하나의 판정(가칭 `sameValue`, 내부)으로 본다.
  - 【추론】 원시 값은 SameValueZero로 본다.
  - 【추론】 `NaN`은 `NaN`과 같고 `-0`은 `0`과 같다.
  - 【추론】 배열은 길이와 차례대로의 원소를 본다.
  - 【추론】 평범한 객체는 자기 열거 키의 목록(순서 포함)과 키마다의 값을 본다.
  - 【추론】 그 밖의 객체(함수, `Date`, 클래스 인스턴스, `File` 등)는 참조로 본다.
  - 【추론】 두 값의 참조가 같으면 더 내려가지 않는다(지름길).
  - 【추론】 (나) 커밋 단계에서, 이번 정착에 쓰인 잎의 `raw`·`extras`가 직전 커밋의 것과 (가)로 같으면 직전 참조를 둔다.
  - 【추론】 쓰기 경계에서 지금 값과 같으면 쓰지 않는 것은 오늘과 같다.
  - 【추론】 호스트의 `emit`은 VALUE-012대로 만든다.
  - 【추론】 새로 만든 것이 직전 커밋의 것과 키 목록(순서 포함)도 같고 키마다의 자식 `emit` 참조도 같으면 직전 참조를 둔다(얕은 비교, 재계산 목록의 호스트만).
  - 【추론】 그래서 EVENT-031·EVENT-006의 "emit 참조가 바뀜"은 "방출 값이 바뀜"과 같아진다.
  - 【추론】 `onChange`·배달·검증 요청은 참조 비교만으로 값 비교를 따른다.
  - 【추론】 에지는 원천이나 의존의 값을 기준점(SETTLE-004·SETTLE-028)과 (가)로 견준다.
  - 【추론】 대상은 `injectTo`의 원천 방출 값, `derived`의 의존 값, `unsetValue`·`resetInteraction`의 식 값이다.
  - 【추론】 (다) 지름길 때문에 비교는 이번 정착에서 새로 만들어진 부분에만 내려간다.
  - 【추론】 그래서 비용은 쓰기가 바꾼 크기에 비례한다(G6).
  - 【추론】 12-3은 검증기 성능에 관한 답이므로 폼 자신의 이 비용에는 닿지 않는다.
  - 【추론】 TEST-063은 결정 관문에서 PR-3 벤치의 회귀 항목으로 바뀐다.
  - 【추론】 (라) `controls.derived` 규칙의 의존 집합은 두 경로의 합집합이다: 청사진이 그 식에서 정적으로 뽑은 경로, 그리고 그 노드의 `controls.watch` 경로(모든 선언의 합집합).
  - 【추론】 역의존 표와 같은 표에서 나온다.
  - 【추론】 같은 노드의 다른 식(`active`·`visible`·`readOnly`·`disabled`·`unsetValue`)이 읽는 경로는 들지 않는다.
  - 【추론】 에지는 이 집합의 값 튜플이 기준점과 (가)로 다를 때다.
  - 【추론】 경로가 읽는 값의 종류, 그리고 `@` 맥락의 변경이 에지인지는 18C-13이 정한다.
  - 이주(LANDING-160): 오늘 `NumberNode.__equals__`의 근사 비교(`src/core/nodes/NumberNode/NumberNode.ts:28-38`, `isClose`)는 정확한 비교가 된다.
  - 이주(LANDING-161): `ObjectNode`의 키 순서를 무시하는 `equals`(`ObjectNode.ts:46-52`)는 키 순서를 보게 된다.
  - 이주(LANDING-162): 오늘 `ObjectNode.__equals__`가 쓰는 `@winglet/common-utils/object`의 `equals`(`packages/winglet/common-utils/src/utils/object/equals/equals.ts`)는 내장 객체(`Date` 등)를 내부 상태로, 클래스 인스턴스를 구조로 비교하며, 새 규칙 (가)는 이들을 참조로 본다.
  - 이주(LANDING-163): 오늘은 노드의 모든 계산 속성이 한 의존 배열을 나눠(`ComputedPropertiesManager.ts:264-268`, `AbstractNode.ts:516-555`) `active`만 읽는 경로가 바뀌어도 `derived`를 다시 세고, 새 설계에서는 `derived`가 자기 의존 집합에서만 발화한다.
- 근거:
  - VALUE-021(`06-conclusions.md:253`, 이력에 달린 결과는 G4 위반이라 값 비교를 택했다), GOAL-011(`00-goals.md:75-84`)
  - VALUE-012(`adr/0006-single-value-ownership.md:68`), EVENT-031(`adr/0008-event-system.md:116`), SETTLE-004(`adr/0007-settle-cycle.md:38`), SETTLE-028(`adr/0007-settle-cycle.md:92`)
  - `-0`을 `0`과 같게 보는 것은 편집자 판단이다(SameValueZero를 고른 결과).
  - VALUE-010(전체 교체는 V의 키 순서를 따른다), LANDING-039("키 순서까지 깊게 같음"), 18C-39
  - BLUEPRINT-022(`08-design-a-to-z.md:181`), CONTROLS-032 보충(`08-design-a-to-z.md:115`, "의존은 모든 선언의 합집합(청사진, 정적)"), SETTLE-017
  - CONTROLS-026("사용자가 쓴 값은 다음 의존 변화 … 까지 남는다") — 다른 식의 경로가 derived를 발화시키면 이 약속이 깨진다.
  - 소유자 16라운드 답 10: "최소생성, 메모리안정, 캐싱을 통한 속도 및 재생성 방지가 고속성 원칙에 포함됩니다."(`reviews/round-16-owner-answers.md:16`)
- 게이트:
  - PR: PR-3 벤치(회귀 항목).
  - 무엇: 객체 원천 `injectTo`(1만 원소의 터미널 객체·배열)에서 한 원소 쓰기의 비교 비용이 값 크기와 무관한지, 통째 교체가 선형인지 잰다.
  - 실패: 값 비교를 되돌리지 않고 지름길 구현을 고친다.

### 18C-51 조각 `controls`의 식 규칙과 나감 에지

- 닫는 항목: FRAGMENT-041
- 결정:
  - 【추론】 조각의 `controls`에 둔 에지 규칙(`unsetValue`·`derived`·`resetInteraction`·`injectTo`)은 그 조각이 켜져 있는 동안만 후보다.
  - 【추론】 (1) 나감은 이 규칙들의 에지가 아니다.
  - 【추론】 조각이 꺼지는 정착에서 그 규칙은 평가하지도 발화하지도 않는다.
  - 【추론】 꺼짐이 값에 닿는 장치는 나감 정책 `unsetOnInactive` 하나다.
  - 【추론】 그 정책은 조각 층의 값으로, 직전 커밋의 값을 쓴다.
  - 【추론】 (2) 조각이 켜지는 정착에서 그 조각이 새로 들인 노드의 규칙 에지는 거짓→참이다(WRITE-029).
  - 【추론】 그래서 `unsetValue`·`resetInteraction`은 식이 참이면 발화하고, `derived`·`injectTo`는 발화한다.
  - 【추론】 형상에 남아 있던 공유 노드는 그 규칙의 기준점만 그 정착의 값으로 잡고 발화하지 않는다(CONTROLS-026, VALUE-025).
  - 【추론】 (3) 후보 여부는 그 라운드의 완성된 트리에서 조각이 켜져 있는지로 정한다.
  - 【추론】 앞 라운드에 적용된 파생 쓰기는 뒤 라운드에서 조각이 꺼져도 되돌리지 않는다.
  - 【추론】 철회는 채움만 한다.
  - 【추론】 (4) 조각의 `controls.default`는 에지 규칙이 아니라 채움이며, 노드가 생길 때만 쓴다.
- 근거:
  - WRITE-029(`03-mental-model.md:90`, 소유자 동의 `reviews/round-12-owner-answers.md:18` "동의"): "형상에 없는 노드의 규칙은 평가하지 않는다 … 다시 생기면 … 거짓→참으로 본다". (2)를 반대로 하면 꺼진 동안의 식 값이 필요해 이 규칙과 어긋난다.
  - CONTROLS-026(소유자 답 `reviews/round-12-owner-answers.md:19-20`): "사용자가 쓴 값은 다음 의존 변화 또는 그 노드가 다시 생길 때까지 남는다" — 노드가 형상에 남아 있으면 조각이 다시 켜지는 것은 의존 변화도 재탄생도 아니다.
  - CONTROLS-042(`adr/0003-group-namespace.md:99`, "그 조각이 켜져 있는 동안"), CONTROLS-024, CONTROLS-038, WRITE-030, 08 §8.4의 선언의 나감(R17-2 ㄴ), SETTLE-005, `08-design-a-to-z.md:316`("재탄생은 새 삶이다")

### 18C-52 유효 스키마 변경 통지의 표면

- 닫는 항목: EVENT-048, SURFACE-015
- 결정:
  - 【추론】 유효 스키마 변경은 이벤트 타입 하나로 싣는다.
  - 【추론】 가칭은 `UpdateJsonSchema`다(`UpdateValue`↔`value`처럼 공개 읽기 `node.jsonSchema`를 따른 이름).
  - 【추론】 커밋에서 노드의 메모된 유효 스키마 참조가 그 노드에 마지막으로 통지한 것과 다를 때 켜진다.
  - 【추론】 같은 덧씌움 집합이면 같은 참조이므로 참조 비교로 충분하다.
  - 【추론】 EVENT-006 배달 집합의 "유효 스키마가 바뀐 노드" 항이 이 비트다.
  - 【추론】 트리 생성(마운트·재생성)에서는 통지하지 않는다.
  - 【추론】 같은 스키마의 reset·`setValue` 로드에서 바뀌면 통지한다.
  - 【추론】 payload는 `{ previous, current }`이며 둘 다 유효 스키마 참조이고 복사하지 않는다.
  - 【추론】 `previous`는 마지막으로 통지한 것이다(EVENT-024).
  - 【추론】 개발 모드 `Object.freeze`는 payload 객체에만 한다.
  - 【추론】 유효 스키마는 작성자 객체를 참조로 옮겨 쓸 수 있기 때문이다.
  - 【추론】 출처 칸은 없다.
  - 【추론】 12-5의 출처는 `UpdateValue`의 쓰기 출처이고, 유효 스키마 변경은 쓰기가 아니다.
  - 【추론】 공개 이벤트 타입(오늘 `PublicNodeEventType`의 자리, 공개 이름 `SchemaNodeEventType`, 18C-47)에 넣어 `node.subscribe`로 받는다.
  - 【추론】 공개 소비자는 `node.subscribe`·`useSchemaNodeSubscribe`(`src/index.ts:80`)로 `node.jsonSchema`를 읽는 입력 작성자다.
  - 【추론】 더하는 것이므로 minor다.
  - 【추론】 렌더 계층은 `SchemaNodeProxy`의 재렌더 마스크에 이 비트를 더한다.
  - 【추론】 계산 상태(`active`·`visible`·`readOnly`·`disabled`·`watchValues`)의 비트와는 따로 둔다.
  - 【추론】 오늘의 내부 `UpdateComputedProperties`(`src/core/types/event.ts:63`)가 계산 상태 쪽 비트다.
- 근거:
  - EVENT-006(`adr/0008-event-system.md:61-64`), EVENT-045(`09-landing-and-test-strategy.md:64` "비트는 슬라이스 4에서 정한다"), EVENT-023, EVENT-024, EVENT-047(이벤트 타입은 공개 API로 적을 뿐 소유자 승인을 요구하지 않음), SURFACE-007(`UpdateDiagnostics`도 편집자 결정)
  - REACT-012(`09-landing-and-test-strategy.md:52`), `adr/0005-blueprint-analysis-and-node-sharing.md:109,123`
  - GOAL-016(소유자 C3, `00-goals.md:106`: 다른 플랫폼에 이식될 수 있는 코어 모듈), EVENT-060(12-5는 `UpdateValue`에 한함)
  - 오늘 코드: `src/core/types/event.ts:45-90`, `SchemaNodeProxy.tsx:21-24`, `DeferrableNodeProxy.tsx:37`, `src/index.ts:80`

### 18C-53 검증 에러 라우팅(Q12)과 union 호스트 수준 에러, 잔여 키

- 닫는 항목: VALIDATE-012, ERROR-180, VALIDATE-038
- 결정:
  - 【추론】 (1) 라우팅은 판정을 바꾸지 않는다.
  - 【추론】 모든 에러는 순서대로 폼 수준 목록에 남는다.
  - 【추론】 폼 수준 목록은 루트의 `globalErrors`다(18C-41).
  - 【추론】 아래 규칙으로 어느 노드에도 싣지 않은 에러가 주인 없는 에러다.
  - 【추론】 (2) 배정은 플러그인이 정규화한 `dataPath`로 한다.
  - 【추론】 `required`는 빠진 자식의 경로다(오늘 ajv 플러그인과 같음, `schema-form-ajv8-plugin/src/validator/utils/transformErrors.ts:42-53`).
  - 【추론】 (3) `rejectedKey`가 있는 에러는 그 키를 든 호스트 노드(형상 안)의 `errors`에 그대로 싣는다.
  - 【추론】 잔여 키의 목록·문구·UI는 렌더 계층의 일이다(REACT-026, 18C-77).
  - 【추론】 (4) `dataPath`와 경로가 같은 형상 안의 노드가 받는다.
  - 【추론】 그 경로가 터미널 노드 아래면 그 터미널 노드가 받고, `dataPath`는 그대로 둔다.
  - 【추론】 형상 안에 그런 노드가 없으면 노드에 싣지 않는다(꺼진 조각에만 선언된 필드 등).
  - 【추론】 (5) 꺼진 분기 거르기(표시 필터): `schemaPath`가 `oneOf`·`anyOf`의 한 분기 안으로 풀리고, 그 분기가 꺼져 있고, 같은 union에 켜진 분기가 있으면 그 에러는 노드에 싣지 않고 폼 수준 목록에만 남는다.
  - 【추론】 켜진 분기가 없거나 귀속을 가를 수 없으면 거르지 않는다(`$ref`로 여러 분기가 같은 위치를 쓰는 경우, 원격 `$id`).
  - 【추론】 게이트 없는 분기는 늘 켜져 있으므로 걸리지 않는다.
  - 【추론】 `allOf` 항목·`if`/`then`/`else`·`controls.active` 조각은 거르지 않는다.
  - 【추론】 그 에러는 저마다 판정을 막기 때문이다.
  - 【추론】 귀속은 청사진의 조각 표(분기 위치와 `$ref` 대상)로 한다.
  - 【추론】 `if`의 내용은 읽지 않는다.
  - 【추론】 (6) `oneOf`·`anyOf` 자체의 에러는 (4)대로 호스트 노드가 받는다.
  - 【추론】 판별 노드로 옮기는 특례는 두지 않는다.
  - 【추론】 판별 값이 어느 분기와도 맞지 않으면 켜진 분기가 없어 (5)가 거르지 않는다.
  - 【추론】 그래서 분기별 `const` × N과 판별 키의 `required`는 `dataPath`대로 판별 노드가 받는다.
  - 【추론】 판별 노드는 `controls.discriminator`가 끌어올려 늘 형상에 있다.
  - 【추론】 같은 문구의 중복 표시와 번역은 렌더 계층(`formatError`)의 몫이다.
  - 【추론】 새 코드는 없다(검증 결과는 `onError` 밖).
- 근거:
  - VALIDATE-009, VALIDATE-011("작성자의 실수를 폼이 가리지 않는다", `adr/0001-validator-input-invariant.md:45`), VALIDATE-012 정본의 취지(`adr/0001-validator-input-invariant.md:44`), ADR 0001 5차 주 (5)(`adr/0001-validator-input-invariant.md:3`, 게이트 없는 분기는 모두 활성)
  - ajv는 union이 실패할 때만 분기 에러를 낸다. 그래서 꺼진 분기의 에러는 켜진 분기가 있을 때 홀로 판정을 막지 않는다.
  - CONTROLS-031(`08-design-a-to-z.md:114`, 끌어올림), BLUEPRINT-006(분기의 `const` 값을 읽지 않음), `adr/0005-blueprint-analysis-and-node-sharing.md:129`(E17의 전제 상실), FRAGMENT-020, FRAGMENT-023, NODE-022(소유자 A-3)
  - 오늘 코드 `ValidationManager.ts:148-160`(`dataPath` 배정과 variant의 `schemaPath` 접두 필터)
- 게이트:
  - PR: PR-4 시험.
  - 무엇: 규칙 (5)의 귀속이 플러그인마다 다른 `$ref` 아래 `schemaPath` 모양에서 맞는지 ajv6·7·8 사례로 본다.

### 18C-54 `validatorFactory`와 플러그인의 계약 통일

- 닫는 항목: VALIDATE-041
- 결정:
  - 【추론】 (1) 계약 형은 하나다(가칭 `Validator`).
  - 【추론】 `Validator`는 `compile(copy)`, `compileGuard(root, pointer)`, 선택 `release(root)`(18C-56), 선택 방언 선언(VALIDATE-026), 그리고 `compile` 결과 함수의 에러 정규화(`dataPath`, 루트 경로 표기, `rejectedKey`)를 담는다.
  - 【추론】 플러그인은 여기에 소비자 훅 `bind?`만 더 가진다.
  - 【추론】 core는 `bind`를 부르지 않는다.
  - 【추론】 `<Form validatorFactory>`(이름 유지, O-7)와 오늘의 `FormProvider` 속성 `validatorFactory`는 이 형을 그대로 받는다.
  - 【추론】 (2) 고르는 순서는 Form 속성 > `FormProvider` > 등록한 플러그인이다.
  - 【추론】 오늘의 순서다(`RootNodeContextProvider.tsx:94`, `ValidationManager.ts:203`).
  - 【추론】 바인딩 계층이 트리를 만들 때 한 번 고르고, 그 결과나 없음을 core에 인자로 넘긴다(18C-55).
  - 【추론】 미등록 판정은 고른 결과가 없음인 것이다(VALIDATE-042와 같은 뜻).
  - 【추론】 (3) 고른 검증기의 참조가 트리 생성 뒤 바뀌면 다른 스키마와 같이 재생성한다.
  - 【추론】 캐시와 등록이 검증기 인스턴스마다이기 때문이다.
  - 【추론】 오늘도 `useMemo` 의존으로 트리를 다시 만든다(`RootNodeContextProvider.tsx:85-104`).
  - 【추론】 매 렌더 새 객체를 주지 말라고 문서화한다.
  - 【추론】 (4) 가드 함수는 같은 값에 같은 boolean을 동기로 돌려준다.
  - 【추론】 던지거나 boolean이 아닌 값(비동기 스키마의 Promise 등)을 내면 그 평가는 가드 실패(`GUARD_FAILED`, 정착 오류)다.
- 근거:
  - VALIDATE-040, VALIDATE-041, VALIDATE-042, 소유자 O-7: "특정 커스텀 검증기 등을 추가한 커스텀 인스턴스 주입기임"(`reviews/round-14-owner-answers.md:13`)
  - VALIDATE-015, VALIDATE-016(동기 전용, `adr/0004-validator-plugin-compile-guard.md:32`), `08-design-a-to-z.md:465`(이주 33: 속성은 `{compile, compileGuard}` 객체, 플러그인과 같은 계약), FRAGMENT-020, VALIDATE-026
  - 오늘 `src/app/plugin/type.ts`의 `bind`

### 18C-55 core→`PluginManager` import 분리와 스키마 비직렬화

- 닫는 항목: CONTROLS-066
- 결정:
  - 【추론】 (1) core는 `app/plugin`을 가져오지 않는다.
  - 【추론】 검증기는 18C-54의 순서로 바인딩 계층이 골라 트리 생성 인자로 넘긴다.
  - 【추론】 보고기·터미널 판정 함수가 이미 쓰는 통로와 같다.
  - 【추론】 core만 쓰는 호스트는 `nodeFromJSONSchema`의 선택 인자로 직접 넘긴다(오늘도 있다, `src/core/nodeFromJSONSchema.ts:23`).
  - 【추론】 `PluginManager`의 검증기 칸은 바인딩 계층이 읽는 등록소로 남는다.
  - 【추론】 PR-4의 경계 린트는 새 fractal(`src/core/{blueprint,record,behaviors,navigation,settle,dispatch,validation,SchemaNode}/**`)에 건다.
  - 【추론】 `src/core/**` 전체로 넓히는 것은 PR-7이다.
  - 【추론】 타입 쪽 의존은 GOAL-088(18C-76)에서 다룬다.
  - 【추론】 (2) 인라인 구성 요소를 담은 스키마는 직렬화할 수 없고, 이를 풀 장치를 두지 않는다.
  - 【추론】 직렬화할 수 있는 길은 `presentation.formType`과 `formTypeInputMap`·`formTypeInputDefinitions`다.
  - 【추론】 core는 스키마를 직렬화하지 않는다.
  - 【추론】 사본은 `presentation`을 지우고(VALIDATE-004), 같은 스키마 비교는 JSON 밖 칸을 참조로 본다(LANDING-039).
- 근거:
  - GOAL-014(소유자 C1): "병합을 form이 해야 하는 의도를 모르겠다. 서버 스키마를 수정하지 않겠다는 의도 하나 때문에 이중 입구를 만드는 것 아닌가."(`reviews/round-2.md:113`) — "직렬화할 수 없는 값(컴포넌트)의 통로는 이미 있다"는 같은 칸(`00-goals.md:104`)의 편집자 서술이다.
  - GOAL-016, GOAL-031(C3·P5), CONTROLS-052, `08-design-a-to-z.md:398`
  - 오늘 코드: `ValidationManager.ts:1,203`, `PluginManager.ts:83-97`(core 안의 `app/plugin` import는 이 한 곳뿐), `src/core/types/value.ts:15`, `state.ts:6`, `event.ts:21`(런타임으로 `@/schema-form/app/constants`를 가져온다) — 18C-49대로 `src/core/index.ts`가 PR-7까지 옛 엔진에 남으므로 PR-4 린트의 범위를 새 fractal로 한정한다.

### 18C-56 사본 루트 등록의 해제 계약과 최근 해제 목록의 크기

- 닫는 항목: VALIDATE-022
- 결정:
  - 【추론】 최근 해제 목록은 검증기 인스턴스마다 하나이고, 크기는 8이다(내부 상수, 공개 옵션 아님).
  - 【추론】 가득 차면 가장 먼저 해제된 루트부터 밀려난다.
  - 【추론】 목록 안의 루트가 다시 커밋되면 목록에서 빠지고 다시 컴파일하지 않는다.
  - 【추론】 푸는 때는 둘뿐이다: 목록에서 밀려날 때, 그리고 같은 루트 `$id`의 새 루트를 등록하기 직전의 목록 안(참조 수 0) 옛 루트(VALIDATE-021)다.
  - 【추론】 참조 수가 1 이상인 루트는 풀지 않는다.
  - 【추론】 core는 플러그인의 `release(root)`를 루트마다 한 번 부른다.
  - 【추론】 플러그인은 등록(ajv `removeSchema(key)`)과 컴파일 결과를 버린다.
  - 【추론】 이어 core는 자기 캐시의 그 작성 루트 항목을 지운다.
  - 【추론】 `release`가 없으면 core 캐시만 지운다.
  - 【추론】 이 저장소의 ajv 플러그인 셋은 `release`를 구현한다.
  - 【추론】 플러그인 계약에 선택 `release`를 더하는 것은 minor다.
  - 【추론】 메모리 상한은 검증기 인스턴스마다 '살아 있는 루트 수 + 8'이다.
  - 【추론】 목록이 흡수할 것은 StrictMode의 흉내 언마운트, 커밋되지 않은 렌더, 몇 개 스키마를 오가는 화면이다.
  - 【추론】 서버에서는 효과가 돌지 않아 모든 트리가 참조 수 0으로 목록에 든다.
  - 【추론】 목록이 작아야 서버 메모리가 묶인다.
- 근거:
  - VALIDATE-021(`08-design-a-to-z.md:345`, `09-landing-and-test-strategy.md:88`; 참조 수 증감 시점은 이미 정해져 있다), VALIDATE-019(등록은 플러그인 인스턴스가 들므로 푸는 것도 플러그인이다)
  - 소유자 16라운드 답 10(`reviews/round-16-owner-answers.md:16`), GOAL-050
  - 8은 편집자의 판단이며, 메모리 비용은 18C-26의 기록·수용 규칙을 따른다.
- 게이트:
  - PR: PR-4 시험.
  - 무엇: 서로 다른 스키마로 1,000번 마운트·언마운트한 뒤 등록 수가 '살아 있는 루트 + 8' 이하인지, 같은 객체를 다시 마운트하면 컴파일이 0번인지 본다.

### 18C-57 살아 있는 두 트리의 같은 `$id` 사본 루트

- 닫는 항목: VALIDATE-020, ERROR-051(같은 `$id` 부분)
- 결정:
  - 【추론】 서로 다른 작성 루트 객체가 같은 `$id`(루트나 안쪽 자원)를 가진 채 동시에 살아 있을 수 있다.
  - 【추론】 같은 화면의 두 폼이 그렇고, 재생성 reset에서 옛 트리가 아직 살아 있을 때도 그렇다.
  - 【추론】 이때 두 트리는 저마다 자기 루트로 판정한다(G1).
  - 【추론】 루트마다 등록을 떼어 두는 것은 플러그인 계약이다.
  - 【추론】 한 인스턴스에 둘 수 없으면 같은 설정의 다른 인스턴스에 등록한다.
  - 【추론】 core는 `$id`를 고치지 않는다.
  - 【추론】 이 경우는 오류도 경고도 아니다.
  - 【추론】 재생성 reset은 원자적으로 성공한다.
  - 【추론】 플러그인이 떼어 두지 못해 등록이 실패하면 새 코드 없이 있는 부류로 드러낸다.
  - 【추론】 전체 컴파일은 `SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED`, 가드는 `SCHEMA_FORM_ERROR.GUARD_FAILED`이며, `details`에 가칭 `reason: 'duplicateSchemaId'`와 `$id`를 싣는다.
  - 【추론】 ADR 0014 §7.2 (미정) 행의 이 줄은 "코드 없음"으로 닫는다.
- 근거:
  - VALIDATE-020(ajv 8.17.1 실행 확인), VALIDATE-019, VALIDATE-021, `09-landing-and-test-strategy.md:88,259`
  - `adr/0004-validator-plugin-compile-guard.md:77`, VALIDATE-033(같은 설정의 두 인스턴스를 유지하는 것은 이미 플러그인의 몫이다)
  - 소유자 O-10: "경고만 일어나고 동작하는것처럼 보이는게 더 위험합니다"(`reviews/round-14-owner-answers.md:16`) — 실패를 조용히 넘기지 않는 근거다.
  - `adr/0014-error-policy.md:301,338`
- 게이트:
  - PR: PR-4.
  - 대상: ajv6·7·8 플러그인 각각, 기본 인스턴스와 `bind(instance)`로 받은 소비자 인스턴스 둘 다.
  - (i) 같은 루트 `$id`의 두 루트를 동시에 살렸을 때 `compile`·`compileGuard`가 저마다 독립 ajv와 같은 판정을 내는가.
  - (ii) 안쪽 `$id`가 겹치는 경우와, 절대 URI로 자기를 가리키는 `$ref`.
  - (iii) 재생성 reset의 원자성(H3, `reviews/raw-round16-reset.md:42`).
  - (iv) 한쪽을 `release`한 뒤에도 다른 쪽의 늦은 가드 컴파일이 맞는가.
  - 통과: 넷 모두 판정이 같고 오류 기록이 없다.
  - 실패(특히 `bind` 인스턴스를 같은 설정으로 복제할 수 없을 때): 소유자에게 올린다.
  - 실패의 선택지: (가) 소비자 인스턴스의 같은 `$id` 동시 사용을 지원 밖으로 문서화하고 위의 오류로 드러냄, (나) `bind`가 인스턴스 대신 인스턴스를 만드는 함수를 받게 함.

### 18C-58 따로 컴파일한 가드의 `$id`·`$dynamicRef` 문맥

- 닫는 항목: VALIDATE-023
- 결정:
  - 【추론】 `compileGuard(root, pointer)`의 함수는 같은 호스트 값에 대해, 전체 검증이 그 위치의 `if`를 평가할 때와 같은 boolean을 내야 한다.
  - 【추론】 `$id` 기저 URI와 `$dynamicRef`/`$recursiveRef`의 동적 범위를 포함한다.
  - 【추론】 이것은 플러그인 계약이며, 폼은 `if`의 내용을 읽지 않는다.
  - 【추론】 위치마다 가드는 하나다.
  - 【추론】 컴파일 실패는 가드 실패다(현행).
- 근거:
  - VALIDATE-023, `adr/0004-validator-plugin-compile-guard.md:46,73`, `adr/0005-blueprint-analysis-and-node-sharing.md:133`, `reviews/round-18-agenda.md:108`("실행 확인")
  - VALIDATE-001(G1)
  - FRAGMENT-023, 소유자 E-19: "if 문 내에 anyOf 나 oneOf"·"관여하기로 하면 끝이 없을거에요"(`reviews/round-10-owner-answers.md:40`)
- 게이트:
  - PR: PR-4, 대상 ajv7·8(ajv6은 (i)만).
  - 사례 (i): 안쪽 `$id` 자원 안의 `if`와 상대 `$ref`.
  - 사례 (ii): 2020-12 `$dynamicRef`/`$dynamicAnchor` 확장 패턴을 지나는 `if`.
  - 사례 (iii): 2019-09 `$recursiveRef`.
  - 사례 (iv): 한 `$defs` 위치를 동적 범위가 다른 두 경로가 쓰는 경우.
  - 통과: 가드의 답이 전체 검증에서 관측한 `if`의 답과 모든 사례에서 같다.
  - 관측은 then/else 에러 유무로 판별하는 짝 스키마로 한다.
  - 실패 — (iv)만 어긋나면: "한 위치를 여러 동적 범위에서 쓰는 가드"를 지원 범위 밖으로 문서화하는 권고와 함께 소유자에게 올린다.
  - `if` 안을 읽는 경고는 E-19·E-23과 부딪히므로 두지 않는다.
  - 실패 — (i)–(iii)이 어긋나면: 가드 컴파일 방식을 PR-4가 고친다.
  - 못 고치면 소유자에게 올린다.

### 18C-59 배열 아이템의 생김과 채움

- 닫는 항목: VALUE-019, WRITE-059, NODE-037, FRAGMENT-045
- 결정:
  - 【추론】 ㄱ 통째 쓰기의 identity는 위치로 재조정한다.
  - 【추론】 대상은 branch array에 값을 통째로 쓰는 모든 쓰기다: 로드(`setValue(V)`·`reset`·마운트), `Merge`가 통째로 준 배열, 입력 쓰기, `controls.injectTo`·`controls.derived`의 대상이 된 배열.
  - 【추론】 이런 쓰기는 아이템 노드를 다시 만들지 않고 위치로 잇는다.
  - 【추론】 새 값의 i번째 아이템은 쓰기 시점 identity 목록의 i번째 노드와 그 키(`#n`)를 이어 받고, 그 노드의 원본을 새 값으로 쓴다.
  - 【추론】 새 값이 더 길면 뒤의 아이템은 새 키로 생긴다.
  - 【추론】 더 짧으면 남는 노드는 소멸한다(WRITE-036: 나감이 아니다).
  - 【추론】 키를 바꾸는 것은 구조 연산(`push`·`remove`·`insert`류)뿐이다.
  - 【추론】 생김의 판정은 identity와 따로이며, 쓰기 종류의 기존 규칙을 따른다.
  - 【추론】 로드는 형상의 모든 노드를 생긴 노드로 친다(SETTLE-027).
  - 【추론】 로드가 아닌 통째 쓰기(`Merge`의 배열, 입력 쓰기 등)에서는 직전 커밋의 형상에 없던 키만 생긴 노드로서 채움을 받는다.
  - 【추론】 곧 새로 만든 뒤쪽 아이템이다.
  - 【추론】 이것이 WRITE-015 `Merge` 행이 미룬 "어떤 아이템이 생긴 것인가"의 답이다.
  - 【추론】 통째 쓰기 뒤에는 `dirty`·`touched`, 바깥 오류, 가상화 기록, 컨테이너 입력의 비값 상태, 소비자가 든 노드 참조가 데이터가 아니라 위치를 따라간다.
  - 【추론】 입력의 초기화는 identity가 아니라 Refresh 규칙이 맡는다.
  - 【추론】 로드는 모든 노드에 Refresh를 내므로(REACT-019·WRITE-048) 잎 입력은 어차피 다시 마운트된다.
  - 【추론】 그래서 포커스를 지키는 이득(T-22)은 로드가 아닌 통째 쓰기에만 있다.
  - ㄴ `push`는 로드가 아니다.
  - `push`는 구조 연산이다.
  - 만든 아이템은 생긴 노드로서 채움을 받는다(`controls.default` > `default` > 없음).
  - `push(v)`면 원본은 `v`이고, 없음인 자손에만 채움이 간다.
  - ㄷ `contains`(`minContains`·`maxContains` 포함)는 폼이 읽지 않는다.
  - 이 키는 값의 유효성 문법이므로 검증기가 판정한다.
  - `if` 안의 `contains`는 `compileGuard`가 답하는 게이트일 뿐이다.
  - 그 비용은 BLUEPRINT-007의 "컬렉션을 훑는 게이트"로 벤치가 다룬다.
  - 【추론】 ㄹ 튜플에서 자리 i의 아이템 청사진은 두 경우로 나뉜다.
  - 【추론】 i가 `prefixItems` 길이보다 작으면 `prefixItems[i]`다.
  - 【추론】 아니면 `items`가 스키마일 때 `items`이고, 옛 철자 `items: [..]`이면 `additionalItems`다.
  - 【추론】 자식 집합은 값의 길이 × 자리별 청사진이다(NODE-021).
  - 【추론】 청사진이 없는 자리의 아이템은 노드를 만들지 않는다.
  - 【추론】 닫힌 튜플의 뒤와 `items`가 없거나 `false`인 자리가 여기에 든다.
  - 【추론】 배열 호스트의 `extras`는 아이템 청사진이 없는 자리의 값이다.
  - 【추론】 자리 순서로 들고, 선언된 아이템 뒤에 방출한다(VALUE-002 보충).
  - 【추론】 버리지도 막지도 않는다.
  - 【추론】 판정은 검증기가 하고, 표시는 잔여 키처럼 렌더 계층이 맡는다.
  - 【추론】 `push`·`pop`·`remove`·`update`는 자리를 기준으로 동작한다.
  - 【추론】 자리가 바뀌면 값은 그 자리에 청사진이 있는지에 따라 노드와 `extras` 사이를 옮긴다.
  - 【추론】 예: `prefixItems` 둘, `items: false`, 값 `[a,b,c,d]`에서 `remove(0)`을 하면 `c`는 1번 자리로 옮겨 노드가 된다.
  - 【추론】 청사진 없는 자리에 대한 `push`도 core가 막지 않는다(WRITE-022).
  - 【추론】 호스트 배열의 조각이 준 `items`·`prefixItems`는 그 자리의 유효 스키마에 드는 덧씌움이다.
  - 【추론】 병합표는 객체와 같다.
  - 【추론】 조각은 아이템이 형상에 드는지를 정하지 않는다.
  - 【추론】 자리는 이름이 아니므로 빼면 뒤 자리가 밀리기 때문이다.
  - 【추론】 오늘 `ArrayNode/validate.ts`의 청사진 오류(아이템 청사진이 한 자리도 없는 배열 등)는 그대로 둔다.
  - ㅁ 아이템 노드는 생길 때 모두 실체화한다(기본).
  - PR-5 시험(TEST-018)에 위치 재조정(키 유지와, 위치를 따라가는 `dirty`·`touched`·바깥 오류·가상화 기록·노드 참조), 청사진 없는 자리의 `extras` 보존, 구조 연산에서 값이 노드와 `extras` 사이를 옮기는 것을 더한다.
  - 이주(LANDING-164): 통째 쓰기가 아이템 키를 새로 만들지 않아 `dirty`·`touched`·바깥 오류·가상화 기록·컨테이너 입력의 비값 상태·소비자가 든 노드 참조가 위치를 따라가며, 오늘은 `clear` 뒤 전량 `push`라 모두 새로 시작한다.
  - 이주(LANDING-165): 닫힌 튜플 뒤의 값이 버려지지 않고 방출된다.
- 근거:
  - ㄱ: GOAL-050(최소 생성·메모리 안정, `08-design-a-to-z.md:36`), NODE-026("타입별 특수 경로를 일반 경로에 박지 않는다", `adr/0011-branch-node-composition.md:47`; 색인을 객체의 키처럼 이름으로 본다). 앞선 문서는 배열 아이템의 identity를 정하지 않았다(`adr/0006-single-value-ownership.md:97`, WRITE-045 `09-landing-and-test-strategy.md:83`, `:92`). WRITE-015 `Merge` 행(`adr/0013-core-does-not-rewrite-values.md:66`), WRITE-036(`08-design-a-to-z.md:299`). 오늘은 `applyValue`가 `clear` 뒤 전량 `push`로 새 키를 만든다(`src/core/nodes/ArrayNode/strategies/BranchStrategy/BranchStrategy.ts:341-346`).
  - ㄴ: WRITE-007의 배열 행 "`push`로 생긴 아이템은 생긴 노드이므로 채움을 받는다"(`adr/0013-core-does-not-rewrite-values.md:38-47`, `03-mental-model.md:86`), 소유자 A-1: "예상이 맞다."(`reviews/round-10-owner-answers.md:7`), WRITE-067은 이미 대체됨
  - ㄷ: P1′ 소유자(`reviews/round-5-derivations.md:7`), BLUEPRINT-006(`adr/0005-blueprint-analysis-and-node-sharing.md:54`)
  - ㄹ: 같은 P1′(튜플은 폼이 읽는다), SCHEMA-001·BLUEPRINT-005(두 철자), 소유자 "새 원칙": "앞으로는 field가 가려지면서 값을 빼내는 걸 제외하고는 입력을 막지 않고 error를 보여준다."(`reviews/round-2.md:119`), VALUE-002의 `extras` 정의는 객체 키만 다룬다(VALUE-002), 오늘은 청사진 없는 자리를 조용히 버린다(`getChildSchema.ts:21-23`, `BranchStrategy.ts:378`)
  - ㅁ: VALUE-023(`adr/0006-single-value-ownership.md:104`), TEST-027(소유자 16라운드 답 6, `reviews/round-16-owner-answers.md:12`), TEST-032(`adr/0009-performance-budget-and-benchmarks.md:73-84`)
- 게이트:
  - PR: PR-5 벤치(ㅁ).
  - 무엇: TEST-032의 "긴 배열(아이템 10,000개) 안의 키 입력", "array 1000 루트 통째 쓰기", "노드당 메모리"를 TEST-027 게이트로 옛 판과 견준다.
  - 통과: 옛 판보다 느리지 않거나, 느린 항목을 Vincent가 받아들인다.
  - 실패: 지연 실체화를 넣는다.
  - 실패: 단, 관찰 결과가 실체화 판과 같음을 PR-5 시험을 두 모드로 돌려 보인 경우에만 넣는다.
  - 같아야 하는 것: `value`·`outputValue`·`inactiveValues`·채움·에지 발화·검증 결과 라우팅·통지·`revision`, 그리고 `find`에 관찰 가능한 부수효과가 없음.
  - 실패: 같게 만들 수 없으면 소유자에게 올린다.

### 18C-60 조각 객체에 둔 값 키

- 닫는 항목: CONTROLS-064
- 결정:
  - 【추론】 조각 객체(`allOf` 항목, 분기, `then`/`else`)의 `controls`에 둘 수 있는 키는 `controls.children` 항목의 닫힌 목록과 같다: `active` `visible` `readOnly` `disabled` `default` `derived` `unsetValue` `resetInteraction` `unsetOnInactive`.
  - 【추론】 `active`는 조각 게이트이고, 나머지는 조각 범위 제어다.
  - 【추론】 `children`·`injectTo`·`discriminator`·`watch`는 청사진 오류다.
  - 【추론】 값 키는 조각이 켜져 있는 동안, 그 조각이 직접 선언한 호스트의 직계 자식마다 따로 걸린다.
  - 【추론】 각 대상에게는 조각 층의 선언으로 작용하며, 같은 값이나 같은 식이 대상 모두에 쓰인다.
  - 【추론】 식의 기준점은 호스트다.
  - 【추론】 `default`는 켜진 조각의 대상 노드가 생길 때 채움 원천이 된다.
  - 【추론】 그 순위는 노드 자신의 `controls.default` > `children` 항목 > 조각의 `controls.default` > 표준 `default`(유효 스키마) > 없음이다.
  - 【추론】 같은 층이면 조각 전순서에서 나중이 이긴다.
  - 【추론】 대상마다 다른 기본값은 조각 안의 자식 선언에 적는다.
  - 【추론】 `unsetValue`는 식 하나가 거짓→참이 되는 에지에서 대상 모두를 없음으로 만든다.
  - 【추론】 로드에서는 로드된 값으로 평가한다.
  - 【추론】 생긴 대상 노드에서 참이면 채우지 않는다.
  - 【추론】 `resetInteraction`은 식이 참이 되면 대상 모두의 `dirty`·`touched`를 비운다(커밋 단계).
  - 【추론】 같은 대상에 여러 자동 쓰기가 겹치면 ADR 0003 §6의 순위와 층을 그대로 따른다.
  - 【추론】 조각이 켜지고 꺼지는 순간의 에지 기준은 18C-51을 따른다.
  - 【추론】 새 오류 코드는 없다(기존 청사진 오류의 모르는 키 부류).
- 근거:
  - CONTROLS-042(`adr/0003-group-namespace.md:99`), CONTROLS-030의 닫힌 목록(`adr/0003-group-namespace.md:91`), CONTROLS-044(명시한 대상에 거는 제어, `adr/0003-group-namespace.md:111`)
  - ADR 0003 §6의 같은 대상 규칙(`adr/0003-group-namespace.md:119`), CONTROLS-025(`controls.default` > `default`), CONTROLS-043(조각 식의 기준점은 호스트, `adr/0003-group-namespace.md:101`), CONTROLS-001(`controls` 안의 모르는 키는 청사진 오류, `adr/0003-group-namespace.md:30`)
  - 조각 `controls`의 허용 목록을 `children` 항목 목록과 같게 둔 것은 CONTROLS-044의 "같은 성격"에서 끌어낸 추론이다.

### 18C-61 폐기된 트리의 참조를 끊는 범위

- 닫는 항목: WRITE-047
- 결정:
  - 【추론】 재생성 reset이 옛 트리를 폐기해도 노드 사이의 부모·자식·루트 참조는 끊지 않는다.
  - 【추론】 폐기가 하는 일은 넷이다: 폐기 표시, 리스너·구독 해제, Refresh 번호와 상호작용 초기화 번호를 통지 없이 올리기, 폼 쪽이 옛 트리를 놓기(핸들 교체).
  - 【추론】 검증기 등록의 참조 수는 폐기가 내리지 않는다.
  - 【추론】 옛 트리의 효과 정리에서 내린다.
  - 【추론】 옛 노드를 읽으면(`value`·`outputValue`·`inactiveValues`·`parentNode`·`find` 등) 폐기 직전 마지막 커밋을 그대로 돌려준다.
  - 【추론】 옛 노드에 쓰면 `DISPOSED_NODE_WRITE`(가칭, 기존)로 던진다.
  - 【추론】 이 코드의 범위와 형상을 떠난 노드의 옛 참조는 18C-34가 정한다.
  - 【추론】 소비자가 옛 노드 하나를 들고 있으면 그 옛 트리 전체가 수거되지 않고 남는다.
  - 【추론】 이를 문서화하고, 수명을 이어 가려면 새 핸들에서 다시 찾으라고 안내한다.
- 근거:
  - WRITE-046(`09-landing-and-test-strategy.md:87`: 폐기 표시·리스너 해제·번호 올림), `DISPOSED_NODE_WRITE`(ERROR-044)
  - 참조 수는 커밋(효과)에서 올리고 그 정리에서 내린다(VALIDATE-021, `09-landing-and-test-strategy.md:88`).
  - VALUE-012("같은 값을 두 번 읽으면 같은 참조", F9)와 예측가능성 — 반쯤 끊긴 트리는 읽을 때마다 다른 답을 낸다. 참조를 끊으려면 폐기 때 O(트리) 순회가 더 든다.
  - 오늘도 `__cleanUp__`은 이벤트 리스너만 비운다(`src/core/nodes/AbstractNode/AbstractNode.ts:879-882`). 그래서 이주 행이 없다.
  - 옛 참조를 든 소비자가 있으면 트리 전체가 남는 메모리 비용(GOAL-050)을 예측가능성보다 아래로 두었다. 소비자의 참조로만 생기는 일이다.

### 18C-62 입력 판정(자식 프록시의 마운트 여부)의 구현 확인

- 닫는 항목: REACT-022
- 결정:
  - 규칙은 REACT-019 그대로다.
  - PR-7이 바인딩 계층에서 입력마다 자식 프록시의 마운트 여부를 알고, Refresh를 가를 때 읽는다.
  - 자식 프록시는 `SchemaNodeProxy`와 가상화의 `DeferrableNodeProxy` 자리다.
  - 후보 구현은 프록시의 마운트·언마운트 효과가 노드별 수를 올리고 내리는 것이며, 방법은 PR-7이 고른다.
- 근거:
  - REACT-022(`09-landing-and-test-strategy.md:85`), `09-landing-and-test-strategy.md:271`, TEST-020(`09-landing-and-test-strategy.md:166-167,174`)
- 게이트:
  - PR: PR-7.
  - 통과: TEST-020 보충(`09-landing-and-test-strategy.md:96`)의 reset 시험이 초록이다.
  - 그 시험에서 다시 마운트되는 것: 터미널 입력, 값 전체를 그리는 브랜치 입력, 빈 배열·접힌 펼침 입력.
  - 그 시험에서 다시 마운트되지 않는 것: 자식을 그리는 기본 객체·배열 입력.
  - 여기에 StrictMode 이중 마운트와 가상화의 지연 자리 사례를 더한다.
  - 실패(판정을 믿을 수 있게 얻지 못해 위 시험이 설 수 없음): 원문대로 '값 표시 불일치 대 다시 마운트 비용'의 맞바꿈을 소유자에게 올린다.

### 18C-63 실제 브라우저의 IME 확인

- 닫는 항목: EVENT-050, GOAL-076
- 결정:
  - 통지는 입력 처리기 안에서 동기다(ADR 0008, 기존 규칙).
  - 【추론】 바인딩은 조합 중에 입력의 DOM `value`를 프로그램으로 쓰지 않는다.
  - 【추론】 이 규칙은 조합 중에 Refresh가 오는 경우와 맞물린다.
  - 【추론】 REACT-019는 그때 입력을 다시 마운트한다.
  - 【추론】 REACT-024는 대체된 입력이 조합 끝에 낸 늦은 `onChange`를 버린다.
- 근거:
  - `adr/0008-event-system.md:205`, `04-inherited-constraints.md:54`
  - `spikes/events/REPORT-caret.txt` §2의 5행과 §4(jsdom은 조합 취소를 모델링하지 않는다)
  - REACT-019, REACT-024, TEST-007(실제 브라우저 실행은 스토리북 자동화, 16라운드 답 1), TEST-024
- 게이트:
  - PR: PR-7, 스토리북 브라우저 프로젝트(Chromium, TEST-024).
  - 후보 방법은 CDP `Input.imeSetComposition`/`Input.insertText`로 한국어 조합 ㄱ→가→각을 내는 것이다.
  - 대상: (a) 노드에 묶인 평범한 제어 입력, (b) 캐럿 기록을 하는 포매터 입력, (c) 조합 중에 Refresh가 도착한 입력.
  - 사람이 한 번 확인하는 목록에 macOS Safari·Chrome의 한국어 IME를 둔다.
  - 통과: 조합 단계마다 DOM 값이 IME 글과 같다.
  - 통과: 조합 중 `value` 세터 호출이 0회다.
  - 통과: `compositionend`가 한 번 오고, 그 뒤 노드 값이 최종 글이다.
  - 통과: (c)에서는 조합 중인 글이 늦은 쓰기로 노드에 닿지 않는다(REACT-024).
  - 실패: 먼저 바인딩 계층에서 고친다(조합 중에는 복원·Refresh로 인한 DOM 쓰기를 미룸).
  - 실패: core의 통지 시점(ADR 0008 §1의 동기 통지)을 바꿔야만 풀리면 소유자에게 올린다.

### 18C-64 Q1의 남은 세부 — 잠복 원본의 수명, 복원값, 서로소 `enum`, 로드 왕복, 비활성 경로 쓰기

- 닫는 항목: FRAGMENT-043, VALUE-018
- 결정:
  - 【추론】 ㄱ core가 스스로 잠복 원본을 파기하는 시점은 더하지 않는다.
  - 【추론】 잠복 원본이 지워지는 길은 둘이다: 나감 정책 `unsetOnInactive`(작성자나 호출자가 켬), 그리고 모든 로드(`reset`, `setValue(V)`, 마운트).
  - 【추론】 로드에서는 V에 없는 원본이 없음이 되므로, 잠복 원본도 V의 값으로 바뀌거나 지워진다.
  - 【추론】 이 밖에는 ㅁ의 쓰기가 그 경로에 없음을 쓸 때뿐이다.
  - 【추론】 형상에 없는 노드의 규칙은 평가하지 않으므로 `controls.unsetValue`는 잠복 원본을 지우지 못한다.
  - 【추론】 제출 후 파기는 두지 않는다.
  - 【추론】 core는 제출을 모르고, 파기는 폼이 스스로 값을 지우는 일이 되기 때문이다.
  - 【추론】 민감한 값을 남기지 않는 기본 권고는 나감 정책 `unsetOnInactive`를 켜는 것이다.
  - 【추론】 호출자가 한 번에 비우려면 `setValue(form.getValue(), SetValueOption.DisableAutomaticWrites)`를 쓴다.
  - 【추론】 이때 투영으로 빠진 값도 없음이 된다.
  - 【추론】 열거는 루트 노드의 함수와 getter `node.inactiveValues`다(VALUE-029).
  - ㄴ 다시 켜진 노드의 값은 꺼지기 전의 원본이다(VALUE-025).
  - #338의 "null로 버린 데이터는 되살아나지 않는다"와 부딪히지 않는다.
  - `setValue(null)`은 키 없는 전체 교체라 자식 원본을 없음으로 만들고, 숨겨 둔 원본이 없기 때문이다(VALUE-015·WRITE-014).
  - 초기값을 되살리는 연산은 `FormHandle.reset`(커밋된 prop의 로드, WRITE-044)과 `resetSubtree`가 맡는다.
  - `resetSubtree`는 유지하며, 루트가 든 로드 스냅숏에서 그 경로의 값을 서브트리에 로드한다(18C-44).
  - ㄷ 공유 노드의 서로소 `enum`에서 값은 그대로 남는다.
  - 새 조각이 켜져도 공유 노드는 새로 생기지 않으므로 다시 채우지 않는다.
  - 검증기가 기각하고, 폼은 막지 않는다.
  - 비우고 싶은 작성자는 조각 범위 `controls.unsetValue`(18C-60)를 쓰거나 이름을 가른다.
  - ㄹ 손대지 않고 저장한 방출 값은 로드 값과 다를 수 있다.
  - 그 차이는 다섯으로 닫힌다: (a) 형상에 없는 노드의 값(잠복으로 남고 `inactiveValues`로 열거된다), (b) 작성자가 켠 투영(`omitEmpty`·`omitTrailing`), (c) S1의 형 정규화, (d) 로드의 자동 쓰기(없음인 키의 채움, 로드 때 발화하는 `injectTo`·`derived`, 로드된 값으로 평가한 `unsetValue`), (e) 키 순서(미선언 키는 `extras`로 보존되지만 선언 키 뒤에 온다, Q14).
  - 따로 알리는 경고는 두지 않는다.
  - 【추론】 ㅁ 비활성 경로에 닿는 쓰기는 거부도 오류도 아니다.
  - 【추론】 그 쓰기는 루트가 드는 그 경로의 잠복 원본에 반영된다.
  - 【추론】 노드는 만들지 않고, 규칙도 평가하지 않으며, 방출되지 않는다.
  - 【추론】 이런 쓰기가 닿는 길은 넷이다: 조상의 `Merge`나 로드가 그 경로를 담을 때(WRITE-018의 분배), 형상에 없는 대상을 가리킨 `controls.injectTo`(18C-14), `batch`에서 표시할 때는 형상에 있었으나 정착 뒤 떠난 노드에 표시된 쓰기, 형상을 떠나기 전에 얻은 노드 참조로 한 쓰기.
  - 【추론】 형상을 떠난 노드와 그 옛 참조의 읽기·쓰기·재진입은 18C-34가 정하며, 그래서 순차 쓰기와 배치 쓰기가 같은 원본에 닿는다.
- 근거:
  - ㄱ: 소유자 13라운드 답 2: "onChange 로 넘어가는 값(방출 표현값)에서 지워지는게 기본값이면 된다."(`reviews/round-13-owner-answers.md:8`), VALUE-006·VALUE-008("`null`을 포함한 전체 교체는 V에 없는 원본을 지운다", `adr/0006-single-value-ownership.md:54`), `08-design-a-to-z.md:167`, ERROR의 제출 거부 행(core는 제출을 모른다), 12-8 셋째(`reviews/round-18-owner-answers.md:22`), D-7 소유자 칸(`reviews/round-4.md:113` — 억제 없이 `setValue(form.getValue())`를 하면 지운 키에 기본값이 다시 들어가고 `injectTo`·`derived`가 발화하므로 권고에 억제 비트를 붙였다)
  - ㄴ: VALUE-025(`adr/0006-single-value-ownership.md:92`, 소유자 13라운드 답 2), VALUE-015(`adr/0006-single-value-ownership.md:76`)
  - ㄷ: BLUEPRINT-010 소유자: "동의합니다."(`adr/0005-blueprint-analysis-and-node-sharing.md:115`), BLUEPRINT-016(`adr/0005-blueprint-analysis-and-node-sharing.md:76`), WRITE-007 채움 행
  - ㄹ: 소유자: "기본적으로 서버 값은 클라이언트가 보낸 값을 그대로 저장했다가 돌려준다고 믿어진다."(`reviews/round-2.md:118`), 새 원칙(`reviews/round-2.md:119`), WRITE-021(`adr/0013-core-does-not-rewrite-values.md:82`), SETTLE-027, WRITE-052, VALUE-002 — 경고 없음은 A-2 고지 의무가 이 경우에 걸리지 않는다는 편집자 판단이다.
  - ㅁ: WRITE-018, CONTROLS-053(D-28), VALUE-006 보충(`08-design-a-to-z.md:167`), 새 원칙의 "입력을 막지 않고"(`reviews/round-2.md:119`), `08-design-a-to-z.md:316`, 18C-34

### 18C-65 Q2 null 계약을 새 구조에서 표현하는 방법

- 닫는 항목: VALUE-020
- 결정:
  - 【추론】 null 계약은 작업 루프의 단계가 아니라 쓰기 종류로 표현한다.
  - 【추론】 쓰기 종류는 쓰기마다 진입에서 정해진다.
  - 【추론】 종류는 입력, 호출자(부분 쓰기·배열 연산), 로드, 자동 쓰기다.
  - 【추론】 표시 단계가 재계산 목록과 함께 그 종류를 기록한다.
  - 【추론】 같은 기록이 두 곳에 쓰인다: WRITE-013의 판정과 `UpdateValue`의 출처 칸(EVENT-060).
  - 【추론】 비객체 호스트의 원본을 비우는 것은 입력·호출자의 부분 쓰기뿐이고, 그 자식의 투영된 방출이 생길 때만 비운다.
  - 【추론】 판정이 값의 변화가 아니라 종류를 보므로, 같은 값을 다시 쓴 의도된 쓰기(S6)도 객체를 만든다.
  - 【추론】 단계만으로는 모자라다.
  - 【추론】 자동 쓰기인 `trim`은 정착 단계가 아니라 입력 마침 신호로 들어오기 때문이다(WRITE-078).
  - 【추론】 `controls.injectTo`는 원인과 무관하게 언제나 자동 쓰기이며 조상의 원본을 바꾸지 않는다.
  - 【추론】 오늘의 S2 규칙은 옮기지 않는다.
  - 【추론】 그 규칙은 `injectTo`가 원인 쓰기의 출처를 물려받게 해서, 사용자가 일으킨 `injectTo`면 null 조상을 객체로 만든다.
  - 【추론】 사용자에게 보이는 변화: 사용자가 일으킨 `injectTo`의 값이 null 조상 아래에 그려지지만 방출되지 않는다.
  - 【추론】 소유자가 뒤집기를 원하면, 12-5의 출처 칸 덕분에 원인의 출처를 물려주는 구현 비용은 작다.
  - 【추론】 이 동작 변화는 소유자 통보 목록에 올린다.
  - 이주(LANDING-166): 사용자 쓰기가 일으킨 `injectTo`가 null 조상을 객체로 만들던 동작(`ObjectNode/DETAIL.md:14,16`)이 사라져, 값은 null 조상 아래에 그려지지만 방출되지 않는다.
    - 이주 안내 항목(C8)으로 둔다.
- 근거:
  - 소유자 축 열의 항목 8: "& 표현식과 injectTo 표현식은 모두 form 을 제어하는 특수 예약어로 취급되길 원한다"(`reviews/round-9-spec.md:26`), 항목 6(`reviews/round-9-spec.md:24`: & 규칙은 값을 바꾸는 확장 조작 계층)
  - Q2가 남긴 요구(`open-questions.md:19`): 자동 쓰기는 null 조상을 객체로 만들지 않는다.
  - GOAL-063(T-12: "`injectTo`가 대상의 전체 교체라도 조상의 `raw`는 그대로"), WRITE-013(`adr/0013-core-does-not-rewrite-values.md:52`, `adr/0007-settle-cycle.md:91` F1·F10)
  - S2 상속을 없앤 결정은 4라운드 편집자의 F10(`reviews/round-4.md:131`)이고 U13은 "미정의"로 남았다(`reviews/round-4.md:65`). 뒤 라운드가 Q2의 "물려받아야 한다"를 이긴다(`ledger/README.md` §1의 4). 동작 변화로 소유자에게 보인 기록이 없어 통보 목록에 올린다.
  - WRITE-078(소유자 12-2: "자동 쓰기 아닙니까?", `reviews/round-18-owner-answers.md:12`), EVENT-060(소유자 12-5: "source 를 저장하는건 문제 없습니다", `reviews/round-18-owner-answers.md:15`), R12(`reviews/round-1.md`, 의도는 따로 기록해야 한다)
  - 오늘 S2의 상속: `src/core/nodes/ObjectNode/DETAIL.md:14,16`

### 18C-66 Q4 표준 밖의 FE 전용 조건부 필드

- 닫는 항목: FRAGMENT-044
- 결정:
  - 【추론】 예약 층에서 표준 부분이 모르는 필드를 선언하는 문법은 두지 않는다.
  - 【추론】 FE 전용 조건부 필드는 소비자가 단일 스키마에 표준 `properties`로 merge하고, 노드 게이트 `controls.active`로 켜고 끈다.
  - 【추론】 결과는 Q4가 그린 것과 같다.
  - 【추론】 켜진 동안 방출에 든다.
  - 【추론】 서버의 스키마에 없으면 서버 판정은 서버의 `additionalProperties`를 따른다.
  - 【추론】 여기에 더해 FE 검증기도 그 필드를 본다.
  - 【추론】 조건 표현력(G2)은 노드 게이트로 이미 채워진다.
  - 【추론】 merge 안내 문서(SCHEMA-018)에 이 쓰임을 예로 더한다.
- 근거:
  - GOAL-014(C1) 소유자: "병합을 form이 해야 하는 의도를 모르겠다. 서버 스키마를 수정하지 않겠다는 의도 하나 때문에 이중 입구를 만드는 것 아닌가."(`reviews/round-2.md:113`), `00-goals.md:104`("새 장치를 두지 않는다")
  - SCHEMA-018(merge 문서로 충족), GOAL-006(G4 하나의 개념에 하나의 장치), CONTROLS-021(노드 게이트), CONTROLS-001(예약 층은 판정에 닿지 못한다)

### 18C-67 Q15 직전 커밋의 활성 집합을 출발 가설로 쓰는 최적화

- 닫는 항목: SETTLE-035
- 결정:
  - 【추론】 정착의 출발점은 고정이다(SETTLE-018).
  - 【추론】 직전 커밋의 `active`에서 출발하는 최적화는 채택하지 않는다.
  - 【추론】 까닭 하나: 양의 순환에서 결과가 달라진다.
  - 【추론】 소유자가 받아들인 최소 고정점 동작(12-10)이 이력에 의존하게 바뀌어 P3·D-2(형상은 상태의 순수 함수)를 깬다.
  - 【추론】 예: 조각 C가 켜진 동안 서로를 켜 준 A·B가 있을 때, C가 꺼지면 고정 출발에서는 A·B도 꺼지지만 이어 출발에서는 켜진 채 남는다.
  - 【추론】 까닭 둘: 같은 결과를 보장하려면 가드 사이의 의존을 알아야 하는데, 폼은 `if`의 내용을 읽지 않는다.
  - 【추론】 U19 비용(켜진 조각 N개인 호스트의 무관한 키 입력)은 기존 최적화 (a)(b)(c)(BLUEPRINT-007, F13 키 패치)로 다룬다.
- 근거:
  - SETTLE-018(`adr/0007-settle-cycle.md:54`, 출발점 고정 — 직전 커밋의 `active`는 읽지 않는다), SETTLE-029(D-2, `reviews/round-5-derivations.md:41`)
  - 소유자 12-10: "받아들입니다"(`reviews/round-18-owner-answers.md:20`), 소유자 12-3: "검증기의 성능은 우리가 관여할 문제가 아닙니다만."(`reviews/round-18-owner-answers.md:13`, 반영 칸의 `if` 내용 불관여 유지)
  - BLUEPRINT-007(`adr/0005-blueprint-analysis-and-node-sharing.md:56-58`), TEST-027
- 게이트:
  - PR: PR-2 벤치(TEST-027·TEST-032)에 "켜진 조각 N개 호스트의 무관한 키 입력" 행을 더한다.
  - 통과: TEST-027 게이트(옛 판 대비, Vincent의 수용).
  - 실패: P3 대 속도의 맞바꿈이므로 소유자에게 올린다.

### 18C-68 참조 그룹 아래 경로의 `find` 별칭(S11)

- 닫는 항목: NODE-040
- 결정:
  - 【추론】 `find`는 경로의 마디마다 현재 노드의 자식 집합을 이름으로 따라간다.
  - 【추론】 노드 종류마다 특수 경로를 두지 않는다.
  - 【추론】 참조 그룹(가상 노드)의 자식 집합은 참조된 형제 노드다.
  - 【추론】 그래서 `find('/period/startDate')`는 `/startDate` 노드 그 자체를 돌려준다.
  - 【추론】 돌려준 노드의 `path`는 `/startDate`다.
  - 【추론】 그 노드에 한 쓰기는 가상 노드가 나눠 쓰는 것과 같은 곳에 닿는다.
  - 【추론】 한 노드에 두 경로로 닿는 것은 참조 그룹을 거칠 때뿐이다.
  - 【추론】 정본 경로는 `node.path`다(문서화).
  - 【추론】 터미널 노드는 자식 집합이 없으므로, 같은 규칙으로 노드 없음이다(NODE-020과 일치).
  - 【추론】 가상 노드는 늘 `branch`이므로(18C-38) 인라인 `FormTypeInput`을 둔 가상 노드 아래 경로도 참조된 노드를 돌려준다.
  - 【추론】 `options.terminal: true`를 둔 가상 노드는 청사진 오류이므로(18C-38) 터미널 가상 노드는 없다.
  - 【추론】 인라인 입력 없는 가상 노드 아래의 `find`는 오늘과 같아 이주 행이 없다.
  - 이주(LANDING-167): 인라인 `FormTypeInput`을 둔 가상 노드 아래 경로의 `find`는 오늘 그 가상 노드를 돌려주고(오늘 가상의 인라인 입력은 `'terminal'`이고 `findNode`는 터미널에 닿으면 남은 경로를 무시한다), 새 설계에서는 참조된 노드를 돌려준다.
- 근거:
  - VALUE-005("경로 조회도 같다", `adr/0006-single-value-ownership.md:46`), NODE-026(`adr/0011-branch-node-composition.md:47`), NODE-034(자식의 출처는 형제 참조, 쓰기 부채질 유지)
  - 소유자 E-4: "네, virtual 은 스키마로 선언되는건 아니니까 그냥 둡시다. 유효성검증도 영향 없고."(`reviews/round-10-owner-answers.md:31`)
  - 오늘 코드: `findNode`는 `subnodes`를 이름으로 따라가고(`src/core/nodes/AbstractNode/utils/findNode/findNode.ts:68-86`) 터미널에 닿으면 그 노드를 돌려준다(`:86`). `VirtualNode`의 자식은 참조 노드다(`src/core/nodes/VirtualNode/VirtualNode.ts:136`).
  - LANDING-020(이주 17: 터미널 아래 경로에 노드를 돌려주지 않음), 18C-38(가상은 늘 `branch`, 가상의 `terminal: true`는 청사진 오류)

## §11 원장이 드러낸 항목

### 18C-69 로컬 선언끼리의 결합 — 잠금은 OR, 표시는 AND(11-1)

- 닫는 항목: CONTROLS-062
- 결정:
  - 【추론】 한 노드 위에서 로컬 선언이 겹칠 수 있는 자리는 넷이다: 노드 자신의 표준 `readOnly`, 자기 `controls.readOnly`·`controls.disabled`, 켜진 조각의 범위 제어, 부모의 `controls.children` 항목.
  - 【추론】 이것들이 겹치면 잠금(`readOnly`·`disabled`)은 하나라도 참이면 잠기고, 표시(`active`·`visible`)는 모두 참이어야 켜진다.
  - 【추론】 CONTROLS-046을 그대로 확정한다.
  - 【추론】 어느 자리의 `false`도 다른 자리의 잠금을 풀지 않는다.
  - 【추론】 어느 자리의 참도 다른 자리가 끈 표시를 되살리지 않는다.
  - 【추론】 결과는 선언의 순서와 자리에 따라 달라지지 않는다.
  - 【추론】 코어에 글로벌은 없다.
  - 【추론】 Form 속성의 전체 잠금은 렌더 계층이 이 결과 위에 OR한다(CONTROLS-045, 13라운드 답 1).
  - 【추론】 이 결합은 잠금 키와 표시 키에만 적용한다.
  - 【추론】 값을 쓰는 규칙(`derived`·`injectTo`·`unsetValue`)이 한 노드에 겹치면, 값은 하나만 쓸 수 있으므로 층에서 세부가 이긴다(SETTLE-004).
  - 【추론】 `unsetOnInactive`는 CONTROLS-040을 따른다.
  - 【추론】 D-7(`reviews/round-10-owner-answers.md:20`, "조각의 주석이 본체를 덮음"에 대한 답)은 주석 키에 대한 답이다.
  - 【추론】 원장은 표준 `readOnly`를 주석이 아니라 상태 키, 곧 노드의 잠금으로 읽는다.
  - 【추론】 SCHEMA-003(13라운드 소유자 답 1로 닫힘)이 그렇게 적고, 병합표는 상태 키를 주석과 따로 적는다(SCHEMA-010).
  - 【추론】 그래서 D-7은 잠금에 닿지 않고, 이 결합은 소유자 답과 어긋나지 않는다.
- 설명(12라운드에 소유자가 청한 것):
  - 그때 소유자의 답은 "좀 더 설명 필요. 이것만으론 이해가 잘 안된다. 글로벌이 덮을 수 있는건 readOnly / disabled 뿐이고, 나머지는 글로벌 선언과 무관하게 각자의 스콥에서만 동작하지 않나?"였다(`reviews/round-12-owner-answers.md:23`).
  - 예시 스키마:

    ```jsonc
    { "type": "object",
      "properties": {
        "mode": { "enum": ["edit", "view", "hidden"] },
        "showEmail": { "type": "boolean" },
        "email": { "type": "string", "readOnly": false,            // 생성기가 기본값으로 적는 흔한 모양
                   "controls": { "visible": "../showEmail === true" } } },
      "controls": { "children": [ { "targets": ["email"],
        "controls": { "readOnly": "./mode === 'view'", "visible": "./mode !== 'hidden'" } } ] } }
    ```

  - 예시의 결과:

    | `mode` | `showEmail` | 잠금 = 자기 `readOnly` OR 항목 `readOnly` | 표시 = 자기 `visible` AND 항목 `visible` |
    | --- | --- | --- | --- |
    | `edit` | `true` | `false` OR `false` → 고칠 수 있다 | `true` AND `true` → 보인다 |
    | `view` | `true` | `false` OR `true` → 잠긴다 | `true` AND `true` → 보인다 |
    | `hidden` | `true` | `false` OR `false` | `true` AND `false` → 숨는다 |
    | `edit` | `false` | `false` OR `false` | `false` AND `true` → 숨는다 |

  - 자기 `readOnly: false`는 `view`의 잠금을 풀지 않는다.
  - 오늘은 순위 사슬이라 노드의 `readOnly: false`가 이긴다(`reviews/round-13-owner-review.md:26`).
  - 이 변화의 이주 행은 이미 있다(LANDING-016 이주 13).
  - `<Form readOnly>`를 주면 렌더 계층이 위 결과에 OR하므로 모든 행이 잠긴다.
  - 12라운드 §3(분기가 꺼질 때 값을 지우고 입력을 초기화하는 장치의 '3 중복 선언', `reviews/round-12-owner-review.md:90,98`)에 대한 소유자 답 전문: "해당 조건은 중복 선언시(부모선언 + 자식노드 자체 선언) 이를 병합하는게 아니라 덮어쓰는걸 고려했다. 하지만 이를 or 조건이나 체인으로 엮을 수 있나? 말한대로 루프가 발생하면 form 을 터트리고 오류를 보여주면 된다. 이 기능은 설계를 요한다."(`reviews/round-12-owner-answers.md:11`)
  - 앞의 두 문장은 둘 다 설계에 남는다.
  - 덮어쓰기(첫 문장)는 값을 쓰는 규칙에 남는다: 한 노드에는 값을 하나만 쓸 수 있으므로, 부모 선언과 자식 자신의 선언이 겹치면 세부가 이긴다(SETTLE-004, 나감 정책은 CONTROLS-040).
  - or로 엮기(둘째 문장)는 참인 동안 성립하는 상태 키에 남는다: 잠금은 OR로, 표시는 AND로 엮는다.
- 근거(모두 소유자의 말에서 온 유추다):
  - 12라운드 답 1: "권고 수용. false 일때는 로컬 동작을 보장한다. 이는 props 와 global 로 전달되는 경우에 대한 특별 동작이다."(`reviews/round-12-owner-answers.md:7`) — Form 속성 층에서 `false`는 다른 층의 잠금을 풀지 않는다. 소유자가 이를 props·global의 특별 동작이라 했으므로 로컬 층으로 넓히는 것은 유추다.
  - 12라운드 답(`reviews/round-12-owner-answers.md:23`): 밖에서 씌울 수 있는 것은 `readOnly`/`disabled`뿐이고 나머지는 각자의 스코프에서 동작한다. 한 곳이라도 씌우면 잠기므로 잠금은 OR로, 표시는 선언한 스코프가 모두 허락해야 하므로 AND로 읽는다.
  - JSON Schema 2020-12 Validation §9.4(readOnly and writeOnly): "When multiple occurrences of these keywords are applicable to a single sub-instance, the resulting behavior SHOULD be as for a true value if any occurrence specifies a true value, and SHOULD be as for a false value otherwise."(`https://json-schema.org/draft/2020-12/json-schema-validation`, 2026-09-26 확인) — 폼은 표준 `readOnly`의 뜻을 바꾸지 않는다. 현행 LANDING-013(이주 10)과 같은 읽기다.
  - `active`는 이미 AND다(중첩 조각은 감싸는 조각이 활성일 때만 순회, FRAGMENT-011).
  - 설계 가치: "where behavior could go either way, follow the consistency the public interface leads a caller to expect"(`packages/canard/schema-form/CLAUDE.md:7`) — 표준 `readOnly`와 `controls.readOnly`라는 공개 표면은 어느 자리에서든 선언한 잠금이 잠근다고 기대하게 한다.
  - 13라운드 답 1(`reviews/round-13-owner-answers.md:7`)은 글로벌을 없앴을 뿐이다(선택지 "다", `reviews/round-13-owner-review.md:50`).
  - D-7 소유자 답: "네, 세부적인 규칙이 포괄적인 규칙을 덮는 기존 관례를 따릅니다"(`reviews/round-10-owner-answers.md:20`), SCHEMA-003, SCHEMA-010

### 18C-70 `virtualRequired`가 `required` 재작성과 함께 사라지는가(11-2)

- 닫는 항목: CONTROLS-065
- 결정:
  - 【추론】 `virtualRequired`는 새 설계에 없고, 대체도 없다.
  - 【추론】 이 키를 만드는 곳은 `processVirtualSchema`의 `required` 재작성뿐이고(`src/helpers/jsonSchema/preprocessSchema/utils/processVirtualSchema/utils/transformCondition.ts:40-52`), 읽는 곳은 `BranchStrategy/utils`의 조건 사전뿐이다(`src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap/utils/flattenConditions.ts:55,87`).
  - 【추론】 새 설계는 재작성을 하지 않고(LANDING-019), 만드는 쪽과 읽는 쪽을 모두 PR-1에서 걷어 낸다(LANDING-081).
  - 【추론】 따라서 `options`의 닫힌 목록에 넣지 않는다.
  - 【추론】 작성자가 맨 키로 적은 `virtualRequired`는 JSON Schema 층의 모르는 키로 검증기에 가며, 폼은 읽지 않는다(CONTROLS-001).
- 근거:
  - LANDING-019(`08-design-a-to-z.md:448`), LANDING-081(`09-landing-and-test-strategy.md:32`), `reviews/round-13-owner-review.md:146`의 통보("`virtual`은 지우기만 하고 `required`는 작성된 그대로 검증기에 간다"), 12라운드 답 8(`reviews/round-12-owner-answers.md:16`)
  - 코드 사실은 위 두 파일에서 grep으로 확인했다.

### 18C-71 리프 노드의 잠금을 누가 집행하는가(11-3)

- 닫는 항목: CONTROLS-070
- 결정:
  - 【추론】 잠금은 세 층이 나눠 맡는다.
  - 【추론】 (1) core는 노드의 잠금 상태만 계산한다.
  - 【추론】 쓰기를 거부하지 않으므로 공개 `setValue`와 자동 쓰기(`derived`·`injectTo`·채움)는 잠긴 노드에도 적용된다.
  - 【추론】 잠금은 값·형상·방출을 바꾸지 않는다.
  - 【추론】 (2) 렌더 계층은 실효 잠금(core의 잠금 OR Form 속성의 전체 잠금)을 입력 구성 요소의 `readOnly`·`disabled` prop으로 넘긴다.
  - 【추론】 실효 잠금이 켜진 동안에는 `handleChange`가 입력 쓰기를 버린다.
  - 【추론】 오늘은 노드의 잠금만 보고 버리므로(`src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:51`) 이 판단에 Form 속성의 잠금을 더한다.
  - 【추론】 (3) 잠긴 모양을 그리고 입력을 막는 것은 입력 구성 요소(`FormTypeInput`) 구현의 몫이다.
  - 【추론】 오늘과 같다.
  - 이주(LANDING-168): Form 속성의 잠금(`readOnly`·`disabled`)이 켜진 동안 입력의 `onChange`는 버려지며, 오늘은 노드 자신의 잠금만 버리고(`SchemaNodeInput.tsx:51`) Form 속성의 잠금은 입력 prop으로만 넘긴다(`:111-112`).
- 근거:
  - CONTROLS-023("값·형상·방출을 바꾸지 않는다"), CONTROLS-045·`08-design-a-to-z.md:339`("렌더 계층이 코어의 결과 위에 OR한다")
  - 13라운드 답 1: "이건 "검증"의 영역이 아니라 react 의 표현 영역이라고 보인다"(`reviews/round-13-owner-answers.md:7`)
  - prop 넘김은 오늘 코드 `SchemaNodeInput.tsx:111-112`에서 확인했다. prop과 쓰기 차단이 같은 실효 값을 쓰는 것은 일관성·예측성을 따른 편집자 판단이다. 사용자에게 보이는 차이는 입력이 `readOnly`를 받고도 `onChange`를 부르는 경우뿐이다.

### 18C-72 `FormTypeInputProps.alias`와 `placeholder`·`errorMessages`의 자리(11-4, 11-5)

- 닫는 항목: CONTROLS-071, CONTROLS-072
- 결정:
  - 【추론】 `alias`·`placeholder`는 그룹 키가 아니다.
  - 【추론】 둘 다 오늘처럼 `FormTypeInputProps` 안의 키이며, `FormTypeInputProps`가 `presentation`으로 옮겨 가므로(CONTROLS-051) `presentation.FormTypeInputProps.alias`·`presentation.FormTypeInputProps.placeholder`가 된다.
  - 【추론】 렌더 계층은 이 둘을 해석하지 않고 오늘처럼 입력 구성 요소의 prop으로 펼쳐 넘긴다.
  - 【추론】 `presentation`의 스키마 타입에는 `className`·`style`과 함께 문서화된 선택 키로 남긴다(선택 키가 하나도 없는 타입은 GOAL-088을 따른다).
  - 【추론】 맨 키 `placeholder`는 폼 키가 아니다.
  - 【추론】 맨 키 `placeholder`는 JSON Schema 층의 모르는 키로 검증기에 가고 폼은 읽지 않는다.
  - 【추론】 그래서 `placeholder`가 검증기에 간다고 적은 `adr/0003-group-namespace.md:125`는 맨 키로 적었을 때의 사실로 읽으며, `reviews/round-14-owner-review.md:55`와 어긋나지 않는다.
  - 【추론】 `errorMessages`는 이미 `presentation.errorMessages`로 정해졌고(CONTROLS-051), `presentation`은 통째로 검증기 앞에서 지워진다(LANDING-031).
- 근거:
  - 오늘 코드에서 `placeholder`·`alias`는 `FormTypeInputProps` 안에만 선언돼 있고(`src/types/jsonSchema.ts:231-236`) 입력 prop으로도 선언돼 있다(`src/types/formTypeInput.ts:71`). 저장소의 스토리와 시험도 `FormTypeInputProps` 안에 적는다(`src/__tests__/scenarios/schema-props-renderer.render.test.tsx:200-202`, `stories/09.NullSchema.stories.tsx:203-204`). 맨 `jsonSchema.placeholder`를 읽는 코드는 없다.
  - 형제 UI 플러그인은 prop으로 받아 쓴다(`alias` 17파일: antd5·antd6 각 5, antd-mobile 4, mui 3; `placeholder` 16파일). 원장 CONTROLS-071의 "소비처가 없다"는 `schema-form` 패키지 안에서만 참이다.
  - CONTROLS-011(`presentation`의 모르는 키는 플러그인 자유 칸), CONTROLS-051, LANDING-034, LANDING-040

### 18C-73 터미널 노드의 입력이 빈 `ChildNodeComponents`를 읽을 때의 경고 코드(11-6)

- 닫는 항목: ERROR-185
- 결정:
  - 【추론】 ADR 0014 §7.2 목록에 행 하나를 더한다.
  - 【추론】 코드는 (가칭) `SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL`이고 `level`은 `warning`이다.
  - 【추론】 렌더 계층에서, 터미널 전략인 노드의 입력 구성 요소가 받은 빈 `ChildNodeComponents`를 처음 읽을 때(색인·`length`·순회) 낸다.
  - 【추론】 자리는 `adr/0011-branch-node-composition.md:61`과 §7.1 렌더 계층 경고 행이며, 기록에 path를 싣는다.
  - 【추론】 기본 드러남은 개발 모드 콘솔이고, 프로덕션 기본 출력은 없다.
  - 【추론】 핸들러 전달은 그 필드가 커밋된 뒤의 이펙트에서 하고, 로드마다 구조 키(code, path)로 한 번이다.
  - 【추론】 개발 모드와 핸들러가 있는 프로덕션에서는 빈 배열 대신 읽기를 감지하는 얼린 빈 배열을 넘긴다.
  - 【추론】 핸들러가 없는 프로덕션에서는 판정하지 않고 보통의 빈 배열을 넘긴다.
  - 【추론】 새 설계에만 있다.
  - 【추론】 더하면 minor다(ADR 0014 판 규칙).
- 근거:
  - 이름 모양은 같은 목록의 `LOCK_ON_NON_TERMINAL_OBJECT`·`PRESENTATION_KEY_SUSPECT`를 따랐다(`adr/0014-error-policy.md:291,295`). 드러남과 전달 칸은 렌더 계층 경고 `PRESENTATION_KEY_SUSPECT`(`adr/0014-error-policy.md:295`)와 같다.
  - "핸들러가 없는 프로덕션에서는 판정하지 않음"은 `MULTIPLE_GATED_BRANCHES_ACTIVE`(`adr/0014-error-policy.md:294`)의 선례를 따랐다(속도 우선).
  - 규칙 자체는 NODE-031이다. `(가칭)`은 PR-4에서 확정한다(`adr/0014-error-policy.md:248`). 가상 노드는 이 경고의 대상이 아니다(18C-38).
- 게이트:
  - PR: PR-7.
  - 무엇: 감지 방식(읽기를 감지하는 얼린 빈 배열)의 비용을 PR-7 구현에서 확인한다.

### 18C-74 루트 `dataPath` — 플러그인 `"/"`, 타입 `""`(11-7)

- 닫는 항목: FRAGMENT-040
- 결정:
  - 【추론】 루트의 정규 `dataPath`는 `''`다(RFC 6901).
  - 【추론】 core는 검증 결과를 받아들이는 자리에서 `'/'`를 루트의 별칭으로 받아 `''`로 정규화한 뒤 `ValidationIssue.dataPath`에 담는다.
  - 【추론】 잔여 목록은 정규화된 값에 키를 이어 포인터를 만든다.
  - 【추론】 저장소의 ajv 플러그인 셋과 core의 폴백 검증기(`src/core/nodes/AbstractNode/utils/ValidationManager/utils/getFallbackValidator.ts:19`)는 PR-4(동기 `compileGuard`를 구현하는 그 PR)에서 함께 루트에 `''`를 내도록 고친다.
  - 이주(LANDING-169): 루트 수준 검증 오류의 공개 `dataPath`가 `'/'`에서 `''`로 바뀐다.
- 근거:
  - 공개 타입 문서가 이미 `''`라고 적는다(`src/types/error.ts:247`). 오늘 루트 노드의 `path`가 `''`다(`JSONPointer.Root`, `src/helpers/jsonPointer/enum.ts:5-11`, `joinSegment.ts`).
  - 오늘 `find('/')`와 `find('')`는 둘 다 루트를 돌려준다(`src/core/nodes/AbstractNode/AbstractNode.ts:256-258`) — 별칭을 받는 것은 오늘의 관대함을 잇는 일이다. 빈 문자열 키를 가진 자식은 오늘도 부모와 같은 경로가 되어 지원되지 않는다(`joinSegment`의 `segment !== ''`).
  - 루트에 `'/'`를 내는 곳: `schema-form-ajv7-plugin/src/validator/utils/transformErrors.ts:50-53`, `schema-form-ajv8-plugin/src/validator/utils/transformErrors.ts:50-53`, `schema-form-ajv6-plugin/src/validator/utils/transformDataPath.ts:19-21`, core 쪽 폴백 `getFallbackValidator.ts:19`(`dataPath: $.Separator`) — 정규화가 받아 주더라도 패키지 자신이 내는 값은 공개 타입 문서(`''`)와 같아야 한다.
  - 스파이크도 둘을 모두 루트로 다뤘다(`spikes/guard-cost/rejected-keys/REPORT.txt:67,95`).

### 18C-75 플러그인 FormTypeInput이 동기 `UpdateValue`나 Promise 배열 API에 기대는가(11-8)

- 닫는 항목: GOAL-084
- 결정:
  - 【추론】 기대는 것이 없다.
  - UI 플러그인 넷(antd5·antd6·antd-mobile·mui)과 패키지의 기본 정의(`src/formTypeDefinitions`)를 읽었다.
  - 배열 입력은 모두 `node.push()`·`node.remove(index)`를 반환값을 버린 채 부른다.
  - `await`·`.then`은 한 곳도 없다(예: `schema-form-antd5-plugin/src/formTypeInputs/FormTypeInputArray.tsx:29-34`, `src/formTypeDefinitions/FormTypeInputArray.tsx:18,22`).
  - `UpdateValue` 구독, `NodeEventType`, `useSchemaNodeSubscribe`·`useSchemaNodeTracker`를 쓰는 플러그인 입력도 없다.
  - 입력은 `value`/`onChange`로 제어하거나 `defaultValue`로 비제어한다.
  - 이펙트는 Uri 입력의 프로토콜 초기화 하나뿐이며 통지 시점에 기대지 않는다(`FormTypeInputUri.tsx:132`).
  - 【추론】 그러므로 T-7(배열 연산의 동기화, 파괴적 변경)과 T-1(통지는 늘 동기)은 저장소의 플러그인을 깨지 않는다.
  - 【추론】 사용자가 직접 구현한 FormTypeInput은 이 확인 범위 밖이다.
  - 【추론】 배열 연산이 Promise를 돌려주지 않는다는 점은 이주 안내에 남긴다(T-7의 파괴적 변경 행과 같다).
  - 【추론】 안건 11-8의 "T-23" 표기는 T-1·T-7로 읽는다(T-23은 분기 복원).
- 근거:
  - 위 파일의 grep(`node.(push|pop|remove|clear|update)(`, `await`, `.then(`, `UpdateValue`, `NodeEventType`, `subscribe(`) 결과. 검증자가 네 플러그인 모두 다시 확인했다.
  - `04-inherited-constraints.md:9`(T-1), `:15`(T-7)
  - S1 셋째(넷째 발화) 소유자: "plugin 은 그냥 샘플이고, 보통 용법은 사용자가 formTypeInput 을 구현해서 붙이는거"(`reviews/round-18-owner-answers.md:9`)

### 18C-76 C3 남은 세부 — 스키마 타입의 컴포넌트 자리(11-9)

- 닫는 항목: GOAL-087
- 결정:
  - 【추론】 core의 스키마 타입은 `presentation`을 형 매개변수로만 둔다.
  - 【추론】 모양은 `JSONSchema<Options, Presentation extends object = { [key: string]: unknown }>`이며, 오늘 이미 쓰는 `Options` 형 매개변수와 같은 방식이다.
  - 【추론】 core의 타입 파일은 React를 import하지 않는다.
  - 【추론】 React 바인딩(렌더 계층)은 `presentation`의 모양을 정의한다: `formType`, `FormTypeInput?: ComponentType<…> | null`, `FormTypeInputProps`(`placeholder`·`alias`·`className`·`style`, 자유 키), `FormTypeRendererProps`, `errorMessages`, 플러그인 자유 칸.
  - 【추론】 그 모양을 넣은 `JSONSchema`를 패키지 진입점(`@canard/schema-form`의 '.')에서 오늘과 같은 이름으로 내보낸다.
  - 【추론】 전역 모듈 확장(declaration merging)은 쓰지 않는다.
  - 【추론】 한 프로그램에 바인딩이 둘이면 서로 부딪치고, 확장이 어디서 오는지 글로 따라갈 수 없기 때문이다.
  - 【추론】 런타임에서 core가 `presentation`을 읽지 않는다는 것은 이미 정해졌다(CONTROLS-011, REACT-003).
  - 【추론】 적용은 PR-7(`types/jsonSchema`의 맨 키 전환, LANDING-087)이다.
- 근거:
  - GOAL-016/REACT-001(core는 React를 모른다 — 런타임도 타입도, `reviews/round-2.md:114`), 소유자: "react 관련 타입이 많이 붙었는데, 걷어낼 수 있으면 좋겠다"(`00-goals.md:106`)
  - 오늘 `src/types/jsonSchema.ts:1`의 `ComponentType` import(쓰임은 `:229`), 오늘의 `Options` 제네릭(`jsonSchema.ts:223`), `open-questions.md:62`
- 게이트:
  - PR: PR-7.
  - 무엇: 재귀 스키마 타입에 매개변수를 하나 더 실을 때의 타입 검사 비용을 `yarn typecheck`로 확인한다.

### 18C-77 잔여 키의 표시 규칙·기본 문구·`false schema` 번역·기본 UI(11-10)

- 닫는 항목: REACT-026
- 결정:
  - 【추론】 기본 렌더러는 잔여 키 전용 UI를 두지 않는다.
  - 【추론】 잔여 키 오류(`rejectedKey`가 있는 오류)는 `dataPath`가 가리키는 호스트의 오류로 오늘처럼 호스트의 오류 렌더러에 그려진다.
  - 【추론】 `not.required` 오류를 호스트에서 자식으로 옮기지 않는다.
  - 【추론】 기본 문구는 오늘의 기본 `formatError`를 그대로 따른다.
  - 【추론】 `presentation.errorMessages[keyword]`가 있으면 그것을, 없으면 검증기의 `message`를 쓴다(`src/helpers/error/formatValidationError/formatValidationError.ts`).
  - 【추론】 `false schema` 번역은 따로 두지 않는다.
  - 【추론】 작성자가 `errorMessages`의 `'false schema'` 키나 자기 `formatError`로 번역한다.
  - 【추론】 `rejectedKey`는 사용자 정의 렌더러와 `formatError`가 읽을 수 있는 칸으로 남는다.
- 근거:
  - FRAGMENT-020(core는 `rejectedKey`가 있는 호스트 에러만 모은다), `reviews/round-5-derivations.md:34`("모두 렌더 계층의 일"), 오늘의 기본 `formatError`(`PluginManager.ts:85`), `.claude/rules/seiri_reuse-first.md` §2(추측으로 코드를 더하지 않는다)
  - 오류는 `dataPath`가 가리키는 자리에 붙는다는 예측성. 18C-53 (3)(잔여 키 에러는 그 키를 든 호스트에 싣는다)과 맞는다.

### 18C-78 merge를 돕는 순수 함수를 패키지가 제공할지(11-11)

- 닫는 항목: SCHEMA-020
- 결정:
  - 【추론】 제공하지 않는다.
  - 【추론】 서버 스키마에 예약 층 키를 얹는 merge는 소비자가 자기 방식으로 한다.
  - 【추론】 패키지는 그 방법을 이주 안내와 배포 문서에 적는 것까지만 한다(PR-8).
  - 【추론】 위치 불일치 경고용 helper도 두지 않는다.
- 근거:
  - 소유자: "병합을 form이 해야 하는 의도를 모르겠다. jsonSchema를 입력하는 사용자에게 충분한 자유도를 주려면 병합을 해서 전달받도록 하고 schema-form은 단일 jsonSchema를 받는 게 적당하지 않나."(`adr/0012-fe-overlay.md:10`)
  - ADR 0012의 결과 절("C1은 새 장치 없이 충족된다. 필요한 것은 문서다", `adr/0012-fe-overlay.md:30`), G4, `.claude/rules/seiri_public-contract.md` §1(소비자가 없는 수출은 두지 않는다)

### 18C-79 가드 컴파일의 인스턴스 사이 공유의 나머지 세부(11-12)

- 닫는 항목: VALIDATE-037
- 결정:
  - 【추론】 공유 단위는 (검증기 인스턴스, 작성 루트 객체의 identity) 하나다.
  - 【추론】 구조가 같은 다른 객체는 공유하지 않는다.
  - 【추론】 해시나 직렬화 비교를 하지 않는다.
  - 【추론】 같은 캐시 항목에 전체 검증 함수(`compile(사본)`의 결과, 실패했으면 그 실패)도 담는다.
  - 【추론】 그러면 같은 인스턴스·같은 작성 루트로 만든 폼들은 전체 컴파일도 한 번만 한다.
  - 【추론】 검증 불가 기록은 여전히 폼의 로드마다 한 번씩 낸다(ERROR 영역의 `VALIDATOR_COMPILE_FAILED` 행).
  - 【추론】 개발 모드의 "모든 가드를 한 번 컴파일해 보기"도 캐시 항목마다 한 번이다.
  - 【추론】 이 항목의 수명과 해제는 가드와 같다(VALIDATE-021).
  - 【추론】 `validatorFactory`가 폼마다 새 인스턴스를 주면 공유하지 않는다는 점은 문서에 적는다(VALIDATE-018 보충과 같다).
  - 【추론】 같은 `$id` 충돌, 최근 해제 목록의 크기, `$id`·`$dynamicRef` 문맥은 이 항목이 아니다(18C-56, 18C-57, 18C-58).
- 근거:
  - VALIDATE-018(`adr/0004-validator-plugin-compile-guard.md:34`), VALIDATE-021, 고속성 가치 "한 번 만든 것은 캐시해 다시 만들지 않는다"(`08-design-a-to-z.md:36`, 16라운드 답 10), `08-design-a-to-z.md:180,345`
  - 12-3 소유자: "검증기의 성능은 우리가 관여할 문제가 아닙니다만."(`reviews/round-18-owner-answers.md:13`)과는 부딪치지 않는다. 이 결정은 폼이 자기 호출을 되풀이하지 않는 것이지 검증기 내부에 손대는 것이 아니다.

### 18C-80 검증을 입력 경로에서 떼어 내는 법(R19)(11-13)

- 닫는 항목: VALIDATE-039
- 결정:
  - 【추론】 폼은 검증을 입력 경로에서 떼어 내는 장치를 따로 두지 않는다.
  - 【추론】 진입당 요청 1회와 마이크로태스크 합치기(O-6, EVENT-028)로 빈도만 줄이며, 큰 폼의 키 입력당 검증 비용은 남는다.
  - 【추론】 디바운스·유휴·워커는 폼에 두지 않는다(D-10, 12-3).
  - 【추론】 요청은 최외곽 진입당 한 번 하고, 실행은 마이크로태스크에 모아 최신 커밋 번호 하나만 돌린다(EVENT-028).
  - 【추론】 워커나 인터프리터 쪽 최적화는 검증기 플러그인의 몫이며, `compile`은 비동기 검증 함수를 돌려줄 수 있다.
  - 【추론】 검증 빈도를 줄이려는 호스트는 `ValidationMode`의 `OnRequest`를 쓴다.
  - 【추론】 제출은 캐시된 판정이 아니라 보내는 스냅숏을 새로 검증한다.
- 근거:
  - 소유자 답 O-6: "가 확정"(`reviews/round-14-owner-answers.md:12`; 가의 내용은 `reviews/round-14-owner-review.md:39`)
  - 소유자 답 12-3: "검증기의 성능은 우리가 관여할 문제가 아닙니다만."(`reviews/round-18-owner-answers.md:13`)
  - D-10은 디바운스를 없앴다(`reviews/round-4.md:116`, EVENT-026). 제출은 스냅숏을 새로 검증한다(VALIDATE-006).
  - 위 문장들을 한 결정으로 엮은 것은 편집자다. 소유자가 R19를 직접 답한 것은 아니다.

### 18C-81 잠복 원본 열거의 반환 모양(11-14)

- 닫는 항목: WRITE-020
- 결정:
  - 【추론】 `node.inactiveValues`(와 그것이 부르는 루트 노드의 함수)는 읽기 전용 배열 `ReadonlyArray<{ readonly path: string; readonly value: unknown }>`을 돌려준다.
  - 【추론】 항목은 그 노드 아래에서 형상에 없고 원본을 든 노드(잎·터미널, 그리고 잘못된 종류의 값을 든 노드)마다 하나다.
  - 【추론】 `path`는 절대 JSON Pointer(`node.path`와 같은 표기)다.
  - 【추론】 `value`는 그 노드가 든 원본이며 복사하지 않는다.
  - 【추론】 순서는 청사진의 전순서(문서 순서)다.
  - 【추론】 아래에 잠복 원본이 없으면 모든 노드가 공유하는 얼린 빈 배열 하나를 돌려준다.
  - 【추론】 배열과 항목 객체는 얼린다.
  - 【추론】 메모는 커밋 단계에서만 만든다.
  - 【추론】 잠복 집합이나 잠복 원본이 바뀐 노드의 조상 경로만 다시 만들고, 루트의 함수는 경로로 찾기만 한다.
  - 【추론】 바뀐 것이 없으면 이전 참조를 그대로 돌려준다.
  - 【추론】 그래서 "같은 값을 두 번 읽으면 같은 참조"가 성립한다.
  - 【추론】 같은 항목 객체를 조상들의 배열이 함께 쓴다(절대 경로라서 가능하다).
- 근거:
  - VALUE-029, 12-8 셋째 소유자: "root node 에 핸들로 추가하고, 개별 노드는 rootNode 의 기능을 경유해서 node.inactiveValues 를 구현하면 어떨까 싶다."(`reviews/round-18-owner-answers.md:22`)
  - VALUE-013(읽기는 계산하지 않는다), VALUE-012(참조 규칙), VALUE-004(저장되는 값은 자식 없는 노드에만), VALUE-002의 `raw` 행(VALUE-002), VALUE-023(루트의 JSON 값 트리는 버린 대안 — 중첩 객체 모양을 고르지 않는 까닭), 12-8 이어서(노드 인터페이스는 getter)
  - Map이 아니라 배열인 까닭은 순서가 전순서로 고정되고, JSON으로 직렬화되며, 가장 직접적인 모양이기 때문이다.
- 게이트:
  - PR: PR-2 벤치.
  - 무엇: 커밋 때 조상 경로 메모를 갱신하는 비용을 잰다.

### 18C-82 상태 칸 변경의 배달(11-15)

- 닫는 항목: EVENT-049
- 결정:
  - 【추론】 `setState`가 바꾼 `dirty`·`touched`는 EVENT-045(16라운드 답 3)대로 정착을 거치지 않는 사건이다.
  - 【추론】 같은 루트 디스패처가 같은 진입 규칙으로, 최외곽 진입의 끝에서 한 번 배달한다.
  - 【추론】 `controls.resetInteraction`이 커밋에서 바꾼 `dirty`·`touched`는 그 정착 파동의 배달 집합에 든다.
  - 【추론】 ADR 0008 §2 규칙 2에 항 하나를 더하는 것이다: "(이번 커밋에서 상호작용 상태가 바뀐 노드)".
  - 【추론】 비트는 오늘과 같은 `UpdateState`다.
  - 【추론】 한 진입 안에서 두 경로가 같은 노드를 바꾸면 비트는 합쳐져 그 노드에 한 번 배달된다.
  - 【추론】 `onStateChange`는 최외곽 진입의 끝에서 한 번 부른다.
- 근거:
  - EVENT-045(소유자 16라운드 답 3 "예", `reviews/round-16-owner-answers.md:9`)
  - 유효 스키마 변경도 같은 표에서 "정착 파동의 배달 집합에 든다"고 정해졌으니 그와 같은 모양이다(`09-landing-and-test-strategy.md:64`).
  - CONTROLS-029(판정은 커밋), EVENT-006(규칙 2), EVENT-012

### 18C-83 `UpdatePath` — 배열 재인덱싱 때 경로 변경 통지(11-16)

- 닫는 항목: EVENT-051
- 결정:
  - 【추론】 커밋에서 경로가 바뀐 노드는 그 정착 파동의 배달 집합에 든다(규칙 2에 항 "(이번 커밋에서 경로가 바뀐 노드)"를 더한다).
  - 【추론】 비트는 `UpdatePath`, payload는 오늘처럼 `{ previous, current }`다.
  - 【추론】 재인덱싱된 아이템의 자손도 포함한다(오늘 `__updatePath__`의 재귀와 같다).
  - 【추론】 오늘처럼 공개 이벤트 형(오늘 `NodeEventType`, 곧 `PublicNodeEventType` 여섯)에는 넣지 않는다.
  - 【추론】 렌더 계층은 입력을 다시 그리는 사건 집합에 이 비트를 더한다.
  - 【추론】 입력의 `path`·`name` prop과, 경로를 키로 쓰는 맵(첨부 파일 맵, `useChildNodeErrors`의 상태 맵)이 새 경로를 따라가게 하기 위해서다.
- 근거:
  - EVENT-006 규칙 2의 취지("emit이 그대로인 … 자식 구독자가 모르는 구멍을 막는다") — 아이템을 지운 뒤 뒤쪽 아이템은 emit이 그대로이므로 이 항이 없으면 입력의 `path`·`name`이 낡는다.
  - 입력은 `path`·`name` prop을 받는다(`src/types/formTypeInput.ts:49-51`). 경로를 키로 쓰는 곳: `SchemaNodeInput.tsx:63-65`, `src/hooks/useChildNodeErrors.ts`의 `nodeStateMap.set(node.path, …)`.
  - 오늘은 비트를 발행만 하고 구독하는 곳이 없다(`AbstractNode.ts:238`, `src/core/types/event.ts:85-92`). ADR 0011에 따라 노드 identity와 경로의 대응은 남는다.

### 18C-84 C-10의 문서 자리(11-17)

- 닫는 항목: EVENT-053
- 결정:
  - 【추론】 "파생 값은 이펙트가 아니라 `controls.derived`/`controls.injectTo`/스토어 리스너로 쓴다"는 판과 무관한 사용 규칙이므로 README(와 `docs/QUICK_REFERENCE.md`·`docs/agents`의 `validation-and-state.md`)가 소유한다.
  - 【추론】 이주 안내에는 한 줄만 두고 README를 가리킨다.
  - 【추론】 그 한 줄은, 오늘 매크로태스크 디바운스가 가리던 "이펙트 쓰기면 키 입력당 `onChange` 2회"가 새 설계에서 드러난다는 점이다(LANDING-022 이주 19와 짝).
  - 【추론】 작성은 PR-8이다.
- 근거:
  - `reviews/round-5-derivations.md:25`(C-10 "문서화 대상"), `05-before-after.md:128`(C-10 행: React 이펙트의 쓰기는 새 진입이라 키 입력당 2회이며 문서화 대상), LANDING-068(PR-8 README·docs·이주 안내), LANDING-121(PR-8 문서 재작성의 세 문서가 사용 규칙을 적는 선례)

### 18C-85 React 이펙트를 거친 진입 간 순환이 React 한도에 막히는가(11-18)

- 닫는 항목: EVENT-054
- 결정:
  - 【추론】 규칙은 지금 정한다.
  - 【추론】 core의 예산은 진입 사슬 단위이고(EVENT-008), React 이펙트를 거친 순환은 매번 새 진입이라 core 예산에 넣지 않는다.
  - 【추론】 예방은 C-10의 문서(18C-84)가 맡는다.
- 근거:
  - `06-conclusions.md:161,402`("막히면 코어 예산에서 제외"), `07-conclusions.md:397`, EVENT-008(6라운드 D-17의 진입 사슬 단위), C-10 실측(React 19에서 이산 이벤트의 패시브 이펙트가 동기로 flush, `reviews/round-5-derivations.md:25`)
  - React의 중첩 갱신 한도가 패시브 이펙트 쪽에서는 개발 모드 경고일 수 있다는 점은 기억에 기댄 것이라 추론으로 정할 수 없어 게이트로 확인한다.
- 게이트:
  - PR: PR-7(React 18 실행 시험을 두는 PR, REACT-017).
  - 무엇: 이벤트 스파이크(`spikes/events/`)에 이펙트 되먹임 사례를 더한다.
  - 무엇: `useLayoutEffect`와 `useEffect`에서 `node.setValue`로 서로를 되쓰는 두 필드를 만들고, React 18과 19에서 각각 실행한다.
  - 통과: 두 이펙트 모두에서 React가 순환을 끊는다(throw나 중단).
  - 통과: 그러면 이 규칙을 그대로 둔다.
  - 실패(특히 패시브 이펙트 순환이 개발 모드 경고만 내고 계속 도는 경우): core가 진입 간 순환 감지를 더할지 소유자에게 올린다.
  - 실패: 이것은 core 예산의 단위를 바꾸는 일이라 편집자가 정하지 않는다.

### 18C-86 명령 `RequestEmitChange`·`RequestInjection`과 공개 훅 셋의 거취(11-20)

- 닫는 항목: LANDING-124
- 결정:
  - 【추론】 (1) `RequestEmitChange`·`RequestInjection`은 새 설계에 없다.
  - 【추론】 둘 다 오늘의 이벤트 사슬 전파가 쓰던 내부 비트다(`BranchStrategy.ts:145`, `AbstractNode.ts:974-977`).
  - 【추론】 새 설계에서는 방출과 `controls.injectTo`가 정착 루프의 구조(작업 루프의 커밋과 파생 단계)이며, "전파와 통지가 옵션이 아니라 구조"다(GOAL-075).
  - 【추론】 오늘 공개 `NodeEventType`(=`PublicNodeEventType` 여섯, `src/core/types/event.ts:85-92`, `src/index.ts:44`)에 없고 소비자가 publish할 수도 없으므로(`reviews/round-5-derivations.md:22` C-11) 이주 행은 두지 않는다.
  - 【추론】 (2) 05 §3이 든 공개 훅 가운데 REACT-006이 다루지 않은 셋, `useChildNodeComponentMap`·`useChildNodeErrors`·`useFormSubmit`은 이름과 시그니처를 유지한다(`src/index.ts:82-84`).
  - 【추론】 `useChildNodeComponentMap`은 `ChildNodeComponents`의 `field`만 쓰는 렌더 계층 도우미라 그대로 둔다.
  - 【추론】 `useChildNodeErrors`는 PR-7에서 새 통지(`UpdateChildren`에 대응하는 형상 변경, `UpdateState`, 18C-83의 `UpdatePath`)로 다시 구현하며, 반환형의 `JSONSchemaError`는 `ValidationIssue`로 바뀐다(§14의 21행, LANDING-070).
  - 【추론】 `useFormSubmit`은 `FormHandle.submit`의 `subscribe`·`pending` 위에 서 있고, `degraded` 동안 제출 거부 경로로 이미 새 설계에 쓰였으므로(`adr/0014-error-policy.md:237`) 유지한다.
  - 【추론】 이 결정은 명령 둘과 훅 셋에 한정한다.
  - 【추론】 같은 원문의 나머지 미확인(`Form` props 14, `FormHandle` 8, `NodeEventType` 17종의 개별 생사, `ValidationMode`, `oneOfIndex`/`anyOfIndices`, `type: 'virtual'`, root 폴백, 빈 값 경로)은 이 행의 범위가 아니며, `alias`·`placeholder`·`errorMessages`는 18C-72가 닫는다.
- 근거:
  - 위 코드 위치, REACT-006, LANDING-087(훅 둘은 "그대로 쓰는 것")
  - 저장소의 소비처: `stories/19.SubmitUsecase.stories.tsx`, `21.Validation*.stories.tsx`, `32.DynamicObjectFormType.stories.tsx`

## 반영 게이트가 드러낸 항목

### 18C-87 LANDING-124의 나머지 — 거취가 적히지 않은 오늘의 공개 표면과 타입별 빈 값

- 닫는 항목: LANDING-124
- 결정:
  - 【추론】 원장의 결정이나 이주 행이 바꾸거나 없앤다고 적지 않은 오늘의 공개 표면은 이름·시그니처·뜻을 그대로 둔다.
  - 【추론】 `Form` props(`src/components/Form/type.ts`의 `FormProps` 열아홉 칸)와 `FormHandle`의 열여섯 멤버가 모두 이 규칙을 따르며, 바뀌는 칸과 멤버는 원장의 결정이 정하고 LANDING의 이주 행이 적는다.
  - 【추론】 `ValidationMode`(`OnChange`·`OnRequest`·`None`)는 그대로다.
  - 【추론】 오늘의 공개 이벤트 형 여섯(`UpdateValue`·`UpdateState`·`UpdateError`·`RequestFocus`·`RequestSelect`·`RequestRemount`)은 모두 남는다.
  - 【추론】 `UpdateError`는 검증 결과가 자기 파동으로 배달하는 오류 갱신(EVENT-046)의 비트다.
  - 【추론】 새 공개 이벤트 형과 `UpdateValue`의 출처 칸(EVENT-060)은 더하는 변화이므로 이주 행이 아니라 새 기능 안내에 적는다.
  - 【추론】 공개 여섯 밖의 오늘 이벤트 종류는 공개 표면이 아니므로 새 설계가 이주 행 없이 바꾼다.
  - 【추론】 core는 `default`가 없는 자리에 타입별 빈 값을 만들지 않는다.
  - 【추론】 채움의 원천은 `controls.default` > `default` > 없음뿐이다(VALUE-007, SCHEMA-002).
  - 【추론】 `Form`이 `defaultValue` 없이 서거나 `reset`될 때 루트에 로드하는 값은 없음이며, 빈 호스트와 루트가 무엇을 방출하는지는 18C-88이 정한다.
  - 【추론】 그래서 오늘의 `getEmptyValue` 경로는 새 설계에 없고, 빈 폼의 `FormHandle.getValue()`는 18C-88대로 오늘처럼 `{}`다.
  - 이주(LANDING-171): 빈 중첩 객체·배열 노드의 `normalizedValue`는 오늘 `{}`·`[]`이고(`src/helpers/defaultValue/getEmptyValue/getEmptyValue.ts:8-14`, `src/core/nodes/AbstractNode/AbstractNode.ts:397-399`), 새 설계의 `outputValue`는 `omitEmpty`(기본 켜짐) 아래에서 `undefined`다(18C-88).
    - `node.value`(투영 전)는 오늘처럼 `{}`·`[]`이고, 부모의 값과 `FormHandle.getValue()`에는 오늘처럼 그 키가 없다.
- 근거:
  - `05-before-after.md:83`(`Form` props "그 밖 16개 … 미확인"), `:106`(`FormHandle` "나머지 11개 … 미확인"), `:214`(§6 "문서가 말하지 않는 것")
  - `src/components/Form/type.ts:39-106`(`FormProps` 열아홉 칸, `FormHandle` 열여섯 멤버), `src/core/types/event.ts:82-92`(`PublicNodeEventType`), `src/index.ts:44`
  - 18C-45·18C-86과 같은 까닭: 없애면 오늘 호출자가 이득 없이 깨진다(`packages/canard/schema-form/CLAUDE.md:7`).
  - EVENT-046(검증 결과의 오류 갱신 배달), EVENT-060(`UpdateValue`의 출처 칸), EVENT-063(명령 넷), EVENT-037(`RequestRemount`), LANDING-158(`SchemaNodeEventType` 개명), LANDING-005(`oneOfIndex`·`anyOfIndices`), CONTROLS-051·LANDING-019(`options.virtual`), LANDING-015·LANDING-016(`&` 루트 폴백)
  - LANDING-041과 VALIDATE-049는 `ValidationMode`의 값에 기대어 정했다.
  - 오늘의 빈 값 경로: `src/helpers/defaultValue/getDefaultValue/getDefaultValue.ts:11-23`, `AbstractNode.ts:1129`(`__resetToBlank__`). 새 설계의 채움: VALUE-007, SCHEMA-002, BLUEPRINT와 FRAGMENT의 "암묵 default는 없다".
  - 빈 그릇 규칙의 까닭: 공개 인터페이스 `FormHandle<Schema, Value>`의 `getValue()`는 객체 스키마에서 객체를 기대하게 한다(`packages/canard/schema-form/CLAUDE.md:7`). 자식 키는 `InferValueType`이 이미 모두 선택 키로 낸다(`packages/canard/schema-form/CLAUDE.md` Key Type Utilities).
- 게이트:
  - PR: PR-7(이주 점검)
  - 무엇: `FormProps` 열아홉 칸, `FormHandle` 열여섯 멤버, 공개 이벤트 형 여섯을 하나씩 원장의 결정·이주 행과 대조한다.
  - 통과: 바뀌는 것마다 이주 행이 있다.
  - 실패: 빠진 이주 행을 더한다.

### 18C-88 빈 호스트와 루트의 방출 — 6라운드부터 원장 밖에 남아 있던 투영 규칙

- 닫는 항목: 없음(원장에 항목 없이 남아 있던 물음: `reviews/round-6-coherence.md:107`, 7라운드의 분류 `reviews/raw-round7-derivation-local.md:188,368`)
- 결정:
  - 【추론】 객체 호스트의 `local`은 늘 객체다: 방출이 있는 활성 자식의 합성이고, 그런 자식이 없으면 `{}`다(FRAGMENT-016의 "자기 `{}`"와 같다).
  - 【추론】 배열 호스트의 `local`은 아이템 방출의 배열이고, 아이템이 없으면 `[]`다.
  - 【추론】 `omitEmpty`(기본 켜짐)의 투영은 빈 `local` — `''`, 키가 없는 `{}`, 아이템이 없는 `[]` — 을 방출하지 않으며, 부모의 합성은 방출이 없는 자식의 키를 두지 않는다.
  - 【추론】 `omitEmpty`를 끈 호스트는 `{}`·`[]`를 방출한다.
  - 【추론】 루트는 방출이 없을 때 루트 종류의 빈 그릇을 `outputValue`로 준다: 객체 루트는 `{}`, 배열 루트는 `[]`, 그 밖의 루트는 `undefined`다.
  - 【추론】 그래서 빈 폼의 `FormHandle.getValue()`와 마지막 칸을 비운 뒤 루트 `onChange`가 받는 값은 오늘처럼 `{}`다.
  - 【추론】 배열 아이템은 자리가 색인이므로 빠지지 않는다: 방출이 없는 객체 아이템은 `{}`, 배열 아이템은 `[]`, 잎 아이템은 `null`로 그 자리를 채운다(VALIDATE-007: 방출은 JSON 왕복과 같고 배열 중간의 `undefined`는 없다).
  - 【추론】 `omitTrailing`은 배열 꼬리에서 이렇게 채운 자리를 자른다.
  - 【추론】 이 투영은 원본과 상태를 바꾸지 않는다(P3, P4).
- 근거:
  - 오늘의 관찰(실행으로 확인): 빈 중첩 객체·배열 노드의 값은 `{}`·`[]`이고(`src/helpers/defaultValue/getEmptyValue/getEmptyValue.ts:8-14`), 부모 전파에서 `omitEmpty`(기본 켜짐, `src/types/jsonSchema.ts:265-266`)가 그 `{}`·`[]`를 뺀다(`src/core/nodes/ObjectNode/ObjectNode.ts:98-102`, `src/core/nodes/ArrayNode/ArrayNode.ts:200-205`). 루트 `onChange`는 `undefined`를 `{}`로 바꾼다(`src/core/nodes/AbstractNode/AbstractNode.ts:1219-1223`, `src/core/nodes/AbstractNode/utils/getSafeEmptyValue/getSafeEmptyValue.ts:9-12`). `items.default` 없는 객체 아이템의 `push()`는 `{}`를 든다(`src/core/nodes/ArrayNode/strategies/BranchStrategy/BranchStrategy.ts:385-393`).
  - 오늘 스위트의 단언: `src/core/__tests__/ObjectNode.test.ts:57`, `src/core/__tests__/ArrayNode.defaultValue.test.ts:187-188`, `src/core/__tests__/ArrayNode.clear.test.ts:41`, `src/__tests__/scenarios/virtual.render.test.tsx:66,199`
  - 모형: VALUE-002(P3, `local`은 투영 전 합성), VALUE-027(`FormHandle.getValue()`는 루트의 `outputValue`), FRAGMENT-016(빈 중첩 호스트의 게이트 입력은 `{}`), VALIDATE-007(방출은 JSON 왕복과 같음), LANDING-136(`omitEmpty` 기본 켜짐), WRITE-082(객체 호스트의 없음)
  - 프로토타입 `spikes/round10/proto/loop-v6.mjs:1108`은 키가 없는 객체 호스트를 루트까지 방출하지 않고(루트 `undefined`), `:904-952`는 없음인 아이템을 `undefined`로 둔다. 이 블록이 그 동작을 고치며, PR-0의 프로토타입 v7이 이 규칙을 따른다.
  - 6라운드의 관찰: `spikes/round6/claude/REPORT.txt:126-129`("빈 호스트의 방출 규칙이 ADR에 없다")
  - 공개 인터페이스가 기대하게 하는 일관성(`packages/canard/schema-form/CLAUDE.md:7`): 빈 폼과 빈 중첩 자리의 `getValue()`를 오늘과 같게 둔다.
- 게이트:
  - PR: PR-2(객체 호스트)·PR-5(배열)
  - 무엇: 위 오늘 스위트의 단언과 `items.default` 없는 `push()`를 새 구현으로 돌린다.
  - 통과: 이 블록의 규칙대로 나오고, 오늘과 다른 곳은 LANDING-171과 이주 행이 모두 적고 있다.
  - 실패: 오늘과 다른데 이주 행이 없으면 행을 더하고, 규칙의 결함이면 이 블록을 고친다.

## union 설계 스웜(2026-09-26)이 드러낸 항목

2026-09-26. union 노드의 범위를 객체·배열과 형 없는 원시 `anyOf`·`oneOf`까지 넓히는 설계를 스웜으로 짜고 검증했다. 소유자가 정한 것은 `reviews/round-18-owner-answers.md:29-37`에 있고, 이 절은 그 밖의 편집자 결정이다. `reviews/raw-round18-union-swarm/`은 그 스웜의 작업 파일이며, 정본 설계는 `reviews/raw-round18-union-swarm/merged-v3.md`다.

### 18C-89 union 노드의 공개 형 — `UnionNode`, 판별 `value`, 형 추론, 가드, 참조 안정성

- 닫는 항목: NODE-041(보충), SURFACE-052(보충), 새 항목 NODE-058(결정)
- 결정:
  - 【추론】 형 정의는 `UnionMemberType = 'string'|'number'|'integer'|'boolean'|'object'|'array'`와 `UnionSchemaType = readonly [UnionMemberType, UnionMemberType, ...UnionMemberType[]]`이다(원소 범위는 `reviews/round-18-owner-answers.md:29`).
  - 【추론】 `UnionNode`의 모양은 `type: 'union'`, `strategy: 'terminal'`, `schemaType: UnionSchemaType`, `nullable: boolean`, `children: null`에 공통 멤버를 더한 것이다(SURFACE-058).
  - 【추론】 `UnionNode`는 `valueTypeMismatch`를 판별자로 두 멤버로 나뉜다.
  - 【추론】 `valueTypeMismatch`가 `false`인 멤버의 `value`는 `string | number | boolean | ObjectValue | ArrayValue | undefined`이고, nullable이면 `| null`이 붙는다.
  - 【추론】 `valueTypeMismatch`가 `true`인 멤버의 `value`는 `unknown`이다.
  - 【추론】 노드 형에는 제네릭을 두지 않으며, 목록 형으로 좁히는 것은 `FormTypeInputProps`가 맡는다.
  - 【추론】 union 노드의 `FormTypeInputProps`에서 `value`와 `onChange`는 일부러 다른 형이다.
  - 【추론】 props의 `value`는 `UnionNode.value`와 같은 판별 모양이다: `valueTypeMismatch === false`이면 목록 종류의 값, `undefined`, (nullable이면) `null`이고, `true`이면 `unknown`이다.
  - 【추론】 props의 `onChange`는 목록 종류의 값, `undefined`, 그리고 nullable일 때만 `null`을 받는다.
  - 【추론】 종류별 공개 형은 `schemaType`을 좁힌다: `StringNode`는 `'string'`, `NumberNode`는 `'number'|'integer'`, `BooleanNode`는 `'boolean'`, `NullNode`는 `'null'`, `ObjectNode`는 `'object'`, `ArrayNode`는 `'array'`, `VirtualNode`는 `'virtual'`, `UnionNode`는 `UnionSchemaType`이다(NODE-015, NODE-046).
  - 【추론】 공개 가드 `isUnionNode(x) = isSchemaNode(x) && x.type === 'union'`을 더한다(이름은 `reviews/round-18-owner-answers.md:28`).
  - 【추론】 `isTerminalNode(unionNode)`는 참이고 그 반환 형 합집합에 `UnionNode`가 들어가며, `isBranchNode(unionNode)`는 거짓이다.
  - 【추론】 새 설계에서 두 가드는 `strategy`를 본다.
  - 【추론】 "목록에 X가 있는가"를 묻는 공개 가드는 두지 않는다: `isUnionNode(n) && n.schemaType.includes('integer')`로 충분하다(seiri public-contract §1).
  - 【추론】 `JSONSchemaWithVirtual`에 `UnionSchema`를 더하며, 모양은 `type`이 `UnionMemberType | 'null'`의 읽기 전용 배열인 것과 `type` 없이 `anyOf`·`oneOf`가 필수인 것의 둘이다.
  - 【추론】 `InferSchemaNode`와 `InferValueType`은 18C-90의 런타임 절차를 비추며, 청사진 오류가 되는 모양은 형 수준에서도 무효이고, 형 수준이 판정할 수 없는 모양은 넓은 형으로 둔다.
  - 【추론】 `type` 배열을 접은 집합의 원소가 2개 이상이면 `InferSchemaNode`는 `UnionNode`이고, `InferValueType`은 원소 값 형의 합(nullable이면 `| null`)이다.
  - 【추론】 접은 집합의 원소가 1개이면 그 종류의 노드와 그 형(nullable이면 `| null`)이다.
  - 【추론】 `type` 배열이 `'null'`만이거나 형 없는 칸의 분기가 모두 null 분기이면 `NullNode`와 `null`이다.
  - 【추론】 형 없는 `anyOf`·`oneOf`의 모든 분기가 원시 형을 가지면 분기 형을 모아 위 두 줄과 같이 사상하고, 값 형은 분기 값 형의 합이다.
  - 【추론】 형 없는 분기(`const`·`enum`만 있는 것 포함), 객체·원시 혼합 분기, 모든 분기가 객체(또는 배열)인 형 없는 칸은 `never`와 `unknown`이다.
  - 【추론】 `$ref`, 게이트 가진 분기, `oneOf`와 `anyOf`가 함께 있는 칸, 본체에 붙은 `allOf`는 넓은 `SchemaNode`와 오늘 규칙의 값 형이다.
  - 【추론】 `src/types/value.ts`의 `NormalizeType`을 지우고 winglet의 `InferValueType`에 스키마를 그대로 넘긴다.
  - 【추론】 union 칸에 `enum`이 있으면 `InferValueType`은 목록 종류들의 값 형과 enum 리터럴 형의 교집합이며, 리터럴의 JSON 종류가 목록(+nullable)에 있는 것만 남는다(예: `['number','string']` + `enum:[1,'a',true]`는 `1 | 'a'`).
  - 【추론】 `InferJSONSchema<Value>`가 분배되지 않게 고쳐, 값의 null이 아닌 범주(string·number·boolean·object·array, 리터럴 합은 한 범주)가 둘 이상이면 `UnionSchema`로 사상한다.
  - 【추론】 그래서 `FormTypeInputProps<string|number>`의 `node`는 `UnionNode`다.
  - 【추론】 유효 목록은 노드마다 유효 스키마 메모가 같은 동안 같은 참조이고, 좁히는 게이트가 없으면 `schemaType`과 같은 참조다.
  - 【추론】 `jsonSchema`는 켜진 덧씌움 집합이 같은 동안 같은 참조다.
  - 【추론】 `value`와 `valueTypeMismatch`는 커밋 사이에 같은 참조이며, 객체·배열 값은 변환하지 않으므로 참조가 그대로이고, 같은 원본이면 방출도 같은 참조다(VALUE-012, VALUE-030).
- 근거:
  - 정본 설계: `reviews/raw-round18-union-swarm/merged-v3.md` §1(1.10–1.22)과 편집자 각주 1·2. `type`·`strategy`·`nullable`·`schemaType`의 필드 규칙과 참조는 `reviews/round-18-owner-answers.md:31`.
  - 검증: `reviews/raw-round18-union-swarm/out-V1.md` 지적 5(형 수준과 청사진 절차가 여러 모양에서 다른 답을 냄), 지적 11(null 노드의 `schemaType`), `reviews/raw-round18-union-swarm/out-V2.md` 지적 11(union 값 형이 SURFACE-052의 "그 형의 값"보다 넓음)과 지적 15(가드의 인용 경로; 오늘 가드는 `node.group`을 봄).
  - 노드 형에 제네릭을 두지 않는 까닭: 다른 종류 형과 모양이 같고 구현이 작다(`packages/canard/schema-form/CLAUDE.md:7-8`). 목록 형의 정밀도는 props가 준다.
  - 오늘: `src/core/nodes/AbstractNode/AbstractNode.ts:83`(모든 노드의 `schemaType`이 넓은 `JSONSchemaType`), `:134-135`(터미널의 `children`), `src/types/formTypeInput.ts:61-65`(`value`와 `onChange`가 같은 `Value`), `src/core/nodes/filter.ts:77,197-198`(가드가 `node.group`을 봄), `winglet/json-schema/src/types/jsonSchema.ts:103-110,149-153`(형 정의가 nullable 쌍만 받음), `src/types/value.ts:10-23`(`as const` `type` 배열이 `any`), `src/types/jsonSchema.ts:40-88`(분배되는 `InferJSONSchema`), `src/types/formTypeRenderer.ts:21`
- 게이트:
  - PR: PR-2(노드 형)·PR-7(공개 수출)
  - 무엇: tsc 전용 `src/types/__tests__/union.type-test.ts`가 위 사상, `InferValueType`·`InferJSONSchema`의 형, union props의 `value`(판별)와 `onChange`(목록 형)를 단언하고, `union.schema-type-invariant.test.ts`가 같은 칸의 노드와 배열 아이템의 `schemaType` 참조가 같고 얼려 있음을 단언한다.
  - 통과: 모든 사상이 위대로이고 tsc와 시험이 통과한다.
  - 실패: 형 수준이 런타임 절차와 다른 답을 내면 그 모양을 넓은 형으로 두고, 넓혀도 어긋나면 이 블록을 고친다.

### 18C-90 청사진 판정 절차 — 허용 집합, 단계 S0–S6, 예, 오류 코드, 터미널 하위 키 경고

- 닫는 항목: BLUEPRINT-034(보충; (1)·(5)의 문장 일부는 `reviews/round-18-owner-answers.md:29-30`이 대체), BLUEPRINT-011(보충), BLUEPRINT-012(보충), BLUEPRINT-032(보충), SCHEMA-008(보충), ERROR-164(보충), VALIDATE-003(보충), NODE-057(보충), 새 항목 BLUEPRINT-044(결정), 새 항목 BLUEPRINT-045(결정), 새 항목 ERROR-203(결정), 새 항목 VALIDATE-051(결정)
- 결정:
  - 【추론】 선언 d의 허용 집합 A(d)는 `'null'`을 포함해 d가 받는 형의 집합이다.
  - 【추론】 A(d)의 기본은 d 자신의 `type`(문자열이나 배열)의 원소이고, `nullable: true`는 같은 객체에 `type`이 있을 때만 `'null'`을 더하며, `'null'`만 받는 분기는 `{null}`이다.
  - 【추론】 `type`이 없는 선언은 A = ⊤이며 어느 종류와도 맞는다.
  - 【추론】 ⊤가 아닌 A가 빈 집합이면 종류가 없고, 그 A를 만든 단계가 오류를 정한다.
  - 【추론】 A = `{null}`이면 null 종류이고 `nullable: true`이다.
  - 【추론】 그 밖에는 F = fold(A \ {null})로 정하며(fold는 `'integer'`를 `'number'`로 바꾼다), |F| = 1이면 그 종류, |F| ≥ 2이면 `union`이다.
  - 【추론】 nullable은 `'null'` ∈ A와 같다.
  - 【추론】 두 선언은 fold가 같을 때 같은 종류이며, 구현은 7비트 마스크 비교 한 번이다.
  - 【추론】 두 허용 집합의 교집합은 원소마다 취한다: `integer ⊂ number`이므로 `number` ∩ `integer` = `integer`이고, `'null'`은 양쪽에 있을 때만 남으며, 순서는 앞 집합의 순서를 따른다.
  - 【추론】 절차는 칸마다 S0부터 번호 순서로 보며, 반드시 하나의 결과로 끝난다.
  - 【추론】 S0 문법: 알려지지 않은 형 이름, 빈 배열 `[]`, 배열 안의 중복 원소는 `UNKNOWN_JSON_SCHEMA`이다.
  - 【추론】 선언 하나 안의 `['integer','number']`는 `'number'`다.
  - 【추론】 S1 정적 연언 C는 칸 본체, 게이트 없는 `allOf` 항목(재귀), 그리고 이것들의 `$ref` 대상이다(FRAGMENT-048, SCHEMA-007).
  - 【추론】 `type`을 가진 선언을 전순서로 늘어놓은 첫째를 앵커라 부르며, 앵커는 결과 원소의 순서만 정한다.
  - 【추론】 S2(C에 `type`을 가진 선언이 있는 칸)는 `reviews/round-18-owner-answers.md:37`의 U1–U3을 따르며, `type`이 없는 선언(A = ⊤)은 교집합에 관여하지 않는다.
  - 【추론】 S2에서 교집합이 빈 집합이면 `ALL_OF_TYPE_REDEFINITION`이다.
  - 【추론】 S3(C에 `type`이 없는 칸)은 `reviews/round-18-owner-answers.md:30`·`:32`·`:33`을 따른다.
  - 【추론】 S4: 칸의 종류가 원시나 `union`이면 게이트 없는 `oneOf`·`anyOf` 분기의 `type`은 검증 전용이며, 목록 밖 분기와 null 분기도 오류가 아니다.
  - 【추론】 형 있는 칸의 null 분기는 nullable을 켜지 않고, 유효 목록을 좁히지 않는다.
  - 【추론】 칸이 object·array이면 기존 variant 규칙을 따른다.
  - 【추론】 S5: 같은 이름의 선언이 여러 조각에 있으면, 정적 선언(호스트 본체, 호스트의 게이트 없는 `allOf`, `$ref`)은 모두 그 칸의 C가 되어 노드 하나를 정한다(BLUEPRINT-010).
  - 【추론】 켜진 게이트 선언과 정적 허용 집합의 교집합(`'null'` 포함)이 빈 경우(`reviews/round-18-owner-answers.md:37`의 U2)는 그 게이트들이 켜진 동안 `SHARED_NODE_CONFLICT`(정착 오류, 기존 처리)로 드러난다.
  - 【추론】 호스트의 게이트 없는 분기의 `type`은 "또는" 문맥이라 존재만 더하고 교차하지 않는다(SCHEMA-008, SCHEMA-044).
  - 【추론】 그 분기의 fold가 정적 노드의 fold에 들면 검증 전용이며 목록·nullable·유효 목록을 바꾸지 않고, 그 밖에는 `SHARED_NODE_KIND_CONFLICT`이다.
  - 【추론】 정적 선언이 하나도 없는 이름은 fold가 같은 선언끼리 노드 하나를 둔다.
  - 【추론】 그 노드의 목록은 선언들 허용 집합의 합집합을 종류 규칙으로 나눈 것이며, `integer`는 모든 선언이 `integer`일 때만 남고, nullable은 OR이며, `{null}`이면 null 종류다.
  - 【추론】 그 목록의 순서는 전순서의 첫 선언을 앵커로 하고, 앵커에 없는 원소는 처음 나온 순서대로 뒤에 붙인다.
  - 【추론】 fold가 다른 게이트 선언이 동시에 켜지면 `SHARED_NODE_CONFLICT`이고, 배타이면 종류별 노드이며(BLUEPRINT-011·012 그대로), 각 노드 안에서는 켜진 선언이 유효 목록을 좁힌다.
  - 【추론】 S6: 종류가 object·array인 칸은 nullable을 포함해(`['object','null']`) 오늘 순서 `options.terminal` → 판정 → `type`을 따른다(NODE-028, NODE-042).
  - 【추론】 전략이 `terminal`인 모든 노드의 인라인 하위 스키마(깊이 1 이상, `$ref`는 따라가지 않음)에 예약 층 키 `controls`·`options`·`presentation`이 나오면, 청사진이 경고 `(가칭) SCHEMA_FORM_WARNING.TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`을 낸다.
  - 【추론】 그 기록은 `{ schemaPath, keys, paths }`이고, `(code, schemaPath)`로 트리마다 한 번 낸다.
  - 【추론】 그 경고는 개발 모드 콘솔과 커밋된 로드의 준비 이펙트로 드러나며(ERROR-164 `NULL_BRANCH_IGNORED_FOR_FORM` 행과 같은 드러남), 핸들러가 없는 프로덕션에서는 검사하지 않는다.
  - 【추론】 union 칸 인라인 하위 스키마의 `presentation.FormTypeInput`은 그릴 자리가 없으므로 이 경고의 대상이다.
  - 【추론】 결과는 일곱 가지다: 원시 잎(+nullable), null 잎, 원시만의 `union` 잎, 터미널 강제 `union` 잎, object·array 노드(branch 또는 terminal, +nullable), variant 호스트, 청사진 오류.
  - 【추론】 예(종류 / `schemaType` / nullable / 전략 / 오류)는 아래 E1–E42와 같다.
  - 【추론】 E1: `{type:['string','number']}`는 union / `['string','number']` / false / terminal.
  - 【추론】 E2: `{type:['number','string','null']}`는 union / `['number','string']` / true / terminal.
  - 【추론】 E3: `{type:['string','number'], nullable:true}`는 union / `['string','number']` / true / terminal.
  - 【추론】 E4: `{type:['integer','number']}`는 number / `'number'` / false / terminal.
  - 【추론】 E5: `{type:['integer','string']}`는 union / `['integer','string']` / false / terminal.
  - 【추론】 E6: `{type:['integer','null']}`는 number / `'integer'` / true / terminal.
  - 【추론】 E7: `{type:['object','string'], properties:{…}}`는 union / `['object','string']` / false / terminal(강제).
  - 【추론】 E8: `{type:['object','null']}`는 object / `'object'` / true / NODE-028 순서.
  - 【추론】 E9: `{type:['null']}`는 null / `'null'` / true / terminal.
  - 【추론】 E10: `{type:['null','null']}`, `{type:[]}`, `{type:['string','foo']}`는 `UNKNOWN_JSON_SCHEMA`.
  - 【추론】 E11: `{anyOf:[{type:'string'},{type:'number'}]}`는 union / `['string','number']` / false / terminal.
  - 【추론】 E12: `{anyOf:[{type:'integer'},{type:'string',minLength:1},{type:'null'}]}`는 union / `['integer','string']` / true / terminal.
  - 【추론】 E13: `{anyOf:[{type:'string'},{type:'null'}]}`는 string / `'string'` / true / terminal.
  - 【추론】 E14: `{anyOf:[{const:'a'},{type:'number'}]}`는 `UNKNOWN_JSON_SCHEMA`(`reviews/round-18-owner-answers.md:32`).
  - 【추론】 E15: `{anyOf:[{type:'object'},{type:'string'}]}`는 `UNKNOWN_JSON_SCHEMA`(`reviews/round-18-owner-answers.md:33`).
  - 【추론】 E16: 자기 형 없는 `{oneOf:[{type:'object',…},{type:'object',…}]}`는 `UNKNOWN_JSON_SCHEMA`(오늘과 같음).
  - 【추론】 E17: `{oneOf:[{type:'string'},{type:'number'}], anyOf:[{type:'number'},{type:'boolean'}]}`는 number / `'number'` / false / terminal.
  - 【추론】 E18: `{type:['string','number'], allOf:[{type:'string'}]}`는 string / `'string'` / false / terminal.
  - 【추론】 E19: `{type:['number','string'], allOf:[{type:['integer','string']}]}`는 union / `['integer','string']` / false / terminal.
  - 【추론】 E20: `{type:'number', allOf:[{type:'integer'}]}`는 number / `'integer'` / false / terminal.
  - 【추론】 E21: `{type:['string','null'], allOf:[{type:'string'}]}`는 string / `'string'` / false / terminal.
  - 【추론】 E22: `{type:'string', anyOf:[{type:'null'},{minLength:1}]}`는 string / `'string'` / false / terminal.
  - 【추론】 E23: `{type:'string', allOf:[{type:'number'}]}`는 `ALL_OF_TYPE_REDEFINITION`(교집합이 빈 집합).
  - 【추론】 E24: `{type:'number', allOf:[{type:['number','string']}]}`는 number / `'number'` / false / terminal(오늘은 오류).
  - 【추론】 E25: 본체 `a:{type:['string','number']}` + `if/then a:{type:'number'}`는 union / `['string','number']` / false / terminal이고, 켜진 동안 유효 목록은 `['number']`다.
  - 【추론】 E26: 본체 `a:{type:'number'}` + `if/then a:{type:['number','string']}`는 number / `'number'` / false / terminal이고, 켜진 동안 유효 목록은 `['number']`로 `schemaType`과 같은 참조다.
  - 【추론】 E27: 본체 없이 `then a:['string','number']` / `else a:'number'`는 배타인 두 노드(union과 number)다.
  - 【추론】 E28: `{type:['string','number'], options:{terminal:false}}`는 `TERMINAL_OPTION_UNSUPPORTED`.
  - 【추론】 E29: `{nullable:true, anyOf:[{type:'string'},{type:'number'}]}`는 union / `['string','number']` / false / terminal(형 없는 `nullable`은 효과 없음).
  - 【추론】 E30: `{type:['string','null'], allOf:[{type:['number','null']}]}`는 null / `'null'` / true / terminal(교집합 `{null}`).
  - 【추론】 E31: `{type:['string','number'], allOf:[{type:['string','boolean']}]}`는 string / `'string'` / false / terminal.
  - 【추론】 E32: `{anyOf:[{type:'null'}]}`는 null / `'null'` / true / terminal.
  - 【추론】 E33: `{oneOf:[{type:'null'}], anyOf:[{type:'null'}]}`는 null / `'null'` / true / terminal.
  - 【추론】 E34: `{anyOf:[{type:['string','null']},{type:'number'}]}`는 union / `['string','number']` / true / terminal.
  - 【추론】 E35: `{anyOf:[{type:'string',nullable:true},{type:'number'}]}`는 union / `['string','number']` / true / terminal.
  - 【추론】 E36: `{type:'integer', allOf:[{type:'number'}]}`는 number / `'integer'` / false / terminal(오늘과 같음).
  - 【추론】 E37: `{type:'string', allOf:[{type:['string','null']}]}`는 string / `'string'` / false / terminal(오늘과 같음).
  - 【추론】 E38: `{type:['string','number','null'], allOf:[{type:['string','boolean','null']}]}`는 string / `'string'` / true / terminal.
  - 【추론】 E39: `{allOf:[{type:['string']},{type:['string','number']}]}`와 그 순서를 뒤집은 것은 둘 다 string / `'string'` / false / terminal.
  - 【추론】 E40: 본체 `a:['string','number','boolean']` + `then1 a:'string'` + `then2 a:'boolean'`은 union / `['string','number','boolean']` / false / terminal이고, 둘 다 켜지면 `SHARED_NODE_CONFLICT`다.
  - 【추론】 E41: 본체 `a:{type:'number'}` + `if/then a:{type:'integer'}`는 number / `'number'` / false / terminal이고, 켜진 동안 유효 목록은 `['integer']`(정수 규칙)다.
  - 【추론】 E42: 본체 `a:['string','number']` + 호스트의 게이트 없는 `oneOf` 분기 `a:{type:'string'}`는 union / `['string','number']` / false / terminal이고, 분기는 유효 목록을 좁히지 않는다.
  - 【추론】 ERROR-164의 `UNKNOWN_JSON_SCHEMA` 행의 "언제"에 S0의 문법 오류, 형 없는 분기(`reviews/round-18-owner-answers.md:32`), 형 없는 칸의 빈 U와 객체·배열 분기(`:30`·`:33`)를 적는다.
  - 【추론】 ERROR-164의 `ALL_OF_TYPE_REDEFINITION` 행은 정적 연언의 교집합이 빈 경우만이며, `{null}`은 여기에 들지 않는다.
  - 【추론】 ERROR-164의 `SHARED_NODE_CONFLICT` 행에 "켜진 게이트 선언과 정적 허용 집합의 교집합이 빔"을 더한다.
  - 【추론】 ERROR-164에 경고 행 `(가칭) SCHEMA_FORM_WARNING.TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`(`warning`, 새 설계에만)을 더한다.
  - 【추론】 ajv8 플러그인의 세 진입점(`default`·`2019`·`2020`) 기본 설정에 `allowUnionTypes: true`를 더한다.
  - 【추론】 `allowUnionTypes`는 판정을 바꾸지 않고, `strictTypes`의 기본값 `"log"`가 union `type`마다 내는 `console.warn`만 없앤다.
  - 【추론】 ajv7은 이미 `strict: false`이고, ajv6에는 strict 모드가 없으므로 둘은 바꾸지 않는다.
- 근거:
  - 정본 설계: `reviews/raw-round18-union-swarm/merged-v3.md` §2(2.1–2.26, E1–E42), 5.7, 편집자 각주 3·6·11·14.
  - 소유자 답: `reviews/round-18-owner-answers.md:29`(터미널 강제), `:30`(형 없는 원시 분기), `:32`(O2), `:33`(O3), `:37`(U1–U9).
  - 검증: `reviews/raw-round18-union-swarm/out-V1.md` 지적 2(선언 사이 `integer`/`number`의 합치기), 3(nullable의 출처), 6(중복 원소), 7(청사진 경고), C-3(`allowUnionTypes`), C-4(터미널 하위 키), `reviews/raw-round18-union-swarm/out-V2.md` 지적 1(형 없는 객체·배열 호스트를 새로 받아들이지 않음), 4(`oneOf`+`anyOf`), 5(형 있는 칸의 null 분기), 12(유효 스키마 `type` 도장의 비용), 13(정적 선언의 nullable), `reviews/raw-round18-union-swarm/out-verify-O7-O8.md` O8 판정(G1 앵커 순서, G2 비단조, G3).
  - 교차 확인: `reviews/raw-round18-union-swarm/out-X-codex.md`와 `reviews/raw-round18-union-swarm/out-X-antigravity.md`가 둘 다 형 없는 칸의 분기가 모두 null 분기인 경우를 미결정으로 지적했고, E32·E33이 이를 null 노드로 닫는다.
  - 【편집자 14】 게이트 선언만 있는 이름(E27)에는 정적 노드가 없어 "게이트는 종류를 바꾸지 않는다"를 적용할 대상이 없으므로, BLUEPRINT-011·012를 그대로 두고 각 노드 안의 좁힘에만 U4를 적용한다.
  - 오늘: `src/helpers/jsonSchema/extractSchemaInfo/extractSchemaInfo.ts:23,25,28-29` → `src/core/nodes/schemaNodeFactory.ts:116`(`UNKNOWN_JSON_SCHEMA`), `src/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/processSchemaType.ts:65,73`(교집합), `src/helpers/jsonSchema/processAllOfSchema/processAllOfSchema.ts:45-50`(`ALL_OF_TYPE_REDEFINITION`), `src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/getCompositionNodeMapList.ts:69-71`(null 분기는 건너뜀), ajv8 `node_modules/ajv/lib/compile/validate/dataType.ts:19-31`(허용 집합), `schema-form-ajv7-plugin/src/validator/validatorPlugin.ts:22`(`strict: false`)
- 게이트:
  - PR: PR-1(청사진 판정)·PR-4(ajv8 설정)
  - 무엇: `src/core/blueprint/__tests__/`의 `union.kind-procedure.test.ts`(E1–E42), `union.null-only.test.ts`, `union.static-intersection.test.ts`, `union.schema-type-invariant.test.ts`, `union.gated-narrowing.test.ts`, `union.terminal-subtree-warning.test.ts`와 `schema-form-ajv8-plugin/src/**/__tests__/union-types.test.ts`를 돌린다.
  - 통과: 예마다 종류·`schemaType`·nullable·전략·오류가 위대로이고, `allOf` 항목의 순서를 바꿔도 결과(원소 순서 제외)가 같으며, ajv8 컴파일에서 `console.warn`이 0회다.
  - 실패: 예와 다르면 절차를 고치고, 절차가 예를 하나로 정하지 못하면 이 블록을 고친다.

### 18C-91 값 의미 — `isMember`·`convert`·`interpret`, 쓰기 경로, 경고등, 방출·채움, 식

- 닫는 항목: VALUE-030(보충·충돌; 문장 "바뀌면 `UpdateValue`가 알린다"는 대체), SETTLE-005(보충), ERROR-186(보충), ERROR-164(보충), CONTROLS-006(보충), CONTROLS-080(보충), FRAGMENT-007(보충), VALIDATE-007(보충), 새 항목 WRITE-093(결정), 새 항목 VALUE-037(결정), 새 항목 CONTROLS-085(결정), 새 항목 FRAGMENT-055(결정), 새 항목 ERROR-203(결정), 새 항목 VALIDATE-051(결정)
- 결정:
  - 【추론】 청사진은 union 칸마다 기본 spec `UnionSpec { kinds, mask, nullable }`을 한 번 만들어 얼리며, `kinds`는 그 칸의 `schemaType`과 같은 참조다.
  - 【추론】 유효 목록이 좁혀진 노드는 `{ kinds: 유효 목록, mask, nullable }`을 그 노드의 유효 스키마 메모 항목에 함께 둔다.
  - 【추론】 `interpret`는 노드의 현재 spec을 받으며, 좁히지 않은 노드의 현재 spec은 기본 spec 그 자체다.
  - 【추론】 노드의 유효 목록(`reviews/round-18-owner-answers.md:37`의 U4·U5)은 노드마다 계산하고, 유효 스키마 메모가 바뀔 때만 다시 계산한다.
  - 【추론】 좁히는 게이트가 없으면 유효 목록은 `schemaType`과 같은 얼린 참조를 공유하며, 이것이 흔한 경우이고 비용은 0이다.
  - 【추론】 교집합에 `'null'`만 남으면(노드가 nullable이고 게이트가 `{null}`만 허용) 유효 목록은 빈 목록이고, null이 아닌 모든 값에 경고등이 켜지며, 기본 입력은 빈 읽기 전용이다.
  - 【추론】 `isMember(value, kind)`는 JSON Schema의 뜻을 따른다.
  - 【추론】 `isMember(v, 'string')`은 `typeof v === 'string'`이다.
  - 【추론】 `isMember(v, 'number')`는 `typeof v === 'number' && Number.isFinite(v)`이다.
  - 【추론】 `isMember(v, 'integer')`는 `Number.isInteger(v)`이며 안전한 정수 범위는 보지 않는다(ajv와 같음).
  - 【추론】 `isMember(v, 'boolean')`은 `typeof v === 'boolean'`이다.
  - 【추론】 `isMember(v, 'object')`는 `typeof v === 'object' && v !== null && !Array.isArray(v)`이며 프로토타입은 보지 않는다.
  - 【추론】 `isMember(v, 'array')`는 `Array.isArray(v)`이다.
  - 【추론】 `null`은 목록이 아니라 `nullable`로만 보며, `v === null`이다.
  - 【추론】 `convert(value, kind)`는 WRITE-075를 옮긴 것이며, 이미 그 형인 값에는 부르지 않는다.
  - 【추론】 `convert(·, 'number')`는 앞뒤 공백을 뺀 전체가 JSON 수 표기이고 결과가 유한한 문자열을 `Number(t)`로 바꾸며, 소수부·지수부 없는 표기는 안전한 정수여야 하고, 불리언, `"01"`, `"1e400"`, `"9007199254740993"`은 받지 않는다.
  - 【추론】 `convert(·, 'integer')`는 `number` 변환이 되고 결과가 `Number.isSafeInteger`인 문자열을 바꾸며(`"1.0"`→`1`, `"1e2"`→`100`), 이미 수인 값(자르지 않음), `"1.5"`, `"1e16"`은 받지 않는다.
  - 【추론】 `convert(·, 'string')`은 유한한 수를 `String(n)`으로(`-0`→`"0"`), 불리언을 `"true"`·`"false"`로 바꾸며, `NaN`·`±Infinity`, `null`, 객체, 배열은 받지 않는다.
  - 【추론】 `convert(·, 'boolean')`은 정확히 `"true"`·`"false"`와 수 `1`→`true`, `0`·`-0`→`false`를 바꾸며, `" true"`, `"1"`, 그 밖의 수는 받지 않는다.
  - 【추론】 `convert(·, 'object')`와 `convert(·, 'array')`는 아무것도 받지 않는다(`reviews/round-18-owner-answers.md:29`).
  - 【추론】 `interpret(value, spec)`는 `undefined`이면 `undefined`, `null`이면 `null`(VALUE-033), 멤버이면 참조 그대로를 돌려준다.
  - 【추론】 그 밖에는 목록의 형마다 `convert`를 해서 성공한 결과를 `===`로 중복 없이 세고, 결과가 정확히 하나면 그 값을, 아니면 `value`를 돌려준다(`reviews/round-18-owner-answers.md:24`).
  - 【추론】 `interpret`는 순수하고, 던지지 않으며, 멱등이고, 바꾸지 못하면 항등이다(WRITE-084).
  - 【추론】 후보는 배열에 모으지 않고 개수와 첫 결과만 세며, 할당 없이 구현한다.
  - 【추론】 원소가 하나인 목록은 단일 노드의 행과 같다: `['integer','number']`는 number 규칙을 따른다.
  - 【추론】 `['integer','number','boolean']`의 `"2"`는 결과가 둘이지만 같은 값이므로 `2`다.
  - 【추론】 둘 이상의 형이 받아 주는 경우는 정확히 목록 ⊇ {string, boolean}, 목록 ∩ {number, integer} = ∅, 값 ∈ {0, -0, 1}일 때이며, `object`·`array`가 있고 없음에 따라 4종 × 값 3개로 12건이다.
  - 【추론】 그 증명: 문자열은 `number`·`integer`(같은 결과)와 `boolean`(`"true"`·`"false"`, 수 표기가 아님)이 받아 둘이 겹치지 않고, 불리언은 `string` 하나만 받으며, 비유한 수·`null`·객체·배열·그 밖의 값은 아무 형도 받지 않고, 유한한 수는 `string`(늘)과 `boolean`(`0`·`-0`·`1`)이 받는다.
  - 【추론】 전수 실행(`reviews/raw-round18-union-swarm/d-rule-a.mjs`, 목록 127개 × nullable 2 × 값 40종 × 모든 순열)에서 경우는 12건이고 순서 위반과 멱등 위반은 0이므로, 규칙 A는 선언 순서와 무관하다.
  - 【추론】 `interpret`는 노드에 드는 모든 쓰기의 경계에서 한 번 돈다(WRITE-056).
  - 【추론】 그 쓰기는 입력 쓰기(옵션 없음·`Merge`·`Overwrite`, WRITE-080), `setValue(V)`와 로드(마운트·`reset()`·`resetSubtree()`, WRITE-090), 조상 쓰기가 나눠 준 값(WRITE-018, WRITE-082), 채움(WRITE-090), `controls.derived`(WRITE-011), union 노드 자체를 대상으로 한 `controls.injectTo`(WRITE-012), `unsetValue`와 나감의 비움, 포커스 아웃 `trim`(WRITE-083)이다.
  - 【추론】 한 진입에서 쓰인 값의 두 번 해석(`reviews/round-18-owner-answers.md:37`의 U7)에서 첫째 해석의 목록은 직전 커밋의 유효 목록이고, 마운트·`reset()`이면 `schemaType`이다.
  - 【추론】 둘째 해석은 그 진입의 전이 단계에서 커밋 전에 하며, 목록이 바뀐 노드에서만 결과를 바꾼다(`interpret`가 멱등).
  - 【추론】 그래서 `setValue({kind:'num', a:'42'})`는 직전 상태와 상관없이 `a = 42`이다.
  - 【추론】 union 노드에 대한 `Merge` 쓰기는 늘 값 전체를 바꾼다: union은 객체 호스트가 아니다(WRITE-079).
  - 【추론】 union 값 안(`/slot/key`)을 가리키는 `controls.injectTo` 대상은 동적 대상 없음 `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING`이다(CONTROLS-079).
  - 【추론】 어긋난 값을 로드하면 바꾸지 않고 그대로 들고, 경고등을 켜며, 받은 그대로 방출한다(WRITE-054, VALUE-033).
  - 【추론】 `trim`은 union 행의 `finishInput`이 맡으며, 현재 값이 문자열이면 자르고 그 결과를 `interpret`에 넘기고, 문자열이 아니면 아무것도 하지 않으며, 경고는 없다(CONTROLS-006).
  - 【추론】 `valueTypeMismatch = raw !== undefined && !(raw === null && nullable) && !isMemberOfEffectiveList(raw)`이며, 원본과 노드의 현재 spec만의 함수다.
  - 【추론】 경고등은 커밋 때 원본이 바뀐 노드와, 같은 정착에서 유효 스키마가 바뀐 노드에서 다시 계산한다.
  - 【추론】 경고등은 그 노드의 경로가 루트의 경로 집합에 들어가는 커밋에 켜진다(ERROR-186).
  - 【추론】 `VALUE_TYPE_MISMATCH`는 경고등이 켜질 때마다 한 번 보내고, 켜진 채 다른 어긋난 값이 와도 다시 보내지 않는다.
  - 【추론】 경고등이 꺼졌다 켜지거나, 노드가 형상을 나갔다 들어오거나, 로드로 경로 집합을 다시 만들거나, 게이트가 좁혀 켜지면 다시 보낸다.
  - 【추론】 쓰기 없이 경고등만 바뀐 노드를 배달하는 통지는 유효 스키마 변경 통지 `UpdateJsonSchema`(가칭, EVENT-064)다(SETTLE-007, EVENT-045).
  - 【추론】 VALUE-030의 "바뀌면 `UpdateValue`가 알린다"는 "값이나 유효 스키마가 바뀌면 그 통지(`UpdateValue`·`UpdateJsonSchema`)가 알린다"로 고친다.
  - 【추론】 `VALUE_TYPE_MISMATCH` 기록은 `{ level: 'warning', code, path, expected: { schemaType, nullable, effective }, received, reason, candidates?, source }`이다(ERROR-186, EVENT-060).
  - 【추론】 `expected.schemaType`은 `node.schemaType`이고, `expected.effective`는 그 커밋의 유효 목록이다.
  - 【추론】 `received`는 `'string'|'number'|'integer'|'nonFinite'|'boolean'|'null'|'object'|'array'|'other'` 가운데 하나다.
  - 【추론】 `reason`은 받아 줄 형이 없으면 `'unconvertible'`, 둘 이상이면 `'ambiguous'`이고, `candidates`는 `'ambiguous'`일 때만 `['string','boolean']`으로 싣는다.
  - 【추론】 `source`는 EVENT-060의 쓰기 출처 값에 `'gate'`를 더한 것이다.
  - 【추론】 `valueTypeMismatches`는 켜졌으면 `[path]`, 아니면 공유하는 얼린 빈 배열이며, 커밋 번호로 메모하고 객체·배열 값의 안쪽 경로는 넣지 않는다.
  - 【추론】 `valueTypeMismatch === false`는 값이 이 노드 유효 목록의 형이거나, 없거나, 노드가 nullable일 때 `null`이라는 뜻일 뿐 검증 통과를 뜻하지 않으며, 이 문구를 `FormTypeInputProps`와 게터의 주석에 같이 적는다(SURFACE-052).
  - 【추론】 게이트가 `null`을 빼는 것은 검증 전용이다.
  - 【추론】 union은 잎이므로 방출이 없을 때의 자리는 VALUE-034 그대로이며, 루트는 `undefined`이고 배열 아이템 자리는 `null`이다.
  - 【추론】 그래서 `omitEmpty`가 켜진 union 아이템이 `{}`를 들면 `null`이 방출되고, `{}`를 남기려면 작성자가 `omitEmpty: false`를 적는다.
  - 【추론】 방출은 원본을 참조 그대로 내며, 객체·배열을 복사하지 않는다(VALUE-012, WRITE-013).
  - 【추론】 터미널 object·array 노드와, 객체·배열을 받는 union이 통째로 든 값의 안쪽은 폼이 정규화하지 않는다.
  - 【추론】 그 안쪽의 JSON 부정합(`undefined`인 키, 배열 중간의 `undefined`·빈 자리, 비유한 수, `Date`·함수·bigint)은 VALIDATE-007을 어길 수 있다(예: `{type:['object','string'], minProperties:1}`의 `{a: undefined}`는 메모리 판정을 통과하고 직렬화 뒤 판정에서 실패한다).
  - 【추론】 개발 모드에서는 그런 값의 참조가 바뀐 커밋마다 깊이 점검하고, 부정합이 있으면 `(가칭) SCHEMA_FORM_WARNING.NON_JSON_WHOLE_VALUE`를 `(code, path)`로 로드마다 한 번 내며, 기록은 `{ path, innerPaths }`(앞의 N개)다.
  - 【추론】 프로덕션에서는 그 점검을 하지 않으며, 이 한계를 문서에 적는다.
  - 【추론】 채움 값(`reviews/round-18-owner-answers.md:29`)은 노드가 생길 때 원본이 `undefined`인 경우에만 한 번 들어가며, `interpret`(두 번 해석 포함)를 지난다.
  - 【추론】 그래서 로드된 `{}`는 이미 있는 값이며 `default`로 덮이지 않고, 이는 객체 호스트가 `{}`도 채움을 받는 것(WRITE-082)과 다르다.
  - 【추론】 목록 밖 `default`(예: `['string','boolean']`에 `default: 0`)는 마운트 때 경고등을 켜고, `source: 'fill'`, `reason: 'ambiguous'`로 경고를 한 번 보낸다.
  - 【추론】 `default`의 객체·배열은 복사하지 않고 불변으로 다룬다(WRITE-071).
  - 【추론】 게이트와 식은 어긋난 값도 거르거나 변환하지 않고 보므로, `['number','string']` 판별 키에 기본 입력으로 친 `"1"`은 `const: 1` 분기를 켜지 않는다(CONTROLS-074, FRAGMENT-008).
  - 【추론】 CONTROLS-080 (5)에 식의 경로가 객체의 자기 키와 배열의 색인으로만 내려가고 원시 값 아래는 `undefined`라는 것(`reviews/round-18-owner-answers.md:29`)을 보충하며, 그래서 union 값이 `"abc"`일 때 `./slot/length`는 `undefined`다.
  - 【추론】 판별 키가 union이어도 FRAGMENT-007의 분기 규칙은 그대로다(BLUEPRINT-017).
  - 【추론】 분기의 `const`·`enum` 리터럴의 JSON 종류가 판별 키의 목록(`schemaType`, 원소 하나인 경우 포함)과 nullable 어디에도 없으면, 청사진이 개발 모드 경고 `(가칭) SCHEMA_FORM_WARNING.DISCRIMINATOR_BRANCH_UNREACHABLE`을 낸다.
  - 【추론】 ERROR-164에 경고 행 `DISCRIMINATOR_BRANCH_UNREACHABLE`과 `NON_JSON_WHOLE_VALUE`(둘 다 `warning`, 새 설계에만)를 더한다.
  - 【추론】 core는 검증에 넘기는 값을 복사하지 않는다(VALIDATE-049).
  - 【추론】 어긋난 union 값의 형 에러와 union 객체·배열 값 안쪽의 에러는 union 노드가 받고, `dataPath`는 그대로 둔다(VALIDATE-043 (4)).
  - 【추론】 규칙 A와 경고등은 검증기를 쓰지 않으며, 형 밖의 제약(`enum`, `properties`·`items`, 그 밖의 키워드)과 게이트가 뺀 `null`은 검증기가 판정한다(BLUEPRINT-033, P1′).
  - 【추론】 멤버십은 얕게만 보며, 통째로 든 값 안의 JSON 부정합은 `NON_JSON_WHOLE_VALUE` 개발 모드 경고로만 드러내고 폼은 값을 정규화하지 않는다(VALIDATE-007).
- 근거:
  - 정본 설계: `reviews/raw-round18-union-swarm/merged-v3.md` §3(3.1–3.32), 5.2, 5.8–5.10, 편집자 각주 2·7·8·13.
  - 소유자 답: `reviews/round-18-owner-answers.md:9`(S1 셋째, 경고등), `:24`(받아 줄 형이 정확히 하나), `:29`(변환 없음, 식, `omitEmpty`, 채움 값), `:37`(U4–U7, U9).
  - 실행: `reviews/raw-round18-union-swarm/d-rule-a.mjs`의 전수 실행(`tieCount: 12`, 순서·멱등 위반 0)과 `reviews/raw-round18-union-swarm/out-V2.md` 머리 문단의 재현. ajv 8.17.1은 `['string','number']`의 `true`를 선언 순서에 따라 `"true"`로 바꾼다(`reviews/raw-round18-union-swarm/d-ajv-if.cjs`).
  - 검증: `reviews/raw-round18-union-swarm/out-V1.md` 지적 9(`object` 멤버십), 10(규칙 A가 읽는 목록의 정의), 12(터미널 `Merge`), `reviews/raw-round18-union-swarm/out-V2.md` 지적 3(union 채움과 VALUE-034), 6(객체 멤버십을 다시 열지 않음), 14(`Merge`는 WRITE-079가 이미 답함), 15(경고 코드의 ERROR 행), `reviews/raw-round18-union-swarm/out-verify-O7-O8.md` O7 판정(F1 한 진입의 두 목록, F7–F11 통지·`source`·재판정·문구·`expected`).
  - 교차 확인: `reviews/raw-round18-union-swarm/out-X-antigravity.md`가 지적한 "본체 union 노드에 `then` 좁힘이 적용될 때 입력·규칙 A와 검증기 간의 교착"은 게이트가 켜진 동안 규칙 A와 기본 입력이 유효 목록을 읽는 것(U4; 그 실패 장면을 까닭으로 든 `reviews/raw-round18-union-swarm/rulings-2.md` S4)으로 풀린다.
  - 【편집자 7】 `INJECT_TARGET_MISSING`은 원장 CONTROLS-079(`ledger/controls.md:1153`, "청사진에 없거나 터미널 아래는 모두 동적 대상 없음")를 따른다.
  - 【편집자 8】 판별 경고는 폐기된 `NULLABLE_ONE_OF_NULL_UNREACHABLE`(ERROR-162)과 오류인 `DISCRIMINATOR_MISMATCH` 대신 같은 `…_UNREACHABLE` 이름 계열로 새로 둔다.
  - 【편집자 13】 VALIDATE-007에는 기존 개발 모드 점검이 없어서(`ledger/validate.md`의 VALIDATE-007은 결정 문장 하나뿐) `NON_JSON_WHOLE_VALUE`를 새 코드로 두며, 이름은 PR-4에서 확정한다.
  - 오늘: `src/core/nodes/AbstractNode/AbstractNode.ts:716-718`·`schema-form-ajv8-plugin/src/validator/createValidatorFactory.ts:23-25`(검증에 값을 참조로 넘김), `src/core/nodes/AbstractNode/utils/ValidationManager/ValidationManager.ts:150`(노드를 찾지 못한 에러는 버림)
- 게이트:
  - PR: PR-2(행·`interpret`·경고등·두 번 해석·방출)·PR-4(검증 에러의 귀속과 경고 코드 확정)
  - 무엇: `src/core/behaviors/utils/parse/__tests__/interpret.table.test.ts`·`interpret.properties.test.ts`, `src/core/behaviors/unionBehavior/__tests__/union.write-paths.test.ts`·`union.mismatch-light.test.ts`, 렌더 시나리오 `union.gated-effective-list`·`union.entry-two-step`·`union.rule-a`·`union.ambiguous`·`union.integer`·`union.object-array`·`union.non-json-value`·`union.omit-empty`·`union.default-fill`·`union.expressions`를 돌린다.
  - 통과: 변환 표의 모든 칸, 전수 실행의 12건·순서 무관·멱등·쓰기당 할당 0, 쓰기 경로마다의 사례, 경고등의 켜짐·재발송 규칙과 기록 칸이 위대로다.
  - 실패: 전수 실행에서 12건 밖의 경우나 순서 위반이 나오면 `convert` 표를 고치고, 규칙이 사례를 하나로 정하지 못하면 이 블록을 고친다.

### 18C-92 입력 바인딩 — 기본 union 입력, 시험 객체의 모르는 키, 우선순위, 플러그인 계약 문구

- 닫는 항목: BLUEPRINT-033(보충), NODE-056(보충; 문장 "`type`에 적힌 순서로 부른다"는 대체), REACT-027(보충), 새 항목 REACT-033(결정; REACT 영역, 시험 객체의 모르는 키), ERROR-164(보충), BLUEPRINT-042(보충), BLUEPRINT-043(보충), BLUEPRINT-034(대체; (4)의 기본 입력 문장), 새 항목 ERROR-203(결정)
- 결정:
  - 【추론】 기본 입력은 친 글에 core와 같은 `interpret`를 유효 목록으로 적용하고, 결과가 목록의 한 형일 때만 그 결과를 보낸다.
  - 【추론】 그래서 `['number','string']`에서 보내는 값은 늘 문자열이고(`"42"`는 이미 멤버), 게이트가 목록을 `['number']`로 좁힌 동안에는 `42`다.
  - 【추론】 NODE-056의 parse를 부르는 쪽에 기본 union 입력(쓰지 않는 호출)을 더하고, "`type`에 적힌 순서로 부른다"는 문장을 지운다(규칙 A는 순서와 무관).
  - 【추론】 규칙 A를 미리 보는 공개 함수는 지금 내보내지 않으며, 입력은 `valueTypeMismatch`로 결과를 보고, 함수를 나중에 더하는 것은 추가 변화다.
  - 【추론】 시험 객체를 정규화할 때 일곱 키 밖의 키는 대조에서 빼고, 정의마다 한 번 개발 모드 경고 `(가칭) SCHEMA_FORM_WARNING.FORM_TYPE_TEST_INVALID`를 낸다.
  - 【추론】 `type`에 적힌 `'integer'`도 어떤 노드와도 맞지 않으므로 같은 경고를 낸다.
  - 【추론】 ERROR-164에 경고 행 `FORM_TYPE_TEST_INVALID`(`warning`, 새 설계에만)를 더한다.
  - 【추론】 시험 대조의 예는 N1 = `['string','number']`, N2 = `['string','number','null']`, N3 = `['object','string']`, N4 = `['string','null']`, N5 = `['integer','null']`로 아래와 같다.
  - 【추론】 `{type:'string'}`은 N4만 맞는다(종류가 string인 노드).
  - 【추론】 `{type:['string','number']}`는 N4·N5가 맞는다(string 종류 또는 number 종류이며 union이 아님).
  - 【추론】 `{type:'union'}`은 N1·N2·N3이 맞는다(모든 union).
  - 【추론】 `{type:'number'}`는 N5가 맞는다(정수 포함 모든 수 노드).
  - 【추론】 `{schemaType:'integer'}`는 N5가 맞는다(nullable 포함 정수 노드).
  - 【추론】 `{schemaType:['string','number']}`는 N4가 맞는다(`schemaType`이 `'string'`이나 `'number'`인 스칼라 노드).
  - 【추론】 `{type:'object'}`는 아무것도 맞지 않는다(N3은 object 노드가 아님).
  - 【추론】 `({type, schemaType}) => type === 'union' && schemaType.includes('object')`는 N3이 맞으며, 목록으로 가르는 union은 함수 시험으로 잡는다.
  - 【추론】 입력을 고르는 순서는 그대로이고 union 전용 층은 두지 않는다: 인라인 `FormTypeInput` → `formTypeInputMap` → Form의 정의 → Provider의 정의 → `PluginManager` 목록(플러그인 정의가 앞, 코어 기본 정의가 뒤)이다.
  - 【추론】 인라인이 `null`이면 입력을 그리지 않는다.
  - 【추론】 union 항목이 없는 플러그인에서는 union이 코어 기본 정의로 떨어진다.
  - 【추론】 경로 키가 union 칸 아래를 가리키는 `formTypeInputMap` 항목은 노드가 없으므로 맞지 않는다(NODE-020).
  - 【추론】 코어 기본 정의에 `{type:'union'}` 항목 하나를 더해 정의가 열한 개가 된다(BLUEPRINT-033의 "새 입력을 두지 않으며"에 대한 보충).
  - 【추론】 그 항목은 `FormTypeInputString`을 감싸 아래의 초안·표시 규칙을 더한 것이며 새 구성 요소가 아니고, 자리는 `FormTypeInputStringDefinition` 바로 앞이다.
  - 【추론】 기본 입력은 유효 목록을 `props.schemaType`과 `props.jsonSchema.type`의 교집합으로 구하며, core와 같은 내부 함수를 쓰고 `jsonSchema` 참조로 메모한다.
  - 【추론】 값이 `undefined`·`null`·문자열·수·불리언이고 유효 목록에 원시 형이 하나라도 있으면 글 상자를 보이며, 표시는 `String(value)`이고 `undefined`와 nullable 노드의 `null`은 빈 칸이다.
  - 【추론】 빈 칸은 `undefined`를 보낸다.
  - 【추론】 키 입력마다, 그리고 흐려질 때 그 순간의 유효 목록으로 `interpret`하고, 목록의 한 형이 되면 그 결과를 보낸다.
  - 【추론】 목록의 한 형이 되지 않으면 보내지 않고 초안으로 들며, 흐려지면 표시를 노드 값으로 되돌린다.
  - 【추론】 유효 목록이 바뀌면 지금 초안으로 판정을 다시 돌리고, 이제 목록의 한 형이 될 때만 보낸다.
  - 【추론】 입력기 조합 중에는 보내지 않는다.
  - 【추론】 객체·배열 값의 읽기 전용 표시(`reviews/round-18-owner-answers.md:29`)에서 문자열화 결과는 값 참조로 메모하고, 문자열화가 던지면 무효 표지만 보인다.
  - 【추론】 유효 목록에 원시 형이 없는 union(`['object','array']`, 또는 교집합이 `{null}`인 빈 목록)에 값이 없으면 빈 읽기 전용 상자를 보인다.
  - 【추론】 기본 입력으로는 그 값을 만들 수 없으며, 이는 문서에 적는 한계이고 편집기는 UI 플러그인이 맡는다.
  - 【추론】 `valueTypeMismatch`가 참이면 `aria-invalid`와 무효 표지를 붙이고, 경고등이 켜진 값을 빈 칸처럼 그리지 않는다(SURFACE-052).
  - 【추론】 union 칸에 `enum`·`const`가 있어도 기본 입력은 문자열 입력이며, 기본 enum·radio 정의를 union에 열지 않는다(BLUEPRINT-034 (4)).
  - 【추론】 그래서 `['number','string']` + `enum:[1,'a']`에서 기본 입력으로 친 `"1"`은 문자열로 남고 검증기가 기각하며, 이 사용성 빈틈은 UI 플러그인이 메운다.
  - 【추론】 `format`은 문자열 입력이 이미 하는 만큼(`password`·`email`)만 쓰며, 날짜 정의는 union에 걸리지 않는다.
  - 【추론】 기본 입력이 약속하지 않는 것은 여섯이다: `string`이 유효 목록에 있을 때 다른 원시 형을 만드는 것, 객체·배열을 만들거나 편집하는 것, 편집 모드에서 `null`을 만드는 것, 문자열 표기가 겹치는 enum 리터럴을 가르는 것, `const`·`format`·`enum`의 의미, 모양과 접근성.
  - 【추론】 `FormTypeInputProps` 주석과 플러그인 문서에 다음 계약 문구를 싣는다.
    > union 입력은 `type === 'union'`일 때 다음을 읽는다. `schemaType`: 목록이며, 순서에 core의 뜻은 없다. `nullable`, `value`, `valueTypeMismatch`, `required`. `jsonSchema`: `jsonSchema.type`은 켜진 선언의 교집합이며, 형 없는 칸에서는 없을 수 있다. 게이트가 좁힌 목록은 `schemaType`과 `jsonSchema.type`의 교집합이다.
    > 보내는 값은 JSON 형이 목록에 있는 값이나 `undefined`다. `null`은 nullable일 때 비우기 조작으로만 보내고, 빈 칸은 `undefined`로 보낸다. `value`는 어긋난 값일 수 있으므로 `onChange`보다 넓은 형이다.
    > 치다 만 글과 입력기 조합 중인 글은 입력이 초안으로 들고, 흐려지면 노드 값으로 되돌린다.
    > 목록 밖의 값을 보내도 오류가 아니고 버려지지도 않는다. core의 규칙 A가 받아서, 받아 줄 형이 정확히 하나면 그 형으로 바꾸고, 아니면 그대로 두고 경고등을 켠다. 게이트가 목록을 좁힌 동안에는 좁혀진 목록으로 해석한다. 입력은 이 결과를 다음 렌더의 `valueTypeMismatch`로 안다. `valueTypeMismatch === false`는 검증 통과가 아니다.
    > 객체·배열 값은 불변으로 다룬다. 바꿀 때는 새 참조를 보내고, 받은 값을 제자리에서 바꾸지 마라. 값 안에 JSON이 아닌 것(`undefined`인 키, `Date` 등)을 넣지 마라.
    > 목록의 순서에 기대지 마라. core가 사용자가 뜻한 형을 골라 준다고 가정하지 마라.
- 근거:
  - 정본 설계: `reviews/raw-round18-union-swarm/merged-v3.md` 3.33, §4(4.8–4.23)와 플러그인 계약 문구, 편집자 각주 9·15.
  - 소유자 답: `reviews/round-18-owner-answers.md:24`(기본 입력은 문자열 입력, `formTypeDefinitions`는 UI 없는 경우의 최소 구현), `:29`(객체·배열의 읽기 전용 표시와 비우기), `:35`(목록 출처), `:36`(Hint·props·시험 객체), `:37`(U9의 초안 재판정).
  - 검증: `reviews/raw-round18-union-swarm/out-V1.md` 지적 4(`Hint.type`의 옛 안이 남음), 8(미리보기 함수의 인자와 공개 여부), `reviews/raw-round18-union-swarm/out-V2.md` 지적 8(시험 객체와 노드의 `schemaType` 배열이 같은 이름에 다른 뜻), 10(기본 입력의 enum·radio 확장은 BLUEPRINT-034 (4)를 다시 엶), 15(경고 코드의 ERROR 행).
  - 【편집자 9】 R12(공개 미리보기 없음)와 NODE-056("부르는 쪽은 `interpret` 칸뿐")을 함께 지키려면 기본 입력이 같은 내부 함수를 부르는 것을 NODE-056에 더해야 한다.
  - 【편집자 15】 기본 입력이 유효 목록을 얻는 자리는 공개 props를 늘리지 않는 쪽(`schemaType`과 `jsonSchema.type`의 교집합)을 택했다. 플러그인도 같은 두 칸으로 알 수 있다.
  - 오늘: `src/formTypeDefinitions/index.tsx:14-25`(정의 열 개, `:23` `FormTypeInputStringDefinition`), `src/formTypeDefinitions/FormTypeInputString.tsx:22-26`(`password`·`email`), `src/helpers/formTypeInputDefinition/formTypeInputDefinitions.ts:44-58`(모든 키를 비교), `src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts:32-33`, `src/app/plugin/PluginManager.ts:77-79`(우선순위)
- 게이트:
  - PR: PR-7(렌더 계층과 바인딩)
  - 무엇: `src/__tests__/scenarios/union.input-binding.render.test.tsx`(시험 대조의 모든 칸, 인라인 우선, `FORM_TYPE_TEST_INVALID` 1회, `{typo: undefined}`의 대조, 정수 노드 props의 `type === 'number'`와 `schemaType === 'integer'`), `union.default-input-draft.render.test.tsx`, `union.object-array.render.test.tsx`의 기본 입력 부분을 돌린다.
  - 통과: 초안·표시·비우기·무효 표시와 시험 대조가 위대로다.
  - 실패: 기본 입력이 목록 밖 값을 보내거나 초안을 쓰면 감싸개를 고치고, 규칙이 입력 사례를 하나로 정하지 못하면 이 블록을 고친다.

### 18C-93 이주, 시험, 비용 — union 설계의 오늘 → 새 설계

- 닫는 항목: LANDING-129(보충), LANDING-130(그대로), LANDING-125(그대로), LANDING-151(보충), 새 항목 LANDING-172–LANDING-197(아래 이주 행), 새 항목 LANDING-198(점검), 새 항목 TEST-077(결정), 새 항목 TEST-078(결정)
- 결정:
  - 이주(LANDING-129, 보충): `['string','number']`처럼 null 없는 두 형과 원소가 셋 이상인 `type` 배열은 오늘 `UNKNOWN_JSON_SCHEMA`이고(`src/helpers/jsonSchema/extractSchemaInfo/extractSchemaInfo.ts:25,28-29` → `src/core/nodes/schemaNodeFactory.ts:116`), 새 설계에서는 union 잎(+nullable)이며 기본 입력은 `{type:'union'}` 감싸개다(18C-92).
  - 이주(LANDING-130): `['integer','number']`는 오늘 같은 오류이고(`extractSchemaInfo.ts:28-29`), 새 설계에서는 number 노드이며 `schemaType`은 `'number'`다.
  - 이주(LANDING-172): `['object','string']`·`['object','array']`·`['array','string']`은 오늘 `UNKNOWN_JSON_SCHEMA`이고(`extractSchemaInfo.ts:28-29` → `schemaNodeFactory.ts:116`), 새 설계에서는 터미널 강제 union이며 안쪽 `find`는 없고 `{}`·`[]`를 방출하려면 `omitEmpty: false`를 적는다(`reviews/round-18-owner-answers.md:29`).
  - 이주(LANDING-173): `type`이 배열이고 `nullable:true`가 함께 있으면(`{type:['string'], nullable:true}` 같은 비 union 포함) 오늘은 배열 경로가 `nullable`을 보지 않고(`extractSchemaInfo.ts:24-34`), 새 설계에서는 `nullable: true`다.
  - 이주(LANDING-174): 형 없는 원시 `anyOf`·`oneOf`(TypeBox, pydantic, zod)는 오늘 `UNKNOWN_JSON_SCHEMA`이고(`extractSchemaInfo.ts:23`), 새 설계에서는 union·원시 잎(+nullable)이다(`reviews/round-18-owner-answers.md:30`).
  - 이주(LANDING-175): 형 없는 칸의 분기가 모두 null 분기인 것(`{anyOf:[{type:'null'}]}`)은 오늘 같은 오류이고(`extractSchemaInfo.ts:23`), 새 설계에서는 nullable null 노드다.
  - 이주(LANDING-176): 형 없는 `{allOf:[{type:'string'}]}`는 오늘 병합 처리기가 없어 오류이고(`src/helpers/jsonSchema/processAllOfSchema/processAllOfSchema.ts:31-32`), 새 설계에서는 string 노드다.
  - 이주(LANDING-177): `['null','null']`은 오늘 nullable null 노드이고(`extractSchemaInfo.ts:28,30`), 새 설계에서는 `UNKNOWN_JSON_SCHEMA`다.
  - 이주(LANDING-178): nullable 기반에 붙은 형 없는 `allOf` 항목 `{nullable:false}`는 오늘 null을 빼고(`src/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/processSchemaType.ts:57,65-67`), 새 설계에서는 효과가 없다.
  - 이주(LANDING-179): `{type:['string','null'], allOf:[{type:['number','null']}]}`는 오늘 `ALL_OF_TYPE_REDEFINITION`이고(`winglet/json-schema/src/filters/isCompatibleSchemaType.ts:62-68`), 새 설계에서는 nullable null 노드다.
  - 이주(LANDING-180): `{type:'number', allOf:[{type:['number','string']}]}`는 오늘 `ALL_OF_TYPE_REDEFINITION`이고(`processAllOfSchema.ts:45-50` ← `validateCompatibility.ts:21-25` ← `isCompatibleSchemaType.ts:77-83`), 새 설계에서는 교집합인 number 노드다.
  - 이주(LANDING-181): `Hint.type`·`FormTypeInputProps.type`은 오늘 `node.schemaType`이고(`src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts:70`, `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:124`), 새 설계에서는 `node.type`이며 정수 노드는 `'integer'`에서 `'number'`로 바뀌고 새 칸 `schemaType`이 생긴다(`reviews/round-18-owner-answers.md:36`).
  - 이주(LANDING-182): `{type:['number','integer']}` 시험(코어 `src/formTypeDefinitions/FormTypeInputNumber.tsx:44`, antd5·antd6 Number `:62`·Slider `:53`, antd-mobile Number `:51`, mui Number `:120`)은 새 설계에서 `{type:'number'}`이고, 정수만이면 `{schemaType:'integer'}`다.
  - 이주(LANDING-183): 함수 시험의 `type === 'integer'` 절(antd5·antd6 RadioGroup `:86`, antd-mobile RadioGroup `:91`·Slider `:59`, mui RadioGroup `:125`·Slider `:114`)은 죽은 조건이므로 지운다(TS2367로 드러남).
  - 이주(LANDING-184): mui 수 입력은 오늘 빈 칸이 `null`이고(`schema-form-mui-plugin/src/formTypeInputs/FormTypeInputNumber.tsx:74-76`), 정수를 `type === 'integer'`로 판정해 `parseInt`로 자르며(`:81`), `step`을 쓴다(`:109`). 새 설계에서는 빈 칸이 `undefined`, 판정은 `schemaType === 'integer'`, 자르지 않음, 해석할 수 없는 글은 초안이다(REACT-027, WRITE-075).
  - 이주(LANDING-185): `FormTypeTestObject` 형 선언은 오늘 `type: JSONSchemaType | JSONSchemaType[]`이고(`src/types/formTypeInput.ts:163`), 새 설계에서는 `type: SchemaNodeType | SchemaNodeType[]`와 새 키 `schemaType`이다.
  - 이주(LANDING-186): 시험 객체의 모르는 키는 오늘 모든 키를 비교해 `{typo: undefined}`가 우연히 맞고(`src/helpers/formTypeInputDefinition/formTypeInputDefinitions.ts:44-58`), 새 설계에서는 대조에서 빼고 개발 모드 경고를 낸다(18C-92).
  - 이주(LANDING-187): 코어 기본 입력 정의는 오늘 열 개이고(`src/formTypeDefinitions/index.tsx:14-25`), 새 설계에서는 `{type:'union'}` 감싸개를 더해 열한 개다.
  - 이주(LANDING-188): 가드 `isTerminalNode`·`isBranchNode`는 오늘 `node.group`을 보고(`src/core/nodes/filter.ts:77,198`) `isTerminalNode`의 반환 형은 `BooleanNode | NumberNode | StringNode | NullNode`이며(`:197`), 새 설계에서는 `strategy`를 보고 반환 형에 `UnionNode`가 더해지며 좁힌 뒤 `switch (node.type)`에 `case 'union'`이 필요하다(18C-89).
  - 이주(LANDING-189): `InferValueType`의 `as const` `type` 배열은 오늘 `any`이고(`src/types/value.ts:10-15`), 새 설계에서는 정확한 합 형이며 새 형 오류가 날 수 있다.
  - 이주(LANDING-190): `InferJSONSchema<A|B>`는 오늘 분배되어 `StringNode | NumberNode`이고(`src/types/jsonSchema.ts:40-88`), 새 설계에서는 `UnionSchema`와 `UnionNode`다.
  - 이주(LANDING-191): `SchemaNode` 합집합과 `FormTypeRendererProps.type`에는 오늘 `UnionNode`와 `'union'`이 없고(`src/types/formTypeRenderer.ts:21`), 새 설계에서는 망라 `switch`에 `case 'union'`을 더한다.
  - 이주(LANDING-192): `coerceTypes`·`useDefaults`·`removeAdditional`을 켠 ajv 인스턴스의 `bind`는 오늘 받아들이고 살아 있는 폼 값이 제자리에서 바뀌며(`schema-form-ajv8-plugin/src/default/validatorPlugin.ts:46`, `src/core/nodes/AbstractNode/AbstractNode.ts:718`, `schema-form-ajv8-plugin/src/validator/createValidatorFactory.ts:23-25`), 새 설계에서는 `bind`가 `VALIDATOR_BIND_REFUSED`를 던지므로 폼에는 값을 바꾸지 않는 인스턴스를 따로 만들어 넘긴다(`reviews/round-18-owner-answers.md:34`).
  - 이주(LANDING-193): 검증기에 넘기는 스키마 사본은 오늘 얕고(`createValidatorFactory.ts:19-22`, `src/helpers/jsonSchema/stripSchemaExtensions/stripSchemaExtensions.ts:32-36`), 새 설계에서는 깊은 사본을 한 번 만든다(`reviews/round-18-owner-answers.md:34`).
  - 이주(LANDING-194): ajv8에서 union `type`은 오늘 `strictTypes` 로그 경고를 내고(`schema-form-ajv8-plugin/src/default/validatorPlugin.ts:15-19`에 `strict` 없음, `node_modules/ajv/lib/core.ts:250`의 기본 `"log"`), 새 설계에서는 경고가 없다(`allowUnionTypes`, 18C-90).
  - 이주(LANDING-195): 터미널 아래 경로의 검증 에러는 오늘 버려지고(`src/core/nodes/AbstractNode/utils/ValidationManager/ValidationManager.ts:150`), 새 설계에서는 터미널(union) 노드가 받는다(18C-91).
  - 이주(LANDING-125, 그대로): 단일 노드 파서(`parseNumber`는 숫자가 아닌 문자를 지우고 `Math.trunc`로 자름 `src/core/parsers/parseNumber.ts:31-39`, `parseBoolean`은 참 거짓 판정 `parseBoolean.ts:34-41`, `parseString(true)`는 `''` `parseString.ts:34-38`)는 공통 이주를 따른다(WRITE-075의 변환 목록, 실패는 값 보존과 경고등).
  - 이주(LANDING-196): 기본 입력의 빈 칸과 초안은 오늘 문자열 입력이 글을 그대로 보내고(`src/formTypeDefinitions/FormTypeInputString.tsx:27-29`) 수 입력이 `valueAsNumber`를 보내며(`src/formTypeDefinitions/FormTypeInputNumber.tsx:22-24`), 새 설계에서는 REACT-027을 따라 빈 칸은 `undefined`이고 해석할 수 없는 초안은 흐려질 때 되돌린다.
  - 이주(LANDING-197): 터미널 object·array 값 안의 JSON 부정합은 오늘 검사가 없고, 새 설계에서는 개발 모드 경고 `NON_JSON_WHOLE_VALUE`를 낸다(18C-91).
  - 【추론】 LANDING-151의 PR-7 이주 목록에 LANDING-181–LANDING-186을 더하고, 자사 플러그인마다 union 항목(권장)을 둔다.
  - 【추론】 바뀌지 않는 것: `['object','null']`은 nullable object이고, `['null']`은 null 노드다.
  - 【추론】 바뀌지 않는 것: `[]`와 `['string','string']`은 오류다.
  - 【추론】 바뀌지 않는 것: `{type:'number', allOf:[{type:'integer'}]}`와 `{type:'integer', allOf:[{type:'number'}]}`의 `schemaType`은 `'integer'`다(`processSchemaType.ts:73`, `isCompatibleSchemaType.ts:90-93`).
  - 【추론】 바뀌지 않는 것: `{type:'string', allOf:[{type:['string','null']}]}`는 nullable이 아닌 string이다.
  - 【추론】 바뀌지 않는 것: 서로소인 정적 선언(`{type:'string', allOf:[{type:'number'}]}`)은 `ALL_OF_TYPE_REDEFINITION`이다.
  - 【추론】 바뀌지 않는 것: union이 아닌 모든 노드의 `schemaType` 값.
  - 【추론】 시험 `src/core/blueprint/__tests__/union.kind-procedure.test.ts`: 예 E1–E42(18C-90)의 종류·`schemaType`·nullable·전략·오류가 모두 표대로다.
  - 【추론】 시험 같은 곳 `union.null-only.test.ts`: E30·E32·E33은 null 노드이고 nullable이며 오류가 없고, E34·E35·E38은 nullable이며, 모든 선언이 `'null'`만인 정적 연언도 null 노드다.
  - 【추론】 시험 같은 곳 `union.static-intersection.test.ts`: 모든 선언 쌍 X·Y에서 `{allOf:[X,Y]}`와 `{allOf:[Y,X]}`의 결과(원소 순서 제외)가 같고(E39), E18·E24·E31·E38은 교집합이며, E23만 `ALL_OF_TYPE_REDEFINITION`이다.
  - 【추론】 시험 같은 곳 `union.schema-type-invariant.test.ts`: 모든 코퍼스 칸에서 `Array.isArray(schemaType) === (type === 'union')`이고, 같은 칸의 노드와 배열 아이템이 같은 `schemaType` 참조를 가지며, 그 참조는 `Object.isFrozen`이다.
  - 【추론】 시험 같은 곳 `union.gated-narrowing.test.ts`: E25·E26·E41에서 게이트 전후로 `schemaType` 참조가 같고, 켜진 동안 유효 목록은 `['number']`·`['number']`(`schemaType`과 같은 참조)·`['integer']`이며, E40은 둘 다 켜지면 `SHARED_NODE_CONFLICT`이고, E42의 유효 목록은 `schemaType`과 같은 참조다.
  - 【추론】 시험 같은 곳 `union.terminal-subtree-warning.test.ts`: `['object','string']` 칸 `properties` 안의 `controls`가 경고를 한 번 내고, `$ref` 대상에서는 경고가 없으며, `options.terminal:false`는 ERROR-200이다.
  - 【추론】 시험 `src/core/behaviors/utils/parse/__tests__/interpret.table.test.ts`: 변환 표(18C-91)의 모든 칸과 `"1.0"`·`"1e2"`·`"1e16"`·`"9007199254740993"`·`"01"`·`" true"`, `NaN`·`±Infinity`·`2**60`·`-0`·bigint·`Date`(object 멤버)·`Object.create(null)`.
  - 【추론】 시험 같은 곳 `interpret.properties.test.ts`: `d-rule-a.mjs`의 전수 실행으로 순서 무관, 멱등, 변환 결과 ∈ 목록, 경우 집합이 정확히 12건, 원소 하나인 목록 = 단일 노드 행, 쓰기당 할당 0.
  - 【추론】 시험 `src/core/behaviors/unionBehavior/__tests__/union.write-paths.test.ts`: 쓰기 경로마다 한 사례이고, `Merge` 객체 V는 통째 교체이며, `trim`은 문자열 값에서만 돈다.
  - 【추론】 시험 같은 곳 `union.mismatch-light.test.ts`: 켜짐→켜짐이면 경고 0회, 꺼짐→켜짐이면 1회, 로드하면 다시 1회이고, `expected`는 `{schemaType, nullable, effective}`이며, `'ambiguous'`이면 `candidates`가 있다.
  - 【추론】 시험 `src/__tests__/scenarios/union.gated-effective-list.render.test.tsx`: E25에서 게이트가 켜진 뒤 친 `"42"`는 `42`로 저장되고, 켜기 전에 저장된 `"abc"`는 게이트가 켜지면 쓰기 없이 경고등이 켜지며 `source:'gate'` 경고가 1회 나고 `UpdateJsonSchema`로 배달되며, 게이트가 꺼지면 경고등이 꺼지고 값은 그대로이고, 입력 구성 요소는 바뀌지 않으며, E41에서 `1.5`는 켜진 동안 경고등이 켜진다.
  - 【추론】 시험 `union.entry-two-step.render.test.tsx`: 게이트 `kind==='num'`이면 `a:number`인 스키마에서 직전 `kind`가 `'text'`일 때와 `'num'`일 때 각각 `setValue({kind:'num', a:'42'})`를 부르면 둘 다 `a === 42`이고, 마운트·`reset()`도 같으며, 쓰이지 않은 형제 노드는 다시 해석되지 않는다.
  - 【추론】 시험 `union.rule-a.render.test.tsx`: 규칙 A의 사례와 `['integer','number','boolean']`의 `"2"`→`2`.
  - 【추론】 시험 `union.ambiguous.render.test.tsx`: `['string','boolean']`의 `1`·`0`은 값이 유지되고, 경고등이 켜지며, `reason:'ambiguous'`다.
  - 【추론】 시험 `union.integer.render.test.tsx`: `['integer','string']`의 `12.5`→`"12.5"`, `['integer','boolean']`의 `12.5`는 경고등이 켜짐, E4는 number 규칙.
  - 【추론】 시험 `union.object-array.render.test.tsx`: 멤버십, 변환 없음, 참조 유지, `find('/f/k') === null`, `./f/k` 식, 문자열 값에서 `./f/length`는 `undefined`, 기본 입력의 읽기 전용 JSON과 비우기, `['object','array']` 빈 상자.
  - 【추론】 시험 `union.non-json-value.render.test.tsx`: `{a: undefined}`를 든 union과 터미널 객체에서 개발 모드 `NON_JSON_WHOLE_VALUE`가 1회 나고 값은 바뀌지 않으며, 프로덕션에서는 검사하지 않는다.
  - 【추론】 시험 `union.default-input-draft.render.test.tsx`: `['number','boolean']`에서 `"4"`→`4`, `"42."`는 초안(쓰기·경고 0)이고 흐려지면 되돌림, `"true"`→`true`, 빈 칸은 `undefined`, nullable 비우기는 `null`이며, `['number','string']`에서 `"42"`는 문자열이고, 치는 도중 유효 목록이 넓어지면 초안을 다시 판정해 이제 맞는 글만 보낸다.
  - 【추론】 시험 `union.omit-empty.render.test.tsx`: `''`·`{}`·`[]`는 방출하지 않고 `omitEmpty:false`이면 방출하며, 아이템 자리는 `null`이고 값 없는 루트는 `undefined`다.
  - 【추론】 시험 `union.default-fill.render.test.tsx`: `default`는 값 전체로 들어가고, 로드된 `{}`는 덮지 않으며(객체 호스트와 대조), `['string','boolean']`+`default:0`이면 마운트 때 경고가 1회 나고, `setValue(undefined)` 뒤에는 다시 채우지 않는다.
  - 【추론】 시험 `union.expressions.render.test.tsx`: `if`+`const`에서 `"1"`과 `1`을 가르고, 판별 키 union의 분기가 켜지며, 목록 밖 리터럴이면 `DISCRIMINATOR_BRANCH_UNREACHABLE`이 한 번 난다.
  - 【추론】 시험 `union.migration-shapes.render.test.tsx`: TypeBox `anyOf[string,number]`, pydantic `anyOf[string,null]`, ts-json-schema-generator `type` 배열, OAS `nullable:true`+`type`, 그리고 LANDING-173–LANDING-180의 모양.
  - 【추론】 시험 `union.input-binding.render.test.tsx`: 시험 대조(18C-92)의 모든 칸, 인라인 `FormTypeInput` 우선, `FORM_TYPE_TEST_INVALID`(모르는 키, `type:'integer'`) 1회, `{typo: undefined}` 시험은 모르는 키를 빼고 대조, 정수 노드 props의 `type === 'number'`와 `schemaType === 'integer'`.
  - 【추론】 시험 `schema-form-ajv{6,7,8}-plugin/src/**/__tests__/bind-refusal.test.ts`: `coerceTypes`·`useDefaults`·`removeAdditional` 가운데 하나라도 켠 인스턴스의 `bind`는 `VALIDATOR_BIND_REFUSED`를 던지고 이전 인스턴스가 그대로 남으며, 세 옵션이 꺼진 인스턴스와 기본 인스턴스는 받는다.
  - 【추론】 시험 `schema-form-ajv8-plugin/src/**/__tests__/union-types.test.ts`: `{type:['string','number']}`를 컴파일할 때 `console.warn`이 0회이고, `{type:[..], nullable:true}` 컴파일 뒤에도 작성 스키마의 `type` 배열이 그대로다.
  - 【추론】 시험 `src/types/__tests__/union.type-test.ts`(tsc 전용): 형 사상(18C-89), `InferValueType`·`InferJSONSchema`의 형, union props의 `value`(판별)와 `onChange`(목록 형), `NumberNode` props의 `type === 'integer'`가 TS2367.
  - 【추론】 비용 — 청사진 판정: 로드마다 한 번이며, 비 union 칸에도 드는 로드 비용은 선언마다 `type` 파싱 O(원소 ≤ 7)과 마스크 교집합 O(1)이고, 분기 합치기는 O(분기 × 정적 연언 깊이)다; 메모리는 union 칸마다 얼린 배열 하나와 기본 spec 하나, 노드마다 0이다; 구현은 허용 집합 도우미 약 60줄(`extractSchemaInfo`와 `processSchemaType`의 형 부분 대체), 분기 합치기 약 50줄, 조각 공유 확장 약 40줄이다.
  - 【추론】 비용 — 유효 목록: 좁히는 게이트가 없으면 0(같은 참조)이고, 게이트 선언을 가진 노드는 유효 스키마 메모가 바뀔 때 O(k)의 교집합 한 번, 경고등 재계산은 O(1)이다; 메모리는 좁혀진 메모 항목마다 작은 배열 하나와 spec 하나다; 구현은 약 40줄(병합표 `type` 행 포함)이다.
  - 【추론】 비용 — 두 번 해석: 한 진입에서 쓰였고 같은 정착에서 유효 목록이 바뀐 노드마다 `interpret` 한 번 더이며, 그 밖은 멱등이라 결과가 같다; 메모리 0; 전이 단계 약 20줄이다.
  - 【추론】 비용 — 새 경고 넷(`TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`, `NON_JSON_WHOLE_VALUE`, `DISCRIMINATOR_BRANCH_UNREACHABLE`, `FORM_TYPE_TEST_INVALID`): 개발 모드나 핸들러가 있을 때만 돌며, 비용은 터미널 하위 스키마 크기, 통째 값 크기(참조가 바뀐 커밋마다), 등록 때의 키 수에 비례한다; 메모리는 중복 억제 키이고; 각 30–40줄이다.
  - 【추론】 비용 — 쓰기(`interpret`): 멤버이면 `classBits` 한 번과 AND 한 번으로 O(1)이고, 문자열 해석은 정규식 한 번과 `Number` 한 번이며, 후보를 세기만 하는 무할당 구현이 조건이다; 메모리 0; `parse/` 약 80–100줄, `unionBehavior/` 행 약 40줄이다.
  - 【추론】 비용 — 경고등: 원본이나 유효 스키마가 바뀐 노드만 커밋 때 O(1)이고 경고는 켜질 때만 보낸다; 메모리는 얼린 빈 배열 공유; 게터 두 개다.
  - 【추론】 비용 — 방출·채움: 추가 비교와 복사가 없고, 메모리와 구현이 0이다.
  - 【추론】 비용 — Hint·props: `useMemo` 안에서 필드 하나를 더 읽고(비 union에도 듦), 시험은 정의 수에 선형(오늘과 같음)이다; 메모리 0; 형 셋과 `getHint` 한 줄이다.
  - 【추론】 비용 — 기본 union 입력: 키 입력마다 O(k ≤ 6)이고, 유효 목록은 `jsonSchema` 참조가 바뀔 때만 O(k), `JSON.stringify`는 값 참조가 바뀔 때만 O(값 크기)다; 메모리는 `useState` 하나와 표시 중인 객체 값마다 출력 문자열 크기의 메모다; 감싸개 약 60–80줄이다.
  - 【추론】 비용 — 검증기: 기본 경로 0, `bind` 때 옵션 셋 검사 O(1)이다; 메모리는 스키마 깊은 사본을 (인스턴스, 루트)마다 한 번이다; 플러그인마다 약 10줄, ajv8 설정 세 줄이다.
  - 【추론】 비용 — 공개 형: 컴파일 시간은 재지 않았다(모름); `value.ts`·`jsonSchema.ts`·노드 형·props 형 약 90줄과 가드 하나다.
  - 【추론】 비용 — 플러그인 이주: 객체 시험 일곱 곳(코어 포함), 함수 시험 여섯 곳, mui 수 입력(빈 칸·초안·정수), 플러그인마다 union 항목 하나(권장)다.
- 근거:
  - 정본 설계: `reviews/raw-round18-union-swarm/merged-v3.md` §6(M1–M30과 "바뀌지 않는 것"), §9(시험 목록), §10(비용). 이주 행의 번호는 M1·M2 → LANDING-129, M3 → LANDING-130, M4–M27 → LANDING-172–LANDING-195, M28 → LANDING-125, M29 → LANDING-196, M30 → LANDING-197이다.
  - 소유자 답: `reviews/round-18-owner-answers.md:29-37`
  - 검증: `reviews/raw-round18-union-swarm/out-V2.md` 지적 2(소유자 결정 때문에 바뀌는 원장 문장을 ID로 올림), 9(이주 표가 보정 전 내용으로 남음), `reviews/raw-round18-union-swarm/out-V1.md` 빈틈 표와 넘긴 요구 표.
  - 교차 확인: `reviews/raw-round18-union-swarm/out-X-codex.md` §5가 현행 코드에서 찾은 이주 누락(단일 노드의 변환과 실패 보존, 기본 입력의 빈 칸·초안, mui 정수 입력의 자르기, 시험 객체의 `{typo: undefined}`, 비 union 배열 표기의 `nullable:true`)은 LANDING-125·LANDING-196·LANDING-184·LANDING-186·LANDING-173에 들어갔고, `reviews/raw-round18-union-swarm/out-X-antigravity.md` §5가 찾은 `isTerminalNode` 반환 형의 누락은 LANDING-188에 들어갔다.
  - 속도와 메모리 비용을 모든 변화에 적는다(`packages/canard/schema-form/CLAUDE.md:8`).
- 게이트:
  - PR: PR-7(이주 점검), 시험은 각 줄의 PR(청사진 PR-1, 행 PR-2, 검증기 PR-4, 렌더 PR-7)
  - 무엇: 이주 행마다 오늘 동작과 새 동작을 시험으로 대조하고, 자사 플러그인(antd5·antd6·antd-mobile·mui·ajv6·7·8)의 수정 목록을 LANDING-151과 대조한다.
  - 통과: 오늘과 다른 곳마다 이주 행이 있고, 시험 목록의 모든 줄이 통과한다.
  - 실패: 빠진 이주 행을 더하고, 시험이 규칙과 어긋나면 해당 블록(18C-89–18C-92)을 고친다.

## 채움 시점(WRITE-090)이 드러낸 항목

2026-09-26. T1-B 시험(`reviews/raw-round18-tests/t1b-fill-consistency.md`)이 채움 B안(WRITE-090, `reviews/round-18-owner-answers.md:26`)의 파생을 원장과 맞대어 찾은 모순과 공백(#1–#11)을 닫는다. 소유자는 오늘과 달라지는 파생 결과의 표를 보고 이의가 없었으며, 아래 블록은 모두 편집자 결정이다.

### 18C-94 로드가 아닌 쓰기의 Refresh 범위 — 원본이 실제로 바뀐 노드만, "값이 같아도 낸다"는 로드만

- 닫는 항목: LANDING-042(충돌), LANDING-095(충돌), LANDING-067(충돌), 새 항목 EVENT-071(결정), 새 항목 LANDING-199(이주 행)
- 결정:
  - 【추론】 로드가 아닌 쓰기(`setValue(V)` 포함)는 ADR 0007 §3대로 원본이 실제로 바뀐 노드에만 Refresh를 내고, 쓴 입력 자신은 제외한다.
  - 【추론】 "값이 같아도 낸다"는 로드의 새 수명에만 해당한다.
  - 이주(LANDING-199): 호출자의 `setValue(V)`(`Overwrite`)는 오늘 브랜치에도 Refresh를 내어 하위 트리 전체를 다시 마운트하고(`08-design-a-to-z.md:471`의 오늘 칸), 새 설계에서는 원본이 실제로 바뀐 노드만 다시 마운트한다.
- 근거:
  - T1-B #1(`reviews/raw-round18-tests/t1b-fill-consistency.md:41-59`): LANDING-042의 "reset과 같은 입력 판정이다"(`08-design-a-to-z.md:471`)와 LANDING-095의 "`setValue(V)`의 같은 입력 판정"(`09-landing-and-test-strategy.md:261`)은 "호출자의 전체 교체 `setValue(V)`(`Overwrite`)도 로드이므로"(`09-landing-and-test-strategy.md:94`)에 기대며, WRITE-090은 `setValue(V)`를 로드에서 뺐다.
  - 출처 규칙: GOAL-053 보충의 "그 밖의 쓰기(전체 교체·`injectTo`·전이·다른 노드의 입력)가 raw를 바꾸면 낸다"(`reviews/round-4.md:128`), EVENT-039의 "로드는 값이 같아도 원본을 새로 쓰므로", WRITE-090의 "`setValue(getValue())`는 멱등이다"(`reviews/round-18-owner-answers.md:26`), WRITE-091(쓴 입력 자신은 Refresh를 받지 않음).
  - 실패 장면: 입력 중에 리스너가 `setValue(getValue())`를 부르면 LANDING-042의 읽기로는 모든 잎 입력이 다시 마운트되어 캐럿과 IME 상태를 잃는다(T-2, GOAL-053).
- 게이트:
  - PR: PR-2(정착의 Refresh 대상)·PR-7(입력의 다시 마운트)
  - 무엇: 입력 중에 리스너가 `setValue(getValue())`를 부르는 장면과, 잎 하나만 바꾼 `setValue(V)`에서 `RequestRefresh`를 받는 노드를 센다.
  - 통과: 앞 장면은 0회, 뒤 장면은 바뀐 잎만 1회이며, 캐럿과 IME 상태가 남는다.
  - 실패: 원본이 바뀌지 않은 노드가 Refresh를 받으면 정착의 Refresh 대상을 고친다.

### 18C-95 트리 전체 순회의 예산 — 로드와, 쓰기가 닿은 하위 트리를 도는 전체 교체 쓰기

- 닫는 항목: SETTLE-017(충돌), 새 항목 SETTLE-047(결정)
- 결정:
  - 【추론】 트리 전체 순회는 로드와, 쓰기가 닿은 하위 트리를 도는 전체 교체 쓰기에서만 허용한다.
- 근거:
  - T1-B #2(`reviews/raw-round18-tests/t1b-fill-consistency.md:61-68`): SETTLE-017의 "트리 전체 순회는 로드에서만 허용한다"(`adr/0007-settle-cycle.md:48`)와 달리, 루트 `setValue(V)`는 로드가 아니면서 모든 노드의 원본을 다시 쓴다(WRITE-090).
  - 비용은 호출자가 쓴 크기에 비례한다(G6, `00-goals.md:150`).
- 게이트:
  - PR: PR-2(정착)
  - 무엇: 잎 하나의 입력 쓰기, 하위 트리의 `setValue(V)`, 루트 `setValue(V)`에서 정착이 방문하는 노드를 센다.
  - 통과: 입력 쓰기는 재계산 목록과 자동 쓰기 기록만 돌고, `setValue(V)`는 쓰기가 닿은 하위 트리를 한 번 돈다.
  - 실패: 순회가 이 범위를 넘으면 정착의 순회 범위를 고친다.

### 18C-96 `setValue(getValue())`의 멱등 범위와 잠복 원본 — 전체 교체 쓰기는 V에 없는 경로의 원본을 없음으로 만든다

- 닫는 항목: VALUE-031(충돌 줄 고침), WRITE-090(보충), 새 항목 WRITE-094(결정)
- 결정:
  - 【추론】 `setValue(V)`는 로드가 아니지만 전체 교체 쓰기로서 V에 없는 경로의 원본(잠복 원본 포함)을 없음으로 만든다(WRITE-019, WRITE-007).
  - 【추론】 잠복 원본이 지워지는 길은 나감 정책, 로드, V가 그 경로를 담지 않은 전체 교체 쓰기다.
  - 【추론】 WRITE-090의 멱등은 방출 값·채움·에지에 대한 것이다.
  - 【추론】 첫 `setValue(getValue())`는 잠복 원본과 투영으로 빠진 원본을 없음으로 만들며(VALUE-031), 둘째 호출부터는 바뀌는 것이 없다.
- 근거:
  - T1-B #3(`reviews/raw-round18-tests/t1b-fill-consistency.md:70-83`): VALUE-031의 충돌 줄은 `setValue(V)`를 로드 목록에서 빼기만 해서, 같은 항목의 "호출자가 한 번에 비우려면 `setValue(form.getValue(), SetValueOption.DisableAutomaticWrites)`를 쓴다"·"이때 투영으로 빠진 값도 없음이 된다"(`reviews/round-18-closing.md:1801-1802`)와 WRITE-019(전체 교체가 V에 없는 키를 없음으로 만듦, `adr/0013-core-does-not-rewrite-values.md:78`)에 맞선다.
  - WRITE-090의 "`setValue(getValue())`는 멱등이다"(`reviews/round-18-owner-answers.md:26`), WRITE-007의 쓰기 표.
  - 실패 장면: `omitEmpty` 필드에 `''`가 있거나 꺼진 분기에 원본이 있을 때 `setValue(getValue())`를 부르면 그 원본이 없음이 되고 `UpdateValue`가 난다.
- 게이트:
  - PR: PR-2(쓰기)
  - 무엇: `omitEmpty` 필드에 `''`가 있고 꺼진 분기에 원본이 있는 폼에서 `setValue(getValue())`를 두 번 부른다.
  - 통과: 첫 호출에서 두 원본이 없음이 되어 `inactiveValues`에서 빠지고 방출 값·채움·에지는 그대로이며, 둘째 호출은 원본을 바꾸지 않고 `UpdateValue`를 내지 않는다.
  - 실패: 결과가 다르면 이 블록이나 WRITE-090의 보충을 고친다.

### 18C-97 스냅숏 자리 맞춤 — 아이템을 만들거나 없애는 모든 쓰기

- 닫는 항목: WRITE-085(보충·충돌), WRITE-090(보충), 새 항목 WRITE-095(결정)
- 결정:
  - 【추론】 아이템을 만들거나 없애는 모든 쓰기는 구조 연산처럼 그 경로의 스냅숏 배열의 자리를 맞춘다.
  - 【추론】 없어진 아이템의 자리는 잘라 내고, 새 아이템의 자리에는 `undefined`를 넣으며, 값은 싣지 않는다.
  - 【추론】 WRITE-090의 "`setValue`는 로드가 아니므로 `defaultValue` 게터와 `resetSubtree()`의 로드 스냅숏을 바꾸지 않는다"는 스냅숏의 값에 대한 말이다.
  - 【추론】 비용은 구조 연산과 같은 O(배열 길이)다.
- 근거:
  - T1-B #4(`reviews/raw-round18-tests/t1b-fill-consistency.md:85-101`): WRITE-085의 "스냅숏은 위치가 아니라 신원을 따른다"(`reviews/round-18-closing.md:1231`)와 달리 `defaultValue`는 경로로 찾고(`:1225`), "구조 연산이 아닌 쓰기(`update(i, v)`, 입력 쓰기, `Merge`)는 스냅숏을 건드리지 않는다"(`:1235`), WRITE-090에서 `setValue`도 스냅숏을 건드리지 않으며(`reviews/round-18-owner-answers.md:26`), NODE-051에서 통째 쓰기는 아이템을 새로 만들거나 없앤다(`reviews/round-18-closing.md:1642-1643`).
  - 실패 장면: `defaultValue={items:['a','b']}`에서 `setValue({items:['x']})` 뒤 `setValue({items:['x','z']})`를 부르면 새 키 `#2`의 `defaultValue`가 사라진 `#1`의 값 `'b'`가 되고 `resetSubtree()`도 `'b'`로 되돌린다.
  - 입력 쓰기와 `Merge`의 배열 쓰기에는 소유자 답 전부터 있던 결함이다.
- 게이트:
  - PR: PR-5(배열)
  - 무엇: 위 실패 장면과, 입력 쓰기·`Merge`로 아이템 수를 바꾼 뒤 각 아이템의 `defaultValue`와 `resetSubtree()`를 본다.
  - 통과: 남은 아이템은 자기 되돌림 값을 지키고, 새 아이템의 `defaultValue`는 `undefined`라 `resetSubtree()`가 채움을 준다.
  - 실패: 스냅숏 배열이 신원과 어긋나면 자리 맞춤을 고친다.

### 18C-98 진단의 초기화 — 폼 수준 로드에서만, `degraded`에서 돌아오는 길은 `FormHandle.reset()`

- 닫는 항목: ERROR-024(충돌 줄 고침), ERROR-129(충돌 줄 고침), ERROR-142(충돌 줄 고침), SURFACE-007(충돌 줄 고침), ERROR-135(보충), VALUE-003(보충), ERROR-172(보충), ERROR-164(보충), LANDING-045(보충), BLUEPRINT-012(보충), TEST-069(보충), ERROR-030(보충), ERROR-196(보충), ERROR-202(보충), VALUE-037(충돌), VALIDATE-007(충돌), 새 항목 ERROR-204(결정)
- 결정:
  - 【추론】 `diagnostics`와 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화한다.
  - 【추론】 `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다.
  - 【추론】 `degraded`에서 돌아오는 길은 `FormHandle.reset()`이다.
- 근거:
  - T1-B #5(`reviews/raw-round18-tests/t1b-fill-consistency.md:103-114`): ERROR-129의 원래 목록 "로드(마운트, 스키마 교체, 루트 전체 교체 `setValue(V)`, `reset`)"(`adr/0014-error-policy.md:201`)는 폼 수준의 로드만 뜻했는데, ERROR-024·ERROR-129·ERROR-142·SURFACE-007의 충돌 줄이 목록을 "마운트·`FormHandle.reset()`·`resetSubtree()`"로 바꿔 하위 트리의 로드가 폼 인스턴스 단위의 기록을 비우게 된다. ERROR-024는 중복 키를 "폼 인스턴스의 로드"마다 비우며 "`diagnostics`와 같은 단위"라 적는다(`adr/0014-error-policy.md:152`).
  - VALUE-003의 "마지막 로드 이후의 기록"(`adr/0006-single-value-ownership.md:37`), ERROR-135(`adr/0014-error-policy.md:203`), 14라운드 답 O-2(`reviews/round-14-owner-answers.md:8`).
  - 실패 장면: 한 하위 트리에서 `resetSubtree()`를 부르면 다른 곳의 예산 초과로 생긴 `degraded`가 풀려 제출이 다시 허용된다. ERROR-142는 `setValue(V)`로 `stable`에 돌아오던 길이 없어졌는데 대신할 길을 적지 않는다.
- 게이트:
  - PR: PR-2(진단)
  - 무엇: 한 하위 트리의 예산 초과로 `degraded`가 된 폼에서 다른 하위 트리의 `resetSubtree()`, 루트 `setValue(V)`, `FormHandle.reset()`을 차례로 부르고 `diagnostics`, 경고 중복 키, 제출 거부를 본다.
  - 통과: 앞의 둘 뒤에는 `degraded`, 중복 키, 제출 거부가 그대로 남고, `FormHandle.reset()` 뒤에는 `stable`이며 중복 키가 비었다.
  - 실패: 초기화하는 로드의 목록을 고친다.

### 18C-99 채움 시점의 이주 행 셋 — `setValue(null)` 뒤 자식 쓰기, 입력의 `Overwrite`, 배열 통째 `setValue`

- 닫는 항목: 새 항목 LANDING-200–LANDING-202(이주 행), 새 항목 LANDING-203(게이트)
- 결정:
  - 이주(LANDING-200): 호출자의 `setValue(null)` 뒤 자식 쓰기로 객체가 돌아오면 오늘은 null인 동안 자식이 든 기본값이 나타나고(`src/core/nodes/ObjectNode/DETAIL.md:19-20`), 새 설계에서는 채우지 않는다.
  - 이주(LANDING-201): 입력의 `onChange(v, SetValueOption.Overwrite)`는 오늘 `Overwrite`에 든 `Refresh` 비트로 자기 입력을 다시 마운트하고(`src/core/types/value.ts:63,65`, `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:50-53,121`, `src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInputControl.ts:37`), 새 설계에서는 다시 마운트하지 않는다.
  - 이주(LANDING-202): 배열을 통째로 쓰는 `setValue`는 오늘 아이템을 다시 만들어 모두 채우고(탐침 P8, `reviews/raw-round18-tests/t1b-fill-consistency.md:116-133`), 새 설계에서는 위치로 이어 남은 아이템은 채우지 않고 뒤쪽에 새로 생긴 아이템만 채운다(NODE-051, WRITE-090).
- 근거:
  - T1-B #6(`reviews/raw-round18-tests/t1b-fill-consistency.md:116-133`): 셋 모두 오늘 코드를 실행해 확인했다. 탐침 P3·P3c(null인 동안 자식이 기본값을 들고, 자식 쓰기로 돌아오면 `{"o":{"a":"x","c":3}}`), P5(`Overwrite`는 `RequestRefresh` 1회, 기본 입력 옵션은 0회, 저장소 스토리 15곳이 이 호출을 씀), P8(`[{"a":"x"},{"a":"x"}]`, 새 설계는 `[{}, {"a":"x"}]`).
  - LANDING-139는 입력과 `Merge`로 만든 null만, LANDING-140은 `Merge`만, LANDING-164는 상태가 위치를 따라가는 것만 다룬다.
  - 호스트가 `setValue({...})`로 돌아오는 경우는 오늘도 채우지 않으므로 이주 행이 없다(탐침 P3의 `{"o":{"c":2}}`).
- 게이트:
  - PR: PR-7(이주 점검)·PR-5(배열)
  - 무엇: 세 장면을 오늘 코드와 새 구현에서 돌린다.
  - 통과: 오늘 결과가 T1-B의 탐침과 같고 새 결과가 이주 행대로다.
  - 실패: 다르면 이주 행을 고친다.

### 18C-100 null 계약의 문구 — 로드가 아닌 쓰기로 온 null 아래 자식은 채움 없이 없음, 쓰기 종류에 호출자 전체 교체

- 닫는 항목: WRITE-013(충돌), VALUE-036(보충), VALUE-032(보충), EVENT-060(보충), 새 항목 WRITE-096(결정)
- 결정:
  - 【추론】 로드가 아닌 쓰기로 온 `null` 아래 자식은 채움 없이 없음이다(WRITE-090, WRITE-092).
  - 【추론】 로드로 온 `null` 아래 자식은 로드의 새 수명이라 채움을 받는다.
  - 【추론】 그래서 VALUE-036의 "빈 상태"는 로드로 온 `null` 아래에서는 채운 상태이고, 로드가 아닌 쓰기로 온 `null` 아래에서는 없음이다.
  - 【추론】 쓰기 종류의 목록(VALUE-032)과 `UpdateValue` 출처 칸의 값(EVENT-060)에 '호출자 전체 교체'(`setValue(V)`)를 더한다.
- 근거:
  - T1-B #7(`reviews/raw-round18-tests/t1b-fill-consistency.md:135-146`): WRITE-013 보충의 "`setValue({ user: null })` 뒤 `name`의 채움 값은 방출에 나타나지 않고"(`08-design-a-to-z.md:274`)는 채움 값이 있다고 적는다. VALUE-036의 "빈 상태를 보인다"(`adr/0006-single-value-ownership.md:76`)의 "빈 상태"는 #338의 채운 빈 상태를 뜻하던 낱말이다(WRITE-014, WRITE-092 보충의 "'빈 상태' 채움은 로드에만", `reviews/round-18-closing.md:471`). VALUE-032의 종류 목록(`reviews/round-18-closing.md:1834`)과 EVENT-060의 출처 값(`reviews/round-18-owner-answers.md:15`)에는 로드를 떠난 `setValue(V)`가 들 자리가 없다.
  - WRITE-090의 "`setValue(null)` 뒤 자식이 다시 객체가 되어도 노드가 새로 생기지 않으면 채우지 않는다"(`reviews/round-18-owner-answers.md:26`).
- 게이트:
  - PR: PR-2(쓰기 종류)
  - 무엇: `name`에 `default`가 있는 폼에서 `setValue({ user: null })` 뒤와 `{ user: null }`을 로드한 `FormHandle.reset()` 뒤의 `name`의 원본과 방출, 그리고 `setValue(V)`가 낸 `UpdateValue`의 출처 칸을 본다.
  - 통과: `setValue` 뒤 `name`은 없음이고, 로드 뒤 `name`은 채움 값을 들되 방출에 나타나지 않으며, 출처 칸은 호출자 전체 교체다.
  - 실패: 이 블록을 고친다.

### 18C-101 `resetSubtree()`에 걸린 로드 규칙의 범위 — 그 하위 트리에만

- 닫는 항목: LANDING-041(보충), ERROR-040(보충), EVENT-032(보충), EVENT-015(보충), VALIDATE-048(보충), VALUE-030(보충), 새 항목 EVENT-072(결정)
- 결정:
  - 【추론】 로드 뒤 `OnChange` 비트면 한 번 하는 검증(LANDING-041, ERROR-040, EVENT-032)은 `resetSubtree()`에는 그 하위 트리에만 적용한다.
  - 【추론】 `batch` 안의 로드를 곧바로 정착하는 규칙(EVENT-015)은 `resetSubtree()`에는 그 하위 트리에만 적용한다.
  - 【추론】 "한 로드에 한 번"(VALIDATE-048)은 `resetSubtree()`에는 그 하위 트리에만 적용한다.
  - 【추론】 "로드마다 다시 만든다"(VALUE-030)는 `resetSubtree()`에는 그 하위 트리에만 적용한다.
- 근거:
  - T1-B #8(`reviews/raw-round18-tests/t1b-fill-consistency.md:148-158`): 이 규칙들은 로드를 마운트·reset으로만 적거나(LANDING-041 `08-design-a-to-z.md:470`, ERROR-040 `adr/0014-error-policy.md:217`, EVENT-032 `adr/0008-event-system.md:116`, EVENT-015 `adr/0008-event-system.md:80`) 로드 일반으로 적어(VALIDATE-048 `reviews/round-18-closing.md:2141`, VALUE-030 `reviews/round-18-closing.md:1097`) `resetSubtree()`에 적용되는지 알 수 없다.
  - `resetSubtree()`는 그 하위 트리의 로드다(WRITE-090, WRITE-085).
  - 18C-44 때부터 있던 공백이며, WRITE-090이 로드의 목록을 못 박으면서 드러났다.
- 게이트:
  - PR: PR-2(정착)·PR-4(검증)
  - 무엇: `OnChange` 폼에서 `batch` 안과 밖에서 `resetSubtree()`를 부르고, 정착 시점, 검증 요청 수, 검증 불가 기록, 경고등 경로 집합을 본다.
  - 통과: 로드 규칙이 그 하위 트리에만 적용되고, 하위 트리 밖의 기록과 경로는 그대로다.
  - 실패: 이 블록을 고친다.

### 18C-102 에지와 생김의 기준 — 로드는 비우고, 로드가 아닌 쓰기는 직전 커밋

- 닫는 항목: SETTLE-046(보충), WRITE-090(보충), 새 항목 SETTLE-048(결정)
- 결정:
  - 【추론】 로드는 에지와 생김의 기준을 비운다.
  - 【추론】 로드가 아닌 쓰기(`setValue(V)` 포함)는 직전 커밋을 기준으로 한다.
- 근거:
  - T1-B #9(`reviews/raw-round18-tests/t1b-fill-consistency.md:160-166`): SETTLE-027의 첫 문장 "전체 교체는 에지와 생김의 기준(직전 커밋)을 비운다(F4)"(`adr/0007-settle-cycle.md:92`)는 WRITE-090으로 갔으나 WRITE-090은 생김만 말하고 에지는 말하지 않아, SETTLE-046의 "그래서"가 기댈 앞 문장이 없다.
  - T1-B 열린 점 2(`reviews/raw-round18-tests/t1b-fill-consistency.md:192`): 현행 항목(CONTROLS-084의 충돌 줄, WRITE-012)은 평범한 에지 규칙을 지지한다.
- 게이트:
  - PR: PR-2(정착)
  - 무엇: `controls.derived`·`controls.injectTo`를 가진 폼에서 `setValue(getValue())`와 `FormHandle.reset()`을 부른다.
  - 통과: `setValue(getValue())`는 에지가 없어 발화하지 않고, `FormHandle.reset()`은 발화한다(SETTLE-046).
  - 실패: 에지의 기준을 고친다.

### 18C-103 정리 — 억제 비트의 범위, 낡은 근거와 가리킴, LANDING-118, WRITE-090의 두 표현

- 닫는 항목: SURFACE-039(충돌), WRITE-048(충돌), WRITE-085(충돌), FRAGMENT-054(충돌), LANDING-118(대체됨), WRITE-090(보충), 새 항목 WRITE-097(결정)
- 결정:
  - 【추론】 억제 비트 `DisableAutomaticWrites`의 범위는 그 호출(로드와 전체 교체 쓰기, `Merge`)이 일으킨 예약 층의 쓰기 전부다.
  - 【추론】 WRITE-048의 "원장의 쓰기 표에서 둘은 같은 행이다"는 낡은 근거다: `setValue(V)`는 로드가 아니라 전체 교체 쓰기라 쓰기 표에서 reset과 다른 행이며, reset만의 예외를 두지 않는 근거는 모든 배열 통째 쓰기가 위치로 잇는다는 NODE-051이다.
  - 【추론】 WRITE-085의 "로드이므로 빠진 키를 채우고(D-7, WRITE-017) 새 수명을 시작한다(SETTLE-027)"의 가리킴은 WRITE-090과 SETTLE-046이다.
  - 【추론】 WRITE-085의 "배열 통째 로드"는 로드(마운트·`FormHandle.reset()`·`resetSubtree()`)가 싣는 배열이며, 로드가 아닌 배열 통째 쓰기의 스냅숏은 18C-97이 정한다.
  - 【추론】 FRAGMENT-054의 "(VALUE-015·WRITE-014)"의 가리킴은 VALUE-036과 WRITE-092다.
  - 【추론】 WRITE-010 보충에 남은 18C-17의 줄은 WRITE-090이 대체했으므로 지운다.
  - 【추론】 LANDING-118은 가리키던 WRITE-017이 대체되었으므로 `대체됨(→ WRITE-090)`이다.
  - 【추론】 `setValue(undefined)`는 이미 있던 노드를 다시 채우지 않고 비운다.
  - 【추론】 채움이 일어나는 사건에는 노드 게이트(`controls.active`)가 켜짐도 든다(SETTLE-005).
- 근거:
  - T1-B #10(`reviews/raw-round18-tests/t1b-fill-consistency.md:168-179`): SURFACE-039의 범위 "(로드와 `Merge`)"(`07-conclusions.md:311`), WRITE-048의 근거(`09-landing-and-test-strategy.md:92`), WRITE-085의 가리킴과 "배열 통째 로드"(`reviews/round-18-closing.md:1228`, `:1236`), FRAGMENT-054의 가리킴(`reviews/round-18-closing.md:1806`), WRITE-010 보충의 18C-17 줄(`reviews/round-18-closing.md:528-531`), LANDING-118의 `중복(→ WRITE-017)`.
  - T1-B #11(`reviews/raw-round18-tests/t1b-fill-consistency.md:181-187`): WRITE-090의 "`setValue(undefined)`는 채움 없이 비우고"와 "그 쓰기로 새로 생긴 노드만 채움을 받는다"가 부딪히고(`if`가 빠진 키에서 참이 되어 새 분기가 생기면 그 분기는 채운다), 채움 사건 목록에 노드 게이트가 켜지는 경우가 없다(SETTLE-005는 일반 규칙으로 이 경우도 다룬다).
  - WRITE-090의 결정은 소유자 답의 반영 칸이라 고치지 않으며, 이 블록의 두 문장이 WRITE-090의 보충으로 붙는다.
- 게이트:
  - PR: PR-2(채움)
  - 무엇: 빠진 키에서 참이 되는 `if`와 `controls.active` 게이트를 가진 폼에서 루트 `setValue(undefined)`를 부른다.
  - 통과: 이미 있던 노드는 채우지 않고 비우며, 게이트가 뒤집혀 새로 생기거나 켜진 노드는 채움을 받는다.
  - 실패: 채움 사건의 목록을 고친다.

## 게이트 3이 드러낸 항목

2026-09-26. 게이트 3(`reviews/raw-round18-tests/gate3-union-fill.md`)이 union 반영과 채움 반영을 맞대어 찾은 두 번 해석(U7)의 결함(지적 2)과 core 쪽 유효 목록 정의의 빈자리(지적 10)를 닫는다. 아래 블록은 편집자 결정이다.

### 18C-104 U7 정련 — 쓰기 경계는 정적 목록, 전이 단계는 원래 쓰인 값

- 닫는 항목: BLUEPRINT-041(보충), WRITE-093(충돌), SETTLE-005(충돌), TEST-078(충돌), TEST-077(보충), 새 항목 WRITE-098(결정)
- 결정:
  - 【추론】 쓰기 경계에서는 그 노드의 정적 목록(`schemaType`, `nullable`)으로 한 번 해석한다.
  - 【추론】 이 목록은 게이트와 무관하므로 직전 상태에 기대지 않는다.
  - 【추론】 전이 단계에서는 이 진입에서 쓰인 노드마다, 최종 유효 목록이 정적 목록보다 좁으면 원래 쓰인 값(쓰기 경계에서 바뀐 값이 아니라 호출자·입력이 준 값)을 최종 유효 목록으로 다시 해석해 그 결과를 원본으로 삼는다.
  - 【추론】 그래서 결과는 "쓰인 값을 최종 유효 목록으로 한 번 해석한 것"과 같고, 직전 커밋의 게이트 상태에 기대지 않는다.
  - 【추론】 예: 본체 `a:{type:['string','boolean']}`에 `kind`가 `'text'`면 `a`를 `string`으로, `'flag'`면 `boolean`으로 좁히는 게이트가 있을 때, `setValue({kind:'flag', a:0})`는 직전 `kind`가 무엇이든 `a = false`다.
  - 【추론】 이 진입에서 쓰이지 않은 노드는 다시 해석하지 않는다(소급 변환 없음).
  - 【추론】 로드(마운트, `FormHandle.reset()`, `resetSubtree()`)도 같은 두 단계를 따른다.
  - 【추론】 비용: 쓰인 노드 가운데 유효 목록이 정적 목록보다 좁은 노드에 한해 `interpret` 한 번과 쓰인 값의 참조 보관이다.
  - 【추론】 18C-91의 "첫째 해석의 목록은 직전 커밋의 유효 목록"과 "둘째 해석은 … 목록이 바뀐 노드에서만 결과를 바꾼다(`interpret`가 멱등)"는 이 블록이 대체하며, 18C-91의 `setValue({kind:'num', a:'42'})` 예는 이 규칙에서도 `a = 42`다.
  - 【추론】 노드의 유효 목록은 `schemaType` ∩ (켜진 게이트 선언의 허용 집합)을 원소마다의 교집합(BLUEPRINT-044)으로 계산하고 `'null'`을 뗀 것이며, 이는 유효 스키마 `type`의 병합 결과와 같다(`reviews/round-18-owner-answers.md:37`의 U4·U5, BLUEPRINT-021).
  - 【추론】 이 정의는 모든 종류에 같으며, 원소가 하나인 목록은 단일 노드의 경우이고, number 노드에 게이트 `integer`가 켜지면 정수 규칙을 따른다.
- 근거:
  - 게이트 3 지적 2(`reviews/raw-round18-tests/gate3-union-fill.md:22-29`): 18C-91의 둘째 해석은 첫째 해석의 결과에 한 번 더 `interpret`하는데 `interpret`는 합성에 닫혀 있지 않다. 위 예에서 직전 `kind`가 `'text'`면 첫째 해석이 `0`을 `"0"`으로 바꾸고 둘째 해석(`['boolean']`)이 `"0"`을 받지 않아 `"0"`이 커밋되며 경고등이 켜지고, 직전 `kind`가 `'flag'`면 `false`가 된다.
  - 같은 지적: 첫째 해석의 목록 "마운트·`reset()`이면 `schemaType`"(`reviews/round-18-closing.md:2513`)은 로드인 `resetSubtree()`(WRITE-090, SETTLE-048)를 빠뜨린다.
  - 소유자 답: `reviews/round-18-owner-answers.md:37`의 U7(쓰인 노드는 전이 단계에서 최종 유효 목록으로 한 번 더 해석하고, 쓰이지 않은 노드는 다시 해석하지 않음)과 U6(소급 변환 없음), O7 답("검증해보고 정합하면 권장안 채택하세요"). 이 블록은 U7이 무엇을 다시 해석하는지를 정할 뿐 U7의 범위를 바꾸지 않는다: 최종 유효 목록이 정적 목록과 같은 노드에서는 다시 해석해도 `interpret`가 멱등이라 결과가 같다.
  - 게이트 3 지적 10(`reviews/raw-round18-tests/gate3-union-fill.md:92-94`): 유효 목록의 정의 `reviews/raw-round18-union-swarm/merged-v3.md:246-247`(3.2)이 18C-91에 옮겨지지 않았다.
- 게이트:
  - PR: PR-2(두 번 해석)
  - 무엇: 렌더 시나리오 `union.entry-two-step`에 위 예의 폼을 더해, 직전 `kind`가 `'text'`일 때와 `'flag'`일 때 각각 `setValue({kind:'flag', a:0})`를 부르고, `defaultValue`가 `{kind:'flag', a:0}`인 마운트와, `kind`를 `'text'`로 바꾼 뒤 두 필드를 담은 객체 노드의 `resetSubtree()`를 돌린다.
  - 통과: 모든 경우에 `a === false`이고 경고등이 꺼져 있으며, 쓰이지 않은 형제 노드는 다시 해석되지 않는다.
  - 실패: 결과가 직전 상태에 따라 갈리면 두 단계의 목록과 다시 해석하는 값을 고친다.

## 최종 정합성 점검이 드러낸 항목

2026-09-27. 봉인(커밋 `9f6d21306`) 뒤 codex와 antigravity에 같은 지시서로 맡긴 최종 정합성 점검(`reviews/raw-round18-final-check.md`)이 찾은 어긋남 가운데 검증자가 확인한 것을 닫는다. 아래 블록은 편집자 결정이다.

### 18C-105 U7 정련 2 — 전이 라운드와 원본 B

- 닫는 항목: WRITE-098(보충), SETTLE-005(보충), SETTLE-011(보충), TEST-077(보충·충돌), EVENT-072(충돌), VALIDATE-048(보충), BLUEPRINT-044(보충), BLUEPRINT-032(충돌), BLUEPRINT-033(분할됨), VALUE-037(충돌), WRITE-085(보충), WRITE-095(충돌), TEST-078(충돌), BLUEPRINT-045(충돌), 새 항목 WRITE-099(결정)
- 결정:
  - 【추론】 전이 단계의 재해석은 전이 쓰기다.
  - 【추론】 그 결과가 원본을 바꾸고 게이트를 뒤집으면 채움·비움과 같은 규칙으로 다음 라운드를 부르며, 라운드 상한(게이트 가진 조각 수 + 노드 게이트 수 + 1, SETTLE-005)은 그대로다.
  - 【추론】 한 노드는 한 라운드에 한 번만 다시 해석한다.
  - 【추론】 예: 본체 `a:{type:['string','boolean']}`에 `a`가 수이면 `boolean`으로, 아니면 `string`으로 좁히는 게이트가 있을 때, `setValue({a:0})`는 쓰기 경계에서 `0`(받아 줄 형이 둘이라 그대로)이고, 첫 라운드의 재해석에서 `false`가 되어 게이트가 `string`으로 뒤집히며, 다음 라운드의 재해석에서 `"0"`이 되고 게이트가 더 뒤집히지 않으므로 `a = "0"`이 커밋된다.
  - 【추론】 상한을 넘기면 SETTLE-011대로 원본 B를 커밋하고, 원본 B에는 쓰기 경계의 해석(정적 목록)만 남는다.
  - 【추론】 전이 단계의 재해석은 게이트 상태가 최종이 아니므로 원본 B에서 버린다.
  - 【추론】 원본 B에 남은 값이 좁혀진 유효 목록 밖이면 경고등이 켜진다.
  - 【추론】 비용: 라운드마다, 유효 목록이 바뀐 쓰인 노드에 한해 `interpret` 한 번이다.
  - 【추론】 `VALIDATOR_COMPILE_FAILED`는 폼 수준 기록이다.
  - 【추론】 그 기록은 폼 수준 로드(마운트, `FormHandle.reset()`)마다 한 번 낸다.
  - 【추론】 `resetSubtree()`는 그 기록을 다시 내지도 초기화하지도 않으며, 그 기록이 막은 `OnChange` 검증 예약은 다음 폼 수준 로드까지 막힌 채다.
  - 【추론】 그래서 18C-101의 "한 로드에 한 번"(VALIDATE-048)을 `resetSubtree()`의 하위 트리에 적용한다는 문장은 이 블록이 대체한다.
  - 【추론】 정적 선언이 없는 이름에서 게이트 없는 분기끼리 fold가 다르면 게이트 없는 선언끼리의 다른 종류이므로 `SHARED_NODE_KIND_CONFLICT` 청사진 오류다(BLUEPRINT-012, 소유자 O-10).
  - 【추론】 `node.type`의 값은 여덟(`virtual` 포함)이고, 18C-02의 "일곱"은 스키마에서 오는 종류만 센 것이다.
  - 【추론】 `union` 노드의 입력은 목록의 한 형의 값이나 없음을 보내며, 어떤 형을 보낼지는 입력 구현(UI 플러그인)이 정한다(`reviews/round-18-owner-answers.md:24`의 반영 칸 다섯째 문장, 목록을 읽는 자리는 BLUEPRINT-040).
  - 【추론】 목록 밖 `default`의 경고등·경고는 마운트만이 아니라 노드가 생길 때마다(WRITE-090의 채움 시점) 켜고 보낸다.
  - 【추론】 구조 연산(`push(v)`·삽입)은 WRITE-085대로 생성 값 `v`를 스냅숏 자리에 넣고, 아이템을 만드는 비구조 쓰기만 `undefined`를 넣는다.
  - 【추론】 `NON_JSON_WHOLE_VALUE`의 깊이 점검은 VALUE-037대로 개발 모드에서만 돌며, 핸들러가 있어도 프로덕션에서는 돌지 않는다.
  - 【추론】 좁혀지지 않은 노드의 유효 목록은 `schemaType` 그 값(스칼라면 스칼라, 배열이면 그 배열 참조)이며 "같은 참조"는 이것을 뜻한다.
  - 【추론】 그래서 E26(18C-90)에서 게이트가 켜진 동안의 유효 목록은 `schemaType`과 같은 `'number'`다.
- 근거:
  - 최종 점검 codex F1(`reviews/raw-round18-final-check.md:12-17`, 판정 `:78`)과 antigravity F7(`:152-157`, 판정 `:216`): WRITE-098의 재해석은 한 번뿐이라 재해석이 게이트를 뒤집는 되먹임을 다루지 못하고(반례: `['string','boolean']`에 `a`가 수이면 `boolean`), 상한에서 커밋하는 원본 B에 재해석 결과가 드는지 적혀 있지 않다.
  - codex F5(`reviews/raw-round18-final-check.md:40-45`, 판정 `:82`)와 antigravity F1(`:98-103`, 판정 `:210`): 폼 단위인 `VALIDATOR_COMPILE_FAILED`에 18C-101이 하위 트리의 로드를 적용해, `resetSubtree()`가 그 기록을 다시 내는지와 `OnChange` 예약의 억제가 풀리는지 알 수 없다(ERROR-204는 진단과 경고 중복 키만 다룬다).
  - antigravity F2(`reviews/raw-round18-final-check.md:107-112`, 판정 `:211`): BLUEPRINT-044는 정적 선언이 없는 이름에서 게이트 없는 분기끼리 fold가 다를 때를 정하지 않는다.
  - codex F6(`reviews/raw-round18-final-check.md:47-52`, 판정 `:83`)과 antigravity F3(`:116-121`, 판정 `:212`): BLUEPRINT-032의 "일곱"과 NODE-057의 `node.type` 여덟 값(`reviews/round-18-owner-answers.md:31`)이 다르다.
  - antigravity F4(`reviews/raw-round18-final-check.md:125-130`, 판정 `:213`): 반영 칸 다섯째 문장의 앞부분은 분할된 BLUEPRINT-033의 결정과 BLUEPRINT-040의 보충에만 있다.
  - antigravity F6(`reviews/raw-round18-final-check.md:143-148`, 판정 `:215`): VALUE-037은 목록 밖 `default`의 경고를 마운트 때로만 적지만, 채움은 노드가 생길 때마다 일어난다(WRITE-090).
  - codex F2(`reviews/raw-round18-final-check.md:19-24`, 판정 `:79`): WRITE-095의 `undefined`가 WRITE-085의 `push(v)` 생성 값과 갈리며, 반영 칸은 구조 연산의 규칙을 그대로 둔다(`reviews/round-18-owner-answers.md:26`).
  - codex F3(`reviews/raw-round18-final-check.md:26-31`, 판정 `:80`): TEST-078의 "개발 모드나 핸들러가 있을 때만"은 VALUE-037의 "프로덕션에서는 그 점검을 하지 않으며"와 다르다.
  - codex F4(`reviews/raw-round18-final-check.md:33-38`, 판정 `:81`): E26의 `['number']`는 스칼라 `schemaType` `'number'`(`reviews/round-18-owner-answers.md:31`)와 같은 참조일 수 없다.
- 게이트:
  - PR: PR-2(전이 라운드)
  - 무엇: 렌더 시나리오 `union.entry-two-step`에 위 예의 폼과, `a`가 문자열이면 `boolean`으로 아니면 `string`으로 좁히는 폼(되먹임이 멈추지 않는 반례)을 더해 각각 `setValue({a:0})`를 부른다.
  - 통과: 첫 폼은 `a === "0"`이고 경고등이 꺼져 있으며, 둘째 폼은 전이 라운드 상한을 넘겨 원본 B로 `a === 0`을 커밋하고 경고등이 켜지며 `diagnostics.status`가 `'degraded'`다.
  - 실패: 재해석이 라운드를 부르는 규칙이나 원본 B에 남는 값을 고친다.
  - PR: PR-2(스냅숏·유효 목록)
  - 무엇: 배열에 `push('x')`와 삽입을 한 뒤 새 아이템의 `defaultValue`와 `resetSubtree()`를 보고, E26 폼에서 게이트를 켠 뒤 `a`의 유효 목록을 본다.
  - 통과: 새 아이템의 `defaultValue`는 생성 값이고 `resetSubtree()`가 그 값으로 되돌리며, E26의 유효 목록은 `node.schemaType`과 같은 `'number'`다.
  - 실패: 스냅숏 자리 맞춤이나 유효 목록의 표현을 고친다.
  - PR: PR-4(검증 불가 기록)
  - 무엇: 전체 스키마 컴파일이 실패하는 `OnChange` 폼을 마운트하고 값을 쓴 뒤, 자식의 `resetSubtree()`를 부르고 값을 쓰며, 이어 `FormHandle.reset()`을 부르고 값을 쓴다.
  - 통과: `VALIDATOR_COMPILE_FAILED`는 마운트 뒤와 `FormHandle.reset()` 뒤에 한 번씩 나고, `resetSubtree()` 뒤에는 다시 나지 않으며 그 뒤의 쓰기도 `OnChange` 검증을 예약하지 않는다.
  - 실패: 기록의 단위를 고친다.
  - PR: PR-1(청사진 판정)
  - 무엇: `union.kind-procedure.test.ts`에 정적 선언 없이 호스트의 게이트 없는 `oneOf` 분기 둘이 같은 이름을 `string`과 `number`로 적은 칸을 더하고, `virtual` 노드를 가진 코퍼스에서 `node.type`의 값을 모으며, `union.type-test.ts`에서 union props의 `onChange` 형을 본다.
  - 통과: 그 칸은 `SHARED_NODE_KIND_CONFLICT` 청사진 오류이고, 모은 값은 모두 여덟 값 가운데 하나이며, union props의 `onChange`는 목록의 형의 값과 없음만 받는다.
  - 실패: 절차나 종류 목록이나 props의 형을 고친다.
