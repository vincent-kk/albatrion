# @winglet/json

[![TypeScript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![JSON Schema](https://img.shields.io/badge/JsonSchema-{}-blue.svg)]()
[![RFC 6901](https://img.shields.io/badge/RFC%206901-compliant-green.svg)]()

---

## Overview

`@winglet/json` is a TypeScript library for safe and efficient JSON data manipulation. It provides structured JSON data processing by strictly adhering to RFC 6901 (JSON Pointer) and RFC 6902 (JSON Patch) standards.

### Key Features

- **Type Safety**: Full TypeScript support with compile-time type validation
- **Standards Compliant**: Complete implementation of RFC 6901 (JSON Pointer) and RFC 6902 (JSON Patch)
- **Security**: Built-in protection against prototype pollution attacks
- **Flexibility**: Immutable and strict mode options for different use cases
- **Performance**: Optimized algorithms supporting large-scale JSON data processing

---

## Installation

```bash
# Using npm
npm install @winglet/json

# Using yarn
yarn add @winglet/json

# Using pnpm
pnpm add @winglet/json
```

---

## Sub-path Imports

This package supports sub-path imports to enable more granular imports and optimize bundle size. You can import specific modules directly without importing the entire package:

```typescript
// Main exports (all JSONPointer and JSONPath utilities)
import { getValueByPointer, setValueByPointer } from '@winglet/json';

// JSONPath utilities
import { JSONPath } from '@winglet/json/path';

// JSONPointer utilities
import {
  getValueByPointer,
  setValueByPointer,
  escapePath,
  unescapePath,
  compare,
  applyPatch,
  difference,
  mergePatch
} from '@winglet/json/pointer';
```

### Available Sub-paths

- `@winglet/json` - Main exports (all JSONPointer and JSONPath utilities)
- `@winglet/json/path` - JSONPath constants and utilities
- `@winglet/json/pointer` - JSONPointer manipulation, escaping, and patch operations

---

## Compatibility

This package is written using ECMAScript 2020 (ES2020) syntax.

**Supported Environments:**

- Node.js 14.0.0 or higher
- Modern browsers (with ES2020 support)

**For Legacy Environment Support:**
Use transpilers like Babel to convert the code to match your target environment.

---

## API Reference

### JSONPath

Provides special character constants used in JSONPath expressions.

#### Supported Operators

- **[`JSONPath.Root`](./src/JSONPath/enum.ts)** (`$`): Root node of the JSON document
- **[`JSONPath.Parent`](./src/JSONPath/enum.ts)** (`_`): Parent node of the current node
- **[`JSONPath.Current`](./src/JSONPath/enum.ts)** (`@`): Currently processing node
- **[`JSONPath.Child`](./src/JSONPath/enum.ts)** (`.`): Child node access operator
- **[`JSONPath.Filter`](./src/JSONPath/enum.ts)** (`#`): Filter condition operator

### JSONPointer

Provides a complete JSON Pointer implementation that fully complies with RFC 6901.

#### Core Features

##### Data Manipulation

**[`getValueByPointer`](./src/JSONPointer/utils/manipulator/getValueByPointer.ts)**

```typescript
import { getValueByPointer } from '@winglet/json';

const data = {
  user: {
    profile: {
      name: 'Vincent',
      age: 30,
    },
  },
};

const name = getValueByPointer(data, '/user/profile/name');
// Result: "Vincent"
```

**[`setValueByPointer`](./src/JSONPointer/utils/manipulator/setValueByPointer.ts)**

```typescript
import { setValueByPointer } from '@winglet/json';

const data = { user: { profile: {} } };
const result = setValueByPointer(
  data,
  '/user/profile/email',
  'vincent@example.com',
);
// Result: { user: { profile: { email: "vincent@example.com" } } }
```

##### Escape Handling

**[`escapePath`](./src/JSONPointer/utils/escape/escapePath.ts)**

```typescript
import { escapePath } from '@winglet/json';

const escaped = escapePath('path/with~special');
// Result: "path~1with~0special"
```

**[`unescapePath`](./src/JSONPointer/utils/escape/unescapePath.ts)**

```typescript
import { unescapePath } from '@winglet/json';

const unescaped = unescapePath('path~1with~0special');
// Result: "path/with~special"
```

##### JSON Patch Operations

**[`compare`](./src/JSONPointer/utils/patch/compare/compare.ts)**

```typescript
import { compare } from '@winglet/json';

const source = { name: 'John', age: 30, city: 'NYC' };
const target = { name: 'John', age: 31, country: 'USA' };

const patches = compare(source, target);
// Result:
// [
//   { op: "replace", path: "/age", value: 31 },
//   { op: "remove", path: "/city" },
//   { op: "add", path: "/country", value: "USA" }
// ]
```

**[`applyPatch`](./src/JSONPointer/utils/patch/applyPatch/applyPatch.ts)**

```typescript
import { applyPatch } from '@winglet/json';

const source = { name: 'John', age: 30 };
const patches = [
  { op: 'replace', path: '/age', value: 31 },
  { op: 'add', path: '/city', value: 'NYC' },
];

const result = applyPatch(source, patches);
// Result: { name: "John", age: 31, city: "NYC" }
```

**[`difference`](./src/JSONPointer/utils/patch/difference/difference.ts)**

```typescript
import { difference } from '@winglet/json';

const source = { name: 'John', age: 30, city: 'NYC' };
const target = { name: 'John', age: 31, country: 'USA' };

const mergePatch = difference(source, target);
// Result: { age: 31, city: null, country: "USA" }
```

**[`mergePatch`](./src/JSONPointer/utils/patch/mergePatch/mergePatch.ts)**

```typescript
import { mergePatch } from '@winglet/json';

const source = { name: 'John', age: 30, temp: 'data' };
const patch = { age: 31, temp: null, city: 'NYC' };

const result = mergePatch(source, patch);
// Result: { name: "John", age: 31, city: "NYC" }
```

#### Configuration Options

##### CompareOptions

```typescript
interface CompareOptions {
  strict?: boolean; // Strict comparison mode (default: false)
  immutable?: boolean; // Immutable mode (default: true)
}
```

##### ApplyPatchOptions

```typescript
interface ApplyPatchOptions {
  strict?: boolean; // Strict application mode (default: false)
  immutable?: boolean; // Immutable mode (default: true)
  protectPrototype?: boolean; // Prototype protection (default: true)
}
```

---

## Usage Examples

### Basic Usage

```typescript
import {
  applyPatch,
  compare,
  getValueByPointer,
  setValueByPointer,
} from '@winglet/json';

// Complex JSON data
const data = {
  users: [
    { id: 1, name: 'Alice', preferences: { theme: 'dark' } },
    { id: 2, name: 'Bob', preferences: { theme: 'light' } },
  ],
  settings: {
    app: { version: '1.0.0' },
  },
};

// Value retrieval
const theme = getValueByPointer(data, '/users/0/preferences/theme');
console.log(theme); // "dark"

// Value setting
const updated = setValueByPointer(data, '/settings/app/version', '1.1.0');

// Change comparison
const patches = compare(data, updated);
console.log(patches);
// [{ op: "replace", path: "/settings/app/version", value: "1.1.0" }]
```

### Advanced Usage - Immutability and Security

```typescript
import { applyPatch } from '@winglet/json';

const data = { user: { role: 'user' } };
const patches = [
  { op: 'add', path: '/user/permissions', value: ['read', 'write'] },
  { op: 'replace', path: '/user/role', value: 'admin' },
];

// Safe patch application (prevents prototype pollution)
const result = applyPatch(data, patches, {
  immutable: true, // Preserve original data
  protectPrototype: true, // Prevent prototype pollution
  strict: true, // Strict validation
});

console.log(data); // Original data preserved
console.log(result); // New modified object
```

### JSON Merge Patch Usage

```typescript
import { difference, mergePatch } from '@winglet/json';

const source = {
  user: { name: 'Alice', age: 25, role: 'admin', temp: 'data' },
  settings: { theme: 'dark' },
};

const target = {
  user: { name: 'Bob', age: 25, permissions: ['read', 'write'] },
  settings: { theme: 'light', language: 'en' },
};

// Generate JSON Merge Patch representing differences between two objects
const patch = difference(source, target);
console.log(patch);
// {
//   user: { name: "Bob", role: null, temp: null, permissions: ["read", "write"] },
//   settings: { theme: "light", language: "en" }
// }

// Apply JSON Merge Patch
const result = mergePatch(source, patch);
console.log(result);
// {
//   user: { name: "Bob", age: 25, permissions: ["read", "write"] },
//   settings: { theme: "light", language: "en" }
// }
```

### Array Manipulation

```typescript
import { getValueByPointer, setValueByPointer } from '@winglet/json';

const data = {
  items: ['apple', 'banana', 'cherry'],
};

// Array element access
const secondItem = getValueByPointer(data, '/items/1');
// Result: "banana"

// Add element to end of array (using RFC 6901 "-" syntax)
const withNewItem = setValueByPointer(data, '/items/-', 'date');
// Result: { items: ["apple", "banana", "cherry", "date"] }
```

---

## Error Handling

```typescript
import { JSONPointerError, getValueByPointer } from '@winglet/json';

try {
  const value = getValueByPointer({}, '/nonexistent/path');
} catch (error) {
  if (error instanceof JSONPointerError) {
    console.error('JSON Pointer Error:', error.message);
    console.error('Error Code:', error.code);
    console.error('Additional Details:', error.details);
  }
}
```

---

## Performance Considerations

- **Large Data**: Consider using `immutable: false` option when dealing with deeply nested objects or large arrays
- **Frequent Changes**: Use `strict: false` to improve performance when applying many patches sequentially
- **Memory Usage**: Immutable mode uses more memory but ensures safety

---

## Contributing

If you'd like to contribute to this project:

1. Create an issue for bug reports or feature suggestions
2. Submit pull requests with improvements
3. Include test cases with your submissions

---

## License

This repository is provided under the MIT License. See the [`LICENSE`](./LICENSE) file for details.

---

## Related Standards

- [RFC 6901 - JavaScript Object Notation (JSON) Pointer](https://datatracker.ietf.org/doc/html/rfc6901)
- [RFC 6902 - JavaScript Object Notation (JSON) Patch](https://datatracker.ietf.org/doc/html/rfc6902)
- [RFC 7396 - JSON Merge Patch](https://datatracker.ietf.org/doc/html/rfc7396)
- [JSONPath - XPath for JSON](https://goessner.net/articles/JsonPath/)

---

## Contact

For questions or suggestions about this project, please create a GitHub issue.
