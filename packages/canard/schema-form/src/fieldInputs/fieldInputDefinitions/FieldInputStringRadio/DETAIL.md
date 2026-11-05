# FieldInputStringRadio 계약

## Requirements

선택지의 값·라벨·필드 제목을 구별하여, 공백이 포함된 enum 값도 선택지 연결을 깨뜨리지 않게 합니다.

## API Contracts

- 공통 무효 표시와 값 보존 정책은 [상위 계약](../../DETAIL.md)에 둡니다.
- 선택지 연결과 묶음 이름의 공통 규약은 [문자열 checkbox 계약](../FieldInputStringCheckbox/DETAIL.md)에 둡니다. 두 입력의 접근성 연결 규칙이 따로 달라지지 않게 합니다.

## Acceptance Criteria

### CONTROLS-081 — 표시 선택은 전달된 입력 힌트를 따릅니다

- radio·radiogroup 선택은 Hint의 `inputType`으로 판단하며, 라벨 alias는 입력 props로 받습니다. 공개 위치는 [presentation 계약](../../../types/DETAIL.md)에 두어 맨 키나 options를 대체 설정으로 읽지 않습니다.

### radio-ids — 선택지와 저장값의 연결

- 이벤트의 문자열 표기를 해당 enum 원래 값으로 되돌려 전달합니다. DOM 표기를 저장값으로 대신 쓰면 null 등의 리터럴 의미가 바뀔 수 있습니다.
- 서로 다른 리터럴의 문자열 표기가 겹치는 경우까지 구별하는 편집기는 아닙니다. 필요한 경우 사용자 입력을 제공하며 기본 union으로 선택 책임을 옮기지 않습니다.

## Last Updated

입력 선택 힌트·라벨 설정·선택지 연결 또는 리터럴 전달의 한계가 바뀔 때 갱신합니다.
