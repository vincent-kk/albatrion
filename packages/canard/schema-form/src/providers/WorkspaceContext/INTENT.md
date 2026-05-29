# WorkspaceContext

## Purpose

단일 `<Form>` 인스턴스의 워크스페이스 데이터를 공급하는 Context. 파일 첨부 맵(`attachedFilesMap`)과 사용자 정의 context 딕셔너리를 보유하며, Form-level context와 `ExternalFormContext.context`를 병합하여 제공한다.

## Structure

| 파일                           | 역할                                                                                                 |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `WorkspaceContext.ts`          | `WorkspaceContext` 인터페이스(`attachedFilesMap`, `context`) 정의 및 `createContext` 생성            |
| `WorkspaceContextProvider.tsx` | `attachedFilesMap`·`context` prop 수신; `useSnapshot`으로 안정화 후 `external.context`와 spread 병합 |
| `useWorkspaceContext.ts`       | `useContext(WorkspaceContext)` 단일 라인 소비 훅                                                     |
| `index.ts`                     | `WorkspaceContextProvider`, `useWorkspaceContext` re-export                                          |

## Conventions

- `inputContext`는 `useSnapshot(inputContext)`로 내용 기반 안정화 — 참조가 바뀌어도 값이 같으면 리렌더 방지
- `context` 병합 우선순위: `{ ...external.context, ...context }` (Form-level이 ExternalFormContext를 override)
- `attachedFilesMap`은 `Form.tsx`의 `useRef`로 생성된 Map 인스턴스를 받아야 한다 — form 생명주기 동안 동일 참조 유지가 보장되어야 함

## Boundaries

### Always do

- `context`를 `useSnapshot`으로 안정화하여 불필요한 리렌더 방지
- `ExternalFormContext.context`(base)에 Form-level `context`(override)를 spread 병합

### Ask first

- `AttachedFilesMap` 타입 또는 파일 첨부 저장 방식 변경 시
- `context` 병합 전략 변경 시 (현재: `external → form-level override`)

### Never do

- `attachedFilesMap`을 Context 내부에서 생성 — 반드시 `Form.tsx`의 ref에서 전달받아야 함
- `context` 딕셔너리를 직접 변이(mutate) — 항상 새 객체로 교체
- 폼 노드 상태(노드 값, 에러 등)를 이 Context에 저장

## Dependencies

- **내부** — `@/schema-form/types` (`AttachedFilesMap`); `@/schema-form/components/Form` (`FormProps` 타입 참조); `../ExternalFormContext` (`useExternalFormContext`)
- **외부** — `@aileron/declare` (`Dictionary`); `@winglet/react-utils/hook` (`useSnapshot`); `react` (`createContext`, `useMemo`, `useContext`, `PropsWithChildren`)
