# SchemaNodeProxy

## Requirements

경로나 노드 참조로 찾은 노드를 입력 팩토리와 오류 경계를 갖춘 렌더러에 연결합니다.

## API Contracts

- 노드가 없거나 비활성이면 null을 반환합니다. 오류 표시가 꺼져 있으면 오류 포맷 함수의 결과를 노출하지 않습니다.
- RequestRemount는 래퍼 key를 변경하며, 사용자 override는 노드 식별 정보처럼 덮어쓸 수 없는 필드를 대체하지 않습니다.

## Acceptance Criteria

### schema-node-proxy-contract — 관찰 가능한 동작

- 렌더러 예외는 오류 경계 안에서 처리됩니다.
- 오류 표시 조건이 거짓이면 기존 오류가 있어도 오류 메시지를 렌더러에 표시하지 않습니다.

## Last Updated

2026-09-16
