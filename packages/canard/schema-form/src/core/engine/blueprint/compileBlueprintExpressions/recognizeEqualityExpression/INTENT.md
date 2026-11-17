# recognizeEqualityExpression

## Purpose

한 의존 참조와 원시 리터럴의 엄격 비교·논리합인 active 식을 실행 없이 증명합니다.

## Conventions

- 컴파일러와 같은 치환을 독립 등록부에서 수행하고 의존 순서를 대조합니다.
- 전체 토큰과 우선순위 트리를 검사하며 리터럴 의미는 JavaScript와 일치시킵니다.

## Boundaries

### Always do

- 인식 실패는 undefined로 남겨 일반 평가를 사용하게 합니다.
- Map 키와 엄격 비교의 동등성이 성립하는 리터럴만 받습니다.

### Ask first

- 허용 문법·리터럴 의미·의존 대조 조건을 넓힐 때

### Never do

- Function·eval·작성 함수·컴파일된 함수·toString을 호출하지 않습니다.
- 폼 값이나 살아 있는 노드를 읽지 않습니다.
- 식의 일부만 맞는 것으로 전체 식의 증거를 만들지 않습니다.
