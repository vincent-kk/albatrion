# booleanBehavior 계약

## Requirements

불리언 해석은 [unionBehavior의 변환 표](../unionBehavior/DETAIL.md)를 공유합니다. JavaScript의 truthy/falsy 판정을 입력 규칙으로 사용하면 false라는 글도 참이 되어 사용자 의도가 바뀝니다.

## API Contracts

이 행은 허용된 변환 결과만 계산하고 원본 쓰기·정합 상태 갱신은 [settle 계약](../../settle/DETAIL.md)에 맡깁니다.

## Acceptance Criteria

### boolean-row — 형 변환과 진릿값 판정을 구별합니다

허용 표 밖의 문자열·수·객체·null은 받은 그대로 유지합니다. 불리언 행의 투영은 항등이며 잘못된 종류의 빈 값도 omitEmpty로 지우지 않습니다. 해석 실패를 false나 없음으로 바꾸면 원본 오류를 관찰할 수 없습니다.

## Last Updated

불리언의 변환 범위·실패 시 보존·항등 투영이 바뀔 때 갱신합니다.
