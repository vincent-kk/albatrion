# providers

## Requirements

폼 설정을 역할별 Context로 전달하고 Provider 간 의존 순서를 유지합니다.

## API Contracts

- 폼 수준 설정은 선택적 외부 설정보다 우선합니다.
- 노드 생성·입력 제어·렌더링·가상화의 각 소비자는 해당 Context 계약으로 값을 얻습니다.

## Acceptance Criteria

### providers-contract — 관찰 가능한 동작

- 여러 폼의 설정과 워크스페이스 데이터가 Provider 경계를 넘어 섞이지 않습니다.
- Provider 정리 시 각 계층이 만든 구독과 가상화 자원을 해제합니다.

## Last Updated

2026-09-16
