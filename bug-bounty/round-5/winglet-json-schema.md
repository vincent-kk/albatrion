# @winglet/json-schema: bug bounty round 5

1 new finding in `@winglet/json-schema`, low. Items in the documents of [round 1](../round-1/winglet-json-schema.md), [round 2](../round-2/winglet-json-schema.md), [round 3](../round-3/winglet-json-schema.md) and [round 4](../round-4/winglet-json-schema.md) were treated as fixed and excluded, together with the decisions and known limits of each round's `FIXES.md`. The main session re-ran every probe: the `r5-winglet-data` folder ran 3 tests, of which 2 fail. The item is not a regression or a watch-list repeat.

Probes: [probes/winglet-json-schema/](probes/winglet-json-schema/)

- Copy a folder back to `packages/winglet/json-schema/src/__bounty__/<hunter-id>/` and run `yarn workspace @winglet/json-schema test --run src/__bounty__/<hunter-id>/`. The probe imports the package source through the `@/json-schema` alias.
- Every failing test belongs to the item below; the control passes.
- Earlier probes re-run (`r5-rerun-others`): round 1 ran 12 tests (0 fail), round 2 30 (0 fail), round 3 80 (4 fail); the earlier release probes `r3-contracts` ran 3 and `r4-contracts` 2, and all pass. The round 3 failures are listed roles: F1d now throws `duplicate-identifier` because the round 3 item 1 fix works, and B2, E2 and E3 are listed diagnostics. No earlier item regressed.

Root-cause files: `packages/winglet/json-schema/src/utils/JSONSchemaScanner/utils/dialectFlag/`

## 1. A `$schema` URI that spells the default port (`http://json-schema.org:80/…`, `https://json-schema.org:443/…`) is not recognized as a dialect, so the scanner falls back to 2020-12.

- Severity: low; such spellings are rare. A draft-04 schema declared with an explicit default port is scanned under the wrong dialect, so draft-04 `contains` is treated as active.
- Affected public API: `JSONSchemaScanner`, `JSONSchemaScannerAsync` and the `dialects` option of the resolvers.
- Contract violated: `docs/en/SPECIFICATION.md:186` (supported HTTP and HTTPS spellings are normalized) and `:68` (`resources` keys are matched after the same normalization references receive); [RFC 3986 section 6.2.3](https://www.rfc-editor.org/rfc/rfc3986#section-6.2.3), which treats a default port as equivalent to no port. `$ref` and `resources` keys in this package already normalize default ports.
- Root cause: `normalizeSchemaUri.ts:6-22` normalizes the case of the scheme and host and maps `https:` to `http:`, but keeps the port; `detectDialect` then looks the result up by exact string.
- Relation to earlier rounds: it confirms the open lead of [round 4](../round-4/winglet-json-schema.md) and is a sibling of round 3 item 3.
- Reopens an earlier fix: round 3 item 3, commit `71e2d857e`, which fixed letter case and left ports out.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-winglet-data/dialectSpelling.r5.test.ts`: the `:80` and `:443` tests give `[]`, expected `['#/contains']`.
- Confidence: high for the behavior; the input is unlikely.

## Hypotheses checked and not bugs

- The asynchronous reference resolver coalesces requests and drops a rejected request, so a later resolve retries the load (static reading of `createReferenceResolverAsync.ts`).
- The published declarations and runtime entries pass the release matrix described in [canard-schema-form.md](canard-schema-form.md).
