# @winglet/common-utils — 명세서

**버전:** 0.10.0
**설명:** JavaScript/TypeScript 프로젝트용 공통 유틸리티 함수 모음
**라이선스:** MIT
**의존성:** 없음 (런타임 외부 의존성 없음)
**ES 타겟:** ES2020
**Node.js:** 14.0.0+

---

## 설치

```bash
npm install @winglet/common-utils
# 또는
yarn add @winglet/common-utils
```

---

## 빠른 시작

```typescript
// 전체 패키지 임포트
import { chunk, isNil, clone, delay, debounce } from '@winglet/common-utils';

// 서브패스 임포트 (트리쉐이킹 최적화를 위해 권장)
import { chunk, unique, groupBy } from '@winglet/common-utils/array';
import { isNil, isEmpty, isPlainObject } from '@winglet/common-utils/filter';
import { clone, merge, equals, transformKeys } from '@winglet/common-utils/object';
import { delay, withTimeout } from '@winglet/common-utils/promise';
import { debounce, throttle } from '@winglet/common-utils/function';
```

---

## 서브패스 익스포트

| 서브패스 | 설명 |
|---|---|
| `@winglet/common-utils` | 모든 유틸리티 |
| `@winglet/common-utils/array` | 배열 조작 |
| `@winglet/common-utils/filter` | 타입 가드 및 술어 |
| `@winglet/common-utils/object` | 객체 조작 |
| `@winglet/common-utils/promise` | 비동기/Promise 유틸리티 |
| `@winglet/common-utils/scheduler` | 태스크 스케줄링 |
| `@winglet/common-utils/function` | 함수 향상 |
| `@winglet/common-utils/math` | 수학 유틸리티 |
| `@winglet/common-utils/hash` | 해시 알고리즘 |
| `@winglet/common-utils/convert` | 변환 유틸리티 |
| `@winglet/common-utils/error` | 커스텀 에러 클래스 |
| `@winglet/common-utils/constant` | 상수 |
| `@winglet/common-utils/lib` | 핵심 라이브러리 유틸리티 |
| `@winglet/common-utils/console` | 콘솔 유틸리티 |

---

## API 레퍼런스

### 배열 유틸리티 (`/array`)

#### at
```typescript
at(array: readonly Type[], indexes: number | number[]): Type | Type[]
```
인덱스로 배열 요소에 접근합니다. 음수 인덱스(끝에서부터)를 지원합니다. 단일 숫자면 `Type`, 숫자 배열이면 `Type[]`을 반환합니다.

#### chunk
```typescript
chunk<Type>(array: Type[], size: number): Type[][]
```
배열을 최대 `size`개 요소의 서브배열로 분할합니다. `size`가 양의 정수가 아니면 `[array]`를 반환합니다.

```typescript
chunk([1,2,3,4,5], 2); // [[1,2],[3,4],[5]]
```

#### difference / differenceBy / differenceWith / differenceLite
```typescript
difference<Type>(source: Type[], exclude: Type[]): Type[]
differenceBy<Type>(source: Type[], exclude: Type[], iteratee: (item: Type) => unknown): Type[]
differenceWith<Type>(source: Type[], exclude: Type[], comparator: (a: Type, b: Type) => boolean): Type[]
differenceLite<Type>(source: Type[], exclude: Type[]): Type[]  // 100개 미만 배열에 최적화
```
`source`에서 `exclude`에 없는 요소를 반환합니다. 표준 버전은 O(n + m), Lite 버전은 O(n*m).

#### filter
```typescript
filter<Type>(array: Type[], predicate: (item: Type, index: number, array: Type[]) => boolean): Type[]
```
술어가 true를 반환하는 요소를 반환합니다.

#### forEach / forEachDual / forEachReverse
```typescript
forEach<Type>(array: Type[], callback: (item: Type, index: number, array: Type[]) => void): void
forEachDual<A, B>(arrayA: A[], arrayB: B[], callback: (a: A, b: B, index: number) => void): void
forEachReverse<Type>(array: Type[], callback: (item: Type, index: number, array: Type[]) => void): void
```
순회 유틸리티. `forEachDual`은 더 짧은 배열의 길이에서 중단됩니다.

#### groupBy
```typescript
groupBy<Type, Key extends PropertyKey>(array: Type[], getKey: (item: Type) => Key): Record<Key, Type[]>
```
계산된 키로 요소를 그룹화합니다. 그룹 내 요소 순서를 유지합니다.

```typescript
groupBy([1,2,3,4,5,6], n => n % 2 === 0 ? 'even' : 'odd');
// { odd: [1,3,5], even: [2,4,6] }
```

#### intersection / intersectionBy / intersectionWith / intersectionLite
```typescript
intersection<Type>(source: Type[], target: Type[]): Type[]
```
두 배열 모두에 존재하는 요소를 반환합니다. source의 중복 요소는 target에 있으면 유지됩니다.

#### map
```typescript
map<Type, Result>(array: Type[], callback: (item: Type, index: number, array: Type[]) => Result): Result[]
```
각 요소를 변환합니다. 결과 배열을 미리 할당합니다.

#### sortWithReference
```typescript
sortWithReference<Value>(source: Value[], reference?: Value[]): Value[]
```
`reference`에 정의된 순서로 `source`를 정렬합니다. `reference`에 없는 요소는 끝에 추가됩니다.

```typescript
sortWithReference(['c','a','b','d'], ['a','b','c']); // ['a','b','c','d']
```

#### unique / uniqueBy / uniqueWith
```typescript
unique<Type>(source: Type[]): Type[]
uniqueBy<Type>(source: Type[], iteratee: (item: Type) => unknown): Type[]
uniqueWith<Type>(source: Type[], comparator: (a: Type, b: Type) => boolean): Type[]
```
중복 요소를 제거합니다. `unique`는 SameValueZero 동등성 사용. 객체는 참조로 비교됩니다.

---

### 필터 / 타입 가드 유틸리티 (`/filter`)

모든 함수는 별도 표시가 없으면 TypeScript 타입 가드입니다.

| 함수 | 설명 |
|---|---|
| `isNil(v)` | `null` 또는 `undefined`이면 true |
| `isNotNil(v)` | null/undefined가 아니면 true (타입 좁힘) |
| `isNull(v)` | `null`이면 true |
| `isUndefined(v)` | `undefined`이면 true |
| `isEmpty(v)` | null, undefined, falsy 원시값, 빈 객체/배열이면 true |
| `isEmptyArray(v)` | 빈 배열이면 true |
| `isEmptyObject(v)` | 열거 가능한 자체 속성이 없는 객체이면 true |
| `isTruthy(v)` | truthy 값이면 true |
| `isFalsy(v)` | falsy 값이면 true (`null`, `undefined`, `false`, `0`, `0n`, `''`, `NaN`) |
| `isString(v)` | 문자열이면 true |
| `isNumber(v)` | 숫자이면 true (NaN 포함) |
| `isBoolean(v)` | 불리언이면 true |
| `isInteger(v)` | 안전한 정수이면 true |
| `isObject(v)` | null이 아닌 객체이면 true |
| `isPlainObject(v)` | 순수 객체 `{}`이면 true |
| `isFunction(v)` | 함수이면 true |
| `isArray(v)` | 배열이면 true |
| `isArrayLike(v)` | 배열 유사 객체이면 true (숫자 length 속성 보유) |
| `isMap(v)` | Map 인스턴스이면 true |
| `isSet(v)` | Set 인스턴스이면 true |
| `isDate(v)` | Date 인스턴스이면 true |
| `isRegex(v)` | RegExp 인스턴스이면 true |
| `isError(v)` | Error 인스턴스이면 true |
| `isPromise(v)` | Promise 인스턴스이면 true |
| `isArrayBuffer(v)` | ArrayBuffer 인스턴스이면 true |
| `isTypedArray(v)` | TypedArray 인스턴스이면 true |
| `isBlob(v)` | Blob 인스턴스이면 true |
| `isFile(v)` | File 인스턴스이면 true |
| `isCloneable(v)` | `clone()`으로 복제 가능하면 true |
| `isValidRegexPattern(v)` | 유효한 정규식 패턴 문자열이면 true |

---

### 객체 유틸리티 (`/object`)

#### clone
```typescript
clone<Type>(target: Type, maxDepth?: number): Type
```
완전한 깊은 복제. Date, RegExp, Map, Set, TypedArray, Error, 순환 참조, Symbol 속성을 처리합니다. `maxDepth`로 재귀 깊이를 제한합니다.

```typescript
const copy = clone({ a: 1, b: new Date(), c: new Map() });
// 완전히 독립된 복사본

// 순환 참조 안전
const obj: any = { name: 'root' };
obj.self = obj;
const cloned = clone(obj); // 스택 오버플로우 없음
```

#### cloneLite
```typescript
cloneLite<Type>(target: Type): Type
```
순수 객체/배열과 원시값만 있는 단순 구조에 최적화된 빠른 깊은 복제. Date/Map/Set/순환 참조 미지원.

#### shallowClone
```typescript
shallowClone<Type>(target: Type): Type
```
배열 또는 순수 객체의 얕은 복사.

#### merge
```typescript
merge<Target, Source>(target: Target, source: Source): Target & Source
```
깊은 재귀 병합. **`target`을 직접 수정합니다.** 배열은 연결(concatenation)됩니다. 순환 참조 보호 없음.

```typescript
merge({ a: 1, b: { x: 10 } }, { b: { y: 20 }, c: 3 });
// { a: 1, b: { x: 10, y: 20 }, c: 3 }

merge({ tags: ['a'] }, { tags: ['b'] });
// { tags: ['a', 'b'] }  ← 배열 연결
```

#### equals
```typescript
equals<L, R>(left: L, right: R, omit?: Set<PropertyKey> | PropertyKey[]): boolean
```
깊은 동등성 비교. NaN을 올바르게 처리합니다. **순환 참조 미지원** (스택 오버플로우 위험).

```typescript
equals({ a: 1 }, { a: 1 }); // true
equals(user1, user2, ['updatedAt']); // updatedAt 제외하고 비교
```

#### stableEquals
```typescript
stableEquals<L, R>(left: L, right: R): boolean
```
순환 참조 안전한 깊은 동등성. 모든 타입 지원. `equals`보다 약 2배 느림.

#### transformKeys
```typescript
transformKeys<Type, Key extends PropertyKey>(
  object: Type,
  getKey: (value, key, object) => Key
): Record<Key, ...>
```
모든 키를 변환한 새 객체를 반환합니다. 값은 변경 없음.

```typescript
// snake_case → camelCase
transformKeys(apiResponse, (_, key) =>
  key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
);
```

#### transformValues
```typescript
transformValues<Type, Value>(object: Type, getValue: (value, key, object) => Value): Record<keyof Type, Value>
```
모든 값을 변환한 새 객체를 반환합니다. 키는 변경 없음.

#### 기타 객체 유틸리티

| 함수 | 설명 |
|---|---|
| `countKey(obj)` | 상속 포함 모든 열거 가능 속성 수 |
| `countObjectKey(obj)` | 자체 열거 가능 속성 수 |
| `getEmptyObject()` | `Object.create(null)` 생성 |
| `getFirstKey(obj)` | 첫 번째 자체 열거 가능 키 |
| `getJSONPointer(obj, pointer)` | JSON Pointer로 값 조회 |
| `getObjectKeys(obj)` | 더 나은 타입의 `Object.keys` |
| `getSymbols(obj)` | 자체 Symbol 속성 배열 |
| `hasUndefined(obj)` | 자체 속성 중 undefined가 있으면 true |
| `removePrototype(obj)` | 프로토타입 체인 제거 (in-place) |
| `removeUndefined(obj)` | undefined 값 속성 제거 후 새 객체 반환 |
| `sortObjectKeys(obj)` | 키가 알파벳 순으로 정렬된 새 객체 반환 |

---

### Promise 유틸리티 (`/promise`)

#### delay
```typescript
delay(ms?: number, options?: { signal?: AbortSignal }): Promise<void>
```
`ms` 밀리초 후 resolve되는 Promise (기본값: 0). signal이 중단되면 `AbortError`를 throw합니다.

```typescript
await delay(1000); // 1초 대기

// 취소 가능한 딜레이
const controller = new AbortController();
try {
  await delay(5000, { signal: controller.signal });
} catch (e) {
  if (e instanceof AbortError) console.log('취소됨');
}
```

#### withTimeout
```typescript
withTimeout<T>(fn: () => Promise<T>, ms: number, options?: { signal?: AbortSignal }): Promise<T>
```
비동기 함수에 타임아웃을 추가합니다. `Promise.race`를 사용합니다. 시간 초과 시 `TimeoutError`를 throw합니다.

```typescript
try {
  const data = await withTimeout(() => fetchData(), 5000);
} catch (e) {
  if (e instanceof TimeoutError) console.log('5초 타임아웃');
}
```

#### waitAndExecute
```typescript
waitAndExecute<T>(ms: number, fn: () => T): Promise<T>
```
`ms` 밀리초 대기 후 함수를 실행하여 결과를 반환합니다.

#### waitAndReturn
```typescript
waitAndReturn<T>(ms: number, value: T): Promise<T>
```
`ms` 밀리초 대기 후 값으로 resolve합니다.

---

### 스케줄러 유틸리티 (`/scheduler`)

#### 이벤트 루프 실행 순서

```
동기 코드
  → 마이크로태스크 (scheduleMicrotask)
  → 넥스트 틱 (scheduleNextTick)
  → 매크로태스크 (scheduleMacrotask)
  → setTimeout(0)
  → 브라우저 렌더링
```

#### scheduleMicrotask
```typescript
scheduleMicrotask(task: () => void): void
```
마이크로태스크 큐에 등록합니다. 매크로태스크보다 먼저 실행됩니다. 네이티브 `queueMicrotask` 사용 또는 Promise 폴백.

#### scheduleNextTick
```typescript
scheduleNextTick(task: () => void): void
```
다음 이벤트 루프 틱으로 실행을 지연합니다. Node.js에서는 `process.nextTick` 사용, 브라우저에서는 `setImmediate` 또는 `setTimeout(0)`.

#### scheduleMacrotask / cancelMacrotask / scheduleCancelableMacrotask
```typescript
scheduleMacrotask(callback: () => void): number
cancelMacrotask(id: number): void
scheduleCancelableMacrotask(callback: () => void): () => void  // 취소 함수 반환
```
매크로태스크를 스케줄링/취소합니다. Node.js에서는 네이티브 `setImmediate`, 브라우저에서는 `MessageChannelScheduler` 사용 (`setTimeout(0)`보다 빠름, 자동 배치 최적화).

---

### 함수 유틸리티 (`/function`)

#### debounce
```typescript
debounce<F>(
  fn: F,
  ms: number,
  options?: { signal?: AbortSignal; leading?: boolean; trailing?: boolean }
): DebouncedFn<F>
```
마지막 호출 후 `ms` 밀리초가 지날 때까지 실행을 지연합니다. 기본값: `leading: false, trailing: true`.

반환된 함수는 `.execute()` (즉시 실행), `.clear()` (예약 취소) 메서드를 가집니다.

```typescript
// 기본값: trailing만 — 입력 후 조용해지면 실행
const debouncedSearch = debounce(searchFn, 300);

// leading만 — 즉시 실행, 500ms 동안 추가 호출 무시
const leadingDebounce = debounce(logAction, 500, { leading: true, trailing: false });
```

**throttle과의 차이:**
- **debounce:** 활동이 _멈출 때까지_ 실행을 지연
- **throttle:** 활동 _중에_ 일정 간격으로 실행

#### throttle
```typescript
throttle<F>(
  fn: F,
  ms: number,
  options?: { signal?: AbortSignal; leading?: boolean; trailing?: boolean }
): ThrottledFn<F>
```
`ms` 밀리초마다 최대 한 번 실행을 제한합니다. 기본값: `leading: true, trailing: true`.

```typescript
// ~60fps 스크롤 핸들러
const throttledScroll = throttle(handleScroll, 16);

// API 요청 제한 — 초당 최대 1회
const throttledAPI = throttle(sendRequest, 1000);
```

#### getTrackableHandler
```typescript
getTrackableHandler(fn, options): TrackableHandler
```
비동기 함수를 상태 추적, 로딩 감지, 구독 지원으로 래핑합니다.

```typescript
const trackableFetch = getTrackableHandler(fetchUser, {
  preventConcurrent: true,   // 실행 중 중복 호출 무시
  initialState: { loading: false },
  beforeExecute: (args, state) => state.update({ loading: true }),
  afterExecute: (args, state) => state.update({ loading: false }),
});

const unsubscribe = trackableFetch.subscribe(() => {
  console.log('상태 변경:', trackableFetch.state);
});

await trackableFetch('user-123');
unsubscribe();
```

---

### 수학 유틸리티 (`/math`)

| 함수 | 설명 |
|---|---|
| `abs(n)` | 절댓값 |
| `clamp(n, min, max)` | 범위 내로 제한 |
| `round(n, decimals?)` | 소수점 자릿수로 반올림 |
| `sum(arr)` | 배열 합계 |
| `mean(arr)` | 산술 평균 |
| `median(arr)` | 중앙값 |
| `range(arr)` | 최댓값 - 최솟값 |
| `min(arr)` | 배열 최솟값 |
| `max(arr)` | 배열 최댓값 |
| `minLite(a, b)` | 두 값 중 더 작은 값 |
| `maxLite(a, b)` | 두 값 중 더 큰 값 |
| `inRange(n, min, max)` | min ≤ n ≤ max이면 true |
| `isClose(a, b, tol?)` | 허용 오차 내 부동소수점 비교 |
| `isEven(n)` | 짝수이면 true |
| `isOdd(n)` | 홀수이면 true |
| `isPrime(n)` | 소수이면 true |
| `gcd(a, b)` | 최대공약수 |
| `lcm(a, b)` | 최소공배수 |
| `digitSum(n)` | 각 자릿수의 합 |
| `factorial(n)` | 팩토리얼 (캐싱 포함) |
| `fibonacci(n)` | 피보나치 수 (캐싱 포함) |
| `combination(n, r)` | 조합 수 (n C r) |
| `permutation(n, r)` | 순열 수 (n P r) |
| `toBase(n, base)` | 10진수를 2–36진수 문자열로 변환 |
| `fromBase(s, base)` | 2–36진수 문자열을 10진수로 변환 |

---

### 해시 유틸리티 (`/hash`)

#### Murmur3
비암호화 32비트 해시 (MurmurHash3). `string`, `ArrayBuffer`, `Uint8Array` 입력 지원.

```typescript
// 정적 단발 해시
const hash = Murmur3.hash('hello world');   // 32비트 정수

// 증분 해시 (체이닝)
const hasher = new Murmur3();
hasher.hash('part1').hash('part2');
const result = hasher.result();
```

보안에 민감한 용도(비밀번호, 토큰)에는 사용하지 마세요.

#### polynomialHash
```typescript
polynomialHash(target: string, length?: number): string
```
Java의 `String.hashCode()` 방식 해시를 base36 문자열로 반환합니다. 기본 길이 7, 최대 7.

```typescript
polynomialHash('cache-key');    // '2g4k8f1'
polynomialHash('cache-key', 4); // '2g4k'
```

---

### 변환 유틸리티 (`/convert`)

#### convertMsFromDuration
```typescript
convertMsFromDuration(duration: string): number
```
사람이 읽을 수 있는 기간 문자열을 밀리초로 변환합니다. 잘못된 입력에는 `0`을 반환합니다 (예외 발생 없음).

| 단위 | 의미 | 예시 | 결과 |
|------|------|------|------|
| `ms` | 밀리초 | `'500ms'` | `500` |
| `s` | 초 | `'5s'` | `5000` |
| `m` | 분 | `'30m'` | `1800000` |
| `h` | 시간 | `'2h'` | `7200000` |

```typescript
convertMsFromDuration('5s');      // 5000
convertMsFromDuration(' 30 m '); // 1800000 (공백 허용)
convertMsFromDuration('1.5s');   // 0 (소수점 미지원)
convertMsFromDuration('5S');     // 0 (대소문자 구분)
```

---

### 에러 클래스 (`/error`)

| 클래스 | throw 주체 | 부모 클래스 |
|---|---|---|
| `BaseError` | (추상) | `Error` |
| `AbortError` | `delay()`, `withTimeout()` (중단 시) | `BaseError` |
| `TimeoutError` | `timeout()`, `withTimeout()` (타임아웃 시) | `BaseError` |
| `InvalidTypeError` | 유효성 검사 유틸리티 | `BaseError` |

모든 에러는 `.group`, `.specific`, `.code` (`"group.specific"` 형식), `.details` 속성을 가집니다.

---

### 핵심 라이브러리 유틸리티 (`/lib`)

#### cacheMapFactory
```typescript
cacheMapFactory<M extends Map<string, any>>(defaultValue?) => CacheMap
```
Map 기반 캐시. 원시값 키(string, number)에 적합합니다.

API: `.get()`, `.set()`, `.has()`, `.delete()`, `.clear()`, `.size()`, `.keys()`, `.values()`, `.entries()`, `.getCache()`

#### cacheWeakMapFactory
```typescript
cacheWeakMapFactory<V, K extends object>(defaultValue?) => WeakCacheMap
```
객체 키를 위한 WeakMap 기반 캐시. 키 객체가 참조되지 않으면 자동으로 가비지 컬렉션됩니다.

API: `.get()`, `.set()`, `.has()`, `.delete()`, `.getCache()`

**선택 기준:**
- `cacheMapFactory` — 원시값 키, 항목 열거/개수 파악이 필요할 때
- `cacheWeakMapFactory` — 객체 키, 자동 메모리 관리, 열거 불필요할 때

#### counterFactory
```typescript
counterFactory(start?: number): () => number
```
자동 증가 카운터 함수를 생성합니다 (기본 시작값: 0).

#### getTypeTag
```typescript
getTypeTag(value: unknown): string
```
`Object.prototype.toString.call(value)` 결과를 반환합니다.

#### hasOwnProperty
```typescript
hasOwnProperty(object: unknown, key: PropertyKey): boolean
```
null 프로토타입 객체에서도 동작하는 안전한 자체 속성 확인.

---

### 상수 (`/constant`)

```typescript
// 시간 상수 (밀리초)
MILLISECOND = 1
SECOND      = 1_000
MINUTE      = 60_000
HOUR        = 3_600_000
DAY         = 86_400_000
```

---

## 사용 패턴

### 페이지네이션
```typescript
import { chunk } from '@winglet/common-utils/array';

const pages = chunk(items, pageSize);
const currentPage = pages[pageIndex] ?? [];
```

### 데이터 그룹화
```typescript
import { groupBy } from '@winglet/common-utils/array';

const byStatus = groupBy(orders, o => o.status);
// { pending: [...], shipped: [...], delivered: [...] }
```

### API 응답 정규화 (snake_case → camelCase)
```typescript
import { transformKeys } from '@winglet/common-utils/object';

const normalized = transformKeys(apiResponse, (_, key) =>
  key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
);
```

### 타임스탬프를 제외한 상태 비교
```typescript
import { equals } from '@winglet/common-utils/object';

const hasChanged = !equals(prevState, nextState, ['updatedAt', 'version']);
```

### 타임아웃이 있는 안전한 비동기 처리
```typescript
import { withTimeout } from '@winglet/common-utils/promise';
import { TimeoutError } from '@winglet/common-utils/error';

try {
  const result = await withTimeout(() => fetchData(), 5000);
} catch (e) {
  if (e instanceof TimeoutError) handleTimeout();
  else throw e;
}
```

### 지수 백오프 재시도
```typescript
import { delay } from '@winglet/common-utils/promise';

async function retry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      await delay(Math.pow(2, attempt - 1) * 1000); // 1s, 2s, 4s
    }
  }
  throw new Error('unreachable');
}
```

### 디바운스된 검색
```typescript
import { debounce } from '@winglet/common-utils/function';

const debouncedSearch = debounce(async (query: string) => {
  const results = await searchAPI(query);
  updateUI(results);
}, 300);

searchInput.addEventListener('input', e => debouncedSearch(e.target.value));
```

### Map 캐시로 메모이제이션
```typescript
import { cacheMapFactory } from '@winglet/common-utils/lib';

const cache = cacheMapFactory<Map<string, number>>();

function memoFib(n: number): number {
  const key = String(n);
  if (cache.has(key)) return cache.get(key)!;
  const result = n <= 1 ? n : memoFib(n - 1) + memoFib(n - 2);
  cache.set(key, result);
  return result;
}
```

### null/undefined 값 제거
```typescript
import { isNotNil } from '@winglet/common-utils/filter';
import { removeUndefined } from '@winglet/common-utils/object';

const cleanArray = rawArray.filter(isNotNil);
const cleanObject = removeUndefined(rawObject);
```

### 배치 API 요청
```typescript
import { chunk } from '@winglet/common-utils/array';

const batches = chunk(userIds, 50);
for (const batch of batches) {
  await Promise.all(batch.map(id => fetchUser(id)));
}
```

---

## 호환성

- **ES2020** 문법
- **Node.js** 14.0.0 이상
- **ES2020을 지원하는 모던 브라우저**
- 레거시 환경: Babel로 트랜스파일
- **TypeScript** 4.0 이상
