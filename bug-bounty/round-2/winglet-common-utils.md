# @winglet/common-utils 버그 바운티 2라운드 결과

2라운드에서 새로 확인된 문제는 9건입니다. 1라운드 문서([`../round-1/winglet-common-utils.md`](../round-1/winglet-common-utils.md))의 7건은 고쳐진 것으로 보고 제외했습니다. 모든 항목은 실패하는 재현 테스트나 타입 검사로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다.

재현 테스트: [`probes/winglet-common-utils/`](probes/winglet-common-utils/)

- `probes.test.ts`: 1번부터 8번까지의 재현입니다. 테스트 14개 중 9개가 실패합니다.
- `browserConsumer.ts`와 `tsconfig.browser-consumer.json`: 9번의 재현입니다. `yarn workspace @winglet/common-utils exec tsc -p src/__bounty__/r2-release/tsconfig.browser-consumer.json`으로 실행합니다.
- `differential.test.ts`, `graph.test.ts`: 통과하는 대조 테스트입니다(아래 "버그가 아니라고 확인한 가설" 참고).
- 실행하려면 파일을 `packages/winglet/common-utils/src/__bounty__/<폴더>/`에 복사합니다. 테스트 파일은 `r2-common-utils/`, 9번의 두 파일은 `r2-release/`에 둡니다.

원인 파일 위치: `packages/winglet/common-utils/src/`

## 1. `removeUndefined`와 `sortObjectKeys`가 자기 키 `__proto__`를 데이터로 복사하지 않고 결과 객체의 프로토타입을 바꿉니다

- 심각도: 중간. 파싱된 JSON 입력에서 키 하나가 사라지고, 결과 객체가 입력이 정한 프로토타입을 상속합니다. 예를 들어 `result.polluted === true`가 됩니다. 전역 `Object.prototype` 오염은 아닙니다.
- 영향받는 공개 API: `removeUndefined`, `sortObjectKeys` (패키지 루트와 `object` 하위 경로).
- 어긋난 계약: `utils/object/INTENT.md:11`은 예약 멤버 이름을 자기 데이터 속성으로 다루고, 쓰기가 `__proto__` setter를 실행하지 않으며, 어떤 경로에서도 대상의 프로토타입을 바꾸지 않는다고 적고 있습니다. 같은 파일 28행의 Never do 항목도 `__proto__` 대입으로 프로토타입을 바꾸는 쓰기를 금지합니다.
- 원인: `removeUndefined.ts:304`, 308행과 `sortObjectKeys.ts:273`, 280행, 291행이 일반 `{}`에 `result[k] = value`로 대입합니다. 키가 `__proto__`이면 이 대입이 `Object.prototype`의 `__proto__` setter를 실행합니다. 같은 모듈의 `setDataProperty`, `transformKeys`, `transformValues`는 이 경우를 올바르게 처리합니다.
- 1라운드와의 관계: 1라운드 `clone` 항목(상속된 setter를 거친 대입)과 같은 종류이지만, 다른 함수입니다.
- 재현: "removeUndefined keeps an own __proto__ key…", "sortObjectKeys keeps an own __proto__ key…". 결과의 프로토타입이 `{ polluted: true }`이고, 기대값은 `Object.prototype`입니다.
- 확신도: 높음.

## 2. `getTrackableHandler`에서 구독자가 시작 알림 중 예외를 던지면 `pending`이 `true`에 영구히 고정됩니다

- 심각도: 중간. 기본값 `preventConcurrent: true`에서는 이후 모든 호출이 원본 함수를 실행하지 않고 조용히 `undefined`를 반환하므로, 핸들러가 영구히 막힙니다. `@canard/schema-form`의 Form 컴포넌트가 이 함수를 씁니다.
- 영향받는 공개 API: `getTrackableHandler` (패키지 루트와 `function` 하위 경로).
- 어긋난 계약: `getTrackableHandler.ts:283`의 JSDoc은 오류 여부와 상관없이 모든 정리가 `finally` 블록에서 일어난다고 적고 있습니다.
- 원인: `getTrackableHandler.ts:426`에서 `pending = true`로 바꾼 뒤 427행에서 `publish()`를 호출하는데, 이 호출이 `try`/`finally` 바깥에 있습니다. 리스너가 예외를 던지면 `pending = false`를 실행하는 440행의 `finally`에 도달하지 못합니다. 실행 뒤 알림 쪽의 같은 문제는 이미 보호되어 있는데, 시작 알림 쪽에는 같은 보호가 없습니다.
- 1라운드와의 관계: 새로운 종류입니다.
- 재현: "a subscriber that throws on the start notification does not leave pending stuck". 실제 `pending`은 `true`이고, 기대값은 `false`입니다.
- 확신도: 높음.

## 3. `Murmur3`에 Latin-1 범위를 벗어난 문자열을 나눠 넣으면 한 번에 넣은 결과와 해시가 달라집니다

- 심각도: 중간에서 낮음. 증분 해시를 캐시 키로 쓰면 같은 데이터가 다른 키로 매핑됩니다. 한글이나 이모지가 들어간 문자열이 해당합니다.
- 영향받는 공개 API: `Murmur3#hash`의 문자열 입력.
- 어긋난 계약: `utils/hash/DETAIL.md:5`와 24행 이하의 증분 해싱 기준은, 여러 번 나눠 `hash()`한 결과가 한 번에 처리한 결과와 같다고 적고 있습니다.
- 원인: 4글자 블록 경로(`murmur3.ts:211`, 223행, 235행, 247행)는 16비트 문자 코드를 겹치는 비트 위치에 `|`로 합칩니다. 꼬리 바이트 경로와 이전 호출의 나머지를 이어 받는 경로(159행부터 180행, 그리고 꼬리 처리 블록)는 `^`로 합칩니다. ASCII에서는 비트가 겹치지 않아 결과가 같지만, 0xFF를 넘는 문자 코드에서는 결과가 갈립니다.
- 1라운드와의 관계: 새로운 종류입니다.
- 재현: "a non-Latin-1 string hashed in two calls equals the one-shot hash". 실제 2686310960, 기대 484018331. ASCII 대조 테스트는 통과합니다.
- 확신도: 높음.

## 4. `combination`이 결과가 안전한 정수 범위 안에 있는데도 틀린 값을 반환합니다

- 심각도: 중간에서 낮음. 계산 결과가 조용히 틀립니다.
- 영향받는 공개 API: `combination`.
- 어긋난 계약: `combination.ts:6`의 JSDoc은 이항계수가 안전한 정수 범위 안에 있는 동안 결과가 정확하다고 약속합니다.
- 원인: `combination.ts:68`, 69행이 `result *= n - i; result /= i + 1`로 부동소수 곱셈과 나눗셈을 번갈아 합니다. 중간값이 정수가 아니게 되면서 반올림 오차가 쌓이고, 마지막 `Math.round`로는 오차 1을 되돌리지 못합니다.
- 1라운드와의 관계: 새로운 종류입니다.
- 재현: "combination is exact while the true result is a safe integer". `C(56,23)`부터 `C(56,27)`까지 다섯 값이 모두 1씩 틀립니다. 예를 들어 `C(56,23)`은 3167295784216201을 반환하는데, 정확한 값은 3167295784216200이고 `Number.MAX_SAFE_INTEGER`보다 작습니다.
- 확신도: 높음.

## 5. `getTrackableHandler`에서 `preventConcurrent: false`이면, 다른 호출이 아직 실행 중인데 먼저 끝난 호출이 `pending`을 `false`로 바꿉니다

- 심각도: 낮음에서 중간. 병렬 실행을 허용한 상태에서 로딩 표시가 너무 일찍 꺼집니다.
- 영향받는 공개 API: `getTrackableHandler`의 `pending` 속성.
- 어긋난 계약: `getTrackableHandler.ts:266`은 `pending`이 함수가 지금 실행 중인지를 나타낸다고 적고 있고, JSDoc은 병렬 실행 용도로 `preventConcurrent: false`를 권장합니다.
- 원인: 진행 중인 호출 수를 세지 않고 불리언 하나(358행)를 두며, 각 호출의 `finally`(440행)가 그 값을 무조건 `false`로 바꿉니다.
- 1라운드와의 관계: 새로운 종류입니다.
- 재현: "with preventConcurrent false, pending stays true while another call is running". 두 번째 호출이 실행 중인데 실제 `pending`은 `false`이고, 기대값은 `true`입니다.
- 확신도: 높음.

## 6. `convertMsFromDuration(null)`과 `convertMsFromDuration(undefined)`가 `0`을 반환하지 않고 `TypeError`를 던집니다

- 심각도: 낮음. 문서가 약속한 대체 동작 대신 예외가 납니다.
- 영향받는 공개 API: `convertMsFromDuration`.
- 어긋난 계약: `utils/convert/DETAIL.md:6`은 `null`과 `undefined`에 `0`을 반환한다고 적고, API Contracts 절은 어떤 입력에도 예외를 던지지 않는다고 적고 있습니다.
- 원인: `convertMsFromDuration.ts:284`가 타입을 확인하지 않고 `duration.match(...)`를 호출합니다.
- 1라운드와의 관계: 새로운 종류입니다(문서와 동작의 불일치).
- 재현: "returns 0 for null and undefined instead of throwing". 실제로 "Cannot read properties of null (reading 'match')" 예외가 납니다.
- 확신도: 높음.

## 7. `isEmpty`가 다른 realm에서 만든 Map이나 Set은 값이 들어 있어도 비어 있다고 판정합니다

- 심각도: 낮음. iframe이나 `vm`에서 넘어온 컬렉션에서만 일어납니다.
- 영향받는 공개 API: `isEmpty`.
- 어긋난 계약: `isEmpty.ts:442`의 코드 주석은 태그 기반 판별이라 다른 realm의 컬렉션도 인식한다고 적고 있고, `DETAIL.md`는 Map과 Set을 `size`로 판단한다고 적고 있습니다.
- 원인: `isMap.ts:213`과 `isSet`이 `instanceof`를 쓰므로 다른 realm의 객체에서는 `false`가 나옵니다. 그 결과 자기 열거 키 검사로 넘어가는데, Map과 Set에는 자기 키가 없어 비어 있다고 판정됩니다.
- 1라운드와의 관계: 새로운 종류입니다.
- 재현: "a populated Map and Set from another realm are not empty". 실제 `true`, 기대 `false`.
- 확신도: 동작은 높음. 근거가 되는 계약이 코드 주석과 `DETAIL.md`뿐이라 심각도를 낮게 잡았습니다.

## 8. `fromBase('-', 10)`이 예외를 던지지 않고 `-0`을 반환합니다

- 심각도: 낮음.
- 영향받는 공개 API: `fromBase`.
- 어긋난 계약: `utils/math/DETAIL.md`의 진법 변환 기준은 잘못된 자릿수와 빈 문자열에 예외를 던진다고 적고 있습니다. 부호만 있고 숫자가 없는 입력은 유효한 숫자가 아닙니다.
- 원인: `fromBase.ts:74`, 75행이 `-`를 떼어 낸 뒤 남은 문자열이 비었는지 다시 확인하지 않아, 반복문이 한 번도 돌지 않고 `-0`이 반환됩니다.
- 1라운드와의 관계: 새로운 종류입니다.
- 재현: "fromBase rejects a lone minus sign as an invalid value".
- 확신도: 높음.

## 9. 선언 파일이 Node의 `Buffer` 타입을 요구해, 브라우저용 TypeScript 소비자의 타입 검사가 실패합니다

- 심각도: 낮음. `skipLibCheck: false`이고 `@types/node`가 없는 환경에서만 드러납니다. 런타임은 `globalThis.Buffer`를 읽으므로 안전합니다.
- 영향받는 공개 API: 패키지 루트 선언 전체(루트 엔트리에서 `isBuffer` 선언에 도달합니다).
- 어긋난 계약: `README.md:104`부터 107행은 지원 환경으로 최신 브라우저를 적고 있습니다.
- 원인: `utils/filter/isBuffer.ts:358`이 `value is Buffer`를 선언하고, 이것이 `dist/utils/filter/isBuffer.d.ts:356`으로 그대로 나갑니다.
- 1라운드와의 관계: 새로운 종류입니다(배포 산출물 검사에서 발견).
- 재현: `types: []`, lib ES2022와 DOM, `skipLibCheck: false` 설정으로 타입 검사하면 `TS2591 Cannot find name 'Buffer'`가 납니다.
- 확신도: 높음.

## 버그가 아니라고 확인한 가설

- `toBase`는 안전한 정수 4,000여 개와 진법 6가지의 조합 전부에서 `BigInt#toString`과 같은 결과를 냅니다. 안전한 정수 범위를 벗어난 입력이 틀리는 것은 JSDoc에 적힌 한계입니다.
- `gcd`와 `lcm`은 소수점 1자리부터 4자리까지의 소수 3,000쌍에서 정확한 유리수 계산과 일치합니다.
- `round`는 무작위 입력 2만 건에서 lodash `round`와 일치합니다. `-0`의 부호가 사라지는 차이 하나는 계약이 없어 보고하지 않았습니다.
- `median`과 `range`의 `NaN` 처리는 문서에 적힌 대로이고, 기존 테스트도 그 동작을 고정하고 있습니다.
- `difference`, `unique`, `uniqueBy`, `chunk`, `at`, `groupBy`는 `-0`, `NaN`, `null`, `undefined`가 섞인 입력 2,000건에서 lodash와 일치합니다.
- `*Lite` 계열의 `NaN` 처리, `chunk`의 크기 검사, `sortWithReference`의 중복 값 처리, `isArrayIndex`의 선행 0 허용, `isArrayLike`가 희소 배열에 `false`를 반환하는 것은 문서에 적힌 동작입니다.
- `hasUndefined`는 10만 단계 중첩에서도 스택 오버플로가 없습니다.
- `convertMsFromDuration`은 공백 20만 자 입력에서도 정규식이 비정상적으로 느려지지 않습니다.
- `stringifyGraph`와 `parseGraph`는 무작위 데이터 800건(희소 배열, `-0`, `NaN`, `BigInt`, `Date`, `RegExp`, null 프로토타입 객체, `__proto__`와 `constructor` 키), 순환 참조와 공유 참조, 1만 단계 중첩을 모두 보존합니다.
- `fingerprint` 계열의 모호성과 Map, Set 참조 비교는 문서에 적힌 범위 안입니다.
- `Murmur3`의 바이트 입력 경로는 참조 구현과 비교한 무작위 1,500건에서 모두 일치합니다.
- `polynomialHash('x', Infinity)`가 `RangeError`를 던지지만, 비현실적인 입력이라 보고하지 않았습니다.
- ESM과 CommonJS 빌드는 모든 하위 경로에서 같은 이름을 내보냅니다.
