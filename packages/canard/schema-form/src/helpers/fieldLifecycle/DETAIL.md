# fieldLifecycle

## Requirements

노드와 시점별 일회성 예약을 입력 위치 수명과 분리합니다. 실행 순서는 [레지스트리](./FieldLifecycleRegistry/DETAIL.md), React 시점과 DOM 행동은 [입력 브리지](../../components/FieldProxy/components/FieldInputBridge/DETAIL.md)가 소유합니다.

## API Contracts

- Mount·Unmount·Render는 독립된 비트이며 사건에는 시점과 노드만 있습니다. DOM이나 상태 설정 함수를 노출하면 처리기의 쓰기가 렌더를 반복시킬 수 있습니다.
- 행동은 None·Focus·Select의 닫힌 비트 집합입니다. 입력 위치가 합친 행동을 실행하며 Unmount에서는 실행하지 않습니다.
- 제품 소비자는 Mount 포커스 예약입니다. Unmount는 실행 가능한 행동이 없고 Render는 내부 기반만 제공합니다.
- 외부 공개에는 처리기 실행 중 모든 폼 쓰기의 거부, 공개 예약 API와 Unmount 행동에 대한 별도 결정이 필요합니다. 현재 순수성은 라이브러리가 소유한 처리기로 보장합니다.

## Acceptance Criteria

### lifecycle-boundary — 엔진과 렌더 수명을 분리합니다

예약은 노드를 바꾸거나 렌더를 예약하지 않고 행동 값만 돌려줍니다. React·DOM 의존은 소비 위치에 머뭅니다.

## Last Updated

예약 공개 범위, 행동 집합 또는 실행 책임이 바뀔 때 갱신합니다.
