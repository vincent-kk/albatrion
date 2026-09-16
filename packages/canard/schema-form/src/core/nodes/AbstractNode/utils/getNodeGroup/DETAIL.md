# getNodeGroup

## Requirements

노드의 자식 보유 방식은 생성 시 한 번 결정하며 이후 바꾸지 않습니다.

## API Contracts

- 명시적인 terminal boolean을 최우선으로 사용합니다.
- 명시값이 없으면 객체·배열도 직접 지정한 입력 컴포넌트가 있을 때 terminal로 처리하고, 그 외 원시 타입은 terminal입니다.

## Acceptance Criteria

### get-node-group-contract — 관찰 가능한 동작

- terminal이 false로 명시되면 타입 기본 분류보다 우선합니다.
- 생성 후 값이 변해도 이미 정해진 group은 다시 계산하지 않습니다.

## Last Updated

2026-09-16
