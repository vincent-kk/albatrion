# @canard/schema-form-inline-validation-message-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Json Schema Form Plugin](https://img.shields.io/badge/JsonSchemaForm-validator-green.svg)]()

---

## 개요

`@canard/schema-form-inline-validation-message-plugin`은 커스텀 검증 메시지 정의 방식을 지원하는 `@canard/schema-form`용 플러그인입니다.

---

## 안내사항

📌 이 플러그인은 커스텀 검증 메시지 정의 방식을 지원합니다.
📌 이 플러그인은 유효성 검증 기능을 포함하지 않습니다. 유효성 검증 기능을 사용하려면 다음 플러그인 중 하나를 사용하거나, 직접 구현한 유효성 검증기를 적용해야 합니다.

- [@canard/schema-form-ajv6-plugin](../schema-form-ajv6-plugin/README-ko_kr.md)
- [@canard/schema-form-ajv7-plugin](../schema-form-ajv7-plugin/README-ko_kr.md)
- [@canard/schema-form-ajv8-plugin](../schema-form-ajv8-plugin/README-ko_kr.md)

---

## 사용 방법

```bash
yarn add @canard/schema-form @canard/schema-form-inline-validation-message-plugin
```

```tsx
import { SchemaForm, registerPlugin } from '@canard/schema-form';
import { plugin as ajv8Plugin } from '@canard/schema-form-ajv8-plugin';
import { plugin as inlineValidationMessagePlugin } from '@canard/schema-form-inline-validation-message-plugin';

// validator를 사용해야 유효성 검증 에러가 발생합니다.
registerPlugin(ajv8Plugin);
// validator 플러그인을 전역으로 등록
registerPlugin(inlineValidationMessagePlugin);

// 커스텀 검증 메시지 정의 방식을 지원합니다.
// 예시:
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      maxLength: 10,
      options: {
        validationMessage: {
          minLength:
            '이름은 최소 {limit} 글자 이상이어야 합니다. 현재 값: {value}',
          maxLength:
            '이름은 최대 {limit} 글자 이하여야 합니다. 현재 값: {value}',
          required: '이름은 필수 입력 항목입니다.',
        },
      },
    },
  },
  required: ['name'],
};

<Form jsonSchema={schema} />;
```

---

## 라이선스

이 저장소는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [`LICENSE`](../../../LICENSE) 파일을 참조하세요.

---

## 연락처

프로젝트와 관련된 문의나 제안은 [GitHub 저장소](https://github.com/vincent-kk/albatrion)에 이슈를 생성해 주세요.
