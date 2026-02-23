# ExternalFormContext

## Purpose
애플리케이션 수준에서 여러 `<Form>` 인스턴스에 공통 설정을 제공하는 외부 Context. 커스텀 렌더러·입력 정의·에러 표시 정책·검증 모드를 prop drilling 없이 폼 트리 전체에 주입한다.

## Structure
```
ExternalFormContext/
  ExternalFormContext.ts          — Context 객체 및 ExternalFormContext 인터페이스 정의
  ExternalFormContextProvider.tsx — 공개 Provider 컴포넌트 (ExternalFormContextProviderProps)
  useExternalFormContext.ts       — 내부 소비 훅
  index.ts                        — Provider, 훅, Props 타입 re-export
```

## Conventions
- TypeScript + React, Context 초기값은 `{} as ExternalFormContext` (빈 객체)
- `formTypeInputDefinitions`는 Provider 마운트 시 `useConstant`로 고정 → 런타임 교체 불가
- `context` prop은 `useSnapshot`으로 안정화하여 불필요한 리렌더 방지
- Form-level props가 이 Context 값보다 항상 우선 (`FormTypeRendererContextProvider`에서 병합)

## Boundaries

### Always do
- `formTypeInputDefinitions`를 `useConstant`로 고정하여 마운트 이후 변경 차단
- `useExternalFormContext`는 `providers/` 내부에서만 사용 (`FormTypeRendererContext`, `RootNodeContext`, `WorkspaceContext`가 소비)

### Ask first
- `ExternalFormContext` 인터페이스에 새 필드 추가 시 (Form-level 병합 로직 동시 수정 필요)
- `validatorFactory`를 런타임에 교체해야 하는 요구사항 발생 시

### Never do
- 이 Context에서 SchemaNode를 직접 생성하거나 조작
- 애플리케이션 코드에서 `useExternalFormContext`를 직접 import (`providers/index.ts` 통해 접근)
- `ExternalFormContext` 초기값에 기본 렌더러를 하드코딩

## Dependencies
- `@/schema-form/core` — `ValidationMode`
- `@/schema-form/types` — `FormTypeInputDefinition`, `FormTypeRendererProps`, `FormatError`, `ShowError`, `ValidatorFactory`
- `@/schema-form/helpers/formTypeInputDefinition` — `normalizeFormTypeInputDefinitions`
- `@winglet/react-utils/hook` — `useConstant`, `useSnapshot`
