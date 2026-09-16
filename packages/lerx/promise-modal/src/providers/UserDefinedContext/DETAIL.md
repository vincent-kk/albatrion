# UserDefinedContext

## Requirements

부트스트랩에서 받은 사용자 정의 context 데이터를 모달 표시 컴포넌트에 제공합니다.

## API Contracts

- context 값은 공통 Context와 useUserDefinedContext 훅을 통해 읽으며, 입력이 없으면 빈 객체를 제공합니다.
- 사용자 UI 컴포넌트 선택은 ConfigurationContext가 담당합니다. 이 Context는 데이터 전달만 소유하고 내부 모달 완료 정책을 결정하지 않습니다.

## Acceptance Criteria

### user-defined-context-contract — 관찰 가능한 동작

- 여러 표시 컴포넌트는 같은 Provider가 공급한 사용자 정의 값을 읽습니다.
- 컴포넌트 선택과 context 데이터 전달은 서로 다른 Provider 경계를 유지합니다.

## Last Updated

2026-09-16 — 사용자 데이터 전달과 UI 컴포넌트 선택의 Provider 책임을 분리.
