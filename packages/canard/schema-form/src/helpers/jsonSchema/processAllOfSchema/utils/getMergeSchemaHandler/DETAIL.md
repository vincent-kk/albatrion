# getMergeSchemaHandler — DETAIL

## Requirements

- 타입 판정은 반드시 `extractSchemaInfo`를 경유한다 — `schema.type` 직접 참조 금지.
- 매핑에 없는 타입에 기본 병합 로직을 폴백으로 제공하지 않는다 — `null`을 반환해 소비자가 병합을 생략하게 한다.
- 반환된 핸들러는 `base`를 in-place 병합해 돌려준다 — 복제 책임은 호출자(`processAllOfSchema`)에 있다.

## API Contracts

`getMergeSchemaHandler(schema: JsonSchema): MergeSchemaHandler | null`

- `MergeSchemaHandler = (base: JsonSchema, source: Partial<JsonSchema>) => JsonSchema` — 반환값은 `base` 동일 참조.
- 타입 매핑: `array`·`boolean`·`null`·`object`·`string`은 각 타입 전용 핸들러, `number`와 `integer`는 **동일한** `intersectNumberSchema`.
- type이 없거나 매핑 밖 타입(`virtual` 포함)이면 `null`.

## Acceptance Criteria

### handler-selection — 타입마다 전용 핸들러, 수치 타입은 공유

- 6개 지원 타입 각각에서 대응 intersect 핸들러가 반환된다.
- `type: 'number'`와 `type: 'integer'`가 같은 핸들러를 반환한다.

### null-for-unknown — 모르는 타입은 null이고, null이면 병합이 없다

- type 부재·미지원 타입 스키마에서 `null`이 반환된다.
- 소비자(`processAllOfSchema`)는 `null`을 받으면 병합 없이 원본을 반환한다.

## Last Updated

2026-08-18 — 문서 신설. null 폴백 금지 계약과 number/integer 핸들러 공유를 명문화 (issue #331, FIX-051).
