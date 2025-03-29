---
sidebar_position: 1
---

# 상수

## function

함수 관련 상수를 제공합니다.

```javascript
import { constant } from '@winglet/common-utils';

// 함수 타입 상수
constant.function.ASYNC; // 'async'
constant.function.SYNC; // 'sync'

// 함수 실행 상태 상수
constant.function.PENDING; // 'pending'
constant.function.RESOLVED; // 'resolved'
constant.function.REJECTED; // 'rejected'
```

## bitmask

비트마스크 관련 상수를 제공합니다.

```javascript
import { constant } from '@winglet/common-utils';

// 비트마스크 상수
constant.bitmask.READ; // 0b001
constant.bitmask.WRITE; // 0b010
constant.bitmask.EXECUTE; // 0b100
```

## object

객체 관련 상수를 제공합니다.

```javascript
import { constant } from '@winglet/common-utils';

// 객체 타입 상수
constant.object.ARRAY; // 'array'
constant.object.OBJECT; // 'object'
constant.object.FUNCTION; // 'function'
constant.object.STRING; // 'string'
constant.object.NUMBER; // 'number'
constant.object.BOOLEAN; // 'boolean'
constant.object.NULL; // 'null'
constant.object.UNDEFINED; // 'undefined'
```

## time

시간 관련 상수를 제공합니다.

```javascript
import { constant } from '@winglet/common-utils';

// 시간 단위 상수 (밀리초)
constant.time.SECOND; // 1000
constant.time.MINUTE; // 60000
constant.time.HOUR; // 3600000
constant.time.DAY; // 86400000
constant.time.WEEK; // 604800000
constant.time.MONTH; // 2592000000
constant.time.YEAR; // 31536000000
```

## unit

단위 관련 상수를 제공합니다.

```javascript
import { constant } from '@winglet/common-utils';

// 바이트 단위 상수
constant.unit.BYTE; // 1
constant.unit.KB; // 1024
constant.unit.MB; // 1048576
constant.unit.GB; // 1073741824
constant.unit.TB; // 1099511627776
```
