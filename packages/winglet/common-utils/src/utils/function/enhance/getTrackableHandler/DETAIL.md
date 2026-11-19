# getTrackableHandler contract

## Requirements

- 비동기 함수를 감싸 상태(`state`)·구독(`subscribe`)·실행 중 여부(`pending`)를 노출하는 핸들러로 변환한다.
- `preventConcurrent` 기본값 `true`로 동시 호출을 차단하고, `false`면 병렬 실행을 허용한다.
- `afterExecute`는 시작 통지 또는 원본 함수의 성공·실패와 무관하게 실행되며, 호출 종료 시 진행 중 호출 수를 줄입니다.
- 허용된 호출은 성공·원본 함수 실패·after 훅 실패에서 시작·완료 두 번 통지합니다. before 훅 실패는 한 번, 동시 실행 차단으로 거절된 호출은 통지하지 않습니다. 동일 리스너의 중복 구독은 횟수를 늘리지 않습니다.

구독자가 던져도 모든 구독자에게 순서대로 알립니다. 시작 통지의 첫 예외는 핸들러 거부로 전파하고, 추가 시작 오류와 완료 통지 오류는 reportError 또는 별도 throw 태스크로 호스트에 보고합니다. 완료 구독자 오류는 원본의 성공·실패 결과를 바꾸지 않습니다.

훅이 Promise 또는 thenable을 반환하면 그 정착을 기다리고 동기 반환은 같은 tick에서 진행합니다. before 훅의 거부는 원본 실행을 막고, after 훅의 거부는 pending 정리 후 전파합니다. 정착하지 않는 훅을 기다리는 동안에도 pending과 동시·재진입 차단은 유지됩니다. 훅이 있는지 생성 시 한 번 선택하여 훅이 없는 호출 경로에는 훅 반환값 검사를 넣지 않습니다.

`preventConcurrent: false`에서는 호출마다 훅 진행 상태와 알림 귀속을 독립적으로 소유합니다. 상태 객체는 공유되며 update가 즉시 반영되므로 다른 호출의 알림에서도 이 값을 관찰할 수 있습니다. 훅별 상태 트랜잭션은 제공하지 않습니다. 저장해 둔 update는 그 호출의 훅 실행 중에만 알림을 접고, 다른 호출의 훅이 기다리는 동안에도 즉시 알립니다. 동시 호출은 공유 진행 플래그를 덮어쓰지 않으며 pending은 살아 있는 호출 수로 계산합니다.

## API Contracts

- `getTrackableHandler(origin, options?)` → 상태·구독·`pending`이 결합된 핸들러. `options`: `preventConcurrent`(기본 `true`), `initialState`, `beforeExecute`, `afterExecute`.
- 반환된 핸들러: 호출 가능(`Promise<Result | undefined>`), `subscribe(listener)`(구독 해제 함수 반환), `pending`(읽기 전용), `state`(읽기 전용) — 세 속성 모두 non-enumerable이다.
- `StateManager<State>`: `{ state, update(updater) }` 형태로 두 훅 콜백에 전달된다. `updater`는 부분 객체이거나 이전 state를 받는 함수다.

## Acceptance Criteria

### lifecycle-publish — 실행 라이프사이클과 구독 통지

- `pending=true`로 호출을 예약 → `beforeExecute` 정착 → 시작 통지 → 원본 함수 실행 → `afterExecute`(항상) → `pending` 갱신 통지 순서로 진행되며, before 훅이 실패하지 않은 허용된 호출은 정확히 두 번 통지합니다. before 훅 실패는 완료 통지만 한 번 발생하고, 차단된 호출은 통지하지 않습니다.
- 동일 리스너를 두 번 구독해도 한 번만 등록되어 통지 횟수가 늘지 않는다.
- 훅 실행 중 이뤄진 state 갱신은 훅 종료 시점의 통지 하나로 접히고, 훅 밖에서 나중에 호출된 갱신 함수는 즉시 개별 통지된다.

### concurrent-guard — 동시 실행 제어

- `preventConcurrent`가 `true`(기본값)면 첫 호출이 진행 중일 때 추가 호출은 원본 함수를 실행하지 않고 `undefined`를 반환한다.
- `preventConcurrent`가 `false`면 동시에 호출된 만큼 원본 함수가 모두 실행되고 마지막 호출이 종료될 때까지 `pending`이 true입니다.

### hook-error-recovery — 훅 에러 시 정리 보장

- `beforeExecute`가 던지면 원본 함수는 호출되지 않고 에러가 전파되며, 그 이전에 이뤄진 state 갱신은 통지된다.
- `afterExecute`가 던지면 에러가 전파되지만 `pending`은 남은 호출 수에 맞게 정리되고 완료 통지도 수행됩니다. 시작 통지에서 구독자가 던져도 같은 정리를 수행합니다.

## Last Updated

핸들러 추적·참조 안정성 또는 호출 전달 계약이 바뀔 때 갱신합니다.
