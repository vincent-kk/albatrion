# async — JsonSchemaScannerAsync 비동기 순회 엔진

## Purpose

JSON Schema를 깊이 우선(DFS)으로 순회하되 필터링·변형(mutate)·`$ref` 해석·방문자 콜백이 프로미스를 반환해도 완료까지 기다리는 `JsonSchemaScannerAsync` 클래스를 소유한다. sync fractal의 클래스를 상속하지 않는 별도 구현이지만, 상위 organ이 소유한 동일한 순회 코어를 구동해 두 변형의 순회 순서·참조 해석 규칙을 맞춘다.

## Boundaries

### Always do

- 콜백 반환값이 thenable인지 검사해 그 경우에만 await하고, 동기 콜백은 추가 마이크로태스크 없이 그대로 처리한다
- sync fractal과 옵션 이름·기본값·순회 순서를 계속 맞춘다 — 어긋나면 두 fractal의 DETAIL.md를 함께 갱신한다

### Ask first

- 옵션 타입에 sync에는 없는 옵션 추가
- 콜백 병렬 실행 등 현재의 순차 대기 방식을 바꾸는 변경

### Never do

- sync 클래스를 상속하거나 캐스팅해 재사용하는 방식으로 리팩터링 — 현재의 독립 구현·공유 코어 구조를 깨는 변경
- 실패한 `scan` 이후 내부 상태를 부분적으로 남겨두는 변경
