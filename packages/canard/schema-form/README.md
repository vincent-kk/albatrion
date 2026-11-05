# @canard/schema-form

English | [한국어](./README-ko_kr.md)

Build React forms from JSON Schema, with plugins for validation and UI components.

## Installation

```bash
yarn add @canard/schema-form
```

## Minimal example

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

This uses the core fallback inputs. Register a validator plugin below when you need validation.

## Plugins

- [`@canard/schema-form-ajv8-plugin`](https://vincent-kk.github.io/albatrion/docs/canard/schema-form-ajv8-plugin): AJV 8
- [`@canard/schema-form-ajv7-plugin`](https://vincent-kk.github.io/albatrion/docs/canard/schema-form-ajv7-plugin): AJV 7
- [`@canard/schema-form-ajv6-plugin`](https://vincent-kk.github.io/albatrion/docs/canard/schema-form-ajv6-plugin): AJV 6
- [`@canard/schema-form-antd6-plugin`](https://vincent-kk.github.io/albatrion/docs/canard/schema-form-antd6-plugin): Ant Design 6
- [`@canard/schema-form-antd5-plugin`](https://vincent-kk.github.io/albatrion/docs/canard/schema-form-antd5-plugin): Ant Design 5
- [`@canard/schema-form-antd-mobile-plugin`](https://vincent-kk.github.io/albatrion/docs/canard/schema-form-antd-mobile-plugin): Ant Design Mobile
- [`@canard/schema-form-mui-plugin`](https://vincent-kk.github.io/albatrion/docs/canard/schema-form-mui-plugin): Material UI

## Documentation

- [Installation and plugin registration](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/quick-start)
- [Core concepts](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/core-concepts)
- [Schema and controls](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/schema-reference)
- [Validation](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/validation)
- [API reference](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/api-reference)
- [Error reference](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/error-reference)
- [Examples](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/examples)
- [Migration from 0.x](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/migration-from-0x)
- [Coding-agent assets](https://vincent-kk.github.io/albatrion/docs/canard/schema-form#agent-assets)
