---
sidebar_position: 1
---

# 라이브러리 함수

## microtask

마이크로태스크 큐를 사용하여 비동기 작업을 처리합니다.

```javascript
import { libs } from '@winglet/common-utils';

// 마이크로태스크 큐에 작업 추가
libs.microtask.schedule(() => {
  console.log('마이크로태스크 실행');
});

// 마이크로태스크 큐 비우기
libs.microtask.flush();
```

### 입력

- `schedule`: 실행할 콜백 함수
- `flush`: 마이크로태스크 큐를 비우는 함수

## postPromise

Promise 관련 유틸리티 함수를 제공합니다.

```javascript
import { libs } from '@winglet/common-utils';

// Promise 생성
const promise = libs.postPromise.create();

// Promise 해결
libs.postPromise.resolve(promise, '성공');

// Promise 거부
libs.postPromise.reject(promise, new Error('실패'));
```

### 입력

- `create`: 새로운 Promise 생성
- `resolve`: Promise 해결
- `reject`: Promise 거부

## cache

캐시 관련 유틸리티를 제공합니다.

```javascript
import { libs } from '@winglet/common-utils';

// 캐시 생성
const cache = libs.cache.create();

// 캐시에 값 저장
cache.set('key', 'value');

// 캐시에서 값 조회
const value = cache.get('key');

// 캐시에서 값 삭제
cache.delete('key');

// 캐시 초기화
cache.clear();
```

### 입력

- `create`: 새로운 캐시 인스턴스 생성
- `set`: 캐시에 키-값 쌍 저장
- `get`: 캐시에서 값 조회
- `delete`: 캐시에서 값 삭제
- `clear`: 캐시 초기화

## counter

카운터 관련 유틸리티를 제공합니다.

```javascript
import { libs } from '@winglet/common-utils';

// 카운터 생성
const counter = libs.counter.create();

// 카운터 증가
counter.increment();

// 카운터 감소
counter.decrement();

// 현재 카운트 조회
const count = counter.getCount();
```

### 입력

- `create`: 새로운 카운터 인스턴스 생성
- `increment`: 카운터 증가
- `decrement`: 카운터 감소
- `getCount`: 현재 카운트 조회

## random

난수 생성 유틸리티를 제공합니다.

```javascript
import { libs } from '@winglet/common-utils';

// 0과 1 사이의 난수 생성
const random = libs.random();

// 특정 범위의 난수 생성
const randomInRange = libs.random(1, 10);
```

### 입력

- `random()`: 0과 1 사이의 난수 생성
- `random(min, max)`: 지정된 범위의 난수 생성

## merge

객체 병합 유틸리티를 제공합니다.

```javascript
import { libs } from '@winglet/common-utils';

const obj1 = { a: 1, b: 2 };
const obj2 = { b: 3, c: 4 };

// 객체 병합
const merged = libs.merge(obj1, obj2);
// { a: 1, b: 3, c: 4 }

// 깊은 병합
const deepMerged = libs.merge.deep(obj1, obj2);
```

### 입력

- `merge`: 얕은 병합
- `merge.deep`: 깊은 병합

## murmur3

Murmur3 해시 함수를 제공합니다.

```javascript
import { libs } from '@winglet/common-utils';

// 문자열 해시 생성
const hash = libs.murmur3('test');

// 버퍼 해시 생성
const bufferHash = libs.murmur3(buffer);
```

### 입력

- `input`: 해시할 문자열 또는 버퍼

### 출력

- Murmur3 해시값
