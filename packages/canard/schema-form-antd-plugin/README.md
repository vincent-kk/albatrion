# @canard/schema-form-antd-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Ant Design](https://img.shields.io/badge/antd-✔-blue.svg)]()
[![Json Schema Form Plugin](https://img.shields.io/badge/JsonSchemaForm-plugin-pink.svg)]()

---

## Overview

`@canard/schema-form-antd-plugin` is a plugin for `@canard/schema-form` that provides Ant Design components.

---

## How to use

```bash
yarn add @canard/schema-form @canard/schema-form-antd-plugin
```

```tsx
import { SchemaForm, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd-plugin';

// Plugin will be registered globally
registerPlugin(plugin);
```

---

## License

This repository is licensed under the MIT License. Please refer to the [`LICENSE`](./LICENSE) file for details.
