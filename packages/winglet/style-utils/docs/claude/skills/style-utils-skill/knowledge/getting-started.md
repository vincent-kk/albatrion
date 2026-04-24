# Getting Started Knowledge

Expert knowledge for installing and bootstrapping `@winglet/style-utils`.

## Overview

`@winglet/style-utils` is a zero-runtime-dependency, framework-agnostic package that bundles three concerns into one library:

1. `className` composition (`cx`, `cxLite`)
2. Runtime CSS compression (`compressCss`)
3. Scoped CSS injection and teardown (`styleManagerFactory`, `destroyScope`)

Each concern is also reachable via a sub-path export so consumers can tree-shake or tighten the import surface.

## Basic Concepts

### Install

```bash
# npm
npm install @winglet/style-utils

# yarn
yarn add @winglet/style-utils

# pnpm
pnpm add @winglet/style-utils
```

The package ships ESM and CJS builds, declares `"sideEffects": false`, and provides `.d.ts` type declarations. Peer dependencies are not required; the package is intentionally standalone.

### Runtime Requirements

- **Node.js**: 14.0.0 or higher (for SSR / tooling contexts)
- **Browsers**: any browser supporting ES2020 syntax
- **DOM APIs**: `requestAnimationFrame` and either `CSSStyleSheet.replaceSync` + `adoptedStyleSheets` (modern path) or the ability to append `<style>` elements (fallback path)

If you need to run in older environments, transpile via Babel or equivalent and ensure a `requestAnimationFrame` polyfill is available.

### Sub-path Imports

Pick the narrowest entry point your code needs:

```typescript
// Full surface
import {
  cx,
  cxLite,
  compressCss,
  styleManagerFactory,
  destroyScope,
} from '@winglet/style-utils';

// Only scoped style management
import { styleManagerFactory, destroyScope } from '@winglet/style-utils/style-manager';

// Only pure utilities (classNames + compression)
import { cx, cxLite, compressCss } from '@winglet/style-utils/util';
```

The three entries correspond to the `package.json` `exports` map:

| Sub-path | Source root | Symbols |
|----------|-------------|---------|
| `@winglet/style-utils` | `src/index.ts` | all |
| `@winglet/style-utils/style-manager` | `src/styleManager/index.ts` | `styleManagerFactory`, `destroyScope` |
| `@winglet/style-utils/util` | `src/utils/index.ts` | `cx`, `cxLite`, `compressCss` |

---

## API Reference

### Quick Symbol Map

| Symbol | Kind | Sub-path |
|--------|------|----------|
| `cx` | function | `/util` |
| `cxLite` | function | `/util` |
| `compressCss` | function | `/util` |
| `styleManagerFactory` | function | `/style-manager` |
| `destroyScope` | function | `/style-manager` |
| `ClassValue`, `ClassArray`, `ClassObject` | types | `/util` (via `/src/utils/cx/type.ts`) |
| `StyleManagerConfig`, `StyleRoot` | types | `/style-manager` (via `StyleManager/type.ts`) |

See the topic-specific knowledge files for each symbol's full signature and examples.

---

## Common Patterns

### Pattern 1: Minimal classNames-only Usage

When you only need conditional className composition, import from `/util`:

```typescript
import { cx } from '@winglet/style-utils/util';

const className = cx('btn', { 'btn-active': isActive });
```

### Pattern 2: Framework-agnostic Scoped CSS

A typical component-level setup creates one factory per scope and stores cleanup functions:

```typescript
import { styleManagerFactory, destroyScope } from '@winglet/style-utils/style-manager';

const scopeId = 'my-widget';
const addStyle = styleManagerFactory(scopeId);

const cleanupButton = addStyle('button', `
  .btn { background: #1677ff; color: #fff; }
`);

// On unmount
cleanupButton();
destroyScope(scopeId);
```

### Pattern 3: React Hook Wrapper

`@winglet/style-utils` stays framework-agnostic on purpose. A React wrapper might look like:

```typescript
import { useEffect } from 'react';
import { styleManagerFactory, destroyScope } from '@winglet/style-utils/style-manager';

function useScopedStyles(scopeId: string, styles: Record<string, string>) {
  useEffect(() => {
    const addStyle = styleManagerFactory(scopeId);
    const cleanups = Object.entries(styles).map(([id, css]) => addStyle(id, css));
    return () => {
      cleanups.forEach((fn) => fn());
      destroyScope(scopeId);
    };
  }, [scopeId, styles]);
}
```

---

## Best Practices

1. **Pick the narrowest sub-path import**: `/util` alone does not pull in the `StyleManager` class, keeping the bundle smaller for pure-utility consumers.
2. **Do not mix scope IDs across unrelated components**: the `scopeId` doubles as the CSS class prefix. Reusing it across unrelated trees leaks styles.
3. **Compress once, mark compressed**: if you are serving the same CSS repeatedly, run `compressCss` once and pass the third argument as `true` to `addStyle`.
4. **Clean up deterministically**: every `addStyle(...)` returns a cleanup function. Store and call it, or call `destroyScope(scopeId)` when the owning scope is torn down entirely.

---

## Troubleshooting

### Issue 1: `import` fails in CJS environment

**Symptom:** `Error [ERR_REQUIRE_ESM]: require() of ES Module ...`

**Cause:** Consumer is using `require()` but the package is resolved as ESM.

**Solution:** Use a bundler or switch to ESM. The package exports both `.mjs` and `.cjs`, so a properly configured `require` resolution should work:

```javascript
const { cx } = require('@winglet/style-utils');
```

If still failing, ensure the consumer's `package.json` is not forcing `"type": "module"` on a CJS file, or vice versa.

### Issue 2: `ReferenceError: requestAnimationFrame is not defined`

**Symptom:** `styleManagerFactory` throws in Node / jsdom without rAF polyfill.

**Cause:** Node does not provide `requestAnimationFrame`; jsdom does, but older setups may not.

**Solution:** Provide a polyfill in test setup, or only run style-manager code in browser / jsdom contexts.

```typescript
// vitest.setup.ts
if (typeof requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0) as any;
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id as any);
}
```

---

## Related Topics

- See `knowledge/classnames.md` for `cx` / `cxLite` details
- See `knowledge/style-manager.md` for runtime style injection details
- See main SPECIFICATION for the full API surface
