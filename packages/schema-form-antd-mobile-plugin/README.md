# `@lumy-pack/schema-form-antd-mobile-plugin`

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Ant Design Mobile](https://img.shields.io/badge/antd-mobile-blue.svg)]()
[![Json Schema Form Plugin](https://img.shields.io/badge/JsonSchemaForm-plugin-pink.svg)]()

---

## Overview

`@lumy-pack/schema-form-antd-mobile-plugin` is a plugin for `@lumy-pack/schema-form` that provides Ant Design Mobile components.

---

## How to use

```bash
yarn add @lumy-pack/schema-form @lumy-pack/schema-form-antd-mobile-plugin
```

```tsx
import { SchemaForm, registerPlugin } from '@lumy-pack/schema-form';
import { plugin } from '@lumy-pack/schema-form-antd-mobile-plugin';

// Plugin will be registered globally
registerPlugin(plugin);
```

---

## License

This repository is licensed under the MIT License. Please refer to the [`LICENSE`](./LICENSE) file for details.
