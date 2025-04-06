---
sidebar_position: 1
---

# 튜토리얼

## 1. 기본 폼 만들기

이 튜토리얼에서는 간단한 회원가입 폼을 만들어보겠습니다.

### 1.1 프로젝트 설정

먼저 필요한 패키지들을 설치합니다:

```bash
npm install @canard/schema-form @aileron/core @aileron/hooks
# or
yarn add @canard/schema-form @aileron/core @aileron/hooks
```

### 1.2 기본 폼 구현

```tsx
import { Form, FormProvider } from '@canard/schema-form';

const schema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      title: '아이디',
      minLength: 3,
      maxLength: 20,
    },
    password: {
      type: 'string',
      title: '비밀번호',
      minLength: 8,
      format: 'password',
    },
    email: {
      type: 'string',
      title: '이메일',
      format: 'email',
    },
  },
  required: ['username', 'password', 'email'],
};

function SignUpForm() {
  return (
    <FormProvider>
      <Form
        schema={schema}
        onSubmit={(data) => {
          console.log('회원가입 데이터:', data);
        }}
      />
    </FormProvider>
  );
}
```

## 2. 폼 스타일링

이제 폼의 스타일을 커스터마이즈해보겠습니다.

### 2.1 스타일 컴포넌트 적용

```tsx
import styled from 'styled-components';

const StyledForm = styled(Form)`
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }

  .form-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;

    &:focus {
      outline: none;
      border-color: #007bff;
    }
  }

  .form-error {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
`;

function StyledSignUpForm() {
  return (
    <FormProvider>
      <StyledForm
        schema={schema}
        onSubmit={(data) => {
          console.log('회원가입 데이터:', data);
        }}
      />
    </FormProvider>
  );
}
```

## 3. 유효성 검증 추가

폼에 더 복잡한 유효성 검증을 추가해보겠습니다.

### 3.1 AJV 인스턴스 설정

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
      minLength: 8,
      format: 'password',
      passwordStrength: true,
    },
  },
};

function FormWithValidation() {
  return (
    <FormProvider>
      <StyledForm
        schema={schema}
        ajv={ajv}
        onSubmit={(data) => {
          console.log('회원가입 데이터:', data);
        }}
      />
    </FormProvider>
  );
}
```

## 4. 조건부 필드 추가

회원 타입에 따라 다른 필드를 보여주는 조건부 폼을 만들어보겠습니다.

### 4.1 스키마 확장

```tsx
const schema = {
  type: 'object',
  properties: {
    memberType: {
      type: 'string',
      title: '회원 유형',
      enum: ['개인', '기업'],
      default: '개인',
    },
    personalInfo: {
      type: 'object',
      title: '개인 정보',
      dependencies: {
        memberType: {
          value: '개인',
        },
      },
      properties: {
        name: {
          type: 'string',
          title: '이름',
        },
        phone: {
          type: 'string',
          title: '전화번호',
        },
      },
    },
    companyInfo: {
      type: 'object',
      title: '회사 정보',
      dependencies: {
        memberType: {
          value: '기업',
        },
      },
      properties: {
        companyName: {
          type: 'string',
          title: '회사명',
        },
        businessNumber: {
          type: 'string',
          title: '사업자등록번호',
        },
      },
    },
  },
};
```

## 5. 플러그인 개발

마지막으로 폼 기능을 확장하는 플러그인을 만들어보겠습니다.

### 5.1 자동 저장 플러그인

```tsx
const autoSavePlugin = {
  name: 'auto-save',
  setup: (form) => {
    let saveTimeout: NodeJS.Timeout;

    form.on('change', (value) => {
      clearTimeout(saveTimeout);

      saveTimeout = setTimeout(() => {
        // 자동 저장 로직
        localStorage.setItem('form-draft', JSON.stringify(value));
        console.log('자동 저장 완료');
      }, 1000);
    });

    // 초기 데이터 로드
    const savedData = localStorage.getItem('form-draft');
    if (savedData) {
      form.setValue(JSON.parse(savedData));
    }
  },
};

function FormWithAutoSave() {
  return (
    <FormProvider>
      <StyledForm
        schema={schema}
        plugins={[autoSavePlugin]}
        onSubmit={(data) => {
          // 제출 시 저장된 초안 삭제
          localStorage.removeItem('form-draft');
          console.log('회원가입 데이터:', data);
        }}
      />
    </FormProvider>
  );
}
```

## 다음 단계

- [예제](./examples.md)에서 더 많은 사용 사례를 살펴보세요
- [API 참조](./api.md)에서 더 자세한 API 정보를 확인하세요
- [커스터마이징](./customization.md)에서 폼을 더 커스터마이즈하는 방법을 배워보세요
