# errors

## Requirements

- B12 `InactiveValueWithUnsetOnInactive`는 동일 층의 inactiveValue와 literal true unsetOnInactive 동거 경고이며 `WriteInInactiveResolver`는 resolver 중 쓰기 무시를 알리는 개발 전용 경고입니다. ERROR-164 정본은 라운드 마감에서 갱신하며 시험 기대값에는 두 멤버를 명시합니다.

- `FormWarningCode.DetachedNodeWrite`는 떼어진 노드 참조의 쓰기가 무효임을 개발 모드에서 알리는 전용 경고다. 운영 모드에서는 보고하지 않는다(B11).

도메인 오류는 공통 오류 구조와 타입 판별 가능성을 제공합니다. 새 엔진의 `onError` 코드 enum과 기록·보고기 형도 이 fractal의 데이터 계약입니다(ERROR-013·017·031·164, LANDING-084).

## API Contracts

- `ReservedPropertyName`은 속성 이름이 정확히 `%2A`, `%2E`, `%2E%2E`, `%40`인 청사진을 `JSON_SCHEMA_ERROR.RESERVED_PROPERTY_NAME`으로 거부합니다. `details.property`와 작성 위치가 원인을 가리키며 기존 `UnknownJsonSchema`와 코드로 구별됩니다. 소유자가 승인한 공개 enum 멤버 하나의 확장이며 오류 생성의 시간·메모리 비용은 기존과 같습니다.

- `FormErrorReason`·`FormErrorDetails`는 코드별 상세의 내부 형이며 errors index가 내보내지 않습니다. 외부 오류 관측은 진입점의 `FormErrorRecord` 계약을 사용하고, 코드별 상세 형의 계약은 이 fractal의 `__tests__`가 `type.ts`를 직접 읽어 검증합니다.

- 오류 코드·메시지·상세 맥락을 보관하고 `name`은 클래스가 속한 upper snake case 그룹 상수로 설정합니다.
- 타입 가드는 대응하는 도메인 오류를 식별하며 오류 객체는 비즈니스 동작을 실행하지 않습니다.
- `constants/`의 object enum `FormErrorCode`·`FormWarningCode`가 패키지의 유일한 코드 정본입니다. ERROR-164의 살아 있는 새 설계 행과 후속 보충(ERROR-188–203, 25C-05)을 원장 순서로 싣고, 키마다 부류·발생 시점의 문서 주석을 둡니다. 키는 맨 이름의 PascalCase(`UNKNOWN_JSON_SCHEMA` → `UnknownJsonSchema`), 값은 실제로 발생하는 그룹 한정 문자열이며 같은 이름의 형은 값의 닫힌 합집합입니다. level은 어느 enum에 속하는지로 정하고, 클래스별 코드 형 `JSONSchemaErrorCode`·`SchemaFormErrorCode`·`UnhandledErrorCode`·`ValidationErrorCode`는 그룹 접두어로 고른 `FormErrorCode`의 부분 집합입니다. 기록의 코드 형은 `FormErrorCode | FormWarningCode`입니다. 루트 `src/index.ts`가 두 enum을 값과 형으로 공개합니다(289라운드 D4).
- 내부 그룹 상수 `FormErrorGroup`·`FormWarningGroup`과 그룹별 맨 이름 표를 조합해 정본 enum의 각 값을 `${group}.${specific}`으로 만듭니다. 맨 이름 표는 기존 클래스·파생 표와 이름을 맞춰 `JSONSchemaErrorSpecific`·`SchemaFormErrorSpecific`·`UnhandledErrorSpecific`·`ValidationErrorSpecific`·`SchemaFormWarningSpecific`으로 부르며, 키는 기존 PascalCase이고 값은 맨 이름의 리터럴입니다. 정본의 키·원장 순서·값·닫힌 리터럴 합집합은 보존합니다. 그룹별 코드 표도 맨 이름 표에서 조립하며 합치면 정본의 값과 개수를 보존합니다. 그룹·맨 이름 상수, 파생 표와 lookup은 errors 및 패키지 진입점에서 공개하지 않습니다.
- 생성자는 자기 그룹의 코드를 받고, 맨 이름 표로 한 번 만든 코드→specific lookup에서 맨 이름을 찾아 `BaseError`에 넘깁니다. `error.code`·`error.group`·`error.specific`·메시지·상세 참조는 보존하고, 네 클래스의 `name`은 각각 `FormErrorGroup`의 대응 그룹 값입니다.
- 발생시키는 곳이 없는 `PRESENTATION_KEY_SUSPECT`·`NULLABLE_ONE_OF_NULL_UNREACHABLE`·`NESTED_COMPOSITION_IGNORED_FOR_FORM`·`CONDITION_INDEX`·`CONDITION_INDICES`는 코드에 없습니다. 분기 `controls.active` 컴파일 실패는 `CREATE_DYNAMIC_FUNCTION`입니다(ERROR-162, 305C-01). 제출 검증 실패는 `VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED`입니다.
- AJV 플러그인의 bind 거부 오류는 자체 `Error`이며 `group`·`code`를 `UNHANDLED_ERROR`·`FormErrorCode.ValidatorBindRefused`로 맞춥니다. `isUnhandledError`는 이를 알아보지 못하며 호출자는 `code`로 가릅니다(32C-02). `SCHEMA_FORM_WARNING.MISFIT`이 경고등 코드이고 `VALUE_TYPE_MISMATCH`는 아니며, `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND`는 코드 표에서 뺍니다(ERROR-031·164·188·198, SURFACE-061, CONTROLS-079).
- `FormErrorRecord`는 level·code·message와 필수 origin, 선택 path·schemaPath·details·error·componentStack을 담습니다. origin은 load·write·validate·submit·render의 닫힌 합집합이며 details는 error.details와 같은 참조입니다. 내부 대기 기록의 origin만 선택적이며 전달 전에 확정합니다(ERROR-017·019).
- `interface FormErrorReporter { report(record: FormErrorRecord): void; hasConsumer(): boolean }`은 core가 트리 생성 인자로 받는 형입니다. `hasConsumer()`가 거짓이면 일반 경고의 판정·서식·키 할당을 하지 않고, true이면 같은 사건의 code·level·details·origin를 환경에 따라 바꾸지 않습니다. `NON_JSON_WHOLE_VALUE`의 깊이 점검과 보고만은 `hasConsumer()`와 무관하게 개발 모드에서만 합니다(ERROR-013·021·030, WRITE-099, 31C-02).
- 코드별 `reason`은 닫힌 값만 둡니다. `VALIDATOR_COMPILE_FAILED`·`GUARD_FAILED`에는 `'duplicateSchemaId'`, `MISFIT`에는 `'unconvertible' | 'ambiguous'`, `DISCRIMINATOR_MISMATCH`에는 `'missing' | 'kind' | 'overlap' | 'key'`를 씁니다. 원장이 이름 붙이지 않은 원인에는 `reason`을 만들지 않습니다(ERROR-201, VALUE-037, 31C-03).
- `FormErrorDetails<Code>`의 `sourcePath?: string`은 `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING`·`SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES`에만 허용합니다. 자동 쓰기 실패의 `details.sourcePath`는 쓰기를 낸 `controls.injectTo` 선언 노드의 데이터 경로이며, `details.path`와 기록의 `path`는 대상 경로로 유지합니다. 쓰기 모양 오류의 `expectedLength`·`received`는 보존하고 호출자 경로의 쓰기 모양 오류에는 `sourcePath`를 넣지 않습니다. 오류 기록의 `details`는 이 필드를 포함한 `error.details`와 같은 참조입니다(ERROR-017·195, 59C-01).
- 코드 enum은 패키지 전체의 공개 데이터입니다. 기록 생성·사슬 끝 전달·묶음·경고 중복 키와 전달 중 쓰기 거부는 `engine/write`가 소유하며 이 fractal의 클래스·상수·형에는 넣지 않습니다(ERROR-004·005·024·029·164, NODE-016).

렌더·바인딩과 재생성 트리의 쓰기 거부는 다음 코드의 실제 발생 계약을 따릅니다(LANDING-067·095, ERROR-164·202, 68C-08, 69C-02).

| 코드                                | 발생 자리와 전달 계약                                                                                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SUBMIT_WHILE_DEGRADED`             | Form의 제출 진입이 degraded 진단에서 제출을 거부합니다. 네이티브 submit은 `onError`와 주인 없는 오류 싱크로 전달합니다(LANDING-095)                                                               |
| `CHILD_NODE_COMPONENTS_ON_TERMINAL` | 터미널 입력이 빈 자식 구성 요소 배열을 처음 읽을 때 경고합니다. 개발 모드 또는 핸들러가 있는 경우 동결 배열의 읽기를 감지하고, 필드 커밋 뒤 로드마다 `(code, path)`로 한 번 보고합니다(ERROR-202) |
| `FORM_TYPE_TEST_INVALID`            | `useFieldInput`의 정의 정규화에서 모르는 객체 시험 키와 `type`의 integer를 감지하면 개발 모드에서 정의마다 한 번 경고합니다. 모르는 키는 대조에서 제외합니다(REACT-033)                           |
| `RENDER_FAILED`                     | 루트·필드 경계가 렌더 예외를 fallback으로 격리하고 인스턴스 보고기로 기록과 `componentStack`을 전달합니다. 다시 던지지 않습니다(ERROR-110–117, 68C-08)                                            |
| `DISPOSED_NODE_WRITE`               | core의 쓰기 진입이 재생성 인계로 폐기된 옛 노드의 표식 없는 쓰기를 던져 거부합니다. 입력 출처 표식이 있는 늦은 쓰기는 오류 없이 버립니다(WRITE-046·086, 69C-02)                                   |

- 오류 클래스 넷(`JSONSchemaError`·`SchemaFormError`·`UnhandledError`·`ValidationError`)은 `classes/`, 코드 enum 둘·그룹 상수·맨 이름 표·그룹별 파생 표는 `constants/`에, 코드 판별 함수(`isFormErrorCode`·`isFormWarningCode`)와 조립·조회 보조(`assembleCodeGroup`·`getCodeSpecific`)는 `utils/`에 있습니다. 두 organ은 상수와 보조를 가르는 관례 이름이며 `constants/`의 파생 표만 `utils/`의 조립 보조를 가져옵니다. 뿌리에는 문서·진입점·형 동반 파일(`type.ts`)만 둡니다(filid zero-peer-file).

### onError origin

onError is an event channel: it delivers the one record of each occurrence and does not maintain a current error list or report resolution.

`onError?: (record: FormErrorRecord) => void`는 발생마다 해당 기록 하나를 전달합니다. 기록의 필수 `origin`은 발생을 만든 연산을 나타냅니다.

| origin | 연산 |
| --- | --- |
| `load` | 트리 구성·mount·reset·rebuild·검증기 변경과 그 로드 사슬 |
| `write` | 공개 쓰기·배열 동사·상태·batch·맥락·finishInput·외부 오류 및 통지 리스너 |
| `validate` | 자동·명시적 전체 스키마 컴파일·실행, 판정 전달 및 그 리스너 |
| `submit` | SubmitWhileDegraded와 네이티브 submit의 capture에서 처음 드러난 실패 |
| `render` | RenderFailed 경계 및 ChildNodeComponentsOnTerminal 같은 렌더 계층 경고 |

사슬을 연 가장 바깥 연산이 origin을 정합니다. reset의 onChange 안에서 중첩 쓰기가 나면 `load`이며, 쓰기 사슬의 노드 리스너나 폼 onChange가 reset을 호출하면 `write`입니다. 검증 결과 파동 리스너의 실패는 `validate`이고, 로드 직후 독립 setState 리스너의 실패는 `write`입니다. 최초 commit의 외부 errors 적용은 `load`, errors prop 변경은 `write`입니다. 제출 안의 dispatchValidate가 이미 보고한 실패는 `validate`를 유지합니다. 개발 콘솔의 warnDevelopmentIssue 경고는 기록이 아닙니다. 오류 묶음은 호출자에게 던지는 값으로만 유지하고 개별 기록에는 싣지 않습니다. 전달 시점·중복 제거·호출자 거부·호스트 싱크·재진입 규칙은 유지합니다.

## Acceptance Criteria

### errors-contract — 관찰 가능한 동작

- 소비자는 코드와 타입 가드를 통해 오류 종류를 구분할 수 있습니다.
- 모든 코드·경고 값은 해당 그룹과 맨 이름 상수의 조합이며 lookup은 모든 코드의 맨 이름을 반환합니다. 클래스 인스턴스의 `name`은 대응 그룹 상수이고, 그룹별 표와 정본의 리터럴 형은 같습니다. 공개 이름 수는 94개로 유지합니다.
- ERROR-164의 현행 행과 후속 보충의 코드·순서·level이 두 enum과 일치하고, 클래스를 enum 값으로 만들면 `code`·`group`·`specific`이 그룹 한 번의 값·그룹·맨 이름이며, 제외·오늘 전용 행과 `INJECT_TARGET_NOT_FOUND`는 새 표에 없습니다(ERROR-164·198, CONTROLS-079).
- 상세 정보는 생성자가 받은 진단 맥락을 별도 마스킹 없이 보관합니다. ValidationError에는 원본 form value와 jsonSchema가 포함될 수 있으므로 호출자는 이를 사용자 응답이나 로그에 노출할 때 별도로 다뤄야 합니다.
- 같은 대상을 겨눈 서로 다른 선언의 자동 쓰기 실패는 오류와 보고 기록 모두에서 서로 다른 `details.sourcePath`로 구별할 수 있습니다. 다른 코드의 상세 형은 이 필드를 허용하지 않습니다(ERROR-017·195, 59C-01).
- 렌더·바인딩의 코드 발생은 위 표의 자리·횟수·전달 계약을 만족하며, 경계의 React 정보는 `componentStack`만 포함합니다(REACT-033, ERROR-202, 68C-08, 69C-02).

## Last Updated

계약 기준: LANDING-067·095, REACT-033, ERROR-110–119·164·202, 68C-08, 69C-02; 그룹·맨 이름 조합 및 클래스 이름 계약(2026-10-16).
