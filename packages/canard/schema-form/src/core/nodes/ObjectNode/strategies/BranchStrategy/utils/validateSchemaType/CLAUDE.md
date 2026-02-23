# validateSchemaType

## Purpose
JavaScript 값이 JSON Schema 타입과 일치하는지 확인하는 순수 유틸 함수. oneOf 분기 전환 시 이전 값을 새 분기 노드에 재사용할 수 있는지 판단하는 데 사용된다.

## Structure
- `validateSchemaType.ts` — 핵심 구현
- `index.ts` — re-export

## Conventions
- 시그니처: `(value, type, nullable) => boolean`
- `undefined` → 항상 `false`
- `null` → `nullable === true` 또는 `type === 'null'`이면 `true`
- 배열 → `type === 'array'`일 때만 `true`
- 그 외 → `typeof value === type`

## Boundaries

### Always do
- `undefined`는 항상 `false` 반환
- `null` 판단 시 `nullable` 플래그와 `'null'` 타입 모두 확인
- 배열은 `isArray`로 판별 (`typeof []`는 `'object'`이므로)

### Ask first
- `integer` 타입에 대한 추가 정수 검증 (`Number.isInteger`) 추가

### Never do
- 타입 불일치 시 예외 던지기 (boolean 반환 유지)
- `typeof null === 'object'` 기반 null 판별 사용

## Dependencies
- `@winglet/common-utils/filter` (`isArray`)
- `SchemaNode` — `core/nodes/type` (type 및 nullable 타입)
