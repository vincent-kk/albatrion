# @winglet/json — Specification

**Version**: 0.10.0
**Standards**: RFC 6901 (JSON Pointer), RFC 6902 (JSON Patch), RFC 7396 (JSON Merge Patch)

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Sub-path Imports](#sub-path-imports)
4. [JSON Pointer](#json-pointer)
   - [getValue](#getvalue)
   - [setValue](#setvalue)
   - [escapePath / unescapePath](#escapepath--unescapepath)
   - [escapeSegment](#escapesegment)
   - [convertJsonPointerToPath](#convertjsonpointertopath)
5. [JSON Patch](#json-patch)
   - [compare](#compare)
   - [applyPatch](#applypatch)
   - [difference](#difference)
   - [mergePatch](#mergepatch)
6. [JSON Path](#json-path)
   - [getJSONPath](#getjsonpath)
   - [convertJsonPathToPointer](#convertjsonpathtopointer)
7. [Type Definitions](#type-definitions)
8. [Security](#security)
9. [Error Handling](#error-handling)
10. [Performance](#performance)

---

## Installation

```bash
npm install @winglet/json
yarn add @winglet/json
pnpm add @winglet/json
```

**Requirements**: Node.js 14.0.0+ or a modern browser with ES2020 support.

---

## Quick Start

```typescript
import { getValue, setValue, compare, applyPatch } from '@winglet/json';

const document = {
  users: [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob',   role: 'user' },
  ],
  settings: { theme: 'dark', language: 'en' },
};

// Read a value using JSON Pointer
const theme = getValue(document, '/settings/theme');
// 'dark'

// Write a value (mutates in place)
setValue(document, '/settings/theme', 'light');

// Generate a diff
const patches = compare(
  { name: 'Alice', age: 30 },
  { name: 'Alice', age: 31, city: 'Seoul' },
);
// [
//   { op: 'replace', path: '/age', value: 31 },
//   { op: 'add', path: '/city', value: 'Seoul' }
// ]

// Apply patches
const updated = applyPatch(document, patches);
// original document unchanged (immutable: true by default)
```

---

## Sub-path Imports

Use sub-path imports to minimize bundle size:

| Sub-path | Exports |
|----------|---------|
| `@winglet/json` | All exports |
| `@winglet/json/pointer` | All JSONPointer utilities |
| `@winglet/json/pointer-manipulator` | `getValue`, `setValue` |
| `@winglet/json/pointer-patch` | `compare`, `applyPatch`, `difference`, `mergePatch` |
| `@winglet/json/pointer-escape` | `escapePath`, `unescapePath`, `escapeSegment` |
| `@winglet/json/pointer-common` | `JSONPointer` constants, `convertJsonPointerToPath` |
| `@winglet/json/path` | `JSONPath` constants |
| `@winglet/json/path-common` | `getJSONPath`, `convertJsonPathToPointer` |

```typescript
import { getValue, setValue }           from '@winglet/json/pointer-manipulator';
import { compare, applyPatch }          from '@winglet/json/pointer-patch';
import { escapePath, escapeSegment }    from '@winglet/json/pointer-escape';
```

---

## JSON Pointer

A JSON Pointer (RFC 6901) is a string that identifies a specific value within a JSON document. Each reference token is prefixed with `/`.

### Pointer Syntax

| Pointer | Points To |
|---------|-----------|
| `""` | The entire document |
| `"/foo"` | Property `foo` at root |
| `"/foo/bar"` | Property `bar` nested under `foo` |
| `"/arr/0"` | First element of array `arr` |
| `"/a~1b"` | Key `a/b` (slash escaped as `~1`) |
| `"/a~0b"` | Key `a~b` (tilde escaped as `~0`) |

### getValue

Reads a value from a JSON document at the location specified by a JSON Pointer.

```typescript
function getValue<Output>(
  value: object | any[],
  pointer: string | string[],
): Output
```

**Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `object \| any[]` | Source JSON document (plain object or array) |
| `pointer` | `string \| string[]` | JSON Pointer string or array of reference tokens |

**Returns**: The value at the specified location.

**Throws**: `JSONPointerError` with code `INVALID_INPUT`, `INVALID_POINTER`, or `PROPERTY_NOT_FOUND`.

```typescript
import { getValue } from '@winglet/json/pointer-manipulator';

const doc = {
  store: {
    books: [
      { title: 'RFC 6901', author: 'IETF', price: 0 },
      { title: 'Clean Code', author: 'Martin', price: 35 },
    ],
  },
};

getValue(doc, '/store/books/0/title');   // 'RFC 6901'
getValue(doc, '/store/books/1/price');   // 35
getValue(doc, '');                        // entire document
getValue(doc, ['store', 'books', '0']);  // { title: 'RFC 6901', ... }

// Escaped keys
const data = { 'a/b': 'slash', 'a~b': 'tilde' };
getValue(data, '/a~1b'); // 'slash'
getValue(data, '/a~0b'); // 'tilde'
```

### setValue

Sets a value at the location specified by a JSON Pointer. **Mutates the input object in place.**

```typescript
function setValue<Output>(
  value: object | any[],
  pointer: string | string[],
  input: any,
  options?: {
    overwrite?: boolean;    // default: true
    preserveNull?: boolean; // default: true
  },
): Output
```

**Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | `object \| any[]` | — | Target JSON document to modify |
| `pointer` | `string \| string[]` | — | JSON Pointer to the target location |
| `input` | `any` | — | Value to set |
| `options.overwrite` | `boolean` | `true` | Replace existing values |
| `options.preserveNull` | `boolean` | `true` | Preserve `null` intermediate nodes |

**Returns**: The modified input object (same reference).

```typescript
import { setValue } from '@winglet/json/pointer-manipulator';

const obj = { user: {} };

// Basic set
setValue(obj, '/user/name', 'Alice');
// obj.user.name === 'Alice'

// Auto-create intermediate paths
setValue(obj, '/config/db/host', 'localhost');
// obj.config.db.host === 'localhost'

// Append to array
const arr = { items: [1, 2, 3] };
setValue(arr, '/items/-', 4);
// arr.items === [1, 2, 3, 4]

// Conditional set
setValue(obj, '/user/name', 'Bob', { overwrite: false });
// obj.user.name still 'Alice' — not overwritten

// Traverse through null
const nulled = { profile: null };
setValue(nulled, '/profile/name', 'Alice', { preserveNull: false });
// nulled.profile === { name: 'Alice' }
```

### escapePath / unescapePath

Escape and unescape complete JSON Pointer paths. Segment separators (`/`) are preserved; only `~` and `/` within segments are escaped.

```typescript
function escapePath(path: string): string
function unescapePath(path: string): string
```

```typescript
import { escapePath, unescapePath } from '@winglet/json/pointer-escape';

escapePath('/users/john~doe/settings');
// '/users/john~0doe/settings'

unescapePath('/users/john~0doe/settings');
// '/users/john~doe/settings'

// Round-trip
const original = '/data/key~with~tildes/value';
unescapePath(escapePath(original)) === original; // true
```

### escapeSegment

Escapes a single reference token (one path segment), converting both `~` and `/` to their escape sequences.

```typescript
function escapeSegment(segment: string): string
```

```typescript
import { escapeSegment } from '@winglet/json/pointer-escape';

escapeSegment('api/v1');       // 'api~1v1'
escapeSegment('config~prod');  // 'config~0prod'
escapeSegment('normal');       // 'normal' (no escaping needed)

// Building a pointer from a dynamic key
const key     = 'api/v1';
const pointer = `/${escapeSegment(key)}/status`;
// '/api~1v1/status'
```

### convertJsonPointerToPath

Converts a JSON Pointer string to an array of unescaped reference tokens.

```typescript
function convertJsonPointerToPath(pointer: string): string[]
```

```typescript
import { convertJsonPointerToPath } from '@winglet/json/pointer-common';

convertJsonPointerToPath('/foo/bar');     // ['foo', 'bar']
convertJsonPointerToPath('/a~1b/c~0d');  // ['a/b', 'c~d']
convertJsonPointerToPath('');            // []
```

---

## JSON Patch

JSON Patch (RFC 6902) describes a sequence of operations to transform a JSON document.

### Patch Operations

| Operation | Fields | Description |
|-----------|--------|-------------|
| `add` | `op`, `path`, `value` | Add value at path |
| `remove` | `op`, `path` | Remove value at path |
| `replace` | `op`, `path`, `value` | Replace value at path |
| `move` | `op`, `path`, `from` | Move value from one path to another |
| `copy` | `op`, `path`, `from` | Copy value from one path to another |
| `test` | `op`, `path`, `value` | Assert that value at path equals given value |

### compare

Generates an array of JSON Patch operations that transform `source` into `target`.

```typescript
function compare<Source, Target>(
  source: Source,
  target: Target,
  options?: {
    strict?: boolean;    // default: false
    immutable?: boolean; // default: true
  },
): Patch[]
```

```typescript
import { compare } from '@winglet/json/pointer-patch';

const source = { name: 'Alice', age: 25, role: 'user' };
const target = { name: 'Alice', age: 26, permissions: ['read'] };

compare(source, target);
// [
//   { op: 'replace', path: '/age', value: 26 },
//   { op: 'remove',  path: '/role' },
//   { op: 'add',     path: '/permissions', value: ['read'] }
// ]

// Identical objects return empty array
compare({ x: 1 }, { x: 1 }); // []

// Nested diff
compare(
  { settings: { theme: 'dark', lang: 'ko' } },
  { settings: { theme: 'light', lang: 'ko' } }
);
// [{ op: 'replace', path: '/settings/theme', value: 'light' }]
```

### applyPatch

Applies an array of JSON Patch operations sequentially to a source document.

```typescript
function applyPatch<Result>(
  source: object | any[],
  patches: Patch[],
  options?: {
    strict?: boolean;           // default: false
    immutable?: boolean;        // default: true
    protectPrototype?: boolean; // default: true
  },
): Result
```

```typescript
import { applyPatch } from '@winglet/json/pointer-patch';

const source = { name: 'Alice', tags: ['admin'] };

const result = applyPatch(source, [
  { op: 'add',     path: '/email', value: 'alice@example.com' },
  { op: 'replace', path: '/name',  value: 'Alicia' },
  { op: 'add',     path: '/tags/-', value: 'editor' },
  { op: 'remove',  path: '/tags/0' },
]);
// { name: 'Alicia', email: 'alice@example.com', tags: ['editor'] }
// source unchanged

// Move
applyPatch({ a: { b: 1 } }, [
  { op: 'move', from: '/a/b', path: '/c' },
]);
// { a: {}, c: 1 }

// Test + conditional update
applyPatch({ status: 'draft' }, [
  { op: 'test',    path: '/status', value: 'draft' },
  { op: 'replace', path: '/status', value: 'published' },
]);
// { status: 'published' }
```

### difference

Generates a JSON Merge Patch (RFC 7396) representing the differences between two values.

```typescript
function difference(
  source: JsonValue,
  target: JsonValue,
): JsonValue | undefined
```

Returns `undefined` when source and target are identical. Returns `null`-annotated object for object diffs (where `null` means "remove this property"). Returns the target value directly for arrays and type mismatches.

```typescript
import { difference } from '@winglet/json/pointer-patch';

difference({ a: 1, b: 2 }, { a: 1, b: 3, c: 4 });
// { b: 3, c: 4 }

difference({ a: 1, b: 2 }, { a: 1 });
// { b: null }  ← null means "remove b"

difference({ x: 1 }, { x: 1 });
// undefined  ← no changes

difference([1, 2, 3], [1, 2, 4]);
// [1, 2, 4]  ← arrays replaced wholesale

// Nested
difference(
  { user: { name: 'Alice', role: 'admin', temp: true } },
  { user: { name: 'Bob',   role: 'admin' } }
);
// { user: { name: 'Bob', temp: null } }
```

### mergePatch

Applies a JSON Merge Patch document to a source value (RFC 7396).

```typescript
function mergePatch<Type>(
  source: JsonValue,
  mergePatchBody: JsonValue | undefined,
  immutable?: boolean, // default: true
): Type
```

- `null` values in the patch remove the corresponding property.
- Non-object patch (including arrays) replaces the source entirely.
- `undefined` patch returns source unchanged.

```typescript
import { mergePatch } from '@winglet/json/pointer-patch';

// Add and replace
mergePatch({ name: 'Alice', age: 25 }, { age: 26, city: 'Seoul' });
// { name: 'Alice', age: 26, city: 'Seoul' }

// Remove with null
mergePatch({ name: 'Alice', temp: 'data' }, { temp: null });
// { name: 'Alice' }

// Nested
mergePatch(
  { user: { name: 'Alice', role: 'admin' } },
  { user: { role: null, email: 'alice@example.com' } }
);
// { user: { name: 'Alice', email: 'alice@example.com' } }

// Non-object patch = full replacement
mergePatch({ complex: true }, 'simple');
// 'simple'

// Mutable mode (better performance)
const src = { a: 1 };
const res = mergePatch(src, { b: 2 }, false);
src === res; // true — same reference
```

---

## JSON Path

### JSONPath Constants

```typescript
import { JSONPath } from '@winglet/json/path';

JSONPath.Root;    // '$'  — root of the document
JSONPath.Current; // '@'  — current node in expressions
JSONPath.Child;   // '.'  — child property accessor
JSONPath.Filter;  // '#'  — filter operator
```

### getJSONPath

Finds the JSONPath expression from `root` to `target` using depth-first search (reference equality).

```typescript
function getJSONPath<Root extends object, Target>(
  root: Root,
  target: Target,
): string | null
```

Returns `null` when `target` is not reachable from `root` or is a primitive at a leaf node.

```typescript
import { getJSONPath } from '@winglet/json/path-common';

const doc = { a: { b: [{ c: 'value' }] } };

getJSONPath(doc, doc);          // '$'
getJSONPath(doc, doc.a);        // '$.a'
getJSONPath(doc, doc.a.b);      // '$.a.b'
getJSONPath(doc, doc.a.b[0]);   // '$.a.b[0]'
getJSONPath(doc, {});           // null — different reference

// Keys with dots use bracket notation
const special = { 'key.with.dots': { nested: true } };
getJSONPath(special, special['key.with.dots']);
// "$['key.with.dots']"
```

### convertJsonPathToPointer

Converts a JSONPath string to an equivalent JSON Pointer string.

```typescript
function convertJsonPathToPointer(jsonPath: string): string
```

```typescript
import { convertJsonPathToPointer } from '@winglet/json/path-common';

convertJsonPathToPointer('$.foo.bar');       // '/foo/bar'
convertJsonPathToPointer('$.users[0].name'); // '/users/0/name'
convertJsonPathToPointer('$');               // ''
convertJsonPathToPointer("$['a/b'].c");      // '/a~1b/c'
```

---

## Type Definitions

```typescript
// Primitive JSON types
type JsonPrimitive = string | number | boolean | null;
type JsonArray     = Array<any>;
type JsonObject    = Record<string, any>;
type JsonValue     = JsonPrimitive | JsonArray | JsonObject;
type JsonRoot      = JsonArray | JsonObject;

// Patch operation types
type Operation = 'add' | 'replace' | 'remove' | 'move' | 'copy' | 'test';

interface AddPatch<V>     { op: 'add';     path: string; value: V }
interface ReplacePatch<V> { op: 'replace'; path: string; value: V }
interface RemovePatch     { op: 'remove';  path: string }
interface MovePatch       { op: 'move';    path: string; from: string }
interface CopyPatch       { op: 'copy';    path: string; from: string }
interface TestPatch<V>    { op: 'test';    path: string; value: V }

type Patch = AddPatch<any> | ReplacePatch<any> | RemovePatch
           | MovePatch | CopyPatch | TestPatch<any>;

// Options
type CompareOptions    = { strict?: boolean; immutable?: boolean };
type ApplyPatchOptions = { strict?: boolean; immutable?: boolean; protectPrototype?: boolean };
```

---

## Security

### Prototype Pollution Protection

`applyPatch` rejects patches targeting `__proto__`, `constructor`, or `prototype` paths when `protectPrototype: true` (the default).

```typescript
// This throws — prototype pollution blocked
applyPatch({}, [{ op: 'add', path: '/__proto__/isAdmin', value: true }]);

// Explicit opt-out (trusted sources only)
applyPatch(trustedSource, trustedPatches, { protectPrototype: false });
```

### Input Validation

`getValue` and `setValue` reject non-plain-object inputs:

```typescript
getValue('string', '/path');   // throws INVALID_INPUT
getValue(null, '/path');       // throws INVALID_INPUT
getValue(new Map(), '/path');  // throws INVALID_INPUT
```

---

## Error Handling

```typescript
import { JSONPointerError, isJSONPointerError } from '@winglet/json';

class JSONPointerError extends Error {
  code: 'INVALID_INPUT' | 'INVALID_POINTER' | 'PROPERTY_NOT_FOUND';
  details: Record<string, unknown>;
}
```

| Code | Trigger |
|------|---------|
| `INVALID_INPUT` | Input is not a plain object or array |
| `INVALID_POINTER` | Pointer syntax is malformed |
| `PROPERTY_NOT_FOUND` | Path does not exist in the document |

```typescript
import { getValue, JSONPointerError } from '@winglet/json';

try {
  getValue({}, '/missing');
} catch (e) {
  if (e instanceof JSONPointerError) {
    console.log(e.code);    // 'PROPERTY_NOT_FOUND'
    console.log(e.details); // { pointer: '/missing', ... }
  }
}
```

---

## Performance

| Scenario | Recommendation |
|----------|---------------|
| Large deeply-nested documents | `immutable: false` to avoid deep clone overhead |
| Sequential patch application | `strict: false` (default) — skips extra validation per operation |
| Trusted patch sources | `protectPrototype: false` to remove prototype checks |
| Memory-sensitive environments | `immutable: false` in `mergePatch` to avoid cloning |

```typescript
// Maximum performance (trusted environment only)
applyPatch(source, patches, {
  immutable: false,
  strict: false,
  protectPrototype: false,
});
```

---

## Related Standards

- [RFC 6901 — JSON Pointer](https://datatracker.ietf.org/doc/html/rfc6901)
- [RFC 6902 — JSON Patch](https://datatracker.ietf.org/doc/html/rfc6902)
- [RFC 7396 — JSON Merge Patch](https://datatracker.ietf.org/doc/html/rfc7396)
- [JSONPath — XPath for JSON](https://goessner.net/articles/JsonPath/)
