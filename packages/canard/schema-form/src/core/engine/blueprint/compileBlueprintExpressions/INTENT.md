# compileBlueprintExpressions

## Purpose

작성된 선언과 게이트의 표현식을 컴파일하고 호스트별 정적 의존 경로를 등록한다.

## Conventions

- watch와 식 경로를 최초 등록 순서대로 수집한다.
- 컴파일 함수와 경로 등록부의 구현 계약은 각각의 자식 프랙탈이 소유한다.

## Boundaries

### Always do

- 공유 참조의 식을 연결별 호스트에 다시 결합한다.
- 컴파일 실패에 작성된 schemaPath와 원인을 보존한다.

### Ask first

- 표현식 문법, 의존 경로 정규화나 컴파일 시점을 바꿀 때

### Never do

- 청사진 구성 중에 컴파일된 식을 실행하지 않는다.
- 살아 있는 폼 값을 읽거나 컴파일 오류를 삼키지 않는다.
