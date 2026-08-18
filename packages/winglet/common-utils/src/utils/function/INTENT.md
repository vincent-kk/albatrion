# function — 함수 강화 유틸리티 진입점

## Purpose

`@winglet/common-utils/function` 서브패스의 유일한 공개 표면이다. 이 fractal 자신은 구현이나 상태를 갖지 않고, 하위 fractal 두 개가 소유한 공개 계약을 이름으로 재수출해 하나의 진입점으로 합친다 — 비동기 핸들러에 상태·구독을 부여하는 `getTrackableHandler`(enhance 하위 fractal 소유)와, 호출 빈도를 제어하는 rate-limit 유틸리티(rateLimit 하위 fractal 소유)다.

재수출은 각 소유 fractal의 진입점을 경유한다. 경유 지점은 소유 fractal의 진입점이면 충분하며, 중간에 몇 단계가 있는지는 경계 규칙에 영향을 주지 않는다 — `getTrackableHandler`는 enhance를 지나 그 자식 fractal의 진입점까지 내려가 가져온다.

## Boundaries

### Always do

- 새 함수 강화 유틸리티는 그 유틸리티를 소유하는 하위 fractal의 진입점에서 이름으로 재수출한다
- 이 파일은 재수출 전용으로 유지한다 — 구현 코드를 이 fractal root에 추가하지 않는다

### Ask first

- 이 fractal root에 구현 파일을 직접 추가해 재수출 전용 형태를 깨뜨리는 변경
- 하위 fractal이 재수출하는 공개 표면을 넓히거나 좁히는 변경

### Never do

- 하위 fractal의 내부 파일을 그 진입점을 건너뛰고 여기서 직접 import
- 이름을 밝히지 않는 와일드카드 재수출 추가
