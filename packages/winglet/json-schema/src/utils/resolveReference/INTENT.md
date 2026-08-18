# resolveReference — 내부 $ref 인라인 해석

## Purpose

주어진 JSON Schema 안의 모든 내부 `$ref`(legacy `definitions`와 `$defs` 표기 모두)를 찾아 가리키는 정의로 치환한 완전 해석 스키마를 반환한다. 별도의 순회 로직을 직접 구현하지 않고, 하위 fractal의 동기 스캐너를 두 번 구동한다 — 1차로 참조 위치를 수집하고, 2차로 수집된 정의를 인라인한다.

## Boundaries

### Always do

- 참조 수집과 인라인 두 단계 모두 동기 `JsonSchemaScanner`의 엔트리 포인트를 통해서만 사용한다
- 동작을 바꾸는 변경은 DETAIL.md를 먼저 갱신한다

### Ask first

- 비동기 버전 제공, 또는 원격 등 외부 참조 해석 지원 추가
- 순환 참조를 1레벨을 넘어 더 깊이 인라인하도록 확장

### Never do

- 스캐너를 거치지 않고 직접 스키마 트리를 순회·치환하는 로직 추가
- 인자로 받은 원본 스키마 객체를 직접 변경하는 코드 추가
