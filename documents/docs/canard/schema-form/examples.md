---
sidebar_position: 1
---

# 예제

## 기본 폼

가장 기본적인 폼 예제입니다.

```tsx
import { Form, FormProvider } from '@canard/schema-form';

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '이름',
      description: '실명을 입력해주세요',
    },
    email: {
      type: 'string',
      title: '이메일',
      format: 'email',
    },
    age: {
      type: 'number',
      title: '나이',
      minimum: 0,
      maximum: 150,
    },
  },
  required: ['name', 'email'],
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

## 중첩된 폼

객체와 배열을 포함한 복잡한 폼 예제입니다.

```tsx
const schema = {
  type: 'object',
  properties: {
    personalInfo: {
      type: 'object',
      title: '개인 정보',
      properties: {
        name: {
          type: 'string',
          title: '이름',
        },
        address: {
          type: 'object',
          title: '주소',
          properties: {
            street: {
              type: 'string',
              title: '거리',
            },
            city: {
              type: 'string',
              title: '도시',
            },
          },
        },
      },
    },
    hobbies: {
      type: 'array',
      title: '취미',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            title: '취미 이름',
          },
          level: {
            type: 'string',
            title: '수준',
            enum: ['초급', '중급', '고급'],
          },
        },
      },
    },
  },
};
```

## 조건부 필드

다른 필드의 값에 따라 표시되는 조건부 필드 예제입니다.

```tsx
const schema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      title: '타입',
      enum: ['개인', '기업'],
    },
    companyName: {
      type: 'string',
      title: '회사명',
      dependencies: {
        type: {
          value: '기업',
        },
      },
    },
    personalName: {
      type: 'string',
      title: '개인명',
      dependencies: {
        type: {
          value: '개인',
        },
      },
    },
  },
};
```

## 커스텀 컴포넌트

커스텀 컴포넌트를 사용하는 예제입니다.

```tsx
import { DatePicker } from 'your-date-picker-library';

const customFormType = {
  name: 'date-picker',
  test: (schema) => schema.type === 'string' && schema.format === 'date',
  component: DatePicker,
};

const schema = {
  type: 'object',
  properties: {
    birthDate: {
      type: 'string',
      format: 'date',
      title: '생년월일',
    },
  },
};

function CustomForm() {
  return (
    <FormProvider>
      <Form
        schema={schema}
        formTypeInputMap={{
          'date-picker': customFormType,
        }}
      />
    </FormProvider>
  );
}
```

## 플러그인 사용

플러그인을 사용하여 폼 기능을 확장하는 예제입니다.

```tsx
const validationPlugin = {
  name: 'validation-plugin',
  setup: (form) => {
    form.on('validate', (errors) => {
      if (errors.length > 0) {
        console.error('유효성 검증 실패:', errors);
      }
    });
  },
};

const schema = {
  type: 'object',
  properties: {
    password: {
      type: 'string',
      title: '비밀번호',
      minLength: 8,
    },
    confirmPassword: {
      type: 'string',
      title: '비밀번호 확인',
      minLength: 8,
    },
  },
};

function FormWithPlugin() {
  return (
    <FormProvider>
      <Form schema={schema} plugins={[validationPlugin]} />
    </FormProvider>
  );
}
```

## 다음 단계

- [튜토리얼](./tutorials.md)에서 단계별로 폼을 구현하는 방법을 배워보세요
- [API 참조](./api.md)에서 더 자세한 API 정보를 확인하세요
