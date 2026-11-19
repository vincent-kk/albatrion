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

A single pass over shared CSS token positions and grammar context. It collapses whitespace runs, strips comment contents, retaining `/**/` where adjacent CSS tokens need a boundary, and drops semicolons made redundant by a following `}`. It performs **no semantic optimization** — duplicate declarations, empty rules, and long hex colors all survive untouched:

```typescript
compressCss('.a { color: red; color: blue; }'); // '.a{color:red;color:blue}'
compressCss('.a { }'); // '.a{}'
compressCss('.a { color: #ffffff; }'); // '.a{color:#ffffff}'
```

That is the intended scope: it is a runtime whitespace pass sized for CSS you assemble in the browser, not a replacement for a build-time minifier. Reach for cssnano or lightningcss when you want real minification.

### Quoted strings pass through untouched

A single- or double-quoted string, backslash escapes included, is copied byte for byte, so comment markers and spacing inside it survive:

```typescript
compressCss('.a::before { content: "/*"; color: red; }'); // '.a::before{content:"/*";color:red}'
compressCss('.a { background: url("a/*b.png"); }'); // '.a{background:url("a/*b.png")}'
```

An unquoted `url(…)` is copied verbatim too, so a `/*` inside it opens no comment:

```typescript
compressCss('.a { background: url(a/*b.png); }'); // '.a{background:url(a/*b.png)}'
```

### A comment ending a block leaves one orphan space

When a comment is the last thing before `}`, the whitespace collapser emits a separator for it and then the comment is removed, stranding the space:

```typescript
compressCss('.a {\n  color: red; /* note */\n}'); // '.a{color:red }'
```

The artifact is locked by `src/utils/compressCss/__tests__/compress.test.ts:160`, whose input happens to end its block with a comment. Both that test and the `compressCss` JSDoc frame the space as a media-query quirk, and the JSDoc goes further — it ships an example asserting that `@media (max-width: 768px) { .container { padding: 0 16px; } }` returns `…{padding:0 16px }}`. It does not; without the trailing comment that input compresses cleanly. Since that JSDoc travels into `dist/*.d.ts`, an agent reading the declarations will carry the wrong rule. The trigger is a comment at the end of a block, in any context. Browsers parse the extra space correctly, so treat it as cosmetic; a `replace(/\s+\}/g, '}')` post-pass removes it at the cost of a second walk.

### Whitespace that carries meaning is kept

Three kinds of whitespace survive because removing them changes what the CSS means:

```typescript
compressCss('@supports (a: b) and (c: d) { .a { b: c; } }');
// '@supports (a:b) and (c:d){.a{b:c}}'       ← space between an identifier and `(`
compressCss('.a { width: calc(100% + 10px); }'); // '.a{width:calc(100% + 10px)}'
compressCss('.scope :hover { color: red; }'); // '.scope :hover{color:red}'
compressCss('.a { color : red; }'); // '.a{color:red}'
```

Existing whitespace around `+` and `-` stays in declaration values and at-rule preludes, inside or outside parentheses: a custom property can later be substituted into `calc()`. Selector combinators may lose surrounding whitespace only when the selector context proves that meaning stays the same; An+B boundaries in `:nth-child()` stay intact. Descendant spaces around attribute selectors or after selector functions remain significant. A colon loses separator whitespace only in declaration context; `.scope :hover` and `.scope:hover` remain different selectors, and `.a: hover` is not repaired into `.a:hover`. Custom-property token spacing, including a whitespace-only value, is preserved for substitution. Comment removal retains an empty comment whenever it would merge or split tokens, including CDO/CDC and attribute-match boundaries.

## Related

- `style-manager.md` — how `compressCss` is invoked during style injection, and the third-argument trap that decides whether it runs at all
