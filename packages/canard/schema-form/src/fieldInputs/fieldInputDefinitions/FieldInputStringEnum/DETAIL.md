# FieldInputStringEnum 계약

## Requirements

- 부모 `fieldInputs`의 기본 입력 계약 중 문자열 enum 입력 몫을 구현합니다(대기열 38).

## API Contracts

- undefined를 맨 앞의 빈 비활성 옵션으로 표시하며, enum에 빈 문자열이 있어도 이 옵션이 초기 선택을 차지합니다. null·undefined가 아닌 집합 밖 기본값은 맨 앞의 비활성 옵션으로 표시하고, null의 기존 선택 동작은 유지합니다. 추가 판정은 O(1)이며 undefined일 때 옵션 DOM 하나만 추가합니다.
- `type.ts`는 이 입력의 문맥 형을 정의합니다.

## Acceptance Criteria

### enum-placeholder — 빈 선택

- undefined와 집합 밖 기본값은 맨 앞의 비활성 옵션으로 표시됩니다.

## Last Updated

2026-10-14 — 소유자 구조 리뷰 넷째 손질(기본 입력을 입력마다 fractal로 분리).
