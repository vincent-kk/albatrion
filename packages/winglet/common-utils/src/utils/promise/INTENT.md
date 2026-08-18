# promise — Promise 기반 타이밍 프리미티브

## Purpose

`delay`·`timeout`·`withTimeout`과 지연 실행 조합자 `waitAndExecute`·`waitAndReturn` 다섯 개 함수를 소유한다. 취소 가능한 프리미티브는 모두 `delay`의 `AbortSignal` 정리 패턴(once 리스너 등록, 타이머 해제, 리스너 제거) 위에 세워지고, `timeout`은 이 패키지의 `AbortError`/`TimeoutError` 계약을 소비하는 canonical 위치다.

## Conventions

- `delay`/`timeout`/`withTimeout`은 `AbortSignal` 옵션을 받아 취소를 지원하지만, `waitAndExecute`/`waitAndReturn`은 받지 않는다 — 의도된 비대칭이다.
- `timeout()`은 절대 정상 resolve하지 않는다: delay가 정상 완료하면 `TimeoutError`, 취소되면 `delay`가 던진 `AbortError`를 그대로 전파한다.

## Boundaries

### Always do

- 새 취소 가능 프리미티브를 추가할 때 `delay`의 abort 정리 패턴(once 리스너·타이머 해제·리스너 제거)을 재사용한다
- 넘겨받은 콜백을 동기 호출하는 지점보다 먼저 외부 signal에 리스너를 등록하지 않는다 — 동기 throw가 리스너를 유령처럼 남기지 않도록 한다
- 거부 사유(`AbortError` vs `TimeoutError`)를 바꾸는 변경은 DETAIL.md를 먼저 갱신한다

### Ask first

- `waitAndExecute`·`waitAndReturn`에 `AbortSignal` 옵션 추가 — 현재의 비대칭을 깨는 공개 계약 확장이다
- `waitAndReturn`이 함수 실행과 delay를 모두 settle까지 기다리는 현재 방식(`Promise.allSettled`) 변경 — 대기 중 미처리 거부 방지가 이 방식에 의존한다

### Never do

- `withTimeout`에서 내부 `AbortController` 생성보다 먼저 `fn()`을 호출하는 순서를 바꿔, 동기 throw 시에도 외부 signal에 리스너가 남게 만드는 변경
- `timeout()`이 조건에 따라 정상 resolve하는 경로 추가
