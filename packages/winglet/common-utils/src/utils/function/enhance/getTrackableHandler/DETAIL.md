# getTrackableHandler contract

## Requirements

- 비동기 함수를 감싸 상태(`state`)·구독(`subscribe`)·실행 중 여부(`pending`)를 노출하는 핸들러로 변환한다.
- `preventConcurrent` 기본값 `true`로 동시 호출을 차단하고, `false`면 병렬 실행을 허용한다.
- `afterExecute`는 원본 함수의 성공·실패와 무관하게 항상 실행되어 `pending`을 해제한다.
- 구독자는 `handler()` 각 호출마다 정확히 두 번(시작·완료) 통지받으며, 동일 리스너를 중복 구독해도 통지 횟수는 늘지 않는다.

## API Contracts

- `getTrackableHandler(origin, options?)` → 상태·구독·`pending`이 결합된 핸들러. `options`: `preventConcurrent`(기본 `true`), `initialState`, `beforeExecute`, `afterExecute`.
- 반환된 핸들러: 호출 가능(`Promise<Result | undefined>`), `subscribe(listener)`(구독 해제 함수 반환), `pending`(읽기 전용), `state`(읽기 전용) — 세 속성 모두 non-enumerable이다.
- `StateManager<State>`: `{ state, update(updater) }` 형태로 두 훅 콜백에 전달된다. `updater`는 부분 객체이거나 이전 state를 받는 함수다.

## Acceptance Criteria

### lifecycle-publish — 실행 라이프사이클과 구독 통지

- `beforeExecute` → `pending=true` 통지 → 원본 함수 실행 → `afterExecute`(항상) → `pending=false` 통지 순서로 진행되며, 훅이 정의되지 않아도 통지는 정확히 두 번 발생한다.
- 동일 리스너를 두 번 구독해도 한 번만 등록되어 통지 횟수가 늘지 않는다.
- 훅 실행 중 이뤄진 state 갱신은 훅 종료 시점의 통지 하나로 접히고, 훅 밖에서 나중에 호출된 갱신 함수는 즉시 개별 통지된다.

### concurrent-guard — 동시 실행 제어

- `preventConcurrent`가 `true`(기본값)면 첫 호출이 진행 중일 때 추가 호출은 원본 함수를 실행하지 않고 `undefined`를 반환한다.
- `preventConcurrent`가 `false`면 동시에 호출된 만큼 원본 함수가 모두 실행된다.

### hook-error-recovery — 훅 에러 시 정리 보장

- `beforeExecute`가 던지면 원본 함수는 호출되지 않고 에러가 전파되며, 그 이전에 이뤄진 state 갱신은 통지된다.
- `afterExecute`가 던지면 에러가 전파되지만 `pending`은 항상 `false`로 정리되고 완료 통지도 수행된다.

## Last Updated

2026-08-18 — 최초 계약 작성
