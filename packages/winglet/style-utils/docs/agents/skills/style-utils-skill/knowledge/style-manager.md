# Style Manager — scoped injection, batching, lifecycle

`styleManagerFactory` and `destroyScope` are the public face of an internal `StyleManager` class. One instance exists per scope key; it owns a `Map<styleId, processedCss>`, a `CSSStyleSheet` (or a `<style>` element), and a pending animation frame.

```typescript
const addStyle = styleManagerFactory('my-widget');
const removeTitle = addStyle('title', '.title { font-size: 20px; }');
container.classList.add('my-widget'); // required — see below
removeTitle();
destroyScope('my-widget');
```

## Scope rewriting

In document mode, each rule's selector is prefixed with `.${scopeId} `, turning `.btn { … }` into `.my-widget .btn { … }`. The prefix is a descendant combinator, so **the CSS only matches inside an element carrying the scope class**. The library never applies that class; `classList.add(scopeId)` on a container is your job, and its absence is the single most common "nothing happened" report.

The id is interpolated into that selector raw — nothing validates or escapes it, so **`scopeId` must be a valid CSS class identifier**. The failures are quiet and each one is different:

```typescript
'my widget' → '.my widget .btn'  // descendant of .my, not one class
'a.b'       → '.a.b .btn'        // compound: needs both classes
'7f3a9b2c'  → '.7f3a9b2c .btn'   // invalid — a class cannot start with a digit
```

The third is the dangerous one, and it is easy to reach: deriving a per-instance scope from `crypto.randomUUID()` or `Math.random().toString(36)` yields a digit-leading id often enough to look intermittent. Every rule in that scope becomes an unparseable selector and the browser discards it silently — the styles are injected, present in the sheet's source text, and match nothing. Always prefix a generated id with a literal (`widget-${id}`).

Three selector forms pass through unprefixed:

| Selector form              | Behavior                                                  |
| -------------------------- | --------------------------------------------------------- |
| Anything starting with `@` | Header emitted verbatim (inner rules: see at-rules below) |
| Exactly `:root`            | Emitted verbatim                                          |
| Exactly `:host`            | Emitted verbatim                                          |

The `:root` exception is load-bearing rather than incidental: it is _why_ CSS-variable theming works through this library. A scope can inject `:root { --bg: #fff; }` and have it land globally, so a theme scope can rotate variables that every other scope consumes through `var(--bg)`:

```typescript
const addTheme = styleManagerFactory('theme');
let removeCurrent: (() => void) | null = null;

function applyTheme(vars: string) {
  removeCurrent?.(); // same styleId would also work — see atomic swap below
  removeCurrent = addTheme('vars', `:root { ${vars} }`);
}
```

"Exactly" is literal. `:root.dark { … }` and `:host([disabled]) { … }` are not bare, so they take the prefix and come out as `.scope :root.dark` and `.scope :host([disabled])` — both meaningless in document mode. In a selector list each selector is judged alone: `:root, .a { … }` becomes `:root,.scope .a{…}`.

## How the rewriter walks rules

The rewriter finds each block's end by counting braces and prefixes every selector of a style rule. Braces and semicolons inside quoted strings, comments and backslash escapes are not structure, so `content: "}"` is safe. A selector list splits only at top-level commas, outside parentheses, quoted strings, comments and backslash escapes:

```typescript
addStyle('list', '.a, .b:is(.c, .d) { color: red; }');
// injected: '.my-widget .a,.my-widget .b:is(.c,.d){color:red}'
```

At-rules are handled by kind:

| At-rule                                                                                                                  | Behavior                                               |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| `@media`, `@supports`, `@container`, `@layer`, `@scope`, `@document`, `@starting-style` (vendor-prefixed forms included) | Header kept, inner rules scoped recursively            |
| Other block at-rules: `@keyframes`, `@font-face`, `@page`, …                                                             | Whole block copied unchanged, so `from`/`to` stay bare |
| Statements ending in `;`: `@import`, `@charset`, `@layer a, b;`                                                          | Copied unchanged, also when no style rule follows      |

```typescript
addStyle(
  'm',
  '@media (max-width: 768px) { .btn { color: red; } } .z { color: green; }',
);
// injected: '@media (max-width:768px){.my-widget .btn{color:red}}.my-widget .z{color:green}'
```

Names declared by `@keyframes` and `@font-face` are global regardless — nothing namespaces them per scope, so two scopes defining `fade-in` silently collide. Prefix the names yourself.

**A leading pseudo-selector matches descendants.** `:hover { … }` becomes `.scope :hover` — any hovered element inside the scope container, not the container itself. Write top-level pseudo-selectors against a real element (`.btn:hover`).

## Where the rewriter fails

**A brace inside an unquoted `url(…)` miscounts the block.** The rewriter skips quoted strings, comments and escapes, but an unquoted URL is plain text to it, so a `{` or `}` there shifts the brace depth. The rule and the rules after it are lost:

```typescript
addStyle('u', '.a { background: url(a{b.png); } .b { color: blue; }');
// injected: ''
```

Quote such a URL (`url("a{b.png")`). A `/*` inside an unquoted `url(…)`, in any letter case, opens no comment, and a `;` inside one does not end an `@import` or other statement. A function whose name only ends in `url`, such as `myurl(`, is not a URL and is read as ordinary CSS.

**Comments between rules and stray `}` are dropped.** A `}` with no open block is removed instead of being glued onto the next selector.

**A trailing rule without its closing brace is dropped.** Nothing is injected for it, and no error is raised.

## Shadow DOM mode

Passing `{ shadowRoot }` changes three things at once: the manager registers under a different key, selector rewriting is skipped entirely, and the stylesheet attaches to the shadow root instead of `document`.

```typescript
class MyCard extends HTMLElement {
  private cleanups: Array<() => void> = [];
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const addStyle = styleManagerFactory('my-card', { shadowRoot });
    this.cleanups.push(
      addStyle('host', ':host { display: block; } .content { padding: 1rem; }'),
    );
  }
  disconnectedCallback() {
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
  }
}
```

Rewriting is skipped because shadow encapsulation already isolates the selectors — and because prefixing would break `:host` and `::slotted(…)`, which must stay at the root of their selector. This also means none of the rewriting above happens in shadow mode: at-rules, selector lists, and pseudo-selectors all pass through untouched, and a brace inside an unquoted URL cannot cut a rule.

Never reuse a document-mode factory for a shadow root, or one host's factory for another host. Both mistakes route CSS to the wrong root, and the symptom — styles appearing on `document` instead of inside the component — looks like a scoping bug rather than a wiring one.

## Instance keying

Document managers use a `Map` keyed by `scopeId`. Shadow managers use a `WeakMap` keyed by `ShadowRoot`, whose values are maps keyed by `scopeId`. The registry does not retain an otherwise unreachable host or root. Consequences:

- Two `styleManagerFactory('x')` calls return factories over the **same** manager. Adding through either is visible to the other, and one `destroyScope('x')` removes both sets of styles.
- The document manager for `'x'` and each shadow manager for `'x'` are **fully separate instances** with separate stylesheets. They share nothing but the name.
- Rendering 100 hosts under one `scopeId` produces 100 managers and 100 stylesheets. That is correct isolation, but it is not free — for large lists, prefer document-mode scoping, or share one `CSSStyleSheet` across roots outside this library.

## Batched writes

An `add` or `remove` that changes the processed style set sets a dirty flag and schedules one `requestAnimationFrame`. The flush joins every style in the scope with newlines and replaces the sheet in a single write.

The observable consequence is that **nothing is in the DOM until the next frame**. Three `addStyle` calls in one tick produce zero writes synchronously and exactly one after the frame fires. Any synchronous read of `document.styleSheets`, `adoptedStyleSheets`, or computed style between `addStyle` and the flush sees the previous state — a theme applied during startup will flash unless it is injected before first paint.

## Write paths, and how each one fails

The path is chosen per flush: `CSSStyleSheet.replaceSync` plus `adoptedStyleSheets` when both are available on the target root, otherwise a `<style>` element appended to the shadow root or to `document.head`. The fallback element carries `className = scopeId`, which makes it findable — `document.head.querySelector('style.my-widget')` is the quickest way to read back exactly what a scope injected.

Neither path reports bad CSS. The fallback path only assigns `textContent`; the modern path calls `replaceSync`, which per CSSOM parses the text and **drops invalid rules rather than throwing**. So a selector the browser cannot parse — the digit-leading scope id above, or a rule lost to a brace inside an unquoted URL — does not raise anything anywhere. The rule simply never exists, and every valid rule around it applies normally. When a style is missing, read back what was actually injected instead of reasoning about the input.

The modern path's `replaceSync` call is nonetheless wrapped in a `try`/`catch` that warns and returns. That is a defensive path — `replaceSync` throws on a non-modifiable sheet, not on malformed CSS, and the manager always constructs its own — but if it ever does fire, the failure mode is worth knowing: **the flush does not throw, and the sheet keeps its previous content**. Every style in the scope freezes at its last good state, with `StyleManager: Failed to apply CSS for scope "…"` on the console as the only evidence. The stored styles are not lost, so the next successful flush applies all of them.

## The `compress` argument

`addStyle(styleId, css, alreadyCompressed?)`. The declared name is `compress`, which reads as an instruction and is not one — see the gotcha in `SKILL.md`. What matters operationally:

- The flag gates **only** the compression pass. Scope rewriting always runs, so `addStyle('s', '.btn { color: red; }', true)` injects `.scope .btn{ color: red; }` — scoped, and still carrying its original whitespace.
- Passing `true` on CSS that was never compressed is therefore not a correctness bug, just a silently fatter stylesheet, which is exactly why the inversion survives code review.
- It is a performance answer only. Compress once at module init and pass the result with `true` when the same blob is injected repeatedly; otherwise leave it alone.

## Cost model

`add` computes the scoped and compressed output first, then compares it against the previous output for that `styleId` and short-circuits when they are identical. Re-adding unchanged CSS therefore costs a full scope-plus-compress pass and skips only the DOM flush — cheap enough to be safe in a render path, not free enough to be deliberate.

Two behaviors follow from the same `Map`:

- **Same `styleId` swaps atomically.** `addStyle('state', cssA)` then `addStyle('state', cssB)` replaces the entry in place, keeping its position in the concatenated output, and the reader never observes an intermediate state because the swap lands in one flush.
- **Whitespace-only CSS is ignored, not removed.** `addStyle('state', '')` returns without touching the entry; the previous `state` rules survive. Removal goes through the returned cleanup function or `destroyScope`.

## Cleanup

| Level     | Trigger                             | Reaches                                 |
| --------- | ----------------------------------- | --------------------------------------- |
| One style | the function returned by `addStyle` | that `styleId` in that manager          |
| One scope | `destroyScope(scopeId)`             | the document-mode manager for `scopeId` |
| One root  | `destroyScope(scopeId, { shadowRoot })` | that root's scope manager |

`destroyScope` cancels the pending frame, detaches the sheet or removes the `<style>` element, clears the map, and deletes the registry entry. Removing styles one by one is not equivalent: once the last style is gone the flush writes an empty string, so the stylesheet stays attached to the root — empty, but still counted in `adoptedStyleSheets`. Only `destroyScope` detaches it.

`destroyScope(scopeId, { shadowRoot })` cancels and detaches the matching shadow scope; omitting the config targets the document scope. An unknown scope is a no-op. Discard old factories and cleanup functions after destroying their manager, and construct a fresh factory before injecting again.

For components rendered many times that each need their own rules, derive the scope per instance rather than sharing one:

```typescript
class Widget {
  private scopeId = `widget-${Math.random().toString(36).slice(2, 8)}`;
  constructor(host: HTMLElement) {
    host.classList.add(this.scopeId);
    styleManagerFactory(this.scopeId)('root', '.widget { display: block; }');
  }
  destroy() {
    destroyScope(this.scopeId);
  }
}
```

## Diagnosing "the style is not applied"

Work down this list; each step rules out one layer.

1. **Which mode?** `styleManagerFactory(id)` injects into `document`; `styleManagerFactory(id, { shadowRoot })` injects into that root. Styles showing up in the wrong place is almost always a missing `{ shadowRoot }`.
2. **Document mode — is the scope class applied?** The rule is `.scopeId .selector`; it needs an ancestor with that class. This is the most frequent cause by a wide margin.
3. **Has a frame passed?** Flushes are asynchronous. Assertions and reads taken in the same tick see nothing.
4. **Is the selector one the rewriter mishandles?** A brace inside an unquoted `url(…)`, a compound `:root`/`:host`, or a leading pseudo-selector — check the injected text, not the input.
5. **Shadow mode — is it on the right root?** Inspect `host.shadowRoot.adoptedStyleSheets` rather than `document.adoptedStyleSheets`.

## Test isolation

The registry is module-level, so scopes survive across tests in the same file and leak into later ones. Destroy every scope a test created:

```typescript
afterEach(() => ['widget', 'overlay', 'theme'].forEach(destroyScope));
```

Because the flush is a frame away, assertions need one to fire. Vitest's fake timers cover `requestAnimationFrame`, so the frame can be driven synchronously — this is the pattern the package's own suite uses:

```typescript
vi.useFakeTimers();
addStyle('x', '.x { color: red; }');
vi.runAllTimers(); // fires the scheduled frame
// assert here
```

In environments without `requestAnimationFrame` at all, polyfill both halves in the setup file — the manager calls `cancelAnimationFrame` during teardown, so a one-sided polyfill throws on `destroy`:

```typescript
globalThis.requestAnimationFrame = (cb) =>
  setTimeout(() => cb(Date.now()), 0) as any;
globalThis.cancelAnimationFrame = (id) => clearTimeout(id as any);
```

## Related

- `pure-utils.md` — `compressCss` behavior, including the string-literal corruption that reaches injected CSS
