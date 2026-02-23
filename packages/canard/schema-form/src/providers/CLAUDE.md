# providers

## Purpose
`@canard/schema-form` 전체에서 사용되는 React Context Provider 및 훅의 집합. 폼 설정·입력 타입 매핑·렌더러·입력 제어·루트 노드·워크스페이스를 각 Context로 분리하여 prop drilling을 제거한다.

## Structure
```
providers/
  index.ts                      — 6개 Context 모듈 통합 re-export
  ExternalFormContext/          — 애플리케이션 수준 폼 전역 설정
  FormTypeInputsContext/        — FormTypeInput 정의 및 경로 매핑 등록
  FormTypeRendererContext/      — FormTypeRenderer 및 에러 표시 정책
  InputControlContext/          — readOnly / disabled 전역 제어
  RootNodeContext/              — 루트 SchemaNode 생성 및 공급
  WorkspaceContext/             — attachedFilesMap 및 사용자 정의 context 딕셔너리
```

## Conventions
- 각 Context 모듈은 `Context.ts`, `ContextProvider.tsx`, `useContext.ts`, `index.ts` 4파일 구조
- 훅 네이밍: `use<ContextName>Context()` 패턴
- Provider 중첩 순서 (Form.tsx 기준): `Workspace → FormTypeInputs → FormTypeRenderer → InputControl → RootNode`
- `ExternalFormContext`는 애플리케이션 최상단에서 선택적으로 감싸는 외부 설정 레이어
- `useConstant`로 함수/컴포넌트 레퍼런스를 고정하여 불필요한 리렌더 방지

## Boundaries

### Always do
- 각 Context 훅은 해당 Context 파일에서만 `useContext` 호출
- Provider 중첩 순서를 `Form.tsx`에 정의된 순서대로 유지
- `ExternalFormContext` 값과 Form-level prop을 병합할 때 Form-level을 우선 적용

### Ask first
- 새 Context 추가 또는 기존 Context 분리/통합 시
- Provider 중첩 순서 변경 시 (하위 컨텍스트 의존성 영향)
- `ExternalFormContext` 인터페이스에 새 필드 추가 시

### Never do
- 이 디렉토리에 비-Context 비즈니스 로직 추가
- Context 값을 Provider 외부에서 직접 변경
- 개별 Context 모듈 간 직접 import (index.ts를 통해서만 접근)

## Dependencies
- `@/schema-form/core` — `SchemaNode`, `ValidationMode`, `NodeEventType`, `nodeFromJsonSchema`, `contextNodeFactory`
- `@/schema-form/types` — `ShowError`, `FormatError`, `AttachedFilesMap`, `ValidatorFactory`
- `@/schema-form/helpers` — `normalizeFormTypeInputDefinitions`, `normalizeFormTypeInputMap`, `transformErrors`
- `@/schema-form/app/plugin` — `PluginManager` (FormTypeRendererContext fallback)
- `@winglet/react-utils/hook` — `useConstant`, `useSnapshot`, `useMemorize`
