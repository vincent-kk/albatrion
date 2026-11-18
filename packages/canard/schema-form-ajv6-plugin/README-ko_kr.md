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

⚠️ 이 플러그인은 AJV 6.x를 사용합니다. 기본 인스턴스는 Draft-07을 검증하며, 이전 방언을 선언한 스키마는 아래의 추가 설정이 필요합니다.

📌 최신 JSON Schema 기능(Draft 2019-09, Draft 2020-12)이 필요한 경우 `@canard/schema-form-ajv8-plugin` 사용을 고려해주세요.

💡 이 플러그인은 상세한 오류 보고 및 커스텀 검증 지원과 함께 완전한 JSON Schema 검증 솔루션을 제공합니다.

---

## 사용 방법

```bash
yarn add @canard/schema-form @canard/schema-form-ajv6-plugin
```

```tsx
import { registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-ajv6-plugin';
// 또는 커스텀 AJV 인스턴스와 함께 등록
import Ajv from 'ajv';

// 방법 1: validator 플러그인을 전역으로 등록
registerPlugin(plugin);

// 방법 2: 커스텀 AJV 인스턴스를 사용하는 경우 (방법 1 대신 사용)
const customAjv = new Ajv({
  allErrors: true,
  nullable: true,
  verbose: true,
});
plugin.validator.bind(customAjv);
registerPlugin(plugin);
```

---

## 기능

### **플러그인 인터페이스**

이 플러그인은 `ValidatorPlugin` 인터페이스를 구현하여 두 가지 주요 메서드를 제공합니다:

#### **`bind(instance: Ajv.Ajv)`**

- **목적**: 선호하는 설정으로 구성된 커스텀 AJV 인스턴스를 제공할 수 있습니다
- **사용법**: 선택적 - 호출하지 않으면 기본 AJV 인스턴스가 자동으로 생성됩니다
- **장점**: AJV 설정, 커스텀 키워드, 포맷, 검증 규칙에 대한 완전한 제어 가능
- **제약**: `coerceTypes`, `useDefaults`, `removeAdditional` 중 하나라도 활성화된 인스턴스는 현재 바인딩을 교체하기 전에 즉시 거부됩니다. 던져지는 네이티브 `ValidatorBindRefusedError`는 활성화된 옵션을 `details.options`에 담습니다. 값을 수정하는 커스텀 키워드는 계속 사용하는 쪽의 책임입니다.
- **바인딩 순서**: `bind`는 첫 컴파일 전에 한 번 부릅니다. 루트가 등록된 뒤 다시 바인딩하는 것은 지원하지 않으며, 이 플러그인에서는 바인딩이 등록소를 새로 만들고 그 전에 등록된 루트를 넘기지 않습니다.

호출하는 쪽은 `group`(`'UNHANDLED_ERROR'`)과 `code`(`'UNHANDLED_ERROR.VALIDATOR_BIND_REFUSED'`, 즉 `FormErrorCode.ValidatorBindRefused`의 값)로 이 거부를 구분합니다. core의 `isUnhandledError`는 이를 인식하지 않습니다.

#### **`configure(options: { directGuardCompile?: boolean }): void`**

자체 완결적인 가드는 기본적으로 원본 복사본 부분 스키마를 직접 컴파일합니다.
이후 컴파일에서 등록된 루트 포인터 경로를 사용하려면 `directGuardCompile: false`로 설정합니다.
이미 만들어진 판정 함수는 바뀌지 않으며, 생략한 옵션은 기존 값을 유지합니다.
가드 내부 어디에서든 참조 키와 식별자 키가 있으면 항상 루트 경로가 필요합니다.
자체 `$schema`를 선언한 루트나 `$schema`를 포함한 가드도 루트 포인터를 사용합니다.
루트의 다른 부분을 컴파일할 때에만 나타나는 컴파일 오류(예: 해석되지 않는 `$ref`)는 전체 검증이 `VALIDATOR_COMPILE_FAILED`를 보고하게 만듭니다.
또한 루트 포인터에서 컴파일되는 모든 가드도 실패시키는데, 이는 해당 경로의 한계입니다.
직접 컴파일되는 자체 완결적인 가드는 가드 컴파일 실패가 그 가드 자신의 게이트에만 속하므로 계속 평가됩니다.
가드는 AJV의 루트 메타 스키마 검증 없이(`validateSchema: false`) 컴파일되며, AJV의 루트 메타 스키마 검사는 전체 스키마 컴파일에서만 실행됩니다.
사용자 정의 키워드의 메타 스키마 검사, 엄격 옵션, 코드 생성 검사는 가드를 컴파일할 때에도 그대로 적용됩니다.
조건 바깥의 루트 메타 스키마 위반(예: 관련 없는 필드의 `multipleOf: 0`)은 어느 경로에서도 가드를 실패시키지 않습니다.
기본 스키마 검증에서는 전체 검증이 `VALIDATOR_COMPILE_FAILED`를 보고하지만, `validateSchema: false`나 `'log'`로 바인딩한 인스턴스는 해당 옵션대로 컴파일됩니다.
조건 스키마 자체 안의 메타 위반(예: `minLength: 1.5`)은 가드를 실패시키지 않으며, 가드는 AJV가 생성한 코드대로 평가됩니다.
가드 인스턴스는 바인딩된 방언, 포맷, 키워드를 유지하되 `allErrors: false`와 `validateSchema: false`를 사용합니다. `release(root)`는 직접 컴파일된 가드도 함께 제거합니다.

AJV6은 기본적으로 `$id`를 사용하며, `schemaId: 'id'` 또는 `'auto'`는 draft-04 `id`도 문맥에 따라 식별자로 취급합니다.

#### **`compile(jsonSchema)`**

- **목적**: 제공된 JSON Schema로부터 validator 함수를 생성합니다
- **반환값**: 스키마에 대해 데이터를 검증할 수 있는 validator factory 함수
- **기능**: 자동 오류 변환, 상세한 검증 메시지, 성능 최적화

#### **`compileGuard(root, pointer)`와 `release(root)`**

- `compileGuard`는 엔진이 소유한 복사본 루트의 JSON Pointer에서 동기 불리언 가드를 컴파일합니다. `compile` 호출 여부와 관계없이 복사본을 받습니다. 자체 완결적인 가드는 루트를 등록하지 않고 그 부분 스키마를 컴파일하며, 루트 정의를 `$ref`로 참조하는 가드처럼 루트 위치가 필요한 가드만 가드용 인스턴스에 루트를 등록하고, `compile`은 `$id`가 있는 루트의 사본을 선택된 검증용 인스턴스(`$id`가 충돌하면 별도 형제)에 등록하고, `$id`가 없는 루트는 등록 없이 일회 사본을 컴파일합니다. 두 가드 모두 전체 스키마 컴파일 전에 사용할 수 있습니다. 가드는 AJV의 루트 메타 스키마 검사 없이(`validateSchema: false`) 컴파일되며 AJV의 루트 메타 스키마 검사는 전체 검증 컴파일에서만 돕니다. 그래서 조건과 무관한 곳의 루트 메타 스키마 위반은 어느 가드도 실패시키지 않고, 기본 검사 설정에서는 전체 검증이 `VALIDATOR_COMPILE_FAILED`로 보고합니다(`validateSchema: false`나 `'log'`로 바인딩한 인스턴스는 그 옵션대로 동작합니다). 사용자 정의 키워드의 메타 검사·엄격 옵션·코드 생성 검사는 가드 컴파일에도 남습니다.
- `compile`, 모든 `compileGuard`, `release`에는 동일한 복사본 객체를 전달합니다. 전체 스키마 검증은 가드 컴파일 이후에 컴파일해도 됩니다.
- `release`도 `compile` 호출 여부와 관계없이 같은 복사본을 받아 루트의 AJV 등록과 컴파일 결과를 제거합니다. 등록되지 않은 루트를 해제하면 아무 작업도 하지 않습니다.

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

`createValidator(ajv)`는 Form의 `validatorFactory`에 넘길 인스턴스별 `{ compile, compileGuard }` 객체를 돌려줍니다. 새 객체는 Form이 트리를 다시 만들게 하므로 렌더 밖에서 한 번만 만드십시오(`const validator = createValidator(customAjv);` 뒤 `<Form validatorFactory={validator} />`). 여러 객체가 AJV 인스턴스 하나를 함께 써도 되며, 인스턴스는 값을 바꾸지 않아야 합니다(`coerceTypes`, `useDefaults`, `removeAdditional` 꺼짐).

`compileGuard`는 포인터가 스키마(객체나 불리언)를 가리키지 않으면, 곧 없는 위치이거나 `/type`·`/required`처럼 스키마가 아닌 값이면 네이티브 `GuardPointerNotSchemaError`를 던집니다. 호출자는 `group`(`'UNHANDLED_ERROR'`)과 `code`(`'GUARD_POINTER_NOT_SCHEMA'`)로 구분하며, `details`에는 루트의 `$id`(없으면 `''`)와 포인터가 담깁니다.

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

- 기본 인스턴스: Draft-07.
- Draft-06: bind한 인스턴스에 해당 메타 스키마를 등록해야 합니다.
- Draft-04: 기본 설정에 없으며, bind한 AJV 6 인스턴스에 메타 스키마와 적절한 `schemaId` 설정이 필요합니다.

---

## 마이그레이션 가이드

### 수동 AJV 사용에서 마이그레이션

```typescript
// 이후 (플러그인 사용)
import { registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-ajv6-plugin';

registerPlugin(plugin);
// 이제 <Form>은 등록된 플러그인으로 검증합니다
```

### AJV 8.x로 업그레이드

최신 JSON Schema 기능을 위해 AJV 8.x로 업그레이드가 필요한 경우:

```bash
yarn remove @canard/schema-form-ajv6-plugin
yarn add @canard/schema-form-ajv8-plugin
```

```typescript
// import 업데이트
import { plugin } from '@canard/schema-form-ajv8-plugin';
```

---

## 라이선스

이 저장소는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [`LICENSE`](../../../LICENSE) 파일을 참조하세요.

---

## 연락처

프로젝트와 관련된 문의나 제안은 [GitHub 저장소](https://github.com/vincent-kk/albatrion)에 이슈를 생성해 주세요.

### Enabling a declared Draft-06 schema

기본 인스턴스에는 Draft-06 메타 스키마가 없습니다. 스키마를 컴파일하기 전에 호환되는 인스턴스에 등록합니다.

```typescript
import Ajv from 'ajv';
import draft06 from 'ajv/lib/refs/json-schema-draft-06.json';
import { createValidator } from '@canard/schema-form-ajv6-plugin';

const ajv = new Ajv({ allErrors: true, nullable: true, format: false });
ajv.addMetaSchema(draft06);
const validator = createValidator(ajv);
const validate = validator.compile({
  $schema: 'http://json-schema.org/draft-06/schema#',
  type: 'number',
  exclusiveMaximum: 5,
});
await validate(5); // Reports exclusiveMaximum.
```

bind한 인스턴스에 추가한 format과 keyword는 가드와 격리된 형제 인스턴스를 포함한 이후 컴파일에 반영됩니다. 이미 컴파일한 검증 함수는 기존 규칙을 유지하며, 규칙 추가가 자동 재컴파일을 일으키지 않습니다.
