# validateSchemaType

## Requirements

분기 전환 시 값의 타입 재사용 가능성을 변환 없이 판정합니다.

## API Contracts

- undefined는 false입니다. null은 nullable이거나 null 타입일 때만 true입니다.
- 배열은 별도 판별하며 나머지는 typeof와 노드 타입을 비교합니다.

## Acceptance Criteria

### validate-schema-type-contract — 관찰 가능한 동작

- 배열을 일반 object 값으로 통과시키지 않습니다.
- 타입 불일치는 예외가 아니라 false이며 값 자체는 변경하지 않습니다.

## Last Updated

2026-09-16
