
# JSONPointer Skill

Expert skill for the JSONPointer extended syntax of @canard/schema-form.

## Skill Info

- **Name**: jsonpointer
- **Purpose**: Guide for JSONPointer path syntax and extended features
- **Triggers**: Questions about JSONPointer, path references, path, find, wildcard, relative paths

## Standard JSONPointer (RFC 6901)

### Basic Syntax

```typescript
'/property'           // Access property at root
'/nested/property'    // Access nested object
'/array/0'            // Access array index
'/array/0/property'   // Access property of array item
```

### Special Character Escaping

In JSONPointer, `~` and `/` are special characters.

| Character | Escape Sequence |
|-----------|-----------------|
| `~` | `~0` |
| `/` | `~1` |

```typescript
// Key contains slash: { 'path/to/key': 'value' }
'/path~1to~1key'  // Access 'path/to/key'

// Key contains tilde: { '~tilde': 'value' }
'/~0tilde'        // Access '~tilde'

// Combined: { 'a/b~c': 'value' }
'/a~1b~0c'        // Access 'a/b~c'
```

## Supported Syntax by Usage Context

| Syntax | computed | node.find() | formTypeInputMap |
|--------|----------|-------------|------------------|
| Absolute path (`/`) | ✓ | ✓ | ✓ |
| Relative path (`..`, `.`) | ✓ | ✓ | ✗ |
| Wildcard (`*`) | ✗ | ✗ | ✓ |
| Context (`@`) | ✓ | ✗ | ✗ |

## Using with node.find()

### Basic Navigation

```typescript
// Absolute path
const nameNode = rootNode.find('/user/name');

// Relative path (from current node)
const siblingNode = currentNode.find('../sibling');
const parentNode = currentNode.find('..');
```

### Using with FormHandle

```typescript
const formRef = useRef<FormHandle>(null);

// Find node
const emailNode = formRef.current?.findNode('/user/email');

// Find multiple nodes with wildcard
const allItems = formRef.current?.findNodes('/items/*');
```

## Escape Handling

### Escaping in formTypeInputMap

```typescript
// Key contains slash: { 'object/Node': { ... } }
const formTypeInputMap = {
  '/object~1Node': SpecialInput,  // Match 'object/Node' key
};
```

### Test Code Reference

```typescript
// Based on src/core/__tests__/AbstractNode.jsonPointerEscape.test.ts
const schema = {
  type: 'object',
  properties: {
    'path/with/slash': { type: 'string' },
    'tilde~here': { type: 'number' },
  },
};

// Access with escaped paths
const node1 = rootNode.find('/path~1with~1slash');
const node2 = rootNode.find('/tilde~0here');
```

## Path Building Utilities

### JSONPointer Generation

```typescript
import { toJsonPointer, escapeJsonPointer } from '@winglet/json';

// Convert array to JSONPointer
const path = toJsonPointer(['users', 0, 'name']);
// '/users/0/name'

// Escape special characters
const escaped = escapeJsonPointer('path/with/slash');
// 'path~1with~1slash'
```

### Path Decomposition

```typescript
import { fromJsonPointer, unescapeJsonPointer } from '@winglet/json';

// Convert JSONPointer to array
const segments = fromJsonPointer('/users/0/name');
// ['users', '0', 'name']

// Unescape
const original = unescapeJsonPointer('path~1with~1slash');
// 'path/with/slash'
```

## References

- Full specification: `docs/ko/SPECIFICATION.md`
- Test code: `src/core/__tests__/AbstractNode.jsonPointerEscape.test.ts`, `src/core/__tests__/AbstractNode.find.test.ts`
- RFC 6901: https://datatracker.ietf.org/doc/html/rfc6901
