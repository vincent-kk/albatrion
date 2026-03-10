# defaultValue

## Purpose
JSON Schema로부터 폼 필드의 기본값을 산출하는 헬퍼 모음. `schema.default`, 타입 기반 빈값, 객체 트리 재귀 기본값 세 가지 전략을 제공한다.

## Structure
- `getDefaultValue/` — `schema.default` 우선, 없으면 타입 기반 빈값 반환
- `getEmptyValue/` — 타입 문자열(`'array'`|`'object'`)로 빈 컨테이너 반환
- `getObjectDefaultValue/` — `JsonSchemaScanner`로 객체 트리 전체를 순회하며 중첩 기본값 수집
- `index.ts` — 세 함수를 barrel export

## Conventions
- TypeScript strict 모드, 제네릭으로 스키마 타입 보존
- `getObjectDefaultValue`는 `overwrite: false`로 기존 값을 덮어쓰지 않음
- 빈 결과(`isEmptyObject`)면 원래 `defaultValue`를 그대로 반환

## Boundaries

### Always do
- `getObjectDefaultValue` 호출 시 `ObjectSchema` 타입을 넘길 것
- 반환 타입(`ArrayValue | ObjectValue | undefined`)을 호출부에서 명시적으로 처리할 것

### Ask first
- `getEmptyValue`에 새 원시 타입을 추가하는 경우 (노드 시스템 전반에 영향)
- `SET_VALUE_OPTIONS` 의 `overwrite`/`preserveNull` 기본값 변경

### Never do
- 이 디렉토리에서 React나 DOM API 사용
- `getObjectDefaultValue` 내부에서 스캔 결과를 직접 캐싱하거나 외부 상태에 저장

## Dependencies
- `@winglet/common-utils/filter` — `isEmptyObject`
- `@winglet/common-utils/lib` — `hasOwnProperty`
- `@winglet/json-schema/scanner` — `JsonSchemaScanner`
- `@winglet/json/pointer` — `setValue`
- `@aileron/declare` — `Nullish`
- `@/schema-form/helpers/jsonSchema` — `extractSchemaInfo`
- `@/schema-form/types` — `JsonSchema`, `ObjectSchema`, `ObjectValue`, `ArrayValue`
