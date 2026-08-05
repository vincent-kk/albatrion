# Advanced Patterns Knowledge

Expert knowledge for composing `@winglet/style-utils` into production-grade workflows.

## Overview

The primitives are deliberately small — three functions and one class. Real applications combine them into lifecycle-aware systems: theme managers, performance-sensitive render loops, and dynamic CSS injection pipelines. This doc collects the patterns we have seen pay off repeatedly.

## Basic Concepts

### Lifecycle Ownership

Every call to `addStyle(id, css)` returns a cleanup function. The owner of that cleanup is responsible for calling it before the owning entity disappears. Three levels of granularity exist:

1. **Per-style** — save the cleanup returned by `addStyle`; call it when that specific rule becomes irrelevant.
2. **Per-scope** — call `destroyScope(scopeId)` to remove every rule registered under that scope.
3. **Per-root** (shadow) — the shadow-root manager dies with the host element (GC'd with the shadow root).

Pick the tightest level that matches your ownership model.

### Batching Semantics

The manager flushes once per frame via `requestAnimationFrame`. Inside a single tick you can freely issue many `add`/`remove` calls — they coalesce into one DOM write. This makes fine-grained reactive updates cheap.

---

## Common Patterns

### Pattern 1: Theme Manager

A small class that keeps one `:root` variable block alive and rotates it on demand:

```typescript
import { destroyScope, styleManagerFactory } from '@winglet/style-utils/style-manager';

type ThemeName = 'light' | 'dark';

const THEMES: Record<ThemeName, Record<string, string>> = {
  light: { '--bg': '#ffffff', '--fg': '#111111', '--primary': '#1677ff' },
  dark:  { '--bg': '#0f0f10', '--fg': '#f5f5f5', '--primary': '#4096ff' },
};

export class ThemeManager {
  private readonly addStyle = styleManagerFactory('theme');
  private removeTheme: (() => void) | null = null;
  private removeExtras = new Map<string, () => void>();

  applyTheme(name: ThemeName) {
    const vars = Object.entries(THEMES[name])
      .map(([k, v]) => `${k}: ${v};`)
      .join(' ');

    this.removeTheme?.();
    this.removeTheme = this.addStyle('vars', `:root { ${vars} } body { background: var(--bg); color: var(--fg); }`);
  }

  registerExtra(id: string, css: string) {
    this.removeExtras.get(id)?.();
    this.removeExtras.set(id, this.addStyle(`extra-${id}`, css));
  }

  removeExtra(id: string) {
    this.removeExtras.get(id)?.();
    this.removeExtras.delete(id);
  }

  destroy() {
    this.removeTheme?.();
    this.removeExtras.forEach((fn) => fn());
    this.removeExtras.clear();
    destroyScope('theme');
  }
}
```

Note that `:root` rules pass through the scope prefix untouched, so variable declarations remain global — exactly what a theme system needs.

### Pattern 2: Per-render Hot-path className

In a high-frequency render function, prefer `cxLite` with flat inputs and avoid object/array shapes:

```typescript
import { cxLite } from '@winglet/style-utils/util';

function renderRow(i: number, selected: boolean) {
  const cls = cxLite('row', i % 2 && 'row-odd', selected && 'row-selected');
  // ...
}
```

For anything non-hot-path, use `cx`. The difference becomes measurable only in thousands-per-second call sites.

### Pattern 3: Lazy Stylesheet Loading

Inject CSS only when a feature surface activates:

```typescript
import { compressCss, styleManagerFactory } from '@winglet/style-utils';

let cleanupModal: (() => void) | null = null;
const addStyle = styleManagerFactory('modal');

// Pre-compress at module load (cheap if CSS is small)
const MODAL_CSS = compressCss(/* long modal CSS */);

export function enableModalStyles() {
  if (cleanupModal) return;
  cleanupModal = addStyle('root', MODAL_CSS, true); // compress=true: skip re-compression
}

export function disableModalStyles() {
  cleanupModal?.();
  cleanupModal = null;
}
```

### Pattern 4: Deterministic Batch Updates

Group multiple additions in the same tick so exactly one DOM flush occurs:

```typescript
const addStyle = styleManagerFactory('dashboard');

const cleanups = [
  addStyle('layout', layoutCss),
  addStyle('typography', typographyCss),
  addStyle('colors', colorsCss),
  addStyle('responsive', responsiveCss),
];
// Single rAF flush coalesces all four.
```

Avoid inserting synchronous DOM reads between `add` calls in performance-sensitive paths — they force layout and defeat batching benefits elsewhere.

### Pattern 5: Swapping Rules Atomically

Use the `styleId` replacement behavior to atomically swap rules:

```typescript
const addStyle = styleManagerFactory('panel');

addStyle('state', '.panel { background: white; }');
// later, same id replaces cleanly on the next frame
addStyle('state', '.panel { background: lightyellow; }');
```

### Pattern 6: Unique Scopes per Instance

For components that may be rendered multiple times and need independent styles per instance, derive a unique scope:

```typescript
const makeScopeId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

class Widget {
  private scopeId = makeScopeId('widget');
  constructor(host: HTMLElement) {
    host.classList.add(this.scopeId);
    const addStyle = styleManagerFactory(this.scopeId);
    // ...
  }
  destroy() { destroyScope(this.scopeId); }
}
```

---

## Best Practices

1. **Compress once at module scope**: for CSS blobs known at init time, call `compressCss` once and cache the result.
2. **Set `compress = true` when you already compressed**: saves an O(n) pass every `add`.
3. **Reuse factories, not compositions**: create one factory per scope; reuse its returned `addStyle` everywhere in that scope.
4. **Prefer per-scope destruction for bulk cleanup**: on teardown of a whole view, `destroyScope(scopeId)` is less error-prone than orchestrating dozens of cleanup functions.
5. **Name animations deliberately**: `@keyframes` are not scoped. Include the scope name in the animation name to avoid collisions.
6. **Minimize re-renders of identical CSS**: if CSS content doesn't change between renders, don't call `add` again — `StyleManager` short-circuits on identical processed output, but the library call still costs the scope+compress work.

---

## Troubleshooting

### Issue 1: Layout thrash in animations

**Symptom:** Animations stutter when many `addStyle` calls happen during an animation frame.

**Cause:** Each `addStyle` that changes processed output triggers a flush next frame. If consumers read layout between them, they cause forced synchronous layout.

**Solution:** Batch `add`/`remove` at the start of the frame; delay any `getBoundingClientRect`/`offsetHeight` reads until after the next flush.

### Issue 2: Memory growth after repeated mount/unmount

**Symptom:** Heap size grows after repeatedly creating and tearing down a component that uses `styleManagerFactory`.

**Cause:** Cleanup functions were not invoked and/or `destroyScope` was never called, leaving stale entries in the internal registry.

**Solution:** Audit ownership — every `addStyle` call must have a matching cleanup, or the scope must be destroyed.

### Issue 3: Theme flash on initial load

**Symptom:** Brief flash of unstyled content when `applyTheme` runs after first paint.

**Cause:** The first theme application waits for the next `requestAnimationFrame`.

**Solution:** Call `applyTheme` synchronously as early as possible (before first render), or inline the initial `:root { --vars }` block in the HTML `<style>` and only hot-swap after hydration.

### Issue 4: Keyframe name collisions across scopes

**Symptom:** Two scopes each define `@keyframes fade-in` and animations misbehave.

**Cause:** `@`-rules are not scoped. Keyframe names share a global namespace.

**Solution:** Namespace the keyframe names yourself (`@keyframes widgetA_fadeIn`, `@keyframes widgetB_fadeIn`).

---

## Related Topics

- See `knowledge/style-manager.md` for the base API
- See `knowledge/shadow-dom.md` for per-root patterns
- See `knowledge/troubleshooting.md` for test-isolation issues
