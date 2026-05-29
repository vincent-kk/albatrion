# createDynamicFunction

## Purpose
JSON Schema의 computed 표현식 문자열을 파싱하여 JSONPointer 경로를 `dependencies[n]` 참조로 변환하고, `new Function()` 으로 런타임 실행 가능한 `DynamicFunction` 을 생성한다.

## Structure
- `createDynamicFunction.ts` — 메인 함수
- `index.ts` — barrel export
- `type.ts` — `CreateDynamicFunction` 타입
- `utils/getFunctionBody.ts` — 표현식 → 함수 바디 변환
- `utils/wrapReturnStatements.ts` — return 문 래핑 처리

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

## Dependencies
- `utils/getFunctionBody` — 표현식 → 함수 바디 문자열
- `utils/wrapReturnStatements` — 복합 표현식 return 래핑
- `../getPathManager` — `PathManager` 타입
- `../regex` — `JSON_POINTER_PATH_REGEX`
- `../type` — `DynamicFunction`
- `@/schema-form/errors` — `JsonSchemaError`
- `@/schema-form/helpers/error` — `formatCreateDynamicFunctionError`
