# @canard/schema-form-antd-mobile-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Ant Design Mobile](https://img.shields.io/badge/antd-mobile-blue.svg)]()
[![Json Schema Form Plugin](https://img.shields.io/badge/JsonSchemaForm-plugin-pink.svg)]()

---

## Overview

`@canard/schema-form-antd-mobile-plugin` is a plugin for `@canard/schema-form` that provides Ant Design Mobile components.

---

## How to use

```bash
yarn add @canard/schema-form @canard/schema-form-antd-mobile-plugin
```

```tsx
import { SchemaForm, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd-mobile-plugin';

// Plugin will be registered globally
registerPlugin(plugin);
```

---

## Compatibility

`@canard/schema-form-antd-mobile-plugin` is built with ECMAScript 2020 (ES2020) syntax.

If you're using a JavaScript environment that doesn't support ES2020, you'll need to include this package in your transpilation process.

**Supported environments:**

- Node.js 14.17.0 or later
- Modern browsers (Chrome 91+, Firefox 90+, Safari 14+)

**For legacy environment support:**
Please use a transpiler like Babel to transform the code for your target environment.

---

## License

This repository is licensed under the MIT License. Please refer to the [`LICENSE`](./LICENSE) file for details.

---

## Contact

For inquiries or suggestions related to the project, please create an issue.
