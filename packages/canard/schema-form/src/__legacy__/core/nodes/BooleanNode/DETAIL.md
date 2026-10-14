# BooleanNode

## Requirements

boolean 값의 파싱과 노드 이벤트 옵션을 함께 유지합니다.

## API Contracts

- undefined는 보존하고 nullable일 때 null을 허용하며 나머지는 boolean 파서에 위임합니다.
- 값 변경은 공통 변경 경로로 처리하고 옵션 비트에 따라 변경·리프레시·업데이트 이벤트를 구분합니다.

## Acceptance Criteria

### boolean-node-contract — 관찰 가능한 동작

- nullable인 노드에 null을 적용하면 false로 강제 변환하지 않습니다.
- 기본값 적용 후 초기화를 완료하며 자식 노드를 만들지 않습니다.

## Last Updated

2026-09-16
