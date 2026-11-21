# @winglet/style-utils: bug bounty round 6

1 new finding in `@winglet/style-utils`, medium. Items in the documents of [round 1](../round-1/winglet-style-utils.md), [round 2](../round-2/winglet-style-utils.md), [round 3](../round-3/winglet-style-utils.md), [round 4](../round-4/winglet-style-utils.md) and [round 5](../round-5/winglet-style-utils.md) are treated as fixed and excluded, together with their decisions and known limits. The main session re-runs every probe: `r6-style-react-modal` runs 3 browser tests, of which 1 fails, and 7 jsdom tests, of which 4 fail. The cross-package release folder hosted in common-utils runs 56 passing tests and includes this package's runtime and declaration surfaces. Item 1 confirms the round 3 open lead; it is neither a regression nor a watch-list repeat.

Probes: [probes/winglet-style-utils/](probes/winglet-style-utils/)

- Copy a folder back to `packages/winglet/style-utils/src/__bounty__/<hunter-id>/`. For the browser probes, run `yarn workspace @winglet/style-utils test --run --config src/__bounty__/r6-style-react-modal/vitest.browser.config.ts src/__bounty__/r6-style-react-modal/realCss.browser.test.ts`. For jsdom, run `yarn workspace @winglet/style-utils test --run --config src/__bounty__/r6-style-react-modal/vitest.config.ts src/__bounty__/r6-style-react-modal/`. The browser configuration imports source directly and uses native Chromium; only animation-frame scheduling uses a manually drained queue.
- Four jsdom failures in `valueQueries.test.ts` are not findings: Q1 and Q3 are rejected empty style-query text-preservation hypotheses; Q4 with `shadow=false` and `shadow=true` diagnoses that same textual difference. Compression changes `style(--theme: )` to `style(--theme:)`, but native B2 confirms equivalent supported evaluation and red computed color. B0 same-document injection/destruction, B2 conditional evaluation, E1 token-stream comparisons and E2 isolated fragment joins pass.
- The main session's earlier-probe re-run for this package records 94 tests and 6 failures under the default configurations, including the round 4 folders, without an original fixed-input regression. Style failures represent documented destroyed-injector/deep-nesting limits, byte-order-mark diagnostics and J3's rejected raw-output expectation (`../round-5/FIXES.md:529`); the following rule remains intact. Copy the retained new neighbor folder and run `yarn workspace @winglet/style-utils test --run src/__bounty__/r6-rerun-packages/` for signed-token controls. Release probes and their command are hosted in [common-utils](winglet-common-utils.md).

Root-cause files: `packages/winglet/style-utils/src/styleManager/StyleManager/StyleManager.ts`

## 1. Injecting into a same-origin iframe's ShadowRoot throws once and leaves subsequent style updates unapplied.

- Severity: medium. A parent-loaded manager leaves a supported embedded ShadowRoot unstyled after a native asynchronous exception, and later valid updates silently remain unapplied.
- Affected public API: `styleManagerFactory(scopeId, { shadowRoot })`, from the root and style-manager entry.
- Contract violated: `packages/winglet/style-utils/docs/en/SPECIFICATION.md:11` promises Document or ShadowRoot injection; `:117` describes adopted sheets and the legacy style-element path; `:188` accepts a ShadowRoot without a same-document restriction.
- Root cause: `packages/winglet/style-utils/src/styleManager/StyleManager/StyleManager.ts:314` constructs a sheet with the importing realm's global `CSSStyleSheet`. Adoption at `:321` targets another document and lies outside the `try` at `:323`. Chromium rejects it with `NotAllowedError`, but `__sheet__` remains populated, so subsequent additions skip adoption and only update the unadopted sheet.
- Relation to earlier rounds: confirms the open lead in [round 3 style-utils](../round-3/winglet-style-utils.md), Open leads at line 197, which has no finding item number. This is a cross-realm ownership and failure-recovery case, rather than compression or selector scoping.
- Reopens an earlier fix: no. The relevant allocation/adoption predates the bounty fixes.
- Regression of an earlier fix: no. The unconfirmed input already uses the wrong constructor before those fixes.
- Watch list: no.
- Reproduction: `r6-style-react-modal/realCss.browser.test.ts`, "B1 a shadow root in another document receives a constructable sheet like this document". In an actual same-origin iframe, the first scheduled injection throws and the second returns without applying styles. Actual after both is `{ error: 'NotAllowedError', sheets: 0 }`, expected `{ error: undefined, sheets: 1 }`. B0 passes for a same-document ShadowRoot, including destruction.
- Confidence: high; public source API in real Chromium, with native sheet construction and cross-document adoption.

## Hypotheses checked and not bugs

- E1 compares significant token streams for 252 deterministic declaration, selector and grouping combinations, including declaration-value signs, escaped delimiters, nested rules, custom component values, namespaces and attributes. It is not a complete semantic oracle.
- E2 preserves isolated syntax trees in 18 raw/compressed fragment joins across truncated nested structures, strings, comments, dangling selectors and stylesheet comment markers.
- B2 rejects the Q1/Q3/Q4 textual hypothesis through native conditional-value evaluation; supported status and computed red color remain the same.
- Reusing a destroyed injector or its cleanup after `destroyScope` remains explicitly outside the contract.
- Signed decimal and exponent boundaries and current compression/fragment reference models pass retained regression checks. Current built runtime surfaces and supported strict declaration consumers also pass the cross-package release checks.
