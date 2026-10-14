# NullNode

## Requirements

타입 계약상 null과 undefined를 표현하는 단말 노드입니다.

## API Contracts

- undefined는 그대로 두고 허용된 null 값은 별도 파싱 없이 전달합니다.
- 변경 옵션에 따라 콜백·리프레시·업데이트 이벤트를 나누며 기본값 적용 후 초기화합니다.

## Acceptance Criteria

### null-node-contract — 관찰 가능한 동작

- null 적용과 undefined 적용의 결과가 서로 구분됩니다.
- 자식 트리를 만들거나 다른 원시 타입으로 값을 변환하지 않습니다.

## Last Updated

2026-09-16
