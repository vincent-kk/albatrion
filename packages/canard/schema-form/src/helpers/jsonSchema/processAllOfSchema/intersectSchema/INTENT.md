# intersectSchema

## Purpose

allOf 병합에서 타입별 스키마 교집합 로직을 구현한다. string, number, boolean, null, array, object 각 타입에 대해 제약 조건(min/max, pattern, enum, const, required 등)을 교집합 규칙으로 병합한다. 타입별 병합 규칙·유틸 상세는 `DETAIL.md` 참조.

## Structure

| 파일                                                   | 역할                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| `intersectStringSchema.ts`                             | string 교집합                                                      |
| `intersectNumberSchema.ts`                             | number/integer 교집합                                              |
| `intersectBooleanSchema.ts` / `intersectNullSchema.ts` | boolean·null 교집합                                                |
| `intersectArraySchema.ts`                              | array 교집합                                                       |
| `intersectObjectSchema.ts`                             | object 교집합 (properties 분배 포함)                               |
| `index.ts`                                             | barrel export                                                      |
| `utils/`                                               | 공유 교집합 유틸 (range·pattern·enum·const·required·distribute 등) |

## Conventions

- 모든 intersect 함수: `(base, source) => base` (base를 직접 변경 후 반환)
- 범위 제약: min은 최대값 선택, max는 최소값 선택
- pattern: 두 패턴을 `(?=pattern1)(?=pattern2)` lookahead AND로 결합
- enum: 두 배열의 교집합 (deep equality), const: 두 값이 동일해야 유효
- required: 합집합 (`unionRequired`)
- 범위 불일치 시 `validateRange`에서 `JsonSchemaError` throw

## Boundaries

### Always do

- `base` 객체를 직접 수정하여 반환 (복제는 `processAllOfSchema`에서 이미 처리됨)
- 새 타입 추가 시 `utils/`의 공유 유틸리티 최대한 재사용
- `validateRange`로 min/max 역전 시 에러 throw

### Ask first

- 기존 교집합 규칙 변경 (enum 동등성, pattern 결합 방식 등)
- `distributeSubSchema`에서 properties 분배 방식 변경

### Never do

- `source` 객체를 직접 변경
- `getMergeSchemaHandler` 외부에서 intersect 함수를 직접 호출
- 타입 검증 없이 `base`에 `source` 필드를 단순 `Object.assign`

## Dependencies

- 내부: `@/schema-form/types`(타입별 Schema), `@/schema-form/errors`(`JsonSchemaError`), `./utils/*`(교집합 유틸)
