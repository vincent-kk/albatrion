# nodes

## Requirements

노드 타입별 값 처리는 공통 노드의 이벤트·상태 생명주기를 유지해야 합니다.

## API Contracts

- 객체·배열의 branch는 자식을 관리할 수 있고 terminal은 자식 트리를 관리하지 않습니다.
- integer 스키마는 number 노드 타입으로 표현하되 원래 schemaType을 보존하여 정수 처리를 결정합니다.

## Acceptance Criteria

### nodes-contract — 관찰 가능한 동작

- 노드별 값 적용은 공통 이벤트 옵션을 따르며 내부 상태를 외부 호출로 우회하지 않습니다.
- 새 노드 구현도 공통 초기화와 값 접근 계약을 유지합니다.

## Last Updated

2026-09-16
