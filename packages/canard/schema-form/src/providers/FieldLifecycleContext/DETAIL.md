# FieldLifecycleContext

## Requirements

폼마다 안정된 레지스트리 참조를 공급하며 전달을 위해 컴포넌트 호출을 추가하지 않습니다.

## API Contracts

- FormRoot가 레지스트리와 던지지 않는 오류 보고기를 소유하고 Context.Provider를 직접 조립합니다. 레지스트리 변경을 React 상태로 만들지 않으므로 예약만으로 렌더가 발생하지 않습니다.
- 훅은 레지스트리 또는 null을 전달합니다. 제공자가 없다는 이유로 입력을 렌더할 수 없게 만들지 않습니다.

## Acceptance Criteria

### lifecycle-context — 폼별 격리와 호출 비용

다른 폼의 예약은 전달되지 않으며 Context 요소 때문에 Form의 컴포넌트 호출 수가 늘지 않습니다.

## Last Updated

값의 소유권, null 의미 또는 Provider 비용이 바뀔 때 갱신합니다.
