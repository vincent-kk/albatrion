# Style Manager Knowledge

Expert knowledge for scoped CSS injection via `styleManagerFactory` and `destroyScope`.

## Overview

`styleManagerFactory` and `destroyScope` wrap an internal `StyleManager` class that:

- Maintains one singleton per `scopeId` (per root — see Shadow DOM doc).
- Injects CSS either via `CSSStyleSheet.replaceSync` + `adoptedStyleSheets` (modern) or a `<style>` element appended to `document.head` (fallback).
- Automatically prefixes non-`@`, non-`:root`, non-`:host` selectors with `.${scopeId}` to prevent cross-scope leaks.
- Batches DOM writes via `requestAnimationFrame`, so multiple `add`/`remove` calls in the same frame produce a single flush.
- Provides per-style cleanup functions and a scope-wide `destroy`.

## Basic Concepts

### Scope Prefixing

Given `scopeId = 'my-widget'` and the CSS `.btn { color: red; }`, the applied CSS becomes:

```css
.my-widget .btn { color: red; }
```

Selectors starting with `@` (e.g. `@media`, `@keyframes`, `@supports`), or exactly equal to `:root` or `:host`, are **not** prefixed — they are passed through verbatim. Every other selector receives the `.scopeId ` prefix.

### Singleton Registry

`StyleManager` keeps an internal `Map<instanceKey, StyleManager>`. The key is the `scopeId` for document roots, and `"${scopeId}:shadow:${uniqueShadowRootId}"` for shadow roots. Calling `styleManagerFactory('foo')` twice returns factories wired to the same underlying manager; both will inject into the same stylesheet.

`destroyScope(scopeId)` removes the entry for the document-root form of `scopeId`; it does not cascade to shadow-root instances with the same name (each has its own manager).

### Batched DOM Updates

Every `add` or `remove` that changes the processed style set calls `__scheduleDOMUpdate__`, which sets a `dirty` flag and schedules a single `requestAnimationFrame` flush. The flush concatenates all style blocks for the scope and writes once via `replaceSync` (or `textContent` in the fallback path).

This means:
- Calling `addStyle('a', ...); addStyle('b', ...); addStyle('c', ...)` in the same tick triggers exactly one DOM write.
- Reading the current stylesheet synchronously right after `add` may not reflect the new rules until the next animation frame.

### DOM Path Selection

On each flush, the manager checks:

```typescript
typeof CSSStyleSheet !== 'undefined'
  && 'replaceSync' in CSSStyleSheet.prototype
  && 'adoptedStyleSheets' in this.__root__
```

If all three are present, it uses the `CSSStyleSheet` + `adoptedStyleSheets` path. Otherwise it creates (or reuses) an `HTMLStyleElement` with `className = scopeId` and writes `textContent`. The element is appended to `shadowRoot` when in shadow mode, otherwise to `document.head`.

---

## API Reference

### `styleManagerFactory`

```typescript
export const styleManagerFactory: (
  scopeId: string,
  config?: StyleManagerConfig,
) => (styleId: string, cssString: string, compress?: boolean) => () => void;
```

Returns a curried `addStyle` function bound to one scope (and optionally one shadow root).

**Parameters:**
- `scopeId` — unique identifier; doubles as the CSS class prefix.
- `config.shadowRoot` — optional `ShadowRoot` target. See `knowledge/shadow-dom.md`.

**Returns:** `addStyle(styleId, cssString, compress?)` which:
- Registers/replaces the CSS under `styleId` inside `scopeId`.
- Returns a cleanup function that removes that specific `styleId` on call.

**Arguments of the returned function:**
- `styleId` — unique key inside the scope. Reusing a key replaces the previous CSS.
- `cssString` — the CSS source. Empty or whitespace-only strings are ignored.
- `compress` — when `true`, skip internal `compressCss` pass (use this when the caller has pre-compressed).

**Example:**

```typescript
import { styleManagerFactory } from '@winglet/style-utils';

const addStyle = styleManagerFactory('header');

const cleanupTitle = addStyle('title', '.title { font-size: 20px; }');
const cleanupSubtitle = addStyle('subtitle', '.subtitle { color: gray; }');

// remove one
cleanupSubtitle();

// replace 'title' — same key, new CSS
addStyle('title', '.title { font-size: 24px; }');
```

### `destroyScope`

```typescript
export const destroyScope: (scopeId: string) => void;
```

Tears down the `StyleManager` instance registered under `scopeId` for the document root:

1. Cancels any pending animation frame.
2. Removes the scope's `CSSStyleSheet` from `document.adoptedStyleSheets` (modern path).
3. Removes the `<style>` element from the DOM (fallback path).
4. Clears the processed-styles cache.
5. Deletes the manager from the internal registry.

**Parameters:**
- `scopeId` — same identifier used with `styleManagerFactory`.

**Example:**

```typescript
import { destroyScope, styleManagerFactory } from '@winglet/style-utils';

const addStyle = styleManagerFactory('overlay');
addStyle('base', '.overlay { position: fixed; inset: 0; }');

// full teardown
destroyScope('overlay');
```

Calling `destroyScope` on a `scopeId` that was never registered is a no-op that still triggers a lazy create+destroy cycle (because `StyleManager.get` always creates an instance). This is benign; prefer to only call it for scopes you actually created.

---

## Common Patterns

### Pattern 1: Per-component Lifecycle

```typescript
class Widget {
  private scopeId = `widget-${crypto.randomUUID()}`;
  private cleanups: Array<() => void> = [];

  mount(host: HTMLElement) {
    host.classList.add(this.scopeId);
    const addStyle = styleManagerFactory(this.scopeId);
    this.cleanups.push(addStyle('root', '.widget { display: block; }'));
    this.cleanups.push(addStyle('title', '.title { font-weight: 600; }'));
  }

  unmount() {
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
    destroyScope(this.scopeId);
  }
}
```

### Pattern 2: Dynamic Theme Swap

```typescript
const addTheme = styleManagerFactory('app-theme');
let removeCurrent: (() => void) | null = null;

function applyTheme(css: string) {
  removeCurrent?.();
  removeCurrent = addTheme('colors', css);
}
```

### Pattern 3: Pre-compressed Hot Path

```typescript
import { compressCss, styleManagerFactory } from '@winglet/style-utils';

const PRE_COMPILED = compressCss(largeCssString);
const addStyle = styleManagerFactory('chart');
addStyle('base', PRE_COMPILED, true); // third arg = already compressed
```

### Pattern 4: Targeting the Scope

Remember to apply `class="scopeId"` (or `classList.add(scopeId)`) to a container element. The prefix `.scopeId .selector` only matches elements nested under an element bearing that class.

---

## Best Practices

1. **Give each logical scope a unique ID**: collisions mean shared styles and shared teardown.
2. **Keep `styleId` keys stable**: reusing the key updates in place; changing it on every render leaks memory (the old key stays until removed).
3. **Clean up on unmount**: store cleanup functions OR call `destroyScope` on the whole scope.
4. **Let the scheduler batch**: do not force synchronous DOM reads between `add` calls within the same tick.
5. **Skip re-compression for known inputs**: pass `compress = true` when you control the CSS source.

---

## Troubleshooting

### Issue 1: Styles not visible

**Symptom:** Expected styles do not apply to the target element.

**Cause:** The element does not have the `scopeId` class, so the prefixed selector `.scopeId .selector` never matches.

**Solution:** Ensure the container element (or a parent) has `classList.add(scopeId)`. For Shadow DOM, styles apply inside the root regardless of outer classes — see `knowledge/shadow-dom.md`.

### Issue 2: Updates not reflected immediately

**Symptom:** Reading `document.styleSheets` right after `addStyle(...)` does not show new rules.

**Cause:** Updates flush on the next `requestAnimationFrame`.

**Solution:** Wait for the next frame, or for tests, use `vi.useFakeTimers()` in combination with a rAF polyfill. See `knowledge/troubleshooting.md`.

### Issue 3: `@keyframes` rule not scoped

**Symptom:** `@keyframes my-anim { ... }` appears without prefix and animations collide across scopes.

**Cause:** By design — all `@`-rules pass through unscoped. Animation names are not scoped, so two scopes using the same name collide.

**Solution:** Namespace animation names yourself: `@keyframes my-widget_fade { ... }`. This mirrors how global `@keyframes` behave in any CSS pipeline.

### Issue 4: Duplicate style registration

**Symptom:** The same `styleId` is added under different contents and you see flicker.

**Cause:** `add` compares the processed (scoped + compressed) output and only marks dirty when it changes. Flicker usually indicates identical content being set back-and-forth.

**Solution:** Inspect the two inputs — one likely differs only in whitespace. Stabilize the input or pre-compress both.

---

## Related Topics

- See `knowledge/shadow-dom.md` for Shadow DOM usage
- See `knowledge/advanced-patterns.md` for theming, performance, cleanup strategies
- See `knowledge/troubleshooting.md` for testing and scoping edge cases
