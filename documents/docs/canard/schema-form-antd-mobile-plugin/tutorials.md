---
sidebar_position: 1
---

# 튜토리얼

## 1. 기본 설정

이 튜토리얼에서는 Ant Design Mobile 컴포넌트를 사용하는 폼을 만들어보겠습니다.

### 1.1 프로젝트 설정

먼저 필요한 패키지들을 설치합니다:

```bash
npm install @canard/schema-form @canard/schema-form-antd-mobile-plugin antd-mobile
# or
yarn add @canard/schema-form @canard/schema-form-antd-mobile-plugin antd-mobile
```

### 1.2 기본 폼 구현

```tsx
import { Form, FormProvider } from '@canard/schema-form';
import { registerAntdMobilePlugin } from '@canard/schema-form-antd-mobile-plugin';
import 'antd-mobile/es/global';

// 플러그인 등록
registerAntdMobilePlugin();

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
  },
};

function BasicForm() {
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

## 2. 레이아웃 설정

폼의 레이아웃을 설정해보겠습니다.

### 2.1 수평 레이아웃

```tsx
const schema = {
  type: 'object',
  'ui:layout': 'horizontal',
  'ui:labelCol': { span: 6 },
  'ui:wrapperCol': { span: 18 },
  properties: {
    name: {
      type: 'string',
      title: '이름',
      'ui:widget': 'input',
    },
    email: {
      type: 'string',
      title: '이메일',
      'ui:widget': 'input',
      'ui:type': 'email',
    },
  },
};
```

### 2.2 인라인 레이아웃

```tsx
const schema = {
  type: 'object',
  'ui:layout': 'inline',
  properties: {
    keyword: {
      type: 'string',
      title: '검색어',
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
```

## 3. 그룹화

관련된 필드들을 그룹화해보겠습니다.

### 3.1 기본 그룹화

```tsx
const schema = {
  type: 'object',
  properties: {
    personalInfo: {
      type: 'object',
      title: '개인 정보',
      'ui:group': true,
      properties: {
        name: {
          type: 'string',
          title: '이름',
          'ui:widget': 'input',
        },
        email: {
          type: 'string',
          title: '이메일',
          'ui:widget': 'input',
          'ui:type': 'email',
        },
      },
    },
  },
};
```

### 3.2 스타일이 적용된 그룹화

```tsx
const schema = {
  type: 'object',
  properties: {
    personalInfo: {
      type: 'object',
      title: '개인 정보',
      'ui:group': true,
      'ui:groupStyle': {
        border: '1px solid #d9d9d9',
        padding: '16px',
        borderRadius: '4px',
      },
      properties: {
        name: {
          type: 'string',
          title: '이름',
          'ui:widget': 'input',
        },
        email: {
          type: 'string',
          title: '이메일',
          'ui:widget': 'input',
          'ui:type': 'email',
        },
      },
    },
  },
};
```

## 4. 고급 컴포넌트 사용

더 복잡한 컴포넌트들을 사용해보겠습니다.

### 4.1 DatePicker와 TimePicker

```tsx
const schema = {
  type: 'object',
  properties: {
    date: {
      type: 'string',
      title: '날짜',
      'ui:widget': 'datepicker',
      'ui:showTime': true,
      'ui:format': 'YYYY-MM-DD HH:mm:ss',
    },
    time: {
      type: 'string',
      title: '시간',
      'ui:widget': 'timepicker',
      'ui:format': 'HH:mm:ss',
    },
  },
};
```

### 4.2 다중 선택

```tsx
const schema = {
  type: 'object',
  properties: {
    tags: {
      type: 'array',
      title: '태그',
      'ui:widget': 'select',
      'ui:mode': 'tags',
      'ui:placeholder': '태그를 입력하세요',
      items: {
        type: 'string',
      },
    },
    categories: {
      type: 'array',
      title: '카테고리',
      'ui:widget': 'select',
      'ui:mode': 'multiple',
      'ui:showSearch': true,
      items: {
        type: 'string',
        enum: ['전자', '의류', '식품', '도서'],
      },
    },
  },
};
```

## 5. 폼 검증

폼에 유효성 검증을 추가해보겠습니다.

### 5.1 기본 검증

```tsx
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '이름',
      'ui:widget': 'input',
      minLength: 2,
      maxLength: 20,
    },
    email: {
      type: 'string',
      title: '이메일',
      'ui:widget': 'input',
      'ui:type': 'email',
      format: 'email',
    },
    age: {
      type: 'number',
      title: '나이',
      'ui:widget': 'inputnumber',
      minimum: 0,
      maximum: 150,
    },
  },
  required: ['name', 'email', 'age'],
};
```

### 5.2 커스텀 검증

```tsx
import Ajv from 'ajv';

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
});

// 비밀번호 복잡도 검증
ajv.addKeyword('passwordStrength', {
  validate: (schema, data) => {
    const hasUpperCase = /[A-Z]/.test(data);
    const hasLowerCase = /[a-z]/.test(data);
    const hasNumbers = /\d/.test(data);
    const hasSpecialChar = /[!@#$%^&*]/.test(data);

    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  },
});

const schema = {
  type: 'object',
  properties: {
    password: {
      type: 'string',
      title: '비밀번호',
      'ui:widget': 'input',
      'ui:type': 'password',
      minLength: 8,
      passwordStrength: true,
    },
  },
};

function FormWithValidation() {
  return (
    <FormProvider>
      <Form
        schema={schema}
        ajv={ajv}
        onSubmit={(data) => {
          console.log('제출된 데이터:', data);
        }}
      />
    </FormProvider>
  );
}
```

## 다음 단계

- [예제](./examples.md)에서 더 많은 사용 사례를 살펴보세요
- [컴포넌트](./components.md)에서 각 컴포넌트의 상세 사용법을 확인하세요
- [스키마 확장](./schema-extensions.md)에서 스키마에 추가할 수 있는 UI 속성들을 확인하세요
