---
sidebar_position: 1
---

# API

## createPromiseModal

Promise 기반의 모달을 생성하는 함수입니다.

```tsx
import { createPromiseModal } from '@lerx/promise-modal';

const showModal = createPromiseModal(Modal.confirm);
```

### 타입 정의

```tsx
type ModalFunction = (config: ModalConfig) => void;
type ModalConfig = {
  title?: React.ReactNode;
  content?: React.ReactNode;
  onOk?: () => void;
  onCancel?: () => void;
  [key: string]: any;
};

function createPromiseModal(
  modalFunction: ModalFunction,
): (config: ModalConfig) => Promise<boolean>;
```

### 매개변수

| 매개변수      | 타입          | 설명                       |
| ------------- | ------------- | -------------------------- |
| modalFunction | ModalFunction | Promise로 변환할 모달 함수 |

### 반환값

Promise를 반환하는 함수를 반환합니다. 이 함수는 다음과 같은 동작을 합니다:

- 확인 버튼 클릭 시: `true` 반환
- 취소 버튼 클릭 시: `false` 반환
- 모달이 닫힐 때: `reject` 발생

### 사용 예제

```tsx
import { createPromiseModal } from '@lerx/promise-modal';
import { Modal } from 'antd';

// Promise 기반 모달 생성
const showConfirmModal = createPromiseModal(Modal.confirm);

// 모달 사용
async function handleConfirm() {
  try {
    const result = await showConfirmModal({
      title: '확인',
      content: '작업을 진행하시겠습니까?',
      okText: '확인',
      cancelText: '취소',
    });

    if (result) {
      // 확인 버튼 클릭
      console.log('확인');
    } else {
      // 취소 버튼 클릭
      console.log('취소');
    }
  } catch (error) {
    // 모달이 닫힘
    console.log('모달이 닫힘');
  }
}
```

## 타입 정의

### ModalFunction

모달을 표시하는 함수의 타입 정의입니다.

```tsx
type ModalFunction = (config: ModalConfig) => void;
```

### ModalConfig

모달 설정을 위한 타입 정의입니다.

```tsx
type ModalConfig = {
  title?: React.ReactNode;
  content?: React.ReactNode;
  onOk?: () => void;
  onCancel?: () => void;
  [key: string]: any;
};
```

## 에러 처리

모달이 닫힐 때 발생하는 에러를 처리하는 방법입니다.

```tsx
async function handleConfirm() {
  try {
    const result = await showConfirmModal({
      title: '확인',
      content: '작업을 진행하시겠습니까?',
    });

    // 정상적인 결과 처리
    console.log(result);
  } catch (error) {
    // 모달이 닫힐 때의 에러 처리
    console.error('모달이 닫힘:', error);
  }
}
```

## 커스텀 모달 컴포넌트

자체 구현한 모달 컴포넌트를 Promise 기반으로 처리하는 방법입니다.

```tsx
import { createPromiseModal } from '@lerx/promise-modal';

// 커스텀 모달 컴포넌트
function CustomModal({ onOk, onCancel, ...props }) {
  return (
    <div>
      <h2>{props.title}</h2>
      <p>{props.content}</p>
      <button onClick={onOk}>확인</button>
      <button onClick={onCancel}>취소</button>
    </div>
  );
}

// Promise 기반 모달 생성
const showCustomModal = createPromiseModal(CustomModal);

// 모달 사용
async function handleCustomModal() {
  const result = await showCustomModal({
    title: '커스텀 모달',
    content: '커스텀 모달 내용',
  });

  console.log(result);
}
```

## 다음 단계

- [예제](./examples.md)에서 다양한 사용 사례를 살펴보세요
- [고급 사용법](./advanced-usage.md)에서 더 복잡한 사용 시나리오를 배워보세요
