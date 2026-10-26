# FieldInputDateFormat 계약

## Requirements

- 부모 `fieldInputs`의 기본 입력 계약 중 날짜 형식 입력 몫을 구현합니다(CONTROLS-051·081).

## API Contracts

- `presentation.FieldInputProps`의 `minimum`·`maximum`을 입력 props로 받아 `min`·`max` 속성에 씁니다. `options`는 닫힌 목록이라 이 키를 두면 청사진 오류 `UNKNOWN_GROUP_KEY`입니다(CONTROLS-081, CONTROLS-051).
- 마운트 시 기본값이 해당 HTML 입력의 값 문법에 맞지 않으면 텍스트 입력으로 원문을 표시하며, 빈 값은 날짜 형식 입력을 유지합니다. 판정은 `utils/isRenderableDateInputValue.ts`(`DateInputType`과 값)를 씁니다.
- 빈 칸은 `undefined`로 전달합니다(`nullable`과 무관; 444C-09). 브라우저 `badInput`이면 노드에 쓰지 않고 입력이 초안을 보유하며, 흐림에는 마지막 노드 값으로 표시를 되돌립니다(REACT-027, 444C-09).
- `misfit` 값은 조작 요소에 `aria-invalid="true"`로 표시하며 노드 값은 바꾸지 않습니다(REACT-027, SURFACE-061).
- `type.ts`는 이 입력의 스키마·속성 형(`DateFormatJSONSchema`·`FieldInputDateFormatProps`)을 정의합니다.

## Acceptance Criteria

### date-format — 범위와 표시 전환

- `presentation.FieldInputProps.minimum`·`maximum`을 `min`·`max` 속성으로 쓰고, `options.minimum`은 청사진 오류 `UNKNOWN_GROUP_KEY`로 폼을 막습니다(CONTROLS-081·051).
- 문법에 맞지 않는 기본값은 텍스트 입력으로 원문을 보이고, 빈 값은 날짜 입력을 유지합니다.
- 빈 칸은 `undefined`로 전달하고, `badInput`은 초안으로 보유하다 흐림에 노드 값으로 표시를 되돌립니다(REACT-027, 444C-09).

## Last Updated

2026-10-14: 소유자 구조 리뷰 넷째 손질(기본 입력을 입력마다 fractal로 분리).
2026-10-26: 빈 칸 undefined 전달과 badInput 초안 흐림 복귀(REACT-027, 444C-09), misfit 값 aria-invalid 표시(REACT-027, SURFACE-061).
