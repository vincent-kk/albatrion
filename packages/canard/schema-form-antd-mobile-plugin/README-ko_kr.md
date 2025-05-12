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

## 브라우저 지원

`@canard/schema-form-antd-mobile-plugin`은 모든 현대 브라우저(Chrome, Firefox, Safari, Edge)를 지원하지만 IE11은 지원하지 않습니다.

---

## 라이선스

이 저장소는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [`LICENSE`](./LICENSE) 파일을 참조하세요.

---

## 연락처

프로젝트와 관련된 문의나 제안은 이슈를 생성해 주세요.
