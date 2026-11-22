# @winglet/data-loader 버그 바운티 결과

확인된 버그는 2건입니다. 모든 항목은 실패하는 재현 테스트로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다.

재현 테스트: [`probes/winglet-data-loader/dataLoader.probe.test.ts`](probes/winglet-data-loader/dataLoader.probe.test.ts)

## 1. 문서가 권장하는 즉시 실행 스케줄러 `(fn) => fn()`을 쓰면 모든 `load()`가 영원히 끝나지 않습니다

- 심각도: 높음. 문서가 권장하는 설정에서 어떤 프로미스도 끝나지 않고, 배치 로더도 호출되지 않습니다.
- 영향받는 공개 API: `new DataLoader(fn, { batchScheduler })`, `load`, `loadMany`.
- 어긋난 계약:
  - `packages/winglet/data-loader/docs/en/SPECIFICATION.md:209`는 즉시 배치 실행용으로 `fn => fn()`을 소개하고, 411행 예제도 같은 설정을 씁니다.
  - `packages/winglet/data-loader/docs/agents/skills/data-loader-skill/knowledge/batching-and-caching.md:68`도 같은 설정을 보여 주며, 현재 동기 블록 안에서 배치를 보낸다고 설명합니다.
- 원인: `packages/winglet/data-loader/src/DataLoader.ts:253`부터 262행까지의 `__acquireBatch__`는 배치가 아직 비어 있을 때 스케줄러를 호출합니다. 동기 스케줄러는 그 빈 배치를 곧바로 처리하므로 `isResolved = true`가 되고 키가 없어 바로 끝납니다. 그다음 `load()`(424행, 436행)가 이미 처리된 배치에 키를 넣지만, 그 배치는 다시 처리되지 않습니다. 이후의 모든 `load`가 같은 일을 반복합니다.
- 재현: 테스트 "documented immediate scheduler (fn) => fn() resolves load()". 실제로는 배치 로더가 한 번도 호출되지 않고 프로미스가 200밀리초 안에 끝나지 않습니다. 기대 동작은 `[[1]]`로 한 번 호출되고 10으로 끝나는 것입니다.
- 확신도: 높음.

## 2. `prime(0, v)` 뒤의 `load(0)`이 캐시를 쓰지 않고 배치 로더를 호출합니다

- 심각도: 낮음. 문서가 일부를 설명하고 있습니다.
- 영향받는 공개 API: `0`이나 `''` 같은 falsy 키에 대한 `load`와 `prime`.
- 어긋난 계약: SKILL.md의 흔한 실수 표는 falsy 캐시 키가 "양방향 모두 캐시를 우회한다(읽기도 쓰기도 없음)"고 적고 있습니다. 그런데 `prime`과 `clear`는 그 키로 실제로 읽고 씁니다. 기본 `cacheKeyFn`은 항등 함수라서 숫자 키 `0`이면 누구든 이 경우에 걸립니다.
- 원인: `DataLoader.ts:427`과 `:440`은 `cacheMap && cacheKey`라는 참·거짓 검사를 쓰지만, `prime`은 이 검사 없이 기록합니다.
- 재현: 테스트 "prime(0) followed by load(0) is served from the cache". 실제 `'loaded-0'`, 기대 `'primed'`.
- 확신도: 높음.

## 버그가 아니라고 확인한 가설

- 배치 함수가 동기 예외를 던지거나, 프로미스가 아닌 값을 반환하거나, 결과 길이가 다르면 모든 키가 거부되고 캐시가 비워집니다. 둘 다 문서와 테스트에 있습니다.
- `load(null)`과 nil 키를 포함한 `loadMany`는 문서대로 동기 예외를 던집니다. `cacheKeyFn` 없이 객체 키를 쓰면 문서대로 참조 동일성으로 비교합니다.
- 캐시 적중은 문서대로 해당 배치가 처리될 때 끝납니다. `maxBatchSize` 분할도 올바르게 보입니다.
