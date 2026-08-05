# ClassNames Knowledge

Expert knowledge for `cx` and `cxLite` in `@winglet/style-utils`.

## Overview

`@winglet/style-utils` provides two `className` concatenation helpers:

- `cx(...args)` — full-featured, recursive, handles strings, numbers, arrays, and objects.
- `cxLite(...args)` — lightweight, truthy-only filtering, does **not** process objects or arrays.

Both functions return a space-separated string and drop any falsy (`false`, `null`, `undefined`, `''`, `0`) value. They are drop-in replacements for `classnames`/`clsx` in the majority of use cases, with `cx` favoring recursive flexibility and `cxLite` favoring raw throughput.

## Basic Concepts

### `ClassValue` Type

```typescript
export type ClassObject = { [key: string]: ClassValue };
export type ClassArray = Array<ClassValue>;
export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ClassArray
  | ClassObject;
```

A `ClassValue` is anything that can appear as a class argument. Nesting is allowed — `cx` walks through it recursively.

### Truthiness Rules

- `false`, `null`, `undefined`, `0`, and empty string are dropped.
- For objects, only keys whose value is truthy are included (keys themselves are always strings).
- For `cxLite`, **only** the top-level value's truthiness is evaluated — objects are coerced to `[object Object]` and arrays to their `toString()`, which is almost never what you want. Do not pass objects or arrays to `cxLite`.

---

## API Reference

### `cx`

```typescript
export const cx: (...args: ClassValue[]) => string;
```

Concatenates class names conditionally. Handles recursion through arrays and iterates object keys to pick up truthy entries.

**Parameters:**
- `args` — variable number of `ClassValue` entries

**Returns:** Space-separated class name string (no leading/trailing space).

**Example:**

```typescript
import { cx } from '@winglet/style-utils';

cx('btn', 'primary');                              // 'btn primary'
cx('btn', false && 'hidden', 'active');            // 'btn active'
cx('btn', { 'btn-primary': true, disabled: false }); // 'btn btn-primary'
cx(['btn', 'primary'], ['large', false && 'x']);   // 'btn primary large'
cx('btn', { primary: true }, ['large'], 'active'); // 'btn primary large active'
```

### `cxLite`

```typescript
export const cxLite: (...args: ClassValue[]) => string;
```

Lightweight variant. Filters purely by top-level truthiness and does not recurse.

**Parameters:**
- `args` — primarily strings and numbers

**Returns:** Space-separated class name string.

**Example:**

```typescript
import { cxLite } from '@winglet/style-utils';

cxLite('btn', 'primary', 'large');         // 'btn primary large'
cxLite('btn', false && 'hidden', 'active'); // 'btn active'
cxLite('item', 123, 'selected');           // 'item 123 selected'

// Do NOT do this — objects stringify via toString()
cxLite('btn', { primary: true });          // 'btn [object Object]'  ❌
```

If the input space might ever contain objects or arrays, use `cx`.

---

## Common Patterns

### Pattern 1: Conditional Variants

```typescript
const classes = cx(
  'btn',
  `btn-${variant}`,
  size && `btn-${size}`,
  { 'btn-disabled': disabled, 'btn-loading': loading },
);
```

### Pattern 2: Hot-path Lists

When composing class names inside a render loop that runs thousands of times per second and the inputs are known to be flat strings, prefer `cxLite`:

```typescript
const rowClass = cxLite('row', isSelected && 'row-selected', index % 2 && 'row-odd');
```

### Pattern 3: Array Composition

```typescript
const base = ['btn', 'btn-reset'];
const className = cx(base, variant && `btn-${variant}`, extraClasses);
```

### Pattern 4: Migrating From `classnames` / `clsx`

`cx` has the same inputs/outputs as `classnames` and `clsx` for the common cases:

```typescript
// classnames / clsx
classnames('btn', { active: isActive });
// cx
cx('btn', { active: isActive });
```

There is no behavioral delta for string/number/array/object inputs. If you relied on deduplication or custom extensions, `cx` does not perform deduplication.

---

## Best Practices

1. **Use `cx` by default**: the recursive behavior matches `clsx` semantics and is what most UI code expects.
2. **Reach for `cxLite` only on measured hot paths**: the performance delta is noticeable only when called many times per frame with simple inputs.
3. **Never pass objects to `cxLite`**: it will emit `[object Object]` as a class token. If TypeScript warns, trust the warning.
4. **Let the compiler check `ClassValue`**: if you are building a wrapper helper, accept `ClassValue[]` and forward to `cx` to preserve type safety.

---

## Troubleshooting

### Issue 1: Unexpected `[object Object]` in output

**Symptom:** Rendered class list contains `[object Object]` or comma-joined strings.

**Cause:** An object or array was passed to `cxLite`.

**Solution:** Switch to `cx`, or flatten the inputs yourself before calling `cxLite`.

### Issue 2: Duplicated class names

**Symptom:** Output contains the same class twice, e.g. `'btn btn'`.

**Cause:** Neither `cx` nor `cxLite` deduplicates.

**Solution:** Deduplicate at the source, or wrap the output:

```typescript
const dedupe = (s: string) => Array.from(new Set(s.split(' '))).join(' ');
const className = dedupe(cx('btn', maybeBtn, 'btn'));
```

Do not rely on deduplication for semantic correctness; keep inputs clean instead.

### Issue 3: Number values appearing in className

**Symptom:** `cx('item', 123)` outputs `'item 123'`.

**Cause:** `ClassValue` explicitly allows `number`; it is converted to its string form.

**Solution:** This is intentional and mirrors `clsx`. Coerce to string before calling if you want to filter numbers out.

---

## Related Topics

- See `knowledge/getting-started.md` for installation and sub-path imports
- See main SPECIFICATION for the full `ClassValue` union
