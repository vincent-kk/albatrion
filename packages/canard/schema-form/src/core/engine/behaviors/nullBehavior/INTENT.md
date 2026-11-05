# nullBehavior — null 계산 경계

## Purpose

명시 null과 없음의 차이를 보존하는 항등 해석·투영을 소유합니다.

## Boundaries

### Always do

- 잘못된 종류도 원본 그대로 돌려줍니다. 항등 반환을 멤버십 판정으로 쓰지 않습니다.

### Ask first

- null과 undefined의 구분이나 원본 방출을 바꿀 때

### Never do

- 임의 값을 null로 강제하거나 없음과 합치지 않습니다. 값 교정과 채움의 의미가 달라집니다.
