# @winglet/common-utils

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()

---

## 개요

`@winglet/common-utils`는 자바스크립트/타입스크립트 프로젝트에서 유용하게 사용할 수 있는 다양한 유틸리티 함수들을 제공하는 패키지입니다.

이 라이브러리는 캐싱, 배열 처리, 객체 조작, Promise 처리, 타입 체크 등 다양한 영역에서 자주 사용되는 기능들을 제공합니다.

---

## 설치 방법

```bash
# npm 사용
npm install @winglet/common-utils

# yarn 사용
yarn add @winglet/common-utils
```

---

## Sub-path Imports

이 패키지는 sub-path import를 지원하여 더 세분화된 가져오기를 가능하게 하고 번들 크기를 최적화합니다. 전체 패키지를 가져오지 않고 특정 모듈을 직접 가져올 수 있습니다:

```typescript
// 메인 내보내기
import { someUtility } from '@winglet/common-utils';
// 배열 유틸리티
import { chunk, intersection, unique } from '@winglet/common-utils/array';
// 콘솔 유틸리티
import { printError } from '@winglet/common-utils/console';
// 상수
import { TIME_UNITS, TYPE_TAGS } from '@winglet/common-utils/constant';
// 변환 유틸리티
import { convertMsFromDuration } from '@winglet/common-utils/convert';
// 에러 클래스
import { AbortError, BaseError } from '@winglet/common-utils/error';
// 필터 유틸리티 (타입 검사)
import { isArray, isFunction, isObject } from '@winglet/common-utils/filter';
// 함수 유틸리티
import { debounce, throttle } from '@winglet/common-utils/function';
// 해시 유틸리티
import { Murmur3 } from '@winglet/common-utils/hash';
// 라이브러리 유틸리티
import {
  mapCacheFactory,
  weakMapCacheFactory,
} from '@winglet/common-utils/lib';
// 객체 유틸리티
import { clone, equals, merge } from '@winglet/common-utils/object';
// Promise 유틸리티
import { delay, timeout, withTimeout } from '@winglet/common-utils/promise';
// 스케줄러 유틸리티
import {
  scheduleMacrotask,
  scheduleMicrotask,
} from '@winglet/common-utils/scheduler';
```

### 사용 가능한 Sub-path

package.json의 exports 설정을 기반으로 합니다:

- `@winglet/common-utils` - 메인 내보내기 (모든 유틸리티)
- `@winglet/common-utils/lib` - 핵심 라이브러리 유틸리티 (캐시, 카운터, 스케줄러)
- `@winglet/common-utils/error` - 에러 클래스 및 유틸리티 (BaseError, AbortError 등)
- `@winglet/common-utils/constant` - 공통 상수 (시간, 타입 태그, 단위)
- `@winglet/common-utils/filter` - 타입 검사 및 필터링 유틸리티 (isArray, isObject 등)
- `@winglet/common-utils/array` - 배열 조작 유틸리티 (chunk, unique, difference 등)
- `@winglet/common-utils/console` - 콘솔 유틸리티 (printError)
- `@winglet/common-utils/convert` - 타입 변환 유틸리티 (convertMsFromDuration)
- `@winglet/common-utils/function` - 함수 유틸리티 (debounce, throttle, getTrackableHandler)
- `@winglet/common-utils/hash` - 해시 알고리즘 (Murmur3)
- `@winglet/common-utils/object` - 객체 조작 유틸리티 (clone, merge, equals 등)
- `@winglet/common-utils/promise` - Promise 유틸리티 (delay, timeout, withTimeout 등)
- `@winglet/common-utils/scheduler` - 작업 스케줄링 유틸리티 (scheduleMacrotask, scheduleMicrotask 등)

---

## 호환성 안내

이 패키지는 ECMAScript 2020 (ES2020) 문법으로 작성되었습니다.

**지원 환경:**

- Node.js 14.0.0 이상
- 모던 브라우저 (ES2020 지원)

**레거시 환경 지원이 필요한 경우:**
Babel 등의 트랜스파일러를 사용하여 타겟 환경에 맞게 변환해주세요.

---

## 주요 기능

### 상수 (Constants)

- 시간 관련 상수 ([time.ts](./src/constant/time.ts))
- 타입 태그 상수 ([typeTag.ts](./src/constant/typeTag.ts))
- 단위 변환 상수 ([unit.ts](./src/constant/unit.ts))

### 오류 처리 (Errors)

- **[`BaseError`](./src/errors/BaseError.ts)**: 기본 에러 클래스
- **[`AbortError`](./src/errors/AbortError.ts)**: 작업 중단에 대한 에러
- **[`InvalidTypeError`](./src/errors/InvalidTypeError.ts)**: 잘못된 타입에 대한 에러
- **[`TimeoutError`](./src/errors/TimeoutError.ts)**: 시간 초과에 대한 에러

### 유틸리티 라이브러리 (Libs)

- **[`weakMapCacheFactory`](./src/libs/cache.ts)**: WeakMap 기반의 캐시 생성 팩토리
- **[`mapCacheFactory`](./src/libs/cache.ts)**: Map 기반의 캐시 생성 팩토리
- **[`counter`](./src/libs/counter.ts)**: 증가하는 카운터 생성 유틸리티
- **[`getKeys`](./src/libs/getKeys.ts)**: 객체의 키를 반환하는 유틸리티
- **[`getTypeTag`](./src/libs/getTypeTag.ts)**: JavaScript 값의 내부 타입 태그를 얻는 함수
- **[`hasOwnProperty`](./src/libs/hasOwnProperty.ts)**: 객체가 특정 속성을 가지고 있는지 확인하는 함수
- **[`random`](./src/libs/random.ts)**: 난수 생성 관련 유틸리티

### 유틸리티 함수 (Utils)

#### 배열 (Array)

- **[`at`](./src/utils/array/at.ts)**: 배열에서 지정한 인덱스의 요소를 반환하는 함수
- **[`chunk`](./src/utils/array/chunk.ts)**: 배열을 지정된 크기의 청크(덩어리)로 분할하는 함수
- **[`difference`](./src/utils/array/difference.ts)**: 첫 번째 배열에는 있지만 다른 배열에는 없는 요소만 반환하는 함수
- **[`differenceBy`](./src/utils/array/differenceBy.ts)**: 반복자 함수에 의해 처리된 결과를 기준으로 배열 간 차이를 계산하는 함수
- **[`differenceWith`](./src/utils/array/differenceWith.ts)**: 비교자 함수를 사용하여 배열 간 차이를 계산하는 함수
- **[`forEach`](./src/utils/array/forEach.ts)**: 배열의 각 요소에 대해 주어진 함수를 실행하는 함수
- **[`forEachDual`](./src/utils/array/forEachDual.ts)**: 두 배열의 요소를 동시에 순회하며 함수를 실행하는 함수
- **[`forEachReverse`](./src/utils/array/forEachReverse.ts)**: 배열의 요소를 역순으로 순회하며 함수를 실행하는 함수
- **[`groupBy`](./src/utils/array/groupBy.ts)**: 반복자 함수의 결과에 따라 배열 요소를 그룹화하는 함수
- **[`intersection`](./src/utils/array/intersection.ts)**: 모든 배열에 공통으로 존재하는 요소만 반환하는 함수
- **[`intersectionBy`](./src/utils/array/intersectionBy.ts)**: 반복자 함수에 의해 처리된 결과를 기준으로 배열 간 교집합을 계산하는 함수
- **[`intersectionWith`](./src/utils/array/intersectionWith.ts)**: 비교자 함수를 사용하여 배열 간 교집합을 계산하는 함수
- **[`map`](./src/utils/array/map.ts)**: 배열의 각 요소에 함수를 적용하고 그 결과로 새 배열을 생성하는 함수
- **[`unique`](./src/utils/array/unique.ts)**: 배열에서 중복 요소를 제거하고 고유한 요소만 반환하는 함수
- **[`uniqueBy`](./src/utils/array/uniqueBy.ts)**: 반복자 함수에 의해 처리된 결과를 기준으로 고유한 요소만 반환하는 함수
- **[`uniqueWith`](./src/utils/array/uniqueWith.ts)**: 비교자 함수를 사용하여 고유한 요소만 반환하는 함수

#### 콘솔 (Console)

- **[`printError`](./src/utils/console/printError.ts)**: 오류 객체를 콘솔에 정형화된 방식으로 출력하는 함수

#### 변환 (Convert)

- **[`convertMsFromDuration`](./src/utils/convert/convertMsFromDuration.ts)**: 기간 문자열(예: '1h30m')을 밀리초로 변환하는 함수

#### DataLoader

- **[`DataLoader`](./src/utils/DataLoader/DataLoader.ts)**: 여러 요청을 배치로 처리하고 캐싱하여 효율적으로 데이터를 로드하는 유틸리티 클래스

#### 필터 (Filter)

- **[`isArray`](./src/utils/filter/isArray.ts)**: 값이 배열인지 확인하는 함수
- **[`isArrayBuffer`](./src/utils/filter/isArrayBuffer.ts)**: 값이 ArrayBuffer인지 확인하는 함수
- **[`isArrayIndex`](./src/utils/filter/isArrayIndex.ts)**: 값이 유효한 배열 인덱스인지 확인하는 함수
- **[`isArrayLike`](./src/utils/filter/isArrayLike.ts)**: 값이 배열과 유사한 객체인지 확인하는 함수
- **[`isBlob`](./src/utils/filter/isBlob.ts)**: 값이 Blob 객체인지 확인하는 함수
- **[`isBoolean`](./src/utils/filter/isBoolean.ts)**: 값이 Boolean 타입인지 확인하는 함수
- **[`isBuffer`](./src/utils/filter/isBuffer.ts)**: 값이 Buffer 객체인지 확인하는 함수
- **[`isCloneable`](./src/utils/filter/isCloneable.ts)**: 값이 복제 가능한 객체인지 확인하는 함수
- **[`isDataView`](./src/utils/filter/isDataView.ts)**: 값이 DataView 객체인지 확인하는 함수
- **[`isDate`](./src/utils/filter/isDate.ts)**: 값이 Date 객체인지 확인하는 함수
- **[`isEmptyArray`](./src/utils/filter/isEmptyArray.ts)**: 배열이 비어있는지 확인하는 함수
- **[`isEmptyObject`](./src/utils/filter/isEmptyObject.ts)**: 객체가 비어있는지 확인하는 함수
- **[`isEmptyPlainObject`](./src/utils/filter/isEmptyPlainObject.ts)**: 일반 객체가 비어있는지 확인하는 함수
- **[`isError`](./src/utils/filter/isError.ts)**: 값이 Error 객체인지 확인하는 함수
- **[`isFile`](./src/utils/filter/isFile.ts)**: 값이 File 객체인지 확인하는 함수
- **[`isFunction`](./src/utils/filter/isFunction.ts)**: 값이 함수인지 확인하는 함수
- **[`isInteger`](./src/utils/filter/isInteger.ts)**: 값이 정수인지 확인하는 함수
- **[`isMap`](./src/utils/filter/isMap.ts)**: 값이 Map 객체인지 확인하는 함수
- **[`isNil`](./src/utils/filter/isNil.ts)**: 값이 null 또는 undefined인지 확인하는 함수
- **[`isNotNil`](./src/utils/filter/isNotNil.ts)**: 값이 null 또는 undefined가 아닌지 확인하는 함수
- **[`isNull`](./src/utils/filter/isNull.ts)**: 값이 null인지 확인하는 함수
- **[`isNumber`](./src/utils/filter/isNumber.ts)**: 값이 숫자인지 확인하는 함수
- **[`isObject`](./src/utils/filter/isObject.ts)**: 값이 객체인지 확인하는 함수
- **[`isPlainObject`](./src/utils/filter/isPlainObject.ts)**: 값이 일반 객체인지 확인하는 함수
- **[`isPrimitiveObject`](./src/utils/filter/isPrimitiveObject.ts)**: 값이 원시 타입 래퍼 객체인지 확인하는 함수
- **[`isPrimitiveType`](./src/utils/filter/isPrimitiveType.ts)**: 값이 JavaScript 원시 타입인지 확인하는 함수
- **[`isPromise`](./src/utils/filter/isPromise.ts)**: 값이 Promise 객체인지 확인하는 함수
- **[`isRegex`](./src/utils/filter/isRegex.ts)**: 값이 정규 표현식 객체인지 확인하는 함수
- **[`isSet`](./src/utils/filter/isSet.ts)**: 값이 Set 객체인지 확인하는 함수
- **[`isSharedArrayBuffer`](./src/utils/filter/isSharedArrayBuffer.ts)**: 값이 SharedArrayBuffer인지 확인하는 함수
- **[`isString`](./src/utils/filter/isString.ts)**: 값이 문자열인지 확인하는 함수
- **[`isSymbol`](./src/utils/filter/isSymbol.ts)**: 값이 Symbol인지 확인하는 함수
- **[`isTruthy`](./src/utils/filter/isTruthy.ts)**: 값이 truthy인지 확인하는 함수
- **[`isTypedArray`](./src/utils/filter/isTypedArray.ts)**: 값이 TypedArray인지 확인하는 함수
- **[`isUndefined`](./src/utils/filter/isUndefined.ts)**: 값이 undefined인지 확인하는 함수
- **[`isValidRegexPattern`](./src/utils/filter/isValidRegexPattern.ts)**: 문자열이 유효한 정규 표현식 패턴인지 확인하는 함수
- **[`isWeakMap`](./src/utils/filter/isWeakMap.ts)**: 값이 WeakMap 객체인지 확인하는 함수
- **[`isWeakSet`](./src/utils/filter/isWeakSet.ts)**: 값이 WeakSet 객체인지 확인하는 함수

#### 함수 (Function)

##### 함수 기능 추가 (Enhance)

- **[`getTrackableHandler`](./src/utils/function/enhance/getTrackableHandler/getTrackableHandler.ts)**: 함수 실행 상태를 추적하고 관리할 수 있는 래퍼 함수를 생성하는 유틸리티

##### 실행 빈도 제어 (Rate Limit)

- **[`debounce`](./src/utils/function/rateLimit/debounce.ts)**: 함수 호출을 지연시키고, 일정 시간 동안 추가 호출이 없을 때만 실행하는 함수
- **[`throttle`](./src/utils/function/rateLimit/throttle.ts)**: 함수 호출 빈도를 제한하여 일정 시간 간격으로만 실행되도록 하는 함수

#### 해시 (Hash)

- **[`Murmur3`](./src/utils/hash/murmur3.ts)**: Murmur3 해시 알고리즘을 구현한 클래스로, 문자열 또는 바이트 배열의 해시를 생성
- **[`polynomialHash`](./src/utils/hash/polynomialHash.ts)**: 31-based polynomial rolling hash 알고리즘을 구현한 함수로, 문자열을 base36 해시로 변환하는 함수

#### 객체 (Object)

- **[`clone`](./src/utils/object/clone.ts)**: 객체의 깊은 복사본을 생성하는 함수
- **[`equals`](./src/utils/object/equals.ts)**: 두 객체의 동등성을 비교하는 함수
- **[`getJSONPointer`](./src/utils/object/getJSONPointer.ts)**: 객체에서 JSON Pointer를 사용하여 값을 가져오는 함수
- **[`getObjectKeys`](./src/utils/object/getObjectKeys.ts)**: 객체의 모든 키를 배열로 반환하는 함수
- **[`getSymbols`](./src/utils/object/getSymbols.ts)**: 객체의 모든 심볼 속성을 배열로 반환하는 함수
- **[`hasUndefined`](./src/utils/object/hasUndefined.ts)**: 객체에 undefined 값이 있는지 확인하는 함수
- **[`merge`](./src/utils/object/merge.ts)**: 여러 객체를 병합하는 함수
- **[`removeUndefined`](./src/utils/object/removeUndefined.ts)**: 객체에서 undefined 값을 가진 속성을 제거하는 함수
- **[`serializeNative`](./src/utils/object/serializeNative.ts)**: 기본 JavaScript 객체를 JSON 문자열로 직렬화하는 함수
- **[`serializeObject`](./src/utils/object/serializeObject.ts)**: 객체를 JSON 문자열로 직렬화하는 함수
- **[`serializeWithFullSortedKeys`](./src/utils/object/serializeWithFullSortedKeys.ts)**: 객체를 정렬된 키와 함께 JSON 문자열로 직렬화하는 함수
- **[`sortObjectKeys`](./src/utils/object/sortObjectKeys.ts)**: 객체의 키를 알파벳 순으로 정렬하는 함수
- **[`stableEquals`](./src/utils/object/stableEquals.ts)**: 안정적인 방식으로 두 객체의 동등성을 비교하는 함수
- **[`stableSerialize`](./src/utils/object/stableSerialize.ts)**: 객체를 안정적인 방식으로 직렬화하는 함수
- **[`transformKeys`](./src/utils/object/transformKeys.ts)**: 객체의 모든 키에 변환 함수를 적용하는 함수
- **[`transformValues`](./src/utils/object/transformValues.ts)**: 객체의 모든 값에 변환 함수를 적용하는 함수

#### Promise

- **[`delay`](./src/utils/promise/delay.ts)**: 지정된 시간 동안 대기한 후 해결되는 Promise를 반환하는 함수
- **[`timeout`](./src/utils/promise/timeout.ts)**: 지정된 시간 후에 타임아웃 오류와 함께 거부되는 Promise를 반환하는 함수
- **[`withTimeout`](./src/utils/promise/withTimeout.ts)**: Promise에 타임아웃을 추가하는 함수로, 지정된 시간 내에 완료되지 않으면 오류 발생
- **[`waitAndExecute`](./src/utils/promise/waitAndExecute.ts)**: 지정된 시간을 기다린 후 함수를 실행하는 함수
- **[`waitAndReturn`](./src/utils/promise/waitAndReturn.ts)**: 지정된 시간을 기다린 후 값을 반환하는 함수

#### 스케줄러 (Scheduler)

- **[`scheduleMacrotask`](./src/utils/scheduler/scheduleMacrotask.ts)**: 매크로태스크 큐에 작업을 예약하는 함수
- **[`cancelMacrotask`](./src/utils/scheduler/scheduleMacrotask.ts)**: 예약된 매크로태스크를 취소하는 함수
- **[`scheduleCancelableMacrotask`](./src/utils/scheduler/scheduleMacrotask.ts)**: 취소 가능한 매크로태스크를 예약하는 함수
- **[`scheduleMicrotask`](./src/utils/scheduler/scheduleMicrotask.ts)**: 마이크로태스크 큐에 작업을 예약하는 함수
- **[`scheduleNextTick`](./src/utils/scheduler/scheduleNextTick.ts)**: Node.js의 process.nextTick과 유사한 방식으로 다음 틱에 작업을 예약하는 함수

---

## 사용 예제

### Cache 유틸리티 사용하기

```typescript
import { mapCacheFactory, weakMapCacheFactory } from '@winglet/common-utils';

// WeakMap 기반 캐시 생성
const objectCache = weakMapCacheFactory<string>();
const myObject = { id: 1 };
objectCache.set(myObject, 'cached value');
console.log(objectCache.get(myObject)); // 'cached value'

// Map 기반 캐시 생성
const stringCache = mapCacheFactory<Map<string, number>>();
stringCache.set('key1', 100);
console.log(stringCache.get('key1')); // 100
```

### Promise 유틸리티 사용하기

```typescript
import { delay, withTimeout } from '@winglet/common-utils';

// 지연 함수 사용
async function delayExample() {
  console.log('시작');
  await delay(1000); // 1초 대기
  console.log('1초 후');
}

// 타임아웃 추가하기
async function fetchWithTimeout(url: string) {
  const fetchPromise = fetch(url);
  return withTimeout(fetchPromise, 5000); // 5초 타임아웃 추가
}
```

### 배열 유틸리티 사용하기

```typescript
import { array } from '@winglet/common-utils';

// 예제 코드:
const chunks = array.chunk([1, 2, 3, 4, 5, 6], 2);
console.log(chunks); // [[1, 2], [3, 4], [5, 6]]
```

### 함수 추적 유틸리티 사용하기

```typescript
import { getTrackableHandler } from '@winglet/common-utils';

// 비동기 함수 실행 상태를 추적하는 예제
const fetchUserData = async (userId: string) => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
};

const trackableFetchUser = getTrackableHandler(fetchUserData, {
  preventConcurrent: true, // 동시 실행 방지
  initialState: { loading: false },
  beforeExecute: (args, stateManager) => {
    stateManager.update({ loading: true });
  },
  afterExecute: (args, stateManager) => {
    stateManager.update({ loading: false });
  },
});

// 상태 변경 감지
trackableFetchUser.subscribe(() => {
  console.log('Current state:', trackableFetchUser.state);
});

// 함수 실행
await trackableFetchUser('user123');
console.log('Loading state:', trackableFetchUser.loading); // false
```

---

## 개발 환경 설정

```bash
# 저장소 클론
dir=your-albatrion && git clone https://github.com/vincent-kk/albatrion.git "$dir" && cd "$dir"

# 의존성 설치
nvm use && yarn install && yarn run:all build

# 개발 빌드
yarn commonUtils build

# 테스트 실행
yarn commonUtils test
```

---

## 라이선스

이 프로젝트는 MIT 라이선스 하에 제공됩니다. 자세한 내용은 \*\*[`LICENSE`](./LICENSE) 파일을 참조하세요.

## 연락처

이 프로젝트에 관한 질문이나 제안이 있으시면 이슈를 생성해 주세요.
