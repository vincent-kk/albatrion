# ValidationManager

## Purpose
루트 노드의 JSON Schema 유효성 검사를 담당한다. 스키마를 컴파일하여 validator 함수를 생성하고, 검사 실행 후 에러를 data path 기준으로 자식 노드에 분배한다. 순환 참조 에러는 fallback validator 로 처리한다.

## Structure
- `ValidationManager.ts` — 클래스 본체
- `index.ts` — barrel export
- `utils/getFallbackValidator.ts` — 순환 참조 에러용 폴백 validator
- `utils/matchesSchemaPath.ts` — 스키마 경로 매칭 (variant 노드용)
- `__tests__/` — 유닛 테스트

## Conventions
- TypeScript strict 모드
- 루트 노드에만 인스턴스 생성; `enabled` 가 `false` 이면 검사 불수행
- `validate()` 는 루트 노드이고 `enabled === true` 일 때만 실행
- 스키마에서 확장 필드 제거 후 컴파일: `stripSchemaExtensions(jsonSchema)`
- variant 노드 에러 필터링: `matchesSchemaPath(error.schemaPath, childNode.schemaPath)`
- 이전 에러 경로 추적으로 스테일 에러 제거

## Boundaries

### Always do
- `validate()` 호출 전 `this.__host__.isRoot` 확인
- 스키마 컴파일은 생성자에서 1회만 수행
- 컴파일 실패(순환 참조)는 `getFallbackValidator` 로 처리하고 `console.error` 출력

### Ask first
- validator 컴파일 실패 시 동작 변경 (현재: fallback + console.error)
- 에러 분배 로직 변경 (현재: `host.find(dataPath)` 기반)

### Never do
- 루트 노드 외에서 `ValidationManager` 인스턴스 생성
- `validationMode` 가 falsy 일 때 검사 수행

## Dependencies
- `utils/getFallbackValidator` — 순환 참조 에러 폴백
- `utils/matchesSchemaPath` — variant 노드 스키마 경로 매칭
- `../../AbstractNode` — 호스트 노드 타입
- `@/schema-form/app/plugin` — `PluginManager`
- `@/schema-form/errors` — `JsonSchemaError`
- `@/schema-form/helpers/error` — `formatCircularReferenceError`, `transformErrors`
- `@/schema-form/helpers/jsonSchema` — `stripSchemaExtensions`
- `@/schema-form/types` — `ValidateFunction`, `ValidatorFactory`, `ValidationMode`
