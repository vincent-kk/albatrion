---
name: style-utils-skill
description: "@winglet/style-utils library expert. Guide users on zero-runtime className helpers (cx/cxLite), CSS compression (compressCss), and scoped style injection with Shadow DOM support (styleManagerFactory/destroyScope)."
---

# Style Utils Expert

Guide users on the `@winglet/style-utils` library. Apply this skill whenever users ask how to use, choose between, or troubleshoot the className helpers, CSS compression, or scoped style manager in this package.

## Library Overview

`@winglet/style-utils` is a zero-runtime-dependency, framework-agnostic TypeScript library providing:

- **className composition** — `cx` (recursive; handles objects and arrays) and `cxLite` (flat; truthy-only)
- **CSS compression** — `compressCss` single-pass byte-level minifier
- **Scoped style manager** — `styleManagerFactory` + `destroyScope`, with Shadow DOM support, `adoptedStyleSheets` / `<style>` fallback, and `requestAnimationFrame`-batched DOM writes

**Runtime requirements**: Node.js 14+, ES2020 browsers; `requestAnimationFrame` required for `styleManagerFactory`
**Module formats**: ESM (`.mjs`) + CJS (`.cjs`) with full `.d.ts` declarations
**Package flags**: `"sideEffects": false`, no peer dependencies

## Sub-path Exports

```typescript
import { ... } from '@winglet/style-utils';                                          // barrel
import { cx, cxLite, compressCss } from '@winglet/style-utils/util';                  // pure utilities
import { styleManagerFactory, destroyScope } from '@winglet/style-utils/style-manager'; // scoped CSS
```

| Sub-path | Symbols |
|----------|---------|
| `@winglet/style-utils` | everything |
| `@winglet/style-utils/util` | `cx`, `cxLite`, `compressCss`; types `ClassValue` / `ClassArray` / `ClassObject` |
| `@winglet/style-utils/style-manager` | `styleManagerFactory`, `destroyScope`; types `StyleManagerConfig` / `StyleRoot` |

Prefer the narrowest sub-path: `/util` does not pull in the `StyleManager` class, keeping the bundle smaller for pure-utility consumers.

## Knowledge Files

Load these on demand for full API details, examples, and edge cases:

| File | Contents |
|------|----------|
| `knowledge/getting-started.md` | Install, sub-path import map, runtime requirements, first-run patterns |
| `knowledge/classnames.md` | `cx` vs `cxLite`, `ClassValue` type, truthiness rules, migration from `classnames` / `clsx` |
| `knowledge/css-compression.md` | `compressCss` behavior, what is stripped, known media-query trade-off, pre-compression flag |
| `knowledge/style-manager.md` | `styleManagerFactory`, `destroyScope`, scope prefixing, singleton registry, batched DOM updates |
| `knowledge/shadow-dom.md` | `StyleManagerConfig.shadowRoot`, per-root instance keying, `:host` / `::slotted`, Web Component lifecycle |
| `knowledge/advanced-patterns.md` | Theme managers, hot-path rendering, lazy loading, batch updates, atomic rule swap, per-instance scopes |
| `knowledge/troubleshooting.md` | Diagnostic flow, test leaks, rAF in tests, `@`-rule scoping, shadow vs document mode pitfalls |

## Core Competencies

### 1. cx vs cxLite

| Need | Use |
|------|-----|
| Flat strings / numbers / booleans only, high-frequency render path | `cxLite` |
| Objects (`{ active: isActive }`) or nested arrays | `cx` |
| Drop-in replacement for `classnames` / `clsx` | `cx` |
| Deduplication or sorting | Neither — dedupe upstream; both emit insertion order with duplicates |

`cxLite` coerces non-primitives via `toString()`, so objects become literal `[object Object]` tokens. This is never acceptable output — recommend `cx` whenever objects or arrays may appear.

### 2. Scope Prefixing Rules

In document mode, `styleManagerFactory('widget')` rewrites `.btn { … }` to `.widget .btn { … }`. Selectors that pass through **unprefixed**:

- Any `@`-rule — `@media`, `@keyframes`, `@supports`, `@font-face`, etc.
- Bare `:root`
- Bare `:host`

In Shadow DOM mode (`{ shadowRoot }`), **no** prefix is applied — shadow encapsulation isolates selectors on its own. See `knowledge/style-manager.md` and `knowledge/shadow-dom.md`.

### 3. DOM Write Path Selection

On every flush, the manager picks automatically:

- **Modern** — `CSSStyleSheet.replaceSync` + `adoptedStyleSheets` (when both are available on the target root)
- **Fallback** — `<style>` element with `className = scopeId` appended to `document.head` or the shadow root

Writes are **batched via `requestAnimationFrame`**: multiple `addStyle` / cleanup calls inside the same tick coalesce into a single DOM flush. Synchronous reads of `document.styleSheets` between `addStyle` calls see the pre-flush state.

### 4. Cleanup Granularity

| Level | Trigger | Use when |
|-------|---------|----------|
| Per-style | Call the function returned by `addStyle(id, css)` | One rule becomes irrelevant |
| Per-scope | `destroyScope(scopeId)` | Full-view teardown, `afterEach`, SPA route change |
| Per-root (shadow) | Host element is GC'd | Custom element `disconnectedCallback` — shadow manager dies with the root |

`destroyScope` only clears the **document-level** manager. Shadow-root managers (keyed internally as `${scopeId}:shadow:${uniqueShadowRootId}`) rely on per-style cleanups or host garbage collection.

### 5. Pre-compression Flag

```typescript
import { compressCss, styleManagerFactory } from '@winglet/style-utils';

const PRE = compressCss(largeCssString);     // run once at module init
const addStyle = styleManagerFactory('scope');
addStyle('base', PRE, true);                  // compress=true → skip internal compressCss pass
```

Use this on measurable hot paths or for module-init CSS — not as a default. `compressCss` is O(n); the flag saves the pass per `addStyle` call.

## Common Prescriptions

| Symptom | Prescription |
|---------|--------------|
| `cxLite` emits `[object Object]` in output | Switch to `cx` — `cxLite` does not walk objects |
| Duplicate class tokens in output | Neither helper dedupes; clean inputs upstream or wrap the result |
| Styles registered but not applied | Add `classList.add(scopeId)` to the target or an ancestor; verify via `document.adoptedStyleSheets` |
| Styles leak across tests | `afterEach(() => destroyScope(id))` for every scope registered during the test |
| `document.styleSheets` empty right after `addStyle` | Flush is async — wait one `requestAnimationFrame` or run fake-timer rAF |
| `@keyframes` / `@font-face` collide across scopes | Namespace the name yourself — `@`-rules are never prefixed |
| `:host` rule has no effect | Confirm the factory was constructed with `{ shadowRoot }` and the host called `attachShadow(...)` |
| Styles intended for a shadow root appear on `document` | Factory is missing `{ shadowRoot }` — document-mode factories always target `document` |
| `destroyScope` does not remove per-host shadow instances | Expected — it clears only the document-level manager; rely on per-style cleanups or host GC |
| Theme flash on first paint | Apply theme synchronously before first render, or inline the initial `:root` vars in HTML |
| Trailing space inside `@media` block output | Known `compressCss` trade-off — browsers parse it correctly |
| `ReferenceError: requestAnimationFrame is not defined` in tests | Polyfill `globalThis.requestAnimationFrame` / `cancelAnimationFrame` in the test setup |
| Heap grows on repeated mount/unmount | Every `addStyle` call must have a matching cleanup, or its scope must be destroyed |

## Response Guidelines

1. **Pick the narrowest sub-path** when the answer targets one concern: `/util` for `cx` / `cxLite` / `compressCss`; `/style-manager` for scoped CSS. The barrel is fine for cross-concern examples.
2. **Pair scope registration with scope application**: every `styleManagerFactory(id)` answer must remind the user to `classList.add(id)` on an ancestor (document mode) or `attachShadow(...)` on the host (shadow mode).
3. **State the batching contract** when timing is involved — DOM writes flush on the next `requestAnimationFrame`; synchronous reads see the pre-flush state. Tests must advance the frame.
4. **Distinguish document-mode from shadow-mode** in every style-manager answer — different instance keying, different prefixing, different teardown semantics.
5. **Flag `cxLite` with object inputs as a bug** — never recommend "just use `cxLite` with objects"; redirect to `cx` and explain the `toString()` coercion.
6. **Call out `@`-rule non-scoping** whenever the user asks about `@keyframes`, `@font-face`, or `@supports` — animation and font names are global and must be namespaced manually.
7. **Pre-compression is a performance answer, not a correctness one**. Only recommend the `compress=true` flag when the user has a measurable hot path or a large module-init blob.
