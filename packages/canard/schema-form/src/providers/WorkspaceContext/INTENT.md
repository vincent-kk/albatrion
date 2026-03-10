# WorkspaceContext

## Purpose
단일 `<Form>` 인스턴스의 워크스페이스 데이터를 공급하는 Context. 파일 첨부 맵(`attachedFilesMap`)과 사용자 정의 context 딕셔너리를 보유하며, Form-level context와 `ExternalFormContext.context`를 병합하여 제공한다.

## Structure
```
WorkspaceContext/
  WorkspaceContext.ts          — Context 객체 및 WorkspaceContext 인터페이스
  WorkspaceContextProvider.tsx — Provider (attachedFilesMap, context prop 수신)
  useWorkspaceContext.ts       — 소비 훅
  index.ts                     — Provider, 훅 re-export
```

## Conventions
- TypeScript + React
- Context 인터페이스: `{ attachedFilesMap: AttachedFilesMap; context: Dictionary }`
- `context` 병합 우선순위: `ExternalFormContext.context` (base) → Form-level `context` (override)
- `context` prop은 `useSnapshot`으로 안정화 (참조 변경 없이 내용 비교)
- `attachedFilesMap`은 `Form.tsx`의 `useRef`로 생성된 Map 인스턴스 (form 생명주기 동안 동일 참조 유지)

## Boundaries

### Always do
- `context`를 `useSnapshot`으로 안정화하여 불필요한 리렌더 방지
- `ExternalFormContext.context`와 Form-level `context`를 spread 병합 시 Form-level이 우선

### Ask first
- `AttachedFilesMap` 타입 또는 파일 첨부 저장 방식 변경 시
- `context` 병합 전략 변경 시 (현재: external → form-level override)

### Never do
- `attachedFilesMap`을 Context 내부에서 생성 (Form.tsx의 ref에서 전달받아야 함)
- `context` 딕셔너리를 직접 변이(mutate) — 항상 새 객체로 교체
- `WorkspaceContext`에 폼 상태(노드 값, 에러 등) 저장

## Dependencies
- `@/schema-form/types` — `AttachedFilesMap`
- `@/schema-form/components/Form` — `FormProps` (타입 참조)
- `../ExternalFormContext` — `useExternalFormContext` (context 병합)
- `@aileron/declare` — `Dictionary`
- `@winglet/react-utils/hook` — `useSnapshot`
