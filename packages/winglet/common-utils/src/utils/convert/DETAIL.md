# convert contract

## Requirements

- `convertMsFromDuration(duration)`는 `ms`/`s`/`m`/`h` 네 단위의 기간 문자열을 밀리초 정수로 변환한다.
- 형식에 맞지 않는 입력(빈 문자열, 단위 누락, 알 수 없는 단위, 소수, 음수, `null`/`undefined`)은 예외를 던지지 않고 `0`을 반환한다.
- 앞뒤 공백과 숫자·단위 사이의 공백은 무시된다.

## API Contracts

- 매칭 정규식은 `^\s*(\d+)\s*(ms|s|m|h)\s*$`이며 최초 호출 시 1회 생성되어 모듈 스코프에 캐시된다.
- 단위는 대소문자를 구분한다(`MS`/`S`/`M`/`H`는 매칭되지 않는다) — 숫자는 정수만 허용된다(`1.5s`는 매칭 실패로 `0`).
- 변환 배수는 `SECOND`(1,000)·`MINUTE`(60,000)·`HOUR`(3,600,000) 상수를 사용한다.
- 정규식이 매칭하지 않거나 캡처된 단위가 위 4개 밖이면 `0`을 반환한다 — 이 함수는 어떤 입력에도 예외를 던지지 않는다.

## Acceptance Criteria

### unit-conversion — 단위별 변환

- `ms`/`s`/`m`/`h` 각 단위에서 올바른 밀리초 값을 반환한다(예: `'1h'` → `3600000`).
- 값과 단위 사이, 문자열 앞뒤의 공백을 무시하고 동일하게 변환한다.
- 캐시된 정규식이 이후 호출에서도 올바른 결과를 낸다.

### invalid-input-fallback — 잘못된 입력의 안전한 폴백

- 빈 문자열, 단위 누락(`'100'`), 숫자 누락(`'ms'`), 알 수 없는 단위(`'100x'`, `'100mms'`), 소수(`'1.5s'`), 음수(`'-5s'`)는 모두 `0`을 반환하고 예외를 던지지 않는다.
- `0ms`/`0s`/`0m`/`0h`처럼 값이 0인 유효한 입력도 `0`을 반환한다 — 폴백과 결과가 구분되지 않는 계약상의 한계다.

## Boundary Exemptions

### `convertMsFromDuration.ts` — 단일 공개 함수 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: 공개 함수가 `convertMsFromDuration` 하나뿐이라도 엔트리 포인트가 이름으로 재수출하는 공개 유닛이다 — 유일한 소비자를 위해 organ 계층을 새로 만드는 것보다 root flat이 이 fractal의 정본 형태이며, 개별 파일이 필요한 소비자의 직접 import도 같은 이유로 허용된다.

## Last Updated

2026-08-18 — 최초 계약 작성
