# Shadow DOM Knowledge

Expert knowledge for using `@winglet/style-utils` inside Shadow DOM.

## Overview

Shadow DOM encapsulation gives a custom element its own rendering tree and style sheet. `styleManagerFactory` supports this directly through the `StyleManagerConfig.shadowRoot` option. When a shadow root is provided:

1. The manager registers under a distinct internal key derived from the shadow root's unique ID.
2. CSS selectors are **not** scope-prefixed (encapsulation already isolates them).
3. The stylesheet is attached to the shadow root's `adoptedStyleSheets`, or a `<style>` element is appended inside the shadow root for fallback paths.

This doc covers the contract, the per-root keying logic, and patterns for Web Component lifecycles.

## Basic Concepts

### Per-root Instance Keying

Each `ShadowRoot` receives a random unique ID (stored on the shadow root via an internal `Symbol`). The `StyleManager` registry key becomes:

```
`${scopeId}:shadow:${uniqueShadowRootId}`
```

This means:

- Two shadow roots sharing the same `scopeId` register as **different** managers. Styles added to one are invisible to the other.
- The document-level manager for `scopeId` (no shadow root) is yet another separate entry.
- `destroyScope(scopeId)` only tears down the **document-level** manager. Shadow-root managers are reached through instance methods on the `StyleManager` singleton and are typically destroyed when the host element is removed (see Pattern 1 below).

### Selector Scoping Is Skipped

The `__scopeCSS__` method returns the CSS untouched when `isShadowDOM` is true. Within the shadow root, `.btn` applies only to elements inside the shadow tree, so additional prefixing would be redundant and prevent `:host` selectors from working.

You can still use:

- `:host` — styles the host element.
- `:host(...)` — conditional host styling.
- `::slotted(...)` — styles slotted content.
- Regular selectors — they apply inside the shadow tree.

---

## API Reference

### `StyleManagerConfig`

```typescript
export interface StyleManagerConfig {
  shadowRoot?: ShadowRoot;
}
```

Pass `{ shadowRoot }` as the second argument to `styleManagerFactory`:

```typescript
const addStyle = styleManagerFactory('my-element', { shadowRoot });
```

### `StyleRoot`

```typescript
export type StyleRoot = Document | ShadowRoot;
```

Internal alias used by `StyleManager`; exposed for advanced typing.

---

## Common Patterns

### Pattern 1: Custom Element Lifecycle

```typescript
import { destroyScope, styleManagerFactory } from '@winglet/style-utils/style-manager';

class MyCard extends HTMLElement {
  private shadow: ShadowRoot;
  private cleanups: Array<() => void> = [];
  private scopeId = 'my-card';

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });

    const addStyle = styleManagerFactory(this.scopeId, { shadowRoot: this.shadow });

    this.cleanups.push(
      addStyle('host', `
        :host { display: block; border-radius: 8px; background: #fff; }
      `),
      addStyle('content', `
        .content { padding: 1rem; }
      `),
    );
  }

  connectedCallback() {
    this.shadow.innerHTML = `<div class="content"><slot></slot></div>`;
  }

  disconnectedCallback() {
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
    // `destroyScope` on the shadow-root-qualified instance is not directly exposed.
    // Per-style cleanup above is sufficient for most cases.
    // If you need full teardown, rely on the shadow root being GC'd with the host.
  }
}

customElements.define('my-card', MyCard);
```

### Pattern 2: Many Hosts, Same `scopeId`

If you render 100 `<my-card>` elements, each gets its own `ShadowRoot` and therefore its own `StyleManager` instance keyed as `my-card:shadow:<randomId>`. This is correct and isolates styles per element, but it also allocates one stylesheet per host. For large lists consider:

- Sharing a single `CSSStyleSheet` via `adoptedStyleSheets` manually (outside this library).
- Using `document`-level styles with scope prefixing instead of Shadow DOM.

### Pattern 3: `:host` Conditional Styling

```typescript
addStyle('host-states', `
  :host { display: block; }
  :host([disabled]) { opacity: 0.5; pointer-events: none; }
  :host(:hover) { background: #f5f5f5; }
`);
```

These pass through untouched because `:host` selectors are in the skip-prefix list.

### Pattern 4: Slotted Content

```typescript
addStyle('slots', `
  ::slotted(h2) { margin: 0; font-size: 1.25rem; }
  ::slotted(p)  { margin: 0.5rem 0 0; color: #555; }
`);
```

---

## Best Practices

1. **One factory per shadow root**: keep the factory scoped to the host instance so cleanup functions are naturally per-element.
2. **Store cleanup functions**: because `destroyScope` only addresses the document-level instance, rely on per-style cleanups or let the shadow root die with the host.
3. **Prefer `:host` over a wrapper class**: cleaner than emulating scope via a class on the host.
4. **Avoid global `document` styles that target shadow internals**: they cannot cross the boundary. If you need shared base styles, inject them via the shadow-root factory instead.

---

## Troubleshooting

### Issue 1: Style added to shadow root shows up outside

**Symptom:** A rule intended for a Web Component appears to affect the main document.

**Cause:** The styles were added via a `document`-level factory (no `shadowRoot` config), so they were prefixed and installed on `document`.

**Solution:** Pass `{ shadowRoot: host.shadowRoot }` to `styleManagerFactory`. Verify by checking `document.adoptedStyleSheets` vs `host.shadowRoot.adoptedStyleSheets`.

### Issue 2: `:host` selector does not apply

**Symptom:** `:host { ... }` has no effect.

**Cause:** Either the factory was created without `shadowRoot`, or the host element never got `attachShadow(...)`.

**Solution:** Confirm the manager is in shadow mode and the element has an open or closed shadow root. `:host` only works inside the root that matches the host.

### Issue 3: `destroyScope` does not clean up shadow instances

**Symptom:** Calling `destroyScope('my-card')` leaves per-host stylesheets behind.

**Cause:** `destroyScope` looks up `StyleManager.get(scopeId)` without shadow context, which addresses only the document-level instance.

**Solution:** Use per-style cleanup functions, or retain a reference to the per-host `StyleManager` and call `destroy()` on it. In most cases, the shadow root is garbage-collected along with the host element, which also drops its stylesheet.

### Issue 4: Adopted stylesheets duplication warning

**Symptom:** Console warning about the same `CSSStyleSheet` being shared.

**Cause:** You cached a factory and reused it across different hosts with different shadow roots.

**Solution:** Do not reuse factories across shadow roots. Create a new factory per host: `styleManagerFactory(scopeId, { shadowRoot: this.shadowRoot })`.

---

## Related Topics

- See `knowledge/style-manager.md` for the base `styleManagerFactory` contract
- See `knowledge/advanced-patterns.md` for lifecycle patterns
- See main SPECIFICATION for `StyleManagerConfig` and `StyleRoot`
