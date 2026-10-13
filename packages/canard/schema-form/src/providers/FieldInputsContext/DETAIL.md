# FormTypeInputsContext

## Requirements

단일 폼의 입력 맵과 정의를 정규화된 형태로 공급합니다.

## API Contracts

- 맵과 정의는 마운트 시 고정하고 각 정규화 함수를 거쳐 저장합니다.
- Context는 입력 선택을 직접 수행하지 않고 선택 훅에 정규화 결과를 제공합니다.

## Acceptance Criteria

### form-type-inputs-context-contract — 관찰 가능한 동작

- 원본 정의를 정규화 없이 소비자에게 노출하지 않습니다.
- Provider가 유지되는 동안 입력 맵이나 정의 prop 교체로 초기 선택 규칙이 달라지지 않습니다.

## Last Updated

2026-09-16
