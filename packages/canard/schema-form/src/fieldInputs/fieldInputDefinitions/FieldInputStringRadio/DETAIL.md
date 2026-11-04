# FieldInputStringRadio 계약

## Requirements

- 부모 `fieldInputs`의 기본 입력 계약 중 문자열 radio 입력 몫을 구현합니다(257C-01, 대기열 38).

## API Contracts

- 선택지 id·label·묶음 규약은 문자열 checkbox 입력과 같습니다(`${path}-${index}`, `role="group"`, `aria-labelledby="label:${path}"`; 대기열 38, 276라운드).
- `type.ts`는 이 입력의 문맥 형을 정의합니다.

- `misfit` 값은 조작 요소에 `aria-invalid="true"`로 표시하며 노드 값은 바꾸지 않습니다(REACT-027, SURFACE-061).

## Acceptance Criteria

### radio-ids — 선택지 연결

- 선택지 id는 서로 다르고 각 label의 `htmlFor`가 그 id와 같습니다(257C-01). 묶음은 `group` 역할로 찾을 수 있습니다(대기열 38).

## Last Updated

2026-10-26: 무효 값의 aria-invalid 표지와 노드 값 보존 계약을 명시합니다.
