# FormTypeInputsContext

## Purpose
단일 `<Form>` 인스턴스에 등록된 `FormTypeInput` 정의 목록(`formTypeInputDefinitions`)과 경로 매핑(`formTypeInputMap`)을 정규화하여 Context로 공급한다. `useFormTypeInput` 훅이 이 값을 기반으로 노드에 적합한 입력 컴포넌트를 선택한다.

## Structure
```
FormTypeInputsContext/
  FormTypeInputsContext.ts          — Context 객체 및 FormTypeInputsContext 인터페이스
  FormTypeInputsContextProvider.tsx — Provider (formTypeInputDefinitions, formTypeInputMap 수신)
  useFormTypeInputsContext.ts       — 소비 훅
  index.ts                          — Provider, 훅 re-export
```

## Conventions
- TypeScript + React, Context 초기값 `{} as FormTypeInputsContext`
- `formTypeInputDefinitions`와 `formTypeInputMap`은 `useConstant`로 마운트 시 고정
- 정규화: `normalizeFormTypeInputDefinitions()` / `normalizeFormTypeInputMap()` 사용
- Context 값: `{ fromFormTypeInputDefinitions, fromFormTypeInputMap }` — 두 배열 모두 `NormalizedFormTypeInputDefinition[]`
- 선택 우선순위 (높음→낮음): `formTypeInputMap` → `formTypeInputDefinitions` → `ExternalFormContext` → `PluginManager`

## Boundaries

### Always do
- `formTypeInputDefinitions`와 `formTypeInputMap`을 `useConstant`로 고정 (Provider 마운트 이후 변경 불가)
- `normalizeFormTypeInputDefinitions` / `normalizeFormTypeInputMap`으로 반드시 정규화 후 공급

### Ask first
- 런타임 동적 FormTypeInput 등록 기능 추가 시 (현재 설계는 정적 고정)
- `formTypeInputMap`의 와일드카드(`*`) 매칭 로직 변경 시

### Never do
- 이 Context에서 직접 FormTypeInput 선택 로직 실행 (`useFormTypeInput` 훅의 책임)
- `formTypeInputDefinitions` 배열을 정규화 없이 Context에 직접 노출

## Dependencies
- `@/schema-form/helpers/formTypeInputDefinition` — `normalizeFormTypeInputDefinitions`, `normalizeFormTypeInputMap`
- `@/schema-form/components/Form` — `FormProps` (타입 참조)
- `@winglet/react-utils/hook` — `useConstant`
