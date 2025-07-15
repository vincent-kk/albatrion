# @canard/schema-form-inline-error-message-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Json Schema Form Plugin](https://img.shields.io/badge/JsonSchemaForm-validator-green.svg)]()

---

## Overview

`@canard/schema-form-inline-error-message-plugin` is a plugin for `@canard/schema-form` that supports custom validation message definition methods.

---

## Notice

📌 This plugin supports custom validation message definition methods.
📌 This plugin does not include validation functionality. To use validation features, you must use one of the following plugins or implement your own validator:

- [@canard/schema-form-ajv6-plugin](../schema-form-ajv6-plugin/README.md)
- [@canard/schema-form-ajv7-plugin](../schema-form-ajv7-plugin/README.md)
- [@canard/schema-form-ajv8-plugin](../schema-form-ajv8-plugin/README.md)

---

## Usage

```bash
yarn add @canard/schema-form @canard/schema-form-inline-error-message-plugin
```

```tsx
import { SchemaForm, registerPlugin } from '@canard/schema-form';
import { plugin as ajv8Plugin } from '@canard/schema-form-ajv8-plugin';
import { plugin as inlineErrorMessagePlugin } from '@canard/schema-form-inline-error-message-plugin';

// Validator is required to generate validation errors
registerPlugin(ajv8Plugin);
// Register validator plugin globally
registerPlugin(inlineErrorMessagePlugin);

// Supports custom validation message definition methods
// Example:
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      maxLength: 10,
      options: {
        validationMessage: {
          minLength:
            'Name must be at least {limit} characters long. Current value: {value}',
          maxLength:
            'Name must be no more than {limit} characters long. Current value: {value}',
          required: 'Name is a required field.',
        },
      },
    },
  },
  required: ['name'],
};

<Form jsonSchema={schema} />;
```

---

## License

This repository is distributed under the MIT License. See the [`LICENSE`](../../../LICENSE) file for more details.

---

## Contact

For project-related inquiries or suggestions, please create an issue on the [GitHub repository](https://github.com/vincent-kk/albatrion).
