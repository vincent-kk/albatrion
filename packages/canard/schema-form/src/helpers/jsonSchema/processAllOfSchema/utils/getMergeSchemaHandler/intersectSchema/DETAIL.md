# intersectSchema — DETAIL

## Requirements

- allOf 병합 시 동일 타입 스키마들의 제약을 의미 보존적으로 교집합한다.
- 교집합이 불가능한 제약(예: `minimum > maximum`, `const` 불일치)은 `JsonSchemaError`로 명확히 실패한다.
- 각 핸들러는 `base`를 in-place 변경하여 반환하고, 입력 복제는 상위 `processAllOfSchema`가 책임진다.

## API Contracts

타입별 핸들러 — 시그니처 `intersect<Type>Schema(base, source): base`:

| 타입           | 병합 규칙                                                                        |
| -------------- | -------------------------------------------------------------------------------- |
| string         | `minLength`=max, `maxLength`=min, `pattern`=lookahead AND, `enum`/`const` 교집합 |
| number/integer | `minimum`=max, `maximum`=min, `multipleOf` 결합, `enum`/`const` 교집합           |
| boolean / null | `const`·`enum` 동등성 검증                                                       |
| array          | `items` 재귀 병합, `minItems`/`maxItems` 범위 교집합                             |
| object         | `properties`를 allOf로 분배(`distributeSubSchema`), `required` 합집합            |

공유 유틸 (`utils/`):

| 파일                                                                     | 역할                                        |
| ------------------------------------------------------------------------ | ------------------------------------------- |
| `intersectConst` / `intersectEnum`                                       | 값 교집합                                   |
| `intersectMinimum` / `intersectMaximum`                                  | 범위 교집합                                 |
| `intersectPattern`                                                       | 패턴 AND 결합                               |
| `intersectBooleanOr` / `intersectMultipleOf`                             | 기타 제약 결합                              |
| `unionRequired`                                                          | `required` 배열 합집합                      |
| `validateRange`                                                          | min/max 역전 검증 → `JsonSchemaError` throw |
| `distributeSubSchema`                                                    | `properties`를 allOf로 분배                 |
| `processFirstWinFields` / `processOverwriteFields` / `processSchemaType` | 필드 분류 병합                              |
| `constants.ts`                                                           | 필드 분류 상수(first-win / overwrite)       |

## Last Updated

2026-05-29
