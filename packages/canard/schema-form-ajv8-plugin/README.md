# @canard/schema-form-ajv8-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![AJV](https://img.shields.io/badge/AJV-8.x-orange.svg)]()
[![Json Schema Form Plugin](https://img.shields.io/badge/JsonSchemaForm-validator-green.svg)]()

---

## Overview

`@canard/schema-form-ajv8-plugin` is a validator plugin for `@canard/schema-form` that provides JSON Schema validation using AJV 8.x with support for the latest JSON Schema specifications.

---

## Notice

⚠️ This plugin uses AJV 8.x which supports the latest JSON Schema specifications including Draft 2019-09 and Draft 2020-12.

📌 For projects requiring compatibility with older JSON Schema drafts or legacy environments, consider using `@canard/schema-form-ajv6-plugin` instead.

💡 This plugin provides enhanced JSON Schema validation with improved performance, better error messages, and support for the latest JSON Schema features.

---

## How to use

```bash
yarn add @canard/schema-form @canard/schema-form-ajv8-plugin
```

```tsx
import { SchemaForm, registerPlugin } from '@canard/schema-form';
import { plugin as ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
// Or register with custom AJV instance
import Ajv from 'ajv';

// Register the validator plugin globally
registerPlugin(ajvValidatorPlugin);

// When using a custom AJV instance
const customAjv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false, // AJV 8.x specific option
});
ajvValidatorPlugin.bind(customAjv);
registerPlugin(ajvValidatorPlugin);
```

---

## Multi-Draft Support

This plugin provides sub-path exports for different JSON Schema draft versions:

### Available Imports

| Import Path                            | JSON Schema Draft | Description                               |
| -------------------------------------- | ----------------- | ----------------------------------------- |
| `@canard/schema-form-ajv8-plugin`      | Draft-07          | Default, backward compatible              |
| `@canard/schema-form-ajv8-plugin/2019` | Draft 2019-09     | Modern features, `$recursiveRef` support  |
| `@canard/schema-form-ajv8-plugin/2020` | Draft 2020-12     | Latest spec, `prefixItems`, `$dynamicRef` |

### Usage Examples

```tsx
// Default (Draft-07) - backward compatible
import { plugin } from '@canard/schema-form-ajv8-plugin';

// Draft 2019-09 - for modern JSON Schema features
import { plugin } from '@canard/schema-form-ajv8-plugin/2019';

// Draft 2020-12 - for latest features like prefixItems
import { plugin } from '@canard/schema-form-ajv8-plugin/2020';

// Register your chosen version
registerPlugin(plugin);
```

### Choosing the Right Draft

- **Draft-07 (default)**: Use for maximum compatibility with existing schemas and tools
- **Draft 2019-09**: Use for `$recursiveRef`, enhanced `$ref` handling, and `unevaluatedProperties`
- **Draft 2020-12**: Use for `prefixItems`, `$dynamicRef`, and the latest JSON Schema features

> **Note**: Existing users importing from `@canard/schema-form-ajv8-plugin` require no migration. The default export maintains full backward compatibility.

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

When no custom AJV instance is provided, the plugin uses these default settings optimized for AJV 8.x:

```typescript
const defaultSettings: Ajv.Options = {
  allErrors: true, // Collect all validation errors, not just the first one
  verbose: true, // Include schema and data information in errors
  strict: false, // Disable strict mode for better compatibility
  validateFormats: true, // Enable format validation (AJV 8.x default)
};
```

### **Enhanced Validator Factory**

The `createValidatorFactory` function provides:

- **Advanced Error Processing**: Enhanced error transformation using `@winglet/common-utils`
- **Performance Optimization**: Improved caching and validation speed
- **Rich Error Context**: Detailed error information for better debugging
- **Type Safety**: Full TypeScript support with advanced type inference

### **Modern JSON Schema Support**

This plugin supports the latest JSON Schema features:

- **Draft 2020-12**: Latest specification with enhanced conditional logic
- **Draft 2019-09**: Modern schema composition and validation features
- **Backward Compatibility**: Full support for Draft-07, Draft-06, and Draft-04
- **Advanced Keywords**: Support for `unevaluatedProperties`, `unevaluatedItems`, and more

---

## Compatibility

`@canard/schema-form-ajv8-plugin` is built with ECMAScript 2020 (ES2020) syntax and supports AJV 8.x.

**Supported environments:**

- Node.js 16.0.0 or later (recommended for AJV 8.x)
- Modern browsers (Chrome 91+, Firefox 90+, Safari 14+)
- AJV 8.0.0 or later

**For legacy environment support:**
Please use a transpiler like Babel to transform the code for your target environment.

**Dependency requirements:**

- @canard/schema-form (peer dependency)
- @winglet/common-utils (workspace dependency)
- ajv ^8.0.0

**JSON Schema Support:**

- Draft 2020-12 ✅
- Draft 2019-09 ✅
- Draft-07 ✅
- Draft-06 ✅
- Draft-04 ✅

---

## Migration Guide

### From AJV 6.x Plugin

If you're upgrading from the AJV 6.x plugin:

```bash
yarn remove @canard/schema-form-ajv6-plugin
yarn add @canard/schema-form-ajv8-plugin
```

```typescript
// Update import
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

// Note: AJV 8.x has different default behaviors
// You might need to adjust your AJV configuration
const customAjv = new Ajv({
  strict: false, // Disable strict mode if you have compatibility issues
  validateFormats: true, // Format validation is enabled by default in AJV 8.x
});
```

### From Manual AJV Usage

```typescript
// Before (manual AJV 8.x)
// After (with plugin)
import { SchemaForm, registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
import Ajv from 'ajv';

const ajv = new Ajv();
const validate = ajv.compile(schema);
const isValid = validate(data);

registerPlugin(ajvValidatorPlugin);
// Validation is now handled automatically by SchemaForm
```

---

## Advanced Usage

### Custom Error Handling

```typescript
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
import Ajv from 'ajv';

// Create AJV instance with custom error handling
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  errorDataPath: 'property', // AJV 8.x uses 'instancePath' by default
});

// Add custom keywords or formats
ajv.addKeyword({
  keyword: 'customValidation',
  validate: function (schema, data) {
    // Your custom validation logic
    return true;
  },
});

// Bind custom instance
ajvValidatorPlugin.bind(ajv);
registerPlugin(ajvValidatorPlugin);
```

---

## License

This repository is licensed under the MIT License. Please refer to the [`LICENSE`](../../../LICENSE) file for details.

---

## Contact

For inquiries or suggestions related to the project, please create an issue on the [GitHub repository](https://github.com/vincent-kk/albatrion).
