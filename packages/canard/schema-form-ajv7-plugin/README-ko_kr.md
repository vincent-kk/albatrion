# @canard/schema-form-ajv7-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![AJV](https://img.shields.io/badge/AJV-7.x-orange.svg)]()
[![JSON Schema Form Plugin](https://img.shields.io/badge/JSONSchemaForm-validator-green.svg)]()

---

## 개요

`@canard/schema-form-ajv7-plugin`은 AJV 7.x를 사용하여 JSON Schema 검증 기능을 제공하는 `@canard/schema-form`용 validator 플러그인입니다.

---

## 안내사항

⚠️ 이 플러그인은 AJV 7.x를 사용하며, 구버전 JSON Schema 명세(Draft-07 이하)와 호환됩니다.

📌 최신 JSON Schema 기능(Draft 2019-09, Draft 2020-12)이 필요한 경우 `@canard/schema-form-ajv8-plugin` 사용을 고려해주세요.

💡 이 플러그인은 상세한 오류 보고 및 커스텀 검증 지원과 함께 완전한 JSON Schema 검증 솔루션을 제공합니다.

---

## 사용 방법

```bash
yarn add @canard/schema-form @canard/schema-form-ajv7-plugin
```

```tsx
import { registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-ajv7-plugin';
// 또는 커스텀 AJV 인스턴스와 함께 등록
import Ajv from 'ajv';

// 방법 1: validator 플러그인을 전역으로 등록
registerPlugin(plugin);

// 방법 2: 커스텀 AJV 인스턴스를 사용하는 경우 (방법 1 대신 사용)
const customAjv = new Ajv({
  allErrors: true,
  strict: false,
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
- **바인딩 순서**: `bind`는 첫 컴파일 전에 한 번 부릅니다. 루트가 등록된 뒤 다시 바인딩하는 것은 지원하지 않으며, 이 플러그인에서는 바인딩이 등록소를 새로 만들고 그 전에 등록된 루트를 넘기지 않습니다.

#### **`compile(jsonSchema)`**

- **목적**: 제공된 JSON Schema로부터 validator 함수를 생성합니다
- **반환값**: 스키마에 대해 데이터를 검증할 수 있는 validator factory 함수
- **기능**: 자동 오류 변환, 상세한 검증 메시지, 성능 최적화

#### **`compileGuard(root, pointer)`와 `release(root)`**

- `compileGuard`는 엔진이 소유한 복사본 루트의 JSON Pointer에서 동기 불리언 가드를 컴파일합니다. `compile` 호출 여부와 관계없이 복사본을 받습니다. 자체 완결적인 가드는 루트를 등록하지 않고 그 부분 스키마를 컴파일하며, 루트 정의를 `$ref`로 참조하는 가드처럼 루트 위치가 필요한 가드만 가드용 인스턴스에 루트를 등록하고, `compile`은 `$id`가 있는 루트의 사본을 선택된 검증용 인스턴스(`$id`가 충돌하면 별도 형제)에 등록하고, `$id`가 없는 루트는 등록 없이 일회 사본을 컴파일합니다. 두 가드 모두 전체 스키마 컴파일 전에 사용할 수 있습니다. 가드는 AJV의 루트 메타 스키마 검사 없이(`validateSchema: false`) 컴파일되며 AJV의 루트 메타 스키마 검사는 전체 검증 컴파일에서만 돕니다. 그래서 조건과 무관한 곳의 루트 메타 스키마 위반은 어느 가드도 실패시키지 않고, 기본 검사 설정에서는 전체 검증이 `VALIDATOR_COMPILE_FAILED`로 보고합니다(`validateSchema: false`나 `'log'`로 바인딩한 인스턴스는 그 옵션대로 동작합니다). 사용자 정의 키워드의 메타 검사·엄격 옵션·코드 생성 검사는 가드 컴파일에도 남습니다.
- `compile`, 모든 `compileGuard`, `release`에는 동일한 복사본 객체를 전달합니다. 전체 스키마 검증은 가드 컴파일 이후에 컴파일해도 됩니다.
- `release`도 `compile` 호출 여부와 관계없이 같은 복사본을 받아 루트의 AJV 등록과 컴파일 결과를 제거합니다. 등록되지 않은 루트를 해제하면 아무 작업도 하지 않습니다.

**가드의 동적 범위.** 루트 위치가 필요한 가드는 AJV의 동적 앵커 표를 먼저 채운 뒤에야 가드용 인스턴스에서 `{ $ref: <루트>#<포인터> }`를 컴파일합니다. AJV가 동적 참조의 표 조회 여부를 컴파일 때 정하기 때문입니다. 사슬 자원은 루트와, 포인터 경로 위에서 자기 `$id`로 새 자원을 여는 조상이며 바깥부터 셉니다. 각 앵커 이름은 그 이름을 선언한 가장 바깥 사슬 자원의 선언에 묶이며, 선언은 그 자원 어디에 있어도 됩니다. 문자열 `$dynamicAnchor`는 어디서나, `$recursiveAnchor: true`는 자원 루트에서만(이름 `''`) 셉니다. 탐색은 하위 스키마 키워드(`properties`, `items`, `allOf`, `$defs` 등)로만 내려가며, `const`, `enum`, `default`, `examples` 같은 데이터 키워드, 중첩 자원, 가드 자신의 서브트리 안으로는 들어가지 않습니다. 루트의 다른 단언은 가드에 영향을 주지 않습니다. 표 채우기와 아래 검사는 AJV의 동적 어휘를 켠 인스턴스(`opts.dynamicRef`, Ajv2019와 Ajv2020이 켭니다)에서, 그리고 어딘가에 `$dynamicAnchor`, `$dynamicRef`, `$recursiveAnchor`, `$recursiveRef` 키가 있는 루트에서만 돌며, 이 판단은 루트를 등록할 때 한 번만 합니다. draft-07 인스턴스에서는 이 키워드들이 알 수 없는 키워드라서 전체 검증과 가드 모두 무시합니다.

`if` 안에서 `$ref` 뒤나 `$defs` 아래가 아니라 직접 쓴 `$dynamicRef: '#이름'`이나 `$recursiveRef: '#'`는 사슬 자원이 묶거나, `if` 안에서 그 참조의 조상인 스키마 객체(예: 참조를 품은 `allOf` 원소의 루트)가 선언해야 합니다. AJV는 한 객체 안에서 동적 키워드를 하위 스키마보다 먼저 실행하기 때문입니다. 그렇지 않거나 선택된 선언에 `$async: true`가 있으면 `compileGuard`가 예외를 던지므로 그 게이트는 컴파일 단계에서 실패합니다.

가드가 직접 또는 간접으로 사용하는 각 동적 앵커의 최초 바인딩이 모든 관련 진입에서 같고, 사슬에서 얻은 함수가 그 바인딩을 같은 검증 문맥으로 재현하며, 선택된 함수가 동기식이면, 가드의 판정은 AJV 전체 검증이 같은 호스트 값에서 내리는 `if` 판정과 일치합니다. 정적 `$ref`만 쓰는 조건, `properties` 아래의 `if`/`then`/`else`, `$defs` 재사용은 이 조건과 무관합니다.

이 조건 밖에서는 가드가 어휘적 사슬로 계산한 판정을 돌려주거나 컴파일 단계에서 실패합니다. 다음 경우는 지원하지 않습니다.

- VALIDATE-047 사례 (iv): 한 스키마 위치를 `$dynamicRef`나 `$recursiveRef`로 여러 동적 범위에서 쓰는 경우입니다. 위치마다 가드가 하나이므로, 가드는 어휘적 진입의 답을 내거나 범위들이 사슬 밖 자원이면 컴파일 단계에서 실패합니다.
- 최초 바인딩이 사슬 밖에서 오는 경우입니다. 전체 검증이 사슬 밖의 자기 `$id`를 가진 자원을 지나며 그 자원이 앵커를 먼저 등록하거나, 중첩 자원의 URI로 직접 들어가 포인터 경로 위의 `$id` 자원을 건너뛰는 경우입니다.
- 직접 쓴 참조의 이름을 사슬 자원도 참조의 조상도 선언하지 않는 경우입니다. 참조의 형제나 자손, `if` 안의 `$defs` 아래에 있는 선언도 여기에 듭니다.
- L12: `$recursiveAnchor: true`는 자원 루트(루트 스키마나 경로 위의 `$id` 자원)에서만 인정합니다. 유일한 앵커가 다른 곳에 있는 `$recursiveRef: '#'`는 AJV 전체 검증이라면 그 하위 스키마에 묶더라도, 고치는 방법을 밝힌 메시지와 함께 컴파일 단계에서 거부됩니다. `if` 안에서 참조의 조상이 선언한 경우는 위 규칙대로 여전히 묶입니다. L16: 2019-09에서 `if` 밖의 자원 루트가 아닌 곳에 `$recursiveAnchor: true`가 있고 `if` 안에 그런 조상 선언이 함께 있으면, 전체 검증과 가드의 판정이 다를 수 있습니다. 이는 관찰 항목이며 지원 사례가 아닙니다.
- 조각이 JSON Pointer(`#/…`)인 `$dynamicRef`나 `$recursiveRef`: AJV는 이 포인터를 어떤 선언으로도 묶을 수 없는 앵커 이름으로 읽으므로, `compileGuard`가 그 사실을 밝히는 메시지와 함께 거부합니다.
- 현재 자원이 그 이름을 정적 `$anchor`로 선언하고 바깥 사슬 자원이 `$dynamicAnchor`로 선언한 경우입니다. 명세는 참조를 정적으로 다루지만 AJV와 가드는 동적 표를 씁니다.
- 사용자 정의 키워드의 하위 스키마와, `if` 안에서 `$ref`로만 실행되는 `$defs`의 선언은 인식하지 않습니다.

AJV 전체 검증이 명세와 다른 다음 경우에는 가드가 명세를 따릅니다.

- 중첩 자원 안의 인라인 앵커가 루트 기준 URI와 자원 기준 URI에서 서로 다르게 풀리는 상대 참조를 담는 경우, 전체 검증은 루트 기준 URI로, 가드는 자원 기준 URI로 풉니다.
- 사슬 밖 자원(`$ref`, `allOf`, 먼저 검사된 속성으로 들어간 자원, L8′)이 실행 중에 등록한 앵커가 전체 검증에서는 `if`로 새지만 가드에서는 보이지 않습니다. 사슬 자원 안에서 가드 밖에 있는 형제의 선언은 가드도 모읍니다.
- 사슬 자원의 다른 곳에 있는 선언을 전체 검증이 아직 실행하지 않은 경우, AJV는 둘러싼 함수로 대체하고 가드는 그 선언을 씁니다.
- 전체 검증이 건너뛰는 `$id` 없는 자원도 가드는 사슬로 읽습니다.

다음 경우에는 가드가 명세가 아니라 AJV를 따릅니다.

- 북엔딩: AJV는 `$dynamicRef`의 최초 대상이 `$dynamicAnchor` 조각인지 확인하지 않고, 루트의 앵커 표시와 전달된 표로 분기합니다.
- 컴파일 때 루트에 그 앵커 이름의 표시가 없으면, AJV는 `$dynamicRef`나 `$recursiveRef`를 앵커 표를 보지 않고 감싸는 컴파일 함수(`it.validateName`)를 부르는 코드로 만듭니다(`dynamicRef.js:32-38`). 가드도 이 동작을 따릅니다.
- `#` 조각이 아닌 `$dynamicRef`는 양쪽 모두 컴파일에 실패합니다.
- `constructor`, `toString`, `__proto__`처럼 `Object.prototype` 멤버와 겹치는 앵커 이름은 바인딩되지 않습니다. AJV가 일반 객체 위에서 앵커 표를 참거짓으로 확인하기 때문이며, 전체 검증과 가드가 같은 편차를 공유합니다.
- 루트나 부모 데이터를 읽는 `$data` 참조와 사용자 정의 키워드는 가드에서 호스트 값만 봅니다. 이것은 호스트 값만 받는 가드 인터페이스의 별도 한계이며 동적 범위와 무관합니다.

### **기본 설정**

커스텀 AJV 인스턴스가 제공되지 않은 경우, 플러그인은 다음 기본 설정을 사용합니다:

```typescript
const defaultSettings: Ajv.Options = {
  allErrors: true, // 첫 번째 오류뿐만 아니라 모든 검증 오류 수집
  strict: false, // 기존 스키마와의 호환성을 위해 strict 모드 비활성화
  validateFormats: false, // 성능 향상을 위해 포맷 검증 비활성화
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

`@canard/schema-form-ajv7-plugin`은 ECMAScript 2020 (ES2020) 문법으로 구축되었으며 AJV 7.x를 지원합니다.

**지원 환경:**

- Node.js 14.17.0 이상
- 최신 브라우저 (Chrome 91+, Firefox 90+, Safari 14+)
- AJV 7.0.0 이상

**레거시 환경 지원이 필요한 경우:**
Babel 등의 트랜스파일러를 사용하여 타겟 환경에 맞게 변환해주세요.

**의존성 요구사항:**

- @canard/schema-form (peer dependency)
- ajv ^7.0.0

**JSON Schema 지원:**

- Draft-06
- Draft-07
- Draft 2019-09 (부분 지원)

---

## 마이그레이션 가이드

### 수동 AJV 사용에서 마이그레이션

```typescript
// 이후 (플러그인 사용)
import { registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-ajv7-plugin';

registerPlugin(plugin);
// 이제 <Form>은 등록된 플러그인으로 검증합니다
```

### AJV 8.x로 업그레이드

최신 JSON Schema 기능을 위해 AJV 8.x로 업그레이드가 필요한 경우:

```bash
yarn remove @canard/schema-form-ajv7-plugin
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
