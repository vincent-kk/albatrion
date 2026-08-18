# function contract

## Requirements

- 이 fractal은 자체 로직을 갖지 않는다. 하위 fractal 두 개(비동기 핸들러 강화, 호출 빈도 제어)의 공개 계약을 이름으로 재수출하는 것이 유일한 책임이다.
- 재수출되는 심벌의 이름과 타입 시그니처는 소유 fractal의 계약과 항상 동일해야 한다 — 이 fractal에서 별도로 변형하지 않는다.
- 패키지 매니페스트의 `@winglet/common-utils/function` 서브패스가 이 진입점을 가리키는 유일한 공개 경로다.

## API Contracts

- `getTrackableHandler`(값), `TrackableHandlerFunction`·`TrackableHandlerOptions`(타입) — enhance 하위 fractal의 진입점에서 재수출한다. 동작 계약은 그 하위 fractal의 DETAIL.md를 따른다.
- `debounce`·`throttle`(값), `DebouncedFn`·`ThrottledFn`(타입) — rateLimit 하위 fractal의 진입점에서 재수출한다. 동작 계약은 그 하위 fractal의 DETAIL.md를 따른다.

## Acceptance Criteria

### reexport-fidelity — 하위 fractal 재수출 충실성

- 이 fractal 자신은 `__tests__`를 갖지 않는다 — 재수출되는 각 심벌의 런타임 동작은 소유 하위 fractal의 테스트 스위트가 검증한다.
- 실제 외부 소비자(`@canard/schema-form`의 Form 컴포넌트)가 이 서브패스 하나로 `getTrackableHandler` 값과 `TrackableHandlerFunction` 타입을 가져와 사용한다 — 소유 fractal 내부 경로가 아닌 이 진입점을 통해서다.

## Last Updated

2026-08-18 — 최초 계약 작성
