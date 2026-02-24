# JSON Patch API — @winglet/json

## RFC 6902 Overview

JSON Patch defines a format for describing changes to a JSON document as a sequence of operations. Each operation is an object with at least `op` and `path` fields.

Supported operations:

| `op` | Description | Required Fields |
|------|-------------|----------------|
| `add` | Add a value | `path`, `value` |
| `remove` | Remove a value | `path` |
| `replace` | Replace a value | `path`, `value` |
| `move` | Move a value | `path`, `from` |
| `copy` | Copy a value | `path`, `from` |
| `test` | Assert value equality | `path`, `value` |

---

## Patch Type Definitions

```typescript
type Operation = 'add' | 'replace' | 'remove' | 'move' | 'copy' | 'test';

interface AddPatch<Value>     { op: 'add';     path: string; value: Value }
interface ReplacePatch<Value> { op: 'replace'; path: string; value: Value }
interface RemovePatch         { op: 'remove';  path: string }
interface MovePatch           { op: 'move';    path: string; from: string }
interface CopyPatch           { op: 'copy';    path: string; from: string }
interface TestPatch<Value>    { op: 'test';    path: string; value: Value }

type Patch = AddPatch<any> | ReplacePatch<any> | RemovePatch
           | MovePatch | CopyPatch | TestPatch<any>;
```

---

## compare

```typescript
function compare<Source extends JsonRoot, Target extends JsonRoot>(
  source: Source,
  target: Target,
  options?: CompareOptions,
): Patch[]

type CompareOptions = {
  strict?: boolean;    // default: false
  immutable?: boolean; // default: true
};
```

Generates a minimal array of JSON Patch operations that transforms `source` into `target`.

- Produces `add`, `remove`, and `replace` operations.
- Deep comparison — recurses into nested objects and arrays.
- Objects implementing `toJson()` are serialized before comparison.
- `immutable: true` (default) does not modify the input objects.

### Examples

```typescript
import { compare } from '@winglet/json/pointer-patch';

// Object diff
const source = { name: 'John', age: 30, city: 'NYC' };
const target = { name: 'John', age: 31, country: 'USA' };

compare(source, target);
// [
//   { op: 'replace', path: '/age', value: 31 },
//   { op: 'remove',  path: '/city' },
//   { op: 'add',     path: '/country', value: 'USA' }
// ]

// Nested diff
const s2 = { user: { name: 'Alice', prefs: { theme: 'dark' } } };
const t2 = { user: { name: 'Alice', prefs: { theme: 'light', lang: 'en' } } };

compare(s2, t2);
// [
//   { op: 'replace', path: '/user/prefs/theme', value: 'light' },
//   { op: 'add',     path: '/user/prefs/lang', value: 'en' }
// ]

// Array diff (index-based)
compare([1, 2, 3], [1, 5, 3]);
// [{ op: 'replace', path: '/1', value: 5 }]

// Identical — returns empty array
compare({ a: 1 }, { a: 1 });
// []
```

---

## applyPatch

```typescript
function applyPatch<Result extends JsonRoot = any>(
  source: JsonRoot,
  patches: Patch[],
  options?: ApplyPatchOptions,
): Result

type ApplyPatchOptions = {
  strict?: boolean;           // default: false
  immutable?: boolean;        // default: true
  protectPrototype?: boolean; // default: true
};
```

Applies an array of JSON Patch operations sequentially to `source`.

- `immutable: true` (default) deep-clones `source` before applying — original is unchanged.
- `immutable: false` mutates `source` directly for better performance.
- `protectPrototype: true` (default) rejects patches that would modify `__proto__`, `constructor`, or `prototype`.
- `strict: true` throws on operations that violate RFC 6902 (e.g., `replace` on non-existent path).
- Operations are applied in order; an error mid-sequence leaves the result in a partially applied state when `immutable: false`.

### Examples

```typescript
import { applyPatch } from '@winglet/json/pointer-patch';

const source = { name: 'John', age: 30, hobbies: ['reading'] };

const result = applyPatch(source, [
  { op: 'replace', path: '/age', value: 31 },
  { op: 'add',     path: '/city', value: 'NYC' },
  { op: 'add',     path: '/hobbies/-', value: 'coding' },
  { op: 'remove',  path: '/city' },
]);
// { name: 'John', age: 31, hobbies: ['reading', 'coding'] }

// source is unchanged because immutable: true (default)

// Move operation
applyPatch({ a: { b: 1 }, c: 2 }, [
  { op: 'move', from: '/a/b', path: '/d' },
]);
// { a: {}, c: 2, d: 1 }

// Copy operation
applyPatch({ src: 'value' }, [
  { op: 'copy', from: '/src', path: '/dst' },
]);
// { src: 'value', dst: 'value' }

// Test operation (asserts value, throws if mismatch)
applyPatch({ status: 'active' }, [
  { op: 'test',    path: '/status', value: 'active' },
  { op: 'replace', path: '/status', value: 'inactive' },
]);
// { status: 'inactive' } — test passed, replace applied
```

### Performance Mode

```typescript
// Mutable + no prototype check: fastest, use only with trusted input
const result = applyPatch(source, patches, {
  immutable: false,
  protectPrototype: false,
  strict: false,
});
```

---

## difference

```typescript
function difference(
  source: JsonValue,
  target: JsonValue,
): JsonValue | undefined
```

Generates a JSON Merge Patch (RFC 7396) representing the differences between `source` and `target`.

- Returns `undefined` when source and target are identical (no changes).
- Returns the target value directly for primitive types or array changes.
- For object-to-object, returns a merge patch object where `null` means "remove this key".
- Arrays are always replaced wholesale — not merged.

```typescript
import { difference } from '@winglet/json/pointer-patch';

difference({ a: 1, b: 2 }, { a: 1, b: 3, c: 4 });
// { b: 3, c: 4 }

difference({ a: 1, b: 2 }, { a: 1 });
// { b: null }  ← null means "remove b"

difference({ x: 1 }, { x: 1 });
// undefined  ← no changes

difference([1, 2], [1, 3]);
// [1, 3]  ← arrays replaced, not merged

// Nested
difference(
  { user: { name: 'Alice', role: 'admin', tmp: 'data' } },
  { user: { name: 'Bob', role: 'admin' } }
);
// { user: { name: 'Bob', tmp: null } }
```

---

## mergePatch

```typescript
function mergePatch<Type extends JsonValue>(
  source: JsonValue,
  mergePatchBody: JsonValue | undefined,
  immutable?: boolean, // default: true
): Type
```

Applies a JSON Merge Patch document to `source` (RFC 7396).

- `null` values in the patch remove the corresponding property.
- Non-null values add or replace the corresponding property.
- If `mergePatchBody` is not a plain object (including arrays), the source is completely replaced.
- `immutable: true` (default) clones source before modification.

```typescript
import { mergePatch } from '@winglet/json/pointer-patch';

// Add and update properties
mergePatch({ name: 'John', age: 30 }, { age: 31, city: 'NYC' });
// { name: 'John', age: 31, city: 'NYC' }

// Remove with null
mergePatch({ name: 'John', tmp: 'data' }, { tmp: null });
// { name: 'John' }

// Nested merge
mergePatch(
  { user: { name: 'Alice', role: 'admin' } },
  { user: { role: null, email: 'alice@example.com' } }
);
// { user: { name: 'Alice', email: 'alice@example.com' } }

// Non-object patch = complete replacement
mergePatch({ complex: 'object' }, 'simple string');
// 'simple string'

// Undefined patch = no change
mergePatch({ a: 1 }, undefined);
// { a: 1 }

// Mutable mode
const source = { a: 1 };
const result = mergePatch(source, { b: 2 }, false);
source === result; // true — same reference
```

---

## compare + applyPatch Roundtrip

```typescript
import { compare, applyPatch } from '@winglet/json/pointer-patch';

const original = { name: 'Alice', settings: { theme: 'dark' } };
const updated  = { name: 'Alice', settings: { theme: 'light', lang: 'en' } };

const patches = compare(original, updated);
const result  = applyPatch(original, patches);
// result deep-equals updated
```

## difference + mergePatch Roundtrip

```typescript
import { difference, mergePatch } from '@winglet/json/pointer-patch';

const source = { a: 1, b: 2 };
const target = { a: 1, b: 3, c: 4 };

const patch  = difference(source, target);   // { b: 3, c: 4 }
const result = mergePatch(source, patch);    // { a: 1, b: 3, c: 4 }
```
