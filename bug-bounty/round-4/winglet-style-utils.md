# @winglet/style-utils: bug bounty round 4

This round confirmed 4 new findings in `@winglet/style-utils`, all low. Items in the earlier round documents ([round 1](../round-1/winglet-style-utils.md), [round 2](../round-2/winglet-style-utils.md), [round 3](../round-3/winglet-style-utils.md)) were treated as fixed and excluded. The main session re-ran every probe: the `r4-json-style` folder ran 15 tests, 8 fail (6 are the findings and 2 are diagnostics), and 7 pass; the `r4-contracts` folder ran 2 tests, of which 1 fails and 1 control passes.

Probes: [probes/winglet-style-utils/](probes/winglet-style-utils/)

- From `r4-json-style`:
  - Probe folder in the working tree: `packages/winglet/style-utils/src/__bounty__/r4-json-style/`; the round copy is `bug-bounty/round-4/probes/winglet-style-utils/r4-json-style/`.
  - To run the copy: copy it back to `packages/winglet/style-utils/src/__bounty__/r4-json-style/` and run `yarn workspace @winglet/style-utils test --run src/__bounty__/r4-json-style/`.
  - No probe-local configuration is needed, because the package source imports no other workspace package.
  - `oracle.ts` holds the shared helpers:
    - a seeded generator;
    - token comparisons built on the CSS Syntax Level 3 tokenizer `@csstools/css-tokenizer` 3.0.4, installed at the repository root;
    - a token-level reference scoper.
  - Failing tests that are not findings: `scoperFuzz.r4.test.ts` `SF2` and `SF3` are diagnostics.
    - They fail only on the shapes of items 2 and 3.
    - With those shapes left out of the generator, `SF2b` (6,000 sheets compressed) and `SF3b` (6,000 scoped sheets compressed) pass.
  - Control tests that pass:
    - In `publicApi.r4.test.ts`: `SA0`, `SD0` and `SB0`.
    - In `scoperFuzz.r4.test.ts`: `SF1`, `SF2b` and `SF3b`.
    - In `diag.r4.test.ts`: `D1`.
  - Verification limits:
    - jsdom has no constructable style sheets, so the style manager probes exercise the `<style>` element path.
    - The behavior of the joined text in a real browser was not checked in Chromium; item 1 rests on the CSS Syntax Level 3 token stream.
- From `r4-contracts`:
  - Probe folder in the working tree: `packages/winglet/style-utils/src/__bounty__/r4-contracts/`; the round copy is `bug-bounty/round-4/probes/winglet-style-utils/r4-contracts/`.
  - To run the copy: copy it back to `packages/winglet/style-utils/src/__bounty__/r4-contracts/` and run `yarn workspace @winglet/style-utils test --run src/__bounty__/r4-contracts/documentedImports.test.ts`. No probe-local configuration is needed.
  - Failing tests that are not findings: none. The failing test reproduces item 4.
  - Control tests that pass: "control: every name the English README imports from the root is exported".

Root-cause files: `packages/winglet/style-utils/src/` for items 1 to 3; `packages/winglet/style-utils/README-ko_kr.md` for item 4.

## 1. In shadow root mode, a style identifier whose CSS ends inside an unclosed block or comment swallows the rules of every style identifier injected after it.

- Severity: low. The trigger is a typo, such as a missing final `}`, but the damage silently spreads to other style identifiers.
  - Example: a custom element calls `addStyle('a', '.a { color: red; ')` and then `addStyle('b', '.b { color: blue; }')`.
  - `.b` is no longer a top-level rule. A browser with CSS nesting reads it as `.a .b`; a browser without nesting drops it.
  - Injected alone, or in document mode, `.b` survives.
- Affected public API: `styleManagerFactory(scopeId, { shadowRoot })`. With the third argument `true`, which skips compression, an unclosed comment has the same effect.
- Contract violated:
  - `packages/winglet/style-utils/src/styleManager/StyleManager/DETAIL.md:23` states that joining several style identifiers keeps the boundary to the next identifier, in Shadow DOM as well.
  - `packages/winglet/style-utils/docs/agents/skills/style-utils-skill/knowledge/style-manager.md:155` and `:162` treat each style identifier as replaced and removed on its own.
  - Predictability: injecting the same CSS as separate sheets keeps `.b`.
- Root cause:
  - `packages/winglet/style-utils/src/styleManager/StyleManager/StyleManager.ts:301-303` joins the processed CSS of every style identifier with `\n` only.
  - `terminateStatement` supplies a missing semicolon only for a trailing statement at-rule.
  - `StyleManager.ts:286` skips the scoper in shadow root mode. The scoper drops an unterminated rule in document mode, but in shadow root mode that rule reaches the join unchanged.
- Relation to earlier rounds: Sibling of [round 3 item 2](../round-3/winglet-style-utils.md). Both belong to the class of composed operations that differ from the same calls made one by one: one joined sheet against separate injections.
- Reopens an earlier fix: No. `git log -L` on the join shows `b94b54301` (round 3 item 2) and `1270b5b1d`. That fix covered statement at-rules, and its input still passes.
- Reproduction: `publicApi.r4.test.ts`, describe block "styleManagerFactory: one style id with an unclosed block".
  - `SB1`: the injected text is `.a{color:red;\n.b{color:blue}`, and its only top-level rule is `.a`. Expected: the top-level rules include `.b`.
  - `SB2`: with compression skipped, `.a{color:red}/* todo` swallows `.b{color:blue}` the same way.
  - The control `SB0` passes: in document mode the scoper drops the unclosed rule, and `.r4unclosedDoc .b` stays a top-level rule.
- Confidence: high; public API in jsdom, with the top-level rules read from the CSS Syntax Level 3 token stream.

## 2. `compressCss` deletes a comment that is the only boundary right after a CSS escape, so it joins two tokens into one.

- Severity: low. The input is rare, but the output parses as a different rule set.
  - `.h\31/**/x` is an invalid selector that the browser drops. It becomes `.h\31x`, which is the class `h1x`.
  - `\31/**/2px` becomes `\312px`, which is U+0312 followed by `px`.
  - `.md\:/**/flex` becomes the single name `md:flex`.
- Affected public API: `compressCss` (`@winglet/style-utils` and `@winglet/style-utils/util`), and `styleManagerFactory` when its third argument keeps the default value `false`.
- Contract violated:
  - `packages/winglet/style-utils/src/utils/compressCss/DETAIL.md:6` and the acceptance criterion at `:29` say that an empty comment is kept where adjacent tokens would otherwise join.
  - `packages/winglet/style-utils/src/utils/compressCss/INTENT.md:27` says that the output must not parse as a different rule set.
- Root cause:
  - `packages/winglet/style-utils/src/utils/compressCss/compressCss.ts:148` and `:154` set `lastByte` to `0` after an escape.
  - The boundary rule at `compressCss.ts:121` keeps `/**/` only when `lastByte > SPACE`, so it never fires after an escape.
- Relation to earlier rounds: Sibling of [round 3 item 7](../round-3/winglet-style-utils.md): a fix that left a case out while its contract stands. It also belongs to the class of scanners that ignore escapes or token boundaries.
- Reopens an earlier fix: No.
  - `git log -L` shows that `lastByte = 0` came from `0e5bfc67a` (round 3 items 1 and 6) and the boundary rule from `7c232489f` (round 3 item 7).
  - The input of round 3 item 7, `1px/**/2px`, still passes.
- Reproduction: `publicApi.r4.test.ts`, describe block "compressCss: a comment that is the only boundary right after a CSS escape".
  - `SA1`: the tokens of `.h\31/**/x{color:red}` change from the names `h1` and `x` to the single name `h1x`.
  - `SA2`: the tokens of `margin:\31/**/2px` change from the name `1` and the dimension `2px` to the single name U+0312 `px`.
  - `SA3`: the names `md:` and `flex` become `md:flex`.
  - Expected in each case: the same token stream as the input.
  - The control `SA0` passes: after a plain letter the comment is kept as `/**/`.
- Confidence: high; public API, with the token streams compared by `@csstools/css-tokenizer` 3.0.4.

## 3. `compressCss` counts a `)` inside a string as a closing parenthesis, so it removes the spaces that `calc()` needs around `+`.

- Severity: low. The input is rare, but the declaration becomes invalid: `.a{width:calc(var(--a, ")") + 2px)}` compresses to `.a{width:calc(var(--a,")")+2px)}`.
- Affected public API: `compressCss`, and `styleManagerFactory` when its third argument keeps the default value `false`.
- Contract violated:
  - `packages/winglet/style-utils/src/utils/compressCss/DETAIL.md:19` and the acceptance criterion at `:37` keep the spaces around `+` inside parentheses.
  - `packages/winglet/style-utils/src/utils/compressCss/INTENT.md:27`.
- Root cause: `packages/winglet/style-utils/src/utils/compressCss/utils/isInsideParens.ts:14-27` scans the output backward without skipping strings or escapes.
  - A `)` inside a string raises the depth, so the scan decides that the `+` is outside parentheses.
  - A `;`, `{` or `}` inside a string ends the scan the same way.
  - The caller is `compressCss.ts:249`.
- Relation to earlier rounds:
  - Same function as [round 1 item 3](../round-1/winglet-style-utils.md). It belongs to the class of scanners that ignore string context (round 1 class 16, round 3 class 28).
  - The `compressCss` string context is on the second-round watch list, after [round 1 item 4](../round-1/winglet-style-utils.md) and [round 3 item 1](../round-3/winglet-style-utils.md), and this is its third round.
- Reopens an earlier fix: No. `git log -L` shows `e0382d335` (round 1 item 3), and that fix's input `calc(1px + 2px)` still passes.
- Reproduction: `publicApi.r4.test.ts`, `SD1`: the output is `.a{width:calc(var(--a,")")+2px)}`, and the expected output contains ` + 2px`. The control `SD0`, the same declaration without the string, passes.
- Confidence: high; public API.

## 4. The Korean README imports `StyleManager` from the package root in three examples, but the root does not export it, and the English README no longer shows that import.

- Severity: low. This is documentation that drifted from its source. A Korean reader who copies the "StyleManager" and "Shadow DOM" examples gets a module link error, and `StyleManager.get(...)` does not exist.
- Affected public API: the `@winglet/style-utils` root.
- Contract violated:
  - `packages/winglet/style-utils/src/index.ts:1` exports `styleManagerFactory` and `destroyScope`, not `StyleManager`.
  - `DOCUMENTATION.md` principle 4: a translation keeps its source's structure and changes with it in the same pull request.
- Root cause: `packages/winglet/style-utils/README-ko_kr.md:194`, `:253` and `:323` still import `StyleManager` from the root in examples that the English README dropped.
- Relation to earlier rounds: Same class as [round 3 item 8](../round-3/winglet-style-utils.md), a document that a change did not update (round 3 class 27).
- Reopens an earlier fix: No. `git log -L` on `packages/winglet/style-utils/README-ko_kr.md:194` shows only `d4f44aa2f`.
- Reproduction: `packages/winglet/style-utils/src/__bounty__/r4-contracts/documentedImports.test.ts`, "every name the Korean README imports from the root is exported": actual `['StyleManager']`; expected `[]`. The control "control: every name the English README imports from the root is exported" passes.
- Confidence: high; public API, checked against the source entry `packages/winglet/style-utils/src/index.ts`.

## Hypotheses checked and not bugs

- From `r4-json-style`:
  - The scoper matches a token-level reference scoper on 3,000 seeded sheets (`SF1`).
    - The sheets include hex escapes with space, CRLF, tab and form-feed terminators, and escaped spellings of `:root` and `:host`.
    - They also include comments inside selector lists, and quoted and unquoted `url()` with `;` and `/*` inside.
    - They also include escaped `url` names, nested grouping at-rules, `@scope`, and statement at-rules.
  - `compressCss` keeps the token stream and the selector preludes of 6,000 seeded sheets, and of 6,000 scoped sheets, once the shapes of items 2 and 3 are left out (`SF2b` and `SF3b`).
  - The output of the example at `docs/en/SPECIFICATION.md:72` lacks the single space that a comment at the end of a block leaves. This is a cosmetic documentation slip that changes nothing a reader does.
  - The wrong trailing space in the `@media` example of the `compressCss` JSDoc is already admitted in `docs/agents/skills/style-utils-skill/knowledge/pure-utils.md`.
  - `cx` reads the keys of an object argument with `for…in`, like clsx.
  - The scoper's `trim()` also removes a no-break space at the end of a selector, which only makes it more lenient than the browser.
