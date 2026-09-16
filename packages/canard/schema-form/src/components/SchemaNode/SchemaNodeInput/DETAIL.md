# SchemaNodeInput

## Requirements

선택된 입력 컴포넌트를 노드의 값·상태·명령 체계에 연결합니다.

## API Contracts

- 입력 선택은 인라인 지정, 입력 맵, 내부 정의, 외부 정의, 플러그인 fallback의 우선순위를 유지합니다.
- 사용자 변경은 노드의 읽기 전용·disabled 상태를 먼저 확인하고, 값을 전달한 뒤 외부 오류를 지우고 Dirty 상태를 설정합니다.
- 재귀 NodeProxy의 props는 형제 SchemaNodeProxyProps 계약을 통해 공유하며, 입력 계층은 SchemaNodeProxy 구현에 의존하지 않습니다.

## Acceptance Criteria

### schema-node-input-contract — 관찰 가능한 동작

- 언마운트하면 해당 경로의 첨부 파일 상태를 제거합니다.
- refresh는 입력 버전을 갱신하고 focus/select는 해당 입력의 DOM 명령으로 연결됩니다.

## Last Updated

2026-09-16 — 변경 처리 순서와 재귀 Proxy 타입 의존 방향을 현재 계약에 맞춤.
