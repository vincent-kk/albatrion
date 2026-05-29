# validateSchemaType

## Purpose

JavaScript 값이 JSON Schema 타입과 일치하는지 확인하는 순수 유틸 함수. oneOf/anyOf 분기 전환 시 이전 값을 새 분기 노드에 재사용할 수 있는지 판단하는 데 사용된다.

## Structure

| 파일                    | 역할                                             |
| ----------------------- | ------------------------------------------------ |
| `validateSchemaType.ts` | 핵심 구현 — `(value, type, nullable) => boolean` |
| `index.ts`              | re-export 배럴                                   |

## Conventions

- 시그니처: `(value: unknown, type: SchemaNode['type'], nullable: SchemaNode['nullable']) => boolean`
- `undefined` → 타입 무관 항상 `false`
- `null` → `nullable === true` 또는 `type === 'null'`이면 `true`
- 배열 → `isArray` 사용 (`typeof []`는 `'object'`이므로 직접 판별)
- 그 외 → `typeof value === type` 위임
- `integer` 타입은 `typeof value === 'number'`로 통과 (정수 세분화 검증 없음)

## Boundaries

### Always do

- `undefined`는 반드시 `false` 반환
- 배열 판별은 반드시 `isArray(value)` 사용 (`typeof` 금지)
- 타입 불일치 시 예외 없이 `false` 반환

### Ask first

- `integer` 타입에 `Number.isInteger` 정수 검증 추가 (oneOf 분기 재사용 판단 변경 영향)
- `nullable` 플래그 처리 방식 변경

### Never do

- 타입 불일치 시 예외(throw) 발생
- `typeof null === 'object'` 기반 null 판별 사용
- 이 함수 내에서 값 변환 또는 강제 캐스팅

## Dependencies

### 내부 의존성

- `SchemaNode` (타입: `type`, `nullable`) — `@/schema-form/core/nodes/type`

### 외부 의존성

- `isArray` — `@winglet/common-utils/filter`
