# promise contract

## Requirements

- `delay(ms?, { signal? })`는 지정한 ms 이후 resolve하는 Promise를 반환하고, `AbortSignal`로 취소하면 `AbortError`로 거부한다 — 호출 시점에 이미 abort된 signal은 타이머를 생성하지 않고 즉시 거부한다.
- `timeout(ms?, { signal? })`은 정상 경로에서 항상 `TimeoutError`로 거부한다; 취소되면 `delay`가 던진 `AbortError`를 그대로 전파한다. 정상 resolve하는 경로는 없다.
- `withTimeout(fn, ms, { signal? })`은 `fn()`과 `timeout(ms)`를 경주시켜 먼저 정착하는 쪽을 채택하고, 진 쪽의 타이머를 정리한다. `fn`이 동기적으로 throw하면 그 예외는 Promise 거부가 아니라 `withTimeout` 호출 자체의 동기 예외로 전파된다.
- `waitAndExecute(fn?, ms?)`은 지연 이후에 `fn`을 호출한다; `waitAndReturn(fn?, ms?)`은 `fn`을 즉시 호출하고 결과 전달만 지연한다. 둘 다 `fn`이 `undefined`면 `undefined`로 resolve한다.
- `waitAndExecute`/`waitAndReturn`은 `AbortSignal` 옵션을 받지 않는다.

## API Contracts

- `delay(ms = 0, options?: DelayOptions): Promise<void>` — `options.signal`이 호출 전 이미 aborted면 `AbortError('SIGNAL_RECEIVED_BEFORE_RUN', ...)`로 즉시 거부(타이머 미생성); 대기 중 abort되면 `AbortError('SIGNAL_RECEIVED', ...)`로 거부.
- `timeout(ms = 0, options?: DelayOptions): Promise<never>` — 내부적으로 `delay(ms, options)`를 await한 뒤 `TimeoutError('AFTER_DELAY', 'Timeout after ${ms}ms', { delay: ms })`를 던진다. `delay`가 취소로 거부하면 그 `AbortError`가 그대로 전파된다.
- `withTimeout<T>(fn: AsyncFn<[], T>, ms: number, options?: DelayOptions): Promise<T>` — `fn()`을 abort 리스너 등록보다 먼저 호출한다(동기 throw가 signal에 리스너를 남기지 않기 위함). 내부 `AbortController`를 만들어 외부 `signal`과 연결하고, `Promise.race([fn(), timeout(ms, { signal: internal })])` 이후 `finally`에서 외부 리스너 제거와 내부 controller abort(대기 중이던 delay 타이머 정리)를 수행한다.
- `waitAndExecute<Return>(fn: Fn<[], Return> | undefined, ms = 0): Promise<Return | undefined>` — `await delay(ms)` 후 `fn`을 호출한다.
- `waitAndReturn<Return>(fn: Fn<[], Return> | undefined, ms = 0): Promise<Return | undefined>` — `fn`을 `Promise.resolve().then(fn)`으로 즉시 시작하고 `delay(ms)`와 함께 `Promise.allSettled`로 대기한다; 첫 settled 결과(fn 쪽)가 rejected면 그 reason을 throw하고, 아니면 그 value를 반환한다. 이 방식이 대기 중인 거부를 핸들러 없이 방치하지 않는다.
- `AbortError`/`TimeoutError`는 이 fractal이 아니라 `errors`가 소유하며 각각 `BaseError`를 상속한다; 이 fractal은 둘을 개별 파일 경로로 직접 import해 소비한다(공유 배럴 경유 아님).

## Acceptance Criteria

### delay-abort-contract — delay의 AbortSignal 계약

- 100ms delay는 실측 경과 시간이 최소 99ms다.
- 대기 중 abort되면 'Abort signal received' 메시지로 거부된다.
- 호출 전 이미 abort된 signal을 넘기면 'Aborted before run' 메시지로 즉시 거부되고 `setTimeout`이 전혀 호출되지 않는다.

### timeout-always-rejects — timeout의 항상-거부 계약

- 정상 경과 시 'Timeout after {ms}ms' 메시지로 거부된다.
- 대기 중 abort되면 'Abort signal received' 메시지로 거부된다(delay의 AbortError 전파).
- 호출 전 이미 abort된 signal을 넘기면 'Aborted before run' 메시지로 거부된다.

### wait-execute-vs-return — waitAndExecute와 waitAndReturn의 실행 시점 차이

- `waitAndExecute`는 지정한 지연 이전에는 콜백을 호출하지 않고, 지연 도달 시점에 호출한다(가상 타이머로 경계 검증).
- `waitAndReturn`은 콜백을 즉시 호출하고 반환만 지연한다 — 콜백 호출 시각과 반환 시각의 차이가 최소 지정한 ms다.
- 둘 다 `fn`이 `undefined`면 `undefined`로 resolve하고, 동기·비동기 콜백과 콜백이 던진 에러를 동일하게 처리(전파)한다.

### wait-and-return-rejection-safety — waitAndReturn의 거부 지연과 안전성

- 콜백의 동기 throw는 지정한 대기 시간이 지난 뒤에만 거부로 드러난다.
- 콜백이 이미 거부된 Promise를 반환해도 대기 도중 `unhandledRejection`이 발생하지 않는다.

### with-timeout-race-cleanup — withTimeout의 경주 정리와 동기 throw 격리

- `fn`이 timeout보다 먼저 resolve하면 내부 타이머가 즉시 정리된다(반복 호출에도 타이머가 누적되지 않는다).
- `fn`이 동기적으로 throw하면 `withTimeout` 호출 자체가 그 예외로 동기적으로 throw하고, 호출자가 넘긴 signal에는 abort 리스너가 전혀 등록되지 않는다.
- `fn`이 timeout보다 오래 걸리면 'Timeout after {ms}ms'로 거부되고, 외부 signal이 timeout보다 먼저 abort되면 'Abort signal received'로 거부된다.

## Boundary Exemptions

### `*.ts` — flat 단일 함수 컬렉션 유지

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: 함수당 한 파일(`delay`/`timeout`/`withTimeout`/`waitAndExecute`/`waitAndReturn`)이 이 fractal root의 정본 형태다. 파일 간 의존(`timeout`이 `delay`를, `waitAndExecute`와 `waitAndReturn`이 `delay`를, `withTimeout`이 `timeout`을 import)이 이미 존재해 organ으로 옮겨도 이 그래프는 그대로이고 배럴 깊이만 늘어난다. 개별 함수만 필요한 소비자의 직접 import도 같은 이유로 허용된다.

## Last Updated

2026-08-18 — 최초 계약 작성
