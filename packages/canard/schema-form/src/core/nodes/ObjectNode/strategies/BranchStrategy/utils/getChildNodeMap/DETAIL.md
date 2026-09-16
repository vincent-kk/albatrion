# getChildNodeMap

## Requirements

객체 properties를 조건과 가상 참조 정보가 반영된 자식 노드로 변환합니다.

## API Contracts

- 반환 맵은 core의 ChildNode 계약을 사용하며, 소비하는 BranchStrategy의 타입 별칭에 역의존하지 않습니다.
- properties가 없으면 빈 맵을 반환합니다. 생성은 전달받은 nodeFactory에 위임합니다.
- 조건을 중복 제거해 병합하며 원래 스키마와 참조 맵은 변경하지 않습니다.

## Acceptance Criteria

### get-child-node-map-contract — 관찰 가능한 동작

- required 목록 또는 해당 필드 조건을 통해 자식의 필수 여부가 전달됩니다.
- 가상 참조 필드만 virtual 표시를 가지며 합쳐진 조건은 새 스키마에 반영됩니다.

## Last Updated

2026-09-16
