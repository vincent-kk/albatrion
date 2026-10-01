# validation 계약

## Requirements

- 방향은 `blueprint < record < {behaviors, navigation} < validation < settle < dispatch < SchemaNode`입니다. `validation`은 위 세 fractal과 `app/plugin`을 타입으로도 가져오지 않으며, `dispatch`가 제공한 결과 콜백만 부릅니다(NODE-016·045, CONTROLS-075, LANDING-084).
- `SchemaNodeRuntime`의 검증기·검증 모드·최신 커밋/요청 스탬프·보류 실행·노드 오류 맵을 소비합니다. 사본/가드/전체 판정 함수 캐시와 참조 세기/최근 해제 목록은 검증기 인스턴스별로 이 fractal이 소유하며 노드별 필드를 더하지 않습니다(NODE-004·045, VALIDATE-018·021·048·049).

## API Contracts

### 계약 형과 진입점

- `interface Validator { compile(copy: BlueprintSchema): ValidateFunction; compileGuard(root: BlueprintSchema, pointer: string): GuardFunction; release?(root: BlueprintSchema): void; readonly dialect?: string }`를 `type.ts`가 선언합니다. `type GuardFunction = (value: unknown) => boolean`이며 가드는 비동기 형식·키워드를 지원하지 않습니다. `type ValidateFunction<Value = unknown> = (data: Value) => Promise<readonly ValidationIssue[] | null> | readonly ValidationIssue[] | null`은 입력 판정을 돌려주고 던지지 않는 계약입니다. 던짐은 실행 실패입니다(VALIDATE-015·016·044, ERROR-032).
- `interface ValidationIssue<SourceError = unknown> { dataPath: string; keyword?: string; message?: string; schemaPath?: string; rejectedKey?: string; details?: Record<string, unknown>; source?: SourceError }`는 정규화된 검증 결과입니다(FRAGMENT-020·053, LANDING-070, VALIDATE-043).
- core는 `compile` 결과와 가드에 방출 트리를 참조 그대로 건네고 검증기는 받은 값과 스키마를 바꾸지 않습니다. 값을 바꾸는 사용자 정의 키워드를 쓰지 않을 책임은 소비자에게 있습니다. core는 `bind`를 부르지 않고 선택된 검증기를 트리 생성 인자로 받습니다(VALIDATE-001·044·050, CONTROLS-075).
- `readSchemaNodeGuard(runtime, gate)`는 `settle`이 쓰는 동기 가드 읽기입니다. `requestSchemaNodeValidation(root, deliver: (issues, commit) => void)`는 실행을 예약하고, `readSchemaNodeErrors(node): readonly ValidationIssue[]`는 라우팅된 오류를 읽습니다. `assertValidationRootReady(node)`는 재생성 인계 전 새 루트의 전체 컴파일 실패를 동기로 드러내어 옛 사슬을 보존합니다. `retainValidationRoot(validator, authoredRoot)`·`releaseValidationRoot(validator, authoredRoot)`는 바인딩의 커밋 이펙트/정리용 이름 붙은 진입점입니다(VALIDATE-015·021·043·046·049, NODE-010).
- `readValidationEntry`와 `compileEntryGuards`는 `SchemaNode` 생성 시 검증기별 사본과 개발 모드 가드를 준비합니다. `createValidatorCopy`는 코어 검증기 fixture가 같은 사본 규칙으로 플러그인 계약을 확인하는 데 씁니다. `runSchemaNodeValidation`과 `routeValidationIssues`는 `dispatch`가 명시적 `validate()`의 판정과 오류 표시를 순서대로 연결하는 통로입니다. 이들은 패키지 공개 진입점으로 다시 내보내지 않습니다(NODE-010, VALIDATE-017·018·043·048, LANDING-159).
- `Validator` 및 새 엔진의 `ValidateFunction`은 이 fractal 안에서만 내보냅니다. 바깥 공개 `ValidateFunction`·`ValidatorFactory`는 07까지 레거시 형이고, 공개 `ValidatorPlugin`은 같은 메서드 서명의 선택 `compileGuard?`·`release?`·`dialect?`를 더해 구조적으로 맞춥니다. 수명 함수는 `core/index.ts`에만 다시 노출하고 패키지 공개 `src/index.ts`에는 두지 않습니다(LANDING-036·084·159, VALIDATE-044, 32C-01, 34C-01).

### 사본, 가드, 수명

- 검증기 인스턴스마다 `WeakMap<작성 루트 객체, 항목>`을 둡니다. 항목은 한 번 깊이 복사한 스키마에서 키워드 자리의 `controls`·`options`·`presentation`만 빼며(`options.virtual` 포함), `required`를 고쳐 쓰지 않습니다. `compile`, 모든 `compileGuard`, `release`는 항목의 동일한 사본 객체를 받으며, 가드 포인터는 작성 루트 안의 위치를 그대로 가리킵니다. 가드 표는 이 위치로 키를 잡고 전체 검증 함수 또는 그 실패를 같은 항목에 보관합니다(VALIDATE-017–019·034·048).
- 프로덕션은 처음 평가할 때 가드를 컴파일합니다. 개발 모드는 캐시 항목마다 한 번 모든 가드를 마운트 커밋 뒤 미리 컴파일합니다. 실패는 캐시하지만 소비하는 폼마다 자기 `GUARD_FAILED`를 기록하며, 프로덕션의 미평가 가드는 기록하지 않습니다. 실패/던짐/boolean 아닌 결과는 해당 게이트를 거짓으로 정착시킵니다(VALIDATE-015·047·048, ERROR-041·164).
- 참조 수는 커밋 이펙트에서 올리고 정리에서 내립니다. 0인 작성 루트는 인스턴스마다 크기 8의 최근 해제 목록에 들며, 밀려나거나 같은 `$id`를 재등록하기 직전에 캐시 항목이 있을 때만 그 사본으로 `release(root)`를 한 번 부르고 core 캐시를 지웁니다. 목록 안에 돌아온 같은 객체는 다시 컴파일하지 않습니다. 커밋되지 않은 트리도 참조 수 0으로 이 목록에 듭니다(VALIDATE-021·045·048).
- 서로 다른 작성 루트 객체가 같은 `$id`를 가진 채 동시에 살아 있어도 각 트리는 자기 루트로 판정합니다. 등록 충돌 없이 루트별로 격리할 책임은 플러그인에 있고 core는 `$id`를 고치지 않습니다. 재생성 reset에서 새 루트 컴파일이 실패하면 옛 트리를 유지해 전환의 원자성을 지킵니다(VALIDATE-046, ERROR-201).

### 실행과 오류 배정

- 검증 요청이 필요한 최외곽 진입에서는 요청을 한 번 만들고 마이크로태스크에서 최신 커밋 번호 하나만 실행합니다. 늦은 결과는 버리고 최신 결과만 받은 콜백을 통해 별도 파동에 보냅니다. `validate()`와 제출은 새 스냅숏을 다시 판정합니다(EVENT-031·032·046, VALIDATE-006·007·049).
- 라우팅은 판정을 바꾸지 않습니다. 모든 issue를 순서대로 루트 `globalErrors`에 두고 정규화된 `dataPath`(`'/'`도 루트 `''`)의 형상 안 노드에 배정합니다. `required`는 빠진 자식 경로이고 `rejectedKey`는 그 키를 가진 호스트가 받습니다. 터미널 아래 경로는 터미널이 받고 형상 밖은 주인 없는 오류입니다(VALIDATE-043 (1)–(4), FRAGMENT-020·053).
- 표시에서는 꺼진 `oneOf`·`anyOf` 분기의 issue만 청사진 조각 표와 `schemaPath`로 거릅니다. 분기를 가릴 수 없으면 거르지 않으며 `allOf`·`if`·`controls.active`는 이 필터 대상이 아닙니다. union 호스트의 형 오류는 호스트에 둡니다. 검증 판정과 폼 수준 목록은 그대로 유지합니다(VALIDATE-043 (5)–(6), VALIDATE-051).
- 검증기가 없고 모드가 `None`이 아니면 트리마다 `VALIDATOR_MISSING` 한 번을 경고하고 `if` 조각을 끄며 `CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR`를 한 번 경고합니다. 전체 컴파일 실패는 로드마다 `VALIDATOR_COMPILE_FAILED` 하나를 첫 검증/`validate()`에서 드러내고 노드 `errors`에는 넣지 않습니다. 동일 `$id` 등록 충돌로 컴파일에 실패한 경우 `VALIDATOR_COMPILE_FAILED` 또는 `GUARD_FAILED`의 `details`에 `reason: 'duplicateSchemaId'`와 `$id`를 싣습니다. 실행 중 throw는 `VALIDATOR_THREW`로 `validate()`를 거부하거나 `OnChange`에서 한 번 보고한 뒤 싱크로 보내며 미처리 거부로 남기지 않습니다(ERROR-146–157, ERROR-019·039·201, VALIDATE-042, 31C-03).
- 검증기가 없고 모드가 `None`이 아니면 트리마다 `VALIDATOR_MISSING` 한 번을 경고하고 `if` 조각을 끄며 `CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR`를 한 번 경고합니다. 전체 컴파일 실패는 로드마다 `VALIDATOR_COMPILE_FAILED` 하나를 첫 검증/`validate()`에서 드러내고 노드 `errors`에는 넣지 않습니다. `OnChange`의 첫 실패는 보고기 뒤에 싱크로도 보내고, 명시적 `validate()`는 거부 전에 `surface: 'rejected'`로 보고합니다. 동일 `$id` 등록 충돌로 컴파일에 실패한 경우 `VALIDATOR_COMPILE_FAILED` 또는 `GUARD_FAILED`의 `details`에 `reason: 'duplicateSchemaId'`와 `$id`를 싣습니다. 실행 중 throw는 `VALIDATOR_THREW`로 `validate()`를 거부하거나 `OnChange`에서 한 번 보고한 뒤 싱크로 보내며 미처리 거부로 남기지 않습니다(ERROR-146–157, ERROR-019·022·039·155·201, VALIDATE-042, 31C-03).
- 검증기가 선언한 `dialect`와 작성 스키마 `$schema`의 불일치는 트리 생성 때 개발 모드에서만 `SCHEMA_FORM_WARNING.DIALECT_MISMATCH`로 보고합니다. 둘 중 하나가 없거나 프로덕션이면 비교하지 않습니다(VALIDATE-026·044, ERROR-188·199).

## Acceptance Criteria

### validation-guard — 캐시와 동기 판정

- 같은 검증기·작성 루트는 사본/가드/전체 컴파일을 공유하고 다른 객체는 공유하지 않습니다. 가드 실패는 게이트를 거짓으로 하며 폼마다 규정된 시점에 기록됩니다(VALIDATE-015·018·047·048, ERROR-041).

### validation-route — 판정과 표시 분리

- 원래 판정과 `globalErrors` 순서는 유지하고 루트 `''`, 누락 키, 터미널, 꺼진 분기, union 호스트를 원장의 규칙으로 배정합니다(VALIDATE-043·051, FRAGMENT-020·053).

### validation-lifetime — 수명과 최신 결과

- 해제 전 재마운트는 재컴파일하지 않고 등록 수는 살아 있는 루트 수 + 8 이하이며, 오래된 커밋 결과는 배달하지 않습니다. 같은 `$id`의 서로 다른 살아 있는 작성 루트는 각자 자기 루트로 판정하고 재생성 reset의 새 루트 컴파일 실패는 옛 트리를 보존합니다(VALIDATE-021·045·046·049, EVENT-046).

## Last Updated

2026-10-01
