# derive 계약

## Requirements

- `derive`는 완성된 형상에 걸린 규칙을 판정한다. 쓰기 적용, 재계산, 파생 라운드 셈, 원본 B 복원, 커밋은 settle이 맡는다(LANDING-063·083, SETTLE-004·011·017, NODE-016).
- derive는 engine의 자식 fractal(`engine/derive`)로, settle과는 형제 관계다. 의존은 `blueprint`·`record`의 진입점과, engine organ의 순수 `sameValue`·경로 해석·선언 층 해석, `@/schema-form/helpers/jsonPointer`로만 향한다. settle의 어느 파일도(`settle/types/`, `settle/index.ts`, 쓰기·전이·커밋·파생 라운드 실행 organ) `import type`으로도 가져오지 않는다(NODE-016·045, SETTLE-043, CONTROLS-080).
- 청사진은 식, 선언, 역의존 표를 제공하고, derive가 규칙 발생 템플릿 표를 청사진마다 한 번 만들어 약한 맵에 둔다. 규칙이 없는 청사진은 빈 표를 공유하며 파생 단계를 건너뛴다(SETTLE-017·043, LANDING-083, CONTROLS-032·079).

## API Contracts

- 파생 규칙이 없다는 사실이 독립된 capability로 증명되면, 규칙 표를 수집하지 않고 불변인 빈 표를 공유한다. 분기가 없다는 것만으로 파생 규칙을 생략하지는 않으며, 규칙이 있는 청사진은 기존의 표, 순서, 의존 경로를 유지한다. 기능이 선언되었지만 빈 식을 컴파일한 결과 실행 규칙이 0건인 경우에도 청사진별 표를 유지하고, 부재가 증명되지 않았으므로 공유하지 않는다. 규칙이 없을 때는 O(S) 수집과 빈 Map 할당을 없애는 대신 O(1) capability 조회를 더하고, 공유 조회 객체는 변경 메서드를 노출하지 않는다(89C-03).

- 조각의 대상 자식 검색은 그 조각에 `derived`, `unsetValue`, `resetInteraction`, `injectTo` 중 하나라도 있을 때만 수행한다. `active`만 있는 분기가 B개일 때 파생 표 생성은 전체 자식 검색 B회가 아니라 O(선언 수) 시간이면 되고, 불필요한 대상 배열도 할당하지 않는다. `fields`의 별도 규칙은 계속 처리하며, 규칙 순서, 층, 에지의 의미는 바꾸지 않는다(SETTLE-017·043, 82C-01).

- 조각이 대상 자식을 직접 선언했는지는 engine DETAIL의 조각 소유 판정 한 벌(`getFragmentOwnerPaths`)로 정하고, 대상 후보는 객체 속성 항목(`childEntries`)에 한정한다. 따라서 조각 derive 규칙(derived·unsetValue·resetInteraction)은 아직 배열 아이템에 닿지 않는다(376C-02, 별도 결함 수정; 조각의 injectTo는 청사진 오류라 대상이 아니다). 이 한정이 있으므로 같은 판정으로 바꾸어도 규칙 표는 옛 세 접두 판정의 표와 원소마다 같다(CONTROLS-077).

- `index.ts`는 다음을 이름으로 내보낸다. `getDeriveRuleTable(blueprint: Blueprint): DeriveRuleTable`, `evaluateDeriveRound<Self>(root: FieldNodeRecord<Self>, state: DeriveState<Self>): DeriveRoundDecision<Self>`, `evaluateResetInteraction<Self>(root: FieldNodeRecord<Self>, state: DeriveState<Self>): DeriveResetInteractionDecision<Self>`, `DERIVE_ROUND_CAP = 25`, 그리고 `DeriveState`·`DeriveRoundDecision`·`DeriveTraceEntry` 형이다. 반환 자료를 설명하는 `DeriveRuleTable`·`DeriveResetInteractionDecision` 형은 내부 계약이므로 index가 내보내지 않는다. `settle/utils/derivation/`은 이 진입점에서 라운드 판정을, `settle/utils/commit/`은 상호작용 초기화 판정을 가져다 쓴다(SETTLE-004·006·017, NODE-016, CONTROLS-029).
- `DeriveState<Self>`는 완성된 트리, 호출의 로드 범위와 억제 여부, 직전 커밋의 규칙 값, 이번 정착에서 소비한 값, 대상별로 이미 적용한 종류 순위를 판정에 건넨다. `DeriveRoundDecision<Self>`는 대상마다 승자 하나만 남긴 쓰기 후보, 승패와 상관없이 소비할 에지, 개발 모드 기록 항목을 돌려주며 원본은 바꾸지 않는다(SETTLE-004·028·048·049, WRITE-015, ERROR-159).
- 규칙 표의 발생 하나는 선언 ID, 종류, 원천 발생 경로, 선언 층, 조각 전순서, 식 기록 또는 `injectTo` 함수, `watch` 경로로 구별된다. `derived`의 의존 집합은 그 식의 경로와, 같은 노드에 있는 모든 선언의 `controls.watch` 경로를 합친 집합이다. 같은 노드의 다른 식 경로는 포함하지 않는다(SETTLE-043, CONTROLS-032·079·080).
- 문자열 식은 청사진의 `BlueprintExpression.evaluate(dependencies)`를 호출하며, 인자로는 선언 호스트 기준 경로의 방출 값을 넘긴다. `controls.injectTo`는 컴파일하지 않은 함수 `(value, ctx)`를 호출한다. 이때 value에는 원천의 방출 값을, ctx에는 이번 라운드 트리의 `dataPath`, `schemaPath`, `jsonSchema`, `parentValue`, `parentJSONSchema`, `rootValue`, `rootJSONSchema`, `context`를 넘긴다(LANDING-083, CONTROLS-079·080, SETTLE-043).

- `sameValue`는 원시 값은 SameValueZero로, 배열은 길이와 차례로, 평범한 객체는 자기 열거 키 목록의 순서와 값으로, 그 밖의 객체는 참조로 비교한다. 같은 참조라면 그 아래로는 내려가지 않는다. 비교 대상은 `injectTo`의 원천 방출 값, `derived`의 의존 값 튜플, `unsetValue`·`resetInteraction`의 식 값이다(SETTLE-043).
- 정착을 시작할 때의 기준점은 직전 커밋이고, 정착 안에서는 규칙이 마지막으로 소비한 값이다. 로드는 범위 안의 기준을 비워서 규칙을 발화시키고, `resetSubtree()`는 원천이 하위 트리 안에 있는 규칙의 기준만 비운다. 로드가 아닌 쓰기에서는 `setValue(V)`도 직전 커밋을 사용한다. 형상 밖에 있는 발생은 평가하지 않으며, 다시 형상 안으로 들어오면 거짓에서 참으로 바뀐 것으로 본다. 조각이 켜지면서 새로 들어온 노드만 거짓에서 참이 되고, 공유 노드는 기준만 잡는다. 선언 선택이 바뀐 호스트는 게이트에 식이 없어도 그 정착에서 방문해 기준점을 잡는다(SETTLE-004·028·046·048·049, FRAGMENT-050, CONTROLS-080).
- `DeriveResetInteractionDecision<Self>`는 최종 트리에서 로드된 값이나 거짓에서 참으로 바뀐 에지 때문에 참인 노드, 소비할 에지, 개발 모드 기록 항목을 돌려준다. 커밋은 결과 노드의 `dirty`와 `touched`를 비우고 `revision`을 올린다. 로드가 억제된 경우에도 이 판정은 실행하되 원본은 쓰지 않는다(SETTLE-006, CONTROLS-029, EVENT-012·066, 28C-04).
- `@`는 런타임 맥락 칸의 객체를 읽는다. 맥락이 바뀌면 직전 커밋을 기준으로, `@`를 읽는 `derived`, `unsetValue`, `resetInteraction`에 에지를 낸다. 원천 방출 값이 그대로인 `injectTo`는 맥락 변경만으로는 발화하지 않는다(CONTROLS-080, SURFACE-055, SETTLE-048, 28C-03·08).
- 개발 모드 여부는 사용하는 곳에서 `process.env.NODE_ENV !== 'production'`을 비교해 판정한다. `DeriveTraceEntry`에는 단계, 규칙 종류, 원천 경로, 대상 경로, 이전 값, 이후 값, 결과를 담는다. 결과는 적용, 승자에게 짐, `undefined`라 후보가 아님, 억제, 최종 형상 밖이라 철회 중 하나다. 라운드 실행기는 공개 API와 옵션 비트가 남긴 진입 기록, 라운드별 항목, 예산을 넘긴 마지막 라운드의 규칙 목록을 모으고, 커밋이 이를 런타임의 마지막 정착 기록 하나로 바꾼다. 프로덕션에서는 항목과 칸을 만들지 않으며, 콘솔, `onError`, 공개 멤버로도 내보내지 않는다(ERROR-030·159, LANDING-063, NODE-004·045, TEST-016, 28C-01).

- 파생과 상호작용 초기화 판정은 첫 실패 하나만 반환하지 않고, 모든 규칙의 실패를 발생 순서대로 `failures` 목록에 담아 반환한다. 같은 규칙과 호스트의 재계산은 정착 수집기가 중복을 없애고, 서로 다른 규칙의 실패는 모두 남긴다. 진단 원인은 정착의 첫 실패가 정하므로, 뒤에 나온 파생 실패가 앞선 실패의 원인을 바꾸지 않는다(ERROR-004·005·034, 58C-01).

## Structure

- 자식 fractal `evaluateDeriveRound`가 라운드 판정과 그 전용 보조(`utils/rank`, `utils/inject`, `utils/writes`)를 소유한다. derive의 `utils/rules/`는 규칙 표와 규칙 키·watch 경로를, `utils/evaluate/`는 상호작용 초기화 판정과 두 판정이 함께 쓰는 기준점·식 평가·선택 선언 보조를, `constants/`는 라운드 상한을, `types/`는 판정 형을 소유한다. 상호작용 초기화 판정과 규칙 표 생성은 전용 파일이 하나뿐이라 fractal로 올리지 않는다.

## Acceptance Criteria

### derive-failures — 오류 목록과 발생 식별자

- 파생 오류의 원천 경로는 공유 규칙의 발생을 구별하는 식별자에 포함된다. 파생, 상호작용 초기화, 상태 키 판정은 오류가 없으면 호출 간에 재사용하는 동결된 읽기 전용 빈 실패 배열을 반환하며, 실패 배열은 첫 오류가 났을 때만 할당한다(ERROR-004, 58C-01).

### derive-boundary — 판정과 기록

- derive는 쓰기 organ 없이 판정 결과만 돌려주며, 개발 모드 항목은 마지막 정착의 런타임 기록에만 남는다(NODE-016·045, ERROR-159, 28C-01).

### derive-fragment-owner-differential — 공유 소유 판정의 규칙 표 불변

- 키워드 이름을 가진 속성, 중첩 조각과 분기, 배열 조각, 생성기 코퍼스 14종에서 공유 소유 판정으로 만든 규칙 표가 옛 세 접두 판정으로 만든 표와 원소마다 같다(CONTROLS-077).

## Boundary Exemptions

### `utils/rules/getDeriveRuleTable.ts` — 규칙 표 함수 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: 이름으로 진입점에 올라 settle이 쓴다. 전용 파일이 하나뿐이고 라운드 판정도 같은 표를 위쪽으로 읽으므로, fractal로 올리지 않고 진입점을 거쳐 바깥 소비자를 섬기는 organ에 둔다.

### `utils/evaluate/evaluateResetInteraction.ts` — 상호작용 초기화 판정 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: 이름으로 진입점에 올라 settle의 커밋이 쓴다. 전용 파일이 없고 라운드 판정과 보조를 함께 쓰므로, 그 보조와 같은 칸에 두고 진입점이 이름으로 내보낸다.

### `constants/` — 라운드 상한 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: `DERIVE_ROUND_CAP`은 이름으로 진입점에 올라 settle의 라운드 실행기가 쓴다. 값은 구현이 아니므로 상수 칸에 두고 진입점이 이름으로 내보낸다.

### `types/` — 형 칸 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: `types/` 칸의 형은 이름으로 진입점에 올라 settle이 쓴다. 형은 구현이 아니므로 칸에 두고 진입점이 이름으로 내보낸다.

## Last Updated

2026-10-03; 정돈-2(2026-10-14); 정돈-3 derive 재구성(2026-10-15); 373라운드 공유 조각 소유 판정(2026-10-15, CONTROLS-077, 376C-02).
