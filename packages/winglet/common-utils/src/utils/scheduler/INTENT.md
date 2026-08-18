# scheduler — 이벤트 루프 스케줄링 프리미티브

## Purpose

`scheduleMicrotask`·`scheduleMacrotask`(+ 취소)·`scheduleMacrotaskSafe`(+ 취소)·`scheduleNextTick` 네 계열의 스케줄링 함수를 소유한다. 각 함수는 실행 환경이 제공하는 가장 적합한 네이티브 타이밍 API를 모듈 로드 시 한 번 감지해 상수로 바인딩하고, 이후 호출은 그 바인딩을 그대로 쓴다.

## Conventions

- `scheduleMacrotask`는 네이티브 `setImmediate`/`clearImmediate`가 없으면 자식 fractal `MessageChannelScheduler`로 폴백한다. `scheduleMacrotaskSafe`는 같은 상황에서 `setTimeout`/`clearTimeout`으로만 폴백한다 — 렌더링 양보를 보장하려는 의도된 차이이며, 서로의 폴백 대상을 바꾸면 안 된다.
- `scheduleNextTick`의 실행 시점은 플랫폼마다 매크로태스크 경계의 반대편이다: Node는 microtask/nextTick 단계, 브라우저 폴백은 macrotask 단계에서 실행된다. 타이머와의 상대 순서를 가정하는 코드를 추가하지 않는다.

## Boundaries

### Always do

- 새 스케줄러를 추가할 때 환경 감지를 모듈 최상위에서 즉시 실행해 결과를 상수로 바인딩하는 기존 패턴을 따른다
- `scheduleMacrotask`/`scheduleMacrotaskSafe`의 폴백 대상 차이를 바꾸는 변경은 DETAIL.md를 먼저 갱신한다

### Ask first

- `scheduleNextTick`이 두 플랫폼에서 동일한 상대 순서를 보장하도록 구현을 바꾸는 것 — 현재는 의도적으로 보장하지 않는다
- 취소 가능 스케줄러의 2단계 취소 전략(플랫폼 취소 + boolean 가드) 변경

### Never do

- 대응하는 취소 API 없이 스케줄 함수만 추가
- 환경 감지를 지연시켜 특정 전역이 있는지 매 호출마다 다시 검사하게 만드는 변경(모듈 로드 시 1회 감지 계약을 깬다)
