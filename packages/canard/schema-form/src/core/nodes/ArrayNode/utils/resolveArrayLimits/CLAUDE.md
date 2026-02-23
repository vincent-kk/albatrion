# resolveArrayLimits

## Purpose
배열 스키마의 `minItems`/`maxItems` 제약을 계산하는 순수 유틸 함수. closed tuple(`prefixItems`만 있고 `items` 없음) 패턴도 자동으로 처리한다.

## Structure
- `resolveArrayLimits.ts` — 핵심 구현
- `index.ts` — re-export

## Conventions
- 반환 타입: `{ min: number; max: number }` (readonly)
- 기본값: `min = 0`, `max = Infinity`
- Closed tuple: `items` 없음 + `prefixItems` 있음 → `max = prefixItems.length`
- `maxItems`와 tuple 제한 중 더 작은 값 적용 (`minLite`)

## Boundaries

### Always do
- `items`가 없고 `prefixItems`가 있으면 closed tuple로 처리
- `minItems`/`maxItems`가 `undefined`인 경우 기본값 사용
- `max`는 항상 `min` 이상이어야 함

### Ask first
- tuple 제약 계산 로직 변경 (JSON Schema 명세와 다를 경우)
- `Infinity` 대신 다른 sentinel 값 사용

### Never do
- 입력 스키마 객체를 변경
- `min > max` 상태를 반환

## Dependencies
- `@winglet/common-utils/filter` (`isArray`)
- `@winglet/common-utils/math` (`minLite`)
- `ArraySchema` — `@/schema-form/types`
