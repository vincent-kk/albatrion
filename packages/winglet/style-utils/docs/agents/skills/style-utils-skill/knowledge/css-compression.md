# CSS Compression Knowledge

Expert knowledge for `compressCss` in `@winglet/style-utils`.

## Overview

`compressCss` is a single-pass byte-level CSS minifier. It strips whitespace, block comments (`/* ... */`), and redundant trailing semicolons before the closing brace. It is optimized for throughput rather than perfect compression, so a small number of cosmetic artifacts (notably trailing spaces inside media query headers) are accepted in exchange for speed.

Use `compressCss` when you need to inject CSS at runtime and want to avoid shipping a minifier, or when you want to normalize CSS written inline in templates.

## Basic Concepts

### Byte-level Processing

The implementation uses `TextEncoder`/`TextDecoder` to operate on a `Uint8Array` of UTF-8 bytes. ASCII bytes for whitespace (`SPACE`, `TAB`, `LF`, `CR`), comment markers (`/`, `*`), and punctuation (`{`, `}`, `;`, `:`, `,`, `>`, `+`, `~`, `(`, `)`) are matched by numeric code. Non-ASCII characters pass through untouched via the UTF-8 decoder.

### What Gets Removed

| Input | Output | Rule |
|-------|--------|------|
| Consecutive whitespace between tokens | removed or collapsed to a single space | collapses runs of `[ \t\n\r]+` |
| Whitespace adjacent to `{`, `}`, `;`, `:`, `,`, `>`, `+`, `~`, `(`, `)` | removed | no space needed around punctuation |
| Whitespace before `(` following an identifier | preserved as space | protects function calls like `var (` from being merged incorrectly |
| `/* ... */` comments | removed | block comments only (CSS has no line comments) |
| `;` followed by `}` (with optional whitespace or comments between) | last `;` dropped | redundant terminal semicolon |
| Multiple consecutive `;;;` | collapsed to a single `;` if not before `}`, dropped entirely if before `}` | avoids empty declarations |
| Trailing whitespace at end of output | removed | final pass before decoding |

### Known Trade-offs

- Media queries may retain a trailing space before the closing brace (e.g. `@media (max-width:768px){.c{padding:0 16px }}`) because post-processing per-block is expensive. Browsers parse this correctly.
- The minifier does **not** rewrite selectors, shorten colors, remove vendor prefixes, or do any semantic optimization. Use a build-time minifier (cssnano, lightningcss) for that.
- Strings and URLs containing `/* */` literally are currently not detected as strings; avoid injecting block-comment bytes inside CSS string literals, or pre-escape them.

---

## API Reference

### `compressCss`

```typescript
export const compressCss: (css: string) => string;
```

Compresses a CSS source string by a single-pass byte walk.

**Parameters:**
- `css` — raw CSS string (any length)

**Returns:** Minified CSS string. Empty input returns empty string.

**Example:**

```typescript
import { compressCss } from '@winglet/style-utils';

compressCss('.class { color: red; background: blue; }');
// '.class{color:red;background:blue}'

compressCss('.class { color: red; /* inline */ background: blue; }');
// '.class{color:red;background:blue}'

compressCss('.class1   .class2   >   .class3 { color: red; }');
// '.class1 .class2>.class3{color:red}'

compressCss('@media (max-width: 768px) { .container { padding: 0 16px; } }');
// '@media (max-width:768px){.container{padding:0 16px }}'  (note trailing space before })
```

---

## Common Patterns

### Pattern 1: Compress Once, Inject Many

`compressCss` is fast, but still O(n). If the same stylesheet is added repeatedly, compress it once and hand the pre-compressed form to `addStyle` with the third argument set to `true`:

```typescript
import { compressCss, styleManagerFactory } from '@winglet/style-utils';

const buttonCss = compressCss(`
  .btn { color: #fff; background: #1677ff; }
`);

const addStyle = styleManagerFactory('panel');
addStyle('button', buttonCss, true); // skip re-compression
```

### Pattern 2: Build-time Normalization

Run `compressCss` inside a build tool to normalize hand-written inline CSS strings, then commit the output. This is useful for snapshot testing style output.

```typescript
// build/normalize-inline-css.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { compressCss } from '@winglet/style-utils';

const src = readFileSync('src/theme.css', 'utf8');
writeFileSync('dist/theme.min.css', compressCss(src));
```

### Pattern 3: Size Reduction Reporting

```typescript
const original = getSourceCss();
const minified = compressCss(original);
console.info(`saved ${original.length - minified.length} bytes (${(1 - minified.length / original.length) * 100 | 0}%)`);
```

---

## Best Practices

1. **Compress at the boundary**: run `compressCss` once at module init or at a build step, not on every render.
2. **Pair with the `compress` flag of `addStyle`**: tells `StyleManager` to skip its internal compression pass.
3. **Do not chain minifiers**: running `compressCss` over already-compressed output is safe but wasteful.
4. **Keep comments meaningful**: the minifier strips all block comments. If you need licensing headers, preserve them outside the CSS string (e.g. in a separate comment at the file level).

---

## Troubleshooting

### Issue 1: Unexpected trailing space in media query

**Symptom:** Output contains `@media (...){.x{padding:0 16px }}` with a space before `}`.

**Cause:** Known performance trade-off — the minifier does not walk backwards to trim trailing space inside nested blocks.

**Solution:** Browsers parse this correctly. If you need cosmetic cleanup, run a post-step `replace(/\s+}/g, '}')` on the output — but measure first, because it negates most of the speed advantage.

### Issue 2: Content inside CSS strings corrupted

**Symptom:** A CSS string like `content: "/* foo */"` gets truncated.

**Cause:** The minifier detects `/*` as a block comment without tracking whether it is inside a CSS string literal.

**Solution:** Avoid literal block-comment markers inside CSS string values. Encode them: `content: "\\2f* foo *\\2f"`. This is rare in practice; flag it if you hit it.

### Issue 3: Selectors with adjacent combinators produce wrong spacing

**Symptom:** Selector like `.a ~ .b` becomes `.a~.b` and you wanted to keep the space.

**Cause:** `~`, `+`, `>` are treated as punctuation and whitespace around them is stripped.

**Solution:** This is valid CSS per the spec. Browsers parse `.a~.b` identically to `.a ~ .b`. If a downstream tool requires spaces, run it on the source rather than the compressed output.

---

## Related Topics

- See `knowledge/style-manager.md` for the `compress` flag of `addStyle`
- See main SPECIFICATION for the full `compressCss` signature
