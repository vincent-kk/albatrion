# schema-form/src/core contract

## Requirements

- B12는 engine이 소유한 `InactiveValue`·`InactiveValueResolver`·`InactiveValueContext`를 이름으로 재수출하고 surface의 `onInactive`를 노드 공개 계약으로 조합합니다. 구현은 각 소유 경계에 남깁니다.

- D3b-1에서 관찰 fixture는 옮겨진 실제 runtime target-ID 메모를 읽고 모드는 engineModes.setMode를 거쳐 변경한다. 관찰 실행은 이전 설정을 finally에서 복원하며 별도 ID 생산자나 전역 대체 registry를 만들지 않는다.

- 검증 전용 관찰 session은 실제 engine module과 그 module의 기존 producer WeakMap을 읽기만 하는 reader, graph-local codec 및 실제로 생성·보존한 객체를 함께 결속한다. 제품 소스·공개 표면·사건·기존 기대값을 변경하지 않으며 관찰 사본의 readonly footer만 허용한다.
- 관찰은 19개 상태와 9개 이력 채널, 원형58의 ID·순서·초기화·연산·결과와 listener/retained 참조 관계를 보존한다. runtime key의 앞 일곱 부분과 다섯 부분 exit-policy key는 유지하고 여덟 번째 실제 producer ID만 같은 module의 실제 객체에 대한 codec occurrence로 바꾼다. 모든 optional rule store 부재는 빈 상태이며, 실제 누락·orphan·충돌·미지원 key shape는 거절한다.
- 현재 규칙은 실제 current attachment/lifetime와 일치해야 한다. 동일 module의 적법한 known retained 역사 occurrence는 원래 ID·참조·기록된 수명이 맞으면 detached라는 이유로 거절하지 않는다. unknown·foreign·ambiguous·conflicting·잘못 부착된·codec-unreachable 및 phase/lifetime 불일치는 실패하며 최신 경로 역추정·producer 재호출·shadow ID·전역 registry는 쓰지 않는다.

- 청사진에서 정규화한 무조건 선언을 재사용해도 마운트와 후속 쓰기의 값·유효 스키마·노드 순서·상태·경고·리비전·통지가 같아야 한다. 런타임 실제 병합 수는 마운트 단위로 검증하며 정적 검사 수는 줄이지 않는다(BLUEPRINT-021, NODE-006, SETTLE-017, 100라운드).

- 청사진·정착·파생이 공유하는 기능 부재 결과는 engine이 소유한 불변 빈 Map/Set 조회 객체를 쓴다. 변경 메서드를 제공하지 않으며 기능 부재가 각각 증명된 경우에만 공유한다. 영구 저장은 전체 프로세스에서 O(1)이며 청사진별 빈 Map/Set 할당을 제거한다(89C-03).

- 경로 키 저장소 보조는 record의 런타임 형 선언과 생성·정착의 쓰기가 함께 소비하므로 공통 소유자인 engine에 둔다. PathKeyedMap·PathKeyedSet은 빈 색인을 생성할 때 소유하고 native Map·Set의 열거·instanceof를 유지하며 인스턴스 adoption이나 메서드 패치를 하지 않는다. K개 항목·깊이 D에서 O(KD) 색인 키 참조와 유일 prefix 및 숫자 radix 저장량을 추가한다(NODE-045, SETTLE-017·047, GOAL-011).

- `core/index.ts`가 이 fractal의 경계이다. `surface/`의 노드·바인딩 계약과 `engine/`의 공개 실행 계약을 와일드카드 없이 이름으로 다시 내보내며, 렌더 계층은 이 경계를 사용한다(LANDING-067·087, 69C-01).
- 노드의 `value`는 편집 중인 계산값이고 `outputValue`는 스키마 출력 옵션이 적용된 투영 값이다. 원본 상태는 `raw`·`undeclaredValues`에 두며 투영은 노드 트리와 편집 상태를 바꾸지 않는다(VALUE-002·027·034, LANDING-067).
- 루트 검증·루트 방출·`FormHandle.getValue`·제출은 `outputValue`를 읽는다. 입력과 `UpdateValue` 관측은 `value`를 사용하며 노드 변경은 공개 쓰기 API 또는 이름 붙은 바인딩 전용 통로를 경유한다(LANDING-067, REACT-009·010).
- `src/__legacy__/core/`의 노드·파서·시험은 참고용으로 보존하며 비레거시 코드가 가져오지 않는다. 새 시나리오 하네스는 새 엔진을 검증한다(LANDING-205).
- `nodeFromJSONSchema`는 `src/__tests__/fixtures/`의 시험·측정 도우미이며 core index의 공개 생성·마운트 통로만 사용한다. core·패키지 진입점은 이 도우미를 내보내지 않으며 시험·bench·aileron 벤치마크가 파일 경로로 읽는다. `<Form>`은 `buildFieldNodeTree`·`mountFieldNode` 바인딩 통로를 쓴다. `contextNodeFactory`는 `src/__legacy__/`에 속하며 core·패키지 진입점이 내보내지 않는다. `engine/types`의 state·value·jsonSchema·controls는 엔진 안에서 구체 파일로 소비하고 외부는 core·engine 진입점의 이름을 경유하며 별도 와일드카드 배럴이나 node·constructor 계약은 두지 않는다. 사건 계약은 새 엔진의 record가 소유한다(LANDING-087, 70C-01).
- 공개 노드 형·가드와 `FieldNodeEventType`·`FieldNodeRequestType`·`FieldNodeState`는 패키지 진입점이 이름으로 내보낸다. 바인딩 전용 함수는 공개하지 않으며, `Validator`는 `ValidatorFactory`라는 이름으로, `ValidateFunction`은 같은 이름으로 `src/types`를 거쳐 패키지 공개 `src/index.ts`가 내보낸다(NODE-010, SURFACE-055·056·060, VALIDATE-044, 32C-01, 35C-07, 69C-01).
- 새 fractal의 의존 순서는 `blueprint` < `record` < {종류 모듈, `navigation`} < `validation` < `derive` < `settle` < `write` < `surface`다. `engine/derive`는 `settle`의 형제로서 규칙 판정만 소유하고, settle의 라운드 실행기·커밋·맥락·쓰기 organ이 그 진입점을 소비한다. 두 fractal이 함께 쓰는 순수 보조(`sameValue`·`resolveDependencyPath`·`getCommittedDeclarationKey`·`getControlExpression`)는 최소 공통 fractal인 engine의 organ `engine/utils`에 둔다. `validation`은 결과를 받은 콜백으로만 `write`에 돌려주며 타입 간선도 역전시키지 않는다(NODE-016·045, LANDING-083·084, SETTLE-004).
- 사건은 루트의 동기 진입 사슬에서 정착·파동 배달·검증 요청·`onChange` 순서로 조율한다. 경계 린트는 `src/core/**` 전체에 적용하여 `app/plugin` 가져오기를 금지한다(EVENT-027, CONTROLS-075, LANDING-067).
- 자식 형상 그래프는 순환하지 않는다. 부모·루트 참조는 노드의 탐색과 폐기 후 읽기 계약을 유지한다(WRITE-086).

## API Contracts

- U2 내부 표시 통로 isFieldNodeValidationPending·subscribeFieldNodeValidationSettled는 surface 래퍼를 명명 재수출한다. runtime listener set의 정착 알림이며 FieldNodeEventType·node.subscribe·revision·src/index에는 추가하지 않는다.

- surface는 engine의 진입점으로만 실행 계약을 가져오며 core 진입점은 두 자식의 계약을 이름으로 재수출한다. SchemaControls·ValidateFunction은 바인딩 타입의 경계를 제공한다. `readFieldNodeGuard`·`UnionMemberType`·`UnionSchemaType`·`FieldNodeInputProps`는 core index가 재수출하지 않는다. 패키지의 src/index 공개 이름은 유지한다(07c 계획 9.2).
- `fieldNodeFactory`·`blueprint`를 재수출하는 이유는 core 밖의 시험·측정 도구(`bench/legacy-compare/`의 네 파일, `src/hooks/__tests__/createHookNode.ts`)가 core index를 생성 통로로 쓰기 때문이다. 제품 소비자는 없다.
- `__tests__/fixtures/testFieldNode.ts`는 engine index의 `FieldNodeRecord`를 바탕으로 시험용 자기 형과 구조 판정 좁히기를 제공한다. core 시나리오 러너, engine 시험과 `bench/legacy-compare/`의 독립 비교 스크립트 네 개는 클래스 identity 대신 레코드 칸으로 판정하고 공개 노드 동작은 surface 관문의 공개 노드 형으로 호출하며, `surface/runtime/FieldNode.ts` 클래스를 직접 가져오지 않는다.
- 자식 index 모양 검증은 `__tests__/surfaceIndex.test.ts`가 surface 관문을 소비하여 수행한다. 청사진 내부 검증은 blueprint 시험 구획이, 청사진과 검증·정착을 함께 쓰는 통합 검증은 engine 시험 구획이 소유한다.

- 공개 쓰기 옵션은 독립 비트 `Overwrite=1`, `Merge=2`, `DisableAutomaticWrites=4`, `EnableAutomaticWrites=8`이다. `Overwrite`와 `Merge`의 동시 지정은 쓰기 전에 `INVALID_WRITE_OPTION`으로 거부한다(LANDING-021·141). 내부 빈 옵션과 교체 표시는 같은 네 비트 계약을 사용한다.

### 진입점 표면

| 심볼                                                                                               | 계약                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FieldNode` 및 타입별 노드                                                                         | `value`·`outputValue`·`setValue`·`validate`·`subscribe`·`find`·`revision` 등 노드 공개 표면                                                                      |
| `isFieldNode` · `isBranchNode` · `isTerminalNode` · 타입별 가드                                    | 런타임 타입 판별                                                                                                                                                 |
| `FieldNodeState`                                                                                   | Dirty=1·Touched=2·ErrorVisible=4를 내부와 공개 경계에서 같은 이름으로 사용하며 별칭을 두지 않는다(SURFACE-056·060, LANDING-157).                               |
| `SetValueOption` · `ValidationMode`                                                                | 쓰기 옵션 비트·검증 모드 열거값                                                                                                                                  |
| `FieldNodeEventType` · `FieldNodeRequestType`                                                      | 새 엔진의 공개 사건·명령 열거값(EVENT-073, LANDING-067)                                                                                                          |
| 바인딩 전용 생성·마운트·폼 로드·인계·입력 쓰기·입력 마침·상호작용 초기화 번호 읽기                 | `surface/DETAIL.md`의 통로 계약을 이름으로 다시 내보내며 `src/index.ts`는 내보내지 않음(69C-01·02, 70C-01)                                                       |
| `setContext(root, context)`                                                                        | 새 엔진의 바인딩 전용 내부 통로를 이름으로 다시 내보냄. 패키지 공개 `src/index.ts`에는 노출하지 않음(NODE-010, SURFACE-055, 28C-08)                              |
| `retainValidationRoot(validator, authoredRoot)` · `releaseValidationRoot(validator, authoredRoot)` | 바인딩 이펙트의 수명 증감 통로를 `engine/validation/index.ts`에서 이름으로 다시 내보냄. 패키지 공개 `src/index.ts`에는 노출하지 않음(VALIDATE-021·045, NODE-010) |
| `scheduleValidationSlot(run)` | RootNodeContext의 마운트 검증이 쓰기 검증과 같은 다음 화면 뒤 슬롯을 쓰도록 validationScheduling·engine 경계를 통해 명명 재수출한다. 패키지 공개 `src/index.ts`와 공개 선언에는 노출하지 않는다(IR-6). |
| `hasFieldNodeValidationRequest(node)` | validation→engine의 양수 스탬프 조회를 surface 바인딩 래퍼로 연결하여 RootNodeContext의 마운트 의무를 판정한다. 공개 노드의 runtime을 노출하지 않으며 src/index는 넓히지 않는다(IR-6 R2, 코디네이터 승인 msg_7e0a5ed0ffd3). |

시험·측정 도우미 서명: `src/__tests__/fixtures/nodeFromJSONSchema.ts`는 core index의 `buildFieldNodeTree`·`mountFieldNode` 통로를 이어 마운트된 루트를 반환한다. `validator`는 `{ compile, compileGuard, release?, dialect? }` 객체이고, `deferMountValidation`의 기본값은 거짓이다(70C-01, VALIDATE-010, CONTROLS-075).

```ts
nodeFromJSONSchema<Schema extends AuthoredSchema>(props: {
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
  isTerminal?: BlueprintOptions['isTerminal'];
  isAtomic?: (value: unknown) => boolean;
  deferMountValidation?: boolean;
}): InferFieldNode<Schema>
```

### 값 채널 규약

생성 입력의 기본값은 `InferValueType<Schema>` 계약을 따르며, 청사진과 동작 행이 원본 해석·계산·투영을 구분한다(VALUE-002·027, 70C-01).

| 채널                 | 읽는 곳                                           | 특성                       |
| -------------------- | ------------------------------------------------- | -------------------------- |
| `value` (계산)       | `UpdateValue` payload, 입력 props, 편집 상태 관측 | 원본을 해석·조립한 편집 값 |
| `outputValue` (투영) | 루트 검증, 루트 방출, `FormHandle.getValue`·제출  | 스키마 출력 옵션 적용      |

두 채널을 섞으면 편집 중인 화면이 정제 때문에 접히거나, 반대로 정제되지 않은 값이 폼 밖으로 나간다. 새 소비 지점을 추가할 때는 그 값이 밖으로 나가는지 안에 머무는지를 먼저 정하고 채널을 고른다.

### 노드 타입 추가

노드 종류는 청사진과 동작 행으로 정의하고 단일 런타임 겉면 계약을 따른다. 시험·측정 도우미 `nodeFromJSONSchema`와 `<Form>`은 같은 새 엔진 생성 통로를 사용하며 `AbstractNode` 상속을 요구하지 않는다(NODE-010, LANDING-067, 70C-01).

공개 `InferFieldNode`는 NODE-059에 따라 형 없는 `oneOf`·`anyOf`의 모든 분기가 인라인 객체 또는 인라인 배열 스키마일 때만 각각 `ObjectNode`·`ArrayNode`로 좁힌다. `$ref`, 게이트 분기, 두 키워드의 동시 사용, 본체 `allOf`는 넓은 `FieldNode`를 유지한다. 형 없는 분기 없는 `const`·`enum` 칸은 리터럴의 JSON 종류에 맞는 원시 노드로 좁힌다.

## Acceptance Criteria

### observation-identity-portability — 검증 전용 occurrence 결속

- 원래 selection collector의 실제 rules·ruleSources·ruleTargets 소실에 의한 거짓 동치와 raw occurrence offset에 의한 거짓 차이를 재현하고, 완전 capture는 그 오류를 구별한다.
- 실제 source/raw A/raw B의 producer와 reader가 같은 module에 결속되고 fixture graph에는 engine/producer가 없다. 명시 입력 SHA, 원문 prefix/footer, compiler/parser/dependency와 source graph 계보를 검증하며 cached output·잘못된 입력·literal을 바꾸는 서식 변환은 거절한다.
- 원형58 호환과 helper 회귀, source-owner와 injection 목적지 구별·readonly 무할당·rebirth/held history·잘못된 owner 거절을 Node/Bun에서 별도 단위로 검증한다. 과거 live66 및 성능·후속 제품 가설의 결과를 이번 실행으로 합산하지 않는다.

### two-channel — 두 채널이 분리되어 있다

- `options.omitTrailing`이 켜진 배열 노드에서 `node.value`에는 후행 빈 항목이 남아 있고 `node.outputValue`에는 없다.
- 정제되지 않는 노드 타입에서는 두 값이 같다.

### normalize-preserves-tree — 정제는 트리를 건드리지 않는다

- 정제로 항목이 걸러진 뒤에도 `ArrayNode`의 자식 노드 수는 줄지 않는다.
- 걸러진 위치에 값을 넣으면 그 항목이 다시 정제 결과에 나타난다.

### factory-single-path — 트리 생성 경로는 하나다

- `nodeFromJSONSchema`(시험·측정 도우미)와 `<Form>`이 같은 `buildFieldNodeTree` 통로를 사용하고, 마운트된 루트는 스키마 종류에 맞는 공개 노드 형·가드 계약을 만족한다(70C-01, VALIDATE-010).

### scenario-runner — 코어 시나리오 실행 소유

- 시나리오 명세 표는 각 부류의 장면 목록에서 생성되므로 사례 수를 정적으로 셀 수 없으며 `spec-document-case-cap`은 `indeterminate`로 유지한다(60C-01).
- TEST-023에 따라 코어 시험이 공유 시나리오 데이터를 해석한다. 비공개 시나리오 패키지는 코어 실행기를 소유하지 않는다.
- 주입된 코어 어댑터가 단계를 순서대로 한 번씩 실행하며 정착을 기다린 뒤 기대를 검사하고 실패를 호출자에게 전달한다.
- 규칙 대상의 강화 관측은 실행 모듈의 기존 ID 조회와 실제 live·retained·retired 노드 참조를 연결한다. 같은 경로·종류의 최신 노드 추정이나 임의 출현 순서로 수명 차이를 숨기지 않으며, 알 수 없거나 모호하거나 서로 충돌하는 연결은 실패로 보고한다.
- 강화 관측은 규칙 키의 첫 일곱 항목과 양방향 경로 색인, 별칭·사건·호출자 공유 참조를 보존한다. `injectTo`의 규칙 소유 노드와 실제 주입 목적지를 구별하고, 대상 ID가 없는 다섯 항목 정책 키에 없는 대상 색인을 요구하지 않는다. 기존 source 특성화·비용 spy와 격리 모듈의 강화 관측은 별도 증거로 유지한다.
- 각 부류의 시나리오를 새 `FieldNode` 트리에서 실행하고 단계별 형상·방출·진단·상태 키를 검증한다. `reset`은 루트 폼 수준 로드이며 `resetSubtree()`는 해당 하위 트리만 로드한다(TEST-011·016·019·023, SETTLE-049).

### scenario-value — 값 부류 시나리오

- 공유 `value` 부류의 모든 시나리오가 코어 실행기에서 기대한 원본·방출·misfit 기록을 낸다(TEST-019·023).

### scenario-settle — 정착 부류 시나리오

- 공유 `settle` 부류의 모든 시나리오가 코어 실행기에서 기대한 형상·진단·예산 결과를 낸다(TEST-019·023).

### scenario-fill — 채움 부류 시나리오

- 공유 `fill` 부류의 모든 시나리오가 코어 실행기에서 기대한 채움 결과를 낸다(TEST-019·023).

### scenario-exit — 나감 부류 시나리오

- 공유 `exit` 부류의 모든 시나리오가 코어 실행기에서 기대한 나감 비움·잠복 결과를 낸다(TEST-019·023).

### scenario-union — union 부류 시나리오

- 공유 `union` 부류의 모든 시나리오가 코어 실행기에서 기대한 종류 선택·형상을 낸다(TEST-019·023).

### scenario-derive — 파생 부류 시나리오

- 공유 `derive` 부류의 모든 시나리오가 코어 실행기에서 기대한 에지 발화·같은 대상 순위·예산·`injectTo` 결과를 낸다(TEST-016·019·023, SETTLE-049).

### scenario-controls — 제어 부류 시나리오

- 공유 `controls` 부류의 모든 시나리오가 코어 실행기에서 기대한 상태 키 결합·범위·나감 층 결과를 낸다(TEST-019·023).

### scenario-array — 배열 부류 시나리오

- 공유 `array` 부류의 일반 장면에서 다섯 구조 동사와 배열 아이템 형상·identity·스냅숏·방출을 코어 실행기가 실제 노드에서 검사한다(TEST-011·018·023, NODE-051·052, WRITE-095·099, VALUE-034, LANDING-202·203, 26C-02).

### scenario-array-position — 위치 이동의 상태

- 구조 연산으로 이동한 아이템은 키와 노드 참조를 유지하며 상호 작용 상태가 새 위치를 따른다(TEST-018, NODE-051).

### scenario-array-terminal — 터미널 배열의 사본

- 터미널 배열의 다섯 동사는 매번 직전 원본을 보존하고 새 배열 사본을 기록한다(TEST-018, NODE-005).

### scenario-array-source-b — 원본 B 배열 구조 복원

- 예산 초과 때 자동 생성한 배열 아이템은 원본 B의 빈 형상으로 되돌아가고, 사용한 아이템 키는 재사용하지 않는다(TEST-018, WRITE-099).

### scenario-notify — 통지 부류 시나리오

- 공유 `notify` 부류의 모든 시나리오가 관찰 어댑터로 실행되어 기대한 배달 순서·명령·상태 사건·`onError` 기록을 낸다(EVENT-004·027, TEST-019·023).

### scenario-validation — 검증 부류 시나리오

- 공유 `validation` 부류의 모든 시나리오가 관찰 어댑터로 실행되어 기대한 판정·노드별 오류 라우팅·검증 불가 결과를 낸다(VALIDATE-043, TEST-019·023).

### scenario-differential — 같은 ajv 경로 비교

- 공유 `validation` 부류의 각 시나리오에서 코어 트리의 검증 판정과 오류 경로가 같은 Ajv로 작성 스키마를 직접 검증한 결과와 같다. 다른 구현과의 교차 대조(TEST-001)는 ajv가 아닌 검증기 플러그인이 생길 때까지 미룬다(소유자 결정: ajv만 지원).

### public-node-inference — 형 없는 스키마의 공개 노드 형

- 인라인 객체·배열 분기만 있는 칸은 대응 노드로 좁히고, 참조·게이트·두 키워드·본체 allOf가 있으면 넓은 노드 형을 유지한다.
- 분기 없는 단일 리터럴 종류의 `const`·`enum` 칸은 대응 원시 노드 형으로 좁힌다.
- 형 수준에서 청사진 오류를 확정할 수 있는 객체·배열 리터럴, 종류가 섞인 리터럴, 혼합 인라인 분기는 `never`이다. 정적 판정이 불가능한 모양만 넓은 노드 형을 유지한다.

- `__benchmarks__/`는 core의 자식 관문(`core/engine`·`core/surface`)으로 재는 vitest 벤치 일곱(`branch-strategy-init`·`compute-recalculate`·`event-cascade`·`find-node`·`nodeFromJSONSchema`·`object-pending-read`·`render-delay`)을 소유한다. `vitest.bench.config.ts`의 `benchmark.include`가 이 일곱을 이름으로 고르며, 벤치는 시험처럼 검증 organ이라 패키지 표면과 선언 빌드에 들지 않는다.

## Boundary Exemptions

### `__tests__/fixtures/createTestValidator.ts` — 레거시 비교 스크립트의 시험 검증기

- **Consumers**: `**/bench/legacy-compare/**`
- **Direct import**: `allowed`
- **Reason**: `bench/legacy-compare/`는 src 밖에서 레거시 코어와 새 코어를 나란히 재는 독립 스크립트 네 개(`array`·`derive-and-controls`·`dispatch-and-validation`·`node-and-settle`)의 자리이며 레거시와 함께 지운다. 그때까지 소유자 결정(276라운드, 대기열 49)으로 fractal import 규칙의 직접 import 금지에서 면제된다. 측정에 쓰는 시험 검증기를 제품 진입점에 공개하지 않고 그대로 읽는다.

## Last Updated

계약 기준: LANDING-067·087·205, CONTROLS-075, 69C-01–05, 70C-01, 100라운드, 정돈-1(2026-10-14); 정돈-2(2026-10-14).
