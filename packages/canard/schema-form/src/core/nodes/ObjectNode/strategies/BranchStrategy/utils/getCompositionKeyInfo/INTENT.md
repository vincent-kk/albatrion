# getCompositionKeyInfo

## Purpose

`oneOf` 또는 `anyOf` 스키마 분기에서 프로퍼티 키 정보를 추출한다. 전체 분기의 합집합 키셋(`unionKeySet`)과 각 분기별 키셋 배열(`schemaKeySets`)을 반환하여 `BranchStrategy`의 조건부 노드 관리에 사용된다.

## Structure

| 파일                       | 역할                                          |
| -------------------------- | --------------------------------------------- |
| `getCompositionKeyInfo.ts` | 핵심 구현 — `getCompositionKeyInfo` 단일 함수 |
| `index.ts`                 | `getCompositionKeyInfo` re-export             |

## Conventions

- 반환 타입: `{ unionKeySet: Set<string>; schemaKeySets: Set<string>[] } | undefined`
- 포함 기준: 프로퍼티 스키마에 `type` 또는 `$ref` 중 하나 이상 존재해야 키셋에 추가
- `schema[scope]`가 없거나 길이 0이면 `undefined` 반환
- `schemaKeySets[i]`는 해당 분기에 `properties`가 없으면 초기화되지 않아 `undefined`일 수 있음

## Boundaries

### Always do

- `scope` 파라미터는 반드시 `'oneOf'` 또는 `'anyOf'`만 허용
- `type`/`$ref` 없는 프로퍼티는 건너뜀 — 순수 논리 조건 프로퍼티 제외
- 반환 `undefined`는 해당 합성 키워드가 스키마에 없음을 의미

### Ask first

- 키셋 포함 기준 변경 (`type`/`$ref` 외에 `enum`, `const` 등 추가)
- `allOf` 처리 지원 확장

### Never do

- 반환된 `unionKeySet` 또는 `schemaKeySets[i]`를 호출부에서 직접 수정
- `allOf` 처리에 이 함수 재사용 (별도 함수 필요)
- `scope` 외 합성 키워드(`allOf`, `not`)를 직접 처리

## Dependencies

내부:

- `@/schema-form/types` — `ObjectSchema`
