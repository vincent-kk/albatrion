# SchemaNodeInput

## Purpose

`SchemaNode`의 내부 입력 처리 레이어. 선택된 `FormTypeInput` 컴포넌트를 마운트하고, 사용자 이벤트(change·focus·blur·fileAttach)를 SchemaNode 이벤트 시스템으로 변환하며, 포커스/선택/리프레시 명령을 처리한다.

## Conventions

- TypeScript + React (TSX), 내부 전용 모듈(`SchemaNodeProxy`에서만 사용); `SchemaNodeInputWrapper`는 React 컴포넌트가 아닌 팩토리 함수(클로저로 node 캡처)
- `HANDLE_CHANGE_OPTION` = `Replace | Propagate | EmitChange | PublishUpdateEvent` (사용자 입력 기본값)
- FormTypeInput 선택 우선순위: InlineFormTypeInput → FormTypeInputMap → FormTypeInputDefinitions → ExternalFormTypeInputDefinitions → PluginManager fallback
- `useFormTypeInputControl`: `RequestRefresh` → version 증가(key 변경), `RequestFocus` → DOM focus, `RequestSelect` → DOM select

## Boundaries

### Always do

- `onChange` 핸들러에서 `node.clearExternalErrors()` 호출 후 `NodeState.Dirty` 플래그 설정
- 언마운트 시 `attachedFilesMap`에서 해당 경로 항목 삭제
- `readOnly` 또는 `disabled` 상태에서 `onChange` 차단

### Ask first

- `HANDLE_CHANGE_OPTION` 비트마스크 변경 시
- `REACTIVE_RERENDERING_EVENTS` 마스크 변경 시 (리렌더 범위 영향)
- FormTypeInput 선택 우선순위 변경 시

### Never do

- `SchemaNodeProxy` 외부에서 이 모듈을 직접 import
- `SchemaNodeInputWrapper`를 React 컴포넌트처럼 JSX에서 직접 사용
- `node.setValue()`를 `onChangeRef` 우회 없이 직접 호출 (onChangeRef 체크 필수)
