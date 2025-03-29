---
sidebar_position: 1
---

# 유틸리티 함수

## object

객체 조작 관련 유틸리티를 제공합니다.

```javascript
import { utils } from '@winglet/common-utils';

const obj = { a: 1, b: { c: 2 } };

// 객체 병합
const merged = utils.object.merge(obj1, obj2);

// 객체 복사
const copied = utils.object.copy(obj);

// 객체 비교
const isEqual = utils.object.isEqual(obj1, obj2);

// 객체 변환
const transformed = utils.object.transform(obj, (value, key) => [
  key.toUpperCase(),
  value,
]);
```

### 입력

- `merge`: 객체 병합
- `copy`: 객체 복사
- `isEqual`: 객체 비교
- `transform`: 객체 변환

## dataLoader

데이터 로딩 관련 유틸리티를 제공합니다.

```javascript
import { utils } from '@winglet/common-utils';

// 데이터 로더 생성
const loader = utils.dataLoader.create();

// 데이터 로드
const data = await loader.load('key');

// 데이터 캐시
loader.cache('key', data);

// 데이터 리프레시
await loader.refresh('key');
```

### 입력

- `create`: 데이터 로더 생성
- `load`: 데이터 로드
- `cache`: 데이터 캐시
- `refresh`: 데이터 리프레시

## filter

배열 필터링 관련 유틸리티를 제공합니다.

```javascript
import { utils } from '@winglet/common-utils';

const array = [1, null, 2, undefined, 3];

// null/undefined 제거
const filtered = utils.filter.removeNull(array);

// 빈 값 제거
const nonEmpty = utils.filter.removeEmpty(array);

// 중복 제거
const unique = utils.filter.removeDuplicates(array);

// 타입별 필터링
const numbers = utils.filter.filterByType(array, 'number');
```

### 입력

- `removeNull`: null/undefined 제거
- `removeEmpty`: 빈 값 제거
- `removeDuplicates`: 중복 제거
- `filterByType`: 타입별 필터링

## function

함수 관련 유틸리티를 제공합니다.

```javascript
import { utils } from '@winglet/common-utils';

// 디바운스
const debounced = utils.function.debounce(fn, 300);

// 스로틀
const throttled = utils.function.throttle(fn, 1000);

// 메모이제이션
const memoized = utils.function.memoize(fn);

// 커링
const curried = utils.function.curry(fn);
```

### 입력

- `debounce`: 디바운스 함수
- `throttle`: 스로틀 함수
- `memoize`: 메모이제이션 함수
- `curry`: 커링 함수

## promise

Promise 관련 유틸리티를 제공합니다.

```javascript
import { utils } from '@winglet/common-utils';

// Promise 생성
const promise = utils.promise.create();

// Promise 타임아웃
const timeoutPromise = utils.promise.timeout(promise, 5000);

// Promise 재시도
const retryPromise = utils.promise.retry(fn, 3);

// Promise 병렬 실행
const results = await utils.promise.parallel([promise1, promise2]);
```

### 입력

- `create`: Promise 생성
- `timeout`: Promise 타임아웃
- `retry`: Promise 재시도
- `parallel`: Promise 병렬 실행

## generateHash

해시 생성 유틸리티를 제공합니다.

```javascript
import { utils } from '@winglet/common-utils';

// 문자열 해시 생성
const hash = utils.generateHash('test');

// 객체 해시 생성
const objectHash = utils.generateHash({ a: 1, b: 2 });

// 버퍼 해시 생성
const bufferHash = utils.generateHash(buffer);
```

### 입력

- `input`: 해시할 데이터 (문자열, 객체, 버퍼)

### 출력

- 생성된 해시값
