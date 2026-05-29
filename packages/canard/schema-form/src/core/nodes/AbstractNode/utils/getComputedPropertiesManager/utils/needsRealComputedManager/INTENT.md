# needsRealComputedManager

## Purpose

노드가 실제 `ComputedPropertiesManager` 를 생성해야 하는지, 아니면 `sharedComputedSentinel` 을 공유해도 되는지 판정한다. computed surface 가 전혀 없는 평범한 노드(대다수)는 sentinel 로 대체하여 노드당 mount 할당을 제거한다.

## Structure

- `needsRealComputedManager.ts` — 판정 함수
- `index.ts` — barrel export

## Conventions

- PRESENCE 기준 (`!== undefined`), truthiness 아님 — `computed.disabled: false` 도 정의된 함수를 만든다
- `checkComputedOptionFactory`/`getConditionIndexFactory`/`getObservedValuesFactory`/`getDerivedValueFactory` 의 read 경로를 그대로 미러링
- 5개 절: computed.\* / `&` alias / top-level state / root 상속 / object oneOf·anyOf

## Boundaries

### Always do

- 의심되면 `true` 반환 (real manager 로 fallthrough) — false negative 는 UI 미반응 버그
- root 스키마 state 키 검사 포함 (checkComputedOption 이 root 를 먼저 읽음)

### Ask first

- 절(clause) 추가/삭제 — sentinel 안전성에 직결

### Never do

- 문자열 내용으로 pointer vs literal 판단 (저장 비용 절감보다 false negative 위험이 큼)
- root 상속 절(4) 또는 object oneOf/anyOf 절(5) 제거

## Dependencies

- `@/schema-form/types` — `JsonSchemaType`, `JsonSchemaWithVirtual`
- `../../ComputedPropertiesManager/utils/type` — `ALIAS`, `STATE_FIELD_NAMES`, `COMPUTED_FIELD_NAMES` (단일진실 상수, 타입 `satisfies` 검증)
