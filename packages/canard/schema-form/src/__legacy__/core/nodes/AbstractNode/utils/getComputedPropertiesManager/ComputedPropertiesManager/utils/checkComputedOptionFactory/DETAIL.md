# checkComputedOptionFactory

## Requirements

상태 조건 표현식을 boolean 계산 함수로 변환하며, 설정 위치별 우선순위를 유지합니다.

## API Contracts

- 루트 설정, 노드 설정, computed 설정, 별칭 순으로 표현식을 찾습니다.
- boolean 리터럴은 상수 함수로 만들고 문자열은 boolean coercion을 켜서 컴파일합니다.

## Acceptance Criteria

### check-computed-option-factory-contract — 관찰 가능한 동작

- 상위 우선순위에 false가 명시되어도 하위 표현식으로 대체하지 않습니다.
- 문자열 조건의 실행 결과는 boolean으로 반환됩니다.

## Last Updated

2026-09-16
