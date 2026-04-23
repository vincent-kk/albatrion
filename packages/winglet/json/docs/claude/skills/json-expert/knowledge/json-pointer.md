# JSON Pointer API — @winglet/json

## RFC 6901 Basics

A JSON Pointer is a string of zero or more reference tokens, each prefixed with `/`.

| Pointer | Meaning |
|---------|---------|
| `""` | Entire document (root) |
| `"/"` | Key with empty string `""` |
| `"/foo"` | Property `foo` |
| `"/foo/0"` | Index 0 of array at `foo` |
| `"/a~1b"` | Key `a/b` (slash escaped) |
| `"/a~0b"` | Key `a~b` (tilde escaped) |
| `"/arr/-"` | Append to array (setValue only) |

Escape rules (RFC 6901 §3):
- `~` → `~0`
- `/` → `~1`
- Order matters: escape `~` before `/`

---

## getValue

```typescript
function getValue<Output extends Dictionary | Array<any>>(
  value: Dictionary | Array<any>,
  pointer: string | string[],
): Output
```

Reads a value from a JSON document at the location specified by `pointer`.

- Accepts string pointer (`"/foo/bar"`) or token array (`["foo", "bar"]`).
- Empty pointer `""` or `[]` returns the entire document.
- Throws `JSONPointerError` for invalid input, bad pointer syntax, or missing path.
- Input must be a plain object or array — primitives throw `INVALID_INPUT`.

### Examples

```typescript
import { getValue } from '@winglet/json/pointer-manipulator';

const doc = { users: [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }] };

getValue(doc, '/users/0/name');       // 'Alice'
getValue(doc, '/users/1/age');        // 25
getValue(doc, '');                    // entire doc
getValue(doc, ['users', '0', 'name']); // 'Alice'

// Escaped keys
const special = { 'a/b': { 'c~d': 'found' } };
getValue(special, '/a~1b/c~0d');      // 'found'
```

### Error Cases

```typescript
import { JSONPointerError } from '@winglet/json';

try {
  getValue({}, '/missing/path');
} catch (e) {
  if (e instanceof JSONPointerError) {
    e.code;    // 'PROPERTY_NOT_FOUND'
    e.message; // descriptive message
  }
}
```

---

## setValue

```typescript
function setValue<Output extends Dictionary | Array<any>>(
  value: Dictionary | Array<any>,
  pointer: string | string[],
  input: any,
  options?: { overwrite?: boolean; preserveNull?: boolean },
): Output
```

Sets a value at the location specified by `pointer`. **Mutates in place and returns the same reference.**

### Options

| Option | Default | Effect |
|--------|---------|--------|
| `overwrite` | `true` | When `false`, skips if location already has a value |
| `preserveNull` | `true` | When `false`, replaces `null` intermediate nodes with objects/arrays |

### Path Creation

`setValue` automatically creates intermediate objects and arrays when they do not exist.

```typescript
import { setValue } from '@winglet/json/pointer-manipulator';

const obj = {};
setValue(obj, '/a/b/c', 42);
// obj is now: { a: { b: { c: 42 } } }

// Append to array with "-"
const arr = { items: [1, 2, 3] };
setValue(arr, '/items/-', 4);
// arr.items is now [1, 2, 3, 4]
```

### Overwrite Control

```typescript
const obj = { existing: 'original' };

setValue(obj, '/existing', 'new', { overwrite: true });
// obj.existing === 'new'

setValue(obj, '/existing', 'ignored', { overwrite: false });
// obj.existing unchanged — already has value
```

### Null Preservation

```typescript
const obj = { profile: null };

// Default: null preserved, no traversal
setValue(obj, '/profile/name', 'Alice');
// obj.profile still null

// preserveNull: false — null replaced to allow traversal
setValue(obj, '/profile/name', 'Alice', { preserveNull: false });
// obj.profile === { name: 'Alice' }
```

---

## escapePath / unescapePath

Operate on complete pointer strings, preserving `/` separators. Each segment is individually escaped.

```typescript
import { escapePath, unescapePath } from '@winglet/json/pointer-escape';

escapePath('/users/jane~doe/settings');
// '/users/jane~0doe/settings'

unescapePath('/users/jane~0doe/settings');
// '/users/jane~doe/settings'

// Building a pointer from dynamic keys:
const key = 'config/database';
const pointer = `/${escapePath(key)}`;
// '/config~1database'  — but escapePath also escapes separators in segments
// Correct approach for a single key segment: use escapeSegment
```

Note: `escapePath` is for paths that already contain `/` as structural separators. To escape a single key that may contain `/` or `~`, import `escapeSegment` from the same sub-path:

```typescript
import { escapeSegment } from '@winglet/json/pointer-escape';

const key = 'api/v1';
const pointer = `/${escapeSegment(key)}/status`;
// '/api~1v1/status'
```

### Escape Rules Summary

| Character | Escaped As |
|-----------|-----------|
| `~` | `~0` |
| `/` | `~1` |

Invalid sequences (`~2`, `~a`) are left unchanged by `unescapePath`.

---

## convertJsonPointerToPath

Converts a JSON Pointer string to an array of unescaped reference tokens.

```typescript
import { convertJsonPointerToPath } from '@winglet/json/pointer-common';

convertJsonPointerToPath('/foo/bar/baz');
// ['foo', 'bar', 'baz']

convertJsonPointerToPath('/a~1b/c~0d');
// ['a/b', 'c~d']

convertJsonPointerToPath('');
// []
```

---

## JSONPointer Constants

```typescript
import { JSONPointer } from '@winglet/json/pointer-common';

JSONPointer.Root;      // '' — root document
JSONPointer.Fragment;  // '#' — URI fragment prefix
JSONPointer.Separator; // '/' — segment separator
```
