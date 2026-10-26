# FieldInputString 계약

## Requirements

- 부모 `fieldInputs`의 기본 입력 계약 중 문자열 입력 몫을 구현합니다(REACT-027).

## API Contracts

- 진입점은 정의 `FieldInputStringDefinition`과 함께 컴포넌트 `FieldInputString`을 이름으로 내보냅니다. 형제 `FieldInputUnion`이 이 진입점으로 컴포넌트를 가져옵니다.
- 치다 만 글과 입력기 조합은 노드가 아닌 입력의 초안입니다(REACT-027).
- 빈 칸은 `nullable` 과 무관하게 `undefined` 를 보냅니다. 입력은 `null` 을 자동으로 만들지 않습니다(REACT-027, 444C-09).

- `misfit` 값은 조작 요소에 `aria-invalid="true"`로 표시하며 노드 값은 바꾸지 않습니다(REACT-027, SURFACE-061).

## Acceptance Criteria

### string-drafts — 조합 중 초안

- 입력기 조합 중에는 노드에 쓰지 않습니다(REACT-027).

## Last Updated

2026-10-26: 무효 값의 aria-invalid 표지와 노드 값 보존 계약을 명시합니다.
