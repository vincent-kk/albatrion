# scheduler contract

## Requirements

- `scheduleMicrotask(task)`는 현재 실행 스택 이후, 어떤 매크로태스크보다도 먼저 task를 실행한다.
- `scheduleMacrotask(callback)`은 마이크로태스크 큐가 빈 뒤 매크로태스크로 callback을 실행하고 취소 가능한 숫자 ID를 반환한다; `cancelMacrotask(id)`로 취소한다.
- `scheduleMacrotaskSafe(callback)`은 `scheduleMacrotask`와 동일한 상대 순서 계약을 지키되, `MessageChannelScheduler` 폴백 대신 항상 네이티브 `setImmediate`/`setTimeout` 계열만 쓴다.
- `scheduleNextTick(task)`은 마이크로태스크 이후 실행되지만, Node와 브라우저에서 매크로태스크(`setTimeout`)와의 상대 순서가 다르다 — Node에서는 `setTimeout(0)`보다 먼저, 브라우저 폴백에서는 이후 실행될 수 있다.
- `scheduleCancelableMacrotask`/`scheduleCancelableMacrotaskSafe`는 스케줄과 동시에 취소 함수를 반환하고, 취소 후에는 콜백이 호출되지 않는다.

## API Contracts

- `scheduleMicrotask: Fn<[task: Fn]>` — `globalThis.queueMicrotask`가 있으면 그것을 바인딩하고, 없으면 `Promise.resolve().then(task)`로 대체한다. 모듈 로드 시 1회 감지.
- `scheduleMacrotask: Fn<[callback: Fn], number>`, `cancelMacrotask: Fn<[id: number]>` — `globalThis.setImmediate`와 `globalThis.clearImmediate`가 둘 다 있으면 그 둘을 바인딩하고, 하나라도 없으면 `MessageChannelScheduler`의 `setImmediate`/`clearImmediate`(핸들러 경유)로 대체한다.
- `scheduleMacrotaskSafe: Fn<[callback: Fn], number>`, `cancelMacrotaskSafe: Fn<[id: number]>` — 위와 같은 두 심볼 동시 검사 조건이지만, 대체 경로는 `MessageChannelScheduler`가 아니라 `globalThis.setTimeout`/`clearTimeout`이다.
- `scheduleNextTick: Fn<[task: Fn]>` — 우선순위 `process.nextTick`(`Promise.resolve().then(() => nextTick(task))`로 감쌈) → `globalThis.setImmediate` → `globalThis.setTimeout`.
- `scheduleCancelableMacrotask(callback): Fn`, `scheduleCancelableMacrotaskSafe(callback): Fn` — 각각 `scheduleMacrotask`/`scheduleMacrotaskSafe` 위에 boolean 가드를 더해 취소 함수를 반환한다.

## Acceptance Criteria

### microtask-priority — scheduleMicrotask의 실행 우선순위

- 동기 코드 이후, 같은 매크로태스크 경계 이전에 실행된다.
- 여러 태스크와 중첩 스케줄(콜백 안에서 다시 스케줄)이 등록 순서를 지키며 실행된다.
- `setTimeout`보다 먼저 실행되고, async 콜백도 지원한다.

### macrotask-messagechannel-fallback — setImmediate/clearImmediate 부재 시 폴백

- `globalThis.setImmediate`/`clearImmediate`가 모두 없으면 `scheduleMacrotask`는 `MessageChannelScheduler` 기반 폴백으로 동작하고, flush 이후 마이크로태스크에서 추가로 등록한 태스크도 유실 없이 실행된다.
- 그 폴백 경로에서 마지막 대기 태스크를 취소해도 이후 새로 스케줄한 태스크는 정상 실행된다.
- `setImmediate`만 있고 `clearImmediate`가 없는 불완전한 폴리필 환경에서도 `scheduleMacrotask`/`scheduleMacrotaskSafe` 서브패스 임포트 자체가 실패하지 않는다(모듈 최상위 팩토리가 즉시 실행되므로, 여기서 던지면 서브패스 전체가 깨진다).

### macrotask-vs-microtask-order — scheduleMacrotask와 scheduleMacrotaskSafe의 상대 순서

- 두 함수 모두 동기 코드와 마이크로태스크(Promise) 이후, 더 긴 지연의 `setTimeout`보다 먼저 실행된다.
- 중첩 스케줄(콜백 안에서 다시 스케줄)도 마이크로태스크 우선순위를 지키며 실행된다.

### next-tick-platform-asymmetry — scheduleNextTick의 플랫폼별 비대칭

- 마이크로태스크·Promise 큐 이후에 실행된다.
- 현재 실행 환경(Node, `process.nextTick` 경로)에서는 동일 컨텍스트에 등록한 `setTimeout(0)`보다 먼저 실행된다 — 이 상대 순서는 계약이 아니라 관찰된 현재 환경의 결과다.

### cancelable-macrotask-guard — scheduleCancelableMacrotask의 2단계 취소 가드

- 취소 함수를 즉시 호출하면 콜백이 실행되지 않는다.
- 마이크로태스크 큐가 비워진 뒤, 실행 직전까지도 취소가 유효하다.
- 여러 스케줄을 섞어 일부만 취소해도 취소하지 않은 콜백은 정상 실행되고 순서가 유지되며, 콜백 내부의 중첩 스케줄도 지원한다.

## Boundary Exemptions

### `*.ts` — flat 스케줄러 함수 컬렉션 유지

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: `scheduleMicrotask`/`scheduleMacrotask`/`scheduleMacrotaskSafe`/`scheduleNextTick`(+ 취소 짝 함수) 각각 한 파일이 이 fractal root의 정본 형태다. `scheduleMacrotask`는 자식 fractal `MessageChannelScheduler`를 폴백으로 직접 import하는 등 파일마다 의존이 달라, organ으로 묶어도 이 그래프는 그대로이고 배럴 깊이만 늘어난다. 개별 함수만 필요한 소비자의 직접 import도 같은 이유로 허용된다.

## Last Updated

2026-08-18 — 최초 계약 작성
