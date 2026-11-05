# FieldRendererContext

## Purpose

폼 필드의 렌더러 컴포넌트(`FieldRenderer`)와 에러 표시 정책(`checkErrorVisibility`, `formatError`)을 Context로 공급한다. `ExternalFormContext` 값과 Form 수준 props를 병합해서 최종 렌더링 동작을 정한다.

## Conventions

- Resolve the rendered policy and compute renderer, input and child-error visibility from engine history; subscribe candidates to release versions without React visibility storage.

- TypeScript와 React로 작성한다.
- `checkErrorVisibility(condition?)`는 `FieldNodeState.ErrorVisibility` 재정의를 먼저 적용하고 문자열 정책을 평가합니다.
- 기본 errorVisibility는 `ErrorVisibility.AfterEditAndTouch`다(edited와 touched를 모두 만족할 때 표시한다).
- Form 수준의 `CustomFieldRenderer`와 `formatError`가 `ExternalFormContext` 값보다 우선한다.
- `useFieldRendererContext`는 `PluginManager.FieldRenderer`와 `PluginManager.formatError`를 마지막 fallback으로 쓴다.

## Boundaries

### Always do

- `checkErrorVisibility`에서는 `FieldNodeState.ErrorVisibility`이라는 명시적 플래그를 먼저 평가한다(override를 지원하기 위해서다).
- `CustomFieldRenderer`와 `formatError`는 `useConstant`로 고정해서 마운트 이후의 변경을 막는다.
- `useFieldRendererContext`의 PluginManager fallback을 유지한다.

### Ask first

- `ErrorVisibility` 열거형에 새 모드를 추가하는 경우
- 에러 표시 우선순위 로직을 바꾸는 경우

### Never do

- Context에서 `FieldRenderer`를 직접 렌더링하는 것(FieldProxy가 맡는다)
- `checkErrorVisibility` 함수를 Context 밖에서 다시 구현하는 것
- PluginManager fallback을 없애서 렌더러가 `undefined`가 되게 두는 것
