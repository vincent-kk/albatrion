# recognizeEqualityExpression

## Purpose

작성된 active 식이 단일 의존 참조와 원시 리터럴의 엄격 비교 및 논리합임을 실행 없이 증명합니다.

## Conventions

- 컴파일러와 같은 경로 치환을 사용하고 독립된 경로 관리자의 결과를 대조합니다.
- 명시된 문법만 수동 스캔하고 우선순위 트리 전체를 검증합니다.
- 형제 컴파일러와 경로 관리자는 각각의 진입점을 통해 소비합니다.

## Boundaries

### Always do

- 인식하지 못한 식은 undefined로 남겨 기존 평가 경로를 유지합니다.
- 리터럴 해석은 실제 JavaScript 비교와 같은 원시값을 만듭니다.

### Ask first

- 허용 문법이나 리터럴 의미를 넓힐 때

### Never do

- Function·eval·작성된 함수·toString을 호출하지 않습니다.
- 폼 값이나 살아 있는 노드를 읽지 않습니다.
