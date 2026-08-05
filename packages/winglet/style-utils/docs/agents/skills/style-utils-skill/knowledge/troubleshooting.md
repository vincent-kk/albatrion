# Troubleshooting Knowledge

Collected answers for recurring issues when using `@winglet/style-utils`.

## Overview

This doc groups the common failure modes and their fixes. Each section names a symptom, explains the cause, and gives a concrete resolution. For deeper context, follow the pointers to topic-specific knowledge files.

## Basic Concepts

### Where Things Go Wrong

- **Scoping**: the `scopeId` prefix only matches elements that carry the scope class.
- **Batching**: DOM reads between `add` calls run against the pre-flush state.
- **Lifecycle**: cleanup is explicit — the library never auto-destroys on its own.
- **`@`-rules**: media queries, keyframes, supports, fontface, etc. are **not** prefixed.
- **Testing**: module-level singletons leak across tests unless each test destroys its scopes.

---

## Common Patterns

### Diagnostic Flow

When a style does not appear, follow this sequence:

1. Is the factory in document mode or shadow mode? (`styleManagerFactory(id)` vs `styleManagerFactory(id, { shadowRoot })`)
2. For document mode: does the target element have `class="scopeId"` (or an ancestor that does)?
3. Has the next `requestAnimationFrame` fired? Flushes are async.
4. Is the selector an `@`-rule or `:root`/`:host`? If so, it is unprefixed — global styles apply.
5. For shadow mode: is the CSS actually attached to the right shadow root (inspect `host.shadowRoot.adoptedStyleSheets`)?

---

## Best Practices

1. **Treat `scopeId` as a commitment**: same `scopeId` across unrelated components will share styles.
2. **Keep `styleId` keys stable across re-renders**: reuse the key to update; changing the key on every render leaks rules.
3. **Call `destroyScope` in teardown paths**: test `afterEach`, SPA route transitions, feature unmounts.
4. **Account for the rAF gap in tests**: flushes are asynchronous; await a frame or mock rAF.

---

## Troubleshooting

### Issue 1: Styles not applied

**Symptom:** `addStyle('btn', '.btn { color: red; }')` is called, but the rendered button is not red.

**Cause:** Most commonly, the element or an ancestor is not tagged with the scope class. The compiled rule is `.scopeId .btn { color: red; }`, which needs an ancestor with `classList.contains('scopeId')`.

**Solution:**

```typescript
const scopeId = 'my-widget';
const addStyle = styleManagerFactory(scopeId);
addStyle('btn', '.btn { color: red; }');

// Apply the class on a container
container.classList.add(scopeId);
```

If the element already has the class and the style still does not apply, inspect the generated stylesheet via `document.adoptedStyleSheets` / `document.head.querySelectorAll('style')` to verify registration.

### Issue 2: Styles leak between tests

**Symptom:** A test passes in isolation but fails when run with other tests; colors or layouts from a previous test appear.

**Cause:** `StyleManager` keeps a module-level registry keyed by `scopeId`. Unless you destroy the scope in `afterEach`, state survives.

**Solution:**

```typescript
import { afterEach } from 'vitest';
import { destroyScope } from '@winglet/style-utils';

const SCOPES = ['widget', 'overlay', 'theme'];
afterEach(() => SCOPES.forEach(destroyScope));
```

Or centralize scope creation in a helper that registers an automatic teardown.

### Issue 3: Expected rAF-flushed update not visible in test

**Symptom:** Test calls `addStyle(...)` and immediately asserts on computed style — fails.

**Cause:** Flush is asynchronous. The write happens in the next animation frame.

**Solution:** Wait for the next rAF, or use fake timers:

```typescript
import { vi } from 'vitest';

vi.useFakeTimers();
addStyle('x', '.x { color: red; }');
vi.runAllTimers();          // or manually advance the rAF polyfill
await Promise.resolve();    // let microtasks drain
// assertion
```

If `requestAnimationFrame` is unavailable (old jsdom), polyfill it in `vitest.setup.ts`:

```typescript
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0) as any;
globalThis.cancelAnimationFrame = (id) => clearTimeout(id as any);
```

### Issue 4: `@keyframes` / `@media` not scoped

**Symptom:** `@keyframes my-anim { ... }` does not get the scope prefix; animation collides with another scope.

**Cause:** By design. `@`-rules (and the bare selectors `:root`, `:host`) are pass-through in `__scopeCSS__`.

**Solution:** Namespace animation and font-face names yourself:

```typescript
@keyframes widget_fadeIn { ... }
.btn { animation: widget_fadeIn 200ms; }
```

### Issue 5: Two scopes, identical styles — is this a bug?

**Symptom:** `styleManagerFactory('a')` and `styleManagerFactory('b')` register the same rule body; you expect deduplication.

**Cause:** Each scope is independent by design. Two scopes = two stylesheets.

**Solution:** If you want shared rules across components, use a single shared `scopeId`. If you want global styles, emit an unprefixed `@`-rule or a `:root` block.

### Issue 6: `cxLite` produces `[object Object]`

**Symptom:** `cxLite('btn', { primary: true })` renders `btn [object Object]`.

**Cause:** `cxLite` does not handle objects. It coerces via `toString()`.

**Solution:** Use `cx` for any input that includes objects or arrays.

### Issue 7: `compressCss` output has trailing space inside media block

**Symptom:** `@media (...){.c{padding:0 16px }}` — stray space before `}`.

**Cause:** Known trade-off. Post-processing per-block would be O(n) twice; the minifier opts for one pass.

**Solution:** Browsers parse this correctly. If cosmetically required, run `output.replace(/\s+\}/g, '}')` at the cost of extra work.

### Issue 8: Destroy called on already-destroyed scope

**Symptom:** Calling `destroyScope` twice on the same scope — no observable effect but you worry.

**Cause:** `StyleManager.get` lazily re-creates an instance, so the second `destroyScope` creates+destroys a fresh, empty manager.

**Solution:** Harmless, but avoid redundant calls for clarity. Track scope ownership explicitly.

### Issue 9: Adopted stylesheet appears in wrong root

**Symptom:** Styles intended for a shadow root show up on `document`.

**Cause:** The factory was created without `{ shadowRoot }`, so it defaulted to `document`.

**Solution:** Pass the shadow root explicitly:

```typescript
const addStyle = styleManagerFactory('my-el', { shadowRoot: host.shadowRoot! });
```

See `knowledge/shadow-dom.md` for per-root instance keying.

### Issue 10: CSS appears prefixed inside Shadow DOM

**Symptom:** Rule shows as `.scope .btn` inside a shadow root, even though you expected bare `.btn`.

**Cause:** The factory was created without `{ shadowRoot }`. Document-mode factories always prefix.

**Solution:** Create a separate factory per host with `{ shadowRoot }`. Do not reuse a document-mode factory for shadow roots.

---

## Related Topics

- See `knowledge/getting-started.md` for install-time issues
- See `knowledge/style-manager.md` for scope and batching details
- See `knowledge/shadow-dom.md` for encapsulation details
- See `knowledge/css-compression.md` for minifier trade-offs
