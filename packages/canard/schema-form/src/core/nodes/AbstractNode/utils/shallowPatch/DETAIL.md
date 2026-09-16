# shallowPatch

## Requirements

얕은 상태 패치의 변경 유무를 구분하여 불필요한 상태 이벤트를 줄입니다.

## API Contracts

- 변경이 없으면 undefined, 변경이 있으면 새 결과 객체를 반환합니다. patch가 undefined이면 비어 있지 않은 상태를 빈 객체로 초기화합니다.
- 기본 모드는 undefined 속성을 삭제하며, additive 모드는 truthy 값만 반영합니다. null이나 비객체 patch는 무시합니다.

## Acceptance Criteria

### shallow-patch-contract — 관찰 가능한 동작

- 동일한 패치는 변경 결과를 생성하지 않습니다.
- additive 모드에서 falsy 입력으로 기존 truthy 상태를 해제하지 않습니다.

## Last Updated

2026-09-16
