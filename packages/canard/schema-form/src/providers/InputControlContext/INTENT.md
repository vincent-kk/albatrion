# InputControlContext

## Purpose
폼 전체의 `readOnly`와 `disabled` 상태를 Context로 공급하는 단순 제어 레이어. `SchemaNodeInput`이 이 값과 개별 노드 속성을 OR 결합하여 최종 입력 제어 상태를 결정한다.

## Structure
```
InputControlContext/
  InputControlContext.ts          — Context 객체 및 InputControlContext 인터페이스
  InputControlContextProvider.tsx — Provider (readOnly, disabled prop 수신)
  useInputControlContext.ts       — 소비 훅
  index.ts                        — Provider, 훅 re-export
```

## Conventions
- TypeScript + React, 가장 단순한 Context 모듈
- Context 인터페이스: `{ readOnly?: boolean; disabled?: boolean }`
- `useMemo`로 `{ readOnly, disabled }` 객체 안정화
- `SchemaNodeInput`에서 사용: `readOnly={rootReadOnly || node.readOnly}`, `disabled={rootDisabled || node.disabled}`

## Boundaries

### Always do
- `readOnly`와 `disabled` prop을 `useMemo`로 안정화하여 Context 값 제공
- 노드 개별 속성과 OR 결합은 소비 측(`SchemaNodeInput`)에서 처리

### Ask first
- `readOnly`/`disabled` 외 새로운 전역 입력 제어 속성 추가 시

### Never do
- 이 Context에서 노드별 readOnly/disabled 계산 로직 수행
- `SchemaNodeInput` 외부의 컴포넌트에서 이 Context 값을 변형하여 사용

## Dependencies
- React (`createContext`, `useMemo`, `useContext`)
