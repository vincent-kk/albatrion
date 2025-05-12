# Albatrion

[![TypeScript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![JavaScript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Utility](https://img.shields.io/badge/utility-✔-green.svg)]()

---

## Overview

**Albatrion** is a monorepo that brings together **TypeScript/JavaScript** based utilities and React component packages in one place.
It provides high performance and stability, consisting of various utilities and optimized code that can be trusted in production environments.

---

## Monorepo Structure

This repository consists of several packages with independent version management and deployment capabilities.
Each package provides individual `README.md` documentation with detailed usage instructions, dependency information, and example code.

### `canard`

- **[`canard/schema-form`](./packages/canard/schema-form/README.md)** - JSON Schema based form utilities
- **[`canard/schema-form-antd-plugin`](./packages/canard/schema-form-antd-plugin/README.md)** - Ant Design plugin applicable to `canard/schema-form`
- **[`canard/schema-form-antd-mobile-plugin`](./packages/canard/schema-form-antd-mobile-plugin/README.md)** - Ant Design Mobile plugin applicable to `canard/schema-form`

### `lerx`

- **[`lerx/promise-modal`](./packages/lerx/promise-modal/README.md)** - Promise-based modal utilities

### `winglet`

- **[`winglet/common-utils`](./packages/winglet/common-utils/README.md)** - JavaScript utilities
- **[`winglet/json-schema`](./packages/winglet/json-schema/README.md)** - JSON Schema utilities
- **[`winglet/react-utils`](./packages/winglet/react-utils/README.md)** - React utilities

---

## Development Environment Setup

```bash
# Clone repository
dir=your-albatrion && git clone https://github.com/vincent-kk/albatrion.git "$dir" && cd "$dir"

# Install dependencies
nvm use && yarn install && yarn run:all build

# Use yarn workspaces
yarn workspace <package-name> <command>

# Run tests
yarn workspace <package-name> test

# Build
yarn workspace <package-name> build
```

---

## License

This repository is provided under the MIT license. For more details, please refer to the [`LICENSE`](./LICENSE) file.

---

## Contact

If you have any questions or suggestions related to the project, please create an issue.
