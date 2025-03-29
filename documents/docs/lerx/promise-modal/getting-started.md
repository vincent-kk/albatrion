---
sidebar_position: 1
---

# 시작하기

## 개발 사상

`@lerx/promise-modal`은 다음과 같은 핵심 사상들을 바탕으로 설계되었습니다:

1. **Promise 기반 처리**

   - 모달의 모든 동작을 Promise로 처리
   - async/await 구문을 사용한 직관적인 코드 작성
   - 콜백 지옥 방지

2. **유연성**

   - 다양한 모달 라이브러리 지원
   - 커스텀 모달 컴포넌트 지원
   - TypeScript를 통한 타입 안정성

3. **단순성**
   - 최소한의 API로 강력한 기능 제공
   - 기존 모달 라이브러리의 API를 그대로 활용

## 기본 설정

### 1. 패키지 설치

```bash
npm install @lerx/promise-modal
# or
yarn add @lerx/promise-modal
```

### 2. 기본 사용법

```tsx
import { createPromiseModal } from '@lerx/promise-modal';
import { Modal } from 'antd';

// Promise 기반 모달 생성
const showConfirmModal = createPromiseModal(Modal.confirm);

// 모달 사용
async function handleDelete() {
  try {
    const result = await showConfirmModal({
      title: '삭제 확인',
      content: '정말 삭제하시겠습니까?',
      okText: '삭제',
      cancelText: '취소',
    });

    if (result) {
      // 사용자가 '삭제' 버튼을 클릭한 경우
      console.log('삭제 진행');
    } else {
      // 사용자가 '취소' 버튼을 클릭한 경우
      console.log('삭제 취소');
    }
  } catch (error) {
    // 모달이 닫힌 경우
    console.log('모달이 닫힘');
  }
}
```

## 주요 기능

### 1. Promise 기반 처리

모달의 모든 동작이 Promise로 처리되어 async/await 구문을 사용할 수 있습니다.

```tsx
async function handleConfirm() {
  const result = await showConfirmModal({
    title: '확인',
    content: '작업을 진행하시겠습니까?',
  });

  if (result) {
    // 확인 버튼 클릭
  } else {
    // 취소 버튼 클릭
  }
}
```

### 2. 다양한 모달 라이브러리 지원

Ant Design, Ant Design Mobile 등 다양한 모달 라이브러리를 지원합니다.

```tsx
// Ant Design
import { Modal } from 'antd';
// Ant Design Mobile
import { Dialog } from 'antd-mobile';

const showAntdModal = createPromiseModal(Modal.confirm);

const showMobileModal = createPromiseModal(Dialog.confirm);
```

### 3. 커스텀 모달 컴포넌트 지원

자체 구현한 모달 컴포넌트도 Promise 기반으로 처리할 수 있습니다.

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
```

## 다음 단계

- [API](./api.md)에서 상세한 API 문서를 확인하세요
- [예제](./examples.md)에서 다양한 사용 사례를 살펴보세요
- [고급 사용법](./advanced-usage.md)에서 더 복잡한 사용 시나리오를 배워보세요
