---
sidebar_position: 1
---

# @lerx/promise-modal

## 소개

`@lerx/promise-modal`은 모달을 Promise 기반으로 처리할 수 있게 해주는 유틸리티 패키지입니다. 모달의 열기, 닫기, 확인, 취소 등의 동작을 Promise로 처리하여 더 선언적이고 직관적인 코드를 작성할 수 있습니다.

## 주요 기능

- Promise 기반의 모달 처리
- TypeScript 지원
- 다양한 모달 라이브러리 지원 (Ant Design, Ant Design Mobile 등)
- 커스텀 모달 컴포넌트 지원

## 설치

```bash
npm install @lerx/promise-modal
# or
yarn add @lerx/promise-modal
```

## 기본 사용법

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

## 문서 목차

1. [시작하기](./getting-started.md)
