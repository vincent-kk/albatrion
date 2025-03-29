---
sidebar_position: 1
---

# 커스터마이징

## 커스텀 폼 타입

`@canard/schema-form`은 다양한 폼 타입을 지원하며, 필요에 따라 커스텀 폼 타입을 추가할 수 있습니다.

### 커스텀 폼 타입 정의

```tsx
import { registerPlugin } from '@canard/schema-form';

const customFormType = {
  name: 'custom-input',
  test: (schema) => schema.type === 'string' && schema.format === 'custom',
  component: CustomInputComponent,
};

registerPlugin({
  name: 'custom-form-type',
  setup: (form) => {
    form.addFormType(customFormType);
  },
});
```

### 스키마에서 사용하기

```tsx
const schema = {
  type: 'object',
  properties: {
    customField: {
      type: 'string',
      format: 'custom',
      title: '커스텀 입력',
    },
  },
};
```

## 스타일 커스터마이징

### CSS 클래스 커스터마이징

```tsx
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '이름',
      className: 'custom-input-class',
    },
  },
};
```

### 스타일 컴포넌트 사용

```tsx
import styled from 'styled-components';

const StyledForm = styled(Form)`
  .form-group {
    margin-bottom: 1rem;
  }

  .form-label {
    font-weight: bold;
  }

  .form-input {
    border: 1px solid #ccc;
    padding: 0.5rem;
  }
`;
```

## 에러 메시지 커스터마이징

### 에러 메시지 포맷팅

```tsx
const formatError = (error) => {
  return `${error.field}: ${error.message}`;
};

<Form schema={schema} formatError={formatError} />;
```

### 에러 표시 위치

```tsx
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '이름',
      errorPosition: 'top', // 'top' | 'bottom' | 'inline'
    },
  },
};
```

## 유효성 검증 커스터마이징

### AJV 인스턴스 커스터마이징

```tsx
import Ajv from 'ajv';

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
});

// 커스텀 키워드 추가
ajv.addKeyword('customValidation', {
  validate: (schema, data) => {
    // 커스텀 유효성 검증 로직
    return true;
  },
});

<Form schema={schema} ajv={ajv} />;
```

### 유효성 검증 모드 설정

```tsx
<Form
  schema={schema}
  validationMode="onChange" // 'onChange' | 'onBlur' | 'onSubmit'
/>
```

## 플러그인 시스템

### 플러그인 작성

```tsx
const myPlugin = {
  name: 'my-plugin',
  setup: (form) => {
    // 폼 초기화 시 실행
    form.on('change', (value) => {
      console.log('값이 변경됨:', value);
    });

    // 폼 제출 시 실행
    form.on('submit', (value) => {
      console.log('폼이 제출됨:', value);
    });
  },
};

registerPlugin(myPlugin);
```

### 플러그인 사용

```tsx
<Form schema={schema} plugins={[myPlugin]} />
```

## 다음 단계

- [예제](./examples.md)에서 다양한 커스터마이징 사례를 살펴보세요
- [튜토리얼](./tutorials.md)에서 단계별로 커스터마이징을 적용하는 방법을 배워보세요
