# isNullBranch

## Requirements

`oneOf`/`anyOf` 분기 중 값을 담지 않고 검증에만 쓰이는 분기를 가려냅니다.

## API Contracts

- 입력은 분기 스키마이고 반환은 `boolean`입니다. `extractSchemaInfo`가 해석한 `type`이 `null`일 때만 `true`입니다.
- `type: 'null'`, `type: ['null']`, `nullable` 표기 차이는 `extractSchemaInfo`가 흡수하므로 호출부는 표기를 구분하지 않습니다.
- 스키마가 `undefined`이거나 `type`이 없으면 `false`입니다.
- 이 판정의 소유자는 이 가드 하나입니다 — 분기 마커를 넣는 `preprocessSchema`, 자식 노드를 건너뛰는 `getCompositionNodeMapList`, 키 중복 검사를 건너뛰는 `getCompositionKeyInfo`, 조건 인덱스를 계산하는 `extractConditionInfo`가 같은 판정을 봅니다.

## Acceptance Criteria

### null-branch-detection — 표기와 무관하게 같은 판정을 낸다

- `{ type: 'null' }`, `{ type: ['null'] }`가 모두 `true`입니다.
- `{ type: 'object' }`, `{ type: ['string', 'null'] }`, `{}`, `undefined`는 `false`입니다.
- 판정 과정에서 입력 스키마를 복제하거나 변경하지 않습니다.

## Last Updated

2026-09-21 — `filter.ts`에서 분리해 독립 fractal로 승격. 이유: 자식 fractal `preprocessSchema`가 이 가드를 쓰면서 부모 루트 파일 `filter.ts`를 직접 import해 entry point를 우회했고, `jsonSchema → preprocessSchema → jsonSchema` 순환이 생겼다. 형제 fractal의 entry point를 쓰도록 바꾸면 순환이 사라진다. 입력이 타입이 아니라 분기 스키마라 `filter.ts`의 타입 가드 2개와 애초에 계약이 달랐다.
