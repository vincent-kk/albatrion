# FieldInputsContext

## Purpose

단일 `<Form>` 인스턴스에 등록된 `FieldInput` 정의 목록(`fieldInputDefinitions`)과 경로 매핑(`fieldInputMap`)을 정규화해서 Context로 공급한다. `useFieldInput` 훅은 이 값을 바탕으로 노드에 맞는 입력 컴포넌트를 고른다.

## Structure

```
FieldInputsContext/
  FieldInputsContext.ts          — Context 객체 및 FieldInputsContext 인터페이스
  FieldInputsContextProvider.tsx — Provider (fieldInputDefinitions, fieldInputMap 수신)
  useFieldInputsContext.ts       — 소비 훅
  index.ts                          — Provider, 훅 re-export
```

## Conventions

- TypeScript와 React로 작성하며, Context 초기값은 `{} as FieldInputsContext`다.
- `fieldInputDefinitions`와 `fieldInputMap`은 `useConstant`로 마운트 시점에 고정한다.
- 정규화에는 `normalizeFieldInputDefinitions()`와 `normalizeFieldInputMap()`을 쓴다.
- Context 값은 `{ fromFieldInputDefinitions, fromFieldInputMap }`이며, 두 배열 모두 `NormalizedFieldInputDefinition[]`다.
- 선택 우선순위는 높은 쪽부터 `fieldInputMap`, `fieldInputDefinitions`, `ExternalFormContext`, `PluginManager` 순서다.

## Boundaries

### Always do

- `fieldInputDefinitions`와 `fieldInputMap`을 `useConstant`로 고정한다(Provider가 마운트된 뒤에는 바꿀 수 없다).
- 반드시 `normalizeFieldInputDefinitions`와 `normalizeFieldInputMap`으로 정규화한 뒤에 공급한다.

### Ask first

- 런타임에 FieldInput을 동적으로 등록하는 기능을 추가하는 경우(현재 설계는 정적 고정이다)
- `fieldInputMap`의 와일드카드(`*`) 매칭 로직을 바꾸는 경우

### Never do

- 이 Context에서 FieldInput 선택 로직을 직접 실행하는 것(`useFieldInput` 훅의 책임이다)
- `fieldInputDefinitions` 배열을 정규화하지 않고 Context에 그대로 노출하는 것
