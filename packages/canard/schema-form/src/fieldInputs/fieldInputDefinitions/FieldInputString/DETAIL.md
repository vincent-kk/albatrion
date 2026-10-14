# FieldInputString 계약

## Requirements

- 부모 `fieldInputs`의 기본 입력 계약 중 문자열 입력 몫을 구현합니다(REACT-027).

## API Contracts

- 진입점은 정의 `FieldInputStringDefinition`과 함께 컴포넌트 `FieldInputString`을 이름으로 내보냅니다. 형제 `FieldInputUnion`이 이 진입점으로 컴포넌트를 가져옵니다.
- 치다 만 글과 입력기 조합은 노드가 아닌 입력의 초안입니다(REACT-027).

## Acceptance Criteria

### string-drafts — 조합 중 초안

- 입력기 조합 중에는 노드에 쓰지 않습니다(REACT-027).

## Last Updated

2026-10-14 — 소유자 구조 리뷰 넷째 손질(기본 입력을 입력마다 fractal로 분리).
