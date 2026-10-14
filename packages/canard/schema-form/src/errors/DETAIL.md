# errors

## Requirements

도메인 오류는 공통 오류 구조와 타입 판별 가능성을 제공합니다. 새 엔진의 `onError` 코드 enum과 기록·보고기 형도 이 fractal의 데이터 계약입니다(ERROR-013·017·031·164, LANDING-084).

## API Contracts

- `FormErrorReason`·`FormErrorDetails`는 코드별 상세의 내부 형이며 errors index가 내보내지 않습니다. 외부 오류 관측은 진입점의 `FormErrorRecord` 계약을 사용하고, 코드별 상세 형의 계약은 이 fractal의 `__tests__`가 `type.ts`를 직접 읽어 검증합니다.

- 오류 코드·메시지·상세 맥락을 보관하고 클래스에 맞는 이름을 설정합니다.
- 타입 가드는 대응하는 도메인 오류를 식별하며 오류 객체는 비즈니스 동작을 실행하지 않습니다.
- `codes/`의 object enum `FormErrorCode`(오류 41)·`FormWarningCode`(경고 17)가 패키지의 유일한 코드 정본입니다. ERROR-164의 살아 있는 새 설계 행과 후속 보충(ERROR-188–203, 25C-05)을 원장 순서로 싣고, 키마다 부류·발생 시점의 문서 주석을 둡니다. 키는 맨 이름의 PascalCase(`UNKNOWN_JSON_SCHEMA` → `UnknownJsonSchema`), 값은 발화되는 그룹 한정 문자열이며 같은 이름의 형은 값의 닫힌 합집합입니다. level은 어느 enum에 속하는지로 정하고, 클래스별 코드 형 `JSONSchemaErrorCode`·`SchemaFormErrorCode`·`UnhandledErrorCode`·`ValidationErrorCode`는 그룹 접두어로 고른 `FormErrorCode`의 부분 집합입니다. 기록의 코드 형은 `FormErrorCode | FormWarningCode`입니다. 루트 `src/index.ts`가 두 enum을 값과 형으로 공개합니다(289라운드 D4).
- 생성자는 자기 그룹의 코드만 받고 접두어를 떼어 `BaseError`에 맨 이름을 넘깁니다. 그래서 `error.code`는 그룹 한정 값 그대로, `error.group`·`error.specific`은 그룹과 맨 이름입니다.
- 생산 지점이 없는 `PRESENTATION_KEY_SUSPECT`·`NULLABLE_ONE_OF_NULL_UNREACHABLE`·`NESTED_COMPOSITION_IGNORED_FOR_FORM`·`CONDITION_INDEX`·`CONDITION_INDICES`는 코드에 없습니다. 분기 `controls.active` 컴파일 실패는 `CREATE_DYNAMIC_FUNCTION`입니다(ERROR-162, 305C-01). 제출 검증 실패는 `VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED`입니다.
- AJV 플러그인의 bind 거부 오류는 자체 `Error`이며 `group`·`code`를 `UNHANDLED_ERROR`·`FormErrorCode.ValidatorBindRefused`로 맞춥니다. `isUnhandledError`는 이를 알아보지 못하며 호출자는 `code`로 가릅니다(32C-02). `SCHEMA_FORM_WARNING.TYPE_MISMATCH`가 경고등 코드이고 `VALUE_TYPE_MISMATCH`는 아니며, `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND`는 코드 표에서 뺍니다(ERROR-031·164·188·198, SURFACE-061, CONTROLS-079).
- `interface FormErrorRecord { level: FormErrorLevel; code: FormRecordCode; message: string; path?: string; schemaPath?: string; details?: ErrorDetails; error?: unknown; aggregate?: SchemaFormError; surface?: FormErrorSurface; componentStack?: string }`입니다. `FormErrorLevel`은 `'error' | 'warning'`, `FormErrorSurface`는 `'thrown' | 'rejected' | 'sink'`이며, 청사진 진단의 level과 FormErrorContext의 보고 표면도 이 두 형을 씁니다. `details`는 오류의 `error.details`와 같은 참조이며, `aggregate`는 둘 이상 묶여 실제로 던진 오류 객체입니다. 렌더 계층은 경계가 받은 `componentStack`만 기록에 채우며 다른 React 정보 필드를 노출하지 않습니다(ERROR-017·032, 68C-08).
- `interface FormErrorReporter { report(record: FormErrorRecord): void; hasConsumer(): boolean }`은 core가 트리 생성 인자로 받는 형입니다. `hasConsumer()`가 거짓이면 일반 경고의 판정·서식·키 할당을 하지 않고, true이면 같은 사건의 code·level·details·surface를 환경에 따라 바꾸지 않습니다. `NON_JSON_WHOLE_VALUE`의 깊이 점검과 보고만은 `hasConsumer()`와 무관하게 개발 모드에서만 합니다(ERROR-013·021·030, WRITE-099, 31C-02).
- 코드별 `reason`은 닫힌 값만 둡니다. `VALIDATOR_COMPILE_FAILED`·`GUARD_FAILED`에는 `'duplicateSchemaId'`, `TYPE_MISMATCH`에는 `'unconvertible' | 'ambiguous'`, `DISCRIMINATOR_MISMATCH`에는 `'missing' | 'kind' | 'overlap' | 'key'`를 씁니다. 원장이 이름 붙이지 않은 원인에는 `reason`을 만들지 않습니다(ERROR-201, VALUE-037, 31C-03).
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

- 오류 클래스 넷(`JSONSchemaError`·`SchemaFormError`·`UnhandledError`·`ValidationError`)은 `classes/`, 코드 enum 둘과 그 부분 집합 형은 `codes/`에 있습니다. 뿌리에는 문서·진입점·형 동반 파일(`type.ts`)만 둡니다(filid zero-peer-file).

## Acceptance Criteria

### errors-contract — 관찰 가능한 동작

- 소비자는 코드와 타입 가드를 통해 오류 종류를 구분할 수 있습니다.
- ERROR-164의 현행 행과 후속 보충의 코드·순서·level이 두 enum과 일치하고, 클래스를 enum 값으로 만들면 `code`·`group`·`specific`이 그룹 한 번의 값·그룹·맨 이름이며, 제외·오늘 전용 행과 `INJECT_TARGET_NOT_FOUND`는 새 표에 없습니다(ERROR-164·198, CONTROLS-079).
- 상세 정보는 생성자가 받은 진단 맥락을 별도 마스킹 없이 보관합니다. ValidationError에는 원본 form value와 jsonSchema가 포함될 수 있으므로 호출자는 이를 사용자 응답이나 로그에 노출할 때 별도로 다뤄야 합니다.
- 같은 대상을 겨눈 서로 다른 선언의 자동 쓰기 실패는 오류와 보고 기록 모두에서 서로 다른 `details.sourcePath`로 구별할 수 있습니다. 다른 코드의 상세 형은 이 필드를 허용하지 않습니다(ERROR-017·195, 59C-01).
- 렌더·바인딩의 코드 발생은 위 표의 자리·횟수·전달 계약을 만족하며, 경계의 React 정보는 `componentStack`만 포함합니다(REACT-033, ERROR-202, 68C-08, 69C-02).

## Last Updated

계약 기준: LANDING-067·095, REACT-033, ERROR-110–119·164·202, 68C-08, 69C-02; 정돈-2(2026-10-14).
