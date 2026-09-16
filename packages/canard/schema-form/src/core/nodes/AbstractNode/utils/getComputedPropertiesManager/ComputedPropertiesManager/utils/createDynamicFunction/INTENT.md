# createDynamicFunction

## Purpose

JSON Schema의 computed 표현식 문자열을 파싱하여 JSONPointer 경로를 `dependencies[n]` 참조로 변환하고, `new Function()` 으로 런타임 실행 가능한 `DynamicFunction` 을 생성한다.

## Conventions

- TypeScript strict 모드
- 입력: `(pathManager, fieldName, expression, coerceToBoolean?)`
- 출력: `DynamicFunction | undefined` (expression이 비어있으면 undefined)
- `JSON_POINTER_PATH_REGEX` 로 경로 추출 → `pathManager.set(path)` 로 등록 → `dependencies[index]` 치환
- 후행 세미콜론 제거: `.replace(/;$/, '')`
- `new Function('dependencies', functionBody)` 로 컴파일; 실패 시 `JsonSchemaError('CREATE_DYNAMIC_FUNCTION')` throw

## Boundaries

### Always do

- JSONPointer 경로 등록은 반드시 `pathManager.set()` 을 통해 수행
- 컴파일 실패 시 `JsonSchemaError` 로 감싸서 throw

### Ask first

- `getFunctionBody` 의 boolean coercion 로직 변경

### Never do

- `eval()` 사용
- `pathManager` 없이 경로를 직접 인덱스로 치환
- `new Function` 실패를 무시하거나 빈 함수로 대체
