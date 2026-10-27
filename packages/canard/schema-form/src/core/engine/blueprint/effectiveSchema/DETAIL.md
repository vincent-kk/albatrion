# effectiveSchema contract

## Requirements

- D3b-1에서 생산자 소유 값 membership은 engine 공통의 이름 붙인 ownedSchemaValues 메모에 두며 기존 add/delete와 동결 시점은 보존한다. 병합 파생 메모는 실제 엔진 모드 변경 때 초기화하지만 값 메모는 초기화하지 않는다. 공통 저장소는 자식의 타입을 import하지 않는다(SURFACE-063·065).

활성 선언의 전순서를 따라 유효 스키마를 병합하고 소유 값의 보호와 메모 참조를 보존한다.

## API Contracts

- `index.ts`는 `mergeEffectiveSchema` 말고도 `buildNodes`가 쓰는 셋을 이름으로 내보낸다. 선언 기여를 하나로 합치는 `mergeSchemaContributions`, 활성 선언 집합을 고르는 `selectEffectiveDeclarations`, 기본 런타임 메모인 변경 가능한 `WeakMap` `DEFAULT_NO_ACTIVE`이다. `buildNodes`는 증명된 무조건 정적 정규화의 결과로 이 메모를 미리 채운다(`buildNodes/buildNodes.ts`).

- 유효 스키마 병합은 활성 선언을 전순서로 받아 결과 기록 `EffectiveSchema { schema, typeConflict }`를 돌려준다. 정적 모드에서 둘 이상의 기여를 교차한 결과가 공집합이면 경로가 있는 JSONSchemaError다. 선언 하나 안에서 범위가 뒤집힌 경우와 리터럴 `enum: []`은 검증기 몫이므로 그대로 둔다. 런타임에서 enum·const가 공집합이 되면 enum 빈 배열로 표시하고, 충돌한 const는 제거한다. 형 교집합이 비면 enum 빈 배열을 적지 않고 `typeConflict`로 드러내며, 형과 nullable은 정적 선언대로 남긴다(BLUEPRINT-041). 이를 정착 오류로 던지는 일은 후속 정착 계약의 몫이다. 서로 다른 키워드 사이의 모순은 판정하지 않는다.

- options와 presentation은 주입된 원자 판정과 common-utils merge의 선택 인자로 병합한다. 한쪽에만 있는 값은 참조를 옮기고, 양쪽이 plain object이면 쓸 때 복사하며, 배열은 교체하고, 뒤쪽의 undefined는 앞쪽 값을 지우지 않는다. 활성 집합이 같으면 결과 기록 참조도 같다.

- 유효 스키마 메모는 노드, 활성 선언 집합, 정적·런타임 모드, 원자 판정 함수의 동일성을 구분한다. 기본 메모는 노드를 약한 키로 보관하며, 호출자가 별도 메모를 제공할 수 있다. 런타임 결과를 정적 검사에 재사용해서 오류를 건너뛰는 일은 없다.

- 유효 형이 좁혀지지 않으면 schemaType의 스칼라 값 또는 배열 참조를 그대로 쓴다. 게이트로 좁혀진 비어 있지 않은 형 목록은 동결 배열이며, number에서 integer로 좁혀진 E41도 `['integer']`다(BLUEPRINT-045, WRITE-099).

- 서로 다른 pattern이 있으면 첫 번째는 pattern에 남기고, 나머지는 allOf의 개별 pattern으로 보존한다. required는 연언에서 합집합이 되고, 주석은 나중 값이 이긴다. 값과 동작 규칙은 합치지 않고 선언별로 보존한다.

## Acceptance Criteria

### schema-merge-mount — 정규화 재사용의 노드 관측과 병합 수

- 기존 런타임 병합을 강제한 대조군과, 마운트 및 후속 쓰기의 트리, 값, 유효 스키마, 리비전, 경고, 통지를 비교한다. 마운트마다 실제 정적·런타임 병합을 따로 세고, 적격 선언에서 런타임 재병합이 없어졌는지 확인한다.


### type-gated-declarations — 게이트와 선언 문맥

- BLUEPRINT-045 E25–E27·E40–E42와 WRITE-099 보충을 만족한다. E26에서 좁혀지지 않은 유효 목록은 배열이 아니라 scalar schemaType 그 값이다. 정적 선언이 없는 이름을 무게이트 분기 fold가 선언해서 생기는 충돌을 검증한다.


### fragment-declarations — 조각과 공유

- 선언·연언 문맥, 모든 키워드의 전순서, 노드 공유, 상속 overlay 귀속, 가상 fields 순서 일치를 검증한다.


### effective-schema — 병합과 참조

- SCHEMA 병합표, 정적 오류와 런타임 공집합 표현, pattern 보존, 불변성, 같은 활성 집합의 참조 동일성을 검증한다.


### unconditional-effective-schema — 무조건 선언의 정규화 재사용

- 빠른 경로는 기존 병합과 같은 유효 스키마, 불변성, 참조를 보존한다. 형 교차, nullable, pattern, 원자 판정, 수집기, 선언 전순서가 필요한 경우는 기존 병합으로 처리하며, 경고의 내용과 순서를 유지한다.
- 일회성 정적 정규화도 같은 선택 순서와 병합 정책을 사용한다. 59개 HEAD 스키마와 89C-03 차등에서 정적 오류, 경고, 필드, 공개 schema의 동결을 보존한다.
- 증명된 단일 정적 기여를 직접 구성해도 모든 노드의 HEAD 유효 스키마와 키 순서가 같으며, 줄어드는 것은 범용 제약 순회 횟수뿐이다. invalid, multiple, gated, collect, isAtomic 경로의 검증·진단과 기존 메모 참조 조건은 유지한다.


## Boundary Exemptions

### `utils/merge/` — 병합 함수 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: `mergeEffectiveSchema`, `mergeSchemaContributions`, `selectEffectiveDeclarations`는 이름으로 진입점에 올라 blueprint 진입점과 `buildNodes`가 쓴다. 이 fractal은 뿌리에 구현 파일을 두지 않으므로 병합 구현은 `utils/merge/` 칸에 두고 진입점이 이름으로 내보낸다.

### `constants/defaults.ts` — 기본 메모 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: `DEFAULT_NO_ACTIVE`는 이름으로 진입점에 올라 `buildNodes`가 미리 채운다. 값은 구현이 아니라 공유 메모이므로 상수 칸에 두고 진입점이 이름으로 내보낸다.

## Last Updated

정돈-3 blueprint 재구성(2026-10-15)
