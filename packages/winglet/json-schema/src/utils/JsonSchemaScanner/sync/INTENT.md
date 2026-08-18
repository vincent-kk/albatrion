# sync — JsonSchemaScanner 동기 순회 엔진

## Purpose

JSON Schema를 깊이 우선(DFS)으로 동기 순회하며 필터링·변형(mutate)·`$ref` 해석·순환 참조 탐지를 수행하는 `JsonSchemaScanner` 클래스를 소유한다. 순회 어휘(키워드마다 자식으로 내려가는 방식)와 공용 순회 코어는 상위 organ이 소유하며, 이 fractal은 그 코어를 동기적으로 구동하는 드라이버와 키워드 상수 재수출을 담당한다.

## Boundaries

### Always do

- 방문자·필터·변형(mutate)·참조 해석 콜백은 모두 동기 함수로만 호출한다 — 비동기가 필요하면 async fractal을 대신 쓴다
- 순회 어휘나 순환 참조 탐지 방식을 바꾸는 변경은 DETAIL.md를 먼저 갱신하고 async fractal과의 동작 일치 여부를 함께 확인한다

### Ask first

- 옵션 타입에 새 옵션 추가
- `scan`/`getValue`의 반환 타입이나 캐싱 동작 변경

### Never do

- 콜백 반환값이 프로미스인지 검사해 await하는 로직 추가 — 비동기 지원은 async fractal의 책임이다
- 실패한 `scan` 이후 내부 상태(원본·처리된 스키마)를 부분적으로 남겨두는 변경
