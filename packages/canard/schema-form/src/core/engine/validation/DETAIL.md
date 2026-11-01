# validation 계약

## Requirements

- 방향은 `blueprint < record < {behaviors, navigation} < validation < settle < dispatch < FieldNode`이다. `validation`은 위 세 fractal과 `app/plugin`을 타입으로도 가져오지 않으며, `write`가 제공한 결과 콜백만 호출한다(NODE-016·045, CONTROLS-075, LANDING-084).
- `FieldNodeRuntime`의 검증기, 검증 모드, 최신 커밋과 요청 스탬프, 보류 중인 실행, 노드 오류 맵을 소비한다. 사본, 가드, 전체 판정 함수의 캐시와 참조 수, 최근 해제 목록은 검증기 인스턴스별로 이 fractal이 소유하며 노드별 필드는 더하지 않는다(NODE-004·045, VALIDATE-018·021·048·049).

## API Contracts

- H: 오류는 현재 적격이며 마지막 release 이후 모든 state·enabled·커밋 정책 조합에서 계속 적격일 때만 표시한다. 잠깐이라도 부적격이면 다음 release를 기다리며 숨김은 즉시다. release는 pending true→false 정착, 조용한 post-paint drop, 수락한 explicit root 판정, 폐기다. pending이 없어도 새 표시는 약2프레임 뒤 release에서 나타난다. OnChange가 아니면 live 조건만 사용한다. 미룬 로드 시작은 이전 요청을 버리고 pending true→false 정착으로 reveal hold를 해제한다.
- H 바인딩은 readFieldNodeRevealBaseline(노드 이력), readFieldNodeRevealPolicy(커밋 값·정책 이력), readFieldNodeRevealVersion, subscribeFieldNodeRevealReleased, commitFieldNodeRevealPolicy를 validation→engine→surface wrapper→core로만 잇는다. src/index·공개 사건·revision은 넓히지 않는다.
- H lifetime: 예약 generation 이하의 node/policy entry만 drop하고 빈 노드 이력을 제거한다. pending인 drop은 아무것도 제거하지 않고 owed/token을 지운다. 남은 이력의 재예약까지 끝낸 뒤 release version을 증가시키고 복사한 release listeners를 마지막에 통지하여 listener의 새 기록이 독립 예약을 만든다. settle은 true→false에서 listener 전에 전체 해제하며 unavailable의 기존 정착 경로도 유지한다. 미룬 로드 시작은 이전 요청을 버리고 pending true→false 정착으로 reveal hold를 해제한다.
- 수락한 explicit root verdict는 route 뒤 deliverValidationWave 전에 정확히 한 번 release한다. pending이면 settleFieldNodeValidation이 해제하고 아니면 전체 release를 직접 호출한다. listener의 재진입 쓰기가 기록한 새 이력은 두 번째 release로 지우지 않는다. 폐기는 release listener를 settle 전에 비워 조용히 전체 해제한다.
- 자동 로드 컴파일 실패는 모드·Always·자식 layout 쓰기와 무관하게 origin validate 기록과 호스트에 한 번씩 보고한다. 명시적 검증이 먼저 실패를 보고하면 슬롯은 중복 보고하지 않는다.
- 알려진 한계는 hook disabled의 즉시 reveal, drop보다 늦은 state/enabled render의 hold 생략, commit-only 연속의 hold, release와 paint 사이 task의 쓰기가 released verdict를1~2프레임 표시함, 한 React batch 안의 미표시 state/enabled/policy 조합도 이력에 포함됨이다.

- W3: prepareFieldNodeValidation은 active entry·비deferred OnChange·available·방출 변경 또는 validationTargets라는 실제 요청 조건을 공유하며 첫 공개 배달 전에 pending을 기록한다. validationPendingEntryStamp는 pending을 false에서 true로 만든 사슬만 그때의 stamp를 선택적으로 보유한다. 이미 대기 중인 hold를 만난 사슬은 marker를 얻지 않으며 자신의 요청만 정착한다. 요청이 사라진 사슬은 자신이 만든 hold의 stamp만 정착하고 marker를 지워 이전 대기 요청이나 더 새로운 판정을 풀지 않는다. request의 기존 true 설정은 멱등이며 timing·공개 사건·revision은 바꾸지 않는다. 미룬 로드 시작은 이전 요청을 버리고 pending true→false 정착으로 reveal hold를 해제한다.

- 런타임의 선택적 validationRun 콜백은 요청마다 최신 도메인 실행 본문으로 교체하며, 한 번 만든 cadence는 이 콜백을 읽는 고정 실행 통로만 보유한다. 첫 요청 대상이 나중에 이탈해도 이후 요청의 노드·배달 클로저를 사용하며 폐기 시 콜백도 비운다. 주기 모듈에는 이 콜백 내용이 알려지지 않는다(IR-6 amendment3).

- 활성 선언 ID와 오류 차이는 고전적인 루프로 수집하고 비교하며, 선언 ID의 펼침 배열은 만들지 않는다. 오류 순서, 범위 밖 오류, 재사용 참조는 그대로 유지한다. 시간 복잡도는 같고, callback과 선언 수에 비례하는 임시 배열 비용이 줄어든다(87라운드 원칙 3).

- 게이트가 없는 트리는 정적 선언을 청사진에서 공유하므로 발생 경로별로 활성 ID 복사본을 두지 않는다. 이때는 꺼진 union 분기가 없으므로 오류의 경로 라우팅만 적용한다. 게이트가 있으면 커밋된 활성 선언으로 꺼진 분기의 표시 오류를 계속 걸러 낸다. 검증기와 작성 루트의 캐시, source 선택은 바꾸지 않으며, 정적 트리에서 ID 집합을 반복해 할당하는 일만 없앤다(86C-02 ii, VALIDATE-043·048).

### 계약 형과 진입점

- 화면 뒤 슬롯과 연속 입력 주기의 소유자는 형제 validationScheduling이다. 이 fractal은 createValidationCadence의 request를 매 검증 요청마다 호출하며 런타임이 처음 필요할 때 한 인스턴스를 만든다. clock은 이 도메인 경계에서 주입하고 스탬프·대기 대상·최신 커밋 검사·라우팅·배달은 이곳의 기존 실행 본문에 둔다. validationQueued는 다른 독자가 없어 제거한다(IR-6 amendment3).
- 쓰기 주기는 idle 요청의 다음 프레임 뒤 선행 실행, 실행 이후 다음 프레임 watch, 연속 요청이 있으면 프레임마다 이월, 첫 무요청 프레임 뒤 후행 실행, 마지막 자동 실행 시작 기준100ms마다 상한 실행을 따른다. 모든 실행 뒤에는 watch로 돌아간다. 명시적 루트 validate가 carry 중 스탬프를 바꾸면 새 요청이 없는 다음 실행은 기존 스탬프 규칙으로 버린다. 마운트와 명시적 validate·제출은 이 주기를 거치지 않는다(IR-6 amendment3).

- `hasFieldNodeValidationRequest(node)`는 `(validationStamp ?? 0) > (validationLoadStamp ?? 0)`으로 현재 로드 이후 쓰기 요청·명시적 루트 검증만 센다. 하위 검증은 세지 않는다. 로드 전체 판정이 남아 있으면 자동 하위 요청은 루트로 넓혀 전체 배정을 충족한다. 비동기 실행이 새 stamp로 대체되면 기존 targets를 pending에 되돌려 cadence가 최신 판정에 함께 배정한다. write 로드 진입점만 소비하고 surface 래퍼는 없다.

- 일회성 scheduleValidationSlot은 validationScheduling 진입점을 통해 engine·core가 명명 재수출한다. validation은 이를 재수출하는 facade를 두지 않으며 패키지 공개 표면은 늘리지 않는다(IR-6 amendment3).
- `GuardFunction`은 동기 가드의 내부 형이며 validation index가 내보내지 않는다. core 시험 검증기는 engine index의 `Validator['compileGuard']` 반환형에서 가드 형을 유도한다. `readFieldNodeGuard`는 settle이 소비하는 validation 진입점 이름이며, engine과 core의 집계 index는 재수출하지 않는다.
- `__tests__/validation.retain-guard.test.ts`는 검증기 수명 유지와 동기 가드 읽기를 함께 검증하므로 validation이 소유한다. 플러그인 형이 검증기 형을 만족하는지는 app/plugin의 시험 구획이 검증한다. write와 공유하는 트리 생성 fixture는 engine의 공용 시험 구획에서 읽는다.

- `interface Validator { compile(copy: BlueprintSchema): ValidateFunction; compileGuard(root: BlueprintSchema, pointer: string): GuardFunction; release?(root: BlueprintSchema): void; readonly dialect?: string }`를 `types/validator.ts`가 선언한다. `type GuardFunction = (value: unknown) => boolean`이며 가드는 비동기 형식과 키워드를 지원하지 않는다. `type ValidateFunction<Value = unknown> = (data: Value) => Promise<readonly ValidationIssue[] | null> | readonly ValidationIssue[] | null`은 입력에 대한 판정을 돌려주고 던지지 않는 계약이다. 던지면 실행 실패이다(VALIDATE-015·016·044, ERROR-032).
- `interface ValidationIssue<SourceError = unknown> { dataPath: string; keyword?: string; message?: string; schemaPath?: string; rejectedKey?: string; details?: Record<string, unknown>; source?: SourceError }`는 `types/issue.ts`가 선언하는 정규화된 검증 결과이다(FRAGMENT-020·053, LANDING-070, VALIDATE-043).
- core는 `compile` 결과와 가드에 방출 트리를 참조 그대로 건네고, 검증기는 받은 값과 스키마를 바꾸지 않는다. 값을 바꾸는 사용자 정의 키워드를 쓰지 않을 책임은 소비자에게 있다. core는 `bind`를 호출하지 않고, 선택된 검증기를 트리 생성 인자로 받는다(VALIDATE-001·044·050, CONTROLS-075).
- `readFieldNodeGuard(runtime, gate)`는 `settle`이 쓰는 동기 가드 읽기이다. `requestFieldNodeValidation(root, deliver: (issues, commit) => void)`는 실행을 예약하고, `readFieldNodeErrors(node): readonly ValidationIssue[]`는 라우팅된 오류를 읽는다. `assertValidationRootReady(node)`는 전체 스키마 검증 함수를 컴파일하거나 캐시에서 읽고 실패 시 ValidatorCompileFailed를 던진다. 같은 캐시 항목의 실패한 재시도는 원래 거부 정체성을 유지한다. 컴파일 시점 duplicate 실패는 다른 retained 충돌이 사라진 다음 전체 읽기에서 entry당 한 번 같은 copy로 재시도하며 성공 시 실패·거부와 중복 guard 실패를 지우고 기존 guard 참조를 유지한다. guard 읽기는 재시도하지 않는다. `retainValidationRoot(validator, authoredRoot)`와 `releaseValidationRoot(validator, authoredRoot)`는 바인딩의 커밋 이펙트와 정리용으로 이름을 붙인 진입점이다. `EMPTY_GLOBAL_ERRORS`는 두 오류 층이 비었거나 아직 계산 전인 폼 목록이 공유하는 빈 배열이며, `FieldNode`의 `globalErrors` 읽기와 `write`의 발행 비교가 같은 참조를 쓰도록 진입점으로 내보낸다(VALIDATE-015·021·043·046·049, NODE-010).
- `readValidationEntry`는 로드 슬롯·명시적 검증·가드 읽기에 검증기별 사본과 전체 컴파일 결과를 준비한다. `compileEntryGuards`는 개발 빌드의 트리 구성 단계에서 if 게이트가 있는 청사진의 가드를 준비하며, 이때 사본을 읽으므로 전체 스키마도 컴파일한다. if 게이트가 없는 개발 폼은 이 준비를 건너뛰며 None 모드에서는 컴파일하지 않는다. 단순 보유는 컴파일을 시작하지 않는다. `runFieldNodeValidation`과 `routeValidationIssues`는 `write`가 명시적 `validate()`의 판정과 오류 표시를 순서대로 연결하는 통로이다. 이들은 패키지 공개 진입점으로 다시 내보내지 않는다. 검증 사본 함수는 이 fractal 내부 구현이며, 시험은 그 파일을 직접 읽는다(NODE-010, VALIDATE-017·018·043·048, LANDING-159).
- `Validator`와 새 엔진의 `ValidateFunction`은 이 fractal 안에서만 내보낸다. 바깥에 공개된 `ValidateFunction`과 `ValidatorFactory`는 07까지 레거시 형이고, 공개 `ValidatorPlugin`은 같은 메서드 서명의 선택 항목 `compileGuard?`, `release?`, `dialect?`를 더해 구조적으로 맞춘다. 수명 함수는 `core/index.ts`에만 다시 노출하고 패키지 공개 `src/index.ts`에는 두지 않는다(LANDING-036·084·159, VALIDATE-044, 32C-01, 34C-01).

### 사본, 가드, 수명

- 검증기 인스턴스마다 `WeakMap<작성 루트 객체, 항목>`을 둔다. 항목은 한 번 깊이 복사한 스키마에서 키워드 자리의 `controls`, `options`, `presentation`만 빼며(`options.virtual` 포함), `required`는 고쳐 쓰지 않는다. `compile`, 모든 `compileGuard`, `release`는 항목의 동일한 사본 객체를 받고, 가드 포인터는 작성 루트 안의 위치를 그대로 가리킨다. 가드 표는 이 위치를 키로 삼아 전체 검증 함수나 그 실패를 같은 항목에 보관한다(VALIDATE-017–019·034·048).
- 프로덕션에서는 처음 평가할 때 가드를 컴파일한다. 개발 모드에서는 if 게이트가 있을 때 트리 구성 중 캐시 항목마다 한 번 모든 가드와 전체 스키마를 미리 컴파일한다. 보유에서 전체 컴파일을 없애는 절감은 production 빌드에 적용되며, 개발 빌드의 guard-free 폼도 로드 슬롯이나 명시적 검증 전에는 컴파일하지 않는다. 실패는 캐시하지만, 그 가드를 소비하는 폼마다 가드 하나당 자기 `GUARD_FAILED`를 한 번 기록한다. 같은 폼에서 같은 가드가 뒤이어 실패하면 던지기만 하고 다시 기록하지 않는다. 프로덕션에서 평가되지 않은 가드는 기록하지 않는다. 실패하거나 던지거나 boolean이 아닌 결과를 내면 해당 게이트를 거짓으로 정착시킨다(VALIDATE-015·047·048, ERROR-041·164).
- 보유는 컴파일하지 않고 참조 수와 최근 해제 목록만 갱신한다. 로드 슬롯 또는 명시적 검증·가드 읽기의 첫 `readValidationEntry`가 사본과 전체 검증 함수를 준비하며, 이미 보유한 루트의 참조 수를 덮어쓰거나 최근 목록에 넣지 않는다. 동기 가드 읽기도 이 컴파일 경로를 사용한다.
- 참조 수는 커밋 이펙트에서 올리고 정리에서 내린다. 참조 수가 0이 된 작성 루트는 최근 해제 목록에 들어간다. 커밋 소비자와 별도로 실행 중 핀을 관리하며 검증 컴파일 점검부터 promise 정착까지 LRU 축출을 막는다. 두 LRU 축출점은 오래된 비고정 후보를 상한 8까지 반복 축출하고 후보가 없으면 멈춘다. unpin은 plugin 호출 없이 빈 핀 키를 지우고 이미 recent에 있는 루트만 맨 뒤로 옮긴다. 실행 종료부터 다음 축출점까지 목록이 8을 넘을 수 있다. 같은 id 교체는 핀을 무시하므로 커밋 소비자가 없는 실행 중 사본은 해제될 수 있다. 목록에서 밀려나거나 같은 `$id`를 다시 등록하기 직전에, 캐시 항목이 있을 때만 그 사본으로 `release(root)`를 한 번 호출하고 core 캐시를 지운다. 목록 안에서 돌아온 같은 객체는 다시 컴파일하지 않는다. 커밋되지 않은 트리도 참조 수 0으로 이 목록에 들어간다(VALIDATE-021·045·048).
- 서로 다른 작성 루트 객체가 같은 `$id`를 가진 채 동시에 살아 있어도 각 트리는 자기 루트로 판정한다. 등록 충돌 없이 루트별로 격리할 책임은 플러그인에 있고, core는 `$id`를 고치지 않는다. 재생성 reset은 컴파일 없이 새 트리로 전환하며 실패는 로드 슬롯에서 보고한다(VALIDATE-046, ERROR-201).

### 실행과 오류 배정

- slot은 common-utils의 scheduleCancelableMacrotask를 유지한다. 공개0.16.1도 같은 scheduler의 scheduleMacrotask를 BranchStrategy의 promiseAfterMicrotask에서 사용했으므로 새 환경 요구가 아니다(IR-6 R-e).
- 계약: explicit validate는 호출 시점 snapshot의 판정을 반환한다(VALIDATE-006). submitForm은 await validate 전에 outputValue를 캡처하고 바로 그 값을 제출한다. 새로운 commit의 발행은 stamp·commit 검사로 보호한다(Q24, R-c).

- 외부 검증기가 만든 dataPath는 parseStandardPointer로 해석하여 예약 이름도 리터럴 속성으로 라우팅합니다. 소비자에게 제공하는 경로는 이름을 formatSegment로 조립한 확장 경로이며 같은 이름을 node.find로 다시 찾을 수 있습니다.

- 검증기 dataPath는 RFC 이름으로 해석하며 `/`와 `#/`는 빈 이름 자식입니다. 루트는 빈 문자열과 `#`이고 검증 전용 별칭은 없습니다. 빈 이름 자식이 없으면 루트에 잘못 배정하지 않습니다. 바뀌지 않은 이슈의 배열·항목 참조는 유지합니다. 포인터가 아닌 문자열(`/`나 `#`로 시작하지 않는 값)이나 잘못된 퍼센트 이스케이프를 가진 dataPath는 해석하지 않은 채 주인이 없는 오류로 남고 검증을 실패시키지 않습니다. schemaPath는 절대 포인터일 때만 정규형으로 바꾸며, 해석할 수 없으면 원문을 유지하고 dataPath 라우팅은 그대로 진행합니다.

- 소멸한 노드의 `errors`는 떼어질 때 갈무리한 마지막 오류 배열을 같은 참조로 돌려준다. 활성 검증 맵과 외부 오류 맵에서는 그 노드를 제거하며, 옛 참조는 살아 있는 트리의 새 오류를 읽지 않는다(NODE-044, 35C-09).

- 검증 요청이 필요한 가장 바깥 진입에서는 요청을 한 번 만들고, 다음 화면 뒤 슬롯에서 최신 커밋 번호 하나만 실행한다. 한 작업·프레임 안의 여러 쓰기는 합쳐지고 연속 프레임 입력은100ms 상한의 이월·후행 주기를 따르며 연속 적격 오류는 유지하고 새 표시·중간 숨김은 다음 release까지 기다린다. 늦게 도착한 결과와 폐기된 루트의 대기는 스탬프로 버리고, 최신 결과만 넘겨받은 콜백을 통해 별도 파동으로 보낸다. `validate()`와 제출은 슬롯을 거치지 않고 새 스냅숏을 즉시 판정한다. 하위 트리의 명시적 검증은 공유 스탬프와 대기 대상을 보존하여 전체 폼 쓰기 검증을 취소하지 않는다(EVENT-031·032·046, VALIDATE-006·007, IR-6).
- 라우팅은 판정을 바꾸지 않는다. 모든 issue를 순서대로 라우팅 목록에 보존하고, 폼 수준 `globalErrors`는 루트 외부 오류를 앞에, 그 검증 목록을 뒤에 둔다. 루트 외부 오류나 라우팅 목록이 바뀔 때만 합친 배열을 갱신하며, 반복해서 읽으면 같은 참조를 반환한다. 루트가 아닌 노드의 명령형 외부 오류는 해당 노드의 `errors`에만 남는다(SURFACE-053, VALIDATE-043, 79C-01).
- 검증(하위 대상과 명시적 `validate()` 포함)의 새 결과가 직전 결과와 깊이 같으면(길이와 순서, 항목의 모든 필드) 직전 배열의 항목 객체로 배정한다. 배정이 실제로 바뀐 노드(분기 전환, 항목 삭제 뒤 같은 경로에 온 다른 노드)만 `UpdateError`를 받고, 배정이 같은 노드는 직전 `errors` 배열을 같은 참조로 유지한다. 라우팅 목록 참조가 같으므로 `globalErrors`도 같은 참조이고, `UpdateGlobalError`를 보내지 않아 `onValidate`도 호출하지 않는다. 명시적 `validate()`는 그 목록으로 끝난다. 직전 결과는 루트 런타임의 `validationResult`이며, 대상과 관계없이 배정할 때마다 기록하고 reset만 비운다. 직전 결과가 없으면 빈 결과도 발행한다. 외부 오류는 이 비교와 관계없이 유지된다(EVENT-046, GOAL-011, LANDING-210, SURFACE-053, 207C-01).
- 표준 이름으로 해석한 `dataPath`가 가리키는, 형상 안의 노드에 검증 issue를 배정한다. `required`는 빠진 자식 경로로 배정되고, `rejectedKey`는 그 키를 가진 호스트가 받는다. 터미널 아래 경로는 터미널이 받고, 형상 밖 경로의 오류는 주인이 없는 오류가 된다(VALIDATE-043 (1)–(4), FRAGMENT-020·053).
- 표시에서는 꺼진 `oneOf`·`anyOf` 분기의 issue만 청사진 조각 표와 `schemaPath`로 걸러 낸다. 분기를 가려낼 수 없으면 거르지 않으며, `allOf`, `if`, `controls.active`는 이 필터의 대상이 아니다. union 호스트의 형 오류는 호스트에 둔다. 검증 판정과 폼 수준 목록은 그대로 유지한다(VALIDATE-043 (5)–(6), VALIDATE-051).

- 검증기가 없고 모드가 `None`이 아니면 트리마다 `VALIDATOR_MISSING`을 한 번 경고하고, `if` 조각을 끄고 `CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR`를 한 번 경고한다. 전체 컴파일 실패는 로드마다 `VALIDATOR_COMPILE_FAILED` 하나를 다음 프레임 뒤 로드 슬롯이나 명시적 검증에서 드러내며, 노드 `errors`에는 넣지 않는다. 자동 로드와 쓰기의 첫 실패는 origin validate 기록과 호스트 보고로 전달하고, 명시적 `validate()`는 거부하기 전에 `origin: 'validate'`로 보고한다. 같은 `$id`를 등록하다 충돌이 나서 컴파일에 실패한 경우에는 `VALIDATOR_COMPILE_FAILED`나 `GUARD_FAILED`의 `details`에 `reason: 'duplicateSchemaId'`와 `$id`를 싣는다. 실행 중 throw는 `VALIDATOR_THREW`로 `validate()`를 거부하거나 `OnChange`에서 한 번 보고한 뒤 싱크로 보내며, 미처리 거부로 남기지 않는다(ERROR-146–157, ERROR-019·022·039·155·201, VALIDATE-042, 31C-03).
- 검증기가 선언한 `dialect`와 작성 스키마의 `$schema`가 서로 다르면, 트리를 생성할 때 개발 모드에서만 `SCHEMA_FORM_WARNING.DIALECT_MISMATCH`로 보고한다. 둘 중 하나가 없거나 프로덕션이면 비교하지 않는다(VALIDATE-026·044, ERROR-188·199).

### onError origin

전체 스키마 컴파일·실행과 판정 파동 및 그 리스너가 만든 기록은 origin validate입니다. validate()·제출의 거부와 자동 실패의 호스트 싱크는 유지하며 origin은 그 노출 방법을 나타내지 않습니다.

## Acceptance Criteria

### load-slot-validation — 로드 세대별 컴파일과 보고

- None은 로드 컴파일을 생략하고 OnRequest-only는 슬롯에서 컴파일만 수행한다. OnChange와 Always의 첫 판정은 현재 로드 이후 요청이 없을 때만 실행한다.
- 로드 시작은 이전 요청을 무효화하고 deferred reset은 pending을 정착한다. 오래된 명시적 compile 실패는 caller에만 거부하며 현재 로드의 origin validate 보고를 억제하지 않는다.
- 중복 실패는 retained 충돌 지속 또는 실패한 재시도 동안 보존한다. 충돌 해제 뒤 첫 전체 읽기는 same-id recent 축출 후 한 번 재시도한다. reset과 commit 사이 validate 또는 commit 전 슬롯 실패는 해당 load의 unavailable 상태를 유지한다.

### validation-guard — 캐시와 동기 판정

- 같은 검증기와 작성 루트는 사본, 가드, 전체 컴파일을 공유하고, 다른 객체는 공유하지 않는다. 가드가 실패하면 게이트가 거짓이 되며, 폼마다 규정된 시점에 기록된다(VALIDATE-015·018·047·048, ERROR-041).

### validation-route — 판정과 표시 분리

- 원래 판정과 검증 목록의 순서는 유지하고, 루트 `''`, 누락된 키, 터미널, 꺼진 분기, union 호스트는 원장의 규칙대로 배정한다. 폼 목록은 루트 외부 오류 다음에 검증 목록이 오는 순서이며 루트가 아닌 노드의 외부 오류는 포함하지 않고, 바뀌지 않은 읽기는 같은 참조를 돌려준다. 깊이 같은 검증 결과에서는 `globalErrors`와, 배정이 같은 노드의 `errors`가 같은 참조로 남고 `UpdateGlobalError`도 보내지 않으며, 배정이 바뀐 노드만 갱신한다. 루트 외부 오류를 비울 때와 reset·인계에서도 두 층의 현재 값을 반영한다(VALIDATE-043·051, SURFACE-053, WRITE-045, 79C-01, FRAGMENT-020·053).

### validation-lifetime — 수명과 최신 결과

- 프레임 API·문서 가시성은 호출 시점에 판정하며, 프레임과 타이머가 모두 도착해도 슬롯은 한 번만 실행한다. 숨은 문서는 프레임을 기다리지 않으며 예약 후 숨겨진 문서는 100ms 타이머로 대체되지만 백그라운드 타이머 제한을 받을 수 있다(IR-6).
- 읽기 없이 보유·해제한 루트는 컴파일하지 않으며, 보유 뒤 처음 읽어도 참조 수를 유지한다. 해제 전에 다시 마운트하면 재컴파일하지 않고, 비고정 최근 등록은 축출점에서 8 이하로 줄이며 실행 중 핀으로 일시 초과할 수 있고, 오래된 커밋의 결과는 배달하지 않는다. 같은 `$id`를 가진 서로 다른 살아 있는 작성 루트는 각자 자기 루트로 판정하고, 재생성 reset은 새 트리를 유지하고 슬롯에서 실패를 보고한다(VALIDATE-021·045·046·049, EVENT-046).

## Boundary Exemptions

### `types/` — 형 칸 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: 형 칸의 형은 이름으로 진입점을 거쳐 write·engine·core의 집계 진입점과 플러그인 검증 계약에 제공되며, 형은 구현이 아니므로 칸에 두고 진입점이 이름으로 내보낸다.

## Last Updated

2026-10-30
