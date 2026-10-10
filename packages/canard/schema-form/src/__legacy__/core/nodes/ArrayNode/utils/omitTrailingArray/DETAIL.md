# omitTrailingArray contract

## Requirements

- 배열 끝의 **연속된 `undefined`만** 제거하는 순수 함수. 선행·중간 `undefined`와 `null` 요소는 보존한다.
- 제거할 것이 없으면 원본 참조를 그대로 반환하고, 제거 시에도 원본을 변경하지 않고 `slice` 사본을 반환한다.
- `null`/`undefined`/비배열 입력은 그대로 통과한다.

## API Contracts

```typescript
omitTrailingArray(value: ArrayValue | Nullish): ArrayValue | Nullish
```

호출처: `resolveArrayValueFilter`(onChange 전파 합성), `ArrayNode.normalizedValue`.

## Acceptance Criteria

### trailing-only — 후행 한정 제거

- `[1,2,3,undefined,undefined]` → `[1,2,3]`; `[undefined]`·`[undefined,undefined]` → `[]`.
- `[undefined,1,2]`·`[1,undefined,2]`·`[1,null,null]` → 동일 참조 반환.
- 입력 배열은 변형되지 않는다 (`slice` 사본).

## Last Updated

2026-08-12 — 초기 계약 명문화 (신규 문서).
