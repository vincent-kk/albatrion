# WorkspaceContext

## Requirements

폼별 첨부 파일 맵과 사용자 context를 전달합니다.

## API Contracts

- 외부 context를 기반으로 폼 수준 context를 덮어쓰며, 입력 context는 내용 기준으로 안정화합니다.
- 첨부 파일 맵은 폼에서 받은 동일 인스턴스를 사용하고 Context 안에서 새로 만들지 않습니다.

## Acceptance Criteria

### workspace-context-contract — 관찰 가능한 동작

- 같은 키의 폼 context 값이 외부 설정의 값을 우선합니다.
- context 병합으로 원래 딕셔너리를 수정하거나 노드 값·오류를 여기에 저장하지 않습니다.

## Last Updated

2026-09-16
