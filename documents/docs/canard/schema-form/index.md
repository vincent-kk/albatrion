---
sidebar_position: 1
---

# @canard/schema-form

## 소개

`@canard/schema-form`은 스키마 기반의 폼 생성을 위한 강력한 라이브러리입니다. 이 라이브러리는 JSON 스키마를 기반으로 자동으로 폼을 생성하고, 폼 데이터의 유효성을 검증하며, 폼 상태를 관리합니다.

## 주요 기능

- JSON 스키마 기반 폼 자동 생성
- 실시간 폼 데이터 유효성 검증
- 커스터마이즈 가능한 UI 컴포넌트
- 폼 상태 관리
- 에러 처리 및 메시지 표시

## 설치

```bash
npm install @canard/schema-form
# or
yarn add @canard/schema-form
```

## 기본 사용법

```tsx
import { SchemaForm } from '@canard/schema-form';

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '이름',
    },
    age: {
      type: 'number',
      title: '나이',
    },
  },
};

function MyForm() {
  return <SchemaForm schema={schema} onSubmit={(data) => console.log(data)} />;
}
```

## 문서 목차

1. [시작하기](./getting-started.md)
2. [기본 개념](./concepts.md)
3. [API 참조](./api.md)
4. [커스터마이징](./customization.md)
5. [예제](./examples.md)
6. [튜토리얼](./tutorials.md)
