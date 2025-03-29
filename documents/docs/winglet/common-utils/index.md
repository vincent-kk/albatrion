---
sidebar_position: 1
---

# @winglet/common-utils

`@winglet/common-utils`는 자주 사용되는 JavaScript 유틸리티 함수들의 모음입니다.

## 설치

```bash
npm install @winglet/common-utils
# or
yarn add @winglet/common-utils
```

## 사용법

```javascript
import { constant, errors, libs, utils } from '@winglet/common-utils';

// 라이브러리 함수 사용
const random = libs.random();
const hash = libs.murmur3('test');

// 유틸리티 함수 사용
const filtered = utils.filter.removeNull([1, null, 2]);
const merged = utils.object.merge({ a: 1 }, { b: 2 });

// 상수 사용
const { SECOND, MINUTE, HOUR } = constant.time;
const { BYTE, KB, MB } = constant.unit;

// 에러 클래스 사용
throw new errors.TimeoutError('작업 시간 초과');
```

## 카테고리

### [라이브러리](./libs.md)

- `microtask`: 마이크로태스크 큐 관련 유틸리티
- `postPromise`: Promise 관련 유틸리티
- `cache`: 캐시 관련 유틸리티
- `counter`: 카운터 관련 유틸리티
- `random`: 난수 생성 유틸리티
- `merge`: 객체 병합 유틸리티
- `murmur3`: Murmur3 해시 함수

### [유틸리티](./utils.md)

- `object`: 객체 조작 유틸리티
- `dataLoader`: 데이터 로딩 유틸리티
- `filter`: 배열 필터링 유틸리티
- `function`: 함수 관련 유틸리티
- `promise`: Promise 관련 유틸리티
- `generateHash`: 해시 생성 유틸리티

### [상수](./constant.md)

- `function`: 함수 관련 상수
- `bitmask`: 비트마스크 상수
- `object`: 객체 관련 상수
- `time`: 시간 관련 상수
- `unit`: 단위 관련 상수

### [에러](./errors.md)

- `BaseError`: 기본 에러 클래스
- `InvalidTypeError`: 잘못된 타입 에러
- `AbortError`: 중단 에러
- `TimeoutError`: 타임아웃 에러
