# FieldInputNumber 계약

## Requirements

- 부모 `fieldInputs`의 기본 입력 계약 중 수 입력 몫을 구현합니다(REACT-027).

## API Contracts

- 비유한 숫자(NaN·무한대)는 빈 기본값으로 표시하며 노드 값은 바꾸지 않습니다. badInput 흐림 복귀도 같은 규칙으로 빈 칸을 씁니다.
- 빈 칸은 `undefined`로 전달합니다(`nullable` 과 무관; 444C-09). 브라우저 `badInput`이면 노드에 쓰지 않고 입력이 초안을 보유하며, 흐림에는 마지막 노드 값으로 표시를 되돌립니다. 치다 만 글과 입력기 조합은 노드가 아닌 입력의 초안입니다(REACT-027).
- `misfit`이 참이면 입력에 `aria-invalid="true"`만 붙이고 어떤 문구도 그리지 않으며 값은 바꾸지 않습니다(REACT-027, SURFACE-061).

## Acceptance Criteria

### number-drafts — 빈 칸과 badInput

- 빈 칸·badInput·흐림 복귀가 노드 값과 초안을 구별합니다(REACT-027).
- `misfit`이 참이면 입력에 `aria-invalid="true"`가 붙고 유효한 수를 입력하면 사라집니다(REACT-027, SURFACE-061).

## Last Updated

2026-10-14: 소유자 구조 리뷰 넷째 손질(기본 입력을 입력마다 fractal로 분리).
2026-10-26: misfit이면 입력에 aria-invalid만 설정하고 값은 유지(REACT-027, SURFACE-061).
