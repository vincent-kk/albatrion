# nullBehavior 계약

## Requirements

null은 명시 값이고 undefined는 없음입니다. 둘을 합치면 사용자가 준 null이 채움이나 생략으로 바뀌므로 이 행의 해석과 투영은 항등을 유지합니다.

## API Contracts

null을 받은 뒤의 멤버십·misfit과 채움 판단은 [settle 계약](../../settle/DETAIL.md)에 둡니다. 이 행은 다른 값을 null로 바꾸어 정합성을 만들지 않습니다.

## Acceptance Criteria

### null-row — 항등은 정합성을 보장하지 않습니다

null·undefined·잘못된 종류의 입력을 같은 값과 참조로 돌려줍니다. 반환되었다는 사실은 null 멤버라는 판정이 아니며, 잘못된 원본도 그대로 투영합니다. 다른 값의 오류를 해석 단계에서 숨기지 않기 위한 경계입니다.

## Last Updated

null과 없음의 구분 또는 항등 해석·투영 경계가 바뀔 때 갱신합니다.
