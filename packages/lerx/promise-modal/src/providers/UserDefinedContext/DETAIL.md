# UserDefinedContext

## Requirements

부트스트랩에서 받은 사용자 컴포넌트와 데이터를 모달 소비자에게 제공합니다.

## API Contracts

- 사용자 정의 값은 공통 Context와 훅을 통해 읽으며 타입 계약을 유지합니다.
- 사용자 UI 선택과 데이터 전달을 담당하고 내부 모달 완료 정책은 이 Context가 결정하지 않습니다.

## Acceptance Criteria

### user-defined-context-contract — 관찰 가능한 동작

- 여러 표시 컴포넌트는 같은 Provider가 공급한 사용자 정의 값을 읽습니다.
- 사용자 정의 UI가 바뀌어도 모달 타입별 확인·취소 결과 계약은 유지됩니다.

## Last Updated

2026-09-16
