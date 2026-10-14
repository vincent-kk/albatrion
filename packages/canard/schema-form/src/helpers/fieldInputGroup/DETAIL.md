# fieldInputGroup

## Requirements

checkbox·radio 묶음 입력의 필드 제목이 존재하지 않는 요소를 `htmlFor`로 가리키지 않고, 선택지 묶음에 이름을 준다(대기열 38, 276라운드).

## API Contracts

- `isFieldInputGroup(schema)`는 스키마가 `presentation.inputType: 'checkbox'`인 문자열 enum 배열이거나 `presentation.inputType`이 `'radio'`·`'radiogroup'`인 문자열 enum이면 `true`를 돌려준다.
- 소비자는 기본 그룹 렌더러(`components/FallbackComponents`)와 `Form.Label`(`components/Form`)이다.
- 스키마 모양만 보므로, 플러그인이나 사용자 `presentation.FieldInput`이 이 스키마를 다른 입력으로 그리면 그 입력은 `aria-labelledby`를 스스로 달아야 이름이 이어진다.

## Acceptance Criteria

### field-input-group — 내장 정의와 같은 판정

- 표의 스키마마다 판정 결과가 내장 checkbox·radio 정의의 `test` 결과와 같다.

## Last Updated

2026-10-14 (대기열 38)
