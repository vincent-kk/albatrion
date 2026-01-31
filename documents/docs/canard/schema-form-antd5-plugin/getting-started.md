---
sidebar_position: 1
---

# 시작하기

## 개발 사상

`@canard/schema-form-antd5-plugin`은 다음과 같은 핵심 사상들을 바탕으로 설계되었습니다:

1. **Ant Design 통합**

   - Ant Design의 디자인 시스템과 완벽한 통합
   - 일관된 사용자 경험 제공

2. **선언적 UI 정의**

   - JSON 스키마를 통한 UI 컴포넌트 선언
   - 코드의 복잡성 감소

3. **확장성**
   - Ant Design의 모든 폼 컴포넌트 지원
   - 커스텀 컴포넌트 추가 가능

## 기본 설정

### 1. 패키지 설치

```bash
npm install @canard/schema-form-antd5-plugin antd
# or
yarn add @canard/schema-form-antd5-plugin antd
```

### 2. Ant Design 스타일 import

```tsx
import 'antd/dist/antd.css';
// Ant Design v4
// or
import 'antd/dist/reset.css';

// Ant Design v5
```

### 3. 플러그인 등록

```tsx
import { registerAntdPlugin } from '@canard/schema-form-antd5-plugin';

// 플러그인 등록
registerAntdPlugin();
```

## 기본 사용 예제

```tsx
import { Form, FormProvider } from '@canard/schema-form';
import { registerAntdPlugin } from '@canard/schema-form-antd5-plugin';
import 'antd/dist/antd.css';

// 플러그인 등록
registerAntdPlugin();

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '이름',
      'ui:widget': 'input',
      'ui:placeholder': '이름을 입력하세요',
    },
    email: {
      type: 'string',
      title: '이메일',
      'ui:widget': 'input',
      'ui:type': 'email',
      'ui:placeholder': '이메일을 입력하세요',
    },
    type: {
      type: 'string',
      title: '타입',
      'ui:widget': 'select',
      enum: ['개인', '기업'],
      'ui:placeholder': '타입을 선택하세요',
    },
    isActive: {
      type: 'boolean',
      title: '활성화',
      'ui:widget': 'switch',
      default: true,
    },
  },
  required: ['name', 'email', 'type'],
};

function MyForm() {
  return (
    <FormProvider>
      <Form
        schema={schema}
        onSubmit={(data) => {
          console.log('제출된 데이터:', data);
        }}
      />
    </FormProvider>
  );
}
```

## 주요 컴포넌트

### Input

텍스트 입력을 위한 기본 컴포넌트입니다.

### Select

드롭다운 선택을 위한 컴포넌트입니다.

### DatePicker

날짜 선택을 위한 컴포넌트입니다.

### Checkbox

체크박스 선택을 위한 컴포넌트입니다.

### Radio

라디오 버튼 선택을 위한 컴포넌트입니다.

### Switch

토글 스위치를 위한 컴포넌트입니다.

## 다음 단계

- [컴포넌트](./components.md)에서 각 컴포넌트의 상세 사용법을 알아보세요
- [스키마 확장](./schema-extensions.md)에서 스키마에 추가할 수 있는 UI 속성들을 확인하세요
- [예제](./examples.md)에서 다양한 사용 사례를 살펴보세요
