# FieldInputsContext

## Purpose

단일 `<Form>` 인스턴스에 등록된 `FieldInput` 정의 목록(`fieldInputDefinitions`)과 경로 매핑(`fieldInputMap`)을 정규화하여 Context로 공급한다. `useFieldInput` 훅이 이 값을 기반으로 노드에 적합한 입력 컴포넌트를 선택한다.

## Structure

```
FieldInputsContext/
  FieldInputsContext.ts          — Context 객체 및 FieldInputsContext 인터페이스
  FieldInputsContextProvider.tsx — Provider (fieldInputDefinitions, fieldInputMap 수신)
  useFieldInputsContext.ts       — 소비 훅
  index.ts                          — Provider, 훅 re-export
```

## Conventions

- TypeScript + React, Context 초기값 `{} as FieldInputsContext`
- `fieldInputDefinitions`와 `fieldInputMap`은 `useConstant`로 마운트 시 고정
- 정규화: `normalizeFieldInputDefinitions()` / `normalizeFieldInputMap()` 사용
- Context 값: `{ fromFieldInputDefinitions, fromFieldInputMap }` — 두 배열 모두 `NormalizedFieldInputDefinition[]`
- 선택 우선순위 (높음→낮음): `fieldInputMap` → `fieldInputDefinitions` → `ExternalFormContext` → `PluginManager`

## Boundaries

### Always do

- `fieldInputDefinitions`와 `fieldInputMap`을 `useConstant`로 고정 (Provider 마운트 이후 변경 불가)
- `normalizeFieldInputDefinitions` / `normalizeFieldInputMap`으로 반드시 정규화 후 공급

### Ask first

- 런타임 동적 FieldInput 등록 기능 추가 시 (현재 설계는 정적 고정)
- `fieldInputMap`의 와일드카드(`*`) 매칭 로직 변경 시

### Never do

- 이 Context에서 직접 FieldInput 선택 로직 실행 (`useFieldInput` 훅의 책임)
- `fieldInputDefinitions` 배열을 정규화 없이 Context에 직접 노출
