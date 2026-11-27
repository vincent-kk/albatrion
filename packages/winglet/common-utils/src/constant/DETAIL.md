# constant contract

## Requirements

- 각 상수 테마는 이름 충돌 없이 모듈 로드 시 확정되는 값을 제공한다. 공유 빈 배열과 빈 객체는 한 번만 동결하여 반복 읽기의 참조를 유지한다.
- `time` 상수는 `MILLISECOND`(1)를 기준으로 상위 단위가 하위 단위의 정수배다: `SECOND`(1000)·`MINUTE`(60×SECOND)·`HOUR`(60×MINUTE)·`DAY`(24×HOUR).
- `typeTag` 상수는 각 대상 타입에 대해 `Object.prototype.toString.call(value)`가 실제로 반환하는 문자열과 동일한 리터럴이다.
- `unit` 상수는 10진 계열(`KILO`~`EXA`, 10의 거듭제곱)과 2진 계열(`KILO_2`~`EXA_2`, 2의 거듭제곱)을 독립적으로 제공한다.

## API Contracts

- `EMPTY_ARRAY: readonly never[]`와 `EMPTY_OBJECT: Readonly<Record<string, never>>`는 각각 원소와 자체 키가 없는 동결 값이다. 같은 모듈의 반복 import는 같은 참조를 반환한다. 빈 배열은 타입 단언 없이 모든 읽기 전용 원소 배열에 대입할 수 있다. 빈 객체는 새 코드가 공유할 불변 기본값으로 공개한다. 참조 동일성으로 구별하는 센티널에는 사용하지 않는다.

- `function` 6종: `VOID_FUNCTION`/`NULL_FUNCTION`/`FALSE_FUNCTION`/`TRUE_FUNCTION`은 인자를 무시하고 각각 `undefined`/`null`/`false`/`true`를 반환하며, `IDENTITY_FUNCTION`은 입력을 그대로 반환한다. `NOOP_FUNCTION`은 `VOID_FUNCTION`과 동일한 참조다. 6종 전부 `Object.freeze`로 동결된다.
- `time`·`typeTag`·`unit`은 함수가 아닌 원시값(숫자 또는 문자열) 상수이며 각각 5개·28개·12개다.

## Acceptance Criteria

### shared-empty-values — 동결된 공유 빈 값

- 두 값은 비어 있고 `Object.isFrozen`이 참이다.

### time-unit-arithmetic — 시간 단위 상수의 배수 관계

- `SECOND === 1000 * MILLISECOND`, `MINUTE === 60 * SECOND`, `HOUR === 60 * MINUTE`, `DAY === 24 * HOUR`가 성립한다.

### type-tag-native-parity — typeTag 상수와 getTypeTag의 일치

- `getTypeTag(null)`은 `NULL_TAG`(`'[object Null]'`)를, `getTypeTag(undefined)`는 `UNDEFINED_TAG`(`'[object Undefined]'`)를 반환한다 — `libs/__tests__/getTypeTag.test.ts`가 이 두 상수의 리터럴 값을 직접 검증하는 유일한 테스트다.

## Boundary Exemptions

### `*.ts` — flat 단일 테마 컬렉션 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: 각 파일이 하나의 상수 테마(함수·시간·타입태그·단위·빈 배열·빈 객체)를 묶은 flat 컬렉션이 정본 형태다 — 값 자체가 파일의 전체 내용이라 organ 재배치는 하위 경로만 늘리고 값의 의미를 바꾸지 못한다. zero-peer 승인은 `.filid` 설정의 scoped exempt와 쌍이다.

## Last Updated

공유 상수의 불변성 또는 공개 값 계약이 바뀌면 갱신합니다.
