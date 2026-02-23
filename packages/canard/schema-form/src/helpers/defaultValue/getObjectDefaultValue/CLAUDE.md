# getObjectDefaultValue

## Purpose
`JsonSchemaScanner`로 객체 스키마 트리를 재귀 순회하여 중첩된 모든 `default` 값을 수집하고 병합한 기본값 객체를 반환한다.

## Structure
- `getObjectDefaultValue.ts` — 구현 (스캐너 기반 트리 순회)
- `index.ts` — named export

## Conventions
- `inputDefault` > `jsonSchema.default` > `{}` 우선순위로 베이스 결과 초기화
- `setValue`는 `overwrite: false`로 호출 — 상위 값이 하위 기본값을 덮어쓰지 않음
- `preserveNull: false` — null 경로를 무시하고 계속 탐색
- 결과가 빈 객체(`isEmptyObject`)이면 원래 `defaultValue`를 반환 (undefined 가능)

## Boundaries

### Always do
- `ObjectSchema` 타입 인자만 허용할 것
- `SET_VALUE_OPTIONS` 상수(`overwrite: false`)를 항상 `setValue`에 전달할 것

### Ask first
- `overwrite` 또는 `preserveNull` 옵션 변경 (기존 기본값 병합 동작에 영향)
- 스캔 방문자(`visitor`) 로직 변경

### Never do
- 스캔 결과를 모듈 수준 변수에 캐싱
- `ObjectSchema` 외의 스키마 타입(Array, String 등)을 직접 처리

## Dependencies
- `@winglet/common-utils/filter` — `isEmptyObject`
- `@winglet/common-utils/lib` — `hasOwnProperty`
- `@winglet/json-schema/scanner` — `JsonSchemaScanner`
- `@winglet/json/pointer` — `setValue`
- `@aileron/declare` — `Nullish`
- `@/schema-form/types` — `JsonSchema`, `ObjectSchema`, `ObjectValue`
