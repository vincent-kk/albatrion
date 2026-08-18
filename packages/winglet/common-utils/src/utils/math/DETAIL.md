# math contract

## Requirements

- 산술·비교 프리미티브(`abs`/`clamp`/`inRange`/`isEven`/`isOdd`/`min`/`max`/`minLite`/`maxLite`/`round`)는 입력을 검증하지 않고 계산 결과를 그대로 반환하며 예외를 던지지 않는다.
- 조합론·진법 함수(`factorial`/`fibonacci`/`combination`/`permutation`/`digitSum`/`fromBase`/`toBase`)는 음수·비정수·`Infinity`/`NaN` 입력에서 함수별 고정 메시지로 `Error`를 던진다.
- `gcd`/`lcm`은 유한하지 않은 입력에 무한 루프 없이 `NaN`을 반환하고, 소수 입력은 organ의 `countDecimals`로 구한 자릿수만큼 정수로 스케일링한 뒤 계산해 되돌린다.
- 배열 통계 함수(`sum`/`mean`/`median`/`range`)는 빈 배열에 각각 `0`/`NaN`/`NaN`/`NaN`을 반환하고 예외를 던지지 않는다.
- `isClose`는 상대·절대 오차를 결합한 공식으로 비교하며 `NaN`을 서로 같다고 판단하는 등 `===` 연산자와 다른 동치 규칙을 가진다.

## API Contracts

- 정수 전제 함수(`factorial`/`fibonacci`/`combination`/`permutation`/`digitSum`/`toBase`)는 `Number.isInteger`가 아니거나 범위를 벗어나면 함수별 고정 문자열로 throw한다. `fromBase`/`toBase`는 `base`가 2~36 정수가 아니어도 별도 메시지로 throw한다.
- `round(value, precision = 0)`는 `value.toString()`의 지수 부분을 직접 이동시켜 스케일링한다 — 곱셈 방식의 이진 부동소수점 오차(`1.005 * 100`류)를 피하며, 스케일링 결과가 표현 범위를 벗어나면 원래 `value`를 반환한다.
- `gcd`/`lcm`은 `Number.isFinite`가 아닌 입력에 `NaN`을 반환하고, 소수 스케일링이 `Infinity`로 오버플로해도 `NaN`을 반환한다. 스케일링 후 자릿수가 `constant.ts`의 `MAX_FRACTION_DIGITS`(100)를 넘으면 마지막 반올림을 건너뛴다.
- `max`/`min`은 배열의 첫 요소를 초기값으로 순회 비교한다 — 이후 요소의 `NaN`은 비교가 항상 false가 되어 무시되지만 첫 요소가 `NaN`이면 그대로 유지된다(`Math.max`/`Math.min`과 다른 위치 의존적 동작).
- `isClose(left, right, epsilon = 1e-8)`는 `|left - right| <= epsilon * max(|left|, |right|, 1)`로 비교하며, `NaN`끼리는 같다고 판단하고 부호가 다른 `Infinity`는 다르다고 판단한다.

## Acceptance Criteria

### arithmetic-primitives — 산술·비교 프리미티브

- `abs`는 `Math.abs`의 별칭이며 `Infinity`·`-0` 등 특수값을 `Math.abs`와 동일하게 처리한다.
- `clamp(value, min, max)`는 `min > max`여도 예외 없이 하한 검사부터 적용하고(`clamp(5, 10, 1)` → `10`), `NaN` 입력에는 `NaN`을 반환한다.
- `inRange`는 `min`/`max` 순서를 검증하지 않고 경계값을 포함하며, `NaN`이 관련된 비교는 모두 `false`다.
- `min`/`max`는 빈 배열에 각각 `Infinity`/`-Infinity`를 반환하고 10,000개 요소 배열에서도 단일 패스로 정확한 값을 낸다.
- `round`는 `1.005`를 `1.01`로, `-1.005`를 `-1`로 반올림한다(0.5는 항상 +Infinity 방향으로 올림).

### combinatorics-and-base-conversion — 조합론·진법 변환

- `factorial`/`fibonacci`는 모듈 스코프 `Map` 캐시를 두어 동일 인자를 다시 호출해도 같은 값을 반환한다.
- `combination(n, r)`은 대칭성(`C(n,r) = C(n,n-r)`)으로 반복 횟수를 줄이고, `r > n`이면 `0`을, 음수·비정수 인자면 예외를 던진다.
- `fromBase`/`toBase`는 base 2~36을 지원하고 대소문자를 구분하지 않으며, 잘못된 자릿수·범위를 벗어난 base·빈 문자열에 각각 다른 메시지로 예외를 던진다.
- `digitSum`은 음수를 절대값으로 취급하고 비정수 입력에 예외를 던진다.

### precision-sensitive-pair-functions — gcd·lcm의 정밀도 처리

- 두 입력이 모두 정수면 유클리드 알고리즘으로 바로 계산하고, 소수가 섞이면 최대 소수 자릿수만큼 10의 거듭제곱으로 스케일링한 뒤 계산해 되돌린다.
- `1e-7`처럼 지수 표기로 출력되는 소수 입력에서도 올바른 결과를 낸다(`gcd(1e-7, 2e-7)` → `1e-7`).
- 스케일링이 오버플로하거나(`gcd(1e308, 1.5)`) 원본 입력이 유한하지 않으면 무한 루프 없이 `NaN`을 반환한다.
- `gcd(0, 0)`은 `0`, `lcm(a, 0)`은 `0`이며 두 함수 모두 부호와 무관하게 절대값 기준으로 계산한다.

### array-statistics — 배열 통계

- `sum([])`은 `0`, `mean([])`/`median([])`/`range([])`는 `NaN`을 반환한다.
- `mean`은 `sum`을, `range`는 `max`/`min`을 재사용하며 세 함수 모두 입력에 `Infinity`/`NaN`이 있으면 그 값을 그대로 전파한다.
- `median`은 배열을 정렬한 뒤 짝수 길이면 가운데 두 값의 평균을, 홀수 길이면 가운데 값을 반환한다.

### float-proximity — isClose 근접 비교

- 기본 `epsilon`은 `1e-8`이며 상대 오차(큰 수)와 절대 오차(0 근처)를 하나의 공식으로 함께 처리한다.
- `NaN`끼리는 `true`, `NaN`과 다른 값은 `false`이며, 같은 부호의 `Infinity`끼리는 `true`, 다른 부호는 `false`다.
- 세 번째 인자로 `epsilon`을 지정해 허용 오차를 조정할 수 있다.

## Boundary Exemptions

### `*.ts` — flat 단일 함수 컬렉션 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: 함수당 한 파일의 flat 컬렉션이 이 fractal의 정본 형태다 — 공개 함수 25개는 root에 남아 엔트리 포인트가 이름으로 재수출하고, 여러 함수가 공유하는 내부 전용 헬퍼(`countDecimals`)만 organ으로 분리되어 있다. organ 재배치는 배럴 깊이만 늘리고 이미 갈라놓은 공개/내부 경계를 흐리며, 배럴 경유 시 재수출 그래프가 번들에 딸려오므로 개별 파일이 필요한 소비자의 직접 import도 같은 이유로 허용된다.

## Last Updated

2026-08-18 — 최초 계약 작성
