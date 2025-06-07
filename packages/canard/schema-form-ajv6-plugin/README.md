# @canard/schema-form-ajv6-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![AJV](https://img.shields.io/badge/AJV-6.x-orange.svg)]()
[![Json Schema Form Plugin](https://img.shields.io/badge/JsonSchemaForm-validator-green.svg)]()

---

## Overview

`@canard/schema-form-ajv6-plugin` is a validator plugin for `@canard/schema-form` that provides JSON Schema validation using AJV 6.x.

---

## Notice

⚠️ This plugin uses AJV 6.x which is compatible with older JSON Schema specifications (Draft-07 and earlier).

📌 If you need support for newer JSON Schema features (Draft 2019-09, Draft 2020-12), consider using `@canard/schema-form-ajv8-plugin` instead.

💡 This plugin provides a complete JSON Schema validation solution with detailed error reporting and custom validation support.

---

## How to use

```bash
yarn add @canard/schema-form @canard/schema-form-ajv6-plugin
```

```tsx
import { SchemaForm, registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv6-plugin';
// Or register with custom AJV instance
import Ajv from 'ajv';

// Register the validator plugin globally
registerPlugin(ajvValidatorPlugin);

const customAjv = new Ajv({
  allErrors: true,
  verbose: true,
});
ajvValidatorPlugin.bind(customAjv);
registerPlugin(ajvValidatorPlugin);
```

---

## Features

### **Plugin Interface**

The plugin implements the `ValidatorPlugin` interface providing two main methods:

#### **`bind(instance: Ajv.Ajv)`**

- **Purpose**: Allows you to provide a custom AJV instance with your preferred configuration
- **Usage**: Optional - if not called, a default AJV instance will be created automatically
- **Benefits**: Full control over AJV settings, custom keywords, formats, and validation rules

#### **`compile(jsonSchema)`**

- **Purpose**: Creates a validator function from the provided JSON Schema
- **Returns**: A validator factory function that can validate data against the schema
- **Features**: Automatic error transformation, detailed validation messages, performance optimization

### **Default Configuration**

When no custom AJV instance is provided, the plugin uses these default settings:

```typescript
const defaultSettings: Ajv.Options = {
  allErrors: true, // Collect all validation errors, not just the first one
  verbose: true, // Include schema and data information in errors
  format: false, // Disable format validation (can be enabled if needed)
};
```

### **Validator Factory**

The `createValidatorFactory` function provides:

- **Error Standardization**: Converts AJV errors to a consistent format
- **Performance Optimization**: Caches compiled validators for reuse
- **Detailed Error Messages**: Rich error information for better user experience
- **Type Safety**: Full TypeScript support with proper type inference

---

## Compatibility

`@canard/schema-form-ajv6-plugin` is built with ECMAScript 2020 (ES2020) syntax and supports AJV 6.x.

**Supported environments:**

- Node.js 14.17.0 or later
- Modern browsers (Chrome 91+, Firefox 90+, Safari 14+)
- AJV 6.0.0 or later

**For legacy environment support:**
Please use a transpiler like Babel to transform the code for your target environment.

**Dependency requirements:**

- @canard/schema-form (peer dependency)
- ajv ^6.0.0

**JSON Schema Support:**

- Draft-04
- Draft-06
- Draft-07

---

## Migration Guide

### From Manual AJV Usage

```typescript
// Before (manual AJV)
// After (with plugin)
import { SchemaForm, registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv6-plugin';
import Ajv from 'ajv';

const ajv = new Ajv();
const validate = ajv.compile(schema);
const isValid = validate(data);

registerPlugin(ajvValidatorPlugin);
// Validation is now handled automatically by SchemaForm
```

### To AJV 8.x

If you need to upgrade to AJV 8.x for newer JSON Schema features:

```bash
yarn remove @canard/schema-form-ajv6-plugin
yarn add @canard/schema-form-ajv8-plugin
```

```typescript
// Update import
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
```

---

## License

This repository is licensed under the MIT License. Please refer to the [`LICENSE`](../../../LICENSE) file for details.

---

## Contact

For inquiries or suggestions related to the project, please create an issue on the [GitHub repository](https://github.com/vincent-kk/albatrion).
