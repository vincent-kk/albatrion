# FieldInputBoolean 계약

## Requirements

- 부모 `fieldInputs`의 기본 입력 계약 중 불리언 입력 몫을 구현합니다(REACT-027).

## API Contracts

- 체크박스는 불리언 아닌 값을 미정 상태(`indeterminate`)로 표시하며 노드 값은 바꾸지 않습니다(REACT-027).

- `misfit` 값은 조작 요소에 `aria-invalid="true"`로 표시하며 노드 값은 바꾸지 않습니다(REACT-027, SURFACE-061).
- `value === true`일 때만 체크 상태로 표시하고, 형이 맞지 않는 값은 체크하지 않습니다(REACT-027).

## Acceptance Criteria

### indeterminate — 불리언 아닌 값

- 불리언 아닌 값은 미정 상태로 표시되고 노드 값과 구별됩니다(REACT-027).

## Last Updated

2026-10-26: 무효 값의 aria-invalid 표지와 노드 값 보존 계약을 명시합니다.
