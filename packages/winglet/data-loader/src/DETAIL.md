# data-loader contract

## Requirements

- `new DataLoader(batchLoader, options?)`는 `batchLoader`가 함수가 아니면 생성 시점에 `DataLoaderError`를 던진다.
- `load(key)`는 `key`가 nil(`null`/`undefined`)이면 `DataLoaderError`를 던지고, `0`처럼 falsy이지만 nil이 아닌 키는 정상 처리한다. 같은 스케줄러 사이클 안의 여러 `load` 호출은 하나의 배치로 묶여 `batchLoader`를 1회만 호출한다.
- `loadMany(keys)`는 `keys`가 array-like가 아니면 `DataLoaderError`를 던지고, 그렇지 않으면 각 키를 `load`로 위임한 뒤 실패한 키는 값 대신 `Error`로 채워 반환한다.
- 캐시는 기본적으로 `Map`이며, 같은 키의 중복 `load`는 캐시된 Promise를 재사용해 `batchLoader`를 다시 호출하지 않는다. `cache: false`로 캐시를 끌 수 있고, 커스텀 캐시는 `get`/`set`/`delete`/`clear`를 모두 구현해야 한다.
- `clear(key)`/`clearAll()`은 캐시만 무효화한다 — 이후 `load`가 `batchLoader`를 다시 호출하게 만든다.
- `prime(key, value)`는 해당 키가 아직 캐시에 없을 때만 값(또는 `Promise`, `Error`)을 채운다 — 기존 캐시를 덮어쓰지 않는다.
- `maxBatchSize`는 한 배치가 가질 수 있는 최대 키 개수를 제한하며, 초과분은 다음 배치로 넘어가 `batchLoader`가 여러 번 호출된다. 1 미만이거나 숫자가 아니면 `DataLoaderError`를 던진다.
- `batchLoader`가 동기적으로 예외를 던지거나, `Promise`가 아닌 값을 반환하거나, 배열이 아닌 값으로 resolve되거나, 키 개수와 다른 길이의 배열로 resolve되면, 그 배치에 걸린 모든 키가 `DataLoaderError`로 reject되고 해당 키들의 캐시 항목도 제거된다.

## API Contracts

- `load(key: Key): Promise<Value>` — nil 키에서 `DataLoaderError`.
- `loadMany(keys: ReadonlyArray<Key>): Promise<Array<Value | Error>>` — array-like가 아닌 인자에서 `DataLoaderError`.
- `clear(key: Key): this`, `clearAll(): this`, `prime(key, value): this` — 모두 체이닝을 위해 인스턴스 자신을 반환한다.
- `batchScheduler`는 기본값 `scheduleNextTick`이며 함수가 아니면 `DataLoaderError`. `cacheKeyFn`은 기본값이 identity 함수이며 함수가 아니면 `DataLoaderError`.
- 패키지의 유일한 export는 `DataLoader` 클래스와 `DataLoaderOptions` 타입이다.

## Acceptance Criteria

### batching-scheduling — 배치 수집·스케줄링 계약

- 서로 다른 깊이의 중첩된 마이크로태스크 체인에서 호출된 여러 `load`도 스케줄러가 실행되기 전까지는 한 배치로 모여 `batchLoader`가 1회만 호출된다.
- `maxBatchSize`를 넘는 수의 동시 `load` 호출은 여러 번의 `batchLoader` 호출로 나뉜다.

### cache-dedup-invalidation — 캐시 재사용·무효화 계약

- 같은 키를 두 번 `load`해도 `batchLoader`는 1회만 호출된다.
- `clear`/`clearAll` 이후의 `load`는 `batchLoader`를 다시 호출한다.
- `prime`으로 값을 미리 채우면 이후 `load`가 `batchLoader`를 호출하지 않고 그 값(또는 에러)으로 즉시 해석된다.

### input-validation-errors — 입력 검증과 DataLoaderError 계약

- `batchLoader`가 함수가 아니면 생성자가 즉시 던진다.
- `load(undefined)`/`load(null)`은 던지고 `load(0)`은 던지지 않는다.
- `loadMany`에 배열이 아닌 인자를 주면 던진다.
- `get`/`set`/`delete`/`clear`를 전부 구현하지 않은 커스텀 캐시, 1 미만이거나 숫자가 아닌 `maxBatchSize`, 함수가 아닌 `cacheKeyFn`·`batchScheduler`는 모두 생성 시점에 던진다.

### batch-loader-contract-errors — batchLoader 응답 계약 위반 처리

- `batchLoader`가 동기적으로 예외를 던지면 그 배치의 모든 대기 중인 Promise가 같은 에러로 reject된다.
- `batchLoader`가 `Promise`가 아닌 값을 반환하면 `DataLoaderError`로 reject된다.
- `batchLoader`가 resolve한 값이 배열이 아니거나, 키 개수와 길이가 다른 배열이면 `DataLoaderError`로 reject된다.

### build-entry-parity — 빌드 엔트리 동등성

- 소스 상대 경로로 가져온 `DataLoader`와 패키지 별칭으로 가져온 `DataLoader`에 대해 동일한 기본 API 테스트 스위트가 통과한다.

## Boundary Exemptions

### `DataLoader.ts` — 단일 공개 클래스가 진입점 곁에 있는 정본 형태

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: 이 패키지의 `exports`는 `.` 하나뿐이고 공개 표면은 `DataLoader` 클래스 하나로 수렴한다. 유일한 공개 클래스를 organ 한 겹으로 감싸면 파일 하나짜리 배럴만 늘어날 뿐 그룹화 이득이 없어, 클래스 파일을 엔트리 포인트 곁 fractal root에 두는 것이 정본 형태다.

## Last Updated

2026-08-18 — 최초 계약 작성. #329 문서화 작업으로 신설.
