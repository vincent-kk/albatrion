# @canard/schema-form-ajv8-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![AJV](https://img.shields.io/badge/AJV-8.x-orange.svg)]()
[![Json Schema Form Plugin](https://img.shields.io/badge/JsonSchemaForm-validator-green.svg)]()

---

## 개요

`@canard/schema-form-ajv8-plugin`은 최신 JSON Schema 명세를 지원하는 AJV 8.x를 사용하여 JSON Schema 검증 기능을 제공하는 `@canard/schema-form`용 validator 플러그인입니다.

---

## 안내사항

⚠️ 이 플러그인은 AJV 8.x를 사용하며, Draft 2019-09 및 Draft 2020-12를 포함한 최신 JSON Schema 명세를 지원합니다.

📌 구 JSON Schema 드래프트와의 호환성이나 레거시 환경이 필요한 프로젝트의 경우 `@canard/schema-form-ajv6-plugin` 사용을 고려해주세요.

💡 이 플러그인은 향상된 성능, 더 나은 오류 메시지, 최신 JSON Schema 기능 지원과 함께 강화된 JSON Schema 검증을 제공합니다.

---

## 사용 방법

```bash
yarn add @canard/schema-form @canard/schema-form-ajv8-plugin
```

```tsx
import { SchemaForm, registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
// 또는 커스텀 AJV 인스턴스와 함께 등록
import Ajv from 'ajv';

// validator 플러그인을 전역으로 등록
registerPlugin(ajvValidatorPlugin);

const customAjv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false, // AJV 8.x 전용 옵션
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

커스텀 AJV 인스턴스가 제공되지 않은 경우, 플러그인은 AJV 8.x에 최적화된 다음 기본 설정을 사용합니다:

```typescript
const defaultSettings: Ajv.Options = {
  allErrors: true, // 첫 번째 오류뿐만 아니라 모든 검증 오류 수집
  verbose: true, // 오류에 스키마 및 데이터 정보 포함
  strict: false, // 더 나은 호환성을 위한 strict 모드 비활성화
  validateFormats: true, // 포맷 검증 활성화 (AJV 8.x 기본값)
};
```

### **강화된 Validator Factory**

`createValidatorFactory` 함수는 다음을 제공합니다:

- **고급 오류 처리**: `@winglet/common-utils`를 사용한 향상된 오류 변환
- **JSON Path 통합**: `@winglet/json`을 통한 정확한 오류 위치 추적
- **성능 최적화**: 향상된 캐싱 및 검증 속도
- **풍부한 오류 컨텍스트**: 더 나은 디버깅을 위한 상세한 오류 정보
- **타입 안전성**: 고급 타입 추론과 함께 완전한 TypeScript 지원

### **최신 JSON Schema 지원**

이 플러그인은 최신 JSON Schema 기능을 지원합니다:

- **Draft 2020-12**: 향상된 조건부 로직이 포함된 최신 명세
- **Draft 2019-09**: 현대적인 스키마 구성 및 검증 기능
- **하위 호환성**: Draft-07, Draft-06, Draft-04에 대한 완전한 지원
- **고급 키워드**: `unevaluatedProperties`, `unevaluatedItems` 등 지원

---

## 호환성

`@canard/schema-form-ajv8-plugin`은 ECMAScript 2020 (ES2020) 문법으로 구축되었으며 AJV 8.x를 지원합니다.

**지원 환경:**

- Node.js 16.0.0 이상 (AJV 8.x 권장 환경)
- 최신 브라우저 (Chrome 91+, Firefox 90+, Safari 14+)
- AJV 8.0.0 이상

**레거시 환경 지원이 필요한 경우:**
Babel 등의 트랜스파일러를 사용하여 타겟 환경에 맞게 변환해주세요.

**의존성 요구사항:**

- @canard/schema-form (peer dependency)
- @winglet/common-utils (workspace dependency)
- @winglet/json (workspace dependency)
- ajv ^8.0.0

**JSON Schema 지원:**

- Draft 2020-12 ✅
- Draft 2019-09 ✅
- Draft-07 ✅
- Draft-06 ✅
- Draft-04 ✅

---

## 마이그레이션 가이드

### AJV 6.x 플러그인에서 업그레이드

AJV 6.x 플러그인에서 업그레이드하는 경우:

```bash
yarn remove @canard/schema-form-ajv6-plugin
yarn add @canard/schema-form-ajv8-plugin
```

```typescript
// import 업데이트
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

// 주의: AJV 8.x는 다른 기본 동작을 가집니다
// AJV 설정을 조정해야 할 수 있습니다
const customAjv = new Ajv({
  strict: false, // 호환성 문제가 있는 경우 strict 모드 비활성화
  validateFormats: true, // AJV 8.x에서 포맷 검증은 기본적으로 활성화됨
});
```

### 수동 AJV 사용에서 마이그레이션

```typescript
// 이전 (수동 AJV 8.x)
// 이후 (플러그인 사용)
import { SchemaForm, registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
import Ajv from 'ajv';

const ajv = new Ajv();
const validate = ajv.compile(schema);
const isValid = validate(data);

registerPlugin(ajvValidatorPlugin);
// 이제 검증은 SchemaForm에 의해 자동으로 처리됩니다
```

---

## 고급 사용법

### 커스텀 오류 처리

```typescript
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
import Ajv from 'ajv';

// 커스텀 오류 처리가 포함된 AJV 인스턴스 생성
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  errorDataPath: 'property', // AJV 8.x는 기본적으로 'instancePath' 사용
});

// 커스텀 키워드나 포맷 추가
ajv.addKeyword({
  keyword: 'customValidation',
  validate: function (schema, data) {
    // 커스텀 검증 로직
    return true;
  },
});

// 커스텀 인스턴스 바인딩
ajvValidatorPlugin.bind(ajv);
registerPlugin(ajvValidatorPlugin);
```

---

## 라이선스

이 저장소는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [`LICENSE`](../../../LICENSE) 파일을 참조하세요.

---

## 연락처

프로젝트와 관련된 문의나 제안은 [GitHub 저장소](https://github.com/vincent-kk/albatrion)에 이슈를 생성해 주세요.
