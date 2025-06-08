# @winglet/json-schema

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Json Schema](https://img.shields.io/badge/JsonSchema-{}-blue.svg)]()

---

## Overview

`@winglet/json-schema` is a powerful utility library for working with JSON Schema and JSON data. It provides key functionalities such as JSON Schema structure traversal, validation, reference resolution, and filtering. Written in TypeScript to ensure type safety, it offers various features for structured processing of JSON Schema.

---

## Installation

```bash
# Using npm
npm install @winglet/json-schema

# Using yarn
yarn add @winglet/json-schema
```

---

## Sub-path Imports

This package supports sub-path imports to enable more granular imports and optimize bundle size. You can import specific modules directly without importing the entire package:

```typescript
// Main exports (all utilities and type definitions)
import { JsonSchemaScanner, isObjectSchema } from '@winglet/json-schema';

// Synchronous schema scanner
import { JsonSchemaScanner } from '@winglet/json-schema/scanner';

// Asynchronous schema scanner
import { JsonSchemaScannerAsync } from '@winglet/json-schema/async-scanner';

// Schema type checking utilities
import {
  isArraySchema,
  isObjectSchema,
  isStringSchema,
  isNumberSchema,
  isBooleanSchema,
  isNullSchema
} from '@winglet/json-schema/filter';
```

### Available Sub-paths

- `@winglet/json-schema` - Main exports (all utilities, scanners, and type definitions)
- `@winglet/json-schema/scanner` - Synchronous JSON Schema scanner
- `@winglet/json-schema/async-scanner` - Asynchronous JSON Schema scanner
- `@winglet/json-schema/filter` - Schema type checking and filtering utilities

---

## Compatibility

This package is built with ECMAScript 2022 (ES2022) syntax.

If you're using a JavaScript environment that doesn't support ES2022, you'll need to include this package in your transpilation process.

**Supported environments:**

- Node.js 16.11.0 or later
- Modern browsers (Chrome 94+, Firefox 93+, Safari 15+)

**For legacy environment support:**
Please use a transpiler like Babel to transform the code for your target environment.

**Target packages**

- `@winglet/json-schema`
- `@winglet/common-utils`

---

## Key Features

### 1. Schema Traversal and Validation

- **[`JsonSchemaScanner`](./src/utils/JsonSchemaScanner/JsonSchemaScanner.ts)**: A class that traverses JSON schema using depth-first search (DFS) approach, implements the Visitor pattern, and resolves $ref references
- **[`JsonSchemaScannerAsync`](./src/utils/JsonSchemaScanner/JsonSchemaScannerAsync.ts)**: An extension of JsonSchemaScanner that supports asynchronous operations

### 2. Type Validation and Filtering

- **[`isArraySchema`](./src/filter.ts)**: Check if a schema is an array type
- **[`isNumberSchema`](./src/filter.ts)**: Check if a schema is a number type
- **[`isObjectSchema`](./src/filter.ts)**: Check if a schema is an object type
- **[`isStringSchema`](./src/filter.ts)**: Check if a schema is a string type
- **[`isBooleanSchema`](./src/filter.ts)**: Check if a schema is a boolean type
- **[`isNullSchema`](./src/filter.ts)**: Check if a schema is a null type

### 3. Schema-based Data Processing

- **[`getValueWithSchema`](./src/utils/getValueWithSchema/getValueWithSchema.ts)**: Extract necessary data based on given value and schema

### 4. JSON Schema Type Definitions

- Various JSON Schema type definitions ([`ObjectSchema`](./src/types/jsonSchema.ts), [`ArraySchema`](./src/types/jsonSchema.ts), [`StringSchema`](./src/types/jsonSchema.ts), etc.)
- Utility types for inferring value types from schemas ([`InferValueType`](./src/types/value.ts))

---

## Usage Examples

### Using JsonSchemaScanner

```typescript
import { JsonSchemaScanner } from '@winglet/json-schema';

// Schema definition
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
    address: {
      type: 'object',
      properties: {
        city: { type: 'string' },
        zipCode: { type: 'string' },
      },
    },
  },
};

// Using Visitor pattern to traverse schema
const scanner = new JsonSchemaScanner({
  visitor: {
    enter: (entry, context) => {
      console.log(`Enter: ${entry.path}`);
    },
    exit: (entry, context) => {
      console.log(`Exit: ${entry.path}`);
    },
  },
  options: {
    maxDepth: 5, // Set maximum traversal depth
    filter: (entry, context) => {
      // Filter nodes based on specific conditions
      return true;
    },
  },
});

// Scan the schema
scanner.scan(schema);

// Get the processed schema
const processedSchema = scanner.getValue();
```

### Checking Schema Types

```typescript
import {
  isArraySchema,
  isObjectSchema,
  isStringSchema,
} from '@winglet/json-schema';

const schema = {
  type: 'object',
  properties: {
    /* ... */
  },
};

if (isObjectSchema(schema)) {
  // Process object schema
  const properties = schema.properties;
  // ...
} else if (isArraySchema(schema)) {
  // Process array schema
  const items = schema.items;
  // ...
}
```

### Extracting Data Based on Schema

```typescript
import { getValueWithSchema } from '@winglet/json-schema';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
  },
  required: ['name'],
  oneOf: [{}], // oneOf is required for this to work
};

const data = {
  name: 'John Doe',
  age: 30,
  extra: 'This will be filtered out',
};

const result = getValueWithSchema(data, schema);
console.log(result); // { name: 'John Doe', age: 30 }
```

---

## Development Environment Setup

```bash
# Clone repository
dir=your-albatrion && git clone https://github.com/vincent-kk/albatrion.git "$dir" && cd "$dir"

# Install dependencies
nvm use && yarn install && yarn run:all build

# Development build
yarn jsonSchema build

# Run tests
yarn jsonSchema test
```

---

## API Reference

### Main Classes and Functions

#### JsonSchemaScanner

A class for traversing JSON schema and resolving references.

```typescript
class JsonSchemaScanner<ContextType = void> {
  constructor(props?: {
    visitor?: SchemaVisitor<ContextType>;
    options?: JsonScannerOptions<ContextType>;
  });
  scan(schema: UnknownSchema): this;
  getValue<Schema extends UnknownSchema>(): Schema | undefined;
}
```

#### JsonSchemaScannerAsync

An extension of JsonSchemaScanner that supports asynchronous operations.

```typescript
class JsonSchemaScannerAsync<
  ContextType = void,
> extends JsonSchemaScanner<ContextType> {
  scanAsync(schema: UnknownSchema): Promise<this>;
  getValueAsync<Schema extends UnknownSchema>(): Promise<Schema | undefined>;
}
```

#### Type Validation Functions

```typescript
function isArraySchema(schema: UnknownSchema): schema is ArraySchema;
function isNumberSchema(schema: UnknownSchema): schema is NumberSchema;
function isObjectSchema(schema: UnknownSchema): schema is ObjectSchema;
function isStringSchema(schema: UnknownSchema): schema is StringSchema;
function isBooleanSchema(schema: UnknownSchema): schema is BooleanSchema;
function isNullSchema(schema: UnknownSchema): schema is NullSchema;
```

#### Value Extraction Function

```typescript
function getValueWithSchema<Value>(
  value: Value | undefined,
  schema: JsonSchema,
): Value | undefined;
```

### Main Type Definitions

```typescript
// Basic JSON Schema types
type JsonSchema<Options extends Dictionary = object> =
  | NumberSchema<Options, JsonSchema>
  | StringSchema<Options, JsonSchema>
  | BooleanSchema<Options, JsonSchema>
  | ArraySchema<Options, JsonSchema>
  | ObjectSchema<Options, JsonSchema>
  | NullSchema<Options, JsonSchema>;

// Value types
type BooleanValue = boolean;
type NumberValue = number;
type StringValue = string;
type ArrayValue = any[];
type ObjectValue = Record<string, any>;
type NullValue = null;
```

---

## License

This repository is provided under the MIT License. For details, please refer to the [`LICENSE`](./LICENSE) file.

---

## Contact

For inquiries or suggestions related to the project, please create an issue.
