---
sidebar_position: 2
---

# 시작하기

## 개발 사상

`@canard/schema-form`은 다음과 같은 핵심 사상들을 바탕으로 설계되었습니다:

1. **선언적 폼 정의**

   - JSON 스키마를 통해 폼의 구조와 유효성 검증 규칙을 선언적으로 정의
   - 코드의 복잡성을 줄이고 유지보수성 향상

2. **유연한 확장성**

   - 플러그인 시스템을 통한 기능 확장
   - 커스텀 컴포넌트와 렌더러 지원

3. **강력한 타입 안정성**
   - TypeScript를 통한 완벽한 타입 추론
   - 개발 시점의 오류 감지

## 기본 설정

### 1. 패키지 설치

```bash
npm install @canard/schema-form
# or
yarn add @canard/schema-form
```

### 2. 필요한 의존성 설치

```bash
npm install @aileron/core @aileron/hooks
# or
yarn add @aileron/core @aileron/hooks
```

### 3. 기본 사용 예제

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

### FormProvider

폼의 전역 상태와 컨텍스트를 제공하는 컴포넌트입니다.

### Form

스키마를 기반으로 폼을 렌더링하는 메인 컴포넌트입니다.

## 다음 단계

- [기본 개념](./concepts.md)에서 스키마 정의와 폼 구조에 대해 자세히 알아보세요
- [API 참조](./api.md)에서 사용 가능한 모든 props와 메서드를 확인하세요
- [예제](./examples.md)에서 다양한 사용 사례를 살펴보세요
