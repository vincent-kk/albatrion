# Hunting angles

An angle is a way to reach behavior that the existing tests do not pin. Plans and round READMEs refer to angles by id, which is how a later round tells which angles an area already used. Add a new angle with the next free id; never renumber one.

## Equivalence checks

Most consequential findings so far broke a rule of the form "these two must behave the same". Generate many inputs with a fixed seed and compare both sides.

- `EQ1` Authored indirection against its inlined form: a `$ref` or `$defs` target against the same schema inline, and one template referenced twice against two copies.
- `EQ2` Write shapes against each other: a same-length array write against a length-changing one; root `setValue`, node `setValue`, an item write, `controls.derived`, and `reset` against each other.
- `EQ3` Module copies: the ESM entry against the CommonJS entry, and two loaded copies of a package against one.
- `EQ4` A light DOM root against a shadow DOM root.
- `EQ5` React lifecycles against a plain mount: `<Activity>` hidden then shown, StrictMode, a Suspense re-suspend, `renderToString` followed by `hydrateRoot`, and React 18 against React 19.
- `EQ6` One-shot against incremental processing (hashes, batches, streams).
- `EQ7` This package against an installed reference implementation (`lodash`, `es-toolkit`, `fast-json-patch`, `dataloader`, `clsx`, `postcss`, plain `ajv`).
- `EQ8` Spelling variants of the same thing: a URI with and without an empty `#`, NFC against NFD, letter case, a BOM, CRLF against LF, percent-encoded against raw.
- `EQ9` A CLI's plain output against its `--json` output.
- `EQ10` Composed operations against the same calls made one by one: a `batch` or transaction against sequential calls, a bulk API against a loop, one injected sheet against separate injections, a nested call against a flat one.
- `EQ11` Sibling implementations of one contract against each other: the same schema and user action in every UI plugin, the same schema and data in every AJV plugin, the same input through every entry point of one behavior.

## Boundaries and scale

- `BS1` Depth (10,000-level nesting, recursive schemas), width (10,000 keys or items), and long strings for regular expressions.
- `BS2` Numbers: `-0`, `NaN`, `Infinity`, `1e21`, `Number.MAX_SAFE_INTEGER`, `BigInt`.
- `BS3` Names: `__proto__`, `constructor`, `%`, `~`, `/`, `*`, `.`, `..`, `@`, spaces, the empty string, non-Latin text, emoji.
- `BS4` Lexical context: escapes, quotes, comments, nested delimiters, and token boundaries inside text that a scanner or parser reads (CSS, expressions, JSON Pointers, URIs, Markdown block markers).

## Lifecycle and concurrency

- `LC1` Async results that resolve out of order or are overtaken by `reset`, unmount, or a schema change.
- `LC2` Reentrancy: a callback that calls back into the API, and a subscriber that throws.
- `LC3` Registrations released in an effect cleanup, and handles captured once (`ref.current`).
- `LC4` Cleanup completeness after unmount or destroy: listeners, timers, styles, registries, caches.

## Failure paths

- `FP1` A dependency that throws synchronously, rejects, or returns malformed data.
- `FP2` Partial failure in the middle of a batch (for example a permission error on one file): whether the report stays honest, and whether the run is atomic as documented.
- `FP3` Failures that a cache keeps.
- `FP4` Recovery: a failing call followed by a valid one, against the valid call alone. The failure surfaces exactly once, and nothing it left behind changes later results.

## Contracts and release artifacts

- `CA1` Every documented example and configuration, executed literally.
- `CA2` Documents against code: README, `docs/en/SPECIFICATION.md`, `docs/agents/**` knowledge, JSDoc, `INTENT.md` and `DETAIL.md`.
- `CA3` Release artifacts: every `exports` target and condition, ESM and CommonJS export-name parity, `sideEffects`, declarations type-checked with `skipLibCheck: false` and without `@types/node`, peer ranges against dependency ranges and the APIs actually used, production builds (`test:production`), and changesets against the intended versions.

## Integration

- `IN1` Packages that consume each other: `@canard/schema-form` with its plugins, `@lerx/promise-modal` with `@winglet/style-utils`, and every consumer of `@winglet/common-utils`.
- `IN2` Host environments: shadow roots, other realms (iframes, `vm`), several providers on one page, and micro-frontends that load more than one bundle.
- `IN3` Identifiers that must stay unique per instance: DOM ids and names, registry keys, symbols, storage keys, and class identity, with two instances on one page, two copies in one realm, and one instance nested in another (a form in a portal inside a form).

## Earlier fixes

- `RG1` Neighbors of earlier fixes: for each fix that the area's `FIXES.md` files list, the inputs next to the fixed one, the other entry points and surfaces of the same behavior (terminal and plain output, sibling plugins, documents), and the code paths that share the changed helper.
