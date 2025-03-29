---
sidebar_position: 1
---

# 훅

## useSnapshot

값의 스냅샷을 생성하고 관리합니다.

```javascript
import { hooks } from '@winglet/react-utils';

function MyComponent() {
  const [value, setValue] = useState('test');
  const snapshot = hooks.useSnapshot(value);

  return (
    <div>
      <p>현재 값: {value}</p>
      <p>스냅샷: {snapshot}</p>
    </div>
  );
}
```

### 입력

- `value`: 스냅샷을 생성할 값

### 출력

- 스냅샷 값

## useConstant

컴포넌트 생명주기 동안 유지되는 상수를 생성합니다.

```javascript
import { hooks } from '@winglet/react-utils';

function MyComponent() {
  const constant = hooks.useConstant(() => ({
    api: 'https://api.example.com',
    timeout: 5000,
  }));

  return <div>API: {constant.api}</div>;
}
```

### 입력

- `factory`: 상수를 생성하는 함수

### 출력

- 생성된 상수 값

## useTick

주기적으로 실행되는 타이머 훅입니다.

```javascript
import { hooks } from '@winglet/react-utils';

function MyComponent() {
  const [count, setCount] = useState(0);

  hooks.useTick(() => {
    setCount((prev) => prev + 1);
  }, 1000);

  return <div>카운트: {count}</div>;
}
```

### 입력

- `callback`: 실행할 콜백 함수
- `interval`: 실행 간격 (밀리초)

## useHandle

이벤트 핸들러를 생성하고 관리합니다.

```javascript
import { hooks } from '@winglet/react-utils';

function MyComponent() {
  const handleClick = hooks.useHandle((event) => {
    console.log('클릭됨:', event);
  });

  return <button onClick={handleClick}>클릭</button>;
}
```

### 입력

- `handler`: 이벤트 핸들러 함수

### 출력

- 메모이제이션된 핸들러 함수

## useOnUnmount

컴포넌트 언마운트 시 실행되는 훅입니다.

```javascript
import { hooks } from '@winglet/react-utils';

function MyComponent() {
  hooks.useOnUnmount(() => {
    console.log('컴포넌트 언마운트');
  });

  return <div>컴포넌트</div>;
}
```

### 입력

- `callback`: 언마운트 시 실행할 콜백 함수

## useEffectUntil

조건이 충족될 때까지 실행되는 effect입니다.

```javascript
import { hooks } from '@winglet/react-utils';

function MyComponent() {
  const [count, setCount] = useState(0);

  hooks.useEffectUntil(() => {
    setCount((prev) => prev + 1);
  }, count < 5);

  return <div>카운트: {count}</div>;
}
```

### 입력

- `effect`: 실행할 effect 함수
- `condition`: 실행 조건

## useLayoutEffectUntil

조건이 충족될 때까지 실행되는 layout effect입니다.

```javascript
import { hooks } from '@winglet/react-utils';

function MyComponent() {
  const [count, setCount] = useState(0);

  hooks.useLayoutEffectUntil(() => {
    setCount((prev) => prev + 1);
  }, count < 5);

  return <div>카운트: {count}</div>;
}
```

### 입력

- `effect`: 실행할 layout effect 함수
- `condition`: 실행 조건

## useMemorize

메모이제이션된 값을 생성합니다.

```javascript
import { hooks } from '@winglet/react-utils';

function MyComponent() {
  const [value, setValue] = useState('test');
  const memorized = hooks.useMemorize(value);

  return <div>메모이제이션된 값: {memorized}</div>;
}
```

### 입력

- `value`: 메모이제이션할 값

### 출력

- 메모이제이션된 값

## useOnMount

컴포넌트 마운트 시 실행되는 훅입니다.

```javascript
import { hooks } from '@winglet/react-utils';

function MyComponent() {
  hooks.useOnMount(() => {
    console.log('컴포넌트 마운트');
  });

  return <div>컴포넌트</div>;
}
```

### 입력

- `callback`: 마운트 시 실행할 콜백 함수

## useReference

ref를 생성하고 관리합니다.

```javascript
import { hooks } from '@winglet/react-utils';

function MyComponent() {
  const ref = hooks.useReference();

  return <div ref={ref}>참조할 요소</div>;
}
```

### 출력

- ref 객체

## useWindowSize

윈도우 크기를 관리합니다.

```javascript
import { hooks } from '@winglet/react-utils';

function MyComponent() {
  const { width, height } = hooks.useWindowSize();

  return (
    <div>
      <p>너비: {width}</p>
      <p>높이: {height}</p>
    </div>
  );
}
```

### 출력

- `width`: 윈도우 너비
- `height`: 윈도우 높이
