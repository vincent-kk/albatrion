# fieldInputGroup

## Purpose

필드 제목 렌더러가 내장 checkbox·radio 묶음 입력이 받을 스키마인지 판정하게 하는 헬퍼. 묶음이면 제목은 `htmlFor` 대신 id `${path}-label`을 달고, 선택지 묶음의 `aria-labelledby`가 그 id를 가리킨다.

## Conventions

- 판정 조건은 `fieldInputs`의 `FieldInputStringCheckboxDefinition`·`FieldInputStringRadioDefinition`의 `test`와 같게 유지한다(시험이 일치를 고정).
- 스키마만 읽고 노드·폼 상태나 등록된 입력 정의를 읽지 않는다.

## Boundaries

### Always do

- 내장 묶음 입력의 선택 조건이 바뀌면 같은 변경에서 이 판정을 맞춘다.

### Ask first

- 판정을 실제로 선택된 입력 정의(플러그인·사용자 입력 포함)에 묶는 변경 — 입력 정의 공개 형이 바뀐다.

### Never do

- `fieldInputs`를 import한다 — `fieldInputs`가 `components`를 import하므로 순환이 생긴다.
