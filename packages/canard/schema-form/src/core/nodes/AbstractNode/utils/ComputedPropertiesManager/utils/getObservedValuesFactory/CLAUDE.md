# getObservedValuesFactory

## Purpose
JSON Schema의 `computed.watch` / `&watch` 경로 배열을 파싱하여, 의존성 배열에서 감시 경로의 현재 값들을 순서대로 추출하는 `DynamicFunction<unknown[]>` 을 생성한다.

## Structure
- `getObservedValuesFactory.ts` — 팩토리 함수
- `index.ts` — barrel export

## Conventions
- TypeScript strict 모드
- `watch` 값: 단일 string 또는 string[] 모두 처리 (내부적으로 배열로 정규화)
- 반환 함수: `(dependencies) => dependencies[i], dependencies[j], ...` 순서 보존
- `pathManager.set(path)` + `pathManager.findIndex(path)` 로 인덱스 수집
- 컴파일 실패 시 `JsonSchemaError('OBSERVED_VALUES')` throw

## Boundaries

### Always do
- `watchValueIndexes.length === 0` 이면 `undefined` 반환
- 경로 등록은 `pathManager.set()` 을 통해 수행

### Ask first
- `watch` 가 string 단일값일 때의 처리 방식 변경

### Never do
- watch 경로를 `pathManager` 없이 직접 인덱스로 변환
- 결과 배열의 순서를 watch 배열 순서와 다르게 반환

## Dependencies
- `../getPathManager` — `PathManager`
- `../type` — `ALIAS`, `DynamicFunction`, `ObservedFieldName`
- `@winglet/common-utils/filter` — `isArray`, `isString`
- `@/schema-form/errors` — `JsonSchemaError`
- `@/schema-form/helpers/error` — `formatObservedValuesError`
- `@/schema-form/types` — `JsonSchemaWithVirtual`
