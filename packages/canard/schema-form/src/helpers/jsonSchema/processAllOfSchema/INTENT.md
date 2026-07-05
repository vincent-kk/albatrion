# processAllOfSchema

## Purpose

`allOf` 배열을 포함한 JSON Schema를 단일 병합 스키마로 처리한다. 타입 호환성을 검증하고, 타입별 교집합(intersect) 핸들러를 사용해 모든 allOf 스키마를 기반 스키마에 순차 병합한다.

## Structure

- `processAllOfSchema.ts` — 공개 함수 (진입점)
- `index.ts` — barrel export
- `utils/getCloneDepth/` — 스키마 타입별 복제 깊이 결정
- `utils/getMergeSchemaHandler/`(+`intersectSchema/`) — 타입별 교집합 핸들러 선택 및 구현
- `utils/validateCompatibility/` — allOf 스키마 타입 호환성 검증

## Conventions

- TypeScript strict 모드
- `allOf`가 없거나 비어있으면 원본 스키마 그대로 반환
- 처리 전 `cloneLite(rest, depth)`로 얕은 복제 수행 (원본 보존)
- 타입 비호환 시 `JsonSchemaError('ALL_OF_TYPE_REDEFINITION')` throw
- 복제 깊이: object=3, array=2, primitive=1

## Boundaries

### Always do

- 병합 전 반드시 `cloneLite`로 스키마 복제하여 원본 보존
- 각 allOf 항목 병합 전 `validateCompatibility` 호출
- 타입 비호환 시 `JsonSchemaError` throw (에러 무시 금지)
- `getMergeSchemaHandler`가 `null`이면 병합 없이 원본 반환
- allOf 항목에 무시되는 키워드(`IGNORE_FIELDS`)가 있으면 `warnDevelopmentIssue`로 dev 경고 방출

### Ask first

- 복제 깊이 기준 변경 (`getCloneDepth` 로직 수정)
- 타입 호환성 규칙 변경 (number/integer 관계 등)
- 새 스키마 타입에 대한 intersect 핸들러 추가

### Never do

- 원본 `schema` 객체를 직접 변경(mutate)
- `allOf` 항목을 순서 변경하거나 건너뛰어 병합
- `JsonSchemaError` 대신 일반 `Error` throw

## Dependencies

- 외부: `@winglet/common-utils/object`(`cloneLite`)
- 내부: `@/schema-form/errors`(`JsonSchemaError`), `@/schema-form/helpers/error`(`formatAllOfTypeRedefinitionError`, `formatAllOfIgnoredKeywordWarning`), `@/schema-form/helpers/warning`(`warnDevelopmentIssue`, `ALL_OF_KEYWORD_IGNORED_FOR_FORM`), `@/schema-form/types`(`JsonSchema`), `./utils/{getCloneDepth, getMergeSchemaHandler(+IGNORE_FIELDS), validateCompatibility}`
