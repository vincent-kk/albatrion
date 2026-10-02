# schema-form/src/core contract

## Requirements

- 경로 키 저장소 보조는 record의 런타임 형 선언과 생성·정착의 쓰기가 함께 소비하므로 공통 소유자인 core에 둡니다. PathKeyedMap·PathKeyedSet은 빈 색인을 생성할 때 소유하고 native Map·Set의 열거·instanceof를 유지하며 인스턴스 adoption이나 메서드 패치를 하지 않습니다. K개 항목·깊이 D에서 O(KD) 색인 키 참조와 유일 prefix 및 숫자 radix 저장량을 추가합니다(NODE-045, SETTLE-017·047, GOAL-011).

- `core/index.ts`가 이 fractal의 경계입니다. 새 엔진의 `SchemaNode/`·`validation/` 진입점과 바인딩 전용 함수를 와일드카드 없이 이름으로 다시 내보내며, 렌더 계층은 이 경계를 사용합니다(LANDING-067·087, 69C-01).
- 노드의 `value`는 편집 중인 계산값이고 `outputValue`는 스키마 출력 옵션이 적용된 투영 값입니다. 원본 상태는 `raw`·`extras`에 두며 투영은 노드 트리와 편집 상태를 바꾸지 않습니다(VALUE-002·027·034, LANDING-067).
- 루트 검증·루트 방출·`FormHandle.getValue`·제출은 `outputValue`를 읽습니다. 입력과 `UpdateValue` 관측은 `value`를 사용하며 노드 변경은 공개 쓰기 API 또는 이름 붙은 바인딩 전용 통로를 경유합니다(LANDING-067, REACT-009·010).
- `src/__legacy__/core/`의 노드·파서·시험은 참고용으로 보존하며 비레거시 코드가 가져오지 않습니다. 새 시나리오 하네스는 새 엔진을 검증합니다(LANDING-205).
- `nodeFromJSONSchema`는 core만 쓰는 호스트의 진입이며 `src/index.ts`는 내보내지 않습니다. `<Form>`도 같은 트리 생성 통로를 바인딩 전용 함수로 사용합니다. `contextNodeFactory`는 `src/__legacy__/`에 속하며 core·패키지 진입점이 내보내지 않습니다. `core/types`는 event·state·value 계약을 유지하고 node·constructor 계약은 두지 않습니다(LANDING-087, 70C-01).
- 공개 노드 형·가드와 `SchemaNodeEventType`·`SchemaNodeRequestType`·`SchemaNodeState`는 패키지 진입점이 이름으로 내보냅니다. 바인딩 전용 함수와 `Validator`·`ValidateFunction`은 패키지 공개 `src/index.ts`가 내보내지 않습니다(NODE-010, SURFACE-055·056·060, VALIDATE-044, 32C-01, 69C-01).
- 새 fractal의 의존 순서는 `blueprint` < `record` < {종류 모듈, `navigation`} < `validation` < `settle/derive` < `settle` < `dispatch` < `SchemaNode`다. `settle/derive`는 `settle`의 자식으로서 규칙 판정만 소유하고 settle의 라운드 실행기가 그 진입점을 소비한다. `validation`은 결과를 받은 콜백으로만 `dispatch`에 돌려주며 타입 간선도 역전시키지 않는다(NODE-016·045, LANDING-083·084, SETTLE-004).
- 사건은 루트의 동기 진입 사슬에서 정착·파동 배달·검증 요청·`onChange` 순서로 조율합니다. 경계 린트는 `src/core/**` 전체에 적용하여 `app/plugin` 가져오기를 금지합니다(EVENT-027, CONTROLS-075, LANDING-067).
- 자식 형상 그래프는 순환하지 않습니다. 부모·루트 참조는 노드의 탐색과 폐기 후 읽기 계약을 유지합니다(WRITE-086).

## API Contracts

### 진입점 표면

| 심볼                                                             | 계약                                                                                            |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `nodeFromJSONSchema(props)`                                      | 같은 생성 통로의 트리 작성과 마운트를 잇고 마운트된 루트를 반환하는 core 호스트 진입(70C-01) |
| `SchemaNode` 및 타입별 노드                                      | `value`·`outputValue`·`setValue`·`validate`·`subscribe`·`find`·`revision` 등 노드 공개 표면 |
| `isSchemaNode` · `isBranchNode` · `isTerminalNode` · 타입별 가드 | 런타임 타입 판별                                                                                |
| `SchemaNodeState` | Dirty=1·Touched=2·ShowError=4를 내부와 공개 경계에서 같은 이름으로 사용하며 별칭을 두지 않습니다(SURFACE-056·060, LANDING-157). |
| `SetValueOption` · `ValidationMode`                              | 쓰기 옵션 비트·검증 모드 열거값 |
| `SchemaNodeEventType` · `SchemaNodeRequestType`                  | 새 엔진의 공개 사건·명령 열거값(EVENT-073, LANDING-067) |
| 바인딩 전용 생성·마운트·폼 로드·인계·입력 쓰기·입력 마침·상호작용 초기화 번호 읽기 | `SchemaNode/DETAIL.md`의 통로 계약을 이름으로 다시 내보내며 `src/index.ts`는 내보내지 않음(69C-01·02, 70C-01) |
| `setContext(root, context)`                                      | 새 엔진의 바인딩 전용 내부 통로를 이름으로 다시 내보냄. 패키지 공개 `src/index.ts`에는 노출하지 않음(NODE-010, SURFACE-055, 28C-08) |
| `retainValidationRoot(validator, authoredRoot)` · `releaseValidationRoot(validator, authoredRoot)` | 바인딩 이펙트의 수명 증감 통로를 `validation/index.ts`에서 이름으로 다시 내보냄. 패키지 공개 `src/index.ts`에는 노출하지 않음(VALIDATE-021·045, NODE-010) |

`nodeFromJSONSchema`의 서명은 실행 ADR D3와 같습니다. `validator`는 `{ compile, compileGuard, release?, dialect? }` 객체이고, `deferMountValidation`의 기본값은 거짓입니다. 문서 주석은 core 호스트 진입과 `<Form>`의 동일 생성 통로를 명시합니다(70C-01, VALIDATE-010, CONTROLS-075).

```ts
nodeFromJSONSchema<Schema extends JSONSchema>(props: {
  jsonSchema: Schema;
  defaultValue?: InferValueType<Schema>;
  validator?: Validator;
  validationMode?: ValidationMode;
  context?: Dictionary;
  onChange?: (value: InferValueType<Schema> | undefined) => void;
  onStateChange?: () => void;
  errorReporter?: FormErrorReporter;
  unsetOnInactive?: boolean;
  disableAutomaticWrites?: boolean;
  isTerminal?: (schema: JSONSchema) => boolean | undefined;
  isAtomic?: (value: unknown) => boolean;
  deferMountValidation?: boolean;
}): InferSchemaNode<Schema>
```

### 값 채널 규약

생성 입력의 기본값은 `InferValueType<Schema>` 계약을 따르며, 청사진과 동작 행이 원본 해석·계산·투영을 구분합니다(VALUE-002·027, 70C-01).

| 채널                     | 읽는 곳                                                          | 특성                               |
| ------------------------ | ---------------------------------------------------------------- | ---------------------------------- |
| `value` (계산)           | `UpdateValue` payload, 입력 props, 편집 상태 관측 | 원본을 해석·조립한 편집 값 |
| `outputValue` (투영)     | 루트 검증, 루트 방출, `FormHandle.getValue`·제출 | 스키마 출력 옵션 적용 |

두 채널을 섞으면 편집 중인 화면이 정제 때문에 접히거나, 반대로 정제되지 않은 값이 폼 밖으로 나간다. 새 소비 지점을 추가할 때는 그 값이 밖으로 나가는지 안에 머무는지를 먼저 정하고 채널을 고른다.

### 노드 타입 추가

노드 종류는 청사진과 동작 행으로 정의하고 단일 런타임 겉면 계약을 따릅니다. 공개 팩토리와 `<Form>`은 같은 새 엔진 생성 통로를 사용하며 `AbstractNode` 상속을 요구하지 않습니다(NODE-010, LANDING-067, 70C-01).

공개 `InferSchemaNode`는 NODE-059에 따라 형 없는 `oneOf`·`anyOf`의 모든 분기가 인라인 객체 또는 인라인 배열 스키마일 때만 각각 `ObjectNode`·`ArrayNode`로 좁힙니다. `$ref`, 게이트 분기, 두 키워드의 동시 사용, 본체 `allOf`는 넓은 `SchemaNode`를 유지합니다. 형 없는 분기 없는 `const`·`enum` 칸은 리터럴의 JSON 종류에 맞는 원시 노드로 좁힙니다.

## Acceptance Criteria

### two-channel — 두 채널이 분리되어 있다

- `options.omitTrailing`이 켜진 배열 노드에서 `node.value`에는 후행 빈 항목이 남아 있고 `node.outputValue`에는 없다.
- 정제되지 않는 노드 타입에서 두 값이 같다.

### normalize-preserves-tree — 정제는 트리를 건드리지 않는다

- 정제로 항목이 걸러진 뒤에도 `ArrayNode`의 자식 노드 수는 줄지 않는다.
- 걸러진 위치에 값을 넣으면 그 항목이 다시 정제 결과에 나타난다.

### factory-single-path — 트리 생성 경로는 하나다

- `nodeFromJSONSchema()`와 `<Form>`이 같은 `buildSchemaNodeTree` 통로를 사용하고, 마운트된 루트는 스키마 종류에 맞는 공개 노드 형·가드 계약을 만족합니다(70C-01, VALIDATE-010).

### scenario-runner — 코어 시나리오 실행 소유

- 시나리오 명세 표는 각 부류의 장면 목록에서 생성되므로 사례 수를 정적으로 셀 수 없으며 `spec-document-case-cap`은 `indeterminate`로 유지합니다(60C-01).
- TEST-023에 따라 코어 시험이 공유 시나리오 데이터를 해석합니다. 비공개 시나리오 패키지는 코어 실행기를 소유하지 않습니다.
- 주입된 코어 어댑터가 단계를 순서대로 한 번씩 실행하며 정착을 기다린 뒤 기대를 검사하고 실패를 호출자에게 전달합니다.
- 각 부류의 시나리오를 새 `SchemaNode` 트리에서 실행하고 단계별 형상·방출·진단·상태 키를 검증합니다. `reset`은 루트 폼 수준 로드이며 `resetSubtree()`는 해당 하위 트리만 로드합니다(TEST-011·016·019·023, SETTLE-049).

### scenario-value — 값 부류 시나리오

- 공유 `value` 부류의 모든 시나리오가 코어 실행기에서 기대한 원본·방출·형 불일치 기록을 냅니다(TEST-019·023).

### scenario-settle — 정착 부류 시나리오

- 공유 `settle` 부류의 모든 시나리오가 코어 실행기에서 기대한 형상·진단·예산 결과를 냅니다(TEST-019·023).

### scenario-fill — 채움 부류 시나리오

- 공유 `fill` 부류의 모든 시나리오가 코어 실행기에서 기대한 채움 결과를 냅니다(TEST-019·023).

### scenario-exit — 나감 부류 시나리오

- 공유 `exit` 부류의 모든 시나리오가 코어 실행기에서 기대한 나감 비움·잠복 결과를 냅니다(TEST-019·023).

### scenario-union — union 부류 시나리오

- 공유 `union` 부류의 모든 시나리오가 코어 실행기에서 기대한 종류 선택·형상을 냅니다(TEST-019·023).

### scenario-derive — 파생 부류 시나리오

- 공유 `derive` 부류의 모든 시나리오가 코어 실행기에서 기대한 에지 발화·같은 대상 순위·예산·`injectTo` 결과를 냅니다(TEST-016·019·023, SETTLE-049).

### scenario-controls — 제어 부류 시나리오

- 공유 `controls` 부류의 모든 시나리오가 코어 실행기에서 기대한 상태 키 결합·범위·나감 층 결과를 냅니다(TEST-019·023).

### scenario-array — 배열 부류 시나리오

- 공유 `array` 부류의 일반 장면에서 다섯 구조 동사와 배열 아이템 형상·identity·스냅숏·방출을 코어 실행기가 실제 노드에서 검사합니다(TEST-011·018·023, NODE-051·052, WRITE-095·099, VALUE-034, LANDING-202·203, 26C-02).

### scenario-array-position — 위치 이동의 상태

- 구조 연산으로 이동한 아이템은 키와 노드 참조를 유지하며 상호 작용 상태가 새 위치를 따릅니다(TEST-018, NODE-051).

### scenario-array-terminal — 터미널 배열의 사본

- 터미널 배열의 다섯 동사는 매번 직전 원본을 보존하고 새 배열 사본을 기록합니다(TEST-018, NODE-005).

### scenario-array-source-b — 원본 B 배열 구조 복원

- 예산 초과 때 자동 생성한 배열 아이템은 원본 B의 빈 형상으로 되돌아가고, 사용한 아이템 키는 재사용하지 않습니다(TEST-018, WRITE-099).

### scenario-notify — 통지 부류 시나리오

- 공유 `notify` 부류의 모든 시나리오가 관찰 어댑터로 실행되어 기대한 배달 순서·명령·상태 사건·`onError` 기록을 냅니다(EVENT-004·027, TEST-019·023).

### scenario-validation — 검증 부류 시나리오

- 공유 `validation` 부류의 모든 시나리오가 관찰 어댑터로 실행되어 기대한 판정·노드별 오류 라우팅·검증 불가 결과를 냅니다(VALIDATE-043, TEST-019·023).

### scenario-differential — 같은 ajv 경로 비교

- 공유 `validation` 부류의 각 시나리오에서 코어 트리의 검증 판정과 오류 경로가 같은 Ajv로 작성 스키마를 직접 검증한 결과와 같습니다. 다른 구현과의 교차 대조(TEST-001)는 ajv가 아닌 검증기 플러그인이 생길 때까지 미룹니다(소유자 결정: ajv만 지원).

### public-node-inference — 형 없는 스키마의 공개 노드 형

- 인라인 객체·배열 분기만 있는 칸은 대응 노드로 좁히고, 참조·게이트·두 키워드·본체 allOf가 있으면 넓은 노드 형을 유지합니다.
- 분기 없는 단일 리터럴 종류의 `const`·`enum` 칸은 대응 원시 노드 형으로 좁힙니다.
- 형 수준에서 청사진 오류를 확정할 수 있는 객체·배열 리터럴, 종류가 섞인 리터럴, 혼합 인라인 분기는 `never`입니다. 정적 판정이 불가능한 모양만 넓은 노드 형을 유지합니다.

## Boundary Exemptions

### `__tests__/makeSchemaNodeTree.ts` — 공유 시험 트리 생성

- **Consumers**: `behaviors/unionBehavior/__tests__/**`
- **Direct import**: `allowed`
- **Reason**: 회귀 시험과 union 시험이 같은 실제 청사진·노드 트리 생성기를 소비합니다. 제품 진입점에 시험 전용 도우미를 공개하지 않기 위해 core의 테스트 구획에 보관합니다.

## Last Updated

계약 기준: LANDING-067·087·205, CONTROLS-075, 69C-01–05, 70C-01.
