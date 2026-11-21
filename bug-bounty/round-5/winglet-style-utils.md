# @winglet/style-utils: bug bounty round 5

4 new findings in `@winglet/style-utils`: 1 medium and 3 low. Items in the documents of [round 1](../round-1/winglet-style-utils.md), [round 2](../round-2/winglet-style-utils.md), [round 3](../round-3/winglet-style-utils.md) and [round 4](../round-4/winglet-style-utils.md) were treated as fixed and excluded, together with the decisions and known limits of each round's `FIXES.md`. The main session re-ran every probe: the `r5-style-react-modal` folder ran 19 tests, of which 10 fail, and the `r5-rerun-others` folder ran 4 tests, of which 3 fail. Item 1 is a regression of a round 4 fix; items 1 to 3 repeat the watch-list point on `compressCss` and the scoper.

Probes: [probes/winglet-style-utils/](probes/winglet-style-utils/)

- Copy a folder back to `packages/winglet/style-utils/src/__bounty__/<hunter-id>/` and run `yarn workspace @winglet/style-utils test --run src/__bounty__/<hunter-id>/`. `r5-style-react-modal` holds `cssSyntax.ts`, a CSS Syntax Level 3 reader built on `@csstools/css-tokenizer` 3.0.4 and `@csstools/css-parser-algorithms` 3.0.5, `generate.ts`, `r4Oracle.ts` (a copy of the round 4 oracle) and three passing exploration files (`explore.test.ts`, `joinFuzz.explore.test.ts`, `scoperFuzz.explore.test.ts`).
- Every failing test belongs to an item below; the controls `J0`, `J0b`, `J0c` and `C0` pass. No result was checked in a real browser.
- Earlier probes re-run (`r5-rerun-others`): round 1 ran 5 tests (0 fail), round 2 10 (2 fail), round 3 37 (4 fail), round 4 15 (0 fail); the earlier release probes `r3-contracts` ran 1 (1 fail) and `r4-contracts` 2 (0 fail). Every failure has a recorded role: the round 2 item 1 decision on `destroyScope` without `{ shadowRoot }`, the round 2 item 2 injector known limit pinned by `it.fails`, listed round 3 diagnostics (three BOM cases and deep nesting), and a round 3 item 8 assertion of text that the documentation fix changed. No earlier item regressed.

Root-cause files: `packages/winglet/style-utils/src/`

## 1. A nested statement at-rule that ends its block makes the join add a top-level `;`, so the first rule of the next identifier disappears.

- Severity: medium. Valid CSS with default compression silently loses another identifier's rule, in document and shadow-root modes. It needs a nested statement at-rule last in its block, such as `@layer theme { @layer light, dark; }`, a later rule or opaque character in the same identifier, and two identifiers in the scope.
- Affected public API: `styleManagerFactory(scopeId)` and `styleManagerFactory(scopeId, { shadowRoot })` with two or more identifiers.
- Contract violated: `src/styleManager/StyleManager/DETAIL.md:11` and `:26` (each fragment's end is closed by CSS Syntax rules before joining, and a semicolon only keeps the boundary); `docs/agents/skills/style-utils-skill/knowledge/style-manager.md:155` (identifiers are replaced and removed independently); [CSS Syntax Level 3, consume an at-rule](https://www.w3.org/TR/css-syntax-3/#consume-at-rule) (a `}` ends a nested at-rule); predictability: separate sheets keep `.btn`, and a following block rule keeps it (control `J0`).
- Root cause: `src/utils/cssTokens/closeCssFragment.ts:24` records `atDepth` for a nested at-keyword; `:27` and `:30` clear it only for `{` or `;` at the same depth, and `:29` pops the enclosing block without clearing it; `:40-42` then compute a negative count and emit a bare top-level `;`. `StyleManager.ts:319` and `:325` join `…;\n<next>`, which the browser reads as one invalid prelude together with the next rule.
- Relation to earlier rounds: round 4 item 1 and round 3 item 2; round 3 class 22 and round 4 class 38.
- Reopens an earlier fix: round 4 item 1, commit `a7941b594`, which created `closeCssFragment.ts`.
- Regression of an earlier fix: yes, case (b): round 4 `@winglet/style-utils` item 1, commit `a7941b594`. The main session read the previous `terminateStatement.ts` (`git show a7941b594^:…`): it returned a fragment ending in `}` or `;` unchanged, so `.btn` survived this input.
- Watch list: yes, `compressCss` and the scoper.
- Reproduction: `r5-style-react-modal/joinClosure.r5.test.ts`, describe "a nested statement at-rule that ends its block": `J1` (shadow root, default compression: `@layer theme{@layer light,dark}.card{color:red};\n.btn{color:blue}`, the last rule read is `; .btn`), `J2` (document, default compression) and `J3` (shadow root, compression skipped, nested statement written without `;`) fail; the control `J0` passes.
- Confidence: high; public API with a CSS Syntax reader as oracle.

## 2. In shadow-root mode, an identifier whose CSS ends inside a top-level rule prelude swallows the first rule of the next identifier.

- Severity: low. It needs a typo such as `.a { … };`, an extra `}` or a dangling selector, but the damage spreads silently to another identifier; `.card:is(.open` even produces the valid but wrong selector `.card:is(.open) .btn`.
- Affected public API: `styleManagerFactory(scopeId, { shadowRoot })` with two or more identifiers.
- Contract violated: `src/styleManager/StyleManager/DETAIL.md:11`; [CSS Syntax Level 3, consume a qualified rule](https://www.w3.org/TR/css-syntax-3/#consume-qualified-rule); `knowledge/style-manager.md:155`; predictability against document mode, which drops these inputs (control `J0b`).
- Root cause: `closeCssFragment.ts:40-44` has no closure for an open top-level qualified-rule prelude, and `:29` ignores a stray top-level `}`; the scoper, which drops these in document mode, does not run for a shadow root (`StyleManager.ts:292`).
- Relation to earlier rounds: item 1; round 4 class 38.
- Reopens an earlier fix: round 4 item 1 (`a7941b594`); its own input still passes.
- Regression of an earlier fix: no.
- Watch list: yes, `compressCss` and the scoper.
- Reproduction: `r5-style-react-modal/joinClosure.r5.test.ts`, describe "a shadow root identifier that ends inside a top-level rule prelude": `J4` (a stray `;` after the last rule gives `; .btn`), `J5` (an extra `}` gives `} .btn`) and `J6` (an unfinished selector gives `.card:is(.open) .btn`) fail; the controls `J0b` and `J0c` pass. A fuzz of 3,000 identifier pairs found 388 failures of this class and no class other than items 1 and 2.
- Confidence: high for the behavior; medium for the severity.

## 3. `compressCss` merges `+` with a following number outside parentheses, so a custom property such as `--gap: 8px + 4px` becomes `8px+4px`, and a later `calc(var(--gap))` is invalid.

- Severity: low. The declaration that uses the variable is dropped by the browser; the input is a custom property holding a partial expression.
- Affected public API: `compressCss` (the package root and `./util`) and `styleManagerFactory` with default compression, on both the general and the fast path.
- Contract violated: `docs/agents/skills/style-utils-skill/knowledge/pure-utils.md:25` and `:60`; `src/utils/compressCss/DETAIL.md:16` (a comment is kept where removing it would merge a sign token, and removing whitespace at the same place merges it just the same); `src/utils/compressCss/INTENT.md:26-27`; the round 3 decision that the output keeps the tokens the browser reads. The documents conflict: `pure-utils.md:72` and `compressCss/DETAIL.md:21` say that `+` outside parentheses is the sibling combinator and loses its spaces.
- Root cause: `src/utils/compressCss/compressCss.ts:86` keeps spaces next to `+` only inside parentheses (`keep = parentheses > 0`), and `src/utils/compressCss/utils/compressFlatCss.ts:35` drops whitespace next to `+`; neither checks for a following number, dimension or percentage, while `canDropCssComment` keeps `/**/` at the same place.
- Relation to earlier rounds: round 1 item 3; round 3 class 28 and round 4 class 38.
- Reopens an earlier fix: round 1 item 3 (`e0382d335`); `calc(1px + 2px)` still passes (control `C0`).
- Regression of an earlier fix: no.
- Watch list: yes, `compressCss` and the scoper.
- Reproduction: `r5-style-react-modal/compressSigns.r5.test.ts`: `C1` (`.a{--gap:8px+4px;width:calc(var(--gap))}` reads as the tokens `dim 8px` and `dim +4px`), `C2` (the fast path, `.a{--total:1+.5}`), `C3` (whitespace and a comment give different token streams) and `C4` (the scoped style holds `--gap:8px+4px`) fail.
- Confidence: high for the behavior; medium for the classification, because the documents conflict.

## 4. The Korean README's `destroyScope` reference omits `{ shadowRoot }` and the rule to throw away the old injector.

- Severity: low (a misleading translation). A Korean reader calls `destroyScope(id)` on a shadow-root scope, which releases only the document scope, and reuses a destroyed injector. The Korean Shadow DOM example at `README-ko_kr.md:319` shows the correct call.
- Affected public API: `destroyScope` and `styleManagerFactory` (the package root and the `style-manager` subpath).
- Contract violated: `README.md:523`, `:525` and `:527`; `src/styleManager/destroyScope.ts:27-30`; `DOCUMENTATION.md` principle 4 (a translation changes with its source).
- Root cause: `README-ko_kr.md:521-545` documents `destroyScope(scopeId: string): void` and says it removes every related style; the fixes `3fde341db` (round 2 item 1) and `a62a28ddd` (round 2 item 2) changed `README.md` only, and `af20c1139` (round 4 item 4) fixed the Korean examples but not this section.
- Relation to earlier rounds: round 4 item 4; round 4 class 39 and round 3 class 21.
- Reopens an earlier fix: no; `git log -L 521,523` shows only `359099405`.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-rerun-others/koreanDestroyScope.test.ts`: the heading, `shadowRoot` mention and injector-rule tests fail; the English control passes.
- Confidence: high; static.

## Hypotheses checked and not bugs

- `RuleScoper` matches the round 4 reference scoper on 4,000 seeded sheets, and `compressCss` keeps the token stream of every scoped output; `compressCss` keeps the tokens of 4,000 sheets (30 percent truncated) once `+` before a number is excluded, and the fast and general paths agree.
- Open strings, trailing escapes, comments, `url()`, brackets, blocks and top-level at-rule preludes close correctly in the shadow join; document mode drops item 2's inputs.
- `add(id, '')` keeping the previous rules is documented (`knowledge/style-manager.md:156`); an escaped at-rule name is copied unscoped (an implausible input, static).
- `docs/ko/SPECIFICATION.md:206-220` and the Korean site index pages are current; only `README-ko_kr.md` lags.
- The round 3 open lead (a shadow root in another document) still needs a real browser.
