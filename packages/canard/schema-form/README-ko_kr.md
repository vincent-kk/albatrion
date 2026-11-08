# @canard/schema-form

[English](./README.md) | 한국어

JSON Schema로 React 폼을 구성하고, 플러그인으로 검증과 UI를 확장합니다.

## 설치

```bash
yarn add @canard/schema-form
```

## 최소 예제

```tsx
import { Form } from '@canard/schema-form';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
    password: { type: 'string' },
  },
} as const;

export default function App() {
  return <Form jsonSchema={schema} />;
}
```

코어의 기본 입력을 사용하는 예제입니다. 검증이 필요하면 아래 검증기 플러그인을 등록하십시오.

## 플러그인

- [`@canard/schema-form-ajv8-plugin`](https://vincent-kk.github.io/albatrion/ko/docs/canard/schema-form-ajv8-plugin): AJV 8
- [`@canard/schema-form-ajv7-plugin`](https://vincent-kk.github.io/albatrion/ko/docs/canard/schema-form-ajv7-plugin): AJV 7
- [`@canard/schema-form-ajv6-plugin`](https://vincent-kk.github.io/albatrion/ko/docs/canard/schema-form-ajv6-plugin): AJV 6
- [`@canard/schema-form-antd6-plugin`](https://vincent-kk.github.io/albatrion/ko/docs/canard/schema-form-antd6-plugin): Ant Design 6
- [`@canard/schema-form-antd5-plugin`](https://vincent-kk.github.io/albatrion/ko/docs/canard/schema-form-antd5-plugin): Ant Design 5
- [`@canard/schema-form-antd-mobile-plugin`](https://vincent-kk.github.io/albatrion/ko/docs/canard/schema-form-antd-mobile-plugin): Ant Design Mobile
- [`@canard/schema-form-mui-plugin`](https://vincent-kk.github.io/albatrion/ko/docs/canard/schema-form-mui-plugin): Material UI

## 문서

- [설치와 플러그인 등록](https://vincent-kk.github.io/albatrion/ko/docs/canard/schema-form/quick-start)
- [핵심 개념](https://vincent-kk.github.io/albatrion/ko/docs/canard/schema-form/core-concepts)
- [스키마와 controls](https://vincent-kk.github.io/albatrion/ko/docs/canard/schema-form/schema-reference)
- [검증](https://vincent-kk.github.io/albatrion/ko/docs/canard/schema-form/validation)
- [API 참조](https://vincent-kk.github.io/albatrion/ko/docs/canard/schema-form/api-reference)
- [오류 참조](https://vincent-kk.github.io/albatrion/ko/docs/canard/schema-form/error-reference)
- [예제](https://vincent-kk.github.io/albatrion/ko/docs/canard/schema-form/examples)
- [0.x에서 이주](https://vincent-kk.github.io/albatrion/ko/docs/canard/schema-form/migration-from-0x)
- [코딩 에이전트 자산](https://vincent-kk.github.io/albatrion/ko/docs/canard/schema-form#agent-assets)

기존 애플리케이션은 위 이주 가이드를 따라 변경하십시오. 패키지에 포함된 [소비자 이주 프롬프트](./docs/agents/skills/schema-form-skill/knowledge/migration-from-0x.md)는 코딩 에이전트가 애플리케이션 수정과 검증을 수행하도록 안내합니다.
