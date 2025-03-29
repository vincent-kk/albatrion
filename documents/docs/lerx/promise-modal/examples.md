---
sidebar_position: 1
---

# 예제

## 기본 예제

### 1. 확인 모달

가장 기본적인 확인 모달 예제입니다.

```tsx
import { createPromiseModal } from '@canard/promise-modal';
import { Modal } from 'antd';

const showConfirmModal = createPromiseModal(Modal.confirm);

async function handleDelete() {
  try {
    const result = await showConfirmModal({
      title: '삭제 확인',
      content: '정말 삭제하시겠습니까?',
      okText: '삭제',
      cancelText: '취소',
    });

    if (result) {
      // 삭제 로직 실행
      console.log('삭제 진행');
    } else {
      // 삭제 취소
      console.log('삭제 취소');
    }
  } catch (error) {
    // 모달이 닫힘
    console.log('모달이 닫힘');
  }
}
```

### 2. 입력 모달

사용자 입력을 받는 모달 예제입니다.

```tsx
import { useState } from 'react';

import { createPromiseModal } from '@canard/promise-modal';
import { Modal } from 'antd';
import { Input } from 'antd';

function InputModal({ onOk, onCancel, ...props }) {
  const [value, setValue] = useState('');

  return (
    <Modal {...props} onOk={() => onOk(value)} onCancel={onCancel}>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="입력하세요"
      />
    </Modal>
  );
}

const showInputModal = createPromiseModal(InputModal);

async function handleInput() {
  try {
    const result = await showInputModal({
      title: '이름 입력',
      content: '이름을 입력하세요',
    });

    if (result) {
      // 입력된 값 처리
      console.log('입력된 값:', result);
    }
  } catch (error) {
    console.log('모달이 닫힘');
  }
}
```

## 고급 예제

### 1. 체크박스 모달

체크박스가 포함된 모달 예제입니다.

```tsx
import { useState } from 'react';

import { createPromiseModal } from '@canard/promise-modal';
import { Checkbox, Modal } from 'antd';

function CheckboxModal({ onOk, onCancel, ...props }) {
  const [checked, setChecked] = useState(false);

  return (
    <Modal {...props} onOk={() => onOk(checked)} onCancel={onCancel}>
      <Checkbox
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      >
        동의합니다
      </Checkbox>
    </Modal>
  );
}

const showCheckboxModal = createPromiseModal(CheckboxModal);

async function handleCheckbox() {
  try {
    const result = await showCheckboxModal({
      title: '약관 동의',
      content: '약관에 동의하시겠습니까?',
    });

    if (result) {
      // 동의 처리
      console.log('약관 동의');
    }
  } catch (error) {
    console.log('모달이 닫힘');
  }
}
```

### 2. 다중 선택 모달

다중 선택이 가능한 모달 예제입니다.

```tsx
import { useState } from 'react';

import { createPromiseModal } from '@canard/promise-modal';
import { Modal, Select } from 'antd';

function MultiSelectModal({ onOk, onCancel, ...props }) {
  const [selected, setSelected] = useState([]);

  return (
    <Modal {...props} onOk={() => onOk(selected)} onCancel={onCancel}>
      <Select
        mode="multiple"
        value={selected}
        onChange={setSelected}
        options={[
          { label: '옵션 1', value: '1' },
          { label: '옵션 2', value: '2' },
          { label: '옵션 3', value: '3' },
        ]}
      />
    </Modal>
  );
}

const showMultiSelectModal = createPromiseModal(MultiSelectModal);

async function handleMultiSelect() {
  try {
    const result = await showMultiSelectModal({
      title: '다중 선택',
      content: '항목을 선택하세요',
    });

    if (result) {
      // 선택된 항목 처리
      console.log('선택된 항목:', result);
    }
  } catch (error) {
    console.log('모달이 닫힘');
  }
}
```

## 커스텀 예제

### 1. 커스텀 스타일 모달

스타일이 적용된 커스텀 모달 예제입니다.

```tsx
import { createPromiseModal } from '@canard/promise-modal';
import styled from 'styled-components';

const StyledModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

function CustomStyledModal({ onOk, onCancel, title, content }) {
  return (
    <>
      <Overlay onClick={onCancel} />
      <StyledModal>
        <h2>{title}</h2>
        <p>{content}</p>
        <button onClick={onOk}>확인</button>
        <button onClick={onCancel}>취소</button>
      </StyledModal>
    </>
  );
}

const showCustomStyledModal = createPromiseModal(CustomStyledModal);

async function handleCustomStyled() {
  try {
    const result = await showCustomStyledModal({
      title: '커스텀 스타일',
      content: '스타일이 적용된 모달입니다.',
    });

    if (result) {
      console.log('확인');
    }
  } catch (error) {
    console.log('모달이 닫힘');
  }
}
```

### 2. 비동기 처리 모달

비동기 작업을 포함한 모달 예제입니다.

```tsx
import { useState } from 'react';

import { createPromiseModal } from '@canard/promise-modal';
import { Button, Modal } from 'antd';

function AsyncModal({ onOk, onCancel, ...props }) {
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    setLoading(true);
    try {
      // 비동기 작업 수행
      await new Promise((resolve) => setTimeout(resolve, 2000));
      onOk();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      {...props}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
    >
      <p>비동기 작업이 포함된 모달입니다.</p>
    </Modal>
  );
}

const showAsyncModal = createPromiseModal(AsyncModal);

async function handleAsync() {
  try {
    const result = await showAsyncModal({
      title: '비동기 처리',
      content: '작업을 진행하시겠습니까?',
    });

    if (result) {
      console.log('작업 완료');
    }
  } catch (error) {
    console.log('모달이 닫힘');
  }
}
```

## 다음 단계

- [고급 사용법](./advanced-usage.md)에서 더 복잡한 사용 시나리오를 배워보세요
- [API](./api.md)에서 상세한 API 문서를 확인하세요
