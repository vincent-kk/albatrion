# @canard/schema-form-ajv6-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![AJV](https://img.shields.io/badge/AJV-6.x-orange.svg)]()
[![JSON Schema Form Plugin](https://img.shields.io/badge/JSONSchemaForm-validator-green.svg)]()

---

## 개요

`@canard/schema-form-ajv6-plugin`은 AJV 6.x를 사용하여 JSON Schema 검증 기능을 제공하는 `@canard/schema-form`용 validator 플러그인입니다.

---

## 안내사항

⚠️ 이 플러그인은 AJV 6.x를 사용하며, 구버전 JSON Schema 명세(Draft-07 이하)와 호환됩니다.

📌 최신 JSON Schema 기능(Draft 2019-09, Draft 2020-12)이 필요한 경우 `@canard/schema-form-ajv8-plugin` 사용을 고려해주세요.

💡 이 플러그인은 상세한 오류 보고 및 커스텀 검증 지원과 함께 완전한 JSON Schema 검증 솔루션을 제공합니다.

---

## 사용 방법

```bash
yarn add @canard/schema-form @canard/schema-form-ajv6-plugin
```

```tsx
import { SchemaForm, registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv6-plugin';
// 또는 커스텀 AJV 인스턴스와 함께 등록
import Ajv from 'ajv';

// validator 플러그인을 전역으로 등록
registerPlugin(ajvValidatorPlugin);

// 커스텀 AJV 인스턴스를 사용하는 경우
const customAjv = new Ajv({
  allErrors: true,
  nullable: true,
  verbose: true,
});
ajvValidatorPlugin.bind(customAjv);
registerPlugin(ajvValidatorPlugin);
```

---

## 기능

### **플러그인 인터페이스**

이 플러그인은 `ValidatorPlugin` 인터페이스를 구현하여 두 가지 주요 메서드를 제공합니다:

#### **`bind(instance: Ajv.Ajv)`**

- **목적**: 선호하는 설정으로 구성된 커스텀 AJV 인스턴스를 제공할 수 있습니다
- **사용법**: 선택적 - 호출하지 않으면 기본 AJV 인스턴스가 자동으로 생성됩니다
- **장점**: AJV 설정, 커스텀 키워드, 포맷, 검증 규칙에 대한 완전한 제어 가능

#### **`compile(jsonSchema)`**

- **목적**: 제공된 JSON Schema로부터 validator 함수를 생성합니다
- **반환값**: 스키마에 대해 데이터를 검증할 수 있는 validator factory 함수
- **기능**: 자동 오류 변환, 상세한 검증 메시지, 성능 최적화

### **기본 설정**

커스텀 AJV 인스턴스가 제공되지 않은 경우, 플러그인은 다음 기본 설정을 사용합니다:

```typescript
const defaultSettings: Ajv.Options = {
  allErrors: true, // 첫 번째 오류뿐만 아니라 모든 검증 오류 수집
  nullable: true, // nullable keyword 활성화 (= `type:[{type}, 'null']`)
  verbose: true, // 오류에 스키마 및 데이터 정보 포함
  format: false, // 포맷 검증 비활성화 (필요시 활성화 가능)
};
```

### **Validator Factory**

`createValidatorFactory` 함수는 다음을 제공합니다:

- **오류 표준화**: AJV 오류를 일관된 형식으로 변환
- **성능 최적화**: 재사용을 위한 컴파일된 validator 캐시
- **상세한 오류 메시지**: 더 나은 사용자 경험을 위한 풍부한 오류 정보
- **타입 안전성**: 적절한 타입 추론과 함께 완전한 TypeScript 지원

---

## 호환성

`@canard/schema-form-ajv6-plugin`은 ECMAScript 2020 (ES2020) 문법으로 구축되었으며 AJV 6.x를 지원합니다.

**지원 환경:**

- Node.js 14.17.0 이상
- 최신 브라우저 (Chrome 91+, Firefox 90+, Safari 14+)
- AJV 6.0.0 이상

**레거시 환경 지원이 필요한 경우:**
Babel 등의 트랜스파일러를 사용하여 타겟 환경에 맞게 변환해주세요.

**의존성 요구사항:**

- @canard/schema-form (peer dependency)
- ajv ^6.0.0

**JSON Schema 지원:**

- Draft-04
- Draft-06
- Draft-07

---

## 마이그레이션 가이드

### 수동 AJV 사용에서 마이그레이션

```typescript
// 이전 (수동 AJV)
// 이후 (플러그인 사용)
import { SchemaForm, registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv6-plugin';
import Ajv from 'ajv';

const ajv = new Ajv();
const validate = ajv.compile(schema);
const isValid = validate(data);

registerPlugin(ajvValidatorPlugin);
// 이제 검증은 SchemaForm에 의해 자동으로 처리됩니다
```

### AJV 8.x로 업그레이드

최신 JSON Schema 기능을 위해 AJV 8.x로 업그레이드가 필요한 경우:

```bash
yarn remove @canard/schema-form-ajv6-plugin
yarn add @canard/schema-form-ajv8-plugin
```

```typescript
// import 업데이트
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
```

---

## 라이선스

이 저장소는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [`LICENSE`](../../../LICENSE) 파일을 참조하세요.

---

## 연락처

프로젝트와 관련된 문의나 제안은 [GitHub 저장소](https://github.com/vincent-kk/albatrion)에 이슈를 생성해 주세요.
