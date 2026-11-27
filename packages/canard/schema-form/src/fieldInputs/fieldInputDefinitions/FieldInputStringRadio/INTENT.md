# FieldInputStringRadio — 문자열 radio 입력

## Purpose

enum을 가진 문자열 노드에 radio 묶음을 그린다.

## Conventions

- 진입점 `index.ts`가 정의 `FieldInputStringRadioDefinition`(`{ Component, test }`)을 이곳에서 만들고 이름으로 내보낸다. 부모 `fieldInputs`의 정의 배열이 이 진입점을 가리킨다.
- 매칭 조건은 함수이며, `type === 'string'`이고 `inputType`이 `radio` 또는 `radiogroup`이며 enum이 비어 있지 않을 때 참이다.

## Boundaries

### Always do

- 입력은 공통 `FieldInputProps`로 값과 변경을 주고받는다.

### Ask first

- 매칭 조건을 바꿀 때(정의 배열의 다른 입력과 겹치거나 빠질 수 있음)

### Never do

- `test`에서 부수 효과를 만들거나 UI 라이브러리를 가져오지 않는다.
