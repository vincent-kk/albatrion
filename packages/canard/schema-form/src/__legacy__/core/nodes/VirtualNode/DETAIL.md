# VirtualNode

## Requirements

참조 노드들의 값을 같은 순서의 배열로 묶어 가상 입력을 제공합니다.

## API Contracts

- 정의된 값 배열의 길이가 참조 노드 수와 다르면 INVALID_VIRTUAL_NODE_VALUES 오류입니다.
- 참조 노드의 값 변경을 구독해 배열을 갱신하고 구독 해제를 노드 정리 경로에 등록합니다.

## Acceptance Criteria

### virtual-node-contract — 관찰 가능한 동작

- 배열의 각 위치는 생성 때 정한 참조 노드와 계속 대응합니다.
- 잘못된 길이의 배열을 부분 적용하지 않고 오류로 드러냅니다.

## Last Updated

2026-09-16
