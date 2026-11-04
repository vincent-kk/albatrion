# FieldInputSlot

## Purpose

`FieldProxy` 본체 안에서 입력을 처리하는 부품. 선택된 `FieldInput` 컴포넌트를 마운트하고, 사용자 이벤트(change·focus·blur·fileAttach)를 FieldNode 이벤트 시스템의 이벤트로 바꾸며, 포커스·선택·리프레시 명령을 처리한다.

## Conventions

- TypeScript와 React(TSX)로 작성한 내부 전용 모듈로, `FieldProxy`에서만 사용한다. `FieldInputSlotWrapper`는 React 컴포넌트가 아니라 팩토리 함수이며 클로저로 node를 붙잡는다.
- `HANDLE_CHANGE_OPTION`은 `Replace | Propagate | EmitChange | PublishUpdateEvent`이며 사용자 입력의 기본값이다.
- FieldInput 선택 우선순위: InlineFieldInput → FieldInputMap → FieldInputDefinitions → ExternalFieldInputDefinitions → PluginManager fallback
- `useFieldInputControl`은 `RequestRefresh`에서 version을 올리고(key가 바뀐다), `RequestFocus`에서 DOM focus를, `RequestSelect`에서 DOM select를 실행한다.

## Boundaries

### Always do

- Accepted input changes clear external errors and set `FieldNodeState.Edited` in the input write batch.
- 언마운트할 때 `attachedFilesMap`에서 해당 경로의 항목 삭제
- Block `onChange` when Form `readOnly`/`disabled` props or `node.isReadOnly`/`node.isDisabled` require it.

### Ask first

- `HANDLE_CHANGE_OPTION` 비트마스크를 바꿀 때
- `REACTIVE_RERENDERING_EVENTS` 마스크를 바꿀 때 (리렌더 범위에 영향)
- FieldInput 선택 우선순위를 바꿀 때

### Never do

- `FieldProxy` 바깥에서 이 모듈을 직접 import
- `FieldInputSlotWrapper`를 React 컴포넌트처럼 JSX에서 직접 사용
- `onChangeRef`를 거치지 않고 `node.setValue()`를 직접 호출 (onChangeRef 확인 필수)
