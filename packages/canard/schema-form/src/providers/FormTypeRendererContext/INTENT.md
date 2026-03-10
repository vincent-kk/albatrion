# FormTypeRendererContext

## Purpose
폼 필드의 렌더러 컴포넌트(`FormTypeRenderer`)와 에러 표시 정책(`checkShowError`, `formatError`)을 Context로 공급한다. `ExternalFormContext` 값과 Form-level props를 병합하여 최종 렌더링 동작을 결정한다.

## Structure
```
FormTypeRendererContext/
  FormTypeRendererContext.ts      — Context 객체 및 FormTypeRendererContext 인터페이스
  FormTypeRendererProvider.tsx    — Provider (showError, formatError, CustomFormTypeRenderer 수신)
  useFormTypeRendererContext.ts   — 소비 훅 (PluginManager fallback 포함)
  index.ts                        — Provider, 훅 re-export
```

## Conventions
- TypeScript + React
- `checkShowError(condition?)` 함수: `NodeState.ShowError` → `ShowError.Always/Never/Dirty/Touched/DirtyTouched` 비트마스크 평가
- 기본 showError: `ShowError.DirtyTouched` (dirty AND touched 모두 충족 시 표시)
- Form-level `CustomFormTypeRenderer`/`formatError` > `ExternalFormContext` 값 우선
- `useFormTypeRendererContext`에서 `PluginManager.FormGroup` / `PluginManager.formatError`를 최종 fallback으로 사용

## Boundaries

### Always do
- `checkShowError`에서 `NodeState.ShowError` 명시적 플래그를 우선 평가 (override 지원)
- `CustomFormTypeRenderer`와 `formatError`를 `useConstant`로 고정 (마운트 이후 변경 차단)
- `useFormTypeRendererContext`에서 PluginManager fallback 유지

### Ask first
- `ShowError` 열거형에 새 모드 추가 시
- 에러 표시 우선순위 로직 변경 시

### Never do
- `FormTypeRenderer`를 Context에서 직접 렌더링 (SchemaNodeProxy가 담당)
- `checkShowError` 함수를 Context 외부에서 재구현
- PluginManager fallback을 제거하여 렌더러가 `undefined`가 되도록 방치

## Dependencies
- `@/schema-form/core` — `NodeState`
- `@/schema-form/types` — `ShowError`, `FormTypeRendererProps`
- `@/schema-form/app/plugin` — `PluginManager` (useFormTypeRendererContext fallback)
- `../ExternalFormContext` — `useExternalFormContext`
- `@winglet/react-utils/hook` — `useConstant`
- `@winglet/common-utils/filter` — `isFunction`
- `@winglet/react-utils/filter` — `isReactComponent`
