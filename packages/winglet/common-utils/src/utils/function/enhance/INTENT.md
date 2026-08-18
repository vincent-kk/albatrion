# enhance — getTrackableHandler 소유 fractal

## Purpose

`getTrackableHandler`를 소유하는 중간 fractal이다. 비동기 함수에 상태 추적·구독·동시 실행 제어를 부여하는 이 유틸리티의 유일한 소유자이며, 하위 fractal의 공개 계약을 이름으로 그대로 재수출한다 — 함수 하나와 그에 딸린 타입 전부이며, 이 fractal 자신은 구현이나 상태를 추가하지 않는다.

## Boundaries

### Always do

- `getTrackableHandler` 관련 새 공개 심벌은 하위 fractal의 진입점에서 이름으로 재수출한다
- 하위 fractal의 계약이 바뀌면 이 재수출 목록도 같은 커밋에서 맞춘다

### Ask first

- 이 fractal root에 `getTrackableHandler` 이외의 구현을 직접 추가하는 변경
- 재수출 표면을 좁히거나 이름을 바꾸는 변경 — 소비자의 import 경로가 깨진다

### Never do

- 하위 fractal의 내부 파일을 그 진입점을 건너뛰고 여기서 직접 import
- 이름을 밝히지 않는 와일드카드로 하위 fractal을 재수출
