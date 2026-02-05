---
name: schema-form-plugin-system
description: "@canard/schema-form의 플러그인 시스템 전문가. registerPlugin, Validator/UI 플러그인 등록 및 개발을 안내합니다."
user-invocable: false
---

# Plugin System Skill

@canard/schema-form의 플러그인 시스템에 대한 전문 스킬입니다.

## 스킬 정보 (Skill Info)

- **이름**: plugin-system
- **용도**: 플러그인 등록, 개발, 확장 가이드
- **트리거**: plugin, registerPlugin, validator, UI 플러그인 관련 질문

---

## 개요 (Overview)

Schema Form은 플러그인 시스템을 통해 검증기, UI 컴포넌트, FormTypeInput 등을 확장할 수 있습니다.

---

## 사용 가능한 플러그인

### Validator 플러그인

| 패키지 | 설명 |
|--------|------|
| `@canard/schema-form-ajv8-plugin` | AJV 8.x 기반 검증 |
| `@canard/schema-form-ajv7-plugin` | AJV 7.x 기반 검증 |
| `@canard/schema-form-ajv6-plugin` | AJV 6.x 기반 검증 |

### UI 플러그인

| 패키지 | 설명 |
|--------|------|
| `@canard/schema-form-antd5-plugin` | Ant Design 5 컴포넌트 |
| `@canard/schema-form-antd6-plugin` | Ant Design 6 컴포넌트 |
| `@canard/schema-form-antd-mobile-plugin` | Ant Design Mobile 컴포넌트 |
| `@canard/schema-form-mui-plugin` | Material UI 컴포넌트 |

---

## 플러그인 등록

### 기본 등록

```typescript
import { registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
import { antd5Plugin } from '@canard/schema-form-antd5-plugin';

// 앱 시작 시 한 번만 등록
registerPlugin(ajvValidatorPlugin);
registerPlugin(antd5Plugin);
```

### 등록 순서

플러그인 등록 순서는 FormTypeInput 우선순위에 영향을 줍니다.

```typescript
// 나중에 등록된 플러그인의 FormTypeInput이 우선
registerPlugin(basePlugin);
registerPlugin(customPlugin);  // 이 플러그인의 정의가 우선
```

---

## SchemaFormPlugin 인터페이스

```typescript
interface SchemaFormPlugin {
  // 플러그인 식별자
  name: string;

  // FormTypeInput 정의 목록
  formTypeInputDefinitions?: FormTypeInputDefinition[];

  // 폼 렌더러 컴포넌트
  FormRenderer?: ComponentType<FormRendererProps>;

  // 폼 타입 렌더러 컴포넌트
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;

  // Validator Factory
  validatorFactory?: ValidatorFactory;
}
```

---

## 커스텀 플러그인 개발

### 기본 구조

```typescript
import type { SchemaFormPlugin, FormTypeInputDefinition } from '@canard/schema-form';

const customFormTypeInputDefinitions: FormTypeInputDefinition[] = [
  {
    test: { type: 'string', format: 'custom' },
    Component: CustomFormatInput,
  },
  {
    test: (hint) => hint.jsonSchema.customProp === true,
    Component: CustomPropInput,
  },
];

export const myCustomPlugin: SchemaFormPlugin = {
  name: 'my-custom-plugin',
  formTypeInputDefinitions: customFormTypeInputDefinitions,
};
```

### FormTypeInput 정의

```typescript
import type { FormTypeInputDefinition, FormTypeInputProps } from '@canard/schema-form';
import { FC } from 'react';

// 커스텀 입력 컴포넌트
const PhoneInput: FC<FormTypeInputProps<string>> = ({
  value,
  onChange,
  readOnly,
  disabled,
  errors,
  errorVisible,
}) => {
  const formatPhone = (v: string) => {
    const digits = v.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  };

  return (
    <div>
      <input
        type="tel"
        value={formatPhone(value ?? '')}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        readOnly={readOnly}
        disabled={disabled}
        placeholder="010-1234-5678"
      />
      {errorVisible && errors.length > 0 && (
        <span style={{ color: 'red' }}>{errors[0].message}</span>
      )}
    </div>
  );
};

// FormTypeInput 정의
const definitions: FormTypeInputDefinition[] = [
  {
    test: { type: 'string', format: 'phone' },
    Component: PhoneInput,
  },
];
```

### FormRenderer 커스터마이징

```typescript
import type { FormRendererProps } from '@canard/schema-form';
import { FC } from 'react';

const CustomFormRenderer: FC<FormRendererProps> = ({
  children,
  onSubmit,
  className,
  style,
}) => {
  return (
    <form
      className={`custom-form ${className ?? ''}`}
      style={style}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <div className="form-content">{children}</div>
      <div className="form-actions">
        <button type="submit">저장</button>
        <button type="reset">초기화</button>
      </div>
    </form>
  );
};

export const myPlugin: SchemaFormPlugin = {
  name: 'my-plugin',
  FormRenderer: CustomFormRenderer,
};
```

### FormTypeRenderer 커스터마이징

```typescript
import type { FormTypeRendererProps } from '@canard/schema-form';
import { FC } from 'react';

const CustomFormTypeRenderer: FC<FormTypeRendererProps> = ({
  node,
  jsonSchema,
  FormTypeInput,
  ChildNodeComponents,
  errors,
  errorVisible,
  formatError,
}) => {
  const title = jsonSchema.title || node.name;
  const description = jsonSchema.description;

  return (
    <div className="custom-field">
      <label className="field-label">
        {title}
        {node.required && <span className="required">*</span>}
      </label>

      {description && (
        <p className="field-description">{description}</p>
      )}

      <div className="field-input">
        <FormTypeInput />
      </div>

      {ChildNodeComponents.map((Child, i) => (
        <div key={i} className="child-field">
          <Child />
        </div>
      ))}

      {errorVisible && errors.length > 0 && (
        <div className="field-errors">
          {errors.map((error, i) => (
            <span key={i} className="error-message">
              {formatError?.(error, node) ?? error.message}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export const myPlugin: SchemaFormPlugin = {
  name: 'my-plugin',
  FormTypeRenderer: CustomFormTypeRenderer,
};
```

---

## Validator Factory

커스텀 검증 로직을 구현할 수 있습니다.

```typescript
import type { ValidatorFactory, Validator } from '@canard/schema-form';

const createCustomValidator: ValidatorFactory = (schema) => {
  return {
    validate: async (value) => {
      const errors = [];

      // 커스텀 검증 로직
      if (schema.customValidation) {
        const result = schema.customValidation(value);
        if (!result.valid) {
          errors.push({
            path: '',
            keyword: 'customValidation',
            message: result.message,
          });
        }
      }

      return errors;
    },
  };
};

export const customValidatorPlugin: SchemaFormPlugin = {
  name: 'custom-validator',
  validatorFactory: createCustomValidator,
};
```

---

## 플러그인 조합

### 여러 플러그인 사용

```typescript
import { registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
import { antd5Plugin } from '@canard/schema-form-antd5-plugin';
import { myCustomPlugin } from './my-custom-plugin';

// 순서: 검증 → UI → 커스텀
registerPlugin(ajvValidatorPlugin);
registerPlugin(antd5Plugin);
registerPlugin(myCustomPlugin);  // 커스텀 정의가 최우선
```

### 플러그인 확장

```typescript
import { antd5Plugin } from '@canard/schema-form-antd5-plugin';

// 기존 플러그인 확장
const extendedPlugin: SchemaFormPlugin = {
  name: 'extended-antd5',
  formTypeInputDefinitions: [
    // 커스텀 정의 (우선 적용)
    {
      test: { type: 'string', format: 'phone' },
      Component: CustomPhoneInput,
    },
    // 기존 정의 포함
    ...(antd5Plugin.formTypeInputDefinitions ?? []),
  ],
};

registerPlugin(extendedPlugin);
```

---

## FormProvider를 통한 오버라이드

플러그인보다 높은 우선순위로 정의를 오버라이드할 수 있습니다.

```typescript
import { FormProvider } from '@canard/schema-form';

<FormProvider
  formTypeInputDefinitions={[
    // 이 정의가 플러그인보다 우선
    {
      test: { type: 'string' },
      Component: CustomStringInput,
    },
  ]}
  FormRenderer={CustomFormRenderer}
>
  <App />
</FormProvider>
```

---

## 우선순위 정리

FormTypeInput 선택 우선순위 (높은 순):

1. JSON Schema의 `FormTypeInput` 속성
2. Form의 `formTypeInputMap`
3. Form의 `formTypeInputDefinitions`
4. FormProvider의 `formTypeInputDefinitions`
5. 플러그인의 `formTypeInputDefinitions` (나중 등록이 우선)

---

## 참고

- 전체 스펙: `docs/ko/SPECIFICATION.md`
- 플러그인 개발 가이드: `.cursor/rules/create-canard-form-plugin-guidelines.mdc`
- 예제 플러그인: `packages/canard/schema-form-antd5-plugin`, `packages/canard/schema-form-ajv8-plugin`
