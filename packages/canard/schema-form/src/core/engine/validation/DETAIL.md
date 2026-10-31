# validation 계약

## Requirements

- 방향은 `blueprint < record < {behaviors, navigation} < validation < settle < dispatch < FieldNode`이다. `validation`은 위 세 fractal과 `app/plugin`을 타입으로도 가져오지 않으며, `write`가 제공한 결과 콜백만 호출한다(NODE-016·045, CONTROLS-075, LANDING-084).
- `FieldNodeRuntime`의 검증기, 검증 모드, 최신 커밋과 요청 스탬프, 보류 중인 실행, 노드 오류 맵을 소비한다. 사본, 가드, 전체 판정 함수의 캐시와 참조 수, 최근 해제 목록은 검증기 인스턴스별로 이 fractal이 소유하며 노드별 필드는 더하지 않는다(NODE-004·045, VALIDATE-018·021·048·049).

## API Contracts

- 활성 선언 ID와 오류 차이는 고전적인 루프로 수집하고 비교하며, 선언 ID의 펼침 배열은 만들지 않는다. 오류 순서, 범위 밖 오류, 재사용 참조는 그대로 유지한다. 시간 복잡도는 같고, callback과 선언 수에 비례하는 임시 배열 비용이 줄어든다(87라운드 원칙 3).

- 게이트가 없는 트리는 정적 선언을 청사진에서 공유하므로 발생 경로별로 활성 ID 복사본을 두지 않는다. 이때는 꺼진 union 분기가 없으므로 오류의 경로 라우팅만 적용한다. 게이트가 있으면 커밋된 활성 선언으로 꺼진 분기의 표시 오류를 계속 걸러 낸다. 검증기와 작성 루트의 캐시, source 선택은 바꾸지 않으며, 정적 트리에서 ID 집합을 반복해 할당하는 일만 없앤다(86C-02 ii, VALIDATE-043·048).

### 계약 형과 진입점

- `scheduleValidationSlot(run): void`는 호출할 때마다 환경을 읽는 바인딩 전용 실행 슬롯이다. 프레임 API가 없거나 문서가 숨겨졌으면 취소 가능한 매크로태스크를 예약한다. 그 밖에는 프레임 콜백 뒤 매크로태스크와 100ms 타이머를 경주시켜 정확히 한 번 실행하고 다른 핸들을 취소한다. 예약 시점의 프레임 취소 함수를 슬롯과 함께 보존하여 호스트의 전역 정리 뒤에도 같은 핸들을 취소한다. engine·core가 명명 재수출하여 RootNodeContext가 소비하며 패키지 공개 표면에는 추가하지 않는다(IR-6).
- `GuardFunction`은 동기 가드의 내부 형이며 validation index가 내보내지 않는다. core 시험 검증기는 engine index의 `Validator['compileGuard']` 반환형에서 가드 형을 유도한다. `readFieldNodeGuard`는 settle이 소비하는 validation 진입점 이름이며, engine과 core의 집계 index는 재수출하지 않는다.
- `__tests__/validation.retain-guard.test.ts`는 검증기 수명 유지와 동기 가드 읽기를 함께 검증하므로 validation이 소유한다. 플러그인 형이 검증기 형을 만족하는지는 app/plugin의 시험 구획이 검증한다. write와 공유하는 트리 생성 fixture는 engine의 공용 시험 구획에서 읽는다.

- `interface Validator { compile(copy: BlueprintSchema): ValidateFunction; compileGuard(root: BlueprintSchema, pointer: string): GuardFunction; release?(root: BlueprintSchema): void; readonly dialect?: string }`를 `types/validator.ts`가 선언한다. `type GuardFunction = (value: unknown) => boolean`이며 가드는 비동기 형식과 키워드를 지원하지 않는다. `type ValidateFunction<Value = unknown> = (data: Value) => Promise<readonly ValidationIssue[] | null> | readonly ValidationIssue[] | null`은 입력에 대한 판정을 돌려주고 던지지 않는 계약이다. 던지면 실행 실패이다(VALIDATE-015·016·044, ERROR-032).
- `interface ValidationIssue<SourceError = unknown> { dataPath: string; keyword?: string; message?: string; schemaPath?: string; rejectedKey?: string; details?: Record<string, unknown>; source?: SourceError }`는 `types/issue.ts`가 선언하는 정규화된 검증 결과이다(FRAGMENT-020·053, LANDING-070, VALIDATE-043).
- core는 `compile` 결과와 가드에 방출 트리를 참조 그대로 건네고, 검증기는 받은 값과 스키마를 바꾸지 않는다. 값을 바꾸는 사용자 정의 키워드를 쓰지 않을 책임은 소비자에게 있다. core는 `bind`를 호출하지 않고, 선택된 검증기를 트리 생성 인자로 받는다(VALIDATE-001·044·050, CONTROLS-075).
- `readFieldNodeGuard(runtime, gate)`는 `settle`이 쓰는 동기 가드 읽기이다. `requestFieldNodeValidation(root, deliver: (issues, commit) => void)`는 실행을 예약하고, `readFieldNodeErrors(node): readonly ValidationIssue[]`는 라우팅된 오류를 읽는다. `assertValidationRootReady(node)`는 재생성 인계 전에 새 루트의 전체 컴파일 실패를 동기로 드러내어 옛 사슬을 보존한다. `retainValidationRoot(validator, authoredRoot)`와 `releaseValidationRoot(validator, authoredRoot)`는 바인딩의 커밋 이펙트와 정리용으로 이름을 붙인 진입점이다. `EMPTY_GLOBAL_ERRORS`는 두 오류 층이 비었거나 아직 계산 전인 폼 목록이 공유하는 빈 배열이며, `FieldNode`의 `globalErrors` 읽기와 `write`의 발행 비교가 같은 참조를 쓰도록 진입점으로 내보낸다(VALIDATE-015·021·043·046·049, NODE-010).
- `readValidationEntry`는 첫 검증·가드 읽기에 검증기별 사본과 전체 컴파일 결과를 준비한다. `compileEntryGuards`는 개발 빌드의 트리 구성 단계에서 if 게이트가 있는 청사진의 가드를 준비하며, 이때 사본을 읽으므로 전체 스키마도 컴파일한다. if 게이트가 없는 개발 폼은 이 준비를 건너뛰며 None 모드에서는 컴파일하지 않는다 (다른 스키마로의 reset은 모드와 관계없이 `assertValidationRootReady`가 새 루트를 컴파일한다). 단순 보유는 컴파일을 시작하지 않는다. `runFieldNodeValidation`과 `routeValidationIssues`는 `write`가 명시적 `validate()`의 판정과 오류 표시를 순서대로 연결하는 통로이다. 이들은 패키지 공개 진입점으로 다시 내보내지 않는다. 검증 사본 함수는 이 fractal 내부 구현이며, 시험은 그 파일을 직접 읽는다(NODE-010, VALIDATE-017·018·043·048, LANDING-159).
- `Validator`와 새 엔진의 `ValidateFunction`은 이 fractal 안에서만 내보낸다. 바깥에 공개된 `ValidateFunction`과 `ValidatorFactory`는 07까지 레거시 형이고, 공개 `ValidatorPlugin`은 같은 메서드 서명의 선택 항목 `compileGuard?`, `release?`, `dialect?`를 더해 구조적으로 맞춘다. 수명 함수는 `core/index.ts`에만 다시 노출하고 패키지 공개 `src/index.ts`에는 두지 않는다(LANDING-036·084·159, VALIDATE-044, 32C-01, 34C-01).

### 사본, 가드, 수명

- 검증기 인스턴스마다 `WeakMap<작성 루트 객체, 항목>`을 둔다. 항목은 한 번 깊이 복사한 스키마에서 키워드 자리의 `controls`, `options`, `presentation`만 빼며(`options.virtual` 포함), `required`는 고쳐 쓰지 않는다. `compile`, 모든 `compileGuard`, `release`는 항목의 동일한 사본 객체를 받고, 가드 포인터는 작성 루트 안의 위치를 그대로 가리킨다. 가드 표는 이 위치를 키로 삼아 전체 검증 함수나 그 실패를 같은 항목에 보관한다(VALIDATE-017–019·034·048).
- 프로덕션에서는 처음 평가할 때 가드를 컴파일한다. 개발 모드에서는 if 게이트가 있을 때 트리 구성 중 캐시 항목마다 한 번 모든 가드와 전체 스키마를 미리 컴파일한다. 보유에서 전체 컴파일을 없애는 절감은 production 빌드에 적용되며, 개발 빌드의 guard-free 폼도 전체 검증이 실행되기 전에는 컴파일하지 않는다. 실패는 캐시하지만, 그 가드를 소비하는 폼마다 가드 하나당 자기 `GUARD_FAILED`를 한 번 기록한다. 같은 폼에서 같은 가드가 뒤이어 실패하면 던지기만 하고 다시 기록하지 않는다. 프로덕션에서 평가되지 않은 가드는 기록하지 않는다. 실패하거나 던지거나 boolean이 아닌 결과를 내면 해당 게이트를 거짓으로 정착시킨다(VALIDATE-015·047·048, ERROR-041·164).
- 보유는 컴파일하지 않고 참조 수와 최근 해제 목록만 갱신한다. 첫 `readValidationEntry`가 사본과 전체 검증 함수를 준비하며, 이미 보유한 루트의 참조 수를 덮어쓰거나 최근 목록에 넣지 않는다. 동기 가드 읽기도 이 컴파일 경로를 사용한다.
- 참조 수는 커밋 이펙트에서 올리고 정리에서 내린다. 참조 수가 0이 된 작성 루트는 인스턴스마다 크기 8인 최근 해제 목록에 들어간다. 목록에서 밀려나거나 같은 `$id`를 다시 등록하기 직전에, 캐시 항목이 있을 때만 그 사본으로 `release(root)`를 한 번 호출하고 core 캐시를 지운다. 목록 안에서 돌아온 같은 객체는 다시 컴파일하지 않는다. 커밋되지 않은 트리도 참조 수 0으로 이 목록에 들어간다(VALIDATE-021·045·048).
- 서로 다른 작성 루트 객체가 같은 `$id`를 가진 채 동시에 살아 있어도 각 트리는 자기 루트로 판정한다. 등록 충돌 없이 루트별로 격리할 책임은 플러그인에 있고, core는 `$id`를 고치지 않는다. 재생성 reset에서 새 루트의 컴파일이 실패하면 옛 트리를 유지해 전환의 원자성을 지킨다(VALIDATE-046, ERROR-201).

### 실행과 오류 배정

- 외부 검증기가 만든 dataPath는 parseStandardPointer로 해석하여 예약 이름도 리터럴 속성으로 라우팅합니다. 소비자에게 제공하는 경로는 이름을 formatSegment로 조립한 확장 경로이며 같은 이름을 node.find로 다시 찾을 수 있습니다.

- 검증기 dataPath는 RFC 이름으로 해석하며 `/`와 `#/`는 빈 이름 자식입니다. 루트는 빈 문자열과 `#`이고 검증 전용 별칭은 없습니다. 빈 이름 자식이 없으면 루트에 잘못 배정하지 않습니다. 바뀌지 않은 이슈의 배열·항목 참조는 유지합니다. 포인터가 아닌 문자열(`/`나 `#`로 시작하지 않는 값)이나 잘못된 퍼센트 이스케이프를 가진 dataPath는 해석하지 않은 채 주인이 없는 오류로 남고 검증을 실패시키지 않습니다. schemaPath는 절대 포인터일 때만 정규형으로 바꾸며, 해석할 수 없으면 원문을 유지하고 dataPath 라우팅은 그대로 진행합니다.

- 소멸한 노드의 `errors`는 떼어질 때 갈무리한 마지막 오류 배열을 같은 참조로 돌려준다. 활성 검증 맵과 외부 오류 맵에서는 그 노드를 제거하며, 옛 참조는 살아 있는 트리의 새 오류를 읽지 않는다(NODE-044, 35C-09).

- 검증 요청이 필요한 가장 바깥 진입에서는 요청을 한 번 만들고, 다음 화면 뒤 슬롯에서 최신 커밋 번호 하나만 실행한다. 한 프레임 안의 여러 쓰기는 합쳐지고 새 값이 이전 오류와 최소 한 프레임 함께 보일 수 있다. 늦게 도착한 결과와 폐기된 루트의 대기는 스탬프로 버리고, 최신 결과만 넘겨받은 콜백을 통해 별도 파동으로 보낸다. `validate()`와 제출은 슬롯을 거치지 않고 새 스냅숏을 즉시 판정한다. 하위 트리의 명시적 검증은 공유 스탬프와 대기 대상을 보존하여 전체 폼 쓰기 검증을 취소하지 않는다(EVENT-031·032·046, VALIDATE-006·007, IR-6).
- 라우팅은 판정을 바꾸지 않는다. 모든 issue를 순서대로 라우팅 목록에 보존하고, 폼 수준 `globalErrors`는 루트 외부 오류를 앞에, 그 검증 목록을 뒤에 둔다. 루트 외부 오류나 라우팅 목록이 바뀔 때만 합친 배열을 갱신하며, 반복해서 읽으면 같은 참조를 반환한다. 루트가 아닌 노드의 명령형 외부 오류는 해당 노드의 `errors`에만 남는다(SURFACE-053, VALIDATE-043, 79C-01).
- 검증(하위 대상과 명시적 `validate()` 포함)의 새 결과가 직전 결과와 깊이 같으면(길이와 순서, 항목의 모든 필드) 직전 배열의 항목 객체로 배정한다. 배정이 실제로 바뀐 노드(분기 전환, 항목 삭제 뒤 같은 경로에 온 다른 노드)만 `UpdateError`를 받고, 배정이 같은 노드는 직전 `errors` 배열을 같은 참조로 유지한다. 라우팅 목록 참조가 같으므로 `globalErrors`도 같은 참조이고, `UpdateGlobalError`를 보내지 않아 `onValidate`도 호출하지 않는다. 명시적 `validate()`는 그 목록으로 끝난다. 직전 결과는 루트 런타임의 `validationResult`이며, 대상과 관계없이 배정할 때마다 기록하고 reset만 비운다. 직전 결과가 없으면 빈 결과도 발행한다. 외부 오류는 이 비교와 관계없이 유지된다(EVENT-046, GOAL-011, LANDING-210, SURFACE-053, 207C-01).
- 표준 이름으로 해석한 `dataPath`가 가리키는, 형상 안의 노드에 검증 issue를 배정한다. `required`는 빠진 자식 경로로 배정되고, `rejectedKey`는 그 키를 가진 호스트가 받는다. 터미널 아래 경로는 터미널이 받고, 형상 밖 경로의 오류는 주인이 없는 오류가 된다(VALIDATE-043 (1)–(4), FRAGMENT-020·053).
- 표시에서는 꺼진 `oneOf`·`anyOf` 분기의 issue만 청사진 조각 표와 `schemaPath`로 걸러 낸다. 분기를 가려낼 수 없으면 거르지 않으며, `allOf`, `if`, `controls.active`는 이 필터의 대상이 아니다. union 호스트의 형 오류는 호스트에 둔다. 검증 판정과 폼 수준 목록은 그대로 유지한다(VALIDATE-043 (5)–(6), VALIDATE-051).
- 검증기가 없고 모드가 `None`이 아니면 트리마다 `VALIDATOR_MISSING`을 한 번 경고하고, `if` 조각을 끄고 `CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR`를 한 번 경고한다. 전체 컴파일 실패는 로드마다 `VALIDATOR_COMPILE_FAILED` 하나를 첫 검증이나 `validate()`에서 드러내며, 노드 `errors`에는 넣지 않는다. 같은 `$id`를 등록하다 충돌이 나서 컴파일에 실패한 경우에는 `VALIDATOR_COMPILE_FAILED`나 `GUARD_FAILED`의 `details`에 `reason: 'duplicateSchemaId'`와 `$id`를 싣는다. 실행 중 throw는 `VALIDATOR_THREW`로 `validate()`를 거부하거나 `OnChange`에서 한 번 보고한 뒤 싱크로 보내며, 미처리 거부로 남기지 않는다(ERROR-146–157, ERROR-019·039·201, VALIDATE-042, 31C-03).
- 검증기가 없고 모드가 `None`이 아니면 트리마다 `VALIDATOR_MISSING`을 한 번 경고하고, `if` 조각을 끄고 `CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR`를 한 번 경고한다. 전체 컴파일 실패는 로드마다 `VALIDATOR_COMPILE_FAILED` 하나를 첫 검증이나 `validate()`에서 드러내며, 노드 `errors`에는 넣지 않는다. `OnChange`의 첫 실패는 보고기에 이어 싱크로도 보내고, 명시적 `validate()`는 거부하기 전에 `surface: 'rejected'`로 보고한다. 같은 `$id`를 등록하다 충돌이 나서 컴파일에 실패한 경우에는 `VALIDATOR_COMPILE_FAILED`나 `GUARD_FAILED`의 `details`에 `reason: 'duplicateSchemaId'`와 `$id`를 싣는다. 실행 중 throw는 `VALIDATOR_THREW`로 `validate()`를 거부하거나 `OnChange`에서 한 번 보고한 뒤 싱크로 보내며, 미처리 거부로 남기지 않는다(ERROR-146–157, ERROR-019·022·039·155·201, VALIDATE-042, 31C-03).
- 검증기가 선언한 `dialect`와 작성 스키마의 `$schema`가 서로 다르면, 트리를 생성할 때 개발 모드에서만 `SCHEMA_FORM_WARNING.DIALECT_MISMATCH`로 보고한다. 둘 중 하나가 없거나 프로덕션이면 비교하지 않는다(VALIDATE-026·044, ERROR-188·199).

## Acceptance Criteria

### validation-guard — 캐시와 동기 판정

- 같은 검증기와 작성 루트는 사본, 가드, 전체 컴파일을 공유하고, 다른 객체는 공유하지 않는다. 가드가 실패하면 게이트가 거짓이 되며, 폼마다 규정된 시점에 기록된다(VALIDATE-015·018·047·048, ERROR-041).

### validation-route — 판정과 표시 분리

- 원래 판정과 검증 목록의 순서는 유지하고, 루트 `''`, 누락된 키, 터미널, 꺼진 분기, union 호스트는 원장의 규칙대로 배정한다. 폼 목록은 루트 외부 오류 다음에 검증 목록이 오는 순서이며 루트가 아닌 노드의 외부 오류는 포함하지 않고, 바뀌지 않은 읽기는 같은 참조를 돌려준다. 깊이 같은 검증 결과에서는 `globalErrors`와, 배정이 같은 노드의 `errors`가 같은 참조로 남고 `UpdateGlobalError`도 보내지 않으며, 배정이 바뀐 노드만 갱신한다. 루트 외부 오류를 비울 때와 reset·인계에서도 두 층의 현재 값을 반영한다(VALIDATE-043·051, SURFACE-053, WRITE-045, 79C-01, FRAGMENT-020·053).

### validation-lifetime — 수명과 최신 결과

- 프레임 API·문서 가시성은 호출 시점에 판정하며, 프레임과 타이머가 모두 도착해도 슬롯은 한 번만 실행한다. 숨은 문서는 프레임을 기다리지 않으며 예약 후 숨겨진 문서는 100ms 타이머로 대체되지만 백그라운드 타이머 제한을 받을 수 있다(IR-6).
- 읽기 없이 보유·해제한 루트는 컴파일하지 않으며, 보유 뒤 처음 읽어도 참조 수를 유지한다. 해제 전에 다시 마운트하면 재컴파일하지 않고, 등록 수는 살아 있는 루트 수 + 8 이하이며, 오래된 커밋의 결과는 배달하지 않는다. 같은 `$id`를 가진 서로 다른 살아 있는 작성 루트는 각자 자기 루트로 판정하고, 재생성 reset에서 새 루트의 컴파일이 실패하면 옛 트리를 보존한다(VALIDATE-021·045·046·049, EVENT-046).

## Boundary Exemptions

### `types/` — 형 칸 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: 형 칸의 형은 이름으로 진입점을 거쳐 write·engine·core의 집계 진입점과 플러그인 검증 계약에 제공되며, 형은 구현이 아니므로 칸에 두고 진입점이 이름으로 내보낸다.

## Last Updated

2026-10-30
