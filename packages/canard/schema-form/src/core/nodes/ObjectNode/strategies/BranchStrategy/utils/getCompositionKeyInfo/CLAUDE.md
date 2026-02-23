# getCompositionKeyInfo

## Purpose
`oneOf`/`anyOf` 스키마 분기에서 프로퍼티 키 정보를 추출한다. 모든 분기의 합집합 키셋과 각 분기별 키셋 배열을 반환하여 조건부 노드 관리에 사용된다.

## Structure
- `getCompositionKeyInfo.ts` — 핵심 구현
- `index.ts` — re-export

## Conventions
- 반환 타입: `{ unionKeySet: Set<string>; schemaKeySets: Set<string>[] } | undefined`
- `type` 또는 `$ref`가 없는 프로퍼티는 키셋에서 제외
- `scope`가 없거나 비어 있으면 `undefined` 반환

## Boundaries

### Always do
- `type`/`$ref` 없는 프로퍼티는 건너뜀
- 반환 `undefined`는 해당 합성 타입 없음을 의미

### Ask first
- 키셋 포함 기준 변경 (`type`/`$ref` 외 조건 추가)

### Never do
- 반환된 Set을 caller에서 직접 수정
- `allOf` 처리에 이 함수를 재사용

## Dependencies
- `ObjectSchema` — `@/schema-form/types`
