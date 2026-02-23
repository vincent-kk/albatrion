# processVirtualSchema

## Purpose
virtual 필드 정의가 있는 object 스키마를 변환한다. `schema.virtual` 맵을 기반으로 `required`, `then`, `else` 조건에서 virtual 필드명을 실제 구성 필드 목록으로 展開하고 `virtualRequired` 추적 배열을 생성한다.

## Structure
- `processVirtualSchema.ts` — 공개 변환 함수
- `index.ts` — barrel export
- `utils/transformCondition.ts` — `required`/`then`/`else` 재귀 변환 및 virtual 필드 展開

## Conventions
- TypeScript strict 모드, 순수 함수
- `processVirtualSchema(schema)` → 변환된 schema 또는 `null` (변환 불필요 시)
- `schema.virtual`이 없으면 즉시 `null` 반환
- `required`, `then`, `else` 중 하나라도 존재해야 변환 수행 (아니면 `null`)
- `transformCondition`은 `then`/`else`에 재귀 적용
- virtual 필드 展開: virtual 키 → `fields` 배열로 치환, 원본 키는 `virtualRequired`에 기록

## Boundaries

### Always do
- `schema.virtual`이 없으면 반드시 `null` 반환
- 실제 변환이 발생했을 때만 변환된 schema 반환 (`expired` 플래그 확인)
- `transformCondition`에서 중복 필드명 제거 (indexOf 검사)
- `preprocessSchema`의 object 스키마 mutate 단계에서만 호출

### Ask first
- `virtualRequired` 배열의 역할 또는 저장 위치 변경
- virtual 필드 展開 시 중복 처리 정책 변경

### Never do
- 입력 `schema` 객체를 직접 변경(mutate) — 항상 shallow copy 후 수정
- `preprocessSchema` 외부에서 독립 호출
- `virtual` 키 자체를 출력 스키마에서 제거 (현재 의도적으로 보존)

## Dependencies
- `@aileron/declare` — `Dictionary`
- `@/schema-form/types` — `JsonSchema`
- `./utils/transformCondition` — 조건 재귀 변환
