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

- **[`@canard/schema-form`](./packages/canard/schema-form/README.md)** - JSON Schema based form utilities
- **[`@canard/schema-form-ajv6-plugin`](./packages/canard/schema-form-ajv6-plugin/README.md)** - AJV 6.x validation plugin for `canard/schema-form`
- **[`@canard/schema-form-ajv7-plugin`](./packages/canard/schema-form-ajv7-plugin/README.md)** - AJV 7.x validation plugin for `canard/schema-form`
- **[`@canard/schema-form-ajv8-plugin`](./packages/canard/schema-form-ajv8-plugin/README.md)** - AJV 8.x validation plugin for `canard/schema-form`
- **[`@canard/schema-form-antd5-plugin`](./packages/canard/schema-form-antd5-plugin/README.md)** - Ant Design plugin applicable to `canard/schema-form`
- **[`@canard/schema-form-antd6-plugin`](./packages/canard/schema-form-antd6-plugin/README.md)** - Ant Design v6 plugin applicable to `canard/schema-form`
- **[`@canard/schema-form-antd-mobile-plugin`](./packages/canard/schema-form-antd-mobile-plugin/README.md)** - Ant Design Mobile plugin applicable to `canard/schema-form`
- **[`@canard/schema-form-mui-plugin`](./packages/canard/schema-form-mui-plugin/README.md)** - MUI plugin applicable to `canard/schema-form`

### `lerx`

- **[`@lerx/promise-modal`](./packages/lerx/promise-modal/README.md)** - Promise-based modal utilities

### `slats`

- **[`@slats/claude-assets-sync`](./packages/slats/claude-assets-sync/README.md)** - CLI tool to sync Claude commands and skills from npm packages to your project's `.claude/` directory.

### `winglet`

- **[`@winglet/common-utils`](./packages/winglet/common-utils/README.md)** - JavaScript utilities
- **[`@winglet/data-loader`](./packages/winglet/data-loader/README.md)** - Data loader utilities
- **[`@winglet/json`](./packages/winglet/json/README.md)** - JSON utilities
- **[`@winglet/json-schema`](./packages/winglet/json-schema/README.md)** - JSON Schema utilities
- **[`@winglet/react-utils`](./packages/winglet/react-utils/README.md)** - React utilities
- **[`@winglet/style-utils`](./packages/winglet/style-utils/README.md)** - CSS and style management utilities

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

## Compatibility

This package is built with ECMAScript 2020 (ES2020) syntax.

If you're using a JavaScript environment that doesn't support ES2020, you'll need to include this package in your transpilation process.

(Some packages are built with ECMAScript 2022 (ES2022) syntax.)

**Supported environments:**

- Node.js 14.0.0 or later
- Modern browsers (ES2020 support)

**For legacy environment support:**
Please use a transpiler like Babel to transform the code for your target environment.

---

## License

This repository is provided under the MIT license. For more details, please refer to the [`LICENSE`](./LICENSE) file.

---

## Contact

If you have any questions or suggestions related to the project, please create an issue.

## 📦 Packages

This monorepo contains the following packages:

### Canard (Schema Form)

- `@canard/schema-form` - Core schema form library
- `@canard/schema-form-ajv6-plugin` - AJV 6.x validation plugin
- `@canard/schema-form-ajv8-plugin` - AJV 8.x validation plugin
- `@canard/schema-form-antd5-plugin` - Ant Design plugin
- `@canard/schema-form-antd-mobile-plugin` - Ant Design Mobile plugin
- `@canard/schema-form-mui-plugin` - Material-UI plugin

### Lerx (Promise Modal)

- `@lerx/promise-modal` - Promise-based modal utility

### Winglet (Utilities)

- `@winglet/common-utils` - Common utility functions
- `@winglet/data-loader` - Data loading utilities
- `@winglet/json` - JSON manipulation utilities
- `@winglet/json-schema` - JSON Schema utilities
- `@winglet/react-utils` - React utility components and hooks
- `@winglet/style-utils` - CSS and style management utilities

## 🚀 Development

### Prerequisites

- Node.js 18+
- Yarn 4.9.1+

### Installation

```bash
yarn install
```

### Building

```bash
# Build all packages
yarn build:all

# Build specific package
yarn workspace @canard/schema-form build
```

## 📋 Version Management

This project uses [Changesets](https://github.com/changesets/changesets) for version management and publishing.

### Creating a Changeset

When you make changes to any package, create a changeset to document your changes:

```bash
yarn changeset
```

This will:

1. Ask which packages have changed
2. Ask what type of change (major/minor/patch)
3. Ask for a summary of the changes (write in English)
4. Generate a changeset file

### Releasing

You can release manually using the following commands:

```bash
# Update package versions based on changesets
yarn changeset:version

# Publish packages to npm
yarn changeset:publish
```

### Changeset Guidelines

- **patch**: Bug fixes, documentation updates, internal refactoring
- **minor**: New features, new exports, non-breaking changes
- **major**: Breaking changes, removed exports, API changes

## 🔧 Scripts

### Building & Publishing

- `yarn build:all` - Build all packages
- `yarn changeset` - Create a new changeset
- `yarn changeset:version` - Update versions based on changesets
- `yarn changeset:publish` - Publish packages to npm

### Package Tagging

- `yarn tag:packages <commit>` - Create Git tags for all packages based on their versions in a specific commit
- `yarn tag:packages <commit> --push` - Create tags and automatically push them to remote
- `yarn tag:packages <commit> -p` - Create tags and automatically push them to remote (short flag)

#### Tagging Examples

```bash
# Create tags for packages in current commit
yarn tag:packages HEAD

# Create tags for a specific commit and push to remote
yarn tag:packages f20ca74baa16456ba9de006c709c61d29a1d1708 --push

# Create tags for packages in an older commit with short flag
yarn tag:packages dcd9a7826f95ec694bbc7cfc4a79f10af93444ad -p
```

The tagging script automatically:

- Discovers all packages in the monorepo
- Creates tags in format `@scope/package@version`
- Excludes private packages from tagging
- Checks for existing tags to prevent duplicates
- Provides interactive confirmation before creating tags

## 📄 License

MIT License - see individual packages for specific license information.
