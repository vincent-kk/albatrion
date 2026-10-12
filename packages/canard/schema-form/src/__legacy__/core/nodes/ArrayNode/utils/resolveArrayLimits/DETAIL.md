# resolveArrayLimits

## Requirements

배열의 명시적 길이 제약과 items가 없거나 false인 닫힌 tuple의 길이 상한을 함께 반영합니다.

## API Contracts

- minItems가 없으면 0, maxItems가 없으면 Infinity를 기본으로 사용합니다.
- items가 없거나 false이고 prefixItems가 있으면 해당 길이를 상한으로 삼아 명시적 maxItems와 더 작은 값을 선택합니다.

## Acceptance Criteria

### resolve-array-limits-contract — 관찰 가능한 동작

- items가 없거나 false인 닫힌 tuple의 허용 최대 길이는 prefixItems 길이를 넘지 않습니다.
- 일반 배열이나 열린 tuple에서는 tuple 때문에 추가 상한을 만들지 않습니다.

## Last Updated

2026-09-16 — items: false도 닫힌 tuple 상한에 포함됨을 명시.
