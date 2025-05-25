# @canard/schema-form-antd-mobile-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Ant Design Mobile](https://img.shields.io/badge/antd-mobile-blue.svg)]()
[![Json Schema Form Plugin](https://img.shields.io/badge/JsonSchemaForm-plugin-pink.svg)]()

---

## 개요

`@canard/schema-form-antd-mobile-plugin`은 Ant Design Mobile 컴포넌트를 제공하는 `@canard/schema-form`용 플러그인입니다.

---

## 사용 방법

```bash
yarn add @canard/schema-form @canard/schema-form-antd-mobile-plugin
```

```tsx
import { SchemaForm, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd-mobile-plugin';

// 플러그인이 전역으로 등록됩니다
registerPlugin(plugin);
```

---

## 호환성 안내

`@canard/schema-form-antd-mobile-plugin`은 ECMAScript 2022 (ES2022) 문법으로 작성되었습니다. ES2022보다 낮은 버전의 JavaScript 환경에서 사용하시는 경우, 별도의 트랜스파일 과정이 필요합니다.

**지원 환경:**

- Node.js 16.11.0 이상
- 최신 브라우저 (Chrome 94+, Firefox 93+, Safari 15+)

**레거시 환경 지원이 필요한 경우:**
Babel 등의 트랜스파일러를 사용하여 타겟 환경에 맞게 변환해주세요.

---

## 라이선스

이 저장소는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [`LICENSE`](./LICENSE) 파일을 참조하세요.

---

## 연락처

프로젝트와 관련된 문의나 제안은 이슈를 생성해 주세요.
