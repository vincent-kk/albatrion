# json — JSONPointer·JSONPath 진입점

## Purpose

JSONPointer(RFC 6901/6902/7396 정합 포인터·패치 연산)와 JSONPath(경로 상수·변환 유틸) 두 독립 하위 fractal의 공개 표면을 패키지 기본 진입점 하나로 재수출한다. 두 fractal은 서로 import하지 않는 독립 형제이며, 이 fractal 자신은 재수출 외의 로직을 갖지 않는다.

## Conventions

- JSONPointer는 포인터 형식을 경로 형식으로(`convertJsonPointerToPath`), JSONPath는 경로 형식을 포인터 형식으로(`convertJsonPathToPointer`) 변환한다 — 방향은 반대지만 코드로 연결되어 있지 않은 별개 계약이다.
- 예약 멤버(`__proto__` 등) own 데이터 취급 계약은 JSONPointer가 전담 소유한다 — 이 fractal은 그 계약을 재정의하거나 반복하지 않는다.

## Boundaries

### Always do

- 두 하위 fractal 중 하나의 공개 표면이 바뀌면 이 진입점의 재수출 목록도 함께 갱신한다
- 새 공개 심볼을 추가할 때 소유 fractal(JSONPointer 또는 JSONPath)을 먼저 정하고 그쪽에 구현한다

### Ask first

- 이 fractal 자체에 재수출이 아닌 새 로직(변환·검증 등)을 추가하는 변경
- 두 하위 fractal 사이에 직접 의존(import) 관계를 신설하는 변경

### Never do

- 예약 멤버 취급 규칙을 JSONPointer 밖에서 재구현
- 하위 fractal의 구현을 건너뛰고 그 로직을 이 fractal에 인라인으로 복제
