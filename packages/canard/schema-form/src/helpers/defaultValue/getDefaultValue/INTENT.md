# getDefaultValue

## Purpose

JSON Schema에서 필드의 초기값을 결정하는 단일 함수 모듈.
`schema.default` 를 최우선으로 반환하고, 없으면 `virtual` 타입 분기 후
`extractSchemaInfo` + `getEmptyValue` 로 타입 기반 빈값을 반환한다.

## Structure

| 파일                 | 역할                                       |
| -------------------- | ------------------------------------------ |
| `getDefaultValue.ts` | 제네릭 함수 구현 — 3단계 우선순위 분기     |
| `index.ts`           | `getDefaultValue` named re-export (barrel) |

## Conventions

- 제네릭 `Schema extends { type?: JsonSchemaWithVirtual['type']; default?: any }` 로 호출부 타입 보존
- 우선순위: `schema.default` → `virtual` 조기 반환(`[]`) → `extractSchemaInfo` → `getEmptyValue`
- `extractSchemaInfo` 가 `null` 이면 `undefined` 반환 — 스키마 파싱 실패를 조용히 흡수
- 순수 함수: 인자 변경 없음, 부수 효과 없음

## Boundaries

### Always do

- `schema.default !== undefined` 체크를 함수 진입 첫 줄에서 수행할 것
- `virtual` 타입 조기 반환(`[]`)을 `extractSchemaInfo` 호출 전에 처리할 것
- 반환 타입을 호출부에 위임(제네릭) — 내부에서 캐스팅하지 말 것

### Ask first

- `virtual` 이외의 특수 타입(예: `conditional`, `computed`)에 대한 조기 반환 분기 추가
- `schema.default` 를 딥클론하거나 freeze하는 로직 도입

### Never do

- 이 함수 내에서 스키마 유효성 검사 또는 JSON Schema $ref 해석 수행
- `getEmptyValue` 외 별도 기본값 생성 로직 인라인 추가
- `extractSchemaInfo` 를 우회하여 `schema.type` 을 직접 분기

## Dependencies

- 내부: `@/schema-form/helpers/jsonSchema`(`extractSchemaInfo`), `@/schema-form/types`(`JsonSchemaWithVirtual`), `../getEmptyValue`(`getEmptyValue`)
