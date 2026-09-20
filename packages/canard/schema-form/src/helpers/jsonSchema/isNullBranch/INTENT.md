# isNullBranch

## Purpose

`oneOf`/`anyOf` 분기 스키마가 검증 전용 null 분기인지 판정한다. "이 분기는 폼 노드를 만들지 않는다"라는 판정을 이 가드 하나가 소유한다.

## Conventions

- TypeScript strict 모드, 순수 함수
- 입력은 타입이 아니라 분기 스키마다 — `filter.ts`의 타입 가드와 입력 종류가 다르다
- 반환 타입: `boolean`
- `type: 'null'`, `type: ['null']`, `nullable` 표기 차이는 `extractSchemaInfo`가 흡수한다

## Boundaries

### Always do

- 분기 스키마를 `extractSchemaInfo`로 해석한 뒤 `type`이 `null`인지로만 판정한다
- 판정이 필요한 소비자는 인라인 비교 대신 이 가드를 호출한다

### Ask first

- 판정 기준 확대 (`const: null`, `enum: [null]` 등) — 분기 마커를 넣는 쪽과 자식 노드를 건너뛰는 쪽이 함께 바뀌어야 한다

### Never do

- 스키마 객체를 변경(mutate)하거나 복제
- 이 판정의 사본을 소비자 쪽에 두기 — 마커를 넣는 쪽과 노드를 건너뛰는 쪽이 어긋나 분기 인덱스가 깨진다
