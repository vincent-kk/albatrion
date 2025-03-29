---
sidebar_position: 1
---

# 고급 사용법

## 모달 스택 관리

여러 모달을 중첩해서 사용할 때의 처리 방법을 알아보겠습니다.

```tsx
import { createPromiseModal } from '@lerx/promise-modal';
import { Modal } from 'antd';

const showConfirmModal = createPromiseModal(Modal.confirm);

async function handleNestedModals() {
  try {
    // 첫 번째 모달
    const firstResult = await showConfirmModal({
      title: '첫 번째 모달',
      content: '계속 진행하시겠습니까?',
    });

    if (firstResult) {
      // 두 번째 모달
      const secondResult = await showConfirmModal({
        title: '두 번째 모달',
        content: '최종 확인',
      });

      if (secondResult) {
        // 최종 처리
        console.log('모든 확인 완료');
      }
    }
  } catch (error) {
    console.log('모달 스택이 닫힘');
  }
}
```

## 모달 상태 관리

모달 내부의 상태를 효율적으로 관리하는 방법을 알아보겠습니다.

```tsx
import { useCallback, useState } from 'react';

import { createPromiseModal } from '@lerx/promise-modal';
import { Form, Input, Modal } from 'antd';

function FormModal({ onOk, onCancel, ...props }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      onOk(values);
    } catch (error) {
      console.error('폼 검증 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [form, onOk]);

  return (
    <Modal
      {...props}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="이름"
          rules={[{ required: true, message: '이름을 입력하세요' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="이메일"
          rules={[
            { required: true, message: '이메일을 입력하세요' },
            { type: 'email', message: '올바른 이메일 형식이 아닙니다' },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}

const showFormModal = createPromiseModal(FormModal);

async function handleFormSubmit() {
  try {
    const result = await showFormModal({
      title: '사용자 정보 입력',
    });

    if (result) {
      console.log('입력된 정보:', result);
    }
  } catch (error) {
    console.log('모달이 닫힘');
  }
}
```

## 커스텀 훅 사용

모달 로직을 재사용 가능한 훅으로 분리하는 방법을 알아보겠습니다.

```tsx
import { useCallback, useState } from 'react';

import { createPromiseModal } from '@lerx/promise-modal';
import { Modal } from 'antd';

function useConfirmModal() {
  const showConfirmModal = createPromiseModal(Modal.confirm);

  const confirmDelete = useCallback(
    async (title: string, content: string) => {
      try {
        const result = await showConfirmModal({
          title,
          content,
          okText: '삭제',
          cancelText: '취소',
        });

        return result;
      } catch (error) {
        return false;
      }
    },
    [showConfirmModal],
  );

  return { confirmDelete };
}

function useInputModal() {
  const showInputModal = createPromiseModal(InputModal);

  const promptInput = useCallback(
    async (title: string, placeholder: string) => {
      try {
        const result = await showInputModal({
          title,
          placeholder,
        });

        return result;
      } catch (error) {
        return null;
      }
    },
    [showInputModal],
  );

  return { promptInput };
}

// 사용 예시
function MyComponent() {
  const { confirmDelete } = useConfirmModal();
  const { promptInput } = useInputModal();

  const handleDelete = async () => {
    const confirmed = await confirmDelete(
      '삭제 확인',
      '정말 삭제하시겠습니까?',
    );

    if (confirmed) {
      const reason = await promptInput('삭제 사유', '삭제 사유를 입력하세요');

      if (reason) {
        // 삭제 처리
        console.log('삭제 사유:', reason);
      }
    }
  };

  return <button onClick={handleDelete}>삭제</button>;
}
```

## 에러 처리

모달에서 발생할 수 있는 다양한 에러 상황을 처리하는 방법을 알아보겠습니다.

```tsx
import { createPromiseModal } from '@lerx/promise-modal';
import { Modal } from 'antd';

const showConfirmModal = createPromiseModal(Modal.confirm);

async function handleErrorCases() {
  try {
    // 1. 네트워크 에러 처리
    const result = await showConfirmModal({
      title: '데이터 저장',
      content: '저장하시겠습니까?',
    });

    if (result) {
      try {
        await saveData();
      } catch (error) {
        // 저장 실패 시 에러 모달
        await showConfirmModal({
          title: '저장 실패',
          content: '다시 시도하시겠습니까?',
        });
      }
    }
  } catch (error) {
    // 2. 모달 닫힘 에러 처리
    if (error.name === 'ModalClosedError') {
      console.log('사용자가 모달을 닫음');
    } else {
      console.error('예상치 못한 에러:', error);
    }
  }
}

// 3. 타임아웃 처리
async function handleTimeout() {
  const timeout = setTimeout(() => {
    // 모달 강제 닫기
    Modal.destroyAll();
  }, 5000);

  try {
    const result = await showConfirmModal({
      title: '타임아웃 테스트',
      content: '5초 후 자동으로 닫힙니다',
    });

    clearTimeout(timeout);
    if (result) {
      console.log('확인');
    }
  } catch (error) {
    clearTimeout(timeout);
    console.log('모달이 닫힘');
  }
}
```

## 성능 최적화

모달 컴포넌트의 성능을 최적화하는 방법을 알아보겠습니다.

```tsx
import { memo, useCallback } from 'react';

import { createPromiseModal } from '@lerx/promise-modal';
import { Form, Input, Modal } from 'antd';

// 1. 컴포넌트 메모이제이션
const FormItem = memo(({ name, label, rules }) => (
  <Form.Item name={name} label={label} rules={rules}>
    <Input />
  </Form.Item>
));

// 2. 이벤트 핸들러 메모이제이션
function OptimizedModal({ onOk, onCancel, ...props }) {
  const [form] = Form.useForm();

  const handleSubmit = useCallback(async () => {
    const values = await form.validateFields();
    onOk(values);
  }, [form, onOk]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <Modal {...props} onOk={handleSubmit} onCancel={handleCancel}>
      <Form form={form} layout="vertical">
        <FormItem name="name" label="이름" rules={[{ required: true }]} />
        <FormItem
          name="email"
          label="이메일"
          rules={[{ required: true, type: 'email' }]}
        />
      </Form>
    </Modal>
  );
}

// 3. 모달 생성 함수 메모이제이션
const showOptimizedModal = createPromiseModal(OptimizedModal);

// 4. 비동기 데이터 로딩 최적화
async function handleOptimizedDataLoading() {
  const data = await fetchData(); // 데이터 미리 로드

  try {
    const result = await showOptimizedModal({
      title: '데이터 입력',
      initialData: data, // 미리 로드된 데이터 전달
    });

    if (result) {
      console.log('입력된 데이터:', result);
    }
  } catch (error) {
    console.log('모달이 닫힘');
  }
}
```

## 다음 단계

- [API](./api.md)에서 상세한 API 문서를 확인하세요
- [예제](./examples.md)에서 다양한 사용 예제를 살펴보세요
