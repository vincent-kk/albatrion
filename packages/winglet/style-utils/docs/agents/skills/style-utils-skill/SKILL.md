---
name: style-utils-skill
description: '@winglet/style-utils library expert. Guide users on className composition (cx/cxLite), CSS minification (compressCss), and scoped CSS injection with Shadow DOM support (styleManagerFactory/destroyScope).'
---

# @winglet/style-utils — scoped CSS injection and className composition

Apply this skill when working with `cx`, `cxLite`, `compressCss`, `styleManagerFactory`, or `destroyScope` — choosing between the two className helpers, reasoning about when injected CSS actually reaches the DOM, or diagnosing styles that were registered but never applied.

## Mental Model

**Three concerns, only one stateful.** `cx`, `cxLite`, and `compressCss` are pure string functions sharing nothing. `styleManagerFactory` is the opposite: it returns a handle into a **module-level registry of scope singletons**. Injected styles outlive the code that added them until something explicitly removes them — nothing is ever torn down automatically.

**A scope is a class name, not a boundary the library enforces.** In document mode the manager rewrites `.btn` into `.myscope .btn` and injects it into the global stylesheet. Nothing puts `class="myscope"` on your elements for you. Registration and application are two separate steps, and skipping the second is the most common cause of "the styles do nothing".

**`add` writes to a Map; the DOM write is deferred.** Each `addStyle(id, css)` stores processed CSS under `id`, then schedules a single `requestAnimationFrame` flush. The flush concatenates _every_ style in the scope and replaces the entire sheet at once. Per-style work is paid at call time; DOM work is paid once per frame.

**The scoper is a brace scanner, not a CSS parser.** It cuts at the first `}`, then prefixes whatever precedes the first `{`. Anything nested or comma-separated falls outside what that can represent, and it fails silently rather than throwing. This is where every sharp edge in the package lives — `knowledge/style-manager.md` enumerates them.

**It is for CSS you assemble at runtime.** The manager exists for styles whose text is not known until the code runs — themes, host-provided CSS, styles shipped inside a library that must not require a build step from its consumer. When the CSS is static and a bundler is already in the pipeline, CSS modules or a plain stylesheet do the same job with real parsing, real scoping, and no rAF gap. Reaching for this library for static styles buys the scoping bugs below and nothing else.

## Decision Guide

| Question                                                     | Answer                                                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Objects (`{ active: true }`) or nested arrays in the inputs? | `cx` — `cxLite` does not walk them and emits garbage tokens                                |
| Flat strings/numbers only, in a hot render path?             | `cxLite`                                                                                   |
| Migrating from `classnames` / `clsx`?                        | `cx` — same semantics for string/number/array/object inputs                                |
| Need deduplication or sorting?                               | Neither — clean the inputs upstream                                                        |
| Styles for a custom element with a shadow root?              | `styleManagerFactory(id, { shadowRoot })` — never a document-mode factory                  |
| Styles for ordinary DOM?                                     | `styleManagerFactory(id)` **plus** `classList.add(id)` on a container                      |
| Tearing down one rule / a whole view / a shadow host?        | cleanup fn returned by `addStyle` / `destroyScope(id)` / host GC                           |
| Minifying build output?                                      | Not this library — use cssnano or lightningcss; `compressCss` is a runtime whitespace pass |

## Invariants & Gotchas

**The third argument of `addStyle` is inverted from how it reads.** The shipped declaration is `(styleId, cssString, compress?: boolean)`, but `true` means _"this CSS is already compressed — skip the internal pass"_, not _"please compress it"_. An agent reading the parameter name alone will infer the exact opposite of the truth and pass `true` on raw CSS, which then ships uncompressed. Treat the argument as `alreadyCompressed`.

- **No type is exported from any entry point.** `ClassValue`, `ClassArray`, `ClassObject`, `StyleManagerConfig`, and `StyleRoot` are declared in source but never re-exported through the barrel or the sub-paths. `import type { ClassValue } from '@winglet/style-utils'` does not compile. Pass config objects inline (`{ shadowRoot }` is structurally typed) and declare local aliases if you need the union.
- **`@`-rule blocks come out malformed in document mode.** The scoper drops the at-rule's closing brace, leaves its inner selectors unscoped, and lets every rule that follows fall inside the still-open block. Put media queries in their own `styleId`, or last. Details and workarounds: `knowledge/style-manager.md`.
- **Only the first selector in a comma list is scoped.** `.a, .b { … }` becomes `.scope .a, .b { … }` — the second selector leaks globally. Split comma lists into separate rules.
- **Adding whitespace-only CSS is ignored, not a removal.** `addStyle('x', '')` leaves the previous `x` in place. Call the cleanup function to remove a style.
- **A flush is one frame away.** Reading `document.styleSheets` or computed style synchronously after `addStyle` sees the pre-flush state. Tests must advance a frame.
- **`destroyScope` cannot reach shadow-root managers.** It resolves the document-mode key only. Shadow instances are released by per-style cleanups or by the host being collected.
- **`@keyframes` and `@font-face` names are global.** Nothing namespaces them per scope; collisions across scopes are silent. Prefix the names yourself.

## Common Prescriptions

Symptom-indexed dispatch. The mechanism behind each one lives in the knowledge files.

| Symptom                                                       | Prescription                                                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Styles registered, nothing changed (document mode)            | `classList.add(scopeId)` on a container — registration does not apply the class             |
| Styles land on `document` instead of inside the component     | The factory is missing `{ shadowRoot }`                                                     |
| A whole scope stopped updating, one `console.warn` in the log | `replaceSync` threw; the scope is frozen at its last good state                             |
| A generated per-instance scope works sometimes, not always    | The id is unescaped — a digit-leading one is invalid and the browser drops every rule       |
| CSS is present in the sheet but matches nothing               | Invalid selectors are dropped with no error — read back the injected text, not the input    |
| Rules written after a media query stopped applying            | The at-rule left its block open and swallowed them — give the at-rule its own `styleId`     |
| One selector of a comma list applies document-wide            | Split the list; only the first selector is scoped                                           |
| `:host(...)` or `:root, .a` came out prefixed                 | Only the exactly-bare forms pass through                                                    |
| `@keyframes` or `@font-face` collide across scopes            | Namespace the names yourself                                                                |
| Injected CSS truncated after a `content:` or `url()` value    | A `/*` inside the string literal opened a comment                                           |
| Passing `true` shipped uncompressed CSS                       | The third argument means "already compressed"                                               |
| `document.styleSheets` unchanged right after `addStyle`       | The flush is one frame away                                                                 |
| Theme flash on first paint                                    | Inject before first paint; the first flush lands a frame late                               |
| Test passes alone, fails inside the suite                     | `afterEach(() => destroyScope(id))` for every scope the test created                        |
| `ReferenceError: requestAnimationFrame` in tests              | Polyfill `requestAnimationFrame` **and** `cancelAnimationFrame` — teardown calls the second |
| `destroyScope` left a shadow host's styles behind             | Expected; use the per-style cleanups or drop the host                                       |
| Empty stylesheet still attached after removing every style    | Expected; only `destroyScope` detaches it                                                   |
| `cxLite` output contains `[object Object]` or `a,b`           | Switch to `cx`                                                                              |
| Duplicate class tokens in the output                          | Neither helper dedupes; clean the inputs                                                    |
| Heap grows across repeated mount/unmount                      | Every `addStyle` needs a matching cleanup, or the scope needs destroying                    |

## Knowledge Router

| Topic                                                                                                                           | File                         |
| ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `cx` / `cxLite` semantics and exact output, `compressCss` trade-offs and its two corruption cases                               | `knowledge/pure-utils.md`    |
| Scope rewriting rules and their failure modes, singleton keying, rAF batching, Shadow DOM, cleanup, diagnostics, test isolation | `knowledge/style-manager.md` |

## API Truth

Five exported symbols. Read shapes from `node_modules/@winglet/style-utils/dist/**/*.d.ts` and the README rather than guessing — but note the README's source links point at `./src/utils/styleManager/`, which does not exist (the real path is `./src/styleManager/`).

```typescript
import { cx, cxLite, compressCss } from '@winglet/style-utils/util';
import { styleManagerFactory, destroyScope } from '@winglet/style-utils/style-manager';
import { ... } from '@winglet/style-utils'; // barrel: all five
```

Prefer the narrowest sub-path — `/util` never pulls in the `StyleManager` class. The `StyleManager` class itself is internal; `styleManagerFactory` and `destroyScope` are the only supported way to reach it.
