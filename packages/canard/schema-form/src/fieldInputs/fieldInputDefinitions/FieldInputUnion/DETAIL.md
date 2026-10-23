# FieldInputUnion 계약

## Requirements

- 부모 `fieldInputs`의 기본 입력 계약 중 union 입력 몫을 구현합니다(REACT-033, LANDING-186).

## API Contracts

- `schemaType`과 유효 `jsonSchema.type`의 교집합을 유효 목록으로 삼고, 같은 내부 `interpret`를 글 입력·흐림·목록 변경 시 적용합니다. 결과의 JSON 종류가 목록에 있는 경우에만 보내며 입력기 조합 중에는 보내지 않습니다. 빈 칸은 `undefined`를 보내고, 변환할 수 없는 글은 입력이 초안으로 들다가 흐림에 노드 값 표시로 되돌립니다(REACT-033, LANDING-186).
- `undefined`·nullable `null`은 빈 칸이고 다른 원시 값은 `String(value)`로 표시합니다. 객체·배열은 값 참조로 메모한 읽기 전용 표시이며(`utils/readUnionDisplay.ts`) 문자열화 실패는 무효 표지로 나타냅니다. `misfit`이 참이면 `aria-invalid`와 무효 표지를 붙이며, 객체·배열을 생성하거나 편집하지 않습니다(REACT-033).
- 글 입력은 형제 `FieldInputString`의 진입점에서 가져온 컴포넌트입니다.

## Acceptance Criteria

### union-interpret — 허용 값만 전송

- 유효 목록으로 해석한 허용 값만 보내고 조합 중에는 쓰지 않습니다(REACT-033).
- 차단된 union 입력은 객체·배열 값을 읽기 전용으로 표시합니다(`__tests__/blockedUnionInput.test.tsx`).

## Last Updated

2026-10-14: 소유자 구조 리뷰 넷째 손질(기본 입력을 입력마다 fractal로 분리).
