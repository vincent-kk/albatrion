# antigravity 보고(2026-09-27, session `ba9851a2-e35e-4544-92ff-af48dab85d2c`) — brief.md §5 대조

## §6 검증 결과 요약

| 축 | 평가 축 명칭 | 판정 | 핵심 요약 |
|---|---|:---:|---|
| A1 | 재귀 | 통과 | Pydantic Optional 및 재귀 트리가 형 판정 단계에서 정상 종결되며 `RECURSIVE_SHAPE_UNBOUNDED`와 분리됨. |
| A2 | 게이트 가진 분기 | 결함 | D1(게이트 포함)과 D7(게이트 제외)이 상충하며, 30행 원문의 "합치기 배제" 원칙과 충돌함. |
| A3 | 배열만인 경우 | 소유자 물음 | 원장에 배열 variant 호스트 정의가 전혀 없음. 축소안(객체만 허용) vs 확장안(규칙 신설) 중 정책 결정 필요. |
| A4 | 판정 절차의 자리 (S0–S6) | 결함 | S3(형 결정)와 S4(variant 등록)의 위계 모호, NODE-042(2) 상충 위험, S6 저자 type 부재 시 폴백 처리 미비. |
| A5 | 형 수준 (Type-level) | 결함 | 18C-89 정본(2357행)의 "모든 분기 객체 시 never/unknown" 규정과 직접 충돌하며, 타입 구현 개정 필요. |
| A6 | 뒤집히는 범위 | 결함 | D11·D12·D14에서 18C-89, BLUEPRINT-044/045, TEST-077, LANDING-174, ERROR-164, 구현 테스트/문서가 누락됨. |
| A7 | 값 의미 | 통과 | GOAL-027(동시 활성화)과 BLUEPRINT-010(노드 공유) 하에서 명시적 객체 호스트와 동치임. |
| A8 | 구현 거리 | 통과 | `inferAllowedTypes.ts` 등 소수 파일 국소 수정으로 완결되며 신규 추상화 계층 불필요. |

## 여덟 축 상세 검증 내역

### A1. 재귀: 통과
1. `pydantic Optional[discriminated]`: `corpus.mjs:180-192`의 구조는 `anyOf: [{ discriminator, oneOf: [Cat, Dog] }, { type: 'null' }]`. 분기 0은 자체 `type`이 없어 재귀로 진입하고, Cat·Dog은 `$defs`에 정적 `type: 'object'`가 있어 S2(`resolveNodeTypes.ts:40`)에서 {object}로 수렴. A(b0) = {object}, A(b1) = {null} → schemaType: 'object', nullable: true인 객체 variant 호스트.
2. 재귀 트리(`corpus.mjs:203-215`): `$defs/Leaf`·`$defs/Node` 모두 명시적 `type: 'object'`라 S2에서 즉시 판정. 배열 아이템 경계(BLUEPRINT-030, `round-18-closing.md:25`)에서 shape 전개가 닫힘.
3. `RECURSIVE_SHAPE_UNBOUNDED`(`blueprint.md:839`)는 프로퍼티 전개 단계(`populateNodeChildren.ts:67`)의 닫힌 객체 순환 오류. D8의 순환은 S3 단계의 형 판정 순환(`collectStaticSchemas.ts:19`, `collectDeclarations.ts:25`의 방문 스택). 두 개념이 구별됨.

### A2. 게이트 가진 분기: 결함
- 30행 원문(`round-18-owner-answers.md:30`): "정적 연언에 `type`을 가진 선언이 없는 칸은 칸의 **게이트 없는** `oneOf`·`anyOf` 분기를 보며" / "게이트 가진 분기(…)는 이 합치기에 넣지 않고 게이트 선언의 규칙을 따른다."
- D1(게이트 포함)과 D7(게이트 제외)의 분기 대상 정의가 충돌. 게이트 걸린 원시 분기만 있는 칸에서 D1은 F = {string}, D7/30행은 `UNKNOWN_JSON_SCHEMA`. 게이트 없는 원시 분기와 게이트 걸린 객체 분기가 섞이면 30행은 원시 잎이어야 하나 D1/D6은 오류로 잘못 기각.
- 고침: D1을 게이트 없는 분기로 한정. D7은 30행을 그대로 적용.

### A3. 배열만인 경우: 소유자 물음
- 원장 전체에서 variant 호스트는 "객체 variant 호스트"로만 정의(BLUEPRINT-035 `blueprint.md:600-614`, BLUEPRINT-039 `:677-691`, `owner-answers.md:33`, `merged-v3.md:185`).
- 배열 노드는 단일 템플릿 자식(`populateNodeChildren.ts:123-173`). 서로 다른 `items`의 배열 분기 둘은 `${node.path}/*` 슬롯에서 충돌해 `SHARED_NODE_KIND_CONFLICT`(`resolveNodeTypes.ts:97`).
- 선택지 1(권고, 축소안): D4 삭제, F에 array가 있으면 `UNKNOWN_JSON_SCHEMA` 유지. 코퍼스 실패는 모두 객체 분기라 통과. 선택지 2(확장안): 배열 variant 규칙을 BLUEPRINT-035·039, NODE-042에 신설하고 `populateNodeChildren.ts` 재설계.

### A4. 판정 절차의 자리: 결함
- 18C-90 흐름(`round-18-closing.md:2390-2414`): S0 → S1 → S2 → S3 → S4 → S5 → S6.
- S3와 S4의 위계 모호: S3에서 kind: 'object'로 확정한 분기들이 S4의 variant 조각으로 어떻게 인계되어 S5로 흐르는지 불분명.
- NODE-042(2) 상충 위험(`node.md:625-626`, 18C-09 `closing.md:215`): "게이트 없는 oneOf·anyOf 분기의 선언은 그 노드의 유일한 선언일 때만 든다." 본체에 properties 등이 함께 있으면 분기 프로퍼티 탈락 위험.
- S6 전략 판정의 type 폴백 누락(NODE-028 `node.md:424`): 저자 스키마에 type이 없으므로 D3이 부여한 schemaType을 참조해야 함.
- 고침: D5에 S4 진입·S5 결합·S6 폴백을 명시.

### A5. 형 수준: 결함
- 18C-89(`round-18-closing.md:2352-2358`) :2357 "형 없는 분기(const·enum만 있는 것 포함), 객체·원시 혼합 분기, **모든 분기가 객체(또는 배열)인 형 없는 칸은 never와 unknown이다**." D13이 이를 대체해야 함.
- 현재 구현: `src/types/value.ts:19-25`의 `InferValueType`은 type 없는 T를 `BaseInferValueType`으로 넘겨 unknown/any. `src/core/types/node.ts:26-41`의 `InferSchemaNode`는 `{ type: 'object' }` 조건 미매칭으로 넓은 `SchemaNode`.
- 고침: D13에 2357행 폐기와 `node.ts`·`value.ts` 개정을 명시.

### A6. 뒤집히는 범위: 결함
누락 8건: (1) 정본 18C-89 `closing.md:2357`; (2) BLUEPRINT-044 S3 `blueprint.md:818`; (3) BLUEPRINT-045 E16 `blueprint.md:867`; (4) TEST-077 `test.md:1291`; (5) LANDING-174 `landing.md:2530-2539`에 객체 variant 이주 행; (6) ERROR-164 `error.md:2458` UNKNOWN 조건; (7) `blueprint.type-inference.test.ts:87` E16 실패 단언; (8) `src/core/blueprint/DETAIL.md:9, 40`.

### A7. 값 의미: 통과
- GOAL-027(`goal.md:458`) "명시 없는 oneOf·anyOf는 모든 분기가 켜진다." BLUEPRINT-010(`blueprint.md:18`) 같은 이름·같은 종류는 노드 하나. `collectDeclarations.ts:150-174`·`populateNodeChildren.ts:67-99`가 명시 `{ type: 'object', oneOf: [Cat, Dog] }`와 동일한 결과.

### A8. 구현 거리: 통과
- `inferAllowedTypes.ts:50-60`: 분기 허용 집합에 'object'가 있으면 throw하는 로직을 제거하고 F = {object}이면 반환. `resolveNodeTypes.ts:50-56`: TYPE_MASK.object → kind 'object' 연계. `blueprint.type-inference.test.ts:87`: E16을 성공 목록으로 이동. `DETAIL.md:9, 40` 갱신. 새 fractal 불필요.

## 고친 결정문 (D1–D15)
- D1 (조사 대상): 칸의 정적 선언 연언(C)에 type이 없을 때, 그 칸이 가진 게이트 없는 oneOf·anyOf 분기를 모은다. (단, 분기 내부에만 discriminator/게이트가 선언되어 분기 자체가 칸 수준에서 비활성화되지 않는 분기는 조사 대상에 포함한다.)
- D2 (분기 형의 집합 F): 각 분기 b의 허용 형 집합 A(b)를 구한다. 분기에 type이 없으면 재귀로 구한다. A(b)에서 null을 뺀 집합들을 모두 합쳐 F라 한다. (b에 null이 있으면 그 칸은 nullable 표식을 단다.)
- D3 (객체 단일): F = {object}이면 이 칸은 kind: 'object', schemaType: 'object'이다.
- D4 (배열 단일 / 소유자 물음 권고 반영): F = {array}인 경우는 배열 variant 호스트 규칙이 원장에 부재하므로 현행대로 UNKNOWN_JSON_SCHEMA 청사진 오류이다.
- D5 (판정 절차 안의 자리): D3으로 종류가 정해진 칸은 정적 연언에 type이 명시된 칸과 동등하게 취급되어 S4로 진입한다. 분기들은 S4의 객체 variant 규칙에 따라 호스트의 variant 조각으로 등록되고, S5에서 프로퍼티가 결합되며, S6의 전략 판정 시 저자 선언의 type 대신 D3이 부여한 schemaType: 'object'를 폴백으로 사용한다.
- D6 (혼합 또는 둘 이상): F가 {object}가 아니면서 둘 이상의 형이 섞여 있거나, 허용 형 집합이 비어 있으면 UNKNOWN_JSON_SCHEMA이다.
- D7 (원시만인 경우): F에 object가 없으면, 18C-90 S3 및 30행의 원시 접기 규칙을 그대로 적용한다.
- D8 (순환): F를 구하는 재귀가 자신으로 돌아오면 그 칸은 UNKNOWN_JSON_SCHEMA이다.
- D9 (Optional discriminated): `anyOf: [{discriminator, oneOf: [Cat, Dog]}, {type: 'null'}]`는 schemaType: 'object', nullable: true인 객체 variant 호스트.
- D10 (재귀 트리): Node.children.items.anyOf는 배열 아이템 안이므로 D8의 순환에 걸리지 않고 객체로 판정된다.
- D11 (뒤집히는 정본): 33행의 "객체만·배열만인 칸도 UNKNOWN_JSON_SCHEMA" 조항과 `closing.md:2357`(18C-89)의 규정을 폐기.
- D12 (뒤집히는 원장 전수 나열): BLUEPRINT-039, BLUEPRINT-044(S3), BLUEPRINT-045(E16), TEST-077, LANDING-174, ERROR-164.
- D13 (형 수준): `closing.md:2357` 대체에 따라 `InferSchemaNode`는 D3인 스키마를 ObjectNode로, `InferValueType`은 분기 값 형 유니온으로 추론(`src/core/types/node.ts`, `src/types/value.ts`).
- D14 (표 및 시험 갱신): E16 기대치를 object / 'object' / false / variant 호스트로, BLUEPRINT-045 표·`blueprint.type-inference.test.ts:87`·`DETAIL.md:9, 40` 갱신.
- D15 (코퍼스 통과): 코퍼스 14종의 실패가 모두 풀린다.
