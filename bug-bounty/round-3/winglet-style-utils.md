# @winglet/style-utils: bug bounty round 3

This round confirmed 8 new findings in `@winglet/style-utils`. Items in the earlier round documents ([round 1](../round-1/winglet-style-utils.md), [round 2](../round-2/winglet-style-utils.md)) were treated as fixed and excluded. The main session re-ran every probe. Verification limits are listed under the probes.

Probes: [probes/winglet-style-utils/](probes/winglet-style-utils/)

- From `r3-contracts`:
  - Probe folder in the working tree: `packages/winglet/style-utils/src/__bounty__/r3-contracts/`; the round copy is `bug-bounty/round-3/probes/winglet-style-utils/r3-contracts/`.
  - To run the copy: copy it back to `packages/winglet/style-utils/src/__bounty__/r3-contracts/` and run `yarn workspace @winglet/style-utils test --run src/__bounty__/r3-contracts/shadowDestroyDocs.test.ts`.
  - `shadowDestroyDocs.test.ts`, "the packaged knowledge matches the code: destroyScope cannot release a shadow-root scope", is the evidence for item 8: it asserts the packaged knowledge (`SKILL.md:32`, `:44` and `:66`, `knowledge/style-manager.md:162-164` and `:168`) and fails, because `destroyScope('r3docs', { shadowRoot })` removes the shadow root's style element (actual 0 elements, documented 1). The round 2 fix `3fde341db` changed `destroyScope.ts`, the README and the module documents but not `docs/agents`.
  - Failing tests that are not findings: none beyond that evidence.
  - Control tests that pass: none in this file.
  - Verification limits: None.
- From `r3-style-utils`:
  - Probe folder in the working tree: `packages/winglet/style-utils/src/__bounty__/r3-style-utils/` (`probes.test.ts`, `fuzz.test.ts`, `scale.test.ts`, `scaleSplit.test.ts`, `lifecycle.test.ts`). The round copy is `bug-bounty/round-3/probes/winglet-style-utils/r3-style-utils/`.
  - Item 8 is reproduced by the probe of r3-contracts: `packages/winglet/style-utils/src/__bounty__/r3-contracts/shadowDestroyDocs.test.ts`. Its round copy is `bug-bounty/round-3/probes/winglet-style-utils/r3-contracts/`.
  - To run the copies, copy each folder back to `packages/winglet/style-utils/src/__bounty__/<hunter id>/` and run `yarn workspace @winglet/style-utils test --run src/__bounty__/r3-style-utils/` and `yarn workspace @winglet/style-utils test --run src/__bounty__/r3-contracts/shadowDestroyDocs.test.ts`. To run a single test, add `-t "<test name>"`.
  - Failing tests that are not findings:
    - `probes.test.ts` "scopes an @media rule that follows a BOM like the same rule without it": rejected hypothesis.
    - `probes.test.ts` "keeps a @font-face that follows a BOM in the middle of a concatenated sheet": rejected hypothesis.
    - `fuzz.test.ts` "gives the same output with and without a leading BOM on 2000 seeded sheets": rejected hypothesis.
    - The reason for the three rejections: the scoper turns an at-rule that follows U+FEFF into a scoped selector. However, Chromium also drops an at-rule that follows U+FEFF when the style sheet arrives as a string, so the library does no worse than the browser.
    - `scale.test.ts` "handles many unquoted url() values before a comment in one block in linear time": measurement. When the input grows four times, the time grows thirteen times, and 98 KB with 4,000 unquoted `url()` values in one block takes 73 milliseconds. The cost comes from the `LAST_URL_OPEN` regular expression at `packages/winglet/style-utils/src/styleManager/StyleManager/utils/RuleScoper.ts:24`. Real style sheets do not put thousands of unquoted URLs between two structural characters.
    - `scale.test.ts` "handles a long selector list with sibling combinators in linear time": measurement. When the input grows four times, the time grows seventeen times, and one list of 1,000 `a + b` selectors takes 0.68 seconds. The cost comes from the backward scan of `packages/winglet/style-utils/src/utils/compressCss/utils/isInsideParens.ts:18-28`, as the diagnostic `scaleSplit.test.ts` "measures RuleScoper and compressCss separately" shows. Real selector lists are far shorter.
    - `scale.test.ts` "handles deeply nested grouping at-rules without a stack overflow": rejected hypothesis. The recursive scoper throws `RangeError` beyond about 5,000 nested grouping at-rules, which no real style sheet reaches.
  - Control tests that pass:
    - In `probes.test.ts`, the escaped-quote control, the statement-with-semicolon control, the snippet-parses-alone check, the `:root` control and both BOM controls pass.
    - In `fuzz.test.ts`, the postcss differential over 2,000 seeded sheets and the CRLF against LF comparison over 2,000 seeded sheets pass.
    - In `scale.test.ts`, the realistic-sheet growth test and the nesting-depth diagnostic pass.
    - The `scaleSplit.test.ts` diagnostic and all four tests in `lifecycle.test.ts` pass.
  - Verification limits:
    - The probes import the source entry `packages/winglet/style-utils/src/index.ts`, because the local `dist` is older than the source and does not contain `RuleScoper`.
    - Some claims rest on a browser check outside the probes. It ran in a real Chromium page (ego-browser on `about:blank`, with no repository files) and parsed each text with `CSSStyleSheet.replaceSync` and with a `<style>` element. These claims are:
      - item 1: the original text gives two rules, while the compressed output gives one rule with `content: ""`.
      - item 2: `@layer a, b` and `@import url("x.css")` are valid on their own without a semicolon, and the joined text gives zero rules.
      - item 4: the browser recovers from the unterminated string and keeps `.a { }` and `.b { color: red; }`.
      - item 5: `:ROOT` matches the root element, and `:root /* light */` parses as `:root`.
      - item 6: the original text gives two rules and the compressed output gives zero, and the scoped list parses as a single selector.
      - item 7: `margin: 1px/**/2px` is valid and reads as `1px 2px`, while `1px2px` is invalid.
      - the BOM rejection: Chromium keeps U+FEFF in string input.
    - Item 3 was not checked in Chromium. Its claim that the browser drops the rule rests on the Selectors Level 4 grammar only.

Root-cause files: `packages/winglet/style-utils/src/`

## 1. `compressCss` reads a backslash-escaped quote outside a string as the start of a string, then compresses the content of the next real string and deletes the rest of the style sheet from a `/*` inside it.

- Severity: medium. A consumer who compresses or injects Tailwind-style CSS loses every rule after the affected selector, gets a changed `content` value (`'a  b'` becomes `'a b'`), or loses a descendant combinator (`.a :is(...)` becomes `.a:is(...)`). Tailwind's arbitrary-value classes escape quotes this way: `content-['x']` becomes `.content-\[\'x\'\]`, and `bg-[url('a.png')]` is similar.
- Affected public API: `compressCss` (`@winglet/style-utils` and `@winglet/style-utils/util`), and `styleManagerFactory` when its third argument keeps the default value `false`, in both document mode and shadow root mode.
- Contract violated:
  - `packages/winglet/style-utils/src/utils/compressCss/DETAIL.md:9` says that quoted strings are copied byte for byte and that a `/*` inside them opens no comment.
  - `packages/winglet/style-utils/src/utils/compressCss/INTENT.md:26-27` lists two Never do rules: compression must not damage declaration values, and the output must not parse as a different rule set.
  - `packages/winglet/style-utils/docs/agents/skills/style-utils-skill/knowledge/pure-utils.md:35-37` says that quoted strings pass through untouched.
- Root cause:
  - `packages/winglet/style-utils/src/utils/compressCss/compressCss.ts:102-107` copies a backslash as an ordinary byte without consuming the byte after it, so `compressCss.ts:120` opens string mode at the escaped quote.
  - That false string ends at the opening quote of the next real string, whose content is then compressed as CSS, and the comment branch at `compressCss.ts:109-117` swallows everything after a `/*`.
  - `packages/winglet/style-utils/src/utils/compressCss/utils/isDeclarationColon.ts:32-33` is blind to escapes in the same way and removes the space before a pseudo-class in a selector. The scoper skips escapes correctly, so only the compression pass damages the text.
- Relation to earlier rounds: Same class as round 1 item 4 (`../round-1/winglet-style-utils.md` item 4, class 16: a single-pass scanner that ignores string context). This is the second round for the same function `compressCss` and the same class. This time the trigger is a backslash escape outside a string.
- Reopens an earlier fix: No. The string branch comes from `968812ab4` and `bae381980`, the fix for round 1 item 4, and the round 1 probe input still passes.
- Reproduction: `probes.test.ts`, in the describe block "compressCss: a backslash-escaped quote outside a string". Five tests fail:
  - "keeps the rules after a selector with an escaped quote and a "/*" string": the actual output is `.content-\[\'x\'\]::after { content: '`, and the expected output is `.content-\[\'x\'\]::after{content:'/*'}.b{color:red}`.
  - "keeps the string value after a selector with an escaped quote": the actual `content` value is `'a b'`, and the expected value is `'a  b'`.
  - "keeps every rule of a Tailwind-like sheet with arbitrary content values": the output stops at `--tw-content: '`, and `.p-4{padding:1rem}` is missing.
  - "styleManagerFactory keeps the rules after a selector with an escaped quote": the injected text is `.r3esc .content-\[\'x\'\]::after{ content: '`, and the expected text contains `.r3esc .b{color:red}`.
  - "keeps the descendant combinator when an escaped quote precedes a later string": the actual output is `.a:is(.content-\[\'x\'\]) { color: red; } .b { content: 'y;'; }`, and the expected output is `.a :is(.content-\[\'x\'\]){color:red}.b{content:'y;'}`.
  - The control "control: without an escaped quote the string value and the next rule survive" passes.
- Confidence: high, verified through the public API.

## 2. When the CSS of one style identifier ends with a statement at-rule that has no semicolon, the flush appends the next style identifier's CSS to that at-rule, and the rules of both identifiers disappear.

- Severity: medium. A consumer who injects a layer-order statement or an `@import` as its own style identifier, for example `addStyle('layers', '@layer reset, base')`, silently loses every component style injected after it into the same scope. Writing such a one-line statement without a trailing semicolon is common.
- Affected public API: `styleManagerFactory`, in document mode and with `{ shadowRoot }`.
- Contract violated:
  - `packages/winglet/style-utils/src/styleManager/StyleManager/DETAIL.md:23` says that a statement at-rule at the end of a sheet is copied unchanged to the end.
  - `packages/winglet/style-utils/docs/agents/skills/style-utils-skill/knowledge/style-manager.md:64` says that statements are copied unchanged even when no style rule follows.
  - The same document at `:155` and `:162` treats each style identifier as independently replaced and removed.
  - Injecting the same CSS as separate style identifiers should give the same rules as injecting it in one call.
- Root cause:
  - `packages/winglet/style-utils/src/styleManager/StyleManager/utils/RuleScoper.ts:112-115` copies a trailing statement at-rule unchanged, without the `;` that ends it.
  - `packages/winglet/style-utils/src/styleManager/StyleManager/StyleManager.ts:297-301` joins the processed CSS of every style identifier with `\n` only. The next identifier's text therefore continues the open at-rule's prelude, and its block becomes the at-rule's block.
  - In shadow root mode, `StyleManager.ts:285` skips scoping, so the raw text reaches the same join.
- Relation to earlier rounds: New class: each injected piece is valid on its own but breaks once the pieces are concatenated.
- Reopens an earlier fix: No. `RuleScoper.ts:113` comes from `d305fe8dc`, and the join comes from `1270b5b1d`.
- Reproduction: `probes.test.ts`, in the describe block "styleManagerFactory: a statement at-rule that ends one injected style". Three tests fail:
  - "an @layer statement without its semicolon does not swallow the next style": the injected text is `@layer reset,base\n.r3stmt .btn{color:red}`. postcss reads it as one at-rule whose parameters are `reset,base\n.r3stmt .btn` and whose block holds `color:red`. The expected result is the statement `@layer reset,base` and a separate rule `.r3stmt .btn{color:red}`.
  - "in a shadow root, an @layer statement without its semicolon does not swallow the next style": the actual rule list is `[]`, and the expected list is `['.btn{color:red}']`.
  - "an @import statement without its semicolon does not swallow the next style": the actual rule list is `[]`, and the expected list is `['.r3import .btn{color:red}']`.
  - The controls "control: with its semicolon, the next style keeps its rule" and "each snippet parses on its own, so the one-shot reading has the rule" pass.
- Confidence: high, verified through the public API, with the joined structure judged by postcss.

## 3. An empty member of a selector list, left by a trailing comma or a commented-out last selector, becomes the bare scope class, so a rule the browser would drop styles the scope container itself.

- Severity: medium. The styling is visibly wrong. For example, `.btn-primary,\n/* .btn-legacy */\n{ padding: 8px }` gives the whole widget container the padding. Without the library, the browser drops the rule and the typo is obvious. Commenting out the last selector of a list is a common edit.
- Affected public API: `styleManagerFactory` in document mode.
- Contract violated:
  - `packages/winglet/style-utils/docs/agents/skills/style-utils-skill/knowledge/style-manager.md:15` says that scoped CSS matches only inside an element that carries the scope class.
  - `packages/winglet/style-utils/src/styleManager/StyleManager/DETAIL.md:19` says that the scope prefix goes on each selector between top-level commas.
  - The Selectors Level 4 grammar ([https://www.w3.org/TR/selectors-4/#grammar](https://www.w3.org/TR/selectors-4/#grammar)) makes a list with an empty member invalid, so the browser drops the whole rule.
- Root cause:
  - `packages/winglet/style-utils/src/styleManager/StyleManager/utils/prefixSelectorList.ts:41`, `:44`, `:56` and `:72` pass an empty trimmed member to `prefixSelector`, and `packages/winglet/style-utils/src/styleManager/StyleManager/utils/prefixSelector.ts:9-10` returns `prefix + ''`, which is `.scope `.
  - A member that holds only a comment becomes `.scope /* … */`, which `compressCss` reduces to `.scope `.
  - A prelude that is empty as a whole is dropped by `RuleScoper.ts:237-240`, so only list members are affected.
- Relation to earlier rounds: Sibling of round 1 item 2 (`../round-1/winglet-style-utils.md` item 2). It is a boundary case of the selector-list splitting that the fix for that item added.
- Reopens an earlier fix: No. `prefixSelectorList` was introduced by `cd3dbc577`, the fix for round 1 item 2, and that item's input still passes.
- Reproduction: `probes.test.ts`, in the describe block "styleManagerFactory: an empty member of a selector list". Two tests fail:
  - "does not turn a trailing comma into a rule for the scope container": the actual output is `.r3trailcomma .a,.r3trailcomma{color:red}`.
  - "does not turn a commented-out last selector into the scope container itself": the actual output is `.r3emptysel .btn-primary,.r3emptysel {padding:8px}`.
  - In both tests, the expected output has no list member that is the bare scope class.
- Confidence: high, verified through the public API. The claim that the browser drops such a rule rests on the Selectors Level 4 grammar and was not checked in Chromium.

## 4. One string that lost its closing quote removes every rule of that `add` call, while the browser ends the string at the newline and applies the following rules.

- Severity: low. The input is a typo, but a consumer who misses one quote loses that rule and every later rule of the same style without any error, whereas the browser would recover.
- Affected public API: `styleManagerFactory` in document mode.
- Contract violated:
  - CSS Syntax Level 3, "consume a string token" ([https://www.w3.org/TR/css-syntax-3/#consume-string-token](https://www.w3.org/TR/css-syntax-3/#consume-string-token)): a newline ends the string as a bad string, and parsing continues.
  - `packages/winglet/style-utils/src/styleManager/StyleManager/DETAIL.md:46` says that strings must not make the scoper lose rules.
- Root cause: `packages/winglet/style-utils/src/styleManager/StyleManager/utils/skipOpaqueToken.ts:32-39` (`findQuoteEnd`) ignores newlines and runs to the closing quote or to the end of the text. `packages/winglet/style-utils/src/styleManager/StyleManager/utils/RuleScoper.ts:150-154` then finds no closing `}` and drops that rule and everything after it.
- Relation to earlier rounds: Same class as round 1 item 4 (`../round-1/winglet-style-utils.md` item 4, class 16: a scanner that misreads string context), in the scoper rather than in `compressCss`.
- Reopens an earlier fix: No.
- Reproduction: `probes.test.ts`, test "keeps the rule after a declaration whose string lost its closing quote". The injected text is the empty string, and the expected text contains `.r3badstr .b`.
- Confidence: high, verified through the public API. The browser's recovery rests on the Chromium check.

## 5. `:ROOT` and `:root /* comment */` are not recognized as `:root`, so they receive the scope prefix and global CSS variables stop applying.

- Severity: low. These spellings are rare, but a consumer who writes the theme block either way loses every global variable, and every scope that reads `var(--…)` falls back to its default.
- Affected public API: `styleManagerFactory` in document mode.
- Contract violated:
  - `packages/winglet/style-utils/src/styleManager/StyleManager/DETAIL.md:19` says that a selector that is exactly `:root` stays unprefixed.
  - `packages/winglet/style-utils/docs/agents/skills/style-utils-skill/knowledge/style-manager.md:35` says that theme variables depend on the `:root` exception.
  - Selectors Level 4, case sensitivity ([https://www.w3.org/TR/selectors-4/#case-sensitive](https://www.w3.org/TR/selectors-4/#case-sensitive)), makes pseudo-class names ASCII case-insensitive.
- Root cause: `packages/winglet/style-utils/src/styleManager/StyleManager/utils/prefixSelector.ts:10` compares the trimmed text, comments included, with exactly `':root'` and `':host'`.
- Relation to earlier rounds: New instance of the spelling-variant class (round 2 class 3, `../round-2/README.md`) in a different function.
- Reopens an earlier fix: No.
- Reproduction: `probes.test.ts`, in the describe block "styleManagerFactory: spelling variants of :root". Two tests fail:
  - "treats :ROOT like :root (pseudo-class names are ASCII case-insensitive)": the actual output is `.r3rootcase :ROOT{--bg:#fff}`, and the expected output is `:ROOT{--bg:#fff}`.
  - "treats ":root /* light theme */" like :root": the actual output is `.r3rootcomment :root{--bg:#fff}`, and the expected output has no scope prefix.
  - The control "control: :root keeps no prefix" passes.
- Confidence: high, verified through the public API. The equivalence of the two spellings rests on the Chromium check.

## 6. An escaped space at the end of a selector (`\ `) is removed, so the remaining backslash escapes the following `{` or `,`.

- Severity: low. HTML class names cannot contain spaces, so the input is rare, but the damage spreads to the next rule or the next selector. `compressCss` loses the rule and the rule after it. The scoper merges a selector list into one selector, so the later selector (`.b`) loses its rule.
- Affected public API: `compressCss` and `styleManagerFactory`.
- Contract violated:
  - `packages/winglet/style-utils/src/utils/compressCss/INTENT.md:27` says that the output must not parse as a different rule set.
  - `packages/winglet/style-utils/src/styleManager/StyleManager/DETAIL.md:16` and `:19` say that only commas outside escapes split the list and that each selector receives the prefix.
- Root cause:
  - `packages/winglet/style-utils/src/utils/compressCss/compressCss.ts:145-176` removes the space before `{` or `,` even when a backslash precedes it.
  - `packages/winglet/style-utils/src/styleManager/StyleManager/utils/prefixSelectorList.ts:41`, `:44`, `:56` and `:72`, and `packages/winglet/style-utils/src/styleManager/StyleManager/utils/RuleScoper.ts:237`, call `.trim()`, which removes the escaped trailing space.
- Relation to earlier rounds: Same class as round 1 item 4 (`../round-1/winglet-style-utils.md` item 4, class 16: a scanner that ignores escape context).
- Reopens an earlier fix: No.
- Reproduction: `probes.test.ts`, in the describe block "escaped whitespace at the end of a selector". Two tests fail:
  - "compressCss keeps an escaped space that ends a selector": the actual output is `.a\{color:red}.b{color:blue}`, and the expected output is `.a\ {color:red}.b{color:blue}`.
  - "styleManagerFactory keeps an escaped space that ends a selector": this test passes `true` as the third argument, which skips compression and isolates the scoper. The actual output is `.r3escspace .a\,.r3escspace .b{color:red}`, and the expected output is `.r3escspace .a\ ,.r3escspace .b{color:red}`.
- Confidence: high, verified through the public API. The change in the number of rules rests on the Chromium check.

## 7. `compressCss` deletes a comment that is the only separator between two tokens and glues the tokens together, so `1px/**/2px` becomes `1px2px`.

- Severity: low. The input is rare, but a consumer who puts a comment without spaces between value tokens silently loses the declaration.
- Affected public API: `compressCss` and `styleManagerFactory`.
- Contract violated:
  - `packages/winglet/style-utils/src/utils/compressCss/INTENT.md:27`.
  - CSS Syntax Level 3, "consume comments" ([https://www.w3.org/TR/css-syntax-3/#consume-comment](https://www.w3.org/TR/css-syntax-3/#consume-comment)): comments are consumed between tokens, so a comment separates the tokens on either side of it.
- Root cause: `packages/winglet/style-utils/src/utils/compressCss/compressCss.ts:109-117` deletes the comment without leaving a separating space when nothing else separates the two tokens.
- Relation to earlier rounds: New class.
- Reopens an earlier fix: No.
- Reproduction: `probes.test.ts`, test "does not glue two dimensions into one token". The actual output is `.a{margin:1px2px}`, and the expected output does not contain `1px2px`.
- Confidence: high, verified through the public API. The validity of the two forms rests on the Chromium check.

## 8. The packaged agent documents and the specification say that `destroyScope` cannot release a shadow root scope, but since the round 2 fix `destroyScope(id, { shadowRoot })` releases it.

- Severity: low. An agent or a consumer who reads only the packaged documents does not learn the public way to release a shadow root scope, expects the host's styles to stay after the call, and believes in a key structure (a string key stored under a `Symbol`) that no longer exists. The alternatives that the documents recommend, per-style cleanup functions and host garbage collection, still work.
- Affected public API: `destroyScope` and `styleManagerFactory` (as documented).
- Contract violated:
  - The stale statements are `packages/winglet/style-utils/docs/agents/skills/style-utils-skill/SKILL.md:44` and `:66`, `packages/winglet/style-utils/docs/agents/skills/style-utils-skill/knowledge/style-manager.md:121`, `:162-164` and `:168`, `packages/winglet/style-utils/docs/en/SPECIFICATION.md:206-220`, and `packages/winglet/style-utils/docs/ko/SPECIFICATION.md:220`.
  - They contradict the code at `packages/winglet/style-utils/src/styleManager/destroyScope.ts:27-34` and the README at `packages/winglet/style-utils/README.md:321` and `:527`.
  - Principles 3 and 6 of `DOCUMENTATION.md` require documents to state the current behavior.
- Root cause: The fix for round 2 item 1, commit `3fde341db`, updated the README and the module documents (`DETAIL.md`) only, so the packaged agent documents and both specifications still describe the old behavior.
- Relation to earlier rounds: Same class as round 1 class 19 (documented behavior that does not match the code, `../round-1/README.md`). It is left over from the fix for round 2 item 1 (`../round-2/winglet-style-utils.md` item 1).
- Reopens an earlier fix: No. The fix is incomplete in its documents, and the code fix still holds.
- Reproduction: the r3-contracts probe `packages/winglet/style-utils/src/__bounty__/r3-contracts/shadowDestroyDocs.test.ts`, test "the packaged knowledge matches the code: destroyScope cannot release a shadow-root scope". The documented result is one `<style>` element left in the shadow root after `destroyScope('r3docs', { shadowRoot })`, and the actual result is zero.
- Confidence: high, verified through the public API.

## Hypotheses checked and not bugs

- From `r3-style-utils`:
  - Over 2,000 valid seeded sheets, the scoper matches a postcss-based reference scoper byte for byte. The sheets contain nested `@media`, `@supports`, `@container` and `@layer` up to depth three, strings with braces, comments, quoted URLs with braces, `:root` in lists, `@keyframes` and `@font-face`.
  - CRLF and LF spellings of 2,000 seeded sheets give identical injected text.
  - `compressCss` leaves a form feed in place. CSS still reads it as whitespace, so only the amount of compression differs.
  - A byte order mark before an at-rule is rejected as a finding: Chromium also drops an at-rule that follows U+FEFF in string input. A byte order mark before a style rule is removed by the scoper, which is more lenient than the browser.
  - `destroyScope` called between `add` and the flush, or from a frame callback queued before the flush, cancels the pending flush, and only the CSS of the new factory is injected.
  - Calling the same cleanup function twice leaves the other styles of the scope intact.
  - Two copies of the package keep separate registries, so `destroyScope` from one copy leaves the other copy's style element in place. This matches the module-level registry that the documents describe.
  - A realistic style sheet is scoped and compressed in linear time. The super-linear cases that were measured need thousands of unquoted URLs in one block or a list of thousands of sibling-combinator selectors.
  - The recursive scoper handles up to about 5,000 nested grouping at-rules.

## Open leads

- From `r3-style-utils`:
  - A shadow root that belongs to another document, such as one inside a same-origin iframe, probably cannot adopt the `CSSStyleSheet` that `StyleManager.ts:312` constructs in the main window. In browsers, the assignment at `StyleManager.ts:319` would then throw `NotAllowedError` outside the `try` block, inside the frame callback, and leave `__sheet__` set but never adopted, so later flushes would succeed silently with no styles applied. jsdom has no constructable style sheets, so this was not reproduced.
