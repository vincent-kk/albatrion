# numberBehavior — 수·정수 계산 경계

## Purpose

수와 정수의 입력 해석과 원본 투영을 소유합니다.

## Boundaries

### Always do

- 문자열 변환의 안전 정수 검사와 이미 수인 값의 멤버십을 구별합니다. 표현을 해석하는 일로 기존 수를 교정하지 않습니다.

### Ask first

- number·integer의 멤버십이나 변환 범위를 바꿀 때

### Never do

- 소수를 잘라 정수로 만들거나 잘못된 값을 비워 정합한 입력처럼 보이게 하지 않습니다.
