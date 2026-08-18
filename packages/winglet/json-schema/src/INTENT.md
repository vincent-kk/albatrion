# json-schema — JSON Schema 순회·타입 판별·$ref 해석 루트

## Purpose

JSON Schema 순회 스캐너(동기·비동기), 스키마 타입 판별자, $ref 인라인 해석 유틸리티를 하나의 공개 표면으로 묶어 재수출하는 패키지 루트다. 순회 엔진은 하위 sync·async 두 변형 fractal이, 타입 판별은 filters fractal이, $ref 해석은 resolveReference fractal이 각각 소유한다 — 이 fractal은 각 계약을 원래 이름 그대로 재수출하고 서로 어긋나지 않게 유지하는 책임만 진다.

스키마 노드 타입 정의(JSON Schema/OpenAPI 겸용)도 이 fractal이 직접 소유하며 하위 fractal에 위임하지 않는다.

## Boundaries

### Always do

- 하위 fractal에서 재수출하는 심볼은 원본과 동일한 이름으로 내보낸다 — 이름을 바꾸거나 시그니처를 넓히는 재수출은 DETAIL.md를 먼저 갱신한다
- 순회 옵션의 기본값처럼 여러 하위 fractal이 공유하는 계약이 바뀌면 이 fractal과 관련 하위 fractal의 DETAIL.md를 함께 갱신한다

### Ask first

- 새 하위 fractal을 추가해 공개 표면을 넓히는 변경
- 기존 재수출 심볼 제거 또는 반환 타입 축소

### Never do

- 하위 fractal의 구현을 이 fractal로 옮겨와 재수출 대신 재구현
- 재수출 없이 하위 fractal 내부 파일을 가리키는 타입 별칭을 루트에 추가
