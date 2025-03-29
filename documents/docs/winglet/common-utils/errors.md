---
sidebar_position: 1
---

# 에러 클래스

## BaseError

기본 에러 클래스입니다. 다른 모든 에러 클래스의 기본이 됩니다.

```javascript
import { errors } from '@winglet/common-utils';

class CustomError extends errors.BaseError {
  constructor(message) {
    super(message);
    this.name = 'CustomError';
  }
}

throw new CustomError('에러 메시지');
```

### 속성

- `name`: 에러 이름
- `message`: 에러 메시지
- `stack`: 스택 트레이스

## InvalidTypeError

잘못된 타입이 전달되었을 때 발생하는 에러입니다.

```javascript
import { errors } from '@winglet/common-utils';

function validateNumber(value) {
  if (typeof value !== 'number') {
    throw new errors.InvalidTypeError('숫자가 아닌 값이 전달되었습니다', {
      expected: 'number',
      received: typeof value,
    });
  }
}
```

### 속성

- `name`: 'InvalidTypeError'
- `message`: 에러 메시지
- `details`: 타입 관련 상세 정보
  - `expected`: 기대된 타입
  - `received`: 실제 받은 타입

## AbortError

작업이 중단되었을 때 발생하는 에러입니다.

```javascript
import { errors } from '@winglet/common-utils';

async function fetchData() {
  const controller = new AbortController();

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new errors.AbortError('데이터 요청이 중단되었습니다');
    }
    throw error;
  }
}
```

### 속성

- `name`: 'AbortError'
- `message`: 에러 메시지

## TimeoutError

작업이 시간 초과되었을 때 발생하는 에러입니다.

```javascript
import { errors } from '@winglet/common-utils';

async function withTimeout(promise, timeout) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(
        new errors.TimeoutError(`작업이 ${timeout}ms 후에 시간 초과되었습니다`),
      );
    }, timeout);
  });

  return Promise.race([promise, timeoutPromise]);
}
```

### 속성

- `name`: 'TimeoutError'
- `message`: 에러 메시지
- `timeout`: 초과된 시간 (밀리초)
