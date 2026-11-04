# InputControlContext

## Requirements

폼 전체의 readOnly와 disabled를 전달하며 노드별 값과의 결합은 소비자에게 맡깁니다.

## API Contracts

- 두 제어값이 같으면 memoized Context 객체를 유지합니다.
- Provider 없는 기본값은 제어를 강제하지 않으며 입력 소비자는 전체 값과 노드별 값을 OR로 결합합니다.

- Context 객체와 Provider는 `components/`, 소비 훅은 `hooks/`에 있습니다. 뿌리에는 문서·진입점·형 동반 파일(`type.ts`)만 둡니다(filid zero-peer-file).

## Acceptance Criteria

### input-control-context-contract — 관찰 가능한 동작

- 전체 폼이 disabled이면 개별 노드의 false 값으로 이를 해제하지 않습니다.
- Context 내부에서 특정 노드의 상태를 변경하거나 계산하지 않습니다.

## Last Updated

2026-09-16
