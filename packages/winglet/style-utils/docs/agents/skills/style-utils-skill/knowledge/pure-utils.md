# Pure Utilities — `cx`, `cxLite`, `compressCss`

Three stateless string functions. Nothing here touches the DOM or the style registry.

## `cx` vs `cxLite`

Both take `...args`, drop falsy entries, and join the survivors with single spaces. The difference is depth: `cx` recurses into arrays and reads object keys; `cxLite` does neither — it concatenates whatever survives the truthiness check.

```typescript
cx('btn', { active: true, off: false }, ['x', ['y']]); // 'btn active x y'
cxLite('btn', { active: true }); // 'btn [object Object]'   ← implicit toString()
cxLite('btn', ['a', 'b']); // 'btn a,b'          ← Array#toString(), comma-joined
```

`cxLite`'s output for objects and arrays is never valid — the tokens land in the DOM verbatim. It is not a "degraded" mode to fall back on; it is a different function that assumes flat inputs. Reach for it only when a measured hot path justifies skipping the recursion, and only when the inputs are provably flat.

Shared behavior worth knowing:

- **No deduplication, no sorting.** `cx('btn', 'btn', 'a')` → `'btn btn a'`; insertion order is preserved exactly.
- **`0` is dropped, other numbers are stringified.** `cx('btn', 0, 1)` → `'btn 1'`. Falsiness is checked before conversion, so a legitimate `0` class token is unreachable.
- **`cx` reads object values for truthiness only — it does not walk them.** `cx({ a: { b: true } })` → `'a'`, not `'b'`. Nesting works through arrays, not through object values.

## `compressCss`

A single-pass byte walk over the UTF-8 encoding of the input. It collapses whitespace runs, strips `/* … */` comments, and drops semicolons made redundant by a following `}`. It performs **no semantic optimization** — duplicate declarations, empty rules, and long hex colors all survive untouched:

```typescript
compressCss('.a { color: red; color: blue; }'); // '.a{color:red;color:blue}'
compressCss('.a { }'); // '.a{}'
compressCss('.a { color: #ffffff; }'); // '.a{color:#ffffff}'
```

That is the intended scope: it is a runtime whitespace pass sized for CSS you assemble in the browser, not a replacement for a build-time minifier. Reach for cssnano or lightningcss when you want real minification.

### Block-comment markers inside string literals corrupt the output

The comment scanner has no notion of CSS string literals, so a `/*` inside a quoted value opens a comment that swallows everything up to the next `*/` — or to the end of the input if there is none:

```typescript
compressCss('.a::before { content: "/*"; color: red; }');
// '.a::before{content:"'          ← rest of the stylesheet consumed
compressCss('.a::before { content: "/* hi */"; color: red; }');
// '.a::before{content:"";color:red}'  ← literal silently emptied
compressCss('.a { background: url("a/*b.png"); }');
// '.a{background:url("a'          ← same failure through a URL
```

This is data loss, not a cosmetic artifact, and it is silent. Escape the marker in the source (`content: "\\2f* … *\\2f"`) or keep block-comment bytes out of CSS string values. It also applies transitively to `styleManagerFactory`, which runs this pass on every `add` unless told the input is already compressed.

### A comment ending a block leaves one orphan space

When a comment is the last thing before `}`, the whitespace collapser emits a separator for it and then the comment is removed, stranding the space:

```typescript
compressCss('.a {\n  color: red; /* note */\n}'); // '.a{color:red }'
```

The artifact is locked by `src/utils/compressCss/__tests__/compress.test.ts:160`, whose input happens to end its block with a comment. Both that test and the `compressCss` JSDoc frame the space as a media-query quirk, and the JSDoc goes further — it ships an example asserting that `@media (max-width: 768px) { .container { padding: 0 16px; } }` returns `…{padding:0 16px }}`. It does not; without the trailing comment that input compresses cleanly. Since that JSDoc travels into `dist/*.d.ts`, an agent reading the declarations will carry the wrong rule. The trigger is a comment at the end of a block, in any context. Browsers parse the extra space correctly, so treat it as cosmetic; a `replace(/\s+\}/g, '}')` post-pass removes it at the cost of a second walk.

### Space before `(` is preserved; space before `:` is not

Whitespace between an identifier and `(` survives, because dropping it would break at-rule preludes and function-like syntax:

```typescript
compressCss('@supports (a: b) and (c: d) { .a { b: c; } }');
// '@supports (a:b) and (c:d){.a{b:c}}'
compressCss('.a { width: calc(100% - 10px); }'); // '.a{width:calc(100% - 10px)}'
```

The mirror image is not safe: `:` is treated as punctuation that never needs a leading space, so a descendant combinator in front of a pseudo-selector is destroyed — `.scope :hover` compresses to `.scope:hover`, which selects a different element. Nothing in `compressCss` can distinguish the two, which is why the style manager's scope prefixing has a matching failure case (see `style-manager.md`).

## Related

- `style-manager.md` — how `compressCss` is invoked during style injection, and the third-argument trap that decides whether it runs at all
