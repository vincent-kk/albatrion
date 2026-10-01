# errors

## Requirements

도메인 오류는 공통 오류 구조와 타입 판별 가능성을 제공합니다. 새 엔진의 `onError` 코드 표와 기록·보고기 형도 이 fractal의 데이터 계약입니다(ERROR-013·017·031·164, LANDING-084).

## API Contracts

- 오류 코드·메시지·상세 맥락을 보관하고 클래스에 맞는 이름을 설정합니다.
- 타입 가드는 대응하는 도메인 오류를 식별하며 오류 객체는 비즈니스 동작을 실행하지 않습니다.
- `formErrorCode.ts`는 ERROR-164의 살아 있는 새 설계 행과 후속 보충(ERROR-188–203, 25C-05)을 원장 순서로 싣고, 코드 상수마다 level·부류·발생 시점의 문서 주석을 둡니다. `FormErrorCode`는 그 상수의 닫힌 문자열 합집합이며 `index.ts`가 상수와 형을 저장소 관례인 `export *`로 내보냅니다. `SCHEMA_FORM_WARNING.TYPE_MISMATCH`가 경고등 코드이고 `VALUE_TYPE_MISMATCH`는 아니며, `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND`는 코드 표에서 뺍니다(ERROR-031·164·188·198, SURFACE-061, CONTROLS-079).
- `interface FormErrorRecord { level: 'error' | 'warning'; code: FormErrorCode; message: string; path?: string; schemaPath?: string; details?: ErrorDetails; error?: unknown; aggregate?: SchemaFormError; surface?: 'thrown' | 'rejected' | 'sink'; componentStack?: string }`입니다. `details`는 오류의 `error.details`와 같은 참조이며, `aggregate`는 둘 이상 묶여 실제로 던진 오류 객체입니다. `componentStack`을 채우는 것은 07의 렌더 계층입니다(ERROR-017·032).
- `interface FormErrorReporter { report(record: FormErrorRecord): void; hasConsumer(): boolean }`은 core가 트리 생성 인자로 받는 형입니다. `hasConsumer()`가 거짓이면 일반 경고의 판정·서식·키 할당을 하지 않고, true이면 같은 사건의 code·level·details·surface를 환경에 따라 바꾸지 않습니다. `NON_JSON_WHOLE_VALUE`의 깊이 점검과 보고만은 `hasConsumer()`와 무관하게 개발 모드에서만 합니다(ERROR-013·021·030, WRITE-099, 31C-02).
- 코드별 `reason`은 닫힌 값만 둡니다. `VALIDATOR_COMPILE_FAILED`·`GUARD_FAILED`에는 `'duplicateSchemaId'`, `TYPE_MISMATCH`에는 `'unconvertible' | 'ambiguous'`, `DISCRIMINATOR_MISMATCH`에는 `'missing' | 'kind' | 'overlap' | 'key'`를 씁니다. 원장이 이름 붙이지 않은 원인에는 `reason`을 만들지 않습니다(ERROR-201, VALUE-037, 31C-03).
- 코드 표는 패키지 전체의 공개 데이터입니다. 기록 생성·사슬 끝 전달·묶음·경고 중복 키와 전달 중 쓰기 거부는 `dispatch`가 소유하며 이 fractal의 클래스·상수·형에는 넣지 않습니다(ERROR-004·005·024·029·164, NODE-016).

## Acceptance Criteria

### errors-contract — 관찰 가능한 동작

- 소비자는 코드와 타입 가드를 통해 오류 종류를 구분할 수 있습니다.
- ERROR-164의 현행 행과 후속 보충의 코드·순서·level이 상수와 일치하고, 제외·오늘 전용 행과 `INJECT_TARGET_NOT_FOUND`는 새 표에 없습니다(ERROR-164·198, CONTROLS-079).
- 상세 정보는 생성자가 받은 진단 맥락을 별도 마스킹 없이 보관합니다. ValidationError에는 원본 form value와 jsonSchema가 포함될 수 있으므로 호출자는 이를 사용자 응답이나 로그에 노출할 때 별도로 다뤄야 합니다.

## Last Updated

2026-10-01
