# extractConditionInfo

## Purpose
oneOf/anyOf 스키마 배열을 순회하며 각 브랜치의 `computed.if` / `&if` 조건 표현식을 추출하고, JSONPointer 경로를 `dependencies[n]` 참조로 변환하여 런타임 평가 가능한 형태로 반환한다.

## Structure
- `extractConditionInfo.ts` — 메인 함수
- `index.ts` — barrel export
- `utils/getExpressionFromSchema.ts` — 스키마 프로퍼티에서 표현식 추출
- `utils/__tests__/getExpressionFromSchema.test.ts` — 유닛 테스트

## Conventions
- TypeScript strict 모드
- 반환: `{ expressions: string[], schemaIndices: number[] }` (순서 대응)
- `boolean true` 조건: `expressions.push('true')` 로 처리, `false` 는 스킵
- `string` 조건: `combineConditions([condition, getExpressionFromSchema(schema)])` 로 합성
- JSONPointer 경로 치환: `JSON_POINTER_PATH_REGEX` → `dependencies[pathManager.findIndex(path)]`
- 후행 세미콜론 제거: `.replace(/;$/, '')`

## Boundaries

### Always do
- `schemaIndices` 는 스키마 배열의 원래 인덱스(`i`) 사용 (압축 인덱스 아님)
- `pathManager.set(path)` 를 통해 경로 등록 후 `findIndex` 로 참조

### Ask first
- `combineConditions` 로직 변경 (AND/OR 결합 방식)
- `getExpressionFromSchema` 가 추출하는 스키마 필드 변경

### Never do
- 조건이 없는 스키마(`condition === undefined`)를 expressions에 추가
- `schemaIndices` 와 `expressions` 배열의 길이를 다르게 반환

## Dependencies
- `utils/getExpressionFromSchema` — 스키마에서 표현식 추출
- `../../../getPathManager` — `PathManager`
- `../../../regex` — `JSON_POINTER_PATH_REGEX`
- `../../../type` — `ALIAS`, `ConditionIndexName`
- `@/schema-form/helpers/dynamicExpression` — `combineConditions`
- `@/schema-form/types` — `PartialJsonSchema`
