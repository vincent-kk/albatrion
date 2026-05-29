# InputControlContext

## Purpose

폼 전체의 `readOnly`와 `disabled` 상태를 Context로 공급하는 단순 제어 레이어. `SchemaNodeInput`이 이 값과 개별 노드 속성을 OR 결합하여 최종 입력 제어 상태를 결정한다.

## Structure

| 파일                              | 역할                                                                        |
| --------------------------------- | --------------------------------------------------------------------------- |
| `InputControlContext.ts`          | `InputControlContext` 인터페이스 정의 및 `createContext` 생성 (`{}` 기본값) |
| `InputControlContextProvider.tsx` | `readOnly`, `disabled` prop 수신; `useMemo`로 안정화된 Context 값 공급      |
| `useInputControlContext.ts`       | `useContext(InputControlContext)` 단일 라인 소비 훅                         |
| `index.ts`                        | `InputControlContextProvider`, `useInputControlContext` re-export           |

## Conventions

- `InputControlContextProvider`는 `useMemo(() => ({ readOnly, disabled }), [readOnly, disabled])`로 객체 참조를 안정화한다 — props가 바뀌지 않으면 하위 트리 리렌더 없음
- 최종 제어값은 소비처 `SchemaNodeInput`에서 `readOnly={rootReadOnly || node.readOnly}`, `disabled={rootDisabled || node.disabled}` 형태로 OR 결합한다 — Context 자체는 결합 로직을 포함하지 않는다
- Context 기본값은 `{} as InputControlContext`이므로 `readOnly`·`disabled` 모두 `undefined`(falsy) — Provider 없이 소비해도 항상 안전하다

## Boundaries

### Always do

- `readOnly`와 `disabled` 두 prop을 `useMemo`로 묶어 Context 값으로 제공
- OR 결합(`rootReadOnly || node.readOnly`)은 반드시 소비 측(`SchemaNodeInput`)에서 수행

### Ask first

- `readOnly`/`disabled` 외 새로운 전역 입력 제어 속성 추가 시 (Context 계약 변경)
- 기본값(`{} as InputControlContext`) 변경 시

### Never do

- 이 Context에서 노드별 `readOnly`/`disabled` 계산 로직 수행
- `SchemaNodeInput` 외 컴포넌트에서 Context 값을 직접 변형하여 전달

## Dependencies

- `react` — `createContext`, `useMemo`, `useContext`, `PropsWithChildren`
