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

## Acceptance Criteria

### base-in-place — 병합은 base를 바꿔 돌려주고 source는 건드리지 않는다

- 임의의 `intersect<Type>Schema(base, source)` 반환값이 `base`와 동일 참조다.
- 호출 전후로 `source`의 모든 필드가 그대로다.

### range-inversion — 교집합이 빈 범위면 병합이 실패한다

- `minimum`이 `maximum`보다 큰 조합에서 `validateRange`가 `JsonSchemaError`를 throw한다.
- `const`가 서로 다른 두 스키마를 병합하면 `JsonSchemaError`를 throw한다.

### multipleOf-lcm — multipleOf 교집합은 두 값의 최소공배수다

- 두 값이 모두 유효하면 결과가 두 값 각각의 배수이며, 그 조건을 만족하는 최소 양수다.
- 한쪽만 있으면 그 값이 그대로 결과가 된다.
- 양쪽 모두 없으면 결과가 `undefined`다.

### multipleOf-nonfinite — 비유한 multipleOf는 제약이 아니라 부재로 취급한다

- `NaN`, `Infinity`, `-Infinity`는 JSON Schema가 허용하는 `multipleOf` 값이 아니므로 결과에 전파되지 않는다.
- 한쪽이 비유한 값이면 다른 쪽 값이 그대로 결과가 된다.
- 양쪽 모두 비유한 값이면 결과가 `undefined`이며, `NaN`이 아니다.

## Last Updated

2026-08-17 — `## Acceptance Criteria` 신설. `intersectMultipleOf`가 비유한 값을 `NaN`으로 전파하지 않고 부재로 취급하도록 바뀐 계약을 `multipleOf-nonfinite`로 명문화하고, 기존에 산문으로만 있던 in-place 규약과 범위 역전 실패 규약을 검증 가능한 형태로 옮겼다.
