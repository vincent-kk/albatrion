# node

## Requirements

노드 생성은 DOM에 의존하지 않습니다. 팩토리는 알려진 종류를 선택하고 알 수 없는 종류는 오류로 드러냅니다.

## API Contracts

- prompt의 미입력 값 undefined는 확인과 returnOnCancel 취소에서도 보존합니다.
- 생성된 노드는 결과 확정과 표시·생존 상태를 독립적으로 유지합니다.

## Acceptance Criteria

### node-contract — 관찰 가능한 동작

- 생성된 노드는 종류별 결과와 공통 확정 상태를 함께 유지합니다.

## Last Updated

공개 결과·설정·초기화 또는 표시 계약이 바뀔 때 갱신합니다.
