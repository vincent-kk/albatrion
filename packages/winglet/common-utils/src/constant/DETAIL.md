# constant contract

## Requirements

- 4개 파일(`function`, `time`, `typeTag`, `unit`)이 각각 하나의 상수 테마를 소유하며, 파일 간 이름 충돌이 없다.
- `time` 상수는 `MILLISECOND`(1)를 기준으로 상위 단위가 하위 단위의 정수배다: `SECOND`(1000)·`MINUTE`(60×SECOND)·`HOUR`(60×MINUTE)·`DAY`(24×HOUR).
- `typeTag` 상수는 각 대상 타입에 대해 `Object.prototype.toString.call(value)`가 실제로 반환하는 문자열과 동일한 리터럴이다.
- `unit` 상수는 10진 계열(`KILO`~`EXA`, 10의 거듭제곱)과 2진 계열(`KILO_2`~`EXA_2`, 2의 거듭제곱)을 독립적으로 제공한다.

## API Contracts

- `function` 6종: `VOID_FUNCTION`/`NULL_FUNCTION`/`FALSE_FUNCTION`/`TRUE_FUNCTION`은 인자를 무시하고 각각 `undefined`/`null`/`false`/`true`를 반환하며, `IDENTITY_FUNCTION`은 입력을 그대로 반환한다. `NOOP_FUNCTION`은 `VOID_FUNCTION`과 동일한 참조다. 6종 전부 `Object.freeze`로 동결된다.
- `time`·`typeTag`·`unit`은 함수가 아닌 원시값(숫자 또는 문자열) 상수이며 각각 5개·28개·12개다.

## Acceptance Criteria

### time-unit-arithmetic — 시간 단위 상수의 배수 관계

- `SECOND === 1000 * MILLISECOND`, `MINUTE === 60 * SECOND`, `HOUR === 60 * MINUTE`, `DAY === 24 * HOUR`가 성립한다.

### type-tag-native-parity — typeTag 상수와 getTypeTag의 일치

- `getTypeTag(null)`은 `NULL_TAG`(`'[object Null]'`)를, `getTypeTag(undefined)`는 `UNDEFINED_TAG`(`'[object Undefined]'`)를 반환한다 — `libs/__tests__/getTypeTag.test.ts`가 이 두 상수의 리터럴 값을 직접 검증하는 유일한 테스트다.

## Boundary Exemptions

### `*.ts` — flat 단일 테마 컬렉션 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: 각 파일이 하나의 상수 테마(함수·시간·타입태그·단위)를 묶은 flat 컬렉션이 정본 형태다 — 값 자체가 파일의 전체 내용이라 organ 재배치는 하위 경로만 늘리고 값의 의미를 바꾸지 못한다. zero-peer 승인은 `.filid` 설정의 scoped exempt와 쌍이다.

## Last Updated

2026-08-18 — 최초 계약 작성
