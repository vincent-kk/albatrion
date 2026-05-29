# resolveArrayLimits

## Purpose

배열 스키마의 `minItems`/`maxItems` 제약을 계산하는 순수 유틸 함수. closed tuple(`prefixItems`만 있고 `items` 없음) 패턴도 자동으로 처리한다.

## Structure

| 파일                    | 역할                                                                      |
| ----------------------- | ------------------------------------------------------------------------- |
| `resolveArrayLimits.ts` | `resolveArrayLimits(jsonSchema: ArraySchema): ArrayLimits` 단일 함수 구현 |
| `index.ts`              | `resolveArrayLimits` re-export 전용 배럴                                  |

## Conventions

- 반환 타입: `interface ArrayLimits { readonly min: number; readonly max: number }` — as const 객체
- 기본값: `minItems` 미지정 → `min = 0`, `maxItems` 미지정 → `max = Infinity`
- Closed tuple 판별: `!jsonSchema.items && isArray(jsonSchema.prefixItems)` → `tupleLimit = prefixItems.length`
- Open tuple(`items` 있음) 또는 일반 배열: `tupleLimit = Infinity` 로 통과
- 최종 `max = minLite(explicitMax, tupleLimit)` — 두 제약 중 더 작은 값 선택

## Boundaries

### Always do

- `items`가 없고 `prefixItems`가 있으면 closed tuple로 처리해 `max`를 `prefixItems.length`로 제한
- `minItems`/`maxItems`가 `undefined`인 경우 기본값(`0` / `Infinity`) 사용
- 반환 객체는 항상 `as const` — 호출자가 값을 변경할 수 없도록 보장

### Ask first

- tuple 제약 계산 로직 변경 (JSON Schema 명세와 다를 경우)
- `Infinity` 대신 다른 sentinel 값 사용

### Never do

- 입력 `jsonSchema` 객체를 변경하거나 프로퍼티를 추가
- `min > max` 상태를 반환

## Dependencies

- 외부: `@winglet/common-utils/filter` (`isArray`), `@winglet/common-utils/math` (`minLite`)
- 내부: `@/schema-form/types` (`ArraySchema`)
