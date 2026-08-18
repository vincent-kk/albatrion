# rateLimit contract

## Requirements

- `debounce(fn, ms, options?)`는 마지막 호출 후 `ms`만큼 조용한 시간이 지나야 실행된다. 연속 호출은 매번 대기 시간을 재설정한다.
- `throttle(fn, ms, options?)`는 한 시간 창(window)에 최대 한 번만 실행된다. `leading`이면 창이 시작될 때 즉시 실행되고, `trailing`이면 창이 끝날 때 그 사이 발생한 마지막 호출의 인자로 한 번 더 실행된다.
- 두 함수 모두 `signal`을 받아 예정된 실행을 취소할 수 있고, 이미 abort된 signal을 넘기면 이후 호출은 아무 효과가 없다.
- 두 함수 모두 `execute`(즉시 실행)·`clear`(예정 실행 취소)·`dispose`(취소와 리스너 해제) 제어 메서드를 노출한다.

## API Contracts

- `debounce<F>(fn, ms, { signal, leading = false, trailing = true })` → `DebouncedFn<F>`. `execute`는 대기 중인 타이머를 취소하고 마지막 인자로 즉시 실행한다.
- `throttle<F>(fn, ms, { signal, leading = true, trailing = true })` → `ThrottledFn<F>`. `execute`는 타이머를 건드리지 않고 즉시 실행만 한다.
- 두 반환 wrapper의 `dispose`는 `clear`와 동일하게 예정된 실행을 취소하고, 추가로 공유 `signal`에 등록한 abort 리스너를 제거한다.
- 공유 타이머·컨텍스트 엔진과 `ExecutionOptions` 타입은 helpers organ이 소유하며, 두 함수는 이를 통해서만 상태를 관리한다.

## Acceptance Criteria

### debounce-timing — 디바운스 타이밍과 재설정

- delay 이내에 연속 호출되면 원본 함수는 마지막 호출 기준으로 한 번만 실행된다.
- `leading: true, trailing: true`면 첫 호출은 즉시 실행되고, 이어지는 호출이 있으면 delay 이후 한 번 더 실행된다.
- `clear()` 호출 이후에는 예정된 실행이 일어나지 않는다.
- signal이 abort되면(호출 도중이든 호출 이전이든) 실행되지 않는다.

### throttle-window — 쓰로틀 윈도우와 leading/trailing

- 첫 호출은 즉시 실행되고(leading 기본값 `true`), 같은 창 안의 추가 호출은 실행되지 않는다.
- 창이 끝날 때 그 사이 호출이 있었다면 마지막 인자로 한 번 더 실행되고(trailing), 없었다면 추가 실행되지 않는다.
- 반복되는 창마다 leading·trailing 패턴이 동일하게 재현된다.
- abort된 signal이거나 실행 후 abort되면 이후 실행이 일어나지 않는다.

### ratelimit-dispose — dispose를 통한 리스너 해제

- `debounce`·`throttle` 각 wrapper의 `dispose()`는 공유 `signal`의 abort 리스너를 정확히 한 번씩 제거한다.
- `dispose()`는 예정된 실행을 `clear()`와 동일하게 취소한다.

## Boundary Exemptions

### `*.ts` — debounce/throttle flat 공개 함수 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: `debounce.ts`·`throttle.ts`는 각각 공개 함수 하나를 구현하는 flat 파일이며 어느 쪽도 fractal 디렉터리 이름(rateLimit)과 일치하지 않아 eponymous 구현 하나로 흡수되지 않는다. 공유 타이머·컨텍스트 엔진과 옵션 타입은 이미 helpers organ으로 옮겨져 있어, 남은 두 파일을 다시 organ으로 옮겨도 배럴 깊이만 늘고 소비자 경험은 바뀌지 않는다. zero-peer 승인은 `.filid` 설정의 scoped exempt와 쌍이다.

## Last Updated

2026-08-18 — 최초 계약 작성
