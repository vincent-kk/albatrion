# resolveArrayValueFilter contract

## Requirements

- `ArraySchema.options`의 `omitTrailing`(opt-in, `=== true`)과 `omitEmpty`(opt-out, `!== false`)를 읽어 **부모 전파(`onChange`) 값 필터**를 합성한다.
- 필터 순서는 omitTrailing → omitEmpty 고정: 전부 `undefined`인 배열은 `[]`를 거쳐 `undefined`로 수렴한다.
- 둘 다 비활성이면 identity 필터를 반환하며, 반환된 필터는 상태가 없다.

## API Contracts

```typescript
resolveArrayValueFilter(
  options: ArraySchema['options'],
): (value: ArrayValue | Nullish) => ArrayValue | Nullish
```

호출처: `ArrayNode` 생성자 (1회, 전략 생성 전).

## Acceptance Criteria

### filter-composition — 옵션별 합성

- 기본(옵션 없음): `[]` → `undefined`, `[1,undefined]` → 동일 참조 (trim 없음).
- `{omitTrailing:true}`: `[1,undefined,undefined]` → `[1]`, `[undefined,undefined]` → `undefined`.
- `{omitTrailing:true, omitEmpty:false}`: `[undefined,undefined]` → `[]`.
- `{omitEmpty:false}`: `[]` → 동일 참조.

## Last Updated

2026-08-12 — 초기 계약 명문화 (신규 문서).
