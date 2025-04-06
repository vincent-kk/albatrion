---
sidebar_position: 1
---

# @canard/schema-form-antd-mobile-plugin

## 소개

`@canard/schema-form-antd-mobile-plugin`은 `@canard/schema-form`의 플러그인으로, Ant Design Mobile 컴포넌트를 스키마 폼에서 사용할 수 있게 해주는 패키지입니다.

## 주요 기능

- Ant Design Mobile 컴포넌트를 스키마 폼에서 사용
- Ant Design Mobile의 스타일 시스템과 통합
- 다양한 모바일 폼 컴포넌트 지원
  - Input
  - Select
  - DatePicker
  - Checkbox
  - Radio
  - Switch
  - 등...

## 설치

```bash
npm install @canard/schema-form-antd-mobile-plugin antd-mobile
# or
yarn add @canard/schema-form-antd-mobile-plugin antd-mobile
```

## 기본 사용법

```tsx
import { Form, FormProvider } from '@canard/schema-form';
import { registerAntdMobilePlugin } from '@canard/schema-form-antd-mobile-plugin';

// 플러그인 등록
registerAntdMobilePlugin();

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '이름',
      'ui:widget': 'input',
    },
    type: {
      type: 'string',
      title: '타입',
      'ui:widget': 'select',
      enum: ['A', 'B', 'C'],
    },
  },
};

function MyForm() {
  return (
    <FormProvider>
      <Form schema={schema} onSubmit={(data) => console.log(data)} />
    </FormProvider>
  );
}
```

## 문서 목차

1. [시작하기](./getting-started.md)
2. [컴포넌트](./components.md)
3. [스키마 확장](./schema-extensions.md)
4. [예제](./examples.md)
5. [튜토리얼](./tutorials.md)
