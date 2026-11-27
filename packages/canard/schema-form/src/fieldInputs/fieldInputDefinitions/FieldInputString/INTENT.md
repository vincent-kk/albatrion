# FieldInputString — 문자열 입력

## Purpose

`type: 'string'` 노드의 기본 입력으로, 글 입력을 그립니다. 기본 union 입력도 이 컴포넌트를 씁니다.

## Conventions

- 진입점 `index.ts`가 정의 `FieldInputStringDefinition`(`{ Component, test }`)을 이곳에서 만들고 이름으로 내보냅니다. 부모 `fieldInputs`의 정의 배열이 이 진입점을 가리킵니다.
- 매칭 조건은 `{ type: 'string' }`입니다.

## Boundaries

### Always do

- 입력은 공통 `FieldInputProps`로 값과 변경을 주고받습니다.

### Ask first

- 매칭 조건을 바꿀 때(정의 배열의 다른 입력과 겹치거나 빠질 수 있음)

### Never do

- `test`에서 부수 효과를 만들거나 UI 라이브러리를 가져오지 않습니다.
