# JSONPath API — @winglet/json

## Overview

The JSONPath module provides two things:

1. **Constants** — special character tokens used in JSONPath expressions.
2. **Utilities** — `getJSONPath` (find path to a nested object) and `convertJsonPathToPointer` (convert JSONPath string to JSON Pointer).

JSONPath is a query language for JSON analogous to XPath for XML. The standard used here follows the Goessner specification.

---

## JSONPath Constants

```typescript
import { JSONPath } from '@winglet/json/path';

JSONPath.Root;    // '$'  — root node
JSONPath.Current; // '@'  — currently processing node
JSONPath.Child;   // '.'  — child accessor
JSONPath.Filter;  // '#'  — filter condition operator
```

These constants are used internally and can be used to construct or parse JSONPath expressions consistently.

---

## getJSONPath

```typescript
function getJSONPath<Root extends object, Target>(
  root: Root,
  target: Target,
): string | null
```

Finds the JSONPath string from `root` to `target` using depth-first search (reference equality).

- Returns `"$"` when `target === root`.
- Returns `null` when `target` is not found within `root`.
- Array indices use bracket notation: `[0]`, `[1]`, etc.
- Object keys use dot notation: `.key` — except keys containing `.`, which use bracket notation: `['key.with.dots']`.

### Examples

```typescript
import { getJSONPath } from '@winglet/json/path-common';

const doc = {
  a: {
    b: [1, 2, { c: 'found' }],
  },
};

getJSONPath(doc, doc.a);          // '$.a'
getJSONPath(doc, doc.a.b);        // '$.a.b'
getJSONPath(doc, doc.a.b[2]);     // '$.a.b[2]'
getJSONPath(doc, doc.a.b[2].c);   // null — 'found' is a primitive, not an object reference

getJSONPath(doc, doc);            // '$'
getJSONPath(doc, {});             // null — different reference

// Keys with dots
const tricky = { 'key.with.dots': { value: 'nested' } };
getJSONPath(tricky, tricky['key.with.dots']);
// "$['key.with.dots']"
```

### Use Cases

- Debugging: locate where a sub-object lives in a large document.
- Building dynamic pointers from object references.
- Generating human-readable paths for error messages.

---

## convertJsonPathToPointer

```typescript
function convertJsonPathToPointer(jsonPath: string): string
```

Converts a JSONPath string to an equivalent JSON Pointer string (RFC 6901).

- Strips the leading `$` root token.
- Converts `.property` to `/property`.
- Converts `[index]` to `/index`.
- Converts `['key']` (bracket notation) to `/key`.
- Keys containing `/` or `~` are automatically escaped per RFC 6901.

### Examples

```typescript
import { convertJsonPathToPointer } from '@winglet/json/path-common';

convertJsonPathToPointer('$.foo.bar');
// '/foo/bar'

convertJsonPathToPointer('$.users[0].name');
// '/users/0/name'

convertJsonPathToPointer("$['key.with.dots']");
// '/key.with.dots'

convertJsonPathToPointer('$');
// ''  — root pointer

convertJsonPathToPointer("$['a/b'].c");
// '/a~1b/c'  — slash escaped per RFC 6901
```

### Idempotency

`convertJsonPathToPointer` is designed to be deterministic and idempotent for valid JSONPath inputs. Running the conversion twice on a valid output may not be meaningful — use it only on JSONPath strings, not on already-converted pointers.

---

## Combining getJSONPath and convertJsonPathToPointer

```typescript
import { getJSONPath } from '@winglet/json/path-common';
import { convertJsonPathToPointer } from '@winglet/json/path-common';
import { getValue } from '@winglet/json/pointer-manipulator';

const doc = { users: [{ name: 'Alice' }, { name: 'Bob' }] };
const target = doc.users[1];

const jsonPath = getJSONPath(doc, target);         // '$.users[1]'
const pointer  = convertJsonPathToPointer(jsonPath); // '/users/1'
const value    = getValue(doc, pointer);            // { name: 'Bob' }
```

---

## Sub-path Imports

```typescript
// JSONPath constants
import { JSONPath } from '@winglet/json/path';

// JSONPath utilities
import { getJSONPath, convertJsonPathToPointer } from '@winglet/json/path-common';

// Or from main entry
import { JSONPath, getJSONPath, convertJsonPathToPointer } from '@winglet/json';
```
