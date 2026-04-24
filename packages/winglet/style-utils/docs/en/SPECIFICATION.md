# @winglet/style-utils Specification

> Comprehensive CSS and style management utilities: className composition, runtime CSS compression, and scoped style management with Shadow DOM support.

## Overview

`@winglet/style-utils` is a zero-runtime-dependency, framework-agnostic utility package. It bundles three concerns behind a tree-shakeable API:

1. **`className` composition** — `cx` (full-featured) and `cxLite` (lightweight) for conditional class-name strings.
2. **CSS compression** — `compressCss` for single-pass runtime minification.
3. **Scoped style management** — `styleManagerFactory` and `destroyScope` for injecting, updating, and removing CSS against a `Document` or a `ShadowRoot`, with automatic selector scoping and `requestAnimationFrame`-batched DOM writes.

The package publishes both ESM and CJS builds, declares `"sideEffects": false`, and supports sub-path imports for narrower consumption.

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Core API](#core-api)
5. [Type Definitions](#type-definitions)
6. [Usage Patterns](#usage-patterns)
7. [Advanced Examples](#advanced-examples)
8. [Compatibility](#compatibility)
9. [License](#license)

---

## Installation

```bash
# npm
npm install @winglet/style-utils

# yarn
yarn add @winglet/style-utils

# pnpm
pnpm add @winglet/style-utils
```

### Sub-path Imports

| Entry | Exports |
|-------|---------|
| `@winglet/style-utils` | all symbols |
| `@winglet/style-utils/style-manager` | `styleManagerFactory`, `destroyScope` |
| `@winglet/style-utils/util` | `cx`, `cxLite`, `compressCss` |

---

## Quick Start

```typescript
import {
  cx,
  cxLite,
  compressCss,
  styleManagerFactory,
  destroyScope,
} from '@winglet/style-utils';

// 1. className composition
const className = cx(
  'btn',
  `btn-${variant}`,
  { 'btn-disabled': disabled, 'btn-loading': loading },
);

// 2. Runtime CSS compression
const minified = compressCss('.card { padding: 16px; /* note */ }');
// -> '.card{padding:16px}'

// 3. Scoped style management
const addStyle = styleManagerFactory('my-component');
const cleanup = addStyle('button', '.btn { color: white; background: blue; }');

// ...later
cleanup();            // remove the single style
destroyScope('my-component'); // tear down the whole scope
```

---

## Architecture

```
@winglet/style-utils/
├── src/
│   ├── index.ts                        # Full barrel
│   ├── utils/
│   │   ├── index.ts                    # /util barrel
│   │   ├── cx/
│   │   │   ├── cx.ts                   # cx() + getSegment() helper
│   │   │   ├── cxLite.ts               # cxLite()
│   │   │   ├── type.ts                 # ClassValue, ClassArray, ClassObject
│   │   │   └── index.ts                # barrel
│   │   └── compressCss/
│   │       ├── compressCss.ts          # Byte-level minifier
│   │       └── index.ts                # barrel
│   └── styleManager/
│       ├── index.ts                    # /style-manager barrel
│       ├── styleManagerFactory.ts      # Curried factory
│       ├── destroyScope.ts             # Teardown helper
│       └── StyleManager/
│           ├── StyleManager.ts         # Singleton class
│           ├── type.ts                 # StyleManagerConfig, StyleRoot
│           └── index.ts                # barrel
```

### Design Notes

- **Singleton per scope**: `StyleManager.get(scopeId, config)` returns a shared instance per scope (per shadow root, if provided). Multiple factories for the same `scopeId` feed the same stylesheet.
- **Batched writes**: `add` and `remove` set a dirty flag; a single `requestAnimationFrame` flush concatenates all active rules and writes them via `CSSStyleSheet.replaceSync` (or `<style>.textContent` fallback).
- **Selector scoping**: `.scopeId ` is prepended to every selector except `@`-rules and the bare selectors `:root` / `:host`. Shadow roots skip prefixing altogether.
- **Dual DOM path**: modern browsers use `adoptedStyleSheets`; older environments get a `<style>` element in `document.head` (or inside the shadow root for shadow mode).

---

## Core API

### ClassNames

#### `cx(...args: ClassValue[]): string`

Concatenates class names conditionally. Handles strings, numbers, booleans, objects (truthy keys only), and nested arrays.

| Parameter | Type | Description |
|-----------|------|-------------|
| `args` | `ClassValue[]` | Variable number of class value inputs |

**Returns:** Space-separated class string with no leading/trailing whitespace.

```typescript
cx('btn', { primary: true, disabled: false }, ['large', condition && 'active']);
// 'btn primary large' (when condition is falsy)
```

#### `cxLite(...args: ClassValue[]): string`

Lightweight variant: top-level truthy filtering only. Does not recurse into objects or arrays.

| Parameter | Type | Description |
|-----------|------|-------------|
| `args` | `ClassValue[]` | Primarily strings and numbers |

**Returns:** Space-separated class string.

```typescript
cxLite('btn', isActive && 'active', size && `btn-${size}`);
// 'btn active btn-lg'
```

### CSS Compression

#### `compressCss(css: string): string`

Single-pass CSS minifier. Removes whitespace, block comments, and redundant semicolons before `}`. Favors throughput over perfect compression; minor trailing-space artifacts inside nested blocks may remain.

| Parameter | Type | Description |
|-----------|------|-------------|
| `css` | `string` | Source CSS |

**Returns:** Minified CSS. Empty input returns empty string.

```typescript
compressCss('.x { color: red; /* keep? no */ background: blue; }');
// '.x{color:red;background:blue}'
```

### Style Management

#### `styleManagerFactory(scopeId, config?)`

```typescript
function styleManagerFactory(
  scopeId: string,
  config?: StyleManagerConfig,
): (styleId: string, cssString: string, compress?: boolean) => () => void;
```

Returns a curried `addStyle` function bound to one scope.

| Parameter | Type | Description |
|-----------|------|-------------|
| `scopeId` | `string` | Scope identifier; doubles as CSS class prefix |
| `config.shadowRoot` | `ShadowRoot?` | Optional Shadow DOM target |

**Returned `addStyle`:**

| Arg | Type | Description |
|-----|------|-------------|
| `styleId` | `string` | Unique key inside the scope |
| `cssString` | `string` | CSS source |
| `compress` | `boolean?` | Set `true` when `cssString` is already minified |

**Returns:** `() => void` — cleanup function that removes `styleId` from the scope.

```typescript
const addStyle = styleManagerFactory('header');
const cleanup = addStyle('title', '.title { font-size: 20px; }');
cleanup();
```

#### `destroyScope(scopeId): void`

```typescript
function destroyScope(scopeId: string): void;
```

Tears down the document-root `StyleManager` registered under `scopeId`:

1. Cancels any pending animation frame.
2. Removes the scope's `CSSStyleSheet` from `document.adoptedStyleSheets` (modern path).
3. Removes the fallback `<style>` element (legacy path).
4. Clears cached styles.
5. Removes the registry entry.

Shadow-root-keyed managers live per-`ShadowRoot` and are not directly targeted by `destroyScope`; rely on per-style cleanup or shadow-root garbage collection.

```typescript
destroyScope('header'); // full teardown
```

---

## Type Definitions

### `ClassValue`

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

### `StyleManagerConfig`

```typescript
export interface StyleManagerConfig {
  /** Shadow root to attach styles to. If omitted, uses document. */
  shadowRoot?: ShadowRoot;
}
```

### `StyleRoot`

```typescript
export type StyleRoot = Document | ShadowRoot;
```

---

## Usage Patterns

### Conditional ClassNames in React

```tsx
import { cx } from '@winglet/style-utils';

export function Button({ variant = 'primary', size, disabled, loading, children }) {
  return (
    <button
      className={cx('btn', `btn-${variant}`, size && `btn-${size}`, {
        'btn-disabled': disabled,
        'btn-loading': loading,
      })}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

### Component-scoped Styles

```typescript
import { styleManagerFactory, destroyScope } from '@winglet/style-utils';

const scopeId = 'my-widget';
const addStyle = styleManagerFactory(scopeId);

const removeButton = addStyle('button', `
  .btn { background: #1677ff; color: #fff; padding: 8px 16px; }
  .btn:hover { background: #0f5fcb; }
`);

// Apply scope class somewhere in the tree
document.getElementById('widget-root')!.classList.add(scopeId);

// Cleanup
removeButton();
destroyScope(scopeId);
```

### Shadow DOM Integration

```typescript
class MyCard extends HTMLElement {
  private shadow = this.attachShadow({ mode: 'open' });
  private cleanups: Array<() => void> = [];

  constructor() {
    super();
    const addStyle = styleManagerFactory('my-card', { shadowRoot: this.shadow });
    this.cleanups.push(addStyle('host', ':host { display: block; border-radius: 8px; }'));
    this.cleanups.push(addStyle('content', '.content { padding: 16px; }'));
  }

  connectedCallback() {
    this.shadow.innerHTML = '<div class="content"><slot></slot></div>';
  }

  disconnectedCallback() {
    this.cleanups.forEach((fn) => fn());
  }
}
customElements.define('my-card', MyCard);
```

---

## Advanced Examples

### Theme Manager

```typescript
import { destroyScope, styleManagerFactory } from '@winglet/style-utils';

class ThemeManager {
  private readonly addStyle = styleManagerFactory('theme');
  private removeTheme: (() => void) | null = null;

  applyTheme(mode: 'light' | 'dark') {
    const vars = mode === 'light'
      ? '--bg:#fff; --fg:#111; --primary:#1677ff;'
      : '--bg:#0f0f10; --fg:#f5f5f5; --primary:#4096ff;';
    this.removeTheme?.();
    this.removeTheme = this.addStyle('vars', `:root { ${vars} } body { background: var(--bg); color: var(--fg); }`);
  }

  destroy() {
    this.removeTheme?.();
    destroyScope('theme');
  }
}
```

### Pre-compressed Hot Path

```typescript
import { compressCss, styleManagerFactory } from '@winglet/style-utils';

const CARD_CSS = compressCss(`
  .card { display: flex; flex-direction: column; gap: 1rem; padding: 16px; }
  .card .title { font-size: 1.125rem; font-weight: 600; }
`);

const addStyle = styleManagerFactory('card');
addStyle('base', CARD_CSS, /* compressed */ true);
```

### Batched Updates

```typescript
const addStyle = styleManagerFactory('dashboard');

// Every call in the same tick is coalesced into a single DOM write on the next frame.
const cleanups = [
  addStyle('layout', layoutCss),
  addStyle('typography', typographyCss),
  addStyle('colors', colorsCss),
  addStyle('responsive', responsiveCss),
];
```

---

## Compatibility

- **Language**: ECMAScript 2020
- **Runtime**: Node.js 14+ (for SSR/tooling), modern browsers with ES2020 support
- **Browser DOM APIs used**: `requestAnimationFrame`, `cancelAnimationFrame`, `CSSStyleSheet.replaceSync` (optional, with fallback), `document.adoptedStyleSheets` (optional), `TextEncoder` / `TextDecoder` (for `compressCss`)

Legacy environments: transpile with Babel and provide polyfills for `requestAnimationFrame` and (if needed) `TextEncoder`.

---

## License

MIT License. See the package `LICENSE` file for full text.
