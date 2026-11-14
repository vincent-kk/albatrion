# numberBehavior 계약

## Requirements

수·정수는 같은 런타임 종류의 해석을 공유합니다. 종류를 접는 일로 integer의 제약까지 number로 넓히면 검증과 입력 해석이 어긋나므로, 행은 전달된 spec의 멤버십을 유지합니다.

## API Contracts

변환 표와 무예외·멱등 해석은 [unionBehavior 계약](../unionBehavior/DETAIL.md), 수를 받은 뒤 정합 상태를 계산하는 일은 [settle 계약](../../settle/DETAIL.md)이 소유합니다.

## Acceptance Criteria

### number-row — 변환의 안전성과 멤버십을 구별합니다

문자열을 정수로 바꿀 때의 안전 범위 검사와 이미 수인 값의 integer 멤버십은 다릅니다. 후자는 정수 여부를 검사하며 안전 정수 범위로 제한하지 않습니다. 이미 수인 소수·비유한 값·잘못된 종류를 자르거나 빈 값으로 대체하지 않아 원본의 오류를 숨기지 않습니다.

수 행은 원본을 그대로 투영하며 omitEmpty로 잘못된 종류의 빈 값까지 제거하지 않습니다. number와 integer의 해석 차이를 빈 값 교정이나 입력 표시 정책으로 옮기지 않습니다.

## Last Updated

수·정수의 멤버십, 문자열 변환의 안전 범위 또는 항등 투영이 바뀔 때 갱신합니다.
