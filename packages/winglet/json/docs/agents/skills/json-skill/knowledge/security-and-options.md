# Security and Options — @winglet/json

## Options Pattern

All major functions accept an options object. Options are optional with sensible secure defaults.

### getValue / setValue Options

```typescript
// getValue: no options — always validates input type
getValue(value, pointer)

// setValue options
setValue(value, pointer, input, {
  overwrite?: boolean,    // default: true
  preserveNull?: boolean, // default: true
})
```

### compare Options

```typescript
interface CompareOptions {
  strict?: boolean;    // default: false
  immutable?: boolean; // default: true
}
```

### applyPatch Options

```typescript
interface ApplyPatchOptions {
  strict?: boolean;           // default: false
  immutable?: boolean;        // default: true
  protectPrototype?: boolean; // default: true
}
```

### mergePatch Parameter

```typescript
// Third parameter, not an options object
mergePatch(source, patch, immutable?: boolean) // default: true
```

---

## Security: Prototype Pollution Protection

### What is Prototype Pollution?

Prototype pollution is an attack where a malicious JSON Patch payload sets properties on `Object.prototype`, affecting all objects in the runtime.

Example attack payload:
```json
[
  { "op": "add", "path": "/__proto__/admin", "value": true },
  { "op": "add", "path": "/constructor/prototype/admin", "value": true }
]
```

If applied naively, every object in the application would have `admin === true`.

### Protection in applyPatch

`protectPrototype: true` (default) rejects any patch with a path targeting:
- `__proto__`
- `constructor`
- `prototype`

```typescript
import { applyPatch } from '@winglet/json/pointer-patch';

// This throws — prototype pollution attempt detected
applyPatch({}, [
  { op: 'add', path: '/__proto__/isAdmin', value: true }
], { protectPrototype: true });

// Only disable when you fully control the patch source
applyPatch(trustedSource, trustedPatches, {
  protectPrototype: false, // only for trusted environments
});
```

### Protection in getValue / setValue

Both functions validate that the input is a plain object or array. They reject class instances, functions, and other non-plain objects via `isPlainObject` / `isArray` checks. This prevents operating on prototype chains by accident.

---

## Immutable Mode

`immutable: true` (the default) ensures the original source object is never modified.

### How It Works

- `applyPatch` deep-clones `source` via `cloneLite` before applying operations.
- `compare` does not modify inputs regardless of the `immutable` option (comparison is read-only).
- `mergePatch` clones source when `immutable === true`.
- `setValue` does NOT have an immutable option — it always mutates in place.

### Performance Trade-off

```typescript
// Immutable (default): safe, allocates new objects
const result = applyPatch(source, patches);
// source unchanged

// Mutable: faster, no allocation — source is modified
const result = applyPatch(source, patches, { immutable: false });
// source === result (same reference)
```

Use `immutable: false` only when:
- You own the object and don't need the original.
- You are in a performance-critical hot path.
- The patch source is trusted.

---

## Strict Mode

`strict: true` enforces additional RFC 6902 compliance checks.

| Scenario | strict: false (default) | strict: true |
|----------|------------------------|-------------|
| `replace` on non-existent path | silently skips or adds | throws error |
| `remove` on non-existent path | silently skips | throws error |
| `test` failure | throws | throws |
| Array index out of bounds | lenient | throws |

```typescript
import { applyPatch } from '@winglet/json/pointer-patch';

// strict: false — lenient, tolerates missing targets
applyPatch({ a: 1 }, [
  { op: 'replace', path: '/nonexistent', value: 42 }
], { strict: false });
// does not throw

// strict: true — RFC-compliant, throws on violations
applyPatch({ a: 1 }, [
  { op: 'replace', path: '/nonexistent', value: 42 }
], { strict: true });
// throws JsonPatchError
```

---

## Error Handling

### JSONPointerError

Thrown by `getValue` and `setValue` for pointer-level errors.

```typescript
import { JSONPointerError, getValue } from '@winglet/json';

class JSONPointerError extends Error {
  code: 'INVALID_INPUT' | 'INVALID_POINTER' | 'PROPERTY_NOT_FOUND';
  details: Record<string, unknown>;
}
```

| Code | Trigger |
|------|---------|
| `INVALID_INPUT` | `value` is not a plain object or array |
| `INVALID_POINTER` | Pointer string is malformed |
| `PROPERTY_NOT_FOUND` | Path segment does not exist in the document |

```typescript
try {
  getValue(null, '/foo');          // INVALID_INPUT
  getValue({}, 'no-slash');        // INVALID_POINTER (must start with '/' or be '')
  getValue({ a: 1 }, '/b/c');     // PROPERTY_NOT_FOUND
} catch (e) {
  if (e instanceof JSONPointerError) {
    console.log(e.code);    // one of the codes above
    console.log(e.details); // { input: ... } or { pointer: ... }
  }
}
```

### isJSONPointerError Guard

```typescript
import { isJSONPointerError } from '@winglet/json';

function safeGet(obj: object, ptr: string) {
  try {
    return getValue(obj, ptr);
  } catch (e) {
    if (isJSONPointerError(e) && e.code === 'PROPERTY_NOT_FOUND') {
      return undefined; // treat as optional
    }
    throw e;
  }
}
```

---

## Input Validation

Both `getValue` and `setValue` perform runtime type checks before processing:

```typescript
// These all throw INVALID_INPUT:
getValue('string value', '/path');
getValue(42, '/path');
getValue(null, '/path');
getValue(new Map(), '/path');  // not a plain object

// These are valid:
getValue({}, '/path');
getValue([], '/0');
getValue({ nested: { arr: [1] } }, '/nested/arr/0');
```

---

## Recommended Defaults by Use Case

| Use Case | Recommended Options |
|----------|-------------------|
| Reading config (safe) | `getValue` — no options needed |
| Applying untrusted patch | `{ immutable: true, protectPrototype: true, strict: true }` |
| Applying trusted patch (perf) | `{ immutable: false, protectPrototype: false, strict: false }` |
| State management diffing | `compare({ strict: false, immutable: true })` |
| API response merging | `mergePatch(source, patch)` — defaults are fine |
| Form field update | `setValue(state, pointer, value)` — mutations are expected |
