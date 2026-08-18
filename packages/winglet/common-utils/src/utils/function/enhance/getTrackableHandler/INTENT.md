# getTrackableHandler — 추적 가능한 비동기 핸들러

## Purpose

비동기 함수를 상태 추적·구독 알림·동시 실행 제어가 결합된 핸들러로 변환하는 `getTrackableHandler` 하나를 소유하는 eponymous fractal이다. 공개 표면은 함수 자신과 옵션·반환 핸들러 타입 두 개뿐이다. 콜백에 전달되는 상태 관리자 타입은 구조적 타이핑만으로 충분해 이름으로는 재수출하지 않는다.

## Conventions

- 라이프사이클 훅(`beforeExecute`/`afterExecute`) 실행 중의 state 갱신은 훅이 끝나는 시점의 단일 통지로 접힌다 — 훅 밖에서 저장해 둔 갱신 함수를 나중에 호출하면 즉시 개별 통지된다.
- `afterExecute`가 던지더라도 pending 정리와 완료 통지는 항상 수행된 뒤에 에러가 전파된다 — 정리 보장이 에러 전파보다 우선한다.

## Boundaries

### Always do

- 상태 갱신 경로를 바꾸는 변경은 통지 타이밍(훅 중 접힘, 훅 밖 즉시) 불변식을 지킨다
- 라이프사이클 훅의 에러 처리 순서를 바꾸는 변경은 DETAIL.md를 먼저 갱신한다

### Ask first

- `getTrackableHandler`의 시그니처나 옵션 계약 확장
- 상태 관리자 타입을 엔트리에서 이름으로 재수출하는 변경

### Never do

- `afterExecute` 에러로 인해 `pending`이 `true`로 남는 경로 추가
- 구독자 통지 순서를 훅 완료 이전으로 앞당기는 변경
