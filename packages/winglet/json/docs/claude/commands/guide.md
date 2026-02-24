# @winglet/json — Usage Guide for Claude

This guide provides command-oriented patterns for working with `@winglet/json`. Use it when asked to write, review, or debug code that uses this library.

---

## Installation

```bash
npm install @winglet/json
# or
yarn add @winglet/json
```

Requires Node.js 14+ or a modern browser with ES2020 support.

---

## Import Strategy

Prefer sub-path imports for tree-shaking. Fall back to the main entry only when mixing multiple sub-systems.

```typescript
// Prefer: targeted imports
import { getValue, setValue }                   from '@winglet/json/pointer-manipulator';
import { compare, applyPatch, difference, mergePatch } from '@winglet/json/pointer-patch';
import { escapePath, unescapePath }             from '@winglet/json/pointer-escape';
import { JSONPath }                             from '@winglet/json/path';
import { getJSONPath, convertJsonPathToPointer } from '@winglet/json/path-common';
import { JSONPointer }                          from '@winglet/json/pointer-common';

// Acceptable: single entry for mixed usage
import {
  getValue, setValue,
  compare, applyPatch, difference, mergePatch,
  escapePath, unescapePath,
  JSONPointerError, isJSONPointerError,
} from '@winglet/json';
```

---

## Task: Read a value from a JSON document

```typescript
import { getValue } from '@winglet/json/pointer-manipulator';

const config = { db: { host: 'localhost', port: 5432 } };

const host = getValue(config, '/db/host'); // 'localhost'
const port = getValue(config, '/db/port'); // 5432
```

Use array form when tokens are dynamic:
```typescript
const path = ['db', 'host'];
getValue(config, path); // 'localhost'
```

---

## Task: Write a value into a JSON document

```typescript
import { setValue } from '@winglet/json/pointer-manipulator';

const state = { user: { name: 'Alice' } };

// setValue mutates in place and returns the same reference
setValue(state, '/user/email', 'alice@example.com');
// state.user.email === 'alice@example.com'

// Append to array
setValue(state, '/tags/-', 'admin');

// Do not overwrite existing values
setValue(state, '/user/name', 'Bob', { overwrite: false });
// state.user.name still 'Alice'
```

---

## Task: Generate a diff between two objects (RFC 6902 patches)

```typescript
import { compare } from '@winglet/json/pointer-patch';

const before = { name: 'Alice', age: 25, role: 'user' };
const after  = { name: 'Alice', age: 26, permissions: ['read'] };

const patches = compare(before, after);
// [
//   { op: 'replace', path: '/age', value: 26 },
//   { op: 'remove',  path: '/role' },
//   { op: 'add',     path: '/permissions', value: ['read'] }
// ]
```

---

## Task: Apply JSON Patch operations

```typescript
import { applyPatch } from '@winglet/json/pointer-patch';

const source  = { name: 'Alice', age: 25 };
const patches = [
  { op: 'replace', path: '/age', value: 26 },
  { op: 'add',     path: '/city', value: 'Seoul' },
];

const result = applyPatch(source, patches);
// { name: 'Alice', age: 26, city: 'Seoul' }
// source is unchanged (immutable: true by default)
```

For mutable high-performance usage:
```typescript
applyPatch(source, patches, { immutable: false, protectPrototype: false });
```

---

## Task: Generate and apply a JSON Merge Patch (RFC 7396)

```typescript
import { difference, mergePatch } from '@winglet/json/pointer-patch';

const source = { a: 1, b: 2, c: 3 };
const target = { a: 1, b: 99, d: 4 };

// Generate merge patch
const patch = difference(source, target);
// { b: 99, c: null, d: 4 }
// null = remove, number = add/replace

// Apply merge patch
const result = mergePatch(source, patch);
// { a: 1, b: 99, d: 4 }
```

Guard against undefined (no changes):
```typescript
const patch = difference(source, target);
if (patch !== undefined) {
  const result = mergePatch(source, patch);
}
```

---

## Task: Handle keys with special characters

Keys containing `/` or `~` must be escaped before use in a pointer.

```typescript
import { escapeSegment, escapePath } from '@winglet/json/pointer-escape';
import { getValue } from '@winglet/json/pointer-manipulator';

const doc = { 'api/v1': { status: 'ok' } };

// Escape a single key segment
const key     = 'api/v1';
const pointer = `/${escapeSegment(key)}/status`; // '/api~1v1/status'
getValue(doc, pointer); // 'ok'

// escapePath handles full paths (preserves / separators, escapes ~ in segments)
escapePath('/config/app~name/value');
// '/config/app~0name/value'
```

---

## Task: Error handling

```typescript
import { getValue, JSONPointerError, isJSONPointerError } from '@winglet/json';

function safeGet<T>(obj: object, ptr: string, fallback: T): T {
  try {
    return getValue(obj, ptr) as T;
  } catch (e) {
    if (isJSONPointerError(e)) {
      if (e.code === 'PROPERTY_NOT_FOUND') return fallback;
      console.error(`Pointer error [${e.code}]:`, e.message);
    }
    throw e;
  }
}

safeGet({ a: 1 }, '/b', null); // null
safeGet({ a: 1 }, '/a', null); // 1
```

---

## Task: Find JSONPath to a nested object

```typescript
import { getJSONPath, convertJsonPathToPointer } from '@winglet/json/path-common';
import { getValue } from '@winglet/json/pointer-manipulator';

const doc = { users: [{ name: 'Alice' }, { name: 'Bob' }] };
const bob = doc.users[1];

const jsonPath = getJSONPath(doc, bob);                // '$.users[1]'
const pointer  = convertJsonPathToPointer(jsonPath!);  // '/users/1'
const value    = getValue(doc, pointer);               // { name: 'Bob' }
```

---

## Security Checklist

When applying patches from untrusted sources (user input, external API):

```typescript
applyPatch(source, untrustedPatches, {
  immutable: true,         // never modify the original
  protectPrototype: true,  // block __proto__, constructor, prototype paths
  strict: false,           // lenient on missing paths (optional: true for RFC strict)
});
```

When applying patches from fully trusted sources in hot paths:
```typescript
applyPatch(source, trustedPatches, {
  immutable: false,
  protectPrototype: false,
  strict: false,
});
```

---

## Common Mistakes to Avoid

| Mistake | Correct Approach |
|---------|-----------------|
| Using `setValue` expecting immutability | `setValue` mutates in place — clone first if needed |
| Forgetting to escape `/` in keys | Use `escapeSegment(key)` before embedding in pointer |
| Assuming `difference` always returns an object | It returns `undefined` when values are equal |
| Applying patches to class instances | Input must be plain objects or arrays |
| Setting `-` index to read a value | `-` is only valid for array append in `setValue` / `add` patch |
